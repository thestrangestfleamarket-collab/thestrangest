// THE MUSIC ENGINE: IMX, the sound engine that plays plucked strings and the instruments.
import {GTSAMP, IMK, SFX, SND} from './003b-systems.js';
import {GTA, gtAudio} from './106-game-play-3-guitar-1-body.js';
import {IMSAMPS} from './118-game-music-1b-samples-data.js';
const IMX={ok:false,busy:false,failed:0,nodes:new Map(),out:null,src:`
const TAU=2*Math.PI;
const clip=x=>x<-1?-1:x>1?1:x;
function mkStr(){ return {d:new Float32Array(4096),i:0,len:100,M:100,C:0,fd:0,lp:0,ap:0,apc:0,g:.996,a:.5,mute:1,mt:1,on:false,q:0,env:0,pk:0,last:0}; }
function setLen(S,hz,sr){ const w=TAU*hz/sr, b=1-S.a, dl=Math.atan2(b*Math.sin(w),1-b*Math.cos(w))/w, a=S.ap, da=a?-(Math.atan2(-Math.sin(w),a+Math.cos(w))-Math.atan2(-a*Math.sin(w),1+a*Math.cos(w)))/w:0;
  S.len=Math.max(4,Math.min(4000,sr/hz-dl-da)); S.M=Math.floor(S.len); const f=S.len-S.M; S.C=(1-f)/(1+f); }
function pluck(S,pos,amp,bright){ const N=Math.min(4095,Math.round(S.len)); let acc=0;
  for(let j=0;j<N;j++){ const u=j/N, tri=u<pos?u/pos:(1-u)/(1-pos); let v=tri*amp; if(bright<0.95){ acc+=(v-acc)*(0.2+0.75*bright); v=acc; } S.d[(S.i-j+4096*4)&4095]=v; }
  S.lp=0; S.apc=0; S.fd=0; S.mute=1; S.mt=1; S.on=true; S.q=0; }
function mkRes(f,t60,w,sr){ const r=Math.pow(10,-3/(t60*sr)), o=TAU*f/sr; return {c:2*r*Math.cos(o),r2:r*r,k:(1-r)*Math.hypot(1-r*Math.cos(2*o),r*Math.sin(2*o)),w,y1:0,y2:0}; }
function J(m,x){ let s=0, t=Math.pow(x/2,m); for(let k=1;k<=m;k++)t/=k; for(let k=0;k<30;k++){ s+=t; t*=-(x*x/4)/((k+1)*(k+1+m)); if(Math.abs(t)<1e-9)break; } return s; }
class Imx extends AudioWorkletProcessor{
  constructor(o){ super(); const p=this.p=o.processorOptions||{}; const sr=sampleRate; this.fam=p.fam; this.ev=(p.ev||[]).slice().sort((a,b)=>a.t-b.t); this.quiet=0; this.post=0; this.noise=12345;
    this.S=[]; const n=p.n||6; for(let i=0;i<n*(p.pair?2:1);i++)this.S.push(mkStr());
    this.body=(p.body||[]).map(([f,t,w])=>mkRes(f,t,w,sr)); this.fb=0;
    this.hp=0; this.hpx=0; this.lp1=0; this.lp2=0;
    this.V=[];
    this.bow=[]; for(let i=0;i<(p.fam==='bow'?n:0);i++)this.bow.push({nk:new Float32Array(4096),br:new Float32Array(4096),i:0,ln:100,lb:20,v:0,f:0,tv:0,tf:0,lp:0,on:false,hz:200,beta:.127,out:0,pz:mkStr()});
    this.pipe=p.fam==='pipe'?{S:mkStr(),pr:0,tp:0,hz:440,on:false,vib:0,lp2:0,dx:0,dy:0}:null;
    this.port.onmessage=e=>{ const m=e.data; if(m.ev){ for(const q of m.ev)this.ev.push(q); this.ev.sort((a,b)=>a.t-b.t); } };
    this.shape=new Float32Array(Math.max(1,this.S.length+this.bow.length+40)); }
  rnd(){ this.noise=(this.noise*1103515245+12345)&0x7fffffff; return this.noise/0x3fffffff-1; }
  take(q){ const sr=sampleRate, p=this.p;
    if(q.k==='pluck'){ const ss=p.pair?[q.s*2,q.s*2+1]:[q.s]; ss.forEach((i,j)=>{ const S=this.S[i]; S.g=q.g; S.a=q.a; S.ap=q.ap||0; setLen(S,q.hz*(j?Math.pow(2,(p.pair||0)/1200):1),sr); pluck(S,q.pos,q.amp*(p.pair?.7:1),q.bright); }); }
    else if(q.k==='stop'){ const ss=p.pair?[q.s*2,q.s*2+1]:[q.s]; ss.forEach((i,j)=>setLen(this.S[i],q.hz*(j?Math.pow(2,(p.pair||0)/1200):1),sr)); }
    else if(q.k==='mute'){ const ss=p.pair?[q.s*2,q.s*2+1]:[q.s]; for(const i of ss)this.S[i].mt=q.v; }
    else if(q.k==='bow'){ const B=this.bow[q.s]; if(!B)return; if(q.hz){ B.hz=q.hz; const w=TAU*q.hz/sr, dl=Math.atan2(.45*Math.sin(w),1-.45*Math.cos(w))/w, L=sr/q.hz-dl-1.9; B.lb=L*B.beta; B.ln=L-B.lb; } B.tv=q.v; B.tf=q.f; if(q.v>0)B.on=true; }
    else if(q.k==='pz'){ const B=this.bow[q.s]; if(!B)return; const S=B.pz; S.g=Math.pow(10,-3/(1.2*q.hz)); S.a=.45; setLen(S,q.hz,sr); pluck(S,.18,q.amp,.6); }
    else if(q.k==='blow'){ const P=this.pipe; if(!P)return; if(q.hz){ P.hz=q.hz; const S=P.S; S.a=p.pole||.6; S.ap=0; setLen(S,q.hz*Math.pow(2,-(p.tune||0)/1200),sr); S.on=true; }
      P.tp=q.pr; if(q.pr>0)P.on=true; }
    else if(q.k==='hit'){ if(q.ch!=null)for(const v of this.V)if(v.ch===q.ch)v.choke=true;
      const v={ch:q.ch,choke:false,m:q.modes.map(([f,t,a])=>{ if(f>=sr*.45)return null; const r=Math.pow(10,-3/(t*sr)), o=TAU*f/sr; return {c:2*r*Math.cos(o),r2:r*r,y1:a*Math.sin(o),y2:0,a}; }).filter(Boolean),
        n:q.noise?{a:q.noise[0],r:Math.pow(10,-3/(q.noise[1]*sr)),e:1,lo:Math.exp(-TAU*q.noise[2]/sr),hi:Math.exp(-TAU*q.noise[3]/sr),l1:0,l2:0}:null,id:q.id,age:0};
      this.V.push(v); if(this.V.length>(p.poly||24))this.V.shift(); }
    else if(q.k==='damp'){ const r=Math.pow(10,-3/(Math.max(.02,q.T||.15)*sr)); for(const v of this.V)if(v.id===q.id&&!v.choke){ v.choke=true; v.ck=r; } } }
  process(ins,outs){ const o=outs[0][0], n=o.length, sr=sampleRate, p=this.p; let ev=this.ev;
    const busy=this.S.some(S=>S.on)||this.V.length||this.bow.some(B=>B.on||B.pz.on)||(this.pipe&&this.pipe.on);
    if(!busy&&(!ev.length||ev[0].t>currentTime+n/sr)){ this.post=0; return true; }
    let peak=0;
    for(let i=0;i<n;i++){ const t=currentTime+i/sr; while(ev.length&&ev[0].t<=t)this.take(ev.shift());
      let bridge=0, out=0; const fb=this.fb;
      for(const S of this.S){ if(!S.on)continue; const d=S.d, x0=d[(S.i-S.M)&4095], x1=d[(S.i-S.M-1)&4095], x=S.C*x0+x1-S.C*S.fd; S.fd=x;
        S.lp+=(x-S.lp)*S.a; let y=S.lp*S.g*S.mute; if(S.ap){ const a=S.ap, z=y; y=S.apc+a*z; S.apc=z-a*y; }
        y+=fb*0.0002; d[S.i&4095]=y; S.i++; if(S.mute>S.mt)S.mute+=(S.mt-S.mute)*0.004; else if(S.mute<1&&S.mt>=1)S.mute+=(1-S.mute)*0.0005;
        let s=y; if(p.pick){ s=y-d[(S.i-1-Math.round(2*p.pick*S.len))&4095]; } bridge+=s; const a=y<0?-y:y; S.env=Math.max(a,S.env*.9995); S.last=y;
        if(a<2e-5)S.q++; else S.q=0; if(S.q>sr)S.on=false; }
      for(const B of this.bow){ B.v+=(B.tv-B.v)*0.0015; B.f+=(B.tf-B.f)*0.0015;
        const pz=B.pz; if(pz.on){ const d=pz.d, x0=d[(pz.i-pz.M)&4095], x1=d[(pz.i-pz.M-1)&4095], x=pz.C*x0+x1-pz.C*pz.fd; pz.fd=x; pz.lp+=(x-pz.lp)*pz.a; const y=pz.lp*pz.g; d[pz.i&4095]=y; pz.i++; bridge+=y*.6; if((y<0?-y:y)<2e-5)pz.q++; else pz.q=0; if(pz.q>sr)pz.on=false; }
        if(!B.on)continue;
        const rd=(buf,L)=>{ const pos=B.i-L, a=Math.floor(pos), f=pos-a; return buf[a&4095]*(1-f)+buf[(a-1)&4095]*f; };
        const nk=rd(B.nk,B.ln), brO=rd(B.br,B.lb); B.lp+=(-brO*.95-B.lp)*.55; const bridgeRefl=B.lp, nutRefl=-nk, sv=bridgeRefl+nutRefl;
        const bowV=B.v*0.25, dv=bowV-sv, slope=5-4*B.f, fr=Math.min(1,Math.pow(Math.abs(dv*slope)+.75,-4)), nv=dv*fr*(B.v>0.002?1:0);
        B.nk[B.i&4095]=bridgeRefl+nv; B.br[B.i&4095]=nutRefl+nv; B.i++; B.out=brO; bridge+=brO*1.4;
        if(B.v<0.002&&B.tv===0&&Math.abs(brO)<1e-5)B.on=false; }
      const P=this.pipe; if(P&&P.on){ P.pr+=(P.tp-P.pr)*(P.tp>P.pr?(p.att||.0012):0.002); P.vib+=TAU*5/sr; const S=P.S, d=S.d;
        const x0=d[(S.i-S.M)&4095], x1=d[(S.i-S.M-1)&4095], x=S.C*x0+x1-S.C*S.fd; S.fd=x; S.lp+=(x-S.lp)*S.a;
        const hz2=S.lp-P.dx+.995*(P.dy||0); P.dx=S.lp; P.dy=hz2;
        const nz=this.rnd()*P.pr*(p.nz||.12), G=.55+P.pr*.8*(1+.004*Math.sin(P.vib)), b=.25, v=(Math.tanh(G*hz2*2+nz+b)-Math.tanh(b))*.5;
        d[S.i&4095]=v; S.i++; P.lp2+=(nz-P.lp2)*.3; out+=hz2*.5+P.lp2*.25;
        if(P.tp===0&&P.pr<1e-3&&Math.abs(S.lp)<1e-5){ P.on=false; S.d.fill(0); S.lp=0; S.fd=0; } }
      for(let k=this.V.length-1;k>=0;k--){ const v=this.V[k]; let s=0; const ck=v.choke?(v.ck||.995):1;
        for(const m of v.m){ const y=m.c*m.y1-m.r2*m.y2; m.y2=m.y1*ck; m.y1=y*ck; s+=y; }
        if(v.n){ const N=v.n; N.e*=N.r*ck; const w=this.rnd()*N.e*N.a; N.l1=N.l1*N.lo+w*(1-N.lo); N.l2=N.l2*N.hi+w*(1-N.hi); s+=N.l2-N.l1; }
        out+=s; v.age++; if((v.age&511)===0){ let e=v.n?v.n.e*v.n.a:0; for(const m of v.m)e+=Math.abs(m.y1)+Math.abs(m.y2); if(e<1e-5||v.age>sr*14)this.V.splice(k,1); } }
      let b=0; for(const m of this.body){ const yy=m.c*m.y1-m.r2*m.y2+bridge*m.k; m.y2=m.y1; m.y1=yy; b+=yy*m.w; } this.fb=b;
      let y=bridge*(p.dry??.22)+b*(p.wet??.5)+out;
      if(p.amp){ const dr=p.amp; y=Math.tanh(y*dr)/Math.tanh(dr)*.5;
        this.hp=.995*(this.hp+y-this.hpx); this.hpx=y; y=this.hp; this.lp1+=(y-this.lp1)*.45; this.lp2+=(this.lp1-this.lp2)*.45; y=this.lp2; }
      y*=p.gain||1; o[i]=clip(y); const ab=o[i]<0?-o[i]:o[i]; if(ab>peak)peak=ab; }
    for(let c=1;c<outs[0].length;c++)outs[0][c].set(o);
    if((this.post+=n)>=sr/15){ this.post=0; const sh=this.shape; let j=0;
      for(const S of this.S)sh[j++]=S.on?S.env:0; for(const B of this.bow)sh[j++]=B.on?Math.min(1,Math.abs(B.out)*8+B.v*.2):B.pz.on?.3:0;
      for(let k=0;k<40&&j<sh.length;k++)sh[j++]=0; let q=this.S.length+this.bow.length; for(const v of this.V)if(v.id!=null&&v.id>=0&&v.id<40&&q+v.id<sh.length){ let e=0; for(const m of v.m)e+=Math.abs(m.y1); sh[q+v.id]=Math.max(sh[q+v.id],e); }
      this.port.postMessage({m:sh.slice(0),pipe:this.pipe?this.pipe.pr:0}); }
    return true; } }
registerProcessor('imx',Imx);`};
function imxReady(){ '@later'; const c=SND.ctx; if(!c||!c.audioWorklet||!SND.on||c.state!=='running')return false; if(IMX.ok||IMX.busy||performance.now()<IMX.failed)return IMX.ok; IMX.busy=true;
  c.audioWorklet.addModule('data:application/javascript,'+encodeURIComponent(IMX.src)).then(()=>{ IMX.ok=true; }).catch(e=>{ console.warn('instruments',e); IMX.failed=performance.now()+10000; }).finally(()=>{ IMX.busy=false; }); return false; }
