// THE CLINIC (owner, 10 Nov 2026: "A clinic on the street"): its inside off the map (059i), the doctor's counter and shelves of implants (the shared shop inside, 162fa), and the operating chair where the doctor fits an implant you bought into one of your body slots, or takes one out (EQUIP.fit / EQUIP.unfit), each a short procedure behind the fade.
import {EQUIP, FORAGE, INV, ITEMS, ROOMS, SFX, TEXT} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {FADE, SYS} from './006-map-pre.js';
import {IKIT} from './038zc-ikit.js';
import {MSHOP} from './059i-mshops.js';
const CLINIC={}; window.CLINIC=CLINIC;
{ const say=(t,c)=>SAY(t,c||'#bfe8ff'), prop=(id,k)=>ITEMS.prop(id,k), esc=TEXT.esc, FEE=25;
  FORAGE.add({names:{im_lace:'NEURAL LACE',im_luck:'LUCK CHIP',im_cateye:"CAT'S EYES",im_hawk:'HAWK LENS',im_myo:'MYOFIBRE ARMS',im_heart:'CARDIO PUMP',im_gill:'GILL LUNG',im_plate:'SUBDERMAL PLATING',
    im_spring:'SPRING TENDONS',im_twitch:'FAST-TWITCH CALVES',im_adrenal:'ADRENAL GLAND',im_marrow:'MARROW PUMP'}});
  const SN={head:'HEAD',eyes:'EYES',arms:'ARMS',chest:'CHEST',legs:'LEGS',spine:'SPINE'};
  const GR={night:'NIGHT VISION IN DARK WATER',keen:'A KEENER EYE FOR FINDS',gills:'TWICE THE BREATH UNDERWATER',spring:'JUMP HIGHER',swift:'A LITTLE FASTER',adrenal:'STAMINA BACK TWICE AS FAST',mend:'HEALTH MENDS TWICE AS FAST',luck:'RARE FINDS A LITTLE LIKELIER'};
  const PL=[['plusStr','STRENGTH'],['plusInt','INTELLIGENCE'],['plusSta','STAMINA'],['plusHp','HEALTH']];
  const what=id=>[...PL.filter(([p])=>+prop(id,p)>0).map(([p,n])=>'+'+prop(id,p)+' '+n),...(GR[prop(id,'grants')]?[GR[prop(id,'grants')]]:[])].join(', ');
  CLINIC.what=what;
  const here=()=>!!(ROOMS.offIn&&ROOMS.offIn()==='clinic');
  FORAGE.NOTE.push(id=>EQUIP.slotOf&&EQUIP.slotOf(id)?SN[EQUIP.slotOf(id)]+' IMPLANT: '+what(id):'');
  FORAGE.ROWB.push(id=>EQUIP.slotOf&&EQUIP.slotOf(id)?[['FIT','implant']]:[]);
  FORAGE.ACT.implant=id=>{ if(!here())return say('ONLY THE DOCTOR AT THE CLINIC CAN FIT AN IMPLANT.','#c8a090'); CLINIC.fit(id); };

  // fitting and removing: only in the clinic, one to a slot, behind the fade
  let busy=false, built=false;
  CLINIC.fit=async id=>{ '@later'; const s=EQUIP.slotOf(id); if(!s||busy)return 'not'; if(!here()){ say('ONLY THE DOCTOR AT THE CLINIC CAN FIT AN IMPLANT.','#c8a090'); return 'away'; }
    const had=EQUIP.im[s]; if(had){ say(`THE DOCTOR: YOUR ${SN[s]} ALREADY HAS THE ${FORAGE.name(had)}. I TAKE THAT OUT FIRST.`,'#c8a090'); return 'full'; }
    if(!FORAGE.has(id)){ say('YOU HAVE NO '+FORAGE.name(id)+'. BUY ONE AT THE COUNTER.','#c8a090'); return 'none'; }
    busy=true; let r='not'; try{ await FADE.run('THE DOCTOR FITS THE '+FORAGE.name(id),()=>{ r=EQUIP.fit(id); },{hold:600}); } finally{ busy=false; }
    if(r==='ok'){ SFX.play('clunk',{vol:.4}); say(`THE ${FORAGE.name(id)} IS FITTED IN YOUR ${SN[s]}: ${what(id)}.`); } draw(); return r; };
  CLINIC.remove=async s=>{ '@later'; const id=EQUIP.im[s]; if(!id||busy)return null; if(!here()){ say('ONLY THE DOCTOR AT THE CLINIC CAN REMOVE AN IMPLANT.','#c8a090'); return null; }
    if(INV.cash<FEE){ say('TAKING ONE OUT IS $'+FEE+'. YOU HAVE $'+Math.round(INV.cash)+'.','#c8a090'); return null; }
    busy=true; let r=null; try{ await FADE.run('THE DOCTOR TAKES OUT THE '+FORAGE.name(id),()=>{ r=EQUIP.unfit(s); if(r)INV.cash-=FEE; },{hold:600}); } finally{ busy=false; }
    if(r){ SFX.play('clunk',{vol:.4}); say(`THE ${FORAGE.name(r)} IS OUT ($${FEE}). IT IS BACK IN YOUR PACK.`); } draw(); return r; };

  // the operating chair's window: your slots, what is fitted, and the implants in your pack
  const css=document.createElement('style'); css.textContent=`#clinicg{position:fixed;left:50%;top:12%;transform:translateX(-50%);width:min(380px,92vw);max-height:76vh;overflow-y:auto;z-index:21;font-family:'Share Tech Mono',ui-monospace,monospace;font-size:12px;letter-spacing:.4px;color:#bfe8ff;background:rgba(4,12,18,.94);box-shadow:0 0 0 1px #3a6a80;padding:8px 12px;zoom:var(--uiz,1)}
    #clinicg[hidden]{display:none} #clinicg h3{display:flex;margin:0 0 6px;font-size:12px;font-weight:400;letter-spacing:2px;color:#6ab8d8} #clinicg h3 b{flex:1;font-weight:400} #clinicg h3 i{font-style:normal;color:#f2c14e;margin-right:8px}
    #clinicg .cr{display:flex;align-items:center;gap:8px;padding:4px 6px;box-shadow:0 0 0 1px #2a4a5a;margin-bottom:3px} #clinicg .cr b{font-weight:400;width:52px;color:#6ab8d8} #clinicg .cr span{flex:1} #clinicg .cr u{display:block;text-decoration:none;color:#8aa8b4;font-size:10px}
    #clinicg button{font:inherit;color:#bfe8ff;background:#04121a;border:0;box-shadow:inset 0 0 0 1px #6ab8d8;padding:2px 8px;cursor:pointer} #clinicg button:hover{color:#04121a;background:#bfe8ff} #clinicg .ch{color:#6ab8d8;letter-spacing:2px;margin:8px 0 3px} #clinicg .cf{color:#8aa8b4;font-size:10px;margin-top:6px}`; document.head.appendChild(css);
  const P=document.createElement('div'); P.id='clinicg'; P.hidden=true; document.body.appendChild(P);
  P.addEventListener('keydown',e=>{ if(e.key==='Escape')CLINIC.close(); e.stopPropagation(); }); P.addEventListener('keyup',e=>e.stopPropagation());
  const mine=()=>Object.keys(INV.items).filter(id=>INV.items[id]>0&&EQUIP.slotOf(id)).sort();
  const draw=()=>{ if(P.hidden)return; let o=`<h3><b>THE OPERATING CHAIR</b><i>$${Math.round(INV.cash)}</i><button data-x="1" type="button">X</button></h3>`;
    o+=EQUIP.IMS.map(s=>{ const id=EQUIP.im[s]; return `<div class="cr"><b>${SN[s]}</b><span>${id?esc(FORAGE.name(id))+`<u>${esc(what(id))}</u>`:'<u>EMPTY</u>'}</span>${id?`<button type="button" data-out="${s}">REMOVE $${FEE}</button>`:''}</div>`; }).join('');
    const L=mine(); o+=`<div class="ch">IN YOUR PACK</div>`+(L.length?L.map(id=>{ const s=EQUIP.slotOf(id); return `<div class="cr"><b>${SN[s]}</b><span>${esc(FORAGE.name(id))}<u>${esc(what(id))}</u></span><button type="button" data-fit="${esc(id)}"${EQUIP.im[s]?' title="that slot is taken"':''}>FIT</button></div>`; }).join(''):'<div class="cf">NONE. THE DOCTOR SELLS THEM AT THE COUNTER.</div>');
    o+=`<div class="cf">ONE IMPLANT TO A SLOT. FITTING IS FREE; TAKING ONE OUT IS $${FEE} AND IT GOES BACK IN YOUR PACK.</div>`; P.innerHTML=o; };
  P.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b)return; if(b.dataset.x)return CLINIC.close(); if(b.dataset.fit)CLINIC.fit(b.dataset.fit); else if(b.dataset.out)CLINIC.remove(b.dataset.out); });
  CLINIC.open=()=>{ if(!here())return; P.hidden=false; draw(); };
  CLINIC.close=()=>{ P.hidden=true; };
  SYS.add('life',()=>{ if(!P.hidden&&!here())P.hidden=true; },'146zkc-clinic');

  // its inside: the shared shop (the doctor's counter, the shelves of implants), and the operating chair, a monitor and a screen
  MSHOP.kit.clinic=A=>{ '@later'; MSHOP.kit._(A); built=true; const R=A.R, F=IKIT.frame(R), Km=IKIT.room(F,o=>A.add(o),()=>{}), {box,cyl,ball,glow,use}=Km, W=F.W, D=F.D, tm=D/(R.y1-R.y0);
    const sol=(u0,v0,u1,v1)=>A.sol(R.x0+Math.min(u0,u1)/tm,R.y0+Math.min(v0,v1)/tm,R.x0+Math.max(u0,u1)/tm,R.y0+Math.max(v0,v1)/tm);
    const u=W*.18, v=(2.2*tm+1.05+D-.8)/2, STEEL=0xc8ccd2, SEAT=0x3a7a8a;
    cyl(u,v,.3,0,.06,STEEL); cyl(u,v,.07,.06,.5,STEEL); box(u-.32,v-.75,u+.32,v+.55,.5,.62,SEAT); box(u-.32,v-.95,u+.32,v-.72,.62,1.25,SEAT); box(u-.34,v+.4,u+.34,v+.55,.62,.7,STEEL); sol(u-.34,v-.95,u+.34,v+.55);
    box(u+.6,v-.9,u+.7,v-.8,0,1.6,STEEL); box(u+.55,v-1.05,u+.95,v-.95,1.4,1.7,0x1a2024); glow(()=>box(u+.57,v-.96,u+.93,v-.94,1.42,1.68,0x3aff9a));   // the monitor on its pole
    ball(u,v-.4,2.4,.32,0xf0f4f4,.3); glow(()=>ball(u,v-.4,2.33,.22,0xfff8e8,.2));   // the surgical lamp
    for(const k of [0,1,2])box(u-1.0+k*.02,v-1.4+k*.9,u-.96+k*.02,v-.6+k*.9,0,1.8,0xd8e8ec);   // a folding screen
    use('THE OPERATING CHAIR (FIT OR REMOVE AN IMPLANT)',u,v,.9,1.3,()=>{ say('THE DOCTOR: SIT DOWN. WHAT ARE WE DOING TODAY?'); CLINIC.open(); },1.6);
    Km.flush(); };
  MSHOP.kit.clinic.drop=()=>{ built=false; CLINIC.close(); };
  window.CLINICDBG=()=>({reg:!!ROOMS.off.clinic,inside:here(),built,im:{...EQUIP.im},plus:{...EQUIP.plus},open:!P.hidden,mine:mine()});
}
