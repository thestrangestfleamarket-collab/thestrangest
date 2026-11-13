// THE BOOKS' LEARNING: SONGBK, one rule for every skill's book of pieces (the instruments' songs, the dances, the juggling patterns): the pieces in bands of ten levels, five new ones open in each band you reach, a try that passes or stumbles, a piece learnt after three clean plays (the next of its band opens); LOOP and NEXT for what follows a piece played through; a piece done near townsfolk earns tips; a book's small panel. A piece marked free (imported music, 146zpe) is anyone's to play: no try, no skill, no tips.
import {FORAGE, INV, NPCS, pos, UI} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {TILE} from './006-map-pre.js';
const SONGBK={}; window.SONGBK=SONGBK;
{ const NEW=5, CLEAN=3, WIN=2.5;
  // each book's words (SONGBK.words[skill]): what a try is called and what a piece is; the instruments' are the plain ones
  const WORDS={done:'PLAYED',piece:'PIECE',stumble:n=>`YOU STUMBLE IN ${n}. TRY IT AGAIN.`,crowd:'LISTENED'}, words=k=>({...WORDS,...(SONGBK.words[k]||{})});
  const sk=k=>FORAGE.sk?FORAGE.sk(k)||0:0, band=T=>Math.max(0,Math.min(9,Math.floor(((T.lvl||1)-1)/10))), mine=k=>Math.min(9,Math.floor(sk(k)/10));
  const got=k=>{ const S=FORAGE.S; S.songs=S.songs||{}; return S.songs[k]||(S.songs[k]={}); }, key=T=>T.name+(T.by?'|'+T.by:'');
  const learnt=(k,T)=>(got(k)[key(T)]||0)>=CLEAN;
  // each piece of a book: 'learnt', 'open' (one of its band's five to work on), 'wait' (opens when one of the five is learnt) or 'lock' (its band is past your skill)
  const state=(k,B)=>{ const m=mine(k), n=new Array(10).fill(0), out=new Map();
    for(const T of B.filter(T=>T&&!T.kept).sort((a,b)=>(a.lvl||1)-(b.lvl||1))){ const b=band(T); out.set(T,learnt(k,T)?'learnt':b>m?'lock':n[b]++<NEW?'open':'wait'); }
    return out; };
  const can=(k,B,T)=>{ if(T&&T.free)return true; const s=state(k,B).get(T); return s==='open'||s==='learnt'; };
  const chance=(k,T)=>T.free||learnt(k,T)?1:Math.max(.05,Math.min(1,(sk(k)-(T.lvl||1)+30)/50));
  // a try: clean, or a stumble somewhere in the middle of it (at: the part played, 0 to 1)
  const start=(k,T)=>{ const c=chance(k,T), miss=T.free||learnt(k,T)?0:+Math.min(.35,(1-c)*.5).toFixed(2), seed=1+Math.floor(Math.random()*1e6); return Math.random()<c?{ok:true,at:1,miss,seed}:{ok:false,at:.25+Math.random()*.5,miss,seed}; };
  // the try as sent to the others (the piece, where it stumbles, how often a note goes wrong, the dice), and read back
  const code=(i,r,len)=>`${i}:${r.ok?0:+(len*r.at).toFixed(1)}:${r.miss||0}:${r.seed||0}`;
  const read=v=>{ const a=String(v).split(':'); return {i:parseInt(a[0]),fail:+a[1]||0,miss:+a[2]||0,seed:+a[3]||0}; };
  // a wrong note in the middle of a piece, as often as your skill falls short of it; the same notes for everyone who hears it
  const wrong=(P,n)=>{ if(!P.miss)return false; let h=(P.seed*2654435761+n*40503)>>>0; h=Math.imul(h^h>>>15,2246822507)>>>0; h^=h>>>13; return (h>>>0)/4294967296<P.miss; };
  // playing teaches: a roll of the skill every so often while the piece goes on
  const EVERY=15, tick=(k,T,P,t)=>{ if(T.free)return false; if(P.rk!==P.s0){ P.rk=P.s0; P.rl=0; } const l=T.lvl||1, was=learnt(k,T), s0=sk(k);
    while(P.rl<Math.floor(t/EVERY)){ P.rl++; FORAGE.use(k,l-30,l+20,0,{ok:!(P.fail&&t>P.fail),win:was?1:WIN}); } return sk(k)!==s0; };
  // the try over: the skill's rolls for what was played (a pass gains far likelier than a stumble), a clean play counted
  const done=(k,T,ok,at=1,ticked=false)=>{ if(T.free)return; const was=learnt(k,T), n=ticked?1:1+Math.floor((T.secs||40)*at/30), l=T.lvl||1, w=words(k); for(let i=0;i<n;i++)FORAGE.use(k,l-30,l+20,0,{ok,win:was?1:WIN});
    if(!ok){ SAY(w.stumble(T.name.toUpperCase()),'#c8a090'); return; }
    if(was)return; const G=got(k), c=G[key(T)]=(G[key(T)]||0)+1; FORAGE.save();
    SAY(c>=CLEAN?`YOU HAVE LEARNT ${T.name.toUpperCase()}: IT IS YOURS NOW, AND A NEW ${w.piece} OPENS IN THE BOOK.`:`${T.name.toUpperCase()} ${w.done} CLEAN (${c} OF ${CLEAN} TO LEARN IT).`,'#7fd0ff'); };
  // busking: a piece done through near townsfolk earns tips, more for a harder piece, a better hand and a bigger crowd (at most six count)
  const busk=(k,T)=>{ if(T.free)return 0; let n=0; for(const N of NPCS.all())if(N.g&&N.g.visible&&N.st&&Math.hypot(N.st.x-pos.x,N.st.z-pos.z)<12*TILE)n++; n=Math.min(6,n); if(!n)return 0;
    const tip=Math.max(1,Math.round(n*(.5+(T.lvl||10)/40)*(.5+sk(k)/50)*(.7+Math.random()*.6))); INV.cash+=tip; SAY(`${n} ${n>1?'PEOPLE':'PERSON'} ${words(k).crowd}. YOU MAKE $${tip} IN TIPS.`,'#f2c14e'); return tip; };
  // the book's list for a panel: each band you have reached, its learnt pieces and its five to work on
  const esc=t=>String(t).replace(/[&<>"]/g,c=>'&#'+c.charCodeAt(0)+';');
  const options=(k,B)=>{ const st=state(k,B), m=mine(k), F=B.map((T,i)=>[i,T]).filter(([,T])=>T&&T.free===1); let o=F.length?'<optgroup label="YOUR MUSIC">'+F.map(([i,T])=>`<option value="${i}">${esc(T.name.toUpperCase())}${T.by?' · '+esc(T.by.toUpperCase()):''}</option>`).join('')+'</optgroup>':'';
    for(let b=0;b<=9;b++){ const L=B.map((T,i)=>[i,T]).filter(([,T])=>T&&band(T)===b&&(st.get(T)==='open'||st.get(T)==='learnt')).sort((x,y)=>(x[1].lvl||1)-(y[1].lvl||1));
      if(b>m){ if(B.some(T=>T&&!T.kept&&band(T)===b))o+=`<optgroup label="LEVEL ${b*10}-${b*10+10} · OPENS AT ${b*10}"></optgroup>`; continue; }
      if(L.length)o+=`<optgroup label="LEVEL ${b*10}-${b*10+10}">`+L.map(([i,T])=>`<option value="${i}">${st.get(T)==='learnt'?'★ ':''}${esc(T.name.toUpperCase())}${T.by?' · '+esc(T.by.toUpperCase()):''} · ${Math.round(chance(k,T)*100)}%</option>`).join('')+'</optgroup>'; }
    return o; };
  // a piece played through, what comes after it (SONGBK.mode: '' nothing, 'loop' the same again, 'next' the next piece you know: your music and the learnt ones in the book's order, round to the first): its place in the book, or -1
  const next=(k,B,i)=>{ if(SONGBK.mode==='loop')return i; if(SONGBK.mode!=='next')return -1; const L=B.map((T,j)=>[j,T]).filter(([,T])=>T&&(T.free===1||!T.kept&&learnt(k,T))).sort((a,b)=>(b[1].free||0)-(a[1].free||0)||(a[1].lvl||1)-(b[1].lvl||1)).map(x=>x[0]);
    return L.length?L[(L.indexOf(i)+1)%L.length]:-1; };
  // the two buttons a book's panel carries for it, and their click (true when it was one of them)
  const modeHTML=()=>`<button data-after="loop" title="play it again when it ends" aria-pressed="${SONGBK.mode==='loop'}">LOOP</button><button data-after="next" title="then the next piece you know" aria-pressed="${SONGBK.mode==='next'}">NEXT</button>`;
  const modeClick=(b,PN)=>{ if(!b.dataset.after)return false; SONGBK.mode=SONGBK.mode===b.dataset.after?'':b.dataset.after; for(const x of PN.querySelectorAll('[data-after]'))x.setAttribute('aria-pressed',String(SONGBK.mode===x.dataset.after)); return true; };
  // a stumbling note: now and then dropped, else a neighbour of the right one
  const slip=()=>Math.random()<.45?(Math.random()<.4?0:Math.random()<.5?-1:1):null;
  // a book's panel for a body's pieces (the dances, the juggling): its skill, the book, GO/STOP and away; o: {id, title, skill, book(), go(i), stop(), busy(), off(), now()}
  const css=document.createElement('style'); css.textContent=`.sbkp{position:fixed;left:50%;bottom:calc((84px + env(safe-area-inset-bottom,0px)) / var(--uiz,1));transform:translateX(-50%);z-index:7;zoom:var(--uiz,1);background:#0b0d13e6;border:2px solid #2a3040;padding:6px 8px;color:#e8e2cc;font:9px Silkscreen,monospace;width:min(520px,calc(100vw - 32px));box-sizing:border-box}
    .sbkp .r{display:flex;flex-wrap:wrap;gap:2px 4px;align-items:center;margin:2px 0} .sbkp button{font:inherit;color:inherit;background:#161a24;border:2px solid #2a3040;padding:2px 5px;cursor:pointer} .sbkp button[aria-pressed=true]{background:#2c4a36;border-color:#5fa06e}
    .sbkp select{font:inherit;color:inherit;background:#0b0d13;border:2px solid #2a3040;padding:2px;max-width:260px} .sbkp .h{margin-right:8px}`;
  document.head.appendChild(css);
  const panel=o=>{ let PN=null; const P={};
    P.fill=()=>{ const el=PN&&PN.querySelector('select'); if(!el)return; const v=el.value; el.innerHTML=options(o.skill,o.book())||'<option>THE BOOK IS ON ITS WAY…</option>'; if(v)el.value=v; P.draw(); };
    P.draw=()=>{ if(!PN||PN.hidden)return; const b=o.busy(), go=PN.querySelector('.go'); go.textContent=b?'STOP':o.goWord||'GO'; go.setAttribute('aria-pressed',String(!!b));
      PN.querySelector('.h').textContent=o.title+' '+sk(o.skill).toFixed(1); PN.querySelector('.now').textContent=o.now()||'PICK ONE FROM THE BOOK'; };
    P.pick=()=>{ const el=PN&&PN.querySelector('select'); return el?+el.value:-1; };
    P.show=v=>{ if(!v){ if(PN)PN.hidden=true; return; } if(!PN){ PN=document.createElement('div'); PN.className='sbkp'; PN.id=o.id; document.body.appendChild(PN);
        PN.innerHTML=`<div class="r"><span class="h"></span><span class="now"></span></div><div class="r"><select aria-label="${o.title.toLowerCase()} book"></select><button class="go"></button><button class="off" title="esc">${o.offWord||'DONE'}</button></div>`;
        PN.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b)return; if(b.classList.contains('go')){ if(o.busy())o.stop(); else o.go(P.pick()); } else if(b.classList.contains('off'))o.off(); b.blur(); });
        for(const el of PN.querySelectorAll('select'))el.addEventListener('keydown',e=>{ if(e.key==='Escape')o.off(); e.stopPropagation(); }); }
      PN.hidden=false; P.fill(); };
    P.shown=()=>!!PN&&!PN.hidden; P.el=()=>PN;
    addEventListener('keydown',e=>{ if(!P.shown()||e.key!=='Escape'||UI.menuOpen)return; if(e.target&&e.target.closest&&e.target.closest('input,textarea,[contenteditable="true"]'))return; o.off(); });
    FORAGE.MAXFN.push(()=>P.fill());
    return P; };
  Object.assign(SONGBK,{NEW,CLEAN,band,mine,learnt,state,can,chance,start,code,read,wrong,tick,done,busk,options,slip,panel,next,modeHTML,modeClick,mode:'',words:{},LEAD:2.5}); }
export {SONGBK};
