import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Server, Key } from 'lucide-react';
import { ApiStatus as ApiStatusType } from '../services/api';

interface ApiStatusProps {
  status: ApiStatusType | null;
  isBackendAvailable: boolean;
  onRefresh: () => void;
}

export const ApiStatus: React.FC<ApiStatusProps> = ({
  status,
  isBackendAvailable,
  onRefresh
}) => {
  if (!isBackendAvailable) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-center space-x-3">
          <XCircle className="text-red-500" size={24} />
          <div className="flex-1">
            <h3 className="font-semibold text-red-800">Backend Server Unavailable</h3>
            <p className="text-sm text-red-600 mt-1">
              The backend server is not running. Please start the server to use enhanced AI processing.
            </p>
          </div>
          <button
            onClick={onRefresh}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <div className="flex items-center space-x-3">
          <Server className="text-gray-500" size={24} />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">Checking API Status...</h3>
          </div>
        </div>
      </div>
    );
  }

  const hasConfiguredApi = Object.values(status.apis).some(api => api.configured);

  return (
    <div className={`border rounded-xl p-4 ${
      hasConfiguredApi 
        ? 'bg-green-50 border-green-200' 
        : 'bg-yellow-50 border-yellow-200'
    }`}>
      <div className="flex items-start space-x-3">
        {hasConfiguredApi ? (
          <CheckCircle className="text-green-500 mt-1" size={24} />
        ) : (
          <AlertCircle className="text-yellow-500 mt-1" size={24} />
        )}
        <div className="flex-1">
          <h3 className={`font-semibold ${
            hasConfiguredApi ? 'text-green-800' : 'text-yellow-800'
          }`}>
            {hasConfiguredApi ? 'Backend Ready' : 'API Configuration Needed'}
          </h3>
          <p className={`text-sm mt-1 ${
            hasConfiguredApi ? 'text-green-600' : 'text-yellow-600'
          }`}>
            {status.recommendation}
          </p>
          
          <div className="mt-3 space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Available APIs:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {Object.entries(status.apis).map(([name, api]) => (
                <div
                  key={name}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm ${
                    api.configured
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {api.configured ? (
                    <CheckCircle size={16} className="text-green-500" />
                  ) : (
                    <Key size={16} className="text-gray-400" />
                  )}
                  <span className="capitalize">{name.replace(/([A-Z])/g, ' $1').trim()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={onRefresh}
          className={`px-4 py-2 rounded-lg transition-colors ${
            hasConfiguredApi
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-yellow-600 text-white hover:bg-yellow-700'
          }`}
        >
          Refresh
        </button>
      </div>
    </div>
  );
};