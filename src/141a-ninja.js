{ const D=window.DOJO, R=RIG, T=TILE, {X,Z}=BOD, MAT=D.MAT;
  if(FORAGE.SK){ if(!FORAGE.SK.some(s=>s[0]==='fight'))FORAGE.SK.push(['fight','MARTIAL ARTS']); const S=FORAGE.S; if(S.sk.fight==null)S.sk.fight=0; if(!S.lock.fight)S.lock.fight='up'; }
  const wait=ms=>new Promise(r=>setTimeout(r,ms)), frames=k=>new Promise(r=>{ const f=()=>--k<=0?r():requestAnimationFrame(f); requestAnimationFrame(f); });
  const GX=X(D.gate.x), GZ=Z(D.gate.y), IX=X(D.DA), IZ=Z(D.B.y1), dang=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
  const room=()=>STORE.rooms.find(r=>r.id===D.id), inD=()=>{ const Rm=room(); return !!Rm&&LVL==='up'&&Rm.inside(pos.x,pos.z); };
  let busy=false;
  const fade=async(txt,fn)=>{ busy=true; const el=document.getElementById('subfade'); el.textContent=txt; el.style.pointerEvents='auto'; el.style.opacity='1'; if(keys.clear)keys.clear(); target=null; await wait(340);
    fn(); await frames(3); await wait(260); el.style.opacity='0'; el.style.pointerEvents='none'; await wait(360); busy=false; };
  D.enter=()=>{ if(!busy)fade('ENTERING THE DOJO',()=>{ STORE.offGo('THE DOJO'); UI.goTo(IX,IZ-1.6*T,'up'); heading=Math.PI; }); };
  D.leave=()=>{ if(!busy)fade('LEAVING THE DOJO',()=>{ TR.stop(); UI.goTo(GX,GZ+1.4*T,'up'); heading=0; }); };
  { const hb=new THREE.Mesh(new THREE.BoxGeometry(1.8*T,2.6*T,.5*T),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(GX,1.3*T,GZ+.3*T); scene.add(hb);
    UI.thing({name:'THE DOJO',ghost:1,obj:hb,reach:1.2*T,near:2.4*T,tall:2.8*T,act:()=>D.enter()}); }
  const MX0=X(MAT.x0+.5), MX1=X(MAT.x1-.5), MZ0=Z(MAT.y0+.5), MZ1=Z(MAT.y1-.5), CX=(MX0+MX1)/2, CZ=(MZ0+MZ1)/2;
  const KATA=[['g',1.2],['jab'],['cross'],['uppercut'],['r',.45],['frontKick'],['roundhouse'],['r',.6],['t',Math.PI/2],['jab'],['cross'],['legSweep'],['r',.5],
    ['t',Math.PI],['backflip'],['r',.7],['g',.8],['t',-Math.PI/2],['frontKick'],['roundhouse'],['block',.7],['r',.3],['t',0],['frontflip'],['r',.6],
    ['c','cartwheel'],['r',.5],['c','cartwheel'],['r',.4],['t',Math.PI/4],['uppercut'],['frontKick'],['legSweep'],['r',.5],['t',0],['g',1.6],['r',1]];
  const DR=[{n:'JAB',k:['j'],who:/^b?jab$/,demo:[['jab']]},{n:'FRONT KICK',k:['k'],who:/^frontKick$/,demo:[['frontKick']]},{n:'ONE-TWO',k:['j','j'],who:/^b?cross$/,demo:[['jab'],['cross']]},
    {n:'CARTWHEEL',k:['u'],who:/^cartwheel$/,demo:[['cartwheel']]},{n:'ROLL',k:['r'],who:/^roll$/,demo:[['roll']]},{n:'JUMP',k:[' '],who:/^(jump|runJump)$/,demo:[['jump']]},
    {n:'ROUNDHOUSE',k:['k','k'],who:/^roundhouse$/,demo:[['frontKick'],['roundhouse']]},{n:'UPPERCUT',k:['j','j','j'],who:/^b?uppercut$/,demo:[['jab'],['cross'],['uppercut']]}];
  const keyName=a=>{ const k=UI.keyOf?UI.keyOf(a):a; return k===' '?'SPACE':String(k).toUpperCase(); };
  let N=null;
  const E=document.createElement('div'); E.id='dojot'; E.style.cssText='position:fixed;left:50%;top:13%;transform:translateX(-50%);z-index:16;display:none;pointer-events:none;text-align:center;font:13px Silkscreen,monospace;letter-spacing:1px;color:#ece5d3;background:#0b0d13e8;border:2px solid #2a3040;padding:10px 18px;min-width:280px;zoom:var(--uiz,1)';
  E.innerHTML='<div id="dojot1" style="color:#8a8f9c;font-size:11px"></div><div id="dojot2" style="margin-top:6px;font-size:15px"></div><div style="margin-top:8px;height:6px;background:#22252f"><div id="dojotb" style="height:6px;background:#f2c14e;width:0"></div></div>';
  document.body.appendChild(E); const E1=E.querySelector('#dojot1'), E2=E.querySelector('#dojot2'), EB=E.querySelector('#dojotb');
  const show=(a,b,col='#ece5d3',bar=0)=>{ E.style.display='block'; E1.textContent=a; E2.textContent=b; E2.style.color=col; EB.style.width=Math.round(bar*100)+'%'; EB.parentNode.style.visibility=bar>0?'visible':'hidden'; };
  const gain=()=>{ const F=FORAGE, S=F.S; if(S.lock.fight!=='up'||S.sk.fight>=1000)return; const v=S.sk.fight, n=v<300?3:v<600?2:1; S.sk.fight=Math.min(1000,v+n);
    F.say(`YOUR SKILL IN MARTIAL ARTS HAS INCREASED. IT IS NOW ${(S.sk.fight/10).toFixed(1)}.`,'#7fd0ff'); if(F.save)F.save(); if(F.draw)F.draw(); };
  const TR={on:false,ph:'',t:0,n:0,ok:0,list:[],d:null,lu:null,lm:null};
  TR.stop=()=>{ TR.on=false; E.style.display='none'; if(N){ N.q=null; } };
  TR.start=()=>{ if(TR.on||!N)return; const pick=[0,1]; while(pick.length<5){ const i=2+Math.floor(Math.random()*6); if(!pick.includes(i))pick.push(i); }
    TR.list=pick.sort((a,b)=>a-b).map(i=>DR[i]); TR.on=true; TR.ph='intro'; TR.t=0; TR.n=0; TR.ok=0; TR.lu=st.up; TR.lm=st.move; N.q=[]; show('THE NINJA BOWS','WATCH, THEN DO AS HE DOES'); };
  TR.tick=dt=>{ if(!TR.on)return; TR.t+=dt; const far=!inD()||Math.hypot(pos.x-N.x,pos.z-N.z)>7*T;
    if(far&&TR.ph!=='end'){ TR.ph='end'; TR.t=0; show('THE NINJA RETURNS TO HIS KATA','COME BACK WHEN YOU ARE READY','#c8a090'); }
    const seen=[]; if(st.up&&st.up!==TR.lu)seen.push(st.up.name); if(st.move&&st.move.def&&st.move!==TR.lm)seen.push(st.move.name); TR.lu=st.up; TR.lm=st.move;
    const d=TR.d, keyTxt=d?d.k.map(keyName).join(' '):'';
    if(TR.ph==='intro'&&TR.t>1.8){ TR.ph='demo'; TR.t=0; TR.d=TR.list[TR.n]; N.q=TR.d.demo.map(s=>s.slice()); show('DRILL '+(TR.n+1)+' OF '+TR.list.length,'WATCH: '+TR.d.n); }
    else if(TR.ph==='demo'){ if(!N.q.length&&!N.cur&&TR.t>.6){ TR.ph='you'; TR.t=0; N.q=[['g',30]]; } }
    else if(TR.ph==='you'){ const L=4.5; show('YOUR TURN: '+d.n,'PRESS '+keyTxt,'#f2c14e',Math.max(0,1-TR.t/L));
      if(seen.some(n=>d.who.test(n))){ TR.ph='good'; TR.t=0; TR.ok++; gain(); N.q=[]; show(d.n,'GOOD.','#9fe07f'); }
      else if(TR.t>L){ TR.ph='miss'; TR.t=0; N.q=[]; show(d.n,'TOO SLOW.','#e07f6a'); } }
    else if((TR.ph==='good'||TR.ph==='miss')&&TR.t>1.4){ TR.n++; if(TR.n>=TR.list.length){ TR.ph='end'; TR.t=0; show('TRAINING DONE: '+TR.ok+' OF '+TR.list.length,'MARTIAL ARTS '+(FORAGE.S.sk.fight/10).toFixed(1),'#f2c14e'); }
      else { TR.ph='intro'; TR.t=1.2; } }
    else if(TR.ph==='end'&&TR.t>2.8)TR.stop(); };
  const mk=()=>{ if(N)return; const MT=R.MATS; if(!MT.includes('ninja')){ MT.push('ninja'); W3.ramp.push(['#3e3f4a','#26272f','#17171d','#0b0b0e'].map(h=>new THREE.Color(h))); }
    const NB=MT.indexOf('ninja'), keep=new Set(['eye','eyeW','pupil'].map(n=>MT.indexOf(n)).filter(i=>i>=0)), LID=MT.indexOf('lid'), SKN=MT.indexOf('skin');
    const {PCS}=musBody(); for(const p of PCS)p.recol=m=>keep.has(m)?m:m===LID?SKN:NB;
    for(const P of PCS)if(!MUSGEO.has(P.share||P)){ const fine=W3.fine(P); W3.warm(P,P.step||(fine?.5:1),fine,null); }
    const FM=figureMesh(PCS,'ninja'), g=new THREE.Group(); g.add(FM.me); scene.add(g);
    const S=R.create(); S.smooth=true; const hb=new THREE.Mesh(new THREE.BoxGeometry(1.1*T,2.3*T,1.1*T),new THREE.MeshBasicMaterial({visible:false})); scene.add(hb);
    N={g,FM,PCS,S,hb,x:CX,z:CZ,hd:0,to:0,ki:0,cur:null,q:null,tris:FM.tris};
    UI.thing({name:'THE NINJA',obj:hb,reach:1.7*T,near:3*T,tall:2.5*T,act:()=>TR.start()}); };
  D.ready=mk; if(D.built)mk();
  const CB=()=>(R.RIGT&&R.RIGT.combo)||1;
  const begin=s=>{ const S=N.S, [k,a]=s; N.cur={k,a,t:0};
    if(k==='g'||k==='block'){ R.beginUp(S,k==='g'?'guard':'block'); if(S.up)S.up.held=true; }
    else if(k==='t')N.to=a; else if(k==='c')N.to=N.x<CX?Math.PI/2:-Math.PI/2; else if(k==='r'){}
    else if(R.ARMMOVES.has(k))R.beginUp(S,k); else R.begin(S,k); };
  const done=dt=>{ const S=N.S, c=N.cur, k=c.k; c.t+=dt;
    if(k==='g'||k==='block'){ const end=c.t>=c.a||c.a>20&&!(TR.on&&TR.ph==='you'); if(end&&S.up)S.up.held=false; return end&&(!S.up||c.t>c.a+.5); }
    if(k==='r')return c.t>=c.a; if(k==='t')return Math.abs(dang(N.to,N.hd))<.04;
    if(k==='c'){ if(!c.went){ if(Math.abs(dang(N.to,N.hd))<.04){ R.begin(S,c.a); c.went=1; } return false; } return !S.move&&!S.out; }
    if(R.ARMMOVES.has(k)){ const u=S.up; return !u||u.name!==k||!!(u.def.window&&u.t>=u.def.window[1]*CB()); }
    const m=S.move; return !m||m.name!==k&&!(k==='jump'&&m.name==='runJump')||!!(m.def.window&&m.t>=m.def.window[1]); };
  const ntick=dt=>{ if(!N)return; const S=N.S, here=inD()||Math.hypot(pos.x-N.x,pos.z-N.z)<30*T; N.g.visible=here; if(!here)return;
    if(!N.cur){ const s=N.q?N.q.shift():KATA[N.ki++%KATA.length]; if(s)begin(s); }
    if(N.cur&&done(dt))N.cur=null;
    if(TR.on&&!(N.cur&&(N.cur.k==='c'||N.cur.k==='t')))N.to=Math.atan2(pos.x-N.x,pos.z-N.z);
    const e=dang(N.to,N.hd); N.hd+=Math.sign(e)*Math.min(Math.abs(e),dt*(TR.on?6:4.5));
    S.target=0; const d0=S.dist; R.step(S,dt); const go=(S.dist-d0)*W3.SZ/PPU;
    if(go){ N.x+=Math.sin(N.hd)*go; N.z+=Math.cos(N.hd)*go; } N.x=Math.max(MX0,Math.min(MX1,N.x)); N.z=Math.max(MZ0,Math.min(MZ1,N.z));
    N.g.position.set(N.x,0,N.z); N.g.rotation.y=N.hd; musScale(N.g); N.hb.position.set(N.x,1.15*T,N.z);
    R.farOnly(false); const B=R.pose(S,true); N.PCS.forEach((pc,i)=>N.FM.set(i,R.frameOf(pc.on||pc.n,B))); };
  const tick0=CLOCK.tick; CLOCK.tick=dt=>{ tick0(dt); dt=Math.min(dt,.1);
    if(!busy&&LVL==='up'&&!UI.freeCam&&!(typeof RAG!=='undefined'&&RAG.on)){ const ins=inD();
      if(!ins&&Math.abs(pos.x-GX)<.85*T&&pos.z>GZ-.2*T&&pos.z<GZ+.62*T)D.enter();
      else if(ins&&Math.abs(pos.x-IX)<.9*T&&pos.z>IZ-.55*T)D.leave(); }
    ntick(dt); TR.tick(dt); };
  window.DOJODBG=()=>({built:D.built,inside:inD(),busy,gate:[+(GX/T).toFixed(2),+(GZ/T).toFixed(2)],door:[+(IX/T).toFixed(2),+(IZ/T).toFixed(2)],you:[+(pos.x/T).toFixed(2),+(pos.z/T).toFixed(2)],
    ninja:N&&{x:+(N.x/T).toFixed(2),z:+(N.z/T).toFixed(2),hd:+N.hd.toFixed(2),step:N.cur&&N.cur.k,mv:N.S.move&&N.S.move.name,up:N.S.up&&N.S.up.name,tris:N.tris},
    tr:{on:TR.on,ph:TR.ph,n:TR.n,ok:TR.ok,drill:TR.d&&TR.d.n,keys:TR.d&&TR.d.k},fight:FORAGE.S.sk.fight/10});
  window.DOJOWALK=k=>{ const P=k==='out'?[IX,IZ+.4*T]:[GX,GZ-.4*T]; target=new THREE.Vector3(P[0],py,P[1]); UI.go(3); };
  window.DOJOTRAIN=()=>TR.start(); window.DOJONINJA=()=>N&&{x:N.x,z:N.z};
}
