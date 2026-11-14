# COLD BORE's car and helicopter: nander's VW Corrado (OpenGameArt, CC0) and Cheese Animal Productions' attack chopper (OpenGameArt, CC-BY 3.0) into data/sniper/m/car.glb (4.05 m long, wheels on the ground, with five paints data/sniper/tex/car_0..4.jpg) and data/sniper/m/chopper.glb (parts body, rotor, tail).
# Needs Blender's module: pip install bpy; python3 tools/sniper-vehicles.py
import bpy, io, os, zipfile, tempfile, colorsys, urllib.request
from mathutils import Vector
from PIL import Image
T = tempfile.mkdtemp(); UA = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36'}
def unzip(url, d):
    z = zipfile.ZipFile(io.BytesIO(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=180).read()))
    for i in z.infolist():
        n = os.path.normpath(i.filename)
        if n.startswith('..') or os.path.isabs(n) or i.is_dir(): continue
        p = os.path.join(d, n); os.makedirs(os.path.dirname(p), exist_ok=True); open(p, 'wb').write(z.read(i))
def mat(name, img):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = nt.nodes['Principled BSDF']; t = nt.nodes.new('ShaderNodeTexImage'); t.image = bpy.data.images.load(img); nt.links.new(t.outputs['Color'], b.inputs['Base Color']); b.inputs['Roughness'].default_value = 0.35; b.inputs['Metallic'].default_value = 0.4; return m
def save(path): bpy.ops.export_scene.gltf(filepath=path, export_format='GLB', export_apply=True, export_image_format='JPEG', export_jpeg_quality=85, export_yup=True); print('WROTE', path, os.path.getsize(path) // 1024, 'KB')
# the car: five paints from its one picture (the red body turned to another hue, or to silver, black, white)
c = T + '/car'; unzip('https://opengameart.org/sites/default/files/car_0.zip', c); src = Image.open(c + '/no_mirrors_corradon.png').convert('RGB').resize((512, 512), Image.LANCZOS); px = src.load()
for n, (hue, sat, val) in enumerate([(None, 1, 1), (0.6, 0.8, 0.8), (None, 0, 1.5), (None, 0, 0.28), (None, 0, 2.6)]):
    im = src.copy(); q = im.load()
    for y in range(512):
        for x in range(512):
            r, g, b = px[x, y]; h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            if s > 0.45 and (h < 0.06 or h > 0.92): r2, g2, b2 = colorsys.hsv_to_rgb(h if hue is None else hue, s * sat, min(1, v * val)); q[x, y] = (int(r2 * 255), int(g2 * 255), int(b2 * 255))
    im.save('data/sniper/tex/car_%d.jpg' % n, quality=85)
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.wm.obj_import(filepath=c + '/car.obj'); o = [o for o in bpy.data.objects if o.type == 'MESH'][0]; bpy.context.view_layer.objects.active = o; o.select_set(True); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
vs = [v.co for v in o.data.vertices]; mn = Vector([min(v[i] for v in vs) for i in range(3)]); mx = Vector([max(v[i] for v in vs) for i in range(3)]); s = 4.05 / (mx.x - mn.x)
for v in o.data.vertices: v.co = Vector(((v.co.x - (mn.x + mx.x) / 2) * s, (v.co.y - (mn.y + mx.y) / 2) * s, (v.co.z - mn.z) * s))
o.data.materials.clear(); o.data.materials.append(mat('car', 'data/sniper/tex/car_0.jpg')); o.name = 'car'; bpy.ops.object.shade_smooth(); save('data/sniper/m/car.glb')
# the helicopter, in black
h = T + '/chop'; unzip('https://opengameart.org/sites/default/files/attackchopper.zip', h); Image.open(h + '/Textures/Apache_Texture_Black.png').convert('RGB').resize((1024, 1024), Image.LANCZOS).save(T + '/chop.jpg', quality=88)
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.fbx(filepath=h + '/FBX/Attack_Helicopter.fbx'); m = mat('chopper', T + '/chop.jpg'); ob = {o.name: o for o in bpy.data.objects if o.type == 'MESH'}
for o in ob.values(): o.data.materials.clear(); o.data.materials.append(m)
def join(names, new):
    bpy.ops.object.select_all(action='DESELECT'); 
    for n in names: ob[n].select_set(True)
    bpy.context.view_layer.objects.active = ob[names[0]]; bpy.ops.object.join(); o = ob[names[0]]; o.name = new; bpy.ops.object.transform_apply(location=False, rotation=True, scale=True); bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS') if new != 'body' else None; return o
join(['Helicopter_Body'] + [n for n in ob if n.startswith('Missiles')], 'body'); join(['Propellers'], 'rotor'); join([n for n in ob if n.startswith('Back_Propeller')], 'tail'); save('data/sniper/m/chopper.glb')
