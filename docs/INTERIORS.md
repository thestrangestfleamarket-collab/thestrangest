# Interiors plan (owner, 4 Nov 2026: "go with your recommendations, start the groundwork, finish through")

Every interior done the way the diner was: what a real one has, a non-human worker, patrons who come and sit or stand somewhere sensible, something for the player to do, then shots from every angle and a logic pass. One pull request per interior.

**Nothing just for show** (owner, 4 Nov 2026): every added thing is usable: a small game in the minigames' window (`MINI`, `GAMES`), a close-up (`MINI.look`), a counter or machine that sells (`IKIT.buy`, a worker's shop), a seat, a radio (`RADIO.src`).

Not in this plan: the pub (shelved with the forest guardians, 30 Oct) and the six switched-off places.

## Step 0: groundwork (one pull request, before any interior)

1. **Seats and work spots everywhere.** Today only the off-map rooms (the diner and the merchant shops) can list seats and staff spots. The bar, both museums, the bank, the theatre and the cave cannot, so their staff stand at random spots that land inside counters, pool tables, gold, or on the street block. One change lets every inside list them.
2. **Fix staff who are never seen.** The Museum of Earth's and the Art Museum's staff are placed on the solid street block. The Bath House staff vanish at the door, because their code still looks for the room under its old dojo name.
3. **Reasons to visit.** Townspeople only go to the bar, the arcade, the bodega and the diner on their own time. New habits: museum, art, movies, playhouse, bath. They go in the habit lists in `data/lives.json`, so nobody else's day reshuffles. The server runs the same lives file.
4. **More things to sit on.** Recliners, theatre seats and benches become sittable for players and patrons.

## The interiors

| # | Interior | Non-human worker | Add | Patrons | Player mechanic |
|---|---|---|---|---|---|
| 1 | **Bodega** | the Fox (already there) plus a bodega cat on the counter | deli counter and slicer, coffee urn, ice chest, bulletin board, milk crates out front; spots for the counter and stock clerk | lunch crowd stands in the aisles and queues at the register | pay at the register for what you pick up; scratch lottery tickets |
| 2 | **Bar** | the octopus drummer stays; a badger barkeep | taps and kegs, register, ice well, glass racks, liquor shelf | drinkers on the 5 stools and 2 armchairs; standing spots at pool and darts | order a drink (lifts mood/stamina); playable pool and darts |
| 3 | **Museum of Earth** | an owl night guard; a pangolin collections keeper | ticket desk and turnstile, plaques you can read, rope barriers, benches, gift shop, a tank gallery (the octopus-tank kit exists; the tank keeper has no tanks today) | visitors stroll exhibit to exhibit and sit | the finds you donate go on show in a case with your name |
| 4 | **Bank** | a rat teller at the cages | needs your call (below) | customers queue at the cages | an account that keeps your cash (saved on the server) |
| 5 | **Art Museum** | a red panda docent who leads the tours | ticket desk, guard posts, sittable benches (no casts, café or gift shop, owner 5 Nov 2026) | visitors stop at paintings and sit on benches | a guided tour where the docent walks with you |
| 6 | **Movie Theatre** | the ticket fox (already there) plus a raccoon at a concession stand | concession counter (popcorn, soda, candy) by the box office, ticket podium, bins, aisle lights | moviegoers arrive at showtimes and take recliners | buy popcorn; sit in a recliner to watch |
| 7 | **Arcade** | a small robot (the Block's kind) at a prize counter | change machine, prize counter and wall, claw machine, skee-ball, stools, soda machine; staff kept out of the holodeck | the arcade crowd plays and watches at the cabinets | tickets from games, traded for prizes |
| 8 | **Playhouse** | a skeleton stage manager at the prompt desk | working box office and bar, ushers with programmes, cloakroom | an audience fills seats before each show and applauds (capped, about 60, for cost) | buy a ticket; a drink at the interval |
| 9 | **Bath House** | a cloth-ghost attendant (the Bedsheet) at a small front desk | needs your call (below) | bathers on benches | pay for a soak and a towel: faster healing |
| 10 | **Your apartment (hall only)** | a building super: the cat or a cloth ghost | mailboxes (your letters arrive there), door numbers, notice board, radiator, extinguisher | other players visiting | a doorbell or knock to let a visitor in |
| 11 | **Boardwright** | the Boardwright stays; a squirrel apprentice | the spec's missing props (swaying decks, chalk sketches, photo, cracked mirror, 1985 calendar, mat), wax and grip bench, staff spots | browsers at the wall, a bench | tune a deck at the bench (grain sets the lift) |
| 12 | **Fix-It** | the Fixer robot and the little one (already there) | the spec's wares (walkman, handheld game, pocket TV), magnifier lamp, screw jars, waiting bench, drop-off counter, staff spots | customers waiting with broken sets | repairs: a broken find plus parts becomes something worth more |
| 13 | **The Scanner** | a myna bird on a perch that repeats police chatter (as words, no sound) | counter with a glass case, repair bench, call-sign cards, ON AIR light, aerial | browsers, a listening stool | sit at the listening stool to follow the police calls; buy a tip (a rare spot on your map for the day) |
| 14 | **Golems' Cave** | one golem as appraiser at the trading stone | sleeping alcoves, sorting table, assay scale, ore cart on rails, crystal lanterns, a cutting wheel | golems sit round the fire at night | cut and polish gems for a better price; carrying gems keeps the guards calm (fixes "they trade and attack") |
| 15 | **Squirrel's Tower** | the squirrel knight (already there) | needs your call: it has no inside today | none | a spyglass on the roof; his lookout marks things on your map |

## Your calls (taken as recommended, 4 Nov: the first option each; Squirrel's Tower: yes, his own tower; Playhouse: they run the foyer and bar; Bar: the crooner becomes the host; sound: none; workers as listed)

1. **Bank.** You asked on 30 Oct for a dungeon with the dragon's head and gold. (A) a teller hall at the front, the hoard behind a vault door; (B) keep it as it is, only fix the staff.
2. **Bath House.** You ruled on 28 Oct it stays empty and full of steam. (A) keep it empty: fix the staff, add the ghost's front desk and a few benches; (B) a full bathhouse (shoe lockers, washing row, soaking tub). The "pool lifeguard" job needs a new title either way.
3. **Squirrel's Tower.** Build an inside (a round guardroom up to the roof), and which of the three towers?
4. **Playhouse staff.** Its seven cabaret and mariachi workers don't match the Midsummer company. Do they give a pre-show act in the foyer, or run the bar?
5. **Bar.** The crooner's title (sings Fri/Sat) clashes with "the octopus is the only act" (30 Oct). Keep, retitle or move?
6. **Sound.** Nothing makes sound (19 Oct rule), unless you say otherwise.
7. **The non-human workers above.** OK as listed, or swap any?

## Order

Groundwork first, then the ones people already visit: Bar, Arcade, Bodega, Theatre. Then Museum of Earth, Art Museum, Fix-It, Boardwright, Scanner, Playhouse, Golems' Cave, apartment hall. The Bank, Bath House and Squirrel's Tower come after your calls.
