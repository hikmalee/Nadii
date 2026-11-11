(() => {
"use strict";
const $ = id => document.getElementById(id);
const screens = ["menu-screen","creator-screen","game-screen"];
const show = id => screens.forEach(s => $(s).classList.toggle("hidden",s!==id));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rand=(a,b)=>Math.random()*(b-a)+a;
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const saved = (()=>{try{return JSON.parse(localStorage.getItem("ss_profile")||"{}")}catch{return {}}})();
const defaults={name:"THE WANDERER",class:"wanderer",skin:"#d6a078",hair:"short",hairColor:"#25202b",armor:"leather",armorColor:"#596d78",accessory:"none",weapon:"sword"};
let profile={...defaults,...saved};


// 0x72 Dungeon Tileset: individual 16x16 pixel-art sprites.
const ASSET_BASE = "assets/";
const art = {};
function loadArt(key, path) {
  const img = new Image();
  img.src = ASSET_BASE + path;
  art[key] = { img, ready:false };
  img.onload = () => { art[key].ready=true; if(typeof renderPreviews==="function") renderPreviews(); };
  img.onerror = () => console.warn("Asset belum ditemukan:", img.src);
}
[
 ["knight","characters/knight_blue.png"],
 ["knight2","characters/knight_yellow.png"],
 ["paladin","characters/paladin.png"],
 ["goblin","enemies/goblin.png"],["orc","enemies/orc.png"],
 ["skeleton","enemies/skeleton.png"],["zombie","enemies/zombie.png"],
 ["bat","enemies/bat.png"],["imp","enemies/imp.png"],
 ["demon","enemies/demon.png"],["fire","enemies/fire_elemental.png"],
 ["floor","environment/floor.png"],["floorMud","environment/floor_mud.png"],
 ["floorLight","environment/floor_light.png"],
 ["sword","items/sword_steel.png"],["potion","items/potion_red.png"],
 ["chest","items/chest.png"]
].forEach(([key,path])=>loadArt(key,path));
function drawArt(ctx,key,x,y,w,h,flip=false) {
  const a=art[key]; if(!a || !a.ready) return false;
  ctx.save();
  if(flip){ctx.translate(x+w,y);ctx.scale(-1,1);ctx.drawImage(a.img,0,0,w,h);}
  else ctx.drawImage(a.img,x,y,w,h);
  ctx.restore(); return true;
}
function drawPreviewSprite(ctx,w,h) {
  ctx.clearRect(0,0,w,h);
  const key=profile.class==="knight"?"knight":profile.class==="mage"?"paladin":"knight";
  const size=Math.min(w*.58,h*.64);
  if(!drawArt(ctx,key,(w-size)/2,(h-size)/2+8,size,size*1.25)) drawHero(ctx,w,h,profile,2.15);
}
const skins=["#f1c7a1","#d6a078","#a96e4d","#704632","#e6b7a0"];
const hairs=["#211c28","#70412c","#c18b43","#d8d8df","#8b354e","#435c82"];
const armorColors=["#596d78","#a83f4c","#3d527e","#4b775e","#9b7842","#5c536f"];
let currentRun=null, raf=0, last=0, keys={}, pointer={x:0,y:0,active:false};
const previewCanvas=$("preview-canvas"),creatorCanvas=$("creator-canvas");
function drawHero(ctx,w,h,p,scale=1){
  ctx.clearRect(0,0,w,h);ctx.save();ctx.translate(w/2,h*.56);ctx.scale(scale,scale);
  ctx.fillStyle="#05070b66";ctx.beginPath();ctx.ellipse(0,50,35,10,0,0,Math.PI*2);ctx.fill();
  // cape
  ctx.fillStyle=p.armorColor;ctx.beginPath();ctx.moveTo(-15,-5);ctx.lineTo(-27,36);ctx.lineTo(0,29);ctx.lineTo(23,36);ctx.lineTo(15,-5);ctx.closePath();ctx.fill();
  // legs and boots
  ctx.fillStyle="#252b38";ctx.fillRect(-13,20,10,24);ctx.fillRect(3,20,10,24);
  ctx.fillStyle="#111722";ctx.fillRect(-16,40,14,8);ctx.fillRect(2,40,14,8);
  // body armor
  ctx.fillStyle=p.armorColor;ctx.fillRect(-20,-13,40,39);
  ctx.fillStyle="#d3ad69";ctx.fillRect(-3,-10,6,31);
  // arms
  ctx.fillStyle=p.skin;ctx.fillRect(-27,-8,9,27);ctx.fillRect(18,-8,9,27);
  // head
  ctx.fillStyle=p.skin;ctx.beginPath();ctx.arc(0,-27,17,0,Math.PI*2);ctx.fill();
  // hair styles
  ctx.fillStyle=p.hairColor;
  if(p.hair==="long"){ctx.beginPath();ctx.arc(0,-32,19,Math.PI,Math.PI*2);ctx.fill();ctx.fillRect(-18,-33,7,31);ctx.fillRect(11,-33,7,31)}
  else if(p.hair==="spike"){ctx.beginPath();ctx.moveTo(-17,-31);ctx.lineTo(-16,-47);ctx.lineTo(-5,-38);ctx.lineTo(1,-51);ctx.lineTo(7,-38);ctx.lineTo(17,-45);ctx.lineTo(18,-25);ctx.closePath();ctx.fill()}
  else {ctx.beginPath();ctx.arc(0,-32,18,Math.PI,Math.PI*2);ctx.fill();ctx.fillRect(-17,-34,34,7)}
  // face
  ctx.fillStyle="#24202a";ctx.fillRect(-7,-28,3,3);ctx.fillRect(5,-28,3,3);ctx.fillStyle="#8e4f4b";ctx.fillRect(-3,-19,6,2);
  // accessory
  if(p.accessory==="hood"){ctx.strokeStyle="#202938";ctx.lineWidth=7;ctx.beginPath();ctx.arc(0,-28,21,Math.PI,Math.PI*2);ctx.stroke()}
  if(p.accessory==="horns"){ctx.fillStyle="#d9dce4";ctx.beginPath();ctx.moveTo(-13,-39);ctx.lineTo(-22,-53);ctx.lineTo(-7,-43);ctx.moveTo(13,-39);ctx.lineTo(22,-53);ctx.lineTo(7,-43);ctx.fill()}
  // weapon
  ctx.strokeStyle=p.weapon==="staff"?"#9c79ee":"#c7d0db";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(27,18);ctx.lineTo(39,-28);ctx.stroke();
  ctx.fillStyle=p.weapon==="staff"?"#8c75ee":"#d7dce5";ctx.beginPath();ctx.arc(39,-29,5,0,Math.PI*2);ctx.fill();
  ctx.restore();
}
function renderPreviews(){drawPreviewSprite(previewCanvas.getContext("2d"),220,250);drawPreviewSprite(creatorCanvas.getContext("2d"),260,300);$("preview-name").textContent=profile.name.toUpperCase();$("creator-name").textContent=profile.name.toUpperCase();$("preview-meta").textContent=profile.class.toUpperCase()+" • CUSTOM SURVIVOR";$("name-input").value=profile.name}
function buildSwatches(id,values,key){const box=$(id);box.innerHTML="";values.forEach(v=>{const b=document.createElement("button");b.className="swatch";b.style.background=v;b.title=v;if(profile[key]===v)b.classList.add("active");b.onclick=()=>{profile[key]=v;buildSwatches(id,values,key);renderPreviews()};box.append(b)})}
function buildChoices(id,values,key){const box=$(id);box.innerHTML="";values.forEach(([v,label])=>{const b=document.createElement("button");b.className="choice"+(profile[key]===v?" active":"");b.textContent=label;b.onclick=()=>{profile[key]=v;buildChoices(id,values,key);renderPreviews()};box.append(b)})}
function initCreator(){
  buildSwatches("skin-swatches",skins,"skin");buildSwatches("hair-swatches",hairs,"hairColor");buildSwatches("armor-swatches",armorColors,"armorColor");
  buildChoices("hair-choices",[["short","SHORT"],["long","LONG"],["spike","SPIKE"]],"hair");
  buildChoices("armor-choices",[["leather","LEATHER"],["plate","PLATE"],["robe","ROBE"]],"armor");
  buildChoices("accessory-choices",[["none","NONE"],["hood","HOOD"],["horns","HORNS"]],"accessory");
  $("class-select").value=profile.class;$("weapon-select").value=profile.weapon;renderPreviews();
}
$("class-select").onchange=e=>{profile.class=e.target.value;renderPreviews()};
$("weapon-select").onchange=e=>{profile.weapon=e.target.value;renderPreviews()};
$("name-input").oninput=e=>{profile.name=e.target.value.trim().slice(0,16)||"SURVIVOR";renderPreviews()};
$("customize-btn").onclick=()=>{initCreator();show("creator-screen")};
$("back-menu").onclick=()=>show("menu-screen");
$("save-character").onclick=()=>{localStorage.setItem("ss_profile",JSON.stringify(profile));renderPreviews();show("menu-screen")};
$("start-btn").onclick=()=>startGame();
$("best-time").textContent=fmt(Number(localStorage.ss_bestTime||0));$("best-level").textContent=localStorage.ss_bestLevel||1;$("souls").textContent=localStorage.ss_souls||0;
function fmt(sec){return String(Math.floor(sec/60)).padStart(2,"0")+":"+String(Math.floor(sec%60)).padStart(2,"0")}
const canvas=$("game-canvas"),ctx=canvas.getContext("2d");
function resize(){const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.floor(innerWidth*dpr);canvas.height=Math.floor(innerHeight*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);if(currentRun){currentRun.w=innerWidth;currentRun.h=innerHeight}}
addEventListener("resize",resize);resize();
function startGame(){
  cancelAnimationFrame(raf);show("game-screen");$("levelup-modal").classList.add("hidden");$("pause-modal").classList.add("hidden");$("gameover-modal").classList.add("hidden");
  const classStats={wanderer:[100,190,13,1],knight:[140,165,15,.9],rogue:[85,245,11,1.35],mage:[90,180,19,.95]};
  const st=classStats[profile.class]||classStats.wanderer;
  currentRun={w:innerWidth,h:innerHeight,time:0,wave:1,level:1,xp:0,xpNeed:30,hp:st[0],maxHp:st[0],speed:st[1],damage:st[2],attackRate:st[3],attackCd:0,manualCd:0,dashCd:0,dashTime:0,invuln:0,player:{x:innerWidth/2,y:innerHeight/2,anim:"idle",animTime:0,facing:1,attackAnim:0,hurtAnim:0},enemies:[],shots:[],particles:[],kills:0,spawnCd:0,auto:true,paused:false,upgrades:{damage:0,speed:0,rate:0,maxhp:0,magnet:0},souls:0};
  $("hud-name").textContent=profile.name.toUpperCase();$("hud-class").textContent=profile.class.toUpperCase();last=performance.now();raf=requestAnimationFrame(loop);
}
function spawnEnemy(){const r=currentRun,edge=Math.floor(rand(0,4));let x,y;if(edge===0){x=rand(0,r.w);y=-30}else if(edge===1){x=r.w+30;y=rand(0,r.h)}else if(edge===2){x=rand(0,r.w);y=r.h+30}else{x=-30;y=rand(0,r.h)}
 const tough= Math.random()<Math.min(.25,r.time/180);r.enemies.push({x,y,r:tough?19:13,hp:tough?42:22,max:tough?42:22,speed:tough?34:50,damage:tough?14:8,xp:tough?12:7,tough,flash:0,animTime:0,anim:"idle",facing:1,dead:false,sprite:["goblin","skeleton","zombie","bat","imp","orc"][Math.floor(Math.random()*6)]})}
function nearest(){const r=currentRun,p=r.player;let best=null,bd=Infinity;for(const e of r.enemies){const d=dist(p,e);if(d<bd){bd=d;best=e}}return best}
function fire(manual=false){const r=currentRun;if(!r||r.paused||$("levelup-modal").classList.contains("hidden")===false)return;const target=nearest();if(!target)return;
 const dx=target.x-r.player.x,dy=target.y-r.player.y,len=Math.hypot(dx,dy)||1;const spread=manual?0:rand(-.035,.035);
 r.shots.push({x:r.player.x,y:r.player.y,vx:dx/len*430+spread*430,vy:dy/len*430,damage:r.damage*(manual?1.45:1),life:1.2,manual});
 if(manual){r.manualCd=.25;r.player.anim="attack1";r.player.attackAnim=.42}}
function damageEnemy(e,d){e.hp-=d;e.flash=.08;if(e.hp<=0){const r=currentRun;r.kills++;r.souls++;r.xp+=e.xp;for(let i=0;i<5;i++)r.particles.push({x:e.x,y:e.y,vx:rand(-80,80),vy:rand(-80,80),life:.4,color:"#d6b15e"});r.enemies.splice(r.enemies.indexOf(e),1);if(r.xp>=r.xpNeed)levelUp()}}
function levelUp(){const r=currentRun;if(!r||!$("levelup-modal").classList.contains("hidden"))return;r.level++;r.xp-=r.xpNeed;r.xpNeed=Math.floor(r.xpNeed*1.32+8);r.paused=true;
 const choices=[
  ["MIGHT","Increase damage by 25%.",()=>{r.damage*=1.25;r.upgrades.damage++}],
  ["SWIFTNESS","Move 12% faster.",()=>{r.speed*=1.12;r.upgrades.speed++}],
  ["QUICK HANDS","Attack cooldown improves by 15%.",()=>{r.attackRate*=1.15;r.upgrades.rate++}],
  ["VITALITY","Restore 35 HP and increase max HP by 15.",()=>{r.maxHp+=15;r.hp=Math.min(r.maxHp,r.hp+35);r.upgrades.maxhp++}],
  ["SOUL MAGNET","Gain extra EXP from fallen enemies.",()=>{r.upgrades.magnet++;r.xpNeed=Math.max(10,r.xpNeed-4)}]
 ].sort(()=>Math.random()-.5).slice(0,3);
 $("upgrade-options").innerHTML="";choices.forEach(([name,desc,apply])=>{const b=document.createElement("button");b.className="upgrade-card";b.innerHTML=`<b>${name}</b><span>${desc}</span>`;b.onclick=()=>{apply();r.paused=false;$("levelup-modal").classList.add("hidden");updateHud()};$("upgrade-options").append(b)});
 $("levelup-modal").classList.remove("hidden");
}
function updateHud(){const r=currentRun;if(!r)return;$("hp-fill").style.width=(r.hp/r.maxHp*100)+"%";$("hp-text").textContent=Math.ceil(r.hp)+"/"+r.maxHp;$("exp-fill").style.width=(r.xp/r.xpNeed*100)+"%";$("level-text").textContent="LV "+r.level;$("timer").textContent=fmt(r.time);$("wave").textContent=r.wave}
function loop(now){if(!currentRun)return;const dt=Math.min((now-last)/1000,.04);last=now;const r=currentRun;if(!r.paused)update(dt);render();updateHud();if(currentRun)raf=requestAnimationFrame(loop)}
function update(dt){
 const r=currentRun,p=r.player;r.time+=dt;r.wave=1+Math.floor(r.time/45);r.attackCd-=dt;r.manualCd-=dt;r.dashCd-=dt;r.dashTime-=dt;r.invuln-=dt;r.spawnCd-=dt;
 let mx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),my=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);const ml=Math.hypot(mx,my)||1;mx/=ml;my/=ml;
 if(r.dashTime>0){p.x+=mx*r.speed*3*dt;p.y+=my*r.speed*3*dt}else{p.x+=mx*r.speed*dt;p.y+=my*r.speed*dt}
 p.x=clamp(p.x,18,r.w-18);p.y=clamp(p.y,18,r.h-18);if(mx!==0)p.facing=mx<0?-1:1;p.animTime+=dt;if(p.attackAnim>0)p.attackAnim-=dt;else if(Math.abs(mx)+Math.abs(my)>.05)p.anim="walk";else p.anim="idle";
 if(keys.shift&&r.dashCd<=0){r.dashTime=.16;r.dashCd=1.5;r.invuln=.25;keys.shift=false}
 if(keys.space&&r.manualCd<=0)fire(true);
 if(r.attackCd<=0){fire(false);r.attackCd=1/(r.attackRate*(1+r.upgrades.rate*.1));if(r.enemies.length){p.anim="attack2";p.attackAnim=.34}}
 if(r.spawnCd<=0){spawnEnemy();if(Math.random()<Math.min(.75,r.time/120))spawnEnemy();r.spawnCd=Math.max(.24,.9-r.time*.002)}
 for(const e of [...r.enemies]){const dx=p.x-e.x,dy=p.y-e.y,l=Math.hypot(dx,dy)||1;e.animTime+=dt;e.facing=dx<0?-1:1;e.anim=l>e.r+20?"walk":"attack1";e.x+=dx/l*e.speed*dt;e.y+=dy/l*e.speed*dt;if(l<e.r+13&&r.invuln<=0){r.hp-=e.damage*dt;r.invuln=.08;if(r.hp<=0){endGame();return}}}
 for(const s of [...r.shots]){s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;for(const e of [...r.enemies])if(Math.hypot(s.x-e.x,s.y-e.y)<e.r+5){damageEnemy(e,s.damage);s.life=0;break}if(s.life<=0)r.shots.splice(r.shots.indexOf(s),1)}
 for(const q of [...r.particles]){q.x+=q.vx*dt;q.y+=q.vy*dt;q.life-=dt;if(q.life<=0)r.particles.splice(r.particles.indexOf(q),1)}
 if(r.xp>=r.xpNeed)levelUp();
}
function render(){
 const r=currentRun;if(!r)return;const w=innerWidth,h=innerHeight;ctx.clearRect(0,0,w,h);
 // Repeat the 16x16 dungeon floor texture across the arena.
 const floor=art.floor;
 if(floor && floor.ready){
   for(let y=0;y<h;y+=32) for(let x=0;x<w;x+=32) ctx.drawImage(floor.img,x,y,32,32);
 } else {ctx.fillStyle="#211e25";ctx.fillRect(0,0,w,h)}
 // Subtle dark vignette and arena rings.
 const shade=ctx.createRadialGradient(w/2,h/2,80,w/2,h/2,Math.max(w,h)*.7);
 shade.addColorStop(0,"#00000000");shade.addColorStop(1,"#08070dbb");ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);
 // subtle arena rings
 ctx.strokeStyle="#263847";ctx.beginPath();ctx.arc(r.player.x,r.player.y,150,0,Math.PI*2);ctx.stroke();
 for(const e of r.enemies){const esize=e.tough?58:48;ctx.save();if(e.flash>0)ctx.globalAlpha=.55;drawArt(ctx,e.tough?"demon":e.sprite,e.x-esize/2,e.y-esize/2,esize,esize,e.facing<0);ctx.restore();ctx.fillStyle="#24151d";ctx.fillRect(e.x-17,e.y-26,34,4);ctx.fillStyle="#d94c5c";ctx.fillRect(e.x-17,e.y-26,34*clamp(e.hp/e.max,0,1),4)}
 for(const s of r.shots){ctx.fillStyle=s.manual?"#f3df9b":"#9ac7f3";ctx.beginPath();ctx.arc(s.x,s.y,s.manual?5:4,0,Math.PI*2);ctx.fill()}
 for(const q of r.particles){ctx.globalAlpha=clamp(q.life/.4,0,1);ctx.fillStyle=q.color;ctx.fillRect(q.x,q.y,3,3)}ctx.globalAlpha=1;
 ctx.save();if(r.invuln>0)ctx.globalAlpha=.55;
 const ps=r.player, psize=58;
 const charKey=profile.class==="mage"?"paladin":profile.class==="knight"?"knight2":"knight";
 const bob=ps.anim==="walk"?Math.sin(ps.animTime*12)*3:Math.sin(ps.animTime*3)*1.5;
 drawArt(ctx,charKey,ps.x-psize/2,ps.y-psize/2+bob,psize,psize*1.25,ps.facing<0);
 // Steel sword follows the character's facing direction.
 const swordX=ps.x+(ps.facing>0?13:-29), swordY=ps.y-19+(ps.attackAnim>0?-10:0);
 drawArt(ctx,"sword",swordX,swordY,16,32,ps.facing<0);
 // Weapon glint while attacking.
 if(ps.attackAnim>0){ctx.strokeStyle="#f5d77d";ctx.lineWidth=3;ctx.beginPath();ctx.arc(ps.x+ps.facing*24,ps.y-5,24,-.9,.9);ctx.stroke()}
 ctx.restore();
}
function drawHeroAt(c,p){c.fillStyle="#0008";c.beginPath();c.ellipse(0,13,16,6,0,0,Math.PI*2);c.fill();c.fillStyle=p.armorColor;c.fillRect(-11,-8,22,23);c.fillStyle=p.skin;c.beginPath();c.arc(0,-17,10,0,Math.PI*2);c.fill();c.fillStyle=p.hairColor;c.beginPath();c.arc(0,-21,10,Math.PI,Math.PI*2);c.fill();c.fillRect(-10,-22,4,9);c.fillRect(6,-22,4,9);c.fillStyle="#171922";c.fillRect(-4,-18,2,2);c.fillRect(3,-18,2,2);c.strokeStyle=p.weapon==="staff"?"#9b7af1":"#d7dce5";c.lineWidth=3;c.beginPath();c.moveTo(11,0);c.lineTo(20,-20);c.stroke()}
function endGame(){const r=currentRun;if(!r)return;r.paused=true;localStorage.ss_bestTime=Math.max(Number(localStorage.ss_bestTime||0),Math.floor(r.time));localStorage.ss_bestLevel=Math.max(Number(localStorage.ss_bestLevel||1),r.level);localStorage.ss_souls=Number(localStorage.ss_souls||0)+r.souls;$("run-summary").innerHTML=`TIME: <b>${fmt(r.time)}</b><br>LEVEL REACHED: <b>${r.level}</b><br>ENEMIES DEFEATED: <b>${r.kills}</b><br>SOULS COLLECTED: <b>${r.souls}</b>`;$("gameover-modal").classList.remove("hidden")}
function pause(){if(!currentRun)return;currentRun.paused=true;$("pause-modal").classList.remove("hidden")}
$("pause-btn").onclick=pause;$("resume-btn").onclick=()=>{if(currentRun)currentRun.paused=false;$("pause-modal").classList.add("hidden")};
$("quit-btn").onclick=()=>{cancelAnimationFrame(raf);currentRun=null;show("menu-screen");$("pause-modal").classList.add("hidden")};
$("retry-btn").onclick=()=>startGame();$("menu-btn").onclick=()=>{currentRun=null;show("menu-screen");$("gameover-modal").classList.add("hidden");$("best-time").textContent=fmt(Number(localStorage.ss_bestTime||0));$("best-level").textContent=localStorage.ss_bestLevel||1;$("souls").textContent=localStorage.ss_souls||0};
addEventListener("keydown",e=>{const k=e.key.toLowerCase();if(["arrowup","arrowdown","arrowleft","arrowright"," "].includes(k))e.preventDefault();keys[k===" "?"space":k]=true;if(k==="escape"&&currentRun&&!currentRun.paused)pause()});
addEventListener("keyup",e=>{const k=e.key.toLowerCase();keys[k===" "?"space":k]=false});
canvas.addEventListener("pointerdown",e=>{pointer.x=e.clientX;pointer.y=e.clientY;pointer.active=true;if(currentRun&&currentRun.manualCd<=0)fire(true)});
canvas.addEventListener("pointerup",()=>pointer.active=false);
renderPreviews();
})();
