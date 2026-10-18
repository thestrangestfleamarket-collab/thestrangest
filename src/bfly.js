// ---- BUTTERFLIES IN THE PARK, AND CATCHING THEM (owner, 18 Oct 2026: "add butterflies to the game (look in old game for crafting and butterflies
// info) lets implement all of hat ( in line with our current mushrooms, fishing, gems, etc)"). The old game's own (its archive's 47-butterflies:
// New York's twelve by how often you'd see them, now and then one of the world's twenty rarest in the park and the flower beds; a net catches a
// flying one or a resting one, bare hands only one that has settled; caught, it is an "Unknown butterfly" till known), on the town's skills
// (forage.js: UO's gains): ENTOMOLOGY catches, knows and mounts them. They come up by day over the lawns round you (weeds.js's chunks, as the
// mushrooms do), most in Central Park, a few on the lawns outside it, the rare ones only deep in the park; each flies perch to perch over the
// grass as butterflies.js flies the game's (its pictures and poses), and roosts out of sight at night and in rain. A double click walks you up and
// tries (a flying one wants the net). THE MUSHROOM SELLER sells the BUTTERFLY NET ($12) and SPECIMEN FRAMES ($4) and buys butterflies; THE PACK:
// IDENTIFY an unknown one, MOUNT one in a frame (ENTOMOLOGY: a mounted specimen sells for two and a half times), or RELEASE it. Cost: some 10-25
// butterflies near you by day, 4 triangles each (two little cards), an invisible box each to click; nothing at night but a check a second ----
const BFLY={}; window.BFLY=BFLY;
{ const T=TILE, {BF_KINDS}=BOD.STOREK.bf, NK=BF_KINDS.length, say=FORAGE.say, use=FORAGE.use, WU=T/.84;
  const hsh=(a,b,s)=>{ let h=(Math.floor(a*97)*374761393+Math.floor(b*89)*668265263+s*1442695041)|0; h=(h^(h>>>13))*1274126177|0; return ((h^(h>>>16))>>>0)/4294967296; };
  // how often you'd see each of the twelve (the old game's BFCOMMON), how hard each is (common: by how often; rare: 50-90), its price
  const COMMON=[2,3,1.2,1,.8,1.5,1.5,.7,.7,2,2,2], CS=COMMON.reduce((a,b)=>a+b,0);
  const DIFF=k=>k<12?Math.round(30-COMMON[k]*10):50+Math.round((k-12)/(NK-13)*40), PR=k=>k<12?Math.max(3,Math.round(14-COMMON[k]*4)):Math.round(40+(k-12)/(NK-13)*210);
  const NM={net:'BUTTERFLY NET',frame:'SPECIMEN FRAME'}, PRICES={}, size=k=>BF_KINDS[k][3]<45?'SMALL':BF_KINDS[k][3]<90?'':'LARGE';
  for(let k=0;k<NK;k++){ const n=BF_KINDS[k][0].toUpperCase(); NM['b_'+k]=n+(k>=12?' (RARE)':''); NM['bu_'+k]=('UNKNOWN '+size(k)+' BUTTERFLY').replace('  ',' '); NM['s_'+k]='MOUNTED '+n;
    PRICES['b_'+k]=PR(k); PRICES['bu_'+k]=Math.max(1,Math.floor(PR(k)/2)); PRICES['s_'+k]=Math.round(PR(k)*2.5); }
  FORAGE.add({names:NM,prices:PRICES}); FORAGE.SELLP.push('b_','bu_','s_'); FORAGE.SELLS.push(['net',12,()=>!FORAGE.has('net')],['frame',4,()=>true]);
  // ---- WHERE: each lawn chunk round you, by the day and the hour, a few perches over its grass and a butterfly among them (or none)
  const CH=new Map(), DEEP=10, pickC=r=>{ r*=CS; for(let i=0;i<12;i++)if((r-=COMMON[i])<0)return i; return 0; };
  const spawn=(key,grp)=>{ const Q=grp.sq; if(!Q||Q.length<9)return []; const turn=Math.floor((window.CLOCK?CLOCK.h:12)/2), d=(window.MAIL&&MAIL.ready?MAIL.day():0)*13+turn, out=[];
    const i0=3*Math.floor(hsh(Q[0]/T,Q[2]/T,301)*(Q.length/3)), cx=Q[i0], cz=Q[i0+2], park=WEEDS.inPark(cx,cz), deep=WEEDS.inPark(cx,cz,DEEP), n=park?(hsh(cx/T+d,cz/T,303)<.7?1+(hsh(cz/T,cx/T+d,305)<.35?1:0):0):(hsh(cx/T+d,cz/T,303)<.18?1:0);
    for(let j=0;j<n;j++){ const P=[]; for(let i=0;i<Q.length&&P.length<6;i+=3){ const x=Q[i], z=Q[i+2]; if(Math.hypot(x-cx,z-cz)>3.5*T||hsh(x/T+j,z/T+d,307)>.35)continue; P.push([x,grp.top(x,Q[i+1],z)+(.15+.7*hsh(z,x,309))*WU,z]); }
      if(P.length<3)continue; const r=hsh(cx/T+j*7,cz/T+d,311), k=deep&&r<.06?12+Math.floor(hsh(cz/T,cx/T+j+d,313)*(NK-12)):pickC(hsh(cx/T+d*3,cz/T+j,315));
      const b=BF.add(k,P); b.wild=true; b.chunk=key; out.push(b); hit(b); } return out; };
  const hit=b=>{ const hb=new THREE.Mesh(HB,HM); hb.position.y=.1*WU; b.g.add(hb); b.th={name:BF_KINDS[b.k][0].toUpperCase(),obj:hb,reach:1.1*T,near:1.4*T,tall:.3*T,act:()=>BFLY.catch(b)}; UI.thing(b.th); };
  const HB=new THREE.BoxGeometry(.5*T,.4*T,.5*T), HM=new THREE.MeshBasicMaterial({visible:false});
  const drop=b=>{ scene.remove(b.g); const i=BF.list.indexOf(b); if(i>=0)BF.list.splice(i,1); if(b.th){ const j=UI.things.indexOf(b.th); if(j>=0)UI.things.splice(j,1); } };
  { const a0=WEEDS.onAdd, d0=WEEDS.onDrop; WEEDS.onAdd=(key,grp)=>{ if(a0)a0(key,grp); if(!CH.has(key))CH.set(key,spawn(key,grp)); }; WEEDS.onDrop=key=>{ if(d0)d0(key); const L=CH.get(key); if(L){ L.forEach(drop); CH.delete(key); } };
    if(WEEDS.chunks)for(const [k,g] of WEEDS.chunks)if(g&&g.sq)CH.set(k,spawn(k,g)); }
  // a new turn (two hours of the clock): the butterflies round you come and go afresh; at night, in rain or deep snow they roost out of sight
  let turn0=-1; setInterval(()=>{ const tn=Math.floor((window.CLOCK?CLOCK.h:12)/2); if(tn!==turn0&&WEEDS.chunks){ const first=turn0<0; turn0=tn; if(!first){ for(const L of CH.values())L.forEach(drop); CH.clear(); for(const [k,g] of WEEDS.chunks)if(g&&g.sq)CH.set(k,spawn(k,g)); } }
    const W=window.WX&&WX.now, hide=(window.CLOCK&&CLOCK.dark())||!!(W&&(W.rain>.25||W.snow>.25||W.wind>.8)); for(const L of CH.values())for(const b of L)b.g.visible=!hide; BFLY.out=!hide; },1000);
  // ---- CATCHING ONE (ENTOMOLOGY): a resting one with your hands or the net, a flying one only with the net (harder); known or not
  BFLY.catch=b=>{ if(!b.g.parent)return; const p=W3.group.position; if(Math.hypot(p.x-b.g.position.x,p.z-b.g.position.z)>1.8*T)return say('IT FLUTTERS OUT OF REACH.','#c8a090');
    const fly=!!b.dur, net=FORAGE.has('net'); if(fly&&!net)return say('IT IS ON THE WING. YOU NEED A NET (THE MUSHROOM SELLER HAS THEM), OR WAIT TILL IT SETTLES.','#c8a090');
    const d=DIFF(b.k)+(fly?15:0)-(net?10:0); if(typeof SFX!=='undefined')SFX.play('step',{vol:.4});
    if(use('ento',d-25,d+25)){ const known=DIFF(b.k)<12||use('ento',DIFF(b.k)-30,DIFF(b.k)+20); FORAGE.give((known?'b_':'bu_')+b.k,1);
      say(known?`YOU CATCH A ${BF_KINDS[b.k][0].toUpperCase()}${b.k>=12?'. A RARE ONE!':'.'}`:'YOU CATCH A BUTTERFLY YOU DO NOT KNOW.',b.k>=12?'#f2c14e':known?'#e8e2cc':'#c8b0ff');
      const L=CH.get(b.chunk); if(L){ const i=L.indexOf(b); if(i>=0)L.splice(i,1); } drop(b); }
    else { say(net?'YOUR NET SWISHES THROUGH EMPTY AIR.':'IT SLIPS BETWEEN YOUR FINGERS.','#c8a090'); b.until=0; }
    FORAGE.draw(); };
  // ---- THE PACK'S BUTTONS: IDENTIFY an unknown one; MOUNT one in a frame; RELEASE one (it flies off from you)
  FORAGE.ROWB.push(id=>id.startsWith('bu_')?[['IDENTIFY','bident']]:id.startsWith('b_')?[['MOUNT','bmount'],['RELEASE','bfree']]:[]);
  FORAGE.ACT.bident=id=>{ const k=+id.slice(3), d=DIFF(k); if(use('ento',d-30,d+20)){ const n=FORAGE.has(id); FORAGE.take(id,n); FORAGE.give('b_'+k,n); say(`IT IS A ${BF_KINDS[k][0].toUpperCase()} (${BF_KINDS[k][1]}).`,'#c8b0ff'); } else say('YOU CANNOT TELL WHAT IT IS.','#c8a090'); };
  FORAGE.ACT.bmount=id=>{ const k=+id.slice(2), d=DIFF(k); if(!FORAGE.has('frame'))return say('YOU NEED A SPECIMEN FRAME (THE MUSHROOM SELLER HAS THEM).','#c8a090');
    FORAGE.take(id,1); FORAGE.take('frame',1); if(use('ento',d-20,d+30)){ FORAGE.give('s_'+k,1); say(`YOU PIN THE ${BF_KINDS[k][0].toUpperCase()} IN ITS FRAME, ITS WINGS SPREAD.`,'#b8f0a0'); } else say('YOU TEAR A WING. THE SPECIMEN IS RUINED.','#c8a090'); };
  FORAGE.ACT.bfree=id=>{ const k=+id.slice(2); FORAGE.take(id,1); const p=W3.group.position, P=[[p.x,p.y+1.2*WU,p.z]]; for(let i=0;i<4;i++){ const a=i*1.7; P.push([p.x+Math.cos(a)*(3+i)*T,p.y+(1+i*.4)*WU,p.z+Math.sin(a)*(3+i)*T]); }
    const b=BF.add(k,P); b.until=0; setTimeout(()=>drop(b),20000); say('YOU LET IT GO. IT FLUTTERS AWAY.','#9fe07f'); };
  BFLY.list=()=>BF.list; window.BFLYDBG=()=>({near:[...CH.values()].reduce((a,L)=>a+L.length,0),chunks:CH.size,out:BFLY.out,kinds:[...CH.values()].flat().map(b=>BF_KINDS[b.k][0]),ento:FORAGE.sk('ento')}); }
