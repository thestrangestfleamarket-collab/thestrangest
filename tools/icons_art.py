# the rest of the families (exec'd by tools/icons.py: Pic, T, add, dk, lt, K come from there)

# ---------------------------------------------------------------- birds: perched, facing left; caged ones behind brass bars
BIRD = T(["", "", "....kkkk", "...kHHHHk", "..kHEHHHHk", "kKKkHHHHHk", ".kkTTHHHBBkk", "...kTTBBBBWWk", "...kTTBBBWWWWk", "...kTTTBBWwWWWk",
          "....kTTTBBWWWWAk", ".....kkTTBBkAAAk", ".......kLkLk.kAk", ".......kLkLk..kk", "......kLLkLLk"])
CREST = [".....k", "....kHk", "....kHHkk"]
def bird(c, crest=False, marks=()):
    pal = {'H': c['H'], 'E': '#101010', 'K': c.get('K', '#3a3430'), 'T': c['T'], 'B': c['B'], 'W': c.get('W', dk(c['B'], .8)), 'w': c.get('w', dk(c['B'], .6)),
           'A': c.get('A', dk(c['B'], .75)), 'L': c.get('L', '#8a6a50')}
    p = Pic().put(BIRD, pal)
    if crest: p.put(CREST, pal, 0, 0)
    for x, y, col in marks: p.px(x, y, col)
    return p
BIRDS = [
 dict(H='#8a8a86', T='#c8c4b8', B='#8a5a34', W='#a06a3a', w='#3a2a1a', K='#3a3430', m=((4, 3, '#7a4a2a'), (5, 3, '#7a4a2a'), (6, 3, '#7a4a2a'), (4, 6, '#1a1a1a'), (5, 6, '#1a1a1a'))),          # house sparrow
 dict(H='#6a7080', T='#8a90a0', B='#8a90a0', W='#9aa0b0', w='#2a2a34', K='#2a2a2a', L='#c86a6a', m=((5, 6, '#4a9a7a'), (6, 6, '#8a5aa0'), (8, 6, '#4a9a7a'))),                    # rock pigeon
 dict(H='#1a1a24', T='#22222e', B='#1e1e2a', W='#24242e', w='#e8e8e0', K='#e8c040', A='#1a1a24', m=((6, 8, '#e8e8e0'), (8, 10, '#e8e8e0'), (5, 4, '#3a6a5a'), (7, 7, '#e8e8e0'))),   # european starling
 dict(H='#2a2a2e', T='#d8642a', B='#5a5650', W='#5a5650', w='#4a4640', K='#e8b030', A='#3a3a3a', m=((3, 4, '#f0f0f0'),)),                                                  # american robin
 dict(H='#a89a8a', T='#c8a8a0', B='#a89a8a', W='#b0a090', w='#2a2420', A='#9a8a7a', K='#2a2a2a', L='#c87a7a', m=()),                                                         # mourning dove
 dict(H='#4a7ac8', T='#e8ecf0', B='#4a7ac8', W='#3a6ad0', w='#f0f0f0', A='#3a6ad0', K='#1a1a1a', c=1, m=((4, 6, '#1a1a1a'), (5, 7, '#1a1a1a'), (6, 7, '#1a1a1a'))),           # blue jay
 dict(H='#c8201e', T='#d8302a', B='#b82020', W='#a01a1a', w='#7a1010', A='#a01a1a', K='#e88a3a', c=1, m=((2, 4, '#1a1a1a'), (3, 5, '#1a1a1a'), (4, 6, '#1a1a1a'))),         # northern cardinal
 dict(H='#1a1a1a', T='#e8dcc8', B='#8a8c90', W='#7a7c80', w='#d8d8d8', A='#7a7c80', K='#1a1a1a', m=((5, 4, '#f4f4f0'), (6, 4, '#f4f4f0'), (6, 5, '#f4f4f0'), (7, 5, '#f4f4f0'), (4, 6, '#1a1a1a'), (5, 6, '#1a1a1a'))),  # black-capped chickadee
 dict(H='#8a8c8a', T='#d8d8d4', B='#8a8c8a', W='#6a6c6a', w='#f0f0f0', A='#5a5c5a', K='#1a1a1a', m=((11, 8, '#f0f0f0'), (12, 8, '#f0f0f0'))),                               # northern mockingbird
 dict(H='#141418', T='#18181c', B='#141418', W='#18181c', w='#18181c', A='#141418', K='#1a1a1a', m=((10, 7, '#d8201a'), (11, 7, '#d8201a'), (10, 8, '#e8c840'))),            # red-winged blackbird
 dict(H='#141414', T='#f08a1e', B='#1a1a1a', W='#1a1a1a', w='#f0f0f0', A='#1a1a1a', K='#5a5a5a', m=()),                                                                     # baltimore oriole
 dict(H='#d8241e', T='#e02a20', B='#d02420', W='#141414', w='#141414', A='#141414', K='#c8b080', m=()),                                                                     # scarlet tanager
 dict(H='#7a5a3a', T='#ece2cc', B='#6a4a2a', W='#5a3a22', w='#ece2cc', A='#c8502a', K='#e8c040', L='#e8c040', m=((1, 5, '#2a2a2a'), (6, 9, '#6a4a2a'), (5, 10, '#6a4a2a'))),  # red-tailed hawk
]
BAR = '#c8a040'
def cage(p):
    for y in range(1, 15):
        for x in (1, 4, 7, 10, 13):
            p.px(x, y, BAR if y > 1 else dk(BAR))
    for x in range(1, 14): p.px(x, 1, BAR); p.px(x, 14, dk(BAR, .7))
    for x in range(0, 15): p.px(x, 15, K)
    p.px(7, 0, BAR); return p
for i, c in enumerate(BIRDS):
    add('pet_%d' % i, bird(c, c.get('c'), c['m']))
    add('bd_%d' % i, cage(bird(c, c.get('c'), c['m'])))

# ---------------------------------------------------------------- fish (head left)
FISH = {
 'std': T(["", "", "", "......kkkk", ".....kFFFFk", "...kkBBBBBBkk", "..kBBBBBBBBBBk.k", ".kWEBBBBBBBBBkFk", "kBBBMMMMMMMMMFFk", ".kbbbbbbbbbbbkFk", "..kbbbbbbbbbk.kk", "...kkkbbbkkk", "......kFk"]),
 'deep': T(["", "", "", ".....kkkkk", "...kkBBBBBkk", "..kBBBBBBBBBk.kk", ".kBBBBBBBBBBBkFk", "kWEBBBMBBBBBBFFk", "kBBBBMBBBBBBBFFk", ".kbbbbbbbbbbbkFk", "..kbbbbbbbbbk.kk", "...kkbbbbbkk", ".....kkkkk"]),
 'long': T(["", "", "", "", "", "....kkk", "..kkBBBkkkkkk", ".kBBBBBBBBBBBkkk", "kWEBBMMMMMMMMBFk", ".kbbbbbbbbbbbbFk", "..kkkkkkkkkkkkk"]),
 'eel': T(["", "", "", "", "", "", "..kkkkkk", ".kBBBBBBkk....kk", "kWEBBMMBBBkkkkBk", ".kbbbbbbbbbBBBk", "..kkkkkkbbbbbk", "........kkkkk"]),
 'flat': T(["", "", "", ".......kk", ".....kkBBkk", "....kBBBBBBk", "...kBEBBEBBBk", "..kBBBBBBBBBBk", ".kBBMBBBBMBBBBk", "..kBBBBBBBBBBk", "...kBBBMBBBBk", "....kBBBBBBk", ".....kkBBkk", "......kFFk", ".....kFFFFk", ".....kkkkkk"]),
 'sturgeon': T(["", "", "", "", "", ".....kkkkkk", "...kkBWBWBWBkkkk", ".kkBBBBBBBBBBkFk", "kBBEBBBBBBBBBFFk", ".kkbbbbbbbbbbkkk", "...kkbkkbkkkkk", "....kk.kk"]),
}
def fish(sh, B, b, M, F, marks=()):
    p = Pic().put(FISH[sh], {'B': B, 'b': b, 'M': M, 'F': F, 'E': '#101010', 'W': '#e8e8e0'})
    for x, y, c in marks: p.px(x, y, c)
    return p
add('x_bass', fish('std', '#7a8a8a', '#e8ece8', '#3a3a40', '#6a7a7a', [(x, 7, '#3a3a40') for x in range(5, 12, 2)]+[(x, 9, '#5a5a60') for x in range(4, 12, 2)]))
add('x_bluefish', fish('std', '#3a6a8a', '#c8d8e0', '#5a8aa8', '#3a5a6a', [(3, 7, '#1a2a3a')]))
add('x_bluegill', fish('deep', '#4a6a5a', '#e8a040', '#3a5a4a', '#4a5a5a', [(3, 7, '#1a2a3a'), (4, 7, '#1a2a3a'), (6, 5, '#3a4a5a'), (8, 5, '#3a4a5a'), (10, 5, '#3a4a5a')]))
add('x_carp', fish('std', '#a88a3a', '#e8d090', '#8a6a2a', '#8a5a2a', [(1, 9, '#8a6a2a'), (6, 6, '#c8a850'), (9, 6, '#c8a850'), (7, 9, '#d8b860')]))
add('x_catfish', fish('std', '#5a6a7a', '#d8d8d0', '#4a5a6a', '#4a5a6a', [(0, 9, K), (0, 10, K), (1, 11, K), (0, 6, K), (1, 6, K)]))
add('x_eel', fish('eel', '#4a4a2a', '#a8a060', '#5a5a32', '#3a3a2a'))
add('x_flounder', fish('flat', '#8a7a5a', '#8a7a5a', '#5a4a3a', '#7a6a4a', [(6, 10, '#c8b890'), (10, 7, '#c8b890')]))
add('x_lbass', fish('std', '#5a7a3a', '#e0e0b0', '#2a3a1a', '#4a6a3a', [(1, 8, '#e0e0b0')]))
add('x_perch', fish('std', '#9aa0a0', '#f0f0f0', '#b8c0c0', '#8a9090'))
add('x_pike', fish('long', '#4a6a3a', '#e0e0b0', '#c8d890', '#6a7a3a', [(5, 7, '#c8d890'), (8, 7, '#c8d890'), (11, 7, '#c8d890')]))
add('x_shad', fish('std', '#4a6a7a', '#e8eef0', '#c8d0d8', '#6a7a8a', [(5, 7, '#1a1a1a')]))
add('x_sturgeon', fish('sturgeon', '#5a5a50', '#d8d0c0', '#5a5a50', '#4a4a40'))
add('x_sunfish', fish('deep', '#6a8a5a', '#f0a040', '#4aa0c8', '#5a7a4a', [(3, 6, '#1a1a1a'), (4, 6, '#d82a1a'), (5, 9, '#4aa0c8'), (8, 6, '#4aa0c8')]))
add('x_tomcod', fish('std', '#7a6a4a', '#e8e0c8', '#5a4a30', '#6a5a3a', [(5, 6, '#5a4a30'), (8, 7, '#5a4a30'), (10, 6, '#5a4a30')]))
add('x_trout', fish('std', '#6a8a5a', '#f0e8e0', '#e08aa0', '#7a8a6a', [(5, 6, K), (8, 7, K), (10, 6, K), (12, 7, K), (6, 9, '#3a3a3a')]))
add('x_yperch', fish('std', '#c8a830', '#f0e8b0', '#c8a830', '#e07a30', [(x, y, '#3a3a1a') for x in (5, 8, 11) for y in (6, 7, 8)]))
add('x_crab', Pic().put(T(["", "", "..kk........kk", ".kOOk......kOOk", ".kOkOk....kOkOk", "..kkBk....kBkk", "....kBkkkkBk", "...kBBBBBBBBk", ".kkBBbBBBBbBBkk", "kBkBBBBBBBBBBkBk", ".kkkBBBBBBBBkkk", ".kBk.kkkkkk.kBk", "kBk.kBk..kBk.kBk", ".k..kk....kk..k"]), {'B': '#3a7ad8', 'b': '#1a1a1a', 'O': '#f08a24'}))
add('x_boot', Pic().put(T(["", "", "...kkkkkk", "...kBBbBBk", "...kBBBBBk", "...kBbBBBk", "...kBBBBBk", "...kBBBbBk", "...kBBBBBkkkk", "...kBbBBBBBBBkk", "...kBBBBBbBBBBk", "..kkBBBBBBBBBBk", "..kSSSSSSSSSSSk", "..kkkkkkkkkkkkk", "...G..G"]), {'B': '#6a4a2a', 'b': '#4a3220', 'S': '#3a2a1a', 'G': '#4a8a4a'}))
add('x_can', Pic().put(T(["", "", "", "....kkkkkkk", "...kSSSSSSSk", "...kkSSSSSkk", "...kRRRRRRRk", "...kRwwwwwRk", "...kRwRRRwRk", "...kRwwwwwRk", "...kOROORRRk", "...kSRSSSRSk", "...kSSSSSSSk", "....kkkkkkk"]), {'S': '#a8adb8', 'R': '#a85a3a', 'w': '#d8d0b8', 'O': '#7a4a2a'}))
add('x_note', Pic().put(T(["", ".....kkk", ".....kNk", ".....kNk", "....kkkkk", "....kGGGk", "...kGGPGGk", "...kGPPPGk", "...kGPPPGk", "...kGPPPGk", "...kGPPPGk", "...kGPPPGk", "...kGGPGGk", "...kgGGGgk", "....kkkkk"]), {'N': '#a8885a', 'G': '#7ac0a0', 'g': '#4a8a70', 'P': '#ece2c4'}))

