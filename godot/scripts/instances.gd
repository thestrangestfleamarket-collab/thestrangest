@tool
# The map's repeated things (map/world.json + map/world.bin, from godot/tools/export.cjs) as MultiMeshes of the shapes under _protos.
extends Node3D

const BASE := "res://map/world"
const STRIDE := 15

func _ready() -> void:
	if get_node_or_null("_instances") or not FileAccess.file_exists(BASE + ".json"):
		return
	var protos := get_node_or_null("_protos") as Node3D
	if protos == null:
		return
	protos.visible = false
	var info: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(BASE + ".json"))
	var data := FileAccess.get_file_as_bytes(BASE + ".bin").to_float32_array()
	var sets := {}
	for e in info["instances"]:
		var key := "%s/%s" % [e["group"], e["proto"]]
		if not sets.has(key):
			sets[key] = {"group": e["group"], "proto": e["proto"], "name": e["name"], "runs": []}
		sets[key]["runs"].append([int(e["at"]), int(e["n"])])
	var holder := Node3D.new()
	holder.name = "_instances"
	add_child(holder)
	var meshes := {}
	for key in sets:
		var s: Dictionary = sets[key]
		if not meshes.has(s["proto"]):
			var p := protos.get_node_or_null(NodePath(s["proto"])) as MeshInstance3D
			meshes[s["proto"]] = _tinted(p.mesh) if p else null
		var mesh: Mesh = meshes[s["proto"]]
		if mesh == null:
			continue
		var total := 0
		for r in s["runs"]:
			total += r[1]
		var mm := MultiMesh.new()
		mm.transform_format = MultiMesh.TRANSFORM_3D
		mm.use_colors = true
		mm.mesh = mesh
		mm.instance_count = total
		var i := 0
		for r in s["runs"]:
			for k in r[1]:
				var o: int = r[0] + k * STRIDE
				mm.set_instance_transform(i, Transform3D(
					Vector3(data[o], data[o + 1], data[o + 2]),
					Vector3(data[o + 3], data[o + 4], data[o + 5]),
					Vector3(data[o + 6], data[o + 7], data[o + 8]),
					Vector3(data[o + 9], data[o + 10], data[o + 11])))
				mm.set_instance_color(i, Color(data[o + 12], data[o + 13], data[o + 14]))
				i += 1
		var node := MultiMeshInstance3D.new()
		node.name = "%s_%s_%s" % [s["group"], s["name"], s["proto"]]
		node.multimesh = mm
		holder.add_child(node)

# a copy of the shape whose materials take each copy's colour (the game tints its repeated things one by one)
func _tinted(src: Mesh) -> Mesh:
	var m = src.duplicate()
	for i in m.get_surface_count():
		var mat := m.surface_get_material(i) as BaseMaterial3D
		if mat:
			mat = mat.duplicate() as BaseMaterial3D
			mat.vertex_color_use_as_albedo = true
			m.surface_set_material(i, mat)
	return m
