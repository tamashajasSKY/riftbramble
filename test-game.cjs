const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const browserPath=process.env.CHROME_PATH;
fs.mkdirSync(path.join(__dirname,'qa'),{recursive:true});
(async()=>{
const assets=path.join(__dirname,'app/src/main/assets');
const server=http.createServer((req,res)=>{const p=path.join(assets,new URL(req.url,'http://localhost').pathname==='/'?'index.html':new URL(req.url,'http://localhost').pathname);try{res.setHeader('Content-Type',p.endsWith('.js')?'application/javascript':p.endsWith('.css')?'text/css':p.endsWith('.png')?'image/png':p.endsWith('.wav')?'audio/wav':'text/html');res.end(fs.readFileSync(p))}catch(e){res.statusCode=404;res.end('not found')}});
await new Promise(r=>server.listen(8765,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:browserPath,headless:true,args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
const page=await context.newPage(),errors=[],results=[],requests=[];
page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
const check=(name,value)=>{assert.ok(value,name);results.push({name,result:'PASS'})};
await page.goto('http://127.0.0.1:8765/?test=1');await page.waitForFunction(()=>window.GameTest&&document.querySelector('#startBtn'));await page.evaluate(()=>GameTest.closeDaily());
await page.screenshot({path:'qa/Forintvedo-menu.png'});
check('Menu visible',await page.locator('#menu').isVisible());
await page.locator('#startBtn').click();
check('Run starts',await page.evaluate(()=>GameTest.mode==='run'&&GameTest.player.hp===100&&GameTest.state.wave===1));
// Freeze the actual rAF simulation between evaluations via pause/resume where needed.
let moved=await page.evaluate(()=>{const p=GameTest.player;const x=p.x;dispatchEvent(new KeyboardEvent('keydown',{key:'d'}));GameTest.step(.5);dispatchEvent(new KeyboardEvent('keyup',{key:'d'}));return p.x>x+60});check('Movement works',moved);
check('Dash grants invulnerability and cooldown',await page.evaluate(()=>{GameTest.dash();return GameTest.player.dashCD>3.9&&GameTest.player.dashTime>0&&GameTest.player.invuln>0}));
check('Armor reduces incoming damage',await page.evaluate(()=>{let p=GameTest.player;p.dashTime=0;p.invuln=0;p.armor=.5;const before=p.hp;GameTest.hurt(20);return Math.abs(before-p.hp-10)<.001}));
check('Invulnerability blocks repeated damage',await page.evaluate(()=>{const h=GameTest.player.hp;GameTest.hurt(20);return GameTest.player.hp===h}));
check('Harder enemies drop more money',await page.evaluate(()=>{const s=GameTest.state;s.enemies=[];const p=GameTest.player;GameTest.spawn(0);GameTest.spawn(3);const [a,b]=s.enemies;a.wake=b.wake=0;GameTest.hitEnemy(a,1e6);GameTest.hitEnemy(b,1e6);return s.coinsOnFloor[1].v>s.coinsOnFloor[0].v}));
check('Automatic projectiles hit and kill a target',await page.evaluate(()=>{const s=GameTest.state,p=GameTest.player;s.enemies=[];s.coinsOnFloor=[];s.spawnLeft=100;s.spawnClock=1000;GameTest.spawn(0);const e=s.enemies[0];e.x=p.x+90;e.y=p.y;e.wake=0;e.hp=8;e.maxhp=8;p.shotTimer=0;p.dashTime=0;const before=s.kills;GameTest.step(.8);return s.kills>before}));
check('Coins are collected and credited',await page.evaluate(()=>{const s=GameTest.state,p=GameTest.player;const before=s.coins;s.coinsOnFloor.push({x:p.x,y:p.y,v:17,t:0});GameTest.step(.03);return s.coins>=before+17}));
check('Wave rewards bank all remaining drops and open three unique upgrades',await page.evaluate(()=>{const s=GameTest.state,p=GameTest.player;s.spawnLeft=0;s.enemies=[];s.coinsOnFloor=[{x:10,y:10,v:8,t:0}];const before=s.coins;p.hp=50;GameTest.step(.02);return GameTest.mode==='upgrade'&&s.coins===before+8&&s.cleared===1&&p.hp>=60&&document.querySelectorAll('.card').length===3&&new Set([...document.querySelectorAll('.card')].map(c=>c.dataset.upgrade)).size===3}));
await page.screenshot({path:'qa/Forintvedo-upgrades.png'});
check('Reroll spends exact advertised price',await page.evaluate(()=>{GameTest.state.coins=100;GameTest.renderChoices();document.querySelector('#rerollBtn').click();return GameTest.state.coins===85&&document.querySelectorAll('.card').length===3}));
check('Healing purchase costs coins and restores health',await page.evaluate(()=>{GameTest.player.hp=20;const before=GameTest.state.coins;document.querySelector('#healBtn').click();return GameTest.state.coins===before-22&&GameTest.player.hp===55}));
check('Choosing an upgrade begins the next wave',await page.evaluate(()=>{document.querySelector('.card').click();return GameTest.mode==='run'&&GameTest.state.wave===2&&GameTest.player.upgrades===1}));
check('Pause freezes combat',await page.evaluate(()=>{GameTest.pause();const t=GameTest.state.runTime;GameTest.step(3);return GameTest.mode==='pause'&&t===GameTest.state.runTime}));
check('Snapshot preserves coins, health, wave',await page.evaluate(()=>{const s=GameTest.state,p=GameTest.player;s.coins=123;p.hp=42;GameTest.saveRun();const saved=JSON.parse(localStorage.getItem('forintvedo.run.v1'));return saved.S.wave===2&&saved.S.coins===123&&saved.P.hp===42}));
// Real reload persistence in its own roundtrip.
await page.evaluate(()=>{GameTest.state.wave=7;GameTest.state.coins=321;GameTest.player.hp=47;GameTest.pause();GameTest.saveRun()});
await page.reload();await page.waitForFunction(()=>window.GameTest);await page.evaluate(()=>GameTest.closeDaily());await page.locator('#continueBtn').click();
check('Reload restores a paused run',await page.evaluate(()=>GameTest.mode==='pause'&&GameTest.state.wave===7&&GameTest.state.coins===321&&GameTest.player.hp===47));
check('Fifth wave spawns a boss',await page.evaluate(()=>{GameTest.resume();const s=GameTest.state;s.wave=5;s.waveTime=2.1;s.bossSpawned=false;GameTest.step(.02);return s.bossSpawned&&s.enemies.some(e=>e.kind===6)}));
check('Boss fires ten telegraphed projectiles',await page.evaluate(()=>{const s=GameTest.state,e=s.enemies.find(e=>e.kind===6);s.enemies=[e];e.x=GameTest.player.x+200;e.y=GameTest.player.y;e.wake=0;e.telegraph=.01;e.tx=GameTest.player.x;e.ty=GameTest.player.y;s.enemyBullets=[];GameTest.step(.02);return s.enemyBullets.length===10}));
check('All upgrade effects change player stats safely',await page.evaluate(()=>{for(const u of GameTest.upgrades){if(u.ok&&!u.ok())continue;let before=JSON.stringify(GameTest.player);u.apply();if(before===JSON.stringify(GameTest.player))return false}return Object.values(GameTest.player).every(v=>typeof v!=='number'||Number.isFinite(v))}));
check('Endless waves continue beyond wave 100',await page.evaluate(()=>{const s=GameTest.state;s.wave=101;s.spawnLeft=0;s.enemies=[];s.bossSpawned=true;GameTest.step(.02);const card=document.querySelector('.card');if(!card)return false;card.click();return s.wave===102&&s.spawnLeft>300&&GameTest.mode==='run'}));
check('Death pays the vault exactly once',await page.evaluate(()=>{const s=GameTest.state,profile=GameTest.profile;s.coins=200;const b=profile.bank;GameTest.finish();GameTest.finish();return profile.bank===b+200&&GameTest.mode==='over'&&!localStorage.getItem('forintvedo.run.v1')}));
await page.locator('#backMenuBtn').click();await page.locator('#workshopBtn').click();
check('Permanent talent buys persist',await page.evaluate(()=>{let p=GameTest.profile,b=p.pearls,gold=p.bank,lv=p.talents.vitality;document.querySelector('.talent button').click();return p.pearls===b-4&&p.bank===gold&&p.talents.vitality===lv+1&&JSON.parse(localStorage.getItem('forintvedo.profile.v1')).talents.vitality===lv+1}));
await page.locator('#workshopBackBtn').click();await page.locator('#startBtn').click();
check('New run inherits permanent health',await page.evaluate(()=>GameTest.player.maxhp===110));
// Multi-touch style joystick pointer events + second pointer dash.
const cdp=await context.newCDPSession(page),beforeY=await page.evaluate(()=>GameTest.player.y);
await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:80,y:600,id:1}]});
await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:80,y:540,id:1}]});
await page.waitForTimeout(200);
await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:80,y:540,id:1},{x:330,y:780,id:2}]});
check('Touch joystick and simultaneous dash',await page.evaluate(y=>GameTest.player.y<y&&GameTest.player.dashCD>3.5,beforeY));
await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
// Create a representative combat scene for visual QA.
await page.evaluate(()=>{const s=GameTest.state,p=GameTest.player;s.wave=8;s.spawnClock=100;p.hp=83;p.shots=3;p.blade=2;p.lightning=1;s.enemies=[];for(let i=0;i<13;i++){GameTest.spawn(i%6);let e=s.enemies.at(-1),a=i/13*Math.PI*2;e.x=p.x+Math.cos(a)*(100+i*9);e.y=p.y+Math.sin(a)*(120+i*8);e.wake=0}for(let i=0;i<6;i++)s.coinsOnFloor.push({x:p.x-80+i*30,y:p.y+80,v:3,t:0});});
await page.evaluate(()=>document.querySelector('#banner').hidden=true);
await page.waitForTimeout(700);await page.screenshot({path:'qa/Forintvedo-gameplay.png'});
// Real phone sizes. Check actionable overlays remain accessible without horizontal overflow.
for(const size of [{width:360,height:640},{width:412,height:915},{width:320,height:568}]){
 await page.setViewportSize(size);await page.evaluate(()=>{if(GameTest.mode==='run')GameTest.pause()});
 check(`Pause layout ${size.width}x${size.height}`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.querySelector('#resumeBtn').getBoundingClientRect().right<=innerWidth));
}
check('No external runtime network requests',requests.every(u=>u.startsWith('http://127.0.0.1:8765/')));
check('No game JavaScript errors',errors.length===0);
const report={date:new Date().toISOString(),engine:await browser.version(),passed:results.length,results,errors,externalRequests:requests.filter(u=>!u.startsWith('http://127.0.0.1:8765/'))};
fs.writeFileSync('test-results.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close();server.close();
})().catch(e=>{console.error(e);process.exit(1)});