# ---------------------------------------------------------------- flowers: a bloom on the shared stem
STEM = T(["", "", "", "", "", "", "", "", ".......kGk", "...kk..kGk", "..kLLk.kGk.kk", "..kLlLkkGkkLLk", "...kkLLkGkLlk", ".....kkkGkkk", ".......kGk", ".......kkk"])
BLOOM = {
 'daisy': T(["", ".....k.kk.k", "....kPkPPkPk", "...kkPPkkPPkk", "..kPPPkCCkPPPk", "..kPPPkCCkPPPk", "...kkPPkkPPkk", "....kPkPPkPk", ".....k.kk.k"]),
 'cup': T(["", "", ".....k.kk.k", "....kPkPPkPk", "....kPPPPPPk", "....kPpPPpPk", "....kPPCCPPk", ".....kPPPPk", "......kkkk"]),
 'spike': T(["......kk", ".....kPPk", "....kPpPkk", ".....kPPPPk", "....kPPpPPk", "....kkPPPPpk", ".....kPpPPk", "......kPPk", ".......kk"]),
 'bell': T(["", "....kkkkk", "...kGGGGGkk", "..kGkkk.kGk", ".kPPk.kPPkGk", ".kPPk.kPPkGk", "kPPPPkPPPPkGk", "kkpkpkkpkpkGk", ".......kGGk"]),
 'puff': T(["", "......kkkk", "....kkPpPPkk", "...kPPPPpPPPk", "...kPpPPPPpPk", "...kPPPpPPPPk", "...kPPPPPpPPk", "....kkPPPPkk", "......kkkk"]),
 'rose': T(["", "......kkkk", ".....kPPpPk", "....kPpPPpPk", "....kPPppPPk", "....kpPPPPpk", ".....kPppPk", "......kkkk"]),
 'iris': T(["", ".......kk", "......kPPk", "...kk.kPPk.kk", "..kPPkkPPkkPPk", "..kPpPkCCkPpPk", "...kPPPPPPPPk", "....kkPPPPkk", "......kkkk"]),
 'slipper': T(["", "...kk......kk", "..kNNk....kNNk", "...kNNk..kNNk", "....kNNkkNNk", ".....kPPPPk", "....kPpPPpPk", "....kPPpPPPk", ".....kPPPPk", "......kkkk"]),
 'violet': T(["", "", "", ".....kk.kk", "....kPPkPPk", "....kPkCkPk", ".....kPPPk", "......kPk", ".......k"]),
 'sun': T(["......kkkk", "...kk.kPPk.kk", "..kPPkkPPkkPPk", "..kPPkCCCCkPPk", "...kkCcCcCCkk", ".kkPkCCcCcCkPkk", "kPPPkCcCcCCkPPPk", ".kkPkCCcCcCkPkk", "...kkCcCcCCkk", "..kPPkCCCCkPPk", "..kPPkkGGkkPPk", "...kk.kGGk.kk"]),
}
def flower(shape, P, C=None, stem=True):
    pal = {'P': P, 'p': dk(P, .75), 'C': C or dk(P, .6), 'c': dk(C or P, .55), 'G': '#4f9a3a', 'L': '#4f9a3a', 'l': '#2f6a24', 'N': '#6a4a2a'}
    p = Pic()
    if stem: p.put(STEM, pal)
    return p.put(BLOOM[shape], pal)
FL = {'aster': ('daisy', '#a890e0', '#f2c62e'), 'bluebell': ('bell', '#5a6ad8'), 'chicory': ('daisy', '#7aa8f0', '#e8e8f8'), 'clover': ('puff', '#e070a0'),
      'cosmos': ('daisy', '#f08ac8', '#f2c62e'), 'daisy': ('daisy', '#f8f6ee', '#f2c62e'), 'dandelion': ('puff', '#f8d830'), 'foxglove': ('spike', '#d870c0'),
      'goldenrod': ('spike', '#f0c020'), 'iris': ('iris', '#6a4ad0', '#f2c62e'), 'lavender': ('spike', '#a07ad8'), 'marigold': ('puff', '#f08a1a'),
      'poppy': ('cup', '#e02a20', '#1a1a1a'), 'rose': ('rose', '#d8343c'), 'slipper': ('slipper', '#f0a0c0'), 'sunflower': ('sun', '#f2c62e', '#6a4020'),
      'tulip': ('cup', '#f0405a', '#f0405a'), 'violet': ('violet', '#7a4ac8', '#f2e060'), 'zinnia': ('daisy', '#e83a8a', '#f0b020')}
for k, v in FL.items():
    add('fl_'+k, flower(*v, stem=(k != 'sunflower')) if k != 'sunflower' else Pic().put(STEM, {'G': '#4f9a3a', 'L': '#4f9a3a', 'l': '#2f6a24'}).put(BLOOM['sun'], {'P': '#f2c62e', 'C': '#6a4020', 'c': '#3a2210', 'G': '#4f9a3a'}))
add('fl_blossom', Pic().put(T(["", "..kkkkkkkkkkkk", "..kNNNNNNNNNNk", "...kPk.kPk.kPkk", "...kPk.kPk.kPkLk", "...kpk.kpk.kpkLk", "...kPk.kPk.kPkk", "...kpk.kpk.kpk", "....k...k...k"]), {'N': '#6a4a2a', 'P': '#c8d060', 'p': '#98a040', 'L': '#4f9a3a'}))

# seeds: a packet with its flower, a bulb, a cutting or a root
PACKET = T(["", "...kkkkkkkkkk", "...kWwWwWwWwk", "...kWWWWWWWWk", "...kWWWfWWWWk", "...kWWfcfWWWk", "...kWWWfWWWWk", "...kWWWgWWWWk", "...kWWWgWWWWk", "...kAAAAAAAAk", "...kAaAaAaAAk", "...kWWWWWWWWk", "...kkkkkkkkkk"])
def packet(f, A, c='#f2c62e'):
    return Pic().put(PACKET, {'W': '#ece2c4', 'w': '#c8bc9c', 'f': f, 'c': c, 'g': '#4f9a3a', 'A': A, 'a': lt(A, .6)}, 0, 1)
BULB = T(["", "........kk", ".......kGk", "......kGk", ".....kkkkk", "....kTTtTTk", "...kTTTtTTTk", "..kTTtTTTTtTk", "..kTTTtTTTTTk", "..kTtTTTTtTTk", "...kTTTTTTTk", "....kkkkkkk", ".....kW.kW.k", "....kW..kW"])
add('sd_foxglove', packet('#d870c0', '#8a3a7a')); add('sd_lavender', packet('#a07ad8', '#5a3a8a')); add('sd_marigold', packet('#f08a1a', '#a05010', '#a05010'))
add('sd_sunflower', packet('#f2c62e', '#8a6a20', '#6a4020')); add('sd_violet', packet('#7a4ac8', '#4a2a7a')); add('sd_zinnia', packet('#e83a8a', '#8a2050'))
add('sd_tulip', Pic().put(BULB, {'T': '#c89a6a', 't': '#8a6040', 'G': '#4f9a3a', 'W': '#e8dcc0'}))
add('sd_iris', Pic().put(BULB, {'T': '#a88a6a', 't': '#6a5040', 'G': '#6a8ad0', 'W': '#e8dcc0'}))
add('sd_rose', Pic().put(T(["", "", "..........kk", ".........kLLk", "..kk....kLlLk", ".kLLk..kGkkk", ".kLlLkkGk", "..kkkGGk", "....kGk", "...kGk", "..kGk", "..kTk", "..kk"]), {'G': '#4f8a3a', 'L': '#4f9a3a', 'l': '#2f6a24', 'T': '#e8dcc0'}))
add('sd_slipper', Pic().put(T(["", "", "......kkkk", ".....kGGGGk", "......kGGk", ".....kNNNNk", "....kNnNNnNk", "...kkNNNNNNkk", "..kN.kNnNNk.Nk", ".kN..kN.kN..kN", ".k..kN...kN..k", "...kN.....kN", "...k.......k"]), {'G': '#4f9a3a', 'N': '#a07a50', 'n': '#7a5a3a'}))
add('seed_hum', packet('#7ac040', '#3a7a2a', '#e8e060')); add('seed_star', packet('#5aa040', '#2a6a5a', '#f8f0a0')); add('seed_sun', packet('#f05a1a', '#a03010', '#f8d040'))

