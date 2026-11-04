// EVERY CHARACTER STANDING STILL (owner, 18 Oct 2026, after the mushroom seller's crawling shadow: "now check other characters"): one of each kind
// brought beside you on the street and held still there, close in the map view; 12 frames a quarter second apart, and how many of the pixels in his
// box change from frame to frame. A still character changes none (his idle look round or a flame's flicker aside). node tests/stillcheck.cjs <out> [keys] [query]
const {chromium}=require('playwright'), out=process.argv[2]||'.', KEYS=(process.argv[3]||'fox,tomato,raincat,tvcat,scooterfrog,shark,squirrel,mushroom,hero_m,villager_f,ogre,ogre_mage,rat,frog,slime,snake,spider,wasp,dragon').split(','), q=process.argv[4]||'';
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:800,height:560}});
  pg.on('pageerror',e=>console.log('pageerror:',e.message));
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&wx=clear&hideme=1&hour=15.5&at=-2.2,3.2&view=map'+q,{waitUntil:'commit',timeout:180000});
  for(let i=0;i<150;i++){ await pg.waitForTimeout(1000); if(await pg.evaluate(()=>!!window.__started).catch(()=>false))break; } await pg.waitForTimeout(10000);
  await pg.evaluate(()=>{ window.__HOLD=null; setInterval(()=>{ const H=window.__HOLD; if(!H)return; const s=H.st; s.to=null; s.next=null; s.hold=true; s.wait=1e9; if(H.W){ H.W.state='stay'; H.W.t=1e9; } },16);
    __dbg.cam(0.6,0.5,__dbg.cv().PPU*3); });
  const rows=[];
  for(const key of KEYS){
    const ok=await pg.evaluate(k=>{ const T=__dbg.cv().TILE, p=__dbg.pos(); const N=[...__dbg.NPCS].find(n=>n&&n.key===k&&n.lv===__dbg.lvl()); if(!N||!N.st)return false;
      for(const n of [...__dbg.NPCS])if(n&&n!==N&&n.g&&n.lv===__dbg.lvl()&&n.st&&Math.hypot(n.g.position.x-p[0],n.g.position.z-p[2])<12*T){ n.st.x+=40*T; if(window.CITY&&CITY.stop)CITY.stop(n); }   // (everyone else sent off the picture)
      const W=(window.WALKERS&&WALKERS.list||[]).find(w=>w.N===N); if(window.CITY&&CITY.stop)CITY.stop(N); if(N.errand)N.errand=null; N.life=null;
      const x=p[0]+1.2*T, z=p[2]+.6*T; N.st.x=x; N.st.z=z; N.st.to=null; if(N.g){ N.g.position.x=x; N.g.position.z=z; } if(W){ W.state='stay'; W.t=1e9; N.dwell=null; } N.st.face=null;
      window.__HOLD={N,W,st:N.st}; return true; },key);
    if(!ok){ console.log(key,'not found'); continue; }
    await pg.waitForTimeout(5000);
    const box=await pg.evaluate(()=>{ const N=__HOLD.N, g=N.g, V=__dbg.THREE.Vector3, B=new __dbg.THREE.Box3().setFromObject(g), c=__dbg.camera, cv=__dbg.renderer.domElement.getBoundingClientRect(); let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
      for(const i of [0,1])for(const j of [0,1])for(const k of [0,1]){ const v=new V(i?B.max.x:B.min.x,j?B.max.y:B.min.y,k?B.max.z:B.min.z).project(c); const x=(v.x+1)/2*cv.width+cv.left, y=(1-v.y)/2*cv.height+cv.top; x0=Math.min(x0,x); x1=Math.max(x1,x); y0=Math.min(y0,y); y1=Math.max(y1,y); }
      return {x:Math.max(0,Math.floor(x0)),y:Math.max(0,Math.floor(y0)),w:Math.min(800,Math.ceil(x1))-Math.max(0,Math.floor(x0)),h:Math.min(560,Math.ceil(y1))-Math.max(0,Math.floor(y0))}; });
    if(!(box.w>4&&box.h>4)){ console.log(key,'off screen',JSON.stringify(box)); continue; }
    const shots=[]; for(let i=0;i<12;i++){ shots.push((await pg.screenshot({clip:{x:box.x,y:box.y,width:box.w,height:box.h}})).toString('base64')); await pg.waitForTimeout(250); }
    require('fs').writeFileSync(`${out}/${key}.png`,Buffer.from(shots[0],'base64')); require('fs').writeFileSync(`${out}/${key}-b.png`,Buffer.from(shots[2],'base64'));
    const d=await pg.evaluate(async bs=>{ const L=[]; for(const s of bs){ const im=new Image(); im.src='data:image/png;base64,'+s; await im.decode(); const c=document.createElement('canvas'); c.width=im.width; c.height=im.height; const x=c.getContext('2d'); x.drawImage(im,0,0); L.push(x.getImageData(0,0,c.width,c.height).data); }
      const d=[]; for(let i=1;i<L.length;i++){ let n=0; for(let k=0;k<L[i].length;k+=4)if(Math.abs(L[i][k]-L[i-1][k])+Math.abs(L[i][k+1]-L[i-1][k+1])+Math.abs(L[i][k+2]-L[i-1][k+2])>12)n++; d.push(n); } return d; },shots);
    const mean=Math.round(d.reduce((a,b)=>a+b,0)/d.length); rows.push([key,`box ${box.w}x${box.h}`,`mean ${mean}`,`(${Math.round(100*mean/(box.w*box.h))}% of box)`,d.join(' ')]); console.log(rows[rows.length-1].join('  '));
  }
  await b.close(); })();
