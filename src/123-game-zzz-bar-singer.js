const VOX={song:-1,bar:0,t:0,at:0,q:[],out:null,pan:null,prev:69,on:false,nodes:new Set()};
const VOXF={a:[[800,1],[1150,.5],[2900,.12]],o:[[450,1],[800,.45],[2830,.1]],u:[[325,1],[700,.35],[2530,.08]]};
const VOXSONGS=()=>GTBOOK.map((T,i)=>T.chords?i:-1).filter(i=>i>=0);
function voxChord(n){ const m=/^([A-G])([#b]?)(m?)(7?)/.exec(n||'C'), R={C:0,D:2,E:4,F:5,G:7,A:9,B:11}[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0);
  const s=[0,m[3]?3:4,7]; if(m[4])s.push(m[3]?10:10); return {r:R,tones:s.map(k=>(R+k)%12),minor:!!m[3]}; }
function voxBar(T,b,ch,key){ '@later'; const beats=T.beats||4, R=beats===3?[[1,1,1],[2,1],[1,.5,.5,1],[1,2]]:[[1,1,1,1],[2,2],[1.5,.5,2],[1,1,2],[2,1,1]], end=b%4===3, br=b%8===7;
  if(br)return [{d:beats-1,n:null},{d:1,n:null}];
  const rh=end?[beats]:R[Math.floor(hash3(b,VOX.song,911)*R.length)], scale=[0,2,4,5,7,9,11].map(k=>(key+k)%12), out=[]; let at=0;
  for(const d of rh){ const strong=at%1===0&&(at===0||beats===4&&at===2), pool=[]; for(let n=57;n<=74;n++){ const pc=n%12; if(ch.tones.includes(pc)||!strong&&scale.includes(pc))pool.push(n); }
    let best=pool[0], bs=1e9; for(const n of pool){ const sc=Math.abs(n-VOX.prev)+(n===VOX.prev?1.5:0)+hash3(b*7+at*3,n,913)*1.6+(end&&n%12!==ch.r&&n%12!==ch.tones[1]?4:0); if(sc<bs){ bs=sc; best=n; } }
    out.push({d,n:best}); VOX.prev=best; at+=d; }
  return out; }
function voxChain(){ const c=SND.ctx; if(!c||!SND.on||c.state!=='running')return false; if(VOX.out)return true; VOX.out=c.createGain(); VOX.pan=c.createStereoPanner(); VOX.out.gain.value=0; VOX.out.connect(VOX.pan); VOX.pan.connect(imxOut()); return true; }
function voxNote(f,t0,dur,vow,v){ '@later'; const c=SND.ctx, o=c.createOscillator(), lp=c.createBiquadFilter(), sum=c.createGain(), env=c.createGain(), fs=[]; o.type='sawtooth'; o.frequency.value=f; lp.type='lowpass'; lp.frequency.value=3800; o.connect(lp);
  for(const [hz,a] of VOXF[vow]){ const b=c.createBiquadFilter(), g=c.createGain(); b.type='bandpass'; b.frequency.value=hz; b.Q.value=hz<1000?7:11; g.gain.value=a; lp.connect(b); b.connect(g); g.connect(sum); fs.push(b,g); }
  if(dur>.45){ const l=c.createOscillator(), lg=c.createGain(); l.frequency.value=5.6; lg.gain.setValueAtTime(0,t0); lg.gain.linearRampToValueAtTime(f*.006,t0+.35); l.connect(lg); lg.connect(o.frequency); l.start(t0); l.stop(t0+dur+.2); fs.push(l,lg); }
  env.gain.setValueAtTime(0,t0); env.gain.linearRampToValueAtTime(.55*v,t0+.06); env.gain.setValueAtTime(.55*v,t0+Math.max(.07,dur-.12)); env.gain.linearRampToValueAtTime(0,t0+dur+.05);
  sum.connect(env); env.connect(VOX.out); o.start(t0); o.stop(t0+dur+.1); const all=[o,lp,sum,env,...fs]; VOX.nodes.add(all); o.onended=()=>{ for(const n of all)try{ n.disconnect(); }catch(e){} VOX.nodes.delete(all); }; }
function voxStep(dt,now){ '@later'; if(!voxChain())return; const c=SND.ctx, ct=c.currentTime, d=SGM.dist();
  VOX.out.gain.setTargetAtTime(SND.on?.5*Math.max(0,1-d/14):0,ct,.08); VOX.pan.pan.setTargetAtTime(SGM.pan(),ct,.1);
  if(!VOX.on){ VOX.on=true; const ss=VOXSONGS(); VOX.song=ss[Math.floor(Math.random()*ss.length)]; VOX.bar=0; VOX.at=ct+.4; VOX.prev=69; }
  if(VOX.at<ct-.3)VOX.at=ct+.3;
  while(VOX.at<ct+1.2){ const T=GTBOOK[VOX.song], ch=T.chords.split(/\s+/), n=ch.length*(T.times||1);
    if(VOX.bar>=n){ const ss=VOXSONGS(); VOX.song=ss[(ss.indexOf(VOX.song)+1)%ss.length]; VOX.bar=0; VOX.at+=2.5; continue; }
    const C=voxChord(ch[VOX.bar%ch.length]), key=voxChord(ch[0]).r, beat=T.beat*1.15, vow='aou'[Math.floor(VOX.bar/4)%3];
    for(const nt of voxBar(T,VOX.bar,C,key)){ if(nt.n!=null)voxNote(440*Math.pow(2,(nt.n-69)/12),VOX.at,nt.d*beat*.96,vow,nt.d>=2?1:.85); VOX.at+=nt.d*beat; }
    VOX.bar++; } }
function voxStop(){ if(!VOX.on)return; VOX.on=false; const c=SND.ctx; if(VOX.out&&c)VOX.out.gain.setTargetAtTime(0,c.currentTime,.05); for(const all of VOX.nodes)try{ all[0].stop(c.currentTime+.08); }catch(e){} }
