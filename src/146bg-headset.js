// THE VR HEADSET: every player has one; use it anywhere and it lists the holodeck's programs, each run as at the booth: a page of its own, the market left behind
import {FORAGE, INV} from './003b-systems.js';
import {STORE, SYS} from './006-map-pre.js';
{ const ID='vr_headset', H=STORE.holo;
  FORAGE.add({names:{[ID]:'VR HEADSET'},prices:{[ID]:0}});
  // given once to everyone, new and old, kept with the account
  SYS.onStart(()=>{ const S=FORAGE.S; if(!S||S.vrset1)return; INV.items[ID]=Math.max(INV.items[ID]||0,1); S.vrset1=1; if(INV.save)INV.save(); if(FORAGE.save)FORAGE.save(); },'146bg-headset');
  FORAGE.ACT[ID]=()=>H.menu(true); }
