// THE KNIGHT: a faceted plate-armoured knight made in parts, baked once into one body for BODIES (you can be him; one walks main street).
import {THREE} from './003-shx.js';
import {STORE} from './006-map-pre.js';
import {BODIES} from './111a-bodies.js';
{ const V3=THREE.Vector3, BONES=BODIES.BONES, HIPY=1.02;
  const PAL={steel:['#7d8187',.1],steelDark:['#4e5156',.08],cloth:['#3d3a37',.08],mail:['#4a4c50',.14],leather:['#4b2f1f',.08],skinFlat:['#c99273',.04],
    brow:['#3b2719',.05],eyeW:['#e6dfd6',0],iris:['#7c8e98',0],pupil:['#0d0b0a',0],bronze:['#8a6a3c',.06],gold:['#d1ad62',.05],nose:['#cf9475',.03],hairA:['#5b3d27',.06],hairB:['#6e4b31',.06],hairC:['#4c3221',.06],hairD:['#7a5638',.06]};
  const OFF={torso:['hips',0,.06,0],head:['torso',0,.5,0],upperArmL:['torso',.215,.405,0],upperArmR:['torso',-.215,.405,0],forearmL:['upperArmL',0,-.28,0],forearmR:['upperArmR',0,-.28,0],
    handL:['forearmL',0,-.26,0],handR:['forearmR',0,-.26,0],thighL:['hips',.105,-.03,0],thighR:['hips',-.105,-.03,0],shinL:['thighL',0,-.43,0],shinR:['thighR',0,-.43,0],shoeL:['shinL',0,-.43,0],shoeR:['shinR',0,-.43,0]};
  /* ---------- the model, built once in his rest pose (metres, feet at 0, facing +z, his left at +x) ---------- */
  const hash3=(x,y,z)=>{ const h=Math.sin(x*127.1+y*311.7+z*74.7)*43758.5453; return h-Math.floor(h); };
  const jit=(g,a)=>{ const p=g.attributes.position; for(let i=0;i<p.count;i++){ const x=p.getX(i),y=p.getY(i),z=p.getZ(i),kx=Math.round(x*997),ky=Math.round(y*997),kz=Math.round(z*997);
    p.setXYZ(i,x+(hash3(kx,ky,kz)-.5)*2*a,y+(hash3(ky+3,kz,kx)-.5)*2*a,z+(hash3(kz,kx+7,ky)-.5)*2*a); } return g; };
  const lin=c=>Math.pow(c,2.2), gss=(ux,uy,cx,cy,sx,sy)=>Math.exp(-(((ux-cx)/sx)**2+((uy-cy)/sy)**2));
  const CYL=(rt,rb,h,s=8,open=false,ts=0,tl=Math.PI*2)=>new THREE.CylinderGeometry(rt,rb,h,s,1,open,ts,tl), ICO=(r,d=0)=>new THREE.IcosahedronGeometry(r,d), BOX=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
  const grp=(p,at=[0,0,0])=>{ const g=new THREE.Group(); g.position.set(...at); p.add(g); return g; };
  const mk=(p,geo,c,at=[0,0,0],r=[0,0,0],s=[1,1,1])=>{ const m=new THREE.Mesh(geo); m.userData.c=c; m.position.set(...at); m.rotation.set(...r); m.scale.set(...s); p.add(m); return m; };
  function headDeform(ux,uy,uz){ let x=ux*.8,y=uy,z=uz*.9;
    if(uy<0){ const t=-uy; x*=1-.3*t*t; z*=1-.08*t; } if(z>.35)z=.35+(z-.35)*.72; if(uz<0&&uy>-.3){ z*=1.07; y+=.02; }
    const f=Math.max(0,uz); z+=f*(.085*gss(ux,uy,0,.2,.6,.09)-.09*gss(ux,uy,.3,.05,.14,.09)-.09*gss(ux,uy,-.3,.05,.14,.09)+.035*gss(ux,uy,0,-.52,.18,.05)-.02*gss(ux,uy,0,-.58,.14,.02)+.07*gss(ux,uy,0,-.82,.22,.12));
    x+=Math.sign(ux)*.055*(gss(ux,uy,.5,-.1,.16,.14)+gss(ux,uy,-.5,-.1,.16,.14)); return [x,y,z]; }
  function skinColor(u,h){ let r=.8,g=.58,b=.46; const sock=.28*(gss(u[0],u[1],.3,.03,.17,.12)+gss(u[0],u[1],-.3,.03,.17,.12)); r*=1-sock; g*=1-sock*1.1; b*=1-sock*.9;
    const bl=gss(u[0],u[1],.42,-.2,.16,.13)+gss(u[0],u[1],-.42,-.2,.16,.13)+.8*gss(u[0],u[1],0,-.2,.1,.12); r+=.05*bl; g-=.02*bl; b-=.02*bl;
    const lip=gss(u[0],u[1],0,-.55,.15,.05); r=r*(1-lip)+.62*lip; g=g*(1-lip)+.36*lip; b=b*(1-lip)+.31*lip;
    if(u[1]<-.25){ const d=Math.min(1,(-u[1]-.25)*2)*.12; r*=1-d; g*=1-d; b*=1-d*.8; } const v=(h-.5)*.07; return [lin(r+v),lin(g+v*.9),lin(b+v*.8)]; }
  const keyOf=u=>[Math.round(u[0]*800),Math.round(u[1]*800),Math.round(u[2]*800)];
  const place=(off,amt)=>u=>{ const d=headDeform(...u), dir=new V3(d[0],d[1]+.1,d[2]).normalize(), o=off(u), k=keyOf(u);
    return [d[0]+dir.x*o+(hash3(...k)-.5)*amt,d[1]+dir.y*o+(hash3(k[1],k[2],k[0]+5)-.5)*amt,d[2]+dir.z*o+(hash3(k[2]+9,k[0],k[1])-.5)*amt]; };
  function shell(detail,keep,pl,color){ const sp=new THREE.IcosahedronGeometry(1,detail).attributes.position, pos=[], col=[];
    for(let f=0;f<sp.count;f+=3){ const us=[0,1,2].map(i=>new V3(sp.getX(f+i),sp.getY(f+i),sp.getZ(f+i)).normalize()), cu=us[0].clone().add(us[1]).add(us[2]).normalize(), c3=[cu.x,cu.y,cu.z];
      if(!keep(c3))continue; const c=color(c3,hash3(Math.round(cu.x*500),Math.round(cu.y*500),Math.round(cu.z*500))); for(const u of us){ pos.push(...pl([u.x,u.y,u.z])); col.push(...c); } }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); return g; }
  function head(H0){ const H=grp(H0,[0,.165,.015]); H.scale.setScalar(.122);
    mk(H,shell(3,()=>true,place(()=>0,.018),skinColor),'vc');
    mk(H,jit(new THREE.ConeGeometry(.095,.38,4,1),.008),'nose',[0,-.085,.79],[-.32,Math.PI/4,0],[1,1,.8]);
    mk(H,jit(ICO(.062),.006),'nose',[0,-.235,.86]); for(const s of [1,-1])mk(H,jit(ICO(.055),.006),'nose',[.085*s,-.25,.79]);
    for(const s of [1,-1]){ mk(H,jit(ICO(1,1),.06),'skinFlat',[.78*s,-.02,-.03],[0,.25*s,0],[.08,.21,.14]);
      const e=grp(H,[.245*s,.05,.56]); mk(e,new THREE.SphereGeometry(.11,10,8),'eyeW');
      mk(e,new THREE.CircleGeometry(.056,10),'iris',[0,0,.1095]); mk(e,new THREE.CircleGeometry(.026,8),'pupil',[0,0,.111]);
      mk(e,jit(new THREE.SphereGeometry(.122,9,5,0,Math.PI*2,0,Math.PI*.42),.006),'skinFlat',[0,0,0],[.75,0,0]);
      mk(e,jit(new THREE.SphereGeometry(.118,9,4,0,Math.PI*2,Math.PI*.72,Math.PI*.2),.005),'skinFlat',[0,0,0],[-.25,0,0]);
      mk(H,jit(BOX(.34,.075,.1),.012),'brow',[.29*s,.2,.72],[.15,-.25*s,-.14*s]); }
    const beardKeep=([x,y,z])=>{ if(z<-.2)return false; if(Math.abs(x)<.2&&y>-.63&&y<-.49)return false; if(y<-.24)return true; return Math.abs(x)>.55&&y<.08&&z>-.2&&z<.55; };
    mk(H,shell(3,beardKeep,place(u=>.055+.05*Math.max(0,-u[1]-.6)+(Math.abs(u[0])<.3&&u[1]>-.5?.015:0),.05),(u,h)=>{ const v=.24+h*.1; return [lin(v*1.08),lin(v*.74),lin(v*.52)]; }),'vc');
    const hairKeep=([x,y,z])=>z>.3?y>.42:Math.abs(x)>.55&&z>-.15?y>.16:z<-.1?y>-.45:y>.25;
    mk(H,shell(2,hairKeep,place(u=>.09+.12*Math.max(0,u[1])*(u[2]<.2?1:.7),.09),(u,h)=>{ const v=.34+h*.16+(u[1]>.6?.05:0); return [lin(v*1.05),lin(v*.75),lin(v*.5)]; }),'vc');
    const LC=['hairA','hairB','hairC','hairD'];
    for(let i=0;i<11;i++){ const ax=-.62+i*.124, n=new V3(ax,.82-Math.abs(ax)*.35,.32-Math.abs(ax)*.2).normalize(), d=headDeform(n.x,n.y,n.z);
      mk(H,jit(ICO(1),.1),LC[i%4],[d[0]*1.1,d[1]*1.06+.02,d[2]*1.04-.14],[-.95-Math.abs(ax)*.3,ax*.5,ax*.25],[.2,.1,.55]); }
    for(let i=0;i<6;i++){ const ax=(i-2.5)*.22; mk(H,jit(ICO(1),.1),LC[(i+1)%4],[ax*.85,.6,-.64],[.5,ax*.4,0],[.2,.13,.42]); } }
  function model(){
    const root=new THREE.Group(), B={}, bone=(n,p,at)=>{ const g=grp(p,at); g.userData.bone=n; B[n]=g; return g; };
    const hips=bone('hips',root,[0,HIPY,0]), torso=bone('torso',hips,[0,.06,0]);
    const pr=[[.15,0],[.165,.06],[.19,.16],[.205,.26],[.2,.34],[.18,.41],[.13,.465]].map(p=>new THREE.Vector2(...p)), bp=new THREE.LatheGeometry(pr,10), pp=bp.attributes.position;
    for(let i=0;i<pp.count;i++){ let x=pp.getX(i),y=pp.getY(i),z=pp.getZ(i); x*=1.22; if(z<0)z*=.82; else{ z*=.95; z+=.032*Math.max(0,1-Math.abs(x)/.11)*(y<.42?1:.3); } pp.setXYZ(i,x,y,z); }
    mk(torso,jit(bp,.004),'steel');
    for(let i=0;i<3;i++)mk(torso,jit(CYL(.155+i*.012,.172+i*.012,.055,10,true),.004),'steel',[0,-.025-i*.045,0],[0,0,0],[1.22,1,.9]);
    for(let i=0;i<7;i++){ const a=(i-3)*.28; mk(torso,ICO(.009),'steelDark',[Math.sin(a)*.24,.015,Math.cos(a)*.165+.01]); }
    mk(torso,jit(new THREE.SphereGeometry(.205,11,5,0,Math.PI*2,0,Math.PI*.5),.012),'cloth',[0,.405,-.005],[0,0,0],[1.25,.42,.92]);
    mk(torso,jit(new THREE.TorusGeometry(.15,.06,6,11),.014),'cloth',[0,.47,0],[Math.PI/2-.12,0,0],[1.18,1,1]);
    mk(torso,jit(new THREE.TorusGeometry(.115,.05,6,10),.012),'cloth',[0,.52,-.005],[Math.PI/2-.2,0,.1],[1.1,1,1]);
    mk(torso,jit(new THREE.TorusGeometry(.098,.04,5,9),.01),'cloth',[.005,.56,0],[Math.PI/2-.28,0,-.15],[1.05,1,1]);
    mk(torso,jit(new THREE.SphereGeometry(.16,9,6,0,Math.PI*2,0,Math.PI*.55),.014),'cloth',[0,.5,-.11],[-1.25,0,0],[1.15,.9,.75]);
    for(const s of [1,-1]){ const sh=grp(torso,[.215*s,.405,0]);
      mk(sh,jit(new THREE.SphereGeometry(.145,8,4,0,Math.PI*2,0,Math.PI*.5),.006),'steel',[.035*s,0,0],[0,0,-.42*s],[1.05,.78,1.12]);
      mk(sh,jit(new THREE.SphereGeometry(.15,8,1,0,Math.PI*2,Math.PI*.48,Math.PI*.08),.004),'steel',[.035*s,0,0],[0,0,-.42*s],[1.08,1.6,1.15]);
      for(let i=0;i<4;i++)mk(sh,ICO(.008),'steelDark',[.09*s,.045,-.09+i*.06]); }
    const hd=bone('head',torso,[0,.5,0]); mk(hd,CYL(.05,.056,.14,8),'skinFlat',[0,.04,.005]); head(hd);
    for(const s of [1,-1]){ const n=s>0?'L':'R', up=bone('upperArm'+n,torso,[.215*s,.405,0]), ts=s>0?0:Math.PI;
      for(let i=0;i<3;i++)mk(up,jit(CYL(.11-i*.008,.105-i*.008,.05,8,true,ts,Math.PI),.003),'steel',[0,-.07-i*.04,0],[0,0,.12*s]);
      mk(up,jit(CYL(.058,.053,.21,8),.003),'steel',[0,-.15,0]); mk(up,CYL(.04,.04,.06,8),'mail',[0,-.26,0]);
      const fo=bone('forearm'+n,up,[0,-.28,0]);
      mk(fo,jit(ICO(.062,1),.005),'steel',[0,0,-.005],[0,0,0],[1,.9,1.05]); mk(fo,jit(new THREE.ConeGeometry(.075,.025,7),.003),'steel',[.06*s,0,-.01],[0,0,-s*Math.PI/2],[1,1,.8]);
      mk(fo,jit(CYL(.05,.043,.2,8),.003),'steel',[0,-.13,0]); mk(fo,jit(CYL(.062,.046,.075,8,true),.003),'steel',[0,-.225,0]);
      const ha=bone('hand'+n,fo,[0,-.26,0]), h=grp(ha); h.rotation.y=-s*Math.PI/2; const curl=s<0?1:.45;
      mk(h,CYL(.04,.04,.04,8),'leather'); mk(h,jit(BOX(.088,.05,.034),.003),'steel',[0,-.03,-.005]); mk(h,jit(BOX(.09,.03,.036),.003),'steel',[0,-.065,-.003],[.15,0,0]); mk(h,BOX(.08,.07,.02),'leather',[0,-.04,.012]);
      for(let i=0;i<4;i++){ let p=grp(h,[-.033+i*.022,-.08,.002]); const L=[.03,.025,.02],J=[1.35,1.55,1.2];
        for(let k=0;k<3;k++){ const sg=k?grp(p,[0,-L[k-1],0]):p; sg.rotation.x=-curl*J[k]*(1-.05*i); mk(sg,jit(BOX(.02,L[k]+.004,.022),.002),'steel',[0,-L[k]/2,0]); p=sg; } }
      const th=grp(h,[s<0?-.05:.05,-.035,.015]); th.rotation.set(-.5-.6*curl,0,.5*-s); const th2=grp(th,[0,-.035,0]); th2.rotation.x=-.6*curl;
      mk(th,jit(BOX(.022,.04,.024),.002),'steel',[0,-.018,0]); mk(th2,jit(BOX(.02,.03,.022),.002),'steel',[0,-.014,0]); }
    mk(hips,jit(CYL(.18,.215,.24,12,true),.006),'mail',[0,-.07,0],[0,0,0],[1.15,1,.92]);
    mk(hips,CYL(.205,.205,.045,12,true),'leather',[0,.02,0],[0,0,0],[1.18,1,.94]); mk(hips,jit(BOX(.06,.05,.02),.003),'bronze',[0,.02,.2]);
    for(const s of [1,-1]){ const n=s>0?'L':'R', th=bone('thigh'+n,hips,[.105*s,-.03,0]);
      mk(th,jit(CYL(.088,.072,.36,8),.004),'steel',[0,-.2,0],[0,0,0],[1,1,1.05]); mk(th,jit(BOX(.04,.3,.03),.004),'steelDark',[.07*s,-.2,0]);
      const sh=bone('shin'+n,th,[0,-.43,0]);
      mk(sh,jit(ICO(.062,1),.005),'steel',[0,0,.035],[0,0,0],[1.15,1,.95]); mk(sh,jit(ICO(1),.006),'steel',[.07*s,0,.01],[0,0,0],[.018,.075,.07]);
      mk(sh,jit(CYL(.066,.05,.34,8),.004),'steel',[0,-.2,0],[0,0,0],[1,1,1.15]); mk(sh,CYL(.06,.06,.04,8),'mail',[0,-.06,0]); mk(sh,jit(CYL(.052,.058,.1,8),.003),'steelDark',[0,-.4,0]);
      const ft=bone('shoe'+n,sh,[0,-.43,0]);
      mk(ft,jit(BOX(.085,.08,.08),.004),'steel',[0,-.075,-.035]);
      for(let i=0;i<4;i++)mk(ft,jit(BOX(.095-i*.005,.038,.06),.003),'steel',[0,-.045-i*.014,.03+i*.042],[.38,0,0]);
      mk(ft,jit(BOX(.078,.035,.075),.004),'steel',[0,-.1,.205],[.12,0,0]); mk(ft,BOX(.1,.022,.32),'leather',[0,-.118,.07]); }
    // the sword, sheathed on his left hip: scabbard from the belt down and back, the hilt out above it
    const dir=new V3(.08,-.82,-.57).normalize(), mouth=new V3(.25,-.01,.07), sc=grp(hips,[mouth.x,mouth.y,mouth.z]);
    sc.quaternion.setFromUnitVectors(new V3(0,1,0),dir);
    mk(sc,jit(CYL(.032,.024,.74,6),.002),'leather',[0,.37,0],[0,0,0],[1.35,1,.55]); mk(sc,CYL(.036,.036,.05,6),'steel',[0,.02,0],[0,0,0],[1.35,1,.6]); mk(sc,jit(new THREE.ConeGeometry(.028,.07,6),.002),'steel',[0,.76,0],[Math.PI,0,0],[1.35,1,.6]);
    const sw=grp(sc,[0,-.11,0]);
    mk(sw,jit(BOX(.27,.022,.024),.002),'steel',[0,.095,0]); for(const s of [1,-1])mk(sw,jit(BOX(.024,.044,.032),.002),'steel',[.135*s,.095,0]);
    mk(sw,CYL(.035,.035,.016,12),'bronze',[0,.095,0],[Math.PI/2,0,0]);
    const star=new THREE.Shape(); for(let i=0;i<16;i++){ const a=i/16*Math.PI*2-Math.PI/2, r=i%2?.008:.03; i?star.lineTo(Math.cos(a)*r,Math.sin(a)*r):star.moveTo(Math.cos(a)*r,Math.sin(a)*r); }
    mk(sw,new THREE.ExtrudeGeometry(star,{depth:.02,bevelEnabled:false}),'gold',[0,.095,-.01]);
    mk(sw,CYL(.016,.019,.17,8),'leather'); mk(sw,CYL(.022,.022,.012,8),'steel',[0,-.09,0]); mk(sw,jit(new THREE.SphereGeometry(.034,8,6),.002),'steel',[0,-.125,0]); mk(sw,ICO(.012),'steel',[0,-.163,0]);
    return {root,B}; }

  /* ---------- baked: every part's faces flat, coloured, each held by its one bone ---------- */
  function bake(){ const {root,B}=model(); root.updateMatrixWorld(true);
    const inv={}; for(const n of BONES)inv[n]=B[n].matrixWorld.clone().invert();
    const P=[],N=[],C=[],I=[],W=[], va=new V3(),vb=new V3(),vc=new V3(),e1=new V3(),e2=new V3(),nn=new V3(),col=new THREE.Color(), M=new THREE.Matrix4();
    root.traverse(o=>{ if(!o.isMesh)return; let b=o; while(b&&!b.userData.bone)b=b.parent; const bi=BONES.indexOf(b.userData.bone);
      M.multiplyMatrices(inv[b.userData.bone],o.matrixWorld); const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry, p=g.attributes.position, gc=g.attributes.color, spec=o.userData.c, pal=PAL[spec];
      if(pal)col.set(pal[0]);
      for(let f=0;f<p.count;f+=3){ va.fromBufferAttribute(p,f).applyMatrix4(M); vb.fromBufferAttribute(p,f+1).applyMatrix4(M); vc.fromBufferAttribute(p,f+2).applyMatrix4(M);
        nn.crossVectors(e1.subVectors(vb,va),e2.subVectors(vc,va)); if(nn.lengthSq()<1e-14)continue; nn.normalize();
        let r,gg,bb; if(gc){ r=gc.getX(f); gg=gc.getY(f); bb=gc.getZ(f); } else { const k=1+(hash3(Math.round((va.x+vb.x+vc.x)*3e3),Math.round((va.y+vb.y+vc.y)*3e3),Math.round((va.z+vb.z+vc.z)*3e3))-.5)*2*pal[1]; r=col.r*k; gg=col.g*k; bb=col.b*k; }
        for(const v of [va,vb,vc]){ P.push(v.x,v.y,v.z); N.push(nn.x,nn.y,nn.z); C.push(r,gg,bb); I.push(bi,bi); W.push(1); } } });
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); geo.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));
    geo.setAttribute('color',new THREE.Float32BufferAttribute(C,3)); geo.setAttribute('bi',new THREE.Float32BufferAttribute(I,2)); geo.setAttribute('bw',new THREE.Float32BufferAttribute(W,1)); geo.computeBoundingSphere(); return geo; }
  BODIES.add({key:'knight',label:'KNIGHT',geo:bake,height:1.89,hipY:HIPY,off:OFF,binv:null,at:76});
  if(STORE.holo)STORE.holo.programs.push({name:'SWORD TRAINING',skill:'sword',tool:'sword',intro:'SWORD TRAINING. THE KNIGHT RAISES HIS SWORD: SWING YOURS WHEN HE CALLS STRIKE.',cue:'STRIKE!',
    place:(x,z,hd,G)=>BODIES.place('knight',x,z,hd,G),hide:()=>BODIES.restore('knight')});
}
