// THE GOLEMS' CAVE: GCAVE builds the golems' cave in the park (a great boulder mountain, moss on its shoulders and grass on top, a wide arched mouth) and sets out the squirrel's tower site.
import {SHARED, THREE} from './003-shx.js';
import {CITY, CLOCK, INV, LITE, MAIL, PARK, PAWNL, ROOMS, TRADE, UI, WEEDS} from './003b-systems.js';
import {scene} from './004-main.js';
import {FIX, MAPG, MODS, PARKCAVE, PARKTOWER, SOL, STORE, SYS, TILE} from './006-map-pre.js';
import {FLAME} from './007-fire.js';
const GCAVE={ready:false}; window.GCAVE=GCAVE;
{
  GCAVE.keep=P=>{ if(!GCAVE.S){ const [rx,ry]=P.round, c={x:PARKCAVE[0],y:PARKCAVE[1]}, R=8, tw={x:PARKTOWER[0]-3.4,y:PARKTOWER[1],w:9.5/3,d:3};
      GCAVE.S={c,R,tw}; const X=x=>SHARED.BOD.XS(x+(P.ox||0)), Z=y=>SHARED.BOD.ZS(y+(P.oy||0));
      if(STORE.places){ STORE.places.push(["THE SQUIRREL'S TOWER",X(tw.x+3.4),Z(tw.y),'up']); } }
    const {c,R,tw}=GCAVE.S; return [[c.x-R-3,c.y-R-2,c.x+R+5,c.y+R+2],[tw.x-tw.w/2-2.5,tw.y-tw.d/2-2.5,tw.x+tw.w/2+3,tw.y+tw.d/2+3]]; };
  const hs=(a,b,c=0)=>{ const s=Math.sin(a*127.1+b*311.7+c*74.7)*43758.5453; return s-Math.floor(s); };
  const foot=(R,a)=>R/Math.pow(Math.pow(Math.abs(Math.cos(a)),3)+Math.pow(Math.abs(Math.sin(a)),3),1/3);
  const build=()=>{ '@park'; const P=PARK, S=GCAVE.S, X=x=>SHARED.BOD.XS(x+P.ox), Z=y=>SHARED.BOD.ZS(y+P.oy), Y=SHARED.BOD.YS, T=TILE, CX=X(S.c.x), CZ=Z(S.c.y), R=S.R, grp=MAPG.park||scene, V3=THREE.Vector3;
    const H=230, NI=40, NJ=8, SEG=Math.PI*2/NI, A0=-2.5*SEG, MOUTH=i=>i<5, MJ=4;
    const pt=(i,j)=>{ if(j>=NJ)return new V3(CX,Y(H),CZ); const a=A0+(i%NI)*SEG, f=j/NJ*Math.PI/2, n=hs(i%NI,j,3)-.5, r=foot(R,a)*Math.pow(Math.cos(f),.7)*(1+n*.3+.12*Math.sin((i%NI)*1.9+j*2.3))*(j?1:1.02);
      return new V3(CX+Math.cos(a)*r*T,Y(H*Math.sin(f)*(1+(hs(i%NI,j,5)-.5)*.2)),CZ+Math.sin(a)*r*T); };
    const PTS=[]; for(let j=0;j<=NJ;j++){ PTS[j]=[]; for(let i=0;i<NI;i++)PTS[j][i]=pt(i,j); }
    const pos=[], col=[], tri=(a,b,c,k)=>{ const nrm=new V3().subVectors(b,a).cross(new V3().subVectors(c,a)), m=new V3().add(a).add(b).add(c).multiplyScalar(1/3); if(nrm.dot(m.sub(new V3(CX,0,CZ)))<0)[b,c]=[c,b];
      pos.push(a.x,a.y,a.z,b.x,b.y,b.z,c.x,c.y,c.z); const h=hs(k,7,9), up=Math.abs(nrm.y)/(nrm.length()||1), hi=(a.y+b.y+c.y)/3>Y(H)*.72; let cc=[.42+.13*h,.4+.12*h,.37+.1*h];
      if(hi||up>.5&&hs(k,3,11)<.7)cc=hs(k,4,1)<.5?[.31,.52,.22]:[.38,.6,.27]; else if(hs(k,8,2)<.07)cc=[.6,.6,.42];
      for(let q=0;q<3;q++)col.push(...cc); };
    let k=0; for(let j=0;j<NJ;j++)for(let i=0;i<NI;i++){ if(MOUTH(i)&&j<MJ)continue; const a=PTS[j][i], b=PTS[j][(i+1)%NI], c=PTS[j+1][(i+1)%NI], d=PTS[j+1][i]; if(j+1>=NJ)tri(a,b,c,k++); else{ tri(a,b,c,k++); tri(a,c,d,k++); } }
    const dg=new THREE.BufferGeometry(); dg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); dg.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); dg.computeVertexNormals();
    const rockM=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}), dome=new THREE.Mesh(dg,rockM); dome.castShadow=dome.receiveShadow=true; grp.add(dome);
    { const tp=[], tc=[], tuft=(x,y,z,s,g)=>{ for(let q=0;q<6;q++){ const a=hs(x,z,q)*6.28, l=(.1+.12*hs(z,x,q+9))*T*s, lean=.4+.4*hs(q,x,z), dx=Math.cos(a)*lean, dz=Math.sin(a)*lean, w=.035*T*s; tp.push(x-Math.sin(a)*w,y,z+Math.cos(a)*w, x+Math.sin(a)*w,y,z-Math.cos(a)*w, x+dx*l,y+l*1.5,z+dz*l); for(let v=0;v<3;v++)tc.push(g[0],g[1],g[2]); } };
      for(let j=NJ-3;j<NJ;j++)for(let i=0;i<NI;i++){ if(hs(i,j,21)<.45)continue; const p=pt(i,j); tuft(p.x*.97+CX*.03,p.y,p.z*.97+CZ*.03,1.1,hs(i,j,22)<.5?[.36,.62,.26]:[.45,.7,.3]); }
      for(let i=0;i<70;i++){ const a=(i+.5)/70*Math.PI*2, r=foot(R,a)+.35+hs(i,1,23)*.9; tuft(CX+Math.cos(a)*r*T,.02,CZ+Math.sin(a)*r*T,.8+.5*hs(i,2,24),[.34,.58,.24]); }
      const tg=new THREE.BufferGeometry(); tg.setAttribute('position',new THREE.Float32BufferAttribute(tp,3)); tg.setAttribute('color',new THREE.Float32BufferAttribute(tc,3)); tg.computeVertexNormals(); const tm=new THREE.Mesh(tg,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide})); tm.castShadow=true; grp.add(tm); }
    { const fp=[], fc=[]; for(let i=0;i<NI;i++){ const a=A0+i*SEG, b=a+SEG, ra=foot(R,a)*.99, rb=foot(R,b)*.99; for(let s=0;s<2;s++){ const r0=s?.5:0, r1=s?1:.5, h=hs(i,s,13), g=.3+.07*h;
        const p=[[r1*ra,a],[r1*rb,b],[r0*rb,b],[r0*ra,a]].map(([r,t])=>[CX+Math.cos(t)*r*T,.03,CZ+Math.sin(t)*r*T]); fp.push(...p[0],...p[2],...p[1],...p[0],...p[3],...p[2]); for(let q=0;q<6;q++)fc.push(g,g*.95,g*.88); } }
      const fg=new THREE.BufferGeometry(); fg.setAttribute('position',new THREE.Float32BufferAttribute(fp,3)); fg.setAttribute('color',new THREE.Float32BufferAttribute(fc,3)); fg.computeVertexNormals();
      const fl=new THREE.Mesh(fg,new THREE.MeshLambertMaterial({vertexColors:true})); fl.receiveShadow=true; grp.add(fl); }
    const BL=[];
    for(let i=0;i<34;i++){ const a=i/34*Math.PI*2; if(Math.abs(Math.atan2(Math.sin(a),Math.cos(a)))<.6)continue; const r=foot(R,a)+.15, s=.45+.4*hs(i,1,17); BL.push([CX+Math.cos(a)*r*T,Y(5*s),CZ+Math.sin(a)*r*T,s*T,Y(15*s),s*T*.9,a+hs(i,2,3)*3,.36+.16*hs(i,3,19)]); }
    for(const s of [-1,1])BL.push([CX+(R+.2)*T,Y(40),CZ+s*2.6*T,1.5*T,Y(50),1.3*T,s,.4]); BL.push([CX+(R*.8)*T,Y(96),CZ,1.2*T,Y(22),2.2*T,.4,.44]);
    for(const [dx,dy,s,h] of [[-1.5,-1.2,1.3,140],[1,1.8,1.1,128],[-2.6,2,1,104],[2.2,-2.4,.9,96]])BL.push([CX+dx*T,Y(h-6),CZ+dy*T,s*T*1.3,Y(16*s),s*T*1.2,dx,.46]);
    for(const [dx,dy] of [[-.8,-2.6],[.8,-2.6],[-.8,2.6],[.8,2.6]])BL.push([CX+dx*T,Y(4),CZ+dy*T,.45*T,Y(9),.45*T,dx+dy,.5]);
    const TS=[-3.3,0];
    BL.push([CX+TS[0]*T,Y(8),CZ,.7*T,Y(13),1.1*T,0,.4],[CX+TS[0]*T,Y(26),CZ,.95*T,Y(5),1.6*T,.1,.55]);
    const rocks=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(.5,0),new THREE.MeshLambertMaterial({color:0xffffff}),BL.length+3), m4=new THREE.Matrix4(), q=new THREE.Quaternion(), e=new THREE.Euler(), cl=new THREE.Color();
    BL.forEach(([x,y,z,sx,sy,sz,r,g],n)=>{ rocks.setMatrixAt(n,m4.compose(new V3(x,y,z),q.setFromEuler(e.set(0,r,0)),new V3(sx,sy*2,sz))); rocks.setColorAt(n,cl.setRGB(g,g*.97,g*.92)); });
    [[-2.6,-3.2],[-2.6,3.2],[2.4,-3.3]].forEach(([dx,dy],i)=>{ const n=BL.length+i; rocks.setMatrixAt(n,m4.compose(new V3(CX+dx*T,Y(2),CZ+dy*T),q.setFromEuler(e.set(0,dx,0)),new V3(1.4*T,Y(10),.8*T))); rocks.setColorAt(n,cl.setRGB(.26,.4,.2)); });
    rocks.castShadow=rocks.receiveShadow=true; grp.add(rocks);
    const CR=[], cluster=(dx,dy,n,tint,s=1)=>{ for(let i=0;i<n;i++){ const a=hs(dx*7,dy*5,i)*6.28, r=.2*hs(i,dx,dy); CR.push({x:CX+(dx+Math.cos(a)*r)*T,z:CZ+(dy+Math.sin(a)*r)*T,y:Y(4),w:(.13+.09*hs(i,2,dy))*s*T,h:Y((26+30*hs(i,3,dx))*s),tx:(hs(i,4,dx)-.5)*.7,tz:(hs(i,5,dy)-.5)*.7,c:tint}); } };
    const VI=[.78,.5,1], CY=[.45,.95,1], RO=[1,.55,.8];
    for(let i=0;i<9;i++){ const a=(i+.5)/9*Math.PI*2+.2; if(Math.abs(Math.atan2(Math.sin(a),Math.cos(a)))<.5)continue; const r=foot(R,a)*.78; cluster(Math.cos(a)*r,Math.sin(a)*r,4+(i%3),[VI,CY,RO][i%3]); }
    cluster(TS[0],-.5,3,CY,.5); cluster(TS[0],.5,2,VI,.5); for(const c of CR.slice(-5))c.y=Y(31);
    cluster(-3.1,-1.7,5,VI,.7);
    const GL=[[-1.9,-1.5],[2.7,3],[-.2,3.7],[1.7,-1.3]];
    const NC=CR.length, cry=new THREE.InstancedMesh(new THREE.OctahedronGeometry(.5,0),new THREE.MeshBasicMaterial({color:0xffffff}),NC+GL.length);
    CR.forEach((c,n)=>{ cry.setMatrixAt(n,m4.compose(new V3(c.x,c.y+c.h*.35,c.z),q.setFromEuler(e.set(c.tx,n,c.tz)),new V3(c.w,c.h,c.w))); cry.setColorAt(n,cl.setRGB(...c.c)); });
    const glint=(i,on)=>{ const [dx,dy]=GL[i], s=on?.22*T:0; cry.setMatrixAt(NC+i,m4.compose(new V3(CX+dx*T,Y(4),CZ+dy*T),q.setFromEuler(e.set(.3,i,.2)),new V3(s,s*1.3,s))); cry.setColorAt(NC+i,cl.setRGB(1,.95,.7)); cry.instanceMatrix.needsUpdate=true; if(cry.instanceColor)cry.instanceColor.needsUpdate=true; };
    GL.forEach((g,i)=>glint(i,true)); grp.add(cry);
    { const L=new THREE.PointLight(new THREE.Color(.7,.68,1),20,9*T,1.6); L.position.set(CX-.6*T,Y(H*.7),CZ); L.userData.i0=L.intensity; L.userData.both=true; L.userData.grp=null; L.userData.cave=1; if(LITE.recs)LITE.recs.push(L); GCAVE.L=L; }
    { const FX=CX+2.2*T, cm=P.mesh([['campfire',S.c.x+2.2,S.c.y,.13,0]],false,true); if(WEEDS.keepOff)WEEDS.keepOff([[FX,CZ,1.1*T]]); if(grp!==scene)grp.add(cm);
      const L=new THREE.PointLight(new THREE.Color(1,.6,.25),22,7*T,1.6); L.position.set(FX,.5*T,CZ); L.userData.fire=1; L.userData.both=true; L.userData.grp=grp===scene?null:grp; if(LITE.recs)LITE.recs.push(L); GCAVE.fireL=L;
      GCAVE.flame=FLAME.add({kind:'bed',name:'campfire',x:FX,y:.12*T,z:CZ,w:.72*T,h:.88*T,embers:3,smoke:1.2,sk:1.1,light:L,seed:11,parent:grp}); GCAVE.fire={x:FX,z:CZ,y:.3}; }
    const sol=(x0,z0,x1,z1,h)=>{ SOL.up.push([x0,z0,x1,z1]); FIX.up.push([x0,z0,0,x1,z1,h]); };
    for(let i=0;i<40;i++){ const a=(i+.5)/40*Math.PI*2; if(Math.abs(Math.atan2(Math.sin(a),Math.cos(a)))<.55)continue; const r=foot(R,a)-.1, x=CX+Math.cos(a)*r*T, z=CZ+Math.sin(a)*r*T, b=.55*T; sol(x-b,z-b,x+b,z+b,Y(H)); }
    for(const s of [-1,1]){ const x=CX+(R+.2)*T, z=CZ+s*2.6*T; sol(x-.7*T,z-.6*T,x+.7*T,z+.6*T,Y(90)); }
    sol(CX+(TS[0]-.45)*T,CZ-.8*T,CX+(TS[0]+.45)*T,CZ+.8*T,Y(36));
    const B={x0:CX-(R+.25)*T,x1:CX+(R+.25)*T,z0:CZ-(R+.25)*T,z1:CZ+(R+.25)*T};
    const Rm={id:'cave',name:"THE GOLEMS' CAVE",...B,y0:-1,y1:Y(100),walls:true,at:{x:CX+1.5*T,z:CZ},dw:null}; Rm.inside=(x,z)=>x>Rm.x0&&x<Rm.x1&&z>Rm.z0&&z<Rm.z1&&SHARED.py>Rm.y0-.3&&SHARED.py<Rm.y1;
    STORE.rooms.push(Rm); if(ROOMS.reset)ROOMS.reset();
    GCAVE.box=[B.x0,B.z0,B.x1,B.z1]; GCAVE.c={x:CX,z:CZ};
    GCAVE.inBox=(x,z,r=0)=>x>B.x0-r&&x<B.x1+r&&z>B.z0-r&&z<B.z1+r;
    GCAVE.spot=w=>{ if(w==='mouth'){ const a=(Math.random()-.5)*1.6, d=R+1.4+Math.random()*2.8; return {x:CX+Math.cos(a)*d*T,z:CZ+Math.sin(a)*d*T}; }
      for(let k=0;k<20;k++){ const a=Math.random()*Math.PI*2, r=1+Math.random()*2.6, x=CX+Math.cos(a)*r*T, z=CZ+Math.sin(a)*r*T; if(k===19||Math.hypot(x-CX-2.2*T,z-CZ)>1.2*T)return {x,z}; } };
    GCAVE.haunt=()=>{ return 'cave'; const h=CLOCK.h; if(h>=21||h<7)return 'cave'; const r=hs(Math.floor(h),(window.MAIL&&MAIL.ready?MAIL.day():0),21); return r<.22?'mouth':r<.34?'cave':'round'; };
    const hit=(x,z,w,h,o)=>{ const hb=new THREE.Mesh(new THREE.BoxGeometry(w,h,w),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(x,h/2,z); grp.add(hb); o.obj=hb; UI.thing(o); return o; };
    hit(CX+TS[0]*T,CZ,1.4*T,Y(40),{name:'THE TRADING STONE',reach:1.3*T,near:2.4*T,tall:Y(50),act:()=>{ if(TRADE)TRADE.open(); }});
    GCAVE.lift={x:CX,z:CZ-3.4*T}; hit(GCAVE.lift.x,GCAVE.lift.z,1.1*T,Y(6),{name:'A CRACK IN THE FLOOR',reach:1.2*T,near:2.2*T,tall:Y(14),act:()=>{ if(MODS.gemcave)MODS.gemcave.go(1); }});
    GCAVE.glints=GL.map(([dx,dy],i)=>{ const th=hit(CX+dx*T,CZ+dy*T,.6*T,Y(12),{name:'A GLINT',reach:.7*T,near:1.6*T,tall:Y(20),act:()=>{ if(!INV||!INV.pick('cave'+i))return; th.obj.visible=false; glint(i,false); }}); return th; });
    GCAVE.regrow=()=>{ GCAVE.glints.forEach((th,i)=>{ const up=!INV||INV.ready('cave'+i); if(up!==th.obj.visible){ th.obj.visible=up; glint(i,up); } }); };
    GCAVE.regrow(); SYS.every(GCAVE.regrow,5000,'060-cave regrow');
    if(STORE.furnish&&STORE.furnish.cave)STORE.furnish.cave({c:S.c,R,X,Z,T,grp});
    GCAVE.tris=dg.attributes.position.count/3; GCAVE.ready=true;
    for(const N of (PAWNL||[]))if(/_\d$/.test(N.key)&&!N.sheet){ const p=GCAVE.spot('cave'); if(!p)continue; try{ CITY.stop(N); }catch(e){} N.st.x=p.x; N.st.z=p.z; N.st.to=null; N.g.position.x=p.x; N.g.position.z=p.z; } };
  GCAVE.build=()=>{}; }   // the cave is archived (owner, 4 Nov 2026); its build stays for a restore
export {GCAVE};
