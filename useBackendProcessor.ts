import { useState, useCallback } from 'react';
import { backgroundRemovalAPI, BackgroundRemovalOptions, ApiStatus } from '../services/api';
import { ProcessingState, ImageData } from '../types';

export const useBackendProcessor = () => {
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    stage: 'idle'
  });
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);
  const [isBackendAvailable, setIsBackendAvailable] = useState<boolean>(false);

  const checkBackendStatus = useCallback(async () => {
    try {
      setProcessingState({
        isProcessing: true,
        progress: 0,
        stage: 'Checking backend status...'
      });

      await backgroundRemovalAPI.checkHealth();
      const status = await backgroundRemovalAPI.getStatus();
      
      setApiStatus(status);
      setIsBackendAvailable(true);
      
      setProcessingState({
        isProcessing: false,
        progress: 100,
        stage: 'Backend ready'
      });

      return status;
    } catch (error) {
      console.error('Backend check failed:', error);
      setIsBackendAvailable(false);
      setProcessingState({
        isProcessing: false,
        progress: 0,
        stage: 'Backend unavailable'
      });
      throw error;
    }
  }, []);

  const processImageWithBackend = useCallback(async (
    imageData: ImageData,
    options: BackgroundRemovalOptions = {}
  ): Promise<string> => {
    if (!isBackendAvailable) {
      throw new Error('Backend server is not available');
    }

    setProcessingState({
      isProcessing: true,
      progress: 0,
      stage: 'Preparing image...'
    });

    try {
      setProcessingState({
        isProcessing: true,
        progress: 25,
        stage: 'Uploading to server...'
      });

      let result: string;

      if (imageData.file) {
        // Use file upload method
        result = await backgroundRemovalAPI.removeBackground(imageData.file, options);
      } else {
        // Use base64 method
        result = await backgroundRemovalAPI.removeBackground(imageData.original, options);
      }

      setProcessingState({
        isProcessing: true,
        progress: 75,
        stage: 'Processing with AI...'
      });

      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));

      setProcessingState({
        isProcessing: true,
        progress: 100,
        stage: 'Finalizing...'
      });

      await new Promise(resolve => setTimeout(resolve, 500));

      setProcessingState({
        isProcessing: false,
        progress: 100,
        stage: 'Complete'
      });

      return result;
    } catch (error) {
      console.error('Backend processing failed:', error);
      setProcessingState({
        isProcessing: false,
        progress: 0,
        stage: `Error: ${error instanceof Error ? error.message : 'Processing failed'}`
      });
      throw error;
    }
  }, [isBackendAvailable]);

  return {
    processingState,
    apiStatus,
    isBackendAvailable,
    checkBackendStatus,
    processImageWithBackend,
  };
};