// THE DARK ALLEY: a place off the map (GO TO it from the map), and only its door: going in leaves THE MARKET for YATAI '86's own alley as a guest (/holo?g=sushi&as=guest, src/sushi/guest.js), where the cart, its cook, the customers and everyone passing are the same on every page; you are there as your own figure (sent with you: its mesh, and its standing, walking and sitting posed here by your rig), and come back here at the alley's mouth, what you paid at the cart taken from your money
import {SHARED} from './003-shx.js';
import {INV, ONLINE, pos, WHERE} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {MAPSTAIR, MODS, STORE, SYS, TILE} from './006-map-pre.js';
import {IKIT} from './038zc-ikit.js';
import {BODIES} from './111a-bodies.js';
{ const MW=TILE/.84, W=16, D=8, CU=8, CV=4.6, OX=()=>SHARED.BOD.XS(-3900), OZ=()=>SHARED.BOD.ZS(0), START=[1.4,-3.2];
  // the alley's own frame in THE MARKET's world (the cart's metres to the section's place: where its people stand for the voices and the list)
  const frame=()=>{ const o=[OX(),OZ()]; return IKIT.frame({x0:0,y0:0,x1:1,y1:1},(x,y)=>[o[0]+x*W*MW,o[1]+y*D*MW]); };
  const b64=a=>{ const u=new Uint8Array(a.buffer,a.byteOffset,a.byteLength); let s=''; for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000)); return btoa(s); };
  const r4=v=>Math.round(v*1e4)/1e4, r1=v=>Math.round(v*10)/10, m12=e=>[r4(e[0]),r4(e[1]),r4(e[2]),r4(e[4]),r4(e[5]),r4(e[6]),r4(e[8]),r4(e[9]),r4(e[10]),r1(e[12]),r1(e[13]),r1(e[14])];
  // your figure as the others draw it (ONLINE.self): its points, colours and bones, in metres
  const pack=()=>{ '@later'; const S=ONLINE.self&&ONLINE.self(); if(!S)return null; const G0=S.me.geometry, P=G0.attributes.position, C=G0.attributes.color||G0.attributes.c1, n=P.count, lo=[1e9,1e9,1e9], hi=[-1e9,-1e9,-1e9];
    for(let i=0;i<n;i++)for(let a=0;a<3;a++){ const v=P.array[i*3+a]; if(v<lo[a])lo[a]=v; if(v>hi[a])hi[a]=v; }
    const q=new Uint16Array(n*3), c=new Uint8Array(n*3); for(let i=0;i<n;i++)for(let a=0;a<3;a++){ q[i*3+a]=Math.round((P.array[i*3+a]-lo[a])/Math.max(1e-6,hi[a]-lo[a])*65535); c[i*3+a]=C?Math.max(0,Math.min(255,Math.round(C.array[i*3+a]*255))):200; }
    const B=S.kind==='w'?Uint8Array.from(G0.attributes.pidx.array,v=>Math.round(v)):(()=>{ const bi=G0.attributes.bi.array, bw=G0.attributes.bw.array, o=new Uint8Array(n*3); for(let i=0;i<n;i++){ o[i*3]=Math.round(bi[i*2]); o[i*3+1]=Math.round(bi[i*2+1]); o[i*3+2]=Math.round(bw[i]*255); } return o; })();
    const ix=G0.index?(n<65536?Uint16Array.from(G0.index.array):null):null;
    const Dj=JSON.stringify({kind:S.kind,np:S.PM.value.length,n,lo,hi,mi:1,s:S.scale.map(v=>v/MW),p:b64(q),c:b64(c),b:b64(B),...(ix?{i:b64(ix)}:{})});
    return {k:S.k+':'+Dj.length,D:Dj}; };
  // its standing, its walk in eight steps and its sitting on a stool, posed by your own rig (12 numbers a bone)
  const clips=()=>{ '@later'; const S=ONLINE.self&&ONLINE.self(); if(!S)return null; const one=(B,st)=>{ if(S.kind==='b')BODIES.pose(B,S.PM,S.body,st||null); else S.PCS.forEach((pc,i)=>S.FM.set(i,RIG.frameOf(pc.on||pc.n,B))); const m=[]; for(const X of S.PM.value)m.push(...m12(X.elements)); return m; };
    const st=RIG.create(); st.sit={z:Math.max(2,.62/(S.scale[1]/MW))};
    return {stand:one(RIG.frameAt('stand',0)),walk:[0,1,2,3,4,5,6,7].map(f=>one(RIG.frameAt('walk',f))),sit:one(RIG.pose(st,true),st)}; };
  // what goes with you: who you are and your figure, the alley's frame, where the cook stands, your money; and you are saved standing at the alley's mouth, where THE MARKET starts you again
  const card=()=>{ const F=frame(), sx=F.eu[0]*F.ev[1]-F.eu[1]*F.ev[0]<0?-1:1, o0=F.pw(CU,CV+.55), c=F.pw(CU,CV+1.0), f=[+o0[0].toFixed(2),+o0[1].toFixed(2),+(F.eu[0]*sx*MW).toFixed(4),+(F.eu[1]*sx*MW).toFixed(4),+(F.ev[0]*MW).toFixed(4),+(F.ev[1]*MW).toFixed(4)];
    const at=[+(f[0]+f[2]*START[0]+f[4]*START[1]).toFixed(2),+(f[1]+f[3]*START[0]+f[5]*START[1]).toFixed(2),0,0,'up','alley'];
    let fig=null, cl=null; try{ fig=pack(); cl=clips(); }catch(e){ console.warn('THE DARK ALLEY: your figure',e); }
    return {at,yatai:{f,w:[+c[0].toFixed(2),+c[1].toFixed(2),0,+F.hd(0,-1).toFixed(2),'up','alley'],fig,clips:cl,cash:INV.money(),paid:0}}; };
  const mouth=()=>{ const S=MAPSTAIR; return [SHARED.BOD.XS((S.x0+S.x1)/2),SHARED.BOD.ZS(S.y1+1.2)]; };
  const go=async()=>{ await LOAD('later'); const C=card(), m=mouth(); pos.x=m[0]; pos.z=m[1]; SHARED.py=0; SHARED.floor='up'; if(WHERE.save)WHERE.save(true); STORE.holo.go({name:'THE DARK ALLEY',page:'/holo?g=sushi&as=guest',card:C}); };
  const P=STORE.places.find(p=>p[0]==='THE DARK ALLEY'); if(P)P[6]=go;
  // back from the alley: what you paid for your bowls there comes out of your money, once
  const settle=()=>{ let h=null; try{ h=JSON.parse(sessionStorage.getItem('holo')||'null'); }catch(e){} const y=h&&h.yatai; if(!y||!(y.paid>0)||y.settled)return; setTimeout(()=>{ const n=Math.min(Math.round(y.paid),INV.money()); if(n>0)INV.pay(n); if(INV.save)INV.save(); y.settled=1; try{ sessionStorage.setItem('holo',JSON.stringify(h)); }catch(e){} SAY('YOU PAID $'+n+' AT THE RAMEN CART.','#ffb070'); },1500); }; SYS.onStart(settle,'146bg-yatai paid');
  MODS.yatai={go,card,pack,clips,frame,mouth,settle}; }
