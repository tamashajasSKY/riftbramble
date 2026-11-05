/* Forintvédő 1.3.0 · offline canvas game · no network dependencies */
(()=>{'use strict';
const $=id=>document.getElementById(id), canvas=$('game'), ctx=canvas.getContext('2d',{alpha:false});
const atlas=new Image();atlas.src='art/dungeon.png';const dragonArt=new Image();dragonArt.src='art/dragon.png';
const STORE='forintvedo.profile.v1', SAVE='forintvedo.run.v1', WORLD=1800, TAU=Math.PI*2;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), rand=(a,b)=>a+Math.random()*(b-a), dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const clock=t=>`${Math.floor(t/60).toString().padStart(2,'0')}:${Math.floor(t%60).toString().padStart(2,'0')}`;
const format=n=>Math.floor(n).toLocaleString('hu-HU');
const C={mint:'#92e6b8',gold:'#edc66e',red:'#f5827a',ink:'#f6f0df',purple:'#c7a1ef',pearl:'#b2dcff'};
function defaultSpace(){return{skins:['blue'],equippedSkin:'blue',talents:{cannon:0,hull:0,engine:0,reactor:0,yield:0},bestScore:0,bestSector:0}}
let profile={version:4,equippedClass:'mage',daily:{lastDay:null,step:0,total:0},space:defaultSpace(),settledRuns:[],bank:0,pearls:3,best:0,sound:true,talents:{vitality:0,power:0,magnet:0,ward:0,fortune:0,focus:0},runs:0,skins:['mage'],pets:['spark'],skills:['nova','blade','lightning'],equippedSkin:'mage',equippedPet:'spark',equippedSkill:'nova',petRanks:{spark:0,ember:0,spirit:0},lastSettled:null};
try{const x=JSON.parse(localStorage.getItem(STORE));if(x&&Number.isFinite(x.bank)&&x.talents)profile={...profile,...x,talents:{...profile.talents,...x.talents},petRanks:{...profile.petRanks,...x.petRanks}}}catch(e){}
profile.version=4;profile.daily={lastDay:null,step:0,total:0,...profile.daily};profile.space={...defaultSpace(),...profile.space,talents:{...defaultSpace().talents,...profile.space?.talents}};profile.settledRuns=profile.settledRuns||[];if(profile.lastSettled&&!profile.settledRuns.includes(profile.lastSettled))profile.settledRuns.push(profile.lastSettled);if(!profile.skins.includes('class'))profile.skins.push('class');
let W=390,H=844,DPR=1,scale=1,camera={x:900,y:900},P=null,S=null,mode='menu',pausedFrom='run',last=0,visualTime=0,shake=0,flash=0,hudTimer=0;
let particles=[],texts=[],effects=[],input={id:null,x:0,y:0,baseX:0,baseY:0,dx:0,dy:0},keys={},choices=[],toastTimer;
let audio=null,audioGain=null,nextAmbient=0,musicUnlocked=false;const dungeonMusic=new Audio('audio/ostrom.wav'),spaceMusic=new Audio('audio/space.wav');let music=dungeonMusic;for(const track of [dungeonMusic,spaceMusic]){track.loop=true;track.volume=.23;track.preload='auto'}
const screens=['menu','upgrade','pause','over','workshop','help','collection','characters','spaceLobby','news','account'];
const names=['AZ OSTROM KEZDETE','A MÉLYBŐL ÉRKEZNEK','CSÖRGŐ CSONTOK','NINCS VISSZAÚT','A KINCSTÁR ŐRE'];
function writeProfile(){try{localStorage.setItem(STORE,JSON.stringify(profile))}catch(e){toast('A mentés nem sikerült: nincs szabad tárhely.')}}
function toast(t){$('toast').textContent=t;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),2200)}
function show(next){const track=['space','spaceLobby'].includes(next)?spaceMusic:dungeonMusic;if(music!==track){music.pause();music=track}mode=next;for(const id of screens)$(id).hidden=id!==next;$('overlay').hidden=next==='run'||next==='space';$('spaceLayer').hidden=next!=='space';canvas.hidden=next==='space';$('minimap').hidden=next!=='run';$('hud').hidden=next!=='run';$('controls').hidden=next!=='run';$('banner').hidden=true;if(next!=='run'){texts=[];effects=[];particles=[]}clearInput();if(next==='menu')refreshMenu();else updateSound()}
function refreshMenu(){const reward=claimDaily();if(reward)openDaily(reward); $('bestWave').textContent=profile.best?String(profile.best).padStart(2,'0'):'—';$('bank').textContent=format(profile.pearls);let saved=false;try{saved=!!localStorage.getItem(SAVE)}catch(e){}$('continueBtn').hidden=!saved;$('startBtn').hidden=saved;renderLoadout();updateSound()}
function resize(){W=innerWidth;H=innerHeight;DPR=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);scale=clamp(W/390,.8,1.55);ctx.imageSmoothingEnabled=false}
addEventListener('resize',resize);resize();
function unlockAudio(){musicUnlocked=true;if(profile.sound&&mode!=='pause')music.play().catch(()=>{});try{if(!audio){audio=new (window.AudioContext||window.webkitAudioContext)();audioGain=audio.createGain();audioGain.gain.value=.16;audioGain.connect(audio.destination)}if(audio.state==='suspended')audio.resume().catch(()=>{})}catch(e){}}
function tone(freq,duration,type='sine',volume=.3,slide=0){if(!profile.sound||!audio||audio.state!=='running')return;try{const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime;o.type=type;o.frequency.setValueAtTime(freq,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(25,freq+slide),t+duration);g.gain.setValueAtTime(volume,t);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(audioGain);o.start(t);o.stop(t+duration+.01)}catch(e){}}
function sound(kind){if(kind==='shot')tone(640,.065,'triangle',.11,-240);if(kind==='coin')tone(1000,.09,'sine',.12,400);if(kind==='hurt')tone(150,.16,'sawtooth',.24,-80);if(kind==='dash')tone(220,.18,'triangle',.27,600);if(kind==='upgrade'){tone(523,.25,'sine',.3,130);setTimeout(()=>tone(784,.35,'sine',.25),90)}if(kind==='kill')tone(130,.07,'triangle',.10,-70);if(kind==='boss')tone(65,.8,'sawtooth',.2,35)}
function updateSound(){for(const id of ['soundBtn','pauseSoundBtn'])$(id).textContent='HANG: '+(profile.sound?'BE':'KI');if(audioGain)audioGain.gain.value=profile.sound?.16:0;if(!profile.sound||mode==='pause')music.pause();else if(musicUnlocked)music.play().catch(()=>{})}
function toggleSound(){unlockAudio();profile.sound=!profile.sound;updateSound();writeProfile();if(profile.sound)sound('coin')}
function clearInput(){input.id=null;input.dx=input.dy=0;keys={}}
function blankPlayer(){
 const p={x:900,y:900,hp:100+profile.talents.vitality*10,maxhp:100+profile.talents.vitality*10,speed:162,damage:17*(1+profile.talents.power*.07),interval:.48,armor:0,crit:.05,magnet:85+profile.talents.magnet*22,shots:1,pierce:0,regen:0,vamp:0,blade:0,lightning:0,shotTimer:0,lightTimer:1,invuln:1.7,dashCD:0,dashTime:0,dashX:1,dashY:0,lastX:0,lastY:1,facing:1,orbit:0,upgrades:0,skin:profile.equippedSkin,pet:profile.equippedPet,petLevel:1,petPower:1,petRate:1,petHalo:0,petX:860,petY:920,petTimer:.4,petBond:profile.petRanks[profile.equippedPet]||0,shield:profile.talents.ward*8,maxShield:profile.talents.ward*8,nova:0,frost:0,fire:0,meteor:0,explosive:0,areaSize:1,skillRate:1-profile.talents.focus*.03,pearlLuck:1+profile.talents.fortune*.15,novaTimer:1.6,frostTimer:2.2,fireTimer:1,meteorTimer:2,poison:0,sanctuary:0,iceSpear:0,poisonTimer:1,sanctuaryTimer:3,iceSpearTimer:1,classSkillLevel:1,classSkillCD:0};
 if(profile.skills.includes(profile.equippedSkill))p[profile.equippedSkill]=1;
 return applyClass(p);
}
function newRun(){unlockAudio();P=blankPlayer();S={version:4,rulesVersion:2,minions:[],id:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2),buffs:{power:0,haste:0},pickups:[],chests:[],enemyZones:[],buffTimer:rand(9,14),chestTimer:rand(17,25),rewardSource:'wave',pearls:0,pearlsOnFloor:[],areas:[],meteors:[],startBest:profile.best,wave:1,cleared:0,coins:0,earned:0,kills:0,runTime:0,waveTime:0,enemies:[],bullets:[],enemyBullets:[],coinsOnFloor:[],nextId:1,spawnLeft:0,spawnClock:1,total:0,waveKills:0,bossSpawned:false,settled:false};particles=[];texts=[];effects=[];camera={x:P.x,y:P.y};choices=[];nextAmbient=0;show('run');if(P.classId==='necromancer'){raiseMinion();raiseMinion()}beginWave();saveRun()}
function waveLabel(){return S.wave%5===0?kinds[bossKind()].name.toUpperCase():names[(S.wave-1)%4]}
function beginWave(){S.waveTime=0;S.waveKills=0;S.spawnLeft=dragonWave()?0:10+S.wave*3;S.total=dragonWave()?1:S.spawnLeft+(S.wave%5===0?1:0);S.spawnClock=.8;S.bossSpawned=false;S.rewardSource='wave';S.enemyZones=[];P.invuln=Math.max(P.invuln,1.2);announce(dragonWave()?'EGYETLEN ÓRIÁSI ELLENFÉL':S.wave%5===0?'FŐELLENFÉL ÉRKEZIK':`${String(S.wave).padStart(2,'0')}. HULLÁM`,waveLabel(),3);updateHUD()}
let bannerTime=0;
function announce(small,title,seconds){$('bannerSmall').textContent=small;$('bannerTitle').textContent=title;$('banner').hidden=false;bannerTime=seconds}
function saveRun(){if(!P||!S||S.settled||!['run','pause','upgrade'].includes(mode))return;try{localStorage.setItem(SAVE,JSON.stringify({version:4,P,S,mode:mode==='pause'?pausedFrom:mode,choices}));}catch(e){toast('A futam mentése nem sikerült.')}}
function restore(){try{
 const saved=JSON.parse(localStorage.getItem(SAVE));
 if(!saved||![1,2,3,4].includes(saved.version)||!saved.P||!saved.S||saved.S.settled)throw Error('save');
 if(saved.S.id&&rewardWasSettled(saved.S.id)){localStorage.removeItem(SAVE);show('menu');toast('Ennek a futamnak a kincse már a gyöngytárban van.');return}
 const defaults=blankPlayer();P={...defaults,...saved.P};if(saved.version<3&&!saved.P.classId){P.classId='mage';P.summonMax=0}
 // Existing runs retain their original starting stats and skills during migration.
 if(saved.version===1){P.nova=0;P.pet=profile.equippedPet}
 S={minions:[],buffs:{power:0,haste:0},pickups:[],chests:[],enemyZones:[],buffTimer:12,chestTimer:23,rewardSource:'wave',pearls:0,pearlsOnFloor:[],areas:[],meteors:[],id:'legacy-'+Date.now().toString(36),...saved.S,version:4};
 if(S.wave%15===0&&saved.S.rulesVersion!==2){S.enemies=[];S.spawnLeft=0;S.total=1;S.waveKills=0;S.waveTime=0;S.bossSpawned=false;S.enemyBullets=[]}S.rulesVersion=2;for(const e of S.enemies){e.slow=e.slow||0}
 choices=(saved.choices||[]).filter(id=>upgrades.some(u=>u.id===id));particles=[];texts=[];effects=[];camera={x:P.x,y:P.y};unlockAudio();
 if(saved.mode==='upgrade'){if(choices.length!==3)rollChoices();show('upgrade');renderChoices()}else{show('run');pause()}updateHUD();
 }catch(e){try{localStorage.removeItem(SAVE)}catch(err){}show('menu');toast('Ez a mentés nem tölthető be. Indíts új futamot.')}}
function pause(){if(mode==='space'){Space.pause();return}music.pause();if(!['run','upgrade'].includes(mode)){if(audio)audio.suspend().catch(()=>{});return}pausedFrom=mode;show('pause');$('pauseStats').textContent=`${S.wave}. hullám · ${clock(S.runTime)} · ${format(S.coins)} Ft · ${S.pearls} gyöngy`;renderBuild('runBuild');saveRun();if(audio)audio.suspend().catch(()=>{})}
function resume(){unlockAudio();show(pausedFrom);updateSound();if(pausedFrom==='upgrade')renderChoices();last=performance.now()}
function finish(){if(!S||S.settled)return;S.settled=true;
 // Settlement id and both wallets are written together, preventing duplicate payouts.
 if(settleReward(S.id,S.pearls,S.coins))profile.runs++;
 const record=S.cleared>(S.startBest??profile.best);profile.best=Math.max(profile.best,S.cleared);writeProfile();try{localStorage.removeItem(SAVE)}catch(e){}show('over');$('resultWave').textContent=S.cleared;$('resultKills').textContent=S.kills;$('resultTime').textContent=clock(S.runTime);$('resultCoins').textContent='+'+format(S.coins)+' Ft';$('resultPearls').textContent='+'+S.pearls;$('deathLine').textContent=record?'Új hullámrekord! A kincsed biztonságban van.':`A(z) ${S.wave}. hullám véget ért. Új gyöngyök, új lehetőségek.`;sound('hurt')}

