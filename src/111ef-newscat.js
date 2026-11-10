// THE CAT IN THE RAINCOAT: NEWSCAT, a grumpy cream cat in a glossy yellow raincoat and hood, sitting on the Market St sidewalk by the subway stairs reading the paper, a tin and spilt papers beside him (a smooth MERCH body on the player's rig, at the low detail).
import {SHARED, THREE} from './003-shx.js';
import {pos} from './003b-systems.js';
import {LEVEL, TILE} from './006-map-pre.js';
import {HOMES} from './076-npc-map.js';
import {MERCH} from './111e-merch.js';
const NEWSCAT={};
{ const {SPH,CYL,TOR,BOX,CONE,CAP,grp,mk,paint,C,mix,fbm,hash3}=MERCH.K, PI=Math.PI, V3=THREE.Vector3;
  const FUR='fur:vc', COAT='ivory:#f6d21c', COATD='ivory:#e0b812', BOOT='leather:#151313', PINK='skin:#d9a094';
  const furC=(x,y,z)=>mix(C('#efe2b8'),C('#cdb680'),fbm(x*50,y*50,z*50)*1.1-.25);
  // a printed page: off-white, its columns of grey type and a headline band (u across, v down)
  const page=(w,h,nu,nv,seed)=>{ const g=new THREE.PlaneGeometry(w,h,nu,nv), p=g.attributes.position, cl=new Float32Array(p.count*3), c=new THREE.Color();
    for(let i=0;i<p.count;i++){ const u=p.getX(i)/w+.5, v=.5-p.getY(i)/h, col=Math.floor(u*4), row=Math.floor(v*nv), gut=Math.abs(u*4-col-.5)>.44;
      const head=v<.14, pic=col===1&&v>.2&&v<.45, ink=!gut&&(head?hash3(col,0,seed)>.2:pic?1:hash3(col,row,seed)>.35);
      c.set(head&&ink?'#4a4644':pic?'#8a8682':ink?'#a9a59c':'#e9e4d6'); cl.set([c.r,c.g,c.b],i*3); }
    g.setAttribute('color',new THREE.BufferAttribute(cl,3)); return g; };
  const model=()=>{ const sk=MERCH.skel({hipY:.4,waist:.05,neck:.27,shX:.12,shY:.23,upper:.16,fore:.15,hipX:.07,thigh:.2,shin:.19}), {B}=sk;
    /* the head: a broad cream cat's face, puffed cheeks, a pink nose, the downturned mouth, heavy-lidded sulking eyes, whiskers */
    const H=grp(B.head,[0,.12,.01]);
    mk(H,paint(SPH(.12,30,22),furC),FUR,[0,0,0],[0,0,0],[1.08,.92,.95]);
    for(const s of [1,-1]){ mk(H,paint(SPH(.055,14,10),furC),FUR,[s*.052,-.045,.075],[0,0,0],[1.1,.85,.9]);
      mk(H,SPH(.026,12,10),'ivory:#3d2a12',[s*.045,.012,.098],[0,0,0],[1.2,.75,.6]); mk(H,SPH(.012,8,6),'ivory:#050404',[s*.043,.01,.112],[0,0,0],[.7,1,.5]);
      const lid=grp(H,[s*.045,.016,.1],[0,0,s*.28]); mk(lid,paint(SPH(.03,12,8,0,PI*2,0,PI*.5),furC),FUR,[0,-.004,0],[.35,0,0],[1.25,.9,.85]);
      mk(H,paint(SPH(.03,10,8),furC),FUR,[s*.05,.045,.09],[0,0,-s*.5],[1.3,.45,.6]);
      for(const k of [-1,0,1])mk(H,CYL(.0012,.0008,.13,3),'plain:#f4f0e4',[s*.1,-.05+k*.01,.1],[0,s*(.15+k*.06),PI/2-s*.12*k]); }
    mk(H,SPH(.016,10,8),PINK,[0,-.022,.118],[0,0,0],[1.2,.75,.8]); mk(H,paint(SPH(.035,12,8),furC),FUR,[0,-.06,.1],[0,0,0],[1.2,.6,.75]);
    mk(H,CAP(.0025,.03,1,4),'plain:#5a4038',[-.012,-.073,.123],[0,0,PI/2+.35]); mk(H,CAP(.0025,.03,1,4),'plain:#5a4038',[.012,-.073,.123],[0,0,PI/2-.35]);
    /* the ears through the hood, the hood: a glossy yellow rain hood with a seam over the crown, open at the face */
    for(const s of [1,-1]){ const E=grp(H,[s*.1,.09,-.01],[0,0,-s*.75]); mk(E,paint(CONE(.05,.11,8),furC),FUR,[0,.05,0],[0,0,0],[1,1,.5]); mk(E,CONE(.035,.08,8),PINK,[0,.045,.012],[0,0,0],[1,1,.3]); }
    mk(H,SPH(.142,20,14,PI/2+.85,PI*2-1.7,0,PI*.8),COAT,[0,.01,-.008],[0,0,0],[1.06,1,1]);
    mk(H,TOR(.12,.012,4,20),COATD,[0,0,.085],[0,0,0],[1.05,1.1,1]);

    /* the raincoat: a glossy yellow coat, broad at the hem, its collar up; sleeves with turned cuffs; rain trousers and black boots */
    mk(B.torso,MERCH.K.lathe([[.115,-.06],[.13,.05],[.135,.15],[.125,.21],[.09,.25],[.06,.27]],8,20,.88),COAT);
    mk(B.torso,TOR(.07,.022,5,16),COAT,[0,.25,.01],[PI/2,0,0],[1,1.1,1]);
    for(let i=0;i<3;i++)mk(B.torso,SPH(.008,6,4),'ivory:#3a2c10',[0,.18-i*.07,.117]);
    mk(B.hips,MERCH.K.lathe([[.13,.05],[.15,-.02],[.17,-.1],[.18,-.13]],6,22,.9),COAT);
    for(const s of [1,-1]){ const n=s>0?'L':'R';
      mk(B['upperArm'+n],CYL(.045,.042,.17,10),COAT,[0,-.08,0]); mk(B['upperArm'+n],SPH(.047,10,8),COAT);
      mk(B['forearm'+n],CYL(.042,.05,.15,10),COAT,[0,-.07,0]); mk(B['forearm'+n],TOR(.05,.012,4,12),COATD,[0,-.14,0],[PI/2,0,0]);
      const Hd=B['hand'+n]; mk(Hd,paint(SPH(.03,10,8),furC),FUR,[0,-.03,.004],[0,0,0],[1,1.15,.7]);
      for(let i=0;i<4;i++){ const F=grp(Hd,[(i-1.5)*.013*s,-.055,.008],[.6+i*.05,0,0]); mk(F,paint(CAP(.008,.018,1,5),furC),FUR,[0,-.012,0]); }
      const Th=grp(Hd,[-s*.024,-.03,.016],[.6,0,s*.6]); mk(Th,paint(CAP(.008,.018,1,5),furC),FUR,[0,-.012,0]);
      mk(B['thigh'+n],CYL(.052,.047,.21,10),COAT,[0,-.1,0]); mk(B['shin'+n],CYL(.048,.052,.18,10),COAT,[0,-.08,0]);
      mk(B['shoe'+n],CAP(.04,.07,2,8),BOOT,[0,.035,.03],[PI/2,0,0],[1,1,.85]); }
    /* the paper he reads, open in both paws, tilted up to his face */
    { const P=grp(B.torso,[0,.13,.21],[-.55,0,0]); for(const s of [1,-1]){ const pg=grp(P,[s*.075,0,0],[0,-s*.22,0]); mk(pg,page(.15,.22,4,14,s>0?3:5),'plain:vc',[s*.0,0,0]); } }
    /* beside him on the ledge: the tin with its red and cream label, two spilt papers */
    mk(B.hips,CYL(.034,.034,.085,12),'metal:#3a3a3a',[.2,-.058,.12]); mk(B.hips,CYL(.0345,.0345,.05,12),'plain:#d8c8a0',[.2,-.062,.12]); mk(B.hips,CYL(.0346,.0346,.016,12),'plain:#b8382a',[.2,-.04,.12]);
    for(const [x,z,a,sd] of [[.28,.26,.5,7],[.18,.36,-.3,9]]){ const g=grp(B.hips,[x,-.099,z],[-PI/2,0,a]); mk(g,page(.2,.15,4,8,sd),'plain:vc'); }
    return sk; };
  // sitting on the ledge, the paper up, his head bowed to it; when you come near he glances up at you, sour, and back down
  const SIT={root:[0,4.6,0],th:[100,12],sh:[30,8]}, look=N=>{ const s=N.st, d=Math.hypot(pos.x-s.x,pos.z-s.z); let a=0, up=0; if(d<5*TILE&&d>.2*TILE){ a=Math.atan2(pos.x-s.x,pos.z-s.z)-s.hd; a=Math.atan2(Math.sin(a),Math.cos(a)); a=Math.max(-.6,Math.min(.6,a)); up=1; }
    const now=performance.now()/1000, dt=Math.min(.2,now-(N._lt||now)); N._lt=now; const k=Math.min(1,dt*2); N._lk=(N._lk||0)+(a-(N._lk||0))*k; N._up=(N._up||0)+(up-(N._up||0))*k;
    if(Math.abs(N._lk-a)<.004)N._lk=a; if(Math.abs(N._up-up)<.004)N._up=up; return N._lk; };
  const pose=(t,N)=>{ const a=N&&!N.sheetOn?look(N):0, u=N?N._up||0:0;
    return MERCH.pose({...SIT,nod:22-14*u,look:a*180/PI*.8,bend:6,L:{ua:[34,14],fa:[78,-26],th:SIT.th,sh:SIT.sh},R:{ua:[34,14],fa:[78,-26],th:SIT.th,sh:SIT.sh}}); };
  const body=MERCH.add({key:'newscat',label:'THE CAT IN THE RAINCOAT',height:.95,model,size:6.5,q:.3,at:100,idle:pose});
  const N=NEWSCAT.N=body&&body.npc;
  // his spot: the sidewalk just east of the subway stairs, facing the road
  if(N){ const st=N.st, Wp=LEVEL.places.find(p=>p.id==='subway'), b=HOMES.band&&HOMES.band(); if(Wp&&b){ const x=SHARED.BOD.XS(Wp.x1+3)+1.6*TILE, z=b.rows[0], mid=(b.rows[0]+b.rows[1])/2;
      if(new URLSearchParams(location.search).get('sheet')!=='newscat'){ Object.assign(st,{x,z,to:null,next:null,hold:true,pin:true,hd:Math.atan2(0,mid-z)}); Object.assign(st.home,{x,z,r:0}); N.free=()=>true; } } }
  window.NEWSCATDBG=()=>N?{x:+N.st.x.toFixed(2),z:+N.st.z.toFixed(2),hd:+N.st.hd.toFixed(2),vis:N.g.visible,tris:body.tris()}:null; }
