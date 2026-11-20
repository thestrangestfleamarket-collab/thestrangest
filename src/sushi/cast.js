// who can be at the cart: Polyfork's people (pf.js; baked by node tools/sushi-cast.cjs into data/sushi/cast.json) as New Yorkers of 1985, round Market St and the park; some are THE MARKET's own people by the jobs they have there (the professor, the park ranger, the fishmonger, the gardener, the doctor, the skaters)
// Polyfork's body: [sex, voice, pitch, youngest, oldest, what they do, a dye for its clothes or null for its own] (the voice names are worker/door.js's /sushi/say)
export const BODIES = {
  carving_chef: ['m', 'zeus', 0.96, 45, 60, 'the cook', null],
  // the corner's regulars (block.js CAST): their bodies are theirs alone
  police_officer: ['m', 'helios', 0.97, 30, 45, 'a patrolman who walks Market St'],
  trucker: ['m', 'zeus', 0.95, 50, 62, 'a yellow cab driver between fares'],
  street_skater: ['f', 'asteria', 1.0, 19, 26, 'a singer in a punk band'],
  diner_waitress: ['f', 'hera', 1.0, 28, 45, 'a nurse from THE CLINIC on Market St', [0x7c8490, 0xd4d8dc, 0xf6f6f2]],
  grandmother_in_a_rebozo: ['f', 'luna', 0.95, 64, 78, 'an old Ukrainian woman who has lived on West St for forty years', null],
  teen_player: ['m', 'orpheus', 1.02, 17, 23, 'a young man in a hooded sweatshirt who breakdances at the park corner'],
  hotdogman: ['m', 'arcas', 0.97, 35, 48, 'the man who keeps the bodega'],
  neighborhood_child: ['m', 'orpheus', 1.18, 9, 12, 'a kid from West St sent out for a bowl'],
  game_master: ['m', 'orion', 0.98, 22, 34, 'the change man at THE ARCADE'],
  room_attendant: ['f', 'hera', 0.99, 35, 50, 'the woman who runs the laundromat'],
  // whoever else sits down or passes
  salaryman_commuter: ['m', 'perseus', 0.98, 28, 40, 'a man in a suit from the bank across Market St'],
  player_in_a_cardigan: ['f', 'asteria', 1.01, 24, 36, 'a painter who copies the pictures in the art museum across the street'],
  construction_worker: ['m', 'angus', 0.96, 40, 58, 'a Con Edison man working on the main under Market St'],
  barista: ['m', 'zeus', 0.96, 48, 60, 'the counterman from the diner along Market St, still in his apron'],
  cafe_customer: ['f', 'asteria', 1.02, 28, 45, 'a teller from the bank across the street, on her way home'],
  cocktail_server: ['f', 'asteria', 1.03, 20, 30, 'a dancer from the playhouse on Market St who waits tables at THE BAR'],
  player_in_flannel: ['m', 'angus', 0.98, 26, 40, 'a longshoreman off the Hudson piers'],
  student_with_backpack: ['m', 'orion', 1.0, 19, 27, 'an art student who draws in the museum across the street'],
  commuter: ['m', 'perseus', 1.0, 30, 50, 'an accountant on his way to the subway stairs and the late train'],
  passenger: ['f', 'hera', 0.97, 45, 60, 'an operator off the late shift at the telephone company'],
  parent_chaperone: ['f', 'luna', 0.98, 30, 45, 'a mother from the apartment houses on West St'],
  doorman: ['m', 'arcas', 0.96, 45, 60, 'the doorman from the apartment house on West St, on his way home'],
  fruitseller: ['m', 'zeus', 0.95, 55, 68, 'the man from the fruit stall by the bodega'],
  student_in_a_hoodie: ['f', 'luna', 1.03, 18, 24, 'a student who reads in the park by day'],
  delivery_courier: ['m', 'orpheus', 1.04, 19, 30, 'a messenger who runs papers up and down Market St'],
  school_teacher: ['m', 'perseus', 0.98, 30, 50, 'a teacher at the public school past the park'],
  motel_clerk: ['f', 'luna', 0.95, 60, 74, 'a retired seamstress from the garment district'],
  firefighter: ['m', 'zeus', 0.98, 28, 48, 'a firefighter from the firehouse off Market St'],
  seated_office_worker: ['m', 'orion', 1.0, 25, 45, 'a clerk at an insurance office, working late'],
  professor: ['m', 'arcas', 0.95, 58, 72, 'the professor who keeps the counter at the bookshop'],
  // THE MARKET's own, by their jobs there
  park_ranger: ['m', 'helios', 0.97, 30, 50, 'the park ranger, off his rounds behind the wall'],
  hanga_roa_fisherman: ['m', 'zeus', 0.94, 45, 62, 'the fishmonger from the fish market by the Hudson'],
  village_gardener: ['f', 'hera', 0.98, 40, 58, 'the gardener who keeps the park\'s flower beds and sells cut flowers at its gate'],
  doctor: ['m', 'perseus', 0.97, 35, 55, 'the doctor from THE CLINIC on Market St'],
  longboarder: ['m', 'orpheus', 1.03, 17, 24, 'a skater from the skate shop\'s crowd'],
  vert_skater: ['m', 'orion', 1.02, 18, 26, 'a skater from the skate shop\'s crowd'],
};
// the regulars' own bodies are theirs alone: whoever else sits down or passes is one of the others
const CASTED = ['police_officer', 'trucker', 'street_skater', 'diner_waitress', 'grandmother_in_a_rebozo', 'teen_player', 'hotdogman', 'neighborhood_child', 'game_master', 'room_attendant'];
export const CUSTOMERS = Object.keys(BODIES).filter((k) => k !== 'carving_chef' && !CASTED.includes(k));
