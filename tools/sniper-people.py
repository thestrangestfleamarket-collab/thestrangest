# COLD BORE's people: Microsoft Rocketbox avatars and motion (MIT) out of their FBX into data/sniper/p/<name>.glb (a skinned body, its pictures 512 px) and data/sniper/p/a_<clip>.glb (a skeleton and one motion).
# Needs Blender's module and a checkout of the library's folders: pip install bpy; python3 tools/sniper-people.py <path to Microsoft-Rocketbox/Assets>
import bpy, sys, os, glob, tempfile
from PIL import Image
R, OUT, TMP = sys.argv[-1].rstrip('/') + '/', 'data/sniper/p/', tempfile.mkdtemp()
AV = ['Professions/Business_Male_01', 'Professions/Business_Male_03', 'Professions/Business_Male_04', 'Professions/Business_Male_05', 'Professions/Business_Male_06', 'Professions/Business_Male_07', 'Professions/Business_Female_01', 'Professions/Business_Female_02', 'Professions/Business_Female_03',
      'Professions/Security_Male_01', 'Professions/Military_Male_03', 'Professions/Pilot_Male_03', 'Adults/Male_Adult_03', 'Adults/Male_Adult_05', 'Adults/Male_Adult_06', 'Adults/Male_Adult_08', 'Adults/Female_Adult_01', 'Adults/Female_Adult_02', 'Adults/Female_Adult_04', 'Adults/Female_Adult_09']
AN = {'m_idle': 'static/m_idle_neutral_01', 'm_phone': 'static/m_cell_phone_talk_01', 'm_talk': 'static/m_gestic_talk_neutral_01', 'm_sit': 'static/m_sit_chair_idle_neutral_01', 'm_crouch': 'static/m_crouch_idle', 'm_look': 'static/m_idle_look_around_01', 'm_wait': 'static/m_idle_waiting_01', 'm_walk': 'xy/m_walk_neutral_01', 'm_run': 'xy/m_run_neutral_01',
      'f_idle': 'static/f_idle_neutral_01', 'f_phone': 'static/f_cell_phone_textmessage', 'f_talk': 'static/f_gestic_talk_neutral_01', 'f_sit': 'static/f_sit_chair_idle_neutral_01', 'f_crouch': 'static/f_crouch_idle', 'f_walk': 'xy/f_walk_neutral_01', 'f_run': 'xy/f_run_neutral_01'}
os.makedirs(OUT, exist_ok=True)
def pic(src, size, alpha=False):
    im = Image.open(src); im = im.convert('RGBA' if alpha else 'RGB').resize((size, size), Image.LANCZOS); p = os.path.join(TMP, os.path.basename(src)[:-4] + ('.png' if alpha else '.jpg')); im.save(p, quality=86) if not alpha else im.save(p); return p
def out(path, anim):
    bpy.ops.export_scene.gltf(filepath=path, export_format='GLB', export_image_format='AUTO', export_yup=True, export_animations=anim, export_skins=True, export_frame_step=2 if anim else 1, export_force_sampling=True, export_optimize_animation_size=True, export_morph=False)
    print('WROTE', path, os.path.getsize(path) // 1024, 'KB', flush=True)
for a in AV:
    name = a.split('/')[-1]; bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.fbx(filepath=R + 'Avatars/' + a + '/Export/' + name + '.fbx')
    tex = {os.path.basename(f).split('_', 1)[1][:-10]: f for f in glob.glob(R + 'Avatars/' + a + '/Textures/*_color.tga')}
    for o in [o for o in bpy.data.objects if o.type == 'EMPTY']: bpy.data.objects.remove(o, do_unlink=True)
    for m in bpy.data.materials:
        kind = m.name.split('_')[-1].split('.')[0]; m.use_nodes = True; nt = m.node_tree; nt.nodes.clear(); b = nt.nodes.new('ShaderNodeBsdfPrincipled'); o = nt.nodes.new('ShaderNodeOutputMaterial'); nt.links.new(b.outputs[0], o.inputs[0]); b.inputs['Roughness'].default_value = 0.8
        if kind in tex: t = nt.nodes.new('ShaderNodeTexImage'); t.image = bpy.data.images.load(pic(tex[kind], 256 if kind == 'head' else 512, kind == 'opacity')); nt.links.new(t.outputs['Color'], b.inputs['Base Color'])
        if kind == 'opacity' and kind in tex: nt.links.new(t.outputs['Alpha'], b.inputs['Alpha']); m.blend_method = 'CLIP' if hasattr(m, 'blend_method') else m.blend_method
    out(OUT + name + '.glb', False)
for k, src in AN.items():
    bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.fbx(filepath=R + 'Animations/all_animations_max_motextr_' + src.split('/')[0] + '/' + src.split('/')[1] + '.max.fbx')
    for o in [o for o in bpy.data.objects if o.type != 'ARMATURE']: bpy.data.objects.remove(o, do_unlink=True)
    out(OUT + 'a_' + k + '.glb', True)
