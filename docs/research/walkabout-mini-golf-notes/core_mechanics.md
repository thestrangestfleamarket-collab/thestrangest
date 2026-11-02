# Walkabout Mini Golf (Mighty Coconut) — core gameplay mechanics

Research note on method: in this session every WebFetch to an outside host (mightycoconut.com, support.mightycoconut.com, steamcommunity.com, store.steampowered.com, uploadvr.com, voicesofvr.com, fandom.com, meta.com, reddit.com, psnprofiles.com and others) was refused by the network allow-list, so every finding below comes from web-search result snippets of those pages, not from reading the full pages. Quoted wording is as returned by the search engine. Where snippets conflict, both are given. Dates: the game launched on Quest in Sept 2020, Steam 15 July 2021, PS VR2 later; the newest facts here are from the 6.8 update / "Escape from Planet Xylodon" course of 8 Oct 2026.

## 1. How putting works physically (controller as putter, swing tracking, hit detection, ball physics, feel)

### Takeaway
The putter is the (one) tracked controller: there is no power meter in VR — the ball's speed and direction come from the speed and angle of the real arm swing, with a user-set "Strength" multiplier (default 50%). The putter head is only "live" (solid to the ball) under conditions that prevent accidental hits: either while the grip is held ("Grip To Putt") or, without that option, only while you are looking at the ball. Shaft length follows posture automatically. The studio says it "obsessed over the physics" (Unity + PhysX plus custom systems, per one wiki), recorded real ball-rolling sounds per surface, and keeps haptics light.

