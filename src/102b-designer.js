// THE DESIGNER: your Walker's shape — each part's size, turn and place, and his height — designed in a studio (you alone, turned all the way round), kept in OWNED as a short code and sent to the other players with your look.
import {THREE} from './003-shx.js';
import {LOOKS, W3} from './003b-systems.js';
import {renderer} from './004-main.js';
import {OWNED} from './005-save.js';
const DESIGN={}; window.DESIGN=DESIGN;
{ const R=RIG, D2R=Math.PI/180;
  // his studio light: a key over your left shoulder and a soft fill, no shadows from the street; the designer and the character page draw him in it
  const ROOM=new THREE.Scene(), KEY=new THREE.DirectionalLight(0xffffff,2.1), LC=new THREE.Vector3(-.45,.65,.62).normalize(), UP=new THREE.Vector3(0,1,0), CC=new THREE.Color(); ROOM.add(new THREE.AmbientLight(0xffffff,.6),KEY,KEY.target);
  DESIGN.portrait=(target,c,mat)=>{ const g=W3.group, home=g.parent, sv={vis:g.visible,lv:W3.lv.value,L:W3.L.clone()}; g.visible=true; ROOM.add(g); g.updateMatrixWorld(true);
    const lw=LC.clone().applyQuaternion(c.quaternion); KEY.target.position.copy(g.position); KEY.position.copy(g.position).addScaledVector(lw,10); KEY.target.updateMatrixWorld();
    W3.lv.value=1; W3.L.copy(lw).applyAxisAngle(UP,-g.rotation.y).normalize(); const m0=W3.mesh.material; if(mat)W3.mesh.material=mat;
    renderer.getClearColor(CC); const ca=renderer.getClearAlpha(); renderer.setRenderTarget(target); renderer.setClearColor(mat?0x000000:0x15171e,mat?0:1); renderer.clear(); renderer.render(ROOM,c);
    renderer.setRenderTarget(null); renderer.setClearColor(CC,ca); W3.mesh.material=m0; if(home)home.add(g); g.visible=sv.vis; W3.lv.value=sv.lv; W3.L.copy(sv.L); };
  // the parts you shape, each the pieces on one of his bones (a sleeve with its arm, the hair with the head); pairs end L / R
  const PARTS=['head','neck','torso','hips','upperArmL','upperArmR','forearmL','forearmR','handL','handR','thighL','thighR','shinL','shinR','footL','footR'];
  const NAME={head:'HEAD',neck:'NECK',torso:'CHEST',hips:'HIPS',upperArm:'UPPER ARM',forearm:'FOREARM',hand:'HAND',thigh:'THIGH',shin:'SHIN',foot:'FOOT'};
  const partOf=P=>{ const f=P.on||P.n, s=f.slice(-1); if(/^(head|hair|beard|ear|eye)/.test(f))return 'head'; if(f==='neck'||f==='torso'||f==='hips')return f;
    for(const [re,k] of [[/^(sleeve|upperArm)/,'upperArm'],[/^forearm/,'forearm'],[/^(hand|fing)/,'hand'],[/^thigh/,'thigh'],[/^shin/,'shin'],[/^(shoe|foot)/,'foot']])if(re.test(f))return k+s; return null; };
  const PART=W3.pcs.map(partOf);
  const blank=()=>({s:[1,1,1],r:[0,0,0],o:[0,0,0]}), plain=d=>d.s.every(v=>Math.abs(v-1)<1e-3)&&d.r.every(v=>Math.abs(v)<.5)&&d.o.every(v=>Math.abs(v)<.025);

  // the code: a byte for his height, then each shaped part's number and its nine values (sizes ½–2×, turns ±127°, moves ±6.4)
  const Q={s:v=>Math.round(128+128*Math.log2(v)), r:v=>Math.round(v)+128, o:v=>Math.round(v/.05)+128}, U={s:b=>Math.pow(2,(b-128)/128), r:b=>b-128, o:b=>(b-128)*.05};
  const clampB=b=>Math.max(0,Math.min(255,b));
  const encode=d=>{ const b=[1,clampB(Math.round(128+256*Math.log2(d.h||1)))];
    PARTS.forEach((k,i)=>{ const p=d.p[k]; if(!p||plain(p))return; b.push(i,...p.s.map(v=>clampB(Q.s(v))),...p.r.map(v=>clampB(Q.r(v))),...p.o.map(v=>clampB(Q.o(v)))); });
    if(b.length===2&&b[1]===128)return ''; return btoa(String.fromCharCode(...b)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); };
  const CACHE=new Map();
  const decode=c=>{ let d=CACHE.get(c); if(d)return d; d={h:1,p:{}};
    try{ if(c){ const s=atob(c.replace(/-/g,'+').replace(/_/g,'/')), b=[...s].map(ch=>ch.charCodeAt(0)); if(b[0]===1&&b.length>=2){ d.h=Math.pow(2,(b[1]-128)/256);
      for(let i=2;i+9<b.length;i+=10){ const k=PARTS[b[i]]; if(k)d.p[k]={s:b.slice(i+1,i+4).map(U.s),r:b.slice(i+4,i+7).map(U.r),o:b.slice(i+7,i+10).map(U.o)}; } } } }catch(e){ d={h:1,p:{}}; }
    CACHE.set(c,d); return d; };
  const eu=new THREE.Euler(), qt=new THREE.Quaternion();
  // a piece's edit with a design over it: its sizes times the design's, the design's turn and move in the bone's own frame
  const mix=(e,i,d)=>{ const k=PART[i], p=d&&d.p[k]; if(!p||plain(p))return e; const b=e||{s:[1,1,1],o:[0,0,0],q:[0,0,0,1]}, hand=/^hand/.test(k);
    const out={s:b.s.map((v,j)=>v*p.s[hand?0:j]),o:b.o,q:b.q}; if(!hand){ if(p.r.some(v=>Math.abs(v)>=.5))out.lq=qt.setFromEuler(eu.set(p.r[0]*D2R,p.r[1]*D2R,p.r[2]*D2R)).toArray(); if(p.o.some(v=>Math.abs(v)>=.025))out.lo=p.o.slice(); }
    return out; };

  // yours: kept in OWNED, on the Walker you play, in your look for the other players
  let mine=decode(OWNED.get('design')||''); mine={h:mine.h,p:JSON.parse(JSON.stringify(mine.p))};
  const apply=()=>{ const S=LOOKS.shape((LOOKS.L||{}).robe); W3.pcs.forEach((P,i)=>{ W3.E[i]=mix(S[i],i,mine); }); W3.BH=mine.h; };
  LOOKS.mix=(e,i)=>mix(e,i,mine);
  Object.assign(DESIGN,{PARTS,NAME,PART,partOf,encode,decode,mix,blank,plain,
    code:()=>encode(mine), get:()=>mine,
    set:d=>{ if(d!==mine)mine={h:d.h||1,p:JSON.parse(JSON.stringify(d.p||{}))}; apply(); try{ OWNED.set('design',encode(mine)); }catch(e){} }});
  apply();

  /* ---------- THE STUDIO: you alone in a dark room, turned and zoomed with the mouse; click a part, drag its handles or its sliders ---------- */
  DESIGN.open=()=>{ '@later';
    if(!DESIGN.el)studio(); DESIGN.el.hidden=false; DESIGN.on=true; DESIGN.view('front'); DESIGN.redraw(); requestAnimationFrame(DESIGN.loop); };
  function studio(){ '@later';
    const SW=560, SH=700, Y=new THREE.Vector3(0,1,0), V=new THREE.Vector3(), V2=new THREE.Vector3();
    const cam=new THREE.OrthographicCamera(-1,1,1,-1,.01,500); let rt=null, prt=null, az=0, elv=.12, zoom=1, h0=2, ty=0, sel='head', mode='size', mirror=true, last=0, drag=null;
    const undo=[], redo=[]; let snap=JSON.stringify(mine);
    const css=document.createElement('style'); css.textContent=`#design{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:22;display:flex;gap:12px;padding:12px;background:#0b0d13f4;border:2px solid #2a3040;color:#d8dbe4;font:11px Silkscreen,monospace;letter-spacing:.4px;zoom:var(--uiz,1);max-width:98vw;max-height:96vh} #design[hidden]{display:none}
      #design canvas{display:block;width:auto;height:min(${SH}px,86vh);aspect-ratio:${SW}/${SH};background:#15171e;cursor:grab;touch-action:none}
      #design .dz-side{width:250px;display:flex;flex-direction:column;gap:6px;overflow:auto} #design h3{margin:6px 0 2px;font-size:10px;color:#8a8f9c;letter-spacing:1px}
      #design .row{display:flex;flex-wrap:wrap;gap:4px;align-items:center} #design button{font:inherit;color:inherit;background:#1a1f2b;border:2px solid #2a3040;padding:3px 6px;cursor:pointer}
      #design button[aria-pressed=true]{border-color:#ffd27a;color:#ffd27a} #design .dz-part{display:grid;grid-template-columns:86px 1fr 1fr;gap:3px;align-items:center}
      #design input[type=range]{flex:1;accent-color:#ffd27a} #design .dz-v{width:44px;text-align:right;color:#ffd27a} #design .dz-t{color:#ffd27a;font-size:13px;letter-spacing:1px}`;
    document.head.appendChild(css);
    const el=document.createElement('div'); el.id='design'; el.hidden=true; el.setAttribute('role','dialog'); el.setAttribute('aria-label','Design your Walker');
    const pairs=['upperArm','forearm','hand','thigh','shin','foot'];
    el.innerHTML=`<canvas width="${SW}" height="${SH}" title="drag to turn him, wheel to zoom, right-drag to slide up and down, click a part to pick it"></canvas>
      <div class="dz-side"><div class="dz-t">DESIGN YOUR WALKER</div>
        <h3>VIEW</h3><div class="row">${['front','side','back','three'].map(v=>`<button data-view="${v}">${v==='three'?'¾':v.toUpperCase()}</button>`).join('')}</div>
        <h3>PART</h3><div class="row"><button data-part="head">HEAD</button><button data-part="neck">NECK</button><button data-part="torso">CHEST</button><button data-part="hips">HIPS</button></div>
        ${pairs.map(k=>`<div class="dz-part"><span>${NAME[k]}</span><button data-part="${k}L">LEFT</button><button data-part="${k}R">RIGHT</button></div>`).join('')}
        <div class="row"><button id="dzmir">MIRROR SIDES</button></div>
        <h3>CHANGE</h3><div class="row">${['size','turn','move'].map(m=>`<button data-mode="${m}">${m.toUpperCase()}</button>`).join('')}</div>
        <div id="dzsl"></div>
        <h3>HIS HEIGHT</h3><div class="row"><input type="range" id="dzh" min="-0.2" max="0.2" step="0.005"><span class="dz-v" id="dzhv"></span></div>
        <h3>&nbsp;</h3><div class="row"><button id="dzun">UNDO</button><button id="dzre">REDO</button><button id="dzrp">RESET PART</button><button id="dzra">RESET ALL</button></div>
        <div class="row" style="margin-top:auto"><button id="dzok" style="flex:1;border-color:#ffd27a;color:#ffd27a">DONE</button></div></div>`;
    document.body.appendChild(el); DESIGN.el=el;
    const cv=el.querySelector('canvas'), g2=cv.getContext('2d'), $=s=>el.querySelector(s);
    ['pointerdown','pointermove','pointerup','wheel','click','contextmenu','keydown'].forEach(t=>el.addEventListener(t,e=>e.stopPropagation()));
    addEventListener('keydown',e=>{ if(!DESIGN.on)return; e.stopPropagation(); if(e.key==='Escape'){ e.preventDefault(); close(); }
      else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){ e.preventDefault(); (e.shiftKey?doRedo:doUndo)(); } else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){ e.preventDefault(); doRedo(); } },true);
    addEventListener('keyup',e=>{ if(DESIGN.on)e.stopPropagation(); },true);

    // the design: the part you edit (and its mirror), kept after each change, undone and redone whole
    const part=k=>mine.p[k]||(mine.p[k]=blank()), twin=k=>/[LR]$/.test(k)?k.slice(0,-1)+(k.endsWith('L')?'R':'L'):null;
    const restF=k=>{ const i=PART.findIndex((p,j)=>p===k&&!W3.pcs[j].under&&!/^(hair|eyes|fing|sleeve|briefs)/.test(W3.pcs[j].n)); const P=W3.pcs[i<0?PART.indexOf(k):i]; return R.frameOf(P.on||P.n,W3.rest); };
    const M3=F=>new THREE.Matrix3().set(F.x.x,F.y.x,F.z.x, F.x.y,F.y.y,F.z.y, F.x.z,F.y.z,F.z.z);
    const mirrorTo=k=>{ const t=twin(k); if(!mirror||!t)return; const a=part(k), A=M3(restF(k)), B=M3(restF(t)), Bt=B.clone().transpose(), X=new THREE.Matrix3().set(-1,0,0,0,1,0,0,0,1);
      const o=new THREE.Vector3(...a.o).applyMatrix3(A).applyMatrix3(X).applyMatrix3(Bt);
      const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(a.r[0]*D2R,a.r[1]*D2R,a.r[2]*D2R)), m4=new THREE.Matrix4().makeRotationFromQuaternion(q), rm=new THREE.Matrix3().setFromMatrix4(m4);
      const body=A.clone().multiply(rm).multiply(A.clone().transpose()), mb=X.clone().multiply(body).multiply(X), loc=Bt.clone().multiply(mb).multiply(B), e=new THREE.Euler().setFromRotationMatrix(new THREE.Matrix4().setFromMatrix3(loc));
      mine.p[t]={s:a.s.slice(),r:[e.x/D2R,e.y/D2R,e.z/D2R],o:[o.x,o.y,o.z]}; };
    const changed=()=>{ mirrorTo(sel); DESIGN.set(mine); sliders(false); };
    const commit=()=>{ const s=JSON.stringify(mine); if(s===snap)return; undo.push(snap); if(undo.length>200)undo.shift(); redo.length=0; snap=s; };
    const load=s=>{ DESIGN.set(JSON.parse(s)); snap=s; DESIGN.redraw(); };
    const doUndo=()=>{ commit(); if(!undo.length)return; redo.push(snap); load(undo.pop()); }, doRedo=()=>{ if(!redo.length)return; undo.push(snap); load(redo.pop()); };

    // the sliders for the change you're making: sizes (half to double, the hand one size), turns (degrees), moves
    const SL={size:{min:-1,max:1,step:.01,get:v=>Math.log2(v),set:v=>Math.pow(2,v),show:v=>v.toFixed(2)+'×',key:'s'},turn:{min:-90,max:90,step:1,get:v=>v,set:v=>v,show:v=>Math.round(v)+'°',key:'r'},move:{min:-4,max:4,step:.05,get:v=>v,set:v=>v,show:v=>v.toFixed(2),key:'o'}};
    const AX=()=>/^hand/.test(sel)?(mode==='size'?['SIZE']:[]):mode==='size'?(/^(upperArm|forearm|thigh|shin|neck)/.test(sel)?['WIDTH','LENGTH','DEPTH']:['WIDTH','HEIGHT','DEPTH']):mode==='turn'?['TILT','TWIST','LEAN']:['SIDE','UP','FORWARD'];
    const sliders=build=>{ const box=$('#dzsl'), S=SL[mode], p=part(sel), ax=AX();
      if(build!==false){ box.innerHTML=ax.length?ax.map((n,j)=>`<div class="row"><span style="width:62px">${n}</span><input type="range" data-j="${j}" min="${S.min}" max="${S.max}" step="${S.step}"><span class="dz-v"></span></div>`).join(''):'<div style="color:#8a8f9c">hands change size only</div>';
        box.querySelectorAll('input').forEach(inp=>{ inp.oninput=()=>{ const j=+inp.dataset.j, v=S.set(+inp.value), q=part(sel); if(/^hand/.test(sel))q.s=[v,v,v]; else q[S.key][j]=v; changed(); }; inp.onchange=commit; }); }
      box.querySelectorAll('input').forEach(inp=>{ const j=+inp.dataset.j, v=p[S.key][j]; inp.value=S.get(v); inp.nextElementSibling.textContent=S.show(v); });
      $('#dzh').value=Math.log2(mine.h||1); $('#dzhv').textContent=(mine.h||1).toFixed(2)+'×'; };
    const pick=k=>{ sel=k; mode=/^hand/.test(k)?'size':mode; DESIGN.redraw(); };
    DESIGN.redraw=()=>{ el.querySelectorAll('[data-part]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.part===sel))); el.querySelectorAll('[data-mode]').forEach(b=>{ b.setAttribute('aria-pressed',String(b.dataset.mode===mode)); b.disabled=/^hand/.test(sel)&&b.dataset.mode!=='size'; });
      $('#dzmir').setAttribute('aria-pressed',String(mirror)); sliders(); };
    el.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b)return;
      if(b.dataset.part)pick(b.dataset.part); else if(b.dataset.mode){ mode=b.dataset.mode; DESIGN.redraw(); } else if(b.dataset.view)DESIGN.view(b.dataset.view);
      else if(b.id==='dzmir'){ mirror=!mirror; DESIGN.redraw(); } else if(b.id==='dzun')doUndo(); else if(b.id==='dzre')doRedo();
      else if(b.id==='dzrp'){ mine.p[sel]=blank(); if(mirror&&twin(sel))mine.p[twin(sel)]=blank(); DESIGN.set(mine); commit(); sliders(false); }
      else if(b.id==='dzra'){ DESIGN.set({h:1,p:{}}); commit(); sliders(false); } else if(b.id==='dzok')close(); });
    $('#dzh').oninput=e=>{ mine.h=Math.pow(2,+e.target.value); DESIGN.set(mine); sliders(false); }; $('#dzh').onchange=commit;
    const close=()=>{ commit(); el.hidden=true; DESIGN.on=false; };

    // the view: an orthographic camera round his middle; the front is where his eyes look
    const front=()=>{ const g=W3.group, hi=W3.idx('head'); if(hi<0||!W3.eyeAt)return 0; const e=W3.eyeAt(new THREE.Vector3()), h=new THREE.Vector3().setFromMatrixPosition(W3.PM.value[hi]).applyMatrix4(W3.mesh.matrixWorld); return Math.atan2(e.x-h.x,e.z-h.z); };
    DESIGN.view=v=>{ const f=front(); az=f+({front:0,side:Math.PI/2,back:Math.PI,three:Math.PI/4}[v]||0); el.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===v))); };
    const frame=()=>{ const g=W3.group, gp=g.getWorldPosition(V.clone()), head=W3.eyeAt&&W3.eyeAt(new THREE.Vector3()), top=(head?head.y:gp.y+2.2)+.3, bot=gp.y-.06; h0=(top-bot)*1.1;
      const hh=h0/2/zoom, hw=hh*SW/SH, c=new THREE.Vector3(gp.x,(top+bot)/2+ty,gp.z), d=h0*3+8;
      cam.left=-hw; cam.right=hw; cam.top=hh; cam.bottom=-hh; cam.near=.01; cam.far=d*2+40; cam.updateProjectionMatrix();
      cam.position.set(c.x+Math.sin(az)*Math.cos(elv)*d,c.y+Math.sin(elv)*d,c.z+Math.cos(az)*Math.cos(elv)*d); cam.up.copy(Y); cam.lookAt(c); cam.updateMatrixWorld(true); };
    const draw=(target,mat)=>DESIGN.portrait(target,cam,mat);
    const shot=()=>{ if(!W3.mesh)return; if(!rt){ rt=new THREE.WebGLRenderTarget(SW,SH); rt.texture.colorSpace=THREE.SRGBColorSpace; } frame(); draw(rt,null);
      const px=new Uint8Array(SW*SH*4); renderer.readRenderTargetPixels(rt,0,0,SW,SH,px); const im=g2.createImageData(SW,SH); for(let y=0;y<SH;y++)im.data.set(px.subarray((SH-1-y)*SW*4,(SH-y)*SW*4),y*SW*4); g2.putImageData(im,0,0); handles(); };
    DESIGN.loop=t=>{ if(!DESIGN.on)return; requestAnimationFrame(DESIGN.loop); if(t-last<33)return; last=t; shot(); };

    // a click on him picks the part under the mouse (each piece drawn as its number)
    const PICK=new THREE.ShaderMaterial({side:THREE.DoubleSide,uniforms:{uPM:W3.PM},vertexShader:`attribute float pidx; uniform mat4 uPM[${W3.pcs.length}]; varying float vp; void main(){ mat4 PM=uPM[int(pidx+0.5)]; vp=pidx; gl_Position=projectionMatrix*modelViewMatrix*(PM*vec4(position,1.)); }`,
      fragmentShader:`varying float vp; void main(){ gl_FragColor=vec4(floor(vp+0.5)+1.,0.,0.,1.); }`});
    const pickAt=(x,y)=>{ if(!prt)prt=new THREE.WebGLRenderTarget(SW,SH,{type:THREE.FloatType}); frame(); draw(prt,PICK); const b=new Float32Array(4); renderer.readRenderTargetPixels(prt,Math.round(x),Math.round(SH-1-y),1,1,b); const i=Math.round(b[0])-1; return i>=0?PART[i]:null; };

    // the handles: the picked part's three axes from its joint — squares to size it, rings to turn it, arrows to move it
    const HL=9, COL=['#e8604c','#7ed957','#5aa6ff'];
    const axes=()=>{ const k=sel, i=W3.idx(k==='head'?'head':k==='footL'?'shoeL':k==='footR'?'shoeR':k), B=W3.lastB; if(i<0||!B)return null; const P=W3.pcs[i], F=R.frameOf(P.on||P.n,B), p=part(k);
      const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(p.r[0]*D2R,p.r[1]*D2R,p.r[2]*D2R)), Mw=W3.mesh.matrixWorld;
      const fx=new THREE.Vector3(F.x.x,F.x.y,F.x.z), fy=new THREE.Vector3(F.y.x,F.y.y,F.y.z), fz=new THREE.Vector3(F.z.x,F.z.y,F.z.z);
      const o=new THREE.Vector3(F.o.x,F.o.y,F.o.z).addScaledVector(fx,p.o[0]).addScaledVector(fy,p.o[1]).addScaledVector(fz,p.o[2]);
      const loc=[new THREE.Vector3(1,0,0),new THREE.Vector3(0,1,0),new THREE.Vector3(0,0,1)].map(v=>v.applyQuaternion(q)), dirs=loc.map(v=>fx.clone().multiplyScalar(v.x).addScaledVector(fy,v.y).addScaledVector(fz,v.z));
      const S=w=>{ const v=w.clone().applyMatrix4(Mw).project(cam); return [(v.x+1)/2*SW,(1-v.y)/2*SH]; };
      const c=S(o), tips=dirs.map(d=>S(o.clone().addScaledVector(d,HL))), rings=dirs.map((d,j)=>{ const a=dirs[(j+1)%3], b=dirs[(j+2)%3]; return Array.from({length:33},(_,t)=>{ const th=t/32*Math.PI*2; return S(o.clone().addScaledVector(a,Math.cos(th)*HL*.8).addScaledVector(b,Math.sin(th)*HL*.8)); }); });
      return {c,tips,rings}; };
    let H=null;
    const handles=()=>{ H=axes(); if(!H)return; g2.lineWidth=3; const n=/^hand/.test(sel)?0:3;
      if(mode==='turn')H.rings.forEach((r,j)=>{ if(j>=n)return; g2.strokeStyle=COL[j]; g2.beginPath(); r.forEach((p,t)=>t?g2.lineTo(p[0],p[1]):g2.moveTo(p[0],p[1])); g2.stroke(); });
      else H.tips.forEach((t,j)=>{ if(j>=n)return; g2.strokeStyle=g2.fillStyle=COL[j]; g2.beginPath(); g2.moveTo(H.c[0],H.c[1]); g2.lineTo(t[0],t[1]); g2.stroke();
        if(mode==='size')g2.fillRect(t[0]-6,t[1]-6,12,12); else { const a=Math.atan2(t[1]-H.c[1],t[0]-H.c[0]); g2.beginPath(); g2.moveTo(t[0]+Math.cos(a)*9,t[1]+Math.sin(a)*9); g2.lineTo(t[0]+Math.cos(a+2.4)*9,t[1]+Math.sin(a+2.4)*9); g2.lineTo(t[0]+Math.cos(a-2.4)*9,t[1]+Math.sin(a-2.4)*9); g2.fill(); } });
      g2.fillStyle='#ffd27a'; g2.fillRect(H.c[0]-5,H.c[1]-5,10,10); };
    const grab=(x,y)=>{ if(!H)return null; const near=(p,r)=>Math.hypot(p[0]-x,p[1]-y)<r;
      if(mode!=='turn'&&near(H.c,9)&&mode==='size')return {j:-1};
      if(/^hand/.test(sel))return near(H.c,12)||H.tips.some(t=>near(t,10))?{j:-1}:null;
      if(mode==='turn'){ for(let j=0;j<3;j++){ const r=H.rings[j]; for(let t=0;t<r.length-1;t++)if(near(r[t],8)){ const a=r[t], b=r[t+1], l=Math.hypot(b[0]-a[0],b[1]-a[1])||1; return {j,t:[(b[0]-a[0])/l,(b[1]-a[1])/l]}; } } return null; }
      for(let j=0;j<3;j++)if(near(H.tips[j],11)){ const t=H.tips[j], l=Math.hypot(t[0]-H.c[0],t[1]-H.c[1])||1; return {j,t:[(t[0]-H.c[0])/l,(t[1]-H.c[1])/l],len:l}; } return null; };
    const xy=e=>{ const r=cv.getBoundingClientRect(); return [(e.clientX-r.left)*SW/r.width,(e.clientY-r.top)*SH/r.height]; };
    cv.addEventListener('pointerdown',e=>{ const [x,y]=xy(e); cv.setPointerCapture(e.pointerId); const h=e.button===0?grab(x,y):null;
      drag={x,y,x0:x,y0:y,h,pan:e.button===2||e.shiftKey,p0:JSON.parse(JSON.stringify(part(sel)))}; cv.style.cursor=h?'move':'grabbing'; });
    cv.addEventListener('pointermove',e=>{ if(!drag)return; const [x,y]=xy(e), dx=x-drag.x, dy=y-drag.y; drag.x=x; drag.y=y;
      if(drag.h){ const h=drag.h, p=part(sel), mx=x-drag.x0, my=y-drag.y0, along=h.t?mx*h.t[0]+my*h.t[1]:-my;
        if(mode==='size'){ const k=Math.pow(2,along/120); if(h.j<0)p.s=drag.p0.s.map(v=>Math.max(.5,Math.min(2,v*k))); else p.s[h.j]=Math.max(.5,Math.min(2,drag.p0.s[h.j]*k)); }
        else if(mode==='turn')p.r[h.j]=Math.max(-90,Math.min(90,drag.p0.r[h.j]+along*.6));
        else p.o[h.j]=Math.max(-4,Math.min(4,drag.p0.o[h.j]+along/h.len*HL));
        changed(); return; }
      if(drag.pan)ty+=dy/SH*h0/zoom; else { az-=dx*.012; elv=Math.max(-.6,Math.min(1.2,elv+dy*.008)); } });
    cv.addEventListener('pointerup',e=>{ if(!drag)return; const [x,y]=xy(e), moved=Math.hypot(x-drag.x0,y-drag.y0)>4; if(drag.h)commit(); else if(!moved&&e.button===0){ const k=pickAt(x,y); if(k)pick(k); } drag=null; cv.style.cursor='grab'; });
    cv.addEventListener('wheel',e=>{ e.preventDefault(); zoom=Math.max(1,Math.min(7,zoom*Math.pow(1.0015,-e.deltaY))); },{passive:false});
    cv.addEventListener('contextmenu',e=>e.preventDefault());
    DESIGN.test={pickAt,frame,shot,state:()=>({az,el:elv,zoom,ty,sel,mode,mirror,undo:undo.length,redo:redo.length}),grab:(x,y)=>grab(x,y),handles:()=>H,set:o=>{ if(o.sel)pick(o.sel); if(o.mode){ mode=o.mode; DESIGN.redraw(); } if(o.mirror!=null){ mirror=o.mirror; DESIGN.redraw(); } if(o.zoom)zoom=o.zoom; if(o.ty!=null)ty=o.ty; },edit:(key,j,v)=>{ const p=part(sel); p[key][j]=v; changed(); commit(); },undo:doUndo,redo:doRedo};
  }
  // YOU's button
  { const lp=document.getElementById('looks'); if(lp){ const h=document.createElement('h3'), r=document.createElement('div'); h.textContent='SHAPE'; r.className='row'; r.innerHTML='<button id="ldesign">DESIGN YOUR WALKER</button>';
      const at=lp.querySelector('h3'); lp.insertBefore(h,at); lp.insertBefore(r,at); r.querySelector('button').onclick=()=>{ lp.hidden=true; DESIGN.open(); }; } }
}
export {DESIGN};
