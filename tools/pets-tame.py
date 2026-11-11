# TAMING's data (owner, 10 Nov 2026: "One skill, three tiers"): writes each kind's `tame` into data/pets.json: d its difficulty (0-100), t its tier (pet: follows you,
# from TAMING 0; fight: fights beside you, from 40; ride: carries you, from 70), f its favourite foods (one in your pack helps), w what it is in the world (a park
# creature's kind, 'bird:<NAME>' a park bird, 's:<tier>' a dungeon slime, 'p' a dungeon spider, 'c:<body>' a dungeon creature), m a ridden one's length in metres.
# A breed without its own takes its base's. Run after tools/pets-bake.py or tools/pets-more.py: python3 tools/pets-tame.py
import json
P,F,R='pet','fight','ride'
T={
 'cat':(10,P,['g_catfood']),'dog':(10,P,['g_dogfood']),'xolo':(15,P,['g_dogfood']),'rabbit':(10,P,['fr_apple']),'hare':(20,P,['fr_apple']),
 'rat':(5,P,['nut_acorn'],['Rat']),'frog':(10,P,['g_fishfood']),'parrot':(15,P,['fr_apple']),'pigeon':(5,P,['bseed']),'crow':(15,P,['bseed'],['Crow']),
 'owl':(30,P,['g_catfood'],['Owl']),'gull':(15,P,['g_catfood']),'duck':(10,P,['bseed'],['Duck']),'chicken':(5,P,['bseed']),'penguin':(25,P,['g_fishfood'],['Penguin']),
 'fox':(30,P,['g_dogfood']),'ibex':(30,P,['fr_apple']),'pig':(15,P,['fr_apple']),'sheep':(15,P,['fr_apple']),'goat':(20,P,['fr_apple']),
 'bee':(20,P,['honey_wild'],['Bee']),'bumblebee':(20,P,['honey_wild'],['Bumblebee']),'firefly':(15,P,['fr_apple'],['Firefly']),'snake':(30,P,['g_catfood']),'bat':(25,P,['fr_fig']),
 'wolf':(45,F,['g_dogfood'],['c:fa:Wolf']),'bear':(55,F,['honey_wild'],['c:fa:Bear']),'lion':(60,F,['g_catfood'],['c:fa:Lion']),'crocodile':(60,F,['g_catfood']),'beelzebufo':(50,F,['g_catfood']),
 'slime':(40,F,['jar_honey']),'trex':(65,F,['g_dogfood'],['c:fa:TRex']),'raptor':(55,F,['g_dogfood'],['c:fa:Raptor']),'compy':(40,F,['g_catfood']),'arthro':(45,F,['fr_apple']),'ptera':(60,F,['g_fishfood']),
 'rdragonling':(60,F,['g_catfood']),'pdragonling':(60,F,['g_catfood']),'cdragonling':(60,F,['g_catfood']),'gdragonling':(60,F,['g_catfood']),'rdragon':(65,F,['g_catfood']),'cdragon':(65,F,['g_catfood']),'hivebug':(55,F,['honey_wild']),
 'giantrat':(40,F,['nut_acorn'],['c:cr:Rat']),'cavefrog':(40,F,['g_fishfood'],['c:cr:Frog']),'radspider':(50,F,['g_catfood'],['p','c:cr:Spider']),'giantwasp':(45,F,['honey_wild'],['c:cr:Wasp']),
 'pitsnake':(50,F,['g_catfood'],['c:cr:Snake']),'cavebat':(45,F,['fr_fig'],['c:cr:Bat']),'greenslime':(40,F,['jar_honey'],['s:green','c:cr:Slime']),'blueslime':(45,F,['jar_honey'],['s:blue']),
 'purpleslime':(55,F,['jar_honey'],['s:purple']),'redslime':(65,F,['jar_honey'],['s:red']),
 'horse':(75,R,['fr_apple'],[],2.85),'donkey':(70,R,['fr_apple'],[],2.2),'mule':(72,R,['fr_apple'],[],2.5),'cow':(72,R,['fr_apple'],[],2.6),'ox':(78,R,['fr_apple'],[],2.8),
 'deer':(80,R,['fr_apple'],['Deer','c:fa:Deer'],1.9),'camel':(80,R,['fr_apple'],[],3.0),'zebra':(85,R,['fr_apple'],[],2.4),'elephant':(90,R,['fr_apple'],[],5.0),'giraffe':(88,R,['fr_apple'],[],4.0),
 'stego':(88,R,['fr_apple'],[],6.0),'trike':(88,R,['fr_apple'],[],6.0),'anky':(88,R,['fr_apple'],[],5.5),'parasaur':(85,R,['fr_apple'],[],6.0),'brachio':(90,R,['fr_apple'],[],12.0),
 # the park's birds (144b) as the pet breeds that show them
 'sparrow':(5,P,['bseed'],['bird:HOUSE SPARROW','bird:BLACK-CAPPED CHICKADEE']),'rockpigeon':(5,P,['bseed'],['bird:ROCK PIGEON']),'starling':(10,P,['bseed'],['bird:EUROPEAN STARLING']),
 'robin':(15,P,['bseed'],['bird:AMERICAN ROBIN']),'mourningdove':(15,P,['bseed'],['bird:MOURNING DOVE']),'bluejay':(25,P,['bseed'],['bird:BLUE JAY']),
 'cardinal':(30,P,['bseed'],['bird:NORTHERN CARDINAL','bird:SCARLET TANAGER']),'mockingbird':(30,P,['bseed'],['bird:NORTHERN MOCKINGBIRD']),'redwing':(30,P,['bseed'],['bird:RED-WINGED BLACKBIRD']),
 'oriole':(35,P,['bseed'],['bird:BALTIMORE ORIOLE']),'redtail':(35,P,['g_catfood'],['bird:RED-TAILED HAWK']),
 'squirrel':(10,P,['nut_acorn'])}
BUGS={'wasp','butterfly','ladybird','beetle','mantis','hopper','ant','antqueen','aphid','spider','tarantula','woodlouse','centipede','skater','caterpillar','worm','slug','snail','hermit','shorecrab','reefcrab'}
J=json.load(open('data/pets.json')); n=0
for K in J['kinds']:
    K.pop('tame',None); e=T.get(K['key'])
    if e is None and K['key'] in BUGS: e=(10,P,['fr_apple'])
    if e is None: continue
    d,t,f,*x=e; o={'d':d,'t':t,'f':f}
    if x and x[0]: o['w']=x[0]
    if len(x)>1: o['m']=x[1]
    K['tame']=o; n+=1
json.dump(J,open('data/pets.json','w'),separators=(',',':')); print('data/pets.json:',n,'kinds with their tame')
