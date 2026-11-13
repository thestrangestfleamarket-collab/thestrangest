# PAINTING COPIES' MASTERWORKS: gathers public-domain paintings and prints from the Art Institute of Chicago (CC0, IIIF) and the Met (Open Access, CC0),
# measures each one's difficulty from its own pixels (edge density, colour count, fine detail), keeps 50 spread evenly from simple to hard
# (two at most by one artist), five per band of ten skill levels, and bakes data/copies.json: title, artist, year, museum, link, licence, band,
# difficulty and a small webp data URL each (the painter's guide and the score's target).
# python3 -I tools/copies-bake.py [--fresh: ask the museums again] [--size 256] [--quality 74]
import json, subprocess, sys, os, io, base64, urllib.parse
from PIL import Image, ImageFilter, ImageStat, ImageOps
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); FULL=os.path.join(ROOT,'data','full','copies'); IMG=os.path.join(FULL,'img')
SIZE=int(sys.argv[sys.argv.index('--size')+1]) if '--size' in sys.argv else 256
Q=int(sys.argv[sys.argv.index('--quality')+1]) if '--quality' in sys.argv else 74
UA='TheStrangestFleaMarket-bake/1.0'
def get(u):
    return subprocess.run(['curl','-sSgL','-m','60','-A',UA,u],capture_output=True).stdout
def js(u):
    try: return json.loads(get(u))
    except Exception: return None
# the searches: simple things (prints, colour fields, still lifes, nocturnes) to the detailed Old Masters
AIC_Q=['Hiroshige','Hokusai','Kandinsky','Whistler nocturne','Arthur Dove','Georgia O\'Keeffe','Marsden Hartley','Robert Delaunay','Paul Gauguin','Henri Rousseau',
  'Cezanne still life','Monet','Van Gogh','Seurat','Toulouse-Lautrec poster','Winslow Homer','Edward Hopper','Odilon Redon','Mary Cassatt','Caillebotte',
  'Rembrandt','El Greco','Rubens','Jan Brueghel','Jan van Huysum still life','Canaletto','Corot','Turner','Millet','Fragonard','Pissarro','Sisley','Hammershoi','Vuillard','Bonnard']
MET_Q=['Hiroshige','Utamaro','Vermeer','Bruegel','Rembrandt','Caravaggio','Velazquez','Jacques-Louis David','Ingres','Courbet','Manet','Degas','Renoir','Cezanne',
  'Van Gogh','Gauguin','Seurat','Signac','Homer','Sargent','Whistler','Inness','Church','Bierstadt','Cole','Harnett','Peale still life','Hiroshige landscape']
def cands():
    out=[]; seen=set()
    for q in AIC_Q:
        u='https://api.artic.edu/api/v1/artworks/search?q=%s&query[term][is_public_domain]=true&fields=id,title,artist_title,date_display,image_id,artwork_type_title,is_public_domain&limit=12'%urllib.parse.quote(q)
        for r in ((js(u) or {}).get('data') or []):
            if not r.get('image_id') or not r.get('is_public_domain') or r.get('artwork_type_title') not in ('Painting','Print'): continue
            k='aic%d'%r['id']
            if k in seen: continue
            seen.add(k); out.append({'k':k,'t':r['title'],'a':r.get('artist_title') or 'Unknown','d':r.get('date_display') or '','m':'Art Institute of Chicago',
              'u':'https://www.artic.edu/artworks/%d'%r['id'],'img':'https://www.artic.edu/iiif/2/%s/full/400,/0/default.jpg'%r['image_id']})
    for q in MET_Q:
        r=js('https://collectionapi.metmuseum.org/public/collection/v1.1/search?isPublicDomain=true&hasImages=true&q=%s&limit=14'%urllib.parse.quote(q)) or {}
        for oid in (r.get('objectIDs') or [])[:14]:
            k='met%d'%oid
            if k in seen: continue
            o=js('https://collectionapi.metmuseum.org/public/collection/v1/objects/%d'%oid)
            if not o or not o.get('isPublicDomain') or not o.get('primaryImageSmall') or o.get('classification') not in ('Paintings','Prints'): continue
            seen.add(k); out.append({'k':k,'t':o['title'],'a':o.get('artistDisplayName') or 'Unknown','d':o.get('objectDate') or '','m':'The Met, New York','u':o['objectURL'],'img':o['primaryImageSmall']})
    return out
