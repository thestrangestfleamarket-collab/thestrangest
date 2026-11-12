// THE STORE: rooms with doors (diner, bar, museum, keep, cottage, aquarium, avenue) and their places in the menu. Its own builder.
import {SHARED, THREE} from './003-shx.js';
import {BATCH, CLIP, INTERIORS, LITE, NPCS, pos, ROOMS, SHAD, UI, WEEDS, WINDOWS} from './003b-systems.js';
import {scene} from './004-main.js';
import {AWAY, BF, BLDK, cutWalls, EASTX, FADE, FIX, grab, lamps, LAY, OFFDX, QS, SOL, START, STORE, SYS, TILE, ZU} from './006-map-pre.js';
import {FLAME} from './007-fire.js';
import {OBJ, PEEK} from './008-batch.js';
import {WATER} from './009-down.js';
import {BLOCKS} from './038zb-blocks.js';
await grab('store',async()=>{ const K=SHARED.BOD.STOREK, {X,Y,Z,gbox,faceTex,bq,C,place,facade}=SHARED.BOD, {CATALOG,PROPS,LAMPS,PRESETS,LBLD,T,sh,hash}=K, {grain,speck,lawnCol:grassCol}=SHARED.BOD.g;
  const B_=id=>LBLD.find(b=>b.id===id);
  STORE.here=id=>{ const R=STORE.inside[id]||STORE.rooms.find(r=>r.id===id); if(!R||!R.B||SHARED.LVL!=='up')return false; const B=R.B, xa=X(B.x0), xb=X(B.x1), za=Z(B.y0), zb=Z(B.y1); return pos.x>Math.min(xa,xb)&&pos.x<Math.max(xa,xb)&&pos.z>Math.min(za,zb)&&pos.z<Math.max(za,zb); };
  const LG=k=>{ const o=LAY.o(k); return [o.x/BLDK,o.y/BLDK]; }, AO=LG('apartments');
  for(const [id,k] of [['ldiner','diner'],['lbodega2','bar'],['lcastle','apartments']]){ const b=B_(id), [dx,dy]=LG(k); if(b&&!b.laid){ b.x0+=dx; b.x1+=dx; b.y0+=dy; b.y1+=dy; b.laid=1; } }
  for(const [id,k] of [['ldiner','diner'],['lbodega2','bar']]){ const b=B_(id), sc=LAY.s(k); if(b&&!b.sized){ b.sized=1; b.s=sc; if(sc!==1){ const m=(b.x0+b.x1)/2, f=b.y1; b.x0=m+(b.x0-m)*sc; b.x1=m+(b.x1-m)*sc; b.y0=f+(b.y0-f)*sc; } } }
  const laid=(k,fn)=>{ const h=LAY.h(k); return h?lift(h*TILE/ZU/BLDK,fn):fn(); };
  const PLATE={x0:334+OFFDX/BLDK,y0:-100,x1:456+OFFDX/BLDK,y1:-70};
  const flat=(x0,y0,x1,y1,z,col,kind)=>bq([X(x0),Y(z),Z(y1)],[X(x1),Y(z),Z(y1)],[X(x1),Y(z),Z(y0)],[X(x0),Y(z),Z(y0)],faceTex((x1-x0)*24,(y1-y0)*24,(i,j)=>C(col(x0+(i+.5)/24,y1-(j+.5)/24))),kind);
  const sBlobM=SHAD.mat({alpha:.4}), storeBlob=(p,rot)=>{ '@later'; if(!p.boxes||!p.boxes.some(b=>b.z0<2&&b.z1-b.z0>1.5))return;   // floor-standing furniture only: skip flat things (rugs, litter) and anything up a wall
    let w=Math.abs(X(p.x1)-X(p.x0)), d=Math.abs(Z(p.y1)-Z(p.y0)); const a=w*d/(TILE*TILE); if(a<.08||a>5)return;   // skip tiny bits and room-spanning counters/walls
    if(rot&1){ const t=w; w=d; d=t; } SHAD.blob(scene,X((p.x0+p.x1)/2),Y(0),Z((p.y0+p.y1)/2),w*1.12,d*1.15,{mat:sBlobM}); };
  const put=(kind,x,y,rot=0)=>{ const f=CATALOG[kind]; if(!f){ console.warn('store: no',kind); return null; } const p=f(+x.toFixed(3),+y.toFixed(3)); if(!p)return null; p.kind=kind; place(p,rot); storeBlob(p,rot); return p; };
  const sol=(x0,y0,x1,y1,zt)=>{ SOL.up.push([X(x0),Z(y0),X(x1),Z(y1)]); FIX.up.push([X(x0),Z(y0),0,X(x1),Z(y1),Math.max(.05,Y(zt))]); };
  const roofCol=(x,y)=>{ const n=grain(x,y,61,1.4); return speck(n<.35?[50,50,52]:n>.7?[66,64,62]:[58,57,57],x,y,63); };
  const planes={}, cuts=[], WALKIN={}; STORE.inside={};
  const CEIL=(x0,z0,x1,z1,y)=>{ '@later'; const g=new THREE.PlaneGeometry(Math.abs(x1-x0),Math.abs(z1-z0)).rotateX(Math.PI/2), me=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:0x5a544c,clippingPlanes:[new THREE.Plane(new THREE.Vector3(0,-1,0),1e6)]})); me.position.set((x0+x1)/2,y,(z0+z1)/2); me.receiveShadow=true; scene.add(me); return me; }; STORE.CEIL=CEIL;
  STORE.streetDoor={};
  const turnIn=(TB,n0,l0)=>{ if(!TB.q)return; for(const p of PROPS.slice(n0))SHARED.BOD.placeAt(p,TB.q,TB.cx,TB.cy,TB.cx,TB.cy); for(const l of LAMPS.slice(l0))[l.x,l.y]=TB.pt(l.x,l.y); }; STORE.turnIn=turnIn;
  const room=(id,name,B,look,door,set,o={})=>{ '@later'; const n0=PROPS.length, l0=LAMPS.length; set(B,l0); const all=PROPS.slice(n0), lamAll=LAMPS.slice(l0);
    const lazy=!!(door&&look.in&&!o.now&&!STORE.now), inB=b=>b.x0>=B.x0-.2&&b.x1<=B.x1+.2&&b.y0>=B.y0-.2&&b.y1<=B.y1+.2;
    const mid=p=>{ const bs=p.boxes; let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9; for(const b of bs){ x0=Math.min(x0,b.x0); y0=Math.min(y0,b.y0); x1=Math.max(x1,b.x1); y1=Math.max(y1,b.y1); } const cx=(x0+x1)/2, cy=(y0+y1)/2; return cx>B.x0&&cx<B.x1&&cy>B.y0&&cy<B.y1; };   // a prop whose middle is inside belongs to the inside (a soffit or a stair may poke into the wall)
    const inner=lazy?all.filter(p=>p.boxes&&p.boxes.length&&(p.boxes.every(inB)||mid(p))):[], outer=all.filter(p=>!inner.includes(p));
    const lin=lazy?lamAll.filter(l=>l.x>B.x0&&l.x<B.x1&&l.y>B.y0&&l.y<B.y1):[], lout=lamAll.filter(l=>!lin.includes(l));
    const boxes=props=>{ for(const p of props){ BATCH.tag=OBJ('store:'+id,p.name||p.kind); const pw=o.pieceWalls&&o.pieceWalls[p.kind], kind=pw?'W'+id+':'+pw[0]:o.pieceWalls&&/roof/.test(p.kind||'')?'R'+id:'L';
      if(pw&&!planes[kind]){ planes[kind]=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6); cuts.push({kind,nx:pw[1],nz:pw[2],id}); }
      for(const b of p.boxes)gbox(b,kind); } BATCH.tag=null; };
    const solids_=props=>{ for(const p of props){ if(p.high||p.walk)continue;
      if(p.solids){ for(const s of p.solids)sol(s.x0,s.y0,s.x1,s.y1,60); continue; }
      const bs=p.boxes.filter(b=>!b.nb&&b.z0<30&&b.z1-b.z0>3); if(!bs.length)continue;
      if(/wall|parapet/.test(p.kind||p.name||'')){ for(const b of bs)sol(b.x0,b.y0,b.x1,b.y1,b.z1); continue; }
      const r={x0:Math.min(...bs.map(b=>b.x0)),y0:Math.min(...bs.map(b=>b.y0)),x1:Math.max(...bs.map(b=>b.x1)),y1:Math.max(...bs.map(b=>b.y1))}; sol(r.x0,r.y0,r.x1,r.y1,Math.max(...bs.map(b=>b.z1))); } };
    const lamps_=lam=>{
      for(const l of lam){ if(l.off||!(l.r>0))continue; const cm=Math.max(...l.c); if(!(cm>0))continue; const L=new THREE.PointLight(new THREE.Color(l.c[0]/cm,l.c[1]/cm,l.c[2]/cm),7*cm*Math.min(1.2,l.r/5),l.r*TILE*1.25,1.6);
      L.position.set(X(l.x),Y(l.z),Z(l.y)); L.userData.i0=L.intensity; scene.add(L); lamps.push(L);
      if(l.r>=3||l.neon){ L.castShadow=true; L.shadow.mapSize.set(256,256); L.shadow.camera.near=.05; L.shadow.camera.far=l.r*TILE*1.3; L.shadow.bias=-.004; L.shadow.normalBias=.06; L.shadow.autoUpdate=false; L.shadow.needsUpdate=true; } }
    };
    let inFaces0=[]; const inside=()=>{ for(const f of inFaces0)f(); boxes(inner); if(B.h>0&&!o.noCeil)CEIL(X(B.x0),Z(B.y0),X(B.x1),Z(B.y1),Y(B.h)-.02); if(look.floor)flat(B.x0,B.y0,B.x1,B.y1,o.z??.15,look.floor,'L'); solids_(inner); lamps_(lin); FLAME.props(inner,X,Y,Z,lamps); };
    boxes(outer);
    if(look.in){ const H=B.h, walls=(o.xo?[]:[['f','x',B.y1,B.x0,B.x1,-1],['b','x',B.y0,B.x0,B.x1,1],['w','y',B.x0,B.y0-T,B.y1+T,1],['e','y',B.x1,B.y0-T,B.y1+T,-1]]).concat(o.xw||[]);
      const DPX=(W,Hd)=>{ const WD=[86,54,34], WL=[104,68,44], WK=[62,38,24], BR=[212,176,84]; return (ii,jj)=>{ const z=Hd-jj, m=(ii+.5)/W; if(ii<2||ii>=W-2||z>Hd-2)return WK; if(m>.82&&m<.9&&Math.abs(z-Hd*.42)<2)return BR; const top=z>Hd*.55; if(m>.16&&m<.84&&(top?z>Hd*.6&&z<Hd*.92:z>Hd*.1&&z<Hd*.48))return (ii+jj)%7?WL:WD; return WD; }; };
      const solidWall=(wid,ax,at,a0,a1,inS,holes,s,kind,paint)=>{ const pt=(a,z,off)=>ax==='x'?[X(a),Y(z),Z(at+off)]:[X(at+off),Y(z),Z(a)], W=Math.max(1,Math.round((a1-a0)*24));
        const px=(u,z)=>{ for(const h of holes){ if(u<h.a0||u>h.a1||z<h.z0||z>h.z1)continue; const Wd=Math.max(1,Math.round((h.a1-h.a0)*24)), ii=Math.min(Wd-1,Math.floor((u-h.a0)*24)), jj=Math.floor(h.z1-z);
            if(h.z0===0&&door&&door.w===wid)return door.pic?door.pic(ii,jj,Wd,h.z1-h.z0):DPX(Wd,h.z1-h.z0)(ii,jj); const e=Math.min(u-h.a0,h.a1-u)*24, t=Math.min(z-h.z0,h.z1-z); if(e<2||t<2||Math.abs(u-(h.a0+h.a1)/2)*24<1)return [46,42,40];
            if(s!==inS&&hash(Math.floor(h.a0*7+at*13),Math.floor(h.z0),11)<.5)return [255,206,140,1]; return (Math.floor(u*24)+Math.floor(z))%9===0?[58,64,74]:[34,38,46]; } return paint(s,u,z); };
        const OH=holes.filter(h=>h.open); if(!OH.length)return bq(pt(a0,0,s*.1),pt(a1,0,s*.1),pt(a1,H,s*.1),pt(a0,H,s*.1),faceTex(W,H,(ii,jj)=>C(px(a0+(ii+.5)/24,H-jj-.5))),kind);
        // an open hole (a booth set into the wall) is cut right through: the wall in pieces round it
        const A=[...new Set([a0,a1,...OH.flatMap(h=>[Math.max(a0,h.a0),Math.min(a1,h.a1)])])].sort((p,q)=>p-q), Zs=[...new Set([0,H,...OH.flatMap(h=>[h.z0,h.z1])])].sort((p,q)=>p-q);
        for(let i=0;i+1<A.length;i++)for(let j=0;j+1<Zs.length;j++){ const u0=A[i], u1=A[i+1], z0=Zs[j], z1=Zs[j+1]; if(OH.some(h=>(u0+u1)/2>h.a0&&(u0+u1)/2<h.a1&&(z0+z1)/2>h.z0&&(z0+z1)/2<h.z1))continue;
          bq(pt(u0,z0,s*.1),pt(u1,z0,s*.1),pt(u1,z1,s*.1),pt(u0,z1,s*.1),faceTex(Math.max(1,Math.round((u1-u0)*24)),Math.max(1,z1-z0),(ii,jj)=>C(px(u0+(ii+.5)/24,z1-jj-.5))),kind); } };
      const inFaces=[];
      for(const [wid,ax,at,a0,a1,inS,holes0,inner] of walls){ const holes=(holes0||[]).concat(o.holes&&o.holes[wid]||[],door&&door.w===wid?[{a0:door.a-door.wd/2,a1:door.a+door.wd/2,z0:0,z1:door.h}]:[]), kind='W'+id+':'+wid, pl=planes[kind]=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6);
        const paint=(s,u,z)=>{ const nx=ax==='y'?s:0, ny=ax==='x'?s:0, Xw=ax==='y'?at+s*.1:u, Yw=ax==='x'?at+s*.1:u; return (inner||s===inS)?look.in(B,nx,ny,Xw,Yw,z,1):(look.out||facade)(nx,ny,Xw,Yw,z,1,H); };
        // a street shop's windows: one each side of its door, glass showing the real inside from the street and the street from inside (130a)
        if(lazy&&!inner&&door&&door.w===wid&&!o.noWins)for(const sg of [-1,1]){ const wd=1.6, c=door.a+sg*(door.wd/2+.6+wd/2); if(c-wd/2<Math.min(a0,a1)+.3||c+wd/2>Math.max(a0,a1)-.3)continue;
          const fr=new THREE.Mesh(new THREE.BoxGeometry(wd*TILE+.08*TILE,Y(84)-Y(30)+.08*TILE,.06*TILE),new THREE.MeshLambertMaterial({color:0x1c1a1c})), zc=(Y(30)+Y(84))/2;
          if(ax==='x')fr.position.set(X(c),zc,Z(at-inS*.1)); else{ fr.position.set(X(at-inS*.1),zc,Z(c)); fr.rotation.y=Math.PI/2; } scene.add(fr);
          for(const [look,off] of [['in',-inS*.14],['out',inS*.12]]){ const pm=new THREE.Mesh(new THREE.PlaneGeometry(Math.abs(X(c+wd/2)-X(c-wd/2)),Y(84)-Y(30)));
            if(ax==='x')pm.position.set(X(c),zc,Z(at+off)); else{ pm.position.set(X(at+off),zc,Z(c)); pm.rotation.y=Math.PI/2; } scene.add(pm); WINDOWS.pane(pm,id,look,true); } }
        if(lazy&&!inner){ const wk=!o.noOut&&door&&door.w===wid, hw=wk?holes.map(h=>h.z0===0?{...h,open:true}:h):holes; if(!o.noOut)solidWall(wid,ax,at,a0,a1,inS,hw,-inS,'R'+id,paint);
          if(!o.noOut){ let a=Math.min(a0,a1); const seg=(p,q)=>{ if(q-p<.01)return; if(ax==='x')sol(p,at-.1,q,at+.1,H); else sol(at-.1,p,at+.1,q,H); }; for(const d of hw.filter(h=>h.z0===0).sort((p,q)=>p.a0-q.a0)){ seg(a,d.a0); a=d.a1; } seg(a,Math.max(a0,a1)); }
          if(wk)WALKIN[id]={wid,ax,at,inS,a0:door.a-door.wd/2,a1:door.a+door.wd/2,h:door.h};   // noOut: the box is off the street (its front a block there), its outside never seen if(ax==='x')sol(a0,at-.1,a1,at+.1,H); else sol(at-.1,a0,at+.1,a1,H);
          inFaces.push(()=>{ solidWall(wid,ax,at,a0,a1,inS,hw,inS,kind,paint); cuts.push({kind,nx:ax==='y'?inS:0,nz:ax==='x'?inS:0,id,dyn:null}); }); continue; }
        const full=()=>{ const pt=(a,z,off)=>ax==='x'?[X(a),Y(z),Z(at+off)]:[X(at+off),Y(z),Z(a)];
        const as=new Set([a0,a1]), zs=new Set([0,H]); for(const h of holes){ as.add(Math.max(a0,h.a0)); as.add(Math.min(a1,h.a1)); zs.add(h.z0); zs.add(h.z1); }
        const A=[...as].sort((p,q)=>p-q), Zs=[...zs].sort((p,q)=>p-q);
        for(const s of [-1,1])for(let i=0;i+1<A.length;i++)for(let j=0;j+1<Zs.length;j++){ const u0=A[i], u1=A[i+1], z0=Zs[j], z1=Zs[j+1]; if(holes.some(h=>(u0+u1)/2>h.a0&&(u0+u1)/2<h.a1&&(z0+z1)/2>h.z0&&(z0+z1)/2<h.z1))continue;
          bq(pt(u0,z0,s*.1),pt(u1,z0,s*.1),pt(u1,z1,s*.1),pt(u0,z1,s*.1),faceTex((u1-u0)*24,z1-z0,(ii,jj)=>C(paint(s,u0+(ii+.5)/24,z1-jj-.5))),kind); }
        const fr=(P,len,hg,c)=>bq(...P,faceTex(Math.max(1,len*24),Math.max(1,hg),()=>c),kind), cope=look.cope||SHARED.BOD.g.COPE, FR=SHARED.BOD.FRAME;
        fr([pt(a0,H,-.1),pt(a1,H,-.1),pt(a1,H,.1),pt(a0,H,.1)],a1-a0,5,cope);
        for(const h of holes){ for(const a of [h.a0,h.a1])fr([pt(a,h.z0,-.1),pt(a,h.z0,.1),pt(a,h.z1,.1),pt(a,h.z1,-.1)],.2,h.z1-h.z0,FR); fr([pt(h.a0,h.z1,-.1),pt(h.a1,h.z1,-.1),pt(h.a1,h.z1,.1),pt(h.a0,h.z1,.1)],h.a1-h.a0,5,FR);
          if(h.z0>0&&!h.open){ const sd=Math.floor(Math.abs(h.a0*7+at*13+h.z0)); SHARED.BOD.window([pt(h.a0,h.z0,0),pt(h.a1,h.z0,0),pt(h.a1,h.z1,0),pt(h.a0,h.z1,0)],h.a1-h.a0,h.z1-h.z0,SHARED.BOD.g.hash(sd,3,11)<.5,sd,kind); } }
        if(door&&door.w===wid){ const d0=door.a-door.wd/2, d1=door.a+door.wd/2, W=Math.max(1,Math.round(door.wd*24)), Hd=door.h, WD=[86,54,34], WL=[104,68,44], WK=[62,38,24], BR=[212,176,84];
          const dp=door.pic?(ii,jj)=>door.pic(ii,jj,W,Hd):(ii,jj)=>{ const z=Hd-jj, m=(ii+.5)/W; if(ii<2||ii>=W-2||z>Hd-2)return WK; if(m>.82&&m<.9&&Math.abs(z-Hd*.42)<2)return BR; const top=z>Hd*.55; if(m>.16&&m<.84&&(top?z>Hd*.6&&z<Hd*.92:z>Hd*.1&&z<Hd*.48))return (ii+jj)%7?WL:WD; return WD; };
          for(const s2 of [-1,1])bq(pt(d0,0,s2*.02),pt(d1,0,s2*.02),pt(d1,Hd,s2*.02),pt(d0,Hd,s2*.02),faceTex(W,Hd,(ii,jj)=>C(dp(ii,jj))),kind); }
        let a=a0; const ds=holes.filter(h=>h.z0===0).sort((p,q)=>p.a0-q.a0), seg=(p,q)=>{ if(q-p<.01)return; if(ax==='x')sol(p,at-.1,q,at+.1,H); else sol(at-.1,p,at+.1,q,H); }; for(const d of ds){ seg(a,d.a0); a=d.a1; } seg(a,a1);
        cuts.push({kind,nx:ax==='y'?inS:0,nz:ax==='x'?inS:0,id,dyn:inner?(ax==='y'?X(at):Z(at)):null}); };
        if(lazy&&inner)inFaces.push(full); else full(); }   // a wall inside the shop waits for the way in too
      inFaces0=inFaces; if(!o.xo)flat(B.x0-.1,B.y0-.1,B.x1+.1,B.y1+.1,H,look.roof||roofCol,'R'+id); }
    solids_(outer); lamps_(lout); FLAME.props(outer,X,Y,Z,lamps);
    if(lazy){ const P0=STORE.inside[id]; STORE.inside[id]={id,name,B,door,go:P0&&!P0.done?()=>{ P0.go(); inside(); }:inside,done:false,drop:true,un:P0&&P0.un}; } else inside();
    return rec(id,name,B,door,!!look.in||!!o.pieceWalls); };
  const rec=(id,name,B,door,walls)=>{ const R0=STORE.rooms.find(r=>r.id===id); if(R0)return R0;
    const dx=door?(door.w==='f'||door.w==='b'?door.a:door.w==='w'?B.x0+1.2:B.x1-1.2):(B.x0+B.x1)/2, dy=door?(door.w==='f'?B.y1-1.2:door.w==='b'?B.y0+1.2:door.a):(B.y0+B.y1)/2;
    const R={id,name,B,x0:X(B.x0),x1:X(B.x1),z0:Z(B.y0),z1:Z(B.y1),y0:-1,y1:Y(B.h),walls,at:{x:X(dx),z:Z(dy)},dw:door||null}; R.inside=(x,z)=>x>R.x0&&x<R.x1&&z>R.z0&&z<R.z1&&SHARED.py>R.y0-.3&&SHARED.py<R.y1;
    R.hd=door?door.w==='f'?Math.PI:door.w==='b'?0:door.w==='w'?Math.PI/2:-Math.PI/2:null; STORE.rooms.push(R); const pl=STORE.places.find(q=>q[0]===name); if(pl){ pl[1]=R.at.x; pl[2]=R.at.z; pl[3]='up'; pl[5]=R.hd; } else STORE.places.push([name,R.at.x,R.at.z,'up',undefined,R.hd]); return R; };

  const STEPS=[];
  if(!AWAY.has('diner')){ const B=B_('ldiner'), sc=B.s||1; laid('diner',()=>room('diner','THE DINER',B,{floor:K.diner.dinerFloorCol,in:K.diner.dinerWall},{w:'f',a:B.x0+9.5*sc,wd:1.56,h:94},B=>{ PRESETS['Preset Diner 1'].forEach(([k,dx,dy,r])=>put(k,B.x0+dx*sc,B.y0+dy*sc,r)); })); }

  // THE BAR is a merchant's shop now (059i, its lounge 146zca): a front on the Hudson row, its inside off the map

  if(!AWAY.has('museum')){ const MK=K.museum, M=MK.MUS, B=M.b, SX=B.x0+B.x1, SY=B.y0+B.y1, FW=[[0,1],[-1,0],[0,-1],[1,0]], D={w:'f',a:SX-M.mid,wd:2.5,h:76}, stone=[226,220,204];
    const look={floor:(x,y)=>MK.museumFloorCol(SX-x,SY-y),in:(b,nx,ny,x,y,z,f)=>MK.museumWall(b,-nx,-ny,SX-x,SY-y,z,f),out:(nx,ny,x,y,z,f,H)=>MK.museumOutside(B,-nx,-ny,SX-x,SY-y,z,f,H)||sh(stone,f),cope:stone};
    const mp=(k,x,y,rot=0)=>{ const f=CATALOG[k]; SHARED.BOD.K.STUDIO.face(FW[rot]); let p; try{ p=f(+x.toFixed(3),+y.toFixed(3)); }finally{ SHARED.BOD.K.STUDIO.face(null); } if(!p)return null; p.kind=k; const cx=(p.x0+p.x1)/2, cy=(p.y0+p.y1)/2; SHARED.BOD.placeAt(p,2,cx,cy,SX-cx,SY-cy,true); return p; };
    const L=(r,n,c,z,R)=>{ for(let i=0;i<n;i++){ const t=(i+.5)/n, al=r.y1-r.y0>=r.x1-r.x0; LAMPS.push({own:1,room:1,day:true,x:SX-(al?(r.x0+r.x1)/2:r.x0+(r.x1-r.x0)*t),y:SY-(al?r.y0+(r.y1-r.y0)*t:(r.y0+r.y1)/2),z,r:R,c}); } }, sp=[1.5,1.34,1.06];
    const MT=MK.turn&&MK.turn.T.q?MK.turn:null, TT=MT&&MT.T;
    const mpS=(k,x,y,rot=0)=>{ '@later'; if(!MT)return null; const f=CATALOG[k]; SHARED.BOD.K.STUDIO.face(FW[rot]); let p; try{ p=f(+x.toFixed(3),+y.toFixed(3)); }finally{ SHARED.BOD.K.STUDIO.face(null); } if(!p)return null; p.kind=k; const cx=(p.x0+p.x1)/2, cy=(p.y0+p.y1)/2, q=TT.pt(SX-cx-MT.ox,SY-cy); SHARED.BOD.placeAt(p,(2+TT.q)%4,cx,cy,q[0],q[1],true); return p; };
    if(MT){ const L=TT.L, H=B.h, nrm={f:[0,1],b:[0,-1],w:[-1,0],e:[1,0]};
      STEPS.push(()=>{ '@later'; BLOCKS.make({...MT.street,z0:0,z1:H,kind:'Rmuseum',turn:TT,roof:roofCol,paint:(sd,u,z,f)=>{ const n=nrm[sd], P=sd==='f'?[u,L.y1]:sd==='b'?[u,L.y0]:sd==='w'?[L.x0,u]:[L.x1,u]; return MK.museumOutside(B,-n[0],-n[1],SX-P[0]-MT.ox,SY-P[1],z,f,H)||sh(stone,f); }});
        const S=MT.street; sol(S.x0,S.y0,S.x1,S.y1,H); const xd=D.a-MT.ox; STORE.streetDoor.museum={door:TT.pt(xd,L.y1+.35),out:[...TT.pt(xd,L.y1+1.4),TT.hd(0)]};
        STORE.bound.x1=Math.max(STORE.bound.x1,X(B.x1+20)); STORE.bound.z0=Math.min(STORE.bound.z0,Z(B.y0-6)); STORE.bound.z1=Math.max(STORE.bound.z1,Z(B.y1+6)); }); }
    const mr=(lk,set,o)=>()=>room('museum','MUSEUM OF EARTH',B,lk,D,set,o);
    rec('museum','MUSEUM OF EARTH',B,D,true);
    STORE.museumFrame={B,M,at:(x,y)=>({x:X(SX-x),z:Z(SY-y)})};   // the inside's own layout (its door side first) to the world
    const ym=(B.y0+B.y1)/2, lw={...look,floor:null};
    const inWalls=mr({in:look.in},()=>{},{xo:1,xw:[...[M.hx0,M.hx1].map((x,i)=>['s'+i,'y',SX-x,SY-M.by,B.y1-T,i?1:-1,[{a0:SY-M.side[1],a1:SY-M.side[0],z0:0,z1:M.archZ}],true]),
        ['k','x',SY-M.by,B.x0+T,B.x1-T,1,[M.earth,M.humans,M.closed].map(([a,b])=>({a0:SX-b,a1:SX-a,z0:0,z1:M.archZ})),true],
        ...[M.hx0,M.hx1].map((x,i)=>['r'+i,'y',SX-x,B.y0+T,SY-M.by-T,i?1:-1,[],true])]});
    STEPS.push(mr(lw,()=>{},{xo:1,noOut:!!MT,xw:[['f','x',B.y1,B.x0,B.x1,-1],['b','x',B.y0,B.x0,B.x1,1]]}),
      mr(lw,()=>{ if(!MT)flat(B.x0-.1,B.y0-.1,B.x1+.1,B.y1+.1,B.h,roofCol,'Rmuseum'); },{xo:1,noOut:!!MT,xw:[['w','y',B.x0,B.y0-T,B.y1+T,1],['e','y',B.x1,B.y0-T,B.y1+T,-1]]}),
      mr({in:look.in},()=>{ '@later'; const py=B.y0-3, sd=(M.side[0]+M.side[1])/2;
        for(const m of MT?[mp,mpS]:[mp]){ m('museum portico steps',M.mid,(py+B.y0)/2); for(const dx of [-3.7,-1.2,1.2,3.7])m('museum column',M.mid+dx,py+.7); m('museum entablature',M.mid,py+.7,2); }
        for(const x of [M.hx0+.8,M.hx1-.8])for(const y of [M.side[0]-.8,M.side[1]+.8,M.by-1.4])mp('museum hall column',x,y);
        mp('information desk',M.hx0+2.9,B.y0+1.8,2);
        mp('the Rosetta Stone',M.west.x0+3.4,sd,3); mp('Tutankhamun\'s mask',M.west.x0+3.4,B.y0+2,3); mp('painted coffin',M.west.x0+.55,M.by-2.2,3); mp('museum bench',M.west.x0+1.4,sd,3);
        mp('Lucy',M.east.x0+3.4,sd,1); mp('Laetoli footprints',M.east.x1-.65,B.y0+4,1); mp('four skulls',M.east.x1-.35,M.by-5,1); mp('hand axes',M.east.x0+.4,B.y0+2.5,3); mp('the Ishango bone',M.east.x0+.4,M.by-1.5,3);
        L(M.hall,3,[1.3,1.3,1.26],170,16); L(M.west,3,sp,96,10); L(M.east,3,sp,96,10); },{xo:1}),
      mr({in:look.in},()=>{ '@later'; const C=M.closedR; mp('woolly mammoth',M.mid,(M.humansR.y0+M.humansR.y1)/2+.4); mp('Gibeon meteorite',M.earthR.x0+1.6,M.earthR.y1-1.9);
        mp('terracotta warriors',(C.x0+C.x1)/2,C.y1-.9,2); mp('jade burial suit',C.x1-.55,C.y0+2.4,1); mp('the Sutton Hoo helmet',C.x0+.6,C.y0+1,3); mp('clay tablets',C.x0+.35,C.y0+3.4,3); mp('the Antikythera mechanism',(C.x0+C.x1)/2,C.y0+2.9,2);
        L(M.humansR,2,[1.5,1.08,.7],90,9); L(M.earthR,1,sp,96,9); L(M.closedR,1,sp,96,9); },{xo:1}),
      ()=>{ const R=STORE.inside.museum; if(!R)return; const g0=R.go; R.go=()=>{ g0(); flat(B.x0,ym,B.x1,B.y1,.15,look.floor,'L'); flat(B.x0,B.y0,B.x1,ym,.15,look.floor,'L'); inWalls(); if(STORE.furnish&&STORE.furnish.museum)STORE.furnish.museum(STORE.museumFrame); }; }); }   // nothing of its inside until you go in, dropped when you leave


  const OFF=STORE.off={}, offmap=(name,lot,fn)=>{ OFF[name]={lot,fn}; STORE.places.push([name,0,0,'up','off']); }; STORE.kit={room,rec,flat,put,sol,STEPS,PLATE,offmap,planes}; for(const [n,k] of [['THE HERB COTTAGE','garden'],['THE AQUARIUM','aquarium'],['THE KEEP','keep'],['THE BUTTERFLIES','garden']])if(!AWAY.has(k))STORE.places.push([n,0,0,'up']);
  const GARDEN=STORE.garden={cottage:[SHARED.BOD.OX-15/BLDK,SHARED.BOD.OY-14.6/BLDK],house:[SHARED.BOD.OX-4.6/BLDK,SHARED.BOD.OY-9.2/BLDK]};
  if(!AWAY.has('garden'))STEPS.push(()=>{ '@later'; const O=GARDEN.cottage, R=room('cottage','THE HERB COTTAGE',{x0:O[0],y0:O[1],x1:O[0]+9,y1:O[1]+12,h:96},{floor:grassCol},null,()=>{ PRESETS['Preset Herb Cottage 1'].forEach(([k,dx,dy,r])=>put(k,O[0]+dx,O[1]+dy,r)); },
      {z:.05,pieceWalls:{'herb cottage wall, west':['w',1,0],'herb cottage wall, east':['e',-1,0],'herb cottage wall, north':['b',0,1],'herb cottage wall, south':['f',0,-1]}});
    R.at={x:-4.6*TILE,z:1.6*TILE}; const pl=STORE.places.find(q=>q[0]===R.name); if(pl){ pl[1]=R.at.x; pl[2]=R.at.z; } });

  if(!AWAY.has('aquarium'))STEPS.push(()=>{ '@later'; const B={id:'locto',x0:97.6,y0:-84,x1:112.4,y1:-77,h:130}, O=K.octo; room('octo','THE AQUARIUM',B,{floor:O.octoFloorCol,in:O.octoWall},{w:'f',a:(B.x0+B.x1)/2,wd:1.56,h:94},B=>{ const {LX,LY,Z0,ZT}=O.OCTK, x=B.x0+5.5-LX/2, y=B.y1-2.6-LY/2, p=O.octoTank(x,y); place(p,0);
      for(const [lx,ly,i] of [[x+LX/2,y-.35,0],[x+LX/2,y+LY+.35,1],[x-.35,y+LY/2,2],[x+LX+.35,y+LY/2,3]])LAMPS.push({own:1,room:1,day:true,x:lx,y:ly,z:Z0+4,r:i<2?4.2:3,c:[.5,.72,.95]});
      STORE.tank={x0:x+.035,y0:y+.035,x1:x+LX-.035,y1:y+LY-.035,z:ZT-4,bed:Z0+1}; }); STORE.tank.dz=0; });

  if(!AWAY.has('keep'))STEPS.push(()=>{ '@later'; const B=B_('lcastle'), [cx,cy]=LG('castle'); Object.assign(B,{x0:51.09+cx,x1:60.59+cx,y0:-22.9+cy,y1:-13.9+cy});
    const KK=K.keep, KC={door:B.x0+4.75,arches:[B.x0+2.1,B.x0+4.75,B.x0+7.4]}, my=(B.y0+B.y1)/2, lead=(x,y)=>{ const n=grain(x,y,67,1.2); return n<.4?[74,76,80]:n>.7?[90,92,96]:[82,84,88]; };
    room('keep','THE KEEP',B,{floor:KK.keepFloorCol,in:KK.keepInWall,out:(nx,ny,Xx,Yy,z,f,cap)=>KK.keepOutWall(B,nx,ny,Xx,Yy,z,f,cap),cope:[184,174,150],roof:lead},{w:'b',a:KC.door,wd:1.4,h:96},B=>{ const M=KK.KMK;
      M.turret(B.x0-T,B.y0-T,-1,-1); M.turret(B.x1+T,B.y0-T,1,-1); M.turret(B.x0-T,B.y1+T,-1,1); M.turret(B.x1+T,B.y1+T,1,1);
      for(const s of ['f','b','l','r'])M.parapet(B,s);
      M.keepFace(B,'b',[KC.door-1,KC.door+1]); M.keepFace(B,'f'); M.keepFace(B,'l'); M.keepFace(B,'r');
      M.gravel(KC.door-.75,B.y0-3.2,KC.door+.75,B.y0-T-.3);
      const R=KK.KEEPR, x0=R.x0, y0=R.y0, x1=R.x1, y1=R.y1, at=(w,u,d)=>w==='b'?[x0+u,y0+d]:w==='f'?[x0+u,y1-d]:w==='l'?[x0+d,y0+u]:[x1-d,y0+u];
      for(const t of R.torches){ const [x,y]=at(t.w,t.u,.16); CATALOG['wall torch'](x,y,t.w); CATALOG['dust in the air'](x+(t.w==='l'?.5:t.w==='r'?-.5:0),y+(t.w==='b'?.5:t.w==='f'?-.5:0)); }
      for(const [x,y] of [[2.3,2.2],[7,2.2],[2.3,6.6],[7,6.6]])CATALOG['stone column'](x0+x,y0+y);
      CATALOG['brazier'](x0+4.65,y0+1.7); CATALOG['sarcophagus'](x0+6.3,y0+.9); CATALOG['two candles'](x0+7.1,y0+.5);
      for(const [x,y] of [[.45,.45],[1.08,.5],[.7,1.1]])CATALOG['oak barrel'](x0+x,y0+y); for(const [x,y] of [[.45,.45],[1.08,.5]])CATALOG['oak barrel'](x0+x,y1-y);
      for(const [x,y] of [[2,.5],[2.75,.5],[2.35,1.2]])CATALOG['crate'](x0+x,y0+y);
      CATALOG['iron chest'](x1-1.2,y1-.6);
      for(const [x,y] of [[1.5,3.6],[5.6,8.2]])CATALOG['straw'](x0+x,y0+y); CATALOG['straw'](x1-.9,y0+2);
      for(const [x,y] of [[3.3,.5],[8.8,3.4],[6.9,7.9],[3.6,6]])CATALOG['skull'](x0+x,y0+y);
      CATALOG['bone pile'](x0+.6,y0+3); CATALOG['bone pile'](x1-1.6,y1-2.2);
      for(const [x,y] of [[3.9,3.4],[6,5.6],[8.4,1.2],[2.2,7.8]])CATALOG['bones'](x0+x,y0+y);
      M.bars(x1-1.7,y0,x1-1.7,R.my-T);
      CATALOG['mouse run'](x0+.7,y0+.14,x0+3.9,y0+.14); CATALOG['mouse run'](x0+.14,y0+.5,x0+.14,y0+3.6); CATALOG['mouse run'](x1-.14,y0+4.9,x1-.14,y0+8.2); CATALOG['mouse run'](x0+6.9,y1-.14,x0+8.6,y1-.14);
      const o={own:1,room:1,day:true}; LAMPS.push({x:R.cx,y:R.cy,z:70,r:9,c:[.24,.28,.38],...o}); LAMPS.push({x:x0+R.slit.u,y:y0+.4,z:100,r:3,c:[.3,.36,.52],...o}); },
      {xw:[['x','x',my,B.x0+T,B.x1-T,1,KC.arches.map(a=>({a0:a-.8,a1:a+.8,z0:0,z1:110})),true]]}); });

  if(!AWAY.has('garden'))STEPS.push(()=>{ const O=GARDEN.house; STORE.houseAt=[O[0]+4,O[1]+3.5]; STORE.houseZ=0; room('butterflies','THE BUTTERFLIES',{x0:O[0],y0:O[1],x1:O[0]+8,y1:O[1]+7,h:0},{floor:grassCol},null,()=>{ const p=put('butterfly house',O[0]+4,O[1]+3.5); if(p)p.bf=[12,21]; STORE.bfHouse=p; },{z:.05}); });

  const AVR=[['market','MARKET · LOUNGE',17.6,33.6,16,230],['museum','MUSEUM OF EARTH',33.6,59.6,26,210],['lucky','LUCKY 7',59.6,70.6,11,200],['yellow','THE YELLOW AWNING',70.6,81.6,11,200],
    ['theatre','MOVIE THEATRE · ARCADE',87.6,103.6,16,260],['playhouse','PLAYHOUSE',103.6,115.6,12,220],['baker','221B BAKER STREET',115.6,126,12,230]];
  { const AX=72+(EASTX-72)/BLDK, plaster=(B,nx,ny,Xw,Yw,z,f)=>sh(z<8?[118,112,102]:[168,160,146],f*(z<8?.9:1)), conc=(x,y)=>{ const n=grain(x,y,71,1.3); return n<.4?[92,90,86]:n>.7?[104,102,98]:[98,96,92]; };
    if(!AWAY.has('avenue'))for(const [id,name,z0,z1,d,h] of AVR){ STORE.places.push([name,0,0,'up']);
      STEPS.push(()=>{ '@later'; const B={id:'lav_'+id,x0:AX,y0:-77+z0/BLDK+.1,x1:AX+d,y1:-77+z1/BLDK-.1,h}; room('av_'+id,name,B,{floor:conc,in:plaster},{w:'w',a:(B.y0+B.y1)/2,wd:1.56,h:94},(B,l0)=>{ LAMPS.push({own:1,room:1,day:true,x:(B.x0+B.x1)/2,y:(B.y0+B.y1)/2,z:Math.min(h-20,120),r:Math.max(6,.75*Math.max(d,(z1-z0)/BLDK)),c:[1,.9,.75]}); }); }); } }


  const bake=()=>{ BATCH.cast=true;
  BATCH.build((k,map,emap)=>{ '@later'; const pl=planes[k], cp=pl?{clippingPlanes:[pl]}:{};
    if(k==='B')return new THREE.MeshBasicMaterial({map,side:THREE.DoubleSide,alphaTest:.5});
    return new THREE.MeshLambertMaterial({map,alphaTest:.5,side:THREE.DoubleSide,...(emap?{emissiveMap:emap,emissive:0xffffff,emissiveIntensity:1.3}:{}),...cp}); });
  BATCH.cast=false; const M=BATCH.meshes||{}; BATCH.meshes={}; for(const me of BATCH.all(M,'G'))me.castShadow=false;
  for(const c of cuts.splice(0)){ const R=STORE.rooms.find(r=>r.id===c.id); for(const me of BATCH.all(M,c.kind)){ const w={pl:planes[c.kind],nx:c.nx,nz:c.nz,foot:Y(8),me,when:()=>R.inside(pos.x,pos.z)||ROOMS.cur===R}; if(c.dyn!=null)Object.defineProperty(w,c.nx?'nx':'nz',{get:()=>Math.sign((c.nx?pos.x:pos.z)-c.dyn)||1}); cutWalls.push(w); } }
  for(const R of STORE.rooms)for(const me of BATCH.all(M,'R'+R.id))STORE.roofs.push({me,R});
  return M; };
  const M=bake();
  STORE.bound={x0:X(PLATE.x0),x1:X(PLATE.x1),z0:Z(PLATE.y0),z1:Z(PLATE.y1)};
  STORE.inStore=(x,z)=>x>STORE.bound.x0&&x<STORE.bound.x1&&z>STORE.bound.z0&&z<STORE.bound.z1;
  STORE.meshes=M; STORE.stats=BATCH.stats; STORE.XYZ={X,Y,Z};
  { const pend=[]; let done=false; START.wait('THE STREET',()=>done||QS.get('steps')==='0');
    const lit=()=>{ if(!LITE.recs.length)return; const nl=[]; scene.traverse(o=>{ if(o.isPointLight&&!o.userData.pool)nl.push(o); }); for(const L of nl){ L.userData.grp=null; L.castShadow=false; L.removeFromParent(); LITE.recs.push(L); } };
    const need=()=>[...new Set(['later',...STEPS.map(f=>f.chunk).filter(Boolean)])];
    const step=()=>{ STEPS.shift()(); pend.push(...BATCH.items.splice(0)); lit(); STORE.doorThings(); };
    const finish=()=>{ '@later'; if(done)return; done=true; while(STEPS.length)step(); if(WEEDS.lawnDrop)WEEDS.lawnDrop([-1e9,-1e9,1e9,1e9]); if(!pend.length)return; BATCH.items=pend; Object.assign(STORE.meshes,bake());
      const Tk=STORE.tank; if(Tk){ WATER.body({name:'tank',X0:X(Tk.x0),X1:X(Tk.x1),Z0:Z(Tk.y0),Z1:Z(Tk.y1),lvl:Y(Tk.z+(Tk.dz||0)),GX:110,GY:40,dep:()=>(Tk.z-Tk.bed)/50*1.8});
    const gm=new THREE.MeshLambertMaterial({color:new THREE.Color(.5,.62,.7),transparent:true,opacity:.18,side:THREE.DoubleSide,depthWrite:false}), gh=Y(Tk.z+4)-Y(Tk.bed), gy=(Y(Tk.z+4)+Y(Tk.bed))/2+Y(Tk.dz||0)-Y(0);
    for(const [x,z,w,ry] of [[(Tk.x0+Tk.x1)/2,Tk.y0,Tk.x1-Tk.x0,0],[(Tk.x0+Tk.x1)/2,Tk.y1,Tk.x1-Tk.x0,0],[Tk.x0,(Tk.y0+Tk.y1)/2,Tk.y1-Tk.y0,Math.PI/2],[Tk.x1,(Tk.y0+Tk.y1)/2,Tk.y1-Tk.y0,Math.PI/2]]){ const m=new THREE.Mesh(new THREE.PlaneGeometry(w*TILE*BLDK,gh),gm); m.position.set(X(x),gy,Z(z)); m.rotation.y=ry; scene.add(m); }  }
      if(STORE.houseAt){ const H=STORE.houseAt, hp=(dx,dy,z)=>[X(H[0]+dx),Y(z+(STORE.houseZ||0)),Z(H[1]+dy)], HP=[hp(-.16,-.09,38),hp(-.12,.07,41),hp(.18,.09,37),hp(.13,-.1,35),hp(-.06,0,44),hp(.06,0,44),hp(.08,-.11,32),hp(-.24,0,47),hp(.24,0,47),hp(0,-.17,49)];
    [12,21].forEach((k,i)=>{ const b=BF.add(k,HP); b.at=b.to=i*4; b.g.position.set(...HP[b.at]); }); }
      if(ROOMS.reset)ROOMS.reset(); if(CLIP)CLIP.run(); INTERIORS.build(); };
    STORE.need=()=>LOAD(...need());
    STORE.ensure=async()=>{ await LOAD(...need()); finish(); };
    STORE.offGo=n=>{ const o=OFF[n]; if(!o||o.done)return; if(!LOADED(o.fn.chunk)||need().some(c=>!LOADED(c)))return o.wait||(o.wait=LOAD(o.fn.chunk,...need()).then(()=>STORE.offGo(n))); finish(); o.done=1; STORE.now=1; o.fn(); STORE.now=0; const it=BATCH.items.splice(0); lit(); if(it.length){ BATCH.items=it; Object.assign(STORE.meshes,bake()); }
      if(ROOMS.reset)ROOMS.reset(); if(CLIP)CLIP.run(); INTERIORS.build(); };
    const REGS=()=>[UI.things,cutWalls,STORE.roofs,LITE.recs,SOL.up,FIX.up,lamps,FLAME.src,PEEK.boxes,...Object.values(SYS.P)];   // every list an inside's build adds to
    const took=()=>({n:scene.children.length,regs:REGS().map(A=>[A,A.length])});
    STORE.inGo=id=>{ '@later'; finish(); const R=STORE.inside[id]; if(!R||R.done)return; R.done=true; const S=R.drop?took():null; STORE.now=1; R.go(); STORE.now=0; const it=BATCH.items.splice(0); lit(); if(it.length){ BATCH.items=it; Object.assign(STORE.meshes,bake()); }
      if(S){ const seen=new Set(S.regs.map(r=>r[0])); R.P={objs:scene.children.slice(S.n),regs:[...S.regs.map(([A,n])=>[A,A.slice(n)]),...REGS().filter(A=>!seen.has(A)).map(A=>[A,A.slice(0)])]}; }
      if(ROOMS.reset)ROOMS.reset(); if(CLIP)CLIP.run(); INTERIORS.build(); };
    // an inside marked drop (R.drop) is taken down once you are out of it, built again behind the fade next time
    STORE.unGo=id=>{ '@later'; const R=STORE.inside[id], P=R&&R.P; if(!P)return; R.P=null; R.done=false; const out=(A,L)=>{ for(const a of L){ const i=A.indexOf(a); if(i>=0)A.splice(i,1); } };
      for(const [A,L] of P.regs)out(A,L); LITE.t=0; if(R.un)R.un();
      for(const k in STORE.meshes)if(P.objs.includes(STORE.meshes[k]))delete STORE.meshes[k];
      for(const o of P.objs){ o.removeFromParent(); o.traverse(c=>{ if(c.geometry&&!c.geometry.userData.keep)c.geometry.dispose(); for(const q of c.material?[].concat(c.material):[]){ if(q.userData.keep)continue; if(q.map)q.map.dispose(); if(q.emissiveMap)q.emissiveMap.dispose(); q.dispose(); } }); }
      if(ROOMS.reset)ROOMS.reset(); if(CLIP)CLIP.run(); INTERIORS.build(); };
    { let t=0; SYS.add('life',()=>{ const now=performance.now(); if(now-t<1000)return; t=now; if(FADE.busy)return; for(const id in STORE.inside){ const R=STORE.inside[id]; if(!R.P||WINDOWS.held.has(id)||STORE.held.has(id))continue; const Rm=STORE.rooms.find(r=>r.id===id); if(Rm&&!Rm.inside(pos.x,pos.z)&&ROOMS.cur!==Rm)STORE.unGo(id); } },'059-store-drop'); }
    const DOORP=(R,k)=>{ const d=R.door, B=R.B; return d.w==='f'?[d.a,B.y1+k]:d.w==='b'?[d.a,B.y0-k]:d.w==='w'?[B.x0-k,d.a]:[B.x1+k,d.a]; };
    STORE.gate={};   // a door that asks something first (the theatre: a ticket): id -> () => true to go in
    STORE.pre={};   // a door that fetches something first (the art museum: its paintings): id -> async () => done, run behind the fade before the inside is built
    // a street shop's inside as a record for the one way in and out (ROOMS.run): built in place, so no street is hidden; you are stood at its door only when you came by the door
    const REC={}, rec=id=>{ const R=STORE.inside[id]; if(!R)return null; return REC[id]||(REC[id]={get name(){ return /^THE /.test(R.name)?R.name:'THE '+R.name; },get busy(){ return !!R.busy; },set busy(v){ R.busy=v; },
      gate:on=>on?!STORE.gate[id]||!!STORE.gate[id]():!FADE.busy,built:()=>!!R.done,need:()=>LOAD(...need()),pre:()=>STORE.pre[id]&&STORE.pre[id](),make:()=>STORE.inGo(id),
      arrive:opt=>{ if(opt.walk){ const [x,y]=DOORP(R,-1.4), d=R.door; STORE.goTo(X(x),Z(y),'up',d.w==='f'?Math.PI:d.w==='b'?0:d.w==='w'?Math.PI/2:-Math.PI/2); } if(UI.inIso)UI.inIso(); },
      depart:()=>{ '@later'; const d=R.door, SD=STORE.streetDoor[id], [x,y]=SD?SD.out:DOORP(R,1.4); STORE.goTo(X(x),Z(y),'up',SD?SD.out[2]:d.w==='f'?0:d.w==='b'?Math.PI:d.w==='w'?-Math.PI/2:Math.PI/2); },
      fade:(on,built,opt)=>on?{silent:built&&!opt.walk}:null}); };
    STORE.enter=(id,walk)=>ROOMS.run(rec(id),true,{walk:!!walk});   // nothing returned when it does not go (no ticket)
    STORE.exit=async id=>ROOMS.run(rec(id),false);
    STORE.doorThings=()=>{ '@later'; if(typeof UI==='undefined'||!UI.thing)return; for(const id in STORE.inside){ const R=STORE.inside[id]; if(R.th)continue; if(WALKIN[id]){ STORE.door(id); continue; } const SD=STORE.streetDoor[id], [x,y]=SD?SD.door:DOORP(R,.35), hb=new THREE.Mesh(new THREE.BoxGeometry(1.4*TILE,2.6*TILE,.5*TILE),new THREE.MeshBasicMaterial({visible:false}));
      hb.position.set(X(x),1.3*TILE,Z(y)); scene.add(hb); R.th={name:/^THE /.test(R.name)?R.name:'THE '+R.name,ghost:1,obj:hb,reach:1.4*TILE,near:2.4*TILE,tall:2.6*TILE,act:()=>STORE.enter(id,true)}; UI.thing(R.th);
        const [ex,ey]=DOORP(R,-.35), he=new THREE.Mesh(new THREE.BoxGeometry(1.4*TILE,2.6*TILE,.5*TILE),new THREE.MeshBasicMaterial({visible:false})); he.position.set(X(ex),1.3*TILE,Z(ey)); scene.add(he);
        UI.thing({name:'OUT TO THE STREET',exit:1,ghost:1,obj:he,reach:1.4*TILE,near:2.4*TILE,tall:2.6*TILE,act:()=>STORE.exit(id)}); }};
    // a street shop's door you walk through (WALKIN): its inside built when you come within NEAR and held until past FAR; the door swings open as you reach it once the inside is built, and blocks while shut
    STORE.held=new Set(); const DOORS={}, NEAR=14*TILE, FAR=18*TILE, REACH=2.4*TILE, building=new Set();
    STORE.open=id=>!!DOORS[id]&&DOORS[id].t>.6;
    STORE.openAt=(x,z)=>{ for(const id in DOORS){ if(DOORS[id].t<.05)continue; const B=STORE.inside[id].B, xa=X(B.x0), xb=X(B.x1), za=Z(B.y0), zb=Z(B.y1); if(x>Math.min(xa,xb)&&x<Math.max(xa,xb)&&z>Math.min(za,zb)&&z<Math.max(za,zb))return true; } return false; };
    STORE.door=id=>{ '@later'; const W=WALKIN[id], R=STORE.inside[id]; if(!W||!R||DOORS[id])return; const P=(a,t)=>W.ax==='x'?new THREE.Vector3(X(a),0,Z(t)):new THREE.Vector3(X(t),0,Z(a)), p0=P(W.a0,W.at), p1=P(W.a1,W.at), wv=p1.clone().sub(p0), len=wv.length(), hgt=Y(W.h)-Y(0);
      const B=R.B, c=new THREE.Vector3(X((B.x0+B.x1)/2),0,Z((B.y0+B.y1)/2)), mid=p0.clone().add(p1).multiplyScalar(.5), inN=c.clone().sub(mid); if(W.ax==='x')inN.x=0; else inN.z=0; inN.normalize();
      const cv=document.createElement('canvas'), Wp=Math.max(8,Math.round((W.a1-W.a0)*24)), Hp=Math.round(W.h); cv.width=Wp; cv.height=Hp; const g=cv.getContext('2d'), WD=[86,54,34], WL=[104,68,44], WK=[62,38,24], BR=[212,176,84];
      for(let jj=0;jj<Hp;jj++)for(let ii=0;ii<Wp;ii++){ const z=Hp-jj, m=(ii+.5)/Wp, top=z>Hp*.55; const q=ii<2||ii>=Wp-2||z>Hp-2?WK:m>.82&&m<.9&&Math.abs(z-Hp*.42)<2?BR:m>.16&&m<.84&&(top?z>Hp*.6&&z<Hp*.92:z>Hp*.1&&z<Hp*.48)?((ii+jj)%7?WL:WD):WD; g.fillStyle=`rgb(${q[0]},${q[1]},${q[2]})`; g.fillRect(ii,jj,1,1); }
      const tx=new THREE.CanvasTexture(cv); tx.magFilter=THREE.NearestFilter; tx.colorSpace=THREE.SRGBColorSpace;
      const leaf=new THREE.Mesh(new THREE.BoxGeometry(len,hgt,.06*TILE),new THREE.MeshLambertMaterial({map:tx})); leaf.position.set(len/2,hgt/2,0); leaf.castShadow=true;
      const pv=new THREE.Group(); pv.position.copy(p0); pv.rotation.y=Math.atan2(-wv.z,wv.x); pv.add(leaf); scene.add(pv);
      const yaw0=pv.rotation.y, dir=new THREE.Vector3(Math.cos(yaw0+Math.PI/2),0,-Math.sin(yaw0+Math.PI/2)), sw=dir.dot(inN)>0?Math.PI/2:-Math.PI/2;   // swings into the shop
      const th=.08*TILE, sb=[Math.min(p0.x,p1.x)-(W.ax==='y'?th:0),Math.min(p0.z,p1.z)-(W.ax==='x'?th:0),Math.max(p0.x,p1.x)+(W.ax==='y'?th:0),Math.max(p0.z,p1.z)+(W.ax==='x'?th:0)]; SOL.up.push(sb);
      DOORS[id]={pv,yaw0,sw,mid,sb,shut:true,t:0}; R.th={name:/^THE /.test(R.name)?R.name:'THE '+R.name,obj:pv,walk:1}; };
    const build=id=>{ if(building.has(id))return; building.add(id); (async()=>{ await STORE.ensure(); if(STORE.pre[id])await STORE.pre[id](); const R=STORE.inside[id]; if(R&&!R.done)STORE.inGo(id); })().catch(e=>console.warn('STORE walk-in build',e)).finally(()=>building.delete(id)); };
    SYS.add('life',dt=>{ const up=SHARED.LVL==='up'; for(const id in DOORS){ const D=DOORS[id], R=STORE.inside[id]; if(!R)continue; const d=up?Math.hypot(pos.x-D.mid.x,pos.z-D.mid.z):1e9;
      if(d<FAR)STORE.held.add(id); else STORE.held.delete(id);
      if(d<NEAR&&!R.done&&!R.busy&&!FADE.busy)build(id);
      const by=d<REACH||[...NPCS,...(NPCS.extra||[])].some(N=>{ const g=N&&N.g; return g&&g.visible&&Math.hypot(g.position.x-D.mid.x,g.position.z-D.mid.z)<REACH*.8; }), want=by&&R.done&&!R.busy&&(!STORE.gate[id]||(D.g??(D.g=!!STORE.gate[id]())))?1:0; if(d>=REACH)D.g=undefined;
      D.t+=(want-D.t)*Math.min(1,(dt||.016)*6); if(Math.abs(want-D.t)<.002)D.t=want; D.pv.rotation.y=D.yaw0+D.sw*D.t;
      const shut=D.t<.5; if(shut!==D.shut){ D.shut=shut; const i=SOL.up.indexOf(D.sb); if(shut&&i<0)SOL.up.push(D.sb); if(!shut&&i>=0)SOL.up.splice(i,1); } } },'058-store-doors');
    STORE.offAt=(x,z)=>{ const w=[]; for(const n in OFF){ const [a,b,c,d]=OFF[n].lot; if(!OFF[n].done&&x>X(a)&&x<X(c)&&z>Z(b)&&z<Z(d))w.push(STORE.offGo(n)); } return Promise.all(w); };
    const run=()=>{ if(done)return; const c=need().filter(c=>!LOADED(c)); if(c.length){ LOAD(...c).then(run,()=>setTimeout(run,2000)); return; } if(STEPS.length){ step(); setTimeout(run,60); } else finish(); };
    STORE.later=()=>{ if(QS.get('steps')!=='0')setTimeout(run,1500); }; }
});
