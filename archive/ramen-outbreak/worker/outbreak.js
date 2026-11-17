// RAMEN'S TURNED THINK (src/sushi/outbreak.js, infected.js): the leading page sends what the dead in the village have of the night (where each is, what they hear, which of the cart's sides still hold, the cook's state); Claude, as their one mind, says which side of the cart to press together and who holds back. It never decides a grab or a bite: the page does, by instinct, and goes on by instinct when this is not there.
import Anthropic from "@anthropic-ai/sdk";
import { ZOMBIE } from "./zombie.js";

const SIDES = ["front", "left", "right", "back"], DAY = 600;
const clip = (s, n) => String(s ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, n);
const num = (v, lo, hi, d = lo) => Number.isFinite(+v) ? Math.min(hi, Math.max(lo, Math.round(+v * 100) / 100)) : d;
const SYSTEM = `You are the one hunger shared by the dead of a small Japanese village in the 1860s, on the night a sickness turned them. The living are holed up behind a wooden ramen cart in the street: its cook, and a few villagers sheltering with them. The cart has four sides: front (the counter, with shutters that can be let down), left, right and back (each with crates, a barrel or a door stacked against it). You cannot think in words, only in pressure: where to crowd, where to wait. You are called every few seconds with what your bodies sense. Answer with the one side all should press together, and which bodies hold back in the dark (they will wait unseen and come when another side breaks). Prefer the weakest side, the side the living face away from, and the side where noise came from last.`;
const SCHEMA = { type: "object", properties: { focus: { type: "string", enum: SIDES }, hold: { type: "array", items: { type: "integer" } }, thought: { type: "string" } }, required: ["focus", "hold", "thought"], additionalProperties: false };
export function tidy(b) {
  const them = (Array.isArray(b.them) ? b.them : []).slice(0, 12).map((t) => ({ id: num(t && t.id, 0, 99999), side: SIDES.includes(t && t.side) ? t.side : "street", d: num(t && t.d, 0, 99), legs: num(t && t.legs, 0, 1), arms: num(t && t.arms, 0, 2) }));
  const bars = {}; for (const s of SIDES) bars[s] = num(b.bars && b.bars[s], 0, 300);
  return { stage: clip(b.stage, 10), them, bars, cook_faces: SIDES.includes(b.faces) ? b.faces : "front", cook_hurt: num(b.hurt, 0, 1), lit: !!b.lit, sheltering: num(b.shelter, 0, 9), last_noise: SIDES.includes(b.noise) ? b.noise : "none" };
}
async function think(env, store, body, client) {
  const obs = tidy(body || {}); if (!obs.them.length) return { why: "none of them" };
  const M = (await store.get()) || {}, d = new Date().toISOString().slice(0, 10), max = +env.RAMEN_DAILY || DAY;
  if (M.day !== d) { M.day = d; M.n = 0; }
  if (M.n >= max) return { why: "instinct now" };
  client = client || new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, timeout: 8000, maxRetries: 0 });
  let D;
  try {
    const r = await client.messages.create({ model: env.ZOMBIE_MODEL || ZOMBIE.MODEL, max_tokens: 200, thinking: { type: "disabled" }, output_config: { effort: "low", format: { type: "json_schema", schema: SCHEMA } },
      system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }], messages: [{ role: "user", content: JSON.stringify(obs) }] });
    if (r.stop_reason === "refusal") return { why: "no thought came" };
    D = JSON.parse((r.content || []).filter((c) => c.type === "text").map((c) => c.text).join(""));
  } catch (e) { return { why: e instanceof SyntaxError ? "the thought was lost" : "Claude could not be reached" }; }
  M.n++; await store.put(M);
  const ids = obs.them.map((t) => t.id);
  return { focus: SIDES.includes(D.focus) ? D.focus : "front", hold: (Array.isArray(D.hold) ? D.hold : []).filter((i) => ids.includes(i)).slice(0, 6), thought: clip(D.thought, 120) };
}
export const OUTBREAK = { SYSTEM, SCHEMA, tidy, think };
