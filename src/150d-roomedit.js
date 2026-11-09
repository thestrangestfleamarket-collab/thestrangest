// THE ROOM EDITOR: DECORATE your apartment like the Sims (owner, 25 and 27 Oct 2026): T in your apartment (the view as it is); a click picks a thing up and a drag moves it on a grid (green fits, red doesn't), small things onto tables and shelves, pictures and wall lights onto the wall you point at; Q/E turn, Shift+wheel resizes, DEL puts it away; a buy bar of pictured things at prices; walls, floor and every light; saved to your account.
import {SHARED, THREE} from './003-shx.js';
import {BAG, FORAGE, INSPECT, INV, ONLINE, PETS, pos, UI} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {renderer, scene} from './004-main.js';
import {SAVE} from './005-save.js';
import {MODS, QS, SYS} from './006-map-pre.js';
import {ROOMK} from './150a-bedroom.js';
{ const HOME={layout:null,loaded:false}, web=/^https?:$/.test(location.protocol);
  // EP: every apartment's layout saved before this was reset to the default one (owner, 9 Nov 2026); what was placed in it is given back once, the first time its room is built
  const EP=1, cur=L=>L&&(L.ep||0)>=EP?L:null;
  const getLocal=()=>{ try{ return JSON.parse(SAVE.get('home')||'null'); }catch(e){ return null; } };
  const setLocal=L=>{ SAVE.set('home',JSON.stringify(L)); };
  const ask=async body=>{ const r=await fetch('/home',{method:'POST',headers:{'content-type':'application/json'},credentials:'same-origin',body:JSON.stringify(body)}); if(!r.ok)throw new Error(r.status); return r.json(); };
  HOME.load=async()=>{ let L=null; if(web){ try{ L=(await ask({})).home; }catch(e){} } if(!L)L=getLocal(); if(L&&!cur(L)){ HOME.stale=L; L=null; } HOME.layout=L; HOME.loaded=true; if(L&&ROOMK.api)apply(ROOMK.api,L); };
  HOME.save=async L=>{ HOME.layout=L; setLocal(L); if(web){ try{ await ask({put:L}); HOME.saved=Date.now(); }catch(e){ HOME.err=String(e); } } };

  /* ---------- a room as a layout: where every piece stands, what you added and put away, the walls, the floor, the lights ---------- */
  const r3=x=>Math.round(x*1000)/1000;
  const snapshot=A=>{ '@later'; const things={}, added=[], lights={};
    for(const un of A.units()){ const t=A.getT(un), e={u:r3(t.u),h:r3(t.h),v:r3(t.v),ry:r3(t.ry),s:r3(t.s)}; if(un.gone)e.gone=1; if(un.added)added.push({id:un.id,kind:un.kind,paid:un.paid||0,...e}); else things[un.id]=e; }
    for(const q of A.lightsAll()){ const L=A.lightGet(q.id); delete L.type0; lights[q.id]=L; }
    const L={v:1,ep:EP,wall:A.R.wall,floor:A.R.floor,kfloor:A.R.kfloorK,glow:A.R.glowK,addN:A.R.addN,things,added,lights}; for(const k of ROOMK.keep)try{ k.out(L,A); }catch(e){} return L; };
  const apply=(A,L)=>{ '@later'; if(!L||!A)return; if(L.wall)A.wall(L.wall); if(L.floor)A.floor(L.floor); if(L.kfloor)A.kfloor(L.kfloor); if(L.glow!=null)A.glow(L.glow); A.R.addN=Math.max(A.R.addN,L.addN||0); for(const k of ROOMK.keep)try{ k.in(L,A); }catch(e){}
    for(const a of L.added||[]){ if(A.units().some(u=>u.id===a.id))continue; const un=A.spawn(a.kind,a,a.id); if(!un)continue; un.paid=a.paid||0; if(a.gone)A.remove(un); }
    for(const un of A.units())if(!un.added&&L.things&&L.things[un.id]){ const t=L.things[un.id]; A.setT(un,t); if(t.gone)A.remove(un); }   // the pieces every flat has, where you moved them
    for(const id in L.lights||{})A.light(id,L.lights[id]); };
  // the room starts empty but for ROOMK.always (the TV, typewriter, telescope, globes, microscope, fish tank): its other pieces are only kinds to buy, what you bought comes back from your layout (?furnished=1 keeps it as built, for the tests of its pieces)
  const SORT={};
  ROOMK.built.push(A=>{ '@later'; sortKinds(A); const lt={}; for(const q of A.lightsAll())lt[q.id]=A.lightGet(q.id); A.R.bare={wall:A.R.wall,floor:A.R.floor,kfloor:A.R.kfloorK,glow:A.R.glowK,lights:lt}; if(!QS.has('furnished'))for(const un of A.units().slice())if(!un.added&&!ROOMK.always.has(un.kind))A.drop(un); if(HOME.stale&&!HOME.guest){ const S=HOME.stale, K=A.kinds(); HOME.stale=null; let back=0, n=0; for(const a of S.added||[]){ const KO=K[a.kind]; if(KO&&KO.own){ FORAGE.give(KO.own,1); n++; } else back+=a.paid||0; }
      INV.cash=(INV.cash||0)+back; if(INV.save)INV.save(); HOME.save(snapshot(A)); if(back||n)UI.log('YOUR APARTMENT WAS RESET'+(back?': $'+back+' BACK FOR YOUR FURNITURE':'')+(n?(back?',':':')+' '+n+' THING'+(n>1?'S':'')+' BACK IN YOUR PACK':'')+'.','#c8a090'); }
    if(HOME.guest)apply(A,HOME.guest.layout); else if(HOME.loaded)apply(A,HOME.layout); if(ED.on)ED.panel(); });
  // a visit: another player's apartment is your rooms dressed in their layout, to look at, not to change; leaving puts yours back
  const swap=L=>{ const A=ROOMK.api; if(!A)return; for(const un of A.units().slice())if(un.added)A.drop(un); const D=A.R.bare||{}; apply(A,{...D,...(L||{}),lights:{...(D.lights||{}),...((L&&L.lights)||{})}}); };
  HOME.visit=async(id,name,L0)=>{ '@later'; if(!id||(MODS.apts&&MODS.apts.inReal))return; let L=L0; if(L===undefined&&web){ try{ L=(await ask({who:id})).home; }catch(e){ L=null; } }
    HOME.guest={id,name:String(name||'A NEIGHBOUR').toUpperCase(),layout:cur(L)}; MODS.apts.host=id; const G=HOME.guest; await MODS.apts.enterReal(null,G.name+"'S APARTMENT"); if(HOME.guest!==G)return; swap(G.layout); G.in=true; };
  ONLINE.visit=(id,name)=>HOME.visit(id,name);
  // every tenant's apartment (not only who is online), for the map's quick jumps; asked at most once a minute
  let TN=null, TT=0; ONLINE.tenants=async()=>{ if(!web)return []; if(TN&&Date.now()-TT<60000)return TN; try{ TN=((await ask({list:1})).list||[]).map(t=>({id:t.who,name:t.name||'A NEIGHBOUR'})); TT=Date.now(); }catch(e){ TN=TN||[]; } return TN; };
  SYS.add('places',()=>{ if(HOME.guest&&HOME.guest.in&&MODS.apts&&!MODS.apts.inReal){ HOME.guest=null; MODS.apts.host=null; swap(HOME.layout); } },'150d-visit');
  // your pets at home go with your layout, so a visitor finds them in your rooms (146zj); a change to who is at home is saved the next time you are in
  ROOMK.keep.push({out:L=>{ if(PETS.atHome)L.pets=PETS.atHome(); },in:()=>{}});
  PETS.guestOf=()=>HOME.guest&&{name:HOME.guest.name,pets:(HOME.guest.layout&&HOME.guest.layout.pets)||[]};
  SYS.every(()=>{ const A=ROOMK.api; if(!A||!HOME.loaded||HOME.guest||!(MODS.apts&&MODS.apts.inReal)||!PETS.atHome)return; const p=JSON.stringify(PETS.atHome()); if(p!==JSON.stringify((HOME.layout&&HOME.layout.pets)||[]))HOME.save(snapshot(A)); },5000,'150d-pets');
  HOME.load();

  /* ---------- the catalog: what each kind is, its department and its price ---------- */
  const DEPTS0=[['seating','SEATING'],['beds','BEDS'],['surfaces','SURFACES'],['storage','STORAGE'],['kitchen','KITCHEN'],['decor','DECOR'],['plants','PLANTS'],['lights','LIGHTS']];
  const DEPT={BENCH:'seating',CHAIR:'seating','KITCHEN CHAIR':'seating',BED:'beds',PILLOW:'beds',BLANKETS:'beds',DESK:'surfaces','CORNER DESK':'surfaces',TABLE:'surfaces',PENINSULA:'surfaces',
    DRAWERS:'storage',HUTCH:'storage','CUBBY SHELF':'storage','RECORD CABINET':'storage',BOOKCASE:'storage',BOOKSHELF:'storage','WALL SHELF':'storage','OPEN SHELVES':'storage','WALL CABINET':'storage',
    COUNTER:'kitchen','CORNER COUNTER':'kitchen','SIDE COUNTER':'kitchen','SHORT COUNTER':'kitchen',SINK:'kitchen',STOVE:'kitchen',HOOD:'kitchen',FRIDGE:'kitchen',MICROWAVE:'kitchen',TOASTER:'kitchen','COFFEE MACHINE':'kitchen',
    'DISH RACK':'kitchen','DISH SOAP':'kitchen','PAPER TOWELS':'kitchen',CANISTER:'kitchen',POT:'kitchen',PLATES:'kitchen',MUG:'kitchen',CUP:'kitchen',MILL:'kitchen','DUTCH OVEN':'kitchen',UTENSILS:'kitchen',OIL:'kitchen',ORANGES:'kitchen','CUTTING BOARD':'kitchen',KNIFE:'kitchen',DONUTS:'kitchen',
    PLANT:'plants','TRAILING PLANT':'plants',LAMP:'lights'};
  const PRICE={BED:150,BENCH:40,DRAWERS:60,DESK:80,HUTCH:70,'CORNER DESK':110,'CUBBY SHELF':45,BLIND:15,'HALF WALL':60,TV:120,'RECORD CABINET':70,BOOKCASE:50,COUNTER:60,'CORNER COUNTER':140,'SIDE COUNTER':80,'SHORT COUNTER':35,
    PENINSULA:120,SINK:90,'OPEN SHELVES':30,STOVE:110,HOOD:60,'WALL CABINET':50,FRIDGE:160,PICTURE:20,TABLE:60,'TERRAZZO RUG':40,'MAUVE RUG':30,CHAIR:35,'KITCHEN CHAIR':25,MONITOR:60,'RECORD PLAYER':50,SPEAKER:30,
    MICROWAVE:40,'COFFEE MACHINE':30,TOASTER:15,LAMP:15,PLANT:8,'TRAILING PLANT':10,PILLOW:6,BLANKETS:10,'DUTCH OVEN':12,
    PENDANT:25,CHANDELIER:60,'FLUSH DOME':20,'TRACK SPOTS':35,'PAPER LANTERN':15,SCONCE:18,'PICTURE LIGHT':15,'WALL LANTERN':22,'NEON SIGN':45,'LED STRIP':20};
  const NOSALE=new Set(['CAT']);   // a pet, not furniture
  const kindOf=k=>{ const A=A_(); return A&&A.kinds()[k]; };
  // a kind that needs an item (own: bought from a merchant) costs nothing here: placing it uses the item up, putting it away gives it back
  const owned=K=>K&&K.own?(FORAGE.has?FORAGE.has(K.own):0):0;
  const price=k=>{ const K=kindOf(k); return K&&K.own?0:K&&K.price!=null?K.price:PRICE[k]??4; }, deptOf=(k,K)=>K&&K.dept?K.dept:K&&K.cat==='light'?'lights':DEPT[k]||'decor';
  // the room's own departments, then the game's (street, laundry, music, ...)
  const depts=A=>{ const L=DEPTS0.slice(), K=A.kinds(), seen=new Set(); for(const k in K){ const D=K[k]; if(D.dept&&!seen.has(D.dept)){ seen.add(D.dept); L.push([D.dept,D.deptName]); } } return L; };
  // how a kind is carried: 'big' on the floor with a fit check, 'rug' flat on the floor, 'small' onto any surface, 'wall' flat on the wall you point at, 'ceil' under the ceiling
  const sortAs=(D,k,sy,h)=>D.mount==='ceil'||D.mount==='wall'?D.mount:D.sol&&D.sol.length?'big':D.loose?(sy<.9?'small':'big'):sy<.03?'rug':k==='CAT'?'small':h>.5?'wall':D.game?'small':'big';
  const sortKinds=A=>{ const K=A.kinds(); for(const k in K){ const D=K[k]; if(D.game||SORT[k])continue; const un=A.units().find(u=>u.kind===k); let sy=.3, h=0; if(un){ const B=A.unitBox(un.obj); sy=(B.max.y-B.min.y)/A.M; h=A.getT(un).h; } SORT[k]=sortAs(D,k,sy,h); } };
  const sortOf=un=>{ if(SORT[un.kind])return SORT[un.kind]; const D=kindOf(un.kind); if(D&&D.game){ const f=own(un); return SORT[un.kind]=sortAs(D,un.kind,f[5]-f[4],f[4]); } return un.loose?'small':'big'; };

  /* ---------- the editor ---------- */
  const ED={on:false,sel:null,undo:[],grid:true}; window.ROOMED=ED;
  const A_=()=>ROOMK.api, inHome=()=>!!(MODS.apts&&MODS.apts.inReal&&ROOMK.api);
  const css=document.createElement('style'); css.textContent=`
  #roomed{position:fixed;right:calc(12px + env(safe-area-inset-right,0px));top:12px;width:300px;max-height:calc(100vh - 210px);display:flex;flex-direction:column;background:color-mix(in srgb,var(--bg) 97%,transparent);border:2px solid var(--line);font:12px var(--pixel);color:var(--fg);z-index:20}
  #roomed[hidden],#roomedbtn[hidden],#roombuy[hidden],#roomsay[hidden]{display:none} #roomed h2{font:12px var(--pixel);color:var(--key);margin:0;padding:10px 12px;border-bottom:2px solid var(--line);flex-shrink:0}
  #roomed .tabs,#roombuy .tabs{display:flex;border-bottom:2px solid var(--line)} #roomed .tabs{flex-shrink:0} #roomed .tabs button,#roombuy .tabs button{flex:1;font:inherit;color:var(--dim);background:none;border:0;padding:8px 2px;cursor:pointer} #roomed .tabs button.on,#roombuy .tabs button.on{color:var(--key);background:#161924}
  #roomed .pane{padding:8px 12px;overflow:auto;flex:1 1 auto;min-height:0} #roomed .row{display:flex;flex-wrap:wrap;gap:5px;align-items:center;margin:6px 0} #roomed .lab{color:var(--dim);margin:10px 0 4px}
  #roomed .btn,#roombuy .btn{font:inherit;color:var(--fg);background:#0e1016;border:2px solid #3a3f4e;padding:4px 7px;cursor:pointer} #roomed .btn:hover,#roombuy .btn:hover{border-color:var(--key)} #roomed .btn.on{border-color:var(--key);color:var(--key)}
  #roomed .sw{width:58px;height:34px;border:2px solid #3a3f4e;cursor:pointer;margin-bottom:20px} #roomed .sw.on{border-color:var(--key)} #roomed .sw span{display:block;font-size:8px;line-height:1.15;margin-top:36px;color:var(--dim);text-align:center}
  #roomed .light{border-top:1px solid var(--line);padding:6px 0} #roomed input[type=range]{width:120px} #roomed .hint{color:var(--dim);font-size:10px;line-height:1.6}
  #roomed .foot{display:flex;gap:6px;padding:8px 12px;border-top:2px solid var(--line);background:var(--bg);flex-shrink:0}
  #roombuy{position:fixed;left:calc(12px + env(safe-area-inset-left,0px));right:calc(12px + env(safe-area-inset-right,0px));bottom:calc(12px + env(safe-area-inset-bottom,0px));max-width:980px;margin:0 auto;background:color-mix(in srgb,var(--bg) 97%,transparent);border:2px solid var(--line);font:12px var(--pixel);color:var(--fg);z-index:20}
  #roombuy .top{display:flex;align-items:center;gap:8px;padding:6px 10px;border-bottom:2px solid var(--line)} #roombuy .top b{color:var(--key)} #roombuy .tabs{flex-wrap:wrap} #roombuy .tabs button{font-size:10px;flex:1 0 auto;padding:6px 6px}
  #roombuy input{font:inherit;color:var(--fg);background:#0e1016;border:2px solid #3a3f4e;padding:3px 6px;width:150px}
  #roombuy .tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(128px,1fr));gap:12px 10px;padding:10px 12px;max-height:44vh;overflow-y:auto;background:#17191f}
  #roombuy .tile{display:flex;flex-direction:column;align-items:stretch;border:2px solid transparent;background:none;cursor:pointer;padding:0;text-align:left;font:inherit;color:#ece6d6} #roombuy .tile:hover{border-color:var(--key)} #roombuy .tile.poor{opacity:.45}
  #roombuy .tile img,#roombuy .tile i{display:block;width:100%;aspect-ratio:1/1;height:auto;background:#eceae4;object-fit:contain}
  #roombuy .tile span{display:block;font-size:10px;font-weight:bold;line-height:1.25;margin:5px 3px 0;min-height:13px} #roombuy .tile small{display:block;font-size:9px;color:#8f95a3;margin:2px 3px 0;min-height:11px} #roombuy .tile em{font-style:normal;color:var(--key);font-size:10px;margin:2px 3px 0}
  #roomsay{position:fixed;left:50%;transform:translateX(-50%);top:calc(52px + env(safe-area-inset-top,0px));font:12px var(--pixel);color:#ffd2c8;background:var(--panel);border:2px solid #7a3a30;padding:6px 12px;z-index:21;pointer-events:none}
  #roomedbtn{position:fixed;left:50%;transform:translateX(-50%);top:calc(12px + env(safe-area-inset-top,0px));font:12px var(--pixel);color:var(--key);background:var(--panel);border:2px solid var(--line);padding:6px 12px;cursor:pointer;z-index:19}`;
  document.head.appendChild(css);
  const P=document.createElement('div'); P.id='roomed'; P.hidden=true; document.body.appendChild(P);
  const BUY=document.createElement('div'); BUY.id='roombuy'; BUY.hidden=true; document.body.appendChild(BUY);
  const SAYEL=document.createElement('div'); SAYEL.id='roomsay'; SAYEL.hidden=true; document.body.appendChild(SAYEL);
  const B=document.createElement('button'); B.id='roomedbtn'; B.hidden=true; B.textContent='DECORATE · T'; B.onclick=()=>ED.toggle(); document.body.appendChild(B);
  let tab='things', dept='seating', helper=null, hover=null, saveT=0, sayT=0;
  const say=m=>{ SAYEL.textContent=m; SAYEL.hidden=false; clearTimeout(sayT); sayT=setTimeout(()=>{ SAYEL.hidden=true; },2200); ED.said=m; };
  const dirty=()=>{ clearTimeout(saveT); saveT=setTimeout(()=>{ const A=A_(); if(A)HOME.save(snapshot(A)); },1200); };
  ROOMK.save=()=>{ if(HOME.guest||!A_())return false; dirty(); return true; }; ROOMK.guest=()=>!!HOME.guest; ROOMK.snap=()=>A_()?snapshot(A_()):null;   // a piece's own settings saved with the layout (the fish tank)
  const hexs=c=>'#'+c.map(x=>x.toString(16).padStart(2,'0')).join('');
  const name=un=>un.name+(un.added?' (NEW)':'');
  const cash=()=>Math.round(INV.cash||0);

  // what you did, so UNDO can take it back
  const did=(op)=>{ ED.undo.push(op); if(ED.undo.length>80)ED.undo.shift(); dirty(); };
  ED.back=()=>{ '@later'; const A=A_(), op=ED.undo.pop(); if(!A||!op)return; if(ED.carry)endCarry(); if(op.t==='move')A.setT(op.un,op.prev); else if(op.t==='gone')A.restore(op.un); else if(op.t==='back')A.remove(op.un);
    else if(op.t==='add'){ INV.cash+=op.un.paid||0; A.drop(op.un); if(ED.sel===op.un)select(null); }
    else if(op.t==='sell'){ INV.cash-=op.got; const un=A.spawn(op.kind,op.at,op.id); if(un)un.paid=op.paid; }
    else if(op.t==='wall')A.wall(op.prev); else if(op.t==='floor')A.floor(op.prev); else if(op.t==='kfloor')A.kfloor(op.prev); else if(op.t==='glow')A.glow(op.prev);
    else if(op.t==='light')A.light(op.id,op.prev); dirty(); ED.panel(); };

  /* ---------- the floor plan: where a thing stands, and whether it fits ---------- */
  const GS=.25, snap=(x,g)=>Math.round(x/g)*g, RQ=Math.PI/2;
  const own=un=>{ if(un.st.fb)return un.st.fb; const o=un.obj, B=A_().unitBox(o); if(B.isEmpty())return un.st.fb=[-.1,-.1,.1,.1,0,.1]; B.applyMatrix4(o.matrixWorld.clone().invert());
    return un.st.fb=[B.min.x,B.min.z,B.max.x,B.max.z,B.min.y,B.max.y]; };   // its box in its own metres, unturned and unscaled
  const boxes=(un,t)=>{ '@later'; const c=Math.cos(t.ry||0), sn=Math.sin(t.ry||0), s=t.s||1, xf=(x,z)=>[t.u+(x*c+z*sn)*s,t.v+(-x*sn+z*c)*s];
    const one=(r,b,top)=>{ const P=[xf(r[0],r[1]),xf(r[2],r[1]),xf(r[0],r[3]),xf(r[2],r[3])]; return [Math.min(...P.map(q=>q[0])),Math.min(...P.map(q=>q[1])),Math.max(...P.map(q=>q[0])),Math.max(...P.map(q=>q[1])),b,top]; };
    if(un.sol&&un.sol.length&&!un.loose)return un.sol.map(r=>one(r,t.h,t.h+r[4]*s)); const f=own(un); return [one(f,t.h+f[4]*s,t.h+f[5]*s)]; };
  const fits=(un,t)=>{ '@later'; const A=A_(), me=boxes(un,t), so=sortOf(un), e=.02;
    if(so!=='wall'&&so!=='ceil')for(const b of me)if(b[0]<-.05||b[1]<-.05||b[2]>A.Lx+.05||b[3]>A.Ly+.05)return {ok:false,me,why:'IT DOESN\'T FIT IN THE ROOM'};
    if(so!=='big'||un.loose)return {ok:true,me};
    for(const o of A.units()){ if(o===un||o.gone||o.loose||!(o.sol&&o.sol.length))continue; const ob=boxes(o,A.getT(o));
      for(const b of me)for(const q of ob)if(b[0]<q[2]-e&&q[0]<b[2]-e&&b[1]<q[3]-e&&q[1]<b[3]-e&&b[4]<q[5]-e&&q[4]<b[5]-e)return {ok:false,me,why:'THE '+o.name+' IS IN THE WAY'}; }
    return {ok:true,me}; };
  // the footprint drawn on the floor (green fits, red doesn't) and the grid while you carry something
  const FPM={ok:new THREE.MeshBasicMaterial({color:0x5ad06a,transparent:true,opacity:.34,depthTest:false,depthWrite:false}),no:new THREE.MeshBasicMaterial({color:0xe0503c,transparent:true,opacity:.42,depthTest:false,depthWrite:false})};
  const fpG=new THREE.Group(), fpGeo=new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2); let gridL=null;
  const showFp=(un,t)=>{ '@later'; const A=A_(); if(!un||!A){ fpG.visible=false; return null; } if(fpG.parent!==A.R.apt)A.R.apt.add(fpG); const f=fits(un,t); fpG.visible=true;
    while(fpG.children.length<f.me.length){ const m=new THREE.Mesh(fpGeo,FPM.ok); m.renderOrder=21; m.frustumCulled=false; fpG.add(m); }
    fpG.children.forEach((m,i)=>{ const b=f.me[i]; m.visible=!!b; if(!b)return; m.material=f.ok?FPM.ok:FPM.no; m.position.set((b[0]+b[2])/2,Math.max(0,b[4])+.012,(b[1]+b[3])/2); m.scale.set(Math.max(.04,b[2]-b[0]),1,Math.max(.04,b[3]-b[1])); }); return f; };
  const showGrid=on=>{ '@later'; const A=A_(); if(!A)return; if(on&&!gridL){ const p=[]; for(let u=0;u<=A.Lx+1e-6;u+=GS)p.push(u,.006,0,u,.006,A.Ly); for(let v=0;v<=A.Ly+1e-6;v+=GS)p.push(0,.006,v,A.Lx,.006,v);
      const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(p,3)); gridL=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0xf2c14e,transparent:true,opacity:.16,depthWrite:false})); gridL.renderOrder=20; }
    if(gridL){ if(gridL.parent!==A.R.apt)A.R.apt.add(gridL); gridL.visible=!!on&&ED.grid; } };

  const select=un=>{ ED.sel=un; if(helper){ helper.removeFromParent(); helper=null; } if(un){ helper=new THREE.BoxHelper(un.obj,0xf2c14e); helper.material.depthTest=false; helper.renderOrder=20; scene.add(helper); showFp(un,A_().getT(un)); } else fpG.visible=false; if(ED.on)ED.panel(); };
  const setHover=un=>{ if(hover&&hover.un===un)return; if(hover){ hover.h.removeFromParent(); hover=null; } if(un&&un!==ED.sel){ const h=new THREE.BoxHelper(un.obj,0x7fb8ff); h.material.depthTest=false; h.material.transparent=true; h.material.opacity=.6; h.renderOrder=20; scene.add(h); hover={un,h}; } };
  // a change by key or button: kept if it fits (or if where it was didn't fit either)
  const tf=(un,f)=>{ '@later'; const A=A_(); if(drag&&drag.un===un){ f(drag.t); vis(un,drag.t); drag.fit=showFp(un,drag.t); if(helper)helper.update(); return; } const prev=A.getT(un), t={...prev}; f(t); const ok=fits(un,t); if(!ok.ok&&fits(un,prev).ok){ say(ok.why); showFp(un,prev); return; }
    A.setT(un,t); did({t:'move',un,prev}); if(helper)helper.update(); showFp(un,A.getT(un)); ED.panel(); };
  const turn=(d,free)=>{ if(ED.sel)tf(ED.sel,t=>{ t.ry+=d; if(ED.grid&&!free)t.ry=snap(t.ry,RQ); }); }, size=k=>{ if(ED.sel)tf(ED.sel,t=>{ t.s=Math.max(.3,Math.min(3,t.s*k)); }); }, lift=d=>{ if(ED.sel)tf(ED.sel,t=>{ t.h=Math.max(0,t.h+d); }); };
  const putAway=()=>{ const un=ED.sel, A=A_(); if(!un)return; if(ED.carry)endCarry(); const KO=kindOf(un.kind); if(KO&&KO.own&&un.added){ FORAGE.give(KO.own,1); A.drop(un); select(null); say('BACK IN YOUR PACK'); drawBuy(); return; } A.remove(un); did({t:'gone',un}); select(null); };
  const bringBack=un=>{ const A=A_(); A.restore(un); did({t:'back',un}); select(un); };
  // somewhere it fits, near where it was asked for: rings of grid steps outward
  const findSpot=(un,t)=>{ if(fits(un,t).ok)return t; const A=A_(); for(let r=1;r<=24;r++)for(let i=-r;i<=r;i++)for(const [du,dv] of [[i,-r],[i,r],[-r,i],[r,i]]){ const q={...t,u:snap(t.u,GS)+du*GS,v:snap(t.v,GS)+dv*GS}; if(q.u<0||q.v<0||q.u>A.Lx||q.v>A.Ly)continue; if(fits(un,q).ok)return q; } return t; };
  const add=(kind,at,paid)=>{ '@later'; const A=A_(), K=A.kinds()[kind]; if(!K)return null; const me=A.toApt(pos.x,SHARED.py,pos.z), base=K.loose?A.getT({loose:true,obj:K.tpl}):{h:K.tpl.position.y};
    const t=at||{u:Math.max(.4,Math.min(A.Lx-.4,me.u+.6)),h:K.mount==='ceil'?A.HW:K.mount==='wall'?1.8:K.loose?Math.max(.05,base.h):base.h,v:Math.max(.4,Math.min(A.Ly-.4,me.v+.6)),ry:0,s:1}; const un=A.spawn(kind,t); if(!un)return null;
    un.paid=paid||0; const q=findSpot(un,A.getT(un)); if(q!==t)A.setT(un,q); did({t:'add',un}); select(un); return un; };
  // buying: paid from your cash, carried under the pointer until you click it down
  ED.buy=kind=>{ '@later'; const A=A_(), K=A&&A.kinds()[kind]; if(!K||NOSALE.has(kind)||(K.tpl&&K.bad))return null; if(ED.carry)placeCarry(true); const p=price(kind); if(K.own&&!owned(K)){ say('BUY ONE FIRST'); return null; } if(cash()<p){ say('NOT ENOUGH MONEY: $'+p); return null; }
    INV.cash-=p; if(K.own)FORAGE.take(K.own,1); const un=add(kind,null,p); if(!un){ INV.cash+=p; if(K.own)FORAGE.give(K.own,1); return null; } startCarry(un); drawBuy(); return un; };
  const sell=()=>{ '@later'; const un=ED.sel, A=A_(); if(!un||!un.added)return; if(ED.carry)endCarry(); const KO=kindOf(un.kind); if(KO&&KO.own){ FORAGE.give(KO.own,1); A.drop(un); select(null); say('BACK IN YOUR PACK'); drawBuy(); return; } const got=Math.floor((un.paid||0)/2), at=A.getT(un); INV.cash+=got; A.drop(un); did({t:'sell',kind:un.kind,at,id:un.id,paid:un.paid||0,got}); select(null); say('SOLD FOR $'+got); drawBuy(); };
  const copy=()=>{ const un=ED.sel, A=A_(); if(!un)return; const k=un.kind; if(NOSALE.has(k))return; const p=price(k); if(cash()<p){ say('NOT ENOUGH MONEY: $'+p); return; } const t=A.getT(un); INV.cash-=p; add(k,{...t,u:t.u+.3,v:t.v+.3},p); drawBuy(); };

  /* ---------- little pictures of each kind for the buy bar (drawn once each, a couple a frame, with the game's own renderer) ---------- */
  const PICS={}, PQ=[]; let picRT=null, picBuf=null;
  const TS=new THREE.Scene(); TS.add(new THREE.HemisphereLight(0xfff4e6,0x50505c,2.2)); { const d=new THREE.DirectionalLight(0xffffff,2.4); d.position.set(2,4,3); TS.add(d); }
  const TC=new THREE.OrthographicCamera(-1,1,1,-1,.01,100), PS=160, SZ={};
  const drawPic=kind=>{ '@later'; const A=A_(), K=A&&A.kinds()[kind]; if(!K)return; const tpl=K.tpl; if(K.bad){ PICS[kind]=''; for(const el of BUY.querySelectorAll('[data-add]'))if(el.dataset.add===kind)el.remove(); return; } const o=tpl.clone(true), drop=[]; o.position.set(0,0,0); o.rotation.set(0,0,0); o.scale.setScalar(1);
    o.traverse(q=>{ if(q.isLight||q.userData.hit||q.userData.blob||q.userData.soft||(q.material&&q.material.visible===false))drop.push(q); }); for(const q of drop)q.removeFromParent();
    TS.add(o); const B=new THREE.Box3().setFromObject(o), c=B.getCenter(new THREE.Vector3()), bs=B.getSize(new THREE.Vector3()), r=Math.max(.05,bs.length()/2); SZ[kind]=`${bs.x.toFixed(1)}×${bs.z.toFixed(1)}×${bs.y.toFixed(1)} m`;
    TC.left=TC.bottom=-r*1.05; TC.right=TC.top=r*1.05; TC.near=.01; TC.far=r*8; TC.position.copy(c).add(new THREE.Vector3(1,.85,1).normalize().multiplyScalar(r*4)); TC.lookAt(c); TC.updateProjectionMatrix();
    if(!picRT){ picRT=new THREE.WebGLRenderTarget(PS,PS); picBuf=new Uint8Array(PS*PS*4); }
    const prevRT=renderer.getRenderTarget(), prevClip=renderer.localClippingEnabled, prevCol=renderer.getClearColor(new THREE.Color()), prevA=renderer.getClearAlpha(), prevSh=renderer.shadowMap.autoUpdate;
    try{ renderer.localClippingEnabled=false; renderer.shadowMap.autoUpdate=false; renderer.setRenderTarget(picRT); renderer.setClearColor(0x000000,0); renderer.clear(); renderer.render(TS,TC); renderer.readRenderTargetPixels(picRT,0,0,PS,PS,picBuf); }
    finally{ renderer.setRenderTarget(prevRT); renderer.localClippingEnabled=prevClip; renderer.setClearColor(prevCol,prevA); renderer.shadowMap.autoUpdate=prevSh; TS.remove(o); }
    const cv=document.createElement('canvas'); cv.width=cv.height=PS; const g=cv.getContext('2d'), im=g.createImageData(PS,PS), gam=v=>Math.round(255*Math.pow(v/255,1/2.2));
    for(let y=0;y<PS;y++)for(let x=0;x<PS;x++){ const s=((PS-1-y)*PS+x)*4, d=(y*PS+x)*4; im.data[d]=gam(picBuf[s]); im.data[d+1]=gam(picBuf[s+1]); im.data[d+2]=gam(picBuf[s+2]); im.data[d+3]=picBuf[s+3]; }
    g.putImageData(im,0,0); PICS[kind]=cv.toDataURL(); for(const el of BUY.querySelectorAll('[data-pic]'))if(el.dataset.pic===kind)el.outerHTML=`<img alt="" src="${PICS[kind]}">`; for(const el of BUY.querySelectorAll('[data-sz]'))if(el.dataset.sz===kind)el.textContent=SZ[kind]; };

  /* ---------- the buy bar ---------- */
  const forSale=A=>{ const K=A.kinds(); return Object.keys(K).filter(k=>!NOSALE.has(k)&&!K[k].bad&&(!K[k].own||owned(K[k]))).sort((a,b)=>K[a].name<K[b].name?-1:1); };
  let find='';
  const drawBuy=()=>{ '@later'; const A=A_(); if(!ED.on||!A){ BUY.hidden=true; return; } BUY.hidden=false; const K=A.kinds(), q=find.trim().toUpperCase(), ks=forSale(A).filter(k=>q?K[k].name.includes(q):deptOf(k,K[k])===dept).slice(0,q?120:1e9), have=cash();
    let h=`<div class="top"><b>BUY</b><span>YOU HAVE $${have.toLocaleString('en-US')}</span><input id="roomfind" placeholder="FIND" value="${find.replace(/"/g,'')}"><span style="margin-left:auto;color:var(--dim);font-size:10px">${ED.carry?'CLICK TO PUT IT DOWN · ESC TAKES IT BACK':'CLICK A THING TO BUY IT'}</span></div>`;
    h+=`<div class="tabs">${depts(A).map(([k,n])=>`<button data-dept="${k}" class="${!q&&dept===k?'on':''}">${n}</button>`).join('')}</div><div class="tiles">`;
    for(const k of ks){ const p=price(k); if(!PICS[k]&&!PQ.includes(k))PQ.push(k);
      h+=`<button class="tile${have<p?' poor':''}" data-add="${k}">${PICS[k]?`<img alt="" src="${PICS[k]}">`:`<i data-pic="${k}"></i>`}<span>${K[k].name}</span><small data-sz="${k}">${SZ[k]||''}</small><em>${K[k].own?'YOURS x'+owned(K[k]):'$'+p}</em></button>`; }
    const f=document.activeElement&&document.activeElement.id==='roomfind'; BUY.innerHTML=h+(ks.length?'':'<span style="color:var(--dim)">NOTHING HERE</span>')+'</div>';
    if(f){ const i=BUY.querySelector('#roomfind'); i.focus(); i.setSelectionRange(i.value.length,i.value.length); }
    P.style.maxHeight=Math.max(160,innerHeight-BUY.offsetHeight-48)+'px'; };   // the panel stops above the bar, however tall its tabs wrap
  BUY.addEventListener('click',e=>{ const b=e.target.closest('[data-dept],[data-add]'); if(!b)return; if(b.dataset.dept){ dept=b.dataset.dept; find=''; return drawBuy(); } ED.buy(b.dataset.add); });
  BUY.addEventListener('input',e=>{ if(e.target.id==='roomfind'){ find=e.target.value; drawBuy(); } });

  /* ---------- the panel ---------- */
  ED.panel=()=>{ '@later'; const A=A_(); if(!ED.on||!A){ P.hidden=true; BUY.hidden=true; return; } P.hidden=false;
    const T=(k,n)=>`<button data-tab="${k}" class="${tab===k?'on':''}">${n}</button>`;
    let h=`<h2>DECORATE YOUR APARTMENT</h2><div class="tabs">${T('things','THINGS')}${T('walls','WALLS')}${T('floor','FLOOR')}${T('lights','LIGHTS')}</div><div class="pane">`;
    if(tab==='things'){ const s=ED.sel;
      h+=s?`<div class="lab">PICKED UP</div><div style="color:var(--key)">${name(s)}</div><div class="row"><button class="btn" data-a="turnl">⟲ TURN</button><button class="btn" data-a="turnr">TURN ⟳</button><button class="btn" data-a="small">SMALLER</button><button class="btn" data-a="big">BIGGER</button></div>
        <div class="row"><button class="btn" data-a="down">LOWER</button><button class="btn" data-a="up">RAISE</button><button class="btn" data-a="copy">COPY $${price(s.kind)}</button><button class="btn" data-a="away">PUT AWAY</button>${s.added?`<button class="btn" data-a="sell">SELL $${Math.floor((s.paid||0)/2)}</button>`:''}${A.lightsAll().some(q=>q.un===s)?'<button class="btn" data-a2="light">LIGHT SETTINGS</button>':''}</div>`
        :`<div class="hint">CLICK A THING TO PICK IT UP, DRAG TO MOVE IT: GREEN FITS, RED DOESN'T.<br>Q / E TURN · ALT FOR FREE PLACING · SHIFT+WHEEL RESIZES · [ ] LOWER / RAISE · DEL PUTS IT AWAY · G GRID · CTRL+Z UNDO</div>`;
      const gone=A.units().filter(u=>u.gone);
      if(gone.length)h+=`<div class="lab">PUT AWAY</div><div class="row">${gone.map(u=>`<button class="btn" data-back="${u.id}">${name(u)}</button>`).join('')}</div>`; }
    const sw=(set,k,D,on)=>{ const t=A.thumb(set,k); return `<div class="sw ${on?'on':''}" data-${set}="${k}" style="background:${hexs(D.c)}${t?` url(${t}) center/cover`:''}"><span>${D.n}</span></div>`; };
    const group=(set,lab,L,cur)=>L.length?`<div class="lab">${lab}</div><div class="row">${L.map(([k,D])=>sw(set,k,D,cur===k)).join('')}</div><div style="height:12px"></div>`:'';
    if(tab==='walls'){ const W=Object.entries(A.walls); h+=group('wall','PAINT',W.filter(([k,D])=>!D.g),A.R.wall)+group('wall','WALLPAPER',W.filter(([k,D])=>D.g==='paper'),A.R.wall)+group('wall','BRICK AND WOOD',W.filter(([k,D])=>D.g==='other'),A.R.wall); }
    if(tab==='floor'){ h+=group('floor','ROOM FLOOR',Object.entries(A.floors),A.R.floor); if(A.R.kfloor)h+=group('kfloor','KITCHEN FLOOR',Object.entries(A.kfloors),A.R.kfloorK); }
    if(tab==='lights'){ const K=A.kinds(), fit=m=>Object.keys(K).filter(k=>K[k].cat==='light'&&K[k].mount===m);
      h+=`<div class="lab">ADD A LIGHT · CEILING</div><div class="row">${fit('ceil').map(k=>`<button class="btn" data-add="${k}">${K[k].name} $${price(k)}</button>`).join('')}</div>
        <div class="lab">ADD A LIGHT · WALL</div><div class="row">${fit('wall').map(k=>`<button class="btn" data-add="${k}">${K[k].name} $${price(k)}</button>`).join('')}</div>
`;
      const rng=(id,key,lab,v,lo,hi,f=1,unit='%')=>`<div class="row">${lab} <input type="range" min="${lo}" max="${hi}" value="${Math.round(v*f)}" data-lset="${key}" data-id="${id}" data-f="${f}"> <span>${Math.round(v*f)}${unit}</span></div>`;
      for(const q of A.lightsAll()){ const L=A.lightGet(q.id), open=ED.open===q.id;
        h+=`<div class="light"><div class="row"><button class="btn ${L.on?'on':''}" data-lon="${q.id}">${L.on?'ON':'OFF'}</button><span>${q.name}</span><button class="btn" data-lopen="${q.id}" style="margin-left:auto">${open?'LESS':'MORE'}</button></div>${rng(q.id,'k','BRIGHTNESS',L.k,0,300,100)}`;
        if(open){ h+=`${rng(q.id,'tone','TONE',L.tone??2700,1800,6500,1,'K')}<div class="row">COLOUR <input type="color" value="${L.col||'#ffffff'}" data-lcol="${q.id}"> <button class="btn" data-lclear="${q.id}">WARM WHITE</button></div>
          ${rng(q.id,'tint','TINT',L.tint??(L.col?1:0),0,100,100)}<div class="row">TYPE <button class="btn ${L.type==='point'?'on':''}" data-ltype="${q.id}" data-v="point">ALL ROUND</button><button class="btn ${L.type==='spot'?'on':''}" data-ltype="${q.id}" data-v="spot">BEAM</button></div>
          ${L.type==='spot'?rng(q.id,'yaw','AIM TURN',L.yaw,-180,180,1,'°')+rng(q.id,'pitch','AIM TILT',L.pitch,0,90,1,'°')+rng(q.id,'angle','BEAM WIDTH',L.angle,5,85,1,'°')+rng(q.id,'soft','SOFTNESS',L.soft,0,100,100):''}
          ${rng(q.id,'reach','REACH',L.reach,30,300,100)}<div class="row"><button class="btn" data-lreset="${q.id}">AS IT CAME</button></div>`; }
        h+=`</div>`; } }
    h+=`</div><div class="foot"><button class="btn" data-a="undo">UNDO</button><button class="btn" data-a="reset">RESET</button><button class="btn ${ED.grid?'on':''}" data-a="grid">GRID</button><button class="btn" data-a="done" style="margin-left:auto">DONE</button></div>`;
    const st=P.scrollTop; P.innerHTML=h; P.scrollTop=st; drawBuy(); };
  P.addEventListener('click',e=>{ '@later'; const b=e.target.closest('[data-tab],[data-a],[data-add],[data-back],[data-wall],[data-floor],[data-kfloor],[data-lon],[data-lopen],[data-ltype],[data-lclear],[data-lreset],[data-a2]'); if(!b)return; const A=A_(); if(!A)return; const d=b.dataset;
    if(d.tab){ tab=d.tab; return ED.panel(); }
    if(d.add)return ED.buy(d.add);
    if(d.back){ const un=A.units().find(u=>u.id===d.back); if(un)bringBack(un); return; }
    if(d.wall){ did({t:'wall',prev:A.R.wall}); A.wall(d.wall); return ED.panel(); }
    if(d.floor){ did({t:'floor',prev:A.R.floor}); A.floor(d.floor); return ED.panel(); }
    if(d.kfloor){ did({t:'kfloor',prev:A.R.kfloorK}); A.kfloor(d.kfloor); return ED.panel(); }
    if(d.lopen){ ED.open=ED.open===d.lopen?null:d.lopen; return ED.panel(); }
    if(d.a2==='light'&&ED.sel){ const q=A.lightsAll().find(x=>x.un===ED.sel); if(q){ tab='lights'; ED.open=q.id; } return ED.panel(); }
    const lid=d.lon||d.ltype||d.lclear||d.lreset; if(lid){ const prev=A.lightGet(lid); if(!prev)return;
      if(d.lon)A.light(lid,{on:!prev.on}); else if(d.ltype)A.light(lid,{type:d.v}); else if(d.lclear)A.light(lid,{col:null,tint:null,tone:null}); else A.lightReset(lid); did({t:'light',id:lid,prev}); return ED.panel(); }
    ({turnl:()=>turn(RQ),turnr:()=>turn(-RQ),small:()=>size(1/1.1),big:()=>size(1.1),down:()=>lift(-.05),up:()=>lift(.05),copy,away:putAway,sell,undo:ED.back,reset:ED.reset,done:ED.toggle,grid:()=>{ ED.grid=!ED.grid; ED.panel(); }}[d.a]||(()=>{}))(); });
  let slid=null;
  P.addEventListener('input',e=>{ '@later'; const t=e.target, A=A_(); if(!A)return;
    if(t.dataset.lcol){ const id=t.dataset.lcol; if(!slid)slid={t:'light',id,prev:A.lightGet(id)}; const L=A.lightGet(id); A.light(id,{col:t.value,tint:L.tint??1}); return; }
    if(t.type!=='range')return; const v=+t.value/100; if(t.nextElementSibling)t.nextElementSibling.textContent=t.value+'%';
    if(t.dataset.glow){ if(!slid)slid={t:'glow',prev:A.R.glowK}; A.glow(v); }
    if(t.dataset.lset){ const id=t.dataset.id, key=t.dataset.lset, val=+t.value/(+t.dataset.f||1); if(!slid)slid={t:'light',id,prev:A.lightGet(id)}; const o={[key]:val}; if(key==='tint'&&!A.lightGet(id).col)o.col='#ffffff'; A.light(id,o); if(t.nextElementSibling)t.nextElementSibling.textContent=t.value+(key==='tone'?'K':['yaw','pitch','angle'].includes(key)?'°':'%'); } });
  P.addEventListener('change',()=>{ if(slid){ did(slid); slid=null; } });
  // what you bought comes back as money when the room goes back as it came
  ED.reset=()=>{ '@later'; const A=A_(); if(!A||!confirm('EMPTY YOUR APARTMENT? WHAT YOU BOUGHT IS PAID BACK.'))return; if(ED.carry)endCarry(); select(null);
    for(const un of A.units().slice()){ INV.cash+=un.paid||0; A.drop(un); }
    A.wall('beige'); A.floor('warm'); A.kfloor('oak'); A.glow(1); for(const q of A.lightsAll())A.lightReset(q.id);
    ED.undo.length=0; dirty(); ED.panel(); };

  /* ---------- the camera over the room while you decorate (back as it was when you're done) ---------- */
  ED.toggle=()=>{ '@later'; if(!ED.on&&HOME.guest){ SAY("THIS IS "+HOME.guest.name+"'S APARTMENT. YOU CAN LOOK, NOT DECORATE.",'#c8a090'); return; } if(!ED.on&&!inHome())return; ED.on=!ED.on; if(!ED.on){ if(ED.carry)placeCarry(true); select(null); setHover(null); showGrid(false); const A=A_(); clearTimeout(saveT); if(A)HOME.save(snapshot(A)); } ED.panel(); B.textContent=ED.on?'DONE · T':'DECORATE · T'; };

  /* ---------- the mouse and the keys while you decorate ---------- */
  const rc=new THREE.Raycaster(), ndc=new THREE.Vector2(), plane=new THREE.Plane(), hitP=new THREE.Vector3(), UP=new THREE.Vector3(0,1,0);
  const ray=e=>{ const r=renderer.domElement.getBoundingClientRect(); ndc.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1); rc.setFromCamera(ndc,SHARED.cam); return rc; };
  const meshOk=o=>o.isMesh&&o.visible&&!o.userData.hit&&!o.userData.blob&&!(o.material&&o.material.visible===false);
  const pick=e=>{ '@later'; const A=A_(), map=new Map(), objs=[]; for(const un of A.units())if(!un.gone){ objs.push(un.obj); map.set(un.obj,un); }
    for(const h of ray(e).intersectObjects(objs,true)){ const o=h.object; if(!meshOk(o))continue; let q=o; while(q&&!map.has(q))q=q.parent; if(q)return {un:map.get(q),p:h.point}; } return null; };
  // where the pointer is on a surface (a table, a shelf, the floor) for a small thing: the first face that looks up
  const nW=new THREE.Vector3(), nM=new THREE.Matrix3();
  const surfaceAt=(e,un)=>{ '@later'; const A=A_(), objs=[]; for(const o of A.units())if(!o.gone&&o!==un)objs.push(o.obj);
    for(const h of ray(e).intersectObjects(objs,true)){ if(!meshOk(h.object)||h.object.userData.soft||!h.face)continue; nM.getNormalMatrix(h.object.matrixWorld); nW.copy(h.face.normal).applyMatrix3(nM).normalize(); if(nW.y>.6)return A.toApt(h.point.x,h.point.y,h.point.z); }
    plane.set(UP,-A.W(0,0,0).y); return ray(e).ray.intersectPlane(plane,hitP)?A.toApt(hitP.x,hitP.y,hitP.z):null; };
  // which wall the pointer is on, from the inside (the one you see the face of)
  const WN={Ww:[1,0],We:[-1,0],Wf:[0,1],Wb:[0,-1]}, WRY={Ww:Math.PI/2,We:-Math.PI/2,Wf:0,Wb:Math.PI};
  const nearWall=(A,t)=>[[t.u,'Ww'],[A.Lx-t.u,'We'],[t.v,'Wf'],[A.Ly-t.v,'Wb']].sort((a,b)=>a[0]-b[0])[0];
  const wallAt=e=>{ '@later'; const A=A_(), apt=A.R.apt, inv=apt.matrixWorld.clone().invert(), r=ray(e).ray.clone().applyMatrix4(inv), d=r.direction.clone().normalize(), o=r.origin; let best=null;
    for(const k in WN){ const [nu,nv]=WN[k], dn=d.x*nu+d.z*nv; if(dn>=-1e-4)continue; const w=k==='Ww'?0:k==='We'?A.Lx:k==='Wf'?0:A.Ly, s=nu?(w-o.x)/d.x:(w-o.z)/d.z; if(!(s>0))continue;
      const p=o.clone().addScaledVector(d,s); if(p.x<-.01||p.x>A.Lx+.01||p.z<-.01||p.z>A.Ly+.01||p.y<0||p.y>A.HW)continue; if(!best||s<best.s)best={k,s,u:p.x,h:p.y,v:p.z}; } return best; };
  let drag=null, hovT=0;
  const vis=(un,t)=>{ const A=A_(), o=un.obj; if(un.loose){ o.position.copy(A.W(t.u,t.h+.03,t.v)); o.scale.setScalar(A.M*(t.s||1)); } else { o.position.set(t.u,t.h,t.v); o.scale.setScalar(t.s||1); } o.rotation.set(0,t.ry||0,0); };
  const begin=(un,carry,grab)=>{ '@later'; const A=A_(), o=un.obj, prev=A.getT(un), wp=new THREE.Vector3(); o.getWorldPosition(wp); const so=sortOf(un), w0=nearWall(A,prev);
    plane.set(UP,-wp.y); let off=new THREE.Vector3(); if(grab&&!carry&&(so==='big'||so==='rug'||so==='ceil')&&ray(grab).ray.intersectPlane(plane,hitP))off=wp.clone().sub(hitP);
    if(un.loose)A.lift(un); const fb=own(un), thin=Math.min(fb[2]-fb[0],fb[3]-fb[1])/2*(prev.s||1)+.01;
    drag={un,prev,off,wp,so,carry,moved:false,t:{...prev},w0:w0[1],d0:carry?Math.min(w0[0],thin):w0[0],dh:grab&&so==='wall'?(()=>{ const w=wallAt(grab); return w?prev.h-w.h:0; })():-fb[4]*(prev.s||1)}; showGrid(so!=='wall'&&so!=='ceil'); };
  const move=e=>{ '@later'; const A=A_(), d=drag, un=d.un, o=un.obj, t={...d.t}, free=e.altKey||!ED.grid;
    if(d.so==='wall'){ const w=wallAt(e); if(!w)return; const [nu,nv]=WN[w.k]; t.h=Math.max(0,Math.min(A.HW-.1,w.h+d.dh)); t.u=w.u+nu*d.d0; t.v=w.v+nv*d.d0; t.ry=d.prev.ry+WRY[w.k]-WRY[d.w0];
      if(!free){ t.h=snap(t.h,GS/2); if(nu)t.v=snap(t.v,GS/2); else t.u=snap(t.u,GS/2); } }
    else if(d.so==='small'){ const p=surfaceAt(e,un); if(!p)return; t.u=p.u; t.v=p.v; t.h=Math.max(0,p.h); if(!free&&p.h<.02){ t.u=snap(t.u,GS/2); t.v=snap(t.v,GS/2); } }
    else { plane.set(UP,-d.wp.y); if(!ray(e).ray.intersectPlane(plane,hitP))return; const n=hitP.clone().add(d.off), q=A.toApt(n.x,n.y,n.z); t.u=q.u; t.v=q.v; if(!free){ t.u=snap(t.u,GS); t.v=snap(t.v,GS); } }
    t.u=Math.max(0,Math.min(A.Lx,t.u)); t.v=Math.max(0,Math.min(A.Ly,t.v)); d.t=t; d.moved=true;
    vis(un,t); d.fit=showFp(un,t); if(helper)helper.update(); };
  // put down where it is if it fits (or where it was didn't either); otherwise back where it was
  const finish=()=>{ '@later'; const A=A_(), d=drag; drag=null; showGrid(false); if(!A)return true; const un=d.un, t=d.moved?d.t:A.getT(un); if(un.loose&&d.moved)t.h+=.03;
    const f=fits(un,t); if(!f.ok&&(d.carry||fits(un,d.prev).ok)){ if(d.carry){ drag=d; say(f.why); return false; } A.setT(un,d.prev); say(f.why); }
    else { A.setT(un,t); if(d.moved&&!d.carry)did({t:'move',un,prev:d.prev}); }
    if(helper)helper.update(); showFp(un,A.getT(un)); ED.panel(); return true; };
  const startCarry=un=>{ begin(un,true,null); ED.carry=un; };
  // closing the editor while you carry something: down where it is if it fits, else where it came in
  const placeCarry=force=>{ if(!drag||!drag.carry)return; if(!force){ if(finish()){ ED.carry=null; drawBuy(); } return; } const d=drag, A=A_(), t=d.moved?{...d.t,h:d.t.h+(d.un.loose?.03:0)}:d.prev;
    drag=null; ED.carry=null; showGrid(false); if(A)A.setT(d.un,fits(d.un,t).ok?t:d.prev); };
  const endCarry=()=>{ if(drag&&drag.carry){ const A=A_(); if(A)A.setT(drag.un,drag.prev); drag=null; showGrid(false); } ED.carry=null; };
  const cancelCarry=()=>{ const un=ED.carry; endCarry(); const op=ED.undo[ED.undo.length-1]; if(op&&op.t==='add'&&op.un===un)ED.back(); };
  addEventListener('pointerdown',e=>{ if(!ED.on||e.button!==0||e.target!==renderer.domElement)return; e.stopImmediatePropagation(); e.preventDefault(); const A=A_(); if(!A)return;
    if(drag&&drag.carry){ move(e); placeCarry(); return; }
    const h=pick(e); if(!h){ select(null); return; } setHover(null); select(h.un); begin(h.un,false,e); },true);
  addEventListener('pointermove',e=>{ if(!ED.on)return; const A=A_(); if(!A){ drag=null; return; }
    if(drag){ if(drag.carry&&e.target!==renderer.domElement)return; move(e); return; }
    if(e.target!==renderer.domElement||e.buttons)return; const now=performance.now(); if(now-hovT<60)return; hovT=now; const h=pick(e); setHover(h&&h.un); },true);
  addEventListener('pointerup',e=>{ if(!drag||drag.carry||e.button!==0)return; finish(); },true);
  addEventListener('wheel',e=>{ if(!ED.on||!ED.sel||!e.shiftKey||e.target!==renderer.domElement)return; e.stopImmediatePropagation(); e.preventDefault(); size((e.deltaY||e.deltaX)<0?1.05:1/1.05); },{capture:true,passive:false});   // the wheel zooms; Shift+wheel resizes what you picked up
  addEventListener('keydown',e=>{ const tg=e.target; if(tg&&(tg.tagName==='INPUT'||tg.tagName==='TEXTAREA'||tg.isContentEditable)&&tg.type!=='range')return; const k=e.key.toLowerCase();
    if(k==='t'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&(ED.on||inHome())){ if(!e.repeat)ED.toggle(); e.stopImmediatePropagation(); e.preventDefault(); return; }
    if(!ED.on)return; let used=true;
    if(k==='escape'){ if(ED.carry)cancelCarry(); else ED.toggle(); } else if((e.ctrlKey||e.metaKey)&&k==='z')ED.back();
    else if(ED.sel&&k==='q')turn(e.altKey?Math.PI/12:RQ,e.altKey); else if(ED.sel&&k==='e')turn(e.altKey?-Math.PI/12:-RQ,e.altKey);
    else if(ED.sel&&k==='[')lift(-.05); else if(ED.sel&&k===']')lift(.05); else if(ED.sel&&(k==='delete'||k==='backspace'||k==='x'))putAway();
    else if(k==='g'){ ED.grid=!ED.grid; ED.panel(); }
    else used=false; if(used){ e.stopImmediatePropagation(); e.preventDefault(); } },true);

  // the button shows in your apartment; the editor closes if you leave it; the buy bar's pictures a couple a frame
  SYS.add('places',()=>{ const h=inHome(); if(B.hidden===h)B.hidden=!h; if(ED.on&&!h)ED.toggle(); if(!ED.on&&!SP.hidden)SP.hidden=true; if(helper&&ED.sel){ if(ED.sel.gone||!ED.sel.obj.parent)select(null); else helper.update(); }
    if(hover&&(hover.un.gone||!hover.un.obj.parent))setHover(null);
    if(ED.on&&PQ.length)for(let i=0;i<2&&PQ.length;i++){ const k=PQ.shift(); if(!PICS[k])try{ drawPic(k); }catch(err){ PICS[k]=''; } } },'150d-roomedit');
  /* ---------- putting something on a surface: double-click a table, a shelf, a counter; choose from your pack (or buy a small thing); a top-down view of it, click where it goes ---------- */
  const SP=document.createElement('div'); SP.id='surfp'; SP.hidden=true; document.body.appendChild(SP);
  { const css=document.createElement('style'); css.textContent=`#surfp{position:fixed;left:50%;top:8%;transform:translateX(-50%);width:min(760px,94vw);max-height:84vh;overflow:auto;z-index:22;background:#17191f;border:2px solid var(--line);font:12px var(--pixel);color:#ece6d6;padding:10px 12px} #surfp h3{margin:0 0 8px;color:var(--key);font:inherit} #surfp .btn{font:inherit;color:var(--fg);background:#0e1016;border:2px solid #3a3f4e;padding:4px 7px;cursor:pointer} #surfp .btn.on{border-color:var(--key);color:var(--key)} #surfp .x{float:right}
    #surfp .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:10px;margin-top:8px} #surfp .card{border:2px solid transparent;background:none;cursor:pointer;padding:0;text-align:left;font:inherit;color:inherit} #surfp .card:hover{border-color:var(--key)} #surfp .card img,#surfp .card i{display:block;width:100%;aspect-ratio:1/1;background:#eceae4;object-fit:contain;image-rendering:pixelated} #surfp .card span{display:block;font-size:10px;margin:4px 3px 0} #surfp .card em{display:block;font-style:normal;color:var(--key);font-size:10px;margin:2px 3px}
    #surfp canvas{display:block;margin:8px auto;max-width:100%;cursor:crosshair;border:2px solid #3a3f4e;background:#000} #surfp .dim{color:#8f95a3}`; document.head.appendChild(css); }
  const SURF={un:null,lv:0,pick:null};
  // a piece's flat tops in room metres: its solid's tops and its shelves, the ones a thing could stand on
  const tops=un=>{ '@later'; const A=A_(), t=A.getT(un), c=Math.cos(t.ry||0), sn=Math.sin(t.ry||0), s=t.s||1, xf=(x,z)=>[t.u+(x*c+z*sn)*s,t.v+(-x*sn+z*c)*s], out=[];
    const rect=(r,h)=>{ const P=[xf(r[0],r[1]),xf(r[2],r[1]),xf(r[0],r[3]),xf(r[2],r[3])]; return {u0:Math.min(...P.map(q=>q[0])),v0:Math.min(...P.map(q=>q[1])),u1:Math.max(...P.map(q=>q[0])),v1:Math.max(...P.map(q=>q[1])),h}; };
    for(const r of un.sol||[]){ const h=t.h+r[4]*s; if(h>.15&&h<2.3&&(r[2]-r[0])*s>.12&&(r[3]-r[1])*s>.12)out.push({...rect(r,h),name:'THE TOP'}); }
    (un.shf||[]).forEach((r,i)=>{ const h=t.h+r[5]*s; if(h>.05&&h<2.4)out.push({...rect(r,h),name:'SHELF '+(i+1)}); });
    out.sort((a,b)=>b.h-a.h); const seen=new Set(); return out.filter(q=>{ const k=q.h.toFixed(2); if(seen.has(k))return false; seen.add(k); return true; }); };
  // a thing from your pack as a piece for your rooms: its own model, about a hand or two in size; placing it uses it up, putting it away gives it back
  const packKind=(A,id)=>{ const k='pack:'+id, R=A.R; if(R.kinds[k])return k; const NM=(FORAGE.NM&&FORAGE.NM[id])||id, D={kind:k,name:String(NM).toUpperCase(),loose:true,m:.4,wire:null,sol:[],shf:[],own:id,dept:'yours',deptName:'YOURS'};
    Object.defineProperty(D,'tpl',{configurable:true,enumerable:true,get(){ const g=new THREE.Group(); let o=null; try{ o=INSPECT.model(id); }catch(e){} if(o){ const B=new THREE.Box3().setFromObject(o), sz=B.getSize(new THREE.Vector3()), k2=.26/Math.max(.01,sz.x,sz.y,sz.z);
        o.scale.multiplyScalar(k2); const B2=new THREE.Box3().setFromObject(o), c=B2.getCenter(new THREE.Vector3()); o.position.sub(new THREE.Vector3(c.x,B2.min.y,c.z)); o.traverse(q=>{ if(q.isMesh){ q.castShadow=q.receiveShadow=true; } }); g.add(o); }
      Object.defineProperty(D,'tpl',{value:g,enumerable:true}); return g; }});
    R.kinds[k]=D; return k; };
  ROOMK.keep.push({ out:()=>{}, in:(L,A)=>{ for(const a of (L&&L.added)||[])if(String(a.kind).startsWith('pack:'))packKind(A,a.kind.slice(5)); } });
  const packList=()=>Object.entries(INV.items||{}).filter(([id,n])=>n>0&&!/^\$/.test(id)).map(([id,n])=>({id,n,name:String((FORAGE.NM&&FORAGE.NM[id])||id).toUpperCase()})).sort((a,b)=>a.name<b.name?-1:1);
  const packPic=id=>{ try{ const c=BAG.pic&&BAG.pic(id); return c?c.toDataURL():''; }catch(e){ return ''; } };
  const drawSurf=()=>{ '@later'; const A=A_(), un=SURF.un; if(!A||!un){ SP.hidden=true; return; } const T=tops(un); if(!T.length){ SP.hidden=true; return; } const L=T[Math.min(SURF.lv,T.length-1)];
    let h=`<button class="btn x" data-a="close">CLOSE</button><h3>PUT SOMETHING ON THE ${un.name}</h3>`;
    if(T.length>1)h+=`<div>${T.map((q,i)=>`<button class="btn ${i===SURF.lv?'on':''}" data-lv="${i}">${q.name}</button>`).join(' ')}</div>`;
    if(!SURF.pick){ const P=packList(), K=A.kinds(), small=forSale(A).filter(k=>K[k].loose&&!K[k].own).slice(0,60);
      h+=`<div class="dim" style="margin-top:6px">FROM YOUR PACK</div><div class="grid">${P.length?P.map(p=>`<button class="card" data-pk="${p.id}">${packPic(p.id)?`<img alt="" src="${packPic(p.id)}">`:'<i></i>'}<span>${p.name}</span><em>x${p.n}</em></button>`).join(''):'<span class="dim">YOUR PACK IS EMPTY</span>'}</div>`;
      h+=`<div class="dim" style="margin-top:12px">OR BUY A SMALL THING</div><div class="grid">${small.map(k=>{ if(!PICS[k]&&!PQ.includes(k))PQ.push(k); return `<button class="card" data-buy="${k}">${PICS[k]?`<img alt="" src="${PICS[k]}">`:'<i></i>'}<span>${K[k].name}</span><em>$${price(k)}</em></button>`; }).join('')}</div>`; SP.innerHTML=h; return; }
    h+=`<div class="dim" style="margin-top:6px">CLICK WHERE ON ${L.name} THE ${SURF.pick.name} GOES · <button class="btn" data-a="back">CHOOSE SOMETHING ELSE</button></div><canvas width="480" height="480"></canvas>`; SP.innerHTML=h; topView(L,SP.querySelector('canvas')); };
  // the surface from straight above, drawn by the game itself; a click on it maps back to the room through the corners' own projections
  const TVC=new THREE.OrthographicCamera(-1,1,1,-1,.01,100); let tvRT=null, tvBuf=null;
  const topView=(L,cv)=>{ '@later'; const A=A_(), N=480, pad=.12, cu=(L.u0+L.u1)/2, cvv=(L.v0+L.v1)/2, half=Math.max(L.u1-L.u0,L.v1-L.v0)/2+pad, c=A.W(cu,L.h,cvv), M_=A.M||1;
    TVC.left=TVC.bottom=-half*M_; TVC.right=TVC.top=half*M_; TVC.near=.01; TVC.far=4*M_; TVC.position.set(c.x,c.y+2.5*M_,c.z); const vz=A.W(cu,L.h,cvv-1).sub(c).normalize(); TVC.up.copy(vz); TVC.lookAt(c); TVC.updateProjectionMatrix(); TVC.updateMatrixWorld();
    if(!tvRT){ tvRT=new THREE.WebGLRenderTarget(N,N); tvBuf=new Uint8Array(N*N*4); } const prev=renderer.getRenderTarget(), pc=renderer.localClippingEnabled;
    try{ renderer.localClippingEnabled=false; renderer.setRenderTarget(tvRT); renderer.clear(); renderer.render(scene,TVC); renderer.readRenderTargetPixels(tvRT,0,0,N,N,tvBuf); } finally{ renderer.setRenderTarget(prev); renderer.localClippingEnabled=pc; }
    const g=cv.getContext('2d'), im=g.createImageData(N,N), gam=v=>Math.round(255*Math.pow(v/255,1/2.2)); for(let y=0;y<N;y++)for(let x=0;x<N;x++){ const s2=((N-1-y)*N+x)*4, d=(y*N+x)*4; im.data[d]=gam(tvBuf[s2]); im.data[d+1]=gam(tvBuf[s2+1]); im.data[d+2]=gam(tvBuf[s2+2]); im.data[d+3]=255; } g.putImageData(im,0,0);
    const P=(u,v)=>{ const p=A.W(u,L.h,v).project(TVC); return [(p.x+1)/2*N,(1-p.y)/2*N]; }, a=P(L.u0,L.v0), b=P(L.u1,L.v0), d=P(L.u0,L.v1);
    g.strokeStyle='#f2c14e'; g.lineWidth=2; g.setLineDash([6,4]); g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.lineTo(b[0]+d[0]-a[0],b[1]+d[1]-a[1]); g.lineTo(...d); g.closePath(); g.stroke();
    cv.onclick=e=>{ const r=cv.getBoundingClientRect(), x=(e.clientX-r.left)/r.width*N, y=(e.clientY-r.top)/r.height*N, ex=[b[0]-a[0],b[1]-a[1]], ey=[d[0]-a[0],d[1]-a[1]], q=[x-a[0],y-a[1]], det=ex[0]*ey[1]-ex[1]*ey[0]; if(Math.abs(det)<1e-6)return;
      const s_=(q[0]*ey[1]-q[1]*ey[0])/det, t_=(ex[0]*q[1]-ex[1]*q[0])/det; if(s_<0||s_>1||t_<0||t_>1){ say('ON THE '+un_name()+', PLEASE'); return; } placeOn(L.u0+s_*(L.u1-L.u0),L.v0+t_*(L.v1-L.v0),L.h); }; };
  const un_name=()=>SURF.un?SURF.un.name:'';
  const placeOn=(u,v,h)=>{ '@later'; const A=A_(), P=SURF.pick; if(!A||!P)return; let un=null;
    if(P.pack){ const k=packKind(A,P.pack); if(!FORAGE.has(P.pack)){ say('NONE LEFT IN YOUR PACK'); return; } FORAGE.take(P.pack,1); un=add(k,{u,v,h:h+.01,ry:0,s:1},0); if(!un){ FORAGE.give(P.pack,1); return; } }
    else { const p=price(P.buy); if(cash()<p){ say('NOT ENOUGH MONEY: $'+p); return; } INV.cash-=p; un=add(P.buy,{u,v,h:h+.01,ry:0,s:1},p); if(!un){ INV.cash+=p; return; } }
    A.setT(un,{...A.getT(un),u,v,h:h+.01}); select(un); say('ON THE '+un_name()+': THE '+un.name); SURF.pick=null; SP.hidden=true; drawBuy(); };
  SURF.open=un=>{ if(!tops(un).length){ say('NOTHING STANDS ON THE '+un.name); return; } SURF.un=un; SURF.lv=0; SURF.pick=null; SP.hidden=false; drawSurf(); };
  SP.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b)return; const A=A_(); if(b.dataset.a==='close'){ SP.hidden=true; return; } if(b.dataset.a==='back'){ SURF.pick=null; return drawSurf(); }
    if(b.dataset.lv!=null){ SURF.lv=+b.dataset.lv; return drawSurf(); } if(b.dataset.pk){ SURF.pick={pack:b.dataset.pk,name:String((FORAGE.NM&&FORAGE.NM[b.dataset.pk])||b.dataset.pk).toUpperCase()}; return drawSurf(); }
    if(b.dataset.buy&&A){ SURF.pick={buy:b.dataset.buy,name:A.kinds()[b.dataset.buy].name}; return drawSurf(); } });
  addEventListener('dblclick',e=>{ if(!ED.on||e.target!==renderer.domElement||ED.carry)return; const h=pick(e); if(!h||h.un.loose)return; e.stopImmediatePropagation(); e.preventDefault(); if(drag)finish(); SURF.open(h.un); },true);
  window.ROOMEDDBG=()=>{ '@later'; const A=A_(); return {on:ED.on,sel:ED.sel&&ED.sel.id,undo:ED.undo.length,saved:HOME.saved||0,layout:!!HOME.layout,units:A?A.units().length:0,gone:A?A.units().filter(u=>u.gone).length:0,added:A?A.units().filter(u=>u.added).length:0,wall:A&&A.R.wall,floor:A&&A.R.floor,kfloor:A&&A.R.kfloorK,
    carry:!!ED.carry,grid:ED.grid,cash:cash(),pics:Object.keys(PICS).filter(k=>PICS[k]).length,fp:fpG.visible?fpG.children.filter(m=>m.visible).map(m=>m.material===FPM.ok?'ok':'no'):[],said:ED.said||''}; };
  ED._api=A_; ED.HOME=HOME; ED.snapshot=()=>A_()&&snapshot(A_()); ED.apply=L=>apply(A_(),L); ED.add=add; ED.select=select; ED.putAway=putAway; ED.turn=turn; ED.size=size; ED.fits=(un,t)=>fits(un,t||A_().getT(un)); ED.sortOf=sortOf; ED.price=price; ED.sell=()=>sell(); ED.place=()=>placeCarry(); ED.surf=SURF; ED.tops=un=>tops(un); ED.placeOn=placeOn; ED.packKind=id=>packKind(A_(),id);
}
