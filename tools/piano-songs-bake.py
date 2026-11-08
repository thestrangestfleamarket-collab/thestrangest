# THE PIANO'S SONGS (owner, 7 Nov 2026: "lets do piano and drums and harp ... 100 skill in each"): the Mutopia Project's solo piano pieces that are public domain or CC BY
# (data/full/piano-pieces.tsv: title, composer, licence, the .mid), each fetched into data/full/piano-midi/ and read as notes, each note given to a hand
# (the score's own staves when it has two, else by pitch), then rated 1..100 for how hard it is (notes a second, chord size, reach, leaps, length).
# Writes data/piano-songs.json: per piece its name, composer, credit, level and notes as [dt, midi, length, velocity*2+hand] (dt and length in centiseconds; hand 1 the right).
# Run: pip install mido; python3 tools/piano-songs-bake.py
import os, json, urllib.request
import mido
LIST='data/full/piano-pieces.tsv'; MID='data/full/piano-midi'; os.makedirs(MID,exist_ok=True)
MAXN=1500   # (a piece's first notes only past this: the book stays a small download)
def fetch(url):
    f=os.path.join(MID,url.rsplit('/',1)[1])
    if not os.path.exists(f):
        r=urllib.request.Request(url,headers={'User-Agent':'TheStrangestFleaMarket-bake/1.0'}); open(f,'wb').write(urllib.request.urlopen(r,timeout=60).read())
    return f
def notes_of(path):
    m=mido.MidiFile(path); tpb=m.ticks_per_beat; ev=[]
    for ti,tr in enumerate(m.tracks):
        t=0
        for msg in tr: t+=msg.time; ev.append((t,ti,msg))
    ev.sort(key=lambda e:(e[0],e[1]))
    tempo=500000; last=0; sec=0.; on={}; out=[]
    for t,ti,msg in ev:
        sec+=mido.tick2second(t-last,tpb,tempo); last=t
        if msg.type=='set_tempo': tempo=msg.tempo
        elif getattr(msg,'channel',0)==9: continue
        elif msg.type=='note_on' and msg.velocity>0: on.setdefault((ti,msg.note),[]).append((sec,msg.velocity))
        elif msg.type in ('note_off','note_on') and on.get((ti,msg.note)):
            s0,v=on[(ti,msg.note)].pop(0); out.append([s0,msg.note,max(.05,sec-s0),v,ti])
    out.sort(); return out
def hands(ns):
    tr={}
    for n in ns: tr.setdefault(n[4],[]).append(n[1])
    if len(tr)>=2:
        mean={k:sum(v)/len(v) for k,v in tr.items()}; top=sorted(mean,key=lambda k:-mean[k])
        right=top[0]
        for n in ns: n[4]=1 if n[4]==right else 0 if mean[n[4]]<mean[right]-2 else (1 if n[1]>=60 else 0)
    else:
        for n in ns: n[4]=1 if n[1]>=60 else 0
    # (no hand holds more than five at once: the lowest of a crowded right hand go to the left, the highest of a crowded left to the right)
    G=[]
    for n in ns:
        if G and n[0]-G[-1][0][0]<.03: G[-1].append(n)
        else: G.append([n])
    for g in G:
        for side,other in ((1,0),(0,1)):
            h=sorted([n for n in g if n[4]==side],key=lambda n:n[1])
            while len(h)>5:
                n=h.pop(0 if side==1 else -1); n[4]=other
    return ns
def bake(path):
    ns=notes_of(path)
    if len(ns)<12: return None
    ns=[n for n in ns if 21<=n[1]<=108][:MAXN]
    ns=hands(ns)
    t0=ns[0][0]; T=max(1e-3,ns[-1][0]+ns[-1][2]-t0)
    out=[]; last=t0
    for s0,m,d,v,h in ns:
        out.append([round((s0-last)*100),m,round(min(d,6)*100),min(15,max(1,round(v/8)))*2+h]); last=s0
    # how hard: notes a second, the most at once, the widest a hand stretches at once, the leaps a hand makes, how long
    G={}
    for s0,m,d,v,h in ns: G.setdefault((round(s0*33),h),[]).append(m)
    span=max(max(g)-min(g) for g in G.values()); most=max(len(g) for g in G.values())
    lp=0; prev={0:None,1:None}
    for (k,h),g in sorted(G.items()):
        c=sum(g)/len(g)
        if prev[h] is not None and abs(c-prev[h])>9: lp+=1
        prev[h]=c
    nps=len(ns)/T
    lvl=6*nps+2.5*most+.5*span+40*lp/max(1,len(G))+min(12,T/25)
    return {'notes':out,'lvl':lvl,'secs':round(T)}
rows=[l.rstrip('\n').split('\t') for l in open(LIST) if l.strip() and not l.startswith('#')]
songs=[]
for title,comp,lic,url in rows:
    try: b=bake(fetch(url))
    except Exception as e: print('skip',title,e); continue
    if not b: print('skip',title); continue
    who=comp.replace('by ','').split(' (')[0]
    songs.append({'name':title,'by':who,'lvl':b['lvl'],'secs':b['secs'],'credit':f'{title}, {who}: Mutopia Project ({lic}), {url}','n':[v for row in b['notes'] for v in row]})
songs.sort(key=lambda s:(s['lvl'],s['name']))
for i,sg in enumerate(songs): sg['lvl']=round(1+99*i/max(1,len(songs)-1))   # (levels spread 1..100 by how hard, easiest first)
json.dump({'songs':songs},open('data/piano-songs.json','w'),separators=(',',':'),ensure_ascii=False)
print(len(songs),'songs',os.path.getsize('data/piano-songs.json'),'bytes')
