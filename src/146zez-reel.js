// THE STARLITE'S OWN REEL (owner, 11 Nov 2026, from his Starlite Cinema page): the film the theatre's projector runs when no scheduled film is on the screen, drawn on a canvas: the countdown leader, OUR FEATURE PRESENTATION, the neon drive, the planet, the city in the rain, The End; worn film over all of it.
import {THREE} from './003-shx.js';
const STARREEL={};
STARREEL.make=()=>{ '@later'; const MW=1024, MH=576, CW=640, K=CW/MW, mc=document.createElement('canvas'); mc.width=CW; mc.height=Math.round(MH*K); const g=mc.getContext('2d'), base=()=>g.setTransform(K,0,0,K,0,0);
  const tex=new THREE.CanvasTexture(mc); tex.colorSpace=THREE.SRGBColorSpace; tex.minFilter=tex.magFilter=THREE.LinearFilter; tex.generateMipmaps=false;
  const rnd=i=>{ const s=Math.sin(i*127.1+311.7)*43758.5453; return s-Math.floor(s); };
  const vign=document.createElement('canvas'); vign.width=MW; vign.height=MH; { const v=vign.getContext('2d'), gr=v.createRadialGradient(MW/2,MH/2,MH*.35,MW/2,MH/2,MW*.62); gr.addColorStop(0,'rgba(0,0,0,0)'); gr.addColorStop(1,'rgba(0,0,0,.6)'); v.fillStyle=gr; v.fillRect(0,0,MW,MH); }
  const sLeader=t=>{ const n=8-Math.floor(t), f=t%1; g.fillStyle='#b9b29c'; g.fillRect(0,0,MW,MH);
    g.fillStyle='rgba(60,55,45,.55)'; g.beginPath(); g.moveTo(MW/2,MH/2); g.arc(MW/2,MH/2,MW,-Math.PI/2,-Math.PI/2+f*Math.PI*2); g.closePath(); g.fill();
    g.strokeStyle='#1a1814'; g.lineWidth=3; g.beginPath(); g.moveTo(0,MH/2); g.lineTo(MW,MH/2); g.moveTo(MW/2,0); g.lineTo(MW/2,MH); g.stroke();
    g.lineWidth=6; for(const r of [190,235]){ g.beginPath(); g.arc(MW/2,MH/2,r,0,6.3); g.stroke(); }
    g.fillStyle='#1a1814'; g.font='bold 320px Georgia'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(n,MW/2,MH/2+18); };
  const sTitle=t=>{ const gr=g.createLinearGradient(0,0,0,MH); gr.addColorStop(0,'#05021a'); gr.addColorStop(1,'#3a0b52'); g.fillStyle=gr; g.fillRect(0,0,MW,MH);
    g.save(); g.translate(MW/2,MH/2); g.rotate(t*.15); for(let i=0;i<24;i++){ g.rotate(Math.PI/12); g.fillStyle=i%2?'rgba(255,60,160,.10)':'rgba(60,200,255,.07)'; g.beginPath(); g.moveTo(0,0); g.lineTo(900,-60); g.lineTo(900,60); g.fill(); } g.restore();
    for(let i=0;i<70;i++){ const a=.4+.6*Math.sin(t*3+i); g.fillStyle=`rgba(255,255,255,${a*.8})`; g.fillRect(rnd(i)*MW,rnd(i+50)*MH,2,2); }
    const sc=Math.min(1,.55+t*.12)*1.2; g.save(); g.translate(MW/2,MH/2); g.scale(sc,sc); g.textAlign='center'; g.textBaseline='middle';
    g.font='italic 34px Georgia'; g.fillStyle='#ffd9ff'; g.fillText('— and now —',0,-92);
    const tg=g.createLinearGradient(0,-50,0,60); tg.addColorStop(0,'#fff6a8'); tg.addColorStop(.5,'#ff9a2e'); tg.addColorStop(.52,'#b0135f'); tg.addColorStop(1,'#ff7ad0');
    g.font='bold 92px Georgia'; g.lineWidth=8; g.strokeStyle='#14002a'; g.strokeText('OUR FEATURE',0,-14); g.fillStyle=tg; g.fillText('OUR FEATURE',0,-14);
    g.font='bold 70px Georgia'; g.strokeText('PRESENTATION',0,70); g.fillText('PRESENTATION',0,70); g.restore(); };
  const sDrive=t=>{ const hz=MH*.56; let gr=g.createLinearGradient(0,0,0,hz); gr.addColorStop(0,'#090120'); gr.addColorStop(.6,'#3d0f63'); gr.addColorStop(1,'#ff3d81'); g.fillStyle=gr; g.fillRect(0,0,MW,hz);
    for(let i=0;i<90;i++){ g.fillStyle=`rgba(255,255,255,${.3+.5*rnd(i+7)})`; g.fillRect(rnd(i)*MW,rnd(i+33)*hz*.7,1.6,1.6); }
    const sx=MW/2, sy=hz-18, sr=150; gr=g.createLinearGradient(0,sy-sr,0,sy+sr); gr.addColorStop(0,'#fff27a'); gr.addColorStop(.55,'#ff8a3a'); gr.addColorStop(1,'#ff2a8a');
    g.save(); g.beginPath(); g.rect(0,0,MW,hz); g.clip(); g.fillStyle=gr; g.beginPath(); g.arc(sx,sy,sr,0,6.3); g.fill();
    g.fillStyle='#b82a78'; for(let i=0;i<6;i++){ const y=sy-22+i*20+((t*8)%20); g.fillRect(sx-sr,y,sr*2,3+i*1.6); } g.restore();
    g.fillStyle='#16042e'; g.strokeStyle='#ff5ad0'; g.lineWidth=2; g.beginPath(); g.moveTo(0,hz); for(let i=0;i<=40;i++){ const x=i/40*MW, c=Math.abs(x-MW/2)/(MW/2); g.lineTo(x,hz-(8+c*c*150*(.4+rnd(i*3)*.9))); } g.lineTo(MW,hz); g.closePath(); g.fill(); g.stroke();
    gr=g.createLinearGradient(0,hz,0,MH); gr.addColorStop(0,'#2a0a45'); gr.addColorStop(1,'#05010c'); g.fillStyle=gr; g.fillRect(0,hz,MW,MH-hz);
    g.strokeStyle='rgba(60,230,255,.85)'; g.lineWidth=1.5; g.beginPath(); for(let i=-16;i<=16;i++){ g.moveTo(MW/2+i*14,hz); g.lineTo(MW/2+i*190,MH); }
    const ph=(t*2.4)%1; for(let j=0;j<16;j++){ const z=j+1-ph; if(z<=.02)continue; const y=hz+(MH-hz)/z; if(y>MH)continue; g.moveTo(0,y); g.lineTo(MW,y); } g.stroke();
    const by=MH-64+Math.sin(t*9)*1.5, cx=MW/2+Math.sin(t*.7)*60;
    g.fillStyle='#07060c'; g.beginPath(); g.moveTo(cx-120,by+50); g.lineTo(cx-112,by+8); g.lineTo(cx-70,by); g.lineTo(cx-52,by-30); g.lineTo(cx+52,by-30); g.lineTo(cx+70,by); g.lineTo(cx+112,by+8); g.lineTo(cx+120,by+50); g.closePath(); g.fill();
    g.fillStyle='#1c1830'; g.fillRect(cx-46,by-25,92,22);
    g.shadowColor='#ff2030'; g.shadowBlur=22; g.fillStyle='#ff3040'; g.fillRect(cx-108,by+14,52,10); g.fillRect(cx+56,by+14,52,10); g.shadowBlur=0; };
  const sSpace=t=>{ g.fillStyle='#01010a'; g.fillRect(0,0,MW,MH); const cx=MW*.42, cy=MH*.48;
    for(let i=0;i<260;i++){ const a=rnd(i)*6.283, sp=.12+rnd(i+90)*.3, p=(rnd(i+200)+t*sp)%1, r=p*p*MW*.75, l=6+p*p*90;
      g.strokeStyle=`rgba(${190+rnd(i+1)*65|0},${200+rnd(i+2)*55|0},255,${p})`; g.lineWidth=.6+p*2.2; g.beginPath(); g.moveTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r); g.lineTo(cx+Math.cos(a)*(r+l),cy+Math.sin(a)*(r+l)); g.stroke(); }
    const pr=66+t*9, px=MW*.72-t*6, py=MH*.44; g.save(); g.translate(px,py); g.rotate(-.35);
    g.strokeStyle='rgba(255,210,150,.75)'; g.lineWidth=pr*.12; g.beginPath(); g.ellipse(0,0,pr*1.9,pr*.5,0,Math.PI,Math.PI*2); g.stroke();
    const gr=g.createRadialGradient(-pr*.4,-pr*.4,pr*.1,0,0,pr); gr.addColorStop(0,'#ffd28a'); gr.addColorStop(.6,'#c2552e'); gr.addColorStop(1,'#1c0612'); g.fillStyle=gr; g.beginPath(); g.arc(0,0,pr,0,6.3); g.fill();
    g.strokeStyle='rgba(90,30,20,.35)'; g.lineWidth=pr*.08; for(const b of [-.45,-.1,.3]){ g.beginPath(); g.ellipse(0,b*pr,pr*Math.sqrt(1-b*b),pr*.08,0,0,Math.PI); g.stroke(); }
    g.strokeStyle='rgba(255,210,150,.85)'; g.lineWidth=pr*.12; g.beginPath(); g.ellipse(0,0,pr*1.9,pr*.5,0,0,Math.PI); g.stroke(); g.restore(); };
  const sCity=t=>{ const gr=g.createLinearGradient(0,0,0,MH); gr.addColorStop(0,'#03040d'); gr.addColorStop(1,'#1b1740'); g.fillStyle=gr; g.fillRect(0,0,MW,MH);
    if(Math.sin(t*1.3)>.985||Math.sin(t*2.1+1)>.992){ g.fillStyle='rgba(190,200,255,.45)'; g.fillRect(0,0,MW,MH); }
    g.fillStyle='#e8e6d0'; g.beginPath(); g.arc(820,110,44,0,6.3); g.fill(); const pan=t*6;
    for(let L=0;L<2;L++){ const sp=L?1:.45, base_=L?MH:MH-40;
      for(let i=0;i<26;i++){ const bw=50+rnd(i+L*50)*60, x=((i*78-pan*sp)%(26*78)+26*78)%(26*78)-100, bh=(L?150:230)+rnd(i*3+L*9)*210; g.fillStyle=L?'#06060c':'#0d0d1e'; g.fillRect(x,base_-bh,bw,bh);
        for(let wy=0;wy<bh/16-1;wy++)for(let wx=0;wx<bw/13-1;wx++){ const id=i*971+wy*31+wx*7+L*5; if(rnd(id)>.36||Math.sin(t*.5+id)<=-.75)continue; g.fillStyle=rnd(id+2)>.8?'rgba(120,220,255,.8)':'rgba(255,205,120,.8)'; g.fillRect(x+6+wx*13,base_-bh+8+wy*16,6,8); } } }
    const on=Math.sin(t*5)>-.6||Math.sin(t*23)>0; g.strokeStyle=on?'#ff3bd0':'#4a1040'; g.fillStyle=g.strokeStyle; g.shadowColor='#ff3bd0'; g.shadowBlur=on?26:0; g.lineWidth=4;
    g.strokeRect(128,200,170,64); g.font='bold 44px Arial'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('DINER',213,234); g.shadowBlur=0;
    g.strokeStyle='rgba(170,190,255,.35)'; g.lineWidth=1; g.beginPath(); for(let i=0;i<220;i++){ const x=(rnd(i)*MW*1.3+t*90)%(MW*1.3)-80, y=(rnd(i+400)*MH+t*(700+rnd(i)*400))%MH; g.moveTo(x,y); g.lineTo(x-7,y+24); } g.stroke(); };
  const sEnd=()=>{ g.fillStyle='#04030a'; g.fillRect(0,0,MW,MH); g.textAlign='center'; g.textBaseline='middle'; g.fillStyle='#f1e6c8'; g.font='italic 130px Georgia'; g.fillText('The End',MW/2,MH/2-10); g.font='20px Georgia'; g.fillStyle='#a89c80'; g.fillText('A  STARLITE  PICTURE',MW/2,MH/2+110); };
  const reel=[[sLeader,7],[null,1],[sTitle,7],[sDrive,22],[sSpace,18],[sCity,18],[sEnd,6],[null,1.5]], len=reel.reduce((a,s)=>a+s[1],0);
  // the frame's average colour lights the room
  const sc=document.createElement('canvas'); sc.width=8; sc.height=4; const sg=sc.getContext('2d',{willReadFrequently:true}), avg=new THREE.Color(.2,.2,.2), avgT=new THREE.Color();
  const draw=time=>{ let t=time%len, scn=null, dur=0; for(const s of reel){ if(t<s[1]){ scn=s[0]; dur=s[1]; break; } t-=s[1]; }
    base(); g.globalAlpha=1; g.shadowBlur=0; g.translate(0,(Math.random()-.5)*1.6);
    if(scn)scn(t); else { g.fillStyle='#000'; g.fillRect(0,0,MW,MH); }
    base(); if(scn&&scn!==sLeader){ const f=Math.min(1,t/.7,(dur-t)/.7); if(f<1){ g.fillStyle=`rgba(0,0,0,${1-f})`; g.fillRect(0,0,MW,MH); } }
    const heavy=scn===sLeader?3:1;
    for(let i=0;i<40*heavy;i++){ g.fillStyle=Math.random()>.5?'rgba(255,255,255,.35)':'rgba(0,0,0,.45)'; const s=Math.random()*2.4; g.fillRect(Math.random()*MW,Math.random()*MH,s,s); }
    if(Math.random()<.35*heavy){ g.fillStyle='rgba(240,240,220,.22)'; g.fillRect(Math.random()*MW,0,1.6,MH); }
    if(Math.random()<.04*heavy){ g.fillStyle='rgba(0,0,0,.7)'; g.beginPath(); g.arc(Math.random()*MW,Math.random()*MH,3+Math.random()*7,0,6.3); g.fill(); }
    g.drawImage(vign,0,0); g.fillStyle=`rgba(0,0,0,${Math.random()*.07})`; g.fillRect(0,0,MW,MH); tex.needsUpdate=true;
    sg.drawImage(mc,0,0,8,4); const d=sg.getImageData(0,0,8,4).data; let r=0, gg=0, b=0; for(let i=0;i<d.length;i+=4){ r+=d[i]; gg+=d[i+1]; b+=d[i+2]; } const n=d.length/4*255; avgT.setRGB(r/n,gg/n,b/n); avg.lerp(avgT,.35); };
  return {tex,draw,avg,len}; };
