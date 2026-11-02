// THE CLOTHES CHECK: node tests/clothes.cjs dist/market.html [out-dir]. The tee, jeans and shoes are cut to their own size chart (GARB.SIZE) and put on by the joints (owner, 2 Nov 2026);
// here they are checked against the body they go on, his and hers, at rest: no garment point inside the body unless another garment covers it there, and no skin that should be covered left outside every garment.
// With an out-dir it also saves portraits (front, left, back, right, mid-stride) of each build to look at.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=clothes::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 900, height: 820 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=12&at=32,25', { waitUntil: 'commit' });
  await pg.waitForFunction(() => window.__started, null, { timeout: 300000 });
  const frames = n => pg.evaluate(async n => { for (let i = 0; i < n; i++) await new Promise(r => requestAnimationFrame(r)); }, n);
  const check = form => pg.evaluate(form => { const GARB = GARBDBG.G;
    const Z = GARB.SIZE, J = W3.rest.J, F = form === 'F', V = (x, y, z) => ({ x, y, z }), sub = (a, b) => V(a.x - b.x, a.y - b.y, a.z - b.z), dot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z, len = a => Math.sqrt(dot(a, a)), lerp = (a, b, t) => a + (b - a) * t;
    const pc = n => W3.pcs[W3.idx(n)], d = n => { const P = pc(n); return P ? p => P.d(p) : () => 1e9; };
    const TORSO = F ? ['torsoF', 'bustF'] : ['torso'], BODY = TORSO.concat(['hips', 'thighL', 'thighR', 'shinL', 'shinR', 'neck', 'upperArmL', 'upperArmR', 'footL', 'footR']);
    const bd = ns => p => Math.min(...ns.map(n => d(n)(p)));
    // the garments as volumes, from the size chart and the joints
    const T = Z.tee, bust = (y, z) => F && z > 0 ? T.bust * Math.max(0, 1 - ((y - 27.4) / 3.6) ** 2) : 0;
    const inTee = p => { const rows = T.rows, N = T.neck, top = rows[rows.length - 1]; let W, D, n = T.n; if (p.y < rows[0][0]) return false;
      if (p.y > top[0]) { const ty = N.y - N.dip * Math.sign(p.z) * Math.min(1, Math.abs(p.z) / N.D); if (p.y > ty + .05) return false; const f = (p.y - top[0]) / Math.max(.01, ty - top[0]); W = lerp(top[1], N.W, f); D = lerp(top[2], N.D, f); }
      else { let j = 1; while (rows[j][0] < p.y) j++; const a = rows[j - 1], c = rows[j], f = (p.y - a[0]) / (c[0] - a[0]); W = lerp(a[1], c[1], f); D = lerp(a[2], c[2], f); }
      D += p.z > 0 ? bust(p.y, 1) : 0; return (Math.abs(p.x) / W) ** n + (Math.abs(p.z) / D) ** n <= 1.0001; };
    const inSleeve = (p, s) => { const S = J['shoulder' + s], E = J['elbow' + s], a = sub(E, S), L = len(a); a.x /= L; a.y /= L; a.z /= L; const q = sub(p, S), t = dot(q, a);
      if (t < 0) return len(q) <= T.slv.R; if (t > T.slv.L) return false; return len(sub(q, V(a.x * t, a.y * t, a.z * t))) <= lerp(T.slv.R, T.slv.Rh, t / T.slv.L); };
    const G = Z.jeans.leg, inLeg = (p, s) => { const H = J['hip' + s], K = J['knee' + s], A = J['ankle' + s], L1 = len(sub(K, H)), L2 = len(sub(A, K)), R = q => q < 0 ? G.R0 + q * G.topIn : q < L1 ? G.R0 + (G.Rk - G.R0) * Math.max(0, q) / L1 : G.Rk + (G.Rh - G.Rk) * Math.min(1, (q - L1) / L2);
      for (const [o, e, t0, t1, off] of [[H, K, G.top, L1, 0], [K, A, -.5, L2 + G.ext, L1]]) { const a = sub(e, o), l = len(a); a.x /= l; a.y /= l; a.z /= l; const q = sub(p, o), t = dot(q, a); if (t >= t0 && t <= t1 && len(sub(q, V(a.x * t, a.y * t, a.z * t))) <= R(t + off)) return true; } return false; };
    const inSeat = p => { const r = Z.jeans.rows; if (p.y > r[0][0] || p.y < r[r.length - 1][0]) return false; let j = 1; while (r[j][0] > p.y) j++; const a = r[j - 1], c = r[j], f = (a[0] - p.y) / (a[0] - c[0]); return (Math.abs(p.x) / lerp(a[1], c[1], f)) ** Z.jeans.n + (Math.abs(p.z) / lerp(a[2], c[2], f)) ** Z.jeans.n <= 1; };
    const shoeAt = z => { const st = Z.shoe.st; if (z < st[0][0] || z > st[st.length - 1][0]) return null; let j = 1; while (st[j][0] < z) j++; const a = st[j - 1], c = st[j], f = (z - a[0]) / (c[0] - a[0]); return [lerp(a[1], c[1], f), lerp(a[2], c[2], f)]; };
    const inShoe = (p, s) => { const A = J['ankle' + s], q = shoeAt(p.z - A.z); if (!q) return false; const [w, top] = q; const x = (p.x - A.x) / w, y = (p.y - top / 2) / (top / 2); return p.y >= 0 && Math.abs(x) ** 3 + Math.abs(y) ** (y < 0 ? 6 : 2.4) <= 1; };
    const VOL = { shirt: inTee, sleeveL: p => inSleeve(p, 'L'), sleeveR: p => inSleeve(p, 'R'), seat: inSeat, legL: p => inLeg(p, 'L'), legR: p => inLeg(p, 'R'), shoeL: p => inShoe(p, 'L'), shoeR: p => inShoe(p, 'R'), sole: p => p.y < .62 && ['L', 'R'].some(s => { const A = J['ankle' + s], q = shoeAt(p.z - A.z); return q && Math.abs(p.x - A.x) <= q[0] + .16; }) };
    const inAll = p => Object.values(VOL).some(f => f(p));
    // 1: every garment point clear of what it covers, unless another garment covers it there
    const pokes = {}; let least = 1e9, npts = 0;
    for (const [k, own, against] of [['shirt', ['shirt', 'sleeveL', 'sleeveR'], TORSO.concat(['hips', 'neck', 'thighL', 'thighR'])], ['pants', ['seat', 'legL', 'legR'], ['hips', 'thighL', 'thighR', 'shinL', 'shinR']], ['shoeL', ['shoeL'], ['footL']], ['shoeR', ['shoeR'], ['footR']]]) {
      const t = GARB.tpl(k, form), P = t.P, NM = GARB.NAMES;
      for (let i = 0; i < P.length; i += 3) { const p = V(P[i], P[i + 1], P[i + 2]), a = NM[t.s1[i / 3]], b = t.s2[i / 3] >= 0 ? NM[t.s2[i / 3]] : null; npts++;
        // the part it belongs to, by the bone it hangs on: a sleeve hangs on its arm alone, a leg on its thigh or shin, the rest of the tee and the seat on the torso and hips
        const onSeat = inSeat(V(p.x * 1.03, p.y, p.z * 1.03)) && !inSeat(V(p.x * .97, p.y, p.z * .97)) || p.y > Z.jeans.rows[0][0] - 1.3, part = k !== 'shirt' && k !== 'pants' ? k : k === 'shirt' ? (/^upperArm/.test(a) && !b ? 'sleeve' + a.slice(-1) : 'shirt') : (onSeat ? 'seat' : /^(thigh|shin)/.test(a) || b ? 'leg' + (b || a).slice(-1) : 'leg' + (p.x > 0 ? 'L' : 'R'));
        // a sleeve is checked against the arm it goes round too
        const dd = bd(against.concat(/^sleeve/.test(part) ? ['upperArm' + part.slice(-1)] : []))(p), cov = Object.keys(VOL).some(n => n !== part && VOL[n](p));
        if (cov || p.y < .05) continue; least = Math.min(least, dd); if (dd < .1) { const key = k + ' y' + Math.round(p.y) + (p.z > 1.5 ? ' front' : p.z < -1.5 ? ' back' : ' side'); pokes[key] = Math.min(pokes[key] ?? 1e9, +dd.toFixed(2)); } } }
    // 1b: the tee is worn over the jeans: every point of the jeans and belt above its hem is inside it with room to spare (points under the ground excepted)
    const lay = {}; { const t = GARB.tpl('pants', form), P = t.P, hem = T.rows[0][0] + .1, inTeeIn = p => inTee(V(p.x * 1.04, p.y, p.z * 1.04)) || inSleeve(p, 'L') || inSleeve(p, 'R');
      for (let i = 0; i < P.length; i += 3) { const p = V(P[i], P[i + 1], P[i + 2]); if (p.y > hem && !inTeeIn(p)) { const key = 'y' + Math.round(p.y) + (p.z > 1.5 ? ' front' : p.z < -1.5 ? ' back' : ' side'); lay[key] = (lay[key] || 0) + 1; } } }
    // 2: the skin to be covered, sampled near the body's surface
    const miss = {}; let ns = 0, all = bd(BODY);
    const want = p => { if (d('neck')(p) < 0 || p.y > 35.2 && Math.abs(p.x) < 3.6) return null; for (const n of TORSO) if (d(n)(p) < .05 && p.y > 15.6) return 'chest'; if (d('hips')(p) < .05) return 'hips';
      for (const s of 'LR') { if (d('thigh' + s)(p) < .05) return 'thigh'; if (d('shin' + s)(p) < .05 && p.y > 2.9) return 'shin'; if (d('foot' + s)(p) < .05 && p.y > .3 && p.y < 3.6) return 'foot'; } return null; };
    for (let x = -12; x <= 12; x += .4) for (let y = 0; y <= 36; y += .4) for (let z = -7; z <= 7; z += .4) { const p = V(x, y, z); if (Math.abs(all(p)) > .2) continue; const k = want(p); if (!k) continue; ns++;
      if (!inAll(p)) { const key = k + ' y' + Math.round(p.y) + (p.z > 1.5 ? ' front' : p.z < -1.5 ? ' back' : ' side'); miss[key] = (miss[key] || 0) + 1; } }
    return { npts, least: +least.toFixed(2), pokes, ns, miss, lay, foot: !!pc('footL') };
  }, form);
  for (const form of ['M', 'F']) {
    if (form === 'F') { await pg.evaluate(() => LOOKS.style('form', 'F')); await frames(40); }
    const r = await check(form);
    ok(r.foot && r.npts > 1000 && !Object.keys(r.pokes).length, `${form === 'F' ? 'her' : 'his'} tee, jeans and shoes clear the body everywhere they are not covered by another garment (${r.npts} points, least ${r.least}): ` + JSON.stringify(r.pokes));
    ok(!Object.keys(r.lay).length, `${form === 'F' ? 'her' : 'his'} tee is worn over the jeans: none of the jeans or the belt shows through it: ` + JSON.stringify(r.lay));
    ok(r.ns > 1000 && !Object.keys(r.miss).length, `${form === 'F' ? 'her' : 'his'} chest, hips, legs and feet are all inside the clothes (${r.ns} samples): ` + JSON.stringify(r.miss));
    if (process.argv[3]) { const out = process.argv[3] + '/clothes-' + form;
      await pg.evaluate(() => { window.__portrait = (W, H, spin) => { const THREE = __dbg.THREE, renderer = __dbg.renderer, g = W3.group, rt = new THREE.WebGLRenderTarget(W, H); rt.texture.colorSpace = THREE.SRGBColorSpace;
        const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, .01, 100), sv = { ry: g.rotation.y, vis: g.visible, am: g.matrixAutoUpdate }; g.visible = true; g.matrixAutoUpdate = true; g.rotation.y = spin; g.updateMatrixWorld(true);
        const gp = g.getWorldPosition(new THREE.Vector3()), head = W3.eyeAt(new THREE.Vector3()), topY = head.y + .18, botY = gp.y - .05, hh = Math.max(.6, topY - botY) * 1.06, ww = hh * (W / H), cy = (topY + botY) / 2, dd = hh * 3 + 6;
        cam.left = -ww / 2; cam.right = ww / 2; cam.top = hh / 2; cam.bottom = -hh / 2; cam.far = dd * 3 + 60; cam.updateProjectionMatrix(); cam.position.set(gp.x, cy, gp.z + dd); cam.lookAt(gp.x, cy, gp.z); cam.updateMatrixWorld(true);
        DESIGN.portrait(rt, cam); const px = new Uint8Array(W * H * 4); renderer.readRenderTargetPixels(rt, 0, 0, W, H, px); g.rotation.y = sv.ry; g.visible = sv.vis; g.matrixAutoUpdate = sv.am; g.updateMatrixWorld(true);
        let cv = document.getElementById('__pcv'); if (!cv) { cv = document.createElement('canvas'); cv.id = '__pcv'; cv.style.cssText = 'position:fixed;left:0;top:0;z-index:999'; document.body.appendChild(cv); } cv.width = W; cv.height = H;
        const g2 = cv.getContext('2d'), im = g2.createImageData(W, H); for (let y = 0; y < H; y++) im.data.set(px.subarray((H - 1 - y) * W * 4, (H - y) * W * 4), y * W * 4); g2.putImageData(im, 0, 0); rt.dispose(); }; });
      const shot = async (nm, sp) => { await pg.evaluate(sp => __portrait(420, 700, sp), sp); await (await pg.$('#__pcv')).screenshot({ path: `${out}-${nm}.png`, timeout: 180000 }); };
      for (const [nm, sp] of [['front', 0], ['left', Math.PI / 2], ['back', Math.PI], ['right', -Math.PI / 2]]) await shot(nm, sp);
      await pg.keyboard.down('w'); await frames(12); await shot('walk-front', 0); await frames(6); await shot('walk-left', Math.PI / 2); await frames(6); await shot('walk-right', -Math.PI / 2); await frames(5); await shot('walk-left2', Math.PI / 2); await frames(5); await shot('walk-back', Math.PI); await pg.keyboard.up('w'); await frames(30); }
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); if (fails.length) process.exit(1);
})();
