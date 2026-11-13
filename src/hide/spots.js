// THE ALLEY's twenty hiding places, as the page and the thing's mind (worker/hide.js) both know them: id, name, how a body hides there, how it is searched (kind), and where along the alley (metres in from the gate)
const SPOTS = [
  { id: 'bins', name: 'the three dented trash cans by the gate', kind: 'behind', z: 3, how: 'crouched behind loose metal cans, right side; the cans fall over loudly' },
  { id: 'dumpster1', name: 'the green dumpster under the lamp', kind: 'lid', z: 6.5, how: 'inside it, left side; its lid starts OPEN and can be pulled shut from inside' },
  { id: 'fridgebox', name: 'the big refrigerator carton on its side', kind: 'under', z: 8, how: 'crawled inside the long cardboard box, right side; it is light and shifts when touched' },
  { id: 'boxes', name: 'the stack of wet cardboard boxes', kind: 'behind', z: 10.5, how: 'behind a stack of loose boxes, right side; they topple easily' },
  { id: 'pallets', name: 'the pallets leaned on the wall', kind: 'behind', z: 11.5, how: 'in the narrow gap under wooden pallets leaned on the left wall' },
  { id: 'doorway', name: 'the recessed back doorway', kind: 'behind', z: 13.5, how: 'pressed into a deep door alcove in the right wall, under a flickering lamp' },
  { id: 'blankets', name: 'the heap of blankets', kind: 'cloth', z: 15, how: 'lying under a filthy blanket on the ground, left side; a body makes a lump' },
  { id: 'sofa', name: 'the dumped sofa', kind: 'behind', z: 16.5, how: 'lying behind a sofa pulled out from the left wall' },
  { id: 'car', name: 'the car under its cover', kind: 'behind', z: 19, how: 'squeezed between the covered car and the right wall' },
  { id: 'stairwell', name: 'the basement stairwell', kind: 'under', z: 20, how: 'down the sunken steps to a cellar door, left side, below ground level' },
  { id: 'tyres', name: 'the pile of old tyres', kind: 'behind', z: 22.5, how: 'behind tyres stacked past the car, right side' },
  { id: 'barrels', name: 'the oil drums', kind: 'behind', z: 23.5, how: 'between steel drums against the left wall; they ring when knocked' },
  { id: 'locker', name: 'the steel locker', kind: 'lid', z: 25, how: 'standing inside a tall steel locker, right side; its door starts AJAR and squeals' },
  { id: 'tarp', name: 'the tarp over the workbench', kind: 'under', z: 26.5, how: 'under a workbench hung with a tarp to the ground, left side' },
  { id: 'plywood', name: 'the plywood sheet leaned on the wall', kind: 'behind', z: 27, how: 'in the wedge under a plywood sheet leaned on the right wall' },
  { id: 'crates', name: 'the wooden crates', kind: 'behind', z: 28.5, how: 'behind stacked crates, left side' },
  { id: 'trashbags', name: 'the heap of trash bags', kind: 'behind', z: 29, how: 'burrowed behind black trash bags heaped by the second dumpster, right side' },
  { id: 'dumpster2', name: 'the far dumpster', kind: 'lid', z: 30.5, how: 'inside it, right side; its lid starts CLOSED and is heavy and loud to lift' },
  { id: 'shutter', name: 'the half-open loading shutter', kind: 'under', z: 31, how: 'crawled under a roller shutter into a black loading bay, left side' },
  { id: 'mattress', name: 'the mattress against the end wall', kind: 'behind', z: 33, how: 'behind a mattress leaned on the dead-end wall' }];
const KINDS = { behind: 'a glance sweeps the light over it from the path; a thorough search walks round to look behind', lid: 'a glance cannot see inside if it is shut; a thorough search wrenches it open and looks in', under: 'a glance cannot see into it; a thorough search crouches and shines the light inside', cloth: 'a glance sees only the heap; a thorough search rips the cloth away' };
export { SPOTS, KINDS };
