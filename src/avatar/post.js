const AVE={};
{ const R=RIG, D=Math.PI/180, $=s=>document.querySelector(s), A=4.2, FX=2.97;
  const store={ get(k){ try{ return JSON.parse(localStorage.getItem(k)); }catch(e){ return null; } }, set(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); return true; }catch(e){ return false; } } };
  let toastT=0; const toast=t=>{ const e=$('#toast'); e.textContent=t; e.classList.add('on'); clearTimeout(toastT); toastT=setTimeout(()=>e.classList.remove('on'),2400); }; AVE.toast=toast;

  UI.setLit((()=>{ try{ return (SAVE.get('avlight')||'1')==='1'; }catch(e){ return true; } })());
  const composer=new EffectComposer(renderer); composer.addPass(new RenderPass(scene,cam));
  { const sp=new ShaderPass(OUTL.pass); composer.addPass(sp); OUTL.pass.uniforms=sp.uniforms; sp.uniforms.tId.value=OUTL.rt.texture; sp.uniforms.tint.value=W3.tint; OUTL.sp=sp; }
  composer.addPass(new OutputPass());
  try{ OUTL.on=(SAVE.get('outline')||localStorage.getItem('market-outline'))==='1'; }catch(e){ OUTL.on=false; } OUTL.sp.enabled=OUTL.on;
  const floorMat=new THREE.MeshLambertMaterial({color:0x2c303a}), floor=new THREE.Mesh(new THREE.CircleGeometry(5,48),floorMat); floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; scene.add(floor);
  const grid=new THREE.GridHelper(8,8/TILE|0,0x4a4f5c,0x353a46); grid.position.y=.002; scene.add(grid);
  const stool=new THREE.Mesh(new THREE.BoxGeometry(.9,1,.9),new THREE.MeshLambertMaterial({color:0x7a4f2c})); stool.castShadow=stool.receiveShadow=true; stool.visible=false; scene.add(stool);
  const UNIT=()=>ZU*W3.SZ*(W3.BH||1);

  ED.exit=()=>{ ED.P.hidden=true; ED.setMode('av'); AV.open(); };
  AV.open('body');

  const both=(o,L,Rr)=>({...o,L,R:Rr||L});
  const wide=x=>[0,A+.4+Math.sqrt(Math.max(0,13.3*13.3-(x-4.3)*(x-4.3))),0];
  const STD={ua:[9,8],fa:[19,8]}, GD={L:{ua:[48,14],fa:[150,-10],fist:1},R:{ua:[42,16],fa:[148,-12],fist:1}};
  const POSES={
    'STAND':both({},{...STD,ik:[FX,A,0]},{...STD,ik:[-FX,A,0]}),
    'SPREAD OUT':both({root:wide(10.2)},{ua:[0,108],fa:[0,110],fist:0,ik:[10.2,A,0],foot:-8},{ua:[0,108],fa:[0,110],fist:0,ik:[-10.2,A,0],foot:-8}),
    'T-POSE':both({},{ua:[0,90],fa:[0,90],ik:[FX,A,0]},{ua:[0,90],fa:[0,90],ik:[-FX,A,0]}),
    'A-POSE':both({},{ua:[0,45],fa:[0,45],ik:[FX+.6,A,0]},{ua:[0,45],fa:[0,45],ik:[-FX-.6,A,0]}),
    'STAR JUMP':both({root:wide(10.5),nod:-12,air:5},{ua:[0,150],fa:[0,160],ik:[10.5,A,0],foot:-25},{ua:[0,150],fa:[0,160],ik:[-10.5,A,0],foot:-25}),
    'RELAXED':{pyaw:-4,cyaw:3,nod:5,look:12,side:-2,L:{ua:[4,10],fa:[14,8],ik:[FX+.4,A,-.6]},R:{ua:[14,6],fa:[34,4],ik:[-FX-.3,A,1.2],foot:4}},
    'HANDS ON HIPS':both({},{ua:[-14,44],fa:[14,-56],fist:.4,ik:[FX+.8,A,0]},{ua:[-14,44],fa:[14,-56],fist:.4,ik:[-FX-.8,A,0]}),
    'ARMS CROSSED':{nod:-3,L:{ua:[24,12],fa:[90,-80],fist:.4,ik:[FX,A,0]},R:{ua:[22,14],fa:[98,-80],fist:.4,ik:[-FX,A,0]}},
    'THINKING':{nod:10,look:-8,L:{ua:[18,6],fa:[88,-72],ik:[FX,A,0]},R:{ua:[28,8],fa:[150,-28],fist:.7,ik:[-FX,A,0]}},
    'WAVE HELLO':{look:-6,L:{...STD,ik:[FX,A,0]},R:{ua:[10,150],fa:[0,172],fist:0,ik:[-FX,A,0]}},
    'POINT':{look:-4,cyaw:6,L:{...STD,ik:[FX,A,0]},R:{ua:[88,6],fa:[88,6],fist:.7,ik:[-FX,A,1]}},
    'SALUTE':{L:{...STD,ik:[FX,A,0]},R:{ua:[30,70],fa:[155,-40],fist:0,ik:[-FX,A,0]}},
    'CHEER':both({nod:-15},{ua:[0,160],fa:[0,172],fist:1,ik:[FX+1,A,0]},{ua:[0,160],fa:[0,172],fist:1,ik:[-FX-1,A,0]}),
    'FLEX':both({nod:-4},{ua:[0,90],fa:[0,178],fist:1,ik:[FX+1.5,A,0]},{ua:[0,90],fa:[0,178],fist:1,ik:[-FX-1.5,A,0]}),
    'SUPERHERO':both({bend:-6,nod:-10},{ua:[-14,44],fa:[14,-56],fist:1,ik:[FX+2.4,A,0]},{ua:[-14,44],fa:[14,-56],fist:1,ik:[-FX-2.4,A,0]}),
    'SHRUG':both({side:6,nod:2},{ua:[8,18],fa:[75,35],fist:0,ik:[FX,A,0]},{ua:[8,18],fa:[75,35],fist:0,ik:[-FX,A,0]}),
    'BOW':both({bend:45,nod:12},{ua:[40,6],fa:[44,6],ik:[FX,A,0]},{ua:[40,6],fa:[44,6],ik:[-FX,A,0]}),
    'FIGHT':{root:[0,17,0],pyaw:-6,cyaw:-10,nod:6,L:{...GD.L,ik:[FX+.6,A,3]},R:{...GD.R,ik:[-FX-.6,A,-3]}},
    'PUNCH':{root:[0,17,1],pyaw:9,cyaw:22,L:{...GD.L,ik:[FX,A,2]},R:{ua:[88,2],fa:[88,0],fist:1,ik:[-FX,A,-2]}},
    'KICK':{bend:-10,L:{ua:[45,15],fa:[150,-10],fist:1,ik:[FX,A,0]},R:{ua:[40,18],fa:[145,-12],fist:1,th:[95,4],sh:[95,4],foot:30}},
    'KNEEL':{root:[0,10.5,1],L:{ua:[40,10],fa:[70,-12],th:[85,6],sh:[0,6],foot:0},R:{...STD,th:[-5,6],sh:[-88,6],foot:-55}},
    'CROUCH':both({root:[0,10.5,0],bend:28,nod:-18},{ua:[55,12],fa:[62,8],th:[100,12],sh:[-22,12],foot:0},{ua:[55,12],fa:[62,8],th:[100,12],sh:[-22,12],foot:0}),
    'SIT ON FLOOR':both({root:[0,5,0],bend:-6},{ua:[-36,16],fa:[-36,16],th:[88,7],sh:[88,7],foot:20},{ua:[-36,16],fa:[-36,16],th:[88,7],sh:[88,7],foot:20}),
    'CROSS-LEGGED':both({root:[0,5,0],bend:4},{ua:[30,22],fa:[62,18],th:[82,46],sh:[82,-62],foot:0},{ua:[30,22],fa:[62,18],th:[82,46],sh:[82,-62],foot:0}),
    'MEDITATE':both({root:[0,5,0],nod:10},{ua:[14,16],fa:[78,-24],th:[82,46],sh:[82,-62],foot:0},{ua:[14,16],fa:[78,-24],th:[82,46],sh:[82,-62],foot:0}),
    'LIE DOWN':both({root:[0,4,0],pitch:-90},{ua:[0,24],fa:[0,24],th:[0,6],sh:[0,6],foot:0},{ua:[0,24],fa:[0,24],th:[0,6],sh:[0,6],foot:0}),
    'JUMP':both({air:7,nod:-8},{ua:[0,155],fa:[0,165],th:[90,6],sh:[-40,6],foot:-20},{ua:[0,155],fa:[0,165],th:[90,6],sh:[-40,6],foot:-20}),
    'RUN':{bend:12,nod:-6,cyaw:-8,pyaw:6,L:{ua:[-40,10],fa:[40,8],fist:.6,th:[55,4],sh:[-30,4],foot:10},R:{ua:[50,10],fa:[130,6],fist:.6,th:[-30,4],sh:[-95,4],foot:-30}},
    'WALK':{nod:-2,L:{ua:[-18,8],fa:[-4,8],th:[26,3],sh:[22,3],foot:10},R:{ua:[22,8],fa:[44,6],th:[-18,3],sh:[-30,3],foot:-12}},
    'YOGA TREE':{root:[0,17.5,0],L:{ua:[0,170],fa:[0,176],fist:0,ik:[1.2,A,0]},R:{ua:[0,170],fa:[0,176],fist:0,th:[20,70],sh:[20,-100],foot:-20}},
    'WARRIOR':{root:[0,wide(10)[1]-2.5,0],look:62,L:{ua:[0,90],fa:[0,90],ik:[9,A,0]},R:{ua:[0,90],fa:[0,90],ik:[-9.5,A,0]}},
    'ARABESQUE':{bend:35,nod:-30,L:{ua:[150,5],fa:[150,5],fist:0,ik:[FX*.5,A,0]},R:{ua:[0,80],fa:[0,80],fist:0,th:[-95,4],sh:[-95,4],foot:-40}},
    'PRAY':both({nod:12},{ua:[20,10],fa:[110,-62],fist:0,ik:[FX,A,0]},{ua:[20,10],fa:[110,-62],fist:0,ik:[-FX,A,0]}),
    'FACEPALM':{nod:25,L:{...STD,ik:[FX,A,0]},R:{ua:[35,8],fa:[160,-20],fist:0,ik:[-FX,A,0]}},
    'DAB':{nod:30,look:35,L:{ua:[70,40],fa:[110,-80],ik:[FX+1,A,0]},R:{ua:[30,125],fa:[30,125],fist:0,ik:[-FX-1,A,0]}},
    'STRETCH UP':both({nod:-20},{ua:[0,178],fa:[0,178],fist:0,ik:[FX,A,0],foot:-22},{ua:[0,178],fa:[0,178],fist:0,ik:[-FX,A,0],foot:-22}),
    'ZOMBIE':both({nod:12,side:8},{ua:[88,-4],fa:[88,-4],fist:0,ik:[FX,A,0]},{ua:[88,-4],fa:[88,-4],fist:0,ik:[-FX,A,1]}),
    'SCARECROW':both({side:10,nod:8},{ua:[0,90],fa:[0,8],fist:0,ik:[FX*.6,A,0]},{ua:[0,90],fa:[0,8],fist:0,ik:[-FX*.6,A,0]}),
    'LEAN BACK':both({bend:-14,nod:6},{ua:[-25,14],fa:[-10,14],ik:[FX,A,1]},{ua:[-25,14],fa:[-10,14],ik:[-FX,A,-1]}),
  };
  AVE.POSES=POSES;
  const FLOORR=[['head',8.6],['headTop',1],['chest',5.4],['spine',5.2],['pelvis',4.4],['neck',2.3]]; for(const n of 'LR')FLOORR.push(['shoulder'+n,2.4],['elbow'+n,2],['wrist'+n,1.7],['knee'+n,3],['ankle'+n,2.6],['heel'+n,0],['ball'+n,0],['toe'+n,-.6]);
  const poseOf=key=>{ const k=JSON.parse(JSON.stringify(key)); delete k.air; return R.mkMove({keys:[[0,{}],[.3,k]]}).k.slice(-1)[0].P; };
  const groundOf=B=>{ let m=1e9; for(const [k,r] of FLOORR){ const j=B.J[k]; if(j)m=Math.min(m,j.y-r); } return m<1e8?-m:0; };
  const lerpDeep=(a,b,k)=>{ if(typeof b==='number')return typeof a==='number'?a+(b-a)*k:b; if(Array.isArray(b))return b.map((v,i)=>lerpDeep(a&&a[i],v,k)); if(b&&typeof b==='object'){ const o={}; for(const q in b)o[q]=lerpDeep(a&&a[q],b[q],k); return o; } return b; };
  const MODE={kind:'pose',name:'SPREAD OUT',key:null,P:null,Pnow:null,air:0,airNow:0,loop:null,wait:0};
  const setPose=(name,key)=>{ MODE.kind='pose'; MODE.name=name; MODE.key=JSON.parse(JSON.stringify(key||POSES[name])); MODE.P=poseOf(MODE.key); MODE.air=MODE.key.air||0; MODE.loop=null; stool.visible=false; drawAll(); };
  const live=()=>{ MODE.kind='live'; MODE.name='LIVE'; MODE.loop=null; st.target=0; st.runTarget=0; st.move=null; st.up=null; st.out=null; stool.visible=false; drawAll(); };
  const SEAT=13;
  const sit=()=>{ MODE.kind='sit'; MODE.name='SIT ON A STOOL'; MODE.loop=null; stool.visible=true; drawAll(); };
  AVE.setPose=setPose; AVE.live=live; AVE.MODE=MODE;
  const SKIP=new Set(['up','hop','wallHit','wallRun','leap','climb','mantle','grab','grabL','dive','cannonball','carry','sitdown']);
  const NAMEK={bjab:'BOXING JAB',bcross:'BOXING CROSS',buppercut:'BOXING UPPERCUT'}, NICE=n=>NAMEK[n]||n.replace(/([a-z])([A-Z])/g,'$1 $2').toUpperCase();
  const moveNames=()=>Object.keys(R.MOVES).filter(n=>R.MOVES[n]&&R.MOVES[n].k&&!SKIP.has(n)&&!n.startsWith('__')).sort();
  const playMove=n=>{ if(MODE.kind!=='live')live(); st.target=0; st.move=null; st.up=null; st.out=null; if(R.ARMMOVES.has(n))R.beginUp(st,n); else R.begin(st,n); MODE.name=NICE(n); MODE.cur=n; drawAll(); };
  const gait=(w,run)=>{ live(); st.target=w; st.runTarget=run; MODE.name=w?run?'RUN':'WALK':'LIVE'; drawAll(); };

  const TABS=[['pose','POSE'],['moves','MOVES'],['view','VIEW'],['looks','LOOKS'],['files','FILES']]; let tab=store.get('market-avtab')||'pose';
  const el=(t,a={},...k)=>{ const e=document.createElement(t); for(const x in a){ if(x==='on')for(const ev in a.on)e.addEventListener(ev,a.on[ev]); else if(x==='class')e.className=a[x]; else if(x in e)e[x]=a[x]; else e.setAttribute(x,a[x]); } for(const c of k)if(c!=null)e.append(c); return e; };
  const btn=(label,fn,pressed)=>{ const b=el('button',{class:'btn',type:'button',on:{click:fn}},label); if(pressed)REF.push(()=>b.setAttribute('aria-pressed',String(!!pressed()))); return b; };
  const REF=[]; function drawAll(){ for(const f of REF)f(); }
  const h3=t=>el('h3',{},t), dim=t=>el('div',{class:'dim'},t);
  const slider=(id,label,min,max,step,get,set,fmt=v=>(+v).toFixed(2))=>{ const i=el('input',{type:'range',id,min,max,step}), v=el('span',{class:'val'}); i.addEventListener('input',()=>{ set(+i.value); v.textContent=fmt(i.value); });
    REF.push(()=>{ i.value=get(); v.textContent=fmt(get()); }); return el('div',{class:'row'},el('label',{class:'lab',htmlFor:id},label),i,v); };
  TABS.forEach(([k,l])=>{ const b=el('button',{type:'button',on:{click:()=>showTab(k)}},l); b.dataset.t=k; $('#wbtabs').append(b); });
  function showTab(t){ tab=t; store.set('market-avtab',t); document.querySelectorAll('#wb .pane').forEach(p=>p.hidden=p.id!=='p-'+t); document.querySelectorAll('#wbtabs button').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.t===t))); drawAll(); }

  const JOINTS=[['BODY',[['root.1','UP / DOWN',4,22,.1],['bend','BEND',-90,90,1],['side','SIDE BEND',-60,60,1],['cyaw','SHOULDER TWIST',-90,90,1],['pyaw','HIP TWIST',-90,90,1],['pitch','TIP',-180,180,1],['roll','TIP SIDEWAYS',-90,90,1]]],
    ['HEAD',[['nod','NOD',-70,70,1],['look','LOOK',-90,90,1]]],
    ['ARMS',[['ua.0','UPPER ARM FWD',-180,180,1],['ua.1','UPPER ARM OUT',-90,180,1],['fa.0','FOREARM FWD',-180,180,1],['fa.1','FOREARM OUT',-90,180,1],['fist','FIST',0,1,.05]],1],
    ['LEGS',[['th.0','THIGH FWD',-120,120,1],['th.1','THIGH OUT',-60,90,1],['sh.0','SHIN FWD',-150,120,1],['sh.1','SHIN OUT',-110,90,1],['foot','TOE UP',-70,70,1]],1]];
  let jSide='L', jMirror=true;
  const pval=(p)=>{ const P=MODE.P||poseOf(POSES.STAND); const m=/^(\w+)\.(\d)$/.exec(p);
    if(p==='root.1')return P.root.y; if(['bend','side','cyaw','pyaw','pitch','roll','nod','look'].includes(p))return (P[p]||0)/D;
    const g=P[jSide]; if(p==='fist')return g.fist||0; if(p==='foot')return (g.foot||0)/D; return (g[m[1]]?g[m[1]][+m[2]]:0)/D; };
  const pset=(p,v)=>{ if(MODE.kind!=='pose')setPose(MODE.name in POSES?MODE.name:'STAND'); const K=MODE.key; MODE.name='MY POSE';
    if(p==='root.1'){ const r=K.root||[0,MODE.P.root.y,MODE.P.root.z]; r[1]=v; K.root=r; }
    else if(['bend','side','cyaw','pyaw','pitch','roll','nod','look'].includes(p))K[p]=v;
    else for(const s of jMirror?['L','R']:[jSide]){ const g=K[s]||(K[s]={}), P=MODE.P[s], m=/^(\w+)\.(\d)$/.exec(p);
      if(p==='fist')g.fist=v; else if(p==='foot')g.foot=v; else { const f=m[1]; if(f==='th'||f==='sh'){ delete g.ik; if(!g.th)g.th=P.th.map(a=>a/D); if(!g.sh)g.sh=P.sh.map(a=>a/D); } if(!g[f])g[f]=P[f].map(a=>a/D); g[f][+m[2]]=v; } }
    MODE.P=poseOf(K); MODE.Pnow=MODE.P; };
  const jointBox=el('div');
  JOINTS.forEach(([g,rows,sided])=>{ jointBox.append(h3(g+(sided?' (SIDE BELOW)':''))); rows.forEach(([p,l,a,b,s])=>jointBox.append(slider('j-'+g+p,l,a,b,s,()=>pval(p),v=>pset(p,v),v=>(+v).toFixed(p==='fist'||p==='root.1'?2:0)))); });
  const myPoses=el('div',{class:'grid'}), pname=el('input',{type:'text',id:'pname',placeholder:'name this pose',maxLength:24,style:'flex:1;font:inherit;background:#0e1016;color:inherit;border:2px solid #3a3f4e;padding:6px'});
  pname.addEventListener('keydown',e=>e.stopPropagation());
  const drawMine=()=>{ myPoses.innerHTML=''; const L=store.get('market-avposes')||{}; const ks=Object.keys(L); if(!ks.length)myPoses.append(dim('none kept yet'));
    for(const k of ks)myPoses.append(el('div',{class:'row',style:'margin:0'},btn(k,()=>setPose(k,L[k])),btn('X',()=>{ delete L[k]; store.set('market-avposes',L); drawMine(); }))); };
  $('#p-pose').append(dim('click a pose: he eases into it. SPREAD OUT shows every limb, as a character sheet does.'),
    el('div',{class:'grid',style:'margin-top:6px'},...Object.keys(POSES).map(k=>btn(k,()=>setPose(k),()=>MODE.kind==='pose'&&MODE.name===k)),btn('SIT ON A STOOL',sit,()=>MODE.kind==='sit'),btn('LIVE (HIS OWN)',live,()=>MODE.kind==='live'&&MODE.name==='LIVE')),
    h3('POSE HIM BY HAND'),dim('every part of the pose held, turned by its slider; ANIMATE (in the avatar editor\'s MORE) keys his moves'),
    el('div',{class:'row'},btn('LEFT',()=>{ jSide='L'; drawAll(); },()=>jSide==='L'),btn('RIGHT',()=>{ jSide='R'; drawAll(); },()=>jSide==='R'),btn('BOTH SIDES',()=>{ jMirror=!jMirror; drawAll(); },()=>jMirror)),
    jointBox,h3('MY POSES'),el('div',{class:'row'},pname,btn('KEEP',()=>{ const n=(pname.value||'POSE').trim().toUpperCase(); const L=store.get('market-avposes')||{}; L[n]=MODE.key||POSES.STAND; store.set('market-avposes',L); pname.value=''; drawMine(); toast('Pose "'+n+'" kept in this browser'); })),myPoses);
  drawMine();
  let loopOn=true; const movesBox=el('div',{class:'grid'});
  const drawMoves=()=>{ movesBox.innerHTML=''; for(const n of moveNames())movesBox.append(btn(NICE(n),()=>{ playMove(n); MODE.loop=loopOn?n:null; },()=>MODE.kind==='live'&&MODE.cur===n&&MODE.name===NICE(n))); };
  $('#p-moves').append(dim('his own moves from the game, done on the spot. Their speed: the avatar editor\'s SPEED; their keys: its MORE, ANIMATE.'),
    h3('GOING'),el('div',{class:'grid'},btn('STAND',()=>gait(0,0),()=>MODE.kind==='live'&&MODE.name==='LIVE'),btn('WALK',()=>gait(1,0),()=>MODE.name==='WALK'),btn('RUN',()=>gait(1,1),()=>MODE.name==='RUN')),
    h3('MOVES'),movesBox,el('div',{class:'row',style:'margin-top:8px'},btn('ROUND AND ROUND',()=>{ loopOn=true; if(MODE.cur)MODE.loop=MODE.cur; drawAll(); },()=>loopOn),btn('ONCE',()=>{ loopOn=false; MODE.loop=null; drawAll(); },()=>!loopOn)),
    el('div',{class:'row'},btn('MORE: EDIT HIS MOVES',()=>{ ED.show('moves'); }),btn('ANIMATE',()=>{ ED.show('animate'); })));
  drawMoves(); AVE.drawMoves=drawMoves;

  const VIEWS={'FRONT':[0,.12,1.55,null],'3/4':[.62,.22,1.55,null],'SIDE':[Math.PI/2,.1,1.55,null],'BACK':[Math.PI,.18,1.55,null],'OTHER SIDE':[-Math.PI/2,.1,1.55,null],'3/4 BACK':[2.5,.25,1.55,null],
    'ABOVE':[.5,1.2,1.7,null],'BELOW':[.4,-.55,1.6,null],'FACE':[.25,.08,.42,'head'],'HANDS':[.5,.3,.7,'hands'],'FEET':[.5,.45,.6,'feet'],'THE GAME\'S':[.79,.52,1.9,null]};
  const focusOf=f=>{ if(!f)return null; const J=MODE.B&&MODE.B.J; if(!J)return null; const w=p=>new THREE.Vector3(p.x,p.y,p.z).applyMatrix4(W3.group.matrixWorld);
    if(f==='head')return w(J.head); if(f==='hands')return w(J.wristR).add(w(J.wristL)).multiplyScalar(.5); return w(J.ankleL).add(w(J.ankleR)).multiplyScalar(.5).setY(.15); };
  const goView=n=>{ const [y,p,s,f]=VIEWS[n]; ORB.yaw=y; ORB.pitch=p; ORB.size=s; ORB.spin=false; const c=focusOf(f); if(c){ ORB.tx=c.x; ORB.ty=c.y; ORB.tz=c.z; } else { ORB.tx=0; ORB.ty=1.2*(W3.BH||1); ORB.tz=0; } bar(); };
  const PXS=[['FULL',1],['SHARP',1.5],['THE GAME\'S',2],['COARSE',3],['CHUNKY',4]]; let PX=+(store.get('market-avpx')||2);
  const BACK={'VOID':{bg:'#000000',fl:'#000000',grid:false,sky:.8,sun:2.3},'THE STREET':{bg:'#1b2233',fl:'#3a3d44',grid:false,sky:.8,sun:2.4},'STUDIO':{bg:'#262a33',fl:'#3a3f4a',grid:true,sky:.85,sun:2.3},
    'PARK':{bg:'#8ec5ff',fl:'#4f8a3c',grid:false,sky:1,sun:2.6},'DUSK':{bg:'#c86a4a',fl:'#4a3a46',grid:false,sky:.6,sun:1.8,sc:'#ff9a5a'},'NIGHT':{bg:'#0b1430',fl:'#141c34',grid:false,sky:.35,sun:.9,sc:'#9fb4ff'},'PAPER':{bg:'#efede6',fl:'#dcd9cf',grid:true,sky:1,sun:1.6}};
  let BG=store.get('market-avback')||'STUDIO'; if(!BACK[BG])BG='STUDIO';
  const setBack=n=>{ BG=n; const b=BACK[n]; scene.background=new THREE.Color(b.bg); floorMat.color.set(b.fl); grid.visible=b.grid; hemi.intensity=b.sky; sun.intensity=b.sun; sun.color.set(b.sc||'#fff1dc'); store.set('market-avback',n); drawAll(); };
  const SHD=[['NONE',0],['SHADED',1],['SELF',2]];
  $('#p-view').append(h3('LOOK FROM'),el('div',{class:'grid'},...Object.keys(VIEWS).map(n=>btn(n,()=>goView(n)))),
    h3('TURNTABLE'),el('div',{class:'row'},btn('ON',()=>{ ORB.spin=true; bar(); },()=>ORB.spin),btn('OFF',()=>{ ORB.spin=false; bar(); },()=>!ORB.spin)),
    slider('v-spin','SPEED',.05,3,.05,()=>ORB.spinV,v=>{ ORB.spinV=v; },v=>Math.round(v*57)+'°/S'),
    h3('CAMERA'),el('div',{class:'row'},btn('THE GAME\'S VIEW',()=>{ ORB.persp=false; },()=>!ORB.persp),btn('LENS',()=>{ ORB.persp=true; },()=>ORB.persp)),
    h3('PIXELS'),el('div',{class:'grid'},...PXS.map(([l,v])=>btn(l,()=>{ PX=v; store.set('market-avpx',v); resize(); drawAll(); },()=>PX===v))),
    h3('BACKDROP'),el('div',{class:'grid'},...Object.keys(BACK).map(n=>btn(n,()=>setBack(n),()=>BG===n))),
    h3('SHADOWS ON HIM'),el('div',{class:'row'},...SHD.map(([l,v])=>btn(l,()=>{ W3.lv.value=v; store.set('market-avlv',v); drawAll(); },()=>W3.lv.value===v))),
    el('div',{class:'row'},btn('SHADOW ON THE FLOOR',()=>{ sun.castShadow=!sun.castShadow; drawAll(); },()=>sun.castShadow)));
  { const v=store.get('market-avlv'); if(v!=null)W3.lv.value=v; }

  const PAT={PLAIN:0,STRIPES:1,PLAID:2,DENIM:3,KNIT:4,CAMO:5,DOTS:6};
  const HAIR={SHORT:0,LONG:1,BUN:2,PONYTAIL:3,BALD:4}, EYES={DOTS:0,WHITES:1,BIG:2,'HALF-LIDDED':3,LASHES:4,SMILING:5};
  const pat=(t,c2,s=1)=>({t:PAT[t],s,c2});
  const OUTFITS={
    'THE WALKER':{c:{},pat:[pat('PLAIN','#3a2a2a'),pat('PLAIN','#1e2a44'),pat('PLAIN','#e8e2d6')]},
    'DENIM DAY':{c:{shirt:'#e8e6e0',pants:'#3a5a8a',shoes:'#e8e2d6'},pat:[pat('PLAIN','#3a2a2a'),pat('DENIM','#1e2a44',1.2),pat('PLAIN','#e8e2d6')]},
    'LUMBERJACK':{hair:'SHORT',c:{shirt:'#a83a32',pants:'#3a5a8a',shoes:'#77614a'},pat:[pat('PLAID','#1d1d1d',1.2),pat('DENIM','#1e2a44'),pat('PLAIN','#e8e2d6')]},
    'SAILOR':{c:{shirt:'#ecebe6',pants:'#2a3a6a',shoes:'#2c2a28'},pat:[pat('STRIPES','#2a3a6a',1.4),pat('PLAIN','#1e2a44'),pat('PLAIN','#e8e2d6')]},
    'KNIT SWEATER':{c:{shirt:'#c9a25a',pants:'#5a4634',shoes:'#77614a'},pat:[pat('KNIT','#8e6a3a',1.2),pat('PLAIN','#1e2a44'),pat('PLAIN','#e8e2d6')]},
    'CAMO':{c:{shirt:'#5a6a3a',pants:'#5a6a3a',shoes:'#3a3228'},pat:[pat('CAMO','#33381f'),pat('CAMO','#33381f'),pat('PLAIN','#e8e2d6')]},
    'POLKA DOTS':{c:{shirt:'#d6336c',pants:'#2a2a2e',shoes:'#e0dcd4'},pat:[pat('DOTS','#f4f0e8',1.3),pat('PLAIN','#1e2a44'),pat('PLAIN','#e8e2d6')]},
    'OFFICE':{c:{shirt:'#e8e6e0',pants:'#2a2a2e',shoes:'#2c2a28'},pat:[pat('PLAIN','#3a2a2a'),pat('PLAIN','#1e2a44'),pat('PLAIN','#e8e2d6')]},
    'PUNK':{c:{shirt:'#303034',pants:'#303034',shoes:'#a83a32'},pat:[pat('PLAIN','#3a2a2a'),pat('PLAID','#a83a32',1.4),pat('PLAIN','#e8e2d6')]},
    'GOTH':{eyes:'HALF-LIDDED',hair:'LONG',c:{skin:'#f1e2d8',hair:'#141414',shirt:'#161618',pants:'#161618',shoes:'#0e0e0e'},pat:[pat('PLAIN','#3a2a2a'),pat('STRIPES','#3a1020',2),pat('PLAIN','#e8e2d6')]},
    'SPORTY':{hair:'PONYTAIL',c:{shirt:'#a83a32',pants:'#1d1f24',shoes:'#f4f4f2'},pat:[pat('STRIPES','#f4f0e8',.7),pat('PLAIN','#1e2a44'),pat('PLAIN','#e8e2d6')]},
    'WINTER':{c:{shirt:'#2e6f5e',pants:'#3a3a3a',shoes:'#4a3020'},pat:[pat('KNIT','#e8e2d6',1.1),pat('PLAIN','#1e2a44'),pat('PLAIN','#e8e2d6')]},
    'FARMER':{c:{shirt:'#c8463b',pants:'#3b5c8c',shoes:'#5a3a20'},pat:[pat('PLAID','#e8dcc0',1.1),pat('DENIM','#1e2a44'),pat('PLAIN','#e8e2d6')]},
    'ROYAL':{c:{shirt:'#7d1f3a',pants:'#e8dcc0',shoes:'#3a2a20'},pat:[pat('STRIPES','#e3b341',3),pat('PLAIN','#1e2a44'),pat('PLAIN','#e8e2d6')]},
    'CHEF':{c:{shirt:'#f6f6f6',pants:'#2a2a2a',shoes:'#1b1b1b'},pat:[pat('PLAIN','#3a2a2a'),pat('PLAID','#e8e6e0',.8),pat('PLAIN','#e8e2d6')]},
    'NINJA':{hair:'BALD',eyes:'DOTS',c:{shirt:'#1a1a22',pants:'#1a1a22',shoes:'#121218',skin:'#1a1a22'},pat:[pat('PLAIN','#3a2a2a'),pat('PLAIN','#1e2a44'),pat('PLAIN','#e8e2d6')]},
    'ZOMBIE':{eyes:'WHITES',c:{skin:'#8fae7e',shirt:'#6b6f5a',pants:'#4a4438',hair:'#2b2b2b'},pat:[pat('CAMO','#4a4a3a',2),pat('PLAIN','#1e2a44'),pat('PLAIN','#e8e2d6')]},
    'ROBOT':{hair:'BALD',eyes:'DOTS',c:{skin:'#9aa3ad',shirt:'#6c7680',pants:'#6c7680',shoes:'#3a4048',eye:'#39d0ff'},pat:[pat('STRIPES','#4a525c',.6),pat('PLAIN','#1e2a44'),pat('PLAIN','#e8e2d6')],rim:.45},
    'ALIEN':{hair:'BALD',eyes:'BIG',c:{skin:'#9b7ad6',shirt:'#c0c8d0',pants:'#c0c8d0',shoes:'#5a6470',eye:'#111111'},pat:[pat('PLAIN','#3a2a2a'),pat('PLAIN','#1e2a44'),pat('PLAIN','#e8e2d6')],rim:.3},
    'BEACH':{c:{shirt:'#e8c547',pants:'#3fa7a0',shoes:'#c2905a'},pat:[pat('DOTS','#e8453c',.9),pat('STRIPES','#f4f0e8',1.2),pat('PLAIN','#e8e2d6')]},
    'MARKET VENDOR':{hair:'BUN',c:{shirt:'#2e6f5e',pants:'#6b4329',shoes:'#3a2a20'},pat:[pat('STRIPES','#e8dcc0',1.6),pat('PLAIN','#1e2a44'),pat('PLAIN','#e8e2d6')]},
    'DETECTIVE':{c:{shirt:'#8a7356',pants:'#4a4036',shoes:'#2a1f18'},pat:[pat('PLAID','#5b4a38',1.5),pat('PLAIN','#1e2a44'),pat('PLAIN','#e8e2d6')]},
  };
  const SHADES={'THE GAME\'S':{s:4,d:.78,sm:true},'PIXEL STEPS':{s:3,d:.7,sm:false},'COMIC':{s:2,d:.62,sm:false,ol:true,oc:'#101014',ow:2},'SOFT':{s:4,d:.4,sm:true},'DRAMATIC':{s:5,d:.95,sm:true,rim:.5},'GLOW EDGE':{s:4,d:.7,sm:true,rim:.85},'FLAT (HIS OWN LIGHT)':{flat:true}};
  const wear=(name)=>{ const O=OUTFITS[name], w=AV.whole(); const L=w.looks; L.cx={...(L.cx||{})}; const prev=store.get('market-avoutfit')||{};
    for(const k in prev.cx||{}){ if(prev.cx[k]==null)delete L.cx[k]; else L.cx[k]=prev.cx[k]; } if(prev.hair!=null)L.hair=prev.hair; if(prev.eyes!=null)L.eyes=prev.eyes;
    const was={cx:{}}; for(const k of ['skin','eye','hair'])if(k in O.c)was.cx[k]=L.cx[k]??null; if(O.hair)was.hair=L.hair; if(O.eyes)was.eyes=L.eyes; store.set('market-avoutfit',was);
    if(name==='THE WALKER'){ L.cx={}; Object.assign(L,{skin:1,hairc:1,eye:0,shirt:0,pants:0,shoes:0}); store.set('market-avoutfit',{}); }
    for(const k in O.c)L.cx[k]=O.c[k]; if(O.hair)L.hair=HAIR[O.hair]; if(O.eyes)L.eyes=EYES[O.eyes];
    w.av.pat=O.pat.map(p=>({...p})); w.av.rim=O.rim||0; delete w.shape; AV.put(w); drawAll(); toast(name); };
  const shadeAs=name=>{ const S=SHADES[name], w=AV.whole(); if(S.flat){ UI.setLit(false); drawAll(); return; } UI.setLit(true); W3.setShade(S.s,S.d,S.sm);
    w.av.rim=S.rim||0; if(S.oc){ w.av.oc=S.oc; w.av.ow=S.ow; } w.outline=!!S.ol; delete w.shape; delete w.looks; w.shade=W3.shade; AV.put(w); drawAll(); toast(name+' shading'); };
  const pick=a=>a[(Math.random()*a.length)|0];
  const randomize=()=>{ const w=AV.whole(), L=w.looks, P=LOOKS.PAL; L.hair=(Math.random()*5)|0; L.eyes=(Math.random()*6)|0; L.cx={};
    for(const k of ['skin','hairc','eye','shirt','pants','shoes'])L[k]=(Math.random()*5)|0;
    const anyC=()=>'#'+new THREE.Color().setHSL(Math.random(),.35+Math.random()*.4,.25+Math.random()*.45).getHexString(); if(Math.random()<.6)L.cx.shirt=anyC(); if(Math.random()<.4)L.cx.pants=anyC();
    w.av.pat=w.av.pat.map(p=>({...p,t:Math.random()<.45?(1+(Math.random()*6|0)):0,c2:anyC(),s:.7+Math.random()})); delete w.shape; AV.put(w);
    if(Math.random()<.5)LOOKS.setBuild(Math.random()<.5?0:1); BODYTYPE(pick(Object.keys(BODYTYPES))); AV.open(); drawAll(); toast('Someone new'); };
  $('#p-looks').append(h3('BODY'),el('div',{class:'row'},btn('MALE',()=>{ ED.snap(); LOOKS.setBuild(0); AV.open(); drawAll(); },()=>LOOKS.L.build===0),btn('FEMALE',()=>{ ED.snap(); LOOKS.setBuild(1); AV.open(); drawAll(); },()=>LOOKS.L.build===1)),
    el('div',{class:'grid'},...Object.keys(BODYTYPES).map(n=>btn(n,()=>{ ED.snap(); BODYTYPE(n); if(AV.drawBT)AV.drawBT(); drawAll(); },()=>BODYTYPE()===n))),
    h3('OUTFITS'),dim('his colours, hair, eyes and the patterns woven on him; his body and shape stay'),el('div',{class:'grid'},...Object.keys(OUTFITS).map(n=>btn(n,()=>wear(n)))),
    h3('SHADING'),el('div',{class:'grid'},...Object.keys(SHADES).map(n=>btn(n,()=>shadeAs(n)))),
    h3('ANYONE'),el('div',{class:'row'},btn('SOMEONE NEW',randomize)),
    dim('every look in detail (hair, eyes, each colour, the patterns, the outline, the light, sculpting, every piece\'s size): the avatar editor at the right'));

  let DL=null; (async()=>{ try{ if(window.claude&&window.claude.use)DL=await window.claude.use('downloads'); }catch(e){ DL=null; } })();
  const saveFile=async(name,data)=>{ if(DL){ try{ await DL.save({filename:name,data}); toast('Saved '+name); }catch(e){ toast(e&&e.code==='declined'?'Save cancelled':'Could not save '+name+(e&&e.message?': '+e.message:'')); } return; }
    const url=URL.createObjectURL(data instanceof Blob?data:new Blob([data])), a=document.createElement('a'); a.href=url; a.download=name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),5000); toast('Downloaded '+name); };
  const CRC=(()=>{ const t=new Uint32Array(256); for(let n=0;n<256;n++){ let c=n; for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1; t[n]=c>>>0; } return t; })();
  const crc32=u=>{ let c=0xFFFFFFFF; for(let i=0;i<u.length;i++)c=CRC[(c^u[i])&255]^(c>>>8); return (c^0xFFFFFFFF)>>>0; };
  const zip=files=>{ const enc=new TextEncoder(), parts=[], cen=[]; let off=0;
    for(const f of files){ const name=enc.encode(f.name), d=f.data, crc=crc32(d), h=new DataView(new ArrayBuffer(30)), c=new DataView(new ArrayBuffer(46));
      h.setUint32(0,0x04034b50,true); h.setUint16(4,20,true); h.setUint16(12,0x21,true); h.setUint32(14,crc,true); h.setUint32(18,d.length,true); h.setUint32(22,d.length,true); h.setUint16(26,name.length,true);
      c.setUint32(0,0x02014b50,true); c.setUint16(4,20,true); c.setUint16(6,20,true); c.setUint16(14,0x21,true); c.setUint32(16,crc,true); c.setUint32(20,d.length,true); c.setUint32(24,d.length,true); c.setUint16(28,name.length,true); c.setUint32(42,off,true);
      parts.push(new Uint8Array(h.buffer),name,d); cen.push(new Uint8Array(c.buffer),name); off+=30+name.length+d.length; }
    const sz=cen.reduce((a,b)=>a+b.length,0), e=new DataView(new ArrayBuffer(22)); e.setUint32(0,0x06054b50,true); e.setUint16(8,files.length,true); e.setUint16(10,files.length,true); e.setUint32(12,sz,true); e.setUint32(16,off,true);
    return new Blob([...parts,...cen,new Uint8Array(e.buffer)],{type:'application/zip'}); };
  const fname=ext=>((LOOKS.L.name||'walker').replace(/[^\w-]+/g,'_').toLowerCase()||'walker')+ext;
  const posed=()=>{ const g=W3.mesh.geometry, P=g.attributes.position.array, N=g.attributes.normal.array, C=g.attributes.color.array, PI=g.attributes.pidx.array, I=g.index.array;
    W3.group.updateMatrixWorld(true); const GW=W3.group.matrixWorld, M=W3.PM.value.map(m=>new THREE.Matrix4().multiplyMatrices(GW,m)), NM=M.map(m=>new THREE.Matrix3().getNormalMatrix(m)), k=1.75/(52*ZU*W3.SZ);
    const n=I.length, pos=new Float32Array(n*3), nor=new Float32Array(n*3), col=new Float32Array(n*3), v=new THREE.Vector3();
    for(let q=0;q<n;q++){ const i=I[q], p=PI[i]|0; v.set(P[i*3],P[i*3+1],P[i*3+2]).applyMatrix4(M[p]).multiplyScalar(k); pos.set([v.x,v.y,v.z],q*3); v.set(N[i*3],N[i*3+1],N[i*3+2]).applyMatrix3(NM[p]).normalize(); nor.set([v.x,v.y,v.z],q*3); col.set([C[i*3],C[i*3+1],C[i*3+2]],q*3); }
    return {pos,nor,col,n}; };
  const exportGLB=()=>{ toast('Packing the GLB...'); const {pos,nor,col}=posed(), g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('normal',new THREE.BufferAttribute(nor,3)); g.setAttribute('color',new THREE.BufferAttribute(col,3));
    const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.85})); m.name=LOOKS.L.name||'walker';
    new GLTFExporter().parse(m,glb=>saveFile(fname('-glb.zip'),zip([{name:fname('.glb'),data:new Uint8Array(glb)}])),err=>toast('GLB failed: '+err.message),{binary:true}); };
  const exportOBJ=()=>{ const {pos,col,n}=posed(), L=['# The Market\'s Walker, '+MODE.name+', metres, vertex colours'], c=new THREE.Color();
    for(let q=0;q<n;q++){ c.setRGB(col[q*3],col[q*3+1],col[q*3+2]).convertLinearToSRGB(); L.push('v '+pos[q*3].toFixed(5)+' '+pos[q*3+1].toFixed(5)+' '+pos[q*3+2].toFixed(5)+' '+c.r.toFixed(3)+' '+c.g.toFixed(3)+' '+c.b.toFixed(3)); }
    for(let q=0;q<n;q+=3)L.push('f '+(q+1)+' '+(q+2)+' '+(q+3)); saveFile(fname('-obj.zip'),zip([{name:fname('.obj'),data:new TextEncoder().encode(L.join('\n'))}])); };
  const shot=()=>{ draw(0); return new Promise(r=>renderer.domElement.toBlob(r,'image/png')); };
  const exportSheet=async()=>{ const keep={...ORB}, kb=BG, kpx=PX, km={kind:MODE.kind,name:MODE.name,key:MODE.key}; setBack('VOID'); setPose('SPREAD OUT'); MODE.Pnow=MODE.P; PX=1; resize(); ORB.persp=false; ORB.spin=false;
    const cv=renderer.domElement, W=cv.width, h=cv.height, w=Math.min(W,Math.round(h*.8)), x0=Math.round((W-w)/2), c=document.createElement('canvas'); c.width=w*3; c.height=h; const x=c.getContext('2d'); x.imageSmoothingEnabled=false;
    [[0,'FRONT'],[Math.PI/2,'SIDE'],[Math.PI,'BACK']].forEach(([y,l],i)=>{ Object.assign(ORB,{yaw:y,pitch:.08,size:1.45,tx:0,ty:1.15*(W3.BH||1),tz:0}); draw(0); x.drawImage(cv,x0,0,w,h,i*w,0,w,h); x.fillStyle='#f2c14e'; x.font=Math.round(h/34)+'px monospace'; x.fillText(l,i*w+14,Math.round(h/22)); });
    Object.assign(ORB,keep); PX=kpx; setBack(kb); if(km.kind==='pose')setPose(km.name,km.key); else if(km.kind==='sit')sit(); else live(); resize(); c.toBlob(b=>saveFile(fname('-sheet.png'),b),'image/png'); };
  const fileIn=el('input',{type:'file',accept:'.json,application/json',hidden:true,on:{change:async e=>{ const f=e.target.files[0]; if(!f)return; try{ loadAny(JSON.parse(await f.text()),f.name); }catch(err){ toast('That file isn\'t one of his: '+err.message); } e.target.value=''; }}});
  const loadAny=(o,nm)=>{ if(o&&o.v===1&&(o.looks||o.shape||o.av)){ AV.put(o); toast('Wearing '+nm); }
    else if(o&&o.v===1&&o.n!=null&&o.E){ ED.unpack(o); toast('His shape from '+nm); }
    else if(o&&(o.walk||o.ov||o.custom)){ SAVE.set('moves',JSON.stringify(o)); toast('His moves from '+nm+': opening again with them'); setTimeout(()=>location.reload(),900); }
    else throw new Error('no avatar, shape or moves in it'); drawAll(); };
  $('#p-files').append(h3('FOR THE GAME'),dim('each loads in the game\'s own editor: the avatar file in the avatar editor\'s PRESETS (LOAD A FILE), his shape in HIS SHAPE (LOAD), his moves in ANIMATE (LOAD MOVES)'),
    el('div',{class:'grid'},btn('AVATAR FILE',()=>saveFile(fname('-avatar.json'),JSON.stringify(AV.whole()))),btn('HIS SHAPE',()=>saveFile(fname('-shape.json'),JSON.stringify(ED.pack()))),
      btn('HIS MOVES',()=>saveFile(fname('-moves.json'),SAVE.get('moves')||JSON.stringify({walk:{...R.WALK},run:{...R.RUN},ov:{},custom:[]})))),
    h3('TO USE ELSEWHERE'),el('div',{class:'grid'},btn('GLB (POSED)',exportGLB),btn('OBJ (POSED)',exportOBJ),btn('PICTURE',async()=>saveFile(fname('.png'),await shot())),btn('CHARACTER SHEET',exportSheet)),
    dim('GLB and OBJ: him as he stands now, in metres, his colours on him, zipped. The sheet: front, side and back, spread out on black, at full pixels.'),
    h3('OPEN'),el('div',{class:'row'},btn('OPEN A FILE...',()=>fileIn.click()),fileIn),dim('an avatar file, a shape or moves, from here or from the game'));

  const bar=()=>{ $('#yaw').value=Math.round(((ORB.yaw/D+540)%360)-180); $('#pitch').value=Math.round(ORB.pitch/D); $('#zoom').value=Math.round(100*(1-Math.log(ORB.size/.25)/Math.log(16))); $('#spin').setAttribute('aria-pressed',String(ORB.spin)); };
  AVE.bar=bar; REF.push(bar);
  $('#yaw').oninput=e=>{ ORB.yaw=+e.target.value*D; ORB.spin=false; bar(); }; $('#pitch').oninput=e=>{ ORB.pitch=+e.target.value*D; };
  $('#zoom').oninput=e=>{ ORB.size=.25*Math.pow(16,1-(+e.target.value)/100); }; $('#spin').onclick=()=>{ ORB.spin=!ORB.spin; bar(); drawAll(); };
  const cv=renderer.domElement; let drag=null;
  cv.addEventListener('contextmenu',e=>e.preventDefault());
  cv.addEventListener('pointerdown',e=>{ if(e.button===0&&ED.on)return; drag={x:e.clientX,y:e.clientY,pan:e.button===1||e.shiftKey}; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove',e=>{ if(!drag)return; const dx=e.clientX-drag.x, dy=e.clientY-drag.y; drag.x=e.clientX; drag.y=e.clientY; (drag.pan?UI.pan:UI.orbit)(dx,dy); });
  const up=()=>{ drag=null; }; cv.addEventListener('pointerup',up); cv.addEventListener('pointercancel',up);
  cv.addEventListener('wheel',e=>{ e.preventDefault(); ORB.size=Math.max(.12,Math.min(5,ORB.size*Math.exp(e.deltaY*.0012))); bar(); },{passive:false});
  addEventListener('keydown',e=>{ if(e.target.matches('input[type=text],textarea'))return; const k=e.key;
    if((e.ctrlKey||e.metaKey)&&k.toLowerCase()==='z'){ e.preventDefault(); ED.undo(); AV.open(); return; }
    if(k==='t'||k==='T'){ ORB.spin=!ORB.spin; bar(); drawAll(); }
    if(k==='q'||k==='Q'){ ORB.yaw+=Math.PI/4; bar(); } if(k==='e'||k==='E'){ ORB.yaw-=Math.PI/4; bar(); }
    if(k==='0')goView('3/4'); });
  document.querySelectorAll('[data-swap]').forEach(b=>{ b.onclick=()=>{ document.body.classList.toggle('show-av',b.dataset.swap==='av'); drawAll(); }; REF.push(()=>b.setAttribute('aria-pressed',String(document.body.classList.contains('show-av')===(b.dataset.swap==='av')))); });
  document.body.classList.add('show-av');

  function resize(){ const w=Math.max(1,innerWidth), h=Math.max(1,innerHeight), r=1/PX; renderer.setPixelRatio(r); renderer.setSize(w,h,false); composer.setPixelRatio(r); composer.setSize(w,h); RW=w; RH=h; }
  addEventListener('resize',resize); AVE.resize=resize;
  const mid=new THREE.Vector3();
  function draw(dt){
    let B, y=0;
    if(ED.anim)B=ED.animPose();
    else if(MODE.kind==='pose'){ const k=Math.min(1,dt*9); MODE.Pnow=MODE.Pnow?lerpDeep(MODE.Pnow,MODE.P,k):MODE.P; MODE.airNow+=(MODE.air-MODE.airNow)*k; B=R.build(MODE.Pnow,null); y=(groundOf(B)+MODE.airNow)*UNIT(); }
    else if(MODE.kind==='sit'){ const s=R.create(); s.sit={z:SEAT}; B=R.pose(s,true); stool.scale.y=SEAT*UNIT(); stool.position.set(0,SEAT*UNIT()/2,-.12); }
    else { R.step(st,dt); B=R.pose(st,true); MODE.Pnow=null;
      if(MODE.loop&&!st.move&&!st.up&&!st.out){ MODE.wait+=dt; if(MODE.wait>.5){ MODE.wait=0; playMove(MODE.loop); } } else MODE.wait=0;
      if(MODE.cur&&!st.move&&!st.up&&!MODE.loop&&MODE.name===NICE(MODE.cur)){ MODE.name='LIVE'; MODE.cur=null; drawAll(); } }
    MODE.B=B; W3.place(B,0,y,0,heading,heading,ZU); LOOKS.light(); if(ED.on)ED.tick();
    if(ORB.spin){ ORB.yaw+=ORB.spinV*dt; }
    const w=RW, h=RH, a=w/h; cam=ORB.persp?camP:camO; mid.set(ORB.tx,ORB.ty,ORB.tz);
    const dir=new THREE.Vector3(Math.cos(ORB.pitch)*Math.sin(ORB.yaw),Math.sin(ORB.pitch),Math.cos(ORB.pitch)*Math.cos(ORB.yaw));
    if(ORB.persp){ const d=ORB.size/Math.tan(camP.fov*D/2); camP.aspect=a; camP.position.copy(mid).addScaledVector(dir,d); camP.updateProjectionMatrix(); ppu=h/(2*ORB.size); }
    else { camO.left=-ORB.size*a; camO.right=ORB.size*a; camO.top=ORB.size; camO.bottom=-ORB.size; camO.position.copy(mid).addScaledVector(dir,30); camO.updateProjectionMatrix(); ppu=h/(2*ORB.size); }
    cam.up.set(0,1,0); cam.lookAt(mid); cam.updateMatrixWorld(); composer.passes[0].camera=cam;
    sun.target.position.set(0,1,0);
    W3.shadowPass(renderer); if(OUTL.on)OUTL.render(renderer,scene,cam); composer.render(); if(AVE.after)AVE.after(); }
  AVE.draw=draw;
  let last=performance.now(), n=0;
  function frame(now){ const dt=Math.min(.05,(now-last)/1000); last=now; draw(dt); if(ORB.spin&&(++n%6===0))bar(); requestAnimationFrame(frame); }
  setBack(BG); resize(); showTab(tab); setPose('SPREAD OUT'); MODE.Pnow=MODE.P; goView('3/4'); drawAll();
  document.getElementById('loading').hidden=true; requestAnimationFrame(frame);
  Object.assign(window,{W3,ED,LOOKS,AV,SAVE});
  window.AVE=AVE; AVE.goView=goView; AVE.playMove=playMove; AVE.gait=gait; AVE.wear=wear; AVE.shadeAs=shadeAs; AVE.sit=sit; AVE.ORB=ORB; AVE.setBack=setBack; AVE.exportSheet=exportSheet; AVE.moveNames=moveNames;
}
