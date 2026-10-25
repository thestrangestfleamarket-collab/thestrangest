# First-person walker: WASD/arrows to move, Shift to run, Space to jump, mouse to look, Esc frees the mouse.
extends CharacterBody3D

@export var walk_speed := 4.5
@export var run_speed := 8.5
@export var jump_velocity := 5.0
@export var mouse_sensitivity := 0.0025
@export var respawn_below := -20.0

@onready var head: Node3D = $Head

var gravity: float = ProjectSettings.get_setting("physics/3d/default_gravity")
var spawn: Vector3


func _ready() -> void:
	_bind_keys()
	spawn = global_position
	Input.mouse_mode = Input.MOUSE_MODE_CAPTURED


func _bind_keys() -> void:
	var keys := {
		"move_forward": [KEY_W, KEY_UP],
		"move_back": [KEY_S, KEY_DOWN],
		"move_left": [KEY_A, KEY_LEFT],
		"move_right": [KEY_D, KEY_RIGHT],
		"jump": [KEY_SPACE],
		"run": [KEY_SHIFT],
	}
	for action in keys:
		if InputMap.has_action(action):
			continue
		InputMap.add_action(action)
		for key in keys[action]:
			var ev := InputEventKey.new()
			ev.physical_keycode = key
			InputMap.action_add_event(action, ev)


func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseMotion and Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
		rotate_y(-event.relative.x * mouse_sensitivity)
		head.rotate_x(-event.relative.y * mouse_sensitivity)
		head.rotation.x = clampf(head.rotation.x, deg_to_rad(-85.0), deg_to_rad(85.0))
	elif event is InputEventMouseButton and event.pressed:
		Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
	elif event.is_action_pressed("ui_cancel"):
		Input.mouse_mode = Input.MOUSE_MODE_VISIBLE


func _physics_process(delta: float) -> void:
	if not is_on_floor():
		velocity.y -= gravity * delta
	elif Input.is_action_just_pressed("jump"):
		velocity.y = jump_velocity

	var input := Input.get_vector("move_left", "move_right", "move_forward", "move_back")
	var dir := (transform.basis * Vector3(input.x, 0.0, input.y)).normalized()
	var speed := run_speed if Input.is_action_pressed("run") else walk_speed
	velocity.x = dir.x * speed
	velocity.z = dir.z * speed
	move_and_slide()

	if global_position.y < respawn_below:
		global_position = spawn
		velocity = Vector3.ZERO
