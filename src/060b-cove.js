// THE COVE: a towering mossy cliff rising from a lake in the North Woods, a glowing cave at its foot, a long pier out to it (owner, 21 Oct 2026).
const COVE={ready:false}; window.COVE=COVE;
{
  COVE.keep=P=>{ if(!COVE.S){ const [rx,ry]=P.round, wc={x:rx-14,y:P.y1-21}, wr=12, c={x:wc.x,y:wc.y+7}, R=5, isl=7;
      COVE.S={c,R,wc,wr,isl}; const X=x=>BOD.XS(x+(P.ox||0)), Z=y=>BOD.ZS(y+(P.oy||0));
      if(typeof STORE!=='undefined'&&STORE.places)STORE.places.push(['THE COVE',X(c.x),Z(wc.y-wr-2),'up',null,0]); }
    const {c,wc,wr}=COVE.S; return [[wc.x-wr-5,wc.y-wr-6,wc.x+wr+5,c.y+12]]; };   // the whole lake, the island cliff and the pier

  const hs=(a,b,c=0)=>{ const s=Math.sin(a*127.1+b*311.7+c*74.7)*43758.5453; return s-Math.floor(s); };
  const foot=(R,a)=>R/Math.pow(Math.pow(Math.abs(Math.cos(a)),3)+Math.pow(Math.abs(Math.sin(a)),3),1/3);
  const amouth=(a,MA)=>Math.atan2(Math.sin(a-MA),Math.cos(a-MA));

  const build=()=>{ '@park'; const P=PARK, S=COVE.S, X=x=>BOD.XS(x+P.ox), Z=y=>BOD.ZS(y+P.oy), Y=BOD.YS, T=TILE, V3=THREE.Vector3;
    const CX=X(S.c.x), CZ=Z(S.c.y), R=S.R, grp=MAPG.park||scene;
    const WX=X(S.wc.x), WZ=Z(S.wc.y), RW=S.wr*T, ISL=S.isl*T;
    const MA=-Math.PI/2;                                           // the cave mouth faces −Z (south), out over the lake toward the pier
    const H=176, NI=30, NJ=6, SEG=Math.PI*2/NI, A0=MA-1.5*SEG, MOUTH=i=>i<3, MJ=3;
    const m4=new THREE.Matrix4(), q=new THREE.Quaternion(), e=new THREE.Euler(), cl=new THREE.Color();

    // ---- the enterable cavern at the foot of the cliff (the golems'-cave dome reskinned, mouth to the lake) ----
    const pt=(i,j)=>{ if(j>=NJ)return new V3(CX,Y(H),CZ); const a=A0+(i%NI)*SEG, f=j/NJ*Math.PI/2, n=hs(i%NI,j,3)-.5, r=foot(R,a)*Math.pow(Math.cos(f),.7)*(1+n*.16);
      return new V3(CX+Math.cos(a)*r*T,Y(H*Math.sin(f)*(1+(hs(i%NI,j,5)-.5)*.14)),CZ+Math.sin(a)*r*T); };
    const PTS=[]; for(let j=0;j<=NJ;j++){ PTS[j]=[]; for(let i=0;i<NI;i++)PTS[j][i]=pt(i,j); }
    const pos=[], col=[], tri=(a,b,c,k)=>{ const nrm=new V3().subVectors(b,a).cross(new V3().subVectors(c,a)), m=new V3().add(a).add(b).add(c).multiplyScalar(1/3); if(nrm.dot(m.sub(new V3(CX,0,CZ)))<0)[b,c]=[c,b];
      pos.push(a.x,a.y,a.z,b.x,b.y,b.z,c.x,c.y,c.z); const h=hs(k,7,9), lo=a.y+b.y+c.y<Y(H)*.55; let cc=[.33+.12*h,.36+.11*h,.35+.1*h];
      if(lo&&hs(k,3,11)<.5)cc=hs(k,4,1)<.5?[.22,.34,.2]:[.18,.28,.17]; else if(hs(k,8,2)<.06)cc=[.5,.52,.4];
      for(let z=0;z<3;z++)col.push(...cc); };
    let k=0; for(let j=0;j<NJ;j++)for(let i=0;i<NI;i++){ if(MOUTH(i)&&j<MJ)continue; const a=PTS[j][i], b=PTS[j][(i+1)%NI], c=PTS[j+1][(i+1)%NI], d=PTS[j+1][i]; if(j+1>=NJ)tri(a,b,c,k++); else{ tri(a,b,c,k++); tri(a,c,d,k++); } }
    const dg=new THREE.BufferGeometry(); dg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); dg.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); dg.computeVertexNormals();
    const dome=new THREE.Mesh(dg,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide})); dome.castShadow=dome.receiveShadow=true; grp.add(dome);

    // cavern floor
    { const fp=[], fc=[]; for(let i=0;i<NI;i++){ const a=A0+i*SEG, b=a+SEG, ra=foot(R,a)*.99, rb=foot(R,b)*.99; for(let s=0;s<2;s++){ const r0=s?.5:0, r1=s?1:.5, h=hs(i,s,13), g=.24+.06*h;
        const p=[[r1*ra,a],[r1*rb,b],[r0*rb,b],[r0*ra,a]].map(([r,t])=>[CX+Math.cos(t)*r*T,.04,CZ+Math.sin(t)*r*T]); fp.push(...p[0],...p[2],...p[1],...p[0],...p[3],...p[2]); for(let z=0;z<6;z++)fc.push(g,g*.95,g*.88); } }
      const fg=new THREE.BufferGeometry(); fg.setAttribute('position',new THREE.Float32BufferAttribute(fp,3)); fg.setAttribute('color',new THREE.Float32BufferAttribute(fc,3)); fg.computeVertexNormals();
      const fl=new THREE.Mesh(fg,new THREE.MeshLambertMaterial({vertexColors:true})); fl.receiveShadow=true; grp.add(fl); }

    // ---- the ISLAND and the MASSIVE CLIFF: big flat-shaded schist boulders rising from the water behind and above the cavern ----
    const BL=[], put=(lx,ly,ytiles,sx,sy,sz,rot,g,moss)=>BL.push([X(lx),Y(ytiles),Z(ly),sx*T,Y(sy),sz*T,rot,g,moss]);
    // the island base ring: chunky rocks at the waterline all round the island (gap at the mouth, −y)
    for(let i=0;i<30;i++){ const a=i/30*Math.PI*2; if(Math.abs(amouth(a,MA))<.5)continue; const r=S.isl*(.72+.12*hs(i,1,9)), lx=S.c.x+Math.cos(a)*r, ly=S.c.y+Math.sin(a)*r, s=1.4+1.0*hs(i,2,7), moss=hs(i,9,4)<.55;
      put(lx,ly,6*s,s*1.5,34*s,s*1.4,a+hs(i,3,3)*3,.3+.1*hs(i,5,7),moss); }
    // the cliff proper: a towering face rising from the water toward the back (north, +y) and the centre, up to ~16 tiles
    for(let i=0;i<120;i++){ const u=hs(i,1,21), v=hs(i,2,23), lx=S.c.x-9+u*18, ly=S.c.y-1.5+v*9, dxc=lx-S.c.x, dyc=ly-S.c.y;
      if(Math.hypot(dxc,dyc*1.1)<R-.4)continue;                                   // keep the cavern clear
      if(Math.abs(dxc)<2.8&&dyc<.8&&dyc>-3.5)continue;                            // keep the mouth clear
      const back=Math.max(0,dyc)/9, mid=1-Math.min(1,Math.abs(dxc)/9.5), tall=(back*.62+mid*.38);
      const ht=70+tall*420*(.55+.45*hs(i,7,9)), s=1.5+2.4*hs(i,3,11)*(.5+.5*mid);   // ht is the boulder's full height, in z-units (~Y units)
      const moss=ly<S.c.y+2.4&&hs(i,9,4)<.5, g=.27+.12*hs(i,5,7);
      put(lx,ly,ht*.5,s*1.35,ht,s*1.25,hs(i,2,3)*6,g,moss); }
    const rocks=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(.5,0),new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true}),BL.length);
    BL.forEach(([x,y,z,sx,sy,sz,r,g,moss],n)=>{ rocks.setMatrixAt(n,m4.compose(new V3(x,y,z),q.setFromEuler(e.set(0,r,0)),new V3(sx,sy,sz))); rocks.setColorAt(n,moss?cl.setRGB(.2,.33,.18):cl.setRGB(g,g*1.02,g*.98)); });
    rocks.castShadow=rocks.receiveShadow=true; grp.add(rocks);

    // ---- the LAKE: a big still body with the island cut out of it (copy the park pond's masked water) ----
    const LV=6, bed=new THREE.Mesh(new THREE.CircleGeometry(RW,46).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({color:0x213019})); bed.position.set(WX,.02,WZ); bed.receiveShadow=true; grp.add(bed);
    const W=WATER.body({name:'cove',X0:WX-RW,X1:WX+RW,Z0:WZ-RW,Z1:WZ+RW,lvl:Y(LV),GX:88,GY:88,dep:()=>.6});
    W.mat.fragmentShader=W.mat.fragmentShader.replace('void main(){ vec2 t=1./uGrid;',
      'void main(){ vec2 wp=vWp.xz; if(length(wp-vec2('+WX.toFixed(2)+','+WZ.toFixed(2)+'))>'+(RW-.02*TILE).toFixed(2)+'||length(wp-vec2('+CX.toFixed(2)+','+CZ.toFixed(2)+'))<'+(ISL*.92).toFixed(2)+')discard; vec2 t=1./uGrid;');
    W.mat.customProgramCacheKey=()=>'cove'; W.mat.needsUpdate=true;
    if(W.mat.uniforms){ W.mat.uniforms.uDeep.value.setRGB(.05,.2,.22); W.mat.uniforms.uGlow.value.setRGB(.01,.07,.08); W.mat.uniforms.uRoom.value.setRGB(.03,.05,.07); }

    // ---- the long wooden pier from the south shore out across the lake to the cave mouth (instanced boxes, newsstand idiom) ----
    const BX=[], geo=new THREE.BoxGeometry(1,1,1);
    const wbox=(a,b,c,d,z0,z1,col,r=0)=>BX.push([(X(a)+X(b))/2,(Y(z0)+Y(z1))/2,(Z(c)+Z(d))/2,Math.abs(X(b)-X(a)),Y(z1)-Y(z0),Math.abs(Z(d)-Z(c)),col,r]);
    const px=S.wc.x, py0=S.wc.y-S.wr-2, py1=S.c.y-R+.4, pw=1.3, DECK=11, DK=0x5a4330, DKD=0x47341f;
    for(let y=py0; y<py1-.05; y+=.52) wbox(px-pw,px+pw, y, y+.46, DECK, DECK+1, (Math.round((y-py0)/.52)&1)?DK:DKD);
    wbox(px-pw,px+pw, py0, py0+.14, DECK, DECK+1.4, DKD);
    for(let y=py0+1; y<py1-1; y+=2.4) for(const sx of [px-pw+.15,px+pw-.15]) wbox(sx-.12,sx+.12, y-.12,y+.12, 0, DECK, 0x3a2a1a);   // posts to the bed, every few tiles
    wbox(px+pw-.14,px+pw+.02, py1-1.2, py1, DECK, DECK+4, 0x2e2012);   // a mooring post at the end
    const pier=new THREE.InstancedMesh(geo,new THREE.MeshLambertMaterial({color:0xffffff}),BX.length);
    BX.forEach(([x,y,z,sx,sy,sz,c,r],i)=>{ pier.setMatrixAt(i,m4.compose(new V3(x,y,z),q.setFromEuler(e.set(0,r||0,0)),new V3(sx,sy,sz))); pier.setColorAt(i,cl.setHex(c)); });
    pier.castShadow=pier.receiveShadow=true; grp.add(pier);

    // ---- tall pines around the lake shore, melting into the teal mist (the mockup's framing) ----
    const yt=t=>Y(t*29.36);   // a height in tiles -> world Y
    const PBX=[], pine=(lx,ly,h)=>{ const wx=X(lx), wz=Z(ly); PBX.push(['t',wx,yt(h*.3),wz,.5*T,yt(h*.6),.5*T,0]); for(let s=0;s<4;s++){ const r=(1-s*.22), cy=h*(.35+s*.22); PBX.push(['c',wx,yt(cy),wz,h*.44*r*T,yt(h*.34),h*.44*r*T,s]); } };
    for(const [lx,ly,h] of [[S.wc.x-S.wr-1.5,S.wc.y+3,11],[S.wc.x-S.wr-2.5,S.wc.y-4,9.5],[S.wc.x-S.wr-1,S.wc.y-9,8.5],[S.wc.x+S.wr+1.5,S.wc.y+1,10],[S.wc.x+S.wr+2,S.wc.y-6,9],[S.wc.x-9,S.wc.y-S.wr-2.5,8],[S.wc.x+9.5,S.wc.y-S.wr-2,8.5]]) pine(lx,ly,h);
    const tg=new THREE.CylinderGeometry(1,1,1,6), cg=new THREE.ConeGeometry(1,1,7);
    const trunks=PBX.filter(p=>p[0]==='t'), cones=PBX.filter(p=>p[0]==='c');
    const tm=new THREE.InstancedMesh(tg,new THREE.MeshLambertMaterial({color:0x3a2e22}),trunks.length); trunks.forEach(([,x,y,z,sx,sy,sz],i)=>{ tm.setMatrixAt(i,m4.compose(new V3(x,y,z),q.identity(),new V3(sx,sy,sz))); }); tm.castShadow=true; grp.add(tm);
    const cm=new THREE.InstancedMesh(cg,new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true}),cones.length); cones.forEach(([,x,y,z,sx,sy,sz,s],i)=>{ cm.setMatrixAt(i,m4.compose(new V3(x,y,z),q.identity(),new V3(sx,sy,sz))); cm.setColorAt(i,cl.setRGB(.09+.03*s,.19+.03*s,.14+.02*s)); }); cm.castShadow=true; grp.add(cm);

    // ---- torches at the mouth + an ember fire inside (warm LITE lights on the budget) ----
    const torch=(lx,ly,warm,kcd)=>{ const wx=X(lx), wz=Z(ly), fy=Y(26);
      const L=new THREE.PointLight(new THREE.Color(warm),kcd,9*T,1.6); L.position.set(wx,fy,wz); L.userData.i0=L.intensity; L.userData.fire=1; L.userData.both=true; L.userData.grp=grp===scene?null:grp; if(LITE.recs)LITE.recs.push(L);
      BX.length=0; wbox(lx-.08,lx+.08, ly-.08,ly+.08, 0, 18, 0x241a12); const post=new THREE.InstancedMesh(geo,new THREE.MeshLambertMaterial({color:0x241a12}),1); post.setMatrixAt(0,m4.compose(new V3(BX[0][0],BX[0][1],BX[0][2]),q.identity(),new V3(BX[0][3],BX[0][4],BX[0][5]))); post.castShadow=true; grp.add(post);
      return FLAME.add({kind:'torch',name:'torch',x:wx,y:fy,z:wz,w:.26*T,h:.66*T,embers:.8,smoke:1.2,sk:.7,light:L,seed:lx*7+ly*13,parent:grp}); };
    COVE.torches=[torch(S.c.x-1.9, S.c.y-R+.8, 0xff7a30, 13), torch(S.c.x+1.9, S.c.y-R+.8, 0xff6a28, 12)];
    { const FX=CX, FZ=CZ+1.2*T, L=new THREE.PointLight(new THREE.Color(1,.55,.22),14,8*T,1.6); L.position.set(FX,Y(10),FZ); L.userData.i0=L.intensity; L.userData.fire=1; L.userData.both=true; L.userData.grp=grp===scene?null:grp; if(LITE.recs)LITE.recs.push(L);
      COVE.fire=FLAME.add({kind:'bed',name:'cove-fire',x:FX,y:Y(5),z:FZ,w:.7*T,h:.78*T,embers:2.3,smoke:1.1,sk:1,light:L,seed:29,parent:grp}); }
    const glowL=new THREE.PointLight(new THREE.Color(1,.6,.28),11,14*T,1.6); glowL.position.set(CX,Y(34),CZ-R*.3*T); glowL.userData.i0=glowL.intensity; glowL.userData.fire=1; glowL.userData.both=true; glowL.userData.grp=grp===scene?null:grp; if(LITE.recs)LITE.recs.push(glowL); COVE.glowL=glowL;

    // ---- collision ----
    const sol=(x0,z0,x1,z1,h)=>{ SOL.up.push([x0,z0,x1,z1]); FIX.up.push([x0,z0,0,x1,z1,h]); };
    for(let i=0;i<44;i++){ const a=(i+.5)/44*Math.PI*2; if(Math.abs(amouth(a,MA))<.4)continue; const r=foot(R,a)-.1, x=CX+Math.cos(a)*r*T, z=CZ+Math.sin(a)*r*T, b=.55*T; sol(x-b,z-b,x+b,z+b,Y(H)); }   // cavern wall
    for(let i=0;i<24;i++){ const a=i/24*Math.PI*2; const x=CX+Math.cos(a)*ISL, z=CZ+Math.sin(a)*ISL, b=.6*T; if(Math.abs(amouth(a,MA))<.45)continue; sol(x-b,z-b,x+b,z+b,Y(40)); }   // island shore (gap at the mouth for the pier)
    for(let i=0;i<30;i++){ const a=i/30*Math.PI*2; if(Math.abs(Math.atan2(Math.sin(a-Math.PI/2),Math.cos(a-Math.PI/2)))<.32)continue; const x=WX+Math.cos(a)*RW, z=WZ+Math.sin(a)*RW, b=.6*T; sol(x-b,z-b,x+b,z+b,Y(10)); }   // lake rim (gap on the south for the pier)
    { const dx0=X(px-pw), dx1=X(px+pw), dz0=Z(py0), dz1=Z(py1); SOL.up.push([Math.min(dx0,dx1),Math.min(dz0,dz1),Math.max(dx0,dx1),Math.max(dz0,dz1)]); FIX.up.push([Math.min(dx0,dx1),Math.min(dz0,dz1),0,Math.max(dx0,dx1),Math.max(dz0,dz1),Y(DECK+1)]); }   // pier deck walkable

    // ---- the enterable room (the cavern): its top below the crown so ROOMS slices the roof to see in ----
    const B={x0:CX-(R+.25)*T,x1:CX+(R+.25)*T,z0:CZ-(R+.25)*T,z1:CZ+(R+.25)*T};
    const Rm={id:'cove',name:'THE COVE',...B,y0:-1,y1:Y(96),walls:true,at:{x:CX,z:CZ+1.0*T},dw:null}; Rm.inside=(x,z)=>x>Rm.x0&&x<Rm.x1&&z>Rm.z0&&z<Rm.z1&&py>Rm.y0-.3&&py<Rm.y1;
    STORE.rooms.push(Rm); if(ROOMS.reset)ROOMS.reset();
    COVE.box=[B.x0,B.z0,B.x1,B.z1]; COVE.c={x:CX,z:CZ};
    COVE.tris=dg.attributes.position.count/3; COVE.ready=true; };

  COVE.build=()=>{ try{ build(); }catch(e){ console.warn('COVE: not built',e); } };
}
