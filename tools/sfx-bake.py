# THE RECORDED EFFECTS (owner, 9 Nov 2026: "real sounds"; footsteps and doors first): free recordings (CC0, OpenGameArt), each trimmed to its sound, made mono,
# levelled and laid end to end in one mp3 (data/sfx.mp3, fetched once the sound is on) with a table of where each take starts (data/sfx.json: name -> [[start, seconds], ...]).
# SFX.play(name) plays a take at random; a name with no takes plays its code-made recipe (src/091-sfx.js). A new batch: add its lines to PACKS and SETS, run, add its record to data/full/sounds.json.
# The downloads go to data/full/sfx/ (not kept in git). Run: pip install py7zr; python3 tools/sfx-bake.py (needs ffmpeg)
# The owner's SOUND EDITOR: python3 tools/sfx-bake.py --shared sounds-export.json keeps its uploads in data/full/sfx/shared/ and its set in
# data/full/sfx/shared.json (both in git), laid over SETS on every bake: a name's takes (a baked one or an upload, trimmed), its level and pitch (sfx.json's ~set).
import os, sys, json, struct, base64, subprocess, urllib.request, zipfile
SR=32000; GAP=.08; D='data/full/sfx/'
PACKS={   # folder: the pack's file (its page and author are in data/full/sounds.json)
 'fantozzi':'https://opengameart.org/sites/default/files/Fantozzi-footsteps.7z',
 'tinyworlds':'https://opengameart.org/sites/default/files/%5Bkdd%5DDifferentSteps_0.zip',
 'qubodup':'https://opengameart.org/sites/default/files/qubodup-DoorSet.7z',
 'coughe':'https://opengameart.org/sites/default/files/DoorLockSounds.zip',
 'ggbotnet':['https://opengameart.org/sites/default/files/'+f+'.ogg' for f in ('car_door_close_0','car_door_open_0','car_engine_loop_1','car_engine_start_up_0','car_engine_turning_off_0','car_horn_0')],
 'kresiek':['https://opengameart.org/sites/default/files/amb_rain_loop_1.ogg'],
 'wuxiascrub':['https://opengameart.org/sites/default/files/rain-thunder.ogg'],
 'rubberduck':'https://opengameart.org/sites/default/files/sfx_100_v2.zip'}
F='fantozzi/Fantozzi-footsteps/flac/Fantozzi-'; Q='qubodup/qubodup-DoorSet/flac/qubodup-Door'
SETS={   # name: (its takes, how loud next to the others)
 'step_stone':([F+f'Stone{s}{i}.flac' for s in 'LR' for i in (1,2,3)],.8),
 'step_grass':([F+f'Sand{s}{i}.flac' for s in 'LR' for i in (1,2,3)],.7),
 'step_wood':([f'tinyworlds/wood0{i}.ogg' for i in (1,2,3)],.8),
 'dooropen':([Q+f'Open{n}.flac' for n in ('01','05','07','08')],.9),
 'door':([Q+f'Close{n}.flac' for n in ('04','07','08','10')],.9),
 'latch':(['coughe/DoorLockSounds/DoorLock.wav','coughe/DoorLockSounds/UnlockDoor.wav'],.6),
 'car_engine':(['ggbotnet/car_engine_loop_1.ogg'],.7,'loop'),
 'car_start':(['ggbotnet/car_engine_start_up_0.ogg'],.7),
 'car_stop':(['ggbotnet/car_engine_turning_off_0.ogg'],.8),
 'car_door_open':(['ggbotnet/car_door_open_0.ogg'],.8),
 'car_door_close':(['ggbotnet/car_door_close_0.ogg'],.9),
 'horn':(['ggbotnet/car_horn_0.ogg'],.6),
 'rain':([('kresiek/amb_rain_loop_1.ogg',20,12)],.8,'loop'),
 'thunder':(['rubberduck/sfx100v2_thunder_01.ogg',('wuxiascrub/rain-thunder.ogg',20.6,8)],.9)}
def get(k,url):
    d=D+k
    if os.path.isdir(d) and os.listdir(d): return
    os.makedirs(d,exist_ok=True)
    if isinstance(url,list):
        for u in url: open(d+'/'+u.rsplit('/',1)[1],'wb').write(urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'sfx-bake/1.0'}),timeout=300).read())
        return
    f=d+'.pack'
    open(f,'wb').write(urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'sfx-bake/1.0'}),timeout=300).read())
    if url.endswith('.zip'): zipfile.ZipFile(f).extractall(d)
    else:
        import py7zr; py7zr.SevenZipFile(f).extractall(d)
    os.remove(f)
