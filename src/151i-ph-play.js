// THE PLAYHOUSE'S PLAY: A Midsummer Night's Dream, Act I, lightly cut, on the Wooden O's thrust stage (owner, 10 Nov 2026: "bring the play back on the stage"): the lines and who says them, where each player goes (in and out by the tiring house's doors and curtain), the throne and chair or the bench and stools brought on for each scene, timed into one show that starts at every hour and half hour for everyone at once; between shows the company is off, out of sight.
import {THREE} from './003-shx.js';
import {PHX} from './151b-ph-kit.js';
import {PHC} from './151h-ph-cast.js';
const PHP={};
// the marks on the stage (metres: x across, stage left +x; z up and down stage)
PHP.MARK={DSL:[3,-1.9],DSC:[0,-1.9],DSR:[-3,-1.9],SL:[3.2,-3.4],C:[0,-3.4],SR:[-3.2,-3.4],USL:[3,-5],USC:[0,-5.2],USR:[-3,-5],DLC:[1.4,-2.3],DRC:[-1.4,-2.3],LC:[1.6,-3.6],RC:[-1.6,-3.6],
  THRONE:[-.6,-6.45],HCHAIR:[.75,-6.45],STEPS:[0,-4.7],WSR:[-2.7,-7.0],WSL:[2.7,-7.0],WSR2:[-.5,-7.0],WSL2:[.5,-7.0],
  BENCH:[1.2,-4.85],ST1:[-1.2,-4.7],ST2:[0,-4.6],ST3:[1.2,-4.5],ST4:[2.3,-4.65],ST5:[3.6,-4.75],ST6:[.6,-6.55],DOOR:[-2.7,-7.3]};   // the wings' marks are the tiring house's doors (right, left) and its curtain
