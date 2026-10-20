// THE BANK: the bank at the west end of Market St, facing east down it (its own builder; the museum's painters and props, turned a quarter).
await grab('bank',async()=>{ const K=STORE.kit, {room,rec,STEPS}=K, SK=BOD.STOREK, {CATALOG,LAMPS,T,sh}=SK, MK=SK.museum, M=MK.MUS, MB=M.b, P=RING.bank, OX=BOD.OX, OY=BOD.OY, DEP=16, L=MB.x1-MB.x0;
  const x1=OX+(P.x1-OX)/BLDK, cy=OY+(P.cy-OY)/BLDK, B={id:'lbank',x0:x1-DEP,x1,y0:cy-L/2,y1:cy+L/2,h:MB.h};
  const mu=(x,y)=>MB.x0+(y-B.y0), mv=(x,y)=>MB.y0+(B.x1-x), wx=(u,v)=>B.x1-(v-MB.y0), wy=(u,v)=>B.y0+(u-MB.x0), FW=[[0,1],[-1,0],[0,-1],[1,0]], stone=[226,220,204], D={w:'e',a:cy,wd:2.5,h:76};
  const RN={x0:MB.x0+T,x1:MB.x1-T,y0:MB.y0+T,y1:MB.y0+DEP-T}, OB={...MB,plain:1}, WO={get P(){ return MK.MUP.bank; },k:'hall'};
  const look={floor:(x,y)=>MK.museumHallCol(mu(x,y),mv(x,y),RN),in:(b,nx,ny,x,y,z,f)=>MK.museumWall(b,ny,-nx,mu(x,y),mv(x,y),z,f,WO),out:(nx,ny,x,y,z,f,H)=>MK.museumOutside(OB,ny,-nx,mu(x,y),mv(x,y),z,f,H)||sh(stone,f),cope:stone};
  const mp=(k,x,y,rot=0)=>{ const f=CATALOG[k]; BOD.K.STUDIO.face(FW[rot]); let p; try{ p=f(+x.toFixed(3),+y.toFixed(3)); }finally{ BOD.K.STUDIO.face(null); } if(!p)return null; p.kind=k; const cx=(p.x0+p.x1)/2, cy_=(p.y0+p.y1)/2; BOD.placeAt(p,1,cx,cy_,wx(cx,cy_),wy(cx,cy_),true); return p; };
  rec('bank','THE BANK',B,D,true); STORE.bank={B};
  STEPS.push(()=>room('bank','THE BANK',B,look,D,()=>{ const py=MB.y0-3, by=MB.y0+DEP;
    mp('museum portico steps',M.mid,(py+MB.y0)/2); for(const d of [-3.7,-1.2,1.2,3.7])mp('museum column',M.mid+d,py+.7); mp('bank entablature',M.mid,py+.7,2);
    for(const x of [M.hx0+.8,M.hx1-.8])for(const y of [MB.y0+3.2,MB.y0+8,by-3.2])mp('museum hall column',x,y);
    mp('information desk',M.mid,by-2.2,2); mp('museum bench',MB.x0+1.4,MB.y0+8,3); mp('museum bench',MB.x1-1.4,MB.y0+8,1);
    for(let i=0;i<3;i++){ const u=MB.x0+L*(i+.5)/3, v=MB.y0+DEP/2; LAMPS.push({own:1,room:1,day:true,x:wx(u,v),y:wy(u,v),z:170,r:16,c:[1.3,1.3,1.26]}); } }));
});
