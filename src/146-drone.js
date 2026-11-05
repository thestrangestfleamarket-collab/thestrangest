// THE DRONE & BBS: double-click the computer in your apartment to dial into THE MARKET BBS (an old C64-style terminal, full screen); order bodega essentials or apartment furniture, watch the delivery on DRONE VIEW, and a drone drops the parcel on your front fire escape — you bring it in (furniture places itself).
import {SHARED, THREE} from './003-shx.js';
import {DRONE, FORAGE, INV, keys, UI} from './003b-systems.js';
import {scene} from './004-main.js';
import {OWNED} from './005-save.js';
import {MODS, STORE, SYS, TILE} from './006-map-pre.js';
import {CAT_INFO} from './014-gamekit.js';

const ballGeo=(o={})=>{ const R=o.R||.15, P=[], N=[], C=[], c=new THREE.Color(), add=(g,h)=>{ if(g.index)g=g.toNonIndexed(); P.push(...g.attributes.position.array); N.push(...g.attributes.normal.array); c.setHex(h); for(let i=0;i<g.attributes.position.count;i++)C.push(c.r,c.g,c.b); };
  add(new THREE.IcosahedronGeometry(R,1),o.body??0xb8bec8); add(new THREE.CylinderGeometry(R*1.02,R*1.02,R*.22,10),o.band??0x3a3e48);
  for(const [w,h,d,k,x,y,z] of o.more||[])add(new THREE.BoxGeometry(w,h,d).translate(x,y,z),k);
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(C,3)); return g; };
let DGEO=null; const VCM=new THREE.MeshLambertMaterial({vertexColors:true});
DRONE.ballGeo=ballGeo;
DRONE.mk=(o={})=>{ const R=.15, D=new THREE.Group(); D.add(new THREE.Mesh(DGEO||(DGEO=ballGeo()),VCM));
  const lens=new THREE.Mesh(new THREE.BoxGeometry(R*.5,R*.3,R*.2),new THREE.MeshBasicMaterial({color:o.lens??0xff3a3a})); lens.position.set(0,-R*.36,R*.86); D.add(lens);
  const parcel=new THREE.Mesh(new THREE.BoxGeometry(.2,.15,.2),new THREE.MeshLambertMaterial({color:0xa77a48})); parcel.position.set(0,-R-.085,0); D.add(parcel); parcel.visible=o.parcel!==false;
  D.scale.setScalar(o.s??TILE/1.13); return {D,parcel,lens}; };

