/// <reference lib="webworker" />
/// <reference path="./globeProtocol.ts" />

// Off-main-thread globe renderer. Owns the OffscreenCanvas transferred from the
// main thread and ships a finished ImageBitmap back each frame; the main thread
// only blits it.
//
// Each point's rotation-invariant terms (u, v, cosPhi) are derived once — for
// the graticule at module load, for quakes/fires when their buffer arrives — so
// a frame costs exactly two trig calls total (cos/sin of the current rotation)
// and four multiply-adds per point. Projection buffers are allocated once per
// dataset and overwritten in place, so a frame allocates nothing.

const TILT_RADIANS = 0.24;
const COS_TILT = Math.cos(TILT_RADIANS);
const SIN_TILT = Math.sin(TILT_RADIANS);
const ACCENT_RGB = "255,180,84";
const FIRE_RGB = "255,107,61";

const TWO_PI = Math.PI * 2;
const DEGREES_PER_RADIAN = 180 / Math.PI;
const HALF_CIRCLE_DEGREES = 180;
const QUARTER_CIRCLE_DEGREES = 90;

// ~84s per revolution. Paced by real elapsed time, so this rate holds
// regardless of frame drops.
const ROTATION_RADIANS_PER_MS = 0.000075;
// Large datasets fade in over successive frames rather than appearing at once,
// so a 44k-point fire set never lands as a single hitch.
const REVEAL_POINTS_PER_FRAME = 2000;

/**
 * Per-point terms that do not change as the globe spins, derived once from
 * (lat, lon). Since theta = theta0 + ry, the angle-sum identity turns the
 * per-frame projection into a 2x2 rotation matrix applied to these — cos(ry)
 * and sin(ry) are computed once per frame, never per point. Algebraically
 * identical to projecting from raw degrees every frame; only the derivation
 * changed.
 */
type StaticTerms = {
  readonly u: Float32Array;
  readonly v: Float32Array;
  readonly cosPhi: Float32Array;
};

function computeStaticTerms(lats: Float64Array, lons: Float64Array): StaticTerms {
  const pointCount = lats.length;
  const u = new Float32Array(pointCount);
  const v = new Float32Array(pointCount);
  const cosPhi = new Float32Array(pointCount);
  for (const i of u.keys()) {
    const phi = (QUARTER_CIRCLE_DEGREES - lats[i]) / DEGREES_PER_RADIAN;
    const theta0 = (lons[i] + HALF_CIRCLE_DEGREES) / DEGREES_PER_RADIAN;
    const sinPhi = Math.sin(phi);
    u[i] = sinPhi * Math.sin(theta0);
    v[i] = sinPhi * Math.cos(theta0);
    cosPhi[i] = Math.cos(phi);
  }
  return { u, v, cosPhi };
}

/** Screen-space output, reused every frame. z is the depth term: <= 0 is behind the globe. */
type ProjectedPoints = {
  readonly x: Float32Array;
  readonly y: Float32Array;
  readonly z: Float32Array;
};

function allocateProjectedPoints(pointCount: number): ProjectedPoints {
  return {
    x: new Float32Array(pointCount),
    y: new Float32Array(pointCount),
    z: new Float32Array(pointCount),
  };
}

/** The one projection step, shared by graticule, quakes, and fires alike. */
function rotateProject(
  terms: StaticTerms,
  rotationRadians: number,
  centerX: number,
  centerY: number,
  radius: number,
  count: number,
  out: ProjectedPoints
): void {
  const cosRy = Math.cos(rotationRadians);
  const sinRy = Math.sin(rotationRadians);
  const { u, v, cosPhi } = terms;
  for (const i of u.subarray(0, count).keys()) {
    const x = -v[i] * cosRy + u[i] * sinRy;
    const z = u[i] * cosRy + v[i] * sinRy;
    const y = cosPhi[i];
    const tiltedY = y * COS_TILT - z * SIN_TILT;
    out.x[i] = centerX + x * radius;
    out.y[i] = centerY - tiltedY * radius;
    out.z[i] = y * SIN_TILT + z * COS_TILT;
  }
}

