// MAIN STREET: the lots along Main Street (the theatre, the arcade, the playhouse and the rest; its own builder).
import {SHARED, THREE} from './003-shx.js';
import {BLK, LITE, pos, SFX, USE} from './003b-systems.js';
import {scene} from './004-main.js';
import {BLDK, BLOCK, cutWalls, FIX, grab, SOL, STORE, SYS, TILE, TURN, WP} from './006-map-pre.js';
import {BATCH, OBJ, OBJS} from './008-batch.js';
await grab('mainstreet',async()=>{ const K=STORE.kit, {room,STEPS}=K, {X,Y,Z,placeAt,facade,gbox}=SHARED.BOD, sh=SHARED.BOD.K.sh, SK=SHARED.BOD.STOREK, {PROPS,LAMPS}=SK, T=SK.T, TH=SK.theatre, PY=SK.play, hs=SHARED.BOD.g.hash;
  const bx=m=>SHARED.BOD.OX+(m-SHARED.BOD.OX)/BLDK, by=m=>SHARED.BOD.OY+(m-SHARED.BOD.OY)/BLDK, lot=(k,h)=>{ const p=WP[k]; return p&&p.y1!=null?{x0:bx(p.x0)+.1,x1:bx(p.x1)-.1,y0:by(p.y0)+.1,y1:by(p.y1),h}:{x0:bx(BLOCK.lots[k][0])+.1,x1:bx(BLOCK.lots[k][1])-.1,y0:by(BLOCK.back)+.1,y1:SHARED.BOD.OY,h}; };
  const turn=(B,n0,l0)=>{ const cx=(B.x0+B.x1)/2, cy=(B.y0+B.y1)/2; for(const p of PROPS.slice(n0))placeAt(p,2,cx,cy,cx,cy); for(const l of LAMPS.slice(l0)){ l.x=2*cx-l.x; l.y=2*cy-l.y; } };
  const lit=c=>Object.assign(c.slice(),{e:1}), FONT={...TH.THFONT,D:'####.#...##...##...##...##...#####.',L:'#....#....#....#....#....#....#####'};
  const word=(s,c0,z0,k)=>(c,z)=>{ const i=Math.floor((c-c0)/k), r=6-Math.floor((z-z0)/k); if(c<c0||z<z0||i>=s.length*6-1||r<0||r>6)return false; const q=i%6, g=FONT[s[Math.floor(i/6)]]; return q<5&&!!g&&g[r*5+q]==='#'; };
  const neon=(on,c,z,k,col,f)=>{ if(on(c,z))return lit(col); for(const [a,b] of [[-k,0],[k,0],[0,-k],[0,k]])if(on(c+a,z+b))return sh(col,.42*f); return null; };
  const unplace=n=>{ const i=STORE.places.findIndex(p=>p[0]===n); if(i>=0)STORE.places.splice(i,1); }, door=(k,f)=>{ const T=TURN(lot(k),WP[k].face), L=T.L, u=L.x0+f(L), a=T.pt(u,L.y1+2.2/BLDK), b=T.pt(u,L.y1); return [X(a[0]),Z(a[1]),X(b[0]),Z(b[1]),T.hd(0)]; };
  const MS=STORE.main={lot,word,neon,unplace,doors:[['THE MOVIE THEATRE',...door('theatre',()=>4.4)],['THE ARCADE',...door('arcade',L=>(L.x1-L.x0)/2)],['THE PLAYHOUSE',...door('play',L=>(L.x1-L.x0)/2)]]};

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

  STEPS.push(()=>{ const LW=lot('play',190), TP=TURN(LW,WP.play.face), OX=TP.q?760-TP.cx:0, B=TP.q?{...TP.L,x0:TP.L.x0+OX,x1:TP.L.x1+OX}:LW, cx=(B.x0+B.x1)/2, cy=(B.y0+B.y1)/2, P=PY.PLAYK(B), mx=x=>2*cx-x, my=y=>2*cy-y, L=[];
    const out=(nx,ny,Xw,Yw,z,f,cap)=>{ if(ny>0){ const c=P.playFront(Xw,z,f); if(c)return c; } return facade(nx,ny,Xw,Yw,z,f,cap,[118,50,44]); };
    const R=room('playhouse','PLAYHOUSE',B,{floor:(x,y)=>P.playFloorCol(mx(x),y),in:(q,nx,ny,X_,Y_,z,f)=>P.playWall(q,-nx,-ny,mx(X_),my(Y_),z,f),out,cope:[226,214,186]},{w:'f',a:cx,wd:1.56,h:94},(B_,l0)=>{
      const n0=PROPS.length, S=P.PLS, lam=(k,x,y,z,r,c)=>{ const l={x,y,z,r,c}; LAMPS.push(l); L.push([k,l,null]); };
      P.props();
      for(const s of [-1,1]){ lam('house',P.PLMID+s*2.4,S.SY-3.2,110,7,[1,.86,.62]); lam('wall',s<0?B.x0+T+.35:B.x1-T-.35,S.SY-3.1,68,3.2,[.8,.52,.26]); lam('front',P.PLMID+s*1.3,B.y0-.9,74,4,[1.1,.9,.62]); }
      lam('lobby',P.PLMID,B.y0+.8,90,4.5,[1,.86,.62]);
      LAMPS.push({x:S.SPOT[0],y:S.SPOT[1],z:S.SZ+66,r:3.4,c:[1.25,1.14,.92]});
      turn(B,n0,l0); });
    if(TP.q){ const L=TP.L, br=[118,50,44], fc=(nx,ny,u,z,f)=>facade(nx,ny,u,u,z,f,B.h,br);
      BLOCKS.make({...LW,z0:0,z1:B.h,kind:'Rplayhouse',turn:TP,roof:()=>[58,57,57],paint:(sd,u,z,f)=>sd==='f'?(P.playFront(u+OX,z,f)||fc(0,1,u,z,f)):fc(sd==='w'||sd==='e'?1:0,sd==='f'||sd==='b'?1:0,u,z,f)});
      { const a=X(LW.x0), b=X(LW.x1), c=Z(LW.y0), d=Z(LW.y1); SOL.up.push([Math.min(a,b),Math.min(c,d),Math.max(a,b),Math.max(c,d)]); FIX.up.push([Math.min(a,b),Math.min(c,d),0,Math.max(a,b),Math.max(c,d),Y(B.h)]); }
      const m=(L.x0+L.x1)/2; STORE.streetDoor.playhouse={door:TP.pt(m,L.y1+.35),out:[...TP.pt(m,L.y1+1.4),TP.hd(0)]};
      STORE.bound.x1=Math.max(STORE.bound.x1,X(B.x1+20)); STORE.bound.z0=Math.min(STORE.bound.z0,Z(B.y0-6)); STORE.bound.z1=Math.max(STORE.bound.z1,Z(B.y1+6)); }
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
    const rig=()=>{ '@later'; const S=P.PLS, H=B.h, g=new THREE.Group(), V=(x,y,z)=>new THREE.Vector3(X(x),Y(z),Z(y)), col=(r,g_,b)=>new THREE.Color().setRGB(r/255,g_/255,b/255,THREE.SRGBColorSpace);
      const drape=(yw,s,x0,x1,z0,gaps,nz)=>{ const pts=[], cs=[], tri=(a,b,c,k)=>{ for(const q of [a,b,c]){ pts.push(q.x,q.y,q.z); cs.push(k.r,k.g,k.b); } }, quad=(a,b,c,d,k)=>{ tri(a,b,c,k); tri(a,c,d,k); };
        const A=col(124,20,36), Bc=col(84,10,24), Rv=col(110,16,30), Gd=col(196,156,70), p=.36, zt=H-28;
        let x=x0, k=0; while(x<x1-.01){ const xn=Math.min(x1,x+p/2), m=(x+xn)/2; if(!gaps.some(([a,b])=>m>a&&m<b)){ const d0=k%2?.2:.04, d1=k%2?.04:.2, f0=k%2?.3:.06, f1=k%2?.06:.3;
          quad(V(x,yw+s*f0,z0),V(xn,yw+s*f1,z0),V(xn,yw+s*d1,zt),V(x,yw+s*d0,zt),k%2?Bc:A); } x=xn; k++; }
        const box=(xa,xb,ya,yb,za,zb,c)=>{ const p8=[[xa,ya],[xb,ya],[xb,yb],[xa,yb]]; for(let i=0;i<4;i++){ const [u0,v0]=p8[i], [u1,v1]=p8[(i+1)%4]; quad(V(u0,v0,za),V(u1,v1,za),V(u1,v1,zb),V(u0,v0,zb),c); } quad(V(xa,ya,za),V(xb,ya,za),V(xb,yb,za),V(xa,yb,za),c); };
        const ya=yw, yb=yw+s*.34; box(x0,x1,Math.min(ya,yb),Math.max(ya,yb),zt-6,H-4,Rv); box(x0,x1,Math.min(ya,yb+s*.02),Math.max(ya,yb+s*.02),zt-6,zt-3,Gd);
        const ge=new THREE.BufferGeometry(); ge.setAttribute('position',new THREE.Float32BufferAttribute(pts,3)); ge.setAttribute('color',new THREE.Float32BufferAttribute(cs,3)); ge.computeVertexNormals();
        const pl=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6), me=new THREE.Mesh(ge,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide,clippingPlanes:[pl]})); me.receiveShadow=true; g.add(me);
        cutWalls.push({pl,nx:0,nz,foot:Y(8),me,when:()=>R.inside(pos.x,pos.z)}); return pts.length/9; };
      const t0=drape(B.y0+.1,1,B.x0+.1,B.x1-.1,S.SZ,[],1)+drape(B.y1-.1,-1,B.x0+.1,B.x1-.1,0,[[cx-.95,cx+.95]],-1);
      const pc=[mx(S.SPOT[0]),my(S.SPOT[1])], fy=my(S.SY-1.2), fz=H-22, F=V(cx,fy,fz), Q=V(pc[0],pc[1],S.SZ), dir=Q.clone().sub(F).normalize(), up=new THREE.Vector3(0,1,0), dk=new THREE.MeshLambertMaterial({color:0x221e1c});
      const pipe=new THREE.Mesh(new THREE.BoxGeometry(Math.abs(X(B.x1-.1)-X(B.x0+.1)),Y(3)-Y(0),Math.abs(Z(.1)-Z(0))),dk); pipe.position.copy(V(cx,fy-.25,H-12)); g.add(pipe);
      const hang=new THREE.Mesh(new THREE.BoxGeometry(Y(2)-Y(0),Y(10)-Y(0),Y(2)-Y(0)),dk); hang.position.copy(V(cx,fy-.25,H-17)); g.add(hang);
      const L=Y(22)-Y(0), can=new THREE.Mesh(new THREE.CylinderGeometry(Y(7)-Y(0),Y(5.5)-Y(0),L,8),dk); can.quaternion.setFromUnitVectors(up,dir); can.position.copy(F).addScaledVector(dir,-L/2); g.add(can);
      const lens=new THREE.Mesh(new THREE.CircleGeometry(Y(6)-Y(0),8),new THREE.MeshBasicMaterial({color:0xfff0c8})); lens.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),dir); lens.position.copy(F).addScaledVector(dir,.002); g.add(lens);
      const add=(o,a)=>new THREE.MeshBasicMaterial({color:new THREE.Color(1,.9,.66),transparent:true,opacity:o,depthWrite:false,blending:THREE.AdditiveBlending,side:a?THREE.DoubleSide:THREE.FrontSide,polygonOffset:true,polygonOffsetFactor:-2});
      const ring=(r,z)=>{ const o=[]; for(let i=0;i<=20;i++){ const a=i/20*Math.PI*2; o.push(V(pc[0]+Math.cos(a)*r,pc[1]+Math.sin(a)*r,z)); } return o; };
      const fan=(c,rg)=>{ const a=[]; for(let i=0;i<20;i++)a.push(c.x,c.y,c.z,rg[i+1].x,rg[i+1].y,rg[i+1].z,rg[i].x,rg[i].y,rg[i].z); const ge=new THREE.BufferGeometry(); ge.setAttribute('position',new THREE.Float32BufferAttribute(a,3)); return ge; };
      const r0=S.SPOT[2], beam=new THREE.Mesh(fan(F,ring(r0,S.SZ+.3)),add(.07,1)), pool=new THREE.Mesh(fan(V(pc[0],pc[1],S.SZ+.3),ring(r0,S.SZ+.3)),add(.2)), core=new THREE.Mesh(fan(V(pc[0],pc[1],S.SZ+.4),ring(r0*.62,S.SZ+.4)),add(.16));
      for(const m of [pool,core])m.renderOrder=2; beam.renderOrder=3; g.add(beam,pool,core); scene.add(g); MS.play.spot=[beam,pool,core];
      MS.play.rigN=t0; };
    unplace('PLAYHOUSE'); MS.play={R,P,B,cx,cy,mx,my,L,SETM,fog,SH:{t0:null,cue:null,set:null,lv:-1,from:null,to:null,tc:0,step:-1,last:-1,cap:''},FIG:{},hound:null,up:0}; { const I=STORE.inside.playhouse; if(I){ const go=I.go; I.go=()=>{ go(); rig(); }; } else rig(); } });


  STEPS.push(()=>{ const V=new THREE.Vector3(), MAT={}, mat=c=>MAT[c]||(MAT[c]=new THREE.MeshLambertMaterial({color:new THREE.Color(c)}));
    const KINDS={holmes:'hero_m',watson:'villager_m',mortimer:'villager_m',henry:'hero_m',stapleton:'hero_m',barrymore:'villager_m'}, CLIP={wave:'cheer_idle_a',crouch:'sit_floor_idle_a',fall:'sit_floor_idle_a',block:'found_item_idle_a'};
    const HAT={top:[.1,.065,.12],bowler:[.095,.065,.06],deerstalker:[.085,.066,.065],wide:[.125,.066,.05],straw:[.115,.068,.035]}, rgb=h=>{ const v=parseInt(h.slice(1),16); return [v>>16&255,v>>8&255,v&255]; };
    const dress=(N,L)=>N.g.traverse(m=>{ const g=m.isMesh&&m.geometry; if(!g||!g.attributes.reg)return; const c=g.attributes.color.array, R=g.attributes.reg.array, P=g.attributes.position.array, n=R.length, S={}; let y0=1e9, y1=-1e9;
      for(let i=0;i<n;i++){ const y=P[i*3+1]; y0=Math.min(y0,y); y1=Math.max(y1,y); const s=S[R[i]]||(S[R[i]]=[0,0,0,0,0]); s[0]+=c[i*3]; s[1]+=c[i*3+1]; s[2]+=c[i*3+2]; s[3]+=y; s[4]++; }
      for(const r in S){ const s=S[r], a=s[0]/s[4], b=s[1]/s[4], d=s[2]/s[4], h=(s[3]/s[4]-y0)/(y1-y0); s.l=a*.3+b*.59+d*.11; s.k=a>107&&a>b&&b>d&&a-d>30&&b/a>.55&&b/a<.92?null:h<.1?'shoes':h<.45?'pants':h>.8?'hair':'shirt'; }
      for(let i=0;i<n;i++){ const s=S[R[i]]; if(!s.k)continue; const q=rgb(L[s.k]), f=.65+.35*Math.min(1.6,(c[i*3]*.3+c[i*3+1]*.59+c[i*3+2]*.11)/(s.l||1)); for(let j=0;j<3;j++)c[i*3+j]=Math.min(255,q[j]*f); }
      g.attributes.color.needsUpdate=true; });
    const hold={free:()=>true,roam:false,brain:(dt,you,st)=>{ st.to=null; st.hold=true; }};
    const mkFig=(w,M)=>{ '@later'; const C=PY.PLAY.cast[w], N=window.PAWNNEW&&PAWNNEW(KINDS[w],'play_'+w,{npc:{...hold,x:X(M.cx),z:Z(M.cy),ground:()=>Y(M.P.PLS.SZ)}}); if(!N)return null;
      dress(N,C.look); N.walker={talk:true}; let head=null; N.g.traverse(b=>{ if(b.isBone&&b.name==='DEF_head')head=b; });
      const h=HAT[C.hat], H=N.H||TILE*2.4, hat=new THREE.Group(); if(h){ const m=mat(C.hatC); hat.add(new THREE.Mesh(new THREE.CylinderGeometry(h[0]*H,h[0]*H,.012*H,12),m),new THREE.Mesh(new THREE.CylinderGeometry(h[1]*H*(C.hat==='bowler'?.85:1),h[1]*H,h[2]*H,12).translate(0,h[2]*H/2,0),m)); hat.traverse(o=>o.castShadow=true); }
      hat.visible=false; scene.add(hat); return {N,head,hat,H,hd:null}; };
    const mkHound=M=>{ '@later'; const N=window.CREATNEW&&CREATNEW('Rat','hound',.8,{paint:g=>{ const c=g.attributes.color.array, R=g.attributes.reg.array; for(let i=0;i<R.length;i++)for(let j=0;j<3;j++)c[i*3+j]=R[i]?[150,230,100][j]:Math.min(255,c[i*3+j]*.16+8); return g; },
      npc:{...hold,x:X(M.cx),z:Z(M.cy),eye:1,eyeC:'.7,1.,.45',ground:()=>Y(M.P.PLS.SZ+(M.up||0))}}); if(N)N.g.visible=false; return N; };
    const cap=document.createElement('div'); cap.id='plcap'; cap.style.cssText='position:fixed;left:50%;bottom:9%;transform:translateX(-50%);max-width:min(70ch,90vw);padding:6px 12px;background:rgba(8,6,10,.78);color:#f0e4c4;font:14px/1.4 monospace;letter-spacing:1px;text-align:center;pointer-events:none;z-index:40;display:none'; document.body.appendChild(cap);
    const SFXK={knock:'door',door:'creak',howlfar:'bark',howlnear:'bark',snarl:'bark',paws:'step',mire:'drip',splash:'drip',owl:'chirp',sting:'boom',bell:'latch'};
    const recOf=l=>{ const x=X(l.x), y=Y(l.z), z=Z(l.y); return LITE.recs.find(L=>Math.abs(L.position.x-x)+Math.abs(L.position.y-y)+Math.abs(L.position.z-z)<1e-3)||null; };
    const cue=(M,cu,set,lv,now)=>{ '@later'; const S=M.SH, C=PY.PLCUE;
      if(cu!==S.cue||set!==S.set||lv!==S.lv){ const fade=cu!==S.cue||set!==S.set; S.from=fade?S.to:null; S.cue=cu; S.set=set; S.lv=lv; S.tc=now; S.step=-1; S.to={};
        for(const k of ['house','lobby','wall','candle','prac']){ const c=C[cu][k]||[0,0,0], m=k==='candle'?.15+.85*lv:k==='prac'?lv:1; S.to[k]=k==='prac'&&!M.P.PLPRAC[set]?[0,0,0]:c.map(v=>v*m); }
        const p=M.P.PLPRAC[set]; if(p)for(const e of M.L)if(e[0]==='prac'&&e[2])e[2].position.set(X(M.mx(p[0])),Y(p[2]),Z(M.my(p[1]))); }
      const k=Math.min(1,(now-S.tc)/1500), step=S.from?Math.round(k*5):5; if(step===S.step)return; S.step=step;
      for(const [g,l,L] of M.L){ if(g==='front'||!L)continue; const a=S.from&&S.from[g]||S.to[g], b=S.to[g], c=a.map((v,i)=>v+(b[i]-v)*step/5), cm=Math.max(...c); if(cm>0)L.color.setRGB(c[0]/cm,c[1]/cm,c[2]/cm); L.intensity=cm>0?7*cm*Math.min(1.2,l.r/5):0; } };
    const show=(dt,now)=>{ const M=MS.play; if(!M||!M.P)return; const {R,P,SH}=M, inside=SHARED.LVL==='up'&&R.inside(pos.x,pos.z), LL=PY.PLL;
      if(M.spot)for(const m of M.spot)m.visible=inside;
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
    const film=now=>{ const M=MS.theatre; if(!M)return; const near=SHARED.LVL==='up'&&(M.R.inside(pos.x,pos.z)||Math.hypot(pos.x-M.R.at.x,pos.z-M.R.at.z)<6*TILE); M.fm.visible=near; if(!near)return;
      const k=Math.floor(now/125)%TH.FILMN; if(k===M.k)return; M.k=k; const f=TH.filmFrame(k), d=M.tx.image.data, W=TH.FILMW, Hh=TH.FILMH;
      for(let j=0;j<Hh;j++)for(let i=0;i<W;i++){ const s=(j*W+i)*3, o=((Hh-1-j)*W+i)*4; d[o]=f[s]; d[o+1]=f[s+1]; d[o+2]=f[s+2]; d[o+3]=255; } M.tx.needsUpdate=true; };
    const lane=()=>{ if(MS.laned||!BLK.lane||!STORE.meshes)return; const ms=new Set(); for(const id of ['theatre','arcade','playhouse'])for(const w of ['f','b','w','e','lobby'])for(const me of BATCH.all(STORE.meshes,'W'+id+':'+w))ms.add(me); if(!ms.size)return; MS.laned=1;
      for(const w of cutWalls){ if(!ms.has(w.me))continue; const wh=w.when, al=Object.getOwnPropertyDescriptor(w,'always'), was=al?(al.get?()=>al.get.call(w):()=>al.value):()=>false;
        w.when=()=>BLK.lane()||(wh?wh():true); Object.defineProperty(w,'always',{get:()=>BLK.lane()||was(),configurable:true}); } };
    let t0=performance.now(); SYS.add('places',(dt)=>{ const now=performance.now(), d=Math.min(.25,(now-t0)/1000); t0=now; lane(); film(now); show(d,now); },'059-street');
    window.MAINDBG=()=>({rooms:STORE.rooms.filter(r=>['theatre','arcade','playhouse','holodeck'].includes(r.id)).map(r=>[r.id,+r.x0.toFixed(1),+r.z0.toFixed(1),+r.x1.toFixed(1),+r.z1.toFixed(1)]),play:MS.play&&{t0:MS.play.SH.t0,cue:MS.play.SH.cue,lights:MS.play.L.map(e=>[e[0],!!e[2]]),sets:Object.keys(MS.play.SETM)},laned:!!MS.laned,tris:(()=>{ const C={}; for(const o of OBJS){ const m=/^store:(theatre|arcade|playhouse|holodeck)/.exec(o.id||''); if(m)C[m[1]]=(C[m[1]]||0)+o.parts.length*2; }
      for(const k in STORE.meshes){ const m=/^[WR](theatre|arcade|playhouse|holodeck)/.exec(k)||/^P(set)/.exec(k); if(m)C[m[1]]=(C[m[1]]||0)+STORE.meshes[k].geometry.attributes.position.count/3; } return C; })(),lamps:MS.lamps}); });
});