### Cited Findings
- Physics model: "the game's physics translates the speed and angle of a real arm swing into the ball's motion"; a studio developer described the game as "built in Unity with the PhysX physics engine and additional custom systems layered on top" (single wiki source, unconfirmed) — [VR & AR Wiki](https://vrarwiki.com/wiki/Walkabout_Mini_Golf)
- Only one controller is used: "Because Walkabout Mini Golf only utilizes one controller, the secondary controller can sometimes cause issues for tracking" — [Mighty Coconut support](https://support.mightycoconut.com/kb/tag/44)
- Developer on physics: in a 2022 email interview Martell said the team "obsessed over the physics of the sport" while a game cannot fully replicate a physical course; he named "the physics of putters, balls, and obstacles as well as the shared social experience" as why mini golf works in VR — [Checkpoint Gaming VR Corner](https://checkpointgaming.net/features/2021/02/vr-corner-walkabout-mini-golf/); [Minigolfnews interview](https://www.minigolfnews.com/?id=13907)
- Sound and haptics tuning (Voices of VR, SXSW, 12 Mar 2025): Martell "recorded all of the original sounds of the ball rolling across different surfaces to capture the tactile feel"; the host recalls "the click being so distinct ... when you're hitting the ball and probably some haptics to give it a little extra kick" — [Voices of VR #1560](https://voicesofvr.com/1560-walkabout-mini-golfs-incredible-fusion-of-worldbuilding-gameplay-social-dynamics-dlc-experimentation/)
- Haptics are deliberately subtle; a Steam thread "Whats with the lack of Haptic Feedback while playing?" complains that hard and soft strokes feel the same and asks for an adjustable haptics setting; replies say the arm conveys the information and that the game does have haptics; no official reply or toggle found — [Steam discussion](https://steamcommunity.com/app/1408230/discussions/0/804593328318443326/)
- The developer said weighted putter accessories "paired with the controller's vibration traveling up the putter shaft, feels amazingly realistic" — [UploadVR, Walkabout started on iPhone](https://www.uploadvr.com/walkabout-mini-golf-steam-iphone/)
- Official weighted accessory: the HelloReal "Grip-to-Putter" combines "the accuracy and realism of a weighted physical putter shaft" with the in-game grip-to-putt setting; the game has a "HelloReal putter preset" and "native Grip-To-Putt integration" — [Mighty Coconut GTP page](https://www.mightycoconut.com/gtp); [MIXED review](https://mixed-news.com/en/walkabout-mini-golf-vr-official-vr-putter-review/)
- Hit detection / accidental-hit prevention, mode A ("Grip To Putt" setting): "The putter head is always visible, yet it only turns solid enough to strike the ball once the grip button is held", which lets you take practice swings through the ball along the shot line — [VR Lowdown tips](https://vrlowdown.com/walkabout-mini-golf-tips/); the fan wiki says pulling the trigger readies the putter and holding it keeps it from timing out, and Grip To Putt "prevents you from accidentally hitting the ball" — [Fandom Game Settings](https://walkabout-mini-golf.fandom.com/wiki/Game_Settings); the devs recommend turning it on (Scorecard > Settings) — [Steam community FAQ](https://steamcommunity.com/app/1408230/discussions/4/3187986750504779517)
- Hit detection, mode B (default, grip-to-putt off): "the putter head deactivates when the player isn't looking at the ball, to prevent accidental putts" (developer blog, early 2025) — [Mighty Coconut: Meta putter glitching](https://www.mightycoconut.com/blog/glitching)
- Putter "Strength" setting: "sets the power of your swing, which goes hand-in-hand with how hard you swing" — [Fandom Game Settings](https://walkabout-mini-golf.fandom.com/wiki/Game_Settings); raising it "makes the ball lighter, in short" (same swing goes farther) — [Steam guide SUPEREASY](https://steamcommunity.com/sharedfiles/filedetails/?id=2812327682); default is 50%, a trophy guide suggests 40% if the ball runs faster than expected and 100% for long shots — [PSNProfiles trophy guide](https://psnprofiles.com/guide/16777-walkabout-mini-golf-trophy-guide); one player says 90% approximates a standard metal putter — [Steam discussion](https://steamcommunity.com/app/1408230/discussions/1/4038101970208952482/)
- Putter length: "continuously variable, so crouching shortens the shaft and standing on your toes lengthens it, while the putter head stays at the proper ball contact height" — [Steam discussion on putter height](https://steamcommunity.com/app/1408230/discussions/1/4038101970208904819/); "the shaft automatically changes length to match your posture" — [Steam guide SUPEREASY](https://steamcommunity.com/sharedfiles/filedetails/?id=2812327682)
- Ball physics special case (Ice Lair, March 2024): "Your ball goes through an ice ray and becomes an ice cube ... This is the first time we're massively changing the physics on the ball" (Martell); meant to make short putts less frustrating; took "a lot of iteration", with hot plates on some holes to melt the ball back — [UploadVR Ice Lair tour](https://www.uploadvr.com/ice-lair-tour-walkabout/); the frozen ball "slide[s] speedily over the ice patches" but "slows down quite a bit on grass" — [PSFanatic Ice Lair review](https://www.psfanatic.com/walkabout-mini-golf-ice-lair-review/)
- Reviewer verdicts on feel: physics "feel enough like the real thing to bring the same joy and frustration as hitting physical balls" — [UploadVR review](https://www.uploadvr.com/walkabout-mini-golf-review/); "the physics are spot on" — [CogConnected review](https://cogconnected.com/review/walkabout-mini-golf-review/); the developer "absolutely nailed the ball physics" — [6DOF Reviews](https://6dofreviews.com/reviews/games/walkabout-mini-golf/)
- Contrast with the phone version: Pocket Edition has a power bar and three putting styles (swipe-and-tap "Standard", gyroscope "Immersive", and a horizontal mode where you physically move the phone), each with its own strength settings — [Mighty Coconut Pocket page](https://mightycoconut.com/pocket)
- Tracking fragility: Meta OS v72 (Jan 2025) "introduced new bugs around hand tracking and player boundaries" that caused putter glitching; workarounds include a bright room, no reflective surfaces, clearing Guardian history, and disabling the experimental "Lay Down" setting; v74 improved Quest 2 — [Mighty Coconut glitching blog](https://www.mightycoconut.com/blog/glitching); [v74 update](https://www.mightycoconut.com/updates/putterglitchos74)
- Hand tracking (Quest only) arrived as "Experimental Hand Tracking" in update 6.8 (8 Oct 2026) — [MIXED](https://mixed-news.com/en/walkabout-mini-golf-planet-xylodon-experimental-hand-tracking-mulligans/); one search snippet names "Swing Mode and Pinch-to-Putt" sub-modes — [UploadVR](https://www.uploadvr.com/walkabout-mini-golf-adds-mulligans-hand-tracking-a-new-dlc-course-today/) — but a second search could not confirm those names.

### Inferences
- The "no power meter / one-to-one" design is implied by every description (swing speed and angle drive the ball; Pocket Edition needed to add a power bar precisely because there is no swing), but no source states the words "one-to-one" or "no power meter" outright.
- Two safeguards (grip-to-putt, look-at-ball gating) show the main tuning problem the devs solved was false hits from a free-swinging tracked head rather than swing-power mapping.
- Strength 50% default plus an adjustable multiplier means the physical swing is scaled, not clamped: a hard swing can still overshoot (hence out-of-bounds exists).

### Gaps
- No developer talk or doc describing the actual algorithm (how head velocity at contact is sampled, any smoothing or velocity cap, rolling friction values, rail restitution). Voices of VR #1560 likely has more detail but could not be read.
- The Unity/PhysX claim is from one wiki without a primary citation.
- No source on how slopes, bumpers or "putter head feel" (face angle vs path) are modelled.

## 2. Rules: strokes, par, stroke limits, scorecard, out of bounds, water, hole/cup, holes per course

### Takeaway
Standard stroke play on 18-hole courses with par per hole shown on a wristwatch; a per-hole "Stroke Limit" (on by default) ends the hole at triple bogey and records a quadruple bogey if you miss that last stroke, and can be turned off in the course scorecard's Course settings tab. A ball hit too hard, into water or off the green is "out of bounds" and respawns (one guide says "in front of you"); no source says a penalty stroke is added. Mulligans (host-set count, default effectively zero) were added 8 Oct 2026.

### Cited Findings
- 18 holes per course: "Each 18-hole course is carefully crafted to replicate the feeling of classic mini golf in a larger-than-life location"; base game includes 14 courses — [Steam store page](https://store.steampowered.com/app/1408230/Walkabout_Mini_Golf_VR/); 40 courses as of May 2026 (Blokhaven the 40th, 7 May 2026) per a third-party site — [The XR School](https://thexrschool.com/walkabout-mini-golf/); Escape from Planet Xylodon (8 Oct 2026, $4.99) has "36 holes ... 18 Easy and 18 Hard holes, with 18 lost balls to find and a collectible putter" — [MIXED](https://mixed-news.com/en/walkabout-mini-golf-planet-xylodon-experimental-hand-tracking-mulligans/)
- Scoring: "Stroke play is the base mode"; Standard Match = strokes added across the round, lowest total wins — [Mighty Coconut resources](https://www.mightycoconut.com/wmg-resources)
- Watch: "Tilt your wrist to view your virtual watch, and it will display local time along with the hole number, stroke count, par count, and round" — [Mighty Coconut resources](https://www.mightycoconut.com/wmg-resources); "look at your watch on your wrist at any point to see what Par the hole is" — [PSNProfiles trophy guide](https://psnprofiles.com/guide/16777-walkabout-mini-golf-trophy-guide)
- Scorecard: opened with A/X during a match; its Settings menu holds Grip To Putt and putter strength — [Steam community FAQ](https://steamcommunity.com/app/1408230/discussions/4/3187986750504779517); the bottom row of the scorecard shows which lost balls you have found — [Walkabout on Facebook](https://www.facebook.com/walkaboutminigolf/photos/a.123547836545882/130001192567213/?type=3)
- Stroke limit: "Each hole has a set stroke limit, depending on Par count. Stroke limit can be turned off via the Course scorecard, under the 'Course' settings tab"; with it on "the last allowed stroke is a triple bogey, and missing that stroke counts as a quadruple bogey"; the wiki suggests turning it off after a few weeks — [Fandom Game Settings](https://walkabout-mini-golf.fandom.com/wiki/Game_Settings); Steam guide: "ON = triple bogey maximum" — [Steam guide SUPEREASY](https://steamcommunity.com/sharedfiles/filedetails/?id=2812327682); turning off Stroke Limit "lets you keep hitting the ball without automatic advancement" — [PSNProfiles trophy guide](https://psnprofiles.com/guide/16777-walkabout-mini-golf-trophy-guide)
- Out of bounds / water: "hit the ball too hard in a course, get it sunk in water, or overshoot the putting green. This will put the ball 'out of bounds' and it will respawn itself in front of you" — [PSNProfiles trophy guide](https://psnprofiles.com/guide/16777-walkabout-mini-golf-trophy-guide); a Steam bug report (El Dorado hole 10) describes a ball wedged beside a ramp that "just kept resetting there" — [Steam bug report](https://steamcommunity.com/app/1408230/discussions/4/3727324132817873071/?l=latam)
- Design intent on wild shots: a review praises that players can "take wild shots without resetting your ball and ruining your fun" — [THE VR GRID](https://www.thevrgrid.com/walkabout-mini-golf/)
- Mulligans (update 6.8, 8 Oct 2026): "Session hosts can set a number of mulligans allowed per player before starting the round or mid-round via a modifier on the scorecard"; "A mulligan button has been added to your wristwatch"; a room wanting a clean card "sets it to zero and nothing has changed" — [vr.org](https://vr.org/articles/walkabout-mini-golf-planet-xylodon-mulligans-hand-tracking-2026); [MIXED](https://mixed-news.com/en/walkabout-mini-golf-planet-xylodon-experimental-hand-tracking-mulligans/)
- Undo (practice/Welcome Island): "To reset the ball to its previous position ('Undo') just push the control stick down" — [Steam guide SUPEREASY](https://steamcommunity.com/sharedfiles/filedetails/?id=2812327682); practice mode "has no scoring, and allows users to play holes in any order with an undo option for strokes" — [Mighty Coconut resources](https://www.mightycoconut.com/wmg-resources); "redo a shot by pressing back on the right thumbstick after any shot" — [VR Lowdown tips](https://vrlowdown.com/walkabout-mini-golf-tips/)
- Hardest/easiest holes were published by the studio with the Alice course — [UploadVR](https://www.uploadvr.com/walkabout-alice-adventures-wonderland/) (content not readable).

### Inferences
- "Respawns in front of you" most plausibly means the ball returns to its pre-stroke lie (the player is normally standing there); the El Dorado report of a ball resetting to its wedged spot supports "last resting position" semantics. The stroke that went OB counts; no source mentions an extra penalty stroke, so the rule appears to be stroke-counts-no-penalty.
- Stroke limit = par + 3 strokes allowed; recorded score if not holed = par + 4.

### Gaps
- No official text of the OB rule (exact respawn position, penalty or not, whether the ball is placed at the previous lie or the tee).
- No source on hole-in-one handling (celebration, scorecard marking) or on ball-marker, concede or per-shot timers (none appear to exist; Race Mode is the only timed mode).
- Par values per hole/course and whether par totals differ between Easy and Hard versions are not documented in retrievable sources.

## 3. Easy vs Hard mode of each course; unlocking Hard mode

### Takeaway
Every course ships in two versions: the regular/Easy (usually daytime) course with 18 hidden "lost balls", and the Hard (usually night) course whose 18 holes are modified or redesigned (cup and tee often inverted, more obstacles, different lighting), with a Foxhunt clue chain instead of lost balls that unlocks a course putter. Hard unlocks per course by collecting 10 of its 18 lost balls or by finishing the regular course at/under par (sources disagree on "par" vs "under par").

### Cited Findings
- Official: "Did you know there are 18 lost balls on every #WalkaboutMiniGolf regular course? The bottom row of the scorecard will show which ones you've found. Collect 10 to unlock Hard Mode!" — [Walkabout on Facebook](https://www.facebook.com/walkaboutminigolf/photos/a.123547836545882/130001192567213/?type=3)
- Alternative unlock: "finding 10 hidden balls on a course, or scoring below par" — [Use A Potion review, Jan 2022](https://www.useapotion.com/2022/01/walkabout-mini-golf-quest-2-review/); "scoring at or under par or collecting 10 hidden balls" — [THE VR GRID](https://www.thevrgrid.com/walkabout-mini-golf/); "getting a zero or minus score" — [CogConnected](https://cogconnected.com/review/walkabout-mini-golf-review/); the podcast transcript says "under par" — [Voices of VR #1560](https://voicesofvr.com/1560-walkabout-mini-golfs-incredible-fusion-of-worldbuilding-gameplay-social-dynamics-dlc-experimentation/); Gothic: night version reached "by scoring below par across all 18 holes" — [UploadVR Gothic](https://www.uploadvr.com/walkabout-mini-golf-gothic/)
- What changes: "Night Mode is more than a cosmetic swap. Every hole has been modified, and sometimes completely redesigned to provide an entirely new course" — [Steam store page](https://store.steampowered.com/app/1408230/Walkabout_Mini_Golf_VR/); hard mode "lengthening the course, adding obstacles, and lowering par" — [CogConnected](https://cogconnected.com/review/walkabout-mini-golf-review/); "hole layouts often change in hard mode, with cup and tee positions inverted"; "the easy course is usually the daytime version and hard mode is usually at night" (developer) — [Voices of VR #1560](https://voicesofvr.com/1560-walkabout-mini-golfs-incredible-fusion-of-worldbuilding-gameplay-social-dynamics-dlc-experimentation/); a critic found hard mode "mostly remixes previous holes to make them more difficult" — [Checkpoint Gaming](https://checkpointgaming.net/features/2021/02/vr-corner-walkabout-mini-golf/)
- Difficulty jump example: one reviewer went from -14 on normal to +12 on hard on the same course — [Use A Potion review](https://www.useapotion.com/2022/01/walkabout-mini-golf-quest-2-review/)
- Exceptions to "night": Holiday Hideaway's hard mode "reverses the game's typical night course for a scene on Christmas morning" — [UploadVR Holiday Hideaway](https://www.uploadvr.com/holiday-hideaway-tour-walkabout-mini-golf/)
- Hard-mode collectible: "Instead of hunting lost balls, on Hard mode you complete a scavenger hunt to unlock a new putter unique to each course" (Foxhunt); start near hole 1 of each hard course, pick up the item it points to like a lost ball — [PSNProfiles trophy guide](https://psnprofiles.com/guide/16777-walkabout-mini-golf-trophy-guide); "commemorative putters for each course are unlockable through Foxhunts on Hard Mode" — [Steam store page](https://store.steampowered.com/app/1408230/Walkabout_Mini_Golf_VR/)
- Lost-ball pickup: "Pulling the analog stick downward vacuums a found ball into your collection" — [UploadVR review](https://www.uploadvr.com/walkabout-mini-golf-review/)
- Guest Pass (v2.91, Dec 2021): non-owners can play a DLC course if one person in the private room owns it, "However people in Guest Pass mode can't collect lost balls or complete foxhunts" — [Steam v2.91 release notes](https://store.steampowered.com/news/app/1408230/view/3129437417943540505); [Walkabout on X](https://x.com/WalkaboutMG/status/1474115092572741637)
- Lighting on PS VR2: "HDR display makes the darker night variations really pop" — [THE VR GRID](https://www.thevrgrid.com/walkabout-mini-golf/)

### Inferences
- "Night mode" and "Hard mode" are the same thing in player and store vocabulary; the studio's newer course copy uses "Easy/Hard" (Planet Xylodon: "18 Easy and 18 Hard holes").
- Unlock is per course, tracked in the player's cloud save (cloud save since Nov 2021 per the Steam FAQ).

### Gaps
- Official current wording of the par condition (par vs under par) not retrievable; the Facebook post only mentions the 10-ball route.
- Whether Hard par totals are lower (CogConnected) or unchanged is unverified; no per-course par tables found.

## 4. Game modes, practice/free play, moving between holes, locomotion

### Takeaway
Rounds are turn-based stroke play by default (Honors order), with Match Play, Race Mode (simultaneous, timed) and Custom (holes, turn order, scoring) added June 2024; turn orders are Honors, Distance, Simultaneous. Locomotion: trigger teleports you to your ball (again to snap behind it), Auto Teleport can do this automatically, plus teleport or smooth stick walking, snap or smooth turn, and a "Flyabout" flight mode (hold stick up until the controller vibrates). Practice mode has no scoring, any hole order, undo, and hole warps from the scorecard/map.

### Cited Findings
- Modes (June 2024 update): "a trio of new game modes: Walkabout Match Mode, Race Mode and Custom"; Match Mode: "a point is awarded for the lowest score on a hole. The winner is the player with the most points"; players who intentionally leave a match cannot rejoin; Race Mode: "Players will putt simultaneously to see who can complete the course the quickest! Players cannot join a race late, and will be put into Observer mode"; turn orders "Honors (the usual), Distance and Simultaneous"; "Simultaneous turn order is not available for Match Mode" — [Steam announcements](https://store.steampowered.com/news/posts/?feed=steam_community_announcements&enddate=1718293531); [Gaming Age, June 2024](https://gaming-age.com/2024/06/walkabout-mini-golf-gets-new-game-modes-for-all-courses-and-a-free-remaster/); Mighty Coconut lists it as "Match Play" and says Custom lets players "customize holes, turn order, and scoring"; ties in Match Play can share points — [Mighty Coconut resources](https://www.mightycoconut.com/wmg-resources)
- Honors: lowest scorer on the previous hole putts first — [Gaming Age](https://gaming-age.com/2024/06/walkabout-mini-golf-gets-new-game-modes-for-all-courses-and-a-free-remaster/)
- Earlier there was no simultaneous play; a later commenter: "on Quest, when you select a map, go to modes > simultaneous" — [Steam discussion](https://steamcommunity.com/app/1408230/discussions/1/3193614254331142306/)
- Rooms: "Up to 8 players can all join a Private Room with a unique room name, where the room host ... is able to choose different courses and Game Mode types"; hosts can kick, and a block bars the player from every private room that host opens (6.8) — [vr.org](https://vr.org/articles/walkabout-mini-golf-planet-xylodon-mulligans-hand-tracking-2026); [Mighty Coconut minigolf page](https://www.mightycoconut.com/minigolf)
- Turn flow (2021 description): you can "start at the next hole and stand there while the previous person finishes", and "as soon as they're done, you're started on the next hole" — [UploadVR, started on iPhone](https://www.uploadvr.com/walkabout-mini-golf-steam-iphone/); "click trigger to move to your ball waiting at the next hole" — [The Lady M guide](https://theladymonline.yolasite.com/walkabout-mini-golf.php)
- Teleport to ball: "Pressing the trigger moves you to the ball. Pressing the trigger again puts you right behind the ball"; "Auto Teleport moves the player to the next ball position after the ball stops" — [Fandom Game Settings](https://walkabout-mini-golf.fandom.com/wiki/Game_Settings); on PS VR2 "tap R2 to teleport to the balls position, even while it's rolling" — [PSNProfiles trophy guide](https://psnprofiles.com/guide/16777-walkabout-mini-golf-trophy-guide)
- Locomotion options: "supports both teleport and artificial stick-based locomotion and you can change settings at any time. Snap turning and teleport is the default, and there's also a flight-mode that can be accessed without going to the menu"; turning can be snap with adjustable angle or smooth with adjustable speed — [Steam guide: Settings and comfort options](https://steamcommunity.com/sharedfiles/filedetails/?id=2661905340); Meta store: "supports teleport and smooth locomotion, as well as the ability to fly" — [Meta Quest store](https://www.meta.com/experiences/walkabout-mini-golf/2462678267173943/); "left stick walks and the right stick turns" (developer reply) — [Steam discussion](https://steamcommunity.com/app/1408230/discussions/0/4312743731804243437); smooth movement = Settings > Movement, "smooth" ticked — [Mighty Coconut glossary](https://mightycoconut.com/wmg-glossary)
- Flight: "use the 'Flyabout' mode to move quickly by holding the stick upward for a few seconds until the controller vibrates" — [Steam guide SUPEREASY](https://steamcommunity.com/sharedfiles/filedetails/?id=2812327682)
- Practice: "no scoring, and allows users to play holes in any order with an undo option for strokes" — [Mighty Coconut resources](https://www.mightycoconut.com/wmg-resources); "In Practice mode you can click on the hole numbers on the map/scorecard to warp there" — [Steam guide SUPEREASY](https://steamcommunity.com/sharedfiles/filedetails/?id=2812327682); Welcome Island has a "Driving range" and "Practice Green" sign to activate — [VR Lowdown tips](https://vrlowdown.com/walkabout-mini-golf-tips/); summon a ball anywhere by holding the controller above your shoulder and pulling down on the thumbstick — [Steam discussion](https://steamcommunity.com/app/1408230/discussions/0/4826187053917054154/)
- Offline: base courses and owned DLC work offline; friends features and DLC purchases do not — [Steam community FAQ](https://steamcommunity.com/app/1408230/discussions/4/3187986750504779517)

### Inferences
- The default round is asynchronous-turn-based: each player's ball sits on the next tee, players can move ahead and wait, and "Honors" only decides order on the tee; simultaneous order (2024) removes waiting.
- Flight is a locomotion convenience, not a gameplay power: no source ties it to any rule, and it is reachable without the menu, so it is treated like teleport.

### Gaps
- No source on whether other players' balls collide with yours or pass through (relevant for Simultaneous and Race Mode).
- No doc on player scale/height adjustment or a "move ball" tool outside practice undo.

## 5. Accessibility and comfort options (exact names)

### Takeaway
Settings live in the Welcome Island Shack and the course scorecard (cog icon), with tabs including Movement, Course, Putter and a dedicated Accessibility tab. Named options: Grip To Putt, Strength, Invert Hands (left-handed), Lock Ball Position (seated/stationary), Auto Teleport, Smooth movement, Snap/Smooth turning (angle/speed), Controller Smoothing, Magnifier, larger Watch display, Stroke Limit, and an experimental Lay Down mode.

### Cited Findings
- Accessibility tab: "users can find a specific 'Accessibility' settings tab at the Welcome Island Shack settings menu and the course scorecard settings, which includes options such as a magnifying glass and controller smoothing"; also a larger watch display — [Mighty Coconut: 17 accessibility features](https://support.mightycoconut.com/kb/article/17-accessibility-features/); [Mighty Coconut resources](https://www.mightycoconut.com/wmg-resources)
- Controller Smoothing: "applies a gentle acceleration and deceleration curve to thumbstick inputs" — [Fandom Game Settings](https://walkabout-mini-golf.fandom.com/wiki/Game_Settings)
- Seated: "Players can enjoy Walkabout seated and stationary without compromising on gameplay experience"; "We recommend stationary players to utilize our 'Lock Ball' setting so that it's easier to align with the ball. This setting can be found under our 'Movement' settings tab" — [Mighty Coconut support](https://support.mightycoconut.com/kb/article/17-accessibility-features/); Lock Ball Position "places the ball at the center of your play area so you start there rather than walking into walls" — [Fandom Game Settings](https://walkabout-mini-golf.fandom.com/wiki/Game_Settings); recommended for guest passes — [Steam community FAQ](https://steamcommunity.com/app/1408230/discussions/4/3187986750504779517)
- Left-handed: "open the settings and enable 'INVERT HANDS'" — [Steam guide SUPEREASY](https://steamcommunity.com/sharedfiles/filedetails/?id=2812327682); it lets you "snap to the correct side of the ball when you play lefty with the right controller, or the reverse" — [Fandom Game Settings](https://walkabout-mini-golf.fandom.com/wiki/Game_Settings); a Rift S user reported the left controller would not register as the club hand — [Steam discussion](https://steamcommunity.com/app/1408230/discussions/1/4038101970208760246/?l=tchinese)
- Settings access: cog icon on the scorecard or on your avatar at the counter — [Steam guide SUPEREASY](https://steamcommunity.com/sharedfiles/filedetails/?id=2812327682); A/X opens the scorecard during a match — [Steam community FAQ](https://steamcommunity.com/app/1408230/discussions/4/3187986750504779517)
- Lay Down: an experimental "Lay Down" mode exists; the developer advises disabling it when troubleshooting tracking — [Mighty Coconut glitching blog](https://www.mightycoconut.com/blog/glitching)
- Cloud save since Nov 2021; lost progress: support can "unlock all balls and clubs for you" — [Steam community FAQ](https://steamcommunity.com/app/1408230/discussions/4/3187986750504779517)
- Video walkthrough of settings (Dec 2021) — [Steam video: VR Settings Overview](https://steamcommunity.com/sharedfiles/filedetails/?id=2661963250) / [YouTube](https://www.youtube.com/watch?v=j_zUv97XoPY)

### Inferences
- Putter length following posture removes the need for a separate height/putter-length slider, which is why none is documented.
- "Lay Down" is presumably a comfort mode for supine play, which explains why it conflicts with boundary tracking.

### Gaps
- No source describing what Lay Down does, or any explicit anti-cheat (e.g. preventing lying on the floor to see lines).
- No height-offset or player-scale option found.

## 6. Custom putters and balls: unlocking and effect on play

### Takeaway
Lost balls (18 per regular course, one hidden per hole) and Foxhunt putters (one per Hard course, more on a few) are collectibles equipped at the Welcome Island shack. No source says they change physics; the stated gameplay difference of Hard mode is the course, and physical feel comes only from real-world weighted accessories.

### Cited Findings
- Lost balls: one per hole, 18 per course, vacuumed in with stick-down — [UploadVR review](https://www.uploadvr.com/walkabout-mini-golf-review/); [Facebook](https://www.facebook.com/walkaboutminigolf/photos/a.123547836545882/130001192567213/?type=3)
- Putters: "finding every clue unlocks a specially designed putter, which you equip back at the welcome shack" — [Use A Potion review](https://www.useapotion.com/2022/01/walkabout-mini-golf-quest-2-review/); fan tally: one putter per hard-mode foxhunt except Laser Lair (two) and Myst (three) — [Steam discussion](https://steamcommunity.com/app/1408230/discussions/0/4415299132512627656)
- "commemorative putters" via Foxhunts; "Hard Mode isn't just cosmetic" refers to hole changes — [Steam store page](https://store.steampowered.com/app/1408230/Walkabout_Mini_Golf_VR/)
- Ball list (fan wiki) — [Fandom All WMG Balls](https://walkabout-mini-golf.fandom.com/wiki/All_WMG_Balls)
- Physical accessory presets: "HelloReal putter preset for Walkabout Mini Golf" — [Mighty Coconut GTP page](https://www.mightycoconut.com/gtp)

### Inferences
- Putters and balls are cosmetic/commemorative; progression is unlock-by-exploration (lost balls) and unlock-by-puzzle (foxhunts), both gated to owners (Guest Pass excluded).

### Gaps
- No explicit official statement that putter skins have identical physics; could not verify whether any putter has a different head size or shaft.

## 7. Quality-of-life rules (retrieval, undo, replay, mulligan, concede, timers)

### Takeaway
Out-of-bounds balls self-respawn; practice mode has undo (stick back/down); mulligans are host-configurable since Oct 2026 via the wristwatch; there is no documented ball marker, concede, per-shot timer, or in-round "replay hole" (hole warps exist only in practice).

### Cited Findings
- Respawn on OB — [PSNProfiles trophy guide](https://psnprofiles.com/guide/16777-walkabout-mini-golf-trophy-guide)
- Undo in practice — [Mighty Coconut resources](https://www.mightycoconut.com/wmg-resources); [VR Lowdown tips](https://vrlowdown.com/walkabout-mini-golf-tips/)
- Mulligans: wristwatch button, host-set count — [vr.org](https://vr.org/articles/walkabout-mini-golf-planet-xylodon-mulligans-hand-tracking-2026)
- Lost-ball clutter in the shack: drag the Quit confirmation window to push balls — [Steam discussion](https://steamcommunity.com/app/1408230/discussions/0/4844274022644232383/)
- Leaving a Match Mode round forfeits rejoining; late joiners to Race Mode observe — [Gaming Age](https://gaming-age.com/2024/06/walkabout-mini-golf-gets-new-game-modes-for-all-courses-and-a-free-remaster/)

### Inferences
- The design philosophy is "never punish beyond the stroke": OB costs only the wasted stroke, the stroke limit caps blowups at +4, and mulligans are opt-in per room.

### Gaps
- Replay-a-hole in a scored round, ball marker, concede, and shot clocks: no sources found; likely absent but unconfirmed.
