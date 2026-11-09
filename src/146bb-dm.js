// THE DUNGEON MASTER: Shift+Y lays out the dungeon's rooms and corridors, puts creatures in them and sets each one's strengths and behaviour; TRY IT plays the draft alone, PUBLISH (the owner) makes it the dungeon for everyone (worker/dunmobs.js).
import {SHARED} from './003-shx.js';
import {BUGS, pos} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {MODS, SYS, TILE} from './006-map-pre.js';
import {CREATS} from './087-npc-creatures.js';
const DM={open:false,draft:null,sel:null,room:0,pick:null,tab:'layout'}; window.DM=DM;
{ const KEY='dm.draft', BEH=['hunt','guard','wander','still','patrol','flee'], LOOT=['bone','slime','spider','gold','none'];
  const BH={hunt:'HUNTS YOU IN ITS ROOM',guard:'GUARDS ITS POST, CHASES ONLY NEAR IT',wander:'WANDERS; FIGHTS BACK ONLY WHEN STRUCK',still:'STANDS STILL, STRIKES WHAT COMES CLOSE',patrol:'WALKS BETWEEN TWO POINTS',flee:'KEEPS AWAY FROM YOU UNTIL STRUCK'};
  const save=()=>{ try{ localStorage.setItem(KEY,JSON.stringify(DM.draft)); }catch(e){} };
  const load=()=>{ try{ const d=JSON.parse(localStorage.getItem(KEY)||'null'); if(d&&Array.isArray(d.mobs))return d; }catch(e){} return null; };
  // every body the dungeon can hold: [id, NAME, group, defaults]
  const book=()=>{ const L=[], add=(id,nm,g,o)=>L.push({id,nm,g,...o});
    for(const [k,nm,hp,dmg,v] of [['green','GREEN SLIME',2,.025,.9],['blue','BLUE SLIME',3,.03,1.1],['purple','PURPLE SLIME',5,.05,1.3],['red','RED SLIME',7,.07,1.5]])add('s:'+k,nm,'SLIMES',{kind:'s',key:k,hp,dmg,v:v*1.2,reach:.75,loot:'slime'});
    for(const [k,nm,hp,dmg] of [['Rat','GIANT RAT',2,.03],['Frog','CAVE FROG',2,.02],['Snake','PIT SNAKE',3,.05],['Spider','RADIOACTIVE SPIDER',3,.05],['Wasp','GIANT WASP',2,.04],['Bat','CAVE BAT',2,.03]])add('cr:'+k,nm,'CREATURES',{kind:'c',key:'cr:'+k,hp,dmg,v:2,reach:.6,loot:k==='Spider'?'spider':'bone'});
    const DINO=/Raptor|Stego|Brachio|Ptera/, BUG=/Ant|Aphid|Ladybird|Hopper|Beetle|Mantis|Caterpillar|Slug|Snail|Bee|Firefly|Crab/;
    for(const [k,nm,m] of (CREATS&&CREATS.FA)||[])add('fa:'+k,nm,DINO.test(k)?'DINOSAURS':BUG.test(k)?'BUGS':'ANIMALS',{kind:'c',key:'fa:'+k,hp:Math.max(2,Math.round(2+m*4)),dmg:+Math.min(.2,.02+.03*m).toFixed(3),v:1.6,reach:Math.max(.5,Math.min(2.5,.4+m*.4)),size:m<.15?Math.min(8,.3/m):1,loot:'bone'});
    for(const [k,nm,hp,dmg,o] of [['skeleton_guard_light','SKELETON GUARD',3,.06],['skeleton_guard_heavy','HEAVY SKELETON',5,.08,{blk:.3}],['skeleton_mage','SKELETON MAGE',3,.06,{ranged:1,reach:5}],['skeleton_reaper','SKELETON REAPER',6,.1],
      ['ogre','OGRE',4,.05],['ogre_mage','OGRE MAGE',3,.05,{ranged:1,reach:5}],['ogre_guard_light','OGRE GUARD',4,.06],['ogre_guard_heavy','HEAVY OGRE',5,.07,{blk:.3}],['hero_m','HERO',5,.06],['hero_f','HEROINE',5,.06],['villager_m','VILLAGER',3,.03],['villager_f','VILLAGER WOMAN',3,.03],['golem','STONE GOLEM',12,.1,{v:.9,blk:.2}]])
      add('pw:'+k,nm,'PAWNS',{kind:'c',key:'pw:'+k,hp,dmg,v:1.5,reach:.8,loot:k==='golem'?'gold':'bone',...(o||{})});
    return L; };
  let BK=null; const B=()=>BK||(BK=book());
  const D=()=>MODS.dungeon, X=g=>SHARED.BOD.XS(g), Z=g=>SHARED.BOD.ZS(g), IX=x=>(x-SHARED.BOD.XS(0))/TILE, IZ=z=>(z-SHARED.BOD.ZS(0))/TILE;
  const fresh=()=>({v:'',map:D().map0(),mobs:[]});
  const roomAt=(gx,gy)=>{ const M=DM.draft.map, o=D(); for(let i=0;i<M.length;i++){ const r=M[i]; if(gx>o.OX+r[1]&&gx<o.OX+r[3]&&gy>o.OY+r[2]&&gy<o.OY+r[4])return {i,k:i+1,r}; } return null; };
  const tidy=()=>{ const d=DM.draft; for(const e of d.mobs){ const q=roomAt(IX(e.x),IZ(e.z)); e.r=q&&!q.r[6]?q.k:0; } d.mobs=d.mobs.filter(e=>e.r); };
  let uid=0; const mkE=(b,x,z)=>({id:'e'+Date.now().toString(36)+(uid++),kind:b.kind,key:b.key,name:b.nm,x:+x.toFixed(2),z:+z.toFixed(2),n:1,hp:b.hp,dmg:b.dmg,v:b.v,see:3.5,reach:b.reach,ranged:b.ranged||0,beh:'hunt',hostile:1,respawn:120,loot:b.loot,blk:b.blk||0,size:+(b.size||1).toFixed(2),px:0,pz:0});
  const build=()=>{ '@later'; if(DM.P)return DM.P;
    const css=document.createElement('style'); css.textContent=`
    #dmp{position:fixed;left:calc(12px + env(safe-area-inset-left,0px));top:12px;width:min(430px,calc(100vw - 24px));max-height:calc(100vh - 24px);overflow:auto;background:var(--bg);border:2px solid var(--line);font:12px var(--pixel);color:var(--fg);z-index:20;box-sizing:border-box}
    #dmp[hidden]{display:none} #dmp h2{font:12px var(--pixel);color:var(--key);margin:0;padding:12px 14px;border-bottom:2px solid var(--line)} #dmp .pane{padding:8px 14px}
    #dmp .row{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:5px 0} #dmp .btn{font:inherit;color:var(--fg);background:#0e1016;border:2px solid #3a3f4e;padding:5px 8px;cursor:pointer} #dmp .btn.on{border-color:var(--key);color:var(--key)}
    #dmp .dim{color:var(--dim)} #dmp .lab{width:96px} #dmp input,#dmp select{font:inherit;color:var(--fg);background:#0e1016;border:2px solid #3a3f4e;padding:3px 5px} #dmp input[type=number]{width:70px} #dmp input[type=text]{width:200px}
    #dmp canvas{display:block;width:100%;image-rendering:pixelated;background:#07080b;border:2px solid #3a3f4e;cursor:crosshair} #dmp .list{display:flex;flex-wrap:wrap;gap:4px;max-height:170px;overflow:auto}`;
    document.head.appendChild(css);
    const P=document.createElement('div'); P.id='dmp'; P.hidden=true; P.innerHTML=`<h2>DUNGEON MASTER</h2><div class="pane">
      <div class="row"><button class="btn" data-tab="layout">LAYOUT</button><button class="btn" data-tab="mobs">CREATURES</button><button class="btn" data-tab="props">PROPERTIES</button></div>
      <canvas id="dmmap" width="440" height="400"></canvas><div class="dim" id="dmhint"></div>
      <div id="dmtab"></div>
      <div class="row"><button class="btn" id="dmtry">TRY IT</button><button class="btn" id="dmstop">STOP TRYING</button><button class="btn" id="dmpub" hidden>PUBLISH</button></div>
      <div class="row"><button class="btn" id="dmlive">LOAD PUBLISHED</button><button class="btn" id="dmclear">NO CREATURES</button><button class="btn" id="dmgo">GO DOWN</button></div>
      <div class="dim" id="dmmsg"></div></div>`;
    document.body.appendChild(P); DM.P=P; const $=s=>P.querySelector(s), cv=$('#dmmap'), g=cv.getContext('2d');
    ['keydown','keyup','keypress'].forEach(ev=>P.addEventListener(ev,e=>{ if(e.target.matches('input,select'))e.stopPropagation(); }));
    P.addEventListener('mousedown',e=>e.stopPropagation()); P.addEventListener('wheel',e=>e.stopPropagation());
    const msg=t=>{ $('#dmmsg').textContent=t; };
    // the map: tiles to the canvas
    const view=()=>{ const M=DM.draft.map, w=Math.max(...M.map(r=>r[3]))+4, h=Math.max(...M.map(r=>r[4]))+4, k=Math.min(cv.width/w,cv.height/h); return {k,ox:2,oy:2}; };
    const toC=(gx,gy)=>{ const v=view(), o=D(); return [(gx-o.OX+v.ox)*v.k,(gy-o.OY+v.oy)*v.k]; }, toG=(cx,cy)=>{ const v=view(), o=D(); return [cx/v.k-v.ox+o.OX,cy/v.k-v.oy+o.OY]; };
    const COL={SLIMES:'#5ce04a',CREATURES:'#d8b060',ANIMALS:'#e8e0c0',DINOSAURS:'#e07040',BUGS:'#b0d040',PAWNS:'#c8c8ff'};
    const draw=()=>{ const d=DM.draft, o=D(); g.fillStyle='#07080b'; g.fillRect(0,0,cv.width,cv.height); const v=view();
      d.map.forEach((r,i)=>{ const [a,b]=toC(o.OX+r[1],o.OY+r[2]), w=(r[3]-r[1])*v.k, h=(r[4]-r[2])*v.k, t=r[5];
        g.fillStyle=r[6]?'#2a2622':`rgb(${60+t*120|0},${58-t*20|0},${54-t*24|0})`; g.fillRect(a,b,w,h); g.strokeStyle=DM.tab==='layout'&&DM.room===i+1?'#f2c14e':'#000'; g.lineWidth=DM.tab==='layout'&&DM.room===i+1?2:1; g.strokeRect(a+.5,b+.5,w-1,h-1);
        if(!r[6]){ g.fillStyle='#cfc4ae'; g.font='9px monospace'; g.fillText((i+1)+(r[0]?' '+r[0].replace(/^THE /,''):''),a+3,b+11); } if(i===0){ g.fillStyle='#8fd0ff'; g.fillText('STAIR',a+3,b+h-4); } });
      for(const e of d.mobs){ const [a,b]=toC(IX(e.x),IZ(e.z)), bk=B().find(q=>q.key===e.key&&q.kind===e.kind)||{}, c=COL[bk.g]||'#fff'; g.fillStyle=e.hostile?c:'#7fb0ff'; g.fillRect(a-2,b-2,5,5); if(e.n>1){ g.fillStyle='#fff'; g.font='8px monospace'; g.fillText('×'+e.n,a+4,b+3); }
        if(DM.sel===e){ g.strokeStyle='#f2c14e'; g.strokeRect(a-4.5,b-4.5,10,10); if(e.beh==='patrol'&&(e.px||e.pz)){ const [u,w]=toC(IX(e.x)+e.px,IZ(e.z)+e.pz); g.beginPath(); g.moveTo(a,b); g.lineTo(u,w); g.stroke(); } } }
      if(SHARED.LVL==='down'&&D().inside(pos.x,pos.z)){ const [a,b]=toC(IX(pos.x),IZ(pos.z)); g.fillStyle='#fff'; g.fillRect(a-2,b-2,4,4); } };
    DM.draw=draw;
    let drag=null; const cpos=e=>{ const R=cv.getBoundingClientRect(); return [(e.clientX-R.left)*cv.width/R.width,(e.clientY-R.top)*cv.height/R.height]; };
    cv.addEventListener('mousedown',e=>{ const [cx,cy]=cpos(e), [gx,gy]=toG(cx,cy), d=DM.draft;
      if(DM.tab==='mobs'&&DM.pick){ const q=roomAt(gx,gy); if(!q||q.r[6])return msg('PUT CREATURES IN A ROOM, NOT A CORRIDOR.'); const e2=mkE(DM.pick,X(gx),Z(gy)); e2.r=q.k; d.mobs.push(e2); DM.sel=e2; save(); msg(e2.name+' PUT IN ROOM '+q.k+'. PROPERTIES TO SET IT UP.'); return show(); }
      const hit=d.mobs.find(m=>{ const [a,b]=toC(IX(m.x),IZ(m.z)); return Math.hypot(a-cx,b-cy)<7; });
      if(hit&&DM.tab!=='layout'){ DM.sel=hit; drag={e:hit}; if(DM.tab!=='props')DM.tab='props'; return show(); }
      const q=roomAt(gx,gy); if(DM.tab==='layout'){ DM.room=q?q.k:0; if(q)drag={r:q.r,gx,gy,o:q.r.slice()}; return show(); } });
    addEventListener('mousemove',e=>{ if(!drag)return; const [cx,cy]=cpos(e), [gx,gy]=toG(cx,cy);
      if(drag.e){ const q=roomAt(gx,gy); if(q&&!q.r[6]){ drag.e.x=+X(gx).toFixed(2); drag.e.z=+Z(gy).toFixed(2); drag.e.r=q.k; } }
      else if(drag.r){ const dx=Math.round(gx-drag.gx), dy=Math.round(gy-drag.gy), r=drag.r, o=drag.o; if(o[1]+dx>=0&&o[2]+dy>=0){ r[1]=o[1]+dx; r[3]=o[3]+dx; r[2]=o[2]+dy; r[4]=o[4]+dy; } }
      draw(); });
    addEventListener('mouseup',()=>{ if(drag){ drag=null; tidy(); save(); show(); } });
    const field=(lab,html)=>`<div class="row"><span class="lab">${lab}</span>${html}</div>`;
    const num=(k,v,step,min,max)=>`<input type="number" data-k="${k}" value="${v}" step="${step}" min="${min}" max="${max}">`;
    const tabs={
      layout:()=>{ const d=DM.draft, r=d.map[DM.room-1];
        let h=`<div class="dim">CLICK A ROOM TO PICK IT, DRAG IT TO MOVE IT. ROOM 1 IS THE ENTRANCE WITH THE STAIR; CORRIDORS JOIN WHERE THEY TOUCH A ROOM.</div>`;
        if(r)h+=field('ROOM '+DM.room,`<input type="text" data-r="0" value="${r[0]}" placeholder="(a corridor has no name)">`)+field('DANGER',`<input type="range" data-r="5" min="0" max="1" step=".05" value="${r[5]}"> <span class="dim">${Math.round(r[5]*100)}%</span>`)
          +field('CORRIDOR',`<input type="checkbox" data-r="6" ${r[6]?'checked':''}>`)+field('SIZE',`<button class="btn" data-sz="-1,0">W−</button><button class="btn" data-sz="1,0">W+</button><button class="btn" data-sz="0,-1">H−</button><button class="btn" data-sz="0,1">H+</button> <span class="dim">${r[3]-r[1]} × ${r[4]-r[2]}</span>`)
          +field('MOVE',`<button class="btn" data-mv="-1,0">◀</button><button class="btn" data-mv="1,0">▶</button><button class="btn" data-mv="0,-1">▲</button><button class="btn" data-mv="0,1">▼</button>`)
          +(DM.room>1?`<div class="row"><button class="btn" id="dmdel">DELETE ROOM</button></div>`:'');
        return h+`<div class="row"><button class="btn" id="dmaddr">ADD ROOM</button><button class="btn" id="dmaddc">ADD CORRIDOR</button><button class="btn" id="dmreset">BUILT-IN LAYOUT</button></div>`; },
      mobs:()=>{ const gs=[...new Set(B().map(b=>b.g))], G=DM.grp||gs[0]; DM.grp=G;
        return `<div class="row">${gs.map(x=>`<button class="btn ${x===G?'on':''}" data-grp="${x}">${x}</button>`).join('')}</div>
          <div class="list">${B().filter(b=>b.g===G).map(b=>`<button class="btn ${DM.pick&&DM.pick.id===b.id?'on':''}" data-pick="${b.id}">${b.nm}</button>`).join('')}</div>
          <div class="dim">${DM.pick?'CLICK A ROOM ON THE MAP TO PUT A '+DM.pick.nm+' THERE, OR':'PICK A CREATURE, THEN CLICK A ROOM ON THE MAP, OR'}</div><div class="row"><button class="btn" id="dmfeet">PUT ONE AT MY FEET</button></div>`; },
      props:()=>{ const e=DM.sel; if(!e||!DM.draft.mobs.includes(e))return `<div class="dim">CLICK A CREATURE ON THE MAP TO SET IT UP. ${DM.draft.mobs.length} IN THE DUNGEON.</div>`;
        return `<div class="dim">${(B().find(b=>b.key===e.key&&b.kind===e.kind)||{nm:e.key}).nm} IN ROOM ${e.r}</div>`+field('NAME',`<input type="text" data-k="name" value="${e.name}">`)+field('HOW MANY',num('n',e.n,1,1,12))
          +field('HEALTH',num('hp',e.hp,1,1,999)+' <span class="dim">blows of 1</span>')+field('DAMAGE',num('dmg',e.dmg,.01,0,1)+' <span class="dim">of your health a blow</span>')+field('SPEED',num('v',e.v,.1,0,8)+' <span class="dim">tiles a second</span>')
          +field('SIGHT',num('see',e.see,.5,0,30)+' <span class="dim">tiles</span>')+field('REACH',num('reach',e.reach,.1,.2,12)+` <label><input type="checkbox" data-k="ranged" ${e.ranged?'checked':''}> SHOOTS</label>`)
          +field('SHIELD',num('blk',e.blk,.05,0,.8)+' <span class="dim">chance to block</span>')+field('SIZE',num('size',e.size,.1,.2,8))
          +field('BEHAVIOUR',`<select data-k="beh">${BEH.map(b=>`<option ${b===e.beh?'selected':''}>${b}</option>`).join('')}</select> <label><input type="checkbox" data-k="hostile" ${e.hostile?'checked':''}> HOSTILE</label>`)
          +`<div class="dim">${BH[e.beh]||''}${e.hostile?'':' — NEVER ATTACKS'}</div>`+(e.beh==='patrol'?field('PATROL TO',num('px',e.px,1,-60,60)+num('pz',e.pz,1,-60,60)+' <span class="dim">tiles away</span>'):'')
          +field('RESPAWN',num('respawn',e.respawn,10,0,3600)+' <span class="dim">s (0 never)</span>')+field('LOOT',`<select data-k="loot">${LOOT.map(b=>`<option ${b===e.loot?'selected':''}>${b}</option>`).join('')}</select>`)
          +`<div class="row"><button class="btn" id="dmdup">DUPLICATE</button><button class="btn" id="dmrm">REMOVE</button></div>`; } };
    const show=()=>{ P.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('on',b.dataset.tab===DM.tab)); $('#dmtab').innerHTML=tabs[DM.tab]();
      const d=DM.draft, L=window.DUNMOBS&&DUNMOBS.live; $('#dmhint').textContent=`${d.map.length} ROOMS AND CORRIDORS · ${d.mobs.reduce((a,e)=>a+e.n,0)} CREATURES IN THE DRAFT`+(window.DUNMOBS&&DUNMOBS.trying?' · TRYING IT':'')+(L?` · PUBLISHED: ${L.mobs.reduce((a,e)=>a+e.n,0)}${L.by?' BY '+L.by:''}`:' · PUBLISHED: EMPTY'); draw(); };
    DM.show=show;
    P.addEventListener('click',e=>{ const t=e.target.closest('button'); if(!t)return; const d=DM.draft, r=d.map[DM.room-1];
      if(t.dataset.tab){ DM.tab=t.dataset.tab; return show(); }
      if(t.dataset.grp){ DM.grp=t.dataset.grp; DM.pick=null; return show(); }
      if(t.dataset.pick){ DM.pick=B().find(b=>b.id===t.dataset.pick); return show(); }
      if(t.dataset.sz&&r){ const [a,b]=t.dataset.sz.split(',').map(Number); r[3]=Math.max(r[1]+(r[6]?3:6),r[3]+a*2); r[4]=Math.max(r[2]+(r[6]?3:6),r[4]+b*2); tidy(); save(); return show(); }
      if(t.dataset.mv&&r){ const [a,b]=t.dataset.mv.split(',').map(Number); if(r[1]+a>=0&&r[2]+b>=0){ r[1]+=a; r[3]+=a; r[2]+=b; r[4]+=b; } tidy(); save(); return show(); }
      const id=t.id;
      if(id==='dmaddr'||id==='dmaddc'){ const W=Math.max(...d.map.map(q=>q[3])), c=id==='dmaddc'; d.map.push(c?['',W,4,W+8,8,.5,1]:['A NEW ROOM',W,0,W+14,14,.5,0]); DM.room=d.map.length; msg(c?'A CORRIDOR: MOVE IT SO EACH END TOUCHES A ROOM.':'A NEW ROOM: JOIN IT TO THE REST WITH A CORRIDOR.'); save(); return show(); }
      if(id==='dmdel'&&DM.room>1){ d.map.splice(DM.room-1,1); DM.room=0; tidy(); save(); return show(); }
      if(id==='dmreset'){ d.map=D().map0(); DM.room=0; tidy(); save(); return show(); }
      if(id==='dmfeet'){ if(!DM.pick)return msg('PICK A CREATURE FIRST.'); if(SHARED.LVL!=='down')return msg('GO DOWN INTO THE DUNGEON FIRST.'); const q=roomAt(IX(pos.x),IZ(pos.z)); if(!q||q.r[6])return msg('STAND IN A ROOM, NOT A CORRIDOR.'); const e2=mkE(DM.pick,pos.x+Math.sin(SHARED.heading)*1.5*TILE,pos.z+Math.cos(SHARED.heading)*1.5*TILE); e2.r=q.k; d.mobs.push(e2); DM.sel=e2; save(); msg(e2.name+' PUT BESIDE YOU. TRY IT TO MEET IT.'); return show(); }
      if(id==='dmdup'&&DM.sel){ const e2={...DM.sel,id:'e'+Date.now().toString(36)+(uid++),x:DM.sel.x+.8*TILE}; d.mobs.push(e2); DM.sel=e2; tidy(); save(); return show(); }
      if(id==='dmrm'&&DM.sel){ d.mobs.splice(d.mobs.indexOf(DM.sel),1); DM.sel=null; save(); return show(); }
      if(id==='dmclear'){ d.mobs=[]; DM.sel=null; save(); msg('NO CREATURES IN THE DRAFT. TRY IT OR PUBLISH IT TO EMPTY THE DUNGEON.'); return show(); }
      if(id==='dmlive'){ const L=DUNMOBS.live; DM.draft=L?JSON.parse(JSON.stringify({...L,map:L.map||D().map0()})):fresh(); DM.sel=null; save(); msg('THE PUBLISHED DUNGEON IS IN THE DRAFT.'); return show(); }
      if(id==='dmtry'){ tidy(); DUNMOBS.tryIt(DM.draft).then(()=>{ msg('TRYING THE DRAFT: ONLY YOU SEE IT. STOP TRYING TO GO BACK.'); show(); }); return; }
      if(id==='dmstop'){ DUNMOBS.tryIt(null).then(()=>{ msg('BACK TO THE PUBLISHED DUNGEON.'); show(); }); return; }
      if(id==='dmpub'){ tidy(); if(DUNMOBS.publish(DM.draft))msg('SENT…'); return; }
      if(id==='dmgo'){ if(window.DUNGEON)DUNGEON.go(1); return; } });
    P.addEventListener('change',e=>{ const t=e.target, d=DM.draft;
      if(t.dataset.r!=null){ const r=d.map[DM.room-1]; if(!r)return; const i=+t.dataset.r; r[i]=i===0?String(t.value).toUpperCase().slice(0,32):i===6?(t.checked?1:0):+t.value; tidy(); save(); return show(); }
      if(t.dataset.k&&DM.sel){ const k=t.dataset.k, e2=DM.sel; e2[k]=t.type==='checkbox'?(t.checked?1:0):t.type==='number'?+t.value:k==='name'?String(t.value).toUpperCase().slice(0,32):t.value; save(); show(); } });
    P.addEventListener('input',e=>{ const t=e.target; if(t.type==='range'&&t.dataset.r==='5'){ const r=DM.draft.map[DM.room-1]; if(r){ r[5]=+t.value; t.nextElementSibling.textContent=Math.round(r[5]*100)+'%'; save(); draw(); } } });
    return P; };
  DM.toggle=async on=>{ if(window.LOAD)await LOAD('later'); if(window.LOAD)await LOAD('dungeon'); const P=build(); DM.open=on==null?!DM.open:!!on; P.hidden=!DM.open; if(!DM.open)return;
    if(!DM.draft)DM.draft=load()||(window.DUNMOBS&&DUNMOBS.live?JSON.parse(JSON.stringify({...DUNMOBS.live,map:DUNMOBS.live.map||D().map0()})):fresh()); DM.show();
    if(BUGS.owner)BUGS.owner().then(o=>{ P.querySelector('#dmpub').hidden=!o; }).catch(()=>{}); };
  addEventListener('keydown',e=>{ if(e.shiftKey&&!e.ctrlKey&&!e.metaKey&&(e.key==='Y'||e.key==='y')&&!(e.target&&e.target.matches&&e.target.matches('input,textarea,select'))){ e.preventDefault(); DM.toggle(); } });
  SYS.every(()=>{ if(DM.open&&DM.draw&&SHARED.LVL==='down')DM.draw(); },500,'146bb-dm map');
  let told=false; SYS.every(()=>{ if(!told&&SHARED.LVL==='down'&&MODS.dungeon&&MODS.dungeon.room){ told=true; SAY('SHIFT+Y: DUNGEON MASTER','#c8c2b0'); } },2000,'146bb-dm hint'); }
export {DM};
