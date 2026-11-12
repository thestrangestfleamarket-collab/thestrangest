// YOUR HALL, FURNISHED: a bank of mailboxes by the elevator (yours opens the letters waiting for you) and the building's notice board.
import {TENANTS} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {STORE} from './006-map-pre.js';
import {MINI} from './038zd-mini.js';
const HALLK={}; window.HALLK=HALLK;
{ const say=(t,c)=>SAY(t,c||'#f2c14e');
  HALLK.mail=async()=>{ let n=0; try{ n=TENANTS.letters?await TENANTS.letters():0; }catch(e){ n=0; } HALLK.opened=(HALLK.opened||0)+1; if(!n)say('YOUR MAILBOX IS EMPTY.','#c8c0b0'); return n; };
  const NOTES=[['QUIET AFTER ELEVEN','THE WALLS ARE THIN'],['LETTERS COME HERE','YOUR BOX IS BY YOUR DOOR'],['THE CALLBOX','RING A NEIGHBOUR TO BE LET IN'],['LOST: A KEY','ASK AT THE BODEGA'],['NO BIKES ON THE STOOP','THE SUPER MEANS IT']];
  HALLK.notices=()=>MINI.look('THE NOTICE BOARD',(g,w,h)=>{ g.fillStyle='#a8844a'; g.fillRect(0,0,w,h); NOTES.forEach(([a,b],i)=>{ const x=12+(i%3)*(w-24)/3, y=14+Math.floor(i/3)*(h-28)/2, nw=(w-24)/3-10, nh=(h-28)/2-10;
    g.fillStyle=['#f4f0e0','#f0e080','#a0d0f0'][i%3]; g.fillRect(x,y,nw,nh); g.fillStyle='#c02028'; g.beginPath(); g.arc(x+nw/2,y+6,4,0,7); g.fill(); g.fillStyle='#2a2a32'; g.textAlign='center'; g.textBaseline='top'; g.font='bold 11px monospace'; g.fillText(a,x+nw/2,y+22); g.font='10px monospace'; g.fillText(b,x+nw/2,y+42); }); });
  STORE.furnish=STORE.furnish||{};
  STORE.furnish.hall=c=>{ '@apts'; const {box,hitAt,mat,v1,EW,us}=c, brass=mat([176,140,60]), dark=mat([60,48,30]), cork=mat([176,136,80]), paper=mat([240,236,224]);
    // the mailboxes on the back wall by the elevator: a brass bank of little doors
    const m0=EW+.6, m1=EW+1.8; box(m0,v1-.1,m1,v1,1.0,1.5,brass); for(let i=0;i<4;i++)for(let j=0;j<2;j++)box(m0+.06+i*.29,v1-.11,m0+.3+i*.29,v1-.1,1.06+j*.22,1.24+j*.22,dark);
    hitAt((m0+m1)/2,1.25,v1-.3,1.2,.7,.5,'YOUR MAILBOX',HALLK.mail);
    // the notice board halfway down the hall
    const nc=c.nc??(EW+us)/2+.8, ny=c.ny||0; box(nc-.6,v1-.04,nc+.6,v1,1.3+ny,2.0+ny,cork); for(let i=0;i<6;i++)box(nc-.52+(i%3)*.36,v1-.05,nc-.24+(i%3)*.36,v1-.04,1.38+ny+Math.floor(i/3)*.3,1.62+ny+Math.floor(i/3)*.3,paper);
    hitAt(nc,1.65+ny,v1-.3,1.2,.8,.5,'THE NOTICE BOARD',HALLK.notices); };
}
