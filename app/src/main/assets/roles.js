/* RiftBramble 1.5.1: Kenney heroes and Clint Bellanger Tiny Creatures pets; accepted enemy art retained. */
(()=>{'use strict';const cache=new Map(),palettes=['#52cfdd','#81a5ef','#7fe3ad','#b69af0','#e9b276','#c2a3fa','#83dfcb','#e9abc7','#b2d88a','#ed9ab0','#9bbbcf','#e7cc83'];
const heroSkins=Object.freeze([{id:'class',tile:84},{id:'mage',tile:84},{id:'knight',tile:96},{id:'ranger',tile:112},{id:'sage',tile:100},{id:'shadow',tile:98},{id:'cleric',tile:88},{id:'duelist',tile:97},{id:'forest',tile:111},{id:'crimson',tile:99},{id:'wanderer',tile:85},{id:'royal',tile:87}].map(Object.freeze));
const classTiles=Object.freeze({warrior:96,mage:84,ranger:112,necromancer:100});
const petSprites=Object.freeze({spark:4,ember:123,storm:32,spirit:50,iron:128,aegis:49,moth:13,moss:115,raven:180,fighter:99});const petAtlas=new Image();petAtlas.onload=()=>{for(const k of cache.keys())if(k.startsWith('pet:'))cache.delete(k);window.dispatchEvent(new Event('riftartready'))};petAtlas.src='art/creatures.png';
const heroAtlas=new Image();heroAtlas.onload=()=>{for(const k of cache.keys())if(k.startsWith('hero:')||k.startsWith('pet:'))cache.delete(k);window.dispatchEvent(new Event('riftartready'))};heroAtlas.src='art/dungeon.png';
function frame(group,id,variant=0){const key=[group,id,variant].join(':');if(cache.has(key))return cache.get(key);const c=document.createElement('canvas');c.width=c.height=group==='hero'||group==='pet'?32:24;const g=c.getContext('2d');g.imageSmoothingEnabled=false;const r=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h)},o='#091725',white='#e3f9ff',red='#ff584b';
 if(group==='hero'){
  // Original detailed Kenney characters: different faces, clothing and silhouettes.
  const skin=heroSkins[variant]||heroSkins[0],tile=variant===0?(classTiles[id]||84):skin.tile;
  if(!heroAtlas.complete||!heroAtlas.naturalWidth)return c;
  g.drawImage(heroAtlas,tile%12*16,Math.floor(tile/12)*16,16,16,0,0,32,32);
 }else if(group==='pet'&&id==='raven'){
  // Distinct corvid silhouette: hooked beak, layered wing and long tail.
  g.scale(.5,.5);g.imageSmoothingEnabled=true;
  const shape=(d,f,stroke='#101827')=>{g.fillStyle=f;g.strokeStyle=stroke;g.lineWidth=1.4;const p=new Path2D(d);g.fill(p);g.stroke(p)};
  shape('M24 38 L8 58 L24 52 L32 42 Z','#25263e');
  shape('M26 22 Q21 31 24 42 Q34 51 44 39 L46 26 Q52 22 48 15 Q43 8 36 14 L32 24 Z','#25283d');
  shape('M46 18 L59 23 L49 26 L45 23 Z','#697789');
  shape('M29 27 Q12 14 4 22 L17 29 L7 29 L22 35 L13 37 L29 42 Q40 42 40 34 Z','#353951');
  shape('M30 29 L18 23 L27 33 L19 31 L31 39 L36 36 Z','#525b73');
  shape('M37 28 Q41 25 43 28 L40 35 L35 39 Z','#3e4b66');
  g.strokeStyle='#8594ac';g.lineWidth=1;for(let i=0;i<3;i++){g.beginPath();g.moveTo(24+i*3,31+i*2);g.lineTo(31+i*2,36+i);g.stroke()}
  g.fillStyle='#e5ccff';g.beginPath();g.arc(44,18,2,0,Math.PI*2);g.fill();g.fillStyle='#151021';g.fillRect(44,17,1,2);
  g.strokeStyle='#b7a27d';g.lineWidth=2;g.beginPath();g.moveTo(31,44);g.lineTo(30,50);g.lineTo(26,52);g.moveTo(38,43);g.lineTo(39,49);g.lineTo(44,50);g.stroke();
 }else if(group==='pet'){
  const image=id==='ember'?heroAtlas:petAtlas;
  if(!image.complete||!image.naturalWidth)return c;
  const columns=id==='ember'?12:10,index=id==='ember'?123:(petSprites[id]||50)-1;g.drawImage(image,index%columns*16,Math.floor(index/columns)*16,16,16,0,0,32,32);
 }else{
  const armored=[1,3,5,6,8].includes(id),mage=[4,7].includes(id);
  if(mage){r(6,11,12,11,o);r(7,12,10,9,'#a42f50');r(9,8,7,5,o);r(10,9,5,3,'#eac1a5');r(5,7,14,2,'#e45a55');r(8,5,9,2,'#a42f50');r(10,3,5,2,'#a42f50');r(12,1,2,2,red);r(11,10,1,1,red);r(14,10,1,1,red);r(20,7,1,15,'#886951');r(19,3,3,5,red);r(20,4,1,2,'#fff1c5');if(id===7){r(5,14,2,6,'#ffb35e');r(17,14,2,6,'#ffb35e')}}
  else if(armored){const metal=id===1||id===6?'#d0c1ba':id===8?'#778894':'#9693a2';r(6,8,13,12,o);r(7,9,11,9,metal);r(8,3,10,8,o);r(9,4,8,6,metal);r(9,7,8,2,'#381b2d');r(10,7,2,1,red);r(14,7,2,1,red);r(7,19,4,3,metal);r(15,19,4,3,metal);r(2,9,5,9,o);r(3,10,3,6,'#a5333f');r(20,6,2,13,metal);r(18,6,6,3,metal);r(10,12,6,2,'#a5333f');if(id===6){r(8,1,2,3,'#ffd682');r(12,0,2,4,'#ffd682');r(16,1,2,3,'#ffd682')}}
  else if(id===11){r(7,5,11,16,o);r(8,6,9,6,'#9b4d55');r(10,8,5,3,'#dbc6ad');r(8,12,9,7,'#783541');r(8,20,3,2,o);r(15,20,3,2,o);r(20,5,1,14,'#f0af7b');r(22,8,1,8,'#f0af7b');r(19,11,5,1,red)}
  else if(id===0){r(5,13,15,7,'#853e65');r(7,10,11,3,'#b55b81');r(9,8,7,2,'#b55b81');r(8,14,3,2,red);r(15,14,3,2,red);r(9,18,8,1,o)}
  else if(id===2||id===10){r(9,8,7,9,'#81416a');for(let i=0;i<3;i++){r(2+i*2,5+i*3,6,3,'#ab5672');r(16,5+i*3,6-i*2,3,'#ab5672')}r(10,10,2,2,red);r(14,10,2,2,red);if(id===10){for(let i=0;i<3;i++){r(3,14+i*3,6,1,'#b77496');r(16,14+i*3,6,1,'#b77496')}}}
  else{r(5,7,15,14,o);r(6,8,13,11,'#8a7877');r(7,4,11,4,'#a59791');r(3,12,4,8,'#8a7877');r(19,12,4,8,'#8a7877');r(8,9,3,2,red);r(14,9,3,2,red);r(10,14,5,3,'#ff8b58')}
 }
 cache.set(key,c);return c;
}
function draw(ctx,group,id,x,y,size=44,flip=1,variant=0){ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(flip,1);ctx.imageSmoothingEnabled=false;ctx.drawImage(frame(group,id,variant),-size/2,-size/2,size,size);ctx.restore()}
window.RiftArt={draw,frame,heroSkins,classTiles,petSprites,get ready(){return heroAtlas.complete&&heroAtlas.naturalWidth>0&&petAtlas.complete&&petAtlas.naturalWidth>0}};})();