function particle(x,y,color,n=7,speed=80){for(let i=0;i<n&&particles.length<240;i++){let a=rand(0,TAU),v=rand(.3,1)*speed;particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:rand(.2,.65),max:.65,color,size:rand(2,4)})}}
function floating(x,y,text,color=C.ink,size=13){if(texts.length>50)texts.shift();texts.push({x,y,text,color,life:.85,size})}
const kinds=[
 {name:'Nyálka',tile:108,hp:1,speed:54,r:13,dmg:10,reward:1,color:C.mint},
 {name:'Csontváz',tile:121,hp:1.5,speed:68,r:13,dmg:13,reward:3,color:'#d1cbd5'},
 {name:'Denevér',tile:120,hp:.65,speed:112,r:11,dmg:8,reward:2,color:'#d6a881'},
 {name:'Ostromló',tile:110,hp:3.8,speed:45,r:20,dmg:23,reward:8,color:C.red},
 {name:'Mágus',tile:87,hp:2,speed:55,r:14,dmg:14,reward:6,color:C.purple},
 {name:'Vaspáncélos',tile:124,hp:2.9,speed:78,r:16,dmg:18,reward:6,color:'#9aaeca'},
 {name:'Csontkirály',tile:121,hp:25,speed:42,r:34,dmg:30,reward:70,color:C.gold,boss:true},
 {name:'Hamuláng mágus',tile:87,hp:22,speed:48,r:31,dmg:27,reward:85,color:C.purple,boss:true},
 {name:'Vaskolosszus',tile:110,hp:32,speed:32,r:42,dmg:38,reward:95,color:'#d8a57e',boss:true},
 {name:'Parázssárkány',tile:122,hp:42,speed:29,r:58,dmg:35,reward:230,color:'#f2ad77',boss:true},
 {name:'Árnyékpók',tile:120,hp:.5,speed:139,r:9,dmg:7,reward:2,color:'#bd91d9'},
 {name:'Rúnaíjász',tile:113,hp:1.9,speed:39,r:14,dmg:16,reward:7,color:C.mint},
 {name:'Kőzúzó',tile:111,hp:5.2,speed:35,r:25,dmg:27,reward:11,color:'#c3b29d'}
];
function pickKind(){const w=S.wave,v=Math.random();if(w>=4&&v<.09)return 10;if(w>=7&&v<.17)return 11;if(w>=9&&v<.24)return 12;if(w>=6&&v<.14)return 5;if(w>=3&&v<.28)return 4;if(w>=3&&v<.40)return 3;if(w>=2&&v<.59)return 2;if(v<.80)return 1;return 0}
function spawn(kind=pickKind()){const a=rand(0,TAU),radius=Math.max(W/scale,H/scale)*.54+60;let x=clamp(P.x+Math.cos(a)*radius,65,WORLD-65),y=clamp(P.y+Math.sin(a)*radius,65,WORLD-65);if(Math.hypot(x-P.x,y-P.y)<180){x=clamp(P.x+Math.cos(a+Math.PI)*360,65,WORLD-65);y=clamp(P.y+Math.sin(a+Math.PI)*360,65,WORLD-65)}const k=kinds[kind],hp=(18+S.wave*5.5)*k.hp*Math.pow(1.065,Math.max(0,S.wave-8));if(kind===9){x=clamp(P.x+rand(-60,60),110,WORLD-110);y=P.y>400?P.y-265:P.y+265}S.enemies.push({id:S.nextId++,kind,x,y,hp,maxhp:hp,speed:k.speed*(1+Math.min(.65,(S.wave-1)*.025)),r:k.r,dmg:k.dmg*(1+S.wave*.055),reward:Math.ceil(k.reward*(1+S.wave*.17)),slow:0,wake:.85,hit:0,attack:rand(1.4,2.8),telegraph:0,tx:0,ty:0,bladeCD:0,kx:0,ky:0,dead:false});if(k.boss)sound('boss')}
function hitEnemy(e,damage,critical=false,kx=0,ky=0){if(e.dead||e.wake>0)return;e.hp-=damage;e.hit=.10;e.kx+=kx;e.ky+=ky;floating(e.x+rand(-8,8),e.y-e.r-8,String(Math.round(damage)),critical?C.gold:C.ink,critical?17:12);if(e.hp<=0){e.dead=true;S.kills++;S.waveKills++;sound('kill');particle(e.x,e.y,kinds[e.kind].color,kinds[e.kind].boss?32:7,kinds[e.kind].boss?170:70);S.coinsOnFloor.push({x:e.x,y:e.y,v:e.reward,t:0});dropPearl(e);if(P.classId==='necromancer'&&Math.random()<.27)raiseMinion();if(kinds[e.kind].boss)spawnChest(e.x,e.y);else if(Math.random()<.012)spawnChest(e.x,e.y);if(P.vamp>0&&Math.random()<P.vamp)P.hp=Math.min(P.maxhp,P.hp+2);if(kinds[e.kind].boss){shake=.35;floating(e.x,e.y-45,e.kind===9?'SÁRKÁNY LEGYŐZVE':'FŐELLENFÉL LEGYŐZVE',C.gold,16)}}}
function hurt(damage){if(P.invuln>0||P.dashTime>0||mode!=='run')return;const raw=Math.max(1,damage*(1-P.armor)),absorbed=Math.min(P.shield,raw),amount=raw-absorbed;P.shield-=absorbed;P.hp=Math.max(0,P.hp-amount);P.invuln=.72;shake=.16;flash=amount>0?.18:.05;sound('hurt');particle(P.x,P.y,amount>0?C.red:C.pearl,8,90);floating(P.x,P.y-25,amount>0?'−'+Math.round(amount):'PAJZS',amount>0?C.red:C.pearl,16);if(P.hp<=0)finish()}
function dash(){if(mode!=='run'||P.dashCD>0)return;let dx=input.dx,dy=input.dy;if(Math.hypot(dx,dy)<.1){dx=P.lastX;dy=P.lastY}const n=Math.hypot(dx,dy)||1;P.dashX=dx/n;P.dashY=dy/n;P.dashTime=.22;P.dashCD=4;P.invuln=Math.max(P.invuln,.3);sound('dash');particle(P.x,P.y,C.mint,10,80)}
function nearest(from,range=650,exclude=null){let target=null,d=range;for(const e of S.enemies){if(e.dead||e.wake>0||exclude?.has(e.id))continue;const k=dist(from,e);if(k<d){d=k;target=e}}return target}
function fire(){if(P.classId==='warrior'){warriorStrike();return}let target=null,best=550;for(const e of S.enemies){if(e.dead||e.wake>0)continue;const sx=(e.x-camera.x)*scale+W/2,sy=(e.y-camera.y)*scale+H/2,d=dist(P,e);if(sx>=-15&&sx<=W+15&&sy>=125&&sy<=H-80&&d<best){best=d;target=e}}if(!target)return;const angle=Math.atan2(target.y-P.y,target.x-P.x);for(let i=0;i<P.shots;i++){let a=angle+(i-(P.shots-1)/2)*.16,crit=Math.random()<P.crit;S.bullets.push({x:P.x,y:P.y-4,vx:Math.cos(a)*430,vy:Math.sin(a)*430,life:1.65,damage:combatDamage()*(crit?1.9:1),crit,pierce:P.pierce,hitIds:[],blast:P.explosive?32+P.explosive*8:0})}P.facing=target.x<P.x?-1:1;sound('shot')}
function enemyFire(e,angle,speed=145){S.enemyBullets.push({x:e.x+(e.kind===9?Math.cos(angle)*55:0),y:e.y+(e.kind===9?Math.sin(angle)*55:0),vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,life:5,r:e.kind===9?9:kinds[e.kind].boss?7:6,dmg:e.dmg,color:kinds[e.kind].boss?kinds[e.kind].color:C.purple})}
function lightning(){let source=P,used=new Set();for(let i=0;i<2+P.lightning;i++){let e=nearest(source,i===0?500:200,used);if(!e)break;used.add(e.id);effects.push({type:'bolt',x:source.x,y:source.y,tx:e.x,ty:e.y,life:.20});hitEnemy(e,combatDamage()*(.7+P.lightning*.25));source=e}if(used.size)tone(880,.12,'sawtooth',.09,-600)}
function collect(c,quiet=false){S.coins+=c.v;S.earned+=c.v;c.collected=true;if(!quiet){floating(c.x,c.y-9,'+'+c.v+' Ft',C.gold,11);sound('coin');particle(c.x,c.y,C.gold,3,35)}}
function waveComplete(){for(const c of S.coinsOnFloor)if(!c.collected)collect(c,true);for(const c of S.pearlsOnFloor)if(!c.collected)collectPearl(c,true);S.coinsOnFloor=[];S.pearlsOnFloor=[];if(S.wave%3===0)S.pearls++;S.bullets=[];S.enemyBullets=[];S.areas=[];S.meteors=[];S.rewardSource='wave';S.enemyZones=[];S.cleared=S.wave;P.hp=Math.min(P.maxhp,P.hp+P.maxhp*.10);profile.best=Math.max(profile.best,S.cleared);writeProfile();rollChoices();show('upgrade');renderChoices();saveRun();sound('upgrade')}
function update(dt){if(mode!=='run')return;S.runTime+=dt;S.waveTime+=dt;P.invuln=Math.max(0,P.invuln-dt);P.dashCD=Math.max(0,P.dashCD-dt);P.dashTime=Math.max(0,P.dashTime-dt);P.hp=Math.min(P.maxhp,P.hp+P.regen*dt);P.orbit+=dt*(2.2+P.blade*.15);updateWorld(dt);if(mode!=='run')return;
 let dx=input.dx+(keys.ArrowRight||keys.d?1:0)-(keys.ArrowLeft||keys.a?1:0),dy=input.dy+(keys.ArrowDown||keys.s?1:0)-(keys.ArrowUp||keys.w?1:0);let norm=Math.hypot(dx,dy);if(norm>.05){if(norm>1){dx/=norm;dy/=norm}P.lastX=dx;P.lastY=dy;P.facing=dx<0?-1:dx>0?1:P.facing;$('moveHint').hidden=true}if(P.dashTime>0){dx=P.dashX*4.3;dy=P.dashY*4.3;if(Math.random()<.6)particle(P.x,P.y,C.mint,1,12)}P.x=clamp(P.x+dx*P.speed*petAura('speed')*(S.buffs.haste>0?1.35:1)*dt,51,WORLD-51);P.y=clamp(P.y+dy*P.speed*petAura('speed')*(S.buffs.haste>0?1.35:1)*dt,51,WORLD-51);
 updateAbilities(dt);
 P.shotTimer-=dt;if(P.shotTimer<=0){fire();P.shotTimer=P.interval}if(P.lightning){P.lightTimer-=dt;if(P.lightTimer<=0){lightning();P.lightTimer=Math.max(1.2,3.7-P.lightning*.3)*P.skillRate}}
 if(S.wave%5===0&&!S.bossSpawned&&S.waveTime>2){spawn(bossKind());S.bossSpawned=true}S.spawnClock-=dt;if(!dragonWave()&&S.spawnLeft>0&&S.spawnClock<=0&&S.enemies.filter(e=>!e.dead).length<65){spawn();S.spawnLeft--;S.spawnClock=Math.max(.23,.86-S.wave*.027)}
 const active=S.enemies;
 for(const e of active){if(e.dead)continue;if(e.wake>0){e.wake-=dt;continue}e.hit=Math.max(0,e.hit-dt);e.bladeCD=Math.max(0,e.bladeCD-dt);e.slow=Math.max(0,(e.slow||0)-dt);let vx=P.x-e.x,vy=P.y-e.y,d=Math.hypot(vx,vy)||1,nx=vx/d,ny=vy/d;let movement=e.speed;
  if(e.kind===4||e.kind===11){if(d<200)movement=-e.speed*.45;else if(d<310)movement=0}movement*=e.slow>0?.45:1;
  updateSpecial(e,dt);if(e.telegraph>0)movement=0;
  // Local separation is bounded by the 65-enemy spawn cap.
  let sx=0,sy=0;for(const other of active){if(other===e||other.dead||other.wake>0)continue;const ox=e.x-other.x,oy=e.y-other.y,rr=e.r+other.r,dd=ox*ox+oy*oy;if(dd<rr*rr&&dd>0.01){const l=Math.sqrt(dd),push=(rr-l)/rr*42;sx+=ox/l*push;sy+=oy/l*push}}
  e.x=clamp(e.x+(nx*movement+sx+e.kx)*dt,45,WORLD-45);e.y=clamp(e.y+(ny*movement+sy+e.ky)*dt,45,WORLD-45);e.kx*=Math.exp(-10*dt);e.ky*=Math.exp(-10*dt);
  if(d<e.r+13)hurt(e.dmg);if(mode!=='run')return;
  if(P.blade&&e.bladeCD===0){for(let i=0;i<P.blade;i++){const a=P.orbit+i*TAU/P.blade,bx=P.x+Math.cos(a)*65,by=P.y+Math.sin(a)*65;if(Math.hypot(e.x-bx,e.y-by)<e.r+17){hitEnemy(e,combatDamage()*.78,false,Math.cos(a)*120,Math.sin(a)*120);e.bladeCD=.42;break}}}
 }
 for(const b of S.bullets){b.life-=dt;const ox=b.x,oy=b.y;b.x+=b.vx*dt;b.y+=b.vy*dt;for(const e of active){if(e.dead||e.wake>0||b.hitIds.includes(e.id))continue;const rr=e.r+5,segx=b.x-ox,segy=b.y-oy,l=segx*segx+segy*segy,t=l?clamp(((e.x-ox)*segx+(e.y-oy)*segy)/l,0,1):0;if(Math.hypot(e.x-(ox+t*segx),e.y-(oy+t*segy))<rr){hitEnemy(e,b.damage,b.crit,b.vx*.09,b.vy*.09);if(b.blast)blast(b.x,b.y,b.blast*P.areaSize,b.damage*(b.fromPet?.65:.45),b.fromPet?C.gold:C.red,0,e.id);if(b.firePatch)fireArea(e.x,e.y,b.firePatch.r*P.areaSize,b.firePatch.dmg,2);b.hitIds.push(e.id);if(b.pierce--<=0){b.life=0;break}}}}
 for(const b of S.enemyBullets){b.life-=dt;b.x+=b.vx*dt;b.y+=b.vy*dt;if(guardianBlocks(b))continue;if(Math.hypot(P.x-b.x,P.y-b.y)<b.r+12){hurt(b.dmg);b.life=0}if(mode!=='run')return}
 for(const c of S.coinsOnFloor){c.t+=dt;const d=dist(c,P);if(d<P.magnet||c.t>16){const speed=Math.min(620,180+c.t*30);if(d>1){c.x+=(P.x-c.x)/d*speed*dt;c.y+=(P.y-c.y)/d*speed*dt}if(d<22||d<speed*dt)collect(c)}}
 updatePearls(dt);
 S.enemies=S.enemies.filter(e=>!e.dead);S.bullets=S.bullets.filter(b=>b.life>0);S.enemyBullets=S.enemyBullets.filter(b=>b.life>0&&b.x>25&&b.y>25&&b.x<WORLD-25&&b.y<WORLD-25);S.coinsOnFloor=S.coinsOnFloor.filter(c=>!c.collected);
 camera.x+=(P.x-camera.x)*(1-Math.exp(-8*dt));camera.y+=(P.y-camera.y)*(1-Math.exp(-8*dt));if(S.spawnLeft===0&&S.enemies.length===0&&(S.wave%5!==0||S.bossSpawned))waveComplete();
 hudTimer-=dt;if(hudTimer<=0){hudTimer=.10;updateHUD()}
}
function updateHUD(){if(!S||!P)return;$('wave').textContent=String(S.wave).padStart(2,'0');$('waveName').textContent=waveLabel();$('hpText').textContent=`${Math.ceil(P.hp)} / ${Math.ceil(P.maxhp)}`;$('hpBar').style.width=`${P.hp/P.maxhp*100}%`;$('hpBar').style.background=P.hp/P.maxhp<.3?C.red:C.mint;$('coins').textContent=format(S.coins);$('waveBar').style.width=`${Math.min(100,S.waveKills/S.total*100)}%`;$('remaining').textContent=`${Math.max(0,S.total-S.waveKills)} ELLENFÉL MARADT`;$('time').textContent=clock(S.runTime);$('dashText').textContent=P.dashCD>0?P.dashCD.toFixed(1)+' mp':'KÉSZ';$('dashMeter').style.width=(1-P.dashCD/4)*100+'%';$('dashBtn').style.opacity=P.dashCD>0?'.55':'1';$('runPearls').textContent=S.pearls;$('shieldText').textContent=P.shield>0?'◈ '+Math.ceil(P.shield):'';renderBuild('skillRibbon');updateBuffHUD();drawMinimap();$('classSkillName').textContent=CLASS_SKILLS[P.classId].name;$('classSkillCD').textContent=P.classSkillCD>0?Math.ceil(P.classSkillCD)+' mp':'KÉSZ';}
const upgrades=[
 {id:'damage',name:'Fegyvermesterség',desc:'+25% sebzés.',tile:128,apply:()=>P.damage*=1.25},
 {id:'haste',name:'Gyors kéz',desc:'18%-kal gyorsabb alaptámadás.',tile:126,ok:()=>P.interval>.15,apply:()=>P.interval=Math.max(.14,P.interval*.82)},
 {id:'health',name:'Életerő kovácsa',desc:'+25 maximális életerő, azonnal feltöltve.',tile:115,apply:()=>{P.maxhp+=25;P.hp=Math.min(P.maxhp,P.hp+25)}},
 {id:'armor',name:'Lemezpáncél',desc:'+8 százalékpont sebzéscsökkentés. Maximum 64%.',tile:96,ok:()=>P.armor<.639,apply:()=>P.armor=Math.min(.64,P.armor+.08)},
 {id:'speed',name:'Széljáró csizma',desc:'+15% mozgási sebesség.',tile:112,ok:()=>P.speed<310,apply:()=>P.speed=Math.min(330,P.speed*1.15)},
 {id:'crit',name:'Szerencsetallér',desc:'+12 százalékpont kritikus esély. Kritikus sebzés: 190%.',tile:82,ok:()=>P.crit<.8,apply:()=>P.crit=Math.min(.85,P.crit+.12)},
 {id:'regen',name:'Az élet forrása',desc:'+0,6 életerő másodpercenként.',tile:114,apply:()=>P.regen+=.6},
 {id:'magnet',name:'Tallérmágnes',desc:'+55 tallérbegyűjtési hatótáv. +10% sebzés.',tile:116,apply:()=>{P.magnet+=55;P.damage*=1.1}},
 {id:'pierce',name:'Átütő erő',desc:'A lövedék még egy ellenfélen áthatol.',tile:106,rarity:'rare',ok:()=>P.classId!=='warrior'&&P.pierce<5,apply:()=>P.pierce++},
 {id:'multishot',name:'Ikerlövedék',desc:'+1 lövedék minden lövéshez. Maximum 5.',tile:131,rarity:'rare',ok:()=>P.classId!=='warrior'&&P.shots<5,apply:()=>P.shots++},
 {id:'blade',type:'SKILL',name:'Keringő penge',desc:'Újabb penge kering körülötted, és sebzi a közeli ellenfeleket.',tile:103,rarity:'rare',ok:()=>P.blade<5,apply:()=>P.blade++},
 {id:'lightning',type:'SKILL',name:'Láncvillám',desc:'Villám csap több ellenfélbe. Újabb szint: több célpont és sebzés.',tile:125,rarity:'epic',ok:()=>P.lightning<6,apply:()=>P.lightning++},
 {id:'vamp',name:'Vérszerződés',desc:'+20% esély, hogy egy legyőzött ellenfél 2 életerőt adjon.',tile:107,rarity:'rare',ok:()=>P.vamp<.8,apply:()=>P.vamp=Math.min(1,P.vamp+.2)},
 {id:'berserk',name:'Ostrommester',desc:'+40% sebzés és +10 maximális életerő.',tile:118,rarity:'epic',apply:()=>{P.damage*=1.4;P.maxhp+=10;P.hp+=10}}
];
function rollChoices(){let pool=upgrades.filter(u=>!u.ok||u.ok()),result=[];
 function take(candidates){if(!candidates.length)return;const weights=candidates.map(u=>(u.rarity==='epic'?.45:u.rarity==='rare'?.8:1)*(u.type==='TÁRS'?1.1:1));let r=Math.random()*weights.reduce((a,b)=>a+b,0),i=0;for(;i<candidates.length-1;i++){r-=weights[i];if(r<=0)break}const u=candidates[i];result.push(u.id);pool=pool.filter(x=>x!==u)}
 take(pool.filter(u=>u.type==='AOE'||u.type==='SKILL'));if(P.pet&&Math.random()<.4)take(pool.filter(u=>u.type==='TÁRS'));while(result.length<3&&pool.length)take(pool);choices=result;
}
function icon(tile){const c=document.createElement('canvas');c.width=c.height=16;c.className='sprite-icon';const k=c.getContext('2d');if(atlas.complete)k.drawImage(atlas,(tile%12)*16,Math.floor(tile/12)*16,16,16,0,0,16,16);return c}
function renderChoices(){if(!S)return;$('rewardTitle').textContent=S.rewardSource==='chest'?'Kincsesláda!':'Hullám túlélve.';$('rewardInfo').textContent=S.rewardSource==='chest'?`Talált kincs · ${S.wave}. hullám · egy extra fejlesztés`:`${S.wave}. hullám · +10% élet · ${S.pearls} gyöngy a futamban`;$('rewardNote').textContent=S.rewardSource==='chest'?'Válassz egy extra fejlesztést, majd ugyanebben a hullámban folytatod.':'A gyöngyök a futam végén a gyöngytárba kerülnek. A skillek és társfejlesztések ebben a futamban erősítenek.';$('shopCoins').textContent=format(S.coins);$('cards').replaceChildren();for(const id of choices){const u=upgrades.find(x=>x.id===id);if(!u)continue;const card=document.createElement('button');card.className='card '+(u.rarity||'')+(u.type==='TÁRS'?' pet-upgrade':'');card.dataset.upgrade=id;const frame=document.createElement('div');frame.className='card-icon';frame.append(icon(u.tile));const copy=document.createElement('div');copy.className='card-copy';const badge=document.createElement('small');badge.textContent=(u.rarity==='epic'?'EPIKUS · ':u.rarity==='rare'?'RITKA · ':'')+(u.type||'FEJLESZTÉS');const title=document.createElement('h3');title.textContent=u.name+(u.level?' · '+(u.level()+1)+'. szint':'');const d=document.createElement('p');d.textContent=u.desc;copy.append(badge,title,d);const arrow=document.createElement('span');arrow.className='card-arrow';arrow.textContent='↗';card.append(frame,copy,arrow);card.onclick=()=>chooseUpgrade(id);$('cards').append(card)}const r=rerollCost(),h=healCost();$('rerollBtn').textContent=`ÚJ LAPOK · ${r} Ft`;$('rerollBtn').disabled=S.coins<r;$('healBtn').textContent=`+35% ÉLET · ${h} Ft`;$('healBtn').disabled=S.coins<h||P.hp>=P.maxhp;updateHUD()}
function chooseUpgrade(id){if(mode!=='upgrade'||!choices.includes(id))return;const chest=S.rewardSource==='chest',u=upgrades.find(x=>x.id===id);u.apply();P.upgrades++;choices=[];show('run');if(chest){S.rewardSource='wave';P.invuln=Math.max(P.invuln,.8);announce('TALÁLT KINCS',u.name,1.7)}else{S.wave++;beginWave()}saveRun();sound('upgrade')}
function rerollCost(){return 12+S.wave*3}function healCost(){return 18+S.wave*4}
$('rerollBtn').onclick=()=>{if(mode!=='upgrade'||S.coins<rerollCost())return;S.coins-=rerollCost();rollChoices();renderChoices();saveRun();sound('coin')};
$('healBtn').onclick=()=>{if(mode!=='upgrade'||S.coins<healCost()||P.hp>=P.maxhp)return;S.coins-=healCost();P.hp=Math.min(P.maxhp,P.hp+P.maxhp*.35);renderChoices();saveRun();sound('upgrade')};
// Persistent expedition loadout. Cosmetic skins do not alter combat stats.
const SKINS=[
 {id:'class',name:'A kaszt viselete',tile:84,cost:0,desc:'A kiválasztott hős saját megjelenése.'},
 {id:'mage',name:'Rúnamágus',tile:84,cost:0,desc:'Az első ostrom veteránja. Klasszikus lila köpeny.'},
 {id:'knight',name:'Ezüstlovag',tile:96,cost:3,desc:'Acélsisak és határozott fellépés. Kozmetikai skin.'},
 {id:'ranger',name:'Erdőjáró',tile:112,cost:6,desc:'Zöld csuklya a kazamata sötétjében. Kozmetikai skin.'},
 {id:'sage',name:'Ősz bölcs',tile:100,cost:9,desc:'Egy öreg vándor, aki túl sok ostromot látott. Kozmetikai skin.'},
 {id:'shadow',name:'Árnyékjáró',tile:85,cost:8,desc:'Sötét köpenyes vándor. Kozmetikai viselet.'},
 {id:'cleric',name:'Napőrző',tile:88,cost:10,desc:'A fény rendjének viselete. Kozmetikai skin.'},
 {id:'duelist',name:'Párbajhős',tile:97,cost:10,desc:'Könnyű harci viselet. Kozmetikai skin.'},
 {id:'forest',name:'Vadőr',tile:113,cost:12,desc:'Az ősi erdők vadásza. Kozmetikai skin.'},
 {id:'crimson',name:'Karmazsin',tile:101,cost:14,desc:'Vörös udvari viselet. Kozmetikai skin.'},
 {id:'wanderer',name:'Csillagvándor',tile:86,cost:16,desc:'Világok között járó hős. Kozmetikai skin.'},
 {id:'royal',name:'Aranyörökös',tile:99,cost:12,desc:'A kincstárhoz illő aranyviselet. Kozmetikai skin.'}
];
const PETS=[
 {id:'spark',name:'Szikra',role:'fighter',tier:1,tile:108,cost:0,color:C.mint,desc:'I. tier harcoló rúnanyálka. Önállóan céloz és mágikus lövedékekkel segít.'},
 {id:'ember',name:'Parázsegér',role:'fighter',tier:2,tile:123,cost:8,color:'#f3a466',desc:'II. tier harcoló társ. Robbanó tűzgolyó és égő mező.'},
 {id:'storm',name:'Viharsárkány',role:'fighter',tier:3,tile:122,cost:24,color:C.purple,desc:'III. tier harcoló sárkányfióka. Átütő lövedék, villám és robbanás.'},
 {id:'spirit',name:'Őrszellem',role:'defender',tier:1,tile:121,cost:12,color:C.pearl,desc:'I. tier védő. Pajzsot és életerőt ad, a közeli ellenfeleket is sebzi.'},
 {id:'iron',name:'Vasőr',role:'defender',tier:2,tile:124,cost:16,color:'#b1c5dc',desc:'II. tier védő. Erősebb pajzs, gyógyítás és lövedékblokkolás.'},
 {id:'aegis',name:'Égi őrző',role:'defender',tier:3,tile:98,cost:28,color:'#e6d6a8',desc:'III. tier védő. Nagy pajzstartalék és lövedékblokkolás.'},
 {id:'moth',name:'Rúnalepke',role:'buffer',tier:1,tile:120,cost:6,color:'#cfb0ee',desc:'I. tier buffoló. Folyamatos sebzés- és mozgási bónusz, időszakos gyógyítás.'},
 {id:'moss',name:'Mohaszellem',role:'buffer',tier:2,tile:108,cost:14,color:'#a8d389',desc:'II. tier buffoló. Erősebb sebzés- és tempóbónusz, nagyobb gyógyító pulzus.'},
 {id:'raven',name:'Ősi holló',role:'buffer',tier:3,tile:120,cost:24,color:'#e0bbff',desc:'III. tier buffoló. A legerősebb folyamatos sebzés- és mozgási aura.'}
];
const START_SKILLS=[
 {id:'nova',name:'Rúnarobbanás',tile:126,cost:0,desc:'Időnként körkörös lökéshullám indul a hőstől. Már az első hullámban aktív.'},
 {id:'blade',name:'Keringő penge',tile:103,cost:0,desc:'Egy sebző penge kering körülötted az indulástól.'},
 {id:'lightning',name:'Láncvillám',tile:125,cost:0,desc:'Több közeli ellenfélre átugró villámmal indulsz.'},
 {id:'frost',name:'Fagygyűrű',tile:116,cost:6,desc:'A jeges hullám sebzi és 2,8 másodpercre lelassítja a környező ellenfeleket.'},
 {id:'fire',name:'Lángmező',tile:127,cost:8,desc:'Az automatikusan megjelölt célpont alatt tartósan sebző tűzfolt jelenik meg.'},
 {id:'poison',name:'Méregköd',tile:114,cost:8,desc:'Sebző és lassító köd a közeli ellenfeleken.'},
 {id:'sanctuary',name:'Szentély',tile:102,cost:10,desc:'Időszakos gyógyítás és sebző védőgyűrű.'},
 {id:'iceSpear',name:'Jéglándzsa',tile:106,cost:12,desc:'Gyors, több ellenfélen áthatoló jéglövedék.'},
 {id:'meteor',name:'Meteor',tile:107,cost:10,desc:'Rövid célzás után nagy területet pusztító meteor csapódik be.'}
];
const talentDefs=[
 {id:'vitality',name:'Edzett túlélő',text:'+10 kezdő életerő szintenként.',base:4,max:10},
 {id:'power',name:'Rúnamester',text:'+7% kezdő sebzés szintenként.',base:5,max:10},
 {id:'magnet',name:'Kincsvadász',text:'+22 kezdő begyűjtési hatótáv szintenként.',base:3,max:10},
 {id:'ward',name:'Kezdő pajzs',text:'+8 pont elnyelő pajzs minden új futam elején.',base:4,max:5},
 {id:'fortune',name:'Gyöngyvadász',text:'+15% relatív gyöngyesési esély szintenként.',base:5,max:5},
 {id:'focus',name:'Rúnafókusz',text:'3%-kal rövidebb skill-újratöltés szintenként.',base:6,max:5}
];
let collectionTab='skins';
function textNode(tag,text,className){const n=document.createElement(tag);n.textContent=text;if(className)n.className=className;return n}
function pearlMark(){const n=document.createElement('span');n.className='pearl';return n}
function renderLoadout(){const host=$('loadoutStrip');host.replaceChildren();const cls=getClass(profile.equippedClass),skin=profile.equippedSkin==='class'?{name:cls.hu,tile:cls.tile}:SKINS.find(x=>x.id===profile.equippedSkin)||SKINS[0],slots=[['KASZT',cls,'characters'],['SKIN',skin,'skins'],['TÁRS',PETS.find(x=>x.id===profile.equippedPet),'pets'],['SKILL',START_SKILLS.find(x=>x.id===profile.equippedSkill),'skills']];for(const [label,item,tab]of slots){const b=document.createElement('button');b.className='loadout-slot';b.append(icon(item?.tile||74),textNode('small',label),textNode('b',item?.name||'Nincs társ'));b.onclick=()=>tab==='characters'?characterMenu():collection(tab);host.append(b)}}
function collection(tab=collectionTab){
 collectionTab=tab;show('collection');$('collectionPearls').textContent=format(profile.pearls);
 for(const t of ['skins','pets','skills'])$(t+'Tab').setAttribute('aria-selected',String(t===tab));
 const data=tab==='skins'?SKINS:tab==='pets'?PETS:START_SKILLS,key=tab==='skins'?'equippedSkin':tab==='pets'?'equippedPet':'equippedSkill';
 $('collectionInfo').textContent=tab==='skins'?'A kaszt viselete vagy egy feloldott kozmetikai skin. A skinek nem módosítják a statjaidat.':tab==='pets'?'Harcoló, védő vagy buffoló társ, mindegyikből I–III. tier. A magasabb tierhez előbb az előzőt oldd fel ugyanabban a szerepben.':'Válassz egy induló skillt. Mindegyik továbbfejleszthető a futamban; a többi skill ott feloldás nélkül is megjelenhet.';
 $('collectionItems').replaceChildren();
 for(const item of data){const owned=profile[tab].includes(item.id),equipped=profile[key]===item.id,row=document.createElement('article');row.className='collection-item'+(equipped?' equipped':'');row.dataset.item=item.id;
  const portrait=document.createElement('div');portrait.className='collection-portrait';portrait.append(icon(item.id==='class'?getClass(profile.equippedClass).tile:item.tile));const copy=document.createElement('div');copy.className='collection-copy';const h=textNode('h3',item.name);if(equipped)h.append(textNode('em','KIVÁLASZTVA'));copy.append(h,textNode('p',item.desc));
  if(tab==='pets')copy.append(textNode('small',PET_ROLES[item.role]+' · '+['I','II','III'][item.tier-1]+'. TIER','pet-role'));if(tab==='pets'&&owned)copy.append(textNode('p',`Állandó kötelék: ${profile.petRanks[item.id]||0}/5 · +${(profile.petRanks[item.id]||0)*10}% társ-erő`));
  const actions=document.createElement('div');actions.className='item-actions';const b=document.createElement('button');
  if(owned){b.textContent=equipped?'FELSZERELVE':'KIVÁLASZTÁS';b.disabled=equipped;b.dataset.action='equip';b.onclick=()=>{if(!profile[tab].includes(item.id))return;profile[key]=item.id;writeProfile();collection(tab);sound('coin')}}
  else{b.className='buy';b.append(pearlMark(),document.createTextNode(item.cost+' · FELOLDÁS'));b.disabled=profile.pearls<item.cost||(tab==='pets'&&!petCanUnlock(item));if(tab==='pets'&&!petCanUnlock(item))b.title='Előbb az előző tiert kell feloldanod.';b.dataset.action='unlock';b.onclick=()=>{if(profile.pearls<item.cost||profile[tab].includes(item.id)||(tab==='pets'&&!petCanUnlock(item)))return;profile.pearls-=item.cost;profile[tab].push(item.id);profile[key]=item.id;writeProfile();collection(tab);unlockAudio();sound('upgrade')}}
  actions.append(b);
  if(tab==='pets'&&owned){const rank=profile.petRanks[item.id]||0,cost=3+rank*3,bond=document.createElement('button');bond.className='bond';bond.dataset.action='bond';bond.textContent=rank>=5?'MAX KÖTELÉK':`KÖTELÉK +1 · ${cost} GYÖNGY`;bond.disabled=rank>=5||profile.pearls<cost;bond.onclick=()=>{if((profile.petRanks[item.id]||0)!==rank||rank>=5||profile.pearls<cost)return;profile.pearls-=cost;profile.petRanks[item.id]=rank+1;writeProfile();collection(tab);sound('upgrade')};actions.append(bond)}
  copy.append(actions);row.append(portrait,copy);$('collectionItems').append(row);
 }
 if(tab==='pets'){const b=textNode('button','TÁRS NÉLKÜL INDULOK','text-btn');b.disabled=!profile.equippedPet;b.onclick=()=>{profile.equippedPet=null;writeProfile();collection(tab)};$('collectionItems').append(b)}
}
function workshop(){
 show('workshop');$('vaultCoins').textContent=format(profile.pearls);$('talents').replaceChildren();
 for(const t of talentDefs){const lv=profile.talents[t.id],cost=Math.ceil(t.base*Math.pow(1.55,lv)),row=document.createElement('div');row.className='talent';row.dataset.talent=t.id;const info=document.createElement('div'),b=document.createElement('button');info.append(textNode('h3',t.name),textNode('p',`${t.text} ${lv}/${t.max}. szint`));b.textContent=lv>=t.max?'MAX':`${cost} GYÖNGY`;b.disabled=lv>=t.max||profile.pearls<cost;row.append(info,b);b.onclick=()=>{if(profile.pearls<cost||profile.talents[t.id]!==lv||lv>=t.max)return;profile.pearls-=cost;profile.talents[t.id]++;writeProfile();workshop();unlockAudio();sound('upgrade')};$('talents').append(row)}
}
function buildTags(){const tags=[{name:getClass(P.classId).name}];for(const def of START_SKILLS)if(P[def.id]>0)tags.push({name:def.name+' '+P[def.id],pet:false});if(P.explosive)tags.push({name:'Robbanólövedék '+P.explosive});if(P.pet){const pet=PETS.find(x=>x.id===P.pet);tags.push({name:(pet?.name||'Társ')+' · '+P.petLevel+'. szint',pet:true})}return tags}
function renderBuild(id){if(!P)return;const host=$(id),tags=buildTags(),key=tags.map(t=>t.name).join('|');if(host.dataset.build===key)return;host.dataset.build=key;host.replaceChildren();for(const tag of tags)host.append(textNode('span',tag.name,tag.pet?'pet-tag':''))}

