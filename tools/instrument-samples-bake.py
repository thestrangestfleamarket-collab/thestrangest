# THE INSTRUMENTS' RECORDED SOUNDS (owner, 8 Nov 2026: "it sounds like midi" ... "real sounds"): each instrument's real recordings, trimmed, made mono and laid end to
# end in one mp3 a instrument (data/<id>-samples.mp3, fetched the first time someone near plays), with a table of where each one starts (data/<id>-samples.json).
#   piano: the Salamander Grand Piano by Alexander Holm (CC BY 3.0), every third note (the Tone.js project's mp3s of it)
#   harp:  the VS Chamber Orchestra Community Edition's harp by Versilian Studios (CC0)
#   violin, flute, trumpet: the same Community Edition's solo violin (bowed, with vibrato), flute and trumpet (held notes), CC0; each one's pitch measured
#   drums: the MuldjordKit by Lars Muldjord, FreePats' version (CC BY 4.0): three loudnesses a piece, two takes each
# The downloads go to data/full/samples/ (not kept in git). Run: pip install py7zr; python3 tools/instrument-samples-bake.py (needs ffmpeg)
import os, re, sys, json, subprocess, urllib.request, struct, glob
want=lambda k: len(sys.argv)<2 or k in sys.argv[1:]   # python3 tools/instrument-samples-bake.py violin flute: only those
SRC='data/full/samples'; SR=44100; GAP=.12
def get(url,f):
    if os.path.exists(f) and os.path.getsize(f)>0: return f
    os.makedirs(os.path.dirname(f),exist_ok=True)
    r=urllib.request.Request(url.replace(' ','%20'),headers={'User-Agent':'TheStrangestFleaMarket-bake/1.0'}); open(f,'wb').write(urllib.request.urlopen(r,timeout=300).read()); return f
