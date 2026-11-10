// THE DANCE BOOK'S RECORDINGS (owner, 9 Nov 2026: "Dances CMU motion-capture library"): each dance of the CMU Graphics Lab Motion Capture Database (mocap.cs.cmu.edu, free to use)
// read by tools/mocap-read.py and fitted to the Walker's rig by tools/m2m-moves.cjs's own fit (MIN=0 build first); from each recording the loop the dance is danced in: the stretch
// (1.5 to 4 s) whose end comes back nearest its start without turning him round, the livelier the better; its seam eased shut; ordered by how hard it is (how fast and how far its
// limbs go, how much it turns and rises). -> data/dances.json (fetched when the dance book opens or someone near dances), each key packed flat.
// Inputs: data/full/cmu/<subject>.asf and <trial>.amc from http://mocap.cs.cmu.edu/subjects/<s>/, then python3 tools/mocap-read.py <s>.asf <t>.amc data/full/cmu/rec/<t>.json 4
// node tools/dances-bake.cjs [count=39]
const fs=require('fs'), path=require('path'), {fit}=require('./m2m-moves.cjs');
const REC=path.join(__dirname,'../data/full/cmu/rec'), OUT=path.join(__dirname,'../data/dances.json'), N=+(process.argv[2]||39), KF=10;
// the trials and their names in the book (CMU's own descriptions)
const LIST=[['05_02','Expressive Arms'],['05_03','Turn Step'],['05_04','Folding Arms'],['05_05','Raised Leg'],['05_06','Pirouettes'],['05_07','Shifted Pirouette'],['05_08','Rond De Jambe'],
  ['05_09','Glissade'],['05_10','Glissade Derriere'],['05_11','Sideways Steps'],['05_12','Arms Held High'],['05_13','Small Jetes'],['05_14','Retire'],['05_15','Attitude'],['05_16','Coupe Dessous'],
  ['05_17','Grand Jete'],['05_18','Arabesque'],['05_19','Bending Back'],['05_20','Jete En Tournant'],['49_09','Side Arabesque'],['49_12','Arching Arms'],['49_22','Lean Back'],
  ['55_01','Whirl'],['55_02','Lambada'],['55_12','Dancing Bear'],['55_20','Hippo Ballerina'],['55_25','Dancing Animal'],['55_27','Dancing Ant'],
  ['60_01','Salsa Basic'],['60_03','Salsa Side'],['60_05','Salsa Turn'],['60_08','Salsa Cross'],['60_10','Salsa Shine'],['60_12','Salsa Back'],['60_14','Salsa Spin'],
  ['61_02','Salsa Rock'],['61_04','Salsa Open'],['61_06','Salsa Hustle'],['61_09','Salsa Swing'],['61_11','Salsa Kick'],['61_13','Salsa Sway'],['61_15','Salsa Flair'],
  ['93_03','Charleston Kick'],['93_04','Side By Side'],['93_05','Charleston Swing'],['93_06','Lindy Hop'],['93_08','Fancy Charleston'],
  ['94_01','Indian Dance I'],['94_03','Indian Dance II'],['94_05','Indian Dance III'],['94_07','Indian Dance IV'],['94_09','Indian Dance V'],['94_11','Indian Dance VI'],['94_13','Indian Dance VII'],['94_15','Indian Dance VIII'],
  ['90_30','Russian Dance'],['90_31','Russian Squat'],['90_32','Moonwalk Glide'],['141_12','The Twist'],['143_34','Chicken Dance'],['143_35','Macarena']];
