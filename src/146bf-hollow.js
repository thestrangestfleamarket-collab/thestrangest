// THE HOLODECK'S PROGRAMS: each a page of its own (ROAM and BOARDED UP in src/holo/, the page games (HOLLOW PINES, SHARDWAVE, HALCYON GREENS, VESPER WARD, BREACHLINE, AR DUEL, THE CANTINA, YATAI '86, which is also worked from the ramen cart on the subway platform) behind the holodeck's shell, /holo); running one leaves the market for it (059b HOLO.go)
import {SHARED, THREE} from './003-shx.js';
import {ONLINE, UI} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {MAPG, STORE, TILE} from './006-map-pre.js';
{ const H=STORE.holo;
  H.programs.push({ name:'ROAM', cost:0, page:'/roam' }, { name:'BOARDED UP', cost:0, page:'/boarded' }, { name:'HOLLOW PINES', cost:0, page:'/holo?g=vr' }, { name:'SHARDWAVE', cost:0, page:'/holo?g=wave' }, { name:'HALCYON GREENS', cost:0, page:'/holo?g=golf' }, { name:'VESPER WARD', cost:0, page:'/holo?g=scare' }, { name:'BREACHLINE', cost:0, page:'/holo?g=shoot' }, { name:'AR DUEL', cost:0, page:'/holo?g=duel' }, { name:'THE CANTINA', cost:0, page:'/holo?g=cantina' }, { name:"YATAI '86", cost:0, page:'/holo?g=sushi' });
  // the ramen cart on the subway platform (009): step up to it and you are behind its counter
  { const M=SHARED.METRO, C=M&&M.CART; if(C){ const T=TILE, hb=new THREE.Mesh(new THREE.BoxGeometry(2.9*T,2.6*T,2*T),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(...M.V(C.x,C.y,40)); MAPG.down.add(hb);
      UI.thing({name:'THE RAMEN CART',pick:true,obj:hb,reach:2.4*T,near:4*T,tall:2.6*T,act:()=>{ SAY("YOU DUCK UNDER THE NOREN AND TIE ON THE APRON.",'#ffb070'); H.go({name:"YATAI '86",page:'/holo?g=sushi'}); }}); } }
  // a player near you hosting BOARDED UP (their page's word, t 'bu')
  const told=new Map(); ONLINE.hear.bu=m=>{ const from=m.from&&String(m.from), d=m.d; if(!from||!d||d.k!=='open'||performance.now()-(told.get(from)||-1e9)<60000)return; told.set(from,performance.now()); const o=ONLINE.others.get(from); SAY(((o&&o.name)||'A PLAYER')+' IS HOSTING BOARDED UP. RUN IT FROM YOUR VR HEADSET OR THE HOLODECK BOOTH AND PRESS JOIN.','#7dffa4'); }; }
