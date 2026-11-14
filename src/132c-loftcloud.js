// THE LOFTS' CLOUD CAP: the sky's own cumulus heaped round the top of the apartment house on the street, so it goes up into the clouds and its roof is never seen.
import {SHARED} from './003-shx.js';
import {ROOMS, SKY} from './003b-systems.js';
import {scene} from './004-main.js';
import {MODS, SYS} from './006-map-pre.js';
SYS.onStart(()=>{ const H=MODS.apts; if(!H||!H.A||!H.XZ||!SKY.cumulus)return; const A=H.A, top=H.lvY?H.lvY(H.floors):SHARED.BOD.Y(H.TOP), ht=top;   // the roof as the rooftops find it
  const P=[[A.x0,A.y0],[A.x1,A.y0],[A.x0,A.y1],[A.x1,A.y1]].map(([x,y])=>H.XZ(x,y)), xs=P.map(p=>p[0]), zs=P.map(p=>p[1]), cx=(Math.min(...xs)+Math.max(...xs))/2, cz=(Math.min(...zs)+Math.max(...zs))/2, hw=(Math.max(...xs)-Math.min(...xs))/2, hd=(Math.max(...zs)-Math.min(...zs))/2;
  const hsh=(n,k)=>{ const v=Math.sin(n*12.9898+k*78.233)*43758.5453; return v-Math.floor(v); }, W0=1.6*Math.max(hw,hd), C=[];
  for(let i=0;i<24;i++){ const a=i/24*6.2832+hsh(i,1)*.3, r=1.05+hsh(i,2)*.6; C.push({x:cx+Math.cos(a)*hw*r,y:top-ht*(.3-.1*hsh(i,3))-(i%3)*ht*.04,z:cz+Math.sin(a)*hd*r,W:W0*(.8+hsh(i,4)*.6),s:i+300,a:a+1.57}); }   // a ring hiding the top storeys' edges, reaching well out past them
  for(let i=0;i<14;i++){ const a=i/14*6.2832+hsh(i,10)*.4, r=1.1+hsh(i,11)*.9; C.push({x:cx+Math.cos(a)*hw*r,y:top-ht*(.4-.06*hsh(i,12)),z:cz+Math.sin(a)*hd*r,W:W0*(.35+hsh(i,13)*.3),s:i+360,a:a+1.57}); }   // small wisps under it, so its lower edge is ragged cloud, not a line
  for(let i=0;i<8;i++)C.push({x:cx+(hsh(i,5)-.5)*hw*1.6,y:top-ht*.12+hsh(i,6)*ht*.08,z:cz+(hsh(i,7)-.5)*hd*1.6,W:W0*(1.1+hsh(i,8)*.5),s:i+340,a:hsh(i,9)*6.28});   // and a heap over the roof
  const m=SKY.cumulus(C,SKY.lump(8,6),SKY.cumLive()); m.userData.sky=1; m.material.uniforms.uSpan.value=0; scene.add(m);
  SYS.add('sky',()=>{ m.visible=SHARED.LVL==='up'&&!ROOMS.cur&&!H.inReal; },'loftcloud'); },'loftcloud');
