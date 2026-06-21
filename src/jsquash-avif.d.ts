declare module '@jsquash/avif' {
  export function encode(data: ImageData, options?: {
    cqLevel?: number;
    cqAlphaLevel?: number;
    speed?: number;
    subsample?: number;
    chromaDeltaQ?: boolean;
    sharpness?: number;
    tune?: number;
    denoiseLevel?: number;
    bitDepth?: 8 | 10 | 12;
    lossless?: boolean;
    quality?: number;
    qualityAlpha?: number;
  }): Promise<ArrayBuffer>;

  export function decode(buffer: ArrayBuffer): Promise<ImageData>;
}