// the projector's sound (the same page): its whirr and tick, and a soft pad under the reel; c an audio context, out where it plays
STARREEL.sound=(c,out)=>{ '@later'; const master=c.createGain(), stop=[]; master.gain.value=0; master.connect(out); const run=n=>{ n.start(); stop.push(n); return n; };
  const len=c.sampleRate*2, buf=c.createBuffer(1,len,c.sampleRate), d=buf.getChannelData(0); let b=0; for(let i=0;i<len;i++){ b=(b+.04*(Math.random()*2-1))/1.04; d[i]=b*3+(Math.random()*2-1)*.15; }
  const n=c.createBufferSource(); n.buffer=buf; n.loop=true; const bp=c.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=1100; bp.Q.value=.6; const ng=c.createGain(); ng.gain.value=.05; n.connect(bp); bp.connect(ng); ng.connect(master); run(n);
  const tick=c.createOscillator(); tick.type='square'; tick.frequency.value=24; const hp=c.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=1800; const tg=c.createGain(); tg.gain.value=.012; tick.connect(hp); hp.connect(tg); tg.connect(master); run(tick);
  const lp=c.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=420; const pad=c.createGain(); pad.gain.value=.022; lp.connect(pad); pad.connect(master);
  for(const f of [55,82.4,110.3,164.6]){ const o=c.createOscillator(); o.type='sawtooth'; o.frequency.value=f; o.detune.value=(Math.random()-.5)*14; o.connect(lp); run(o); }
  const lfo=c.createOscillator(); lfo.frequency.value=.07; const lg=c.createGain(); lg.gain.value=180; lfo.connect(lg); lg.connect(lp.frequency); run(lfo);
  return {set:(vol,padOn)=>{ master.gain.setTargetAtTime(vol,c.currentTime,.3); pad.gain.setTargetAtTime(padOn?.022:0,c.currentTime,.5); },end:()=>{ for(const s of stop)try{ s.stop(); }catch(e){} try{ master.disconnect(); }catch(e){} }}; };
export {STARREEL};