def pcm(f,dur):
    fade=min(dur*.35,1.5)
    out=subprocess.run(['ffmpeg','-v','error','-i',f,'-ac','1','-ar',str(SR),'-t',str(dur),'-af',f'afade=t=out:st={dur-fade}:d={fade}','-f','f32le','-'],capture_output=True,check=True).stdout
    return list(struct.unpack('<%df'%(len(out)//4),out))
def bake(id,items,credit,peak=.89):
    # items: [(key, file, seconds)]; laid end to end with a gap, the whole scaled to one peak (their loudness to each other kept)
    data=[]; table=[]; t=0
    for key,f,dur in items:
        x=pcm(f,dur); table.append([key,round(t+GAP,4),round(len(x)/SR,3)]); data+= [0.]*int(GAP*SR)+x; t+=GAP+len(x)/SR
    m=max(abs(v) for v in data) or 1; k=peak/m
    raw=struct.pack('<%df'%len(data),*[v*k for v in data])
    mp3=f'data/{id}-samples.mp3'
    subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar',str(SR),'-ac','1','-i','-','-c:a','libmp3lame','-b:a','96k',mp3],input=raw,check=True)
    json.dump({'credit':credit,'s':table},open(f'data/{id}-samples.json','w'),separators=(',',':'))
    print(id,len(table),'sounds',round(t,1),'s',os.path.getsize(mp3),'bytes')
NN={'C':0,'Cs':1,'Db':1,'D':2,'Ds':3,'Eb':3,'E':4,'F':5,'Fs':6,'Gb':6,'G':7,'Gs':8,'Ab':8,'A':9,'As':10,'Bb':10,'B':11}
midi=lambda n,o:12*(int(o)+1)+NN[n]
# the piano
if want('piano'):
    P=[]
    for o in range(9):
        for n in ['C','Ds','Fs','A']:
            m=midi(n,o)
            if m<21 or m>108: continue
            f=get(f'https://tonejs.github.io/audio/salamander/{n}{o}.mp3',f'{SRC}/piano/{n}{o}.mp3')
            P.append((m,f,max(3,min(9,9-(m-21)*.075))))
    bake('piano',P,'THE SALAMANDER GRAND PIANO, ALEXANDER HOLM (CC BY 3.0)')
# the harp
if want('harp'):
    H=[]
    for name in ['A2_mf','A4_mf','A6_mf','B1_mf','B3_mf','B5_mf','B6_mf','C3_mf','C5_mf','D2_mf','D4_mf','D6_mf','D7_f','E1_f','E3_mf','E5_mf','F2_mf','F4_mf','F6_mf','F7_f','G1_mp','G3_mf','G5_mf']:
        n,o=re.match(r'([A-G])(\d)',name).groups(); m=midi(n,o)
        f=get(f'https://raw.githubusercontent.com/sgossner/VSCO-2-CE/master/Strings/Harp/KSHarp_{name}.wav',f'{SRC}/harp/KSHarp_{name}.wav')
        H.append((m,f,max(2.5,min(6.5,6.5-(m-28)*.06))))
    H.sort()
    bake('harp',H,'THE VS CHAMBER ORCHESTRA COMMUNITY EDITION HARP, VERSILIAN STUDIOS (CC0)')
# the drums: each piece (the music engine's order: kick, snare, tom 1, tom 2, floor tom, hi-hat; then the open hi-hat, crash, ride, ride bell)
if want('drums'):
    KIT=f'{SRC}/drums/MuldjordKit-SFZ+FLAC-20201018.7z'
    get('https://github.com/freepats/muldjordkit/releases/download/2020-10-18/MuldjordKit-SFZ+FLAC-20201018.7z',KIT)
    KD=f'{SRC}/drums/kit'
    if not os.path.isdir(KD):
        import py7zr; py7zr.SevenZipFile(KIT).extractall(KD)
    base=glob.glob(f'{KD}/*/samples')[0]
    PIECES=[('k','KdrumL',.9),('s','Snare1',1.0),('t1','Tom1',1.6),('t2','Tom2',1.8),('ft','Tom4',2.2),('hc','HihatClosed',.5),('ho','HihatOpen',2.0),('cr','CrashL',3.5),('rd','RideL',3.0),('rb','RideRBell',2.5)]
    D=[]
    for key,d,dur in PIECES:
        fs=sorted(glob.glob(f'{base}/{d}/*.flac'),key=lambda f:int(os.path.basename(f).split('-')[0]))
        for L,u in enumerate([.35,.65,1]):
            i=max(1,min(len(fs)-1,round(u*(len(fs)-1))))
            for r in (0,1): D.append((f'{key}.{L}.{r}',fs[i-r],dur))
    bake('drums',D,'THE MULDJORDKIT, LARS MULDJORD (CC BY 4.0), FREEPATS')
# the violin, the flute and the trumpet: held notes, each one's real pitch measured (the library's octave names differ between instruments)
def pitch(f):
    x=pcm(f,1.2)[int(.5*SR):int(1.1*SR)]; n=len(x); best=(0,0)
    import numpy as np
    a=np.array(x); a=a-a.mean(); c=np.correlate(a,a,'full')[n-1:]; lo=int(SR/2400); hi=int(SR/80)
    i=lo+int(np.argmax(c[lo:hi])); thr=c[i]*.9
    for j in range(lo,i+1):
        if c[j]>=thr and c[j]>=c[j-1] and c[j]>=c[j+1]: i=j; break
    return round(69+12*np.log2(SR/i/440))
V2='https://raw.githubusercontent.com/sgossner/VSCO-2-CE/master/'
MEL={'violin':('Strings/Solo Violin/Arco Vib/LLVln_ArcoVib_%s_f.wav',['G3','A3','C4','E4','G4','A4','C5','E5','G5','A5','C6','E6','G6','A6','C7'],'SOLO VIOLIN'),
     'flute':('Woodwinds/Flute/susvib/LDFlute_susvib_%s_v1_1.wav',['C3','E3','A3','C4','E4','A4','C5','E5','A5','C6'],'FLUTE'),
     'trumpet':('Brass/Trumpet/sus/Sum_SHTrumpet_sus_%s_v3_rr1.wav',['F2','A2','C3','D#3','G3','A#3','D4','F4','A4','C5'],'TRUMPET')}
for id,(pat,names,nm) in MEL.items():
    if not want(id): continue
    X=[]
    for n in names:
        f=get(V2+(pat%n).replace('#','%23'),f'{SRC}/{id}/{n.replace("#","s")}.wav'); X.append((int(pitch(f)),f,3.6))
    X.sort(); print(id,[m for m,_,_ in X])
    bake(id,X,f'THE VS CHAMBER ORCHESTRA COMMUNITY EDITION {nm}, VERSILIAN STUDIOS (CC0)')
