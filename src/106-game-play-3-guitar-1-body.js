
if(typeof KIT!=='undefined')for(const th of KIT.things)UI.thing(th);

const CAST={}, PLAY221={seeking:false,pre:0}, PLAYA={}, GTPHYS={model:false,ok:false}, SND={ctx:null,on:true,out:null}, GTWR={R:[-3.22,3.15,2.06]};

const GT=(()=>{ const {V,add,sub,mul,nrm,cross,dot,rcone,ell,box,D}=RIG;
  const S=19.32, U=0.03365, fy=k=>S*Math.pow(2,-k/12);
  const spc=y=>0.25+0.095*(1-y/S), sx=(i,y)=>(3.5-i)*spc(y), sz=y=>0.27+0.18*(1-y/S);
  const YB0=-4.75, YB1=fy(12), SH=5.2, SR=1.26, YP=3.4, YS=5.0, FB=0.2, YF=fy(19);
  const nw=y=>0.77+0.15*Math.min(1,Math.max(0,(S-y)/(S-YB1)));
  const elD=(x,y,cx,cy,rx,ry)=>{ const qx=(x-cx)/rx, qy=(y-cy)/ry, k=Math.hypot(qx,qy); return (k-1)*Math.min(rx,ry); };
  const smin=(a,b,k)=>{ const h=Math.max(0,Math.min(1,0.5+0.5*(b-a)/k)); return b+(a-b)*h-k*h*(1-h); };
  const out2=(x,y)=>smin(elD(x,y,0,-0.65,5.5,4.1),elD(x,y,0,6.66,4.16,3.0),1.4);
  const dep=y=>2.9-0.15*Math.max(0,Math.min(1,(y-YB0)/(YB1-YB0)));
  const slot=p=>Math.max(Math.abs(Math.abs(p.x)-0.42)-0.2,Math.abs(p.y-(S+2.7))-1.8);
  const TW=0.08, hole=p=>Math.max(Math.hypot(p.x,p.y-SH)-SR,Math.abs(p.z+TW/2)-TW), inner=p=>Math.max(out2(p.x,p.y)+TW,p.z+TW,-p.z-dep(p.y)+TW);
  const brace=(p,a,b,w)=>rcone(p,V(a[0],a[1],-TW-w),V(b[0],b[1],-TW-w),w,w*0.8), BRACES=[[[0,SH-1.3],[-2.6,-3.6]],[[0,SH-1.3],[-1.3,-4.0]],[[0,SH-1.3],[0,-4.2]],[[0,SH-1.3],[1.3,-4.0]],[[0,SH-1.3],[2.6,-3.6]],[[-2.2,SH-2.2],[-3.4,-1.8]],[[2.2,SH-2.2],[3.4,-1.8]]];
  const bars=p=>Math.min(rcone(p,V(-4.2,SH+1.6,-TW-0.16),V(4.2,SH+1.6,-TW-0.16),0.16,0.16),rcone(p,V(-4.4,SH-1.75,-TW-0.16),V(4.4,SH-1.75,-TW-0.16),0.16,0.16),box(p,V(0,YB1-0.4,-1.3),V(1.7,0.9,1.25)));
  function shape(p,solid){ let b=Math.max(out2(p.x,p.y)+0.15,p.z+0.15,-p.z-dep(p.y)+0.15)-0.15;
    if(!solid){ b=Math.max(b,-inner(p)); b=Math.max(b,-hole(p)); b=Math.min(b,bars(p)); for(const [a,c] of BRACES)b=Math.min(b,brace(p,a,c,0.12)); }
    const yn=Math.max(YB1-0.6,Math.min(S,p.y)), w=nw(yn);
    const fb=Math.max(Math.abs(p.x)-nw(Math.max(YF,Math.min(S,p.y))),box(p,V(0,(YF+S)/2,FB/2+0.02),V(9,(S-YF)/2,FB/2)));
    const nk=Math.max(Math.max(ell(V(p.x,0,p.z),V(0,0,0.05),V(w,1,0.68)),p.z-0.05),Math.abs(p.y-(YB1-0.6+S)/2)-(S-YB1+0.6)/2);
    const hy=p.y-S, hz=0.1-hy*0.21, hw=0.98+Math.min(1,Math.max(0,hy/5.6))*0.14;
    const hd=Math.max(Math.max(Math.abs(p.x)-hw,Math.abs(p.z-hz)-0.25),Math.max(-hy-0.05,hy-5.6),-slot(p));
    let tn=1e9; for(const s of [1,-1])for(const k of [1.4,2.7,4.0])tn=Math.min(tn,rcone(p,V(s*hw,S+k,0.1-k*0.21),V(s*(hw+0.5),S+k,0.1-k*0.21),0.16,0.3));
    const br=box(p,V(0,-0.25,0.14),V(2.6,0.55,0.14)), tie=box(p,V(0,-0.62,0.2),V(1.45,0.2,0.2)), sd=box(p,V(0,0,0.36),V(1.35,0.05,0.1)), nut=box(p,V(0,S+0.08,0.2),V(nw(S),0.08,0.13));
    return Math.min(b,fb,nk,hd,tn,br,tie,sd,nut); }
  function paint(p){ const top=p.z>-0.1&&p.z<0.12, r=Math.hypot(p.x,p.y-SH), o=out2(p.x,p.y);
    if(p.y>S+0.16&&p.y<S+6)return Math.abs(p.x)>1.15?'tuner':p.z>0.1-(p.y-S)*0.21+0.15?'rose':'wood';
    if(Math.abs(p.y)<0.07&&p.z>0.26||p.y>S-0.02&&p.y<S+0.18&&p.z>0.15)return 'linen';
    if(p.z>0.04&&p.y>YF-0.02&&p.y<S&&Math.abs(p.x)<nw(p.y)+0.02)return 'rose';
    if(Math.abs(p.y+0.62)<0.21&&Math.abs(p.x)<1.47&&p.z>0.02)return Math.abs(p.z-0.2)<0.05?'linen':'rose';
    if(Math.abs(p.y+0.25)<0.57&&Math.abs(p.x)<2.62&&p.z>0.02)return 'pewter';
    if(p.z<-TW*0.9&&p.z>-dep(p.y)+TW*1.5&&o<0)return r<SR+0.6&&p.z>-0.6?'spruce':'wood';
    if(top&&o<0){ if(r<SR+0.5){ const a=Math.atan2(p.x,p.y-SH), ring=Math.floor((r-SR)*10); return ring==1||ring==3?((Math.floor(a*10/Math.PI)&1)?'rose':'linen'):ring==2?'wood':'rose'; }
      if(o>-0.14)return 'linen'; return 'spruce'; }
    return 'wood'; }
  const PIECE={n:'guitar',on:'prop',m:'spruce',d:shape,paint,bb:[-6,6,-5.3,S+6.2,-3.4,1]};
  return {S,U,fy,sx,sz,spc,YP,YS,SH,SR,FB,PIECE,SOLID:p=>shape(p,true),mid:k=>k?fy(k)+0.3*(fy(k-1)-fy(k)):fy(0)-0.4}; })();

