# Merchants queue

The owner's merchants, one per picture, queued until he says go (owner, 28 Oct 2026: "dont start building yet, just queue them").
Standing picks for all of them (28 Oct 2026): Claude places each one where it fits best (a half-size bodega, food cart, food truck,
a boat on the Hudson, a table by the Hudson, walking Central Park...); each gets its own body matching the picture, mockups first.
Every one goes through the one path: `makeNPC` + a home, `characters.json` (`trade`, `talk`), items in `items.json`, an inside
off the map in `ROOMS.off`.

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
