const OCTB=LBLD[1];
const OCTR={b:OCTB,lv:SQLV.octo,x0:OCTB.x0+T,y0:OCTB.y0+T,x1:OCTB.x1-T,y1:OCTB.y1-T,H:STORY-8,cx:OCTB.x0+5.5,cy:OCTB.y1-2.6,in:[OCTB.x0-T,OCTB.y0-T,OCTB.x1+T,OCTB.y1+T]};
const OCC={wallD:[24,27,35],wall:[31,35,45],wallL:[39,44,56],skirt:[12,13,16],skirtL:[26,28,33],band:[18,20,25],floor:[[22,23,27],[28,29,34],[34,35,41],[41,42,48]],fleck:[58,60,66],
  wood:[78,48,30],woodD:[48,30,20],woodL:[104,68,42],brass:[204,164,84],brassD:[132,100,46],ink:[46,34,20],rim:[18,19,22],post:[26,28,30]};
function octoWall(q,nx,ny,X,Y,z,f){ '@later'; const c=OCC, u=nx?Y:X;
  if(z<0)return sh(c.skirt,f); if(z<7)return sh(z>=6?c.skirtL:c.skirt,f); if(z>=OCTR.H-3)return sh(c.band,f);
  const n=(cvNoise(u/2.2,z/40,401)*3+cvNoise(u*1.4,z/14,403)*2+cvNoise(u*4,z/5,405))/6+(hash(Math.floor(u*24),Math.floor(z),407)-.5)*.06;
  return sh(n<.42?c.wallD:n<.6?c.wall:c.wallL,f); }
function octoFloorCol(x,y){ const c=OCC, n=(cvNoise(x/4,y/4,411)*3+cvNoise(x*1.2,y*1.2,413)*2+cvNoise(x*3.5,y*3.5,415))/6+(hash(Math.floor(x*24),Math.floor(y*24),417)-.5)*.07;
  if(hash(Math.floor(x*24),Math.floor(y*24),419)>.993)return c.fleck; return c.floor[n<.38?0:n<.5?1:n<.62?2:3]; }
const OCTK={LX:4.4,LY:1.6,Z0:30,ZT:86};
function octoTank(x,y){ '@later'; SHARED.PNAME='octopus tank'; const {LX,LY,Z0,ZT}=OCTK, x1=x+LX, y1=y+LY, c=OCC;
  const plaque=(X,zr)=>{ const u=Math.floor((X-x-LX/2+.6)*24), v=Math.floor(Z0-6-zr); if(u<0||u>28||v<0||v>13)return null;
    if(u===0||u===28||v===0||v===13)return c.brassD; if(u===1||v===1)return sh(c.brass,1.15);
    return v===4&&u>4&&u<24&&hash(u,4,421)>.15||(v===8||v===10)&&u>3&&u<25&&hash(u,v,423)>.35?c.ink:c.brass; };
  const cab=sided({x0:x,y0:y,x1,y1,z0:0,z1:Z0,c:c.wood,top:()=>c.woodL,
    fs:(nx,ny,X,Y,zr,k)=>{ if(ny>0){ const f=plaque(X,zr); if(f)return sh(f,k*1.15); }
      const a=nx?Y-y:X-x; let col;
      if(zr<3)col=c.woodD; else if(zr>=Z0-2)col=c.woodL; else col=sh(c.wood,.92+.16*cvNoise(a*1.5,zr/3,425));
      return sh(col,k*1.2); }});
  const e=.035, fr=(x0,y0,xb,yb,z0,z1,col)=>({x0,y0,x1:xb,y1:yb,z0,z1,c:col,foot:0});
  const frame=[fr(x,y,x+e,y+e,Z0,ZT,c.post),fr(x1-e,y,x1,y+e,Z0,ZT,c.post),fr(x,y1-e,x+e,y1,Z0,ZT,c.post),fr(x1-e,y1-e,x1,y1,Z0,ZT,c.post),
    fr(x,y,x1,y+e,ZT-1.6,ZT,c.rim),fr(x,y1-e,x1,y1,ZT-1.6,ZT,c.rim),fr(x,y,x+e,y1,ZT-1.6,ZT,c.rim),fr(x1-e,y,x1,y1,ZT-1.6,ZT,c.rim),fr(x,y,x1,y1,Z0,Z0+1,c.rim)];
  const p=prop([cab,...frame],null,{lifeK:1,lifeFast:true});
  p.octo={x,y,LX,LY,Z0,ZT,HT:(ZT-Z0)/DEEPW.ZPX}; return p; }

STOREK.octo={OCTK,OCC,octoWall,octoFloorCol,octoTank};
}