// Pearls are kept in the saved run and settled once at run end, together with gold.
function dropPearl(e){const boss=kinds[e.kind].boss,chance=Math.min(.15,(e.kind>=3?.035:.012)*P.pearlLuck);if(boss||Math.random()<chance)S.pearlsOnFloor.push({x:e.x+9,y:e.y-5,v:e.kind===9?4+Math.floor(S.wave/15):boss?1+Math.floor(S.wave/10):1,t:0})}
function collectPearl(c,quiet=false){if(c.collected)return;S.pearls+=c.v;c.collected=true;if(!quiet){floating(c.x,c.y-12,'+'+c.v+' GYÖNGY',C.pearl,12);particle(c.x,c.y,C.pearl,9,75);tone(1300,.18,'sine',.2,400)}}
function updatePearls(dt){for(const c of S.pearlsOnFloor){c.t+=dt;const d=dist(c,P);if(d<P.magnet+45||c.t>10){const speed=240+c.t*25;if(d>1){c.x+=(P.x-c.x)/d*speed*dt;c.y+=(P.y-c.y)/d*speed*dt}if(d<22||d<speed*dt)collectPearl(c)}}S.pearlsOnFloor=S.pearlsOnFloor.filter(c=>!c.collected)}

// AOE damage and slow are shared by skills and companion abilities.
function blast(x,y,r,damage,color=C.mint,slow=0,exclude=null,visual=true){
 let hit=0;for(const e of S.enemies){if(e.dead||e.wake>0||e.id===exclude||Math.hypot(e.x-x,e.y-y)>r+e.r)continue;const d=Math.hypot(e.x-x,e.y-y)||1;if(slow)e.slow=Math.max(e.slow||0,slow);hitEnemy(e,damage,false,(e.x-x)/d*65,(e.y-y)/d*65);hit++}
 if(visual){effects.push({type:'ring',x,y,r:r*.45,life:.5,color});particle(x,y,color,Math.min(18,5+hit*2),r*.8)}return hit;
}
function fireArea(x,y,r,dmg,life=3.2){if(S.areas.length>=10)S.areas.shift();S.areas.push({x,y,r,damage:dmg,life,maxLife:life,tick:.05,color:'#efa36a'})}
function updateAbilities(dt){
 updateClass(dt);updateCompanion(dt);updateNewSkills(dt);const target=nearest(P,470);
 if(P.nova){P.novaTimer-=dt;if(P.novaTimer<=0){blast(P.x,P.y,(100+P.nova*12)*P.areaSize,combatDamage()*(.9+P.nova*.3),C.mint);P.novaTimer=Math.max(2.5,5.7-P.nova*.25)*P.skillRate;tone(180,.20,'triangle',.12,230)}}
 if(P.frost){P.frostTimer-=dt;if(P.frostTimer<=0){blast(P.x,P.y,(110+P.frost*12)*P.areaSize,combatDamage()*(.45+P.frost*.22),C.pearl,2.8);P.frostTimer=Math.max(3,6.8-P.frost*.3)*P.skillRate}}
 if(P.fire){P.fireTimer-=dt;if(P.fireTimer<=0){if(target){fireArea(target.x,target.y,(55+P.fire*9)*P.areaSize,combatDamage()*(.22+P.fire*.12));P.fireTimer=Math.max(2,4.3-P.fire*.2)*P.skillRate}else P.fireTimer=.25}}
 if(P.meteor){P.meteorTimer-=dt;if(P.meteorTimer<=0){if(target){if(S.meteors.length<5)S.meteors.push({x:target.x,y:target.y,r:(80+P.meteor*10)*P.areaSize,damage:combatDamage()*(1.6+P.meteor*.55),life:.85,maxLife:.85});P.meteorTimer=Math.max(3.3,7.2-P.meteor*.4)*P.skillRate}else P.meteorTimer=.25}}
 for(const a of S.areas){a.life-=dt;a.tick-=dt;if(a.tick<=0){blast(a.x,a.y,a.r,a.damage,'#efa36a',0,null,false);a.tick=.4}}S.areas=S.areas.filter(a=>a.life>0);
 for(const m of S.meteors){m.life-=dt;if(m.life<=0){blast(m.x,m.y,m.r,m.damage,'#f5b172');shake=Math.max(shake,.12);tone(95,.22,'triangle',.18,-50)}}S.meteors=S.meteors.filter(m=>m.life>0);
}
upgrades.push(
 {id:'nova',name:'Rúnarobbanás',type:'AOE',tile:126,rarity:'rare',level:()=>P.nova,desc:'Időszakos körkörös sebzés és visszalökés. Szintenként nagyobb hatótáv és erő.',ok:()=>P.nova<8,apply:()=>P.nova++},
 {id:'frost',name:'Fagygyűrű',type:'AOE',tile:116,rarity:'rare',level:()=>P.frost,desc:'Jeges hullám, amely sebzi és 2,8 másodpercre 55%-kal lassítja az ellenfeleket.',ok:()=>P.frost<8,apply:()=>P.frost++},
 {id:'fire',name:'Lángmező',type:'AOE',tile:127,rarity:'rare',level:()=>P.fire,desc:'A célpont alatt több másodpercig sebző lángmező keletkezik.',ok:()=>P.fire<8,apply:()=>P.fire++},
 {id:'meteor',name:'Meteor',type:'AOE',tile:107,rarity:'epic',level:()=>P.meteor,desc:'Rövid célzás után nagy területet érő, erős becsapódás.',ok:()=>P.meteor<8,apply:()=>P.meteor++},
 {id:'explosive',name:'Robbanólövedék',type:'AOE',tile:129,rarity:'rare',level:()=>P.explosive,desc:'A hős lövedékei becsapódáskor a célpont körül is sebeznek.',ok:()=>P.classId!=='warrior'&&P.explosive<5,apply:()=>P.explosive++},
 {id:'areaSize',name:'Táguló rúnák',type:'AOE',tile:61,desc:'+18% területi hatótáv minden robbanáshoz, mezőhöz és társaurához.',ok:()=>P.areaSize<2,apply:()=>P.areaSize=Math.min(2.15,P.areaSize*1.18)},
 {id:'skillRate',name:'Varázslói ritmus',type:'SKILL',tile:128,desc:'12%-kal rövidebb idő a területi skillek és a láncvillám aktiválásai között.',ok:()=>P.skillRate>.45,apply:()=>P.skillRate=Math.max(.4,P.skillRate*.88)},
 {id:'shield',name:'Égi pajzs',tile:102,rarity:'rare',desc:'+25 azonnali elnyelő pajzs és +10% sebzés.',apply:()=>{P.shield+=25;P.damage*=1.1}},
 {id:'pearlLuck',name:'Gyöngyszem',tile:44,desc:'+25% relatív gyöngyesési esély ebben a futamban. +10 begyűjtési hatótáv.',ok:()=>P.pearlLuck<3,apply:()=>{P.pearlLuck+=.25;P.magnet+=10}},
 {id:'petLevel',name:'Társ evolúciója',type:'TÁRS',tile:108,rarity:'rare',level:()=>P.petLevel,desc:'A társad egy szintet lép: erősebb támadások és képességek.',ok:()=>!!P.pet&&P.petLevel<10,apply:()=>P.petLevel++},
 {id:'petPower',name:'Közös erő',type:'TÁRS',tile:123,desc:'+30% társerő. A védők pajzsát és a buffolók auráját is erősíti.',ok:()=>!!P.pet,apply:()=>P.petPower*=1.3},
 {id:'petRate',name:'Fürge társ',type:'TÁRS',tile:120,desc:'18%-kal rövidebb idő a társ akciói között.',ok:()=>!!P.pet&&P.petRate>.45,apply:()=>P.petRate=Math.max(.4,P.petRate*.82)},
 {id:'petHalo',name:'Társrobbanás',type:'TÁRS',tile:121,rarity:'epic',level:()=>P.petHalo,desc:'A társ minden akciója körkörös sebző hullámot is kelt maga körül.',ok:()=>!!P.pet&&P.petHalo<5,apply:()=>P.petHalo++}
);

