# Builds the forest at start from assets/nature: ground, a winding dirt path, trees and rocks you bump into, and ground cover you walk through.
extends Node3D

const NATURE := "res://assets/nature/"
const TEXTURES := "res://assets/nature/textures/"

@export var world_seed := 7
@export var half_size := 110.0
@export var path_width := 3.6
@export var cover_density := 1.0
@export var cover_draw_distance := 70.0
@export var cell_size := 32.0

const GROUND_COLOR := Color(0.40, 0.58, 0.21)
const PATH_COLOR := Color(0.67, 0.56, 0.39)

const PALETTE := {
	"Bark_NormalTree": Color(0.42, 0.26, 0.15),
	"Leaves_NormalTree": Color(0.30, 0.55, 0.18),
	"Leaves_Pine": Color(0.16, 0.40, 0.22),
	"Bark_TwistedTree": Color(0.38, 0.24, 0.16),
	"Leaves_TwistedTree": Color(0.86, 0.42, 0.12),
	"Bark_DeadTree": Color(0.45, 0.37, 0.28),
	"Grass": Color(0.44, 0.62, 0.22),
	"Leaves": Color(0.34, 0.56, 0.22),
	"Flowers": Color(0.88, 0.28, 0.26),
	"Rocks": Color(0.56, 0.56, 0.58),
	"PathRocks": Color(0.60, 0.58, 0.54),
	"Mushrooms": Color(0.80, 0.55, 0.32),
}

# The textures the kit's materials were made with; any found in assets/nature/textures/ replace the flat colours.
const TEXTURE_FILES := {
	"Bark_NormalTree": "Bark_NormalTree.png",
	"Bark_DeadTree": "Bark_DeadTree.png",
	"Leaves_Pine": "Leaf_Pine_C.png",
	"Leaves": "Leaves.png",
	"Flowers": "Flowers.png",
	"Grass": "Grass.png",
	"Mushrooms": "Mushrooms.png",
	"Rocks": "Rocks_Diffuse.png",
	"PathRocks": "PathRocks_Diffuse.png",
}

# clear: distance kept from the path's centre; solid: collision radius (none = walk through); gap: room kept from other solid things.
const GROUPS := [
	{"meshes": ["Pine_1", "Pine_2", "Pine_3", "Pine_4", "Pine_5"], "count": 240, "clear": 5.0, "scale": Vector2(1.4, 2.2), "solid": 0.35, "gap": 1.6},
	{"meshes": ["CommonTree_2"], "count": 45, "clear": 5.0, "scale": Vector2(1.4, 1.9), "solid": 0.4, "gap": 1.8},
	{"meshes": ["DeadTree_1", "DeadTree_2", "DeadTree_3", "DeadTree_4", "DeadTree_5"], "count": 30, "clear": 4.5, "scale": Vector2(1.2, 1.7), "solid": 0.4, "gap": 1.8},
	{"meshes": ["TwistedTree_1", "TwistedTree_2", "TwistedTree_3", "TwistedTree_4", "TwistedTree_5"], "count": 12, "clear": 9.0, "scale": Vector2(1.0, 1.3), "solid": 0.8, "gap": 2.6},
	{"meshes": ["Rock_Medium_1", "Rock_Medium_2", "Rock_Medium_3"], "count": 70, "clear": 3.0, "scale": Vector2(0.5, 1.3), "solid": 1.2, "gap": 1.6},
	{"meshes": ["Grass_Common_Short", "Grass_Common_Tall", "Grass_Wispy_Short", "Grass_Wispy_Tall"], "count": 16000, "clear": 1.2, "scale": Vector2(0.35, 0.6)},
	{"meshes": ["Fern_1"], "count": 500, "clear": 2.5, "scale": Vector2(0.18, 0.28)},
	{"meshes": ["Plant_1", "Plant_1_Big", "Plant_7", "Plant_7_Big"], "count": 1700, "clear": 1.8, "scale": Vector2(0.3, 0.5)},
	{"meshes": ["Flower_3_Group", "Flower_3_Single", "Flower_4_Group", "Flower_4_Single"], "count": 1600, "clear": 1.6, "scale": Vector2(0.3, 0.45)},
	{"meshes": ["Mushroom_Common", "Mushroom_Laetiporus"], "count": 350, "clear": 2.0, "scale": Vector2(0.4, 0.8)},
	{"meshes": ["Petal_1", "Petal_2", "Petal_3", "Petal_4", "Petal_5"], "count": 900, "clear": 0.0, "scale": Vector2(0.6, 1.0)},
	{"meshes": ["Pebble_Round_1", "Pebble_Round_2", "Pebble_Round_3", "Pebble_Round_4", "Pebble_Round_5",
		"Pebble_Square_1", "Pebble_Square_2", "Pebble_Square_3", "Pebble_Square_4", "Pebble_Square_5", "Pebble_Square_6"],
		"count": 1600, "clear": 0.0, "scale": Vector2(0.5, 1.1)},
]

