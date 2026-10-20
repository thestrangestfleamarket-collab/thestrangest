{ const K=STORE.kit, {room,STEPS}=K, {X,Y,Z}=BOD, {hash,grain}=BOD.g, sh=BOD.K.sh, {PROPS,LAMPS}=BOD.STOREK, hs=hash;
  const B={id:'lclub',x0:432,y0:-98,x1:456,y1:-80,h:230}, W=B.x1-B.x0, D=B.y1-B.y0;
  const LOB={x0:16,y0:12,x1:24,y1:18}, BTH={x0:18,y0:0,x1:24,y1:6}, FLR={x0:5,y0:4,x1:15,y1:11}, BOOTH={x0:7,y0:.25,x1:13,y1:2.4}, BAR={x0:.15,y0:3,x1:1.6,y1:15};
  const at=(r,x,y,p=0)=>x>B.x0+r.x0-p&&x<B.x0+r.x1+p&&y>B.y0+r.y0-p&&y<B.y0+r.y1+p;
  const lit=c=>Object.assign([Math.min(255,c[0]),Math.min(255,c[1]),Math.min(255,c[2])],{e:1});
  STORE.bound.x1=Math.max(STORE.bound.x1,X(472));
  const CLUB=window.CLUB={B,on:false,drop:null};
  const brick=(u,z)=>{ const row=Math.floor(z/6), i=Math.floor(u*24+(row&1)*5), b=Math.floor(i/10); return {mortar:i%10===9||Math.floor(z)%6===5,b,row}; };
  const TAGC=[[230,60,170],[60,210,240],[240,220,60],[255,255,255],[140,240,90]];
  const tag=(u,z,seed)=>{ '@later'; const cell=Math.floor(u/3.2), r=hs(cell,seed,900); if(r>.45)return null; const cu=u-cell*3.2, h0=26+r*60, c=TAGC[Math.floor(r*97)%TAGC.length];
    if(cu<.4||cu>2.6||z<h0||z>h0+26)return null; const px=Math.floor(cu*24), py=Math.floor(z-h0), s=hs(cell,seed,901)*6;
    const on=Math.abs(py-13-8*Math.sin(px/5+s)-4*Math.sin(px/2.3+s*2))<2.2||(px%11<2&&Math.abs(py-13)<9); return on?c:null; };
  const poster=(u,z,seed)=>{ '@later'; const cell=Math.floor(u/2.1), r=hs(cell,seed,905); if(r<.7||z<70||z>130)return null; const cu=u-cell*2.1; if(cu<.4||cu>1.6)return null;
    const P=[[200,40,60],[30,30,40],[240,200,60],[40,90,200]][Math.floor(r*40)%4], py=z-70, px=Math.floor((cu-.4)*24);
    if(py>46)return [236,230,214]; if(py>40&&px%4<3)return [20,20,24]; if(Math.hypot(px-14,py-22)<9)return [236,230,214]; return hs(px,Math.floor(py),906)<.08?[150,140,130]:P; };
  const inner=(B_,nx,ny,Xw,Yw,z,f)=>{ '@later'; const u=nx?Yw:Xw; let c;
    if(at(BTH,Xw,Yw,.3)){ const tx=Math.floor(u*24/6), tz=Math.floor(z/6); c=(Math.floor(u*24)%6===0||Math.floor(z)%6===0)?[110,108,100]:sh([196,194,186],.85+.12*hs(tx,tz,910)); if(z<14)c=sh(c,.75); const t=tag(u,z,7); if(t)c=t; return sh(c,f); }
    if(at(LOB,Xw,Yw,.3)){ c=z<10?[40,20,20]:sh([96,24,30],.9+.1*grain(u*2,z/30,911,1)); if(z>150&&z<154)c=[160,130,60]; return sh(c,f); }
    const k=brick(u,z); c=k.mortar?[26,26,32]:sh([52,50,60],.86+.2*hs(k.b,k.row,912)); if(hs(Math.floor(u*24),Math.floor(z),913)<.02)c=[120,48,40];
    const p=poster(u,z,nx?3:ny>0?4:5); if(p)return sh(p,f); const t=tag(u,z,nx?11:ny); if(t)return sh(t,f*.9);
    if(z<8)c=[18,18,20]; return sh(c,f); };
  const outer=(nx,ny,Xw,Yw,z,f)=>{ '@later'; const u=nx?Yw:Xw, k=brick(u,z); let c=k.mortar?[22,22,26]:sh([38,38,44],.85+.22*hs(k.b,k.row,920));
    if(grain(u*1.4,z/26,921,1)>.72&&!k.mortar)c=sh([128,58,46],.8+.2*hs(k.b,k.row,922));
    if(z<20)c=sh(c,.7+z*.015); const t=z<110?tag(u,z,nx?21:ny>0?22:23):null; if(t)c=t; if(ny>0){ const p=poster(u-1.3,z,24); if(p&&Math.abs(Xw-(B.x0+20))>1.6)c=p; }
    if(z>B.h-8)c=[60,58,62]; return sh(c,f); };
  const floor=(x,y)=>{ '@later'; const px=Math.floor(x*24), py=Math.floor(y*24);
    if(at(BTH,x,y)){ const t=(px%5===0||py%5===0); return t?[80,80,78]:sh([150,152,150],.8+.15*hs(px>>2,py>>2,930)); }
    if(at(LOB,x,y)&&Math.abs(x-(B.x0+20))<1.2)return sh([110,24,32],.9+.1*hs(px>>1,py>>1,931));
    let c=sh([84,82,90],.9+.14*grain(x*1.5,y*1.5,932,.8)); if(grain(x*2.5,y*2.5,933,.6)>.7)c=sh(c,.72); if(hs(px,py,934)<.004)c=[190,170,90]; if(hs(px>>1,py>>1,935)<.003)c=[120,40,40]; return c; };
  const GL={S:'01111100001000001110000010000111110',T:'11111001000010000100001000010000100',A:'01110100011000111111100011000110001',I:'01110001000010000100001000010001110',C:'01111100001000010000100001000001111',L:'10000100001000010000100001000011111',U:'10001100011000110001100011000101110',B:'11110100011000111110100011000111110'};
  const neonW=(word,cell,atf,zc,col)=>{ const bs=[], c=Object.assign(col.slice(),{e:1}); [...word].forEach((ch,i)=>{ const g=GL[ch]; for(let r=0;r<7;r++)for(let q=0;q<5;q++)if(g[r*5+q]==='1')bs.push(atf(i*6+q,cell,zc-(r+1)*cell.z,c)); }); return bs; };
  K.offmap('CLUB STATIC',[426,-104,462,-74],()=>{ '@club'; const T=.1;
    const xw=[['lobw','y',B.x0+LOB.x0,B.y0+LOB.y0,B.y1-T,1,[],true],['lobs','x',B.y0+LOB.y0,B.x0+LOB.x0,B.x1-T,1,[{a0:B.x0+18.6,a1:B.x0+20.2,z0:0,z1:94}],true],
      ['bthw','y',B.x0+BTH.x0,B.y0+T,B.y0+BTH.y1,1,[{a0:B.y0+4.3,a1:B.y0+5.7,z0:0,z1:94}],true],['bthn','x',B.y0+BTH.y1,B.x0+BTH.x0,B.x1-T,1,[],true]];
    room('club','CLUB STATIC',B,{floor,in:inner,out:outer,cope:[60,58,62],roof:(x,y)=>sh([52,52,56],.9+.1*hs(Math.floor(x*2),Math.floor(y*2),940))},{w:'f',a:B.x0+20,wd:1.56,h:96},(B_,l0)=>{
      const thing=(name,boxes,o={})=>PROPS.push({kind:name,name,boxes,...o}), bx=(x0,y0,x1,y1,z0,z1,c,more={})=>({x0,y0,x1,y1,z0,z1,c,...more});
      const x0=B.x0, y0=B.y0;
      const GLS=[[120,170,190],[150,200,210]], BOT=[[40,110,60],[110,70,30],[170,190,180],[30,60,40]];
      const clutter=(x_,y_,z_,n,seed,spread=.5)=>{ const bs=[]; for(let i=0;i<n;i++){ const r=a=>hs(i,seed*13+a,950), x=x_+(r(1)-.5)*spread*2, y=y_+(r(2)-.5)*spread*2, bot=r(3)<.45;
          if(bot){ const c=BOT[Math.floor(r(4)*4)]; bs.push(bx(x-.04,y-.04,x+.04,y+.04,z_,z_+9,c,{top:()=>[30,30,30]}),bx(x-.017,y-.017,x+.017,y+.017,z_+9,z_+13,c)); }
          else{ const c=GLS[Math.floor(r(4)*2)]; bs.push(bx(x-.035,y-.035,x+.035,y+.035,z_,z_+5,c,{top:()=>r(5)<.5?[200,140,60]:[90,120,130],fs:(nx,ny,P,Q,z,s)=>sh(z<2?[200,140,60]:c,s)})); } } return bs; };
      const R0=[30,30,34], RS=[40,40,46];
      thing('DJ riser',[bx(x0+BOOTH.x0,y0+BOOTH.y0,x0+BOOTH.x1,y0+BOOTH.y1,0,14,R0,{top:(x,y)=>Math.floor(x*24)%12===0?[20,20,24]:[50,50,56],fs:(nx,ny,P,Q,z,s)=>sh(z>12?[220,200,60]:R0,s)})],{walk:1});
      thing('DJ booth',[bx(x0+8.2,y0+1.5,x0+11.8,y0+2.2,14,40,[24,24,28],{top:(x,y)=>{ const u=x-x0-8.2; if(u>.3&&u<1.1||u>2.5&&u<3.3){ const r=Math.hypot((u-(u<2?.7:2.9))*24,(y-y0-1.85)*24); return r<7?(r<1.5?[200,200,200]:Math.floor(r)%2?[30,30,34]:[50,50,56]):[70,70,76]; } return u>1.4&&u<2.2?(hs(Math.floor(x*24),Math.floor(y*24),951)<.3?lit([80,240,200]):[40,40,46]):[60,60,66]; },
          fs:(nx,ny,P,Q,z,s)=>ny>0?(z>18&&z<22?lit([255,40,170]):sh([24,24,28],s)):sh([24,24,28],s)}),bx(x0+9.6,y0+1.6,x0+10.4,y0+1.7,40,48,[40,40,44],{fs:(nx,ny,P,Q,z,s)=>ny>0?lit([150,190,255]):sh([40,40,44],s)})],{high:1});
      const spk=(sx)=>{ const bs=[]; for(let k=0;k<3;k++){ const z=k*30; bs.push(bx(sx,y0+.3,sx+1.6,y0+1.3,z,z+30,RS,{fs:(nx,ny,P,Q,zz,s)=>{ if(ny<=0)return sh(RS,s); const u=(P-sx)*24, r=Math.hypot(u-19,zz-15); return sh(r<11?(r<3?[90,90,96]:r<9?(Math.floor(r)%3?[26,26,30]:[34,34,40]):[60,60,66]):RS,s); }})); } return bs; };
      thing('speaker stack',spk(x0+5.2)); thing('speaker stack',spk(x0+13.2));
      thing('light wall',[bx(x0+7.2,y0+.1,x0+12.8,y0+.18,40,140,[30,30,34],{fs:(nx,ny,P,Q,z,s)=>{ if(ny<=0)return sh([30,30,34],s); const i=Math.floor((P-x0-7.2)*24/6), j=Math.floor(z/6), r=hs(i,j,952);
          return (Math.floor((P-x0)*24)%6===0||Math.floor(z)%6===0)?[16,16,20]:r<.33?lit([255,40,170]):r<.6?lit([40,200,255]):r<.75?lit([150,70,255]):[40,30,50]; }})],{high:1});
      const cX=x0+2.4, wood=[60,36,30];
      thing('bar counter',[bx(cX,y0+BAR.y0,cX+.7,y0+BAR.y1,0,40,wood,{top:(x,y)=>hs(Math.floor(x*24),Math.floor(y*24),953)<.03?[40,30,30]:[24,22,26],fs:(nx,ny,P,Q,z,s)=>z<3?lit([255,150,60]):sh(z>37?[24,22,26]:(Math.floor((nx?Q:P)*24)%16===0?[40,24,20]:wood),s)})]);
      const bb=[bx(x0+.12,y0+BAR.y0,x0+.5,y0+BAR.y1,0,36,[40,26,22],{top:()=>[30,24,24]})]; for(const z of [52,78,104])bb.push(bx(x0+.12,y0+BAR.y0,x0+.45,y0+BAR.y1,z,z+2,[200,150,90],{top:()=>lit([255,200,120])}));
      for(const z of [54,80,106])for(let y=BAR.y0+.1;y<BAR.y1-.1;y+=.13+hs(Math.floor(y*10),z,954)*.06){ const c=BOT[Math.floor(hs(Math.floor(y*10),z,955)*4)], h=10+hs(Math.floor(y*10),z,956)*8; bb.push(bx(x0+.2,y0+y,x0+.3,y0+y+.08,z,z+h,c,{top:()=>[30,30,30]})); }
      thing('back bar',bb,{high:1}); thing('back bar cabinet',[bx(x0+.12,y0+BAR.y0,x0+.6,y0+BAR.y1,0,36,[40,26,22],{top:()=>[30,24,24]})]);
      const stools=[]; for(let i=0;i<8;i++){ const y=y0+BAR.y0+.8+i*1.45; stools.push(bx(cX+1.05,y-.2,cX+1.45,y+.2,0,26,[50,50,54],{top:()=>[140,30,40]})); thing('bar stool',[stools[i]]); }
      thing('glasses on the bar',[...clutter(cX+.35,y0+5,40,6,1,.25),...clutter(cX+.35,y0+9,40,7,2,.25),...clutter(cX+.35,y0+13,40,5,3,.25)],{high:1});
      const sofa=(sx,sy,w)=>bx(sx,sy,sx+w,sy+.8,0,16,[70,20,60],{top:(x,y)=>y<sy+.25?[50,14,44]:[90,28,78],fs:(nx,ny,P,Q,z,s)=>sh(z>12?[96,32,84]:[70,20,60],s)});
      thing('sofa',[sofa(x0+16,y0+6.2,2.6),bx(x0+16,y0+6.2,x0+18.6,y0+6.45,16,30,[60,16,52])]); thing('sofa',[sofa(x0+19.4,y0+6.2,2.6),bx(x0+19.4,y0+6.2,x0+22,y0+6.45,16,30,[60,16,52])]);
      thing('low table',[bx(x0+16.6,y0+7.6,x0+18,y0+8.4,0,12,[40,40,44]),...clutter(x0+17.3,y0+8,12,7,4,.3)]); thing('low table',[bx(x0+20,y0+7.6,x0+21.4,y0+8.4,0,12,[40,40,44]),...clutter(x0+20.7,y0+8,12,6,5,.3)]);
      for(const [tx,ty,sd] of [[6,13.2,6],[10,14.6,7],[13.5,13,8]])thing('high table',[bx(x0+tx-.08,y0+ty-.08,x0+tx+.08,y0+ty+.08,0,36,[60,60,66]),bx(x0+tx-.4,y0+ty-.4,x0+tx+.4,y0+ty+.4,36,38,[30,30,34],{top:()=>[38,38,42]}),...clutter(x0+tx,y0+ty,38,4,sd,.25)]);
      thing('empties',[...clutter(x0+3.6,y0+16.8,0,5,9,.4),...clutter(x0+15.3,y0+3.2,0,4,10,.3)],{high:1});
      const bs=[]; for(let i=0;i<4;i++){ const sx=x0+BTH.x0+.4+i*1.5; bs.push(bx(sx,y0+.1,sx+.05,y0+1.7,6,84,[90,96,100])); } for(let i=0;i<3;i++){ const sx=x0+BTH.x0+.45+i*1.5; bs.push(bx(sx+.35,y0+.35,sx+.95,y0+.95,0,16,[220,220,214],{top:(x,y)=>Math.hypot(x-sx-.65,y-y0-.65)<.2?[60,80,90]:[230,230,224]})); bs.push(bx(sx+.05,y0+1.68,sx+.75,y0+1.72,6,84,[100,106,110])); }
      thing('stalls',bs,{solids:[0,1,2,3].map(i=>({x0:x0+BTH.x0+.4+i*1.5,y0:y0+.1,x1:x0+BTH.x0+.45+i*1.5,y1:y0+1.7}))});
      thing('sinks',[bx(x0+23.3,y0+2.4,x0+23.9,y0+5.4,0,32,[200,200,196],{top:(x,y)=>(Math.hypot(x-x0-23.6,y-y0-3.2)<.2||Math.hypot(x-x0-23.6,y-y0-4.6)<.2)?[90,100,110]:[220,220,216]})]);
      thing('cracked mirror',[bx(x0+23.84,y0+2.5,x0+23.9,y0+5.3,46,96,[150,170,180],{fs:(nx,ny,P,Q,z,s)=>{ const u=(Q-y0-2.5)*24; return Math.abs(z-60-(u-30)*.4)<.8||Math.abs(z-74+(u-36)*.7)<.8&&u>30?[230,240,240]:sh([120,140,150],s); }})],{high:1});
      thing('bin',[bx(x0+23.4,y0+.4,x0+23.8,y0+.8,0,18,[60,62,66],{top:()=>[220,220,210]})]);
      thing('coat check',[bx(x0+21.6,y0+13,x0+22.3,y0+17,0,38,[50,20,24],{top:()=>[30,26,26]})]);
      const coats=[]; for(let y=13.1;y<16.9;y+=.22){ const c=[[30,30,34],[80,60,40],[120,30,40],[40,50,80],[150,140,120]][Math.floor(hs(Math.floor(y*10),1,957)*5)]; coats.push(bx(x0+23.2,y0+y,x0+23.7,y0+y+.18,30,76,c)); }
      thing('coats',[bx(x0+23.4,y0+13,x0+23.5,y0+17,80,82,[150,150,150]),...coats]);
      const dX=x0+20, fy=B.y1;
      thing('neon STATIC',neonW('STATIC',{a:.13,z:7},(k,cl,z,c)=>bx(dX-2.3+k*cl.a+.01,fy+.06,dX-2.3+(k+1)*cl.a-.01,fy+.12,z+1,z+cl.z-1,c,{em:1}),196,[255,70,190]),{high:1});
      thing('neon CLUB',neonW('CLUB',{a:.07,z:4},(k,cl,z,c)=>bx(dX-.85+k*cl.a+.005,fy+.06,dX-.85+(k+1)*cl.a-.005,fy+.1,z+.5,z+cl.z-.5,c,{em:1}),140,[60,230,255]),{high:1});
      thing('door light',[bx(dX-.2,fy,dX+.2,fy+.35,104,110,[40,40,44]),bx(dX-.15,fy+.05,dX+.15,fy+.3,100,104,[255,230,190],{em:1})],{high:1});
      thing('steel door',[bx(dX-.84,fy,dX-.8,fy+1.5,0,96,[50,52,56],{fs:(nx,ny,P,Q,z,s)=>z>44&&z<48&&Q>fy+1.1&&Q<fy+1.3?[150,150,150]:sh(z<4?[30,30,34]:[50,52,56],s)})],{high:1});
      const rope=[]; for(let i=0;i<6;i++){ const rx=dX-1.6-i*1.7; rope.push(bx(rx-.05,fy+1.6,rx+.05,fy+1.7,0,30,[200,170,60],{top:()=>[230,200,90]})); if(i)rope.push(bx(rx,fy+1.63,rx+1.7,fy+1.67,20,23,[170,20,30])); }
      thing('rope line',rope,{solids:[{x0:dX-1.6-5*1.7,y0:fy+1.58,x1:dX-1.6,y1:fy+1.72}]});
      thing('fire exit',[bx(B.x0-.03,y0+8,B.x0,y0+9.6,0,92,[90,30,30]),bx(B.x0-.06,y0+8.5,B.x0,y0+9.1,98,106,[40,220,90],{em:1})],{walk:1,high:1});
      thing('dumpster',[bx(B.x0-2.2,y0+3,B.x0-.4,y0+5,0,32,[40,80,60],{top:(x,y)=>Math.floor(y*24)%8===0?[24,50,36]:[36,70,52]})]);
      const o={own:1,room:1,day:true}; LAMPS.push({x:x0+10,y:y0+7.5,z:150,r:10,c:[1,.2,.8],...o,club:'floor'},{x:x0+10,y:y0+2.6,z:110,r:6,c:[.3,.8,1],...o,club:'booth'},{x:x0+3.2,y:y0+9,z:120,r:8,c:[1,.62,.3],...o},
        {x:x0+19,y:y0+8.5,z:110,r:6,c:[.6,.3,1],...o},{x:x0+21,y:y0+3,z:110,r:5,c:[.8,.9,1],...o},{x:x0+20,y:y0+15,z:110,r:5,c:[1,.3,.3],...o});
      LAMPS.push({own:1,x:dX,y:fy+1,z:100,r:10,c:[1,.5,.85]},{own:1,x:B.x0-1,y:y0+9,z:120,r:9,c:[1,.66,.32]});
      thing('wall light',[bx(B.x0-.3,y0+8.8,B.x0,y0+9.2,120,126,[50,50,54]),bx(B.x0-.26,y0+8.84,B.x0-.02,y0+9.16,116,120,[255,190,110],{em:1})],{high:1});
      CLUB.spots={x0,y0,dX,fy,cX,stools:stools.map(s=>({x:(s.x0+s.x1)/2,y:(s.y0+s.y1)/2}))}; },{xw}); const hook=()=>{ try{ CLOCK.tick; }catch(e){ setTimeout(hook,400); return; } CLUB.hook(); }; hook(); });
  const BPM=124, BEAT=60/BPM, PAL=[[255,40,180],[40,210,255],[150,60,255],[255,170,40]];
  const init=()=>{ '@club'; if(CLUB.ready||!CLUB.spots)return; CLUB.ready=true; const S=CLUB.spots, x0=S.x0, y0=S.y0;
    const TL=new THREE.InstancedMesh(new THREE.PlaneGeometry(TILE*.92,TILE*.92).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xffffff}),70), m4=new THREE.Matrix4(), col=new THREE.Color();
    for(let j=0;j<7;j++)for(let i=0;i<10;i++){ m4.makeTranslation(X(x0+FLR.x0+i+.5),Y(.6),Z(y0+FLR.y0+j+.5)); TL.setMatrixAt(j*10+i,m4); TL.setColorAt(j*10+i,col.setRGB(.1,.05,.12)); }
    TL.instanceMatrix.needsUpdate=true; scene.add(TL); CLUB.tiles=TL;
    const P=[]; let n=0; const KINDS=['hero_m','hero_f','villager_m','villager_f'];
    const person=(x,y,face,o={})=>{ if(!window.PAWNNEW)return null; const kind=KINDS[n%4], key='club_'+(n++), Xw=X(x), Zw=Z(y), F=face?{x:X(face[0]),z:Z(face[1])}:null;
      const N=PAWNNEW(kind,key,{cloth:n*3.7+.5,npc:{x:Xw,z:Zw,free:()=>true,roam:false,ground:()=>0,brain:o.brain||((dt,you,st)=>{ if(!st.to){ st.hold=true; if(F)st.face=F; } })}});
      if(!N)return null; N.club=true; N.st.hold=true; N.g.position.set(Xw,0,Zw); N.st.h=F?Math.atan2(F.x-Xw,F.z-Zw):0; if(o.dwell)N.dwell=o.dwell; if(o.idle)N.idle=o.idle; if(o.talk)N.walker={talk:true}; P.push(N); return N; };
    const mid=[x0+(FLR.x0+FLR.x1)/2,y0+(FLR.y0+FLR.y1)/2];
    CLUB.dancers=[[5.6,5],[14.4,5.4],[6,10.4],[14,10.2],[8.4,11.5],[11.6,3.8],[10,8.6],[7.6,7]].map(([x,y])=>person(x0+x,y0+y,mid,{dwell:'UAL_Dance_Loop'}));
    for(const i of [1,3,5]){ const s=S.stools[i]; person(s.x+.55,s.y+.3,[s.x-1,s.y],{dwell:'UAL_Idle_Talking_Loop',talk:true}); }
    person(x0+6.6,y0+13.6,[x0+6,y0+13.2],{dwell:'UAL_Idle_Talking_Loop',talk:true}); person(x0+13.9,y0+13.6,[x0+13.5,y0+13],{dwell:'UAL_Idle_Talking_Loop',talk:true});
    person(x0+22.9,y0+15,[x0+20,y0+15]);
    CLUB.bouncer=person(S.dX+1.3,S.fy+.6,[S.dX+1.3,S.fy+4]);
    const QS=[0,1,2,3,4,5,6].map(i=>[S.dX-1.4-i*1.15,S.fy+1.05]), door=[S.dX,S.fy-.6];
    const Q=CLUB.queue=QS.map(([x,y])=>person(x,y,[S.dX,S.fy+1.05]));
    CLUB.qT=12; CLUB.qStep=dt=>{ if((CLUB.qT-=dt)>0)return; CLUB.qT=14+Math.random()*12;
      const first=Q.shift(); if(!first)return; first.st.hold=false; first.st.to={x:X(door[0]),z:Z(door[1])}; first.st.next=null; first.st.v=1.1*TILE; first.inside=true;
      Q.forEach((N,i)=>{ N.st.hold=false; N.st.to={x:X(QS[i][0]),z:Z(QS[i][1])}; N.st.v=.9*TILE; });
      setTimeout(()=>{ if(!first.st)return; first.st.to=null; const [x,y]=QS[QS.length-1]; first.st.x=X(x-6); first.st.z=Z(y+.4); first.g.position.set(first.st.x,0,first.st.z); first.st.to={x:X(x),z:Z(y)}; first.st.v=1*TILE; Q.push(first); },6000); };
    CLUB.people=P;
    const hb=new THREE.Mesh(new THREE.BoxGeometry(4*TILE,Y(48)-Y(0),1.4*TILE),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(X(x0+10),Y(30),Z(y0+1.6)); scene.add(hb);
    UI.thing({name:'THE DJ: DROP IT',obj:hb,reach:2.2*TILE,near:3.5*TILE,tall:1.2*TILE,act:()=>CLUB.dropIt()});
    if(RIG.mkMove&&!RIG.KEYMOVE.U){ const A=(l,r)=>({L:{ua:l[0],fa:l[1],fist:1},R:{ua:r[0],fa:r[1],fist:1}}), b=BEAT;
      const down=(s,arm)=>({root:[0,16.9,0],bend:8,nod:7,side:6*s,cyaw:14*s,...arm}), up={root:[0,18,0],bend:2,nod:-4,side:0,cyaw:0,...A([[30,30],[70,20]],[[30,30],[70,20]])};
      const hiL=A([[150,20],[160,10]],[[40,30],[100,20]]), hiR=A([[40,30],[100,20]],[[150,20],[160,10]]), pump=A([[120,30],[150,20]],[[120,30],[150,20]]);
      const ks=[[0,{}]]; for(let i=0;i<8;i++){ const t=(i+.5)*b/2+.08, arm=i<4?(i%2?hiR:hiL):pump; ks.push([t-b/4,down(i%2?-1:1,arm)],[t,up]); }
      ks.push([4*b+.25,{root:[0,18,0],bend:0,nod:0,side:0,cyaw:0,L:{ua:[9,8],fa:[19,8],fist:0},R:{ua:[9,8],fa:[19,8],fist:0}}]);
      RIG.MOVES.dance=RIG.mkMove({keys:ks.sort((p,q)=>p[0]-q[0]).filter((k,i,a)=>!i||k[0]>a[i-1][0]+.01)}); RIG.KEYMOVE.U='dance'; MOVEK.u='U'; }
    CLUB.sound(); };
  CLUB.sound=()=>{ '@club'; const A={}; CLUB.A=A; let next=0, n=0;
    const mk=c=>{ if(A.c===c)return true; A.c=c; A.lp=c.createBiquadFilter(); A.lp.type='lowpass'; A.lp.frequency.value=300; A.g=c.createGain(); A.g.gain.value=0; A.rg=c.createGain(); A.rg.gain.value=0;
      A.out=c.createGain(); A.lp.connect(A.g); A.g.connect(A.out); A.rg.connect(A.out); A.out.connect(c.destination);
      const nb=c.createBuffer(1,c.sampleRate,c.sampleRate), dd=nb.getChannelData(0); for(let i=0;i<dd.length;i++)dd[i]=Math.random()*2-1; A.noise=nb; next=c.currentTime+.1; A.t0=next; return true; };
    const env=(c,g,t,a,v,dcy)=>{ g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(v,t+a); g.gain.exponentialRampToValueAtTime(.0008,t+a+dcy); };
    const noise=(c,t,f,q,v,dcy,type='bandpass',to=A.lp)=>{ const s=c.createBufferSource(); s.buffer=A.noise; const bq=c.createBiquadFilter(); bq.type=type; bq.frequency.value=f; bq.Q.value=q; const g=c.createGain(); env(c,g,t,.002,v,dcy); s.connect(bq); bq.connect(g); g.connect(to); s.start(t,Math.random()*.5); s.stop(t+dcy+.05); return {bq,g}; };
    const tone=(c,t,type,f0,f1,v,dcy,cut=0)=>{ const o=c.createOscillator(); o.type=type; o.frequency.setValueAtTime(f0,t); if(f1)o.frequency.exponentialRampToValueAtTime(f1,t+.12); const g=c.createGain(); env(c,g,t,.003,v,dcy);
      if(cut){ const f=c.createBiquadFilter(); f.type='lowpass'; f.frequency.setValueAtTime(cut*3,t); f.frequency.exponentialRampToValueAtTime(cut,t+dcy*.6); o.connect(f); f.connect(g); } else o.connect(g); g.connect(A.lp); o.start(t); o.stop(t+dcy+.05); };
    const BASS=[55,0,55,65.4,0,55,73.4,0,49,0,49,55,0,49,61.7,0], CH=[[220,261.6,329.6],[196,246.9,293.7],[174.6,220,261.6],[164.8,207.7,246.9]];
    const beat=(c,t,i)=>{ const bar=Math.floor(i/4), q=i%4, dr=CLUB.drop, dropping=dr&&i>=dr.n0&&i<dr.n1, rising=dr&&i>=dr.r0&&i<dr.n0;
      tone(c,t,'sine',150,45,1,.32);
      noise(c,t+.035,3300,5,.5,.06,'bandpass',A.rg); noise(c,t+.05,5400,8,.25,.04,'bandpass',A.rg);
      noise(c,t+BEAT/2,8000,1,.18,.04,'highpass');
      if(q===1||q===3)noise(c,t,1500,1.2,.5,.16);
      for(let s=0;s<4;s++){ const f=BASS[(q*4+s)%16]*(bar%4===3&&s>1?1.122:1); if(f)tone(c,t+s*BEAT/4,'sawtooth',f,0,.32,.14,420); }
      if(q===0&&!rising)for(const f of CH[bar%4])tone(c,t,'sawtooth',f,0,.07,.45,1600);
      if(rising){ const k=(i-dr.r0)/(dr.n0-dr.r0); for(let s=0;s<(k>.5?4:2);s++)noise(c,t+s*BEAT/(k>.5?4:2),2200,1,.2+.3*k,.06); const r=noise(c,t,800+6000*k,2,.25*k,BEAT); r.bq.frequency.linearRampToValueAtTime(800+6000*(k+.125),t+BEAT); }
      if(dropping&&i===dr.n0){ noise(c,t,6000,.5,.9,2.2,'highpass'); for(let k=0;k<6;k++)noise(c,t+.2+k*.18,900+k*230,3,.35,.9); } };
    CLUB.audio=(here,where)=>{ const c=SFX.live&&SFX.live(); if(!c)return; mk(c); const v=SFX.on?SFX.vol:0, ct=c.currentTime;
      const d=where.d, open=where.hall?1:0, g0=here?v*Math.max(0,1-d/(60*TILE))*(open?.9:where.inside?.7:.55):0;
      A.g.gain.setTargetAtTime(g0,ct,.15); A.lp.frequency.setTargetAtTime(open?16000:where.inside?700:260,ct,.15); A.rg.gain.setTargetAtTime(here&&!open?v*(where.inside?.55:Math.max(0,.35-d/(30*TILE))):here?v*.06:0,ct,.15);
      if(!here){ next=Math.max(next,ct+.1); return; } while(next<ct+.3){ beat(c,next,n); n++; next+=BEAT; } CLUB.n=n; CLUB.tn=next; };
    CLUB.beatNow=()=>{ const c=A.c; if(c&&c.state==='running'&&CLUB.tn)return n-(CLUB.tn-c.currentTime)/BEAT; return performance.now()/1000/BEAT; }; };
  CLUB.dropIt=()=>{ const b=Math.ceil(CLUB.n||CLUB.beatNow()), r0=Math.ceil(b/4)*4; CLUB.drop={r0,n0:r0+8,n1:r0+8+16}; };
  const FOGC=new THREE.Fog(0x161020,2,200), FV=new THREE.Vector3();
  CLUB.hook=()=>{ '@later'; let recs=null, nRec=-1; const tick0=CLOCK.tick; CLOCK.tick=dt=>{ tick0(dt); if(!CLUB.spots)return; if(!CLUB.ready)init();
      const x=pos.x, z=pos.z, cx=X(B.x0+W/2), cz=Z(B.y0+D/2), d=Math.hypot(x-cx,z-cz), here=LVL==='up'&&d<60*TILE;
      const inC=x>X(B.x0)&&x<X(B.x1)&&Math.min(Z(B.y0),Z(B.y1))<z&&z<Math.max(Z(B.y0),Z(B.y1)), gx=x/TILE, at2=r=>{ const p=[[X(B.x0+r.x0),X(B.x0+r.x1)],[Z(B.y0+r.y0),Z(B.y0+r.y1)]]; return x>Math.min(...p[0])&&x<Math.max(...p[0])&&z>Math.min(...p[1])&&z<Math.max(...p[1]); };
      const hall=inC&&!at2(LOB)&&!at2(BTH); CLUB.where={d,inside:inC,hall,lobby:inC&&at2(LOB),bath:inC&&at2(BTH)};
      if(CLUB.audio)CLUB.audio(here,CLUB.where);
      if(CLUB.tiles)CLUB.tiles.visible=here;
      if(window.FAR3&&FAR3.mesh&&here){ FAR3.mesh.visible=false; if(FAR3.panels)FAR3.panels.visible=false; }
      if(here&&!ROOMS.cur){ const dd=-FV.copy(pos).applyMatrix4(cam.matrixWorldInverse).z; MISTE.x=0; FOGC.near=dd+8*TILE; FOGC.far=dd+34*TILE; scene.fog=FOGC; scene.background.copy(FOGC.color); }
      else if(scene.fog===FOGC)scene.fog=null;
      if(!here)return;
      let bt=CLUB.beatNow(); if(!isFinite(bt)||bt<0)bt=performance.now()/1000/BEAT; const bi=Math.floor(bt), dr=CLUB.drop, dropping=dr&&bi>=dr.n0&&bi<dr.n1, rising=dr&&bi>=dr.r0&&bi<dr.n0; if(dr&&bi>=dr.n1)CLUB.drop=null;
      const h8=Math.floor(bt*2); if(h8!==CLUB.h8){ CLUB.h8=h8; const bar=Math.floor(bi/4), q=bi%4, col=new THREE.Color(), dim=[.08,.04,.1];
        for(let j=0;j<7;j++)for(let i=0;i<10;i++){ let c=dim, P=PAL[(((bar+q)%4)+4)%4]||PAL[0], m=((bar%4)+4)%4;
          if(dropping)c=(h8+i+j)%2?[1,1,1]:dim; else if(rising)c=(h8%2&&hs(i,j,h8)<.5)?[1,1,1]:P.map(v=>v/255*.4);
          else if(m===0)c=(i+j+q)%2?P.map(v=>v/255):dim; else if(m===1)c=Math.round(Math.hypot(i-4.5,j-3))%4===q?P.map(v=>v/255):dim;
          else if(m===2)c=(i+q*3)%10<3||(i+q*3)%10===9?P.map(v=>v/255):dim; else c=hs(i,j,bi)<.4?PAL[Math.floor(hs(i,j,bi+7)*4)].map(v=>v/255):dim;
          CLUB.tiles.setColorAt(j*10+i,col.setRGB(...c)); } CLUB.tiles.instanceColor.needsUpdate=true;
        const P=PAL[(((bar+q)%4)+4)%4]||PAL[0];
        if(LITE.recs.length!==nRec){ nRec=LITE.recs.length; recs=LITE.recs.filter(L=>{ const p=L.position; return p.x>X(B.x0)-1&&p.x<X(B.x1)+1&&Math.abs(p.z-cz)<D*TILE/2; }); CLUB.recs=recs;
          for(const L of recs){ L.userData.c0=L.color.clone(); L.userData.ci=L.intensity; } }
        for(const L of recs||[]){ const fl=Math.abs(L.position.x-X(B.x0+10))<.5*TILE&&L.position.y>Y(140), bo=Math.abs(L.position.x-X(B.x0+10))<.5*TILE&&L.position.y<Y(140);
          if(fl){ L.color.setRGB(...(dropping?[1,1,1]:P.map(v=>v/255))); L.intensity=L.userData.ci*(dropping&&h8%2?1.6:1); }
          else if(bo)L.intensity=L.userData.ci*(h8%2?.6:1.5); } }
      if(CLUB.qStep)CLUB.qStep(dt);
      for(const N of CLUB.dancers||[])if(N&&N.mixer){ const a=N.act&&N.act('UAL_Dance_Loop'); if(a)a.timeScale=dropping?1.5:1; } }; };
  window.CLUBDBG=()=>({mv:st.move&&st.move.name,cur:ROOMS.cur&&ROOMS.cur.id,recsI:(CLUB.recs||[]).map(L=>+L.intensity.toFixed(1)),ready:!!CLUB.ready,where:CLUB.where,beat:CLUB.beatNow&&+CLUB.beatNow().toFixed(2),drop:CLUB.drop,people:(CLUB.people||[]).length,recs:(CLUB.recs||[]).length,audio:!!(CLUB.A&&CLUB.A.c)});
  window.CLUBLOOK=(dx=12,dy=9,k=.5,d)=>{ if(d!=null)LOOKYAW(d); return LOOKAT(X(B.x0+dx),Z(B.y0+dy),k); };
  window.CLUBGO=(dx=10,dy=13)=>{ STORE.offGo('CLUB STATIC'); if(window.SUBGO)SUBGO(X(B.x0+dx),Z(B.y0+dy),'up'); return CLUBDBG(); }; }
