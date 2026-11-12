# bakes the asylum's recorded sounds: python3 tools/asylum-sounds.py  ->  data/asylum/snd/*.mp3 and src/asylum/snd.js (from data/full/asylum/snd/; needs ffmpeg)
import os, subprocess
SRC, OUT = 'data/full/asylum/snd/', 'data/asylum/snd/'
PICK = {'amb': ('Ambience_MonstersBelly_00.mp3', 40, 40), 'hell': ('Ambience_Hell_01.mp3', 0, 40), 'machine': ('Evil_Machine_Loop_00.mp3', 0, 40),
  **{'zombie%d' % i: ('Zombie_0%d.wav' % i, 0, 56) for i in range(5)}, 'monster0': ('Monster_00.wav', 0, 56), 'monster2': ('Monster_02.wav', 0, 56), 'monster3': ('Monster_03.wav', 0, 56), 'monster5': ('Monster_05.wav', 0, 56),
  'scream0': ('Scream_Male_00.wav', 0, 56), 'scream1': ('Scream_Male_01.wav', 0, 56), 'bone': ('Bonecrack_00.wav', 0, 56), 'stab': ('Stab_Knife_00.wav', 0, 56),
  **{'breath%d' % i: ('Breath_Scared_0%d.wav' % i, 0, 48) for i in range(6)}, **{'drip%d' % i: ('Blood_Drip_0%d.wav' % i, 0, 48) for i in range(4)},
  'step0': ('stone01.ogg', 0, 56), 'step1': ('sfx100v2_footstep_01.ogg', 0, 56), 'step2': ('sfx100v2_footstep_02.ogg', 0, 56), 'creak0': ('door_01.ogg', 0, 56), 'creak1': ('door_02.ogg', 0, 56), 'dooropen': ('door_open.ogg', 0, 56), 'doorclose': ('door_close_02.ogg', 0, 56),
  'slam0': ('slam_02.ogg', 0, 56), 'slam1': ('slam_03.ogg', 0, 56), 'hit': ('hit_03.ogg', 0, 56), 'metalhit': ('sfx100v2_metal_hit_01.ogg', 0, 56), 'lock': ('key_open_01.ogg', 0, 56), 'rattle': ('sfx100v2_lock_open_01.ogg', 0, 56), 'click': ('switch_01.ogg', 0, 56), 'item': ('sfx100v2_items_01.ogg', 0, 56), 'metal': ('metal_04.ogg', 0, 56)}
os.makedirs(OUT, exist_ok=True)
for n, (f, cut, kb) in PICK.items():
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', SRC + f] + (['-t', str(cut)] if cut else []) + ['-ac', '1', '-ar', '32000', '-af', 'dynaudnorm=p=0.9:m=4' if cut else 'loudnorm=I=-18:TP=-1.5', '-b:a', '%dk' % kb, OUT + n + '.mp3'], check=True)
open('src/asylum/snd.js', 'w').write("// the asylum's recorded sounds, by name (written by tools/asylum-sounds.py)\n" + ''.join("import %s from '../../data/asylum/snd/%s.mp3';\n" % (n, n) for n in PICK) + 'export const SND = { ' + ', '.join(PICK) + ' };\n')
