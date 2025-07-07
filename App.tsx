import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUpload } from './components/ImageUpload';
import { ImagePreview } from './components/ImagePreview';
import { ProcessingStatus } from './components/ProcessingStatus';
import { ProcessingOptionsComponent } from './components/ProcessingOptions';
import { ProcessorSelector } from './components/ProcessorSelector';
import { ApiStatus } from './components/ApiStatus';
import { useImageProcessor } from './hooks/useImageProcessor';
import { useBackendProcessor } from './hooks/useBackendProcessor';
import { ImageData, ProcessingOptions } from './types';

function App() {
  const [imageData, setImageData] = useState<ImageData>({ original: '' });
  const [processedImage, setProcessedImage] = useState<string>('');
  const [selectedProcessor, setSelectedProcessor] = useState<'client' | 'backend'>('client');
  const [options, setOptions] = useState<ProcessingOptions>({
    edgeSmoothing: 10,
    feathering: 5,
    backgroundType: 'transparent',
    backgroundColor: '#ffffff'
  });

  // Client-side processor
  const { processingState: clientProcessingState, processImage: processImageClient } = useImageProcessor();
  
  // Backend processor
  const { 
    processingState: backendProcessingState, 
    apiStatus, 
    isBackendAvailable,
    checkBackendStatus,
    processImageWithBackend 
  } = useBackendProcessor();

  // Check backend status on component mount
  useEffect(() => {
    checkBackendStatus().catch(() => {
      // Backend not available, will use client-side processing
      console.log('Backend not available, using client-side processing');
    });
  }, [checkBackendStatus]);

  const currentProcessingState = selectedProcessor === 'client' 
    ? clientProcessingState 
    : backendProcessingState;

  const handleImageSelect = useCallback((newImageData: ImageData) => {
    setImageData(newImageData);
    setProcessedImage('');
  }, []);

  const handleProcess = useCallback(async () => {
    if (!imageData.original) return;

    try {
      let result: string;

      if (selectedProcessor === 'backend' && isBackendAvailable) {
        // Use backend processing
        const backendOptions = {
          provider: 'removebg' as const,
          backgroundColor: options.backgroundType === 'solid' ? options.backgroundColor : undefined,
          edgeSmoothing: options.edgeSmoothing,
          feathering: options.feathering,
        };
        result = await processImageWithBackend(imageData, backendOptions);
      } else {
        // Use client-side processing
        result = await processImageClient(imageData, options);
      }

      setProcessedImage(result);
    } catch (error) {
      console.error('Processing failed:', error);
    }
  }, [imageData, options, selectedProcessor, isBackendAvailable, processImageClient, processImageWithBackend]);

  const handleReset = useCallback(() => {
    setImageData({ original: '' });
    setProcessedImage('');
  }, []);

  const handleDownload = useCallback(() => {
    console.log('Image downloaded');
  }, []);

  const isProcessing = currentProcessingState.isProcessing;
  const hasImage = !!imageData.original;
  const hasProcessedImage = !!processedImage;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Remove Backgrounds with AI
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Upload any image and let our AI automatically remove the background with 
              professional-grade accuracy. Choose between client-side or server-side processing.
            </p>
          </div>

          {/* API Status */}
          <ApiStatus 
            status={apiStatus}
            isBackendAvailable={isBackendAvailable}
            onRefresh={checkBackendStatus}
          />

          {/* Main Content */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column - Upload & Options */}
            <div className="xl:col-span-1 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Upload Image
                </h3>
                <ImageUpload
                  onImageSelect={handleImageSelect}
                  currentImage={imageData}
                  disabled={isProcessing}
                />
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <ProcessorSelector
                  selectedProcessor={selectedProcessor}
                  onProcessorChange={setSelectedProcessor}
                  isBackendAvailable={isBackendAvailable}
                  disabled={isProcessing}
                />
              </div>

              {hasImage && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                  <ProcessingOptionsComponent
                    options={options}
                    onOptionsChange={setOptions}
                    disabled={isProcessing}
                  />
                </div>
              )}

              {hasImage && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                  <button
                    onClick={handleProcess}
                    disabled={isProcessing || (selectedProcessor === 'backend' && !isBackendAvailable)}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-white text-lg transition-all ${
                      isProcessing || (selectedProcessor === 'backend' && !isBackendAvailable)
                        ? 'bg-gray-400 cursor-not-allowed'
                        : selectedProcessor === 'backend'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transform hover:scale-105'
                        : 'bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 transform hover:scale-105'
                    } shadow-lg`}
                  >
                    {isProcessing 
                      ? 'Processing...' 
                      : selectedProcessor === 'backend' && !isBackendAvailable
                      ? 'Backend Unavailable'
                      : `Trim Background ${selectedProcessor === 'backend' ? '(Enhanced)' : '(Client)'}`
                    }
                  </button>
                </div>
              )}
            </div>

            {/* Right Column - Preview & Status */}
            <div className="xl:col-span-2 space-y-6">
              {(currentProcessingState.isProcessing || currentProcessingState.stage !== 'idle') && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                  <ProcessingStatus state={currentProcessingState} />
                </div>
              )}

              {hasImage && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                  <ImagePreview
                    original={imageData}
                    processed={processedImage}
                    onDownload={handleDownload}
                    onReset={handleReset}
                  />
                </div>
              )}

              {!hasImage && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-lg">
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-full p-8 w-24 h-24 mx-auto mb-6">
                      <div className="w-full h-full bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 100 100" className="text-white">
                          <defs>
                            <pattern id="checkerboard-small" patternUnits="userSpaceOnUse" width="8" height="8">
                              <rect width="4" height="4" fill="rgba(255,255,255,0.3)" />
                              <rect x="4" y="4" width="4" height="4" fill="rgba(255,255,255,0.3)" />
                            </pattern>
                          </defs>
                          <rect x="50" y="20" width="30" height="60" fill="url(#checkerboard-small)" rx="4" />
                          <path d="M20 30 L35 45 L20 60 L35 75 L50 60 L35 45 L50 30 Z" fill="currentColor" />
                          <circle cx="25" cy="25" r="3" fill="currentColor" />
                          <circle cx="45" cy="35" r="2" fill="currentColor" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Ready to Process
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Upload an image to get started with AI-powered background removal
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Features Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-green-100 dark:bg-green-900 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                  <div className="w-full h-full bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">AI</span>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Dual AI Processing
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Choose between client-side TensorFlow.js or server-side professional APIs
                </p>
              </div>
              <div className="text-center">
                <div className="bg-emerald-100 dark:bg-emerald-900 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                  <div className="w-full h-full bg-emerald-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">🚀</span>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Fast Processing
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Instant client-side processing or high-quality server processing
                </p>
              </div>
              <div className="text-center">
                <div className="bg-teal-100 dark:bg-teal-900 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                  <div className="w-full h-full bg-teal-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">⚙️</span>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Customizable
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Fine-tune edge smoothing and background replacement options
                </p>
              </div>
              <div className="text-center">
                <div className="bg-cyan-100 dark:bg-cyan-900 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                  <div className="w-full h-full bg-cyan-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">🔒</span>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Privacy First
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Client-side processing keeps your images private and secure
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;