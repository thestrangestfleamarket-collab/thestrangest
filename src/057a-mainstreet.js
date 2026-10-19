{ const K=STORE.kit, {room,STEPS}=K, {X,Y,Z,placeAt,facade,gbox}=BOD, sh=BOD.K.sh, SK=BOD.STOREK, {PROPS,LAMPS}=SK, T=SK.T, TH=SK.theatre, HO=SK.holo, PY=SK.play, hs=BOD.g.hash;
  const bx=m=>BOD.OX+(m-BOD.OX)/BLDK, by=m=>BOD.OY+(m-BOD.OY)/BLDK, lot=(k,h)=>({x0:bx(BLOCK.lots[k][0])+.1,x1:bx(BLOCK.lots[k][1])-.1,y0:by(BLOCK.back)+.1,y1:BOD.OY,h});
  const turn=(B,n0,l0)=>{ const cx=(B.x0+B.x1)/2, cy=(B.y0+B.y1)/2; for(const p of PROPS.slice(n0))placeAt(p,2,cx,cy,cx,cy); for(const l of LAMPS.slice(l0)){ l.x=2*cx-l.x; l.y=2*cy-l.y; } };
  const lit=c=>Object.assign(c.slice(),{e:1}), FONT={...TH.THFONT,D:'####.#...##...##...##...##...#####.',L:'#....#....#....#....#....#....#####'};
  const word=(s,c0,z0,k)=>(c,z)=>{ const i=Math.floor((c-c0)/k), r=6-Math.floor((z-z0)/k); if(c<c0||z<z0||i>=s.length*6-1||r<0||r>6)return false; const q=i%6, g=FONT[s[Math.floor(i/6)]]; return q<5&&!!g&&g[r*5+q]==='#'; };
  const neon=(on,c,z,k,col,f)=>{ if(on(c,z))return lit(col); for(const [a,b] of [[-k,0],[k,0],[0,-k],[0,k]])if(on(c+a,z+b))return sh(col,.42*f); return null; };
  const unplace=n=>{ const i=STORE.places.findIndex(p=>p[0]===n); if(i>=0)STORE.places.splice(i,1); }, door=(k,f)=>{ const L=lot(k); return [X(L.x0+f(L)),Z(L.y1)+2.2*TILE]; };
  const MS=STORE.main={doors:[['THE MOVIE THEATRE',...door('theatre',()=>4.4)],['THE ARCADE',...door('arcade',L=>(L.x1-L.x0)/2)],['THE PLAYHOUSE',...door('play',L=>(L.x1-L.x0)/2)]]};

  STEPS.push(()=>{ const B=lot('theatre',176), W=B.x1-B.x0, cx=(B.x0+B.x1)/2, LOB=B.y1-4.6, door=B.x0+4.4;
    const SEG=[[6,14.65,-6],[16.6,19.5,-7.95],[2.8,2.8+W-11.55,8.75]];
    const pic=(X_,z)=>{ const u=X_-B.x0; for(const [a,b,o] of SEG)if(u>=a+o&&u<b+o)return TH.THFRONT(u-o,z); return null; };
    const out=(nx,ny,Xw,Yw,z,f,cap)=>{ if(ny>0){ const c=pic(Xw,z); if(c)return c.e?c:sh(c,f); } const u=(nx?Yw:Xw)*24|0, r=z|0; return sh(r%8<1||(u+(r>>3&1)*8)%16<1?[120,52,44]:[156,66,54],f); };
    const S={x0:B.x0+2.2,x1:B.x1-2.2,y:B.y1-T,z0:60,z1:172,m:12};
    const R=room('theatre','MOVIE THEATRE',B,{floor:TH.theatreCarpet,in:(q,nx,ny,X_,Y_,z,f)=>TH.theatreWall(nx?Y_:X_,z,f),out,cope:[200,192,170]},{w:'f',a:door,wd:1.56,h:94},(B_,l0)=>{
      const n0=PROPS.length, oL=B.y0+4.6, odx=2*cx-door, w=.85, rx0=cx-2*w, rows=[3.6].map(d=>B.y1-d);
      TH.theatreScreen(S); TH.theatreDrape(B.x0+T,S.x0-S.m/24,S); TH.theatreDrape(S.x1+S.m/24,B.x1-T,S); TH.theatreValance(S);
      for(const y of rows)for(let i=0;i<4;i++)TH.theatreSeat(rx0+i*w,y,w,i===3);
      for(const [x,n] of [[B.x0+T,[1,0]],[B.x1-T,[-1,0]]])for(const y of [2.4,6].map(d=>B.y1-d)){ SK.bar.theatreSconce(x,y,n); LAMPS.push({x:x+n[0]*.35,y,z:68,r:3.4,c:[1,.62,.34]}); }
      LAMPS.push({x:cx,y:S.y-2.5,z:110,r:8,c:[.62,.66,.78]},{x:cx,y:B.y0+2.3,z:100,r:5,c:[1,.86,.6]});
      TH.theatreAisleLights([rx0-.35,rx0+4*w+.35],rows.map(y=>y-.45)); TH.theatreExit(odx,oL+.1); TH.theatrePort(odx,oL+.1,190);
      for(const [a,b,o] of SEG){ TH.thAt(B.x1-o,B.y0); TH.thFront(p=>{ const u0=Math.max(p[0],a), u1=Math.min(p[1],b); return u1-u0>.01?[u0,u1,...p.slice(2)]:null; }); }
      turn(B,n0,l0); },{xw:[['lobby','x',LOB,B.x0+T,B.x1-T,-1,[{a0:door-.8,a1:door+.8,z0:0,z1:96}],true]]});
    const tx=new THREE.DataTexture(new Uint8Array(TH.FILMW*TH.FILMH*4),TH.FILMW,TH.FILMH); tx.magFilter=tx.minFilter=THREE.NearestFilter; tx.colorSpace=THREE.SRGBColorSpace;
    const fm=new THREE.Mesh(new THREE.PlaneGeometry(X(S.x1)-X(S.x0),Y(S.z1)-Y(S.z0)),new THREE.MeshBasicMaterial({map:tx})); fm.position.set(X(cx),Y((S.z0+S.z1)/2),Z(B.y0+T+.075)); fm.visible=false; scene.add(fm);
    unplace('MOVIE THEATRE'); MS.theatre={R,fm,tx,k:-1}; });

  STEPS.push(()=>{ const B=lot('arcade',180), W=B.x1-B.x0, cx=(B.x0+B.x1)/2, A=TH.ARC, k=6, c0=Math.floor((W*24-35*k)/2), on=word('ARCADE',c0,118,k);
    const front=(u,z,f)=>{ const c=Math.floor(u*24);
      if(z<8)return sh([44,34,52],f);
      if(z<96&&u>.5&&u<W-.5){ const m=(u-.5)%2.1; return m<.08||z<11||z>93?sh([58,40,70],f):sh([20,16,32],f); }
      if(z>=98&&z<102)return lit([236,64,160]); if(z>=104&&z<106)return lit([60,206,230]);
      if(z>=110&&z<170&&c>=c0-8&&c<c0+35*k+8)return neon(on,c,z,k,[255,80,200],f)||sh([24,16,32],f);
      return null; };
    const out=(nx,ny,Xw,Yw,z,f,cap)=>{ if(ny>0){ const c=front(Xw-B.x0,z,f); if(c)return c; } return facade(nx,ny,Xw,Yw,z,f,cap,[96,58,80]); };
    const y0=B.y0, y1=B.y1;
    MS.arcade={R:room('arcade','ARCADE',B,{floor:(x,yq)=>sh([46,40,54],.94+.12*hs(x*2|0,yq*2|0,995)),in:(q,nx,ny,X_,Y_,z,f)=>z<3?sh([30,24,36],f):sh([70,60,82],f),
      out,cope:[60,44,70]},{w:'f',a:cx,wd:1.56,h:94},()=>{
      LAMPS.push({x:cx,y:(y0+y1)/2,z:120,r:10,c:[1,.92,1.05]},{x:cx,y:y1+1,z:140,r:5,c:[1,.3,.75]}); })}; unplace('ARCADE'); });

  STEPS.push(()=>{ const B=lot('play',130), cx=(B.x0+B.x1)/2, cy=(B.y0+B.y1)/2, P=PY.PLAYK(B), mx=x=>2*cx-x, my=y=>2*cy-y, L=[];
    const out=(nx,ny,Xw,Yw,z,f,cap)=>{ if(ny>0){ const c=P.playFront(Xw,z,f); if(c)return c; } return facade(nx,ny,Xw,Yw,z,f,cap,[118,50,44]); };
    const R=room('playhouse','PLAYHOUSE',B,{floor:(x,y)=>P.playFloorCol(mx(x),y),in:(q,nx,ny,X_,Y_,z,f)=>P.playWall(q,-nx,-ny,mx(X_),my(Y_),z,f),out,cope:[226,214,186]},{w:'f',a:cx,wd:1.56,h:94},(B_,l0)=>{
      const n0=PROPS.length, S=P.PLS, lam=(k,x,y,z,r,c)=>{ const l={x,y,z,r,c}; LAMPS.push(l); L.push([k,l,null]); };
      P.props();
      for(const s of [-1,1]){ lam('house',P.PLMID+s*2.4,S.SY-3.2,110,7,[1,.86,.62]); lam('wall',s<0?B.x0+T+.35:B.x1-T-.35,S.SY-3.1,68,3.2,[.8,.52,.26]); lam('front',P.PLMID+s*1.3,B.y0-.9,74,4,[1.1,.9,.62]); }
      lam('lobby',P.PLMID,B.y0+.8,90,4.5,[1,.86,.62]);
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
    unplace('PLAYHOUSE'); MS.play={R,P,B,cx,cy,mx,my,L,SETM,fog,SH:{t0:null,cue:null,set:null,lv:-1,from:null,to:null,tc:0,step:-1,last:-1,cap:''},FIG:{},hound:null,up:0}; });

  STEPS.push(()=>{ const L=lot('arcade',0), bc=L.x0+1.6, B={x0:bc-1,x1:bc+1,y0:L.y0+.4,y1:L.y0+2.4,h:116}, W=B.x1-B.x0, door=bc, k=1, c0=Math.floor((W*24-47*k)/2), on=word('HOLODECK',c0,100,k), H={x0:520,y0:-88,x1:536,y1:-72,h:120}, hx=(H.x0+H.x1)/2;
    const front=(u,z,f)=>{ const c=Math.floor(u*24), d=Math.abs(B.x0+u-door);
      if(d<.62&&z<100&&(d>.5||z>=94))return HO.HOLOL; if(z<3)return HO.HOLOM;
      if(z>=98&&z<110)return neon(on,c,z,k,[96,200,255],f)||sh([10,12,18],f);
      const a=u-Math.floor(u); return a<.03||a>.97||z%24<1?sh([30,40,56],f):sh(HO.HOLOK,f); };
    const pan=(q,nx,ny,X_,Y_,z,f)=>HO.holoWall(f)(nx?Y_:X_,z);
    const F=room('holofront','HOLODECK',B,{floor:HO.holoFloor,in:pan,out:(nx,ny,Xw,Yw,z,f,cap)=>ny>0?front(Xw-B.x0,z,f):sh(HO.HOLOK,f),cope:[20,24,32],roof:()=>[18,20,26]},{w:'f',a:door,wd:1,h:94},()=>{
      LAMPS.push({x:door,y:B.y1+1,z:104,r:4,c:[.4,.8,1]}); },{now:1,z:.3});
    STORE.bound.x1=Math.max(STORE.bound.x1,X(H.x1+10)); STORE.bound.z0=Math.min(STORE.bound.z0,Z(H.y0-10)); STORE.bound.z1=Math.max(STORE.bound.z1,Z(H.y1+10));
    const R=room('holodeck','HOLODECK HALL',H,{floor:HO.holoFloor,in:pan,out:(nx,ny,Xw,Yw,z,f)=>sh(HO.HOLOK,f),cope:[20,24,32],roof:()=>[18,20,26]},{w:'f',a:hx,wd:3,h:96},()=>{
      LAMPS.push({x:hx-4,y:(H.y0+H.y1)/2,z:108,r:10,c:[.55,.75,1]},{x:hx+4,y:(H.y0+H.y1)/2,z:108,r:10,c:[.55,.75,1]}); },{now:1});
    unplace('HOLODECK HALL'); { const p=STORE.places.find(q=>q[0]==='HOLODECK'); if(p)p[0]='THE HOLODECK'; }
    const gnd=new THREE.Mesh(new THREE.PlaneGeometry(40*TILE*BLDK,40*TILE*BLDK).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({color:0x0a0b10})); gnd.position.set(X(hx),Y(.02),Z((H.y0+H.y1)/2)); scene.add(gnd);
    MS.holo={F,R,B,H,door,hx,busy:false}; });

  STEPS.push(()=>{ const V=new THREE.Vector3(), MAT={}, mat=c=>MAT[c]||(MAT[c]=new THREE.MeshLambertMaterial({color:new THREE.Color(c)}));
    const KINDS={holmes:'hero_m',watson:'villager_m',mortimer:'villager_m',henry:'hero_m',stapleton:'hero_m',barrymore:'villager_m'}, CLIP={wave:'cheer_idle_a',crouch:'sit_floor_idle_a',fall:'sit_floor_idle_a',block:'found_item_idle_a'};
    const HAT={top:[.1,.065,.12],bowler:[.095,.065,.06],deerstalker:[.085,.066,.065],wide:[.125,.066,.05],straw:[.115,.068,.035]}, rgb=h=>{ const v=parseInt(h.slice(1),16); return [v>>16&255,v>>8&255,v&255]; };
    const dress=(N,L)=>N.g.traverse(m=>{ const g=m.isMesh&&m.geometry; if(!g||!g.attributes.reg)return; const c=g.attributes.color.array, R=g.attributes.reg.array, P=g.attributes.position.array, n=R.length, S={}; let y0=1e9, y1=-1e9;
      for(let i=0;i<n;i++){ const y=P[i*3+1]; y0=Math.min(y0,y); y1=Math.max(y1,y); const s=S[R[i]]||(S[R[i]]=[0,0,0,0,0]); s[0]+=c[i*3]; s[1]+=c[i*3+1]; s[2]+=c[i*3+2]; s[3]+=y; s[4]++; }
      for(const r in S){ const s=S[r], a=s[0]/s[4], b=s[1]/s[4], d=s[2]/s[4], h=(s[3]/s[4]-y0)/(y1-y0); s.l=a*.3+b*.59+d*.11; s.k=a>107&&a>b&&b>d&&a-d>30&&b/a>.55&&b/a<.92?null:h<.1?'shoes':h<.45?'pants':h>.8?'hair':'shirt'; }
      for(let i=0;i<n;i++){ const s=S[R[i]]; if(!s.k)continue; const q=rgb(L[s.k]), f=.65+.35*Math.min(1.6,(c[i*3]*.3+c[i*3+1]*.59+c[i*3+2]*.11)/(s.l||1)); for(let j=0;j<3;j++)c[i*3+j]=Math.min(255,q[j]*f); }
      g.attributes.color.needsUpdate=true; });
    const hold={free:()=>true,roam:false,brain:(dt,you,st)=>{ st.to=null; st.hold=true; }};
    const mkFig=(w,M)=>{ const C=PY.PLAY.cast[w], N=window.PAWNNEW&&PAWNNEW(KINDS[w],'play_'+w,{npc:{...hold,x:X(M.cx),z:Z(M.cy),ground:()=>Y(M.P.PLS.SZ)}}); if(!N)return null;
      dress(N,C.look); N.walker={talk:true}; let head=null; N.g.traverse(b=>{ if(b.isBone&&b.name==='DEF_head')head=b; });
      const h=HAT[C.hat], H=N.H||TILE*2.4, hat=new THREE.Group(); if(h){ const m=mat(C.hatC); hat.add(new THREE.Mesh(new THREE.CylinderGeometry(h[0]*H,h[0]*H,.012*H,12),m),new THREE.Mesh(new THREE.CylinderGeometry(h[1]*H*(C.hat==='bowler'?.85:1),h[1]*H,h[2]*H,12).translate(0,h[2]*H/2,0),m)); hat.traverse(o=>o.castShadow=true); }
      hat.visible=false; scene.add(hat); return {N,head,hat,H,hd:null}; };
    const mkHound=M=>{ const N=window.CREATNEW&&CREATNEW('Rat','hound',.8,{paint:g=>{ const c=g.attributes.color.array, R=g.attributes.reg.array; for(let i=0;i<R.length;i++)for(let j=0;j<3;j++)c[i*3+j]=R[i]?[150,230,100][j]:Math.min(255,c[i*3+j]*.16+8); return g; },
      npc:{...hold,x:X(M.cx),z:Z(M.cy),eye:1,eyeC:'.7,1.,.45',ground:()=>Y(M.P.PLS.SZ+(M.up||0))}}); if(N)N.g.visible=false; return N; };
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
      { sets('baker'); for(const f of Object.values(M.FIG))if(f){ f.N.g.visible=false; f.hat.visible=false; } if(M.hound)M.hound.g.visible=false; for(const f of M.fog)f.visible=false; cap.style.display='none'; SH.last=-1; return; }
      cue(M,st.lt,st.set,st.si===-1?1:Math.round(st.c*4)/4,now); sets(st.set);
      const TR=st.si>=0?P.PLTR[st.si]:st.si===-2?P.PLCALL:null, seen=new Set();
      if(TR&&st.c>0)for(const [w,a] of Object.entries(TR.A)){ const p=P.plPlayer(a,t,TR); if(!p)continue; const F=w in M.FIG?M.FIG[w]:(M.FIG[w]=mkFig(w,M)); if(!F)continue; seen.add(w);
        const N=F.N, want=Math.atan2(-p.dir[0],-p.dir[1]); if(F.hd==null)F.hd=want; let dd=want-F.hd; dd=Math.atan2(Math.sin(dd),Math.cos(dd)); F.hd+=Math.max(-3*Math.PI*dt,Math.min(3*Math.PI*dt,dd));
        N.st.x=X(M.mx(p.x)); N.st.z=Z(M.my(p.y)); N.st.h=F.hd; N.g.position.set(N.st.x,Y(P.PLS.SZ),N.st.z); N.g.rotation.y=F.hd; N.g.visible=true;
        let act=null; for(const [ta,mv] of a.acts)if(ta<=t&&t<ta+(mv==='crouch'?2.4:mv==='fall'?2:1.2))act=mv; const talk=a.talk.some(([t0,t1])=>t>=t0&&t<t1);
        N.dwell=p.walking?'UAL_Walk_Formal_Loop':act?CLIP[act]:talk?'UAL_Idle_Talking_Loop':'UAL_Idle_Loop';
        if(F.head&&F.hat.children.length){ F.head.getWorldPosition(V); F.hat.position.set(V.x,V.y+F.H*.1,V.z); F.hat.rotation.y=N.g.rotation.y; F.hat.visible=act!=='fall'&&act!=='crouch'; } }
      for(const [w,F] of Object.entries(M.FIG))if(F&&!seen.has(w)){ F.N.g.visible=false; F.hat.visible=false; }
      const ht=TR&&TR.H.length?P.plHoundAt(TR.H,t):null; if(ht&&M.hound===null)M.hound=mkHound(M)||0;
      if(M.hound){ const N=M.hound; N.g.visible=!!ht; if(ht){ M.up=ht.up*24; N.st.x=X(M.mx(ht.x)); N.st.z=Z(M.my(ht.y)); N.st.h=Math.atan2(-Math.cos(ht.a),-Math.sin(ht.a)); N.g.position.set(N.st.x,Y(P.PLS.SZ+M.up),N.st.z); N.g.rotation.y=N.st.h; N.clip=ht.run?'Rat_Run':'Rat_Idle'; } }
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
