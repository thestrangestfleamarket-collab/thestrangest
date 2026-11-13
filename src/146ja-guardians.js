// THE GUARDIANS: GUARD — the woodland folk who keep the park's watchtowers (data/guardians.json; owner, 10 Nov 2026: they live in the towers and watch on top): every body from one maker (a species head, a coat, a weapon), their posts on each tower's roof or at the dungeon stair's tower foot, the welcome up the stair, and the keep's bounties on what you slay below.
import {SHARED, THREE} from './003-shx.js';
import {CHARS, CLOCK, FORAGE, GUARD, INV, LINES, MAIL, NPCS, PARK, pos, SFX, TALK, VIS, VIT} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {OWNED} from './005-save.js';
import {CASTLE, MAPG, MODS, SYS, TILE, ZU} from './006-map-pre.js';
import {GTOWER} from './063-tower.js';
import {RIGNPC} from './083-npc-rig.js';
import {GEMS} from './101-gems.js';
import {BODIES} from './111a-bodies.js';
import {FOLK} from './146ha-folk.js';
GUARD.list=[];
{ const D=__DATA__("data/guardians.json"), T=TILE, SITES={at:{},inside:{},homes:{}}, CREW=D.crew?D.list.filter(R=>D.crew.includes(R.k)):D.list, say=(t,c)=>SAY(t,c||'#f2c14e');
  // the bounty you hold: {id, n, got}, kept with your things; the dungeon's kills count toward it (SYS 'slain')
  let B=null; try{ B=JSON.parse(OWNED.get('bounty')||'null'); }catch(e){ B=null; }
  const keep=()=>{ try{ OWNED.set('bounty',JSON.stringify(B)); }catch(e){} }, def=id=>D.bounties.find(b=>b.id===id), done=()=>!!B&&B.got>=B.n;
  SYS.add('slain',e=>{ const d=B&&def(B.id); if(!d||done()||e.sim)return; if((d.kind==='any'||d.kind===e.kind)&&(e.lvl||1)>=(d.lvl||1)){ B.got++; keep(); if(done())say('BOUNTY DONE: '+d.t+'. GO BACK FOR YOUR PAY.'); } },'146ja-guardians');
  TALK.ops.bounty=a=>{ const [w,id]=String(a).split(/\s+/), d=def(id||(B&&B.id));
    if(w==='take'&&d){ B={id:d.id,n:d.n,got:0}; keep(); say('BOUNTY: '+d.t+' ($'+d.pay+').'); }
    else if(w==='pay'&&d&&done()){ INV.cash+=d.pay; say('YOU ARE PAID $'+d.pay+' FOR THE BOUNTY.'); B=null; keep(); FORAGE.draw&&FORAGE.draw(); }
    else if(w==='drop'){ B=null; keep(); } };
  TALK.tests.bounty=a=>a==='on'?!!B:a==='done'?done():false;
  TALK.vars.bounty=()=>{ const d=B&&def(B.id); return d?d.t+': '+B.got+' OF '+B.n:'NOTHING'; };
  TALK.tests.vit=a=>a==='hurt'?VIT.hp<.99:true;
  TALK.ops.heal=a=>{ const c=+a||0; if(!INV.afford(c))return say('YOU CANNOT AFFORD IT.','#c8a090'); INV.pay(c); VIT.heal(1); say('THE HERBALIST MENDS YOU.','#b8f0a0'); FORAGE.draw&&FORAGE.draw(); };
  FORAGE.BUYK.slime=['slime_']; FORAGE.BUYK.gems=[...GEMS.map(g=>g[0]),'raw_geode']; FORAGE.BUYK.fish=['x_'];
  LINES.add('gd_pub',['Long watch. Good ale.','Sit down, sit down. Old Gristle won\'t bite.','To the keep!','Another round before the stair calls.','You were down there? Tell us everything.']);
  LINES.add('gd_up',['Back up! Good.','You made it out. Most do.','Anything follow you? No? Good.','Welcome back to the light.','Up the stair and still standing.']);
  for(const R of D.list)LINES.add('gd:'+R.k,R.say);
  GUARD.bounty=()=>B&&{...B};

  GUARD.shelved=!!D.shelved; if(!GUARD.shelved)PARK.later(()=>{ '@park'; const PI=Math.PI, X=SHARED.BOD.XS, Z=SHARED.BOD.ZS, [bx0,,by0]=CASTLE.b;
    // the weapon moves, keyed by time: [u, [arm R x, arm R z, arm R twist, hips turn, arm L x, hips forward], 'fast' for the strike]; hit is when the blade meets the pell
    const G0=[-1.15,.12,0,0,0,0], MOVE={
      slash:{T:1.3,hit:.5,K:[[0,G0],[.35,[-1.5,1.2,-.6,.9,-.4,-.01]],[.5,[-1.5,-.4,.4,-.8,-.2,.02],'fast'],[.62,[-1.3,-.6,.5,-1,-.1,.02]],[1,G0]]},
      back:{T:1.3,hit:.5,K:[[0,G0],[.35,[-1.6,-.7,.5,-.9,-.3,-.01]],[.5,[-1.45,.9,-.4,.8,-.2,.02],'fast'],[.62,[-1.3,1.1,-.5,.95,-.1,.02]],[1,G0]]},
      overhead:{T:1.4,hit:.55,lean:.12,K:[[0,G0],[.4,[-2.9,.15,0,.1,-.3,-.02]],[.55,[-.7,.1,0,-.1,-.2,.03],'fast'],[.68,[-.5,.1,0,-.1,-.2,.03]],[1,G0]]},
      thrust:{T:1.1,hit:.52,lean:.1,K:[[0,G0],[.4,[-1.1,.1,0,.3,-.6,-.03]],[.52,[-1.6,0,0,-.2,-.9,.06],'fast'],[.7,[-1.55,0,0,-.2,-.9,.06]],[1,G0]]},
      draw:{T:3.4,hit:.62,K:[[0,[-.9,-.35,0,0,-1.3,0]],[.15,[-1.4,-.2,0,.2,-1.45,0]],[.55,[-1.45,-1,.5,.35,-1.5,0]],[.62,[-1.45,-1,.5,.35,-1.5,0]],[.66,[-1.2,-1.5,.8,.35,-1.5,0],'fast'],[1,[-.9,-.35,0,0,-1.3,0]]]}};
    const MH=T/.84, MV=ZU*24/.84, G=9.8, grp=MAPG.park||scene;
    // arrows: real projectiles, fired on the arc that reaches the butt at the archer's speed, falling under gravity, sticking where they land
    const AG=(()=>{ const P=[], Cc=[], add=(g,c)=>{ g=g.toNonIndexed(); const p=g.attributes.position; for(let i=0;i<p.count;i++){ P.push(p.getX(i),p.getY(i),p.getZ(i)); Cc.push(...c); } };
      add(new THREE.CylinderGeometry(.006,.006,.6,5).rotateX(Math.PI/2),[.72,.56,.34]); add(new THREE.ConeGeometry(.014,.05,4).rotateX(Math.PI/2).translate(0,0,.32),[.5,.52,.56]);
      for(const r of [0,2.1,4.2])add(new THREE.BoxGeometry(.003,.03,.08).translate(0,.018,-.25).rotateZ(r),[.85,.3,.25]);
      const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3)); g.computeVertexNormals(); return g; })();
    const AM=new THREE.MeshLambertMaterial({vertexColors:true}), arrows=[], chips=[], Z3=new THREE.Vector3(0,0,1), V=new THREE.Vector3();
    const loose=(N,to,spread,hit)=>{ const p0=N.g.position.clone(); p0.y+=N.gd.m*.62*MV; const dx=(to.x-p0.x)/MH, dz=(to.z-p0.z)/MH, D=Math.hypot(dx,dz), hy=(to.y-p0.y)/MV, v=16+4*Math.random();
      const disc=v**4-G*(G*D*D+2*hy*v*v); if(disc<0)return; const th=Math.atan((v*v-Math.sqrt(disc))/(G*D))+(Math.random()-.5)*spread, yaw=Math.atan2(dx,dz)+(Math.random()-.5)*spread;
      const vel=new THREE.Vector3(Math.sin(yaw)*Math.cos(th)*v,Math.sin(th)*v,Math.cos(yaw)*Math.cos(th)*v), m=new THREE.Mesh(AG,AM); m.scale.setScalar(MH); m.position.copy(p0); grp.add(m);
      arrows.push({m,p:p0,v:vel,t:0,stuck:false,to,hit}); if(arrows.length>24){ const o=arrows.shift(); o.m.removeFromParent(); } SFX.play&&SFX.play('blip',{vol:.25,pitch:2.6,at:{x:p0.x,z:p0.z},far:12*T}); };
    const chipsAt=(p,n,col)=>{ for(let i=0;i<n;i++){ const m=new THREE.Mesh(new THREE.BoxGeometry(.03*MH,.012*MV,.02*MH),new THREE.MeshLambertMaterial({color:col})); m.position.copy(p); grp.add(m);
        chips.push({m,v:new THREE.Vector3((Math.random()-.5)*2.4,1+Math.random()*1.6,(Math.random()-.5)*2.4),t:0,w:new THREE.Vector3(Math.random()*9,Math.random()*9,Math.random()*9)}); if(chips.length>40){ const o=chips.shift(); o.m.removeFromParent(); o.m.geometry.dispose(); } } };
    SYS.add('life',dt=>{ if(!PARK.in||(!arrows.length&&!chips.length))return; const h=Math.min(dt,.05);
      for(const a of arrows){ a.t+=dt; if(a.stuck)continue; for(let k=0;k<3;k++){ const s=h/3; a.v.y-=G*s; a.v.multiplyScalar(1-.02*s); a.p.x+=a.v.x*s*MH; a.p.y+=a.v.y*s*MV; a.p.z+=a.v.z*s*MH;
          const dB=Math.hypot((a.p.x-a.to.x)/MH,(a.p.y-a.to.y)/MV,(a.p.z-a.to.z)/MH), gy=MODS.bodega.ground(a.p.x,a.p.z);
          if(a.hit&&a.hit(a.p)){ a.stuck=true; a.t=29; break; } if(!a.hit&&dB<.45||a.p.y<gy){ a.stuck=true; if(dB<.45){ SFX.play&&SFX.play('step',{vol:.5,pitch:1.6,at:{x:a.p.x,z:a.p.z},far:12*T}); chipsAt(a.p,3,0xc8a860); } else a.p.y=gy+.02*MV; break; } }
        a.m.position.copy(a.p); V.set(a.v.x*MH,a.v.y*MV,a.v.z*MH).normalize(); a.m.quaternion.setFromUnitVectors(Z3,V); }
      for(let i=arrows.length-1;i>=0;i--)if(arrows[i].t>30){ arrows[i].m.removeFromParent(); arrows.splice(i,1); }
      for(let i=chips.length-1;i>=0;i--){ const c=chips[i]; c.t+=dt; c.v.y-=G*h; c.m.position.x+=c.v.x*h*MH; c.m.position.y+=c.v.y*h*MV; c.m.position.z+=c.v.z*h*MH; c.m.rotation.x+=c.w.x*h; c.m.rotation.y+=c.w.y*h;
        const gy=MODS.bodega.ground(c.m.position.x,c.m.position.z); if(c.m.position.y<gy){ c.m.position.y=gy; c.v.y*=-.3; c.v.x*=.5; c.v.z*=.5; c.w.multiplyScalar(.4); }
        if(c.t>4){ c.m.removeFromParent(); c.m.geometry.dispose(); chips.splice(i,1); } } },'146ja-guardians arrows');
    // the practice yard: blades and spears on the pells (wind up, strike, follow through, recover), bows at the butts
    Object.assign(GUARD,{MOVE,loose,chipsAt,MH,MV,LODR:9});
    const drill=(N,R,A,s,dt)=>{ const Y=SITES.at.yard; if(!Y)return; const bow=N.grip==='bow', L=bow?Y.butts:Y.pells; if(!L||!L.length)return; const i=R.k.length%L.length, tg=L[i];
      if(!N.spot){ const dx=s.x-tg[0], dz=s.z-tg[2], l=Math.hypot(dx,dz)||1, r=bow?Math.max(l,5*MH):(R.w==='spear'?.85:.62)*MH*(R.bulk||1); N.spot={x:tg[0]+dx/l*r,z:tg[2]+dz/l*r}; }
      s.hold=true; s.to=null; s.x=N.spot.x; s.z=N.spot.z; s.face={x:tg[0],z:tg[2]}; A.act='';
      const M=A.mv; if(!M){ if((N.cd=(N.cd??Math.random()*2)-dt)>0)return; const k=bow?'draw':R.w==='spear'?'thrust':['slash','back','overhead','thrust','slash'][Math.floor(Math.random()*5)]; A.mv={k,t:0,hit:false}; return; }
      const q=MOVE[M.k], u=M.t/q.T; if(!M.hit&&u>=q.hit){ M.hit=true; const vis=NPCS.live?NPCS.live(s.x,N.g.position.y,s.z):true;
        if(bow)loose(N,new THREE.Vector3(tg[0],tg[1],tg[2]),.05+.04*Math.random()); else if(vis){ const p=new THREE.Vector3(tg[0],tg[1]-(M.k==='thrust'?.15*MV:0),tg[2]); chipsAt(p,M.k==='overhead'?6:4,0x8a6a42); SFX.play&&SFX.play('blade',{vol:.6,vary:.12,at:{x:p.x,z:p.z},far:14*T}); } }
      if(u>=1){ A.mv=null; N.cd=bow?1.5+Math.random()*2:.5+Math.random()*1.2; } };
    // the rig: the squirrel knight's bones, scaled to its bulk, with a cape and two ears that swing; the body from FOLK
    const mk=R=>{ const b=R.bulk||1, sp=R.sp, cat=sp==='caterpillar', A={act:'',t:0,k:0};
      const tail=sp==='mouse'||sp==='rat'?[[0,.3,-.1],[0,.2,-.28],[0,.18,-.46],[0,.28,-.6]]:sp==='redpanda'||sp==='raccoon'?[[0,.3,-.12],[0,.22,-.26],[0,.16,-.4],[0,.12,-.54]]:sp==='pangolin'?[[0,.26,-.12],[0,.14,-.3],[0,.06,-.48],[0,.03,-.62]]:sp==='lynx'||sp==='hyena'?[[0,.3,-.12],[0,.24,-.2],[0,.18,-.26],[0,.15,-.3]]:null;
      const bones=[['root',null,[0,0,0]],['hips','root',[0,.36,0]],['head','hips',[0,.66,0]],['earL','head',[-.08,.84,0]],['earR','head',[.08,.84,0]],['cape','hips',[0,.6,-.1]],
        ['armL','hips',[-.16*b,.56,0]],['armR','hips',[.16*b,.56,0]],['legL','hips',[-.08*b,.3,0]],['legR','hips',[.08*b,.3,0]],['tail1','hips',tail?tail[0]:[0,.3,-.12]],['tail2','tail1',tail?tail[1]:[0,.3,-.2]],['tail3','tail2',tail?tail[2]:[0,.3,-.28]]];
      const RIGGED=!cat, parts=RIGGED?[{name:'body',rank:0,bone:'hips',of:[{P:new Float32Array([0,0,0,.001,0,0,0,.001,0]),C:new Float32Array(9)}]}]:FOLK.parts(R);
      const grip=['sword','glowsword','greatsword'].includes(R.w)?'blade':['spear','staff','orbstaff','mushstaff','lantern','axe','mace','starwand'].includes(R.w)?'pole':R.w==='bow'?'bow':'';
      const ACTS=grip==='blade'?['scan','salute','','look']:grip==='bow'?['scan','draw','']:R.w==='orbstaff'||R.w==='starwand'?['raise','scan','']:['scan','',''];
      const def={bones,parts,springs:{cape:{f:-.3,s:.18,k:28,c:4,lim:.5},earL:{f:-.08,s:.1,k:60,c:6,lim:.25},earR:{f:-.08,s:.1,k:60,c:6,lim:.25},tail1:{f:-.12,s:.12,k:40,c:5,lim:.35},tail2:{f:-.18,s:.16,k:30,c:4,lim:.45},tail3:{f:-.24,s:.2,k:24,c:3.4,lim:.6},head:{f:-.03,s:.03,k:90,c:9,lim:.1}},
        pose:(c,dt)=>{ if(RIGGED){ A.k=(A.k||0)+((A.act?1:0)-(A.k||0))*Math.min(1,dt*6); if(N&&N.FIG)FOLK.drive(N,c,dt,A,R,grip); return; } const B=c.B, k=A.k=A.k+((A.act?1:0)-A.k)*Math.min(1,dt*6), t=A.t; RIGNPC.walk(c,{arm:.35,leg:.5,bob:.02,rock:.04}); B.head.rotation.y=c.look; if(c.sheet)return;
          if(R.pose==='sit'||A.sit){ B.hips.position.y-=.17; B.legL.rotation.x=B.legR.rotation.x=-1.45; B.armL.rotation.x=-.5; B.armR.rotation.x=-.5; }
          if(cat){ B.head.rotation.z=Math.sin(c.t*.7)*.08; B.hips.rotation.x=Math.sin(c.t*.9)*.03; return; }
          if(grip==='blade'){ B.armR.rotation.x=-1.15+.05*Math.sin(c.t*1.3); B.armR.rotation.z=.12; }
          else if(grip==='pole'){ B.armR.rotation.x=R.pose==='sit'?-.6:-.28+.03*Math.sin(c.t*1.1); B.armR.rotation.z=.06; }
          else if(grip==='bow'){ B.armL.rotation.x=-1.3; B.armL.rotation.z=.25; B.armR.rotation.x=-.9-.4*(A.act==='draw'?k:0); B.armR.rotation.z=-.35; }
          if(R.shield){ B.armL.rotation.x=-.75; B.armL.rotation.z=-.1; } if(R.hold==='map'||R.hold==='herbs'||R.w==='mushroom'){ B.armL.rotation.x=-.85; B.armL.rotation.z=.1; }
          if(A.act==='scan'){ B.head.rotation.y=Math.sin(t*.7)*.9*k+c.look*(1-k); B.head.rotation.x=-.08*k; }
          if(A.act==='salute'){ const u=t<.25?t/.25:t<1.4?1:Math.max(0,1-(t-1.4)/.3); B.armL.rotation.x=-2.6*u*k; B.armL.rotation.z=-.15+.9*u*k; B.armR.rotation.x-=.35*u*k; }
          if(A.act==='raise'){ const u=Math.min(1,t/.5)*Math.max(0,Math.min(1,(2.4-t)/.5)); B.armR.rotation.x-=1.3*u*k; B.head.rotation.x=-.15*u*k; }
          if(grip==='pole'&&c.mv>.1&&R.w!=='spear'){ const ph=c.st.ph; B.armR.rotation.x=-.45+.35*Math.sin(ph)*c.mv; }
          if(R.w==='spear'&&!A.mv){ B.armR.rotation.x=-.12; B.armR.rotation.z=.05; }
          const M=A.mv; if(M){ const q=MOVE[M.k], u=Math.min(1,M.t/q.T); let f=0, i=0; for(;i<q.K.length-1&&u>q.K[i+1][0];i++); const k0=q.K[i], k1=q.K[Math.min(i+1,q.K.length-1)], w=k1[0]>k0[0]?(u-k0[0])/(k1[0]-k0[0]):1, e=k1[2]==='fast'?1-Math.pow(1-w,3):w*w*(3-2*w);
            const L=(j)=>k0[1][j]+(k1[1][j]-k0[1][j])*e, v=[0,1,2,3,4,5].map(L); B.armR.rotation.x=v[0]; B.armR.rotation.z=v[1]; B.armR.rotation.y=v[2]; B.hips.rotation.y+=v[3]; B.armL.rotation.x=v[4]; B.hips.position.z+=v[5]; if(q.lean)B.hips.rotation.x+=q.lean*Math.sin(u*Math.PI); } } };
      const at=R.at, site=R.site&&SITES.at[R.site], IN=R.inside&&SITES.inside[R.inside], MH=T/.84;
      const TW=R.tower&&GTOWER.at&&GTOWER.at(R.tower), TOP=TW&&R.top;   // a tower's guard: on its roof (top) or at its foot, at [out in tiles, along in tiles] from its middle; on the roof at [out, 0, 0, the way it looks in degrees], standing out that way
      let wx, wz; if(TW){ const a=((at[3]||0)-90)*PI/180, o=TOP?Math.min(at[0],TW.r*.6):at[0]; wx=X(TW.tx+PARK.ox+(TOP?Math.cos(a)*o:at[0])); wz=Z(TW.ty+PARK.oy+(TOP?Math.sin(a)*o:at[1])); } else if(IN){ wx=IN.cx+at[0]*MH; wz=IN.cz+at[1]*MH; } else if(R.perch==='pillar'&&site&&site.pillar){ wx=site.pillar[0]; wz=site.pillar[2]; } else if(R.perch==='deck'&&site&&site.deck){ const dk=site.deck[at[1]<0?0:1]; wx=(dk[0][0]+dk[1][0])/2; wz=(dk[0][2]+dk[1][2])/2; }
      else{ const tx=site?site.x+at[0]:bx0+at[0], ty=site?site.y+at[1]:by0+at[1]; wx=X(tx); wz=Z(ty); }
      const post=R.role==='post'||R.role==='drill'||!!R.perch||!!TW, night=R.role==='night', big=b>1.15||R.m>.8, face=at[3]!=null?at[3]*PI/180:0;
      const homeAt=()=>{ const h=R.home; if(!h||IN||R.perch||TW)return null; if(h==='castle')return {x:X(CASTLE.gate),z:Z(by0-.6)}; const q=SITES.homes[h]; return q?{x:q[0],z:q[2]}:null; };
      const always=IN||R.perch||TW||!R.home||R.home==='castle'&&R.role==='post'&&!site, jit=(R.k.length*37%120)/60;
      const onShift=()=>{ if(always)return true; const h=CLOCK.h??12; return night?(h>=19+jit*.5||h<5.5):(h>=6.5+jit&&h<19.5+jit*.5); };
      let BRN=null; const N=RIGNPC.make(def,{key:R.k,name:R.n,eye:-1,metres:R.m,tall:1,radius:big?.26:.18,speed:R.role==='wander'?.45:.35,stride:7,lv:'up',group:'park',x:wx,z:wz,
        home:{x:wx,z:wz,r:(post?0:at[2])*T},range:post?0:at[2],ground:IN?(()=>0):TOP?(()=>TW.top):(x,z)=>A.sit?0:R.perch==='wall'?MODS.bodega.ground(x,z)+SHARED.BOD.YS(100):SITES.ground?SITES.ground(x,z,MODS.bodega.ground(x,z)):MODS.bodega.ground(x,z),
        brain:BRN=(dt,you,s,N)=>{ if(N.sheet)return; A.t+=dt; if(A.mv)A.mv.t+=dt; const now=performance.now(), gap=now-(N.lastT||0)>2000; N.lastT=now;
          // the day: out on watch, then home to bed (or the other way round for the night watch); seen from far, it is where it should be
          const on=onShift(), H=homeAt();
          // the evening at the Mossy Flagon: some of those off watch go there before bed, sit at a table, and leave at closing
          const PUB=SITES.inside.pub, door=SITES.homes.pub, hh=CLOCK.h??12, evening=hh>=19.5&&hh<23.5, goPub=!on&&!night&&!!PUB&&!!door&&R.home!=='pub'&&evening&&((R.k.length*7+(window.MAIL&&MAIL.ready?MAIL.day():0))%5<2);
          if(N.mode==='pub'&&!goPub){ PUB.taken.delete(N.seat); N.seat=null; A.sit=false; (MAPG.park||scene).add(N.g); N.park=true; s.x=door[0]; s.z=door[2]; s.to=null; N.mode=''; }
          if(goPub&&N.mode!=='pub'){ PUB.taken=PUB.taken||new Set(); const seat=PUB.seats.find(q=>!PUB.taken.has(q));
            if(seat){ if(gap||!N.g.visible||Math.hypot(s.x-door[0],s.z-door[2])<.7*T){ PUB.taken.add(seat); N.seat=seat; N.mode='pub'; N.going=false; VIS.hide(N.g,'away',false); scene.add(N.g); N.park=false; A.sit=true; A.mv=null; s.x=seat.x; s.z=seat.z; s.to=null; s.hold=true; s.face={x:seat.tx,z:seat.tz}; s.home={x:seat.x,z:seat.z,r:0,id:s.home.id}; }
              else{ VIS.hide(N.g,'away',false); s.hold=false; s.to={x:door[0],z:door[2]}; s.next=null; } return; } }
          if(N.mode==='pub'){ s.hold=true; s.to=null; s.x=N.seat.x; s.z=N.seat.z; s.face={x:N.seat.tx,z:N.seat.tz}; if(!A.act&&Math.random()<dt*.08){ A.act='raise'; A.t=0; N.aT=2.4; }
            if(Math.hypot(you.x-s.x,you.z-s.z)<2.4*T&&!((N.greet=(N.greet||Math.random()*20)-dt)>0)){ N.greet=50+Math.random()*60; LINES.say(N,'gd_pub'); } if((N.aT=(N.aT??3)-dt)<=0){ A.act=''; N.aT=4+Math.random()*6; } return; }
          if(!on&&H){ if(N.mode!=='home'){ if(gap||N.g.visible===false){ N.mode='home'; s.x=H.x; s.z=H.z; s.to=null; VIS.hide(N.g,'away'); return; } s.hold=false; s.home={x:H.x,z:H.z,r:0,id:s.home.id}; if(!s.to||Math.hypot(s.to.x-H.x,s.to.z-H.z)>.1)s.to={x:H.x,z:H.z}; s.next=null; A.mv=null;
              if(Math.hypot(s.x-H.x,s.z-H.z)<.7*T){ N.mode='home'; VIS.hide(N.g,'away'); s.to=null; } } return; }
          if(on&&N.mode==='home'){ N.mode=''; VIS.hide(N.g,'away',false); if(H){ s.x=H.x; s.z=H.z; } s.home={x:wx,z:wz,r:(post?0:at[2])*T,id:s.home.id}; s.to={x:wx,z:wz}; s.hold=false; N.going=true; }
          if(N.geoLo){ const far=Math.hypot(you.x-s.x,you.z-s.z)>GUARD.LODR*T, M=N.FIG?N.FIG.me:N.me;
            const g=far?N.geoLo:N.geoHi; if(M.geometry!==g){ if(!N.FIG&&!far&&!N.shaded)N.shade(); M.geometry=g; } }
          if(N.ctl&&N.ctl(dt,s,A,N))return;
          if(N.going){ if(Math.hypot(s.x-wx,s.z-wz)<.3*T||gap){ N.going=false; s.x=wx; s.z=wz; s.to=null; } else return; }
          const d=Math.hypot(you.x-s.x,you.z-s.z), fx=Math.sin(face), fz2=-Math.cos(face);
          if(R.role==='drill'&&!TALK.on){ drill(N,R,A,s,dt); }
          else if(post&&!TALK.on){ s.hold=true; s.to=null; s.x=wx; s.z=wz; let a=Math.atan2(X(1)*fx-X(0)*fx,Z(1)*fz2-Z(0)*fz2); if(d<4.5*T){ const w=Math.atan2(you.x-s.x,you.z-s.z), dd=((w-a+PI*3)%(PI*2))-PI; a+=Math.max(-1.1,Math.min(1.1,dd)); } s.face={x:s.x+Math.sin(a),z:s.z+Math.cos(a)}; }
          if(d<2.6*T&&SHARED.LVL==='up'&&!TALK.on&&!((N.greet=(N.greet||Math.random()*20)-dt)>0)){ N.greet=60+Math.random()*60; LINES.say(N,'gd:'+R.k); if(!A.mv){ A.act='salute'; A.t=0; N.aT=1.9; } }
          if(!A.mv&&(N.aT=(N.aT??2+Math.random()*4)-dt)<=0){ A.act=A.act?'':ACTS[Math.floor(Math.random()*ACTS.length)]; A.t=0; N.aT=A.act==='scan'?4+Math.random()*3:A.act?2.2:3+Math.random()*5; } }});
      N.park=!IN; N.gd=R; N.A=A; N.grip=grip; N.talk={start:'hi',lines:{hi:{say:R.say,opts:[...(CHARS.trade(N)?[{t:'WHAT DO YOU SELL?',do:'shop'}]:[]),{t:'WHAT DO YOU GUARD?',go:'keep'},{t:'GOODBYE.',go:''}]},keep:{say:D.keep,opts:[{t:'BACK.',go:'hi'}]}}};
      if(IN)scene.add(N.g);
      N.farMove=dt=>{ if((N.fT=(N.fT||0)+dt)<1)return; N.fT=0; N.lastT=0; BRN(0,{x:pos.x,z:pos.z},N.st,N); };
      if(RIGGED){ const body=FOLK.body(R); BODIES.fit(body); const FIG=BODIES.mesh(body), wrap=new THREE.Group(); wrap.scale.setScalar(1/body.S); wrap.add(FIG.me); N.body.add(wrap); N.me.visible=false;
        N.FIG=FIG; N.fbody=body; N.SR=RIG.create(); FOLK.drive(N,{mv:0,t:0,look:0},0,A,R,grip); N.st.v=RIG.SPEED*N.H/52*(R.role==='wander'?1.1:1); N.tris=body.tris(); N.geoHi=body.GEO;
        const q0=FOLK.Q; FOLK.Q=.5; try{ const lo=FOLK.body(R); N.geoLo=lo.GEO; N.trisLo=lo.tris(); } finally{ FOLK.Q=q0; } }
      else { const q0=FOLK.Q; FOLK.Q=.5; try{ const lo=RIGNPC.make({...def,parts:FOLK.parts(R)},{key:R.k+'~lo',name:R.n,eye:-1,metres:R.m,tall:1,radius:.18,speed:0,lv:'up',group:'park',x:wx,z:wz,range:0,brain:()=>{}});
          lo.shade(); N.geoHi=N.me.geometry; N.geoLo=lo.me.geometry; N.trisLo=lo.tris; const i=NPCS.indexOf(lo); if(i>=0)NPCS.splice(i,1); lo.g.removeFromParent(); lo.me.geometry=new THREE.BufferGeometry(); } finally{ FOLK.Q=q0; } }
      if(at[3]!=null)N.st.h=Math.atan2(X(1)*Math.sin(face)-X(0)*Math.sin(face),Z(1)*-Math.cos(face)-Z(0)*-Math.cos(face));
      return N; };
    for(const R of CREW){ try{ GUARD.list.push(mk(R)); }catch(e){ console.warn('guardian '+R.k,e); } }
    // coming up the castle stair: the nearest guard on watch hails you
    let was=SHARED.LVL; const [sx0,sx1,sy0,sy1]=[CASTLE.stair.x0,CASTLE.stair.x1,CASTLE.stair.y0,CASTLE.stair.y1];
    SYS.add('life',()=>{ const lv=SHARED.LVL; if(lv===was)return; const up=was==='down'&&lv==='up'; was=lv; if(!up)return;
      const cx=X((sx0+sx1)/2), cz=Z((sy0+sy1)/2); if(Math.hypot(pos.x-cx,pos.z-cz)>8*T)return;
      let best=null, bd=1e9; for(const N of GUARD.list){ const d=Math.hypot(N.st.x-pos.x,N.st.z-pos.z); if(d<bd&&N.gd.role==='post'){ bd=d; best=N; } } if(best&&bd<10*T)LINES.say(best,'gd_up'); },'146ja-guardians');
    window.GUARDDBG=()=>GUARD.list.map(N=>({k:N.key,x:+N.st.x.toFixed(2),z:+N.st.z.toFixed(2),y:+N.g.position.y.toFixed(2),vis:N.g.visible,far:!!N.far,tris:N.tris,lo:N.trisLo||0,hi:N.me.geometry===N.geoHi})); }); }
