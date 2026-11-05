// YOUR PHOTOS ON THE WALL: every photo bought from the Newsreel (146m) is a framed print for your apartment — DECORATE shows it as YOURS; it hangs on the wall you point at.
import {THREE} from './003-shx.js';
import {ROOMK} from './150a-bedroom.js';
{ const tex=src=>{ const t=new THREE.TextureLoader().load(src); t.colorSpace=THREE.SRGBColorSpace; return t; };
  const frame=p=>{ const G=new THREE.Group(), wood=new THREE.MeshStandardMaterial({color:0x2a1c14,roughness:.5}), mat=new THREE.MeshStandardMaterial({color:0xece6d8,roughness:.9});
    const f=new THREE.Mesh(new THREE.BoxGeometry(.5,.4,.03),wood); f.position.z=.015; G.add(f); const m=new THREE.Mesh(new THREE.PlaneGeometry(.44,.34),mat); m.position.z=.031; G.add(m);
    const ph=new THREE.Mesh(new THREE.PlaneGeometry(.36,.27),new THREE.MeshStandardMaterial({map:tex(p.src),roughness:.35})); ph.position.z=.033; G.add(ph); return G; };
  const kind=(R,p)=>{ const k='ph:'+p.id; if(R.kinds[k])return; const D={kind:k,name:'PHOTO: '+p.cap,own:p.id,loose:false,m:0,wire:null,sol:[],shf:[],mount:'wall',dept:'photos',deptName:'PHOTOS'};
    Object.defineProperty(D,'tpl',{configurable:true,enumerable:true,get(){ const t=frame(p); Object.defineProperty(D,'tpl',{value:t,enumerable:true}); return t; }}); R.kinds[k]=D; };
  ROOMK.parts.push(ctx=>{ for(const p of PHOTOS.mine)kind(ctx.R,p); });
  PHOTOS.onBuy=p=>{ const A=ROOMK.api; if(A&&A.R)kind(A.R,p); };
}
