# THE STRANGEST FLEA MARKET in Godot, the first test (owner, 18 Oct 2026: "build out a test small game with just one building and my walker on
# godot. match graphics exactly"): the bodega and the ground round it, the Walker, the isometric view as THE MARKET opens. Everything drawn comes
# from the three.js game itself (godot/tools/bake.cjs, data/): its faces, atlases, lamps, solids and ground; the Walker's mesh and his moves
# from the game's own rig. The look is THE MARKET's, ported: shaders/world.gdshader (map-pre.js), walker.gdshader (walker3d.js's toon),
# look.gdshader (oldlook.js). The picture is drawn at the art's own pixels (30 a world unit) and enlarged by whole screen pixels, as THE MARKET's.
extends Node

const PPU := 30.0          # the art's pixels a world unit (THE MARKET's PPU, its RES 1)
const PXS := 2.0           # THE MARKET's device pixels a game pixel (PXS, at one device pixel a CSS pixel)
const RESL := [0.5, 0.75, 1.0, 1.5, 2.0, 3.0, 4.0, 6.0, 8.0]
const ZUPX := 6.0          # one step finer once zoomed in to 6 screen pixels a pixel
const TILE := 1.13
const MAXW := 19.0         # the zoom out stops at some 19 tiles across
const R_BODY := 0.3        # his radius against the solids (collide())
const PITCH := 0.5235987755982988   # the isometric view's tilt (30 degrees)
const DIST := 20.0         # the camera held back along its view (orthographic: how far back changes nothing in the picture; near, the sun's shadow map is spent on what is seen)

var W: Dictionary          # world.json
var WK: Dictionary         # walker.json
var vp: SubViewport
var cam: Camera3D
var view: TextureRect
var look: ShaderMaterial
var sun: DirectionalLight3D
var env: Environment
var mats: Array[ShaderMaterial] = []
var lamps: Array = []
var lamp_key := ""
var lamp_sh: OmniLight3D
var walker: MeshInstance3D
var wmat: ShaderMaterial
var self_vp: SubViewport
var self_cam: Camera3D
var self_mi: MeshInstance3D
var self_mat: ShaderMaterial
var clips := {}
var gnd: PackedFloat32Array
var solids: Array = []
var bound: Dictionary

# his state (the rig's, as THE MARKET's loop steps it)
var pos := Vector3.ZERO
var heading := 0.8
var dist := 0.0            # how far his feet have carried him this walk (the walk's and the run's frames go by it)
var moving := false
var running := false
var idle_t := 0.0
# the view
var yaw := -PI / 4.0
var yaw_to := -PI / 4.0
var ppu := 38.262735018773725
var ppu_to := 38.262735018773725
var RESI := 2
var S := 2
var RW := 2
var RH := 2
var rppu := PPU
var hour := 15.5
var room = null
var shot := ""
var shot_frames := 0
var keys := {}
var noshadow := false
var shd := ""
var shot_at := 40

func _ready() -> void:
	var args := OS.get_cmdline_user_args()
	if OS.has_feature("web"):   # (in a browser the page's query is the command line: ?at=9.9,-6&hour=21&noshadow)
		var q := str(JavaScriptBridge.eval("location.search", true)).trim_prefix("?")
		for kv in q.split("&", false): args.append("--" + kv.uri_decode())
	for a in args:
		if a.begins_with("--shot="): shot = a.substr(7)
		if a.begins_with("--hour="): hour = float(a.substr(7))
		if a == "--noshadow": noshadow = true
		if a.begins_with("--shd="): shd = a.substr(6)
		if a.begins_with("--hold="):   # (a test's: keys held from the start, as "w,shift")
			for k in a.substr(7).split(","): keys[k] = true
		if a.begins_with("--frames="): shot_at = int(a.substr(9))
		if a.begins_with("--at="):
			var p := a.substr(5).split(",")
			pos = Vector3(float(p[0]), 0.0, float(p[1]))
	W = JSON.parse_string(FileAccess.get_file_as_string("res://data/world.json"))
	WK = JSON.parse_string(FileAccess.get_file_as_string("res://data/walker.json"))
	_build_view()
	_build_world()
	_build_walker()
	if pos == Vector3.ZERO:
		var s: Array = W.start.pos
		pos = Vector3(s[0], s[1], s[2])
		heading = W.start.hd
	ppu = W.cv.ppu
	ppu_to = ppu
	_set_hour(hour)
	lamp_key = ""
	get_viewport().size_changed.connect(_resize)
	_resize()
	# (the page's loading line goes once the first picture is up: shell.html)
	if OS.has_feature("web"):
		JavaScriptBridge.eval("window.__gdReady&&window.__gdReady()", true)