function imxOut(){ '@later'; const c=SND.ctx; if(IMX.out)return IMX.out; const cv=c.createConvolver(), wet=c.createGain(), dry=c.createGain(), len=Math.floor(c.sampleRate*.8), ir=c.createBuffer(2,len,c.sampleRate);
  for(let ch=0;ch<2;ch++){ const q=ir.getChannelData(ch); for(let i=0;i<len;i++){ const t=i/c.sampleRate; q[i]=(Math.random()*2-1)*Math.exp(-t*13.8/.6)*(t<.005?0:1); } for(const ms of [6,11,17,24,31])q[Math.floor(c.sampleRate*ms/1000)+ch*11]+=.5; }
  cv.buffer=ir; wet.gain.value=.18; dry.gain.value=1; dry.connect(SND.out); dry.connect(cv); cv.connect(wet); wet.connect(SND.out); return IMX.out=dry; }
function imxNode(who,kind){ '@later'; if(!imxReady())return null; const key=who+'|'+kind; let N=IMX.nodes.get(key); if(N){ N.at=performance.now(); return N; }
  const I=IMK[kind], c=SND.ctx; if(!I)return null; const node=new AudioWorkletNode(c,'imx',{outputChannelCount:[1],processorOptions:I.dsp}), dry=c.createGain(), g=c.createGain(), pan=SFX.spot(c,true); pan.to();
  g.gain.value=who==='me'?1:0; node.connect(dry); dry.connect(g); g.connect(pan); pan.connect(imxOut());
  N={who,kind,node,dry,g,pan,at:performance.now(),motion:null,pipe:0,on:[]}; node.port.onmessage=e=>{ N.motion=e.data.m; N.pipe=e.data.pipe; }; IMX.nodes.set(key,N); imsLoad(kind); return N; }
