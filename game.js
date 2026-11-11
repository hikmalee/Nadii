(()=>{
'use strict';
const $=id=>document.getElementById(id),canvas=$('game'),ctx=canvas.getContext('2d');
const preview=$('preview-canvas'),pctx=preview.getContext('2d');
const PAL={black:'#08090d',dark:'#171c23',mid:'#78818a',light:'#e8e5d7',lime:'#c8f36a',red:'#e77d86',blue:'#8bc8e8'};
const furColors=[['Ivory','#e8e5d7'],['Ash','#9299a0'],['Midnight','#343b49'],['Ginger','#d98a55'],['Mint','#8dbb9a'],['Lilac','#aa9bc7']];
const clothColors=[['None','#242b34'],['Forest','#527b59'],['Rose','#b9677e'],['Ocean','#4c7898'],['Gold','#b69a50'],['Violet','#80669f']];
const weapons=['Sword','Bow','Staff','Knives'],hats=['None','Cap','Crown','Wizard'],tails=['Short','Long','Fluffy'];
const cfg={fur:0,cloth:0,hat:0,tail:1,weapon:0};
let W=innerWidth,H=innerHeight,dpr=1;
function resize(){dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;canvas.width=Math.floor(W*dpr);canvas.height=Math.floor(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.imageSmoothingEnabled=false}addEventListener('resize',resize);resize();
const rand=(a,b)=>a+Math.random()*(b-a),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
let state='menu',player=null,enemies=[],orbs=[],shots=[],particles=[],camera={x:0,y:0},keys={},touch={},last=0,elapsed=0,spawnClock=0,phase=1,phaseKills=0,kills=0,level=1,xp=0,xpNeed=10,boss=null,upgrades=[],runId=0;
const powers=[
{name:'Quick Paws',desc:'Kecepatan bergerak +12%.',icon:'»',type:'passive',apply:p=>p.speed*=1.12},
{name:'Sharp Claws',desc:'Damage serangan +20%.',icon:'✦',type:'passive',apply:p=>p.damage*=1.2},
{name:'Magnet Charm',desc:'Jangkauan EXP orb +35%.',icon:'◎',type:'passive',apply:p=>p.magnet*=1.35},
{name:'Vitality',desc:'HP maksimum +25 dan pulihkan 25 HP.',icon:'♥',type:'passive',apply:p=>{p.maxHp+=25;p.hp=Math.min(p.maxHp,p.hp+25)}},
{name:'Rapid Rhythm',desc:'Kecepatan serangan +18%.',icon:'»»',type:'passive',apply:p=>p.fireRate*=.82},
{name:'Lucky Paws',desc:'Peluang critical hit meningkat.',icon:'✧',type:'passive',apply:p=>p.crit+=.12},
{name:'Orbiting Stars',desc:'Dua bintang berputar melukai musuh.',icon:'✷',type:'active',apply:p=>p.orbit+=2},
{name:'Frost Nova',desc:'Ledakan dingin berkala memperlambat musuh.',icon:'❄',type:'active',apply:p=>p.frost=true},
{name:'Thunder Call',desc:'Petir otomatis menyambar musuh terdekat.',icon:'ϟ',type:'active',apply:p=>p.thunder=true},
{name:'Shadow Clone',desc:'Bayangan membantu menyerang target.',icon:'◈',type:'active',apply:p=>p.clones++},
{name:'Soul Harvest',desc:'Musuh menjatuhkan EXP lebih banyak.',icon:'✧',type:'passive',apply:p=>p.xpBonus+=.35},
{name:'Second Chance',desc:'Pulihkan 1 HP setiap musuh dikalahkan.',icon:'+',type:'passive',apply:p=>p.regen+=1}
];
function drawCat(g,x,y,s=1,cfg0=cfg){g.save();g.translate(Math.round(x),Math.round(y));g.scale(s,s);const fur=furColors[cfg0.fur][1],cloth=clothColors[cfg0.cloth][1];g.fillStyle=PAL.dark;g.fillRect(-10,10,20,10);g.fillStyle=fur;
g.fillRect(-9,-8,18,22);g.fillRect(-12,-15,24,13);g.fillRect(-12,-22,6,10);g.fillRect(6,-22,6,10);
g.fillStyle=PAL.black;g.fillRect(-7,-13,3,3);g.fillRect(4,-13,3,3);g.fillRect(-1,-8,3,2);
g.fillStyle=cloth;g.fillRect(-10,2,20,8);g.fillRect(-8,9,6,5);g.fillRect(3,9,6,5);
g.fillStyle=fur;const tailLen=cfg0.tail===0?5:cfg0.tail===2?14:10;g.fillRect(9,7,tailLen,3);if(cfg0.tail===2){g.fillRect(17,4,5,8)}
if(cfg0.hat===1){g.fillStyle=cloth;g.fillRect(-12,-23,24,4);g.fillRect(-7,-29,14,7)}
if(cfg0.hat===2){g.fillStyle=PAL.lime;g.fillRect(-10,-27,20,5);g.fillRect(-6,-33,12,7);g.fillRect(-2,-37,4,4)}
if(cfg0.hat===3){g.fillStyle='#8c78bb';g.fillRect(-12,-24,24,4);g.fillRect(-5,-37,10,14)}
g.restore()}
function drawPreview(){pctx.fillStyle='#0b1015';pctx.fillRect(0,0,160,160);for(let i=0;i<8;i++){pctx.fillStyle=i%2?'#141c23':'#111820';pctx.fillRect(i*20,0,1,160);pctx.fillRect(0,i*20,160,1)}drawCat(pctx,80,91,3,cfg)}
function makePlayer(){return{x:0,y:0,r:10,hp:100,maxHp:100,speed:145,damage:14,fireRate:.65,fire:0,magnet:65,crit:.08,regen:0,xpBonus:0,orbit:0,frost:false,thunder:false,clones:0,invuln:0}}
function show(id){$(id).classList.remove('hidden')}function hide(id){$(id).classList.add('hidden')}
function toast(t){$('toast').textContent=t;show('toast');setTimeout(()=>hide('toast'),1500)}
function start(){runId++;player=makePlayer();enemies=[];orbs=[];shots=[];particles=[];camera={x:0,y:0};elapsed=0;spawnClock=0;phase=1;phaseKills=0;kills=0;level=1;xp=0;xpNeed=10;boss=null;state='play';hide('menu');hide('custom-screen');hide('gameover-screen');show('hud');if(matchMedia('(pointer:coarse)').matches)show('mobile-controls');last=performance.now();requestAnimationFrame(loop)}
function nearest(){let best=null,d=1e9;for(const e of enemies){let n=dist(player,e);if(n<d){d=n;best=e}}return best}
function spawnEnemy(type){let a=rand(0,Math.PI*2),r=rand(390,570),x=player.x+Math.cos(a)*r,y=player.y+Math.sin(a)*r;let data={dog:[30,8,48],crow:[18,6,78],bat:[14,5,100],wolf:[55,12,62],boar:[80,16,38],boss:[900,28,34]}[type];enemies.push({x,y,type,hp:data[0]+phase*2,maxHp:data[0]+phase*2,damage:data[1],speed:data[2]+phase*.5,r:type==='boss'?22: type==='wolf'||type==='boar'?13:9,hit:0,boss:type==='boss'})}
function spawnBoss(){boss={};spawnEnemy('boss');toast('BOSS APPROACHING!');}
function fire(){const e=nearest();if(!e)return;const a=Math.atan2(e.y-player.y,e.x-player.x),crit=Math.random()<player.crit,dmg=player.damage*(crit?2:1);const weapon=weapons[cfg.weapon].toLowerCase();
if(weapon==='sword'){if(dist(player,e)<58){e.hp-=dmg*1.25;e.hit=.12;burst(e.x,e.y,'#e8e5d7',5)}else return}
else if(weapon==='bow'){shots.push({x:player.x,y:player.y,vx:Math.cos(a)*390,vy:Math.sin(a)*390,life:1.5,dmg,kind:'arrow'})}
else if(weapon==='staff'){shots.push({x:player.x,y:player.y,vx:Math.cos(a)*260,vy:Math.sin(a)*260,life:2,dmg:dmg*1.35,kind:'magic'})}
else{for(let i=-1;i<=1;i++)shots.push({x:player.x,y:player.y,vx:Math.cos(a+i*.18)*420,vy:Math.sin(a+i*.18)*420,life:1,dmg:dmg*.7,kind:'knife'})}
}
function burst(x,y,color,n=8){for(let i=0;i<n;i++){let a=rand(0,Math.PI*2),v=rand(20,100);particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:rand(.2,.55),color})}}
function killEnemy(e){if(e.dead)return;e.dead=true;kills++;phaseKills++;for(let i=0;i<1+(Math.random()<.25?1:0);i++)orbs.push({x:e.x+rand(-8,8),y:e.y+rand(-8,8),v:1});if(player.regen)player.hp=Math.min(player.maxHp,player.hp+player.regen);burst(e.x,e.y,e.boss?'#e77d86':'#b7e96a',e.boss?24:8);if(e.boss){boss=null;toast('BOSS DEFEATED!')} }
function levelUp(){level++;xp-=xpNeed;xpNeed=Math.floor(xpNeed*1.35+5);state='level';const pool=[...powers].sort(()=>Math.random()-.5).slice(0,4);$('upgrade-list').innerHTML='';pool.forEach((u)=>{let b=document.createElement('button');b.className='upgrade';b.innerHTML='<div class="up-icon">'+u.icon+'</div><b>'+u.name+' · '+u.type.toUpperCase()+'</b><small>'+u.desc+'</small>';b.onclick=()=>{u.apply(player);state='play';hide('level-screen');toast(u.name+' unlocked')};$('upgrade-list').appendChild(b)});show('level-screen')}
function update(dt){if(state!=='play')return;elapsed+=dt;spawnClock+=dt;player.fire-=dt;player.invuln=Math.max(0,player.invuln-dt);
let dx=(keys.d||keys.ArrowRight?1:0)-(keys.a||keys.ArrowLeft?1:0)+(touch.right?1:0)-(touch.left?1:0),dy=(keys.s||keys.ArrowDown?1:0)-(keys.w||keys.ArrowUp?1:0)+(touch.down?1:0)-(touch.up?1:0),len=Math.hypot(dx,dy)||1;player.x+=dx/len*player.speed*dt;player.y+=dy/len*player.speed*dt;
if(spawnClock>Math.max(.28,1.05-phase*.035)){spawnClock=0;for(let i=0;i<1+Math.floor(phase/4);i++)spawnEnemy(['dog','crow','bat','wolf','boar'][Math.floor(Math.random()*Math.min(5,2+phase/2))])}
if(phaseKills>=12+(phase-1)*2&&!boss){phase++;phaseKills=0;if((phase-1)%10===0)spawnBoss();else toast('PHASE '+phase)}
if(player.fire<=0){fire();player.fire=player.fireRate}
for(const e of enemies){let a=Math.atan2(player.y-e.y,player.x-e.x),d=dist(player,e);let speed=e.speed*(player.frost?.72:1);if(d>player.r+e.r+4){e.x+=Math.cos(a)*speed*dt;e.y+=Math.sin(a)*speed*dt}if(d<player.r+e.r+3&&player.invuln<=0){player.hp-=e.damage;player.invuln=.55;burst(player.x,player.y,'#e77d86',5)}e.hit=Math.max(0,e.hit-dt)}
if(player.orbit){for(const e of enemies){if(dist(player,e)<34+player.orbit*5)e.hp-=player.orbit*dt*2}}
if(player.thunder&&Math.random()<dt*.7){let e=nearest();if(e){e.hp-=player.damage*1.5;burst(e.x,e.y,'#8bc8e8',8)}}
if(player.frost&&Math.random()<dt*.18)for(const e of enemies)if(dist(player,e)<140)e.slow=.5;
for(const s of shots){s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;for(const e of enemies)if(!e.dead&&dist(s,e)<e.r+5){e.hp-=s.dmg;s.life=0;e.hit=.1;burst(e.x,e.y,s.kind==='magic'?'#8bc8e8':'#e8e5d7',3);break}}
shots=shots.filter(s=>s.life>0);for(const e of enemies)if(e.hp<=0)killEnemy(e);enemies=enemies.filter(e=>!e.dead);
for(const o of orbs){let d=dist(player,o);if(d<player.magnet){let a=Math.atan2(player.y-o.y,player.x-o.x),v=160+player.magnet*2;o.x+=Math.cos(a)*v*dt;o.y+=Math.sin(a)*v*dt}if(d<15){o.got=true;xp+=1+player.xpBonus;if(xp>=xpNeed)levelUp()}}
orbs=orbs.filter(o=>!o.got);
for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt}particles=particles.filter(p=>p.life>0);
camera.x+=(player.x-W/2-camera.x)*Math.min(1,dt*7);camera.y+=(player.y-H/2-camera.y)*Math.min(1,dt*7);
if(player.hp<=0)gameOver();updateHud()}
function updateHud(){$('phase').textContent=phase;$('level').textContent=level;$('kills').textContent=kills;$('timer').textContent=fmt(elapsed);$('hpbar').style.width=clamp(player.hp/player.maxHp*100,0,100)+'%';$('hptext').textContent=Math.ceil(player.hp)+'/'+player.maxHp;$('expbar').style.width=clamp(xp/xpNeed*100,0,100)+'%';$('exptext').textContent=xp+'/'+xpNeed;$('weapon-chip').textContent=weapons[cfg.weapon].toUpperCase()+' · AUTO';if(boss){show('boss-ui');let e=enemies.find(x=>x.boss);if(e){$('bossbar').style.width=clamp(e.hp/e.maxHp*100,0,100)+'%'}}else hide('boss-ui')}
function fmt(t){let m=Math.floor(t/60),s=Math.floor(t%60);return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')}
function draw(){ctx.fillStyle=PAL.black;ctx.fillRect(0,0,W,H);let tile=32,ox=-((camera.x%tile)+tile)%tile,oy=-((camera.y%tile)+tile)%tile;ctx.fillStyle='#10151b';for(let y=oy;y<H;y+=tile)for(let x=ox;x<W;x+=tile){ctx.fillRect(x,y,1,1);if((Math.floor((x+camera.x)/tile)*13+Math.floor((y+camera.y)/tile)*7)%17===0){ctx.fillStyle='#1c242b';ctx.fillRect(x+8,y+8,3,3);ctx.fillStyle='#10151b'}}
ctx.save();ctx.translate(-camera.x,-camera.y);
for(const o of orbs){ctx.fillStyle='#b7e96a';ctx.fillRect(o.x-3,o.y-3,6,6);ctx.fillStyle='#e6f6a7';ctx.fillRect(o.x-1,o.y-1,2,2)}
for(const s of shots){ctx.fillStyle=s.kind==='magic'?'#8bc8e8':'#e8e5d7';ctx.fillRect(s.x-3,s.y-3,6,6)}
for(const e of enemies){ctx.fillStyle=e.hit>0?'#fff':e.boss?'#a24e63':({dog:'#9c765b',crow:'#59616d',bat:'#8b78a7',wolf:'#a4a8aa',boar:'#a97950'}[e.type]);let x=Math.round(e.x),y=Math.round(e.y),r=e.r;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.fillStyle='#08090d';ctx.fillRect(x-r/2,y-3,3,3);ctx.fillRect(x+r/2-2,y-3,3,3);if(e.boss){ctx.fillStyle='#e77d86';ctx.fillRect(x-24,y-r-10,48,4);ctx.fillStyle='#e8e5d7';ctx.fillRect(x-24,y-r-10,48*e.hp/e.maxHp,4)}}
for(const p of particles){ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,3,3)}
if(player){if(player.invuln<=0||Math.floor(elapsed*14)%2===0)drawCat(ctx,player.x,player.y,2.2);if(player.orbit){for(let i=0;i<player.orbit;i++){let a=elapsed*2+i*Math.PI*2/player.orbit;ctx.fillStyle='#c8f36a';ctx.fillRect(player.x+Math.cos(a)*35-3,player.y+Math.sin(a)*35-3,6,6)}}}
ctx.restore();
ctx.fillStyle='#c8f36a';ctx.font='9px monospace';ctx.fillText('X '+Math.floor(player?.x||0)+'  Y '+Math.floor(player?.y||0),W-110,H-15)}
function loop(now){if(state==='menu'||state==='gameover')return;let dt=Math.min((now-last)/1000,.04);last=now;if(state==='play')update(dt);draw();if(state!=='menu'&&state!=='gameover')requestAnimationFrame(loop)}
function gameOver(){state='gameover';hide('hud');hide('mobile-controls');$('result-phase').textContent=phase;$('result-level').textContent=level;$('result-kills').textContent=kills;show('gameover-screen')}
function pause(){if(state==='play'){state='pause';show('pause-screen')}else if(state==='pause'){state='play';hide('pause-screen');last=performance.now();requestAnimationFrame(loop)}}
function renderOptions(){function swatches(id,arr,key){$(id).innerHTML='';arr.forEach((it,i)=>{let b=document.createElement('button');b.className='swatch'+(cfg[key]===i?' selected':'');b.style.background=it[1];b.title=it[0];b.onclick=()=>{cfg[key]=i;renderOptions()};$(id).appendChild(b)})}swatches('fur-options',furColors,'fur');swatches('cloth-options',clothColors,'cloth');function choices(id,arr,key){$(id).innerHTML='';arr.forEach((it,i)=>{let b=document.createElement('button');b.className='choice'+(cfg[key]===i?' selected':'');b.textContent=it;b.onclick=()=>{cfg[key]=i;renderOptions()};$(id).appendChild(b)})}choices('hat-options',hats,'hat');choices('tail-options',tails,'tail');$('weapon-options').innerHTML='';weapons.forEach((w,i)=>{let b=document.createElement('button');b.className='weapon-choice'+(cfg.weapon===i?' selected':'');b.textContent=['⚔ SWORD','➶ BOW','✧ STAFF','⁙ KNIVES'][i];b.onclick=()=>{cfg.weapon=i;renderOptions()};$('weapon-options').appendChild(b)});drawPreview()}
$('customize-btn').onclick=()=>{hide('menu');show('custom-screen');renderOptions()};$('close-custom').onclick=()=>{hide('custom-screen');show('menu')};$('save-custom').onclick=()=>{localStorage.setItem('nadii-cat-config',JSON.stringify(cfg));hide('custom-screen');show('menu');toast('Tampilan kucing disimpan')};
try{Object.assign(cfg,JSON.parse(localStorage.getItem('nadii-cat-config')||'{}'))}catch(e){}
$('start-btn').onclick=start;$('again-btn').onclick=start;$('home-btn').onclick=()=>{hide('gameover-screen');show('menu');state='menu'};$('pause-btn').onclick=pause;$('resume-btn').onclick=pause;$('quit-btn').onclick=()=>{hide('pause-screen');hide('hud');hide('mobile-controls');show('menu');state='menu'};addEventListener('keydown',e=>{keys[e.key]=true;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();if(e.key==='Escape')pause()});addEventListener('keyup',e=>keys[e.key]=false);
document.querySelectorAll('[data-dir]').forEach(b=>{let d=b.dataset.dir;b.addEventListener('pointerdown',e=>{e.preventDefault();touch[d]=true});['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,()=>touch[d]=false))});
drawPreview();
})();