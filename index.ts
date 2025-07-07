export interface ProcessingOptions {
  edgeSmoothing: number;
  feathering: number;
  backgroundType: 'transparent' | 'solid' | 'image';
  backgroundColor: string;
  backgroundImage?: string;
}

export interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  stage: string;
}

export interface ImageData {
  original: string;
  processed?: string;
  file?: File;
  dimensions?: {
    width: number;
    height: number;
  };
}