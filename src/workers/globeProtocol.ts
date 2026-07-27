type GlobeInitMessage = {
  readonly type: "init";
  readonly canvas: OffscreenCanvas;
};

type GlobeResizeMessage = {
  readonly type: "resize";
  readonly width: number;
  readonly height: number;
  readonly dpr: number;
};

type GlobeQuakesMessage = {
  readonly type: "quakes";
  readonly buf: ArrayBuffer;
};

type GlobeFiresMessage = {
  readonly type: "fires";
  readonly buf: ArrayBuffer;
};

type GlobeFrameTickMessage = {
  readonly type: "frame";
  readonly elapsedMs: number;
  readonly reduced: boolean;
};

type GlobeMainToWorkerMessage =
  | GlobeInitMessage
  | GlobeResizeMessage
  | GlobeQuakesMessage
  | GlobeFiresMessage
  | GlobeFrameTickMessage;

type GlobeWorkerToMainMessage = {
  readonly type: "frame";
  readonly bitmap: ImageBitmap;
};
