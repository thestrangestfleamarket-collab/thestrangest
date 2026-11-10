// THE SQUIRREL'S TOWER: GTOWER builds the tall round tower beside the golems' cave.
import {SHARED, THREE} from './003-shx.js';
import {BATCH, PARK} from './003b-systems.js';
import {FIX, LEVEL, MAPG, SOL, SYS, TILE} from './006-map-pre.js';
import {OBJ} from './008-batch.js';
import {GCAVE} from './060-cave.js';
const GTOWER={}; window.GTOWER=GTOWER;
{ const H=173, PH=4, MH=8, TH=212, TC=58, R=1.5, RB=R+.1, RI=R-.06, TA=-Math.PI*.75, TD=R+.22, TR=.46;
  GTOWER.ring=()=>{ const S=GCAVE.S; if(!S)return null; const t=S.tw, P=PARK; return {cx:t.x,cy:t.y,R,RI,TA,X:x=>SHARED.BOD.XS(x+P.ox),Z:y=>SHARED.BOD.ZS(y+P.oy)}; };
  GTOWER.site=()=>{ const S=GCAVE.S; if(!S)return null; const P=PARK, t=S.tw; return {x:SHARED.BOD.XS(t.x+P.ox),z:SHARED.BOD.ZS(t.y+P.oy),w:2*RB*TILE,d:2*RB*TILE,r:RI*TILE,top:SHARED.BOD.YS(H)}; };
  const build=(t=GCAVE.S.tw)=>{ const P=PARK, X=x=>SHARED.BOD.XS(x+P.ox), Z=y=>SHARED.BOD.ZS(y+P.oy), Y=SHARED.BOD.YS, {bq,faceTex,C}=SHARED.BOD, K=SHARED.BOD.STOREK.keep, sh=SHARED.BOD.K.sh, cx=t.x, cy=t.y;
    const KB={x0:426,x1:435.5,y0:-86,y1:-77,h:520}, lum=c=>c[0]+c[1]+c[2], TRIM=[184,174,150], TRD=[150,140,120];
    const paint=(face,u,z,cap=520)=>{ let best=null; for(let k=0;k<3;k++){ const U=(u*3+k)/24, Zb=z*3+k, nx=face==='l'?-1:face==='r'?1:0, ny=face==='f'?1:face==='b'?-1:0;
        const c=K.keepOutWall(KB,nx,ny,nx?(nx<0?KB.x0:KB.x1):KB.x0+U,ny?(ny>0?KB.y1:KB.y0):KB.y0+U,Zb,1,cap); if(!best||lum(c)<lum(best))best=c; } return best; };
    const FACES=[['r',0,1,72],['f',Math.PI/2,-1,76],['l',Math.PI,-1,72],['b',-Math.PI/2,1,76]];
    const brick=(a,z,cap,sc=1)=>{ const w=((a%(2*Math.PI))+3*Math.PI)%(2*Math.PI)-Math.PI; let F=FACES[0], bd=9; for(const f of FACES){ const d=Math.abs(((w-f[1]+3*Math.PI)%(2*Math.PI))-Math.PI); if(d<bd){ bd=d; F=f; } }
      const dd=((w-F[1]+3*Math.PI)%(2*Math.PI))-Math.PI, tt=.5+F[2]*dd/(Math.PI/2)*sc; return paint(F[0],Math.max(0,Math.min(F[3]-.01,tt*F[3])),z,cap); };
    const pt=(ox,oy,r,a,z)=>[X(ox+Math.cos(a)*r),Y(z),Z(oy+Math.sin(a)*r)];
    const ring=(ox,oy,r,z0,z1,n,col,a0=0,a1=2*Math.PI,skip)=>{ for(let i=0;i<n;i++){ if(skip&&skip(i))continue; const aa=a0+(a1-a0)*i/n, ab=a0+(a1-a0)*(i+1)/n, w=Math.max(1,(ab-aa)*r*24), hh=z1-z0;
        bq(pt(ox,oy,r,aa,z0),pt(ox,oy,r,ab,z0),pt(ox,oy,r,ab,z1),pt(ox,oy,r,aa,z1),faceTex(w,hh,(i2,j)=>C(col(aa+(ab-aa)*(i2+.5)/Math.max(1,Math.round(w)),z1-(j+.5)*hh/Math.max(1,Math.round(hh))))),'G'); } };
    const annul=(ox,oy,r0,r1,z,n,col,skip)=>{ for(let i=0;i<n;i++){ if(skip&&skip(i))continue; const aa=i/n*2*Math.PI, ab=(i+1)/n*2*Math.PI, w=Math.max(1,(ab-aa)*r1*24), d=Math.max(1,(r1-r0)*24);
        bq(pt(ox,oy,r0,aa,z),pt(ox,oy,r0,ab,z),pt(ox,oy,r1,ab,z),pt(ox,oy,r1,aa,z),faceTex(w,d,()=>C(col)),'G'); } };
    const cone=(ox,oy,r,z0,z1,n,col)=>{ for(let i=0;i<n;i++){ const aa=i/n*2*Math.PI, ab=(i+1)/n*2*Math.PI, w=Math.max(2,(ab-aa)*r*24), L=Math.hypot(r*24,z1-z0);
        bq(pt(ox,oy,r,aa,z0),pt(ox,oy,r,ab,z0),pt(ox,oy,0,ab,z1),pt(ox,oy,0,aa,z1),faceTex(w,L,(i2,j)=>C(col(i2,j,i))),'G'); } };
    BATCH.tag=OBJ('park','the squirrel\'s tower');
    const N=32, mer=i=>i&1;
    ring(cx,cy,R,0,H-14,N,(a,z)=>brick(a,z,520));
    ring(cx,cy,RB,H-14,H+PH,N,(a,z)=>z<H-11?(z<H-12.5?TRD:TRIM):z>=H+PH-2?TRIM:brick(a,z+14,9999));
    ring(cx,cy,RI,H,H+PH,N,(a,z)=>z>=H+PH-2?TRIM:brick(a+Math.PI,z+40,9999));
    annul(cx,cy,RI,RB,H+PH,N,TRIM,i=>!mer(i));
    ring(cx,cy,RB,H+PH,H+PH+MH,N,(a,z)=>z>=H+PH+MH-2?TRIM:brick(a,z+14,9999),0,2*Math.PI,i=>!mer(i));
    ring(cx,cy,RI,H+PH,H+PH+MH,N,(a,z)=>z>=H+PH+MH-2?TRIM:brick(a+Math.PI,z+40,9999),0,2*Math.PI,i=>!mer(i));
    annul(cx,cy,RI,RB,H+PH+MH,N,TRIM,i=>mer(i));
    for(let i=0;i<N;i++){ if(!mer(i))continue; for(const a of [i/N*2*Math.PI,(i+1)/N*2*Math.PI]){ const w=(RB-RI)*24;
      bq(pt(cx,cy,RI,a,H+PH),pt(cx,cy,RB,a,H+PH),pt(cx,cy,RB,a,H+PH+MH),pt(cx,cy,RI,a,H+PH+MH),faceTex(w,MH,(i2,j)=>C(j<2?TRIM:TRD)),'G'); } }
    { const S=Math.round(2*RI*24), hx=0, hy=.35; bq([X(cx-RI),Y(H),Z(cy+RI)],[X(cx+RI),Y(H),Z(cy+RI)],[X(cx+RI),Y(H),Z(cy-RI)],[X(cx-RI),Y(H),Z(cy-RI)],faceTex(S,S,(i,j)=>{ const x=-RI+(i+.5)/24, y=RI-(j+.5)/24, q=Math.hypot(x,y);
        if(q>RI)return null; if(Math.abs(x-hx)<.24&&Math.abs(y-hy)<.2)return Math.abs(x-hx)>.2||Math.abs(y-hy)>.16?[60,44,30]:(Math.floor((x-hx+.24)*24)%4===0?[88,62,40]:[112,80,52]);
        const ri=Math.floor(q*24/5), sg=Math.floor((Math.atan2(y,x)+Math.PI)*(ri+2)*1.3); return q*24%5<.8?[70,72,78]:(sg+ri)%3===0?[90,92,96]:[82,84,88]; }),'G'); }
    const tx=cx+Math.cos(TA)*TD, ty=cy+Math.sin(TA)*TD, TN=12;
    ring(tx,ty,TR,0,TH-12,TN,(a,z)=>brick(a,z,9999,.5));
    ring(tx,ty,TR+.07,TH-12,TH,TN,(a,z)=>z<TH-9?TRD:z>=TH-2?TRIM:brick(a,z+40,9999,.5));
    cone(tx,ty,TR+.14,TH,TH+TC,TN,(i,j,s)=>(s&1)?(j%6<1?[64,66,72]:[82,84,88]):(j%6<1?[70,72,78]:[90,92,96]));
    BATCH.tag=null;
    BATCH.cast=true; BATCH.build((k,map,emap)=>new THREE.MeshLambertMaterial({map,alphaTest:.5,side:THREE.DoubleSide})); BATCH.cast=false;
    const Ms=BATCH.meshes||{}; BATCH.meshes={}; for(const me of Object.values(Ms)){ MAPG.parkwall.add(me); GTOWER.me=me; GTOWER.tris=me.geometry.attributes.position.count/3; }
    const sol=(a0,b0,a1,b1,h)=>{ SOL.up.push([X(a0),Z(b0),X(a1),Z(b1)]); FIX.up.push([X(a0),Z(b0),0,X(a1),Z(b1),Y(h)]); };
    const q=RB*.72; sol(cx-q,cy-RB,cx+q,cy+RB,H+PH); sol(cx-RB,cy-q,cx+RB,cy+q,H+PH); sol(tx-TR,ty-TR,tx+TR,ty+TR,TH); GTOWER.ready=true; };
  const go=()=>{ if(!SYS.started||typeof GCAVE==='undefined'||!GCAVE.S||!MAPG.parkwall)return setTimeout(go,400); setTimeout(()=>{ try{ build(); const PP=LEVEL.parkPlaces||{}; for(const k of ['tower2','tower3'])if(PP[k])build({x:PP[k].x,y:PP[k].y}); }catch(e){ console.warn('TOWER: not built',e); } },600); };   // more towers stand where world.json puts them (the park's borders)
  go(); }
export {GTOWER};
