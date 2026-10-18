const GTOWER={}; window.GTOWER=GTOWER;
{ const H=173, TH=192, PH=12;
  GTOWER.site=()=>{ const S=GCAVE.S; if(!S)return null; const P=PARK, t=S.tw; return {x:BOD.XS(t.x+P.ox),z:BOD.ZS(t.y+P.oy),w:t.w*TILE,d:t.d*TILE,top:BOD.YS(H)}; };
  const build=()=>{ const P=PARK, t=GCAVE.S.tw, X=x=>BOD.XS(x+P.ox), Z=y=>BOD.ZS(y+P.oy), Y=BOD.YS, {bq,faceTex,C}=BOD, K=BOD.STOREK.keep, sh=BOD.K.sh;
    const x0=t.x-t.w/2, x1=t.x+t.w/2, y0=t.y-t.d/2, y1=t.y+t.d/2;
    const KB={x0:426,x1:435.5,y0:-86,y1:-77,h:520}, lum=c=>c[0]+c[1]+c[2];
    const paint=(face,u,z,cap=520)=>{ let best=null; for(let k=0;k<3;k++){ const U=(u*3+k)/24, Zb=z*3+k, nx=face==='l'?-1:face==='r'?1:0, ny=face==='f'?1:face==='b'?-1:0;
        const c=K.keepOutWall(KB,nx,ny,nx?(nx<0?KB.x0:KB.x1):KB.x0+U,ny?(ny>0?KB.y1:KB.y0):KB.y0+U,Zb,1,cap); if(!best||lum(c)<lum(best))best=c; } return best; };
    const lead=(i,j)=>{ const n=Math.sin(i*12.9898+j*78.233)*43758.5453%1; return Math.abs(n)<.3?[74,76,80]:Math.abs(n)>.8?[90,92,96]:[82,84,88]; };
        const box=(a0,b0,a1,b1,z0,z1,top,cap,off=[0,0])=>{ const [A,Bx,Cz,D]=[X(a0),X(a1),Z(b0),Z(b1)], [e,f]=[Y(z0),Y(z1)], W=(a1-a0)*24, Dp=(b1-b0)*24, Hh=z1-z0;
      const tex=(w,face,u0)=>faceTex(w,Hh,(i,j)=>C(paint(face,u0+i+.5,z1-j-.5,cap)));
      bq([A,e,Cz],[Bx,e,Cz],[Bx,f,Cz],[A,f,Cz],tex(W,'b',off[0]),'G');
      bq([Bx,e,D],[A,e,D],[A,f,D],[Bx,f,D],tex(W,'f',off[0]),'G');
      bq([A,e,D],[A,e,Cz],[A,f,Cz],[A,f,D],tex(Dp,'l',off[1]),'G');
      bq([Bx,e,Cz],[Bx,e,D],[Bx,f,D],[Bx,f,Cz],tex(Dp,'r',off[1]),'G');
      bq([A,f,D],[Bx,f,D],[Bx,f,Cz],[A,f,Cz],faceTex(W,Dp,(i,j)=>C(top(i,j))),'G'); };
    const trim=()=>[184,174,150];
    BATCH.tag=OBJ('park','the squirrel\'s tower');
    box(x0,y0,x1,y1,0,H,lead,520,[0,0]);
    const TW=.62, TO=.18; for(const [cx,cy] of [[x0,y0],[x1,y0],[x0,y1],[x1,y1]]){ const a=cx-TW/2+(cx===x0?-TO:TO), b=cy-TW/2+(cy===y0?-TO:TO);
      box(a,b,a+TW,b+TW,0,TH,trim,600,[cx===x0?0:(x1-x0)*24-TW*24,cy===y0?0:(y1-y0)*24-TW*24]);
      for(const [mx,my] of [[a,b],[a+TW-.18,b],[a,b+TW-.18],[a+TW-.18,b+TW-.18]])box(mx,my,mx+.18,my+.18,TH,TH+PH,trim,TH+PH+4); }
    const M=.2, G=.42; for(let x=x0+TW*.6;x<x1-TW*.6-M;x+=G){ box(x,y0,x+M,y0+.16,H,H+PH,trim,H+PH+4); box(x,y1-.16,x+M,y1,H,H+PH,trim,H+PH+4); }
    for(let y=y0+TW*.6;y<y1-TW*.6-M;y+=G){ box(x0,y,x0+.16,y+M,H,H+PH,trim,H+PH+4); box(x1-.16,y,x1,y+M,H,H+PH,trim,H+PH+4); }
    BATCH.tag=null;
    BATCH.cast=true; BATCH.build((k,map,emap)=>new THREE.MeshLambertMaterial({map,alphaTest:.5,side:THREE.DoubleSide})); BATCH.cast=false;
    const Ms=BATCH.meshes||{}; BATCH.meshes={}; for(const me of Object.values(Ms)){ if(MAPG.park)MAPG.park.add(me); GTOWER.me=me; }
    const sol=(a0,b0,a1,b1,h)=>{ SOL.up.push([X(a0),Z(b0),X(a1),Z(b1)]); FIX.up.push([X(a0),Z(b0),0,X(a1),Z(b1),Y(h)]); };
    sol(x0-TO,y0-TO,x1+TO,y1+TO,TH); GTOWER.ready=true; };
  const go=()=>{ if(!window.__started||typeof GCAVE==='undefined'||!GCAVE.S||!PARK.fire)return setTimeout(go,400); setTimeout(()=>{ try{ build(); }catch(e){ console.warn('TOWER: not built',e); } },600); };
  go(); }
