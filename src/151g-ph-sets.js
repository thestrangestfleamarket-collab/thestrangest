// THE PLAYHOUSE'S SETS for A Midsummer Night's Dream, Act I: scene one's court (a flown colonnade, the throne truck, braziers, banners, the moon; the wood creeping in on ivy, trees and fireflies) and scene two's workshop (a timber-framed wall with a leaded window and a hanging lantern, its side walls, the bench truck; the mechanicals' painted flats); every piece flies on its bar or rolls on from the wings.
import {THREE} from './003-shx.js';
import {DRAPE} from './072a-cloth.js';
import {PHX} from './151b-ph-kit.js';
PHX.parts.push({make:K=>{ '@playhouse';
  const D=K.D, M=K.M, TX=K.TX, PI=Math.PI, SY=D.SY, V3=THREE.Vector3, h2=TX.h2, F=K.fly.byId;
  const ST=K.sets={P:{},look:null,lights:[]}, ease=k=>k<=0?0:k>=1?1:k*k*(3-2*k);
  const grp=(p)=>{ const g=new THREE.Group(); (p||K.G).add(g); return g; }, at=(g,o)=>Object.assign({},o,{p:g});
  const paint=(w,h,f)=>TX.print(w,h,f), lam=o=>new THREE.MeshLambertMaterial(o), PM=lam({map:TX.marble,color:0xd8d2c8});
  // a piece that flies: built in its bar's own frame (y 0 at the bar), sent in to its trim or out to the grid
  const flyP=(id,set,trims,build)=>{ const s=F[set], g=grp(s.g); build(g); const P=ST.P[id]={id,type:'fly',s,g,trims,on:null}; g.visible=false; return P; };
  // a piece on a wagon: rolled on from a wing to its mark, off again
  const wagP=(id,inX,outX,z,build,o={})=>{ const g=grp(); g.position.set(outX,SY,z); build(g); const P=ST.P[id]={id,type:'wag',g,inX,outX,t:0,to:0,spd:o.spd||1.8,sol:o.sol||null,top:o.top||null}; g.visible=false; return P; };
  const fadeP=(id,set)=>{ const P=ST.P[id]={id,type:'fade',v:0,to:0,set}; set(0); return P; };

  /* ---------- the palace's colonnade: six marble columns (half-round fronts on timber backs) under a gilt entablature, flown on bar 5 ---------- */
  { const shaft=new THREE.CylinderGeometry(.42,.46,6.6,24,1,true,-PI/2,PI); { const p=shaft.attributes.position; for(let i=0;i<p.count;i++){ const x=p.getX(i), z=p.getZ(i), a=Math.atan2(z,x), k=1-.05*Math.max(0,Math.cos(a*14)); p.setX(i,x*k); p.setZ(i,z*k); } shaft.computeVertexNormals(); }
    flyP('cols','s5',{in:SY+8.37},g=>{ const top=-.3;
      K.boxA(-9.2,top-1.0,-.35,9.2,top,.35,PM,at(g,{s:2})); K.boxA(-9.3,top-1.0,.35,9.3,top-.75,.45,M.gold,at(g,{})); K.boxA(-9.4,top-.12,-.4,9.4,top,.5,PM,at(g,{s:2}));
      K.boxA(-9.2,top-.7,.36,9.2,top-.2,.38,M.orn,at(g,{}));
      for(const x of [-7.6,-4.9,-2.2,2.2,4.9,7.6]){ const yb=-8.3+SY*0; const y0=top-1.0-6.6-.45;
        K.put(new THREE.Mesh(shaft,PM),x,y0+.45+3.3,0,{p:g}); K.lathe([[0,0],[.62,0],[.62,.12],[.52,.2],[.55,.3],[.46,.45],[0,.45]],PM,x,y0,0,at(g,{seg:20}));
        K.lathe([[0,0],[.45,0],[.55,.25],[.66,.42],[.66,.5],[0,.5]],PM,x,top-1.5,0,at(g,{seg:20})); K.boxA(x-.7,top-1.02,-.7,x+.7,top-.98,.7,PM,at(g,{}));
        for(const q of [-1,1])K.tor(.11,.04,PM,x+q*.56,top-1.15,.42,at(g,{seg:14}));
        K.boxA(x-.45,y0+.2,-.5,x+.45,top-1.02,-.46,M.canvas,at(g,{})); for(const yy of [y0+.4,y0+3.5,top-1.3])K.boxA(x-.45,yy,-.56,x+.45,yy+.08,-.5,M.pine,at(g,{}));
        K.boxA(x-.04,y0+.3,-.62,x+.04,top-1.1,-.56,M.pine,at(g,{})); }
      for(const x of [-8.6,-3.6,3.6,8.6])K.rod([x,0,0],[x,top,0],.006,M.steel,{p:g}); }); }

  /* ---------- the moon: a crescent cut out and painted, its glow, hung on two wires (low behind the workshop's window for scene two) ---------- */
  { const mt=paint(256,256,(g,w,h)=>{ const gr=g.createRadialGradient(110,128,20,128,128,128); gr.addColorStop(0,'#fffbe8'); gr.addColorStop(1,'#e8e0c0'); g.fillStyle=gr; g.fillRect(0,0,w,h);
      for(let i=0;i<40;i++){ g.fillStyle=`rgba(160,150,120,${.15+.2*h2(i,1,61)})`; g.beginPath(); g.arc(h2(i,2,61)*w,h2(i,3,61)*h,4+14*h2(i,4,61),0,7); g.fill(); } });
    flyP('moon','s6',{in:SY+10.6,window:SY+6.4},g=>{ const R=1.5, pts=[]; for(let i=0;i<=40;i++){ const a=-PI*.8+i/40*PI*1.6; pts.push([Math.cos(a)*R,Math.sin(a)*R]); } for(let i=40;i>=0;i--){ const a=-PI*.62+i/40*PI*1.24; pts.push([.65+Math.cos(a)*R*.95,Math.sin(a)*R*.95]); }
      const m=K.ext(pts,.12,new THREE.MeshBasicMaterial({map:mt}),0,-3,0,at(g,{s:3,cast:false})); m.rotation.z=PI;
      const halo=K.plane(6,6,new THREE.MeshBasicMaterial({map:paint(128,128,(c,w,h)=>{ const r=c.createRadialGradient(64,64,10,64,64,64); r.addColorStop(0,'rgba(190,210,255,.55)'); r.addColorStop(1,'rgba(190,210,255,0)'); c.fillStyle=r; c.fillRect(0,0,w,h); }),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}),0,-3,-.1,at(g,{}));
      for(const x of [-.9,.9])K.rod([x,0,0],[x,-3+Math.sqrt(Math.max(0,R*R-x*x))*.9,0],.005,M.steel,{p:g}); }); }

  /* ---------- the banners of Athens: four long cloths of red with a gold border and the owl, hung from a pole on bar 2 ---------- */
  { const bt=paint(128,512,(g,w,h)=>{ g.drawImage(TX.velvet.map.image,0,0,w,h); g.strokeStyle='#d8b050'; g.lineWidth=10; g.strokeRect(8,8,w-16,h-60); for(let y=h-50;y<h;y+=10){ g.fillStyle=y%20?'#d8b050':'#8a1a20'; g.fillRect(0,y,w,6); }
      g.save(); g.translate(w/2,170); g.fillStyle='#e0b850'; g.beginPath(); g.ellipse(0,10,30,44,0,0,7); g.fill(); g.beginPath(); g.ellipse(0,-34,26,22,0,0,7); g.fill(); g.fillStyle='#5a0a14';
      for(const e of [-1,1]){ g.beginPath(); g.arc(e*11,-36,8,0,7); g.fill(); g.beginPath(); g.moveTo(e*18,-52); g.lineTo(e*26,-66); g.lineTo(e*8,-54); g.fill(); } g.fillStyle='#e0b850'; for(const e of [-1,1]){ g.beginPath(); g.arc(e*11,-36,3,0,7); g.fill(); } g.restore();
      g.fillStyle='#e0b850'; g.font='bold 22px Georgia,serif'; g.textAlign='center'; g.fillText('ΑΘΗΝΑΙ',w/2,300); });
    const bm=lam({map:bt,side:THREE.DoubleSide,bumpMap:TX.velvet.bump,bumpScale:.6});
    flyP('banners','s2',{in:SY+9.7},g=>{ K.rod([-8,-.1,0],[8,-.1,0],.04,M.gold,{p:g}); for(const x of [-8,8])K.sph(.09,M.gold,x,-.1,0,at(g,{}));
      ST.banners=[-6,-2.2,2.2,6].map(x=>{ const nx=6, ny=20, L=5.2, X0=[]; for(let j=0;j<ny;j++)for(let i=0;i<nx;i++)X0.push(x-.6+1.2*i/(nx-1),-.15-L*j/(ny-1),.03*Math.sin(i*1.7));
        const c=DRAPE.make(X0,DRAPE.grid(nx,ny,true),new Uint8Array(nx*ny).fill(1,0,nx)); const ge=new THREE.PlaneGeometry(1,1,nx-1,ny-1); ge.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(nx*ny*3),3));
        const me=new THREE.Mesh(ge,bm); me.castShadow=true; me.frustumCulled=false; g.add(me); c.me=me; c.nx=nx; c.o={g:-9.8,dm:.985,it:5,col:[]}; for(let k=0;k<120;k++)DRAPE.step(c,1/60,c.o); DRAPE.out(c,ge); K.tor(.05,.01,M.gold,x,-.12,0,at(g,{})); return c; }); }); }

  /* ---------- the ivy: the wood come into the court: long strands of it and swags between, hung from bar 3, swaying ---------- */
  { const lt=paint(64,256,(g,w,h)=>{ g.clearRect(0,0,w,h); g.strokeStyle='#2a3a18'; g.lineWidth=3; g.beginPath(); g.moveTo(w/2,0); for(let y=0;y<h;y+=8)g.lineTo(w/2+Math.sin(y*.08)*6,y); g.stroke();
      for(let i=0;i<34;i++){ const y=i*7.5+4, s=i%2?-1:1, x=w/2+s*(8+h2(i,1,63)*6); g.fillStyle=['#2e5a26','#3e7030','#24481e','#4e8238'][i&3]; g.save(); g.translate(x,y); g.rotate(s*.6); g.beginPath(); g.moveTo(0,-9); g.lineTo(7,-2); g.lineTo(4,7); g.lineTo(0,4); g.lineTo(-4,7); g.lineTo(-7,-2); g.closePath(); g.fill(); g.restore(); } });
    const im=lam({map:lt,alphaTest:.5,side:THREE.DoubleSide}); lt.wrapS=THREE.ClampToEdgeWrapping;
    flyP('ivy','s3',{in:10.2},g=>{ ST.ivy=[]; for(let k=0;k<16;k++){ const x=-8.6+k*1.15+(h2(k,1,64)-.5)*.4, L=2.4+h2(k,2,64)*4.2, nx=2, ny=12, X0=[];
        for(let j=0;j<ny;j++)for(let i=0;i<nx;i++)X0.push(x-.14+.28*i,-L*j/(ny-1),(h2(k,3,64)-.5)*.6);
        const c=DRAPE.make(X0,DRAPE.grid(nx,ny,true),new Uint8Array(nx*ny).fill(1,0,nx)); const ge=new THREE.PlaneGeometry(1,1,nx-1,ny-1); ge.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(nx*ny*3),3));
        const uv=ge.attributes.uv; for(let i=0;i<uv.count;i++)uv.setY(i,uv.getY(i)*L/2.4); const me=new THREE.Mesh(ge,im); me.frustumCulled=false; me.castShadow=true; g.add(me); c.me=me; c.nx=nx; c.ph=h2(k,4,64)*6; c.o={g:-9.8,dm:.99,it:4,col:[]}; for(let q=0;q<60;q++)DRAPE.step(c,1/60,c.o); DRAPE.out(c,ge); ST.ivy.push(c); }
      for(let k=0;k<5;k++){ const a=-8+k*3.2, b=a+3.2; const pts=K.cat([a,-.05,.1],[b,-.05,.1],.18); K.tube(pts,.05,lam({color:0x2e5a26}),{p:g,n:24});
        const lv=[]; pts.forEach((p,i)=>{ for(let q=0;q<3;q++)lv.push([p[0]+(h2(k,i*3+q,65)-.5)*.2,p[1]+(h2(k,i*3+q,66)-.5)*.2,p[2]+.05,h2(i,q,67)*6]); }); K.inst(new THREE.CircleGeometry(.09,5),lam({color:0x3e7030,side:THREE.DoubleSide}),lv,{p:g}); } }); }

  /* ---------- the workshop's back wall: timber framing and plaster, a leaded window, a plank door ajar, shelves and tools; its ceiling beams and a lantern hung on a chain; flown on bar 4 ---------- */
  { const W=10, H=6.4, wt=paint(512,320,(g,w,h)=>{ const s=w/W; g.fillStyle='#d8c8a4'; g.fillRect(0,0,w,h); for(let i=0;i<500;i++){ g.fillStyle=`rgba(120,100,70,${.05+.08*h2(i,1,68)})`; g.fillRect(h2(i,2,68)*w,h2(i,3,68)*h,6,4); }
      g.fillStyle='#4a3020'; const post=(x,y0,y1,t=.25)=>g.fillRect((x+W/2-t/2)*s,h-y1*s,t*s,(y1-y0)*s), rail=(x0,x1,y,t=.22)=>g.fillRect((x0+W/2)*s,h-(y+t/2)*s,(x1-x0)*s,t*s);
      for(const x of [-4.9,-2.6,0,2.6,4.9])post(x,0,H); rail(-5,5,.15); rail(-5,5,H-.15,.3); rail(-5,5,3.1);
      g.lineWidth=.22*s; g.strokeStyle='#4a3020'; for(const [a,b] of [[-4.9,-2.6],[2.6,4.9]]){ g.beginPath(); g.moveTo((a+W/2)*s,h-3.1*s); g.lineTo((b+W/2)*s,h-(H-.2)*s); g.stroke(); } });
    flyP('wall','s4',{in:SY+H+.6},g=>{ const top=-.6, y0=top-H, win=[.6,2.6,y0+2.3,y0+4.1], door=[-3.9,-2.7,y0,y0+2.35];
      const sh=[[-W/2,y0],[W/2,y0],[W/2,top],[-W/2,top]], holes=[[[win[0],win[2]],[win[1],win[2]],[win[1],win[3]],[win[0],win[3]]],[[door[0],door[2]],[door[1],door[2]],[door[1],door[3]],[door[0],door[3]]]];
      const wm=lam({map:wt}); const sg=new THREE.Shape(sh.map(p=>new THREE.Vector2(p[0],p[1]))); for(const hh of holes)sg.holes.push(new THREE.Path(hh.map(p=>new THREE.Vector2(p[0],p[1]))));
      const ge=new THREE.ExtrudeGeometry(sg,{depth:.12,bevelEnabled:false}); { const uv=ge.attributes.uv; for(let i=0;i<uv.count;i++)uv.setXY(i,(uv.getX(i)+W/2)/W,(uv.getY(i)-y0)/H); }
      const wall=new THREE.Mesh(ge,[wm,M.pine]); wall.castShadow=wall.receiveShadow=true; wall.position.z=-.06; g.add(wall);
      // real timbers proud of the plaster, the window's lead and glass, its sill; the door on its strap hinges
      for(const x of [-4.9,-2.6,0,2.6,4.9])K.boxA(x-.13,y0,.06,x+.13,top,.16,lam({color:0x4a3020}),at(g,{}));
      K.boxA(-5,y0+3,.06,5,y0+3.2,.18,lam({color:0x4a3020}),at(g,{})); K.boxA(-5,top-.3,.06,5,top,.2,lam({color:0x4a3020}),at(g,{}));
      K.plane(win[1]-win[0],win[3]-win[2],M.glass,(win[0]+win[1])/2,(win[2]+win[3])/2,0,at(g,{}));
      { const lt=paint(256,256,(c,w,h)=>{ c.clearRect(0,0,w,h); c.strokeStyle='#1a1a1c'; c.lineWidth=5; for(let k=-8;k<=16;k++){ c.beginPath(); c.moveTo(k*32,0); c.lineTo(k*32-256,256); c.stroke(); c.beginPath(); c.moveTo(k*32-256,0); c.lineTo(k*32,256); c.stroke(); } c.lineWidth=12; c.strokeRect(0,0,w,h); });
        K.plane(win[1]-win[0],win[3]-win[2],lam({map:lt,transparent:true,alphaTest:.3,side:THREE.DoubleSide}),(win[0]+win[1])/2,(win[2]+win[3])/2,.015,at(g,{})); }
      K.boxA(win[0]-.1,win[2]-.12,-.06,win[1]+.1,win[2],.28,M.pine,at(g,{})); for(const [a,b] of [[win[0]-.1,win[0]],[win[1],win[1]+.1]])K.boxA(a,win[2],-.06,b,win[3],.12,M.pine,at(g,{})); K.boxA(win[0]-.1,win[3],-.06,win[1]+.1,win[3]+.1,.12,M.pine,at(g,{}));
      { const dg=new THREE.Group(); dg.position.set(door[0],y0,.02); dg.rotation.y=.55; g.add(dg); K.boxA(0,0,-.04,door[1]-door[0],door[3]-door[2],.04,M.pine,at(dg,{s:.6})); for(const y of [.4,1.9])K.boxA(0,y,.04,.9,y+.06,.06,M.iron,at(dg,{})); K.tor(.05,.01,M.iron,1.0,1.1,.07,at(dg,{seg:10})); }
      K.boxA(door[0],door[3],-.06,door[1],door[3]+.15,.14,lam({color:0x4a3020}),at(g,{}));
      // shelves of jars and pots; a saw, a square, a coil of rope on pegs
      for(const y of [y0+1.6,y0+2.3]){ K.boxA(2.9,y,.06,4.6,y+.04,.36,M.pine,at(g,{})); for(let x=3.0;x<4.5;x+=.28)K.lathe([[0,0],[.08,0],[.1,.1],[.07,.2],[.05,.24],[0,.24]],K.col(['#8a5a3a','#5a6a7a','#a8804a','#6a4a3a'][Math.floor(x*7)&3]),x,y+.04,.2,at(g,{seg:10})); }
      { const sw=K.ext([[0,0],[.75,.04],[.75,.14],[0,.18]],.006,M.steel,-1.6,y0+2.0,.07,at(g,{})); sw.rotation.z=-.3; K.boxA(-1.7,y0+1.86,.06,-1.5,y0+2.12,.1,M.pine,at(g,{}));
        K.tor(.22,.04,M.rope,-.9,y0+2.1,.1,at(g,{seg:20})); K.tor(.17,.04,M.rope,-.9,y0+2.06,.12,at(g,{seg:20})); K.boxA(-.5,y0+1.6,.07,-.46,y0+2.3,.09,M.steel,at(g,{})); K.boxA(-.5,y0+1.6,.07,-.1,y0+1.64,.09,M.steel,at(g,{})); }
      // the back of the flat: its frame and braces (seen from the wings)
      for(const x of [-4.95,-2.5,0,2.5,4.95])K.boxA(x-.05,y0,-.2,x+.05,top,-.06,M.pine,at(g,{})); for(const y of [y0+.05,y0+3.1,top-.1])K.boxA(-5,y,-.2,5,y+.07,-.06,M.pine,at(g,{}));
      // the ceiling: three great beams running downstage from the wall's head, a lantern on a chain from the middle one
      for(const x of [-3.5,0,3.5])K.boxA(x-.18,top-.4,.2,x+.18,top-.05,4.2,lam({color:0x3a2416}),at(g,{}));
      for(const x of [-3.5,0,3.5])K.rod([x,0,3.9],[x,top-.05,3.9],.006,M.steel,{p:g});
      { const n=10, L=1.4, X0=[]; for(let j=0;j<n;j++)X0.push(0,top-.4-L*j/(n-1),2.6); const c=DRAPE.make(X0,DRAPE.grid(1,n),new Uint8Array(n).fill(1,0,1)); c.o={g:-9.8,dm:.995,it:6,col:[]};
        const links=new THREE.InstancedMesh(new THREE.TorusGeometry(.03,.008,4,8),M.iron,n); links.castShadow=true; g.add(links);
        const lan=new THREE.Group(); g.add(lan); K.boxA(-.13,-.36,-.13,.13,0,.13,M.glass,at(lan,{})); for(const [x,z] of [[-.13,-.13],[.13,-.13],[-.13,.13],[.13,.13]])K.boxA(x-.012,-.38,z-.012,x+.012,.02,z+.012,M.iron,at(lan,{}));
        K.cyl(.0,.2,.16,M.iron,0,.1,0,at(lan,{seg:4})); K.cyl(.11,.11,.03,M.iron,0,-.38,0,at(lan,{seg:4})); const fl=K.sph(.045,new THREE.MeshBasicMaterial({color:0xffb050}),0,-.2,0,at(lan,{cast:false})); K.cyl(.025,.025,.08,M.ivory,0,-.3,0,at(lan,{seg:8}));
        ST.lantern={c,links,lan,fl,n,ph:0}; ST.lights.push({k:'lantern',p:[0,top-.4-L-.2,2.6],g}); } }); }

  /* ---------- the mechanicals' painted flats: a cottage front, two trees on sticks, a sun on a pole: canvas on timber, bright, flown in on bar 1 ---------- */
  { const cot=paint(256,256,(g,w,h)=>{ g.clearRect(0,0,w,h); g.fillStyle='#f0e0b0'; g.fillRect(28,100,200,156); g.fillStyle='#c84a3a'; g.beginPath(); g.moveTo(10,104); g.lineTo(128,14); g.lineTo(246,104); g.fill();
      g.strokeStyle='#3a2a1a'; g.lineWidth=5; g.strokeRect(28,100,200,156); g.beginPath(); g.moveTo(10,104); g.lineTo(128,14); g.lineTo(246,104); g.stroke(); g.fillStyle='#6a9ad0'; g.fillRect(50,130,50,44); g.strokeRect(50,130,50,44); g.beginPath(); g.moveTo(75,130); g.lineTo(75,174); g.moveTo(50,152); g.lineTo(100,152); g.stroke();
      g.fillStyle='#7a4a2a'; g.fillRect(140,160,52,96); g.strokeRect(140,160,52,96); g.fillStyle='#e0c040'; g.beginPath(); g.arc(182,210,5,0,7); g.fill(); g.fillStyle='#3a2a1a'; g.font='bold 18px Georgia,serif'; g.fillText('THISBE',48,236); });
    const tre=paint(128,256,(g,w,h)=>{ g.clearRect(0,0,w,h); g.fillStyle='#7a5a3a'; g.fillRect(56,120,16,136); g.fillStyle='#4a9a3a'; g.beginPath(); g.arc(64,80,56,0,7); g.fill(); g.strokeStyle='#2a4a1a'; g.lineWidth=5; g.stroke(); g.fillStyle='#6aba4a'; g.beginPath(); g.arc(46,64,20,0,7); g.fill(); });
    const sun=paint(128,128,(g,w,h)=>{ g.clearRect(0,0,w,h); g.fillStyle='#ffd040'; g.beginPath(); g.arc(64,64,34,0,7); g.fill(); g.strokeStyle='#ffd040'; g.lineWidth=7; for(let a=0;a<6.3;a+=.52){ g.beginPath(); g.moveTo(64+Math.cos(a)*42,64+Math.sin(a)*42); g.lineTo(64+Math.cos(a)*58,64+Math.sin(a)*58); g.stroke(); } g.fillStyle='#3a2a1a'; g.beginPath(); g.arc(52,58,4,0,7); g.arc(76,58,4,0,7); g.fill(); g.lineWidth=4; g.strokeStyle='#3a2a1a'; g.beginPath(); g.arc(64,66,16,.3,2.8); g.stroke(); });
    const flat=(g,tex,x,w,h,wob)=>{ const m=lam({map:tex,alphaTest:.5,side:THREE.DoubleSide}), pg=new THREE.PlaneGeometry(w,h,6,6); const p=pg.attributes.position; for(let i=0;i<p.count;i++)p.setX(i,p.getX(i)+Math.sin(p.getY(i)*3+x)*wob); pg.computeVertexNormals();
      const me=new THREE.Mesh(pg,m); me.position.set(x,-5.5+SY*0+h/2,0); me.castShadow=true; g.add(me); K.boxA(x-w*.35,-5.5,-.12,x-w*.35+.06,-5.5+h*.8,-.06,M.pine,at(g,{})); K.boxA(x+w*.35-.06,-5.5,-.12,x+w*.35,-5.5+h*.8,-.06,M.pine,at(g,{}));
      K.boxA(x-w*.35,-5.5+h*.45,-.12,x+w*.35,-5.5+h*.45+.06,-.06,M.pine,at(g,{})); for(const q of [x-w*.3,x+w*.3])K.rod([q,0,0],[q,-5.5+h*.8,-.08],.005,M.steel,{p:g}); };
    flyP('flats','s1',{in:SY+5.5},g=>{ flat(g,cot,-1.6,4.2,4.2,.05); flat(g,tre,-5.2,1.6,3.4,.08); flat(g,tre,4.2,1.8,3.8,.08); K.rod([6.2,-5.5,0],[6.2,-.6,0],.03,M.pine,{p:g}); const sm=lam({map:sun,alphaTest:.5,side:THREE.DoubleSide}); K.plane(1.6,1.6,sm,6.2,-1.0,.05,at(g,{cast:true})); }); }

  /* ---------- the throne truck: a carpeted dais on castors with three steps, Theseus's chair of state and Hippolyta's, footstools ---------- */
  wagP('throne',0,-7.75,-6.4,g=>{ const w=4.4, d=2.4, h=.45; K.boxA(-w/2,.08,-d/2,w/2,h,d/2,M.mahog,at(g,{s:.8})); K.boxA(-w/2+.02,h,-d/2+.02,w/2-.02,h+.01,d/2-.02,M.carpet,at(g,{s:1.4}));
    for(let i=0;i<3;i++)K.boxA(-1.4,0,d/2+i*.3,1.4,h-(i+1)*h/3+.01+0.0,d/2+(i+1)*.3,PM,at(g,{s:1}));
    for(const [x,z] of [[-w/2+.3,-d/2+.3],[w/2-.3,-d/2+.3],[-w/2+.3,d/2-.3],[w/2-.3,d/2-.3],[0,0]]){ K.cyl(.07,.07,.05,M.iron,x,.07,z,at(g,{rz:PI/2,seg:10})); K.boxA(x-.05,.1,z-.05,x+.05,.12,z+.05,M.iron,at(g,{})); }
    const chair=(x,big)=>{ const s=big?1:.82; K.boxA(x-.4*s,h,-.4*s,x+.4*s,h+.5*s,.35*s,M.gold,at(g,{})); K.boxA(x-.36*s,h+.5*s,-.36*s,x+.36*s,h+.62*s,.3*s,M.velvet,at(g,{})); K.boxA(x-.4*s,h+.5*s,-.48*s,x+.4*s,h+(big?2.0:1.4)*s,-.36*s,M.gold,at(g,{}));
      K.boxA(x-.32*s,h+.7*s,-.37*s,x+.32*s,h+(big?1.85:1.28)*s,-.35*s,M.velvet,at(g,{})); for(const q of [-1,1]){ K.boxA(x+q*.42*s-.05,h+.5*s,-.4*s,x+q*.42*s+.05,h+.9*s,.35*s,M.gold,at(g,{})); K.sph(.08*s,M.gold,x+q*.42*s,h+.95*s,.32*s,at(g,{})); }
      if(big){ K.ext([[-.5,0],[.5,0],[.35,.35],[0,.55],[-.35,.35]],.06,M.gold,x,h+2.0,-.45,at(g,{})); K.sph(.09,M.red,x,h+2.25,-.39,at(g,{cast:false})); } };
    chair(-.6,1); chair(.75,0); for(const x of [-.6,.75])K.boxA(x-.25,h,.45,x+.25,h+.2,.75,M.velvet,at(g,{})); },{spd:1.4,sol:[-2.2,-1.2,2.2,2.1],top:.46});

  /* ---------- the braziers: bronze bowls on lion-footed tripods, fire in them (their light a practical) ---------- */
  const fires=[]; for(const s of [-1,1])wagP('brz'+(s<0?'L':'R'),s*5.6,s*9.3,-4.6,g=>{ for(let k=0;k<3;k++){ const a=k/3*PI*2+.4; K.rod([Math.cos(a)*.42,0,Math.sin(a)*.42],[Math.cos(a)*.12,1.1,Math.sin(a)*.12],.03,M.brass,{p:g}); K.sph(.06,M.brass,Math.cos(a)*.44,.05,Math.sin(a)*.44,at(g,{})); }
      K.lathe([[0,0],[.18,.02],[.42,.18],[.5,.34],[.46,.36],[0,.36]],M.brass,0,1.06,0,at(g,{seg:20})); K.tor(.48,.03,M.brass,0,1.42,0,at(g,{rx:PI/2,seg:24}));
      const fl=[]; for(let k=0;k<7;k++){ const a=k/7*PI*2, r=k?.2:0, m=new THREE.Mesh(new THREE.ConeGeometry(.12+.05*h2(k,s,70),.55+.3*h2(k,2,70),6),new THREE.MeshBasicMaterial({color:k%2?0xffb040:0xff6a20,transparent:true,opacity:.92})); m.position.set(Math.cos(a)*r,1.6,Math.sin(a)*r); g.add(m); fl.push(m); }
      K.sph(.32,new THREE.MeshBasicMaterial({color:0xff5010}),0,1.38,0,at(g,{cast:false,phi:PI/2})); fires.push({g,fl,s}); ST.lights.push({k:'fire'+s,p:[0,1.7,0],g}); },{spd:1.5,sol:[-.5,-.5,.5,.5]});
  ST.fires=fires;

  /* ---------- the trees that walk in: cut-out trunks with real depth and heaped foliage, on wagons from each wing ---------- */
  for(const s of [-1,1])wagP('tree'+(s<0?'L':'R'),s*6.2,s*8.4,s<0?-5.6:-6.6,g=>{ const bk=lam({color:0x3a2a1e}), lv=[lam({color:0x1e3a1e}),lam({color:0x2a4a24}),lam({color:0x183018})];
      K.boxA(-1,0,-.6,1,.18,.6,M.black,at(g,{})); K.ext([[-.35,0],[.35,0],[.26,2.4],[.6,3.4],[.5,3.5],[.12,2.8],[.1,4.4],[-.1,4.4],[-.2,3.1],[-.7,3.8],[-.8,3.7],[-.28,2.6]],.32,bk,0,.18,-.16,at(g,{bevel:.04}));
      for(let k=0;k<26;k++){ const a=h2(k,s,71)*PI*2, r=.4+h2(k,2,71)*1.6, y=3.6+h2(k,3,71)*2.2-r*.4, m=new THREE.Mesh(new THREE.IcosahedronGeometry(.45+h2(k,4,71)*.45,0),lv[k%3]); m.position.set(Math.cos(a)*r,y,Math.sin(a)*r*.5); m.rotation.set(k,k*2,0); m.castShadow=true; g.add(m); } },{spd:1.0,sol:[-1,-.6,1,.6]});

  /* ---------- the workshop's side walls: plaster and timber flats canted in, on wagons ---------- */
  for(const s of [-1,1])wagP('side'+(s<0?'L':'R'),s*5.5,s*8.6,-6.6,g=>{ const wt=lam({color:0xd8c8a4}), tb=lam({color:0x4a3020}); const f=new THREE.Group(); f.rotation.y=s*.42; g.add(f);
      K.boxA(-.06,0,-1.4,.06,5.8,1.4,wt,at(f,{})); for(const z of [-1.35,0,1.35])K.boxA(s*-.08,0,z-.1,s*-.18,5.8,z+.1,tb,at(f,{})); K.boxA(s*-.08,2.9,-1.4,s*-.2,3.1,1.4,tb,at(f,{})); K.boxA(s*-.08,5.6,-1.4,s*-.2,5.8,1.4,tb,at(f,{}));
      for(const z of [-.6,.6])K.rod([s*.3,0,z],[0,4,z],.03,M.pine,{p:f}); K.boxA(-.4,0,-1.5,.4,.12,1.5,M.black,at(g,{}));
      if(s>0){ for(const y of [1.5,2.1])K.boxA(s*-.08,y,-1,s*-.4,y+.04,.4,M.pine,at(f,{})); for(let z=-.9;z<.3;z+=.22)K.cyl(.04,.05,.18,K.col('#8a6a4a'),s*-.25,1.63,z,at(f,{seg:8})); }
      else{ K.boxA(s*-.08,1.2,-.8,s*-.5,1.24,.8,M.pine,at(f,{})); for(let z=-.6;z<.7;z+=.3)K.boxA(s*-.25,1.24,z-.06,s*-.3,1.5,z+.06,K.col('#6a4a2a'),at(f,{})); } },{spd:1.6,sol:[-.5,-1.4,.5,1.4]});

  /* ---------- the bench truck: the carpenter's bench (vice, plane, mallet, shavings), sawhorses and a plank, six stools and a keg, candles ---------- */
  wagP('bench',1.2,7,-5.6,g=>{ K.boxA(-3,0,-1.3,3,.12,1.3,K.col('#5a4a3a'),at(g,{s:1}));
    K.boxA(-1.3,.95,-.45,1.3,1.05,.45,M.pine,at(g,{s:.8})); for(const [x,z] of [[-1.15,-.35],[1.15,-.35],[-1.15,.35],[1.15,.35]])K.boxA(x-.06,.12,z-.06,x+.06,.95,z+.06,M.pine,at(g,{})); K.boxA(-1.2,.3,-.4,1.2,.36,.4,M.pine,at(g,{}));
    K.boxA(1.2,.78,.38,1.45,1.1,.5,M.pine,at(g,{})); K.rod([1.32,.95,.5],[1.32,.95,.75],.02,M.iron,{p:g});
    K.boxA(-.6,1.05,-.1,-.28,1.15,0,M.pine,at(g,{})); K.cyl(.035,.035,.08,M.pine,-.44,1.18,-.05,at(g,{rz:PI/2})); K.boxA(.3,1.05,.1,.42,1.13,.18,K.col('#3a2a1a'),at(g,{})); K.rod([.36,1.13,.14],[.36,1.13,.5],.015,M.pine,{p:g});
    const shv=[]; for(let k=0;k<40;k++)shv.push([(h2(k,1,72)-.5)*2.4,.13+(k%5===0?.93:0),(h2(k,2,72)-.5)*1.6,h2(k,3,72)*6,1,PI/2*h2(k,4,72)]); K.inst(new THREE.TorusGeometry(.04,.01,4,10,PI*1.5),K.col('#e0c890'),shv);
    for(const x of [-2.3,2.3]){ for(const q of [-.3,.3])for(const r of [-1,1])K.rod([x+q,.12,r*.25],[x,.75,0],.025,M.pine,{p:g}); } K.boxA(-2.6,.75,-.15,2.6,.8,.15,M.pine,at(g,{}));
    for(const [x,z] of [[-2.4,.9],[-1.2,1.0],[0,1.1],[1.1,.95],[2.4,.85],[-.6,-1.0]]){ K.cyl(.2,.2,.05,M.pine,x,.55,z,at(g,{seg:12})); for(let k=0;k<3;k++){ const a=k/3*PI*2; K.rod([x+Math.cos(a)*.16,.12,z+Math.sin(a)*.16],[x+Math.cos(a)*.12,.53,z+Math.sin(a)*.12],.02,M.pine,{p:g}); } }
    K.lathe([[0,0],[.26,0],[.32,.3],[.26,.6],[0,.6]],K.col('#6a4a2a'),2.4,.12,-.9,at(g,{seg:14})); for(const y of [.2,.62])K.tor(.3,.015,M.iron,2.4,y,-.9,at(g,{rx:PI/2,seg:16}));
    const cand=[[-.9,1.05,.25],[.0,1.05,.32],[.9,1.05,.22]]; ST.candles=[]; for(const [x,y,z] of cand){ K.cyl(.06,.07,.03,M.brass,x,y+.015,z,at(g,{seg:10})); K.cyl(.025,.025,.2,M.ivory,x,y+.13,z,at(g,{seg:8}));
      const f=K.sph(.025,new THREE.MeshBasicMaterial({color:0xffc060}),x,y+.27,z,at(g,{cast:false})); f.scale.set(1,1.8,1); ST.candles.push(f); }
    ST.lights.push({k:'candles',p:[0,1.5,.3],g}); },{spd:1.2,sol:[-2.9,-1.3,2.9,1.3],top:.12});

  /* ---------- the wood's air: fireflies drifting and a ground mist that lies on the boards ---------- */
  { const n=60, m=new THREE.InstancedMesh(new THREE.SphereGeometry(.035,6,4),new THREE.MeshBasicMaterial({color:0xd8ff70,transparent:true,opacity:0}),n); m.castShadow=false; K.G.add(m); ST.flies={m,n,ph:Array.from({length:n},(_,i)=>[h2(i,1,73)*6,h2(i,2,73)*6,h2(i,3,73)])};
    fadeP('flies',v=>{ m.material.opacity=v; m.visible=v>.01; });
    const ft=paint(256,128,(g,w,h)=>{ for(let i=0;i<30;i++){ const x=h2(i,1,74)*w, y=h*.4+h2(i,2,74)*h*.4, r=30+h2(i,3,74)*50, gr=g.createRadialGradient(x,y,0,x,y,r); gr.addColorStop(0,'rgba(210,235,230,.35)'); gr.addColorStop(1,'rgba(210,235,230,0)'); g.fillStyle=gr; g.fillRect(0,0,w,h); } });
    const fm=new THREE.MeshBasicMaterial({map:ft,color:0x2a3c40,transparent:true,opacity:0,depthWrite:false}), fog=[]; for(let k=0;k<5;k++){ const me=K.plane(19,1.2,fm,0,SY+.3,-3-k*1.5,{cast:false}); me.renderOrder=4; fog.push(me); } ST.fog=fog;
    fadeP('fog',v=>{ fm.opacity=v*.35; for(const f of fog)f.visible=v>.01; }); }
  // the moonlight's shaft through the workshop window
  { const b=new THREE.Mesh(new THREE.CylinderGeometry(1.1,.5,7,4,1,true),new THREE.MeshBasicMaterial({color:0x8090ff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
    b.position.set(-.2,SY+2.0,F.s4.z+3.2); b.rotation.set(1.1,0,.25); b.renderOrder=5; K.G.add(b); fadeP('shaft',v=>{ b.material.opacity=v*.09; b.visible=v>.01; }); }

  /* ---------- the cyclorama: a seamless cloth across the back, lit from above and below (its colour is the lighting's) ---------- */
  { const s=F.cyc; s.y=SY+12.2; s.put(); const W=19.2, H=12, ge=new THREE.PlaneGeometry(W,H,1,8), c=new Float32Array(ge.attributes.position.count*3); for(let i=0;i<ge.attributes.position.count;i++){ const v=.5+ge.attributes.position.getY(i)/H; const k=1-.45*v+.35*Math.max(0,.15-v)/.15; c.set([k,k,k],i*3); }
    ge.setAttribute('color',new THREE.BufferAttribute(c,3)); K.cycMat=new THREE.MeshBasicMaterial({color:0x101018,vertexColors:true}); const m=new THREE.Mesh(ge,K.cycMat); m.position.set(0,-H/2-.05,0); s.g.add(m); K.rod([-W/2,-H-.05,.02],[W/2,-H-.05,.02],.04,M.steel,{p:s.g}); }

  /* ---------- the looks: which pieces are in for each (the rest go out) ---------- */
  ST.LOOKS={strike:{}, dusk:{cols:'in',banners:'in',throne:1,brzL:1,brzR:1}, court:{cols:'in',throne:1,brzL:1,brzR:1,moon:'in'}, strike1:{cols:'in',moon:'in',brzL:1,brzR:1}, wood:{cols:'in',moon:'in',ivy:'in',treeL:1,treeR:1,flies:1,fog:1},
    shop:{wall:'in',sideL:1,sideR:1,bench:1}, shopNight:{wall:'in',sideL:1,sideR:1,bench:1,moon:'window',shaft:1}, flats:{wall:'in',sideL:1,sideR:1,bench:1,flats:'in',moon:'window'}};
  ST.go=(name,instant)=>{ const L=ST.LOOKS[name]; if(!L)return; ST.look=name;
    for(const P of Object.values(ST.P)){ const v=L[P.id];
      if(P.type==='fly'){ const want=v?P.trims[v]:null; if(want!=null){ P.g.visible=true; P.on=v; if(instant){ P.s.y=want; P.s.target=null; P.s.put(); } else K.flyTo(P.s.id,want); } else { P.on=null; if(instant){ P.s.y=20.5; P.s.target=null; P.s.put(); P.g.visible=false; } else K.flyTo(P.s.id,20.5); } }
      else if(P.type==='wag'){ P.to=v?1:0; if(v)P.g.visible=true; if(instant){ P.t=P.to; P.g.position.x=P.outX+(P.inX-P.outX)*ease(P.t); P.g.visible=P.t>0; } }
      else if(P.type==='fade'){ P.to=v?1:0; if(instant){ P.v=P.to; P.set(P.v); } } } };
  // standing on a truck: its top is the ground; its bulk a solid
  K.gr.unshift((x,z)=>{ for(const P of Object.values(ST.P)){ if(P.type!=='wag'||!P.top||P.t<.98)continue; const s=P.sol, gx=P.g.position.x, gz=P.g.position.z; if(x>gx+s[0]&&x<gx+s[2]&&z>gz+s[1]&&z<gz+s[3])return SY+P.top; } return null; });
  ST.solids=()=>Object.values(ST.P).filter(P=>P.type==='wag'&&P.sol&&!P.top&&P.t>.98).map(P=>[P.g.position.x+P.sol[0],P.g.position.z+P.sol[1],P.g.position.x+P.sol[2],P.g.position.z+P.sol[3]]);
  // the practicals: two lamps that go where the fire or the lantern and candles are
  for(let i=0;i<2;i++){ const l=new THREE.PointLight(0xff9a40,0,9*K.MH,1.5); l.userData.pool=true; K.G.add(l); (ST.pl=ST.pl||[]).push(l); }
  ST.go('strike',true);
},
tick:(dt,K,now,inn)=>{ '@later'; const ST=K.sets; if(!ST)return; const t=now/1000, ease=k=>k<=0?0:k>=1?1:k*k*(3-2*k);
  for(const P of Object.values(ST.P)){
    if(P.type==='wag'&&P.t!==P.to){ const d=P.to-P.t; P.t+=Math.sign(d)*Math.min(Math.abs(d),dt*P.spd/Math.abs(P.inX-P.outX)); P.g.position.x=P.outX+(P.inX-P.outX)*ease(P.t); if(P.t<=0&&P.to===0)P.g.visible=false; K.solDirty=true; }
    if(P.type==='fade'&&P.v!==P.to){ const d=P.to-P.v; P.v+=Math.sign(d)*Math.min(Math.abs(d),dt/2.5); P.set(P.v); }
    if(P.type==='fly'&&P.on==null&&P.s.target==null&&P.s.y>=20.4)P.g.visible=false; }
  if(!inn)return;
  // cloth and chains that hang from the bars: their tops go where the bar goes, the rest follows
  const hangStep=(c,dy,sw)=>{ if(dy){ for(let i=0;i<c.nx;i++){ c.X[i*3+1]+=dy; c.Xp[i*3+1]+=dy; } c.still=0; } if(sw){ for(let i=c.nx;i<c.X.length/3;i++)c.X[i*3]+=sw*Math.sin(t*.7+c.ph+i*.1); c.still=0; } if(c.still<60){ DRAPE.step(c,1/60,c.o); DRAPE.out(c,c.me.geometry); } };
  const ban=ST.P.banners, ivy=ST.P.ivy;
  if(ban&&ban.g.visible&&ST.banners)for(const c of ST.banners)hangStep(c,0,0);
  if(ivy&&ivy.g.visible&&ST.ivy)for(const c of ST.ivy)hangStep(c,0,0);
  // the lantern swings on its chain
  const L=ST.lantern; if(L&&ST.P.wall.g.visible){ const c=L.c; if(c.still<200){ DRAPE.step(c,1/60,c.o); } const X=c.X, q=new THREE.Matrix4(); for(let i=0;i<L.n;i++){ q.makeRotationY(i%2?Math.PI/2:0); q.setPosition(X[i*3],X[i*3+1],X[i*3+2]); L.links.setMatrixAt(i,q); } L.links.instanceMatrix.needsUpdate=true;
    const e=(L.n-1)*3; L.lan.position.set(X[e],X[e+1]-.02,X[e+2]); L.lan.rotation.z=Math.atan2(X[e]-X[e-3],X[e-2]-X[e+1])*.6; L.fl.scale.setScalar(.9+.2*Math.sin(t*17)*Math.sin(t*5)); }
  for(const f of ST.fires||[])f.fl.forEach((m,k)=>{ m.scale.set(1,.75+.4*Math.abs(Math.sin(t*9+k*1.7)*Math.sin(t*4.3+k)),1); m.rotation.y=t*2+k; });
  for(const f of ST.candles||[])f.scale.set(1,1.5+.4*Math.sin(t*13+f.position.x*7),1);
  if(ST.flies&&ST.flies.m.visible){ const F=ST.flies, q=new THREE.Matrix4(); for(let i=0;i<F.n;i++){ const [a,b,c]=F.ph[i]; q.makeTranslation(Math.sin(t*.21+a)*8+Math.sin(t*.53+b)*1.2,K.D.SY+1+c*5+Math.sin(t*.4+b)*.6,-3-c*5.5+Math.sin(t*.33+a)*1); F.m.setMatrixAt(i,q); } F.m.instanceMatrix.needsUpdate=true; }
  for(const [k,f] of (ST.fog||[]).entries())f.position.x=Math.sin(t*.05+k)*2;
  // the practical lamps: by the fires in scene one, the lantern and the candles in scene two
  const lv=K.lx?K.lx.ch.prac.v:1, flick=.85+.15*Math.sin(t*11)*Math.sin(t*4.7), wp=new THREE.Vector3(), pts=[];
  if(ST.P.brzL&&ST.P.brzL.t>.5)for(const f of ST.fires){ f.g.getWorldPosition(wp); pts.push([K.G.worldToLocal(wp.clone()).add(new THREE.Vector3(0,1.8,0)),0xff8a30,22]); }
  if(ST.P.wall&&ST.P.wall.on&&L){ L.lan.getWorldPosition(wp); pts.push([K.G.worldToLocal(wp.clone()),0xffb060,14]); }
  if(ST.P.bench&&ST.P.bench.t>.5&&ST.candles&&ST.candles[1]){ ST.candles[1].getWorldPosition(wp); pts.push([K.G.worldToLocal(wp.clone()).add(new THREE.Vector3(0,.2,0)),0xffb860,10]); }
  ST.pl.forEach((l,i)=>{ const p=pts[i]; if(!p){ l.intensity=0; return; } l.position.copy(p[0]); l.color.set(p[1]); l.intensity=p[2]*lv*flick; }); }});
