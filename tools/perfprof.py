# A PROFILING COPY OF THE MARKET (perf audit, 17 Oct 2026; rewritten 27 Oct 2026): dist/market.html with a timer round each system of the
# frame and the renderer handed to the page (window.__R), for tests/perfaudit.cjs. Never published; the game's own page is untouched.
# Build readable first (the frame's locals keep their names): MIN=0 python3 build.py && python3 tools/perfprof.py
# Each system times itself through SYS.go(fn,'name') and SYS.run('phase',...) (the name strings survive the build), so the loop can be
# re-ordered without touching this file; the frame's own total and the renderer's per-pass work (tests/perfaudit.cjs hooks it) fill in the rest.
import re, sys
src = sys.argv[1] if len(sys.argv) > 1 else 'dist/market.html'
out = sys.argv[2] if len(sys.argv) > 2 else 'dist/market-prof.html'
h = open(src).read()
m = re.search(r'function frame\(now(?:,\w+)?\)\{', h)
if not m:
    sys.exit('perfprof: could not find the frame function (build with MIN=0 first)')
a = m.start(); b = h.index('\n}\n', a) + 3; F = h[a:b]
if 'last=now;' not in F or '  fpsN++;' not in F:
    sys.exit('perfprof: the frame boundary markers moved (last=now; / fpsN++;)')
# the frame's edges: a fresh segment store and renderer count at the top, the total and a push at the bottom (before the fps line resets it)
F = F.replace('last=now;', "last=now; __PF.cur={}; __PF.f0=performance.now(); if(window.__R)__R.renderer.info.reset();", 1)
F = F.replace('  fpsN++;', "  __PF.cur.total=performance.now()-__PF.f0; __PF.hist.push(__PF.cur); if(__PF.hist.length>900)__PF.hist.shift(); if(__PF.onFrame)__PF.onFrame();\n  fpsN++;", 1)
# every system names itself: time SYS.go by its name, SYS.run by its phase (both keep their name strings through the minifier)
PRE = ("const __PF={cur:{},hist:[],s:[]}; window.__PF=__PF; const __PS=()=>__PF.s.push(performance.now());"
       " const __PE=n=>{ __PF.cur[n]=(__PF.cur[n]||0)+performance.now()-__PF.s.pop(); };\n"
       "{ const __g0=SYS.go, __r0=SYS.run;\n"
       "  SYS.go=(fn,name)=>__g0(()=>{ const __t=performance.now(); try{ fn(); } finally{ __PF.cur['go:'+name]=(__PF.cur['go:'+name]||0)+performance.now()-__t; } },name);\n"
       "  SYS.run=(ph,...a)=>{ const __t=performance.now(); __r0(ph,...a); __PF.cur['run:'+ph]=(__PF.cur['run:'+ph]||0)+performance.now()-__t; }; }\n")
h = h[:a] + PRE + F + h[b:]
# the renderer and the systems, for the test to look into
# composer, cam, LVL, FIRE, BODB moved onto SHARED since this tool was first written (the frame loop's rewrite); read them there
EXP = ("window.__R={renderer,get composer(){return SHARED.composer;},scene,get cam(){return SHARED.cam;},lamps,BATCH,ROOMS,LITE,WATER,MODS,MAPG,STORE,W3,NPCS,"
       "get MUS(){return typeof MUS!=='undefined'?MUS:null;},get PNM(){return typeof PNM!=='undefined'?PNM:null;},get SGM(){return typeof SGM!=='undefined'?SGM:null;},get DRM(){return typeof DRM!=='undefined'?DRM:null;},"
       "get APTS(){return typeof APTS!=='undefined'?APTS:null;},OUTL,get RW(){return RW;},get RH(){return RH;},get LVL(){return SHARED.LVL;},get pos(){return pos;},get FLAME(){return typeof FLAME!=='undefined'?FLAME:null;},get FIRE(){return SHARED.FIRE;},get BODB(){return SHARED.BODB;}};")
k = h.index('window.__started=true;'); h = h[:k] + EXP + h[k:]
open(out, 'w').write(h)
print('wrote', out, '(systems time themselves through SYS.go / SYS.run)')
