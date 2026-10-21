// YOUR FIRE ESCAPE: the view from your fire escape (its own builder; built when you climb out).
await grab('fire',async()=>{ const APTS=MODS.apts, K=STORE.kit, {X,Z}=BOD, CX=1000, WY=-95, S=BOD.K.STORY, HZ=4*S+28, A=APTS.A;
  const F=window.FIREV={CX,WY,S,HZ,name:'YOUR FIRE ESCAPE',built:false,lot:[CX-150,WY-130,CX+150,WY+150]};
  STORE.bound.x1=Math.max(STORE.bound.x1,X(CX+12));
  K.offmap(F.name,F.lot,()=>{ '@fire'; if(F.build)F.build(); });
  STORE.places.push(['YOUR APARTMENT',X(A.x0+6.5),Z(A.y0+3),APTS.lvY(2)]);
});
