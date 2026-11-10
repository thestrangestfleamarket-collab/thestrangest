// THE SONG BOOKS' LEARNING: SONGBK, one rule for every instrument's book: the pieces in bands of ten levels, five new ones open in each band you reach, a try that passes or stumbles, a piece learnt after three clean plays (the next of its band opens).
import {FORAGE} from './003b-systems.js';
import {SAY} from './003d-say.js';
const SONGBK={}; window.SONGBK=SONGBK;
{ const NEW=5, CLEAN=3, WIN=2.5;
  const sk=k=>FORAGE.sk?FORAGE.sk(k)||0:0, band=T=>Math.max(0,Math.min(9,Math.floor(((T.lvl||1)-1)/10))), mine=k=>Math.min(9,Math.floor(sk(k)/10));
  const got=k=>{ const S=FORAGE.S; S.songs=S.songs||{}; return S.songs[k]||(S.songs[k]={}); }, key=T=>T.name+(T.by?'|'+T.by:'');
  const learnt=(k,T)=>(got(k)[key(T)]||0)>=CLEAN;
  // each piece of a book: 'learnt', 'open' (one of its band's five to work on), 'wait' (opens when one of the five is learnt) or 'lock' (its band is past your skill)
  const state=(k,B)=>{ const m=mine(k), n=new Array(10).fill(0), out=new Map();
    for(const T of B.filter(T=>T&&!T.kept).sort((a,b)=>(a.lvl||1)-(b.lvl||1))){ const b=band(T); out.set(T,learnt(k,T)?'learnt':b>m?'lock':n[b]++<NEW?'open':'wait'); }
    return out; };
  const can=(k,B,T)=>{ const s=state(k,B).get(T); return s==='open'||s==='learnt'; };
  const chance=(k,T)=>learnt(k,T)?1:Math.max(.05,Math.min(1,(sk(k)-(T.lvl||1)+30)/50));
  // a try: clean, or a stumble somewhere in the middle of it (at: the part played, 0 to 1)
  const start=(k,T)=>Math.random()<chance(k,T)?{ok:true,at:1}:{ok:false,at:.25+Math.random()*.5};
  // the try over: the skill's rolls for what was played (a pass gains far likelier than a stumble), a clean play counted
  const done=(k,T,ok,at=1)=>{ const was=learnt(k,T), n=1+Math.floor((T.secs||40)*at/30), l=T.lvl||1; for(let i=0;i<n;i++)FORAGE.use(k,l-30,l+20,0,{ok,win:was?1:WIN});
    if(!ok){ SAY(`YOU STUMBLE IN ${T.name.toUpperCase()}. TRY IT AGAIN.`,'#c8a090'); return; }
    if(was)return; const G=got(k), c=G[key(T)]=(G[key(T)]||0)+1; FORAGE.save();
    SAY(c>=CLEAN?`YOU HAVE LEARNT ${T.name.toUpperCase()}: IT IS YOURS NOW, AND A NEW PIECE OPENS IN THE BOOK.`:`${T.name.toUpperCase()} PLAYED CLEAN (${c} OF ${CLEAN} TO LEARN IT).`,'#7fd0ff'); };
  // the book's list for a panel: each band you have reached, its learnt pieces and its five to work on
  const esc=t=>String(t).replace(/[&<>"]/g,c=>'&#'+c.charCodeAt(0)+';');
  const options=(k,B)=>{ const st=state(k,B), m=mine(k); let o='';
    for(let b=0;b<=9;b++){ const L=B.map((T,i)=>[i,T]).filter(([,T])=>T&&band(T)===b&&(st.get(T)==='open'||st.get(T)==='learnt')).sort((x,y)=>(x[1].lvl||1)-(y[1].lvl||1));
      if(b>m){ if(B.some(T=>T&&!T.kept&&band(T)===b))o+=`<optgroup label="LEVEL ${b*10}-${b*10+10} · OPENS AT ${b*10}"></optgroup>`; continue; }
      if(L.length)o+=`<optgroup label="LEVEL ${b*10}-${b*10+10}">`+L.map(([i,T])=>`<option value="${i}">${st.get(T)==='learnt'?'★ ':''}${esc(T.name.toUpperCase())}${T.by?' · '+esc(T.by.toUpperCase()):''} · ${Math.round(chance(k,T)*100)}%</option>`).join('')+'</optgroup>'; }
    return o; };
  // a stumbling note: now and then dropped, else a neighbour of the right one
  const slip=()=>Math.random()<.45?(Math.random()<.4?0:Math.random()<.5?-1:1):null;
  Object.assign(SONGBK,{NEW,CLEAN,band,mine,learnt,state,can,chance,start,done,options,slip,LEAD:2.5}); }
export {SONGBK};
