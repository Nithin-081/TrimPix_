import React from 'react';
import { Settings, Palette, Sliders } from 'lucide-react';
import { ProcessingOptions } from '../types';

interface ProcessingOptionsProps {
  options: ProcessingOptions;
  onOptionsChange: (options: ProcessingOptions) => void;
  disabled?: boolean;
}

export const ProcessingOptionsComponent: React.FC<ProcessingOptionsProps> = ({
  options,
  onOptionsChange,
  disabled = false
}) => {
  const handleChange = (key: keyof ProcessingOptions, value: any) => {
    onOptionsChange({
      ...options,
      [key]: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Settings size={20} className="text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Processing Options
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Edge Enhancement */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Sliders size={16} className="text-gray-500" />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Edge Smoothing
            </label>
          </div>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="100"
              value={options.edgeSmoothing}
              onChange={(e) => handleChange('edgeSmoothing', parseInt(e.target.value))}
              disabled={disabled}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Sharp</span>
              <span>{options.edgeSmoothing}%</span>
              <span>Smooth</span>
            </div>
          </div>
        </div>

        {/* Feathering */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Sliders size={16} className="text-gray-500" />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Edge Feathering
            </label>
          </div>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="100"
              value={options.feathering}
              onChange={(e) => handleChange('feathering', parseInt(e.target.value))}
              disabled={disabled}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Hard</span>
              <span>{options.feathering}%</span>
              <span>Soft</span>
            </div>
          </div>
        </div>
      </div>

      {/* Background Options */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Palette size={16} className="text-gray-500" />
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Background
          </label>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleChange('backgroundType', 'transparent')}
            disabled={disabled}
            className={`p-3 rounded-lg border-2 transition-all ${
              options.backgroundType === 'transparent'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <div className="h-8 w-8 mx-auto mb-2 rounded border-2 border-dashed border-gray-300 bg-transparent"></div>
              <span className="text-sm font-medium">Transparent</span>
            </div>
          </button>

          <button
            onClick={() => handleChange('backgroundType', 'solid')}
            disabled={disabled}
            className={`p-3 rounded-lg border-2 transition-all ${
              options.backgroundType === 'solid'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <div 
                className="h-8 w-8 mx-auto mb-2 rounded border"
                style={{ backgroundColor: options.backgroundColor }}
              ></div>
              <span className="text-sm font-medium">Solid Color</span>
            </div>
          </button>

          <button
            onClick={() => handleChange('backgroundType', 'image')}
            disabled={disabled}
            className={`p-3 rounded-lg border-2 transition-all ${
              options.backgroundType === 'image'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <div className="h-8 w-8 mx-auto mb-2 rounded border bg-gradient-to-br from-purple-400 to-pink-400"></div>
              <span className="text-sm font-medium">Custom Image</span>
            </div>
          </button>
        </div>

        {/* Color Picker */}
        {options.backgroundType === 'solid' && (
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Background Color
            </label>
            <div className="flex space-x-2">
              <input
                type="color"
                value={options.backgroundColor}
                onChange={(e) => handleChange('backgroundColor', e.target.value)}
                disabled={disabled}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={options.backgroundColor}
                onChange={(e) => handleChange('backgroundColor', e.target.value)}
                disabled={disabled}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="#ffffff"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};