// THE ITEM CARD: ITEMCARD is the one card a thing shows when you point at it anywhere (owner, 11 Nov 2026): the bag, the quick bar, the wheel, shops, trades, the vault, the doll (an element with data-card="id"). Its own 3D model turning, its name in its rarity's colour, the rarity and kind, what it does, worth, the skill it feeds, one line about it (data/examine.json), who found it, the keys.
import {THREE} from './003-shx.js';
import {FORAGE, INSPECT, INV, ITEMS, TEXT, WORTH} from './003b-systems.js';
import {renderer} from './004-main.js';
import {SYS} from './006-map-pre.js';
import {RARITY} from './013a-rarity.js';
const ITEMCARD={};
{ const esc=TEXT.esc, S=96; let EX={ids:{},pre:[]}; try{ EX=__DATA__("data/examine.json")||EX; }catch(e){}
  const kindOf=id=>String(id).split('~')[0], P=(id,k)=>ITEMS.prop(kindOf(id),k);
  ITEMCARD.examine=id0=>{ const id=kindOf(id0); if(EX.ids[id])return EX.ids[id]; let best=null; for(const [p,t] of EX.pre)if(id.startsWith(p)&&(!best||p.length>best[0].length))best=[p,t]; return best?best[1]:''; };
  const GR={tools:'TOOL',food:'FOOD',music:'MUSIC',rides:'RIDE',lights:'LIGHT',wear:'WEAR',finds:'FIND',other:'THING'};
  const GRANT={ride:'You ride it.',fly:'It flies you.',catch:'Catches what flies.',fight:'A weapon.',guard:'Guards you.',float:'Keeps you afloat.',light:'Lights the dark.',sight:'Sees far.',fish:'For fishing.',breathe:'Breathe under water.',scan:'Scans what is near.',night:'See in the dark.',lift:'Lifts heavy things.',prospect:'Finds stones in rock.',extract:'Frees stones from rock.',horse:'Saddles your horse.',skate:'Ride it.',kart:'Drive it.',bmx:'Ride it.',carpet:'It flies you.',golf:'For the little greens.',luck:'Luck goes up.',keen:'Your eyes sharpen.',gills:'Breathe under water.',spring:'You jump higher.',swift:'You run faster.',adrenal:'A burst when you need it.',mend:'You heal faster.'};
  const BOOST={swift:'you run faster',str:'you hit harder',regen:'you heal',keen:'your eyes sharpen',invis:'nobody sees you',fly:'you fly',jump:'you jump high',luck:'luck goes up',fire:'you breathe fire',small:'you shrink',big:'you grow'};
  ITEMCARD.does=id=>{ const L=[], g=P(id,'grants'), sl=P(id,'slot'), b=P(id,'boost');
    if(g&&GRANT[g])L.push(GRANT[g]); if(b&&BOOST[b])L.push('Eaten, '+BOOST[b]+'.'); else if(P(id,'edible'))L.push(P(id,'heals')?'Eaten, it heals '+Math.round(P(id,'heals')*100)+'%.':'You can eat it.');
    if(sl&&sl!=='none'&&sl!=='hand')L.push('Worn on the '+({body:'body',legs:'legs',head:'head',eyes:'eyes',back:'back'}[sl]||sl)+'.');
    if(P(id,'container'))L.push('Holds '+(P(id,'holds')||12)+' things.'); if(ITEMS.group(id)==='music')L.push('Play it.'); if(P(id,'cures'))L.push('Cures poison.');
    return L.join(' '); };
  ITEMCARD.skill=id0=>{ const id=kindOf(id0), B=FORAGE.BUYK||{}; for(const g in WORTH.KNOW)if((B[g]||[]).some(p=>id.startsWith(p))){ const k=WORTH.KNOW[g]; return ((FORAGE.SK||[]).find(s=>s[0]===k)||[k,k.toUpperCase()])[1]; } return ''; };
  ITEMCARD.unknown=id=>String(id).startsWith('q_');
  ITEMCARD.finder=id=>(INV.found&&INV.found[kindOf(id)])||'';
  const css=document.createElement('style'); css.textContent=`#icard{position:fixed;z-index:90;width:330px;padding:12px;pointer-events:none;font:13px 'Share Tech Mono',ui-monospace,monospace;letter-spacing:.6px;line-height:1.5;color:#7dffa8;background:repeating-linear-gradient(0deg,rgba(125,255,168,.05) 0 1px,transparent 1px 3px),rgba(2,10,6,.95);zoom:var(--uiz,1)} #icard[hidden]{display:none}
    #icard .ct{display:flex;gap:12px} #icard canvas{width:${S}px;height:${S}px;flex:none;background:#06120b} #icard h4{margin:0 0 3px;font-weight:400;font-size:16px;letter-spacing:2px} #icard .cr{display:inline-block;padding:0 6px;color:#020a06;font-size:11px;margin-right:6px} #icard .ck{color:#3aa866;font-size:11px}
    #icard .cd{margin-top:5px;color:#c9d4cc} #icard .cx{margin-top:4px;color:#9aa} #icard .cg{display:grid;grid-template-columns:1fr 1fr;gap:2px 12px;margin-top:10px;font-size:12px} #icard .cg span{color:#3aa866} #icard .cf{margin-top:8px;padding-top:6px;border-top:2px solid #3aa866;color:#3aa866;font-size:11px}`; document.head.appendChild(css);
  const el=document.createElement('div'); el.id='icard'; el.hidden=true; document.body.appendChild(el);
  // the turning model: its own small studio, drawn only while the card shows
  let SC=null, CAM=null, RT=null, PX=null, CV=null, obj=null, cur=null, yaw=0, last=0;
  const studio=()=>{ '@later'; SC=new THREE.Scene(); const k=new THREE.DirectionalLight(0xfff4e2,2); k.position.set(-3,4,4); const f=new THREE.DirectionalLight(0xbcd0ff,.6); f.position.set(4,1,-3); SC.add(new THREE.AmbientLight(0xffffff,.9),k,f);
    CAM=new THREE.PerspectiveCamera(30,1,.01,100); RT=new THREE.WebGLRenderTarget(S,S); RT.texture.colorSpace=THREE.SRGBColorSpace; PX=new Uint8Array(S*S*4); };
  const drop=()=>{ if(!obj)return; SC.remove(obj); obj.traverse(c=>{ if(c.isInstancedMesh)c.dispose(); else if(c.geometry&&!c.userData.shared)c.geometry.dispose(); if(c.userData.ownMat&&c.material)c.material.dispose(); }); obj=null; };
  const model=id=>{ '@later'; if(!SC)studio(); drop(); let m=null; try{ m=INSPECT.model(kindOf(id)); }catch(e){} if(!m)return; const piv=new THREE.Group(); piv.add(m); m.updateMatrixWorld(true);
    const b=new THREE.Box3().setFromObject(m); if(b.isEmpty())return; const c=b.getCenter(new THREE.Vector3()); m.position.sub(c); const r=b.getSize(new THREE.Vector3()).length()/2||1; piv.userData.r=r; obj=piv; SC.add(piv); };
  const draw=t=>{ if(el.hidden||!obj||!CV)return; if(t-last<50)return; const dt=Math.min(.1,(t-(last||t))/1000); last=t; yaw+=dt*.9; obj.rotation.set(.35,yaw,0); const r=obj.userData.r, d=r/Math.sin(CAM.fov*Math.PI/360)*1.1;
    CAM.position.set(0,0,d); CAM.near=Math.max(.001,d-r*3); CAM.far=d+r*3; CAM.lookAt(0,0,0); CAM.updateProjectionMatrix();
    const pr=renderer.getRenderTarget(), cc=new THREE.Color(), ca=renderer.getClearAlpha(); renderer.getClearColor(cc); renderer.setRenderTarget(RT); renderer.setClearColor(0x06120b,1); renderer.clear(); renderer.render(SC,CAM); renderer.readRenderTargetPixels(RT,0,0,S,S,PX); renderer.setRenderTarget(pr); renderer.setClearColor(cc,ca);
    const g=CV.getContext('2d'), im=g.createImageData(S,S); for(let y=0;y<S;y++)im.data.set(PX.subarray((S-1-y)*S*4,(S-y)*S*4),y*S*4); g.putImageData(im,0,0); };
  SYS.add('win',draw,'162eb-card');
  ITEMCARD.html=id=>{ const k=kindOf(id), t=RARITY.of(k), col=RARITY.COL[t], v=+P(k,'value')||0, have=INV.items&&INV.items[id]||0, sk=ITEMCARD.skill(k), fd=ITEMCARD.finder(k), ex=ITEMCARD.examine(k), does=ITEMCARD.does(k), unk=ITEMCARD.unknown&&ITEMCARD.unknown(id);
    return `<div class="ct"><canvas width="${S}" height="${S}"></canvas><div><h4 style="color:${unk?'#9aa':col}">${esc(unk?'???':FORAGE.name(k))}</h4>${unk?'<span class="cr" style="background:#9aa">NOT APPRAISED</span>':`<span class="cr" style="background:${col}">${RARITY.NAMES[RARITY.ALL[t]]}</span>`}<span class="ck">${GR[ITEMS.group(k)]||'THING'}</span>`
      +`${does&&!unk?`<div class="cd">${esc(does)}</div>`:''}${ex&&!unk?`<div class="cx">"${esc(ex)}"</div>`:''}${unk?'<div class="cx">The Junk Dealer at Antiques &amp; Pawn can tell you what it is.</div>':''}</div></div>`
      +`<div class="cg">${unk?'':`<div><span>WORTH</span> $${v}</div>`}${have?`<div><span>YOU HAVE</span> ${have}</div>`:''}${sk&&!unk?`<div><span>SKILL</span> ${esc(sk)}</div>`:''}${fd?`<div><span>FOUND BY</span> ${esc(fd)}</div>`:''}</div>`
      +`<div class="cf">${ITEMCARD.keys||'2× CLICK USES · DRAG TO DROP OR TRADE'}</div>`; };
  ITEMCARD.show=(id,x,y)=>{ if(!id)return ITEMCARD.hide(); if(cur!==id){ cur=id; el.innerHTML=ITEMCARD.html(id); el.style.boxShadow='inset 0 0 0 2px '+RARITY.col(kindOf(id)); CV=el.querySelector('canvas'); yaw=-.6; last=0; try{ model(id); }catch(e){ obj=null; } }
    el.hidden=false; const z=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--uiz'))||1, w=el.offsetWidth*z, h=el.offsetHeight*z; let L=x+18, Tp=y+14; if(L+w>innerWidth-8)L=x-w-14; if(Tp+h>innerHeight-8)Tp=Math.max(8,innerHeight-h-8); el.style.left=L/z+'px'; el.style.top=Tp/z+'px'; };
  ITEMCARD.hide=()=>{ if(el.hidden)return; el.hidden=true; cur=null; if(SC)drop(); };
  // anything marked data-card shows it while pointed at; a long press on a phone
  let over=null;
  addEventListener('pointerover',e=>{ if(e.pointerType!=='mouse')return; const t=e.target&&e.target.closest&&e.target.closest('[data-card]'); over=t; if(t&&t.dataset.card)ITEMCARD.show(t.dataset.card,e.clientX,e.clientY); else ITEMCARD.hide(); },true);
  let mx=0, my=0; addEventListener('pointermove',e=>{ mx=e.clientX; my=e.clientY; if(over&&!el.hidden&&e.pointerType==='mouse')ITEMCARD.show(over.dataset.card,e.clientX,e.clientY); },true);
  let lp=0; addEventListener('pointerdown',e=>{ ITEMCARD.hide(); clearTimeout(lp); if(e.pointerType!=='mouse'){ const t=e.target&&e.target.closest&&e.target.closest('[data-card]'); if(t)lp=setTimeout(()=>{ over=t; ITEMCARD.show(t.dataset.card,e.clientX,e.clientY); },450); } },true);
  addEventListener('pointerup',e=>{ clearTimeout(lp); if(e.pointerType!=='mouse')setTimeout(()=>ITEMCARD.hide(),1500); },true); addEventListener('keydown',e=>{ if(e.key==='Escape')ITEMCARD.hide(); },true);
  SYS.every(()=>{ if(over&&!document.contains(over)){ const e=document.elementFromPoint(mx,my), t=e&&e.closest&&e.closest('[data-card]'); over=t||null; if(t)ITEMCARD.show(t.dataset.card,mx,my); else ITEMCARD.hide(); } },300,'162eb-card gone');
  window.ITEMCARD=ITEMCARD; }
export {ITEMCARD};
