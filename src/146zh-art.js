// THE ART MUSEUM, FURNISHED: the floor plan on a stand by the door, where its visitors go; nobody works there.
import {SHARED} from './003-shx.js';
import {FORAGE, UI, VIT} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {STORE} from './006-map-pre.js';
import {IKIT} from './038zc-ikit.js';
import {MINI} from './038zd-mini.js';
const GALLERY={}; window.GALLERY=GALLERY;
{ const say=(t,c)=>SAY(t,c||'#f2c14e'), TM=.924, BOD=SHARED.BOD;   // a museum tile in metres
  FORAGE.add({names:{art_postcard:'A POSTCARD OF A PAINTING',art_print:'A PRINT OF A PAINTING',f_croissant:'A CROISSANT'},does:{f_croissant:()=>{ FORAGE.feed(.2); VIT.sta=Math.min(1,VIT.sta+.2); }}});
  const room=()=>(STORE.rooms||[]).find(r=>r.id==='art');
  const frameOf=S=>IKIT.frame({x0:S.B.x0,y0:S.B.y0,x1:S.B.x1,y1:S.B.y1});
  // where its visitors go (the inside is off the map): before the walls' paintings, on the benches
  { const S=STORE.artFrame, R=room(); if(S&&R){ const F=frameOf(S), W=S.B.x1-S.B.x0, sp=(x,y,du,dv,h)=>{ const p=F.pw(x*TM,y*TM); return {x:p[0],z:p[1],hd:F.hd(du,dv),off:true,...(h!=null?{y:h*IKIT.MW}:{})}; };
    R.seats=GALLERY.places=[sp(2.0,5,-1,0),sp(2.0,10,-1,0),sp(2.0,15,-1,0),sp(W-2,5,1,0),sp(W-2,10,1,0),sp(W-2,15,1,0),sp(6,2.0,0,-1),sp(W/2,2.0,0,-1),sp(W-6,2.0,0,-1),
      sp(W/2-3.9,9.75,0,1,.45),sp(W/2-3.1,9.75,0,1,.45),sp(W/2+3.1,9.75,0,1,.45),sp(W/2+3.9,9.75,0,1,.45)]; } }
  // the floor plan: every painting as it hangs now
  GALLERY.plan=()=>{ '@later'; const L=[]; for(const t of UI.things)if(t.obj&&t.obj.userData&&t.obj.userData.at)L.push(t.name);
    MINI.look('THE FLOOR PLAN',(g,w,h)=>{ g.fillStyle='#efe6cf'; g.fillRect(0,0,w,h); g.fillStyle='#2a2420'; g.textAlign='center'; g.textBaseline='top'; g.font='bold 16px serif'; g.fillText('THE ART MUSEUM',w/2,10);
      if(!L.length){ g.font='13px serif'; g.fillText('The paintings are being hung. Come back in a moment.',w/2,60); return; }
      g.textAlign='left'; let y=38; g.font='10px monospace'; const half=Math.ceil(L.length/2); for(let i=0;i<half;i++){ g.fillText((L[i]||'').slice(0,30),14,y); if(L[i+half])g.fillText(L[i+half].slice(0,30),w/2+4,y); y+=12; } },'One room. Double-click a painting to see it up close.'); };
  STORE.furnish=STORE.furnish||{};
  STORE.furnish.art=S=>{ '@later'; GALLERY.data=S.data&&S.data(); const F=frameOf(S), K=IKIT.room(F,o=>scene.add(o)), {box,pic,words,use}=K, t=d=>d*TM, W=S.B.x1-S.B.x0, D=S.B.y1-S.B.y0;
    { const u=t(W/2-3.5), v=t(D-1.6); box(u-.03,v-.03,u+.03,v+.03,0,1.2,0x2a2420); pic(u,v+.04,1.2,.6,.4,0,1,words(48,32,'#22262e',[['THE',24,5,'#f0c040',8,'center'],['FLOOR PLAN',24,17,'#f4ecd8',7,'center']]),true);
      use('THE FLOOR PLAN',u,v,.4,1.6,GALLERY.plan,1.6); }
    K.flush(); };
}
