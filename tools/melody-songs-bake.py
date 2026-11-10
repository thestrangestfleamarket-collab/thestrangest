# THE MELODY BOOK (owner, 9 Nov 2026: "Violin, flute, trumpet"): one book for the instruments that play one note at a time. It is the piano book's pieces
# (data/piano-songs.json, Mutopia, each credited) with only the tune kept: the right hand's top note at each moment, each held till the next or its own end.
# Each instrument moves a piece by whole octaves into its own range when it plays it. Levels 1-100 by how fast and how wide the tune is.
# Writes data/melody-songs.json: per piece its name, composer, credit, level, seconds and notes as [dt, midi, length] (centiseconds). Run: python3 tools/melody-songs-bake.py
import json
J=json.load(open('data/piano-songs.json')); out=[]
for g in J['songs']:
    n=g['n']; t=0; R=[]
    for i in range(0,len(n)-3,4):
        t+=n[i]
        if n[i+3]&1: R.append((t,n[i+1],n[i+2]))
    if len(R)<24: continue
    R.sort(); mel=[]
    for t,m,d in R:
        if mel and t-mel[-1][0]<=3:
            if m>mel[-1][1]: mel[-1]=(mel[-1][0],m,d)
        else: mel.append((t,m,d))
    for i in range(len(mel)-1):
        t,m,d=mel[i]; mel[i]=(t,m,max(4,min(d,mel[i+1][0]-t)))
    lo=min(m for _,m,_ in mel); hi=max(m for _,m,_ in mel)
    if hi-lo>31: continue
    secs=(mel[-1][0]+mel[-1][2])/100
    if secs<15: continue
    leap=sum(abs(mel[i+1][1]-mel[i][1]) for i in range(len(mel)-1))/len(mel)
    flat=[]; last=0
    for t,m,d in mel: flat+= [t-last,m,d]; last=t
    out.append({'name':g['name'],'by':g.get('by',''),'credit':g.get('credit',''),'secs':round(secs),'hard':len(mel)/secs*2.2+leap*.5+(hi-lo)*.08,'n':flat})
out.sort(key=lambda g:g['hard'])
for i,g in enumerate(out): g['lvl']=round(1+99*i/(len(out)-1)); del g['hard']
json.dump({'songs':out},open('data/melody-songs.json','w'),separators=(',',':'),ensure_ascii=False)
import os; print(len(out),'pieces',os.path.getsize('data/melody-songs.json'),'bytes')