# ---------------------------------------------------------------- vegetables and fruit
P = lambda rows, pal: Pic().put(T(rows), pal)
G = '#4f9a3a'; g = '#2f6a24'
add('v_carrot', P(["..........kk.k", ".........kGGkGk", "........kGGkGGk", ".......kkkGGGk", "......kOOOkkk", ".....kOoOOOk", "....kOOOOoOk", "....kOoOOOk", "...kOOOOoOk", "...kOOoOOk", "..kOOOOOk", "..kOoOOk", ".kOOOOk", ".kOOok", "kOOk", "kkk"], {'O': '#f08a24', 'o': '#b05a10', 'G': G}))
add('v_pumpkin', P(["", ".......kk", "......kGGk", ".......kGk", "...kkkkkkkkkk", "..kOOoOOOOoOOk", ".kOOoOOOOOOoOOk", ".kOoOOOOOOOOoOk", "kOOoOOOOOOOOoOOk", "kOOoOOOOOOOOoOOk", "kOOoOOOOOOOOoOOk", ".kOoOOOOOOOOoOk", ".kOOoOOOOOOoOOk", "..kOOoOOOOoOOk", "...kkkkkkkkkk"], {'O': '#f08a24', 'o': '#b05a10', 'G': G}))
add('v_tomato', P(["", "", "......k.k", ".....kGkGk", "...kkkGGGkkk", "..kRRkGkGkRRk", ".kRWRRkRRRRRRk", ".kRWRRRRRRRRRk", ".kRRRRRRRRRRRk", ".kRRRRRRRRRRrk", ".kRRRRRRRRRrrk", "..kRRRRRRRrrk", "...kkrrrrrkk", ".....kkkkk"], {'R': '#d8302a', 'r': '#a01e1a', 'W': '#f8a090', 'G': G}))
add('v_cabbage', P(["", "", ".....kkkkkk", "...kkLLLLLLkk", "..kLLlLLLLlLLk", ".kLlLLLlLLLLlLk", ".kLLLlLLLlLLLLk", "kLLlLLLLLLlLLLLk", "kLLLLlLLlLLLlLLk", "kLlLLLlLLLLLLlLk", ".kLLlLLLLlLLLLk", ".kLLLLlLLLLlLLk", "..kLLLLLlLLLLk", "...kkLLLLLLkk", ".....kkkkkk"], {'L': '#8ac860', 'l': '#5a9a40'}))
add('v_corn', P(["", "......kk", ".....kHHk", "....kHYYHk", "...kGYyYYkk", "...kGYYyYGk", "..kGGYyYYGk", "..kGYYyYYGk", "..kGGYYyGGk", "...kGYyYGk", "...kGGYYGk", "....kGGGk", ".....kGGk", "......kGk", ".......kk"], {'Y': '#f2d040', 'y': '#c8a020', 'G': '#6ab04a', 'H': '#d8c890'}))
add('v_eggplant', P(["", ".........kk", "........kGGk", ".......kGGGk", "......kkGGkk", ".....kEEkkEk", "....kEeEEEEk", "...kEeEEEEEk", "..kEeEEEEEEk", ".kEeEEEEEEEk", ".kEEEEEEEEk", ".kEEEEEEEEk", "..kEEEEEEk", "...kkkkkk"], {'E': '#5a2a7a', 'e': '#9a6ac0', 'G': G}))
add('v_greens', P(["", "...kk....kk", "..kLLk..kLLk", "..kLlLkkLlLk", ".kLLlLLLLlLLk", ".kLlLlLLLlLlk", "..kLLlLLlLLk", "..kLlLlLlLlk", "...kLLlLlLk", "....kLlLLk", "....kkGGkk", ".....kGGk", "......kk"], {'L': '#5aaa40', 'l': '#2f7a24', 'G': '#e0e8c0'}))
add('v_onion', P(["", "......kk", ".....kGk", ".....kGk", ".....kOk", "....kOOOk", "...kOoOOOk", "..kOOoOOOOk", "..kOOoOOOOk", "..kOOoOOOOk", "..kOOOoOOOk", "...kOOoOOk", "....kkkkk", "....kW.Wk", "....k.k.k"], {'O': '#c88a40', 'o': '#8a5a2a', 'G': G, 'W': '#e8dcc0'}))
add('v_pepper', P(["", "......kk", ".....kGk", "....kkGkkk", "...kRRkRRRk", "..kRWRRRRRRk", "..kRWRRRRRRk", "..kRRRRRRRRk", "..kRRRRRRRrk", "..kRRRRRRRrk", "..kRRRRRRrrk", "...kRRkRRrk", "....kk.kkk"], {'R': '#d8302a', 'r': '#a01e1a', 'W': '#f8a090', 'G': G}))
add('v_potato', P(["", "", "", "", "....kkkkkk", "..kkPPPPPPkk", ".kPPdPPPPPPPk", "kPPPPPPPdPPPPk", "kPPPPPPPPPPPpk", "kPdPPPPPPPPppk", ".kPPPPdPPPppk", "..kkpppppppk", "....kkkkkkk"], {'P': '#c8a060', 'p': '#9a7840', 'd': '#7a5a30'}))
add('fr_apple', P(["", "........kk", ".......kNkkk", "....kkkkkLLk", "...kRRRkRkkk", "..kRWRRRRRRk", "..kRWRRRRRRk", "..kRRRRRRRRk", "..kRRRRRRRrk", "..kRRRRRRRrk", "...kRRRRRrk", "....kRkkRk", ".....k..k"], {'R': '#d8302a', 'r': '#a01e1a', 'W': '#f8a090', 'N': '#6a4a2a', 'L': G}))
add('fr_pear', P(["", "......kk", ".....kNkk", ".....kNkLk", "....kkkkk", "....kPPPk", "...kPWPPPk", "...kPWPPPk", "..kPPPPPPPk", ".kPPPPPPPPPk", ".kPPPPPPPPpk", ".kPPPPPPPppk", "..kPPPPPppk", "...kkkkkkk"], {'P': '#c8d050', 'p': '#98a030', 'W': '#f0f0a0', 'N': '#6a4a2a', 'L': G}))
add('fr_plum', P(["", "", "", ".......kk", "......kNk", "....kkkkkkk", "...kUUUUUUUk", "..kUWUUUUUUUk", "..kUWUUUUuUUk", "..kUUUUUuUUUk", "..kUUUUUuUUuk", "...kUUUuUUuk", "....kkkkkkk"], {'U': '#7a3a8a', 'u': '#5a2a6a', 'W': '#c8a0e0', 'N': '#6a4a2a'}))
add('fr_fig', P(["", "", ".......kk", "......kNk", ".....kUUk", "....kUUUUk", "...kUuUUUUk", "..kUUUUUuUUk", "..kUuUUUUUUk", "..kUUUUuUUUk", "..kUUUUUUUuk", "...kUUuUUuk", "....kkkkkk"], {'U': '#7a4a6a', 'u': '#a06a5a', 'N': '#4a6a2a'}))
add('fr_hum', P(["", "", "", "...........kk", "..........kGk", ".........kGk", "...kkkkkkkGk", "..kBBbBBbBBk", ".kBBBBBBBBBk", "..kBBbBBbBk", "...kkkkkkk", "", "..kk..k", ".kYk.kYk", ".kk..kk"], {'B': '#7ac040', 'b': '#4a8a2a', 'G': G, 'Y': '#f2c14e'}))
add('fr_star', P(["", "", "...........kk", ".........kkGGk", "......kkkCCkk", "....kkCCCcCCk", "...kCCcCCCCCk", "..kCCCCCcCCk", ".kCcCCCCCCk", ".kCCCCcCCk", "kCCcCCCkk", "kCCCCkk", ".kkkk", "", "..........k", ".........kYk"], {'C': '#5aa040', 'c': '#f8f0a0', 'G': G, 'Y': '#f8f0a0'}))
add('fr_sun', P(["..k......k", "...kY..Yk", "....k.kk..", ".......kGk", "......kkGkk", ".....kRRkRRk", "....kROORRRk", "Yk..kROORRRk..kY", "....kRRRRRRk", "....kRRRRRRk", "....kRRRRRrk", ".....kRRRRk", "......kRRk", ".......kk", "...kY..Yk", "..k......k"], {'R': '#f05a1a', 'r': '#b0400a', 'O': '#f8d040', 'G': G, 'Y': '#f8d040'}))
add('nut_acorn', P(["", "", ".......kk", "......kNk", "...kkkkkkkk", "..kCcCcCcCk", ".kCcCcCcCcCk", ".kkkkkkkkkkk", "..kAAAAAAAk", "..kAWAAAAAk", "..kAWAAAAak", "...kAAAAak", "....kAAak", ".....kkk"], {'C': '#8a6a40', 'c': '#6a4a2a', 'A': '#c88a3a', 'a': '#9a6024', 'W': '#e8b870', 'N': '#6a4a2a'}))

# ---------------------------------------------------------------- gems
def crystal(A, a, W):
    return P(["", "", ".......kk", "......kAAk", "..kk..kWAk.kk", ".kAAk.kWAkkAAk", ".kWAkkkWaAkAak", ".kWaAkWAaAkWak", "..kWAkWAaAkWk", "..kkWAkAaAkk", "..kSkWAAaAkSk", ".kSSSkkkkkSSSk", "..kSSSSSSSSSk", "...kkkkkkkkk"], {'A': A, 'a': a, 'W': W, 'S': '#8a8478'})
def pebble(A, a, W):
    return P(["", "", "", "", "....kkkkkk", "..kkAAAAAAkk", ".kAWWAAAAAAAk", ".kAWAAAAAAAAk", "kAAAAAAAAAAAak", "kAAAAAAAAAAaak", ".kAAAAAAAAaak", "..kkaaaaaakk", "....kkkkkk"], {'A': A, 'a': a, 'W': W})
add('quartz', crystal('#e8ecf0', '#b8c0c8', '#ffffff')); add('amethyst', crystal('#a070d8', '#6a3aa8', '#d8c0f8'))
add('emerald', crystal('#3ac070', '#1a8040', '#a0f0c0')); add('sapphire', crystal('#3a6ad8', '#1a3a98', '#a0c0f8')); add('ruby', crystal('#d8243a', '#981a2a', '#f8a0a8'))
add('moonstone', pebble('#c8d8f0', '#9aa8c8', '#f4f8ff')); add('opal', pebble('#e8e8f0', '#b8a8d8', '#a0f0d8'))
add('amber', P(["", "", "", "....kkkkkk", "...kAAAAAAk", "..kAWWAAAAak", ".kAWAAAAAAAak", ".kAAAAAkAAAak", ".kAAAAkNkAAak", ".kAAAAAkAAaak", "..kAAAAAAaak", "...kaaaaaak", "....kkkkkk"], {'A': '#f0a020', 'a': '#b86a10', 'W': '#f8d890', 'N': '#3a2a1a'}))
add('geode', P(["", "", "....kkkkkk", "..kkRRRRRRkk", ".kRRkkkkkkRRk", ".kRkCWCCWCkRk", "kRkCWAAWACCkRk", "kRkWAAAAAAWkRk", "kRkCAAAAAACkRk", "kRkCWAAAAWCkRk", ".kRkCCWWCCkRk", ".kRRkkkkkkRRk", "..kkRRRRRRkk", "....kkkkkk"], {'R': '#8a7a6a', 'C': '#d8d0e8', 'W': '#ffffff', 'A': '#9a6ad0'}))
add('meteor', P(["", "", "", "....kkkkk", "..kkMMMMMkk", ".kMMmMMMSMMk", ".kMSMMMmMMMk", "kMMMMmMMMSMMk", "kMmMMMMMMMMMk", "kMMMSMMMmMMmk", ".kMMMMmMMMmk", "..kmmMMMmmk", "...kkkkkkk"], {'M': '#4a4648', 'm': '#2a2628', 'S': '#d8d8e8'}))
def cut(A, a, W):
    return P(["", "", "", "...kkkkkkkkk", "..kWWAWAAWAAk", ".kWAAkAAkAAaAk", "kkkkkkkkkkkkkk", ".kAAaAAaAAaAk", "..kAaAAaAAak", "...kAaAAaak", "....kAAaak", ".....kAak", "......kk"], {'A': A, 'a': a, 'W': W})
for k, c in {'amber': ('#f0a020', '#b86a10', '#f8d890'), 'amethyst': ('#a070d8', '#6a3aa8', '#d8c0f8'), 'emerald': ('#3ac070', '#1a8040', '#a0f0c0'),
             'meteor': ('#8a8890', '#4a4648', '#e8e8f4'), 'moonstone': ('#c8d8f0', '#9aa8c8', '#f4f8ff'), 'opal': ('#d8e8f0', '#b8a8d8', '#a0f0d8'),
             'quartz': ('#e8ecf0', '#b8c0c8', '#ffffff'), 'ruby': ('#d8243a', '#981a2a', '#f8a0a8'), 'sapphire': ('#3a6ad8', '#1a3a98', '#a0c0f8'),
             'm_morel': ('#c8a070', '#8a6a3a', '#f0dcb8'), 'm_moonglow': ('#a8f0ff', '#68b8d8', '#ffffff')}.items():
    add('cut_'+k, cut(*c))

# ---------------------------------------------------------------- books: worn ones stained and frayed, restored ones clean with gold
BOOK = T(["", "", "...kkkkkkkkkk", "..kCCCCCCCCCCk", "..kCcCCCCCCCPk", "..kCcCCeeCCCPk", "..kCcCeeeeCCPk", "..kCcCCeeCCCPk", "..kCcCCCCCCCPk", "..kCcCCCCCCCPk", "..kCcCCCCCCCPk", "..kCcCCCCCCCPk", "..kCCCCCCCCCCk", "...kkkkkkkkkk"])
def book(C, e, worn):
    p = Pic().put(BOOK, {'C': C, 'c': dk(C, .7), 'e': e if not worn else dk(e, .7), 'P': '#ece2c4'})
    if worn:
        for x, y, c in ((10, 3, '#8a7a5a'), (11, 4, '#8a7a5a'), (4, 10, dk(C, .5)), (5, 11, dk(C, .5)), (9, 9, lt(C, .3)), (13, 12, None)):
            if c: p.px(x, y, c)
        p.p[2][12] = None; p.p[13][3] = None; p.px(13, 7, '#c8b890'); p.px(13, 8, '#c8b890')
    else:
        for x in range(4, 12): p.px(x, 3, '#e8c040'); p.px(x, 12, '#e8c040')
    return p
