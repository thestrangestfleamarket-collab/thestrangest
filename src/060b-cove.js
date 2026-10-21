// THE COVE: a misty torch-lit cave by a still inlet in the North Woods, with a wooden pier over the water (owner, 21 Oct 2026).
const COVE={ready:false}; window.COVE=COVE;
{
  // footprint reserved so the park's trees/hills/undergrowth leave the cove, the water and the pier clear
  COVE.keep=P=>{ if(!COVE.S){ const [rx,ry]=P.round, c={x:rx-14,y:P.y1-12.5}, R=4, wc={x:c.x,y:c.y-9}, wr=3.8;
      COVE.S={c,R,wc,wr}; const X=x=>BOD.XS(x+(P.ox||0)), Z=y=>BOD.ZS(y+(P.oy||0));
      if(typeof STORE!=='undefined'&&STORE.places)STORE.places.push(['THE COVE',X(c.x),Z(wc.y-wr-1.5),'up',null,0]); }
    const {c,R,wc,wr}=COVE.S; return [[Math.min(c.x-R-2,wc.x-wr-2),wc.y-wr-3,Math.max(c.x+R+2,wc.x+wr+2),c.y+R+3]]; };

  const hs=(a,b,c=0)=>{ const s=Math.sin(a*127.1+b*311.7+c*74.7)*43758.5453; return s-Math.floor(s); };
  const foot=(R,a)=>R/Math.pow(Math.pow(Math.abs(Math.cos(a)),3)+Math.pow(Math.abs(Math.sin(a)),3),1/3);
  const amouth=(a,MA)=>Math.atan2(Math.sin(a-MA),Math.cos(a-MA));   // signed angle from the mouth's heading

  const build=()=>{ '@park'; const P=PARK, S=COVE.S, X=x=>BOD.XS(x+P.ox), Z=y=>BOD.ZS(y+P.oy), Y=BOD.YS, T=TILE, V3=THREE.Vector3;
    const CX=X(S.c.x), CZ=Z(S.c.y), R=S.R, grp=MAPG.park||scene;
    const WX=X(S.wc.x), WZ=Z(S.wc.y), RW=S.wr*T;                     // the water inlet, in front (−Z / south) of the cave
    const MA=-Math.PI/2;                                            // the mouth faces −Z, toward the water and the pier
    const H=124, NI=30, NJ=6, SEG=Math.PI*2/NI, A0=MA-1.5*SEG, MOUTH=i=>i<3, MJ=3;

    // ---- the cave shell (a mossy schist dome with the mouth cut out), copied from the golems' cave and reskinned ----
    const pt=(i,j)=>{ if(j>=NJ)return new V3(CX,Y(H),CZ); const a=A0+(i%NI)*SEG, f=j/NJ*Math.PI/2, n=hs(i%NI,j,3)-.5, r=foot(R,a)*Math.pow(Math.cos(f),.7)*(1+n*.16);
      return new V3(CX+Math.cos(a)*r*T,Y(H*Math.sin(f)*(1+(hs(i%NI,j,5)-.5)*.14)),CZ+Math.sin(a)*r*T); };
    const PTS=[]; for(let j=0;j<=NJ;j++){ PTS[j]=[]; for(let i=0;i<NI;i++)PTS[j][i]=pt(i,j); }
    const pos=[], col=[], tri=(a,b,c,k)=>{ const nrm=new V3().subVectors(b,a).cross(new V3().subVectors(c,a)), m=new V3().add(a).add(b).add(c).multiplyScalar(1/3); if(nrm.dot(m.sub(new V3(CX,0,CZ)))<0)[b,c]=[c,b];
      pos.push(a.x,a.y,a.z,b.x,b.y,b.z,c.x,c.y,c.z); const h=hs(k,7,9), lo=a.y+b.y+c.y<Y(H)*.55; let cc=[.34+.12*h,.37+.11*h,.36+.1*h];   // cool grey schist
      if(lo&&hs(k,3,11)<.5)cc=hs(k,4,1)<.5?[.22,.34,.2]:[.18,.28,.17]; else if(hs(k,8,2)<.06)cc=[.5,.52,.4];                              // moss low down, a pale chip now and then
      for(let q=0;q<3;q++)col.push(...cc); };
    let k=0; for(let j=0;j<NJ;j++)for(let i=0;i<NI;i++){ if(MOUTH(i)&&j<MJ)continue; const a=PTS[j][i], b=PTS[j][(i+1)%NI], c=PTS[j+1][(i+1)%NI], d=PTS[j+1][i]; if(j+1>=NJ)tri(a,b,c,k++); else{ tri(a,b,c,k++); tri(a,c,d,k++); } }
    const dg=new THREE.BufferGeometry(); dg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); dg.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); dg.computeVertexNormals();
    const dome=new THREE.Mesh(dg,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide})); dome.castShadow=dome.receiveShadow=true; grp.add(dome);

    // the cave floor disc (a dry rock floor inside the mouth)
    { const fp=[], fc=[]; for(let i=0;i<NI;i++){ const a=A0+i*SEG, b=a+SEG, ra=foot(R,a)*.99, rb=foot(R,b)*.99; for(let s=0;s<2;s++){ const r0=s?.5:0, r1=s?1:.5, h=hs(i,s,13), g=.26+.06*h;
        const p=[[r1*ra,a],[r1*rb,b],[r0*rb,b],[r0*ra,a]].map(([r,t])=>[CX+Math.cos(t)*r*T,.03,CZ+Math.sin(t)*r*T]); fp.push(...p[0],...p[2],...p[1],...p[0],...p[3],...p[2]); for(let q=0;q<6;q++)fc.push(g,g*.95,g*.88); } }
      const fg=new THREE.BufferGeometry(); fg.setAttribute('position',new THREE.Float32BufferAttribute(fp,3)); fg.setAttribute('color',new THREE.Float32BufferAttribute(fc,3)); fg.computeVertexNormals();
      const fl=new THREE.Mesh(fg,new THREE.MeshLambertMaterial({vertexColors:true})); fl.receiveShadow=true; grp.add(fl); }

    // ---- the cliff: flat-shaded schist boulders rising behind and beside the cave, mossed low down ----
    const BL=[], m4=new THREE.Matrix4(), q=new THREE.Quaternion(), e=new THREE.Euler(), cl=new THREE.Color();
    for(let i=0;i<30;i++){ const a=i/30*Math.PI*2; if(Math.abs(amouth(a,MA))<.5)continue; const r=foot(R,a)+.2, s=.5+.5*hs(i,1,17), g=.3+.12*hs(i,5,7), mo=hs(i,9,4)<.45;
      BL.push([CX+Math.cos(a)*r*T,Y(6*s),CZ+Math.sin(a)*r*T,s*T,Y(20*s),s*T*.9,a+hs(i,2,3)*3,g,mo]); }
    // a chunky rock face rising behind (north of) the cave, so the mouth glows at the foot of a cliff
    for(const [dx,dy,s,h] of [[-.6,3.2,2.6,186],[1.6,3.4,2.4,172],[-2.8,2.8,2.1,150],[3.0,2.6,2.0,142],[.4,4.0,2.5,178],[-3.8,2.0,1.8,126],[3.8,1.8,1.7,120],[-1.6,2.5,2.0,160],[2.0,2.3,1.9,150]])BL.push([CX+dx*T,Y(h-10),CZ+dy*T,s*T*2.1,Y(20*s),s*T*1.9,dx+dy,.3+.1*hs(dx,dy,2),hs(dx,dy,8)<.4]);
    const rocks=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(.5,0),new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true}),BL.length);
    BL.forEach(([x,y,z,sx,sy,sz,r,g,mo],n)=>{ rocks.setMatrixAt(n,m4.compose(new V3(x,y,z),q.setFromEuler(e.set(0,r,0)),new V3(sx,sy*2,sz))); rocks.setColorAt(n,mo?cl.setRGB(.2,.32,.18):cl.setRGB(g,g*1.02,g*.98)); });
    rocks.castShadow=rocks.receiveShadow=true; grp.add(rocks);

    // a mossy boulder or two down at the waterline, in front of the mouth
    const shoreRocks=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(.5,0),new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true}),4);
    [[-3.2,-.6],[3.0,-1.2],[-1.4,-4.4],[2.2,-4.0]].forEach(([dx,dy],n)=>{ const g=.3+.1*hs(dx,dy,6), mo=n%2===0; shoreRocks.setMatrixAt(n,m4.compose(new V3(CX+dx*T,Y(4),CZ+dy*T),q.setFromEuler(e.set(.2,dx,.2)),new V3(.9*T,Y(14),.8*T))); shoreRocks.setColorAt(n,mo?cl.setRGB(.22,.36,.2):cl.setRGB(g,g,g*.95)); });
    shoreRocks.castShadow=shoreRocks.receiveShadow=true; grp.add(shoreRocks);

    // ---- the still inlet (copy the park pond: a bed, a rim of rocks, the WATER surface with a round mask) ----
    const LV=6, RIM=9, bed=new THREE.Mesh(new THREE.CircleGeometry(RW,34).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({color:0x23321f})); bed.position.set(WX,.02,WZ); bed.receiveShadow=true; grp.add(bed);
    const rimN=28, rimR=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1,0),new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true}),rimN);
    for(let i=0;i<rimN;i++){ const a=i/rimN*Math.PI*2; const gap=Math.abs(Math.atan2(Math.sin(a-Math.PI/2),Math.cos(a-Math.PI/2)))<.5;   // leave a gap on the south for the pier
      const h=hs(i,3,9), s=(gap?.2:.4+.14*Math.abs(h))*TILE, r=RW+s*.2; rimR.setMatrixAt(i,m4.compose(new V3(WX+Math.cos(a)*r,Y(RIM)*.45,WZ+Math.sin(a)*r),q.setFromEuler(e.set(h*3,a+h,h*2)),new V3(s,Y(RIM)*.8,s*.8))); const g=.34+.12*Math.abs(Math.sin(i*7.3)), mo=i%3===0; rimR.setColorAt(i,mo?cl.setRGB(.24,.38,.22):cl.setRGB(g,g*.99,g*.95)); }
    rimR.castShadow=rimR.receiveShadow=true; grp.add(rimR);
    const W=WATER.body({name:'cove',X0:WX-RW,X1:WX+RW,Z0:WZ-RW,Z1:WZ+RW,lvl:Y(LV),GX:64,GY:64,dep:()=>.5});
    W.mat.fragmentShader=W.mat.fragmentShader.replace('void main(){ vec2 t=1./uGrid;','void main(){ if(length(vWp.xz-vec2('+WX.toFixed(3)+','+WZ.toFixed(3)+'))>'+(RW-.02*TILE).toFixed(3)+')discard; vec2 t=1./uGrid;');
    W.mat.customProgramCacheKey=()=>'cove'; W.mat.needsUpdate=true;

    // ---- the wooden pier: planks on posts jutting from the south shore out over the water (instanced boxes, newsstand idiom) ----
    const BX=[], V=V3, geo=new THREE.BoxGeometry(1,1,1);
    const wbox=(a,b,c,d,z0,z1,col,r=0)=>BX.push([(X(a)+X(b))/2,(Y(z0)+Y(z1))/2,(Z(c)+Z(d))/2,Math.abs(X(b)-X(a)),Y(z1)-Y(z0),Math.abs(Z(d)-Z(c)),col,r]);
    const px=S.wc.x, py0=S.wc.y-S.wr-1.5, py1=S.wc.y-1.0, pw=1.3, DECK=11, DK=0x5a4330, DKD=0x47341f;   // the pier runs north from the south shore toward the mouth
    for(let y=py0; y<py1-.05; y+=.52) wbox(px-pw,px+pw, y, y+.46, DECK, DECK+1, (Math.round((y-py0)/.52)&1)?DK:DKD);   // planks
    wbox(px-pw,px+pw, py0, py0+.14, DECK, DECK+1.4, DKD); wbox(px-pw,px+pw, py1-.14, py1, DECK, DECK+1.4, DKD);          // end rails
    for(const [a,b] of [[px-pw+.15,py0+.2],[px+pw-.15,py0+.2],[px-pw+.15,py1-.2],[px+pw-.15,py1-.2],[px,(py0+py1)/2]]) wbox(a-.12,a+.12, b-.12,b+.12, 0, DECK, 0x3a2a1a);   // posts down to the bed
    wbox(px+pw-.14,px+pw+.02, py1-1.0, py1, DECK, DECK+4, 0x2e2012);                                                     // a mooring post at the end
    const pier=new THREE.InstancedMesh(geo,new THREE.MeshLambertMaterial({color:0xffffff}),BX.length);
    BX.forEach(([x,y,z,sx,sy,sz,c,r],i)=>{ pier.setMatrixAt(i,m4.compose(new V(x,y,z),q.setFromEuler(e.set(0,r||0,0)),new V(sx,sy,sz))); pier.setColorAt(i,cl.setHex(c)); });
    pier.castShadow=pier.receiveShadow=true; grp.add(pier);

    // ---- torches at the mouth + a small ember fire inside (warm point lights, on the LITE budget) ----
    const torch=(lx,ly,warm,kcd,reach)=>{ const wx=X(lx), wz=Z(ly), fy=Y(26);
      const L=new THREE.PointLight(new THREE.Color(warm),kcd,reach*T,1.6); L.position.set(wx,fy,wz); L.userData.i0=L.intensity; L.userData.fire=1; L.userData.both=true; L.userData.grp=grp===scene?null:grp; if(LITE.recs)LITE.recs.push(L);
      BX.length=0; wbox(lx-.08,lx+.08, ly-.08,ly+.08, 0, 18, 0x241a12); const post=new THREE.InstancedMesh(geo,new THREE.MeshLambertMaterial({color:0xffffff}),1); post.setMatrixAt(0,m4.compose(new V(BX[0][0],BX[0][1],BX[0][2]),q.setFromEuler(e.set(0,0,0)),new V(BX[0][3],BX[0][4],BX[0][5]))); post.setColorAt(0,cl.setHex(0x241a12)); post.castShadow=true; grp.add(post);
      return FLAME.add({kind:'torch',name:'torch',x:wx,y:fy,z:wz,w:.26*T,h:.66*T,embers:.8,smoke:1.2,sk:.7,light:L,seed:lx*7+ly*13,parent:grp}); };
    COVE.torches=[torch(S.c.x-1.7, S.c.y-R+.6, 0xff7a30, 11, 8), torch(S.c.x+1.7, S.c.y-R+.6, 0xff6a28, 10, 8)];
    { const FX=CX, FZ=CZ+1.2*T, L=new THREE.PointLight(new THREE.Color(1,.55,.22),12,7*T,1.6); L.position.set(FX,Y(10),FZ); L.userData.i0=L.intensity; L.userData.fire=1; L.userData.both=true; L.userData.grp=grp===scene?null:grp; if(LITE.recs)LITE.recs.push(L);
      COVE.fire=FLAME.add({kind:'bed',name:'cove-fire',x:FX,y:Y(5),z:FZ,w:.66*T,h:.74*T,embers:2.2,smoke:1.1,sk:1,light:L,seed:29,parent:grp}); }
    const glowL=new THREE.PointLight(new THREE.Color(1,.62,.3),8,10*T,1.6); glowL.position.set(CX,Y(28),CZ-R*.4*T); glowL.userData.i0=glowL.intensity; glowL.userData.fire=1; glowL.userData.both=true; glowL.userData.grp=grp===scene?null:grp; if(LITE.recs)LITE.recs.push(glowL); COVE.glowL=glowL;

    // ---- collision: the cave wall ring (gap at the mouth), the pier deck, the pool rim ----
    const sol=(x0,z0,x1,z1,h)=>{ SOL.up.push([x0,z0,x1,z1]); FIX.up.push([x0,z0,0,x1,z1,h]); };
    for(let i=0;i<40;i++){ const a=(i+.5)/40*Math.PI*2; if(Math.abs(amouth(a,MA))<.4)continue; const r=foot(R,a)-.1, x=CX+Math.cos(a)*r*T, z=CZ+Math.sin(a)*r*T, b=.55*T; sol(x-b,z-b,x+b,z+b,Y(H)); }
    // the pool rim as blockers (so you can't walk into the water), with the pier gap left open on the south
    for(let i=0;i<24;i++){ const a=i/24*Math.PI*2; if(Math.abs(Math.atan2(Math.sin(a-Math.PI/2),Math.cos(a-Math.PI/2)))<.5)continue; const x=WX+Math.cos(a)*RW, z=WZ+Math.sin(a)*RW, b=.5*T; sol(x-b,z-b,x+b,z+b,Y(RIM)); }
    { const b=RW*.8; sol(WX-b,WZ-b,WX+b,WZ+b,Y(RIM)); }                                                                 // the open water, blocked from the middle
    // the pier deck: walkable on top (FIX box with its top at the deck surface), posts carry you across the water gap
    { const dx0=X(px-pw), dx1=X(px+pw), dz0=Z(py0), dz1=Z(py1); SOL.up.push([Math.min(dx0,dx1),Math.min(dz0,dz1),Math.max(dx0,dx1),Math.max(dz0,dz1)]); FIX.up.push([Math.min(dx0,dx1),Math.min(dz0,dz1),0,Math.max(dx0,dx1),Math.max(dz0,dz1),Y(DECK+1)]); }

    // ---- the enterable room (the cave interior): its box tops below the crown, so ROOMS slices the roof to see in ----
    const B={x0:CX-(R+.25)*T,x1:CX+(R+.25)*T,z0:CZ-(R+.25)*T,z1:CZ+(R+.25)*T};
    const Rm={id:'cove',name:'THE COVE',...B,y0:-1,y1:Y(78),walls:true,at:{x:CX,z:CZ+1.0*T},dw:null}; Rm.inside=(x,z)=>x>Rm.x0&&x<Rm.x1&&z>Rm.z0&&z<Rm.z1&&py>Rm.y0-.3&&py<Rm.y1;
    STORE.rooms.push(Rm); if(ROOMS.reset)ROOMS.reset();
    COVE.box=[B.x0,B.z0,B.x1,B.z1]; COVE.c={x:CX,z:CZ};
    COVE.tris=dg.attributes.position.count/3; COVE.ready=true; };

  COVE.build=()=>{ try{ build(); }catch(e){ console.warn('COVE: not built',e); } };
}
