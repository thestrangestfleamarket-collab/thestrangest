// THE OTHER PLAYERS: ONLINE, everyone on your block (one server a section, worker/door.js Block): their bodies and name tags, who's online, and the chat.
import {SHARED, THREE} from './003-shx.js';
import {BUGS, EQUIP, keys, LEVELS, LOOKS, MOTION, ONLINE, pos, ROOMS, st, TEXT, UI, VAULT, VIT, VR, W3} from './003b-systems.js';
import {renderer, scene} from './004-main.js';
import {SAVE} from './005-save.js';
import {ASTEP, MODS, QS, SECTIONS, SYS, TILE} from './006-map-pre.js';
import {GARB} from './072b-garb.js';
import {qMat, ragPoseOf, TL} from './073-main-12.js';
import {LABELS} from './104-labels.js';
import {figureMesh, musBody, MUSGEO, musScale} from './110-musician.js';
import {BODIES} from './111a-bodies.js';
Object.assign(ONLINE,{others:new Map(),on:false,me:'',log:[],hear:{},puts:{}}); window.ONLINE=ONLINE;
// things players set down (hives, crab pots...): each kind registers {set(id,name,list), clear(), share()}; the section sends them all on joining, then each change
ONLINE.hear.puts=m=>{ if(m.all){ for(const k in ONLINE.puts){ const H=ONLINE.puts[k]; H.clear(); for(const r of m.all)if(r&&r.k===k)H.set(r.id,r.name,r.list); H.share(); } return; } const H=ONLINE.puts[m.k]; if(H)H.set(m.id,m.name,m.list); };
{ const R=RIG, PI4=Math.PI/4, LAG=160, SEND=1/6, FAR=1e9, MAXN=20, FADE_S=15000;
  // your words over heads: FONTS and COLS to pick from, SIZES in canvas px; SP is your own style (sent with each say), ONLINE.sayFor how long anyone's words stay (your setting)
  const FONTS=[['Silkscreen, monospace','PIXEL'],["'Press Start 2P', monospace",'ARCADE'],["'Share Tech Mono', monospace",'MONO'],['sans-serif','PLAIN'],['serif','SERIF'],['cursive','SCRIPT']], COLS=['#f4f2ea','#ffd27a','#7dffa8','#8fd0ff','#ff8ad8','#ff8a1f','#ff5a5a','#c8b0ff'], SIZES=[22,28,36];
  const SP={f:0,c:COLS[0],s:1}; try{ Object.assign(SP,style(JSON.parse(SAVE.get('speech')||'{}'))); }catch(e){}
  function style(o){ const r={}; if(!o||typeof o!=='object')return r; if(Number.isInteger(o.f)&&o.f>=0&&o.f<FONTS.length)r.f=o.f; if(typeof o.c==='string'&&/^#[0-9a-f]{6}$/i.test(o.c))r.c=o.c.toLowerCase(); if(Number.isInteger(o.s)&&o.s>=0&&o.s<SIZES.length)r.s=o.s; return r; }
  ONLINE.sayFor=(()=>{ const v=+SAVE.get('sayfor'); return v>=2&&v<=30?v:7; })(); ONLINE.style=SP; ONLINE.FONTS=FONTS; ONLINE.COLS=COLS;
  const ROOM=ONLINE.room='s-'+String(SECTIONS.home.id).toLowerCase().replace(/[^a-z0-9-]/g,'');   // the section you are in has its own room
  const V8=Array.from({length:8},(_,d)=>[Math.sin(d*PI4),-Math.cos(d*PI4)]);
  let sock=null, last=null, acc=0, keep=0, meAcc=1, meSent='', EL=null;

  const roomKey=()=>{ if(MODS.apts&&MODS.apts.inReal)return 'apt:'+(MODS.apts.host||ONLINE.me||MODS.apts.num||''); const c=ROOMS.cur; return c&&c.off?c.off:''; };   // your apartment is off the map (not a ROOMS room); scope players to it by its number
  const lookKey=()=>{ '@later'; const b=BODIES.pick(), L=LOOKS.L||{}, body=BODIES.by[b]; return b!=='walker'&&body?'b:'+b+(body.look?':'+body.look():''):(wn=>'w'+(L.bare?1:0)+(wn?'..'+LOOKS.code()+'.'+wn:(LOOKS.code()!=='M00'?'.':'')+(LOOKS.code()!=='M00'?'.'+LOOKS.code():'')))(EQUIP.code?EQUIP.code():''); };   // the fourth part is what you wear (EQUIP.code): it dyes their copy of you and puts your gear on it   // (a body with a look of its own, your avatar, sends it: b:avatar:<code>)
  const myName=()=>((LOOKS.L&&LOOKS.L.name)||'').trim()||('TENANT'+(MODS.apts&&MODS.apts.num?' '+MODS.apts.num:'')); ONLINE.myName=myName;
  const send=m=>{ if(sock&&sock.readyState===1)sock.send(JSON.stringify(m)); }; ONLINE.send=m=>send(m);
  /* ---------- other players are solid: you are pushed out of them as out of a character ---------- */
  ONLINE.push=p=>{ for(const o of ONLINE.others.values()){ if(o.why!=='near you'||!o.p||o.dead)continue; const dx=p.x-o.p.x, dz=p.z-o.p.z, d=Math.hypot(dx,dz), R=.55; if(d<R&&d>1e-4){ p.x=o.p.x+dx/d*R; p.z=o.p.z+dz/d*R; } } };
  SYS.add('act',(k,on)=>ONLINE.send(k==='flinch'?{t:'act',m:k}:k&&typeof k==='object'?{t:'act',...k}:{t:'act',k,on:on?1:0}),'111d-online');

  /* ---------- where someone is: their last moves, drawn a little behind so the steps between them are smooth ---------- */
  const place=(o,now)=>{ '@later'; const s=o.s, n=s.length-1; if(n<0)return null; const t=now-Math.max(LAG,(o.gap||0)*1.4); if(t<=s[0].t)return s[0]; if(t>=s[n].t)return s[n];
    for(let i=n;i>0;i--)if(s[i-1].t<=t){ const a=s[i-1], b=s[i]; if(Math.hypot(b.x-a.x,b.z-a.z)>4*TILE||a.lv!==b.lv||a.rm!==b.rm)return b;
      const k=(t-a.t)/(b.t-a.t||1), dh=Math.atan2(Math.sin(b.hd-a.hd),Math.cos(b.hd-a.hd)); return {x:a.x+(b.x-a.x)*k,z:a.z+(b.z-a.z)*k,y:a.y+(b.y-a.y)*k,hd:a.hd+dh*k,lv:b.lv,rm:b.rm}; }
    return s[n]; };
  ONLINE.at=(o,now)=>{ const p=place(o,now)||{x:0,z:0}; return [p.x/TL,-p.z/TL]; }; ONLINE.V=V8;

  const push=(o,a)=>{ const t0=performance.now(), L=o.s[o.s.length-1]; if(L)o.gap=(o.gap||SEND*1000)*.8+Math.min(3000,t0-L.t)*.2; o.s.push({t:t0,x:+a[0]||0,z:+a[1]||0,y:+a[2]||0,hd:+a[3]||0,lv:a[4]||'up',rm:a[5]||''}); if(o.s.length>8)o.s.shift(); };
  const up=(id,p)=>{ '@later'; let o=ONLINE.others.get(id); if(!o){ o={id,name:'',look:'',s:[],S:R.create(),fig:null,key:'',say:'',sayT:0,tag:null,tagS:'',d:0}; ONLINE.others.set(id,o); }
    if(p){ if(p.name!=null)o.name=String(p.name); if(p.look!=null)o.look=String(p.look); if(p.dead!=null)o.dead=!!p.dead; if(p.hp!=null)o.hp=Math.max(0,Math.min(1,+p.hp||0)); if(p.x&&typeof p.x==='object')o.x={...p.x}; if(p.at)push(o,p.at); } return o; };
  const drop=id=>{ const o=ONLINE.others.get(id); if(o){ unfig(o); ONLINE.others.delete(id); } };
  ONLINE.world={}; const wset=(k,v)=>{ ONLINE.world[k]=v; SYS.run('world',k,v); };
  ONLINE.put=(k,v)=>{ wset(k,v); ONLINE.send({t:'world',k,v}); }; ONLINE.add=(k,n)=>{ wset(k,(+ONLINE.world[k]||0)+n); ONLINE.send({t:'world',k,add:n}); };
  ONLINE.feed=m=>{ '@later'; if(!m||typeof m!=='object')return; ui();
    if(m.t==='world'&&typeof m.k==='string'){ wset(m.k,m.v); return; }
    if(m.t==='took'&&typeof m.k==='string'){ SYS.run('took',m.k,m.v); return; }
    if(ONLINE.me&&(m.id===ONLINE.me||(m.p&&m.p.id===ONLINE.me))&&m.t!=='tell')return;   // your own moves from your other tab: never a body of yours in your own head
    if(m.t==='mv'&&m.id&&Array.isArray(m.at)){ push(up(m.id),m.at); return; }
    if(m.t==='hi'){ ONLINE.me=m.you||''; if(m.world&&typeof m.world==='object')for(const k in m.world)wset(k,m.world[k]); SYS.run('hi',m); const keep=new Set(); for(const p of m.all||[])if(p&&p.id){ keep.add(p.id); up(p.id,p); } for(const id of [...ONLINE.others.keys()])if(!keep.has(id))drop(id); }
    else if(m.t==='in'&&m.p&&m.p.id)up(m.p.id,m.p);
    else if(m.t==='out')drop(m.id);
    else if(m.t==='tell'&&m.text){ line(m.from||'THE MARKET',m.text); banner(m.from||'THE MARKET',m.text); }
    else if(m.t==='act'&&m.id){ const o=ONLINE.others.get(m.id); if(o){ try{ if(m.stop||m.m&&/^mc_/.test(m.m))MOTION.their(o.S,m); else if(m.m)R.begin(o.S,m.m); else if(m.on)R.act(o.S,m.k); else R.release(o.S,m.k); }catch(e){} o.B=null; } return; }
    else if(m.t==='ragon'&&m.id&&Array.isArray(m.n)&&Array.isArray(m.jl)){ const o=up(m.id); o.rag={n:m.n,jl:m.n.map((_,i)=>Object.fromEntries((m.jl[i]||[]).map(j=>[j[0],[+j[1],+j[2],+j[3]]]))),b:null,t:0}; return; }
    else if(m.t==='rag'&&m.id&&Array.isArray(m.b)){ const o=ONLINE.others.get(m.id); if(!o||!o.rag)return; const r=o.rag; r.b=m.b.map((v,i)=>({name:r.n[i],x:[+v[0],+v[1],+v[2]],m3:qMat([+v[3],+v[4],+v[5],+v[6]]),jl:r.jl[i]||{}})); r.o=[+m.o[0],+m.o[1]]; r.hd=+m.hd||0; r.t=performance.now(); return; }
    else if(m.t==='ragoff'&&m.id){ const o=ONLINE.others.get(m.id); if(o){ o.rag=null; o.B=null; } return; }
    else if(ONLINE.hear[m.t]){ ONLINE.hear[m.t](m); return; }
    else if(m.t==='say'&&m.text){ const o=m.id&&ONLINE.others.get(m.id); if(o){ o.say=String(m.text); o.sayT=performance.now(); o.st=style(m.st); } line(m.name||(o&&o.name)||'TENANT',m.text); }
    list(); };

  /* ---------- their bodies: one built body per look (the Walker in clothes, shod or barefoot, or a body of its own), shared by everyone wearing it ---------- */
  const BUILT=new Map();
  ONLINE.refig=pre=>{ for(const o of ONLINE.others.values())if(String(o.look||'').startsWith(pre))o.key=''; };   // their bodies built again (a body whose data came after they were first drawn: the avatar)
  // a dyed shirt or trousers: one material a colour, shared by everyone dyed it
  const dyeMat=h=>{ const M=R.MATS, n='dye'+h; if(!M.includes(n)){ M.push(n); const c=new THREE.Color(h); W3.ramp.push([1,.9,.7,.42].map(q=>c.clone().multiplyScalar(q))); } return M.indexOf(n); };
  const built=k=>{ '@later'; let b=BUILT.get(k); if(b)return b;
    if(k.startsWith('b:')){ const [key,c]=k.slice(2).split(':'), base=BODIES.by[key], body=base&&c&&base.variant?base.variant(c):base; if(!body)return base&&base.failed&&!base.failed(c)?null:built('w00'); b={body};   // (a body still coming: none yet, never the Walker first; one that failed: the Walker)
    BUILT.set(k,b); return b; }
    const bare=k[1]==='1', MI=n=>R.MATS.indexOf(n), SK=MI('skin'), PA=MI('pants'), ST=LOOKS.decode(k.split('.')[2]||'M00'), E=LOOKS.shape(ST.form), PCS=musBody(Object.assign({},ST,{worn:GARB.worn()})).PCS;
    const by=EQUIP.decode?EQUIP.decode(k.split('.')[3]):{}, dc=EQUIP.colours?EQUIP.colours(by):{}, SH=MI('shirt'), SHX=dc.shirt?dyeMat(dc.shirt):-1, PAX=dc.pants?dyeMat(dc.pants):-1;
    for(const p of PCS){ if(p.e!=null)p.E=E[p.e]||null;
      if(bare&&/^shoe/.test(p.n))p.recol=()=>SK;
      if(SHX>=0||PAX>=0){ const r0=p.recol; p.recol=m=>{ const r=r0?r0(m):undefined, q=r??m; return q===SH&&SHX>=0?SHX:q===PA&&PAX>=0?PAX:r; }; } }
    for(const P of PCS)if(!P.box&&!MUSGEO.has(P.share)){ const fine=W3.fine(P); W3.warm(P,P.step||(fine?.5:1),fine,null); }
    b={PCS,bh:1,by,garb:GARB.spec(bare,dc,ST.form),garbE:GARB.of(ST.form,i=>E[i]||null)}; BUILT.set(k,b); return b; };
  const fig=o=>{ '@later'; unfig(o); const k=o.look||'w00', b=built(k); o.key=k; if(!b)return; const g=new THREE.Group();
    if(b.body){ const M=BODIES.mesh(b.body); g.add(M.me); o.fig={g,me:M.me,body:b.body,PM:M.PM}; }
    else{ const FM=figureMesh(b.PCS,'online'); g.add(FM.me); o.fig={g,me:FM.me,FM,PCS:b.PCS,bh:b.bh}; }
    const hb=new THREE.Mesh(new THREE.BoxGeometry(22,58,24),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(0,29,2); g.add(hb);
    o.fig.th={player:o,name:o.name||'TENANT',obj:hb,reach:1.6,tall:1.9,act:()=>{ if(ONLINE.use)ONLINE.use(o); }}; UI.thing(o.fig.th);
    o.key=k; o.B=null; g.userData.anyRoom=true; scene.add(LEVELS.own(g,'*')); };
  const lab=o=>{ const st={f:0,c:COLS[0],s:1,...(o.st||{})}, say=o.say&&performance.now()-o.sayT<ONLINE.sayFor*1000?o.say:'', nm=o.mine?'':(o.name||'TENANT')+(o.x&&o.x.title?' · '+o.x.title:'')+(o.dead?' (GHOST)':''), hp=o.mine||o.dead||o.hp==null||o.hp>.99?-1:Math.round(o.hp*20)/20; o.tagS=nm+'\n'+say+'\n'+hp+'\n'+st.f+st.c+st.s;
    if(!o.lab)o.lab=LABELS.add();
    o.lab.set((say?'<div style="display:inline-block;max-width:min(320px,70vw);white-space:normal;overflow-wrap:anywhere;font:'+fitPx(SIZES[st.s]/2,say.length)+'px '+FONTS[st.f][0]+';color:'+st.c+';background:rgba(11,13,19,.88);padding:3px 6px;margin-bottom:3px">'+TEXT.esc(say)+'</div>':'')+(nm?'<div style="font:14px Silkscreen,monospace;color:'+(o.dead?'#cfe0ff':'#ffd27a')+';text-shadow:0 0 2px #0b0d13,1px 1px 0 #0b0d13,-1px -1px 0 #0b0d13,1px -1px 0 #0b0d13,-1px 1px 0 #0b0d13">'+TEXT.esc(nm)+'</div>':'')+(hp>=0?'<div style="width:80px;height:5px;margin:2px auto 0;background:#0b0d13;padding:1px"><div style="height:3px;width:'+Math.round(hp*100)+'%;background:#c84a3a"></div></div>':'')).show(!!(say||nm||hp>=0)); };
  // the whole sentence always shows: it wraps, and a long one gets smaller (not under 8 px)
  const fitPx=(px,n)=>n<=60?px:Math.max(8,Math.round(px*Math.sqrt(60/n)));
  const unfig=o=>{ '@later'; if(o.fig){ const i=UI.things.indexOf(o.fig.th); if(i>=0)UI.things.splice(i,1); scene.remove(o.fig.g); const me=o.fig.me; for(const m of [me.material,me.customDistanceMaterial,me.customDepthMaterial])if(m)m.dispose(); o.fig=null; }
    if(o.tag){ scene.remove(o.tag); o.tag.material.map.dispose(); o.tag.material.dispose(); o.tag=null; o.tagS=''; } if(o.lab){ o.lab.remove(); o.lab=null; } };

  /* ---------- the name over their head, and what they last said for a few seconds ---------- */
  const tag=o=>{ const st={f:0,c:COLS[0],s:1,...(o.st||{})}, say=o.say&&performance.now()-o.sayT<ONLINE.sayFor*1000?o.say:'', nm=o.mine?'':(o.name||'TENANT')+(o.x&&o.x.title?' · '+o.x.title:'')+(o.dead?' (GHOST)':''), hp=o.mine||o.dead||o.hp==null||o.hp>.99?-1:Math.round(o.hp*20)/20, s=nm+'\n'+say+'\n'+hp+'\n'+st.f+st.c+st.s; if(o.tag&&o.tagS===s)return; o.tagS=s;
    const c=document.createElement('canvas'); c.width=512; c.height=128; const x=c.getContext('2d'); x.textAlign='center'; x.textBaseline='middle';
    if(say){ let px=SIZES[st.s], L;
      const wrap=()=>{ x.font=px+'px '+FONTS[st.f][0]; const out=[]; let ln=''; for(const wd of say.split(/\s+/)){ const t=ln?ln+' '+wd:wd; if(ln&&x.measureText(t).width>480){ out.push(ln); ln=wd; } else ln=t; } if(ln)out.push(ln); return out; };
      while((L=wrap(),L.length*(px+2)+12>84||L.some(l=>x.measureText(l).width>480))&&px>8)px--;
      const lh=px+2, w=Math.min(504,Math.max(...L.map(l=>x.measureText(l).width))+20), h=L.length*lh+12, top=84-h;
      x.fillStyle='rgba(11,13,19,.88)'; x.fillRect(256-w/2,top,w,h); x.fillStyle=st.c; L.forEach((l,i)=>x.fillText(l,256,top+6+lh*(i+.5)+1)); }
    x.font='28px Silkscreen, monospace'; if(nm){ x.lineWidth=6; x.strokeStyle='#0b0d13'; x.strokeText(nm,256,100); x.fillStyle=o.dead?'#cfe0ff':'#ffd27a'; x.fillText(nm,256,100); }
    if(hp>=0){ x.fillStyle='#0b0d13'; x.fillRect(176,116,160,10); x.fillStyle='#c84a3a'; x.fillRect(178,118,156*hp,6); }   // their health, while it's not full
    const tx=new THREE.CanvasTexture(c); tx.magFilter=tx.minFilter=THREE.NearestFilter; tx.generateMipmaps=false; tx.colorSpace=THREE.SRGBColorSpace;
    if(!o.tag){ o.tag=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true,depthWrite:false,toneMapped:false,fog:false})); o.tag.scale.set(5.2*TILE,1.3*TILE,1); o.tag.renderOrder=5; o.tag.userData.anyRoom=true; scene.add(LEVELS.own(o.tag,'*')); }
    else{ o.tag.material.map.dispose(); o.tag.material.map=tx; } };

  /* ---------- each frame: the nearest twenty on your level and in your room, walking where they were sent ---------- */
  const hide=o=>{ if(o.fig)o.fig.g.visible=false; if(o.tag)o.tag.visible=false; if(o.lab)o.lab.show(false); };
  // a tag keeps one size on the screen whatever the zoom or the view: half a canvas pixel a screen pixel (the name 14 px, the words 11 to 18)
  const fit=sp=>{ const cam=SHARED.cam, H=renderer.domElement.clientHeight||innerHeight; let u; if(cam.isOrthographicCamera)u=(cam.top-cam.bottom)/(cam.zoom||1)/H; else u=2*cam.position.distanceTo(sp.position)*Math.tan((cam.fov||60)*Math.PI/360)/H; const k=u*.5; sp.scale.set(512*k,128*k,1); };
  const draw=(dt,now)=>{ '@later'; const lv=SHARED.LVL||'up', rk=roomKey(), C=[];
    for(const o of ONLINE.others.values()){ const p=o.p=place(o,now), d=p?Math.hypot(p.x-pos.x,p.z-pos.z):1e9; o.why=o.x&&o.x.invis?'unseen':!p?'no position yet':p.rm!==rk?'in another room':p.lv!==lv?'on another level':d>=FAR?'far away':'near you'; if(o.why==='near you'){ o.dd=d; C.push(o); } else hide(o); }
    C.sort((a,b)=>a.dd-b.dd); for(const o of C.slice(MAXN))hide(o);
    for(const o of C.slice(0,MAXN)){ try{ const rg=o.rag&&o.rag.b&&now-o.rag.t<3000?o.rag:null, p=o.p=rg?{...o.p,x:rg.o[0]*TL,z:-rg.o[1]*TL,hd:rg.hd}:o.p; if(o.key!==(o.look||'w00'))fig(o); const F=o.fig; if(!F)continue; const g=F.g;
      const sp=o.q?Math.hypot(p.x-o.q.x,p.z-o.q.z)/Math.max(dt,1e-3):0; o.q={x:p.x,z:p.z}; o.S.target=sp>.4*TILE?1:0; R.step(o.S,o.frozen>0?0:dt);
      const M=F.me.material, gh=!!o.dead, fl=o.flashT>now; if(F.ghost!==gh){ F.ghost=gh; M.transparent=gh; M.opacity=gh?.35:1; M.depthWrite=!gh; M.color.set(gh?0xcfe0ff:0xffffff); M.needsUpdate=true; F.me.castShadow=!gh; }
      if(F.fl!==fl&&M.emissive){ F.fl=fl; M.emissive.setScalar(fl?.55:0); }
      g.visible=true; g.position.set(p.x,p.y,p.z); g.rotation.y=p.hd; if(F.body)musScale(g,1); else musScale(g,F.bh||1); const sz=o.x&&+o.x.sz; if(sz>0)g.scale.multiplyScalar(sz); o.S.hi=o.x&&+o.x.hi||1; o.d=((Math.round(p.hd/PI4)%8)+8)%8;
      if(F.PM){ const v=!rg&&o.vr&&now-o.vr.t<3000?o.vr:null; if(v||F.PM.vr){ o.wantPose=true; if(!v&&F.PM.hands)F.PM.hands.fg=null; F.PM.vr=v; } }   // (a headset player: their own head, arms and fingers every frame, 162cb)
      if(rg||!o.B||o.wantPose||ASTEP.gate(o,dt)){ o.wantPose=false; R.farOnly(false); const B=o.B=rg?ragPoseOf(rg.b,{x:rg.o[0],y:rg.o[1]},rg.hd):R.pose(o.S,true); if(F.body){ BODIES.pose(B,F.PM,F.body,rg?null:o.S); const W=o.S.water; if(!rg&&o.S._pfHead&&W&&W.in&&W.level!=null&&F.body.binv&&BODIES.headUp)BODIES.headUp(F.PM,F.body,o.S,F.g,F.me); } else F.PCS.forEach((pc,i)=>F.FM.set(i,R.frameOf(pc.on||pc.n,B))); }
      if(!F.body){ const b=BUILT.get(o.key)||{}, H=F.wornH||(F.wornH={}); GARB.draw(g,o.B,gh?null:b.garb,H,F.me,b.garbE); if(EQUIP.draw&&b.by&&Object.keys(b.by).length)EQUIP.draw(g,o.B,b.by,H); }
      if(VR.on){ if(o.lab)o.lab.show(false); tag(o); o.tag.visible=true; o.tag.position.set(p.x,p.y+2.65*TILE,p.z); fit(o.tag); } else { if(o.tag)o.tag.visible=false; lab(o); o.lab.at(p.x,p.y+2.15*TILE,p.z); } }catch(e){ hide(o); if(!o.err){ o.err=1; console.warn('ONLINE: could not draw '+(o.name||o.id),e); } } } };
  window.ONLINEDBG=()=>({me:{lv:SHARED.LVL,rk:roomKey(),at:[+pos.x.toFixed(1),+pos.z.toFixed(1),+SHARED.py.toFixed(2)]},on:ONLINE.on,others:[...ONLINE.others.values()].map(o=>({name:o.name,look:o.look,p:o.p&&{x:+o.p.x.toFixed(1),z:+o.p.z.toFixed(1),y:+o.p.y.toFixed(2),lv:o.p.lv,rm:o.p.rm},why:o.why||'',shown:!!(o.fig&&o.fig.g.visible),err:!!o.err}))});

  /* ---------- the chat and who's online (ENTER talks; the key is in the controls) ---------- */
  const esc=TEXT.esc;
  const ui=()=>{ '@later'; if(EL)return;
    const css=document.createElement('style'); css.textContent=`#onl{position:fixed;right:calc(12px + env(safe-area-inset-right,0px));bottom:calc(12px + env(safe-area-inset-bottom,0px));width:min(360px,calc(100vw - 24px));z-index:6;font:11px Silkscreen,monospace;letter-spacing:1px;color:#d8dbe4;pointer-events:none}
      #onl .hd{display:flex;gap:8px;align-items:center} #onl button{pointer-events:auto;font:inherit;color:#ffd27a;background:#0b0d13d0;border:2px solid #2a3040;padding:2px 6px;cursor:pointer} #onl .k{color:#8a8f9c;text-shadow:0 1px 0 #000}
      #onllist{pointer-events:auto;background:#0b0d13e8;border:2px solid #2a3040;padding:6px;margin-top:4px;max-height:40vh;overflow:auto} #onllist div{padding:1px 0}
      #onllog{margin-top:4px} #onllog div{background:#0b0d13b0;padding:2px 6px;margin-top:2px;word-wrap:break-word} #onllog div.old{display:none} #onl.open #onllog div.old{display:block} #onllog b{color:#ffd27a;font-weight:normal}
      #onlin{pointer-events:auto;width:100%;box-sizing:border-box;margin-top:4px;font:inherit;background:#0b0d13;color:inherit;border:2px solid #ffd27a;padding:4px}`;
    document.head.appendChild(css);
    EL=document.createElement('div'); EL.id='onl'; EL.hidden=true;
    EL.innerHTML=`<div class="hd"><button id="onlwho" aria-expanded="false">ONLINE 1</button><span class="k"></span></div><div id="onllist" hidden></div><div id="onllog" aria-live="polite"></div><input id="onlin" type="text" maxlength="200" placeholder="say something · enter sends · esc closes" hidden>`;
    (document.getElementById('hchat')||document.body).appendChild(EL); EL.hidden=false;
    const who=EL.querySelector('#onlwho'), L=EL.querySelector('#onllist'), I=EL.querySelector('#onlin');
    who.onclick=()=>{ L.hidden=!L.hidden; who.setAttribute('aria-expanded',String(!L.hidden)); list(); };
    L.onclick=e=>{ const b=e.target.closest('button[data-visit]'); if(!b||!ONLINE.visit)return; const o=ONLINE.others.get(b.dataset.visit); if(o)ONLINE.visit(o.id,o.name); };
    for(const ev of ['keydown','keyup'])I.addEventListener(ev,e=>{ e.stopPropagation(); if(ev!=='keydown')return;
      if(e.key==='Enter'){ ONLINE.said(I.value); shut(); }
      else if(e.key==='Escape')shut(); });
    I.addEventListener('blur',()=>setTimeout(shut,0)); };
  const shut=()=>{ if(!EL)return; const I=EL.querySelector('#onlin'); I.value=''; I.hidden=true; EL.classList.remove('open'); I.blur(); };
  ONLINE.open=()=>{ if(!EL||EL.hidden)return; keys.clear(); const I=EL.querySelector('#onlin'); EL.classList.add('open'); I.hidden=false; I.focus(); };
  const line=(name,text)=>{ '@later'; ui(); const d=document.createElement('div'); d.dataset.t=String(performance.now()); d.innerHTML='<b>'+esc(name)+'</b> '+esc(text); const G=EL.querySelector('#onllog'); G.appendChild(d); while(G.children.length>30)G.firstChild.remove(); if(UI.log)UI.log(text,null,name); ONLINE.log.push([name,text]); if(ONLINE.log.length>30)ONLINE.log.shift(); };
  let BN=null; const banner=(from,text)=>{ '@later'; if(!BN){ BN=document.createElement('div'); BN.id='onltell'; BN.setAttribute('role','status'); BN.style.cssText='position:fixed;left:50%;top:14%;transform:translateX(-50%);max-width:min(60ch,90vw);padding:10px 16px;background:#0b0d13f0;border:2px solid #ffd27a;color:#f4f2ea;font:12px/1.6 Silkscreen,monospace;letter-spacing:1px;text-align:center;z-index:41;pointer-events:none;white-space:pre-wrap'; document.body.appendChild(BN); }
    BN.innerHTML='<div style="color:#ffd27a">'+esc(from)+'</div>'+esc(text); BN.hidden=false; clearTimeout(BN.t); BN.t=setTimeout(()=>{ BN.hidden=true; },12000); };
  const list=()=>{ '@later'; if(!EL)return; const all=[...ONLINE.others.values()], who=EL.querySelector('#onlwho'), L=EL.querySelector('#onllist');
    who.textContent='ONLINE '+(all.length+1)+(ONLINE.on||!sock?'':' · OFF'); EL.querySelector('.k').textContent=UI.keyOf?UI.keyOf('chat').toUpperCase()+' TO TALK':'';
    if(!L.hidden)L.innerHTML='<div><b>'+esc(myName())+'</b> (you)</div>'+all.map(o=>'<div>'+esc(o.name||'TENANT')+' <span style="color:#8a8f9c">'+esc(o.why||(o.s.length?'':'no position yet'))+'</span>'+(ONLINE.visit&&!(o.x&&o.x.noapt)?' <button data-visit="'+esc(o.id)+'" style="font:inherit;color:#ece5d3;background:#0e1016;border:1px solid #3a3f4e;padding:0 5px;cursor:pointer">VISIT</button>':'')+'</div>').join(''); };
  let fadeT=0; const fade=dt=>{ if(!EL||(fadeT+=dt)<1)return; fadeT=0; if(!EL.querySelector('#onllist').hidden)list(); const now=performance.now(); for(const d of EL.querySelector('#onllog').children)d.classList.toggle('old',now-+d.dataset.t>FADE_S); };

  /* ---------- the connection: partysocket (it reconnects by itself); your moves at most six times a second, only when you move ---------- */
  const connect=async()=>{ let PS=null; try{ const m=await import('https://cdn.jsdelivr.net/npm/partysocket@1.3.0/+esm'); PS=m.PartySocket||m.default; }catch(e){ console.warn('ONLINE: no connection',e); return; }
    ui(); sock=new PS({host:location.host,party:'block',room:ROOM,query:async()=>{ try{ if(BUGS.tok)await BUGS.tok(); }catch(e){} return {}; }});
    sock.addEventListener('open',()=>{ ONLINE.on=true; last=null; meSent=''; meAcc=1; list(); });
    sock.addEventListener('close',e=>{ ONLINE.on=false; for(const id of [...ONLINE.others.keys()])drop(id);
      if(e.code===4002){ BUGS.logout(); return; }   // sent out (banned or removed): to the door
      if(e.code===4000||e.code===4001){ sock.close(); line('THE MARKET',e.code===4000?'you came in from another window; this one is alone now':'log in again to see the others'); } list(); });
    sock.addEventListener('message',e=>{ let m=null; try{ m=JSON.parse(e.data); }catch(x){} if(m)ONLINE.feed(m); }); };
  addEventListener('pagehide',()=>{ if(sock){ send({t:'bye'}); sock.close(1000,'bye'); } });   // logging out or closing the page: gone for everyone at once (owner, 4 Nov 2026)
  addEventListener('pageshow',e=>{ if(e.persisted&&sock&&sock.reconnect)sock.reconnect(); });
  ONLINE.tick=dt=>{ const now=performance.now();
    if(ONLINE.on){ acc+=dt; meAcc+=dt;
      if(meAcc>1){ meAcc=0; const n=myName(), k=lookKey(), dead=VIT.dead?1:0, hp=Math.round(VIT.hp*20)/20, x={}; for(const f in ONLINE.mine){ try{ const v=ONLINE.mine[f](); if(v!=null)x[f]=v; }catch(e){} } const s=n+'|'+k+'|'+dead+'|'+hp+'|'+JSON.stringify(x); if(s!==meSent){ meSent=s; send({t:'me',name:n,look:k,dead,hp,x}); } }
      keep+=dt; if(acc>=SEND){ acc=0; const a=[+pos.x.toFixed(2),+pos.z.toFixed(2),+SHARED.py.toFixed(2),+Math.atan2(Math.sin(SHARED.heading),Math.cos(SHARED.heading)).toFixed(2),SHARED.LVL||'up',roomKey()];
        if(!last||Math.abs(a[0]-last[0])+Math.abs(a[1]-last[1])+Math.abs(a[2]-last[2])>.01||Math.abs(a[3]-last[3])>.04||a[4]!==last[4]||a[5]!==last[5]||keep>4){ last=a; keep=0; send({t:'mv',at:a}); } } }
    if(ONLINE.others.size)draw(dt,now); fade(dt);
    if(ME.say&&now-ME.sayT<ONLINE.sayFor*1000){ ME.st=SP; if(VR.on){ if(ME.lab)ME.lab.show(false); tag(ME); ME.tag.visible=true; ME.tag.position.set(pos.x,SHARED.py+2.65*TILE,pos.z); fit(ME.tag); } else { if(ME.tag)ME.tag.visible=false; lab(ME); ME.lab.at(pos.x,SHARED.py+2.15*TILE,pos.z); } } else { if(ME.tag)ME.tag.visible=false; if(ME.lab)ME.lab.show(false); }; };
  const ME={mine:true,say:'',sayT:0,st:SP,tag:null,tagS:''}; ONLINE.ME=ME;
  ONLINE.said=t=>{ t=String(t||'').trim().slice(0,200); if(!t)return; if(/^bank$/i.test(t)&&VAULT.open){ VAULT.open(); return; } send({t:'say',text:t,st:SP}); line(myName(),t); ME.say=t; ME.sayT=performance.now(); };
  const PS=['sit','climb','hang','water','grip','fly'], pick=o=>{ const r={}; let n=0; for(const k in o){ const v=o[k]; if(n>=16)break; if(typeof v==='number'&&isFinite(v)){ r[k]=Math.round(v*100)/100; n++; } else if(typeof v==='boolean'){ r[k]=v; n++; } } return r; };
  const snap=()=>{ const s={}; for(const k of PS){ const v=st[k]; if(v&&typeof v==='object'&&(k!=='water'||v.in))s[k]=pick(v); } return s; };
  let psSent='', psT=0, psKeep=0;
  SYS.add('life',dt=>{ if(!ONLINE.on)return; psT+=dt||0; psKeep+=dt||0; if(psT<.2)return; psT=0; const s=snap(), j=JSON.stringify(s); if(j!==psSent||(j!=='{}'&&psKeep>3)){ const was=psSent; psSent=j; psKeep=0; if(j!=='{}'||was!=='{}')send({t:'ps',s}); } },'111d-online-ps');
  ONLINE.hear.ps=m=>{ const o=ONLINE.others.get(m.id); if(!o||!m.s||typeof m.s!=='object')return; for(const k of PS){ const v=m.s[k]; if(k==='water'){ const W=o.S.water; if(v&&typeof v==='object'){ if(!W)o.S.water={...v,in:false}; else{ const LIVE={y:1,vy:1,ph:1,swim:1,under:1,back:1,t:1}; for(const f in v)if(!LIVE[f])W[f]=v[f]; W.in=true; if(typeof v.y==='number'&&typeof W.y==='number')W.y+=(v.y-W.y)*.3; } } else o.S.water=null; } else o.S[k]=v&&typeof v==='object'?{...v}:null; } o.wantPose=true; o.B=null; };   // (their water: what they do set by each word, 0.2 s apart; its height and stroke run on here, drawn toward theirs: no step in their body)
  SYS.add('life',dt=>ONLINE.tick(dt||0),'111d-online');
  const go=async()=>{ await LOAD('later');
    if(QS.get('online')==='0'||!/(?:^|;\s*)tsfm-pass=/.test(document.cookie))return; connect(); };
  // the settings: YOUR WORDS (font, colour, size) in the YOU window, WORDS STAY (seconds) in the menu's DISPLAY
  { const saveSP=()=>{ try{ SAVE.set('speech',JSON.stringify(SP)); }catch(e){} };
    const you=()=>{ const P=document.getElementById('looks'); if(!P)return setTimeout(you,1000); if(P.querySelector('#lsay'))return;
      const B=document.createElement('div'); B.id='lsay'; B.style.cssText='display:grid;grid-template-columns:150px minmax(0,1fr);gap:6px 12px;align-items:center'; B.innerHTML=`<span class="lk">FONT</span><div class="row" id="lsayf">${FONTS.map((f,i)=>`<button data-f="${i}" style="font-family:${f[0]}">${f[1]}</button>`).join('')}</div>
        <span class="lk">COLOUR</span><div class="row" id="lsayc">${COLS.map(c=>`<button data-c="${c}" title="${c}"><i style="display:inline-block;width:16px;height:16px;vertical-align:middle;background:${c};box-shadow:0 0 0 1px #000"></i></button>`).join('')}</div>
        <span class="lk">SIZE</span><div class="row" id="lsays"><button data-s="0">SMALL</button><button data-s="1">MEDIUM</button><button data-s="2">LARGE</button><span id="lsayp" style="margin-left:8px">hello there</span></div>`;
      if(LOOKS.add)LOOKS.add('words',null,B,{tab:'words'});
      const show=()=>{ B.querySelectorAll('[data-f]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.f===SP.f))); B.querySelectorAll('[data-c]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.c===SP.c))); B.querySelectorAll('[data-s]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.s===SP.s)));
        const pv=B.querySelector('#lsayp'); pv.style.cssText='margin-left:8px;text-shadow:1px 1px 0 #000'; pv.style.setProperty('color',SP.c,'important'); pv.style.setProperty('font-family',FONTS[SP.f][0],'important'); pv.style.setProperty('font-size',[13,17,22][SP.s]+'px','important'); };
      B.onclick=e=>{ const b=e.target.closest('button'); if(!b)return; const d=b.dataset; if(d.f!=null)SP.f=+d.f; else if(d.c)SP.c=d.c; else if(d.s!=null)SP.s=+d.s; saveSP(); show(); ME.tagS=''; }; show(); };
    you();
    const disp=()=>{ const P=document.querySelector('#menu [data-p="chat"]'); if(!P)return setTimeout(disp,1000); if(P.querySelector('#dsayfor'))return;
      const R=document.createElement('div'); R.className='row'; R.innerHTML='<span>WORDS STAY</span><input type="range" id="dsayfor" min="2" max="30" step="1"><span id="dsayforv"></span>'; P.prepend(R);
      const I=R.querySelector('#dsayfor'), V=R.querySelector('#dsayforv'), show=()=>{ I.value=ONLINE.sayFor; V.textContent=ONLINE.sayFor+' S'; }; I.oninput=e=>{ ONLINE.sayFor=+e.target.value; try{ SAVE.set('sayfor',String(ONLINE.sayFor)); }catch(err){} show(); }; show(); };
    disp(); }
  SYS.onStart(go,'111d-online'); }
