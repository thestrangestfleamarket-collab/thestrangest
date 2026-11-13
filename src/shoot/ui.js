// In-headset UI (banner, wrist display, damage vignette) and the desktop DOM HUD.
import * as THREE from 'three';

function canvasPlane(w, h, pw, ph, opts = {}) {
  const c = document.createElement('canvas'); c.width = pw; c.height = ph;
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, fog: false, toneMapped: false, ...opts }));
  return { c, x: c.getContext('2d'), t, m };
}

export class UI {
  constructor(game) {
    this.g = game; const cam = game.camera;
    // banner
    this.banner = canvasPlane(1.0, 0.25, 1024, 256, { depthTest: false, depthWrite: false }); this.banner.m.position.set(0, 0.12, -1.6); this.banner.m.renderOrder = 1000; this.banner.m.visible = false; cam.add(this.banner.m);
    this.bannerT = 0; this.bannerKey = '';
    // vignette: red = damage, black = death fade
    const vc = document.createElement('canvas'); vc.width = vc.height = 256; const vx = vc.getContext('2d');
    const gr = vx.createRadialGradient(128, 128, 40, 128, 128, 128); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.6, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,1)'); vx.fillStyle = gr; vx.fillRect(0, 0, 256, 256);
    const vt = new THREE.CanvasTexture(vc);
    const mk = (color, z, map) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), new THREE.MeshBasicMaterial({ color, map, transparent: true, opacity: 0, depthTest: false, depthWrite: false, fog: false, toneMapped: false })); m.position.z = z; m.renderOrder = 999; m.visible = false; cam.add(m); return m; };
    this.vig = mk(0xd01008, -0.3, vt); this.fade = mk(0x000000, -0.28, null); this.comfort = mk(0x000000, -0.32, vt);
    this.hurt = 0; this.hitT = 0;
    // wrist display on the left hand
    this.wrist = canvasPlane(0.075, 0.05, 256, 170); this.wrist.m.position.set(-0.03, 0.036, 0.09); this.wrist.m.rotation.set(-Math.PI / 2, 0, 0);
    game.player.hands[0].mesh.add(this.wrist.m); this.wristKey = '';
    // DOM
    this.el = { hud: document.getElementById('hud'), hp: document.getElementById('hp'), ammo: document.getElementById('ammo'), score: document.getElementById('score'), msg: document.getElementById('msg'), cross: document.getElementById('cross'), hpbar: document.getElementById('hpbar') };
  }

  show(text, sub = '', secs = 2.5, color = '#ffffff') {
    const { x, t, m } = this.banner; x.clearRect(0, 0, 1024, 256);
    x.textAlign = 'center'; x.textBaseline = 'middle'; x.shadowColor = 'rgba(0,0,0,0.9)'; x.shadowBlur = 18;
    x.fillStyle = color; x.font = '900 110px system-ui, sans-serif'; x.fillText(text, 512, sub ? 100 : 128);
    if (sub) { x.fillStyle = '#c8d4e0'; x.font = '600 44px system-ui, sans-serif'; x.fillText(sub, 512, 200); }
    t.needsUpdate = true; m.visible = this.g.player.vr; this.bannerT = secs; m.material.opacity = 1;
    this.el.msg.innerHTML = `<b style="color:${color}">${text}</b><br><small>${sub}</small>`; this.el.msg.style.opacity = 1;
  }
  hit(amount) { this.hurt = Math.min(1, this.hurt + amount / 45); }
  hitmarker(head) { this.hitT = 0.14; this.el.cross.style.borderColor = head ? '#ff4030' : '#ffffff'; this.el.cross.style.transform = 'translate(-50%,-50%) scale(1.8) rotate(45deg)'; }

  update(dt) {
    const g = this.g, p = g.player, vr = p.vr;
    if (this.bannerT > 0) { this.bannerT -= dt; const o = Math.min(1, this.bannerT * 2.5); this.banner.m.material.opacity = o; this.el.msg.style.opacity = o; if (this.bannerT <= 0) this.banner.m.visible = false; }
    this.hurt = Math.max(0, this.hurt - dt * 0.9);
    const low = p.alive && p.hp < 35 ? (0.25 + 0.15 * Math.sin(performance.now() * 0.008)) * (1 - p.hp / 35) : 0;
    const v = Math.max(this.hurt, low); this.vig.visible = v > 0.01; this.vig.material.opacity = v * 0.85;
    const f = p.alive ? 0 : Math.min(0.85, (3 - p.respawnT) * 0.6); this.fade.visible = f > 0.01; this.fade.material.opacity = f;
    const cv = vr && g.settings.vignette ? Math.min(0.75, p.moveSpeed / 6) : 0; this.comfort.visible = cv > 0.02; this.comfort.material.opacity += (cv - this.comfort.material.opacity) * Math.min(1, dt * 8);
    if (this.hitT > 0) { this.hitT -= dt; if (this.hitT <= 0) { this.el.cross.style.transform = 'translate(-50%,-50%)'; this.el.cross.style.borderColor = 'rgba(255,255,255,0.75)'; } }

    const w = p.mainWeapon(), sc = g.match.sc, me = g.myIndex, tl = Math.max(0, Math.ceil(g.match.tl || 0));
    const hint = !w ? '' : w.reloadT > 0 ? 'RELOADING' : w.magwell && !w.magIn ? 'NO MAG' : w.locked ? 'BOLT LOCKED' : w.needsRack || (w.def.pump && !w.chambered && w.mag > 0) ? (w.def.pump ? 'PUMP' : 'RACK') : !w.chambered ? 'EMPTY' : '';
    const key = [Math.ceil(p.hp), sc[0], sc[1], w ? w.type + w.rounds + '/' + w.reserve : '-', hint, p.grenades, tl].join('|');
    if (key !== this.wristKey) {
      this.wristKey = key;
      const { x, t } = this.wrist; x.fillStyle = '#04080b'; x.fillRect(0, 0, 256, 170); x.strokeStyle = '#1f6f80'; x.lineWidth = 4; x.strokeRect(2, 2, 252, 166);
      x.fillStyle = '#12303a'; x.fillRect(14, 14, 228, 22); x.fillStyle = p.hp > 35 ? '#30ffb0' : '#ff4030'; x.fillRect(14, 14, 228 * p.hp / 100, 22);
      x.font = 'bold 44px monospace'; x.textBaseline = 'top'; x.textAlign = 'left'; x.fillStyle = '#7fe8ff'; x.fillText(`${sc[me]}`, 16, 46); x.fillStyle = '#ff8a50'; x.textAlign = 'right'; x.fillText(`${sc[1 - me]}`, 240, 46);
      x.textAlign = 'center'; x.fillStyle = '#9fb4c0'; x.font = 'bold 26px monospace'; x.fillText(`${Math.floor(tl / 60)}:${String(tl % 60).padStart(2, '0')}`, 128, 56);
      x.font = 'bold 30px monospace'; x.fillStyle = '#e8f0f4'; x.textAlign = 'left'; x.fillText(w ? `${w.rounds}/${w.reserve}` : '--', 16, 100); x.textAlign = 'right'; x.fillStyle = '#b8d090'; x.fillText('G' + p.grenades, 240, 100);
      if (hint) { x.fillStyle = '#ffb020'; x.textAlign = 'center'; x.font = 'bold 26px monospace'; x.fillText(hint, 128, 136); }
      t.needsUpdate = true;
      this.el.hp.textContent = Math.ceil(p.hp); this.el.hpbar.style.width = p.hp + '%'; this.el.hpbar.style.background = p.hp > 35 ? '#30ffb0' : '#ff4030';
      this.el.ammo.innerHTML = w ? `<b>${w.rounds}</b> / ${w.reserve} <span>${w.def.name}${hint ? ' · ' + hint : ''}</span><br><small>grenades ${p.grenades}</small>` : '';
      this.el.score.innerHTML = `<b style="color:#7fe8ff">${sc[me]}</b> <small>${Math.floor(tl / 60)}:${String(tl % 60).padStart(2, '0')}</small> <b style="color:#ff8a50">${sc[1 - me]}</b>`;
    }
    this.el.hud.style.display = !vr && g.playing ? 'block' : 'none';
  }
}
