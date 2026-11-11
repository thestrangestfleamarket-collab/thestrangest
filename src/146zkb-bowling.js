// THE BOWLING ALLEY, THE STRANGEST LANES (owner, 10 Nov 2026: "Its own bowling alley"): its inside off the map behind its Market St door (059i): four lanes where the ball and ten pins roll in Rapier, ten-pin scoring (worker/lanes.js), a scoreboard over each lane, the best games kept by the worker (/scores), BOWLING the skill; a lane is one bowler's, everyone in the alley sees the throw rolled on their own page.
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, INV, keys, MOTION, ONLINE, PB, pos, RAG, ROOMS, SFX, VIT} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {OWNED} from './005-save.js';
import {LEVEL, MODS, SECTION, SYS} from './006-map-pre.js';
import {IKIT} from './038zc-ikit.js';
import {MSHOP} from './059i-mshops.js';
__CODE__("worker/lanes.js")
const BOWL={BOWLS}; window.BOWL=BOWL;
{ let API=null; const api=()=>API||(API=MAKE());
  // lane metres: x across (0 its middle), z down the lane from the foul line, y up; a real lane's sizes
  const G={LW:.527,DIV:.762,PITCH:1.724,LY:.05,HEAD:18.288,OIL:12.2,DECK:19.156,PIT:20.05,BR:.1085,PRICE:3};
  const MAKE=()=>{ '@bowling';
    const say=(t,c)=>SAY(t,c||'#e8d8ff'), MW=IKIT.MW, N=BOWLS.N, popc=n=>{ let c=0; for(;n;n>>=1)c+=n&1; return c; };
    const SPOT=[[0,0],[-.1524,.2639],[.1524,.2639],[-.3048,.5278],[0,.5278],[.3048,.5278],[-.4572,.7917],[-.1524,.7917],[.1524,.7917],[.4572,.7917]];
    const PROF=[[0,.0254],[.03,.038],[.07,.052],[.114,.0605],[.16,.056],[.21,.04],[.234,.031],[.236,.031],[.25,.029],[.264,.029],[.266,.029],[.29,.029],[.33,.032],[.36,.026],[.381,.008]];
    const HULL=new Float32Array(PROF.flatMap(([y,r])=>Array.from({length:10},(_,k)=>[Math.cos(k/10*Math.PI*2)*r,y,Math.sin(k/10*Math.PI*2)*r]).flat()));
    const LB=[8,10,12,14,16], BCOL={8:0x3fd0ff,10:0x7cff6a,12:0xffd23a,14:0xff5a8a,16:0x8a5aff};
    let K=null, P=null, srvTop=[];   // K the built alley, P your turn on a lane
    const me=()=>ONLINE.me||'me', myName=()=>(ONLINE.myName?ONLINE.myName():'')||'YOU', srv=/^http/.test(location.protocol);
    const send=m=>{ if(ONLINE.on&&ONLINE.send)ONLINE.send({t:'bowl',...m}); };

    /* ---------- the physics: one Rapier world a throw, made when the ball goes and freed when the pins lie still; the same throw rolls the same on every page ---------- */
    const simNew=(v,stand)=>{ const R=PB.R; if(!R)return null; const [x0,ang,spd,spin,lb]=v, W=new R.World({x:0,y:-9.81,z:0}); W.timestep=1/120;
      const fix=W.createRigidBody(R.RigidBodyDesc.fixed()), cub=(hx,hy,hz,x,y,z,f=.2,e=.1)=>W.createCollider(R.ColliderDesc.cuboid(hx,hy,hz).setTranslation(x,y,z).setFriction(f).setRestitution(e),fix);
      cub(G.LW,.025,(G.OIL+.6)/2,0,G.LY-.025,(G.OIL-.6)/2,.04); cub(G.LW,.025,(G.DECK-G.OIL)/2,0,G.LY-.025,(G.DECK+G.OIL)/2,.2);   // the oiled front, the dry back end where a spinning ball hooks
      for(const s of [-1,1]){ cub((G.DIV-G.LW)/2,.025,(G.DECK+.6)/2,s*(G.LW+G.DIV)/2,-.025,(G.DECK-.6)/2,.15); cub(.05,.1,G.HEAD/2,s*(G.DIV+.05),.1,G.HEAD/2-.6,.1,.2); cub(.05,.75,(G.PIT-G.HEAD+.6)/2,s*(G.DIV+.05),.25,(G.PIT+G.HEAD-.6)/2,.3,.5); }   // gutters, cappings, kickbacks
      cub(G.DIV+.1,.05,(G.PIT-G.DECK)/2,0,-.35,(G.PIT+G.DECK)/2,.8,0); cub(G.DIV+.1,.6,.05,0,.2,G.PIT+.05,.6,0);   // the pit and its cushion
      const b=W.createRigidBody(R.RigidBodyDesc.dynamic().setTranslation(x0,G.LY+G.BR+.002,.3).setLinvel(Math.sin(ang)*spd,0,Math.cos(ang)*spd).setAngvel({x:spd/G.BR*.25,y:0,z:spin*20}).setCcdEnabled(true).setAngularDamping(.02));
      W.createCollider(R.ColliderDesc.ball(G.BR).setMass(lb*.4536).setFriction(0).setFrictionCombineRule(R.CoefficientCombineRule.Max).setRestitution(.05),b);
      const pins=SPOT.map(([px,pz],i)=>{ if(!(stand>>i&1))return null; const p=W.createRigidBody(R.RigidBodyDesc.dynamic().setTranslation(px,G.LY+.001,G.HEAD+pz).setCcdEnabled(true));
        W.createCollider(R.ColliderDesc.convexHull(HULL).setMassProperties(1.53,{x:0,y:.145,z:0},{x:.0195,y:.0019,z:.0195},{x:0,y:0,z:0,w:1}).setFriction(.3).setRestitution(.5).setRestitutionCombineRule(R.CoefficientCombineRule.Max),p); return p; });
      return {W,b,pins,stand,t:0,calm:0,done:false,hit:false,acc:0}; };
    const simStep=S=>{ S.W.step(); S.t+=1/120; const p=S.b.translation(), v=S.b.linvel(), past=p.z>G.DECK||p.y<-.1||Math.hypot(v.x,v.z)<.05;
      const moving=S.pins.some(q=>q&&!q.isSleeping()&&q.translation().z<G.DECK&&q.translation().y>-.05&&(Math.hypot(q.linvel().x,q.linvel().y,q.linvel().z)>.03||Math.hypot(q.angvel().x,q.angvel().y,q.angvel().z)>.2));
      if(!S.hit&&S.pins.some(q=>q&&Math.hypot(q.linvel().x,q.linvel().z)>.4))S.hit=true;
      if(past&&!moving){ if((S.calm+=1/120)>.5)S.done=true; } else S.calm=0; if(S.t>10)S.done=true; };
    const simOut=S=>{ let out=0; S.pins.forEach((q,i)=>{ if(!q)return; const p=q.translation(), r=q.rotation(); if(1-2*(r.x*r.x+r.z*r.z)>.8&&p.y>G.LY-.02&&Math.abs(p.x)<G.LW+.02&&p.z<G.DECK)out|=1<<i; }); return out; };
    const simFree=S=>{ try{ S.W.free(); }catch(e){} };
    BOWL.sim=(v,stand=1023)=>{ const S=simNew(v,stand); if(!S)return null; const path=[]; while(!S.done){ simStep(S); if(Math.round(S.t*120)%60===0){ const p=S.b.translation(); path.push([+p.x.toFixed(3),+p.z.toFixed(2)]); } } const out=simOut(S), r={out,down:popc(stand)-popc(out),t:+S.t.toFixed(2),path}; simFree(S); return r; };

    /* ---------- the looks shared by every lane: a pin, a ball, the lane's maple and its arrows ---------- */
    const pinGeo=(()=>{ const g=new THREE.LatheGeometry(PROF.map(([y,r])=>new THREE.Vector2(Math.max(r,.001),y)),14), p=g.attributes.position, c=[]; for(let i=0;i<p.count;i++){ const y=p.getY(i), red=y>.234&&y<.25||y>.265&&y<.282; c.push(...(red?[.85,.08,.1]:[.96,.95,.92])); } g.setAttribute('color',new THREE.Float32BufferAttribute(c,3)); return g; })();
    const pinMat=new THREE.MeshPhongMaterial({vertexColors:true,shininess:70,specular:0x555555});
    const ballGeo=new THREE.SphereGeometry(G.BR,22,16), ballTex=IKIT.tex(64,32,(g,w,h)=>{ g.fillStyle='#fff'; g.fillRect(0,0,w,h); g.fillStyle='rgba(255,255,255,.55)'; for(let i=0;i<6;i++){ g.beginPath(); g.ellipse(Math.random()*w,Math.random()*h,8,3,Math.random()*3,0,7); g.fill(); } g.fillStyle='#111'; for(const [x,y] of [[30,10],[36,10],[33,17]]){ g.beginPath(); g.arc(x,y,1.6,0,7); g.fill(); } });
    const laneTex=IKIT.tex(78,1024,(g,w,h)=>{ for(let i=0;i<39;i++){ const s=.92+.08*Math.sin(i*12.9898)*Math.sin(i*4.1); g.fillStyle=`rgb(${214*s|0},${170*s|0},${112*s|0})`; g.fillRect(i*2,0,2,h); }
      const zpx=z=>h-z/(G.DECK+.6)*h-.6/(G.DECK+.6)*h; g.fillStyle='#4a2a14'; for(const b of [5,10,15,20,25,30,35]){ const z=4.57+Math.abs(b-20)*.06, y=zpx(z), x=w-b*2; g.beginPath(); g.moveTo(x,y-14); g.lineTo(x-2,y); g.lineTo(x+2,y); g.fill(); }
      for(const b of [3,5,8,11,14,26,29,32,35,37]){ g.fillRect(w-b*2-1,zpx(2.1),2,2); } g.fillStyle='#8a5a30'; for(const [x,z] of SPOT){ g.fillRect(w/2+x/(2*G.LW)*w-1,zpx(G.HEAD+z)-1,2,2); } });
    const laneMat=new THREE.MeshPhongMaterial({map:laneTex,shininess:110,specular:0x6a6050});
    const gutGeo=(()=>{ const g=new THREE.CylinderGeometry(.118,.118,G.DECK+.6,10,1,true,Math.PI/2,Math.PI); g.rotateX(Math.PI/2); g.translate(0,.12,(G.DECK-.6)/2); return g; })(), gutMat=new THREE.MeshLambertMaterial({color:0x3a3c44,side:THREE.DoubleSide});
    const aimGeo=new THREE.PlaneGeometry(.022,8).rotateX(-Math.PI/2).translate(0,0,4.3), aimMat=new THREE.MeshBasicMaterial({color:0x6affff,transparent:true,opacity:.55,depthWrite:false});

    /* ---------- the scoreboard over a lane, and the alley's board of the best games ---------- */
    const board=L=>{ const c=L.cv, g=c.getContext('2d'), w=c.width, h=c.height, S=BOWLS.score(L.rolls), who=L.who; g.fillStyle='#0a0618'; g.fillRect(0,0,w,h); g.textBaseline='middle';
      g.font='bold 22px monospace'; g.fillStyle='#ff5ad2'; g.textAlign='left'; g.fillText('LANE '+(L.i+1),10,20); g.fillStyle=who?'#f0e8ff':'#7a6a9a'; g.fillText(who?String(who.name||'?').slice(0,14).toUpperCase():'OPEN',112,20);
      g.textAlign='right'; g.fillStyle='#5affff'; g.fillText(who?String(S.total):'$'+G.PRICE+' A GAME',w-10,20);
      for(let f=0;f<10;f++){ const x=8+f*48, bw=f<9?46:58, fr=S.frames[f]; g.strokeStyle='#6a4a9a'; g.lineWidth=2; g.strokeRect(x,42,bw,96); g.fillStyle='#2a1a44'; g.fillRect(x+1,43,bw-2,16); g.fillStyle='#b8a8d8'; g.font='bold 12px monospace'; g.textAlign='center'; g.fillText(String(f+1),x+bw/2,51);
        const m=fr?fr.m:[], cw=f<9?22:19; m.forEach((t,j)=>{ const bx=x+bw-(m.length-j)*cw; g.strokeStyle='#4a3a6a'; g.strokeRect(bx,60,cw,26); g.fillStyle=t==='X'?'#ffd23a':t==='/'?'#5affff':'#f0e8ff'; g.font='bold 18px monospace'; g.fillText(t,bx+cw/2,74); });
        if(fr&&fr.tot!=null){ g.fillStyle='#f0e8ff'; g.font='bold 22px monospace'; g.fillText(String(fr.tot),x+bw/2,112); } }
      g.textAlign='left'; g.font='bold 15px monospace'; g.fillStyle='#9a8ac0'; const nx=BOWLS.next(L.rolls); g.fillText(!who?'DOUBLE-CLICK THE LANE TO BOWL':S.done&&L.rolls.length?'GAME OVER · '+S.total:L.sim?'ROLLING…':'FRAME '+(nx.f+1)+' · BALL '+(nx.b+1),10,158);
      L.tex.needsUpdate=true; };
    const TK='bowl-top', mirror=()=>{ if(srv)return []; try{ return JSON.parse(OWNED.get(TK)||'[]')||[]; }catch(e){ return []; } };
    const ask=b=>srv?fetch('/scores',{method:'POST',headers:{'content-type':'application/json'},credentials:'same-origin',body:JSON.stringify(b)}).then(r=>r.ok?r.json():null).catch(()=>null):Promise.resolve(null);
    const top=()=>srv?srvTop:mirror(), refresh=()=>ask({cab:'BOWLING'}).then(j=>{ if(j&&j.top){ srvTop=j.top; best(); } });
    const best=()=>{ if(!K)return; const c=K.hcv, g=c.getContext('2d'), w=c.width, T=top(); g.fillStyle='#0c0820'; g.fillRect(0,0,w,c.height); g.textBaseline='middle'; g.textAlign='center'; g.font='bold 22px monospace'; g.fillStyle='#ff5ad2'; g.fillText('THE BEST GAMES',w/2,24);
      g.font='bold 18px monospace'; for(let i=0;i<10;i++){ const e=T[i], y=62+i*26; g.textAlign='left'; g.fillStyle=i?'#b8a8d8':'#ffd23a'; g.fillText((i+1+'.').padStart(3,' ')+' '+(e?e.ini:'---'),18,y); g.textAlign='right'; g.fillText(e?String(e.score):'0',w-18,y); } K.htex.needsUpdate=true; };
    const ini=()=>(myName().toUpperCase().replace(/[^A-Z0-9 ]/g,'')+'   ').slice(0,3);
    const post=score=>{ const e={ini:ini(),score,sub:SECTION&&SECTION.id||''}; if(!srv){ const l=mirror(); l.push(e); l.sort((a,b)=>b.score-a.score); l.length=Math.min(l.length,10); try{ OWNED.set(TK,JSON.stringify(l)); }catch(x){} best(); return Promise.resolve(); }
      return ask({cab:'BOWLING',put:e}).then(j=>{ if(j&&j.top){ srvTop=j.top; best(); } }); };

    /* ---------- the alley: lanes down the middle from the door's end to the pits at the back, the shoe counter, the settees, the board of the best games ---------- */
    const build=A=>{ const R=A.R, F=IKIT.frame(R), Km=IKIT.room(F,o=>A.add(o),()=>{}), {box,cyl,ball,glow,pic,use,seat,own}=Km, W=F.W, D=F.D, tm=D/(R.y1-R.y0), HT=A.WH/24*tm;
      const sol=(u0,v0,u1,v1)=>A.sol(R.x0+Math.min(u0,u1)/tm,R.y0+Math.min(v0,v1)/tm,R.x0+Math.max(u0,u1)/tm,R.y0+Math.max(v0,v1)/tm);
      const VF=.3+G.PIT, U0=(W-N*G.PITCH)/2, uOf=i=>U0+G.PITCH*(i+.5);
      K={F,VF,uOf,lanes:[],tm};
      A.floor((x,y)=>{ const u=(x-R.x0)*tm, v=(y-R.y0)*tm, a=Math.floor(u*3), b=Math.floor(v*3), h=A.hs(a,b,11), s=Math.sin(u*2.3+Math.cos(v*1.7)*2)+Math.sin(v*1.9-u*.8);
        if(h>.985)return [255,90,210]; if(h>.97)return [90,240,255]; if(Math.abs(s)<.07)return [120,60,170]; return [28,20,48]; });   // the cosmic carpet
      for(const sd of ['b','w','e','f'])A.wall(sd,(a,z)=>{ if(z<6)return [20,16,30]; if(z>38&&z<41)return Object.assign([255,80,200],{e:1}); if(z>43&&z<45)return Object.assign([80,230,255],{e:1}); if(z>A.WH-6)return [18,14,26];
        const s=Math.sin(a*1.3+z*.05)*Math.sin(z*.11); return s>.82?[60,40,96]:[34,28,52]; });
      // the lanes: the approach, the lane bed, gutters, cappings, kickbacks, the pit and its cushion, the masking unit over the pins
      box(U0-.1,VF,U0+N*G.PITCH+.1,VF+4.6,0,G.LY,0xd8b078); box(U0-.1,VF-.012,U0+N*G.PITCH+.1,VF+.012,G.LY,G.LY+.003,0x241420);
      for(let i=0;i<N;i++){ const u=uOf(i), V=z=>VF-z;
        box(u-G.LW,V(G.DECK),u+G.LW,V(0),0,G.LY-.001,0xb88a58);
        for(const s of [-1,1]){ const a=u+s*G.DIV, b=u+s*(G.DIV+.1); box(Math.min(a,b),V(G.HEAD-.6),Math.max(a,b),V(0),0,.12,0x2a2236); box(Math.min(a,b),V(G.PIT),Math.max(a,b),V(G.HEAD-.6),0,1.0,0x30263e); }
        box(u-G.DIV,V(G.PIT),u+G.DIV,V(G.DECK),0,.004,0x08060c); box(u-G.DIV-.1,V(G.PIT+.12),u+G.DIV+.1,V(G.PIT),0,1.3,0x101018);
        box(u-G.DIV-.1,V(G.PIT+.12),u+G.DIV+.1,V(G.HEAD+.35),.95,2.5,0x1c1430);
        pic(u,V(G.HEAD+.35)+.005,.95,G.PITCH,1.55,0,1,IKIT.tex(96,88,(g,w,h)=>{ g.fillStyle='#160e2a'; g.fillRect(0,0,w,h); g.strokeStyle=['#ff5ad2','#5affff','#ffd23a','#7cff6a'][i]; g.lineWidth=3; g.beginPath(); for(let k=0;k<5;k++){ g.arc(w/2,h/2-6,10+k*7,-2.6+k*.3,-.5-k*.3); } g.stroke(); g.fillStyle='#f0e8ff'; g.font='bold 22px monospace'; g.textAlign='center'; g.fillText(String(i+1),w/2,h-14); }),true);
        // what moves, in the lane's own metres: the lane's surface, the gutters, the ten pins, the ball, your aim
        const LG=new THREE.Group(), o=F.pw(u,VF); LG.matrixAutoUpdate=false; LG.matrix.set(F.eu[0]*MW,0,-F.ev[0]*MW,o[0], 0,MW,0,0, F.eu[1]*MW,0,-F.ev[1]*MW,o[1], 0,0,0,1); A.add(LG); LG.name='lane '+(i+1);
        const lane=new THREE.Mesh(new THREE.PlaneGeometry(2*G.LW,G.DECK+.6).rotateX(-Math.PI/2).translate(0,G.LY+.0005,(G.DECK-.6)/2),laneMat); lane.receiveShadow=true; LG.add(lane);
        for(const s of [-1,1]){ const gu=new THREE.Mesh(gutGeo,gutMat); gu.position.x=s*(G.LW+.118); LG.add(gu); }
        const pins=SPOT.map(()=>{ const m=new THREE.Mesh(pinGeo,pinMat); m.castShadow=true; LG.add(m); return m; });
        const bm=new THREE.Mesh(ballGeo,new THREE.MeshPhongMaterial({map:ballTex,color:BCOL[12],shininess:80,specular:0x777777})); bm.castShadow=true; bm.visible=false; LG.add(bm);
        const aim=new THREE.Mesh(aimGeo,aimMat); aim.visible=false; aim.position.y=G.LY+.003; LG.add(aim);
        const cv=document.createElement('canvas'); cv.width=496; cv.height=172; const tex=new THREE.CanvasTexture(cv); tex.colorSpace=THREE.SRGBColorSpace; tex.anisotropy=4;
        pic(u,VF+.3,2.75,G.PITCH-.06,.6,0,1,tex,true);
        const L={i,u,LG,pins,ball:bm,aim,cv,tex,who:null,rolls:[],stand:1023,sim:null,res:null,sweep:0,lb:12}; K.lanes.push(L); respot(L); board(L);
        use('LANE '+(i+1)+' (BOWL)',u,VF+2.4,1.4,1.4,()=>BOWL.take(i),1.8); }
      sol(U0-.1,0,U0+N*G.PITCH+.1,VF);   // nobody walks down the lanes
      // the ball returns between the lanes, a rack of house balls by the wall
      for(const u of [U0+G.PITCH,U0+3*G.PITCH]){ box(u-.24,VF+1.3,u+.24,VF+2.9,G.LY,.62,0x2a2236); box(u-.26,VF+1.3,u+.26,VF+1.6,.62,.95,0x3a2e52); for(let k=0;k<3;k++)ball(u,VF+1.8+k*.32,.62+G.BR,G.BR,[0x3fd0ff,0xff5a8a,0xffd23a][k]); sol(u-.26,VF+1.3,u+.26,VF+2.9); }
      { const u=.35; box(0,VF+.6,.6,VF+4.2,0,.9,0x2a2236); box(0,VF+.6,.6,VF+4.2,.9,.94,0x4a3a6a); LB.forEach((lb,k)=>ball(u,VF+1+k*.65,.94+G.BR*1.05,G.BR*1.05,BCOL[lb])); sol(0,VF+.6,.6,VF+4.2);
        use('THE HOUSE BALLS (8 TO 16 LB)',u,VF+2.4,.6,1.2,()=>say('HOUSE BALLS, 8 TO 16 LB. PICK ONE ON YOUR LANE: THE HEAVIER HITS HARDER, BUT A BALL TOO HEAVY FOR YOUR STRENGTH SWAYS.'),1.6); }
      // the settees behind the approaches
      for(let k=0;k<2;k++){ const u0=U0+.3+k*G.PITCH*2, u1=u0+G.PITCH*2-.6, v=VF+5.6; seat('A SETTEE',own(()=>{ box(u0,v,u1,v+.55,0,.42,0x5a2a8a); box(u0,v+.45,u1,v+.62,.42,.9,0x4a2276); }),[[u0+.5,v+.28,.42,0,-1],[(u0+u1)/2,v+.28,.42,0,-1],[u1-.5,v+.28,.42,0,-1]],1.4); sol(u0,v,u1,v+.62); }
      // the shoe counter by the door, cubbies of shoes behind, the keeper's spot
      { const u0=.6, u1=3.6, v=D-3.2; box(u0,v,u1,v+.6,0,1.05,0x3a2e52); box(u0-.05,v-.05,u1+.05,v+.65,1.05,1.1,0xd8c8f0); sol(u0,v,u1,v+.6);
        for(let r=0;r<4;r++)for(let c=0;c<6;c++){ const cu=u0+.1+c*.48, ch=.3+r*.42; box(cu,v-1.7,cu+.44,v-1.4,ch,ch+.36,0x241a36); box(cu+.06,v-1.65,cu+.2,v-1.45,ch+.02,ch+.12,[0xc83a3a,0x3a6ac8,0xe8e0d0][(r+c)%3]); box(cu+.22,v-1.65,cu+.36,v-1.45,ch+.02,ch+.12,[0xc83a3a,0x3a6ac8,0xe8e0d0][(r+c)%3]); }
        sol(u0,v-1.75,u1,v-1.4); pic((u0+u1)/2,v+.66,1.1,2.4,.5,0,1,IKIT.tex(160,32,(g,w,h)=>{ g.fillStyle='#160e2a'; g.fillRect(0,0,w,h); g.fillStyle='#ffd23a'; g.font='bold 16px monospace'; g.textAlign='center'; g.fillText('SHOES · $'+G.PRICE+' A GAME',w/2,22); }),true);
        use('THE SHOE COUNTER',(u0+u1)/2,v+.3,2.6,1.2,()=>say('SHOES AND A GAME ARE $'+G.PRICE+'. TAKE ANY OPEN LANE: DOUBLE-CLICK IT AT THE APPROACH.'),1.6);
        const sp=(uu,vv,du,dv,h)=>{ const p=F.pw(uu,vv); return {x:p[0],z:p[1],hd:F.hd(du,dv),...(h!=null?{y:h*MW}:{})}; }, o=ROOMS.off.bowling;
        if(o){ o.spots={'RUNS THE LANES':sp((u0+u1)/2,v-.6,0,1)}; o.seats=[0,1].flatMap(k=>{ const a=U0+.3+k*G.PITCH*2, b=a+G.PITCH*2-.6; return [sp(a+.5,VF+5.88,0,-1,.42),sp(b-.5,VF+5.88,0,-1,.42)]; }); }
        if(MODS.flea&&MODS.flea.mesh)for(let k=0;k<3;k++){ const s=MODS.flea.mesh('dstool'); if(!s)break; const p=F.pw(u0+.6+k*.9,v+1.05); s.position.set(p[0],0,p[1]); A.add(s); } }   // Polyfork's diner stools at the counter
      // the board of the best games on the west wall
      { const c=document.createElement('canvas'); c.width=256; c.height=330; K.hcv=c; K.htex=new THREE.CanvasTexture(c); K.htex.colorSpace=THREE.SRGBColorSpace; pic(W-.04,VF+7.2,1.0,1.9,2.45,-1,0,K.htex,true); best();
        use('THE BEST GAMES',W-.3,VF+7.2,.6,2,()=>{ const T=top(); say(T.length?'THE BEST GAMES: '+T.slice(0,5).map((e,i)=>(i+1)+'. '+e.ini+' '+e.score).join(', '):'NO GAMES ON THE BOARD YET. BOWL ONE.'); },1.8); }
      // the light: bright over the pins, softer down the lanes and over the settees, neon by the walls
      for(const [u,v,h,c,i,r] of [[W/2,G.PIT-G.HEAD+1.2,2.4,0xffffff,60,9],[W/2,VF-8,3.2,0xe8e0ff,40,12],[W/2,VF+1.5,3.2,0xd8c8ff,40,10],[W/2,VF+6,3.2,0xffc8f0,30,9],[2,D-2.5,3,0xffe0b0,25,7]])A.lamp(F.tu(u),F.tv(v),h/tm,c,i,r/tm);
      for(const [u0,u1] of [[0,.06],[W-.06,W]])glow(()=>box(u0,.4,u1,VF+8,HT-.4,HT-.32,u0?0x5affff:0xff5ad2));
      A.add(new THREE.HemisphereLight(0xb0a8ff,0x2a2040,.9));
      Km.flush(); refresh(); if(ONLINE.on)send({op:'ask'}); };

    /* ---------- a lane's pins, ball and turn ---------- */
    const respot=L=>{ L.pins.forEach((m,i)=>{ const on=!!(L.stand>>i&1); m.visible=on; m.position.set(SPOT[i][0],G.LY,G.HEAD+SPOT[i][1]); m.quaternion.identity(); }); };
    const show=L=>{ const S=L.sim; if(!S)return; const p=S.b.translation(), q=S.b.rotation(); L.ball.position.set(p.x,p.y,p.z); L.ball.quaternion.set(q.x,q.y,q.z,q.w); L.ball.visible=p.y>-.3;
      S.pins.forEach((b,i)=>{ if(!b)return; const m=L.pins[i], t=b.translation(), r=b.rotation(); m.position.set(t.x,t.y,t.z); m.quaternion.set(r.x,r.y,r.z,r.w); m.visible=t.y>-.3; }); };
    const go=(L,v,stand)=>{ if(L.sim){ simFree(L.sim); L.sim=null; } const S=simNew(v,stand); if(!S){ say('THE PINSETTER IS DOWN (THE PHYSICS DID NOT LOAD).','#c8a090'); return false; }
      L.sim=S; L.v=v; L.res=null; L.next=null; L.ball.material.color.setHex(BCOL[v[4]]||BCOL[12]); L.ball.visible=true; L.aim.visible=false; respot(L); show(L); SFX.play('thud',{vol:.5,pitch:.6}); board(L); return true; };
    const ended=L=>{ const S=L.sim; L.sim=null; const out=simOut(S); simFree(S); L.ball.visible=false; L.sweep=1.1; L.out=out;
      if(P&&P.ln===L.i&&L.who&&L.who.me)mine(L,out); else if(L.res)apply(L,L.res.out,L.res.rolls); else L.wait=true; };
    const apply=(L,out,rolls)=>{ L.rolls=rolls; L.res=null; L.wait=false; const nx=BOWLS.next(rolls); L.next=nx.done||nx.rack?1023:out; board(L); };
    // your own ball has stopped: its pins are counted, the frame scored, the skill tried, the next rack set
    const mine=(L,out)=>{ const n=popc(L.stand&~out); L.rolls=L.rolls.concat([n]); send({op:'res',ln:L.i,out,rolls:L.rolls}); const nx=BOWLS.next(L.rolls), f=BOWLS.closed(L.rolls);
      if(f>=0){ const mk=BOWLS.mark(L.rolls); FORAGE.use('bowl',-15,85,0,{ok:mk,win:2.5}); }
      const fresh=L.stand===1023, strike=fresh&&n===10, spare=!fresh&&!popc(out)&&n>0; say(strike?'STRIKE!':spare?'SPARE!':n?n+(n===1?' PIN.':' PINS.'):'NOTHING.',strike||spare?'#ffd23a':'#e8d8ff');
      L.next=nx.done||nx.rack?1023:out; board(L);
      if(nx.done){ const s=BOWLS.score(L.rolls).total; P.ph='over'; panel(); say('GAME OVER: '+s+'. SPACE FOR ANOTHER GAME ($'+G.PRICE+'), W OR S TO STEP OFF THE LANE.','#5affff'); if(s>0)post(s); }
      else { P.ph='wait'; panel(); } };

    /* ---------- your turn: take a lane, pick a ball, set where and which way, the spin; SPACE starts the swing, SPACE again lets go at that power; the less your skill, the more your aim sways ---------- */
    const UI_=document.createElement('div'); UI_.id='bowlp'; UI_.hidden=true;
    { const css=document.createElement('style'); css.textContent=`#bowlp{position:fixed;left:50%;bottom:calc(150px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:6;width:min(380px,calc(100vw - 32px));background:#120a24ec;border:1px solid #6a3a9a;padding:8px 10px;font:10px Silkscreen,monospace;letter-spacing:1px;color:#ece0ff;display:flex;flex-direction:column;gap:6px}
      #bowlp[hidden]{display:none} #bowlp .hd{display:flex;justify-content:space-between;gap:8px;align-items:center} #bowlp .row{display:flex;flex-wrap:wrap;gap:4px;align-items:center} #bowlp button{font:inherit;color:inherit;background:#24143e;border:1px solid #6a3a9a;padding:3px 6px;cursor:pointer} #bowlp button[aria-pressed="true"]{background:#6a3a9a;color:#fff}
      #bowlp .bar{position:relative;height:14px;background:#000a;border:1px solid #6a3a9a} #bowlp .bar i{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#5affff,#ff5ad2)} #bowlp .dim{opacity:.75}`; document.head.appendChild(css); }
    UI_.innerHTML='<div class="hd"><b id="bwn"></b><button id="bwx">LEAVE THE LANE</button></div><div class="row" id="bwb"></div><div id="bwa"></div><div class="bar"><i id="bwp"></i></div><div class="dim" id="bwt"></div>'; document.body.appendChild(UI_);
    const $=id=>UI_.querySelector('#'+id), DEG=Math.PI/180;
    const panel=()=>{ if(!P){ UI_.hidden=true; return; } UI_.hidden=false; const L=K&&K.lanes[P.ln]; if(!L)return; const nx=BOWLS.next(L.rolls), S=BOWLS.score(L.rolls);
      $('bwn').textContent='LANE '+(P.ln+1)+' · '+(nx.done?'GAME OVER · '+S.total:'FRAME '+(nx.f+1)+' BALL '+(nx.b+1)+' · '+S.total);
      $('bwb').innerHTML=LB.map(lb=>`<button data-lb="${lb}" aria-pressed="${lb===P.lb}">${lb} LB</button>`).join('');
      $('bwa').textContent='BOARD '+Math.round(20-P.x/.0271)+' · LINE '+(P.a/DEG>=0?'+':'')+(P.a/DEG).toFixed(2)+'° · SPIN '+(P.s>0?'HOOK ◀ ':P.s<0?'HOOK ▶ ':'STRAIGHT ')+Math.abs(Math.round(P.s*10))+' · BOWLING '+FORAGE.sk('bowl').toFixed(1);
      $('bwt').textContent=P.ph==='aim'?'A/D WHERE · Q/E WHICH WAY · Z/C SPIN · SPACE TO SWING':P.ph==='power'?'SPACE TO LET GO':P.ph==='over'?'SPACE FOR ANOTHER GAME ($'+G.PRICE+') · W/S STEP OFF':P.ph==='roll'?'ROLLING…':'THE PINSETTER…'; };
    UI_.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b||!P)return; if(b.id==='bwx')return BOWL.leave(); if(b.dataset.lb&&P.ph==='aim'){ P.lb=+b.dataset.lb; panel(); } });
    const sway=()=>{ const sk=FORAGE.sk('bowl'), over=Math.max(0,P.lb-(9+(FORAGE.ST?FORAGE.ST.str:30)/14)), amp=(2*(1-sk/100)+.12)*(1+over*.35), t=P.t;
      return {a:amp*DEG*(Math.sin(1.3*t)+.6*Math.sin(2.9*t+1))/1.6,x:.05*(1-sk/100)*(1+over*.35)*Math.sin(.9*t+2)}; };
    const rnd=seed=>()=>{ seed|=0; seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
    const release=()=>{ const L=K.lanes[P.ln], w=sway(), seed=Math.random()*4294967295>>>0, r=rnd(seed), g=(r()+r()+r()-1.5)*.6, amp=Math.abs(w.a)+.15*DEG;
      const v=[Math.max(-.45,Math.min(.45,P.x+w.x)),P.a+w.a+g*amp*.3,(4.8+4.4*P.p)*(1-(P.lb-12)*.012),P.s,P.lb,seed];
      BOWL.throw(v); };
    BOWL.throw=v=>{ if(!P||!K)return false; const L=K.lanes[P.ln]; if(L.sim||L.sweep>0)return false; if(!go(L,v,L.stand))return false; P.ph='roll'; send({op:'throw',ln:L.i,v,st:L.stand}); try{ MOTION.play('toss'); }catch(e){} panel(); return true; };
    const press=()=>{ if(!P)return; if(P.ph==='aim'){ P.ph='power'; P.p=0; P.pd=1; panel(); } else if(P.ph==='power')release(); else if(P.ph==='over')BOWL.again(); };
    addEventListener('keydown',e=>{ if(!P||e.ctrlKey||e.metaKey||e.altKey||/INPUT|TEXTAREA|SELECT/.test((e.target&&e.target.tagName)||''))return; const k=e.key.toLowerCase(), aim=P.ph==='aim';
      const H={' ':()=>{ if(!e.repeat)press(); },a:()=>{ if(aim)P.x=Math.min(.45,P.x+.0271); },d:()=>{ if(aim)P.x=Math.max(-.45,P.x-.0271); },q:()=>{ if(aim)P.a=Math.min(1.6*DEG,P.a+.05*DEG); },e:()=>{ if(aim)P.a=Math.max(-1.6*DEG,P.a-.05*DEG); },z:()=>{ if(aim)P.s=Math.min(1,+(P.s+.1).toFixed(1)); },c:()=>{ if(aim)P.s=Math.max(-1,+(P.s-.1).toFixed(1)); }};
      H.arrowleft=H.a; H.arrowright=H.d; const f=H[k]; if(!f)return; e.preventDefault(); e.stopImmediatePropagation(); f(); panel(); },true);
    // where you stand on your lane's approach (lane metres to the world), facing the pins
    const stand=()=>{ const L=K.lanes[P.ln], p=K.F.pw(L.u+P.x,K.VF+1.2), hd=K.F.hd(0,-1); return [p[0],p[1],hd]; };
    const pin=()=>{ window.RUNNER=MODS.runner={on:true,steer:()=>{ if(!P||!K)return [0,0,0]; const [x,z,hd]=stand(); pos.x=x; pos.z=z; SHARED.heading=hd; return [0,0,0]; }}; };
    BOWL.take=i=>{ if(!K)return; const L=K.lanes[i]; if(P&&P.ln===i)return; if(L.who&&!L.who.me)return say('LANE '+(i+1)+' IS '+String(L.who.name||'SOMEONE').toUpperCase()+'\'S. TRY ANOTHER.','#c8a090');
      if(!PB.R)return say('THE PINSETTERS ARE STILL WARMING UP. TRY AGAIN IN A MOMENT.','#c8a090');
      if(!INV.afford(G.PRICE))return say('SHOES AND A GAME ARE $'+G.PRICE+'. YOU HAVE $'+INV.money()+'.','#c8a090');
      if(P)BOWL.leave(true); INV.pay(G.PRICE); if(INV.save)INV.save(); L.who={id:me(),name:myName(),me:true}; L.rolls=[]; L.stand=1023; respot(L); send({op:'take',ln:i});
      P={ln:i,x:.12,a:0,s:.3,lb:L.lb||12,ph:'aim',p:0,pd:1,t:0}; pin(); SFX.play('clunk',{vol:.4}); say('LANE '+(i+1)+': SHOES ON, $'+G.PRICE+'. A/D WHERE, Q/E WHICH WAY, Z/C THE SPIN, THEN SPACE TO SWING AND SPACE TO LET GO.'); board(L); panel(); };
    BOWL.again=()=>{ if(!P||!K)return; const L=K.lanes[P.ln]; if(!INV.afford(G.PRICE))return say('ANOTHER GAME IS $'+G.PRICE+'. YOU HAVE $'+INV.money()+'.','#c8a090'); INV.pay(G.PRICE); if(INV.save)INV.save();
      L.rolls=[]; L.stand=1023; respot(L); send({op:'new',ln:L.i}); P.ph='aim'; board(L); panel(); say('A NEW GAME ON LANE '+(L.i+1)+'.'); };
    BOWL.leave=quiet=>{ if(!P)return; const ln=P.ln; P=null; window.RUNNER=MODS.runner=null; UI_.hidden=true; if(K){ const L=K.lanes[ln]; L.aim.visible=false; if(L.who&&L.who.me)L.who=null; board(L); } send({op:'free',ln}); if(!quiet)say('YOU STEP OFF LANE '+(ln+1)+'.'); };

    /* ---------- other players: their lanes and throws, rolled here from the same numbers; their count of the pins is the score ---------- */
    const hear=m=>{ if(!K||!m)return; const L=K.lanes[m.ln|0];
      if(m.op==='lanes'&&Array.isArray(m.lanes)){ m.lanes.slice(0,N).forEach((r,i)=>{ const Q=K.lanes[i]; if(P&&P.ln===i&&(!r||r.id!==me())){ BOWL.leave(true); say('SOMEONE GOT TO LANE '+(i+1)+' FIRST.','#c8a090'); }
          if(P&&P.ln===i)return; Q.who=r?{id:r.id,name:r.name,me:r.id===me()}:null; if(!Q.sim&&r&&Array.isArray(r.rolls)&&BOWLS.ok(r.rolls)){ Q.rolls=r.rolls; const nx=BOWLS.next(r.rolls); if(nx.rack||nx.done)Q.stand=1023; respot(Q); } if(!r){ Q.rolls=[]; Q.stand=1023; respot(Q); } board(Q); }); return; }
      if(!L||m.id===me()&&P&&P.ln===L.i)return; L.who={id:m.id,name:m.name,me:false};
      if(m.op==='throw'&&Array.isArray(m.v)){ if(L.sim){ while(!L.sim.done)simStep(L.sim); ended(L); } if(L.wait){ L.wait=false; } L.stand=m.st|0; L.sweep=0; go(L,m.v.map(Number),L.stand); }
      else if(m.op==='res'&&Array.isArray(m.rolls)&&BOWLS.ok(m.rolls)){ if(L.sim)L.res={out:m.out|0,rolls:m.rolls}; else apply(L,m.out|0,m.rolls); if(L.sweep<=0&&!L.sim){ L.stand=L.next; respot(L); } }
      else if(m.op==='new'){ L.rolls=[]; L.stand=1023; respot(L); board(L); } };

    /* ---------- each frame: your sway and swing, every rolling lane's world stepped at its fixed rate, the sweep that resets the pins ---------- */
    const step=dt=>{ if(!K)return; dt=Math.min(dt||0,.1);
      if(P){ const L=K.lanes[P.ln]; P.t+=dt; const away=ROOMS.offIn&&ROOMS.offIn()!=='bowling';
        if(away||RAG.on||VIT.out>0||VIT.dead||(P.ph!=='roll'&&['w','s','arrowup','arrowdown'].some(k=>keys.has(k))))BOWL.leave(away);
        else { if(P.ph==='power'){ P.p+=P.pd*dt*1.1; if(P.p>1){ P.p=1; P.pd=-1; } if(P.p<0){ P.p=0; P.pd=1; } } $('bwp').style.width=(P.ph==='power'?P.p*100:0)+'%';
          L.aim.visible=P.ph==='aim'||P.ph==='power'; if(L.aim.visible){ const w=sway(); L.aim.position.x=P.x+w.x; L.aim.position.z=.3; L.aim.rotation.y=P.a+w.a; } } }
      for(const L of K.lanes){ const S=L.sim; if(S){ S.acc+=dt; let n=0; const h0=S.hit; while(S.acc>=1/120&&n<40&&!S.done){ simStep(S); S.acc-=1/120; n++; } if(!h0&&S.hit)for(let k=0;k<3;k++)setTimeout(()=>SFX.play('clunk',{vol:.5,pitch:.7+Math.random()*.6,vary:.3}),k*60); show(L); if(S.done)ended(L); }
        else if(L.sweep>0&&(L.sweep-=dt)<=0){ L.stand=L.next!=null?L.next:1023; respot(L); if(P&&P.ln===L.i&&P.ph==='wait'){ P.ph='aim'; panel(); } } } };
    const drop=()=>{ if(P)BOWL.leave(true); if(K)for(const L of K.lanes)if(L.sim){ simFree(L.sim); L.sim=null; } K=null; };
    BOWL.dbg=()=>({built:!!K,inside:ROOMS.offIn&&ROOMS.offIn()==='bowling',phys:!!PB.R,me:P?{ln:P.ln,ph:P.ph,x:P.x,a:P.a,s:P.s,lb:P.lb}:null,skill:FORAGE.sk('bowl'),cash:INV.cash,top:top().slice(0,10),
      lanes:K?K.lanes.map(L=>({who:L.who&&{name:L.who.name,me:L.who.me},rolls:L.rolls.slice(),score:BOWLS.score(L.rolls).total,stand:L.stand,rolling:!!L.sim,t:L.sim?+L.sim.t.toFixed(2):0,sweep:L.sweep>0,ball:L.ball.visible?L.ball.position.toArray().map(v=>+v.toFixed(2)):null,
        out:L.out,tilted:L.pins.filter(m=>m.visible&&(m.position.y<G.LY-.02||new THREE.Vector3(0,1,0).applyQuaternion(m.quaternion).y<.8)).length,board:L.tex.version})):null});
    BOWL.K=()=>K; BOWL.P=()=>P; BOWL.post=post; BOWL.G=G;
    return {build,step,hear,drop}; };
  MSHOP.kit.bowling=A=>api().build(A);
  MSHOP.kit.bowling.drop=()=>{ if(API)API.drop(); };
  MSHOP.kit.bowling.need=()=>LOAD('bowling','later').then(()=>new Promise(res=>{ if(PB.R)return res(); (PB.onReady=PB.onReady||[]).push(res); if(PB.load)PB.load(); setTimeout(res,30000); }));   // the pins want Rapier (the physics body's own copy)
  SYS.add('life',dt=>{ if(API)API.step(dt); },'146zkb-bowling');
  BOWL.where=()=>{ const o=ROOMS.off.bowling, B=SHARED.BOD, p=(LEVEL.places||[]).find(q=>q.id==='bowling'), t=(x,z)=>[+((x-B.XS(0))/(B.XS(1)-B.XS(0))).toFixed(2),+((z-B.ZS(0))/(B.ZS(1)-B.ZS(0))).toFixed(2)];
    return {reg:!!o,lot:p&&[p.x0,p.x1,p.y1],door:o&&t(o.door[0],o.door[2]),off:!!o&&o.box.x0>B.XS(1000),keeper:(LEVEL.chars&&LEVEL.chars.longboarder||{}).job||null}; };   // (for the check)
  ONLINE.hear.bowl=m=>{ if(API)API.hear(m); };
}
