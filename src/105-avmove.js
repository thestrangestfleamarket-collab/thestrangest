window.BODYTYPES={AVERAGE:{h:1},SLIM:{h:1.01,chest:[.88,.88],waist:[.84,.84],belly:.84,arm:.82,thigh:.85,calf:.88,neck:.9},
  ATHLETIC:{h:1.02,chest:[1.16,1.12],waist:[.96,.95],belly:.92,arm:1.22,thigh:1.12,calf:1.08,neck:1.12},
  HEAVY:{h:1,chest:[1.18,1.25],waist:[1.32,1.36],belly:1.45,arm:1.25,thigh:1.25,calf:1.14,neck:1.2},
  STOCKY:{h:.9,chest:[1.12,1.1],waist:[1.12,1.12],belly:1.15,arm:1.15,thigh:1.16,calf:1.12,neck:1.15},
  TALL:{h:1.1,chest:[.96,.95],waist:[.92,.92],belly:.92,arm:.93,thigh:.93,calf:.94,neck:.97}};
{ const P=document.getElementById('av');
  const SP0={wk:1,rk:1,anim:1}; let SP={...SP0}; try{ Object.assign(SP,JSON.parse(localStorage.getItem('market-speed')||'{}')); }catch(e){}
  const apply=()=>{ st.wk=SP.wk; st.rk=SP.rk; st.anim=SP.anim; try{ localStorage.setItem('market-speed',JSON.stringify(SP)); }catch(e){} };
  apply(); window.SPEED=(o)=>{ if(o){ Object.assign(SP,o); apply(); } return {...SP,x:pos.x,z:pos.z,run:st.run}; };
  if(P){ const tabs=P.querySelector('.tabs'), b=document.createElement('button'); b.dataset.t='speed'; b.textContent='MOVE'; tabs.appendChild(b); b.onclick=()=>AV.open('speed');
    const sl=(id,lab)=>`<div class="row"><span class="lab">${lab}</span><input type="range" id="${id}" min="0.25" max="3" step="0.05"><span class="val" id="${id}v"></span></div>`;
    const pane=document.createElement('div'); pane.className='pane'; pane.dataset.p='speed'; pane.hidden=true;
    pane.innerHTML=`<h3>HOW FAST HE GOES</h3>${sl('avwk','WALK SPEED')}${sl('avrk','RUN SPEED')}
      <h3>HOW FAST HE MOVES</h3>${sl('avan','ANIMATION SPEED')}
      <div class="dim">(walk and run: his pace, his legs keeping up with it. Animation: his steps, punches, kicks, rolls and his standing about, quicker or slower; how fast he goes stays as set above. 1.00 is his own)</div>
      <h3>QUICK</h3><div class="row"><button class="btn" data-q="slow">STROLL</button><button class="btn" data-q="norm">NORMAL</button><button class="btn" data-q="fast">QUICK</button><button class="btn" data-q="zoom">ZOOM</button></div>`;
    P.querySelector('.foot').before(pane);
    const Q={slow:{wk:.7,rk:.8,anim:.85},norm:{...SP0},fast:{wk:1.4,rk:1.4,anim:1.2},zoom:{wk:2.2,rk:2.5,anim:1.6}};
    const rows=[['avwk','wk'],['avrk','rk'],['avan','anim']], draw=()=>rows.forEach(([id,k])=>{ pane.querySelector('#'+id).value=SP[k]; pane.querySelector('#'+id+'v').textContent=(+SP[k]).toFixed(2); });
    rows.forEach(([id,k])=>{ pane.querySelector('#'+id).oninput=e=>{ SP[k]=+e.target.value; apply(); draw(); }; });
    pane.querySelectorAll('[data-q]').forEach(q=>q.onclick=()=>{ Object.assign(SP,Q[q.dataset.q]); apply(); draw(); }); draw();
    const body=P.querySelector('[data-p="body"]'), h=document.createElement('div');
    h.innerHTML=`<h3>BODY TYPE <span class="dim">(OVER MALE / FEMALE)</span></h3><div class="row" id="avbt">${Object.keys(BODYTYPES).map(n=>`<button class="btn" data-bt="${n}">${n}</button>`).join('')}</div>`;
    body.prepend(h);
    const drawBT=()=>h.querySelectorAll('[data-bt]').forEach(x=>x.setAttribute('aria-pressed',String((window.BODYTYPE?BODYTYPE():'AVERAGE')===x.dataset.bt)));
    h.querySelectorAll('[data-bt]').forEach(x=>x.onclick=()=>{ BODYTYPE(x.dataset.bt); drawBT(); }); drawBT(); AV.drawBT=drawBT; } }
{ const BT=BODYTYPES, LR=(n,v)=>({[n+'L']:v,[n+'R']:v});
  const pieces=T=>{ const c=T.chest||[1,1], w=T.waist||[1,1], a=T.arm||1, th=T.thigh||1, ca=T.calf||1, ne=T.neck||1;
    return {torso:[c[0],1,c[1]],hips:[w[0],1,Math.max(w[1],T.belly||1)],neck:[ne,1,ne],...LR('upperArm',[a,1,a]),...LR('sleeve',[a,1,a]),...LR('forearm',[a,1,a]),...LR('thigh',[th,1,th]),...LR('shin',[ca,1,ca])}; };
  let cur='AVERAGE'; try{ cur=localStorage.getItem('market-bodytype')||'AVERAGE'; }catch(e){} if(!BT[cur])cur='AVERAGE';
  const wapply=()=>{ const T=BT[cur], B=LOOKS.BUILDS[LOOKS.L.build]||LOOKS.BUILDS[0], F=pieces(T); W3.E=W3.E||[];
    for(const n in F){ const i=W3.idx(n); if(i<0)continue; const b=B[2][n]||[1,1,1], f=F[n], E=W3.E[i]||(W3.E[i]={s:[1,1,1],o:[0,0,0],q:[0,0,0,1]}); E.s=[b[0]*f[0],b[1]*f[1],b[2]*f[2]]; }
    W3.BH=B[1]*(LOOKS.L.hk||1)*T.h; };
  window.BODYTYPE=name=>{ if(name){ cur=BT[name]?name:'AVERAGE'; try{ localStorage.setItem('market-bodytype',cur); }catch(e){} wapply(); if(typeof ED!=='undefined'&&ED.save)ED.save(); } return cur; };
  const sb=LOOKS.setBuild, sh=LOOKS.height; LOOKS.setBuild=i=>{ sb(i); wapply(); if(typeof ED!=='undefined'&&ED.save)ED.save(); }; LOOKS.height=k=>{ sh(k); W3.BH*=BT[cur].h; };
  if(cur!=='AVERAGE')wapply(); if(AV.drawBT)AV.drawBT(); }
