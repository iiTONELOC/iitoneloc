type GlobePalette = {
  readonly accentRgb: string;
  readonly fireRgb: string;
};

type GlobeInitMessage = {
  readonly canvas: OffscreenCanvas;
  readonly palette: GlobePalette;
  readonly reducedMotion: boolean;
};

type GlobeResizeMessage = {
  readonly width: number;
  readonly height: number;
  readonly dpr: number;
};

type GlobeQuakesMessage = {
  readonly quakes: ArrayBuffer;
};

type GlobeFiresMessage = {
  readonly fires: ArrayBuffer;
};

type GlobeRenderingMessage = {
  readonly enabled: boolean;
};

type GlobeMainToWorkerMessage =
  | GlobeInitMessage
  | GlobeResizeMessage
  | GlobeQuakesMessage
  | GlobeFiresMessage
  | GlobeRenderingMessage;
