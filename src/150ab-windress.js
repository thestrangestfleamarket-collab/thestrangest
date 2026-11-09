// THE WINDOWS' DRESSING: double-click a window of your apartment for its menu (open or shut it; curtains: none, sheer, linen, velvet, café; blinds: none, venetian, roller, roman, bamboo, shutters, lowered and tilted); the sun's rays through the glass, with dust in them, cut by what hangs there; saved with your apartment.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, ED, pos, SFX} from './003b-systems.js';
import {MODS, SYS} from './006-map-pre.js';
import {DRAPE} from './072a-cloth.js';
import {ROOMK} from './150a-bedroom.js';
const WINDR={wins:[],cur:null}; window.WINDR=WINDR;
{ const CUR={none:{n:'NONE'},sheer:{n:'SHEER',c:'#f4f1ea',op:.55,t:.6},linen:{n:'LINEN',c:'#d9ccb4',op:.93,t:.22},velvet:{n:'VELVET',c:'#6e1f2c',op:1,t:.03},cafe:{n:'CAFÉ',c:'#e8e0cc',op:.9,t:.25,half:1}};
  const BLI={none:{n:'NONE'},venetian:{n:'VENETIAN',c:'#ece6da',slat:1},roller:{n:'ROLLER',c:'#e2dccd',t:.14},roman:{n:'ROMAN',c:'#c9b79a',t:.12},bamboo:{n:'BAMBOO',c:'#b8955e',t:.38},shutters:{n:'SHUTTERS',c:'#f2efe6',slat:1}};
  const D0=()=>({c:'none',cd:0,cc:null,b:'none',bl:1,bt:.25,bc:null});
  const col=h=>new THREE.Color(h), rnd=(a,b)=>{ const x=Math.sin(a*127.1+b*311.7)*43758.5453; return x-Math.floor(x); };
  const cl=(x,a,b)=>Math.max(a,Math.min(b,x));
  const clipOf=k=>{ const P=MODS.apts&&MODS.apts.WPL&&MODS.apts.WPL[k]; return P?[P]:[]; };
  const lam=(c,k,o={})=>new THREE.MeshLambertMaterial({color:col(c),side:THREE.DoubleSide,clippingPlanes:clipOf(k),...o});
  const add=(g,geo,m,x,y,z,sh=true)=>{ const me=new THREE.Mesh(geo,m); me.position.set(x,y,z); me.castShadow=sh; me.receiveShadow=true; g.add(me); return me; };

  // a fabric's weave and an old bamboo blind's slats, painted once
  const weave=(()=>{ let T=null; return ()=>{ if(T)return T; const cv=document.createElement('canvas'); cv.width=cv.height=128; const g=cv.getContext('2d'); g.fillStyle='#fff'; g.fillRect(0,0,128,128);
    for(let i=0;i<128;i+=2){ g.fillStyle=`rgba(0,0,0,${.04+.03*rnd(i,1)})`; g.fillRect(i,0,1,128); g.fillStyle=`rgba(0,0,0,${.03+.03*rnd(i,2)})`; g.fillRect(0,i,128,1); }
    T=new THREE.CanvasTexture(cv); T.wrapS=T.wrapT=THREE.RepeatWrapping; T.repeat.set(6,10); T.colorSpace=THREE.SRGBColorSpace; return T; }; })();
  const reed=(()=>{ let T=null; return ()=>{ if(T)return T; const cv=document.createElement('canvas'); cv.width=32; cv.height=256; const g=cv.getContext('2d');
    for(let y=0;y<256;y+=4){ const k=.82+.25*rnd(y,3); g.fillStyle=`rgb(${255*k|0},${232*k|0},${190*k|0})`; g.fillRect(0,y,32,3); g.fillStyle='rgba(60,40,20,.5)'; g.fillRect(0,y+3,32,1); }
    T=new THREE.CanvasTexture(cv); T.wrapS=T.wrapT=THREE.RepeatWrapping; T.repeat.set(1,4); T.colorSpace=THREE.SRGBColorSpace; return T; }; })();

  /* ---------- what hangs at a window, rebuilt when its settings change ---------- */
  const clothOf=me=>{ const P=me.geometry.attributes.position, nx=19, ny=P.count/nx; return Object.assign(DRAPE.make(P.array,DRAPE.grid(nx,ny),new Uint8Array(P.count).fill(1,0,nx)),{me,nx,ny}); };
  const dress=W=>{ const d=W.d, {w,z0,z1,k}=W, H=z1-z0; if(W.dg){ W.dg.traverse(o=>{ if(o.geometry)o.geometry.dispose(); }); W.dg.removeFromParent(); } const g=new THREE.Group(); W.g.add(g); W.dg=g; W.cloth=[]; W.inst=[]; W.leaves=null;
    // the curtains: two panels of cloth on a rod, drawn from tied back to shut
    const C=CUR[d.c]; if(C&&d.c!=='none'){ const half=C.half, rodY=half?(z0+z1)/2+.04:z1+.18, rm=lam('#281e18',k);
      add(g,new THREE.CylinderGeometry(.012,.012,w+(half?.1:.8),10).rotateZ(Math.PI/2),rm,0,rodY,.08,false); if(!half)for(const s of [-1,1])add(g,new THREE.SphereGeometry(.024,10,8),rm,s*(w/2+.4),rodY,.08,false);
      const m=lam(d.cc||C.c,k,{map:weave(),transparent:C.op<1,opacity:C.op,depthWrite:C.op>=1}), cd=cl(d.cd,0,1);
      for(const s of [-1,1]){ const top=rodY-.01, bot=half?z0-.04:d.c==='sheer'?Math.max(.5,z0-.4):.03, cg=new THREE.PlaneGeometry(1,1,18,26), p=cg.attributes.position;
        const outer=s*(w/2+(half?.02:.38)), inner=s*((w/2-.08)*(1-cd)+.012*cd);
        for(let i=0;i<p.count;i++){ const a=p.getX(i)+.5, b=.5-p.getY(i), h=top-(top-bot)*b, gather=(.35+.65*Math.pow(1-b,1.4))*(1-cd)+cd, u=outer+(inner-outer)*a*(half?1:gather);
          p.setXYZ(i,u,h,.09+Math.sin(a*Math.PI*(6+4*cd)+s)*(.03-.012*cd)*(.4+b)+.02*b); }
        cg.computeVertexNormals(); const me=add(g,cg,m,0,0,0); me.castShadow=C.op>.8; W.cloth.push(clothOf(me)); } }
    // the blinds
    const B=BLI[d.b]; if(B&&d.b!=='none'){ const bc=d.bc||B.c, lv=cl(d.bl,0,1), yb=z1-lv*H, m=lam(bc,k), z=.035;
      if(d.b==='venetian'){ const n=Math.round(H/.026), inst=new THREE.InstancedMesh(new THREE.BoxGeometry(w-.03,.0025,.026),m,n), M4=new THREE.Matrix4(), q=new THREE.Quaternion(), e=new THREE.Euler(cl(d.bt,0,1)*1.35,0,0), S=new THREE.Vector3(1,1,1); q.setFromEuler(e);
        const down=Math.max(0,Math.floor((z1-yb)/.026)); for(let i=0;i<n;i++){ const y=i<down?z1-.02-i*.026:z1-.02-down*.026-(i-down)*.005; M4.compose(new THREE.Vector3(0,y,z),i<down?q:new THREE.Quaternion(),S); inst.setMatrixAt(i,M4); }
        inst.castShadow=inst.receiveShadow=true; g.add(inst); add(g,new THREE.BoxGeometry(w+.02,.03,.045),m,0,z1+.005,z); add(g,new THREE.BoxGeometry(w-.02,.012,.03),m,0,Math.min(yb,z1-.02-down*.026-(n-down)*.005),z);
        for(const s of [-.3,.3])add(g,new THREE.BoxGeometry(.004,Math.max(.01,z1-yb),.004),lam('#d8d2c4',k),s*w,(z1+yb)/2,z+.016,false); }
      else if(d.b==='roller'||d.b==='bamboo'){ const L=Math.max(.001,z1-yb), sm=d.b==='bamboo'?lam(bc,k,{map:reed()}):lam(bc,k,{map:weave()}), roll=.022+(1-lv)*.02;
        add(g,new THREE.PlaneGeometry(w-.02,L),sm,0,z1-L/2,z); add(g,new THREE.CylinderGeometry(roll,roll,w,14).rotateZ(Math.PI/2),sm,0,d.b==='bamboo'?yb:z1+.02,z+.01); if(d.b==='roller')add(g,new THREE.BoxGeometry(w-.02,.018,.012),lam('#8c8478',k),0,yb,z); }
      else if(d.b==='roman'){ const L=Math.max(.001,z1-yb), sm=lam(bc,k,{map:weave()}), nf=Math.round((1-lv)*6); add(g,new THREE.BoxGeometry(w+.02,.03,.05),sm,0,z1+.01,z);
        add(g,new THREE.PlaneGeometry(w-.02,L),sm,0,z1-L/2,z); for(let i=0;i<nf;i++)add(g,new THREE.CylinderGeometry(.03,.03,w-.02,12,1,false,0,Math.PI).rotateZ(Math.PI/2).rotateX(-Math.PI/2),sm,0,yb-.01-i*.012,z+.012); }
      else if(d.b==='shutters'){ const fm=lam(bc,k); W.leaves=[]; for(const s of [-1,1]){ const hinge=new THREE.Group(); hinge.position.set(s*w/2,0,.05); hinge.rotation.y=s*(1-lv)*1.55; g.add(hinge); const lw=w/2-.005, cx=-s*lw/2;
          for(const [a,b] of [[0,.03],[lw-.03,lw]])add(hinge,new THREE.BoxGeometry(.03,H,.025),fm,-s*((a+b)/2),(z0+z1)/2,0); add(hinge,new THREE.BoxGeometry(lw,.04,.025),fm,cx,z1-.02,0); add(hinge,new THREE.BoxGeometry(lw,.04,.025),fm,cx,z0+.02,0); add(hinge,new THREE.BoxGeometry(lw,.04,.025),fm,cx,(z0+z1)/2,0);
          const n=Math.round((H-.12)/.04), inst=new THREE.InstancedMesh(new THREE.BoxGeometry(lw-.06,.004,.035),fm,n), M4=new THREE.Matrix4(), q=new THREE.Quaternion().setFromEuler(new THREE.Euler(.3+cl(d.bt,0,1)*1.1,0,0)), S=new THREE.Vector3(1,1,1);
          for(let i=0;i<n;i++){ M4.compose(new THREE.Vector3(cx,z0+.06+i*(H-.12)/n,0),q,S); inst.setMatrixAt(i,M4); } inst.castShadow=inst.receiveShadow=true; hinge.add(inst); W.leaves.push(hinge); } } }
    rays(W); };

  /* ---------- the sun's rays through a window: the glass's shape thrown along the light to the floor, glowing faintly in the air, dust turning in it; whatever hangs at the window cuts it ---------- */
  const RAYV=`attribute vec3 aw; uniform vec3 uD; uniform float uW,uZ0,uZ1,uT; varying vec3 vw; varying float vy;
    #include <clipping_planes_pars_vertex>
    void main(){ vw=aw; float y=uZ0+aw.y*(uZ1-uZ0); vec3 b=vec3((aw.x-.5)*uW,y,.03); float L=min(9.,y/max(.05,-uD.y)); vec3 p=b+uD*L*aw.z; vy=p.y;
      vec4 mvPosition=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mvPosition;
      #include <clipping_planes_vertex>
    }`;
  const MASK=`uniform float uI,uCd,uCt,uHalf,uBl,uBt,uSlat,uTilt,uOpenL; uniform vec3 uCol;
    float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
    float mask(vec2 w){ float m=1.; float cv=uHalf>.5?step(w.y,.5):1.; if(abs(w.x-.5)>.5*(1.-uCd))m*=mix(1.,uCt,cv);
      if(w.y>1.-uBl){ if(uSlat>.5){ float f=fract(w.y*uSlat); m*=mix(1.,smoothstep(uTilt*.95,uTilt*.95+.05,f)*.95+.05,step(.01,uTilt)); m*=uOpenL; } else m*=uBt; }
      return m; }`;
  const RAYF=`varying vec3 vw; varying float vy; uniform float uT;
    #include <clipping_planes_pars_fragment>
    ${MASK}
    void main(){
      #include <clipping_planes_fragment>
      float e=smoothstep(0.,.08,vw.x)*smoothstep(0.,.08,1.-vw.x)*smoothstep(0.,.06,vw.y)*smoothstep(0.,.06,1.-vw.y);
      float a=uI*mask(vw.xy)*pow(1.-vw.z,1.3)*e*(.8+.2*sin(uT*.6+vw.x*9.+vw.z*5.)); if(vy<0.)discard; gl_FragColor=vec4(uCol*a,1.); }`;
  const DUSTV=`attribute vec4 aw; uniform vec3 uD; uniform float uW,uZ0,uZ1,uT; varying vec3 vw; varying float vk;
    #include <clipping_planes_pars_vertex>
    void main(){ float s=aw.w; vec3 q=vec3(fract(aw.x+sin(uT*.05+s*6.)*.03),fract(aw.y+uT*.004*(.5+fract(s*7.))-.0),aw.z); vw=q; float y=uZ0+q.y*(uZ1-uZ0); vec3 b=vec3((q.x-.5)*uW,y,.03); float L=min(9.,y/max(.05,-uD.y));
      vec3 p=b+uD*L*q.z+vec3(sin(uT*.3+s*20.),sin(uT*.21+s*13.),cos(uT*.27+s*17.))*.025; vk=.5+.5*sin(uT*1.7+s*40.);
      vec4 mvPosition=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mvPosition; gl_PointSize=clamp(5./-mvPosition.z,1.,4.);
      #include <clipping_planes_vertex>
    }`;
  const DUSTF=`varying vec3 vw; varying float vk;
    #include <clipping_planes_pars_fragment>
    ${MASK}
    void main(){
      #include <clipping_planes_fragment>
      vec2 c=gl_PointCoord-.5; float r=1.-smoothstep(.2,.5,length(c)); float a=uI*6.*mask(vw.xy)*(1.-vw.z)*r*vk; gl_FragColor=vec4(uCol*a,1.); }`;
  const rays=W=>{ if(!W.ru){ const u={uD:{value:new THREE.Vector3(0,-1,.5)},uW:{value:W.w},uZ0:{value:W.z0},uZ1:{value:W.z1},uT:{value:0},uI:{value:0},uCd:{value:0},uCt:{value:1},uHalf:{value:0},uBl:{value:0},uBt:{value:1},uSlat:{value:0},uTilt:{value:0},uOpenL:{value:1},uCol:{value:new THREE.Color(1,.86,.66)}}; W.ru=u;
      // the prism's four sides and a few slices through it, each corner carrying (across, up, along the light)
      const A=[], quad=(a,b,c,d)=>A.push(...a,...b,...c,...a,...c,...d);
      for(const [p,q] of [[[0,0],[1,0]],[[1,0],[1,1]],[[1,1],[0,1]],[[0,1],[0,0]]])quad([...p,0],[...q,0],[...q,1],[...p,1]);
      for(const f of [.25,.5,.75]){ quad([f,0,0],[f,1,0],[f,1,1],[f,0,1]); quad([0,f,0],[1,f,0],[1,f,1],[0,f,1]); }
      const geo=new THREE.BufferGeometry(); geo.setAttribute('aw',new THREE.Float32BufferAttribute(A,3)); geo.setAttribute('position',new THREE.Float32BufferAttribute(new Array(A.length).fill(0),3));
      const sm=o=>Object.assign(new THREE.ShaderMaterial({uniforms:u,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,clipping:true,...o}),{clippingPlanes:clipOf(W.k)});
      const me=new THREE.Mesh(geo,sm({vertexShader:RAYV,fragmentShader:RAYF})); me.frustumCulled=false; me.renderOrder=3; me.raycast=()=>{}; me.userData.ray=1;
      const N=90, D=[]; for(let i=0;i<N;i++)D.push(rnd(i,W.z0*7),rnd(i,11),Math.pow(rnd(i,13),.8),rnd(i,17)); const dg=new THREE.BufferGeometry(); dg.setAttribute('aw',new THREE.Float32BufferAttribute(D,4)); dg.setAttribute('position',new THREE.Float32BufferAttribute(new Array(N*3).fill(0),3));
      const dust=new THREE.Points(dg,sm({vertexShader:DUSTV,fragmentShader:DUSTF})); dust.frustumCulled=false; dust.renderOrder=3; dust.raycast=()=>{};
      W.g.add(me); W.g.add(dust); W.rm=[me,dust]; }
    const d=W.d, u=W.ru, C=CUR[d.c]||CUR.none, B=BLI[d.b]||BLI.none; u.uCd.value=d.c==='none'?0:(C.half?1:cl(d.cd,0,1)); u.uCt.value=C.t??1; u.uHalf.value=C.half?1:0;
    u.uBl.value=d.b==='none'?0:d.b==='shutters'?(d.bl>.5?1:0):cl(d.bl,0,1); u.uBt.value=B.t??1; u.uSlat.value=B.slat?((W.z1-W.z0)/.026):0; u.uTilt.value=B.slat?cl(d.bt,0,1):0; };

  /* ---------- the menu ---------- */
  const P=document.createElement('div'); P.id='winp'; P.hidden=true;
  P.style.cssText='position:fixed;left:50%;top:12%;transform:translateX(-50%);width:min(420px,94vw);z-index:21;padding:12px 14px;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#3b2a1e;background:#ece5d3;border:3px solid #3b2a1e;zoom:var(--uiz,1)';
  const css=document.createElement('style'); css.textContent='#winp .row{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:8px 0} #winp .row>span:first-child{width:84px} #winp input[type=range]{flex:1;min-width:120px} #winp .btn{font:inherit;padding:4px 7px;background:#ece5d3;color:#3b2a1e;border:2px solid #3b2a1e;cursor:pointer} #winp .btn.on{background:#3b2a1e;color:#ece5d3} #winp .mclose{float:right} #winp .dim{opacity:.6}';
  document.head.appendChild(css); document.body.appendChild(P);
  const guest=()=>!!(ED.HOME&&ED.HOME.guest);
  let saveT=0; const save=()=>{ clearTimeout(saveT); saveT=setTimeout(()=>{ if(ED.snapshot&&ED.HOME&&!guest())ED.HOME.save(ED.snapshot()); },1200); };
  const draw=()=>{ '@later'; const W=WINDR.cur; if(!W){ P.hidden=true; return; } const d=W.d, ro=guest(), b=(k,v,on,lab)=>`<button class="btn ${on?'on':''}" data-k="${k}" data-v="${v}" ${ro&&k!=='open'?'disabled':''}>${lab}</button>`;
    P.innerHTML=`<div><b>WINDOW</b>${ro?' <span class="dim">(LOOK ONLY)</span>':''} <button class="btn mclose" data-k="close">DONE</button></div>
      <div class="row"><span>THE SASH</span>${b('open',1,W.open,'OPEN')}${b('open',0,!W.open,'SHUT')}</div>
      <div class="row"><span>CURTAINS</span>${Object.entries(CUR).map(([k,o])=>b('c',k,d.c===k,o.n)).join('')}</div>
      ${d.c!=='none'&&!CUR[d.c].half?`<div class="row"><span>DRAWN</span><input type="range" min="0" max="100" value="${Math.round(d.cd*100)}" data-r="cd" ${ro?'disabled':''}></div>`:''}
      ${d.c!=='none'?`<div class="row"><span>COLOUR</span><input type="color" value="${d.cc||CUR[d.c].c}" data-r="cc" ${ro?'disabled':''}></div>`:''}
      <div class="row"><span>BLINDS</span>${Object.entries(BLI).map(([k,o])=>b('b',k,d.b===k,o.n)).join('')}</div>
      ${d.b!=='none'?`<div class="row"><span>${d.b==='shutters'?'SHUT':'LOWERED'}</span><input type="range" min="0" max="100" value="${Math.round(d.bl*100)}" data-r="bl" ${ro?'disabled':''}></div>`:''}
      ${BLI[d.b]&&BLI[d.b].slat?`<div class="row"><span>TILT</span><input type="range" min="0" max="100" value="${Math.round(d.bt*100)}" data-r="bt" ${ro?'disabled':''}></div>`:''}
      ${d.b!=='none'?`<div class="row"><span>COLOUR</span><input type="color" value="${d.bc||BLI[d.b].c}" data-r="bc" ${ro?'disabled':''}></div>`:''}
      ${ro?'':`<div class="row"><span></span><button class="btn" data-k="all">DRESS EVERY WINDOW THE SAME</button></div>`}`; };
  WINDR.open=W=>{ WINDR.cur=W; draw(); P.hidden=false; }; WINDR.close=()=>{ P.hidden=true; WINDR.cur=null; };
  P.addEventListener('click',e=>{ const t=e.target.closest('button[data-k]'); if(!t)return; const W=WINDR.cur, k=t.dataset.k, v=t.dataset.v; if(!W)return;
    if(k==='close')return WINDR.close();
    if(k==='open'){ W.open=v==='1'; W.th.name=W.open?'WINDOW (OPEN)':'WINDOW'; if(SFX)SFX.play('latch',{vol:.5,vary:.2}); return draw(); }
    if(guest())return;
    if(k==='all'){ for(const X of WINDR.wins)if(X!==W){ X.d={...W.d}; dress(X); } save(); return; }
    W.d[k]=v; if(k==='c'&&v!=='none'&&W.d.cd==null)W.d.cd=0; if(k==='c')W.d.cc=null; if(k==='b'){ W.d.bc=null; W.d.bl=v==='shutters'?1:W.d.bl; } if(SFX)SFX.play('click',{vol:.7,vary:.2}); dress(W); draw(); save(); });
  P.addEventListener('input',e=>{ const t=e.target, r=t.dataset.r, W=WINDR.cur; if(!r||!W||guest())return; W.d[r]=t.type==='range'?+t.value/100:t.value; dress(W); save(); });
  P.addEventListener('change',e=>{ if(e.target.dataset.r&&WINDR.cur)draw(); });

  /* ---------- the room built: every window gets its dressing and its rays; double-click opens the menu ---------- */
  ROOMK.built.push(A=>{ '@later'; WINDR.wins=A.R.wins; WINDR.close();
    for(const W of WINDR.wins){ W.d=W.d||D0(); if(W.th){ W.th.name='WINDOW'; W.th.act=()=>WINDR.open(W); } dress(W); } });
  // saved with your apartment (and shown to visitors as you left it)
  ROOMK.keep.push({ out:(L,A)=>{ L.win=(A.R.wins||[]).map(W=>({...(W.d||D0())})); },
    in:(L,A)=>{ const ws=A.R.wins||[]; ws.forEach((W,i)=>{ const s=L&&L.win&&L.win[i]; W.d={...D0(),...(s&&typeof s==='object'?s:{})}; if(!CUR[W.d.c])W.d.c='none'; if(!BLI[W.d.b])W.d.b='none'; if(W.g)dress(W); }); } });

  /* ---------- each frame: the rays follow the sun; the curtains sway in the breeze and part as you pass ---------- */
  const TV=new THREE.Vector3(), TP=new THREE.Vector3(), IM=new THREE.Matrix4();
  const clothStep=(c,h,br,t,pl)=>{ const o=c.o||(c.o={g:-4,dm:.97,ks:.006,col:[],cyl:{cy:1,x:0,z:0,r:.28,y0:0,y1:0},
      push:(i,a,F)=>{ const X0=c.X0, fr=(i/c.nx|0)/(c.ny-1), gust=c.br*(1.6+1.2*Math.sin(c.t*.9+X0[a]*2.1)+.6*Math.sin(c.t*2.3+X0[a+1]*3+X0[a]))*(.3+.7*fr);
        F[0]=gust*.25*c.h2*Math.sin(c.t*.7+fr*2); F[2]=gust*.45*c.h2; }});
    c.h2=h*h; c.br=br; c.t=t; o.col.length=0; if(pl){ const y=o.cyl; y.x=pl.x; y.z=pl.z; y.y0=pl.y-1; y.y1=pl.y+1; o.col.push(y); }
    DRAPE.step(c,h,o); DRAPE.out(c,c.me.geometry); };
  SYS.add('places',dt=>{ const A=MODS.apts, inn=!!(A&&A.inReal); if(!inn||!WINDR.wins.length)return; const t=performance.now()/1000, h=Math.min(.033,dt||0);
    const S=CLOCK.sun, dir=CLOCK.dir, I=S&&dir&&dir.y>.02?cl(S.intensity,0,3)/3:0;
    for(const W of WINDR.wins){ const u=W.ru; if(!u)continue; u.uT.value=t;
      // the light's way into the room, in the window's own frame (+z the room side)
      if(I>0){ W.g.updateWorldMatrix(true,false); IM.copy(W.g.matrixWorld).invert(); TV.copy(dir).negate().transformDirection(IM); }
      const ok=I>0&&TV.z>.04&&TV.y<-.04; u.uI.value=ok?.04*I*Math.min(1,TV.z*3):0; if(ok)u.uD.value.copy(TV);
      for(const m of W.rm)m.visible=ok;
      if(W.cloth&&W.cloth.length&&h){ TP.set(pos.x,SHARED.py+.9*((ROOMK.api&&ROOMK.api.R.M)||1),pos.z); W.g.worldToLocal(TP); const near=Math.hypot(TP.x,TP.z-.1)<1.4;
        for(const c of W.cloth){ if(W.br<.01&&!near&&c.still>30)continue; clothStep(c,h,W.br||0,t,near?TP:null); } } } },'150ab-windress');
  window.WINDRDBG=()=>({n:WINDR.wins.length,open:!P.hidden,d:WINDR.wins.map(W=>({...W.d})),lit:WINDR.wins.filter(W=>W.ru&&W.ru.uI.value>0).length,cloth:WINDR.wins.reduce((a,W)=>a+(W.cloth?W.cloth.length:0),0),
    pick:i=>WINDR.open(WINDR.wins[i]),saved:()=>{ const L=ED.snapshot&&ED.snapshot(); return L&&L.win; },set:(i,o)=>{ const W=WINDR.wins[i]; Object.assign(W.d,o); dress(W); },click:(k,v)=>{ const b=P.querySelector(`button[data-k="${k}"]${v!=null?`[data-v="${v}"]`:''}`); if(b)b.click(); return !!b; }});
}
