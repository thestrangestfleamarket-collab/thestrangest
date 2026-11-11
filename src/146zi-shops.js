// THE SMALL SHOPS' NAMES: the Boardwright's, FIX-IT's and the Scanner's goods, kept so old saves still name them (the shops themselves are archived).
import {FORAGE} from './003b-systems.js';
{ FORAGE.add({names:{fix_parts:'A BAG OF SCREWS AND PARTS',junk_walkman:'A BROKEN POCKET CASSETTE',junk_handheld:'A BROKEN HANDHELD GAME',junk_pockettv:'A BROKEN POCKET TV',walkman:'A POCKET CASSETTE',handheld:'A HANDHELD GAME',pockettv:'A POCKET TV'}});
  FORAGE.BUYK.electronics=['walkman','handheld','pockettv']; if(FORAGE.sell)FORAGE.sell('walkman','handheld','pockettv');
}
