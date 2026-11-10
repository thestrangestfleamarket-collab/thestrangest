# THE RECORDED EFFECTS (owner, 9 Nov 2026: "real sounds"; footsteps and doors first): free recordings (CC0, OpenGameArt), each trimmed to its sound, made mono,
# levelled and laid end to end in one mp3 (data/sfx.mp3, fetched once the sound is on) with a table of where each take starts (data/sfx.json: name -> [[start, seconds], ...]).
# SFX.play(name) plays a take at random; a name with no takes plays its code-made recipe (src/091-sfx.js). A new batch: add its lines to PACKS and SETS, run, add its record to data/full/sounds.json.
# The downloads go to data/full/sfx/ (not kept in git). Run: pip install py7zr; python3 tools/sfx-bake.py (needs ffmpeg)
import os, json, struct, subprocess, urllib.request, zipfile
SR=32000; GAP=.08; D='data/full/sfx/'
PACKS={   # folder: the pack's file (its page and author are in data/full/sounds.json)
 'fantozzi':'https://opengameart.org/sites/default/files/Fantozzi-footsteps.7z',
 'tinyworlds':'https://opengameart.org/sites/default/files/%5Bkdd%5DDifferentSteps_0.zip',
 'qubodup':'https://opengameart.org/sites/default/files/qubodup-DoorSet.7z',
 'coughe':'https://opengameart.org/sites/default/files/DoorLockSounds.zip'}
F='fantozzi/Fantozzi-footsteps/flac/Fantozzi-'; Q='qubodup/qubodup-DoorSet/flac/qubodup-Door'
SETS={   # name: (its takes, how loud next to the others)
 'step_stone':([F+f'Stone{s}{i}.flac' for s in 'LR' for i in (1,2,3)],.8),
 'step_grass':([F+f'Sand{s}{i}.flac' for s in 'LR' for i in (1,2,3)],.7),
 'step_wood':([f'tinyworlds/wood0{i}.ogg' for i in (1,2,3)],.8),
 'dooropen':([Q+f'Open{n}.flac' for n in ('01','05','07','08')],.9),
 'door':([Q+f'Close{n}.flac' for n in ('04','07','08','10')],.9),
 'latch':(['coughe/DoorLockSounds/DoorLock.wav','coughe/DoorLockSounds/UnlockDoor.wav'],.6)}
def get(k,url):
    d=D+k
    if os.path.isdir(d) and os.listdir(d): return
    os.makedirs(d,exist_ok=True); f=d+'.pack'
    open(f,'wb').write(urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'sfx-bake/1.0'}),timeout=300).read())
    if url.endswith('.zip'): zipfile.ZipFile(f).extractall(d)
    else:
        import py7zr; py7zr.SevenZipFile(f).extractall(d)
    os.remove(f)
def pcm(f):
    out=subprocess.run(['ffmpeg','-v','error','-i',f,'-ac','1','-ar',str(SR),'-f','f32le','-'],capture_output=True,check=True).stdout
    x=list(struct.unpack('<%df'%(len(out)//4),out)); pk=max(abs(v) for v in x) or 1
    a=next(i for i,v in enumerate(x) if abs(v)>pk*.03); b=len(x)-next(i for i,v in enumerate(reversed(x)) if abs(v)>pk*.015)
    a=max(0,a-int(.004*SR)); b=min(len(x),b+int(.03*SR)); x=x[a:b]; n=len(x); fi=int(.002*SR); fo=min(n//3,int(.03*SR))
    return [v/pk*(min(1,i/fi))*(min(1,(n-i)/fo)) for i,v in enumerate(x)]
for k,u in PACKS.items(): get(k,u)
data=[]; table={}; t=0
for name,(files,lvl) in SETS.items():
    table[name]=[]
    for f in files:
        x=[v*lvl*.89 for v in pcm(D+f)]; table[name].append([round(t+GAP,4),round(len(x)/SR,3)]); data+=[0.]*int(GAP*SR)+x; t+=GAP+len(x)/SR
data+=[0.]*int(GAP*SR)
subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar',str(SR),'-ac','1','-i','-','-c:a','libmp3lame','-b:a','96k','data/sfx.mp3'],input=struct.pack('<%df'%len(data),*data),check=True)
json.dump(table,open('data/sfx.json','w'),separators=(',',':'))
print({k:len(v) for k,v in table.items()},round(t,1),'s',os.path.getsize('data/sfx.mp3'),'bytes')
