// THE BOWLING ALLEY'S RULES: ten-pin scoring and who holds which lane, one path for the page (put in by the build, __CODE__) and the worker (imported).
const BOWLS={N:4};
{ const cl=v=>Math.max(0,Math.min(10,v|0));
  // the rolls of one game split into its ten frames (the tenth keeps up to three)
  BOWLS.frames=R=>{ const F=[]; let i=0; for(let f=0;f<10;f++){ if(f===9){ F.push({r:R.slice(i,i+3),i}); i+=3; } else if(R[i]===10){ F.push({r:[10],i}); i+=1; } else { F.push({r:R.slice(i,i+2),i}); i+=2; } } return F; };
  // a game's rolls are possible: no frame knocks more than ten, nothing past the end
  BOWLS.ok=R=>{ if(!Array.isArray(R)||R.length>21||R.some(v=>!Number.isInteger(v)||v<0||v>10))return false; let i=0;
    for(let f=0;f<9;f++){ if(i>=R.length)return true; if(R[i]===10){ i++; continue; } if(i+1<R.length&&R[i]+R[i+1]>10)return false; i+=2; }
    const t=R.slice(i); if(t.length>3)return false; if(t.length<2)return true; const [a,b,c]=t;
    if(a<10&&a+b>10)return false; if(a<10&&a+b<10&&t.length>2)return false;
    if(c!=null&&a===10&&b<10&&b+c>10)return false; return true; };
  // the score frame by frame: each frame's rolls, its marks (X / - and digits) and the running total once it can be counted
  BOWLS.score=R=>{ const F=BOWLS.frames(R); let tot=0, open=false;
    const out=F.map((fr,f)=>{ const r=fr.r, i=fr.i, m=[]; let s=null;
      if(f<9){ if(r[0]===10){ m.push('','X'); if(R[i+2]!=null)s=10+R[i+1]+R[i+2]; }
        else { if(r[0]!=null)m.push(r[0]?String(r[0]):'-'); if(r[1]!=null){ m.push(r[0]+r[1]===10?'/':r[1]?String(r[1]):'-'); s=r[0]+r[1]===10?(R[i+2]!=null?10+R[i+2]:null):r[0]+r[1]; } } }
      else { let fresh=true, prev=0; for(const v of r){ m.push(fresh&&v===10?'X':!fresh&&prev+v===10?'/':v?String(v):'-'); if(fresh&&v===10){ fresh=true; prev=0; } else if(!fresh){ fresh=true; prev=0; } else { fresh=false; prev=v; } }
        const done=r.length===3||r.length===2&&r[0]+r[1]<10; if(done)s=r.reduce((a,b)=>a+b,0); }
      if(s!=null&&!open){ tot+=s; return {r,m,tot}; } open=true; return {r,m,tot:null}; });
    const nx=BOWLS.next(R); return {frames:out,total:out.reduce((a,f)=>f.tot!=null?f.tot:a,0),done:nx.done}; };
  // the next ball: which frame and ball it is, and whether the pinsetter puts up a fresh ten first
  BOWLS.next=R=>{ const F=BOWLS.frames(R);
    for(let f=0;f<9;f++){ const r=F[f].r; if(!r.length)return {f,b:0,rack:true,done:false}; if(r[0]<10&&r.length<2)return {f,b:1,rack:false,done:false}; }
    const r=F[9].r; if(!r.length)return {f:9,b:0,rack:true,done:false}; if(r.length===1)return {f:9,b:1,rack:r[0]===10,done:false};
    if(r.length===2){ if(r[0]<10&&r[0]+r[1]<10)return {f:9,b:2,rack:false,done:true}; return {f:9,b:2,rack:r[0]===10?r[1]===10:true,done:false}; }
    return {f:9,b:3,rack:false,done:true}; };
  // a frame just finished with this roll: was it a strike or a spare (the skill's pass)
  BOWLS.mark=R=>{ const F=BOWLS.frames(R); for(let f=9;f>=0;f--){ const r=F[f].r; if(!r.length)continue; if(f<9)return r[0]===10||r[0]+(r[1]||0)===10; return r.includes(10)||r[0]+(r[1]||0)===10; } return false; };
  // which frame (0-9) the last roll closed, or -1 while its frame is still open
  BOWLS.closed=R=>{ if(!R.length)return -1; const a=BOWLS.next(R.slice(0,-1)), b=BOWLS.next(R); return b.done||b.f>a.f?a.f:-1; };
  // the lanes a section holds: one bowler each ({id, name, rolls}); taking another lane lets the first go
  BOWLS.lanes=()=>Array.from({length:BOWLS.N},()=>null);
  BOWLS.take=(L,id,name,ln)=>{ if(!id||!(ln>=0&&ln<L.length))return false; const h=L[ln]; if(h&&h.id!==id)return false; for(let i=0;i<L.length;i++)if(i!==ln&&L[i]&&L[i].id===id)L[i]=null; L[ln]=h||{id,name:String(name||'').slice(0,24),rolls:[]}; return true; };
  BOWLS.free=(L,id,ln)=>{ if(L[ln]&&L[ln].id===id){ L[ln]=null; return true; } return false; };
  BOWLS.leave=(L,id)=>{ let n=false; for(let i=0;i<L.length;i++)if(L[i]&&L[i].id===id){ L[i]=null; n=true; } return n; };
  BOWLS.roll=(L,id,ln,R)=>{ const h=L[ln]; if(!h||h.id!==id||!BOWLS.ok(R))return false; h.rolls=R.map(cl); return true; }; }
export {BOWLS};
