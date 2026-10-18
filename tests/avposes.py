# the poses' shots (tests/avposes.cjs) as one contact sheet, each named: python3 tests/avposes.py <outdir>
import sys, json, os
from PIL import Image, ImageDraw
d=sys.argv[1]; names=json.load(open(os.path.join(d,'ap-poses.json'))); ims=[Image.open(os.path.join(d,'ap-pose-%02d.png'%i)).resize((260,280)) for i in range(len(names))]
cols=8; rows=(len(ims)+cols-1)//cols; S=Image.new('RGB',(cols*260,rows*280),'#000')
for i,(im,n) in enumerate(zip(ims,names)):
  S.paste(im,((i%cols)*260,(i//cols)*280)); ImageDraw.Draw(S).text(((i%cols)*260+6,(i//cols)*280+4),n,fill='#f2c14e')
S.save(os.path.join(d,'ap-poses.png')); print('sheet',S.size)
