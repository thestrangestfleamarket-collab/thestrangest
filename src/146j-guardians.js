// THE GUARDIANS: GUARD — the woodland folk who keep the castle over the dungeon (data/guardians.json): every body from one maker (a species head, a coat, a weapon), their posts and rounds round the castle, the welcome up the stair, and the keep's bounties on what you slay below.
import {SHARED} from './003-shx.js';
import {CHARS, CLOCK, FORAGE, INV, LINES, PARK, pos, TALK, VIT} from './003b-systems.js';
import {OWNED} from './005-save.js';
import {CASTLE, MODS, SYS, TILE} from './006-map-pre.js';
import {RIGNPC} from './083-npc-rig.js';
import {FOLK} from './146i-folk.js';
const GUARD={list:[]}; window.GUARD=GUARD;
{ const D=__DATA__("data/guardians.json"), T=TILE, say=(t,c)=>FORAGE.say&&FORAGE.say(t,c||'#f2c14e');
  // the bounty you hold: {id, n, got}, kept with your things; the dungeon's kills count toward it (SYS 'slain')
  let B=null; try{ B=JSON.parse(OWNED.get('bounty')||'null'); }catch(e){ B=null; }
  const keep=()=>{ try{ OWNED.set('bounty',JSON.stringify(B)); }catch(e){} }, def=id=>D.bounties.find(b=>b.id===id), done=()=>!!B&&B.got>=B.n;
  SYS.add('slain',e=>{ const d=B&&def(B.id); if(!d||done())return; if((d.kind==='any'||d.kind===e.kind)&&(e.lvl||1)>=(d.lvl||1)){ B.got++; keep(); if(done())say('BOUNTY DONE: '+d.t+'. OLD EMBER WILL PAY.'); } },'146j-guardians');
  TALK.ops.bounty=a=>{ const [w,id]=String(a).split(/\s+/), d=def(id||(B&&B.id));
    if(w==='take'&&d){ B={id:d.id,n:d.n,got:0}; keep(); say('BOUNTY: '+d.t+' ($'+d.pay+').'); }
    else if(w==='pay'&&d&&done()){ INV.cash+=d.pay; say('OLD EMBER PAYS YOU $'+d.pay+'.'); B=null; keep(); FORAGE.draw&&FORAGE.draw(); }
    else if(w==='drop'){ B=null; keep(); } };
  TALK.tests.bounty=a=>a==='on'?!!B:a==='done'?done():false;
  TALK.vars.bounty=()=>{ const d=B&&def(B.id); return d?d.t+': '+B.got+' OF '+B.n:'NOTHING'; };
  TALK.tests.vit=a=>a==='hurt'?VIT.hp<.99:true;
  TALK.ops.heal=a=>{ const c=+a||0; if(INV.cash<c)return say('YOU CANNOT AFFORD IT.','#c8a090'); INV.cash-=c; VIT.hp=1; say('THE HERBALIST MENDS YOU.','#b8f0a0'); FORAGE.draw&&FORAGE.draw(); };
  FORAGE.BUYK.slime=['slime_'];
  LINES.add('gd_up',['Back up! Good.','You made it out. Most do.','Anything follow you? No? Good.','Welcome back to the light.','Up the stair and still standing.']);
  for(const R of D.list)LINES.add('gd:'+R.k,R.say);
  GUARD.bounty=()=>B&&{...B};

  PARK.later(()=>{ '@park'; const PI=Math.PI, X=SHARED.BOD.XS, Z=SHARED.BOD.ZS, [bx0,,by0]=CASTLE.b;
    // the rig: the squirrel knight's bones, scaled to its bulk, with a cape and two ears that swing; the body from FOLK
    const mk=R=>{ const b=R.bulk||1, sp=R.sp, cat=sp==='caterpillar', A={act:'',t:0,k:0};
      const tail=sp==='mouse'||sp==='rat'?[[0,.3,-.1],[0,.2,-.28],[0,.18,-.46],[0,.28,-.6]]:sp==='redpanda'||sp==='raccoon'?[[0,.3,-.12],[0,.22,-.26],[0,.16,-.4],[0,.12,-.54]]:sp==='pangolin'?[[0,.26,-.12],[0,.14,-.3],[0,.06,-.48],[0,.03,-.62]]:sp==='lynx'||sp==='hyena'?[[0,.3,-.12],[0,.24,-.2],[0,.18,-.26],[0,.15,-.3]]:null;
      const bones=[['root',null,[0,0,0]],['hips','root',[0,.36,0]],['head','hips',[0,.66,0]],['earL','head',[-.08,.84,0]],['earR','head',[.08,.84,0]],['cape','hips',[0,.6,-.1]],
        ['armL','hips',[-.16*b,.56,0]],['armR','hips',[.16*b,.56,0]],['legL','hips',[-.08*b,.3,0]],['legR','hips',[.08*b,.3,0]],['tail1','hips',tail?tail[0]:[0,.3,-.12]],['tail2','tail1',tail?tail[1]:[0,.3,-.2]],['tail3','tail2',tail?tail[2]:[0,.3,-.28]]];
      const parts=FOLK.parts(R);
      const grip=['sword','glowsword','greatsword'].includes(R.w)?'blade':['spear','staff','orbstaff','mushstaff','lantern','axe','mace','starwand'].includes(R.w)?'pole':R.w==='bow'?'bow':'';
      const ACTS=grip==='blade'?['scan','salute','','look']:grip==='bow'?['scan','draw','']:R.w==='orbstaff'||R.w==='starwand'?['raise','scan','']:['scan','',''];
      const def={bones,parts,springs:{cape:{f:-.3,s:.18,k:28,c:4,lim:.5},earL:{f:-.08,s:.1,k:60,c:6,lim:.25},earR:{f:-.08,s:.1,k:60,c:6,lim:.25},tail1:{f:-.12,s:.12,k:40,c:5,lim:.35},tail2:{f:-.18,s:.16,k:30,c:4,lim:.45},tail3:{f:-.24,s:.2,k:24,c:3.4,lim:.6},head:{f:-.03,s:.03,k:90,c:9,lim:.1}},
        pose:(c,dt)=>{ const B=c.B, k=A.k=A.k+((A.act?1:0)-A.k)*Math.min(1,dt*6), t=A.t; RIGNPC.walk(c,{arm:.35,leg:.5,bob:.02,rock:.04}); B.head.rotation.y=c.look; if(c.sheet)return;
          if(R.pose==='sit'){ B.hips.position.y-=.17; B.legL.rotation.x=B.legR.rotation.x=-1.45; B.armL.rotation.x=-.5; B.armR.rotation.x=-.5; }
          if(cat){ B.head.rotation.z=Math.sin(c.t*.7)*.08; B.hips.rotation.x=Math.sin(c.t*.9)*.03; return; }
          if(grip==='blade'){ B.armR.rotation.x=-1.15+.05*Math.sin(c.t*1.3); B.armR.rotation.z=.12; }
          else if(grip==='pole'){ B.armR.rotation.x=R.pose==='sit'?-.6:-.28+.03*Math.sin(c.t*1.1); B.armR.rotation.z=.06; }
          else if(grip==='bow'){ B.armL.rotation.x=-1.3; B.armL.rotation.z=.25; B.armR.rotation.x=-.9-.4*(A.act==='draw'?k:0); B.armR.rotation.z=-.35; }
          if(R.shield){ B.armL.rotation.x=-.75; B.armL.rotation.z=-.1; } if(R.hold==='map'||R.hold==='herbs'||R.w==='mushroom'){ B.armL.rotation.x=-.85; B.armL.rotation.z=.1; }
          if(A.act==='scan'){ B.head.rotation.y=Math.sin(t*.7)*.9*k+c.look*(1-k); B.head.rotation.x=-.08*k; }
          if(A.act==='salute'){ const u=t<.25?t/.25:t<1.4?1:Math.max(0,1-(t-1.4)/.3); B.armL.rotation.x=-2.6*u*k; B.armL.rotation.z=-.15+.9*u*k; B.armR.rotation.x-=.35*u*k; }
          if(A.act==='raise'){ const u=Math.min(1,t/.5)*Math.max(0,Math.min(1,(2.4-t)/.5)); B.armR.rotation.x-=1.3*u*k; B.head.rotation.x=-.15*u*k; } } };
      const at=R.at, ox=bx0+at[0], oy=by0+at[1], post=R.role==='post', night=R.role==='night', big=b>1.15||R.m>.8;
      const N=RIGNPC.make(def,{key:R.k,name:R.n,eye:-1,metres:R.m,tall:1,radius:big?.26:.18,speed:R.role==='wander'?.45:.35,stride:7,lv:'up',group:'park',x:X(ox),z:Z(oy),
        home:{x:X(ox),z:Z(oy),r:(post||night?0:at[2])*T},range:post?0:at[2],ground:(x,z)=>MODS.bodega.ground(x,z),
        brain:(dt,you,s,N)=>{ if(N.sheet)return; A.t+=dt;
          if(night){ const dark=CLOCK.h>=19||CLOCK.h<6, r=(dark?at[2]:0)*T; if(s.home.r!==r){ s.home.r=r; if(!r){ s.to={x:X(ox),z:Z(oy)}; s.next=null; } } }
          const d=Math.hypot(you.x-s.x,you.z-s.z), face=at[3]!=null?at[3]*PI/180:0, fx=X(ox+Math.sin(face))-X(ox), fz2=Z(oy-Math.cos(face))-Z(oy);
          if(post&&!TALK.on){ s.hold=true; s.to=null; let a=Math.atan2(fx,fz2); if(d<4.5*T){ const w=Math.atan2(you.x-s.x,you.z-s.z), dd=((w-a+PI*3)%(PI*2))-PI; a+=Math.max(-1.1,Math.min(1.1,dd)); } s.face={x:s.x+Math.sin(a),z:s.z+Math.cos(a)}; }
          if(d<2.6*T&&SHARED.LVL==='up'&&!TALK.on&&!((N.greet=(N.greet||Math.random()*20)-dt)>0)){ N.greet=60+Math.random()*60; LINES.say(N,'gd:'+R.k); A.act='salute'; A.t=0; N.aT=1.9; }
          if((N.aT=(N.aT??2+Math.random()*4)-dt)<=0){ A.act=A.act?'':ACTS[Math.floor(Math.random()*ACTS.length)]; A.t=0; N.aT=A.act==='scan'?4+Math.random()*3:A.act?2.2:3+Math.random()*5; } }});
      N.park=true; N.gd=R; N.talk={start:'hi',lines:{hi:{say:R.say,opts:[...(CHARS.trade(N)?[{t:'WHAT DO YOU SELL?',do:'shop'}]:[]),{t:'WHAT DO YOU GUARD?',go:'keep'},{t:'GOODBYE.',go:''}]},keep:{say:D.keep,opts:[{t:'BACK.',go:'hi'}]}}};
      if(post&&at[3]!=null)N.st.h=Math.atan2(X(ox+Math.sin(at[3]*PI/180))-X(ox),Z(oy-Math.cos(at[3]*PI/180))-Z(oy));
      return N; };
    for(const R of D.list){ try{ GUARD.list.push(mk(R)); }catch(e){ console.warn('guardian '+R.k,e); } }
    // coming up the castle stair: the nearest guard on watch hails you
    let was=SHARED.LVL; const [sx0,sx1,sy0,sy1]=[CASTLE.stair.x0,CASTLE.stair.x1,CASTLE.stair.y0,CASTLE.stair.y1];
    SYS.add('life',()=>{ const lv=SHARED.LVL; if(lv===was)return; const up=was==='down'&&lv==='up'; was=lv; if(!up)return;
      const cx=X((sx0+sx1)/2), cz=Z((sy0+sy1)/2); if(Math.hypot(pos.x-cx,pos.z-cz)>8*T)return;
      let best=null, bd=1e9; for(const N of GUARD.list){ const d=Math.hypot(N.st.x-pos.x,N.st.z-pos.z); if(d<bd&&N.gd.role==='post'){ bd=d; best=N; } } if(best&&bd<10*T)LINES.say(best,'gd_up'); },'146j-guardians');
    window.GUARDDBG=()=>GUARD.list.map(N=>({k:N.key,x:+N.st.x.toFixed(2),z:+N.st.z.toFixed(2),y:+N.g.position.y.toFixed(2),vis:N.g.visible,far:!!N.far,tris:N.tris})); }); }