const J=['head','chest','elbowL','elbowR','wristL','wristR','kneeL','kneeR','ankleL','ankleR','shoulderL','shoulderR'];
const head=f=>Math.atan2(-(f.hipL[2]-f.hipR[2]),f.hipL[0]-f.hipR[0]);   // (the hips' line's heading)
const desc=f=>{ const h=head(f), c=Math.cos(h), s=Math.sin(h), p=f.pelvis, o=[]; for(const k of J){ const x=f[k][0]-p[0], z=f[k][2]-p[2]; o.push(x*c-z*s,f[k][1]-p[1],x*s+z*c); } o.push(0,p[1],0); return o; };
const dist=(a,b)=>{ let e=0; for(let i=0;i<a.length;i+=3)e+=Math.hypot(a[i]-b[i],a[i+1]-b[i+1],a[i+2]-b[i+2]); return e/(a.length/3); };
const wrap=a=>{ while(a>Math.PI)a-=2*Math.PI; while(a<-Math.PI)a+=2*Math.PI; return a; };
const out=[];
for(const [t,name] of LIST){ const fp=path.join(REC,t+'.json'); if(!fs.existsSync(fp)){ console.log('missing',t); continue; }
  const M=JSON.parse(fs.readFileSync(fp)), F=M.frames, fps=M.fps, D=F.map(desc), H=F.map(head), n=F.length;
  const sp=[0]; for(let i=1;i<n;i++)sp.push(dist(D[i],D[i-1])*fps);   // (how fast the limbs move about the hips, m/s)
  const stand=Math.max(...F.map(f=>f.pelvis[1]));
  const avg=sp.slice().sort((a,b)=>a-b)[Math.floor(n*.6)];   // (the clip's lively pace: a loop must move at least half that, not stand in a held pose)
  let best=null;
  for(let h=Math.round(1.5*fps);h<=Math.round(4*fps);h+=3)for(let i=Math.round(.05*n);i+h<n-5;i+=3){ let turn=0; for(let j=i+1;j<=i+h;j++)turn+=wrap(H[j]-H[j-1]);
      if(Math.abs(turn)>.5)continue; let low=1e9, en=0; for(let j=i;j<=i+h;j++){ low=Math.min(low,F[j].pelvis[1]); en+=sp[j]; } if(low<stand*.45||en/(h+1)<.5*avg)continue;
      const e=dist(D[i],D[i+h])+.15*Math.abs(turn), score=e-.12*en/(h+1); if(!best||score<best.score)best={i,h,e,score,turn}; }
  if(!best){ console.log('no loop',t); continue; }
  const {i,h}=best, W=F.slice(i,i+h+1);
  let en=0, rng=0, rise=0, spin=0; for(let j=i;j<=i+h;j++){ en+=sp[j]/(h+1); spin+=Math.abs(wrap(H[j]-(H[j-1]??H[j])))*fps/(h+1); }
  for(let q=0;q<D[0].length;q++){ let m=0,s=0; for(let j=i;j<=i+h;j++)m+=D[j][q]/(h+1); for(let j=i;j<=i+h;j++)s+=(D[j][q]-m)**2/(h+1); rng+=Math.sqrt(s)/D[0].length*3; }
  rise=Math.max(...W.map(f=>f.pelvis[1]))-Math.min(...W.map(f=>f.pelvis[1]));
  const mv=fit(M,{from:i/fps,to:(i+h)/fps,loop:true,kf:KF,quiet:true}), K=mv.keys;
  // the seam: the last third of a second eased into the first key, the last key the first again
  const ease=(a,b,w)=>Array.isArray(a)&&Array.isArray(b)?a.map((x,j)=>ease(x,b[j],w)):typeof a==='number'&&typeof b==='number'?+(a+(b-a)*w).toFixed(2):a;
  const E=Math.min(4,K.length>>2); for(let q=1;q<=E;q++){ const k=K[K.length-1-E+q], w=q/E, c=k[1], c0=K[0][1];
    for(const f of ['root','yaw','roll','pitch','side','bend','cyaw','nod'])c[f]=ease(c[f],c0[f],w);
    for(const s of 'LR')for(const f of ['ua','fa','foot','ik','th','sh'])if(f in c[s]&&f in c0[s])c[s][f]=ease(c[s][f],c0[s][f],w); }
  { const last=K[K.length-1]; last[1]=JSON.parse(JSON.stringify(K[0][1])); }
  // packed: a key a 1/KF s, each [hipsY, yaw, roll, pitch, side, bend, cyaw, nod, then each side ua0 ua1 fa0 fa1 foot, 1 ik0 ik1 ik2 kpx kpy kpz | 0 th0 th1 sh0 sh1]
  const k=[]; for(const [,c] of K){ k.push(c.root[1],c.yaw,c.roll,c.pitch,c.side,c.bend,c.cyaw,c.nod); for(const s of 'LR'){ const g=c[s]; k.push(...g.ua,...g.fa,g.foot); if(g.ik)k.push(1,...g.ik,g.kp.x,g.kp.y,g.kp.z); else k.push(0,...g.th,...g.sh); } }
  const d=en+2*rng+.25*Math.min(4,spin)+3*rise;
  out.push({id:t,name,dur:+(h/fps).toFixed(2),d:+d.toFixed(3),seam:+best.e.toFixed(3),speed:en,n:K.length,k});
  console.log(t.padEnd(7),name.padEnd(20),'from',(i/fps).toFixed(1)+'s',(h/fps).toFixed(1)+'s','seam',(best.e*100).toFixed(1)+'cm','turn',best.turn.toFixed(2),'| speed',en.toFixed(2),'range',rng.toFixed(2),'spin',spin.toFixed(2),'rise',rise.toFixed(2),'=',d.toFixed(2)); }
// the book's: the best-closing loops, then by how hard
const pick=out.filter(o=>o.seam<.15&&o.speed>=.25).sort((a,b)=>a.seam-b.seam).slice(0,N).sort((a,b)=>a.d-b.d);
const J2={src:'CMU Graphics Lab Motion Capture Database, mocap.cs.cmu.edu (created with funding from NSF EIA-0196217); free to use',kf:KF,dances:pick.map(({id,name,dur,d,k})=>({id,name,dur,d,k}))};
fs.writeFileSync(OUT,JSON.stringify(J2)); console.log(OUT,fs.statSync(OUT).size,'bytes,',pick.length,'dances of',out.length);