# ---- the picture: drawn at the art's pixels, shown enlarged by whole screen pixels, with the final touch ----
func _build_view() -> void:
	vp = SubViewport.new()
	vp.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	vp.msaa_3d = Viewport.MSAA_DISABLED
	vp.screen_space_aa = Viewport.SCREEN_SPACE_AA_DISABLED
	vp.positional_shadow_atlas_size = 2048
	add_child(vp)
	cam = Camera3D.new()
	cam.projection = Camera3D.PROJECTION_ORTHOGONAL
	cam.near = 0.1
	cam.far = 800.0
	vp.add_child(cam)
	env = Environment.new()
	env.background_mode = Environment.BG_COLOR
	env.ambient_light_source = Environment.AMBIENT_SOURCE_DISABLED
	env.reflected_light_source = Environment.REFLECTION_SOURCE_DISABLED
	env.tonemap_mode = Environment.TONE_MAPPER_LINEAR
	var we := WorldEnvironment.new()
	we.environment = env
	vp.add_child(we)
	sun = DirectionalLight3D.new()
	sun.shadow_enabled = true
	sun.directional_shadow_mode = DirectionalLight3D.SHADOW_PARALLEL_2_SPLITS   # (the picture sits some 20 back along the view: the second split holds it, crisp)
	sun.directional_shadow_max_distance = 34.0
	sun.directional_shadow_split_1 = 0.45
	sun.shadow_bias = 0.12
	sun.shadow_normal_bias = 2.0
	sun.light_specular = 0.0
	vp.add_child(sun)
	if shd != "":
		var q := shd.split(":")
		sun.directional_shadow_mode = int(q[0]); sun.directional_shadow_max_distance = float(q[1]); sun.shadow_normal_bias = float(q[2]); sun.shadow_bias = float(q[3])
	view = TextureRect.new()
	view.texture = vp.get_texture()
	view.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	view.stretch_mode = TextureRect.STRETCH_SCALE
	view.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	look = ShaderMaterial.new()
	look.shader = load("res://shaders/look.gdshader")
	view.material = look
	var cl := CanvasLayer.new()
	add_child(cl)
	var bg := ColorRect.new()
	bg.color = Color(0, 0, 0)
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	cl.add_child(bg)
	cl.add_child(view)

# the zoom's rule (THE MARKET's ui: vpu, art, pxS, rppu): a tile always the same number of art pixels, the pixels bigger by whole screen pixels
func _resize() -> void:
	var ws := get_viewport().get_visible_rect().size
	var vpu := PXS * ppu
	var res: float = RESL[min(RESL.size() - 1, RESI + (1 if vpu / (PPU * RESL[RESI]) >= ZUPX else 0))]
	var art := PPU * res
	var minpx := maxi(1, roundi(PXS / res))
	S = maxi(minpx, roundi(vpu / art))
	rppu = vpu / S if roundi(vpu / art) < minpx else art
	RW = int(ceil(ws.x / S / 2.0)) * 2
	RH = int(ceil(ws.y / S / 2.0)) * 2
	vp.size = Vector2i(RW, RH)
	cam.size = RH / rppu
	view.size = Vector2(RW * S, RH * S)
	view.position = Vector2(floor((ws.x - RW * S) / 2.0), floor((ws.y - RH * S) / 2.0))

