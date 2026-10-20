// THE STORE: rooms with doors (diner, bar, museum, keep, cottage, aquarium, avenue) and their places in the menu. Its own builder.
await grab('store',async()=>{ const K=BOD.STOREK, {X,Y,Z,gbox,faceTex,bq,C,place,facade}=BOD, {CATALOG,PROPS,LAMPS,PRESETS,LBLD,T,sh,hash}=K, {grain,speck,lawnCol:grassCol}=BOD.g;
  const B_=id=>LBLD.find(b=>b.id===id);
  const LG=k=>{ const o=LAY.o(k); return [o.x/BLDK,o.y/BLDK]; }, AO=LG('apartments');
  for(const [id,k] of [['ldiner','diner'],['lbodega2','bar'],['lcastle','apartments']]){ const b=B_(id), [dx,dy]=LG(k); if(b&&!b.laid){ b.x0+=dx; b.x1+=dx; b.y0+=dy; b.y1+=dy; b.laid=1; } }
  for(const [id,k] of [['ldiner','diner'],['lbodega2','bar']]){ const b=B_(id), sc=LAY.s(k); if(b&&!b.sized){ b.sized=1; b.s=sc; if(sc!==1){ const m=(b.x0+b.x1)/2, f=b.y1; b.x0=m+(b.x0-m)*sc; b.x1=m+(b.x1-m)*sc; b.y0=f+(b.y0-f)*sc; } } }
  const laid=(k,fn)=>{ const h=LAY.h(k); return h?lift(h*TILE/ZU/BLDK,fn):fn(); };
  const PLATE={x0:334,y0:-100,x1:456,y1:-70};
  const flat=(x0,y0,x1,y1,z,col,kind)=>bq([X(x0),Y(z),Z(y1)],[X(x1),Y(z),Z(y1)],[X(x1),Y(z),Z(y0)],[X(x0),Y(z),Z(y0)],faceTex((x1-x0)*24,(y1-y0)*24,(i,j)=>C(col(x0+(i+.5)/24,y1-(j+.5)/24))),kind);
  const put=(kind,x,y,rot=0)=>{ const f=CATALOG[kind]; if(!f){ console.warn('store: no',kind); return null; } const p=f(+x.toFixed(3),+y.toFixed(3)); if(!p)return null; p.kind=kind; place(p,rot); return p; };
  const sol=(x0,y0,x1,y1,zt)=>{ SOL.up.push([X(x0),Z(y0),X(x1),Z(y1)]); FIX.up.push([X(x0),Z(y0),0,X(x1),Z(y1),Math.max(.05,Y(zt))]); };
  const roofCol=(x,y)=>{ const n=grain(x,y,61,1.4); return speck(n<.35?[50,50,52]:n>.7?[66,64,62]:[58,57,57],x,y,63); };
  const planes={}, cuts=[]; STORE.inside={};
  const CEIL=(x0,z0,x1,z1,y)=>{ const g=new THREE.PlaneGeometry(Math.abs(x1-x0),Math.abs(z1-z0)).rotateX(Math.PI/2), me=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:0x5a544c,clippingPlanes:[new THREE.Plane(new THREE.Vector3(0,-1,0),1e6)]})); me.position.set((x0+x1)/2,y,(z0+z1)/2); me.receiveShadow=true; scene.add(me); return me; }; STORE.CEIL=CEIL;
  const room=(id,name,B,look,door,set,o={})=>{ const n0=PROPS.length, l0=LAMPS.length; set(B,l0); const all=PROPS.slice(n0), lamAll=LAMPS.slice(l0);
    const lazy=!!(door&&look.in&&!o.now&&!STORE.now), inB=b=>b.x0>=B.x0-.2&&b.x1<=B.x1+.2&&b.y0>=B.y0-.2&&b.y1<=B.y1+.2;
    const inner=lazy?all.filter(p=>p.boxes&&p.boxes.length&&p.boxes.every(inB)):[], outer=all.filter(p=>!inner.includes(p));
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
    const inside=()=>{ boxes(inner); if(B.h>0&&!o.noCeil)CEIL(X(B.x0),Z(B.y0),X(B.x1),Z(B.y1),Y(B.h)-.02); if(look.floor)flat(B.x0,B.y0,B.x1,B.y1,o.z??.15,look.floor,'L'); solids_(inner); lamps_(lin); FLAME.props(inner,X,Y,Z,lamps); };
    boxes(outer);
    if(look.in){ const H=B.h, walls=(o.xo?[]:[['f','x',B.y1,B.x0,B.x1,-1],['b','x',B.y0,B.x0,B.x1,1],['w','y',B.x0,B.y0-T,B.y1+T,1],['e','y',B.x1,B.y0-T,B.y1+T,-1]]).concat(o.xw||[]);
      for(const [wid,ax,at,a0,a1,inS,holes0,inner] of walls){ const holes=(holes0||[]).concat(o.holes&&o.holes[wid]||[],door&&door.w===wid?[{a0:door.a-door.wd/2,a1:door.a+door.wd/2,z0:0,z1:door.h}]:[]), kind='W'+id+':'+wid, pl=planes[kind]=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6);
        const paint=(s,u,z)=>{ const nx=ax==='y'?s:0, ny=ax==='x'?s:0, Xw=ax==='y'?at+s*.1:u, Yw=ax==='x'?at+s*.1:u; return (inner||s===inS)?look.in(B,nx,ny,Xw,Yw,z,1):(look.out||facade)(nx,ny,Xw,Yw,z,1,H); };
        const pt=(a,z,off)=>ax==='x'?[X(a),Y(z),Z(at+off)]:[X(at+off),Y(z),Z(a)];
        const as=new Set([a0,a1]), zs=new Set([0,H]); for(const h of holes){ as.add(Math.max(a0,h.a0)); as.add(Math.min(a1,h.a1)); zs.add(h.z0); zs.add(h.z1); }
        const A=[...as].sort((p,q)=>p-q), Zs=[...zs].sort((p,q)=>p-q);
        for(const s of [-1,1])for(let i=0;i+1<A.length;i++)for(let j=0;j+1<Zs.length;j++){ const u0=A[i], u1=A[i+1], z0=Zs[j], z1=Zs[j+1]; if(holes.some(h=>(u0+u1)/2>h.a0&&(u0+u1)/2<h.a1&&(z0+z1)/2>h.z0&&(z0+z1)/2<h.z1))continue;
          bq(pt(u0,z0,s*.1),pt(u1,z0,s*.1),pt(u1,z1,s*.1),pt(u0,z1,s*.1),faceTex((u1-u0)*24,z1-z0,(ii,jj)=>C(paint(s,u0+(ii+.5)/24,z1-jj-.5))),kind); }
        const fr=(P,len,hg,c)=>bq(...P,faceTex(Math.max(1,len*24),Math.max(1,hg),()=>c),kind), cope=look.cope||BOD.g.COPE, FR=BOD.FRAME;
        fr([pt(a0,H,-.1),pt(a1,H,-.1),pt(a1,H,.1),pt(a0,H,.1)],a1-a0,5,cope);
        for(const h of holes){ for(const a of [h.a0,h.a1])fr([pt(a,h.z0,-.1),pt(a,h.z0,.1),pt(a,h.z1,.1),pt(a,h.z1,-.1)],.2,h.z1-h.z0,FR); fr([pt(h.a0,h.z1,-.1),pt(h.a1,h.z1,-.1),pt(h.a1,h.z1,.1),pt(h.a0,h.z1,.1)],h.a1-h.a0,5,FR); }
        if(door&&door.w===wid){ const d0=door.a-door.wd/2, d1=door.a+door.wd/2, W=Math.max(1,Math.round(door.wd*24)), Hd=door.h, WD=[86,54,34], WL=[104,68,44], WK=[62,38,24], BR=[212,176,84];
          const dp=(ii,jj)=>{ const z=Hd-jj, m=(ii+.5)/W; if(ii<2||ii>=W-2||z>Hd-2)return WK; if(m>.82&&m<.9&&Math.abs(z-Hd*.42)<2)return BR; const top=z>Hd*.55; if(m>.16&&m<.84&&(top?z>Hd*.6&&z<Hd*.92:z>Hd*.1&&z<Hd*.48))return (ii+jj)%7?WL:WD; return WD; };
          for(const s2 of [-1,1])bq(pt(d0,0,s2*.02),pt(d1,0,s2*.02),pt(d1,Hd,s2*.02),pt(d0,Hd,s2*.02),faceTex(W,Hd,(ii,jj)=>C(dp(ii,jj))),kind); }
        let a=a0; const ds=holes.filter(h=>h.z0===0).sort((p,q)=>p.a0-q.a0), seg=(p,q)=>{ if(q-p<.01)return; if(ax==='x')sol(p,at-.1,q,at+.1,H); else sol(at-.1,p,at+.1,q,H); }; for(const d of ds){ seg(a,d.a0); a=d.a1; } seg(a,a1);
        cuts.push({kind,nx:ax==='y'?inS:0,nz:ax==='x'?inS:0,id,dyn:inner?(ax==='y'?X(at):Z(at)):null}); }
      if(!o.xo)flat(B.x0-.1,B.y0-.1,B.x1+.1,B.y1+.1,H,look.roof||roofCol,'R'+id); }
    solids_(outer); lamps_(lout); FLAME.props(outer,X,Y,Z,lamps);
    if(lazy)STORE.inside[id]={id,name,B,door,go:inside,done:false}; else inside();
    return rec(id,name,B,door,!!look.in||!!o.pieceWalls); };
  const rec=(id,name,B,door,walls)=>{ const R0=STORE.rooms.find(r=>r.id===id); if(R0)return R0;
    const dx=door?(door.w==='f'||door.w==='b'?door.a:door.w==='w'?B.x0+1.2:B.x1-1.2):(B.x0+B.x1)/2, dy=door?(door.w==='f'?B.y1-1.2:door.w==='b'?B.y0+1.2:door.a):(B.y0+B.y1)/2;
    const R={id,name,B,x0:X(B.x0),x1:X(B.x1),z0:Z(B.y0),z1:Z(B.y1),y0:-1,y1:Y(B.h),walls,at:{x:X(dx),z:Z(dy)},dw:door||null}; R.inside=(x,z)=>x>R.x0&&x<R.x1&&z>R.z0&&z<R.z1&&py>R.y0-.3&&py<R.y1;
    STORE.rooms.push(R); const pl=STORE.places.find(q=>q[0]===name); if(pl){ pl[1]=R.at.x; pl[2]=R.at.z; pl[3]='up'; } else STORE.places.push([name,R.at.x,R.at.z,'up']); return R; };

  const STEPS=[];
  if(!AWAY.has('diner')){ const B=B_('ldiner'), sc=B.s||1; laid('diner',()=>room('diner','THE DINER',B,{floor:K.diner.dinerFloorCol,in:K.diner.dinerWall},{w:'f',a:B.x0+9.5*sc,wd:1.56,h:94},B=>{ PRESETS['Preset Diner 1'].forEach(([k,dx,dy,r])=>put(k,B.x0+dx*sc,B.y0+dy*sc,r)); })); }

  if(!AWAY.has('bar')){ const B=B_('lbodega2'), D={w:'f',a:(B.x0+B.x1)/2,wd:1.56,h:94}; rec('bar','THE BAR',B,D,true); STEPS.push(()=>laid('bar',()=>room('bar','THE BAR',B,{floor:K.bar.barFloorCol,in:K.bar.barWall},D,(B,l0)=>{ const L=B.x0+T, R=B.x1-T, Kb=B.y0+T, F=B.y1-T, m=(B.x0+B.x1)/2, yE=F-1.35, along=x=>yE-(x-1.84);
      put('back bar',L+.42,along(5.2),3); put('bar soffit',L+1.5,along(4.5),3); put('neon sign: BAR',L+.08,Kb+2.3,0);
      put('bar round end',L+2.56,yE,3); put('bar counter: ashtray',L+2.66,along(3.3),3); put('bar counter: bottle',L+2.66,along(5.1),3); put('bar counter: glass',L+2.66,along(6.9),3); put('bar corner',L+1.6,along(8.26),3);
      const stools=[2.7,3.85,5,6.15,7.3].map(x=>{ put('bar stool',L+3.62,along(x)); return {x:L+3.62,y:along(x)}; });
      put('bar fridge',L+.4,Kb+1.0); put('potted plant',L+.5,Kb+2.7);
      const SX=R-2.5, SY=Kb+1.4; put('wide stage cloth',SX,Kb+.07,0); put('stage',SX,SY); put('neon sign: LIVE',SX+1.0,Kb+.16,1);
      const PX=SX-1.4, PY=Kb+2.686; put('grand piano on a stage',PX,PY,2); put('drum kit on a stage',SX+.35,Kb+1.25,0);
      put('red leather sofa',R-.46,Kb+4.6,2); put('red rug',R-1.7,Kb+4.6,1); put('bar table',R-1.55,Kb+4.6); put('red leather armchair',R-2.6,Kb+3.85); put('red leather armchair',R-2.6,Kb+5.35);
      put('bar table',R-1.5,Kb+8.0); put('red leather armchair',R-.55,Kb+8.0,2); put('red leather armchair',R-2.45,Kb+8.0);
      put('bar table',R-1.5,F-1.5); put('red leather armchair',R-.55,F-1.5,2); put('red leather armchair',R-2.45,F-1.5);
      put('poster: moon shrine',R-.02,Kb+3.2,2); put('poster: ghost sale',R-.02,Kb+6.5,2); put('poster: koi night',R-.02,Kb+11.3,2); put('poster: night painting',L+.02,F-3.6,0);
      put('TV on a bracket',R-.06,F-3.0,2); put('black cupboard',R-.31,F-3.0,2);
      put('exit sign, lit',m,F-.05,3); put('red rug',m,F-1.1,0); put('potted palm',L+.8,F-.75);
      put('ceiling fan',m,Kb+4.2); put('ceiling fan',m,F-4.2);
      for(const [i,y] of [[0,Kb+1.9],[1,Kb+5.0],[2,Kb+8.0],[3,F-2.0]]){ const x=i<3?R:L, n=i<3?[-1,0]:[1,0]; K.bar.theatreSconce(x,y,n); LAMPS.push({x:x+n[0]*.35,y,z:68,r:3.2,c:[1,.62,.34],room:true,own:true,day:true}); }
      LAMPS.push({x:SX,y:SY,z:108,r:5.5,c:[1.3,1.05,.66],room:true,own:true,day:true});
      for(const l of LAMPS.slice(l0)){ const k=l.prop&&(l.prop.kind||l.prop.name)||''; if(k==='bar table')continue; if(k==='exit sign, lit'){ l.c=l.c.map(v=>v*.45); continue; } l.off=1; }
      for(const x of [2.5,4.3,6.1])put('candle on the bar',L+2.76,along(x)); put('console TV',L+6.3,Kb+7.4);
      LAMPS.push({own:1,room:1,day:true,x:stools[1].x,y:stools[1].y,z:38,r:1.4,c:[.9,.36,.1]});
      STORE.bar={B,stage:{x:SX,y:SY,z:14+LAY.h('bar')*TILE/ZU/BLDK},piano:{x:PX,y:PY,keys:PY-1.736},drums:{x:SX+.35,y:Kb+1.25},gtr:{x:SX-.35,y:Kb+2.35},singer:{x:SX+.8,y:Kb+2.4},stools}; }))); }

  if(!AWAY.has('museum')){ const MK=K.museum, M=MK.MUS, B=M.b, SX=B.x0+B.x1, SY=B.y0+B.y1, FW=[[0,1],[-1,0],[0,-1],[1,0]], D={w:'f',a:SX-M.mid,wd:2.5,h:76}, stone=[226,220,204];
    const look={floor:(x,y)=>MK.museumFloorCol(SX-x,SY-y),in:(b,nx,ny,x,y,z,f)=>MK.museumWall(b,-nx,-ny,SX-x,SY-y,z,f),out:(nx,ny,x,y,z,f,H)=>MK.museumOutside(B,-nx,-ny,SX-x,SY-y,z,f,H)||sh(stone,f),cope:stone};
    const mp=(k,x,y,rot=0)=>{ const f=CATALOG[k]; BOD.K.STUDIO.face(FW[rot]); let p; try{ p=f(+x.toFixed(3),+y.toFixed(3)); }finally{ BOD.K.STUDIO.face(null); } if(!p)return null; p.kind=k; const cx=(p.x0+p.x1)/2, cy=(p.y0+p.y1)/2; BOD.placeAt(p,2,cx,cy,SX-cx,SY-cy,true); return p; };
    const L=(r,n,c,z,R)=>{ for(let i=0;i<n;i++){ const t=(i+.5)/n, al=r.y1-r.y0>=r.x1-r.x0; LAMPS.push({own:1,room:1,day:true,x:SX-(al?(r.x0+r.x1)/2:r.x0+(r.x1-r.x0)*t),y:SY-(al?r.y0+(r.y1-r.y0)*t:(r.y0+r.y1)/2),z,r:R,c}); } }, sp=[1.5,1.34,1.06];
    const mr=(lk,set,o)=>()=>room('museum','MUSEUM OF EARTH',B,lk,D,set,o);
    rec('museum','MUSEUM OF EARTH',B,D,true);
    const ym=(B.y0+B.y1)/2, lw={...look,floor:null};
    STEPS.push(()=>flat(B.x0,ym,B.x1,B.y1,.15,look.floor,'L'),()=>flat(B.x0,B.y0,B.x1,ym,.15,look.floor,'L'),
      mr(lw,()=>{},{xo:1,xw:[['f','x',B.y1,B.x0,B.x1,-1],['b','x',B.y0,B.x0,B.x1,1]]}),
      mr(lw,()=>{ flat(B.x0-.1,B.y0-.1,B.x1+.1,B.y1+.1,B.h,roofCol,'Rmuseum'); },{xo:1,xw:[['w','y',B.x0,B.y0-T,B.y1+T,1],['e','y',B.x1,B.y0-T,B.y1+T,-1]]}),
      mr({in:look.in},()=>{},{xo:1,xw:[...[M.hx0,M.hx1].map((x,i)=>['s'+i,'y',SX-x,SY-M.by,B.y1-T,i?1:-1,[{a0:SY-M.side[1],a1:SY-M.side[0],z0:0,z1:M.archZ}],true]),
        ['k','x',SY-M.by,B.x0+T,B.x1-T,1,[M.earth,M.humans,M.closed].map(([a,b])=>({a0:SX-b,a1:SX-a,z0:0,z1:M.archZ})),true],
        ...[M.hx0,M.hx1].map((x,i)=>['r'+i,'y',SX-x,B.y0+T,SY-M.by-T,i?1:-1,[],true])]}),
      mr({},()=>{ const py=B.y0-3, sd=(M.side[0]+M.side[1])/2;
        mp('museum portico steps',M.mid,(py+B.y0)/2); for(const dx of [-3.7,-1.2,1.2,3.7])mp('museum column',M.mid+dx,py+.7); mp('museum entablature',M.mid,py+.7,2);
        for(const x of [M.hx0+.8,M.hx1-.8])for(const y of [M.side[0]-.8,M.side[1]+.8,M.by-1.4])mp('museum hall column',x,y);
        mp('information desk',M.hx0+2.9,B.y0+1.8,2);
        mp('the Rosetta Stone',M.west.x0+3.4,sd,3); mp('Tutankhamun\'s mask',M.west.x0+3.4,B.y0+2,3); mp('painted coffin',M.west.x0+.55,M.by-2.2,3); mp('museum bench',M.west.x0+1.4,sd,3);
        mp('Lucy',M.east.x0+3.4,sd,1); mp('Laetoli footprints',M.east.x1-.65,B.y0+4,1); mp('four skulls',M.east.x1-.35,M.by-5,1); mp('hand axes',M.east.x0+.4,B.y0+2.5,3); mp('the Ishango bone',M.east.x0+.4,M.by-1.5,3);
        L(M.hall,3,[1.3,1.3,1.26],170,16); L(M.west,3,sp,96,10); L(M.east,3,sp,96,10); }),
      mr({},()=>{ const C=M.closedR; mp('woolly mammoth',M.mid,(M.humansR.y0+M.humansR.y1)/2+.4); mp('Gibeon meteorite',M.earthR.x0+1.6,M.earthR.y1-1.9);
        mp('terracotta warriors',(C.x0+C.x1)/2,C.y1-.9,2); mp('jade burial suit',C.x1-.55,C.y0+2.4,1); mp('the Sutton Hoo helmet',C.x0+.6,C.y0+1,3); mp('clay tablets',C.x0+.35,C.y0+3.4,3); mp('the Antikythera mechanism',(C.x0+C.x1)/2,C.y0+2.9,2);
        L(M.humansR,2,[1.5,1.08,.7],90,9); L(M.earthR,1,sp,96,9); L(M.closedR,1,sp,96,9); })); }


  const OFF=STORE.off={}, offmap=(name,lot,fn)=>{ OFF[name]={lot,fn}; STORE.places.push([name,0,0,'up','off']); }; STORE.kit={room,rec,flat,put,sol,STEPS,PLATE,offmap,planes}; for(const [n,k] of [['THE HERB COTTAGE','garden'],['THE AQUARIUM','aquarium'],['THE KEEP','keep'],['THE BUTTERFLIES','garden']])if(!AWAY.has(k))STORE.places.push([n,0,0,'up']);
  const GARDEN=STORE.garden={cottage:[72-15/BLDK,-77-14.6/BLDK],house:[72-4.6/BLDK,-77-9.2/BLDK]};
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
  { const AX=72+(AVE.x1-72)/BLDK, plaster=(B,nx,ny,Xw,Yw,z,f)=>sh(z<8?[118,112,102]:[168,160,146],f*(z<8?.9:1)), conc=(x,y)=>{ const n=grain(x,y,71,1.3); return n<.4?[92,90,86]:n>.7?[104,102,98]:[98,96,92]; };
    if(!AWAY.has('avenue'))for(const [id,name,z0,z1,d,h] of AVR){ STORE.places.push([name,0,0,'up']);
      STEPS.push(()=>{ '@later'; const B={id:'lav_'+id,x0:AX,y0:-77+z0/BLDK+.1,x1:AX+d,y1:-77+z1/BLDK-.1,h}; room('av_'+id,name,B,{floor:conc,in:plaster},{w:'w',a:(B.y0+B.y1)/2,wd:1.56,h:94},(B,l0)=>{ LAMPS.push({own:1,room:1,day:true,x:(B.x0+B.x1)/2,y:(B.y0+B.y1)/2,z:Math.min(h-20,120),r:Math.max(6,.75*Math.max(d,(z1-z0)/BLDK)),c:[1,.9,.75]}); }); }); } }

  offmap('VCR REPAIR',[368,-100,408,-72],()=>{ '@vcr'; const B={id:'lvcr',x0:380,y0:-92,x1:394,y1:-82,h:270}, H=B.h, hs=hash, P=[.2,2.5,4.95,7.9,10.05], WIN=[[.45,2.2],[5.2,7.6]], WZ=[42,118];
    const sto=(i,j)=>{ const r=hs(i,j,811); return r<.34?[214,200,182]:r<.56?[230,220,206]:r<.72?[186,164,142]:r<.82?[150,124,102]:r<.92?[246,242,234]:[112,94,80]; };
    const blk=(u,z)=>{ const r=Math.floor(z/5), i=Math.floor(u*24+(r&1)*5), c=Math.floor(i/10); if(i%10===9||Math.floor(z)%5===4)return [160,161,161]; const v=196+hs(c,r,812)*14; return [v,v,v-3]; };
    const front=(x,z,f)=>{ const u=x-B.x0;
      if(z>=H-5)return sh([88,82,78],f); if(z>=H-12)return sh([138,104,88],f);
      for(const [a,b] of WIN)if(u>a&&u<b&&z>WZ[0]&&z<WZ[1]){ const fr=u<a+.09||u>b-.09||z<WZ[0]+3||z>WZ[1]-3||Math.abs(u-(a+b)/2)<.04; if(fr)return sh([240,240,236],f);
        return sh((u-a)*24+(WZ[1]-z)*.5>8&&(u-a)*24+(WZ[1]-z)*.5<12?[104,114,124]:[58,65,72],f); }
      if(Math.abs(u-10.85)<.32&&z>104&&z<112)return sh(z>106&&z<110&&hs(Math.floor(x*24),Math.floor(z),813)<.45?[50,50,50]:[233,230,223],f);
      const s=sto(Math.floor(x*24),Math.floor(z)); return sh(z<10?sh(s,.8+.02*z):s,f); };
    const out=(nx,ny,Xw,Yw,z,f,cap)=>ny>0?front(Xw,z,f):sh(z<20?sh(blk(nx?Yw:Xw,z),.82+.009*z):blk(nx?Yw:Xw,z),f);
    const SX0=B.x0+3.1, SX1=B.x0+8.5, SZ0=146, SZ1=246, sw=Math.round((SX1-SX0)*24), shh=SZ1-SZ0, cvs=document.createElement('canvas'); cvs.width=sw; cvs.height=shh;
    const g=cvs.getContext('2d'); g.fillStyle='#eef1f4'; g.fillRect(0,0,sw,shh);
    g.save(); g.translate(sw*.54,shh*.22); g.rotate(-.12); g.transform(1,0,-.22,1,0,0); g.textAlign='center'; g.textBaseline='middle'; g.font='900 25px Impact,"Arial Black",sans-serif';
    g.lineWidth=3; g.strokeStyle='#0d1c55'; g.strokeText('LIGHTNING',0,0); g.fillStyle='#2547b8'; g.fillText('LIGHTNING',0,0); g.strokeText('FAST',18,25); g.fillText('FAST',18,25); g.restore();
    g.save(); g.translate(sw*.3,shh*.78); g.rotate(-.12); g.fillStyle='#111'; g.fillRect(-30,-14,62,24); g.fillStyle='#e6e6e6'; g.fillRect(-25,-10,15,10);
    g.fillStyle='#c8202a'; g.fillRect(-22,4,104,16); g.fillStyle='#fff'; g.font='bold 12px "Arial Black",Arial,sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('VCR REPAIR',30,12); g.restore();
    const SD=g.getImageData(0,0,sw,shh).data, sig=(x,z)=>{ const i=Math.max(0,Math.min(sw-1,Math.floor((x-SX0)*24))), j=Math.max(0,Math.min(shh-1,Math.floor(SZ1-z))), k=(j*sw+i)*4; return [SD[k],SD[k+1],SD[k+2]]; };
    const conc=(x,y)=>{ const n=grain(x,y,814,1.2); return n<.4?[170,168,160]:n>.7?[186,184,176]:[178,176,168]; }, asph=(x,y)=>{ const r=hs(Math.floor(x*24),Math.floor(y*24),815); return r<.03?[118,118,122]:sh([66,67,71],.94+r*.12); };
    const mulchC=(x,y)=>{ const r=hs(Math.floor(x*24),Math.floor(y*24),816); return r<.4?[150,92,52]:r<.7?[118,70,40]:r<.88?[176,118,70]:[84,56,36]; };
    for(const [a,b,c,d] of [[B.x0-8,B.y1,B.x1+10,B.y1+8],[B.x0-8,B.y0-4,B.x1+10,B.y0],[B.x0-8,B.y0,B.x0,B.y1],[B.x1,B.y0,B.x1+10,B.y1]])flat(a,b,c,d,.1,asph,'L');
    flat(B.x0+8,B.y1,B.x1+.5,B.y1+2.2,.6,conc,'L'); flat(B.x1,B.y0,B.x1+2,B.y1,.6,conc,'L');
    const vinyl=(x,y)=>{ const i=Math.floor(x*2), j=Math.floor(y*2), r=hs(Math.floor(x*24),Math.floor(y*24),820); return sh((i+j)&1?[150,152,150]:[196,196,190],r<.04?.9:1); };
    room('vcr','VCR REPAIR',B,{floor:vinyl,in:(B,nx,ny,Xw,Yw,z,f)=>sh(z<8?[118,112,102]:[200,196,186],f*(z<8?.9:1)),out,cope:[88,82,78]},{w:'f',a:B.x0+10.85,wd:1.56,h:94},(B,l0)=>{
      const thing=(name,boxes,o={})=>PROPS.push({kind:name,name,boxes,...o}), bx=(x0,y0,x1,y1,z0,z1,c,more={})=>({x0,y0,x1,y1,z0,z1,c,...more});
      thing('pilasters',P.map(u=>bx(B.x0+u-.22,B.y1,B.x0+u+.22,B.y1+.16,0,H-12,[138,104,88])),{walk:1});
      thing('sign',[bx(SX0-.08,B.y1,SX1+.08,B.y1+.22,SZ0-4,SZ1+4,[198,204,212]),bx(SX0,B.y1+.22,SX1,B.y1+.26,SZ0,SZ1,[238,240,244],{em:1,fs:(nx,ny,X_,Y_,z,s)=>ny>0?sig(X_,SZ0+z):sh([198,204,212],s)})],{high:1});
      thing('window sills',WIN.map(([a,b])=>bx(B.x0+a-.1,B.y1,B.x0+b+.1,B.y1+.22,WZ[0]-4,WZ[0],[208,208,202])),{high:1});
      const ex=B.x1, ez=B.y1-1.4, arm=[112,116,120];
      thing('gooseneck lamp',[bx(ex,ez-.06,ex+.12,ez+.06,H-24,H-14,arm),bx(ex,ez-.04,ex+1,ez+.04,H-14,H-11,arm),bx(ex+.92,ez-.04,ex+1,ez+.04,H-24,H-11,arm),bx(ex+.74,ez-.22,ex+1.18,ez+.22,H-32,H-24,[93,98,102])],{high:1});
      LAMPS.push({own:1,x:ex+.96,y:ez,z:H-36,r:15,c:[1,.86,.62]});
      thing('camera',[bx(ex,ez-1.2,ex+.3,ez-.9,H-80,H-72,[226,226,223])],{high:1});
      thing('meter',[bx(ex,B.y0+4.2,ex+.22,B.y0+4.7,30,46,[63,110,168])],{high:1});
      const fy=B.y0+4.6, fx0=B.x1, fx1=B.x1+9, post=[169,173,177], mesh=(nx,ny,X_,Y_,z)=>{ const a=Math.floor(X_*24)+Math.floor(z), b=Math.floor(X_*24)-Math.floor(z); return (((a%6)+6)%6===0||((b%6)+6)%6===0)?[195,199,203]:null; };
      thing('chain-link fence',[...[fx0+.05,fx0+4,fx1].map(x=>bx(x-.06,fy-.06,x+.06,fy+.06,0,74,post)),bx(fx0,fy-.03,fx1,fy+.03,64,67,post),bx(fx0,fy-.01,fx1,fy+.01,2,64,post,{fs:mesh}),
        ...[70,75,80].map(z=>bx(fx0,fy-.05,fx1,fy-.04,z,z+.6,[120,122,124]))],{solids:[{x0:fx0,y0:fy-.1,x1:fx1,y1:fy+.1}]});
      const by0=B.y1+.16, by1=B.y1+2.1, bx0=B.x0, bx1=B.x0+7.4, tw=[90,68,54];
      thing('planter',[bx(bx0,by0,bx1,by1,0,6,[185,183,176],{top:(x,y)=>x>bx0+.15&&x<bx1-.15&&y>by0+.1&&y<by1-.15?mulchC(x,y):[185,183,176]})],{walk:1});
      const tws=[]; for(const [cx,s] of [[.7,.9],[1.9,1.1],[3.4,1.3],[4.9,.8],[6.3,1]])for(let i=0;i<8;i++){ const x=bx0+cx+(hs(i,cx*10,817)-.5)*.9*s, y=by0+.95+(hs(i,cx*10,818)-.5)*.7*s, h=(18+hs(i,cx*10,819)*22)*s; tws.push(bx(x-.025,y-.025,x+.025,y+.025,6,6+h,tw)); }
      thing('bare shrubs',tws,{walk:1});
      const vcr=(x,y,z,c,led)=>bx(x,y,x+.72,y+.6,z,z+11,c,{top:()=>sh(c,1.12),fs:(nx,ny,P,Q,zz,s)=>{ if(ny<=0)return sh(c,s); const u=(P-x)/.72;
        if(zz>4&&zz<6.5&&u>.18&&u<.66)return [18,18,20]; if(led&&zz>6&&zz<8&&u>.8&&u<.86)return led; if(zz<1.5)return sh(c,.7); return c; }});
      const VC=[[34,34,38],[158,160,164],[74,74,80],[40,38,44],[132,128,120]], LED=[[90,220,120],[230,80,60],null];
      const steel=[118,124,130], SL=[4,38,72,106,140,174], sy0=B.y0+.12, sy1=B.y0+1.02;
      for(let k=0;k<3;k++){ const sx0=B.x0+.4+k*4.45, sx1=sx0+4.25, bs=[bx(sx0,sy0,sx0+.08,sy1,0,180,steel),bx(sx1-.08,sy0,sx1,sy1,0,180,steel),bx(sx0,sy0,sx1,sy0+.05,0,180,[96,100,106])];
        for(const z of SL)bs.push(bx(sx0,sy0,sx1,sy1,z-3,z,steel));
        for(let si=0;si<SL.length-1;si++)for(let n=0;n<5;n++){ const r=hs(k*31+si,n,821); if(r<.12)continue; const x=sx0+.18+n*.8+(r-.5)*.06; bs.push(vcr(x,sy1-.68,SL[si],VC[Math.floor(r*97)%VC.length],LED[Math.floor(r*53)%LED.length]));
          if(r>.8&&si<SL.length-2)bs.push(vcr(x+.02,sy1-.66,SL[si]+11,VC[Math.floor(r*41)%VC.length],null)); }
        thing('shelving of VCRs',bs); }
      const cy0=B.y1-4.6, cy1=B.y1-3.9, cx0=B.x0+1.6, cx1=B.x0+8.6, wood=[112,80,54];
      thing('counter',[bx(cx0,cy0,cx1,cy1,0,40,wood,{top:()=>[200,194,180],fs:(nx,ny,P,Q,z,s)=>sh(z>37?[200,194,180]:(Math.floor((nx?Q:P)*24)%12===0)?[84,58,40]:wood,s)})]);
      thing('till',[bx(cx1-1.2,cy0+.1,cx1-.55,cy1-.1,40,50,[58,58,62]),bx(cx1-1.1,cy0+.2,cx1-.65,cy0+.32,50,57,[40,40,44]),bx(cx1-1.06,cy0+.33,cx1-.69,cy0+.35,51,56,[110,230,140],{em:1})],{high:1});
      thing('deck on the counter',[vcr(cx0+2.4,cy0+.06,40,[150,150,154],[90,220,120])],{high:1});
      const tp=[]; for(let i=0;i<6;i++)tp.push(bx(cx0+.3+(i%2)*.05,cy0+.15,cx0+.75+(i%2)*.05,cy0+.4,40+i*3,43+i*3,[26,26,28],{fs:(nx,ny,P,Q,z,s)=>nx===0&&z>.8&&z<2.2?[236,232,220]:sh([26,26,28],s)})); thing('tapes',tp,{high:1});
      const wx0=B.x0+.12, wx1=B.x0+1.2, wy0=B.y0+1.8, wy1=B.y0+7, tvy=wy0+.9;
      thing('repair bench',[bx(wx0,wy0,wx1,wy1,0,36,[92,74,58],{top:()=>[132,108,84]})]);
      thing('old TV',[bx(wx0+.05,tvy-.45,wx0+.9,tvy+.45,36,60,[72,66,60]),bx(wx0+.9,tvy-.34,wx0+.94,tvy+.34,40,57,[140,160,200],{em:1,fs:(nx,ny,P,Q,z)=>{ const r=hs(Math.floor(Q*48),Math.floor(z*2),822); return r<.3?[60,70,96]:r<.7?[140,156,196]:[214,222,236]; }})],{high:1});
      thing('open deck',[bx(wx0+.15,wy0+2,wx0+.85,wy0+2.75,36,40,[150,150,154],{top:(x,y)=>{ const r=hs(Math.floor(x*24),Math.floor(y*24),823); return r<.12?[200,180,90]:r<.2?[40,40,40]:[46,112,64]; }})],{high:1});
      thing('iron and stand',[bx(wx0+.3,wy0+3.3,wx0+.55,wy0+3.55,36,39,[60,60,64]),bx(wx0+.38,wy0+3.38,wx0+.47,wy0+3.47,39,50,[180,60,40])],{high:1});
      thing('bench lamp',[bx(wx0+.1,wy0+4.2,wx0+.3,wy0+4.4,36,38,[50,52,56]),bx(wx0+.17,wy0+4.27,wx0+.23,wy0+4.33,38,62,[50,52,56]),bx(wx0+.15,wy0+4.25,wx0+.75,wy0+4.35,60,62,[50,52,56]),bx(wx0+.55,wy0+4.1,wx0+.85,wy0+4.5,54,60,[66,120,96])],{high:1});
      LAMPS.push({own:1,room:1,day:true,x:wx0+.7,y:wy0+4.3,z:52,r:4,c:[1,.85,.6]});
      thing('stool',[bx(wx1+.45,wy0+2.1,wx1+.85,wy0+2.5,0,28,[60,60,66],{top:()=>[150,40,36]})]);
      const cb=[176,136,92], tape=(nx,ny,P,Q,z,s)=>Math.abs(z-6)<1||Math.abs((nx?Q:P)%1-.5)<.04?[206,180,130]:sh(cb,s);
      thing('cardboard boxes',[bx(B.x1-1.3,B.y0+2,B.x1-.15,B.y0+3,0,26,cb,{fs:tape,top:(x,y)=>Math.abs(y-(B.y0+2.5))<.05?[206,180,130]:cb}),bx(B.x1-1.2,B.y0+2.1,B.x1-.3,B.y0+2.9,26,46,sh(cb,.92),{fs:tape})]);
      thing('poster',[bx(B.x1-.13,B.y1-6.2,B.x1-.11,B.y1-5,50,96,[30,60,150],{fs:(nx,ny,P,Q,z)=>z>36?[220,40,50]:z>30?[245,240,230]:[30,60,150]})],{high:1});
      const GL={V:'10001100011000110001100010101000100',H:'10001100011000111111100011000110001',S:'01111100001000001110000010000111110',O:'01110100011000110001100011000101110',P:'11110100011000111110100001000010000',E:'11111100001000011110100001000011111',N:'10001110011010110011100011000110001'};
      const neonW=(word,cell,at,zc,col)=>{ const bs=[], c=Object.assign(col.slice(),{e:1}); [...word].forEach((ch,i)=>{ const g=GL[ch]; for(let r=0;r<7;r++)for(let q=0;q<5;q++)if(g[r*5+q]==='1')bs.push(at(i*6+q,cell,zc-(r+1)*cell.z,c)); }); return bs; };
      thing('neon VHS',neonW('VHS',{a:.32,z:13},(k,cl,z,c)=>bx(ex,B.y1-3-(k+1)*cl.a+.03,ex+.07,B.y1-3-k*cl.a-.03,z+1.5,z+cl.z-1.5,c,{em:1}),214,[255,96,206]),{high:1});
      thing('neon OPEN',neonW('OPEN',{a:.1,z:8},(k,cl,z,c)=>bx(B.x0+5.25+k*cl.a+.01,B.y1+.23,B.x0+5.25+(k+1)*cl.a-.01,B.y1+.27,z+1,z+cl.z-1,c,{em:1}),110,[90,230,255]),{high:1});
      LAMPS.push({own:1,x:ex+1.4,y:B.y1-5.9,z:150,r:12,c:[1,.32,.82]}); LAMPS.push({own:1,x:B.x0+6.4,y:B.y1+1.2,z:70,r:6,c:[.32,.88,1]});
      LAMPS.push({own:1,room:1,day:true,x:(B.x0+B.x1)/2,y:(B.y0+B.y1)/2,z:H-40,r:13,c:[1,.92,.8]}); });
    { const LOT={x0:X(B.x0-12),x1:X(B.x1+14),z0:Z(B.y0-8),z1:Z(B.y1+10)}, on=()=>LVL==='up'&&pos.x>LOT.x0&&pos.x<LOT.x1&&pos.z>LOT.z0&&pos.z<LOT.z1;
      const P_=[], C_=[], q=(a,b,c_,d,col)=>{ for(const v of [a,b,c_,a,c_,d]){ P_.push(...v); C_.push(...col); } };
      const box3=(x0,y0,x1,y1,z0,z1,col)=>{ const a=X(x0),b=X(x1),f=Z(y1),k=Z(y0),lo=Y(z0),hi=Y(z1), dk=col.map(v=>v*.8);
        q([a,lo,f],[b,lo,f],[b,hi,f],[a,hi,f],col); q([b,lo,k],[a,lo,k],[a,hi,k],[b,hi,k],dk); q([a,lo,k],[a,lo,f],[a,hi,f],[a,hi,k],dk); q([b,lo,f],[b,lo,k],[b,hi,k],[b,hi,f],dk); q([a,hi,f],[b,hi,f],[b,hi,k],[a,hi,k],col.map(v=>v*.7)); };
      const WC=[[1,.4,.85],[.4,.9,1],[1,.75,.4]], TW=[[358,-118,368,-106,520],[371,-124,381,-110,760],[384,-116,393,-106,420],[397,-126,409,-112,920],[412,-116,421,-104,600],[350,-101,360,-89,480],[349,-86,358,-77,340],[413,-99,423,-88,540],[418,-85,427,-76,380]];
      TW.forEach(([x0,y0,x1,y1,h],ti)=>{ box3(x0,y0,x1,y1,0,h,[.17,.14,.22]);
        for(let zz=30;zz<h-20;zz+=22)for(let u=x0+.6;u<x1-.4;u+=1.1){ const r=hash(ti*97+Math.round(u*10),zz,830); if(r>.16)continue; const c=WC[Math.floor(r*61)%3], fy=Z(y1)+.02, a=X(u), b=X(u+.5);
          q([a,Y(zz),fy],[b,Y(zz),fy],[b,Y(zz+9),fy],[a,Y(zz+9),fy],c); }
        for(const xs of [x0,x1])for(let zz=30;zz<h-20;zz+=22)for(let u=y0+.6;u<y1-.4;u+=1.1){ const r=hash(ti*53+Math.round(u*10),zz+(xs===x0?1:2),831); if(r>.1)continue; const c=WC[Math.floor(r*71)%3], fx=X(xs)+(xs===x0?-.02:.02);
          q([fx,Y(zz),Z(u)],[fx,Y(zz),Z(u+.5)],[fx,Y(zz+9),Z(u+.5)],[fx,Y(zz+9),Z(u)],c); } });
      const PA=[B.x1+11,B.y1+1.6], PB=[B.x0-6,B.y1+1.6], PH=360, wood=[78,60,46];
      for(const [px_,py_] of [PA,PB]){ BATCH.tag=OBJ('store:vcr','pole'); gbox({x0:px_-.12,y0:py_-.12,x1:px_+.12,y1:py_+.12,z0:0,z1:PH,c:wood}); gbox({x0:px_-1,y0:py_-.06,x1:px_+1,y1:py_+.06,z0:PH-24,z1:PH-18,c:wood});
        SOL.up.push([X(px_-.15),Z(py_-.15),X(px_+.15),Z(py_+.15)]); } BATCH.tag=null;
      const cable=(a,b,sag)=>{ const N=18, w=.025*TILE; let pr=null; for(let i=0;i<=N;i++){ const t=i/N, p=[X(a[0]+(b[0]-a[0])*t),Y(a[2]+(b[2]-a[2])*t)-sag*TILE*4*t*(1-t),Z(a[1]+(b[1]-a[1])*t)];
          if(pr){ const col=[.07,.05,.09]; q([pr[0],pr[1]-w,pr[2]],[p[0],p[1]-w,p[2]],[p[0],p[1]+w,p[2]],[pr[0],pr[1]+w,pr[2]],col); q([pr[0]-w,pr[1],pr[2]-w],[p[0]-w,p[1],p[2]-w],[p[0]+w,p[1],p[2]+w],[pr[0]+w,pr[1],pr[2]+w],col); } pr=p; } };
      cable([B.x1,B.y1-.4,H],[PA[0]-.9,PA[1],PH-18],1.1); cable([PB[0]+.9,PB[1],PH-18],[PA[0]-.9,PA[1],PH-18],2.6); cable([PB[0]-.9,PB[1],PH-18],[PA[0]+.9,PA[1],PH-18],3.2);
      cable([PA[0]+.9,PA[1],PH-18],[403,-112,700],2); cable([PB[0]-.9,PB[1],PH-18],[365,-106,420],1.6); cable([B.x0,B.y0+.5,H],[376,-110,560],1.4);
      const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P_,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(C_,3));
      const CU={uCF:{value:new THREE.Vector3(0,0,1)},uCO:{value:new THREE.Vector3()}}, cmat=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide});
      cmat.onBeforeCompile=sh=>{ Object.assign(sh.uniforms,CU); sh.vertexShader='varying vec3 vCW;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n vCW=(modelMatrix*vec4(transformed,1.)).xyz;');
        sh.fragmentShader='varying vec3 vCW; uniform vec3 uCF,uCO;\n'+sh.fragmentShader.replace('void main() {','void main() { if(dot(vCW.xz-uCO.xz,uCF.xz)<-'+(3*TILE).toFixed(3)+') discard;'); };
      cmat.customProgramCacheKey=()=>'vcrcity';
      const city=new THREE.Mesh(g,cmat); city.frustumCulled=false; city.visible=false; scene.add(city);
      const gnd=new THREE.Mesh(new THREE.PlaneGeometry(220*TILE,140*TILE).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({color:0x2c2b30})); gnd.position.set(X((B.x0+B.x1)/2),Y(.02),Z(B.y1)); gnd.receiveShadow=true; scene.add(gnd);
      const BH=60*TILE, beam=new THREE.Mesh(new THREE.ConeGeometry(4.5*TILE,BH,14,1,true).translate(0,-BH/2,0),new THREE.MeshBasicMaterial({color:0xd8c8ff,transparent:true,opacity:.07,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide}));
      beam.position.set(X(403),Y(930),Z(-119)); beam.rotation.order='YXZ'; beam.visible=false; scene.add(beam);
      const FOGV=new THREE.Fog(0x4a1c55,2,200), cN=new THREE.Color(.40,.11,.44), cD=new THREE.Color(.66,.54,.72), V3=new THREE.Vector3(); let was=false;
      if(window.WX){ const at0=WX.at; WX.at=t=>{ const w=at0(t); return on()?Object.assign({},w,{cloud:1,rain:.72,storm:0,snow:0,fog:0,wind:Math.max(.3,w.wind||0)}):w; }; }
      const tick0=CLOCK.tick; CLOCK.tick=dt=>{ tick0(dt); const here=on(), inside=!!ROOMS.cur;
        city.visible=beam.visible=here&&!inside;
        if(!here||inside){ if(was){ was=false; if(scene.fog===FOGV)scene.fog=null; } return; } was=true;
        const n=Math.max(0,Math.min(1,(4-CLOCK.elev())/10)), t=performance.now()/1000, d=-V3.copy(pos).applyMatrix4(cam.matrixWorldInverse).z;
        FOGV.color.copy(cD).lerp(cN,n); FOGV.near=d-(11+6*n)*TILE; FOGV.far=d+(40-10*n)*TILE; scene.fog=FOGV; scene.background.lerp(FOGV.color,.85);
        cam.getWorldDirection(V3); V3.y=0; if(V3.lengthSq()<1e-6)V3.set(0,0,1); CU.uCF.value.copy(V3.normalize()); CU.uCO.value.set(pos.x,0,pos.z);
        beam.rotation.y=Math.sin(t*.13)*1.1+.4; beam.rotation.x=2.35+Math.sin(t*.21)*.12; beam.material.opacity=.03+.06*n; }; }
  });

  const bake=()=>{ BATCH.cast=true;
  BATCH.build((k,map,emap)=>{ const pl=planes[k], cp=pl?{clippingPlanes:[pl]}:{};
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
  { const pend=[]; let done=false;
    const lit=()=>{ if(!LITE.recs.length)return; const nl=[]; scene.traverse(o=>{ if(o.isPointLight&&!o.userData.pool)nl.push(o); }); for(const L of nl){ L.userData.grp=null; L.castShadow=false; L.removeFromParent(); LITE.recs.push(L); } };
    const need=()=>[...new Set(['later',...STEPS.map(f=>f.chunk).filter(Boolean)])];
    const step=()=>{ STEPS.shift()(); pend.push(...BATCH.items.splice(0)); lit(); STORE.doorThings(); };
    const finish=()=>{ if(done)return; done=true; while(STEPS.length)step(); if(!pend.length)return; BATCH.items=pend; Object.assign(STORE.meshes,bake());
      const Tk=STORE.tank; if(Tk){ WATER.body({name:'tank',X0:X(Tk.x0),X1:X(Tk.x1),Z0:Z(Tk.y0),Z1:Z(Tk.y1),lvl:Y(Tk.z+(Tk.dz||0)),GX:110,GY:40,dep:()=>(Tk.z-Tk.bed)/50*1.8});
    const gm=new THREE.MeshLambertMaterial({color:new THREE.Color(.5,.62,.7),transparent:true,opacity:.18,side:THREE.DoubleSide,depthWrite:false}), gh=Y(Tk.z+4)-Y(Tk.bed), gy=(Y(Tk.z+4)+Y(Tk.bed))/2+Y(Tk.dz||0)-Y(0);
    for(const [x,z,w,ry] of [[(Tk.x0+Tk.x1)/2,Tk.y0,Tk.x1-Tk.x0,0],[(Tk.x0+Tk.x1)/2,Tk.y1,Tk.x1-Tk.x0,0],[Tk.x0,(Tk.y0+Tk.y1)/2,Tk.y1-Tk.y0,Math.PI/2],[Tk.x1,(Tk.y0+Tk.y1)/2,Tk.y1-Tk.y0,Math.PI/2]]){ const m=new THREE.Mesh(new THREE.PlaneGeometry(w*TILE*BLDK,gh),gm); m.position.set(X(x),gy,Z(z)); m.rotation.y=ry; scene.add(m); }  }
      if(STORE.houseAt){ const H=STORE.houseAt, hp=(dx,dy,z)=>[X(H[0]+dx),Y(z+(STORE.houseZ||0)),Z(H[1]+dy)], HP=[hp(-.16,-.09,38),hp(-.12,.07,41),hp(.18,.09,37),hp(.13,-.1,35),hp(-.06,0,44),hp(.06,0,44),hp(.08,-.11,32),hp(-.24,0,47),hp(.24,0,47),hp(0,-.17,49)];
    [12,21].forEach((k,i)=>{ const b=BF.add(k,HP); b.at=b.to=i*4; b.g.position.set(...HP[b.at]); }); }
      if(ROOMS.reset)ROOMS.reset(); if(window.CLIP)window.CLIP.run(); if(typeof INTERIORS!=='undefined')INTERIORS.build(); };
    STORE.need=()=>LOAD(...need());
    STORE.ensure=async()=>{ await LOAD(...need()); finish(); };
    STORE.offGo=n=>{ const o=OFF[n]; if(!o||o.done)return; if(!LOADED(o.fn.chunk)||need().some(c=>!LOADED(c)))return o.wait||(o.wait=LOAD(o.fn.chunk,...need()).then(()=>STORE.offGo(n))); finish(); o.done=1; STORE.now=1; o.fn(); STORE.now=0; const it=BATCH.items.splice(0); lit(); if(it.length){ BATCH.items=it; Object.assign(STORE.meshes,bake()); }
      if(ROOMS.reset)ROOMS.reset(); if(window.CLIP)window.CLIP.run(); if(typeof INTERIORS!=='undefined')INTERIORS.build(); };
    STORE.inGo=id=>{ '@later'; const R=STORE.inside[id]; if(!R||R.done)return; R.done=true; finish(); STORE.now=1; R.go(); STORE.now=0; const it=BATCH.items.splice(0); lit(); if(it.length){ BATCH.items=it; Object.assign(STORE.meshes,bake()); }
      if(ROOMS.reset)ROOMS.reset(); if(window.CLIP)window.CLIP.run(); if(typeof INTERIORS!=='undefined')INTERIORS.build(); };
    const DOORP=(R,k)=>{ const d=R.door, B=R.B; return d.w==='f'?[d.a,B.y1+k]:d.w==='b'?[d.a,B.y0-k]:d.w==='w'?[B.x0-k,d.a]:[B.x1+k,d.a]; };
    const frames=n=>new Promise(r=>{ const f=()=>--n<=0?r():requestAnimationFrame(f); requestAnimationFrame(f); });
    STORE.enter=async(id,walk)=>{ const R=STORE.inside[id]; if(!R||R.busy)return; R.busy=true; const el=document.getElementById('subfade'), name=/^THE /.test(R.name)?R.name:'THE '+R.name;
      if(!R.done){ if(el){ el.textContent='ENTERING '+name; el.style.opacity='1'; } if(typeof keys!=='undefined'&&keys.clear)keys.clear(); await frames(3); await LOAD(...need()); STORE.inGo(id); await frames(2); }
      if(walk){ const [x,y]=DOORP(R,-1.4); STORE.goTo(X(x),Z(y),'up'); await frames(2); } if(el)el.style.opacity='0'; R.busy=false; };
    STORE.inAt=(x,z)=>{ for(const id in STORE.inside){ const R=STORE.inside[id]; if(R.done||R.busy)continue; const B=R.B; if(x>X(B.x0)&&x<X(B.x1)&&Math.min(Z(B.y0),Z(B.y1))<z&&z<Math.max(Z(B.y0),Z(B.y1)))STORE.enter(id,false); } };
    STORE.doorThings=()=>{ if(typeof UI==='undefined'||!UI.thing)return; for(const id in STORE.inside){ const R=STORE.inside[id]; if(R.th)continue; const [x,y]=DOORP(R,.35), hb=new THREE.Mesh(new THREE.BoxGeometry(1.4*TILE,2.6*TILE,.5*TILE),new THREE.MeshBasicMaterial({visible:false}));
      hb.position.set(X(x),1.3*TILE,Z(y)); scene.add(hb); R.th={name:/^THE /.test(R.name)?R.name:'THE '+R.name,ghost:1,obj:hb,reach:1.4*TILE,near:2.4*TILE,tall:2.6*TILE,act:()=>STORE.enter(id,true)}; UI.thing(R.th); }
      if(!STORE.xth){ STORE.xth=1; const xd=(name,x,y,ix,iy)=>{ const hb=new THREE.Mesh(new THREE.BoxGeometry(1.4*TILE,2.6*TILE,.5*TILE),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(X(x),1.3*TILE,Z(y)); scene.add(hb);
          UI.thing({name,ghost:1,obj:hb,reach:1.4*TILE,near:2.4*TILE,tall:2.6*TILE,act:()=>STORE.goTo(X(ix),Z(iy),'up')}); };
        { const B=BOD.B0, m=(B.x0+B.x1)/2; xd('THE BODEGA',m,B.y1+.35,m,B.y1-1.4); }
        if(BOD.GD){ const [x,y]=BOD.GD.door; xd('THE BATH HOUSE',x,y+.35,x,y-1); } } };
    STORE.offAt=(x,z)=>{ const w=[]; for(const n in OFF){ const [a,b,c,d]=OFF[n].lot; if(!OFF[n].done&&x>X(a)&&x<X(c)&&z>Z(b)&&z<Z(d))w.push(STORE.offGo(n)); } return Promise.all(w); };
    const run=()=>{ if(done)return; const c=need().filter(c=>!LOADED(c)); if(c.length){ LOAD(...c).then(run,()=>setTimeout(run,2000)); return; } if(STEPS.length){ step(); setTimeout(run,60); } else finish(); };
    STORE.later=()=>{ if(QS.get('steps')!=='0')setTimeout(run,1500); }; }
});
