// ---- THE TOYS, ALIVE (owner, 18 Oct 2026: "all the toys should be sentient real characters, not objects. get rid of the table they are on and let
// them walk around and do things"): the six of his TOYS-Psionic pack (the bear, the monkey, the penguin, the pig, the sheep, the bunny) that sat on
// the stall inside the park's gate, each cut here into parts on bones (RIGNPC, the tomato's way): his head above the narrowest place of his neck,
// his legs below a fifth of his height (two, or four for the pig and the sheep), a biped's arms out at his sides, the rest his body. Each walks
// the town as the others do (roaming the whole map, the park most of all from where he starts), a toy's waddle: short quick steps, a rock side to
// side, his head bobbing on a spring; standing, now and then he does a thing of his own (waves, hops, dances, sits down a while, turns about,
// sniffs the ground). Some 700-1,500 triangles each (6,800 the six), no lights, one shadow map each (SELF) as every character ----
const TOYS=window.TOYS={};
{ const DEF=[['toybear','THE TOY BEAR',2,.56],['toymonkey','THE TOY MONKEY',2,.54],['toypenguin','THE TOY PENGUIN',2,.5],['toypig','THE TOY PIG',4,.46],['toysheep','THE TOY SHEEP',4,.5],['toybunny','THE TOY BUNNY',2,.58]];
  const ACTS=[['wave',2.4],['hop',1.6],['dance',4],['sit',6],['spin',2],['sniff',2.5]];
  const build=([key,name,legs,h],i)=>{ const R=PARK.toyRaw(key); if(!R)return;
    // his points in metres: his foot at 0, his middle over the origin, his height h
    let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,z0=1e9,z1=-1e9; const p=R.p; for(let v=0;v<p.length;v+=3){ x0=Math.min(x0,p[v]); x1=Math.max(x1,p[v]); y0=Math.min(y0,p[v+1]); y1=Math.max(y1,p[v+1]); z0=Math.min(z0,p[v+2]); z1=Math.max(z1,p[v+2]); }
    const k=h/(y1-y0), cx=(x0+x1)/2, cz=(z0+z1)/2, Q=new Float32Array(p.length); for(let v=0;v<p.length;v+=3){ Q[v]=(p[v]-cx)*k; Q[v+1]=(p[v+1]-y0)*k; Q[v+2]=(p[v+2]-cz)*k; }
    // the neck: the narrowest slice between 45% and 85% of his height (his head the part above it)
    const S=24, wd=new Array(S).fill(0); for(let v=0;v<Q.length;v+=3){ const b=Math.min(S-1,Math.floor(Q[v+1]/h*S)); wd[b]=Math.max(wd[b],Math.abs(Q[v]),Math.abs(Q[v+2])*.8); }
    let nb=Math.floor(S*.6); for(let b=Math.floor(S*.45);b<=Math.floor(S*.85);b++)if(wd[b]&&wd[b]<wd[nb])nb=b; const NY=(nb+.5)/S*h, LY=h*.2;
    let bw=0; for(let v=0;v<Q.length;v+=3)if(Q[v+1]>LY&&Q[v+1]<NY)bw=Math.max(bw,Math.abs(Q[v]));
    // each triangle to its part by its middle; its colours as the park drew them (each face a touch lighter or darker)
    const G={}, add=(n,a,b)=>{ (G[n]||(G[n]={P:[],C:[]})); for(let v=a;v<b;v+=3){ G[n].P.push(Q[v],Q[v+1],Q[v+2]); } };
    for(let t=0;t<Q.length/9;t++){ const a=t*9, mx=(Q[a]+Q[a+3]+Q[a+6])/3, my=(Q[a+1]+Q[a+4]+Q[a+7])/3, mz=(Q[a+2]+Q[a+5]+Q[a+8])/3;
      let n='body'; if(my>NY)n='head'; else if(my<LY)n=legs===4?'leg'+(mx<0?'L':'R')+(mz<0?'B':'F'):'leg'+(mx<0?'L':'R'); else if(legs===2&&Math.abs(mx)>bw*.62)n='arm'+(mx<0?'L':'R');
      add(n,a,a+9); const g=G[n], sh=R.k[t]===0?.9+.2*((t*7919%97)/97):.95+.1*((t*104729%89)/89); for(let j=0;j<3;j++)g.C.push(R.c[a+j*3]/255*sh,R.c[a+j*3+1]/255*sh,R.c[a+j*3+2]/255*sh); }
    // his bones: a hip at his legs' top, his head at the neck, each leg and arm at its own top
    const mid=n=>{ const P=G[n].P; let sx=0,sz=0,top=0; for(let v=0;v<P.length;v+=3){ sx+=P[v]; sz+=P[v+2]; top=Math.max(top,P[v+1]); } return [sx/(P.length/3),top,sz/(P.length/3)]; };
    const bones=[['root',null,[0,0,0]],['hips','root',[0,LY,0]],['head','hips',[0,NY,0]]];
    for(const n of Object.keys(G))if(/^(leg|arm)/.test(n)){ const m=mid(n); bones.push([n,n[0]==='l'?'root':'hips',n[0]==='l'?[m[0],LY,m[2]]:[m[0],Math.min(m[1],NY)-.02,m[2]]]); }
    const has=n=>!!G[n], parts=Object.keys(G).map(n=>({name:n,rank:n==='head'?2:1,bone:n==='body'?'hips':n,of:[{P:Float32Array.from(G[n].P),C:Float32Array.from(G[n].C)}]}));
    // what he does when he stops: one of his things now and then, a while each
    const act={n:null,t:0,d:0,wait:2+Math.random()*4};
    const pose=(c,dt)=>{ const B=c.B, ph=c.st.ph, m=c.mv, sw=Math.sin(ph)*m;
      if(c.sheet){ if(has('armL')){ B.armL.rotation.z=-1.2; B.armR.rotation.z=1.2; } return; }
      // his waddle
      if(legs===2){ if(has('legL')){ B.legL.rotation.x=-sw*.55; B.legR.rotation.x=sw*.55; } if(has('armL')){ B.armL.rotation.x=sw*.6; B.armR.rotation.x=-sw*.6; } }
      else for(const [n,s] of [['legLF',1],['legRB',1],['legRF',-1],['legLB',-1]])if(has(n))B[n].rotation.x=sw*.5*s;
      B.hips.position.y+=Math.abs(Math.cos(ph))*.02*m; B.hips.rotation.z=Math.sin(ph)*.09*m; B.head.rotation.y=c.look;
      // his thing, standing
      if(m>.05){ act.n=null; act.wait=1.5+Math.random()*4; return; }
      if(!act.n){ if((act.wait-=dt)<=0){ const A=ACTS.filter(a=>legs===2||!/wave|dance/.test(a[0])); const a=A[Math.floor(Math.random()*A.length)]; act.n=a[0]; act.d=a[1]; act.t=0; } return; }
      const t=act.t+=dt, u=Math.min(1,t/act.d), e=Math.sin(Math.PI*u);   // (e: in and out of it)
      if(act.n==='wave'&&has('armR')){ B.armR.rotation.z=2.4*Math.min(1,e*3); B.armR.rotation.x=Math.sin(t*12)*.35*Math.min(1,e*3); B.head.rotation.z=-.15*e; }
      if(act.n==='hop'){ const q=(t*2.5)%1; B.root.position.y+=Math.max(0,Math.sin(q*Math.PI))*.12*e; if(has('armL')){ B.armL.rotation.z=-.8*e; B.armR.rotation.z=.8*e; } }
      if(act.n==='dance'){ B.hips.rotation.z+=Math.sin(t*7)*.22*e; B.hips.rotation.y=Math.sin(t*3.5)*.5*e; B.head.rotation.z=-Math.sin(t*7)*.2*e; if(has('armL')){ B.armL.rotation.z=-(1.6+Math.sin(t*7)*.6)*e; B.armR.rotation.z=(1.6-Math.sin(t*7)*.6)*e; }
        if(has('legL')){ B.legL.rotation.x=Math.max(0,Math.sin(t*7))*-.4*e; B.legR.rotation.x=Math.max(0,-Math.sin(t*7))*-.4*e; } }
      if(act.n==='sit'){ const s=Math.min(1,Math.min(t,act.d-t)*2.5); B.hips.position.y-=LY*.85*s; for(const n of ['legL','legR','legLF','legRF'])if(has(n))B[n].rotation.x=-1.4*s; B.head.rotation.y=c.look+Math.sin(t*.8)*.4*s; }
      if(act.n==='spin'){ B.hips.rotation.y=u*Math.PI*2; }
      if(act.n==='sniff'){ B.head.rotation.x=.45*e+Math.sin(t*14)*.05*e; B.hips.rotation.x=.12*e; }
      if(u>=1){ act.n=null; act.wait=3+Math.random()*7; } };
    const at=PARK.toyAt, o=Object.assign({eye:0,eyeC:'0.,0.,0.'},PARTSNPC.street(0,0),{key,name,metres:h,radius:.16+.04*(legs===4),speed:.35+Math.random()*.15,stride:11,x:at[0]+(i-2.5)*.5*TILE,z:at[1]+(i%2)*.4*TILE},RIGNPC.hold(i));
    TOYS[key]=RIGNPC.make({bones,parts,springs:{head:{f:-.06,s:.06,k:80,c:7,lim:.25}},pose},o); };
  if(typeof PARK==='undefined'||!PARK.toyRaw)console.warn('TOYS: no park'); else DEF.forEach(build); }
