# THE PLACE TAB'S NAMES (owner, 7 Nov 2026: long names were cut short): each model's real name from its Polyfork page (the page's
# title), kept in tools/weplace-names.json for tools/weplace-bake.py. Run: python3 tools/weplace-names.py
import json, os, re, time, urllib.request
L=json.load(open('tools/weplace-list.json')); F='tools/weplace-names.json'
N=json.load(open(F)) if os.path.exists(F) else {}
for ids in L.values():
    for i in ids:
        if i in N: continue
        r=urllib.request.Request('https://polyfork.dev/asset/'+i,headers={'User-Agent':'TheStrangestFleaMarket-bake/1.0 (thestrangestfleamarket.com)'})
        for k in range(4):
            try: h=urllib.request.urlopen(r,timeout=60).read().decode('utf-8','replace'); break
            except Exception as e:
                h=''; time.sleep(2**k)
        m=re.search(r'<title>([^<:]+)',h) or re.search(r'"name":"([^"]+)"',h)
        if m: N[i]=m.group(1).strip()
        time.sleep(.2)
json.dump(N,open(F,'w'),indent=0,sort_keys=True); print(len(N),'names')
