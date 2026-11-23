# fetches SKIRMISH TABLE's realistic bodies and their walking: Microsoft Rocketbox avatars, its German shepherd and its motion (MIT; github.com/microsoft/Microsoft-Rocketbox), each out of its FBX into data/full/chess/people/<name>.glb (the whole body, its pictures made small) and a_<clip>.glb (bones and one motion).
# Needs Blender's module (pip install bpy): python3 -I tools/chess-people.py [name ...]   then PWCHROME=/opt/pw-browsers/chromium node tools/chess-bake.cjs
import bpy, sys, os, shutil, tempfile, urllib.request, urllib.parse
from PIL import Image
RAW, OUT = 'https://raw.githubusercontent.com/microsoft/Microsoft-Rocketbox/master/Assets/', 'data/full/chess/people/'
# our name: (its folder, its pictures' first name, which of its pictures)
AV = {
    'knight': ('Avatars/Professions/Police_Female_01', None, None),
    'berserker': ('Avatars/Professions/Delivery_Male_01', None, None),
    'rogue': ('Avatars/Adults/Male_Adult_18', None, None),
    'archer': ('Avatars/Adults/Female_Adult_04', None, None),
    'alchemist': ('Avatars/Professions/Gardener_Male_01', None, None),
    'firemage': ('Avatars/Adults/Male_Adult_19', None, None),
    'cleric': ('Avatars/Adults/Female_Adult_06', None, None),
    'enchanter': ('Avatars/Adults/Female_Adult_11', None, None),
    'necro': ('Avatars/Adults/Female_Adult_10', None, None),
    'captain': ('Avatars/Professions/Fire_Male_06', None, None),
    'ogre': ('Avatars/Professions/Sports_Male_01', None, None),
    'ghost': ('Avatars/Adults/Female_Adult_16', None, None),
    'dog': ('Animals/Dog_GermanShepard_01', None, None),
}
AN = {'m_idle': 'static/m_idle_neutral_01', 'm_walk': 'xy/m_walk_neutral_01', 'm_run': 'xy/m_run_neutral_01', 'f_idle': 'static/f_idle_neutral_01', 'f_walk': 'xy/f_walk_neutral_01'}
SIZE = {'body': 1024, 'head': 512, 'color': 1024}
LIST = [l.strip() for l in open(os.environ['RBLIST'])] if os.environ.get('RBLIST') else None   # the library's file names (git ls-tree -r --name-only HEAD), to find each body's pictures

def get(path, to):
    with urllib.request.urlopen(RAW + urllib.parse.quote(path), timeout=600) as r, open(to, 'wb') as f: shutil.copyfileobj(r, f)
    return to
def out(path, anim):
    bpy.ops.export_scene.gltf(filepath=path, export_format='GLB', export_image_format='AUTO', export_yup=True, export_animations=anim, export_skins=True, export_frame_step=2 if anim else 1, export_force_sampling=True, export_optimize_animation_size=True, export_morph=False)
    print('WROTE', path, os.path.getsize(path) // 1024, 'KB', flush=True)

os.makedirs(OUT, exist_ok=True)
only = sys.argv[1:]
for name, (folder, _, _) in AV.items():
    if only and name not in only: continue
    tmp = tempfile.mkdtemp(); base = folder.split('/')[-1]
    try:
        tgas = [p for p in LIST if p.startswith('Assets/' + folder + '/Textures/') and p.endswith('_color.tga')]
        fbx = get(folder + '/Export/' + base + '.fbx', os.path.join(tmp, 'a.fbx')); tex = {}
        for p in tgas:
            kind = os.path.basename(p)[:-10].split('_', 1)[-1] if os.path.basename(p).count('_') > 1 else 'color'
            src = get(p[7:], os.path.join(tmp, 't.tga')); im = Image.open(src); s = SIZE.get(kind, 512); alpha = kind == 'opacity'
            q = os.path.join(tmp, kind + ('.png' if alpha else '.jpg')); im = im.convert('RGBA' if alpha else 'RGB').resize((s, s), Image.LANCZOS)
            im.save(q) if alpha else im.save(q, quality=90); os.remove(src); tex[kind] = q
        bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.fbx(filepath=fbx)
        for o in [o for o in bpy.data.objects if o.type == 'EMPTY']: bpy.data.objects.remove(o, do_unlink=True)
        for m in bpy.data.materials:
            kind = m.name.split('_')[-1].split('.')[0]; kind = kind if kind in tex else ('color' if 'color' in tex else next(iter(tex)))
            m.name = name + '_' + kind; m.use_nodes = True; nt = m.node_tree; nt.nodes.clear(); b = nt.nodes.new('ShaderNodeBsdfPrincipled'); o = nt.nodes.new('ShaderNodeOutputMaterial'); nt.links.new(b.outputs[0], o.inputs[0])
            t = nt.nodes.new('ShaderNodeTexImage'); t.image = bpy.data.images.load(tex[kind]); nt.links.new(t.outputs['Color'], b.inputs['Base Color'])
            if kind == 'opacity': nt.links.new(t.outputs['Alpha'], b.inputs['Alpha'])
        print(name, base, 'pictures', sorted(tex), 'materials', [m.name for m in bpy.data.materials], 'actions', [a.name for a in bpy.data.actions], flush=True)
        out(OUT + name + '.glb', name == 'dog')
    finally: shutil.rmtree(tmp, ignore_errors=True)
for k, src in AN.items():
    if only and k not in only: continue
    tmp = tempfile.mkdtemp()
    try:
        d, f = src.split('/'); fbx = get('Animations/all_animations_max_motextr_' + d + '/' + f + '.max.fbx', os.path.join(tmp, 'a.fbx'))
        bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.fbx(filepath=fbx)
        for o in [o for o in bpy.data.objects if o.type != 'ARMATURE']: bpy.data.objects.remove(o, do_unlink=True)
        out(OUT + 'a_' + k + '.glb', True)
    finally: shutil.rmtree(tmp, ignore_errors=True)