function drawPearls(){for(const c of S.pearlsOnFloor){const y=c.y+Math.sin(visualTime*4+c.x)*3;circle(c.x,y,13,C.pearl,.09);circle(c.x,y,6.5,'#8695d6');circle(c.x-1,y-1,5.5,'#d7f2ff');circle(c.x-2.5,y-3,2,'#fff');ring(c.x,y,8,C.pearl,1,.4)}}
function drawPet(){drawVisiblePet()}
function drawMenuPet(){const pet=PETS.find(x=>x.id===profile.equippedPet);if(pet){ring(854,987,19,pet.color,1,.3);sprite(pet.tile,854,987+Math.sin(visualTime*3)*3,30)}}
function drawAbilities(){
 for(const a of S.areas){const alpha=Math.min(1,a.life/.5);circle(a.x,a.y,a.r,'#e8924f',.12*alpha);ring(a.x,a.y,a.r,'#ecae6a',1,.32*alpha);for(let i=0;i<5;i++){const t=visualTime*2+i*TAU/5,x=a.x+Math.cos(t)*a.r*.55,y=a.y+Math.sin(t)*a.r*.55;circle(x,y,5+Math.sin(t*3)*2,'#efc36a',.18*alpha)}}
 for(const m of S.meteors){const p=1-m.life/m.maxLife;circle(m.x,m.y,m.r,'#e9ad6f',.06+p*.08);ring(m.x,m.y,m.r,'#e9ad6f',2,.4+p*.4);ring(m.x,m.y,m.r*(1-p),'#ffdd9c',1,.7);ctx.strokeStyle='#f8d29b';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(m.x-25*(1-p),m.y-160*(1-p));ctx.lineTo(m.x-12*(1-p),m.y-90*(1-p));ctx.stroke();circle(m.x-12*(1-p),m.y-90*(1-p),7+p*7,'#f8b66e',.9)}
 for(const e of S.enemies)if(e.slow>0&&!e.dead)ring(e.x,e.y,e.r+4,C.pearl,1,.45);
}

