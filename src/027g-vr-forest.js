// THE VR FOREST KIT: the old game's forest island pieces as catalog kinds; loads with the old rooms' kits on the first jump.
import {SHARED} from './003-shx.js';
import {CAT_DEPTS, CAT_INFO, CATALOG, hash, KIND_OF, LAMPS, mt, prop, sh, sided} from './014-gamekit.js';
const vrForest=()=>{ '@oldkits';
// =====================================================================================
// THE VR HEADSET AND THE FOREST'S THINGS (owner, 10 Oct 2026: "create a VR headset (bulky, 80s tech) that if you put on will give you the
// options to transport into different places. start out with the forest as the only level"; back from the archive, owner 16 Oct 2026:
// archive/old-world/src/23-vr-forest.js, as it was). The headset: a bulky beige visor with a black strap and a thick cable, a catalog item
// (department "Apartment", $0); now on its station in the arcade too (a beige console under it, its cable into it, a green light on: the
// station's card puts it on, 51-vr-headset). The Forest's things, all catalog kinds ($0): the pines (dense round the edge, so nobody walks
// out), rocks, a fallen log. The forest's place: 21-world-map-5-zzz-vr-forest; its things placed: 26-zzzzzzzzzzzzz-vr-forest.
// =====================================================================================
// ---- a pine: a bare trunk under sixteen tiers of needles, each tier two crossed boxes (an eight-cornered shape, rounder than one
// box) a little narrower than the tier below, every one nudged so no two trees are alike: a tall stepped cone. The lowest tier is its
// footprint, so you can't push in among them. H: its height (art px)
const PINE=[34,62,42], BARK=[56,42,32];
function pine(x,y){ SHARED.PNAME='pine'; const n=hash(Math.round(x*10),Math.round(y*10),131), H=112+Math.floor(n*40), N=16, z0=Math.round(H*.18), bs=[];
  const nd=(c,a,z,k)=>{ const q=hash(Math.floor(a*12),Math.floor(z/2),k); return q<.22?sh(c,.78):q>.9?sh(c,1.16):c; };   // needles: the odd dark and light clump
  bs.push({x0:x-.1,y0:y-.1,x1:x+.1,y1:y+.1,z0:0,z1:z0+4,c:BARK,fi:(v,z)=>sh(nd(BARK,v,z,133),.62),fj:(u,z)=>sh(nd(BARK,u,z,135),.8)});
  for(let k=0;k<N;k++){ const t=k/N, w=(1.25*Math.pow(1-t,.8)+.1)/2, zz=z0+Math.round((H-z0)*t), zt=k+1<N?z0+Math.round((H-z0)*(k+1)/N)+2:H, c=sh(PINE,.84+.3*t);
    for(const [wx,wy,kk] of [[w,w*.68,0],[w*.68,w,1]]){ const ox=(hash(k,Math.round(x*7)+kk,137)-.5)*.1, oy=(hash(k,Math.round(y*7)+kk,139)-.5)*.1;
      bs.push({x0:x+ox-wx,y0:y+oy-wy,x1:x+ox+wx,y1:y+oy+wy,z0:zz,z1:zt,foot:k?0:1,c,top:(X,Y)=>nd(sh(c,1.06),X+Y,X*7,141),fi:(v,z)=>sh(nd(c,v,z,143),z<zz+1?.5:.62),fj:(u,z)=>sh(nd(c,u,z,145),z<zz+1?.65:.8)}); } }
  return prop(bs); }
// ---- a rock: a mossy grey boulder: three lumps leaning on one another, none centred on the others, a chip beside it (how big and
// which way it leans, from where it stands)
function vrRock(x,y){ SHARED.PNAME='rock'; const n=hash(Math.round(x*10),Math.round(y*10),161), m=hash(Math.round(y*10),Math.round(x*10),163), G=[104,106,100], W=.4+.28*n, D=.32+.24*m, H=9+Math.floor(n*6), sx=m<.5?1:-1, sy=n<.5?1:-1;
  const st=(c,a,z,k)=>{ const q=hash(Math.floor(a*10),Math.floor(z/2),k); return q<.08?sh(c,.8):q>.94?sh(c,1.1):c; }, moss=(X,Y)=>hash(Math.floor(X*6),Math.floor(Y*6),165)<.4?[60,92,56]:st(mt('cope',G),X,Y*5,167);
  const lump=(cx,cy,w,d,z0,z1,f)=>({x0:cx-w,y0:cy-d,x1:cx+w,y1:cy+d,z0,z1,foot:z0?0:1,c:G,top:(X,Y)=>{ const e=Math.min(X-cx+w,cx+w-X,Y-cy+d,cy+d-Y); return sh(moss(X,Y),e<.05?.8*f:f); },
    fi:(v,z)=>sh(st(mt('cope',G),v,z,169),z<z0+1.5?.5:.62*f),fj:(u,z)=>sh(st(mt('cope',G),u,z,171),z<z0+1.5?.65:.8*f)});
  const bs=[lump(x-sx*.08,y+sy*.04,W,D,0,H,1),lump(x+sx*W*.45,y-sy*D*.35,W*.62,D*.7,0,Math.round(H*.72),.95),lump(x-sx*W*.1,y-sy*D*.1,W*.5,D*.52,Math.round(H*.6),Math.round(H*1.2),.9)];
  if(n>.35)bs.push(lump(x-sx*(W+.16),y+sy*D*.4,.14,.11,0,Math.round(H*.3),.9)); return prop(bs); }
// ---- a fallen log: a trunk on its side in two tiers (round-ish), bark along it, moss on its top, rings on its cut end, a branch stub
function fallenLog(x,y){ SHARED.PNAME='fallen log'; const L=2.3, D=.46, H=13, c=BARK;
  const bark=(a,z,k)=>{ const q=hash(Math.floor(a*7),Math.floor(z/3),k), f=Math.abs(z-H/2)/(H/2); return sh(q<.18?sh(c,.76):q>.9?sh(c,1.12):c,1-.3*f*f); };   // darker toward its top and underside: round
  const ring=(v,z)=>{ const r=Math.hypot((v-y)/D*H/2,z-H/2); return r>H/2-1?sh(c,.8):(Math.floor(r*1.4)&1)?[176,142,96]:[150,118,78]; };    // the cut end: pale wood, rings
  const tier=(d,z0,z1,top)=>({x0:x-L/2,y0:y-d,x1:x+L/2,y1:y+d,z0,z1,foot:z0?0:1,c,top,fi:ring,fj:(u,z)=>bark(u,z,175)});
  return prop([tier(D,0,H*.55,(X,Y)=>sh(bark(X,3,173),.9)),tier(D*.62,H*.55,H,(X,Y)=>hash(Math.floor(X*5),Math.floor(Y*9),181)<.3?[58,88,54]:bark(X,H*.7,173)),
    {x0:x+.3,y0:y+D-.05,x1:x+.5,y1:y+D+.35,z0:5,z1:9,foot:0,c,top:()=>sh(c,.9),fi:(v,z)=>sh(bark(v,z,177),.62),fj:(u,z)=>sh(bark(u,z,179),.8)}]); }
// ---- the VR headset: a bulky beige visor (a black lens plate across its front with two dark eye-pieces, vent slots on top), a foam face
// pad at the back, a black strap up over the top, and a thick coiled cable out of its side (z0: what it rests on; its front to +y)
const VRBG=[212,202,178], VRBLK=[36,38,42], VRRUB=[44,42,40];
function vrHeadsetBoxes(x,y,z0=0,cable=true){ const H=20, w=.31, sd=(o)=>sided({c:VRBG,...o}), worn=(c,a,z)=>{ const q=hash(Math.floor(a*60),Math.floor(z),181); return z<2.5?sh(c,.82):q<.03?sh(c,.86):q>.985?sh(c,1.07):c; };
  const body=sd({x0:x-w,y0:y-.2,x1:x+w,y1:y+.12,z0:z0+2,z1:z0+H+2,foot:1,fs:(nx,ny,X,Y,z,k)=>{ const a=(nx?Y-y:X-x)*24, c=worn(VRBG,nx?Y:X,z);
      if(ny>0){ if(z>4&&z<16){ for(const m of [-3.7,3.7]){ const q=Math.hypot(a-m,(z-10)*1.25); if(q<3.6)return q<1.4?[82,96,110]:q<2.6?[56,64,76]:VRBLK; } return Math.abs(a)>w*24-1?sh(VRBLK,.8):sh(VRBLK,1.1); } if(z>16.5&&z<18)return sh(c,.86*k*1.2); }
      return sh(z>H-1.5?sh(c,1.05):c,k*1.2); },top:(X,Y)=>((X-x)*12+12)%1<.3&&Y>y-.12&&Y<y+.04?sh(VRBG,.7):sh(VRBG,.97)});
  const pad=sd({x0:x-w+.02,y0:y-.28,x1:x+w-.02,y1:y-.2,z0:z0+4,z1:z0+H,c:[62,58,54],fs:(nx,ny,X,Y,z,k)=>sh([62,58,54],k*1.2)});
  const rub=o=>sd({c:VRRUB,...o,fs:(nx,ny,X,Y,z,k)=>sh(VRRUB,k*1.2),top:()=>sh(VRRUB,1.2)});
  const bs=[body,pad,rub({x0:x-w,y0:y-.3,x1:x-w+.04,y1:y-.18,z0:z0+H,z1:z0+H+10}),rub({x0:x+w-.04,y0:y-.3,x1:x+w,y1:y-.18,z0:z0+H,z1:z0+H+10}),rub({x0:x-w,y0:y-.3,x1:x+w,y1:y-.18,z0:z0+H+10,z1:z0+H+13}),
    rub({x0:x+w,y0:y-.05,x1:x+w+.06,y1:y+.05,z0:z0+5,z1:z0+10})];
  if(cable)for(let i=0;i<8;i++){ const a=i*.85, cx=x+.42+Math.cos(a)*.14+i*.06, cy=y+.2+Math.sin(a)*.12+i*.03; bs.push({x0:cx-.055,y0:cy-.055,x1:cx+.055,y1:cy+.055,z0,z1:z0+4,c:VRRUB,top:()=>sh(VRRUB,1.15)}); }
  return bs; }
function vrHeadset(x,y){ SHARED.PNAME='VR headset'; return prop(vrHeadsetBoxes(x,y)); }
// ---- THE HEADSET'S STATION (owner, 16 Oct 2026: "put a VR headset station in the arcade"): a beige 80s console, 1.3 wide, its top 30 high,
// a black front panel with a green light on and the arcade's pink and blue stripe, a bevelled top; the headset resting on it, its cable down
// into the console's back. Its card: put the headset on (51-vr-headset); its light a faint green glow of its own
function vrStation(x,y){ SHARED.PNAME='VR headset station'; const Z=30, sd=o=>sided(o), BG=VRBG, PK=[232,74,160], BL=[70,140,240];
  const face=(nx,ny,X,Y,z,k)=>{ const a=(nx?Y-y:X-x)*24, c=z<2?sh(BG,.7):z>Z-2?sh(BG,1.05):BG;
    if(ny>0){ if(z>5&&z<Z-6&&Math.abs(a)<13){ if(Math.abs(a-9)<1.6&&Math.abs(z-(Z-10))<1.6)return Object.assign([120,255,150],{e:1}); return Math.abs(z-9)<1?PK:Math.abs(z-11)<1?BL:VRBLK; } }
    return sh(c,k*1.2); };
  const B=[sd({x0:x-.65,y0:y-.35,x1:x+.65,y1:y+.35,z0:0,z1:Z,c:BG,foot:1,fs:face,top:(X,Y)=>Math.min(X-x+.65,x+.65-X,Y-y+.35,y+.35-Y)<.05?sh(BG,1.08):sh(BG,.94)}),
    ...vrHeadsetBoxes(x-.1,y+.02,Z,false),{x0:x+.3,y0:y-.1,x1:x+.38,y1:y-.02,z0:Z,z1:Z+6,c:VRRUB,top:()=>sh(VRRUB,1.15)}];   // (its cable into the console)
  const p=prop(B); LAMPS.push({x,y:y+.45,z:Z-8,r:1.6,c:[.3,.95,.45],own:1,room:1,day:true,prop:p});
  p.opts=()=>typeof vrOpts==='function'?vrOpts(p):[]; return p; }
Object.assign(CATALOG,{'VR pine':(x,y)=>pine(x,y),'rock':(x,y)=>vrRock(x,y),'fallen log':(x,y)=>fallenLog(x,y),'VR headset':(x,y)=>vrHeadset(x,y),'VR headset station':(x,y)=>vrStation(x,y)});
Object.assign(CAT_INFO,{
  'VR pine':{no:'G-204',name:'Pine',dept:'vrforest',price:0,desc:'A tall dark pine. Nobody walks through one.',mat:'living'},
  'rock':{no:'G-205',name:'Rock',dept:'vrforest',price:0,desc:'A grey boulder with moss on its shady side.',mat:'granite'},
  'fallen log':{no:'G-206',name:'Fallen Log',dept:'vrforest',price:0,desc:'A trunk down on its side, one branch left on it.',mat:'pine'},
  'VR headset':{no:'P-727',name:'VR-85 Headset',dept:'apartment',price:0,desc:'A bulky beige visor with a black strap and a cable as thick as a thumb.',mat:'plastic, foam, glass'},
  'VR headset station':{no:'P-728',name:'VR-85 Station',dept:'apartment',price:0,desc:'The VR-85 on its console, plugged in, its light green. Put it on and pick where to go.',mat:'plastic, foam, glass'}});
for(const k of ['VR pine','rock','fallen log','VR headset','VR headset station'])KIND_OF[k]=k;
if(!CAT_DEPTS.some(d=>d[0]==='vrforest'))CAT_DEPTS.push(['vrforest','VR Forest']);   // (the old world's garden department went with it)

};
export {vrForest};
