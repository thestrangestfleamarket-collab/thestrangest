# THE HARP'S SONGS (owner, 7 Nov 2026: "lets do piano and drums and harp ... 100 skill in each"): Mutopia has almost no solo harp pieces, so the book is the
# piano's and the guitar's pieces (data/full/piano-pieces.tsv, guitar-pieces.tsv; their .mid already fetched by those bakes) that a pedal harp can really play:
# moved by whole octaves into its 34 strings (C2..A6, no strings for sharps: each letter's pedal makes all its strings flat, natural or sharp), every note put on
# a string and its pedal (the spelling that needs the fewest pedal moves, a pedal moved only when none of its strings has sounded in the last fifth of a second),
# four fingers a hand (harpists never use the little finger), the left hand below middle C. A piece is kept when nearly every note fits.
# Writes data/harp-songs.json: per piece its name, composer, credit, level and notes as [dt, string, pedal+1, length, hand] (dt and length in centiseconds).
# Run: pip install mido; python3 tools/harp-songs-bake.py (after the piano's and the guitar's bakes)
import os, json
LO,HI=36,93
LET=[0,2,4,5,7,9,11]   # C D E F G A B: the strings of an octave
def spell(pc):   # (letter, pedal) ways to sound a pitch class
    out=[]
    for li,n in enumerate(LET):
        for p in (-1,0,1):
            if (n+p)%12==pc: out.append((li,p))
    return out
def notes_of(path):
    import mido
    m=mido.MidiFile(path); tpb=m.ticks_per_beat; ev=[]
    for tr in m.tracks:
        t=0
        for msg in tr: t+=msg.time; ev.append((t,msg))
    ev.sort(key=lambda e:e[0])
    tempo=500000; last=0; sec=0.; on={}; out=[]
    for t,msg in ev:
        sec+=mido.tick2second(t-last,tpb,tempo); last=t
        if msg.type=='set_tempo': tempo=msg.tempo
        elif getattr(msg,'channel',0)==9: continue
        elif msg.type=='note_on' and msg.velocity>0: on.setdefault(msg.note,[]).append(sec)
        elif msg.type in ('note_off','note_on') and on.get(msg.note):
            s0=on[msg.note].pop(0); out.append([s0,msg.note,max(.05,sec-s0)])
    out.sort(); return out
def bake(path):
    ns=notes_of(path)
    if len(ns)<12: return None
    lo=min(n[1] for n in ns); hi=max(n[1] for n in ns); sh=0
    while lo+sh<LO: sh+=12
    while hi+sh>HI and lo+sh-12>=LO: sh-=12
    for n in ns: n[1]+=sh
    inn=[n for n in ns if LO<=n[1]<=HI]
    if len(inn)<.97*len(ns): return None
    ns=inn[:1600]
    G=[]
    for n in ns:
        if G and n[0]-G[-1][0][0]<.03: G[-1].append(n)
        else: G.append([n])
    ped=[0]*7; last=[-9.]*7; out=[]; tl=ns[0][0]; dropped=0; moves=0; most=0
    for g in G:
        t=g[0][0]; ms=sorted(set(n[1] for n in g))
        # four fingers a hand: the left hand under middle C, the right from it; the inner notes of a crowded hand go first
        L=[m for m in ms if m<60]; R=[m for m in ms if m>=60]
        while len(L)>4: L.pop(len(L)//2); dropped+=1
        while len(R)>4: R.pop(len(R)//2); dropped+=1
        want={}; ok=True
        for m in L+R:
            opts=spell(m%12)
            best=None
            for li,p in opts:
                nat=m-p
                s=((nat-36)//12)*7+li
                if not 0<=s<34: continue
                cost=0 if ped[li]==p else (1 if t-last[li]>.2 else 99)
                if li in want and want[li]!=p: cost=99
                cost+=abs(p)*.01
                if best is None or cost<best[0]: best=(cost,li,p,s)
            if best is None or best[0]>=99: ok=False; break
            want[best[1]]=best[2]
        if not ok: dropped+=len(L)+len(R); continue
        dur={n[1]:n[2] for n in g}
        first=True
        for m in L+R:
            for li,p in spell(m%12):
                if want.get(li)==p:
                    s=((m-p-36)//12)*7+li
                    if 0<=s<34: break
            if ped[li]!=p: moves+=1
            ped[li]=p; last[li]=t
            out.append([round((t-tl)*100) if first else 0,s,p+1,round(min(dur.get(m,.4),5)*100),0 if m<60 else 1]); first=False
        tl=t; most=max(most,len(L)+len(R))
    if dropped>.012*len(ns) or len(out)<12: return None
    T=max(1e-3,ns[-1][0]-ns[0][0]); nps=len(out)/T
    lvl=7*nps+3*most+30*moves/max(1,len(G))+min(12,T/25)
    return {'notes':out,'lvl':lvl,'secs':round(T)}
songs=[]; seen=set()
for LIST,MID in (('data/full/guitar-pieces.tsv','data/full/guitar-midi'),('data/full/piano-pieces.tsv','data/full/piano-midi')):
    for l in open(LIST):
        if not l.strip() or l.startswith('#'): continue
        title,comp,lic,url=l.rstrip('\n').split('\t')
        f=os.path.join(MID,url.rsplit('/',1)[1])
        if not os.path.exists(f) or title in seen: continue
        try: b=bake(f)
        except Exception as e: print('skip',title,e); continue
        if not b: continue
        seen.add(title); who=comp.replace('by ','').split(' (')[0]
        songs.append({'name':title,'by':who,'lvl':b['lvl'],'secs':b['secs'],'credit':f'{title}, {who}: Mutopia Project ({lic}), {url}','n':[v for row in b['notes'] for v in row]})
songs.sort(key=lambda s:(s['lvl'],s['name']))
for i,sg in enumerate(songs): sg['lvl']=round(1+99*i/max(1,len(songs)-1))
json.dump({'songs':songs},open('data/harp-songs.json','w'),separators=(',',':'),ensure_ascii=False)
print(len(songs),'songs',os.path.getsize('data/harp-songs.json'),'bytes')
