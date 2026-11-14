# fetches DEAD END's wall posters, WPA posters of 1936-43 from the Library of Congress (works of the US government, public domain): python3 tools/hide-posters.py  ->  data/hide/art/pNN.jpg, docs/hide-posters.md
import io, time, urllib.request
from PIL import Image

BASE, OUT = 'https://tile.loc.gov/storage-services/service/pnp/', 'data/hide/art/'
POSTERS = [
    ('98513545', 'A trip around the world at story hour time', 'cph/3f00000/3f05000/3f05200/3f05229r.jpg'),
    ('98509756', 'For greater knowledge on more subjects use your library often!', 'cph/3f00000/3f05000/3f05200/3f05223r.jpg'),
    ('98510373', 'The vacation reading club', 'cph/3b40000/3b48000/3b48700/3b48769r.jpg'),
    ('98509697', 'Wee Willie Winkie runs through the town', 'cph/3b40000/3b48000/3b48800/3b48891r.jpg'),
    ('98516622', 'Books are weapons', 'ppmsca/40800/40820r.jpg'),
    ('98508162', 'Good grades and good health go together', 'cph/3f00000/3f05000/3f05100/3f05185r.jpg'),
    ('98513469', "Be wise. Don't play with firecrackers", 'cph/3b40000/3b48000/3b48800/3b48841r.jpg'),
    ('98507705', 'Is your child vaccinated', 'cph/3f00000/3f05000/3f05100/3f05173r.jpg'),
    ('98513584', 'Fight tuberculosis - obey the rules of health', 'ppmsca/38300/38342r.jpg'),
    ('98518818', 'Milk - for health, good teeth, vitality, endurance, strong bones', 'cph/3b40000/3b48000/3b48900/3b48986r.jpg'),
    ('98518819', 'Milk - for summer thirst', 'cph/3b40000/3b48000/3b48900/3b48994r.jpg'),
    ('98517081', 'A good lunch (WPA school lunch)', 'cph/3f00000/3f05000/3f05400/3f05427r.jpg'),
    ('98518333', 'Eat these every day', 'cph/3f00000/3f05000/3f05500/3f05585r.jpg'),
    ('92517367', 'Keep your teeth clean', 'ppmsca/38300/38343r.jpg'),
    ('98517824', 'Safety for you, for all', 'cph/3f00000/3f05000/3f05500/3f05556r.jpg'),
    ('98517852', 'Save your eyes - use your goggles', 'cph/3b40000/3b49000/3b49000/3b49074r.jpg'),
    ('98516617', 'An orderly line is a safe line!', 'cph/3b40000/3b48000/3b48800/3b48843r.jpg'),
    ('98508315', 'Art classes for children', 'cph/3b40000/3b48000/3b48700/3b48795r.jpg'),
    ('98509582', 'Art classes for children', 'cph/3b40000/3b48000/3b48700/3b48763r.jpg'),
    ('98513425', "Children's art", 'cph/3f00000/3f05000/3f05300/3f05314r.jpg'),
    ('98517080', "Children's drawings", 'cph/3b40000/3b48000/3b48800/3b48818r.jpg'),
    ('94502738', 'Visit the zoo', 'cph/3b40000/3b49000/3b49000/3b49068r.jpg'),
    ('94502736', 'Visit the zoo - Philadelphia', 'cph/3b50000/3b51000/3b51400/3b51495r.jpg'),
    ('2007676133', 'Yellowstone National Park, Ranger Naturalist Service', 'ppmsca/13300/13399r.jpg'),
    ('2007676131', 'Grand Canyon National Park, a free government service', 'ppmsca/13300/13397r.jpg'),
    ('92509203', "Don't kill our wild life", 'ppmsca/58100/58156r.jpg'),
    ('98513695', 'Have a date with us (American Museum of Natural History)', 'ppmsca/32400/32472r.jpg'),
]

def get(u):
    for k in range(6):
        try:
            time.sleep(1.5); return urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'asset-fetch'}), timeout=90).read()
        except Exception as e:
            if k == 5: raise
            time.sleep(20 * (k + 1))

import os; os.makedirs(OUT, exist_ok=True)
doc = ['# DEAD END: the posters on the school\'s walls', '', 'Posters of the Work Projects Administration, 1936-43, from the Library of Congress, Prints & Photographs Division, WPA Poster Collection: works of the United States government, in the public domain. Fetched by `tools/hide-posters.py`.', '']
for i, (pk, title, path) in enumerate(POSTERS):
    f = OUT + 'p%02d.jpg' % i
    if not os.path.exists(f):
        im = Image.open(io.BytesIO(get(BASE + path))).convert('RGB'); g = im.convert('L').point(lambda v: 255 if v > 46 else 0); bb = g.getbbox()   # the scan's black surround goes
        if bb and (bb[2] - bb[0]) > im.size[0] * .5 and (bb[3] - bb[1]) > im.size[1] * .5: im = im.crop(bb)
        h = 512; im = im.resize((max(8, round(im.size[0] * h / im.size[1] / 8) * 8), h), Image.LANCZOS); im.save(f, 'JPEG', quality=80, optimize=True); print(f, im.size, flush=True)
    doc.append('- `p%02d.jpg` "%s": https://www.loc.gov/pictures/item/%s/' % (i, title, pk))
open('docs/hide-posters.md', 'w').write('\n'.join(doc) + '\n')
