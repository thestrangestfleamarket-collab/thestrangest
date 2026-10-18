// THE WORLD'S GLASS, lit, see-through (the shared code: world.gdshaderinc)
shader_type spatial;
render_mode cull_disabled, ambient_light_disabled, specular_disabled, depth_draw_never;
#define LIT
#define GLASS
#include "res://shaders/world.gdshaderinc"
