// THE CATACOMB RUN: the holodeck's off-world jungle endless runner. Pick it in the holodeck and it fades you to a jungle track far off the map; you auto-run and must JUMP logs, DUCK/ROLL under branches and DODGE rocks (arrow left/right). You run as long as you can; a hit sends you back to the holodeck. The run drives the player through the frame's RUNNER hook (075), like a vehicle.
import {SHARED, THREE} from './003-shx.js';
import {pos, ROOMS, st, UI, VR} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {STORE, TILE} from './006-map-pre.js';
import {PAD} from './075-main-13.js';
{ const H=STORE.holo, T=TILE, say=(t,c,o)=>SAY(t,c,o);
  const WX=3000, PATHW=3.4*T, LANE=[-1.05*T,0,1.05*T], SEG=3*T, AHEAD=46*T, SPD0=3.2*T, SPD1=5.6*T, RAMPD=200*T;
  const RUN=window.RUNNER={on:false}, TEACH=['jump','duck','dodge'], FREE0=18, WANT={view:'behind',face:0,turn:false};
  let D=null, W=null, savedGY=null, savedView=null, keyoff=null;
  const rnd=s=>{ const x=Math.sin(s*127.1+11.7)*43758.5453; return x-Math.floor(x); };
  const M={ path:new THREE.MeshLambertMaterial({color:0x6a5636}), dirt:new THREE.MeshLambertMaterial({color:0x33401f}),
    leaf:new THREE.MeshLambertMaterial({color:0x2d5522}), leaf2:new THREE.MeshLambertMaterial({color:0x40722f}),
    trunk:new THREE.MeshLambertMaterial({color:0x463221}), log:new THREE.MeshLambertMaterial({color:0x5a3f26}),
    rock:new THREE.MeshLambertMaterial({color:0x6b6b63}), branch:new THREE.MeshLambertMaterial({color:0x4a3a22}) };
  const canopy=new THREE.MeshLambertMaterial({color:0x24451c,transparent:true,opacity:.9,side:THREE.DoubleSide});
  const foliage=(G,x,z,out)=>{ const s=.7+rnd(x+z)*.7, big=rnd(x*z+1)>.5, add=m=>{ G.add(m); out.push(m); return m; };
    if(big){ const t=add(new THREE.Mesh(new THREE.CylinderGeometry(s*.14,s*.2,s*2.6,6),M.trunk)); t.position.set(x,s*1.3,z); t.castShadow=true;
      for(let i=0;i<3;i++){ const c=add(new THREE.Mesh(new THREE.IcosahedronGeometry(s*(1-i*.18),0),i%2?M.leaf:M.leaf2)); c.position.set(x+(rnd(x+i)-.5)*s,s*(2.1+i*.55),z); c.castShadow=true; } }
    else for(let i=0;i<2;i++){ const c=add(new THREE.Mesh(new THREE.IcosahedronGeometry(s*(.6-i*.18),0),i%2?M.leaf:M.leaf2)); c.position.set(x,s*(.5+i*.4),z); c.scale.y=.8; } };
  // one strip of track at z: ground + roadside foliage; now and then an obstacle (every mesh tracked so the cull can drop it)
  const strip=(z,i)=>{ const G=W.G, ms=[], add=m=>{ G.add(m); ms.push(m); return m; };
    const g=add(new THREE.Mesh(new THREE.PlaneGeometry(PATHW,SEG+.02),M.path)); g.rotation.x=-Math.PI/2; g.position.set(WX,0,z+SEG/2); g.receiveShadow=true;
    const dl=add(new THREE.Mesh(new THREE.PlaneGeometry(26*T,SEG+.02),M.dirt)); dl.rotation.x=-Math.PI/2; dl.position.set(WX,-.03,z+SEG/2); dl.receiveShadow=true;
    for(const sx of [-1,1])for(let k=0;k<2;k++)foliage(G,WX+sx*(PATHW/2+(.6+k*1.4+rnd(z+k+sx))*T),z+rnd(z*2+k+sx)*SEG,ms);
    if(rnd(z+9)>.6){ const c=add(new THREE.Mesh(new THREE.PlaneGeometry(PATHW+6*T,SEG),canopy)); c.rotation.x=Math.PI/2; c.position.set(WX,5.5*T+rnd(z)*T,z+SEG/2); }
    W.rows.push({z,meshes:ms});
    if(i>5&&i<FREE0&&(i-6)%4===0)addObst(z+SEG*.5,TEACH[(i-6)/4]);   // the first three teach one each: a log, a branch, a rock in your lane, far apart
    else if(i>=FREE0&&i%2===0)addObst(z+SEG*(.3+rnd(z)*.4)); };
  const addObst=(z,teach)=>{ const G=W.G, r=teach?{jump:0,duck:.5,dodge:.9}[teach]:rnd(z*3+7), lane=teach?1:Math.floor(rnd(z*5)*3), x=WX+LANE[lane], ms=[], add=m=>{ G.add(m); ms.push(m); return m; }; let kind, hb;
    if(r<.4){ kind='jump'; const lg=add(new THREE.Mesh(new THREE.CylinderGeometry(.28*T,.28*T,PATHW*.95,8),M.log)); lg.rotation.z=Math.PI/2; lg.position.set(WX,.28*T,z); lg.castShadow=true; hb={all:true}; }   // a log across the path: jump it
    else if(r<.72){ kind='duck'; const bar=add(new THREE.Mesh(new THREE.CylinderGeometry(.16*T,.16*T,PATHW*.95,6),M.branch)); bar.rotation.z=Math.PI/2; bar.position.set(WX,1.5*T,z);
      const lf=add(new THREE.Mesh(new THREE.IcosahedronGeometry(.5*T,0),M.leaf)); lf.position.set(WX+1.3*T,1.7*T,z); hb={all:true,lo:1.05*T}; }   // a branch overhead: duck or roll
    else { kind='dodge'; const rk=add(new THREE.Mesh(new THREE.DodecahedronGeometry(.55*T,0),M.rock)); rk.position.set(x,.5*T,z); rk.castShadow=true; hb={lane}; }   // a rock in one lane: dodge aside
    W.obst.push({z,kind,lane,hb,meshes:ms,hit:false,teach:!!teach}); };
  const drop=m=>{ m.removeFromParent(); if(m.geometry)m.geometry.dispose(); };
  const clearAhead=()=>{ while(W.segZ<pos.z+AHEAD){ strip(W.segZ,W.i++); W.segZ+=SEG; }
    const back=pos.z-8*T;
    W.rows=W.rows.filter(r=>{ if(r.z>back)return true; for(const m of r.meshes)drop(m); return false; });
    W.obst=W.obst.filter(o=>{ if(o.z>back)return true; for(const m of o.meshes)drop(m); return false; }); };

  RUN.steer=dt=>D&&D.go?[0,1]:[0,0];   // running forward once GO (RUN.run owns the real speed and lane); standing at the line before
  const dodge=dir=>{ if(!D||!D.ready||D.dead)return; D.lane=Math.max(0,Math.min(2,D.lane+dir)); };

  // the airborne / low tests from the rig state (st is the player's rig)
  const mvName=()=>(st&&st.move&&st.move.name)||'';
  const airborne=()=>/jump|flip|leap/i.test(mvName())||SHARED.py>.5*T;   // jump, runJump, back/frontflip all clear a log
  const low=()=>/roll|crouch|slide|duck/i.test(mvName());   // roll or crouch clears an overhead branch
  const check=(z0,z1)=>{ for(const o of W.obst){ if(o.hit||!(o.z>z0&&o.z<=z1))continue; o.hit=true;   // the frame the player crosses the obstacle's line
      let ok=true; if(o.kind==='jump')ok=airborne(); else if(o.kind==='duck')ok=low(); else if(o.kind==='dodge')ok=D.lane!==o.hb.lane; D.log.push(o.kind+(ok?'':'!'));
      if(o.teach){ if(!ok){ for(const m of o.meshes)m.visible=false; say('MISSED. '+how(o.kind),'#ffb070'); }
        if(o.kind==='dodge')say('NOW RUN AS FAR AS YOU CAN!','#7dffa4'); continue; }   // the three teaching obstacles forgive a miss
      if(!ok)return fail(); } };
  const how=k=>{ const P=VR.on||PAD.n>0, K=a=>String(UI.keyOf?UI.keyOf(a):a).toUpperCase();
    return k==='jump'?'JUMP: '+(P?'A OR STICK UP':'UP, W OR SPACE'):k==='duck'?'DUCK: '+(P?'HOLD STICK DOWN, OR LEFT TRIGGER ROLLS':'HOLD DOWN OR S, OR '+K('r')+' ROLLS'):'CHANGE LANE: '+(P?'STICK LEFT / RIGHT':'LEFT / RIGHT OR A / D'); };
  const fail=()=>{ if(!D||D.dead)return; D.dead=true; RUN.on=false; st.runTarget=0;
    const m=Math.round(D.dist/T), b=window.CATBEST||0; say('YOU WIPE OUT AT '+m+' M. '+(m>b?'A NEW BEST!':'YOUR BEST: '+b+' M.'),'#c8a090'); if(m>b)window.CATBEST=m;
    setTimeout(()=>{ if(D&&D.dead)H.end(); },1400); };   // END the program; hide() cleans up and fades you back into the holodeck

  ROOMS.off.catrun={name:'THE CATACOMB RUN',noCeil:1,box:{x0:WX-560*T,z0:-20*T,x1:WX+560*T,z1:2300*T,y0:-3,y1:560*T},
    spawn:[WX,2*T,0,0],out:[WX,2*T,0,0],
    build:()=>{ const G=new THREE.Group(); G.name='catrun'; scene.add(G); W={G,segZ:0,i:0,rows:[],obst:[]};
      const amb=new THREE.HemisphereLight(0xbfe4ff,0x24380f,1.0); G.add(amb);
      const sun=new THREE.DirectionalLight(0xfff0cc,1.2); sun.position.set(WX+18,40,-10); sun.target.position.set(WX,0,30*T); G.add(sun,sun.target);
      const sky=new THREE.Mesh(new THREE.SphereGeometry(500*T,20,10,0,Math.PI*2,0,Math.PI/2),new THREE.MeshBasicMaterial({color:0x8fcfe8,side:THREE.BackSide,fog:false})); sky.position.set(WX,0,0); sky.userData.anyRoom=1; G.add(sky); W.sky=sky;   // a bright sky dome inside the room's black (anyRoom: the room cull keeps it)
      const far=new THREE.Mesh(new THREE.CircleGeometry(500*T,32),new THREE.MeshLambertMaterial({color:0x2c3d1c})); far.rotation.x=-Math.PI/2; far.position.set(WX,-.5,0); far.userData.anyRoom=1; G.add(far); W.far=far;   // distant jungle floor past the track
      W.segZ=-6*T; W.i=0; while(W.segZ<60*T){ strip(W.segZ,W.i++); W.segZ+=SEG; }
      return ROOMS.part(G,()=>{},null); },   // G already holds the world; part just gives a droppable record
    unbuild:()=>{ RUN.on=false; const G=W&&W.G; if(G){ G.traverse(c=>{ if(c.geometry)c.geometry.dispose(); }); G.removeFromParent(); }
      if(savedGY){ SHARED.groundY=savedGY; savedGY=null; } if(savedView&&UI.setView){ UI.setView(savedView); savedView=null; } if(keyoff){ keyoff(); keyoff=null; } if(VR.want===WANT)VR.ask(null); W=null; } };

  H.programs.push({ name:'THE CATACOMB RUN', skill:'fight', cost:12, offWorld:true, room:'catrun',
    intro:'THE CATACOMB RUN: JUMP THE LOGS, DUCK THE BRANCHES, DODGE THE ROCKS. LAST AS LONG AS YOU CAN.',
    go:R=>{ const d=D=Object.assign(R,{dist:0,lane:1,dead:false,ready:false,go:false,t:0,cd:0,spd:SPD0,prevZ:2*T,hint:{},ms:1,best:false,log:[]});
      if(!ROOMS.enterAt)return;
      ROOMS.enterAt('catrun',[WX,2*T,0,0]).then(()=>{ if(D!==d)return;
        savedGY=SHARED.groundY; SHARED.groundY=()=>0;
        savedView=UI.view; if(UI.setView)UI.setView('follow');
        pos.x=WX; pos.z=2*T; SHARED.py=0; SHARED.heading=0; SHARED.target=null;
        const is=(k,a)=>k===a||UI.keyOf&&k===UI.keyOf(a);
        const onkey=e=>{ if(!D||!D.ready||D.dead)return; const k=(e.key||'').toLowerCase();   // left/right (A/D, the stick) change lane, up (W, the stick) jumps, down (S, the stick) holds a crouch
          if(k==='arrowleft'||is(k,'a')){ dodge(-1); e.stopPropagation(); } else if(k==='arrowright'||is(k,'d')){ dodge(1); e.stopPropagation(); }
          else if(k==='arrowup'||is(k,'w')){ if(!e.repeat)RIG.act(st,' '); e.stopPropagation(); } else if(k==='arrowdown'||is(k,'s')){ if(!e.repeat)RIG.act(st,'C'); e.stopPropagation(); } };
        const onup=e=>{ const k=(e.key||'').toLowerCase(); if(k==='arrowdown'||is(k,'s'))RIG.release(st,'C'); };
        addEventListener('keydown',onkey,true); addEventListener('keyup',onup,true); keyoff=()=>{ removeEventListener('keydown',onkey,true); removeEventListener('keyup',onup,true); };
        RUN.on=true; d.ready=true; if(VR.on)VR.ask(WANT);
        for(const k of ['dodge','jump','duck'])say(how(k),'#ece5d3'); }); },   // at the line: the controls (try them), then 3, 2, 1, GO
    run:(R,dt)=>{ if(!D||!D.ready||D.dead||!W)return; dt=Math.min(dt||1/60,.25);   // match RIG.step's cap so the run and the jump/roll stay in sync
      if(VR.on&&VR.want!==WANT)VR.ask(WANT);
      if(!D.go){ if(!D.t)D.t=performance.now(); const n=Math.floor(((performance.now()-D.t)/1000-5)/.8); if(n>D.cd-1&&n>=0){ D.cd=n+1; const b=window.CATBEST||0;
          if(n<3)say(String(3-n)+(n===0&&b?'   YOUR BEST: '+b+' M':''),'#f2c14e',{big:1,only:1,ms:900}); else { D.go=true; say('GO!','#7dffa4',{big:1,only:1,ms:1200}); } }
        pos.x+=(WX+LANE[D.lane]-pos.x)*Math.min(1,dt*12); SHARED.heading=0; return; }
      for(const o of W.obst)if(o.teach&&!D.hint[o.kind]&&o.z-pos.z<9*T){ D.hint[o.kind]=1; say(how(o.kind).replace(':','!'),'#f2c14e',{big:0,only:1,ms:2500}); }
      { const m=Math.floor(D.dist/T/100)*100, b=window.CATBEST||0; if(m>=100*D.ms){ D.ms=m/100+1; say(m+' M','#ece5d3'); } if(b&&!D.best&&D.dist/T>b){ D.best=true; say('A NEW BEST!','#7dffa4'); } }
      D.spd=SPD0+(SPD1-SPD0)*Math.min(1,Math.max(0,D.dist-(FREE0*SEG-6*T))/RAMPD);   // the start's pace through the three lessons, then it speeds up the further you get
      const z0=D.prevZ; pos.z+=D.spd*dt; const laneX=WX+LANE[D.lane]; pos.x+=(laneX-pos.x)*Math.min(1,dt*12); SHARED.heading=0;
      if(W.sky)W.sky.position.z=pos.z; if(W.far)W.far.position.z=pos.z;
      clearAhead(); check(z0,pos.z); D.dist=Math.max(D.dist,pos.z); D.prevZ=pos.z; },
    hide:()=>{ if(!D)return; D=null; RUN.on=false; st.runTarget=0; if(VR.want===WANT)VR.ask(null);
      const off=ROOMS.offIn&&ROOMS.offIn()==='catrun', Hl=H.hall;
      if(savedGY){ SHARED.groundY=savedGY; savedGY=null; } if(savedView&&UI.setView){ UI.setView(savedView); savedView=null; } if(keyoff){ keyoff(); keyoff=null; }
      if(off&&Hl&&ROOMS.enterAt)ROOMS.enterAt('arcade',[Hl.x,Hl.z,0,Math.PI]);   // still off-world: fade back into the holodeck (which drops the catrun)
      else if(ROOMS.lazy&&ROOMS.lazy.catrun&&ROOMS.lazy.catrun.drop)ROOMS.lazy.catrun.drop(); } });
  window.CATNEXT=()=>{ if(!W||!D)return null; const o=W.obst.filter(o=>!o.hit&&o.z>pos.z).sort((a,b)=>a.z-b.z)[0]; return o?{kind:o.kind,dz:+((o.z-pos.z)/T).toFixed(1),lane:o.hb&&o.hb.lane!=null?o.hb.lane:null}:null; };
  window.CATDBG=()=>({on:RUN.on,ready:!!(D&&D.ready),dead:!!(D&&D.dead),go:!!(D&&D.go),log:D?D.log.slice():[],lane:D?D.lane:0,dist:D?Math.round(D.dist/T):0,rows:W?W.rows.length:0,obst:W?W.obst.length:0,mv:st&&st.move?st.move.name:null}); }