const CLASSES=[
 {id:'warrior',name:'Warrior',hu:'Harcos',tile:96,color:C.gold,desc:'Közeli, széles kardcsapások. +35 életerő, 12% páncél. A sűrű ellenfélcsoportok között is megállja a helyét.',stats:'KÖZELHARC · 135 ALAPÉLET'},
 {id:'mage',name:'Mage',hu:'Mágus',tile:84,color:C.purple,desc:'Átütő mágikus lövedék, 10%-kal nagyobb területi hatótáv és 8%-kal gyorsabb skillek.',stats:'MÁGIA · TERÜLETI SEBZÉS'},
 {id:'ranger',name:'Ranger',hu:'Vadász',tile:112,color:C.mint,desc:'Gyorsabb mozgás és lövések, átütő nyílvessző, magasabb kritikus esély. Kevesebb életerő.',stats:'TÁVOLSÁG · GYORSASÁG'},
 {id:'necromancer',name:'Necromancer',hu:'Nekromanta',tile:87,color:C.pearl,desc:'Két csontvázszolgával indul. Az elesett ellenfelekből további ideiglenes szolgákat idézhet, és ölésből gyógyulhat.',stats:'IDÉZÉS · ÉLETSZÍVÁS'}
];
const PET_ROLES={fighter:'HARCOLÓ',defender:'VÉDŐ',buffer:'BUFFOLÓ'};
function getClass(id){return CLASSES.find(c=>c.id===id)||CLASSES[1]}
function heroTile(p){return p.skin==='class'?getClass(p.classId||profile.equippedClass).tile:(SKINS.find(x=>x.id===p.skin)||SKINS[0]).tile}
function characterMenu(){show('characters');$('characterItems').replaceChildren();for(const c of CLASSES){const selected=profile.equippedClass===c.id,row=document.createElement('article');row.className='collection-item class-card'+(selected?' equipped':'');row.dataset.class=c.id;const pic=document.createElement('div');pic.className='collection-portrait';pic.append(icon(c.tile));const copy=document.createElement('div');copy.className='collection-copy';copy.append(textNode('h3',c.name+' · '+c.hu),textNode('small',c.stats,'pet-role'),textNode('p',c.desc));const actions=document.createElement('div');actions.className='item-actions';const b=textNode('button',selected?'KIVÁLASZTVA':'EZZEL A HŐSSEL INDULOK');b.disabled=selected;b.onclick=()=>{profile.equippedClass=c.id;profile.equippedSkin='class';if(!profile.skins.includes('class'))profile.skins.push('class');writeProfile();characterMenu();sound('coin')};actions.append(b);copy.append(actions);row.append(pic,copy);$('characterItems').append(row)}}
function applyClass(p){p.classId=profile.equippedClass;p.meleeRange=102;p.summonMax=0;p.minionPower=1;p.summonTimer=7;if(p.classId==='warrior'){p.maxhp+=35;p.hp+=35;p.armor=.12;p.speed=152;p.damage*=1.35;p.interval=.60}if(p.classId==='mage'){p.pierce=1;p.areaSize*=1.1;p.skillRate*=.92}if(p.classId==='ranger'){p.maxhp-=15;p.hp-=15;p.speed=186;p.interval=.38;p.crit=.17;p.damage*=.95;p.pierce=1}if(p.classId==='necromancer'){p.maxhp-=10;p.hp-=10;p.damage*=.8;p.speed=158;p.vamp=.12;p.regen=.2;p.summonMax=2}return p}
function petCanUnlock(item){return item.tier===1||PETS.some(p=>p.role===item.role&&p.tier===item.tier-1&&profile.pets.includes(p.id))}
function petAura(type){const pet=PETS.find(x=>x.id===P.pet);if(!pet||pet.role!=='buffer')return 1;const strength=pet.tier*(1+(P.petLevel-1)*.05)*(1+P.petBond*.1)*Math.sqrt(P.petPower);return type==='damage'?1+Math.min(.7,strength*.08):1+Math.min(.25,strength*.03)}
function guardianBlocks(b){const pet=PETS.find(x=>x.id===P.pet);if(!pet||pet.role!=='defender'||pet.tier<2||P.shield<4||Math.hypot(b.x-P.petX,b.y-P.petY)>30+P.petLevel*2)return false;P.shield-=4;b.life=0;effects.push({type:'ring',x:b.x,y:b.y,r:12,life:.5,color:C.pearl});return true}
function updateCompanion(dt){const pet=PETS.find(x=>x.id===P.pet);P.petX+=(P.x-58-P.petX)*(1-Math.exp(-7*dt));P.petY+=(P.y+42-P.petY)*(1-Math.exp(-7*dt));if(!pet)return;P.petTimer-=dt;if(P.petTimer>0)return;const power=combatDamage()*(.5+P.petLevel*.2)*(1+P.petBond*.1)*P.petPower;
 if(pet.role==='buffer'){P.hp=Math.min(P.maxhp,P.hp+pet.tier);effects.push({type:'ring',x:P.petX,y:P.petY,r:40,life:.5,color:pet.color});particle(P.petX,P.petY,pet.color,8,55);P.petTimer=5*P.petRate}
 else if(pet.role==='defender'){P.shield=Math.min(P.maxShield+20+pet.tier*10+P.petLevel*4,P.shield+(12+P.petLevel*3)*pet.tier*(1+P.petBond*.1)*P.petPower);P.hp=Math.min(P.maxhp,P.hp+2+P.petLevel);blast(P.petX,P.petY,(80+P.petLevel*8)*P.areaSize,power*.6,pet.color);P.petTimer=(6.5-pet.tier*.4)*P.petRate}
 else{const target=nearest(P,480);if(!target){P.petTimer=.2;return}const a=Math.atan2(target.y-P.petY,target.x-P.petX),ember=pet.id==='ember';S.bullets.push({x:P.petX,y:P.petY,vx:Math.cos(a)*360,vy:Math.sin(a)*360,life:1.8,damage:power*(1+(pet.tier-1)*.25),crit:false,pierce:pet.tier===3?1:0,hitIds:[],fromPet:true,color:pet.color,blast:ember?48+P.petLevel*5:pet.tier===3?38:0,firePatch:ember?{r:40+P.petLevel*4,dmg:power*.25}:null});if(pet.tier===3){effects.push({type:'bolt',x:P.petX,y:P.petY,tx:target.x,ty:target.y,life:.2});hitEnemy(target,power*.4)}P.petTimer=(ember?2.1:1.45)*P.petRate/Math.min(1.8,1+P.petLevel*.06)}
 if(P.petHalo)blast(P.petX,P.petY,(40+P.petHalo*15)*P.areaSize,power*.35,pet.color);
}
function warriorStrike(){const target=nearest(P,P.meleeRange+20);if(!target)return;const angle=Math.atan2(target.y-P.y,target.x-P.x);P.facing=target.x<P.x?-1:1;for(const e of S.enemies){if(e.dead||e.wake>0||dist(P,e)>P.meleeRange+e.r)continue;const a=Math.atan2(e.y-P.y,e.x-P.x),diff=Math.atan2(Math.sin(a-angle),Math.cos(a-angle));if(Math.abs(diff)<1.1){const crit=Math.random()<P.crit;hitEnemy(e,combatDamage()*1.4*(crit?1.9:1),crit,Math.cos(a)*170,Math.sin(a)*170)}}effects.push({type:'slash',x:P.x,y:P.y,r:P.meleeRange,angle,life:.24,color:C.gold});tone(180,.09,'triangle',.15,450)}
function raiseMinion(){if(!S||P.classId!=='necromancer'||S.minions.length>=P.summonMax)return;const a=Math.random()*TAU;S.minions.push({x:P.x+Math.cos(a)*50,y:P.y+Math.sin(a)*50,life:22,attack:.4,id:S.nextId++});particle(P.x,P.y,C.pearl,6,55)}
function updateClass(dt){if(P.classId!=='necromancer')return;P.summonTimer-=dt;if(P.summonTimer<=0){raiseMinion();P.summonTimer=6}for(const m of S.minions){m.life-=dt;m.attack-=dt;const target=nearest(m,360),dest=target||{x:P.x+Math.cos(m.id+visualTime*.3)*65,y:P.y+Math.sin(m.id+visualTime*.3)*65},d=dist(m,dest)||1;if(d>18){const speed=Math.min(205,d*4);m.x+=(dest.x-m.x)/d*speed*dt;m.y+=(dest.y-m.y)/d*speed*dt}if(target&&dist(m,target)<target.r+22&&m.attack<=0){hitEnemy(target,combatDamage()*.65*P.minionPower,false,(target.x-m.x)*2,(target.y-m.y)*2);m.attack=.8}}S.minions=S.minions.filter(m=>m.life>0)}
function drawMinions(){for(const m of S.minions){circle(m.x,m.y+9,11,'#000',.3);ring(m.x,m.y,18,C.pearl,1,.2);sprite(121,m.x,m.y+Math.sin(visualTime*6+m.id)*2,29,m.x<P.x?-1:1,.8);ctx.textAlign='center';ctx.font='bold 7px sans-serif';ctx.fillStyle=C.pearl;ctx.fillText('SZOLGA',m.x,m.y-20)}}
function drawVisiblePet(){if(!P.pet)return;const p=PETS.find(x=>x.id===P.pet);if(!p)return;const bob=Math.sin(visualTime*5)*3;ctx.strokeStyle=p.color+'35';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(P.x-14,P.y+10);ctx.lineTo(P.petX,P.petY);ctx.stroke();circle(P.petX,P.petY+13,14,'#000',.45);circle(P.petX,P.petY,23,p.color,.09);ring(P.petX,P.petY,22,p.color,2,.75);if(p.id==='storm'&&dragonArt.complete){ctx.save();ctx.translate(P.petX,P.petY+bob);ctx.scale(P.facing,1);ctx.drawImage(dragonArt,15,7,68,73,-21,-22,42,44);ctx.restore()}else sprite(p.tile,P.petX,P.petY+bob,35,P.facing);if(P.petHalo)ring(P.petX,P.petY,40+P.petHalo*15,p.color,1,.12);ctx.textAlign='center';ctx.font='bold 8px sans-serif';ctx.fillStyle=p.color;ctx.fillText(p.name+' · '+P.petLevel,P.petX,P.petY-28)}
upgrades.push(
 {id:'warriorMastery',name:'Kardforgató',type:'SKILL',tile:103,desc:'+15 kardhatótáv és +12% sebzés.',ok:()=>P.classId==='warrior'&&P.meleeRange<177,apply:()=>{P.meleeRange+=15;P.damage*=1.12}},
 {id:'mageMastery',name:'Arkánmesterség',type:'SKILL',tile:128,desc:'+1 átütés és +10% területi hatótáv.',ok:()=>P.classId==='mage'&&P.pierce<5,apply:()=>{P.pierce++;P.areaSize*=1.1}},
 {id:'rangerMastery',name:'Vadászösztön',type:'SKILL',tile:112,desc:'+10 százalékpont kritikus esély és +10 mozgási sebesség.',ok:()=>P.classId==='ranger'&&P.crit<.8,apply:()=>{P.crit=Math.min(.85,P.crit+.1);P.speed=Math.min(330,P.speed+10)}},
 {id:'necroMastery',name:'Holtak légiója',type:'SKILL',tile:121,desc:'+1 megidézhető szolga és +15% szolgasebzés.',ok:()=>P.classId==='necromancer'&&P.summonMax<6,apply:()=>{P.summonMax++;P.minionPower*=1.15;raiseMinion()}}
);

