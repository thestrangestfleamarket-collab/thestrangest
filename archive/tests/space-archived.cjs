// THE SPACE CHECK'S LINES FOR ARCHIVED CHARACTERS (owner, 9 Nov 2026: "yes move them to archive"): the elephant, the cat and the bat are archived (5 Nov 2026), so tests/space.cjs no longer asks for them.
// Put these back into tests/space.cjs, after its other ok(...) lines, when the characters come back.
  ok(r.elephant && r.elephant.R > .6 && r.elephant.L > 1, 'the elephant takes its own room (radius ' + (r.elephant && r.elephant.R.toFixed(2)) + ', ' + (r.elephant && r.elephant.L.toFixed(2)) + ' each way along it)');
  ok(r.cat && r.cat.R < .3, 'a cat stays small');
  ok(r.bat && r.bat.fly, 'a bat flies and takes no room on the ground');
  ok(r.elephant_nose && r.elephant_nose.d >= r.elephant_nose.need - 1e-3 && r.elephant_nose.moved < 1e-6, 'walking into the elephant\'s far end stops you there, and you cannot shove it');