# ---- the world round the bodega ----
func _f32(b: PackedByteArray, off: int, n: int) -> PackedFloat32Array:
	return b.slice(off, off + n * 4).to_float32_array()

func _build_world() -> void:
	var bin := FileAccess.get_file_as_bytes("res://data/world.bin")
	var tex := []
	for t in W.tex:
		var img := Image.new()
		img.load_png_from_buffer(FileAccess.get_file_as_bytes("res://data/tex%d.pngdata" % int(t.i)))
		tex.append(ImageTexture.create_from_image(img))
	var SH := {
		"lit": load("res://shaders/world.gdshader"), "lit_glass": load("res://shaders/world_glass.gdshader"),
		"unlit": load("res://shaders/world_unlit.gdshader"), "unlit_glass": load("res://shaders/world_unlit_glass.gdshader"),
		"add": load("res://shaders/world_add.gdshader")}
	for G in W.groups:
		var n := int(G.n)
		var P := _f32(bin, int(G.pos), n * 3)
		var N := _f32(bin, int(G.nrm), n * 3)
		var U := _f32(bin, int(G.uv), n * 2)
		var C := _f32(bin, int(G.col), n * 3)
		var m := ShaderMaterial.new()
		var glass: bool = float(G.get("op", 1.0)) < 0.999
		var add: bool = G.get("add", false)
		m.shader = SH["add"] if add else SH[("lit" if G.lit else "unlit") + ("_glass" if glass else "")]
		if glass: m.set_shader_parameter("opacity", float(G.op))
		if int(G.tex) >= 0:
			m.set_shader_parameter("tex", tex[int(G.tex)])
			m.set_shader_parameter("has_tex", true)
		if G.lit and int(G.em) >= 0:
			m.set_shader_parameter("etex", tex[int(G.em)])
			m.set_shader_parameter("has_em", true)
			m.set_shader_parameter("ek", float(G.ek))
		mats.append(m)
		# cut into map chunks (16 world units), so each lights only what is near it and is left out when off the picture
		var chunks := {}
		for t in range(n / 3):
			var i := t * 3
			var cx := (P[i * 3] + P[i * 3 + 3] + P[i * 3 + 6]) / 3.0
			var cz := (P[i * 3 + 2] + P[i * 3 + 5] + P[i * 3 + 8]) / 3.0
			var k := Vector2i(floori(cx / 16.0), floori(cz / 16.0))
			if not chunks.has(k): chunks[k] = PackedInt32Array()
			chunks[k].append(t)
		for k in chunks:
			var tl: PackedInt32Array = chunks[k]
			var vv := PackedVector3Array(); var nn := PackedVector3Array(); var uu := PackedVector2Array(); var cc := PackedColorArray()
			vv.resize(tl.size() * 3); nn.resize(tl.size() * 3); uu.resize(tl.size() * 3); cc.resize(tl.size() * 3)
			var o := 0
			for t in tl:
				for v in [t * 3, t * 3 + 2, t * 3 + 1]:   # (three.js's front faces wind counter-clockwise, Godot's clockwise)
					vv[o] = Vector3(P[v * 3], P[v * 3 + 1], P[v * 3 + 2])
					nn[o] = Vector3(N[v * 3], N[v * 3 + 1], N[v * 3 + 2])
					uu[o] = Vector2(U[v * 2], U[v * 2 + 1])
					cc[o] = Color(C[v * 3], C[v * 3 + 1], C[v * 3 + 2])
					o += 1
			var arr := []
			arr.resize(Mesh.ARRAY_MAX)
			arr[Mesh.ARRAY_VERTEX] = vv; arr[Mesh.ARRAY_NORMAL] = nn; arr[Mesh.ARRAY_TEX_UV] = uu; arr[Mesh.ARRAY_COLOR] = cc
			var am := ArrayMesh.new()
			am.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arr)
			var mi := MeshInstance3D.new()
			mi.mesh = am
			mi.material_override = m
			mi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_DOUBLE_SIDED if G.get("cs", true) and not glass and not add else GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
			vp.add_child(mi)
	# the lamps: records (LITE's), lit in the shaders (world.gdshaderinc, walker.gdshader)
	for L in W.lamps:
		lamps.append({"p": Vector3(L.p[0], L.p[1], L.p[2]), "c": Vector3(L.c[0], L.c[1], L.c[2]) * float(L.i), "d": float(L.d), "dec": float(L.dec),
			"fire": bool(L.get("fire", false)), "both": bool(L.get("both", false))})
	lamp_sh = OmniLight3D.new()
	lamp_sh.shadow_enabled = true
	lamp_sh.shadow_bias = 0.05
	lamp_sh.shadow_normal_bias = 1.0
	lamp_sh.light_specular = 0.0
	lamp_sh.visible = false
	vp.add_child(lamp_sh)
	# the ground's height and the solids
	gnd = FileAccess.get_file_as_bytes("res://data/ground.bin").to_float32_array()
	solids = W.sol
	bound = W.R

