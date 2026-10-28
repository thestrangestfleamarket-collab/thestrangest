// THE BOARDWRIGHT: the masked merchant who grows hoverboards from a living wood that still remembers a lighter world; his body (the ivory carved mask, the open-knit zip-up, the silver gauntlet, the teal deck he holds), the six boards (each its own design, size and speed), riding them (RIDE's ride), and his shop on West St with the boards hung on its walls.
import {THREE} from './003-shx.js';
import {FORAGE, INSPECT, ITEMS, NPCS, RIDE, SHOPS, UI} from './003b-systems.js';
import {scene} from './004-main.js';
import {TILE} from './006-map-pre.js';
import {MSHOP} from './059i-mshops.js';
import {MERCH} from './111e-merch.js';
const BOARDS={designs:{}}; window.BOARDS=BOARDS;
{ const T=TILE, K=MERCH.K, {mk,grp,BOX,SPH,LATHE,drape,paint,hash3}=K;
  /* ---------- the boards: each one's look (its deck painted pixel by pixel) and its feel lives on the item model (speed m/s, len m, value) ---------- */
  const D=BOARDS.designs={
    board_pine:{name:'THE PINE GRAIN',base:'#c9a874',grain:'#a98654',rail:'#8a6a44',glow:0xffd9a0,art:'grain'},
    board_moss:{name:'THE MOSS CRUISER',base:'#4f6a3a',grain:'#3e5630',rail:'#2c3a22',glow:0xa8ff9a,art:'leaves',ink:'#c8d8a0'},
    board_ember:{name:'THE EMBER',base:'#3a1612',grain:'#2a0e0c',rail:'#1a0a08',glow:0xff7a3a,art:'flames',ink:'#ff8a3a',ink2:'#ffd25a'},
    board_moth:{name:'THE MOTH WING',base:'#4a3a6a',grain:'#3a2c56',rail:'#241a36',glow:0xd0a8ff,art:'moth',ink:'#e8d8b0',ink2:'#a888d8'},
    board_bone:{name:'THE BONE KNOT',base:'#e2dccb',grain:'#cfc6b0',rail:'#a89c84',glow:0xfff2d8,art:'knot',ink:'#9a8e74'},
    board_teal:{name:'THE TEAL QUEEN',base:'#1f5a58',grain:'#184846',rail:'#d8c8a0',glow:0x7affea,art:'queen',ink:'#e2d2a8',ink2:'#b89a60'}};
  FORAGE.add({names:Object.fromEntries(Object.entries(D).map(([id,d])=>[id,d.name]))});
  const art=(g,d,w,h)=>{ const px=(x,y,c)=>{ g.fillStyle=c; g.fillRect(x,y,1,1); }, mirror=(x,y,c)=>{ px(x,y,c); px(w-1-x,y,c); };
    g.fillStyle=d.base; g.fillRect(0,0,w,h); for(let y=0;y<h;y++)for(let x=0;x<w;x++){ const n=Math.sin(x*.9+Math.sin(y*.13)*3+y*.05)*.5+.5; if(n>.82||hash3(x,y,3)>.93)px(x,y,d.grain); }
    if(d.art==='leaves')for(let k=0;k<14;k++){ const cy=6+k*8, s=k%2?1:-1; for(let i=0;i<6;i++){ mirror(w/2-1-i*s*0+i,cy-i*.6|0,d.ink); mirror(w/2+i,cy+i*.3|0,d.grain); } }
    if(d.art==='flames')for(let x=0;x<w;x++){ const t=18+Math.sin(x*1.7)*6+Math.sin(x*.6)*4; for(let y=0;y<t;y++){ px(x,h-1-y,y>t-5?d.ink2:d.ink); px(x,y,y>t-5?d.ink2:d.ink); } }
    if(d.art==='moth'){ const cy=h/2; for(let y=-40;y<40;y++)for(let x=0;x<w/2;x++){ const r=Math.hypot(x/(w/2),y/40); if(r<1&&Math.abs(Math.sin(r*9+Math.atan2(y,x)*2))<.25)mirror(w/2-1-x,cy+y|0,d.ink); if(Math.hypot(x-w/4+2,Math.abs(y)-18)<3)mirror(w/2-1-x,cy+y|0,d.ink2); } for(let y=-34;y<34;y++)mirror(w/2-1,cy+y|0,d.ink); }
    if(d.art==='knot')for(let y=0;y<h;y++)for(let x=0;x<w;x++){ const u=x/w*6.3, v=y/h*30; const q=Math.sin(u*2+Math.sin(v*.9)*1.6)*Math.cos(v*.8+Math.sin(u*1.5)); if(Math.abs(q)<.16)px(x,y,d.ink); }
    if(d.art==='queen'){ const cy=h/2; g.fillStyle=d.ink2; g.fillRect(1,1,w-2,1); g.fillRect(1,h-2,w-2,1);
      for(let k=-2;k<=2;k++){ const yy=cy+k*24; for(let i=0;i<w/2-2;i++){ mirror(i+1,yy-i|0,d.ink); mirror(i+1,yy+i|0,d.ink); } }
      for(let y=-22;y<22;y++)for(let x=0;x<w/2;x++){ const r=Math.hypot(x*1.6,y); if(r<20&&Math.abs(Math.sin(r*.8+x*.4))<.3)mirror(w/2-1-x,cy+y|0,d.ink); }
      for(let y=-6;y<6;y++)for(let x=0;x<3;x++)mirror(w/2-1-x,cy+y|0,d.ink2); for(const s of [-1,1])for(let i=0;i<10;i++){ mirror(w/2-2-i,cy+s*(34+i)|0,d.ink); mirror(w/2-2-(i>>1),cy+s*(40+i)|0,d.ink2); } } };
  const TEX=new Map(), tex=id=>{ let t=TEX.get(id); if(t)return t; const d=D[id]||D.board_pine, c=document.createElement('canvas'); c.width=24; c.height=96; const g=c.getContext('2d'); art(g,d,24,96);
    t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; TEX.set(id,t); return t; };
  // a deck in metres, nose toward +z, its top at y=0: a popsicle outline, kicked up at both ends, with two hover cores and the glow under it
  BOARDS.mesh=id=>{ const d=D[id]||D.board_pine, L=+ITEMS.prop(id,'len')||.8, W=Math.min(.24,.18+L*.05), r=W/2, s=new THREE.Shape();
    s.moveTo(-r,-L/2+r); s.lineTo(-r,L/2-r); s.absarc(0,L/2-r,r,Math.PI,0,true); s.lineTo(r,-L/2+r); s.absarc(0,-L/2+r,r,0,Math.PI,true);
    const geo=new THREE.ExtrudeGeometry(s,{depth:.02,bevelEnabled:true,bevelThickness:.004,bevelSize:.004,bevelSegments:1,curveSegments:8}); geo.rotateX(Math.PI/2); geo.translate(0,.002,0);
    const p=geo.attributes.position; for(let i=0;i<p.count;i++){ const z=p.getZ(i), e=Math.max(0,(Math.abs(z)-(L/2-.15))/.15); p.setY(i,p.getY(i)+.055*e*e); } geo.computeVertexNormals();
    const uv=geo.attributes.uv; for(let i=0;i<uv.count;i++)uv.setXY(i,(p.getX(i)+r)/W,(p.getZ(i)+L/2)/L);
    const t=tex(id), top=new THREE.MeshLambertMaterial({map:t}), rail=new THREE.MeshLambertMaterial({color:d.rail}), deck=new THREE.Mesh(geo,[top,rail]), G=new THREE.Group(); G.add(deck);
    const core=new THREE.MeshBasicMaterial({color:d.glow}); for(const z of [-.3,.3]){ const c=new THREE.Mesh(new THREE.CylinderGeometry(.045,.05,.022,10),core); c.position.set(0,-.03,z*L); G.add(c); }
    const gc=document.createElement('canvas'); gc.width=gc.height=32; const gg=gc.getContext('2d'), rg=gg.createRadialGradient(16,16,1,16,16,16); rg.addColorStop(0,'rgba(255,255,255,.9)'); rg.addColorStop(1,'rgba(255,255,255,0)'); gg.fillStyle=rg; gg.fillRect(0,0,32,32);
    const glow=new THREE.Mesh(new THREE.PlaneGeometry(W*2.4,L*1.25),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(gc),color:d.glow,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false})); glow.rotation.x=-Math.PI/2; glow.position.y=-.05; G.add(glow); G.userData.glow=glow;
    G.scale.setScalar(T); return G; };
  if(window.INSPECT&&INSPECT.kinds)INSPECT.kinds.push({is:id=>!!D[id],make:id=>{ const g=BOARDS.mesh(id); g.scale.setScalar(1); g.traverse(c=>{ c.userData.ownMat=true; }); return g; }});

  // riding one: it hovers a hand's width up, keeps its speed, carves; you stand sideways on it
  const POSE={k:'skate',push:-1,brake:false,goofy:false,z:0};
  RIDE.kind('ride',{name:'HOVERBOARD',hint:'A CLICK DROPS IT AND YOU STEP ON. WASD RIDES, SPACE HOPS, A CLICK STEPS OFF.',onSay:'YOU DROP THE BOARD; IT HANGS IN THE AIR. YOU STEP ON.',held:.55,
    make:id=>BOARDS.mesh(id), lift:.32, acc:2.4, turn:2.8, drag:.35, knock:6, hop:3.2,
    pose:R=>{ POSE.brake=R.v<.2*T; return POSE; },
    place:(m,R,t)=>{ m.rotation.z=Math.max(-.35,Math.min(.35,-R.lean*.35)); m.rotation.x=R.vz?-Math.max(-.3,Math.min(.3,R.vz/T*.06)):0; const g=m.userData.glow; if(g)g.material.opacity=.35+.15*Math.sin(t*5)+Math.min(.3,R.v/T*.03); },
    off:(id,fall)=>{} });

  /* ---------- the Boardwright himself ---------- */
  const IV='ivory:#d8d0bd', KNIT='knit:#d6d2c6', SILVER='metal:#c4c2bc', SILVERD='metal:#7a7874', SKIN='skin:#e8cfbf', RING='metal:#2e2a28', TROU='cloth:#b9b5aa', BOOT='leather:#3a2c24';
  // a smooth part: more segments, soft folds instead of facets
  const LA=(pts,seg=28,fz=1)=>LATHE(pts,seg,fz), TUBE=(rt,rb,h,s=24)=>new THREE.CylinderGeometry(rt,rb,h,s,8,true);
  const model=()=>{ const sk=MERCH.skel({hipY:.9,neck:.5,shX:.235,shY:.42,upper:.29,fore:.26,thigh:.41,shin:.4}), {B}=sk;
    // the torso: an oversized open-knit zip-up hanging to the thigh in soft folds, the collar rolled high to the chin, a silver zip
    mk(B.torso,drape(LA([[.2,-.32],[.24,-.22],[.255,-.06],[.258,.1],[.262,.24],[.258,.34],[.235,.42],[.18,.48],[.1,.52]],32,.8),.012),KNIT);
    mk(B.torso,drape(new THREE.TorusGeometry(.088,.045,14,28),.006),KNIT,[0,.525,0],[Math.PI/2-.1,0,0],[1.12,1,1.12]); mk(B.torso,TUBE(.075,.09,.09),KNIT,[0,.57,0]);
    mk(B.torso,BOX(.01,.62,.008),SILVER,[0,.2,.205],[-.06,0,0]); mk(B.torso,new THREE.CapsuleGeometry(.008,.02,4,8),SILVER,[0,.5,.12]);
    mk(B.hips,TUBE(.2,.18,.18),TROU,[0,-.08,0],[0,0,0],[1,1,.8]);
    // the mask: a smooth ivory shell, carved in raised knots over the crown and brow, black almond eyes, a pointed nose ridge, a grille of drilled dots over the mouth
    const H=grp(B.head,[0,.19,.015]); H.scale.setScalar(1.38);
    const sg=new THREE.SphereGeometry(.118,64,48), sp=sg.attributes.position;
    const knot=(th,ph)=>Math.sin(th*4+Math.sin(ph*5)*1.7)*Math.cos(ph*7+Math.sin(th*3)*1.4);
    for(let i=0;i<sp.count;i++){ let x=sp.getX(i), y=sp.getY(i), z=sp.getZ(i); const u=y/.118; if(u<0){ const k=1-.32*u*u; x*=k; z*=1-.12*u*u; } y*=u>0?1.12:1.05; if(z>0&&u<.2&&u>-.6)z+=.01*(1-Math.min(1,Math.abs(x)/.1));
      const th=Math.atan2(x,z), ph=Math.acos(Math.max(-1,Math.min(1,u))); if(ph<1.5||z<0){ const q=Math.abs(knot(th,ph)), rl=Math.max(0,1-q/.2); const k=1+.03*rl*rl*(3-2*rl); x*=k; y*=k; z*=k; } sp.setXYZ(i,x,y,z); }
    mk(H,paint(sg,(x,y,z)=>{ const u=Math.max(-1,Math.min(1,y/.13)), th=Math.atan2(x,z), ph=Math.acos(u); if(ph<1.5||z<0){ const a=Math.abs(knot(th,ph)); return a<.1?'#dcd4c3':a<.22?'#c2b9a6':'#d2cab8'; } return '#d4ccba'; }),'ivory:vc');
    for(const s of [1,-1]){ mk(H,SPH(.034,24,16),'plain:#040404',[.046*s,.004,.103],[0,-.25*s,.42*s],[1.45,.7,.45]); mk(H,SPH(.02,16,12),IV,[.118*s,-.005,0],[0,0,0],[.45,1,.8]); }
    mk(H,new THREE.ConeGeometry(.013,.05,12),IV,[0,-.03,.128],[1.45,0,0],[1,1,.7]);
    for(let r=0;r<4;r++)for(let c=-4;c<=4;c++){ const y=-.062-r*.015, x=c*.012*(1-r*.08); if(Math.abs(c)>4-r*.5)continue; const zz=Math.sqrt(Math.max(0,.0128-x*x))*1.02+.002; mk(H,SPH(.0038,8,6),'plain:#3e372f',[x,y,zz],[0,0,0],[1,1,.4]); }
    // the arms: big knit sleeves gathered at the wrist; his right hand in an antique silver gauntlet, the left bare with dark rings
    for(const s of [1,-1]){ const n=s>0?'L':'R';
      mk(B['upperArm'+n],drape(TUBE(.092,.084,.32),.008),KNIT,[0,-.14,0]); mk(B['upperArm'+n],SPH(.1,24,16),KNIT,[.01*s,-.01,0]);
      mk(B['forearm'+n],drape(TUBE(.082,.09,.24),.008),KNIT,[0,-.11,0]); mk(B['forearm'+n],new THREE.TorusGeometry(.07,.032,12,24),KNIT,[0,-.235,0],[Math.PI/2,0,0]);
      const h=grp(B['hand'+n],[0,0,0]); h.rotation.y=-s*Math.PI/2;
      const palm=(c)=>{ mk(h,new THREE.CapsuleGeometry(.036,.045,6,12),c,[0,-.05,0],[0,0,0],[1.15,1,.55]); };
      const fingers=(c,ring)=>{ for(let i=0;i<4;i++){ const f=grp(h,[-.03+i*.02,-.095,.004],[-.35,0,0]); mk(f,new THREE.CapsuleGeometry(.0085,.035,4,8),c,[0,-.022,0]); const f2=grp(f,[0,-.045,0],[-.45,0,0]); mk(f2,new THREE.CapsuleGeometry(.008,.022,4,8),c,[0,-.016,0]); if(ring&&i%2===0)mk(f,new THREE.TorusGeometry(.0105,.003,8,16),RING,[0,-.015,0],[Math.PI/2,0,0]); }
        const t=grp(h,[.045,-.045,.015],[-.4,0,.6]); mk(t,new THREE.CapsuleGeometry(.009,.03,4,8),c,[0,-.02,0]); };
      if(s<0){ palm(SKIN); fingers(SKIN,false); mk(h,new THREE.CapsuleGeometry(.04,.05,6,14),SILVER,[0,-.045,.006],[0,0,0],[1.2,1,.62]); mk(h,TUBE(.06,.054,.1,24),SILVER,[0,.04,0]);
        mk(h,SPH(.026,20,14),SILVERD,[0,-.04,.03],[0,0,0],[1,1,.55]); for(let k=0;k<6;k++)mk(h,SPH(.006,8,6),SILVERD,[Math.cos(k*1.05)*.046,.04+Math.sin(k*1.05)*.022,.05]);
        for(const k of [-1,1])mk(h,new THREE.TorusGeometry(.016,.0035,8,20,4.2),SILVER,[.026*k,-.065,.028],[0,0,k]); for(let i=0;i<4;i++)mk(h,BOX(.019,.03,.02),SILVER,[-.03+i*.02,-.09,.008]); }
      else { palm(SKIN); fingers(SKIN,true); } }
    for(const s of [1,-1]){ const n=s>0?'L':'R';
      mk(B['thigh'+n],drape(TUBE(.098,.084,.43),.006),TROU,[0,-.2,0]); mk(B['shin'+n],drape(TUBE(.082,.072,.42),.006),TROU,[0,-.2,0]);
      mk(B['shoe'+n],new THREE.CapsuleGeometry(.05,.15,6,14),BOOT,[0,-.075,.05],[Math.PI/2,0,0],[1,1,.85]); mk(B['shoe'+n],BOX(.1,.02,.26),'leather:#1c1612',[0,-.118,.05]); }
    return sk; };
  // he stands at his counter turning the teal deck in his hands; now and then he taps it and it lifts on its own
  const DECK={m:null}, V=new THREE.Vector3(), V2=new THREE.Vector3();
  MERCH.add({key:'boardwright',label:'THE BOARDWRIGHT',height:1.86,model,size:10,hd:-Math.PI/2,inside:true,
    idle:t=>{ const b=Math.sin(t*.7)*3, tap=(t%9)<1.2; return MERCH.pose({nod:-6+Math.sin(t*.4)*3,L:{ua:[30+b,20],fa:[62,0]},R:{ua:[60-b,-34],fa:[96+(tap?Math.sin((t%9)*12)*10:0),-18]}}); },
    after:(B,N)=>{ const J=B.J; if(!J||!J.palmL)return; if(!DECK.m){ DECK.m=BOARDS.mesh('board_teal'); DECK.m.userData.anyRoom=true; scene.add(DECK.m); }
      const m=DECK.m, t=performance.now()/1000, up=(t%9)<1.6?Math.sin(Math.min(1,(t%9)/1.6)*Math.PI)*.07*T:0; N.g.updateMatrixWorld(); V.set(J.palmL.x,J.palmL.y,J.palmL.z); N.g.localToWorld(V);
      m.visible=N.g.visible; m.position.copy(V).add(V2.set(Math.sin(N.st.hd+Math.PI/2)*.1*T,up+.32*T,Math.cos(N.st.hd+Math.PI/2)*.1*T)); m.rotation.set(-Math.PI/2+.12,N.st.hd+Math.PI+.5,0,'YXZ'); }});

  /* ---------- his shop, inside: boards on the walls, the carving bench, the drying rack straining on its chains ---------- */
  MSHOP.kit.boards=A=>{ '@later'; const {R,X,Z,hs,sh}=A, Y=h=>A.Y(h*24), cx=A.cx, EX=Math.sign(X(R.x1)-X(R.x0)), IN=Math.sign(Z(R.y1)-Z(R.y0));
    const lam=(c,o={})=>new THREE.MeshLambertMaterial({color:c,...o}), M=(geo,m,x,h,y,ry=0,rx=0,rz=0)=>{ const o=new THREE.Mesh(geo,m); o.position.set(X(x),Y(h),Z(y)); o.rotation.set(rx,ry,rz,'YXZ'); o.castShadow=o.receiveShadow=true; A.add(o); return o; };
    const wood=lam(0x5a3e28), dark=lam(0x3a281a), iron=lam(0x3a3a3c);
    // the floor: old concrete, stained; pale shavings swept round the bench and into the corners; the walls brick over a dark plank wainscot
    const bx0=R.x0+.8, bx1=R.x0+4.4, by=R.y1-.65;
    A.floor((x,y)=>{ const u=x-R.x0, v=y-R.y0, f=.86+.14*hs(Math.floor(x*6),Math.floor(y*6),3)-((Math.abs((u%2.2)-1.1)<.03||Math.abs((v%2.2)-1.1)<.03)?.15:0), e=Math.min(u,R.x1-x,v,R.y1-y);
      const nb=Math.hypot(Math.max(0,bx0-x,x-bx1),Math.max(0,by-.9-y)); if((e<.4&&hs(Math.floor(x*4),Math.floor(y*4),2)>.75||nb<1)&&hs(Math.floor(x*16),Math.floor(y*16),9)>.78+nb*.2)return sh([170,148,112],.8+.15*hs(Math.floor(x*24),Math.floor(y*24),4));
      if(hs(Math.floor(x*2),Math.floor(y*2),7)>.9)return sh([70,62,56],f); return sh([104,96,88],f); });
    const wall=(u,z)=>{ if(z<26)return sh([70,48,32],(.85+.15*hs(Math.floor(u*8),3,5))*((u*24|0)%14===0?.7:1)); if(z<29)return sh([110,84,60],1); const k=Math.floor(z/6), p=Math.floor(u*24/8+(k&1)*.5);
      if(z%6<1||((u*24+(k&1)*4)%8)<1)return sh([126,118,106],.85); return sh([156,100,78],.82+.25*hs(p,k,13)-(z>A.WH-20?.12:0)); };
    for(const s of ['b','w','e','f'])A.wall(s,wall);
    // the east wall: a pegboard and the six boards hung nose up, each its own design, a hand-lettered tag under each; double-click one to buy
    const ids=Object.keys(D), wx=R.x1-.06, y0=R.y0+1.2, y1=R.y1-1.6;
    M(new THREE.BoxGeometry(.04*T,1.9*T,(y1-y0+1.2)*T),lam(0x7a6040),wx,1.9,(y0+y1)/2);
    M(new THREE.BoxGeometry(.06*T,.05*T,(y1-y0)*T),new THREE.MeshBasicMaterial({color:0xe8f0ff}),wx-.15,3.05,(y0+y1)/2);
    ids.forEach((id,i)=>{ const b=BOARDS.mesh(id), y=y0+i*(y1-y0)/(ids.length-1), L=+ITEMS.prop(id,'len')||.8; b.position.set(X(wx-.14),Y(1.85+(L-.8)*.3),Z(y)); b.rotation.set(-Math.PI/2,EX>0?-Math.PI/2:Math.PI/2,0,'YXZ'); A.add(b);
      M(new THREE.CylinderGeometry(.012*T,.012*T,.14*T,5),iron,wx-.07,1.85+L*.62,y,0,0,Math.PI/2);
      const tag=A.tex(32,12,g=>{ g.fillStyle='#e8dcc0'; g.fillRect(0,0,32,12); g.fillStyle='#3a2a1a'; g.font='bold 8px monospace'; g.fillText('$'+(+ITEMS.prop(id,'value')||0),3,9); });
      const tg=new THREE.Mesh(new THREE.PlaneGeometry(.34*T,.13*T),new THREE.MeshLambertMaterial({map:tag})); tg.position.set(X(wx-.03),Y(.95),Z(y)); tg.rotation.y=EX>0?-Math.PI/2:Math.PI/2; A.add(tg);
      const hb=new THREE.Mesh(new THREE.BoxGeometry(.5*T,1.4*T,.5*T),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(X(wx-.3),Y(1.8),Z(y)); A.add(hb);
      UI.thing({name:D[id].name+' · $'+(+ITEMS.prop(id,'value')||0)+' · '+(+ITEMS.prop(id,'speed')||0)+' M/S',obj:hb,reach:2.6*T,near:3.4*T,tall:2.4*T,act:()=>{ const N=NPCS.extra.find(q=>q.key==='boardwright'); if(N&&SHOPS.open)SHOPS.open(N); }}); });
    // his counter in front of the boards: an old door laid on two crates; a cash tin, a can of grain oil, a ledger
    const kx=R.x1-2.5, ky=R.y0+3.4;
    M(new THREE.BoxGeometry(.9*T,.08*T,3.4*T),wood,kx,1,ky); for(const s of [-1,1])M(new THREE.BoxGeometry(.8*T,1*T,.8*T),dark,kx,.5,ky+s*1.2);
    M(new THREE.BoxGeometry(.2*T,.12*T,.3*T),lam(0x4a5a4a),kx,1.1,ky+.9); M(new THREE.CylinderGeometry(.07*T,.07*T,.2*T,8),lam(0xa08848),kx+.1,1.14,ky-1.1); M(new THREE.BoxGeometry(.3*T,.04*T,.4*T),lam(0x6a2a20),kx-.1,1.06,ky-.3,.3);
    A.sol(kx-.45,ky-1.7,kx+.45,ky+1.7);
    // the carving bench under the front window: scarred hardwood, a vise holding a half-carved deck, gouges in a canvas roll, curls of shavings, a cracked mug of brushes; a caged work lamp over it
    const bc=(bx0+bx1)/2;
    M(new THREE.BoxGeometry((bx1-bx0)*T,.1*T,1*T),lam(0x4a3220),bc,.95,by); for(const s of [-1,1])for(const q of [-1,1])M(new THREE.BoxGeometry(.1*T,.95*T,.1*T),dark,bc+s*((bx1-bx0)/2-.1),.47,by+q*.4);
    M(new THREE.BoxGeometry(.3*T,.25*T,.2*T),lam(0x5a5c60),bx0+.5,1.12,by-.3); const half=BOARDS.mesh('board_bone'); half.position.set(X(bx0+1.1),Y(1.04),Z(by)); half.rotation.set(0,Math.PI/2,.1); A.add(half);
    M(new THREE.BoxGeometry(.6*T,.02*T,.3*T),lam(0x8a7a5a),bc+.8,1.01,by); for(let i=0;i<6;i++)M(new THREE.BoxGeometry(.2*T,.02*T,.025*T),lam(0x9a9a9a),bc+.8,1.03,by-.12+i*.05,.1*i);
    for(let i=0;i<34;i++){ const a=hs(i,2,3)*6.28, r=hs(i,3,4); M(new THREE.TorusGeometry(.04*T,.012*T,3,6,4),lam(0xdcc49a),bx0+.2+r*(bx1-bx0-.4),i%3?.04:1.02,by-.5-(i%3?hs(i,5,6)*.9:0),a,Math.PI/2); }
    M(new THREE.CylinderGeometry(.05*T,.045*T,.11*T,8),lam(0xc8c4b8),bx1-.35,1.08,by+.15); for(let i=0;i<4;i++)M(new THREE.CylinderGeometry(.008*T,.008*T,.22*T,4),lam(0x8a6a44),bx1-.35+(i-1.5)*.02,1.2,by+.15,0,.2*(i-1.5));
    A.sol(bx0,by-.5,bx1,by+.5);
    M(new THREE.CylinderGeometry(.12*T,.14*T,.2*T,6,1,true),lam(0x2a2a2a,{wireframe:true}),bc,2.7,by-.2); M(new THREE.SphereGeometry(.06*T,8,6),new THREE.MeshBasicMaterial({color:0xffd59a}),bc,2.68,by-.2);
    M(new THREE.CylinderGeometry(.006*T,.006*T,(A.WH/24-2.8)*T,4),lam(0x1a1a1a),bc,(A.WH/24+2.8)/2,by-.2);
    // the drying rack by the west wall: raw planks of the living wood chained down to rings in the floor, straining up against the chains
    const dx=R.x0+.7;
    for(let i=0;i<4;i++){ const y=R.y0+1.2+i*1.15, h=1.5+Math.sin(i*1.7)*.14; M(new THREE.BoxGeometry(.24*T,.04*T,1.05*T),lam(0xcfb48a),dx,h,y,0,0,.1*(i%2?1:-1));
      for(const s of [-1,1]){ M(new THREE.CylinderGeometry(.008*T,.008*T,h*T,4),lam(0x5a5a5a),dx,h/2,y+s*.42); M(new THREE.TorusGeometry(.03*T,.008*T,3,6),iron,dx,.03,y+s*.42,0,Math.PI/2); } }
    A.sol(dx-.3,R.y0+.6,dx+.3,R.y0+5.2);
    // the crate the wood came in, pried open, dark soil inside, stencilled OFF-WORLD
    const crx=R.x0+2.2, cry=R.y0+.9; M(new THREE.BoxGeometry(1.2*T,.9*T,1*T),lam(0x7a5a3a),crx,.45,cry,.15); M(new THREE.BoxGeometry(1*T,.06*T,.8*T),lam(0x2a1e16),crx,.92,cry,.15);
    const sten=A.tex(48,16,g=>{ g.fillStyle='#7a5a3a'; g.fillRect(0,0,48,16); g.fillStyle='#2a1a10'; g.font='bold 7px monospace'; g.fillText('OFF-WORLD',2,7); g.fillText('THIS SIDE UP',2,14); });
    const st2=new THREE.Mesh(new THREE.PlaneGeometry(.9*T,.3*T),new THREE.MeshLambertMaterial({map:sten})); st2.position.set(X(crx),Y(.5),Z(cry+.51)); st2.rotation.y=.15+(IN>0?0:Math.PI); A.add(st2);
    A.sol(crx-.65,cry-.55,crx+.65,cry+.55);
    A.lamp(bc,by-.4,2.6,0xffc888,8,7); A.lamp(kx-.6,ky,3.1,0xffe0b0,5,8); A.lamp(wx-.9,(y0+y1)/2,3,0xd8e4ff,7,7); A.lamp(R.x0+1.5,R.y0+2.5,2.8,0xa8b8d0,3,7); };
}