function imxSend(N,evs){ if(!N)return; const t0=SND.ctx.currentTime+.02; N.node.port.postMessage({ev:evs.map(e=>({...e,t:t0+(e.dt||0)}))}); N.at=performance.now(); imxRec(N,evs,t0); }
const IMSAMP={'classical guitar':{gain:.62},'steel-string guitar':{gain:1.4},'electric guitar':{gain:4.3},'bass guitar':{gain:2}};
function imsLoad(kind){ '@later'; const S=IMSAMP[kind]; if(!S)return null;
  if(kind==='classical guitar')return S.ok||(gtAudio()?(S.ok={buf:GTA.buf,at:GTA.at,list:GTSAMP}):null);
  const c=SND.ctx; if(S.ok)return S.ok; if(S.busy||!c||performance.now()<(S.failed||0))return null; S.busy=true; const D=IMSAMPS[kind];
  fetch(D.file).then(r=>{ if(!r.ok)throw new Error(D.file+': '+r.status); return r.arrayBuffer(); }).then(b=>c.decodeAudioData(b)).then(buf=>{
    const at={}; for(const [m,t,L,hz] of D.n)at[m]={t,L,hz}; S.ok={buf,at,list:D.n}; })
    .catch(e=>{ console.warn(kind+' sound',e); S.failed=performance.now()+10000; }).finally(()=>{ S.busy=false; });
  return null; }