for k, (C, e) in {'atlas': ('#2f7a5a', '#7ab0e0'), 'first': ('#a02a2a', '#e8c040'), 'herbal': ('#4a7a2a', '#a0d060'), 'hymnal': ('#2a2a3a', '#e8c040'),
                  'ledger': ('#6a4a2a', '#c8a070'), 'novel': ('#2a4a8a', '#e8e0c8'), 'paper': ('#e07a2a', '#f8f0d0')}.items():
    add('bk_'+k, book(C, e, True)); add('br_'+k, book(C, e, False))
add('bs_kit', P(["", "", "", "...kkkkkkkkkk", "..kNNNNNNNNNNk", "..kNkkkkkkkkNk", "..kkSSkWWkTTkk", "..kNkSkkWkkTkk", "..kNNNNNNNNNNk", "..kNNNnnnNNNNk", "..kNNNNNNNNNNk", "...kkkkkkkkkk"], {'N': '#8a5a34', 'n': '#c8a040', 'S': '#c8ccd6', 'W': '#e8e0c8', 'T': '#d8c890'}))
add('bs_glue', P(["", "........kk", ".......kNk", ".......kNk", "......kNk", "....kkkkkkk", "...kWWWWWWWk", "...kGGGGGGGk", "...kWWWWWWWk", "...kWLLLLLWk", "...kWLWWWLWk", "...kWLLLLLWk", "...kWWWWWWWk", "....kkkkkkk"], {'N': '#a08050', 'W': '#e8e0d0', 'G': '#f0ecdc', 'L': '#8a5a34'}))
add('bs_thread', P(["", "", "....kkkkkkk", "...kNNNNNNNk", "....kkkkkkk", ".....kTtTk", ".....kTtTk", ".....kTtTk", ".....kTtTk", ".....kTtTk", "....kkkkkkk", "...kNNNNNNNk", "....kkkkkkk", ".......kTk", "........kTk", ".........k"], {'N': '#a07a50', 'T': '#e8e0c8', 't': '#c8bc9c'}))
add('bs_cloth', P(["", "", "", "..kkkkkkkkkkk", ".kCCCCCCCCCCCk", ".kCcCcCcCcCcCk", ".kkkkkkkkkkkkk", ".kCCCCCCCCCCCk", ".kcCcCcCcCcCck", ".kkkkkkkkkkkkk", ".kCCCCCCCCCCCk", ".kCcCcCcCcCcCk", "..kkkkkkkkkkk"], {'C': '#3a6aa0', 'c': '#2a4a7a'}))
add('bs_leather', P(["", "", "...kk.....kk", "..kLLkkkkkLLk", "...kLLLLLLLk", "..kLLlLLLLLLk", ".kLLLLLLlLLLLk", ".kLLlLLLLLLLk", "..kLLLLLlLLLk", "..kLLLLLLLLk", ".kLLLlLLLLLLk", "..kLLLLLLLk", "..kLk.kkkLLk", "..kk.....kk"], {'L': '#b0703a', 'l': '#8a5024'}))

# ---------------------------------------------------------------- jars and honey
JAR = T(["", "....kkkkkkk", "...kLLLLLLLk", "....kkkkkkk", "...kGGGGGGGk", "..kGWHHHHHHGk", "..kGWHHHHHHGk", "..kGHAAAAAHGk", "..kGHAaaaAHGk", "..kGHAAAAAHGk", "..kGHHHHHHHGk", "..kGhhhhhhhGk", "...kGGGGGGGk", "....kkkkkkk"])
def honey(H, A='#ece2c4', L='#c8a040'): return Pic().put(JAR, {'L': L, 'G': '#c8e0e8', 'W': '#ffffff', 'H': H, 'h': dk(H, .8), 'A': A, 'a': dk(A, .6)})
for k, h in {'clover': '#f0c050', 'lav': '#d8b060', 'moon': '#c8d8f0', 'rose': '#e8a070', 'sun': '#f8c020', 'wild': '#d89030'}.items(): add('honey_'+k, honey(h))
add('jar_honey', honey('#e8f0f4', '#e8f0f4'))
def bjar(top, h):
    rows = ["", "....kkkkkkk", "...kLkLkLkLk", "....kkkkkkk"] + ["...kGWGGGGGk"]*h + ["...kGGGGGGGk", "....kkkkkkk"]
    rows = [""]*(top) + rows
    return P(rows, {'L': '#8a6a40', 'G': '#c8e0e8', 'W': '#ffffff'})
add('jar_s', bjar(6, 3)); add('jar_m', bjar(4, 5)); add('jar_l', bjar(1, 9))
fly = bjar(1, 9)
for x, y in ((5, 6), (8, 8), (6, 11), (9, 5), (7, 9), (5, 12)): fly.px(x, y, '#f8f080')
add('jar_fly', fly)

# ---------------------------------------------------------------- slime, bottles, drinks
def bottle(L, l, W='#ffffff'):
    return P(["", "......kkkk", "......kNNk", ".......kGk", ".......kGk", "......kGGGk", ".....kGGGGGk", "....kGWLLLLGk", "....kGWLLLLGk", "....kGLLlLLGk", "....kGLLLlLGk", "....kGLLLLLGk", "....kGlLLLlGk", ".....kGGGGGk", "......kkkkk"], {'N': '#a8885a', 'G': '#c8e0e8', 'L': L, 'l': l, 'W': W})
add('bottle', bottle('#c8e0e8', '#a8c8d0'))
for k, c in {'blue': '#3a7ad8', 'green': '#5ac040', 'purple': '#9a4ad0', 'red': '#d8302a'}.items(): add('slime_'+k, bottle(c, lt(c, .4)))
PINT = T(["", "...kkkkkkkk", "...kFFFFFFk", "..kFFfFFFfFk", "..kAAAAAAAAk", "..kAWAAAAAAk", "..kAWAAAAAAk", "...kAWAAAAk", "...kAAAAAAk", "...kAAAAAAk", "...kAWAAAAk", "...kAAAAAAk", "...kAAAAAAk", "...kWWWWWWk", "...kkkkkkkk"])
add('d_ale', Pic().put(PINT, {'F': '#f4efe4', 'f': '#d8d0bc', 'A': '#d8901a', 'W': '#f2c86e'}))
add('d_stout', Pic().put(PINT, {'F': '#e8dcc0', 'f': '#c8b890', 'A': '#2a1a14', 'W': '#5a3a2a'}))
add('d_cola', Pic().put(T(["", "....kkkkkk", "...kGGGGGGk", "...kGCCCCGk", "...kGCcCCGk", "...kGCCCCGk", "....kGCCGk", "....kGCcGk", "....kGCCGk", ".....kGGk", ".....kGGk", ".....kGGk", "....kGGGGk", "...kkkkkkkk"]), {'G': '#c8e0e8', 'C': '#4a2a1a', 'c': '#f0e0d0'}))

# ---------------------------------------------------------------- pet food
add('g_catfood', P(["", "", "....kkkkkkkk", "...kSSSSSSSSk", "...kkSSSSSSkk", "...kRRRRRRRRk", "...kRkRRRRkRk", "...kRWkkkkWRk", "...kRWkWWkWRk", "...kRWWWWWWRk", "...kRRWWWWRRk", "...kRYYYYYYRk", "...kSSSSSSSSk", "....kkkkkkkk"], {'S': '#c8ccd6', 'R': '#3a7ad8', 'W': '#f4efe4', 'Y': '#f2c62e'}))
add('g_fishfood', P(["", "", "...kkkkkkkkkk", "...kRRRRRRRRk", "...kkkkkkkkkk", "...kWWWWWWWWk", "...kWWOOOWWWk", "...kWOOOOOkWk", "...kWWOOOWWWk", "...kWWWWWWWWk", "...kBBBBBBBBk", "...kWWWWWWWWk", "...kWWWWWWWWk", "....kkkkkkkk"], {'R': '#c83228', 'W': '#ece8de', 'O': '#f08a24', 'B': '#3268b0'}))

# ---------------------------------------------------------------- tools, gear and wearables
add('rod', P(["...............k", "..............kN", ".............kNk", "............kNk.", "...........kNk.L", "..........kNk..L", ".........kNk...L", "........kNk....L", ".......kNk.....L", "......kGk......L", ".....kGkk....kHk", "....kGkRk......k", "...kGk.kk", "..kGk", ".kGk", ".kk"], {'N': '#a07a50', 'G': '#3a2a1a', 'R': '#a8adb8', 'L': '#e8e8e8', 'H': '#c8ccd6'}))
add('rod_carbon', P(["...............k", "..............kN", ".............kNk", "............kNk.", "...........kNk.L", "..........kNk..L", ".........kNk...L", "........kNk....L", ".......kNk.....L", "......kGk......L", ".....kGkk....kHk", "....kGkRk......k", "...kGk.kk", "..kGk", ".kGk", ".kk"], {'N': '#2a2a30', 'G': '#c83228', 'R': '#a8adb8', 'L': '#e8e8e8', 'H': '#c8ccd6'}))
add('rod_surf', P(["...............k", "..............kN", ".............kNk", "............kNk.", "...........kNk.L", "..........kNk..L", ".........kNk...L", "........kNk....L", ".......kNk.....L", "......kGk......L", ".....kGkk....kHk", "....kGkRk......k", "...kGk.kk", "..kGk", ".kGk", ".kk"], {'N': '#e8e8e0', 'G': '#3268b0', 'R': '#a8adb8', 'L': '#e8e8e8', 'H': '#c8ccd6'}))
def reel(C, c):
    return P(["", "", "", "....kkkkkk", "...kCCCCCCk", "..kCcccccCCk", "..kCcLLLLcCkkkk", "..kCcLkkLcCkHHk", "..kCcLLLLcCkkkk", "..kCcccccCCk", "...kCCCCCCk", "....kkkkkk", ".....kSSk", "...kkSSSSkk", "...kkkkkkkk"], {'C': C, 'c': c, 'L': '#e8e8e8', 'H': '#2a2a2a', 'S': '#8a8e96'})
