// THE PLAYHOUSE'S STAGE: the stage house behind the proscenium: sprung boards with their traps, black brick walls to the grid, the counterweight flying system (bars on lift lines over the grid to the lock rail on the stage-left wall, their arbors riding it), the wings (the prompt desk, a props table, the fire point) and the ghost light.
import {THREE} from './003-shx.js';
const PHS={};
PHS.make=K=>{ '@playhouse';
  const D=K.D, M=K.M, TX=K.TX, PI=Math.PI, {box,boxA,cyl,lathe,plane,rod,tube,inst,sph,tor}=K, V3=THREE.Vector3, SY=D.SY, WG=D.WING, GRID=21.5, BACK=D.STG;
  const S=K.solid, both=(x0,z0,x1,z1)=>{ S(x0,z0,x1,z1); S(-x1,z0,-x0,z1); };

  /* ---------- the floor, the walls, the roof ---------- */
  boxA(-WG,0,BACK,WG,SY,0,M.boards,{s:2}).receiveShadow=true;
  // the traps: the long trap and the grave trap, their edges let into the boards, a flush ring to lift each
  for(const [x,z,w,d] of [[0,-4.2,1.2,2.4],[0,-7.6,1.0,2.0],[-3.5,-5.5,1.2,1.2],[3.5,-5.5,1.2,1.2]]){ for(const [a,b,c,e] of [[x-w/2,z-d/2,x+w/2,z-d/2+.02],[x-w/2,z+d/2-.02,x+w/2,z+d/2],[x-w/2,z-d/2,x-w/2+.02,z+d/2],[x+w/2-.02,z-d/2,x+w/2,z+d/2]])boxA(a,SY,b,c,SY+.003,e,M.matte,{cast:false});
    K.tor(.04,.008,M.brass,x+w/2-.15,SY+.004,z,{rx:PI/2,seg:12}); }
  for(const s of [-1,1])plane(-BACK,GRID+2.5,M.brickBlack,s*WG,(GRID+2.5)/2,BACK/2,{ry:-s*PI/2,s:1.2});
  plane(2*WG,GRID+2.5,M.brickBlack,0,(GRID+2.5)/2,BACK,{s:1.2}); boxA(-WG,GRID+2.5,BACK,WG,GRID+2.7,0,M.matte,{cast:false});
  both(WG,BACK-.4,WG+.4,0); S(-WG-.4,BACK-.4,WG+.4,BACK);
  // the scene dock's great doors (shut), stencilled
  { const sd=TX.print(512,512,(g,w,h)=>{ g.fillStyle='#2a2622'; g.fillRect(0,0,w,h); g.strokeStyle='#14110f'; g.lineWidth=6; for(let x=0;x<w;x+=64){ g.beginPath(); g.moveTo(x,0); g.lineTo(x,h); g.stroke(); } g.strokeRect(10,10,w-20,h-20);
      g.fillStyle='#d8d0b8'; g.font='bold 54px Courier New,monospace'; g.textAlign='center'; g.fillText('SCENE DOCK',w/2,170); g.font='bold 36px Courier New,monospace'; g.fillText('KEEP CLEAR',w/2,230); g.fillStyle='#c83020'; g.fillText('NO SMOKING',w/2,420); });
    plane(4,6,new THREE.MeshLambertMaterial({map:sd}),0,SY+3,BACK+.03,{}); boxA(-2.15,SY,BACK,2.15,SY+6.2,BACK+.12,M.iron).visible=true; plane(4,6,new THREE.MeshLambertMaterial({map:sd}),0,SY+3,BACK+.13,{});
    rod([-2,SY+6.4,BACK+.15],[2,SY+6.4,BACK+.15],.04,M.steel); }

  /* ---------- the grid: steel beams across under the roof, carrying the head blocks ---------- */
  for(let z=-.8;z>BACK;z-=2.05)boxA(-WG,GRID-.4,z-.08,WG,GRID-.06,z+.08,M.steel,{cast:false});

  /* ---------- the flying system: each bar on four lift lines up to the grid, across to the head block, down to its arbor and the lock rail ---------- */
  const U=new THREE.CylinderGeometry(1,1,1,6,1,true), seg=(m,a,b,r)=>{ const d=new V3(b[0]-a[0],b[1]-a[1],b[2]-a[2]), L=d.length()||1e-4; m.position.set((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2); m.quaternion.setFromUnitVectors(new V3(0,1,0),d.normalize()); m.scale.set(r,L,r); };
  const line=(r,mat)=>{ const m=new THREE.Mesh(U,mat); m.castShadow=false; K.G.add(m); return m; };
  const SETS=[['house',-.55,'curtain'],['b1',-1.0,'border'],['e1',-1.7,'elec'],['l1',-2.6,'legs'],['s1',-3.3,'scenery'],['b2',-4.0,'border'],['e2',-4.8,'elec'],['s2',-5.6,'scenery'],['l2',-6.2,'legs'],
    ['s3',-6.6,'scenery'],['b3',-7.0,'border'],['e3',-7.4,'elec'],['s4',-7.8,'scenery'],['l3',-8.1,'legs'],['s5',-8.4,'scenery'],['s6',-8.8,'scenery'],['b4',-9.05,'border'],['e4',-9.3,'elec'],['cyc',-9.6,'cyc'],['blk',-9.9,'black']];
  const lockT=TX.print(1024,64,(g,w,h)=>{ g.fillStyle='#e8e2d0'; g.fillRect(0,0,w,h); g.fillStyle='#181412'; g.font='bold 22px Courier New,monospace'; g.textAlign='center'; SETS.forEach((s,i)=>{ const x=(i+.5)/SETS.length*w; g.fillText(String(i+1),x,26); g.fillText(s[0].toUpperCase(),x,52); }); });
  const RX=WG-.5, HB=WG-.7, AX=WG-.25; K.fly={sets:[],GRID,byId:{},rail:RX};
  SETS.forEach(([id,z,kind],i)=>{ const g=new THREE.Group(); g.position.set(0,0,z); K.G.add(g); const L=kind==='cyc'||kind==='black'?9.6:9;
    const bar=new THREE.Mesh(new THREE.CylinderGeometry(.024,.024,2*L,8),M.steel); bar.rotation.z=PI/2; bar.castShadow=true; g.add(bar);
    const lx=[-L+.6,-L/3,L/3,L-.6], lift=lx.map(()=>line(.008,M.steel)), over=lx.map(()=>line(.008,M.steel)), down=line(.01,M.steel), pur=[line(.012,M.rope),line(.012,M.rope)];
    for(const x of lx){ K.cyl(.09,.09,.06,M.steel,x,GRID+.12,z,{rz:PI/2,seg:10}); } K.box(.3,.3,.18,M.steel,HB,GRID+.15,z);
    const arbor=new THREE.Group(), am=(g,mt,y,z)=>{ const o=new THREE.Mesh(g,mt); o.position.set(0,y,z); arbor.add(o); }; K.G.add(arbor); for(const q of [-.06,.06])am(new THREE.BoxGeometry(.03,1.6,.03),M.steel,.8,q);
    const nb=4+((i*7)%9); for(let k=0;k<nb;k++)am(new THREE.BoxGeometry(.1,.06,.16),k%3?M.iron:M.steel,.2+k*.065,0);
    am(new THREE.BoxGeometry(.12,.04,.2),M.steel,1.6,0);
    K.box(.12,.08,.09,M.iron,RX,SY+1.0,z); K.box(.03,.12,.03,M.red,RX-.06,SY+1.08,z);
    const S={id,z,kind,i,g,y:kind==='elec'?11:kind==='border'?10.6:kind==='legs'?10.4:kind==='curtain'?SY+.02:kind==='cyc'?SY+.02:kind==='black'?SY+.02:20.5,target:null,v:0,top:20.5,lx,L,
      put:()=>{ g.position.y=S.y; const ay=SY+.3+(20.5-S.y); arbor.position.set(AX,ay,z);
        lx.forEach((x,k)=>{ seg(lift[k],[x,S.y,z],[x,GRID+.12,z],.008); seg(over[k],[x,GRID+.2,z],[HB,GRID+.2,z],.008); });
        seg(down,[HB+.1,GRID+.05,z],[AX,ay+1.6,z],.01); seg(pur[0],[AX-.05,ay,z+.05],[RX+.05,SY+1.05,z+.05],.012); seg(pur[1],[RX+.05,SY+1.05,z-.05],[AX-.05,GRID,z-.05],.012); }};
    S.put(); K.fly.sets.push(S); K.fly.byId[id]=S; });
  // the lock rail: the steel rail at the stage left wall, the index strip with each line's number and name, the T-track the arbors ride
  boxA(RX-.15,SY+.85,SETS[SETS.length-1][1]-.3,RX-.05,SY+.95,SETS[0][1]+.3,M.steel); boxA(RX-.15,SY+1.12,SETS[SETS.length-1][1]-.3,RX-.05,SY+1.16,SETS[0][1]+.3,M.steel);
  { const z0=SETS[SETS.length-1][1]-.3, z1=SETS[0][1]+.3; const m=plane(z1-z0,.12,new THREE.MeshLambertMaterial({map:lockT}),RX-.16,SY+.9,(z0+z1)/2,{ry:-PI/2}); }
  for(let z=SETS[0][1]+.3;z>SETS[SETS.length-1][1]-.4;z-=.8)rod([WG-.1,SY,z],[WG-.1,GRID,z],.04,M.steel);
  S(RX-.2,BACK,WG,-.2);
  // a bar flies (for a scene change, a drop, a pull on its rope): it eases to where it is sent and its lines and arbor go with it
  K.flyTo=(id,y)=>{ const s=K.fly.byId[id]; if(s)s.target=Math.max(SY+.02,Math.min(20.5,y)); };
  K.flyStep=dt=>{ let moving=false; for(const s of K.fly.sets){ if(s.target==null)continue; const d=s.target-s.y; if(Math.abs(d)<.002){ s.y=s.target; s.target=null; s.v=0; s.put(); continue; }
      s.v=Math.max(-1.6,Math.min(1.6,s.v+Math.sign(d)*dt*2.2)); if(Math.abs(d)<s.v*s.v/(2*2.2))s.v-=Math.sign(s.v)*dt*2.2*2; const st=s.v*dt; s.y=Math.abs(st)>Math.abs(d)?s.target:s.y+st; s.put(); moving=true; } return moving; };

  /* ---------- the prompt corner: the stage manager's desk, its book, lamp, cue lights, clock ---------- */
  { const x=-8.9, z=-1.4; boxA(x-.6,SY,z-.35,x+.6,SY+1.05,z+.35,M.mahog); const top=K.box(1.3,.04,.8,M.mahog,x,SY+1.12,z,{rx:.18});
    const bk=TX.print(256,192,(g,w,h)=>{ g.fillStyle='#efe6d0'; g.fillRect(0,0,w,h); g.fillStyle='#2a2018'; g.font='9px Georgia,serif'; for(let i=0;i<16;i++){ g.fillText('THESEUS. Now, fair Hippolyta, our nuptial hour'.slice(0,22+(i*7)%20),10,16+i*11); g.fillText('Four happy days bring in'.slice(0,10+(i*5)%14),134,16+i*11); }
      g.fillStyle='#c82020'; g.font='bold 10px Georgia,serif'; g.fillText('LX Q1 GO',90,60); g.fillText('FLY Q2',200,120); g.fillStyle='#888'; g.fillRect(127,0,2,h); });
    K.box(.62,.02,.44,new THREE.MeshLambertMaterial({map:bk}),x,SY+1.16,z,{rx:.18}); rod([x+.5,SY+1.14,z-.25],[x+.45,SY+1.6,z-.1],.008,M.iron); K.cyl(.05,.03,.08,M.iron,x+.3,SY+1.55,z,{rz:-1}); K.sph(.025,new THREE.MeshBasicMaterial({color:0x6a7aff}),x+.27,SY+1.52,z,{cast:false});
    const cue=new THREE.Group(); for(let k=0;k<6;k++){ for(const [c,dy] of [[M.red,0],[M.green,-.07]]){ const b=new THREE.Mesh(new THREE.SphereGeometry(.018,6,4),c); b.position.set(x-.5+k*.11,SY+1.42+dy,z-.36); cue.add(b); } } K.G.add(cue); K.cueLights=cue;
    boxA(x-.58,SY+1.32,z-.4,x+.02,SY+1.5,z-.36,M.iron); K.cyl(.13,.13,.04,M.ivory,x,SY+1.95,z-.36,{rx:PI/2,seg:20}); tor(.13,.015,M.brass,x,SY+1.95,z-.34,{seg:20});
    lathe([[0,0],[.2,0],[.2,.03],[.03,.05],[.03,.7],[.18,.72],[.18,.76],[0,.76]],M.iron,x-.1,SY,z+.7); tor(.09,.012,M.black,x+.7,SY+1.6,z+.36,{seg:16});
    S(x-.65,z-.45,x+.65,z+.4); K.prompt=[x,SY+1.2,z]; }

  /* ---------- the ghost light: a bare bulb in a cage on a stand, centre stage, burning whenever the stage is dark ---------- */
  { const g=new THREE.Group(), x=0, z=-3.2; for(let k=0;k<3;k++){ const a=k/3*PI*2; const r=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,.55,6),M.iron); r.position.set(x+Math.cos(a)*.22,SY+.12,z+Math.sin(a)*.22); r.rotation.set(Math.sin(a)*.9,0,-Math.cos(a)*.9); g.add(r); }
    const p=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,1.6,6),M.iron); p.position.set(x,SY+1.0,z); g.add(p);
    for(let k=0;k<6;k++){ const w=new THREE.Mesh(new THREE.TorusGeometry(.11,.006,4,12,PI),M.iron); w.position.set(x,SY+1.92,z); w.rotation.y=k/6*PI; g.add(w); }
    const b=new THREE.Mesh(new THREE.SphereGeometry(.06,10,8),M.bulb); b.position.set(x,SY+1.9,z); g.add(b); K.G.add(g); K.ghost={g,at:[x,SY+1.9,z],b}; }

  /* ---------- stage right: a props table (its paper top with every prop's outline taped on), the fire point ---------- */
  { const tbl=(x,z,props)=>{ boxA(x-.9,SY+.86,z-.45,x+.9,SY+.9,z+.45,M.pine); boxA(x-.88,SY+.9,z-.43,x+.88,SY+.902,z+.43,M.paper,{cast:false});
      for(const q of [[-.8,-.38],[.8,-.38],[-.8,.38],[.8,.38]])boxA(x+q[0]-.03,SY,z+q[1]-.03,x+q[0]+.03,SY+.86,z+q[1]+.03,M.pine);
      boxA(x-.85,SY+.3,z-.4,x+.85,SY+.32,z+.4,M.pine);
      for(const [px,pz,w,d,make] of props){ for(const [a,b,c,e] of [[px-w/2,pz-d/2,px+w/2,pz-d/2+.012],[px-w/2,pz+d/2-.012,px+w/2,pz+d/2],[px-w/2,pz-d/2,px-w/2+.012,pz+d/2],[px+w/2-.012,pz-d/2,px+w/2,pz+d/2]])boxA(x+a,SY+.902,z+b,x+c,SY+.904,z+e,M.matte,{cast:false}); make(x+px,SY+.904,z+pz); }
      S(x-.95,z-.5,x+.95,z+.5); };
    const scroll=(x,y,z)=>{ cyl(.03,.03,.28,M.paper,x,y+.03,z,{rz:PI/2,seg:10}); for(const s of [-1,1])cyl(.012,.012,.04,M.mahog,x+s*.16,y+.03,z,{rz:PI/2}); };
    const goblet=(x,y,z)=>lathe([[0,0],[.05,0],[.05,.01],[.01,.03],[.01,.12],[.045,.15],[.05,.22],[0,.22]],M.gold,x,y,z,{seg:12});
    const lion=(x,y,z)=>{ sph(.16,new THREE.MeshLambertMaterial({color:0xc89040}),x,y+.16,z,{seg:12}); const mane=[]; for(let i=0;i<26;i++){ const a=i/26*PI*2; mane.push([x+Math.cos(a)*.18,y+.16+Math.sin(a)*.18,z-.02,0,1,0,a]); }
      inst(new THREE.ConeGeometry(.05,.16,5),new THREE.MeshLambertMaterial({color:0x8a4a1a}),mane); for(const e of [-1,1])sph(.025,M.matte,x+e*.06,y+.2,z+.14,{seg:6}); };
    const crown=(x,y,z)=>{ cyl(.1,.1,.08,M.gold,x,y+.04,z,{open:true,seg:16}); for(let i=0;i<8;i++){ const a=i/8*PI*2; K.box(.025,.06,.01,M.gold,x+Math.cos(a)*.1,y+.11,z+Math.sin(a)*.1,{ry:-a}); } };
    const lantern=(x,y,z)=>{ boxA(x-.08,y,z-.08,x+.08,y+.22,z+.08,M.glass); boxA(x-.09,y+.22,z-.09,x+.09,y+.25,z+.09,M.iron); tor(.05,.008,M.iron,x,y+.3,z,{seg:10}); };
    tbl(-8.9,-7.9,[[-.4,0,.4,.4,lion],[.2,-.2,.2,.2,lantern],[.55,.15,.34,.12,scroll],[.2,.22,.34,.12,scroll],[-.75,-.25,.26,.26,crown],[-.75,.25,.14,.14,goblet]]);
    // the fire point: a red bucket of sand, an axe on its board, a hose reel
    { const x=-WG+.2, z=-9.4; lathe([[0,0],[.13,0],[.16,.28],[0,.28]],new THREE.MeshLambertMaterial({color:0xb81e14}),x+.25,SY,z,{seg:12}); boxA(x,SY+1.2,z-.35,x+.04,SY+2,z+.35,new THREE.MeshLambertMaterial({color:0xb81e14}));
      K.cyl(.3,.3,.12,new THREE.MeshLambertMaterial({color:0xb81e14}),x+.1,SY+2.6,z,{rz:PI/2,seg:20}); tor(.24,.04,new THREE.MeshLambertMaterial({color:0xc8b890}),x+.16,SY+2.6,z,{ry:PI/2,seg:20}); } }

  return K; };
export {PHS};