const PATH_STONES := ["RockPath_Round_Small_1", "RockPath_Round_Small_2", "RockPath_Round_Small_3",
	"RockPath_Round_Thin", "RockPath_Round_Wide", "RockPath_Square_Small_1", "RockPath_Square_Small_2"]

var _rng := RandomNumberGenerator.new()
var _meshes := {}
var _materials := {}
var _buckets := {}
var _taken := {}
var _body := StaticBody3D.new()


func _ready() -> void:
	_rng.seed = world_seed
	add_child(_body)
	_make_ground()
	_make_path()
	var start_z := half_size - 8.0
	_place_solid("TwistedTree_1", Vector3(path_x(start_z - 35.0) + 12.0, 0.0, start_z - 35.0), 1.2, 0.8, 2.6)
	for group in GROUPS:
		_scatter(group)
	_build_buckets()
	_place_player(start_z)


func path_x(z: float) -> float:
	return sin(z * 0.035) * 9.0 + sin(z * 0.013 + 1.7) * 6.0


func _make_ground() -> void:
	var plane := PlaneMesh.new()
	plane.size = Vector2.ONE * (half_size + 150.0) * 2.0
	var mat := StandardMaterial3D.new()
	mat.albedo_color = GROUND_COLOR
	mat.roughness = 1.0
	plane.material = mat
	var ground := MeshInstance3D.new()
	ground.mesh = plane
	add_child(ground)

	var floor_shape := CollisionShape3D.new()
	floor_shape.shape = WorldBoundaryShape3D.new()
	_body.add_child(floor_shape)

	for side in [Vector3.RIGHT, Vector3.LEFT, Vector3.FORWARD, Vector3.BACK]:
		var wall := BoxShape3D.new()
		wall.size = Vector3(2.0 if side.x != 0.0 else half_size * 2.0, 20.0, 2.0 if side.z != 0.0 else half_size * 2.0)
		var cs := CollisionShape3D.new()
		cs.shape = wall
		cs.position = side * (half_size + 1.0) + Vector3.UP * 10.0
		_body.add_child(cs)


func _make_path() -> void:
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	var reach := half_size + 30.0
	var prev_l := Vector3.ZERO
	var prev_r := Vector3.ZERO
	for i in int(reach * 2.0) + 1:
		var z := -reach + i
		var w := path_width * 0.5 + sin(z * 0.21) * 0.35
		var l := Vector3(path_x(z) - w, 0.02, z)
		var r := Vector3(path_x(z) + w, 0.02, z)
		if i > 0:
			for v in [prev_l, prev_r, r, prev_l, r, l]:
				st.set_normal(Vector3.UP)
				st.add_vertex(v)
		prev_l = l
		prev_r = r
	var mat := StandardMaterial3D.new()
	mat.albedo_color = PATH_COLOR
	mat.roughness = 1.0
	mat.cull_mode = BaseMaterial3D.CULL_DISABLED
	var path := MeshInstance3D.new()
	path.mesh = st.commit()
	path.material_override = mat
	add_child(path)

	var sz := -reach
	while sz < reach:
		if _rng.randf() < 0.55:
			var stone: String = PATH_STONES[_rng.randi() % PATH_STONES.size()]
			var pos := Vector3(path_x(sz) + _rng.randf_range(-0.8, 0.8), 0.0, sz)
			_put(_mesh(stone), _xform(pos, _rng.randf_range(0.6, 0.9)), true)
		sz += _rng.randf_range(1.0, 2.5)


func _scatter(group: Dictionary) -> void:
	var names: Array = group["meshes"]
	var solid: float = group.get("solid", 0.0)
	var big := solid > 0.0
	var reach := half_size + (25.0 if big else 0.0)
	var count := int(group["count"] * (1.0 if big else cover_density))
	var scale_range: Vector2 = group["scale"]
	for n in count:
		for attempt in 12:
			var x := _rng.randf_range(-reach, reach)
			var z := _rng.randf_range(-reach, reach)
			if absf(x - path_x(z)) < group["clear"] + _rng.randf() * 1.5:
				continue
			var s := _rng.randf_range(scale_range.x, scale_range.y)
			var mesh_name: String = names[_rng.randi() % names.size()]
			if big:
				if not _place_solid(mesh_name, Vector3(x, 0.0, z), s, solid, group["gap"]):
					continue
			else:
				_put(_mesh(mesh_name), _xform(Vector3(x, 0.0, z), s), false)
			break


