# COLD BORE's rifle: the KSR-29 by Dennis Haupt (OpenGameArt, CC0) out of its .blend into data/sniper/m/ksr29.glb, its four parts named body, bipod, scope, mag. Needs Blender's module: pip install bpy; then python3 tools/sniper-rifle.py
import bpy, urllib.request, tempfile, os
src = os.path.join(tempfile.mkdtemp(), 'ksr-29.blend')
open(src, 'wb').write(urllib.request.urlopen(urllib.request.Request('https://opengameart.org/sites/default/files/ksr-29.blend', headers={'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36'}), timeout=180).read())
bpy.ops.wm.open_mainfile(filepath=src)
keep = {'Cube': 'body', 'Cube.001': 'bipod', 'Cube.003': 'scope', 'Cube.004': 'mag'}
for o in list(bpy.data.objects):
    if o.name not in keep: bpy.data.objects.remove(o, do_unlink=True)
m = bpy.data.materials.new('ksr29'); m.use_nodes = True; nt = m.node_tree; b = nt.nodes['Principled BSDF']
t = nt.nodes.new('ShaderNodeTexImage'); t.image = bpy.data.images['Sniper_KSR_29_Col_3.png']; nt.links.new(t.outputs['Color'], b.inputs['Base Color'])
n = nt.nodes.new('ShaderNodeTexImage'); n.image = bpy.data.images['untitled.001']; n.image.colorspace_settings.name = 'Non-Color'; nm = nt.nodes.new('ShaderNodeNormalMap'); nt.links.new(n.outputs['Color'], nm.inputs['Color']); nt.links.new(nm.outputs['Normal'], b.inputs['Normal'])
b.inputs['Metallic'].default_value = 0.55; b.inputs['Roughness'].default_value = 0.5
for o, new in [(bpy.data.objects[k], v) for k, v in keep.items()]:
    o.data.materials.clear(); o.data.materials.append(m); o.name = new; o.data.name = new
bpy.ops.export_scene.gltf(filepath='data/sniper/m/ksr29.glb', export_format='GLB', export_apply=True, export_image_format='JPEG', export_jpeg_quality=85, export_yup=True)
