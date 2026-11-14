# COLD BORE's trees: a Poly Haven scan (CC0) drawn by Blender into a picture with alpha for a card: pip install bpy; python3 tools/sniper-trees.py fir_sapling_medium _a_ /tmp/fir.png; python3 tools/sniper-trees.py island_tree_01 '' /tmp/leaf.png; then crop each to its tree and save as data/sniper/tex/fir.png (512x1024) and leaf.png (512x512)
import bpy, sys, json, os, urllib.request, math
from mathutils import Vector
slug, pick, out = sys.argv[-3], sys.argv[-2], sys.argv[-1]
def get(u): return urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0 asset-fetch'}), timeout=600).read()
d = '/tmp/ph/tree/' + slug; os.makedirs(d, exist_ok=True); F = json.loads(get('https://api.polyhaven.com/files/' + slug))['gltf']['1k']['gltf']
if not os.path.exists(d + '/m.gltf'):
    for rel, v in F['include'].items(): p = os.path.join(d, rel); os.makedirs(os.path.dirname(p), exist_ok=True); open(p, 'wb').write(get(v['url']))
    open(d + '/m.gltf', 'wb').write(get(F['url']))
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=d + '/m.gltf')
objs = [o for o in bpy.data.objects if o.type == 'MESH']; keep = [o for o in objs if pick in o.name] if pick else objs; root = keep[0]
for o in objs:
    if o not in keep: bpy.data.objects.remove(o, do_unlink=True)
bpy.context.view_layer.update(); pts = [o.matrix_world @ Vector(c) for o in keep for c in o.bound_box]
mn = Vector([min(p[i] for p in pts) for i in range(3)]); mx = Vector([max(p[i] for p in pts) for i in range(3)]); c = (mn + mx) / 2; h = mx.z - mn.z; w = max(mx.x - mn.x, mx.y - mn.y)
cam = bpy.data.cameras.new('c'); cam.type = 'ORTHO'; cam.ortho_scale = max(h, w * 2) ; co = bpy.data.objects.new('c', cam); bpy.context.scene.collection.objects.link(co); co.location = (c.x, c.y - 60, c.z); co.rotation_euler = (math.pi / 2, 0, 0); cam.clip_end = 200; bpy.context.scene.camera = co
sun = bpy.data.lights.new('s', 'SUN'); sun.energy = 4; so = bpy.data.objects.new('s', sun); bpy.context.scene.collection.objects.link(so); so.rotation_euler = (math.radians(50), 0, math.radians(35))
wd = bpy.data.worlds.new('w'); bpy.context.scene.world = wd; wd.use_nodes = True; wd.node_tree.nodes['Background'].inputs[0].default_value = (0.75, 0.85, 1, 1); wd.node_tree.nodes['Background'].inputs[1].default_value = 1.1
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = 24; sc.render.film_transparent = True; sc.render.resolution_x = 512; sc.render.resolution_y = 1024; sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_mode = 'RGBA'; sc.render.filepath = out
sc.view_settings.view_transform = 'Standard'
bpy.ops.render.render(write_still=True); print('BAKED', slug, 'h', round(h, 2), 'w', round(w, 2), 'ortho', round(cam.ortho_scale, 2), 'base', round(mn.z, 2), 'cz', round(c.z, 2))
