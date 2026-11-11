// THE BACK SLOT (src/146c-equip.js, 146zpe-back.js, 162ea-doll.js): node tests/back.cjs [dist/market.html] [out folder]. What can be slung (ON THE BACK: an instrument you carry, a blade, a rod, a long gun) goes in the BACK slot from the bag's row, the doll's BACK button or a drop on it; the piano and what is not slung do not;
// it is drawn on your back and on another player's; playing an instrument takes it off your back and putting it away puts it back; holding it takes it off your back; the cloud coat is archived. With an out folder, pictures from behind.
const {chromium}=require('playwright'), path=require('path');
const PAGE=path.resolve(process.argv[2]||'dist/market.html'), OUT=process.argv[3];
(async()=>{ const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']}); const pg=await b.newPage({viewport:{width:960,height:600}}); let bad=0; const errs={};
  pg.on('pageerror',e=>{ const k=e.message.slice(0,160); errs[k]=(errs[k]||0)+1; });
  const rec=(n,ok,i)=>{ if(!ok)bad++; console.log((ok?'PASS ':'FAIL ')+n+(i?'  · '+i:'')); };
  const wait=ms=>new Promise(r=>setTimeout(r,ms)), U=async(f,ms=120000)=>{ for(const t=Date.now();Date.now()-t<ms;await wait(400))if(await pg.evaluate(f))return true; return false; };
  await pg.goto('file://'+PAGE+'?fresh=1&hour=12&at=80,95',{timeout:240000}); await pg.waitForFunction(()=>window.__started,null,{timeout:300000});
  await U(()=>window.AVATAR&&AVATAR.ready()); await pg.evaluate(()=>window.LOAD&&LOAD('later')); await wait(1200);
  const me=()=>W3.group.children.find(m=>m.userData&&m.userData.hands);
  // which things go on your back
  const f=await pg.evaluate(()=>{ for(const id of ['guitar','violin','flute','trumpet','piano','drums','harp','sword','rod','scuba','cowboyhat','w_sniper','cloudcoat','brickphone'])FORAGE.give(id,1);
    const q=id=>EQUIP.slotOf(id); return {guitar:q('guitar'),violin:q('violin'),flute:q('flute'),trumpet:q('trumpet'),piano:q('piano'),drums:q('drums'),harp:q('harp'),sword:q('sword'),rod:q('rod'),scuba:q('scuba'),hat:q('cowboyhat'),sniper:q('w_sniper'),coat:q('cloudcoat'),phone:ITEMS.prop('brickphone','slot'),sniperHeld:ITEMS.prop('w_sniper','slot')}; });
  rec('instruments you carry, blades, the rod and long guns go on your back; the piano, drum kit and harp do not; the scuba set is worn there; a hat on your head',
    f.guitar==='back'&&f.violin==='back'&&f.flute==='back'&&f.trumpet==='back'&&!f.piano&&!f.drums&&!f.harp&&f.sword==='back'&&f.rod==='back'&&f.sniper==='back'&&f.scuba==='back'&&f.hat==='head',JSON.stringify(f));
  rec('the cloud coat is archived: not worn, not in the bag; the brick phone is not called held; a gun is held',!f.coat&&f.phone==='none'&&f.sniperHeld==='hand'&&await pg.evaluate(()=>ARCHI('cloudcoat')),JSON.stringify(f));
  // the doll: the BACK button lists them, a drop on it slings it, it shows there and on you
  const d=await pg.evaluate(async()=>{ __dbg.UI.setView('third'); DOLL.me(); await new Promise(r=>setTimeout(r,300)); const el=document.getElementById('doll'); el.querySelector('[data-s="back"]').click(); await new Promise(r=>setTimeout(r,200));
    const list=[...el.querySelectorAll('.dl-pick [data-w]')].map(b=>b.dataset.w); DOLL.drop('guitar','back'); await new Promise(r=>setTimeout(r,600));
    const me=W3.group.children.find(m=>m.userData&&m.userData.hands), btn=el.querySelector('[data-s="back"]');
    const r={list,by:EQUIP.by.back,btn:btn.classList.contains('on')&&!!btn.querySelector('img'),drawn:me.children.some(c=>c.name==='guitar'),seen:ONLINE.mine.bk(),saved:JSON.parse((window.OWNED||PETS.dbg.OWNED).get('equip')||'{}').back};
    DOLL.drop('piano','back'); r.piano=EQUIP.by.back; DOLL.drop('cowboyhat','back'); r.hat=EQUIP.by.back; return r; });
  rec('the doll\'s BACK lists what can be slung (not the piano); a guitar dropped on BACK is slung, shows on the button, on you and to others, and is saved; a piano or a hat dropped there is not',
    ['guitar','violin','sword','rod','scuba'].every(i=>d.list.includes(i))&&!d.list.includes('piano')&&!d.list.includes('cowboyhat')&&d.by==='guitar'&&d.btn&&d.drawn&&d.seen==='guitar'&&d.saved==='guitar'&&d.piano==='guitar'&&d.hat==='guitar',JSON.stringify(d));
  // where it hangs: behind you, between your hips and the top of your head
  const pl=async id=>pg.evaluate(async id=>{ EQUIP.wear(id,true); await new Promise(r=>setTimeout(r,500)); const THREE=__dbg.THREE, me=W3.group.children.find(m=>m.userData&&m.userData.hands), g=me.children.find(c=>c.name==='back'||c.name==='guitar'); if(!g)return null;
    me.updateMatrixWorld(true); const B=new THREE.Box3().setFromObject(g), k=new THREE.Vector3().setFromMatrixScale(me.matrixWorld).x, c=me.worldToLocal(B.getCenter(new THREE.Vector3())), s=B.getSize(new THREE.Vector3());   // (in the body's own frame: metres, forward +z, feet at 0)
    return {id:EQUIP.by.back,z:+c.z.toFixed(2),y:+c.y.toFixed(2),len:+(Math.max(s.x,s.y,s.z)/k).toFixed(2)}; },id);
  const P={}; for(const id of ['violin','flute','trumpet','sword','rod','w_sniper','guitar'])P[id]=await pl(id);
  if(OUT){ require('fs').mkdirSync(OUT,{recursive:true}); for(const id of ['guitar','violin','sword','w_sniper','trumpet']){ await pg.evaluate(async id=>{ EQUIP.wear(id,true); __dbg.UI.setView('third'); await new Promise(r=>setTimeout(r,800)); },id); await pg.screenshot({path:path.join(OUT,'back-'+id+'.png')}); } }
  rec('each hangs behind you, at your back\'s height, its own size',Object.values(P).every(p=>p&&p.z<-.08&&p.y>.7&&p.y<1.5&&p.len>.3&&p.len<3.2),JSON.stringify(P));
  // playing takes it off your back, putting it away puts it back; holding a sword takes it off your back
  const pv=await pg.evaluate(async()=>{ EQUIP.wear('violin',true); const a=EQUIP.by.back; INSTR.start('violin'); await new Promise(r=>setTimeout(r,500)); const b=EQUIP.by.back; INSTR.stop(); await new Promise(r=>setTimeout(r,300)); const c=EQUIP.by.back;
    INSTR.start('piano'); await new Promise(r=>setTimeout(r,300)); INSTR.stop(); const pn=EQUIP.by.back;
    EQUIP.wear('sword',true); WIELD.set('sword'); const s1=EQUIP.by.back, h=WIELD.on; FORAGE.ACT.equip('sword'); const s2=EQUIP.by.back, h2=WIELD.on;
    FORAGE.take('sword',1); await new Promise(r=>setTimeout(r,1500)); return {a,b,c,pn,s1,h,s2,h2,gone:EQUIP.by.back||null}; });
  rec('the violin comes off your back to play and goes back on when put away; the piano does not; holding the sword takes it off your back, slinging it frees your hand; sold or lost, it comes off',
    pv.a==='violin'&&!pv.b&&pv.c==='violin'&&pv.pn==='violin'&&!pv.s1&&pv.h==='sword'&&pv.s2==='sword'&&!pv.h2&&!pv.gone,JSON.stringify(pv));
  // another player's: drawn on them from their word
  const o=await pg.evaluate(async()=>{ const P=__dbg.you(), at=[P.x+1.6,P.z+.4,SHARED.py,0,SHARED.LVL,''];
    ONLINE.feed({t:'hi',you:'me',all:[{id:'g1',name:'LUZ',look:'b:avatar:'+AVATAR.code(),at,x:{bk:'trumpet'}}]}); await new Promise(r=>setTimeout(r,2500)); const S=BACK.THEM.get('g1'), r={on:!!(S&&S.gm&&S.gm.parent)};
    ONLINE.feed({t:'out',id:'g1'}); await new Promise(r=>setTimeout(r,800)); r.gone=!BACK.THEM.has('g1'); return r; });
  rec('another player\'s trumpet on their back, gone when they go',o.on&&o.gone,JSON.stringify(o));
  rec('no page errors',!Object.keys(errs).length,JSON.stringify(errs));
  await b.close(); console.log(bad?bad+' FAILED':'ALL PASS'); process.exit(bad?1:0); })();
