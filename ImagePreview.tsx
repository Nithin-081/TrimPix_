import React from 'react';
import { Download, RotateCcw } from 'lucide-react';
import { ImageData } from '../types';

interface ImagePreviewProps {
  original: ImageData;
  processed?: string;
  onDownload?: () => void;
  onReset?: () => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  original,
  processed,
  onDownload,
  onReset
}) => {
  const downloadImage = () => {
    if (!processed) return;
    
    const link = document.createElement('a');
    link.download = `background-removed-${Date.now()}.png`;
    link.href = processed;
    link.click();
    
    onDownload?.();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Original Image */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Original
          </h3>
          <div className="relative">
            <img
              src={original.original}
              alt="Original"
              className="w-full h-64 object-cover rounded-xl shadow-lg"
            />
            <div className="absolute top-3 left-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
              Original
            </div>
          </div>
        </div>

        {/* Processed Image */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Background Removed
          </h3>
          <div className="relative">
            {processed ? (
              <>
                <div className="relative">
                  <img
                    src={processed}
                    alt="Processed"
                    className="w-full h-64 object-cover rounded-xl shadow-lg"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='a' patternUnits='userSpaceOnUse' width='20' height='20' patternTransform='scale(0.5) rotate(0)'%3e%3crect x='0' y='0' width='100%25' height='100%25' fill='hsla(0,0%25,100%25,1)'/%3e%3crect x='0' y='0' width='10' height='10' fill='hsla(0,0%25,93%25,1)'/%3e%3crect x='10' y='10' width='10' height='10' fill='hsla(0,0%25,93%25,1)'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='url(%23a)'/%3e%3c/svg%3e")`,
                      backgroundSize: '20px 20px'
                    }}
                  />
                  <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded text-xs">
                    Processed
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="bg-gray-200 dark:bg-gray-700 p-4 rounded-full mb-4">
                    <RotateCcw size={24} className="text-gray-500 dark:text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Processed image will appear here
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {processed && (
        <div className="flex justify-center space-x-4">
          <button
            onClick={downloadImage}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors shadow-lg"
          >
            <Download size={20} />
            <span>Download PNG</span>
          </button>
          
          {onReset && (
            <button
              onClick={onReset}
              className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl transition-colors shadow-lg"
            >
              <RotateCcw size={20} />
              <span>Process Again</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};