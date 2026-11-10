// BLOCKS: a building's outside as one painted block (four walls and a roof, each one low-res picture painted once) and the painters its faces share: brick, windows, flower boxes, ivy, doors, plant cards.
import {SHARED} from './003-shx.js';
import {BRICKS} from './014-gamekit.js';
const BLOCKS={PX:12};
{ const hs=(a,b,c)=>SHARED.BOD.g.hash(a,b,c), sh=(c,f)=>SHARED.BOD.K.sh(c,f), md=(p,n)=>((p%n)+n)%n;
  const vn=(u,v,k)=>{ const i=Math.floor(u), j=Math.floor(v), q=t=>t*t*(3-2*t), a=q(u-i), b=q(v-j), h=(x,y)=>hs(x,y,k); return (h(i,j)+(h(i+1,j)-h(i,j))*a)*(1-b)+(h(i,j+1)+(h(i+1,j+1)-h(i,j+1))*a)*b; };
  BLOCKS.vn=vn;
  BLOCKS.brick=(c=[138,60,44],mo=[172,160,146])=>Object.assign((u,z,f)=>{ const k=Math.floor(z/6), p=Math.floor(u*BLOCKS.PX)+(k&1)*4, pm=md(p,8);
    if(md(z,6)<2||pm<1)return sh(mo,f*.9); const bi=Math.floor(p/8), n=hs(bi,k,19), tn=BRICKS.TINT[Math.floor(hs(bi,k,23)*BRICKS.TINT.length)];
    return sh([c[0]*tn[0],c[1]*tn[1],c[2]*tn[2]],f*(.88+.2*n)*(hs(bi,k,29)<.06?.82:1)); },{c});
  BLOCKS.stone=(c=[150,144,132])=>(u,z,f)=>{ const k=Math.floor(z/14), p=u*BLOCKS.PX+(k&1)*5, pm=md(p,10); if(md(z,14)<2||pm<1)return sh(c,f*.7); return sh(c,f*(.92+.14*hs(Math.floor(p/10),k,61))); };
  const IVC=[[46,78,36],[66,108,44],[92,136,56]], FLC=[[214,46,52],[236,120,160],[246,206,64],[240,240,232],[150,90,190],[246,140,48]];
  BLOCKS.ivy=(u,z,P)=>{ const x=Math.floor(u*BLOCKS.PX), y=Math.floor(z/2), top=P.h*(.35+.65*vn(x/9,P.seed,131))*(P.a1-P.a0>0?Math.min(1,Math.min(u-P.a0,P.a1-u)/(P.fall||1.2)+.25):1);
    if(z>top||u<P.a0||u>P.a1)return null; const n=hs(x,y,P.seed), edge=top-z<10; if(n>(edge?.45:.8)&&!(md(x+Math.floor(y/3),5)===0&&n<.9))return null;
    const t=hs(x,y,P.seed+3); return IVC[t<.3?0:t<.72?1:2]; };
  BLOCKS.flowers=(u,z,W,seed)=>{ const x=Math.floor(u*BLOCKS.PX), y=Math.floor(z/2), n=hs(x,y,seed), c=FLC[Math.floor(hs(Math.floor(x/2),Math.floor(y/2),seed+1)*FLC.length)]; if(n<.25)return null; if(n>.55)return c; return IVC[n>.42?2:1]; };
  const winT=new Map();
  const wtex=(w,px)=>{ const W=Math.max(4,Math.round((w.a1-w.a0)*px)), H=Math.max(4,Math.round((w.z1-w.z0)*px/24)), k=W+','+H+','+(w.lit?1:0)+','+w.seed+','+(w.door?1:0);
    let t=winT.get(k); if(!t){ t=SHARED.BOD.windowTex(W,H,!!w.lit,w.seed|0,!!w.door); t={W,H,d:t.map.image.data,e:t.em?t.em.image.data:null}; winT.set(k,t); } return t; };
  BLOCKS.facade=o=>{ const px=o.px||BLOCKS.PX, wall=o.wall||BLOCKS.brick(), base=o.base, TS=o.trim||[150,144,132], BOX=o.box||[58,74,46], top=o.top;
    const F=o.feats||[], IV=o.ivy||[], BIN=new Map(), none=[];
    for(const w of F){ const za=Math.floor((w.z0-34)/24), zb=Math.floor((w.z1+(w.arch?40:12))/24); for(let a=Math.floor(w.a0-.35);a<=Math.floor(w.a1+.35);a++)for(let b=za;b<=zb;b++){ const key=w.side+a+','+b; let l=BIN.get(key); if(!l)BIN.set(key,l=[]); l.push(w); } }
    return (side,u,z,f)=>{
      if(top!=null&&z>=top-30){ const zz=z-(top-30); return sh(TS,f*(zz<6?.62:zz<10?1.1:zz<16?((Math.floor(u*px/2)&1)?.55:1.04):zz>=27?1.14:.96)); }
      for(const w of BIN.get(side+Math.floor(u)+','+Math.floor(z/24))||none){ if(w.side!==side||u<w.a0-.35||u>w.a1+.35||z<w.z0-34||z>w.z1+(w.arch?40:12))continue; const cx=(w.a0+w.a1)/2, hw=(w.a1-w.a0)/2, ax=Math.abs(u-cx);
        if(ax<hw&&z>=w.z0&&z<w.z1){ const t=wtex(w,px), i=Math.min(t.W-1,Math.floor((u-w.a0)*px)), j=Math.min(t.H-1,Math.max(0,Math.floor((w.z1-z)*px/24))), q=(j*t.W+i)*4;
          if(w.box&&z<w.z0+12+6*hs(Math.floor(u*px),1,w.seed)){ const fl=BLOCKS.flowers(u,z,w,w.seed+5); if(fl)return sh(fl,f); }
          const c=[t.d[q],t.d[q+1],t.d[q+2]]; return t.e&&t.e[q+3]?[c[0],c[1],c[2],1]:c; }
        if(w.arch&&z>=w.z1&&ax<hw+.25){ const dz=(z-w.z1)/24, d=Math.hypot(u-cx,dz); if(d<hw)return d<hw-.08&&(Math.floor(Math.atan2(dz,u-cx)*5)&1)?[255,214,150,1]:sh(TS,f*.7); if(d<hw+.22)return sh(TS,f*(d>hw+.15?.75:1.08)); }
        if(w.box&&ax<hw+.12&&z>=w.z0-12&&z<w.z0){ return sh(BOX,f*(z>=w.z0-3?1.15:z<w.z0-10?.62:.92)); }
        if(w.box&&ax<hw+.1&&z<w.z0-12&&z>w.z0-12-30*hs(Math.floor(u*px),3,w.seed)){ const x=Math.floor(u*px); if(md(x,3)===0&&hs(x,Math.floor(z/2),w.seed+7)<.75)return sh(IVC[1],f); }
        if(ax<hw+.12&&z>=w.z0-4&&z<w.z0)return sh(TS,f*(z>=w.z0-1?1.16:.8));
        if(ax<hw+.1&&z>=w.z1&&z<w.z1+8&&!w.arch)return sh(TS,f*(z>=w.z1+6?1.12:z<w.z1+2?.6:1));
        if(ax>=hw&&ax<hw+.1&&z>=w.z0&&z<w.z1)return sh(TS,f*.82); }
      for(const P of IV)if(P.side===side){ const c=BLOCKS.ivy(u,z,P); if(c)return sh(c,f); }
      if(base&&z<base.z1)return base.paint(u,z,f);
      return wall(u,z,f); }; };
  BLOCKS.make=o=>{ const {X,Y,Z,faceTex,bq,C}=SHARED.BOD, px=o.px||BLOCKS.PX, {x0,y0,x1,y1}=o, z0=o.z0||0, z1=o.z1, k=o.kind||'A', H=Math.max(1,Math.round((z1-z0)*px/24));
    const face=(side,a0,a1,P)=>{ const W=Math.max(1,Math.round((a1-a0)*px)), f=side==='f'||side==='b'?1:.8;
      const T=o.turn, ls=T?T.unside(side):side, pa=T?a=>{ const l=T.back(side==='f'||side==='b'?a:side==='w'?x0:x1,side==='f'?y1:side==='b'?y0:a); return ls==='f'||ls==='b'?l[0]:l[1]; }:a=>a;
      const tx=faceTex(W,H,(i,j)=>C(o.paint(ls,pa(a0+(i+.5)/px),z1-(j+.5)*(z1-z0)/H,f)));
      bq(P(a0,z0),P(a1,z0),P(a1,z1),P(a0,z1),tx,k); };
    face('f',x0,x1,(a,z)=>[X(a),Y(z),Z(y1)]); face('b',x0,x1,(a,z)=>[X(a),Y(z),Z(y0)]);
    face('w',y0,y1,(a,z)=>[X(x0),Y(z),Z(a)]); face('e',y0,y1,(a,z)=>[X(x1),Y(z),Z(a)]);
    if(o.roof){ const W=Math.max(1,Math.round((x1-x0)*px)), D=Math.max(1,Math.round((y1-y0)*px));
      bq([X(x0),Y(z1),Z(y1)],[X(x1),Y(z1),Z(y1)],[X(x1),Y(z1),Z(y0)],[X(x0),Y(z1),Z(y0)],faceTex(W,D,(i,j)=>C(o.roof(x0+(i+.5)/px,y1-(j+.5)/px))),k); }
    return {x0:X(x0),z0:Z(y0),x1:X(x1),z1:Z(y1)}; };
  const POT=[[176,92,58],[96,98,104],[66,92,120],[214,206,190]], PLC=[[56,112,44],[84,150,58],[112,176,72],[150,200,96]];
  BLOCKS.plantTex=(kind,W,H,seed)=>SHARED.BOD.faceTex(W,H,(i,j)=>{ const x=(i+.5)/W-.5, y=1-(j+.5)/H, n=hs(i,j,seed), pc=POT[Math.floor(hs(seed,1,3)*POT.length)];
    if(kind==='hang'){ if(y>.82)return Math.abs(x)<.03||Math.abs(Math.abs(x)-(1-y)*1.6)<.04?[40,38,36]:null; if(y>.62&&Math.abs(x)<.32)return sh(pc,y>.78?1.12:.9);
      if(y>.5&&Math.abs(x)<.46&&n>.2)return PLC[n>.7?3:n>.45?2:1]; const s=Math.floor((x+.5)*W/2); if(y<=.62&&y>.62-.62*hs(s,2,seed)&&md(i,2)===1&&n>.25)return PLC[n>.75?2:n>.5?1:0]; return null; }
    const ph=kind==='tall'?.22:.3; if(y<ph){ const tw=.26+.08*y/ph; if(Math.abs(x)<tw)return sh(pc,y>ph-.05?1.15:Math.abs(x)>tw-.05?.72:.95); return null; }
    const cy=kind==='tall'?.6:.55, ry=kind==='tall'?.42:.3, rx=kind==='fern'?.5:.4, d=(x/rx)**2+((y-cy)/ry)**2+.35*(n-.5);
    if(d>1)return null; if((kind==='flower')&&n>.62)return FLC[Math.floor(hs(Math.floor(i/2),Math.floor(j/2),seed+2)*FLC.length)]; return PLC[d<.3&&y>cy?3:d<.6?2:d>.85?0:1]; });
  BLOCKS.card=(x,y,z,w,h,kind,seed,k,cross=true,ns=false)=>{ const {X,Y,Z,bq}=SHARED.BOD, W=Math.max(4,Math.round(w*24)), Hh=Math.max(4,Math.round(h)), t=BLOCKS.plantTex(kind,W,Hh,seed);
    if(!ns||cross)bq([X(x-w/2),Y(z),Z(y)],[X(x+w/2),Y(z),Z(y)],[X(x+w/2),Y(z+h),Z(y)],[X(x-w/2),Y(z+h),Z(y)],t,k);
    if(cross||ns)bq([X(x),Y(z),Z(y-w/2)],[X(x),Y(z),Z(y+w/2)],[X(x),Y(z+h),Z(y+w/2)],[X(x),Y(z+h),Z(y-w/2)],t,k); };
}
export {BLOCKS};
