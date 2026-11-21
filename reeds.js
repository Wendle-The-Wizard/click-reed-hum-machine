// Step 1: just draw the reeds. Clicking comes next!
const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');

const COUNT = 12;          // how many reeds in the row
const LONGEST = 300;       // tallest reed height
const SHORTEST = 90;       // smallest reed height

// Each reed gets a height, going from long to short
const reeds = [];
for (let i = 0; i < COUNT; i++) {
  const t = i / (COUNT - 1);
  reeds.push({
    height: LONGEST - (LONGEST - SHORTEST) * t,
    x: 50 + i * ((canvas.width - 100) / (COUNT - 1))
  });
}

function drawReed(r) {
  const baseY = canvas.height - 40;
  const topY = baseY - r.height;
  const w = 16;
  // stalk
  const g = ctx.createLinearGradient(r.x - w, 0, r.x + w, 0);
  g.addColorStop(0, '#4f7a3a');
  g.addColorStop(0.5, '#8fbf5a');
  g.addColorStop(1, '#4f7a3a');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(r.x - w / 2, baseY);
  ctx.lineTo(r.x - w / 3, topY + 12);
  ctx.quadraticCurveTo(r.x, topY - 6, r.x + w / 3, topY + 12);
  ctx.lineTo(r.x + w / 2, baseY);
  ctx.closePath();
  ctx.fill();
  // little segment lines
  ctx.strokeStyle = 'rgba(20,40,20,0.5)';
  ctx.lineWidth = 1;
  for (let y = baseY - 30; y > topY + 20; y -= 30) {
    ctx.beginPath();
    ctx.moveTo(r.x - w / 2.5, y);
    ctx.lineTo(r.x + w / 2.5, y);
    ctx.stroke();
  }
  // brown fluffy head
  ctx.fillStyle = '#7a4a28';
  ctx.beginPath();
  ctx.ellipse(r.x, topY + 6, 7, 16, 0, 0, Math.PI * 2);
  ctx.fill();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // water at the bottom
  ctx.fillStyle = '#10222e';
  ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
  reeds.forEach(drawReed);
}

draw();