def raw(f):
    # a file, or (file, from, seconds): that part of it
    a=['-ss',str(f[1]),'-t',str(f[2]+.6)] if isinstance(f,tuple) else []; f=D+(f[0] if isinstance(f,tuple) else f)
    return subprocess.run(['ffmpeg','-v','error']+a+['-i',f,'-ac','1','-ar',str(SR),'-af','highpass=f=30','-f','f32le','-'],capture_output=True,check=True).stdout
def pcm(f):
    out=raw(f)
    x=list(struct.unpack('<%df'%(len(out)//4),out)); pk=max(abs(v) for v in x) or 1
    a=next(i for i,v in enumerate(x) if abs(v)>pk*.03); b=len(x)-next(i for i,v in enumerate(reversed(x)) if abs(v)>pk*.015)
    a=max(0,a-int(.004*SR)); b=min(len(x),b+int(.03*SR)); x=x[a:b]; n=len(x); fi=int(.002*SR); fo=min(n//3,int(.03*SR))
    return [v/pk*(min(1,i/fi))*(min(1,(n-i)/fo)) for i,v in enumerate(x)]
def loop(f):
    # a loop: its steady middle, the end crossfaded into the start so it repeats without a seam
    out=raw(f)
    x=list(struct.unpack('<%df'%(len(out)//4),out)); x=x[int(.25*SR):len(x)-int(.2*SR)]; pk=max(abs(v) for v in x) or 1; c=int(.3*SR); n=len(x)-c
    return [(x[i]*(i/c)+x[n+i]*(1-i/c) if i<c else x[i])/pk for i in range(n)]
for k,u in PACKS.items(): get(k,u)
SJ=D+'shared.json'
if '--shared' in sys.argv:
    ex=json.load(open(sys.argv[sys.argv.index('--shared')+1])); os.makedirs(D+'shared',exist_ok=True)
    for f,b in (ex.get('files') or {}).items():
        if not all(ch.isalnum() or ch in '.-' for ch in f): continue
        open(D+'shared/'+f,'wb').write(base64.b64decode(b))
    json.dump({'v':1,'set':ex.get('set') or {}},open(SJ,'w'),indent=1)
SHARED=json.load(open(SJ))['set'] if os.path.exists(SJ) else {}
TRIM={}; SETX={}
base={k:list(v[0]) for k,v in SETS.items()}
for k,o in SHARED.items():
    if 'lvl' in o or 'pitch' in o: SETX[k]={x:o[x] for x in ('lvl','pitch') if x in o}
    if 'takes' not in o: continue
    items=[]
    for i,q in enumerate(o['takes']):
        src=('shared/'+q['f']) if q.get('f') else base.get(q['b'][0],[None]*99)[q['b'][1]] if q.get('b') and q['b'][1]<len(base.get(q['b'][0],[])) else None
        if src is None: continue
        items.append(src); TRIM[(k,len(items)-1)]=(q.get('a',0),q.get('z',0))
    old=SETS.get(k)
    if items: SETS[k]=(items,old[1] if old else 1.0,*old[2:]) if old else (items,1.0)
    elif k in SETS: del SETS[k]
data=[]; table={}; t=0
for name,(files,lvl,*kind) in SETS.items():
    table[name]=[]
    for j,f in enumerate(files):
        x=[v*lvl*.89 for v in (loop if kind else pcm)(f)]
        a,z=TRIM.get((name,j),(0,0)); x=x[int(a*SR):len(x)-int(z*SR)] if a or z else x; table[name].append([round(t+GAP,4),round(len(x)/SR,3)]); data+=[0.]*int(GAP*SR)+x; t+=GAP+len(x)/SR
data+=[0.]*int(GAP*SR)
subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar',str(SR),'-ac','1','-i','-','-c:a','libmp3lame','-b:a','96k','data/sfx.mp3'],input=struct.pack('<%df'%len(data),*data),check=True)
if SETX: table['~set']=SETX
json.dump(table,open('data/sfx.json','w'),separators=(',',':'))
print({k:len(v) for k,v in table.items()},round(t,1),'s',os.path.getsize('data/sfx.mp3'),'bytes')
