{
const PLAY={title:'THE HOUND OF THE BASKERVILLES',
  marks:{DL:[-3,.5],DC:[0,.5],DR:[3,.5],L:[-3,1.8],C:[0,1.8],R:[3,1.8],UL:[-3,3.1],UC:[0,3.1],UR:[3,3.1],OL:[-5.3,1.9],OR:[5.3,1.9],
    CHAIRL:[-2.2,1.5],CHAIRR:[1.6,1.5],WINDOW:[3.4,2.6],FIRE:[-.4,2.5],TOR:[.6,3.1],ROCK:[-2.4,.8],MIRE:[-4.1,3],PATH:[3.2,2.4]},
  cast:{
    holmes:{name:'Sherlock Holmes',look:{shirt:'#3a3d44',pants:'#2b2c31',hair:'#1e1a18',skin:'#e2c2ac',shoes:'#221a14'},hat:'deerstalker',hatC:'#7a6a50'},
    watson:{name:'Dr. Watson',look:{shirt:'#6a5440',pants:'#4a3e34',hair:'#6e5236',skin:'#e6c4b0',shoes:'#3a2a1c'},hat:'bowler',hatC:'#25211e'},
    mortimer:{name:'Dr. Mortimer',look:{shirt:'#2c3a32',pants:'#3c3c3a',hair:'#8a7a62',skin:'#eccab6',shoes:'#2a2420'},hat:'top',hatC:'#1c1c1e'},
    henry:{name:'Sir Henry Baskerville',look:{shirt:'#8a6a3e',pants:'#5a4630',hair:'#a0682c',skin:'#e8c0a0',shoes:'#4a3020'},hat:'wide',hatC:'#5a4a36'},
    stapleton:{name:'Jack Stapleton',look:{shirt:'#7a7a5a',pants:'#5e5a46',hair:'#c4a870',skin:'#e4c2a8',shoes:'#4a3c2a'},hat:'straw',hatC:'#d8c48a'},
    barrymore:{name:'Barrymore',look:{shirt:'#141416',pants:'#141416',hair:'#2a2420',skin:'#d8b8a0',shoes:'#0c0c0c'},hat:null}},
  scenes:[
    {name:'221B Baker Street',set:'baker',lt:'warm',cast:{holmes:'WINDOW',watson:'CHAIRL'},face:{holmes:'R',watson:'C'},beats:[
      {x:'street',over:true},
      {w:'watson',s:'Holmes, our visitor of last night forgot his walking stick. What do you make of it?',a:'wave'},
      {w:'holmes',s:'[amused] How did you know what I was doing? I believe you have eyes in the back of your head.',f:'watson'},
      {w:'watson',s:'I have, at least, a well-polished coffee pot in front of me.'},
      {w:'holmes',s:'Then tell me, Watson. What do you read in our visitor\'s stick?',go:'C'},
      {w:'watson',s:'An elderly country doctor. Well esteemed. One who walks a great deal.',f:'holmes'},
      {w:'holmes',s:'[laughs softly] Splendid, Watson. Wrong in almost every particular! A young man, amiable, unambitious, absent-minded, and the owner of a favourite dog. Larger than a terrier, and smaller than a mastiff.',a:'wave',f:'out'},
      {x:'knock'},
      {w:'holmes',s:'And here, unless I am mistaken, is the man himself.',f:'OR'},
      {do:[['mortimer','enter','OR','R']]},
      {w:'mortimer',s:'Mr. Sherlock Holmes? Doctor James Mortimer. I have come about a death on Dartmoor. And about a legend.',f:'holmes'},
      {w:'holmes',s:'Pray, sit down, Doctor. Watson, the lamp.',go:'CHAIRR',f:'mortimer'},
      {do:[['watson','go','FIRE']]},
      {x:'reading',over:true},
      {w:'mortimer',s:'[reading slowly, low] Know then, that in the time of the Great Rebellion, Hugo Baskerville, a wild and godless man, hunted a maiden across the moor by night. And there stood over him a foul thing. A great black beast, shaped like a hound, yet larger than any hound that ever mortal eye has rested upon.',go:'C',f:'out'},
      {x:'howlfar',over:true},
      {w:'mortimer',s:'Three weeks ago, Sir Charles Baskerville was found dead at the end of the yew alley. There was no mark upon him. But his face. His face was twisted with terror.'},
      {w:'watson',s:'[quietly] Good heavens.',f:'mortimer'},
      {w:'mortimer',s:'There were footprints near the body, Mr. Holmes.',f:'holmes'},
      {w:'holmes',s:'A man\'s, or a woman\'s?',f:'mortimer'},
      {w:'mortimer',s:'[whispers] Mr. Holmes. They were the footprints of a gigantic hound!',a:'wave'},
      {x:'sting'},{p:1.2}]},
    {name:'Baskerville Hall',set:'hall',lt:'hall',cast:{henry:'UL',watson:'L',barrymore:'UR'},face:{henry:'C',watson:'C',barrymore:'henry'},beats:[
      {x:'door'},
      {w:'barrymore',s:'[gravely] Welcome to Baskerville Hall, Sir Henry. Dinner is laid in the hall, sir.',go:'R'},
      {w:'henry',s:'Some welcome. It\'s not a cheerful place, is it, Barrymore? I don\'t wonder my uncle got a little jumpy, living here alone.',go:'C',f:'barrymore'},
      {w:'watson',s:'Mr. Holmes has sent me to see that you are never left alone, Sir Henry. Especially after dark.',f:'henry'},
      {w:'henry',s:'[laughs] A ghost dog! I\'ve lived in the West, Doctor Watson. I\'ve heard wolves at night. I\'ll not be frightened off by a story.',f:'watson',a:'wave'},
      {x:'sob'},
      {w:'watson',s:'[hushed] Listen. Did you hear that? A woman, crying.',f:'UR'},
      {w:'henry',s:'Barrymore. Who is that?',f:'barrymore'},
      {w:'barrymore',s:'[hesitating] There are only two women in the house, sir. The scullery maid sleeps in the far wing, and my wife. And I can answer for it, sir, it was not my wife.',f:'henry'},
      {w:'henry',s:'Then who?'},
      {w:'barrymore',s:'[uneasy] The wind, sir. The wind on the moor does strange things. Good night, sir.',f:'out'},
      {do:[['barrymore','exit','OR']]},
      {w:'watson',s:'[quietly, to himself] It was not the wind.',go:'DC',f:'out'},
      {x:'howlfar'},{p:1}]},
    {name:'The Moor at Dusk',set:'moor',lt:'dusk',cast:{watson:'DL'},face:{watson:'R'},beats:[
      {do:[['watson','go','L']]},{p:1.5},
      {do:[['stapleton','enter','OR','R']]},
      {w:'stapleton',s:'[cheerfully] Doctor Watson! Forgive the liberty. Stapleton, of Merripit House. I chase butterflies on the moor.',f:'watson',a:'wave'},
      {w:'watson',s:'A lonely place for it.',f:'stapleton'},
      {w:'stapleton',s:'A wonderful place! But take care where you walk, Doctor. That bright green patch is the great Grimpen Mire. A false step there means death, to man or beast.',go:'C',f:'MIRE'},
      {x:'mire'},
      {w:'stapleton',s:'[softly] There. A moor pony. Two in a week. The Mire has them, and it does not let go.'},
      {x:'howlfar',over:true},
      {w:'watson',s:'[uneasy] What on earth is that?',f:'UL'},
      {w:'stapleton',s:'[lightly] The peasants say it is the Hound of the Baskervilles, calling for its prey.',f:'watson'},
      {w:'watson',s:'And you, a man of science, believe that?'},
      {w:'stapleton',s:'[smiling] I believe in getting home before dark, Doctor. Good evening.',f:'out'},
      {do:[['stapleton','exit','OR']]},{p:1.2},
      {do:[['holmes','enter','OL','TOR']]},
      {w:'holmes',s:'It is a lovely evening, my dear Watson.',f:'watson'},
      {w:'watson',s:'[startled] Holmes! You, here? I thought you were in London!',f:'holmes',a:'block'},
      {w:'holmes',s:'That was what I wished you to think. Our naturalist is no stranger to that hound, Watson. Tonight we set a trap. And Sir Henry, I am afraid, must be the bait.',go:'C',f:'out'},
      {x:'sting'},{p:1}]},
    {name:'The Moor at Night',set:'fog',lt:'night',cast:{holmes:'ROCK',watson:'L'},face:{holmes:'R',watson:'R'},beats:[
      {do:[['holmes','a','crouch'],['watson','go','DL']]},
      {w:'holmes',s:'[whispers] Keep down. Sir Henry leaves Merripit House at ten. He must cross the moor alone.',f:'watson'},
      {w:'watson',s:'[whispers] The fog, Holmes. It is rolling in from the Mire.',f:'R'},
      {w:'holmes',s:'[whispers, tense] The one thing on earth that could have spoiled my plans.',f:'R'},
      {x:'owl'},
      {do:[['henry','enter','OR','PATH']]},{p:1.5},
      {do:[['henry','go','C']]},
      {x:'paws',over:true},{hound:'enter',from:'OR'},
      {x:'snarl',over:true},{hound:'leap',at:'henry'},
      {w:'henry',s:'[screams] Holmes! Watson! Help me!',a:'fall'},
      {w:'holmes',s:'[shouting] Now, Watson! The lantern!',go:'R',a:'block'},
      {do:[['watson','go','C']]},
      {x:'howlnear',over:true},{hound:'flee',to:'MIRE'},
      {x:'splash'},
      {w:'watson',s:'[breathless] It is gone. Into the Mire!',f:'MIRE'},
      {w:'holmes',s:'Did you see its jaws, Watson? Phosphorus. A cunning preparation. It was a living dog, painted to look like a fiend from hell.',f:'watson'},
      {w:'henry',s:'[shaken] Then who? Who would do such a thing?',go:'C',f:'holmes'},
      {w:'holmes',s:'Stapleton. A Baskerville himself, Sir Henry, hidden under another name, and next in line for your fortune. He has fled into the fog. The Mire will judge him now.',f:'out'},
      {x:'mire'},{p:1}]},
    {name:'221B Baker Street, Evening',set:'baker',lt:'evening',cast:{holmes:'CHAIRR',watson:'CHAIRL'},face:{holmes:'out',watson:'holmes'},beats:[
      {w:'watson',s:'A dreadful business, Holmes. And yet you saw it all from the first.'},
      {w:'holmes',s:'[warmly] The world is full of obvious things, Watson, which nobody by any chance ever observes.',f:'watson'},
      {w:'holmes',s:'Come. Dinner, I think. And afterwards, a little music.',go:'WINDOW',f:'out'},
      {x:'violin'},{p:.5}]}]};
const PLAYT={"walk":1.5,"open":3,"close":3,"scenes":[{"S":12,"E":131.06},{"S":137.56,"E":211.23},{"S":217.73,"E":314.13},{"S":320.63,"E":410.51},{"S":417.01,"E":444.56}],"beats":[[15,0,0],[15.5,0,1],[20.99,0,2],[25.92,0,3],[29.65,0,4],[34.1,0,5],[39.83,0,6],[56.68,0,7],[58.88,0,8],[63.41,0,9],[65.24,0,10],[73.29,0,11],[76.78,0,12],[78.46,0,13],[78.96,0,14],[99.33,0,15],[99.83,0,16],[111.56,0,17],[113.69,0,18],[116.78,0,19],[119.55,0,20],[126.16,0,21],[129.36,0,22],[140.56,1,0],[143.76,1,1],[149.25,1,2],[156.26,1,3],[162.23,1,4],[170.04,1,5],[175.24,1,6],[180.89,1,7],[183.74,1,8],[193.15,1,9],[194.32,1,10],[200.05,1,11],[201.88,1,12],[203.53,1,13],[209.73,1,14],[220.73,2,0],[221.9,2,1],[223.4,2,2],[225.23,2,3],[233.12,2,4],[235.41,2,5],[250.18,2,6],[256.38,2,7],[264.19,2,8],[264.69,2,9],[266.82,2,10],[271.99,2,11],[275.16,2,12],[280.49,2,13],[284.33,2,14],[285.53,2,15],[289.84,2,16],[292.53,2,17],[296.5,2,18],[309.43,2,19],[312.63,2,20],[323.63,3,0],[324.93,3,1],[332.58,3,2],[336.31,3,3],[340.52,3,4],[343.72,3,5],[345.46,3,6],[346.96,3,7],[349.43,3,8],[349.93,3,9],[352.13,3,10],[352.63,3,11],[353.73,3,12],[358.1,3,13],[360.71,3,14],[363.19,3,15],[363.69,3,16],[366.29,3,17],[371.49,3,18],[374.34,3,19],[383.91,3,20],[387.16,3,21],[402.81,3,22],[409.01,3,23],[420.01,4,0],[424.3,4,1],[430.59,4,2],[435.36,4,3],[443.56,4,4]],"lines":[[15.5,5.04,0,1],[20.99,4.48,0,2],[25.92,3.28,0,3],[29.65,4,0,4],[34.1,5.28,0,5],[39.83,16.4,0,6],[58.88,4.08,0,8],[65.24,7.6,0,10],[73.29,3.04,0,11],[78.96,19.92,0,14],[99.83,11.28,0,16],[111.56,1.68,0,17],[113.69,2.64,0,18],[116.78,2.32,0,19],[119.55,6.16,0,20],[143.76,5.04,1,1],[149.25,6.56,1,2],[156.26,5.52,1,3],[162.23,7.36,1,4],[175.24,5.2,1,6],[180.89,2.4,1,7],[183.74,8.96,1,8],[193.15,0.72,1,9],[194.32,5.28,1,10],[201.88,1.2,1,12],[225.23,7.44,2,3],[233.12,1.84,2,4],[235.41,14.32,2,5],[256.38,7.36,2,7],[264.69,1.68,2,9],[266.82,4.72,2,10],[271.99,2.72,2,11],[275.16,4.88,2,12],[289.84,2.24,2,16],[292.53,3.52,2,17],[296.5,12.48,2,18],[324.93,7.2,3,1],[332.58,3.28,3,2],[336.31,3.76,3,3],[353.73,3.92,3,12],[358.1,2.16,3,13],[371.49,2.4,3,18],[374.34,9.12,3,19],[383.91,2.8,3,20],[387.16,15.2,3,21],[420.01,3.84,4,0],[424.3,5.84,4,1],[430.59,4.32,4,2]],"sounds":[{"k":"bell","at":0,"vol":0.7},{"k":"overture","at":2.5,"vol":0.55},{"k":"street","at":15,"vol":0.35},{"k":"knock","at":56.68,"vol":0.8},{"k":"reading","at":78.46,"vol":0.4},{"k":"howlfar","at":99.33,"vol":0.55},{"k":"sting","at":126.16,"vol":0.6},{"k":"fire","at":10.5,"vol":0.22,"bed":1,"until":134.06},{"k":"clock","at":10.5,"vol":0.12,"bed":1,"until":134.06},{"k":"door","at":140.56,"vol":0.7},{"k":"sob","at":170.04,"vol":0.45},{"k":"howlfar","at":203.53,"vol":0.55},{"k":"hallwind","at":136.06,"vol":0.26,"bed":1,"until":214.23},{"k":"mire","at":250.18,"vol":0.6},{"k":"howlfar","at":264.19,"vol":0.55},{"k":"sting","at":309.43,"vol":0.6},{"k":"wind","at":216.23,"vol":0.3,"bed":1,"until":317.13},{"k":"owl","at":340.52,"vol":0.5},{"k":"paws","at":349.43,"vol":0.8},{"k":"snarl","at":352.13,"vol":0.95},{"k":"howlnear","at":363.19,"vol":0.9},{"k":"splash","at":366.29,"vol":0.8},{"k":"mire","at":402.81,"vol":0.6},{"k":"fog","at":319.13,"vol":0.3,"bed":1,"until":413.51},{"k":"wind","at":319.13,"vol":0.3,"bed":1,"until":413.51},{"k":"violin","at":435.36,"vol":0.6},{"k":"fire","at":415.51,"vol":0.22,"bed":1,"until":447.56},{"k":"clock","at":415.51,"vol":0.12,"bed":1,"until":447.56}],"call":{"S":450.06,"bow":[454.06,456.56],"E":459.56},"len":464.56};
const PLL=PLAYT.len, plEase=k=>k<=0?0:k>=1?1:k*k*(3-2*k);
const W_=[1,.86,.62], LOB=[.15,.12,.08], WL=[.32,.21,.1], PLCUE={house:{house:W_,lobby:W_,wall:[.8,.52,.26],candle:[.9,.6,.28]},preshow:{house:[.3,.26,.2],lobby:[.6,.5,.36],wall:[.6,.4,.2],candle:[1,.66,.3]},
  warm:{lobby:LOB,wall:WL,candle:[1.2,.78,.36],prac:[1.2,.6,.24]},hall:{lobby:LOB,wall:WL,candle:[1,.64,.28],prac:[.7,.48,.22]},dusk:{lobby:LOB,wall:WL,candle:[.95,.6,.28]},
  night:{lobby:LOB,wall:WL,candle:[.8,.5,.24]},evening:{lobby:LOB,wall:WL,candle:[1,.64,.3],prac:[1.3,.66,.26]},between:{lobby:LOB,wall:WL,candle:[.18,.12,.06]},
  call:{house:[.4,.34,.25],lobby:LOB,wall:[.6,.4,.2],candle:[1.2,.8,.38]}};
function lobbyCol(x,y){ const i=Math.floor(x*3),j=Math.floor(y*3);
  return mt('tiles',(x*3-i)<.05||(y*3-j)<.05?[118,116,110]:((i+j)&1?[206,202,192]:[58,58,60])); }
const PFONT={...STOREK.theatre.THFONT,D:'####.#...##...##...##...##...#####.',F:'######....#....####.#....#....#....',L:'#....#....#....#....#....#....#####',V:'#...##...##...##...##...#.#.#..#...',
  Y:'#...##...#.#.#..#....#....#....#...',0:'.###.#...##..###.#.###..##...#.###.',1:'..#...##....#....#....#....#...###.',2:'.###.#...#....#...#...#...#...#####',
  4:'...#...##..#.#.#..#.#####...#....#.',6:'..##..#...#....####.#...##...#.###.',8:'.###.#...##...#.###.#...##...#.###.'};
const PLAYK=PLB=>{ const PLMID=(PLB.x0+PLB.x1)/2, SY=PLB.y0+7.9, ay=a=>SY+(a+48.3)*6/6.2;
const PLS={x0:PLB.x0+.1,x1:PLB.x1-.1,SY,PRY:ay(-47.4),PRX0:PLMID-4.3,PRX1:PLMID+4.3,PRZ:90,CY:ay(-46.8),SZ:22,back:PLB.y1-.1,LEGS:[ay(-45.4),ay(-43.9)],legW:1.6,
  rows:[1.3,2.4,3.5,4.6,5.7].map(d=>SY-d),SX0:PLMID-2.5,SX1:PLMID+2.5,lobby:PLB.y0+1.6};
const PLWALLS=[SY-1.9,SY-4.3], PLCANDLES=[[PLMID-3.5,SY+.25,20],[PLMID-1.4,SY+.25,14],[PLMID+1.4,SY+.25,14],[PLMID+3.5,SY+.25,20],[PLMID+3.9,ay(-45.2),24]];
const plMark=m=>[PLMID+m[0],PLS.CY+.5+m[1]], PLC=PLS.CY+.5;
function playFloorCol(x,y){ if(y<PLS.lobby)return lobbyCol(x,y);
  { const a=Math.abs(x-PLMID); if(a>PLS.SX1-PLMID+.15&&a<PLS.SX1-PLMID+1.25&&y<PLS.SY)return mt('carpet',speck(a<PLS.SX1-PLMID+.22||a>PLS.SX1-PLMID+1.18?[150,118,58]:[128,26,34],x,y,23)); }
  const r=Math.floor(x*4), b=Math.floor(y/1.5+hash(r,0,41)*3), c=[[86,58,40],[78,52,36],[92,62,42]][Math.floor(hash(b,r,43)*3)];
  return mt('wood',(x*4-r)<.08?sh(c,.7):c); }
function playWall(q,nx,ny,X,Y,z,f){ const u=nx?Y:X;
  if(ny<0&&Math.abs(Y-PLB.y1)<.3&&z>=PLS.SZ){ const s=1-.05*((u*24|0)%7===0)-.03*Math.abs(Math.sin(u*2.1)); return sh(z>PLB.h-16?[30,30,34]:[196,202,208],f*s); }
  if(Y>PLS.PRY+.05)return sh(z<PLS.SZ&&ny?[60,46,34]:[20,20,22],f);
  if(z<6)return sh([40,26,20],f);
  if(z<40)return sh(z%10<1?[52,32,24]:[74,46,32],f);
  if(z<44)return sh([186,150,72],f*1.1);
  const d=hash(Math.floor(u*24/6),Math.floor(z/8),57)<.5, m=((u*24|0)+(z|0))%12<2;
  return sh(m&&d?[112,34,40]:[98,26,32],f); }
const PFRONT=(()=>{ let o=null; const build=()=>{ const W=Math.round((PLB.x1-PLB.x0)*24), H=PLB.h, a=new Array(W*H).fill(null), px=(c,z,col)=>{ c=Math.floor(c); z=Math.floor(z); if(c>=0&&c<W&&z>=0&&z<H)a[z*W+c]=col; };
  const box=(c0,z0,c1,z1,col)=>{ for(let z=Math.floor(z0);z<z1;z++)for(let c=Math.floor(c0);c<c1;c++)px(c,z,col); }, U=x=>(x-PLB.x0)*24, lit=c=>{ const o=c.slice(); o.e=1; return o; };
  const text=(s,c,z,k,col,ol)=>{ for(const pass of ol?[0,1]:[1])[...s].forEach((ch,i)=>{ const g=PFONT[ch]; if(!g)return; for(let j=0;j<7;j++)for(let q=0;q<5;q++)if(g[j*5+q]==='#'){
      if(pass)box(c+(i*6+q)*k,z+(6-j)*k,c+(i*6+q+1)*k,z+(7-j)*k,col); else for(const [dx,dz] of [[-1,0],[1,0],[0,-1],[0,1]])box(c+(i*6+q)*k+dx,z+(6-j)*k+dz,c+(i*6+q+1)*k+dx,z+(7-j)*k+dz,ol); } }); };
  const tw=(s,k)=>(s.length*6-1)*k;
  const CREAM=[226,214,186], CREAMD=[188,174,146], GREEN=[34,58,48], GILT=[198,160,76], BULB=lit([255,226,150]);
  for(let z=0;z<H;z++)for(let c=0;c<W;c++){ const r=Math.floor(z/3), cc=c+(r&1)*3; px(c,z,z%3===0||cc%6===0?[92,38,32]:hash(Math.floor(cc/6),r,871)<.3?[132,58,48]:[118,50,44]); }
  box(0,0,W,8,[150,146,136]); box(0,7,W,9,[124,120,112]);
  for(const [c0,c1] of [[0,12],[W-12,W]]){ box(c0,8,c1,H-14,CREAM); for(let z=14;z<H-14;z+=10)box(c0,z,c1,z+1,CREAMD); }
  box(0,H-14,W,H,CREAM); box(0,H-14,W,H-12,CREAMD); for(let c=4;c<W;c+=10)box(c,H-10,c+5,H-6,CREAMD);
  const d0=U(PLMID-1.2), d1=U(PLMID+1.2); box(d0-4,0,d1+4,76,GREEN); box(d0-2,72,d1+2,76,GILT);
  for(const [x0,x1] of [[PLMID-3.9,PLMID-2.3],[PLMID+2.3,PLMID+3.9]]){ box(U(x0)-3,25,U(x1)+3,72,CREAM); box(U(x0)-4,24,U(x1)+4,26,CREAMD); }
  for(const [x0,x1] of [[PLMID-3.9,PLMID-2.3],[PLMID+2.3,PLMID+3.9]]){ box(U(x0),27,U(x1),70,lit([236,196,120])); box((U(x0)+U(x1))/2-1,27,(U(x0)+U(x1))/2+1,70,CREAM); box(U(x0),47,U(x1),49,CREAM); }
  const cw=96; box(W/2-cw,74,W/2+cw,86,[30,40,36]); box(W/2-cw,84,W/2+cw,87,GILT); for(let c=W/2-cw+2;c<W/2+cw;c+=6)px(c,75,BULB);
  const nm='THE HOUND OF THE BASKERVILLES'; text(nm,(W-tw(nm,1))/2,77,1,lit([240,226,180]));
  const bw=tw('PLAYHOUSE',2)+18, b0=(W-bw)/2; box(b0,90,b0+bw,114,CREAM); box(b0-2,88,b0+bw+2,90,GILT); box(b0-2,114,b0+bw+2,116,GILT);
  for(let z=92;z<113;z+=5){ px(b0+2,z,BULB); px(b0+bw-3,z,BULB); }
  text('PLAYHOUSE',b0+9,100,2,[150,28,34],[90,16,20]); const ts='TAKE A SEAT'; text(ts,(W-tw(ts,1))/2,91,1,[120,90,40]);
  for(const c0 of [14,W-14-30]){ box(c0-2,16,c0+32,72,GILT); box(c0,18,c0+30,70,[46,74,62]);
    for(let z=18;z<70;z++)for(let c=c0;c<c0+30;c++)if(hash(c,z,881)<.12)px(c,z,[70,104,88]);
    for(let z=26;z<58;z++)for(let c=c0+4;c<c0+26;c++){ const x=(c-c0-15)/10, y=(z-40)/14; if(x*x+y*y<1||(Math.abs(x)<.5&&y>-1.5&&y<-.5)||(Math.abs(x+.55)<.22&&y>.7&&y<1.4)||(Math.abs(x-.55)<.22&&y>.7&&y<1.4))px(c,z,[14,16,14]); }
    px(c0+11,44,lit([250,236,120])); px(c0+19,44,lit([250,236,120])); px(c0+12,44,lit([250,236,120])); px(c0+18,44,lit([250,236,120]));
    text('HOUND',c0+1,61,1,lit([236,222,176])); }
  return {W,H,a}; }; return {get W(){ return (o||(o=build())).W; },get H(){ return (o||(o=build())).H; },get a(){ return (o||(o=build())).a; }}; })();
const plAt=m=>plMark(PLAY.marks[m]);
const PLTR=PLAY.scenes.map((sc,si)=>{ const A={}, pos={}, H=[], get=w=>A[w]||(A[w]={walks:[],faces:[],acts:[],talk:[],in:-1e9,out:1e9,p0:null});
  for(const [w,m] of Object.entries(sc.cast)){ const a=get(w); pos[w]=plAt(m); a.p0=pos[w].slice(); a.faces.push([-1e9,(sc.face||{})[w]||'out']); }
  const walk=(w,to,t)=>{ const a=get(w), p=pos[w], q=plAt(to), d=Math.hypot(q[0]-p[0],q[1]-p[1]); if(d<.01)return t; const t1=t+d/PLAYT.walk; a.walks.push([t,t1,p[0],p[1],q[0],q[1]]); a.faces.push([t1,{dir:[q[0]-p[0],q[1]-p[1]]}]); pos[w]=q; return t1; };
  const dur=new Map(PLAYT.lines.filter(l=>l[2]===si).map(l=>[l[3],l[1]]));
  for(const [t0,s,bi] of PLAYT.beats){ if(s!==si)continue; const b=sc.beats[bi];
    if(b.w){ const a=get(b.w); const te=b.go?walk(b.w,b.go,t0):t0; if(b.f)a.faces.push([te,b.f]); if(b.a)a.acts.push([t0+.3,b.a]); a.talk.push([t0,t0+(dur.get(bi)||1)]); }
    if(b.do)for(const [w,what,m1,m2] of b.do){ const a=get(w);
      if(what==='go')walk(w,m1,t0); else if(what==='face')a.faces.push([t0,m1]); else if(what==='a')a.acts.push([t0,m1]);
      else if(what==='enter'){ a.in=t0; pos[w]=plAt(m1); a.p0=pos[w].slice(); walk(w,m2,t0); }
      else if(what==='exit')a.out=walk(w,m1,t0); }
    if(b.hound==='enter'){ const p=plAt(b.from), q=pos.henry, d=Math.hypot(q[0]-p[0],q[1]-p[1]), k=Math.max(0,(d-1.3)/d); H.push([t0,t0+2.2,p[0],p[1],p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,0]); }
    if(b.hound==='leap'){ const p=H[H.length-1], q=pos.henry; H.push([t0,t0+1.1,p[4],p[5],q[0]+.45,q[1]-.15,1]); }
    if(b.hound==='flee'){ const p=H[H.length-1], q=plAt(b.to), r=plAt('OL'); H.push([t0,t0+1.9,p[4],p[5],q[0],q[1],0],[t0+1.9,t0+2.6,q[0],q[1],r[0],r[1]+1,0]); } }
  for(const a of Object.values(A)){ a.faces.sort((p,q)=>p[0]-q[0]); }
  return {A,H}; });
const PLCALL=(()=>{ const ws=['stapleton','mortimer','watson','holmes','henry','barrymore'], A={};
  ws.forEach((w,i)=>{ const x=PLMID+(i-2.5)*1.45, y=PLS.CY+1.1; A[w]={walks:[],faces:[[-1e9,'out']],acts:PLAYT.call.bow.map(t=>[t,'crouch']),talk:[],in:-1e9,out:1e9,p0:[x,y]}; }); return {A,H:[]}; })();
function plPos(a,t){ if(t<a.in||t>a.out)return null; let x=a.p0[0], y=a.p0[1], mv=null;
  for(const w of a.walks){ if(t<w[0])break; if(t>=w[1]){ x=w[4]; y=w[5]; continue; } const k=(t-w[0])/(w[1]-w[0]); x=w[2]+(w[4]-w[2])*k; y=w[3]+(w[5]-w[3])*k; mv=[w[4]-w[2],w[5]-w[3]]; break; }
  return {x,y,mv}; }
function plPlayer(a,t,TR){ const p=plPos(a,t); if(!p)return null; const {x,y,mv}=p;
  let f=null; for(const e of a.faces)if(e[0]<=t)f=e[1];
  const at=typeof f==='string'&&f!=='out'?(TR.A[f]?plPos(TR.A[f],t):PLAY.marks[f]?(m=>({x:m[0],y:m[1]}))(plAt(f)):null):null;
  const dir=mv||(f&&f.dir)||(at?[at.x-x,at.y-y]:[0,-1]);
  return {x,y,walking:!!mv,dir}; }
function plState(t){ const SC=PLAYT.scenes, C=PLAYT.call, cur=(S,E)=>t<S?0:t<S+PLAYT.open?plEase((t-S)/PLAYT.open):t<E?1:plEase(1-(t-E)/PLAYT.close);
  if(t<0||t>=PLL)return {si:-1,c:0,set:PLAY.scenes[0].set,lt:'house'};
  for(let i=0;i<SC.length;i++){ const {S,E}=SC[i]; if(t>=S&&t<E+PLAYT.close)return {si:i,c:cur(S,E),set:PLAY.scenes[i].set,lt:PLAY.scenes[i].lt}; }
  if(t>=C.S&&t<C.E+PLAYT.close)return {si:-2,c:cur(C.S,C.E),set:PLAY.scenes[SC.length-1].set,lt:'call'};
  if(t<SC[0].S)return {si:-1,c:0,set:PLAY.scenes[0].set,lt:t<SC[0].S-6?'house':'preshow'};
  if(t>=C.E+PLAYT.close)return {si:-1,c:0,set:PLAY.scenes[SC.length-1].set,lt:'house'};
  let n=SC.findIndex(s=>s.S>t); return {si:-1,c:0,set:PLAY.scenes[n<0?SC.length-1:n].set,lt:'between'}; }
function playFront(X,z,f){ const P=PFRONT, c=Math.floor((X-PLB.x0)*24),
  zz=Math.floor(z); if(c<0||c>=P.W||zz<0||zz>=P.H)return null; const o=P.a[zz*P.W+c]; if(!o)return null; if(o.e)return o; return sh(o,f); }
const props=()=>{ const S=PLS, B=PLB, wood=(x,y)=>{ const r=Math.floor(x*5), c=[[150,108,66],[140,100,60],[158,116,72]][Math.floor(hash(r,Math.floor(y/2),61)*3)]; return mt('wood',(x*5-r)<.07?sh(c,.72):c); };
  const BLK=[22,22,24], blk={c:BLK,top:()=>[30,30,32],fi:()=>[18,18,20],fj:()=>[24,24,26]}, GILT=[200,162,78], RED=[132,28,34];
  PNAME='stage'; prop([{x0:S.x0,y0:S.SY,x1:S.x1,y1:S.back,z0:0,z1:S.SZ,c:[120,86,54],top:wood,fi:(y,z)=>sh(z>S.SZ-3?GILT:[46,30,24],.62),fj:(x,z)=>sh(z>S.SZ-3?GILT:[52,34,26],.8)}
  ]);
  PNAME='proscenium'; const PT=B.h-8, ph=PT-S.PRZ, pil=(x0,x1)=>({x0,y0:S.PRY,x1,y1:S.PRY+.4,z0:S.SZ,z1:PT,c:RED,top:()=>GILT,fi:(y,z)=>sh(Math.abs(y-S.PRY-.2)<.12?GILT:RED,.62),fj:(x,z)=>sh((x-x0)%.5<.08||z%26<2?GILT:RED,.8)});
  prop([pil(S.x0,S.PRX0),pil(S.PRX1,S.x1),{x0:S.PRX0,y0:S.PRY,x1:S.PRX1,y1:S.PRY+.4,z0:S.PRZ,z1:PT,foot:0,c:RED,top:()=>GILT,fi:()=>sh(RED,.62),
    fj:(x,z)=>{ const k=z-S.PRZ; return sh(k<3||k>ph-4?GILT:Math.hypot((x-PLMID)*24,k-ph/2)<ph/2-5?[226,190,96]:RED,.8); }}],null,{high:true});
  PNAME='masking legs'; prop(S.LEGS.flatMap(y=>[{x0:S.x0,y0:y,x1:S.x0+S.legW,y1:y+.08,z0:S.SZ,z1:B.h-6,foot:1,...blk},{x0:S.x1-S.legW,y0:y,x1:S.x1,y1:y+.08,z0:S.SZ,z1:B.h-6,foot:1,...blk}]));
  const n=Math.round((S.SX1-S.SX0)/.72), w=(S.SX1-S.SX0)/n, V=[150,32,40], Vd=[112,22,30], IR=[36,34,36], arm=(a,y)=>({x0:a-.04,y0:y-.3,x1:a+.04,y1:y+.24,z0:0,z1:17,c:IR,top:()=>[118,82,52],fi:()=>sh(IR,.62),fj:()=>sh(IR,.8)});
  for(const y of S.rows)for(let i=0;i<n;i++){ const a=S.SX0+i*w; PNAME='playhouse chair'; prop([{x0:a+.05,y0:y-.18,x1:a+w-.05,y1:y+.22,z0:10,z1:13,c:V,top:()=>V,fi:()=>sh(Vd,.9),fj:()=>sh(V,.8)},
    {x0:a+.05,y0:y-.3,x1:a+w-.05,y1:y-.18,z0:10,z1:32,c:V,top:()=>sh(V,1.06),fi:()=>sh(Vd,.9),fj:(xx,z)=>sh(z>29?V:Vd,.85)},arm(a,y),...(i===n-1?[arm(a+w,y)]:[])]); }
  for(const [x,nx] of [[B.x0+T,1],[B.x1-T,-1]])for(const y of PLWALLS)STOREK.bar.theatreSconce(x,y,[nx,0]);
  PNAME='stage candles'; prop(PLCANDLES.flatMap(([x,y,h])=>[{x0:x-.07,y0:y-.07,x1:x+.07,y1:y+.07,z0:S.SZ,z1:S.SZ+2,foot:1,c:[176,140,64],top:()=>[200,160,72],fi:()=>[150,116,52],fj:()=>[176,140,64]},
    {x0:x-.02,y0:y-.02,x1:x+.02,y1:y+.02,z0:S.SZ+2,z1:S.SZ+h-6,foot:0,c:[176,140,64],top:()=>[200,160,72],fi:()=>[150,116,52],fj:()=>[176,140,64]},
    {x0:x-.05,y0:y-.05,x1:x+.05,y1:y+.05,z0:S.SZ+h-6,z1:S.SZ+h-5,foot:0,c:[176,140,64],top:()=>[200,160,72],fi:()=>[150,116,52],fj:()=>[176,140,64]},
    {x0:x-.035,y0:y-.035,x1:x+.035,y1:y+.035,z0:S.SZ+h-5,z1:S.SZ+h,foot:0,c:[238,230,206],top:()=>[244,238,218],fi:()=>[206,198,176],fj:()=>[230,222,198]},
    {x0:x-.03,y0:y-.03,x1:x+.03,y1:y+.03,z0:S.SZ+h,z1:S.SZ+h+5,c:[255,200,90],foot:0,nb:1,life:1,top:()=>null,fi:()=>null,fj:()=>null}]),null,{walk:true}); };
function plHoundAt(H,t){ if(!H.length||t<H[0][0]||t>=H[H.length-1][1])return null; let s=H[0]; for(const q of H)if(q[0]<=t)s=q;
  const run=t<s[1], k=run?(t-s[0])/(s[1]-s[0]):1, x=s[2]+(s[4]-s[2])*k, y=s[3]+(s[5]-s[3])*k, a=Math.atan2(s[5]-s[3],s[4]-s[2]);
  return {x,y,a,s:run?(t*2.6)%1:.12+.03*Math.sin(t*9),up:s[6]&&run?Math.sin(k*Math.PI)*.7:0}; }
const PLPRAC={baker:[PLMID-.4,ay(-42.75),30],hall:[PLMID-.2,PLC+2.6,62],moor:null,fog:null};
const bk=(x0,y0,z0,x1,y1,z1,c,e)=>[x0,y0,z0,x1,y1,z1,c,e], el=(x,y,z,r,c,e)=>bk(x-r[0],y-r[1],z-r[2],x+r[0],y+r[1],z+r[2],c,e), cy=(x,y,z0,z1,r,c,e)=>bk(x-r,y-r,z0,x+r,y+r,z1,c,e);
const M=[46,42,40], Wd=[96,58,36], Lt=[120,30,28], FI=[250,150,50], Ok=[64,44,30], OkD=[46,30,20], GO=[200,170,90], HE=[84,90,62], GR=[140,136,128], BA=[58,50,44];
const SETS={
  baker:[[PLMID-.4,ay(-44.48),[bk(-.75,-.12,0,-.42,.12,.95,M),bk(.42,-.12,0,.75,.12,.95,M),bk(-.42,.02,0,.42,.12,.95,[12,10,10]),bk(-.85,-.18,.95,.85,.16,1.05,Wd),bk(-.8,-.38,0,.8,.12,.04,[90,86,80]),
      bk(-.26,-.1,.04,.26,.04,.14,FI,1),el(-.1,-.03,.22,[.09,.06,.1],[255,214,120],1),el(.08,-.04,.2,[.08,.06,.08],FI,1),bk(-.45,.06,1.32,.45,.12,1.9,[186,150,70]),bk(-.38,.04,1.4,.38,.06,1.82,[70,96,104])]],
    ...[PLMID-2.2,PLMID+1.6].map(x=>[x,PLC+1.95,[bk(-.36,-.34,.28,.36,.34,.48,Lt),bk(-.36,.2,.48,.36,.36,1.25,Lt),bk(-.4,-.34,.48,-.27,.28,.74,Lt),bk(.27,-.34,.48,.4,.28,.74,Lt),
      ...[[-.3,-.28],[.3,-.28],[-.3,.3],[.3,.3]].map(([a,b])=>bk(a-.03,b-.03,0,a+.03,b+.03,.28,Wd))]]),
    [PLMID-.3,PLC+2.15,[cy(0,0,.6,.64,.24,Wd),cy(0,0,0,.6,.04,Wd),cy(0,0,.64,.7,.08,[176,140,70]),el(0,0,.82,[.07,.07,.11],[255,226,160],1),cy(0,0,.92,1.02,.1,[220,226,230])]],
    [PLMID-3.4,ay(-44.32),[bk(-.7,-.15,0,.7,.15,1.95,Wd,'books')]],
    [PLMID+3.5,PLC+2.95,[bk(-.7,-.04,.3,.7,.04,1.9,[226,220,206],'window')]],
    [PLMID-.3,PLC+1.7,[bk(-1.15,-.7,0,1.15,.7,.015,[110,34,36],'rug')]]],
  hall:[...[PLMID-4.1,PLMID-2.85,PLMID+2.85,PLMID+4.1].map(x=>[x,ay(-42.3),[bk(-.62,-.05,0,.62,.05,2.2,Ok,'panel')]]),
    [PLMID,ay(-44.3),[bk(-.8,-.05,0,.8,.05,2.2,Ok,'panel'),bk(-.5,-.1,.95,.5,-.05,2,[190,152,70],'portrait')]],
    [PLMID-.2,PLC+2.6,[bk(-1.1,-.36,.7,1.1,.36,.78,Ok),...[[-1,-.3],[1,-.3],[-1,.3],[1,.3]].map(([a,b])=>bk(a-.05,b-.05,0,a+.05,b+.05,.7,OkD)),cy(0,0,.78,1.15,.03,GO),bk(-.32,-.03,1.12,.32,.03,1.16,GO),
      ...[-.3,0,.3].flatMap(a=>[cy(a,0,1.16,1.34,.025,[238,232,214]),el(a,0,1.39,[.025,.025,.05],[255,214,130],1)])]],
    [PLMID+3.5,ay(-44.55),[bk(-.26,-.18,0,.26,.18,2.05,OkD,'clock')]]],
  moor:[...[[PLMID-3.6,1.3,.7],[PLMID-1.3,1.4,.95],[PLMID+1.2,1.3,.6],[PLMID+3.6,1.35,.85]].map(([x,r,h])=>[x,ay(-44.55),[bk(-r,-.45,0,r,.45,h*.55,HE),bk(-r*.6,-.3,h*.55,r*.6,.3,h,[92,74,88])]]),
    [PLMID+.7,ay(-42.75),[el(0,0,.3,[.6,.45,.3],GR),el(-.15,.05,.75,[.42,.35,.3],[150,146,136]),el(.3,-.1,.5,[.3,.28,.3],[110,108,102])]],
    [PLMID-2.3,PLC+.35,[el(0,0,.18,[.46,.3,.18],GR),el(.2,.05,.38,[.24,.2,.18],[150,146,136])]],
    ...[[-1.2,1.1],[1.8,.7],[2.6,2.2],[-3.1,2.6],[.2,.4],[3.4,1.3]].map(([x,y])=>[PLMID+x,PLC+y,[el(0,0,.06,[.22,.18,.06],[150,92,150]),el(.12,.06,.05,[.14,.12,.05],[104,84,70])]]),
    [PLMID+3.9,ay(-43.1),[cy(0,0,0,1.5,.07,BA),bk(.05,-.03,.9,.6,.03,.96,BA),bk(-.5,-.025,1.15,-.05,.025,1.2,BA),bk(.4,-.025,1.2,.46,.025,1.6,BA)]],
    ...Array.from({length:7},(_,i)=>[PLMID-4.3+hash(i,3,437)*.7,PLC+2.6+hash(i,4,439)*.8,[cy(0,0,0,.5+hash(i,1,431)*.3,.012,hash(i,2,433)<.5?[118,104,62]:[84,90,52])]])]};
SETS.fog=SETS.moor;
const HOUND=[el(0,0,1.02,[.62,.24,.26],[18,18,20]),el(.42,0,1.06,[.3,.24,.3],[18,18,20]),el(.72,0,1.32,[.18,.15,.2],[22,22,24]),el(.9,0,1.42,[.2,.15,.15],[18,18,20]),
  bk(1.02,-.08,1.28,1.24,.08,1.42,[150,230,100],1),el(1.04,-.09,1.48,[.035,.03,.03],[240,255,160],1),el(1.04,.09,1.48,[.035,.03,.03],[240,255,160],1),el(.82,-.12,1.58,[.06,.04,.09],[18,18,20]),el(.82,.12,1.58,[.06,.04,.09],[18,18,20]),
  ...[[.45,-.14],[.45,.14],[-.42,-.14],[-.42,.14]].map(([a,b])=>Object.assign(cy(a,b,.05,.85,.06,[22,22,24]),{leg:[a,b]})),Object.assign(el(-.66,0,1.12,[.22,.05,.05],[22,22,24]),{tail:1})];
return {PLS,PLMID,PLWALLS,PLCANDLES,PFRONT,playFront,playFloorCol,playWall,props,PLTR,PLCALL,plState,plPlayer,plHoundAt,SETS,HOUND,PLPRAC,plMark}; };
STOREK.play={PLAY,PLAYT,PLL,PLCUE,PLAYK};
}
