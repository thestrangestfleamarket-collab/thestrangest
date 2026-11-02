// THE BEDROOM: the owner's isometric apartment picture's bedroom in your apartment's front corner (26 Oct 2026): the low walnut bed and its floating shelf of plants, the bench of folded blankets, the white L-desk with its two screens and two chairs, the cubbies and book shelves, the coffee hutch, the half walls with the TV and the record player, the terrazzo and mauve rugs; the small things real bodies; the drawers open, the screens and the record player switch, the cat sleeps.
import {THREE} from './003-shx.js';
import {ROOMK} from './150a-bedroom.js';
{ ROOMK.parts.push(c=>{ '@apts'; const {R,part,thing,mat,rbox,col,tex,rnd,V3,cap,cur,solid,shelf,clip,bake}=c;
    const p=(geo,m,u,h,v,ry=0,par=cur(),cast=true)=>part(geo,m,u,h,v,ry,par,cast), keep=me=>{ me.userData.keep=1; return me; };
    const MC=new Map(), mc=(c0,o)=>{ const k=c0.join()+(o?JSON.stringify(Object.keys(o)):''); if(!MC.has(k))MC.set(k,mat(c0,o)); return MC.get(k); };   // one material a colour, so the merge joins same-coloured parts
    const loose=(g,name,m,seat,wire)=>{ bake(g); R.loose.push([g,name,m,seat,wire]); return g; };
    const WAL=[84,54,40], WHT=[238,236,232], WHT2=[226,224,220], SLAT=[128,88,60];
    const wal=mc(WAL), walL=mc([110,72,52]), wht=mc(WHT), wht2=mc(WHT2), slat=mc(SLAT), dark=mc([30,30,32]), steel=mc([176,178,182]);
    const glassM=mat([210,226,232],{transparent:true,opacity:.35,depthWrite:false});

    /* ---------- the textures: terrazzo, the mauve rug, the screens, the speaker fronts ---------- */
    const terr=tex(512,512,(g,W,H)=>{ g.fillStyle='#e6dfcf'; g.fillRect(0,0,W,H); for(let i=0;i<1100;i++){ const r=rnd(), c=r<.5?'#b4b0a8':r<.75?'#8e8c88':r<.93?'#cfc4ae':'#66666a';
        g.fillStyle=c; g.save(); g.translate(rnd()*W,rnd()*H); g.rotate(rnd()*7); const a=2+rnd()*4.5, b=.8+rnd()*1.6; g.beginPath(); g.moveTo(-a,0); g.lineTo(0,-b); g.lineTo(a*.8,b*.4); g.lineTo(-a*.3,b); g.closePath(); g.fill(); g.restore(); } },true);
    terr.repeat.set(1.1,1.1);
    const mauveT=tex(128,128,(g,W,H)=>{ g.fillStyle='#b49aaa'; g.fillRect(0,0,W,H); for(let i=0;i<1600;i++){ g.fillStyle=`rgba(${rnd()<.5?120:220},${rnd()<.5?100:200},${rnd()<.5?120:214},.07)`; g.fillRect(rnd()*W,rnd()*H,2,2); } },true);
    mauveT.repeat.set(1.4,1.4);
    const hills=tex(256,128,(g,W,H)=>{ const s=g.createLinearGradient(0,0,0,H*.6); s.addColorStop(0,'#5b7fa0'); s.addColorStop(.55,'#e8b07a'); s.addColorStop(1,'#f6d690'); g.fillStyle=s; g.fillRect(0,0,W,H);
      g.fillStyle='rgba(255,238,190,.9)'; g.beginPath(); g.arc(W*.62,H*.5,9,0,7); g.fill();
      for(const [y,c,a] of [[.52,'#7d9a62',.04],[.62,'#5f8a4a',.07],[.74,'#4b7a3c',.05],[.86,'#3c6630',.08]]){ g.fillStyle=c; g.beginPath(); g.moveTo(0,H); for(let x=0;x<=W;x+=8)g.lineTo(x,H*(y+a*Math.sin(x*.025+y*9))); g.lineTo(W,H); g.fill(); }
      g.strokeStyle='#d8c890'; g.lineWidth=3; g.beginPath(); g.moveTo(W*.5,H); g.quadraticCurveTo(W*.56,H*.78,W*.62,H*.6); g.stroke(); });
    const desk2T=tex(128,96,(g,W,H)=>{ const s=g.createLinearGradient(0,0,W,H); s.addColorStop(0,'#2a3c66'); s.addColorStop(1,'#5a4a86'); g.fillStyle=s; g.fillRect(0,0,W,H); g.fillStyle='rgba(255,255,255,.75)'; for(let i=0;i<4;i++)g.fillRect(8,10+i*14,10,10); g.fillStyle='rgba(20,20,30,.8)'; g.fillRect(0,H-8,W,8); });
    const showT=tex(256,128,(g,W,H)=>{ const s=g.createLinearGradient(0,0,0,H); s.addColorStop(0,'#2c3a6a'); s.addColorStop(.6,'#c86a5a'); s.addColorStop(1,'#f0a060'); g.fillStyle=s; g.fillRect(0,0,W,H);
      g.fillStyle='#1c2030'; for(let i=0;i<14;i++){ const w=10+rnd()*18, h=20+rnd()*50, x=i*19; g.fillRect(x,H-h,w,h); } g.fillStyle='#ffd88a'; for(let i=0;i<60;i++)g.fillRect(rnd()*W,H*.6+rnd()*H*.4,2,2); });
    const spk=tex(64,112,(g,W,H)=>{ g.fillStyle='#1c1c1e'; g.fillRect(0,0,W,H); const ring=(y,r)=>{ g.fillStyle='#3a3a3e'; g.beginPath(); g.arc(W/2,y,r,0,7); g.fill(); g.fillStyle='#0c0c0e'; g.beginPath(); g.arc(W/2,y,r*.78,0,7); g.fill(); g.fillStyle='#9a9a9e'; g.beginPath(); g.arc(W/2,y,r*.6,0,7); g.fill(); g.fillStyle='#4a4a4e'; g.beginPath(); g.arc(W/2,y,r*.22,0,7); g.fill(); };
      ring(28,15); ring(76,24); });
    const photoT=tex(64,80,(g,W,H)=>{ const s=g.createLinearGradient(0,0,0,H); s.addColorStop(0,'#8ab4d8'); s.addColorStop(1,'#2a6a64'); g.fillStyle=s; g.fillRect(0,0,W,H); g.fillStyle='#e8f0f0'; g.fillRect(0,0,W,4); g.fillStyle='#1e4a40'; g.beginPath(); g.moveTo(0,H); g.lineTo(W*.4,H*.5); g.lineTo(W,H*.8); g.lineTo(W,H); g.fill(); });

    /* ---------- the plants: a pot and its leaves, a few kinds, each one a body ---------- */
    const LG=new Map(), leafG=(w,l,k=1.4)=>{ const key=w+'/'+l; if(LG.has(key))return LG.get(key); const sh=new THREE.Shape(); sh.moveTo(0,0); sh.bezierCurveTo(w,l*.2,w*.85,l*.75,0,l); sh.bezierCurveTo(-w*.85,l*.75,-w,l*.2,0,0);
      const g=new THREE.ShapeGeometry(sh,3), q=g.attributes.position; for(let i=0;i<q.count;i++){ const x=q.getX(i), y=q.getY(i); q.setZ(i,-x*x*k/w-y*y*.6); } g.computeVertexNormals(); LG.set(key,g); return g; };
    const leafAt=(g,geo,m,x,y,z,az,el,s=1)=>{ const me=p(geo,m,x,y,z,0,g); me.rotation.order='YXZ'; me.rotation.y=az; me.rotation.x=Math.PI/2-el; me.scale.setScalar(s); return me; };
    const POTS={white:[236,232,226],black:[44,44,46],grey:[96,98,100],terra:[176,92,62],cream:[214,206,190]};
    const GRN=[[62,120,66],[78,144,74],[96,164,84],[56,104,62],[110,176,96]];
    const plant=(u,h,v,kind,pot='white',s0=1,ry=0)=>{ const g=thing(u,h,v,ry), s=s0*1.55, pr=.07*s0, ph=.1*s0, pm=mc(POTS[pot]);
      p(new THREE.CylinderGeometry(pr,pr*.78,ph,14),pm,0,ph/2,0,0,g); p(new THREE.CircleGeometry(pr*.92,12).rotateX(-Math.PI/2),mc([56,40,30]),0,ph-.006,0,0,g,false);
      const lm=[0,1,2].map(i=>mc(GRN[(i+(kind.length*3))%GRN.length],{side:THREE.DoubleSide}));
      if(kind==='bush'){ for(let i=0;i<26;i++){ const az=rnd()*6.28, el=.2+rnd()*1.1, r=pr*(.2+rnd()*.7); leafAt(g,leafG(.025*s,.065*s),lm[i%3],Math.cos(az)*r,ph+.02*s+rnd()*.09*s,Math.sin(az)*r,az,el); } }
      else if(kind==='pothos'){ for(let i=0;i<12;i++){ const az=rnd()*6.28, r=pr*(.2+rnd()*.6); leafAt(g,leafG(.03*s,.05*s),lm[i%3],Math.cos(az)*r,ph+.01+rnd()*.05*s,Math.sin(az)*r,az,.3+rnd()*.7); }
        for(let t=0;t<3;t++){ const az=t*2.1+rnd(); for(let k=0;k<5;k++){ const r=pr*1.05, y=ph-k*.05*s; leafAt(g,leafG(.024*s,.04*s),lm[(t+k)%3],Math.cos(az)*r,y,Math.sin(az)*r,az+(rnd()-.5),-.3-rnd()*.6); } } }
      else { const n=kind==='big'?15:10, L=(kind==='big'?.16:.11)*s; for(let i=0;i<n;i++){ const az=i/n*6.28+rnd()*.5, el=.5+rnd()*.8, r=pr*.35, hh=ph+.02+rnd()*.12*s;
          const st=p(new THREE.CylinderGeometry(.004,.005,hh-ph+.02,4),lm[0],Math.cos(az)*r*.5,(hh+ph)/2,Math.sin(az)*r*.5,0,g); st.rotation.z=Math.cos(az)*.2; st.rotation.x=-Math.sin(az)*.2;
          leafAt(g,leafG(L*.42,L),lm[i%3],Math.cos(az)*r,hh,Math.sin(az)*r,az,el); }
        if(kind==='flower')for(let i=0;i<7;i++){ const az=rnd()*6.28, r=pr*rnd()*.8; p(new THREE.IcosahedronGeometry(.016*s,0),mc([246,244,238]),Math.cos(az)*r,ph+.1*s+rnd()*.06*s,Math.sin(az)*r,0,g); } }
      bake(g); g.traverse(o=>{ if(o.isMesh&&lm.includes(o.material))o.userData.soft=1; }); R.loose.push([g,'PLANT',.3+s0*.3]); return g; };   // the leaves stay out of its body: the pot is what you push
    const books=(u,h,v,list,ry=0,lie=false)=>{ const g=thing(u,h,v,ry); let o=0;
      for(const [r,g0,b,t,hh=.2] of list){ const c0=[r,g0,b];{ if(lie){ p(rbox(.16,t,.22,.004),mc(c0),0,o+t/2,0,0,g); o+=t; } else { p(rbox(.15,hh,t,.004),mc(c0),0,hh/2,o+t/2,0,g); o+=t+.002; } } }
      if(!lie)for(const q of g.children)q.position.z-=o/2; return loose(g,'BOOKS',.15*list.length); };

    /* ---------- the floor: the terrazzo rug under the whole bedroom, the mauve rug under the desks ---------- */
    cap('TERRAZZO RUG',()=>{ const m=mat([255,255,255],{map:terr,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}); p(new THREE.PlaneGeometry(3.85,5.9).rotateX(-Math.PI/2),m,1.98,.003,3.0,0,cur(),false);
      const e=mat([200,190,168],{polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}); for(let i=0;i<60;i++)p(new THREE.PlaneGeometry(.05+rnd()*.05,.02).rotateX(-Math.PI/2),e,.06+rnd()*3.85,.0032,.04,rnd()*.8-.4,cur(),false); },{bake:true});
    cap('MAUVE RUG',()=>{ p(new THREE.PlaneGeometry(2.6,1.8).rotateX(-Math.PI/2),mat([255,255,255],{map:mauveT,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),2.0,.006,4.45,0,cur(),false); },{bake:true});

    /* ---------- the bed: a low walnut platform and headboard, floating nightstands, the shelf of plants above; the duvet over the sides, three pillows, the rolled throw ---------- */
    const BV=1.55, BW=1.6, BL=2.12;
    cap('BED',()=>{ const g=new THREE.Group(); g.position.set(0,0,BV); cur().add(g);
      p(rbox(BL,.2,BW+.1,.02),wal,BL/2+.02,.12,0,0,g); p(rbox(BL-.2,.06,BW-.1,.01),dark,BL/2,.03,0,0,g);
      p(rbox(.06,.78,2.62,.015),wal,.03,.39,0,0,g); for(const s of [-1,1])p(rbox(.42,.08,.46,.012),wal,.27,.53,s*1.1,0,g);
      p(rbox(BL-.06,.2,BW-.04,.06),mc([240,238,236]),BL/2+.03,.33,0,0,g);
      p(rbox(.3,.05,BW-.02,.025),mc([236,236,240]),.62,.455,0,0,g);
      const nu=34, nv=26, top=.46, D=.3, L0=.72, Lb=BL-L0+.06, Wb=BW+.16, gb=new THREE.PlaneGeometry(1,1,nu,nv), q=gb.attributes.position;
      for(let i=0;i<q.count;i++){ const a=(q.getX(i)+.5)*(Lb+D), b=(q.getY(i)+.5)*(Wb+2*D)-D, ov=Math.max(0,a-Lb), sv=Math.max(0,-b,b-Wb), dr=Math.min(D,Math.hypot(ov,sv)), wav=.018*Math.sin(a*16+b*11)*Math.min(1,dr*6);
        q.setXYZ(i,L0+Math.min(a,Lb)+ov*.08+(ov>0?wav:0),top+.014*Math.sin(a*5.2)*Math.sin(b*4.1)*(1-Math.min(1,dr*8))-dr*.92,Math.max(0,Math.min(Wb,b))-Wb/2+(b<0?-1:b>Wb?1:0)*(sv*.08+wav)); }
      gb.computeVertexNormals(); p(gb,mat([206,184,180],{side:THREE.DoubleSide}),0,0,0,0,g,false);
      const roll=p(new THREE.CapsuleGeometry(.12,BW-.12,4,12).rotateX(Math.PI/2),mc([214,212,222]),1.82,.55,0,0,g); roll.scale.y=.7;
      solid(0,BV-BW/2-.05,BL+.04,BV+BW/2+.05,.5); for(const s of [-1,1])solid(.04,BV+s*1.1-.23,.48,BV+s*1.1+.23,.57); },{wire:'sit',bake:true});
    cap('WALL SHELF',()=>{ p(rbox(.24,.06,2.3,.012),wal,.12,1.02,1.5); shelf(0,.35,.24,2.65,.99,1.05); });
    for(const [u,v,w,c0,tilt] of [[.3,1.12,.66,[240,240,242],-.6],[.3,1.98,.62,[236,236,240],-.6],[.55,1.55,.56,[176,168,190],-.35]]){ const g=thing(u,.47,v), pil=p(rbox(.32,.15,w,.07,5),mc(c0),0,.12,0,0,g); pil.rotation.z=tilt; loose(g,'PILLOW',.6); }
    plant(.24,.57,BV+1.1,'leafy','cream',.8); plant(.13,1.05,.45,'bush','black',1); plant(.13,1.05,.88,'pothos','black',.85); plant(.13,1.05,1.32,'bush','grey',.9); plant(.13,1.05,2.18,'big','black',1.05);
    cap('BENCH',()=>{ p(rbox(.48,.34,1.32,.1,5),mc([196,172,184]),2.44,.17,BV); p(rbox(.52,.05,1.36,.022),walL,2.44,.36,BV); solid(2.2,BV-.68,2.7,BV+.68,.385); },{wire:'sit',bake:true});
    for(const [v,L] of [[BV+.42,[[46,88,130],[58,104,148]]],[BV-.02,[[180,200,224]]],[BV-.44,[[118,70,52],[214,170,188]]]]){ const g=thing(2.44,.385,v,(rnd()-.5)*.2); let o=0;
      for(const c0 of L){ p(rbox(.34,.06,.3,.025,3),mc(c0),0,o+.03,0,0,g); o+=.062; } loose(g,'BLANKETS',.8); }

    /* ---------- the cabinets and the desks: white, wood slats on their corners, drawers that slide out ---------- */
    // n drawers in a cabinet's face: the face at f across axis ax ('x' a face looking along u, 'z' along v), spanning a0..a1 and y0..y1; each slides out by dir
    const drawers=(g,n,ax,f,a0,a1,y0,y1,dir)=>{ const dh=(y1-y0)/n, w=a1-a0-.02, am=(a0+a1)/2, s=Math.sign(dir[0]+dir[1]);
      for(let i=0;i<n;i++){ const d=new THREE.Group(); d.userData.drawer=dir; g.add(d); const y=y0+dh*(i+.5);
        if(ax==='x'){ keep(p(rbox(.02,dh-.012,w,.004),wht2,f,y,am,0,d)); keep(p(rbox(.38,dh-.04,w-.04,.004),wht,f-s*.2,y,am,0,d)); }
        else { keep(p(rbox(w,dh-.012,.02,.004),wht2,am,y,f,0,d)); keep(p(rbox(w-.04,dh-.04,.38,.004),wht,am,y,f-s*.2,0,d)); } } };
    const CV0=2.92, CV1=3.46;
    cap('DRAWERS',()=>{ const g=cur(); p(rbox(.58,.8,CV1-CV0,.01),wht,.29,.4,(CV0+CV1)/2); for(let i=0;i<4;i++)p(rbox(.02,.8,.026,.004),slat,.585,.4,CV0+.02+i*.034);
      drawers(g,4,'x',.59,CV0+.15,CV1-.01,.02,.78,[.3,0]); solid(0,CV0,.6,CV1,.8); },{wire:'drawers',bake:true});
    { const g=new THREE.Group(); cap('CAT',()=>{ cur().add(g); g.position.set(.3,.8,CV0+.27); g.rotation.y=.5; const fm=mc([34,32,38]), body=keep(p(new THREE.SphereGeometry(.13,14,10),fm,0,.075,0,0,g)); body.scale.set(1,.55,.75); body.userData.breath=1; body.userData.s0=.55;
      const hd=new THREE.Group(); hd.position.set(.13,.06,.04); hd.userData.head=1; g.add(hd); keep(p(new THREE.SphereGeometry(.06,12,9),fm,0,0,0,0,hd)).scale.set(1,.85,1);
      for(const s of [-1,1]){ const e=keep(p(new THREE.ConeGeometry(.022,.045,4),fm,.0,.05,s*.032,0,hd)); e.rotation.x=s*.3; }
      const tl=keep(p(new THREE.TorusGeometry(.12,.018,6,14,2.4),fm,-.02,.025,0,0,g)); tl.rotation.x=Math.PI/2; tl.rotation.z=1.3;
      for(const s of [-1,1])keep(p(new THREE.CapsuleGeometry(.018,.06,3,6).rotateZ(Math.PI/2),fm,.15,.018,s*.05,0,g)); },{wire:'cat'}); }
    const DV0=CV1, DV1=5.32, TOP=.76;
    cap('DESK',()=>{ const g=cur(); p(rbox(.68,.04,DV1-DV0,.008),wht,.34,TOP-.02,(DV0+DV1)/2); p(rbox(.5,.006,.85,.003),mat([176,204,192],{transparent:true,opacity:.8}),.38,TOP+.003,4.55,0,g,false);
      p(rbox(.58,TOP-.04,.44,.01),wht,.29,(TOP-.04)/2,5.08); drawers(g,2,'x',.59,4.87,5.29,.04,TOP-.06,[.28,0]);
      solid(0,DV0,.68,DV1,TOP); },{wire:'drawers',bake:true});
    cap('HUTCH',()=>{ const H=1.28, v0=DV1, v1=5.96; p(rbox(.52,.03,v1-v0,.006),wht,.26,H-.015,(v0+v1)/2); p(rbox(.52,.03,v1-v0,.006),wht,.26,.015,(v0+v1)/2);
      for(const v of [v0+.015,v1-.015])p(rbox(.52,H,.03,.006),wht,.26,H/2,v); p(rbox(.02,H,v1-v0,.004),wht2,.01,H/2,(v0+v1)/2); for(const h of [.42,.78])p(rbox(.5,.025,v1-v0-.04,.004),wht,.26,h,(v0+v1)/2);
      p(rbox(.3,.18,.04,.004),mc([214,96,72]),.3,.52,v0+.08); solid(0,v0,.52,v1,H); shelf(0,v0,.52,v1,.765,.79); },{bake:true});
    const SU0=.55, SU1=3.15, SV0=5.38, SV1=5.96;
    cap('CORNER DESK',()=>{ const g=cur(); p(rbox(SU1-SU0,.04,SV1-SV0,.008),wht,(SU0+SU1)/2,TOP-.02,(SV0+SV1)/2); p(rbox(.03,TOP-.04,SV1-SV0-.04,.004),wht,SU0+.04,(TOP-.04)/2,(SV0+SV1)/2);
      p(rbox(.55,TOP-.04,.56,.01),wht,2.32,(TOP-.04)/2,(SV0+SV1)/2); drawers(g,4,'z',SV0,2.06,2.58,.04,TOP-.06,[0,-.28]);
      { const g0=2.63, g1=3.13, gv=(SV0+SV1)/2, gd=SV1-SV0, gh=TOP-.04; for(const v of [SV0+.01,SV1-.01])p(rbox(g1-g0,gh,.02,.004),wht,(g0+g1)/2,gh/2,v); p(rbox(.02,gh,gd,.004),wht,g0+.01,gh/2,gv); p(rbox(g1-g0,.03,gd,.004),wht,(g0+g1)/2,.015,gv); } for(let i=0;i<4;i++)p(rbox(.026,TOP-.04,.02,.004),slat,2.64+i*.034,(TOP-.04)/2,SV0-.006);
      p(new THREE.PlaneGeometry(.42,TOP-.12),glassM,3.131,(TOP-.04)/2,(SV0+SV1)/2,Math.PI/2,g,false); for(const h of [.26,.48])p(rbox(.44,.008,.5,.002),glassM,2.9,h,(SV0+SV1)/2,0,g,false);
      solid(SU0,SV0,SU1,SV1,TOP); },{wire:'drawers',bake:true});
    for(const [u,v,ry] of [[1.02,4.38,Math.PI/2],[1.62,4.92,Math.PI]]){ const g=thing(u,0,v,ry), wm=mc(WHT), bm=mc([186,138,92]);
      for(let i=0;i<5;i++){ const a=i/5*6.28, leg=p(rbox(.3,.03,.045,.01),bm,Math.cos(a)*.15,.06,Math.sin(a)*.15,-a,g); p(new THREE.SphereGeometry(.022,8,6),dark,Math.cos(a)*.29,.022,Math.sin(a)*.29,0,g); }
      p(new THREE.CylinderGeometry(.025,.025,.34,10),steel,0,.24,0,0,g); p(rbox(.5,.08,.5,.035,3),wm,0,.45,0,0,g);
      const bk=p(rbox(.46,.72,.07,.05,4),wm,0,.86,.24,0,g); bk.rotation.x=.1; for(const s of [-1,1])p(rbox(.05,.04,.32,.015),wm,s*.24,.62,0,0,g);
      loose(g,'CHAIR',8,true); }

    /* ---------- on the desks: the curved screen, the black screen, keyboards, the mouse, the mug, the pen pot, notebooks, a photo ---------- */
    const screen=(u,h,v,ry,w,hh,map,on,curve)=>{ const g=thing(u,h,v,ry), wm=mc(WHT);
      p(rbox(.22,.06,w*.6,.008),wm,0,.03,0,0,g); p(rbox(.05,.2,.05,.008),mc([200,200,204]),-.04,.16,0,0,g);
      const sg=new THREE.PlaneGeometry(w,hh,curve?16:1,1), q=sg.attributes.position; if(curve)for(let i=0;i<q.count;i++){ const x=q.getX(i); q.setZ(i,x*x*.35); } sg.computeVertexNormals();
      const bz=sg.clone(); const sc=keep(p(sg,new THREE.MeshBasicMaterial({map,color:on?0xffffff:0x0a0a0c}),0,0,0,0,g,false)); sc.rotation.y=Math.PI/2; sc.position.set(.012,.26+hh/2,0); sc.userData.screen=1;
      const back=p(bz,mat([214,214,218],{side:THREE.DoubleSide}),0,.26+hh/2,0,0,g); back.rotation.y=Math.PI/2; back.position.x=-.004; back.scale.set(1.03,1.06,1);
      const L=new THREE.PointLight(map===hills?0xcfe4ff:0xa8b8ff,0,1.8*c.M,2); L.userData.i0=.7; L.userData.on=on; L.position.set(.25,.26+hh/2,0); g.add(L); return loose(g,'MONITOR',5,false,'screen'); };
    screen(.28,TOP,4.6,0,.88,.36,hills,true,true); screen(1.5,TOP,5.8,Math.PI/2,.56,.33,desk2T,false,false);
    const kb=(u,v,ry)=>{ const g=thing(u,TOP,v,ry); p(rbox(.14,.018,.44,.005),mc([240,240,240]),0,.009,0,0,g); p(rbox(.1,.004,.4,.002),mc([214,214,218]),0,.02,0,0,g); return loose(g,'KEYBOARD',.6); };
    kb(.5,4.6,0); kb(1.5,5.55,Math.PI/2);
    { const g=thing(.5,TOP,4.2,.2); const ms=p(new THREE.SphereGeometry(.035,12,8),mc([236,236,238]),0,.015,0,0,g); ms.scale.set(1.3,.5,.85); loose(g,'MOUSE',.1); }
    { const g=thing(.42,TOP,3.86); const mm=mc([150,104,120]); p(new THREE.CylinderGeometry(.042,.038,.1,14),mm,0,.05,0,0,g); const hd=p(new THREE.TorusGeometry(.026,.008,6,10),mm,.045,.055,0,0,g); hd.rotation.y=0; loose(g,'MUG',.3); }
    { const g=thing(.18,TOP,5.18); p(new THREE.CylinderGeometry(.045,.045,.11,12),mc([104,134,140]),0,.055,0,0,g);
      [[60,100,200],[240,200,60],[30,30,34],[200,60,50]].forEach((c0,i)=>{ const pc=p(new THREE.CylinderGeometry(.005,.005,.2,6),mc(c0),Math.cos(i*1.6)*.02,.15,Math.sin(i*1.6)*.02,0,g); pc.rotation.z=(i-1.5)*.12; pc.rotation.x=(i%2-.5)*.2; }); loose(g,'PEN POT',.3); }
    books(.28,TOP,4.98,[[188,60,50,.03],[120,74,52,.025]],.15,true);
    { const g=thing(2.3,TOP,5.82,Math.PI/2+.35); p(rbox(.02,.2,.16,.004),dark,0,.1,0,0,g); const ph=p(new THREE.PlaneGeometry(.13,.17),mat([255,255,255],{map:photoT}),.011,.1,0,Math.PI/2,g,false); const st=p(rbox(.012,.16,.03,.003),dark,-.04,.08,0,0,g); st.rotation.z=.35; loose(g,'PHOTO',.2); }
    plant(2.88,TOP,5.68,'flower','white',.9);
    /* ---------- the hutch's top: the coffee machine, its cups, two plants ---------- */
    { const g=thing(.22,1.28,5.48); p(rbox(.24,.3,.2,.02),dark,0,.15,0,0,g); p(rbox(.02,.14,.16,.006),steel,.12,.19,0,0,g); p(rbox(.12,.02,.16,.006),steel,.08,.02,0,0,g); p(new THREE.CylinderGeometry(.012,.012,.04,8),steel,.1,.24,0,0,g); loose(g,'COFFEE MACHINE',3); }
    for(const v of [5.38,5.6]){ const g=thing(.42,1.28,v); p(new THREE.CylinderGeometry(.026,.022,.05,10),mc([244,242,238]),0,.025,0,0,g); loose(g,'CUP',.1); }
    plant(.18,1.28,5.84,'bush','white',.85); plant(.42,1.28,5.84,'flower','white',.8);
    books(.3,.79,5.7,[[214,96,72,.035]],0,true);

    /* ---------- on the wall: the cubbies of plants, two walnut shelves of books and the little lamp, the blind over the small window ---------- */
    cap('CUBBY SHELF',()=>{ const D=.28; for(const [v0,v1,h0,h1] of [[3.05,3.55,3.0,3.45],[2.55,3.05,2.55,3.0],[3.05,3.55,2.55,3.0],[2.55,3.05,2.1,2.55]]){
        p(rbox(D,.02,v1-v0,.004),wht,D/2,h0+.01,(v0+v1)/2); p(rbox(D,.02,v1-v0,.004),wht,D/2,h1-.01,(v0+v1)/2); for(const v of [v0+.01,v1-.01])p(rbox(D,h1-h0,.02,.004),wht,D/2,(h0+h1)/2,v);
        p(rbox(.01,h1-h0,v1-v0,.003),wht2,.005,(h0+h1)/2,(v0+v1)/2); shelf(0,v0,D,v1,h0,h0+.02); } },{bake:true});
    plant(.15,3.02,3.3,'pothos','white',.8); plant(.15,2.57,2.8,'bush','grey',.75); plant(.15,2.57,3.3,'leafy','white',.75); plant(.15,2.12,2.8,'pothos','white',.8);
    for(const h of [1.32,1.72])cap('WALL SHELF',()=>{ p(rbox(.22,.04,1.25,.008),wal,.11,h-.02,2.88); shelf(0,2.25,.22,3.5,h-.04,h); },{bake:true});
    books(.12,1.72,2.62,[[196,64,56,.035,.22],[230,130,90,.03,.2],[90,120,180,.04,.24],[240,236,228,.03,.22],[60,70,110,.035,.23],[150,100,170,.03,.2],[120,150,190,.04,.24],[70,80,120,.035,.21]]);
    books(.12,1.72,3.25,[[240,236,228,.03],[188,64,54,.035]],.2,true);
    books(.12,1.32,3.05,[[40,52,86,.04,.24],[52,64,100,.035,.22],[90,96,110,.04,.24],[44,60,90,.035,.23],[70,110,130,.04,.2]]);
    { const g=thing(.12,1.32,2.5), sm=new THREE.MeshLambertMaterial({color:col([255,226,170]),emissive:col([255,196,120]),emissiveIntensity:.55}); p(rbox(.13,.12,.13,.01),mc([46,40,36]),0,.06,0,0,g);
      keep(p(new THREE.PlaneGeometry(.11,.11).rotateX(-Math.PI/2),sm,0,.121,0,0,g,false)).userData.shade=1; keep(p(new THREE.PlaneGeometry(.11,.03),sm,.066,.1,0,Math.PI/2,g,false)).userData.shade=1;
      const L=new THREE.PointLight(0xffb870,1.6,3.2*c.M,1.8); L.userData.pool=true; L.userData.lamp=1; L.userData.i0=1.6; L.position.set(.02,.2,0); g.add(L); loose(g,'LAMP',.8,false,'lamp'); }
    cap('BLIND',()=>{ const k='Ww', fm=mat([212,198,172],{...clip(k)}), v=5.62, w=.78; for(let i=0;i<6;i++){ const f=p(rbox(.05,.09,w,.03,3),fm,.06,2.62-i*.082,v); f.scale.x=1+.3*(i%2); } p(rbox(.04,.02,w+.04,.005),mat([120,100,80],{...clip(k)}),.04,2.68,v); },{bake:true});

    /* ---------- the half walls: one behind the corner desk and its return, one under the TV; the record player's cabinet and the speakers on the living room's side ---------- */
    const PU=3.98, PH=1.12;
    cap('HALF WALL',()=>{ p(rbox(.12,PH,2.3,.01),wht,PU,PH/2,1.65); solid(PU-.06,.5,PU+.06,2.8,PH); },{bake:true});
    cap('HALF WALL',()=>{ p(rbox(.12,PH,1.96,.01),wht,PU,PH/2,5.08); p(rbox(PU-SU0+.06,PH,.12,.01),wht,(SU0+PU)/2,PH/2,6.06); solid(PU-.06,4.1,PU+.06,6.12,PH); solid(SU0,6.0,PU+.06,6.12,PH); },{bake:true});
    cap('TV',()=>{ const g=new THREE.Group(); g.position.set(PU-.02,PH,1.65); g.rotation.y=Math.PI; cur().add(g); p(rbox(.16,.02,.4,.006),dark,0,.01,0,0,g); p(rbox(.03,.08,.06,.006),dark,0,.06,0,0,g); p(rbox(.045,.66,1.28,.01),mc([24,24,26]),0,.43,0,0,g);
      const sc=keep(p(new THREE.PlaneGeometry(1.22,.6),new THREE.MeshBasicMaterial({map:showT,color:0x0a0a0c}),.024,.43,0,Math.PI/2,g,false)); sc.userData.screen=1;
      const L=new THREE.PointLight(0xb8c8ff,0,2.6*c.M,2); L.userData.i0=.9; L.userData.on=false; L.position.set(.35,.43,0); g.add(L); },{wire:'screen',bake:true});
    const RC=[168,90,50];
    cap('RECORD CABINET',()=>{ const u0=4.05, u1=4.5, v0=1.05, v1=2.05, H=.82, wm=mc(RC); p(rbox(u1-u0,.03,v1-v0,.006),wm,(u0+u1)/2,H-.015,(v0+v1)/2); p(rbox(u1-u0,.04,v1-v0,.006),wm,(u0+u1)/2,.02,(v0+v1)/2);
      for(const v of [v0+.015,v1-.015])p(rbox(u1-u0,H,.03,.006),wm,(u0+u1)/2,H/2,v); p(rbox(u1-u0,.025,v1-v0,.006),wm,(u0+u1)/2,.4,(v0+v1)/2); p(rbox(.02,H,v1-v0,.004),mc([130,70,40]),u0+.01,H/2,(v0+v1)/2);
      for(let i=0;i<22;i++){ const c0=[[60,70,80],[110,60,60],[70,90,70],[150,110,70],[90,80,120],[200,190,180],[40,40,44]][i%7]; p(rbox(.3,.34,.008,.002),mc(c0),u0+.2,.6,v0+.06+i*.04); }
      p(rbox(.02,.36,.47,.006),dark,u1-.01,.21,v0+.26); p(rbox(.02,.36,.47,.006),mc([140,72,42]),u1-.01,.21,v1-.26); solid(u0,v0,u1,v1,H); },{bake:true});
    { const g=thing(4.27,.82,1.4,0), red=mc([176,40,44]); p(rbox(.36,.08,.42,.012),red,0,.04,0,0,g); p(rbox(.34,.01,.4,.004),mc([84,84,88]),0,.085,0,0,g);
      const pl=new THREE.Group(); pl.position.set(0,.092,-.03); pl.userData.platter=1; g.add(pl); keep(p(new THREE.CylinderGeometry(.15,.15,.012,28),mc([20,20,22]),0,0,0,0,pl)); keep(p(new THREE.CylinderGeometry(.05,.05,.014,16),mc([200,60,60]),0,0,0,0,pl)); keep(p(rbox(.03,.014,.008,.002),mc([240,240,240]),.03,.002,0,0,pl));
      const arm=new THREE.Group(); arm.position.set(.12,.1,.16); arm.userData.arm=1; g.add(arm); keep(p(new THREE.CylinderGeometry(.018,.018,.02,10),steel,0,0,0,0,arm)); keep(p(rbox(.01,.01,.2,.002),steel,-.02,.012,-.1,0,arm)).rotation.y=.25;
      const lid=new THREE.Group(); lid.position.set(-.18,.08,0); lid.rotation.z=.25; g.add(lid); p(rbox(.02,.4,.44,.006),red,0,.2,0,0,lid); p(rbox(.006,.34,.38,.002),mc([214,214,218]),.012,.2,0,0,lid);
      loose(g,'RECORD PLAYER',4,false,'record'); }
    { const g=thing(4.27,.82,1.85,.12); [[234,110,64],[170,140,206],[240,128,96]].forEach((c0,i)=>{ const s=p(rbox(.31,.006,.31,.002),mc(c0),i*.01,.003+i*.007,i*.012,0,g); s.rotation.y=i*.08; }); loose(g,'RECORDS',.6); }
    for(const [u,v] of [[4.22,.84],[4.22,4.45]]){ const g=thing(u,0,v,0); p(rbox(.26,.46,.28,.008),mc([66,44,36]),0,.23,0,0,g); p(new THREE.PlaneGeometry(.26,.45),mat([255,255,255],{map:spk}),.131,.23,0,Math.PI/2,g,false); loose(g,'SPEAKER',6); }
    cap('BOOKCASE',()=>{ const u0=4.26, u1=4.6, v0=5.25, v1=5.85, y0=.2, y1=.66; p(rbox(u1-u0,.025,v1-v0,.005),wal,(u0+u1)/2,y0,(v0+v1)/2); p(rbox(u1-u0,.025,v1-v0,.005),wal,(u0+u1)/2,y1,(v0+v1)/2);
      for(const v of [v0+.012,v1-.012])p(rbox(u1-u0,y1-y0,.025,.005),wal,(u0+u1)/2,(y0+y1)/2,v); p(rbox(.015,y1-y0,v1-v0,.004),wal,u0+.008,(y0+y1)/2,(v0+v1)/2);
      for(const [uu,vv] of [[u0+.03,v0+.03],[u1-.03,v0+.03],[u0+.03,v1-.03],[u1-.03,v1-.03]]){ const l=p(new THREE.CylinderGeometry(.008,.006,y0,5),dark,uu,y0/2,vv); }
      for(let i=0;i<10;i++)p(rbox(.22,.3+(i%3)*.03,.035,.003),mat([[180,60,50],[60,90,150],[200,170,90],[70,120,90],[140,80,140]][i%5]),u0+.13,y0+.18+(i%3)*.015,v0+.06+i*.045); solid(u0,v0,u1,v1,y1+.012); },{bake:true});
    plant(4.43,.672,5.55,'big','terra',1.1);
  });

  // what the bedroom's pieces do (each copy of one too): the screens switch, the drawers slide out, the record turns, the cat breathes and wakes to a pat
  const W=ROOMK.wires;
  W.screen=(un,c)=>{ let L=null; const S=[]; un.obj.traverse(o=>{ if(o.isLight&&!L)L=o; if(o.userData.screen){ o.material=o.material.clone(); S.push(o); } }); if(!L)return; un.st.L=L;
    c.hit(un,()=>un.name+': '+(un.st.L.userData.on!==false?'ON':'OFF'),()=>{ const u=un.st.L.userData; u.on=u.on===false;  });
    un.tick=()=>{ const on=un.st.L.userData.on!==false; for(const s of S)s.material.color.setScalar(on?1:0); }; };
  W.drawers=(un,c)=>{ const D=[]; un.obj.traverse(o=>{ if(o.userData.drawer)D.push({g:o,x0:o.position.x,z0:o.position.z,d:o.userData.drawer}); }); un.st.open=false;
    c.hit(un,()=>un.st.open?'CLOSE THE DRAWERS':'OPEN THE DRAWERS',()=>{ un.st.open=!un.st.open;  });
    un.tick=dt=>{ const k=Math.min(1,dt*6), o=un.st.open?1:0; for(const d of D){ d.g.position.x+=(d.x0+d.d[0]*o-d.g.position.x)*k; d.g.position.z+=(d.z0+d.d[1]*o-d.g.position.z)*k; } }; };
  W.record=(un,c)=>{ let P=null, A=null; un.obj.traverse(o=>{ if(o.userData.platter)P=o; if(o.userData.arm)A=o; }); un.st.on=false;
    c.hit(un,()=>'RECORD PLAYER: '+(un.st.on?'ON':'OFF'),()=>{ un.st.on=!un.st.on;  });
    un.tick=dt=>{ if(P&&un.st.on)P.rotation.y-=dt*3.49; if(A)A.rotation.y+=((un.st.on?-.5:0)-A.rotation.y)*Math.min(1,dt*3); }; };
  W.cat=(un,c)=>{ const B=[], H=[]; un.obj.traverse(o=>{ if(o.userData.breath)B.push(o); if(o.userData.head)H.push(o); }); let pet=0, t=Math.random()*9;
    c.hit(un,()=>'PET THE CAT',()=>{ pet=2.5;  });
    un.tick=dt=>{ t+=dt; pet=Math.max(0,pet-dt); const b=1+.05*Math.sin(t*(pet?4:1.6)); for(const o of B)o.scale.y=o.userData.s0*b; for(const o of H)o.rotation.z+=((pet?.4:0)-o.rotation.z)*Math.min(1,dt*4); }; };
  window.BEDPICDBG=()=>{ const A=ROOMK.api; if(!A)return {built:false}; const U=A.units(), names=[...new Set(U.filter(u=>!u.gone).map(u=>u.name))];
    let tris=0, meshes=0; for(const u of U)u.obj.traverse(o=>{ if(o.isMesh&&o.visible!==false){ meshes++; const g=o.geometry; tris+=(g.index?g.index.count:g.attributes.position.count)/3; } });
    return {built:names.includes('CORNER DESK'),names,meshes,tris:Math.round(tris),drawers:U.filter(u=>u.wire==='drawers').map(u=>u.st.open),screens:U.filter(u=>u.wire==='screen').map(u=>u.st.L&&u.st.L.userData.on!==false),record:U.filter(u=>u.wire==='record').map(u=>u.st.on)}; };
}
