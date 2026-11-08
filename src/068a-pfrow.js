// THE POLYFORK FRONTS (owner, 5 Nov 2026): whole Polyfork buildings on Market St's new shops and up West St as a line of 10-storey apartment houses (a small gap between each), from data/street.json fetched after the start, with their fire escapes, railings, plants and trees; the lots' solids stand from the start.
import {SHARED, THREE} from './003-shx.js';
import {SHOPS, TALK, UI, WE} from './003b-systems.js';
import {KITD, scene} from './004-main.js';
import {FIX, LEVEL, MAPG, MODS, SOL, SYS, TILE, ZU} from './006-map-pre.js';
import {FACADES} from './038zc-facades.js';
import {HUDSHOP} from './038zcc-hudshop.js';
import {MSHOP} from './059i-mshops.js';
import {KIT} from './068-kit.js';
const PFROW={fronts:[],houses:[],things:[]};
{ const STREET=__LAZY__("data/street.json"), {XS,ZS}=SHARED.BOD, M=TILE/.84, YS=ZU*24/TILE, MV=M*YS, G=(x,z)=>MODS.bodega.ground(x,z);
  const HOUSES=LEVEL.places.filter(p=>p.pf&&p.y1!=null&&!p.row&&(p.face==='e'||p.face==='w')).sort((a,b)=>a.y0-b.y0);   // (a shop on the Hudson row stands through MSHOP.fronts)
  for(const p of HOUSES){ const x0=XS(p.x0), x1=XS(p.x1), z0=Math.min(ZS(p.y0),ZS(p.y1)), z1=Math.max(ZS(p.y0),ZS(p.y1)); p.sol=[x0,z0,x1,z1]; p.fix=[x0,z0,0,x1,z1,35/.84*ZU*24]; SOL.up.push(p.sol); FIX.up.push(p.fix); }   // solid from the start (the house is 35 m tall)
  const size=k=>(KITD[k]||{size:[1,1,1]}).size;
  const PFC={hotel:[168,150,128],theatre:[120,52,48],play:[148,92,70],bar:[72,46,48],bodega:[150,62,48],bath:[188,180,164],books:[96,70,58],fishing:[90,96,104],tailor:[120,72,60],barber:[116,66,58],antiques:[110,84,64],outfitter:[96,92,80]};
  let BM=null; const BODMAT=()=>{ if(BM)return BM; BM=KIT.mat.clone(); const T=HUDSHOP.brick();
    BM.onBeforeCompile=sh=>{ sh.uniforms.uB={value:T}; sh.vertexShader='varying vec3 vBW; varying vec3 vBN;\n'+sh.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\n vBW=(modelMatrix*vec4(transformed,1.)).xyz; vBN=normalize(mat3(modelMatrix)*objectNormal);');
      sh.fragmentShader='uniform sampler2D uB; varying vec3 vBW; varying vec3 vBN;\n'+sh.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      { vec3 c=diffuseColor.rgb; float red=c.r-max(c.g,c.b); vec3 an=abs(vBN); vec2 uv=an.x>an.z?vBW.zy:vBW.xy;
        if(an.y<.5&&red>.06&&c.r>.12){ float l=dot(texture2D(uB,uv*.5).rgb,vec3(.33)); diffuseColor.rgb=c*(.55+.9*l)*1.1; }
        else if(an.y<.5&&c.b>c.r&&c.r<.1){ diffuseColor.rgb=mix(c,vec3(.16,.2,.24),.4)+vec3(.05,.04,.02)*step(.5,fract(vBW.y*.9)); } }`); };
    BM.customProgramCacheKey=()=>'bodbrick'; return BM; };
  const place=()=>{ let tris=0; const put=(k,x,z,o)=>{ const g=KIT.put(k,x,z,o); if(g){ tris+=(KITD[k]||{}).tris||0; } return g; };
    // modelled in the Polyfork building's own footprint and height, not the model itself (owner, 8 Nov 2026: no painted windows)
    const ZT=Math.abs(SHARED.BOD.Y(1)-SHARED.BOD.Y(0));
    for(const f of SHARED.PFCORNER||[]){ const g=put('bodega',f.x,f.zf+f.zi*size('bodega')[2]*1.25*M/2,{rot:f.rot,m:size('bodega')[1]*1.25,mat:BODMAT()}); if(g&&f.flip)g.children[0].scale.x*=-1; PFROW.fronts.push({id:f.id,obj:g}); }
    const BRICK={antiques:[124,70,54],fishing:[112,82,66],armor:[96,62,56],skate:[150,84,62],books:[132,76,58]};
    for(const f of MSHOP.fronts){ const h=size(f.pf)[1]*M, L=f.L, cx=(L.x0+L.x1)/2, LL=L, P=LEVEL.places.find(p=>p.id===f.id)||{};
      if(P.row===2){ PFROW.fronts.push({id:f.id,obj:HUDSHOP.make({L,pt:f.pt,closed:!MSHOP.at[f.id]||!MSHOP.at[f.id].open,brick:BRICK[f.id],du:f.du??cx,seed:f.id.length*17,parent:MAPG.bodega||scene})}); continue; }   // the Hudson row's shops: the florist's kind of building, the merchant's flat upstairs (owner, 8 Nov 2026)
      if(f.id==='bodega'){ PFROW.fronts.push({id:f.id,obj:put('bodega',f.x,f.zf+f.zi*size('bodega')[2]*1.25*M/2,{rot:f.rot,m:size('bodega')[1]*1.25,mat:BODMAT()})}); continue; }   // Polyfork's #12, bigger, its walls bricked (owner, 8 Nov 2026)
      const g=FACADES.make({id:f.id,L:LL,pt:f.pt,z1:Math.max(150,h/ZT),wall:PFC[f.id]||[132,74,58],trim:[204,196,182],frame:[40,38,42],seed:f.id.length*17,glass:true,ground:118,door:{u:f.du??cx,w:.8},parent:MAPG.bodega||scene}); PFROW.fronts.push({id:f.id,obj:g}); } tris+=FACADES.tris;
    // the Hudson row's shops dressed (owner, 7 Nov 2026: "busier"; no signs, 8 Nov 2026): planters and baskets by it, a lamp at every other shop, a small tree and shrubs on the ground either side of the building
    MSHOP.fronts.forEach((f,i)=>{ const zi=f.zi||-1, out=-zi, mw=f.w, z0=f.zf, gap=(f.w-mw)/2, P=LEVEL.places.find(p=>p.id===f.id);
      const F=PFROW.fronts.find(q=>q.id===f.id), U=F&&F.obj&&F.obj.userData; if(U&&U.sills){ const lift=q=>q[1]-G(q[0],q[2]);   // a Hudson shop (owner, 8 Nov 2026: "use real plants from polyfork designs, hanging plants"): Polyfork's planters on every sill, baskets hung either side of the opening, bougainvillea up a post
        for(const q of U.sills)put('planter',q[0],q[2],{rot:f.rot,lift:lift(q)}); for(const q of U.hang)put('basket',q[0],q[2],{rot:f.rot,lift:lift(q)}); put('bougainvillea',U.post[0],U.post[2],{rot:f.rot}); }
      for(const sx of [-1,1])put('planter',f.x+sx*.36*mw,z0+out*.5*M,{rot:f.rot});
      put('basket',f.x+(i%2?-.42:.42)*mw,z0+out*.3*M,{rot:f.rot,lift:2.2*MV});
      if(i%2===0)put('globelamp',f.x-(mw/2+.5*M),z0+out*2.4*M,{rot:f.rot});
      if(gap>1.4*M)for(const sx of [-1,1]){ const gx=f.x+sx*(mw/2+gap/2); put('streettree',gx,z0+zi*1.2*M,{rot:f.rot}); for(const dx of [-.28,.28])put(['shrub','bush','evergreen'][(i+(dx>0?1:0))%3],gx+dx*gap,z0+out*.3*M,{rot:f.rot}); }
});
    HOUSES.forEach((p,i)=>{ const fx=XS(p.x1), zc=(ZS(p.y0)+ZS(p.y1))/2, w=size(p.pf)[0]*M, d=size(p.pf)[2]*M, rot=Math.PI/2, g=put(p.pf,fx-d/2,zc,{rot,sol:p.sol,fix:p.fix,label:p.name});   // the front faces the street (east)
      if(!g)return; PFROW.houses.push({id:p.id,obj:g,door:[fx,zc]});
      for(let k=1;k<10;k++)put('fireescape',fx+.7*M,zc+(i%2?-6:6)*M,{rot,lift:(3*k-1.13)*MV});   // a landing at every floor line on one bay
      for(const dz of [-2.2,2.2])put('planter',fx+.45*M,zc+dz*M,{rot}); for(const dz of [-3.4,3.4])put('basket',fx+.3*M,zc+dz*M,{rot,lift:2.2*MV});
      for(const dz of [-7,-5.5,-4,4,5.5,7])put(['shrub','bush','evergreen'][Math.abs(dz*2)%3|0],fx+.5*M,zc+dz*M,{rot}); put('bougainvillea',fx+.3*M,zc+(i%2?7.2:-7.2)*M,{rot});
      put('streettree',fx+2*M,ZS(p.y1)+.6*M,{rot}); if(i%2)put('globelamp',fx+2.3*M,ZS(p.y0)+2*M,{rot}); });
    PFROW.tris=tris; PFROW.done=true; if(WE.late)WE.late(); };
  SYS.onStart(()=>Promise.all([LOAD('later'),STREET()]).then(([_,J])=>{ Object.assign(KITD,J); place(); }).catch(e=>console.warn('pfrow',e)),'068a-pfrow');
  // the houses' doors: a thing at each (the lobby is shut until the flats are built; your own apartment's door is on the first house, 059a)
  let made=false; SYS.add('places',()=>{ if(made||!UI.thing||!PFROW.done)return; made=true;
    // an open Hudson shop's counter sells as its keeper does
    for(const f of PFROW.fronts){ const at=MSHOP.at[f.id], c=f.obj&&f.obj.userData.counter; if(!at||!at.open||!c)continue; const P=LEVEL.places.find(p=>p.id===f.id)||{}, who=P.merchant, name=MSHOP.defs[f.id]&&MSHOP.defs[f.id].name||P.name;
      const m=new THREE.Mesh(new THREE.BoxGeometry(3.6*TILE,1.2*TILE,1*TILE),new THREE.MeshBasicMaterial({visible:false})); m.position.set(c[0],c[1]+.6*TILE,c[2]); scene.add(m); PFROW.things.push(m);
      UI.thing({name:'THE COUNTER (BUY)',ghost:1,obj:m,reach:1.6*TILE,near:2.8*TILE,tall:1.2*TILE,act:()=>{ for(const [N,fn] of TALK.shops||[])if(N&&N.key===who)return fn(); if(who&&SHOPS.open)SHOPS.open({key:who,name}); }}); }
    for(const h of PFROW.houses){ const m=new THREE.Mesh(new THREE.BoxGeometry(.5*TILE,2.4*TILE,1.3*TILE),new THREE.MeshBasicMaterial({visible:false})); m.position.set(h.door[0]+.25*TILE,G(h.door[0],h.door[1])+1.2*TILE,h.door[1]); scene.add(m);
      UI.thing({name:LEVEL.places.find(p=>p.id===h.id).name,ghost:1,obj:m,reach:1.4*TILE,near:2.6*TILE,tall:2.4*TILE,act:()=>UI.log('THE LOBBY IS SHUT: THE FLATS ARE NOT BUILT YET. YOUR APARTMENT IS IN THE FIRST HOUSE.','#c8a090')}); PFROW.things.push(m); } },'068a-pfrow');
  window.PFROWDBG=()=>({done:!!PFROW.done,fronts:PFROW.fronts.map(f=>f.id),houses:PFROW.houses.length,things:PFROW.things.length,tris:PFROW.tris||0,solids:HOUSES.length,blocked:PFROW.houses.every(h=>{ const x=h.obj.position.x-.5*TILE, z=h.obj.position.z; return SOL.up.some(r=>x>r[0]&&x<r[2]&&z>r[1]&&z<r[3]); })}); }
window.PFROW=PFROW;
export {PFROW};
