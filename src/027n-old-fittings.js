// THE OLD ROOMS' FITTINGS: the old game's light switch (26-zz-room-lights), the pool's night light, ladder and bench (26-gym) and a ceiling light as catalog kinds; a wall fitting sits on the room's nearest wall.
import {SHARED} from './003-shx.js';
import {CAT_DEPTS, CAT_INFO, CATALOG, KIND_OF, prop, sh} from './014-gamekit.js';
const inward=(x,y,R)=>[[x-R.x0,[1,0]],[R.x1-x,[-1,0]],[y-R.y0,[0,1]],[R.y1-y,[0,-1]]].sort((a,b)=>a[0]-b[0])[0][1];
const oldFittings=()=>{ '@oldkits';
  function lightSwitch(x,y,zb,n){ SHARED.PNAME='light switch'; const pl=[228,224,212], dk=[60,58,56], w=(k,t)=>n[k]?t:.1, w2=(k,t)=>n[k]?t:.035, bx=x+n[0]*.02, by=y+n[1]*.02, rx=bx+n[0]*.02, ry=by+n[1]*.02;
    return prop([{x0:bx-w(0,.02),x1:bx+w(0,.02),y0:by-w(1,.02),y1:by+w(1,.02),z0:zb+40,z1:zb+52,c:pl,foot:1,top:()=>pl,fi:()=>sh(pl,.9),fj:()=>pl},
      {x0:rx-w2(0,.01),x1:rx+w2(0,.01),y0:ry-w2(1,.01),y1:ry+w2(1,.01),z0:zb+44,z1:zb+48,c:dk,foot:0,top:()=>dk,fi:()=>dk,fj:()=>dk}],null,{walk:true}); }
  function poolNight(x,y,n=[0,1]){ SHARED.PNAME='night light'; const W=[236,232,222], bx=x+n[0]*.04, by=y+n[1]*.04;
    return prop([{x0:bx-.06,y0:by-.06,x1:bx+.06,y1:by+.06,z0:12,z1:17,c:W,foot:1},
      {x0:bx-.04+n[0]*.03,y0:by-.04+n[1]*.03,x1:bx+.04+n[0]*.03,y1:by+.04+n[1]*.03,z0:13,z1:16,c:[255,200,120],em:1,top:()=>[255,214,140],fi:()=>[255,196,110],fj:()=>[255,206,124]}]); }
  function poolLadder(x,y,s=1){ SHARED.PNAME='pool ladder'; const C=[200,210,216], r=(x0,z0,z1,y0,y1)=>({x0,y0:Math.min(y0,y1),x1:x0+.05,y1:Math.max(y0,y1),z0,z1,c:C,top:()=>[236,242,246],fi:()=>[150,162,170],fj:()=>[196,206,212]});
    return prop([r(x,0,22,y-.3*s,y-.25*s),r(x,19,22,y-.3*s,y+.12*s),r(x+.55,0,22,y-.3*s,y-.25*s),r(x+.55,19,22,y-.3*s,y+.12*s)].map((b,i)=>i&1?{...b,foot:0}:b),null,{walk:true}); }
  function poolBench(x0,x1,y){ SHARED.PNAME='pool bench'; const Wd=[150,112,74], St=[150,156,160];
    return prop([{x0,y0:y-.22,x1,y1:y+.22,z0:16,z1:19,c:Wd,top:(x,yy)=>sh(Wd,(yy-y+.22)*9%1<.12?.7:1),fi:()=>sh(Wd,.62),fj:()=>sh(Wd,.8)},
      ...[x0+.25,x1-.35].map(a=>({x0:a,y0:y-.18,x1:a+.1,y1:y+.18,z0:0,z1:16,c:St,fi:()=>sh(St,.62),fj:()=>sh(St,.8)}))]); }
  function ceilingLight(x,y,z){ SHARED.PNAME='ceiling light'; const c=[236,230,214], lit=Object.assign([...c],{e:1});
    return prop([{x0:x-.24,y0:y-.24,x1:x+.24,y1:y+.24,z0:z-8,z1:z,c,foot:1,nb:1,top:()=>lit,fi:()=>lit,fj:()=>lit}],null,{walk:true,high:true}); }
  const K={'light switch':(x,y,R)=>lightSwitch(x,y,0,R?inward(x,y,R):[0,1]),'night light':(x,y,R)=>poolNight(x,y,R?inward(x,y,R):[0,1]),'pool ladder':(x,y)=>poolLadder(x,y),'pool bench':(x,y)=>poolBench(x-1,x+1,y),'ceiling light':(x,y)=>ceilingLight(x,y,124)};
  const I={'light switch':['F-01',8,'A white plate with a dark rocker, by the door.','plastic'],'night light':['F-02',12,'A small warm light low on the wall.','plastic'],'pool ladder':['F-03',140,'Two steel rails and rungs over the pool\'s edge.','steel'],'pool bench':['F-04',90,'A slatted bench on two steel legs.','wood, steel'],'ceiling light':['F-05',30,'A small round shade under the ceiling, lit.','glass']};
  for(const k in K){ if(CATALOG[k])continue; CATALOG[k]=K[k]; KIND_OF[k]=k; const [no,price,desc,mat]=I[k]; CAT_INFO[k]={no,name:k.replace(/\b\w/g,c=>c.toUpperCase()),dept:'fittings',price,desc,mat}; }
  if(!CAT_DEPTS.some(d=>d[0]==='fittings'))CAT_DEPTS.push(['fittings','Fittings']);
};
export {inward, oldFittings};
