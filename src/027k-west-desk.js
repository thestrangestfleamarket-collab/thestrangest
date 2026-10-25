// THE DESK ROOM KIT: the old game's desk room and its CRT as catalog kinds; loads with the old rooms' kits on the first jump.
import {SHARED} from './003-shx.js';
import {CAT_DEPTS, CAT_INFO, CATALOG, hash, KIND_OF, LAMPS, LBLD, LIFE, mt, prop, sh, sided, T} from './014-gamekit.js';
import {STUDIO} from './020-studio-kit.js';
const westDesk=()=>{ '@oldkits';
  const LBLDX=LBLD.some(b=>b.id==='ldesk')?LBLD:LBLD.concat([{id:'ldesk',x0:560,y0:-420,x1:564,y1:-413,h:96,st:1}]);   // the old game's building for this room is not on this map: a stand-in box, off it
// =====================================================================================
// THE DESK ROOM, ITS ROOM (owner, 13 Oct 2026: "after the box level in davids intro level ... a small crt monitor and keyboard and mouse on
// desk in middle of dark room"; back from the archive on the West End, owner 16 Oct 2026: "bring all of these back and put on map"): the
// room as it was on the VR level, now the West End's building 'ldesk' (WEND, 21-world-map-5-0-west-plan; its walls and door,
// 21-world-map-5-zz-west-end), its door on the north sidewalk. Black walls inside in coarse blocks (low res), a faint seam every tile and
// every 16 px up; the floor dark concrete in coarse squares (four art px), now and then a paler or darker one. Two faint little street
// lamps in its west corners (owner, 13 Oct 2026: "add some faint street lights on corners faint glow barely to help out") and the CRT's
// glow (23-w-west-desk-2-crt) are its light; the experimental lighting is on while you're in it (47-west-desk-1-room). Its things placed:
// 26-zzzzzzzzzzzz-west-desk. DESK: the building, the room inside its walls (r), the middle line (y), where you walk on to after the drones
// (exit), whether you're in it and the lighting you had (in, lm).
// =====================================================================================
const DESK={b:LBLDX.find(q=>q.id==='ldesk'),r:null,y:0,exit:null,in:false,lm:null};
{ const b=DESK.b; DESK.r={x0:b.x0+T,y0:b.y0+T,x1:b.x1-T,y1:b.y1-T}; DESK.y=(b.y0+b.y1)/2; }
const inDesk=(x,y)=>{ const b=DESK.b; return x>=b.x0&&x<b.x1&&y>=b.y0&&y<b.y1; };
// the floor: dark concrete in coarse squares (four art px), now and then a paler or darker one (21: bldgCol)
function deskCol(x,y){ const n=hash(Math.floor(x*6),Math.floor(y*6),701); return mt('tour floor',sh([34,34,38],n<.15?.86:n>.9?1.14:1)); }
// the walls inside: black, in coarse blocks (four art px), a faint seam every tile and every 16 px up (22: facadeCol, b.inWall)
const DESKK=[20,20,24];
function deskWall(q,nx,ny,X,Y,z,f){ const u=nx?Y:X, a=u-Math.floor(u); if(a<.04||z%16<1)return sh(mt('tour wall',[12,12,14]),f);
  return sh(mt('tour wall',sh(DESKK,.92+.16*hash(Math.floor(u*6),Math.floor(z/4),707))),f); }
DESK.b.floorOf=lv=>lv?null:deskCol; DESK.b.inWall=deskWall;
// a faint little street lamp in a corner: an iron post, a dim amber lantern; its light the room's own (vr: not the street lamps' switch)
function wdeskLamp(x,y){ SHARED.PNAME='corner street lamp'; const IR=[46,48,54], G=[150,124,84];
  const p=prop([{x0:x-.1,y0:y-.1,x1:x+.1,y1:y+.1,z0:0,z1:4,c:IR},{x0:x-.035,y0:y-.035,x1:x+.035,y1:y+.035,z0:4,z1:48,foot:0,nb:1,c:IR},{x0:x-.11,y0:y-.11,x1:x+.11,y1:y+.11,z0:48,z1:49,foot:0,nb:1,c:IR},
    {x0:x-.08,y0:y-.08,x1:x+.08,y1:y+.08,z0:49,z1:55,foot:0,em:1,c:G,top:()=>IR,fj:()=>G,fi:()=>sh(G,.85)},{x0:x-.11,y0:y-.11,x1:x+.11,y1:y+.11,z0:55,z1:56,foot:0,nb:1,c:IR}]);
  LAMPS.push({x,y,z:52,r:3.4,c:[.2,.15,.09],own:1,room:1,day:true,live:true,vr:true,prop:p}); return p; }

// =====================================================================================
// THE CRT DESK (owner, 13 Oct 2026: "a small crt monitor and keyboard and mouse on desk in middle of dark room and you go sit and
// play this game"; back in the desk room on the West End, 16 Oct 2026): a plain dark desk, a small black CRT on it, a keyboard and a mouse
// (its cord back to the monitor), and the chair in front (the studio's office chair, turned to the desk). Made with the screen on its +y
// side; the chair stands on that side. The monitor twice the size it was, its glass square (owner, 13 Oct 2026). The screen runs the
// drone link's attract mode (the security drones' feed, 47-west-desk-2-feed): DRONE / LINK in a tiny three-pixel font, START blinking,
// the scan band rolling, static while the drones' feeds cut over (FD.crt), each step's picture made once and kept, as the attic TV's game
// is. Its light: the screen's cold glow (the experimental mode's, on by day too); in the current mode it only glows. Sitting in its
// chair (its seat, 47-sit) flies the security drones (47-west-desk-1-room). Drawn by hand in code at twice the game's detail; in the
// catalog (Machines): the desk set and its chair.
// =====================================================================================
{ const FP=24, H=2, S=FP*H;                             // art px a tile along a face; fine pixels to an art pixel; fine pixels to a tile along a face
  const lit=c=>Object.assign([...c],{e:1});
  const tone=(c,k)=>!c?null:c.e||k===1?c:[Math.round(c[0]*k),Math.round(c[1]*k),Math.round(c[2]*k)];
  const fb=(x0,y0,x1,y1,z0,z1,c,f,top,o)=>sided({x0,y0,x1,y1,z0,z1,c,foot:0,...o,top:typeof top==='function'?top:()=>top===undefined?c:top,
    fs:(nx,ny,X,Y,z,k)=>{ const h=z1-z0, side=nx>0?'px':nx<0?'nx':ny>0?'py':'ny', a=nx>0?(y1-Y)*S:nx<0?(Y-y0)*S:ny>0?(X-x0)*S:(x1-X)*S;
      return tone(f(side,Math.floor(a),Math.floor((h-z)*H),Math.round((nx?y1-y0:x1-x0)*S),Math.round(h*H)),k); }});
  const C={top:[54,42,36],topL:[76,60,50],side:[40,31,27],sideD:[28,22,19],steel:[70,72,76],
    cas:[184,181,174],casL:[214,211,204],casD:[132,130,124],bez:[16,17,19],   /* (silver, as the owner's photo of the monitor: 13 Oct 2026) */ key:[50,50,55],keyL:[92,92,98],cord:[22,22,24],
    glass:[6,16,18],band:[12,30,32]};
  // the screen's tiny font: three pixels wide (I one), five high
  const F={D:['11.','1.1','1.1','1.1','11.'],E:['111','1..','11.','1..','111'],A:['.1.','1.1','111','1.1','1.1'],S:['.11','1..','.1.','..1','11.'],
    I:['1','1','1','1','1'],R:['11.','1.1','11.','1.1','1.1'],O:['.1.','1.1','1.1','1.1','.1.'],K:['1.1','1.1','11.','1.1','1.1'],C:['.11','1..','1..','1..','.11'],G:['.11','1..','1.1','1.1','.11'],N:['11.','1.1','1.1','1.1','1.1'],L:['1..','1..','1..','1..','111']};
  const RAMP=[[255,255,255],[85,255,255],[85,255,255],[0,170,170],[64,90,255]];
  const word=(w,a,r,top)=>{ const wide=[...w].reduce((t,ch)=>t+F[ch][0].length+1,-1); return (c0)=>{ let x=c0-Math.floor(wide/2); for(const ch of w){ const g=F[ch], gw=g[0].length;
      if(a>=x&&a<x+gw&&r>=top&&r<top+5&&g[r-top][a-x]==='1')return RAMP[r-top]; x+=gw+1; } return null; }; };
  // a screen pixel (a across, r down, w x h) at step f: the logo, START blinking, the scan band rolling down, the dark glass
  // (static, f 100 on: the security drones' feed cutting over, 47-west-desk-3-fight)
  function screen(a,r,w,h,f){ const cx=Math.floor(w/2), t0=Math.max(1,Math.floor(h*.12));
    if(f>=100){ const n=hash(a,r*7+f,709); return lit(n<.5?[Math.round(n*120),Math.round(n*130),Math.round(n*124)]:[Math.round(n*230),Math.round(n*236),Math.round(n*232)]); }
    const c=word('DRONE',a,r,t0)(cx)||word('LINK',a,r,t0+6)(cx); if(c)return lit(c);
    if(f%4<2&&r===h-4&&Math.abs(a-cx)<4)return lit([240,240,240]);                                    // START
    const band=Math.floor(f*h/8); if(r===band||r===(band+1)%h)return lit(C.band);
    return lit(r%2?C.glass:[8,20,22]); }
  function crtDesk(x,y){ SHARED.PNAME='crt desk'; const bs=[]; let cur=0;
    const X0=x-.78, X1=x+.78, Y0=y-.62, Y1=y+.35, Z=30;   // (deep enough for the monitor's tube: owner, 13 Oct 2026, "make crt monitor 2x bigger on table")
    // the desk: a top on two side panels and a modesty panel at the back
    bs.push(fb(X0,Y0,X1,Y1,Z-2,Z,C.top,(s,a,row)=>row<1?C.topL:C.side,(X,Y)=>{                         // its top: the mouse's cord lies on it
      const u=(X-x)*S, v=(Y-y)*S; if(Math.abs(Math.hypot(u-15,v-6)-9)<.7&&v<6&&u>6)return C.cord; return Math.min(X-X0,X1-X,Y-Y0,Y1-Y)<.03?C.topL:C.top; }));
    for(const [a0,a1] of [[X0+.02,X0+.08],[X1-.08,X1-.02]])bs.push(fb(a0,Y0+.03,a1,Y1-.03,0,Z-2,C.side,(s,a,row,L,h)=>row>h-3?C.sideD:C.side,C.side,{foot:1}));
    bs.push(fb(X0+.08,Y0+.04,X1-.08,Y0+.08,8,Z-2,C.sideD,()=>C.sideD,C.side));
    // the monitor: its foot, its case (the screen on the +y face), the hump of its tube behind
    // twice the size it was (owner, 13 Oct 2026), its glass square ("SQUARE resolution ... not 9:16"): as tall as it is wide, the bezel wider at the sides
    const mx0=x-.5, mx1=x+.5, my0=y-.24, my1=y+.12, mz=Z+1, mh=28, w=Math.round((mx1-mx0)*S), h=mh*H, q=h-12, l0=Math.floor((w-q)/2);
    const pix=(a,r,f)=>a<l0||r<4||a>=l0+q||r>=4+q?null:screen(a-l0,r-4,q,q,f);
    bs.push(fb(x-.24,y-.2,x+.24,y+.06,Z,mz,C.casD,()=>C.casD,C.cas));
    bs.push(fb(mx0,my0,mx1,my1,mz,mz+mh,C.cas,(s,a,row,L,hh)=>{ const scr=s==='py'?pix(a,row,cur):null;
        if(LIFE.mode===1){ if(!scr)return null; const c0=pix(a,row,0); return c0&&c0[0]===scr[0]&&c0[1]===scr[1]&&c0[2]===scr[2]?null:scr; }
        if(s==='py'){ const c=pix(a,row,0); if(c)return c; if(a<2||row<2||a>=L-2||row>=hh-5)return row<1?C.casL:C.cas; if(row>=hh-4&&a>L-7&&a<L-4)return lit([90,255,120]); return a>=l0-2&&a<l0+q+2&&row>=2&&row<q+6?C.bez:C.cas; }   // (a thin black frame round the glass, silver past it)   // the bezel, the power light
        return row<1?C.casL:row>hh-2?C.casD:C.cas; },(X,Y)=>Math.min(X-mx0,mx1-X,Y-my0,my1-Y)<.02?C.casL:C.cas,{life:1}));
    bs.push(fb(x-.36,y-.6,x+.36,my0,mz+4,mz+mh-4,C.casD,(s,a,row)=>row<1?C.cas:C.casD,C.cas));
    // the keyboard: rows of keys on its top; the mouse to its right
    bs.push(fb(x-.24,y+.16,x+.18,y+.3,Z,Z+1,C.key,(s,a,row)=>row<1?C.keyL:C.casD,(X,Y)=>{ const u=Math.floor((X-x+.24)*S), v=Math.floor((Y-y-.16)*S);
      return u<1||v<1||u>=Math.floor(.42*S)-1||v>=Math.floor(.14*S)-1?C.casD:(u%3<2&&v%3<2)?C.keyL:C.key; }));
    bs.push(fb(x+.26,y+.17,x+.31,y+.26,Z,Z+1,C.key,(s,a,row)=>row<1?C.keyL:C.casD,(X,Y)=>(Y-y-.17)*S<2?C.keyL:C.key));
    const p=prop(bs,null,{life:t=>{ cur=typeof FD!=='undefined'&&FD.crt?100+Math.floor(t*12)%6:Math.floor(t*4)%8; },lifeKey:()=>cur});
    LAMPS.push({own:1,room:1,day:true,live:true,x,y:y+.6,z:Z+14,r:4,c:[.42,.82,1],prop:p}); return p; }
  // its chair: the studio's office chair, its front to the desk (-y), and a seat in it (47-sit: where you sit, how high, the way you face,
  // where you stand to get in and out): sitting in it is sitting at the CRT
  function crtChair(x,y){ STUDIO.face([0,-1]); let p; try{ p=CATALOG['office chair'](x,y); }finally{ STUDIO.face(null); } p.seats=[{x,y,z:22,f:[0,-1],stand:[x,y+.6]}]; return p; }
  CATALOG['crt desk']=(x,y)=>crtDesk(x,y);
  CATALOG['corner street lamp']=(x,y)=>wdeskLamp(x,y); KIND_OF['corner street lamp']='corner street lamp';
  CATALOG['crt desk chair']=(x,y)=>crtChair(x,y);                                   // (kept apart from the studio's chair, so the drones are only here)
  CAT_INFO['crt desk']={no:'M-605',name:'CRT Desk',dept:'mach',price:0,desc:'A big black monitor, a keyboard and a mouse on a dark desk. The screen says DRONE LINK.',mat:'wood, plastic, glass'};
  CAT_INFO['crt desk chair']={no:'M-606',name:'CRT Desk Chair',dept:'mach',price:0,desc:'Sit down and the screen is all there is.',mat:'steel, cloth'};
  KIND_OF['crt desk']='crt desk'; KIND_OF['crt desk chair']='crt desk chair';
  if(!CAT_DEPTS.some(d=>d[0]==='mach'))CAT_DEPTS.push(['mach','Machines']); }   // ([key, name]: the book reads pairs, 50-menu-2)

};
export {westDesk};