func _ground(x: float, z: float) -> float:
	var g: Dictionary = W.ground
	var fx: float = (x - g.x0) / g.st
	var fz: float = (z - g.z0) / g.st
	var nx := int(g.nx); var nz := int(g.nz)
	var i := clampi(roundi(fx), 0, nx - 1); var j := clampi(roundi(fz), 0, nz - 1)
	return gnd[j * nx + i]

func _collide(p: Vector3) -> Vector3:
	var r := R_BODY
	p.x = clampf(p.x, bound.x0 + 1.0, bound.x1 - 1.0)
	p.z = clampf(p.z, bound.z0 + 1.0, bound.z1 - 1.0)
	for s in solids:
		var x0: float = s[0]; var z0: float = s[1]; var x1: float = s[2]; var z1: float = s[3]
		var cx := clampf(p.x, x0, x1); var cz := clampf(p.z, z0, z1)
		var dx := p.x - cx; var dz := p.z - cz; var d2 := dx * dx + dz * dz
		if d2 >= r * r: continue
		if d2 > 1e-8:
			var d := sqrt(d2)
			p.x = cx + dx / d * r; p.z = cz + dz / d * r
		else:
			var o := [p.x - x0 + r, x1 - p.x + r, p.z - z0 + r, z1 - p.z + r]
			var m: float = o.min()
			if m == o[0]: p.x = x0 - r
			elif m == o[1]: p.x = x1 + r
			elif m == o[2]: p.z = z0 - r
			else: p.z = z1 + r
	return p