// the script: [who, line, {go:{who:mark}, to:whom they speak, act, sit:{who:1|0}, big}] or a cue: ['@', what, ...]
PHP.SCRIPT=[
  ['@','scene','I','ATHENS. THE PALACE OF THESEUS.'],['@','set','dusk'],['@','place',{theseus:'DRC',hippolyta:'DLC'}],['@','lx','out',3],['@','wait',3],['@','curtain',1],['@','lx','dusk',5],['@','wait',4],
  ['theseus','Now, fair Hippolyta, our nuptial hour draws on apace; four happy days bring in another moon: but, O, methinks, how slow this old moon wanes! She lingers my desires.',{to:'hippolyta'}],
  ['hippolyta','Four days will quickly steep themselves in night; four nights will quickly dream away the time; and then the moon, like to a silver bow new-bent in heaven, shall behold the night of our solemnities.',{to:'theseus',big:1}],
  ['theseus','Hippolyta, I wooed thee with my sword, and won thy love doing thee injuries; but I will wed thee in another key, with pomp, with triumph and with revelling.',{to:'hippolyta',act:'heart'}],
  ['@','enter',{egeus:['WSR','SR'],hermia:['WSR','RC'],lysander:['WSR2','USR'],demetrius:['WSR2','C']}],
  ['egeus','Happy be Theseus, our renowned duke!',{to:'theseus'}],
  ['theseus','Thanks, good Egeus: what’s the news with thee?',{to:'egeus',go:{theseus:'THRONE',hippolyta:'HCHAIR'},sit:{theseus:1,hippolyta:1}}],
  ['@','lx','dusk2',8],
  ['egeus','Full of vexation come I, with complaint against my child, my daughter Hermia. Stand forth, Demetrius. My noble lord, this man hath my consent to marry her.',{to:'theseus',act:'point',big:1}],
  ['egeus','Stand forth, Lysander: and, my gracious duke, this man hath bewitched the bosom of my child.',{to:'theseus',go:{lysander:'SL'},act:'point'}],
  ['egeus','As she is mine, I may dispose of her: which shall be either to this gentleman or to her death, according to our law.',{to:'theseus',big:1}],
  ['theseus','What say you, Hermia? Be advised, fair maid: to you your father should be as a god. Demetrius is a worthy gentleman.',{to:'hermia'}],
  ['hermia','So is Lysander.',{to:'theseus'}],
  ['theseus','In himself he is; but in this kind, wanting your father’s voice, the other must be held the worthier.',{to:'hermia'}],
  ['hermia','I would my father looked but with my eyes.',{to:'theseus',act:'plead'}],
  ['theseus','Rather your eyes must with his judgment look.',{to:'hermia'}],
  ['hermia','I do entreat your grace to pardon me. But I beseech your grace that I may know the worst that may befall me in this case, if I refuse to wed Demetrius.',{to:'theseus',go:{hermia:'C'},act:'kneel'}],
  ['@','set','court'],['@','lx','court',10],
  ['theseus','Either to die the death or to abjure for ever the society of men. Take time to pause; and, by the next new moon, upon that day either prepare to die for disobedience to your father’s will, or else to wed Demetrius, as he would.',{to:'hermia',sit:{theseus:0},go:{theseus:'STEPS'},big:1}],
  ['demetrius','Relent, sweet Hermia: and, Lysander, yield thy crazed title to my certain right.',{to:'hermia',go:{demetrius:'LC'}}],
  ['lysander','You have her father’s love, Demetrius; let me have Hermia’s: do you marry him.',{to:'demetrius',act:'point'}],
  ['egeus','Scornful Lysander! True, he hath my love, and what is mine my love shall render him.',{to:'lysander'}],
  ['lysander','I am, my lord, as well derived as he, as well possessed; and, which is more than all these boasts can be, I am beloved of beauteous Hermia.',{to:'theseus',go:{lysander:'DSL'},big:1}],
  ['theseus','For you, fair Hermia, look you arm yourself to fit your fancies to your father’s will. Come, my Hippolyta: what cheer, my love? Demetrius and Egeus, go along.',{to:'hermia',sit:{hippolyta:0},go:{hippolyta:'STEPS'}}],
  ['egeus','With duty and desire we follow you.',{to:'theseus'}],
  ['@','exit',{theseus:'WSL',hippolyta:'WSL',egeus:'WSL2',demetrius:'WSL2'}],['@','set','strike1'],['@','go',{lysander:'DLC',hermia:'DRC'}],['@','lx','lovers',6],['@','wait',3],
  ['lysander','How now, my love! Why is your cheek so pale? How chance the roses there do fade so fast?',{to:'hermia'}],
  ['hermia','Belike for want of rain, which I could well beteem them from the tempest of my eyes.',{to:'lysander'}],
  ['lysander','Ay me! For aught that I could ever read, could ever hear by tale or history, the course of true love never did run smooth.',{to:'hermia',act:'heart',follow:'lysander'}],
  ['@','set','wood'],['@','lx','wood',14],
  ['hermia','If then true lovers have been ever crossed, it stands as an edict in destiny: then let us teach our trial patience.',{to:'lysander',follow:'hermia'}],
  ['lysander','A good persuasion: therefore, hear me, Hermia. I have a widow aunt, a dowager; from Athens is her house remote seven leagues; there, gentle Hermia, may I marry thee. If thou lovest me then, steal forth thy father’s house to-morrow night; and in the wood, a league without the town, there will I stay for thee.',{to:'hermia',big:1,follow:'lysander'}],
  ['hermia','My good Lysander! I swear to thee, by Cupid’s strongest bow, by his best arrow with the golden head, to-morrow truly will I meet with thee.',{to:'lysander',act:'heart',follow:'hermia'}],
  ['lysander','Keep promise, love. Look, here comes Helena.',{to:'hermia',act:'point',follow:null}],
  ['@','enter',{helena:['WSR','SR']}],
  ['hermia','God speed fair Helena! Whither away?',{to:'helena'}],
  ['helena','Call you me fair? That fair again unsay. Demetrius loves your fair: O happy fair! O, teach me how you look, and with what art you sway the motion of Demetrius’ heart.',{to:'hermia',big:1}],
  ['hermia','I frown upon him, yet he loves me still.',{to:'helena'}],['helena','O that your frowns would teach my smiles such skill!',{to:'hermia'}],
  ['hermia','I give him curses, yet he gives me love.',{to:'helena'}],['helena','O that my prayers could such affection move!',{to:'hermia',act:'plead'}],
  ['hermia','The more I hate, the more he follows me.',{to:'helena'}],['helena','The more I love, the more he hateth me.',{to:'hermia'}],
  ['hermia','His folly, Helena, is no fault of mine.',{to:'helena'}],['helena','None, but your beauty: would that fault were mine!',{to:'hermia'}],
  ['hermia','Take comfort: he no more shall see my face; Lysander and myself will fly this place.',{to:'helena',go:{hermia:'C'}}],
  ['lysander','Helen, to you our minds we will unfold: to-morrow night, when Phoebe doth behold her silver visage in the watery glass, through Athens’ gates have we devised to steal.',{to:'helena',big:1}],
  ['hermia','Farewell, sweet playfellow: pray thou for us; and good luck grant thee thy Demetrius!',{to:'helena'}],['@','exit',{hermia:'WSL'}],
  ['lysander','Helena, adieu: as you on him, Demetrius dote on you!',{to:'helena'}],['@','exit',{lysander:'WSL2'}],
  ['@','go',{helena:'DSC'}],['@','lx','helena',5],['@','wait',2.5],
  ['helena','How happy some o’er other some can be! Through Athens I am thought as fair as she. Love looks not with the eyes, but with the mind; and therefore is winged Cupid painted blind.',{follow:'helena',big:1}],
  ['helena','I will go tell him of fair Hermia’s flight: then to the wood will he to-morrow night pursue her.',{follow:'helena'}],
  ['@','exit',{helena:'WSR'}],['@','follow',null],['@','wait',1.5],['@','curtain',0],['@','lx','out',4],['@','wait',6],
  ['@','scene','II','ATHENS. QUINCE’S HOUSE.'],['@','set','shop'],['@','place',{quince:'BENCH',bottom:'DSC',flute:'ST1',snout:'ST4',snug:'ST5',starveling:'ST2'},{sit:{flute:1,snout:1,snug:1,starveling:1}}],['@','wait',16],
  ['@','curtain',1],['@','lx','shop',5],['@','wait',4],
  ['quince','Is all our company here?',{to:'bottom'}],
  ['bottom','You were best to call them generally, man by man, according to the scrip.',{to:'quince',big:1}],
  ['quince','Here is the scroll of every man’s name, which is thought fit, through all Athens, to play in our interlude before the duke and the duchess, on his wedding-day at night.',{to:'bottom'}],
  ['bottom','First, good Peter Quince, say what the play treats on, then read the names of the actors, and so grow to a point.',{to:'quince',big:1}],
  ['quince','Marry, our play is, The most lamentable comedy, and most cruel death of Pyramus and Thisby.',{to:'bottom',act:'arms'}],
  ['@','set','flats'],['@','lx','flats',4],
  ['bottom','A very good piece of work, I assure you, and a merry. Now, good Peter Quince, call forth your actors by the scroll. Masters, spread yourselves.',{to:'quince',big:1,go:{bottom:'DLC'}}],
  ['quince','Answer as I call you. Nick Bottom, the weaver.',{to:'bottom'}],
  ['bottom','Ready. Name what part I am for, and proceed.',{to:'quince'}],
  ['quince','You, Nick Bottom, are set down for Pyramus.',{to:'bottom'}],
  ['bottom','What is Pyramus? A lover, or a tyrant?',{to:'quince'}],
  ['quince','A lover, that kills himself most gallant for love.',{to:'bottom',act:'heart'}],
  ['bottom','That will ask some tears in the true performing of it: if I do it, let the audience look to their eyes; I will move storms.',{to:'quince',big:1,go:{bottom:'DSC'},follow:'bottom'}],
  ['@','lx','bump',1.2],
  ['bottom','The raging rocks and shivering shocks shall break the locks of prison gates; and Phibbus’ car shall shine from far and make and mar the foolish Fates. This was lofty!',{act:'arms',big:1,follow:'bottom'}],
  ['@','lx','flats',2],['@','follow',null],
  ['quince','Francis Flute, the bellows-mender.',{to:'flute'}],
  ['flute','Here, Peter Quince.',{to:'quince',sit:{flute:0}}],
  ['quince','Flute, you must take Thisby on you.',{to:'flute'}],
  ['flute','What is Thisby? A wandering knight?',{to:'quince'}],
  ['quince','It is the lady that Pyramus must love.',{to:'flute'}],
  ['flute','Nay, faith, let not me play a woman; I have a beard coming.',{to:'quince',act:'plead'}],
  ['quince','That’s all one: you shall play it in a mask, and you may speak as small as you will.',{to:'flute'}],
  ['bottom','An I may hide my face, let me play Thisby too, I’ll speak in a monstrous little voice. ‘Thisne, Thisne; ah, Pyramus, lover dear! Thy Thisby dear, and lady dear!’',{to:'quince',act:'heart',big:1,go:{bottom:'C'}}],
  ['quince','No, no; you must play Pyramus: and, Flute, you Thisby.',{to:'bottom'}],
  ['bottom','Well, proceed.',{to:'quince'}],
  ['quince','Robin Starveling, the tailor: you must play Thisby’s mother. Tom Snout, the tinker: you, Pyramus’ father; myself, Thisby’s father. Snug, the joiner, you, the lion’s part: and, I hope, here is a play fitted.',{to:'starveling',sit:{starveling:0,snout:0,snug:0}}],
  ['snug','Have you the lion’s part written? Pray you, if it be, give it me, for I am slow of study.',{to:'quince',go:{snug:'SL'}}],
  ['quince','You may do it extempore, for it is nothing but roaring.',{to:'snug'}],
  ['bottom','Let me play the lion too: I will roar, that I will do any man’s heart good to hear me; I will roar, that I will make the duke say ‘Let him roar again, let him roar again.’',{act:'roar',big:1,go:{bottom:'DSC'}}],
  ['quince','An you should do it too terribly, you would fright the duchess and the ladies, that they would shriek; and that were enough to hang us all.',{to:'bottom'}],
  ['snout','That would hang us, every mother’s son.',{to:'quince'}],
  ['bottom','I will aggravate my voice so that I will roar you as gently as any sucking dove; I will roar you an ’twere any nightingale.',{act:'heart',big:1}],
  ['quince','You can play no part but Pyramus; for Pyramus is a sweet-faced man; a proper man, as one shall see in a summer’s day; therefore you must needs play Pyramus.',{to:'bottom'}],
  ['bottom','Well, I will undertake it.',{to:'quince'}],
  ['@','set','shopNight'],['@','lx','shopNight',8],
  ['quince','Masters, here are your parts: and I am to entreat you, request you and desire you, to con them by to-morrow night; and meet me in the palace wood, a mile without the town, by moonlight; there will we rehearse.',{to:'bottom',go:{quince:'C'},big:1}],
  ['bottom','We will meet; and there we may rehearse most obscenely and courageously. Take pains; be perfect: adieu.',{to:'quince',big:1}],
  ['quince','At the duke’s oak we meet.',{to:'bottom'}],
  ['bottom','Enough; hold or cut bow-strings.',{act:'arms'}],
  ['@','exit',{quince:'DOOR',flute:'DOOR',snout:'WSR',snug:'WSR2',starveling:'DOOR',bottom:'WSR'}],['@','wait',4],['@','curtain',0],['@','lx','out',3],['@','wait',4],
  ['@','call']];
