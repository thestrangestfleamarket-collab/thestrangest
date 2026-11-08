// THE POLYFORK FRONTS (owner, 5 Nov 2026): whole Polyfork buildings on Market St's new shops and up West St as a line of 10-storey apartment houses (a small gap between each), from data/street.json fetched after the start, with their fire escapes, railings, plants and trees; the lots' solids stand from the start.
import {SHARED, THREE} from './003-shx.js';
import {UI, WE} from './003b-systems.js';
import {KITD, scene} from './004-main.js';
import {FIX, LEVEL, MAPG, MODS, SOL, SYS, TILE, ZU} from './006-map-pre.js';
import {MSHOP} from './059i-mshops.js';
import {KIT} from './068-kit.js';
const PFROW={fronts:[],houses:[],things:[]};
{ const STREET=__LAZY__("data/street.json"), {XS,ZS}=SHARED.BOD, M=TILE/.84, YS=ZU*24/TILE, MV=M*YS, G=(x,z)=>MODS.bodega.ground(x,z);
  const HOUSES=LEVEL.places.filter(p=>p.pf&&p.y1!=null&&!p.row&&(p.face==='e'||p.face==='w')).sort((a,b)=>a.y0-b.y0);   // (a shop on the Hudson row stands through MSHOP.fronts)
  for(const p of HOUSES){ const x0=XS(p.x0), x1=XS(p.x1), z0=Math.min(ZS(p.y0),ZS(p.y1)), z1=Math.max(ZS(p.y0),ZS(p.y1)); p.sol=[x0,z0,x1,z1]; p.fix=[x0,z0,0,x1,z1,35/.84*ZU*24]; SOL.up.push(p.sol); FIX.up.push(p.fix); }   // solid from the start (the house is 35 m tall)
  const size=k=>(KITD[k]||{size:[1,1,1]}).size;
  const place=()=>{ let tris=0; const put=(k,x,z,o)=>{ const g=KIT.put(k,x,z,o); if(g){ tris+=(KITD[k]||{}).tris||0; } return g; };
    for(const f of MSHOP.fronts){ const d=size(f.pf)[2]*M; const g=put(f.pf,f.x,f.zf+(f.zi||-1)*d/2,{rot:f.rot}); if(g)PFROW.fronts.push({id:f.id,obj:g}); }
    // the Hudson row's shops dressed (owner, 7 Nov 2026: "busier"): a lit name board over the door, planters and baskets by it, a lamp at every other shop, a small tree and shrubs on the ground either side of the building
    MSHOP.fronts.forEach((f,i)=>{ const zi=f.zi||-1, out=-zi, mw=size(f.pf)[0]*M, z0=f.zf, gap=(f.w-mw)/2, P=LEVEL.places.find(p=>p.id===f.id);
      for(const sx of [-1,1])put('planter',f.x+sx*.36*mw,z0+out*.5*M,{rot:f.rot});
      put('basket',f.x+(i%2?-.42:.42)*mw,z0+out*.3*M,{rot:f.rot,lift:2.2*MV});
      if(i%2===0)put('globelamp',f.x-(mw/2+.5*M),z0+out*2.4*M,{rot:f.rot});
      if(gap>1.4*M)for(const sx of [-1,1]){ const gx=f.x+sx*(mw/2+gap/2); put('streettree',gx,z0+zi*1.2*M,{rot:f.rot}); for(const dx of [-.28,.28])put(['shrub','bush','evergreen'][(i+(dx>0?1:0))%3],gx+dx*gap,z0+out*.3*M,{rot:f.rot}); }
      if(P&&P.name&&!/^arcade$/.test(f.id)){ const n=P.name.replace(/^THE /,''), cv=document.createElement('canvas'); cv.width=Math.max(96,n.length*14+16); cv.height=22; const g=cv.getContext('2d'), hue=(i*47)%360;
        g.fillStyle='#16141a'; g.fillRect(0,0,cv.width,cv.height); g.fillStyle=`hsl(${hue},85%,70%)`; g.font='bold 15px monospace'; g.textBaseline='middle'; g.textAlign='center'; g.fillText(n,cv.width/2,cv.height/2+1); g.strokeStyle=`hsl(${hue},60%,45%)`; g.strokeRect(1,1,cv.width-2,cv.height-2);
        const t=new THREE.CanvasTexture(cv); t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; t.colorSpace=THREE.SRGBColorSpace;
        const w=Math.min(mw*.8,cv.width/22*.9*M), h=w*cv.height/cv.width, sg=new THREE.Mesh(new THREE.PlaneGeometry(w,h*YS*1.1),new THREE.MeshBasicMaterial({map:t,toneMapped:false}));
        sg.position.set(f.x,G(f.x,z0)+3.3*MV,z0+out*.18*M); sg.rotation.y=out>0?0:Math.PI; sg.raycast=()=>{}; (MAPG.bodega||scene).add(sg); tris+=2; } });
    HOUSES.forEach((p,i)=>{ const fx=XS(p.x1), zc=(ZS(p.y0)+ZS(p.y1))/2, w=size(p.pf)[0]*M, d=size(p.pf)[2]*M, rot=Math.PI/2, g=put(p.pf,fx-d/2,zc,{rot,sol:p.sol,fix:p.fix,label:p.name});   // the front faces the street (east)
      if(!g)return; PFROW.houses.push({id:p.id,obj:g,door:[fx,zc]});
      for(let k=1;k<10;k++)put('fireescape',fx+.7*M,zc+(i%2?-6:6)*M,{rot,lift:(3*k-1.13)*MV});   // a landing at every floor line on one bay
      for(const dz of [-2.2,2.2])put('planter',fx+.45*M,zc+dz*M,{rot}); for(const dz of [-3.4,3.4])put('basket',fx+.3*M,zc+dz*M,{rot,lift:2.2*MV});
      for(const dz of [-7,-5.5,-4,4,5.5,7])put(['shrub','bush','evergreen'][Math.abs(dz*2)%3|0],fx+.5*M,zc+dz*M,{rot}); put('bougainvillea',fx+.3*M,zc+(i%2?7.2:-7.2)*M,{rot});
      put('streettree',fx+2*M,ZS(p.y1)+.6*M,{rot}); if(i%2)put('globelamp',fx+2.3*M,ZS(p.y0)+2*M,{rot}); });
    PFROW.tris=tris; PFROW.done=true; if(WE.late)WE.late(); };
  SYS.onStart(()=>Promise.all([LOAD('later'),STREET()]).then(([_,J])=>{ Object.assign(KITD,J); place(); }).catch(e=>console.warn('pfrow',e)),'068a-pfrow');
  // the houses' doors: a thing at each (the lobby is shut until the flats are built; your own apartment's door is on the first house, 059a)
  let made=false; SYS.add('places',()=>{ if(made||!UI.thing||!PFROW.done)return; made=true; for(const h of PFROW.houses){ const m=new THREE.Mesh(new THREE.BoxGeometry(.5*TILE,2.4*TILE,1.3*TILE),new THREE.MeshBasicMaterial({visible:false})); m.position.set(h.door[0]+.25*TILE,G(h.door[0],h.door[1])+1.2*TILE,h.door[1]); scene.add(m);
      UI.thing({name:LEVEL.places.find(p=>p.id===h.id).name,ghost:1,obj:m,reach:1.4*TILE,near:2.6*TILE,tall:2.4*TILE,act:()=>UI.log('THE LOBBY IS SHUT: THE FLATS ARE NOT BUILT YET. YOUR APARTMENT IS IN THE FIRST HOUSE.','#c8a090')}); PFROW.things.push(m); } },'068a-pfrow');
  window.PFROWDBG=()=>({done:!!PFROW.done,fronts:PFROW.fronts.map(f=>f.id),houses:PFROW.houses.length,things:PFROW.things.length,tris:PFROW.tris||0,solids:HOUSES.length,blocked:PFROW.houses.every(h=>{ const x=h.obj.position.x-.5*TILE, z=h.obj.position.z; return SOL.up.some(r=>x>r[0]&&x<r[2]&&z>r[1]&&z<r[3]); })}); }
window.PFROW=PFROW;
export {PFROW};
