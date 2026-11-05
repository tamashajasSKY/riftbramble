/* Original vector skill illustrations; offline, no atlas tile substitutions. */
(()=>{'use strict';const cache=new Map();
const art={
nova:['#cba5ff','M32 10 L38 24 L54 32 L38 39 L32 54 L25 39 L10 32 L25 24 Z','M32 3 V8 M32 56 V61 M3 32 H8 M56 32 H61'],
blade:['#a6eaff','M37 10 L48 7 L45 20 L27 41 L22 36 Z M19 35 L30 46 M23 41 L16 49','M12 33 A22 22 0 0 1 35 11 M50 32 A22 22 0 0 1 29 53'],
lightning:['#ffe18a','M35 6 L20 32 H31 L25 56 L46 27 H34 Z','M17 16 L8 24 L16 29 M46 39 L55 45 L49 53'],
frost:['#9cedff','M32 12 V52 M15 22 L49 42 M15 42 L49 22 M26 16 L32 22 L38 16 M26 48 L32 42 L38 48','M11 15 A27 27 0 0 0 12 50 M53 15 A27 27 0 0 1 52 50'],
fire:['#ffa665','M32 8 Q46 22 39 28 Q48 23 48 37 Q48 53 32 54 Q13 52 16 37 Q17 28 25 22 Q20 34 29 35 Q35 24 32 8 Z','M24 48 Q21 38 32 32 Q29 43 38 40 Q43 50 32 51 Z'],
poison:['#b8f389','M14 39 Q5 29 17 23 Q15 11 28 17 Q36 7 44 21 Q59 20 53 34 Q62 46 47 48 H20 Q9 48 14 39 Z','M25 29 V34 M39 29 V34 M27 40 Q32 35 37 40 M19 54 V58 M46 53 V59'],
sanctuary:['#acffe0','M32 16 L48 23 V36 Q47 47 32 54 Q17 47 16 36 V23 Z','M32 25 V43 M24 34 H40 M13 14 L19 8 M45 8 L51 14 M7 48 H14 M50 48 H57'],
iceSpear:['#b0eeff','M49 6 L53 23 L40 22 L14 53 L9 48 L36 18 L34 10 Z','M15 14 L11 24 M23 10 L20 20 M41 45 L36 55'],
meteor:['#ffbd7d','M48 8 L41 32 L33 43 L18 35 Z M56 18 L49 38 L40 47 L34 42 Z M32 33 Q47 39 38 51 Q28 60 18 49 Q11 36 24 32 Z','M8 54 Q29 66 51 54 M26 38 L34 41 L31 48 L23 46 Z'],
explosive:['#ffae91','M30 14 L34 25 L46 18 L42 30 L56 34 L43 39 L48 51 L35 46 L29 58 L25 44 L12 47 L19 35 L8 28 L23 27 Z','M13 11 L28 26 M8 16 L23 31'],
areaSize:['#c7acff','M32 19 L45 32 L32 45 L19 32 Z','M9 22 V9 H22 M42 9 H55 V22 M55 42 V55 H42 M22 55 H9 V42'],
skillRate:['#dfbaff','M23 12 H42 L30 31 H42 L23 53 L28 35 H18 Z','M13 18 A25 25 0 0 0 12 48 M51 46 A25 25 0 0 0 51 16 M45 15 H53 V23'],
warrior:['#ffe1a1','M19 45 L43 10 L50 9 L50 17 L26 49 Z M16 38 L32 50 M23 45 L17 54','M11 22 Q7 10 20 7 M48 31 Q59 36 54 48'],
mage:['#d0b0ff','M32 8 L48 32 L32 53 L16 32 Z M32 19 L39 32 L32 42 L25 32 Z','M8 16 L12 20 M52 45 L57 49 M51 10 L55 6 M7 48 L12 44'],
ranger:['#adf4bd','M22 9 Q53 31 22 55 L32 32 Z','M9 32 H54 M44 22 L55 32 L44 42 M22 9 L22 55'],
necromancer:['#c8b2ff','M20 25 Q20 11 33 11 Q48 11 48 25 L44 35 V44 H24 V35 Z M25 44 V52 H40 V44','M27 23 V29 M40 23 V29 M31 35 H36 M12 37 L6 44 M51 40 L58 47']
};
const aliases={evoShards:'frost',evoComet:'meteor',evoStorm:'lightning',warriorMastery:'warrior',mageMastery:'mage',rangerMastery:'ranger',necroMastery:'necromancer',classSkill:'mage'};
function frame(id){id=aliases[id]||id;if(!art[id])return null;if(cache.has(id))return cache.get(id);const c=document.createElement('canvas');c.width=c.height=96;c.className='sprite-icon skill-art';const g=c.getContext('2d');g.scale(1.5,1.5);const [col,body,detail]=art[id];const grad=g.createRadialGradient(30,25,2,32,32,30);grad.addColorStop(0,col+'30');grad.addColorStop(1,'#081522');g.fillStyle=grad;g.beginPath();g.roundRect(2,2,60,60,12);g.fill();g.strokeStyle=col+'65';g.lineWidth=1;g.stroke();g.lineJoin='round';g.lineCap='round';g.shadowColor=col;g.shadowBlur=5;g.fillStyle=col+'44';g.strokeStyle=col;g.lineWidth=2;const p=new Path2D(body);g.fill(p);g.stroke(p);g.shadowBlur=0;g.strokeStyle='#edfbff';g.lineWidth=1.7;g.stroke(new Path2D(detail));cache.set(id,c);return c}
function icon(id,label){const src=frame(id);if(!src)return null;const c=src.cloneNode();c.getContext('2d').drawImage(src,0,0);c.setAttribute('role','img');c.setAttribute('aria-label',label||id);return c}
window.SkillArt={frame,icon,ids:Object.keys(art)};})();
