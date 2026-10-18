// THE AUTUMN MIST MOOD, A LOOK (owner, 18 Oct 2026, his picture of a misty autumn forest: "show me screenshots of how my game could look like this"):
// nothing in the game changed; the mood is laid on in the page for the shot: the lawns' treetops in autumn colours crown by crown, a teal mist
// (the world's fog, in its flat steps), a dark teal sky, embers and fireflies (unlit square specks, no glow). node tests/moodshot.cjs <out>
const {chromium}=require('playwright'), out=process.argv[2]||'.';
const MOOD=o=>{ const {scene,THREE}=__dbg, T=__dbg.cv().TILE, h=(a,b)=>{ let x=(a*374761393+b*668265263)|0; x=(x^(x>>>13))*1274126177|0; return ((x^(x>>>16))>>>0)/4294967296; };
  const PAL=o.pal.map(c=>new THREE.Color().setRGB(c[0]/255,c[1]/255,c[2]/255,THREE.SRGBColorSpace)), M=new THREE.Matrix4(), V=new THREE.Vector3(), C=new THREE.Color(), G0=.42;
  const paint=me=>{ if(!me||me.userData.mood)return; me.userData.mood=1; const cr=o.crown*T;
    for(let i=0;i<me.count;i++){ me.getMatrixAt(i,M); V.setFromMatrixPosition(M); me.getColorAt(i,C); const k=Math.min(1.3,(C.g/G0)), gx=Math.floor(V.x/cr+h(Math.floor(V.z/cr),7)), gz=Math.floor(V.z/cr+h(gx,9));
      const p=PAL[Math.floor(h(gx,gz)*PAL.length)]; me.setColorAt(i,C.copy(p).multiplyScalar(k)); } me.instanceColor.needsUpdate=true; };
  setInterval(()=>WEEDS.chunks.forEach(paint),300); WEEDS.chunks.forEach(paint);
  FAR3.on=false; const tc=new THREE.Color(o.fog), d=__dbg.camera.position.distanceTo(new THREE.Vector3(...__dbg.pos())); scene.fog=new THREE.Fog(tc,d+o.near*T,d+o.far*T); scene.background=new THREE.Color(o.bg); if(window.SKY&&SKY.mesh)SKY.mesh.visible=false;
  // the specks: embers drifting down, fireflies wandering; one instanced draw of tiny boxes, unlit
  const N=o.specks, g=new THREE.BoxGeometry(.05*T,.05*T,.05*T), me=new THREE.InstancedMesh(g,new THREE.MeshBasicMaterial({fog:true}),N), S=[];
  const c=__dbg.pos(); for(let i=0;i<N;i++){ const ff=Math.random()<o.ffK; S.push({x:c[0]+(Math.random()-.5)*28*T,y:c[1]+(.2+Math.random()*(ff?2.5:7))*T,z:c[2]+(Math.random()-.5)*28*T,ff,ph:Math.random()*9});
    me.setColorAt(i,new THREE.Color().setRGB(...(ff?[.55,1,.45]:Math.random()<.5?[1,.45,.15]:[.95,.7,.2]))); }
  scene.add(me); let t=0; const step=()=>{ t+=.016; S.forEach((s,i)=>{ if(s.ff){ s.x+=Math.sin(t*.7+s.ph)*.004*T; s.z+=Math.cos(t*.5+s.ph*2)*.004*T; s.y+=Math.sin(t+s.ph)*.002*T; } else { s.y-=.006*T; s.x+=.004*T*Math.sin(t+s.ph); if(s.y<c[1])s.y+=7*T; }
    M.makeTranslation(s.x,s.y,s.z); me.setMatrixAt(i,M); }); me.instanceMatrix.needsUpdate=true; requestAnimationFrame(step); }; step(); };
const AUT=[[226,150,38],[240,196,64],[200,92,36],[176,52,44],[138,40,58],[214,170,52],[72,96,58],[44,74,62],[52,84,70],[190,120,40]];
const SHOTS=[ // name, hour, view, [yaw,pitch,ppu k], the mood (fog near/far in tiles from him; it starts a little before him)
  ['0-now-dusk',17.4,'map',[0.8,0.42,1.0],null],
  ['1-mist-dusk',17.4,'map',[0.8,0.42,1.0],{pal:AUT,crown:3,fog:0x3a6e68,bg:0x1d4644,near:-4,far:15,specks:260,ffK:.15}],
  ['2-mist-low',17.4,'map',[0.8,0.2,1.3],{pal:AUT,crown:3,fog:0x3a6e68,bg:0x1d4644,near:-3,far:12,specks:300,ffK:.15}],
  ['3-mist-iso',17.4,'iso',null,{pal:AUT,crown:3,fog:0x3a6e68,bg:0x1d4644,near:-4,far:16,specks:260,ffK:.15}],
  ['4-bluehour-fireflies',18.05,'map',[0.8,0.3,1.2],{pal:AUT,crown:3,fog:0x2f5f5a,bg:0x173c3c,near:-5,far:11,specks:260,ffK:.6}],
];
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:1000,height:620}});
  pg.on('pageerror',e=>console.log('pageerror:',e.message));
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1',{waitUntil:'commit',timeout:180000});
  for(let i=0;i<150;i++){ await pg.waitForTimeout(1000); if(await pg.evaluate(()=>!!window.__started).catch(()=>false))break; }
  const AT=await pg.evaluate(()=>{ const {BOD,PARK}=__dbg.MAPK; return [BOD.XS(PARK.round[0]+PARK.ox+18),BOD.ZS(PARK.round[1]+PARK.oy+12)]; }); console.log('at',AT);
  for(const [name,hr,view,cam,mood] of SHOTS){ await pg.goto('file://'+process.cwd()+`/dist/market.html?at=${AT}&hour=${hr}&view=${view}&fresh=1&wx=clear&hideme=1`,{waitUntil:'commit',timeout:180000});
    for(let i=0;i<150;i++){ await pg.waitForTimeout(1000); if(await pg.evaluate(()=>!!window.__started).catch(()=>false))break; } await pg.waitForTimeout(6000);
    if(cam)await pg.evaluate(c=>__dbg.cam(c[0],c[1],__dbg.cv().PPU*c[2]),cam);
    await pg.waitForTimeout(12000); if(mood)await pg.evaluate(MOOD,mood); await pg.waitForTimeout(6000);
    await pg.screenshot({path:`${out}/${name}.png`}); console.log(name,await pg.textContent('#stat').catch(()=>''),'tris',await pg.evaluate(()=>__dbg.tris())); }
  await b.close(); })();