# ---- the Walker ----
func _build_walker() -> void:
	var b := FileAccess.get_file_as_bytes("res://data/walker.bin")
	var nv := int(WK.nv)
	var P := _f32(b, int(WK.pos), nv * 3)
	var N := _f32(b, int(WK.nrm), nv * 3)
	var C := _f32(b, int(WK.col), nv * 3)
	var I := b.slice(int(WK.idx), int(WK.idx) + int(WK.ni) * 4).to_int32_array()
	for t in range(0, I.size(), 3):   # (the winding turned, as the world's)
		var x := I[t + 1]; I[t + 1] = I[t + 2]; I[t + 2] = x
	var pid := _f32(b, int(WK.pid), nv)
	var vv := PackedVector3Array(); var nn := PackedVector3Array(); var cc := PackedColorArray()
	vv.resize(nv); nn.resize(nv); cc.resize(nv)
	for v in nv:
		vv[v] = Vector3(P[v * 3], P[v * 3 + 1], P[v * 3 + 2])
		nn[v] = Vector3(N[v * 3], N[v * 3 + 1], N[v * 3 + 2])
		cc[v] = Color(C[v * 3], C[v * 3 + 1], C[v * 3 + 2])
	var arr := []
	arr.resize(Mesh.ARRAY_MAX)
	arr[Mesh.ARRAY_VERTEX] = vv; arr[Mesh.ARRAY_NORMAL] = nn; arr[Mesh.ARRAY_COLOR] = cc; arr[Mesh.ARRAY_INDEX] = I
	arr[Mesh.ARRAY_CUSTOM0] = pid
	var am := ArrayMesh.new()
	am.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arr, [], {}, Mesh.ARRAY_CUSTOM_R_FLOAT << Mesh.ARRAY_FORMAT_CUSTOM0_SHIFT)
	wmat = ShaderMaterial.new()
	wmat.shader = load("res://shaders/walker.gdshader")
	wmat.set_shader_parameter("depth", float(WK.shade.depth) if WK.shade else 0.78)
	wmat.set_shader_parameter("self_k", float(WK.uSelf))
	walker = MeshInstance3D.new()
	walker.mesh = am
	walker.material_override = wmat
	walker.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_DOUBLE_SIDED
	walker.custom_aabb = AABB(Vector3(-40, -10, -40), Vector3(80, 80, 80))
	vp.add_child(walker)
	# his moves: each frame the pieces' frames, three rows a piece
	for k in ["idle", "walk", "run"]:
		var c: Dictionary = WK[k]
		var n := int(c.n)
		var np := int(WK.np)
		var M := _f32(b, int(c.m), n * np * 12)
		var frames := []
		for f in n:
			var a := PackedVector4Array()
			a.resize(96)
			for p in np:
				var o := (f * np + p) * 12
				a[p * 3] = Vector4(M[o], M[o + 1], M[o + 2], M[o + 3])
				a[p * 3 + 1] = Vector4(M[o + 4], M[o + 5], M[o + 6], M[o + 7])
				a[p * 3 + 2] = Vector4(M[o + 8], M[o + 9], M[o + 10], M[o + 11])
			frames.append(a)
		clips[k] = {"keys": c["keys"], "frames": frames, "len": c.get("len", 0.0), "speed": c.get("speed", 0.0), "dur": c.get("dur", 0.0)}
	# SELF: his own shadow map, from his light (a world of its own: his pieces alone)
	self_vp = SubViewport.new()
	self_vp.size = Vector2i(512, 512)
	self_vp.own_world_3d = true
	self_vp.transparent_bg = true
	self_vp.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	add_child(self_vp)
	self_cam = Camera3D.new()
	self_cam.projection = Camera3D.PROJECTION_ORTHOGONAL
	self_cam.size = 4.2
	self_cam.near = 0.1
	self_cam.far = 12.0
	self_vp.add_child(self_cam)
	self_mat = ShaderMaterial.new()
	self_mat.shader = load("res://shaders/walker_depth.gdshader")
	self_mi = MeshInstance3D.new()
	self_mi.mesh = am
	self_mi.material_override = self_mat
	self_mi.custom_aabb = walker.custom_aabb
	self_mi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	self_vp.add_child(self_mi)
	wmat.set_shader_parameter("self_sm", self_vp.get_texture())

func _frame_at(c: Dictionary, x: float) -> PackedVector4Array:
	var ks: Array = c["keys"]
	var lo := 0; var hi := ks.size() - 1
	while lo < hi:
		var mid := (lo + hi + 1) / 2
		if ks[mid] <= x: lo = mid
		else: hi = mid - 1
	return c["frames"][lo]

