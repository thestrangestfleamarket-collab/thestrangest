// THE OCTOPUS BODY: octBody builds the drumming octopus, its colours and its arms.
import {E} from './124-singer.js';
const OCTP={b:[150,88,196],B:[104,58,142],m:[214,176,236],M:[124,70,166],k:[18,16,22],w:[236,236,250],s:[218,184,124],h:[52,54,62],H:[76,78,88],e:[18,16,22],
  c:[92,58,34],C:[132,86,50],E:[255,120,40],a:[150,146,140],g:[196,212,220],G:[236,244,248],q:[70,130,176],Q:[150,200,228],r:[206,60,40],R:[236,196,64],y:[176,132,80]};
const OCTSEAT=13;
const OCTS=1.25;
function octArm(L,r,t,bw,r0=3,r1=1,n=11,g=40){ '@later'; const P=u=>{ const a=(1-u)*(1-u), b=2*u*(1-u), c=u*u; return [a*r[0]+b*bw[0]+c*t[0],a*r[1]+b*bw[1]+c*t[1],a*r[2]+b*bw[2]+c*t[2]]; };
  for(let i=0;i<n;i++){ const u0=i/n, u1=(i+1)/n, p=P(u0), q=P(u1), dx=q[0]-p[0], dy=q[1]-p[1], dz=q[2]-p[2], len=Math.hypot(dx,dy,dz)||1, rad=r0+(r1-r0)*(i+.5)/n;
    const yaw=Math.atan2(dy,dx), pit=Math.atan2(dz,Math.hypot(dx,dy));
    L.push(E((p[0]+q[0])/2,(p[1]+q[1])/2,(p[2]+q[2])/2,len/2+rad*.55,rad,rad,(x,y,z)=>z<-.35?'m':'b',yaw,pit,0,g)); }
  const a=P(.94), b=P(1); return [b[0]-a[0],b[1]-a[1],b[2]-a[2]]; }
function octStick(L,t,aim){ const dx=aim[0]-t[0], dy=aim[1]-t[1], dz=aim[2]-t[2], l=Math.hypot(dx,dy,dz)||1, k=8/l;
  L.push(E(t[0]+dx*k,t[1]+dy*k,t[2]+dz*k,8,.75,.75,'s',Math.atan2(dy,dx),Math.atan2(dz,Math.hypot(dx,dy)),0,50)); }
function octBody(A){ '@later'; const L=[], D=[], z0=OCTSEAT, nod=A.nod||0;
  const root=a=>[Math.cos(a)*4.3*OCTS,Math.sin(a)*4.3*OCTS,z0+5*OCTS];
  let ai=0; const arm=(a,tip,bow,r0,r1)=>octArm(L,root(a),tip,bow,r0*OCTS,r1*OCTS,11,40+ai++);
  const sw=A.sway||0, w=k=>Math.sin(sw*Math.PI*2+k)*2;
  if(A.XA){ arm(2.2,A.XA[0],[6,14,z0+11],2.8,1.1); octStick(L,A.XA[0],A.XA[1]); } else arm(2.2,[-4+w(0),15,1],[-1,13,z0-2],2.8,.9);
  if(A.XB){ arm(-2.2,A.XB[0],[6,-14,z0+11],2.8,1.1); octStick(L,A.XB[0],A.XB[1]); } else arm(-2.2,[-4+w(1),-15,1],[-1,-13,z0-2],2.8,.9);
  const cg=A.CG||[1,15,z0+9]; arm(2.8,cg,[-6,15,z0+2],2.8,1);
  { const a=A.CGA||[1,-.2,.15], l=Math.hypot(...a), u=[a[0]/l,a[1]/l,a[2]/l], yaw=Math.atan2(u[1],u[0]), pit=Math.atan2(u[2],Math.hypot(u[0],u[1]));
    L.push(E(cg[0]+u[0]*3.4,cg[1]+u[1]*3.4,cg[2]+u[2]*3.4,4.4,1.15,1.15,(x,y,z)=>x>.82?(x>.93?'E':'a'):x>.25&&x<.4?'C':'c',yaw,pit,0,62)); }
  const gl=A.GL||[1,-15,z0+7], gp=A.GLP||0, lev=A.LEV??.8, sl=A.SL||0; arm(-2.8,gl,[-6,-15,z0+2],2.8,1);
  { const rx=2.3, rz=3.5, cp=Math.cos(gp), sp=Math.sin(gp);
    L.push(E(gl[0]+2.2,gl[1],gl[2]+3,rx,rx,rz,(x,y,z)=>{ if(z>.9)return 'G'; const X=x*rx, Z=z*rz, xw=X*cp-Z*sp, zw=X*sp+Z*cp, top=-rz+2*rz*lev+sl*xw; return zw<top-.5?'q':zw<top+.15&&lev>.02?'Q':'g'; },0,gp,0,63)); }
  arm(-.55,A.RF,[8,-4,z0-1],2.9,1.1); arm(.55,A.LF,[8,6,z0-1],2.9,1.1);
  const [lt,la]=A.LS, [rt,ra]=A.RS;
  arm(1.1,lt,[7,10,z0+14],3,1.2); octStick(L,lt,la); arm(-1.1,rt,[7,-10,z0+14],3,1.2); octStick(L,rt,ra);
  const hz=z0+10*OCTS+nod*.6, K=OCTS;
  L.push(E(1.3*K,0,hz,6.4*K,7.2*K,5.5*K,'b',0,0,0,42));
  L.push(E(-2.6*K,0,hz+9.4*K,7.7*K,8.1*K,10.6*K,'b',0,-.32+nod*.04,0,42));
  const rib=(x,y,z)=>{ const a=Math.atan2(y,x); return Math.floor((a+Math.PI)/(Math.PI*2)*28)%2?'h':'H'; };
  L.push(E(-3.6*K,0,hz+14.3*K,7.9*K,8.3*K,7*K,rib,0,-.32,0,43)); L.push(E(-2.9*K,0,hz+11.4*K,8.1*K,8.5*K,2.3*K,'H',0,-.32,0,44));
  L.push(E(4.8*K,0,hz+1.2*K,2.8*K,7.2*K,2.1*K,'k',0,0,0,45));
  D.push([7.4*K,3.1*K,hz+1.9*K,'w'],[7.4*K,-3.8*K,hz+1.9*K,'w']);
  D.push([3.4*K,4.7*K,hz+12*K,'M'],[3.8*K,-2.6*K,hz+15*K,'M'],[2.4*K,.9*K,hz+18*K,'M']);
  return {E:L,D}; }
export {octBody, OCTP, OCTS, OCTSEAT};
