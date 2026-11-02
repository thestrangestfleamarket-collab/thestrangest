// THE ART MUSEUM: on Market St, a stone front like the MUSEUM OF EARTH's (portico, ART MUSEUM over the door, two banners); its inside, built off the map behind the fade when you go in, three floors, each a stair hall (the stairs up and down, the elevator) between two big galleries (Dutch masters, old masters; Van Gogh and his time, French painting; American painting, Romantics and visionaries) hung with the public-domain paintings of data/art.json (the Met, Cleveland, the Rijksmuseum), each with its plaque: double-click a painting to see it full screen, its full-resolution file fetched from its museum only then, to zoom into.
import {SHARED, THREE} from './003-shx.js';
import {PERFX, pos, UI} from './003b-systems.js';
import {scene} from './004-main.js';
import {AWAY, BLDK, FADE, grab, OFFDX, STORE, SYS, TILE, TURN, WP} from './006-map-pre.js';
import {BLOCKS} from './038zb-blocks.js';
const ART=__LAZY__("data/art.json");
await grab('art',async()=>{ if(AWAY.has('art')||!WP.art)return;
  const K=STORE.kit, {room,rec,STEPS,sol,put}=K, SK=SHARED.BOD.STOREK, {CATALOG,LAMPS,T,sh,hash}=SK, MK=SK.museum, MB=MK.MUS.b, MUF=MK.font, {X,Y,Z,faceTex,bq,C}=SHARED.BOD, MS=STORE.main, U=TILE*BLDK;
  const H=196, IW=40, DEP=30, HW=7, NF=3, SPAN=DEP+12, ARCH=112, DW=3, ZC=52, ZPU=1/(SHARED.BOD.Y(1)/U), HALF=H/2, NS=20, FOOT=12.5, TOP=2.2;   // ZPU: z units in one map unit; FOOT, TOP: the stairs' foot and landing, from the back wall
  const LW=MS.lot('art',H), TP=TURN(LW,WP.art.face||'n'), L=TP.L, OX=1060+OFFDX/BLDK-TP.cx, cxL=(L.x0+L.x1)/2, cx=cxL+OX, EX=cx+5.3;
  // three floors off the map, side by side: each a stair hall in the middle (its stair core at the back: the flight up on the left, down on the right; the elevator beside it) and a big gallery either side
  const FB=[...Array(NF)].map((_,k)=>({id:k?'lart'+(k+1):'lart',x0:cx-IW/2,x1:cx+IW/2,y0:L.y1-DEP+k*SPAN,y1:L.y1+k*SPAN,h:H})), B=FB[0], W=IW;
  const SX=MB.x0+MB.x1, SY=MB.y0+MB.y1, dx=cx-(MB.x0+MB.x1)/2, dy=B.y1-MB.y1, OB={...MB,plain:1,id:'lmusfront'}, mus=(x,y)=>[SX-x+dx,SY-y+dy];
  const STONE=[214,206,188], STONEL=[226,220,204], STONED=[186,178,160], JOINT=[166,158,140], SKIRT=[48,40,34], OAK=[118,82,50], OAKL=[134,96,58], OAKD=[98,66,40], RAIL=[196,160,82];
  const GAL=[['DUTCH MASTERS',[104,124,106]],['OLD MASTERS',[150,78,70]],['VAN GOGH AND HIS TIME',[110,128,152]],['FRENCH PAINTING',[204,194,174]],['AMERICAN PAINTING',[162,146,118]],['ROMANTICS AND VISIONARIES',[124,110,134]]];
  const FLOORN=['DUTCH MASTERS · OLD MASTERS','VAN GOGH AND HIS TIME · FRENCH PAINTING','AMERICAN PAINTING · ROMANTICS AND VISIONARIES'];
  const RS=[]; FB.forEach((b,k)=>RS.push({k,key:'w',x0:b.x0,x1:cx-HW,y0:b.y0,y1:b.y1,name:GAL[2*k][0],col:GAL[2*k][1],g:2*k},{k,key:'h',x0:cx-HW,x1:cx+HW,y0:b.y0,y1:b.y1,name:k?'STAIR HALL':'THE GREAT HALL',col:null},{k,key:'e',x0:cx+HW,x1:b.x1,y0:b.y0,y1:b.y1,name:GAL[2*k+1][0],col:GAL[2*k+1][1],g:2*k+1}));
  const floorOf=y=>Math.max(0,Math.min(NF-1,Math.floor((y-B.y0+(SPAN-DEP)/2)/SPAN))), roomAt=(x,y)=>RS[floorOf(y)*3+(x<cx-HW?0:x<cx+HW?1:2)];
  const DOORS=b=>[b.y0+DEP*.3,b.y0+DEP*.7], D={w:'f',a:cx,wd:3,h:82};
  const OPEN=[['x',B.y1,cx,D.wd/2]]; for(const b of FB)for(const a of DOORS(b))OPEN.push(['y',cx-HW,a],['y',cx+HW,a]);
  const holesOn=(ax,at)=>OPEN.filter(o=>o[0]===ax&&Math.abs(o[1]-at)<.2).map(o=>[o[2]-(o[3]||DW/2),o[2]+(o[3]||DW/2)]);
  const hole=a=>({a0:a-DW/2,a1:a+DW/2,z0:0,z1:ARCH});
  const XW=k=>{ const b=FB[k], yF=b.y0+FOOT, ds=DOORS(b).map(hole); return [['hw'+k,'y',cx-HW,b.y0+T,b.y1-T,1,ds,true],['he'+k,'y',cx+HW,b.y0+T,b.y1-T,1,ds,true],['sw'+k,'y',cx-3.6,b.y0+T,yF,1,[],true],['sm'+k,'y',cx,b.y0+T,yF,1,[],true],['se'+k,'y',cx+3.6,b.y0+T,yF,1,[],true]]; };
  const fk=(nx,ny,at)=>nx+','+ny+','+at.toFixed(2);
  const GROUP=t=>{ const a=t.a, n=t.t; if(/Delaware|Andes|Twilight|Oxbow|Schroon|Gulf Stream|Madame X|George Washington|Stag at/.test(n))return 4; if(/Turner|Blake|Hokusai|Vedder|Redon|Bosch/.test(a))return 5;
    if(/Gogh|Gauguin|Seurat|Klimt|Hammersh/.test(a))return 2; if(/Monet|Cézanne|Degas|Rousseau|Bastien/.test(a))return 3; if(/Caravaggio|Botticelli|El Greco|Goya|David|Bruegel/.test(a)||/Aristotle/.test(n))return 1; return 0; };
  const size=t=>{ const ar=t.w/t.h, big=/Delaware|Andes|Night Watch/.test(t.t); let h=big?2.4:ar<.8?1.7:1.35, w=h*ar; if(!big&&w>2.6){ w=2.6; h=w/ar; } return [w,h]; };
  let DATA=null, LAY=null, FACEP={};
  // the hang: each gallery's paintings spread along its walls, clear of the doorways and corners; each goes to the wall with the most room left, then each wall's are spaced evenly; all shrink a little only if a gallery is short of wall
  const layout=()=>{ LAY=[]; FACEP={}; const by={}; DATA.forEach((t,i)=>{ const g=GROUP(t); (by[g]=by[g]||[]).push(i); });
    for(const r of RS){ if(r.g==null||!by[r.g])continue; const fs=[{ax:'y',at:r.x0+.1,nx:1,ny:0,a0:r.y0,a1:r.y1},{ax:'y',at:r.x1-.1,nx:-1,ny:0,a0:r.y0,a1:r.y1},{ax:'x',at:r.y0+.1,nx:0,ny:1,a0:r.x0,a1:r.x1},{ax:'x',at:r.y1-.1,nx:0,ny:-1,a0:r.x0,a1:r.x1}].map(f=>({...f,rm:r}));
      const segs=[]; for(const f of fs){ const cuts=holesOn(f.ax,f.at).filter(([a,b])=>b>f.a0&&a<f.a1).map(([a,b])=>[a-1,b+1]).sort((p,q)=>p[0]-q[0]); let a=f.a0+1.2; for(const c of cuts){ if(c[0]-a>2)segs.push({f,a0:a,a1:c[0]}); a=Math.max(a,c[1]); } if(f.a1-1.2-a>2)segs.push({f,a0:a,a1:f.a1-1.2}); }
      let out=null; for(let sc=1;sc>.4&&!out;sc-=.05){ const items=by[r.g].map(i=>{ const [w,h]=size(DATA[i]); return {i,w:w*sc,h:h*sc}; }).sort((p,q)=>q.w-p.w), S=segs.map(s=>({...s,it:[],used:0})); let ok=true;
        for(const it of items){ let best=null, bs=-1; for(const s of S){ const len=s.a1-s.a0; if(s.used+it.w+1.8*(s.it.length+2)>len)continue; const sp=(len-s.used-it.w)/(s.it.length+2); if(sp>bs){ bs=sp; best=s; } } if(!best){ ok=false; break; } best.it.push(it); best.used+=it.w; }
        if(!ok)continue; out=[]; for(const s of S){ if(!s.it.length)continue; const g=(s.a1-s.a0-s.used)/(s.it.length+1); let a=s.a0+g; for(const it of s.it){ out.push({...it,f:s.f,a:a+it.w/2}); a+=it.w+g; } } }
      if(!out){ console.warn('art museum: '+r.name+' is short of wall'); continue; } for(const p of out){ LAY.push(p); const key=fk(p.f.nx,p.f.ny,p.f.at); (FACEP[key]=FACEP[key]||[]).push(p); } } };
  const glyph=(s,k,c,z,z0)=>{ const i=Math.floor(c/k), r=Math.floor((z-z0)/k); if(c<0||r<0||r>6)return false; const g=MUF[s[Math.floor(i/6)]], q=i%6; return !!g&&q<5&&g[(6-r)*5+q]==='#'; };
  // the walls inside: the halls in the museum's ashlar (the elevator's steel doors in the back wall); the galleries an oak dado, a rail, their own colour (a light's wash over each painting), the picture rail, the gallery's name over each doorway, the cornice
  const hallWall=(u,z,f)=>{ const r=Math.floor(z/13), uu=u+(r&1)*18; if(z%13<1||((uu%36)+36)%36<1)return sh(JOINT,f); if(Math.abs(z-40)<1.5)return sh(STONED,f); return sh(hash(Math.floor(uu/36),r,1761)<.3?STONED:hash(Math.floor(u),z,1763)<.03?STONEL:STONE,f); };
  const lift=(x,z,f,k)=>{ const d=x-EX, a=Math.abs(d); if(Math.abs(d-1.55)<.12&&z>36&&z<46)return Object.assign([255,206,120],{e:1}); if(a>1.25||z>100)return null; if(a>1.05||z>=84&&z<88)return sh([70,72,78],f);
    if(z>=88){ if(a<.55&&z>90&&z<98){ const s=String(k+1), c=(d+.08)*24; return glyph(s,1,c+2.5,z,91)?Object.assign([255,180,70],{e:1}):[24,20,18]; } return sh([70,72,78],f); }
    if(a<.025)return [30,32,36]; return sh([156,160,166],f*(.94+.12*((Math.floor(z/3)+Math.floor(x*24))%5===0?0:1)*hash(Math.floor(x*24),Math.floor(z/6),1771))); };
  const gwall=(b,nx,ny,x,y,z,f)=>{ const r=roomAt(x-nx*.15,y-ny*.15), along=nx?y:x, u=along*24, ax=nx?'y':'x', at=nx?x:y;
    if(z>=H-10)return sh(z>=H-4?STONEL:Math.floor(u/4)%2?STONED:STONEL,f);
    for(const [a0,a1] of holesOn(ax,at)){ if(along>a0-.32&&along<a1+.32&&z<ARCH+9){ const e=Math.min(along-a0,a1-along); if(z>=ARCH||e<.3)return sh(z>=ARCH+5||Math.abs(along-Math.round(along*4)/4)<.012?STONED:STONEL,f); }
      if(z>=120&&z<=134&&Math.abs(along-(a0+a1)/2)<7){ const o=roomAt(x-nx*.4,y-ny*.4); if(o&&o!==r){ const s=o.name, tw=(s.length*6-1)*2, c=(ny>0||nx<0?(a0+a1)/2-along:along-(a0+a1)/2)*24+tw/2; if(glyph(s,2,c,z,120))return sh(RAIL,1.1); } } }
    if(r.key==='h'){ if(ny>0&&Math.abs(y-FB[r.k].y0-.1)<.15){ const l=lift(x,z,f,r.k); if(l)return l; } if(z<6)return sh(SKIRT,f); return hallWall(u,z,f); }
    if(z<4)return sh(SKIRT,f);
    if(z<30){ const p=((u%24)+24)%24; if(z<6||z>27||p<1||p>22)return sh(OAKD,f); if(p<2||z<7||z>26)return sh(OAKL,f); return sh(hash(Math.floor(u/24),Math.floor(z/5),1741)<.3?OAKD:OAK,f*(.96+.08*hash(Math.floor(u),Math.floor(z),1743))); }
    if(z<33||Math.abs(z-108)<1.2)return sh(RAIL,f);
    let w=1; for(const p of FACEP[fk(nx,ny,at)]||[]){ const d=Math.abs(along-p.a)/(p.w/2+1.1); if(d<1&&z>36){ const zt=ZC+p.h/2*ZPU; w=Math.max(w,1+.35*(1-d*d)*(z>zt?Math.max(0,1-(z-zt)/(114-zt)):1)); } }
    return sh(r.col,f*w*(.97+.06*hash(Math.floor(u/2),Math.floor(z/2),1745))); };
  // the floors: the halls' marble (the museum's own), parquet in the galleries, a dark marble sill in each doorway
  const parquet=(x,y)=>{ const Lb=.84, Wb=.14, a=(x+y)*Math.SQRT1_2, b=(x-y)*Math.SQRT1_2, i=Math.floor(a/Lb), j=Math.floor(b/Lb), A=(i+j)&1, p=A?b-j*Lb:a-i*Lb, q=A?a-i*Lb:b-j*Lb, k=Math.floor(p/Wb);
    if(p-k*Wb<.045||q<.045)return [70,48,30]; const n=hash(i*5+k,j*3+A,1751), c=n<.3?OAKD:n<.68?OAK:OAKL, g=hash(Math.floor(a*40),Math.floor(b*8),1753); return g<.06?sh(c,.9):g>.95?sh(c,1.07):c; };
  const floor=(x,y)=>{ for(const [ax,at,a,hw] of OPEN){ if(ax==='x')continue; const d=Math.abs(x-at); if(d<.32&&Math.abs(y-a)<(hw||DW/2)+.1)return hash(Math.floor(x*24),Math.floor(y*24),1755)<.08?[92,88,84]:[62,58,54]; }
    const r=roomAt(x,y); return r.key==='h'?MK.museumHallCol(x,y,{x0:r.x0+T,x1:r.x1-T,y0:r.y0+T,y1:r.y1-T}):parquet(x,y); };
  const BAN=[[cx-7.6,'VERMEER',[34,46,98]],[cx+7.6,'VAN GOGH',[122,30,34]]];
  const ban=(x,z,f)=>{ for(const [bx,s,col] of BAN){ const d=x-bx; if(Math.abs(d)>2.1||z<60||z>174)continue; if(z>170)return sh([40,36,34],f); if(Math.abs(d)>1.95||z<64)return sh(col,f*.7); if(Math.abs(z-72)<1.5)return sh([226,214,180],f);
      const tw=(s.length*6-1)*2; if(glyph(s,2,tw/2-d*24,z,128))return sh([236,226,196],f); return sh(col,f*(.96+.08*hash(Math.floor(x*24),Math.floor(z/2),1757))); } return null; };
  const front=(nx,ny,x,y,z,f,cap)=>{ if(ny>0){ const c=ban(x,z,f); if(c)return c; } const [mx,my]=mus(x,y); return MK.museumOutside(OB,-nx,-ny,mx,my,z,f,cap)||sh(STONEL,f); };
  const FW=[[0,1],[-1,0],[0,-1],[1,0]], mpS=(k,x,y,rot=0)=>{ const fn=CATALOG[k]; SHARED.BOD.K.STUDIO.face(FW[rot]); let p; try{ p=fn(+x.toFixed(3),+y.toFixed(3)); }finally{ SHARED.BOD.K.STUDIO.face(null); } if(!p)return null; p.kind=k;
    const px=(p.x0+p.x1)/2, py=(p.y0+p.y1)/2, q=TP.pt(SX-px+dx-OX,SY-py+dy); SHARED.BOD.placeAt(p,(2+TP.q)%4,px,py,q[0],q[1],true); return p; };
  const lamp=(x,y,z,r,c)=>LAMPS.push({own:1,room:1,day:true,x,y,z,r,c});
  const furnish=k=>{ const b=FB[k]; for(const r of RS.filter(r=>r.k===k)){ const mx=(r.x0+r.x1)/2;
      if(r.key==='h'){ lamp(cx,b.y0+FOOT+3,170,14,[1.4,1.36,1.24]); lamp(cx,b.y1-4,170,14,[1.4,1.36,1.24]); continue; }
      for(const t of [.35,.65])put('museum bench',mx,b.y0+DEP*t,1); for(const t of [.2,.5,.8])lamp(mx,b.y0+DEP*t,150,12,[1.6,1.5,1.32]); }
    put('potted palm',k?cx-1.8:cx+1.8,b.y0+2.6); };
  const set0=()=>{ const M=MK.MUS, py=MB.y0-3;
    mpS('museum portico steps',M.mid,(py+MB.y0)/2); for(const d of [-3.7,-1.2,1.2,3.7])mpS('museum column',M.mid+d,py+.7); mpS('art entablature',M.mid,py+.7,2);
    for(const [x,y] of [[cx-HW+1.6,B.y1-2.4],[cx+HW-1.6,B.y1-2.4],[cx-HW+1.6,B.y0+FOOT+4],[cx+HW-1.6,B.y0+FOOT+4]])put('museum hall column',x,y);
    put('information desk',cx+4,B.y1-4.6); put('museum bench',cx-2.4,B.y0+FOOT+6.5,1); put('dust in the air',cx-3,B.y1-7); furnish(0); };
  const floors=k=>{ const b=FB[k], yF=b.y0+FOOT, P=[[b.x0,b.y0,cx-HW,b.y1],[cx+HW,b.y0,b.x1,b.y1]]; if(k)P.push([cx-HW,b.y0,cx+.1,b.y1],[cx+3.5,b.y0,cx+HW,b.y1],[cx+.1,yF,cx+3.5,b.y1]); else P.push([cx-HW,b.y0,cx+HW,b.y1]); for(const [a,c,d,e] of P)K.flat(a,c,d,e,.15,floor,'L'); };   // in pieces: one picture for the whole floor is too big to pack
  const setK=k=>()=>{ floors(k); put('museum bench',cx-2.4,FB[k].y0+FOOT+6.5,1); furnish(k); };
  // the stairs: on each floor the flight up (left) climbs half a storey to a landing at the back, the flight down (right) sinks half a storey to one; a landing takes you on to the floor above or below
  const stair=(x,y)=>{ const k=floorOf(y), b=FB[k], yF=b.y0+FOOT, yT=b.y0+TOP; if(y>yF||y<b.y0)return null; const up=x>cx-3.5&&x<cx-.1&&k<NF-1, dn=x>cx+.1&&x<cx+3.5&&k>0; if(!up&&!dn)return null;
    const z=(y<yT?1:Math.ceil(Math.min(1,(yF-y)/(yF-yT))*NS)/NS)*HALF; return up?z:-z; };
  const A_=STORE.art={B,FB,RS,hung:0,groups:[],built:false,busy:false,pics:()=>A_.groups.flatMap(g=>g.children.filter(c=>c.userData.at))};
  { const sg0=STORE.stackGround; STORE.stackGround=(x,z)=>{ if(A_.built&&SHARED.LVL==='up'){ const u=x/U+SHARED.BOD.OX, v=z/U+SHARED.BOD.OY; if(u>B.x0&&u<B.x1&&v>B.y0&&v<FB[NF-1].y1){ const s=stair(u,v); if(s!=null)return Y(s); } } return sg0?sg0(x,z):null; }; }
  A_.floor=()=>{ const u=pos.x/U+SHARED.BOD.OX, v=pos.z/U+SHARED.BOD.OY; return u>B.x0&&u<B.x1&&v>B.y0-1&&v<FB[NF-1].y1+1?floorOf(v):-1; };
  A_.go=async(k,label,how)=>{ if(A_.busy||FADE.busy||!FB[k])return; A_.busy=true; const b=FB[k], s=how==='up'?[cx+1.8,b.y0+FOOT+1.1]:how==='down'?[cx-1.8,b.y0+FOOT+1.1]:[EX,b.y0+2.4];
    try{ await FADE.run(label,async()=>{ STORE.goTo(X(s[0]),Z(s[1]),'up',0); },{cut:true}); } finally{ A_.busy=false; } };
  SYS.add('places',()=>{ if(!A_.built||A_.busy||FADE.busy||SHARED.LVL!=='up')return; const k=A_.floor(); if(k<0)return; const b=FB[k], u=pos.x/U+SHARED.BOD.OX, v=pos.z/U+SHARED.BOD.OY; if(v>b.y0+TOP-.3||v<b.y0)return;
    if(u>cx-3.5&&u<cx-.1&&k<NF-1)A_.go(k+1,'UP TO FLOOR '+(k+2),'up'); else if(u>cx+.1&&u<cx+3.5&&k>0)A_.go(k-1,k===1?'DOWN TO THE GREAT HALL':'DOWN TO FLOOR '+k,'down'); },'059p-art');
  // the paintings: each a framed canvas (its picture a small JPEG from data/art.json) on its wall, a plaque beside it, a thing to read
  const plaque=t=>{ const cv=document.createElement('canvas'); cv.width=256; cv.height=112; const g=cv.getContext('2d'); g.fillStyle='#ebe6d8'; g.fillRect(0,0,256,112); g.fillStyle='#2a2622'; g.font='bold 20px Georgia,serif';
    const fit=(s,w)=>{ while(g.measureText(s).width>w&&s.length>3)s=s.slice(0,-2)+'…'; return s; }; g.fillText(fit(t.t,236),12,34); g.font='17px Georgia,serif'; g.fillText(fit(t.a+', '+t.d,236),12,62); g.fillStyle='#6a645c'; g.font='14px Georgia,serif'; g.fillText(fit(t.m,236),12,90);
    const tx=new THREE.CanvasTexture(cv); tx.colorSpace=THREE.SRGBColorSpace; return new THREE.Mesh(new THREE.PlaneGeometry(.44*U,.19*U),new THREE.MeshBasicMaterial({map:tx})); };
  const hang=()=>{ '@art'; if(!DATA||!LAY)return; const FG=FB.map((b,k)=>{ const g=new THREE.Group(); g.name='art museum floor '+(k+1); return g; }); stairs(FG); const TL=new THREE.TextureLoader(), gilt=new THREE.MeshLambertMaterial({color:0x9a7a34}), dark=new THREE.MeshLambertMaterial({color:0x2a1c14});
    for(const p of LAY){ const t=DATA[p.i], f=p.f, g=new THREE.Group(), w=p.w*U, h=p.h*U, old=[0,1,5].includes(f.rm.g)||/Stuart|Cole|Church|Leutze/.test(t.a);
      const fr=new THREE.Mesh(new THREE.BoxGeometry(w+.12*U,h+.12*U,.05*U),old?gilt:dark); fr.position.z=.025*U; g.add(fr);
      const tx=TL.load(t.i); tx.colorSpace=THREE.SRGBColorSpace; tx.anisotropy=4; const cv=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshLambertMaterial({map:tx})); cv.position.z=.052*U; g.add(cv);
      const pq=plaque(t); pq.position.set(w/2+.4*U,Y(44)-Y(ZC),.008*U); g.add(pq);
      if(f.ax==='y'){ g.position.set(X(f.at+f.nx*.012),Y(ZC),Z(p.a)); g.rotation.y=f.nx>0?Math.PI/2:-Math.PI/2; } else { g.position.set(X(p.a),Y(ZC),Z(f.at+f.ny*.012)); g.rotation.y=f.ny>0?0:Math.PI; }
      g.userData.at={k:f.rm.k,g:f.rm.g,key:fk(f.nx,f.ny,f.at),a:+p.a.toFixed(2),w:+p.w.toFixed(2)}; FG[f.rm.k].add(g); UI.thing({name:t.t.toUpperCase(),obj:g,reach:1.6*U,near:3.4*U,tall:h+.3*U,act:()=>view(t)}); }
    for(const g of FG){ scene.add(g); PERFX.own(g); } A_.groups=FG; A_.hung=LAY.length; A_.built=true; };
  const stairs=FG=>{ '@art'; let G=null; const tread=new THREE.MeshLambertMaterial({color:0xcfc6b4}), nose=new THREE.MeshLambertMaterial({color:0x8c8172}), well=new THREE.MeshLambertMaterial({color:0xb9b09e}), brass=new THREE.MeshLambertMaterial({color:0xb08a3e});
    const box=(x0,y0,x1,y1,z0,z1,m)=>{ const me=new THREE.Mesh(new THREE.BoxGeometry(Math.abs(X(x1)-X(x0)),Math.max(.001,Y(z1)-Y(z0)),Math.abs(Z(y1)-Z(y0))),m); me.position.set((X(x0)+X(x1))/2,(Y(z0)+Y(z1))/2,(Z(y0)+Z(y1))/2); me.receiveShadow=true; G.add(me); return me; };
    for(let k=0;k<NF;k++){ G=FG[k]; const b=FB[k], yF=b.y0+FOOT, yT=b.y0+TOP, run=(yF-yT)/NS, R=HALF/NS;
      if(k<NF-1){ for(let i=0;i<NS;i++){ const ya=yF-(i+1)*run, yb=yF-i*run; box(cx-3.5,ya,cx-.1,yb,0,(i+1)*R,tread); box(cx-3.5,yb-.06,cx-.1,yb,(i+1)*R-3,(i+1)*R+.3,nose); } box(cx-3.5,b.y0+T,cx-.1,yT,0,HALF,tread);
        for(const x of [cx-3.42,cx-.18]){ const me=box(x-.03,yT,x+.03,yF,0,4,brass), L=Math.hypot(Math.abs(Z(yF)-Z(yT)),Y(HALF)); me.geometry.dispose(); me.geometry=new THREE.BoxGeometry(.04*U,.04*U,L); me.position.set(X(x),Y(HALF/2+32),(Z(yF)+Z(yT))/2); me.rotation.x=-Math.atan2(Y(HALF),Math.abs(Z(yF)-Z(yT)))*Math.sign(Z(yF)-Z(yT)); } }
      if(k>0){ for(let i=0;i<NS;i++){ const ya=yF-(i+1)*run, yb=yF-i*run; box(cx+.1,ya,cx+3.5,yb,-HALF-4,-(i+1)*R,tread); box(cx+.1,yb-.06,cx+3.5,yb,-(i+1)*R-3,-(i+1)*R+.3,nose); } box(cx+.1,b.y0+T,cx+3.5,yT,-HALF-4,-HALF,tread);
        box(cx-.1,b.y0+T,cx+.1,yF,-HALF-4,0,well); box(cx+3.5,b.y0+T,cx+3.7,yF,-HALF-4,0,well); box(cx+.1,b.y0,cx+3.5,b.y0+T,-HALF-4,0,well); box(cx+.1,yF-.05,cx+3.5,yF,-HALF-4,-.5,well); }
      // the elevator's call: double-click its doors for the floors
      const hb=new THREE.Mesh(new THREE.BoxGeometry(2.2*U,Y(84),.5*U),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(X(EX),Y(42),Z(b.y0+.4)); G.add(hb);
      UI.thing({name:'ELEVATOR',ghost:1,obj:hb,reach:1.6*U,near:2.8*U,tall:Y(84),act:()=>liftMenu()}); } };
  let LM=null; const liftMenu=()=>{ '@art'; if(!LM){ LM=document.createElement('div'); LM.id='artlift'; LM.hidden=true; LM.style.cssText='position:fixed;left:50%;top:22%;transform:translateX(-50%);width:min(440px,92vw);z-index:22;padding:14px 16px;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#e8e2cc;background:#121110f2;border:2px solid #5a5248;zoom:var(--uiz,1)';
      document.body.appendChild(LM); LM.addEventListener('keydown',e=>{ if(e.key==='Escape')LM.hidden=true; e.stopPropagation(); }); LM.addEventListener('keyup',e=>e.stopPropagation()); }
    const k=A_.floor(); LM.innerHTML='<div style="margin-bottom:10px;color:#c8b98a">THE ELEVATOR</div>'+FLOORN.map((n,i)=>'<button data-f="'+i+'" style="display:block;width:100%;text-align:left;margin:0 0 6px;font:inherit;color:#e8e2cc;background:'+(i===k?'#3a3428':'#1c1a18')+';border:1px solid #5a5248;padding:8px 10px;cursor:pointer">'+(i+1)+(i===k?' · YOU ARE HERE':'')+'<br><span style="color:#a89c84">'+n+'</span></button>').join('')+'<button data-f="x" style="font:inherit;color:#e8e2cc;background:#1c1a18;border:1px solid #5a5248;padding:6px 10px;cursor:pointer">CLOSE</button>';
    for(const bt of LM.querySelectorAll('button'))bt.onclick=()=>{ LM.hidden=true; const f=bt.dataset.f; if(f!=='x'&&+f!==A_.floor())A_.go(+f,'THE ELEVATOR · FLOOR '+(+f+1),'lift'); };
    LM.hidden=false; if(UI.menuLook)UI.menuLook(); };
  A_.lay=()=>LAY?LAY.map(p=>({k:p.f.rm.k,g:p.f.rm.g,key:fk(p.f.nx,p.f.ny,p.f.at),a:+p.a.toFixed(2),w:+p.w.toFixed(2)})):[];
  A_.dbg=()=>({hung:A_.hung,n:DATA?DATA.length:0,lay:LAY?LAY.length:0,drawn:A_.groups.map(g=>window.VIS&&window.VIS.why(g).length?0:g.visible?1:0).join(''),galleries:RS.filter(r=>r.g!=null).length,floors:NF,floor:A_.floor()});
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
  STEPS.push(()=>{ room('art','THE ART MUSEUM',B,{floor:null,in:gwall,out:front,cope:STONEL},D,set0,{xw:XW(0),noWins:1}); const S=STORE.inside.art;
    if(S&&!S.done){ const g0=S.go; S.go=()=>{ g0(); floors(0); for(let k=1;k<NF;k++){ const n='THE ART MUSEUM · FLOOR '+(k+1); const R2=room('art'+(k+1),n,FB[k],{floor:null,in:gwall,out:(nx,ny,x,y,z,f)=>sh(STONE,f),cope:STONEL},null,setK(k),{xw:XW(k)}); R2.y0=Y(-HALF-8); MS.unplace(n); } hang(); }; }
    const NRM={f:[0,1],b:[0,-1],w:[-1,0],e:[1,0]}; BLOCKS.make({...LW,z0:0,z1:H,kind:'Rart',turn:TP,roof:(x,y)=>sh([58,57,57],.92+.12*hash(Math.floor(x*4),Math.floor(y*4),1769)),
      paint:(sd,u,z,f)=>{ const n=NRM[sd], P=sd==='f'?[u+OX,L.y1]:sd==='b'?[u+OX,L.y0]:sd==='w'?[L.x0+OX,u]:[L.x1+OX,u]; return front(n[0],n[1],P[0],P[1],z,f,H); }});
    sol(LW.x0,LW.y0,LW.x1,LW.y1,H); STORE.streetDoor.art={door:TP.pt(cxL,L.y1+.35),out:[...TP.pt(cxL,L.y1+1.4),TP.hd(0)]};
    STORE.bound.x1=Math.max(STORE.bound.x1,X(B.x1+20)); STORE.bound.z0=Math.min(STORE.bound.z0,Z(B.y0-6)); STORE.bound.z1=Math.max(STORE.bound.z1,Z(FB[NF-1].y1+6)); });
});
