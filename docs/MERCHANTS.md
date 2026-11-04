# Merchants queue

The owner's merchants, one per picture (25; the lace bat is the balloon witch's), queued until he says go (owner, 28 Oct 2026: "dont start building yet, just queue them").
Standing picks for all of them (28 Oct 2026): Claude places each one where it fits best (a half-size bodega, food cart, food truck,
a boat on the Hudson, a table by the Hudson, walking Central Park...); each gets its own body matching the picture, mockups first.
Every one goes through the one path: `makeNPC` + a home, `characters.json` (`trade`, `talk`), items in `items.json`, an inside
off the map in `ROOMS.off`.

## The owner's picks (28 Oct 2026; these override the entries below)

Building now (owner: "build those out for now"):
1. BOARDWRIGHT: sells hoverboards, hung on the walls, in different designs, colours, sizes and speeds.
2. GLASS HORN: plays outside for money; the owner double-clicks her to upload a new song; real playing (fingers, movement).
3. FIXER: an electronics repair shop selling TVs, computers and modems. Never name 1985 outright: it is only the timeline's reference point.
4. NEWSREEL: takes photos and sells them; real photos you can buy and frame.
5. SCANNER: sells police scanners (they tell you where security is, for black-market work) and night-vision goggles that really work; a small bodega on Market St.
6. SISTER PETTY: sells petty curses: rats follow someone, a cloud rains on them, they stink. Curse NPCs like the golems so they fight the rats while you sneak past into the cave.
7. THE EYE: a visitor that flies around and never speaks.
8. THE BLOCK: sells Rubik's cubes you can really solve (a minigame).
9. BALLOON WITCH: black balloons that float you over things (fast travel, over dangerous spots).
10. RADISH: seeds that grow fruit that heals you; they need dirt, a pot and water.

