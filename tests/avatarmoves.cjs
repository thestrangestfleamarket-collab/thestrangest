// THE AVATAR'S MOVES (owner, 5 Nov 2026: "redo all the moves and make sure they look right and function correctly in game"): node tests/avatarmoves.cjs [out folder].
// Every move the rig has (its own and the recorded ones) played on you, the avatar: through each, the avatar's lowest point stays with the rig's (a cartwheel on its
// hands, a roll, a sit, a jump in the air), measured from standing, and never under the ground where the rig sinks into it. With an out folder, a sheet of every move at the frame furthest off, to look at.
const {chromium}=require('playwright'); const OUT=process.argv[2], TOL=+(process.env.TOL||2.5);
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:960,height:640}}); const errs={}; let bad=0;
  pg.on('pageerror',e=>{ const k=e.message.slice(0,160); errs[k]=(errs[k]||0)+1; });
  const rec=(n,ok,i)=>{ if(!ok)bad++; console.log((ok?'PASS ':'FAIL ')+n+(i?'  · '+i:'')); };
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=12&at=80,95',{timeout:240000}); await pg.waitForFunction(()=>window.__started,null,{timeout:300000});
  await pg.evaluate(async()=>{ for(let i=0;i<150&&!AVATAR.ready();i++)await new Promise(r=>setTimeout(r,300)); if(window.PB)PB.set(false);
    const L=AVATAR.L(); L.w={}; await AVATAR.set({f:'m',b:1,h:100}); const pick=(s,l)=>{ const o=[...document.querySelectorAll('#lav-'+s+' option')].find(x=>x.textContent===l); return o?+o.value:null; };
    for(const [s,l] of [['hair','SHORT'],['top','T-SHIRT'],['bottom','TROUSERS'],['feet','SNEAKERS']])await AVATAR.wear(s,pick(s,l));
    await MOTION.play('nod',{share:false}).catch(()=>{});   // (the recorded moves come with their data)
    const R=RIG, st=__dbg.ST, raf=()=>new Promise(r=>requestAnimationFrame(r));
    const me=()=>W3.group.children.find(m=>m.geometry===BODIES.by.avatar.GEO), M=new __dbg.THREE.Matrix4(), V=new __dbg.THREE.Vector3();
    // the avatar's lowest point and the rig's, in the rig's space (its ground at 0)
    window.__low=()=>{ const m=me(); if(!m)return null; const P=m.userData.PM.value, A=m.geometry.attributes, p=A.position.array, bi=A.bi.array, bw=A.bw.array; let lo=1e9; const LV=new __dbg.THREE.Vector3();
      for(let i=0;i<A.position.count;i+=3){ const a=P[bi[i*2]|0], c=P[bi[i*2+1]|0], w=bw[i]; for(let k=0;k<16;k++)M.elements[k]=a.elements[k]*w+c.elements[k]*(1-w); V.set(p[i*3],p[i*3+1],p[i*3+2]).applyMatrix4(M); if(V.y<lo){ lo=V.y; LV.copy(V); } }
      const B=W3.lastB; if(!B)return null; let rl=1e9; for(const k in B.J)rl=Math.min(rl,B.J[k].y); const g=W3.group; g.updateMatrixWorld(true); LV.applyMatrix4(g.matrixWorld);
      return {av:lo,rig:rl,off:lo-rl,floor:lo+(SHARED.groundY(LV.x,LV.z)-LV.y)/g.scale.y,blend:(st._mw||0)>0}; };   // (floor: the ground under its lowest point, as the game reads it)
    // a tile of the sheet: the avatar from its side, the ground under its standing feet a green line
    window.__tile=n=>{ const THREE=__dbg.THREE, renderer=__dbg.renderer, g=W3.group, W=150, H=210, cols=8, rt=new THREE.WebGLRenderTarget(W,H); rt.texture.colorSpace=THREE.SRGBColorSpace; const cam=new THREE.OrthographicCamera(-1,1,1,-1,.01,200), ry=g.rotation.y;
      g.updateMatrixWorld(true); const gp=g.getWorldPosition(new THREE.Vector3()), hh=window.__hh, ww=hh*W/H; cam.left=-ww/2; cam.right=ww/2; cam.top=hh*.72; cam.bottom=-hh*.28; cam.updateProjectionMatrix();
      cam.position.set(gp.x+Math.sin(ry+Math.PI/2)*20,gp.y,gp.z+Math.cos(ry+Math.PI/2)*20); cam.lookAt(gp.x,gp.y,gp.z); cam.updateMatrixWorld(true); DESIGN.portrait(rt,cam);
      const px=new Uint8Array(W*H*4); renderer.readRenderTargetPixels(rt,0,0,W,H,px); rt.dispose(); let cv=document.getElementById('__sheet');
      if(!cv){ cv=document.createElement('canvas'); cv.id='__sheet'; cv.width=W*cols; cv.height=H*Math.ceil(window.__nm/cols); cv.style.cssText='position:fixed;left:0;top:0;z-index:999;background:#123'; document.body.appendChild(cv); window.__k=0; }
      const c=cv.getContext('2d'), im=c.createImageData(W,H); for(let y=0;y<H;y++)im.data.set(px.subarray((H-1-y)*W*4,(H-y)*W*4),y*W*4); const k=window.__k++, x0=(k%cols)*W, y0=Math.floor(k/cols)*H; c.putImageData(im,x0,y0);
      c.fillStyle='#ff0'; c.font='11px monospace'; c.fillText(n,x0+3,y0+12); c.fillStyle='#3f3'; c.fillRect(x0,y0+Math.round(H*.72),W,1); };
    window.__moves=()=>Object.keys(R.MOVES);
    window.__play=async name=>{ for(let i=0;i<20;i++)await raf(); const s0=__low(); if(window.__c==null)window.__c=s0.off; R.begin(st,name); const out={name,max:0,at:0,n:0}; let t0=performance.now();
      let shot=!window.__nm;
      while(st.move&&st.move.name===name&&performance.now()-t0<12000){ await raf(); if(!shot&&st.move&&st.move.t>=st.move.def.dur*.4){ shot=true; __tile(name); } const l=__low(); if(!l||l.blend)continue;   // (not while it crossfades from its clips)
      out.n++; const e=Math.abs(l.av-(st.move&&st.move.def.below!=null/*a pull-up from below a ledge: with the rig*/?l.rig+__c:Math.max(l.rig+__c,l.floor-.3))); if(e>out.max){ out.max=e; out.at=st.move?st.move.t:0; out.l=l; } }
      if(st.move&&st.move.name===name)st.move.t=st.move.def.dur; for(let i=0;i<30;i++)await raf(); out.max=+out.max.toFixed(2); return out; }; });
  const moves=(await pg.evaluate(()=>__moves())).filter(n=>n!=='mantle'); console.log(moves.length+' moves');   // (not the mantle: it pulls you up a ledge, begun only at one: a ladder's top, a tree)
  if(OUT)await pg.evaluate(n=>{ window.__nm=n; const THREE=__dbg.THREE, g=W3.group; g.updateMatrixWorld(true); window.__hh=(W3.eyeAt(new THREE.Vector3()).y-g.getWorldPosition(new THREE.Vector3()).y)*1.5; },moves.length);
  const res=[]; for(const n of moves){ const r=await pg.evaluate(n=>__play(n),n).catch(e=>({name:n,err:e.message})); res.push(r); }
  const off=res.filter(r=>r.err||!(r.max<=TOL));
  rec('every move ('+res.length+') keeps the avatar on what the rig stands on (within '+TOL+' of standing; rig units, 52 a body)',!off.length,off.map(r=>r.name+' '+(r.err||r.max+' at t '+(+r.at).toFixed(2))).join(' | ')||'worst '+res.reduce((a,r)=>r.max>a.max?r:a,{max:0}).name);
  console.log(res.map(r=>r.name+' '+(r.err||r.max)).join('\n'));
  if(OUT){ const el=await pg.$('#__sheet'); if(el)await el.screenshot({path:OUT+'/avatar-moves.png'}); }
  const E=Object.entries(errs); rec('no page errors',!E.length,E.map(([k,n])=>n+'× '+k).join(' | '));
  console.log(bad?bad+' FAILED':'ALL PASS'); await b.close(); process.exit(bad?1:0); })();