PHP.make=K=>{ '@playhouse';
  const D=K.D, SY=D.SY, A=K.cast, MK=PHP.MARK, PI=Math.PI, mk=m=>typeof m==='string'?MK[m]:m;
  /* ---------- the show compiled into time: every line's start and length, every walk, every cue ---------- */
  const T=PHP.T={lines:[],cues:[],walk:{},sits:{},on:{},len:0,scenes:[]}, WALK=1.25;
  const pos={}, seg=(w,t0,p0,p1)=>{ const d=Math.hypot(p1[0]-p0[0],p1[1]-p0[1]), t1=t0+d/WALK; (T.walk[w]=T.walk[w]||[]).push([t0,t1,p0[0],p0[1],p1[0],p1[1]]); pos[w]=p1.slice(); return t1; };
  const onOff=(w,t,v)=>(T.on[w]=T.on[w]||[]).push([t,v]), sitAt=(w,t,v)=>(T.sits[w]=T.sits[w]||[]).push([t,v]);
  let t=0, id=0;
  for(const b of PHP.SCRIPT){
    if(b[0]==='@'){ const [,k,a,c]=b;
      if(k==='wait')t+=a; else if(k==='scene')T.scenes.push({t,n:a,where:c}); else if(k==='curtain')T.cues.push({t,k:'curtain',v:a}); else if(k==='lx')T.cues.push({t,k:'lx',v:a,d:c}); else if(k==='set')T.cues.push({t,k:'set',v:a}); else if(k==='follow')T.cues.push({t,k:'follow',v:a});
      else if(k==='place'){ for(const [w,m] of Object.entries(a)){ pos[w]=mk(m).slice(); (T.walk[w]=T.walk[w]||[]).push([t,t,pos[w][0],pos[w][1],pos[w][0],pos[w][1]]); onOff(w,t,1); } if(c&&c.sit)for(const [w,v] of Object.entries(c.sit))sitAt(w,t,v); }
      else if(k==='enter'){ for(const [w,[from,to]] of Object.entries(a)){ pos[w]=mk(from).slice(); onOff(w,t,1); seg(w,t,pos[w],mk(to)); } t+=2.4; }
      else if(k==='exit'){ let end=t; for(const [w,to] of Object.entries(a)){ sitAt(w,t,0); const e=seg(w,t,pos[w],mk(to)); end=Math.max(end,e); onOff(w,e,0); } t+=1.2; }
      else if(k==='go'){ let end=t; for(const [w,to] of Object.entries(a))end=Math.max(end,seg(w,t,pos[w],mk(to))); t=Math.max(t+.6,end-.4); }
      else if(k==='call'){ T.cues.push({t,k:'lx',v:'call',d:2}); const L=Object.keys(PHC.CAST); L.forEach((w,i)=>{ pos[w]=[-7.2+i*1.2,-2.4]; (T.walk[w]=T.walk[w]||[]).push([t,t,pos[w][0],pos[w][1],pos[w][0],pos[w][1]]); onOff(w,t,1); sitAt(w,t,0); });
        T.cues.push({t:t+1.5,k:'curtain',v:1}); T.call=[t+6,t+10,t+14]; T.cues.push({t:t+18,k:'curtain',v:0}); T.cues.push({t:t+20,k:'lx',v:'preset',d:4}); T.cues.push({t:t+20,k:'end'}); for(const w of L)onOff(w,t+24,0); t+=24; } continue; }
    const [w,s,o={}]=b, words=s.split(/\s+/).length, dur=Math.max(1.8,words/2.55+.6);
    if(o.go)for(const [q,m] of Object.entries(o.go))seg(q,t,pos[q],mk(m));
    if(o.sit)for(const [q,v] of Object.entries(o.sit))sitAt(q,t+(o.go&&o.go[q]?Math.hypot(...[0,1].map(i=>mk(o.go[q])[i]-(T.walk[q].at(-1)[2+i])))/WALK:0)+.1,v);
    if('follow' in o)T.cues.push({t,k:'follow',v:o.follow});
    T.lines.push({id:'l'+String(++id).padStart(3,'0'),t,d:dur,w,s,to:o.to,act:o.act,big:!!o.big}); t+=dur+.35; }
  T.len=t;
  const segAt=(L,t)=>{ let v=null; for(const e of L||[]){ if(e[0]<=t)v=e[1]; else break; } return v; };
  const posAt=(w,t)=>{ const L=T.walk[w]; if(!L)return null; let p=null, mv=null; for(const e of L){ if(t<e[0])break; if(t>=e[1]){ p=[e[4],e[5]]; mv=null; continue; } const k=(t-e[0])/(e[1]-e[0]); p=[e[2]+(e[4]-e[2])*k,e[3]+(e[5]-e[3])*k]; mv=[e[4]-e[2],e[5]-e[3]]; } return p?{p,mv}:null; };
  const lineAt=t=>{ for(const l of T.lines)if(t>=l.t&&t<l.t+l.d)return l; return null; }, lastLine=t=>{ let o=null; for(const l of T.lines){ if(l.t<=t)o=l; else break; } return o; };
  /* ---------- the clock: a show every hour and half hour; a minute before, the house is called ---------- */
  const SLOT=1800, PRE=60; PHP.over=null;
  const clock=()=>{ if(PHP.over!=null)return PHP.over+(performance.now()-PHP.overAt)/1000; const n=Date.now()/1000, s=n%SLOT; return s>SLOT-PRE?s-SLOT:s; };
  PHP.at=s=>{ PHP.over=s; PHP.overAt=performance.now(); PHP.applied=null; };
  PHX.show={running:()=>{ const c=clock(); return c>=-PRE&&c<T.len; },len:()=>T.len,clock,T,at:s=>PHP.at(s)};
  // the captions: the speaker's name and the line, under the stage while you are in the house
  const cap=document.createElement('div'); cap.id='phcap'; cap.style.cssText='position:fixed;left:50%;bottom:11%;transform:translateX(-50%);max-width:min(72ch,92vw);padding:7px 14px;background:rgba(10,6,8,.8);color:#f2e6c8;font:15px/1.45 Georgia,serif;text-align:center;border-top:1px solid #8a6a2a;z-index:9;display:none;pointer-events:none';
  document.body.appendChild(cap); K.cap=cap;
  const sc=document.createElement('div'); sc.style.cssText='position:fixed;left:50%;top:14%;transform:translateX(-50%);color:#e8c060;font:600 15px Georgia,serif;letter-spacing:3px;text-shadow:0 1px 3px #000;z-index:9;display:none;pointer-events:none'; document.body.appendChild(sc); K.sc=sc;
  // what is brought on for each scene: the duke's throne and Hippolyta's chair; Quince's bench and the stools
  const G=K.G, M=K.M, grp=()=>{ const g=new THREE.Group(); g.visible=false; G.add(g); return g; }, F=K.furn={court:grp(),shop:grp()};
  { const chair=(m,w,back,mat,trim)=>{ const [x,z]=MK[m], o={p:F.court}; K.box(w,.08,.55,mat,x,SY+.45,z,o); K.box(w,back,.08,mat,x,SY+.45+back/2,z-.28,o); for(const a of [-1,1])for(const b of [-1,1])K.box(.06,.45,.06,trim,x+a*(w/2-.05),SY+.225,z+b*.22,o); K.box(w+.06,.08,.1,trim,x,SY+.45+back,z-.28,o); };
    chair('THRONE',.8,1.5,M.velvet,M.gold); chair('HCHAIR',.6,1.0,M.velvet,M.gold); K.box(2.4,.12,1.2,M.velvet,.05,SY+.06,-6.4,{p:F.court}); }
  { const o={p:F.shop}, [bx,bz]=MK.BENCH; K.box(1.8,.08,.4,M.mahog,bx,SY+.45,bz,o); for(const a of [-.8,.8])K.box(.08,.45,.36,M.mahog,bx+a,SY+.225,bz,o);
    for(const m of ['ST1','ST2','ST3','ST4','ST5']){ const [x,z]=MK[m]; K.cyl(.18,.18,.06,M.mahog,x,SY+.42,z,{p:F.shop,seg:10}); for(const a of [0,2.1,4.2])K.rod([x+Math.cos(a)*.13,SY,z+Math.sin(a)*.13],[x+Math.cos(a)*.1,SY+.4,z+Math.sin(a)*.1],.02,M.mahog,{p:F.shop}); } }
  K.playDrop=()=>{ cap.remove(); sc.remove(); };
  PHP.state={applied:null};
};
PHX.parts.push({make:K=>PHP.make(K),drop:K=>K.playDrop&&K.playDrop(),
tick:(dt,K,now,inn)=>{ const T=PHP.T; if(!T||!K.cast)return; const S=PHX.show, c=S.clock(), A=K.cast, D=K.D, SY=D.SY, MK=PHP.MARK, t=Math.max(-61,c), PI=Math.PI;
  const live=c>=-60&&c<T.len, curOn=K.cloth&&K.cloth.curtain, LX=K.lx, ST=K.sets, st=PHP.state, jump=st.last==null||Math.abs(c-st.last)>2; st.last=c;
  // the cues up to now: the latest of each kind holds (so whoever comes in late sees the stage as it is)
  if(live){ let set='dusk', lx=c<-30?'preset':'halfHouse', lxd=3, cur=0, fol=null; for(const q of T.cues){ if(q.t>t)continue; if(q.k==='set')set=q.v; if(q.k==='lx'){ lx=q.v; lxd=q.d||3; } if(q.k==='curtain')cur=q.v; if(q.k==='follow')fol=q.v; if(q.k==='end'){ cur=0; } }
    if(c<0){ set='dusk'; cur=0; }
    if(st.set!==set){ ST&&ST.go(set,jump); st.set=set; if(K.furn){ K.furn.court.visible=['dusk','court','wood'].includes(set); K.furn.shop.visible=['shop','flats'].includes(set); } }
    if(st.lx!==lx){ LX&&LX.cue(lx,jump?.01:lxd); st.lx=lx; }
    if(st.cur!==cur){ curOn&&curOn.set(cur); if(jump&&curOn){ for(let i=0;i<300;i++)curOn.step(1/20,null); } st.cur=cur; }
    if(LX)LX.followAt=fol&&A[fol]?()=>{ const a=A[fol]; return [a.x,a.y+1.5,a.z]; }:[0,SY+1,-3];
    st.fol=fol; if(LX&&LX.ch.follow&&!fol&&LX.ch.follow.v>0&&!LX.ch.follow.from){ LX.ch.follow.from={v:LX.ch.follow.v,c:LX.ch.follow.c.clone()}; LX.ch.follow.to={v:0,c:LX.ch.follow.c.clone()}; LX.ch.follow.t0=LX.t; LX.ch.follow.dur=1.5; } }
  else if(st.set!=='idle'){ ST&&ST.go('strike',true); if(K.furn){ K.furn.court.visible=K.furn.shop.visible=false; } LX&&LX.cue('work',jump?.01:4); curOn&&curOn.set(0); st.set='idle'; st.lx='work'; st.cur=0; }
  // the players: on stage where the blocking puts them, else off and out of sight
  const ln=live?(()=>{ for(const l of T.lines)if(t>=l.t&&t<l.t+l.d)return l; return null; })():null;
  for(const [k,a] of Object.entries(A)){ let on=false; for(const e of T.on[k]||[]){ if(e[0]<=t)on=e[1]; else break; }
    let p, mv=null, sit=false; if(live&&on){ const r=(()=>{ const L=T.walk[k]; let p=null, mv=null; for(const e of L||[]){ if(t<e[0])break; if(t>=e[1]){ p=[e[4],e[5]]; mv=null; continue; } const q=(t-e[0])/(e[1]-e[0]); p=[e[2]+(e[4]-e[2])*q,e[3]+(e[5]-e[3])*q]; mv=[e[4]-e[2],e[5]-e[3]]; } return p?{p,mv}:null; })(); if(r){ p=r.p; mv=r.mv; }
      for(const e of T.sits[k]||[]){ if(e[0]<=t)sit=!!e[1]; else break; } }
    const off=!p; if(off)p=MK.WSR;
    a.x=p[0]; a.z=p[1]; a.y=K.groundAt(a.x,a.z)??SY;
    // facing: where they walk; else the one they speak to or the speaker, cheated out to the house
    let want=a.hd; if(mv)want=Math.atan2(mv[0],mv[1]); else if(!(live&&on))want=PI; else { const L=ln, tgt=L?(L.w===k?L.to:L.w):null, b=tgt&&A[tgt];
      want=b?Math.atan2(b.x-a.x,b.z-a.z):0; if(L&&L.w===k){ const out=0; const d=Math.atan2(Math.sin(out-want),Math.cos(out-want)); want+=d*.45; } if(sit&&(k==='theseus'||k==='hippolyta'))want=0; }
    const e=Math.atan2(Math.sin(want-a.hd),Math.cos(want-a.hd)); a.hd+=jump?e:Math.sign(e)*Math.min(Math.abs(e),dt*4);
    a.g.position.set(a.x,a.y,a.z); a.g.rotation.y=a.hd; a.g.visible=inn&&!off;
    if(!inn||off)continue; const near=Math.hypot((K.you?K.you().x:0)-a.x,(K.you?K.you().z:0)-a.z)<45; if(!near)continue;
    let act=null, at=0; if(ln&&ln.w===k&&ln.act){ act=ln.act; at=t-ln.t; }
    if(T.call&&live&&t>T.call[0]-1&&t<T.call[2]+3){ for(const b of T.call)if(t>=b&&t<b+2.2){ act='bow'; at=t-b; } }
    const talk=ln&&ln.w===k?Math.min(1,(t-ln.t)/.4)*Math.min(1,(ln.t+ln.d-t)/.3):0;
    K.posePlayer(a,dt,{walk:!!mv,sit,talk,big:ln&&ln.w===k&&ln.big,act,at,look:0},now/1000); }
  // the words and the scene's title
  if(K.cap){ const inHouse=inn; const s=ln&&inHouse?PHC.CAST[ln.w].n+'.  '+ln.s:''; if(K.cap._s!==s){ K.cap._s=s; K.cap.textContent=s; K.cap.style.display=s?'block':'none'; }
    let title=''; if(live&&inHouse)for(const q of T.scenes)if(t>=q.t+8&&t<q.t+14)title='ACT I · SCENE '+q.n+' · '+q.where; if(live&&inHouse&&c<0)title='CURTAIN IN '+Math.ceil(-c)+' S'; if(K.sc._s!==title){ K.sc._s=title; K.sc.textContent=title; K.sc.style.display=title?'block':'none'; } } }});
