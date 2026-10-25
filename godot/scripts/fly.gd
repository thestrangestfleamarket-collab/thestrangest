# A free camera over the map: hold the right mouse button to look, WASD to move, Q / E down and up, Shift faster, the wheel the speed.
extends Camera3D

var speed := 12.0
var yaw := 0.0
var pitch := 0.0

func _ready() -> void:
	var r := global_transform.basis.get_euler()
	pitch = r.x
	yaw = r.y

func _unhandled_input(e: InputEvent) -> void:
	var mm := e as InputEventMouseMotion
	var mb := e as InputEventMouseButton
	if mm and Input.is_mouse_button_pressed(MOUSE_BUTTON_RIGHT):
		yaw -= mm.relative.x * 0.004
		pitch = clampf(pitch - mm.relative.y * 0.004, -1.5, 1.5)
		rotation = Vector3(pitch, yaw, 0.0)
	elif mb and mb.pressed:
		if mb.button_index == MOUSE_BUTTON_WHEEL_UP:
			speed *= 1.25
		elif mb.button_index == MOUSE_BUTTON_WHEEL_DOWN:
			speed /= 1.25

func _process(dt: float) -> void:
	var d := Vector3.ZERO
	var b := global_transform.basis
	if Input.is_key_pressed(KEY_W): d -= b.z
	if Input.is_key_pressed(KEY_S): d += b.z
	if Input.is_key_pressed(KEY_A): d -= b.x
	if Input.is_key_pressed(KEY_D): d += b.x
	if Input.is_key_pressed(KEY_E): d += Vector3.UP
	if Input.is_key_pressed(KEY_Q): d -= Vector3.UP
	var s := speed * (4.0 if Input.is_key_pressed(KEY_SHIFT) else 1.0)
	if d != Vector3.ZERO:
		global_position += d.normalized() * s * dt
