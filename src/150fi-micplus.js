// THE MICROSCOPE'S EXTRAS: slides from what you carry (stones as thin sections in polarised light, wings, spores, scales, pollen, feathers), jars of pond culture that grow over real days, stains and immersion oil, the specimen book and its plates, and micrographs to sell.
import {FORAGE, INV, SFX} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {OWNED} from './005-save.js';
import {STOREK} from './023-west-kits.js';
import {PHOTOS} from './146m-prints.js';
import {FIRSTS} from './150fcz-firsts.js';
import {MIC} from './150ff-microscope.js';
const MICX={}; window.MICX=MICX;
{ const KEY='micx', DAY=864e5, cl=(v,a,b)=>v<a?a:v>b?b:v;
  const S={v:1,jars:[],seen:{},plates:{},day:'',n:{}}; try{ const D=JSON.parse(OWNED.get(KEY)||'null'); if(D&&D.v===1)Object.assign(S,D); }catch(e){} const save=()=>{ try{ OWNED.set(KEY,JSON.stringify(S)); }catch(e){} };
  MICX.S=S; MICX.save=save;
  const P={pol:true,ana:true,rot:0,stain:'none',oil:false,cap:null,acc:0,crys:0};   // the view's knobs (not kept)
  MICX.P=P;

  /* ---------- the plates: a finished page of the book, for the Professor ---------- */
  const PAGES=[['pond','POND LIFE',300],['box','THE SLIDE BOX',600],['stones','STONES',400],['wings','WINGS',500],['spores','SPORES',400],['scales','SCALES',400],['pollen','POLLEN',300],['feathers','FEATHERS',500]];
  FORAGE.add({names:Object.fromEntries(PAGES.map(p=>['plate_'+p[0],'SPECIMEN PLATE: '+p[1]])),prices:Object.fromEntries(PAGES.map(p=>['plate_'+p[0],p[2]])),sellable:true}); FORAGE.BUYK.plates=['plate_'];

  /* ---------- stones: real birefringence (Δn), and the faint body colour a 30 µm slice keeps ---------- */
  const MIN={quartz:['QUARTZ',.009,[1,1,1]],amethyst:['AMETHYST (QUARTZ)',.009,[.96,.9,1]],geode:['GEODE (CHALCEDONY AND QUARTZ)',.009,[.98,.97,.95]],amber:['AMBER',0,[1,.86,.58]],moonstone:['MOONSTONE (FELDSPAR)',.007,[.98,.98,1]],
    opal:['OPAL',0,[.97,.97,.95]],emerald:['EMERALD (BERYL)',.006,[.86,1,.9]],sapphire:['SAPPHIRE (CORUNDUM)',.008,[.86,.9,1]],ruby:['RUBY (CORUNDUM)',.008,[1,.84,.88]],meteor:['METEORITE (OLIVINE)',.035,[.92,1,.86]]};
  const minOf=id=>{ const b=String(id).replace(/^(cut_|raw_)/,''); return MIN[b]?b:null; };
  MICX.MIN=MIN;
  const TH=30000, NL=[400,425,450,475,500,525,550,575,600,625,650,675,700];   // the slice is 30 µm (in nm); white light sampled every 25 nm
  const gw=(l,m,s)=>Math.exp(-.5*((l-m)/s)**2), CMF=NL.map(l=>[gw(l,600,42)+.25*gw(l,445,20),gw(l,545,40),gw(l,450,28)]), CN=[0,1,2].map(c=>CMF.reduce((a,w)=>a+w[c],0));
  // one grain's light: between crossed polars I = sin²(2α)·sin²(πΓ/λ), Γ = Δn·t·sin²φ; parallel, its complement; without the polariser, the plain body colour
  const light=(dn,sin2,az,body)=>{ const a=(az-P.rot)*Math.PI/180, s2a=Math.sin(2*a)**2, G=dn*TH*sin2, out=[0,0,0];
    for(let i=0;i<NL.length;i++){ const I0=s2a*Math.sin(Math.PI*G/NL[i])**2, I=!P.pol?1:P.ana?I0:1-I0; for(let c=0;c<3;c++)out[c]+=CMF[i][c]*I; }
    return out.map((v,c)=>Math.pow(cl(v/CN[c]*body[c],0,1),1/2.2)); };
  MICX.grain=(min,i)=>{ const G=grains(min).g[i]; return light(MIN[min][1],G.s2,G.az,MIN[min][2]); };
  const rnd=s=>()=>{ s=(s*16807)%2147483647; return (s-1)/2147483646; };
  const GR={}, N=512, NG=14;
  const grains=min=>{ '@later'; if(GR[min])return GR[min]; const r=rnd(1+[...min].reduce((a,c)=>a*31+c.charCodeAt(0),7)%99991), g=[];
    for(let j=0;j<NG;j++)for(let i=0;i<NG;i++){ const z=r()*2-1; g.push({x:(i+.15+r()*.7)/NG*N,y:(j+.15+r()*.7)/NG*N,s2:1-z*z,az:r()*180}); }   // a random optic axis: its tilt from the light (sin²φ) and its azimuth
    const idx=new Uint16Array(N*N), edge=new Uint8Array(N*N);
    for(let y=0;y<N;y++)for(let x=0;x<N;x++){ const gi=Math.min(NG-1,x/N*NG|0), gj=Math.min(NG-1,y/N*NG|0); let b=1e9, bk=0;
      for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){ const ii=gi+di, jj=gj+dj; if(ii<0||jj<0||ii>=NG||jj>=NG)continue; const q=g[jj*NG+ii], d=(q.x-x)**2+(q.y-y)**2; if(d<b){ b=d; bk=jj*NG+ii; } } idx[y*N+x]=bk; }
    for(let y=1;y<N-1;y++)for(let x=1;x<N-1;x++){ const i=y*N+x, k=idx[i]; edge[i]=idx[i+1]!==k||idx[i+N]!==k?1:0; }
    return GR[min]={g,idx,edge,cv:null,key:''}; };
  const thin=min=>{ '@later'; const R=grains(min), key=[P.pol,P.ana,Math.round(P.rot)].join(); if(R.cv&&R.key===key)return R.cv; R.key=key;
    if(!R.cv){ R.cv=document.createElement('canvas'); R.cv.width=R.cv.height=N; } const g=R.cv.getContext('2d'), im=g.createImageData(N,N), M=MIN[min], col=R.g.map(G=>light(M[1],G.s2,G.az,M[2]));
    for(let i=0;i<N*N;i++){ const c=col[R.idx[i]], e=R.edge[i]?.55:1, o=i*4; im.data[o]=c[0]*255*e; im.data[o+1]=c[1]*255*e; im.data[o+2]=c[2]*255*e; im.data[o+3]=255; }
    g.putImageData(im,0,0); return R.cv; };
  MICX.thin=thin; MICX.gr=min=>grains(min).g;
  const thinDraw=min=>(g,{k,sx,sy,S:Sz})=>{ if(P.pol&&P.ana){ g.fillStyle='#000'; g.fillRect(-Sz,-Sz,2*Sz,2*Sz); } const w=6000*k; g.imageSmoothingEnabled=true; g.drawImage(thin(min),-sx*k-w/2,-sy*k-w/2,w,w); };

  /* ---------- a feather: the shaft, its barbs, their barbules and the hooklets that zip them, drawn as far as the magnification shows ---------- */
  const feather=(g,{k,sx,sy,S})=>{ '@later'; const X=u=>(u-sx)*k, Y=v=>(v-sy)*k, H=S/2+20, on=(x,y)=>Math.abs(x)<H&&Math.abs(y)<H;
    g.lineCap='round'; g.strokeStyle='rgba(110,86,60,.9)'; g.lineWidth=Math.max(1,90*k); g.beginPath(); g.moveTo(X(-60),Y(-3000)); g.lineTo(X(60),Y(3000)); g.stroke();
    for(let v=-2950;v<2950;v+=110)for(const s of [-1,1]){ const x0=s*45, y0=v, x1=x0+s*1500, y1=v-900, ax=X(x0), ay=Y(y0), bx=X(x1), by=Y(y1);
      if(!on(ax,ay)&&!on(bx,by)&&!on((ax+bx)/2,(ay+by)/2))continue; g.strokeStyle='rgba(120,96,70,.75)'; g.lineWidth=Math.max(.6,14*k); g.beginPath(); g.moveTo(ax,ay); g.lineTo(bx,by); g.stroke();
      if(k*14<3)continue; g.strokeStyle='rgba(130,104,78,.55)'; g.lineWidth=Math.max(.4,3*k);
      for(let t=.04;t<1;t+=14/1750){ const px=x0+(x1-x0)*t, py=y0+(y1-y0)*t, qx=X(px), qy=Y(py); if(!on(qx,qy))continue; for(const d of [-1,1]){ g.beginPath(); g.moveTo(qx,qy); g.lineTo(X(px+s*60),Y(py+d*70)); g.stroke(); if(k*3>2.5){ g.beginPath(); g.arc(X(px+s*60),Y(py+d*70),1.2*k,0,7); g.stroke(); } } } } };

  /* ---------- the families in your bag: what each is under the microscope ---------- */
  const NOSCALE=new Set(['x_boot','x_crab']), BFK=()=>(STOREK.bf&&STOREK.bf.BF_KINDS)||[], nm=id=>String(FORAGE.name(id)||id).replace(/\s*\(RARE\)/,'');
  const FAM=[
    {pg:'stones',is:id=>!!minOf(id),key:minOf,make:key=>({name:MIN[key][0]+', A THIN SECTION',draw:thinDraw(key),um:6000,thin:key,about:'A slice ground to 30 µm, thin enough to see through. Between crossed polarisers each crystal glows in colours set by how strongly it splits light and how it lies; turn the stage and each goes dark every quarter turn.'+(MIN[key][1]?'':' '+MIN[key][0].split(' ')[0]+' has no such crystal grain: it stays dark between crossed polarisers.')})},
    {pg:'wings',is:id=>/^bu?_\d+$/.test(id),key:id=>'b_'+id.split('_')[1],make:key=>{ const K=BFK()[+key.slice(2)]; let tint=null; try{ tint=K[6](.55,.3,true,.5); }catch(e){} return {name:(K?K[0].toUpperCase():nm(key))+' WING SCALES',src:'butterfly',tint,about:'A wing is tiled with tiny scales like roof shingles; the colour is pigment and the light caught in their ridges.'+(K?' '+K[1]+'.':'')}; }},
    {pg:'spores',is:id=>/^[mu]_/.test(id)&&!!(FORAGE.MU||{})[id.slice(2)],key:id=>'m_'+id.slice(2),make:key=>({name:nm(key).replace(/ \(MUSHROOM\)/,'')+' SPORES',src:'spores',about:'Spores dropped from under the cap: one mushroom sheds billions, and their shape and colour tell the species apart.'})},
    {pg:'scales',is:id=>/^x_/.test(id)&&!NOSCALE.has(id),key:id=>id,make:key=>({name:nm(key)+' SCALE',src:'fishscale',about:'A fish scale lays down a ring each season, like a tree: count them for its age.'})},
    {pg:'pollen',is:id=>/^honey_/.test(id),key:id=>id,make:key=>({name:'POLLEN IN '+nm(key),src:'pollen',about:'Honey carries the pollen of the flowers its bees visited; reading it tells where the honey came from.'})},
    {pg:'feathers',is:id=>id==='bird_feather'||/^bd_/.test(id),key:id=>id,make:key=>({name:(key==='bird_feather'?'A':'A '+nm(key))+' FEATHER',draw:feather,um:6000,about:'Each barb carries barbules that hook to their neighbours with tiny hooklets, zipping the vane together; a bird preening is zipping them back.'})}];
  const bagSlides=()=>{ const out=[], had=new Set(); for(const id in INV.items){ if(!(INV.items[id]>0))continue; for(const F of FAM){ if(!F.is(id))continue; const key=F.key(id), sid='bag:'+F.pg+':'+key; if(!had.has(sid)){ had.add(sid); out.push({id:sid,mag:'YOUR BAG',credit:'',pg:F.pg,key,...F.make(key)}); } break; } }
    return out.sort((a,b)=>a.pg.localeCompare(b.pg)||a.name.localeCompare(b.name)); };

  /* ---------- the jars: a hay infusion's succession over real days (bacteria, then flagellates, a boom of paramecia, then their grazers) ---------- */
  const gs=(x,m,s)=>Math.exp(-.5*((x-m)/s)**2), sg=(x,m,w)=>1/(1+Math.exp(-(x-m)/w));
  MICX.counts=(a,f,seed=.5)=>{ const st=f>3?Math.exp(-(f-3)/2):1, R=Math.round;   // a: days since it was started, f: days since it was fed
    return {silt:R(1200+3600*gs(a,1.2,.8)+600*st),euglena:R(8*sg(a,1.5,.4)*(1-.5*sg(a,10,2))*(.5+.5*st)),paramecium:R(16*sg(a,2.5,.5)*(a<7?1:Math.exp(-(a-7)/5))*st+(a>7?2*st:0)),
      amoeba:R(3*sg(a,5,1)*st),rotifer:R(5*sg(a,6,1)*(.4+.6*st)),volvox:R(3*sg(a,7,1)*st),diatom:R(2+4*sg(a,3,1)),daphnia:a>=14&&f<3?1:0,tardigrade:a>=10&&seed<.35?1:0}; };
  const age=j=>(Date.now()-j.t0)/DAY, fed=j=>(Date.now()-j.fed)/DAY;
  const jarSlides=()=>S.jars.map((j,i)=>({id:'jar:'+i,name:'JAR '+(i+1)+' · DAY '+Math.floor(age(j)),mag:'',credit:'',jar:i,live:MICX.counts(age(j),fed(j),j.seed),about:'A hay infusion: pond water and a little dry grass, left to grow in the light. Feed it a grain now and then.'}));
  const jarState=j=>{ const a=age(j), f=fed(j), c=MICX.counts(a,f,j.seed); return f>3?'HUNGRY: FEED IT':c.daphnia?'A WATER FLEA HAS HATCHED':a<1?'CLOUDY: BACTERIA ONLY SO FAR':c.paramecium>=10?'PARAMECIA BLOOMING':c.rotifer>=3?'ROTIFERS GRAZING':'SETTLING'; };
  const startJar=()=>{ if(S.jars.length>=3)return SAY('YOU HAVE THREE JARS GOING.','#c8a090'); if(!FORAGE.has('jar_s'))return SAY('YOU NEED A SMALL JAR IN YOUR BAG.','#c8a090');
    FORAGE.take('jar_s',1); if(INV.save)INV.save(); S.jars.push({t0:Date.now(),fed:Date.now(),seed:Math.random()}); save(); SAY('A JAR OF POND WATER AND DRY GRASS, SET IN THE LIGHT. GIVE IT A FEW DAYS.','#bfe3b0'); };

  /* ---------- the specimen book ---------- */
  const members=pg=>{ const NM=FORAGE.NM||{};
    if(pg==='pond')return Object.keys(MIC.K.KINDS); if(pg==='box')return ((MIC.data&&MIC.data.slides)||[]).filter(s=>MIC.files[s.id]).map(s=>s.id); if(pg==='stones')return Object.keys(MIN);
    if(pg==='wings')return BFK().map((_,k)=>'b_'+k); if(pg==='spores')return Object.keys(FORAGE.MU||{}).map(k=>'m_'+k);
    if(pg==='scales')return Object.keys(NM).filter(k=>/^x_/.test(k)&&!NOSCALE.has(k)); if(pg==='pollen')return Object.keys(NM).filter(k=>/^honey_/.test(k));
    return ['bird_feather',...Object.keys(NM).filter(k=>/^bd_/.test(k))]; };
  MICX.members=members;
  const see=key=>{ if(S.seen[key])return false; S.seen[key]=Date.now(); const pg=key.split(':')[0], L=members(pg), have=L.filter(m=>S.seen[pg+':'+m]).length, Pg=PAGES.find(p=>p[0]===pg);
    SAY('A NEW SPECIMEN IN YOUR BOOK ('+Pg[1]+' '+have+' OF '+L.length+').','#bfe3b0');
    if(L.length&&have>=L.length&&!S.plates[pg]){ S.plates[pg]=1; FORAGE.give('plate_'+pg,1); SAY('PAGE "'+Pg[1]+'" IS FULL: A SPECIMEN PLATE FOR YOUR BAG. THE PROFESSOR BUYS THEM.','#ffe08a'); }
    save(); return true; };
  MICX.see=see;
  const keyOf=s=>!s?null:s.pg?s.pg+':'+s.key:s.live||s.id==='pond'?null:'box:'+s.id;
  const RARE={tardigrade:'s',daphnia:'s',rotifer:'r',volvox:'r'};
  MICX.ident=k=>{ const L=(MIC.data&&MIC.data.life||{})[k]||{}; P.cap={k,name:(L.common||k.toUpperCase()),sci:L.sci||'',about:L.about||'',credit:L.credit||''}; see('pond:'+k); if(RARE[k])FIRSTS.mark(k); MIC.redraw(); };

  /* ---------- micrographs: the eyepiece's picture as a print, priced like the camera's ---------- */
  const TK={c:1,r:2.5,s:6}, TN={c:'COMMON',r:'RARE',s:'SUPER RARE'};
  const subject=()=>{ const V=MIC.K.V, s=V.slide; if(!s)return null; const k=V.cv.width/MIC.K.fov();
    if((s.live||s.id==='pond')&&V.org){ let best=null; for(const o of V.org){ const px=(o.x-V.sx)*k, py=(o.y-V.sy)*k, L=o.len*k; if(Math.hypot(px,py)>V.cv.width*.4||L<20)continue; const t=RARE[o.k]||'c', b=MIC.K.blurOf(o.z-50-V.zf); if(b>4)continue;
        if(!best||TK[t]>TK[best.t])best={kind:'mic_'+o.k,name:((MIC.data&&MIC.data.life&&MIC.data.life[o.k]&&MIC.data.life[o.k].common)||o.k.toUpperCase()),t,base:4,blur:b}; } return best||{kind:'mic_water',name:'POND WATER',t:'c',base:1,blur:0}; }
    const blur=MIC.K.blurOf(-V.zf); if(s.thin)return {kind:'mic_'+s.thin,name:MIN[s.thin][0].split(' ')[0]+' IN POLARISED LIGHT',t:s.thin==='meteor'?'s':'r',base:P.pol&&P.ana&&MIN[s.thin][1]?7:3,blur};
    if(s.pg)return {kind:'mic_'+s.key,name:s.name,t:'c',base:3,blur}; return {kind:'mic_'+s.id,name:s.name,t:'c',base:1,blur}; };
  MICX.shoot=()=>{ '@later'; const V=MIC.K.V, q=subject(); if(!q)return null; let src='';
    try{ const c=document.createElement('canvas'); c.width=192; c.height=144; const x=c.getContext('2d'), Sz=V.cv.width; x.fillStyle='#000'; x.fillRect(0,0,192,144); x.drawImage(V.cv,0,Sz*.125,Sz,Sz*.75,0,0,192,144); src=c.toDataURL('image/jpeg',.82); }catch(e){ SAY('THE CAMERA COULD NOT TAKE THAT ONE.','#c8a090'); return null; }
    const day=new Date().toDateString(); if(S.day!==day){ S.day=day; S.n={}; } const rep=Math.max(.25,Math.pow(.8,S.n[q.kind]||0)), qual=q.blur<1?1:Math.max(.2,1-(q.blur-1)/5), skill=.5+FORAGE.sk('photo')/100;
    const p={id:'photo_'+Date.now().toString(36)+Math.floor(Math.random()*1e3),cap:('MICROGRAPH: '+q.name).slice(0,30),src,v:Math.max(1,Math.round(q.base*TK[q.t]*qual*skill*rep)),sub:q.kind,tier:q.t};
    S.n[q.kind]=(S.n[q.kind]||0)+1; save(); const diff={c:10,r:35,s:60}[q.t]; FORAGE.use('photo',diff-30,diff+30,qual>.8?5:0);
    PHOTOS.own(p); if(SFX)SFX.play('click',{vol:.6,vary:.1}); SAY('A MICROGRAPH: '+q.name+' ('+TN[q.t]+'), WORTH ABOUT $'+p.v+'.','#c8b0ff'); return p; };

  /* ---------- the book on screen ---------- */
  const thumbs={}; const thumb=(pg,m)=>{ '@later'; const k=pg+':'+m; if(thumbs[k])return thumbs[k]; const F=MIC.files||{};
    if(pg==='box')return thumbs[k]=F[m]||''; if(pg==='wings')return F.butterfly||''; if(pg==='spores')return F.spores||''; if(pg==='scales')return F.fishscale||''; if(pg==='pollen')return F.pollen||'';
    const c=document.createElement('canvas'); c.width=c.height=96; const g=c.getContext('2d'); g.fillStyle='#f0ede2'; g.fillRect(0,0,96,96);
    try{ if(pg==='pond'){ g.translate(48,48); MIC.K.DRAW[m](g,{ph:0,seed:.3,rot:0,hop:0,t:0},70,1); }
      else if(pg==='stones'){ const sv={...P}; P.pol=true; P.ana=true; P.rot=0; g.drawImage(thin(m),0,0,96,96); Object.assign(P,sv); thins(); }
      else { g.translate(48,48); feather(g,{k:.045,sx:-600,sy:0,S:96}); } }catch(e){}
    return thumbs[k]=c.toDataURL(); };
  const thins=()=>{ for(const m in GR)GR[m].key=''; };
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  MICX.book=(pg=MICX.pg||'pond')=>{ '@later'; MICX.pg=pg; let el=document.getElementById('micbook');
    if(!el){ el=document.createElement('div'); el.id='micbook'; el.style.cssText='position:fixed;inset:0;z-index:44;background:rgba(10,8,6,.78);display:none;align-items:center;justify-content:center;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#3b2a1e';
      el.addEventListener('click',e=>{ const b=e.target.closest('[data-bk]'); if(e.target===el||b&&b.dataset.bk==='x'){ el.style.display='none'; return; } if(b)MICX.book(b.dataset.bk); }); document.body.appendChild(el); }
    const L=members(pg), tot=PAGES.reduce((a,p)=>a+members(p[0]).filter(m=>S.seen[p[0]+':'+m]).length,0), all=PAGES.reduce((a,p)=>a+members(p[0]).length,0), Pg=PAGES.find(p=>p[0]===pg), life=(MIC.data&&MIC.data.life)||{};
    const B='font:inherit;padding:3px 6px;margin:0 3px 3px 0;border:2px solid #3b2a1e;cursor:pointer;';
    el.innerHTML=`<div style="width:min(900px,94vw);max-height:92vh;overflow:auto;background:#ece5d3;border:3px solid #3b2a1e;padding:14px 16px;box-sizing:border-box">
      <div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:13px">MY SPECIMENS · ${tot} OF ${all}</b><button data-bk="x" style="${B}background:#ece5d3;color:#3b2a1e">CLOSE</button></div>
      <div style="color:#6a4a32;margin:4px 0 8px">TAP A LIVING THING TO NAME IT · A SLIDE COUNTS ONCE YOU HAVE IT IN FOCUS · A FULL PAGE IS A PLATE THE PROFESSOR BUYS</div>
      <div>${PAGES.map(p=>{ const n=members(p[0]), h=n.filter(m=>S.seen[p[0]+':'+m]).length; return `<button data-bk="${p[0]}" style="${B}${p[0]===pg?'background:#3b2a1e;color:#ece5d3':'background:#ece5d3;color:#3b2a1e'}">${p[1]} ${h}/${n.length}${S.plates[p[0]]?' ★':''}</button>`; }).join('')}</div>
      <div style="margin:6px 0;color:#6a4a32">PAGE "${Pg[1]}": ${S.plates[pg]?'DONE, ITS PLATE IS YOURS':'FINISH IT FOR A PLATE WORTH $'+Pg[2]}</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(118px,1fr));gap:8px">${L.map(m=>{ const ok=S.seen[pg+':'+m], t=ok?thumb(pg,m):'', nmx=pg==='pond'?((life[m]&&life[m].common)||m.toUpperCase()):pg==='box'?((((MIC.data&&MIC.data.slides)||[]).find(s=>s.id===m)||{}).name||m):pg==='stones'?MIN[m][0]:pg==='wings'?((BFK()[+m.slice(2)]||[m])[0]).toUpperCase():nm(m);
        return `<div style="border:2px solid #3b2a1e;background:#f6f1e4;text-align:center;padding:4px">${ok?`<img src="${t}" style="width:100%;height:84px;object-fit:cover;border-radius:50%;display:block;background:#2a221b">`:`<div style="height:84px;border-radius:50%;background:#2a221b;color:#8a7a62;display:grid;place-items:center;font-size:24px">?</div>`}
          <div style="margin-top:4px;font-size:9px;line-height:1.3">${ok?esc(nmx):'NOT YET SEEN'}${ok&&pg==='pond'&&life[m]?'<br><i style="color:#8a7a62">'+esc(life[m].sci)+'</i>':''}</div></div>`; }).join('')}</div>
      ${pg==='pond'?`<div style="margin-top:8px;color:#8a7a62">NAMES AND FACTS: ${esc((life.paramecium||{}).credit||'iNaturalist · GBIF')}</div>`:''}</div>`;
    el.style.display='flex'; };

  /* ---------- the knobs beside the eyepiece ---------- */
  const STAINS=[['none','NONE'],['blue','METHYLENE BLUE'],['iodine','IODINE'],['violet','CRYSTAL VIOLET']], SC={blue:[60,100,200],iodine:[170,118,40],violet:[120,50,160]};
  const btn=(x,t,on)=>`<button class="btn ${on?'on':''}" data-x="${x}">${t}</button>`;
  const live=()=>{ const s=MIC.K.V.slide; return !!(s&&(s.live||s.id==='pond')); };
  MIC.ext.push({
    slides:()=>[...bagSlides(),...jarSlides()],
    panel:()=>{ const V=MIC.K.V, s=V.slide, c=P.cap, O=MIC.K.OBJ[V.obj];
      return (s&&s.thin?`<div class="row"><span>POLARISER</span>${btn('pol',P.pol?'IN':'OUT',P.pol)}${P.pol?btn('ana',P.ana?'CROSSED':'PARALLEL',P.ana):''}</div><div class="row"><span>ROTATE</span><input type="range" min="0" max="180" value="${Math.round(P.rot)}" data-x="rot"></div>`:'')
        +`<div class="row"><span>STAIN</span>${STAINS.map(([k,t])=>btn('stain:'+k,t,P.stain===k)).join('')}</div>`
        +`<div class="row"><span>OIL</span>${btn('oil',P.oil?'IMMERSION OIL ON':'NO OIL',P.oil)}${O.m===100&&!P.oil?'<span style="width:auto;color:#8a4a32">HAZY: 100X NEEDS OIL</span>':''}</div>`
        +`<div class="ab"><b>YOUR CULTURES</b>${S.jars.map((j,i)=>{ const a=age(j); return `<div style="margin-top:4px">JAR ${i+1} · DAY ${Math.floor(a)} · ${jarState(j)}<div style="height:6px;background:#cdbf9f;margin:2px 0"><i style="display:block;height:100%;width:${Math.round(cl(a/14,0,1)*100)}%;background:#3b2a1e"></i></div>${btn('feed:'+i,'FEED')}${btn('drop:'+i,'TAKE A DROP')}${btn('tip:'+i,'TIP OUT')}</div>`; }).join('')||'<div>NONE YET</div>'}${S.jars.length<3?btn('jar','START A JAR'):''}</div>`
        +`<div class="row">${btn('book','MY SPECIMENS')}${btn('shoot','TAKE MICROGRAPH')}${btn('firsts',"TONIGHT'S FIRSTS")}</div>`
        +(c&&live()?`<div class="ab"><b>${esc(c.name)}</b>${c.sci?' · <i>'+esc(c.sci)+'</i>':''}<br>${esc(c.about)}${c.credit?'<br><span style="color:#8a7a62">'+esc(c.credit)+'</span>':''}</div>`:''); },
    click:el=>{ const x=el.dataset.x, [a,b]=String(x).split(':'), V=MIC.K.V;
      if(a==='pol'){ P.pol=!P.pol; P.acc=0; } else if(a==='ana'){ P.ana=!P.ana; P.acc=0; } else if(a==='oil'){ P.oil=!P.oil; if(SFX)SFX.play('click',{vol:.3}); }
      else if(a==='stain'){ if(P.stain!==b&&b!=='none'&&P.stain!=='none'&&live())return SAY('THIS DROP IS ALREADY STAINED. TAKE A FRESH ONE.','#c8a090'); P.stain=b; V.still=b!=='none'&&live(); if(V.still)SAY('THE STAIN KILLS THEM: ONLY THE WATER MOVES THEM NOW.','#c8a090'); }
      else if(a==='jar')startJar(); else if(a==='feed'&&S.jars[+b]){ S.jars[+b].fed=Date.now(); save(); SAY('A GRAIN OF WHEAT FOR JAR '+(+b+1)+'.','#bfe3b0'); }
      else if(a==='tip'&&S.jars[+b]){ S.jars.splice(+b,1); save(); } else if(a==='drop'&&S.jars[+b]){ const j=S.jars[+b]; MIC.place('jar:'+b); if(age(j)>=7)FIRSTS.mark('jar'); }
      else if(a==='book')MICX.book(); else if(a==='shoot')MICX.shoot(); else if(a==='firsts')FIRSTS.show(); else return false; return true; },
    input:el=>{ if(el.dataset.x==='rot'){ P.rot=+el.value; P.acc=0; } },
    tap:(ux,uy)=>{ const V=MIC.K.V; if(!live()||!V.org)return; const k=V.cv.width/MIC.K.fov(); let best=null, bd=1e9;
      for(const o of V.org){ const dx=ux-o.x, dy=uy-o.y, c=Math.cos(-o.a), s=Math.sin(-o.a), lx=dx*c-dy*s, ly=dx*s+dy*c, K=MIC.K.KINDS[o.k], w=o.len*(K.wid/K.len)/2+6/k, d=(lx/(o.len/2+6/k))**2+(ly/w)**2; if(d<1&&d<bd){ bd=d; best=o; } }
      if(!best)return; if(best.len*k<18)return SAY('TOO SMALL TO MAKE OUT AT THIS POWER: TURN TO A STRONGER OBJECTIVE.','#c8a090'); if(MIC.K.blurOf(best.z-50-V.zf)>3)return SAY('IT IS OUT OF FOCUS.','#c8a090'); MICX.ident(best.k); },
    over:(g,{S:Sz})=>{ const V=MIC.K.V, s=V.slide, now=performance.now();
      if(s&&s.tint&&V.img){ g.globalCompositeOperation='color'; g.globalAlpha=.5; g.fillStyle=`rgb(${s.tint.join(',')})`; g.fillRect(-Sz/2,-Sz/2,Sz,Sz); }
      if(P.stain!=='none'){ const c=SC[P.stain]; g.globalCompositeOperation='color'; g.globalAlpha=.6; g.fillStyle=`rgb(${c})`; g.fillRect(-Sz/2,-Sz/2,Sz,Sz); g.globalCompositeOperation='multiply'; g.globalAlpha=P.stain==='iodine'&&s&&s.id==='onion'?.45:.25; g.fillRect(-Sz/2,-Sz/2,Sz,Sz); }
      g.globalCompositeOperation='source-over'; g.globalAlpha=1;
      if(MIC.K.OBJ[V.obj].m===100&&!P.oil){ g.fillStyle='rgba(255,252,240,.28)'; g.fillRect(-Sz/2,-Sz/2,Sz,Sz); }
      const key=keyOf(s), sharp=MIC.K.blurOf(-V.zf)<1.2;   // in focus a second and a half (by the clock)
      if(key&&!S.seen[key]&&(V.img||s.draw)&&sharp){ if(!P.acc)P.acc=now; else if(now-P.acc>=1500)see(key); } else P.acc=0;
      if(s&&s.thin&&P.pol&&P.ana&&MIN[s.thin][1]&&sharp){ if(!P.crys)P.crys=now; else if(now-P.crys>=1500)FIRSTS.mark('crystal'); } else P.crys=0; },
    close:()=>{ P.cap=null; } });
  // 100x without oil: the light bends away at the glass, the cone it can use shrinks (NA 0.95 at most) and the picture goes soft; the Abbe limit 0.61·λ/NA always sets the finest blur
  MIC.haze=(O,V)=>{ const na=O.m===100&&!P.oil?.95:O.na, d=.61*.55/na, k=V.cv?V.cv.width/(18000/O.m):1; return Math.max(0,d*k/2-.75)+(O.m===100&&!P.oil?4:0); };
  // a fresh slide on the stage: no stain on it yet, and whatever lives in it alive
  const place0=MIC.place; MIC.place=id=>{ P.stain='none'; P.cap=null; P.acc=0; if(MIC.K)MIC.K.V.still=false; place0(id); };
}
