# DEAD AIR — design

The overnight shift at a small-town AM station, 1985. Stay on the air from midnight to 6 AM. Something out there listens, phones in, and comes closer every time the station goes quiet.

Its own page (`/deadair`), in a headset or on a screen. It shares no code with THE MARKET. This is a draft for the owner: nothing here is decided.

---

## 1. Why the rules hold together

- **The story is the rule.** On 9 Nov 1965 the station's overnight host, Ray Dunmore, went silent mid-show. There were 41 minutes of dead air, and he was never found. Whatever he became wants back on the air. **Silence is an open mic to it**, so dead air draws it in and a steady broadcast holds it off.
- **It knows only what it senses.** It hears the broadcast, which every radio in town carries, and the noises the building makes. It sees what's visible from where it stands. It never knows where you are unless it heard or saw you there.
- **Everything you do costs time.** A record runs out. Every trip out of the booth is a gamble against the record you left spinning.

---

## 2. The night (one level)

| | |
|---|---|
| Game clock | 00:00 → 06:00 |
| Real time | about 18 min (1 game hour = 3 real min) |
| Win | Still on the air at 06:00, when the morning host, Gail, unlocks the front door. |
| Lose | It gets into the booth. The broadcast cuts to its breathing, the town hears it, and you retry the night. |