func _place_solid(mesh_name: String, pos: Vector3, s: float, solid: float, gap: float) -> bool:
	var cell := Vector2i(floori(pos.x / 6.0), floori(pos.z / 6.0))
	for dx in range(-1, 2):
		for dz in range(-1, 2):
			for p in _taken.get(cell + Vector2i(dx, dz), []):
				if Vector2(pos.x - p.x, pos.z - p.y).length() < gap * s + p.z:
					return false
	if not _taken.has(cell):
		_taken[cell] = []
	_taken[cell].append(Vector3(pos.x, pos.z, gap * s))

	var shape := CylinderShape3D.new()
	shape.radius = solid * s
	shape.height = 4.0
	var cs := CollisionShape3D.new()
	cs.shape = shape
	cs.position = pos + Vector3.UP * 2.0
	_body.add_child(cs)
	_put(_mesh(mesh_name), _xform(pos, s), true)
	return true


func _xform(pos: Vector3, s: float) -> Transform3D:
	return Transform3D(Basis(Vector3.UP, _rng.randf() * TAU).scaled(Vector3.ONE * s), pos)


# Instances are grouped per model and per cell, so far cells are culled and small things stop drawing past cover_draw_distance.
func _put(mesh: Mesh, xform: Transform3D, big: bool) -> void:
	if mesh == null:
		return
	var cell := Vector2i(floori(xform.origin.x / cell_size), floori(xform.origin.z / cell_size))
	var key := "%d|%d|%d" % [mesh.get_instance_id(), cell.x, cell.y]
	if not _buckets.has(key):
		_buckets[key] = {"mesh": mesh, "cell": cell, "big": big, "list": []}
	_buckets[key]["list"].append(xform)


func _build_buckets() -> void:
	for key in _buckets:
		var bucket: Dictionary = _buckets[key]
		var list: Array = bucket["list"]
		var cell: Vector2i = bucket["cell"]
		var centre := Vector3((cell.x + 0.5) * cell_size, 0.0, (cell.y + 0.5) * cell_size)
		var mm := MultiMesh.new()
		mm.transform_format = MultiMesh.TRANSFORM_3D
		mm.mesh = bucket["mesh"]
		mm.instance_count = list.size()
		for i in list.size():
			var xf: Transform3D = list[i]
			xf.origin -= centre
			mm.set_instance_transform(i, xf)
		var mmi := MultiMeshInstance3D.new()
		mmi.multimesh = mm
		mmi.position = centre
		if not bucket["big"]:
			mmi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
			mmi.visibility_range_end = cover_draw_distance
			mmi.visibility_range_end_margin = 8.0
		add_child(mmi)
	_buckets.clear()


func _place_player(start_z: float) -> void:
	var player := get_node_or_null("Player") as Node3D
	if player == null:
		return
	var pos := Vector3(path_x(start_z), 0.2, start_z)
	player.global_position = pos
	player.rotation.y = atan2(-(path_x(start_z - 5.0) - pos.x), 5.0)
	player.set("spawn", pos)


func _mesh(mesh_name: String) -> Mesh:
	if _meshes.has(mesh_name):
		return _meshes[mesh_name]
	var mesh: Mesh = load(NATURE + mesh_name + ".obj")
	if mesh == null:
		push_warning("missing model: " + mesh_name)
	else:
		for i in mesh.get_surface_count():
			var mat_name := _surface_material_name(mesh, i)
			if PALETTE.has(mat_name):
				mesh.surface_set_material(i, _material(mat_name))
	_meshes[mesh_name] = mesh
	return mesh


func _surface_material_name(mesh: Mesh, i: int) -> String:
	var mat := mesh.surface_get_material(i)
	if mat and PALETTE.has(mat.resource_name):
		return mat.resource_name
	if mesh is ArrayMesh:
		return (mesh as ArrayMesh).surface_get_name(i)
	return ""


func _material(mat_name: String) -> StandardMaterial3D:
	if _materials.has(mat_name):
		return _materials[mat_name]
	var m := StandardMaterial3D.new()
	m.resource_name = mat_name
	m.albedo_color = PALETTE[mat_name]
	m.roughness = 1.0
	var thin := mat_name.begins_with("Leaves") or mat_name == "Flowers" or mat_name == "Grass"
	if thin:
		m.cull_mode = BaseMaterial3D.CULL_DISABLED
	var tex := _texture(mat_name, "")
	if tex:
		m.albedo_color = Color.WHITE
		m.albedo_texture = tex
		if thin:
			m.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA_SCISSOR
			m.alpha_scissor_threshold = 0.5
		var normal := _texture(mat_name, "_Normal")
		if normal:
			m.normal_enabled = true
			m.normal_texture = normal
	_materials[mat_name] = m
	return m


func _texture(mat_name: String, suffix: String) -> Texture2D:
	var files: Array[String] = []
	if TEXTURE_FILES.has(mat_name):
		files.append(String(TEXTURE_FILES[mat_name]).get_basename() + suffix + ".png")
	files.append(mat_name + suffix + ".png")
	files.append(mat_name + "_C" + suffix + ".png")
	for f in files:
		if ResourceLoader.exists(TEXTURES + f):
			return load(TEXTURES + f)
	return null
