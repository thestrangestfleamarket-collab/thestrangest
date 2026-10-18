// SELF: his own depth from his light, his pieces alone, into a small picture (two bytes of depth), read back by walker.gdshader.
shader_type spatial;
render_mode cull_disabled, unshaded, shadows_disabled;

uniform vec4 pm[96];
uniform mat4 self_vp;
varying float dz;

void vertex() {
	int i = int(CUSTOM0.x + 0.5) * 3;
	vec4 a = pm[i], b = pm[i + 1], c = pm[i + 2];
	mat3 R = mat3(vec3(a.x, a.y, a.z), vec3(a.w, b.x, b.y), vec3(b.z, b.w, c.x));
	VERTEX = R * VERTEX + c.yzw;
	vec4 p = self_vp * (MODEL_MATRIX * vec4(VERTEX, 1.0));
	dz = p.z / p.w * 0.5 + 0.5;
}

void fragment() {
	float d = clamp(dz, 0.0, 1.0);
	float hi = floor(d * 255.0) / 255.0;
	ALBEDO = vec3(hi, (d - hi) * 255.0, 0.0);
}
