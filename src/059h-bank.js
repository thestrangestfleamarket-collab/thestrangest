// THE BANK: the bank on the block, between the playhouse and the bar (its own builder).
await grab('bank',async()=>{ const K=STORE.kit, {room,rec,STEPS}=K, SK=SHARED.BOD.STOREK, {CATALOG,LAMPS,T,sh}=SK, MK=SK.museum, M=MK.MUS, MB=M.b, P=BLOCK.lots.bank, OX=SHARED.BOD.OX, OY=SHARED.BOD.OY, DEP=14;
  const x0=OX+(P[0]-OX)/BLDK, y1=OY, B={id:'lbank',x0,x1:x0+(MB.x1-MB.x0),y0:y1-DEP,y1,h:MB.h};
  const SX=MB.x0+MB.x1, SY=MB.y0+MB.y1, dx=B.x0-MB.x0, dy=B.y1-MB.y1, FW=[[0,1],[-1,0],[0,-1],[1,0]], stone=[226,220,204], D={w:'f',a:(B.x0+B.x1)/2,wd:2.5,h:76};
  const RN={x0:MB.x0+T,x1:MB.x1-T,y0:MB.y0+T,y1:MB.y0+DEP-T}, OB={...MB,plain:1}, WO={get P(){ return MK.MUP.bank; },k:'hall'};
  const look={floor:(x,y)=>MK.museumHallCol(SX-x+dx,SY-y+dy,RN),in:(b,nx,ny,x,y,z,f)=>MK.museumWall(b,-nx,-ny,SX-x+dx,SY-y+dy,z,f,WO),out:(nx,ny,x,y,z,f,H)=>MK.museumOutside(OB,-nx,-ny,SX-x+dx,SY-y+dy,z,f,H)||sh(stone,f),cope:stone};
  const mp=(k,x,y,rot=0)=>{ const f=CATALOG[k]; SHARED.BOD.K.STUDIO.face(FW[rot]); let p; try{ p=f(+x.toFixed(3),+y.toFixed(3)); }finally{ SHARED.BOD.K.STUDIO.face(null); } if(!p)return null; p.kind=k; const cx=(p.x0+p.x1)/2, cy=(p.y0+p.y1)/2; SHARED.BOD.placeAt(p,2,cx,cy,SX-cx+dx,SY-cy+dy,true); return p; };
  rec('bank','THE BANK',B,D,true); STORE.bank={B};
  STEPS.push(()=>room('bank','THE BANK',B,look,D,()=>{ const py=MB.y0-3, by=MB.y0+DEP;
    mp('museum portico steps',M.mid,(py+MB.y0)/2); for(const d of [-3.7,-1.2,1.2,3.7])mp('museum column',M.mid+d,py+.7); mp('bank entablature',M.mid,py+.7,2);
    for(const x of [M.hx0+.8,M.hx1-.8])for(const y of [MB.y0+3.2,MB.y0+8,by-3.2])mp('museum hall column',x,y);
    mp('information desk',M.mid,by-2.2,2); mp('museum bench',MB.x0+1.4,MB.y0+8,3); mp('museum bench',MB.x1-1.4,MB.y0+8,1);
    for(let i=0;i<3;i++)LAMPS.push({own:1,room:1,day:true,x:SX-(MB.x0+(MB.x1-MB.x0)*(i+.5)/3)+dx,y:SY-(MB.y0+DEP/2)+dy,z:170,r:16,c:[1.3,1.3,1.26]}); }));
});
