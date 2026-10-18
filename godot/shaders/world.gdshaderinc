// THE WORLD'S FACES, as THE MARKET draws them (src/map-pre.js, its patch on three.js's Lambert): each face its fixed shade by the way it faces
// (a top as its colour, a side along x x0.62, along z x0.8), the light multiplied in and eased into seven soft bands (each edge over a short
// gradient, the darkest band left smooth), capped at 1.7. The ambient (the sky's fill) rides on the sun's own call, so the bands are on their sum.
// One include, four programs: lit or unlit (three.js's MeshBasicMaterial: the glowing faces, their colour as it is), opaque or glass (a
// see-through material: its opacity, no shadow of its own).

uniform sampler2D tex : source_color, filter_nearest, repeat_enable;
uniform sampler2D etex : source_color, filter_nearest, repeat_enable;
uniform bool has_tex = false;
uniform bool has_em = false;
uniform float ek = 0.0;
uniform float opacity = 1.0;
// the sky's fill (three.js's HemisphereLight: its colours times its strength, linear)
uniform vec3 hemi_sky = vec3(0.0);
uniform vec3 hemi_gnd = vec3(0.0);
// the eight lamps LITE picks (map-post.js), lit here as three.js lights them (its point light's falloff, exactly), so the bands fall on the
// sum of all the light, as THE MARKET's do: position and reach; colour x strength and decay
uniform vec4 lamp_pos[8];
uniform vec4 lamp_col[8];
uniform int lamp_n = 0;
uniform int lamp_first = 0;   // (1 while the nearest lamp casts the one lamp shadow: it is drawn in its own pass, below)
// the haze, measured from where he stands (skyline.js)
uniform vec4 fog_col = vec4(0.0);
uniform vec2 fog_nf = vec2(1e6, 2e6);
uniform vec3 player = vec3(0.0);
// a room (rooms.js): only it drawn; the near side cut above his knee
uniform bool in_room = false;
uniform vec4 room_xz = vec4(0.0);   // x0, z0, x1, z1 (with its margin)
uniform vec2 room_y = vec2(0.0);
uniform vec3 near_u = vec3(0.0);    // toward the camera, on the ground (x, z), and how far from him the cut starts
uniform float knee = 0.0;
uniform vec3 main_cam = vec3(0.0);  // (the shadow passes are told apart by their camera: they cut nothing)

varying vec3 wpos;
varying vec3 wnrm;

// (Godot's Compatibility renderer takes ALBEDO and EMISSION as sRGB, reads textures as they are stored (sRGB) and puts the light on in
// linear; three.js works in linear from its sRGB textures and colours. These two put the one into the other exactly.)
vec3 to_lin(vec3 c) { return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(vec3(0.04045), c)); }
vec3 to_srgb(vec3 c) { c = max(c, vec3(0.0)); return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), c)); }

void vertex() {
	wpos = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
	wnrm = normalize(mat3(MODEL_MATRIX) * NORMAL);
}

void fragment() {
	vec4 t = has_tex ? texture(tex, UV) : vec4(1.0);
#ifdef ADD
	ALPHA = t.a;
#else
	if (t.a < 0.5) discard;
#endif
	if (in_room && distance(CAMERA_POSITION_WORLD, main_cam) < 0.01) {
		if (wpos.x < room_xz.x || wpos.x > room_xz.z || wpos.z < room_xz.y || wpos.z > room_xz.w || wpos.y < room_y.x || wpos.y > room_y.y) discard;
		if (wpos.y > knee && dot(near_u.xy, wpos.xz - player.xz) > near_u.z) discard;
	}
	vec3 wn = abs(normalize(wnrm));
	float tone = wn.y >= max(wn.x, wn.z) ? 1.0 : (wn.x > wn.z ? 0.62 : 0.8);
#ifdef LIT
	ALBEDO = to_srgb(to_lin(t.rgb) * COLOR.rgb * tone);
#else
	ALBEDO = to_srgb(to_lin(t.rgb) * COLOR.rgb);
#endif
#ifdef GLASS
	ALPHA = opacity;
#endif
	if (has_em) EMISSION = to_srgb(to_lin(texture(etex, UV).rgb) * ek * COLOR.rgb);
	float fd = distance(wpos, player);
	FOG = vec4(to_srgb(fog_col.rgb), fog_col.a * smoothstep(fog_nf.x, fog_nf.y, fd));
}