// ── Graticule ─────────────────────────────────────────────────────────────

const LAT_RING_STEP_DEG = 20;
const LAT_RING_MIN_DEG = -80;
const LAT_RING_MAX_DEG = 80;
const LAT_RING_SAMPLE_STEP_DEG = 3;
const LAT_RING_SAMPLE_MIN_DEG = -180;
const LAT_RING_SAMPLE_MAX_DEG = 180;
const LAT_RING_ALPHA = 0.11;

const LON_MERIDIAN_STEP_DEG = 30;
const LON_MERIDIAN_MIN_DEG = -180;
const LON_MERIDIAN_MAX_DEG_EXCLUSIVE = 180;
const LON_MERIDIAN_SAMPLE_STEP_DEG = 3;
const LON_MERIDIAN_SAMPLE_MIN_DEG = -90;
const LON_MERIDIAN_SAMPLE_MAX_DEG = 90;
const LON_MERIDIAN_ALPHA = 0.09;

const GRATICULE_LINE_WIDTH = 1;
const LIMB_ALPHA = 0.22;
const LIMB_LINE_WIDTH = 1.2;

type GraticuleRing = {
  readonly start: number;
  readonly size: number;
  readonly alpha: number;
};

function buildGraticuleGrid(): {
  lats: Float64Array;
  lons: Float64Array;
  rings: readonly GraticuleRing[];
} {
  const lats: number[] = [];
  const lons: number[] = [];
  const rings: GraticuleRing[] = [];

  for (let lat = LAT_RING_MIN_DEG; lat <= LAT_RING_MAX_DEG; lat += LAT_RING_STEP_DEG) {
    const start = lats.length;
    for (
      let lon = LAT_RING_SAMPLE_MIN_DEG;
      lon <= LAT_RING_SAMPLE_MAX_DEG;
      lon += LAT_RING_SAMPLE_STEP_DEG
    ) {
      lats.push(lat);
      lons.push(lon);
    }
    rings.push({ start, size: lats.length - start, alpha: LAT_RING_ALPHA });
  }
  for (
    let lon = LON_MERIDIAN_MIN_DEG;
    lon < LON_MERIDIAN_MAX_DEG_EXCLUSIVE;
    lon += LON_MERIDIAN_STEP_DEG
  ) {
    const start = lats.length;
    for (
      let lat = LON_MERIDIAN_SAMPLE_MIN_DEG;
      lat <= LON_MERIDIAN_SAMPLE_MAX_DEG;
      lat += LON_MERIDIAN_SAMPLE_STEP_DEG
    ) {
      lats.push(lat);
      lons.push(lon);
    }
    rings.push({ start, size: lats.length - start, alpha: LON_MERIDIAN_ALPHA });
  }

  return { lats: Float64Array.from(lats), lons: Float64Array.from(lons), rings };
}

const GRATICULE_GRID = buildGraticuleGrid();
const GRATICULE_TERMS = computeStaticTerms(GRATICULE_GRID.lats, GRATICULE_GRID.lons);
const GRATICULE_POINT_COUNT = GRATICULE_GRID.lats.length;
const graticulePoints = allocateProjectedPoints(GRATICULE_POINT_COUNT);

function strokeGraticuleRing(points: ProjectedPoints, ring: GraticuleRing): void {
  ctx.strokeStyle = `rgba(${ACCENT_RGB},${ring.alpha})`;
  ctx.lineWidth = GRATICULE_LINE_WIDTH;
  ctx.beginPath();
  let penDown = false;
  for (let i = ring.start; i < ring.start + ring.size; i++) {
    if (points.z[i] <= 0) {
      penDown = false;
      continue;
    }
    if (penDown) ctx.lineTo(points.x[i], points.y[i]);
    else {
      ctx.moveTo(points.x[i], points.y[i]);
      penDown = true;
    }
  }
  ctx.stroke();
}

