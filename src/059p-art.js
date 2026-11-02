// THE ART MUSEUM: on Market St, a stone front like the MUSEUM OF EARTH's (portico, ART MUSEUM over the door, two banners); its inside, built off the map behind the fade when you go in, a marble great hall and five galleries (Dutch masters, old masters, Van Gogh and the North, French painting, American painting) hung with the public-domain paintings of data/art.json (the Met, Cleveland, the Rijksmuseum), each with its plaque: double-click a painting to see it full screen, its full-resolution file fetched from its museum only then, to zoom into.
import {SHARED, THREE} from './003-shx.js';
import {PERFX, UI} from './003b-systems.js';
import {scene} from './004-main.js';
import {AWAY, BLDK, grab, OFFDX, STORE, TILE, TURN, WP} from './006-map-pre.js';
import {BLOCKS} from './038zb-blocks.js';
const ART=__LAZY__("data/art.json");
await grab('art',async()=>{ if(AWAY.has('art')||!WP.art)return;
  const K=STORE.kit, {room,rec,STEPS,sol,put}=K, SK=SHARED.BOD.STOREK, {CATALOG,LAMPS,T,sh,hash}=SK, MK=SK.museum, MB=MK.MUS.b, MUF=MK.font, {X,Y,Z,faceTex,bq,C}=SHARED.BOD, MS=STORE.main, U=TILE*BLDK;
  const H=196, DEP=24, ARCH=104, DW=2.6, ZC=52, ZPU=1/(SHARED.BOD.Y(1)/U);   // ZPU: z units in one map unit
  const LW=MS.lot('art',H), TP=TURN(LW,WP.art.face||'n'), L=TP.L, OX=1060+OFFDX/BLDK-TP.cx, B={id:'lart',x0:L.x0+OX,x1:L.x1+OX,y0:L.y1-DEP,y1:L.y1,h:H}, cx=(B.x0+B.x1)/2, W=B.x1-B.x0, cxL=(L.x0+L.x1)/2;
  const SX=MB.x0+MB.x1, SY=MB.y0+MB.y1, dx=cx-(MB.x0+MB.x1)/2, dy=B.y1-MB.y1, OB={...MB,plain:1,id:'lmusfront'}, mus=(x,y)=>[SX-x+dx,SY-y+dy];
    const STONE=[214,206,188], STONEL=[226,220,204], STONED=[186,178,160], JOINT=[166,158,140], SKIRT=[48,40,34], OAK=[118,82,50], OAKL=[134,96,58], OAKD=[98,66,40], RAIL=[196,160,82];
  // the plan: three bays by two rows; the great hall in the middle of the front row, the galleries round it, doorways on the axes
  const x1=B.x0+W/3, x2=B.x0+2*W/3, ym=B.y1-DEP/2;
  const R={hall:{x0:x1,x1:x2,y0:ym,y1:B.y1,name:'THE GREAT HALL',col:null},g1:{x0:B.x0,x1,y0:ym,y1:B.y1,name:'DUTCH MASTERS',col:[58,84,66]},g2:{x0:x2,x1:B.x1,y0:ym,y1:B.y1,name:'OLD MASTERS',col:[126,42,40]},
    g3:{x0:B.x0,x1,y0:B.y0,y1:ym,name:'VAN GOGH AND THE NORTH',col:[60,76,102]},g4:{x0:x1,x1:x2,y0:B.y0,y1:ym,name:'FRENCH PAINTING',col:[198,188,172]},g5:{x0:x2,x1:B.x1,y0:B.y0,y1:ym,name:'AMERICAN PAINTING',col:[118,106,86]}};
  const roomAt=(x,y)=>{ const c=x<x1?0:x<x2?1:2; return y<ym?['g3','g4','g5'][c]:['g1','hall','g2'][c]; };
  const dy1=(ym+B.y1)/2, dy0=(B.y0+ym)/2, dxw=(B.x0+x1)/2, dxe=(x2+B.x1)/2, hole=a=>({a0:a-DW/2,a1:a+DW/2,z0:0,z1:ARCH});
  const XW=[['p1','y',x1,B.y0+T,B.y1-T,1,[hole(dy1),hole(dy0)],true],['p2','y',x2,B.y0+T,B.y1-T,1,[hole(dy1),hole(dy0)],true],['pm','x',ym,B.x0+T,B.x1-T,1,[hole(cx),hole(dxw),hole(dxe)],true]];
  const D={w:'f',a:cx,wd:3,h:82};
  const OPEN=[['y',x1,dy1],['y',x1,dy0],['y',x2,dy1],['y',x2,dy0],['x',ym,cx],['x',ym,dxw],['x',ym,dxe],['x',B.y1,cx,D.wd/2]];
  const holesOn=(ax,at)=>OPEN.filter(o=>o[0]===ax&&Math.abs(o[1]-at)<.2).map(o=>[o[2]-(o[3]||DW/2),o[2]+(o[3]||DW/2)]);
  // the faces the paintings hang on: each room's four walls, a tenth in from the wall line (where the wall's picture is drawn)
  const faces=[]; for(const k in R){ const r=R[k]; faces.push({rm:k,ax:'y',at:r.x0+.1,nx:1,ny:0,a0:r.y0,a1:r.y1},{rm:k,ax:'y',at:r.x1-.1,nx:-1,ny:0,a0:r.y0,a1:r.y1},{rm:k,ax:'x',at:r.y0+.1,nx:0,ny:1,a0:r.x0,a1:r.x1},{rm:k,ax:'x',at:r.y1-.1,nx:0,ny:-1,a0:r.x0,a1:r.x1}); }
  const fk=(nx,ny,at)=>nx+','+ny+','+at.toFixed(2);
  const GROUP=t=>{ const a=t.a; if(/Hokusai|Gogh|Klimt|Hammersh/.test(a))return 'g3'; if(/Rijksmuseum/.test(t.m)||/Vermeer|Rembrandt|Bruegel/.test(a))return 'g1'; if(/Caravaggio|Botticelli|El Greco|Goya|David|Bosch/.test(a))return 'g2';
    if(/Delaware|Heart of the Andes/.test(t.t))return 'hall'; if(/Turner|Blake|Stuart|Cole|Church|Homer|Sargent|Vedder|Bellows/.test(a))return 'g5'; return 'g4'; };
  const size=(t,big)=>{ const ar=t.w/t.h; let h=big?2.5:ar<.75?1.5:1.25, w=h*ar; if(!big&&w>2.5){ w=2.5; h=w/ar; } return [w,h]; };
  let DATA=null, LAY=null, FACEP={};
  // the hang: each room's paintings along its walls in order, clear of the doorways and corners, each run centred; all shrink a little if a room is short of wall
  const layout=()=>{ LAY=[]; FACEP={}; const by={}; DATA.forEach((t,i)=>{ const g=GROUP(t); (by[g]=by[g]||[]).push(i); });
    for(const rm in by){ const segs=[]; for(const f of faces.filter(f=>f.rm===rm)){ const cuts=holesOn(f.ax,f.at).map(([a,b])=>[a-.6,b+.6]).sort((p,q)=>p[0]-q[0]); let a=f.a0+.7; for(const c of cuts){ if(c[0]-a>1.2)segs.push({f,a0:a,a1:c[0]}); a=Math.max(a,c[1]); } if(f.a1-.7-a>1.2)segs.push({f,a0:a,a1:f.a1-.7}); }
      let out=null; for(let sc=1;sc>.5&&!out;sc-=.04){ const items=by[rm].map(i=>{ const [w,h]=size(DATA[i],rm==='hall'); return {i,w:w*sc,h:h*sc}; }), o=[]; let k=0;
        for(const s of segs){ const len=s.a1-s.a0, run=[]; let tot=0; while(k<items.length){ const it=items[k], need=(run.length?.6:0)+it.w; if(tot+need>len)break; run.push(it); tot+=need; k++; }
          let a=s.a0+(len-tot)/2; for(const it of run){ o.push({...it,f:s.f,a:a+it.w/2}); a+=it.w+.6; } }
        if(k>=items.length)out=o; }
      if(!out){ console.warn('art museum: '+rm+' is short of wall'); continue; } for(const p of out){ LAY.push(p); const key=fk(p.f.nx,p.f.ny,p.f.at); (FACEP[key]=FACEP[key]||[]).push(p); } } };
  const glyph=(s,k,c,z,z0)=>{ const i=Math.floor(c/k), r=Math.floor((z-z0)/k); if(c<0||r<0||r>6)return false; const g=MUF[s[Math.floor(i/6)]], q=i%6; return !!g&&q<5&&g[(6-r)*5+q]==='#'; };
  // the walls inside: the hall in the museum's ashlar; the galleries an oak dado, a rail, their own colour (a track light's wash over each painting), the picture rail, the gallery's name over each doorway, the cornice
  const hallWall=(u,z,f)=>{ const r=Math.floor(z/13), uu=u+(r&1)*18; if(z%13<1||((uu%36)+36)%36<1)return sh(JOINT,f); if(Math.abs(z-40)<1.5)return sh(STONED,f); return sh(hash(Math.floor(uu/36),r,1761)<.3?STONED:hash(Math.floor(u),z,1763)<.03?STONEL:STONE,f); };
  const gwall=(b,nx,ny,x,y,z,f)=>{ const rm=roomAt(x-nx*.15,y-ny*.15), r=R[rm], along=nx?y:x, u=along*24, ax=nx?'y':'x', at=nx?x:y;
    if(z>=H-10)return sh(z>=H-4?STONEL:Math.floor(u/4)%2?STONED:STONEL,f);
    for(const [a0,a1] of holesOn(ax,at)){ if(along>a0-.32&&along<a1+.32&&z<ARCH+9){ const e=Math.min(along-a0,a1-along); if(z>=ARCH||e<.3)return sh(z>=ARCH+5||Math.abs(along-Math.round(along*4)/4)<.012?STONED:STONEL,f); }
      if(z>=112&&z<=126&&Math.abs(along-(a0+a1)/2)<6){ const other=roomAt(x-nx*.4,y-ny*.4); if(other!==rm&&R[other]){ const s=R[other].name, tw=(s.length*6-1)*2, c=(ny>0||nx<0?(a0+a1)/2-along:along-(a0+a1)/2)*24+tw/2; if(glyph(s,2,c,z,112))return sh(RAIL,1.1); } } }
    if(rm==='hall'){ if(z<6)return sh(SKIRT,f); return hallWall(u,z,f); }
    if(z<4)return sh(SKIRT,f);
    if(z<30){ const p=((u%24)+24)%24; if(z<6||z>27||p<1||p>22)return sh(OAKD,f); if(p<2||z<7||z>26)return sh(OAKL,f); return sh(hash(Math.floor(u/24),Math.floor(z/5),1741)<.3?OAKD:OAK,f*(.96+.08*hash(Math.floor(u),Math.floor(z),1743))); }
    if(z<33||Math.abs(z-100)<1.2)return sh(RAIL,f);
    let w=1; for(const p of FACEP[fk(nx,ny,at)]||[]){ const d=Math.abs(along-p.a)/(p.w/2+.9); if(d<1&&z>36){ const zt=ZC+p.h/2*ZPU; w=Math.max(w,1+.4*(1-d*d)*(z>zt?Math.max(0,1-(z-zt)/(106-zt)):1)); } }
    return sh(r.col,f*w*(.97+.06*hash(Math.floor(u/2),Math.floor(z/2),1745))); };
  // the floors: the hall's marble (the museum's own), parquet in the galleries, a dark marble sill in each doorway
  const HALLR={x0:x1+T,x1:x2-T,y0:ym+T,y1:B.y1-T};
  const parquet=(x,y)=>{ const Lb=.84, Wb=.14, a=(x+y)*Math.SQRT1_2, b=(x-y)*Math.SQRT1_2, i=Math.floor(a/Lb), j=Math.floor(b/Lb), A=(i+j)&1, p=A?b-j*Lb:a-i*Lb, q=A?a-i*Lb:b-j*Lb, k=Math.floor(p/Wb);
    if(p-k*Wb<.045||q<.045)return [70,48,30]; const n=hash(i*5+k,j*3+A,1751), c=n<.3?OAKD:n<.68?OAK:OAKL, g=hash(Math.floor(a*40),Math.floor(b*8),1753); return g<.06?sh(c,.9):g>.95?sh(c,1.07):c; };
  const floor=(x,y)=>{ for(const [ax,at,a,hw] of OPEN){ if(at===B.y1)continue; const d=ax==='y'?Math.abs(x-at):Math.abs(y-at), al=ax==='y'?y:x; if(d<.32&&Math.abs(al-a)<(hw||DW/2)+.1)return hash(Math.floor(x*24),Math.floor(y*24),1755)<.08?[92,88,84]:[62,58,54]; }
    return roomAt(x,y)==='hall'?MK.museumHallCol(x,y,HALLR):parquet(x,y); };
  // the front: the museum's stone, door and portico, ART MUSEUM lit on the entablature, two banners
  const BAN=[[cx-7.6,'VERMEER',[34,46,98]],[cx+7.6,'VAN GOGH',[122,30,34]]];
  const ban=(x,z,f)=>{ for(const [bx,s,col] of BAN){ const d=x-bx; if(Math.abs(d)>2.1||z<60||z>174)continue; if(z>170)return sh([40,36,34],f); if(Math.abs(d)>1.95||z<64)return sh(col,f*.7); if(Math.abs(z-72)<1.5)return sh([226,214,180],f);
      const tw=(s.length*6-1)*2; if(glyph(s,2,tw/2-d*24,z,128))return sh([236,226,196],f); return sh(col,f*(.96+.08*hash(Math.floor(x*24),Math.floor(z/2),1757))); } return null; };
  const front=(nx,ny,x,y,z,f,cap)=>{ if(ny>0){ const c=ban(x,z,f); if(c)return c; } const [mx,my]=mus(x,y); return MK.museumOutside(OB,-nx,-ny,mx,my,z,f,cap)||sh(STONEL,f); };
  const FW=[[0,1],[-1,0],[0,-1],[1,0]], mpS=(k,x,y,rot=0)=>{ const fn=CATALOG[k]; SHARED.BOD.K.STUDIO.face(FW[rot]); let p; try{ p=fn(+x.toFixed(3),+y.toFixed(3)); }finally{ SHARED.BOD.K.STUDIO.face(null); } if(!p)return null; p.kind=k;
    const px=(p.x0+p.x1)/2, py=(p.y0+p.y1)/2, q=TP.pt(SX-px+dx-OX,SY-py+dy); SHARED.BOD.placeAt(p,(2+TP.q)%4,px,py,q[0],q[1],true); return p; };
  const lamp=(x,y,z,r,c)=>LAMPS.push({own:1,room:1,day:true,x,y,z,r,c});
  const set=()=>{ const M=MK.MUS, py=MB.y0-3;
    mpS('museum portico steps',M.mid,(py+MB.y0)/2); for(const d of [-3.7,-1.2,1.2,3.7])mpS('museum column',M.mid+d,py+.7); mpS('art entablature',M.mid,py+.7,2);
    for(const [x,y] of [[x1+2.2,ym+2.4],[x2-2.2,ym+2.4],[x1+2.2,B.y1-2.4],[x2-2.2,B.y1-2.4]])put('museum hall column',x,y);
    put('information desk',cx+3.4,B.y1-4.4); put('museum bench',cx-1.3,ym+4.2); put('museum bench',cx+1.3,ym+4.2,2); put('dust in the air',cx-3,ym+6.5); put('dust in the air',cx+3,ym+5.5);
    for(const k of ['g1','g2','g3','g4','g5']){ const r=R[k], mx=(r.x0+r.x1)/2, my=(r.y0+r.y1)/2; put('museum bench',mx,my,k==='g1'||k==='g3'?1:k==='g4'?0:3); lamp(mx,my-3,128,10,[1.35,1.26,1.08]); lamp(mx,my+3,128,10,[1.35,1.26,1.08]); }
    lamp(cx,ym+3.6,162,14,[1.3,1.26,1.16]); lamp(cx,B.y1-3.6,162,14,[1.3,1.26,1.16]); };
  // the paintings: each a framed canvas (its picture a small JPEG from data/art.json) on its wall, a plaque beside it, a thing to read
  const A_=STORE.art={B,R,hung:0,group:null,dbg:()=>({hung:A_.hung,n:DATA?DATA.length:0,lay:LAY?LAY.length:0,drawn:!!(A_.group&&A_.group.visible),rooms:Object.keys(R).length})};
  const plaque=t=>{ const cv=document.createElement('canvas'); cv.width=256; cv.height=112; const g=cv.getContext('2d'); g.fillStyle='#ebe6d8'; g.fillRect(0,0,256,112); g.fillStyle='#2a2622'; g.font='bold 20px Georgia,serif';
    const fit=(s,w)=>{ while(g.measureText(s).width>w&&s.length>3)s=s.slice(0,-2)+'…'; return s; }; g.fillText(fit(t.t,236),12,34); g.font='17px Georgia,serif'; g.fillText(fit(t.a+', '+t.d,236),12,62); g.fillStyle='#6a645c'; g.font='14px Georgia,serif'; g.fillText(fit(t.m,236),12,90);
    const tx=new THREE.CanvasTexture(cv); tx.colorSpace=THREE.SRGBColorSpace; return new THREE.Mesh(new THREE.PlaneGeometry(.44*U,.19*U),new THREE.MeshBasicMaterial({map:tx})); };
  const hang=()=>{ '@art'; if(!DATA||!LAY)return; const G=new THREE.Group(); G.name='art museum'; const TL=new THREE.TextureLoader(), gilt=new THREE.MeshLambertMaterial({color:0x9a7a34}), dark=new THREE.MeshLambertMaterial({color:0x2a1c14});
    for(const p of LAY){ const t=DATA[p.i], f=p.f, g=new THREE.Group(), w=p.w*U, h=p.h*U, old=f.rm==='g1'||f.rm==='g2'||f.rm==='hall'||/Turner|Blake|Stuart|Cole|Church|Hokusai/.test(t.a);
      const fr=new THREE.Mesh(new THREE.BoxGeometry(w+.12*U,h+.12*U,.05*U),old?gilt:dark); fr.position.z=.025*U; g.add(fr);
      const tx=TL.load(t.i); tx.colorSpace=THREE.SRGBColorSpace; tx.anisotropy=4; const cv=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshLambertMaterial({map:tx})); cv.position.z=.052*U; g.add(cv);
      const pq=plaque(t); pq.position.set(w/2+.4*U,Y(44)-Y(ZC),.008*U); g.add(pq);
      if(f.ax==='y'){ g.position.set(X(f.at+f.nx*.012),Y(ZC),Z(p.a)); g.rotation.y=f.nx>0?Math.PI/2:-Math.PI/2; } else { g.position.set(X(p.a),Y(ZC),Z(f.at+f.ny*.012)); g.rotation.y=f.ny>0?0:Math.PI; }
      G.add(g); UI.thing({name:t.t.toUpperCase(),obj:g,reach:1.6*U,near:3.4*U,tall:h+.3*U,act:()=>view(t)}); }
    scene.add(G); PERFX.own(G); A_.group=G; A_.hung=LAY.length; };
  // the viewer: double-click a painting and it fills the screen; the museum's full-resolution file is fetched only then (the small picture shows until it comes); wheel, pinch, + and - zoom, drag pans, double-click zooms in or back
  let V=null;
  const view=t=>{ '@art'; if(!V){ const el=document.createElement('div'); el.id='artview'; el.hidden=true;
      el.style.cssText='position:fixed;inset:0;z-index:30;background:#0c0b0a;overflow:hidden;touch-action:none;user-select:none;cursor:grab;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#e8e2cc';
      el.innerHTML='<img alt="" draggable="false" style="position:absolute;left:0;top:0;transform-origin:0 0;image-rendering:auto;max-width:none;max-height:none;box-shadow:0 0 40px #000">'+
        '<div data-k="cap" style="position:absolute;left:0;right:0;bottom:0;padding:14px 18px;background:linear-gradient(transparent,#0c0b0ae8 40%);pointer-events:none"></div>'+
        '<div style="position:absolute;top:12px;right:12px;display:flex;gap:6px"><button data-k="out">−</button><button data-k="in">+</button><button data-k="fit">FIT</button><button data-k="one">FULL SIZE</button><button data-k="x">CLOSE ✕</button></div>'+
        '<div data-k="st" style="position:absolute;top:16px;left:18px;color:#c8b98a"></div>';
      for(const b of el.querySelectorAll('button'))b.style.cssText='font:inherit;color:#e8e2cc;background:#1c1a18e0;border:1px solid #5a5248;padding:6px 10px;cursor:pointer';
      document.body.appendChild(el); const im=el.querySelector('img'), q=k=>el.querySelector('[data-k="'+k+'"]');
      V={el,im,s:1,x:0,y:0,w:1,h:1,fit:1,max:8,full:null,t:null};
      const clamp=()=>{ const W=el.clientWidth, H=el.clientHeight, w=V.w*V.s, h=V.h*V.s; V.x=w<W?(W-w)/2:Math.min(0,Math.max(W-w,V.x)); V.y=h<H?(H-h)/2:Math.min(0,Math.max(H-h,V.y)); im.style.transform='translate('+V.x+'px,'+V.y+'px) scale('+V.s+')'; };
      const zoom=(k,cx=el.clientWidth/2,cy=el.clientHeight/2)=>{ const s=Math.min(V.max,Math.max(V.fit,V.s*k)), r=s/V.s; V.x=cx-(cx-V.x)*r; V.y=cy-(cy-V.y)*r; V.s=s; clamp(); };
      const fitNow=()=>{ const W=el.clientWidth, H=el.clientHeight; V.fit=Math.min((W-40)/V.w,(H-90)/V.h); V.max=V.got?Math.max(V.fit*1.5,4):V.fit*3; V.s=V.fit; V.x=V.y=0; clamp(); };
      V.size=(w,h,keep)=>{ const c=keep?{cx:(el.clientWidth/2-V.x)/(V.w*V.s),cy:(el.clientHeight/2-V.y)/(V.h*V.s),r:V.s/V.fit}:null; V.w=w; V.h=h; im.style.width=w+'px'; im.style.height=h+'px'; fitNow();
        if(c){ V.s=Math.min(V.max,V.fit*c.r); V.x=el.clientWidth/2-c.cx*V.w*V.s; V.y=el.clientHeight/2-c.cy*V.h*V.s; clamp(); } };
      V.close=()=>{ if(!el.hidden&&UI.gamewin==='art')UI.gamewin=null; el.hidden=true; im.onload=null; if(V.full)V.full.src=''; V.full=null; V.got=false; V.t=null; };
      q('x').onclick=V.close; q('in').onclick=()=>zoom(1.6); q('out').onclick=()=>zoom(1/1.6); q('fit').onclick=fitNow; q('one').onclick=()=>zoom(1/V.s);
      el.addEventListener('wheel',e=>{ e.preventDefault(); zoom(Math.exp(-e.deltaY*.0018),e.clientX,e.clientY); },{passive:false});
      const P=new Map(); let pd=0, last=0;
      el.addEventListener('pointerdown',e=>{ if(e.target.tagName==='BUTTON')return; el.setPointerCapture(e.pointerId); P.set(e.pointerId,[e.clientX,e.clientY]); el.style.cursor='grabbing'; if(P.size===2){ const [a,b]=[...P.values()]; pd=Math.hypot(a[0]-b[0],a[1]-b[1]); } });
      el.addEventListener('pointermove',e=>{ const o=P.get(e.pointerId); if(!o)return; if(P.size===1){ V.x+=e.clientX-o[0]; V.y+=e.clientY-o[1]; P.set(e.pointerId,[e.clientX,e.clientY]); clamp(); return; }
        P.set(e.pointerId,[e.clientX,e.clientY]); const [a,b]=[...P.values()], d=Math.hypot(a[0]-b[0],a[1]-b[1]); if(pd>0)zoom(d/pd,(a[0]+b[0])/2,(a[1]+b[1])/2); pd=d; });
      const up=e=>{ P.delete(e.pointerId); pd=0; if(!P.size)el.style.cursor='grab'; }; el.addEventListener('pointerup',up); el.addEventListener('pointercancel',up);
      el.addEventListener('dblclick',e=>{ if(e.target.tagName==='BUTTON')return; if(V.s>V.fit*1.05)fitNow(); else zoom(3,e.clientX,e.clientY); });
      addEventListener('resize',()=>{ if(!el.hidden)V.size(V.w,V.h,true); });
      addEventListener('keydown',e=>{ if(el.hidden)return; e.stopImmediatePropagation(); e.preventDefault(); const k=e.key; if(k==='Escape')V.close(); else if(k==='+'||k==='=')zoom(1.6); else if(k==='-'||k==='_')zoom(1/1.6); else if(k==='0')fitNow();
        else if(/^Arrow/.test(k)){ V.x+=k==='ArrowLeft'?80:k==='ArrowRight'?-80:0; V.y+=k==='ArrowUp'?80:k==='ArrowDown'?-80:0; clamp(); } },true);
      addEventListener('keyup',e=>{ if(!el.hidden){ e.stopImmediatePropagation(); } },true);
      V.cap=q('cap'); V.st=q('st'); }
    const {el,im}=V; V.close(); V.t=t; el.hidden=false; if(!UI.gamewin)UI.gamewin='art';
    V.cap.innerHTML='<div style="font-size:15px;color:#f4ecd4">'+esc(t.t.toUpperCase())+'</div><div style="margin-top:4px">'+esc(t.a.toUpperCase())+', '+esc(t.d)+'</div><div style="margin-top:4px;color:#a89c84">'+esc(t.m.toUpperCase())+' · PUBLIC DOMAIN (CC0)</div>';
    im.onload=null; im.src=t.i; V.size(t.w*4,t.h*4); V.st.textContent=t.f?'LOADING FULL RESOLUTION…':'';
    if(t.f){ const F=V.full=new Image(); F.decoding='async'; F.onload=()=>{ if(V.full!==F||V.t!==t)return; im.src=F.src; V.got=true; V.size(F.naturalWidth,F.naturalHeight,true); V.st.textContent='FULL RESOLUTION · '+F.naturalWidth+' × '+F.naturalHeight; };
      F.onerror=()=>{ if(V.full===F)V.st.textContent='THE FULL PICTURE COULD NOT BE FETCHED'; }; F.src=t.f; } };
  A_.view=view; A_.viewer=()=>V&&{open:!V.el.hidden,full:!!V.got,w:V.w,h:V.h,s:+V.s.toFixed(3),fit:+V.fit.toFixed(3),max:+V.max.toFixed(3),t:V.t&&V.t.t};
  const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
  STORE.pre.art=async()=>{ await LOAD('art'); if(!DATA){ DATA=await ART(); layout(); } };
  rec('art','THE ART MUSEUM',B,D,true);
  STEPS.push(()=>{ room('art','THE ART MUSEUM',B,{floor,in:gwall,out:front,cope:STONEL},D,set,{xw:XW,noWins:1}); const S=STORE.inside.art; if(S&&!S.done){ const g0=S.go; S.go=()=>{ g0(); hang(); }; }
    const NRM={f:[0,1],b:[0,-1],w:[-1,0],e:[1,0]}; BLOCKS.make({...LW,z0:0,z1:H,kind:'Rart',turn:TP,roof:(x,y)=>sh([58,57,57],.92+.12*hash(Math.floor(x*4),Math.floor(y*4),1769)),
      paint:(sd,u,z,f)=>{ const n=NRM[sd], P=sd==='f'?[u+OX,L.y1]:sd==='b'?[u+OX,L.y0]:sd==='w'?[L.x0+OX,u]:[L.x1+OX,u]; return front(n[0],n[1],P[0],P[1],z,f,H); }});
    sol(LW.x0,LW.y0,LW.x1,LW.y1,H); STORE.streetDoor.art={door:TP.pt(cxL,L.y1+.35),out:[...TP.pt(cxL,L.y1+1.4),TP.hd(0)]};
    STORE.bound.x1=Math.max(STORE.bound.x1,X(B.x1+20)); STORE.bound.z0=Math.min(STORE.bound.z0,Z(B.y0-6)); STORE.bound.z1=Math.max(STORE.bound.z1,Z(B.y1+6)); });
});
