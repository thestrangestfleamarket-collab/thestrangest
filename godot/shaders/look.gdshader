// THE FINAL TOUCH (src/oldlook.js, the old game's FS3 and bleed passes), on the finished picture at its own pixels: the stepped glow (what is
// far brighter than round it gathers a halo a few art pixels wide, cut into 8 hard steps, laid over as light is), the warm sun and the cool
// shade (by day), the night eye (the dark goes grey-blue) and the deep (the darkest sinks toward navy).
shader_type canvas_item;

uniform float night = 0.0;
uniform float glow_k = 0.5;
uniform float cool = 0.0;

float lum(vec3 c) { return dot(c, vec3(0.3, 0.59, 0.11)); }

vec3 bright(sampler2D t, vec2 u) {
	vec3 c = texture(t, u).rgb;
	float l = lum(c), mx = max(c.r, max(c.g, c.b)), mn = min(c.r, min(c.g, c.b));
	return c * max(smoothstep(0.55, 0.9, l), smoothstep(0.7, 1.0, mx) * smoothstep(0.3, 0.7, mx - mn));
}

void fragment() {
	vec2 px = TEXTURE_PIXEL_SIZE;
	vec3 col = texture(TEXTURE, UV).rgb;
	vec3 g = vec3(0.0);
	float wt = 0.0;
	for (int i = -4; i <= 4; i++) for (int j = -4; j <= 4; j++) {
		float r = length(vec2(float(i), float(j)));
		if (r > 4.5) continue;
		float w = exp(-r * r / 6.0);
		g += bright(TEXTURE, UV + vec2(float(i), float(j)) * px) * w;
		wt += w;
	}
	g /= wt;
	float gm = max(g.r, max(g.g, g.b));
	if (gm > 0.001) g *= floor(gm * 8.0) / 8.0 / gm;
	col = 1.0 - (1.0 - col) * (1.0 - clamp(g * glow_k, 0.0, 1.0));
	float l0 = lum(col);
	col *= mix(vec3(1.0), mix(vec3(0.84, 0.92, 1.16), vec3(1.08, 1.0, 0.88), smoothstep(0.18, 0.62, l0)), cool);
	float l = lum(col), k = night * 0.8 * (1.0 - smoothstep(0.06, 0.42, l));
	col = mix(col, vec3(l), k) * mix(vec3(1.0), vec3(0.62, 0.87, 1.31), k);
	col = mix(col, vec3(0.039, 0.063, 0.188), night * 0.3 * (1.0 - l) * (1.0 - l));
	COLOR = vec4(col, 1.0);
}