function drawGraticule(centerX: number, centerY: number, radius: number): void {
  for (const ring of GRATICULE_GRID.rings) strokeGraticuleRing(graticulePoints, ring);
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, TWO_PI);
  ctx.strokeStyle = `rgba(${ACCENT_RGB},${LIMB_ALPHA})`;
  ctx.lineWidth = LIMB_LINE_WIDTH;
  ctx.stroke();
}

// ── Live datasets ─────────────────────────────────────────────────────────

const QUAKE_FIELDS_PER_POINT = 4; // [lat, lon, mag, ageFactor]
const QUAKE_EXTRA_FIELDS_PER_POINT = 2; // [mag, ageFactor]
const FIRE_FIELDS_PER_POINT = 2; // [lat, lon]

type LiveDataset = {
  readonly count: number;
  readonly terms: StaticTerms;
  /** [mag, ageFactor] * n for quakes; zero-length for fires. */
  readonly extra: Float32Array;
  readonly points: ProjectedPoints;
};

function createEmptyDataset(): LiveDataset {
  return {
    count: 0,
    terms: { u: new Float32Array(0), v: new Float32Array(0), cosPhi: new Float32Array(0) },
    extra: new Float32Array(0),
    points: allocateProjectedPoints(0),
  };
}

let quakes = createEmptyDataset();
let fires = createEmptyDataset();
let revealedQuakeCount = 0;
let revealedFireCount = 0;

function loadQuakesBuffer(buf: ArrayBuffer): void {
  const flat = new Float32Array(buf);
  const pointCount = Math.floor(flat.length / QUAKE_FIELDS_PER_POINT);
  const lats = new Float64Array(pointCount);
  const lons = new Float64Array(pointCount);
  const extra = new Float32Array(pointCount * QUAKE_EXTRA_FIELDS_PER_POINT);
  for (const i of lats.keys()) {
    const base = i * QUAKE_FIELDS_PER_POINT;
    const extraBase = i * QUAKE_EXTRA_FIELDS_PER_POINT;
    lats[i] = flat[base];
    lons[i] = flat[base + 1];
    extra[extraBase] = flat[base + 2];
    extra[extraBase + 1] = flat[base + 3];
  }
  quakes = {
    count: pointCount,
    terms: computeStaticTerms(lats, lons),
    extra,
    points: allocateProjectedPoints(pointCount),
  };
  revealedQuakeCount = Math.min(revealedQuakeCount, pointCount);
}

function loadFiresBuffer(buf: ArrayBuffer): void {
  const flat = new Float32Array(buf);
  const pointCount = Math.floor(flat.length / FIRE_FIELDS_PER_POINT);
  const lats = new Float64Array(pointCount);
  const lons = new Float64Array(pointCount);
  for (const i of lats.keys()) {
    const base = i * FIRE_FIELDS_PER_POINT;
    lats[i] = flat[base];
    lons[i] = flat[base + 1];
  }
  fires = {
    count: pointCount,
    terms: computeStaticTerms(lats, lons),
    extra: new Float32Array(0),
    points: allocateProjectedPoints(pointCount),
  };
  revealedFireCount = Math.min(revealedFireCount, pointCount);
}

// Every revealed, front-facing fire as a speckle at low alpha. Drawn
// individually (not one batched fill) so overlapping detections ACCUMULATE:
// isolated fires stay faint, dense regions build into brighter orange - a
// density read, not a solid blanket.
const FIRE_SPECKLE_ALPHA = 0.28;
const FIRE_SPECKLE_SIZE = 1;
const FIRE_SPECKLE_HALF_SIZE = FIRE_SPECKLE_SIZE / 2;
const OPAQUE_ALPHA = 1;

function drawFires(points: ProjectedPoints, revealedCount: number): void {
  ctx.fillStyle = `rgb(${FIRE_RGB})`;
  ctx.globalAlpha = FIRE_SPECKLE_ALPHA;
  for (const i of points.z.subarray(0, revealedCount).keys()) {
    if (points.z[i] <= 0) continue;
    ctx.fillRect(
      points.x[i] - FIRE_SPECKLE_HALF_SIZE,
      points.y[i] - FIRE_SPECKLE_HALF_SIZE,
      FIRE_SPECKLE_SIZE,
      FIRE_SPECKLE_SIZE
    );
  }
  ctx.globalAlpha = OPAQUE_ALPHA;
}

