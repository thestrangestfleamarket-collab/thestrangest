// THE PLAYHOUSE'S SURFACES: the cloths, leaf, boards, carpets, papers and paintings its hall is made of, painted once into canvases the first time you go in.
import {THREE} from './003-shx.js';
const PHT={};
PHT.make=()=>{ '@playhouse';
  const T={}, cv=(w,h)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; return c; };
  // a seeded hash and value noise that wraps at the canvas edge, so every texture tiles without a seam
  const h2=(x,y,s)=>{ let n=Math.imul(x|0,374761393)+Math.imul(y|0,668265263)+Math.imul(s|0,2246822519); n=Math.imul(n^n>>>13,1274126177); return ((n^n>>>16)>>>0)/4294967296; };
  const vn=(x,y,p,s)=>{ const xi=Math.floor(x), yi=Math.floor(y), fx=x-xi, fy=y-yi, u=fx*fx*(3-2*fx), v=fy*fy*(3-2*fy), m=k=>((k%p)+p)%p;
    const a=h2(m(xi),m(yi),s), b=h2(m(xi+1),m(yi),s), c=h2(m(xi),m(yi+1),s), d=h2(m(xi+1),m(yi+1),s); return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v; };
  const fbm=(x,y,p,s,o=4)=>{ let t=0, a=.5, f=1, n=0; for(let i=0;i<o;i++){ t+=a*vn(x*f,y*f,p*f,s+i*17); n+=a; a*=.5; f*=2; } return t/n; };
  const cl=v=>v<0?0:v>255?255:v, mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
  // paint every pixel from f(x,y) -> [r,g,b] (or [r,g,b,a]); into a texture that repeats (srgb for colour, linear for heights and roughness)
  const px=(w,h,f,col=true,rep=[1,1])=>{ const c=cv(w,h), g=c.getContext('2d'), im=g.createImageData(w,h), d=im.data;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){ const p=f(x,y), o=(y*w+x)*4; d[o]=cl(p[0]); d[o+1]=cl(p[1]); d[o+2]=cl(p[2]); d[o+3]=p.length>3?cl(p[3]):255; }
    g.putImageData(im,0,0); return tex(c,col,rep); };
  const tex=(c,col=true,rep=[1,1])=>{ const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(rep[0],rep[1]); if(col)t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; return t; };
  T.tex=tex; T.cv=cv; T.fbm=fbm; T.h2=h2;

  // VELVET: the house curtain, the drapes, the seats: a deep pile whose crushed streaks run with the hang, a fine nap that catches the light
  const velvet=(base,s)=>{ const N=256;
    return {map:px(N,N,(x,y)=>{ const crush=fbm(x/N*3,y/N*12,3,s,3), nap=h2(x,y,s+9), v=.82+.3*crush+.08*(nap-.5); return base.map(c=>c*v); }),
      bump:px(N,N,(x,y)=>{ const v=128+60*(fbm(x/N*3,y/N*12,3,s,3)-.5)+30*(h2(x,y,s+9)-.5); return [v,v,v]; },false)}; };
  T.velvet=velvet([150,18,36],1); T.velvetDark=velvet([92,10,22],2); T.velvetSeat=velvet([140,22,38],3); T.velvetBlack=velvet([24,20,24],4);

  // GOLD LEAF: laid in squares, each a touch apart in tone, the seams between them, burnished high and dull in the hollows (colour and roughness)
  { const N=256, Q=32;
    const tone=(x,y)=>{ const i=Math.floor(x/Q), j=Math.floor(y/Q), t=h2(i,j,31), seam=(x%Q<1||y%Q<1)?.82:1, burn=fbm(x/N*4,y/N*4,4,32,3); return [t,seam,burn]; };
    T.gold=px(N,N,(x,y)=>{ const [t,s,b]=tone(x,y), k=(.78+.22*t)*s*(.85+.3*b); return [232*k,182*k,92*k]; });
    T.goldRough=px(N,N,(x,y)=>{ const [t,s,b]=tone(x,y), r=110+70*(1-b)+30*t+(s<1?60:0); return [r,r,r]; },false); }

  // ORNAMENT: a running band of acanthus scrolls in relief for the proscenium, the box fronts and the circle's front (a height map; its hollows darken the colour)
  { const W=512, H=128, c=cv(W,H), g=c.getContext('2d'); g.fillStyle='#606060'; g.fillRect(0,0,W,H);
    const scroll=(cx,cy,r,dir)=>{ g.beginPath(); for(let a=0;a<Math.PI*3.2;a+=.08){ const rr=r*(1-a/(Math.PI*3.6)); const x=cx+Math.cos(a*dir)*rr, y=cy+Math.sin(a*dir)*rr; a?g.lineTo(x,y):g.moveTo(x,y); } g.stroke(); };
    g.lineCap='round';
    for(let k=0;k<4;k++){ const x0=k*128, up=k%2?-1:1;
      g.strokeStyle='#d8d8d8'; g.lineWidth=9; g.beginPath(); g.moveTo(x0,64); g.bezierCurveTo(x0+40,64-34*up,x0+88,64+34*up,x0+128,64); g.stroke();
      g.lineWidth=7; scroll(x0+64,64-22*up,24,up); g.lineWidth=5;
      for(let l=0;l<5;l++){ const a=-.9+l*.45; g.beginPath(); g.moveTo(x0+64,64+6*up); g.quadraticCurveTo(x0+64+Math.cos(a)*30,64+6*up+Math.sin(a)*24*up,x0+64+Math.cos(a)*44,64+20*up); g.stroke(); }
      g.fillStyle='#f0f0f0'; g.beginPath(); g.arc(x0+20,64+20*up,7,0,7); g.fill(); g.beginPath(); g.arc(x0+108,64-20*up,5,0,7); g.fill(); }
    g.fillStyle='#e8e8e8'; g.fillRect(0,0,W,10); g.fillRect(0,H-10,W,10); g.fillStyle='#909090'; g.fillRect(0,10,W,4); g.fillRect(0,H-14,W,4);
    for(let x=4;x<W;x+=16){ g.fillStyle='#f4f4f4'; g.beginPath(); g.arc(x,5,4,0,7); g.fill(); g.beginPath(); g.arc(x+8,H-5,4,0,7); g.fill(); }
    const blur=cv(W,H), bg=blur.getContext('2d'); bg.filter='blur(2px)'; bg.drawImage(c,0,0); T.ornBump=tex(blur,false);
    const d=bg.getImageData(0,0,W,H).data, gc=cv(W,H), gg=gc.getContext('2d'), im=gg.createImageData(W,H);
    for(let i=0;i<W*H;i++){ const v=d[i*4]/255, k=.42+.75*v, x=i%W, y=i/W|0, b=fbm(x/W*8,y/H*2,8,40,2)*.2+.9; im.data[i*4]=240*k*b; im.data[i*4+1]=186*k*b; im.data[i*4+2]=90*k*b; im.data[i*4+3]=255; }
    gg.putImageData(im,0,0); T.orn=tex(gc); }

  // THE STAGE BOARDS: a sprung floor of narrow pine boards painted a worn black-brown, the paint scuffed through where the actors cross, nail rows at the joists
  { const N=512, B=32, S=4;
    T.boards=px(N,N,(x,y)=>{ const i=Math.floor(x/B), seam=x%B<1.2, len=256+h2(i,0,5)*256, j=Math.floor((y+h2(i,1,5)*N)/len), end=Math.abs(((y+h2(i,1,5)*N)%len))<1.2;
      const t=h2(i,j,6), grain=Math.sin((x+fbm(x/N*2,y/N*16,2,7,3)*40)*.9)*.5+.5, wear=fbm(x/N*3,y/N*3,3,8,4), thru=wear>.6?(wear-.6)*2.5:0;
      const paint=[44+t*10,36+t*8,32+t*6], wood=mix([150,110,72],[120,84,52],grain);
      let c=mix(paint,wood,Math.min(1,thru*(.6+.4*h2(x>>1,y>>1,9)))); if(seam||end)c=c.map(v=>v*.45); if((y%128)<3&&x%B>12&&x%B<16)c=[90,86,80];
      return c.map(v=>v*(.92+.1*h2(x,y,10))); });
    T.boardsBump=px(N,N,(x,y)=>{ const seam=x%B<1.2; const v=seam?40:150+20*(fbm(x/N*2,y/N*16,2,7,3)-.5); return [v,v,v]; },false); }

  // PARQUET: the foyer's oak in herringbone, waxed (a light streak of polish across it)
  { const N=512, L=128, W=32;
    T.parquet=px(N,N,(x,y)=>{ const u=x+y, v=x-y, a=Math.floor(u/L), b=Math.floor(v/W), side=(a+b)&1, i=side?Math.floor(u/W):Math.floor(v/W), j=side?Math.floor(v/L):Math.floor(u/L);
      const t=h2(i,j,11), g=Math.sin(((side?v:u)+fbm(x/N*4,y/N*4,4,12,3)*30)*.5)*.5+.5, e=((side?u:v)%W+W)%W<1.3||((side?v:u)%L+L)%L<1.3;
      let c=mix([168,116,62],[136,88,44],t*.6+g*.4); if(e)c=c.map(q=>q*.55); return c; }); }

  // CARPET: the house's crimson Axminster: a diamond trellis in gold and olive, a rosette in each, the pile's fleck (two patterns: aisles and boxes)
  const carpet=(ground,line,rose,s)=>px(256,256,(x,y)=>{ const u=(x+y)%128-64, v=(x-y+256)%128-64, d=Math.abs(u)+Math.abs(v), tr=Math.min(Math.abs(Math.abs(u)-64),Math.abs(Math.abs(v)-64));
    const r=Math.hypot((x%128)-64,(y%128)-64), a=Math.atan2((y%128)-64,(x%128)-64), pet=r<22+6*Math.cos(a*8);
    let c=ground; if(tr<4)c=line; else if(pet)c=r<8?line:rose; else if(d<20&&d>16)c=line;
    return c.map(q=>q*(.86+.22*h2(x,y,s))); });
  T.carpet=carpet([128,20,30],[200,156,70],[70,84,40],13);

  // DAMASK: the foyer and corridor paper: a mirrored flower in old gold on deep green, a faint print shift
  { const W=256, H=384, c=cv(W,H), g=c.getContext('2d'); g.fillStyle='#22382c'; g.fillRect(0,0,W,H); g.fillStyle='#8c7a44';
    const motif=(cx,cy,s)=>{ for(const m of [1,-1]){ g.save(); g.translate(cx,cy); g.scale(m*s,s); g.beginPath(); g.moveTo(0,-90); g.bezierCurveTo(40,-70,50,-20,14,0); g.bezierCurveTo(60,10,46,60,0,90);
      g.bezierCurveTo(20,50,22,20,0,10); g.bezierCurveTo(24,-10,20,-50,0,-60); g.closePath(); g.fill(); g.beginPath(); g.ellipse(34,-48,8,16,.6,0,7); g.fill(); g.beginPath(); g.ellipse(30,50,7,14,-.6,0,7); g.fill(); g.restore(); }
      g.beginPath(); g.ellipse(cx,cy,6*s,12*s,0,0,7); g.fill(); };
    motif(W/2,H/4,1); motif(0,H*3/4,.7); motif(W,H*3/4,.7);
    const d=g.getImageData(0,0,W,H); for(let i=0;i<W*H;i++){ const k=.9+.15*h2(i%W>>1,i/W>>1,15); for(let j=0;j<3;j++)d.data[i*4+j]*=k; } g.putImageData(d,0,0); T.damask=tex(c); }

  // PLASTER: painted fibrous plaster in ivory (the auditorium's walls between the gilt), soft mottling
  T.plaster=px(256,256,(x,y)=>{ const v=.9+.12*fbm(x/256*4,y/256*4,4,16,4); return [236*v,222*v,196*v]; });
  // MARBLE: the foyer's columns and stairs: white Carrara with grey veins
  T.marble=px(512,512,(x,y)=>{ const t=fbm(x/512*3,y/512*3,3,17,5), v=Math.abs(Math.sin((x/512*3+y/512*6+t*5)*Math.PI)), vein=Math.pow(1-v,9); return mix([238,234,228],[120,118,124],vein*.85).map(q=>q*(.95+.08*fbm(x/64,y/64,8,18,2))); });
  T.marbleRed=px(512,512,(x,y)=>{ const t=fbm(x/512*3,y/512*3,3,19,5), v=Math.abs(Math.sin((x/512*5-y/512*3+t*6)*Math.PI)), vein=Math.pow(1-v,7); return mix([120,34,30],[220,200,180],vein*.7); });
  // BRICK: the stage house is bare brick painted black; the scene dock and corridor whitewashed
  const brick=(face,mortar,s)=>px(256,256,(x,y)=>{ const r=Math.floor(y/16), o=r%2?32:0, i=Math.floor((x+o)/64), m=y%16<2||((x+o)%64)<2, t=h2(i,r,s);
    return (m?mortar:face.map(q=>q*(.85+.25*t)*(.92+.1*fbm(x/32,y/32,8,s+1,2)))); });
  T.brickBlack=brick([40,36,36],[22,20,20],21);
  T.brickBump=px(256,256,(x,y)=>{ const r=Math.floor(y/16), o=r%2?32:0, m=y%16<2||((x+o)%64)<2; const v=m?30:170+30*h2(x>>2,y>>2,23); return [v,v,v]; },false);
  // MAHOGANY: the rails, doors, box fronts' panels, the bar; a long grain and its figure
  T.mahogany=px(256,512,(x,y)=>{ const f=fbm(x/256*2,y/512*1,2,24,4), g=Math.sin((x+f*60)*.35)*.5+.5, fig=fbm(x/256*8,y/512*2,8,25,3); return mix([92,38,24],[58,22,14],g*.6+fig*.4); });
  T.pine=px(256,512,(x,y)=>{ const f=fbm(x/256*2,y/512*1,2,26,4), g=Math.sin((x+f*50)*.5)*.5+.5, knot=Math.hypot(x-140,(y%512)-300)<9?.5:1; return mix([214,176,124],[178,134,84],g).map(q=>q*knot); });
  // RAW CANVAS: the backs of the flats, unpainted, the paint bleeding through in patches
  T.canvas=px(256,256,(x,y)=>{ const w=(x%3===0||y%3===0)?.94:1, b=fbm(x/256*3,y/256*3,3,27,4); return mix([214,200,170],[150,120,96],Math.max(0,b-.6)*1.6).map(q=>q*w); });
  T.rope=px(64,256,(x,y)=>{ const v=Math.sin((x*.2+y*.35)*Math.PI)*.5+.5; return [196*(.75+.25*v),170*(.75+.25*v),120*(.75+.25*v)]; });
  // FRINGE: the gold bullion fringe on the curtain's hem and the pelmet (colour with its alpha: hanging threads, a woven head)
  T.fringe=px(256,64,(x,y)=>{ const head=y<14, th=(x%4)<3, len=40+14*h2(x>>2,0,28), on=head||(th&&y<len), k=head?(y%5<1?.7:1):.75+.25*Math.sin(x*1.3); return [228*k,180*k,84*k,on?255:0]; });
  T.tassel=px(64,128,(x,y)=>{ const r=y<40?10+y*.2:y<52?18:(y-52)*.16+12, on=Math.abs(x-32)<r&&y<124, k=(x%3?1:.75)*(y<40?1.05:.95); return [226*k,176*k,80*k,on?255:0]; });

  // PRINTED THINGS: the foyer's posters and the programme board, set in the playhouse's own type
  T.print=(w,h,draw)=>{ const c=cv(w,h), g=c.getContext('2d'); draw(g,w,h); const t=tex(c); t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping; return t; };
  T.poster=T.print(512,768,(g,w,h)=>{ const bg=g.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#0e1838'); bg.addColorStop(.6,'#24305a'); bg.addColorStop(1,'#0a0a14'); g.fillStyle=bg; g.fillRect(0,0,w,h);
    g.fillStyle='#f4ecd0'; g.beginPath(); g.arc(w*.62,h*.3,110,0,7); g.fill(); g.fillStyle='#1a244a'; g.beginPath(); g.arc(w*.7,h*.27,104,0,7); g.fill();
    g.fillStyle='#0a1410'; for(let i=0;i<14;i++){ const x=i*40-10, t=h*.62-h2(i,0,30)*90; g.beginPath(); g.moveTo(x-30,h); g.lineTo(x,t); g.lineTo(x+34,h); g.fill(); }
    for(let i=0;i<40;i++){ g.fillStyle=`rgba(220,255,120,${.4+.6*h2(i,2,30)})`; g.beginPath(); g.arc(h2(i,3,30)*w,h*.4+h2(i,4,30)*h*.35,2+2*h2(i,5,30),0,7); g.fill(); }
    g.strokeStyle='#c9a24a'; g.lineWidth=10; g.strokeRect(14,14,w-28,h-28); g.lineWidth=2; g.strokeRect(30,30,w-60,h-60);
    g.textAlign='center'; g.fillStyle='#c9a24a'; g.font='italic 34px Georgia,serif'; g.fillText('The Playhouse presents',w/2,90);
    g.fillStyle='#f4ecd0'; g.font='bold 60px Georgia,serif'; g.fillText('A MIDSUMMER',w/2,170); g.fillText("NIGHT'S DREAM",w/2,236);
    g.font='28px Georgia,serif'; g.fillStyle='#c9a24a'; g.fillText('by William Shakespeare',w/2,280);
    g.fillStyle='#f4ecd0'; g.font='bold 30px Georgia,serif'; g.fillText('ACT THE FIRST',w/2,h-150); g.font='24px Georgia,serif'; g.fillText('Nightly · every hour and half hour',w/2,h-110); g.fillText('Stalls',w/2,h-78); });
  T.bill=T.print(512,512,(g,w,h)=>{ g.fillStyle='#efe2c4'; g.fillRect(0,0,w,h); g.fillStyle='#2a1810'; g.textAlign='center';
    g.font='bold 36px Georgia,serif'; g.fillText('TONIGHT',w/2,60); g.font='italic 26px Georgia,serif'; g.fillText("A Midsummer Night's Dream · Act I",w/2,100);
    g.font='20px Georgia,serif'; const L=['Scene I · Athens. The palace of Theseus','Scene II · Athens. Quince’s house','','THESEUS · HIPPOLYTA · EGEUS · HERMIA','LYSANDER · DEMETRIUS · HELENA','QUINCE · BOTTOM · FLUTE','SNOUT · SNUG · STARVELING','','Curtain at the hour and the half hour','Latecomers seated at the scene change'];
    L.forEach((s,i)=>g.fillText(s,w/2,160+i*30)); g.strokeStyle='#8a6a2a'; g.lineWidth=4; g.strokeRect(10,10,w-20,h-20); });
  return T; };
export {PHT};
