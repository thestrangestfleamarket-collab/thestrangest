// THE SKY'S SUMS: EPH works out where the Sun, the Moon and the planets are over New York at a moment (JPL's approximate elements; Meeus), Jupiter's moons, Saturn's ring tilt, the Earth's shadow on the Moon, the year's meteor showers and how many you would see; one path for the street's sky, the telescope and the globes.
const EPH={};
{ const D2R=Math.PI/180, R2D=180/Math.PI, sn=x=>Math.sin(x*D2R), cs=x=>Math.cos(x*D2R), nrm=x=>((x%360)+360)%360, s180=x=>{ x=nrm(x); return x>180?x-360:x; }, cl=(v,a,b)=>Math.max(a,Math.min(b,v));
  const LAT=CLK.LAT, LON=CLK.LON, EPS=23.43928;
  // JPL's approximate Keplerian elements (Standish, 1800-2050): a, e, I, L, long. perihelion, node, each with its rate per century
  const EL={me:[.38709927,.00000037,.20563593,.00001906,7.00497902,-.00594749,252.2503235,149472.67411175,77.45779628,.16047689,48.33076593,-.12534081],
    ve:[.72333566,.0000039,.00677672,-.00004107,3.39467605,-.0007889,181.9790995,58517.81538729,131.60246718,.00268329,76.67984255,-.27769418],
    em:[1.00000261,.00000562,.01671123,-.00004392,-.00001531,-.01294668,100.46457166,35999.37244981,102.93768193,.32327364,0,0],
    ma:[1.52371034,.00001847,.0933941,.00007882,1.84969142,-.00813131,-4.55343205,19140.30268499,-23.94362959,.44441088,49.55953891,-.29257343],
    ju:[5.202887,-.00011607,.04838624,-.00013253,1.30439695,-.00183714,34.39644051,3034.74612775,14.72847983,.21252668,100.47390909,.20469106],
    sa:[9.53667594,-.0012506,.05386179,-.00050991,2.48599187,.00193609,49.95424423,1222.49362201,92.59887831,-.41897216,113.66242448,-.28867794],
    ur:[19.18916464,-.00196176,.04725744,-.00004397,.77263783,-.00242939,313.23810451,428.48202785,170.9542763,.40805281,74.01692503,.04240589],
    ne:[30.06992276,.00026291,.00859048,.00005105,1.77004347,.00035372,-55.12002969,218.45945325,44.96476227,-.32241464,131.78422574,-.00508664]};
  const BODY={sun:{name:'THE SUN',id:'sun',km:1392700,H:-26.7,col:'#fff4d0',fill:.98},moon:{name:'THE MOON',id:'moon',km:3474.8,col:'#d8d4c8',fill:.98},me:{name:'MERCURY',id:'mercury',km:4879,H:-.6,col:'#bfb3a3',fill:.82},ve:{name:'VENUS',id:'venus',km:12104,H:-4.4,col:'#fff1cf',fill:.78},
    ma:{name:'MARS',id:'mars',km:6792,H:-1.5,col:'#e08a5a',fill:.98},ju:{name:'JUPITER',id:'jupiter',km:142984,H:-9.4,col:'#efd9b4',fill:.95},sa:{name:'SATURN',id:'saturn',km:120536,H:-8.9,col:'#ead8a0',fill:.37},ur:{name:'URANUS',id:'uranus',km:51118,H:-7.2,col:'#bfe4ec',fill:.8},ne:{name:'NEPTUNE',id:'neptune',km:49528,H:-6.9,col:'#7f9ff0',fill:.84}};   // fill: how much of its photo the disc spans
  const helio=(k,T)=>{ const q=EL[k], a=q[0]+q[1]*T, e=q[2]+q[3]*T, I=q[4]+q[5]*T, L=q[6]+q[7]*T, wb=q[8]+q[9]*T, O=q[10]+q[11]*T, w=wb-O, Mr=s180(L-wb)*D2R; let E=Mr+e*Math.sin(Mr);
    for(let i=0;i<8;i++)E-=(E-e*Math.sin(E)-Mr)/(1-e*Math.cos(E)); const xp=a*(Math.cos(E)-e), yp=a*Math.sqrt(1-e*e)*Math.sin(E), cw=cs(w), sw=sn(w), cO=cs(O), sO=sn(O), cI=cs(I), sI=sn(I);
    return [(cw*cO-sw*sO*cI)*xp+(-sw*cO-cw*sO*cI)*yp,(cw*sO+sw*cO*cI)*xp+(-sw*sO+cw*cO*cI)*yp,(sw*sI)*xp+(cw*sI)*yp]; };
  const toEq=(x,y,z)=>{ const ye=y*cs(EPS)-z*sn(EPS), ze=y*sn(EPS)+z*cs(EPS), r=Math.hypot(x,ye,ze); return {ra:nrm(Math.atan2(ye,x)*R2D),dec:Math.asin(ze/r)*R2D,r}; };
  // where a body is (J2000 right ascension and declination, degrees), how far (AU), its size (degrees), its phase angle and brightness
  const where=(k,jd)=>{ const T=(jd-2451545)/36525, E=helio('em',T);
    if(k==='sun'){ const q=toEq(-E[0],-E[1],-E[2]); return {...q,k,deg:BODY.sun.km/(q.r*149597870.7)*R2D,i:0,mag:-26.7}; }
    if(k==='moon'){ const l=218.32+481267.881*T+6.29*sn(135+477198.87*T)-1.27*sn(259.3-413335.36*T)+.66*sn(235.7+890534.22*T)+.21*sn(269.9+954397.74*T)-.19*sn(357.5+35999.05*T)-.11*sn(186.5+966404.03*T)-1.3969713*T;
      const b=5.13*sn(93.3+483202.02*T)+.28*sn(228.2+960400.89*T)-.28*sn(318.3+6003.15*T)-.17*sn(217.6-407332.21*T), p=.9508+.0518*cs(135+477198.87*T)+.0095*cs(259.3-413335.36*T)+.0078*cs(235.7+890534.22*T)+.0028*cs(269.9+954397.74*T);
      const q=toEq(cs(b)*cs(l),cs(b)*sn(l),sn(b)), km=6378.14/sn(p), S=where('sun',jd), el=Math.acos(cl(sn(q.dec)*sn(S.dec)+cs(q.dec)*cs(S.dec)*cs(q.ra-S.ra),-1,1))*R2D;
      return {ra:q.ra,dec:q.dec,r:km/149597870.7,k,deg:BODY.moon.km/km*R2D,par:p,i:180-el,mag:-12.7+.026*(180-el)+4e-9*Math.pow(180-el,4)}; }
    const P=helio(k,T), g=[P[0]-E[0],P[1]-E[1],P[2]-E[2]], q=toEq(...g), rp=Math.hypot(...P), re=Math.hypot(...E), ci=cl((rp*rp+q.r*q.r-re*re)/(2*rp*q.r),-1,1);
    return {...q,k,deg:BODY[k].km/(q.r*149597870.7)*R2D,i:Math.acos(ci)*R2D,mag:BODY[k].H+5*Math.log10(rp*q.r)}; };
  // how far Saturn's rings are tipped toward us (degrees; 0 edge on, 27 wide open)
  const ring=(jd,g)=>{ if(!g){ const T=(jd-2451545)/36525, E=helio('em',T), P=helio('sa',T); g=[P[0]-E[0],P[1]-E[1],P[2]-E[2]]; } const lam=Math.atan2(g[1],g[0])*R2D, bet=Math.atan2(g[2],Math.hypot(g[0],g[1]))*R2D; return Math.asin(cl(sn(28.06)*cs(bet)*sn(lam-169.5)-cs(28.06)*sn(bet),-1,1))*R2D; };
  const galilean=jd=>{ const d=jd-2451545, V=172.74+.00111588*d, M=357.529+.9856003*d, N=20.02+.0830853*d+.329*sn(V), J=66.115+.9025179*d-.329*sn(V), A=1.915*sn(M)+.02*sn(2*M), B=5.555*sn(N)+.168*sn(2*N), K=J+A-B,
    R=1.00014-.01671*cs(M)-.00014*cs(2*M), r=5.20872-.25208*cs(N)-.00611*cs(2*N), D=Math.sqrt(r*r+R*R-2*r*R*cs(K)), psi=Math.asin(R/D*sn(K))*R2D, t=d-D/173;
    return [['IO',163.8069+203.4058646*t,5.9057],['EUROPA',358.414+101.2916335*t,9.3966],['GANYMEDE',5.7176+50.234518*t,14.9883],['CALLISTO',224.8092+21.48798*t,26.3627]].map(([n,u,a])=>({n,x:a*sn(u+psi-B),front:cs(u+psi-B)>0})); };   // x in Jupiter's radii, west positive
  const gmst=jd=>nrm(280.46061837+360.98564736629*(jd-2451545)), lst=jd=>nrm(gmst(jd)+LON);
  // horizon coordinates (alt, az from north through east) of a sky position, and back
  const eq2hor=(ra,dec,l)=>{ const H=l-ra, alt=Math.asin(cl(sn(LAT)*sn(dec)+cs(LAT)*cs(dec)*cs(H),-1,1))*R2D, az=nrm(Math.atan2(-cs(dec)*sn(H),sn(dec)*cs(LAT)-cs(dec)*cs(H)*sn(LAT))*R2D); return {alt,az}; };
  const hor2eq=(alt,az,l)=>{ const dec=Math.asin(cl(sn(alt)*sn(LAT)+cs(alt)*cs(LAT)*cs(az),-1,1))*R2D, H=Math.atan2(-sn(az)*cs(alt),sn(alt)*cs(LAT)-cs(alt)*sn(LAT)*cs(az))*R2D; return {ra:nrm(l-H),dec}; };
  // a body from where you stand: its height and bearing (the Moon from the ground, not the Earth's centre)
  const seen=(k,jd)=>{ const q=where(k,jd), h=eq2hor(q.ra,q.dec,lst(jd)); if(k==='moon')h.alt-=q.par*cs(h.alt); return {...q,...h}; };
  // the Earth's shadow on the Moon: how far the Moon's centre is from the shadow's (degrees), the umbra's and penumbra's radius, the Moon's, which way the shadow's centre lies (ra, dec), and how much of the Moon is in the umbra (0 none, 1 or more total)
  const shadow=jd=>{ const m=where('moon',jd), s=where('sun',jd), ra=nrm(s.ra+180), dec=-s.dec, sep=Math.acos(cl(sn(m.dec)*sn(dec)+cs(m.dec)*cs(dec)*cs(m.ra-ra),-1,1))*R2D, rm=m.deg/2, um=1.02*(.99834*m.par-s.deg/2+.0024), pe=1.02*(.99834*m.par+s.deg/2+.0024);
    return {sep,um,pe,rm,ra,dec,mag:(um+rm-sep)/(2*rm)}; };
  // meteor showers (IMO's calendar): name, month, day, RA, Dec, ZHR, km/s, days before and after
  const SHW=[['QUADRANTIDS',1,3,230,49,80,41,-6,9],['LYRIDS',4,22,271,34,18,49,-8,8],['ETA AQUARIIDS',5,6,338,-1,50,66,-17,22],['S. DELTA AQUARIIDS',7,30,340,-16,25,41,-18,24],['PERSEIDS',8,12,48,58,100,59,-26,12],
    ['DRACONIDS',10,8,262,54,5,20,-2,2],['S. TAURIDS',10,10,32,9,5,27,-30,41],['ORIONIDS',10,21,95,16,20,66,-19,17],['N. TAURIDS',11,12,58,22,5,29,-23,28],['LEONIDS',11,17,152,22,15,71,-11,13],['GEMINIDS',12,14,112,33,150,35,-10,6],['URSIDS',12,22,217,76,10,33,-5,4]];
  const msOf=jd=>(jd-2440587.5)*864e5;
  const showers=jd=>{ const y=new Date(msOf(jd)).getUTCFullYear(), out=[];
    for(const [nm,mo,dy,ra,dec,zhr,v,b,a] of SHW)for(const yy of [y-1,y,y+1]){ const pk=Date.UTC(yy,mo-1,dy,12)/864e5+2440587.5, dd=jd-pk; if(dd<b||dd>a)continue; const w=Math.max(.7,(a-b)/10); out.push({nm,ra,dec,zhr:zhr*Math.exp(-Math.abs(dd)/w),v,pk}); }
    return out; };
  // meteors seen by one person over the whole sky an hour: ZHR × the radiant's height × the sky's darkness (population index 2.2), and about 8 sporadic ones
  const rate=(jd,lim=6.5)=>{ const l=lst(jd), su=where('sun',jd); if(eq2hor(su.ra,su.dec,l).alt>-12)return {all:0,list:[]}; const f=Math.pow(2.2,Math.min(6.5,lim)-6.5), list=[];
    for(const s of showers(jd)){ const h=eq2hor(s.ra,s.dec,l).alt; if(h>0)list.push({...s,hr:s.zhr*sn(h)*f}); } list.push({nm:'SPORADIC',hr:8*f,v:40}); return {all:list.reduce((a,s)=>a+s.hr,0),list}; };
  Object.assign(EPH,{where,seen,gmst,eq2hor,hor2eq,lst,LAT,LON,BODY,toEq,helio,EPS,galilean,ring,shadow,SHW,showers,rate,msOf,jdOf:ms=>ms/864e5+2440587.5}); window.EPH=EPH; }
export {EPH};