const QUAKE_SIZE_BY_MAGNITUDE_CEILING: readonly (readonly [ceiling: number, size: number])[] = [
  [1, 1.2],
  [2, 1.5],
  [3, 2],
  [4, 3],
  [5, 4.5],
  [6, 6],
  [7, 8],
];
const QUAKE_SIZE_ABOVE_ALL_CEILINGS = 10;

function quakeSize(magnitude: number): number {
  for (const [ceiling, size] of QUAKE_SIZE_BY_MAGNITUDE_CEILING) {
    if (magnitude < ceiling) return size;
  }
  return QUAKE_SIZE_ABOVE_ALL_CEILINGS;
}

// Points facing the viewer (z near 1) render near-full strength; points near
// the limb (z near 0) fade toward the floor.
const DEPTH_ALPHA_FLOOR = 0.4;
const DEPTH_ALPHA_RANGE = 1 - DEPTH_ALPHA_FLOOR;
const QUAKE_CORE_ALPHA_SCALE = 0.85;

const QUAKE_GLOW_MAGNITUDE_THRESHOLD = 3;
const QUAKE_GLOW_MAGNITUDE_RANGE = 4;
const QUAKE_PULSE_TIME_SCALE = 0.003;
const QUAKE_PULSE_PHASE_PER_POINT = 0.7;
const QUAKE_PULSE_BASE_AMPLITUDE = 0.1;
const QUAKE_PULSE_INTENSITY_AMPLITUDE = 0.2;
const QUAKE_GLOW_BASE_RADIUS_SCALE = 1.8;
const QUAKE_GLOW_INTENSITY_RADIUS_SCALE = 1.5;
const QUAKE_GLOW_ALPHA_SCALE = 0.5;
const QUAKE_GLOW_INNER_ALPHA = 0.25;
const QUAKE_GLOW_OUTER_ALPHA = 0;
const REDUCED_MOTION_PULSE = 1;
const MAX_PULSE_INTENSITY = 1;

/**
 * `clockMs` is the accumulated render clock, not a per-frame delta: the pulse
 * phase has to advance continuously across frames.
 */
function drawQuakes(
  points: ProjectedPoints,
  revealedCount: number,
  clockMs: number,
  reducedMotion: boolean
): void {
  for (const i of points.z.subarray(0, revealedCount).keys()) {
    const z = points.z[i];
    if (z <= 0) continue;
    const magnitude = quakes.extra[i * QUAKE_EXTRA_FIELDS_PER_POINT];
    const ageFactor = quakes.extra[i * QUAKE_EXTRA_FIELDS_PER_POINT + 1];
    const px = points.x[i];
    const py = points.y[i];
    const depthAlpha = DEPTH_ALPHA_FLOOR + z * DEPTH_ALPHA_RANGE;
    const size = quakeSize(magnitude);

    if (magnitude > QUAKE_GLOW_MAGNITUDE_THRESHOLD) {
      const intensity = Math.min(
        MAX_PULSE_INTENSITY,
        (magnitude - QUAKE_GLOW_MAGNITUDE_THRESHOLD) / QUAKE_GLOW_MAGNITUDE_RANGE
      );
      const pulse = reducedMotion
        ? REDUCED_MOTION_PULSE
        : REDUCED_MOTION_PULSE +
          Math.sin(clockMs * QUAKE_PULSE_TIME_SCALE + i * QUAKE_PULSE_PHASE_PER_POINT) *
            (QUAKE_PULSE_BASE_AMPLITUDE + intensity * QUAKE_PULSE_INTENSITY_AMPLITUDE);
      const glowRadius =
        size * (QUAKE_GLOW_BASE_RADIUS_SCALE + intensity * QUAKE_GLOW_INTENSITY_RADIUS_SCALE) * pulse;
      const gradient = ctx.createRadialGradient(px, py, 0, px, py, glowRadius);
      gradient.addColorStop(0, `rgba(${ACCENT_RGB},${QUAKE_GLOW_INNER_ALPHA})`);
      gradient.addColorStop(1, `rgba(${ACCENT_RGB},${QUAKE_GLOW_OUTER_ALPHA})`);
      ctx.globalAlpha = depthAlpha * ageFactor * QUAKE_GLOW_ALPHA_SCALE;
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(px, py, glowRadius, 0, TWO_PI);
      ctx.fill();
    }

    ctx.globalAlpha = depthAlpha * ageFactor * QUAKE_CORE_ALPHA_SCALE;
    ctx.fillStyle = `rgb(${ACCENT_RGB})`;
    ctx.beginPath();
    ctx.arc(px, py, size, 0, TWO_PI);
    ctx.fill();
  }
  ctx.globalAlpha = OPAQUE_ALPHA;
}

