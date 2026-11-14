# fetches DEAD END's pictures for the house's walls, open-access works of The Metropolitan Museum of Art (public domain, CC0): python3 tools/hide-art.py  ->  data/hide/art/pNN.jpg, docs/hide-art.md
import io, os, time, urllib.request
from PIL import Image

OUT = 'data/hide/art/'
ART = [
    (435980, 'Portrait of a Child', 'Camille Corot', 'ca. 1835', 'https://images.metmuseum.org/CRDImages/ep/web-large/DT872.jpg'),
    (818215, '[Young Woman Holding a Flower]', 'Joseph-Philibert Girault de Prangey', 'ca. 1842', 'https://images.metmuseum.org/CRDImages/ph/web-large/DP-19380-001.jpg'),
    (268354, '[Girl with Portrait of George Washington]', 'Southworth and Hawes', 'ca. 1850', 'https://images.metmuseum.org/CRDImages/ph/web-large/DP-26968-001.jpg'),
    (928017, 'Portrait of a Family', 'August (Ágost) Canzi', '1856', 'https://images.metmuseum.org/CRDImages/dp/web-large/DP-46414-001.jpg'),
    (437388, 'Portrait of a Woman, probably a Member of the Van Beresteyn ', 'Rembrandt (Rembrandt van Rijn)', '1632', 'https://images.metmuseum.org/CRDImages/ep/web-large/DP145399.jpg'),
    (12933, 'Portrait of a Little Girl Picking Grapes', 'unknown', '1840–50', 'https://images.metmuseum.org/CRDImages/ad/web-large/DP221115.jpg'),
    (13092, 'Portrait of a Girl', 'Samuel Lovett Waldo', 'after 1854', 'https://images.metmuseum.org/CRDImages/ad/web-large/ap38.146.5.jpg'),
    (13101, 'Portrait of a Girl with Flowers', 'Samuel Lovett Waldo', 'ca. 1835', 'https://images.metmuseum.org/CRDImages/ad/web-large/ap1973.123.jpg'),
    (12977, 'Portrait of a Man', 'John Smibert', 'ca. 1720–30', 'https://images.metmuseum.org/CRDImages/ad/web-large/ap54.196.1.jpg'),
    (436641, 'Portrait of a Man', 'Bartholomeus van der Helst', '1647', 'https://images.metmuseum.org/CRDImages/ep/web-large/DP143191.jpg'),
    (437893, 'Portrait of a Man', 'Johannes Verspronck', '1645', 'https://images.metmuseum.org/CRDImages/ep/web-large/DP143176.jpg'),
    (437843, 'Portrait of a Man', 'Italian Painter', '', 'https://images.metmuseum.org/CRDImages/ep/web-large/DP-22883-001.jpg'),
    (11310, 'Hudson River Scene', 'John Frederick Kensett', '1857', 'https://images.metmuseum.org/CRDImages/ad/web-large/DT2891.jpg'),
    (904641, 'On the Hudson River, Near Idlewild', 'Eliza Pratt Greatorex', '1864', 'https://images.metmuseum.org/CRDImages/ad/web-large/DP-34586-001.jpg'),
    (436293, 'Still Life with Flowers and Fruit', 'Henri Fantin-Latour', '1866', 'https://images.metmuseum.org/CRDImages/ep/web-large/DT1980.jpg'),
    (11938, 'Still Life: Flowers and Fruit', 'Severin Roesen', '1850–55', 'https://images.metmuseum.org/CRDImages/ad/web-large/DT2133.jpg'),
    (436485, 'Vanitas Still Life', 'Jacques de Gheyn II', '1603', 'https://images.metmuseum.org/CRDImages/ep/web-large/DP143209.jpg'),
    (436826, 'Winter Landscape, Holland', 'Barend Cornelis Koekkoek', '1833', 'https://images.metmuseum.org/CRDImages/ep/web-large/DP143197.jpg'),
    (11766, 'Thomas Storm', 'Ammi Phillips', 'ca. 1830', 'https://images.metmuseum.org/CRDImages/ad/web-large/ap1980.360.1.jpg'),
    (438950, 'A Storm off the Normandy Coast', 'Eugène Isabey', 'probably 1850s', 'https://images.metmuseum.org/CRDImages/ep/web-large/DP169472.jpg'),
    (11050, 'Approaching Thunder Storm', 'Martin Johnson Heade', '1859', 'https://images.metmuseum.org/CRDImages/ad/web-large/DP248013.jpg'),
    (436630, 'Portrait of a Woman', 'Adriaen Hanneman', 'ca. 1653', 'https://images.metmuseum.org/CRDImages/ep/web-large/DP146498.jpg'),
    (268650, '[Unidentified Woman in Nine Oval Views]', 'Southworth and Hawes', 'ca. 1850', 'https://images.metmuseum.org/CRDImages/ph/web-large/DP-42243-001.jpg'),
    (436986, 'Portrait of a Woman', 'Quinten Massys', 'ca. 1520', 'https://images.metmuseum.org/CRDImages/ep/web-large/DT1461.jpg'),
]

def get(u):
    for k in range(6):
        try:
            time.sleep(1); return urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'asset-fetch'}), timeout=90).read()
        except Exception:
            if k == 5: raise
            time.sleep(15 * (k + 1))

os.makedirs(OUT, exist_ok=True)
doc = ['# DEAD END: the pictures on the house\'s walls', '', 'Open-access works of The Metropolitan Museum of Art, New York (public domain, CC0), fetched by `tools/hide-art.py` and resized to 512 px.', '']
for i, (oid, title, artist, date, url) in enumerate(ART):
    f = OUT + 'p%02d.jpg' % i
    if not os.path.exists(f):
        im = Image.open(io.BytesIO(get(url))).convert('RGB'); k = 512 / max(im.size); im = im.resize((max(8, round(im.size[0] * k)), max(8, round(im.size[1] * k))), Image.LANCZOS); im.save(f, 'JPEG', quality=80, optimize=True); print(f, im.size, flush=True)
    doc.append('- `p%02d.jpg` "%s", %s, %s: https://www.metmuseum.org/art/collection/search/%d' % (i, title, artist, date, oid))
open('docs/hide-art.md', 'w').write('\n'.join(doc) + '\n')
