  const BARDARK=true, lt=c=>BARDARK?c:lit(c);
  function neon(x,y,word){ PNAME='neon sign'; const cw=4, L=(word.length*4-1)*cw+16, w=L/S, Z0=0, h=(5*cw+12)/H, bs=[];
    const A=pic(L,5*cw+12,put=>{ [...word].forEach((ch,i)=>{ const g=F3[ch]; for(let r=0;r<5;r++)for(let q=0;q<3;q++)if(g[r*3+q]==='1'){ const X=8+(i*4+q)*cw, Y=6+r*cw;
      box(put,X-1,Y-1,X+cw+1,Y+cw+1,BARDARK?[96,40,38]:lit([210,60,52])); } });
      [...word].forEach((ch,i)=>{ const g=F3[ch], on=(r,q)=>r>=0&&r<5&&q>=0&&q<3&&g[r*3+q]==='1'; for(let r=0;r<5;r++)for(let q=0;q<3;q++)if(on(r,q)){ const X=8+(i*4+q)*cw, Y=6+r*cw; box(put,X,Y,X+cw,Y+cw,BARDARK?[120,58,54]:lit([255,150,130])); }
        for(let r=0;r<5;r++)for(let q=0;q<3;q++)if(on(r,q)){ const X=8+(i*4+q)*cw, Y=6+r*cw; const core=BARDARK?[140,74,70]:lit([255,244,226]); box(put,X+1,Y+1,X+cw-1,Y+cw-1,core);
          if(on(r,q+1))box(put,X+cw-1,Y+1,X+cw+1,Y+cw-1,core); if(on(r+1,q))box(put,X+1,Y+cw-1,X+cw-1,Y+cw+1,core); } }); });
    bs.push(fb(x,y,x+.05,y+w,Z0,Z0+h,[40,20,20],(s,a,row)=>s==='px'?A(a,row)||(row<1||row>=(5*cw+12)-1?[70,40,36]:[44,22,20]):[44,22,20],[60,34,30],{foot:1,em:BARDARK?0:1}));
    const G=.9, gh=16;
    if(!BARDARK)bs.push(fb(x-.004,y-G,x+.002,y+w+G,Z0-gh,Z0+h+gh,[200,80,60],(s,a,row)=>{ if(s!=='px')return null; const u=a/S-G, zz=h+gh-row/H, d=Math.hypot(Math.max(0,-u,u-w),Math.max(0,-zz,zz-h)/FP), f=Math.max(0,1-d/G);
      const i=a>>1, j=row>>1, on=f>.6||f>.3&&((i+j)&1)||f>.08&&!(i&1)&&!(j&1); return on?lit([Math.round(170+85*f),Math.round(116-30*f),Math.round(96-30*f)]):null; },()=>null,{nb:1,em:1}));
    const p=prop(bs,null,{hang:Z0,walk:true,high:true}); LAMPS.push({own:1,room:1,x:x+.6,y:y+w/2,z:h/2,r:5.5,c:[1.5,.36,.28],prop:p,off:BARDARK?1:0}); return p; }
  
  
  
  
  function tv(x,y){ PNAME='TV'; const L=.86, Z=22;
    const A=pic(Math.round(L*S),Z*H,put=>{ const w=Math.round(L*S), h=Z*H; box(put,0,0,w,h,DP.black); if(BARDARK){ box(put,3,3,w-3,h-3,[22,26,30]); for(let i=0;i<5;i++)box(put,6+i*3,5+i,8+i*3,6+i,[44,50,58]); return; }
      box(put,3,3,w-3,h-3,lit([40,130,60]));
      for(let y=3;y<h-3;y+=6)box(put,3,y,w-3,y+1,lit([50,150,70])); box(put,3,3,w-3,10,lit([30,40,90])); for(let i=0;i<14;i++)box(put,3+hash(i,1,101)*(w-8),5+hash(i,2,101)*4,5+hash(i,1,101)*(w-8),7+hash(i,2,101)*4,lit([220,220,230]));
      for(let i=0;i<6;i++){ const px=6+hash(i,3,101)*(w-12), py=14+hash(i,4,101)*(h-22); box(put,px,py,px+2,py+5,lit(i<3?[220,40,40]:[240,240,240])); }
      box(put,w-14,h-8,w-4,h-4,lit([20,20,30])); });
    const p=prop([fb(x,y,x+.12,y+L,0,Z,DP.black,(s,a,row)=>s==='px'?A(a,row):DP.blackL,DP.blackL,{foot:1,em:BARDARK?0:1}),pb(x,y+L/2-.08,x+.05,y+L/2+.08,-6,0,DP.blackL)],null,{hang:0,walk:true,high:true});
    LAMPS.push({own:1,room:1,x:x+.9,y:y+L/2,z:Z/2,r:3.5,c:[.55,.8,1],prop:p,off:BARDARK?1:0}); return p; }
  function barCandle(x,y){ PNAME='candle'; const FL={ph:0}, bs=tcandle(x,y,BZ+BT,FL); for(const b of bs)if(b.z0===BZ+BT)b.foot=1; const p=prop(bs,null,{hang:BZ+BT}); flick(p,FL,Math.round(x*11+y*17)); LAMPS.push({own:1,room:1,day:true,x,y,z:BZ+BT+8,r:2.6,c:[.72,.4,.15],prop:p}); return p; }
  function consoleTV(x,y){ PNAME='console TV'; const W=.76, D=.48, x0=x-W/2, x1=x+W/2, y0=y-D/2, y1=y+D/2, LZ=7, CZ=34, wood=[104,66,38], woodD=[70,44,26], woodL=[138,92,54], bs=[];
    for(const [lx,ly] of [[x0+.06,y0+.06],[x1-.1,y0+.06],[x0+.06,y1-.1],[x1-.1,y1-.1]])bs.push(pb(lx,ly,lx+.04,ly+.04,0,LZ,woodD));
    bs.push(pb(x0,y0,x1,y1,LZ,LZ+CZ,wood,{top:(X,Y)=>(X-x0)*24%6<1?woodD:woodL,fs:(nx,ny,X,Y,z)=>{ const u=nx?Y-y0:X-x0, zr=z-LZ;
      if(ny>0){ const a=(X-x0)/W; if(zr<9&&a>.12&&a<.88)return (Math.floor(a*W*24)+Math.floor(zr))%2?[86,74,58]:[110,96,74];
        if(zr<11&&zr>=9&&(Math.abs(a-.7)<.04||Math.abs(a-.82)<.04))return [210,196,160];
        if(zr>=12&&zr<CZ-3&&a>.1&&a<.9)return [26,28,30]; }
      return zr>CZ-2?woodL:zr<1?woodD:hash(Math.floor(u*24),Math.floor(zr/3),4711)<.08?woodD:wood; }}));
    for(const s of [-1,1])bs.push(pb(x+s*.04-.008,y-.008,x+s*.04+.008,y+.008,LZ+CZ,LZ+CZ+2,[40,40,44]),pb(x+s*.18-.006,y-.006,x+s*.18+.006,y+.006,LZ+CZ+2,LZ+CZ+15,[170,172,176],{nb:1}));
    const p=prop(bs,null,{});
    const TUBE={x0:x0+W*.1,x1:x0+W*.9,y:y1+.002,z0:LZ+12,z1:LZ+CZ-3};
    p.lifeDraw=(Dd,Wd,Hd,ox,oy,t,K=1)=>{ const [fa,fb2]=vwV(0,1); if(fa+fb2<=0)return;
      const zb=LVZ(V.lv), wf=Math.round((TUBE.x1-TUBE.x0)*24*K), hf=Math.round((TUBE.z1-TUBE.z0)*K), fl=.88+.12*hash(Math.floor(t*14),3,4713), roll=(t*.13)%1;
      for(let i=0;i<wf;i++){ const u=(i+.5)/wf, X=TUBE.x0+u*(TUBE.x1-TUBE.x0), [vx,vy]=vw(X,TUBE.y), bx=((vx-vy)*HW-ox)*K, by=((vx+vy)*HH-oy)*K;
        for(let j=0;j<hf;j++){ const v=(j+.5)/hf, z=TUBE.z1-v*(TUBE.z1-TUBE.z0), X2=Math.floor(bx), Y2=Math.floor(by-(z-zb)*K); if(X2<0||Y2<0||X2>=Wd||Y2>=Hd)continue;
          const cu=Math.min(u,1-u), cv=Math.min(v,1-v); if(cu<.06&&cv<.06&&Math.hypot(.06-cu,.06-cv)>.06)continue;
          let g=crtShow(u,v,t); g*=fl*(1-.35*Math.max(0,1-Math.min(cu,cv)*9))*((j%2)?.82:1)*(Math.abs(v-roll)<.04?1.12:1); g+=(hash(i,j,Math.floor(t*20))-.5)*.08;
          const c=Math.max(0,Math.min(255,40+g*215)), k=(Y2*Wd+X2)*4; Dd[k]=c*.94; Dd[k+1]=c*.97; Dd[k+2]=Math.min(255,c*1.04+6); Dd[k+3]=255; } } };
    LAMPS.push({own:1,room:1,day:true,x,y:y1+.6,z:LZ+22,r:3.2,c:[.36,.4,.46],prop:p}); return p; }
  function crtShow(u,v,t){ const sc=Math.floor(t/7)%4, s=t%7, bg=.26;
    if(sc===0){ const r=Math.hypot(u-.5,(v-.45)*1.2), a=Math.atan2(v-.45,u-.5)+s*.6; if(r<.18)return .95; if(r<.42&&Math.floor((a+Math.PI)/(Math.PI*2)*16)%2)return .62-r*.6; return v>.78&&v<.86&&u>.2&&u<.8&&Math.floor(u*30)%3?.8:bg; }
    if(sc===1){ const curt=Math.floor(u*14)%2?.3:.22, hx=.5+Math.sin(s*.7)*.03, mouth=Math.floor(s*6)%2;
      const head=Math.hypot((u-hx)/.1,(v-.3)/.13)<1, body=v>.42&&Math.abs(u-hx)<.2-(v-.42)*.0, shirt=body&&Math.abs(u-hx)<.05*(1-(v-.42)*1.6)&&v<.62;
      if(Math.abs(u-.38)<.012&&v>.4)return .7; if(Math.hypot((u-.38)/.03,(v-.4)/.04)<1)return .85;
      if(head)return Math.abs(u-hx)<.03&&Math.abs(v-.36)<.012*(1+mouth)?.08:Math.abs(v-.27)<.01&&Math.abs(Math.abs(u-hx)-.04)<.012?.1:.82; if(v<.22&&Math.hypot((u-hx)/.11,(v-.22)/.07)<1)return .05;
      if(shirt)return .92; if(body)return .12; return curt; }
    if(sc===2){ const sw=Math.sin(s*2.2)*.05, fig=(cx,tall)=>Math.hypot((u-cx)/.05,(v-(.88-tall))/.06)<1||Math.abs(u-cx)<.05-(v-(.95-tall))*.02&&v>.95-tall+.06&&v<.92;
      if(fig(.42+sw,.55)||fig(.58+sw,.5))return .06; const r=Math.hypot(u-.5-sw,(v-.7)*1.4); return r<.34?.75-r:bg*(v>.92?1.6:1); }
    { const bx=.5, k=s*2.4, balls=[0,1,2].map(i=>{ const ph=(k+i*2.1)%(Math.PI*2); return [bx+Math.cos(ph)*.16,.42-Math.abs(Math.sin(ph))*.24]; });
      for(const [bu,bv] of balls)if(Math.hypot(u-bu,v-bv)<.035)return .95; if(Math.hypot((u-bx)/.07,(v-.52)/.09)<1)return .8; if(v>.6&&Math.abs(u-bx)<.12-(v-.6)*.1)return .1; return v>.88?.4:bg; } }
  

  function soffit(x,y,L,W){ PNAME='soffit'; const Z0=106, Z1=126, rc=.6, bs=[], x1=x+L, y1=y+W;
    const face=(s,a,row,Lf,h)=>s==='px'||s==='py'?(row<12?(row<1?[200,90,70]:[176,64,46]):row<13?[110,40,30]:row>h-2?[120,84,52]:[176,132,86]):[150,110,70];
    for(let X=x;X<x1-1e-6;X+=.04){ const m=X+.02, yy=m>x1-rc?(y1-rc)+Math.sqrt(Math.max(0,rc*rc-(m-(x1-rc))**2)):y1;
      bs.push(fb(X,y,X+.04,yy,Z0,Z1,[176,64,46],face,(XX,YY)=>edge(XX,YY,x,y,x1,yy)<.06?[150,110,70]:pcVn(XX*3,YY*3,102)<.4?[118,124,104]:[126,132,112],{nb:1,foot:1})); }
    return prop(bs,null,{hang:Z0,walk:true,high:true}); }

  function fan(x,y){ PNAME='ceiling fan'; const Zc=126, bs=[], R=1.15, Zb=106;
    bs.push(pb(x-.02,y-.02,x+.02,y+.02,108,Zc,DP.black,{nb:1,foot:1}));
    bs.push(...round(x,y,104,110,z=>.13-(z>4?.04:0),(dx,dy,z,top)=>top?DP.blackL:z>2&&z<3.5?[180,40,36]:Math.atan2(dy,dx)>1.4?DP.blackL:DP.black,1,.03));
    bs.push(...round(x,y,92,104,z=>.17*Math.sqrt(Math.max(.05,1-((z-7)/7)**2)),(dx,dy,z,top)=>z>10?lt([200,190,170]):lt(z<4?[255,250,226]:Math.atan2(dy,dx)>1.2?[255,252,236]:[250,236,200]),1,.03).map(b=>Object.assign(b,{em:BARDARK?0:1})));
    bs.push({x0:x-R,y0:y-R,x1:x+R,y1:y+R,z0:Zb,z1:Zb+.5,c:[0,0,0],foot:1,nb:1,top:()=>null,fi:()=>null,fj:()=>null,ghost:1});
    const p=prop(bs,null,{hang:92,walk:true,high:true,lifeK:2});
    const BL=[[120,78,46],[150,100,60],[90,56,30]];
    p.lifeDraw=(D,W,Hh,ox,oy,t,K=1)=>{ const hub=p.boxes.find(b=>b.ghost); if(!hub)return; const cx=(hub.x0+hub.x1)/2, cy=(hub.y0+hub.y1)/2, z=hub.z0-LVZ(V.lv), a0=t*5.2;
      for(let k=0;k<4;k++){ const a=a0+k*Math.PI/2, ca=Math.cos(a), sa=Math.sin(a);
        for(let r=.16;r<R;r+=.012/K)for(let q=-1;q<=1;q+=.25/K){ const wd=r<.3?.05:.11+.02*Math.sin((r-.3)/(R-.3)*3), X=cx+ca*r-sa*q*wd, Y=cy+sa*r+ca*q*wd, [vx,vy]=vw(X,Y);
          const px=Math.floor(((vx-vy)*HW-ox)*K), py=Math.floor(((vx+vy)*HH-z-oy)*K); if(px<0||py<0||px>=W||py>=Hh)continue;
          const c=r<.3?DP.black:Math.abs(q)>.8||r>R-.03?BL[2]:q<-.3?BL[1]:BL[0], i=(py*W+px)*4; D[i]=c[0]; D[i+1]=c[1]; D[i+2]=c[2]; D[i+3]=255; } } };
    LAMPS.push({own:1,room:1,x,y,z:96,r:9.5,c:[.9,.88,.68],prop:p}); return p; }


  function stage(x,y,L,W){ PNAME='stage'; const Z=14, x1=x+L, y1=y+W, K=[22,20,22], G=[188,146,58], bs=[];
    bs.push(fb(x,y,x1,y1,0,Z,K,(s,a,row,Lf,h)=>row<2?G:row>h-2?[12,10,12]:(a%(S*.5|0))<1?[34,30,32]:K,(X,Y)=>edge(X,Y,x,y,x1,y1)<.04?G:(Math.floor(Y*S/5)&1)?[30,26,30]:[36,32,36],{foot:1}));
    bs.push(fb(x+L/2-.5,y1,x+L/2+.5,y1+.3,0,7,K,(s,a,row)=>row<1?G:K,(X,Y)=>edge(X,Y,x+L/2-.5,y1,x+L/2+.5,y1+.3)<.03?G:[36,32,36],{foot:1}));
    return prop(bs,null,{stands:[{x0:x,y0:y,x1,y1,z:Z}]}); }
  function micStand(x,y,z0,len,cord){ PNAME=cord?'microphone cord':'microphone stand'; const bs=[], Z=v=>z0+v, CH=[208,210,214], CR=[22,20,24], IR=[40,38,44];
    if(!cord){
    for(let r=0;r<4;r++){ const w=.09-r*.018; bs.push(fb(x-w,y-w*.8,x+w,y+w*.8,Z(r*.5),Z(r*.5+.5),IR,()=>IR,r===3?[70,68,76]:IR,{foot:r===0?1:0})); }
    bs.push(fb(x-.022,y-.022,x+.022,y+.022,Z(2),Z(34),CH,(s,a,row)=>row%5===0?[240,242,246]:CH,CH));
    bs.push(fb(x-.03,y-.03,x+.03,y+.03,Z(33),Z(35.5),IR,()=>IR,IR));
    for(let k=0;k<5;k++)bs.push(fb(x-.024,y-.03-k*.022,x+.024,y-.008-k*.022,Z(35.2+k*.35),Z(36.4+k*.35),CR,()=>CR,CR));
    bs.push(fb(x-.032,y-.17,x+.032,y-.118,Z(36.4),Z(39),CH,(s,a,row)=>(a+row)&1?[150,152,158]:[230,232,236],(X,Y)=>((X*90|0)+(Y*90|0))&1?[150,152,158]:[230,232,236]));
    bs.push(fb(x+.022,y-.012,x+.04,y+.012,Z(1),Z(34),CR,()=>CR,CR)); }
    let px=x+.04, py=y; for(let i=1;i<=Math.round(len*40);i++){ const u=i/(len*40), cx=x+.04+Math.sin(u*7.5)*.16*(1-u*.6), cy=y-u*len;
      bs.push(fb(Math.min(px,cx)-.016,Math.min(py,cy)-.016,Math.max(px,cx)+.016,Math.max(py,cy)+.016,Z(0),Z(.6),CR,()=>CR,[34,32,36],{foot:i===1?1:0})); px=cx; py=cy; }
    return prop(bs,null,cord?{walk:true}:{}); }
  function guitarCase(x,y,z0){ PNAME='open guitar case'; const bs=[], Z=v=>z0+v, L=.92, K=[26,22,22], KH=[60,54,52], RD=[138,22,34];
    const w=u=>u<.2?.36*Math.sqrt(Math.max(.08,1-((u-.2)/.21)**2)):u<.4?.36-.09*Math.sin((u-.2)/.2*Math.PI/2):u<.52?.27+.04*Math.sin((u-.4)/.12*Math.PI/2):u<.62?.31-.18*(u-.52)/.1:.13;
    const N=28, x0=x-L/2, HL=Math.round(.36*33.9*.94);
    for(let i=0;i<N;i++){ const u=(i+.5)/N, W=Math.min(.36,w(u)), X0=x0+L*i/N, X1=x0+L*(i+1)/N, Y0=y-W/2, Y1=y+W/2;
      bs.push(fb(X0,Y0,X1,Y1,Z(0),Z(3.5),K,(s,a,row)=>row<1?KH:K,(X,Y)=>{ const e=Math.min(Y-Y0,Y1-Y,i===0?X-X0:1,i===N-1?X1-X:1); if(e<.022)return KH;
        const h=hash(X*80|0,Y*80|0,377); if(h<.012)return [214,180,80]; if(h<.02)return [200,202,206]; if(Math.abs(X-(x0+.3))<.05&&Math.abs(Y-y-.03)<.03)return [96,128,84];
        return h<.5?RD:[118,16,28]; },{foot:1}));
      for(let k=0;k<HL;k++){ const yb=Y0-(k+1)/HL*W*.34; bs.push(fb(X0,yb,X1,yb+W*.34/HL+.004,Z(3.5+k),Z(4.5+k),K,(s,a,row)=>s==='py'?(k===HL-1?KH:RD):K,k===HL-1?KH:K)); } }
    for(const u of [.15,.55,.85])bs.push(fb(x0+L*u-.012,y+.16,x0+L*u+.012,y+.185,Z(1),Z(2.6),[214,176,72],()=>[190,150,60],[226,190,96]));
    return prop(bs,null,{}); }
  function stageCloth(x,y,L){ PNAME='stage cloth'; return prop([fb(x,y,x+L,y+.06,0,112,[16,14,18],(s,a,row)=>(a%14<2)?[10,8,10]:[18,16,20],[16,14,18],{foot:1})],null,{hang:0,walk:true,high:true}); }
  function grand(x,y,z0){ PNAME='grand piano'; const W=1.32, L=1.62, x0=x-W/2, x1=x+W/2, y1=y-.136, y0=y1-L, bs=[], Z=v=>z0+v;
    const K=[20,18,22], KH=[64,60,70], tail=t=>y0+L*.55*Math.pow(Math.max(0,Math.min(1,(t-.18)/.82)),1.35)*(1-.0*t);
    const lac=(s,a,row,Lf,h)=>row<1?KH:(a%9===4&&row<h-2)?[30,28,34]:K;
    const N=30; for(let i=0;i<N;i++){ const ta=i/N, tb=(i+1)/N, X0=x0+W*ta, X1=x0+W*tb, Y0=tail((ta+tb)/2);
      bs.push(fb(X0,Y0,X1,y1,Z(17),Z(30.5),K,lac,(X,Y)=>{ const t=(X-x0)/W, e=Math.min(X-x0,x1-X,Y-tail(t),y1-Y); return e<.035?KH:(Math.floor((X+Y)*30)%7===0?[30,28,34]:K); },{foot:i===0||i===N-1?1:0})); }
    bs.push(fb(x-.36,y1-.24,x+.36,y1-.2,Z(30.5),Z(41),K,(s,a,row,Lf,h)=>s==='py'&&row>1&&row<h-1&&Math.abs(a-Lf/2)<Lf*.22?(row%3===1?[150,146,136]:[232,228,214]):row<1?KH:K,KH));
    bs.push(fb(x-.55,y1,x+.55,y+.02,Z(17),Z(20.3),K,lac,[40,36,40],{foot:1}));
    bs.push(fb(x-.55,y1-.06,x+.55,y1,Z(20.3),Z(24.5),K,lac,KH));
    for(const s of [-1,1])bs.push(fb(s<0?x-.66:x+.55,y1,s<0?x-.55:x+.66,y+.02,Z(17),Z(23),K,lac,KH,{foot:1}));
    for(const [lx,ly] of [[x0+.12,y1-.1],[x1-.12,y1-.1],[x0+.45,y0+.32]])bs.push(fb(lx-.05,ly-.05,lx+.05,ly+.05,Z(0),Z(17),K,(s,a,row,Lf,h)=>row>h-2?[200,160,70]:lac(s,a,row,Lf,h),K,{foot:1}));
    bs.push(fb(x-.06,y-.16,x+.06,y-.12,Z(1),Z(17),K,lac,K));
    for(const d of [-.045,0,.045])bs.push(fb(x+d-.014,y-.12,x+d+.014,y-.04,Z(1.5),Z(2.5),[200,160,70],()=>[168,128,52],[226,190,96]));
    return prop(bs,null,{}); }

  var barFloorCol=(x,y)=>{ const c=woodCol(x,y); return [c[0]*.5|0,c[1]*.4|0,c[2]*.34|0]; };
  var barWall=(q,nx,ny,X,Y,z,f)=>{ const u=nx?Y:X, zz=z%STORY; if(zz<4)return sh([30,18,16],f); if(zz<38)return sh((u*24|0)%16<1?[68,22,20]:zz>35?[112,40,34]:[88,30,26],f);
    if(zz<40)return sh([150,112,58],f); if(zz>112)return sh([26,20,26],f); return sh(speck([74,46,60],u,z/24,97),f); };

  
  const C={'bar counter':(x,y)=>barStraight(x-.9,y-BD/2,1.8,null),'bar counter: ashtray':(x,y)=>barStraight(x-.9,y-BD/2,1.8,0),
    'bar counter: bottle':(x,y)=>barStraight(x-.9,y-BD/2,1.8,1),'bar counter: glass':(x,y)=>barStraight(x-.9,y-BD/2,1.8,2),
    'bar round end':(x,y)=>barRound(x-.56,y-.56),'bar corner':(x,y)=>barCorner(x-BD/2,y-1.5,3.02),'back bar':(x,y)=>backBar(x-2.6,y-.31,5.2),
    'bar stool':(x,y)=>stool(x,y),'bar fridge':(x,y)=>fridge(x-.39,y-.46),
    'red leather sofa':(x,y)=>sofa(x-.46,y-1.1),'red leather armchair':(x,y)=>armchair(x-.47,y-.475),'bar table':(x,y)=>table(x,y,1),
    'red rug':(x,y)=>rug(x-1.9,y-.65,3.8,1.3),'potted palm':(x,y)=>plant(x,y,true),'potted plant':(x,y)=>plant(x,y,false),
    'neon sign: BAR':(x,y)=>up(neon(x-.03,y-.62,'BAR'),86),'neon sign: LIVE':(x,y)=>up(neon(x-.03,y-.79,'LIVE'),86),'exit sign, lit':(x,y)=>up(exitSign(x-.05,y-.31),90),
    'bar window blinds':(x,y)=>up(blinds(x-.02,y-.65,1.3,70),34),'bar blinds':(x,y)=>up(blinds(x-.02,y-2.3,4.6,72),30),'TV on a bracket':(x,y)=>up(tv(x-.06,y-.43),74),'black cupboard':(x,y)=>cupboard(x-.31,y-.46),
    'bar soffit':(x,y)=>soffit(x-4.4,y-1.4,8.8,2.8),'ceiling fan':(x,y)=>fan(x,y),'small stage':(x,y)=>stage(x-1.6,y-1.1,3.2,2.2),'stage cloth':(x,y)=>stageCloth(x-1.8,y-.03,3.6),
    'stage':(x,y)=>stage(x-2.2,y-1.3,4.4,2.6),'wide stage cloth':(x,y)=>stageCloth(x-2.4,y-.03,4.8),'grand piano':(x,y)=>grand(x,y,0),'grand piano on a stage':(x,y)=>grand(x,y,14),
    'candle on the bar':(x,y)=>barCandle(x,y),'console TV':(x,y)=>consoleTV(x,y),
    'microphone stand on a stage':(x,y)=>micStand(x,y,14,1.6),'microphone cord on a stage':(x,y)=>micStand(x,y,14,1.6,true),'microphone stand':(x,y)=>micStand(x,y,0,1.2),'open guitar case':(x,y)=>guitarCase(x,y,0)};
  for(const n of Object.keys(POSTERS))C['poster: '+n]=(x,y)=>{ const [L,h]=n==='moon shrine'?[.62,40]:n==='night painting'?[.5,30]:n==='190 street'?[.5,30]:[.55,34]; return up(poster(x-.02,y-L/2,n,L,h),n==='190 street'?42:n==='ghost sale'?50:46); };
  Object.assign(CATALOG,C);
  CAT_DEPTS.push(['bar','Bar']);
  const info=(no,name,price,desc,mat)=>({no:'B-7'+String(no).padStart(2,'0'),name,dept:'bar',price,desc,mat});
  Object.assign(CAT_INFO,{
    'bar counter':info(1,'Bar Counter',1800,'A run of oxblood bar, a step along its foot, shelves of glasses on the inside.','oak, lacquer'),
    'bar counter: ashtray':info(2,'Bar Counter with an Ashtray',1820,'The bar, an ashtray, the napkins and the sauces out.','oak, lacquer'),
    'bar counter: bottle':info(3,'Bar Counter with a Bottle',1810,'The bar, a bottle of beer and a glass left on it.','oak, lacquer'),
    'bar counter: glass':info(4,'Bar Counter with a Glass',1805,'The bar, a glass on a mat.','oak, lacquer'),
    'bar round end':info(5,'Bar Counter, Round End',1400,'The bar\'s end, curving back to the wall.','oak, lacquer'),
    'bar corner':info(6,'Bar Counter, Corner',2200,'The bar turning back to the wall, the till on it.','oak, lacquer'),
    'back bar':info(7,'Back Bar',3400,'Cupboards under a steel top: a sink, a row of bottles, glasses on towels.','oak, steel'),
    'bar stool':info(8,'Bar Stool',120,'A red cushion on a green pole.','steel, vinyl'),
    'bar fridge':info(9,'Drinks Fridge',900,'A glass-door fridge of bottles and cans, lit blue.','steel, glass'),
    'red leather sofa':info(11,'Red Leather Sofa',1600,'A deep red sofa with rolled arms.','leather, oak'),
    'red leather armchair':info(12,'Red Leather Armchair',800,'A club chair, its back in channels.','leather, oak'),
    'bar table':info(13,'Round Table',260,'A small round table on one foot, a glass, an ashtray and a candle on it.','walnut, cast iron'),
    'red rug':info(14,'Red Runner',180,'A long deep red rug.','wool'),
    'potted palm':info(15,'Potted Palm',140,'A big spiky palm in a clay pot.','living'),
    'potted plant':info(16,'Potted Plant',90,'A tall spiky plant in a grey pot.','living'),
    'neon sign: BAR':info(17,'Neon Sign, BAR',650,'BAR in red tube. It glows.','glass, neon'),
    'neon sign: LIVE':info(18,'Neon Sign, LIVE',700,'LIVE in red tube. It glows.','glass, neon'),
    'exit sign, lit':info(19,'Exit Sign',45,'EXIT, lit.','plastic'),
    'bar window blinds':info(22,'Window Blinds',60,'Blinds drawn in a wood frame.','aluminium, oak'),
    'bar blinds':info(23,'Bar Blinds',180,'A wide window of blinds, drawn.','aluminium, oak'),
    'TV on a bracket':info(24,'TV on a Bracket',300,'A small set high on the wall, the game on.','plastic, glass'),
    'black cupboard':info(25,'Black Cupboard',110,'A low black cupboard, straws and a cup on it.','steel'),
    'bar soffit':info(26,'Bar Soffit',900,'A dropped ceiling over the bar, its edge banded red.','plaster, oak'),
    'ceiling fan':info(27,'Ceiling Fan',240,'Four wooden blades that turn, a frosted globe that lights.','steel, oak, glass'),
    'small stage':info(34,'Small Stage',1500,'A low black stage with a gilt edge.','pine'),
    'stage cloth':info(35,'Stage Cloth',300,'A black cloth hung in folds, a stage\'s backing.','velvet'),
    'stage':info(36,'Stage',2400,'A black stage with a gilt edge, room for a piano and a player.','pine'),'wide stage cloth':info(37,'Wide Stage Cloth',420,'A wide black cloth hung in folds.','velvet'),
    'grand piano':info(38,'Grand Piano',42000,'A six-foot grand in black lacquer, the lid down.','spruce, maple, iron, felt'),'grand piano on a stage':info(39,'Grand Piano (on a stage)',42000,'The grand, standing on a stage.','spruce, maple, iron, felt'),
    'microphone stand':info(40,'Microphone Stand',160,'A chrome stand, a microphone at a singer\'s mouth, its cord over the floor.','steel, chrome'),'microphone stand on a stage':info(41,'Microphone Stand (on a stage)',160,'The stand, on a stage.','steel, chrome'),'microphone cord on a stage':info(43,'Microphone Cord (on a stage)',20,'A black cord over the stage to the wall.','rubber, copper'),
    'open guitar case':info(42,'Open Guitar Case',120,'A hard case lying open, red plush, a few coins in it.','wood, vinyl, plush'),
    'candle on the bar':info(43,'Candle on the Bar',12,'A candle in red glass, standing on the counter.','wax, glass'),'console TV':info(44,'Console TV',380,'A walnut set on four legs, rabbit ears on top, a late show on in black and white.','walnut, glass, cloth'),
    'poster: koi night':info(28,'Poster, Koi Night',15,'The koi pond on the moon shrine\'s roof, by night.','paper'),
    'poster: ghost sale':info(29,'Poster, Ghost Shop',15,'The ghost shop\'s sale.','paper'),
    'poster: hover taxi':info(30,'Poster, Hover Taxi',15,'Every 30 seconds, down the street.','paper'),
    'poster: moon shrine':info(31,'Poster, Moon Shrine',20,'The shrine on the roof.','paper'),
    'poster: 190 street':info(32,'Poster, 190 Street',15,'The line to 190 Street.','paper'),
    'poster: night painting':info(33,'Painting, Night',90,'A small dark painting of the river at night.','oil, canvas')});
  for(const k of Object.keys(C))KIND_OF[k]=k; }
