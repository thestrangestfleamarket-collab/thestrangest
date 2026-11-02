// MAIN STREET: the lots along Main Street (the theatre, the arcade, the playhouse and the rest; its own builder).
import {SHARED, THREE} from './003-shx.js';
import {BLK, CINEMA, pos} from './003b-systems.js';
import {scene} from './004-main.js';
import {BLDK, BLOCK, cutWalls, FIX, grab, SOL, STORE, SYS, TILE, TURN, WP} from './006-map-pre.js';
import {BATCH, OBJS} from './008-batch.js';
import {BLOCKS} from './038zb-blocks.js';
await grab('mainstreet',async()=>{ const K=STORE.kit, {room,STEPS}=K, {X,Y,Z,placeAt,facade,gbox}=SHARED.BOD, sh=SHARED.BOD.K.sh, SK=SHARED.BOD.STOREK, {PROPS,LAMPS}=SK, T=SK.T, TH=SK.theatre, PY=SK.play, hs=SHARED.BOD.g.hash;
  const bx=m=>SHARED.BOD.OX+(m-SHARED.BOD.OX)/BLDK, by=m=>SHARED.BOD.OY+(m-SHARED.BOD.OY)/BLDK, lot=(k,h)=>{ const p=WP[k]; return p&&p.y1!=null?{x0:bx(p.x0)+.1,x1:bx(p.x1)-.1,y0:by(p.y0)+.1,y1:by(p.y1),h}:{x0:bx(BLOCK.lots[k][0])+.1,x1:bx(BLOCK.lots[k][1])-.1,y0:by(BLOCK.back)+.1,y1:SHARED.BOD.OY,h}; };
  const turn=(B,n0,l0)=>{ const cx=(B.x0+B.x1)/2, cy=(B.y0+B.y1)/2; for(const p of PROPS.slice(n0))placeAt(p,2,cx,cy,cx,cy); for(const l of LAMPS.slice(l0)){ l.x=2*cx-l.x; l.y=2*cy-l.y; } };
  const lit=c=>Object.assign(c.slice(),{e:1}), FONT={...TH.THFONT,D:'####.#...##...##...##...##...#####.',L:'#....#....#....#....#....#....#####'};
  const word=(s,c0,z0,k)=>(c,z)=>{ const i=Math.floor((c-c0)/k), r=6-Math.floor((z-z0)/k); if(c<c0||z<z0||i>=s.length*6-1||r<0||r>6)return false; const q=i%6, g=FONT[s[Math.floor(i/6)]]; return q<5&&!!g&&g[r*5+q]==='#'; };
  const neon=(on,c,z,k,col,f)=>{ if(on(c,z))return lit(col); for(const [a,b] of [[-k,0],[k,0],[0,-k],[0,k]])if(on(c+a,z+b))return sh(col,.42*f); return null; };
  const unplace=n=>{ const i=STORE.places.findIndex(p=>p[0]===n); if(i>=0)STORE.places.splice(i,1); }, door=(k,f)=>{ const T=TURN(lot(k),WP[k].face), L=T.L, u=L.x0+f(L), a=T.pt(u,L.y1+2.2/BLDK), b=T.pt(u,L.y1); return [X(a[0]),Z(a[1]),X(b[0]),Z(b[1]),T.hd(0)]; };
  const MS=STORE.main={lot,word,neon,unplace,doors:[['THE MOVIE THEATRE',...door('theatre',()=>4.4)],['THE ARCADE',...door('arcade',L=>(L.x1-L.x0)/2)],['THE PLAYHOUSE',...door('play',L=>(L.x1-L.x0)/2)]]};

  STORE.open=Object.assign(STORE.open||{},{theatre:['f','b','e','lobby']});   // in the theatre only its screen wall stays
  STEPS.push(()=>{ const B=lot('theatre',300), W=B.x1-B.x0, cx=(B.x0+B.x1)/2, door=B.x0+4.4, prop=SK.prop, sided=SK.sided;
    const SEG=[[6,14.65,-6],[16.6,19.5,-7.95],[2.8,2.8+W-11.55,8.75]];
    const pic=(X_,z)=>{ const u=X_-B.x0; for(const [a,b,o] of SEG)if(u>=a+o&&u<b+o)return TH.THFRONT(u-o,z); return null; };
    const out=(nx,ny,Xw,Yw,z,f,cap)=>{ if(ny>0){ const c=pic(Xw,z); if(c)return c.e?c:sh(c,f); } const u=(nx?Yw:Xw)*24|0, r=z|0; if(r>B.h-8)return sh([200,192,170],f); return sh(r%8<1||(u+(r>>3&1)*8)%16<1?[120,52,44]:[156,66,54],f); };
    const cy=(B.y0+B.y1)/2, tz=(X(1)-X(0))/(Y(1)-Y(0)), S={y0:cy-6,y1:cy+6,x:B.x0+T,z0:30,m:.4}; S.z1=S.z0+(S.y1-S.y0)*tz*9/16;
    const FX=B.x0+5.35, P=1.45, RISE=19, NR=Math.min(4,Math.floor((B.x1-T-FX-1.2)/P)), HT=NR*RISE, TX=FX+NR*P, by=cy;
    const BN=[B.y0+1.2,cy-.55], BS_=[cy+.55,B.y1-1.75], AIS=[[cy-.55,cy+.55]], EXN=(B.y0+T+B.y0+1.2)/2, EXS=(B.y1-1.75+B.y1-T)/2, PIL=[1.6,4.6,7.6,10.4].map(d=>B.x0+d), DL=[], LZ=150;
    for(let y=B.y0+1;y<B.y1-.6;y+=1.6)DL.push(y);
    const wash=(u,z,L,top,w0)=>{ let g=0; for(const p of L){ const dz=Math.abs(z-top), w=w0+dz*.004; g=Math.max(g,Math.max(0,1-Math.abs(u-p)/w)*Math.exp(-dz/85)); } return g; };
    const glow=(c,g,to)=>lit([c[0]+(to[0]-c[0])*g|0,c[1]+(to[1]-c[1])*g|0,c[2]+(to[2]-c[2])*g|0]);
    const inWall=(_,nx,ny,X_,Y_,z,f)=>{ const u=nx?Y_:X_, n=.95+.1*hs(Math.floor(u*24),Math.floor(z/2),71);
      if(z<6)return sh([14,13,15],f); if(z>284)return sh([17,16,19],f);
      if(nx>0)return z<S.z1+20&&Y_>S.y0-.6&&Y_<S.y1+.6?sh([14,13,16],f*n*(.9+.1*Math.sin(u*38))):sh([44,43,48],f*n*((u*1.25)%1<.035||z%40<1?.65:1));
      if(ny>0){ const g=wash(X_,z,PIL,LZ,.2), s=(X_*8)%1, b=sh(s<.13?[34,18,16]:Math.floor(X_*8)&1?[92,48,38]:[80,41,33],f*n); return g>.05?glow(b,g*.85,[255,190,128]):b; }
      if(nx<0){ const b=sh(((Y_*.9)%1<.03||z%46<1)?[36,35,40]:[52,51,57],f*n); if(z>HT+100){ const g=wash(Y_,z,DL,262,.08)*(z<262?1:.2); return g>.05?glow(b,g*.9,[255,226,180]):b; } return b; }
      return sh([40,39,44],f*n*((u*1.6)%1<.03?.7:1)); };
    const floor=(x,y)=>{ const n=hs(Math.floor(x*24),Math.floor(y*24),73); return n<.05?[70,68,74]:n>.97?[48,47,52]:[60,59,64]; };
    const R=room('theatre','MOVIE THEATRE',B,{floor,in:inWall,out,cope:[200,192,170]},{w:'f',a:door,wd:1.56,h:94},(B_,l0)=>{
      const n0=PROPS.length;
      for(const [a,b,o] of SEG){ TH.thAt(B.x1-o,B.y0); TH.thFront(p=>{ const u0=Math.max(p[0],a), u1=Math.min(p[1],b); return u1-u0>.01?[u0,u1,...p.slice(2)]:null; }); }
      turn(B,n0,l0);
      const Bk=[10,9,11], bk={c:Bk,top:()=>Bk,fi:()=>Bk,fj:()=>Bk}, sx=S.x+.06;
      SHARED.PNAME='movie screen wall'; prop([{x0:S.x,y0:S.y0,x1:sx,y1:S.y1,z0:S.z0,z1:S.z1,c:[150,150,154],top:()=>Bk,fj:()=>Bk,fi:()=>[150,150,154]},
        {x0:S.x,y0:S.y0-S.m,x1:sx,y1:S.y1+S.m,z0:S.z1,z1:S.z1+10,...bk},{x0:S.x,y0:S.y0-S.m,x1:sx,y1:S.y1+S.m,z0:S.z0-8,z1:S.z0,...bk},{x0:S.x,y0:S.y0-S.m,x1:sx,y1:S.y0,z0:S.z0,z1:S.z1,...bk},{x0:S.x,y0:S.y1,x1:sx,y1:S.y1+S.m,z0:S.z0,z1:S.z1,...bk}],null,{high:true});
      SHARED.PNAME='stage'; prop([sided({x0:B.x0+T,y0:S.y0-.3,x1:B.x0+T+.55,y1:S.y1+.3,z0:0,z1:9,foot:1,c:[22,21,24],top:()=>[26,25,28],fs:(nx,ny,x,y,z,k)=>nx>0&&z>5&&z<8?lit([160,22,32]):sh([26,25,28],k)})],null,{walk:true});
      const DK=[36,35,40], SH=[62,60,66], RD=[176,30,42];
      // a big padded recliner: a deep seat, a tall rounded back, a padded arm each side, the footrest out in front
      const LT=[150,26,36], LTD=[92,16,24];
      const seat=(a,w,xf,dz)=>{ SHARED.PNAME='recliner'; const xb=xf+1.25, pad=(o,c,f)=>({...o,c,top:(u,v)=>sh(c,f?f(u,v):1),fi:()=>sh(c,.62),fj:()=>sh(c,.8)});
        const arm=y=>pad({x0:xf+.15,y0:y,x1:xb,y1:y+.2,z0:dz,z1:dz+19},LT,u=>u<xf+.3?1.15:1);
        return prop([{x0:xf+.25,y0:a+.08,x1:xb-.05,y1:a+w-.08,z0:dz,z1:dz+6,c:DK,top:()=>DK,fi:()=>DK,fj:()=>DK},
          pad({x0:xf+.1,y0:a+.22,x1:xb-.25,y1:a+w-.22,z0:dz+6,z1:dz+14},LT,u=>1.18-.3*(u-xf)/1.1),
          pad({x0:xf-.32,y0:a+.28,x1:xf+.12,y1:a+w-.28,z0:dz+3,z1:dz+10},LT,()=>1.05),
          sided({x0:xb-.42,y0:a+.2,x1:xb,y1:a+w-.2,z0:dz+10,z1:dz+48,c:LT,top:()=>sh(LT,.95),fs:(nx,ny,x,y,z,k)=>nx<0?sh(z>44?LTD:LT,k*(.74+.26*Math.min(1,z/36))*(Math.abs((z-dz)%9-4.5)<.6?.82:1)):nx>0?sh(LTD,k):sh(LT,k*.8)}),
          arm(a),arm(a+w-.2)],null,{walk:true}); };
      const tier=(x0,x1,y0,y1,h,nm='seating tier')=>{ SHARED.PNAME=nm; return prop([sided({x0,y0,x1,y1,z0:0,z1:h,foot:1,c:[50,48,55],top:(x,y)=>hs(Math.floor(x*24),Math.floor(y*24),77)<.07?[62,58,66]:[50,48,55],
        fs:(nx,ny,x,y,z,k)=>nx<0?(z>h-2.6?lit([160,22,32]):sh([40,38,44],k)):nx>0?sh([40,38,44],k):sh([54,52,58],k)})],null,{walk:true}); };
      for(let i=0;i<NR;i++){ const h=(i+1)*RISE, xf=FX+i*P, xb=xf+P;
        for(const [a,b] of [BN,BS_]){ tier(xf,xb,a,b,h); const n=2, w=(b-a)/n; for(let s=0;s<n;s++)seat(a+s*w,w,xb-1.32,h); }
        for(const [a,b] of AIS){ const xm=(xf+xb)/2; tier(xf,xm,a,b,h-RISE/2,'aisle steps'); tier(xm,xb,a,b,h,'aisle steps'); } }
      tier(TX,B.x1-T,BN[0],BS_[1],HT,'landing steps');
      for(const [a,b] of [BN,BS_])K.sol(FX,a,TX,b,HT+44);
      SHARED.PNAME='rail'; const rail=(x0,x1,y0,y1,h)=>prop([sided({x0,y0,x1,y1,z0:0,z1:h+30,foot:1,c:[30,29,33],top:()=>[150,140,120],fs:(nx,ny,x,y,z,k)=>z>h+27?sh([150,140,120],k):z>h?sh([40,44,50],k*.9):sh([34,33,38],k)})],null,{walk:true});
      for(let i=0;i<=NR;i++){ const x0=FX+i*P, x1=i<NR?x0+P:B.x1-T, h=Math.min(i+1,NR)*RISE; rail(x0,x1,BN[0]-.06,BN[0],h); rail(x0,x1,BS_[1],BS_[1]+.06,h); }
      K.sol(FX,BN[0]-.08,B.x1-T,BN[0],HT+30); K.sol(FX,BS_[1],B.x1-T,BS_[1]+.08,HT+30);
      SHARED.PNAME='exit door'; for(const ey of [EXN,EXS])prop([{x0:B.x1-T-.05,y0:ey-.45,x1:B.x1-T,y1:ey+.45,z0:0,z1:94,foot:1,c:[40,38,42],top:()=>[40,38,42],fi:(y,z)=>Math.abs(y-ey)>.4||z>90?[20,19,22]:z>40&&z<46?[150,150,156]:[44,42,48],fj:()=>[30,29,33]},
        {x0:B.x1-T-.07,y0:ey-.3,x1:B.x1-T,y1:ey+.3,z0:100,z1:110,em:1,c:[200,30,30],top:()=>[60,8,8],fi:(y,z)=>z>101.5&&z<108.5&&Math.abs(y-ey)<.25&&Math.floor((y-ey)*24+40)%4?[255,70,60]:[70,10,10],fj:()=>[60,8,8]}],null,{high:true});
      for(const ey of [EXN,EXS])LAMPS.push({x:B.x1-.6,y:ey,z:105,r:2.2,c:[.55,.08,.06]});
      SHARED.PNAME='wall light'; for(const x of PIL){ const y=B.y0+T;
        prop([{x0:x-.26,y0:y,x1:x+.26,y1:y+.16,z0:0,z1:284,foot:1,c:[60,23,27],top:()=>[48,19,23],fj:(xx,z)=>sh([60,23,27],Math.abs(xx-x)>.21?.62:.84),fi:()=>sh([50,19,23],.7)},
          {x0:x-.12,y0:y+.16,x1:x+.12,y1:y+.3,z0:LZ-7,z1:LZ+7,c:[24,22,24],top:()=>lit([255,214,160]),fj:(xx,z)=>z>LZ+5||z<LZ-5?lit([255,200,140]):[26,24,26],fi:()=>[26,24,26]}],null,{high:true});
        LAMPS.push({x,y:y+.5,z:LZ,r:4.5,c:[.62,.38,.22]}); }
      SHARED.PNAME='downlight'; for(const y of DL){ prop([{x0:B.x1-T-.1,y0:y-.07,x1:B.x1-T,y1:y+.07,z0:262,z1:268,em:1,c:[255,236,200],top:()=>[255,236,200],fi:()=>[255,236,200],fj:()=>[255,236,200]}],null,{high:true}); }
      for(const y of [B.y0+2,cy,B.y1-2])LAMPS.push({x:B.x1-1.4,y,z:262,r:6,c:[.34,.3,.28]});
      LAMPS.push({x:B.x0+3,y:cy,z:250,r:6,c:[.3,.3,.36]});
    },{holes:{f:[{a0:door-3.71,a1:door-1.69,z0:36,z1:92,open:true}]}});
    const tx=new THREE.DataTexture(new Uint8Array(TH.FILMW*TH.FILMH*4),TH.FILMW,TH.FILMH); tx.magFilter=tx.minFilter=THREE.NearestFilter; tx.colorSpace=THREE.SRGBColorSpace;
    const fm=new THREE.Mesh(new THREE.PlaneGeometry(Math.abs(Z(S.y1)-Z(S.y0)),Y(S.z1)-Y(S.z0)),new THREE.MeshBasicMaterial({map:tx})); fm.rotation.y=Math.PI/2; fm.position.set(X(S.x+.075),Y((S.z0+S.z1)/2),Z(cy)); fm.visible=false; scene.add(fm); fm.updateMatrixWorld();
    const ix=x=>x/(TILE*BLDK)+SHARED.BOD.OX, iy=z=>z/(TILE*BLDK)+SHARED.BOD.OY;
    const gr=(wx,wz)=>{ const x=ix(wx), y=iy(wz); if(x<FX||x>B.x1||y<BN[0]||y>BS_[1])return null; const i=Math.floor((x-FX)/P); if(i>=NR)return Y(HT); const h=(i+1)*RISE; return Y(AIS.some(([a,b])=>y>=a&&y<=b)&&x-FX-i*P<P/2?h-RISE/2:h); };
    const sg0=STORE.stackGround; STORE.stackGround=(x,z)=>{ const I=STORE.inside.theatre; if(SHARED.LVL==='up'&&I&&I.done&&R.inside(x,z)){ const g=gr(x,z); if(g!=null)return g; } return sg0?sg0(x,z):null; };
    unplace('MOVIE THEATRE'); MS.theatre={R,fm,tx,k:-1,exits:[EXN,EXS].map(ey=>[X(B.x1-T-.1),Z(ey)]),S:{x:X(S.x),y0:Z(S.y0),y1:Z(S.y1)}}; });

  // the playhouse lot is solid from the start; only its painting waits for its step (the soak found a pawn sealed in when the step landed)
  { const LW=lot('play',190), TP=TURN(LW,WP.play.face); if(TP.q){ const a=X(LW.x0), b=X(LW.x1), c=Z(LW.y0), d=Z(LW.y1); SOL.up.push([Math.min(a,b),Math.min(c,d),Math.max(a,b),Math.max(c,d)]); FIX.up.push([Math.min(a,b),Math.min(c,d),0,Math.max(a,b),Math.max(c,d),Y(TP.L.h)]); } }
  STEPS.push(()=>{ const LW=lot('play',190), TP=TURN(LW,WP.play.face), P=PY.PLAYK({...TP.L,h:LW.h}), br=[118,50,44], fc=(nx,ny,u,z,f)=>facade(nx,ny,u,u,z,f,LW.h,br);
    BLOCKS.make({...LW,z0:0,z1:LW.h,kind:'Rplayhouse',turn:TP,roof:()=>[58,57,57],paint:(sd,u,z,f)=>sd==='f'?(P.playFront(u,z,f)||fc(0,1,u,z,f)):fc(sd==='w'||sd==='e'?1:0,sd==='f'||sd==='b'?1:0,u,z,f)});
    unplace('PLAYHOUSE'); });


  STEPS.push(()=>{
    const film=now=>{ const M=MS.theatre; if(!M)return; if(CINEMA.on){ M.fm.visible=false; return; } const near=SHARED.LVL==='up'&&(M.R.inside(pos.x,pos.z)||Math.hypot(pos.x-M.R.at.x,pos.z-M.R.at.z)<6*TILE); M.fm.visible=near; if(!near)return;
      const k=Math.floor(now/125)%TH.FILMN; if(k===M.k)return; M.k=k; const f=TH.filmFrame(k), d=M.tx.image.data, W=TH.FILMW, Hh=TH.FILMH;
      for(let j=0;j<Hh;j++)for(let i=0;i<W;i++){ const s=(j*W+i)*3, o=((Hh-1-j)*W+i)*4; d[o]=f[s]; d[o+1]=f[s+1]; d[o+2]=f[s+2]; d[o+3]=255; } M.tx.needsUpdate=true; };
    const lane=()=>{ if(MS.laned||!BLK.lane||!STORE.meshes)return; const ms=new Set(); for(const id of ['theatre','arcade','playhouse'])for(const w of ['f','b','w','e','lobby'])for(const me of BATCH.all(STORE.meshes,'W'+id+':'+w))ms.add(me); if(!ms.size)return; MS.laned=1;
      for(const w of cutWalls){ if(!ms.has(w.me))continue; const wh=w.when, al=Object.getOwnPropertyDescriptor(w,'always'), was=al?(al.get?()=>al.get.call(w):()=>al.value):()=>false;
        w.when=()=>BLK.lane()||(wh?wh():true); Object.defineProperty(w,'always',{get:()=>BLK.lane()||was(),configurable:true}); } };
    let t0=performance.now(); SYS.add('places',(dt)=>{ const now=performance.now(), d=Math.min(.25,(now-t0)/1000); t0=now; lane(); film(now); },'059-street');
    window.MAINDBG=()=>({rooms:STORE.rooms.filter(r=>['theatre','arcade','playhouse','holodeck'].includes(r.id)).map(r=>[r.id,+r.x0.toFixed(1),+r.z0.toFixed(1),+r.x1.toFixed(1),+r.z1.toFixed(1)]),laned:!!MS.laned,tris:(()=>{ const C={}; for(const o of OBJS){ const m=/^store:(theatre|arcade|playhouse|holodeck)/.exec(o.id||''); if(m)C[m[1]]=(C[m[1]]||0)+o.parts.length*2; }
      for(const k in STORE.meshes){ const m=/^[WR](theatre|arcade|playhouse|holodeck)/.exec(k)||/^P(set)/.exec(k); if(m)C[m[1]]=(C[m[1]]||0)+STORE.meshes[k].geometry.attributes.position.count/3; } return C; })(),lamps:MS.lamps}); });
});