os.makedirs(IMG,exist_ok=True); CF=os.path.join(FULL,'candidates.json')
C=json.load(open(CF)) if os.path.exists(CF) and '--fresh' not in sys.argv else cands()
json.dump(C,open(CF,'w'),indent=0)
def load(c):
    fn=os.path.join(IMG,c['k']+'.jpg')
    if not os.path.exists(fn):
        raw=get(c['img'])
        try: im=Image.open(io.BytesIO(raw)).convert('RGB')
        except Exception: return None
        im.thumbnail((400,400),Image.LANCZOS); im.save(fn,'JPEG',quality=90)
    return Image.open(fn).convert('RGB')
# difficulty from the picture: how much of it is edges, how many colours it needs, how much is lost when it is seen in big blocks
def measure(im):
    s=im.copy(); s.thumbnail((128,128),Image.LANCZOS); s=ImageOps.autocontrast(s,cutoff=1).filter(ImageFilter.MedianFilter(5)); g=s.convert('L')
    edge=ImageStat.Stat(g.filter(ImageFilter.FIND_EDGES)).mean[0]/255
    q=s.quantize(colors=64,method=Image.Quantize.MEDIANCUT); hist=sorted(q.histogram()[:64],reverse=True); tot=sum(hist); acc=0; n=0
    for h in hist:
        acc+=h; n+=1
        if acc>=.9*tot: break
    small=s.resize((12,12),Image.BOX).resize(s.size,Image.BILINEAR)
    d=sum(abs(p-r) for a,b in zip(s.get_flattened_data(),small.get_flattened_data()) for p,r in zip(a,b))/(s.size[0]*s.size[1]*3*255)
    sat=ImageStat.Stat(im.convert('HSV').split()[1]).mean[0]/255
    return edge,n/64,d,sat
rows=[]
for c in C:
    c['a']={'Rembrandt van Rijn':'Rembrandt','Paul Cezanne':'Paul Cézanne'}.get(c['a'],c['a'])
    if len(c['t'])>70 or c['a']=='Unknown': continue
    im=load(c)
    if im is None or min(im.size)<120 or max(im.size)/min(im.size)>2.2: continue
    e,n,d,sat=measure(im)
    if sat<.12: continue   # etchings and grey prints: a copy here is in colour
    c['e'],c['n'],c['r']=e,n,d; rows.append(c)
print(len(rows),'usable of',len(C))
def rank(key): o=sorted(rows,key=key); return {c['k']:i/(len(o)-1) for i,c in enumerate(o)}
re_,rn,rd=rank(lambda c:c['e']),rank(lambda c:c['n']),rank(lambda c:c['r'])
for c in rows: c['x']=round((re_[c['k']]+rn[c['k']]+rd[c['k']])/3,4)
rows.sort(key=lambda c:c['x'])
# 50 at even steps of difficulty, two at most by one artist, never the same title twice
pick=[]; by={}; used=set(); N=50
for i in range(N):
    want=i/(N-1); best=None
    for c in sorted(rows,key=lambda c:abs(c['x']-want)):
        if c['k'] in used or by.get(c['a'],0)>=2 or any(p['t']==c['t'] for p in pick): continue
        best=c; break
    if best: pick.append(best); used.add(best['k']); by[best['a']]=by.get(best['a'],0)+1
pick.sort(key=lambda c:c['x'])
out=[]
for i,c in enumerate(pick):
    im=load(c); im.thumbnail((SIZE,SIZE),Image.LANCZOS); b=io.BytesIO(); im.save(b,'WEBP',quality=Q,method=6)
    out.append({'id':c['k'],'t':c['t'],'a':c['a'],'d':c['d'],'m':c['m'],'u':c['u'],'lic':'CC0','b':i//5,'x':c['x'],'w':im.size[0],'h':im.size[1],
      'i':'data:image/webp;base64,'+base64.b64encode(b.getvalue()).decode()})
json.dump([{k:v for k,v in o.items() if k!='i'} for o in out],open(os.path.join(FULL,'list.json'),'w'),indent=1)
json.dump(out,open(os.path.join(ROOT,'data','copies.json'),'w'),separators=(',',':'))
print('baked',len(out),'works,',os.path.getsize(os.path.join(ROOT,'data','copies.json'))//1024,'KB')
for o in out: print(o['b'],o['x'],o['a'],'·',o['t'])
