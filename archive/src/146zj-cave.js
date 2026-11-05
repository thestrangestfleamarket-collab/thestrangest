// THE GOLEMS' CAVE, FURNISHED: a cutting wheel by the trading stone (cut a rough gem yourself, $1 to the golems a go: a cut gem sells for more than twice as much), the assay scale (what each of your stones fetches here, rough and cut), crystal lanterns. The golems stay calm while you carry a gem (146e).
import {FORAGE, INV} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {STORE} from './006-map-pre.js';
import {IKIT} from './038zc-ikit.js';
import {MINI} from './038zd-mini.js';
import {GEMS} from './101-gems.js';
const CAVEK={}; window.CAVEK=CAVEK;
{ const say=(t,c)=>SAY(t,c||'#f2c14e'), price=id=>{ const g=GEMS.find(q=>q[0]===id); return g?g[2]:0; };
  // the rough stones you carry that have a cut kind, the dearest first
  const rough=()=>GEMS.filter(g=>!/^cut_/.test(g[0])&&(INV.items[g[0]]||0)>0&&GEMS.some(q=>q[0]==='cut_'+g[0])).sort((a,b)=>b[2]-a[2]);
  CAVEK.gemIds=()=>GEMS.map(g=>g[0]);
  CAVEK.cut=()=>{ const g=rough()[0]; MINI.open(GAMES.facet({title:g?'CUTTING '+g[1]:'THE CUTTING WHEEL',color:'#a050c0',
    can:()=>!g?'NOTHING TO CUT: BRING A ROUGH STONE (THE CRACK IN THE FLOOR LEADS DOWN TO THE CAVERNS).':INV.cash<1?'THE GOLEMS WANT A DOLLAR FOR THE WHEEL.':'',
    pay:()=>{ INV.cash-=1; },end:S=>{ CAVEK.last={id:g&&g[0],ok:S.score}; if(S.score){ FORAGE.take(g[0],1); INV.add('cut_'+g[0],1); say(`CUT ${g[1]}: THE GOLEMS WOULD GIVE $${price('cut_'+g[0])} FOR IT NOW (ROUGH, $${g[2]}).`); } }})); };
  CAVEK.assay=()=>{ const L=GEMS.filter(g=>(INV.items[g[0]]||0)>0);
    MINI.look('THE ASSAY SCALE',(g,w,h)=>{ g.fillStyle='#1c1814'; g.fillRect(0,0,w,h); g.fillStyle='#c8b080'; g.font='bold 13px monospace'; g.textAlign='left'; g.textBaseline='top'; g.fillText('WHAT THE GOLEMS PAY',14,12); g.font='11px monospace';
      if(!L.length){ g.fillStyle='#a89a80'; g.fillText('YOUR PACK HAS NO STONES.',14,40); return; }
      L.slice(0,16).forEach((q,i)=>{ const y=38+i*20, n=INV.items[q[0]], c=GEMS.find(z=>z[0]==='cut_'+q[0]); g.fillStyle='#f4ecd8'; g.fillText(`${n} × ${q[1]}`.slice(0,30),14,y); g.textAlign='right'; g.fillText('$'+q[2]*n,w-110,y); g.fillStyle='#d8a0f0'; if(c)g.fillText('CUT $'+c[2]*n,w-14,y); g.textAlign='left'; }); },'Sell at the trading stone. Cut stones at the wheel first: they fetch more than twice as much.'); };
  STORE.furnish=STORE.furnish||{};
  STORE.furnish.cave=C=>{ '@park'; const {c,R,X,Z,grp}=C, F=IKIT.frame({x0:c.x-R,y0:c.y-R,x1:c.x+R,y1:c.y+R},(x,y)=>[X(x),Z(y)]), K=IKIT.room(F,o=>grp.add(o)), {box,cyl,ball,glow,use,sol}=K, TM=F.W/(2*R), t=(dx,dy)=>[(dx+R)*TM,(dy+R)*TM];
    const ST={stone:0x5a5650,dark:0x2a2826,brass:0x9a7a3a,crystal:0xa070e0};
    // the cutting wheel on a stone bench: a grey wheel on its axle, a crank, a water trough
    { const [u,v]=t(-3.0,-2.4); box(u-.5,v-.3,u+.5,v+.3,0,.75,ST.stone); cyl(u,v,.32,.75,.83,0x8a8c90,.32,16); cyl(u,v,.04,.83,.9,ST.dark); box(u+.35,v-.05,u+.55,v+.05,.8,.86,ST.brass); box(u-.45,v-.25,u-.2,v+.25,.75,.82,0x3a6a8a); sol(u-.5,v-.3,u+.5,v+.3);
      use('THE CUTTING WHEEL ($1 A GO)',u,v,1.0,1.0,CAVEK.cut,1.5); }
    // the assay scale beside the trading stone: a beam on a post, two brass pans
    { const [u,v]=t(-3.3,1.9); box(u-.25,v-.25,u+.25,v+.25,0,.7,ST.stone); cyl(u,v,.03,.7,1.25,ST.brass); box(u-.35,v-.015,u+.35,v+.015,1.24,1.27,ST.brass); for(const s of [-1,1]){ cyl(u+s*.33,v,.12,1.0,1.02,ST.brass); cyl(u+s*.33,v,.005,1.02,1.25,ST.brass); } sol(u-.25,v-.25,u+.25,v+.25);
      use('THE ASSAY SCALE',u,v,.6,1.3,CAVEK.assay,1.4); }
    // crystal lanterns on posts, glowing (no lamps: the cave is always built, and lamps cost every frame)
    for(const [dx,dy] of [[-5.2,3.6],[-5.2,-3.6],[.6,5.6]]){ const [u,v]=t(dx,dy); cyl(u,v,.05,0,1.3,ST.dark); glow(()=>{ ball(u,v,1.42,.12,ST.crystal,1.4); }); }
    K.flush(); };
}
