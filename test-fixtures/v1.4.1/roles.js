/* Riftward 1.4.1: detailed original Kenney hero sprites; 1.4 enemy/pet art retained. */
(()=>{'use strict';const cache=new Map(),palettes=['#52cfdd','#81a5ef','#7fe3ad','#b69af0','#e9b276','#c2a3fa','#83dfcb','#e9abc7','#b2d88a','#ed9ab0','#9bbbcf','#e7cc83'];
const heroSkins=Object.freeze([{id:'class',tile:84},{id:'mage',tile:84},{id:'knight',tile:96},{id:'ranger',tile:112},{id:'sage',tile:100},{id:'shadow',tile:98},{id:'cleric',tile:88},{id:'duelist',tile:97},{id:'forest',tile:111},{id:'crimson',tile:99},{id:'wanderer',tile:85},{id:'royal',tile:87}].map(Object.freeze));
const classTiles=Object.freeze({warrior:96,mage:84,ranger:112,necromancer:100});
const heroAtlas=new Image();heroAtlas.onload=()=>{for(const k of cache.keys())if(k.startsWith('hero:'))cache.delete(k);window.dispatchEvent(new Event('riftartready'))};heroAtlas.src='art/dungeon.png';
function frame(group,id,variant=0){const key=[group,id,variant].join(':');if(cache.has(key))return cache.get(key);const c=document.createElement('canvas');c.width=c.height=group==='hero'?32:24;const g=c.getContext('2d');g.imageSmoothingEnabled=false;const r=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h)},o='#091725',white='#e3f9ff',red='#ff584b';
 if(group==='hero'){
  // Original detailed Kenney characters: different faces, clothing and silhouettes.
  const skin=heroSkins[variant]||heroSkins[0],tile=variant===0?(classTiles[id]||84):skin.tile;
  if(!heroAtlas.complete||!heroAtlas.naturalWidth)return c;
  g.drawImage(heroAtlas,tile%12*16,Math.floor(tile/12)*16,16,16,0,0,32,32);
 }else if(group==='pet'){
  const tier=Number(variant)||1,role=['spirit','iron','aegis'].includes(id)?'defender':['moth','moss','raven'].includes(id)?'buffer':'fighter',a=role==='defender'?'#83d9ff':role==='buffer'?'#a7f2ae':'#8ff3e1';
  r(7,7,10,11,o);r(8,8,8,9,a);r(10,10,4,4,white);r(11,11,2,2,'#164f7b');r(9,18,6,2,a);
  if(id==='spark'){r(11,1,2,5,'#fff3ac');r(11,20,2,3,'#fff3ac');r(3,11,3,2,a);r(18,11,3,2,a)}
  if(id==='ember'){r(5,3,5,6,'#efbc9e');r(15,3,5,6,'#efbc9e');r(6,4,3,3,'#f39b8b');r(16,4,3,3,'#f39b8b');r(17,16,5,2,'#f5d2c5');r(21,14,2,3,'#f5d2c5');r(8,9,8,8,'#db946e');r(10,11,1,1,o);r(14,11,1,1,o);r(12,14,2,1,'#ffe1df')}
  if(id==='storm'){r(2,7,5,7,'#a6b9ff');r(17,7,5,7,'#a6b9ff');r(0,5,3,6,'#829aeb');r(21,5,3,6,'#829aeb');r(7,4,3,4,a);r(14,4,3,4,a);r(10,18,4,4,a)}
  if(id==='spirit'){r(7,17,3,4,a);r(11,17,3,6,a);r(15,17,3,4,a);r(5,10,3,5,a);r(16,10,3,5,a)}
  if(id==='iron'){r(3,5,4,12,'#becfe2');r(17,5,4,12,'#becfe2');r(8,7,8,2,'#ebf8ff');r(6,18,3,3,a);r(15,18,3,3,a)}
  if(id==='aegis'){r(3,4,18,3,'#f1d389');r(4,7,3,10,a);r(17,7,3,10,a);r(6,17,3,3,a);r(15,17,3,3,a);r(9,20,6,2,'#f1d389')}
  if(id==='moth'){r(1,5,6,7,'#dda8fa');r(17,5,6,7,'#dda8fa');r(3,13,4,6,'#a2cfff');r(17,13,4,6,'#a2cfff');r(9,4,2,3,a);r(14,4,2,3,a)}
  if(id==='moss'){r(2,7,6,5,'#74be7e');r(16,7,6,5,'#74be7e');r(8,3,5,4,'#c1ed95');r(5,16,3,4,'#87a96b');r(16,16,3,4,'#87a96b')}
  if(id==='raven'){r(2,8,6,8,'#7ca2cf');r(16,8,6,8,'#7ca2cf');r(8,5,9,4,'#8aaedd');r(15,10,5,2,'#ffe4a1');r(11,18,4,4,'#93b9e8');r(11,10,1,1,white)}
  for(let i=0;i<tier;i++)r(9+i*3,3,2,2,'#ffecb2');if(tier===3){r(2,18,4,2,white);r(18,18,4,2,white)}
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
window.RiftArt={draw,frame,heroSkins,classTiles,get ready(){return heroAtlas.complete&&heroAtlas.naturalWidth>0}};})();