# ---- the clock's light (the bake's table, every half hour) ----
func _set_hour(h: float) -> void:
	hour = fposmod(h, 24.0)
	var T: Array = W.hours
	var H: Dictionary = T[int(round(hour * 2.0)) % T.size()]
	if H.has("sun") and H.sun:
		var d := Vector3(H.sun.d[0], H.sun.d[1], H.sun.d[2]).normalized()
		sun.visible = true
		sun.look_at_from_position(Vector3.ZERO, -d, Vector3.UP if absf(d.y) < 0.99 else Vector3.FORWARD)
		sun.light_color = Color(H.sun.c[0], H.sun.c[1], H.sun.c[2]).linear_to_srgb()
		sun.light_energy = H.sun.i
		sun.shadow_enabled = H.sun.sh and not noshadow
	else:
		sun.light_energy = 0.0   # (kept: the lamps and the sky's fill ride on its call in the shaders)
	var hs := Vector3.ZERO; var hg := Vector3.ZERO
	if H.has("hemi") and H.hemi:
		hs = Vector3(H.hemi.sky[0], H.hemi.sky[1], H.hemi.sky[2]) * float(H.hemi.i)
		hg = Vector3(H.hemi.gnd[0], H.hemi.gnd[1], H.hemi.gnd[2]) * float(H.hemi.i)
	for m in mats:
		m.set_shader_parameter("hemi_sky", hs)
		m.set_shader_parameter("hemi_gnd", hg)
	wmat.set_shader_parameter("hemi_sky", hs)
	wmat.set_shader_parameter("hemi_gnd", hg)
	if H.bg: env.background_color = Color(H.bg[0], H.bg[1], H.bg[2]).linear_to_srgb()
	var fc := Vector4.ZERO; var fnf := Vector2(1e6, 2e6)
	if H.fog:
		var c := Color(H.fog.c[0], H.fog.c[1], H.fog.c[2])
		fc = Vector4(c.r, c.g, c.b, 1.0)
		fnf = Vector2(H.fog.near, H.fog.far)
	for m in mats:
		m.set_shader_parameter("fog_col", fc)
		m.set_shader_parameter("fog_nf", fnf)
	_grade(H)

var _H: Dictionary
func _grade(H: Dictionary) -> void:
	_H = H
	var inside: bool = room != null
	var dark := float(H.dark)
	var el := float(H.elev)
	var cool := maxf(0.5 * clampf((el + 3.0) / 12.0, 0.0, 1.0), 0.7 * clampf(1.0 - absf(el - 3.0) / 10.0, 0.0, 1.0)) * (0.0 if inside else 1.0)
	look.set_shader_parameter("night", dark)
	look.set_shader_parameter("glow_k", 1.28 if (dark > 0.5 or inside) else 0.5)
	look.set_shader_parameter("cool", cool)
	if inside: env.background_color = Color(0, 0, 0)
	elif H.bg: env.background_color = Color(H.bg[0], H.bg[1], H.bg[2]).linear_to_srgb()

# ---- input ----
func _unhandled_input(e: InputEvent) -> void:
	if e is InputEventKey:
		var k := OS.get_keycode_string(e.keycode).to_lower()
		keys[k] = e.pressed
		if e.pressed and not e.echo:
			if k == "q": yaw_to += PI / 2.0
			if k == "e": yaw_to -= PI / 2.0
			if k == "bracketright": _set_hour(hour + 0.5)
			if k == "bracketleft": _set_hour(hour - 0.5)
	if e is InputEventMouseButton and e.pressed:
		if e.button_index == MOUSE_BUTTON_WHEEL_UP: ppu_to *= 1.12
		if e.button_index == MOUSE_BUTTON_WHEEL_DOWN: ppu_to /= 1.12

func _k(n: String) -> bool:
	return keys.get(n, false)