// Seven login days; one automatic reward per Budapest calendar date.
const DAILY_REWARDS=[1,1,1,2,2,3,6];
function rewardDay(now=new Date()){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Budapest',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now),v={};for(const p of parts)v[p.type]=p.value;return Math.floor(Date.UTC(+v.year,+v.month-1,+v.day)/86400000)}
function claimDaily(now=new Date()){const day=rewardDay(now),d=profile.daily;if(d.lastDay!==null&&day<=d.lastDay)return null;const step=d.step%7+1,amount=DAILY_REWARDS[step-1];profile.pearls+=amount;profile.daily={lastDay:day,step,total:d.total+1};writeProfile();return{step,amount}}
function openDaily(reward=null){$('dailyLayer').hidden=false;$('dailyTitle').textContent=reward?'Üdv újra, hős!':'Hétnapos ajándékok.';$('dailyMessage').textContent=reward?`${reward.step}. nap · ${reward.amount} gyöngy hozzáadva a közös gyöngytárhoz.`:`A mai jutalmat már megkaptad. Következő alkalommal ${DAILY_REWARDS[profile.daily.step%7]} gyöngy vár.`;$('dailyDays').replaceChildren();for(let i=0;i<7;i++){const row=document.createElement('div');row.className='daily-day'+(i<profile.daily.step-1?' claimed':'')+(i===profile.daily.step-1?' current':'')+(i===6?' weekly':'');row.append(textNode('small',(i+1)+'. NAP'),textNode('b','+'+DAILY_REWARDS[i]),textNode('em',i<profile.daily.step?'ÁTVÉVE':'GYÖNGY'));$('dailyDays').append(row)}}
function closeDaily(){$('dailyLayer').hidden=true}
function rewardWasSettled(id){return profile.lastSettled===id||profile.settledRuns.includes(id)}
function settleReward(id,pearls,gold=0){if(rewardWasSettled(id))return false;profile.pearls+=Math.max(0,Math.floor(pearls));profile.bank+=Math.max(0,Math.floor(gold));profile.lastSettled=id;profile.settledRuns.push(id);profile.settledRuns=profile.settledRuns.slice(-64);writeProfile();return true}
function showNews(){show('news');$('releaseItems').replaceChildren();for(const release of window.FORINT_RELEASES||[]){const row=document.createElement('article');row.className='release';row.append(textNode('small',release.date),textNode('h3',release.version+' · '+release.title));const list=document.createElement('ul');for(const line of release.changes)list.append(textNode('li',line));row.append(list);$('releaseItems').append(row)}}

// Field events, temporary buffs and individual boss encounters.
const BUFFS=[
 {id:'power',name:'RÚNAERŐ',tile:115,color:'#f3a079',desc:'+50% sebzés · 10 mp'},
 {id:'haste',name:'SZÉLJÁRÁS',tile:116,color:C.pearl,desc:'+35% sebesség · 8 mp'},
 {id:'shield',name:'VÉDŐPAJZS',tile:102,color:C.pearl,desc:'+30 pajzs'},
 {id:'heal',name:'ÉLETFORRÁS',tile:114,color:C.mint,desc:'+25% életerő'},
 {id:'magnet',name:'KINCSVONZÁS',tile:82,color:C.gold,desc:'Minden kincs begyűjtve'}
];
function dragonWave(){return S.wave%15===0}
function bossKind(wave=S.wave){return wave%15===0?9:6+((Math.floor(wave/5)-Math.floor(wave/15)-1)%3+3)%3}
function combatDamage(){return P.damage*petAura('damage')*(S.buffs.power>0?1.5:1)}
function fieldPoint(){const x=clamp(P.x+rand(-W/scale*.32,W/scale*.32),65,WORLD-65),y=clamp(P.y+rand(-H/scale*.25,H/scale*.25),65,WORLD-65);return{x,y:Math.hypot(x-P.x,y-P.y)<75?clamp(y+110,65,WORLD-65):y}}
function spawnBuff(id=null,x=null,y=null){if(S.pickups.length>=4)return;const pos=fieldPoint();S.pickups.push({id:id||BUFFS[Math.floor(Math.random()*BUFFS.length)].id,x:x??pos.x,y:y??pos.y,life:24})}
function applyBuff(id){
 if(id==='power')S.buffs.power=10;if(id==='haste')S.buffs.haste=8;if(id==='shield')P.shield+=30;if(id==='heal')P.hp=Math.min(P.maxhp,P.hp+P.maxhp*.25);
 if(id==='magnet'){for(const c of S.coinsOnFloor)if(!c.collected)collect(c,true);for(const c of S.pearlsOnFloor)if(!c.collected)collectPearl(c,true);S.coinsOnFloor=[];S.pearlsOnFloor=[]}
 const def=BUFFS.find(b=>b.id===id);floating(P.x,P.y-40,def.name,def.color,16);toast(def.desc);particle(P.x,P.y,def.color,15,110);sound('upgrade');
}
function spawnChest(x=null,y=null){if(S.chests.length>=2)return;const pos=fieldPoint();S.chests.push({id:S.nextId++,x:x??pos.x,y:y??pos.y,opened:false})}
function openChest(chest){if(mode!=='run'||chest.opened)return;chest.opened=true;S.chests=S.chests.filter(c=>!c.opened);S.rewardSource='chest';rollChoices();show('upgrade');renderChoices();saveRun();sound('upgrade')}
function enemyZone(x,y,r,damage,delay=1,life=.45){if(S.enemyZones.length>=18)S.enemyZones.shift();S.enemyZones.push({x,y,r,dmg:damage,delay,life,tick:0})}
function updateWorld(dt){
 S.buffs.power=Math.max(0,S.buffs.power-dt);S.buffs.haste=Math.max(0,S.buffs.haste-dt);
 S.buffTimer-=dt;if(S.buffTimer<=0){spawnBuff();S.buffTimer=rand(14,22)}
 S.chestTimer-=dt;if(S.chestTimer<=0){spawnChest();S.chestTimer=rand(30,45)}
 for(const b of S.pickups){b.life-=dt;if(b.life>0&&dist(b,P)<28){applyBuff(b.id);b.life=0}}S.pickups=S.pickups.filter(b=>b.life>0);
 for(const z of S.enemyZones){if(z.delay>0){z.delay-=dt;continue}z.life-=dt;z.tick-=dt;if(z.tick<=0){if(dist(z,P)<z.r+11)hurt(z.dmg);z.tick=.4;if(mode!=='run')return}}S.enemyZones=S.enemyZones.filter(z=>z.delay>0||z.life>0);
 for(const c of S.chests)if(!c.opened&&dist(c,P)<34){openChest(c);return}
}
function updateSpecial(e,dt){
 if(![4,11,12].includes(e.kind)&&!kinds[e.kind].boss)return;
 if(e.telegraph>0){e.telegraph-=dt;if(e.telegraph<=0)resolveSpecial(e);return}
 e.attack-=dt;if(e.attack<=0){e.telegraph=e.kind===9?1.15:e.kind===8?1.05:e.kind===4?.7:.9;e.tx=P.x;e.ty=P.y;const raging=e.kind===9&&e.hp<e.maxhp*.5;e.attack=e.kind===9?(raging?2.2:3.3):e.kind===8?3.6:e.kind===7?3.1:e.kind===6?3.7:2.8}
}
function resolveSpecial(e){const a=Math.atan2(e.ty-e.y,e.tx-e.x);e.attackIndex=(e.attackIndex||0)+1;
 if(e.kind===11){for(let i=-1;i<=1;i++)enemyFire(e,a+i*.12,220);return}if(e.kind===12){enemyZone(e.tx,e.ty,65,e.dmg,.7,.4);return}if(e.kind===4){enemyFire(e,a,150+Math.min(70,S.wave*2));return}
 if(e.kind===6){for(let i=0;i<10;i++)enemyFire(e,a+i*TAU/10,125+S.wave*1.1)}
 if(e.kind===7){for(let i=-2;i<=2;i++)enemyFire(e,a+i*.17,165);enemyZone(e.tx,e.ty,48,e.dmg,.95,.5);if(e.attackIndex%2===0)enemyZone(e.tx+70,e.ty-60,40,e.dmg,1.3,.5)}
 if(e.kind===8){enemyZone(e.tx,e.ty,82,e.dmg*1.15,.65,.45);enemyZone(e.x,e.y,110,e.dmg,.25,.45);for(let i=0;i<6;i++)enemyFire(e,a+i*TAU/6,90)}
 if(e.kind===9){const raging=e.hp<e.maxhp*.5,n=raging?13:9;for(let i=0;i<n;i++)enemyFire(e,a+(i-(n-1)/2)*.105,raging?160:135);
  if(e.attackIndex%2===0){for(let i=0;i<(raging?4:3);i++){const t=i*TAU/3;enemyZone(clamp(e.tx+Math.cos(t)*65,65,WORLD-65),clamp(e.ty+Math.sin(t)*65,65,WORLD-65),raging?56:45,e.dmg*.8,1.1,2.2)}}
  sound('boss');
 }
 effects.push({type:'ring',x:e.x,y:e.y,r:e.kind===9?80:40,life:.5,color:kinds[e.kind].color});
}
function drawField(){
 for(const z of S.enemyZones){const warning=z.delay>0;circle(z.x,z.y,z.r,C.red,warning?.05+.025*Math.sin(visualTime*12):.20);ring(z.x,z.y,z.r,warning?'#ed8e75':'#ffb36c',warning?1.5:3,.7);if(warning){ring(z.x,z.y,z.r*clamp(z.delay/1.2,0,1),C.red,1,.5)}else{circle(z.x,z.y,Math.min(15,z.r/3),'#f3c376',.35)}}
 for(const b of S.pickups){const d=BUFFS.find(x=>x.id===b.id),y=b.y+Math.sin(visualTime*4+b.x)*3;circle(b.x,b.y+10,14,'#000',.35);ring(b.x,y,21,d.color,1.5,.55);circle(b.x,y,20,d.color,.07);sprite(d.tile,b.x,y,30);if(dist(b,P)<140){ctx.textAlign='center';ctx.font='bold 8px sans-serif';ctx.fillStyle=d.color;ctx.fillText(d.name,b.x,y-26)}}
 for(const c of S.chests){circle(c.x,c.y+12,20,'#000',.3);ring(c.x,c.y,27,C.gold,1,.2+.1*Math.sin(visualTime*3));sprite(89,c.x,c.y+Math.sin(visualTime*2)*2,44);ctx.textAlign='center';ctx.font='bold 8px sans-serif';ctx.fillStyle=C.gold;ctx.fillText('FEJLESZTÉS',c.x,c.y-30)}
}
function updateBuffHUD(){const tags=[];if(S.buffs.power>0)tags.push('SEBZÉS +50% · '+Math.ceil(S.buffs.power)+' mp');if(S.buffs.haste>0)tags.push('TEMPÓ +35% · '+Math.ceil(S.buffs.haste)+' mp');$('buffRibbon').textContent=tags.join('    /    ');const e=S.enemies.find(e=>!e.dead&&kinds[e.kind].boss);$('bossHud').hidden=!e;if(e){$('bossName').textContent=kinds[e.kind].name+(e.kind===9&&e.hp<e.maxhp*.5?' · FELBŐSZÜLT':'');$('bossHP').style.width=e.hp/e.maxhp*100+'%';$('bossHP').style.background=kinds[e.kind].color}}

// Rendering uses the bundled, original CC0 Kenney Tiny Dungeon tile atlas.
function sprite(tile,x,y,size=40,flip=1,opacity=1){if(!atlas.complete||!atlas.naturalWidth)return;ctx.save();ctx.globalAlpha*=opacity;ctx.translate(Math.round(x),Math.round(y));ctx.scale(flip,1);ctx.drawImage(atlas,(tile%12)*16,Math.floor(tile/12)*16,16,16,-size/2,-size/2,size,size);ctx.restore()}
function circle(x,y,r,color,alpha=1){ctx.globalAlpha=alpha;ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();ctx.globalAlpha=1}
function ring(x,y,r,color,width=1,alpha=1){ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();ctx.globalAlpha=1}
function worldBackground(){const viewW=W/scale,viewH=H/scale,left=camera.x-viewW/2,top=camera.y-viewH/2,tile=48,x0=Math.max(0,Math.floor(left/tile)),x1=Math.min(37,Math.ceil((left+viewW)/tile)),y0=Math.max(0,Math.floor(top/tile)),y1=Math.min(37,Math.ceil((top+viewH)/tile));ctx.fillStyle='#101d23';ctx.fillRect(left-5,top-5,viewW+10,viewH+10);
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const edge=x===0||y===0||x===37||y===37,hash=(x*73+y*137)%37;if(edge)sprite(14,x*tile+24,y*tile+24,tile,1,.65);else{sprite(hash<3?12:hash===5?24:0,x*tile+24,y*tile+24,tile,1,.31);ctx.strokeStyle='#b0c5af05';ctx.lineWidth=1;ctx.strokeRect(x*tile,y*tile,tile,tile);if(hash===13)sprite(24,x*tile+24,y*tile+24,30,1,.38)}}
 const seals=[[900,900],[480,480],[1320,480],[480,1320],[1320,1320]];for(const [x,y]of seals){if(x<left-120||x>left+viewW+120||y<top-120||y>top+viewH+120)continue;ring(x,y,85,'#86bc9d',1,.12);ring(x,y,72,'#86bc9d',2,.08);ctx.save();ctx.translate(x,y);ctx.strokeStyle='#a4be9c15';ctx.lineWidth=2;for(let i=0;i<8;i++){ctx.rotate(TAU/8);ctx.strokeRect(-5,65,10,12)}ctx.rotate(Math.PI/4);ctx.strokeRect(-32,-32,64,64);ctx.restore()}
 const props=[[320,320,56],[1480,320,56],[320,1480,56],[1480,1480,56],[700,240,65],[1100,1560,65],[240,1050,63],[1560,750,63]];for(const [x,y,t]of props){circle(x,y+15,21,'#000',.22);sprite(t,x,y,46,1,.8)}
 for(const [x,y]of [[115,115],[1685,115],[115,1685],[1685,1685],[900,90],[900,1710]]){const glow=ctx.createRadialGradient(x,y,3,x,y,100);glow.addColorStop(0,'#e9a45425');glow.addColorStop(1,'#e9a45400');ctx.fillStyle=glow;ctx.fillRect(x-100,y-100,200,200);sprite(29,x,y,48)}
}
function drawEnemy(e){const k=kinds[e.kind],boss=k.boss,dragon=e.kind===9,size=dragon?210:boss?(e.kind===8?105:87):k.r*2+16;
 if(e.wake>0){ring(e.x,e.y,dragon?85:boss?47:26+5*Math.sin(visualTime*9),boss?C.gold:C.red,2,.6);ctx.fillStyle=boss?C.gold:C.red;ctx.font='bold 19px sans-serif';ctx.textAlign='center';ctx.fillText('!',e.x,e.y+6);return}
 const bob=Math.sin(visualTime*(dragon?2:e.kind===2?17:8)+e.id)*(dragon?4:2);circle(e.x,e.y+size*.24,e.r*.9,'#000',.30);
 if(e.telegraph>0){if(boss){ring(e.x,e.y,dragon?91:52+Math.sin(visualTime*15)*4,k.color,3,.75);ring(e.tx,e.ty,e.kind===8?82:35,C.red,1.5,.5)}else{ctx.globalAlpha=.4;ctx.strokeStyle=C.purple;ctx.lineWidth=2;ctx.setLineDash([6,6]);ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.tx,e.ty);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1}}
 if(dragon&&dragonArt.complete&&dragonArt.naturalWidth){ctx.save();ctx.translate(e.x,e.y+bob);ctx.scale(P.x<e.x?-1:1,1);ctx.drawImage(dragonArt,15,7,68,73,-size/2,-size/2,size,size*73/68);ctx.restore();if(e.hp<e.maxhp*.5)ring(e.x,e.y,e.r+9,C.red,2,.25)}else sprite(k.tile,e.x,e.y+bob,size,P&&P.x<e.x?-1:1);
 if(e.kind===6){ctx.fillStyle=C.gold;for(let i=0;i<3;i++)ctx.fillRect(e.x-12+i*9,e.y-43-(i===1?4:0),6,10)}if(e.hit>0)circle(e.x,e.y,e.r,C.ink,.23);
 if(boss||e.hp<e.maxhp){const w=dragon?140:boss?68:28;ctx.fillStyle='#08181d';ctx.fillRect(e.x-w/2,e.y-size*.5-10,w,4);ctx.fillStyle=boss?k.color:C.red;ctx.fillRect(e.x-w/2,e.y-size*.5-10,w*e.hp/e.maxhp,4)}
}
function drawPlayer(p,demo=false){const bob=Math.sin(visualTime*9)*(demo||Math.hypot(input.dx,input.dy)>.1?2:0);circle(p.x,p.y+16,16,'#000',.38);ring(p.x,p.y+7,23,C.mint,1,.15);if(p.dashTime>0)circle(p.x,p.y,27,C.mint,.16);sprite(heroTile(p),p.x,p.y+bob,45,p.facing,p.invuln>0&&Math.sin(visualTime*28)>0?.5:1);sprite(p.classId==='warrior'?103:p.classId==='ranger'?118:p.classId==='necromancer'?129:128,p.x+18*p.facing,p.y+4+bob,25,p.facing);if(p.shield>0)ring(p.x,p.y,27,C.pearl,1.5,.35+.12*Math.sin(visualTime*3));if(p.blade)for(let i=0;i<p.blade;i++){const a=p.orbit+i*TAU/p.blade,bx=p.x+Math.cos(a)*65,by=p.y+Math.sin(a)*65;ctx.save();ctx.translate(bx,by);ctx.rotate(a+Math.PI/2);sprite(103,0,0,35);ctx.restore();ring(p.x,p.y,65,C.mint,1,.055)}}
function draw(){ctx.setTransform(DPR,0,0,DPR,0,0);ctx.fillStyle='#101c22';ctx.fillRect(0,0,W,H);const playing=P&&S&&['run','pause','upgrade','over'].includes(mode);if(!playing){camera.x=900+Math.sin(visualTime*.09)*55;camera.y=900+Math.cos(visualTime*.07)*35}ctx.save();ctx.translate(W/2+(shake>0?rand(-3,3):0),H/2+(shake>0?rand(-3,3):0));ctx.scale(scale,scale);ctx.translate(-camera.x,-camera.y);worldBackground();
 if(playing){drawField();drawAbilities();drawPearls()}
 if(playing){for(const c of S.coinsOnFloor){const bob=Math.sin(visualTime*5+c.x)*2;circle(c.x,c.y+5,8,'#000',.20);circle(c.x,c.y+bob,6,C.gold,.16);sprite(82,c.x,c.y+bob,22);ctx.font='bold 7px sans-serif';ctx.fillStyle='#7f571d';ctx.textAlign='center';ctx.fillText('Ft',c.x,c.y+bob+2)}
  const bodies=[...S.enemies,{player:true,y:P.y}].sort((a,b)=>a.y-b.y);for(const e of bodies)e.player?drawPlayer(P):drawEnemy(e);drawMinions();drawPet();
  for(const b of S.bullets){ctx.strokeStyle=b.color||(b.crit?C.gold:C.mint);ctx.lineWidth=b.crit?5:4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(b.x-b.vx*.026,b.y-b.vy*.026);ctx.lineTo(b.x,b.y);ctx.stroke();circle(b.x,b.y,2.2,C.ink)}
  for(const b of S.enemyBullets){circle(b.x,b.y,b.r+4,b.color,.12);circle(b.x,b.y,b.r,b.color);circle(b.x-1,b.y-1,2,C.ink,.8)}
 }else{const demo={x:900,y:960,facing:1,invuln:0,dashTime:0,blade:2,orbit:visualTime*.9,skin:profile.equippedSkin,classId:profile.equippedClass,shield:0};drawPlayer(demo,true);drawMenuPet();for(let i=0;i<5;i++){let a=i*TAU/5+visualTime*.06;const x=900+Math.cos(a)*180,y=960+Math.sin(a)*180;sprite([108,121,110,120,124][i],x,y+Math.sin(visualTime*3+i)*3,43,i%2?1:-1,.6)}for(let i=0;i<7;i++){const a=i*TAU/7; sprite(82,900+Math.cos(a)*115,960+Math.sin(a)*115,22,1,.6)}}
 for(const e of (mode==='run'?effects:[])){if(e.type==='bolt'){ctx.save();ctx.strokeStyle='#d3c4ff';ctx.lineWidth=2.6;ctx.shadowColor='#ab83ff';ctx.shadowBlur=10;ctx.beginPath();ctx.moveTo(e.x,e.y);for(let i=1;i<5;i++){const f=i/5;ctx.lineTo(e.x+(e.tx-e.x)*f+rand(-9,9),e.y+(e.ty-e.y)*f+rand(-9,9))}ctx.lineTo(e.tx,e.ty);ctx.stroke();ctx.restore()}else if(e.type==='slash'){ctx.save();ctx.globalAlpha=e.life/.24;ctx.strokeStyle=e.color;ctx.lineWidth=9;ctx.beginPath();ctx.arc(e.x,e.y,e.r,e.angle-1.05,e.angle+1.05);ctx.stroke();ctx.restore()}else if(e.type==='ring')ring(e.x,e.y,e.r+(1-e.life/.5)*80,e.color,2,e.life*1.5)}
 for(const p of particles){ctx.globalAlpha=clamp(p.life/.35,0,1);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,p.size,p.size)}ctx.globalAlpha=1;ctx.textAlign='center';for(const t of texts){ctx.globalAlpha=clamp(t.life/.25,0,1);ctx.font=`bold ${t.size}px sans-serif`;ctx.fillStyle='#051417';ctx.fillText(t.text,t.x+1,t.y+1);ctx.fillStyle=t.color;ctx.fillText(t.text,t.x,t.y)}ctx.globalAlpha=1;ctx.restore();
 const vignette=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.3,W/2,H/2,H*.72);vignette.addColorStop(0,'#07151a00');vignette.addColorStop(1,'#07151a99');ctx.fillStyle=vignette;ctx.fillRect(0,0,W,H);if(flash>0){ctx.fillStyle=`rgba(225,80,70,${flash*.8})`;ctx.fillRect(0,0,W,H)}
 if(input.id!==null&&mode==='run'){ring(input.baseX,input.baseY,44,C.mint,1,.32);circle(input.baseX,input.baseY,43,'#163c38',.25);circle(input.baseX+input.dx*33,input.baseY+input.dy*33,18,C.mint,.30);ring(input.baseX+input.dx*33,input.baseY+input.dy*33,18,C.mint,1,.55)}
}
function cosmeticUpdate(dt){for(const p of particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.exp(-3*dt);p.vy*=Math.exp(-3*dt)}particles=particles.filter(p=>p.life>0);for(const t of texts){t.life-=dt;t.y-=25*dt}texts=texts.filter(t=>t.life>0);for(const e of effects)e.life-=dt;effects=effects.filter(e=>e.life>0);shake=Math.max(0,shake-dt);flash=Math.max(0,flash-dt);if(bannerTime>0&&mode==='run'){bannerTime-=dt;if(bannerTime<=0)$('banner').hidden=true}}
function frame(t){let elapsed=last?Math.min(.10,(t-last)/1000):0;last=t;visualTime+=elapsed;if(mode==='space'){Space.frame(elapsed);requestAnimationFrame(frame);return}if(mode==='run'){// Substeps avoid tunnelling and keep movement consistent on slower phones.
  let remaining=elapsed;while(remaining>0&&mode==='run'){let dt=Math.min(remaining,1/60);update(dt);remaining-=dt}cosmeticUpdate(elapsed)}draw();requestAnimationFrame(frame)}
