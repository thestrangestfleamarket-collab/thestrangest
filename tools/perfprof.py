# A PROFILING COPY OF THE MARKET (perf audit, 17 Oct 2026): dist/market.html with a timer round each system of the frame and the renderer
# handed to the page (window.__R), for tests/perfaudit.cjs. Never published; the game's own page is untouched.
# Run: python3 tools/perfprof.py [dist/market.html] [out.html]
import sys
src = sys.argv[1] if len(sys.argv) > 1 else 'dist/market.html'
out = sys.argv[2] if len(sys.argv) > 2 else 'dist/market-prof.html'
h = open(src).read()
a = h.index('function frame(now){'); b = h.index('\n}\n', a) + 3; F = h[a:b]
# (start, end, name): the frame's systems, each timed from its first text to the end of its last
SEG = [('trip=false; let B;', 'J0=B.J; J0t=now; }', 'walker rig'),
       ('W3.place(', 'if(ED.on)ED.tick();', 'walker place + physbody'),
       ('phyYouNow(dt);', 'looseDraw();', 'loose physics'),
       ('{ const px=FLOATS.px', 'FLOATS.pz=pos.z; }', 'floats'),
       ("if(typeof UI!=='undefined'&&UI.freeCam)LITE.tick", 'LITE.tick(dt,pos.x,py+1.2*TILE,pos.z);', 'LITE.tick'),
       ('DRESS.tick(dt,pos);', None, 'DRESS'), ('{ const r=MODS.apts.tick(); if(r)solids=r; }', None, 'apts.tick'),
       ('{ const r2=STORE.stackTick&&STORE.stackTick(); if(r2)solids=r2; }', None, 'STORE.stackTick'),
       ('NPCS.tick(dt,pos);', None, 'NPCS.tick'), ('if(FIRE)FIRE.tick(dt);', None, 'FIRE'), ('FIGFX.tick(dt,pos);', None, 'FIGFX'),
       ('FLAME.tick(dt,pos);', None, 'FLAME'), ('MUS.tick(dt);', 'STAGE.tick(dt);', 'musicians+stage'),
       ('UI.goTick(); UI.runTick();', None, 'UI'), ('CLOCK.tick(dt);', None, 'CLOCK(+weather)'), ('VIT.tick(dt);', None, 'VIT'),
       ('LOOK.tick();', None, 'LOOK'), ('for(const w of cutWalls)', '?w.foot:1e6;', 'cutWalls'),
       ('ROOMS.tick();', None, 'ROOMS.tick'), ('STORE.tick();', None, 'STORE.tick'), ('BF.tick(dt);', None, 'butterflies'),
       ('if(wOn)WATER.step(renderer,dt);', None, 'WATER.step'), ('WATER.tickAll(renderer,dt,pos);', None, 'WATER.tickAll'),
       ('if(wOn&&WATER.mesh.visible)WATER.under(renderer,scene,cam,lamps);', None, 'WATER.under'),
       ('WATER.underAll(renderer,scene,cam,lamps);', None, 'WATER.underAll'), ('W3.shadowPass(renderer);', None, 'self-shadow passes'),
       ('if(OUTL.on)OUTL.render(renderer,scene,cam);', None, 'outline'), ('composer.render();', None, 'composer.render')]
for s, e, n in SEG:
    i = F.index(s); F = F[:i] + '__PS();' + F[i:]
    j = F.index(e or s, i + 7) + len(e or s); F = F[:j] + "__PE(%r);" % n + F[j:]
# the whole frame, and a fresh count of the renderer's work each frame
F = F.replace('last=now;', "last=now; __PF.cur={}; __PF.f0=performance.now(); if(window.__R)__R.renderer.info.reset();", 1)
F = F.replace('  fpsN++;', "  __PF.cur.total=performance.now()-__PF.f0; __PF.hist.push(__PF.cur); if(__PF.hist.length>900)__PF.hist.shift(); if(__PF.onFrame)__PF.onFrame();\n  fpsN++;", 1)
PRE = ("const __PF={cur:{},hist:[],s:[]}; window.__PF=__PF; const __PS=()=>__PF.s.push(performance.now());"
       " const __PE=n=>{ __PF.cur[n]=(__PF.cur[n]||0)+performance.now()-__PF.s.pop(); };\n")
h = h[:a] + PRE + F + h[b:]
# the renderer and the systems, for the test to look into
EXP = ("window.__R={renderer,composer,scene,get cam(){return cam;},lamps,BATCH,ROOMS,LITE,WATER,MODS,MAPG,STORE,W3,NPCS,"
       "get MUS(){return typeof MUS!=='undefined'?MUS:null;},get PNM(){return typeof PNM!=='undefined'?PNM:null;},get SGM(){return typeof SGM!=='undefined'?SGM:null;},get DRM(){return typeof DRM!=='undefined'?DRM:null;},"
       "get APTS(){return typeof APTS!=='undefined'?APTS:null;},OUTL,get RW(){return RW;},get RH(){return RH;},get LVL(){return LVL;},get pos(){return pos;},get FLAME(){return typeof FLAME!=='undefined'?FLAME:null;},get FIRE(){return FIRE;},get BODB(){return typeof BODB!=='undefined'?BODB:null;}};")
k = h.index('window.__started=true;'); h = h[:k] + EXP + h[k:]
open(out, 'w').write(h)
print('wrote', out, len(SEG), 'segments')