# ---- the loop: move, animate, then the camera follows him ----
func _process(dt: float) -> void:
	dt = minf(dt, 0.05)
	var ws := get_viewport().get_visible_rect().size
	ppu_to = clampf(ppu_to, ws.x / (PXS * MAXW * TILE), PPU * 8.0)
	var ease := minf(1.0, dt * 12.0)
	yaw += (yaw_to - yaw) * ease
	if absf(yaw_to - yaw) < 1e-4: yaw = yaw_to
	var p0 := ppu
	ppu *= pow(ppu_to / ppu, ease)
	if absf(ppu - p0) > 1e-6: _resize()
	# steering: screen-up on the ground, screen-right
	var fx := -sin(yaw); var fz := -cos(yaw)
	var mx := 0.0; var mz := 0.0
	if _k("w") or _k("up"): mx += fx; mz += fz
	if _k("s") or _k("down"): mx -= fx; mz -= fz
	if _k("d") or _k("right"): mx += -fz; mz += fx
	if _k("a") or _k("left"): mx -= -fz; mz -= fx
	var ml := Vector2(mx, mz).length()
	if ml > 0.0:
		# he turns toward where you steer (half a turn in a third of a second) and goes the way he faces
		var dh := atan2(mx, mz) - heading
		dh = atan2(sin(dh), cos(dh))
		var turn := 3.0 * PI * dt
		heading += clampf(dh, -turn, turn)
		if not moving: dist = 0.0   # (from a stop a walk starts at its first frame)
		moving = true
		var was := running
		running = _k("shift")
		var c: Dictionary = clips["run" if running else "walk"]
		if was != running and moving:
			var pc: Dictionary = clips["walk" if running else "run"]
			dist = fposmod(dist, pc["len"]) / pc["len"] * c["len"]   # (the step's phase kept across walk and run)
		var go: float = c["speed"] * dt
		dist += go
		pos.x += sin(heading) * go
		pos.z += cos(heading) * go
		pos = _collide(pos)
	else:
		if moving: idle_t = 0.0   # (he stops the moment you let go)
		moving = false
		idle_t += dt
	pos.y += (_ground(pos.x, pos.z) - pos.y) * minf(1.0, dt * 20.0)
	var fr: PackedVector4Array
	if moving:
		var c: Dictionary = clips["run" if running else "walk"]
		fr = _frame_at(c, fposmod(dist, c["len"]))
	else:
		var c: Dictionary = clips["idle"]
		fr = _frame_at(c, fposmod(idle_t, c["dur"]))
	wmat.set_shader_parameter("pm", fr)
	self_mat.set_shader_parameter("pm", fr)
	# the camera, on the picture's pixel grid (nothing crawls as he goes), and he on it with it
	var dirv := Vector3(sin(yaw) * cos(PITCH), sin(PITCH), cos(yaw) * cos(PITCH))
	var basis := Basis.looking_at(-dirv, Vector3.UP)
	var rt := basis.x; var up := basis.y
	var tgt := pos
	var sx := tgt.dot(rt); var sy := tgt.dot(up)
	var tsn: Vector3 = tgt + rt * (roundf(sx * rppu) / rppu - sx) + up * (roundf(sy * rppu) / rppu - sy)
	cam.global_transform = Transform3D(basis, tsn + dirv * DIST)
	var wsn: Vector3 = pos + (tsn - tgt)
	var sc: Array = WK.scale
	walker.transform = Transform3D(Basis(Vector3.UP, heading).scaled(Vector3(sc[0], sc[1], sc[2])), wsn)
	self_mi.transform = walker.transform
	# SELF: his light falls from the camera's side, turned as the view turns (W3.place)
	var L0: Array = WK.Lw[0]
	var lw := Vector3(L0[2], L0[3], L0[4]).rotated(Vector3.UP, yaw).normalized()
	var mid: Vector3 = wsn + Vector3(0, 1.25, 0)
	self_cam.look_at_from_position(mid + lw * 6.0, mid, Vector3.FORWARD if absf(lw.y) > 0.6 else Vector3.UP)
	var svp := Projection.create_orthogonal(-2.1, 2.1, -2.1, 2.1, 0.1, 12.0) * Projection(self_cam.global_transform.affine_inverse())
	wmat.set_shader_parameter("self_vp", svp)
	self_mat.set_shader_parameter("self_vp", svp)
	_lamps(dt)
	_rooms()
	for m in mats:
		m.set_shader_parameter("player", pos)
		m.set_shader_parameter("main_cam", cam.global_position)
	if shot != "":
		shot_frames += 1
		if shot_frames == shot_at:
			await RenderingServer.frame_post_draw
			get_viewport().get_texture().get_image().save_png(shot)
			get_tree().quit()