canvas.addEventListener('pointerdown',e=>{if(mode!=='run'||input.id!==null)return;input.id=e.pointerId;input.baseX=input.x=e.clientX;input.baseY=input.y=e.clientY;input.dx=input.dy=0;canvas.setPointerCapture(e.pointerId);unlockAudio();e.preventDefault()});
canvas.addEventListener('pointermove',e=>{if(e.pointerId!==input.id)return;let dx=e.clientX-input.baseX,dy=e.clientY-input.baseY,n=Math.hypot(dx,dy),r=44;input.dx=n>r?dx/n:dx/r;input.dy=n>r?dy/n:dy/r;e.preventDefault()});
function pointerEnd(e){if(e.pointerId===input.id){input.id=null;input.dx=input.dy=0}}canvas.addEventListener('pointerup',pointerEnd);canvas.addEventListener('pointercancel',pointerEnd);canvas.addEventListener('lostpointercapture',pointerEnd);
$('dashBtn').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();dash()});
addEventListener('keydown',e=>{if(mode==='space')return;if(e.key==='Escape'&&!$('dailyLayer').hidden){closeDaily();return}if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();if(e.key==='Escape'){if(mode==='pause')resume();else pause()}if(e.code==='Space')dash();if(e.key.toLowerCase()==='e')useClassSkill();keys[e.key]=true});addEventListener('keyup',e=>keys[e.key]=false);
addEventListener('blur',pause);addEventListener('focus',()=>{if(mode==='menu'&&musicUnlocked&&profile.sound){if(audio)audio.resume().catch(()=>{});music.play().catch(()=>{})}});document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});addEventListener('pagehide',()=>{if(mode==='space')Space.save();else saveRun()});
$('startBtn').onclick=()=>{let saved=false;try{saved=!!localStorage.getItem(SAVE)}catch(e){}if(saved){toast('A mentett futamot előbb folytasd vagy fejezd be.');return}newRun()};$('continueBtn').onclick=restore;$('againBtn').onclick=newRun;$('pauseBtn').onclick=pause;$('resumeBtn').onclick=resume;$('quitBtn').onclick=finish;$('backMenuBtn').onclick=()=>show('menu');$('helpBtn').onclick=()=>show('help');$('helpBackBtn').onclick=()=>show('menu');$('workshopBtn').onclick=workshop;$('workshopBackBtn').onclick=()=>show('menu');$('collectionBtn').onclick=()=>collection('skins');$('resultCollectionBtn').onclick=()=>collection('pets');$('collectionBackBtn').onclick=()=>show('menu');$('skinsTab').onclick=()=>collection('skins');$('petsTab').onclick=()=>collection('pets');$('skillsTab').onclick=()=>collection('skills');$('soundBtn').onclick=toggleSound;$('pauseSoundBtn').onclick=toggleSound;
const Space=window.createSpaceGame({profile:()=>profile,saveProfile:writeProfile,show,unlockAudio,sound,toast,active:()=>mode==='space',lobbyActive:()=>mode==='spaceLobby',pilotName:()=>getClass(profile.equippedClass).name,pilotTile:()=>getClass(profile.equippedClass).tile,settle:settleReward,wasSettled:rewardWasSettled,pauseAudio:()=>{music.pause();if(audio)audio.suspend().catch(()=>{})},resumeAudio:()=>{unlockAudio();updateSound()}});
$('accountBtn').onclick=()=>{show('account');Account.refresh()};$('accountBackBtn').onclick=()=>show('menu');$('classSkillBtn').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();useClassSkill()});
$('spaceLobbyBtn').onclick=()=>Space.openLobby();$('saveMenuBtn').onclick=()=>{saveRun();show('menu')};$('dailyBtn').onclick=()=>openDaily();$('dailyCloseBtn').onclick=closeDaily;$('charactersBackBtn').onclick=()=>show('menu');$('newsBtn').onclick=showNews;$('newsBackBtn').onclick=()=>show('menu');$('guideBtn').onclick=()=>show('help');
document.addEventListener('pointerdown',unlockAudio,{once:true});
const CLASS_SKILLS={warrior:{name:'CSATAKIÁLTÁS',cooldown:13},mage:{name:'ARKÁNVIHAR',cooldown:12},ranger:{name:'NYÍLZÁPOR',cooldown:10},necromancer:{name:'LÉLEKSZÜRET',cooldown:14}};
function useClassSkill(){if(mode!=='run'||P.classSkillCD>0)return;const level=P.classSkillLevel||1,d=combatDamage(),def=CLASS_SKILLS[P.classId];if(P.classId==='warrior'){P.shield+=12+level*4;blast(P.x,P.y,130*P.areaSize,d*(1.6+level*.3),C.gold)}if(P.classId==='mage')blast(P.x,P.y,190*P.areaSize,d*(2+level*.45),C.purple,1);if(P.classId==='ranger'){const targets=S.enemies.filter(e=>!e.dead&&e.wake<=0).sort((a,b)=>dist(a,P)-dist(b,P)).slice(0,5+level);for(const e of targets){const a=Math.atan2(e.y-P.y,e.x-P.x);S.bullets.push({x:P.x,y:P.y,vx:Math.cos(a)*570,vy:Math.sin(a)*570,life:1.5,damage:d*(1.2+level*.2),crit:false,pierce:2,hitIds:[]})}}if(P.classId==='necromancer'){raiseMinion();raiseMinion();const hits=blast(P.x,P.y,150*P.areaSize,d*(1.1+level*.25),C.pearl);P.hp=Math.min(P.maxhp,P.hp+Math.min(16,hits*(2+level)))}P.classSkillCD=def.cooldown*P.skillRate;sound('upgrade');saveRun()}
function updateNewSkills(dt){P.classSkillCD=Math.max(0,(P.classSkillCD||0)-dt);for(const id of ['poison','sanctuary','iceSpear']){if(!P[id])continue;const timer=id+'Timer';P[timer]-=dt;if(P[timer]>0)continue;const target=nearest(P,450),d=combatDamage();if(id==='poison'){if(target){fireArea(target.x,target.y,(60+P[id]*8)*P.areaSize,d*(.25+P[id]*.08),3.5);blast(target.x,target.y,80*P.areaSize,d*.3,C.mint,2)}P[timer]=5*P.skillRate}if(id==='sanctuary'){P.hp=Math.min(P.maxhp,P.hp+3+P[id]*2);P.shield+=2+P[id];blast(P.x,P.y,100*P.areaSize,d*(.3+P[id]*.1),C.pearl);P[timer]=7*P.skillRate}if(id==='iceSpear'){if(target){const a=Math.atan2(target.y-P.y,target.x-P.x);S.bullets.push({x:P.x,y:P.y,vx:Math.cos(a)*560,vy:Math.sin(a)*560,life:1.6,damage:d*(1+P[id]*.4),crit:false,pierce:2+P[id],hitIds:[],color:C.pearl})}P[timer]=3.4*P.skillRate}}}
for(const [id,name,tile] of [['poison','Méregköd',114],['sanctuary','Szentély',102],['iceSpear','Jéglándzsa',106]])upgrades.push({id,name,tile,type:'AOE',level:()=>P[id],desc:'Új képesség, vagy a meglévő skill következő szintje: erősebb hatás.',ok:()=>P[id]<8,apply:()=>P[id]++});
upgrades.push({id:'classSkill',name:'Kaszt ereje',type:'SKILL',tile:125,desc:'Erősebb saját kasztképesség. Aktiválás: bal alsó gomb vagy E.',ok:()=>P.classSkillLevel<6,apply:()=>P.classSkillLevel++});
function drawMinimap(){if(!P||!S)return;const map=$('minimap'),m=map.getContext('2d'),w=map.width,h=map.height,px=x=>8+x/WORLD*(w-16),py=y=>8+y/WORLD*(h-16);m.clearRect(0,0,w,h);m.fillStyle='#0a1925';m.fillRect(0,0,w,h);m.strokeStyle='#6d928355';m.strokeRect(8,8,w-16,h-16);for(const e of S.enemies){if(e.dead)continue;m.fillStyle=kinds[e.kind].boss?'#edc66e':'#f5827a';const z=kinds[e.kind].boss?7:4;m.fillRect(px(e.x)-z/2,py(e.y)-z/2,z,z)}for(const c of S.chests){m.fillStyle='#edc66e';m.fillRect(px(c.x)-2,py(c.y)-2,4,4)}m.fillStyle='#b2dcff';m.beginPath();m.arc(px(P.x),py(P.y),4,0,TAU);m.fill();m.strokeStyle='#b2dcff55';m.strokeRect(px(camera.x-W/(2*scale)),py(camera.y-H/(2*scale)),W/scale/WORLD*(w-16),H/scale/WORLD*(h-16))}
window.SaveHooks={before(){if(mode==='space')Space.save();else saveRun();writeProfile()},open(){show('account')},back(){show('menu')}};

