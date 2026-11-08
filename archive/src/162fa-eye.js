// THE EYE: an eye on the vitals panel; click it, then click anything (in the world, on the HUD, in a window) and a card says what it is (owner, 8 Nov 2026: "click anything on screen and it will tell you what it is")
import {SHARED, THREE} from './003-shx.js';
import {GPH, LEVELS, NPCS, ONLINE, ROOMS, UI, W3, ZONES} from './003b-systems.js';
import {renderer, scene} from './004-main.js';
import {STORE, SYS, TILE} from './006-map-pre.js';
const EYE={on:false,last:null};
{ const css=document.createElement('style'); css.textContent=`#heye{position:absolute;right:4px;top:4px;width:22px;height:16px;padding:0;border:1px solid #2d5a40;background:#020a06;color:#7dffa8;cursor:pointer;display:flex;align-items:center;justify-content:center}
    #heye:hover,#heye.on{background:#7dffa8;color:#020a06} html.eyeon,html.eyeon *{cursor:help !important}
    #heyec{position:fixed;z-index:60;max-width:300px;font:10px Silkscreen,monospace;letter-spacing:1px;color:#e8e2cc;background:#0b0d13f0;border:1px solid #7dffa8;padding:6px 9px;pointer-events:none;zoom:var(--uiz,1)} #heyec[hidden]{display:none}
    #heyec b{display:block;color:#f2c14e;font-size:12px;margin-bottom:3px;font-weight:normal} #heyec i{display:block;font-style:normal;color:#9fb8a8}`;
  document.head.appendChild(css);
  const btn=document.createElement('button'); btn.id='heye'; btn.title='THE EYE: CLICK IT, THEN CLICK ANYTHING TO SEE WHAT IT IS';
  btn.innerHTML='<svg width="16" height="10" viewBox="0 0 16 10"><path d="M1 5C3 1.5 5.5 0 8 0s5 1.5 7 5c-2 3.5-4.5 5-7 5S3 8.5 1 5z" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="8" cy="5" r="2.2" fill="currentColor"/></svg>';
  const card=document.createElement('div'); card.id='heyec'; card.hidden=true; document.body.appendChild(card);
  let hideT=0, eat=0;
  const show=(r,x,y)=>{ card.innerHTML=`<b>${r.name}</b>${r.kind?`<i>${r.kind}</i>`:''}${r.info?`<span>${r.info}</span>`:''}`; card.hidden=false;
    const z=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--uiz'))||1, w=card.offsetWidth*z, h=card.offsetHeight*z;
    card.style.left=Math.max(4,Math.min(innerWidth-w-4,x+14))/z+'px'; card.style.top=Math.max(4,Math.min(innerHeight-h-4,y+14))/z+'px'; hideT=performance.now()+5000; };
  EYE.set=on=>{ EYE.on=!!on; btn.classList.toggle('on',EYE.on); document.documentElement.classList.toggle('eyeon',EYE.on);
    if(EYE.on)show({name:'THE EYE',info:'CLICK ANYTHING TO SEE WHAT IT IS. ESC TO STOP.'},innerWidth/2-150,60); };
  btn.addEventListener('click',e=>{ e.stopPropagation(); EYE.set(!EYE.on); });
  const up=s=>String(s||'').replace(/\s+/g,' ').trim().toUpperCase();
  // the HUD's parts
  const HUDN={vit:['YOUR VITALS','HP, STAMINA AND INTELLIGENCE: THEIR TOPS ARE YOUR STRENGTH, STAMINA AND INTELLIGENCE STATS'],hmap:['THE MINIMAP','THE STREET YOU ARE ON, WHERE YOU STAND AND THE WEATHER. CLICK IT FOR THE MAP'],
    hqb:['THE QUICK BAR','THINGS AND MOVES AT HAND: PRESS 1 TO 0 OR CLICK ONE. DRAG THINGS, EMOTES AND ACTIONS ONTO IT; DRAG ⋮⋮ TO MOVE IT'],hlog:['THE LOG','WHAT JUST HAPPENED, AND THE CHAT'],
    hprompt:['THE PROMPT','THE THING IN FRONT OF YOU AND THE KEY THAT USES IT'],heye:['THE EYE','CLICK IT, THEN CLICK ANYTHING TO SEE WHAT IT IS'],wlabels:['A NAME TAG','WHO OR WHAT IS THERE']};
  // something on the page: the HUD part or window it is in, and the control clicked (its own words, or its tip)
  const dom=el=>{ let top=el; while(top.parentElement&&top.parentElement!==document.body)top=top.parentElement;
    const own=el.closest('[title],button,a,input,select,label,[data-i]'), tip=own&&own.getAttribute('title'), word=own&&(own.tagName==='INPUT'?own.placeholder||own.value:own.textContent);
    const H=HUDN[top.id]; let where=H?H[0]:'';
    if(!where)where=up((top.innerText||'').split('\n').find(s=>s.trim()&&s.trim().length>1)).slice(0,40)||up(top.id).replace(/[-_]/g,' ')||'A WINDOW';   // (a window's title: its first line)
    if(top.id==='hqb'&&own&&own.dataset.i!=null){ const n=+own.dataset.i, nm=up(tip||word).replace(/^\d+\s*/,''); return {name:nm||'AN EMPTY SLOT',kind:'QUICK BAR SLOT '+((n+1)%10||(n<10?10:n+1)),info:nm?'CLICK IT OR PRESS ITS KEY TO USE IT; DRAG IT OFF TO CLEAR THE SLOT':'DRAG A THING, AN EMOTE OR AN ACTION HERE'}; }
    const label=up(tip)||up(word).slice(0,60);
    if(label&&own!==top&&label!==where)return {name:label,kind:'IN '+where,info:own.tagName==='BUTTON'?'A BUTTON':''};
    return {name:where,info:H?H[1]:''}; };
  // something in the world: what you can use (the list double-click reads), a character, a loose thing, else the ground, a wall or the sky and where
  const RC=new THREE.Raycaster(), V2=new THREE.Vector2(), NV=new THREE.Vector3();
  const vis=o=>{ for(let q=o;q;q=q.parent)if(!q.visible)return false; return true; };
  // a hit you would see: not a clear pane, nor a see-through pixel of a cut-out picture (a plant card, a sign)
  const PX=document.createElement('canvas'); PX.width=PX.height=1; const PXC=PX.getContext('2d',{willReadFrequently:true}), UV=new THREE.Vector2();
  const seen=h=>{ const o=h.object; if(!o.isMesh||!vis(o)||LEVELS.drawn&&!LEVELS.drawn(o))return false;   // (another level's things, the tunnels under the street, stay in the scene but are not drawn here)
    let m=o.material; if(Array.isArray(m))m=m[h.face&&h.face.materialIndex||0]; if(!m||m.visible===false||m.colorWrite===false)return false;
    if(m.transparent&&m.opacity<.15)return false; const T=m.map, I=T&&T.image;
    if(T&&h.uv&&(m.alphaTest>0||m.transparent)&&I&&I.width){ try{ UV.copy(h.uv); T.transformUv(UV); PXC.clearRect(0,0,1,1); PXC.drawImage(I,Math.floor(UV.x*I.width),Math.floor(UV.y*I.height),1,1,0,0,1,1); if(PXC.getImageData(0,0,1,1).data[3]/255<Math.max(.1,m.alphaTest||0))return false; }catch(e){} }
    return true; };
  const under=(o,g)=>{ for(let q=o;q;q=q.parent)if(q===g)return true; return false; };
  const world=(x,y)=>{ const r=renderer.domElement.getBoundingClientRect(); V2.set((x-r.left)/r.width*2-1,-((y-r.top)/r.height*2-1)); RC.setFromCamera(V2,SHARED.cam);
    const hit=RC.intersectObjects(scene.children,true).find(seen);
    const live=UI.things.filter(t=>t.obj&&vis(t.obj)&&(!LEVELS.drawn||LEVELS.drawn(t.obj)));
    const th=RC.intersectObjects(live.map(t=>t.obj),true)[0], T=th&&live.find(t=>under(th.object,t.obj));
    // yourself: your body is posed on the GPU, so a ray misses it; its line from feet to head on the screen instead, unless something is in front
    { const g=W3.group; g.updateMatrixWorld(true); const F=NV.setFromMatrixPosition(g.matrixWorld), d=F.distanceTo(RC.ray.origin), f=F.clone().project(SHARED.cam), h=F.clone().setY(F.y+1.75*TILE/1.13).project(SHARED.cam), rw=r.width/2, rh=r.height/2;
      const fx=(f.x+1)*rw+r.left, fy=(1-f.y)*rh+r.top, hx=(h.x+1)*rw+r.left, hy=(1-h.y)*rh+r.top, half=Math.abs(fy-hy)*.2;
      if(g.visible&&!W3.hideMe&&y<=Math.max(fy,hy)&&y>=Math.min(fy,hy)&&Math.abs(x-(fx+(hx-fx)*(y-fy)/((hy-fy)||1)))<half&&(!hit||hit.distance>d-.6*TILE))return {name:'YOU',kind:ONLINE.myName&&ONLINE.myName()||''}; }
    // a person or a creature: posed on the GPU as you are, so each body's outline on the screen, feet to head, the nearest one in front of what the ray met (owner, 8 Nov 2026: "the eye icon just says wall even when i clicked on the person")
    { let best=null; const cam=RC.ray.origin, B3=new THREE.Box3(), C=new THREE.Vector3();
      const body=(g,o)=>{ if(!g||!vis(g))return; B3.setFromObject(g); if(B3.isEmpty())return; B3.getCenter(C); const d=C.distanceTo(cam); if(hit&&hit.distance<d-.8*TILE||best&&best.d<d)return;
        const f=C.clone().setY(B3.min.y).project(SHARED.cam), h=C.clone().setY(B3.max.y).project(SHARED.cam), rw=r.width/2, rh=r.height/2, fx=(f.x+1)*rw+r.left, fy=(1-f.y)*rh+r.top, hx=(h.x+1)*rw+r.left, hy=(1-h.y)*rh+r.top;
        const wd=Math.max(4,Math.max(B3.max.x-B3.min.x,B3.max.z-B3.min.z)/Math.max(1e-3,B3.max.y-B3.min.y)*Math.abs(fy-hy)*.45, Math.abs(fy-hy)*.18);
        if(y>Math.max(fy,hy)+2||y<Math.min(fy,hy)-2||Math.abs(x-(fx+(hx-fx)*(y-fy)/((hy-fy)||1)))>wd)return; best={d,...o}; };
      for(const N of (NPCS.all?NPCS.all():[]))if(N&&N.g){ const t=UI.things.find(t=>t.obj&&(under(t.obj,N.g)||under(N.g,t.obj))); body(N.g,{name:t?up(t.name):up(N.name||'SOMEONE').replace(/[ _]\d+$/,'').replace(/ [MF]$/,''),kind:'',info:t?'DOUBLE-CLICK IT TO USE IT':''}); }   // (a name as its tag shows it: no number, no M or F)
      for(const o of ONLINE.others?ONLINE.others.values():[])if(o.fig&&o.fig.g)body(o.fig.g,{name:up(o.name||'A TENANT'),kind:'ANOTHER PLAYER'});
      if(best)return {name:best.name,kind:best.kind,info:best.info}; }
    // what the ray met belongs to something you can use (a helicopter, a car, a shop's door): that, whatever floor it counts as on
    { const own=hit&&UI.things.find(t=>t.obj&&vis(t.obj)&&under(hit.object,t.obj)); if(own&&own.name!=='YOU'){ const why=own.can&&own.can(); return {name:up(own.name),kind:own.player?'ANOTHER PLAYER':'',info:why&&why!==true?up(why):'DOUBLE-CLICK IT'+(own.key?' OR PRESS '+up(own.key):'')+' TO USE IT'}; } }
    if(T&&(!hit||th.distance<=hit.distance+1.5*TILE)){ const why=T.can&&T.can();
      if(T.name==='YOU')return {name:'YOU',kind:ONLINE.myName&&ONLINE.myName()||''};
      return {name:up(T.name),kind:T.player?'ANOTHER PLAYER':'',info:why&&why!==true?up(why):'DOUBLE-CLICK IT'+(T.key?' OR PRESS '+up(T.key):'')+' TO USE IT'}; }
    if(hit)for(const N of (NPCS.all?NPCS.all():NPCS))if(N&&N.g&&under(hit.object,N.g))return {name:up(N.name||'SOMEONE'),kind:'A PERSON'};
    const L=GPH.pick&&GPH.pick(RC); if(L&&L.th&&L.th.name&&(!hit||L.d<=hit.distance+.5*TILE))return {name:up(L.th.name),kind:'A LOOSE THING',info:'DOUBLE-CLICK TO PICK IT UP'};
    if(!hit||hit.distance>400*TILE)return {name:'THE SKY'};
    if(hit.object.name==='farcity'||hit.object.name==='skyline')return {name:'THE CITY',kind:'TOO FAR TO WALK TO'};
    const p=hit.point, z=ZONES.at(p.x,p.z,SHARED.LVL,ROOMS.cur), at=z&&z.name?up(z.name):'';
    // a painted prop: the name its maker gave it (the faces a prop's, as the world editor picks them)
    const OF=hit.object.userData.objOf, po=OF&&hit.faceIndex!=null&&OF[Math.floor(hit.faceIndex/2)];
    const IT=hit.object.userData.items, vi=hit.face&&hit.face.a, tr=Array.isArray(IT)&&vi!=null&&IT.find(q=>q&&q.k&&q.v0<=vi&&vi<q.v1);   // (the park's trees: each one's kind and its run of the mesh)
    if(tr)return {name:up(String(tr.k).replace(/\d+$/,'').replace(/([a-z])([A-Z])/g,'$1 $2')).replace(/ TREE$/,'')+' TREE',kind:at?'ON '+at:''};
    if(po&&po.name&&!/^object$/i.test(po.name))return {name:up(po.name),kind:at?((ROOMS.cur||SHARED.LVL!=='up')?'IN ':'ON ')+at:''};
    NV.copy(hit.face?hit.face.normal:NV.set(0,1,0)).transformDirection(hit.object.matrixWorld);
    const inside=!!ROOMS.cur||SHARED.LVL!=='up', name=/water/i.test((hit.object.material&&hit.object.material.name)||hit.object.name)?'WATER':NV.y>.6?(inside?'THE FLOOR':'THE GROUND'):NV.y<-.6?'A CEILING':'A WALL';
    if(!inside&&NV.y<.6&&STORE.rooms)for(const R of STORE.rooms){ const m=.3*TILE; if(p.x>Math.min(R.x0,R.x1)-m&&p.x<Math.max(R.x0,R.x1)+m&&p.z>Math.min(R.z0,R.z1)-m&&p.z<Math.max(R.z0,R.z1)+m&&p.y<R.y1+m)
      return {name:up(R.name),kind:'A BUILDING'+(at?' ON '+at:''),info:'DOUBLE-CLICK ITS DOOR TO GO IN'}; }   // (the street's shops: their name, from the wall)
    return {name,kind:at?(inside?'IN ':'ON ')+at:''}; };
  EYE.what=(el,x,y)=>el===renderer.domElement||el===document.body||el.id==='stage'||el.closest&&el.closest('#stage')?world(x,y):dom(el);
  addEventListener('pointerdown',e=>{ if(!EYE.on||e.target.closest&&e.target.closest('#heye'))return; e.preventDefault(); e.stopImmediatePropagation(); eat=performance.now()+600;
    let r; try{ r=EYE.what(e.target,e.clientX,e.clientY); }catch(err){ r={name:'SOMETHING',info:String(err&&err.message||err)}; } EYE.last=r; show(r,e.clientX,e.clientY); EYE.set(false); },true);
  for(const k of ['pointerup','mouseup','click','dblclick','contextmenu'])addEventListener(k,e=>{ if(performance.now()<eat){ e.preventDefault(); e.stopImmediatePropagation(); } },true);
  addEventListener('keydown',e=>{ if(EYE.on&&e.key==='Escape'){ e.preventDefault(); e.stopImmediatePropagation(); EYE.set(false); card.hidden=true; } },true);
  SYS.add('vitals',()=>{ if(!btn.parentElement){ const v=document.getElementById('vit'); if(v){ if(getComputedStyle(v).position==='static')v.style.position='relative'; v.appendChild(btn); } }
    if(!card.hidden&&!EYE.on&&performance.now()>hideT)card.hidden=true; },'162fa-eye');
  window.EYE=EYE; }
