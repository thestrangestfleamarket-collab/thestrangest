# THE THINGS' POLYFORK MATCHES: every item (its id and name from the game, /tmp items list) searched in polyfork.dev's catalogue; a match has every word of the item's name in the model's. Output reviewed by hand into tools/pfitems-list.json.
import json,re,sys,time,urllib.request,urllib.parse
items=[l.rstrip('\n').split(' | ') for l in open('/tmp/claude-0/items2.txt') if ' | ' in l]
STOP={'a','an','the','of','and','with','for','your','tame','small','big','little','(rental)','rental','every','one','handful','set'}
def toks(s):
  s=re.sub(r'\(.*?\)','',s.lower()); w=re.findall(r'[a-z]+',s); out=[]
  for x in w:
    if x in STOP: continue
    if len(x)>3 and x.endswith('ies'): x=x[:-3]+'y'
    elif len(x)>3 and x.endswith('es') and not x.endswith('ses'): x=x[:-1]
    elif len(x)>3 and x.endswith('s') and not x.endswith('ss'): x=x[:-1]
    out.append(x)
  return out
def q(s):
  u='https://polyfork.dev/api/assets?per_page=12&q='+urllib.parse.quote(s)
  for k in range(4):
    try: return json.load(urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'TheStrangestFleaMarket-bake/1.0 (thestrangestfleamarket.com)'}),timeout=40)).get('assets',[])
    except Exception as e: time.sleep(2**k)
  return []
res={}
for row in items:
  iid,name=row[0],row[1]
  t=toks(name) or toks(iid.replace('_',' '))
  if not t: continue
  cands=q(' '.join(t)); time.sleep(.25)
  best=None
  for a in cands:
    if a.get('free') is False: continue
    if a.get('class') in ('building','character','terrain'): continue
    at=set(toks(a.get('name') or a.get('id','')))
    hit=sum(1 for x in t if x in at); sc=hit/len(t) - .02*max(0,len(at)-len(t))
    if hit==len(t) and (best is None or sc>best[0]): best=(sc,a['id'],a.get('name') or a['id'],a.get('class'),a.get('triangles'))
  res[iid]={'name':name,'best':best,'top':[(a.get('id'),a.get('name')) for a in cands[:4]]}
  print(iid,'|',name,'|',best[1:3] if best else None, file=sys.stderr, flush=True)
json.dump(res,open('/tmp/claude-0/sp/pick.json','w'),indent=1)
