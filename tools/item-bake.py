# THE ITEMS: a plain model (the tote, the terminal, the power-up: first cut down with fast_simplification as skin-bake.py's step, or
# tools/skin-bake.py for a furry one) and the cat's ink bottle, as data/<name>.json: python3 tools/item-bake.py
# the items (no bones): their faces and colours, feet at 0, 1 tall, as data/<name>.json
import sys,os,json,base64,numpy as np
S=os.environ.get('BAKE','bake')+'/'
def write(name,T,col):
    T=T.copy(); T[:,:,1]-=T[:,:,1].min(); h=T[:,:,1].max(); T/=h; T[:,:,0]-=(T[:,:,0].max()+T[:,:,0].min())/2; T[:,:,2]-=(T[:,:,2].max()+T[:,:,2].min())/2
    P=T.reshape(-1,3); out={'p':base64.b64encode(P.astype(np.float32).tobytes()).decode(),'c':base64.b64encode(np.repeat(col.clip(0,255).round().astype(np.uint8),3,axis=0).reshape(-1).tobytes()).decode(),'tris':len(T),'wide':float(P[:,0].max()-P[:,0].min()),'deep':float(P[:,2].max()-P[:,2].min())}
    open('data/'+name+'.json','w').write(json.dumps(out)); print(name,len(T),'tris, wide',round(out['wide'],2),'deep',round(out['deep'],2))
for src,name in [('handbag','tote'),('terminal','terminal'),('powerup','powerup')]:
    v=np.load(S+src+'/v.npy'); f=np.load(S+src+'/f.npy'); write(name,v[f],np.load(S+src+'/col.npy'))
write('inkbottle',np.load(S+'grumpycat/bottle_T.npy'),np.load(S+'grumpycat/bottle_c.npy'))
