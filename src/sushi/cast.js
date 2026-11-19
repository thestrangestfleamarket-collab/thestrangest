// who can be at the cart: Polyfork's people (pf.js; baked by node tools/sushi-cast.cjs into data/sushi/cast.json) as downtown New Yorkers of 1985
// Polyfork's body: [sex, voice, pitch, youngest, oldest, what they do, a dye for its clothes or null for its own] (the voice names are worker/door.js's /sushi/say)
export const BODIES = {
  carving_chef: ['m', 'zeus', 0.96, 45, 60, 'the cook', null],
  // the block's regulars (block.js CAST): their bodies are theirs alone
  police_officer: ['m', 'helios', 0.97, 30, 45, 'a patrolman of the Ninth Precinct who walks this beat'],
  trucker: ['m', 'zeus', 0.95, 50, 62, 'a yellow cab driver between fares'],
  street_skater: ['f', 'asteria', 1.0, 19, 26, 'a singer in a punk band'],
  diner_waitress: ['f', 'hera', 1.0, 28, 45, 'a nurse from the hospital on First Avenue', [0x7c8490, 0xd4d8dc, 0xf6f6f2]],
  grandmother_in_a_rebozo: ['f', 'luna', 0.95, 64, 78, 'an old Ukrainian woman who has lived on this block for forty years', null],
  teen_player: ['m', 'orpheus', 1.02, 17, 23, 'a young man in a hooded sweatshirt who breakdances by the subway'],
  hotdogman: ['m', 'arcas', 0.97, 35, 48, 'the man who keeps the bodega'],
  neighborhood_child: ['m', 'orpheus', 1.18, 9, 12, 'a kid from the block sent out for a bowl'],
  game_master: ['m', 'orion', 0.98, 22, 34, 'a clerk at the record shop'],
  room_attendant: ['f', 'hera', 0.99, 35, 50, 'the woman who runs the laundromat'],
  // whoever else sits down or passes
  salaryman_commuter: ['m', 'perseus', 0.98, 28, 40, 'a man in a suit up from an office on Wall Street'],
  player_in_a_cardigan: ['f', 'asteria', 1.01, 24, 36, 'a painter with a studio in an old tenement on Avenue B'],
  construction_worker: ['m', 'angus', 0.96, 40, 58, 'a Con Edison man working on the steam main across the street'],
  barista: ['m', 'zeus', 0.96, 48, 60, 'the counterman from the coffee shop on the corner, still in his apron'],
  cafe_customer: ['f', 'asteria', 1.02, 28, 45, 'a legal secretary on her way home from an office near City Hall'],
  cocktail_server: ['f', 'asteria', 1.03, 20, 30, 'a dancer who waits tables on Second Avenue'],
  player_in_flannel: ['m', 'angus', 0.98, 26, 40, 'a longshoreman off the Brooklyn piers'],
  student_with_backpack: ['m', 'orion', 1.0, 19, 27, 'a student at the art school on Cooper Square'],
  commuter: ['m', 'perseus', 1.0, 30, 50, 'an accountant from Midtown on his way to the late train'],
  passenger: ['f', 'hera', 0.97, 45, 60, 'an operator off the late shift at the telephone company'],
  parent_chaperone: ['f', 'luna', 0.98, 30, 45, 'a mother from the houses on Avenue D'],
  doorman: ['m', 'arcas', 0.96, 45, 60, 'a doorman from a building on Fifth Avenue, on his way home'],
  fruitseller: ['m', 'zeus', 0.95, 55, 68, 'the man from the fruit stand on First Avenue'],
  student_in_a_hoodie: ['f', 'luna', 1.03, 18, 24, 'a student at the university on Washington Square'],
  delivery_courier: ['m', 'orpheus', 1.04, 19, 30, 'a messenger who runs papers between offices downtown'],
  school_teacher: ['m', 'perseus', 0.98, 30, 50, 'a teacher at the public school on East 4th Street'],
  motel_clerk: ['f', 'luna', 0.95, 60, 74, 'a retired seamstress from the garment district'],
  firefighter: ['m', 'zeus', 0.98, 28, 48, 'a firefighter from the engine company on East 2nd Street'],
  seated_office_worker: ['m', 'orion', 1.0, 25, 45, 'a clerk at an insurance office, working late'],
  professor: ['m', 'arcas', 0.95, 58, 72, 'an old poet who reads at the café on East 3rd Street'],
};
// the regulars' own bodies are theirs alone: whoever else sits down or passes is one of the others
const CASTED = ['police_officer', 'trucker', 'street_skater', 'diner_waitress', 'grandmother_in_a_rebozo', 'teen_player', 'hotdogman', 'neighborhood_child', 'game_master', 'room_attendant'];
export const CUSTOMERS = Object.keys(BODIES).filter((k) => k !== 'carving_chef' && !CASTED.includes(k));
