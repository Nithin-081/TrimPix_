const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api';

export interface BackgroundRemovalOptions {
  provider?: 'removebg' | 'clipdrop' | 'photoroom';
  size?: 'auto' | 'preview' | 'full' | 'medium' | 'hd' | '4k';
  type?: 'auto' | 'person' | 'product' | 'car';
  format?: 'png' | 'jpg';
  backgroundColor?: string;
  edgeSmoothing?: number;
  feathering?: number;
}

export interface ApiResponse {
  success: boolean;
  image?: string;
  provider?: string;
  processedAt?: string;
  error?: string;
  message?: string;
}

export interface ApiStatus {
  apis: {
    removeBg: { configured: boolean; status: string };
    clipdrop: { configured: boolean; status: string };
    photoroom: { configured: boolean; status: string };
  };
  recommendation: string;
}

class BackgroundRemovalAPI {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async checkHealth(): Promise<{ status: string; message: string; timestamp: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw new Error('Backend server is not available');
    }
  }

  async getStatus(): Promise<ApiStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/status`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Status check failed:', error);
      throw new Error('Could not retrieve API status');
    }
  }

  async removeBackgroundFromFile(
    file: File,
    options: BackgroundRemovalOptions = {}
  ): Promise<Blob> {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      // Add options to form data
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      const response = await fetch(`${this.baseUrl}/remove-background`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Background removal failed:', error);
      throw error;
    }
  }

  async removeBackgroundFromBase64(
    base64Image: string,
    options: BackgroundRemovalOptions = {}
  ): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/remove-background-base64`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
          ...options,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error('Background removal failed:', error);
      throw error;
    }
  }

  async removeBackground(
    imageData: string | File,
    options: BackgroundRemovalOptions = {}
  ): Promise<string> {
    if (typeof imageData === 'string') {
      // Base64 string
      const response = await this.removeBackgroundFromBase64(imageData, options);
      return response.image || '';
    } else {
      // File object
      const blob = await this.removeBackgroundFromFile(imageData, options);
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
  }
}

export const backgroundRemovalAPI = new BackgroundRemovalAPI();