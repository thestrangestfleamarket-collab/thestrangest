// BFLY: wild butterflies spawn on the lawn and flowerbed chunks near you (catch with a net, mount or release); their models come from BF.add, which lives in the later chunk.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, FORAGE, INSPECT, INV, ITEMS, MAIL, PARK, pos, SFX, st, UI, W3, WEEDS, WX} from './003b-systems.js';
import {scene} from './004-main.js';
import {BF, SYS, TILE} from './006-map-pre.js';
import {FLORA} from './142a-flora.js';
const BFLY={}; window.BFLY=BFLY;
{ const T=TILE, {BF_KINDS}=SHARED.BOD.STOREK.bf, NK=BF_KINDS.length, say=FORAGE.say, use=FORAGE.use, WU=T/.84;
  const hsh=(a,b,s)=>{ let h=(Math.floor(a*97)*374761393+Math.floor(b*89)*668265263+s*1442695041)|0; h=(h^(h>>>13))*1274126177|0; return ((h^(h>>>16))>>>0)/4294967296; };
  const COMMON=[2,3,1.2,1,.8,1.5,1.5,.7,.7,2,2,2], CS=COMMON.reduce((a,b)=>a+b,0);
  const DIFF=k=>k<12?Math.round(30-COMMON[k]*10):50+Math.round((k-12)/(NK-13)*40), PR=k=>k<12?Math.max(3,Math.round(14-COMMON[k]*4)):Math.round(40+(k-12)/(NK-13)*210);
  const SPD=k=>k<12?1+(DIFF(k)-10)/40:1.4+(k-12)/(NK-13)*.6, wild=b=>{ b.wild=true; b.fast=SPD(b.k); b.hi=b.k>=12?2.4:1+(SPD(b.k)-1)*2; };
  // live butterflies ride in your hands (5) or in jars: the HOLDS item property, summed over the jars you own
  const room=()=>{ let n=0; for(const id of ITEMS.ids()){ const h=+ITEMS.prop(id,'holds')||0; if(h>0)n+=h*FORAGE.has(id); } return Math.max(5,n); }, held=()=>{ let n=0; for(const id in INV.items)if(/^bu?_\d/.test(id))n+=INV.items[id]; return n; };
  BFLY.room=room; BFLY.held=held; FORAGE.NOTE.push(id=>{ const h=+ITEMS.prop(id,'holds')||0; return h>0?'HOLDS '+h+' BUTTERFLIES':/^bu?_\d/.test(id)?held()+'/'+room()+' HELD':''; });
  const NM={net:'BUTTERFLY NET',frame:'SPECIMEN FRAME',jar_s:'SMALL BUTTERFLY JAR',jar_m:'MEDIUM BUTTERFLY JAR',jar_l:'LARGE BUTTERFLY JAR'}, PRICES={}, size=k=>BF_KINDS[k][3]<45?'SMALL':BF_KINDS[k][3]<90?'':'LARGE';
  for(let k=0;k<NK;k++){ const n=BF_KINDS[k][0].toUpperCase(); NM['b_'+k]=n+(k>=12?' (RARE)':''); NM['bu_'+k]=('UNKNOWN '+size(k)+' BUTTERFLY').replace('  ',' '); NM['s_'+k]='MOUNTED '+n;
    PRICES['b_'+k]=PR(k); PRICES['bu_'+k]=Math.max(1,Math.floor(PR(k)/2)); PRICES['s_'+k]=Math.round(PR(k)*2.5); }
  FORAGE.add({names:NM,prices:PRICES}); FORAGE.SELLP.push('b_','bu_','s_'); FORAGE.BUYK.butterflies=['b_','bu_','s_']; FORAGE.SELLS.push(['net',12,()=>!FORAGE.has('net')],['frame',4,()=>true]);
  const CH=new Map(), DEEP=10, pickC=r=>{ r*=CS; for(let i=0;i<12;i++)if((r-=COMMON[i])<0)return i; return 0; };
  const spawn=(key,grp)=>{ const Q=grp.sq; if(!Q||Q.length<9)return []; const turn=Math.floor((window.CLOCK?CLOCK.h:12)/2), d=(window.MAIL&&MAIL.ready?MAIL.day():0)*13+turn, out=[];
    const i0=3*Math.floor(hsh(Q[0]/T,Q[2]/T,301)*(Q.length/3)), cx=Q[i0], cz=Q[i0+2], park=WEEDS.inPark(cx,cz), deep=WEEDS.inPark(cx,cz,DEEP), n=park&&!PARK.in?0:park?(hsh(cx/T+d,cz/T,303)<(window.FLORA&&FLORA.beds.length?.35:.7)?1+(hsh(cz/T,cx/T+d,305)<.35?1:0):0):(hsh(cx/T+d,cz/T,303)<.18?1:0);
    for(let j=0;j<n;j++){ const P=[]; for(let i=0;i<Q.length&&P.length<6;i+=3){ const x=Q[i], z=Q[i+2]; if(Math.hypot(x-cx,z-cz)>3.5*T||hsh(x/T+j,z/T+d,307)>.35)continue; P.push([x,grp.top(x,Q[i+1],z)+(.15+.7*hsh(z,x,309))*WU,z]); }
      if(P.length<3)continue; const r=hsh(cx/T+j*7,cz/T+d,311), k=deep&&r<.06?12+Math.floor(hsh(cz/T,cx/T+j+d,313)*(NK-12)):pickC(hsh(cx/T+d*3,cz/T+j,315));
      const b=BF.add(k,P); wild(b); b.chunk=key; out.push(b); hit(b); } return out; };
  const BEDR=24*T, bedSpawn=d=>{ const dd=(window.MAIL&&MAIL.ready?MAIL.day():0)*13+Math.floor((window.CLOCK?CLOCK.h:12)/2), r=hsh(d.x/T+dd,d.z/T,321), n=d.street?(r<.2?1:0):r<.4?1:r<.6?2:0, out=[]; if(!n)return out;
    const P=d.p.concat(...FLORA.beds.filter(o=>o!==d&&!o.street&&Math.hypot(o.x-d.x,o.z-d.z)<7*T).slice(0,2).map(o=>o.p)); if(P.length<2)return out; const deep=WEEDS.inPark&&WEEDS.inPark(d.x,d.z,DEEP);
    for(let j=0;j<n;j++){ const k=deep&&hsh(d.z/T+j,d.x/T+dd,323)<.06?12+Math.floor(hsh(d.x/T,d.z/T+j+dd,325)*(NK-12)):pickC(hsh(d.x/T+dd*3,d.z/T+j,327)), b=BF.add(k,P), i=Math.floor(hsh(j,d.id+dd,329)*P.length);
      b.at=b.to=i; b.g.position.set(...P[i]); wild(b); b.chunk='bed:'+d.id; out.push(b); hit(b); } return out; };
  const beds=()=>{ if(!window.FLORA||!FLORA.beds.length||SHARED.LVL!=='up')return; for(const d of FLORA.beds){ const key='bed:'+d.id, far=!d.street&&!PARK.in?1e9:Math.hypot(d.x-pos.x,d.z-pos.z);
    if(far<BEDR&&!CH.has(key))CH.set(key,bedSpawn(d)); else if(far>BEDR+10*T&&CH.has(key)){ CH.get(key).forEach(drop); CH.delete(key); } } };
  const hit=b=>{ const hb=new THREE.Mesh(HB,HM); hb.position.y=.1*WU; b.g.add(hb); b.th={name:BF_KINDS[b.k][0].toUpperCase(),obj:hb,reach:1.1*T,near:1.4*T,tall:.3*T,act:()=>BFLY.catch(b)}; UI.thing(b.th); };
  const HB=new THREE.BoxGeometry(.5*T,.4*T,.5*T), HM=new THREE.MeshBasicMaterial({visible:false});
  const drop=b=>{ scene.remove(b.g); const i=BF.list.indexOf(b); if(i>=0)BF.list.splice(i,1); if(b.th){ const j=UI.things.indexOf(b.th); if(j>=0)UI.things.splice(j,1); } };
  // BF.add is in the later chunk, which the start fetches only after the first frame, so hold every spawn until the start is up and later has loaded: it keeps a saved-spot start from a slow fetch, and keeps the start from pulling the later chunk in early
  const bfGo=()=>{ if(!window.__started){ setTimeout(bfGo,200); return; } LOAD('later').then(()=>{ SYS.add('weedsAdd',(key,grp)=>{ if(!CH.has(key))CH.set(key,spawn(key,grp)); },'143-bfly'); SYS.add('weedsDrop',key=>{ const L=CH.get(key); if(L){ L.forEach(drop); CH.delete(key); } },'143-bfly');
    if(WEEDS.chunks)for(const [k,g] of WEEDS.chunks)if(g&&g.sq)CH.set(k,spawn(k,g));
    let fa=0; SYS.add('life',dt=>{ if((fa+=dt||0)<.1)return; fa=0; if(!BFLY.out||SHARED.LVL!=='up'||!CH.size)return; const p=W3.group.position, v=st.run>.5?1.5:(st.move&&st.move.name==='crouch')||(st.w||0)<.4?.45:1, sk=Math.min(1,FORAGE.sk('ento')/100);
      for(const L of CH.values())for(const b of L){ if(b.dur||!b.g.parent)continue; if(Math.hypot(p.x-b.g.position.x,p.z-b.g.position.z)<(.8+b.fast)*T*v*(1-.35*sk)){ b.until=0; b.away=[p.x,p.z]; } } },'143-bfly');
    let turn0=-1; setInterval(()=>{ const tn=Math.floor((window.CLOCK?CLOCK.h:12)/2); if(tn!==turn0&&WEEDS.chunks){ const first=turn0<0; turn0=tn; if(!first){ for(const L of CH.values())L.forEach(drop); CH.clear(); for(const [k,g] of WEEDS.chunks)if(g&&g.sq)CH.set(k,spawn(k,g)); } }
    beds(); const W=window.WX&&WX.now, hide=(window.CLOCK&&CLOCK.dark())||!!(W&&(W.rain>.25||W.snow>.25||W.wind>.8)); for(const L of CH.values())for(const b of L)b.g.visible=!hide; BFLY.out=!hide; },1000); }); };
  bfGo();
  // sw: a net's swing that swept its hoop through the butterfly ({spd: the swing's speed, air: you were off the ground})
  BFLY.catch=(b,sw)=>{ '@later'; if(!b.g.parent)return; const p=W3.group.position; if(!sw&&Math.hypot(p.x-b.g.position.x,p.z-b.g.position.z)>1.8*T)return say('IT FLUTTERS OUT OF REACH.','#c8a090');
    const fly=!!b.dur, net=!!sw||FORAGE.has('net'); if(fly&&!net)return say('IT IS ON THE WING. YOU NEED A NET (THE NATURE MERCHANT HAS THEM), OR WAIT TILL IT SETTLES.','#c8a090');
    if(held()>=room()){ b.until=0; b.away=[p.x,p.z]; return say(room()>5?'YOUR JARS ARE FULL. SELL SOME, OR BUY A BIGGER JAR.':'YOUR HANDS HOLD ONLY 5 BUTTERFLIES. A JAR HOLDS MORE: THE FOX AT THE BODEGA OR THE NATURE MERCHANT.','#c8a090'); }
    const d=DIFF(b.k)+(fly?Math.round(8*SPD(b.k)):0)-(net?10:0), bonus=sw?Math.max(0,Math.min(8,(sw.spd-5)*.8))+(fly&&sw.air?5:0):0; SFX.play('step',{vol:.4});
    if(use('ento',d-25,d+25,bonus)){ const known=DIFF(b.k)<12||use('ento',DIFF(b.k)-30,DIFF(b.k)+20); FORAGE.give((known?'b_':'bu_')+b.k,1);
      say(known?`YOU CATCH A ${BF_KINDS[b.k][0].toUpperCase()}${b.k>=12?'. A RARE ONE!':'.'}`:'YOU CATCH A BUTTERFLY YOU DO NOT KNOW.',b.k>=12?'#f2c14e':known?'#e8e2cc':'#c8b0ff');
      const L=CH.get(b.chunk); if(L){ const i=L.indexOf(b); if(i>=0)L.splice(i,1); } drop(b); }
    else { say(net?(fly?'IT JINKS AWAY FROM YOUR NET.':'YOUR NET SWISHES THROUGH EMPTY AIR.'):'IT SLIPS BETWEEN YOUR FINGERS.','#c8a090'); b.until=0; b.away=[p.x,p.z]; }
    FORAGE.draw(); };
  const BM=new Map(), wings=k=>{ const t=BF.pic&&BF.pic(k,0); if(!t)return null; let m=BM.get(k); if(!m){ m=new THREE.MeshLambertMaterial({map:t.T,transparent:true,alphaTest:.5,side:THREE.DoubleSide}); BM.set(k,m); }
    const o=new THREE.Mesh(new THREE.PlaneGeometry(t.w/16*.08,t.h/16*.08),m); return o; };
  INSPECT.kinds.push({is:id=>/^(b|bu|s)_\d+$/.test(id)||id==='frame',make:id=>{ if(id==='frame')return INSPECT.shape('frame',0,0xf2ead6);
    const w=wings(+id.split('_')[1]); if(!id.startsWith('s_'))return w; const g=INSPECT.shape('frame',0,0xf2ead6); if(w){ const s=Math.min(.26/w.geometry.parameters.width,.18/w.geometry.parameters.height); w.scale.setScalar(s); w.position.z=.02; g.add(w); } return g; }});
  FORAGE.ROWB.push(id=>id.startsWith('bu_')?[['IDENTIFY','bident']]:id.startsWith('b_')?[['MOUNT','bmount'],['RELEASE','bfree']]:[]);
  FORAGE.ACT.bident=id=>{ const k=+id.slice(3), d=DIFF(k); if(use('ento',d-30,d+20)){ const n=FORAGE.has(id); FORAGE.take(id,n); FORAGE.give('b_'+k,n); say(`IT IS A ${BF_KINDS[k][0].toUpperCase()} (${BF_KINDS[k][1]}).`,'#c8b0ff'); } else say('YOU CANNOT TELL WHAT IT IS.','#c8a090'); };
  FORAGE.ACT.bmount=id=>{ '@later'; const k=+id.slice(2), d=DIFF(k); if(!FORAGE.has('frame'))return say('YOU NEED A SPECIMEN FRAME (THE MUSHROOM SELLER HAS THEM).','#c8a090');
    FORAGE.take(id,1); FORAGE.take('frame',1); if(use('ento',d-20,d+30)){ FORAGE.give('s_'+k,1); say(`YOU PIN THE ${BF_KINDS[k][0].toUpperCase()} IN ITS FRAME, ITS WINGS SPREAD.`,'#b8f0a0'); } else say('YOU TEAR A WING. THE SPECIMEN IS RUINED.','#c8a090'); };
  FORAGE.ACT.bfree=id=>{ '@later'; const k=+id.slice(2); FORAGE.take(id,1); const p=W3.group.position, P=[[p.x,p.y+1.2*WU,p.z]]; for(let i=0;i<4;i++){ const a=i*1.7; P.push([p.x+Math.cos(a)*(3+i)*T,p.y+(1+i*.4)*WU,p.z+Math.sin(a)*(3+i)*T]); }
    const b=BF.add(k,P); b.until=0; setTimeout(()=>drop(b),20000); say('YOU LET IT GO. IT FLUTTERS AWAY.','#9fe07f'); };
  BFLY.list=()=>BF.list; window.BFLYDBG=()=>({near:[...CH.values()].reduce((a,L)=>a+L.length,0),chunks:CH.size,out:BFLY.out,kinds:[...CH.values()].flat().map(b=>BF_KINDS[b.k][0]),ento:FORAGE.sk('ento')}); }
export {BFLY};