DRONE.init=()=>{ const APTS=MODS.apts; if(!APTS||!APTS.R)return; const T=TILE, X=SHARED.BOD.X, Y=SHARED.BOD.Y, Z=SHARED.BOD.Z, AR=APTS.R, K=SHARED.BOD.K;
  const lam=c=>new THREE.MeshLambertMaterial({color:c}), flat=c=>new THREE.MeshBasicMaterial({color:c}), bx=(w,h,d,m)=>new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);

  const BODEGA=[['CAT FOOD',1,'g_catfood'],['FISH FOOD',3,'g_fishfood'],['SPRAY PAINT, SILVER',6,'spray_silver'],['SPRAY PAINT, GOLD',14,'spray_gold']];
  const FURN=['armchair','floor lamp','bookcase','coffee table','plant pot','fiddle-leaf fig','patterned rug','desk lamp','poster','radio']
    .filter(k=>K.CATALOG[k]).map(k=>{ const i=CAT_INFO[k]||{}; return [k,(i.name||k.replace(/\b\w/g,c=>c.toUpperCase())),(i.price||20)]; });

  const FKEY='apt-furn', ownedFurn=()=>{ try{ return JSON.parse(OWNED.get(FKEY)||'[]'); }catch(e){ return []; } }, saveFurn=l=>{ try{ OWNED.set(FKEY,JSON.stringify(l)); }catch(e){} };
  const SLOTS=[[5.2,4],[6.8,4.3],[8.3,4.3],[5.2,5.4],[6.8,5.6],[8.3,5.6],[9.6,4.3],[4.2,4.6]];
  const placeFurn=(kind,u,v,r)=>APTS.furnish(APTS.my,()=>{ if(MODS.apts.put)MODS.apts.put(kind,AR.x0+u,AR.y0+v,r||0); });
  for(const f of ownedFurn())placeFurn(f.kind,f.u,f.v,f.r);
  const bringFurn=kind=>{ const l=ownedFurn(), [u,v]=SLOTS[l.length%SLOTS.length]; l.push({kind,u,v,r:0}); saveFurn(l); placeFurn(kind,u,v,0); };

  const mkDrone=()=>DRONE.mk();
  const dropPoint=()=>{ const F=window.FIREV; return F&&F.spot?F.spot(.5):null; };

  const flights=[], parcels=[]; const V=new THREE.Vector3();
  const landParcel=(label,onIn,dp)=>{ const p=bx(.32*T,.24*T,.32*T,lam(0xc89a5a)); p.position.set(dp.x+(Math.random()-.5)*.5*T,dp.y+.12*T,dp.z); scene.add(p); parcels.push(p);
    const th={name:'A PARCEL: '+label,pick:true,obj:p,reach:1.3*T,near:2.6*T,tall:.7*T,act:()=>{ if(!p.parent)return; scene.remove(p); const i=parcels.indexOf(p); if(i>=0)parcels.splice(i,1); onIn(); toast('YOU BRING IN: '+label); }};
    UI.thing(th); toast('THE DRONE DROPPED '+label+' ON YOUR FIRE ESCAPE'); };
  const deliver=(label,onIn)=>{ '@later'; const dp=dropPoint(); if(!dp){ onIn(); toast('DELIVERED: '+label); return; }
    const {D,parcel}=mkDrone(); scene.add(D); D.position.set(dp.x,dp.y+8*T,dp.z-6*T); DRONE.state='out'; flights.push({D,parcel,label,onIn,dp,ph:'in'}); };
  DRONE.go=deliver;
  SYS.add('life',dt=>{ if(!dt)return;
    for(const f of flights){
      if(f.ph==='in'){ V.set(f.dp.x,f.dp.y+1.4*T,f.dp.z); f.D.position.lerp(V,Math.min(1,dt*2.2)); if(f.D.position.distanceTo(V)<.18*T)f.ph='drop'; }
      else if(f.ph==='drop'){ f.parcel.visible=false; landParcel(f.label,f.onIn,f.dp); f.away=new THREE.Vector3(f.dp.x,f.dp.y+9*T,f.dp.z-7*T); f.ph='away'; }
      else if(f.ph==='away'){ f.D.position.lerp(f.away,Math.min(1,dt*2)); if(f.D.position.distanceTo(f.away)<.4*T){ scene.remove(f.D); f.done=true; } } }
    for(let i=flights.length-1;i>=0;i--)if(flights[i].done)flights.splice(i,1); if(!flights.length&&DRONE.state!=='home')DRONE.state='home'; },'146-drone');

  const purse={get:()=>INV.cash,add:v=>{ INV.cash+=v; }}; DRONE.purse=purse;
  const toast=msg=>{ '@later'; let el=document.getElementById('dtoast'); if(!el){ el=document.createElement('div'); el.id='dtoast'; el.style.cssText='position:fixed;left:50%;bottom:64px;transform:translateX(-50%);font:12px var(--pixel,monospace);color:#e8f4dc;background:#14161a;border:2px solid #3a4a3a;padding:6px 10px;z-index:15;pointer-events:none'; document.body.appendChild(el); } el.textContent=msg; el.hidden=false; clearTimeout(el.t); el.t=setTimeout(()=>{ el.hidden=true; },3600); };

  // ============ THE BBS: the computer's screen, an 8-bit terminal (owner, 30 Oct 2026: "add the computer back and bbs system") ============
  // the screen is 40 x 18 cells, each a letter on one of the C64's 16 colours; the letters a 5 x 7 bitmap font (BITF), the box lines drawn as pixels
  const C64=['#000000','#ffffff','#68372b','#70a4b2','#6f3d86','#588d43','#352879','#b8c76f','#6f4f25','#433900','#9a6759','#444444','#6c6c6c','#9ad284','#6c5eb5','#959595'];
  const SCOLS=40, SROWS=18;
  const scrNew=()=>{ const c=[]; for(let i=0;i<SCOLS*SROWS;i++)c.push({ch:' ',fg:14,bg:6}); const s={c,
    clear(){ for(const k of c){ k.ch=' '; k.fg=14; k.bg=6; } },
    put(x,y,str,fg=14,bg=6){ for(const ch of String(str)){ if(x>=0&&x<SCOLS&&y>=0&&y<SROWS){ const k=c[y*SCOLS+x]; k.ch=ch; k.fg=fg; if(bg!==null)k.bg=bg; } x++; } },
    fill(x,y,w,h,ch,fg,bg=6){ for(let j=y;j<y+h;j++)s.put(x,j,ch.repeat(w),fg,bg); },
    box(x,y,w,h,fg,bg=6,title=null,tfg=1){ const [tl,tr,bl,br,hz,vt]='╔╗╚╝═║';
      s.put(x,y,tl+hz.repeat(w-2)+tr,fg,bg); for(let j=1;j<h-1;j++){ s.put(x,y+j,vt,fg,bg); s.put(x+1,y+j,' '.repeat(w-2),fg,bg); s.put(x+w-1,y+j,vt,fg,bg); }
      s.put(x,y+h-1,bl+hz.repeat(w-2)+br,fg,bg); if(title){ s.put(x+2,y,'[',fg,bg); s.put(x+3,y,title,tfg,bg); s.put(x+3+title.length,y,']',fg,bg); } } };
    return s; };
  const BBSF={T:['11111','..1..','..1..','..1..','..1..','..1..','..1..','..1..'],S:['.1111','1....','1....','.111.','....1','....1','....1','1111.'],
    F:['11111','1....','1....','1111.','1....','1....','1....','1....'],M:['1...1','11.11','1.1.1','1.1.1','1...1','1...1','1...1','1...1'],B:['1111.','1...1','1...1','1111.','1...1','1...1','1...1','1111.'],' ':['..','..','..','..','..','..','..','..']};
  const bbsLogo=(s,word,x,y,cols)=>{ for(const L of word){ const g=BBSF[L], w=g[0].length;
    for(let r=0;r<4;r++)for(let i=0;i<w;i++){ const u=g[r*2][i]==='1', d=g[r*2+1][i]==='1', ch=u&&d?'█':u?'▀':d?'▄':' '; if(ch!==' ')s.put(x+i,y+r,ch,cols[r],null); } x+=w+1; } };
  const BITF=(()=>{ const o={}, d={A:'0E1111111F1111',B:'1E11111E11111E',C:'0E11101010110E',D:'1C12111111121C',E:'1F10101E10101F',F:'1F10101E101010',G:'0E11101711110F',H:'1111111F111111',I:'0E04040404040E',J:'0702020202120C',K:'11121418141211',L:'1010101010101F',
    M:'111B1515111111',N:'11111915131111',O:'0E11111111110E',P:'1E11111E101010',Q:'0E11111115120D',R:'1E11111E141211',S:'0F10100E01011E',T:'1F040404040404',U:'1111111111110E',V:'1111111111 0A04',W:'1111111515150A',X:'11110A040A1111',Y:'1111110A040404',Z:'1F01020408101F',
    0:'0E111315191 10E',1:'040C040404040E',2:'0E110102040 81F',3:'1F020402011 10E',4:'02060A121F0202',5:'1F101E0101110E',6:'0608101E11110E',7:'1F010204080808',8:'0E11110E11110E',9:'0E11110F01020C',
    '.':'0000000000 0C0C',',':'00000000 0C0408',':':'000C0C000C0C00',';':'000C0C000C0408','!':'04040404040004','?':'0E110102040004',"'":'0C040800000000','"':'0A0A0A00000000','-':'0000001F000000','+':'0004041F040400',
    '=':'00001F001F0000','/':'00010204081000','(':'02040808080402',')':'08040202020408','*':'0004150E150400','#':'0A0A1F0A1F0A0A','@':'0E11010D15150E','<':'02040810080402','>':'08040201020408','$':'040F140E051E04',
    '%':'18190204081303','&':'0C121408151 20D','_':'0000000000001F','[':'0E08080808080E',']':'0E02020202020E','◈':'040E1B111B0E04','←':'0004081F080400','·':'0000000C0C0000'};
    for(const [k,v] of Object.entries(d)){ const h=v.replace(/ /g,''); o[k]=[0,1,2,3,4,5,6].map(r=>parseInt(h.slice(r*2,r*2+2),16)); } return o; })();

  const COMP={on:false,box:null,cv:null,g:null,scr:null,page:'boot',t0:0,sel:0,list:'shop',orders:[]};
  const BOOT=['    **** TSFM 64 BASIC V2 ****',' 64K RAM  38911 BASIC BYTES FREE','','READY.','LOAD"TERM",8,1','','SEARCHING FOR TERM','LOADING','READY.','RUN','','TERM 64  ATDT 555-0199','RINGING...','CONNECT 1200'];
  const aptNum=()=>APTS.num||'--', flightState=()=>{ const f=flights[0]; if(!f)return 'done'; return f.ph; };
  const hdr=s=>{ s.fill(0,0,SCOLS,1,' ',6,14); s.put(1,0,'TSFM BBS',6,14); s.put(SCOLS-12,0,'NODE 1 1200',6,14); s.put(1,SROWS-1,'YOU HAVE $'+purse.get(),7); s.put(SCOLS-11,SROWS-1,'ESC: STAND',12); };
  const bbsDraw=()=>{ '@later'; const s=COMP.scr, t=(performance.now()-COMP.t0)/1000, blink=Math.floor(t*2)%2; s.clear();
    if(COMP.page==='boot'){ const n=Math.floor(t/.26); for(let i=0;i<Math.min(n,BOOT.length);i++)s.put(0,i,BOOT[i],BOOT[i]==='CONNECT 1200'?13:14);
      if(n<BOOT.length&&Math.floor(t*3)%2)s.put(0,Math.min(n,BOOT.length-1),'█',14); if(t>BOOT.length*.26+1){ COMP.page='logo'; COMP.t0=performance.now(); } return; }
    hdr(s);
    if(COMP.page==='logo'){ bbsLogo(s,'TSFM',3,2,[10,8,7,13]); bbsLogo(s,'BBS',8,7,[3,14,14,1]); s.put(2,12,'THE STRANGEST FLEA MARKET',3); s.put(2,13,'WELCOME, TENANT · APT '+aptNum(),1); if(blink)s.put(2,15,'PRESS ANY KEY',7); return; }
    if(COMP.page==='menu'){ s.box(2,2,32,15,3,6,'MAIN MENU'); MENU.forEach(([k,n],i)=>{ const on=i===COMP.msel; s.fill(4,4+i*2,28,1,' ',1,on?14:6); s.put(5,4+i*2,k,on?6:7,on?14:6); s.put(7,4+i*2,n,on?6:1,on?14:6); }); s.put(4,17,'COMMAND? '+(blink?'█':' '),14); return; }
    if(COMP.page==='games'){ s.box(1,2,38,15,3,6,'THE ARCADE · MAIN ST'); if(!COMP.arc){ s.put(3,8,'LOADING THE ARCADE'+(blink?'...':'   '),14); return; } const K=STORE.cabs.kit(), L=CABS();
      L.forEach((n,i)=>{ const y=3+i, on=i===COMP.sel, e=STORE.cabs.reg[n], t=K.top(n)[0]; s.fill(2,y,36,1,' ',1,on?14:6); s.put(3,y,((i+1)%10)+' '+n,on?6:1,on?14:6); s.put(21,y,e.game?(t?'HI '+t.score+' '+t.ini:'HI ---'):'COMING SOON',on?6:e.game?7:3,on?14:6); });
      s.put(3,3+L.length+1,'1-'+(L.length%10)+' PICK  RETURN PLAY ($2)  M MENU',3); return; }
    if(COMP.page==='shop'||COMP.page==='furn'){ const furn=COMP.page==='furn', L=furn?FURN:BODEGA; s.box(1,2,38,14,8,6,furn?'CATALOG · FURNITURE':'THE BODEGA · THE FOX');
      L.forEach((it,i)=>{ const y=3+i, on=i===COMP.sel, nm=furn?it[1]:it[0], price=furn?it[2]:it[1]; s.fill(2,y,36,1,' ',1,on?14:6); s.put(3,y,((i+1)%10)+' '+nm.toUpperCase(),on?6:1,on?14:6); s.put(32,y,'$'+price,on?6:7,on?14:6); });
      s.put(3,3+L.length+1,'1-0 PICK  RETURN BUY   M MENU',3); return; }
    if(COMP.page==='confirm'){ const furn=COMP.list==='furn', it=(furn?FURN:BODEGA)[COMP.sel], nm=furn?it[1]:it[0], price=furn?it[2]:it[1]; s.box(3,4,34,9,7,6,'ORDER');
      s.put(5,6,'BUY '+nm.toUpperCase(),1); s.put(5,7,'FOR $'+price+'?',1); s.put(5,9,'A DRONE BRINGS IT TO YOUR',3); s.put(5,10,'FIRE ESCAPE.',3); s.put(5,11,'Y YES   N NO',7); return; }
    if(COMP.page==='poor'){ s.box(3,5,34,5,10,6,'ORDER'); s.put(5,7,'NOT ENOUGH MONEY.',1); s.put(5,8,'M MENU',7); return; }
    if(COMP.page==='busy'){ s.box(3,5,34,5,10,6,'ORDER'); s.put(5,7,'THE DRONE IS OUT. WAIT',1); s.put(5,8,'FOR IT TO COME BACK.  M MENU',1); return; }
    if(COMP.page==='ordered'||COMP.page==='orders'){ const o=COMP.orders[COMP.orders.length-1]; s.box(1,2,38,14,13,6,COMP.page==='ordered'?'ORDER PLACED':'YOUR ORDERS');
      if(!o){ s.put(3,4,'NO ORDERS YET.',14); s.put(3,14,'M MENU',7); return; }
      const ph=flightState(), msg=ph==='in'?'THE DRONE IS ON ITS WAY':ph==='drop'?'AT YOUR FIRE ESCAPE':ph==='away'?'THE DRONE IS HEADING BACK':'DELIVERED';
      s.put(3,4,'#'+o.no+' '+o.name.toUpperCase(),1); s.put(3,6,'FROM: THE BODEGA (THE FOX)',14); s.put(3,7,'TO:   YOUR FIRE ESCAPE, APT '+aptNum(),14); s.put(3,9,msg,ph==='done'?13:7);
      if(flights.length){ s.fill(3,11,16,1,' ',6,blink?7:1); s.put(4,11,'D  DRONE VIEW',6,null); } s.put(3,14,'M MENU',7); return; }
    if(COMP.page==='news'){ s.box(1,2,38,14,3,6,'NEWS'); ['THE BLOCK GREW: MORE ROOM','FOR EVERYONE.','','THE BODEGA DELIVERS BY','DRONE TO YOUR FIRE ESCAPE.','','FEED YOUR FISH.','THEY NOTICE.'].forEach((l,i)=>s.put(3,4+i,l,i<2?1:14)); s.put(3,14,'M MENU',7); return; }
    if(COMP.page==='droneview'){ s.clear(); for(const k of s.c){ k.bg=0; k.fg=5; } const f=flights[0];
      for(let y=2;y<16;y++)for(let x=1;x<39;x++)if((x+y)%2===0)s.put(x,y,'·',5,0);
      const alt=f?Math.max(0,Math.round((f.D.position.y-f.dp.y)/T)):0;
      s.put(1,0,(blink?'● ':'  ')+'REC  DRONE CAM 01',10,0); s.put(SCOLS-9,0,'ALT '+alt+'M',13,0);
      if(f){ const py=f.ph==='in'?6:f.ph==='drop'?9:12; s.put(19,py,'▄▄',8,0); s.put(19,py+1,'██',8,0); s.put(18,py,'[',1,0); s.put(21,py,']',1,0); s.put(19,py-2,'│',13,0); s.put(15,py,'──',13,0); s.put(23,py,'──',13,0); s.put(1,SROWS-1,'TARGET: FIRE ESCAPE '+aptNum(),13,0); }
      else{ s.put(14,8,'SIGNAL LOST',10,0); s.put(15,10,'DELIVERED',13,0); s.put(1,SROWS-1,'DELIVERED',13,0); }
      s.put(SCOLS-9,SROWS-1,'ESC BACK',12,0); return; }
    if(COMP.page==='bye'){ s.clear(); s.put(0,1,'NO CARRIER',14); s.put(0,3,'READY.',14); if(t>1.3)bbsClose(); } };
  const scrPaint=()=>{ '@later'; const g=COMP.g, s=COMP.scr; for(let y=0;y<SROWS;y++)for(let x=0;x<SCOLS;x++){ const k=s.c[y*SCOLS+x], X=x*8, Y=y*8; g.fillStyle=C64[k.bg]; g.fillRect(X,Y,8,8); if(k.ch===' ')continue; g.fillStyle=C64[k.fg]; const c=k.ch;
    if(c==='█')g.fillRect(X,Y,8,8); else if(c==='▀')g.fillRect(X,Y,8,4); else if(c==='▄')g.fillRect(X,Y+4,8,4);
    else if(c==='─')g.fillRect(X,Y+3,8,2); else if(c==='═'){ g.fillRect(X,Y+2,8,1); g.fillRect(X,Y+5,8,1); }
    else if(c==='│')g.fillRect(X+3,Y,2,8); else if(c==='║'){ g.fillRect(X+2,Y,1,8); g.fillRect(X+5,Y,1,8); }
    else if('┌┐└┘╔╗╚╝'.includes(c)){ const r='┐┘╗╝'.includes(c), dn='┌┐╔╗'.includes(c); g.fillRect(r?X:X+3,Y+3,5,2); g.fillRect(X+3,dn?Y+3:Y,2,5); }
    else{ const b=BITF[c.toUpperCase()]||BITF['?']; for(let r=0;r<7;r++){ const v=b[r]; for(let q=0;q<5;q++)if(v&(16>>q))g.fillRect(X+1+q,Y+r,1,1); } } } };
  const doOrder=()=>{ const furn=COMP.list==='furn', it=(furn?FURN:BODEGA)[COMP.sel]; if(!it)return; const label=furn?it[1]:it[0], price=furn?it[2]:it[1], kind=furn?it[0]:null;
    if(DRONE.state!=='home'){ COMP.page='busy'; return; } if(purse.get()<price){ COMP.page='poor'; return; }
    purse.add(-price); COMP.orders.push({no:1001+COMP.orders.length,name:label}); deliver(label,furn?()=>bringFurn(kind):()=>{ const b=BODEGA.find(q=>q[0]===label); if(b&&b[2]&&FORAGE.give){ FORAGE.give(b[2],1); if(FORAGE.draw)FORAGE.draw(); } }); COMP.page='ordered'; };
  DRONE.pick=(list,i)=>{ COMP.list=list; COMP.sel=i; doOrder(); };   // (for tests and the key handler: one ordering path)
  const MENU=[['S','THE BODEGA (SHOP)'],['F','CATALOG (FURNITURE)'],['A','THE ARCADE (GAMES)'],['O','YOUR ORDERS'],['N','NEWS'],['G','GOODBYE']], CABS=()=>[...STORE.cabs.walls.e,...STORE.cabs.walls.w].filter(n=>STORE.cabs.reg[n]);
  const bbsKey=e=>{ const k=e.key, K=k.length===1?k.toUpperCase():k, p=COMP.page;
    if(p==='boot'){ COMP.t0-=1e5; return; }
    if(p==='logo'){ COMP.page='menu'; return; }
    if(p==='menu'){ if(k==='ArrowDown'){ COMP.msel=(COMP.msel+1)%MENU.length; return; } if(k==='ArrowUp'){ COMP.msel=(COMP.msel+MENU.length-1)%MENU.length; return; } const M=k==='Enter'?MENU[COMP.msel][0]:K;   // arrows and RETURN too: the pad and the headset have no letter keys
      if(M==='S'){ COMP.page='shop'; COMP.list='shop'; COMP.sel=0; } else if(M==='F'){ COMP.page='furn'; COMP.list='furn'; COMP.sel=0; } else if(M==='A'){ COMP.page='games'; COMP.sel=0; if(!COMP.arc)LOAD('arcade').then(()=>{ COMP.arc=1; }); } else if(M==='O')COMP.page='orders'; else if(M==='N')COMP.page='news'; else if(M==='G'){ COMP.page='bye'; COMP.t0=performance.now(); } return; }
    if(p==='games'){ const L=CABS(); if(!COMP.arc)return; if(K>='0'&&K<='9'){ const i=K==='0'?9:(+K-1); if(i<L.length)COMP.sel=i; } else if(k==='ArrowDown')COMP.sel=(COMP.sel+1)%L.length; else if(k==='ArrowUp')COMP.sel=(COMP.sel+L.length-1)%L.length; else if(k==='Enter'){ const n=L[COMP.sel]; if(STORE.cabs.reg[n].game)STORE.cabs.play(n); } else if(K==='M')COMP.page='menu'; return; }
    if(p==='shop'||p==='furn'){ const L=p==='shop'?BODEGA:FURN; if(K>='0'&&K<='9'){ const i=K==='0'?9:(+K-1); if(i<L.length)COMP.sel=i; } else if(k==='ArrowDown')COMP.sel=(COMP.sel+1)%L.length; else if(k==='ArrowUp')COMP.sel=(COMP.sel+L.length-1)%L.length; else if(k==='Enter'){ COMP.list=p; COMP.page='confirm'; } else if(K==='M')COMP.page='menu'; return; }
    if(p==='confirm'){ if(K==='Y'||k==='Enter')doOrder(); else if(K==='N'||K==='M')COMP.page=COMP.list; return; }
    if(p==='ordered'||p==='orders'){ if(K==='D'&&flights.length)COMP.page='droneview'; else if(K==='M')COMP.page='menu'; return; }
    if(p==='droneview'){ if(K==='M')COMP.page='orders'; return; }
    if(K==='M')COMP.page='menu'; };
  const kd=e=>{ if(!COMP.on||STORE.cabs.on)return; e.stopImmediatePropagation(); e.preventDefault(); if(e.key==='Escape'){ if(COMP.page==='droneview'){ COMP.page='orders'; return; } bbsClose(); return; } if(!e.repeat)bbsKey(e); };
  const ku=e=>{ if(COMP.on&&!STORE.cabs.on){ e.stopImmediatePropagation(); e.preventDefault(); } };
  const blur=()=>{ if(COMP.on)keys.clear(); };
  function bbsClose(){ if(!COMP.on)return; COMP.on=false; UI.gamewin=null; if(COMP.box)COMP.box.remove(); COMP.box=COMP.cv=COMP.g=null; removeEventListener('keydown',kd,true); removeEventListener('keyup',ku,true); removeEventListener('blur',blur); keys.clear(); }
  DRONE.open=()=>{ if(COMP.on)return; const box=document.createElement('div'); box.id='bbswin'; box.style.cssText='position:fixed;inset:0;z-index:40;background:#07080a;display:flex;align-items:center;justify-content:center;user-select:none;touch-action:none';
    const cv=document.createElement('canvas'); cv.width=SCOLS*8; cv.height=SROWS*8; cv.style.cssText='image-rendering:pixelated;width:min(94vw,calc((100vh - 48px)*'+(SCOLS*8)+'/'+(SROWS*8)+'));aspect-ratio:'+(SCOLS*8)+'/'+(SROWS*8)+';border:12px solid #0d0f0d;border-radius:14px;box-shadow:0 0 0 3px #1a3a1a,0 0 60px #2a6a2a66,inset 0 0 40px #000';
    box.appendChild(cv); document.body.appendChild(box); COMP.box=box; COMP.cv=cv; COMP.g=cv.getContext('2d'); if(!COMP.scr)COMP.scr=scrNew();
    COMP.page='boot'; COMP.t0=performance.now(); COMP.sel=0; COMP.msel=0; COMP.on=true; UI.gamewin='bbs'; keys.clear(); addEventListener('keydown',kd,true); addEventListener('keyup',ku,true); addEventListener('blur',blur); };
  DRONE.openAt=pg=>{ DRONE.open(); COMP.page=pg; if(pg==='games'&&!COMP.arc)LOAD('arcade').then(()=>{ COMP.arc=1; }); };   // the handheld's apps: straight to a page, no boot
  DRONE.close=bbsClose;
  SYS.add('places',dt=>{ if(COMP.on){ bbsDraw(); if(COMP.g)scrPaint(); } },'146-bbs');

  const hit=bx(.9*T,1.4*T,.9*T,new THREE.MeshBasicMaterial({visible:false})); hit.position.set(X(AR.x0+6.8),Y((APTS.RB||0)+25),Z(AR.y0+.9)); scene.add(hit);
  UI.thing({name:'THE COMPUTER',ghost:1,obj:hit,reach:1.4*T,near:2.8*T,tall:1.6*T,act:DRONE.open});
  window.DRONEDBG=()=>({state:DRONE.state,flights:flights.length,parcels:parcels.length,owned:ownedFurn().length,cash:purse.get(),furn:FURN.length,on:COMP.on,page:COMP.page,orders:COMP.orders.length,msel:COMP.msel,sel:COMP.sel,arc:!!COMP.arc,games:CABS()}); };
