const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
(async()=>{
 fs.mkdirSync('qa',{recursive:true});
 const b=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox']}),p=await b.newPage({isMobile:true,hasTouch:true,viewport:{width:390,height:844}}),checks=[],measurements=[],errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 // Stable layout and real pointer events without a progressing combat simulation.
 await p.addInitScript(()=>window.requestAnimationFrame=()=>0);
 await p.goto('file://'+path.join(__dirname,'app/src/main/assets/index.html')+'?test=1');await p.waitForFunction(()=>window.GameTest&&RiftArt.ready);
 await p.evaluate(()=>{const t=GameTest;t.closeDaily();t.profile.sound=false;t.newRun();t.player.pet=t.PETS[0].id;t.player.petLevel=10;for(const s of t.START_SKILLS)t.player[s.id]=3;t.player.shield=25;t.state.buffs={power:30,haste:30};t.state.wave=5;t.spawn(t.bossKind());t.state.bossSpawned=true;t.update(.15);});
 for(const [width,height]of [[320,568],[360,640],[390,844],[412,915],[844,390]]){
  await p.setViewportSize({width,height});
  const m=await p.evaluate(()=>{const $=s=>document.querySelector(s),rect=s=>{const r=$(s).getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}},hud=rect('#hud'),ribbon=rect('#hudRibbon');return{hud,ribbon,count:$('#skillRibbon').children.length,scroll:$('#hudRibbon').scrollWidth>$('#hudRibbon').clientWidth,overflow:document.documentElement.scrollWidth>innerWidth,controls:['#classSkillBtn','#dashBtn','#classSkillInfo','#minimap'].map(rect)}});
  assert.equal(m.overflow,false);assert.ok(m.hud.h<=160,'HUD fits with all skills and three buffs');assert.equal(m.ribbon.h,44);assert.ok(m.count>=11&&m.scroll);checks.push(`Full loadout stays in one 44px row at ${width}x${height}`);
  const rects=m.controls;for(const r of rects)assert.ok(r.x>=0&&r.y>=0&&r.x+r.w<=width&&r.y+r.h<=height);
  for(let i=0;i<rects.length;i++)for(let j=i+1;j<rects.length;j++){const a=rects[i],c=rects[j];assert.ok(a.x+a.w<=c.x||c.x+c.w<=a.x||a.y+a.h<=c.y||c.y+c.h<=a.y,'Bottom controls do not overlap')}
  checks.push(`Controls fit without overlap at ${width}x${height}`);
  await p.locator('#hudInfoBtn').tap();assert.equal(await p.evaluate(()=>GameTest.mode),'pause');assert.match(await p.locator('#infoBody').textContent(),/Ostromerő/);await p.locator('#infoClose').tap();assert.equal(await p.evaluate(()=>GameTest.mode),'run');checks.push(`Details pause and resume at ${width}x${height}`);
  await p.evaluate(()=>GameTest.update(.15));measurements.push({width,height,hudHeight:m.hud.h});await p.screenshot({path:`qa/compact-hud-${width}.png`});
 }
 await p.setViewportSize({width:390,height:844});
 const buttons=p.locator('#skillRibbon button');for(let i=0;i<await buttons.count();i++){await buttons.nth(i).scrollIntoViewIfNeeded();await buttons.nth(i).tap();assert.equal(await p.locator('#infoLayer').isVisible(),true);assert.equal(await p.evaluate(()=>GameTest.mode),'pause');await p.locator('#infoClose').tap();assert.equal(await p.evaluate(()=>GameTest.mode),'run');}
 checks.push('Every compact skill and pet opens its description without activation');
 for(const cls of ['warrior','mage','ranger','necromancer']){await p.evaluate(cls=>{const t=GameTest;t.profile.equippedClass=cls;t.newRun();t.player.classSkillCD=0;t.update(.15)},cls);await p.locator('#classSkillBtn').tap();assert.ok(await p.evaluate(()=>GameTest.player.classSkillCD>0));}checks.push('Four class abilities still activate by touch');
 await p.evaluate(()=>{GameTest.state.buffs={power:20,haste:20};GameTest.update(.15)});await p.locator('#buffRibbon button').first().tap();assert.equal(await p.locator('#infoLayer').isVisible(),true);await p.locator('#infoClose').tap();checks.push('Compact buff still opens precise description');
 await p.evaluate(()=>{const t=GameTest;Object.assign(t.player,{x:t.state.objective.x,y:t.state.objective.y});t.update(.15)});await p.locator('#objectiveBtn').tap();assert.equal(await p.locator('#expansionLayer').isVisible(),true);await p.getByRole('button',{name:'MOST NEM',exact:true}).tap();checks.push('Compact objective button opens nearby mission');
 assert.deepEqual(errors,[]);checks.push('No JavaScript errors');
 fs.writeFileSync('test-hud-results.json',JSON.stringify({passed:checks.length,checks,measurements,errors},null,2));console.log(JSON.stringify({passed:checks.length,measurements}));await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
