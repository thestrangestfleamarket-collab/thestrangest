// THE NIGHT MARKET: an off-map neon container-market courtyard (stacked shipping-container shops, catwalk, grime, night fog) built in the engine's own CEL look.
import {SHARED, THREE} from './003-shx.js';
import {FAR3, pos, ROOMS} from './003b-systems.js';
import {scene} from './004-main.js';
import {grab, MISTE, STORE, SYS, TILE} from './006-map-pre.js';
await grab('nightmkt',async()=>{ const K=STORE.kit, {room,flat}=K, {X,Y,Z}=SHARED.BOD, {hash:hs,grain}=SHARED.BOD.g, sh=SHARED.BOD.K.sh, {PROPS,LAMPS}=SHARED.BOD.STOREK;
  const B={id:'lnmkt',x0:424,y0:-104,x1:456,y1:-81.6,h:152}, S=1.6, ZM=38, mx=m=>B.x0+m*S, my=m=>B.y0+m*S;
  STORE.bound.x1=Math.max(STORE.bound.x1,X(470));
  K.offmap('THE NIGHT MARKET',[418,-110,462,-70],()=>{ '@nightmkt';
    const lit=c=>Object.assign([c[0],c[1],c[2]],{e:1}), hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
    const pic=(w,h,f)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; const g=c.getContext('2d'); f(g,w,h); const d=g.getImageData(0,0,w,h).data;
      return (u,v)=>{ const i=Math.min(w-1,Math.max(0,Math.floor(u*w))), j=Math.min(h-1,Math.max(0,Math.floor(v*h))), k=(j*w+i)*4; return d[k+3]<128?null:[d[k],d[k+1],d[k+2]]; }; };
    const F3={A:'010101111101101',B:'110101110101110',C:'111100100100111',D:'110101101101110',E:'111100110100111',F:'111100110100100',G:'111100101101111',H:'101101111101101',I:'111010010010111',J:'001001001101111',K:'101101110101101',L:'100100100100111',M:'101111111101101',N:'110101101101101',O:'111101101101111',P:'111101111100100',Q:'111101101111001',R:'111101110101101',S:'111100111001111',T:'111010010010010',U:'101101101101111',V:'101101101101010',W:'101101111111101',X:'101101010101101',Y:'101101010010010',Z:'111001010100111',0:'111101101101111',1:'010110010010111',2:'111001111100111',3:'111001111001111',4:'101101111001001',5:'111100111001111',6:'111100111101111',7:'111001001001001',8:'111101111101111',9:'111101111001111','-':'000000111000000','.':'000000000000010','&':'010101010101011',"'":'010010000000000','!':'010010010000010'};
    const txt=(g,s,x,y,k,col)=>{ g.fillStyle=col; [...s].forEach((ch,i)=>{ const q=F3[ch]; if(!q)return; for(let r=0;r<5;r++)for(let c=0;c<3;c++)if(q[r*3+c]==='1')g.fillRect(x+(i*4+c)*k,y+r*k,k,k); }); };
    const tw=(s,k)=>(s.length*4-1)*k, ctxt=(g,s,cx,y,k,col)=>txt(g,s,Math.round(cx-tw(s,k)/2),y,k,col);
    const SIDE={e:[1,0],w:[-1,0],f:[0,1],b:[0,-1]}, FACE={b:'f',f:'b',e:'e',w:'w'};
    const fu=(sd,b,P,Q)=>sd==='e'?(b.y1-Q)/(b.y1-b.y0):sd==='w'?(Q-b.y0)/(b.y1-b.y0):sd==='f'?(P-b.x0)/(b.x1-b.x0):(b.x1-P)/(b.x1-b.x0);
    const bx=(x0,y0,x1,y1,z0,z1,c,o={})=>({x0:Math.min(x0,x1),y0:Math.min(y0,y1),x1:Math.max(x0,x1),y1:Math.max(y0,y1),z0,z1,c,...o});
    const mb=(x0,z0,x1,z1,h0,h1,c,o)=>bx(mx(x0),my(z0),mx(x1),my(z1),h0*ZM,h1*ZM,c,o);
    const pb=(b,sd,p,glow)=>{ const [ax,ay]=SIDE[sd]; b.fs=(nx,ny,P,Q,z,s)=>{ if(nx===ax&&ny===ay){ const r=p(fu(sd,b,P,Q),1-z/(b.z1-b.z0)); if(r)return glow&&!b.em?lit(r):r; } return b.em?b.c:sh(b.c,s); }; return b; };
    const thing=(name,boxes,o={})=>PROPS.push({kind:name,name,boxes,...o});
    const lamp=(x,z,h,r,c,o={})=>LAMPS.push({own:1,room:1,day:true,x:mx(x),y:my(z),z:h*ZM,r,c,...o});
    const wallAt={b:m=>[mx(m),B.y0+.1],f:m=>[mx(m),B.y1-.1],e:m=>[B.x0+.1,my(m)],w:m=>[B.x1-.1,my(m)]};
    const onWall=(name,wl,u,h0,h1,wm,p,o={})=>{ const [x,y]=wallAt[wl](u), sd=FACE[wl], [ax,ay]=SIDE[sd], t=o.t||.06, hw=wm*S/2;
      const b=ax?bx(x,y-hw,x+ax*t,y+hw,h0*ZM,h1*ZM,o.c||[14,13,16],{em:o.em}):bx(x-hw,y,x+hw,y+ay*t,h0*ZM,h1*ZM,o.c||[14,13,16],{em:o.em});
      thing(name,[pb(b,sd,p,o.glow)],{high:1}); };
    const halo=(g,w,h,col)=>{ const d=g.getImageData(0,0,w,h), a=d.data, m=new Uint8Array(w*h); for(let i=0;i<w*h;i++)m[i]=a[i*4+3]>0?1:0;
      const grow=src=>{ const o=new Uint8Array(w*h); for(let y=0;y<h;y++)for(let x=0;x<w;x++){ if(src[y*w+x]){ o[y*w+x]=1; continue; } for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const X_=x+dx,Y_=y+dy; if(X_>=0&&Y_>=0&&X_<w&&Y_<h&&src[Y_*w+X_]){ o[y*w+x]=1; break; } } } return o; };
      const r1=grow(grow(m)), r2=grow(grow(r1)), [cr,cg,cb]=hex(col);
      for(let i=0;i<w*h;i++){ if(m[i])continue; const k=r1[i]?.5:r2[i]?.24:0; if(!k)continue; a[i*4]=cr*k; a[i*4+1]=cg*k; a[i*4+2]=cb*k; a[i*4+3]=255; } g.putImageData(d,0,0); };
    const neon=(s,col,core,k,pad=6)=>{ const w=tw(s,k)+pad*2+4, h=5*k+pad*2+4; return [w,h,pic(w,h,g=>{
      txt(g,s,pad+2-1,pad+2,k,col); txt(g,s,pad+2+1,pad+2,k,col); txt(g,s,pad+2,pad+1,k,col); txt(g,s,pad+2,pad+3,k,col); txt(g,s,pad+2,pad+2,k,core); halo(g,w,h,col);
      const d=g.getImageData(0,0,w,h); for(let i=3;i<d.data.length;i+=4)if(!d.data[i]){ d.data[i-3]=10; d.data[i-2]=9; d.data[i-1]=14; d.data[i]=255; } g.putImageData(d,0,0); })]; };
    const sign=(name,wl,u,hc,s,col,core,k,mpp)=>{ const [w,h,p]=neon(s,col,core,k,6), wm=w*mpp, hm=h*mpp; onWall(name,wl,u,hc-hm/2,hc+hm/2,wm,p,{em:1,t:.05}); };

    // --- surfaces: corrugated steel, wet grimy concrete, dark night roof ---
    const rib=u=>{ const r=Math.sin(u*34); return .68+.26*r*r; };
    const steel=(base,u,z,seed)=>{ let k=rib(u); if(z<9)k*=.62+.042*z; if(hs(Math.floor(u*22),0,seed)>.82)k*=.68; k*=.9+.2*hs(Math.floor(u*60),Math.floor(z/3),seed+1); return sh(base,k); };
    const inner=(B_,nx,ny,Xw,Yw,z,f)=>{ const u=nx?Yw:Xw, base=hs(Math.floor(u*2.2),0,730)<.5?[52,58,66]:[46,50,60]; return sh(steel(base,u,z,731),f); };
    const outer=(nx,ny,Xw,Yw,z,f)=>sh([24,26,32],f*.9);
    const floor=(x,y)=>{ const px=Math.floor(x*24), py=Math.floor(y*24), r=hs(px,py,740);
      if(px%34===0||py%34===0)return [26,28,34];
      let base=sh([50,54,62],.8+.3*r);
      if(hs(px>>1,py>>2,741)>.9)base=sh(base,.6);
      const p=hs(px>>2,py>>2,742); if(p>.9)return lit([16,34,46].map(q=>Math.round(q*(.7+.6*hs(px,py,743)))));
      if(p>.86)base=sh([30,40,48],.9);
      return base; };

    const dkw=[36,30,24], steelC=[150,154,162], rust=[120,74,46];
    // a stacked shipping container (corrugated, worn), optional lit roll-door
    const container=(x0,z0,x1,z1,h0,h1,base,o={})=>mb(x0,z0,x1,z1,h0,h1,base,{top:()=>sh(base,.6),
      fs:(nx,ny,P,Q,z,s)=>{ const uu=(nx?Q:P), zz=z/ZM, k=rib(uu)*(zz<.3?.7:1), c=o.rust&&hs(Math.floor(uu*20),0,750)>.78?sh(base,.72):base; return sh(c,k*s); }});

    const door={w:'f',a:mx(10),wd:2.6,h:94};
    room('nightmkt','THE NIGHT MARKET',B,{floor,in:inner,out:outer,cope:[22,22,28],roof:(x,y)=>sh([12,12,18],.85+.15*hs(Math.floor(x*2),Math.floor(y*2),760))},door,()=>{
      // ---- container shop row along the back wall (b) ----
      const COLORS=[[58,78,96],[92,70,52],[70,86,70],[96,62,72],[62,66,96]];
      const shops=[['VOLTWORKS','#3cf0ff','#d8ffff',2.6],['IRONJAW','#ff8a2a','#ffe0c0',6.9],['NOODLE 9','#ff3ca8','#ffd8ec',11.0],['AMP CITY','#5aff6a','#d8ffe0',15.1]];
      shops.forEach(([nm,col,core,u],i)=>{ const base=COLORS[i%COLORS.length];
        thing('container: '+nm.toLowerCase(),[container(u-1.9,.3,u+1.9,2.3,0,1.55,base,{rust:1}),
          mb(u-1.95,.25,u+1.95,2.35,1.55,1.62,dkw),
          mb(u-1.6,.42,u-1.52,2.1,0,1.5,sh(base,.7)), mb(u+1.52,.42,u+1.6,2.1,0,1.5,sh(base,.7)),
          mb(u-.6,2.28,u+.6,2.3,0,1.08,lit([255,150,60].map(q=>Math.round(q*(i%2?.8:.55)))),{em:1})]);
        sign('neon '+nm.toLowerCase(),'b',u,2.02,nm,col,core,3,.02);
        lamp(u,1.4,1.95,4.5,i%2?[1.0,.5,.3]:[.4,.8,1.1]); });

      // ---- a second stacked tier of containers (upper) along the back ----
      for(const [u,w,base] of [[4.4,2.0,[70,74,84]],[9.0,2.2,[90,64,50]],[13.4,2.0,[60,80,72]]])
        thing('upper container',[container(u-w,.4,u+w,2.0,1.7,3.05,base,{rust:1}),mb(u-w-.05,.35,u+w+.05,2.05,3.05,3.12,dkw)]);

      // ---- catwalk + railing + stairs along the east wall ----
      const CW=1.65, ex0=16.4, ex1=18.8;
      thing('catwalk',[mb(ex0,.6,ex1,13.4,CW,CW+.08,[46,48,54],{top:(X_,Y_)=>Math.floor(Y_*24)%4===0?[30,32,38]:sh([70,74,82],.9)})],{walk:1});
      const rail=(z0,z1,xe)=>{ const bs=[]; bs.push(bx(mx(xe)-.03,my(z0),mx(xe)+.03,my(z1),CW*ZM,(CW+.5)*ZM,[60,62,70])); const n=Math.max(1,Math.round((z1-z0)/1.2));
        for(let i=0;i<=n;i++){ const zz=z0+(z1-z0)*i/n; bs.push(bx(mx(xe)-.04,my(zz)-.04,mx(xe)+.04,my(zz)+.04,CW*ZM,(CW+.5)*ZM,[52,54,62])); } return bs; };
      thing('catwalk rail',[...rail(.6,13.4,ex0),...rail(.6,13.4,ex1)],{high:1});
      { const bs=[], n=8; for(let i=0;i<n;i++){ const zz=12.8-i*0.42, h=CW*(1-i/n); bs.push(mb(ex0-1.3,zz-.2,ex0,zz+.2,Math.max(0,h-CW/n*1.2),h,[52,54,60])); } thing('catwalk stairs',bs); }
      lamp(17.6,3,CW+1.1,5,[1.0,.86,.6]); lamp(17.6,10.5,CW+1.1,5,[.5,.7,1.1]);

      // ---- signs on the side walls ----
      sign('neon SALVAGE','w',6.5,3.0,'SALVAGE','#ffb43c','#fff0d0',2,.02);
      sign('neon OPEN ALL NIGHT','w',6.5,2.3,'OPEN ALL NIGHT','#ff3c6a','#ffd0d8',2,.018);
      sign('neon NIGHT MARKET','e',4.0,3.1,'NIGHT MARKET','#a46bff','#ead8ff',2,.02);

      // ---- hanging pendant lamps over the yard ----
      const pendant=(u,z,h)=>thing('pendant lamp',[mb(u-.008,z-.008,u+.008,z+.008,h,h+1.0,[18,18,22]),mb(u-.16,z-.16,u+.16,z+.16,h-.14,h,[26,26,30]),mb(u-.1,z-.1,u+.1,z+.1,h-.2,h-.12,lit([255,224,170]))],{high:1});
      pendant(6,6,3.2); pendant(11,8.5,3.2); pendant(8.5,4.2,3.0);
      lamp(6,6,3.0,6,[1.8,1.5,.9]); lamp(11,8.5,3.0,6,[1.7,1.4,1.0]);

      // ---- lived-in clutter: crates, barrels, pipes, a dumpster, cables ----
      const crate=(u,z,s,c)=>mb(u-s,z-s,u+s,z+s,0,s*1.6,c,{top:()=>sh(c,.7),fs:(nx,ny,P,Q,zz,sh_)=>sh((Math.floor(((nx?Q:P))*24)%8<1)?sh(c,.6):c,sh_)});
      thing('crates',[crate(3,8.5,.34,[96,70,42]),crate(3.5,9.0,.3,[70,80,96]),crate(3.2,9.4,.28,[90,60,66]),crate(13.5,10.5,.36,[80,80,70]),crate(14.1,10.2,.3,[96,70,42])]);
      const barrel=(u,z,c)=>{ const bs=[],R=.26; for(let k=0;k<8;k++){ const a=k/8*6.283,b=(k+1)/8*6.283; bs.push(mb(u+Math.cos(a)*R,z+Math.sin(a)*R,u+Math.cos(b)*R,z+Math.sin(b)*R,0,1.0,c)); } bs.push(mb(u-R,z-R,u+R,z+R,1.0,1.04,sh(c,1.2))); return bs; };
      thing('barrels',[...barrel(4.3,10.0,[58,74,58]),...barrel(4.8,10.4,[86,54,40]),...barrel(12.9,9.6,[52,58,70])]);
      thing('oil drum fire',[...barrel(8.2,11.2,[40,34,30])],{high:0});
      lamp(8.2,11.2,1.1,3.5,[2.2,1.0,.35],{fire:1});
      thing('drainpipes',[mb(.25,2,.33,2.08,0,3.0,[60,62,70]),mb(.25,7,.33,7.08,0,3.0,[60,62,70]),mb(19.6,11,19.68,11.08,0,3.0,[60,62,70])],{high:1});
      thing('dumpster',[mb(1.0,11.5,2.6,12.8,0,.95,[48,70,58],{top:()=>[30,44,36]}),mb(1.0,11.5,2.6,12.8,.95,1.02,[30,44,36])]);
      // overhead cables with a few hanging bulbs
      { const bs=[]; for(let i=0;i<=12;i++){ const u=2+i*1.4, z=3+Math.sin(i*.8)*.3, h=3.4-.12*Math.sin(i*.9); bs.push(mb(u-.01,z-.01,u+.7,z+.3,h,h+.02,[16,16,20]));
          if(i%3===0)bs.push(mb(u-.03,z-.03,u+.03,z+.03,h-.14,h-.08,lit([255,210,150]))); } thing('string lights',bs,{high:1}); }

      // ---- the yard's far "sky" above: a very dark gradient so the roof reads as night, plus a faint skyline strip ----
      sign('neon MARKET ST','f',14.5,2.6,'MARKET ST','#3cf0ff','#d8ffff',2,.018);
    },{});

    // ---- atmosphere: when you're in the lot, dark night fog + hide the far world ----
    const LOT={x0:X(B.x0-6),x1:X(B.x1+6),z0:Z(B.y0-6),z1:Z(B.y1+6)}, on=()=>SHARED.LVL==='up'&&pos.x>LOT.x0&&pos.x<LOT.x1&&pos.z>LOT.z0&&pos.z<LOT.z1;
    const FG=new THREE.Fog(0x0a0d14,2,200), V3=new THREE.Vector3(); let was=false;
    SYS.add('places',()=>{ const here=on();
      if(!here){ if(was){ was=false; if(scene.fog===FG)scene.fog=null; } return; } was=true;
      if(window.FAR3&&FAR3.mesh){ FAR3.mesh.visible=false; if(FAR3.panels)FAR3.panels.visible=false; }
      if(ROOMS.cur){ if(scene.fog===FG)scene.fog=null; return; }
      const d=-V3.copy(pos).applyMatrix4(SHARED.cam.matrixWorldInverse).z; MISTE.x=0; FG.near=d+6*TILE; FG.far=d+36*TILE; scene.fog=FG; if(scene.background&&scene.background.copy)scene.background.copy(FG.color); },'059c-market');
  });
});
