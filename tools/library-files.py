# THE BOOKSTORE'S FILES: writes src/144cb-libfiles.js, one __FILE__ per cover (and spine) in data/library.json, so each is its own file fetched only when a book is shown.
# Run after changing the list or its covers: python3 tools/library-files.py
import json
L=json.load(open('data/library.json')); E=[]
for c in L['cases']:
    for b in c['books']:
        if b.get('cover'): E.append(f'{json.dumps(b["id"])}:__FILE__("data/{b["cover"]}")')
        if b.get('spine'): E.append(f'{json.dumps(b["id"]+"~s")}:__FILE__("data/{b["spine"]}")')
src='// THE BOOKSTORE\'S COVERS: each book\'s cover (and real spine) as its own file, fetched only when the book is shown (written by tools/library-files.py from data/library.json).\nObject.assign(LIB.files,{'+',\n  '.join(E)+'});\n'
open('src/144cb-libfiles.js','w').write(src); print(len(E),'files')
