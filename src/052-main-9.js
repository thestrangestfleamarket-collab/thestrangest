
  BOD.GOOD=GOOD; BOD.GLAY=GLAY; BOD.GC=GC;
  const sol=(x0,y0,x1,y1,zt)=>{ solids.push([X(x0),Z(y0),X(x1),Z(y1)]); fixed.push([X(x0),Z(y0),0,X(x1),Z(y1),Math.max(.05,Y(zt))]); };
  for(const w of WALLS){ let a=w.a0; const ds=w.holes.filter(h=>h.door).sort((p,q)=>p.a0-q.a0);
    const seg=(a0,a1)=>{ if(a1-a0<.01)return; if(w.ax==='x')sol(a0,w.at-.1,a1,w.at+.1,w.H); else sol(w.at-.1,a0,w.at+.1,a1,w.H); };
    for(const d of ds){ seg(a,d.a0); a=d.a1; } seg(a,w.a1); }
  for(const p of [...Object.values(O),...STREET,...GHOSTST]){ if(p.high||/mat$|^door mat|bags|fly|tube|bell|clock|calendar|cord|mirror|phone|flap|dock|radio|cigs|chair/.test(p.key||p.name||''))continue;
    const bs=p.boxes.filter(b=>!b.nb&&b.z0<30&&b.z1-b.z0>3); if(!bs.length)continue; const r={x0:Math.min(...bs.map(b=>b.x0)),y0:Math.min(...bs.map(b=>b.y0)),x1:Math.max(...bs.map(b=>b.x1)),y1:Math.max(...bs.map(b=>b.y1))};
    sol(r.x0,r.y0,r.x1,r.y1,Math.max(...bs.map(b=>b.z1))); }
  BOUND={x0:XS(MAP.x0),x1:XS(MAP.x1),z0:Z(B00.y0),z1:ZS(MAP.y1)};
  groundY=(x,z)=>{ const gx=x/TILE+OX, gy=z/TILE+OY, rw=rampAt(gx,gy); if(rw!=null)return YS(RD*(1-rw/RPD)); return ROADAT(gx,gy)?YS(RD):(window.HILL?HILL(x,z):0); };
  BOD.inside=(x,z)=>{ const gx=x/TILE/K+OX, gy=z/TILE/K+OY; return gx>B0.x0&&gx<B0.x1&&gy>B0.y0&&gy<B0.y1; };
}
}