Built 29 Oct 2026 (owner: "start building merchants 11 to 25"):
11. TIGER: a small kiosk by the lake: sunglasses, jackets, jeans.
12. SONIEE: subway platform; three drinks that sell their own juice, each a temporary boost (faster, stronger, more health), good for the dungeon.
13. ALL-SEEING CACTUS: Market St plant stall; bought as decoration; it watches people, and you.
14. THE STUMP: on a Central Park path; sells maps (in the real game the menu's map only shows once you own one).
15. BLUE HOUR: sells cigars.
16. BROADCAST, 17. OTTER, 18. REEL KID, 19. BAGGER, 20. SECONDHAND GHOST, 21. JELLYCAP, 24. WANDERING CAP, 25. WATCHMAKER: visitors (they walk the city; no shop).
22. BONSAI: Market St plant stall; tiny bonsai for your home that grow.
23. OPERATOR: sells phones for your home and bulky cell phones.

## 1. THE BOARDWRIGHT: hoverboards (queued 28 Oct 2026)

From the Wiki: "Masked Hoverboard Wooden Merchant".

**Who.** He never takes the mask off and never says where he's from. He grows the boards from a living wood that only grows on a
low-gravity world. The grain remembers the lift of home, so the wood still floats a little. Carving the grain tunes how much: a deep
carving is a strong lift. He talks little, in board terms ("she wants to rise"), and calls every deck "she". He's 10/10, a person's height.

**Body (built to match the picture).**
- Mask: a smooth ivory full-head shell, fitted like a balaclava, with raised carved swirls over the crown and brow (knotwork, in
  relief, the same ivory). Two large black almond eye holes slanted up. A pointed nose ridge. A grille of drilled dots over the mouth and
  chin. Small ivory ears showing.
- Clothes: an oversized white knit zip-up with a thick, fuzzy, open-weave stitch (lacy holes on the sleeves), its collar up to the chin.
  A silver zip.
- Left hand: an ornate antique-silver gauntlet over the back of the hand and wrist (scrolls, rivets, a domed boss), silver rings on
  the fingers. His other hand is bare, pale, with dark rings.
- Always holds a deck upright beside him: teal, worn at the rails, with gold-cream ornate symmetrical carving (art nouveau, a
  winged figure in the middle). That deck is THE TEAL QUEEN, the one he sells.
- Idle: turns the deck in his hands and runs a thumb along the rail; now and then taps it, and it bobs a hand's width up on its own.

**Where.** West St, the first blank shell (`shell1`, between the bar and the arcade): its painted garage door becomes his shop.
**Outside:** a half-up roll-up shutter, painted ivory, with the same knotwork stencilled on it; a hand-carved wooden sign, THE
BOARDWRIGHT, hanging from an iron arm; one deck hovering in the window, bobbing; wood shavings swept up by the step. At night a
warm amber glow comes under the shutter.

**Inside (half the bodega; a workshop more than a shop; gritty, lived-in, like the bodega and the platform).**
- The front: a long wall rack of decks, upright, nose up, in rows, most uncarved; a few hover a finger's width off their pegs and
  sway. Their tags are hand-lettered on card.
- The middle: his carving bench, scarred dark hardwood: gouges and chisels in a canvas roll, a vise holding a half-carved deck,
  curls of pale shavings, a tin of grain oil, a cracked mug of brushes. A deck clamped under a strap so it can't float off.
- The back: the drying rack, raw planks of the living wood chained to the ceiling, straining up against the chains. A big wooden
  crate stamped OFF-WORLD / THIS SIDE DOWN, with a corner pried open and dark soil inside.
- On the walls: chalk sketches of patterns pinned up; an old photo of a deck floating over water; a cracked mirror; a 1985 calendar.
  The ceiling: a single caged work lamp, scratch marks where boards hit it.
- The floor: worn concrete, shavings in the corners, a rubber mat by the bench.
- Light: one warm work lamp over the bench and the cool street light from the shutter gap; dust in the air.
- His counter: an upturned crate with a cash tin, by the door.

**Wares (3 carved decks, tiered; each an item; price by its value).**
| item | name | value | ride |
|---|---|---|---|
| `board_plain` | THE PLAIN GRAIN | 40 | low (20 cm), a little faster than a run |
| `board_carved` | THE CARVED DECK | 90 | 30 cm, faster, holds a carve |
| `board_teal` | THE TEAL QUEEN | 200 | 40 cm, fastest, glides over water |

**The hoverboard (ride, no skill; owner's pick).** Item properties: `slot: hand`, `grants: ride`, and `lift`/`speed`/`water` on each
board (schema-wide on the item model, editable in the item editor). Hold it and press the use key: you drop it and step on, it hovers
under you; WASD rides it (you lean into turns and carve), SPACE ollies, it glides on over kerbs and steps, the board tilts on slopes. The
same key steps off and puts it back in the pack. A hard knock (a wall at full speed, a fall) throws you off. Other players see you
ride. Indoors you can't ride (it's carried).

**Talk.**
- Hi: "She wants to rise." / "Back for another, {name}?"
- WHAT DO YOU SELL? → the shop.
- WHERE IS THE WOOD FROM? → "Somewhere light. It grew reaching up. It still is."
- WHY THE MASK? → "Shavings." (He says nothing else about it.)
- GOODBYE.

**Cost.** One block outside (no holes); the inside is built only when you go in. His body is one rig body. A ridden board is a small mesh.

**Touches.** Items (3 new boards and the `ride` grant), the item editor, characters.json (`trade`, `talk`), the character editor,
WIELD (the held board), the Walker's moves (riding), ONLINE (others see you ride), West St's `shell1`, `ROOMS.off`.
Checks: the merchant sells, you ride and get off, others see you ride, and you never ride through a wall or fall through the world.

## 2. THE GLASS HORN: trumpets, busking (queued 28 Oct 2026)

**Who.** A woman of living glass from a world where everything rings. Sound runs through her: she tunes a horn by holding it to her
chest and listening to which part of her hums. She plays in her own shop window every night and never stops for long. She speaks
softly, between phrases, mostly about pitch. 10/10.

**Body.** Clear, faintly blue-green glass, with the light bending through it. Her face is a smooth glass skull with a small nose and lips.
Her hands are long and jointed like glass rods, her wrists rings of beaded glass. She wears a gold helmet-cap engraved with scrolls and a
round boss over each ear, under a white fur hood with fluffy fur ear muffs. A gold engraved shoulder plate on one side. A gold filigree
collar and a gold chest piece. A full skirt of sheer tulle. Her trumpet is gold with a glass bell (her own make). Idle: she plays (valves,
cheeks, breath), lowers the horn, listens, and plays again.

**Where.** West St, the second blank shell (`shell3`), next to the playhouse (the theatre end). **Outside:** a deep shop window lit
warm from inside, with her playing in it (the street hears her: her music fades with distance, quiet by day, clear at night), gold leaf
lettering on the glass, GLASS HORN, a takeaway coffee cup on the sill outside for tips, condensation at the window's corners.

**Inside (half the bodega; a narrow music shop).** Horns hanging by their bells from a ceiling rail, swaying a little, so the
ceiling is brass. A glass-fronted cabinet of mouthpieces on velvet. A workbench of valve springs, a dented bell being hammered round on
a mandrel, rags black with polish. Sheet music in drifts, yellowed, taped to the walls; a cracked practice mirror. An upright piano
with its front off and a mug on it. The window stage is a raised plinth with a worn velvet rug where she stands. Light: warm
bulbs in brass shades, and the street's neon coming through the window, bending through her.

**Wares.**
| item | name | value | play |
|---|---|---|---|
| `horn_tin` | DENTED CORNET | 15 | a few notes, sometimes cracks |
| `horn_brass` | BRASS TRUMPET | 50 | a full range, clean |
| `horn_glass` | THE GLASS BELL | 150 | her make, a warm ringing tone, carries twice as far |

**Play.** Held (`slot: hand`, `grants: play`, through the same play mode as the guitar and the piano): number keys are notes, and
holding a key holds the note. **Busking:** play on the street with your case open and passers-by (NPCs and players) drop tips,
more for a better horn and by how many people are near. She buys back horns at half.

**Talk.** "Listen. No, *listen*." / WHAT DO YOU SELL? / HOW DO I EARN WITH IT? ("Open the case. Play where the feet are.") / GOODBYE.

**Touches.** 3 items + `play` grant, the instruments' play mode, tips (cash), SFX (her music in the world), West St `shell3`, `ROOMS.off`.

## 3. THE FIXER and the little one: repairs, old electronics (queued 28 Oct 2026)

**Who.** A huge, old, rain-dark armoured robot that kneels at broken machines all over the street, and a small figure in a hooded
raincoat who is always beside him. The robot never talks. The little one does: the robot is a suit it drives (Bible: small creatures
steering larger bodies). Nobody has seen under the hood. The little one gives the orders, the robot's hands do the work.

**Bodies.** *The Fixer:* gunmetal-black plate, rain-streaked, chipped to bare steel at the edges, riveted; a bucket helm with a fin
crest and a round ear disc; a big curved pauldron; ribbed, segmented arms and fingers; kneepads, armoured boots. 14/10 standing; he's
almost always kneeling. *The little one:* 4/10, a tan hooded raincoat, its hood up, darker where it's wet, short denim, white socks,
little shoes. Idle: the robot works a panel (unscrews, holds a part up to the hood for the little one to look at); the little one
points, stamps a foot, splashes in puddles.

**Where.** A beat-up 1970s step van, FIX-IT on its side in hand-painted letters, parked on Market St's kerb. When it rains, they work
on the street's vending machines and the newspaper box nearby instead. **Inside the van (you can step in; about a quarter of the
bodega):** shelves bolted to both walls, packed with radios, TVs, walkmans and handheld games, each with a paper tag; a bench of
tangled wire, solder smoke, a magnifier lamp; jars of screws; a car battery; a small cushion and a comic book on a crate (the
little one's spot); rain drumming on the roof, the back doors open on the wet street.

**Wares (refurbished 1985 electronics; the Bible says they are worth a lot to the galaxy).**
| item | name | value | does |
|---|---|---|---|
| `walkman` | POCKET CASSETTE | 25 | worn: plays the game's music for you while you walk |
| `handheld` | HANDHELD GAME | 35 | play it anywhere (one of the arcade's games, small) |
| `pockettv` | POCKET TV | 60 | shows the cinema's picture / the city's news |

**Buys:** `junk_e`, broken electronics found in the trash cans and the dungeon (a new found thing). **Repairs:** broken gear back to
new, if gear wears.

**Talk (the little one).** "He says hi. He doesn't, but he would." / WHAT DO YOU SELL? / DO YOU BUY? ("Broken stuff. Bring it.")
/ WHO'S IN THERE? ("Rude.") / GOODBYE.

**Touches.** 2 characters, a van (a block + its inside in `ROOMS.off`), 3 items + 1 found item, trash cans (finding junk),
the weather (rain changes where they stand), SFX.

## 4. THE NEWSREEL: living cameras, photographs (queued 28 Oct 2026)

**Who.** A living camera. His species sees through lenses grown from their own heads, so he is legal (the Bible's rule: only static
cameras are banned; a camera must be alive or on something alive). He films the market for the galaxy's papers and pays well for
pictures of anything strange. Fast talker, in headline words: "FOUND: ONE CUSTOMER. MORE AT ELEVEN."

**Body.** A spongy white, pitted body like coral or pumice; long ribbed white tendrils hanging from his neck and down his sides;
thick white jointed arms with ring bands. Long red, knobbly antennae fanning up from his head. His head is a blue-grey boxy camera
housing: a white dome on top with screws, three round black lenses (two in front, one on the side), a slatted vent grille, cables
trailing to the big black zoom lens he holds. 9/10. Idle: he raises the lens, focuses (it clicks and whirs), lowers it, his
antennae twitching toward whatever moves.

**Where.** He walks: Central Park and Market St (a wide home range), wherever something is happening (he heads to a fight, a fire,
a dragon). No shop. A little press bag on his shoulder.

**Wares.**
| item | name | value | does |
|---|---|---|---|
| `camera` | BOX CRITTER | 30 | a small living camera (a shelled thing with one lens, it blinks); held, it takes a photo (12 a roll) |
| `film` | FILM ROLL | 3 | 12 more photos |
| `frame` | PHOTO FRAME | 8 | hang a photo in your apartment |

**Buys photos** by what's in them: a butterfly by its rarity, a ghost, a dragon, a golem, another player mid-fight, the fire. The
photo keeps what was in it and he pays by that (a photo is an item with `subject` and `rare`). Photos also hang in your apartment.

**Talk.** "HOLD IT. Okay, you're nobody. What've you got?" / WHAT DO YOU SELL? / WHAT DO YOU BUY? ("Strange. The stranger, the
better.") / GOODBYE.

**Touches.** Items (camera, film, frame, photo), a photo picture (the game's view, small), what's in view (what's in the photo),
the apartment's frames (150b), a roaming home range, SFX.

## 5. THE SCANNER: radios and tips (queued 28 Oct 2026)

**Who.** A human, a New Yorker, a roadie who never went home from the summer of '78. He wears a home-made radio-scanner box over
his head (hiss, chatter, a dial glowing). He hears everything: market security, delivery bots, the drains. He sells radios, and he
sells what he hears. Talks over the static, half to you, half to the box.

**Body.** A beige-grey metal box helmet, battered and taped, covering his eyes: a speaker cone, slatted grilles, a little display,
knobs and toggles, a speaker drum on each side, two stubby antennae, his own scruffy blond hair poking out on top. Below: a lined,
stubbled face, mouth half open. A dirty red tank top under a torn blue denim vest, a black leather strap across his chest, a cord
choker and chains. 10/10. Idle: twists a knob, cocks his head, the box crackles; he writes on his hand.

**Where.** A folding table by the Hudson (the quay), stacked with radios, a car battery under it, a long wire aerial strung up to a
lamp post "for the water bounce", a lawn chair, a cooler. Night: the radio dials glow.

**Wares.**
| item | name | value | does |
|---|---|---|---|
| `radio` | TRANSISTOR RADIO | 20 | placed or held: plays the game's stations near it (others hear it too) |
| `scanner_r` | POLICE SCANNER | 70 | held: now and then you hear security chatter about something near you (a hint) |
| `tip` | A TIP | 5 | he tells you one thing true today: where a rare butterfly, fish, or ore is, marked on your map for the day |

**Talk.** "Shh. Shh. ...Okay. What." / WHAT DO YOU SELL? / HEARD ANYTHING? (a tip) / WHY THE BOX? ("You hear better when you
don't look.") / GOODBYE.

**Touches.** 3 items, the music (stations), the map (a mark for the day), the butterflies, the fish and the ore (today's rare spots),
the Hudson quay, SFX.

## 6. SISTER PETTY: petty curses and odd roots (queued 28 Oct 2026)

From the Wiki: "Petty curses for sale merchant" and "Gen-Sing Roots that resemble opera singers". Nothing is magic: the curses
are little transmitters and drones (Bible: "legal but annoying"). She dresses like a nun; who knows if she is one.

**Who.** Prim, stern and polite, judging you. She sells harmless revenge. "Nothing illegal, dear. Just *inconvenient*."

**Body.** A black wimple and veil to her shoulders; a pale blue fitted mask over her face to the brows, edged white, a silver
crest of a spike and a jewelled cross-bar rising from the forehead with a red stone; pale blue eyes; red lips. A red ruff at the throat,
a fitted blue gown. 10/10. Idle: she straightens her goods, squares each box, folds her hands.

**Where.** A flea-market table in Central Park, along a path, under a red parasol: a blue cloth; a black speaker box with a
grinning skull face; a tray of jam biscuits; rows of small black boxes with red labels; a dried tentacle root on a black box; little
brass bells under glass. Night: two candles in jars on the table.

**Wares.**
| item | name | value | does (on another player or a character, used near them) |
|---|---|---|---|
| `curse_rain` | RAIN CLOUD | 20 | a little cloud drone follows them and rains on them for 2 minutes |
| `curse_itch` | THE ITCH | 10 | they stop and scratch every so often, for 2 minutes |
| `curse_hic` | HICCUPS | 8 | they hiccup and hop now and then, for 2 minutes |
| `genseng` | GEN-SENG ROOT | 25 | plant it in your garden: it sings opera at dawn and dusk |
| `skullbox` | THE SKULL BOX | 45 | placed by your door: it shrieks at anyone but you who comes in |
| `biscuit` | JAM BISCUIT | 2 | edible |

**Talk.** "Someone's wronged you. I can tell." / WHAT DO YOU SELL? / IS IT LEGAL? ("Annoying is legal.") / GOODBYE.

**Touches.** Items + a new `curse` property (what it does, how long), resolved once for players and characters (ONLINE sends it), the
weather's rain (the cloud), the garden, your apartment's door, the park.

## 7. THE APPRAISER: the eye in the bubble (queued 28 Oct 2026)
**Who.** A giant eye that lives in a glass bubble of its own air (Bible: visitors who carry their own atmosphere), riding on a hired human
porter whose head is inside the bubble's base. It's a cousin of the exchange machines' eyes: it sees what anything is worth.
**Body.** A clear bubble 1.5 m across, its reflections sliding as he walks; inside, a white eyeball with a pale blue iris and a deep pupil,
ringed by rust-red fleshy spines that drift like a sea anemone. Under it, a porter's legs in jeans and white sneakers. Total 13/10.
**Where.** Walks Market St at midday through the crowd. **Wares:** `monocle` THE SECOND LOOK (55; worn on eyes: shows what hides:
ghosts without their sheets, the ivy security, camouflaged frogs). **Buys anything** at its value (a walking exchange) and tells you the
value of what you carry (APPRAISE). **Talk.** "I see it. I see what it's worth. I see you." **Touches.** the `reveal` grant, worn
eyes, everything with a value, hidden things.

## 8. THE BLOCK: colour, paint, doors (queued 28 Oct 2026)
**Who.** A robot covered in coloured cube tiles that slowly change colour as he walks (Wiki: "Block Color Bot"). Sells nanobot spray paint.
**Body.** A grey steel box head with two stubby studs on top, a round lens eye, a row of dot holes for a mouth, side boxes for ears; a black
torso and segmented arms clad in scuffed coloured tiles (red, pink, yellow, blue, green, white, black), some cracked; a woven patterned
waist. 11/10. Idle: one tile at a time changes colour.
**Where.** A cart of spray cans under a striped awning on Market St. **Wares:** `spray` NANO SPRAY (12; recolour what you wear, or
your apartment's walls), `spraydoor` DOOR IN A CAN (30; spray it on any wall: a door home, once, it fades). **Talk.** "Hold still. You'd
look better in teal." **Touches.** looks (the designer's colours), the apartment's walls, a go-home way (one path: the apartment's ROOMS.enter).

## 9. THE BALLOON WITCH: balloons and lace bats (queued 28 Oct 2026)
**Who.** A tiny witch (Wiki: "Dark void witch black balloon"), 3/10, who never touches the ground: her black balloon carries her. Her
familiars are the lace bats (the bat picture), bats of lace-thin skin from a dim world, light as paper.
**Body.** All black, a wide pointed hat, a cloak to her feet, little gloved hands out like wings, small black boots dangling; her
balloon glossy black on a white curling ribbon. The lace bat: a white, see-through web of veins for wings, pointed ears, two dark eyes,
a fuzz of a body, glowing a little under street lights.
**Where.** Drifts over Market St's crosswalks by day; at night the night market. **Wares:** `balloon` BLACK BALLOON (15; held: you
fall slowly and jump higher, until it pops on a branch), `lacebat` LACE BAT (40; a pet that circles your head at night and snaps
up moths). **Talk.** "Up is easy. Down is the trick." **Touches.** held gear (a `lift` grant), the jump and falling, pets, the night market.

## 10. THE RADISH: off-world seeds (queued 28 Oct 2026)
**Who.** A white radish spirit (Wiki: "Umbrella Radish Spirit Suitcase"), round and soft, with his leaf as an umbrella. He sells
the vegetables of other worlds out of a red suitcase. The tomato sells Earth's; he sells only off-world ones (owner's rule: you trade
merchants for off-world things).
**Body.** 4/10, a white radish body with soft ridges and a few black specks, black dot eyes, a small open pink mouth, stubby arms
and toes; a red leaf umbrella from the top of his head. A red hard suitcase open beside him, packed with veg and plastic packets; a blue
crate of empty orange trays.
**Where.** The Hudson railing by the quay. **Wares:** `seed_star` STAR CUCUMBER, `seed_sun` SUN PEPPER, `seed_hum` HUMMING BEAN
(each 6, off-world seeds for your garden; they grow into veg the tomato won't buy but the radish will). **Talk.** "Fresh from far away!"
**Touches.** the garden, items (`offworld`), the radish buys what they grow.

## 11. THE TIGER: jackets and shades (queued 28 Oct 2026)
**Who.** A tiger in denim and studs, cool as anything, by the lake. Fashion is one of Earth's best exports (Bible); he buys it in
bulk and sells it back.
**Body.** 11/10, orange fur with black stripes, a white muzzle and long white whiskers, a pink nose; green-lensed sunglasses on a
studded black leather band; a shiny dark blue denim jacket, a studded leather strap across his chest.
**Where.** Leaning on the lake's railing in Central Park. **Wares:** `jacket_denim` DENIM JACKET (35, worn body), `jacket_stud`
STUDDED JACKET (60), `shades` SHADES (20, worn eyes: no glare at noon). **Buys** clothes. **Talk.** "Nice. No. Let me fix that."
**Touches.** worn gear on the Walker, looks, the sun's glare.

## 12. SONIEE: the escaping bottles (queued 28 Oct 2026)
**Who.** A mint-green vending machine (Wiki: "Soniee 3 bottles, always trying to escape"). Its three bottles are alive: fuzzy drink
creatures who plot their escape every time you buy one. The machine itself never speaks; the bottles never stop.
**Body.** A mint machine speckled with paint, a round sticker 06, SONIEE in teal on a yellow splash, a chrome tap and coin plate; in its
window, a pink fuzzy bottle (big grin), a white one (pink cheeks, lashes), a teal one (smirk, a bit of white in its teeth).
**Where.** The subway platform. **Wares:** `soda_pink` (4; run faster for a minute), `soda_white` (4; stamina full), `soda_teal`
(4; +20 s breath). Each one you buy may hop out and run: catch it before it gets away. **Touches.** edible items (`edible`, `breath`,
speed and stamina), a small chase, the platform.

## 13. THE ALL-SEEING CACTUS: plants that watch (queued 28 Oct 2026)
**Who.** A cactus with one great green eye (Wiki: "All seeing"). It never sleeps and remembers everyone it sees.
**Body.** 3/10 on a crate: blue-green spiky lobes with brown spines, a big wet eye with a green iris and pink lids, lashes of spines.
**Where.** A plant stall on Market St's sidewalk, red planters and terracotta pots of cacti (shared with THE BONSAI). **Wares:**
`cactus_eye` WATCH CACTUS (35; put it in your apartment: it tells you who came in while you were out), `cactus` CACTUS (5). **Talk.**
"..." (it only stares; a card on the crate says THE CACTUS SEES). **Touches.** your apartment, ONLINE (visitors), placeable things.

## 14. THE STUMP: stories and the root tunnels (queued 28 Oct 2026)
**Who.** An old tree being (Wiki: "Story Tree Stump" and "Tree Tunnel Network Merchant"). The trees' roots join under the city into
tunnels to the subway; he sells the way through them, and tells stories for free.
**Body.** 6/10, his head the top of a cut trunk, bark ridged, a wrinkled grey-brown face, round black glassy eyes, a big nose, a
pointed ear, grey tufts; a rust-red clay-pot body with metal leaf ornaments, a key and charms on a chain; grey knobbly hands; an iron
lantern with a flame beside him on a stump table.
**Where.** Central Park, a big stump at a crossing of paths. **Wares:** `rootpass` ROOT PASS (10; step into any tree marked with his
lantern knot, come out at another: the park, Market St, the Hudson, the station). **Talk.** "Sit. Once, before the city..." (a story, a
new one each day). **Touches.** a shortcut network (one mechanic, shared with THE OTTER's manholes), the trees, FADE.

## 15. THE BLUE HOUR: buyer of bad feelings (queued 28 Oct 2026)
**Who.** A skeleton-like being in a blue hood (Wiki: "Buys your soul, but only if you believe it"). His kind eat bad feelings. Nothing
supernatural: an emotion-harvesting tech in his chest. He comes out only at night and buys your sour moods.
**Body.** 10/10, a pale blue-white skull face with deep eye holes and a little eye in one, wrinkled at the brow; long neck tendons;
open ribs; grey knotted hands clasped; a big soft cobalt hood and robe; a cigarette in his teeth. Idle: leans, blows smoke, looks
in the window.
**Where.** At night, leaning by a corner shop's window in the night market, under its flickering tube light. **Buys** `sour`
SOUR FEELING (a thing you're left with when you die, lose a fight, get cursed or rained on; worth 2 to 10). **Talk.** "Bad day? I'll take
it off your hands." **Touches.** death, the brawl, the curses, rain, the night market, an item made by events.

## 16. THE BROADCAST: experiences on tape (queued 28 Oct 2026)
**Who.** A woman with a TV set for a head and her face on the screen (Bible: experiences sold as objects, each someone else's
memory). She records them and plays them back.
**Body.** 10/10, a cream plastic TV box with her pale face filling the screen, studded with silver dots, green eyes, red brows and
lips; five wire antennae with coloured balls, a black speaker disc on each side; a cord down her neck; a moss-green sleeveless dress
with a ruffled collar.
**Where.** Central Park, by the bandstand. **Wares:** `tape_pigeon` A PIGEON'S MORNING, `tape_dragon` A DRAGON OVER THE RIVER,
`tape_taxi` A TAXI AT NIGHT (each 12): watch it and for 30 s you see through their eyes, flying or driving the real map. **Talk.** "Wanna
be someone else for a minute?" **Touches.** the camera (a flight path), the map, FADE.

## 17. THE OTTER: deliveries and manholes (queued 28 Oct 2026)
**Who.** A masked otter courier in a beret. He knows every drain, and he runs the street's deliveries.
**Body.** 7/10, pale brown fur, a slate-blue felt mask over big black eyes, a slate beret, a slate scarf high on his neck; a fuzzy brown
coat with big buttons and badges, a canvas strap across him to a satchel.
**Where.** By the subway stairs on Market St. **Gives work:** parcels to carry across the city for pay (the jobs). **Wares:** `manhole`
MANHOLE KEY (8; drop down any drain, come up at another; the same shortcut mechanic as THE STUMP's roots). **Talk.** "Got a run if you've
got legs." **Touches.** the jobs, the drains, the mail, shortcuts.

## 18. THE REEL KID: movies not made yet (queued 28 Oct 2026)
**Who.** A kid of some kind in a pink furry cat hood and pink sunglasses, sitting on stacks of film canisters (Wiki: "Selling movies not
yet made yet": some films are constants across the galaxy).
**Body.** 5/10, a smooth tan face with a sly smile, brown fringe, a fuzzy pink cat hood with ears, big pink glasses pushed up on it;
a fuzzy brown-grey sweater, gloves, arms folded on the canisters.
**Where.** The Hudson pier, among stacked, labelled film tins. **Wares:** `reel` A REEL (10; a film from the future: take it to the
cinema and it plays, or watch it on your TV). **Talk.** "This one comes out in '94. Good ending." **Touches.** the cinema's screen,
the apartment's TV, the pier.

## 19. THE BAGGER: bags that walk (queued 28 Oct 2026)
**Who.** A yellow fuzzy creature with a backpack (Bible: bags at the market are alive). He rents and sells living bags.
**Body.** 5/10, round, shaggy yellow fur, small dark eyes, a little smile, stubby arms and feet; a mauve backpack with a yellow window
on his front, straps over his shoulders.
**Where.** Walks Market St. **Wares:** `bag_walk` WALKING BAG (50; it follows you and carries 10 more things), `bag_guard`
GUARD BAG (80; guards your things: if you die you keep them). **Talk.** "Heavy? Let it walk." **Touches.** the pack, death, a follower.

## 20. THE SECONDHAND GHOST: lingering things (queued 28 Oct 2026)
**Who.** A ghost shopper (Bible: travellers out of phase, who can't carry goods but love to trade) in a bucket hat, round glasses and
a tote. He trades in ghosts of things.
**Body.** 5/10, a soft white sheet-body with little white feet and an arm, a grey felt bucket hat, round wire glasses, a tan paper tote.
**Where.** Ghost Street. **Trades:** give him a thing and he gives back its ghost: a pet that lives in your apartment and follows
you there (a donut's ghost, a sock's ghost); it leaves a note one day and goes. **Touches.** Ghost Street, the apartment, pets, the
items' `ghost` setting (the owner decides which things can become ghosts).

## 21. THE JELLYCAP: glowing mushrooms (queued 28 Oct 2026)
**Who.** Someone whose head is a translucent jelly mushroom in a bubble (Wiki: "HoloMushroom Merchant", "Muffshrooms"). It glows
amber at night.
**Body.** 10/10, a clear wet dome full of drops, a glowing amber cap with its gills hanging inside, a ribbed rim; a beige knit neck
gaiter for a neck; a tan trench coat, a strap.
**Where.** Market St at night by the movie theatre, with a tray. **Wares:** `muffshroom` MUFFSHROOM (6; eat it and you glow for 5
minutes: light to see by), `holocap` HOLO-CAP LAMP (25; a lamp for your apartment). **Touches.** edible items, the `light` grant (timed),
the apartment's lights.

## 22. THE BONSAI: trees that grow (queued 28 Oct 2026)
**Who.** A bonsai creature with a mop of blonde curls and a little orange scarf, part of her own tree. Bonsai are one of Earth's most
valued exports (Bible).
**Body.** 3/10, mossy green skin, dark eyes, a sweet smile, her arms turning into branches with pale leaves; she grows from a twisted
trunk in a red-brown glazed pot.
**Where.** The plant stall on Market St, beside THE ALL-SEEING CACTUS. **Wares:** `bonsai` BONSAI (20): water it every day and it grows
over real days; a bigger one is worth more (she buys them back). **Talk.** "Patience. And water." **Touches.** placeable things,
saved growth (server side), value that changes.

## 23. THE OPERATOR: calls to anywhere (queued 28 Oct 2026)
**Who.** A pale blue horned demon on the phone (Wiki: "Blue demon with orb: see anywhere for 5 minutes, except your ex's house").
You don't go anywhere; you see.
**Body.** 11/10, pale blue cracked skin, four ridged ivory horns, pointed ears, black eye holes, bared teeth, beads and a flower crown
on his brow; dusty white robes, bead necklaces, carved bone medallions; a light blue phone at his ear.
**Where.** West St's third blank shell (`shell5`): a narrow phone shop. **Inside:** handsets on every wall, coiled cords hanging, a
switchboard of jacks and blinking lamps, dust on the white robes hung by the door. **Wares:** `call` A CALL (15): pick a place on the
map and see it live for 5 minutes. **Talk.** "Who are we calling? Not her. I won't." **Touches.** the camera, the map, `ROOMS.off`.

## 24. THE WANDERING CAP: chunks of earth (queued 28 Oct 2026)
**Who.** A mushroom gnome hiking the city (Wiki: "Mushroom merchant sells chunks of earth"). He collects soils from all over and sells
them back to grow better mushrooms.
**Body.** 4/10, a big red-orange mushroom cap with white flecks, a long white beard under it, no face seen; a tan jacket and cargo trousers,
red-orange gloves and boots, a khaki backpack.
**Where.** Walks Central Park's paths. **Wares:** `soil_moss` MOSS LOAM, `soil_ash` ASH EARTH, `soil_deep` DEEP CLAY (each 8): put
it on a lawn and that patch grows a certain kind of mushroom. **Touches.** foraging and mycology (the grass decides the mushrooms), the lawns.

## 25. THE WATCHMAKER: time (queued 28 Oct 2026)
**Who.** A small grey gremlin in tweed with a pocket watch (Wiki: "sells time, can slow down time"; Bible: personal time-dilation tech).
**Body.** 5/10, wrinkled grey skin, big amber eyes, big pointed ears, a crust of blue-green moss for hair; a brown checked tweed coat; a
cigarette; a brass pocket watch in his hands.
**Where.** Leaning on the bank's column on Market St. **Wares:** `watch` POCKET WATCH (70; wind it and for 10 s the world slows
around you: butterflies, fish and fights; for others you just seem fast). **Talk.** "Time? I've got some. Not much." **Touches.**
your speed (a timed grant), the butterflies, the fights, ONLINE.
