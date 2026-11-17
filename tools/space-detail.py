# fetches SPACE FLEET's hull surfaces (CC0, ambientCG): python3 tools/space-detail.py  ->  data/space/tex/hull<navy>_n.jpg (the normal map) and hull<navy>_h.jpg (red: height, green: roughness, blue: the shade in its hollows), 1024 px
import io, os, urllib.request, zipfile
from PIL import Image
SETS = {'hull0': 'MetalPlates008', 'hull1': 'MetalPlates012'}   # the Admiralty's fitted panels of many heights; the Corsairs' patched, overlapping plates
OUT = 'data/space/tex/'; os.makedirs(OUT, exist_ok=True)
for name, aid in SETS.items():
    z = zipfile.ZipFile(io.BytesIO(urllib.request.urlopen(urllib.request.Request('https://ambientcg.com/get?file=%s_1K-JPG.zip' % aid, headers={'User-Agent': 'asset-fetch'}), timeout=120).read()))
    pic = lambda k, mode: Image.open(io.BytesIO(z.read('%s_1K-JPG_%s.jpg' % (aid, k)))).convert(mode).resize((1024, 1024), Image.LANCZOS) if '%s_1K-JPG_%s.jpg' % (aid, k) in z.namelist() else Image.new(mode, (1024, 1024), 255)   # a set without a map: white
    pic('NormalGL', 'RGB').save(OUT + name + '_n.jpg', quality=90, optimize=True)
    Image.merge('RGB', (pic('Displacement', 'L'), pic('Roughness', 'L'), pic('AmbientOcclusion', 'L'))).save(OUT + name + '_h.jpg', quality=90, optimize=True)
    print(name, aid, os.path.getsize(OUT + name + '_n.jpg') // 1024, 'KB +', os.path.getsize(OUT + name + '_h.jpg') // 1024, 'KB')
