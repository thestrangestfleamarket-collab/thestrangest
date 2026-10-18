// THE WALKER, as THE MARKET draws him (src/walker3d.js): his pieces in one mesh, each point carried by its own piece's frame (the rig's pose,
// handed over each frame as three rows a piece), his own colours, lit as three.js's toon material lights him: every light through his
// gradient (smooth, from 1 - depth at his back to full; depth .78), the sky's fill, a little light of his own (0.16 of his colour) so the dark
// never loses him; SELF: where his own body stands between his light and a part of him, that part darker (his own shadow map).
shader_type spatial;
render_mode cull_disabled, ambient_light_disabled, specular_disabled;

uniform vec4 pm[96];
uniform float depth = 0.78;
uniform vec3 hemi_sky = vec3(0.0);
uniform vec3 hemi_gnd = vec3(0.0);
uniform vec4 lamp_pos[8];
uniform vec4 lamp_col[8];
uniform int lamp_n = 0;
uniform int lamp_first = 0;
// SELF
uniform bool self_on = true;
uniform float self_k = 0.571;
uniform mat4 self_vp;
uniform sampler2D self_sm : filter_nearest;

varying vec3 wpos;
varying float selfk;
varying vec3 hemi_v;

// (Godot's Compatibility renderer takes ALBEDO and EMISSION as sRGB, reads textures as they are stored (sRGB) and puts the light on in
// linear; three.js works in linear from its sRGB textures and colours. These two put the one into the other exactly.)
vec3 to_lin(vec3 c) { return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(vec3(0.04045), c)); }
vec3 to_srgb(vec3 c) { c = max(c, vec3(0.0)); return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), c)); }

void vertex() {
	int i = int(CUSTOM0.x + 0.5) * 3;
	vec4 a = pm[i], b = pm[i + 1], c = pm[i + 2];
	mat3 R = mat3(vec3(a.x, a.y, a.z), vec3(a.w, b.x, b.y), vec3(b.z, b.w, c.x));
	vec3 T = c.yzw;
	VERTEX = R * VERTEX + T;
	NORMAL = R * NORMAL;
	wpos = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
}

void fragment() {
	ALBEDO = to_srgb(COLOR.rgb);
	vec3 up = normalize((VIEW_MATRIX * vec4(0.0, 1.0, 0.0, 0.0)).xyz);
	vec3 hemi = mix(hemi_gnd, hemi_sky, 0.5 * dot(normalize(NORMAL), up) + 0.5);
	selfk = 1.0;
	if (self_on) {
		vec4 p = self_vp * vec4(wpos, 1.0);
		vec3 q = p.xyz / p.w * 0.5 + 0.5;
		if (q.x > 0.0 && q.x < 1.0 && q.y > 0.0 && q.y < 1.0) {
			vec4 s = texture(self_sm, vec2(q.x, 1.0 - q.y));
			float d = s.r + s.g / 255.0;
			if (s.a > 0.5 && q.z - 0.006 > d) selfk = self_k;
		}
	}
	hemi_v = hemi;
	EMISSION = to_srgb(COLOR.rgb * (hemi / PI + 0.16) * selfk);
}

float grad(float nl) {   // (his gradient, smooth: 32 texels from 1 - depth to full, filtered, as three.js's toon reads it)
	float u = nl * 0.5 + 0.5;
	return (1.0 - depth) + depth * clamp(u * 32.0 - 0.5, 0.0, 31.0) / 31.0;
}

float falloff(float d, float cutoff, float decay) {
	float f = 1.0 / max(pow(d, decay), 0.01);
	if (cutoff > 0.0) { float q = d / cutoff; q *= q; f *= pow(clamp(1.0 - q * q, 0.0, 1.0), 2.0); }
	return f;
}

void light() {
	vec3 rest = vec3(0.0);
	for (int i = lamp_first; i < lamp_n; i++) {
		vec3 lv = mat3(VIEW_MATRIX) * (lamp_pos[i].xyz - wpos);
		float d = length(lv);
		rest += lamp_col[i].rgb * grad(dot(NORMAL, lv / d)) * falloff(d, lamp_pos[i].w, lamp_col[i].w);
	}
	if (LIGHT_IS_DIRECTIONAL) {
		// the sun through his gradient, and the lamps the same way (three.js's toon: each light through the gradient, none banded)
		DIFFUSE_LIGHT += (LIGHT_COLOR / PI * ATTENUATION * grad(dot(NORMAL, LIGHT)) + rest) / PI * selfk;
	} else {
		// the one lamp shadow's own pass (see world.gdshaderinc): what the nearest lamp adds, in the picture's sRGB
		vec3 al = ALBEDO;   // (in light() Godot hands ALBEDO over already linear: measured)
		vec3 base = al * (rest / PI * selfk + (hemi_v / PI + 0.16) * selfk);
		vec3 lv0 = mat3(VIEW_MATRIX) * (lamp_pos[0].xyz - wpos);
		float d0 = length(lv0);
		float dg = length(lamp_pos[0].xyz - vec3(0.0, 0.5, 0.0) - wpos);
		float win = pow(max(1.0 - pow(dg / (lamp_pos[0].w * 1.5), 4.0), 0.0), 2.0);
		float sh = clamp(ATTENUATION / max(win, 1e-4), 0.0, 1.0);
		vec3 add = al * lamp_col[0].rgb * grad(dot(NORMAL, lv0 / d0)) * falloff(d0, lamp_pos[0].w, lamp_col[0].w) * sh / PI * selfk;
		DIFFUSE_LIGHT += to_lin(max(to_srgb(base + add) - to_srgb(base), vec3(0.0))) / max(al, vec3(1e-4));
	}
}
