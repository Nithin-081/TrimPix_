import React from 'react';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { ProcessingState } from '../types';

interface ProcessingStatusProps {
  state: ProcessingState;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ state }) => {
  if (!state.isProcessing && state.stage === 'idle') {
    return null;
  }

  const getIcon = () => {
    if (state.isProcessing) {
      return <Loader2 className="animate-spin" size={24} />;
    } else if (state.stage === 'Complete') {
      return <CheckCircle className="text-green-500" size={24} />;
    } else if (state.stage.includes('Error')) {
      return <XCircle className="text-red-500" size={24} />;
    }
    return <CheckCircle className="text-green-500" size={24} />;
  };

  const getStatusColor = () => {
    if (state.isProcessing) {
      return 'bg-blue-50 border-blue-200 text-blue-800';
    } else if (state.stage === 'Complete') {
      return 'bg-green-50 border-green-200 text-green-800';
    } else if (state.stage.includes('Error')) {
      return 'bg-red-50 border-red-200 text-red-800';
    }
    return 'bg-gray-50 border-gray-200 text-gray-800';
  };

  return (
    <div className={`border rounded-xl p-4 ${getStatusColor()}`}>
      <div className="flex items-center space-x-3">
        {getIcon()}
        <div className="flex-1">
          <p className="font-medium">{state.stage}</p>
          {state.isProcessing && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${state.progress}%` }}
                />
              </div>
              <p className="text-sm mt-1">{state.progress}% complete</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};