const STALL=(()=>{ const M=TILE/.84, VS=ZU*24/TILE, mv=m=>m*M*VS;
  const MUSH={
    button:{s:.035,h:1.2,f:(p,s)=>{ p('cyl',0xe8e2d4,0,s*.4,0,s*.35,s*.8,s*.35); p('cap',0xf2ede2,0,s*.7,0,s,s*.7,s); }},
    puffball:{s:.045,h:1.6,f:(p,s)=>{ p('ball',0xf4f0e6,0,s*.8,0,s,s*.85,s); }},
    chanterelle:{s:.04,h:1.2,f:(p,s)=>{ p('cone',0xe0a032,0,s*.6,0,s,s*1.2,s,Math.PI); }},
    redcap:{s:.045,h:1.6,f:(p,s,r)=>{ p('cyl',0xeee6d6,0,s*.5,0,s*.3,s,s*.3); p('cap',0xc42a20,0,s*.95,0,s,s*.6,s); for(let k=0;k<2;k++){ const a=r+k*3.1; p('ball',0xf6f0e0,Math.cos(a)*s*.55,s*1.3,Math.sin(a)*s*.55,s*.16,s*.1,s*.16); } }},
    inkcap:{s:.03,h:1.6,f:(p,s)=>{ p('cyl',0xe6e0d0,0,s*.8,0,s*.8,s*3.4,s*.8,Math.PI/2); }},
    bolete:{s:.055,h:1.4,f:(p,s)=>{ p('cyl',0xd8c4a0,0,s*.45,0,s*.45,s*.9,s*.45); p('cap',0x7a4a24,0,s*.85,0,s,s*.55,s); }},
    morel:{s:.03,h:2.2,f:(p,s)=>{ p('cyl',0xe2d4b4,0,s*.35,0,s*.4,s*.7,s*.4); p('cone',0x5e4428,0,s*1.5,0,s*.75,s*1.8,s*.75); }},
    moonglow:{s:.035,h:1.5,f:(p,s)=>{ p('cyl',0x9fe8f0,0,s*.5,0,s*.3,s,s*.3,0,1); p('cap',0x48d8f0,0,s*.9,0,s,s*.6,s,0,1); }}};
  const VEG={
    tomato:{s:.04,h:1.7,f:(p,s)=>{ p('ball',0xcc3420,0,s*.85,0,s,s*.85,s); p('ball',0x3e8a2a,0,s*1.6,0,s*.35,s*.15,s*.35); }},
    pepper:{s:.045,h:2,f:(p,s,r,R)=>{ p('ball',[0x2f8a2a,0xd8b028,0xc8321e][Math.floor(R()*3)],0,s,0,s,s*1.1,s); }},
    carrot:{s:.02,h:2,f:(p,s)=>{ p('cone',0xe0742a,0,s,0,s,s*8,s,Math.PI/2); p('cone',0x4aa03a,0,s,-s*5,s*1.4,s*3,s*1.4,-Math.PI/2); }},
    corn:{s:.03,h:2,f:(p,s)=>{ p('cyl',0xe8c84a,0,s,0,s,s*6,s,Math.PI/2); p('cone',0x9ab04a,0,s,-s*3.8,s*1.3,s*2.5,s*1.3,-Math.PI/2); }},
    cabbage:{s:.075,h:1.7,f:(p,s)=>{ p('ball',0x8ac05a,0,s*.85,0,s,s*.85,s); p('cap',0x6aa040,0,s*.5,0,s*1.08,s*.55,s*1.08,Math.PI); }},
    eggplant:{s:.035,h:2,f:(p,s)=>{ p('ball',0x4a2a5a,0,s,0,s,s,s*2); p('cone',0x3a7a2a,0,s,s*2,s*.6,s*.8,s*.6,Math.PI/2); }},
    potato:{s:.035,h:1.6,f:(p,s)=>{ p('ball',0xb08a5a,0,s*.8,0,s*1.3,s*.8,s); }},
    onion:{s:.035,h:2,f:(p,s,r,R)=>{ p('ball',R()<.3?0x8a3a5a:0xd8b88a,0,s,0,s,s,s); p('cone',0xa8884a,0,s*2.1,0,s*.3,s*.5,s*.3); }},
    greens:{s:.06,h:.8,f:(p,s)=>{ for(let k=0;k<3;k++)p('ball',k?0x4a9a3a:0x3a7a2a,(k-1)*s*.4,s*.4,0,s*.7,s*.35,s*.9); }},
    pumpkin:{s:.12,h:1.4,f:(p,s)=>{ p('ball',0xe0782a,0,s*.7,0,s,s*.7,s); p('cyl',0x5a4a24,0,s*1.4,0,s*.1,s*.3,s*.1); }}};
  const G={ball:new THREE.IcosahedronGeometry(1,0),cap:new THREE.SphereGeometry(1,5,2,0,Math.PI*2,0,Math.PI/2),cone:new THREE.ConeGeometry(1,1,6),cyl:new THREE.CylinderGeometry(1,1,1,5,1,true),box:new THREE.BoxGeometry(1,1,1)};
  const zones=[], Z0=new THREE.Matrix4().makeScale(0,0,0);
  const face=(X,Z,xa,xb,y)=>{ const a=Math.min(X(xa),X(xb)), b=Math.max(X(xa),X(xb)), z0=Z(y), k=Z(y+1)-z0, s=Math.sign(k); let f=null;
    for(const B of FIX.up){ if(B[0]>a||B[3]<b||B[3]-B[0]<6*Math.abs(k))continue; const e=s>0?B[1]:B[4]; if(Math.abs(e-z0)<5*Math.abs(k)&&(f==null||e*s<f*s))f=e; }
    return f==null?y:y+(f-z0)/k; };
  const build=o=>{ const {X,Z,veg,gate=1}=o, KS=veg?VEG:MUSH, I={ball:[],cap:[],cone:[],cyl:[],box:[],glow:[]}, TG=[];
    const x0=Math.min(o.x0,o.x1), x1=Math.max(o.x0,o.x1), wy=face(X,Z,x0,x1,o.y)-.03, xm=(x0+x1)/2, xg=gate>0?x1:x0, xo=gate>0?x0:x1, fo=-gate, CY1=wy-2.85, CY0=wy-3.65, ya=wy-.78, yb=wy-.02, xa=x0+.4, xb=x1-.4;
    let t=o.seed||7; const R=()=>{ t=(t*16807)%2147483647; return t/2147483647; }, RR=(a,b)=>a+R()*(b-a), BX=[1e9,1e9,-1e9,-1e9];
    const e=new THREE.Euler(), q=new THREE.Quaternion(), m4=new THREE.Matrix4(), V3=THREE.Vector3;
    const inst=(g,col,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0)=>{ q.setFromEuler(e.set(rx,ry,rz)); I[g].push([m4.compose(new V3(x,y,z),q,new V3(sx,sy,sz)).clone(),col]); return [g,I[g].length-1]; };
    const box=(a,b,c,d,h0,h1,col)=>inst('box',col,(X(a)+X(b))/2,mv((h0+h1)/2),(Z(c)+Z(d))/2,Math.abs(X(b)-X(a)),mv(h1-h0),Math.abs(Z(d)-Z(c)));
    const solid=(a,b,c,d,h)=>{ const r=[Math.min(X(a),X(b)),Math.min(Z(c),Z(d)),Math.max(X(a),X(b)),Math.max(Z(c),Z(d))]; SOL.up.push(r); FIX.up.push([r[0],r[1],0,r[2],r[3],mv(h)]); for(let i=0;i<4;i++)BX[i]=i<2?Math.min(BX[i],r[i]):Math.max(BX[i],r[i]); };
    const item=(K,wx,h,wz,s,ry)=>{ const c=Math.cos(ry), sn=Math.sin(ry);
      K.f((g,col,ox,oy,oz,sx,sy,sz,rx=0,rz=0,glow=0)=>{ const lay=Math.abs(Math.abs(rx)-Math.PI/2)<.01;
        inst(glow?'glow':g,col,wx+(ox*c+oz*sn)*M,mv(h+oy),wz+(-ox*sn+oz*c)*M,sx*M,sy*M*(lay?1:VS),sz*M*(lay?VS:1),rx,ry,rz); },s,ry,R); };
    const heap=(K,cx,cy,h,w,d,n)=>{ let left=n, lay=0; while(left>0&&lay<6){ const k=1-lay*.17, cnt=Math.max(1,Math.round(n*(.34-lay*.05)));
        for(let i=0;i<cnt&&left>0;i++,left--)item(K,X(cx+RR(-.5,.5)*w*k),h+lay*K.s*1.3*K.h*.8,Z(cy+RR(-.5,.5)*d*k),K.s*1.3*RR(.85,1.15),RR(0,6.28)); lay++; } };
    const many=(K,w,d)=>Math.round((K.s<.05?8:4)*(w*d)/(.43*.24));
    const row=(K,a,b,c,d,h,f=1)=>{ const n=Math.max(1,Math.round((b-a)/.42)); for(let k=0;k<n;k++){ const w=(b-a)/n, cx=a+w*(k+.5)+RR(-.05,.05)*w, dd=(d-c)*.88; heap(K,cx,(c+d)/2,h,w*RR(.95,1.15),dd,Math.round(many(K,w,dd)*f*RR(.8,1.25))); } };
    const basket=(K,cx,cy,h,r,n)=>{ inst('cyl',0xa8844a,X(cx),mv(h+.09),Z(cy),r*M,mv(.18),r*M); inst('cyl',0x7a5a2e,X(cx),mv(h+.185),Z(cy),r*1.03*M,mv(.02),r*1.03*M); heap(K,cx,cy,h+.16,r*2.2/.84,r*2.2/.84,n); };
    const crate=(a,b,c,d,h0,h1,col=0x9a7044)=>{ box(a,b,c,d,h0,h1,col); box(a-.005,b+.005,c-.005,d+.005,(h0+h1)/2-.012,(h0+h1)/2+.012,0x6e4e2c); };
    const sack=(cx,cy,col=0xc8b080)=>{ inst('ball',col,X(cx),mv(.24),Z(cy),.2*M,mv(.24),.17*M); inst('cyl',0x9a8458,X(cx),mv(.5),Z(cy),.07*M,mv(.08),.07*M); };
    const H=.8, WOOD=0x9e7a4c, LEG=0x6e5434, RISER=0x8a6238, DARK=0x7a5c38, ki={i:0};
    const legs=(a,b,c,d,h)=>{ const L=.1; for(const [u,v] of [[a+.05,c+.05],[b-.05-L,c+.05],[a+.05,d-.05-L],[b-.05-L,d-.05-L]])box(u,u+L,v,v+L,0,h,LEG); };
    const table=(a,b,c,d,rise,ks)=>{ box(a,b,c,d,H-.05,H,WOOD); legs(a,b,c,d,H-.05); box(a+.1,b-.1,(c+d)/2-.03,(c+d)/2+.03,.25,.3,LEG); solid(a,b,c,d,H+.4);
      const along=rise==='y'?'x':'y', len=along==='x'?b-a:d-c, cols=Math.max(1,Math.round(len/.5));
      for(let st=0;st<3;st++){ const sh=H+st*.12;
        let sa=a,sb=b,sc=c,sd=d; if(rise==='y'){ sc=c+(d-c)*st/3; sd=c+(d-c)*(st+1)/3; } else if(rise==='+x'){ sa=a+(b-a)*st/3; sb=a+(b-a)*(st+1)/3; } else { sb=b-(b-a)*st/3; sa=b-(b-a)*(st+1)/3; }
        if(st)crate(sa+.01,sb-.01,sc+.01,sd-.01,H,sh,RISER);
        for(let k=0;k<cols;k++){ const K=ks[ki.i++%ks.length]; let pa,pb,pc,pd; if(along==='x'){ pa=a+len*k/cols; pb=a+len*(k+1)/cols; pc=sc; pd=sd; } else { pc=c+len*k/cols; pd=c+len*(k+1)/cols; pa=sa; pb=sb; }
          const cx=(pa+pb)/2, cy=(pc+pd)/2, w=(pb-pa)*.9, dd=(pd-pc)*.82;
          if(st===2&&ki.i%4===0)basket(K,cx,cy,sh,.11,6); else heap(K,cx,cy,sh,w,dd,Math.round(many(K,w,dd)*.6)); } } };
    const RW=veg?[KS.potato,KS.cabbage,KS.tomato,KS.eggplant]:[KS.puffball,KS.chanterelle,KS.redcap,KS.moonglow], RH=[.24,H,1.2,1.6];
    legs(xa,xb,ya,yb,H-.05); box(xa,xb,ya,yb,H-.05,H,WOOD); box(xa+.04,xb-.04,ya+.04,yb-.04,.2,.24,DARK); box(xa,xb,yb-.035,yb,H,1.78,DARK);
    box(xa,xb,yb-.5,yb,1.15,1.2,WOOD); box(xa,xb,yb-.3,yb,1.55,1.6,WOOD);
    for(const u of [xa,(xa+xb)/2-.04,xb-.08]){ box(u,u+.08,yb-.5,yb-.42,H,1.15,LEG); box(u,u+.08,yb-.3,yb-.22,1.2,1.55,LEG); box(u,u+.08,yb-.1,yb-.02,H,1.78,LEG); }
    row(RW[0],xa+.08,xb-.08,ya+.06,yb-.06,RH[0],.45); row(RW[1],xa+.04,xb-.04,ya+.03,yb-.52,RH[1],.8); row(RW[2],xa+.04,xb-.04,yb-.48,yb-.04,RH[2],.8); row(RW[3],xa+.04,xb-.04,yb-.28,yb-.04,RH[3],.9);
    solid(xa,xb,ya,yb,1.8);
    const CK=veg?[KS.carrot,KS.pepper,KS.corn,KS.onion,KS.greens,KS.tomato]:[KS.button,KS.bolete,KS.inkcap,KS.morel,KS.redcap,KS.chanterelle];
    table(x0,x1,CY0,CY1,'y',CK); table(x0,x0+.72,CY1+.02,CY1+.82,'+x',CK); table(x1-.72,x1,CY1+.02,CY1+.82,'-x',CK);
    const fx=(u0,u1)=>[Math.min(xo+fo*u0,xo+fo*u1),Math.max(xo+fo*u0,xo+fo*u1)];
    if(veg){ const SK=[KS.tomato,KS.cabbage,KS.pepper,KS.onion,KS.potato,KS.eggplant,KS.carrot,KS.corn]; let n=0;
      for(const [u0,u1] of [[.12,.66],[.7,1.24]])for(const [c,d,hi] of [[wy-.5,yb,3],[wy-.98,wy-.52,2],[wy-1.46,wy-1,1]]){ const [a,b]=fx(u0,u1), dh=.28+RR(-.02,.02), sh=RR(-.02,.02);
        for(let k=0;k<hi;k++)crate(a+sh,b+sh,c,d,k*.29,k*.29+dh,[0x9a7044,0x8a6238,0xa47a4a][(n+k)%3]); heap(SK[n++%SK.length],(a+b)/2+sh,(c+d)/2,(hi-1)*.29+dh-.08,(b-a)*.82,(d-c)*.8,9); solid(a,b,c,d,hi*.29); }
      const [pa,pb]=fx(.1,.95); for(let k=0;k<6;k++)item(KS.pumpkin,X(RR(pa,pb)),0,Z(RR(CY0-.1,CY0+.7)),KS.pumpkin.s*RR(.8,1.2),RR(0,6)); solid(pa,pb,CY0-.1,CY0+.7,.3);
      sack(fx(.4,.4)[0],wy-2.1); sack(fx(.85,.85)[0],wy-2.05,0xb89a6a); solid(...fx(.15,1.1),wy-2.35,wy-1.8,.5); }
    else { const [la,lb]=fx(.1,1.15), lz=Z(wy-.22); inst('cyl',0x6a4a2e,X((la+lb)/2),mv(.17),lz,mv(.17),(lb-la)*TILE,.17*M,0,0,Math.PI/2); for(let k=0;k<11;k++)item(MUSH.chanterelle,X(RR(la+.1,lb-.1)),.3,lz+RR(-.07,.07)*M,.04,0);
      solid(la,lb,wy-.42,yb,.35); const [sa]=fx(.55,.55); inst('cyl',0x5a3e24,X(sa),mv(.2),Z(CY0+.3),.2*M,mv(.4),.2*M); for(let k=0;k<7;k++)item(MUSH.bolete,X(sa)+RR(-.12,.12)*M,.4,Z(CY0+.3)+RR(-.12,.12)*M,.05,0); solid(sa-.28,sa+.28,CY0,CY0+.6,.4);
      basket(KS.button,fx(.45,.45)[0],wy-1.25,0,.16,12); basket(KS.redcap,fx(.5,.5)[0],wy-1.85,0,.15,11); solid(...fx(.2,.75),wy-2.1,wy-1.0,.3); }
    { const bx=xg-gate*.16, fz=Z(wy-.46), tz=Z(yb-.04), dy=mv(1.3), dz=tz-fz, a=Math.atan2(dz,dy), L=Math.hypot(dz,dy);
      TG.push(inst('cyl',0x8a6a3e,X(bx),dy/2,(fz+tz)/2,.02*M,L,.02*M,a), inst('box',0xc8a85a,X(bx),mv(.13),fz+.02*M,.3*M,mv(.26),.07*M,a), inst('box',0x9a3a2a,X(bx),mv(.27),fz+.05*M,.2*M,mv(.04),.06*M,a)); }
    const grp=(typeof MAPG!=='undefined'&&MAPG.park)||scene, c=new THREE.Color(), ME={}; let tris=0;
    const lam=new THREE.MeshLambertMaterial({color:0xffffff}), glow=new THREE.MeshBasicMaterial({color:0xffffff});
    for(const [g,L] of Object.entries(I)){ if(!L.length)continue; const geo=G[g==='glow'?'cap':g], me=ME[g]=new THREE.InstancedMesh(geo,g==='glow'?glow:lam,L.length);
      L.forEach(([m,col],i)=>{ me.setMatrixAt(i,m); me.setColorAt(i,c.setHex(col)); }); me.computeBoundingSphere&&me.computeBoundingSphere(); me.castShadow=g!=='glow'; me.receiveShadow=true; grp.add(me);
      tris+=L.length*(geo.index?geo.index.count:geo.attributes.position.count)/3; }
    const W=(x,y)=>({x:X(x),z:Z(y)}), HY=(CY1+ya)/2, sg=gate, far=wy-9, zone=[BX[0]-.7*TILE,Math.min(Z(CY0-1.4),Z(wy+.5)),BX[2]+.7*TILE,Math.max(Z(CY0-1.4),Z(wy+.5))];
    zones.push(zone); if(window.WEEDS&&WEEDS.clear)WEEDS.clear(zone);
    const S={x0,x1,y0:CY0,y1:yb,wy,veg,hx:X(xm),hz:Z(HY),fz:Z(far),tris:Math.round(tris),items:Object.values(I).reduce((a,L)=>a+L.length,0),zone,
      home:W(xm,HY), face:W(xm,far), shelf:[xa+.9,xm,xb-.9].map(x=>W(x,ya-.72)), shelfF:[xa+.9,xm,xb-.9].map(x=>W(x,wy+4)), counter:[x0+1.25,xm,x1-1.25].map(x=>W(x,CY1+.7)),
      wing:[[x0+1.45,-1],[x1-1.45,1]].map(([x,s])=>({p:W(x,CY1+.5),f:W(x+s*5,CY1+.5)})), broom:{p:W(xg-sg*.85,wy-1.35),f:W(xg+sg*.3,wy)},
      sweepIn:[W(xm+.9,HY+.1),W(xm-.9,HY+.1),W(xm,HY-.25),W(xg-sg*.85,wy-1.35)],
      sweepOut:[W(xg-sg*.85,wy-1.35),W(xg+sg*.85,wy-1.35),W(xg+sg*.85,CY0-.9),W(xm,CY0-.9),W(xo-sg*.3,CY0-.9),W(xm+sg*.4,CY0-.95),W(xg+sg*.85,CY0-.9),W(xg+sg*.85,wy-1.35),W(xg-sg*.85,wy-1.35)],
      broomOn:v=>{ for(const [g,i] of TG)ME[g].setMatrixAt(i,v?I[g][i][0]:Z0); for(const g of new Set(TG.map(a=>a[0])))ME[g].instanceMatrix.needsUpdate=true; }};
    made.push(S); return S; };
  const wrap=a=>((a+Math.PI*3)%(Math.PI*2))-Math.PI;
  const work=(N,S,o={})=>{ const st=N.st, c=N.rig, J={k:'stand',t:0,d:1,row:1,tray:o.tray?1:0,broom:0,item:0}, v0=st.v; c.job=J;
    S.N=N; N.free=()=>true; N.home={x:S.home.x,z:S.home.z}; st.x=S.home.x; st.z=S.home.z; st.to=st.next=null; st.hold=true; st.face=S.face;
    let plan=[], cur=null, wait=3+Math.random()*6, lk=0, lt=null, lw=0, ld=0;
    const pick=a=>a[Math.floor(Math.random()*a.length)], go=(p,v=1,sw=0)=>({go:p,v,sw}), act=(k,f,d,x)=>Object.assign({k,f,d},x);
    const off=()=>o.tray?[act('put',S.face,1.1,{end:{tray:0}})]:[], on=()=>o.tray?[act('grab',S.face,1.1,{mid:{tray:1}})]:[];
    const plans={
      tidy:()=>{ const i=Math.floor(Math.random()*S.shelf.length); return [...off(),go(S.shelf[i]),act('reach',S.shelfF[i],1.9,{row:Math.floor(Math.random()*4),mid:{item:1}}),go(pick(S.counter)),act('put',S.face,1.3,{mid:{item:0}}),act('pat',S.face,2.6),go(S.home),...on()]; },
      pat:()=>[act('pat',S.face,2.5+Math.random()*2.5)],
      look:()=>[],
      wing:()=>{ const w=pick(S.wing); return [...off(),go(w.p),act('pat',w.f,3.2),go(S.home),...on()]; },
      sweep:()=>{ const P=Math.random()<.5?S.sweepIn:S.sweepOut, L=[...off(),go(S.broom.p),act('reach',S.broom.f,1.2,{row:1,mid:{broom:1}})], m=Math.floor(P.length/2);
        P.forEach((p,i)=>{ L.push(go(p,.5,1)); if(i===m)L.push(act('sweep',S.face,2.5+Math.random()*2)); });
        return [...L,go(S.broom.p),act('reach',S.broom.f,1.2,{row:1,mid:{broom:0}}),go(S.home),...on()]; }};
    const set=s=>{ if(!s)return; Object.assign(J,s); if('broom' in s)S.broomOn(!s.broom); };
    const next=()=>{ if(cur)set(cur.end); cur=plan.shift()||null; J.t=0; st.to=null; st.v=v0;
      if(!cur){ J.k='stand'; st.face=S.face; wait=o.wait?o.wait():9+Math.random()*16; return; }
      if(cur.go){ st.to={x:cur.go.x,z:cur.go.z}; st.v=v0*cur.v; J.k=cur.sw?'sweep':'walk'; } else { st.face=cur.f; J.k=cur.k; J.d=cur.d; J.row=cur.row??1; } };
    const rel=p=>wrap(Math.atan2(p.x-st.x,p.z-st.z)-st.h);
    N.job=k=>{ plan=plans[k](); cur=null; next(); };
    const tk=N.tick; N.tick=(dt,you)=>{ if(!N.sheet){ J.t+=dt; c.lookT=1e9;
        if(cur){ if(cur.go){ if(!st.to)next(); } else { if(J.t>=cur.d/2&&!cur.m){ cur.m=1; set(cur.mid); } if(J.t>=cur.d)next(); } }
        else if((wait-=dt)<=0){ plan=plans[pick(o.jobs||['tidy','tidy','pat','sweep','sweep','wing'])](); next(); }
        let to=0, dn=0;
        if(J.k==='stand'){ if((lk-=dt)<=0){ lk=1.5+Math.random()*3; let bd=7*TILE; lt=null;
            for(const p of [you,...NPCS.filter(q=>q!==N&&!q.far&&q.lv==='up').map(q=>q.st)]){ const d=Math.hypot(p.x-st.x,p.z-st.z); if(d<bd&&d>.3*TILE&&Math.abs(rel(p))<1.6){ bd=d; lt=p; } }
            if(lt&&Math.random()<.2)lt=null; lw=Math.random()<.3?0:(Math.random()<.5?-1:1)*(.4+Math.random()*.7); ld=Math.random()<.2?.3:0; }
          to=lt?Math.max(-1.1,Math.min(1.1,rel(lt))):lw; dn=lt?0:ld; }
        else if(J.k!=='walk')dn=J.k==='reach'?(J.row>1?-.2:.3):.35;
        c.lookTo=to; c.down=(c.down||0)+(dn-(c.down||0))*Math.min(1,dt*3); }
      tk(dt,you); };
    return J; };
  const NO={k:'stand',t:0,d:1,row:1,tray:1,broom:0,item:0};
  const pose=(c,A)=>{ const J=c.job||NO, B=c.B, R=B.armR, L=B.armL, Hp=B.hips, t=J.t, u=Math.sin(Math.PI*Math.min(1,t/J.d)), w=Math.min(1,t*2,Math.max(0,J.d-t)*2), s=Math.sin(t*4.4);
    B.head.rotation.x+=c.down||0;
    if(A.drop&&!J.tray&&!J.broom){ R.rotation.x+=A.drop; L.rotation.x+=A.drop; }
    if(J.k==='reach'){ R.rotation.x-=A.reach[J.row]*u; L.rotation.x-=A.reach[J.row]*.35*u; Hp.rotation.x+=A.lean[J.row]*u; }
    else if(J.k==='put'||J.k==='grab'){ R.rotation.x-=A.put*u; L.rotation.x-=A.put*u; Hp.rotation.x+=.12*u; }
    else if(J.k==='pat'){ R.rotation.x-=(A.put+.28*Math.sin(t*6.3))*w; L.rotation.x-=(A.put+.28*Math.sin(t*6.3+2.4))*w; R.rotation.y+=.35*Math.sin(t*1.9)*w; L.rotation.y+=.3*Math.sin(t*1.5+1)*w; Hp.rotation.x+=.1*w; }
    if(J.item&&J.k==='walk'){ R.rotation.x=L.rotation.x=(A.drop||0)-A.put; }
    if(J.broom&&(J.k==='sweep'||J.k==='walk')){ const k=J.k==='sweep'?1:0; R.rotation.set(A.sw[0],s*.3*k,A.sw[1]); L.rotation.set(A.sw[2],s*.3*k,A.sw[3]); B.broom.rotation.set(k?0:-.45,s*.5*k,0); Hp.rotation.y+=s*.12*k; Hp.rotation.x+=.08*k; }
    B.broom.scale.setScalar(J.broom?1:1e-4); B.held.scale.setScalar(J.item?1:1e-4); if(B.tray)B.tray.scale.setScalar(J.tray?1:1e-4); };
  const made=[]; return {build,made,MUSH,VEG,zones,work,pose,face}; })();
window.STALL=STALL;