**Every hour:**
- At the top of the hour you must play the **station ID** cart (an FCC rule, and the game's rule too). A missed ID adds Attention, and it's the moment it most likes to call.
- Each hour has 1–2 **tasks** that send you out of the booth: a tripped breaker, an unlocked door, the next crate of records, coffee, the transmitter.

---

## 3. Systems

### 3.1 The broadcast (what's on the air)
There is one on-air bus with several sources:

| Source | What it does |
|---|---|
| **Mic** | Your real voice: speech recognition in the browser, else Whisper (as in THE SPECKLED BAND). Talking on air counts as broadcast. |
| **Deck A / Deck B** | Records, 60–150 s each (radio edits). Cue one up while the other plays. |
| **The long LP** | One 18-minute side, **once a night**. It's the only safe long trip. |
| **Cart machine** | Ads, PSAs and the station ID, 15–30 s each. |
| **Phone to air** | Put a caller on air. That counts as broadcast, but the whole town hears them, and so does it. |

- **Dead air** is 4 s with nothing on the bus. Every extra second adds **+3 Attention**.
- The **VU meter** and an **ON AIR** lamp are always in view. In VR the lamp is your timer.

### 3.2 Attention and Position (the threat)
It has two numbers:

- **Attention**, 0–100: how much it wants in. It decays −1 every 5 s while the broadcast is steady and you're talking or playing.
- **Position**: a node on its path (§4.3). It may move one node whenever Attention passes 25, 50, 75 or 90, and once each game hour anyway on night 3 and later.

| Adds Attention | |
|---|---|
| Dead air | +3 per second past 4 s |
| A missed station ID | +15 |
| Noise it can hear from where it is (a dropped crate, a slammed door, running in the hall) | +5 to +20 |
| Lying on air about something it can see ("all locked up here, folks" while a door it's watching stands open) | +10 |
| Hanging up on it | +10, but see §3.3 |

| Takes Attention away | |
|---|---|
| Playing a song it requested | −10, but it learns how long you'll be busy |
| Correctly blocking its line | −20, and it's pushed back one node |

**At the booth door** it stops sneaking. It knocks, it talks, and it imitates people you trust. You lose only if you open the door, or if it reaches 100 Attention while it's there.

### 3.3 The phone (five lines)
- Lines light up and you pick up. On air or off air is your choice.
- Callers are **regulars**, **strangers** or **it**.
- **Tells:** it slips by knowing what's visible from its node ("nice red jacket", "your hall light's out") or by getting a regular's facts wrong.
- **Verify:** ask a regular something only they know (§5). You learn those facts on nights 1–2.
- **BLOCK** a line by flipping the switch under it:
  - If it was it: −20 Attention, it goes back one node, and it can't call for one game hour.
  - If it was a regular: that regular is gone for the night, and so are their warnings.

### 3.4 The building (things you leave the booth for)

| Thing | Where | What goes wrong |
|---|---|---|
| Breaker panel | Back hall closet | Breakers for HALL LIGHTS, LOT LIGHTS, MONITOR and PHONES trip. |
| Front and back doors | Lobby, loading door | Deadbolts. It can try them, and on some nights someone left one open. |
| Record library | Production room B | The crate in the booth runs out every 2 game hours. |
| Coffee | Break room | Skip it after 03:00 and the screen and audio start to drift (a soft penalty). |
| Transmitter | The shack under the tower, 60 m out in the field | Night 4 only. Off the air means dead air for everyone. |
| Manager's office | Front | The only phone that reaches the police, who take 40 game minutes to come and scare it back one node. One call per night. |

Lights matter. It won't stand in a lit hall, but a lit hall also shows you to anyone at the lobby glass.

### 3.5 You
- **VR:** seated or room-scale in the booth; in the hall you move by stick or teleport. Your hands work the decks, the carts, the phone and the locks.
- **Screen:** mouse to look and click, WASD in the hall.
- Your footsteps and doors make sound events with a loudness. Walking is quiet, running is loud.

### 3.6 Its mind (Claude Haiku)
- **It is sent:** the night, its node, the nodes it may move to, its Attention, the last 60 s of the broadcast as text, recent sound events it could hear, and what's visible from its node.
- **It is never sent** your position.
- **It returns** `{move: node|stay, call: line text|none, as: "self"|regular_id}`.
- The page checks it: no illegal moves, and an impersonation is only allowed from night 3.
- Without the network, the same choices come from a rule table (its instinct).
- Regulars also speak through Haiku, each from a fixed sheet of facts they must not contradict.
- Cost: about 30–50 short calls a night, login only (`worker/deadair.js`, POST `/deadair/talk`).

---

## 4. Maps

### 4.1 The station (one storey, about 22 × 14 m)

```
            FIELD ── 60 m ──► [TRANSMITTER SHACK + TOWER]
  ┌───────────────────────────────────────────┐
  │ LOADING / BACK DOOR      BREAKER   RESTRM  │
  │      │                   CLOSET      │     │
  │──────┴────────── BACK HALL ──────────┴─────│
  │  PROD. ROOM B    │  ON-AIR   │ BREAK ROOM  │
  │  (record library)│  BOOTH ◄──┤ (coffee)    │
  │                  │  (window  │             │
  │                  │  to lot)  │             │
  │──────────────── FRONT HALL ────────────────│
  │  MANAGER'S OFFICE │  LOBBY + RECEPTION     │
  │  (police phone)   │  (glass front door)    │
  └───────────────────┴────────────────────────┘
        PARKING LOT (2 lamps, Gail's space)
        ─────────── ROUTE 9 ─── PAYPHONE ───
```

### 4.2 What you can see from the booth
- The **booth window** looks over the lot.
- The **security monitor** cycles between the lot, the lobby and the back door. It's one CRT, and it goes dark if its breaker trips.
- The **booth door** has a narrow wired-glass slit onto the back hall.

### 4.3 Its path (the nodes it walks)

```
ROAD → PAYPHONE → LOT ─┬─► FRONT GLASS → LOBBY → FRONT HALL ─┐
                       ├─► BOOTH WINDOW (watch only)          ├─► BOOTH DOOR
                       ├─► TOWER FIELD → SHACK                │
                       └─► BACK LOT → BACK DOOR → BACK HALL ──┘
```

- It needs a door unlocked, or a long enough wait, to get from outside to inside.
- A locked door holds it for one stage. It rattles it, which is a loud sound event you can hear.
- From each node it sees particular things, and those are the tells it can drop on the phone.

---

## 5. Characters

| Who | Role | Calls | Useful for | Their test fact |
|---|---|---|---|---|
| **You** | New overnight host, first week | — | — | You pick your on-air name. |
| **Dolores Fenn**, 71 | Widow, same request every night | 01:15 sharp | Her punctuality is itself a tell: a "Dolores" at 03:40 is it. | Her cat is Biscuit. |
| **Hank "Big Wheel" Ortiz** | Trucker on Route 9, calls from his CB patch | 02:00–04:00 | Sees the lot from the highway: "someone's at your back door." | Hauls frozen peas, out of Joplin. |
| **Teddy Marsh**, 14 | Should be asleep; owns a police scanner | Any time | Relays police dispatch, so you know if a call to the police is coming. | His dog is "Sergeant." |
| **June Okafor**, RN | Night shift in the county ER | Breaks, every 2 h | Calm. Knows the 1965 story and gives clues to the ending. | Starts each shift with a coffee from Bert's. |
| **Lyle** | Conspiracy caller | Random | Half his rambling is true, half is noise. | None: he's never imitated. |
| **Mr. Pruitt** | Station manager, drunk at home | You call him | Knows where the 1965 tape is, if you can get it out of him. | — |
| **Gail Reyes** | Morning host | Arrives 06:00 | The win. On night 5 a "Gail" knocks at 05:20. | Drives a yellow Beetle. |
| **It / Ray Dunmore** | The 1965 host | — | Charming, then wrong | Knows the station better than you. |

---

## 6. Levels (five nights, one new thing each)

| Night | What's new | It may |
|---|---|---|
| **1 · Sign-on** | Decks, carts, the ID, the phone. One tripped breaker. | Only call, from the road and the payphone. It never comes closer. |
| **2 · The lot** | Hall trips, the monitor, your first tell, BLOCK. | Reach the lot and the booth window. |
| **3 · Someone left it open** | The back door is unlocked when you arrive. Impersonation begins (Dolores first). | Reach the back hall. |
| **4 · The tower** | At 03:00 the transmitter trips: go out to the shack. The long LP matters now. The police phone. | Use every node. |
| **5 · Storm** | Rain, a power cut at 02:00 (generator: half the breakers), and a knock from "Gail" at 05:20. | Everything, and it starts nearer. |

**Endings (night 5):**
- **Dawn:** you survive. It's still out there, and it will call again tomorrow.
- **Sign-off (true):** you found the 1965 tape (Pruitt gives you a clue on night 3, June on night 4, and it's in Production B) and you **play it on air**. Ray hears his last show finish, the knocking stops, and the dead air ends.
- **Open mic (bad):** you give it the mic. You open the door, or put its line on air during the last hour. The station keeps broadcasting in your voice. You aren't the one speaking.

---

## 7. Co-op (later, optional): THE LISTENER
- A second player joins `/deadair?room=code` as a listener at home in town. They hear your broadcast about 2 s late.
- They have a window, a phone and a scanner. They see things you can't, like a car with its lights off or a shape on the roof, and they can call your line 5.
- The catch: it can call **them** pretending to be you, and call you pretending to be them. The two of you agree on a code word off air.
- Rooms use a `DeadAir` Durable Object in `worker/door.js`, like `Jam` and `Laser`.

---

## 8. Score and saves
- **Listeners** is the score. It goes up for steady talk, good segues and calls put on air; down for dead air and missed IDs.
- The night you reached, your best listener count and which endings you've seen are saved through POST `/deadair/save`, like `/zombie/save`.

## 9. Build shape (cost)
- `src/deadair/` holds the page, `room.js` (the station), `air.js` (the bus, records and carts), `phone.js`, `it.js` (nodes, Attention, its instinct) and `cast.js` (the regulars' fact sheets).
- `tools/deadair.cjs` bundles it into `dist/deadair.html`, and `data/deadair/` holds the records, carts, phone static and room tone. The music has to be ours or free to use.
- `tests/deadair.cjs` plays nights 1 and 4 with Haiku off, then again in an emulated Quest 3.
- It's cheap to draw: one building, one lot and a field. Most of the work is in the sound and the callers' sheets.

## 10. Questions for the owner
1. Is it horror only, or should a calmer "just DJ" mode be possible too?
2. Do you speak by voice only, or can you also pick lines from a menu, for players without a mic?
3. Is co-op in from the start, or added later?
4. Does it become a holodeck program in THE MARKET (`146bf-hollow.js`)?
5. The call letters: they need checking so they aren't a real station's.
