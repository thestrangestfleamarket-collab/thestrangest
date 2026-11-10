// THE BROCHURES: the folded leaflets in the street racks (world.json racks), one for each thing to do, each printed in its own style: buy one at a rack, read it from your pack, START takes you there and lends what it needs; a full set pays once.
import {SHARED, THREE} from './003-shx.js';
import {EQUIP, FORAGE, INSPECT, INV, pos, SFX, TEXT, UI, WIELD} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {OWNED} from './005-save.js';
import {FADE, FIX, LEVEL, MAPG, SOL, STORE, SYS, TILE} from './006-map-pre.js';
import {PIER} from './066b-pier.js';
import {WRECK} from './066ba-wreck.js';
const BROCH={}; window.BROCH=BROCH;
{ const T=TILE, M=T/.84, esc=TEXT.esc, KEY='broch', PRE='bq_', say=(t,c)=>SAY(t,c||'#e8d6a8');
  const DATA=__LAZY__("data/brochures.json");
  // each: its name in your pack, the rack's two colours for it, its four photographs (cover, two inside, the place from the street)
  const B={
    wreck:['DIVE THE PIRATE WRECK','#063a4c','#ffe14a',[__FILE__("data/brochures/wreck-0.jpg"),__FILE__("data/brochures/wreck-1.jpg"),__FILE__("data/brochures/wreck-2.jpg"),__FILE__("data/brochures/wreck-3.jpg")]],
    fish:['THE FISH ARE BITING','#bfe3df','#16233f',[__FILE__("data/brochures/fish-0.jpg"),__FILE__("data/brochures/fish-1.jpg"),__FILE__("data/brochures/fish-2.jpg"),__FILE__("data/brochures/fish-3.jpg")]],
    pets:['A FRIEND FOR LIFE','#ffd23f','#ff3d7f',[__FILE__("data/brochures/pets-0.jpg"),__FILE__("data/brochures/pets-1.jpg"),__FILE__("data/brochures/pets-2.jpg"),__FILE__("data/brochures/pets-3.jpg")]],
    nature:['BIRDS & BUTTERFLIES','#111111','#f4f1e6',[__FILE__("data/brochures/nature-0.jpg"),__FILE__("data/brochures/nature-1.jpg"),__FILE__("data/brochures/nature-2.jpg"),__FILE__("data/brochures/nature-3.jpg")]],
    shroom:['EAT ONE AND FLY','#7a1fd1','#ffe14a',[__FILE__("data/brochures/shroom-0.jpg"),__FILE__("data/brochures/shroom-1.jpg"),__FILE__("data/brochures/shroom-2.jpg"),__FILE__("data/brochures/shroom-3.jpg")]],
    bees:['PARK HONEY','#f6d77a','#2b1a05',[__FILE__("data/brochures/bees-0.jpg"),__FILE__("data/brochures/bees-1.jpg"),__FILE__("data/brochures/bees-2.jpg"),__FILE__("data/brochures/bees-3.jpg")]],
    art:['THE ART MUSEUM','#ffffff','#d0021b',[__FILE__("data/brochures/art-0.jpg"),__FILE__("data/brochures/art-1.jpg"),__FILE__("data/brochures/art-2.jpg"),__FILE__("data/brochures/art-3.jpg")]],
    books:['BOOKS, A TABLE & A GAME','#23302b','#f4f4ea',[__FILE__("data/brochures/books-0.jpg"),__FILE__("data/brochures/books-1.jpg"),__FILE__("data/brochures/books-2.jpg"),__FILE__("data/brochures/books-3.jpg")]],
    arcade:['THE ARCADE','#0a0618','#ff2bd6',[__FILE__("data/brochures/arcade-0.jpg"),__FILE__("data/brochures/arcade-1.jpg"),__FILE__("data/brochures/arcade-2.jpg"),__FILE__("data/brochures/arcade-3.jpg")]],
    music:['PLAY SOMETHING','#e3b23c','#111111',[__FILE__("data/brochures/music-0.jpg"),__FILE__("data/brochures/music-1.jpg"),__FILE__("data/brochures/music-2.jpg"),__FILE__("data/brochures/music-3.jpg")]],
    stars:['THE SKY TONIGHT','#0b1230','#ffd46b',[__FILE__("data/brochures/stars-0.jpg"),__FILE__("data/brochures/stars-1.jpg"),__FILE__("data/brochures/stars-2.jpg"),__FILE__("data/brochures/stars-3.jpg")]],
    gems:['TEN STONES','#0d0d10','#d4af37',[__FILE__("data/brochures/gems-0.jpg"),__FILE__("data/brochures/gems-1.jpg"),__FILE__("data/brochures/gems-2.jpg"),__FILE__("data/brochures/gems-3.jpg")]]};
  const IDS=Object.keys(B), PRICE=2, FULL=50;
  const S={v:1,got:{},paid:0}; try{ const D=JSON.parse(OWNED.get(KEY)||'null'); if(D&&D.v===1)Object.assign(S,D); }catch(e){} const save=()=>{ try{ OWNED.set(KEY,JSON.stringify(S)); }catch(e){} };
  FORAGE.add({names:Object.fromEntries(IDS.map(id=>[PRE+id,'BROCHURE: '+B[id][0]]))});
  INSPECT.kinds.push({is:id=>id.startsWith(PRE)&&!!B[id.slice(PRE.length)],make:id=>{ const b=B[id.slice(PRE.length)], c1=parseInt(b[1].slice(1),16), c2=parseInt(b[2].slice(1),16), P=INSPECT.part, o={kind:'paper'}, g=new THREE.Group();   // its 3D model: a folded leaflet in its rack's two colours
    g.add(P('box',c1,0,.006,0,.1,.012,.21,0,0,0,o),P('box',c2,0,.0125,-.075,.1,.001,.05,0,0,0,o),P('box',c2,0,.0125,.045,.07,.001,.07,0,0,0,o)); return g; }});
  FORAGE.ROWB.push(id=>id.startsWith(PRE)&&B[id.slice(PRE.length)]?[['READ','bqread']]:[]); FORAGE.ACT.bqread=id=>BROCH.read(id.slice(PRE.length));
  const have=id=>(FORAGE.has(PRE+id)||0)>0, count=()=>IDS.filter(id=>S.got[id]).length;
  const LOOK=()=>{ '@brochures';
    const HAND="'Marker Felt','Segoe Print','Bradley Hand','Comic Sans MS',cursive", IMP="Impact,Haettenschweiler,'Arial Narrow Bold','Arial Narrow',sans-serif", HEL="'Helvetica Neue',Helvetica,Arial,sans-serif", GEO="Georgia,'Times New Roman',serif",
      DID="Didot,'Bodoni MT','Bodoni 72','Playfair Display',Georgia,serif", RND="'Arial Rounded MT Bold','Trebuchet MS',Verdana,sans-serif", COO="'Cooper Black','Bookman Old Style',Georgia,serif", FUT="Futura,'Century Gothic','Trebuchet MS',sans-serif",
      PAL="'Palatino Linotype',Palatino,'Book Antiqua',Georgia,serif", BLK="'Old English Text MT','Luminari','Palatino Linotype',Palatino,serif", MON="'Courier New',Courier,monospace", PIX="Silkscreen,'Courier New',monospace";
    const css=`
.bqp{width:300px;height:620px;position:relative;overflow:hidden;box-sizing:border-box;padding:18px 18px 26px;flex:none;font:12.6px/1.42 ${HEL};text-align:left;letter-spacing:0;display:flex;flex-direction:column;gap:7px}
.bqp *{box-sizing:border-box;margin:0}.bqp .ph{display:block;width:100%;height:138px;object-fit:cover;image-rendering:pixelated;flex:none}
.bqp h3{font-size:15px;line-height:1.1}.bqp ul,.bqp ol{padding:0;list-style:none;display:flex;flex-direction:column;gap:5px}.bqp ol{counter-reset:n}.bqp ol li{counter-increment:n}
.bqp table{border-collapse:collapse;width:100%;color:inherit;font:inherit}.bqp td{padding:2px 0;vertical-align:top}.bqp td+td{text-align:right;white-space:nowrap;padding-left:8px;font-variant-numeric:tabular-nums}
.bqp .go{display:block;width:100%;border:0;cursor:pointer;font:inherit;padding:9px;margin-top:auto;margin-bottom:8px}.bqp .go:focus-visible{outline:3px solid #f2c14e;outline-offset:2px}
.bqp .foot,.bqp .no{position:absolute;left:18px;right:18px;bottom:10px;font-size:8.5px;letter-spacing:1.5px;text-transform:uppercase;opacity:.75}
.bqp.in+.bqp.in::before{content:"";position:absolute;left:0;top:0;bottom:0;width:14px;background:linear-gradient(90deg,#0003,#0000);pointer-events:none;z-index:5}
.bqp.cv{cursor:pointer}.bqp.cv>.k,.bqp.cv>.t,.bqp.cv>.s,.bqp.cv>.ph{position:relative;z-index:2}.bqp .no{z-index:3}.bqp .t span{display:block}.bqp .burst small,.bqp .burst b{display:block}.bqp .s{white-space:pre-line}

.s-gloss{background:#fffdf4;color:#222;padding:0 0 18px}.s-gloss.in>*{margin-left:16px;margin-right:16px}.s-gloss.in>table,.s-gloss.in>.go{width:268px}.s-gloss.in>h3,.s-gloss.in>.ph{margin-left:0;margin-right:0}
.s-gloss.cv{background:#063a4c;padding:18px}.s-gloss.cv .ph{position:absolute!important;z-index:0!important;inset:0;height:100%;filter:saturate(1.6) contrast(1.2) brightness(1.1)}.s-gloss.cv::after{content:"";position:absolute;inset:0;background:linear-gradient(#042531aa,#063a4c00 45%,#042531f2 82%)}
.s-gloss .k{font:italic 44px/0.9 'Brush Script MT','Snell Roundhand','Segoe Script',cursive;color:#ffe14a;text-shadow:2px 2px 0 #d4372c,4px 4px 0 #0006}
.s-gloss .t{font:52px/0.92 ${IMP};color:#fff;text-transform:uppercase;letter-spacing:1px;text-shadow:3px 3px 0 #0007}.s-gloss .s{position:absolute!important;left:18px;right:18px;bottom:30px;color:#fff;font:700 12px ${HEL};letter-spacing:1px}
.s-gloss .burst{z-index:3;position:absolute!important;right:12px;top:260px;width:100px;height:100px;background:#d4372c;color:#fff;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;transform:rotate(12deg);box-shadow:0 0 0 4px #ffe14a;text-align:center;font:9px ${HEL};letter-spacing:1px}.s-gloss .burst b{font:24px/1 ${IMP}}
.s-gloss .no{color:#fff;z-index:2}.s-gloss h3{background:#d4372c;color:#ffe14a;font:21px/1 ${IMP};letter-spacing:1px;padding:10px 16px}.s-gloss.in .ph{filter:saturate(1.5) brightness(1.3);border-bottom:5px solid #ffe14a}
.s-gloss li{padding-left:24px;position:relative}.s-gloss ul li::before{content:"★";position:absolute;left:3px;color:#d4372c}.s-gloss ol li::before{content:counter(n);position:absolute;left:2px;top:-1px;font:18px/1 ${IMP};color:#d4372c}
.s-gloss table{background:#063a4c;color:#fff}.s-gloss td{padding:4px 10px;border-bottom:1px dotted #fff6}.s-gloss .go{background:#ffe14a;color:#063a4c;font:17px ${IMP};letter-spacing:1px}.s-gloss .foot{text-align:center;color:#555}

.s-xerox{background:#bfe3df;color:#16233f;font:11.8px/1.42 ${MON}}.s-xerox .k{font-size:10px}.s-xerox .t{font:31px/1 ${HAND};transform:rotate(-2deg);margin:4px 0}
.s-xerox h3{font:18px/1 ${HAND};text-decoration:underline;transform:rotate(-1deg)}.s-xerox .ph{filter:grayscale(1) brightness(1.7) contrast(1.35);border:2px solid #16233f;transform:rotate(.6deg);mix-blend-mode:multiply}.s-xerox.cv .ph{height:200px;order:3}
.s-xerox .k{order:1}.s-xerox .t{order:2}.s-xerox .s{order:4}.s-xerox .burst{order:5;font:15px/1.15 ${HAND};transform:rotate(-4deg);margin-top:10px;align-self:flex-end;border:2px solid;border-radius:50%;padding:10px 14px;text-align:center}
.s-xerox ol li::before{content:counter(n) ". "}.s-xerox td{border-bottom:1px dashed #16233f}.s-xerox .go{background:none;border:2px dashed #16233f;color:#16233f;font:15px ${HAND}}.s-xerox .foot{font-family:${MON};letter-spacing:0;text-transform:none;font-size:9.5px}

.s-pets{background:#fff6d8;color:#3a2a4a;font:12.4px/1.4 ${RND}}.s-pets.cv{background:#ffd23f radial-gradient(#fff6 18%,#0000 19%) 0 0/26px 26px;align-items:center;text-align:center}
.s-pets.cv .ph{width:216px;height:216px;border-radius:50%;border:8px solid #fff;order:3;box-shadow:0 5px 0 #e0a800}.s-pets .k{order:1;font-size:10.5px;letter-spacing:1px;background:#35b6e6;color:#fff;padding:4px 10px;border-radius:20px}
.s-pets .t{order:2;font:900 43px/0.95 ${RND};color:#ff3d7f;text-shadow:2px 2px 0 #fff,4px 4px 0 #0002}.s-pets .s{order:4;font-size:14px}.s-pets .burst{position:absolute;right:14px;top:250px;width:78px;height:78px;border-radius:50%;background:#35b6e6;color:#fff;display:flex;flex-direction:column;justify-content:center;text-align:center;transform:rotate(-10deg);border:4px solid #fff;font-size:10px}.s-pets .burst b{font-size:22px}
.s-pets h3{align-self:flex-start;background:#ff3d7f;color:#fff;padding:6px 14px;border-radius:20px;font-size:14px}.s-pets.in .ph{border-radius:18px;border:4px solid #ffd23f}
.s-pets li{padding-left:22px;position:relative}.s-pets ul li::before{content:"♥";position:absolute;left:3px;color:#ff3d7f}.s-pets ol li::before{content:counter(n);position:absolute;left:0;top:1px;width:16px;height:16px;border-radius:50%;background:#35b6e6;color:#fff;font-size:10px;line-height:16px;text-align:center}
.s-pets tr:nth-child(odd){background:#ffe9a0}.s-pets td{padding:2px 8px}.s-pets .go{background:#35b6e6;color:#fff;border-radius:22px;font:900 14px ${RND}}.s-pets .foot{text-align:center}

.s-park{background:#f4f1e6;color:#1c1c1c;font:12.6px/1.45 ${GEO};padding-top:38px}.s-park::before{content:"";position:absolute;left:0;right:0;top:0;height:26px;background:#111}
.s-park.cv{padding-top:0}.s-park.cv::before{height:118px}.s-park .k{order:1;color:#fff;font:700 10px ${HEL};letter-spacing:2px;text-transform:uppercase;margin-top:16px}.s-park .t{order:2;color:#fff;font:700 31px/1 ${HEL};letter-spacing:-.5px;height:66px}
.s-park.cv .ph{order:3;height:300px;margin:6px 0 0;width:300px;margin-left:-18px;max-width:none}.s-park .s{order:4;font-style:italic;font-size:13px;border-top:3px solid #2f5d3a;padding-top:8px;margin-top:6px}
.s-park h3{font:700 15px ${HEL};border-bottom:1px solid #1c1c1c;padding-bottom:4px}.s-park ol li{padding-left:18px;position:relative}.s-park ol li::before{content:counter(n);position:absolute;left:0;font:700 11px ${HEL};color:#2f5d3a}
.s-park td{border-bottom:1px solid #1c1c1c33;font-family:${HEL};font-size:11px}.s-park .go{background:#111;color:#fff;font:700 11px ${HEL};letter-spacing:2px}.s-park .foot{font-family:${HEL}}

.s-psych{background:#2a0845;color:#ffe9a8;font:12.4px/1.4 ${GEO}}.s-psych.cv{background:repeating-radial-gradient(circle at 50% 46%,#ff7a00 0 16px,#ff2e88 16px 32px,#7a1fd1 32px 48px,#2a0845 48px 64px);align-items:center;text-align:center}
.s-psych.cv .ph{order:3;width:210px;height:230px;border-radius:46% 54% 60% 40%/50% 45% 55% 50%;border:5px solid #ffe14a;filter:saturate(1.7) hue-rotate(-12deg)}
.s-psych .k{order:1;font:italic 13px ${COO};background:#2a0845;padding:3px 12px;border-radius:14px}.s-psych .t{order:2;font:italic 900 44px/0.95 ${COO};color:#ffe14a;text-shadow:2px 2px 0 #ff2e88,4px 4px 0 #7a1fd1,6px 6px 0 #2a0845;transform:rotate(-4deg)}
.s-psych .s{order:4;background:#2a0845;padding:6px 10px;border-radius:14px;font-style:italic}.s-psych h3{font:italic 900 19px ${COO};color:#ffe14a;text-shadow:2px 2px 0 #ff2e88}
.s-psych.in .ph{border-radius:30px 8px 30px 8px;border:3px solid #ff7a00;filter:saturate(1.6)}.s-psych li{padding-left:18px;position:relative}.s-psych ul li::before{content:"✿";position:absolute;left:0;color:#ff7a00}.s-psych ol li::before{content:counter(n);position:absolute;left:0;font:italic 900 14px ${COO};color:#ff2e88;top:-2px}
.s-psych td{border-bottom:1px dotted #ff2e88;font-size:11px}.s-psych td+td{color:#ffe14a}.s-psych .go{background:#ff7a00;color:#2a0845;border-radius:22px;font:italic 900 15px ${COO}}.s-psych .no{color:#ffe9a8;background:#2a0845;left:auto;right:10px;padding:2px 8px;border-radius:10px;opacity:1}

.s-honey{background:#fbf0c9;color:#2b1a05;font:13px/1.45 ${GEO};text-align:center}.s-honey::after{content:"";position:absolute;inset:8px;border:3px double #b87400;pointer-events:none}
.s-honey.cv{align-items:center;justify-content:center;gap:10px;background:#f6d77a}.s-honey .k{order:1;font:italic 13px ${GEO}}.s-honey .t{order:2;font:50px/0.95 ${DID};letter-spacing:5px;text-transform:uppercase;border-top:1px solid;border-bottom:1px solid;padding:8px 0}
.s-honey.cv .ph{order:3;width:210px;height:236px;clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%);filter:sepia(.5) saturate(1.3)}.s-honey .s{order:4;font-style:italic;max-width:210px}
.s-honey h3{font:400 15px ${DID};letter-spacing:3px;text-transform:uppercase;border-top:1px solid;border-bottom:1px solid;padding:5px 0;margin:4px 14px 0}.s-honey.in .ph{border:3px double #b87400;filter:sepia(.35) saturate(1.2)}
.s-honey ol{text-align:left;padding:0 4px}.s-honey ol li{padding-left:20px;position:relative}.s-honey ol li::before{content:counter(n);position:absolute;left:2px;font:italic 14px ${DID};color:#b87400;top:-2px}
.s-honey td{border-bottom:1px dotted #2b1a05}.s-honey .go{background:#2b1a05;color:#f6d77a;font:13px ${DID};letter-spacing:3px}.s-honey .foot,.s-honey .no{bottom:16px}

.s-museum{background:#fff;color:#111;font:300 12.4px/1.6 ${HEL};padding:26px 24px 18px}.s-museum.cv::before{content:"";position:absolute;left:24px;top:26px;width:26px;height:26px;background:#d0021b}
.s-museum.cv{justify-content:flex-end;padding-bottom:44px}.s-museum.cv .ph{order:1;height:236px;margin-bottom:22px}.s-museum .ph{filter:brightness(1.15)}.s-museum .k{order:2;font-size:9px;letter-spacing:3px;text-transform:uppercase}.s-museum .t{order:3;font:400 44px/1 ${DID}}.s-museum .s{order:4;font-size:11px;letter-spacing:.5px}
.s-museum h3{font:400 9.5px ${HEL};letter-spacing:3px;text-transform:uppercase;padding-top:9px;position:relative}.s-museum h3::before{content:"";position:absolute;left:0;top:0;width:22px;height:2px;background:#d0021b}
.s-museum ol li{padding-left:18px;position:relative}.s-museum ol li::before{content:counter(n);position:absolute;left:0;color:#d0021b}.s-museum td{border-bottom:1px solid #1112}.s-museum .go{background:none;border:1px solid #111;color:#111;letter-spacing:3px;font-size:10px}.s-museum .foot,.s-museum .no{left:24px}

.s-cafe{background:#c9a977;color:#3b2414;font:12.8px/1.42 ${GEO}}.s-cafe.cv{padding:0 18px 18px;align-items:center}.s-cafe.cv::before{content:"";position:absolute;left:0;right:0;top:0;height:250px;background:#23302b;box-shadow:inset 0 0 0 7px #6b4a2b}
.s-cafe .k{order:1;color:#d9e6dc;font:11px ${GEO};letter-spacing:3px;text-transform:uppercase;margin-top:30px}.s-cafe .t{order:2;color:#f4f4ea;font:40px/1.05 ${HAND};text-align:center;height:172px;display:flex;flex-direction:column;justify-content:center}
.s-cafe.cv .ph{order:3;width:232px;height:176px;border:8px solid #fbf6ea;transform:rotate(-2.5deg);box-shadow:3px 5px 0 #0003;filter:sepia(.25) brightness(1.45)}.s-cafe .s{order:4;font-style:italic;font-size:14px;text-align:center;margin-top:8px}
.s-cafe h3{background:#23302b;color:#f4f4ea;font:17px ${HAND};padding:6px 10px;align-self:flex-start;transform:rotate(-1deg)}.s-cafe.in .ph{border:6px solid #fbf6ea;filter:sepia(.25) brightness(1.45)}
.s-cafe ol li{padding-left:18px;position:relative}.s-cafe ol li::before{content:counter(n) ".";position:absolute;left:0;font-style:italic}.s-cafe td{border-bottom:2px dotted #3b2414}.s-cafe .go{background:#23302b;color:#f4f4ea;font:16px ${HAND}}

.s-neon{background:#0a0618;color:#d8f6ff;font:12px/1.45 ${MON}}.s-neon::after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(#0000 0 2px,#0003 2px 3px);pointer-events:none}
.s-neon.cv{background:linear-gradient(#0a0618 55%,#3a0a5c);align-items:center;text-align:center}.s-neon.cv::before{content:"";position:absolute;left:-60%;right:-60%;bottom:0;height:150px;background:repeating-linear-gradient(90deg,#ff2bd6 0 2px,#0000 2px 34px),repeating-linear-gradient(#ff2bd6 0 2px,#0000 2px 22px);transform:perspective(160px) rotateX(58deg);transform-origin:50% 100%;opacity:.8}
.s-neon .k{order:1;font:10px ${PIX};color:#29f0ff;letter-spacing:3px}.s-neon .t{order:2;font:46px/1.05 ${PIX};color:#ff2bd6;text-shadow:0 0 8px #ff2bd6,3px 3px 0 #29f0ff}
.s-neon.cv .ph{order:3;height:190px;border:2px solid #29f0ff;box-shadow:0 0 14px #29f0ff}.s-neon .s{order:4;font:9px ${PIX};color:#ffe14a;letter-spacing:1px}
.s-neon .burst{order:5;font:11px ${PIX};color:#0a0618;background:#ffe14a;padding:6px 12px;transform:rotate(-6deg);box-shadow:0 0 12px #ffe14a}.s-neon .burst small,.s-neon .burst b{display:inline;font-size:11px;font-weight:400}.s-neon .burst small::after{content:" "}.s-neon.in .go{margin-bottom:14px}
.s-neon h3{font:14px ${PIX};color:#29f0ff;text-shadow:0 0 8px #29f0ff}.s-neon.in .ph{border:2px solid #ff2bd6;box-shadow:0 0 10px #ff2bd6}.s-neon li{padding-left:18px;position:relative}.s-neon ul li::before{content:"►";position:absolute;left:0;color:#ff2bd6;font-size:9px;top:2px}.s-neon ol li::before{content:counter(n);position:absolute;left:0;color:#ffe14a;font-family:${PIX}}
.s-neon td{border-bottom:1px solid #29f0ff55}.s-neon td+td{color:#ffe14a}.s-neon .go{background:#ff2bd6;color:#fff;font:12px ${PIX};box-shadow:0 0 12px #ff2bd6}.s-neon .no,.s-neon .foot{color:#29f0ff;z-index:2}

.s-gig{background:#e3b23c;color:#111;font:13.5px/1.35 'Arial Narrow',Arial,sans-serif}.s-gig.cv{padding:0 14px 14px;gap:0}.s-gig .k{order:1;background:#111;color:#e3b23c;font:700 10px ${HEL};letter-spacing:2px;text-transform:uppercase;padding:6px 14px;margin:0 -14px 6px}
.s-gig .t{order:2;font:86px/0.88 ${IMP};letter-spacing:-1px;white-space:nowrap}.s-gig .t span:nth-child(2){color:#c1272d}.s-gig.cv .ph{order:3;height:168px;filter:grayscale(1) brightness(1.8) contrast(1.25);mix-blend-mode:multiply;margin-top:8px}
.s-gig .s{order:4;font:700 11px ${HEL};letter-spacing:2px;padding:12px 0;background:repeating-linear-gradient(#0000 0 6px,#111 6px 7px) 0 3px/100% 36px no-repeat;text-align:center;margin-top:6px}
.s-gig h3{font:28px/1 ${IMP};border-bottom:6px solid #111;padding-bottom:3px}.s-gig.in .ph{filter:grayscale(1) brightness(1.8) contrast(1.25);mix-blend-mode:multiply}.s-gig ol li{padding-left:22px;position:relative}.s-gig ol li::before{content:counter(n);position:absolute;left:0;top:-3px;font:20px ${IMP};color:#c1272d}
.s-gig td{border-bottom:3px solid #111;font:700 12px ${HEL};padding:4px 0}.s-gig .go{background:#111;color:#e3b23c;font:20px ${IMP};letter-spacing:1px}

.s-observ{background:#0b1230 radial-gradient(#ffffff55 0 .8px,#0000 1.2px) 0 0/71px 83px;color:#cfd8ff;font:12.4px/1.5 ${FUT}}.s-observ.cv{align-items:center;text-align:center;justify-content:center;gap:12px;background:#0b1230 radial-gradient(#ffffff55 0 .8px,#0000 1.2px) 0 0/71px 83px}
.s-observ.cv::before{content:"";position:absolute;left:50%;top:50%;width:420px;height:420px;margin:-225px 0 0 -210px;border:1px solid #ffd46b55;border-radius:50%;outline:1px solid #ffd46b2a;outline-offset:46px}
.s-observ .k{order:1;font:10px ${MON};letter-spacing:3px;text-transform:uppercase;color:#ffd46b}.s-observ .t{order:2;font:300 38px/1.05 ${FUT};letter-spacing:6px}
.s-observ.cv .ph{order:3;width:220px;height:220px;border-radius:50%;border:1px solid #ffd46b;box-shadow:0 0 0 8px #0b1230,0 0 0 9px #ffd46b66}.s-observ .s{order:4;max-width:200px;font-size:11px}
.s-observ h3{font:400 11px ${FUT};letter-spacing:4px;text-transform:uppercase;color:#ffd46b;border-bottom:1px solid #ffd46b66;padding-bottom:5px}.s-observ.in .ph{border:1px solid #ffd46b88}
.s-observ ol li{padding-left:20px;position:relative}.s-observ ol li::before{content:"0" counter(n);position:absolute;left:0;font:10px ${MON};color:#ffd46b;top:2px}.s-observ td{border-bottom:1px solid #cfd8ff33;font:11px ${MON}}.s-observ .go{background:none;border:1px solid #ffd46b;color:#ffd46b;letter-spacing:4px;font-size:10px}

.s-jewel{background:#0d0d10;color:#e8e0c8;font:13px/1.45 ${PAL};text-align:center}.s-jewel::after{content:"";position:absolute;inset:8px;border:1px solid #d4af37;outline:1px solid #d4af3766;outline-offset:3px;pointer-events:none}
.s-jewel.cv{align-items:center;justify-content:center;gap:12px}.s-jewel .k{order:1;font:11px ${PAL};letter-spacing:4px;text-transform:uppercase;color:#d4af37}.s-jewel .t{order:2;font:62px/0.95 ${BLK};color:#d4af37;text-shadow:0 2px 0 #5a4310}
.s-jewel.cv .ph{order:3;width:210px;height:210px;clip-path:polygon(50% 0,100% 50%,50% 100%,0 50%);filter:saturate(1.4) brightness(1.7)}.s-jewel .s{order:4;font-style:italic}
.s-jewel h3{font:400 14px ${PAL};letter-spacing:4px;text-transform:uppercase;color:#d4af37}.s-jewel h3::before,.s-jewel h3::after{content:" ◆ ";font-size:8px;vertical-align:middle;color:#b3123f}.s-jewel.in .ph{border:1px solid #d4af37;padding:3px;filter:brightness(1.5)}
.s-jewel ul,.s-jewel ol{text-align:left;padding:0 6px}.s-jewel li{padding-left:18px;position:relative}.s-jewel ul li::before{content:"◆";position:absolute;left:0;font-size:9px;top:3px;color:#1fa37a}.s-jewel ul li:nth-child(2)::before{color:#2f6fe0}.s-jewel ul li:nth-child(3)::before{color:#b3123f}.s-jewel ul li:nth-child(4)::before{color:#8b3fd9}
.s-jewel ol li::before{content:counter(n);position:absolute;left:0;color:#d4af37;font-style:italic}.s-jewel td{border-bottom:1px solid #d4af3755}.s-honey.in .go,.s-jewel.in .go{margin-bottom:18px}.s-jewel .go{background:#d4af37;color:#0d0d10;letter-spacing:4px;font-size:11px}.s-jewel .foot,.s-jewel .no{bottom:18px;color:#d4af37}
`;
    const cover=(b,pic)=>`<div class="bqp cv s-${b.style}" data-o="${b.id}">${pic?`<img class="ph" alt="" src="${pic}">`:''}<div class="k">${esc(b.k)}</div><div class="t">${b.t.map(l=>`<span>${esc(l)}</span>`).join('')}</div><div class="s">${esc(b.s)}</div>${b.burst?`<div class="burst"><small>${esc(b.burst.split('|')[0])}</small><b>${esc(b.burst.split('|')[1])}</b></div>`:''}<div class="no">No. ${b.no} · THE MARKET</div></div>`;
    const block=(b,q,pics,go)=>q[0]==='h'?`<h3>${esc(q[1])}</h3>`:q[0]==='p'?`<p>${esc(q[1])}</p>`:q[0]==='ul'||q[0]==='ol'?`<${q[0]}>${q[1].map(t=>`<li>${esc(t)}</li>`).join('')}</${q[0]}>`
      :q[0]==='pic'?(pics[q[1]]?`<img class="ph" alt="" src="${pics[q[1]]}">`:''):q[0]==='cost'?`<table>${q[1].map(r=>`<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join('')}</table>`:q[0]==='go'&&go?`<button class="go" data-go="${b.id}">${esc(go)}</button>`:'';
    const inside=(b,pics,n,go)=>b.panels.map((P,i)=>`<div class="bqp in s-${b.style}">${P.map(q=>block(b,q,pics,go)).join('')}<div class="foot">${i===2?`No. ${b.no} of ${n} · collect them all`:'THINGS TO DO IN THE MARKET'}</div></div>`).join('');
    return {css,cover,inside}; };
  let L=null, V=null;   // the look once fetched; what is up: {mode:'rack'|'cover'|'open', id, from}
  const W=document.createElement('div'); W.id='bq'; W.hidden=true; W.tabIndex=-1; W.setAttribute('role','dialog'); W.setAttribute('aria-label','Brochures'); document.body.appendChild(W);
  const ready=async()=>{ if(window.LOAD)await LOAD('brochures'); if(!BROCH.D){ const D=await DATA(); BROCH.D=D; BROCH.by=Object.fromEntries(D.list.map(b=>[b.id,b])); }
    if(!L){ L=LOOK(); const st=document.createElement('style'); st.id='bqcss'; st.textContent=`#bq[hidden]{display:none}#bq{position:fixed;inset:0;z-index:40;background:#07080ce6;display:flex;flex-direction:column;align-items:center;gap:10px;padding:10px;overflow:auto;outline:0}
#bq .bar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:center;font:11px Silkscreen,monospace;letter-spacing:.5px;color:#f2c14e;zoom:var(--uiz,1)}#bq .bar b{color:#ece5d3;font-weight:400}
#bq .bar button{font:inherit;color:#ece5d3;background:#0e1016;border:2px solid #3a3f4e;padding:3px 9px;cursor:pointer}#bq .bar button:focus-visible{outline:2px solid #f2c14e}
#bq .sheet{display:flex;margin:auto;box-shadow:0 18px 50px #000c;flex:none}#bq .sheet.col{flex-direction:column}
#bq .grid{display:flex;flex-wrap:wrap;gap:16px;justify-content:center;max-width:1100px;margin:auto}#bq .slot{display:flex;flex-direction:column;align-items:center;gap:5px;font:10px Silkscreen,monospace;color:#9b9584;zoom:var(--uiz,1)}#bq .slot .c{zoom:.46;box-shadow:0 8px 20px #000a}#bq .slot.got{color:#9fe07f}
`+L.css; document.head.appendChild(st); } };
  const fit=()=>{ const sh=W.querySelector('.sheet'); if(!sh||!V)return; const iw=innerWidth-20, ih=innerHeight-64, n=V.mode==='open'?3:1, col=V.mode==='open'&&iw<760;
    sh.classList.toggle('col',col); sh.style.zoom=Math.max(.3,Math.min(1.6,col?iw/300:Math.min(iw/(300*n),ih/620))); };
  const pics=id=>B[id][3];
  const draw=()=>{ if(!V||!L)return; const D=BROCH.D, n=D.list.length, bar=h=>`<div class="bar">${h}</div>`;
    if(V.mode==='rack')W.innerHTML=bar(`<span>BROCHURES · $${PRICE} EACH</span><b>YOU HAVE COLLECTED ${count()} OF ${n}${S.paid?'':' · A FULL SET PAYS $'+FULL}</b><b>$${Math.round(INV.cash)}</b><button data-a="x">CLOSE</button>`)
      +`<div class="grid">${D.list.map(b=>`<div class="slot${S.got[b.id]?' got':''}"><div class="c">${L.cover(b,pics(b.id)[0])}</div><span>${have(b.id)?'IN YOUR PACK · READ':S.got[b.id]?'COLLECTED · $'+PRICE:'$'+PRICE}</span></div>`).join('')}</div>`;
    else{ const b=BROCH.by[V.id], go=UI.places().some(p=>p[0]===b.place);
      W.innerHTML=bar(`<span>${esc(B[b.id][0])}</span>${V.mode==='open'?'<button data-a="fold">FOLD</button>':'<button data-a="open">OPEN</button>'}<button data-a="x">${V.from?'BACK TO THE RACK':'CLOSE'}</button>`)
        +`<div class="sheet">${V.mode==='open'?L.inside(b,pics(b.id),n,go?'START':''):L.cover(b,pics(b.id)[0])}</div>`; }
    fit(); };
  const show=async v=>{ V=v; W.hidden=false; if(!L)W.innerHTML='<div style="margin:auto;font:11px Silkscreen,monospace;color:#f2c14e">UNFOLDING...</div>'; W.focus(); await ready(); if(V===v)draw(); };
  const close=()=>{ W.hidden=true; W.innerHTML=''; V=null; };
  const back=()=>{ if(V&&V.mode!=='rack'&&V.from)show({mode:'rack'}); else close(); };
  const buy=id=>{ if(have(id))return show({mode:'cover',id,from:1}); if(INV.cash<PRICE)return say('A BROCHURE IS $'+PRICE+'.','#c8a090');
    INV.cash-=PRICE; FORAGE.give(PRE+id,1); const first=!S.got[id]; S.got[id]=1; if(SFX)SFX.play('page',{vol:.5}); say('YOU TAKE '+B[id][0]+'. READ IT ANYWHERE FROM YOUR PACK.');
    if(first&&!S.paid&&IDS.every(k=>S.got[k])){ S.paid=1; INV.cash+=FULL; say('YOU HAVE EVERY BROCHURE. THE VISITORS\' BUREAU PAYS $'+FULL+'.','#f2c14e'); }
    save(); if(FORAGE.draw)FORAGE.draw(); show({mode:'cover',id,from:1}); };
  // START: takes you to the thing to do and lends what it needs; the loan goes back once you are far from where it began, or after an hour
  const wait=ms=>new Promise(r=>setTimeout(r,ms)), until=async(f,ms=60000)=>{ const t0=performance.now(); while(!f()&&performance.now()-t0<ms)await wait(200); return f(); };
  const idle=async()=>{ await until(()=>FADE.busy,1500); let calm=0; const t0=performance.now(); while(calm<600&&performance.now()-t0<40000){ await wait(100); calm=FADE.busy?0:calm+100; } };
  const SPOT={ wreck:async()=>await until(()=>WRECK.built&&WRECK.at)&&[WRECK.at[0]+4*T,WRECK.at[1]+3*T], pier:async()=>await until(()=>PIER&&PIER.x!=null)&&[PIER.x+3.2*T,PIER.zE+1.6*T] };
  const giveBack=quiet=>{ const L=S.loan; if(!L)return; const back=[];
    for(const [k,n] of Object.entries(L.kit)){ for(const s in EQUIP.by)if(EQUIP.by[s]===k)EQUIP.off(s); if(WIELD.on===k)WIELD.set(null); const m=Math.min(n,FORAGE.has(k)||0); if(m>0){ FORAGE.take(k,m); back.push(FORAGE.name(k)); } }
    S.loan=null; save(); if(FORAGE.draw)FORAGE.draw(); if(!quiet&&back.length)say('THE LOANED GEAR GOES BACK: '+back.join(', ')+'.','#c8a090'); };
  const start=async id=>{ await ready(); const b=BROCH.by[id], st=b.start||{}; giveBack(true); (UI.goName||UI.goPlace)(st.via||b.place); await idle();
    const at=st.spot?await SPOT[st.spot]():st.at?[SHARED.BOD.XS(st.at[0]),SHARED.BOD.ZS(st.at[1])]:null; if(at){ STORE.goTo(at[0],at[1],'up'); await idle(); }
    if(!st.kit)return; const kit={}; for(const [k,n] of Object.entries(st.kit)){ const m=Math.max(0,n-(FORAGE.has(k)||0)); if(m){ FORAGE.give(k,m); kit[k]=m; } }
    for(const k of st.wear||[])if(FORAGE.has(k))EQUIP.wear(k,true); if(st.hold&&FORAGE.has(st.hold))WIELD.set(st.hold);
    if(Object.keys(kit).length){ S.loan={id,kit,at:[pos.x,pos.z],R:st.R||100,t:Date.now()}; save(); say('THE VISITORS\' BUREAU LENDS YOU '+Object.keys(kit).map(k=>FORAGE.name(k)).join(', ')+'. IT GOES BACK WHEN YOU LEAVE.','#f2c14e'); }
    if(FORAGE.draw)FORAGE.draw(); };
  let lt=0; SYS.add('places',dt=>{ const L=S.loan; if(!L||(lt+=dt)<2)return; lt=0; if(Date.now()-L.t>3600e3||Math.hypot(pos.x-L.at[0],pos.z-L.at[1])>L.R*T)giveBack(); });
  W.addEventListener('click',e=>{ const t=e.target.closest('[data-a],[data-go],[data-o]'); if(!t||!V)return;
    if(t.dataset.a==='x')return back(); if(t.dataset.a==='open')return show({...V,mode:'open'}); if(t.dataset.a==='fold')return show({...V,mode:'cover'});
    if(t.dataset.go){ const g=t.dataset.go; close(); return start(g); }
    if(t.dataset.o)return V.mode==='rack'?buy(t.dataset.o):show({...V,mode:'open'}); });
  for(const ev of ['keydown','keyup','keypress'])W.addEventListener(ev,e=>{ if(ev==='keydown'&&e.key==='Escape')back(); e.stopPropagation(); });
  addEventListener('resize',()=>{ if(!W.hidden)fit(); });
  Object.assign(BROCH,{ids:IDS,read:id=>B[id]&&show({mode:'cover',id}),rack:()=>show({mode:'rack'}),buy,start,giveBack,loan:()=>S.loan&&{...S.loan},close,up:()=>V&&{...V},got:()=>({...S.got}),paid:()=>S.paid});
  // the racks: a wire stand of twelve pockets under a sign, the covers in their own colours
  const racks=(LEVEL.racks&&LEVEL.racks.at)||[]; BROCH.racks=[];
  if(racks.length){ const cv=document.createElement('canvas'); cv.width=256; cv.height=256; const g=cv.getContext('2d'); g.fillStyle='#22252b'; g.fillRect(0,0,256,256);
    IDS.forEach((id,i)=>{ const x=(i%4)*64+5, y=40+Math.floor(i/4)*72+4, q=B[id]; g.fillStyle=q[1]; g.fillRect(x,y,54,62); g.fillStyle=q[2]; g.fillRect(x+5,y+7,44,9); g.fillRect(x+5,y+20,30,5); g.globalAlpha=.55; g.fillRect(x+5,y+31,44,24); g.globalAlpha=1; g.fillStyle='#22252b'; g.fillRect(x-5,y+52,64,16); });
    g.fillStyle='#f2c14e'; g.fillRect(0,0,256,34); g.fillStyle='#16181d'; g.font='bold 19px monospace'; g.textAlign='center'; g.fillText('THINGS TO DO  $'+PRICE,128,24);
    const tx=new THREE.CanvasTexture(cv); tx.colorSpace=THREE.SRGBColorSpace; tx.magFilter=THREE.NearestFilter; tx.generateMipmaps=false; tx.minFilter=THREE.LinearFilter;
    const face=new THREE.MeshLambertMaterial({map:tx}), iron=new THREE.MeshLambertMaterial({color:0x2a2d33}), hid=new THREE.MeshBasicMaterial({visible:false}), root=MAPG.bodega||MAPG.street||scene, Bd=SHARED.BOD;
    for(const o of racks){ const x=Bd.XS(o.x), z=Bd.ZS(o.y), y=SHARED.groundY?SHARED.groundY(x,z):0, G=new THREE.Group(); G.position.set(x,y,z); G.rotation.y=o.rot||0;
      const box=(w,h,d,px,py,pz,m)=>{ const me=new THREE.Mesh(new THREE.BoxGeometry(w*M,h*M,d*M),m); me.position.set(px*M,py*M,pz*M); me.castShadow=me.receiveShadow=true; G.add(me); return me; };
      box(.74,1.5,.06,0,.95,0,iron); box(.8,.06,.4,0,.03,0,iron); for(const s of [-1,1])box(.05,.2,.05,s*.3,.13,0,iron);
      for(const s of [-1,1]){ const p=new THREE.Mesh(new THREE.PlaneGeometry(.7*M,1.44*M),face); p.position.set(0,.95*M,s*.034*M); if(s<0)p.rotation.y=Math.PI; G.add(p); }
      const hb=box(.8,1.7,.4,0,.85,0,hid); hb.castShadow=hb.receiveShadow=false; root.add(G); const r=.42*M; SOL.up.push([x-r,z-r,x+r,z+r]); FIX.up.push([x-r,z-r,y,x+r,z+r,y+1.7*M]);
      UI.thing({name:'BROCHURES ($'+PRICE+' EACH)',obj:hb,reach:1.5*T,near:2.4*T,tall:1.8*M,act:()=>BROCH.rack()}); BROCH.racks.push({x,z,G}); } }
  FORAGE.HELP.push('BROCHURES: a rack on the street sells one for each thing to do ($'+PRICE+'). READ it from your pack; START takes you to the place and lends you what it needs. A full set pays $'+FULL+'.');
  window.BROCHDBG=()=>({up:BROCH.up(),got:count(),paid:S.paid,racks:BROCH.racks.map(r=>[+(r.x/T).toFixed(1),+(r.z/T).toFixed(1)]),panels:W.querySelectorAll('.bqp').length,over:[...W.querySelectorAll('.bqp')].filter(p=>[...p.children].some(c=>!/foot|no/.test(c.className)&&getComputedStyle(c).position!=='absolute'&&c.getBoundingClientRect().bottom>p.getBoundingClientRect().bottom+1)).length}); }