const GTSTR=(()=>{ const IN=0.0254, L0=GT.S*GT.U;
  return [[0.028,1140,329.63],[0.0325,1140,246.94],[0.040,1140,196.00],[0.029,4500,146.83],[0.035,5500,110.00],[0.043,6500,82.41]].map(([g,rho,f])=>{
    const d=g*IN, mu=rho*Math.PI*d*d/4; return {g,mu,T:mu*(2*L0*f)**2,f}; }); })();
const GTOPEN=[64,59,55,50,45,40];
const gtHz=(s,k)=>{ const q=GTSTR[s-1]; return Math.sqrt(q.T/q.mu)/(2*GT.S*Math.pow(2,-k/12)*GT.U); };
const GTA={buf:null,busy:false,failed:0,ok:false,g:null,pan:null,at:{},on:[null,null,null,null,null,null]};
function gtAudio(){ return false; }
function gtMute(s,when,T){ if(GTPHYS.model&&GTPHYS.ok)gtPhysMute(s,when,0.25); const v=GTA.on[s-1]; if(!v)return; GTA.on[s-1]=null; v.g.gain.setTargetAtTime(0,Math.max(when,v.when),T/3); try{ v.src.stop(Math.max(when,v.when)+T*5); }catch(e){} }
function gtPlay(s,k,when,amp,tone,r){ if(GTPHYS.model&&gtPhys()){ gtMute(s,when,0.012); gtPhysPluck(s,k,when,amp,gtBright(tone),(r==='s'?GT.YS:r&&GTYP[GTRH[r]]||GT.YP)/GT.S); return; }
  const c=SND.ctx, m=GTOPEN[s-1]+k; let q=GTSAMP[0]; for(const x of GTSAMP)if(Math.abs(x[0]-m)<Math.abs(q[0]-m))q=x; const A=GTA.at[q[0]]; if(!A)return;
  gtMute(s,when,0.012);
  const src=c.createBufferSource(), f=c.createBiquadFilter(), g=c.createGain(); src.buffer=GTA.buf; src.playbackRate.value=gtHz(s,k)/A.hz; f.type='lowpass'; f.frequency.value=tone; f.Q.value=0.5;
  g.gain.value=amp; src.connect(f); f.connect(g); g.connect(GTA.g); src.start(when,A.t,A.L); GTA.on[s-1]={src,g,when}; }

