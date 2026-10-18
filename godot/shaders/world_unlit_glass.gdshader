// THE GLOWING GLASS, unlit, see-through (the shared code: world.gdshaderinc)
shader_type spatial;
render_mode cull_disabled, unshaded, depth_draw_never;
#define GLASS
#include "res://shaders/world.gdshaderinc"
