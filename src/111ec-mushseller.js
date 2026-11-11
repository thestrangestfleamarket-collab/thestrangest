// THE MUSHROOM SELLER: MUSH, his body on the player's rig (a real skeleton: a scanned skull (data/skull.json), ribs in the robe's open V, bony hands and feet; a torn and patched brown robe, a tan strap across the chest, long dreadlocks, a big crooked witch's hat grown over with mushrooms, the tray heaped with mushrooms), and his booth at the park wall.
import {SHARED, THREE} from './003-shx.js';
import {PARK, pos} from './003b-systems.js';
import {MODS, TILE} from './006-map-pre.js';
import {HOMES} from './076-npc-map.js';
import {STALL} from './081-stalls.js';
import {BODIES} from './111a-bodies.js';
import {MERCH} from './111e-merch.js';
const MUSH={}, SKULL=__LAZY__("data/skull.json"); let swing=null;
{ const {SPH,CYL,TOR,grp,mk,paint,hash3,C,mix,fbm,lathe,bend,ribbon}=MERCH.K, PI=Math.PI, T=TILE, V3=THREE.Vector3;
  let seed=11; const rnd=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
  // a mushroom: its stem, the cap's dome (darker at its crown, speckled) and rolled rim, the gills under it; o {r cap, h stem, s stem radius, cap '#hex', stem, gill, k cap height, seg}
  const capPaint=(hx,r,k)=>{ const c0=C(hx), dk=c0.clone().multiplyScalar(.72), lt=c0.clone().lerp(C('#fff8ec'),.18); return (x,y,z)=>{ const t=Math.min(1,Math.max(0,y/(r*k))), n=fbm(x*260,y*260,z*260); let c=mix(lt,dk,t*t*1.1+(n-.5)*.5); if(hash3(Math.round(x*900),Math.round(y*900),Math.round(z*900))>.93)c=mix(c,C('#fbf3e2'),.5); return c; }; };
  const shroom=(par,at,rot,o)=>{ const g=grp(par,at,rot), r=o.r, h=o.h, s=o.s||r*.32, n=MERCH.K.sq(o.seg||12,6), k=o.k||.58, cap=o.cap.replace('plain:','');
    if(h>.002)mk(g,CYL(s*.92,s*1.12,h,Math.max(6,n>>1)),'plain:'+(o.stem||'#ece4d2'),[0,h/2,0]);
    mk(g,paint(SPH(r,n,Math.max(3,n>>1),0,PI*2,0,PI*.5),capPaint(cap,r,1)),'plain:vc',[0,h,0],[0,0,0],[1,k,1]);
    if(n>8){ mk(g,TOR(r*.93,r*.09,4,n),'plain:'+cap,[0,h,0],[PI/2,0,0]); mk(g,CYL(r*.9,s*1.05,r*.2,n,true),'plain:'+(o.gill||'#a88c76'),[0,h-r*.1,0]); }
    return g; };
  const UP=new V3(0,1,0), qq=new THREE.Quaternion();
  // one stood on a surface point, leaning out along its normal and up toward the light
  const grow=(par,p,nrm,o,lean=.5)=>{ const d=nrm.clone().multiplyScalar(lean).addScaledVector(UP,1-lean).add(new V3((rnd()-.5)*.3,0,(rnd()-.5)*.3)).normalize(); const g=shroom(par,[p.x,p.y,p.z],null,o); g.quaternion.multiply(qq.setFromUnitVectors(UP,d)); return g; };
  // the points of a geometry (after its bends) where fn(p,n) allows: things grow on them
  const spots=(g,fn)=>{ g.computeVertexNormals(); const P=g.attributes.position, Nm=g.attributes.normal, L=[]; for(let i=0;i<P.count;i++){ const p=new V3().fromBufferAttribute(P,i), n=new V3().fromBufferAttribute(Nm,i); if(fn(p,n))L.push([p,n]); } return L; };
  const pick=L=>L[Math.floor(rnd()*L.length)];
  // drop the triangles whose middle fn says is gone (holes worn through)
  const cut=(g,fn)=>{ const P=g.attributes.position, I=g.index.array, out=[], a=new V3(), b=new V3(), c=new V3(); for(let i=0;i<I.length;i+=3){ a.fromBufferAttribute(P,I[i]); b.fromBufferAttribute(P,I[i+1]); c.fromBufferAttribute(P,I[i+2]); a.add(b).add(c).multiplyScalar(1/3); if(!fn(a))out.push(I[i],I[i+1],I[i+2]); } g.setIndex(out); return g; };

  /* ---------- the colours: old bone, a sun-faded brown robe gone dark with dirt at the hem, tan leather, felt, dreadlocks of sun-bleached tan ---------- */
  const BONE=C('#dccfb2'), BONEL=C('#efe6d0'), BONED=C('#a08c68'), STAINB=C('#7d6a4c'), BLK=C('#060403');
  const boneC=(x,y,z)=>{ const n=fbm(x*34,y*34,z*34), f=fbm(x*120+5,y*120,z*120), s=fbm(x*9+2,y*9,z*9); let c=mix(BONE,BONEL,(n-.4)*1.6); c=mix(c,BONED,(.42-f)*1.8); if(s>.6)c=mix(c,STAINB,(s-.6)*2.2); return c; };
  const BR=C('#5d3d24'), BRD=C('#38230f'), FADE=C('#86654a'), STAIN=C('#2b1b10'), MUD=C('#3a3226'), THREAD=C('#c9b28a'), PATCH=[C('#6f5236'),C('#4a3a2c'),C('#7b5a2e')];
  const robeC=(ox,o={})=>(x,y,z)=>{ const a=Math.atan2(x,z), n1=fbm(x*6+ox,y*4,z*6), n2=fbm(x*20,y*20+ox,z*20), n3=fbm(x*70,y*70,z*70+ox), s=fbm(x*3+9+ox,y*3,z*3);
    let c=mix(BR,BRD,n1*1.6-.5); c=mix(c,FADE,(n2-.58)*3.2); c=mix(c,STAIN,(.36-n3)*2); if(s>.64)c=mix(c,STAIN,(s-.64)*3);
    if(o.hem!=null){ const w=o.hw||.3, t=Math.min(1,Math.max(0,(o.hem+w-y)/w)); c=mix(c,MUD,t*.85*(.6+.4*n2)); }
    for(const p of o.patch||[]){ const da=Math.atan2(Math.sin(a-p[0]),Math.cos(a-p[0]))*(p[4]||.2), dy=y-p[1], ex=Math.max(Math.abs(da)-p[2],Math.abs(dy)-p[3]);
      if(ex<0){ c=mix(PATCH[p[5]||0],BRD,fbm(x*30,y*30,z*30)-.3); if(ex>-.008&&((da+dy)*150%1+1)%1<.5)c=THREAD.clone(); } }
    for(const h of o.holes||[]){ const d=Math.hypot(Math.atan2(Math.sin(a-h[0]),Math.cos(a-h[0]))*.2,y-h[1])-h[2]; if(d<.018)c=mix(c,d<.008?THREAD:BRD,.6); }
    return c; };
  // the worn-through holes: [angle, height, size] in a part's own frame (an angle round it, its radius taken as .2)
  const holed=hs=>p=>{ const a=Math.atan2(p.x,p.z); for(const h of hs){ const d=Math.hypot(Math.atan2(Math.sin(a-h[0]),Math.cos(a-h[0]))*.2,p.y-h[1]); if(d<h[2]*(.75+.5*fbm(p.x*60,p.y*60,p.z*60)))return true; } return false; };
  // the hem's tears: notches cut up into it at random places round, each its own depth
  const TEARS=[...Array(15)].map((_,i)=>[i/15*PI*2+hash3(i,1,1)*.35,.04+hash3(i,2,1)*.14,.04+hash3(i,3,1)*.08]);
  const tear=(a,T)=>{ let u=0; for(const t of T){ const d=Math.abs(Math.atan2(Math.sin(a-t[0]),Math.cos(a-t[0]))); if(d<t[2])u=Math.max(u,t[1]*(1-d/t[2])); } return u; };
  const TAN=C('#c29a64'), TAND=C('#8a6638'), TANL=C('#dcbc88');
  const FELT=C('#3e3128'), FELTL=C('#5d4b3b'), MOSS=C('#56602f'), DUST=C('#7a6e5c');
  const feltC=(x,y,z)=>{ const n=fbm(x*16,y*16,z*16), f=fbm(x*80,y*80,z*80), m=fbm(x*5+3,y*5,z*5+7); let c=mix(FELT,FELTL,(n-.4)*1.8); c=mix(c,DUST,(f-.6)*1.5); if(m>.7)c=mix(c,MOSS,(m-.7)*3); return c; };
  const LOCK=[C('#c7ab7e'),C('#a88b5f'),C('#d9c39a'),C('#8f7550'),C('#b59a70'),C('#6f5a3e')];
  const CAPS=['#ece4d4','#e4d8c2','#f0e9dc','#d9c8a8','#ddd0b8'], TANS=['#c8aa82','#b8956a','#a47a4e','#c4a47c','#8c6a4a'];


  // a dreadlock: a lumpy rope along pts (its own radius rising and falling), rounded at the end; its colour from the root's dark to a sun-bleached tip
  const dread=(pts,r,col,k)=>{ const cv=new THREE.CatmullRomCurve3(pts.map(p=>new V3(...p))), ts=Math.max(26,MERCH.K.sq(40,14)), rs=Math.max(5,MERCH.K.sq(7,5)), g=new THREE.TubeGeometry(cv,ts,r,rs,false), P=g.attributes.position, cl=new Float32Array(P.count*3), ce=new V3(), q=new V3();
    for(let i=0;i<=ts;i++){ const t=i/ts; cv.getPointAt(t,ce); const f=(1+.22*Math.sin(t*70+k*3)+.12*Math.sin(t*151+k))*(t>.93?Math.sqrt(Math.max(.05,(1-t)/.07)):1)*(t<.04?.7+t*7:1);
      for(let j=0;j<=rs;j++){ const v=i*(rs+1)+j; q.fromBufferAttribute(P,v).sub(ce).multiplyScalar(f).add(ce); P.setXYZ(v,q.x,q.y,q.z); const n=fbm(q.x*140,q.y*140,q.z*140); let c=mix(col.clone().multiplyScalar(.62),col,Math.min(1,t*5)); c=mix(c,LOCK[2],Math.max(0,t-.6)*1.2); c=mix(c,LOCK[5],(.45-n)*1.4); cl.set([c.r,c.g,c.b],v*3); } }
    g.setAttribute('color',new THREE.BufferAttribute(cl,3)); return g; };

  const HAIRM=[], model=()=>{ const sk=MERCH.skel({hipY:.95,waist:.06,neck:.5,shX:.19,shY:.42,upper:.29,fore:.27,hipX:.1,thigh:.45,shin:.46}), {B}=sk;
    const BN='ivory:vc', bone=g=>paint(g,boneC), TOOTH='ivory:#e8dcbc';
    const H=grp(B.head,[0,.2,0]); H.scale.setScalar(1.28);
    /* the neck: six vertebrae down from the skull's base, each its body and the spine behind */
    for(let i=0;i<6;i++){ const y=-.075-i*.024; mk(H,bone(CYL(.015,.016,.014,12)),BN,[0,y,-.03]); mk(H,bone(MERCH.K.CAP(.005,.016,2,6)),BN,[0,y-.002,-.052],[PI/2+.3,0,0]);
      mk(H,bone(MERCH.K.CAP(.004,.03,2,6)),BN,[0,y,-.036],[0,0,PI/2]); }
    /* dreadlocks: some forty, from under the hat round the back and sides, past the shoulders to the small of the back; a few forward over the chest; a bead or a wrap on some */
    seed=11; const NL=Math.max(32,MERCH.K.N(46,22)), rL=.0085*Math.min(1.3,Math.sqrt(46/NL));
    for(let i=0;i<NL;i++){ let a=.75+(i+.5)/NL*(PI*2-1.5)+(rnd()-.5)*.08; if(a>PI)a-=PI*2; const sx=Math.sin(a), cz=Math.cos(a), len=.2*rnd(), fr=Math.abs(a)<1.55&&rnd()<.75, sg=Math.sign(sx);
      const r0=.085+.006*rnd(), y0=.02+rnd()*.035, pts=[[sx*r0,y0,-.014+cz*r0*1.12],[sx*.122,-.07,-.016+cz*.135],[sx*(fr?.15:.205),fr?-.16:-.2,fr?.06:-.024+cz*.16]];
      if(fr)pts.push([sg*(.085+rnd()*.02),-.32,.15+rnd()*.01],[sg*(.075+rnd()*.03),-.5-len*.5,.165+rnd()*.01]);
      else pts.push([sx*.235+(rnd()-.5)*.02,-.42,-.03+cz*.17],[sx*.24+(rnd()-.5)*.04,-.66-len,-.04+cz*.18]);
      const col=LOCK[Math.floor(rnd()*5)].clone().multiplyScalar(.9+rnd()*.2), r=rL*(.8+rnd()*.45), g=dread(pts,r,col,i);
      HAIRM.push(mk(H,g,'fur:vc'));
      if(rnd()<.16){ const cv=new THREE.CatmullRomCurve3(pts.map(p=>new V3(...p))), p=cv.getPointAt(.45+rnd()*.3), bg=new THREE.SphereGeometry(r*1.6,8,6), bc=new Float32Array(bg.attributes.position.count*3), c=rnd()<.5?C('#7a4a26'):rnd()<.5?C('#b8a27a'):C('#3d6b6a');
        for(let v=0;v<bc.length;v+=3)bc.set([c.r,c.g,c.b],v); bg.setAttribute('color',new THREE.BufferAttribute(bc,3)); HAIRM.push(mk(H,bg,'wood:vc',[p.x,p.y,p.z],[0,0,0],[1,1.3,1])); } }
    /* the hat: a big witch's hat of old felt, its wide brim waved and drooping, the crown tall and crooked, bent back at the tip; a leather band; moss and mushrooms all over it */
    const HT=grp(H,[0,.0,-.008],[-.08,0,.04]);
    { const g=lathe([[.098,.064],[.16,.068],[.24,.06],[.31,.044],[.352,.026],[.36,.016],[.35,.012],[.29,.032],[.2,.048],[.12,.054],[.098,.058]],40,72);
      bend(g,v=>{ const a=Math.atan2(v.x,v.z), r=Math.hypot(v.x,v.z), k=Math.max(0,(r-.1)/.26); v.y+=k*k*(.03*Math.sin(a*3+.7)+.014*Math.sin(a*7+2)-.022*Math.max(0,-Math.cos(a))); const e=r>.33?tear(a*1.4,TEARS)*.25:0; v.x*=1-e; v.z*=1-e; });
      mk(HT,paint(g,feltC),'cloth:vc');
      const brim=spots(g,(p,n)=>n.y>.6&&Math.hypot(p.x,p.z)>.13&&Math.hypot(p.x,p.z)<.33);
      const NB=MERCH.K.N(64,20), gB=Math.min(1.8,Math.sqrt(64/NB)); for(let i=0;i<NB;i++){ const [p,n]=pick(brim), cr=(.01+rnd()*.017)*gB; grow(HT,p,n,{r:cr,h:cr*(.3+rnd()*.9),cap:rnd()<.7?CAPS[i%5]:TANS[i%5],seg:8,k:.75},.35); }
      for(let i=0;i<MERCH.K.N(9,4);i++){ const [p,n]=pick(brim), cr=.024+rnd()*.02; grow(HT,p,n,{r:cr,h:.03+rnd()*.04,s:cr*.26,cap:TANS[i%5],gill:'#9a7e62',seg:14},.25);
        for(let j=0;j<3;j++){ const q=p.clone().add(new V3((rnd()-.5)*.04,0,(rnd()-.5)*.04)); grow(HT,q,n,{r:cr*.45,h:.012+rnd()*.015,cap:TANS[(i+j)%5],seg:8},.5); } }
      for(let i=0;i<MERCH.K.N(26,10);i++){ const [p,n]=pick(brim); mk(HT,paint(SPH(.012+rnd()*.012,8,5),(x,y,z)=>mix(MOSS,C('#7d8a3c'),fbm(x*200,y*200,z*200))),'fur:vc',[p.x,p.y,p.z],[0,rnd()*3,0],[1.6,.45,1.3]); } }
    { const g=lathe([[.108,.05],[.106,.12],[.096,.2],[.082,.28],[.064,.36],[.046,.44],[.03,.51],[.016,.57],[.004,.62],[.001,.63]],44,40);
      bend(g,v=>{ const t=Math.max(0,(v.y-.06)/.57); v.x+=.03*t*t+.05*Math.pow(Math.max(0,t-.6),2)*4; v.z-=.12*Math.pow(t,2.2)+.12*Math.pow(Math.max(0,t-.72),1.5)*3; v.y-=.06*Math.pow(Math.max(0,t-.72),1.2); const r=1+.035*Math.sin(t*16+Math.atan2(v.x,v.z)*2)*t; v.x*=r; v.z*=r; });
      mk(HT,paint(g,feltC),'cloth:vc');
      mk(HT,paint(TOR(.109,.012,8,40),(x,y,z)=>mix(C('#4e331d'),C('#6d4a2a'),fbm(x*90,y*90,z*90))),'leather:vc',[0,.075,0],[PI/2,0,0],[1,1,1.5]);
      mk(HT,TOR(.016,.004,6,14),'metal:#9c8350',[0,.077,.112]);
      const cone=spots(g,(p,n)=>p.y>.1&&n.y>-.2), NC=MERCH.K.N(54,18), gC=Math.min(1.7,Math.sqrt(54/NC));
      for(let i=0;i<NC;i++){ const [p,n]=pick(cone), cr=(.008+rnd()*.014)*gC*(1-p.y*.6); grow(HT,p,n,{r:cr,h:cr*(.4+rnd()*.9),cap:rnd()<.6?CAPS[i%5]:TANS[i%5],seg:8,k:.75},.45); }
      for(let i=0;i<MERCH.K.N(10,4);i++){ const [p,n]=pick(cone), w=.022+rnd()*.018, B2=grp(HT,[p.x,p.y,p.z]); B2.quaternion.copy(new THREE.Quaternion().setFromUnitVectors(new V3(0,0,1),new V3(n.x,0,n.z).normalize()));
        for(let j=0;j<2;j++)mk(B2,paint(SPH(w*(1-j*.3),12,5,0,PI,0,PI/2),capPaint(j?'#b8875a':'#8a5a34',w,.6)),'plain:vc',[0,-j*.012,0],[0,0,0],[1,.32,.85]); }
      for(let i=0;i<MERCH.K.N(18,8);i++){ const [p]=pick(cone); mk(HT,paint(SPH(.01+rnd()*.01,8,5),(x,y,z)=>mix(MOSS,C('#7d8a3c'),fbm(x*200,y*200,z*200))),'fur:vc',[p.x,p.y,p.z],[rnd()*3,rnd()*3,0],[1.4,.55,1.4]); }
      const tp=new V3(); let ty=-1; const Pp=g.attributes.position; for(let i=0;i<Pp.count;i++)if(Pp.getY(i)>ty){ ty=Pp.getY(i); tp.fromBufferAttribute(Pp,i); }
      shroom(HT,[tp.x,tp.y-.012,tp.z],[-.5,0,.3],{r:.04,h:.03,s:.01,cap:'#c6a67e',gill:'#7c6450',seg:18,k:.55}); }
    /* the robe: brown, gone thin and torn; open in a V at the chest where the ribs show; worn through in places, patched, its hem torn and dark with dirt, flaring wide as it falls */
    const vOpen=(g,top,bot,g0,gm=.04,fz=.78)=>bend(g,v=>{ const a=Math.atan2(v.x,v.z), t=Math.max(0,Math.min(1,(v.y-bot)/(top-bot))), gw=gm+(g0-gm)*t*t; const u=(((a<0?a+PI*2:a)-g0)/(PI*2-2*g0)); const na=gw+u*(PI*2-2*gw), r=Math.hypot(v.x,v.z/fz); v.x=Math.sin(na)*r; v.z=Math.cos(na)*r*fz; });
    const TP=[[PI*.75,.2,.035,.05,.2,1],[-PI*.6,.08,.03,.03,.2,2]];
    { const g=lathe([[.165,-.09],[.185,.04],[.198,.17],[.212,.29],[.222,.37],[.205,.43],[.15,.475],[.1,.505],[.086,.52]],30,48,.78,.6,PI*2-1.2); vOpen(g,.5,.12,.6);
      mk(B.torso,paint(cut(g,holed([[PI*.9,.3,.025],[-2.2,.05,.02]])),robeC(0,{patch:TP,holes:[[PI*.9,.3,.025],[-2.2,.05,.02]]})),'cloth:vc');
      const ln=lathe([[.155,-.07],[.176,.04],[.19,.17],[.203,.29],[.21,.37],[.195,.43],[.142,.47],[.095,.5]],10,36,.78,.6,PI*2-1.2); vOpen(ln,.5,.12,.6); mk(B.torso,ln,'cloth:#1e130b'); }
    { const g=lathe([[.12,.525],[.2,.5],[.27,.46],[.305,.39],[.322,.3],[.332,.18],[.338,.08]],24,52,.82,.95,PI*2-1.9); vOpen(g,.5,.1,.95,.8,.82);
      bend(g,v=>{ const a=Math.atan2(v.x,v.z); if(v.y<.2){ const k=(.2-v.y)/.12; v.y+=tear(a*2,TEARS)*k*.6; const r=Math.hypot(v.x,v.z)||1, d=.012*Math.sin(a*9)*k; v.x+=v.x/r*d; v.z+=v.z/r*d; } });
      mk(B.torso,paint(cut(g,holed([[PI*.85,.2,.018]])),robeC(4,{holes:[[PI*.85,.2,.018]],patch:[[-PI*.7,.3,.04,.04,.25,0]]})),'cloth:vc'); }
    /* the ribs in the V: twelve pairs on the spine, curving round to the breastbone, the collarbones over them */
    { const RB=grp(B.torso,[0,0,0]);
      for(let i=0;i<8;i++){ const y=.42-i*.042, w=.105+.03*Math.sin(Math.min(1,(i+1)/6)*PI*.6), dz=.1-i*.002, dr=.035+i*.006;
        for(const s of [1,-1]){ const pts=[[s*.02,y+.01,-.06],[s*w*.9,y,-.04],[s*w,y-.02,.02],[s*w*.75,y-dr*.7,.075],[s*.03,y-dr+.012,dz+.012]];
          mk(RB,bone(MERCH.K.TUBE(new THREE.CatmullRomCurve3(pts.map(p=>new V3(...p))),16,.0065,5,false)),BN,[0,0,0],[0,0,0],[1,1.15,1]); } }
      mk(RB,bone(MERCH.K.CAP(.014,.17,3,8)),BN,[0,.33,.106],[-.1,0,0],[1.2,1,.5]); mk(RB,bone(SPH(.022,10,6)),BN,[0,.44,.1],[0,0,0],[1.3,.8,.6]);
      for(const s of [1,-1])mk(RB,bone(MERCH.K.TUBE(new THREE.CatmullRomCurve3([[s*.015,.455,.1],[s*.08,.47,.1],[s*.16,.46,.06]].map(p=>new V3(...p))),10,.008,6,false)),BN);
      for(let i=0;i<9;i++)mk(RB,bone(CYL(.017,.018,.018,10)),BN,[0,.45-i*.045,-.065]);
      mk(RB,SPH(.12,16,10),'plain:#0d0805',[0,.26,-.03],[0,0,0],[1,1.6,.55]); }
    /* the skirt: a wide flare to just above the ground, deep folds that sway, the hem torn into points and ragged with dirt; holes worn through to the bones */
    { const HL=[[PI*.15,-.55,.03],[-PI*.75,-.4,.035],[PI*.62,-.7,.028],[-PI*.25,-.78,.022],[PI,-.62,.03]];
      const g=lathe([[.175,.09],[.19,0],[.21,-.15],[.24,-.35],[.285,-.55],[.335,-.72],[.38,-.84],[.4,-.88]],40,60,.86);
      bend(g,v=>{ const a=Math.atan2(v.x,v.z), t=Math.max(0,-v.y)/.88, d=t*(.045*Math.sin(a*6+v.y*2)+.022*Math.sin(a*11-v.y*6+1.3)), r=Math.hypot(v.x,v.z)||1; v.x+=v.x/r*d; v.z+=v.z/r*d;
        if(t>.72){ const k=(t-.72)/.28; v.y+=tear(a,TEARS)*k*1.2+(Math.cos(a)>0?.04*k*Math.cos(a):0); } });
      const s=mk(B.hips,paint(cut(g,holed(HL)),robeC(7,{hem:-.82,holes:HL,patch:[[-PI*.4,-.3,.05,.06,.2,0],[PI*.55,-.15,.04,.04,.2,2]]})),'cloth:vc'); s.userData.skirt=1;
      const ln=cut(lathe([[.168,.06],[.182,0],[.2,-.15],[.23,-.35],[.272,-.55],[.32,-.72],[.36,-.82]],10,40,.86),holed(HL.map(h=>[h[0],h[1],h[2]*1.1]))); const l=mk(B.hips,ln,'cloth:#24170d'); l.userData.skirt=1;
      for(let i=0;i<MERCH.K.N(26,10);i++){ const a=rnd()*PI*2, r=.4+.04*Math.sin(a*6), y=-.86+tear(a,TEARS)*1.2+(Math.cos(a)>0?.04*Math.cos(a):0), l2=.03+rnd()*.06;
        const f=mk(B.hips,CYL(.003,.002,l2,4),'cloth:#4a3424',[Math.sin(a)*r,y-l2/2,Math.cos(a)*r*.86],[(rnd()-.5)*.3,0,(rnd()-.5)*.3]); f.userData.skirt=1; } }
    for(const s of [1,-1]){ const n=s>0?'L':'R';
      mk(B['upperArm'+n],paint(CYL(.072,.08,.29,18),robeC(9+s,{patch:s>0?[[PI*.5,-.05,.05,.04,.4,1]]:[]})),'cloth:vc',[0,-.16,0]); mk(B['upperArm'+n],paint(SPH(.078,16,10),robeC(14+s)),'cloth:vc',[0,-.03,0],[0,0,0],[1,.9,1]);
      /* the sleeve: a wide bell, its cuff torn ragged */
      const sl=CYL(.078,.13,.3,24,6,true); bend(sl,v=>{ const a=Math.atan2(v.x,v.z), t=(.15-v.y)/.3, d=t*.014*Math.sin(a*5+1); v.x*=1+d*7; v.z*=1+d*7; if(t>.7)v.y+=tear(a*1.7+s,TEARS)*(t-.7)/.3*.7; });
      mk(B['forearm'+n],paint(sl,robeC(12+s,{hem:-.15,hw:.09})),'cloth:vc',[0,-.13,0]); mk(B['forearm'+n],CYL(.072,.118,.28,16,1,true),'cloth:#24170d',[0,-.135,0]);
      for(const dx of [-.008,.009])mk(B['forearm'+n],bone(CYL(.0075,.0085,.12,8)),BN,[dx,-.22,0]);
      /* a hand of bones under the tray: the wrist's small bones, the palm's long ones, three joints a finger curled forward, the thumb */
      const Hd=B['hand'+n];
      for(const [x,y] of [[-.012,-.008],[.004,-.006],[.016,-.01],[-.006,-.02],[.01,-.022]])mk(Hd,bone(SPH(.0085,8,6)),BN,[x,y,.002]);
      for(let i=0;i<4;i++){ const fx=(i-1.5)*.0165, l0=.036-Math.abs(i-1.5)*.003; mk(Hd,bone(MERCH.K.CAP(.0045,l0,2,6)),BN,[fx*.9,-.028-l0/2,.002]);
        const l1=.026-Math.abs(i-1.5)*.003, F=grp(Hd,[fx,-.03-l0,.004],[.45,0,0]); mk(F,bone(MERCH.K.CAP(.0045,l1,2,6)),BN,[0,-l1/2,0]); mk(F,bone(SPH(.0062,6,4)),BN,[0,0,0]);
        const G=grp(F,[0,-l1,0],[.9,0,0]); mk(G,bone(MERCH.K.CAP(.004,.017,2,6)),BN,[0,-.011,0]); mk(G,bone(SPH(.0055,6,4)),BN,[0,0,0]);
        const E=grp(G,[0,-.02,0],[.6,0,0]); mk(E,bone(MERCH.K.CAP(.0035,.011,2,6)),BN,[0,-.008,0]); }
      const Th=grp(Hd,[-s*.024,-.022,.012],[.5,0,s*.7]); mk(Th,bone(MERCH.K.CAP(.005,.026,2,6)),BN,[0,-.016,0]); const T2=grp(Th,[0,-.032,0],[.4,0,0]); mk(T2,bone(MERCH.K.CAP(.0045,.018,2,6)),BN,[0,-.012,0]);
      /* the legs: thigh bone, shin and its thin twin, the knee; a foot of bones, heel, the arch's long bones and the toes */
      mk(B['thigh'+n],bone(CYL(.017,.015,.4,10)),BN,[0,-.22,0]); mk(B['thigh'+n],bone(SPH(.026,10,8)),BN,[0,-.43,.006],[0,0,0],[1.3,.9,1]);
      mk(B['shin'+n],bone(CYL(.017,.013,.42,10)),BN,[0,-.22,.006]); mk(B['shin'+n],bone(CYL(.007,.006,.4,8)),BN,[s*.022,-.22,-.01]); mk(B['shin'+n],bone(SPH(.017,10,6)),BN,[0,-.01,.022],[0,0,0],[1,1,.6]);
      const Ft=B['shoe'+n]; mk(Ft,bone(SPH(.022,12,8)),BN,[0,.04,-.025],[0,0,0],[.9,1.1,1.4]); mk(Ft,bone(SPH(.02,10,8)),BN,[0,.05,.008],[0,0,0],[1.2,.8,1]);
      for(let i=0;i<5;i++){ const fx=s*(i-2)*.014*-1, l=.052-Math.abs(i-1)*.004; mk(Ft,bone(MERCH.K.CAP(.0048,l,2,6)),BN,[fx,.028,.03+l/2],[PI/2-.32,0,0]);
        const tz=.032+l+.006; mk(Ft,bone(SPH(.0058,6,4)),BN,[fx,.012,tz]); mk(Ft,bone(MERCH.K.CAP(.004,.016,2,6)),BN,[fx,.008,tz+.012],[PI/2+.15,0,0]); } }
    /* the tan leather strap across his chest, shoulder to hip, stitched at its edges; a brass buckle, a pouch on it at his side */
    { const pts=[[.12,.47,-.03],[.09,.41,.135],[.02,.33,.165],[-.07,.22,.17],[-.16,.1,.14],[-.225,-.02,.03]];
      mk(B.torso,ribbon(pts,.05,48,6,(u,v)=>{ const e=Math.abs(u)>.38, st=Math.abs(Math.abs(u)-.3)<.06&&(v*90%1)<.5; let c=mix(TAN,TANL,fbm(v*40,u*6,1)*1.3-.4); c=mix(c,TAND,fbm(v*90,u*20,3)-.25); return st?TANL.clone().multiplyScalar(1.08):e?TAND:c; },{fz:.78,lift:.028}),'leather:vc');
      mk(B.torso,ribbon([[.12,.47,-.03],[.06,.32,-.16],[-.1,.12,-.17],[-.225,-.02,.03]],.05,24,4,(u,v)=>mix(TAN,TAND,fbm(v*40,u*6,2)),{fz:.78,lift:.03}),'leather:vc');
      const K2=grp(B.torso,[-.02,.32,.205],[-.25,0,-.75]); mk(K2,TOR(.02,.0045,6,16),'metal:#a8874a',[0,0,0],[0,0,0],[1,1.3,1]); mk(K2,CYL(.003,.003,.04,6),'metal:#8c7040',[0,0,.004],[0,0,PI/2]);
      const PO=grp(B.torso,[-.21,-.03,.1],[0,-1.1,0]); mk(PO,paint(MERCH.K.LATHE([[.001,-.06],[.05,-.055],[.06,-.02],[.058,.02],[.05,.035]],14,.6),(x,y,z)=>mix(TAND,TAN,fbm(x*60,y*60,z*60))),'leather:vc');
      mk(PO,paint(SPH(.056,12,6,0,PI*2,0,PI*.5),(x,y,z)=>mix(TAND,C('#6a4a26'),fbm(x*60,y*60,z*60))),'leather:vc',[0,.03,.004],[.25,0,0],[1,.45,.62]); }
    /* the tray held out at the waist: a round wooden platter, its grain, heaped with white and brown mushrooms, some on their sides, some upturned */
    const TR=grp(B.torso,[0,.105,.39],[.12,0,0]); TR.userData.rigid=1;
    mk(TR,paint(CYL(.275,.255,.024,44),(x,y,z)=>{ const r=Math.hypot(x,z), gr=Math.sin(r*260+fbm(x*20,z*20,1)*6); return mix(C('#6e4a2c'),C('#4a2e18'),(gr*.5+.5)*.6+fbm(x*90,z*90,y*90)*.3); }),'wood:vc');
    mk(TR,TOR(.268,.013,8,48),'wood:#5a3a22',[0,.012,0],[PI/2,0,0]);
    seed=37; const NT=MERCH.K.N(52,18), gT=Math.min(1.5,Math.pow(52/NT,.4)); for(let i=0;i<NT;i++){ const rr=.235*Math.sqrt(rnd()), a=rnd()*PI*2, hgt=.012+.075*Math.max(0,1-rr/.24)*(.6+.4*rnd()), cr=(.021+rnd()*.015)*gT, h=(.018+rnd()*.018)*gT, k=rnd(), at=[Math.sin(a)*rr,hgt,Math.cos(a)*rr];
      const cp=rnd()<.2?TANS[i%5]:CAPS[i%5], o={r:cr,h,s:cr*.36,cap:cp,gill:'#a48a74',seg:10,k:.62};
      if(k<.4)shroom(TR,at,[(rnd()-.5)*.6,rnd()*PI*2,(rnd()-.5)*.6],o);
      else if(k<.8){ at[1]+=cr*.6; const b=rnd()*PI*2; shroom(TR,at,[Math.cos(b)*1.45,b,Math.sin(b)*1.45],o); }
      else { at[1]+=h+cr*.4; shroom(TR,at,[PI+(rnd()-.5)*.7,rnd()*PI*2,(rnd()-.5)*.5],o); } }
    // the hair leaves the baked body: its own mesh on the head bone, so it can swing (MUSH.hairGeo, in the head bone's frame)
    sk.root.updateMatrixWorld(true); MUSH.headY=new V3().setFromMatrixPosition(B.head.matrixWorld).y; MUSH.skullAt=H.matrixWorld.clone(); const P=[], Nn=[], Cc=[], I=[];
    for(const m of HAIRM){ const g=m.geometry.clone().applyMatrix4(m.matrixWorld); g.computeVertexNormals(); const o=P.length/3;
      for(const [A,L] of [['position',P],['normal',Nn],['color',Cc]])for(const v of g.attributes[A].array)L.push(v); for(const i of g.index.array)I.push(i+o); m.parent.remove(m); }
    HAIRM.length=0;
    const hg=MUSH.hairGeo=new THREE.BufferGeometry(); hg.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); hg.setAttribute('normal',new THREE.Float32BufferAttribute(Nn,3)); hg.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3)); hg.setIndex(I);
    return sk; };
  MUSH.model=model;

  /* ---------- on the street: held at his booth, turning his head to you; the tray held still out in front ---------- */
  const HOLD={ua:[17,4],fa:[78,-15]}, look=N=>{ const s=N.st, d=Math.hypot(pos.x-s.x,pos.z-s.z); let a=0; if(d<7*T&&d>.2*T){ a=Math.atan2(pos.x-s.x,pos.z-s.z)-s.hd; a=Math.atan2(Math.sin(a),Math.cos(a)); a=Math.max(-.9,Math.min(.9,a)); }
    const now=performance.now()/1000, dt=Math.min(.2,now-(N._lt||now)); N._lt=now; N._lk=(N._lk||0)+(a-(N._lk||0))*Math.min(1,dt*2.5); if(Math.abs(N._lk-a)<.004)N._lk=a; return N._lk*180/PI; };
  const body=MERCH.add({key:'mushroom',q:.3,label:'THE MUSHROOM SELLER',height:1.75,model,size:11.5,hd:0,idle:(t,N)=>MERCH.pose({nod:-5,bend:3,look:N?look(N):0,L:HOLD,R:HOLD}),after:(B,N)=>{ if(swing)swing(N); }});
  const N=MUSH.N=body&&body.npc;
  /* ---------- his hair swings: a pendulum from under the hat, pushed by how his head moves (a turn, a nod, a step) and by the wind's gusts, settling still ---------- */
  if(N&&MUSH.hairGeo){ const HI=BODIES.BONES.indexOf('head'), HM={value:N.PM.value[HI]}, SW={value:new THREE.Vector2()};
    const bendV=sh=>{ sh.uniforms.uHead=HM; sh.uniforms.uSw=SW; sh.vertexShader='uniform mat4 uHead; uniform vec2 uSw;\n'+sh.vertexShader.replace('#include <begin_vertex>','vec3 hp=position; float hw=pow(clamp((.2-(hp.y-'+MUSH.headY.toFixed(4)+'))/.75,0.,1.),1.6); hp.xz+=uSw*hw; hp.y+=.5*dot(uSw,uSw)*hw/.75; vec3 transformed=(uHead*vec4(hp,1.)).xyz;'); };
    const mat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.9,metalness:0,side:THREE.DoubleSide});
    mat.onBeforeCompile=sh=>{ bendV(sh); sh.vertexShader=sh.vertexShader.replace('#include <beginnormal_vertex>','vec3 objectNormal=mat3(uHead)*normal;'); sh.fragmentShader=sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance+=diffuseColor.rgb*.06;'); };
    mat.customProgramCacheKey=()=>'mushhair';
    const dep=new THREE.MeshDepthMaterial({side:THREE.DoubleSide,depthPacking:THREE.RGBADepthPacking}), dis=new THREE.MeshDistanceMaterial({side:THREE.DoubleSide}); dep.onBeforeCompile=bendV; dis.onBeforeCompile=bendV; dep.customProgramCacheKey=()=>'mushhaird'; dis.customProgramCacheKey=()=>'mushhairx';
    const hm=new THREE.Mesh(MUSH.hairGeo,mat); hm.customDepthMaterial=dep; hm.customDistanceMaterial=dis; hm.castShadow=hm.receiveShadow=true;
    Object.defineProperty(hm,'boundingSphere',{configurable:true,get(){ return N.g.children[0].boundingSphere; },set(){}}); N.g.add(hm); MUSH.hair=hm; MUSH.sw=SW.value;
    const o=new THREE.Vector2(), v=new THREE.Vector2(), M=new THREE.Matrix4(), tip=new V3(), p0=new V3(), v0=new V3(), vp=new V3(), a=new V3(), ex=new V3(), ez=new V3(); let t0=0, primed=false;
    swing=N=>{ const now=performance.now()/1000, dt=now-t0; t0=now; M.multiplyMatrices(N.g.matrixWorld,N.PM.value[HI]); tip.set(0,-.38+MUSH.headY,-.16).applyMatrix4(M);
      if(!primed||dt>1||dt<=0){ p0.copy(tip); v0.set(0,0,0); primed=true; return; }
      vp.subVectors(tip,p0).divideScalar(dt); a.subVectors(vp,v0).divideScalar(dt); p0.copy(tip); v0.copy(vp);
      ex.setFromMatrixColumn(M,0); const sc=ex.length()||1; ex.divideScalar(sc); ez.setFromMatrixColumn(M,2).normalize();
      let ax=-a.dot(ex)/sc*3, az=-a.dot(ez)/sc*3; const am=Math.hypot(ax,az); if(am>30){ ax*=30/am; az*=30/am; }
      const w=Math.max(0,(PARK.windK?PARK.windK.value:0)-.6); if(w>0){ const g=w*(.5+.5*Math.sin(now*.8))*(.5+.5*Math.sin(now*.31+1))*2.2; ax+=g*ex.x; az+=g*ez.x; }
      const n=Math.min(24,Math.ceil(dt*120)), h=dt/n; for(let i=0;i<n;i++){ v.x+=(-20*o.x-2.2*v.x+ax)*h; v.y+=(-20*o.y-2.2*v.y+az)*h; o.addScaledVector(v,h); }
      if(Math.abs(o.x)>.11){ o.x=Math.sign(o.x)*.11; v.x=0; } if(o.y<-.05||o.y>.07){ o.y=Math.max(-.05,Math.min(.07,o.y)); v.y=0; }
      if(o.lengthSq()<2.5e-7&&v.lengthSq()<4e-6&&!w){ o.set(0,0); v.set(0,0); } SW.value.copy(o); }; }
  /* ---------- his skull: a real one (data/skull.json), its own textured mesh on the head bone, fetched after the start ---------- */
  if(N&&MUSH.skullAt)SKULL().then(d=>{ if(!d||!d.p)return; const HI=BODIES.BONES.indexOf('head'), HM={value:N.PM.value[HI]}, s=.0842;
    const M=MUSH.skullAt.clone().multiply(new THREE.Matrix4().makeTranslation(0,.101-1.0687*s,.012)).multiply(new THREE.Matrix4().makeScale(s,s,s));
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(d.p,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(d.uv,2)); g.setIndex(d.i); g.applyMatrix4(M); g.computeVertexNormals();
    const tex=(u,srgb)=>{ const t=new THREE.TextureLoader().load(u); if(srgb)t.colorSpace=THREE.SRGBColorSpace; t.flipY=true; return t; };
    const bendV=sh=>{ sh.uniforms.uHead=HM; sh.vertexShader='uniform mat4 uHead;\n'+sh.vertexShader.replace('#include <begin_vertex>','vec3 transformed=(uHead*vec4(position,1.)).xyz;'); };
    const mat=new THREE.MeshStandardMaterial({map:tex(d.map,true),normalMap:tex(d.nmap,false),normalScale:new THREE.Vector2(.6,.6),roughness:.62,metalness:0});
    mat.onBeforeCompile=sh=>{ bendV(sh); sh.vertexShader=sh.vertexShader.replace('#include <beginnormal_vertex>','vec3 objectNormal=mat3(uHead)*normal;'); sh.fragmentShader=sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance+=diffuseColor.rgb*.08;'); };
    mat.customProgramCacheKey=()=>'mushskull';
    const dep=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking}), dis=new THREE.MeshDistanceMaterial(); dep.onBeforeCompile=bendV; dis.onBeforeCompile=bendV; dep.customProgramCacheKey=()=>'mushskulld'; dis.customProgramCacheKey=()=>'mushskullx';
    const m=new THREE.Mesh(g,mat); m.customDepthMaterial=dep; m.customDistanceMaterial=dis; m.castShadow=m.receiveShadow=true;
    Object.defineProperty(m,'boundingSphere',{configurable:true,get(){ return N.g.children[0].boundingSphere; },set(){}}); N.g.add(m); MUSH.skull=m; }).catch(()=>{});
  if(N){ const st=N.st; st.hold=true; st.to=st.next=null; N.H=2.3*T;
    const wait=()=>{ if(!MODS.park)return setTimeout(wait,500); const P=PARK, X=x=>SHARED.BOD.XS(x+(P.ox||0)), Z=y=>SHARED.BOD.ZS(y+(P.oy||0)), A=STALL.at('mush');
      MUSH.booth=STALL.build({X,Z,x0:A.x0,x1:A.x1,y:P.y0,veg:false,seed:7,gate:A.gate,name:A.name});
      if(!HOMES.keeper(N))MERCH.stand(N,MUSH.booth); };
    wait(); }
  window.SELLERDBG=()=>({swing:!!swing,skull:!!MUSH.skull,sw:MUSH.sw?[+MUSH.sw.x.toFixed(4),+MUSH.sw.y.toFixed(4)]:null,booth:!!MUSH.booth,key:N&&N.key,x:N&&+N.st.x.toFixed(2),z:N&&+N.st.z.toFixed(2),y:N&&+N.g.position.y.toFixed(2),vis:N&&N.g.visible,tris:body&&body.tris()}); }
export {MUSH};
