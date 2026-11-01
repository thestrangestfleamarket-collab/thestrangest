// THE CATACOMB RUN: the holodeck's adventure: the hall becomes a torch-lit stone catacomb and the dungeon's slimes come at you in five waves (fists or blade); the safety ends it before you faint and your health comes back as it was; cleared waves pay MARTIAL ARTS.
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, VIT} from './003b-systems.js';
import {FADE, MODS, SOL, STORE, TILE} from './006-map-pre.js';
import {FLAME} from './007-fire.js';
{ const H=STORE.holo, T=TILE, say=(t,c)=>FORAGE.say&&FORAGE.say(t,c), WAVES=5, SIZE=n=>2+n; let D=null;
  const conjure=hall=>{ '@arcade'; const {faceTex,C}=SHARED.BOD, K=SHARED.BOD.STOREK.keep, sh=SHARED.BOD.K.sh, b=hall.box, y0=hall.y, h=hall.h, HP=hall.hpx, w=b.x1-b.x0, d=b.z1-b.z0, cx=(b.x0+b.x1)/2, cz=(b.z0+b.z1)/2;
    const G=new THREE.Group(); G.name='catacomb'; hall.G.add(G); const geos=[], mats=[], sol=[], fl=[], px=v=>Math.round(v/T*24);
    const tex=tx=>{ const im=tx.map.image, c=document.createElement('canvas'); c.width=im.width; c.height=im.height; c.getContext('2d').putImageData(im,0,0); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.magFilter=t.minFilter=THREE.NearestFilter; return t; };
    const stone=(pw,seed,f=.8)=>{ const m=new THREE.MeshLambertMaterial({map:tex(faceTex(pw,HP,(i,j)=>C(sh(K.keepStone(i,HP-1-j,seed),f)))),side:THREE.DoubleSide}); mats.push(m); return m; };
    const add=(g,m,x,y,z,ry=0,rx=0)=>{ geos.push(g); const me=new THREE.Mesh(g,m); me.position.set(x,y,z); me.rotation.set(rx,ry,0); me.receiveShadow=true; G.add(me); return me; };
    add(new THREE.PlaneGeometry(w,h),stone(px(w),11),cx,y0+h/2,b.z0+.04*T); add(new THREE.PlaneGeometry(w,h),stone(px(w),12),cx,y0+h/2,b.z1-.04*T,Math.PI);
    add(new THREE.PlaneGeometry(d,h),stone(px(d),13),b.x0+.04*T,y0+h/2,cz,Math.PI/2); add(new THREE.PlaneGeometry(d,h),stone(px(d),14),b.x1-.04*T,y0+h/2,cz,-Math.PI/2);
    { const m=new THREE.MeshLambertMaterial({map:tex(faceTex(px(w),px(d),(i,j)=>C(sh(K.keepFloorCol(i/24,j/24),.75))))}); mats.push(m); add(new THREE.PlaneGeometry(w,d),m,cx,y0+.02*T,cz,0,-Math.PI/2); }
    for(const [u,v] of [[.28,.34],[.72,.34],[.28,.66],[.72,.66]]){ const x=b.x0+w*u, z=b.z0+d*v; add(new THREE.BoxGeometry(.5*T,h,.5*T),stone(12,Math.round(u*9+v*7)),x,y0+h/2,z); const r=[x-.25*T,z-.25*T,x+.25*T,z+.25*T]; sol.push(r); SOL.up.push(r); }
    const bone=new THREE.MeshLambertMaterial({color:0xe8e0d0}); mats.push(bone); for(let i=0;i<7;i++){ const a=i*2.4, x=cx+Math.sin(a)*w*(.12+(i%3)*.11), z=cz+Math.cos(a)*d*(.1+(i%4)*.09); add(new THREE.BoxGeometry(.26*T,.05*T,.07*T),bone,x,y0+.045*T,z,a*1.7); }
    const brk=new THREE.MeshLambertMaterial({color:0x2a2420}); mats.push(brk);
    for(const [x,z,ry] of [[b.x0+w*.25,b.z0+.12*T,0],[b.x0+w*.75,b.z0+.12*T,0],[b.x0+.12*T,cz,Math.PI/2],[b.x1-.12*T,cz,-Math.PI/2]]){ const y=y0+h*.55; add(new THREE.BoxGeometry(.08*T,.16*T,.08*T),brk,x,y,z,ry);
      const Lt=new THREE.PointLight(0xffa040,14,7*T,1.6); Lt.position.set(x+Math.sin(ry)*.18*T,y+.2*T,z+Math.cos(ry)*.18*T); G.add(Lt);
      fl.push(FLAME.add({kind:'torch',x:Lt.position.x,y:y+.08*T,z:Lt.position.z,w:.2*T,h:.42*T,embers:.9,smoke:1.2,sk:.7,light:Lt,parent:G,seed:x*7+z*13,name:'holodeck torch'})); }
    return {sol,pillars:4,torches:fl.length,off:()=>{ for(const s of fl){ const i=FLAME.src.indexOf(s); if(i>=0)FLAME.src.splice(i,1); s.a.removeFromParent(); } for(const r of sol){ const i=SOL.up.indexOf(r); if(i>=0)SOL.up.splice(i,1); }
      G.removeFromParent(); for(const g of geos)g.dispose(); for(const m of mats){ if(m.map)m.map.dispose(); m.dispose(); } }}; };
  const end=(t,c,waves)=>{ D.done=true; say(t,c); if(waves>0)FORAGE.train('fight',800,0,waves*4); H.end(); };
  H.programs.push({name:'THE CATACOMB RUN',skill:'fight',cost:12,intro:'THE CATACOMB RUN. FIVE WAVES OF SLIMES, FISTS OR BLADE. THE SAFETY ENDS IT BEFORE YOU FAINT.',
    go:R=>{ const hall=H.hall, d=D=Object.assign(R,{wave:0,hp0:VIT.hp,t:0,ready:false,done:false,set:null});
      FADE.run('',async()=>{ if(window.LOAD)await LOAD('dungeon'); if(D!==d)return; d.set=conjure(hall);
        d.A={G:hall.G,lane:{x0:hall.box.x0+.8*T,z0:hall.box.z0+.8*T,x1:hall.box.x1-.8*T,z1:hall.box.z1-.8*T},sol:d.set.sol,away:[hall.door],ground:()=>hall.y,lv:'up'};
        await MODS.dunmobs.arena(d.A,1,SIZE(1)); if(D!==d){ MODS.dunmobs.off(); return; } d.wave=1; d.ready=true; say('WAVE 1.','#7dffa4'); }); },
    run:(R,dt)=>{ if(!D||!D.ready||D.done)return;
      if(VIT.hp<.12&&!VIT.dead)return end('THE SAFETY CATCHES YOU. '+(D.wave-1)+' OF '+WAVES+' WAVES CLEARED.','#c8a090',D.wave-1);
      if(MODS.dunmobs.alive()>0){ D.t=2; return; } if((D.t-=dt)>0)return;
      if(D.wave>=WAVES)return end('CATACOMB RUN COMPLETE: '+WAVES+' WAVES.','#7dffa4',WAVES);
      D.wave++; MODS.dunmobs.wave(D.wave,SIZE(D.wave)); say('WAVE '+D.wave+'.','#5dff8f'); },
    hide:()=>{ const d=D; if(!d)return; D=null; MODS.dunmobs.off(); if(d.set)d.set.off(); VIT.hp=Math.max(VIT.hp,d.hp0); }});   // the blows were light: your health comes back as you came in
  window.CATDBG=()=>({on:!!D,ready:!!(D&&D.ready),wave:D?D.wave:0,set:!!(D&&D.set),pillars:D&&D.set?D.set.pillars:0,torches:D&&D.set?D.set.torches:0,fire:FLAME.src.filter(s=>s.name==='holodeck torch').length}); }
