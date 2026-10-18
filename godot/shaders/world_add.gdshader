// THE GLOW LAID OVER (three.js's additive faces: the neon's halo), unlit, added to what's behind (the shared code: world.gdshaderinc)
shader_type spatial;
render_mode cull_disabled, unshaded, blend_add, depth_draw_never, shadows_disabled;
#define ADD
#include "res://shaders/world.gdshaderinc"
