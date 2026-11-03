# THE VIEWER'S TEXTURES: two CC0 photo textures from Poly Haven (data/full/textures/: dark_wood, the frames and the dado; painted_plaster_wall, the
# gallery wall, made grey and light so the gallery's colour multiplies over it) shrunk into data/art-tex.json as JPEG data URLs. python3 -I tools/art-tex-bake.py
import base64, io, json, os
from PIL import Image, ImageOps, ImageStat
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); F=os.path.join(ROOT,'data','full','textures')
def url(im,q): b=io.BytesIO(); im.save(b,'JPEG',quality=q,optimize=True); return 'data:image/jpeg;base64,'+base64.b64encode(b.getvalue()).decode()
wood=Image.open(os.path.join(F,'dark_wood.jpg')).convert('RGB').resize((384,384),Image.LANCZOS)
pl=ImageOps.grayscale(Image.open(os.path.join(F,'painted_plaster_wall.jpg'))).resize((384,384),Image.LANCZOS)
m=ImageStat.Stat(pl).mean[0]; pl=pl.point(lambda v:max(0,min(255,round(238+(v-m)*.55))))   # light, its texture kept but softened
out={'src':'Poly Haven (CC0): dark_wood, painted_plaster_wall','wood':url(wood,78),'woodv':url(wood.transpose(Image.ROTATE_90),78),'plaster':url(pl.convert('RGB'),72)}
s=json.dumps(out); open(os.path.join(ROOT,'data','art-tex.json'),'w').write(s); print(len(s)//1024,'KB')
