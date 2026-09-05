/// <reference lib="webworker" />
/// <reference path="./globeProtocol.d.ts" />

// Direct OffscreenCanvas renderer for the passive globe.

const TILT_RADIANS = 0.24;
const COS_TILT = Math.cos(TILT_RADIANS);
const SIN_TILT = Math.sin(TILT_RADIANS);
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

// Rotation-invariant projection terms.
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
  for (let i = 0; i < pointCount; i++) {
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
  for (let i = 0; i < count; i++) {
    const x = -v[i] * cosRy + u[i] * sinRy;
    const z = u[i] * cosRy + v[i] * sinRy;
    const y = cosPhi[i];
    const tiltedY = y * COS_TILT - z * SIN_TILT;
    out.x[i] = centerX + x * radius;
    out.y[i] = centerY - tiltedY * radius;
    out.z[i] = y * SIN_TILT + z * COS_TILT;
  }
}

const LAT_RING_STEP_DEG = 20;
const LAT_RING_MIN_DEG = -80;
const LAT_RING_MAX_DEG = 80;
const LAT_RING_ALPHA = 0.11;

const LON_MERIDIAN_STEP_DEG = 30;
const LON_MERIDIAN_SAMPLE_MIN_DEG = -90;
const LON_MERIDIAN_SAMPLE_MAX_DEG = 90;
const LON_MERIDIAN_ALPHA = 0.09;
const GRATICULE_SAMPLE_STEP_DEG = 3;

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
      let lon = -HALF_CIRCLE_DEGREES;
      lon <= HALF_CIRCLE_DEGREES;
      lon += GRATICULE_SAMPLE_STEP_DEG
    ) {
      lats.push(lat);
      lons.push(lon);
    }
    rings.push({ start, size: lats.length - start, alpha: LAT_RING_ALPHA });
  }
  for (
    let lon = -HALF_CIRCLE_DEGREES;
    lon < HALF_CIRCLE_DEGREES;
    lon += LON_MERIDIAN_STEP_DEG
  ) {
    const start = lats.length;
    for (
      let lat = LON_MERIDIAN_SAMPLE_MIN_DEG;
      lat <= LON_MERIDIAN_SAMPLE_MAX_DEG;
      lat += GRATICULE_SAMPLE_STEP_DEG
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
  ctx.strokeStyle = `rgba(${palette.accentRgb},${ring.alpha})`;
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
  ctx.strokeStyle = `rgba(${palette.accentRgb},${LIMB_ALPHA})`;
  ctx.lineWidth = LIMB_LINE_WIDTH;
  ctx.stroke();
}

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
  for (let i = 0; i < pointCount; i++) {
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
  scheduleRender();
}

function loadFiresBuffer(buf: ArrayBuffer): void {
  const flat = new Float32Array(buf);
  const pointCount = Math.floor(flat.length / FIRE_FIELDS_PER_POINT);
  const lats = new Float64Array(pointCount);
  const lons = new Float64Array(pointCount);
  for (let i = 0; i < pointCount; i++) {
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
  scheduleRender();
}

// Individual draws preserve density through alpha accumulation.
const FIRE_SPECKLE_ALPHA = 0.28;
const FIRE_SPECKLE_SIZE = 1;
const FIRE_SPECKLE_HALF_SIZE = FIRE_SPECKLE_SIZE / 2;
const OPAQUE_ALPHA = 1;

function drawFires(points: ProjectedPoints, revealedCount: number): void {
  ctx.fillStyle = `rgb(${palette.fireRgb})`;
  ctx.globalAlpha = FIRE_SPECKLE_ALPHA;
  for (let i = 0; i < revealedCount; i++) {
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

// Pulse phase uses accumulated render time.
function drawQuakes(
  points: ProjectedPoints,
  revealedCount: number,
  clockMs: number,
  reducedMotion: boolean
): void {
  for (let i = 0; i < revealedCount; i++) {
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
      gradient.addColorStop(0, `rgba(${palette.accentRgb},${QUAKE_GLOW_INNER_ALPHA})`);
      gradient.addColorStop(1, `rgba(${palette.accentRgb},${QUAKE_GLOW_OUTER_ALPHA})`);
      ctx.globalAlpha = depthAlpha * ageFactor * QUAKE_GLOW_ALPHA_SCALE;
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(px, py, glowRadius, 0, TWO_PI);
      ctx.fill();
    }

    ctx.globalAlpha = depthAlpha * ageFactor * QUAKE_CORE_ALPHA_SCALE;
    ctx.fillStyle = `rgb(${palette.accentRgb})`;
    ctx.beginPath();
    ctx.arc(px, py, size, 0, TWO_PI);
    ctx.fill();
  }
  ctx.globalAlpha = OPAQUE_ALPHA;
}

const GLOBE_RADIUS_SCALE = 0.4;
const MIN_CANVAS_DIMENSION_PX = 1;

let canvas: OffscreenCanvas | null = null;
let ctx: OffscreenCanvasRenderingContext2D;
let palette: GlobePalette;
let canvasWidth = 0;
let canvasHeight = 0;
let canvasDevicePixelRatio = 1;
let rotationRadians = 0;
let clockMs = 0;
let reducedMotion = false;
let renderingEnabled = false;
let frameRequestId: number | null = null;
let lastFrameTimeMs = 0;

function revealIsComplete(): boolean {
  return revealedQuakeCount === quakes.count && revealedFireCount === fires.count;
}

function scheduleRender(): void {
  if (!renderingEnabled || frameRequestId !== null || !canvas) return;
  if (canvasWidth === 0 || canvasHeight === 0) return;
  frameRequestId = requestAnimationFrame(renderFrame);
}

function setRendering(enabled: boolean): void {
  renderingEnabled = enabled;
  lastFrameTimeMs = 0;
  if (enabled) {
    scheduleRender();
    return;
  }
  if (frameRequestId !== null) cancelAnimationFrame(frameRequestId);
  frameRequestId = null;
}

function renderFrame(nowMs: number): void {
  frameRequestId = null;
  if (!renderingEnabled || !canvas || canvasWidth === 0 || canvasHeight === 0) return;

  const elapsedMs = lastFrameTimeMs === 0 ? 0 : nowMs - lastFrameTimeMs;
  lastFrameTimeMs = nowMs;

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

  if (!reducedMotion || !revealIsComplete()) scheduleRender();
}

function handleInit(
  canvasFromMain: OffscreenCanvas,
  paletteFromMain: GlobePalette,
  prefersReducedMotion: boolean
): void {
  canvas = canvasFromMain;
  palette = paletteFromMain;
  reducedMotion = prefersReducedMotion;
  ctx = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;
}

function handleResize(width: number, height: number, dpr: number): void {
  canvasWidth = width;
  canvasHeight = height;
  canvasDevicePixelRatio = dpr;
  if (canvas) {
    canvas.width = Math.max(MIN_CANVAS_DIMENSION_PX, Math.round(width * dpr));
    canvas.height = Math.max(MIN_CANVAS_DIMENSION_PX, Math.round(height * dpr));
  }
  scheduleRender();
}

self.onmessage = (event: MessageEvent<GlobeMainToWorkerMessage>) => {
  const data = event.data;
  if ("enabled" in data) {
    setRendering(data.enabled);
    return;
  }
  if ("canvas" in data) {
    handleInit(data.canvas, data.palette, data.reducedMotion);
    return;
  }
  if ("width" in data) {
    handleResize(data.width, data.height, data.dpr);
    return;
  }
  if ("quakes" in data) {
    loadQuakesBuffer(data.quakes);
    return;
  }
  loadFiresBuffer(data.fires);
};