// ── Frame loop ────────────────────────────────────────────────────────────

const GLOBE_RADIUS_SCALE = 0.4;
const MIN_CANVAS_DIMENSION_PX = 1;

let canvas: OffscreenCanvas | null = null;
let ctx: OffscreenCanvasRenderingContext2D;
let canvasWidth = 0;
let canvasHeight = 0;
let canvasDevicePixelRatio = 1;
let rotationRadians = 0;
let clockMs = 0;

function renderFrame(elapsedMs: number, reducedMotion: boolean): void {
  if (!canvas || canvasWidth === 0 || canvasHeight === 0) return;

  clockMs += elapsedMs;
  if (!reducedMotion) rotationRadians += elapsedMs * ROTATION_RADIANS_PER_MS;
  revealedQuakeCount = Math.min(quakes.count, revealedQuakeCount + REVEAL_POINTS_PER_FRAME);
  revealedFireCount = Math.min(fires.count, revealedFireCount + REVEAL_POINTS_PER_FRAME);

  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const radius = Math.min(canvasWidth, canvasHeight) * GLOBE_RADIUS_SCALE;

  rotateProject(
    GRATICULE_TERMS,
    rotationRadians,
    centerX,
    centerY,
    radius,
    GRATICULE_POINT_COUNT,
    graticulePoints
  );
  rotateProject(
    fires.terms,
    rotationRadians,
    centerX,
    centerY,
    radius,
    revealedFireCount,
    fires.points
  );
  rotateProject(
    quakes.terms,
    rotationRadians,
    centerX,
    centerY,
    radius,
    revealedQuakeCount,
    quakes.points
  );

  ctx.setTransform(canvasDevicePixelRatio, 0, 0, canvasDevicePixelRatio, 0, 0);
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  drawGraticule(centerX, centerY, radius);
  drawFires(fires.points, revealedFireCount);
  drawQuakes(quakes.points, revealedQuakeCount, clockMs, reducedMotion);

  const bitmap = canvas.transferToImageBitmap();
  const message: GlobeWorkerToMainMessage = { type: "frame", bitmap };
  self.postMessage(message, [bitmap]);
}

function handleInit(canvasFromMain: OffscreenCanvas): void {
  canvas = canvasFromMain;
  ctx = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;
}

// Nothing is cached against the viewport, so a resize is just three numbers.
function handleResize(width: number, height: number, dpr: number): void {
  canvasWidth = width;
  canvasHeight = height;
  canvasDevicePixelRatio = dpr;
  if (canvas) {
    canvas.width = Math.max(MIN_CANVAS_DIMENSION_PX, Math.round(width * dpr));
    canvas.height = Math.max(MIN_CANVAS_DIMENSION_PX, Math.round(height * dpr));
  }
}

self.onmessage = (event: MessageEvent<GlobeMainToWorkerMessage>) => {
  const data = event.data;
  switch (data.type) {
    case "init":
      handleInit(data.canvas);
      break;
    case "resize":
      handleResize(data.width, data.height, data.dpr);
      break;
    case "quakes":
      loadQuakesBuffer(data.buf);
      break;
    case "fires":
      loadFiresBuffer(data.buf);
      break;
    case "frame":
      renderFrame(data.elapsedMs, data.reduced);
      break;
    default:
      break;
  }
};
