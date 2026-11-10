// THE NIGHT'S EVENTS IN THE STREET'S SKY: SKYSHOW puts the planets where they really are (steady points among the stars), shooting stars at the real showers' rates (the same streak for every player), a passing satellite and the northern lights when the live sky is in (150fg, asked for only once you look up), and the Earth's shadow across the Moon in a lunar eclipse; it fills the dome's uniforms (132) and lists what is up (SKYSHOW.things) for the names.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, DN, SKY, WX} from './003b-systems.js';
import {SYS} from './006-map-pre.js';
import {EPH} from './134bb-ephem.js';
const SKYSHOW={things:[],want:false,live:{kp:null,sats:[]},mets:[],n:0}; window.SKYSHOW=SKYSHOW;
{ const U=SKY.U, D2R=Math.PI/180, cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)), PL=['me','ve','ma','ju','sa'];
  const hz=(alt,az,o)=>(o||new THREE.Vector3()).set(-Math.cos(alt*D2R)*Math.sin(az*D2R),Math.sin(alt*D2R),Math.cos(alt*D2R)*Math.cos(az*D2R));   // a height and bearing to the world's direction (+x west, +y up, +z north, as the stars have it)
  SKYSHOW.dir=hz; SKYSHOW.jd=()=>EPH.jdOf(DN.skyT()); SKYSHOW.fresh=()=>{ slowT=rateT=0; };
  // an equatorial place (degrees) to the world's direction, by the dome's own turn (134ba)
  SKYSHOW.eq=(ra,dec,o)=>{ const e=U.uEq.value.elements, x=Math.cos(dec*D2R)*Math.cos(ra*D2R), y=Math.cos(dec*D2R)*Math.sin(ra*D2R), z=Math.sin(dec*D2R); return (o||new THREE.Vector3()).set(e[0]*x+e[1]*y+e[2]*z,e[3]*x+e[4]*y+e[5]*z,e[6]*x+e[7]*y+e[8]*z); };
  const h1=(n,k)=>{ let x=(Math.imul(n|0,374761393)^Math.imul(k|0,668265263))>>>0; x=Math.imul(x^(x>>>13),1274126177)>>>0; return ((x^(x>>>16))>>>0)/4294967296; };
  let slowT=0, rateT=0, rate={all:0,list:[]}, lastS=0, upT=0, sunAlt=-30; const col=new THREE.Color(), tA=new THREE.Vector3(), tB=new THREE.Vector3();
  // every few seconds: the planets, the Moon's shadow, what is up
  const slow=jd=>{ const T=[], P=DN.P?DN.P():{}, e=CLOCK.elev(), W=WX.now||{}, look=cl((2-e)/5)*Math.min(1,P.star??1)*(1-.9*cl(((W.cloud||0)-.3)/.6)); sunAlt=EPH.seen('sun',jd).alt;
    const lim=cl(-4.5-sunAlt*.8,-5,6);   // the faintest thing the eye picks out of the twilight
    PL.forEach((k,i)=>{ const s=EPH.seen(k,jd), u=U.uPl.value[i], vis=s.alt>0?cl((lim-s.mag)/1.5)*look:0; SKYSHOW.eq(s.ra,s.dec,tA); u.set(tA.x,tA.y,tA.z,vis*cl(1.2-s.mag*.45,.3,3.2)); U.uPlC.value[i].set(EPH.BODY[k].col);
      if(s.alt>0)T.push({id:k,name:EPH.BODY[k].name,kind:'planet',v:tA.clone(),mag:s.mag,alt:s.alt,az:s.az,seen:vis>.05}); });
    { const m=EPH.seen('moon',jd); if(m.alt>0)T.push({id:'moon',name:'THE MOON',kind:'moon',v:CLOCK.moonV.clone(),mag:m.mag,alt:m.alt,az:m.az,seen:U.uMoonK.value>.05,lit:Math.round((1+Math.cos(m.i*D2R))*50)});
      const sh=EPH.shadow(jd); SKYSHOW.eclipse=sh.sep<sh.um+sh.rm?sh:null;
      if(SKYSHOW.eclipse){ const M=CLOCK.moonV, mq=EPH.where('moon',jd), a=SKYSHOW.eq(mq.ra,mq.dec,tA).clone(), b=SKYSHOW.eq(sh.ra,sh.dec,tB), t1=new THREE.Vector3().crossVectors(M,new THREE.Vector3(0,1,0)).normalize(), t2=new THREE.Vector3().crossVectors(M,t1), r=sh.rm*D2R; b.sub(a);
        U.uSh.value.set(b.dot(t1)/r,b.dot(t2)/r,sh.um/sh.rm); } else U.uSh.value.set(99,99,0); }
    // the live sky's: the brightest satellite up and lit, the northern lights by NOAA's Kp
    { const L=SKYSHOW.live, b=SKYSHOW.sat; if(b)T.push({id:'sat:'+b.n,name:b.name,kind:'sat',v:satV,mag:b.mag,alt:b.alt,az:b.az,seen:look>.05});
      const kp=SKYSHOW.kpFix??L.kp, on=kp!=null&&kp>=6.7&&sunAlt<-12; SKYSHOW.aurora=on?kp:0; U.uAur.value.set(on?cl((kp-6.5)/1.5,.3,1)*look:0,Math.sin(cl((kp-6.3)*12,3,60)*D2R),kp>=8?1:0,0); }
    SKYSHOW.things=T; SKYSHOW.look=look; SKYSHOW.lim=lim; };
  // a shooting star for the second s, if that second has one: where it starts, which way it flies (away from its shower's radiant), how long and how bright
  const meteor=(s,jd)=>{ if(h1(s,0)>=rate.all/3600)return null; let pick=h1(s,1)*rate.all, sh=null; for(const x of rate.list){ pick-=x.hr; if(pick<=0){ sh=x; break; } } if(!sh)return null;
    const alt=15+Math.asin(h1(s,2))/D2R*.83, v=hz(alt,h1(s,3)*360); let d;
    if(sh.ra!=null){ const rh=EPH.eq2hor(sh.ra,sh.dec,EPH.lst(jd)), r=hz(rh.alt,rh.az); d=v.clone().multiplyScalar(v.dot(r)).sub(r); if(d.length()<.05)return null; d.normalize(); }
    else { const a=h1(s,4)*6.2832, e1=new THREE.Vector3(v.z,0,-v.x).normalize(), e2=new THREE.Vector3().crossVectors(v,e1); d=e1.multiplyScalar(Math.cos(a)).addScaledVector(e2,Math.sin(a)); }
    const len=4+h1(s,5)*22, w=cl(sh.v/100/D2R*.6,8,45); return {v,d,len,T:len/w,t:0,k:1+2.2*Math.pow(h1(s,6),3),nm:sh.nm,s}; };
  // the live sky's word, about once a second (150fg): the satellites up now ({n, name, alt, az, mag, lit}) and NOAA's Kp; the brightest lit one is drawn, gliding between words
  const satV=new THREE.Vector3(0,1,0), sat0=new THREE.Vector3(), sat1=new THREE.Vector3(); let satF=1;
  SKYSHOW.feed=(sats,kp)=>{ const L=SKYSHOW.live, was=SKYSHOW.sat; L.sats=sats||[]; L.kp=kp; let best=null; for(const s of L.sats)if(s.alt>8&&s.lit&&sunAlt<-6&&s.mag<3&&(!best||s.mag<best.mag))best=s; SKYSHOW.sat=best; if(!best)return;
    hz(best.alt,best.az,sat1); if(was&&was.n===best.n){ sat0.copy(satV); satF=0; } else { satV.copy(sat1); satF=1; } U.uPlC.value[5].setRGB(1,.97,.9); };
  SKYSHOW.burst=n=>{ const jd=SKYSHOW.jd(), r0=rate; rate={all:3600,list:[{nm:'SPORADIC',hr:3600,v:40}]}; for(let i=0;i<n;i++){ const m=meteor(1e6+SKYSHOW.n+i,jd); if(m)SKYSHOW.mets.push(m); } rate=r0; };   // a test's
  let lastN=performance.now();
  SYS.add('sky',()=>{ const now=performance.now(), el=(now-lastN)/1000, dt=Math.min(.25,el); lastN=now; if(!SKY.on())return; const t=DN.skyT(), jd=EPH.jdOf(t), M=SKYSHOW.mets;
    { const n=performance.now(); if(n>=slowT){ slowT=n+4000; slow(jd); } }
    { const u=U.uPl.value[5], b=SKYSHOW.sat; if(b){ if(satF<1){ satF=Math.min(1,satF+dt); satV.copy(sat0).lerp(sat1,satF).normalize(); } u.set(satV.x,satV.y,satV.z,(SKYSHOW.look||0)*cl(1.2-b.mag*.45,.3,3.2)); } else u.w=0; }
    // looking up into the night a few seconds asks for the live sky (150fg)
    if(!SKYSHOW.want&&sunAlt<-6&&SHARED.cam){ const e=SHARED.cam.matrixWorld.elements; if(-e[9]>.45&&(upT+=dt)>3)SKYSHOW.want=true; }
    { const n=performance.now(); if(n>=rateT){ rateT=n+60000; rate=EPH.rate(jd,6); } }
    const s=Math.floor(t/1000); if(s!==lastS){ lastS=s; if(M.length<2&&rate.all>0){ const m=meteor(s,jd); if(m){ M.push(m); SKYSHOW.n++; SKYSHOW.last=m; } } }
    for(let i=M.length-1;i>=0;i--){ M[i].t+=Math.min(2,el); if(M[i].t>M[i].T)M.splice(i,1); }   // (by the clock, so a slow machine's streak still ends on time)
    for(let i=0;i<2;i++){ const m=M[i], a=U.uMetA.value[i], b=U.uMetB.value[i]; if(!m){ a.w=0; continue; }
      const f=m.t/m.T, at=(g,o)=>o.copy(m.v).multiplyScalar(Math.cos(g*D2R)).addScaledVector(m.d,Math.sin(g*D2R)); at(Math.max(0,m.len*f-m.len*.35),tA); at(m.len*f,tB);
      a.set(tA.x,tA.y,tA.z,m.k*Math.sin(Math.PI*f)*(SKYSHOW.look||0)); b.set(tB.x,tB.y,tB.z,0); (m.head||(m.head=new THREE.Vector3())).copy(tB); } 
    { let on=U.uAur.value.x>0||U.uMetA.value[0].w>0||U.uMetA.value[1].w>0; for(const u of U.uPl.value)if(u.w>0)on=true; U.uEvt.value=on?1:0; } },'134bc-skyshow');
}
export {SKYSHOW};