window.Game={pause,back(){if(!$('dailyLayer').hidden){closeDaily();return}if(mode==='space'){Space.back();return}if(mode==='run'||mode==='upgrade')pause();else if(mode==='pause')resume();else if(['account','help','workshop','over','collection','characters','spaceLobby','news','account'].includes(mode))show('menu')}};
// Explicit test-only interface. Not active in the packaged file:/// URL.
if(new URLSearchParams(location.search).has('test'))window.GameTest={get state(){return S},get player(){return P},get mode(){return mode},get profile(){return profile},get kinds(){return kinds},get music(){return music},Space,CLASSES,CLASS_SKILLS,useClassSkill,updateNewSkills,drawMinimap,claimDaily,rewardDay,DAILY_REWARDS,closeDaily,characterMenu,petCanUnlock,petAura,guardianBlocks,raiseMinion,updateClass,settleReward,rewardWasSettled,newRun,beginWave,update,spawn,hitEnemy,hurt,dash,finish,bossKind,resolveSpecial,updateWorld,spawnBuff,applyBuff,spawnChest,openChest,combatDamage,BUFFS,waveComplete,blast,updateAbilities,dropPearl,collectPearl,collection,workshop,SKINS,PETS,START_SKILLS,talentDefs,chooseUpgrade,saveRun,restore,pause,resume,rollChoices,renderChoices,collect,upgrades,nearest,step(seconds){for(let i=0;i<Math.ceil(seconds*60)&&mode==='run';i++)update(Math.min(1/60,seconds-i/60))}};
atlas.onload=()=>{if(mode==='upgrade')renderChoices();if(mode==='menu')renderLoadout();if(mode==='collection')collection(collectionTab)};atlas.onerror=()=>toast('A grafikai elemek betöltése nem sikerült.');show('menu');requestAnimationFrame(frame);
})();
