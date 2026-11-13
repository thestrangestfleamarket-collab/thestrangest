// THE COMPUTER AT HOME: the beige home computer on its desk in your flat; double-click it for the BBS (the bodega, furniture, the arcade, your orders) (owner, 13 Nov 2026)
import {DRONE} from './003b-systems.js';
import {FIXIT} from './146l-fixer.js';
import {ROOMK} from './150a-bedroom.js';
{ ROOMK.parts.push(c=>{ '@apts'; const {R}=c, S=FIXIT.SETS&&FIXIT.SETS.pc_home; if(!S||R.kinds['HOME COMPUTER'])return;
    const D={kind:'HOME COMPUTER',name:'HOME COMPUTER',loose:false,m:0,wire:'bbs',sol:[],shf:[],dept:'electronics',deptName:'ELECTRONICS'};
    Object.defineProperty(D,'tpl',{configurable:true,enumerable:true,get(){ const t=S.make(); Object.defineProperty(D,'tpl',{value:t,enumerable:true}); return t; }}); R.kinds['HOME COMPUTER']=D; });
  ROOMK.wires.bbs=(un,c)=>{ '@later'; c.hit(un,()=>'THE COMPUTER',()=>DRONE.open()); }; }
