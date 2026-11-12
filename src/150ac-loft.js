// THE LOFT: No. 4's flat (owner, 12 Nov 2026, of a photo: "match this layout exactly"): a tall room, a walnut upper floor along the blank wall with a library the length of it, a second deck across the front behind glass, the stair down from the landing by your door, timber beams and a truss under the ceiling, the front wall in brick, black pendants in the stairwell. The upper floor is walked (APTS.loftY), its rails and walls solid while you are up there (APTS.solidHi).
import {SHARED, THREE} from './003-shx.js';
import {MODS} from './006-map-pre.js';
import {ROOMK} from './150a-bedroom.js';
{ const APTS=MODS.apts;
  if(APTS&&APTS.R&&APTS.LOFT)ROOMK.parts.push(c=>{ '@apts'; const {apt,R,M,Lx,Ly,HW,part,mat,tex,solid,shelf,clip,du}=c, A=APTS.R, MPU=.907, V3=THREE.Vector3;
    const MH=3.5, mx=Lx-3.9, SW=1.1, sv0=2.94, sv1=7.8, N=19, RUN=(sv1-sv0)/(N-1), DK={u0:mx-3.2,v1:2.5}, RH=1.02;
    const WAL=[92,58,36], WAL2=[74,46,28], WHT=[234,232,226], STL=[22,22,24], TIM=[98,66,42], TIM2=[78,52,34];
    // many boxes in their own colours as one mesh: [geometry, rgb, x,y,z, rx,ry,rz]
    const merge=list=>{ let n=0; const ONE=new V3(1,1,1), G=list.map(([q,col,x,y,z,rx=0,ry=0,rz=0])=>{ const a=q.index?q.toNonIndexed():q; a.applyMatrix4(new THREE.Matrix4().compose(new V3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz)),ONE)); a.computeVertexNormals(); n+=a.attributes.position.count; return [a,col]; });
      const P=new Float32Array(n*3), Nn=new Float32Array(n*3), C=new Float32Array(n*3), cc=new THREE.Color(); let o=0;
      for(const [a,col] of G){ const k=a.attributes.position.count; P.set(a.attributes.position.array,o*3); Nn.set(a.attributes.normal.array,o*3); cc.setRGB(col[0]/255,col[1]/255,col[2]/255,THREE.SRGBColorSpace); for(let i=0;i<k;i++){ C[(o+i)*3]=cc.r; C[(o+i)*3+1]=cc.g; C[(o+i)*3+2]=cc.b; } o+=k; a.dispose(); }
      const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setAttribute('normal',new THREE.BufferAttribute(Nn,3)); g.setAttribute('color',new THREE.BufferAttribute(C,3)); return g; };
    const B=(w,h,d)=>new THREE.BoxGeometry(w,h,d), hs=(a,b)=>{ const s=Math.sin(a*127.1+b*311.7)*43758.5453; return s-Math.floor(s); };
    const vc=(o={})=>new THREE.MeshLambertMaterial({vertexColors:true,emissive:0x2a2622,...o}), L=[];
    const box=(u0,h0,v0,u1,h1,v1,col)=>L.push([B(u1-u0,h1-h0,v1-v0),col,(u0+u1)/2,(h0+h1)/2,(v0+v1)/2]);

    /* ---------- the upper floor: the long deck by the library, the deck across the front, the landing; white under, walnut edges and boards ---------- */
    const DECKS=[[mx,0,Lx,Ly],[DK.u0,0,mx,DK.v1],[mx-SW,sv1,mx,Ly]];
    for(const [u0,v0,u1,v1] of DECKS){ box(u0,MH-.2,v0,u1,MH-.015,v1,WHT); shelf(u0,v0,u1,v1,MH-.2,MH); }
    for(const [u0,v0,u1,v1] of [[mx-.03,DK.v1,mx,sv1],[DK.u0,DK.v1-.03,mx,DK.v1],[DK.u0-.03,0,DK.u0,DK.v1],[mx-SW-.03,sv1,mx-SW,Ly],[mx-SW,sv1-.03,mx,sv1]])box(u0,MH-.34,v0,u1,MH+.02,v1,WAL2);
    { const bt=tex(512,512,(g,W,H)=>{ g.fillStyle='#22140a'; g.fillRect(0,0,W,H); const rows=10, ph=H/rows; for(let r=0;r<rows;r++){ let x=-hs(r,1)*120; while(x<W){ const w=110+hs(r,x)*140, k=.82+hs(x,r+3)*.3; g.fillStyle=`rgb(${WAL[0]*k|0},${WAL[1]*k|0},${WAL[2]*k|0})`; g.fillRect(x+1,r*ph+1,w-2,ph-2);
            for(let i=0;i<5;i++){ g.strokeStyle=`rgba(40,22,10,${.1+hs(i,x+r)*.14})`; g.lineWidth=.6; g.beginPath(); const y=r*ph+3+hs(i+7,x)*(ph-6); g.moveTo(x+2,y); g.lineTo(x+w-2,y+(hs(i,r)-.5)*3); g.stroke(); } g.fillStyle='rgba(255,220,180,.1)'; g.fillRect(x+1,r*ph+1,w-2,1.5); x+=w; } } },true);
      const fm=mat([255,255,255],{map:bt}); R.loftFloor=fm;
      for(const [u0,v0,u1,v1] of DECKS){ const g=new THREE.PlaneGeometry(u1-u0,v1-v0).rotateX(-Math.PI/2), uv=g.attributes.uv; for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getY(i)*(v1-v0)/2.2,uv.getX(i)*(u1-u0)/2.2); part(g,fm,(u0+u1)/2,MH,(v0+v1)/2,0,apt,false); } }
    // slim steel posts under the front deck
    for(const [u,v] of [[DK.u0+.06,DK.v1-.06],[DK.u0+.06,.1],[mx-1.6,DK.v1-.06]]){ box(u-.045,0,v-.045,u+.045,MH-.2,v+.045,STL); solid(u-.07,v-.07,u+.07,v+.07,MH-.2); }

    /* ---------- the stair: walnut treads on a closed white flight, from the floor up to the landing; a white closet under the landing ---------- */
    for(let i=0;i<N-1;i++){ const h=(i+1)*MH/N, v=sv0+i*RUN; box(mx-SW,h-.05,v-.02,mx,h,v+RUN,WAL); box(mx-SW+.02,0,v,mx-.02,h-.05,v+RUN,WHT); }
    box(mx-SW,0,sv1,mx,MH-.2,Ly,WHT); box(mx-SW-.012,.02,sv1+.5,mx-SW,2.1,sv1+1.4,[214,212,206]); box(mx-SW-.03,1.0,sv1+1.28,mx-SW-.012,1.04,sv1+1.34,STL);
    solid(mx-SW-.06,sv0,mx-SW,sv1,MH); solid(mx-.03,sv0,mx+.03,sv1,MH); solid(mx-SW,sv1,mx,Ly,MH-.2);

    /* ---------- the rails: black steel, six bars between posts (level along the decks, raked up the stair); glass round the front deck ---------- */
    const rail=(u0,v0,h0,u1,v1,h1)=>{ const len=Math.hypot(u1-u0,v1-v0), n=Math.max(1,Math.round(len/1.3)), ry=Math.atan2(u1-u0,v1-v0), sl=Math.hypot(len,h1-h0), rx=-Math.atan2(h1-h0,len);
      for(let i=0;i<=n;i++){ const t=i/n, u=u0+(u1-u0)*t, v=v0+(v1-v0)*t, h=h0+(h1-h0)*t; L.push([B(.045,RH,.045),STL,u,h+RH/2,v]); }
      for(let k=0;k<6;k++){ const y=(k===5?RH-.01:.14+k*.165); L.push([B(k===5?.05:.018,k===5?.03:.018,sl),STL,(u0+u1)/2,(h0+h1)/2+y,(v0+v1)/2,rx,ry,0]); } };
    rail(mx,DK.v1,MH,mx,sv1,MH); rail(mx-SW,sv0,MH/N,mx-SW,sv1,MH); rail(mx-SW,sv1,MH,mx-SW,Ly-.05,MH);
    { const gm=APTS.glassMat?APTS.glassMat({opacity:.2}):mat([190,210,220],{transparent:true,opacity:.25});
      for(const [u0,v0,u1,v1] of [[DK.u0,DK.v1,mx-SW,DK.v1],[DK.u0,.04,DK.u0,DK.v1]]){ const len=Math.hypot(u1-u0,v1-v0), ry=u0===u1?Math.PI/2:0; part(new THREE.PlaneGeometry(len,RH-.06),gm,(u0+u1)/2,MH+RH/2+.03,(v0+v1)/2,ry,apt,false).userData.soft=1;
        L.push([B(u1-u0+.05,.06,v1-v0+.05),STL,(u0+u1)/2,MH+.03,(v0+v1)/2],[B(u1-u0+.03,.025,v1-v0+.03),STL,(u0+u1)/2,MH+RH,(v0+v1)/2]); }
      rail(mx-SW,DK.v1,MH,mx,DK.v1,MH); }

    /* ---------- the timber: tie beams across the room, a king post and its struts on one, the long beam over the deck's edge and its post; the white duct above the library ---------- */
    const BY=HW-1.05; for(const v of [1.5,4.4,7.3,9.5])L.push([B(Lx,.36,.3),hs(v,2)<.5?TIM:TIM2,Lx/2,BY,v]);
    L.push([B(.26,HW-BY-.18,.26),TIM,mx*.5,(HW+BY+.18)/2,4.4]); for(const s of [-1,1])L.push([B(.2,.2,2.6),TIM2,mx*.5+s*1.05,BY+.18+(HW-BY-.18)/2,4.4,0,Math.PI/2,s*Math.atan2(HW-BY-.3,2.1)]);
    L.push([B(.3,.4,Ly),TIM,mx,BY-.38,Ly/2]); L.push([B(.24,BY-.58-MH,.24),TIM2,mx,(MH+BY-.58)/2,DK.v1]);
    for(const v of [2.2,3.6,5.2,6.6,8.4])L.push([new THREE.CylinderGeometry(.05,.065,.13,10),STL,mx-.02,BY-.66,v,.5,0,0]);
    part(merge(L),vc(),0,0,0,0,apt);
    { const d=new THREE.CylinderGeometry(.24,.24,Ly-.5,18,6); d.rotateX(Math.PI/2); const dp=d.attributes.position; for(let i=0;i<dp.count;i++){ const z=dp.getZ(i), k=1+.02*Math.sin(z*26); dp.setX(i,dp.getX(i)*k); dp.setY(i,dp.getY(i)*k); } d.computeVertexNormals(); part(d,mat([238,238,236],{...clip('We')}),Lx-.6,MH+3.12,Ly/2,0,apt); }

    /* ---------- the library: walnut cases the length of the wall, six shelves high, full of books ---------- */
    { const Q=[], D=.34, y0=MH+.08, SH=.43, ROWS=6, v0=.2, v1=Ly-.2, cols=Math.round((v1-v0)/.98), cw=(v1-v0)/cols, top=y0+ROWS*SH, bx=(u0,h0,va,u1,h1,vb,col)=>Q.push([B(u1-u0,h1-h0,vb-va),col,(u0+u1)/2,(h0+h1)/2,(va+vb)/2]);
      bx(Lx-.03,y0-.08,v0,Lx-.005,top+.06,v1,WAL2); bx(Lx-D,y0-.08,v0,Lx,y0,v1,WAL); bx(Lx-D-.02,top,v0-.02,Lx,top+.07,v1+.02,WAL);
      for(let i=0;i<=cols;i++)bx(Lx-D,y0,v0+i*cw-.02,Lx,top,v0+i*cw+.02,WAL); for(let r=1;r<ROWS;r++)bx(Lx-D+.01,y0+r*SH-.014,v0,Lx,y0+r*SH+.014,v1,WAL);
      const PAL=[[150,40,36],[36,70,120],[196,170,96],[40,96,70],[226,220,204],[30,30,34],[170,96,44],[110,52,96],[60,110,140],[206,196,60],[120,30,30],[84,84,92]];
      for(let i=0;i<cols;i++)for(let r=0;r<ROWS;r++){ const a=v0+i*cw+.03, b=v0+(i+1)*cw-.03, fl=y0+r*SH+.014, k=hs(i,r); if(k<.07){ Q.push([new THREE.SphereGeometry(.09,8,6),[210,200,170],Lx-D/2,fl+.09,(a+b)/2]); continue; }
          let v=a; const end=k<.3?a+(b-a)*(.45+hs(r,i)*.3):b; while(v<end-.02){ const w=.022+hs(v*91,i+r)*.034, h=.2+hs(v*37,r)*.14, d=.16+hs(v*53,i)*.1, lean=v+w>end-.04&&end<b?.22:0; Q.push([B(d,h,w),PAL[Math.floor(hs(v*13,i*7+r)*PAL.length)],Lx-.05-d/2,fl+h/2,v+w/2,lean,0,0]); v+=w+.003; }
          if(k>.86)Q.push([B(.2,.05,.14),PAL[(i+r)%PAL.length],Lx-.16,fl+.025,b-.1,0,.3,0]); }
      part(merge(Q),vc({...clip('We')}),0,0,0,0,apt); }

    /* ---------- the stairwell's pendants: black domes on long cords, warm bulbs; two of them light the stair ---------- */
    { const P=[], bulbs=[], bm=new THREE.MeshBasicMaterial({color:0xffdca8}); for(const [du_,v,h] of [[.5,3.9,MH+1.9],[.72,4.8,MH+1.25],[.36,5.6,MH+1.6],[.6,6.5,MH+1.05]]){ const u=mx-du_; P.push([new THREE.CylinderGeometry(.006,.006,HW-h,5),STL,u,(HW+h)/2,v],[new THREE.SphereGeometry(.17,14,8,0,Math.PI*2,0,Math.PI*.62),STL,u,h-.1,v],[new THREE.CylinderGeometry(.03,.05,.08,10),STL,u,h+.06,v]); bulbs.push([u,h-.14,v]); }
      const pm=vc({side:THREE.DoubleSide}); part(merge(P),pm,0,0,0,0,apt); for(const [u,h,v] of bulbs)part(new THREE.SphereGeometry(.045,8,6),bm,u,h,v,0,apt,false);
      [bulbs[1],bulbs[3]].forEach(([u,h,v],i)=>{ const Lt=new THREE.PointLight(0xffc890,3.2,9*M,1.8); Lt.userData.pool=true; Lt.userData.i0=3.2; Lt.userData.on=true; Lt.position.set(u,h-.08,v); apt.add(Lt); R.ceil.push({id:'loft-pendant-'+(i+1),name:'STAIR PENDANT '+(i+1),L:Lt}); }); }

    /* ---------- walking it: the height under you up there, and what is solid on the upper floor ---------- */
    const onDeck=(u,v)=>DECKS.some(([u0,v0,u1,v1])=>u>=u0&&u<=u1&&v>=v0&&v<=v1), ax=apt.position.x, az=apt.position.z, fy=R.fy;
    APTS.loftY=(x,z)=>{ const u=(x-ax)/M, v=(z-az)/M, h=(SHARED.py-fy)/M; if(u>mx-SW&&u<mx&&v>sv0-.02&&v<sv1){ const hs_=Math.min(N-1,Math.max(1,Math.ceil((v-sv0)/RUN+.001)))*MH/N; return h>hs_-.75?fy+hs_*M:null; }
      return onDeck(u,v)&&h>MH-.75?fy+MH*M:null; };
    APTS.loftUp=()=>(SHARED.py-fy)/M>MH-.55;
    const hi=(u0,v0,u1,v1)=>APTS.solidHi(A.x0+u0/MPU,A.y0+v0/MPU,A.x0+u1/MPU,A.y0+v1/MPU), T=.08;
    hi(-.4,-.4,Lx+.4,0); hi(-.4,Ly,Lx+.4,Ly+.4); hi(-.4,0,0,Ly); hi(Lx-.36,0,Lx+.4,Ly);                                   // the walls; the library
    hi(mx-T,DK.v1,mx,sv1); hi(mx-SW-T,sv0,mx-SW,Ly); hi(DK.u0,DK.v1,mx,DK.v1+T); hi(DK.u0-T,0,DK.u0,DK.v1+T);              // the rails
    R.loft={MH,mx,SW,sv0,sv1,N,DECKS,top:[mx-SW/2,sv1+1.1],foot:[mx-SW/2,sv0-.7]}; });
  // the loft's own start: light oak below, the front wall in brick (yours to change in DECORATE)
  if(APTS&&APTS.R&&APTS.LOFT)ROOMK.built.push(A=>{ '@apts'; const R=A.R, D=A.walls.brick; if(!R.loft)return; if(D&&D.gen&&!D.t)D.t=D.gen(); const m=R.wallMats[0]; if(m&&D&&D.t){ m.map=D.t; m.bumpMap=D.t; m.color.set(0xffffff); m.userData.own=1; m.needsUpdate=true; } A.wall('white'); A.floor('oak');
    const tk=A.units().find(u=>u.kind==='FISH TANK'&&!u.added); if(tk){ const t=A.getT(tk); A.setT(tk,{...t,u:A.Lx-.66,v:5.95,ry:Math.PI/2}); } });   // the tank stands under the deck (the closet has its old place)
  window.LOFTDBG=()=>{ const A=ROOMK.api, R=A&&A.R, Lf=R&&R.loft; if(!Lf)return null; const W=(u,h,v)=>A.W(u,h,v); return {MH:Lf.MH,top:W(Lf.top[0],Lf.MH,Lf.top[1]).toArray(),foot:W(Lf.foot[0],0,Lf.foot[1]).toArray(),deck:W(Lf.mx+1.6,Lf.MH,A.Ly/2).toArray(),h:(SHARED.py-R.fy)/A.M,up:!!(APTS.loftUp&&APTS.loftUp()),HW:A.HW,M:A.M,fy:R.fy}; }; }
