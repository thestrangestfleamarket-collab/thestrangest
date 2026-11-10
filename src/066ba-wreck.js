// THE WRECK: a sunken pirate ship far down on the Hudson's bed (about 55 m, half a minute's swim down), broken-backed, its black flag still on the mast, and sunken chests to dive for (in the wreck and deeper out in the channel): each gives you old coins and a gem once a day.
import {SHARED, THREE} from './003-shx.js';
import {INV, LITE, pos, SFX, st, UI, VIT} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {SOL, SYS, TILE, ZU} from './006-map-pre.js';
import {IKIT} from './038zc-ikit.js';
import {RIVER} from './066-river.js';
const WRECK={chests:[]}; window.WRECK=WRECK;
{ const T=TILE, MW=T/.84, say=(t,c)=>SAY(t,c||'#9fd8ff'), hs=(a,b)=>{ let h=(Math.imul(a|0,374761393)+Math.imul(b|0,668265263))|0; h=Math.imul(h^(h>>>13),1274126177); return ((h^(h>>>16))>>>0)/4294967296; };
  const bedY=(x,z)=>RIVER.box.lv-RIVER.depthAt(x,z)*MW;
  // where: on a flat stretch of the bed about 55 m down, nearest the pier (owner, 7 Nov 2026: "very far down at bottom of hudson, should take like 30 seconds to get to the ship swimming down in scuba gear"; you swim down 1.8 m a second)
  const DEPTH=55, spot=()=>{ const B=RIVER.box, px=(RIVER.piers&&RIVER.piers[0])||RIVER.mouth.x;
    for(const [dd,flat] of [[12,10],[16,16],[20,24],[30,40]]){ let best=null, bc=1e9;   // the flattest stretch near the depth, loosening till one fits
      for(let x=Math.max(B.x0+20*T,SHARED.BOD.XS(-40));x<Math.min(B.x1-20*T,SHARED.BOD.XS(240));x+=2*T)for(let z=B.z1-6*T;z>B.z0+6*T;z-=1.5*T){ const d=RIVER.depthAt(x,z); if(Math.abs(d-DEPTH)>dd)continue;
        let lo=1e9, hi=-1e9; for(let u=-27;u<=27;u+=4.5)for(let v=-8;v<=8;v+=4){ const q=RIVER.depthAt(x+u*MW,z+v*MW); lo=Math.min(lo,q); hi=Math.max(hi,q); } if(hi-lo>flat)continue;   // the hull and a margin round it on one level stretch, never on the rim of a hole
        const c=Math.abs(d-DEPTH)*2+(hi-lo)*3+Math.abs(x-px)/T*.03; if(c<bc){ bc=c; best=[x,z]; } }
      if(best)return best; } return null; };
  const deeps=()=>{ const B=RIVER.box, out=[]; for(let i=0;i<400&&out.length<3;i++){ const x=B.x0+(.1+.8*hs(i,3))*(B.x1-B.x0), z=B.z1-(10+hs(i,7)*((B.z1-B.z0)/T-14))*T, d=RIVER.depthAt(x,z);
      if(d>20&&d<40&&out.every(p=>Math.hypot(p[0]-x,p[1]-z)>40*T))out.push([x,z]); } return out; };
  // a century under water (owner, 7 Nov 2026: "realistic textures of items that have been underwater for 100 years"): one surface for everything of the wreck, in hard pixels a few to the inch, made from where it is: timber greyed and grained, shipworm holes, algae stains, barnacles pale and mussels black,
  // silt on every face that looks up and drifted deep low down, undersides dark; iron rusted to scale and grey concretion; bronze gone to verdigris
  const AU={uAgM:{value:MW},uAgC:{value:new THREE.Vector3()},uAgT:{value:0}};
  const AGF=`uniform float uAgM; uniform vec3 uAgC; varying vec3 vAgP; varying vec3 vAgN;
float agH(vec3 p){ return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453); }
float agN(vec3 p){ vec3 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(mix(agH(i),agH(i+vec3(1,0,0)),f.x),mix(agH(i+vec3(0,1,0)),agH(i+vec3(1,1,0)),f.x),f.y),mix(mix(agH(i+vec3(0,0,1)),agH(i+vec3(1,0,1)),f.x),mix(agH(i+vec3(0,1,1)),agH(i+vec3(1,1,1)),f.x),f.y),f.z); }
float agF(vec3 p){ return agN(p)*.55+agN(p*2.3)*.3+agN(p*5.1)*.15; }
`, AGM=`{ vec3 p=(vAgP-uAgC)/uAgM, q=floor(p*10.)/10.+.05, n=normalize(vAgN); vec3 c=diffuseColor.rgb; float L=dot(c,vec3(.3,.59,.11)), b=agF(q*.6), b2=agF(q*1.9+7.), sp=agH(floor(p*10.));
#if defined(AG_IRON)
 c=mix(vec3(.15,.085,.05),vec3(.33,.16,.07),b); c=mix(c,vec3(.07,.06,.05),smoothstep(.55,.8,b2)); c=mix(c,vec3(.34,.33,.27),smoothstep(.52,.75,agF(q*1.3+3.))*.85);
#elif defined(AG_PAINT)
 c=c*vec3(.78,.72,.7)*(.78+.3*b); c=mix(c,mix(vec3(.17,.08,.05),vec3(.36,.17,.07),b2),smoothstep(.46,.64,agF(q*2.4+5.))*.9);
#elif defined(AG_BRONZE)
 c=mix(vec3(.13,.25,.2),vec3(.3,.43,.33),b); c=mix(c,vec3(.2,.13,.07),smoothstep(.6,.8,b2)*.6);
#else
 c=mix(c,vec3(L*1.1)*vec3(.92,1.,.88),.62); c*=.78+.34*agN(vec3((q.x+q.z)*.7,q.y*13.,0.)); c=mix(c,vec3(.15,.2,.11),smoothstep(.5,.8,b)*.6); if(sp>.95)c*=.3;
#endif
 float enc=smoothstep(.56,.7,agF(q*1.6+11.)); if(sp>.7)c=mix(c,vec3(.56,.55,.48),enc*.85); else if(b2>.55)c=mix(c,vec3(.04,.05,.06),enc*.85);
 float si=clamp(smoothstep(.25,.75,n.y)*(.55+.45*b2)+(1.-smoothstep(-.6,1.8,p.y))*.6*b*step(-.3,n.y),0.,1.);
#if defined(AG_PAINT)
 si*=.4;
#endif
c=mix(c,vec3(.37,.35,.27)*(.82+.3*agH(floor(p*18.))),si*.92);
 if(n.y<-.4)c*=.5; diffuseColor.rgb=c; }
`;
  // (paint: a painted hull faded and flaked to rust, its own colours under it: the lake wreck, 066bb)
  const aged=(kind,o={})=>{ const m=new THREE.MeshLambertMaterial(o); if(kind!=='wood')m.defines={['AG_'+kind.toUpperCase()]:1};
    m.onBeforeCompile=sh=>{ Object.assign(sh.uniforms,AU); sh.vertexShader='varying vec3 vAgP; varying vec3 vAgN;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n vAgP=(modelMatrix*vec4(transformed,1.)).xyz; vAgN=normalize(mat3(modelMatrix)*objectNormal);');
      sh.fragmentShader=AGF+sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n'+AGM); };
    m.customProgramCacheKey=()=>'aged-'+kind; return m; };
  const WOOD=aged('wood',{vertexColors:true}), IRON=aged('iron'); WRECK.aged=aged; WRECK.AU=AU;
  // loose pieces in the world (rotated): a bag of triangles made one mesh
  const bag=()=>({p:[],n:[],c:[]}), COL=new THREE.Color(), M4=new THREE.Matrix4(), QQ=new THREE.Quaternion(), EU=new THREE.Euler(), V=new THREE.Vector3(), ONE=new THREE.Vector3(1,1,1);
  const put=(b,g,c,x,y,z,rx=0,ry=0,rz=0)=>{ COL.set(c); M4.compose(V.set(x,y,z),QQ.setFromEuler(EU.set(rx,ry,rz)),ONE); g.applyMatrix4(M4); const q=g.index?g.toNonIndexed():g, P=q.attributes.position.array, N=q.attributes.normal.array;
    for(let i=0;i<P.length;i+=3){ b.p.push(P[i],P[i+1],P[i+2]); b.n.push(N[i],N[i+1],N[i+2]); b.c.push(COL.r,COL.g,COL.b); } g.dispose(); if(q!==g)q.dispose(); };
  const meshB=(b,mat)=>{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(b.n,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(b.c,3));
    const me=new THREE.Mesh(g,mat); me.castShadow=me.receiveShadow=true; scene.add(me); WRECK.parts.push(me); return me; };
  // a chest on the bed: its lid propped open on its coins while it is full
  const chest=(x,z,k,y0)=>{ const G=new THREE.Group(), wood=aged('wood',{color:0x5a3a20}), band=IRON, y=y0??bedY(x,z);
    const add=(g,m,px,py,pz,rx=0)=>{ const o=new THREE.Mesh(g,m); o.position.set(px*MW,py*MW,pz*MW); o.rotation.x=rx; o.castShadow=true; G.add(o); return o; };
    add(new THREE.BoxGeometry(.8,.45,.5),wood,0,.2,0); for(const s of [-.3,.3])add(new THREE.BoxGeometry(.05,.47,.52),band,s,.2,0);
    const lid=new THREE.Group(); lid.position.set(0,.42*MW,-.25*MW); G.add(lid); { const o=new THREE.Mesh(new THREE.CylinderGeometry(.25*MW,.25*MW,.8*MW,10,1,false,0,Math.PI),wood); o.rotation.z=Math.PI/2; o.position.z=.25*MW; lid.add(o); }
    const gold=add(new THREE.CylinderGeometry(.3,.34,.08,10),new THREE.MeshBasicMaterial({color:0xffd24a}),0,.44,0);
    G.position.set(x,y-.05*MW,z); G.rotation.y=hs(k.length,x|0)*6.28; scene.add(G);
    const C={k,G,lid,gold,th:null}; C.th={name:'A SUNKEN CHEST',obj:G,reach:1.4*T,near:2.6*T,tall:.6*T,act:()=>open(C)}; UI.thing(C.th); WRECK.chests.push(C); return C; };
  const open=C=>{ if(!INV.ready(C.k))return say('EMPTY. THE RIVER BRINGS MORE IN BY TOMORROW.','#c8a090'); const c=10+Math.floor(Math.random()*31); INV.cash+=c; INV.pick(C.k); say('THE LID GIVES. $'+c+' IN OLD COINS, AND A STONE AMONG THEM.'); if(SFX.play)SFX.play('chirp',{vol:.5,pitch:.8}); };
  WRECK.chest=(x,z,k,y)=>chest(x,z,k,y);   // a sunken chest anywhere (the lake wreck's, 066bb): its own daily find
  // the ship, three times a real sloop's size (owner, 7 Nov 2026: "make the ship 3x bigger ... you can go inside and swim around, plenty of room"): drawn in its old metres (u along, bow at 0; v across; h from the keel) times S; hollow, its back broken open in the middle, a hollow stern cabin, a hold with cargo
  const S=3, LEN=16, BM=5, mid=BM/2, half=u=>BM/2*Math.pow(Math.max(0,Math.sin(Math.PI*Math.min(1,Math.max(0,(u+.6)/(LEN+1.2))))),.6);
  const ship=(cx,cz)=>{ const B=SHARED.BOD, tx=w=>(w-B.XS(0))/(B.XS(1)-B.XS(0)), tz=w=>(w-B.ZS(0))/(B.ZS(1)-B.ZS(0)), lt=LEN*S/.84, bt=BM*S/.84;
    const R={x0:tx(cx)-lt/2,x1:tx(cx)+lt/2,y0:tz(cz)-bt/2,y1:tz(cz)+bt/2}, F=IKIT.frame(R,(x,y)=>[B.XS(x),B.ZS(y)]), G=new THREE.Group(), K=IKIT.room(F,o=>G.add(o),()=>{});
    const box=(u0,v0,u1,v1,h0,h1,c)=>K.box(u0*S,v0*S,u1*S,v1*S,h0*S,h1*S,c), cyl=(u,v,r,h0,h1,c,rt)=>K.cyl(u*S,v*S,r*S,h0*S,h1*S,c,(rt??r)*S), pic=(u,v,h,w,hh,du,dv,t)=>K.pic(u*S,v*S,h*S,w*S,hh*S,du,dv,t);
    const W1=0x3b2a1c, W2=0x2e2116, BRK=u=>u>7.2&&u<8.7, LOW=u=>u>6&&u<10;
    for(let u=0;u<LEN;u+=.5){ if(BRK(u))continue; const jag=u<7.2?7.2-u:u>8.7?u-8.2:9, w=half(u+.25), top=2.4+(u>11.5?(u-11.5)*.18:0)-(LOW(u)?.6:0), c=hs(u*2,1)>.5?W1:W2;   // broken-backed: lower toward the break
      box(u,mid-w,u+.5,mid+w,-.6,-.4,W2); for(const s of [-1,1]){ const v=mid+s*w; for(let h=-.4;h<top;h+=.3){ if(h>jag*2.6+.4*hs(u*11+s,h*5)-.3)break; if(hs(u*7+s,h*9)>.1||h<.9)box(u,v-.05,u+.5,v+.05,h,h+.3,c); } }   // its planks, a few sprung high up, torn short beside the break
      if(hs(u*3,5)>.55&&!LOW(u))box(u,mid-w+.06,u+.5,mid+w-.06,top-.08,top-.02,0x4a3624);   // what is left of the upper deck
      if(u>1&&u<13&&!LOW(u)&&hs(u*5,9)>.35)box(u,mid-w+.1,u+.5,mid+w-.1,.9,.95,0x3e2c1c); }   // the orlop deck, rotten through in places
    // the stern cabin: hollow, its door into the hold, its dark windows
    const C0=12.5, C1=15.5, CH0=2.6, CH1=3.8; for(const [a0,b0,a1,b1] of [[C0,mid-1.7,C1,mid-1.6],[C0,mid+1.6,C1,mid+1.7],[C1-.1,mid-1.7,C1,mid+1.7]])box(a0,b0,a1,b1,CH0,CH1,W1);
    box(C0,mid-1.7,C0+.1,mid-.5,CH0,CH1,W1); box(C0,mid+.5,C0+.1,mid+1.7,CH0,CH1,W1); box(C0,mid-1.7,C1,mid+1.7,CH1,CH1+.1,W2); box(C0,mid-1.7,C1,mid+1.7,CH0-.05,CH0,0x3e2c1c);
    for(let i=0;i<3;i++)box(C1-.12,mid-1.2+i*1.0,C1-.1,mid-.8+i*1.0,2.9,3.4,0x0c1418);
    box(13.3,mid-.8,14.6,mid+.2,CH0,CH0+.35,0x4a2e18); box(13.2,mid-.9,14.7,mid+.3,CH0+.35,CH0+.4,0x2e1c10);   // the captain's table
    // the hold: barrels and crates on the hull's floor
    const cargo=[]; for(let i=0;i<14;i++){ const u=1.5+hs(i,1)*11, v=mid+(hs(i,2)-.5)*half(u)*1.3; if(BRK(u))continue; if(i%2)cyl(u,v,.22,-.4,.2,0x5a3a20,.2); else box(u-.25,v-.25,u+.25,v+.25,-.4,.1+.2*hs(i,3),0x6a4a2a); cargo.push([u,v]); }
    // the break: the ribs standing bare where the planks are gone, the keel between them, the ballast spilled out on it
    for(let u=7.25;u<8.7;u+=.36){ const w=half(u), hr=.5+1.7*hs(u*13,5); box(u,mid-w*.75,u+.14,mid+w*.75,-.55,-.4,W2); for(const s of [-1,1]){ const hh=.5+1.8*hs(u*13,s+5); for(let h=-.4;h<hh;h+=.3){ const k=h<.4?.72+.28*(h+.4)/.8:1; box(u,mid+s*w*k-.07,u+.14,mid+s*w*k+.07,h,Math.min(hh,h+.3),W1); } } }
    box(6.9,mid-.16,9,mid+.16,-.62,-.32,W2);
    for(let i=0;i<26;i++){ const u=7.1+hs(i,41)*1.7, v=mid+(hs(i,42)-.5)*2.2, r=.07+.07*hs(i,43); K.ball(u*S,v*S,(-.4+r*.5)*S,r*S,hs(i,44)>.5?0x4a4842:0x3a3a36,.6); }
    // silt drifted into the hold and banked up the hull's sides outside, burying it to the turn of the bilge
    for(let i=0;i<18;i++){ const u=.8+hs(i,51)*13.5; if(BRK(u))continue; const v=mid+(hs(i,52)-.5)*half(u)*1.2; K.ball(u*S,v*S,-.42*S,(.5+.6*hs(i,53))*S,0x5a5444,.22); }
    for(let u=.5;u<LEN-.3;u+=1.1)for(const s of [-1,1]){ const v=mid+s*(half(u)+.15); K.ball(u*S,v*S,-.5*S,(.7+.4*hs(u*9,s))*S,0x5a5444,.3); }
    // crust on the edges: barnacles and mussels thickest where the current feeds them
    for(let i=0;i<220;i++){ const u=.2+hs(i,61)*(LEN-.4); if(BRK(u))continue; const w=half(u+.1), s=hs(i,62)>.5?1:-1, top=2.4+(u>11.5?(u-11.5)*.18:0)-(LOW(u)?.6:0), r=.03+.05*hs(i,63), dark=hs(i,64)>.55;
      const on=hs(i,65), h=on<.5?top-.02:on<.8?.95:-.4, v=on<.5?mid+s*w:mid+(hs(i,66)-.5)*w*1.6; K.cyl(u*S,v*S,r*S,h*S,(h+r*(dark?1.4:.9))*S,dark?0x16181c:0x8a8674,(dark?r*.6:r*.45)*S,6); }
    // what the crew left: bottles and plates in the hold and the cabin, a chair on its back
    for(let i=0;i<12;i++){ const cab=i<6, u=cab?C0+.4+hs(i,71)*2.6:2+hs(i,71)*9, v=mid+(hs(i,72)-.5)*(cab?2.6:half(u)), h=cab?CH0:-.4; if(BRK(u))continue; if(i%3)K.cyl(u*S,v*S,.035*S,h*S,(h+.12)*S,i%2?0x24402c:0x3a2e1a,.02*S,8); else K.cyl(u*S,v*S,.09*S,h*S,(h+.015)*S,0x8a8478,.09*S,10); }
    box(14.7,mid+.6,15.1,mid+1.0,CH0,CH0+.06,0x3e2c1c); box(14.7,mid+.6,14.76,mid+1.0,CH0,CH0+.45,0x3e2c1c);
    cyl(4.6,mid,.2,-.4,5.4,0x2e2116,.16); cyl(10.6,mid,.17,-.4,2.6,0x2e2116,.14); box(3.4,mid-.06,5.8,mid+.06,4.6,4.7,W2);   // the masts (the main one standing, the mizzen snapped) and a yard
    const flag=IKIT.tex(32,24,(g,w,h)=>{ g.fillStyle='#1c1f1c'; g.fillRect(0,0,w,h); g.fillStyle='#8a8670'; g.fillRect(12,5,8,7); g.fillStyle='#1c1f1c'; g.fillRect(13,7,2,2); g.fillRect(17,7,2,2); g.fillRect(15,10,2,1); g.fillStyle='#8a8670'; for(let i=0;i<8;i++){ g.fillRect(8+i,14+(i%2),2,2); g.fillRect(22-i,14+(i%2),2,2); }
      for(let y=0;y<h;y++)for(let x=0;x<w;x++){ const r=hs(x*3+y*97,11), edge=Math.max(x/w,Math.abs(y-h/2)/(h/2)); if(r<edge*edge*.9-.08||(x>w*.55&&r<.12))g.clearRect(x,y,1,1); else if(r>.82){ g.fillStyle=r>.93?'#2c3a22':'#3a3a2c'; g.fillRect(x,y,1,1); } } });   // a century has eaten it to rags and stained what is left
    flag.colorSpace=THREE.SRGBColorSpace; { const m=pic(4.6,mid+.2,3.0,2.0,1.5,0,1,flag); m.material.side=THREE.DoubleSide; m.material.alphaTest=.5; m.material.transparent=false; }
    { const [M0]=K.flush(); if(M0)M0.material=WOOD; } const y=bedY(cx,cz)+(.6*S-.4)*MW; G.position.y=y; scene.add(G); AU.uAgC.value.set(cx,y-.4*S*MW,cz);   // the keel a little into the bed
    // strewn round it on the bed: its fallen timbers, a stock anchor by the bow, cannonballs (the bell where the back broke is the Hudson's: 146gb)
    { const D=bag(), I=bag(), at=(u,v)=>F.pw(u*S,v*S), M=MW;
      for(let i=0;i<14;i++){ const u=-2+hs(i,81)*(LEN+4), v=mid+(hs(i,82)>.5?1:-1)*(half(Math.min(LEN,Math.max(0,u)))+1+hs(i,83)*3.5), p=at(u,v), l=(1.5+hs(i,84)*4)*M; put(D,new THREE.BoxGeometry(.28*M,.16*M,l),hs(i,85)>.5?W1:W2,p[0],bedY(p[0],p[1])+.04*M,p[1],(hs(i,86)-.5)*.2,hs(i,87)*6.28,(hs(i,88)-.5)*.3); }
      { const p=at(-1.6,mid-2.4), y0=bedY(p[0],p[1])+.2*M, ry=.7; put(I,new THREE.CylinderGeometry(.11*M,.13*M,3.4*M,8),0,p[0],y0,p[1],Math.PI/2,ry,0); const e=Math.sin(ry), f=Math.cos(ry), k=1.6*M;
        put(I,new THREE.TorusGeometry(.95*M,.12*M,6,10,Math.PI),0,p[0]-e*k,y0+.05*M,p[1]-f*k,-Math.PI/2,0,ry+Math.PI/2); put(D,new THREE.BoxGeometry(2.6*M,.3*M,.3*M),W2,p[0]+e*k,y0+.15*M,p[1]+f*k,0,ry,.3); }
      for(let i=0;i<9;i++){ const p=at(2+hs(i,91)*9,mid+(hs(i,92)>.5?1:-1)*(half(4)+.6+hs(i,93))); put(I,new THREE.SphereGeometry(.12*M,8,6),0,p[0],bedY(p[0],p[1])+.08*M,p[1]); }
      meshB(D,WOOD); meshB(I,IRON); }
    // weed: brown-green streamers standing up off its edges and the bed round it, swaying in the slack current
    { const P=[], N=[], UV=[], Q=[]; for(let i=0;i<150;i++){ const u=-1+hs(i,101)*(LEN+2), out=hs(i,102), w0=half(Math.min(LEN,Math.max(0,u))), s=hs(i,103)>.5?1:-1;
        const v=out<.45?mid+s*w0:mid+s*(w0+.3+hs(i,104)*3), p=F.pw(u*S,v*S), top=2.4+(u>11.5?(u-11.5)*.18:0)-(LOW(u)?.6:0), h0=out<.45&&!BRK(u)&&u>0&&u<LEN?y+top*S*MW:bedY(p[0],p[1]);
        Q.push([p[0],h0,p[1],(.6+1.8*hs(i,105))*MW,(.05+.07*hs(i,106))*MW,hs(i,107)*6.28]); }
      for(const [x,h0,z,l,w,a] of Q){ const ca=Math.cos(a)*w, sa=Math.sin(a)*w; for(let k=0;k<4;k++){ const t0=k/4, t1=(k+1)/4, A=[x-ca*(1-t0*.6),h0+l*t0,z-sa*(1-t0*.6)], B_=[x+ca*(1-t0*.6),h0+l*t0,z+sa*(1-t0*.6)], C=[x-ca*(1-t1*.6),h0+l*t1,z-sa*(1-t1*.6)], D_=[x+ca*(1-t1*.6),h0+l*t1,z+sa*(1-t1*.6)];
          for(const [pt,tt] of [[A,t0],[B_,t0],[C,t1],[B_,t0],[D_,t1],[C,t1]]){ P.push(...pt); N.push(-Math.sin(a),0,Math.cos(a)); UV.push(0,tt); } } }
      const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2));
      const m=new THREE.MeshLambertMaterial({color:0x3a4426,side:THREE.DoubleSide}); m.onBeforeCompile=sh=>{ sh.uniforms.uAgT=AU.uAgT; sh.uniforms.uAgS={value:.35*MW}; sh.vertexShader='uniform float uAgT, uAgS;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n { float t=uv.y*uv.y, ph=position.x*.37+position.z*.29; transformed.x+=sin(uAgT*.9+ph)*t*uAgS; transformed.z+=cos(uAgT*.7+ph*1.3)*t*uAgS; }'); };
      m.customProgramCacheKey=()=>'aged-weed'; const me=new THREE.Mesh(g,m); me.castShadow=true; me.receiveShadow=true; scene.add(me); WRECK.parts.push(me); }
    const iron=IRON; for(const sd of [-1,1])for(const u of [3,5.6,11]){ const p=F.pw(u*S,(mid+sd*(half(u)+.2))*S), c=new THREE.Mesh(new THREE.CylinderGeometry(.11*S*MW,.14*S*MW,1.1*S*MW,8),iron);   // its cannons out of the ports
      c.rotation.x=Math.PI/2+(hs(u*5,sd)-.5)*.25; c.rotation.y=F.hd(0,sd)+(hs(u*3,sd+4)-.5)*.3; c.castShadow=c.receiveShadow=true; c.position.set(p[0],y+(1.2-(LOW(u)?.5:0))*S*MW,p[1]); scene.add(c); WRECK.parts.push(c); }
    { const p=F.pw(11.5*S,(mid+4.6)*S), m=new THREE.Mesh(new THREE.CylinderGeometry(.14*S*MW,.16*S*MW,6*S*MW,8),aged('wood',{color:0x3b2a1c})); m.castShadow=m.receiveShadow=true; m.rotation.z=Math.PI/2; m.rotation.y=.4; m.position.set(p[0],bedY(p[0],p[1])+.4*MW,p[1]); scene.add(m); WRECK.parts.push(m); }   // the mizzen on the bed beside it
    WRECK.parts.push(G); WRECK.floorY=y-.4*S*MW; WRECK.F=F;
    // what a swimmer bumps into down among the planks (the room's ground solids are flat, so they stand only while you swim below the gunwales): the hull's sides, the cabin's walls, the cargo
    const W=[], WR=(u0,v0,u1,v1)=>W.push(F.box(u0*S,v0*S,u1*S,v1*S));
    for(let u=0;u<LEN;u+=.5){ if(BRK(u))continue; const w=half(u+.25); WR(u,mid-w-.06,u+.5,mid-w+.06); WR(u,mid+w-.06,u+.5,mid+w+.06); }
    WR(C0,mid-1.75,C1,mid-1.6); WR(C0,mid+1.6,C1,mid+1.75); WR(C1-.12,mid-1.7,C1,mid+1.7); WR(C0,mid-1.7,C0+.1,mid-.5); WR(C0,mid+.5,C0+.1,mid+1.7);
    for(const [u,v] of cargo)WR(u-.25,v-.25,u+.25,v+.25);
    WRECK.walls=W; WRECK.topY=y+2.2*S*MW; WRECK.solid=false; return F; };
  WRECK.parts=[]; WRECK.S=S; WRECK.mid=mid;
  // its guards: sharks circling the wreck; one comes for a diver who gets close, bites, and turns away
  const SHK=[], shark=()=>{ const G=new THREE.Group(), grey=new THREE.MeshLambertMaterial({color:0x5a6670}), pale=new THREE.MeshLambertMaterial({color:0xc8ccd0}), M=MW;
    const body=new THREE.Mesh(new THREE.SphereGeometry(.5*M,12,8),grey); body.scale.set(.55,.5,3.2); G.add(body); const belly=new THREE.Mesh(new THREE.SphereGeometry(.48*M,12,8),pale); belly.scale.set(.5,.38,3.0); belly.position.y=-.08*M; G.add(belly);
    const fin=(w,h,x,y,z,rz,ry=0)=>{ const f=new THREE.Mesh(new THREE.ConeGeometry(w*M,h*M,4),grey); f.position.set(x*M,y*M,z*M); f.rotation.set(0,ry,rz); f.scale.z=.25; G.add(f); return f; };
    fin(.3,.8,0,.5,.1,0); fin(.25,.7,.45,-.15,.4,-2.2); fin(.25,.7,-.45,-.15,.4,2.2);
    const tail=new THREE.Group(); tail.position.z=-1.5*M; G.add(tail); { const t1=new THREE.Mesh(new THREE.ConeGeometry(.22*M,.9*M,4),grey); t1.position.set(0,.35*M,-.2*M); t1.rotation.x=-.6; t1.scale.z=.25; const t2=t1.clone(); t2.position.y=-.3*M; t2.rotation.x=.6+Math.PI; tail.add(t1,t2); }
    G.userData.tail=tail; scene.add(G); return G; };
  const SHARK=()=>{ const [cx,cz]=WRECK.at; for(let i=0;i<4;i++){ const g=shark(); SHK.push({g,r:(14+i*4)*MW,a:i*1.7,h:(4+i*2.2)*MW,w:(.18+.04*i)*(i%2?-1:1),chase:0,rest:0,x:cx,y:0,z:cz}); WRECK.parts.push(g); } };
  let bit=0; const guard=dt=>{ const [cx,cz]=WRECK.at, by=WRECK.floorY, py=SHARED.py, diver=RIVER.swim&&Math.hypot(pos.x-cx,pos.z-cz)<30*MW&&py<by+20*MW; let hunter=null;
    if(diver){ let bd=1e9; for(const k of SHK){ const d=Math.hypot(k.x-pos.x,k.z-pos.z); if(k.rest<=0&&d<bd){ bd=d; hunter=k; } } }
    bit-=dt; for(const k of SHK){ k.rest-=dt; let tx, ty, tz, sp;
      if(k===hunter){ tx=pos.x; ty=py+.8*MW; tz=pos.z; sp=3.2*MW; } else { k.a+=k.w*dt; tx=cx+Math.cos(k.a)*k.r; tz=cz+Math.sin(k.a)*k.r; ty=by+k.h; sp=2*MW; }
      const dx=tx-k.x, dy=ty-k.y, dz=tz-k.z, d=Math.hypot(dx,dy,dz)||1, st_=Math.min(d,sp*dt); k.x+=dx/d*st_; k.y+=dy/d*st_; k.z+=dz/d*st_;
      const hd=Math.atan2(dx,dz); k.hd=k.hd==null?hd:k.hd+Math.atan2(Math.sin(hd-k.hd),Math.cos(hd-k.hd))*Math.min(1,dt*2.5); k.g.position.set(k.x,k.y,k.z); k.g.rotation.set(-Math.atan2(dy,Math.hypot(dx,dz))*.5,k.hd,0); k.g.userData.tail.rotation.y=Math.sin(performance.now()/180+k.r)*.5;
      if(k===hunter&&d<2.2*MW&&bit<=0){ bit=3; k.rest=7; if(VIT.hurt)VIT.hurt(.12); say('A SHARK BITES! IT TURNS AWAY, CIRCLING.','#ff9a8a'); } } };
  const build=()=>{ const at=spot(); if(!at){ WRECK.built=true; WRECK.none=true; return; } const [x,z]=at; WRECK.at=[x,z]; const F=ship(x,z);
    for(const [u,v,i,inn] of [[7.9,mid,0],[3,mid+.6,1,1],[13.9,mid-.3,2,2],[-2,mid+3.6,3]]){ const p=F.pw(u*S,v*S); chest(p[0],p[1],'wreck'+i,inn===1?WRECK.floorY:inn===2?WRECK.floorY+(3.0*S*MW):null); }   // in the break, in the hold, on the cabin floor, one tumbled out by the bow
    deeps().forEach(([dx,dz],i)=>chest(dx,dz,'deep'+i)); SHARK(); WRECK.built=true; };
  // built once the river is, drawn only near it; a full chest shows its gold, an emptied one is shut till tomorrow
  SYS.add('places',dt=>{ if(!WRECK.built){ if(RIVER.box&&RIVER.depthAt)build(); return; } if(WRECK.none)return; const [x,z]=WRECK.at, near=Math.hypot(pos.x-x,pos.z-z)<140*T;
    for(const o of WRECK.parts)o.visible=near; if(near){ guard(Math.min(.1,dt||0)); AU.uAgT.value=performance.now()/1000; }
    { const Wt=st.water, sy=Wt&&Wt.in&&Wt.level!=null?Wt.y*ZU:1e9, on=near&&RIVER.swim&&sy<WRECK.topY&&Math.hypot(pos.x-x,pos.z-z)<40*MW;   // swimming down among the wreck: its planks are solid
      if(on&&LITE.pool[0]&&LITE.pool[0].intensity>0)LITE.pool[0].shadow.needsUpdate=true;   // your light's shadows follow you every frame down among it, not five times a second
      if(on!==WRECK.solid&&WRECK.walls){ WRECK.solid=on; for(const r of WRECK.walls){ const i=SOL.up.indexOf(r); if(on&&i<0)SOL.up.push(r); else if(!on&&i>=0)SOL.up.splice(i,1); } } } for(const C of WRECK.chests){ const n=Math.hypot(pos.x-C.G.position.x,pos.z-C.G.position.z)<140*T, full=INV.ready(C.k); C.G.visible=n; C.gold.visible=full; C.lid.rotation.x=full?-1.1:0; C.th.name=full?'A SUNKEN CHEST':'A SUNKEN CHEST (EMPTY)'; } },'066ba-wreck');
  window.WRECKDBG=()=>({built:!!WRECK.built,at:WRECK.at&&WRECK.at.map(v=>+(v/T).toFixed(1)),depth:WRECK.at&&+RIVER.depthAt(...WRECK.at).toFixed(1),chests:WRECK.chests.map(C=>({k:C.k,depth:+RIVER.depthAt(C.G.position.x,C.G.position.z).toFixed(1),full:INV.ready(C.k)}))});
}
export {WRECK};
