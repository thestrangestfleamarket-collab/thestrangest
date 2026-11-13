// THE SPECKLED BAND's shape: the book cut into Holmes's steps (what he does, the paragraphs it covers, two other things he might do), the people and what each knows, the places. The page and the worker both read it.
import { P, WHO } from './text.js';

// a step: place, who is there, pre (paragraphs that happen before he acts), from..to (the book's passage if he does as written), sum (his move, said to the player), alts
const BEATS = [
  { place: 'baker', cast: ['watson'], pre: [0, 1], from: 2, to: 6, sum: 'Wake Watson, tell him a young lady has come in great agitation, and bring him down to hear her.',
    alts: ['Let Watson sleep and see the lady alone.', 'Send word down that you receive no one before breakfast.'] },
  { place: 'baker', cast: ['watson', 'helen'], from: 7, to: 18, sum: 'Greet her kindly, seat her by the fire, read her journey from the ticket in her glove and the mud on her sleeve, and promise your help without thought of reward.',
    alts: ['Ask for your fee in advance before you hear a word.', 'Say nothing of what you observe; simply ask her name and business.'] },
  { place: 'baker', cast: ['watson', 'helen'], from: 19, to: 43, sum: 'Say "I am all attention, madam," and let her tell it all from the beginning: her stepfather, the house, her sister Julia and the whistle in the night.',
    alts: ['Cut her short: ask only whom she fears, and why.', 'Ask at once to be taken to the house; she can tell it on the way.'] },
  { place: 'baker', cast: ['watson', 'helen'], from: 44, to: 49, sum: 'Ask whether the sisters always locked their doors at night, and why; then let her tell how Julia died.',
    alts: ['Ask whether her stepfather was in his room when Julia screamed.', 'Tell her gently that you have heard enough, and that it was murder.'] },
  { place: 'baker', cast: ['watson', 'helen'], from: 50, to: 65, sum: 'Cross-examine her: the whistle and the clang, how Julia was dressed, the coroner, poison, the gipsies, and what "the speckled band" could mean.',
    alts: ['Declare the gipsies did it and the case is plain.', 'Ask what Julia was pointing at as she died.'] },
  { place: 'baker', cast: ['watson', 'helen'], from: 66, to: 73, sum: 'Hear why she has come today; then tell her she is screening her stepfather, and push back her sleeve to show the bruises on her wrist.',
    alts: ['Notice her wrist but say nothing of it.', 'Ask what her betrothed, Mr Armitage, makes of all this.'] },
  { place: 'baker', cast: ['watson', 'helen'], from: 74, to: 82, sum: 'Resolve to come to Stoke Moran this very afternoon and see the rooms while the Doctor is away; let her go home by the twelve o\'clock train to meet you.',
    alts: ['Forbid her to go home at all: send her straight to her aunt at Harrow.', 'Decline to travel; advise her to lay it before the police.'] },
  { place: 'baker', cast: ['watson'], from: 83, to: 93, sum: 'Talk it over with Watson: whistles, gipsies, a band, a metal clang. Offer the gipsy theory, and own that you see objections to it.',
    alts: ['Tell Watson you are already sure the stepfather did it himself.', 'Say nothing; take up your violin and think.'] },
  { place: 'baker', cast: ['watson', 'roylott'], pre: [94, 95], from: 96, to: 111, sum: 'Meet his fury with talk of the weather and the crocuses; laugh at his insults; and when he has bent the poker and gone, straighten it again.',
    alts: ['Tell him to his face that you know how Julia Stoner died.', 'Deny that Miss Stoner was ever here.'] },
  { place: 'baker', cast: ['watson'], from: 112, to: 114, sum: 'Breakfast, then walk to Doctors\' Commons and read the dead wife\'s will; come back at one, ask Watson to pocket his revolver, and make for Waterloo.',
    alts: ['Skip the will and take the first train to Leatherhead.', 'Go to Scotland Yard and ask for a constable to come with you.'] },
  { place: 'lane', cast: ['watson', 'helen'], pre: [115, 117], from: 118, to: 130, sum: 'Leave the trap at the stile, meet Miss Stoner in the fields, tell her the Doctor traced her to Baker Street, and ask to see the rooms at once.',
    alts: ['Drive openly up to the front door of the manor.', 'Keep from her that her stepfather followed her.'] },
  { place: 'lawn', cast: ['watson', 'helen'], from: 131, to: 139, sum: 'Study the three windows from the lawn; have her go in and bar her shutters, and try every way to force them from outside.',
    alts: ['Go straight inside; the windows can tell you nothing.', 'Walk round to the scaffolding and question whoever ordered the repairs.'] },
  { place: 'bedroom', cast: ['watson', 'helen'], from: 140, to: 156, sum: 'Sit silent in the bedroom and take in every detail; ask about the bell-rope, tug it, and remark the ventilator that opens into the Doctor\'s room.',
    alts: ['Search under the bed and up the chimney instead.', 'Tear the bell-rope from its hook and take it away with you.'] },
  { place: 'roylott', cast: ['watson', 'helen'], from: 157, to: 171, sum: 'Go through Dr Roylott\'s room: tap the safe, lift the saucer of milk, examine the seat of the wooden chair, and find the dog lash tied in a loop.',
    alts: ['Force the iron safe open.', 'Leave his room alone; you have seen enough.'] },
  { place: 'lawn', cast: ['watson', 'helen'], from: 172, to: 193, sum: 'Tell Miss Stoner her life depends on doing exactly as you say: feign a headache, signal with her lamp when he retires, sleep in her old room. Keep your theory to yourself.',
    alts: ['Tell her everything you suspect: the ventilator, the rope, and what comes down it.', 'Take her away to Harrow tonight and leave the house to itself.'] },
  { place: 'inn', cast: ['watson'], pre: [194, 194], from: 195, to: 217, sum: 'At the Crown Inn, warn Watson of the danger, and lead him through it: the ventilator, the rope, the bed clamped to the floor.',
    alts: ['Go alone tonight; leave Watson at the inn.', 'Send to Leatherhead for the county police before dark.'] },
  { place: 'vigil', cast: ['watson'], pre: [218, 218], from: 219, to: 232, sum: 'At the lamp\'s signal cross the lawn, climb in at her window, close the shutters, and sit on the bed in the dark with the cane, the matches and the candle beside you.',
    alts: ['Keep the lamp burning so that you can see what comes.', 'Knock at Dr Roylott\'s door and have it out with him now.'] },
  { place: 'vigil', cast: ['watson'], pre: [233, 234], from: 235, to: 239, sum: 'Wait in silence until the soft hiss comes; then strike a match and lash at the bell-pull with your cane.',
    alts: ['Keep still and let it come down the rope.', 'Strike a light the moment the lantern gleams next door.'] },
  { place: 'death', cast: ['watson'], from: 240, to: 245, sum: 'Light the lamp and go into Dr Roylott\'s room; noose the snake with his own dog-whip and shut it in the iron safe.',
    alts: ['Have Watson shoot the snake where it sits.', 'Go to Miss Stoner first and leave that room shut till morning.'] },
  { place: 'train', cast: ['watson'], pre: [246, 246], from: 247, to: 250, sum: 'On the train home, tell Watson how you reasoned it out, and that the Doctor\'s death is not likely to weigh very heavily upon your conscience.',
    alts: ['Tell Watson you mean to confess your part in the death to the coroner.', 'Say nothing of it at all, and ask him never to write of the case.'] },
];
BEATS.forEach((b, i) => b.id = i);