# LITE (map-post.js): a lamp in a room lights only that room, one outside every room only the outside; of those, the eight nearest you
# (a fire's counted half as far), picked four times a second; handed to every lit shader
var lamp_t := 0.0
func _lamps(dt: float) -> void:
	lamp_t -= dt
	if lamp_t > 0.0: return
	lamp_t = 0.25
	var e := 0.5 * TILE
	var inb := func(b: Dictionary, p: Vector3, m: float) -> bool:
		return p.x > b.x0 - m and p.x < b.x1 + m and p.z > b.z0 - m and p.z < b.z1 + m and p.y > b.y0 - e and p.y < b.y1 + e
	var here := pos + Vector3(0, 1.2 * TILE, 0)
	var sel := []
	for i in lamps.size():
		var L: Dictionary = lamps[i]
		var ok: bool = L.both
		if not ok:
			if room != null: ok = inb.call(room, L.p, e)
			else:
				ok = true
				for b in W.get("allRooms", W.rooms):
					if inb.call(b, L.p, -e): ok = false
		if ok: sel.append([L.p.distance_squared_to(here) * (0.25 if L.fire else 1.0), i])
	sel.sort_custom(func(a, b): return a[0] < b[0])
	var lp := PackedVector4Array(); var lc := PackedVector4Array(); lp.resize(8); lc.resize(8)
	var n := mini(8, sel.size()); var key := ""
	for r in n:
		var L: Dictionary = lamps[sel[r][1]]
		lp[r] = Vector4(L.p.x, L.p.y, L.p.z, L.d); lc[r] = Vector4(L.c.x, L.c.y, L.c.z, L.dec); key += str(sel[r][1]) + ","
	# the one lamp shadow, the nearest's: indoors and at night (out in the sun the light is at its cap, a lamp's shadow can't show)
	var sep := n > 0 and (room != null or float(_H.get("dark", 0)) > 0.5) and not noshadow
	key += "s" if sep else ""
	if key == lamp_key: return
	lamp_key = key
	lamp_sh.visible = sep
	if sep:
		var L0: Dictionary = lamps[sel[0][1]]
		lamp_sh.position = L0.p - Vector3(0, 0.5, 0); lamp_sh.omni_range = L0.d * 1.5; lamp_sh.omni_attenuation = 0.0   # (its own falloff in the shaders; Godot's only for its shadow)
	var all: Array = mats.duplicate(); all.append(wmat)
	for m in all:
		m.set_shader_parameter("lamp_pos", lp); m.set_shader_parameter("lamp_col", lc); m.set_shader_parameter("lamp_n", n)
		m.set_shader_parameter("lamp_first", 1 if sep else 0)

# only the room you're in (rooms.js): a room is yours once all of you is in it; the near side cut above your knee
func _rooms() -> void:
	var IN := -0.55 * TILE
	var hit = null
	for b in W.rooms:
		if pos.x > b.x0 - IN and pos.x < b.x1 + IN and pos.z > b.z0 - IN and pos.z < b.z1 + IN and pos.y > b.y0 - 0.3 and pos.y < b.y1:
			hit = b
			break
	if hit != room:
		room = hit
		lamp_t = 0.0
		if _H: _grade(_H)
	var m := 0.14 * TILE
	var cx := cam.global_position.x - pos.x; var cz := cam.global_position.z - pos.z
	var l := maxf(Vector2(cx, cz).length(), 1e-6)
	for mt in mats:
		mt.set_shader_parameter("in_room", room != null)
		if room != null:
			mt.set_shader_parameter("room_xz", Vector4(room.x0 - m, room.z0 - m, room.x1 + m, room.z1 + m))
			mt.set_shader_parameter("room_y", Vector2(room.y0, room.y1 + 0.05))
			mt.set_shader_parameter("near_u", Vector3(cx / l, cz / l, 0.6 * TILE))
			mt.set_shader_parameter("knee", pos.y + 0.45 / (PPU * cos(PI / 6.0)) * 24.0 / 0.84)   # (above his knee: 0.45 m)