add('reel_fast', reel('#c8ccd6', '#8a8e96')); add('reel_pro', reel('#e8c040', '#a0801a'))
add('lure_spoon', P(["", "", "......kk", ".....kSSk", "....kSWSSk", "....kSWSSk", "....kSSSRk", "....kSSRRk", ".....kSRk", "......kk", "......kHk", ".....kHkH", ".....kHk", "......kk"], {'S': '#c8ccd6', 'W': '#ffffff', 'R': '#d8302a', 'H': '#8a8e96'}))
add('lure_worm', P(["", "", "", "....kkk", "...kPPPk", "..kPPkPPk", "..kPk.kPPk", "..kPk..kPPk", "...k...kPPk", "........kPk", "....kk..kPk", "...kPPkkPPk", "...kPPPPPk", "....kkkkk"], {'P': '#c84aa0'}))
add('bait', P(["", "", "", "...kkkkkkkkkk", "..kCCCCCCCCCCk", "..kCkkkkkkkkCk", "..kkPPkkPPPkkk", "..kCPkPPkkPkCk", "..kCkPPkkPPkCk", "..kCCkkPPkkCCk", "..kCCCCCCCCCCk", "...kkkkkkkkkk"], {'C': '#8a6a40', 'P': '#d87a8a'}))
add('bait_cut', P(["", "", "", "", "....kkkkkkk", "..kkSSSSSSSkk", ".kSSsSSSSsSSSk", ".kRRRRRRRRRRRk", ".kRrRRrRRRrRRk", ".kRRRRRRRRRRRk", "..kkkkkkkkkkk"], {'S': '#8a9aa8', 's': '#5a6a78', 'R': '#d87a7a', 'r': '#b05a5a'}))
add('crabpot', P(["", "", "...kkkkkkkkkk", "..kRkRkRkRkRkk", "..kR.R.R.R.RRk", "..kRkRkRkRkRkk", "..kR.R.R.R.RRk", "..kRkRkRkRkRkk", "..kR.R.R.R.RRk", "..kRkRkRkRkRkk", "..kkkkkkkkkkkk", "", "....kk", "...kFk", "...kk"], {'R': '#d8c040', 'F': '#f08a24'}))
def cooler(top, w, C):
    rows = [""]*top + ["." * (8-w//2) + "k"*(w), "."*(7-w//2) + "k" + "W"*(w) + "k", "."*(7-w//2) + "k"*(w+2), "."*(7-w//2) + "k" + "C"*(w) + "k", "."*(7-w//2) + "k" + "C"*(w//2-1) + "WW" + "C"*(w-w//2-1) + "k", "."*(7-w//2) + "k" + "C"*(w) + "k", "."*(7-w//2) + "k" + "C"*(w) + "k", "."*(7-w//2) + "k"*(w+2)]
    return P(rows, {'W': '#f0f0f0', 'C': C})
add('cooler_s', cooler(6, 8, '#3a7ad8')); add('cooler_m', cooler(5, 10, '#d8302a')); add('cooler_l', cooler(4, 14, '#4a9a4a'))
NET = T([".....kkkkk", "...kkRRRRRkk", "..kRwkwkwkwRk", "..kRkwkwkwkRk", "..kRwkwkwkwRk", "...kRkwkwkRk", "....kRwkwRk", ".....kRRRk", "......kHk", "......kHk", "......kHk", "......kHk", "......kHk", "......kHk", "......kHk", "......kkk"])
add('net', Pic().put(NET, {'R': '#a8adb8', 'w': '#e8e8e8', 'H': '#a07a50'})); add('bnet', Pic().put(NET, {'R': '#3a7a4a', 'w': '#a8c8a8', 'H': '#6a4a2a'}))
add('binoc', P(["", "", "", "", "..kkkk..kkkk", ".kBBBBkkBBBBk", ".kBBBBkSkBBBBk"[:16], ".kBBBBkkBBBBk", ".kBBBBk.kBBBBk", ".kLLLLk.kLLLLk", ".kLWLLk.kLWLLk", ".kLLLLk.kLLLLk", "..kkkk...kkkk"], {'B': '#2a2a30', 'S': '#8a8e96', 'L': '#6a9ad8', 'W': '#ffffff'}))
add('camera', P(["", "", "..kkkk....kkk", ".kSSSSk..kRRk", "kkkkkkkkkkkkkkkk", "kAAAAkkkkkkAAAAk", "kAAAkGGGGGkkAAAk", "kAAkGgLLgGGkAAAk", "kAAkGLLLLgGkAAAk", "kAAkGLLLLgGkAAAk", "kAAkGgLLgGGkAAAk", "kAAAkGGGGGkkAAAk", "kAAAAkkkkkkAAAAk", "kkkkkkkkkkkkkkkk"], {'A': '#3a3f4e', 'S': '#c8ccd6', 'G': '#6a7080', 'g': '#2a2e38', 'L': '#7fb2f0', 'R': '#d8343c'}))
add('putter', P(["...........kk", "..........kGk", ".........kGk", "........kSk", ".......kSk", "......kSk", ".....kSk", "....kSk", "...kSk", "..kSk", ".kSkkkk", "kSSSSSSk", "kkkkkkkk", "", "..........kk", ".........kWWk"], {'G': '#2a2a2a', 'S': '#c8ccd6', 'W': '#f8f8f8'}))
add('gem_wheel', P(["", "", "....kkkkkkk", "...kSSSSSSSk", "..kSsSSSSSsSk", "..kSSSkkkSSSk", "..kSSkAAkkSSk", "..kSSSkkkSSSk", "..kSsSSSSSsSk", "...kSSSSSSSk", "....kkkHkkk", ".....kkHkk", "..kkkWWWWWkkk", "..kWWWWWWWWWk", "..kkkkkkkkkkk"], {'S': '#a8adb8', 's': '#7a7e88', 'A': '#c49cf0', 'H': '#5a5a5a', 'W': '#8a5a34'}))
def sword(B, b, H, gem=None):
    p = P(["............kk", "...........kBk", "..........kBbk", ".........kBbk", "........kBbk", ".......kBbk", "......kBbk", "..kk.kBbk", "..kGkBbk", "...kGbk", "...kHkGk", "..kHk.kGk", ".kHk...kk", "kPk", "kk"], {'B': B, 'b': b, 'G': '#c8a040', 'H': H, 'P': '#c8a040'})
    if gem: p.px(4, 9, gem)
    return p
add('sword', sword('#c8ccd6', '#8a8e96', '#6a4a2a')); add('sword_steel', sword('#e8ecf4', '#9aa0aa', '#2a2a30'))
add('sword_wood', sword('#c89a5a', '#8a6a3a', '#6a4a2a')); add('sword_ench', sword('#a0e8ff', '#5aa8d8', '#4a2a7a', '#d040f0'))
def board(D, d, M):
    return P(["", "", "", "", "", "", ".kkkkkkkkkkkkkk", "kDDDDDDDDDDDDDDk", "kDdMDDdMDDdMDDDk", "kDDDDDDDDDDDDDDk", ".kkkkkkkkkkkkkk", "..kGGk....kGGk", "...kk......kk", "", "..g..g....g..g"], {'D': D, 'd': d, 'M': M, 'G': '#8af0ff', 'g': '#4ab0d0'})
for k, c in {'bone': ('#e8e0cc', '#b8b0a0', '#6a6050'), 'ember': ('#c8401e', '#7a2010', '#f8b040'), 'moss': ('#4a8a3a', '#2a5a24', '#a0d060'),
             'moth': ('#a89878', '#7a6a50', '#e8d8b8'), 'pine': ('#d8a85a', '#a07a3a', '#8a5a24'), 'teal': ('#2a9a9a', '#1a6a6a', '#e8c040')}.items():
    add('board_'+k, board(*c))
add('skateboard', P(["", "", "", "", "", "", ".kkkkkkkkkkkkkk", "kRRRRRRRRRRRRRRk", "kRRRWWRRRRWWRRRk", "kkkkkkkkkkkkkkkk", "..kSk......kSk", ".kWWWk....kWWWk", "..kkk......kkk"], {'R': '#d8302a', 'W': '#f0f0f0', 'S': '#a8adb8'}))
add('bmx', P(["", "", "..........kkk", "...........kSk", "....kkk.....kSk", "....kRkkkkkkRk", ".....kRRRRRRk", ".....kRk..kRk", "..kkkkRk.kRkkkk", ".kAAAkRkkRkAAAk", "kAkkkAkRRkAkkkAk", "kAk.kAkkkkAk.kAk", "kAkkkAk..kAkkkAk", ".kAAAk....kAAAk", "..kkk......kkk"], {'R': '#d8302a', 'A': '#3a3f4e', 'S': '#c8ccd6'}))
add('kart', P(["", "", "", ".......kk", "......kSk", ".....kSSkkk", "..kkkkkkkRRk", ".kRRRRRRRRRRkk", "kRRWRRRRRRRRRRk", "kRRRRRRRRRRRRRk", "kkkkkkkkkkkkkkk", "kAAk......kAAk", "kAAk......kAAk", ".kk........kk"], {'R': '#f0c020', 'W': '#2a2a2a', 'S': '#3a3a3a', 'A': '#2a2a30'}))
add('kite', P([".......kk", "......kRRk", ".....kRRRYk", "....kRRRYYYk", "...kRRRYYYYYk", "..kRRRRkYYYYk", "...kBBBkGGGk", "....kBBkGGk", ".....kBkGk", "......kkk", ".......k", "........k.kk", ".......kkRk", "........k", ".......kRk", "........k"], {'R': '#d8302a', 'Y': '#f2c62e', 'B': '#3a7ad8', 'G': '#4f9a3a'}))
add('balloon', P(["", "....kkkkk", "...kBBBBBk", "..kBWBBBBBk", "..kBWBBBBBk", "..kBBBBBBBk", "..kBBBBBBBk", "...kBBBBBk", "....kBBBk", ".....kBk", "......k", ".....k", "......k", ".....k", "......k", ""], {'B': '#4a3a58', 'W': '#9a8ab0'}))
add('piano', P(['', '', '.kkkkkkkkkkkkkk', '.kBBBBBBBBBBBBk', '.kBbbbbbbbbbbBk', '.kBbBBBBBBBBbBk', '.kBbbbbbbbbbbBk', '.kBBBBBBBBBBBBk', 'kkkkkkkkkkkkkkkk', 'kWkWkWWkWkWkWWkk', 'kWkWkWWkWkWkWWWk', 'kWWWWWWWWWWWWWWk', 'kkkkkkkkkkkkkkkk', '.kBk........kBk', '.kBk........kBk', '.kkk........kkk'], {'B': '#2a2624', 'b': '#4a4440', 'W': '#ece6d6'}))
add('drums', P(['', 'kkkk......kkkk', 'kYYYk....kYYYk', '.kkk.kkkkk.kkk', '..k.kSSSSSk.k', '..k.kRRRRRk.k', 'kkkkkRRRRRkkkk', 'kSSSkkkkkkkSSSk', 'kRRRkSSSSSkRRRk', 'kRRRkSWWWSkRRRk', 'kkkkSWWWWWSkkkk', '.k.kSWWWWWSk.k', '.k.kRSWWWSRk.k', '.k.kRRSSSRRk.k', 'kkk.kkkkkkk.kkk'], {'Y': '#e8c040', 'S': '#d8dae2', 'R': '#c0321e', 'W': '#ece6d6'}))
add('harp', P(['....kkkkkk', '...kGGGGGGkk', '...kGkkkkGGGk', '...kGk.l.kGGGk', '...kGkl.l.kkGGk', '...kGk.l.l..kGk', '...kGkl.l.l.kGk', '...kGk.l.l.l.kGk', '...kGkl.l.l.lkGk', '...kGk.l.l.l.kGk', '...kGkl.l.l.lkGk', '...kGk.l.l.l.kGk', '...kGkkkkkkkkkGk', '..kGGGGGGGGGGGGk', '..kkkkkkkkkkkkkk', ''], {'G': '#d8a83a', 'l': '#f0ead8'}))
add('g_dogfood', P(['', '', '...kkkkkkkkkk', '...kRRRRRRRRk', '..kRRRRRRRRRRk', '..kRWWWWWWWWRk', '..kRWkWWWWkWRk', '..kRWWkkkkWWRk', '..kRWWkBBkWWRk', '..kRWWWkkWWWRk', '..kRRRRRRRRRRk', '..kRYYYYYYYYRk', '..kRRRRRRRRRRk', '..kRRRRRRRRRRk', '..kkkkkkkkkkkk'], {'R': '#3a6ac8', 'W': '#ece6d6', 'B': '#8a5a30', 'Y': '#e8c040'}))
add('photo', P(['', '', '..kkkkkkkkkkkk', '..kWWWWWWWWWWk', '..kWSSSSSSSSWk', '..kWSSSSSYSSWk', '..kWSSSSSSSSWk', '..kWSGGSSSSSWk', '..kWGGGGSGGSWk', '..kWGGGGGGGGWk', '..kWWWWWWWWWWk', '..kWWWWWWWWWWk', '..kWWWWWWWWWWk', '..kkkkkkkkkkkk'], {'W': '#f4f0e6', 'S': '#8ac8f0', 'Y': '#f8e070', 'G': '#4a8a3a'}))
add('guitar', P(["......kkkk", "......kNNk", "......kNNk", ".......kWk", ".......kWk", ".......kWk", ".......kWk", "....kkkkWkkk", "...kTTTkWkTTk", "..kTTTTkWkTTTk", "..kTTTTkkTTTTk", "...kTTkDDkTTk", "..kTTTTkkTTTTk", "..kTTTTTTTTTTk", "...kTTTTTTTTk", "....kkkkkkkk"], {'N': '#4a2a14', 'W': '#8a5a30', 'T': '#d89a4a', 'D': '#2a1a0a'}))
def coat(C, c, L=None):
    return P(["", "...kkk..kkk", "..kCCCkkCCCk", ".kCCCCkkCCCCk", ".kCCCkLLkCCCk", "kCCCCkLLkCCCCk", "kCCkCCkkCCkCCk", "kCkkCCCCCCkkCk", "kCk.kCCWCCk.kCk", "kkk.kCCCCCk.kkk", "....kCCWCCk", "....kCCCCCk", "....kcCCCck", "....kkkkkkk"], {'C': C, 'c': c, 'L': L or lt(C, .3), 'W': '#e8c040'})
add('coat_red', coat('#a8342e', '#7a2420')); add('coat_green', coat('#3a6a40', '#24482a')); add('coat_navy', coat('#2e3c5e', '#1e283e'))
add('cloudcoat', coat('#eef0f6', '#c8ccd8', '#ffffff'))
add('jacket_denim', coat('#4a6aa0', '#34507a', '#7a9ac8')); add('jacket_stud', coat('#2a2a2e', '#1a1a1e', '#c8ccd6'))
add('jeans', P(["", "....kkkkkkkk", "....kJJJJJJk", "....kJjJJjJk", "....kJJJJJJk", "....kJJkkJJk", "....kJJkkJJk", "....kJJkkJJk", "....kJJkkJJk", "....kJJkkJJk", "....kJJkkJJk", "....kJJkkJJk", "....kjjkkjjk", "....kkkkkkkk"], {'J': '#3a5fb8', 'j': '#2a4890'}))
GLS = T(["", "", "", "", "", "kkkkkkkkkkkkkkkk", "kLLLLLkkkkLLLLLk", "kLWLLLk..kLWLLLk", "kLLLLLk..kLLLLLk", ".kLLLk....kLLLk", "..kkk......kkk"])
add('shades', Pic().put(GLS, {'L': '#1e3a2a', 'W': '#4a7a5a'})); add('goggles', Pic().put(GLS, {'L': '#7fb2f0', 'W': '#ffffff'}))
add('nv_goggles', P(["", "", "", "", "..kkkkkkkkkkkk", ".kAAAAAAAAAAAAk", ".kAkkkAAAAkkkAk", "kkkGGGkkkkGGGkkk", "kAkGgGkAAkGgGkAk", "kkkGGGkkkkGGGkkk", ".kAkkkAAAAkkkAk", "..kkkkkkkkkkkk"], {'A': '#2e4a2a', 'G': '#6af04a', 'g': '#d8ffc8'}))
add('headlight', P(["", "", "", "", "....kkkkkkk", "...kSSSSSSSk", "..kSkkkkkkkSk", "..kSkYYYYYkSk", "..kSkYWWYYkSk", "..kSkYYYYYkSk", "..kSkkkkkkkSk", "...kSSSSSSSk", "kkkkkkkkkkkkkkkk", "kBBBBBBBBBBBBBBk", "kkkkkkkkkkkkkkkk"], {'S': '#d8d8d0', 'Y': '#fff2c0', 'W': '#ffffff', 'B': '#3a3a3a'}))
add('scuba', P(["", "....kkk", "...kSSSk", "....kSk", "..kkkkkkk", ".kTTTTTTTk", ".kTWTTTTTk", ".kTWTTTTTk", ".kTTTTTTTk", ".kTTTTTTTk", ".kTTTTTTTk", ".kTTTTTTTk", ".kTTTTTTTk", "..kTTTTTk", "...kkkkk"], {'S': '#8a8e96', 'T': '#e8c020', 'W': '#f8e890'}))
add('bee_veil', P(["", "", "....kkkkkkk", "..kkHHHHHHHkk", ".kHHHHHHHHHHHk", "kkkkkkkkkkkkkkk", ".kWkWkWkWkWkWk", ".kkWkWkWkWkWkk", ".kWkWkWkWkWkWk", ".kkWkWkWkWkWkk", "..kWkWkWkWkWk", "..kkkkkkkkkkk"], {'H': '#e8dcb8', 'W': '#a8a8a0'}))
add('bee_hive', P(["", "...kkkkkkkkkk", "..kRRRRRRRRRRk", "..kkkkkkkkkkkk", "..kWWWWWWWWWWk", "..kwwwwwwwwwwk", "..kWWWWWWWWWWk", "..kwwwwwwwwwwk", "..kWWWWWkkWWWk", "..kWWWWkYkWWWk", "..kwwwwwkkwwwk", "..kWWWWWWWWWWk", "..kkkkkkkkkkkk", "...kk......kk"], {'R': '#a85a3a', 'W': '#f0e8d0', 'w': '#c8bca0', 'Y': '#f2c62e'}))
add('bee_smoker', P(["", "....k.k", ".....k.k", "....kkkk", "...kSSSk", "...kSkSkk", "...kSSSSSk", "...kSsSSSk", "...kSSSSSk", "...kSsSSSkkk", "...kSSSSSkLLk", "...kSsSSSkLLk", "...kSSSSSkLLk", "...kSSSSSkkkk", "....kkkkk"], {'S': '#a8adb8', 's': '#7a7e88', 'L': '#8a5a34'}))
add('bee_wax', P(["", "", "", "", "....kkkkkkk", "...kYWYYYYYk", "..kYYkYYkYYk", "..kYkYYkYYYk", "..kYYkYYkYYk", "..kYkYYkYYYk", "...kYYYYYYk", "....kkkkkkk"], {'Y': '#f0c850', 'W': '#f8e8a0'}))
add('wax_candle', P(["", ".......k", "......kYk", "......kOk", ".......k", ".......k", ".....kkkkk", ".....kWYYk", ".....kWYYk", ".....kYYYk", ".....kYYYk", ".....kYYYk", "...kkkkkkkkk", "...kSSSSSSSk", "....kkkkkkk"], {'Y': '#f0d070', 'W': '#f8ecb0', 'O': '#f08a24', 'S': '#a8adb8'}))
add('cigar', P(["", "", "", "", "", "", "kkkkkkkkkkkkkk", "kAkBBBBRRBBBBBk", "kAkBbBBRRBbBBBk", "kkkkkkkkkkkkkk", "", ".k..k", "..k..k", ".k..k"], {'A': '#e8a040', 'B': '#7a4a2a', 'b': '#5a3420', 'R': '#c83228'}))
add('cigar_blue', P(["", "", "", "", "", "", "kkkkkkkkkkkkkk", "kAkBBBBRRBBBBBk", "kAkBbBBRRBbBBBk", "kkkkkkkkkkkkkk", "", ".k..k", "..k..k", ".k..k"], {'A': '#a0c8f0', 'B': '#4a3424', 'b': '#2a1e16', 'R': '#3268b0'}))
add('pc_home', P(["", "..kkkkkkkkkkk", ".kSSSSSSSSSSSk", ".kSkkkkkkkkkSk", ".kSkGGGGGGGkSk", ".kSkGgGGGGGkSk", ".kSkGGGgGGGkSk", ".kSkkkkkkkkkSk", ".kSSSSSSSSSSSk", "..kkkkSSkkkkk", "....kSSSSk", "..kkkkkkkkkkk", ".kSWSWSWSWSWSk", "..kkkkkkkkkkk"], {'S': '#d8d0b8', 'G': '#2a6a3a', 'g': '#8af07a', 'W': '#a8a090'}))
add('modem', P(["", "", "", "", "", "..kk.....kk", "...kS...Sk", "..kkkkkkkkkkk", ".kSSSSSSSSSSSk", ".kSRSGSGSSSSSk", ".kSSSSSSSSSSSk", "..kkkkkkkkkkk"], {'S': '#d8d0b8', 'R': '#d8302a', 'G': '#6af04a'}))
FRAME = T(["", "kkkkkkkkkkkkkkkk", "kYYYYYYYYYYYYYYk", "kYkkkkkkkkkkkkYk", "kYkLLLLLLLWWLkYk", "kYkLLLLLLWWWLkYk", "kYkLLLLLLLWLLkYk", "kYkLLGGLLLLLLkYk", "kYkLGGGGLLGGLkYk", "kYkGGGGGGGGGGkYk", "kYkGgGGGgGGGGkYk", "kYkkkkkkkkkkkkYk", "kYYYYYYYYYYYYYYk", "kkkkkkkkkkkkkkkk"])
add('painting', Pic().put(FRAME, {'Y': '#d8a52a', 'L': '#9ac8f0', 'W': '#f4efe4', 'G': '#4f9a3a', 'g': '#2f6a24'}))
un = Pic().put(FRAME, {'Y': '#d8a52a', 'L': '#ece6d6', 'W': '#ece6d6', 'G': '#ece6d6', 'g': '#ece6d6'})
for x, y, c in ((4, 9, '#4f9a3a'), (5, 9, '#4f9a3a'), (6, 9, '#4f9a3a'), (5, 8, '#4f9a3a'), (10, 5, '#9ac8f0'), (11, 5, '#9ac8f0'), (10, 4, '#9ac8f0')): un.px(x, y, c)
add('unfinished', un)
def canvas(w, h):
    x0, y0 = (16-w)//2, (16-h)//2
    rows = [""]*y0 + ["."*x0 + "k"*w] + ["."*x0 + "k" + "W"*(w-2) + "k"]*(h-2) + ["."*x0 + "k"*w]
    p = P(rows, {'W': '#f4efe4'})
    for y in range(y0+1, y0+h-1): p.px(x0+w-2, y, '#d8d0bc')
    return p
add('canvas_s', canvas(8, 8)); add('canvas_m', canvas(11, 11)); add('canvas_w', canvas(16, 9)); add('canvas_t', canvas(9, 16))
add('paper', P(["", "", "...kkkkkkkkk", "...kWWWWWWWkk", "...kWWWWWWWWkk", "...kWWWWWWWWWk", "...kWWWWWWWWWk", "...kWWWWWWWWWk", "...kWWWWWWWWWk", "...kWWWWWWWWWk", "...kWWWWWWWWWk", "...kWWWWWWWWWk", "...kWWWWWWWWWk", "...kkkkkkkkkkk"], {'W': '#f4efe4'}))
add('bird_feather', P(["............kk", "...........kFk", "..........kFFk", ".........kFfFk", "........kFfFFk", ".......kFfFFk", "......kFfFFk", ".....kFfFFk", "....kFfFFk", "...kFfFFk", "...kfFFk", "..kfkkk", ".kQk", "kQk", "kk"], {'F': '#4a7ac8', 'f': '#2a4a8a', 'Q': '#e8e0c8'}))
add('quill_pen', P(["............kk", "...........kFk", "..........kFFk", ".........kFfFk", "........kFfFFk", ".......kFfFFk", "......kFfFFk", ".....kFfFFk", "....kFfFFk", "...kFfFFk", "...kfFFk", "..kfkkk", ".kQk", "kNk", "kk"], {'F': '#f0ece0', 'f': '#b8b0a0', 'Q': '#e8e0c8', 'N': '#1a1a3a'}))
add('spray_gold', P(["", "......kk", ".....kWk", "....kkkkk", "...kAAAAAk", "...kGGGGGk", "...kGWGGGk", "...kGWGGGk", "...kGGGGGk", "...kGGGGGk", "...kGGGGGk", "...kGGGGGk", "...kGGGGGk", "...kAAAAAk", "....kkkkk"], {'A': '#a8adb8', 'G': '#e8c040', 'W': '#f8ec90'}))
add('spray_silver', P(["", "......kk", ".....kWk", "....kkkkk", "...kAAAAAk", "...kGGGGGk", "...kGWGGGk", "...kGWGGGk", "...kGGGGGk", "...kGGGGGk", "...kGGGGGk", "...kGGGGGk", "...kGGGGGk", "...kAAAAAk", "....kkkkk"], {'A': '#7a7e88', 'G': '#c8ccd6', 'W': '#ffffff'}))
add('pot', P(["", "", "", "", "", "", "..kkkkkkkkkkkk", "..kCCCCCCCCCCk", "..kkkkkkkkkkkk", "...kCCCCCCCCk", "...kCcCCCCcCk", "...kCCCCCCCCk", "....kCCCCCCk", "....kCCCCCCk", "....kkkkkkkk"], {'C': '#b8603a', 'c': '#7a3a20'}))
add('dirt', P(["", "", "", "....kk.kk", "...kNkkkNk", "...kkNNNkk", "..kNNNNNNNk", ".kNNNNNNNNNk", ".kNNNnNNNNNk", ".kNNNNNNnNNk", ".kNnNNNNNNNk", ".kNNNNnNNNNk", ".kNNNNNNNNNk", "..kkkkkkkkk"], {'N': '#c8a070', 'n': '#5a3a20'}))
add('water', P(["", "......kkk", ".....kSSk", "....kkkkkk", "...kGGGGGGk", "..kGGGGGGGGkkk", "..kGWGGGGGGkGk", "..kBBBBBBBBkGk", "..kBWBBBBBBkGk", "..kBWBBBBBBkk", "..kBBBBBBBBk", "..kBBBBBBBBk", "..kBBBBBBBBk", "...kkkkkkkk"], {'S': '#3268b0', 'G': '#d8e8f0', 'W': '#ffffff', 'B': '#7fb2f0'}))
POTPLANT = ["..kkkkkkkkkkkk", "..kCCCCCCCCCCk", "...kCcCCCCcCk", "...kCCCCCCCCk", "....kkkkkkkk"]
add('cactus', P(["", "", "", ".......kk", "......kGGk", "...kk.kGGk", "..kGGkkGGk.kk", "..kGGkkGgkkGGk", "...kGGGGGGGGk", ".....kGgGk", ".....kGGGk"] + POTPLANT, {'G': '#5aa040', 'g': '#2f6a24', 'C': '#b8603a', 'c': '#7a3a20'}))
add('cactus_eye', P([".......kk", ".....kGGGGk", ".....kGWWGk", ".....kWBBWk", ".kk..kGWWGk.kk", "kGGk.kGGGGk.kGGk", "kGGk.kGgGGk.kGGk", "kGGkkkGGgGkkkGGk", ".kGGGGGgGGGGGGk", "..kkkkGGGgkkkk"] + POTPLANT, {'G': '#5aa040', 'g': '#2f6a24', 'W': '#f4efe4', 'B': '#1a1a1a', 'C': '#b8603a', 'c': '#7a3a20'}))
add('bonsai', P(["", "...kkkkk..kkk", "..kGGgGGkkGgGk", ".kGgGGGGGkGGGGk", ".kGGGGgGkkkGgk", "..kkkkkkNk.kkk", "......kNk", ".....kNk.kkk", "....kNNkkGGGk", "....kNk..kkk", ".....kNk", "..kkkkkkkkkkkk", "..kCCCCCCCCCCk", "...kCcCCCCcCk", "...kCCCCCCCCk", "....kkkkkkkk"], {'G': '#4f9a3a', 'g': '#2f6a24', 'N': '#6a4020', 'C': '#3a6aa0', 'c': '#24487a'}))
add('chest', P(["", "", "", "...kkkkkkkkkk", "..kWWWWWWWWWWk", ".kWwWWWWWWWWwWk", ".kkkkkkkkkkkkkk", ".kWWWWWkkWWWWWk", ".kWwWWkGGkWWwWk", ".kWWWWWkkWWWWWk", ".kGWWWWWWWWWWGk", ".kWwWWWWWWWWwWk", ".kWWWWWWWWWWWWk", ".kkkkkkkkkkkkkk", "..G.......G"], {'W': '#7a5030', 'w': '#5a3820', 'G': '#c8a040'}))
add('pouch', P(["", "", "", "....kk...kk", "....kNkkkNk", ".....kNNNk", "....kkkkkkk", "...kLLLLLLLk", "..kLLlLLLLLLk", ".kLLLLLLLlLLLk", ".kLLLLLLLLLLLk", ".kLlLLLLLLLLLk", "..kLLLLLLLLlk", "...kkkkkkkkk"], {'L': '#a0683a', 'l': '#7a4a24', 'N': '#d8c890'}))
add('cage', cage(Pic()))
add('feeder', P([".......kk", "......kHk", "....kkkkkkk", "...kRRRRRRRk", "..kRRRRRRRRRk", "..kkkkkkkkkkk", "...kGkSSSkGk", "...kGkSsSkGk", "...kGkSSSkGk", "...kGksSSkGk", "...kGkSSSkGk", "..kkkkkkkkkkk", "..kWWWWWWWWWk", "...kkkkkkkkk"], {'H': '#8a8e96', 'R': '#3a7a4a', 'G': '#c8e0e8', 'S': '#d8b870', 's': '#8a6a3a', 'W': '#8a5a34'}))
add('bseed', P(["", "", "", "", "", "....k.kk.k", "...kSkSSkSk", "..kSsSSsSSSk", ".kSSSsSSSsSSk", ".kSsSSSsSSsSk", "..kkkkkkkkkk"], {'S': '#d8b870', 's': '#8a6a3a'}))

# ---------------------------------------------------------------- the park's finds, the wreck's and the dig's treasure, the fairy ring, the old scrolls (8 Nov 2026)
def recol(src, m):   # another item's drawing in new colours
    q = Pic(); M = {rgb(a): rgb(b) for a, b in m.items()}
    q.p = [[M.get(c, c) if c else None for c in r] for r in ICONS[src].p]; return q
add('fr_russet', recol('fr_apple', {'#d8302a': '#b8823a', '#a01e1a': '#8a5a24', '#f8a090': '#e0c070'}))
add('fr_gage', recol('fr_plum', {'#7a3a8a': '#8ab040', '#5a2a6a': '#5a8a2a', '#c8a0e0': '#d8f0a0'}))
add('fr_quince', recol('fr_pear', {'#c8d050': '#f0d030', '#98a030': '#c0a020', '#f0f0a0': '#fff8c0'}))
add('fr_medlar', P(["", "", "", "", "....kkkkkk", "..kkMMMMMMkk", ".kMWMMMMMMMMk", ".kMWMMMMMMMmk", "kMMMMMMMMMMmmk", "kMMMMMMMMMmmmk", ".kMMMkkkkMmmk", ".kMMkSSSSkmk", "..kkkSkkSkkk", "....kkkkkk"], {'M': '#9a6a3a', 'm': '#6a4424', 'W': '#c89a6a', 'S': '#4a3018'}))
FL2 = {'hollyhock': ('spike', '#e888b0', '#f8e070'), 'sweetpea': ('violet', '#c890e0', '#f0e0f8')}
for k, v in FL2.items(): add('fl_'+k, flower(*v))
add('sd_hollyhock', packet('#e888b0', '#8a3a5a')); add('sd_sweetpea', packet('#c890e0', '#6a4a8a'))
add('x_burbot', fish('eel', '#6a5a3a', '#c8b890', '#3a3020', '#5a4a30', [(5, 7, '#3a3020'), (8, 8, '#3a3020'), (1, 9, K), (1, 10, K)]))
add('x_smelt', fish('long', '#a8c8b8', '#eef4f0', '#9a6ac8', '#8ab0a0'))
add('x_whitefish', fish('std', '#c8d0d0', '#f4f6f4', '#e0e6e6', '#a8b4b4', [(3, 6, '#8a9696')]))
add('x_oldcat', fish('std', '#3a4048', '#a8a8a0', '#2a3038', '#2a3038', [(0, 9, K), (0, 10, K), (1, 11, K), (0, 6, K), (1, 6, K), (6, 6, '#8a9098'), (9, 7, '#8a9098'), (11, 6, '#8a9098')]))
add('trophy_cat', P(["", ".kkkkkkkkkkkkkk", "kDDDDDDDDDDDDDDk", "kDDDDkkkkDDDDDDk", "kDDkkBBBBkkDkkDk", "kDkWEBBBBBBkkBkk", "kkBBBBBBBBBBBBkk", "kDkbbbbbbbbbkBkk", "kDDkkbbbbbkkDkkk", "kDDDDkkkkkDDDDDk", "kDDDDDDDDDDDDDDk", "kDDDDDGGGGDDDDDk", "kDDDDDDDDDDDDDDk", ".kkkkkkkkkkkkkk"], {'D': '#7a5030', 'B': '#3a4048', 'b': '#a8a8a0', 'W': '#e8e8e0', 'E': '#101010', 'G': '#e8c040'}))
MOTH = T(["", "", "..k.......k", "...k.....k", "....k.k.k", "kkk..kBk..kkk", "kWWkkkBkkkWWk", "kWwWWkBkWWwWk", "kWWwWkBkWwWWk", ".kWWWkBkWWWk", "..kVVkBkVVk", "..kVvkBkvVk", "...kkkBkkk", "......k"])
def moth(W, w, V, v, B):
    return Pic().put(MOTH, {'W': W, 'w': w, 'V': V, 'v': v, 'B': B}, 1, 0)
add('mo_miller', moth('#a89a80', '#7a6a52', '#9a8a70', '#6a5a44', '#6a5a44'))
add('mo_tiger', moth('#d89a48', '#a86a2a', '#c88a3a', '#3a2a1a', '#2a1a10'))
add('mo_underwing', moth('#6a5a4a', '#4a3a2a', '#d8402a', '#1a1410', '#4a3a2a'))
add('mo_clear', moth('#e8e0c8', '#8a6a3a', '#c8a070', '#7a5a2a', '#8a8a3a'))
luna = moth('#b8f0c0', '#70b880', '#a8e8b0', '#e8c060', '#f0f0e0')
for x, y in ((4, 13), (4, 14), (5, 15), (10, 13), (10, 14), (9, 15)): luna.px(x, y, '#a8e8b0')
add('mo_luna', luna)
add('gold_nugget', pebble('#f0c030', '#b08010', '#fff0a0'))
add('gold_flake', P(["", "", "", "...kk", "..kGWk......kk", "...kGk.....kGGk", "....k..kk...kk", "......kWGk", ".......kk..kk", "...kk.....kGWk", "..kGGk.....kk", "...kk...kk", "........kGk", ".........k"], {'G': '#f0c030', 'W': '#fff0a0'}))
COIN = ["", "", "", "....kkkkkk", "...kYYYYYYk", "..kYyYYYYyYk", "..kYYyyyyYYk", "..kYYYYYYYYk", "..kyYYYYYYyk", "...kyyyyyyk", "....kkkkkk"]
add('doubloon', P(COIN[:3] + ["....kkkkkk", "...kYWYYYYk", "..kYYYYYYYYk", "..kyYYYYYYyk", "...kkkkkkkk", "..kYWYYYYYYk", ".kYYYYYYYYYYk", ".kyYYYYYYYYyk", "..kkkkkkkkkk", "..kYYYYYYYYk", "..kyyyyyyyyk", "...kkkkkkkk"], {'Y': '#e8b830', 'y': '#a87818', 'W': '#fff0a0'}))
add('va_coin', P(["", "", "....kkkkkk", "..kkYYYYYYkk", ".kYYyYYYYyYYk", ".kYyYYkkkYYyk", "kYYyYkWWkYYyYk", "kYYYYkWkkYYYYk", "kYYyYkWWWkYyYk", "kYYyYYkkkYYyYk", ".kYyYkkkkYYyk", ".kYYyYYYYyYYk", "..kkYYYYYYkk", "....kkkkkk"], {'Y': '#e8c040', 'y': '#b08a20', 'W': '#fff0a0'}))
add('ring_belly', P(["", "", "", "......kkk", ".....kGgGk", "....kkkkkkk", "...kGGkkkGGk", "..kGgk...kGgk", "..kGk.....kGk", "..kGk.....kgk", "..kgGk...kggk", "...kgGkkkggk", "....kkgggkk", "......kkk"], {'G': '#c8a040', 'g': '#7a6a3a'}))
add('medal_swim', P(["...kkk...kkk", "...kBBk.kRRk", "....kBBkRRk", "....kBBkRRk", ".....kBRRk", ".....kkkkk", "....kkYYkk", "...kYYYYYYk", "..kYWYYYYYyk", "..kYYYkkYYyk", "..kYYkBBkYyk", "..kYYYkkYYyk", "..kyYYYYYyyk", "...kyyyyyyk", "....kkkkkk"], {'B': '#3a6ad8', 'R': '#f0f0f0', 'Y': '#e8c040', 'y': '#a88020', 'W': '#fff0a0'}))
add('bk_captlog', book('#4a3020', '#c8a060', True)); add('logbook_capt', book('#4a3020', '#c8a060', False))
def scroll(R):
    return P(["", "", "", "..kkk", ".kPPPkkkkkkkkk", ".kPpPPPPPPPPPPk", ".kPPPLLLLLLLPPk", ".kPpPPPPPPPPPPk", ".kPPPLLLLLPPPPk", ".kPpPPRRPPPPPPk", ".kPPPkRRkkkkkk", "..kkk.kRk", ".......kRk", "........k"], {'P': '#ece2c4', 'p': '#c8b890', 'L': '#8a7a5a', 'R': R})
add('scroll_deep', scroll('#2a8a9a')); add('scroll_glow', scroll('#e8c040')); add('scroll_iron', scroll('#6a6e78')); add('rf_scroll', scroll('#5a3a8a'))
add('va_chart', P(["", "", "", "kkkkkkkkkkkkkkkk", "kPPPPPPPPPPPPPPk", "kPBBBPPPPPPGPPPk", "kPBBBBPPPPGGGPPk", "kPPBBPPkPPPGPPPk", "kPPPPPkRkPPPPPPk", "kPPPPPPkPPBBBPPk", "kPGGPPPPPBBBBBPk", "kPGGGPPPPPBBBPPk", "kPPPPPPPPPPPPPPk", "kkkkkkkkkkkkkkkk"], {'P': '#e8d8b0', 'B': '#7aa8c8', 'G': '#8aa860', 'R': '#c83228'}))
add('px_deep', bottle('#1a8a9a', '#5ac8d0')); add('px_glow', bottle('#f8d840', '#fff4a0', '#ffffe0')); add('px_iron', bottle('#6a6e78', '#a8adb8'))
add('ap_brine', bottle('#2a5a4a', '#4a8a6a'))
add('ap_salts', P(["", "", "", "", "", "......kk.kk", "....kkSkkSkk", "...kSsSSSsSSk", "..kSSSsSSSSsSk", ".kkkkkkkkkkkkkk", ".kWWWWWWWWWWWWk", "..kWwwwwwwwwWk", "...kWWWWWWWWk", "....kkkkkkkk"], {'S': '#5a9ae8', 's': '#c8e0ff', 'W': '#e8e0d0', 'w': '#b8b0a0'}))
add('ap_root', P(["....kk..kk", "...kLLkkLLk", "....kLLLLk", ".....kGGk", "....kRRRRk", "...kRrRRrRk", "...kRRRRRRk", "...kRRrrRRk", "..kRkRRRRkRk", ".kRk.kRRk.kRk", ".kk..kRRk..kk", "....kRkkRk", "...kRk..kRk", "...kk....kk"], {'L': '#4f9a3a', 'G': '#2f6a24', 'R': '#c8a070', 'r': '#4a3020'}))
add('fy_dust', P(["", ".W.....W", "......kk...W", ".....kSSk", "....kkkkkk", "....kPPPPk", "...kPPWPPPk", "..kPPPPPPPPk", "..kPPPPPWPPk", "..kPWPPPPPPk", "..kpPPPPPPpk", "...kppppppk", "....kkkkkk", "", "W....W....W"], {'P': '#e8b8f0', 'p': '#b088c8', 'S': '#c8a040', 'W': '#fff8c0'}))
add('fy_elfcandle', P(["", "......W", ".....kYk", "....kYOYk", "....kYOYk", ".....kYk", "......k", ".....kCk", "....kCCCk", "....kCcCk", "....kCCCk", "....kCcCk", "...kkCCCkk", "..kGGGGGGGk", "...kkkkkkk"], {'Y': '#f8e070', 'O': '#f08a24', 'W': '#fff8c0', 'C': '#f0e8f8', 'c': '#c8b8e0', 'G': '#7ad8a0'}))
add('fy_lantern', P(["......kk", ".....kHHk", "......kk", "....kkkkkk", "...kMMMMMMk", "....kGGGGk", "...kGYYYYGk", "...kGYWWYGk", "...kGYWWYGk", "...kGYYYYGk", "...kGYYYYGk", "....kGGGGk", "...kMMMMMMk", "....kkkkkk"], {'H': '#8a8e96', 'M': '#6a5aa0', 'G': '#c8e0e8', 'Y': '#a8f0a0', 'W': '#f8fff0'}))
add('fy_starspore', P(["", ".......W", "...W..kWk..W", "......kWk", ".....kkkkk", "...kkSSSSSkk", "..kSSWSSSSSSk", "..kSWSSSsSSSk", ".kSSSSSSSSSsSk", ".kSSSsSSSSSssk", "..kSSSSSSsssk", "..kssSSSsssk", "...kkssssskk", ".....kkkk", "W.........W"], {'S': '#8ac8f8', 's': '#5a88c8', 'W': '#fff8c0'}))
BALL = ["", "", "", "", ".....kkkkk", "...kkBBBBBkk", "..kBWBBdBBBk", "..kBWBBBBdBk", ".kBBBdBBBBBbk", ".kBBBBBdBBbbk", ".kBdBBBBBbbbk", "..kBBBdBbbbk", "...kkbbbbkk", ".....kkkkk"]
add('gb_old', P(BALL, {'B': '#e8e4d8', 'b': '#b8b4a8', 'W': '#ffffff', 'd': '#c8c4b8'}))
add('gb_gutty', P(BALL, {'B': '#5a4a3a', 'b': '#3a2e24', 'W': '#8a7a6a', 'd': '#4a3a2c'}))
add('gb_feathery', P(BALL[:6] + ["..kBWBBsBBBk", "..kBWBBsBBBk", ".kBBBBBsBBBbk", ".kssssssssssk", ".kBBBBBsBBbbk", "..kBBBBsBbbk", "...kkbbsbkk", ".....kkkkk"], {'B': '#c89a5a', 'b': '#8a6a3a', 'W': '#e8c890', 's': '#6a4a2a'}))
def key(M, m):
    return P(["", "", "", "", "..kkkk", ".kMMMMk", "kMk..kMk", "kMk..kMkkkkkkkkk", "kMk..kMMMMMMMMMk", ".kMMMMkmmmmmmkMk", "..kkkk.kkkkkkkMk", "............kMk", "............kk"], {'M': M, 'm': m})
add('orchard_key', key('#6a6e78', '#3a3e48')); add('stack_key', key('#c8a040', '#8a6a20'))
add('crowbar', P(["", "...........kk", "..........kRRk", "...........kRk", "..........kRk", ".........kRk", "........kRk", ".......kRk", "......kRk", ".....kRk", "....kRk", "...kRk", "..kRk", ".kRRk", "kRkk", "kk"], {'R': '#c83228'}))
add('auger', P(["kkkkkkkkkkkkkkk", "kHHHHHHHHHHHHHk", "kkkkkkkSkkkkkkk", "......kSk", "......kSk", "......kSk", ".....kSSSk", ".....kSsSk", "......kSSk", ".....kSsSk", "......kSSk", ".....kSsSk", "......kSSk", ".......kSk", "........k"], {'H': '#d8302a', 'S': '#c8ccd6', 's': '#6a6e78'}))
add('winch', P(["", "", "...........kk", "..........kHk", "..kkkkkkkkkSk", ".kAkRRRRRRkSk", ".kAkrRrRrRkkk", ".kAkRRRRRRkAk", ".kAkrRrRrRkAk", ".kAkRRRRRRkAk", ".kAkkkkkkkkAk", ".kAAAAAAAAAAk", "kkkkkkkkkkkkkk"], {'A': '#4a5a6a', 'R': '#c8a060', 'r': '#8a6a3a', 'S': '#8a8e96', 'H': '#d8302a'}))
add('spyglass', P(["", "", "", "", "............kk", "..........kkGGk", "........kkBBkGk", "......kkBBBBkk", "....kkGGkBBk", "..kkBBBkGGk", "kkBBBBBBkk", "kWBBBBBkk", "kkkBBkk", "...kk"], {'B': '#c8a040', 'G': '#6a4a2a', 'W': '#a8d8f0'}))
add('sword_knight', sword('#e8ecf4', '#9aa0aa', '#3a2a5a', '#d82a3a'))
add('raw_geode', P(["", "", "", "....kkkkk", "..kkRRRRRkk", ".kRRrRRRrRRk", ".kRkkkkkkkRk", "kRkCWCCWCkRrk", "kRkWAAWAACkRk", "kRkCAAAAWCkRk", "kRrkCCWCCkrRk", ".kRRkkkkkkRk", "..kkRRrRRkk", "....kkkkk"], {'R': '#7a6a5a', 'r': '#5a4a3a', 'C': '#c8e8f0', 'W': '#ffffff', 'A': '#8ac8e0'}))
add('cut_grotto', cut('#8ad8e0', '#3a98a8', '#e0ffff'))
add('va_astrolabe', P(["", ".......kk", "......kYYk", ".......kk", "....kkkkkkk", "..kkYYYYYYYkk", ".kYYkkkkkkkYYk", ".kYkYkkYkkYkYk", "kYYkkYkYkYkkYYk", "kYYkkkYYYkkkYYk", "kYYkkYkYkYkkYYk", ".kYkYkkYkkYkYk", ".kYYkkkkkkkYYk", "..kkYYYYYYYkk", "....kkkkkkk"], {'Y': '#d8a83a'}))
add('va_globe', P(["", ".....kkkkk", "...kkBBGBBkk", "..kBGGBBBGGBk", ".kBBGGGBBBBBBk", ".kBBBGBBBGGBBk", ".kBBBBBBGGGBBk", ".kBGBBBBBGBBBk", "..kBGGBBBBBBk", "...kkBBBBBkk", ".....kkkkk", ".......kYk", ".......kYk", ".....kkYYYkk", "....kYYYYYYYk", "....kkkkkkkk"], {'B': '#2a4a8a', 'G': '#e8c040', 'Y': '#a87a3a'}))
add('va_idol', P(["", ".....kkkkk", "....kSSSSSk", "...kSsSSSsSk", "...kSkSSSkSk", "...kSSSsSSSk", "....kSkkkSk", "...kkSSSSSkk", "..kSkSSSSSkSk", "..kSkSsSsSkSk", "...kkSSSSSkk", "....kSSkSSk", "....kSSkSSk", "...kkkkkkkkk", "...kSSSSSSSk", "...kkkkkkkkk"], {'S': '#8a8a7a', 's': '#4a4a40'}))
add('va_lamp', P(["", "", "", "", "............W", "...........kOk", "...........kYk", "....kkkkkkkkk", "..kkCCCCCCCCk", ".kCkkCCkCCCCk", "kCk.kCcCCCCCCk", "kCkkCCCCCCCcCk", ".kkCCCCCCCCck", "...kkcccccckk", ".....kkkkkk"], {'C': '#b8683a', 'c': '#8a4a24', 'O': '#f08a24', 'Y': '#f8e070', 'W': '#fff8c0'}))
add('va_scarab', P(["", "", "...k......k", "....k.kk.k", ".....kBBk", "....kkkkkk", "...kBWBBBBk", "..kBWBBkBBBk", "..kBBBBkBBBk", "kkkBBBBkBBBkkk", "..kBBBBkBBbk", "..kBBBBkBbbk", "kkkkBBBkbbkkkk", "....kkkkkk", "...k......k"], {'B': '#2a5ac8', 'b': '#1a3a8a', 'W': '#8ab0f0'}))
add('va_seal', P(["", "", "......kkkk", ".....kJWJJk", ".....kJJJJk", "......kJJk", "......kJJk", "....kkkkkkkk", "...kJWJJJJJJk", "...kJJJJJJJJk", "...kJJJJJJJjk", "...kJJJJJJjjk", "...kjjjjjjjjk", "...kRRRRRRRRk", "....kkkkkkkk"], {'J': '#4aa878', 'j': '#2a7a54', 'W': '#a8e8c8', 'R': '#c83228'}))
