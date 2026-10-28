// THE LOOKS: LOOKS keeps the player's name, colours, hair and body shape and puts them on the Walker.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, FORAGE, LEVELS, LOOKS, pos, st, UI, W3} from './003b-systems.js';
import {renderer, scene} from './004-main.js';
import {SAVE} from './005-save.js';
import {QS, SHL, TILE} from './006-map-pre.js';

{ const $=s=>document.querySelector(s), MATS=RIG.MATS;
  const COL={skin:'#e6c4b0',hair:'#6a5958',eye:'#5a3a26',shirt:'#a9a57e',pants:'#434e58',shoes:'#77614a'};
  const sz=(w,d=w)=>[w,1,d], LR=(n,v)=>({[n+'L']:v,[n+'R']:v}), arms=(u,f=u)=>({...LR('upperArm',sz(u)),...LR('sleeve',sz(u)),...LR('forearm',sz(f))}), legs=(t,sh=t)=>({...LR('thigh',sz(t)),...LR('shin',sz(sh))});
  const MALE={hips:[.81,1,.873],torso:sz(1.05,1.06),...arms(1.05,1.03),...legs(1.04,1)};
  const FEMALE={hips:[.97,1,.97],torso:sz(.9,.94),neck:sz(.88),...arms(.88,.86),...legs(1.04,.95),...LR('hand',sz(.88,.9)),...LR('shoe',[.9,.94,.9])};
  // the hairstyles and beards you choose from (new ones at the end of their list: a look's code keeps its meaning); '' is bald, or no beard
  const HAIRS=[['hair','SHORT'],['hairBuzz','BUZZ'],['hairSlick','SLICKED BACK'],['hairSpiky','SPIKY'],['hairMohawk','MOHAWK'],['hairCurly','CURLY'],['','BALD'],
    ['hairPixie','PIXIE'],['hairBob','BOB'],['hairPony','PONYTAIL'],['hairPigtails','PIGTAILS'],['hairBraid','BRAID'],['hairBun','BUN'],['hairLong','LONG'],['hairWavy','WAVY LONG']];
  const BEARDS=[['','NONE'],['beardStubble','STUBBLE'],['beardShort','SHORT'],['beardFull','FULL'],['beardGoatee','GOATEE'],['beardMoustache','MOUSTACHE']];
  const L={name:'',robe:false,bare:false,form:'M',hair:'hair',beard:''};
  try{ const o=JSON.parse(SAVE.get('looks')||'{}'); L.name=o.name||''; L.robe=!!o.robe; L.bare=!!o.bare; if(o.form==='F')L.form='F'; if(HAIRS.some(h=>h[0]===o.hair))L.hair=o.hair; if(L.form==='M'&&BEARDS.some(b=>b[0]===o.beard))L.beard=o.beard; }catch(e){}
  const save=()=>{ try{ SAVE.set('looks',JSON.stringify({name:L.name,robe:L.robe,bare:L.bare,form:L.form,hair:L.hair,beard:L.beard})); }catch(e){} };
  // a look's style as a short code for the other players (build, hair, beard), and back
  LOOKS.code=(o=L)=>(o.form==='F'?'F':'M')+Math.max(0,HAIRS.findIndex(h=>h[0]===o.hair)).toString(36)+Math.max(0,BEARDS.findIndex(b=>b[0]===o.beard)).toString(36);
  LOOKS.decode=c=>{ const h=HAIRS[parseInt((c||'')[1],36)], b=BEARDS[parseInt((c||'')[2],36)], form=(c||'')[0]==='F'?'F':'M'; return {form,hair:h?h[0]:'hair',beard:form==='M'&&b?b[0]:''}; };
  const tones=h=>{ const c=new THREE.Color(h); return [1,.9,.7,.42].map(k=>c.clone().multiplyScalar(k)); };
  const put=(A,i,r)=>{ A.c0.setXYZ(i,r[0].r,r[0].g,r[0].b); A.c1.setXYZ(i,r[1].r,r[1].g,r[1].b); A.c2.setXYZ(i,r[2].r,r[2].g,r[2].b); A.cd.setXYZ(i,(r[2].r+r[3].r)/2,(r[2].g+r[3].g)/2,(r[2].b+r[3].b)/2); if(A.color)A.color.setXYZ(i,r[1].r,r[1].g,r[1].b); };
  const recolor=()=>{ const g=W3.mesh.geometry, A=g.attributes, mt=A.mat.array, n=mt.length;
    for(let i=0;i<n;i++){ const r=W3.ramp[mt[i]|0]; if(r)put(A,i,r); }
    for(const k of ['c0','c1','c2','cd','color'])if(A[k])A[k].needsUpdate=true; };
  const RB={torso:[1.06,1,1.08],hips:[1.12,1,1.12],thighL:[1.14,1,1.14],thighR:[1.14,1,1.14],sleeveL:[1.12,1,1.12],sleeveR:[1.12,1,1.12],upperArmL:[1.08,1,1.08],upperArmR:[1.08,1,1.08]}, WHITE=tones('#f6f4ee'), BELT=tones('#c4ccd8'); let E0=null, EF=null;
  const shape=(on,form=L.form)=>W3.pcs.map((P,i)=>{ const e=(form==='F'?EF:E0)[i], k=on&&RB[P.n]; return k?{s:(e?e.s:[1,1,1]).map((v,j)=>v*k[j]),o:[0,0,0],q:[0,0,0,1]}:e; });
  LOOKS.shape=shape; LOOKS.robed=n=>!!RB[n];
  W3.recolor=()=>LOOKS.robe(L.robe); window.LOOKS=LOOKS;
  LOOKS.robe=on=>{ '@later'; L.robe=!!on; save(); recolor();
    shape(on).forEach((e,i)=>{ W3.E[i]=LOOKS.mix?LOOKS.mix(e,i):e; }); if(!on)return feet();
    const A=W3.mesh.geometry.attributes, n=A.mat.count, ti=W3.idx('torso'), hi=W3.idx('hips'), SK=W3.ramp[MATS.indexOf('skin')]; let y0=1e9, y1=-1e9, h1=-1e9;
    for(let i=0;i<n;i++){ const k=A.pidx.getX(i), y=A.position.getY(i); if(k===ti){ y0=Math.min(y0,y); y1=Math.max(y1,y); } else if(k===hi)h1=Math.max(h1,y); }
    for(let i=0;i<n;i++){ const P=W3.pcs[A.pidx.getX(i)|0], x=A.position.getX(i), y=A.position.getY(i), z=A.position.getZ(i); if(!P)continue;
      if(/^shin/.test(P.n)&&MATS[A.mat.getX(i)|0]==='pants')put(A,i,SK);
      else if(P.n==='torso'&&z>1.2&&y>y1-10&&Math.abs(x)<(y-y1+10)*.32)put(A,i,SK);
      else if(P.n==='torso'&&y<y0+5||P.n==='hips'&&y>h1-4)put(A,i,BELT);
      else if(RB[P.n])put(A,i,WHITE); }
    for(const k of ['c0','c1','c2','cd','color'])if(A[k])A[k].needsUpdate=true; feet(); };
  const feet=()=>{ if(!L.bare)return; const A=W3.mesh.geometry.attributes, n=A.mat.count, SK=W3.ramp[MATS.indexOf('skin')]; if(!SK)return;
    for(let i=0;i<n;i++){ const P=W3.pcs[A.pidx.getX(i)|0]; if(P&&/^shoe/.test(P.n))put(A,i,SK); } for(const k of ['c0','c1','c2','cd','color'])if(A[k])A[k].needsUpdate=true; };
  LOOKS.shoes=on=>{ '@later'; on=on===undefined?L.bare:!!on; if(on===!L.bare)return; L.bare=!on; save(); if(typeof RIG!=='undefined'&&RIG.act&&!st.move){ RIG.act(st,'C'); setTimeout(()=>RIG.release(st,'C'),650); }
    setTimeout(()=>{ LOOKS.robe(L.robe); draw(); },320); if(FORAGE.say)FORAGE.say(on?'YOU PUT YOUR SHOES BACK ON.':'YOU TAKE OFF YOUR SHOES.'); };
  const apply=()=>{ const set=(m,h)=>{ const i=MATS.indexOf(m); if(i>=0)W3.ramp[i]=tones(h); }; for(const k in COL)set(k,COL[k]); { const i=MATS.indexOf('lid'); if(i>=0)W3.ramp[i]=tones(COL.skin).map(c=>c.multiplyScalar(.78)); } recolor();
    for(let k=0;k<6;k++){ const i=W3.idx('eyes'+k); if(i>=0)W3.HIDE[i]=k!==0; } if(W3.dress)W3.dress(); else if(W3.reindex)W3.reindex(); };
  const css=document.createElement('style'); css.textContent=`#looks{position:fixed;right:12px;top:12px;width:330px;max-height:calc(100vh - 24px);overflow:auto;background:var(--panel,#10131b);border:2px solid var(--line,#2a3040);color:var(--fg,#d8dbe4);font:11px var(--pixel,monospace);padding:12px;z-index:30}
    #looks h2{margin:0 0 8px;font-size:13px;color:#ffd27a;letter-spacing:1px} #looks h3{margin:10px 0 4px;font-size:10px;color:var(--dim,#8a8f9c);letter-spacing:1px}
    #looks .row{display:flex;flex-wrap:wrap;gap:4px;align-items:center} #looks button{font:inherit;color:inherit;background:#1a1f2b;border:2px solid #2a3040;padding:3px 6px;cursor:pointer} #looks button[aria-pressed=true]{border-color:#ffd27a;color:#ffd27a}
    #looks input[type=text]{font:inherit;background:#0b0d13;color:inherit;border:2px solid #2a3040;padding:3px;width:180px}
    #looks .bar{height:8px;background:#0b0d13;border:1px solid #2a3040;flex:1} #looks .bar i{display:block;height:100%}`;
  document.head.appendChild(css);
  const P=document.createElement('div'); P.id='looks'; P.hidden=true; P.setAttribute('role','dialog'); P.setAttribute('aria-label','Your character');
  P.innerHTML=`<h2>YOU</h2><div class="row"><input type="text" id="lname" maxlength="24" placeholder="your name"><button id="lclose">CLOSE</button></div>
    <h3>BUILD</h3><div class="row" id="lform"></div><h3>HAIR</h3><div class="row" id="lhair"></div><h3 id="lbeardh">BEARD</h3><div class="row" id="lbeard"></div>
    <h3>CLOTHES</h3><div class="row"><button id="lwear0">YOUR CLOTHES</button><button id="lwear1">WHITE BATHROBE</button></div>
    <h3>SHOES</h3><div class="row"><button id="lshoe1">SHOES ON</button><button id="lshoe0">BAREFOOT</button><span id="lshoek" style="color:var(--dim,#8a8f9c)"></span></div>
    <h3>STATS</h3><div class="row"><span style="width:70px">HEALTH</span><div class="bar"><i id="lhp" style="background:#c84a3a;width:100%"></i></div></div>
    <div class="row" style="margin-top:4px"><span style="width:70px">STAMINA</span><div class="bar"><i id="lst" style="background:#d8b84a;width:100%"></i></div></div>`;
  document.body.appendChild(P);
  const rows=[['#lform','form',[['M','MALE'],['F','FEMALE']]],['#lhair','hair',HAIRS],['#lbeard','beard',BEARDS]];
  for(const [id,k,list] of rows)$(id).innerHTML=list.map(([v,t])=>`<button data-${k}="${v}">${t}</button>`).join('');
  LOOKS.style=(k,v)=>{ '@later'; L[k]=v; if(L.form==='F')L.beard=''; save(); W3.style={form:L.form,hair:L.hair,beard:L.beard}; W3.dress(); if(k==='form')LOOKS.robe(L.robe); draw(); };
  for(const [id,k] of rows)$(id).onclick=e=>{ const b=e.target.closest('button'); if(b)LOOKS.style(k,b.dataset[k]); };
  const draw=()=>{ '@later'; $('#lname').value=L.name; for(const [id,k] of rows)for(const b of $(id).children)b.setAttribute('aria-pressed',String(b.dataset[k]===L[k])); $('#lbeard').hidden=$('#lbeardh').hidden=L.form==='F'; $('#lwear0').setAttribute('aria-pressed',String(!L.robe)); $('#lwear1').setAttribute('aria-pressed',String(L.robe)); $('#lshoe1').setAttribute('aria-pressed',String(!L.bare)); $('#lshoe0').setAttribute('aria-pressed',String(L.bare)); $('#lshoek').textContent='KEY '+UI.keyOf('shoes').toUpperCase(); };
  $('#lwear0').onclick=()=>{ LOOKS.robe(false); draw(); }; $('#lwear1').onclick=()=>{ LOOKS.robe(true); draw(); }; $('#lshoe1').onclick=()=>LOOKS.shoes(true); $('#lshoe0').onclick=()=>LOOKS.shoes(false);
  $('#lname').oninput=e=>{ L.name=e.target.value; save(); };
  $('#lname').addEventListener('keydown',e=>e.stopPropagation());
  $('#lclose').onclick=()=>{ P.hidden=true; };
  LOOKS.open=()=>{ draw(); P.hidden=false; }; LOOKS.L=L; LOOKS.COL=COL;
  LOOKS.stats=(hp,st)=>{ if(P.hidden)return; $('#lhp').style.width=Math.round(hp*100)+'%'; $('#lst').style.width=Math.round(st*100)+'%'; };
  const hit=new THREE.Mesh(new THREE.BoxGeometry(.8*TILE,2.2*TILE,.8*TILE),new THREE.MeshBasicMaterial({visible:false})); scene.add(LEVELS.own(hit,'*'));
  renderer.domElement.addEventListener('pointerdown',()=>{ hit.position.set(pos.x,SHARED.py+1.1*TILE,pos.z); hit.updateMatrixWorld(); },true);
  UI.thing({name:'YOU',ghost:1,obj:hit,reach:99,tall:2,act:()=>LOOKS.open()});
  W3.E=W3.pcs.map(()=>null); W3.pcs.forEach((P,i)=>{ const v=MALE[P.under||P.n]; if(v)W3.E[i]={s:v.slice(),o:[0,0,0],q:[0,0,0,1]}; });
  E0=W3.E.map(e=>e&&{...e,s:e.s.slice()}); EF=W3.pcs.map(P=>{ const v=FEMALE[P.under||P.n]; return v?{s:v.slice(),o:[0,0,0],q:[0,0,0,1]}:null; });
  W3.style={form:L.form,hair:L.hair,beard:L.beard};
  const LT=new THREE.Vector3(), LS=new THREE.Vector3(), LSTEP=+(QS.get('lstep')??7)*Math.PI/180; let lt0=performance.now();
  LOOKS.light=()=>{ const now=performance.now(), k=1-Math.exp(-Math.min(.1,(now-lt0)/1000)*7); lt0=now; const sun=CLOCK.sun;
    if(sun&&sun.intensity>.3&&SHARED.LVL==='up')LT.copy(sun.position).sub(sun.target.position).normalize();
    else{ const best=SHL.find(S=>S.intensity>0); if(!best)return; LT.set(best.position.x-pos.x,Math.max(.25*TILE,best.position.y-(SHARED.py+1.2*TILE)),best.position.z-pos.z).normalize(); }
    if(!(LS.lengthSq()>.5))LS.copy(LT); else LS.lerp(LT,k).normalize();
    if(!W3.realL||!(W3.Lw.lengthSq()>.5)||W3.Lw.angleTo(LS)>LSTEP)W3.Lw.copy(LS); W3.realL=true; };
  apply(); if(L.robe||L.form==='F')LOOKS.robe(L.robe); else feet(); }
