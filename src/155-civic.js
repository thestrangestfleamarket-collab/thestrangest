// THE CIVIC: CIVIC builds the firehouse, clinic and precinct and keeps the town's staff, ledger and log.
import {SHARED, THREE} from './003-shx.js';
import {BUGS, CITY, CIVIC, CLOCK, FAR3, MAIL, UI} from './003b-systems.js';
import {AWAY, FIX, MAPG, MODS, RING, SOL, TILE, ZU} from './006-map-pre.js';
import {PEEK} from './008-batch.js';
Object.assign(CIVIC,{row:[],staff:{},log:[],ledger:{treasury:500,day:0,tax:10,wage:20,curfew:[23,5]},shops:{},mail:{bag:[],boxes:{}},fires:[],cans:[]}); window.CIVIC=CIVIC;
{ const T=TILE, M=1/.84*T, YS=ZU*24/TILE, G=(x,z)=>MODS.bodega.ground(x,z);
  CIVIC.note=(what,where)=>{ CIVIC.log.unshift({t:CLOCK.h,day:CITY.day,what,where:where||''}); if(CIVIC.log.length>80)CIVIC.log.length=80; };
  const HOUSES=[['firehouse','THE FIREHOUSE',0x9a2b22,0xe8c070],['clinic','THE CLINIC',0xe8e6e0,0xc8302a],['precinct','THE PRECINCT',0x2b3f7a,0x7f9ad8],['post','THE POST OFFICE',0x2f5f9e,0xe8e4d8],['depot','THE DEPOT',0xb86a1e,0x3a2a1a],['hall','CITY HALL',0x8a8478,0xd8c890]];
  const BL=[], blk=(x,y,z,sx,sy,sz,c)=>BL.push([x,y,z,sx,sy,sz,c]), Wd=10*T, D=6*T, FH=3.2*M, NF=HOUSES.length, H=NF*FH, TK=.22*T, STONE=0xb4aea2;
  const cx=SHARED.BOD.XS(125), zf=SHARED.BOD.ZS(RING.top+3), zb=zf+D, y=G(cx,zf-.5*T), dw=1.8*T, pw=(Wd-dw)/2, DH=2.6*M;
  if(AWAY.has('civic')){ const B=SHARED.BOD.B0, bx=SHARED.BOD.X(B.x1)+2*T, bz=SHARED.BOD.Z(B.y1)+2.4*T;
    HOUSES.forEach(([id,name,col],i)=>{ const sx=bx+i*1.1*T; CIVIC.row.push({id,name,x:sx,z:bz,col,floor:i,at:{x:sx,z:bz},door:{x:sx,z:bz},inside:{x:sx,z:bz},kerb:{x:sx,z:SHARED.BOD.ZS(SHARED.BOD.CURB)-.6*T}}); }); }
  else {
  CIVIC.tower={x0:cx-Wd/2,x1:cx+Wd/2,z0:zf,z1:zb,y,H,FH};
  blk(cx-Wd/2+TK/2,y+H/2,zf+D/2,TK,H,D,STONE); blk(cx+Wd/2-TK/2,y+H/2,zf+D/2,TK,H,D,STONE); blk(cx,y+H/2,zb-TK/2,Wd,H,TK,STONE);
  blk(cx-Wd/2+pw/2,y+DH/2,zf+TK/2,pw,DH,TK,STONE); blk(cx+Wd/2-pw/2,y+DH/2,zf+TK/2,pw,DH,TK,STONE); blk(cx,y+(DH+H)/2,zf+TK/2,Wd,H-DH,TK,STONE);
  blk(cx,y+H+.08*M,zf+D/2,Wd+.2*T,.16*M,D+.2*T,0x4a4844); for(const [a,b,sx,sz] of [[0,-D/2,Wd,.14*T],[0,D/2,Wd,.14*T],[-Wd/2,0,.14*T,D],[Wd/2,0,.14*T,D]])blk(cx+a,y+H+.45*M,zf+D/2+b,sx,.6*M,sz,STONE);
  HOUSES.forEach(([id,name,col,sign],i)=>{ '@later'; const fy=y+i*FH;
    blk(cx,fy+FH-.3*M,zf-.03*T,Wd+.04*T,.6*M,.08*T,col); blk(cx,fy+FH-.3*M,zf-.08*T,Wd*.34,.4*M,.04*T,sign);
    if(i>0)for(const k of [-1,0,1])blk(cx+k*Wd*.32,fy+FH*.48,zf-.03*T,Wd*.16,FH*.42,.06*T,0x26303c);
    if(id==='clinic'){ blk(cx,fy+FH-.22*M,zf-.11*T,.12*M,.3*M,.03*T,0xf4f0e8); blk(cx,fy+FH-.22*M,zf-.11*T,.3*M,.12*M,.03*T,0xf4f0e8); }
    const sx=cx+(i-(NF-1)/2)*1.1*T, dz=zf-1.1*T;
    CIVIC.row.push({id,name,x:sx,z:zf,col,floor:i,at:{x:sx,z:zf},door:{x:sx,z:dz},inside:{x:sx,z:zf+D/2},kerb:{x:sx,z:SHARED.BOD.ZS(RING.top)+.6*T}}); });
  blk(cx-Wd*.3,y+H+1.0*M,zb-.6*T,.3*M,.9*M,.3*M,0x6a2a22);
  for(const bx of [[cx-Wd/2,zf,cx-Wd/2+TK,zb],[cx+Wd/2-TK,zf,cx+Wd/2,zb],[cx-Wd/2,zb-TK,cx+Wd/2,zb],[cx-Wd/2,zf,cx-Wd/2+pw,zf+TK],[cx+Wd/2-pw,zf,cx+Wd/2,zf+TK]]){ SOL.up.push(bx); FIX.up.push([bx[0],bx[1],y,bx[2],bx[3],y+H]); }
  FIX.up.push([cx-Wd/2+pw,zf,y+DH,cx+Wd/2-pw,zf+TK,y+H]);
  { const geo=new THREE.BoxGeometry(1,1,1), me=new THREE.InstancedMesh(geo,new THREE.MeshLambertMaterial(),BL.length), m4=new THREE.Matrix4(), q=new THREE.Quaternion(), c=new THREE.Color();
    const AMB=window.FAR3&&FAR3.FU?FAR3.FU.uAmb:{value:.4}; me.material.onBeforeCompile=sh=>{ sh.uniforms.uAmb=AMB; sh.fragmentShader='uniform float uAmb;\n'+sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance+=diffuseColor.rgb*uAmb*.8;'); }; me.material.customProgramCacheKey=()=>'civictower';
    BL.forEach(([x,y,z,sx,sy,sz,col],i)=>{ me.setMatrixAt(i,m4.compose(new THREE.Vector3(x,y,z),q,new THREE.Vector3(sx,sy,sz))); me.setColorAt(i,c.setHex(col)); }); me.castShadow=me.receiveShadow=true; MAPG.bodega.add(me); CIVIC.mesh=me; PEEK.whole(me); CIVIC.tris=BL.length*12; }
  CITY.extra.push({id:'tower',name:'THE CIVIC TOWER',lv:'up',at:{x:cx,z:zf},door:{x:cx,z:zf-.9*T},box:[cx-Wd/2,zf-2*T,cx+Wd/2,zb]});
  }
  for(const h of CIVIC.row)CITY.extra.push({id:h.id,name:h.name,lv:'up',at:h.at,door:h.door});
  CIVIC.house=id=>CIVIC.row.find(h=>h.id===id);
  if(CITY.on){ for(const [id,stock,price,food] of [['bodega',20,4,true],['store:diner',16,7,true],['store:bar',16,6,false],['dojo',12,3,false]])CIVIC.shops[id]={id,stock,price,food,till:0,sold:0,low:false};
  CIVIC.buy=(who,id)=>{ '@later'; const S=CIVIC.shops[id]; if(!S)return false; if(S.stock<=0){ CIVIC.note(who.name+' found the shelves empty',id); return false; } if((who.cash||0)<S.price){ CIVIC.note(who.name+' had no money for '+id,id); return false; }
    S.stock--; S.sold++; S.till+=S.price; who.cash-=S.price; if(S.food&&who.hunger!=null)who.hunger=0; CIVIC.note(who.name+' bought something at '+id+' ($'+S.price+')',id); if(S.stock<8&&!S.low){ S.low=true; CITY.post('restock',id,{shop:id}); CIVIC.note(id+' is low on stock: a delivery asked for',id); } return true; };
  CIVIC.send=(to,from,subject,body)=>{ const L={id:(CIVIC.mail.n=(CIVIC.mail.n||0)+1),to,from,subject,body:body||'',day:CITY.day,t:CLOCK.h,state:'posted'}; CIVIC.mail.bag.push(L); return L; };
  CIVIC.box=to=>CIVIC.mail.boxes[to]||(CIVIC.mail.boxes[to]=[]);
  CITY.at(17,()=>{ let w=0; for(const k in CIVIC.staff)w+=CIVIC.ledger.wage; CIVIC.ledger.treasury-=w; CIVIC.note('the city paid its staff $'+w,'hall'); },'wages');
  CITY.at(18,()=>{ for(const S of Object.values(CIVIC.shops)){ const t=Math.min(S.till,CIVIC.ledger.tax); S.till-=t; CIVIC.ledger.treasury+=t; } CIVIC.note('the shops paid their tax','hall'); },'tax'); }
  CIVIC.free=id=>{ const S=CIVIC.staff[id]; return S&&S.state==='free'; };
  CIVIC.go=(S,to,then,v=2)=>{ S.N.st.hold=false; CITY.send(S.N,to,{v,then}); };
  CIVIC.home=S=>{ S.state='returning'; S.job=null; CIVIC.go(S,S.N.home,()=>{ S.state='free'; S.N.st.hold=true; S.N.st.h=Math.PI; S.N.st.to=null; S.N.st.face=null; },1.4); };
  CIVIC.carry=(S,col)=>{ if(S.item){ S.N.g.remove(S.item); S.item=null; } if(col==null)return; const m=new THREE.Mesh(new THREE.BoxGeometry(.28*T,.22*T,.28*T),new THREE.MeshLambertMaterial({color:col})); m.position.set(.18*T,S.N.H*.75,.1*T); m.castShadow=true; S.N.g.add(m); S.item=m; };
  const cityTab=()=>{ const Mn=document.getElementById('menu');   // opened from ADMIN (UI.menuTab('city'))
    const pane=document.createElement('div'); pane.className='pane'; pane.dataset.p='city'; pane.hidden=true; pane.innerHTML='<div id="civ" style="font:11px Silkscreen,monospace;letter-spacing:.4px;max-height:60vh;overflow:auto"></div><h3>TRY</h3><div class="row"><button class="btn" id="cvfire">A FIRE</button><button class="btn" id="cvout">AN OUTAGE</button><button class="btn" id="cvcan">A FULL CAN</button><button class="btn" id="cvfaint">YOU FAINT</button></div>';
    Mn.querySelector('.box').appendChild(pane);
    const fmt=h=>{ const m=Math.floor(h*60)%60, hh=Math.floor(h)%24; return hh+':'+(m<10?'0':'')+m; }, esc=s=>String(s).replace(/</g,'&lt;');
    CIVIC.draw=()=>{ '@later'; if(!pane.offsetParent)return; const L=CIVIC.ledger, row=(a,b)=>`<div style="display:flex;justify-content:space-between;gap:12px"><span>${a}</span><span style="color:#c9ccd6">${b}</span></div>`;
      let o=`<h3>THE LEDGER</h3>${row('DAY '+CITY.day+' · '+fmt(CLOCK.h),'TREASURY $'+L.treasury)}${row('LAWS','tax $'+L.tax+' a shop · curfew '+L.curfew[0]+':00-'+L.curfew[1]+':00')}`;
      o+='<h3>SHOPS</h3>'+Object.values(CIVIC.shops).map(S=>row(S.id,'stock '+S.stock+' · till $'+S.till+' · sold '+S.sold)).join('');
      o+='<h3>SERVICES</h3>'+Object.values(CIVIC.staff).map(S=>row(S.name,S.state+(S.job?' · '+S.job.kind+(S.job.place?' at '+S.job.place:''):''))).join('');
      o+='<h3>OPEN JOBS</h3>'+(CITY.open().map(j=>row(j.kind,(j.place||'')+' · posted '+fmt(j.posted))).join('')||row('none',''));
      if(window.MAIL&&MAIL.ready){ const st=MAIL.L.reduce((a,l)=>(a[l.state]=(a[l.state]||0)+1,a),{}); o+='<h3>THE POST</h3>'+row(MAIL.addr.length+' addresses · '+MAIL.cboxes.length+' collection boxes','sort 8:00 · round 9:30 · collection 16:00')+row('in the boxes to go '+(st.posted||0)+' · collected '+(st.collected||0)+' · sorted '+(st.sorted||0)+' · out '+(st.out||0)+' · held '+(st.held||0),'delivered '+(st.delivered||0)+' · read '+(st.read||0)+' · dead '+(st.dead||0))+row('YOUR MONEY','$'+MAIL.you.cash); }
      o+='<h3>THE LOG</h3>'+CIVIC.log.slice(0,14).map(e=>row('DAY '+e.day+' '+fmt(e.t),esc(e.what))).join('');
      pane.querySelector('#civ').innerHTML=o; };
    setInterval(()=>{ if(UI.menuOpen)CIVIC.draw(); },1000);
    pane.querySelector('#cvfire').onclick=()=>CIVIC.tryFire&&CIVIC.tryFire(); pane.querySelector('#cvout').onclick=()=>CIVIC.tryOutage&&CIVIC.tryOutage(); pane.querySelector('#cvcan').onclick=()=>CIVIC.tryCan&&CIVIC.tryCan(); pane.querySelector('#cvfaint').onclick=()=>{ CIVIC.tryFaint&&CIVIC.tryFaint(); UI.toggleMenu(); }; };
  if(CITY.on)setTimeout(()=>{ if(BUGS.owner)BUGS.owner().then(ok=>{ if(ok)cityTab(); }).catch(()=>{}); },2000);   // the CITY tab is the owner's readout (2 Nov 2026)
  CIVIC.note('the city opened','hall');
}
