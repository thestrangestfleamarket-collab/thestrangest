// DECORATE'S POLYFORK FURNITURE (owner, 13 Nov 2026: "look throuh polyfork assets for better lookign furtneru and decor for apartment, add textures, roudned corners, flowing physics, etc."; his pick: soft goods, then the main furniture, then decor): Polyfork's sofas, armchairs, chairs, tables, a sideboard, a lamp, a jukebox and potted plants sold in DECORATE's POLYFORK department, the models fetched only when DECORATE opens or your flat already has one.
import {THREE} from './003-shx.js';
import {WE} from './003b-systems.js';
import {MODS, SYS, TILE} from './006-map-pre.js';
import {KIT} from './068-kit.js';
import {ROOMK} from './150a-bedroom.js';
const PFDECOR={ready:false,loading:false};
{ // the piece, its price, its footprint (x0,z0,x1,z1) and height in metres, from the world editor's catalog (data/weplace.json)
  const PICK=[['lounge-sofa-c34b3e',650,-0.99,-0.5,0.99,0.49,0.92],['sofa-9c0e7e',600,-1.0,-0.5,1.0,0.47,0.959],['lounge-armchair-5a72ca',380,-0.334,-0.324,0.334,0.324,0.79],['armchair-980c7c',350,-0.44,-0.388,0.44,0.392,0.901],['velvet-tub-chair-b0b5f8',320,-0.35,-0.276,0.35,0.334,0.87],['motel-shell-chair-8a22f6',160,-0.261,-0.259,0.261,0.259,0.8],['gilt-chiavari-chair-f62c19',140,-0.213,-0.216,0.213,0.199,0.9],['dining-chair-530532',120,-0.201,-0.175,0.201,0.213,0.862],['bistro-chair-7c354d',90,-0.229,-0.253,0.229,0.279,0.876],['task-chair-ccd944',150,-0.319,-0.267,0.319,0.34,1.068],['bar-stool-0de3c8',80,-0.191,-0.15,0.191,0.213,0.78],['counter-stool-73553a',80,-0.265,-0.272,0.265,0.272,0.504],['piano-bench-93e2b4',120,-0.365,-0.165,0.365,0.165,0.5],
    ['coffee-table-acc698',220,-0.552,-0.258,0.552,0.258,0.4],['side-table-2ea5c0',110,-0.181,-0.207,0.181,0.107,0.51],['bedside-table-740c6b',120,-0.225,-0.212,0.225,0.188,0.55],['dining-table-7af83a',380,-0.804,-0.354,0.804,0.354,0.75],['bistro-table-877a6d',150,-0.132,-0.132,0.132,0.132,0.75],['lounge-drum-table-13d029',140,-0.196,-0.196,0.196,0.196,0.55],['folding-dining-table-7b68ce',160,-1.186,-0.699,1.186,0.699,0.739],['sideboard-dd343b',420,-0.732,-0.238,0.732,0.23,0.85],
    ['table-lamp-e25998',70,-0.098,-0.088,0.098,0.107,0.451],['table-candle-lantern-a7b5af',30,-0.065,-0.065,0.065,0.065,0.25],['bubbler-jukebox-ff71f2',900,-0.463,-0.295,0.463,0.295,1.5],
    ['fern-plant-1559b8',45,-0.51,-0.487,0.481,0.487,0.725],['potted-autumn-mums-08db8c',40,-0.159,-0.187,0.194,0.175,0.617],['ti-plant-a7ad06',50,-0.318,-0.065,0.211,0.354,2.18],['taro-plant-8c0493',55,-0.664,-0.559,0.625,0.396,1.04],['cazuela-pot-79f0ee',35,-0.186,-0.186,0.186,0.186,0.212]];
  const SMALL=new Set(['table-lamp-e25998','table-candle-lantern-a7b5af','cazuela-pot-79f0ee','potted-autumn-mums-08db8c']);   // set on a table or a shelf, not stood on the floor
  const SEAT=/sofa|chair|stool|bench/, LAMP={'table-lamp-e25998':[.34,1.3,4],'b:floorlamp':[1.5,1.8,6],'b:tablelamp':[.36,1.3,4]};   // what you sit on (once its model has come: its seat is found from it), and the lamps: the bulb's height, its brightness, its reach (metres)
  // Polyfork's pieces from the bookstore's set (data/bookstore.json, metres): a floor lamp, a library lamp, a big wool rug, a tall potted plant, a cast-iron radiator; footprint and height as above
  const BPICK=[['floorlamp',90,'FLOOR LAMP',-.18,-.18,.18,.18,1.74],['tablelamp',60,'LIBRARY LAMP',0,0,0,0,.45],['rug2',140,'WOOL RUG',0,0,0,0,0],['plant',60,'TALL PLANT',-.3,-.3,.3,.3,1.5],['radiator',80,'RADIATOR',-.3,-.04,.3,.05,.68]], BJ=__LAZY__("data/bookstore.json"), BG={};
  // a lamp's bulb behind its shade: it glows when the lamp is on and lights the room round it (warm, no shadow of its own: cheap)
  const bulb=(G,k,M)=>{ const L0=LAMP[k]; if(!L0)return; const b=new THREE.Mesh(new THREE.SphereGeometry(.05,10,8),new THREE.MeshLambertMaterial({color:0xffe6c0,emissive:0xffb466,emissiveIntensity:.03})); b.position.y=L0[0]; b.userData.shade=1; b.castShadow=false; G.add(b);
    const L=new THREE.PointLight(0xffb070,0,L0[2]*M,1.6); L.userData.i0=L0[1]; L.userData.lamp=1; L.userData.pool=true; L.position.y=L0[0]+.04; G.add(L); };
  const M=TILE/.84, MAT=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.62,metalness:.04}), BY={};
  const nameOf=k=>k.replace(/-[0-9a-f]{6}$/,'').replace(/-/g,' ').toUpperCase();
  const meshOf=k=>{ const g=WE.pfGeo&&WE.pfGeo(k); if(!g)return null; const m=new THREE.Mesh(g,MAT); m.scale.setScalar(1/M); m.castShadow=m.receiveShadow=true; return m; };
  // its models, once: the catalog's categories that hold the pieces; then every piece already in your flat gets its model
  PFDECOR.load=()=>{ if(PFDECOR.ready||PFDECOR.loading||!WE.pfLoad)return; PFDECOR.loading=true;
    Promise.all([...PICK.map(p=>WE.pfLoad(p[0]).catch(()=>null)),BJ().then(D=>{ for(const [k] of BPICK)if(D[k])BG[k]=KIT.decode(D[k]); }).catch(()=>null)]).then(()=>{ PFDECOR.ready=true; PFDECOR.loading=false; fill(); }); };
  const meshB=k=>{ const g=BG[k]; if(!g)return null; const m=new THREE.Mesh(g,MAT); m.castShadow=k!=='rug2'; m.receiveShadow=true; return m; };
  const KEYS=()=>[...PICK.map(p=>[p[0],meshOf]),...BPICK.map(p=>['b:'+p[0],k=>meshB(k.slice(2))])];
  const fill=()=>{ const A=ROOMK.api; if(!A)return; for(const [k,mk] of KEYS()){ const D=A.R.kinds['pf:'+k]; if(!D)continue; const isM=q=>q.isMesh&&!q.userData.shade;
      if(!D.tpl.children.some(isM)){ const m=mk(k); if(m)D.tpl.add(m); else D.bad=true; } D.off=!!D.bad; const tm=D.tpl.children.find(isM); if(tm&&SEAT.test(k))D.wire='sit';
      for(const un of A.units())if(un.kind==='pf:'+k&&tm&&!un.obj.children.some(isM)){ un.obj.add(tm.clone()); if(un.st)un.st.fb=null; if(A.blob)A.blob(un); if(D.wire==='sit'&&!un.wire){ un.wire='sit'; if(A.wire)A.wire(un); } } }   // a piece that waited for its model: its contact shadow, and a seat to sit on
    if(MODS.roomed&&MODS.roomed.on&&MODS.roomed.panel)MODS.roomed.panel(); };
  ROOMK.parts.push(ctx=>{ '@apts'; const {R}=ctx, CM=ctx.M;
    for(const [k,price,x0,z0,x1,z1,h] of PICK){ const id='pf:'+k; if(R.kinds[id])continue; const G=new THREE.Group(), m=PFDECOR.ready?meshOf(k):null; if(m)G.add(m); bulb(G,k,CM);
      R.kinds[id]={kind:id,name:nameOf(k),loose:false,m:0,wire:LAMP[k]?'lamp':m&&SEAT.test(k)?'sit':null,sol:SMALL.has(k)?[]:[[x0,z0,x1,z1,h]],shf:[],tpl:G,game:'pf',dept:'g:polyfork',deptName:'POLYFORK',price,off:!m}; }   // (off sale until its model has come)
    for(const [k,price,name,x0,z0,x1,z1,h] of BPICK){ const id='pf:b:'+k; if(R.kinds[id])continue; const G=new THREE.Group(), m=PFDECOR.ready?meshB(k):null; if(m)G.add(m); bulb(G,'b:'+k,CM);
      R.kinds[id]={kind:id,name,loose:false,m:0,wire:LAMP['b:'+k]?'lamp':null,sol:h&&x1>x0?[[x0,z0,x1,z1,h]]:[],shf:[],tpl:G,game:'pf',dept:'g:polyfork',deptName:'POLYFORK',price,off:!m,mount:k==='radiator'?null:undefined}; } });
  ROOMK.built.push(A=>{ '@apts'; if(PFDECOR.ready)fill(); });
  // fetched when DECORATE opens, or at once when your flat has a piece waiting for its model
  SYS.every(()=>{ const A=ROOMK.api; if(!A||PFDECOR.ready||PFDECOR.loading)return; if((MODS.roomed&&MODS.roomed.on)||A.units().some(u=>u.kind&&u.kind.startsWith('pf:')))PFDECOR.load(); },500,'150dz-pfdecor');
  window.PFDECORDBG=()=>{ const A=ROOMK.api, K=A?A.R.kinds:{}; const ks=Object.keys(K).filter(k=>k.startsWith('pf:')); return {ready:PFDECOR.ready,kinds:ks.length,built:ks.filter(k=>K[k].tpl.children.length).length,bad:ks.filter(k=>K[k].bad).length}; }; }
