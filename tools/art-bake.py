# THE ART MUSEUM'S PAINTINGS: reads data/full/art/list.json (the curated works: the Met, Cleveland, the Rijksmuseum and Chicago CC0; the rest Wikimedia Commons public-domain scans),
# resolves each one's image through its museum's open-access API, keeps a 640px copy in data/full/art/ (never shipped), and bakes
# data/art.json: title, artist, date, museum, source, its full-resolution image's link (fetched only in the viewer), aspect and a small JPEG data URL each.
# python3 -I tools/art-bake.py [--size 208] [--quality 72] [--full: look up every full-resolution link again]
import json, subprocess, sys, os, re, io, base64, urllib.parse
from PIL import Image
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); FULL=os.path.join(ROOT,'data','full','art')
SIZE=int(sys.argv[sys.argv.index('--size')+1]) if '--size' in sys.argv else 208
Q=int(sys.argv[sys.argv.index('--quality')+1]) if '--quality' in sys.argv else 72
def get(u,hdr=None):
    a=['curl','-sSL','-m','60',u]+(['-H',hdr] if hdr else [])
    return subprocess.run(a,capture_output=True).stdout
def js(u,hdr=None):
    try: return json.loads(get(u,hdr))
    except Exception: return None
MUS={'met':'The Met, New York','cma':'Cleveland Museum of Art','rijks':'Rijksmuseum, Amsterdam','aic':'Art Institute of Chicago'}
UA='User-Agent: TSFM-art-bake/1.0 (one-off museum bake)'
def wthumb(fn,w):
    import hashlib
    n=fn.replace(' ','_'); h=hashlib.md5(n.encode()).hexdigest(); q=urllib.parse.quote(n)
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/%s/%s/%s/%dpx-%s'%(h[0],h[:2],q,w,q), 'https://upload.wikimedia.org/wikipedia/commons/%s/%s/%s'%(h[0],h[:2],q)
def resolve(w):
    s=w['src']
    if s=='met':
        o=js('https://collectionapi.metmuseum.org/public/collection/v1/objects/%d'%w['id'])
        if not o or not o.get('isPublicDomain'): raise Exception('not public domain at the Met')
        w['f']=o.get('primaryImage') or o.get('primaryImageSmall')
        return o['primaryImageSmall'] or o['primaryImage'], o['objectURL'], 'CC0'
    if s=='cma':
        o=js('https://openaccess-api.clevelandart.org/api/artworks/?q=%s&cc0=1&has_image=1&limit=1'%urllib.parse.quote(w['q']))
        r=(o or {}).get('data') or []
        if not r or r[0].get('share_license_status')!='CC0': raise Exception('no CC0 hit at Cleveland')
        im=r[0]['images']; w['f']=((im.get('print') or im.get('full') or im['web'])['url'])
        return im['web']['url'], r[0]['url'], 'CC0'
    if s=='rijks':
        o=js('https://data.rijksmuseum.nl/search/collection?objectNumber=%s'%urllib.parse.quote(w['no']))
        items=(o or {}).get('orderedItems') or []
        if not items:
            o=js('https://data.rijksmuseum.nl/search/collection?title=%s&creator=%s'%(urllib.parse.quote(w['title']),urllib.parse.quote(w['creator']))); items=(o or {}).get('orderedItems') or []
        if not items: raise Exception('not found at the Rijksmuseum')
        ob=js(items[0]['id'],'Accept: application/ld+json'); img=None
        def walk(x):
            nonlocal img
            if isinstance(x,dict):
                for k,v in x.items():
                    if k=='access_point' and isinstance(v,list) and v and 'iiif' in str(v[0].get('id','')): img=img or v[0]['id']
                    walk(v)
            elif isinstance(x,list):
                for v in x: walk(v)
        walk(ob)
        if not img: raise Exception('no IIIF image at the Rijksmuseum')
        w['f']=re.sub(r'/full/[^/]+/0/','/full/max/0/',img)
        return re.sub(r'/full/[^/]+/0/',"/full/640,/0/",img), items[0]['id'], 'CC0'
    if s=='aic':
        o=js('https://api.artic.edu/api/v1/artworks/%d?fields=id,image_id,is_public_domain'%w['id'])
        d=(o or {}).get('data') or {}
        if not d.get('is_public_domain'): raise Exception('not public domain at Chicago')
        b='https://www.artic.edu/iiif/2/%s/full/'%d['image_id']; w['f']=b+'1686,/0/default.jpg'
        return b+'843,/0/default.jpg', 'https://www.artic.edu/artworks/%d'%w['id'], 'CC0'
    if s=='wiki':
        th,orig=wthumb(w['file'],960); w['f']=wthumb(w['file'],3840)[0] if w.get('ow',0)>3840 else orig
        return th, 'https://commons.wikimedia.org/wiki/File:'+urllib.parse.quote(w['file'].replace(' ','_')), 'public domain'
    raise Exception('unknown source '+s)
def slug(t): return re.sub(r'[^a-z0-9]+','-',t.lower()).strip('-')[:40]
L=json.load(open(os.path.join(FULL,'list.json'))); out=[]; os.makedirs(FULL,exist_ok=True)
for i,w in enumerate(L):
    fn=os.path.join(FULL,'%02d-%s.jpg'%(i+1,slug(w['t'])))
    if '--full' in sys.argv or not os.path.exists(fn):
        if os.path.exists(fn):
            resolve(w); print('full',w['t'],w.get('f')); 
        else:
            url,src,lic=resolve(w); raw=get(url,UA)
            im=Image.open(io.BytesIO(raw)).convert('RGB'); im.thumbnail((640,640),Image.LANCZOS); im.save(fn,'JPEG',quality=88,optimize=True)
            w['img']=url; w['url']=src; w['lic']=lic
            print('got ',fn,im.size,len(raw)//1024,'KB from',url)
    im=Image.open(fn).convert('RGB'); im.thumbnail((SIZE,SIZE),Image.LANCZOS); b=io.BytesIO(); im.save(b,'JPEG',quality=Q,optimize=True)
    out.append({'t':w['t'],'a':w['a'],'d':w['d'],'m':w.get('m') or MUS[w['src']],'u':w.get('url',''),'f':w.get('f',''),'w':im.size[0],'h':im.size[1],'i':'data:image/jpeg;base64,'+base64.b64encode(b.getvalue()).decode()})
json.dump(L,open(os.path.join(FULL,'list.json'),'w'),ensure_ascii=False,indent=1)
s=json.dumps(out,ensure_ascii=False,separators=(',',':')); open(os.path.join(ROOT,'data','art.json'),'w').write(s)
print(len(out),'paintings;',len(s)//1024,'KB in data/art.json')
