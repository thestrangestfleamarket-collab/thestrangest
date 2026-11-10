// THE HOVERBOARDS: the six decks (each its own design, painted pixel by pixel; its feel on the item model) and riding one: it hovers a hand's width up, keeps its speed, carves (from the archived Boardwright, 7 Nov 2026: the Skate Shop sells them)
import {THREE} from './003-shx.js';
import {FORAGE, INSPECT, ITEMS, RIDE} from './003b-systems.js';
import {TILE} from './006-map-pre.js';
import {MERCH} from './111e-merch.js';
const BOARDS={designs:{}}; window.BOARDS=BOARDS;
{ const T=TILE, {hash3}=MERCH.K;
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
  if(INSPECT&&INSPECT.kinds)INSPECT.kinds.push({is:id=>!!D[id],make:id=>{ const g=BOARDS.mesh(id); g.scale.setScalar(1); g.traverse(c=>{ c.userData.ownMat=true; }); return g; }});

  // riding one: it hovers a hand's width up, keeps its speed, carves; you stand sideways on it
  const POSE={k:'skate',push:-1,brake:false,goofy:false,z:0};
  RIDE.kind('ride',{name:'HOVERBOARD',cat:'boards',hint:'E DROPS IT AND YOU STEP ON. WASD RIDES, SPACE HOPS, E STEPS OFF.',onSay:'YOU DROP THE BOARD; IT HANGS IN THE AIR. YOU STEP ON.',held:.55,
    make:id=>BOARDS.mesh(id), lift:.32, acc:2.4, turn:2.8, drag:.35, knock:6, hop:3.2,
    pose:R=>{ POSE.brake=R.v<.2*T; return POSE; },
    place:(m,R,t)=>{ m.rotation.z=Math.max(-.35,Math.min(.35,-R.lean*.35)); m.rotation.x=R.vz?-Math.max(-.3,Math.min(.3,R.vz/T*.06)):0; const g=m.userData.glow; if(g)g.material.opacity=.35+.15*Math.sin(t*5)+Math.min(.3,R.v/T*.03); },
    off:(id,fall)=>{} });
}
