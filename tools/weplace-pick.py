# THE WORLD EDITOR'S PLACE LIST (owner, 7 Nov 2026: "B, yes sort them"): sorts Polyfork's catalog (its sitemap's asset names) into the
# PLACE tab's categories by name, keeps the world-fitting ones, and writes tools/weplace-list.json {category: [asset id, ...]}.
# Run: python3 tools/weplace-pick.py sitemap.xml   (https://polyfork.dev/sitemap.xml)
import sys, re, json
ids=re.findall(r'<loc>https://polyfork\.dev/asset/([^<]+)</loc>',open(sys.argv[1]).read())
SKIP=r'tile|terrain|decal|blob|icon|ui-|-ui|button|row$|panel$|module|section|run$|wall-|-wall|floor|ceiling|roof|stair|ladder|base$|kit$|landing|gantry|catwalk|hull|deposit|ore|egg|coin|gem|crystal|card|cookie|cupcake|banana|tomato|pie$|alien|astronaut|cannon|gun|sword|blade|axe|hammer|polearm|blowgun|spear|bow$|arrow|shield|dragon|skull|coffin|hearse|mimic|loot|treasure|rocket|ship$|shuttle|rover|drone|galleon|aircraft|helicopter|bomber|jet|plane|turboprop|station|space|planet|moon|time|chronos|rune|spell|orb|talisman|amulet|potion|wand|townswoman|townsman|child|gardener|musician|warrior|knight|merchant|explorer|engineer|raider|man$|woman$|girl|boy|people|person|soldier|guard$|pirate|zombie|ghost|witch|wizard|mage|monster|workbench|casino|slot|poker|roulette|craps|blackjack|baccarat|jackpot|hospital|anaesth|iv-drip|crash-cart|operating|patient|incubator|vital|reagent|sample|glove|chemical|glassware|lab-|optics|data-|tablet|keyboard|mouse|monitor|server|cable|office|seminar|pupil|teacher|faculty|boardroom|cupboard|signet|hearth|flint|stable|inflatable|extractor|sunken|hover|holo|mine|track|military|armou?r|torture|ammo|ammunition|weapon|excavator|pillbox|minefield|camouflage|dinosaur|coral|sponge|acropora|scroll|war-|sentry|signal|scale$|rongorongo|briefcase|suitcase|luggage|housekeeping|room-service|desk|toilet|minibus|team-|skate|paddle|snowboard|ski-'
CATS=[
 ('TREES',r'tree|sapling|palm|pine|oak|birch|maple|willow|cypress|cedar|spruce|mesquite|stump'),
 ('PLANTS & FLOWERS',r'shrub|bush|hedge|flower|daisy|rose|tulip|fern|grass-tuft|reed|cattail|ivy|vine|cactus|plant|planter|pot$|potted|succulent|lily|moss|mushroom|toadstool|fungus|thistle|dandelion|sunflower|lavender|bamboo'),
 ('ROCKS',r'rock|boulder|stone$|pebble|cairn|spire|log$|driftwood|fallen'),
 ('BENCHES & SEATS',r'bench|chair|stool|seat|sofa|couch|deckchair|lounger|swing$|hammock'),
 ('TABLES',r'table|desk|counter$|workbench'),
 ('LAMPS & LIGHTS',r'lamp|lantern|light$|torch|sconce|streetlight|lamppost|floodlight|brazier|candle'),
 ('SIGNS',r'sign|signpost|billboard|banner|board$|marquee|placard|poster|flag|neon'),
 ('FENCES & BARRIERS',r'fence|railing|gate$|barrier|bollard|guardrail|cone|barricade|hedge-row|picket|post$'),
 ('STREET THINGS',r'hydrant|mailbox|post-box|newspaper|payphone|phone|meter|trash|bin$|dumpster|bus-shelter|bike-rack|bicycle|scooter|fountain|bird-bath|drinking|clock|kiosk|alarm|extinguisher|vending|atm'),
 ('MARKET & SHOP',r'stall|stand$|cart|crate|barrel|sack|basket|box$|shelf|rack|display|case$|awning|umbrella|parasol|cooler|register|scale$|jukebox|espresso|machine$'),
 ('PARK & GARDEN',r'playground|slide|seesaw|sandbox|gazebo|bandstand|pergola|arbor|trellis|well$|birdhouse|feeder|wheelbarrow|watering|garden|pond|bridge|fire-pit|campfire|picnic|statue|monument|sculpture|obelisk|shrine'),
 ('VEHICLES',r'car$|cab$|taxi|truck|van$|bus$|wagon|pickup|sedan|hatchback|coupe|cruiser|jeep|motorcycle|moped|tractor|boat|rowboat|skiff|canoe|kayak|trailer|camper|food-truck'),
 ('SMALL BUILDINGS',r'shed|hut|shack|booth|cabin|kiosk|tent|outhouse|coop|doghouse|gazebo|woodshed|garage|greenhouse|conservatory|water-tower|silo'),
]
OUT={c:[] for c,_ in CATS}; seen=set(); CAP=45
for i in ids:
    n=re.sub(r'-[0-9a-f]{6}$','',i)
    if re.search(SKIP,n): continue
    for c,rx in CATS:
        if re.search(rx,n):
            if len(OUT[c])<CAP and not any(re.sub(r'-[0-9a-f]{6}$','',x)==n for x in OUT[c]): OUT[c].append(i); seen.add(i)
            break
json.dump(OUT,open('tools/weplace-list.json','w'),indent=0)
for c in OUT: print(c,len(OUT[c]))
print('total',len(seen))