#ifdef LIT
float falloff(float d, float cutoff, float decay) {
	float f = 1.0 / max(pow(d, decay), 0.01);
	if (cutoff > 0.0) { float q = d / cutoff; q *= q; f *= pow(clamp(1.0 - q * q, 0.0, 1.0), 2.0); }
	return f;
}

// the soft bands: the light's strength (its brightest channel, so its hue stays) eased toward seven even steps
vec3 bands(vec3 L) {
	float m = max(L.r, max(L.g, L.b));
	if (m <= 0.001) return L;
	float f = min(m, 1.7) * 7.0;
	float b = floor(f) + smoothstep(0.3, 0.7, fract(f));
	float s = (f < 1.0 ? f : mix(f, b, 0.7)) / 7.0;
	return L * (s / m);
}

void light() {
	vec3 up = normalize((VIEW_MATRIX * vec4(0.0, 1.0, 0.0, 0.0)).xyz);
	vec3 B = mix(hemi_gnd, hemi_sky, 0.5 * dot(NORMAL, up) + 0.5);
	for (int i = lamp_first; i < lamp_n; i++) {
		vec3 lv = mat3(VIEW_MATRIX) * (lamp_pos[i].xyz - wpos);
		float d = length(lv);
		B += lamp_col[i].rgb * max(dot(NORMAL, lv / d), 0.0) * falloff(d, lamp_pos[i].w, lamp_col[i].w);
	}
	if (LIGHT_IS_DIRECTIONAL) {
		// the sun (or the moon): LIGHT_COLOR is its colour x energy x PI, its energy three.js's intensity: this is three.js's irradiance; the
		// sky's fill and the lamps ride on its call, so the bands are on the sum
		vec3 irr = LIGHT_COLOR / PI * ATTENUATION * max(dot(NORMAL, LIGHT), 0.0) + B;
		DIFFUSE_LIGHT += bands(irr) / PI;
	} else {
		// THE ONE LAMP SHADOW (the nearest lamp's, LITE's slot 0), indoors and at night: Godot draws a shadowed lamp in a pass of its own, added
		// to the picture as it stands (in sRGB), so this pass writes exactly what the lamp adds to the banded total (ATTENUATION: three.js's
		// falloff, as Godot's omni light falls off with range = its distance and attenuation = its decay, times its shadow)
		vec3 lv0 = mat3(VIEW_MATRIX) * (lamp_pos[0].xyz - wpos);
		float d0 = length(lv0);
		float dg = length(lamp_pos[0].xyz - vec3(0.0, 0.5, 0.0) - wpos);
		float win = pow(max(1.0 - pow(dg / (lamp_pos[0].w * 1.5), 4.0), 0.0), 2.0);   // (Godot's own falloff at range 1.5x, decay 0, from its light half a unit under the lamp: three.js's lamp shadow ignores what is within 0.5 of it, Godot's has no such near plane, so its light hangs just out of the fixture: divided out, leaving the shadow)
		float sh = clamp(ATTENUATION / max(win, 1e-4), 0.0, 1.0);
		vec3 l0 = lamp_col[0].rgb * max(dot(NORMAL, lv0 / d0), 0.0) * falloff(d0, lamp_pos[0].w, lamp_col[0].w) * sh;
		vec3 al = ALBEDO;   // (in light() Godot hands ALBEDO over already linear: measured)
		vec3 ob = to_srgb(al * bands(B) / PI), ot = to_srgb(al * bands(B + l0) / PI);
		DIFFUSE_LIGHT += to_lin(max(ot - ob, vec3(0.0))) / max(al, vec3(1e-4));
	}
}
#endif
