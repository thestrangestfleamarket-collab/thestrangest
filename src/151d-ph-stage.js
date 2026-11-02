// THE PLAYHOUSE'S STAGE: the stage house behind the proscenium: sprung boards with their traps, black brick walls to the grid, the counterweight flying system (bars on lift lines over the grid to the lock rail, their arbors riding the wall), the fly gallery, the wings (props tables, flats, the prompt desk, the ghost light), and backstage the corridor and the two dressing rooms.
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
  both(13.5,BACK-8.4,13.9,0); S(-13.9,BACK-.4,-10.8,BACK); S(-9.6,BACK-.4,9.6,BACK); S(10.8,BACK-.4,13.9,BACK);
  // the scene dock's great doors (shut), stencilled; the two doors to the corridor (open), lit beyond
  { const sd=TX.print(512,512,(g,w,h)=>{ g.fillStyle='#2a2622'; g.fillRect(0,0,w,h); g.strokeStyle='#14110f'; g.lineWidth=6; for(let x=0;x<w;x+=64){ g.beginPath(); g.moveTo(x,0); g.lineTo(x,h); g.stroke(); } g.strokeRect(10,10,w-20,h-20);
      g.fillStyle='#d8d0b8'; g.font='bold 54px Courier New,monospace'; g.textAlign='center'; g.fillText('SCENE DOCK',w/2,170); g.font='bold 36px Courier New,monospace'; g.fillText('KEEP CLEAR',w/2,230); g.fillStyle='#c83020'; g.fillText('NO SMOKING',w/2,420); });
    plane(4,6,new THREE.MeshLambertMaterial({map:sd}),0,SY+3,BACK+.03,{}); boxA(-2.15,SY,BACK,2.15,SY+6.2,BACK+.12,M.iron).visible=true; plane(4,6,new THREE.MeshLambertMaterial({map:sd}),0,SY+3,BACK+.13,{});
    rod([-2,SY+6.4,BACK+.15],[2,SY+6.4,BACK+.15],.04,M.steel);
    for(const s of [-1,1]){ const x=s*10.2; boxA(x-.7,SY,BACK-.05,x-.6,SY+2.5,BACK+.05,M.pine); boxA(x+.6,SY,BACK-.05,x+.7,SY+2.5,BACK+.05,M.pine); boxA(x-.7,SY+2.4,BACK-.05,x+.7,SY+2.5,BACK+.05,M.pine);
      const d=boxA(0,0,0,1.15,2.35,.05,M.pine); d.position.set(x+s*.6,SY+1.18,BACK-.6); d.rotation.y=s*1.2; K.sph(.03,M.brass,x+s*.1,SY+1.05,BACK-1.1,{cast:false});
      boxA(x-.25,SY+2.6,BACK+.02,x+.25,SY+2.8,BACK+.06,M.exit); } }

  /* ---------- the grid, the loading gallery, the fly gallery, the pin rail and its sandbags ---------- */
  { const sl=[]; for(let x=-11.6;x<=11.6;x+=.22)sl.push([x,GRID,BACK/2,0,1,0,0,[.06,.06,-BACK-.4]]); inst(new THREE.BoxGeometry(1,1,1),M.steel,sl,{cast:false});
    for(let z=-.8;z>BACK;z-=2.05)boxA(-WG,GRID-.4,z-.08,WG,GRID-.06,z+.08,M.steel,{cast:false});
    boxA(12,18.6,BACK+.5,WG,18.7,-.4,M.steel); for(let z=-.5;z>BACK+.5;z-=1)rod([12,18.7,z],[12,19.8,z],.02,M.steel); rod([12,19.75,BACK+.5],[12,19.75,-.5],.025,M.steel);
    // the fly gallery, stage right, its pin rail: hemp lines made off on pins, their sandbags hung clear of the floor
    boxA(-WG,9.2,BACK+.5,-11.8,9.32,-.6,M.pine); rod([-11.8,10.3,BACK+.5],[-11.8,10.3,-.6],.04,M.pine); for(let z=-.6;z>BACK+.5;z-=1.2)rod([-11.8,9.32,z],[-11.8,10.3,z],.035,M.pine);
    boxA(-11.86,9.9,BACK+1,-11.74,10.05,-1,M.pine); const pins=[]; for(let z=-1.2;z>BACK+1.2;z-=.4)pins.push([-11.8,10.0,z,0,1,0,PI/2]); inst(new THREE.CylinderGeometry(.018,.022,.45,6),M.mahog,pins);
    for(let i=0,z=-1.6;z>BACK+2;z-=1.6,i++){ const bag=[-11.4+(i%2)*.15,2.6+(i%3)*1.4,z]; rod([-11.8,10,z],[-11.8,GRID-.1,z+.2],.012,M.rope); rod([-11.8,10,z],[bag[0],bag[1]+.42,bag[2]],.012,M.rope);
      K.lathe([[0,0],[.18,.05],[.22,.25],[.16,.4],[.04,.45],[0,.45]],M.sand,bag[0],bag[1],bag[2],{seg:10}); (K.bags=K.bags||[]).push(bag); } }

  /* ---------- the flying system: each bar on four lift lines up to the grid, across to the head block, down to its arbor and the lock rail ---------- */
  const U=new THREE.CylinderGeometry(1,1,1,6,1,true), seg=(m,a,b,r)=>{ const d=new V3(b[0]-a[0],b[1]-a[1],b[2]-a[2]), L=d.length()||1e-4; m.position.set((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2); m.quaternion.setFromUnitVectors(new V3(0,1,0),d.normalize()); m.scale.set(r,L,r); };
  const line=(r,mat)=>{ const m=new THREE.Mesh(U,mat); m.castShadow=false; K.G.add(m); return m; };
  const SETS=[['house',-.55,'curtain'],['b1',-1.0,'border'],['e1',-1.7,'elec'],['l1',-2.6,'legs'],['s1',-3.3,'scenery'],['b2',-4.0,'border'],['e2',-4.8,'elec'],['s2',-5.6,'scenery'],['l2',-6.4,'legs'],
    ['s3',-7.2,'scenery'],['b3',-8.0,'border'],['e3',-8.8,'elec'],['s4',-9.6,'scenery'],['l3',-10.4,'legs'],['s5',-11.2,'scenery'],['s6',-12.0,'scenery'],['b4',-12.8,'border'],['e4',-13.6,'elec'],['cyc',-14.6,'cyc'],['blk',-15.6,'black']];
  const lockT=TX.print(1024,64,(g,w,h)=>{ g.fillStyle='#e8e2d0'; g.fillRect(0,0,w,h); g.fillStyle='#181412'; g.font='bold 22px Courier New,monospace'; g.textAlign='center'; SETS.forEach((s,i)=>{ const x=(i+.5)/SETS.length*w; g.fillText(String(i+1),x,26); g.fillText(s[0].toUpperCase(),x,52); }); });
  K.fly={sets:[],GRID,byId:{}};
  SETS.forEach(([id,z,kind],i)=>{ const g=new THREE.Group(); g.position.set(0,0,z); K.G.add(g); const L=kind==='cyc'||kind==='black'?11:10;
    const bar=new THREE.Mesh(new THREE.CylinderGeometry(.024,.024,2*L,8),M.steel); bar.rotation.z=PI/2; bar.castShadow=true; g.add(bar);
    const lx=[-L+.6,-L/3,L/3,L-.6], lift=lx.map(()=>line(.008,M.steel)), over=lx.map(()=>line(.008,M.steel)), down=line(.01,M.steel), pur=[line(.012,M.rope),line(.012,M.rope)];
    for(const x of lx){ K.cyl(.09,.09,.06,M.steel,x,GRID+.12,z,{rz:PI/2,seg:10}); } K.box(.3,.3,.18,M.steel,12.6,GRID+.15,z);
    const arbor=new THREE.Group(), am=(g,mt,y,z)=>{ const o=new THREE.Mesh(g,mt); o.position.set(0,y,z); arbor.add(o); }; K.G.add(arbor); for(const q of [-.06,.06])am(new THREE.BoxGeometry(.03,1.6,.03),M.steel,.8,q);
    const nb=4+((i*7)%9); for(let k=0;k<nb;k++)am(new THREE.BoxGeometry(.1,.06,.16),k%3?M.iron:M.steel,.2+k*.065,0);
    am(new THREE.BoxGeometry(.12,.04,.2),M.steel,1.6,0);
    K.box(.12,.08,.09,M.iron,13.0,SY+1.0,z); K.box(.03,.12,.03,M.red,12.94,SY+1.08,z);
    const S={id,z,kind,i,g,y:kind==='elec'?11:kind==='border'?10.6:kind==='legs'?10.4:kind==='curtain'?SY+.02:kind==='cyc'?SY+.02:kind==='black'?SY+.02:20.5,target:null,v:0,top:20.5,lx,L,
      put:()=>{ g.position.y=S.y; const ay=SY+.3+(20.5-S.y); arbor.position.set(13.3,ay,z);
        lx.forEach((x,k)=>{ seg(lift[k],[x,S.y,z],[x,GRID+.12,z],.008); seg(over[k],[x,GRID+.2,z],[12.6,GRID+.2,z],.008); });
        seg(down,[12.7,GRID+.05,z],[13.3,ay+1.6,z],.01); seg(pur[0],[13.25,ay,z+.05],[13.05,SY+1.05,z+.05],.012); seg(pur[1],[13.05,SY+1.05,z-.05],[13.25,GRID,z-.05],.012); }};
    S.put(); K.fly.sets.push(S); K.fly.byId[id]=S; });
  // the lock rail: the steel rail at the stage left wall, the index strip with each line's number and name, the T-track the arbors ride
  boxA(12.85,SY+.85,SETS[SETS.length-1][1]-.3,12.95,SY+.95,SETS[0][1]+.3,M.steel); boxA(12.85,SY+1.12,SETS[SETS.length-1][1]-.3,12.95,SY+1.16,SETS[0][1]+.3,M.steel);
  { const z0=SETS[SETS.length-1][1]-.3, z1=SETS[0][1]+.3; const m=plane(z1-z0,.12,new THREE.MeshLambertMaterial({map:lockT}),12.84,SY+.9,(z0+z1)/2,{ry:-PI/2}); }
  for(let z=SETS[0][1]+.3;z>SETS[SETS.length-1][1]-.4;z-=.8)rod([13.45,SY,z],[13.45,GRID,z],.04,M.steel);
  S(12.6,SETS[SETS.length-1][1]-.5,13.5,SETS[0][1]+.4);
  // a bar flies (for a scene change, a drop, a pull on its rope): it eases to where it is sent and its lines and arbor go with it
  K.flyTo=(id,y)=>{ const s=K.fly.byId[id]; if(s)s.target=Math.max(SY+.02,Math.min(20.5,y)); };
  K.flyStep=dt=>{ let moving=false; for(const s of K.fly.sets){ if(s.target==null)continue; const d=s.target-s.y; if(Math.abs(d)<.002){ s.y=s.target; s.target=null; s.v=0; s.put(); continue; }
      s.v=Math.max(-1.6,Math.min(1.6,s.v+Math.sign(d)*dt*2.2)); if(Math.abs(d)<s.v*s.v/(2*2.2))s.v-=Math.sign(s.v)*dt*2.2*2; const st=s.v*dt; s.y=Math.abs(st)>Math.abs(d)?s.target:s.y+st; s.put(); moving=true; } return moving; };

  /* ---------- the prompt corner: the stage manager's desk, its book, lamp, cue lights, clock ---------- */
  { const x=10.4, z=-1.6; boxA(x-.6,SY,z-.35,x+.6,SY+1.05,z+.35,M.mahog); const top=K.box(1.3,.04,.8,M.mahog,x,SY+1.12,z,{rx:.18});
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

  /* ---------- stage right: the props tables (their paper tops with every prop's outline taped on), a lion's head, scrolls, goblets; flats stacked to the wall; a ladder; a costume rail ---------- */
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
    const book=(x,y,z)=>boxA(x-.12,y,z-.17,x+.12,y+.05,z+.17,new THREE.MeshLambertMaterial({color:0x5a1a14}));
    tbl(-10.6,-2.2,[[-.55,-.2,.34,.12,scroll],[-.15,-.2,.34,.12,scroll],[.25,-.2,.34,.12,scroll],[-.55,.15,.14,.14,goblet],[-.3,.15,.14,.14,goblet],[.05,.18,.26,.26,crown],[.5,.1,.3,.4,book]]);
    tbl(-10.6,-6.4,[[-.4,0,.4,.4,lion],[.2,-.2,.2,.2,lantern],[.55,.15,.34,.12,scroll],[.2,.22,.34,.12,scroll]]);
    // flats leaning on the wall: their timber frames and toggles, raw canvas backs out, stencilled with their show and scene
    const fl=TX.print(256,512,(g,w,h)=>{ g.drawImage(TX.canvas.image,0,0,w,h); g.fillStyle='#3a2a20'; g.font='bold 30px Courier New,monospace'; g.fillText("MND I.1",30,120); g.font='18px Courier New,monospace'; g.fillText('PALACE · SR 3',30,150); g.fillText('THIS WAY UP ↑',30,460); });
    const fm=new THREE.MeshLambertMaterial({map:fl,side:THREE.DoubleSide});
    for(let k=0;k<6;k++){ const z=-9.5-k*.9, lean=.1, h=5.5, gx=-13.3+k*.06; const g=new THREE.Group(); g.position.set(gx+Math.sin(lean)*h,SY,z); g.rotation.z=lean; K.G.add(g);
      const add=(m,x,y,zz)=>{ m.position.set(x,y,zz); m.castShadow=true; g.add(m); return m; };
      add(new THREE.Mesh(new THREE.PlaneGeometry(1.2,h),fm),.04,h/2,0).rotation.y=-PI/2;
      for(const zz of [-.58,.58])add(new THREE.Mesh(new THREE.BoxGeometry(.08,h,.05),M.pine),0,h/2,zz); for(const y of [.03,h/2,h-.03])add(new THREE.Mesh(new THREE.BoxGeometry(.08,.05,1.2),M.pine),0,y,0);
      const br=add(new THREE.Mesh(new THREE.BoxGeometry(.06,2.4,.04),M.pine),0,h/2+1.2,0); br.rotation.x=.42; }
    S(-13.5,-15,-12.6,-9);
    // an A-frame ladder, its spreader chain slack
    { const x=-11.2, z=-11.8; for(const s of [-1,1]){ rod([x-.3,SY,z+s*.6],[x-.05,SY+3.4,z+s*.05],.03,M.pine); rod([x+.3,SY,z+s*.6],[x+.05,SY+3.4,z+s*.05],.03,M.pine); }
      for(let k=1;k<11;k++){ const t=k/11; rod([x-.3+.25*t,SY+3.4*t,z-.6+.55*t],[x-.3+.25*t,SY+3.4*t,z+.6-.55*t],.02,M.pine); } tube(K.cat([x-.15,SY+1.6,z],[x+.15,SY+1.6,z],.25),.006,M.iron,{n:12}); S(x-.4,z-.7,x+.4,z+.7); }
    // a costume rail: the court's robes and the mechanicals' smocks on hangers, hanging plumb
    { const x=-12.4, z0=-1.5, z1=-4.2; for(const z of [z0,z1]){ rod([x,SY,z],[x,SY+1.8,z],.02,M.chrome); } rod([x,SY+1.8,z0],[x,SY+1.8,z1],.018,M.chrome);
      const cols=['#6a2a8a','#3a7a4a','#c04a5a','#2a4a9a','#a8302a','#e0c860','#8a6a4a','#6a8a8a'];
      cols.forEach((c,i)=>{ const z=z0-.25-i*.32, m=new THREE.MeshLambertMaterial({color:c}); tor(.03,.004,M.chrome,x,SY+1.83,z,{arc:PI,seg:8}); rod([x,SY+1.74,z-.18],[x,SY+1.74,z+.18],.006,M.mahog);
        const L=new THREE.LatheGeometry([[0,0],[.22,0],[.2,.4],[.14,.9],[.12,1.0],[0,1.0]].map(p=>new THREE.Vector2(p[0],p[1])),12); const r=new THREE.Mesh(L,m); r.position.set(x,SY+.7,z); r.scale.set(.55,1,1); r.castShadow=true; K.G.add(r); });
      S(x-.3,z1-.1,x+.3,z0+.1); }
    // the fire point: a red bucket of sand, an axe on its board, a hose reel
    { const x=-13.3, z=-.9; lathe([[0,0],[.13,0],[.16,.28],[0,.28]],new THREE.MeshLambertMaterial({color:0xb81e14}),x+.25,SY,z,{seg:12}); boxA(x,SY+1.2,z-.35,x+.04,SY+2,z+.35,new THREE.MeshLambertMaterial({color:0xb81e14}));
      K.cyl(.3,.3,.12,new THREE.MeshLambertMaterial({color:0xb81e14}),x+.1,SY+2.6,z,{rz:PI/2,seg:20}); tor(.24,.04,new THREE.MeshLambertMaterial({color:0xc8b890}),x+.16,SY+2.6,z,{ry:PI/2,seg:20}); } }

  /* ---------- backstage: the corridor (whitewashed brick, the callboard, pipes overhead), the dressing rooms with their bulb-ringed mirrors ---------- */
  { const zc0=BACK-.4, zc1=-18.6, zr=-24.4;
    boxA(-WG,0,zr-.4,WG,SY,zc0,K.col('#6a5a4a'),{s:1}); boxA(-WG,SY,zr-.4,WG,SY+.004,zc0,K.col('#4a4e46'),{cast:false});
    plane(2*WG,3.2,M.brickWhite,0,SY+1.6,zc0-.01,{ry:PI,s:1.2}); plane(2*WG,3.2,M.brickWhite,0,SY+1.6,zc1+.01,{s:1.2}); for(const s of [-1,1])plane(zc0-zr,3.2,M.brickWhite,s*WG,SY+1.6,(zc0+zr)/2,{ry:-s*PI/2,s:1.2});
    boxA(-WG,SY+3.2,zr-.4,WG,SY+3.4,zc0,M.plaster,{cast:false});
    for(const y of [SY+2.9,SY+3.05])rod([-WG,y,zc0-.2],[WG,y,zc0-.2],.04,M.iron); rod([-WG,SY+2.95,zc1+.25],[WG,SY+2.95,zc1+.25],.07,K.col('#7a3a2a'));
    S(-13.9,zc1-.2,-7.5,zc1); S(-6.5,zc1-.2,6.5,zc1); S(7.5,zc1-.2,13.9,zc1); S(-.2,zr,.2,zc1); S(-13.9,zr-.4,13.9,zr);
    const cb=TX.print(512,384,(g,w,h)=>{ g.fillStyle='#8a6a48'; g.fillRect(0,0,w,h); for(let i=0;i<900;i++){ g.fillStyle=`rgba(60,40,24,${Math.random()*.3})`; g.fillRect(Math.random()*w,Math.random()*h,2,2); }
      const note=(x,y,ww,hh,rot,lines,col)=>{ g.save(); g.translate(x,y); g.rotate(rot); g.fillStyle=col||'#f2ecd8'; g.fillRect(0,0,ww,hh); g.fillStyle='#1a1410'; g.font='13px Georgia,serif'; lines.forEach((l,i)=>g.fillText(l,8,20+i*16)); g.fillStyle='#c02020'; g.beginPath(); g.arc(ww/2,6,4,0,7); g.fill(); g.restore(); };
      note(20,20,200,140,-.03,['CALL SHEET','Act I beginners please:','Theseus, Hippolyta, Egeus,','Hermia, Lysander, Demetrius','Helena · Sc.II: Quince, Bottom,','Flute, Snout, Snug, Starveling']);
      note(250,30,230,110,.04,['CURTAIN UP','on the hour and half hour.','Quiet in the wings.','— S.M.']); note(40,190,180,120,.05,['SNUG:','The lion head is on','props table SR. DO NOT','wear it in the green room.'],'#fff3a0');
      note(260,170,220,150,-.02,['THE COURSE OF TRUE LOVE','NEVER DID RUN SMOOTH','(nor does the fly floor:','check your trims)','','Notes after the show.']); });
    plane(1.6,1.2,new THREE.MeshLambertMaterial({map:cb}),-3,SY+1.6,zc1+.03,{}); K.box(1.7,1.3,.04,M.pine,-3,SY+1.6,zc1+.0);
    const cage=(x,y,z)=>{ K.sph(.07,M.bulb,x,y,z,{cast:false}); for(let k=0;k<4;k++){ const w=new THREE.Mesh(new THREE.TorusGeometry(.1,.005,4,10,PI),M.iron); w.position.set(x,y,z); w.rotation.y=k/4*PI; K.G.add(w); } };
    for(const x of [-9,0,9])cage(x,SY+3.05,(zc0+zc1)/2); K.corridor=[0,SY+2.9,(zc0+zc1)/2];
    // the doors into the rooms, open; the names on them
    for(const [x,name] of [[-7,'DRESSING ROOM 1'],[7,'DRESSING ROOM 2']]){ boxA(x-.55,SY,zc1-.2,x-.5,SY+2.2,zc1,M.pine); boxA(x+.5,SY,zc1-.2,x+.55,SY+2.2,zc1,M.pine); boxA(x-.55,SY+2.15,zc1-.2,x+.55,SY+2.2,zc1,M.pine);
      const d=boxA(0,0,0,1.0,2.1,.04,K.col('#5a4a3a')); d.position.set(x-.5,SY+1.05,zc1-.2); d.rotation.y=-1.1;
      plane(.9,.18,new THREE.MeshLambertMaterial({map:TX.print(256,48,(g,w,h)=>{ g.fillStyle='#d8d0b8'; g.fillRect(0,0,w,h); g.fillStyle='#181410'; g.font='bold 22px Courier New,monospace'; g.textAlign='center'; g.fillText(name,w/2,32); })}),x,SY+2.45,zc1+.02,{}); }
    // each room: the long counter, the mirror ringed with bulbs, chairs, the make-up, wig blocks, a rail of costumes, a sink, a couch or a trunk
    for(const s of [-1,1]){ const xa=s<0?-WG+.2:.4, xb=s<0?-.4:WG-.2, cx=(xa+xb)/2, wd=xb-xa;
      boxA(xa,SY,zr,xb,SY+.8,zr+.6,K.col('#e0d8c8')); boxA(xa,SY+.8,zr-.02,xb,SY+.84,zr+.65,K.col('#3a3632'));
      K.mirrors.push({w:wd-.6,h:1.05,at:[cx,SY+1.55,zr+.02],ry:0,zone:s<0?'dr1':'dr2'});
      const bl=[]; for(let x=xa+.25;x<xb-.2;x+=.22){ bl.push([x,SY+2.15,zr+.06]); } for(let y=SY+1.05;y<SY+2.1;y+=.21){ bl.push([xa+.22,y,zr+.06],[xb-.22,y,zr+.06]); }
      K.inst(new THREE.SphereGeometry(.045,8,6),M.bulb,bl,{cast:false}); (K.mirrorBulbs=K.mirrorBulbs||[]).push([cx,SY+2.0,zr+.6]);
      const pots=[]; for(let x=xa+.4;x<xb-.3;x+=.5){ pots.push([x,SY+.88,zr+.25],[x+.12,SY+.88,zr+.32]); cyl(.03,.03,.12,K.col(['#c84a4a','#e8c8a8','#4a3a3a','#f0e8e0'][Math.floor(x*7)&3]),x+.25,SY+.9,zr+.4,{seg:8}); }
      inst(new THREE.CylinderGeometry(.04,.04,.04,10),K.col('#d8b098'),pots);
      for(let x=xa+.8;x<xb-.5;x+=1.4){ boxA(x-.22,SY+.45,zr+.85,x+.22,SY+.5,zr+1.25,M.leather); boxA(x-.22,SY+.5,zr+1.22,x+.22,SY+1.0,zr+1.27,M.leather); for(const q of [-.2,.2])for(const r of [.87,1.23])rod([x+q,SY,zr+r],[x+q,SY+.45,zr+r],.015,M.chrome); }
      for(const x of [xa+1.2,xb-1.2]){ rod([x,SY+.84,zr+.2],[x,SY+1.15,zr+.2],.015,M.mahog); sph(.11,M.ivory,x,SY+1.27,zr+.2,{seg:12}); sph(.12,K.col(s<0?'#2a1a10':'#c8a060'),x,SY+1.32,zr+.18,{seg:12,phi:PI*.6}); }
      K.S=S; S(xa,zr,xb,zr+.65);
      // the rail of costumes along the room's side wall
      const rx=s<0?xa+.5:xb-.5; rod([rx,SY+1.9,zr+1.5],[rx,SY+1.9,zc1-.6],.018,M.chrome); for(const z of [zr+1.5,zc1-.6])rod([rx,SY,z],[rx,SY+1.9,z],.02,M.chrome);
      for(let z=zr+1.8;z<zc1-.8;z+=.35){ const m=K.col(s<0?['#6a2a8a','#e8e0d0','#3a6a9a','#a8302a'][Math.floor(z*3)&3]:['#7a6a4a','#5a4a3a','#8a7a5a','#6a5a4a'][Math.floor(z*3)&3]);
        const r=new THREE.Mesh(new THREE.LatheGeometry([[0,0],[.2,0],[.17,.5],[.13,1.0],[.11,1.12],[0,1.12]].map(p=>new THREE.Vector2(p[0],p[1])),10),m); r.position.set(rx,SY+.74,z); r.scale.set(1,1,.5); r.rotation.y=PI/2; r.castShadow=true; K.G.add(r); tor(.03,.004,M.chrome,rx,SY+1.93,z,{ry:PI/2,arc:PI,seg:8}); }
      S(rx-.3,zr+1.4,rx+.3,zc1-.5);
      // the sink and its brass taps; a couch in the first, the property hamper in the second with the ass's head on it
      { const x=s<0?xa+.6:xb-.6, z=zc1-1.2; boxA(x-.3,SY,z-.25,x+.3,SY+.85,z+.25,M.white); K.lathe([[0,0],[.22,.02],[.25,.15],[0,.15]],M.white,x,SY+.72,z,{seg:16}); for(const q of [-.08,.08])tube([[x+q,SY+.85,z-.2],[x+q,SY+1.05,z-.2],[x+q,SY+1.05,z-.08]],.012,M.brass,{n:8}); S(x-.35,z-.3,x+.35,z+.3); }
      if(s<0){ const x=-4.5, z=zr+2.6; boxA(x-1,SY,z-.4,x+1,SY+.45,z+.4,M.velvet); boxA(x-1,SY+.45,z+.25,x+1,SY+.95,z+.4,M.velvet); for(const q of [-1,1])boxA(x+q*1-.08,SY+.45,z-.4,x+q*1+.08,SY+.7,z+.4,M.velvet); S(x-1.05,z-.45,x+1.05,z+.45); }
      else{ const x=4.5, z=zr+2.4; boxA(x-.6,SY,z-.4,x+.6,SY+.6,z+.4,K.col('#5a3a1e')); for(const y of [SY+.1,SY+.5])boxA(x-.62,y,z-.42,x+.62,y+.04,z+.42,M.brass);
        const ass=new THREE.Group(); ass.position.set(x,SY+.6,z); K.G.add(ass); const grey=K.col('#7a7470');
        const hd=new THREE.Mesh(new THREE.SphereGeometry(.2,14,10),grey); hd.scale.set(.85,1,1.3); hd.position.set(0,.22,0); ass.add(hd); const mz=new THREE.Mesh(new THREE.SphereGeometry(.13,12,8),K.col('#a8a098')); mz.position.set(0,.14,.24); ass.add(mz);
        for(const e of [-1,1]){ const ear=new THREE.Mesh(new THREE.ConeGeometry(.06,.36,8),grey); ear.position.set(e*.1,.5,-.05); ear.rotation.z=-e*.3; ass.add(ear); const ey=new THREE.Mesh(new THREE.SphereGeometry(.025,6,4),M.matte); ey.position.set(e*.11,.3,.18); ass.add(ey); }
        S(x-.65,z-.45,x+.65,z+.45); } } }
  return K; };
export {PHS};