function imxRec(N,evs,t0){ '@later'; const R=IMSAMP[N.kind]&&imsLoad(N.kind); if(!R)return; const c=SND.ctx; N.dry.gain.setTargetAtTime(0,c.currentTime,.005);
  if(!N.lim){ const L=N.lim=c.createDynamicsCompressor(); L.threshold.value=-8; L.knee.value=6; L.ratio.value=12; L.attack.value=.002; L.release.value=.15; L.connect(N.g); }
  for(const e of evs){ const t=t0+(e.dt||0), v=N.on[e.s];
    if(e.k==='pluck'){ const m=69+12*Math.log2(e.hz/440); let q=R.list[0]; for(const x of R.list)if(Math.abs(x[0]-m)<Math.abs(q[0]-m))q=x; const A=R.at[q[0]]; if(!A)continue;
      if(v){ v.g.gain.setTargetAtTime(0,t,.004); try{ v.src.stop(t+.05); }catch(err){} }
      const src=c.createBufferSource(), f=c.createBiquadFilter(), g=c.createGain(); src.buffer=R.buf; src.playbackRate.value=e.hz/A.hz;
      f.type='lowpass'; f.frequency.value=(1500+6500*e.bright)*(1.2-e.pos); f.Q.value=.5; g.gain.value=e.amp*IMSAMP[N.kind].gain;
      src.connect(f); f.connect(g); g.connect(N.lim); src.start(t,A.t,A.L); N.on[e.s]={src,g,hz:A.hz}; src.onended=()=>{ if(N.on[e.s]&&N.on[e.s].src===src)N.on[e.s]=null; }; }
    else if(e.k==='stop'&&v)v.src.playbackRate.setValueAtTime(e.hz/v.hz,t);
    else if(e.k==='mute'&&v&&e.v<1){ v.g.gain.setTargetAtTime(0,t,.02); try{ v.src.stop(t+.2); }catch(err){} N.on[e.s]=null; } } }
window.__imx=IMX;
export {IMX, imxNode, imxSend};
