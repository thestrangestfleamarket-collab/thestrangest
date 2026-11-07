# THE GUITAR'S SONGS (owner, 7 Nov 2026: "download real tab ... can play all the songs"): the Mutopia Project's guitar pieces that are public domain or CC BY
# (data/full/guitar-pieces.tsv: title, composer, licence, the .mid), each fetched into data/full/guitar-midi/, read as notes and fingered for the guitar:
# every chord's notes put on strings and frets (standard tuning, frets 0..19, no two on one string, the fretted ones within a hand's span), the whole piece
# chosen at once (least moving of the hand, lowest frets) by a Viterbi pass; then rated 1..100 for how hard it is (notes a second, chord size, reach, shifts).
# Writes data/guitar-songs.json: per piece its name, composer, credit, level and notes as [dt, string, fret, length] (dt and length in centiseconds).
# Run: pip install mido; python3 tools/guitar-songs-bake.py
import os, sys, json, math, urllib.request, itertools
import mido
LIST='data/full/guitar-pieces.tsv'; MID='data/full/guitar-midi'; os.makedirs(MID,exist_ok=True)
OPEN=[64,59,55,50,45,40]   # string 1 (high E) to 6 (low E)
FMAX=19
def notes_of(path):
    m=mido.MidiFile(path); tpb=m.ticks_per_beat; ev=[]
    for tr in m.tracks:
        t=0
        for msg in tr: t+=msg.time; ev.append((t,msg))
    ev.sort(key=lambda e:e[0])
    tempo=500000; last=0; sec=0.; on={}; out=[]
    for t,msg in ev:
        sec+=mido.tick2second(t-last,tpb,tempo); last=t
        if msg.type=='set_tempo': tempo=msg.tempo
        elif msg.type=='note_on' and msg.velocity>0: on.setdefault(msg.note,[]).append(sec)
        elif msg.type in ('note_off','note_on') and on.get(msg.note):
            s0=on[msg.note].pop(0); out.append([s0,msg.note,max(.05,sec-s0)])
    out.sort(); return out
def chords(ns):
    g=[]
    for n in ns:
        if g and n[0]-g[-1][0][0]<.03: g[-1].append(n)
        else: g.append([n])
    return g
def options(p):
    return [(s,p-OPEN[s]) for s in range(6) if 0<=p-OPEN[s]<=FMAX]
def cands(ch):
    ps=sorted(set(n[1] for n in ch),reverse=True)[:6]
    opts=[options(p) for p in ps]
    if any(not o for o in opts): return ps,[]
    out=[]
    for combo in itertools.product(*opts):
        ss=[c[0] for c in combo]
        if len(set(ss))<len(ss): continue
        fr=[c[1] for c in combo if c[1]>0]
        if fr and max(fr)-min(fr)>4: continue
        out.append(combo)
    out.sort(key=lambda c:sum(k for _,k in c)); return ps,out[:40]
def bake(path):
    ns=notes_of(path)
    if not ns: return None
    # into the guitar's range by whole octaves (the scores' MIDI is often written an octave up)
    lo=min(n[1] for n in ns); hi=max(n[1] for n in ns); sh=0
    while lo+sh<40: sh+=12
    while hi+sh>OPEN[0]+FMAX and lo+sh-12>=40: sh-=12
    for n in ns: n[1]+=sh
    ns=[n for n in ns if 40<=n[1]<=OPEN[0]+FMAX]
    G=chords(ns); C=[]
    for ch in G:
        ps,cs=cands(ch)
        while not cs and len(ps)>1:   # too many or unplayable together: drop the inner voices first
            ch=[n for n in ch if n[1]!=ps[len(ps)//2]]; ps,cs=cands(ch)
        C.append((ch,ps,cs))
    # Viterbi: the hand's place (the lowest fretted fret) moving as little as it can, low frets preferred
    pos=lambda c:min([k for _,k in c if k>0],default=None)
    prev=[(0.,None,[])]
    for ch,ps,cs in C:
        if not cs: continue
        nxt=[]
        for c in cs:
            p=pos(c); mk=max([k for _,k in c],default=0); base=sum(k for _,k in c)*.18+mk*.25+(mk-(p or mk))*.3+(.0 if mk<=5 else .4*(mk-5))
            best=None
            for cost,pp,path in prev:
                mv=0 if p is None or pp is None else abs(p-pp)*(.5+.1*abs(p-pp))
                v=cost+base+mv
                if best is None or v<best[0]: best=(v,p if p is not None else pp,path)
            nxt.append((best[0],best[1],best[2]+[(ch,ps,c)]))
        nxt.sort(key=lambda x:x[0]); prev=nxt[:25]
    path=min(prev,key=lambda x:x[0])[2]
    out=[]; t0=path[0][0][0][0] if path else 0; last=t0; shifts=0; pp=None; maxk=0; chmax=0
    for ch,ps,c in path:
        t=ch[0][0]; dur={n[1]:n[2] for n in ch}
        for (s,k),p in zip(c,ps):
            out.append([round((t-last)*100),s+1,k,round(min(dur.get(p,.3),4)*100)]); last=t
        p=pos(c)
        if p is not None and pp is not None and abs(p-pp)>2: shifts+=1
        if p is not None: pp=p
        maxk=max(maxk,max(k for _,k in c)); chmax=max(chmax,len(c))
    T=max(1e-3,ns[-1][0]-ns[0][0])
    nps=len(out)/T
    lvl=round(max(1,min(100,8*nps+3*chmax+1.2*maxk+40*shifts/max(1,len(path))+min(15,T/20))))
    return {'notes':out,'lvl':lvl,'secs':round(T)}
rows=[l.rstrip('\n').split('\t') for l in open(LIST) if l.strip() and not l.startswith('#')]
songs=[]
for i,(title,comp,lic,url) in enumerate(rows):
    f=os.path.join(MID,url.rsplit('/',1)[1])
    if not os.path.exists(f):
        r=urllib.request.Request(url,headers={'User-Agent':'TheStrangestFleaMarket-bake/1.0'}); open(f,'wb').write(urllib.request.urlopen(r,timeout=60).read())
    try: b=bake(f)
    except Exception as e: print('skip',title,e); continue
    if not b or len(b['notes'])<8: print('skip',title); continue
    who=comp.replace('by ','').split(' (')[0]
    songs.append({'name':title,'by':who,'lvl':b['lvl'],'secs':b['secs'],'credit':f'{title}, {who}: Mutopia Project ({lic}), {url}','n':[v for row in b['notes'] for v in row]})
songs.sort(key=lambda s:(s['lvl'],s['name']))
for i,sg in enumerate(songs): sg['lvl']=round(1+99*i/max(1,len(songs)-1))   # (levels spread 1..100 by how hard, easiest first)
json.dump({'songs':songs},open('data/guitar-songs.json','w'),separators=(',',':'),ensure_ascii=False)
print(len(songs),'songs',os.path.getsize('data/guitar-songs.json'),'bytes; levels',min(s['lvl'] for s in songs),'to',max(s['lvl'] for s in songs))
