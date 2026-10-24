# Old game — room & item reference

A snapshot of every item the old game placed, for the three.js rebuild. Read from the old game at load time: editor changes made on the live site, and items taken off the map, are not here.

- `rooms.csv` — the 49 rooms, with item / loose-thing / code-file counts each.
- `all-items.csv` — every placed item (2,417): room, catalog info, department, price, floor, level, x/y, key.
- `catalog.csv` — the 768 catalog entries: kind, no, name, department, price, about, made_of.
- `loose-things.csv` — real-physics pieces (882, in 10 rooms): room, group, thing, floor, level, x/y, weight_kg. Only goods are named; the rest are unnamed pieces with a weight.

Notes:
- Outdoors is one room (`Outdoors - The Block`): streets, park, Cherry Station, Ghost Street. `No room` is items outside every room.
- `221B Baker Street` has only physics pieces, no regular items. `Aquarium Hall (switched off)` is off, so it placed none.
- The boxing gym and the pool are under the Square (`Under the Square - Boxing Gym`, `Under the Square - Pool`), not Central Park.

The old game's per-room build source is not kept here (it was bulky and duplicated across rooms). Ask if a room's old code is wanted for a rebuild.