// the people the others play. sees: the paragraphs they were there for (a mind is given only those before the step now); knows: what they carry that the telling does not show
const CAST = {
  watson: { name: 'Dr Watson', tag: 'W', sees: [[1, 250]], pitch: .9, rate: 1,
    knows: 'You are Dr John Watson, an army doctor lately back from Afghanistan, sharing rooms at 221B Baker Street with your friend Sherlock Holmes. You are loyal, brave, plain-spoken and a little slower than he is, and you do not mind his knowing it. You admire him, and you say so; when he behaves badly or strangely you tell him that too, as a friend. You carry a service revolver when asked. You know nothing of this case beyond what you have seen and heard.' },
  helen: { name: 'Miss Stoner', tag: 'S', sees: [[7, 82], [124, 193]], pitch: 1.35, rate: .95,
    knows: 'You are Helen Stoner, about thirty, living at Stoke Moran in Surrey with your stepfather Dr Grimesby Roylott. You are gentle, exhausted and badly frightened, but not foolish, and you have courage: you came to London alone before dawn. You are engaged to Percy Armitage. Your twin sister Julia died two years ago, a fortnight before her wedding, crying out about "the speckled band"; you do not know what killed her or what the words meant. Last night, moved into her room, you heard the same low whistle she spoke of. You fear your stepfather and you still excuse him. You have no idea how Julia died; the doctors found nothing, and you half believe it was fright. If Mr Holmes is unkind or asks for money you cannot pay, you are hurt, and may leave.' },
  roylott: { name: 'Dr Roylott', tag: 'R', sees: [[94, 110]], pitch: .55, rate: .9,
    knows: 'You are Dr Grimesby Roylott of Stoke Moran, last of an old Surrey family: a huge, violent, clever man who practised medicine in Calcutta, beat his butler to death there, and came home soured. You live on your dead wife\'s money, and each stepdaughter who marries takes a third of it. Your secret, which you will never admit to anyone: two years ago you killed your stepdaughter Julia with a swamp adder from India, which you keep in the iron safe in your bedroom, feed on milk, and have trained to come back at a whistle; you put it through the ventilator to go down the dummy bell-rope onto the bed, and you mean to do the same to Helen now she is to marry. You bully, threaten and roar; you never plead. If you believe someone knows the truth you become quiet and dangerous, and you think first of destroying the proof or the witness.' },
  other: { name: 'A stranger', tag: 'D', sees: [], pitch: 1, rate: 1,
    knows: 'You are an ordinary person of England in April 1883, of the calling your name gives. You know only what such a person would know of your own trade and neighbourhood, and nothing of Mr Holmes\'s case unless you were told.' },
};

// where a step is played; the worker's stage manager may send the story to any of them
const PLACES = {
  baker: 'the sitting-room at 221B Baker Street, a fire in the grate',
  lane: 'the Surrey lane and the fields below Stoke Moran',
  lawn: 'the lawn before the lived-in wing of Stoke Moran Manor',
  bedroom: 'the middle bedroom at Stoke Moran, where Julia died and Helen now sleeps, by day',
  roylott: 'Dr Roylott\'s own bedroom at Stoke Moran, next door',
  death: 'Dr Roylott\'s bedroom that night: the Doctor dead in his chair by the open safe, the swamp adder bound about his brow',
  inn: 'an upper room of the Crown Inn, looking over to the manor',
  vigil: 'the middle bedroom at Stoke Moran, at night',
  train: 'a railway carriage',
  elsewhere: 'somewhere else',
};

export const BAND = { P, WHO, BEATS, CAST, PLACES, TITLE: 'THE SPECKLED BAND' };
