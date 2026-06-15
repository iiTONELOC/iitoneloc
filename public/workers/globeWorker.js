"use strict";

// Off-main-thread globe renderer. Owns the OffscreenCanvas transferred from the
// main thread, renders graticule + quake pulses + global fire dots, and ships a
// finished ImageBitmap back each frame. The main thread only blits that bitmap.
// Data streams in: each layer reveals progressively (REVEAL_CHUNK/frame) so a
// large fire set never hitches. Mirrors SIGINT's pointWorker boundary.

const TILT = 0.24;
const ACCENT = "255,180,84";
const FIRE = "255,107,61";
const REVEAL_CHUNK = 2000;

let canvas = null;
let ctx = null;
let W = 0;
let H = 0;
let DPR = 1;
let t = 0;
let reduced = false;

let quakes = new Float32Array(0); // [lat, lon, mag, ageFactor] * n
let fires = new Float32Array(0); // [lat, lon] * m
let revealQ = 0;
let revealF = 0;

function proj(lat, lon, cx, cy, r, ry) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180 + ry;
  const x = -Math.sin(phi) * Math.cos(theta);
  const y = Math.cos(phi);
  const z = Math.sin(phi) * Math.sin(theta);
  const cX = Math.cos(TILT);
  const sX = Math.sin(TILT);
  const y2 = y * cX - z * sX;
  const z2 = y * sX + z * cX;
  return { x: cx + x * r, y: cy - y2 * r, z: z2 };
}

function strokeArc(pts, alpha) {
  ctx.strokeStyle = `rgba(${ACCENT},${alpha})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  let on = false;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    if (p.z <= 0) {
      on = false;
      continue;
    }
    if (on) ctx.lineTo(p.x, p.y);
    else {
      ctx.moveTo(p.x, p.y);
      on = true;
    }
  }
  ctx.stroke();
}

function drawGlobe(cx, cy, r, ry) {
  for (let lat = -80; lat <= 80; lat += 20) {
    const pts = [];
    for (let lon = -180; lon <= 180; lon += 3) pts.push(proj(lat, lon, cx, cy, r, ry));
    strokeArc(pts, 0.11);
  }
  for (let lon = -180; lon < 180; lon += 30) {
    const pts = [];
    for (let lat = -90; lat <= 90; lat += 3) pts.push(proj(lat, lon, cx, cy, r, ry));
    strokeArc(pts, 0.09);
  }
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(${ACCENT},0.22)`;
  ctx.lineWidth = 1.2;
  ctx.stroke();
}

// Every revealed, front-facing fire as a 1px speckle at low alpha. Drawn
// individually (not one batched fill) so overlapping detections ACCUMULATE:
// isolated fires stay faint, dense regions build into brighter orange - a
// density read, not a solid blanket. 44k fillRects/frame is cheap off-thread.
function drawFires(cx, cy, r, ry, limit) {
  if (limit === 0) return;
  ctx.fillStyle = `rgb(${FIRE})`;
  ctx.globalAlpha = 0.28;
  for (let i = 0; i < limit; i++) {
    const p = proj(fires[i * 2], fires[i * 2 + 1], cx, cy, r, ry);
    if (p.z <= 0) continue;
    ctx.fillRect(p.x - 0.5, p.y - 0.5, 1, 1);
  }
  ctx.globalAlpha = 1;
}

function quakeSize(m) {
  if (m < 1) return 1.2;
  if (m < 2) return 1.5;
  if (m < 3) return 2;
  if (m < 4) return 3;
  if (m < 5) return 4.5;
  if (m < 6) return 6;
  if (m < 7) return 8;
  return 10;
}

function drawQuakes(cx, cy, r, ry, limit) {
  for (let i = 0; i < limit; i++) {
    const lat = quakes[i * 4];
    const lon = quakes[i * 4 + 1];
    const mag = quakes[i * 4 + 2];
    const af = quakes[i * 4 + 3];
    const p = proj(lat, lon, cx, cy, r, ry);
    if (p.z <= 0) continue;
    const depth = 0.4 + p.z * 0.6;
    const size = quakeSize(mag);
    if (mag > 3) {
      const pi = Math.min(1, (mag - 3) / 4);
      const pulse = reduced ? 1 : 1 + Math.sin(t * 0.003 + i * 0.7) * (0.1 + pi * 0.2);
      const gr = size * (1.8 + pi * 1.5) * pulse;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, gr);
      g.addColorStop(0, `rgba(${ACCENT},0.25)`);
      g.addColorStop(1, `rgba(${ACCENT},0)`);
      ctx.globalAlpha = depth * af * 0.5;
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, gr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = depth * af * 0.85;
    ctx.fillStyle = `rgb(${ACCENT})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function renderFrame() {
  if (!canvas || !ctx || W === 0 || H === 0) return;
  const nQ = quakes.length / 4;
  const nF = fires.length / 2;
  revealQ = Math.min(nQ, revealQ + REVEAL_CHUNK);
  revealF = Math.min(nF, revealF + REVEAL_CHUNK);

  const ry = t * 0.0001;
  const cx = W / 2;
  const cy = H / 2;
  const r = Math.min(W, H) * 0.4;

  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.clearRect(0, 0, W, H);
  drawGlobe(cx, cy, r, ry);
  drawFires(cx, cy, r, ry, revealF);
  drawQuakes(cx, cy, r, ry, revealQ);

  const bitmap = canvas.transferToImageBitmap();
  self.postMessage({ type: "frame", bitmap: bitmap }, [bitmap]);
}

self.onmessage = (e) => {
  const d = e.data;
  switch (d.type) {
    case "init":
      canvas = d.canvas;
      ctx = canvas.getContext("2d");
      break;
    case "resize":
      W = d.W;
      H = d.H;
      DPR = d.dpr;
      if (canvas) {
        canvas.width = Math.max(1, Math.round(W * DPR));
        canvas.height = Math.max(1, Math.round(H * DPR));
      }
      break;
    case "quakes":
      quakes = new Float32Array(d.buf);
      if (revealQ > quakes.length / 4) revealQ = quakes.length / 4;
      break;
    case "fires":
      fires = new Float32Array(d.buf);
      if (revealF > fires.length / 2) revealF = fires.length / 2;
      break;
    case "frame":
      t = d.t;
      reduced = d.reduced;
      renderFrame();
      break;
    default:
      break;
  }
};
