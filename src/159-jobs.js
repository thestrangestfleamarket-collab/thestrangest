const JOBS={on:QS.has('jobs')?QS.get('jobs')!=='0':CITY.on,list:[],plan:null}; window.JOBS=JOBS;
if(JOBS.on){ const T=TILE, X=BOD.XS, Z=BOD.ZS, rnd=Math.random;
  const WORK=[['diner','COOK',7,15],['bar','BARKEEP',16,23.5],['aquarium','AQUARIST',10,18],['dojo','BATH ATTENDANT',9,17],['market','LOUNGE HOST',11,22],['museum','CURATOR',10,17],
    ['lucky','DEALER',12,22.5],['yellow','BARISTA',7.5,15.5],['theatre','PROJECTIONIST',13,23],['playhouse','STAGE MANAGER',14,22],['baker','LANDLADY',9,17],['cottage','GARDENER',8,16],
    ['keep','CASTLE KEEPER',9,17],['park','PARK KEEPER',8,18],['subway','NEWSSTAND',6.5,14.5]];
  JOBS.plan=(B,W)=>{ '@later'; const by=id=>B.find(b=>b.id===id), keep=by('keep'), free=W.slice().sort((a,b)=>a.N.key<b.N.key?-1:1);
    const spotOf=id=>{ if(id==='park'){ const r={x:X(PARK.round[0]+PARK.ox),z:Z(PARK.round[1]+PARK.oy)}; return {spot:{x:r.x+2.2*T,z:r.z-2.2*T},door:r,out:true}; }
      if(id==='subway'){ const P=CITY.place('subway'); return P&&{spot:{x:P.door.x+1.6*T,z:P.door.z+.6*T},door:P.door,out:true}; }
      const b=by(id); return b&&{b,door:{x:b.F.at.x+b.F.n.x*.8*T,z:b.F.at.z+b.F.n.z*.8*T}}; };
    for(const [id,title,open,close] of WORK){ const S=spotOf(id); if(!S||!free.length)continue; const w=free.shift(), J={w,id,title,open,close,S,state:'',t:0};
      const b=id==='park'?keep:S.b; if(b){ b.up=b.up||[]; const unit=String(b.up.length+2); b.up.push({unit,who:{type:'walker',ref:w,name:null}}); J.home='up'; J.upB=b; J.upUnit=unit; }
      w.job=J; JOBS.list.push(J); }
    const bod=by('bodega'); if(bod){ bod.up=bod.up||[]; bod.up.push({unit:String(bod.up.length+2),who:{type:'shop',ref:'bodega',name:'THE FOX'}}); }
    return JOBS.list; };

  const inside=(N,on)=>{ N.free=on?((x,z,R)=>!CLIP.hit(SOL.up,x,z,R)):(N.free0||(N.free0=N.free)); };
  const workSpot=J=>{ '@later'; if(J.spot)return J.spot; if(J.S.out)return J.spot=J.S.spot; const F=J.S.b.F, N=J.w.N, ok=(x,z)=>!CLIP.hit(SOL.up,x,z,N.st.R*1.4)&&ROOMS.boxes().some(b=>b.y0<1&&x>b.x0&&x<b.x1&&z>b.z0&&z<b.z1);
    for(const dep of [2.2,1.6,2.8,3.4,1.2,4])for(const lat of [0,.8,-.8,1.6,-1.6,2.4,-2.4]){ const x=F.at.x-F.n.x*dep*T+F.t.x*lat*T, z=F.at.z-F.n.z*dep*T+F.t.z*lat*T; if(ok(x,z))return J.spot={x,z,face:{x:F.at.x+F.n.x*3*T,z:F.at.z+F.n.z*3*T}}; }
    return J.spot=J.S.door; };
  const homeOf=J=>J.w.home;
  const hide=(N,v)=>{ if(v){ N.mode='hidden'; N.g.visible=false; N.st.hold=true; N.st.to=null; } else { delete N.mode; N.g.visible=true; N.fv=true; N.st.hold=false; } };
  const go=(J,to,v,then)=>{ const N=J.w.N; N.st.hold=false; CITY.send(N,to,{v,then}); };
  const bed=J=>Math.min(25,J.close+1+(J.w.N.key.length%3)*.4), wake=J=>J.open-1-(J.w.N.key.length%4)*.15;
  const shouldBe=(J,h)=>{ const b=bed(J)%24, wk=wake(J); const night=b<wk?(h>=b&&h<wk):(h>=b||h<wk); if(night)return 'home'; if(h>=J.open&&h<J.close)return 'work'; return h<J.open?'work':'off'; };
  const toWork=J=>{ '@later'; const N=J.w.N, A=homeOf(J), s=workSpot(J); if(J.state==='home'){ hide(N,false); if(A&&A.step){ const st=A.step; N.st.x=st.x; N.st.z=st.z; N.g.position.x=st.x; N.g.position.z=st.z; } }
    J.state='commute'; inside(N,true); N.dwell=null; go(J,s,J.w.v||1.2,ok=>{ if(J.state!=='commute')return; if(!ok){ J.state='lost'; J.t=6; inside(N,false); return; } J.state='work'; N.st.hold=true; N.st.to=null; N.st.face=s.face||null; N.dwell=pick(['UAL_Idle_Talking_Loop','idle_a','UAL_Idle_Loop']); }); };
  const offWork=J=>{ const N=J.w.N; J.state='leaving'; N.dwell=null; go(J,J.S.door,J.w.v||1.2,()=>{ if(J.state!=='leaving')return; inside(N,false); J.state='off'; J.w.state='wait'; J.w.t=1; }); };
  const goHome=J=>{ '@later'; const N=J.w.N, A=homeOf(J); if(!A||!A.step){ if(J.state==='work'||J.state==='commute')offWork(J); else if(J.state!=='leaving')J.state='off'; return; } const wasIn=J.state==='work'||J.state==='commute'||J.state==='leaving'; J.state='homing'; inside(N,wasIn); N.dwell=null; CITY.stop(N); go(J,A.step,J.w.v||1.2,ok=>{ if(J.state!=='homing')return; if(!ok){ J.state='off'; J.t=20; return; }
      J.state='home'; inside(N,false); hide(N,true); if(window.MAIL&&MAIL.ready)MAIL.take(A.id,N.name); }); };
  const pick=a=>a[Math.floor(rnd()*a.length)];
  let acc=0; SYS.add('city',(dt,you)=>{ '@later'; if((acc+=dt)<.5)return; acc=.0; const h=CLOCK.h;
    for(const J of JOBS.list){ if(!J.w.home&&!J.started)continue; J.started=true; if(J.t>0&&(J.t-=.5)>0)continue; const want=shouldBe(J,h);
      if(want==='work'&&(J.state===''||J.state==='home'||J.state==='off'||J.state==='lost'||J.state==='homing'))toWork(J);
      else if(want==='off'&&(J.state==='work'||J.state==='commute'))offWork(J);
      else if(want==='off'&&J.state==='')J.state='off';
      else if(want==='home'&&J.state!=='home'&&J.state!=='homing'){ if(J.state==='work'||J.state==='commute'){ J.state='work'; } goHome(J); } } },'159-jobs');
  window.JOBDBG=()=>JOBS.list.map(J=>({who:J.w.N.name,key:J.w.N.key,id:J.id,title:J.title,hours:J.open+'-'+J.close,state:J.state,home:J.w.home&&J.w.home.label,homeTiles:J.w.home&&J.w.home.step?+(Math.hypot(J.w.home.step.x-(J.S.door.x),J.w.home.step.z-J.S.door.z)/T).toFixed(1):null,at:[+(J.w.N.st.x/T+72).toFixed(1),+(J.w.N.st.z/T-77).toFixed(1)],vis:J.w.N.g.visible}));
}
