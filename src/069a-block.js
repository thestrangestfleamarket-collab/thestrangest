const BLK={blds:[],signs:[],band:()=>null,built:0,in:false,hi:[],LO:.5}; window.BLK=BLK;
{ const T=TILE, XS=BOD.XS, ZS=BOD.ZS, B=BLOCK, s=T/24, YP=px=>px*ZU;
  let seed=11; const rnd=()=>((seed=(seed*16807)%2147483647)/2147483647);
  const cv=(w,h)=>{ const c=document.createElement('canvas'); c.width=Math.max(1,Math.round(w)); c.height=Math.max(1,Math.round(h)); return c; };
  const tex=c=>{ const t=new THREE.CanvasTexture(c); t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; t.colorSpace=THREE.SRGBColorSpace; return t; };
  const G=new THREE.Group(); G.name='block'; scene.add(G);
  const solid=(x0,y0,x1,y1,hpx)=>{ const a=XS(x0), b=XS(x1), c=ZS(y0), d=ZS(y1); SOL.up.push([Math.min(a,b),Math.min(c,d),Math.max(a,b),Math.max(c,d)]); FIX.up.push([Math.min(a,b),Math.min(c,d),0,Math.max(a,b),Math.max(c,d),YP(hpx)]); };
  const ST=120;
  const SW=300, SH=240, SWA=[1,2].map(k=>{ const a=new Uint8ClampedArray(SW*SH*3); for(let j=0;j<SH;j++)for(let i=0;i<SW;i++){ const v=BRICKS.face(i,j,k*97,1e9), o=(j*SW+i)*3; a[o]=v[0]; a[o+1]=v[1]; a[o+2]=v[2]; } return a; });
  function face(Wt,Hpx,o){ const Q=o.q||1, w=Wt*24, h=Math.round(YP(Hpx)/s), c=cv(w*Q,h*Q), g=c.getContext('2d'), im=g.createImageData(c.width,c.height), e=cv(w*Q,h*Q), q=e.getContext('2d');
    const A=SWA[o.k%2], ox=(o.k*37)%SW, oy=(o.k*13)%6*6;
    for(let j=0;j<c.height;j++){ const sj=((j/Q|0)+oy)%SH, gr=j>c.height*.8?1-.16*(j-c.height*.8)/(c.height*.2):1; for(let i=0;i<c.width;i++){ const a=(sj*SW+((i/Q|0)+ox)%SW)*3, k=(j*c.width+i)*4; im.data[k]=A[a]*o.tint[0]*gr; im.data[k+1]=A[a+1]*o.tint[1]*gr; im.data[k+2]=A[a+2]*o.tint[2]*gr; im.data[k+3]=255; } }
    g.putImageData(im,0,0); g.scale(Q,Q); q.scale(Q,Q); q.fillStyle='#000'; q.fillRect(0,0,w,h);
    const py=px=>h-Math.round(YP(px)/s);
    g.fillStyle='rgba(30,26,24,.9)'; g.fillRect(0,0,w,3); g.fillStyle='rgba(255,255,255,.12)'; g.fillRect(0,3,w,1);
    for(let f=1;f*ST<Hpx-30;f++){ const y=py(f*ST); g.fillStyle='rgba(40,34,30,.55)'; g.fillRect(0,y,w,3); g.fillStyle='rgba(255,240,220,.14)'; g.fillRect(0,y-1,w,1);
      if(!o.blank)for(let x=20;x+30<w-10;x+=58){ const wy=py(f*ST+86), wh=py(f*ST+28)-wy, lit=rnd()<(o.lit||.18), col=lit?['#f2c27a','#ffd79a','#cfe3ff','#ffb2c8'][(rnd()*4)|0]:'#1d1b26';
        g.fillStyle='#3a3640'; g.fillRect(x-2,wy-2,34,wh+4); g.fillStyle=col; g.fillRect(x,wy,30,wh); g.fillStyle='#3a3640'; g.fillRect(x+14,wy,2,wh);
        if(lit){ q.fillStyle=col; q.fillRect(x,wy,30,wh); const cw=6+((rnd()*12)|0); q.fillStyle='#000'; q.fillRect(x,wy,cw,wh); g.fillStyle='rgba(20,16,20,.55)'; g.fillRect(x,wy,cw,wh); }
        g.fillStyle='#8a8478'; g.fillRect(x-3,wy+wh+2,36,2); } }
    const top=py(o.shop==='glass'?100:96), bot=h;
    if(o.shop==='shut'){ g.fillStyle='#7c7e86'; g.fillRect(8,top,w-16,bot-top); for(let y=top+2;y<bot;y+=3){ g.fillStyle='#5e6068'; g.fillRect(8,y,w-16,1); } g.fillStyle='#4a4c54'; g.fillRect(8,top,w-16,4);
      for(let k=0;k<3;k++){ const x=12+rnd()*(w-40); g.fillStyle=['#2a2a30','#7a3a4a','#2a4a6a'][k]; for(let t=0;t<14;t++)g.fillRect(x+t*1.5+((rnd()*2)|0),top+10+rnd()*20,2,2); } }
    else if(o.shop==='glass'){
      const L0=o.door==='l'?62:10, L1=o.door==='l'?w-10:w-58; for(let x0=L0;x0<L1-30;x0+=96){ const x1=Math.min(x0+84,L1), gw=x1-x0, gt=top+4, gb=bot-12;
        g.fillStyle='#2c2a30'; g.fillRect(x0-2,gt-2,gw+4,bot-gt+2); g.fillStyle='#16151e'; g.fillRect(x0,gt,gw,gb-gt);
        const sh=gt+Math.round((gb-gt)*.45); g.fillStyle='#5a4028'; g.fillRect(x0+3,sh,gw-6,gb-sh); q.fillStyle='#4a3014'; q.fillRect(x0+3,sh,gw-6,gb-sh);
        for(let k=0;k<gw-10;k+=7){ const c=['#c86a3a','#e8c070','#8ab060','#d84a4a'][(rnd()*4)|0]; g.fillStyle=c; g.fillRect(x0+5+k,sh+3,4,4); q.fillStyle='#3a2410'; q.fillRect(x0+5+k,sh+3,4,4); }
        g.fillStyle='#e8d8b0'; q.fillStyle='#6a5430'; const mx=x0+6+rnd()*(gw-24); g.fillRect(mx,gt+6,10,13); q.fillRect(mx,gt+6,10,13);
        g.fillStyle='rgba(255,255,255,.1)'; for(let k=0;k<6;k++)g.fillRect(x0+4+k,gt+4+k*2,1,6);
        g.fillStyle='#2c2a30'; g.fillRect(x0+Math.round(gw/2)-1,gt,2,gb-gt); g.fillStyle='#3a3842'; g.fillRect(x0,gb,gw,bot-gb); } }
    if(o.shop){ g.fillStyle=o.band||'#24222c'; g.fillRect(4,py(124),w-8,py(100)-py(124)); g.fillStyle='rgba(255,255,255,.08)'; g.fillRect(4,py(124),w-8,1); }
    for(const dx of o.doors?Array.from({length:o.doors},(_,k)=>Math.round((k+.5)*w/o.doors)-19):[o.door==='l'?14:w-14-38]){ g.fillStyle='#2e2a26'; g.fillRect(dx,py(94),38,h-py(94)); g.fillStyle='#4a443c'; g.fillRect(dx+2,py(92),34,h-py(92)-1); g.fillStyle='#c8b070'; g.fillRect(dx+30,py(46),3,3); }
    g.fillStyle='rgba(20,18,16,.35)'; g.fillRect(0,h-4,w,4);
    return {map:tex(c),em:tex(e)}; }
  const roofM=new THREE.MeshLambertMaterial({color:0x3a3840}), sideCache={};
  function building(o){ const W=o.x1-o.x0, D=o.y1-o.y0, H=YP(o.h), s0=seed;
    const fs=Q=>[()=>face(W,o.h,{q:Q,k:o.k,tint:o.tint,lit:o.lit,shop:o.front,door:'r',doors:o.doors,blank:o.blankFace}),()=>face(W,o.h,{q:Q,k:o.k+50,tint:o.tint,lit:o.lit,shop:o.back,door:'l',doors:o.doors,blank:o.blankFace}),()=>face(D,o.h,{q:Q,k:o.k+90,tint:o.tint,lit:.1,blank:o.blankSide})];
    const mk=([fr,bk,sd])=>{ const L=(f)=>new THREE.MeshLambertMaterial({map:f.map,emissive:0xffffff,emissiveMap:f.em}), F=L(fr), Bk=L(bk), S=L(sd); return o.n?[S,S,roofM,roofM,F,Bk]:[S,S,roofM,roofM,Bk,F]; };
    const mats=mk(fs(o.lazy?BLK.LO:1).map(f=>f()));
    const m=new THREE.Mesh(new THREE.BoxGeometry(W*T,H,D*T),mats); m.position.set((XS(o.x0)+XS(o.x1))/2,H/2,(ZS(o.y0)+ZS(o.y1))/2); m.castShadow=o.cheap?false:true; m.receiveShadow=true; G.add(m);
    const cope=new THREE.Mesh(new THREE.BoxGeometry(W*T+.1*T,YP(8),D*T+.1*T),new THREE.MeshLambertMaterial({color:0x4a464e})); cope.position.set(m.position.x,H+YP(4),m.position.z); cope.castShadow=!o.cheap; G.add(cope); PEEK.whole(m); PEEK.whole(cope);
    if(o.lazy)BLK.hi.push({m,lo:mats,hi:null,paint:async()=>{ const k=seed, r=[]; seed=s0; for(const f of fs(1)){ r.push(f()); await Y(); } seed=k; return mk(r); }});
    solid(o.x0,o.y0,o.x1,o.y1,o.h); BLK.blds.push({...o,mesh:m}); return m; }
  const TINTS=[[1.3,.82,.66],[1.12,1,.84],[.92,.95,1.02],[1.2,.95,.8],[1.05,.9,.92],[.98,1.02,.92],[1.25,.88,.72],[1.1,1.04,.95],[.9,.9,.96]];
  [[B.x0,-18.6],[10.6,90],[90,150],[150,B.x1]].forEach(([a,b],i)=>building({x0:a,x1:b,y0:B.row2[0],y1:B.row2[1],h:140,n:0,k:300+i*7,tint:TINTS[3+i],front:'shut',back:'glass',lit:.2,row:2,lazy:1,doors:Math.max(1,Math.round((b-a)/14)),blankSide:true,cheap:true}));
  for(let i=0;i+1<MAINROW.length;i++){ const a=MAINROW[i][1]+.1, b=MAINROW[i+1][0]-.1; if(b-a>1.5)building({x0:a,x1:b,y0:B.back,y1:BOD.OY,h:130,n:0,k:400+i*11,tint:TINTS[i%TINTS.length],front:'shut',back:'shut',lit:0,blankFace:true,blankSide:true,cheap:true,row:1}); }
  const BX=[], GL=[], zA=B.alley[1], zB=B.alley[0], mid=(zA+zB)/2;
  const CR=[[98.5,zA-.5,.9,.9,22,[.18,.42,.36]],[98.5,zA-.5,.9,.9,44,[.22,.48,.62]],[121,zA-.6,1.1,1.1,40,[.2,.34,.24]],[73,zB+.6,1.3,.9,30,[.54,.42,.26]],[140,zB+.6,1,1,40,[.2,.34,.24]],[63,zB+.5,.8,.8,24,[.6,.18,.16]]];
  for(const [x,y,w,d,hp] of CR)solid(x-w/2,Math.min(y-d/2,y+d/2),x+w/2,Math.max(y-d/2,y+d/2),hp);
  const GA=new THREE.Group(); GA.name='alley'; GA.visible=false; scene.add(GA);
  let tl=0; const Y=()=>{ const n=performance.now(); if(n-tl<20)return Promise.resolve(); BLK.step=Math.max(BLK.step||0,n-tl); (BLK.steps||(BLK.steps=[])).push(Math.round(n-tl)); return new Promise(r=>requestAnimationFrame(r)).then(()=>{ tl=performance.now(); }); };
  const make=async()=>{ const G=GA, bx=(L,x0,y0,p0,x1,y1,p1,c)=>L.push([XS(Math.min(x0,x1)),YP(Math.min(p0,p1)),ZS(Math.min(y0,y1)),XS(Math.max(x0,x1)),YP(Math.max(p0,p1)),ZS(Math.max(y0,y1)),c]);
  const KO='"Black Han Sans","Do Hyeon","Noto Sans KR",sans-serif', KO2='"Do Hyeon","Black Han Sans","Noto Sans KR",sans-serif';
  const words=(g,t,x,y,w,h,font,vert)=>{ g.textAlign='center'; g.textBaseline='middle';
    if(vert){ const n=[...t].length, sz=Math.min(w*.9,h/n*.95); g.font=`${sz|0}px ${font}`; [...t].forEach((ch,i)=>g.fillText(ch,x+w/2,y+h/n*(i+.5))); return; }
    let sz=h*.86; g.font=`${sz|0}px ${font}`; const m=g.measureText(t).width; if(m>w*.94){ sz*=w*.94/m; g.font=`${sz|0}px ${font}`; } g.fillText(t,x+w/2,y+h/2+sz*.04); };
  const hard=c=>{ const g=c.getContext('2d'), d=g.getImageData(0,0,c.width,c.height); for(let i=3;i<d.data.length;i+=4)d.data[i]=d.data[i]>110?255:0; g.putImageData(d,0,0); return c; };
  const halo=(src,col,r)=>{ const p=r*3+2, c=cv(src.width+p*2,src.height+p*2), g=c.getContext('2d');
    for(const [rad,a] of [[r*3,.16],[r*2,.2],[r,.26]]){ const L=cv(c.width,c.height), q=L.getContext('2d'); for(let k=0;k<20;k++){ const an=k/20*Math.PI*2; for(const d of [rad,rad*.5])q.drawImage(src,p+Math.cos(an)*d,p+Math.sin(an)*d); }
      q.drawImage(src,p,p); q.globalCompositeOperation='source-in'; q.fillStyle=col; q.fillRect(0,0,c.width,c.height); g.globalAlpha=a; g.drawImage(L,0,0); }
    return {c,p}; };
  const place=(o,ry)=>{ const g=new THREE.Group(); g.position.set(XS(o.x),YP(o.up),ZS(o.y)); g.rotation.y=ry; G.add(g); return g; };
  const RY={S:Math.PI,N:0,E:Math.PI/2};
  function lightbox(o){ const c=cv(o.w*24,o.h*24), g=c.getContext('2d'), m=new THREE.MeshBasicMaterial({map:tex(c)}), grp=place(o,RY[o.f]);
    const fr=new THREE.Mesh(new THREE.BoxGeometry(o.w*T+.12*T,o.h*T+.12*T,(o.d||.3)*T),new THREE.MeshLambertMaterial({color:o.frame||0x2b2a33})); grp.add(fr);
    for(const sd of (o.f==='E'?[1,-1]:[1])){ const p=new THREE.Mesh(new THREE.PlaneGeometry(o.w*T,o.h*T),m); p.position.z=sd*((o.d||.3)/2+.01)*T; if(sd<0)p.rotation.y=Math.PI; grp.add(p); }
    const sg={paint(){ g.clearRect(0,0,c.width,c.height); o.paint(g,c.width,c.height); m.map.needsUpdate=true; }}; sg.paint(); BLK.signs.push(sg); return grp; }
  function neon(o){ const c=cv(o.w*24,o.h*24), g=c.getContext('2d'), grp=place(o,RY[o.f]);
    const fm=new THREE.MeshBasicMaterial({map:tex(c),alphaTest:.5,side:THREE.DoubleSide}), bm=new THREE.MeshBasicMaterial({color:0x0e0d18,map:fm.map,alphaTest:.5,side:THREE.DoubleSide});
    const f=new THREE.Mesh(new THREE.PlaneGeometry(o.w*T,o.h*T),fm); f.position.z=.04*T; grp.add(f);
    const b=new THREE.Mesh(new THREE.PlaneGeometry(o.w*T,o.h*T),bm); b.position.set(.03*T,-.03*T,-.03*T); grp.add(b);
    let hm=null;
    const sg={paint(){ g.clearRect(0,0,c.width,c.height); o.paint(g,c.width,c.height); hard(c); fm.map.needsUpdate=true; const h=halo(c,o.glow,3);
      if(!hm){ hm=new THREE.MeshBasicMaterial({map:tex(h.c),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}); const hp=new THREE.Mesh(new THREE.PlaneGeometry(h.c.width/24*T,h.c.height/24*T),hm); hp.position.z=-.02*T; hp.renderOrder=4; grp.add(hp); }
      else { hm.map.image=h.c; hm.map.needsUpdate=true; } }};
    sg.paint(); BLK.signs.push(Object.assign(sg,{fm,grp,o})); return grp; }
  const TU=T/ZU;
  const lamp=(col,k,reach,x,up,y)=>{ const L=new THREE.PointLight(new THREE.Color(col),k,reach*T,1.6); L.position.set(XS(x),YP(up),ZS(y)); L.userData.i0=k; lamps.push(L); if(LITE.recs.length){ L.userData.grp=GA; LITE.recs.push(L); } else G.add(L); return L; };
  const blade=(x,y,f,up,h,col,ink,t,frame)=>{ const s1=f==='S'?-1:1; lightbox({x,y:y+s1*.75,up,w:.85,h,f:'E',d:.4,frame:frame||0x2a2433,paint(g,W,H){ g.fillStyle=col; g.fillRect(0,0,W,H); g.fillStyle=ink; words(g,t,0,H*.04,W,H*.92,KO,true); }});
    bx(BX,x-.04,y,up+h*TU/2-4,x+.04,y+s1*1.2,up+h*TU/2,[.16,.16,.19]); };
  { const x=94, y=zA-.2; lightbox({x,y,up:150,w:7.4,h:1.6,f:'S',paint(g,W,H){ g.fillStyle='#f3efe6'; g.fillRect(0,0,W,H); g.fillStyle='#d9d2c4'; g.fillRect(0,H-6,W,6);
      g.save(); g.translate(W*.12,H*.5); g.rotate(-.5); g.fillStyle='#e0502a'; g.beginPath(); g.ellipse(0,0,W*.065,H*.22,0,0,7); g.fill(); g.fillStyle='#f08a4a'; g.beginPath(); g.ellipse(-2,-H*.05,W*.04,H*.1,0,0,7); g.fill();
      g.fillStyle='#c33a1e'; g.beginPath(); g.moveTo(W*.055,0); g.lineTo(W*.1,-H*.18); g.lineTo(W*.1,H*.18); g.fill(); g.fillStyle='#222'; g.fillRect(-W*.045,-H*.07,3,3); g.restore();
      g.fillStyle='#4aa0d8'; for(let k=0;k<4;k++)g.fillRect(W*.04+k*10,H*.8-k*3,7,3);
      g.fillStyle='#d8262e'; words(g,'바다의 파도',W*.25,H*.06,W*.72,H*.66,KO); g.fillStyle='#8a8a90'; words(g,'신선한 해산물 전문',W*.3,H*.72,W*.45,H*.2,KO2); }});
    bx(BX,x-4.5,y,108,x+4.5,y-2.2,114,[.18,.18,.22]); bx(BX,x-4.5,y-2.2,100,x+4.5,y-2.3,114,[.18,.18,.22]);
    for(let k=0;k<6;k++){ const tx=x-3.8+k*1.5; bx(GL,tx-.55,y-.4-(k%2)*.5,105,tx+.55,y-.55-(k%2)*.5,107,[.96,.97,1]); bx(GL,tx+.4,y-.55-(k%2)*.5,105,tx+.6,y-1.2-(k%2)*.5,107,[.96,.97,1]); }
    for(const px of [x-2.6,x+2.6])lightbox({x:px,y:y-.05,up:55,w:2.2,h:1,f:'S',d:.16,frame:0x1d1c24,paint(g,W,H){ g.fillStyle='#f6f2ea'; g.fillRect(0,0,W,H); g.fillStyle='#c22a2a'; g.fillRect(0,0,W,H*.22);
      g.fillStyle='#fff'; words(g,'오늘의 메뉴',0,0,W,H*.22,KO2); g.fillStyle='#e8b070'; g.beginPath(); g.ellipse(W*.32,H*.62,W*.18,H*.22,0,0,7); g.fill(); g.fillStyle='#c84a3a'; for(let k=0;k<5;k++)g.fillRect(W*.22+k*5,H*.56+(k%2)*4,4,3);
      g.fillStyle='#333'; words(g,'해물탕',W*.55,H*.4,W*.4,H*.4,KO2); }});
    lamp('#eef2ff',7,8,x,96,y-1.6); }
  await Y();
  neon({x:110.5,y:zA-.15,up:200,w:6,h:1.4,f:'S',glow:'#cfd6ff',paint(g,W,H){ g.fillStyle='#f4f6ff'; words(g,'오징어집',0,0,W,H,KO2); }});
  lightbox({x:114.4,y:zA-.15,up:190,w:.45,h:1.5,f:'S',d:.2,frame:0x5a1418,paint(g,W,H){ g.fillStyle='#e8303a'; g.fillRect(0,0,W,H); g.fillStyle='#fff'; words(g,'REST.',0,3,W,H-6,'Silkscreen,monospace',true); }});
  lamp('#d8deff',5,8,110.5,170,zA-1.8);
  await Y();
  neon({x:81,y:zA-1.3,up:150,w:1.5,h:2.1,f:'E',glow:'#ff7ab0',paint(g,W,H){ const cx=W/2; g.fillStyle='#ffb6d2';
    g.beginPath(); g.moveTo(cx,H*.04); g.lineTo(cx+W*.24,H*.3); g.lineTo(cx+W*.17,H*.55); g.lineTo(cx-W*.17,H*.55); g.lineTo(cx-W*.24,H*.3); g.closePath(); g.fill(); g.beginPath(); g.ellipse(cx,H*.5,W*.2,H*.14,0,0,7); g.fill();
    g.strokeStyle='#ffb6d2'; g.lineWidth=4; g.lineCap='round'; for(let k=-3;k<=3;k++){ g.beginPath(); g.moveTo(cx+k*W*.05,H*.6); g.quadraticCurveTo(cx+k*W*.08,H*.78,cx+k*W*.06+(k%2?5:-5),H*.96); g.stroke(); }
    g.fillStyle='#3a1020'; g.fillRect(cx-W*.1,H*.44,4,4); g.fillRect(cx+W*.06,H*.44,4,4); }});
  bx(BX,81-.04,zA,184,81+.04,zA-2.1,188,[.16,.16,.19]);
  lightbox({x:81,y:zA-1.3,up:108,w:.9,h:.32,f:'E',d:.1,frame:0x401018,paint(g,W,H){ g.fillStyle='#d8263a'; g.fillRect(0,0,W,H); g.fillStyle='#fff'; words(g,'REST',0,0,W,H,'Silkscreen,monospace'); }});
  lamp('#ff6aa6',6,8,81,140,mid);
  await Y();
  blade(128,zA,'S',210,3.6,'#f08ac8','#6a1040','도매액세서리'); lamp('#ff86d0',4,7,128,220,mid);
  blade(100,zB,'N',200,3.2,'#f6d02a','#2a2a2a','안과안경점'); lamp('#ffd84a',4,7,100,210,mid);
  await Y();
  blade(56,zB,'N',140,2.2,'#ff7a3a','#fff','분식');
  blade(136,zB,'N',150,2.4,'#ff4a6a','#fff','노래방'); lamp('#ff4a6a',4,7,136,150,mid);
  await Y();
  blade(152,zA,'S',170,2.4,'#5af0ff','#0a2a3a','PC방'); lamp('#5af0ff',4,7,152,170,mid);
  blade(150,zB,'N',130,1.6,'#d070ff','#fff','바');
  await Y();
  { const x=66, y=zB+.9, chick=(g,W,H)=>{ g.fillStyle='#fff7e0'; g.fillRect(0,0,W,H); g.fillStyle='#f2a22a'; g.beginPath(); g.arc(W*.5,H*.56,W*.3,0,7); g.fill();
      g.fillStyle='#e3302a'; for(let k=0;k<3;k++){ g.beginPath(); g.arc(W*(.38+k*.12),H*.22,W*.08,0,7); g.fill(); } g.fillStyle='#222'; g.fillRect(W*.4,H*.48,3,3); g.fillRect(W*.58,H*.48,3,3);
      g.fillStyle='#ff8a1a'; g.beginPath(); g.moveTo(W*.44,H*.62); g.lineTo(W*.56,H*.62); g.lineTo(W*.5,H*.72); g.fill(); g.fillStyle='#d8a040'; g.fillRect(W*.72,H*.62,W*.16,H*.26); g.fillStyle='#fff'; g.fillRect(W*.72,H*.62,W*.16,H*.05); };
    bx(BX,x-.08,y-.08,0,x+.08,y+.08,330,[.22,.22,.26]);
    for(const up of [300,120])lightbox({x,y,up,w:1.2,h:1.2,f:'E',d:.4,frame:0xd8d8e0,paint:chick});
    neon({x,y,up:210,w:.85,h:4.2,f:'E',glow:'#fff2c8',paint(g,W,H){ g.fillStyle='#fff8e4'; words(g,'치킨호프맥주',0,0,W,H,KO,true); }});
    bx(BX,x-.42,y-.02,148,x+.42,y+.02,272,[.1,.1,.13]);
    lamp('#fff0cc',6,9,x,200,mid); }
  await Y();
  neon({x:116,y:zB+.12,up:85,w:2.2,h:.7,f:'N',glow:'#b07aff',paint(g,W,H){ g.fillStyle='#d6b8ff'; words(g,'붕어빵',W*.2,0,W*.8,H,KO2); g.beginPath(); g.ellipse(W*.1,H*.5,W*.07,H*.3,0,0,7); g.fill(); }});
  neon({x:118.2,y:zB+.12,up:60,w:.7,h:.5,f:'N',glow:'#ffa040',paint(g,W,H){ g.fillStyle='#ffc070'; g.beginPath(); g.ellipse(W*.42,H*.5,W*.3,H*.3,0,0,7); g.fill(); g.beginPath(); g.moveTo(W*.7,H*.5); g.lineTo(W*.95,H*.15); g.lineTo(W*.95,H*.85); g.fill(); }});
  lamp('#a070ff',4,6,117,80,zB+1.2);
  await Y();
  { const N=['국수','만두','찻집','라멘','고기','빵집'], C=['#f6d02a','#f3efe6','#ff8ac8','#5af0ff','#ffa040','#f3efe6'];
    BLK.blds.filter(q=>q.row===2).forEach((q,i)=>lightbox({x:(q.x0+q.x1)/2,y:zB+.17,up:112,w:Math.min(5,q.x1-q.x0-4),h:.75,f:'N',d:.16,frame:0x1d1c24,paint(g,W,H){ g.fillStyle=C[i]; g.fillRect(0,0,W,H); g.fillStyle='#2a2a2a'; words(g,N[i],0,0,W,H,KO); }})); }
  await Y();
  for(const [x,y,up] of [[90,zA,190],[106,zA,120],[132,zA,260],[150,zA,130],[60,zB,150],[84,zB,120],[110,zB,170],[142,zB,160]]){ const sy=y===zA?-1:1; bx(BX,x-.6,y,up,x+.6,y+sy*.7,up+30,[.72,.72,.76]); bx(BX,x-.45,y+sy*.7,up+6,x+.45,y+sy*.72,up+24,[.3,.3,.34]); }
  for(const [x,y,w,d,hp,c] of CR)bx(BX,x-w/2,y-d/2,0,x+w/2,y+d/2,hp,c);
  { const x=88.5, y=zB+1.3; bx(BX,x-1,y-.25,10,x+1,y+.25,30,[.86,.86,.9]); bx(BX,x-1.1,y-.3,0,x-.6,y+.3,16,[.08,.08,.1]); bx(BX,x+.6,y-.3,0,x+1.1,y+.3,16,[.08,.08,.1]); bx(BX,x-.9,y-.3,30,x-.1,y+.3,52,[.78,.2,.16]); bx(BX,x+.8,y-.04,30,x+.9,y+.04,60,[.15,.15,.18]); }
  BLK.blds.filter(q=>q.row===2).forEach((q,i)=>{ const c=[[.48,.16,.16],[.16,.29,.42],[.16,.35,.23],[.42,.35,.16],[.29,.16,.35],[.16,.35,.35]][i], y=B.row2[0];
    bx(BX,q.x0+.7,y,104,q.x1-.7,y-1.5,110,c); bx(BX,q.x0+.7,y-1.5,92,q.x1-.7,y-1.56,110,c.map(v=>v*.8)); });
  await Y();
  const draw=(L,mat)=>{ if(!L.length)return; const m=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),mat,L.length), M=new THREE.Matrix4(), C=new THREE.Color();
    L.forEach((b,i)=>{ M.makeScale(Math.max(.01,b[3]-b[0]),Math.max(.01,b[4]-b[1]),Math.max(.01,b[5]-b[2])); M.setPosition((b[0]+b[3])/2,(b[1]+b[4])/2,(b[2]+b[5])/2); m.setMatrixAt(i,M); m.setColorAt(i,C.setRGB(...b[6])); });
    m.castShadow=mat.isMeshLambertMaterial; m.receiveShadow=true; m.computeBoundingSphere(); G.add(m); };
  draw(BX,new THREE.MeshLambertMaterial({color:0xffffff})); draw(GL,new THREE.MeshBasicMaterial({color:0xffffff}));
  { const P=[], sag=(a,b,dip)=>{ for(let i=0;i<10;i++)for(const t of [i/10,(i+1)/10])P.push(XS(a[0]+(b[0]-a[0])*t),YP(a[1]+(b[1]-a[1])*t-Math.sin(t*Math.PI)*dip),ZS(a[2]+(b[2]-a[2])*t)); };
    for(let xx=B.x0+3;xx<B.x1-3;xx+=6.5)sag([xx,236+(xx%3)*8,zA],[xx+3.5,176,zB],26);
    for(let k=0;k<3;k++)sag([B.x0+2,236-k*14,zA-.2-k*.2],[B.x1-2,220-k*12,zA-.3-k*.2],60);
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); const l=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0x08070f})); G.add(l); }
  { const ln=document.createElement('link'); ln.rel='stylesheet'; ln.href='https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Do+Hyeon&display=swap'; document.head.appendChild(ln);
    Promise.race([Promise.all([document.fonts.load('40px "Black Han Sans"','바다'),document.fonts.load('40px "Do Hyeon"','오징')]),new Promise(r=>setTimeout(r,8000))]).then(()=>{ for(const s of BLK.signs)s.paint(); }).catch(()=>{}); }
    if(BLK.shine)for(const sg of BLK.signs)BLK.shine(sg); };
  { const zr=a=>[Math.min(ZS(a[0]),ZS(a[1])),Math.max(ZS(a[0]),ZS(a[1]))], AL=zr(B.alley), PR=zr(B.prom), mx0=XS(BOD.MAP.x0), mx1=XS(BOD.MAP.x1);
    BLK.band=(x,z)=>x<mx0||x>mx1?null:z>AL[0]&&z<AL[1]?{z0:AL[0],z1:AL[1]}:z>PR[0]&&z<PR[1]?{z0:PR[0],z1:PR[1]}:null; }
  { const lane=()=>!UI.persp&&(UI.view==='iso'||UI.view==='map')&&LVL!=='down'&&!ROOMS.cur&&BLK.band(pos.x,pos.z)&&cam.position.z>pos.z, z0=ZS(B.back)-.6*T, z1=ZS(-77)+.6*T, bb=new THREE.Box3(); BLK.lane=lane;
    let n=0; for(const w of cutWalls){ if(!w.me||!w.me.geometry)continue; bb.setFromObject(w.me); if(bb.isEmpty()||bb.max.y<.1||bb.min.z<z0||bb.max.z>z1)continue;
      const wh=w.when, al=Object.getOwnPropertyDescriptor(w,'always'), was=al?(al.get?()=>al.get.call(w):()=>al.value):()=>false;
      w.when=()=>lane()||(wh?wh():true); Object.defineProperty(w,'always',{get:()=>lane()||was(),configurable:true}); n++; } BLK.walls=n; }
  const esc=v=>{ const A=MODS.apts; if(A&&A.back)for(const me of A.back)me.visible=v; }; esc(false);
  const vis=v=>{ BLK.shown=v; GA.visible=v; for(const q of BLK.hi)q.m.material=v?q.hi:q.lo; esc(v); };
  const frames=n=>new Promise(r=>{ const f=()=>--n<=0?r():requestAnimationFrame(f); requestAnimationFrame(f); });
  const build=async()=>{ const t0=performance.now(); tl=t0; for(const q of BLK.hi)q.hi=await q.paint(); await make(); BLK.step=Math.max(BLK.step||0,performance.now()-tl); BLK.ms=+(performance.now()-t0).toFixed(1); BLK.built=1; };
  BLK.go=async()=>{ '@later'; if(BLK.fade||BLK.built)return; BLK.fade=1; const el=document.getElementById('subfade'), live=el&&window.__started;
    if(live){ el.textContent='ENTERING THE ALLEY'; el.style.opacity='1'; if(typeof keys!=='undefined'&&keys.clear)keys.clear(); await frames(2); }
    await (BLK.job||(BLK.job=build())); if(live){ await frames(2); el.style.opacity='0'; } BLK.fade=0; };
  { const zb=ZS(B.back), sg=Math.sign(ZS(B.alley[0])-zb)||-1; BLK.tick=()=>{ if(!window.__started||typeof ROOMS!=='undefined'&&ROOMS.cur||UI.freeCam||ED.on||window.POSOK===false)return; const d=(pos.z-zb)*sg, up=LVL==='up';
      BLK.in=up&&d>.2*T; const need=BLK.in||up&&(d>-10*T||d>-32*T&&(UI.persp||(cam.position.z-pos.z)*sg>0));
      if(BLK.in&&!BLK.built)BLK.go(); else if(need&&!BLK.job)BLK.job=build();
      const v=need&&!!BLK.built; if(v!==!!BLK.shown)vis(v); };
    const t0=DRESS.tick; DRESS.tick=(dt,p)=>{ if(t0)t0(dt,p); BLK.tick(); }; }
  window.ALLEYDBG=()=>({in:BLK.in,shown:!!BLK.shown,built:BLK.built,ms:BLK.ms,step:BLK.step&&+BLK.step.toFixed(1),steps:BLK.steps,kids:GA.children.length,signs:BLK.signs.length,lamps:GA.children.filter(o=>o.isLight).length+LITE.recs.filter(L=>L.userData.grp===GA).length,hi:BLK.hi.map(q=>q.m.material===q.hi?1:0),tris:(()=>{ let t=0; const f=o=>{ const g=o.geometry; if(g){ const c=g.index?g.index.count:g.attributes.position.count; t+=(o.isLineSegments?c/2:c/3)*(o.isInstancedMesh?o.count:1); } }; GA.traverse(f); for(const m of MODS.apts&&MODS.apts.back||[])m.traverse(f); return Math.round(t); })(),esc:(MODS.apts&&MODS.apts.back||[]).map(m=>m.visible?1:0)});
  window.BLOCKDBG=()=>({blds:BLK.blds.map(q=>[q.row,q.x0,q.x1,q.h]),signs:BLK.signs.length,boxes:BX.length+GL.length,band:BLK.band(pos.x,pos.z)});
}
