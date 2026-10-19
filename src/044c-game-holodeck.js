{
const HOLOK=[14,16,22], HOLOL=Object.assign([96,200,255],{e:1}), HOLOM=Object.assign([40,92,132],{e:1});
const holoLine=(a,b,w)=>{ const fa=a-Math.floor(a), fb=b-Math.floor(b); return fa<w||fa>1-w||fb<w||fb>1-w; };
function holoFloor(x,y){ if(holoLine(x,y,.025))return (Math.floor(x+.5)+Math.floor(y+.5))%4?HOLOM:HOLOL; return mt('holodeck',sh(HOLOK,1+.06*hash(Math.floor(x),Math.floor(y),601))); }
const holoWall=f=>(u,z)=>{ const a=u-Math.floor(u); return a<.025||a>.975||(z%24+24)%24<1?HOLOL:sh(HOLOK,f); };
STOREK.holo={HOLOK,HOLOL,HOLOM,holoFloor,holoWall};
}
