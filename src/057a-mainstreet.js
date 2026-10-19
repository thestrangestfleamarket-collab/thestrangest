{ const K=STORE.kit, {room,STEPS}=K, {X,Y,Z,placeAt,facade,gbox}=BOD, sh=BOD.K.sh, SK=BOD.STOREK, {PROPS,LAMPS}=SK, T=SK.T, TH=SK.theatre, HO=SK.holo, PY=SK.play, hs=BOD.g.hash;
  const bx=m=>BOD.OX+(m-BOD.OX)/BLDK, by=m=>BOD.OY+(m-BOD.OY)/BLDK, lot=(k,h)=>({x0:bx(BLOCK.lots[k][0])+.1,x1:bx(BLOCK.lots[k][1])-.1,y0:by(BLOCK.back)+.1,y1:BOD.OY,h});
  const turn=(B,n0,l0)=>{ const cx=(B.x0+B.x1)/2, cy=(B.y0+B.y1)/2; for(const p of PROPS.slice(n0))placeAt(p,2,cx,cy,cx,cy); for(const l of LAMPS.slice(l0)){ l.x=2*cx-l.x; l.y=2*cy-l.y; } };
  const lit=c=>Object.assign(c.slice(),{e:1}), FONT={...TH.THFONT,D:'####.#...##...##...##...##...#####.',L:'#....#....#....#....#....#....#####'};
  const word=(s,c0,z0,k)=>(c,z)=>{ const i=Math.floor((c-c0)/k), r=6-Math.floor((z-z0)/k); if(c<c0||z<z0||i>=s.length*6-1||r<0||r>6)return false; const q=i%6, g=FONT[s[Math.floor(i/6)]]; return q<5&&!!g&&g[r*5+q]==='#'; };
  const neon=(on,c,z,k,col,f)=>{ if(on(c,z))return lit(col); for(const [a,b] of [[-k,0],[k,0],[0,-k],[0,k]])if(on(c+a,z+b))return sh(col,.42*f); return null; };
  const unplace=n=>{ const i=STORE.places.findIndex(p=>p[0]===n); if(i>=0)STORE.places.splice(i,1); }, door=(k,f)=>{ const L=lot(k); return [X(L.x0+f(L)),Z(L.y1)+2.2*TILE]; };
  const MS=STORE.main={doors:[['THE MOVIE THEATRE',...door('theatre',()=>4.4)],['THE ARCADE',...door('arcade',L=>(L.x1-L.x0)/2)],['THE PLAYHOUSE',...door('play',L=>(L.x1-L.x0)/2)],['THE HOLODECK',...door('holo',L=>(L.x1-L.x0)/2)]]};

  STEPS.push(()=>{ const B=lot('theatre',230), W=B.x1-B.x0, cx=(B.x0+B.x1)/2, LOB=B.y1-4.6, door=B.x0+4.4;
    const SEG=[[6,14.65,-6],[16.6,19.5,-7.95],[2.8,2.8+W-11.55,8.75]];
    const pic=(X_,z)=>{ const u=X_-B.x0; for(const [a,b,o] of SEG)if(u>=a+o&&u<b+o)return TH.THFRONT(u-o,z); return null; };
    const out=(nx,ny,Xw,Yw,z,f,cap)=>{ if(ny>0){ const c=pic(Xw,z); if(c)return c.e?c:sh(c,f); } return facade(nx,ny,Xw,Yw,z,f,cap,[96,58,80]); };
    const S={x0:B.x0+2.2,x1:B.x1-2.2,y:B.y1-T,z0:60,z1:172,m:12};
    const R=room('theatre','MOVIE THEATRE',B,{floor:TH.theatreCarpet,in:(q,nx,ny,X_,Y_,z,f)=>TH.theatreWall(nx?Y_:X_,z,f),out,cope:[200,192,170]},{w:'f',a:door,wd:1.56,h:94},(B_,l0)=>{
      const n0=PROPS.length, oL=B.y0+4.6, odx=2*cx-door, w=.85, rx0=cx-2*w, rows=[3.6,5.3,7].map(d=>B.y1-d);
      TH.theatreScreen(S); TH.theatreDrape(B.x0+T,S.x0-S.m/24,S); TH.theatreDrape(S.x1+S.m/24,B.x1-T,S); TH.theatreValance(S);
      for(const y of rows)for(let i=0;i<4;i++)TH.theatreSeat(rx0+i*w,y,w,i===3);
      for(const [x,n] of [[B.x0+T,[1,0]],[B.x1-T,[-1,0]]])for(const y of [2.4,6].map(d=>B.y1-d)){ SK.bar.theatreSconce(x,y,n); LAMPS.push({x:x+n[0]*.35,y,z:68,r:3.4,c:[1,.62,.34]}); }
      LAMPS.push({x:cx,y:S.y-2.5,z:110,r:8,c:[.62,.66,.78]},{x:cx,y:B.y0+2.3,z:100,r:5,c:[1,.86,.6]});
      TH.theatreAisleLights([rx0-.35,rx0+4*w+.35],rows.map(y=>y-.45)); TH.theatreExit(odx,oL+.1); TH.theatrePort(odx,oL+.1,190);
      for(const [a,b,o] of SEG){ TH.thAt(B.x1-o,B.y0); TH.thFront(p=>{ const u0=Math.max(p[0],a), u1=Math.min(p[1],b); return u1-u0>.01?[u0,u1,...p.slice(2)]:null; },a<17&&b>17); }
      LAMPS.push(...[[7.2,66,5,[1.1,.88,.58]],[13.8,66,5,[1.1,.88,.58]],[10.47,250,3.2,[1,.76,.36]]].map(([u,z,r,c])=>({x:B.x1+6-u,y:B.y0-.9,z,r,c})));
      turn(B,n0,l0); },{xw:[['lobby','x',LOB,B.x0+T,B.x1-T,-1,[{a0:door-.8,a1:door+.8,z0:0,z1:96}],true]]});
    const tx=new THREE.DataTexture(new Uint8Array(TH.FILMW*TH.FILMH*4),TH.FILMW,TH.FILMH); tx.magFilter=tx.minFilter=THREE.NearestFilter; tx.colorSpace=THREE.SRGBColorSpace;
    const fm=new THREE.Mesh(new THREE.PlaneGeometry(X(S.x1)-X(S.x0),Y(S.z1)-Y(S.z0)),new THREE.MeshBasicMaterial({map:tx})); fm.position.set(X(cx),Y((S.z0+S.z1)/2),Z(B.y0+T+.075)); fm.visible=false; scene.add(fm);
    unplace('MOVIE THEATRE'); MS.theatre={R,fm,tx,k:-1}; });

  STEPS.push(()=>{ const B=lot('arcade',200), W=B.x1-B.x0, cx=(B.x0+B.x1)/2, A=TH.ARC, k=6, c0=Math.floor((W*24-35*k)/2), on=word('ARCADE',c0,118,k);
    const front=(u,z,f)=>{ const c=Math.floor(u*24);
      if(z<8)return sh([44,34,52],f);
      if(z<96&&u>.5&&u<W-.5){ const m=(u-.5)%2.1; if(m<.08||z<11||z>93)return sh([58,40,70],f); const q=Math.floor(u*1.25), e=u*1.25-q, r=hs(q,7,977);
        if(r<.45&&e>.25&&e<.75&&z>46&&z<62)return lit([[236,70,160],[60,206,230],[110,220,80]][Math.floor(r*13)%3]); if(z>=11&&z<13)return lit([120,40,110]); return ((c+Math.floor(z))%64)<3?sh([44,40,66],f):sh([20,16,32],f); }
      if(z>=98&&z<102)return lit([236,64,160]); if(z>=104&&z<106)return lit([60,206,230]);
      if(z>=110&&z<170&&c>=c0-8&&c<c0+35*k+8)return neon(on,c,z,k,[255,80,200],f)||sh([24,16,32],f);
      return null; };
    const out=(nx,ny,Xw,Yw,z,f,cap)=>{ if(ny>0){ const c=front(Xw-B.x0,z,f); if(c)return c; } return facade(nx,ny,Xw,Yw,z,f,cap,[96,58,80]); };
    MS.arcade={R:room('arcade','ARCADE',B,{floor:TH.arcadeFloor,in:TH.arcadeWallOf(TH.arcadeLights(B)),out,cope:[60,44,70]},{w:'f',a:cx,wd:1.56,h:94},()=>{
      A.arcade(B.x0+1.6,B.y0+.85,[0,1],0); A.arcade(B.x0+3.5,B.y0+.85,[0,1],1); TH.grProp('arcade machine',TH.GRM.arcade(),B.x0+4.9,B.y0+.2,0,{}); TH.vrStation(B.x1-2,B.y0+.6);
      A.redStool(B.x0+1.6,B.y0+2.3); A.redStool(B.x0+3.5,B.y0+2.3);
      LAMPS.push({x:cx,y:B.y0+4,z:120,r:10,c:[1.05,.88,1.2]},{x:cx,y:B.y1-4,z:120,r:10,c:[1.05,.88,1.2]},{x:cx,y:B.y1+1,z:140,r:5,c:[1,.3,.75]}); })}; unplace('ARCADE'); });

  STEPS.push(()=>{ const B=lot('play',130), cx=(B.x0+B.x1)/2, cy=(B.y0+B.y1)/2, P=PY.PLAYK(B), mx=x=>2*cx-x, my=y=>2*cy-y, L=[];
    const out=(nx,ny,Xw,Yw,z,f,cap)=>{ if(ny>0){ const c=P.playFront(Xw,z,f); if(c)return c; } return facade(nx,ny,Xw,Yw,z,f,cap,[118,50,44]); };
    const R=room('playhouse','PLAYHOUSE',B,{floor:(x,y)=>P.playFloorCol(mx(x),my(y)),in:(q,nx,ny,X_,Y_,z,f)=>P.playWall(q,-nx,-ny,mx(X_),my(Y_),z,f),out,cope:[226,214,186]},{w:'f',a:cx,wd:1.56,h:94},(B_,l0)=>{
      const n0=PROPS.length, S=P.PLS, lam=(k,x,y,z,r,c)=>{ const l={x,y,z,r,c}; LAMPS.push(l); L.push([k,l,null]); };
      P.props();
      for(const s of [-1,1]){ lam('house',P.PLMID+s*2.4,S.SY-3.2,110,7,[1,.86,.62]); lam('wall',s<0?B.x0+T+.35:B.x1-T-.35,S.SY-3.1,68,3.2,[.8,.52,.26]); lam('candle',P.PLMID+s*2.5,S.SY+.25,S.SZ+20,3.6,[.9,.6,.28]); lam('front',P.PLMID+s*1.3,B.y0-.9,74,4,[1.1,.9,.62]); }
      lam('lobby',P.PLMID,B.y0+.8,90,4.5,[1,.86,.62]); lam('prac',P.PLPRAC.baker[0],P.PLPRAC.baker[1],30,3.4,[1.2,.6,.24]);
      turn(B,n0,l0); });
    const PAT={books:(c,r)=>{ const s=Math.floor(r/16); if(r%16<2)return [96,58,36]; return [[120,30,30],[40,60,90],[60,80,50],[140,110,60],[80,40,70]][Math.floor(hs(Math.floor((c+s*7)/3),s,91)*5)]; },
      window:(c,r)=>c%22<3||r%26<3||c<4||r<4?[226,220,206]:[40,52,78], panel:(c,r)=>c%30<3||r%34<3?[46,30,20]:sh([64,44,30],.95+.1*hs(c>>3,r>>2,31)),
      portrait:(c,r,w,h)=>{ if(c<4||c>w-5||r<4||r>h-5)return [190,152,70]; const x=(c-w/2)/14, y=(r-h*.45)/18; return Math.hypot(x,(y-.35)*1.3)<.32?[220,190,160]:Math.abs(x)<.5&&y>-.1&&y<.2?[240,236,226]:Math.abs(x)<.75&&y<-.05?[120,26,30]:[28,24,22]; },
      clock:(c,r,w,h)=>Math.hypot(c-w/2,r-h+12)<8?(Math.hypot(c-w/2,r-h+12)<7?[226,218,190]:[190,152,70]):r>h*.2&&r<h*.6&&c>3&&c<w-4?[30,22,16]:[46,30,20],
      rug:(c,r,w,h)=>c<6||c>w-7||r<6||r>h-7?[176,140,70]:((c>>3)+(r>>3))&1?[110,34,36]:[44,52,92]};
    const SETM={}; for(const [name,list] of Object.entries(P.SETS)){ if(name==='fog')continue; BATCH.tag=OBJ('store:playhouse','scenery');
      for(const [x,y,parts] of list)for(const [a0,b0,z0,a1,b1,z1,c,e] of parts){ const col=e===1?lit(c):c, pat=typeof e==='string'?PAT[e]:null, X0=mx(x+a1), X1=mx(x+a0), Y0=my(y+b1), Y1=my(y+b0), Z0=P.PLS.SZ+z0*24, Z1=P.PLS.SZ+z1*24, w=(X1-X0)*24, h=Z1-Z0;
        gbox({x0:X0,x1:X1,y0:Y0,y1:Y1,z0:Z0,z1:Z1,c:col,em:e===1?1:0,top:e==='rug'?(X_,Y_)=>pat((X_-X0)*24|0,(Y_-Y0)*24|0,w,(Y1-Y0)*24):()=>col,fs:(nx,ny,X_,Y_,z,k)=>e===1?col:pat&&ny>0?sh(pat((X_-X0)*24|0,z|0,w,h),k):sh(col,k)},'Pset:'+name); } }
    BATCH.tag=null;
    const fogT=(()=>{ const cv=document.createElement('canvas'); cv.width=96; cv.height=12; const g=cv.getContext('2d'), im=g.createImageData(96,12), B4=[0,8,2,10,12,4,14,6];
      for(let j=0;j<12;j++)for(let i=0;i<96;i++){ const v=(Math.sin(i*.21)+Math.sin(i*.07+2)+Math.sin(i*.43+j))*.25+.55-j/14, a=v*16>B4[(i&3)+((j&1)<<2)]+2?150:0, o=(j*96+i)*4; im.data[o]=180; im.data[o+1]=194; im.data[o+2]=210; im.data[o+3]=a; }
      g.putImageData(im,0,0); const t=new THREE.CanvasTexture(cv); t.magFilter=t.minFilter=THREE.NearestFilter; t.wrapS=THREE.RepeatWrapping; t.colorSpace=THREE.SRGBColorSpace; return t; })();
    const fog=[0,1,2].map(i=>{ const t=fogT.clone(); t.needsUpdate=true; const m=new THREE.Mesh(new THREE.PlaneGeometry(X(P.PLS.PRX1)-X(P.PLS.PRX0),Y(40)-Y(0)),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false}));
      m.position.set(X(cx),Y(P.PLS.SZ+20),Z(my(P.PLS.CY+.9+i*1.4))); m.visible=false; scene.add(m); return m; });
    unplace('PLAYHOUSE'); MS.play={R,P,B,cx,cy,mx,my,L,SETM,fog,SH:{t0:null,cue:null,set:null,lv:-1,from:null,to:null,tc:0,step:-1,last:-1,cap:''},FIG:{},hound:null}; });

  STEPS.push(()=>{ const B=lot('holo',190), W=B.x1-B.x0, door=(B.x0+B.x1)/2, k=4, c0=Math.floor((W*24-47*k)/2), on=word('HOLODECK',c0,118,k), H={x0:520,y0:-104,x1:552,y1:-72,h:156}, hx=(H.x0+H.x1)/2;
    const front=(u,z,f)=>{ const c=Math.floor(u*24), d=Math.abs(B.x0+u-door);
      if(d<.9&&z<100&&(d>.78||z>=94))return HO.HOLOL; if(z<3)return HO.HOLOM;
      if(z>=110&&z<154&&c>=c0-8&&c<c0+47*k+8)return neon(on,c,z,k,[96,200,255],f)||sh([10,12,18],f);
      const a=u-Math.floor(u); return a<.03||a>.97||z%24<1?sh([30,40,56],f):sh(HO.HOLOK,f); };
    const pan=(q,nx,ny,X_,Y_,z,f)=>HO.holoWall(f)(nx?Y_:X_,z);
    const F=room('holofront','HOLODECK',B,{floor:HO.holoFloor,in:pan,out:(nx,ny,Xw,Yw,z,f,cap)=>ny>0?front(Xw-B.x0,z,f):sh(HO.HOLOK,f),cope:[20,24,32],roof:()=>[18,20,26]},{w:'f',a:door,wd:1.56,h:94},()=>{
      LAMPS.push({x:door,y:B.y1+1,z:110,r:5,c:[.4,.8,1]},{x:door,y:B.y1-2.5,z:120,r:6,c:[.4,.8,1]}); });
    STORE.bound.x1=Math.max(STORE.bound.x1,X(H.x1+10)); STORE.bound.z0=Math.min(STORE.bound.z0,Z(H.y0-10)); STORE.bound.z1=Math.max(STORE.bound.z1,Z(H.y1+10));
    const R=room('holodeck','HOLODECK HALL',H,{floor:HO.holoFloor,in:pan,out:(nx,ny,Xw,Yw,z,f)=>sh(HO.HOLOK,f),cope:[20,24,32],roof:()=>[18,20,26]},{w:'f',a:hx,wd:3,h:96},()=>{
      LAMPS.push({x:hx-8,y:(H.y0+H.y1)/2,z:140,r:16,c:[.55,.75,1]},{x:hx+8,y:(H.y0+H.y1)/2,z:140,r:16,c:[.55,.75,1]}); });
    unplace('HOLODECK'); unplace('HOLODECK HALL');
    const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80*TILE*BLDK,80*TILE*BLDK).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({color:0x0a0b10})); gnd.position.set(X(hx),Y(.02),Z((H.y0+H.y1)/2)); scene.add(gnd);
    MS.holo={F,R,B,H,door,hx,busy:false}; });

  STEPS.push(()=>{ const TT=TILE*BLDK, PX=ZU*BLDK, V=new THREE.Vector3(), GEO={}, MAT={};
    const mat=(c,e)=>MAT[c+e]||(MAT[c+e]=e?new THREE.MeshBasicMaterial({color:new THREE.Color(c)}):new THREE.MeshLambertMaterial({color:new THREE.Color(c)}));
    const bxm=(w,h,d,c,x,y,z,e)=>{ const k=[w,h,d].map(v=>v.toFixed(4)).join(), me=new THREE.Mesh(GEO[k]||(GEO[k]=new THREE.BoxGeometry(w,h,d)),mat(c,e)); me.position.set(x,y,z); me.castShadow=true; return me; };
    const HAT={top:[6,4,10],bowler:[6,4,6],deerstalker:[5,4,6],wide:[7,4,6],straw:[6,4,4]};
    const mkFig=C=>{ const g=new THREE.Group(), L=C.look, pv=(x,y,p=g)=>{ const q=new THREE.Group(); q.position.set(x,y,0); p.add(q); return q; };
      const body=pv(0,0), legs=[-1,1].map(s=>{ const q=pv(s*.09*TT,30*PX,body); q.add(bxm(.14*TT,26*PX,.16*TT,L.pants,0,-13*PX,0),bxm(.15*TT,4*PX,.22*TT,L.shoes,0,-28*PX,.03*TT)); return q; });
      body.add(bxm(.42*TT,28*PX,.24*TT,L.shirt,0,44*PX,0));
      const arms=[-1,1].map(s=>{ const q=pv(s*.27*TT,57*PX,body); q.add(bxm(.1*TT,22*PX,.12*TT,L.shirt,0,-11*PX,0),bxm(.09*TT,4*PX,.1*TT,L.skin,0,-24*PX,0)); return q; });
      const head=pv(0,58*PX,body); head.add(bxm(.26*TT,15*PX,.26*TT,L.skin,0,8*PX,0),bxm(.28*TT,4*PX,.28*TT,L.hair,0,15*PX,-.01*TT),bxm(.04*TT,2*PX,.01*TT,'#1a1414',-.06*TT,9*PX,.13*TT),bxm(.04*TT,2*PX,.01*TT,'#1a1414',.06*TT,9*PX,.13*TT));
      const h=HAT[C.hat]; if(h){ head.add(bxm(h[0]/12*TT,2*PX,h[0]/12*TT,C.hatC,0,17*PX,0),bxm(h[1]/12*TT,h[2]*PX,h[1]/12*TT,C.hatC,0,(18+h[2]/2)*PX,0)); }
      g.visible=false; scene.add(g); return {g,body,legs,arms,head,hd:null,ph:0}; };
    const mkHound=P=>{ const g=new THREE.Group(), parts=P.HOUND.map(([x0,y0,z0,x1,y1,z1,c,e],i)=>{ const me=bxm((y1-y0)*TT,(z1-z0)*24*PX,(x1-x0)*TT,'#'+c.map(v=>v.toString(16).padStart(2,'0')).join(''),(y0+y1)/2*TT,(z0+z1)/2*24*PX,(x0+x1)/2*TT,e);
      me.userData.p0=me.position.clone(); me.userData.part=P.HOUND[i]; g.add(me); return me; }); g.visible=false; scene.add(g); return {g,parts}; };
    const cap=document.createElement('div'); cap.id='plcap'; cap.style.cssText='position:fixed;left:50%;bottom:9%;transform:translateX(-50%);max-width:min(70ch,90vw);padding:6px 12px;background:rgba(8,6,10,.78);color:#f0e4c4;font:14px/1.4 monospace;letter-spacing:1px;text-align:center;pointer-events:none;z-index:40;display:none'; document.body.appendChild(cap);
    const SFXK={knock:'door',door:'creak',howlfar:'bark',howlnear:'bark',snarl:'bark',paws:'step',mire:'drip',splash:'drip',owl:'chirp',sting:'boom',bell:'latch'};
    const recOf=l=>{ const x=X(l.x), y=Y(l.z), z=Z(l.y); return LITE.recs.find(L=>Math.abs(L.position.x-x)+Math.abs(L.position.y-y)+Math.abs(L.position.z-z)<1e-3)||null; };
    const cue=(M,cu,set,lv,now)=>{ const S=M.SH, C=PY.PLCUE;
      if(cu!==S.cue||set!==S.set||lv!==S.lv){ const fade=cu!==S.cue||set!==S.set; S.from=fade?S.to:null; S.cue=cu; S.set=set; S.lv=lv; S.tc=now; S.step=-1; S.to={};
        for(const k of ['house','lobby','wall','candle','prac']){ const c=C[cu][k]||[0,0,0], m=k==='candle'?.15+.85*lv:k==='prac'?lv:1; S.to[k]=k==='prac'&&!M.P.PLPRAC[set]?[0,0,0]:c.map(v=>v*m); }
        const p=M.P.PLPRAC[set]; if(p)for(const e of M.L)if(e[0]==='prac'&&e[2])e[2].position.set(X(M.mx(p[0])),Y(p[2]),Z(M.my(p[1]))); }
      const k=Math.min(1,(now-S.tc)/1500), step=S.from?Math.round(k*5):5; if(step===S.step)return; S.step=step;
      for(const [g,l,L] of M.L){ if(g==='front'||!L)continue; const a=S.from&&S.from[g]||S.to[g], b=S.to[g], c=a.map((v,i)=>v+(b[i]-v)*step/5), cm=Math.max(...c); if(cm>0)L.color.setRGB(c[0]/cm,c[1]/cm,c[2]/cm); L.intensity=cm>0?7*cm*Math.min(1.2,l.r/5):0; } };
    const show=(dt,now)=>{ const M=MS.play; if(!M||!M.P)return; const {R,P,SH}=M, inside=LVL==='up'&&R.inside(pos.x,pos.z), LL=PY.PLL;
      if(!M.SETM.baker&&STORE.meshes&&BATCH.all(STORE.meshes,'Pset:baker').length)for(const n of ['baker','hall','moor'])M.SETM[n]=BATCH.all(STORE.meshes,'Pset:'+n);
      for(const e of M.L)if(!e[2])e[2]=recOf(e[1]);
      if(inside&&USE.seat&&!(SH.t0!=null&&(now-SH.t0)/1000<LL))SH.t0=now;
      const t=window.PLAYAT!=null?+window.PLAYAT:SH.t0!=null&&(now-SH.t0)/1000<LL?(now-SH.t0)/1000:-1, st=P.plState(t);
      const sets=n=>{ for(const k in M.SETM)for(const me of M.SETM[k])me.visible=k===(n==='fog'?'moor':n); };
      if(!inside){ sets('baker'); for(const f of Object.values(M.FIG))f.g.visible=false; if(M.hound)M.hound.g.visible=false; for(const f of M.fog)f.visible=false; cap.style.display='none'; SH.last=-1; return; }
      cue(M,st.lt,st.set,st.si===-1?1:Math.round(st.c*4)/4,now); sets(st.set);
      const TR=st.si>=0?P.PLTR[st.si]:st.si===-2?P.PLCALL:null, seen=new Set();
      if(TR&&st.c>0)for(const [w,a] of Object.entries(TR.A)){ const p=P.plPlayer(a,t,TR); if(!p)continue; seen.add(w); const F=M.FIG[w]||(M.FIG[w]=mkFig(PY.PLAY.cast[w]));
        F.g.visible=true; F.g.position.set(X(M.mx(p.x)),Y(P.PLS.SZ),Z(M.my(p.y))); const want=Math.atan2(-p.dir[0],-p.dir[1]); if(F.hd==null)F.hd=want; let dd=want-F.hd; dd=Math.atan2(Math.sin(dd),Math.cos(dd)); F.hd+=Math.max(-3*Math.PI*dt,Math.min(3*Math.PI*dt,dd)); F.g.rotation.set(0,F.hd,0);
        let act=null; for(const [ta,mv] of a.acts)if(ta<=t&&t<ta+(mv==='crouch'?2.4:mv==='fall'?2:.8))act=mv;
        F.ph+=p.walking?dt*Math.PI*3.2:0; const s=p.walking?Math.sin(F.ph):0; F.legs[0].rotation.x=s*.6; F.legs[1].rotation.x=-s*.6; F.arms[0].rotation.x=-s*.5; F.arms[1].rotation.x=s*.5;
        F.body.position.y=act==='crouch'?-12*PX:0; F.legs.forEach(l=>l.scale.y=act==='crouch'?.6:1); if(act==='crouch')F.legs.forEach(l=>l.position.y=18*PX); else F.legs.forEach(l=>l.position.y=30*PX);
        if(act==='wave')F.arms[1].rotation.x=-2.7; if(act==='block'){ F.arms[0].rotation.x=F.arms[1].rotation.x=-1.4; } F.g.rotation.x=act==='fall'?-1.35:0; }
      for(const [w,F] of Object.entries(M.FIG))if(!seen.has(w))F.g.visible=false;
      const ht=TR&&TR.H.length?P.plHoundAt(TR.H,t):null; if(ht&&!M.hound)M.hound=mkHound(P);
      if(M.hound){ const Hd=M.hound; Hd.g.visible=!!ht; if(ht){ const ph=ht.s*Math.PI*2; Hd.g.position.set(X(M.mx(ht.x)),Y(P.PLS.SZ+ht.up*24),Z(M.my(ht.y))); Hd.g.rotation.y=Math.atan2(-Math.cos(ht.a),-Math.sin(ht.a));
        for(const me of Hd.parts){ const q=me.userData.part, p0=me.userData.p0; if(q.leg){ const fore=q.leg[0]>0, side=q.leg[1]>0, a=ph+(fore?0:Math.PI)+(side?.4:0); me.position.set(p0.x,p0.y+Math.max(0,-Math.cos(a))*.08*24*PX,p0.z+Math.sin(a)*.16*TT); }
          else if(q.tail)me.position.set(p0.x+Math.sin(ph)*.05*TT,p0.y+.04*24*PX*Math.cos(ph),p0.z); else me.position.set(p0.x,p0.y+Math.sin(ph*2)*.025*24*PX,p0.z); } } }
      M.fog.forEach((f,i)=>{ f.visible=st.set==='fog'&&st.si>=0; if(f.visible){ f.material.map.offset.x=(t*.012*(i%2?-1:1)+i*.3)%1; f.material.opacity=Math.min(1,(t-PY.PLAYT.scenes[3].S)/14); } });
      let line=''; if(t>=0)for(const [t0,d,si,bi] of PY.PLAYT.lines)if(t>=t0&&t<t0+d){ const b=PY.PLAY.scenes[si].beats[bi]; line=PY.PLAY.cast[b.w].name.toUpperCase()+': '+b.s.replace(/\[[^\]]*\]\s*/g,''); }
      if(line!==SH.cap){ SH.cap=line; cap.textContent=line; cap.style.display=line?'block':'none'; }
      if(t>=0&&SH.last>=0&&typeof SFX!=='undefined')for(const s of PY.PLAYT.sounds)if(!s.bed&&SFXK[s.k]&&s.at>SH.last&&s.at<=t)SFX.play(SFXK[s.k],{vol:s.vol*.8}); SH.last=t; };
    const film=now=>{ const M=MS.theatre; if(!M)return; const near=LVL==='up'&&(M.R.inside(pos.x,pos.z)||Math.hypot(pos.x-M.R.at.x,pos.z-M.R.at.z)<6*TILE); M.fm.visible=near; if(!near)return;
      const k=Math.floor(now/125)%TH.FILMN; if(k===M.k)return; M.k=k; const f=TH.filmFrame(k), d=M.tx.image.data, W=TH.FILMW, Hh=TH.FILMH;
      for(let j=0;j<Hh;j++)for(let i=0;i<W;i++){ const s=(j*W+i)*3, o=((Hh-1-j)*W+i)*4; d[o]=f[s]; d[o+1]=f[s+1]; d[o+2]=f[s+2]; d[o+3]=255; } M.tx.needsUpdate=true; };
    const fade=async(x,z,txt)=>{ const H=MS.holo, el=document.getElementById('subfade'); H.busy=true; if(el){ el.textContent=txt; el.style.opacity='1'; } await new Promise(r=>setTimeout(r,340));
      UI.goTo(x,z,'up'); if(typeof keys!=='undefined'&&keys.clear)keys.clear(); await new Promise(r=>setTimeout(r,420)); if(el)el.style.opacity='0'; H.busy=false; };
    const holo=()=>{ const H=MS.holo; if(!H||H.busy||LVL!=='up'||UI.freeCam)return;
      if(H.F.inside(pos.x,pos.z)&&pos.z<Z(H.B.y1-1))fade(X(H.hx),Z(H.H.y1-1.8),'ENTERING THE HOLODECK');
      else if(pos.x>X(H.H.x0)&&pos.x<X(H.H.x1)&&pos.z>Z(H.H.y1-.3)&&pos.z<Z(H.H.y1+3))fade(X(H.door),Z(H.B.y1+1.4),'LEAVING THE HOLODECK'); };
    const lane=()=>{ if(MS.laned||!BLK.lane||!STORE.meshes)return; const ms=new Set(); for(const id of ['theatre','arcade','playhouse','holofront'])for(const w of ['f','b','w','e','lobby'])for(const me of BATCH.all(STORE.meshes,'W'+id+':'+w))ms.add(me); if(!ms.size)return; MS.laned=1;
      for(const w of cutWalls){ if(!ms.has(w.me))continue; const wh=w.when, al=Object.getOwnPropertyDescriptor(w,'always'), was=al?(al.get?()=>al.get.call(w):()=>al.value):()=>false;
        w.when=()=>BLK.lane()||(wh?wh():true); Object.defineProperty(w,'always',{get:()=>BLK.lane()||was(),configurable:true}); } };
    let t0=performance.now(); const tick0=CLOCK.tick; CLOCK.tick=dt=>{ tick0(dt); const now=performance.now(), d=Math.min(.25,(now-t0)/1000); t0=now; lane(); film(now); show(d,now); holo(); };
    window.MAINDBG=()=>({rooms:STORE.rooms.filter(r=>['theatre','arcade','playhouse','holofront','holodeck'].includes(r.id)).map(r=>[r.id,+r.x0.toFixed(1),+r.z0.toFixed(1),+r.x1.toFixed(1),+r.z1.toFixed(1)]),play:MS.play&&{t0:MS.play.SH.t0,cue:MS.play.SH.cue,lights:MS.play.L.map(e=>[e[0],!!e[2]]),sets:Object.keys(MS.play.SETM)},laned:!!MS.laned,tris:(()=>{ const C={}; for(const o of OBJS){ const m=/^store:(theatre|arcade|playhouse|holofront|holodeck)/.exec(o.id||''); if(m)C[m[1]]=(C[m[1]]||0)+o.parts.length*2; }
      for(const k in STORE.meshes){ const m=/^[WR](theatre|arcade|playhouse|holofront|holodeck)/.exec(k)||/^P(set)/.exec(k); if(m)C[m[1]]=(C[m[1]]||0)+STORE.meshes[k].geometry.attributes.position.count/3; } return C; })(),lamps:MS.lamps}); });
}
