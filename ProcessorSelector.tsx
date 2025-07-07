import React from 'react';
import { Cpu, Server, Zap, Globe } from 'lucide-react';

interface ProcessorSelectorProps {
  selectedProcessor: 'client' | 'backend';
  onProcessorChange: (processor: 'client' | 'backend') => void;
  isBackendAvailable: boolean;
  disabled?: boolean;
}

export const ProcessorSelector: React.FC<ProcessorSelectorProps> = ({
  selectedProcessor,
  onProcessorChange,
  isBackendAvailable,
  disabled = false
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Processing Method
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Client-side Processing */}
        <button
          onClick={() => onProcessorChange('client')}
          disabled={disabled}
          className={`p-4 rounded-xl border-2 transition-all text-left ${
            selectedProcessor === 'client'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${
              selectedProcessor === 'client'
                ? 'bg-blue-100 dark:bg-blue-800'
                : 'bg-gray-100 dark:bg-gray-800'
            }`}>
              <Cpu size={20} className={
                selectedProcessor === 'client'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400'
              } />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Client-side AI
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Process locally in your browser using TensorFlow.js
              </p>
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Globe size={12} />
                  <span>No upload</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Zap size={12} />
                  <span>Fast</span>
                </div>
              </div>
            </div>
          </div>
        </button>

        {/* Backend Processing */}
        <button
          onClick={() => onProcessorChange('backend')}
          disabled={disabled || !isBackendAvailable}
          className={`p-4 rounded-xl border-2 transition-all text-left ${
            selectedProcessor === 'backend'
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
              : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
          } ${
            disabled || !isBackendAvailable 
              ? 'opacity-50 cursor-not-allowed' 
              : 'cursor-pointer'
          }`}
        >
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${
              selectedProcessor === 'backend'
                ? 'bg-purple-100 dark:bg-purple-800'
                : 'bg-gray-100 dark:bg-gray-800'
            }`}>
              <Server size={20} className={
                selectedProcessor === 'backend'
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-gray-600 dark:text-gray-400'
              } />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Enhanced AI Server
                {!isBackendAvailable && (
                  <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                    Offline
                  </span>
                )}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Professional-grade processing with Remove.bg, Clipdrop, or PhotoRoom
              </p>
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Zap size={12} />
                  <span>High quality</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Server size={12} />
                  <span>API powered</span>
                </div>
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};