import React from 'react';
import { Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-2 rounded-xl shadow-lg">
              <svg width="32" height="32" viewBox="0 0 100 100" className="text-white">
                <defs>
                  <pattern id="checkerboard" patternUnits="userSpaceOnUse" width="8" height="8">
                    <rect width="4" height="4" fill="rgba(255,255,255,0.3)" />
                    <rect x="4" y="4" width="4" height="4" fill="rgba(255,255,255,0.3)" />
                  </pattern>
                </defs>
                <rect x="50" y="20" width="30" height="60" fill="url(#checkerboard)" rx="4" />
                <path d="M20 30 L35 45 L20 60 L35 75 L50 60 L35 45 L50 30 Z" fill="currentColor" />
                <circle cx="25" cy="25" r="3" fill="currentColor" />
                <circle cx="45" cy="35" r="2" fill="currentColor" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                TrimPix
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                AI-powered background removal
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Sparkles size={16} />
            <span>Powered by TensorFlow.js</span>
          </div>
        </div>
      </div>
    </header>
  );
};