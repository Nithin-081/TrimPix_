import { useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as bodyPix from '@tensorflow-models/body-pix';
import { ProcessingOptions, ProcessingState, ImageData } from '../types';

export const useImageProcessor = () => {
  const [model, setModel] = useState<bodyPix.BodyPix | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    stage: 'idle'
  });

  const initializeModel = useCallback(async () => {
    if (model) return model;
    
    setProcessingState({
      isProcessing: true,
      progress: 0,
      stage: 'Loading AI model...'
    });

    try {
      const loadedModel = await bodyPix.load({
        architecture: 'MobileNetV1',
        outputStride: 16,
        multiplier: 0.75,
        quantBytes: 2,
      });
      
      setModel(loadedModel);
      setProcessingState({
        isProcessing: false,
        progress: 100,
        stage: 'Model loaded'
      });
      
      return loadedModel;
    } catch (error) {
      setProcessingState({
        isProcessing: false,
        progress: 0,
        stage: 'Error loading model'
      });
      throw error;
    }
  }, [model]);

  const processImage = useCallback(async (
    imageData: ImageData,
    options: ProcessingOptions
  ): Promise<string> => {
    const currentModel = model || await initializeModel();
    
    setProcessingState({
      isProcessing: true,
      progress: 0,
      stage: 'Preparing image...'
    });

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = async () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Could not get canvas context');

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          setProcessingState({
            isProcessing: true,
            progress: 25,
            stage: 'Analyzing image...'
          });

          const segmentation = await currentModel.segmentPerson(img, {
            flipHorizontal: false,
            internalResolution: 'medium',
            segmentationThreshold: 0.7,
          });

          setProcessingState({
            isProcessing: true,
            progress: 50,
            stage: 'Removing background...'
          });

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          // Apply segmentation mask
          for (let i = 0; i < segmentation.data.length; i++) {
            const shouldKeep = segmentation.data[i];
            const pixelIndex = i * 4;
            
            if (!shouldKeep) {
              // Make background transparent
              data[pixelIndex + 3] = 0;
            } else if (options.edgeSmoothing > 0) {
              // Apply edge smoothing
              const alpha = data[pixelIndex + 3];
              const smoothing = options.edgeSmoothing / 100;
              data[pixelIndex + 3] = Math.max(0, Math.min(255, alpha * (1 - smoothing)));
            }
          }

          setProcessingState({
            isProcessing: true,
            progress: 75,
            stage: 'Applying effects...'
          });

          // Apply background replacement if specified
          if (options.backgroundType !== 'transparent') {
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            if (!tempCtx) throw new Error('Could not get temp canvas context');

            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;

            if (options.backgroundType === 'solid') {
              tempCtx.fillStyle = options.backgroundColor;
              tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            }

            tempCtx.putImageData(imageData, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(tempCanvas, 0, 0);
          } else {
            ctx.putImageData(imageData, 0, 0);
          }

          setProcessingState({
            isProcessing: true,
            progress: 100,
            stage: 'Finalizing...'
          });

          const resultDataUrl = canvas.toDataURL('image/png');
          
          setProcessingState({
            isProcessing: false,
            progress: 100,
            stage: 'Complete'
          });

          resolve(resultDataUrl);
        } catch (error) {
          setProcessingState({
            isProcessing: false,
            progress: 0,
            stage: 'Error processing image'
          });
          reject(error);
        }
      };

      img.onerror = () => {
        setProcessingState({
          isProcessing: false,
          progress: 0,
          stage: 'Error loading image'
        });
        reject(new Error('Failed to load image'));
      };

      img.src = imageData.original;
    });
  }, [model, initializeModel]);

  return {
    model,
    processingState,
    initializeModel,
    processImage,
  };
};