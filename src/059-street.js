// MARKET ST: the lots along Market St (the theatre, the arcade, the playhouse and the rest; its own builder).
import {SHARED, THREE} from './003-shx.js';
import {BATCH, BLK, CINEMA, pos} from './003b-systems.js';
import {scene} from './004-main.js';
import {AWAY, BLDK, BLOCK, cutWalls, FIX, grab, OFFDX, SOL, STORE, SYS, TILE, TURN, WP} from './006-map-pre.js';
import {OBJS} from './008-batch.js';
import {BLOCKS} from './038zb-blocks.js';
await grab('mainstreet',async()=>{ const K=STORE.kit, {room,STEPS}=K, {X,Y,Z,placeAt,facade,gbox}=SHARED.BOD, sh=SHARED.BOD.K.sh, SK=SHARED.BOD.STOREK, {PROPS,LAMPS}=SK, T=SK.T, TH=SK.theatre, PY=SK.play, hs=SHARED.BOD.g.hash;
  const bx=m=>SHARED.BOD.OX+(m-SHARED.BOD.OX)/BLDK, by=m=>SHARED.BOD.OY+(m-SHARED.BOD.OY)/BLDK, lot=(k,h)=>{ const p=WP[k]; return p&&p.y1!=null?{x0:bx(p.x0)+.1,x1:bx(p.x1)-.1,y0:by(p.y0)+.1,y1:by(p.y1),h}:{x0:bx(BLOCK.lots[k][0])+.1,x1:bx(BLOCK.lots[k][1])-.1,y0:by(BLOCK.back)+.1,y1:SHARED.BOD.OY,h}; };
  const turn=(B,n0,l0)=>{ const cx=(B.x0+B.x1)/2, cy=(B.y0+B.y1)/2; for(const p of PROPS.slice(n0))placeAt(p,2,cx,cy,cx,cy); for(const l of LAMPS.slice(l0)){ l.x=2*cx-l.x; l.y=2*cy-l.y; } };
  const lit=c=>Object.assign(c.slice(),{e:1}), FONT={...TH.THFONT,D:'####.#...##...##...##...##...#####.',L:'#....#....#....#....#....#....#####',Y:'#...##...#.#.#...#....#....#....#..'};
  const word=(s,c0,z0,k)=>(c,z)=>{ const i=Math.floor((c-c0)/k), r=6-Math.floor((z-z0)/k); if(c<c0||z<z0||i>=s.length*6-1||r<0||r>6)return false; const q=i%6, g=FONT[s[Math.floor(i/6)]]; return q<5&&!!g&&g[r*5+q]==='#'; };
  const neon=(on,c,z,k,col,f)=>{ if(on(c,z))return lit(col); for(const [a,b] of [[-k,0],[k,0],[0,-k],[0,k]])if(on(c+a,z+b))return sh(col,.42*f); return null; };
  const unplace=n=>{ const i=STORE.places.findIndex(p=>p[0]===n); if(i>=0)STORE.places.splice(i,1); }, door=(k,f)=>{ const T=TURN(lot(k),WP[k].face), L=T.L, u=L.x0+f(L), a=T.pt(u,L.y1+2.2/BLDK), b=T.pt(u,L.y1); return [X(a[0]),Z(a[1]),X(b[0]),Z(b[1]),T.hd(0)]; };
  const MS=STORE.main={lot,word,neon,unplace,doors:[...(AWAY.has('theatre')?[]:[['THE MOVIE THEATRE',...door('theatre',()=>4.4)]]),['THE ARCADE',...door('arcade',L=>(L.x1-L.x0)/2)],...(AWAY.has('playhouse')?[]:[['THE PLAYHOUSE',...door('play',L=>(L.x1-L.x0)/2)]])]};

  if(!AWAY.has('theatre')){   // the theatre keeps its walls inside (off the map, nothing outside to see)
  // the theatre is built in its own frame (the front at the local y1) and turned onto its street like the bar: props and lamps by turnIn, the painters by loc
  STEPS.push(()=>{ '@later'; const TM=.924, ZM=TILE/.84/(Y(1)-Y(0));   // a theatre tile in metres; wall rows in a metre
    // THE STARLITE inside (owner, 11 Nov 2026), in metres from the screen wall: ten rows of seats each a step up, the way in beside the screen
    const LAY={D:26,W:16,H:8.5,RISE:.22,ROWS:10,ROWD:1.5,ROW0:8,STEP0:7.05,NS:9,PITCH:.62,AISLE:.9,DOOR:3.4,SW:9.6,SY:1.15}; LAY.floorH=u=>u<LAY.STEP0?0:Math.min(LAY.ROWS-1,Math.floor((u-LAY.STEP0)/LAY.ROWD))*LAY.RISE;
    const BW0=lot('theatre',300), OXT=WP.theatre.pf?1150+OFFDX/BLDK-(BW0.x0+BW0.x1)/2:0, BW=OXT?{...BW0,x0:BW0.x0+OXT,x1:BW0.x0+OXT+LAY.D/TM+.2,y0:BW0.y1-LAY.W/TM-.2,h:Math.round(LAY.H*ZM)+2}:BW0, TB=TURN(BW,WP.theatre.face), B={...BW,...TB.L}, W=B.x1-B.x0, cx=(B.x0+B.x1)/2, prop=SK.prop, sided=SK.sided; STORE.theatreFrame={B,TB,LAY};   // the theatre's own layout and its turn, for what furnishes it
    const door=OXT?B.x0+.1+LAY.DOOR/TM:B.x0+4.4;
    const loc=(nx,ny,x,y)=>{ const l=TB.back(x,y); for(let i=0;i<TB.q;i++){ const t=nx; nx=ny; ny=-t; } return [nx,ny,l[0],l[1]]; };
    const SEG=[[6,14.65,-6],[16.6,19.5,-7.95],[2.8,2.8+W-11.55,8.75]];
    const pic=(X_,z)=>{ const u=X_-B.x0; for(const [a,b,o] of SEG)if(u>=a+o&&u<b+o)return TH.THFRONT(u-o,z); return null; };
    const out=(nx,ny,Xw,Yw,z,f,cap)=>{ if(ny>0){ const c=pic(Xw,z); if(c)return c.e?c:sh(c,f); } const u=(nx?Yw:Xw)*24|0, r=z|0; if(r>B.h-8)return sh([200,192,170],f); return sh(r%8<1||(u+(r>>3&1)*8)%16<1?[120,52,44]:[156,66,54],f); };
    const cy=(B.y0+B.y1)/2, tz=(X(1)-X(0))/(Y(1)-Y(0)), S={y0:cy-LAY.SW/TM/2,y1:cy+LAY.SW/TM/2,x:B.x0+T,z0:Math.round(LAY.SY*ZM),m:.3}; S.z1=S.z0+(S.y1-S.y0)*tz*9/16;
    // the walls: pleated wine-red cloth over a dark dado with a brass line, following the steps; the screen wall black; the back wall dark round the projection port
    const inWall=(_,nx,ny,X_,Y_,z,f)=>{ if(nx>0)return sh([6,5,6],f); if(z>B.h-7)return sh([14,11,11],f);
      const m=((nx?Y_-B.y0:X_-B.x0)-.1)*TM, zr=z-(nx?LAY.floorH(LAY.D):LAY.floorH(m))*ZM;
      if(nx<0&&Math.abs(m-LAY.W/2)<1.6)return sh(z>4.3*ZM&&z<5.7*ZM?[5,4,4]:[20,14,14],f);
      if(zr<24)return sh([28,20,14],f); if(zr<27)return sh([118,92,42],f);
      const v=30+60*(.5+.5*Math.sin(m/.54*6.2832)), n=.9+.14*hs(Math.floor(m*26),Math.floor(z/3),71); return sh([v,v*.2,v*.24],f*n); };
    const floor=()=>[22,12,30];   // (under the carpet the furnishing lays)
    const dp=TB.pt(door,B.y1), dw=TB.side('f'), dpic=(ii,jj,Wd,Hd)=>{ const z=Hd-jj; return ii<2||ii>=Wd-2||z>Hd-2?[34,26,24]:Math.abs(z-Hd*.48)<1.3&&ii>Wd*.2&&ii<Wd*.8?[138,106,42]:[15,11,11]; };
    const D={w:dw,a:dw==='f'||dw==='b'?dp[0]:dp[1],...(OXT?{wd:1.2,h:60,pic:dpic}:{wd:1.56,h:94})}, floorW=(x,y)=>{ const l=TB.back(x,y); return floor(l[0],l[1]); }, inW=(_,nx,ny,x,y,z,f)=>{ const q=loc(nx,ny,x,y); return inWall(_,q[0],q[1],q[2],q[3],z,f); }, outW=(nx,ny,x,y,z,f,cap)=>{ const q=loc(nx,ny,x,y); return out(q[0],q[1],q[2],q[3],z,f,cap); };
    const R=room('theatre','MOVIE THEATRE',BW,{floor:floorW,in:inW,out:outW,cope:[200,192,170]},D,(B_,l0)=>{
      const n0=PROPS.length;
      if(!OXT)for(const [a,b,o] of SEG){ TH.thAt(B.x1-o,B.y0); TH.thFront(p=>{ const u0=Math.max(p[0],a), u1=Math.min(p[1],b); return u1-u0>.01?[u0,u1,...p.slice(2)]:null; }); }
      turn(B,n0,l0);
      // the screen: white in a black masking
      const BK=[8,7,8], WH=[206,204,196], fr={c:BK,top:()=>BK,fi:()=>BK,fj:()=>BK}, sx=S.x+.06;
      SHARED.PNAME='movie screen'; prop([{x0:S.x,y0:S.y0,x1:sx,y1:S.y1,z0:S.z0,z1:S.z1,c:WH,top:()=>BK,fj:()=>BK,fi:()=>WH},
        {x0:S.x,y0:S.y0-S.m,x1:sx+.08,y1:S.y1+S.m,z0:S.z1,z1:S.z1+8,...fr},{x0:S.x,y0:S.y0-S.m,x1:sx+.08,y1:S.y1+S.m,z0:S.z0-8,z1:S.z0,...fr},{x0:S.x,y0:S.y0-S.m,x1:sx+.08,y1:S.y0,z0:S.z0,z1:S.z1,...fr},{x0:S.x,y0:S.y1,x1:sx+.08,y1:S.y1+S.m,z0:S.z0,z1:S.z1,...fr}],null,{high:true});
      STORE.turnIn(TB,n0,l0);
    },OXT?{noOut:true}:{holes:(()=>{ const a=TB.pt(door-3.71,B.y1), b=TB.pt(door-1.69,B.y1), k=dw==='f'||dw==='b'?0:1; return {[dw]:[{a0:Math.min(a[k],b[k]),a1:Math.max(a[k],b[k]),z0:36,z1:92,open:true}]}; })()});
    { const I=STORE.inside.theatre; if(I&&!I.done){ const g0=I.go; I.go=()=>{ g0(); if(STORE.furnish&&STORE.furnish.theatre)STORE.furnish.theatre(B,TB); }; } }   // furnished on the way in, dropped with the inside
    const tx=new THREE.DataTexture(new Uint8Array(TH.FILMW*TH.FILMH*4),TH.FILMW,TH.FILMH); tx.magFilter=tx.minFilter=THREE.NearestFilter; tx.colorSpace=THREE.SRGBColorSpace;
    const fm=new THREE.Mesh(new THREE.PlaneGeometry(Math.abs(Z(S.y1)-Z(S.y0)),Y(S.z1)-Y(S.z0)),new THREE.MeshBasicMaterial({map:tx})); const fp=TB.pt(S.x+.075,cy); fm.rotation.y=Math.PI/2+TB.hd(0); fm.position.set(X(fp[0]),Y((S.z0+S.z1)/2),Z(fp[1])); fm.visible=false; scene.add(fm); fm.updateMatrixWorld();
    if(OXT){ const T0=TURN(BW0,WP.theatre.face), L0=T0.L, cl=(L0.x0+L0.x1)/2, ex=CINEMA.EXT||0; STORE.streetDoor.theatre={door:T0.pt(cl,L0.y1+ex+.35),out:[...T0.pt(cl,L0.y1+ex+1.4),T0.hd(0)]}; K.sol(BW0.x0,BW0.y0,BW0.x1,BW0.y1,300); }   // the inside off the map, its door on the lot (owner, 7 Nov 2026), out past the stepped-out front
    const ex=OXT?TB.pt(door,B.y0+.5):null;   // the other exit, across the room from the way in
    unplace('MOVIE THEATRE'); MS.theatre={R,fm,tx,k:-1,exits:ex?[[X(ex[0]),Z(ex[1])]]:[],S:{x:X(S.x),y0:Z(S.y0),y1:Z(S.y1)},TB}; }); }

  // the playhouse lot is solid from the start; only its painting waits for its step (the soak found a pawn sealed in when the step landed)
  if(!AWAY.has('playhouse')){ { const LW=lot('play',190), TP=TURN(LW,WP.play.face); if(TP.q){ const a=X(LW.x0), b=X(LW.x1), c=Z(LW.y0), d=Z(LW.y1); SOL.up.push([Math.min(a,b),Math.min(c,d),Math.max(a,b),Math.max(c,d)]); FIX.up.push([Math.min(a,b),Math.min(c,d),0,Math.max(a,b),Math.max(c,d),Y(TP.L.h)]); } }
  STEPS.push(()=>{ '@later'; const LW=lot('play',190), TP=TURN(LW,WP.play.face), P=PY.PLAYK({...TP.L,h:LW.h}), br=[118,50,44], fc=(nx,ny,u,z,f)=>facade(nx,ny,u,u,z,f,LW.h,br);
    if(!WP.play.pf)BLOCKS.make({...LW,z0:0,z1:LW.h,kind:'Rplayhouse',turn:TP,roof:()=>[58,57,57],paint:(sd,u,z,f)=>sd==='f'?(P.playFront(u,z,f)||fc(0,1,u,z,f)):fc(sd==='w'||sd==='e'?1:0,sd==='f'||sd==='b'?1:0,u,z,f)});
    unplace('PLAYHOUSE'); }); }


  STEPS.push(()=>{ '@later';
    const film=now=>{ const M=MS.theatre; if(!M)return; if(CINEMA.on){ M.fm.visible=false; return; } const near=SHARED.LVL==='up'&&(M.R.inside(pos.x,pos.z)||Math.hypot(pos.x-M.R.at.x,pos.z-M.R.at.z)<6*TILE); M.fm.visible=near; if(!near)return;
      if(M.reel)return; const k=Math.floor(now/125)%TH.FILMN; if(k===M.k)return; M.k=k; const f=TH.filmFrame(k), d=M.tx.image.data, W=TH.FILMW, Hh=TH.FILMH;
      for(let j=0;j<Hh;j++)for(let i=0;i<W;i++){ const s=(j*W+i)*3, o=((Hh-1-j)*W+i)*4; d[o]=f[s]; d[o+1]=f[s+1]; d[o+2]=f[s+2]; d[o+3]=255; } M.tx.needsUpdate=true; };
    const lane=()=>{ if(MS.laned||!BLK.lane||!STORE.meshes)return; const ms=new Set(); for(const id of ['theatre','arcade','playhouse'])for(const w of ['f','b','w','e','lobby'])for(const me of BATCH.all(STORE.meshes,'W'+id+':'+w))ms.add(me); if(!ms.size)return; MS.laned=1;
      for(const w of cutWalls){ if(!ms.has(w.me))continue; const wh=w.when, al=Object.getOwnPropertyDescriptor(w,'always'), was=al?(al.get?()=>al.get.call(w):()=>al.value):()=>false;
        w.when=()=>BLK.lane()||(wh?wh():true); Object.defineProperty(w,'always',{get:()=>BLK.lane()||was(),configurable:true}); } };
    let t0=performance.now(); SYS.add('places',(dt)=>{ const now=performance.now(), d=Math.min(.25,(now-t0)/1000); t0=now; lane(); film(now); },'059-street');
    window.MAINDBG=()=>({rooms:STORE.rooms.filter(r=>['theatre','arcade','playhouse','holodeck'].includes(r.id)).map(r=>[r.id,+r.x0.toFixed(1),+r.z0.toFixed(1),+r.x1.toFixed(1),+r.z1.toFixed(1)]),laned:!!MS.laned,tris:(()=>{ const C={}; for(const o of OBJS){ const m=/^store:(theatre|arcade|playhouse|holodeck)/.exec(o.id||''); if(m)C[m[1]]=(C[m[1]]||0)+o.parts.length*2; }
      for(const k in STORE.meshes){ const m=/^[WR](theatre|arcade|playhouse|holodeck)/.exec(k)||/^P(set)/.exec(k); if(m)C[m[1]]=(C[m[1]]||0)+STORE.meshes[k].geometry.attributes.position.count/3; } return C; })(),lamps:MS.lamps}); });
});
