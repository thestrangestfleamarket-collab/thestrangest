// THE PETS: Polyfork's base animals (data/pets/<kind>.json, tools/pets-bake.py) as a pet that follows you: adopt one at THE PET STORE, its colours, shape and size yours to choose; YOU's PET tab changes its look; other players see it.
import {SHARED, THREE} from './003-shx.js';
import {B64, F32, I16, SKIN} from './003a-skin.js';
import {CITY, CLOCK, FORAGE, INV, LEVELS, LOOKS, NPCS, ONLINE, PETS, pos, ROOMS, SFX, st, UI, VIT, WINDOWS} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {renderer, scene} from './004-main.js';
import {OWNED} from './005-save.js';
import {MAPG, MODS, SKINCULL, SYS, TILE} from './006-map-pre.js';
import {IKIT} from './038zc-ikit.js';
import {MSHOP} from './059i-mshops.js';
import {makeNPC} from './076-npc-map.js';
import {TREES} from './144e-trees.js';
window.PETS=PETS;
{ const IDX=__LAZY__("data/pets.json"), WU=TILE/.84, V3=THREE.Vector3;
  const KD={};
  const PETFILES={cat:__LAZY__("data/pets/cat.json"),dog:__LAZY__("data/pets/dog.json"),xolo:__LAZY__("data/pets/xolo.json"),rabbit:__LAZY__("data/pets/rabbit.json"),hare:__LAZY__("data/pets/hare.json"),rat:__LAZY__("data/pets/rat.json"),frog:__LAZY__("data/pets/frog.json"),parrot:__LAZY__("data/pets/parrot.json"),pigeon:__LAZY__("data/pets/pigeon.json"),crow:__LAZY__("data/pets/crow.json"),owl:__LAZY__("data/pets/owl.json"),gull:__LAZY__("data/pets/gull.json"),duck:__LAZY__("data/pets/duck.json"),chicken:__LAZY__("data/pets/chicken.json"),penguin:__LAZY__("data/pets/penguin.json"),fox:__LAZY__("data/pets/fox.json"),wolf:__LAZY__("data/pets/wolf.json"),bear:__LAZY__("data/pets/bear.json"),deer:__LAZY__("data/pets/deer.json"),ibex:__LAZY__("data/pets/ibex.json"),lion:__LAZY__("data/pets/lion.json"),crocodile:__LAZY__("data/pets/crocodile.json"),beelzebufo:__LAZY__("data/pets/beelzebufo.json"),horse:__LAZY__("data/pets/horse.json"),donkey:__LAZY__("data/pets/donkey.json"),mule:__LAZY__("data/pets/mule.json"),cow:__LAZY__("data/pets/cow.json"),ox:__LAZY__("data/pets/ox.json"),pig:__LAZY__("data/pets/pig.json"),sheep:__LAZY__("data/pets/sheep.json"),goat:__LAZY__("data/pets/goat.json"),elephant:__LAZY__("data/pets/elephant.json"),giraffe:__LAZY__("data/pets/giraffe.json"),zebra:__LAZY__("data/pets/zebra.json"),camel:__LAZY__("data/pets/camel.json"),trex:__LAZY__("data/pets/trex.json"),raptor:__LAZY__("data/pets/raptor.json"),compy:__LAZY__("data/pets/compy.json"),stego:__LAZY__("data/pets/stego.json"),trike:__LAZY__("data/pets/trike.json"),anky:__LAZY__("data/pets/anky.json"),parasaur:__LAZY__("data/pets/parasaur.json"),brachio:__LAZY__("data/pets/brachio.json"),ptera:__LAZY__("data/pets/ptera.json"),arthro:__LAZY__("data/pets/arthro.json"),rdragonling:__LAZY__("data/pets/rdragonling.json"),pdragonling:__LAZY__("data/pets/pdragonling.json"),cdragonling:__LAZY__("data/pets/cdragonling.json"),gdragonling:__LAZY__("data/pets/gdragonling.json"),rdragon:__LAZY__("data/pets/rdragon.json"),cdragon:__LAZY__("data/pets/cdragon.json"),hivebug:__LAZY__("data/pets/hivebug.json"),bee:__LAZY__("data/pets/bee.json"),bumblebee:__LAZY__("data/pets/bumblebee.json"),wasp:__LAZY__("data/pets/wasp.json"),butterfly:__LAZY__("data/pets/butterfly.json"),firefly:__LAZY__("data/pets/firefly.json"),ladybird:__LAZY__("data/pets/ladybird.json"),beetle:__LAZY__("data/pets/beetle.json"),mantis:__LAZY__("data/pets/mantis.json"),hopper:__LAZY__("data/pets/hopper.json"),ant:__LAZY__("data/pets/ant.json"),antqueen:__LAZY__("data/pets/antqueen.json"),aphid:__LAZY__("data/pets/aphid.json"),spider:__LAZY__("data/pets/spider.json"),tarantula:__LAZY__("data/pets/tarantula.json"),woodlouse:__LAZY__("data/pets/woodlouse.json"),centipede:__LAZY__("data/pets/centipede.json"),skater:__LAZY__("data/pets/skater.json"),caterpillar:__LAZY__("data/pets/caterpillar.json"),worm:__LAZY__("data/pets/worm.json"),slug:__LAZY__("data/pets/slug.json"),snail:__LAZY__("data/pets/snail.json"),hermit:__LAZY__("data/pets/hermit.json"),shorecrab:__LAZY__("data/pets/shorecrab.json"),reefcrab:__LAZY__("data/pets/reefcrab.json"),snake:__LAZY__("data/pets/snake.json"),bat:__LAZY__("data/pets/bat.json"),slime:__LAZY__("data/pets/slime.json")};
  const BREEDF={chihuahua:__LAZY__("data/pets/b/chihuahua.json"),pomeranian:__LAZY__("data/pets/b/pomeranian.json"),yorkie:__LAZY__("data/pets/b/yorkie.json"),maltese:__LAZY__("data/pets/b/maltese.json"),shihtzu:__LAZY__("data/pets/b/shihtzu.json"),pug:__LAZY__("data/pets/b/pug.json"),papillon:__LAZY__("data/pets/b/papillon.json"),pekingese:__LAZY__("data/pets/b/pekingese.json"),minpin:__LAZY__("data/pets/b/minpin.json"),italiangrey:__LAZY__("data/pets/b/italiangrey.json"),cavalier:__LAZY__("data/pets/b/cavalier.json"),havanese:__LAZY__("data/pets/b/havanese.json"),bichon:__LAZY__("data/pets/b/bichon.json"),toypoodle:__LAZY__("data/pets/b/toypoodle.json"),japchin:__LAZY__("data/pets/b/japchin.json"),brusselsgriffon:__LAZY__("data/pets/b/brusselsgriffon.json"),chinesecrested:__LAZY__("data/pets/b/chinesecrested.json"),jackrussell:__LAZY__("data/pets/b/jackrussell.json"),westie:__LAZY__("data/pets/b/westie.json"),scottie:__LAZY__("data/pets/b/scottie.json"),cairn:__LAZY__("data/pets/b/cairn.json"),airedale:__LAZY__("data/pets/b/airedale.json"),bullterrier:__LAZY__("data/pets/b/bullterrier.json"),staffy:__LAZY__("data/pets/b/staffy.json"),pitbull:__LAZY__("data/pets/b/pitbull.json"),amstaff:__LAZY__("data/pets/b/amstaff.json"),bostonterrier:__LAZY__("data/pets/b/bostonterrier.json"),foxterrier:__LAZY__("data/pets/b/foxterrier.json"),bedlington:__LAZY__("data/pets/b/bedlington.json"),schnauzer:__LAZY__("data/pets/b/schnauzer.json"),giantschnauzer:__LAZY__("data/pets/b/giantschnauzer.json"),dandie:__LAZY__("data/pets/b/dandie.json"),borderterrier:__LAZY__("data/pets/b/borderterrier.json"),ratterrier:__LAZY__("data/pets/b/ratterrier.json"),kerryblue:__LAZY__("data/pets/b/kerryblue.json"),skye:__LAZY__("data/pets/b/skye.json"),beagle:__LAZY__("data/pets/b/beagle.json"),basset:__LAZY__("data/pets/b/basset.json"),bloodhound:__LAZY__("data/pets/b/bloodhound.json"),dachshund:__LAZY__("data/pets/b/dachshund.json"),longdachshund:__LAZY__("data/pets/b/longdachshund.json"),coonhound:__LAZY__("data/pets/b/coonhound.json"),redbone:__LAZY__("data/pets/b/redbone.json"),foxhound:__LAZY__("data/pets/b/foxhound.json"),harrier:__LAZY__("data/pets/b/harrier.json"),bluetick:__LAZY__("data/pets/b/bluetick.json"),petitbasset:__LAZY__("data/pets/b/petitbasset.json"),greyhound:__LAZY__("data/pets/b/greyhound.json"),whippet:__LAZY__("data/pets/b/whippet.json"),afghan:__LAZY__("data/pets/b/afghan.json"),saluki:__LAZY__("data/pets/b/saluki.json"),borzoi:__LAZY__("data/pets/b/borzoi.json"),irishwolfhound:__LAZY__("data/pets/b/irishwolfhound.json"),deerhound:__LAZY__("data/pets/b/deerhound.json"),basenji:__LAZY__("data/pets/b/basenji.json"),pharaoh:__LAZY__("data/pets/b/pharaoh.json"),ibizan:__LAZY__("data/pets/b/ibizan.json"),rhodesian:__LAZY__("data/pets/b/rhodesian.json"),labrador:__LAZY__("data/pets/b/labrador.json"),golden:__LAZY__("data/pets/b/golden.json"),flatcoat:__LAZY__("data/pets/b/flatcoat.json"),chessie:__LAZY__("data/pets/b/chessie.json"),toller:__LAZY__("data/pets/b/toller.json"),cocker:__LAZY__("data/pets/b/cocker.json"),englishcocker:__LAZY__("data/pets/b/englishcocker.json"),springer:__LAZY__("data/pets/b/springer.json"),brittany:__LAZY__("data/pets/b/brittany.json"),kingcharles:__LAZY__("data/pets/b/kingcharles.json"),waterspaniel:__LAZY__("data/pets/b/waterspaniel.json"),pointer:__LAZY__("data/pets/b/pointer.json"),gsp:__LAZY__("data/pets/b/gsp.json"),weimaraner:__LAZY__("data/pets/b/weimaraner.json"),vizsla:__LAZY__("data/pets/b/vizsla.json"),irishsetter:__LAZY__("data/pets/b/irishsetter.json"),englishsetter:__LAZY__("data/pets/b/englishsetter.json"),gordonsetter:__LAZY__("data/pets/b/gordonsetter.json"),rottweiler:__LAZY__("data/pets/b/rottweiler.json"),doberman:__LAZY__("data/pets/b/doberman.json"),boxer:__LAZY__("data/pets/b/boxer.json"),greatdane:__LAZY__("data/pets/b/greatdane.json"),mastiff:__LAZY__("data/pets/b/mastiff.json"),bullmastiff:__LAZY__("data/pets/b/bullmastiff.json"),neapolitan:__LAZY__("data/pets/b/neapolitan.json"),canecorso:__LAZY__("data/pets/b/canecorso.json"),saintbernard:__LAZY__("data/pets/b/saintbernard.json"),newfoundland:__LAZY__("data/pets/b/newfoundland.json"),bernese:__LAZY__("data/pets/b/bernese.json"),swissmountain:__LAZY__("data/pets/b/swissmountain.json"),greatpyrenees:__LAZY__("data/pets/b/greatpyrenees.json"),akita:__LAZY__("data/pets/b/akita.json"),husky:__LAZY__("data/pets/b/husky.json"),malamute:__LAZY__("data/pets/b/malamute.json"),samoyed:__LAZY__("data/pets/b/samoyed.json"),portuguesewater:__LAZY__("data/pets/b/portuguesewater.json"),dogue:__LAZY__("data/pets/b/dogue.json"),leonberger:__LAZY__("data/pets/b/leonberger.json"),komondor:__LAZY__("data/pets/b/komondor.json"),kuvasz:__LAZY__("data/pets/b/kuvasz.json"),tibetanmastiff:__LAZY__("data/pets/b/tibetanmastiff.json"),collie:__LAZY__("data/pets/b/collie.json"),bordercollie:__LAZY__("data/pets/b/bordercollie.json"),aussie:__LAZY__("data/pets/b/aussie.json"),gsd:__LAZY__("data/pets/b/gsd.json"),malinois:__LAZY__("data/pets/b/malinois.json"),sheltie:__LAZY__("data/pets/b/sheltie.json"),corgi:__LAZY__("data/pets/b/corgi.json"),cardigan:__LAZY__("data/pets/b/cardigan.json"),oldenglish:__LAZY__("data/pets/b/oldenglish.json"),cattledog:__LAZY__("data/pets/b/cattledog.json"),puli:__LAZY__("data/pets/b/puli.json"),beardedcollie:__LAZY__("data/pets/b/beardedcollie.json"),belgiantervuren:__LAZY__("data/pets/b/belgiantervuren.json"),belgiansheepdog:__LAZY__("data/pets/b/belgiansheepdog.json"),briard:__LAZY__("data/pets/b/briard.json"),bulldog:__LAZY__("data/pets/b/bulldog.json"),frenchie:__LAZY__("data/pets/b/frenchie.json"),dalmatian:__LAZY__("data/pets/b/dalmatian.json"),poodle:__LAZY__("data/pets/b/poodle.json"),minipoodle:__LAZY__("data/pets/b/minipoodle.json"),chowchow:__LAZY__("data/pets/b/chowchow.json"),sharpei:__LAZY__("data/pets/b/sharpei.json"),shiba:__LAZY__("data/pets/b/shiba.json"),keeshond:__LAZY__("data/pets/b/keeshond.json"),lhasa:__LAZY__("data/pets/b/lhasa.json"),schipperke:__LAZY__("data/pets/b/schipperke.json"),xoloitzcuintli:__LAZY__("data/pets/b/xoloitzcuintli.json"),lowchen:__LAZY__("data/pets/b/lowchen.json"),finnishspitz:__LAZY__("data/pets/b/finnishspitz.json"),americaneskimo:__LAZY__("data/pets/b/americaneskimo.json"),norwegianelk:__LAZY__("data/pets/b/norwegianelk.json"),farmdog:__LAZY__("data/pets/b/farmdog.json"),mutt:__LAZY__("data/pets/b/mutt.json"),streetdog:__LAZY__("data/pets/b/streetdog.json"),labradoodle:__LAZY__("data/pets/b/labradoodle.json"),goldendoodle:__LAZY__("data/pets/b/goldendoodle.json"),cockapoo:__LAZY__("data/pets/b/cockapoo.json"),dingo:__LAZY__("data/pets/b/dingo.json"),carolina:__LAZY__("data/pets/b/carolina.json"),czechwolfdog:__LAZY__("data/pets/b/czechwolfdog.json"),saarloos:__LAZY__("data/pets/b/saarloos.json"),domestic:__LAZY__("data/pets/b/domestic.json"),domesticlong:__LAZY__("data/pets/b/domesticlong.json"),tuxedo:__LAZY__("data/pets/b/tuxedo.json"),calico:__LAZY__("data/pets/b/calico.json"),tortoiseshell:__LAZY__("data/pets/b/tortoiseshell.json"),blackcat:__LAZY__("data/pets/b/blackcat.json"),ginger:__LAZY__("data/pets/b/ginger.json"),siamese:__LAZY__("data/pets/b/siamese.json"),oriental:__LAZY__("data/pets/b/oriental.json"),balinese:__LAZY__("data/pets/b/balinese.json"),persian:__LAZY__("data/pets/b/persian.json"),himalayan:__LAZY__("data/pets/b/himalayan.json"),exotic:__LAZY__("data/pets/b/exotic.json"),mainecoon:__LAZY__("data/pets/b/mainecoon.json"),ragdoll:__LAZY__("data/pets/b/ragdoll.json"),birman:__LAZY__("data/pets/b/birman.json"),norwegian:__LAZY__("data/pets/b/norwegian.json"),siberian:__LAZY__("data/pets/b/siberian.json"),britishsh:__LAZY__("data/pets/b/britishsh.json"),britishlh:__LAZY__("data/pets/b/britishlh.json"),scottishfold:__LAZY__("data/pets/b/scottishfold.json"),scottishstraight:__LAZY__("data/pets/b/scottishstraight.json"),americanshorthair:__LAZY__("data/pets/b/americanshorthair.json"),americancurl:__LAZY__("data/pets/b/americancurl.json"),bengal:__LAZY__("data/pets/b/bengal.json"),egyptianmau:__LAZY__("data/pets/b/egyptianmau.json"),ocicat:__LAZY__("data/pets/b/ocicat.json"),savannah:__LAZY__("data/pets/b/savannah.json"),abyssinian:__LAZY__("data/pets/b/abyssinian.json"),somali:__LAZY__("data/pets/b/somali.json"),russianblue:__LAZY__("data/pets/b/russianblue.json"),nebelung:__LAZY__("data/pets/b/nebelung.json"),chartreux:__LAZY__("data/pets/b/chartreux.json"),korat:__LAZY__("data/pets/b/korat.json"),burmese:__LAZY__("data/pets/b/burmese.json"),bombay:__LAZY__("data/pets/b/bombay.json"),tonkinese:__LAZY__("data/pets/b/tonkinese.json"),havanabrown:__LAZY__("data/pets/b/havanabrown.json"),sphynx:__LAZY__("data/pets/b/sphynx.json"),devonrex:__LAZY__("data/pets/b/devonrex.json"),cornishrex:__LAZY__("data/pets/b/cornishrex.json"),selkirkrex:__LAZY__("data/pets/b/selkirkrex.json"),lykoi:__LAZY__("data/pets/b/lykoi.json"),munchkin:__LAZY__("data/pets/b/munchkin.json"),manx:__LAZY__("data/pets/b/manx.json"),japanesebobtail:__LAZY__("data/pets/b/japanesebobtail.json"),americanbobtail:__LAZY__("data/pets/b/americanbobtail.json"),pixiebob:__LAZY__("data/pets/b/pixiebob.json"),turkishvan:__LAZY__("data/pets/b/turkishvan.json"),turkishangora:__LAZY__("data/pets/b/turkishangora.json"),snowshoe:__LAZY__("data/pets/b/snowshoe.json"),ragamuffin:__LAZY__("data/pets/b/ragamuffin.json"),toyger:__LAZY__("data/pets/b/toyger.json"),chausie:__LAZY__("data/pets/b/chausie.json"),singapura:__LAZY__("data/pets/b/singapura.json"),laperm:__LAZY__("data/pets/b/laperm.json"),cymric:__LAZY__("data/pets/b/cymric.json"),khaomanee:__LAZY__("data/pets/b/khaomanee.json"),alleycat:__LAZY__("data/pets/b/alleycat.json"),arabian:__LAZY__("data/pets/b/arabian.json"),thoroughbred:__LAZY__("data/pets/b/thoroughbred.json"),quarterhorse:__LAZY__("data/pets/b/quarterhorse.json"),clydesdale:__LAZY__("data/pets/b/clydesdale.json"),shire:__LAZY__("data/pets/b/shire.json"),percheron:__LAZY__("data/pets/b/percheron.json"),friesian:__LAZY__("data/pets/b/friesian.json"),appaloosa:__LAZY__("data/pets/b/appaloosa.json"),painthorse:__LAZY__("data/pets/b/painthorse.json"),mustang:__LAZY__("data/pets/b/mustang.json"),shetland:__LAZY__("data/pets/b/shetland.json"),minihorse:__LAZY__("data/pets/b/minihorse.json"),falabella:__LAZY__("data/pets/b/falabella.json"),haflinger:__LAZY__("data/pets/b/haflinger.json"),fjord:__LAZY__("data/pets/b/fjord.json"),akhalteke:__LAZY__("data/pets/b/akhalteke.json"),andalusian:__LAZY__("data/pets/b/andalusian.json"),lipizzaner:__LAZY__("data/pets/b/lipizzaner.json"),tennesseewalker:__LAZY__("data/pets/b/tennesseewalker.json"),mustangpinto:__LAZY__("data/pets/b/mustangpinto.json"),minidonkey:__LAZY__("data/pets/b/minidonkey.json"),poitou:__LAZY__("data/pets/b/poitou.json"),mammothjack:__LAZY__("data/pets/b/mammothjack.json"),spottedass:__LAZY__("data/pets/b/spottedass.json"),hollandlop:__LAZY__("data/pets/b/hollandlop.json"),frenchlop:__LAZY__("data/pets/b/frenchlop.json"),englishlop:__LAZY__("data/pets/b/englishlop.json"),netherland:__LAZY__("data/pets/b/netherland.json"),lionhead:__LAZY__("data/pets/b/lionhead.json"),angora:__LAZY__("data/pets/b/angora.json"),rex:__LAZY__("data/pets/b/rex.json"),flemish:__LAZY__("data/pets/b/flemish.json"),dutchrabbit:__LAZY__("data/pets/b/dutchrabbit.json"),himalayanrabbit:__LAZY__("data/pets/b/himalayanrabbit.json"),californian:__LAZY__("data/pets/b/californian.json"),newzealand:__LAZY__("data/pets/b/newzealand.json"),englishspot:__LAZY__("data/pets/b/englishspot.json"),harlequinrabbit:__LAZY__("data/pets/b/harlequinrabbit.json"),jerseywooly:__LAZY__("data/pets/b/jerseywooly.json"),checkered:__LAZY__("data/pets/b/checkered.json"),belgianhare:__LAZY__("data/pets/b/belgianhare.json"),minirex:__LAZY__("data/pets/b/minirex.json"),rhodeisland:__LAZY__("data/pets/b/rhodeisland.json"),leghorn:__LAZY__("data/pets/b/leghorn.json"),australorp:__LAZY__("data/pets/b/australorp.json"),barredrock:__LAZY__("data/pets/b/barredrock.json"),orpington:__LAZY__("data/pets/b/orpington.json"),silkie:__LAZY__("data/pets/b/silkie.json"),sussex:__LAZY__("data/pets/b/sussex.json"),wyandotte:__LAZY__("data/pets/b/wyandotte.json"),brahma:__LAZY__("data/pets/b/brahma.json"),cochin:__LAZY__("data/pets/b/cochin.json"),bantam:__LAZY__("data/pets/b/bantam.json"),marans:__LAZY__("data/pets/b/marans.json"),eastereggers:__LAZY__("data/pets/b/eastereggers.json"),pekin:__LAZY__("data/pets/b/pekin.json"),mallard:__LAZY__("data/pets/b/mallard.json"),callduck:__LAZY__("data/pets/b/callduck.json"),khaki:__LAZY__("data/pets/b/khaki.json"),runner:__LAZY__("data/pets/b/runner.json"),muscovy:__LAZY__("data/pets/b/muscovy.json"),cayuga:__LAZY__("data/pets/b/cayuga.json"),swedishblue:__LAZY__("data/pets/b/swedishblue.json"),rockpigeon:__LAZY__("data/pets/b/rockpigeon.json"),whitedove:__LAZY__("data/pets/b/whitedove.json"),fantail:__LAZY__("data/pets/b/fantail.json"),homer:__LAZY__("data/pets/b/homer.json"),tumbler:__LAZY__("data/pets/b/tumbler.json"),pouter:__LAZY__("data/pets/b/pouter.json"),mourningdove:__LAZY__("data/pets/b/mourningdove.json"),scarletmacaw:__LAZY__("data/pets/b/scarletmacaw.json"),blueandgold:__LAZY__("data/pets/b/blueandgold.json"),greenwing:__LAZY__("data/pets/b/greenwing.json"),hyacinth:__LAZY__("data/pets/b/hyacinth.json"),militarymacaw:__LAZY__("data/pets/b/militarymacaw.json"),africangrey:__LAZY__("data/pets/b/africangrey.json"),cockatoo:__LAZY__("data/pets/b/cockatoo.json"),cockatiel:__LAZY__("data/pets/b/cockatiel.json"),budgie:__LAZY__("data/pets/b/budgie.json"),lovebird:__LAZY__("data/pets/b/lovebird.json"),amazon:__LAZY__("data/pets/b/amazon.json"),eclectus:__LAZY__("data/pets/b/eclectus.json"),sunconure:__LAZY__("data/pets/b/sunconure.json"),quaker:__LAZY__("data/pets/b/quaker.json"),lorikeet:__LAZY__("data/pets/b/lorikeet.json"),holstein:__LAZY__("data/pets/b/holstein.json"),jersey:__LAZY__("data/pets/b/jersey.json"),angus:__LAZY__("data/pets/b/angus.json"),hereford:__LAZY__("data/pets/b/hereford.json"),highland:__LAZY__("data/pets/b/highland.json"),beltedgalloway:__LAZY__("data/pets/b/beltedgalloway.json"),brownswiss:__LAZY__("data/pets/b/brownswiss.json"),longhorn:__LAZY__("data/pets/b/longhorn.json"),dexter:__LAZY__("data/pets/b/dexter.json"),zebu:__LAZY__("data/pets/b/zebu.json"),yorkshire:__LAZY__("data/pets/b/yorkshire.json"),berkshire:__LAZY__("data/pets/b/berkshire.json"),hampshire:__LAZY__("data/pets/b/hampshire.json"),duroc:__LAZY__("data/pets/b/duroc.json"),kunekune:__LAZY__("data/pets/b/kunekune.json"),potbelly:__LAZY__("data/pets/b/potbelly.json"),oldspot:__LAZY__("data/pets/b/oldspot.json"),tamworth:__LAZY__("data/pets/b/tamworth.json"),mangalica:__LAZY__("data/pets/b/mangalica.json"),juliana:__LAZY__("data/pets/b/juliana.json"),merino:__LAZY__("data/pets/b/merino.json"),suffolk:__LAZY__("data/pets/b/suffolk.json"),dorper:__LAZY__("data/pets/b/dorper.json"),jacob:__LAZY__("data/pets/b/jacob.json"),valais:__LAZY__("data/pets/b/valais.json"),shetlandsheep:__LAZY__("data/pets/b/shetlandsheep.json"),lincoln:__LAZY__("data/pets/b/lincoln.json"),babydoll:__LAZY__("data/pets/b/babydoll.json"),nubian:__LAZY__("data/pets/b/nubian.json"),pygmy:__LAZY__("data/pets/b/pygmy.json"),nigerian:__LAZY__("data/pets/b/nigerian.json"),boer:__LAZY__("data/pets/b/boer.json"),alpine:__LAZY__("data/pets/b/alpine.json"),saanen:__LAZY__("data/pets/b/saanen.json"),lamancha:__LAZY__("data/pets/b/lamancha.json"),angoragoat:__LAZY__("data/pets/b/angoragoat.json"),toggenburg:__LAZY__("data/pets/b/toggenburg.json"),oberhasli:__LAZY__("data/pets/b/oberhasli.json"),faintinggoat:__LAZY__("data/pets/b/faintinggoat.json"),robin:__LAZY__("data/pets/b/robin.json"),bluejay:__LAZY__("data/pets/b/bluejay.json"),cardinal:__LAZY__("data/pets/b/cardinal.json"),oriole:__LAZY__("data/pets/b/oriole.json"),starling:__LAZY__("data/pets/b/starling.json"),sparrow:__LAZY__("data/pets/b/sparrow.json"),mockingbird:__LAZY__("data/pets/b/mockingbird.json"),redwing:__LAZY__("data/pets/b/redwing.json"),redtail:__LAZY__("data/pets/b/redtail.json"),heron:__LAZY__("data/pets/b/heron.json"),squirrel:__LAZY__("data/pets/b/squirrel.json"),giantrat:__LAZY__("data/pets/b/giantrat.json"),cavefrog:__LAZY__("data/pets/b/cavefrog.json"),radspider:__LAZY__("data/pets/b/radspider.json"),giantwasp:__LAZY__("data/pets/b/giantwasp.json"),pitsnake:__LAZY__("data/pets/b/pitsnake.json"),cavebat:__LAZY__("data/pets/b/cavebat.json"),greenslime:__LAZY__("data/pets/b/greenslime.json"),blueslime:__LAZY__("data/pets/b/blueslime.json"),redslime:__LAZY__("data/pets/b/redslime.json"),purpleslime:__LAZY__("data/pets/b/purpleslime.json"),gecko:__LAZY__("data/pets/b/gecko.json"),iguana:__LAZY__("data/pets/b/iguana.json"),monitor:__LAZY__("data/pets/b/monitor.json"),chameleon:__LAZY__("data/pets/b/chameleon.json"),beardie:__LAZY__("data/pets/b/beardie.json"),bigliz:__LAZY__("data/pets/b/bigliz.json")};
  const PRICE={pets:30,dogs:30,cats:30,horses:60,rabbits:20,poultry:20,parrots:40,livestock:50,birds:25,bugs:10,shore:10,farm:60,wild:80,zoo:120,dino:150,dragons:200,creatures:40};
  const GN={dogs:'DOG BREEDS',cats:'CAT BREEDS',horses:'HORSE AND DONKEY BREEDS',rabbits:'RABBIT BREEDS',poultry:'CHICKENS, DUCKS AND PIGEONS',parrots:'PARROTS',livestock:'COWS, PIGS, SHEEP AND GOATS',pets:'CATS, DOGS AND SMALL PETS',birds:'BIRDS',wild:'WILD ANIMALS',farm:'FARM ANIMALS',zoo:'ZOO ANIMALS',dino:'DINOSAURS',dragons:'DRAGONS',bugs:'BUGS',shore:'CRABS',creatures:'PARK AND CAVE CREATURES'};
  let I=null; const idx=()=>I?Promise.resolve(I):IDX().then(J=>{ I=J; I.by={}; for(const k of J.kinds)I.by[k.key]=k; return I; });
  const kind=key=>{ if(KD[key])return KD[key]; const K=I&&I.by[key];   // (a breed: its base animal with the breed's own corners, bones and zone map over it)
    return KD[key]=K&&K.of?Promise.all([kind(K.of),BREEDF[key]?BREEDF[key]():Promise.reject(new Error('no breed '+key))]).then(([D,b])=>({...D,key,breed:b,zones0:D.zones,zones:K.zones,size:b.size,tall:b.tall}))
      :PETFILES[key]?PETFILES[key]():Promise.reject(new Error('no pet kind '+key)); };
  const H2=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
  /* ---------- a pet's look: kind, name, a colour a zone, a value a knob (0..100 from least to most), size (50..150), home (1: waits at home) ---------- */
  /* where a flying pet goes with you: fly behind you (landing behind you when you stop) or walk behind you; no more head or shoulder (owner, 10 Nov 2026) */
  const SEATN=['fly','walk'], FLYK=/^(parrot|crow|owl|gull|ptera|bee|bumblebee|wasp|butterfly|firefly)$/, BUGK=/^(bee|bumblebee|wasp|butterfly|firefly)$/;
  const seats=K=>{ const b=K.of||K.key; if(!FLYK.test(b))return []; const L=['fly']; if(!BUGK.test(b))L.push('walk'); return L; };
  const seatOf=(K,P)=>{ const L=seats(K); if(L.includes(P.w))return P.w; return L.length?'fly':''; };
  const code=P=>[P.k,encodeURIComponent(P.n||''),(P.c||[]).map(h=>h.replace('#','')).join('_'),(P.s||[]).join('_'),P.z||100,P.h?1:0,P.w||''].join('|');
  const decode=s=>{ const a=String(s||'').split('|'); if(!a[0])return null; return {k:a[0],n:decodeURIComponent(a[1]||''),c:a[2]?a[2].split('_').map(h=>'#'+h):[],s:a[3]?a[3].split('_').map(Number):[],z:+a[4]||100,h:a[5]==='1',w:SEATN.includes(a[6])?a[6]:''}; };
  const fresh=K=>({k:K.key,n:'',c:K.zones.map(z=>z[1]),s:K.s0?K.s0.slice():K.knobs.map(([,, mn,df,mx])=>Math.round((df-mn)/Math.max(1e-6,mx-mn)*100)),z:100,h:false});
  /* ---------- a pet's body: the base shape with each knob's ends blended in, its bones moved the same, its zones painted ---------- */
  const QS=new THREE.Quaternion(), M4=new THREE.Matrix4(), S1=new V3(1,1,1);
  const shape=(D,P)=>{ const M=D.mesh, n=M.n, Pp=SKIN.dec(M).p.slice(), T=D.rig.t.map(t=>t.slice()), B=D.breed;
    if(B){ if(B.p){ const d=B.dd||(B.dd=new Int8Array(B64(B.p).buffer)); for(let j=0;j<n*3;j++)Pp[j]+=d[j]*B.s; } for(const b in B.t){ const t=B.t[b]; for(let c=0;c<3;c++)T[+b][c]+=t[c]; } }
    D.knobs.forEach((kb,i)=>{ const v=P.s[i]; if(v==null)return; const x=kb.min+(kb.max-kb.min)*v/100, lo=x<kb.def, e=lo?kb.lo:kb.hi; if(!e)return; const w=lo?(kb.def-x)/Math.max(1e-6,kb.def-kb.min):(x-kb.def)/Math.max(1e-6,kb.max-kb.def); if(w<=0)return;
      const d=e.d||(e.d=new Int8Array(B64(e.p).buffer)); for(let j=0;j<n*3;j++)Pp[j]+=d[j]*e.s*w; for(const b in e.t){ const t=e.t[b]; for(let c=0;c<3;c++)T[+b][c]+=t[c]*w; } });
    return {P:Pp,T}; };
  const paint=(D,P,g)=>{ const M=D.mesh, Z=M.zd||(M.zd=B64(M.z)), BZ=D.breed&&D.breed.z?D.breed.zz||(D.breed.zz=B64(D.breed.z)):null, C0=SKIN.dec(M).c, C=g.attributes.color.array, Z0=(D.zones0||D.zones).map(z=>H2(z[1])), Zn=D.zones.map((z,i)=>H2(P.c[i]||z[1]));
    for(let i=0;i<M.n;i++){ const z=Z[i], a=Z0[z], b=Zn[BZ?BZ[i]:z], la=a[0]+a[1]+a[2]+1, lv=(C0[i*3]+C0[i*3+1]+C0[i*3+2]+1)/la; for(let c=0;c<3;c++)C[i*3+c]=Math.max(0,Math.min(255,Math.round(b[c]*lv))); }
    g.attributes.color.needsUpdate=true; };
  const rig=(D,T)=>{ const R=D.rig, bones=R.names.map((nm,i)=>{ const b=new THREE.Bone(); b.name=nm; b.position.fromArray(T[i]); b.quaternion.fromArray(R.q[i]); if(R.s)b.scale.fromArray(R.s[i]); return b; });
    R.parent.forEach((p,i)=>{ if(p>=0)bones[p].add(bones[i]); }); const W=bones.map(()=>new THREE.Matrix4());
    bones.forEach((b,i)=>{ M4.compose(b.position,b.quaternion,b.scale); W[i].copy(R.parent[i]>=0?W[R.parent[i]]:new THREE.Matrix4()).multiply(M4); });
    return {bones,skeleton:new THREE.Skeleton(bones,W.map(m=>m.clone().invert()))}; };
  const clips=(D,T)=>{ const out={}, BN=D.rig.names;
    for(const [name,C] of Object.entries(D.clips)){ const tm=Array.from({length:C.n},(_,k)=>k*C.dur/(C.n-1)), Q=I16(C.q), tr=[];
      BN.forEach((bn,j)=>{ const v=new Float32Array(C.n*4); for(let k=0;k<C.n;k++)for(let c=0;c<4;c++)v[k*4+c]=Q[(k*BN.length+j)*4+c]/32000; tr.push(new THREE.QuaternionKeyframeTrack(bn+'.quaternion',tm,v)); });
      for(const bn in C.p){ const j=BN.indexOf(bn), d=F32(C.p[bn]), v=new Float32Array(d.length); for(let k=0;k<d.length;k++)v[k]=d[k]+T[j][k%3]; tr.push(new THREE.VectorKeyframeTrack(bn+'.position',tm,v)); }
      out[name]=new THREE.AnimationClip(name,C.dur,tr); } return out; };
  // a clip for what it is doing: its own names vary (Walk, Walk_folded_wings, Crawl, Fly, Flying ...)
  const pickClip=(CL,want)=>{ const N=Object.keys(CL), f=re=>N.find(n=>re.test(n));
    if(want==='fly')return f(/^fly|flying|flap|hover/i)||f(/^idle_open_wings/i)||null;
    if(want==='run')return f(/^run(?!.*open)/i)||f(/gallop|trot/i)||f(/^walk(?!.*open)/i)||f(/walk|crawl|hop|jump|swim|fly/i)||N[0];
    if(want==='walk')return f(/^walk(?!.*open)/i)||f(/walk|crawl|hop|jump|run|swim|fly/i)||N[0];
    return f(/^idle(?!.*open)/i)||f(/idle|rest|stand|breath/i)||N[0]; };
  /* ---------- one pet in the world, following someone ---------- */
  const PG=new THREE.Group(); PG.name='pets'; PG.userData.anyRoom=true; scene.add(LEVELS.own(PG,'*')); MAPG.pets=new THREE.Group();   // (makeNPC's group is only a holder: each pet moves into PG, which no room hides (not one of MAPG's, anyRoom), so your pet goes in with you)
  const THEIRS=new Map(); PETS.theirs=THEIRS;
  const groundAt=(x,z,y0)=>{ let g=typeof SHARED.groundY!=='undefined'?SHARED.groundY(x,z):y0; if(!(Math.abs(g-y0)<1.2*WU))g=y0; return g; };
  // your room as a pet sees it (MODS.apts.inside): the free floor for the pathfinder (clear of the walls and furniture), and the tops it can hop onto (a hand's height to a little over head height, room on them)
  let RM=null;
  const roomNow=()=>{ const t=performance.now(); if(RM&&t-RM.t<500)return RM; const I=MODS.apts&&MODS.apts.inside&&MODS.apts.inside(); if(!I)return RM=null; let sig=I.sol.length*7+I.fix.length; for(const r of I.sol)sig+=r[0]*3+r[1]*5+r[2]*7+r[3]*11; for(const f of I.fix)sig+=f[0]*3+f[1]*5+f[5]*13;
    if(RM&&RM.sig===sig&&RM.I.x0===I.x0){ RM.t=t; return RM; } const m=.14*WU, inR=r=>r[2]>I.x0&&r[0]<I.x1&&r[3]>I.z0&&r[1]<I.z1, S=I.sol.filter(inR);
    const free=(x,z)=>x>I.x0+m&&x<I.x1-m&&z>I.z0+m&&z<I.z1-m&&!S.some(r=>x>r[0]-m&&x<r[2]+m&&z>r[1]-m&&z<r[3]+m); free.box=[I.x0,I.z0,I.x1,I.z1]; free.cell=.18*WU;
    const F=I.fix.filter(f=>inR([f[0],f[1],f[3],f[4]])), tops=[];
    for(const f of F){ const h=(f[5]-I.y)/WU; if(h<.18||h>2.4)continue; if(F.some(g=>g!==f&&g[2]>f[5]-.01*WU&&g[2]<f[5]+.35*WU&&g[0]<f[3]&&g[3]>f[0]&&g[1]<f[4]&&g[4]>f[1]))continue; tops.push({x0:f[0],z0:f[1],x1:f[3],z1:f[4],y:f[5],h}); }   // (nothing low over it: not a shelf inside a bookcase)
    return RM={sig,I,free,tops,y:I.y,t}; };
  PETS.room=()=>RM;
  /* winged creatures always flap in the air (owner, 9 Nov 2026): a kind whose only open-winged clip is an idle (the parrots) beats its wings on top of it, each wing about the line across its span and up */
  const wings=(R,FC)=>{ if(!FC||/fly|flap|hover/i.test(FC))return null; const B=R.bones, by=n=>B.find(b=>b.name===n), at=b=>new THREE.Vector3().setFromMatrixPosition(R.skeleton.boneInverses[B.indexOf(b)].clone().invert()), W=[];
    for(const sd of ['Left','Right']){ const s=by(sd+'Wing'), e=by(sd+'WingElbow'), t=by(sd+'WingTip'); if(!s||!t)continue; const ax=at(t).sub(at(s)).cross(new THREE.Vector3(0,1,0)).normalize(); W.push({b:s,ax,a:.75,o:.12,l:0}); if(e)W.push({b:e,ax,a:.45,o:0,l:.9}); }
    if(!W.length)return null; const q=new THREE.Quaternion(), qr=new THREE.Quaternion(), v=new THREE.Vector3(); let ph=Math.random()*6.28, k=0;
    return (dt,on)=>{ k+=((on?1:0)-k)*Math.min(1,dt*5); if(k<.01)return; ph+=dt*6.28*4.2;
      for(const w of W){ q.identity(); for(let b=w.b;b&&b.isBone;b=b.parent)q.premultiply(b.quaternion); v.copy(w.ax).applyQuaternion(q.invert()); w.b.quaternion.multiply(qr.setFromAxisAngle(v,k*(w.o+w.a*Math.sin(ph-w.l)))); } }; };
  const make=async(id,P,lead,o={})=>{ const K=(await idx()).by[P.k]; if(!K)return null; const D=await kind(P.k), {P:Pp,T}=shape(D,P), R=rig(D,T), CL=clips(D,T);
    const geo=SKIN.geom(D.mesh); geo.attributes.position.array.set(Pp); paint(D,P,geo); let m0=1e9; for(let k=1;k<Pp.length;k+=3)if(Pp[k]<m0)m0=Pp[k];   // (makeNPC lifts the drawn body by -m0 off its bones)
    const long=o.long||K.long*P.z/100, big=Math.max(...D.size), metres=D.tall*long/big, FC=pickClip(CL,'fly'), flies=!!FC, onlyFly=!!FC&&pickClip(CL,'walk')===FC;
    const mixer=new THREE.AnimationMixer(R.bones[0]), A={}, act=n=>A[n]||(A[n]=mixer.clipAction(CL[n])); let cur=null, hover=0, lastL=null, idleT=0;
    const seat=flies&&!o.drive&&!o.preview?seatOf(K,P):'', lands=seat==='fly'&&!onlyFly&&pickClip(CL,'idle')!==FC, grounded=!flies||seat==='walk';   // (flying behind you, it lands behind you when you stop: owner, 10 Nov 2026)
    let air=false, down=false, still=0; const WG=wings(R,FC);
    const walkV=Math.max(.5,Math.min(1.6,1.7*metres)), runV=Math.max(1.4,Math.min(4.5,3.6*metres));
    const st0={x:0,z:0}, H={on:false,mode:'idle',t:0,path:null,i:0,hop:null,top:null,y:0,sq:0};
    const N=makeNPC(null,{key:'pet-'+id,name:(P.n||K.name).toUpperCase(),names:['body'],lv:SHARED.LVL||'up',group:'pets',geo,skin:R,tall:D.tall,rank:[0],metres,x:0,z:0,lane:{x0:-1e9,x1:1e9,z0:-1e9,z1:1e9},
      free:()=>true,radius:Math.min(.25,long*.3),speed:walkV/.84,stride:0,rock:0,bob:0,pick:()=>{},noSelf:true,
      ground:(x,z)=>(H.on?H.y:groundAt(x,z,lastL?lastL.y:SHARED.py))+hover*WU,
      brain:(dt,you,st)=>{ if(o.drive){ const Dv=o.drive(N); if(!Dv){ N.g.visible=false; return; } N.g.visible=true; st.x=Dv.x; st.z=Dv.z; st.h=Dv.h; st.to=null; st.face=null; st.hold=true; N.dv=Dv.v||0; N.fly=!!Dv.ghost; N.placed=true; lastL={x:Dv.x,z:Dv.z,y:Dv.y}; return; }   // (ridden: its rider moves it, 146zjc)
        const L=lead(); if(!L){ N.g.visible=false; return; } N.g.visible=true;
        if(grounded&&N.placed&&!(o.room&&o.room())&&(L.me&&UI.fly||SHARED.groundY&&L.y-SHARED.groundY(L.x,L.z)>2*WU)){ st.to=null; st.face={x:L.x,z:L.z}; return; }   // (you fly or go up: one that cannot fly waits on the ground: owner, 9 Nov 2026)
        const v=lastL?Math.hypot(L.x-lastL.x,L.z-lastL.z)/Math.max(dt,1e-3):0; lastL=L;
        const RM=o.room&&o.room(); if(RM){ home(dt,st,RM,L); return; } if(H.on)leave();
        const dx=st.x-L.x, dz=st.z-L.z, d=Math.hypot(dx,dz)/WU;
        if(!N.placed||d>14||Math.abs((N.g.position.y-hover*WU)-L.y)>2.5*WU){ place(L); return; }
        if(o.preview){ if(d>3)place(L); st.to=null; st.face={x:L.x,z:L.z}; return; }
        if(o.stay){ if(!st.to&&(idleT-=dt)<0){ idleT=3+Math.random()*5; const a=Math.random()*6.28, r=Math.random()*1.6*WU; st.to={x:o.stay.x+Math.sin(a)*r,z:o.stay.z+Math.cos(a)*r}; st.v=walkV*WU; } return; }
        const R=o.rec||o.mine&&out(), far=R?(R.lo<25?3.4:R.lo>=80?1.4:1.7):1.7, sp=pace(R);   // (its loyalty keeps it close, a shy one lags; hungry or ill, it is slow)
        if(seat==='fly'){ const b=(far-.6)*WU, sd=(o.side||0)*WU, tx=L.x-Math.sin(L.hd)*b+Math.cos(L.hd)*sd, tz=L.z-Math.cos(L.hd)*b-Math.sin(L.hd)*sd, e=Math.hypot(st.x-tx,st.z-tz)/WU, low=!(L.me&&UI.fly)&&!(SHARED.groundY&&L.y-SHARED.groundY(L.x,L.z)>.3*WU);   // (behind you; still a moment on the ground, it lands there)
          still=v<.3*WU?still+dt:0; if(!lands||still<1||!low)down=false;
          if(down&&e<1.5){ st.to=null; st.face={x:L.x,z:L.z}; return; }
          if(e>.25){ st.to={x:tx,z:tz}; st.v=Math.max(e>2?runV*sp:walkV*sp,v/WU*1.1)*WU; } else { st.to=null; st.face={x:L.x,z:L.z}; if(lands&&still>=1&&low)down=true; } return; }
        if(o.side&&d>far){ const sx=Math.cos(L.hd)*o.side*WU, sz=-Math.sin(L.hd)*o.side*WU, k=(far-.65)/d; st.to={x:L.x+dx*k+sx,z:L.z+dz*k+sz}; st.v=(d>far+1.8?Math.max(runV*sp,v/WU*1.15):walkV*sp)*WU; }
        else if(d>far){ const k=(far-.65)/d; st.to={x:L.x+dx*k,z:L.z+dz*k}; st.v=(d>far+1.8?Math.max(runV*sp,v/WU*1.15):walkV*sp)*WU; } else if(d<far-.4){ st.to=null; st.face={x:L.x,z:L.z}; } },
      anim:(dt,moving,st)=>{ const fast=moving&&st.v>walkV*WU*1.2; air=onlyFly||flies&&H.on&&H.mode==='hop'||!H.on&&seat==='fly'&&!down||flies&&!grounded&&!H.on&&seat!=='fly'&&(moving&&(st.v>walkV*WU*1.2||hover>.05)||lastL&&(lastL.y-groundAt(lastL.x,lastL.z,lastL.y)>.3*WU||SHARED.groundY&&groundAt(st.x,st.z,lastL.y)-SHARED.groundY(st.x,st.z)>.3*WU));
        hover+=((air?(onlyFly?.9:1.3):0)-hover)*Math.min(1,dt*2.5);
        if(o.drive){ const G=o.gait(N.dv/WU), w=pickClip(CL,G.c); if(w!==cur){ act(w).reset().fadeIn(.25).play(); if(cur)act(cur).fadeOut(.25); cur=w; } act(cur).timeScale=G.f?G.f*CL[cur].duration:1; mixer.update(dt); return; }
        const zz=H.on&&H.mode==='sleep', hop=H.on&&H.mode==='hop', want=air&&FC||(hop?pickClip(CL,'run'):moving?pickClip(CL,fast?'run':'walk'):pickClip(CL,'idle'));
        if(want!==cur){ act(want).reset().fadeIn(.2).play(); if(cur)act(cur).fadeOut(.2); cur=want; } act(cur).timeScale=zz?.15:moving&&!air?Math.max(.6,Math.min(1.8,st.v/(fast?runV:walkV)/WU)):1; mixer.update(dt); if(WG)WG(dt,air);
        H.sq+=((zz?1:0)-H.sq)*Math.min(1,dt*2); N.g.scale.set(1+.1*H.sq,1-.4*H.sq,1+.1*H.sq); }});   // (asleep: curled low, breathing slow)
    const gap=(.25+long*.6)*WU, clear=(x,z)=>!(SHARED.solids||[]).some(b=>x>b[0]-gap&&x<b[2]+gap&&z>b[1]-gap&&z<b[3]+gap);   // (room for its whole body)
    const place=L=>{ const st=N.st, r=o.preview?1.6:1.1; let a=L.hd+Math.PI*(o.side?-.8:.8); if(o.preview){ a=L.hd; for(const d of [.5,-.5,.9,-.9,1.3,-1.3,1.8,-1.8,0]){ const x=L.x+Math.sin(L.hd+d)*r*WU, z=L.z+Math.cos(L.hd+d)*r*WU; if(clear(x,z)){ a=L.hd+d; break; } } } st.x=L.x+Math.sin(a)*r*WU; st.z=L.z+Math.cos(a)*r*WU; st.h=o.preview?L.hd+Math.PI:L.hd; st.to=null; N.placed=true; };   // (preview: in front of you, facing you, while you choose it)
    /* at home (owner, 9 Nov 2026: "in your apartment's living room and bedroom, wandering by findPath, jumping or flying up onto things, idling, asleep"): the city's pathfinder over the room's
       free floor, a hop up onto a bed, couch, chair or table top it can reach (a flyer to high things too), a while there, and sleep, more by night */
    const reach=flies?2.4:Math.min(1.1,.45+metres*2), lap=(.12+long*.3)*WU, rnd=(a,b)=>a+Math.random()*(b-a);
    const anyFree=(RM,near)=>{ const I=RM.I; for(let k=0;k<40;k++){ const x=near&&k<20?near.x+rnd(-1.5,1.5)*WU:rnd(I.x0,I.x1), z=near&&k<20?near.z+rnd(-1.5,1.5)*WU:rnd(I.z0,I.z1); if(RM.free(x,z))return {x,z}; } return null; };
    const goTo=(RM,to,then)=>{ const r=CITY.route&&CITY.route('up',{x:N.st.x,z:N.st.z},to,RM.free,true); if(!r||r.pts.length<2)return false; H.path=r.pts; H.i=1; H.then=then; N.st.to=r.pts[1]; N.st.v=walkV*WU*rnd(.6,1); H.mode='walk'; return true; };
    const hopTo=(x,z,y,top)=>{ const st=N.st, up=y>H.y, dh=Math.abs(y-H.y)/WU; H.hop={x0:st.x,z0:st.z,y0:H.y,x1:x,z1:z,y1:y,t:0,d:flies?.8+dh*.5:.4+dh*.35,arc:(flies?.15:.12+dh*.25)*WU,top:up?top:null}; H.mode='hop'; st.to=null; st.face=null; H.path=null; };
    const rest=(RM,on)=>{ const night=CLOCK.h>=21||CLOCK.h<6, zz=fainted(o.rec||o.mine&&out())||Math.random()<(night?.5:.15)*(on?1.6:1); H.mode=zz?'sleep':'idle'; H.t=zz?rnd(25,70)*(night?2:1):rnd(3,9); };
    const home=(dt,st,RM,L)=>{ const I=RM.I;
      if(!H.on){ H.on=true; H.top=H.hop=H.path=null; H.y=RM.y; hover=0; const sp=o.stay&&RM.free(o.stay.x,o.stay.z)?o.stay:RM.free(st.x,st.z)&&N.placed?null:anyFree(RM,L); if(sp){ st.x=sp.x; st.z=sp.z; } N.placed=true; st.to=null; st.face=null; H.mode='idle'; H.t=rnd(1,3); }
      if(H.mode==='hop'){ const h=H.hop, k=Math.min(1,(h.t+=dt)/h.d); st.x=h.x0+(h.x1-h.x0)*k; st.z=h.z0+(h.z1-h.z0)*k; H.y=h.y0+(h.y1-h.y0)*k+h.arc*4*k*(1-k); st.h=Math.atan2(h.x1-h.x0,h.z1-h.z0)||st.h; st.to=null;
        if(k>=1){ H.y=h.y1; H.top=h.top; H.hop=null; rest(RM,!!H.top); } return; }
      if(H.mode==='walk'){ const p=H.path&&H.path[H.i]; if(st.to)return; if(!p||Math.hypot(st.x-p.x,st.z-p.z)>.15*WU){ H.path=null; rest(RM); return; }
        if(H.i<H.path.length-1){ st.to=H.path[++H.i]; return; } H.path=null; const t=H.then; H.then=null; if(t)t(); else rest(RM); return; }
      if(fainted(o.rec||o.mine&&out())){ H.mode='sleep'; return; }
      if((H.t-=dt)>0)return;
      if(H.top){ const T=H.top, a=anyFree(RM,{x:(T.x0+T.x1)/2,z:(T.z0+T.z1)/2}); if(a)hopTo(a.x,a.z,RM.y,null); else H.t=2; return; }
      const r=Math.random(), tops=RM.tops.filter(T=>T.h<=reach&&T.x1-T.x0>lap&&T.z1-T.z0>lap);
      if(r<(flies?.45:.35)&&tops.length){ const T=tops[Math.floor(Math.random()*tops.length)], cx=(T.x0+T.x1)/2, cz=(T.z0+T.z1)/2, ax=Math.max(T.x0-lap,Math.min(T.x1+lap,st.x)), az=Math.max(T.z0-lap,Math.min(T.z1+lap,st.z));
        let at=null; for(const [x,z] of [[ax,az],[T.x0-lap*1.4,cz],[T.x1+lap*1.4,cz],[cx,T.z0-lap*1.4],[cx,T.z1+lap*1.4]])if(RM.free(x,z)){ at={x,z}; break; }
        const on=()=>hopTo(Math.max(T.x0+lap*.6,Math.min(T.x1-lap*.6,st.x+(cx-st.x)*.5)),Math.max(T.z0+lap*.6,Math.min(T.z1-lap*.6,st.z+(cz-st.z)*.5)),T.y,T);
        if(at&&(Math.hypot(at.x-st.x,at.z-st.z)<.2*WU?(on(),true):goTo(RM,at,on)))return; }
      if(r<.8){ const to=anyFree(RM); if(to&&goTo(RM,to))return; }
      rest(RM); };
    const leave=()=>{ H.on=false; H.path=H.hop=H.top=null; H.sq=0; N.g.scale.set(1,1,1); N.st.to=null; N.placed=false; };
    N.atHome=H; N.farMove=()=>{ if(H.on&&!(o.room&&o.room()))leave(); const L=lead(); if(L&&!H.on)place(L); };   // (a pet left far behind, not ticked: back beside its person)
    PG.add(N.g); N.g.rotation.order='YXZ'; N.mixer=mixer; N.pet=P; N.petKind=K; N.restless=()=>air; N.landed=()=>down;   // (in the air its wings never stop: owner, 9 Nov 2026)
    // pet it: a word and a sit, now and then
    const hb=new THREE.Mesh(new THREE.BoxGeometry(long*WU,Math.max(.3,metres)*WU,long*WU),new THREE.MeshBasicMaterial({visible:false})); hb.position.y=metres*WU/2; N.g.add(hb);
    N.th={get quiet(){ if(!o.mine||o.preview)return false; const p=N.g.position, dx=p.x-pos.x, dz=p.z-pos.z, d=Math.hypot(dx,dz); return air||d>1.6*TILE||dx*Math.sin(SHARED.heading)+dz*Math.cos(SHARED.heading)<.5*d; },   // (your own pet: only when you face it, close: owner, 10 Nov 2026)
      name:o.mine?'PET '+(P.n||'YOUR '+K.name).toUpperCase():(o.owner?o.owner+"'S ":'')+(P.n||K.name).toUpperCase(),obj:hb,reach:1.6*TILE,near:2.6*TILE,tall:Math.max(.4,metres)*WU,act:()=>{ const r=o.rec||o.mine&&!o.preview&&out(); if(r&&now()-(r.pet||0)>5*60e3){ r.pet=now(); r.lo=cl(r.lo+2); keep(); } SAY(o.mine?(P.n||'YOUR '+K.name).toUpperCase()+(r&&r.hu>60?' NUZZLES YOUR POCKETS. IT IS HUNGRY.':' IS HAPPY TO SEE YOU.'):'IT SNIFFS YOUR HAND.','#9fe07f'); },
      acts:o.mine&&!o.preview&&!o.stay?[{name:'TELL '+(P.n||'YOUR '+K.name).toUpperCase()+' TO GO HOME',act:()=>o.rec?PETS.sendHome(o.rec.id):PETS.goHome&&PETS.goHome()}]:null};
    N.repaint=c=>paint(D,{...P,c},geo);   // (other zone colours on the same body: the owner's coats for the horse)
    UI.thing(N.th); return N; };
  const drop=N=>{ if(!N)return; const i=NPCS.indexOf(N); if(i>=0)NPCS.splice(i,1); N.g.removeFromParent(); if(N.th){ const j=UI.things.indexOf(N.th); if(j>=0)UI.things.splice(j,1); } N.me.geometry.dispose(); N.mixer&&N.mixer.stopAllAction(); };
  /* ---------- yours ---------- */
  /* ---------- your pets (owner, 8 Nov 2026): every one you have, one out with you; each has an age, hunger, loyalty and health; your permapet (the one you chose on
     your first day) can never be lost: starved, it faints until it is fed; any other pet starved long enough runs away. Kept with your account (OWNED 'pets') ---------- */
  const HR=3600e3, now=()=>Date.now();
  const recs=()=>{ try{ const j=JSON.parse(OWNED.get('pets')||'null'); if(Array.isArray(j))return j.filter(r=>r&&decode(r.c)); }catch(e){} const o=OWNED.get('pet'); return o&&decode(o)?[{id:1,c:o,born:now(),at:now(),hu:20,lo:50,hp:100,out:true}]:[]; };
  let LIST=recs(), DRAFT=null, inShop=false, gen=0;
  let SHOPK=null, shopAt=null; const sells=K=>!SHOPK||K.shop===SHOPK;   // (the shop whose adoption book is open: its kinds only)
  const MAXP=10, MAXOUT=2, outs=()=>LIST.filter(r=>r.out).sort((a,b)=>(b.pri||0)-(a.pri||0)), out=()=>outs()[0]||null, second=()=>outs()[1]||null;   // ten pets, two out with you (owner, 10 Nov 2026); the first is the one YOU's PET tab changes
  const top=()=>LIST.reduce((m,x)=>Math.max(m,x.pri||0),0)+1, lead=r=>{ r.out=true; r.pri=top(); for(const x of outs().slice(MAXOUT))x.out=false; };
  let MY=out()?decode(out().c):null;
  const keep=()=>{ try{ OWNED.set('pets',JSON.stringify(LIST)); const o=out(); if(o)OWNED.set('pet',o.c); else OWNED.del('pet'); }catch(e){} };
  const save=()=>{ const o=out(); if(o&&MY)o.c=code(MY); keep(); };
  const cl=v=>Math.max(0,Math.min(100,v));
  // a pet's hours: hungrier all the time (but never past hungry while you are away), loyal while it is out with you and fed, ill when starved
  const step=(r,h,away)=>{ const h0=r.hu; r.hu=cl(h0+4*h); if(away)r.hu=Math.min(r.hu,Math.max(80,h0));
    if(!away&&r.out&&r.hu<60)r.lo=cl(r.lo+2*h); if(r.hu>80)r.lo=cl(r.lo-3*h);
    if(!away&&r.hu>=100)r.hp=cl(r.hp-6*h); else if(r.hu<50)r.hp=cl(r.hp+10*h); };
  const fainted=r=>!!r&&r.perma&&r.hp<=0;
  const pace=r=>r&&(r.hp<40||r.hu>80)?.7:1;   // (a hungry or ill pet is slow)
  const tickAll=away=>{ const t=now(); let lost=[];
    for(const r of LIST){ const h=Math.max(0,(t-(r.at||t))/HR); r.at=t; if(h>0)step(r,h,away); if(r.hp<=0&&!r.perma)lost.push(r); }
    for(const r of lost){ const P=decode(r.c), K=I&&I.by[P.k]; LIST.splice(LIST.indexOf(r),1); SAY((P.n||'YOUR '+(K?K.name:'PET')).toUpperCase()+' WENT TOO LONG WITHOUT FOOD AND RAN AWAY.','#e0a080'); }
    if(lost.length&&!out()&&LIST.length)LIST[0].out=true; MY=out()?decode(out().c):null; keep(); };
  // what each eats (owner, 8 Nov 2026): hunters dog or cat food, grazers and birds fruit, the rest either
  const MEAT=new Set(['dog','cat','xolo','fox','wolf','lion','crocodile','beelzebufo','trex','raptor','compy','spider','tarantula','mantis','centipede','snake','wasp']);
  const PLANT=new Set(['rabbit','hare','horse','donkey','mule','cow','ox','sheep','goat','elephant','giraffe','zebra','camel','deer','ibex','stego','trike','anky','parasaur','brachio','parrot','pigeon','duck','chicken','butterfly','bee','bumblebee','caterpillar','aphid','hopper','snail','slug','woodlouse']);
  const dietOf=K=>{ const b=K.of||K.key; return MEAT.has(b)||K.group==='dragons'?'meat':PLANT.has(b)?'plant':'any'; };
  const FOODS={meat:'DOG FOOD OR CAT FOOD (THE PET STORE, THE BODEGA)',plant:'FRUIT (AN APPLE FROM THE PET STORE)',any:'PET FOOD OR FRUIT'};
  const foodFor=K=>{ const d=dietOf(K), pet=['g_dogfood','g_catfood'].filter(id=>FORAGE.has&&FORAGE.has(id)), fr=Object.keys(INV.items||{}).filter(id=>/^fr_/.test(id)&&INV.items[id]>0);
    return (d==='meat'?pet:d==='plant'?fr:[...pet,...fr])[0]||null; };
  PETS.dietOf=dietOf;
  const feed=r=>{ const P=decode(r.c), K=I&&I.by[P.k], nm=(P.n||'YOUR PET').toUpperCase(), id=K&&foodFor(K);
    if(!id)return SAY(nm+' WANTS '+(K?FOODS[dietOf(K)]:'FOOD')+'.','#c8a090'); FORAGE.take(id,1); if(FORAGE.draw)FORAGE.draw();
    const was=fainted(r); r.hu=cl(r.hu-45); r.lo=cl(r.lo+4); if(was)r.hp=30; keep(); SAY(was?nm+' WAKES UP AND EATS EVERY BITE.':nm+' EATS IT ALL UP.','#9fe07f'); if(PETS.menuDraw)PETS.menuDraw(); };
  const shown=()=>inShop&&DRAFT||MY;
  let foot=null; const meLead=()=>{ if(VIT.dead)return null; if(st.climb||st.hang||TREES.h!=null||TREES.stand){ if(!foot)foot={x:pos.x,z:pos.z,y:SHARED.groundY?SHARED.groundY(pos.x,pos.z):0,hd:SHARED.heading}; return foot; } foot=null; return {x:pos.x,z:pos.z,y:SHARED.py,hd:SHARED.heading,me:true}; };   // up a tree, your pet waits at its foot
  const atHome=()=>!!(MODS.apts&&MODS.apts.inReal);
  let mine=null, mineCode='', homeSpot=null;
  const refresh=()=>{ const P=shown(), want=P&&(inShop||!fainted(out()))&&(!P.h||inShop||atHome())?code(P)+(P.h&&!inShop?'@h':'')+(inShop?'@s':''):''; if(want===mineCode)return; mineCode=want; const my=++gen;
    drop(mine); mine=null; if(!want)return; homeSpot=P.h&&!inShop?{x:pos.x,z:pos.z}:null;
    make('mine',P,meLead,{mine:true,stay:homeSpot,preview:inShop,room:()=>!inShop&&atHome()&&!MODS.apts.host?roomNow():null}).then(N=>{ if(my!==gen){ drop(N); return; } mine=N; }).catch(e=>console.warn('PET',e)); };
  let mine2=null, mine2Code='', gen2=0;
  const refresh2=()=>{ const r=second(), P=r&&decode(r.c), want=P&&!inShop&&!fainted(r)&&(!P.h||atHome())?r.id+':'+r.c:''; if(want===mine2Code)return; mine2Code=want; const my=++gen2;
    drop(mine2); mine2=null; if(!want)return;
    make('mine2',P,meLead,{mine:true,rec:r,side:.9,stay:P.h?{x:pos.x,z:pos.z}:null,room:()=>atHome()&&!MODS.apts.host?roomNow():null}).then(N=>{ if(my!==gen2){ drop(N); return; } mine2=N; }).catch(e=>console.warn('PET',e)); };
  PETS.mine2=()=>mine2;
  PETS.WU=WU; PETS.dbg={UI,OWNED,pos,ROOMS}; PETS.make=make; PETS.drop=drop; PETS.idx=idx;
  PETS.mine=()=>mine; PETS.my=()=>MY; PETS.code=code; PETS.decode=decode;
  ONLINE.mine.pf=()=>MY&&!MY.h?code(MY):null; ONLINE.mine.pf2=()=>{ const r=second(), P=r&&decode(r.c); return P&&!P.h&&!fainted(r)?r.c:null; };
  // theirs: a pet beside every player near you who has one with them
  const theirs=()=>{ const want=new Map(); if(ONLINE.on&&ONLINE.others)for(const o of ONLINE.others.values())for(const [f,sfx] of [['pf',''],['pf2','#2']]){ const c=o.x&&o.x[f]; if(c&&o.why==='near you'&&o.fig)want.set(o.id+sfx,[o,c,sfx]); }
    for(const [id,r] of THEIRS)if(!want.has(id)||want.get(id)[1]!==r.c){ drop(r.N); r.dead=1; THEIRS.delete(id); }
    for(const [id,[o,c,sfx]] of want)if(!THEIRS.has(id)){ const P=decode(c); if(!P)continue; const r={c,N:null}; THEIRS.set(id,r);
      make('o'+id,P,()=>{ const g=o.fig&&o.fig.g; return g&&o.why==='near you'?{x:g.position.x,z:g.position.z,y:g.position.y,hd:g.rotation.y}:null; },{owner:o.name,side:sfx?.9:0}).then(N=>{ if(r.dead)drop(N); else r.N=N; }).catch(e=>console.warn('PET',e)); } };
  SYS.every(()=>{ refresh(); refresh2(); theirs(); },500,'pets');
  /* ---------- YOU: the PET tab (and THE PET STORE's counter: the same lines, with the kinds and ADOPT) ---------- */
  const $=s=>document.querySelector(s), esc=t=>String(t).replace(/[&<>"]/g,c=>'&#'+c.charCodeAt(0)+';'), stop=e=>e.addEventListener('keydown',ev=>ev.stopPropagation());
  const el=(html,cls='row')=>{ const d=document.createElement('div'); d.className=cls; d.innerHTML=html; return d; };
  let made=false;
  const panel=()=>{ if(made||!LOOKS.add||!$('#looks .ltab[data-t="pet"]'))return made; made=true; const A={tab:'pet'};
    LOOKS.add('pt-none',null,el('<span id="lptnone" class="dim">NO PET YET. ADOPT ONE AT THE PET STORE ON MARKET ST.</span>'),{...A,order:0});
    LOOKS.add('pt-kind','ANIMAL',el('<select id="lptg" aria-label="kind of animal"></select><select id="lptk" aria-label="animal"></select><span id="lptkn"></span>','avw'),{...A,order:1});
    LOOKS.add('pt-name','NAME',el('<input type="text" id="lptn" maxlength="18" placeholder="its name" aria-label="pet name">'),{...A,order:2});
    LOOKS.add('pt-pre','LOOK',el('<span id="lptp"></span>'),{...A,order:3});
    LOOKS.add('pt-col','COLOURS',el('<span id="lptc" class="avk" style="max-width:none"></span>'),{...A,order:4});
    LOOKS.add('pt-shape','SHAPE',el('<div id="lpts" style="display:grid;grid-template-columns:auto minmax(0,1fr);gap:2px 8px;align-items:center"></div>'),{...A,order:5});
    LOOKS.add('pt-size','SIZE',el('<input type="range" id="lptz" min="50" max="150" step="5" aria-label="pet size"><span id="lptzv" class="dim"></span>'),{...A,order:6});
    LOOKS.add('pt-home','WHERE',el('<button id="lpth0">WITH ME</button><button id="lpth1">WAITS AT HOME</button>'),{...A,order:7});
    LOOKS.add('pt-adopt',null,el('<button id="lpta">ADOPT</button> <span id="lptam" class="dim"></span>'),{...A,order:8});
    for(const s of ['#lptg','#lptk','#lptn','#lptz'])stop($(s));
    $('#lptg').onchange=()=>{ const K=I.kinds.find(k=>k.group===$('#lptg').value&&(!inShop||sells(k))); if(K)choose(K.key); };
    $('#lptk').onchange=()=>choose($('#lptk').value);
    $('#lptn').onchange=()=>set({n:$('#lptn').value.trim().slice(0,18)});
    $('#lptz').oninput=()=>{ $('#lptzv').textContent=' '+$('#lptz').value+'%'; }; $('#lptz').onchange=()=>set({z:+$('#lptz').value});
    $('#lpth0').onclick=()=>set({h:false}); $('#lpth1').onclick=()=>set({h:true});
    PETS.goHome=()=>{ const P=MY; if(!P||inShop)return; set({h:true}); SAY((P.n||'YOUR PET').toUpperCase()+' GOES HOME TO YOUR APARTMENT.','#9fe07f'); };   // at once (owner, 9 Nov 2026: "tell your pet to go home")
    $('#lptc').onchange=e=>{ const P=cur(), i=+e.target.dataset.i; if(!P||!(i>=0))return; const c=P.c.slice(); c[i]=e.target.value; set({c}); };
    $('#lptp').onclick=e=>{ const b=e.target.closest('button'); const P=cur(); if(!b||!P)return; const K=I.by[P.k]; if(b.dataset.p==='')return set({c:K.zones.map(z=>z[1])}); const pr=K.presets[b.dataset.p]; if(pr)set({c:K.zones.map(([z,d],i)=>pr[z]||P.c[i]||d)}); };
    $('#lpts').onchange=e=>{ const P=cur(), i=+e.target.dataset.i; if(!P||!(i>=0))return; const s=P.s.slice(); s[i]=+e.target.value; set({s}); };
    $('#lpta').onclick=adopt;
    return true; };
  const cur=()=>inShop?DRAFT:MY;
  const set=o=>{ const P=cur(); if(!P)return; Object.assign(P,o); if(!inShop)save(); draw(); };
  const choose=key=>{ const K=I&&I.by[key]; if(!K)return; DRAFT=Object.assign(fresh(K),{n:DRAFT&&DRAFT.n||''}); draw(); };
  const price=P=>P&&I&&I.by[P.k]?PRICE[I.by[P.k].group]||30:0;
  function adopt(){ const P=DRAFT; if(!P||!inShop)return; if(LIST.length>=MAXP)return SAY('YOU HAVE TEN PETS: THAT IS THE MOST. LET ONE GO FIRST (ESC, PETS).','#c8a090'); const c=price(P); if(INV.cash<c)return SAY('THAT ONE IS $'+c+'. YOU HAVE $'+INV.cash+'.','#c8a090'); INV.cash-=c; if(INV.save)INV.save();
    const K=I.by[P.k]; add({...P,c:P.c.slice(),s:P.s.slice(),h:false},false); SAY((P.n||'YOUR '+K.name).toUpperCase()+' IS YOURS: $'+c+'. SEE ALL YOUR PETS, AND WHICH TWO FOLLOW YOU, IN THE MENU (ESC, PETS).','#9fe07f'); draw(); }
  // a new pet in your list and out with you (the one out before goes home to wait)
  function add(P,perma){ if(LIST.length>=MAXP)return false; const id=LIST.reduce((m,r)=>Math.max(m,r.id||0),0)+1, r={id,c:code(P),perma:!!perma,born:now(),at:now(),hu:10,lo:perma?70:40,hp:100,out:false}; LIST.push(r); lead(r); MY=decode(r.c); keep(); refresh(); refresh2(); return true; }
  PETS.add=add; PETS.list=()=>LIST; PETS.perma=()=>LIST.find(r=>r.perma)||null; PETS.feed=feed; PETS.tick=tickAll;
  PETS.setPerma=P=>{ if(LIST.some(r=>r.perma))return false; return add(P,true); };
  PETS.takeOut=id=>{ const r=LIST.find(x=>x.id===id); if(!r)return; lead(r); MY=decode(r.c); keep(); draw(); refresh2(); };
  const unhome=r=>{ const P=decode(r.c); if(P.h){ P.h=false; r.c=code(P); } };
  PETS.follow=id=>{ const r=LIST.find(x=>x.id===id); if(!r)return false; for(const x of LIST)if(x!==r&&x.out&&decode(x.c).h){ x.out=false; unhome(x); }
    if(!r.out&&outs().length>=MAXOUT){ SAY('ONLY TWO PETS CAN FOLLOW YOU. SEND ONE HOME FIRST.','#c8a090'); return false; } unhome(r); if(!r.out){ r.out=true; r.pri=out()?Math.min(...outs().map(x=>x.pri||0))-1:top(); } MY=out()?decode(out().c):null; keep(); draw(); refresh2(); return true; };
  PETS.sendHome=id=>{ const r=LIST.find(x=>x.id===id); if(!r||!r.out)return; r.out=false; unhome(r); MY=out()?decode(out().c):null; keep(); draw(); refresh2(); SAY((decode(r.c).n||'YOUR PET').toUpperCase()+' GOES HOME TO YOUR APARTMENT.','#9fe07f'); };
  PETS.swap=(id,P)=>{ const r=LIST.find(x=>x.id===id), O=r&&decode(r.c); if(!r||!P)return false; r.c=code({...P,n:P.n||O&&O.n||'',h:!!(O&&O.h)}); MY=out()?decode(out().c):null; keep(); draw(); refresh2(); return true; };
  PETS.letGo=id=>{ const r=LIST.find(x=>x.id===id); if(!r||r.perma)return false; LIST.splice(LIST.indexOf(r),1); if(r.out&&LIST.length)LIST[0].out=true; MY=out()?decode(out().c):null; keep(); draw(); return true; };
  const on=(b,v)=>{ b.setAttribute('aria-pressed',String(v)); b.setAttribute('aria-selected',String(v)); };
  function draw(){ if(!I){ idx().then(draw).catch(e=>console.warn('PET',e)); return; } if(!panel())return; const P=cur(), K=P&&I.by[P.k], rows=k=>$('#looks .lr[data-k="'+k+'"]');
    rows('pt-none').dataset.off=P||inShop?'1':''; for(const k of ['pt-name','pt-pre','pt-col','pt-shape','pt-size','pt-home'])rows(k).dataset.off=P?'':'1'; rows('pt-kind').dataset.off=inShop||P?'':'1'; rows('pt-adopt').dataset.off=inShop?'':'1'; rows('pt-home').dataset.off=P&&!inShop?'':'1';
    const G=[...new Set(I.kinds.filter(k=>!inShop||sells(k)).map(k=>k.group))];
    $('#lptg').innerHTML=G.map(g=>`<option value="${g}">${esc(GN[g]||g.toUpperCase())}</option>`).join(''); $('#lptg').style.display=inShop?'':'none'; $('#lptk').style.display=inShop?'':'none';
    if(K){ $('#lptg').value=K.group; $('#lptk').innerHTML=I.kinds.filter(k=>k.group===K.group&&(!inShop||sells(k))).map(k=>`<option value="${k.key}">${esc(k.name)} ($${PRICE[k.group]||30})</option>`).join(''); $('#lptk').value=K.key; }
    $('#lptkn').textContent=inShop||!K?'':K.name;
    if(!P){ LOOKS.layout(); return; }
    $('#lptn').value=P.n||''; $('#lptz').value=P.z; $('#lptzv').textContent=' '+P.z+'%'; on($('#lpth0'),!P.h); on($('#lpth1'),!!P.h);
    const pk=P.k+'|'+K.zones.length; if($('#lptc').dataset.k!==pk){ $('#lptc').dataset.k=pk; $('#lptc').innerHTML=K.zones.map(([z],i)=>`<input type="color" data-i="${i}" title="${esc(z.replace(/([a-z])([A-Z])/g,'$1 $2').toUpperCase())}" aria-label="${esc(z)} colour">`).join('');
      $('#lptp').innerHTML='<button data-p="">NATURAL</button>'+Object.keys(K.presets).map(p=>`<button data-p="${esc(p)}">${esc(p)}</button>`).join('');
      $('#lpts').innerHTML=K.knobs.map(([k,l],i)=>`<span class="dim">${esc(l)}</span><input type="range" min="0" max="100" step="5" data-i="${i}" aria-label="${esc(l)}">`).join('')||'<span class="dim">NONE FOR THIS ONE</span>'; }
    for(const i of $('#lptc').querySelectorAll('input'))i.value=P.c[+i.dataset.i]||K.zones[+i.dataset.i][1]; for(const i of $('#lpts').querySelectorAll('input'))i.value=P.s[+i.dataset.i]??50;
    $('#lpta').textContent='ADOPT THIS '+K.name+' FOR $'+price(P); $('#lptam').textContent=outs().length>=MAXOUT?'(TWO FOLLOW YOU AT MOST: ONE GOES HOME TO WAIT)':'';
    LOOKS.layout(); refresh(); }
  PETS.draw=draw; PETS.choose=k=>choose(k); PETS.set=set; PETS.adopt=()=>adopt(); PETS.inShop=()=>inShop;
  // the counter: the YOU window on its PET tab, the kinds open, the one you are choosing beside you; leaving the shop puts yours back
  // (each shop's book has its own kinds: K.shop, data/pets.json; it shuts when you walk off)
  PETS.shop=id=>{ idx().then(()=>{ inShop=true; SHOPK=id||null; shopAt={x:pos.x,z:pos.z}; const first=I.kinds.find(sells)||I.kinds[0]; DRAFT=MY&&sells(I.by[MY.k]||{})?{...MY,c:MY.c.slice(),s:MY.s.slice(),h:false}:fresh(first); draw(); LOOKS.open(); LOOKS.tab('pet'); }); };
  SYS.every(()=>{ if(inShop&&($('#looks')&&$('#looks').hidden||!shopAt||Math.hypot(pos.x-shopAt.x,pos.z-shopAt.z)>12*TILE)){ inShop=false; SHOPK=null; DRAFT=null; draw(); } },400,'pet shop');
  SYS.onStart(()=>{ const P=$('#looks'); if(P)new MutationObserver(()=>{ if(!P.hidden)draw(); }).observe(P,{attributes:true,attributeFilter:['hidden']}); if(MY)idx().then(draw).catch(()=>{}); },'146zj-pets');
  /* ---------- a pet's portrait: its own little stage, drawn into a canvas (the first day, the PETS menu) ---------- */
  const PV={key:'',busy:null,rt:{}};
  // a body on its own, standing idle (a portrait's, the vehicle editor's horse); repaint(c) gives it other zone colours
  const still=async P=>{ const K=(await idx()).by[P.k]; if(!K)return null; const D=await kind(P.k), {P:Pp,T}=shape(D,P), R=rig(D,T), CL=clips(D,T), geo=SKIN.geom(D.mesh);
    geo.attributes.position.array.set(Pp); geo.attributes.position.needsUpdate=true; paint(D,P,geo); geo.computeVertexNormals();
    const me=new THREE.SkinnedMesh(geo,new THREE.MeshLambertMaterial({vertexColors:true})); me.add(R.bones[0]); me.bind(R.skeleton); SKINCULL(me);
    const mix=new THREE.AnimationMixer(R.bones[0]), id=pickClip(CL,'idle'); if(id)mix.clipAction(CL[id]).play(); mix.update(0);
    me.repaint=c=>paint(D,{...P,c},geo); return {me,mix,Pp}; };
  PETS.still=P=>still(P).then(r=>r&&r.me);
  const pvBuild=async P=>{ const r=await still(P); if(!r)return; const {me,mix,Pp}=r;
    if(!PV.sc){ PV.sc=new THREE.Scene(); PV.sc.add(new THREE.HemisphereLight(0xffffff,0x506050,2.4)); const d=new THREE.DirectionalLight(0xffffff,1.6); d.position.set(1.5,3,2); PV.sc.add(d); PV.cam=new THREE.PerspectiveCamera(28,1,.01,100); }
    if(PV.me){ PV.sc.remove(PV.me); PV.me.geometry.dispose(); PV.me.material.dispose(); }
    const lo=[1e9,1e9,1e9], hi=[-1e9,-1e9,-1e9]; for(let i=0;i<Pp.length;i++){ const c=i%3; if(Pp[i]<lo[c])lo[c]=Pp[i]; if(Pp[i]>hi[c])hi[c]=Pp[i]; }
    PV.sc.add(me); PV.me=me; PV.mix=mix; PV.box={lo,hi}; };
  PETS.portrait=(cv,P,a=0,dt=1/60)=>{ if(!cv||!P)return; const key=code(P);
    if(PV.key!==key&&!PV.busy)PV.busy=pvBuild(P).then(()=>{ PV.key=key; }).catch(e=>{ PV.key=key; console.warn('PET',e); }).finally(()=>{ PV.busy=null; });
    if(!PV.me)return; const W=cv.width, H=cv.height, k=W+'x'+H, rt=PV.rt[k]||(PV.rt[k]={t:new THREE.WebGLRenderTarget(W,H),px:new Uint8Array(W*H*4)}); rt.t.texture.colorSpace=THREE.SRGBColorSpace;
    PV.mix.update(dt); const {lo,hi}=PV.box, c=new V3((lo[0]+hi[0])/2,(lo[1]+hi[1])/2,(lo[2]+hi[2])/2), r=Math.max(hi[0]-lo[0],hi[1]-lo[1],hi[2]-lo[2])*2.4, cam=PV.cam;
    cam.aspect=W/H; cam.updateProjectionMatrix(); cam.position.set(c.x+Math.sin(a)*r,c.y+r*.28,c.z+Math.cos(a)*r); cam.lookAt(c);
    const old=renderer.getRenderTarget(), cc=renderer.getClearColor(new THREE.Color()), ca=renderer.getClearAlpha();
    renderer.setRenderTarget(rt.t); renderer.setClearColor(0x000000,0); renderer.clear(); renderer.render(PV.sc,cam); renderer.setRenderTarget(old); renderer.setClearColor(cc,ca);
    renderer.readRenderTargetPixels(rt.t,0,0,W,H,rt.px); const cx=cv.getContext('2d'), img=cx.createImageData(W,H); for(let y=0;y<H;y++)img.data.set(rt.px.subarray((H-1-y)*W*4,(H-y)*W*4),y*W*4); cx.putImageData(img,0,0); };
  /* ---------- choosing a pet: every kind and breed, its colour varieties, its name (the first day's PET step, the PETS menu's permapet) ---------- */
  PETS.picker=(el,P0,onChange)=>{ let P=P0?{...P0}:null;
    const draw=()=>{ if(!I){ idx().then(draw); return; } if(!P)P=fresh(I.by.labrador||I.by.cat||I.kinds[0]); const K=I.by[P.k], G=[...new Set(I.kinds.map(k=>k.group))];
      el.innerHTML=`<label>ANIMAL</label><div class="row"><select data-pk="g" aria-label="kind of animal">${G.map(g=>`<option value="${g}"${g===K.group?' selected':''}>${esc(GN[g]||g.toUpperCase())}</option>`).join('')}</select>`
        +`<select data-pk="k" aria-label="animal">${I.kinds.filter(k=>k.group===K.group).map(k=>`<option value="${k.key}"${k.key===K.key?' selected':''}>${esc(k.name)}</option>`).join('')}</select></div>`
        +`<label>COLOURS</label><div class="row">${(Object.keys(K.presets).length?Object.keys(K.presets):['NATURAL']).map(p=>`<button class="btn" data-pp="${esc(p)}">${esc(p)}</button>`).join('')}</div>`
        +`<label>NAME</label><input type="text" data-pk="n" maxlength="18" autocomplete="off" spellcheck="false" value="${esc(P.n||'')}" placeholder="${esc(K.name)}">`
        +`<div class="dim stp">EVERY PET IS PET SIZED. COLOURS, SHAPE AND SIZE CHANGE ANY TIME (PROFILE, PET).</div>`;
      for(const x of el.querySelectorAll('select,input'))stop(x); if(onChange)onChange(P); };
    el.onchange=e=>{ const d=e.target.dataset.pk; if(d==='g'){ const K=I.kinds.find(k=>k.group===e.target.value); if(K){ P=Object.assign(fresh(K),{n:P.n}); draw(); } } else if(d==='k'){ P=Object.assign(fresh(I.by[e.target.value]),{n:P.n}); draw(); } };
    el.oninput=e=>{ if(e.target.dataset.pk==='n'){ P.n=e.target.value.trim().toUpperCase().slice(0,18); if(onChange)onChange(P); } };
    el.onclick=e=>{ const b=e.target.closest('[data-pp]'); if(!b)return; const K=I.by[P.k], pr=K.presets[b.dataset.pp]; P.c=K.zones.map(([z,d])=>pr&&pr[z]||d); if(onChange)onChange(P); };
    draw(); return {get:()=>P}; };
  /* ---------- the menu's PETS: every pet you have, all about it ---------- */
  const SEATW={fly:'FLYING BEHIND YOU',walk:'WALKING BEHIND YOU'};
  const TYPE={birds:'BIRD',wild:'WILD ANIMAL',farm:'FARM ANIMAL',zoo:'ZOO ANIMAL',dino:'DINOSAUR',dragons:'DRAGON',bugs:'BUG',shore:'CRAB'};
  const typeOf=K=>K.type?K.type:K.of?K.of.toUpperCase():K.key==='xolo'?'DOG':TYPE[K.group]||K.name;
  const ageOf=r=>{ const d=Math.floor((now()-(r.born||now()))/864e5); return d<1?'NEW TODAY':d===1?'1 DAY':d+' DAYS'; };
  const moodOf=r=>fainted(r)?'FAINTED: FEED IT TO WAKE IT':r.hp<40?'ILL':r.hu>80?'HUNGRY':r.lo>80?'DEVOTED':r.lo>50?'HAPPY':r.lo>25?'SETTLING IN':'SHY';
  const bar=(v,bad)=>`<span style="display:inline-block;width:110px;height:9px;box-shadow:inset 0 0 0 1px currentColor;vertical-align:middle"><i style="display:block;height:100%;width:${Math.round(v)}%;background:${bad?'#e0a080':'#7dffa8'}"></i></span> ${Math.round(v)}`;
  let MEL=null, choosing=null, chMode='perma', chId=0, pa=0, pcv=null, praf=0;
  const spin=()=>{ cancelAnimationFrame(praf); if(!MEL||!MEL.isConnected||MEL.closest('[hidden]')||!pcv||!pcv.isConnected)return; praf=requestAnimationFrame(spin); try{ PETS.portrait(pcv,choosing?choosing.get():MY,pa+=.008); }catch(e){ console.warn('PET',e); } };
  const menuDraw=()=>{ const el=MEL; if(!el)return; if(!I){ idx().then(menuDraw); return; } tickAll(false);
    const perma=LIST.find(r=>r.perma); let o='<h3>YOUR PETS</h3>'+(LIST.length?`<div class="dim">${LIST.length} OF ${MAXP} · ${outs().length} OF ${MAXOUT} FOLLOWING YOU</div>`:'');
    if(!choosing&&LIST.length<MAXP)o+='<div class="row"><button class="btn" data-pa="new">ADD A PET: ANY ANIMAL</button></div>';
    if(!perma&&!choosing)o+='<div style="white-space:normal;line-height:1.5;margin:6px 0">CHOOSE YOUR PERMAPET: ANY ANIMAL, FREE, AND IT CAN NEVER BE LOST.</div><div class="row"><button class="btn" data-pa="perma">CHOOSE</button></div>';
    if(choosing)o+='<div class="row" style="align-items:flex-start;gap:14px"><canvas width="220" height="190" style="width:220px;height:190px;flex:none"></canvas><div id="dpetpick" style="flex:1;min-width:0"></div></div><div class="row"><button class="btn" data-pa="keep">'+(chMode==='new'?'ADD THIS PET':chMode==='swap'?'CHANGE TO THIS ONE':'KEEP THIS ONE AS MY PERMAPET')+'</button><button class="btn" data-pa="cancel">NOT NOW</button></div>';
    else if(LIST.length)o+='<div class="row"><canvas width="220" height="170" style="width:220px;height:170px"></canvas></div>';
    if(!LIST.length&&!choosing)o+='<div class="dim">NO PETS YET. ADOPT ONE AT THE PET STORE ON MARKET ST, OR A FISH AT THE AQUARIUM ON THE HUDSON.</div>';
    const ord=LIST.slice().sort((a,b)=>(b.out-a.out)||(b.perma-a.perma)||(a.id-b.id));
    for(const r of ord){ const P=decode(r.c), K=I.by[P.k]; if(!K)continue; const long=K.long*P.z/100, tall=K.size[1]*long/Math.max(...K.size), run=Math.max(1.4,Math.min(4.5,3.6*tall));
      const rows=[['KIND',typeOf(K)],['BREED',K.of||K.key==='xolo'?K.name:K.key==='cat'||K.key==='dog'?'MIXED':K.name],['PERMAPET',r.perma?'YES: IT CAN NEVER BE LOST':'NO'],['AGE',ageOf(r)],['ADOPTED',new Date(r.born||now()).toLocaleDateString()],
        ['WHERE',r.out?(P.h?'WAITING AT HOME':'FOLLOWING YOU'):'RESTING AT HOME'],...(seats(K).length?[['SITS',seats(K).map(w=>`<button class="btn"${seatOf(K,P)===w?' style="border-color:#7dffa8;color:#7dffa8"':''} data-pa="seat" data-w="${w}" data-id="${r.id}">${SEATW[w]}</button>`).join(' ')]]:[]),['MOOD',moodOf(r)],['HEALTH',bar(r.hp,r.hp<40)],['HUNGER',bar(r.hu,r.hu>80)],['LOYALTY',bar(r.lo,r.lo<25)],
        ['EATS',FOODS[dietOf(K)]],['SIZE',tall.toFixed(2)+' M TALL, '+long.toFixed(2)+' M LONG'],['SPEED',(run*pace(r)).toFixed(1)+' M/S AT A RUN'+(pace(r)<1?' (SLOWED: '+(r.hp<40?'ILL':'HUNGRY')+')':'')],['FINDS',(r.finds||0)+' THINGS SO FAR'+(r.lo<50?' (FINDS THINGS ONCE LOYAL)':'')]];
      o+=`<div style="margin:12px 0 4px;color:#d8ffe4">${esc((P.n||K.name).toUpperCase())}${r.perma?' ★':''}</div><table>${rows.map(([a,b])=>`<tr><td class="dim" style="padding-right:12px">${a}</td><td>${b}</td></tr>`).join('')}</table>`
        +`<div class="row">${r.out&&!P.h?`<button class="btn" data-pa="home" data-id="${r.id}">SEND HOME</button>`:`<button class="btn" data-pa="out" data-id="${r.id}">FOLLOW ME</button>`}<button class="btn" data-pa="feed" data-id="${r.id}">FEED</button><button class="btn" data-pa="look" data-id="${r.id}">CHANGE ITS LOOK</button><button class="btn" data-pa="swap" data-id="${r.id}">CHANGE ANIMAL</button>${r.perma?'':`<button class="btn" data-pa="go" data-id="${r.id}">LET IT GO</button>`}</div>`; }
    if(PETS.seaMenu)o+=PETS.seaMenu();
    o+='<div class="dim" style="margin-top:10px">PETS GET HUNGRY: HUNTERS EAT DOG OR CAT FOOD, GRAZERS AND BIRDS FRUIT (THE PET STORE). PET YOURS NOW AND THEN (DOUBLE-CLICK IT). A LOYAL PET STAYS CLOSE AND FINDS THINGS FOR YOU; A SHY ONE LAGS BEHIND; A HUNGRY OR ILL ONE IS SLOW. YOU CAN KEEP TEN PETS; TWO CAN FOLLOW YOU, THE REST WAIT IN YOUR APARTMENT. A PET STARVED TOO LONG RUNS AWAY; YOUR PERMAPET ONLY FAINTS.</div>';
    el.innerHTML=o; pcv=el.querySelector('canvas'); if(choosing){ const pk=el.querySelector('#dpetpick'); choosing=PETS.picker(pk,choosing.get()); } spin(); };
  PETS.menu=el=>{ MEL=el; if(!el.dataset.on){ el.dataset.on='1'; el.addEventListener('click',e=>{ const sb=e.target.closest('[data-sea]'); if(sb&&PETS.seaAct)return PETS.seaAct(sb.dataset.sea,sb); const b=e.target.closest('[data-pa]'); if(!b)return; const a=b.dataset.pa, r=LIST.find(x=>x.id===+b.dataset.id);
      if(a==='perma'||a==='new'||a==='swap'&&r){ chMode=a; chId=r?r.id:0; const P0=a==='swap'?decode(r.c):null; choosing={get:()=>P0}; menuDraw(); return; }
      if(a==='keep'&&choosing&&chMode!=='perma'){ const P=choosing.get(); choosing=null; if(P&&(chMode==='swap'?PETS.swap(chId,P):add({...P,h:false},false)))SAY(chMode==='swap'?'YOUR PET IS NOW A '+I.by[P.k].name.toUpperCase()+'.':(P.n||'YOUR '+I.by[P.k].name).toUpperCase()+' JOINS YOU.','#9fe07f'); menuDraw(); return; }
      if(a==='keep'&&choosing){ const P=choosing.get(); choosing=null; if(P&&PETS.setPerma(P))SAY((P.n||'YOUR '+I.by[P.k].name).toUpperCase()+' IS YOUR PERMAPET. IT WILL ALWAYS FIND ITS WAY BACK TO YOU.','#9fe07f'); menuDraw(); return; }
      if(a==='cancel'){ choosing=null; menuDraw(); return; }
      if(!r)return; if(a==='seat'){ const P=decode(r.c); P.w=b.dataset.w; r.c=code(P); if(r.out)MY=decode(r.c); keep(); refresh(); menuDraw(); return; }
      if(a==='out'){ PETS.follow(r.id); menuDraw(); } else if(a==='home'){ PETS.sendHome(r.id); menuDraw(); } else if(a==='feed')feed(r); else if(a==='look'){ PETS.takeOut(r.id); if(UI.menuTab)UI.menuTab('pets','pet'); }
      else if(a==='go'){ const P=decode(r.c); if(b.dataset.sure){ PETS.letGo(r.id); SAY((P.n||'YOUR PET').toUpperCase()+' WANDERS OFF TO A NEW HOME.','#c8d8e0'); menuDraw(); } else { b.dataset.sure='1'; b.textContent='SURE? CLICK AGAIN'; } } }); }
    menuDraw(); };
  PETS.menuDraw=()=>{ if(MEL&&MEL.isConnected&&!MEL.closest('[hidden]'))menuDraw(); };
  // a loyal, fed pet out with you finds things now and then: a few dollars, a fruit
  const fetch=()=>{ const r=out(); if(!r||!mine||!mine.g.visible||inShop||atHome()||ROOMS.cur||r.lo<50||r.hu>80||r.hp<40||Math.random()>(r.lo-40)/500)return;
    const P=decode(r.c), nm=(P.n||'YOUR PET').toUpperCase(); r.finds=(r.finds||0)+1; keep();
    if(Math.random()<.7){ const n=1+Math.floor(Math.random()*5); INV.cash+=n; if(INV.save)INV.save(); SAY(nm+' NOSES OUT $'+n+' AND DROPS IT AT YOUR FEET.','#9fe07f'); }
    else { FORAGE.give('fr_apple',1); if(FORAGE.draw)FORAGE.draw(); SAY(nm+' BRINGS YOU AN APPLE IT FOUND.','#9fe07f'); } };
  PETS.fetch=fetch;
  SYS.every(()=>{ tickAll(false); fetch(); if(!choosing)PETS.menuDraw(); },60000,'pet hours');
  // the pets not out with you wait in your apartment, wandering, while you are there (six at most)
  const HOME=new Map(); let homeAt=null;
  const atHomeList=()=>LIST.filter(r=>!r.out||fainted(r)||decode(r.c).h).slice(0,6).map(r=>r.c);
  PETS.atHome=atHomeList;   // (kept with your room's layout, 150d, so a visitor finds them there)
  const homePets=()=>{ const on=atHome()&&!inShop, want=new Map(), host=on&&MODS.apts.host, G=host&&PETS.guestOf?PETS.guestOf():null;
    if(on){ if(!homeAt)homeAt={x:pos.x,z:pos.z};
      if(host){ const T=THEIRS.get(host); (G&&G.pets||[]).forEach((c,i)=>{ if(want.size<6&&decode(c)&&!(T&&T.c===c))want.set('g'+host+i,{c,guest:G.name}); }); }   // a visit: your host's pets live here (one out with them, if they are in, is beside them)
      else for(const r of LIST)if((!r.out||fainted(r)||decode(r.c).h)&&want.size<6&&!(r.out&&(r===out()?mine:mine2)))want.set(r.id,r); } else homeAt=null;
    for(const [id,h] of HOME)if(!want.has(id)||want.get(id).c!==h.c){ drop(h.N); h.dead=1; HOME.delete(id); }
    let i=0; for(const [id,r] of want){ i++; if(HOME.has(id))continue; const h={c:r.c,N:null}; HOME.set(id,h); const a=i*1.3, spot={x:homeAt.x+Math.sin(a)*1.6*WU,z:homeAt.z+Math.cos(a)*1.6*WU};
      make('home'+id,decode(r.c),meLead,r.guest?{stay:spot,owner:r.guest,room:()=>atHome()?roomNow():null}:{stay:spot,mine:true,rec:r,room:()=>atHome()&&!MODS.apts.host?roomNow():null}).then(N=>{ if(h.dead)drop(N); else h.N=N; }).catch(e=>console.warn('PET',e)); } };
  PETS.home=()=>HOME;
  SYS.every(homePets,700,'pets at home');
  SYS.onStart(()=>{ idx().then(()=>tickAll(true)).catch(()=>{}); },'146zj-pets hours');
  // THE PET SHOPS (owner, 8 Nov 2026): DOGS & CATS, LIZARDS & DRAGONS, THE BIRD SHOP, THE BUTTERFLY SHOP on Market St (the barn's kinds, shop 'barn' in data/pets.json, are sold nowhere for now). Each is the shops' shared inside
  // (162fa: the keeper's counter) with cages floor to ceiling down the left, back and right walls (the barn: wooden stalls), each furnished for what lives in it, every caged kind
  // (K.cage in data/pets.json) alive in its own (awake, looking round, pacing, asleep, hovering), more of them in the shop windows; the adoption book by the counter has the shop's kinds only
  const CORDER=['pets','dogs','cats','rabbits','farm','horses','livestock','poultry','zoo','wild','reptiles','dino','dragons','creatures','birds','parrots','bugs','shore'];
  /* ---------- an animal on show: its pet body in its first colours, fitted to a box (w along, h up, d across, metres), doing what its kind does at rest ---------- */
  const LIVE=new Set(), MWm=IKIT.MW;
  let LOADN=0; PETS.loading=()=>LOADN;   // (the start waits for every shop's animals: none comes in later)
  const show=async(key,fit,o={})=>{ LOADN++; try{ return await show0(key,fit,o); } finally{ LOADN--; } };
  const show0=async(key,fit,o={})=>{ const I0=await idx(), K=I0.by[key]; if(!K)return null; const P=fresh(K), D=await kind(key), {P:Pp,T}=shape(D,P), R=rig(D,T), CL=clips(D,T), geo=SKIN.geom(D.mesh);
    geo.attributes.position.array.set(Pp); geo.attributes.position.needsUpdate=true; paint(D,P,geo); geo.computeVertexNormals();
    const me=new THREE.SkinnedMesh(geo,new THREE.MeshLambertMaterial({vertexColors:true})); me.add(R.bones[0]); me.bind(R.skeleton); SKINCULL(me);
    const lo=[1e9,1e9,1e9], hi=[-1e9,-1e9,-1e9]; for(let k=0;k<Pp.length;k++){ const c=k%3; if(Pp[k]<lo[c])lo[c]=Pp[k]; if(Pp[k]>hi[c])hi[c]=Pp[k]; }
    const ex=hi.map((v,c)=>Math.max(1e-4,v-lo[c])), m=Math.min(K.long/Math.max(...ex),fit.w*.8/ex[2],fit.h*.8/ex[1],fit.d*.85/ex[0]), sc=m*MWm;   // (metres for a model unit; it faces along its box)
    const g=new THREE.Group(), body=new THREE.Group(); body.add(me); g.add(body); me.scale.setScalar(sc); me.position.set(-(lo[0]+hi[0])/2*sc,-lo[1]*sc,-(lo[2]+hi[2])/2*sc);
    const mix=new THREE.AnimationMixer(R.bones[0]), N=Object.keys(CL), f=re=>N.find(n=>re.test(n)), FC=pickClip(CL,'fly'), WC=pickClip(CL,'walk'), IC=pickClip(CL,'idle');
    const flies=!!FC&&(o.fly||WC===FC||/^(bee|bumblebee|wasp|butterfly|firefly|bat|ptera|giantwasp|cavebat)$/.test(key)||/^(bee|bumblebee|wasp|butterfly|firefly|bat)$/.test(K.of||''));
    const A={key,K,g,body,me,mix,CL,FC,WC,IC,curl:f(/curl/i),flies,fitw:fit.w,h:ex[1]*m,len:ex[2]*m,st:'',t:0,x:0,y:0,yaw:0,want:0,ph:Math.random()*6.28,cur:null,shop:o.shop,pace:o.pace!==false};
    A.play=(n,ts=1)=>{ if(!n||!CL[n])return; if(A.cur!==n){ const a=mix.clipAction(CL[n]); a.reset().fadeIn(.4).play(); if(A.cur)mix.clipAction(CL[A.cur]).fadeOut(.4); A.cur=n; } mix.clipAction(CL[n]).timeScale=ts; };
    A.time=Math.random()*3; return A; };   // (it lives (LIVE) once its keeper has placed it)
  // what it does now: hovering if it flies (now and then landing), else looking round, pacing its box, or asleep; a few seconds of each
  const next=A=>{ const r=Math.random(); A.t=4+Math.random()*7; A.want=0; A.x0=A.x;
    if(A.flies){ A.st=(A.WC===A.FC||r<.75)?'float':'rest'; return; }
    A.st=r<.42?'look':r<.7&&A.pace&&A.WC?'pace':'sleep'; if(A.st==='sleep')A.t+=6; };
  const tickA=(A,dt)=>{ A.t-=dt; if(A.t<=0)next(A); const tt=(A.time+=dt), b=A.body;
    if(A.st==='float'){ A.play(A.FC,1); const y=A.fitH*.45+Math.sin(tt*1.3+A.ph)*A.fitH*.12; A.y+=(y-A.y)*Math.min(1,dt*2); const tx=Math.sin(tt*.35+A.ph)*Math.max(0,A.fitw*.35-A.len/2); A.x+=(tx-A.x)*Math.min(1,dt*.8); A.want=Math.cos(tt*.35+A.ph)>0?.3:-.3+Math.PI; }
    else if(A.st==='pace'){ A.play(A.WC,.8); A.y+=(0-A.y)*Math.min(1,dt*3); const r=Math.max(0,A.fitw/2-A.len/2-.02), v=.18, d=A.dir||(A.dir=1); A.x+=d*v*dt; if(A.x>r){ A.x=r; A.dir=-1; } if(A.x<-r){ A.x=-r; A.dir=1; } A.want=A.dir>0?0:Math.PI; }
    else if(A.st==='sleep'){ if(A.curl){ A.play(A.curl,1); } else A.play(A.IC,.06); A.y+=(0-A.y)*Math.min(1,dt*3); }
    else { A.play(A.IC,1); A.y+=(0-A.y)*Math.min(1,dt*3); if(A.st==='look'&&(A.lt=(A.lt||0)-dt)<=0){ A.lt=1.2+Math.random()*2.2; A.want=(Math.random()-.5)*1.6; } }
    A.yaw+=(A.want-A.yaw)*Math.min(1,dt*1.6); b.rotation.y=A.yaw; b.position.set(0,A.y*MWm,0);
    const sl=A.st==='sleep'&&!A.curl; b.scale.set(1,sl?.86+.02*Math.sin(tt*1.6):1,1); A.slide.position.copy(A.base).addScaledVector(A.along,A.x*MWm);
    A.mix.update(dt); };
  // sounds of the shop you are in, now and then (the dogs, the birds, the crickets, the drip of the terrariums, the barn's boards)
  const SND={pets:['bark',.06],birdshop:['chirp',.35],butterflies:['cricket',.25],reptiles:['drip',.18],barn:['creak',.08]};
  SYS.add('life',dt=>{ if(!LIVE.size||!dt)return; dt=Math.min(dt,.1); let near=null, nd=1e9, dt2=dt;
    for(const A of LIVE){ let o=A.g; while(o&&o.parent)o=o.parent; if(o!==scene){ LIVE.delete(A); A.mix.stopAllAction(); A.me.geometry.dispose(); continue; }
      const d=Math.min(Math.hypot(A.base.x-pos.x,A.base.z-pos.z),A.street?Math.hypot(A.street.x-pos.x,A.street.z-pos.z):1e9); if(d>18*TILE)continue;
      if(d>7*TILE&&((A.skip=(A.skip||0)+1)%3)){ A.acc=(A.acc||0)+dt; continue; } dt2=dt+(A.acc||0); A.acc=0; if(d<nd){ nd=d; near=A.shop; } tickA(A,dt2); }
    const S=near&&SND[near]; if(S&&nd<9*TILE&&SFX&&Math.random()<S[1]*dt)SFX.play(S[0],{vol:.18,vary:.3}); },'146zj-pets shops');
  PETS.show=show; PETS.live=()=>LIVE.size; PETS.liveAdd=A=>LIVE.add(A);
  // what each lives in: a dog's bed and bowls, a cat's post, a small pet's shavings and hide, a reptile's terrarium (sand, a branch on a trunk, rocks, a plant, a heat lamp), a slime's moss and mushrooms,
  // a bat's roost, a bird's perches and seed, the flying bugs' flowers behind fine mesh, the crawling bugs' soil and log, the barn's hay, bale and trough
  const habOf=K=>{ const b=K.of||K.key; if(K.shop==='birdshop')return 'bird'; if(K.shop==='barn')return 'barn'; if(K.shop==='aquarium')return 'crab';
    if(K.shop==='butterflies')return /^(bee|bumblebee|wasp|butterfly|firefly|giantwasp)$/.test(K.key)||/^(wasp)$/.test(b)?'flying':'bugs';
    if(b==='cat')return 'cat'; if(b==='dog'||b==='xolo')return 'dog'; if(K.shop==='pets')return 'small'; if(b==='slime')return 'slime'; if(b==='bat')return 'bat'; return 'reptile'; };
  const FRONT={dog:'bars',cat:'bars',small:'bars',bird:'bars',reptile:'glass',slime:'glass',bat:'glass',bugs:'glass',flying:'mesh',crab:'glass',barn:'stall'};
  const FLOORC={dog:0xc8b48a,cat:0xc8b48a,small:0xd8c08a,bird:0xe8e0d0,reptile:0xb89a68,slime:0x4a7a3a,bat:0x3a3430,bugs:0x5a4030,flying:0x7a9a5a,crab:0xe0d0a0,barn:0xd8c070};
  const furnish=(K,box,cyl,ball,glow,CH,CW,CD)=>{ const h=K, W2=CW/2-.06;   // (a: along the cage from its middle, b: from its back toward its front, z: up from its floor; metres)
    if(h==='dog'||h==='cat'){ box(.15,W2-.05,.05,CD-.15,0,.07,h==='dog'?0x8a2a2a:0x2a4a8a); box(.18,W2-.08,.08,CD-.18,.07,.1,h==='dog'?0xb04040:0x4a6aaa);
      for(const a of [-W2+.12,-W2+.3])cyl(a,CD-.12,.07,0,.05,0xb8bcc0); ball(-.1,CD-.14,.05,.045,0xd03a2a);
      if(h==='cat'){ cyl(-W2+.12,.14,.05,0,.5,0xd8c09a); box(-W2+.02,-W2+.24,.04,.26,.5,.54,0x8a6a4a); } }
    else if(h==='small'){ box(W2-.32,W2,.04,.32,0,.18,0x8a6a4a); box(W2-.24,W2-.08,.3,.33,0,.1,0x2a2018); ball(-W2+.2,.2,.03,.13,0xe0c860,.4); cyl(-.1,.04,.025,.2,.4,0xa8d8f0); }
    else if(h==='reptile'){ cyl(-W2+.25,.2,.035,0,CH*.75,0x6a4a2a); box(-W2+.25,.15,.17,.23,CH*.55,CH*.58,0x6a4a2a); box(-W2+.05,-W2+.25,.2,.24,CH*.4,CH*.43,0x6a4a2a);
      ball(W2-.25,.2,.03,.11,0x8a8680,.6); ball(W2-.1,CD-.2,.02,.07,0x9a948a,.7); ball(-.1,.12,.12,.11,0x4a8a3a); cyl(-.1,.12,.015,0,.12,0x3a6a2a);
      glow(()=>box(W2-.4,W2-.15,.12,.32,CH-.07,CH-.04,0xffa040)); }
    else if(h==='slime'){ for(const [a,r] of [[-W2+.2,.05],[W2-.25,.04]]){ cyl(a,.18,.015,0,.1,0xe8e0d0); ball(a,.18,.11,r,0xc8402a,.55); } ball(.1,.12,.03,.09,0x7a7670,.6); }
    else if(h==='bat'){ box(-W2,W2,.08,.12,CH-.14,CH-.11,0x4a3828); }
    else if(h==='bird'){ for(const z of [.22,.44])box(-W2+.04,W2-.04,.28,.31,z,z+.025,0x9a7a52); box(W2-.18,W2-.06,CD-.16,CD-.06,.08,.14,0xe0c050); cyl(-W2+.1,.05,.02,.15,.32,0xa8d8f0); }
    else if(h==='flying'){ for(const [a,c] of [[-W2+.15,0xe05a8a],[-W2+.32,0xf0d040],[W2-.2,0xa060e0],[W2-.38,0xf08a30]]){ cyl(a,.18,.008,0,.32,0x3a7a2a); ball(a,.18,.33,.04,c,.6); } ball(0,.12,.1,.13,0x4a8a3a,.8); }
    else if(h==='bugs'){ box(-W2+.1,.15,.12,.3,0,.09,0x6a4a2a); for(const a of [.1,.3,-.4])box(a,a+.12,CD-.3,CD-.16,0,.01,0x5a8a3a); ball(W2-.15,.2,.02,.06,0x8a8680,.6); }
    else if(h==='barn'){ box(W2-.5,W2-.05,.05,.45,0,.35,0xe0c060); box(-W2+.05,-W2+.65,CD-.35,CD-.08,0,.3,0x6a4a2a); box(-W2+.08,-W2+.62,CD-.32,CD-.11,.25,.27,0x4a8ab8); ball(0,.2,.02,.2,0xe8d070,.25); } };
  const cageKit=(id,ST)=>{ const kit=A=>{ A.bare=1; (MSHOP.kit._||(()=>{}))(A); const R=A.R, F=IKIT.frame(R), K=IKIT.room(F,o=>A.add(o),()=>{}), D=F.D, W=F.W, MW=IKIT.MW, tm=D/(R.y1-R.y0), HT=A.WH/24*tm;
    // the adoption book on its stand in front of the counter
    const kv=2.2*tm, c1=kv+1.05, bu0=W/2-.3, bu1=W/2+.3, bv0=c1+.55, bv1=c1+.95;
    K.box(bu0,bv0,bu1,bv1,0,.95,0x5a3a26); K.box(bu0-.03,bv0-.03,bu1+.03,bv1+.03,.95,1.0,0x3a2418); K.box(bu0+.08,bv0+.06,bu1-.08,bv1-.06,1.0,1.06,0xe8dcc0); K.box(bu0+.1,bv0+.08,bu0+.22,bv1-.08,1.0,1.07,0x7a2a2a);
    A.sol(R.x0+bu0/tm,R.y0+bv0/tm,R.x0+bu1/tm,R.y0+bv1/tm); K.use('THE ADOPTION BOOK (ADOPT A PET)',W/2,(bv0+bv1)/2,.8,1.2,()=>PETS.shop(id),1.8); K.flush();
    // the cages: [middle across, middle along, which way it opens], the left wall from the back, then the back wall, then the right wall
    const {CW,CH,CD,ROWS,stall}=ST, G=new THREE.Group(), K2=IKIT.room(F,o=>G.add(o),()=>{}), H0=stall?0:.12, SP=[], WOOD=stall?0x6a4a2a:0x4a3828, BAR=0xa8a296, GL={p:[]};
    const nb=Math.floor((W-.4)/CW), ns=Math.floor((D-1.7-CD)/CW);
    for(let i=0;i<ns;i++)SP.push([CD/2,CD+.05+(i+.5)*CW,1,0]); for(let i=0;i<nb;i++)SP.push([.2+(i+.5)*(W-.4)/nb,CD/2,0,1]); for(let i=ns-1;i>=0;i--)SP.push([W-CD/2,CD+.05+(i+.5)*CW,-1,0]);
    const all=[]; for(const s of SP)for(let r=0;r<ROWS;r++)all.push([...s,H0+r*CH]);
    // each cage in its own frame: a along the wall, b from the wall out, z up from the cage's floor
    const frame=(s)=>{ const [u,v,du,dv,h]=s, at=(a,b)=>du?[du>0?b:W-b,v+a]:[u+a,b];
      const bx=(a0,a1,b0,b1,z0,z1,c)=>{ const p=at(a0,b0), q=at(a1,b1); K2.box(Math.min(p[0],q[0]),Math.min(p[1],q[1]),Math.max(p[0],q[0]),Math.max(p[1],q[1]),h+z0,h+z1,c); };
      const cy=(a,b,r,z0,z1,c)=>{ const p=at(a,b); K2.cyl(p[0],p[1],r,h+z0,h+z1,c); }, bl=(a,b,z,r,c,sy=1)=>{ const p=at(a,b); K2.ball(p[0],p[1],h+z,r,c,sy); };
      const glass=(a0,a1,b,z0,z1)=>{ const p=F.pw(...at(a0,b)), q=F.pw(...at(a1,b)); GL.p.push(p[0],(h+z0)*MW,p[1],q[0],(h+z0)*MW,q[1],q[0],(h+z1)*MW,q[1],p[0],(h+z0)*MW,p[1],q[0],(h+z1)*MW,q[1],p[0],(h+z1)*MW,p[1]); };
      return {at,bx,cy,bl,glass}; };
    const cage=(s,hab)=>{ const {bx,cy,bl,glass}=frame(s), W2=CW/2-.01, fr=FRONT[hab]||'bars';
      bx(-W2,W2,0,CD,0,.03,WOOD); bx(-W2+.02,W2-.02,.02,CD-.02,.03,.035,FLOORC[hab]||0xc8b48a); if(!stall)bx(-W2,W2,0,CD,CH-.03,CH,WOOD);
      if(!stall)bx(-W2,W2,0,.02,.03,CH-.03,hab==='bat'?0x1e1a1a:hab==='reptile'?0x6a8a6a:hab==='flying'?0xa8c8a0:0xd8d0c0);   // its back
      for(const a of [-W2,W2])for(const b of [0,CD])bx(a-.02,a+.02,b-.02,b+.02,0,CH,WOOD);
      if(fr==='stall'){ for(const z of [.35,.6,.85])bx(-W2,W2,CD-.03,CD+.01,z*CH-.04,z*CH,WOOD); bx(-W2-.01,-W2+.01,0,CD,0,CH*.85,WOOD); }
      else if(fr==='glass'){ glass(-W2,W2,CD,.035,CH-.03); bx(-W2,W2,CD-.03,CD,.03,.07,WOOD); }
      else { const n=fr==='mesh'?40:16, c=fr==='mesh'?0x4a5a48:BAR; for(let k=1;k<n;k++){ const a=-W2+k*2*W2/n; bx(a-.005,a+.005,CD-.01,CD,.03,CH-.03,c); } if(fr==='mesh')for(let k=1;k<10;k++)bx(-W2,W2,CD-.01,CD,k*CH/10-.004,k*CH/10+.004,c); }
      furnish(hab,bx,cy,bl,f=>K2.glow(f),CH,CW,CD); };
    const gen=A.gen=(A.gen||0)+1; LOADN++;
    const pic=!!(WINDOWS.taking&&WINDOWS.taking.has(id));   // (built only for the street's first picture of its windows: the cages without their animals, nothing fetched)
    idx().then(I=>{ if(A.gen!==gen||!A.live())return;
      const L=I.kinds.filter(k=>k.shop===id&&k.cage).sort((a,b)=>CORDER.indexOf(a.group)-CORDER.indexOf(b.group));
      for(const s of SP){ const a=s[2]?CD/2:CW/2, b=s[2]?CW/2:CD/2; A.sol(R.x0+(s[0]-a)/tm,R.y0+(s[1]-b)/tm,R.x0+(s[0]+a)/tm,R.y0+(s[1]+b)/tm); }
      const H0B={pets:'dog',reptiles:'reptile',birdshop:'bird',butterflies:'flying',barn:'barn'}; all.forEach((s,i)=>cage(s,L[i]?habOf(L[i]):H0B[id]||'dog'));
      // the shop windows: a low stage behind each giant pane either side of the door, more of them on show to the street
      const SH=[]; for(const [u0,u1] of [[.3,W/2-1.05],[W/2+1.05,W-.3]]){ K2.box(u0,D-.9,u1,D-.08,0,.45,0x5a4030); K2.box(u0+.04,D-.86,u1-.04,D-.12,.45,.47,FLOORC[habOf(L[SH.length]||L[0]||{})]||0x7a9a5a);
        for(let k=0;k<2;k++)SH.push([u0+(u1-u0)*(k+.5)/2,D-.5,(u1-u0)/2]); }
      K2.flush(); const XF=ROOMS.off[id]&&ROOMS.off[id].xf, XI=XF&&XF.clone().invert();
      if(GL.p.length){ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(GL.p,3)); g.computeVertexNormals(); const me=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:0xd8f0f4,transparent:true,opacity:.16,depthWrite:false,side:THREE.DoubleSide})); me.renderOrder=2; G.add(me); }
      // the animals, one a cage, alive (not for the street's first picture: then once you are in, or watching through the glass)
      const fill=()=>{ const G2=new THREE.Group(), TH=[]; G2.userData.street=XI;
      L.forEach((k,i)=>{ const s=all[i]; if(!s)return; const hab=habOf(k), bird=hab==='bird', fit={w:CW-.12,h:bird?CH-.5:stall?CH*.9:CH-.1,d:CD-.1}, c=F.pw(s[0]-s[2]*.0,s[1]-s[3]*.0);
        const hb=new THREE.Mesh(new THREE.BoxGeometry((s[2]?CD:CW)*MW*.9,CH*MW*.9,(s[2]?CW:CD)*MW*.9),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(c[0],(s[4]+CH/2)*MW,c[1]); G2.add(hb);
        TH.push({name:'A '+k.name+' ($'+(PRICE[k.group]||30)+')',obj:hb,reach:1.6*TILE,near:2.8*TILE,tall:CH*MW,act:()=>{ PETS.shop(id); idx().then(()=>setTimeout(()=>choose(k.key),0)); }});
        show(k.key,fit,{shop:id,fly:hab==='flying'||hab==='bat'}).then(B=>{ if(!B)return; if(A.gen!==gen||!G2.parent)return; const al=s[2]?F.ev:F.eu, fw=s[2]?[F.eu[0]*s[2],F.eu[1]*s[2]]:[F.ev[0]*s[3],F.ev[1]*s[3]];
          B.fitH=fit.h; B.base=new THREE.Vector3(c[0],(s[4]+.035+(bird?.46:0))*MW,c[1]); B.along=new THREE.Vector3(al[0],0,al[1]); B.slide=B.g; B.g.position.copy(B.base); if(G2.userData.street)B.street=B.base.clone().applyMatrix4(G2.userData.street);
          B.g.rotation.y=Math.atan2(al[0],al[1])+(Math.random()<.5?0:Math.PI)*(B.flies?0:1)+.25*Math.sign(Math.random()-.5); G2.add(B.g); LIVE.add(B); }).catch(e=>console.warn('PET SHOW',e)); });
      // the window's own, facing the street
      SH.forEach((q,i)=>{ const k=L[(i*7+3)%Math.max(1,L.length)]; if(!k)return; const c=F.pw(q[0],q[1]), fit={w:Math.min(1.1,q[2]*.9),h:1.0,d:.7};
        show(k.key,fit,{shop:id,pace:false,fly:habOf(k)==='flying'}).then(B=>{ if(!B)return; if(A.gen!==gen||!G2.parent)return; B.fitH=fit.h; B.base=new THREE.Vector3(c[0],.47*MW,c[1]); B.along=new THREE.Vector3(F.eu[0],0,F.eu[1]); B.slide=B.g;
          B.g.position.copy(B.base); if(G2.userData.street)B.street=B.base.clone().applyMatrix4(G2.userData.street); B.g.rotation.y=F.hd(0,1); G2.add(B.g); LIVE.add(B); }).catch(()=>{}); });
      for(const t of TH)UI.thing(t); if(!A.late(G2,TH)){ for(const t of TH){ const j=UI.things.indexOf(t); if(j>=0)UI.things.splice(j,1); } return; } (PETS.caged||(PETS.caged={}))[id]=Math.min(L.length,all.length); };
      LOADN--; if(!A.late(G,[]))return; if(pic)PEND.set(id,{A,gen,fill}); else fill(); }).catch(e=>{ LOADN--; console.warn('PET CAGES',e); }).catch(e=>console.warn('PET CAGES',e)); };
    kit.drop=()=>{ const d=MSHOP.kit._&&MSHOP.kit._.drop; if(d)d(); }; return kit; };
  const PEND=new Map(); SYS.every(()=>{ for(const [id,q] of PEND){ if(q.A.gen!==q.gen||!q.A.live()){ PEND.delete(id); continue; } if((ROOMS.offIn&&ROOMS.offIn()===id)||WINDOWS.held.has(id)){ PEND.delete(id); q.fill(); } } },300,'pet shops filled');
  const CAGE={CW:1.4,CH:.72,CD:.6,ROWS:4}, STALL={CW:1.7,CH:1.4,CD:1.0,ROWS:1,stall:true};
  for(const id of ['pets','birdshop','reptiles','butterflies'])MSHOP.kit[id]=cageKit(id,CAGE);
}
