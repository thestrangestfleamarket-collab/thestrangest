const KPP={ash:[[138,130,116],[150,142,126],[144,138,128],[158,148,130],[132,126,116]],mortar:[104,98,88],trim:[184,174,150],trimD:[160,150,128],dark:[16,14,18],
  moss:[74,92,52],mossD:[56,74,44],mould:[96,100,84],lichen:[156,152,112],lead:[96,104,110],leadL:[112,120,126]};
function castleStone(u,z,seed){ const j=Math.floor(z/12), zz=z-j*12, L=20+Math.floor(hash(j,1,seed)*15), o=hash(j,0,seed)*L, k=Math.floor((u+o)/L), uu=(u+o)-k*L;
  if(zz<1||uu<1)return KPP.mortar;
  let c=KPP.ash[Math.floor(hash(j,k,seed+1)*5)]; if(zz>=11)c=sh(c,1.08); else if(zz<2)c=sh(c,.9);
  const g=hash(Math.floor(u),Math.floor(z),seed+2); if(g<.06)c=sh(c,.88); else if(g>.97)c=sh(c,1.07); return c; }
function castleWeather(c,u,z,seed){ const s=cvNoise(u/9,z/150,seed+7); if(s>.64)c=sh(c,1-(s-.64)*.9);
  if(hash(Math.floor(u/2),Math.floor(z/2),seed+8)<.004)return KPP.lichen;
  if(z<30){ const p=(30-z)/30, n=hash(Math.floor(u/2),Math.floor(z/2),seed+9); if(n<p*p*.5)return n<p*.1?KPP.moss:KPP.mossD; if(n>1-p*.15)return KPP.mould; c=sh(c,1-p*.22); }
  return c; }
function castleArch(du,z,zs,r,P){ const a=Math.abs(du), w=6;
  if(z>=zs){ const d=Math.hypot(du,z-zs); if(d<r)return P.dark; if(d>=r+w)return null; const t=Math.atan2(z-zs,du)/(Math.PI/9), k=Math.floor(t); return t-k<.1||d>=r+w-1?P.mortar:k&1?P.a:P.b; }
  if(a>=r&&a<r+w){ const j=Math.floor(z/12); return z-j*12<1?P.mortar:(j&1)?P.a:P.b; }
  return null; }
const KARCH={out:{dark:KPP.dark,mortar:KPP.mortar,a:KPP.trim,b:KPP.trimD},in:{dark:DGP.dark,mortar:DGP.mo,a:DGP.hi,b:DGP.st[1]}};
