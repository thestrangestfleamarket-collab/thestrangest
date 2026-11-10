// SIGN LANGUAGE (owner, 9 Nov 2026: "sign language", his pick "Both"; 10 Nov 2026: "do 1-8"): ASL, the SIGN LANGUAGE skill: ASL's 26 fingerspelled letters and some 230 word signs (data/signs.json) learnt by SONGBK's rule; chat signed by your hands (the chat's SIGN toggle) and read by others only as far as their own skill reaches; townsfolk marked `signs: true` sign their lines and trade or give quests only to those who follow them.
import {SHARED, THREE} from './003-shx.js';
import {CHARS, FORAGE, LINES, MOTION, ONLINE, RAG, st, VIT, W3} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {SYS} from './006-map-pre.js';
import {BODIES} from './111a-bodies.js';
import {HANDS} from './111b-hands.js';
import {SONGBK} from './146znz-songbook.js';
import {GHOLD} from './146zoa-guitar-hold.js';
const ASL={}; window.ASL=ASL;
{ const D=__DATA__("data/signs.json"), V3=THREE.Vector3, M4=THREE.Matrix4, now=()=>performance.now()/1000, GATE=.6, CLEAN_SECS=3;
  SONGBK.words.sign={done:'SIGNED',piece:'SIGN',stumble:n=>`YOUR HANDS TRIP OVER ${n}. TRY IT AGAIN.`,crowd:'WATCHED'};
  /* ---------- the handshapes: each digit [knuckle, middle, last joint, spread] (111b's pose), from the data's letters ---------- */
  const TH={a:[.15,.1,.05],x:[1.1,.5,.4],o:[-.25,0,0],c:[.35,.35,.25],p:[.75,.55,.45],s:[.95,.65,.35],m:[1.15,.35,.2],n:[1.05,.4,.25],t:[.85,.5,.3]};
  const FI={'0':[0,.05,.05],'1':[1.5,1.75,1.05],b:[1.45,.1,.05],c:[.5,.7,.4],o:[.85,.95,.55],h:[.25,1.45,1],e:[.75,1.6,1.1]};
  const SPR=[0,-.08,-.03,.03,.08], SPS=[0,-.4,-.1,.2,.45], SC=new Map();
  const shape=s=>{ if(SC.has(s))return SC.get(s); const sp=/s/.test(s.slice(5))?SPS:SPR, f=[[...(TH[s[0]]||TH.x),0]]; for(let i=1;i<5;i++)f.push([...(FI[s[i]]||FI['1']),sp[i]]);
    if(/r/.test(s.slice(5))){ f[1][3]=.1; f[2][3]=-.2; } SC.set(s,f); return f; };
  // a sign from its words: shape (or shape>shape), place, palm, motion, hands (1, 2 both, b on the other palm)
  const parse=(str,letter)=>{ const p=str.split(' '); if(letter)return {sh:p[0],ori:p[1],mv:p[2]||'none',loc:'fs',h:'1'}; const [a,b]=p[0].split('>'); return {sh:a,sh2:b||null,loc:p[1],ori:p[2],mv:p[3]||'none',h:p[4]||'1'}; };
  const LET={}, DIG={}; for(const c in D.letters)LET[c]=parse(D.letters[c],1); for(const c in D.digits)DIG[c]=parse(D.digits[c],1);
  const WORD=new Map(D.words.map(([w,s])=>[w,parse(s)])), ALIAS=D.alias||{};
  /* ---------- the book: the alphabet in the first two bands, then the words, by how common, each band's five open at a time ---------- */
  const BOOK=[]; { const L=Object.keys(LET); L.forEach((c,i)=>BOOK.push({name:c.toUpperCase(),kind:'l',c,lvl:Math.floor(i/13)*10+1+Math.floor((i%13)*9/13),secs:CLEAN_SECS}));
    const W=[...WORD.keys()], per=Math.ceil(W.length/8); W.forEach((w,i)=>{ const b=2+Math.floor(i/per); BOOK.push({name:w,kind:'w',w,lvl:b*10+1+Math.floor((i%per)*9/per),secs:CLEAN_SECS}); }); }
  const BYL={}, BYW=new Map(); for(const T of BOOK)if(T.kind==='l')BYL[T.c]=T; else BYW.set(T.w,T);
  const sk=()=>FORAGE.sk?FORAGE.sk('sign')||0:0;
  // a sign is yours once learnt (three clean), or when your skill is well past its level, or with the owner's ALL SKILLS 100
  const knows=T=>!!T&&(SONGBK.learnt('sign',T)||(FORAGE.maxed&&FORAGE.maxed())||sk()>=Math.min(100,T.lvl+10));
  const knowsC=c=>/[0-9]/.test(c)||knows(BYL[c]);
  /* ---------- words to signs: a word's own sign (two-word ones first), else spelled; the kinds go with the text (w one word, W two, s spelled) ---------- */
  const words=t=>String(t||'').toLowerCase().replace(/['’]/g,'').replace(/[^a-z0-9 ]+/g,' ').split(/\s+/).filter(Boolean);
  const entry=w=>WORD.has(w)?w:ALIAS[w]&&WORD.has(ALIAS[w])?ALIAS[w]:null;
  const tokens=t=>{ const ws=words(t), out=[]; for(let i=0;i<ws.length;i++){ const two=ws[i+1]&&WORD.has(ws[i]+' '+ws[i+1])?ws[i]+' '+ws[i+1]:null;
      if(two){ out.push({k:'W',t:two,e:two}); i++; continue; } const e=entry(ws[i]); out.push(e?{k:'w',t:ws[i],e}:{k:'s',t:ws[i]}); } return out; };
  const ABC='abcdefghijklmnopqrstuvwxyz', wrongC=c=>{ let r; do r=ABC[Math.floor(Math.random()*26)]; while(r===c); return r; };
  // what your hands sign of what you typed: a word sign you know as itself, else spelled, a letter you do not know coming out as another
  ASL.mineOf=t=>{ const out=[]; for(const T of tokens(t)){ if(T.k!=='s'&&knows(BYW.get(T.e))){ out.push(T); continue; }
      const sp=[...T.t.replace(/ /g,'')].map(c=>knowsC(c)?c:wrongC(c)).join(''); out.push({k:'s',t:sp}); } return out; };
  // what a reader makes of signs: the ones they know, the rest "(…)"
  const readTok=T=>T.k==='s'?([...T.t].every(knowsC)?T.t:'(…)'):knows(BYW.get(entry(T.t)||T.t))?T.t:'(…)';
  const fromWire=(text,k)=>{ const ws=String(text||'').split(/\s+/).filter(Boolean), out=[]; let j=0; for(const c of String(k||'')){ if(j>=ws.length)break; if(c==='W'){ out.push({k:'W',t:ws[j]+' '+(ws[j+1]||'')}); j+=2; } else out.push({k:c==='w'?'w':'s',t:ws[j++]}); }
    while(j<ws.length)out.push({k:'s',t:ws[j++]}); return out; };
  ASL.read=toks=>toks.map(readTok).join(' ');
  ASL.understand=toks=>toks.length?toks.filter(T=>readTok(T)!=='(…)').length/toks.length:1;
  /* ---------- where the hands go, in the body's rest frame (metres; +x its left, +y up, +z ahead), for the right hand (the left mirrored) ---------- */
  const LOC={fs:[-.2,1.28,.28],ne:[-.12,1.1,.3],cs:[-.05,1.1,.17],cn:[-.02,1.36,.15],mo:[-.02,1.39,.15],fh:[-.03,1.5,.15],ey:[-.05,1.45,.16],ns:[-.02,1.42,.17],ck:[-.1,1.39,.12],te:[-.12,1.47,.09],
    bs:[-.02,1.1,.3],si:[-.3,1.1,.22],hi:[-.14,1.38,.32],lo:[-.14,.95,.28]}, BASE=[.06,1.03,.3];
  const ORI={o:[[0,1,0],[0,0,-1]],i:[[0,1,0],[0,0,1]],u:[[0,.15,1],[0,-1,0]],d:[[0,-.1,1],[0,1,0]],l:[[0,.1,1],[-1,0,0]],y:[[0,1,0],[-1,0,0]],s:[[1,0,0],[0,0,1]],p:[[0,-.7,.7],[0,.6,.8]],m:[[0,0,-1],[0,1,0]]};
  const e=u=>{ u=Math.max(0,Math.min(1,u)); return u*u*(3-2*u); }, S=Math.sin, P2=Math.PI*2;
  // a motion at u (0 to 1): the hand's offset, its turn about the fingers (twist) and across them (bend), and how far the shape has changed to its second
  const MV={none:u=>[0,0,0,0,0,u],out:u=>[0,-.04*e(u),.16*e(u),0,0,u],in:u=>[0,0,.16*(1-e(u)),0,0,u],fwd:u=>[0,0,.2*e(u),0,0,u],back:u=>[0,.02*e(u),-.1*e(u),0,0,u],up:u=>[0,.14*e(u),0,0,0,u],down:u=>[0,-.14*e(u),0,0,0,u],
    flip:u=>[0,-.1*e(u),.04,1.6*e(u),0,u],tap:u=>[0,0,.045*(.5+.5*Math.cos(2*P2*u)),0,0,u],circ:u=>[.05*Math.cos(P2*u)-.05,.05*S(P2*u),0,0,0,u],roll:u=>[0,.05*S(P2*u),.05*Math.cos(P2*u)-.05,0,0,u],
    side:u=>[.07*S(2*P2*u),0,0,0,0,u],shake:u=>[.02*S(4*P2*u),.01*S(8*P2*u),0,0,0,u],nod:u=>[0,0,0,0,.7*Math.abs(S(2*P2*u)),u],twist:u=>[0,0,0,.9*S(2*P2*u),0,u],flap:u=>[0,0,0,0,0,.5-.5*Math.cos(2*P2*u)],
    flick:u=>{ const v=e((u-.6)/.4); return [0,.02*v,.12*v,0,0,u>.6?1:0]; },apart:u=>[-.12*e(u),0,0,0,0,u],meet:u=>[-.08*(1-e(u)),0,0,0,0,u],arc:u=>[-.1+.2*u,.05*S(Math.PI*u),0,0,0,u],chop:u=>[0,.1*(1-e(u)),0,0,0,u],
    j:u=>[.04*S(Math.PI*e(u)),-.06*e(u),0,1.2*e(u),0,0],z:u=>{ const k=Math.min(2.999,u*3), i=Math.floor(k), f=e(k-i), Z=[[0,0],[-.08,0],[0,-.08],[-.08,-.08]]; return [Z[i][0]+(Z[i+1][0]-Z[i][0])*f,Z[i][1]+(Z[i+1][1]-Z[i][1])*f,0,0,0,0]; }};
  /* ---------- a run of signs: each sign its moment, the letters of a word close together ---------- */
  const LETS=.32, WORDS=.95, GAP=.2;
  const plan=toks=>{ const segs=[]; let t=.25; for(const T of toks){ if(t>30)break;
      if(T.k==='s'){ for(const c of T.t){ const d=LET[c]||DIG[c]; if(d){ segs.push({t0:t,d:d.mv==='none'?LETS:LETS*2,s:d}); t+=d.mv==='none'?LETS:LETS*2; } } }
      else { const d=WORD.get(entry(T.t)||T.t); if(d){ segs.push({t0:t,d:WORDS,s:d}); t+=WORDS; } }
      t+=GAP; }
    return {segs,end:t}; };
  /* ---------- a signer: the arms brought to the hands' places each frame (PM.post, as the juggling and the instruments), the fingers set (HANDS) ---------- */
  const {reach,aim,untwist,org}=GHOLD.IK, POLE=[new V3(.4,-1,-.5),new V3(-.4,-1,-.5)], HAND=.07, FLAT=shape('x0000');
  const mk=id=>({id,run:null,t0:0,H:null,hs:{L:null,R:null},prac:null,last:0});
  // a hand's wanted state at a moment: where (body frame), fingers along F, back toward D, its shape; null for a hand that is not signing
  const want=(sg,side,u)=>{ const s=sg.s, two=s.h==='2', R=side==='R'; if(!R&&!two&&s.h!=='b')return null;
    if(!R&&s.h==='b')return {p:new V3(...BASE),F:new V3(...ORI.u[0]).normalize(),D:new V3(...ORI.u[1]),fg:FLAT};
    const m=(MV[s.mv]||MV.none)(u), l=LOC[s.loc]||LOC.ne, o=ORI[s.ori]||ORI.o, sx=R?1:-1;
    const p=new V3((l[0]+m[0])*sx,l[1]+m[1],l[2]+m[2]), F=new V3(o[0][0]*sx,o[0][1],o[0][2]).normalize(), Dv=new V3(o[1][0]*sx,o[1][1],o[1][2]);
    if(m[3])Dv.applyAxisAngle(F,m[3]*sx); if(m[4]){ const ax=new V3().crossVectors(F,Dv).normalize(); F.applyAxisAngle(ax,-m[4]); Dv.applyAxisAngle(ax,-m[4]); }
    const a=shape(s.sh), b=s.sh2?shape(s.sh2):null, k=b?m[5]:0; return {p,F,D:Dv,fg:b?a.map((f,i)=>f.map((v,j)=>v+(b[i][j]-v)*k)):a}; };
  const at=(P,t)=>{ const r=P.run; if(!r)return null; let g=null; for(const s of r.segs){ if(s.t0>t)break; g=s; } if(!g)return null; return {g,u:Math.min(1,(t-g.t0)/g.d)}; };
  const attach=(P,me,PM,body)=>{ if(!body||!body.binv||!PM||(PM.post&&!PM.post.signs))return null; const restM=body.binv.map(m=>m.clone().invert()), W=restM.map(()=>new M4()), PB=new M4(), PBi=new M4(), MR=new M4();
    const fg={L:HANDS.R0.map(f=>f.slice()),R:HANDS.R0.map(f=>f.slice())}, H={me,PM,on:true};
    H.fn=PM.post=PMx=>{ if(!H.on)return; const Pv=PMx.value, tn=now(), dt=Math.min(.1,tn-(P.last||tn)); P.last=tn; PB.copy(Pv[1]); PBi.copy(PB).invert(); const k=1-Math.exp(-dt*18);
      for(let i=0;i<15;i++)W[i].multiplyMatrices(Pv[i],restM[i]); const A=P.run&&at(P,tn-P.t0); let any=false;
      for(const [sd,ids,pi] of [['L',[3,4,5],0],['R',[6,7,8],1]]){ let w=A?want(A.g,sd,A.u):null, h=P.hs[sd];
        // the hand's own place and turn from the body's moves, in the body frame: where a hand starts from and goes back to
        const wp=org(W[ids[2]],new V3()).applyMatrix4(PBi), rot=MR.extractRotation(W[ids[2]]).multiply(HANDS.LOC[sd]), wF=new V3().setFromMatrixColumn(rot,2).transformDirection(PBi), wD=new V3().setFromMatrixColumn(rot,1).transformDirection(PBi);
        if(!w&&!h)continue; if(!h)h=P.hs[sd]={p:wp.clone(),F:wF.clone(),D:wD.clone(),fg:HANDS.R0.map(f=>f.slice()),away:0};
        if(!w){ h.away+=dt; if(h.away>.4){ P.hs[sd]=null; continue; } w={p:wp,F:wF,D:wD,fg:HANDS.R0}; } else h.away=0;
        h.p.lerp(w.p,k); h.F.lerp(w.F,k).normalize(); h.D.lerp(w.D,k); for(let i=0;i<5;i++)for(let j=0;j<4;j++)h.fg[i][j]+=(w.fg[i][j]-h.fg[i][j])*k;
        const T=h.p.clone().addScaledVector(h.F,-HAND).applyMatrix4(PB);
        reach(W,ids,T,POLE[pi].clone().transformDirection(PB)); untwist(W,ids,1); aim(W,ids[2],sd,h.F.clone().transformDirection(PB),h.D.clone().transformDirection(PB)); untwist(W,ids,2);
        for(let i=0;i<5;i++)for(let j=0;j<4;j++)fg[sd][i][j]=h.fg[i][j]; any=true; }
      if(!any){ if(!P.run){ H.on=false; if(PM.post===H.fn)PM.post=null; if(PM.hands)PM.hands.fg=null; P.H=null; } return; }
      for(let i=0;i<15;i++)Pv[i].multiplyMatrices(W[i],body.binv[i]);
      if(PMx.hands)PMx.hands.fg={L:P.hs.L?fg.L:null,R:P.hs.R?fg.R:null}; };
    H.fn.signs=true; return H; };
  const end=P=>{ P.run=null; };   // (the hands go back to the body's own moves, then let go)
  const start=(P,toks,run)=>{ P.run=run||plan(toks); P.t0=now(); P.last=0; };
  /* ---------- you ---------- */
  const ME=mk('me'), THEM=new Map();
  const myMesh=()=>W3.group.children.find(m=>m.userData&&m.userData.hands&&m.userData.PM);
  const can=()=>!SHARED.drive&&!RAG.on&&!VIT.dead&&!st.climb&&!st.hang&&!(st.water&&st.water.in);
  let chatOn=false; try{ chatOn=localStorage.getItem('signchat')==='1'; }catch(e){}
  ASL.chatOn=()=>chatOn; ASL.toggle=v=>{ chatOn=v==null?!chatOn:!!v; try{ localStorage.setItem('signchat',chatOn?'1':'0'); }catch(e){}
    if(chatOn&&sk()<1)SAY('YOU SIGN WHAT YOU SAY NOW. YOU KNOW NO ASL YET: YOUR HANDS WILL GET IT WRONG. PRACTISE IN THE SIGN BOOK (EMOTES).','#c8a090'); return chatOn; };
  // the chat's hook (111d): what you send signed, your hands signing it
  ONLINE.signs={mine:t=>{ if(!chatOn)return null; const toks=ASL.mineOf(t); if(!toks.length)return null; ME.prac=null; start(ME,toks);
      return {text:toks.map(T=>T.t).join(' '),k:toks.map(T=>T.k).join('')}; },
    read:(id,text,k)=>{ const toks=fromWire(text,k); if(id){ let P=THEM.get(id); if(!P){ P=mk(id); THEM.set(id,P); } start(P,toks); } return ASL.read(toks); },
    toggle:()=>ASL.toggle(), on:()=>chatOn};
  SYS.add('dress',()=>{ const me=myMesh(), body=BODIES.by[BODIES.pick()];
    if(ME.run&&now()-ME.t0>ME.run.end){ const pr=ME.prac; end(ME); ME.prac=null; if(pr)finish(pr); }
    if((ME.run||ME.hs.L||ME.hs.R)&&!ME.H&&me&&can())ME.H=attach(ME,me,me.userData.PM,body);
    if(ME.run&&!can()){ const pr=ME.prac; end(ME); ME.prac=null; if(pr){ SAY('NOT HERE: STAND SOMEWHERE STEADY TO PRACTISE.','#c8a090'); PN.draw(); } }
    for(const [id,P] of THEM){ const o=ONLINE.others.get(id); if(!o){ THEM.delete(id); continue; } if(P.run&&now()-P.t0>P.run.end)end(P);
      const F=o.fig; if(!P.H&&(P.run||P.hs.L||P.hs.R)&&F&&F.body&&F.g&&F.g.visible)P.H=attach(P,F.me,F.PM,F.body); if(P.H)o.wantPose=true; if(!P.run&&!P.H&&!P.hs.L&&!P.hs.R)THEM.delete(id); } },'146zs-signs');
  /* ---------- practice from the book: the sign made three times; a stumble turns it into a wrong one partway ---------- */
  const practice=(i,force)=>{ const T=BOOK[i]; if(!T)return false;
    if(!SONGBK.can('sign',BOOK,T)){ SAY(`${T.name.toUpperCase()} IS NOT OPEN TO YOU YET (SIGN LANGUAGE ${T.lvl}; YOURS IS ${sk().toFixed(1)}). LEARN THE ASL YOU HAVE.`,'#c8a090'); return false; }
    if(!can()){ SAY('NOT HERE: STAND SOMEWHERE STEADY TO PRACTISE.','#c8a090'); return false; }
    const r=force||SONGBK.start('sign',T), one=T.kind==='l'?{k:'s',t:T.c}:{k:'w',t:T.w}, base=plan([one,one,one]), run={segs:base.segs.map(s=>({...s})),end:base.end};
    if(!r.ok){ const cut=run.end*r.at, bad=LET[wrongC(T.kind==='l'?T.c:'')]; run.segs=run.segs.filter(s=>s.t0<cut); run.segs.push({t0:cut,d:.8,s:{...bad,mv:'shake'}}); run.end=cut+.9; }
    ME.prac={T,ok:r.ok,at:r.at}; start(ME,null,run); PN.draw(); return true; };
  const finish=pr=>{ SONGBK.done('sign',pr.T,pr.ok,pr.ok?1:pr.at); PN.fill(); };
  ASL.practice=practice; ASL.stop=()=>{ if(!ME.run)return; end(ME); ME.prac=null; PN.draw(); };
  const PN=SONGBK.panel({id:'sgnp',title:'SIGN LANGUAGE',skill:'sign',book:()=>BOOK,goWord:'PRACTISE',go:i=>practice(i),stop:()=>ASL.stop(),busy:()=>!!ME.prac,off:()=>ASL.close(),
    now:()=>ME.prac?'SIGNING '+ME.prac.T.name.toUpperCase():(chatOn?'YOUR CHAT IS SIGNED':'')});
  ASL.open=()=>PN.show(true); ASL.close=()=>{ ASL.stop(); PN.show(false); };
  MOTION.more('GREET AND TALK','SIGN BOOK',()=>ASL.open());
  /* ---------- townsfolk who sign (`signs: true` in characters.json): their lines signed, their trade and quests for those who follow ---------- */
  const recOf=N=>{ const id=typeof N==='string'?N:CHARS.id(N); return (id&&((CHARS.store&&CHARS.store[id])||(CHARS.rec&&CHARS.rec(id))))||null; };
  ASL.signer=N=>{ const r=recOf(N); return !!(r&&r.signs); };
  // a signer's line as you read it (unchanged for anyone else): their word signs and the rest spelled, fluently
  ASL.line=(N,text)=>ASL.signer(N)?'(SIGNS) '+ASL.read(tokens(text)):text;
  LINES.signs=(N,text)=>ASL.signer(N)?ASL.line(N,text):null;
  // do you follow them well enough to deal with them: how much of their own line you read (quiet: no word of it)
  ASL.follows=(N,quiet)=>{ const r=recOf(N); if(!r||!r.signs)return true; const line=(r.trade&&r.trade.line)||'hello what do you want', u=ASL.understand(tokens(line)); if(u>=GATE)return true;
    if(!quiet){ const nm=(typeof N==='object'&&N.name)||r.name||'THEY'; if(typeof N==='object'&&N.g)LINES.say(N,line);
      SAY(`${nm.toUpperCase()} ASL TO YOU: "${ASL.read(tokens(line)).toUpperCase()}". YOU FOLLOW ${Math.round(u*100)}% OF IT: LEARN MORE SIGN LANGUAGE TO DEAL WITH THEM.`,'#c8a090'); }
    return false; };
  Object.assign(ASL,{BOOK,PN,ME,THEM:()=>THEM,tokens,plan,knows,shape,LET,WORD,GATE,fromWire,want,credit:D.src}); }
export {ASL};
