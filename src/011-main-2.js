{
  const hash=(a,b,c=0)=>{ let h=(a*374761393+b*668265263+c*2147483647)|0; h=(h^(h>>>13))*1274126177|0; return ((h^(h>>>16))>>>0)/4294967296; };
  const sh=(c,f)=>[Math.min(255,c[0]*f),Math.min(255,c[1]*f),Math.min(255,c[2]*f)], mt=(k,c)=>c, UH=98, ROT=0; let PNAME='';
  const concreteCol=(x,z)=>{ const n=hash(Math.floor(x*24),Math.floor(z*24),97), c=[124,122,116]; return n<.3?sh(c,.93):n>.85?sh(c,1.05):c; };
  const prop=(boxes,_,o)=>({boxes,...o}), sided=b=>b;
