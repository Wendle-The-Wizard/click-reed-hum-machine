// Step 5: the keyboard plays the reeds too!
const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');

const COUNT = 12;
const LONGEST = 300;
const SHORTEST = 90;
const BASE_Y = canvas.height - 40;

// A pentatonic scale (semitones above the lowest note) so it always sounds friendly
const STEPS = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26];
const LOWEST_HZ = 98;

// Keys, one per reed, longest to shortest (two rows so both work)
const HOME_KEYS = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'Enter'];
const NUM_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='];

const reeds = [];
for (let i = 0; i < COUNT; i++) {
  const t = i / (COUNT - 1);
  reeds.push({
    height: LONGEST - (LONGEST - SHORTEST) * t,
    x: 50 + i * ((canvas.width - 100) / (COUNT - 1)),
    freq: LOWEST_HZ * Math.pow(2, STEPS[i] / 12),
    wiggle: 0,
    glow: 0,
    phase: i * 0.7
  });
}

// Sound is created on the first click or key, because browsers want a gesture first
let audio = null;
function hum(freq) {
  if (!audio) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    audio = new AC();
  }
  if (audio.state === 'suspended') audio.resume();
  const now = audio.currentTime;
  const out = audio.createGain();
  out.gain.setValueAtTime(0.0001, now);
  out.gain.exponentialRampToValueAtTime(0.3, now + 0.04);
  out.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
  out.connect(audio.destination);
  [['triangle', 0], ['sine', 4]].forEach(([type, detune]) => {
    const o = audio.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    o.detune.value = detune;
    o.connect(out);
    o.start(now);
    o.stop(now + 1.7);
  });
}

function drawGlow(r, tx) {
  if (r.glow <= 0.01) return;
  const time = performance.now() / 1000;
  const gx = tx + Math.sin(time * 2.2 + r.phase) * 10 * r.glow;
  const gy = BASE_Y - r.height * (0.55 + 0.1 * Math.sin(time * 1.6 + r.phase));
  const rad = 60 + 14 * Math.sin(time * 3 + r.phase);
  const g = ctx.createRadialGradient(gx, gy, 2, gx, gy, rad);
  g.addColorStop(0, 'rgba(210,255,150,' + (0.6 * r.glow) + ')');
  g.addColorStop(1, 'rgba(210,255,150,0)');
  ctx.fillStyle = g;
  ctx.fillRect(gx - rad, gy - rad, rad * 2, rad * 2);
}

function drawReed(r) {
  const topY = BASE_Y - r.height;
  const w = 16;
  const time = performance.now();
  // a tiny idle breeze plus a bigger sway while humming
  const sway = Math.sin(time / 45) * 12 * r.wiggle * (r.height / LONGEST + 0.4)
            + Math.sin(time / 900 + r.phase) * 2 * (r.height / LONGEST)
            + Math.sin(time / 300 + r.phase) * 8 * r.glow * (r.height / LONGEST + 0.4);
  const tx = r.x + sway;
  drawGlow(r, tx);
  const g = ctx.createLinearGradient(r.x - w, 0, r.x + w, 0);
  const bright = r.glow > 0.01;
  g.addColorStop(0, '#4f7a3a');
  g.addColorStop(0.5, bright ? '#c6f080' : '#8fbf5a');
  g.addColorStop(1, '#4f7a3a');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(r.x - w / 2, BASE_Y);
  ctx.quadraticCurveTo(r.x - w / 3, BASE_Y - r.height / 2, tx - w / 3, topY + 12);
  ctx.quadraticCurveTo(tx, topY - 6, tx + w / 3, topY + 12);
  ctx.quadraticCurveTo(r.x + w / 3, BASE_Y - r.height / 2, r.x + w / 2, BASE_Y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#7a4a28';
  ctx.beginPath();
  ctx.ellipse(tx, topY + 6, 7, 16, sway * 0.02, 0, Math.PI * 2);
  ctx.fill();
}

// Always animating, so the reeds keep a gentle sway and glows are always visible
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#10222e';
  ctx.fillRect(0, BASE_Y, canvas.width, 40);
  reeds.forEach(r => {
    drawReed(r);
    r.wiggle = Math.max(0, r.wiggle - 0.015);
    r.glow = Math.max(0, r.glow - 0.004);
  });
  requestAnimationFrame(draw);
}

function play(r) {
  r.wiggle = 1;
  r.glow = 1;
  hum(r.freq);
}

function reedAt(px, py) {
  let best = null, bestD = 28;
  reeds.forEach(r => {
    const topY = BASE_Y - r.height;
    if (py < topY - 10 || py > BASE_Y) return;
    const d = Math.abs(px - r.x);
    if (d < bestD) { bestD = d; best = r; }
  });
  return best;
}

canvas.addEventListener('pointerdown', e => {
  const rect = canvas.getBoundingClientRect();
  const px = (e.clientX - rect.left) * canvas.width / rect.width;
  const py = (e.clientY - rect.top) * canvas.height / rect.height;
  const r = reedAt(px, py);
  if (r) play(r);
});

// Keyboard: look the key up in both rows. Ignore held-down repeats.
window.addEventListener('keydown', e => {
  if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  let i = HOME_KEYS.indexOf(k);
  if (i < 0) i = NUM_KEYS.indexOf(k);
  if (i >= 0) {
    e.preventDefault();
    play(reeds[i]);
  }
});

// Show a little glow at the start so you can see what humming looks like
reeds[3].glow = 1;
reeds[3].wiggle = 0.6;

draw();
