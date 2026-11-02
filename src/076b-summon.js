// SUMMON: an owner brings any character to stand in front of them; everyone in the section sees it there (the block's shared world, sum:<id>), until SEND BACK puts it where it was.
import {SHARED} from './003-shx.js';
import {CHARS, LEVELS, NPCS, ONLINE, pos, SUMMON} from './003b-systems.js';
import {scene} from './004-main.js';
import {SYS, TILE} from './006-map-pre.js';
{ const on=new Map(), saved=new Map();
  const all=()=>NPCS.all().filter(N=>N&&N.key&&N.st&&N.g);   // the same characters the character editor lists
  const idOf=(N,L=all())=>{ const b=CHARS.id(N)||N.key, same=L.filter(q=>(CHARS.id(q)||q.key)===b); return same.length>1?b+'#'+(same.indexOf(N)+1):b; };   // keys repeat (eleven dragons): the nth of its kind, built in the same order on every player's game
  const find=k=>{ const L=all(); return L.find(N=>idOf(N,L)===k); };
  const parse=v=>{ if(typeof v!=='string'||!v)return null; const a=v.split(','); if(a.length<5)return null; const n=a.slice(0,4).map(Number); if(n.some(x=>!isFinite(x)))return null; return {x:n[0],z:n[1],y:n[2],h:n[3],lv:a[4]}; };
  const keep=N=>{ if(saved.has(N))return; const st=N.st; saved.set(N,{p:N.g.parent,lv:N.g.userData.level,park:N.park,x:st.x,z:st.z,h:st.h,hold:st.hold,face:st.face}); };
  const release=N=>{ const o=saved.get(N); if(!o)return; saved.delete(N); const st=N.st, g=N.g;
    if(o.p&&g.parent!==o.p)o.p.add(g); if(o.lv===undefined)delete g.userData.level; else g.userData.level=o.lv; N.park=o.park;
    st.x=o.x; st.z=o.z; st.h=o.h; st.hold=o.hold; st.face=o.face; st.to=st.next=null; st.wait=1; };
  const pin=(N,s)=>{ const st=N.st, g=N.g; keep(N);
    if(g.parent!==scene)scene.add(g); g.userData.level=s.lv; N.park=false;
    st.x=s.x; st.z=s.z; st.h=s.h; st.to=st.next=null; st.face=null; st.hold=true; st.goIn=null; if(st.inT!=null){ st.inT=null; if(N.body)N.body.visible=true; }
    g.position.set(s.x,s.y,s.z); g.rotation.set(0,s.h,0); };
  Object.assign(SUMMON,{
    list:all, id:idOf, byId:find, here:()=>[...on.keys()],
    go:N=>{ const h=SHARED.heading||0, x=pos.x+Math.sin(h)*1.6*TILE, z=pos.z+Math.cos(h)*1.6*TILE;
      ONLINE.put('sum:'+idOf(N),[x,z,SHARED.py,h+Math.PI].map(v=>+(+v).toFixed(2)).join(',')+','+(LEVELS.cur||'street')); },
    back:k=>ONLINE.put('sum:'+k,''),
    dbg:()=>[...on].map(([k,s])=>({k,...s,N:undefined,found:!!(s.N||find(k))})) });
  SYS.add('world',(k,v)=>{ if(typeof k!=='string'||!k.startsWith('sum:'))return; const key=k.slice(4), s=parse(v);
    if(s){ on.set(key,s); return; } on.delete(key); const N=find(key); if(N)release(N); },'076b-summon');
  SYS.add('rooms',()=>{ if(!on.size)return; for(const [k,s] of on){ if(!s.N||!s.N.g)s.N=find(k); if(s.N)pin(s.N,s); } },'076b-summon');
  window.SUMMON=SUMMON; }
