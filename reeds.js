// Step 2: reeds react to clicks! (Sound comes in step 3.)
const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');

const COUNT = 12;
const LONGEST = 300;
const SHORTEST = 90;
const BASE_Y = canvas.height - 40;

const reeds = [];
for (let i = 0; i < COUNT; i++) {
  const t = i / (COUNT - 1);
  reeds.push({
    height: LONGEST - (LONGEST - SHORTEST) * t,
    x: 50 + i * ((canvas.width - 100) / (COUNT - 1)),
    wiggle: 0 // 1 right after a click, fades to 0
  });
}

function drawReed(r) {
  const topY = BASE_Y - r.height;
  const w = 16;
  // sway sideways at the top, more when wiggling
  const sway = Math.sin(performance.now() / 45) * 12 * r.wiggle * (r.height / LONGEST + 0.4);
  const tx = r.x + sway;
  const g = ctx.createLinearGradient(r.x - w, 0, r.x + w, 0);
  const bright = r.wiggle > 0.01;
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
  // brown fluffy head
  ctx.fillStyle = '#7a4a28';
  ctx.beginPath();
  ctx.ellipse(tx, topY + 6, 7, 16, sway * 0.02, 0, Math.PI * 2);
  ctx.fill();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#10222e';
  ctx.fillRect(0, BASE_Y, canvas.width, 40);
  let busy = false;
  reeds.forEach(r => {
    drawReed(r);
    if (r.wiggle > 0) {
      r.wiggle = Math.max(0, r.wiggle - 0.015);
      busy = true;
    }
  });
  if (busy) requestAnimationFrame(draw);
  else running = false;
}

let running = false;
function kick() {
  if (!running) { running = true; requestAnimationFrame(draw); }
}

// Find which reed was hit; works for mouse and touch via pointer events
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
  if (r) { r.wiggle = 1; kick(); }
});

draw();
