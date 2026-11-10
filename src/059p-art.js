// THE ART MUSEUM: on Market St, a stone front like the MUSEUM OF EARTH's (portico, ART MUSEUM over the door, two banners); its inside, built off the map behind the fade when you go in: one room on one floor under a skylight, the paintings of data/art.json hung close round its walls, two high (the big ones alone); double-click a painting to see it full screen on its wall, its full-resolution file fetched only then; nobody works there
import {SHARED, THREE} from './003-shx.js';
import {PERFX, pos, UI, VIS} from './003b-systems.js';
import {scene} from './004-main.js';
import {OWNED} from './005-save.js';
import {AWAY, BLDK, grab, OFFDX, STORE, TILE, TURN, WP} from './006-map-pre.js';
import {BLOCKS} from './038zb-blocks.js';
import {FACADES} from './038zc-facades.js';
const ART=__LAZY__("data/art.json"), ARTTOURS=__LAZY__("data/art-tours.json"), ARTTEX=__LAZY__("data/art-tex.json");
await grab('art',async()=>{ if(AWAY.has('art')||!WP.art)return;
  const K=STORE.kit, {room,rec,STEPS,sol,put}=K, SK=SHARED.BOD.STOREK, {CATALOG,LAMPS,T,sh,hash}=SK, MK=SK.museum, MB=MK.MUS.b, MUF=MK.font, {X,Y,Z,faceTex,bq,C}=SHARED.BOD, MS=STORE.main, U=TILE*BLDK;
  const H=196, IW=28, DEP=19.5, FL=6, ZC=52, ZPU=1/(SHARED.BOD.Y(1)/U), FZ=FL*ZPU, LOW=42, GAPZ=13, WALLC=[162,146,118];   // FZ: the walls' height in z units; LOW: the hang's foot; GAPZ: between a pair, one above the other
  const LW=MS.lot('art',H), TP=TURN(LW,WP.art.face||'n'), L=TP.L, OX=1060+OFFDX/BLDK-TP.cx, cxL=(L.x0+L.x1)/2, cx=cxL+OX;
  // one room off the map, one floor: the paintings round its four walls, a skylight over it
  const B={id:'lart',x0:cx-IW/2,x1:cx+IW/2,y0:L.y1-DEP,y1:L.y1,h:FZ+40}, DOORY=B.y1-1.3;
  const SX=MB.x0+MB.x1, SY=MB.y0+MB.y1, dx=cx-(MB.x0+MB.x1)/2, dy=B.y1-MB.y1, OB={...MB,plain:1,id:'lmusfront'}, mus=(x,y)=>[SX-x+dx,SY-y+dy];
  const STONE=[214,206,188], STONEL=[226,220,204], STONED=[186,178,160], OAK=[118,82,50], OAKL=[134,96,58], OAKD=[98,66,40];
  const GAL=[['THE NORTHERN MASTERS',[104,124,106]],['THE SOUTHERN MASTERS',[150,78,70]],['THE ROMANTICS',[124,110,134]],['PARIS AND AFTER',[110,128,152]]];
  const D={w:'f',a:cx,wd:3,h:82};
  const fk=(nx,ny,at,k)=>nx+','+ny+','+at.toFixed(2)+'@'+k;
  const GROUP=t=>{ '@later'; const a=t.a; if(/Friedrich|Turner|Géricault/.test(a))return 2; if(/Seurat|Caillebotte|Monet|Gogh|Klimt/.test(a))return 3;
    if(/Botticelli|Michelangelo|Caravaggio|Velázquez|Goya/.test(a))return 1; return 0; };
  const size=t=>{ const ar=t.w/t.h; if(ar>4)return [4.6,4.6/ar]; const big=/Night Watch|Medusa|Meninas|Earthly Delights|Ghent|Grande Jatte|Rainy Day|Innocents/.test(t.t); let h=big?2.4:ar<.8?1.7:1.35, w=h*ar; if(!big&&w>2.6){ w=2.6; h=w/ar; } return [w,h]; };
  let DATA=null, LAY=null;
  // the hang (owner, 10 Nov 2026: "spread them out so they fill out all the walls"): one row at eye height, by school, round the walls from the door; each wall takes its share by its length, its paintings evenly spaced along it
  const layout=()=>{ '@later'; LAY=[]; const sz=i=>size(DATA[i]), cols=[];
    for(let g=0;g<GAL.length;g++)for(const i of DATA.map((t,i)=>i).filter(i=>GROUP(DATA[i])===g))cols.push({g,ids:[i],w:sz(i)[0]});
    const E=.6, segs=[{ax:'x',at:B.y1-.1,nx:0,ny:-1,a0:B.x0+E,a1:cx-D.wd/2-1,d:-1},{ax:'y',at:B.x0+.1,nx:1,ny:0,a0:B.y0+E,a1:B.y1-E,d:-1},{ax:'x',at:B.y0+.1,nx:0,ny:1,a0:B.x0+E,a1:B.x1-E,d:1},{ax:'y',at:B.x1-.1,nx:-1,ny:0,a0:B.y0+E,a1:B.y1-E,d:1},{ax:'x',at:B.y1-.1,nx:0,ny:-1,a0:cx+D.wd/2+1,a1:B.x1-E,d:-1}];
    const lens=segs.map(f=>f.a1-f.a0), tot=lens.reduce((a,b)=>a+b,0), cw=cols.reduce((a,c)=>a+c.w,0);
    const fit=s=>{ const out=segs.map(()=>[]); let k=0, end=0; for(let j=0;j<segs.length;j++){ end+=lens[j]; let used=0; while(k<cols.length){ const c=cols[k], mid=(k?cols.slice(0,k).reduce((a,q)=>a+q.w,0):0)+c.w/2;
        if(j<segs.length-1&&mid/cw>end/tot)break; if(used+c.w*s+.8*(out[j].length+1)>lens[j])break; used+=c.w*s; out[j].push(c); k++; } } return k===cols.length?out:null; };
    let best=null; for(let s=1;s>.4&&!best;s-=.02){ const o=fit(s); if(o)best={o,s}; }
    if(!best){ console.warn('art museum: the walls are short'); return; } const {o,s}=best; A_.scale=+s.toFixed(2);
    let gmin=1e9; o.forEach((cs,j)=>{ if(!cs.length)return; const f=segs[j], used=cs.reduce((a,c)=>a+c.w*s,0), g=(lens[j]-used)/(cs.length+1); gmin=Math.min(gmin,g); let a=g;
      for(const c of cs){ const m=a+c.w*s/2, at=f.d>0?f.a0+m:f.a1-m, fr={...f,rm:{k:0,g:c.g,col:WALLC}}, [w0,h0]=sz(c.ids[0]);
        LAY.push({i:c.ids[0],w:w0*s,h:h0*s,f:fr,a:at,zc:LOW+(3.4*ZPU+GAPZ)/2}); a+=c.w*s+g; } }); A_.gap=+gmin.toFixed(2); };
  const glyph=(s,k,c,z,z0)=>{ const i=Math.floor(c/k), r=Math.floor((z-z0)/k); if(c<0||r<0||r>6)return false; const g=MUF[s[Math.floor(i/6)]], q=i%6; return !!g&&q<5&&g[(6-r)*5+q]==='#'; };
  const parquet=(x,y)=>{ '@later'; const Lb=.84, Wb=.14, a=(x+y)*Math.SQRT1_2, b=(x-y)*Math.SQRT1_2, i=Math.floor(a/Lb), j=Math.floor(b/Lb), A=(i+j)&1, p=A?b-j*Lb:a-i*Lb, q=A?a-i*Lb:b-j*Lb, k=Math.floor(p/Wb);
    if(p-k*Wb<.045||q<.045)return [70,48,30]; const n=hash(i*5+k,j*3+A,1751), c=n<.3?OAKD:n<.68?OAK:OAKL, g=hash(Math.floor(a*40),Math.floor(b*8),1753); return g<.06?sh(c,.9):g>.95?sh(c,1.07):c; };
  const marble=(x,y)=>MK.museumHallCol(x,y,{x0:B.x0+.1,x1:B.x1-.1,y0:B.y0+.1,y1:B.y1-.1});
  const BAN=[[cx-7.6,'VERMEER',[34,46,98]],[cx+7.6,'VAN GOGH',[122,30,34]]];
  const ban=(x,z,f)=>{ '@later'; for(const [bx,s,col] of BAN){ const d=x-bx; if(Math.abs(d)>2.1||z<60||z>174)continue; if(z>170)return sh([40,36,34],f); if(Math.abs(d)>1.95||z<64)return sh(col,f*.7); if(Math.abs(z-72)<1.5)return sh([226,214,180],f);
      const tw=(s.length*6-1)*2; if(glyph(s,2,tw/2-d*24,z,128))return sh([236,226,196],f); return sh(col,f*(.96+.08*hash(Math.floor(x*24),Math.floor(z/2),1757))); } return null; };
  const front=(nx,ny,x,y,z,f,cap)=>{ if(ny>0){ const c=ban(x,z,f); if(c)return c; } const [mx,my]=mus(x,y); return MK.museumOutside(OB,-nx,-ny,mx,my,z,f,cap)||sh(STONEL,f); };
  const FW=[[0,1],[-1,0],[0,-1],[1,0]], mpS=(k,x,y,rot=0)=>{ '@later'; const fn=CATALOG[k]; SHARED.BOD.K.STUDIO.face(FW[rot]); let p; try{ p=fn(+x.toFixed(3),+y.toFixed(3)); }finally{ SHARED.BOD.K.STUDIO.face(null); } if(!p)return null; p.kind=k;
    const px=(p.x0+p.x1)/2, py=(p.y0+p.y1)/2, q=TP.pt(SX-px+dx-OX,SY-py+dy); SHARED.BOD.placeAt(p,(2+TP.q)%4,px,py,q[0],q[1],true); return p; };
  const lamp=(x,y,z,r,c)=>LAMPS.push({own:1,room:1,day:true,x,y,z,r,c});
  // the benches, and the lamps round the walls and under the skylight
  const set0=()=>{ '@later'; const M=MK.MUS, py=MB.y0-3;
    mpS('museum portico steps',M.mid,(py+MB.y0)/2); for(const d of [-3.7,-1.2,1.2,3.7])mpS('museum column',M.mid+d,py+.7); mpS('art entablature',M.mid,py+.7,2);
    for(const x of [cx-3.5,cx+3.5])put('museum bench',x,(B.y0+B.y1)/2,1); put('dust in the air',cx-3,B.y1-7);
    for(const [x,y] of [[cx-6,B.y0+2.2],[cx+6,B.y0+2.2],[cx-6,B.y1-2.2],[cx+6,B.y1-2.2],[B.x0+2.2,(B.y0+B.y1)/2],[B.x1-2.2,(B.y0+B.y1)/2]])lamp(x,y,FZ*.78,11,[1.55,1.46,1.3]);
    lamp(cx,(B.y0+B.y1)/2,FZ*.9,16,[1.3,1.28,1.22]);
    const T0=.1; for(const [a,b,c,d] of [[B.x0,B.y0,B.x1,B.y0+T0],[B.x0,B.y0,B.x0+T0,B.y1],[B.x1-T0,B.y0,B.x1,B.y1],[B.x0,B.y1-T0,cx-D.wd/2,B.y1],[cx+D.wd/2,B.y1-T0,B.x1,B.y1]])sol(a,b,c,d,FZ); };
  const A_=STORE.art={B,FZ,hung:0,groups:[],built:false,gap:0,scale:1,pics:()=>A_.groups.flatMap(g=>g.children.filter(c=>c.userData.at))};
  const inB=(x,z)=>{ const u=x/U+SHARED.BOD.OX, v=z/U+SHARED.BOD.OY; return u>B.x0&&u<B.x1&&v>B.y0&&v<B.y1; };
  A_.floor=()=>inB(pos.x,pos.z)?0:-1;
  // the paintings: each a framed canvas (its picture a small JPEG from data/art.json) on its wall, a plaque beside it, a thing to read
  const plaque=t=>{ '@later'; const cv=document.createElement('canvas'); cv.width=256; cv.height=112; const g=cv.getContext('2d'); g.fillStyle='#ebe6d8'; g.fillRect(0,0,256,112); g.fillStyle='#2a2622'; g.font='bold 20px Georgia,serif';
    const fit=(s,w)=>{ while(g.measureText(s).width>w&&s.length>3)s=s.slice(0,-2)+'…'; return s; }; g.fillText(fit(t.t,236),12,34); g.font='17px Georgia,serif'; g.fillText(fit(t.a+', '+t.d,236),12,62); g.fillStyle='#6a645c'; g.font='14px Georgia,serif'; g.fillText(fit(t.m,236),12,90);
    const tx=new THREE.CanvasTexture(cv); tx.colorSpace=THREE.SRGBColorSpace; return new THREE.Mesh(new THREE.PlaneGeometry(.44*U,.19*U),new THREE.MeshBasicMaterial({map:tx})); };
  // the inside drawn when you go in: the walls, the ceiling and its skylight, then the paintings
  const canvasTex=(w,h,draw,rx=1,ry=1)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(rx,ry); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; return t; };
  const img=src=>new Promise(r=>{ if(!src)return r(null); const i=new Image(); i.onload=()=>r(i); i.onerror=()=>r(null); i.src=src; });
  const build=async()=>{ '@art'; if(!DATA||!LAY)return; const gen=A_.gen; const G=new THREE.Group(); G.name='art museum'; G.userData.anyRoom=true; const WL=await img(TEX&&TEX.plaster), WD=await img(TEX&&TEX.wood), WDV=await img(TEX&&TEX.woodv);
    const rgb=a=>'rgb('+a.map(v=>Math.round(v)).join(',')+')';
    // a floor's band of wall, one floor high and as wide: the plaster in the floor's colour, the wood dado and its rail, the picture rail, the slab's edge above
    const wallTex=col=>canvasTex(512,512,(g,w,h)=>{ const zy=z=>h*(1-z/FZ); g.fillStyle=rgb(col); g.fillRect(0,0,w,h); if(WL){ g.globalCompositeOperation='multiply'; for(let x=0;x<w;x+=256)for(let y=0;y<h;y+=256)g.drawImage(WL,x,y,256,256); g.globalCompositeOperation='source-over'; }
      if(WD){ for(let x=0;x<w;x+=128)g.drawImage(WD,x,zy(30),128,zy(4)-zy(30)); } else { g.fillStyle='#5a3a24'; g.fillRect(0,zy(30),w,zy(4)-zy(30)); }
      g.fillStyle='#2a221b'; g.fillRect(0,zy(4),w,h-zy(4)); g.fillStyle='#c4a052'; g.fillRect(0,zy(33),w,zy(30)-zy(33)); g.fillRect(0,zy(FZ-14),w,zy(FZ-16)-zy(FZ-14));
      g.fillStyle='rgba(0,0,0,.18)'; g.fillRect(0,zy(30),w,2); g.fillStyle=rgb(STONED); g.fillRect(0,0,w,zy(FZ-8)); },1,1);
    const M=(o)=>new THREE.MeshLambertMaterial(o);
    const plane=(w,h,mat,x,y,z,ry)=>{ const me=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat); me.position.set(x,y,z); me.rotation.y=ry; me.receiveShadow=true; G.add(me); return me; };
    const box=(x0,y0,x1,y1,z0,z1,mat,cast=true)=>{ const me=new THREE.Mesh(new THREE.BoxGeometry(Math.abs(X(x1)-X(x0)),Math.max(.001,Y(z1)-Y(z0)),Math.abs(Z(y1)-Z(y0))),mat); me.position.set((X(x0)+X(x1))/2,(Y(z0)+Y(z1))/2,(Z(y0)+Z(y1))/2); me.castShadow=cast; me.receiveShadow=true; G.add(me); return me; };
    const bandH=Y(FZ);
    { const k=0, t=wallTex(WALLC), y=Y(FZ/2);
      for(const [len,x,z,ry] of [[IW,X(cx),Z(B.y0+.1),0],[DEP,X(B.x0+.1),Z((B.y0+B.y1)/2),Math.PI/2],[DEP,X(B.x1-.1),Z((B.y0+B.y1)/2),-Math.PI/2]]){ const tt=t.clone(); tt.needsUpdate=true; tt.repeat.set(len/FL,1); plane(len*U,bandH,M({map:tt}),x,y,z,ry); }
      if(k){ const tt=t.clone(); tt.needsUpdate=true; tt.repeat.set(IW/FL,1); plane(IW*U,bandH,M({map:tt}),X(cx),y,Z(B.y1-.1),Math.PI); }
      else { const side=(IW-D.wd)/2; for(const s of [-1,1]){ const tt=t.clone(); tt.needsUpdate=true; tt.repeat.set(side/FL,1); tt.offset.x=s>0?(IW-side)/FL:0; plane(side*U,bandH,M({map:tt}),X(cx+s*(D.wd/2+side/2)),y,Z(B.y1-.1),Math.PI); }
        const tt=t.clone(); tt.needsUpdate=true; tt.repeat.set(D.wd/FL,(FZ-D.h)/FZ); tt.offset.set((IW/2-D.wd/2)/FL,0); plane(D.wd*U,Y(FZ)-Y(D.h),M({map:tt}),X(cx),(Y(D.h)+Y(FZ))/2,Z(B.y1-.1),Math.PI);
        plane(D.wd*U,Y(D.h),M({color:0x3a2416,...(WDV?{map:canvasTex(128,256,(g,w,h)=>{ g.drawImage(WDV,0,0,w,h); g.fillStyle='rgba(0,0,0,.35)'; g.fillRect(w/2-1,0,2,h); g.fillStyle='#c9a250'; g.fillRect(w/2-10,h*.5,4,22); g.fillRect(w/2+6,h*.5,4,22); })}:{})}),X(cx),Y(D.h/2),Z(B.y1-.12),Math.PI); } }
    const glass=new THREE.MeshStandardMaterial({color:0xb8dde4,transparent:true,opacity:.2,roughness:.05,metalness:.1,depthWrite:false}), brass=new THREE.MeshStandardMaterial({color:0xc9a250,metalness:.7,roughness:.35}), bench=M({color:0x3d2a1e});
    // the ceiling round the skylight: glass on a brass grid
    const SK={x0:cx-6,x1:cx+6,y0:B.y0+5,y1:B.y1-5}, ceil=M({color:0xe4ddd0});
    for(const [a,b,c,d] of [[B.x0,B.y0,B.x1,SK.y0],[B.x0,SK.y1,B.x1,B.y1],[B.x0,SK.y0,SK.x0,SK.y1],[SK.x1,SK.y0,B.x1,SK.y1]])box(a,b,c,d,FZ,FZ+6,ceil,false);
    box(SK.x0,SK.y0,SK.x1,SK.y1,FZ+1,FZ+2,new THREE.MeshStandardMaterial({color:0xd8eef2,transparent:true,opacity:.16,depthWrite:false}),false);
    for(let i=1;i<6;i++){ const x=SK.x0+(SK.x1-SK.x0)*i/6; box(x-.05,SK.y0,x+.05,SK.y1,FZ,FZ+2,brass,false); } for(let i=1;i<3;i++){ const y=SK.y0+(SK.y1-SK.y0)*i/3; box(SK.x0,y-.05,SK.x1,y+.05,FZ,FZ+2,brass,false); }
    // the paintings: each a framed canvas (its picture a small JPEG from data/art.json) on the wall, its plaque under it, a thing to look at
    const TL=new THREE.TextureLoader(), gilt=M({color:0x9a7a34}), dark=M({color:0x2a1c14});
    for(const p of LAY){ const t=DATA[p.i], f=p.f, g=new THREE.Group(), w=p.w*U, h=p.h*U, k=f.rm.k, old=[0,1,2].includes(f.rm.g);
      const fr=new THREE.Mesh(new THREE.BoxGeometry(w+.12*U,h+.12*U,.05*U),old?gilt:dark); fr.position.z=.025*U; g.add(fr);
      const tx=TL.load(t.i); tx.colorSpace=THREE.SRGBColorSpace; tx.anisotropy=4; const cv=new THREE.Mesh(new THREE.PlaneGeometry(w,h),M({map:tx})); cv.position.z=.052*U; g.add(cv);
      const pq2=plaque(t); pq2.position.set(0,-h/2-.16*U,.008*U); g.add(pq2);
      const yy=Y(p.zc); if(f.ax==='y'){ g.position.set(X(f.at+f.nx*.012),yy,Z(p.a)); g.rotation.y=f.nx>0?Math.PI/2:-Math.PI/2; } else { g.position.set(X(p.a),yy,Z(f.at+f.ny*.012)); g.rotation.y=f.ny>0?0:Math.PI; }
      g.userData.at={k,g:f.rm.g,key:fk(f.nx,f.ny,f.at,k),a:+p.a.toFixed(2),w:+p.w.toFixed(2)}; G.add(g); UI.thing({name:t.t.toUpperCase(),obj:g,reach:1.6*U,near:3.4*U,tall:h+.3*U,act:()=>view(t,p)}); }
    if(gen!==A_.gen){ for(let i=UI.things.length-1;i>=0;i--){ let q=UI.things[i].obj; while(q&&q!==G)q=q.parent; if(q)UI.things.splice(i,1); } return; }   // left before it was hung: nothing kept
    scene.add(G); PERFX.own(G); A_.groups=[G]; A_.hung=LAY.length; A_.built=true;
    // the third person's camera stays under the ceiling, pulled in along the line to you
    if(!A_.cam&&UI.camKeeps){ A_.cam=1; UI.camKeeps.push((c,t)=>{ if(!A_.built||!UI.persp||!inB(t.x,t.z))return; const top=Y(FZ-14); if(c.y>top&&c.y>t.y+1e-6){ const k=Math.max(0,(top-t.y)/(c.y-t.y)); c.lerpVectors(t,c,k); } }); } };
  A_.lay=()=>LAY?LAY.map(p=>({k:p.f.rm.k,g:p.f.rm.g,key:fk(p.f.nx,p.f.ny,p.f.at,p.f.rm.k),a:+p.a.toFixed(2),w:+p.w.toFixed(2),z:Math.round(p.zc)})):[];
  A_.dbg=()=>({hung:A_.hung,n:DATA?DATA.length:0,lay:LAY?LAY.length:0,drawn:A_.groups.map(g=>VIS&&VIS.why(g).length?0:g.visible?1:0).join(''),galleries:1,floors:1,gap:A_.gap,scale:A_.scale,floor:A_.floor()});
  // the viewer: double-click a painting and it fills the screen, framed on its own wall; the museum's full-resolution file is fetched only then (the small picture shows until it comes); wheel, pinch, + and - zoom, drag pans, double-click zooms in or back; a painting with a tour (data/art-tours.json) has GUIDED TOUR
  // the tour's reader (owner, 10 Nov 2026: "too hard to read ... add voice reading ... change font, color, background, size"): its words, its player, its settings (kept with what you own)
  const TRF={serif:['SERIF','Literata, Georgia, serif'],clear:['CLEAR',"'Atkinson Hyperlegible', Verdana, sans-serif"],easy:['EASY','Lexend, Verdana, sans-serif'],pixel:['PIXEL','Silkscreen, monospace']};
  const TRC={paper:['PAPER','#f3ebdd','#1e1a16','#f5d77a'],night:['NIGHT','#1b1714','#f1e7d2','#6b5520'],sepia:['SEPIA','#e8d3ae','#3b2a18','#f7c96a'],high:['HIGH','#000000','#fff36b','#2a4bff'],white:['WHITE','#ffffff','#000000','#ffe27a']};
  const TRD={font:'serif',size:21,theme:'paper',lead:1.6,mode:'panel',read:true,next:true,voice:'',rate:1};
  const TR={ get:()=>{ let o={}; try{ o=JSON.parse(OWNED.get('tour-reader')||'{}')||{}; }catch(e){} return {...TRD,...o}; }, save:R=>{ try{ OWNED.set('tour-reader',JSON.stringify(R)); }catch(e){} },
    fonts:()=>{ if(TR.f)return; TR.f=1; const l=document.createElement('link'); l.rel='stylesheet'; l.href='https://fonts.googleapis.com/css2?family=Literata:opsz,wght@7..72,400;7..72,600&family=Atkinson+Hyperlegible:wght@400;700&family=Lexend:wght@400;600&display=swap'; document.head.appendChild(l); },
    voices:()=>{ const S=window.speechSynthesis; if(!S)return []; const v=S.getVoices(), en=v.filter(x=>/^en/i.test(x.lang)); return en.length?en:v; },
    voice:n=>{ const L=TR.voices(); return L.find(x=>x.name===n)||L.find(x=>/Google US English|Samantha|Daniel|Aria|Jenny/.test(x.name))||L[0]||null; },
    style:(el,R)=>{ const C=TRC[R.theme]||TRC.paper, st=el.style; st.setProperty('--tr-bg',C[1]); st.setProperty('--tr-ink',C[2]); st.setProperty('--tr-mark',C[3]); st.setProperty('--tr-font',(TRF[R.font]||TRF.serif)[1]); st.setProperty('--tr-size',R.size+'px'); st.setProperty('--tr-lead',R.lead); },
    panel:(box,R,done)=>{ const b=(on,k,v,lab,css='')=>'<button data-set="'+k+'" data-v="'+v+'" class="'+(on?'on':'')+'" style="'+css+'">'+lab+'</button>', E=x=>String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
      box.innerHTML='<div class="tr-sh"><b>READER SETTINGS</b><button data-set="x" aria-label="Close settings">✕</button></div>'+
        '<div class="tr-sl">FONT</div><div class="tr-sg g4">'+Object.entries(TRF).map(([k,[n,f]])=>b(R.font===k,'font',k,n,'font-family:'+f.replace(/"/g,"'"))).join('')+'</div>'+
        '<div class="tr-sl">TEXT SIZE · '+R.size+' PX</div><div class="tr-sg g3">'+b(0,'size',-2,'A−')+'<span class="tr-sz"><i style="width:'+((R.size-16)/20*100)+'%"></i></span>'+b(0,'size',2,'A+')+'</div>'+
        '<div class="tr-sl">COLOURS</div><div class="tr-sg g5">'+Object.entries(TRC).map(([k,[n,bg,ink]])=>b(R.theme===k,'theme',k,n,'background:'+bg+';color:'+ink)).join('')+'</div>'+
        '<div class="tr-sl">LINE SPACING</div><div class="tr-sg g3">'+[[1.35,'TIGHT'],[1.6,'NORMAL'],[1.9,'AIRY']].map(([v,n])=>b(R.lead===v,'lead',v,n)).join('')+'</div>'+
        '<div class="tr-sl">READ ALOUD</div><label class="tr-ck"><input type="checkbox" data-set="read" '+(R.read?'checked':'')+'> Start reading by itself</label><label class="tr-ck"><input type="checkbox" data-set="next" '+(R.next?'checked':'')+'> Go on to the next stop by itself</label>'+
        (window.speechSynthesis?'<div class="tr-sg g2"><select data-set="voice" aria-label="Voice">'+TR.voices().map(v=>'<option value="'+E(v.name)+'"'+(TR.voice(R.voice)===v?' selected':'')+'>'+E(v.name+' ('+v.lang+')')+'</option>').join('')+'</select>'+
          '<select data-set="rate" aria-label="Speed">'+[.75,1,1.25,1.5].map(r=>'<option value="'+r+'"'+(r===R.rate?' selected':'')+'>SPEED '+r+'×</option>').join('')+'</select></div>':'<div class="tr-sl">THIS BROWSER HAS NO VOICE</div>');
      box.onclick=e=>{ const t=e.target.closest('button[data-set]'); if(!t)return; const k=t.dataset.set, v=t.dataset.v; if(k==='x'){ box.hidden=true; return; }
        if(k==='size')R.size=Math.max(16,Math.min(36,R.size+ +v)); else if(k==='lead')R.lead=+v; else R[k]=v; TR.save(R); TR.panel(box,R,done); done(); };
      box.onchange=e=>{ const t=e.target, k=t.dataset.set; if(!k)return; R[k]=t.type==='checkbox'?t.checked:k==='rate'?+t.value:t.value; TR.save(R); done(); };
      if(window.speechSynthesis&&!TR.voices().length&&!TR.vw){ TR.vw=1; speechSynthesis.addEventListener('voiceschanged',()=>{ if(!box.hidden)TR.panel(box,R,done); }); } } };
  const TRCSS='[data-tr][hidden]{display:none!important}[data-tr]{font-family:var(--tr-font);color:var(--tr-ink);letter-spacing:0;cursor:default;box-sizing:border-box}[data-tr] *{box-sizing:border-box}'+
    '[data-tr] button{font:12px Silkscreen,monospace;letter-spacing:.6px;min-height:44px;min-width:44px;padding:0 12px;border:2px solid currentColor;background:transparent;color:inherit;cursor:pointer}[data-tr] button.on{outline:3px solid var(--tr-mark);outline-offset:-6px}'+
    '.tr-p{position:absolute;right:0;top:0;bottom:0;width:min(470px,44vw);background:var(--tr-bg);display:flex;flex-direction:column;gap:14px;padding:20px 26px;overflow:auto}'+
    '@media (max-width:760px){.tr-p{top:auto;left:0;width:auto;height:58vh}}'+
    '.tr-h{display:flex;align-items:center;gap:8px}.tr-no{font:30px Silkscreen,monospace;line-height:1;opacity:.8}.tr-of{flex:1;font:12px Silkscreen,monospace;letter-spacing:.6px;opacity:.75}'+
    '.tr-t{margin:0;font-size:calc(var(--tr-size)*1.5);line-height:1.15;font-weight:600}'+
    '.tr-pl{display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--tr-ink);color:var(--tr-bg)}.tr-pl button{border-color:var(--tr-bg)}'+
    '.tr-play{border-radius:50%;width:56px;height:56px;background:var(--tr-mark)!important;color:#1e1a16!important;border:none!important;font-size:16px!important}'+
    '.tr-bar{flex:1;height:8px;background:color-mix(in srgb,var(--tr-bg) 30%,transparent);position:relative}.tr-bar::after{content:"";position:absolute;left:0;top:0;bottom:0;width:var(--p,0%);background:var(--tr-mark);transition:width .3s}'+
    '.tr-x{font-size:var(--tr-size);line-height:var(--tr-lead);flex:1}.tr-x p{margin:0 0 .7em}.tr-x span,.tr-t{transition:background .2s}[data-s].on{background:var(--tr-mark);box-shadow:0 0 0 3px var(--tr-mark)}'+
    '.tr-f{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.tr-f label,.tr-ck{display:flex;align-items:center;gap:8px;font-size:15px;flex:1}.tr-f input,.tr-ck input{width:22px;height:22px}'+
    '.tr-s{position:absolute;left:0;right:0;bottom:0;background:rgba(0,0,0,.84);color:#fff;padding:18px 24px;display:flex;flex-direction:column;align-items:center;gap:12px}'+
    '.tr-s p{margin:0;max-width:980px;text-align:center;font-size:calc(var(--tr-size)*1.3);line-height:1.4;color:#fff;font-family:var(--tr-font)}.tr-s div{display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:center}.tr-s .tr-of{color:#d8d2c4}'+
    '.tr-set{position:absolute;right:16px;top:64px;width:min(520px,calc(100vw - 32px));max-height:calc(100vh - 90px);overflow:auto;background:#17130f;color:#f1e7d2;border:2px solid #3a3128;padding:18px 20px;display:flex;flex-direction:column;gap:10px;font-family:\'Atkinson Hyperlegible\',Verdana,sans-serif;z-index:2}'+
    '.tr-sh{display:flex;align-items:center}.tr-sh b{flex:1;font:14px Silkscreen,monospace;letter-spacing:.6px;font-weight:400}.tr-sl{font:11px Silkscreen,monospace;letter-spacing:.6px;color:#bfb39b;margin-top:6px}'+
    '.tr-sg{display:grid;gap:8px}.g2{grid-template-columns:1fr 1fr}.g3{grid-template-columns:auto 1fr auto;align-items:center}.g4{grid-template-columns:repeat(4,1fr)}.g5{grid-template-columns:repeat(5,1fr)}'+
    '.tr-set button{font-size:13px;letter-spacing:0}.tr-sz{height:8px;background:#3a3128;display:block}.tr-sz i{display:block;height:8px;background:#f5d77a}'+
    '.tr-set select{min-height:44px;background:#17130f;color:#f1e7d2;border:2px solid #f1e7d2;font-size:15px;font-family:inherit;padding:0 8px;width:100%}';
  const TRH=
    '<div data-k="card" data-tr hidden class="tr-p" role="region" aria-label="Guided tour"><div class="tr-h"><span class="tr-no" data-k="cno"></span><span class="tr-of" data-k="cn"></span><button data-k="mode">SUBTITLES</button><button data-k="aa" aria-label="Reader settings: font, size, colours" style="font:600 18px var(--tr-font)">Aa</button><button data-k="end" aria-label="End the tour">✕</button></div>'+
      '<h2 class="tr-t" data-k="ct"></h2>'+
      '<div class="tr-pl"><button data-k="back" aria-label="Previous stop">◀</button><button data-k="play" class="tr-play" aria-label="Read aloud">▶</button><div class="tr-bar" data-k="bar"></div><button data-k="next">NEXT ▶</button></div>'+
      '<div class="tr-x" data-k="cx" aria-live="polite"></div>'+
      '<div class="tr-f"><label><input type="checkbox" data-k="auto"> Next stop by itself</label><button data-k="rate">1×</button><button data-k="end2">END TOUR</button></div></div>'+
    '<div data-k="subs" data-tr hidden class="tr-s"><p data-k="sx" aria-live="polite"></p><div><button data-k="sback">◀ BACK</button><button data-k="splay" class="tr-play" aria-label="Read aloud">▶</button><button data-k="snext">NEXT</button><span class="tr-of" data-k="sn"></span><button data-k="smode">READING PANEL</button><button data-k="saa" aria-label="Reader settings: font, size, colours">Aa</button><button data-k="send">END</button></div></div>'+
    '<div data-k="set" data-tr hidden class="tr-set" role="dialog" aria-label="Reader settings"></div>';
  let V=null, TOURS={}, TEX=null;
  const view=(t,p)=>{ '@art'; if(!V){ const el=document.createElement('div'); el.id='artview'; el.hidden=true;
      el.style.cssText='position:fixed;inset:0;z-index:30;background:#0c0b0a;overflow:hidden;touch-action:none;user-select:none;cursor:grab;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#e8e2cc';
      el.innerHTML='<div data-k="world" style="position:absolute;left:0;top:0;transform-origin:0 0"><div data-k="wall" style="position:absolute;left:0;top:0"><div data-k="plaster" style="position:absolute"></div><div data-k="cornice" style="position:absolute"></div><div data-k="light" style="position:absolute"></div><div data-k="prail" style="position:absolute"></div><div data-k="dado" style="position:absolute"></div><div data-k="drail" style="position:absolute"></div><div data-k="skirt" style="position:absolute"></div></div><div data-k="frame" style="position:absolute"><div data-k="ftop" style="position:absolute;left:0;right:0;top:0"></div><div data-k="fbot" style="position:absolute;left:0;right:0;bottom:0"></div></div><img alt="" draggable="false" style="position:absolute;left:0;top:0;image-rendering:auto;max-width:none;max-height:none"></div>'+
        '<div data-k="cap" style="position:absolute;left:0;right:0;bottom:0;padding:14px 18px;background:linear-gradient(transparent,#0c0b0ae8 40%);pointer-events:none"></div>'+
        '<div style="position:absolute;top:12px;right:12px;display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end"><button data-k="tour">GUIDED TOUR</button><button data-k="out">−</button><button data-k="in">+</button><button data-k="fit">FIT</button><button data-k="one">FULL SIZE</button><button data-k="x">CLOSE ✕</button></div>'+
        '<div data-k="st" style="position:absolute;top:16px;left:18px;color:#c8b98a;text-shadow:0 1px 2px #000"></div>'+
        TRH;
      for(const b of el.querySelectorAll('button'))if(!b.closest('[data-tr]'))b.style.cssText='font:11px Silkscreen,monospace;letter-spacing:.4px;color:#e8e2cc;background:#1c1a18e0;border:1px solid #5a5248;padding:6px 10px;cursor:pointer';
      { const st=document.createElement('style'); st.textContent=TRCSS; el.appendChild(st); }
      document.body.appendChild(el); const im=el.querySelector('img'), q=k=>el.querySelector('[data-k="'+k+'"]'), W0=q('world');
      V={el,im,s:1,x:0,y:0,w:1,h:1,fit:1,max:8,full:null,t:null,tour:null};
      const put=()=>{ W0.style.transform='translate('+V.x+'px,'+V.y+'px) scale('+V.s+')'; };
      const clamp=()=>{ const W=el.clientWidth, H=el.clientHeight, w=V.w*V.s, h=V.h*V.s; V.x=w<W?(W-w)/2:Math.min(0,Math.max(W-w,V.x)); V.y=h<H?(H-h)/2:Math.min(0,Math.max(H-h,V.y)); put(); };
      const zoom=(k,cx=el.clientWidth/2,cy=el.clientHeight/2)=>{ stop(); const s=Math.min(V.max,Math.max(V.fit,V.s*k)), r=s/V.s; V.x=cx-(cx-V.x)*r; V.y=cy-(cy-V.y)*r; V.s=s; clamp(); };
      const fitNow=()=>{ stop(); const W=el.clientWidth, H=el.clientHeight; V.fit=Math.min((W-40)/(V.w*1.14),(H-90)/(V.h*1.14)); V.max=V.got?Math.max(V.fit*1.5,4):V.fit*3; V.s=V.fit; V.x=V.y=0; clamp(); };
      // the wall round it, in the painting's own pixels so it zooms with it: the gallery's colour (the hall's stone), the dado and its rail below, the picture rail above, a light's pool over the painting; the frame gilt or dark wood
      V.dress=()=>{ const L=V.look||{}, u=V.h/(L.h||1.35), c=L.col||[214,206,188], X=TEX||{}, rgb=a=>'rgb('+a.map(v=>Math.round(Math.max(0,Math.min(255,v)))).join(',')+')', px=v=>v+'px', tile=t=>px(Math.max(8,t*u));
        const top=(FZ-15-ZC)/ZPU*u, dado=(ZC-30)/ZPU*u, floor=ZC/ZPU*u, ext=Math.max(V.w,V.h)*5, mid=V.h/2, y0=mid-top-.6*u, y1=mid+floor, GILT='linear-gradient(to bottom,#e8cc7e,#a8842e 45%,#d8b45e 60%,#7d5f24)';
        const woodBg=sz=>({backgroundColor:'#4a2c1a',backgroundImage:X.wood?'url('+X.wood+')':'none',backgroundSize:tile(sz),backgroundBlendMode:'normal'});
        const band=(k,y,h,css)=>{ const d=q(k).style; d.left=px(-ext); d.width=px(V.w+2*ext); d.top=px(y); d.height=px(Math.max(0,h)); d.background=''; d.boxShadow=''; Object.assign(d,css); };
        band('plaster',y0,y1-y0,{backgroundColor:rgb(c),backgroundImage:X.plaster?'url('+X.plaster+')':'none',backgroundBlendMode:'multiply',backgroundSize:tile(1.6)});
        band('cornice',y0,.6*u,{background:'linear-gradient(to bottom,rgba(0,0,0,.22),rgba(0,0,0,.08))'});
        band('light',y0,y1-y0,{background:'radial-gradient(ellipse '+px(V.w*.95)+' '+px(V.h)+' at '+px(ext+V.w/2)+' '+px(mid-V.h*.15-y0)+',rgba(255,238,205,.34),rgba(255,238,205,.08) 55%,transparent 75%)'});
        band('prail',mid-top,.05*u,{background:GILT,boxShadow:'0 '+px(.02*u)+' '+px(.03*u)+' rgba(0,0,0,.35)'});
        band('dado',mid+dado+.1*u,floor-dado-.22*u,{...woodBg(1.4),boxShadow:'inset 0 '+px(.05*u)+' '+px(.08*u)+' rgba(0,0,0,.5)'});
        band('drail',mid+dado,.1*u,{...woodBg(.8),boxShadow:'inset 0 '+px(.015*u)+' 0 rgba(255,220,180,.25),0 '+px(.02*u)+' '+px(.04*u)+' rgba(0,0,0,.45)'});
        band('skirt',mid+floor-.12*u,.12*u,{background:'#2a221b'});
        // the frame: gilt or the dark wood's grain, bevelled, a dark lip round the canvas
        const b=.07*u, fr=q('frame').style, e=Math.max(1,.012*u); fr.left=px(-b); fr.top=px(-b); fr.width=px(V.w+2*b); fr.height=px(V.h+2*b); fr.background='';
        const vb=sz=>({backgroundColor:'#4a2c1a',backgroundImage:X.woodv?'url('+X.woodv+')':'none',backgroundSize:tile(sz)});
        Object.assign(fr,L.gilt?{background:'linear-gradient(135deg,#e6c878,#9a7a34 28%,#dcb860 52%,#7d5f24 78%,#c8a24e)'}:vb(.7));
        for(const k of ['ftop','fbot']){ const d=q(k).style; d.height=px(b); d.background=''; Object.assign(d,L.gilt?{background:'none'}:woodBg(.7)); d.clipPath=k==='ftop'?'polygon(0 0,100% 0,calc(100% - '+px(b)+') 100%,'+px(b)+' 100%)':'polygon('+px(b)+' 0,calc(100% - '+px(b)+') 0,100% 100%,0 100%)'; }   // the top and bottom rails mitred into the sides
        fr.boxShadow='0 '+px(.06*u)+' '+px(.14*u)+' rgba(0,0,0,.6),inset '+px(e)+' '+px(e)+' '+px(2*e)+' rgba(255,235,200,.35),inset -'+px(e)+' -'+px(e)+' '+px(2*e)+' rgba(0,0,0,.55),inset 0 0 0 '+px(b*.35)+' rgba(0,0,0,.12)';
        im.style.boxShadow='0 0 0 '+px(Math.max(1,.012*u))+' #1a120c,inset 0 0 '+px(.04*u)+' rgba(0,0,0,.35)'; };
      V.size=(w,h,keep)=>{ const c=keep?{cx:(el.clientWidth/2-V.x)/(V.w*V.s),cy:(el.clientHeight/2-V.y)/(V.h*V.s),r:V.s/V.fit}:null; V.w=w; V.h=h; im.style.width=w+'px'; im.style.height=h+'px'; V.dress(); fitNow();
        if(V.tour){ V.go(V.tour.i,true); return; } if(c){ V.s=Math.min(V.max,V.fit*c.r); V.x=el.clientWidth/2-c.cx*V.w*V.s; V.y=el.clientHeight/2-c.cy*V.h*V.s; clamp(); } };
      // the tour (owner, 10 Nov 2026: the mix of the mockups): each step glides to its part of the painting (at: [x, y, w, h] as fractions of it; none: the whole); its words in the reading panel beside it with the audio guide's player on top, or as subtitles under it; read aloud by the browser's own voice, sentence by sentence, the one being read lit
      let anim=0; const stop=()=>{ cancelAnimationFrame(anim); anim=0; };
      const card=q('card'), subs=q('subs'), set=q('set'), SP=window.speechSynthesis||null, RD=TR.get();
      const sents=t=>(t||'').split(/\n/).map(p=>p.match(/[^.!?]+[.!?]+["”')]*\s*|[^.!?]+$/g)||[p]);
      const look=()=>{ TR.style(el,RD); q('mode').textContent='SUBTITLES'; q('rate').textContent=RD.rate+'×'; q('auto').checked=!!RD.next; };
      const showMode=()=>{ const T=V.tour; card.hidden=!T||RD.mode!=='panel'; subs.hidden=!T||RD.mode!=='subs'; };
      const speak=k=>{ const T=V.tour; if(!T||!SP)return; SP.cancel(); const tok=++T.tok, L=T.sen;
        if(k>=L.length){ if(RD.next&&T.i<T.steps.length-1){ V.go(T.i+1); return; } T.play=false; T.cur=-1; mark(); return; }
        T.cur=k; mark(); const u=new SpeechSynthesisUtterance(L[k]); u.rate=RD.rate; const vo=TR.voice(RD.voice); if(vo){ u.voice=vo; u.lang=vo.lang; } else u.lang='en-US';
        u.onend=()=>{ if(V.tour===T&&T.tok===tok&&T.play)speak(k+1); }; u.onerror=()=>{ if(V.tour===T&&T.tok===tok){ T.play=false; mark(); } }; SP.speak(u); };
      const mark=()=>{ const T=V.tour; if(!T)return; for(const e of el.querySelectorAll('[data-s]'))e.classList.toggle('on',+e.dataset.s===T.cur);
        for(const b of [q('play'),q('splay')]){ b.textContent=T.play?'❚❚':'▶'; b.setAttribute('aria-label',T.play?'Pause reading':'Read aloud'); b.hidden=!SP; }
        const n=T.sen.length, k=Math.max(0,T.cur); q('bar').style.setProperty('--p',(T.play||T.cur>=0?(k+1)/n*100:0)+'%');
        q('sx').textContent=T.sen[T.cur>=0?T.cur:0]||''; q('sn').textContent='STOP '+(T.i+1)+' OF '+T.steps.length+(n>1?' · LINE '+(k+1)+' OF '+n:''); };
      V.go=(i,now)=>{ const T=V.tour; if(!T)return; i=Math.max(0,Math.min(T.steps.length-1,i)); T.i=i; const S=T.steps[i], W=el.clientWidth, H=el.clientHeight;
        const P=sents(S.text); T.sen=[S.title||'',...P.flat().map(x=>x.trim())].filter(Boolean); let n=1;
        q('cno').textContent=i+1; q('cn').textContent='STOP '+(i+1)+' OF '+T.steps.length; q('ct').textContent=S.title||''; q('ct').dataset.s=0;
        q('cx').innerHTML=P.map(ps=>'<p>'+ps.map(x=>'<span data-s="'+(n++)+'">'+esc(x)+'</span>').join('')+'</p>').join('');
        q('back').style.visibility=i?'visible':'hidden'; q('next').textContent=i<T.steps.length-1?'NEXT ▶':'FINISH'; q('snext').textContent='NEXT ▶';
        showMode(); T.cur=-1; mark();
        const wide=W>760, pw=RD.mode==='panel'&&wide?card.offsetWidth:0, ph=RD.mode==='panel'&&!wide?card.offsetHeight:RD.mode==='subs'?subs.offsetHeight:0, aw=W-pw, ah=H-ph-(pw?60:20);
        const a=S.at||[-.04,-.04,1.08,1.08], rw=a[2]*V.w, rh=a[3]*V.h, s=Math.min(V.max,Math.min(aw*.86/rw,ah*.86/rh)), x=aw/2-(a[0]*V.w+rw/2)*s, y=(pw?H/2:ah/2+12)-(a[1]*V.h+rh/2)*s;
        if(T.play)speak(0); else if(SP)SP.cancel();
        stop(); if(now){ V.s=s; V.x=x; V.y=y; put(); return; } const s0=V.s, x0=V.x, y0=V.y, t0=performance.now(), D=1300;
        const f=()=>{ const k=Math.min(1,(performance.now()-t0)/D), e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2, ls=Math.log(s0)+(Math.log(s)-Math.log(s0))*e, ss=Math.exp(ls), r=(ss-s0)/((s-s0)||1);
          V.s=ss; V.x=x0+(x-x0)*(Math.abs(s-s0)>1e-6?r:e); V.y=y0+(y-y0)*(Math.abs(s-s0)>1e-6?r:e); put(); if(k<1)anim=requestAnimationFrame(f); else anim=0; }; anim=requestAnimationFrame(f); };
      V.tourOn=()=>{ const T=TOURS[tkey(V.t)]; if(!T)return; TR.fonts(); look(); V.tour={...T,i:0,tok:0,cur:-1,sen:[],play:!!(SP&&RD.read)}; q('tour').hidden=true; V.go(0); };
      V.tourOff=()=>{ if(!V.tour)return; V.tour.tok++; V.tour=null; if(SP)SP.cancel(); card.hidden=true; subs.hidden=true; set.hidden=true; q('tour').hidden=!TOURS[tkey(V.t)]; stop(); fitNow(); };
      const play=()=>{ const T=V.tour; if(!T||!SP)return; if(T.play){ T.play=false; T.tok++; SP.cancel(); mark(); } else { T.play=true; speak(Math.max(0,T.cur)); } };
      const line=d=>{ const T=V.tour; if(!T)return; const k=(T.cur<0?0:T.cur)+d; if(k<0)return V.go(T.i-1); if(k>=T.sen.length)return q('next').onclick(); if(T.play)speak(k); else { T.cur=k; mark(); } };
      const swap=()=>{ RD.mode=RD.mode==='panel'?'subs':'panel'; TR.save(RD); if(V.tour)V.go(V.tour.i); };
      q('tour').onclick=V.tourOn; q('next').onclick=()=>{ const T=V.tour; if(!T)return; if(T.i>=T.steps.length-1)V.tourOff(); else V.go(T.i+1); }; q('back').onclick=()=>V.tour&&V.go(V.tour.i-1); q('end').onclick=q('send').onclick=q('end2').onclick=()=>V.tourOff();
      q('play').onclick=q('splay').onclick=play; q('sback').onclick=()=>line(-1); q('snext').onclick=()=>line(1); q('mode').onclick=q('smode').onclick=swap;
      q('rate').onclick=()=>{ const R=[.75,1,1.25,1.5]; RD.rate=R[(R.indexOf(RD.rate)+1)%R.length]; TR.save(RD); look(); TR.panel(set,RD,look); const T=V.tour; if(T&&T.play)speak(Math.max(0,T.cur)); };
      q('auto').onchange=e=>{ RD.next=e.target.checked; TR.save(RD); };
      q('aa').onclick=q('saa').onclick=()=>{ set.hidden=!set.hidden; if(!set.hidden)TR.panel(set,RD,()=>{ look(); if(V.tour)V.go(V.tour.i,true); }); };
      for(const w of [card,subs,set])for(const k of ['pointerdown','wheel','dblclick'])w.addEventListener(k,e=>e.stopPropagation(),{passive:true});
      V.close=()=>{ if(!el.hidden&&UI.gamewin==='art')UI.gamewin=null; if(V.tour)V.tour.tok++; V.tour=null; if(SP)SP.cancel(); card.hidden=true; subs.hidden=true; set.hidden=true; stop(); el.hidden=true; im.onload=null; if(V.full)V.full.src=''; V.full=null; V.got=false; V.t=null; };
      q('x').onclick=V.close; q('in').onclick=()=>zoom(1.6); q('out').onclick=()=>zoom(1/1.6); q('fit').onclick=fitNow; q('one').onclick=()=>zoom(1/V.s);
      el.addEventListener('wheel',e=>{ e.preventDefault(); zoom(Math.exp(-e.deltaY*.0018),e.clientX,e.clientY); },{passive:false});
      const P=new Map(); let pd=0;
      el.addEventListener('pointerdown',e=>{ if(e.target.tagName==='BUTTON')return; stop(); el.setPointerCapture(e.pointerId); P.set(e.pointerId,[e.clientX,e.clientY]); el.style.cursor='grabbing'; if(P.size===2){ const [a,b]=[...P.values()]; pd=Math.hypot(a[0]-b[0],a[1]-b[1]); } });
      el.addEventListener('pointermove',e=>{ const o=P.get(e.pointerId); if(!o)return; if(P.size===1){ V.x+=e.clientX-o[0]; V.y+=e.clientY-o[1]; P.set(e.pointerId,[e.clientX,e.clientY]); if(V.tour)put(); else clamp(); return; }
        P.set(e.pointerId,[e.clientX,e.clientY]); const [a,b]=[...P.values()], d=Math.hypot(a[0]-b[0],a[1]-b[1]); if(pd>0)zoom(d/pd,(a[0]+b[0])/2,(a[1]+b[1])/2); pd=d; });
      const up=e=>{ P.delete(e.pointerId); pd=0; if(!P.size)el.style.cursor='grab'; }; el.addEventListener('pointerup',up); el.addEventListener('pointercancel',up);
      el.addEventListener('dblclick',e=>{ if(e.target.tagName==='BUTTON')return; if(V.s>V.fit*1.05)fitNow(); else zoom(3,e.clientX,e.clientY); });
      addEventListener('resize',()=>{ if(!el.hidden)V.size(V.w,V.h,true); });
      addEventListener('keydown',e=>{ if(el.hidden)return; e.stopImmediatePropagation(); e.preventDefault(); const k=e.key;
        if(V.tour&&k===' ')return play(); if(V.tour&&k==='ArrowRight')return q('next').onclick(); if(V.tour&&k==='ArrowLeft')return V.go(V.tour.i-1); if(k==='Escape')return V.tour?V.tourOff():V.close();
        if(k==='+'||k==='=')zoom(1.6); else if(k==='-'||k==='_')zoom(1/1.6); else if(k==='0')fitNow();
        else if(/^Arrow/.test(k)){ V.x+=k==='ArrowLeft'?80:k==='ArrowRight'?-80:0; V.y+=k==='ArrowUp'?80:k==='ArrowDown'?-80:0; clamp(); } },true);
      addEventListener('keyup',e=>{ if(!el.hidden){ e.stopImmediatePropagation(); } },true);
      V.cap=q('cap'); V.st=q('st'); V.q=q; }
    const {el,im}=V; V.close(); V.t=t; V.look=p?{col:p.f.rm.col,gilt:[0,1,2].includes(p.f.rm.g),h:p.h}:null; el.hidden=false; if(!UI.gamewin)UI.gamewin='art'; V.q('tour').hidden=!TOURS[tkey(t)];
    V.cap.innerHTML='<div style="font-size:15px;color:#f4ecd4">'+esc(t.t.toUpperCase())+'</div><div style="margin-top:4px">'+esc(t.a.toUpperCase())+', '+esc(t.d)+'</div><div style="margin-top:4px;color:#a89c84">'+esc(t.m.toUpperCase())+' · PUBLIC DOMAIN</div>';
    im.onload=null; im.src=t.i; V.size(t.w*4,t.h*4); V.st.textContent=t.f?'LOADING FULL RESOLUTION…':'';
    if(t.f){ const F=V.full=new Image(); F.decoding='async'; F.onload=()=>{ if(V.full!==F||V.t!==t)return; im.src=F.src; V.got=true; V.size(F.naturalWidth,F.naturalHeight,true); V.st.textContent='FULL RESOLUTION · '+F.naturalWidth+' × '+F.naturalHeight; };
      F.onerror=()=>{ if(V.full===F)V.st.textContent='THE FULL PICTURE COULD NOT BE FETCHED'; }; F.src=t.f; } };
  const tkey=t=>t?t.t+'|'+t.a:'';
  A_.reader=()=>TR.get(); A_.readerReset=()=>TR.save({...TRD});
  A_.view=view; A_.viewer=()=>V&&{open:!V.el.hidden,full:!!V.got,w:V.w,h:V.h,s:+V.s.toFixed(3),fit:+V.fit.toFixed(3),max:+V.max.toFixed(3),t:V.t&&V.t.t,wall:!!V.look,tour:V.tour?{i:V.tour.i,n:V.tour.steps.length,title:V.tour.steps[V.tour.i].title}:null,hasTour:!!TOURS[tkey(V.t)]}; A_.tourOn=()=>V&&V.tourOn(); A_.tourNext=()=>V&&V.q('next').onclick(); A_.tourOff=()=>V&&V.tourOff();
  const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
  A_.viewOne=async t=>{ await LOAD('art'); if(!Object.keys(TOURS).length){ try{ TOURS=await ARTTOURS()||{}; }catch(e){ TOURS={}; } } view(t,null); };   // a painting hung elsewhere (the bookstore café) opens in this viewer with its tour
  STORE.pre.art=async()=>{ await LOAD('art'); if(!DATA){ DATA=await ART(); try{ TOURS=await ARTTOURS()||{}; }catch(e){ TOURS={}; } try{ TEX=await ARTTEX(); }catch(e){ TEX=null; } layout(); } };
  rec('art','THE ART MUSEUM',B,D,true).away=1;   // its inside stands off the map: inside it the whole map is hidden, not just what is near
  STORE.artFrame={B,FZ,cx,DOORY,data:()=>DATA};   // the inside's corner, its walls' height, the paintings' list, for what furnishes it
  STEPS.push(()=>{ '@later'; room('art','THE ART MUSEUM',B,{floor:null,in:()=>STONE,out:front,cope:STONEL},D,set0,{xo:1,noCeil:1,noWins:1}); const S=STORE.inside.art;
    if(S&&!S.done){ const g0=S.go; S.go=()=>{ g0(); for(const [a,c] of [[B.x0,cx-5],[cx-5,cx+5],[cx+5,B.x1]])K.flat(a,B.y0,c,B.y1,.15,marble,'L'); build(); if(STORE.furnish&&STORE.furnish.art)STORE.furnish.art(STORE.artFrame); }; }
    if(S)S.un=()=>{ A_.gen=(A_.gen||0)+1; for(const G of A_.groups){ const inG=o=>{ for(let q=o;q;q=q.parent)if(q===G)return true; return false; }; for(let i=UI.things.length-1;i>=0;i--)if(UI.things[i].obj&&inG(UI.things[i].obj))UI.things.splice(i,1);
      PERFX.owned.delete(G); G.removeFromParent(); G.traverse(c=>{ if(c.geometry)c.geometry.dispose(); for(const q of c.material?[].concat(c.material):[]){ if(q.map)q.map.dispose(); q.dispose(); } }); } A_.groups=[]; A_.built=false; A_.hung=0; };   // dropped when you leave (the paintings come back next time)
    const NRM={f:[0,1],b:[0,-1],w:[-1,0],e:[1,0]}; FACADES.make({id:'art',L,pt:TP.pt,z1:H,wall:[214,206,190],trim:[236,230,216],frame:[46,44,42],seed:41,ground:126,door:{u:cxL,w:1.6,h:118},glass:true}); if(0)BLOCKS.make({...LW,z0:0,z1:H,kind:'Rart',turn:TP,roof:(x,y)=>sh([58,57,57],.92+.12*hash(Math.floor(x*4),Math.floor(y*4),1769)),
      paint:(sd,u,z,f)=>{ const n=NRM[sd], P=sd==='f'?[u+OX,L.y1]:sd==='b'?[u+OX,L.y0]:sd==='w'?[L.x0+OX,u]:[L.x1+OX,u]; return front(n[0],n[1],P[0],P[1],z,f,H); }});
    sol(LW.x0,LW.y0,LW.x1,LW.y1,H); STORE.streetDoor.art={door:TP.pt(cxL,L.y1+.35),out:[...TP.pt(cxL,L.y1+1.4),TP.hd(0)]};
    STORE.bound.x1=Math.max(STORE.bound.x1,X(B.x1+20)); STORE.bound.z0=Math.min(STORE.bound.z0,Z(B.y0-6)); STORE.bound.z1=Math.max(STORE.bound.z1,Z(B.y1+6)); });
});
