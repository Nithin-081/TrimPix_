import React, { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { ImageData } from '../types';

interface ImageUploadProps {
  onImageSelect: (imageData: ImageData) => void;
  currentImage?: ImageData;
  disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelect,
  currentImage,
  disabled = false
}) => {
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        const img = new Image();
        img.onload = () => {
          onImageSelect({
            original: result,
            file,
            dimensions: {
              width: img.width,
              height: img.height
            }
          });
        };
        img.src = result;
      }
    };
    reader.readAsDataURL(file);
  }, [onImageSelect]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  }, [handleFiles, disabled]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled) return;
    handleFiles(e.target.files);
  }, [handleFiles, disabled]);

  const clearImage = useCallback(() => {
    onImageSelect({ original: '' });
  }, [onImageSelect]);

  if (currentImage?.original) {
    return (
      <div className="relative group">
        <img
          src={currentImage.original}
          alt="Selected"
          className="w-full h-64 object-cover rounded-xl shadow-lg"
        />
        <button
          onClick={clearImage}
          className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          disabled={disabled}
        >
          <X size={16} />
        </button>
        <div className="absolute bottom-3 left-3 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
          {currentImage.dimensions && (
            <>
              {currentImage.dimensions.width} × {currentImage.dimensions.height}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
        dragActive
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-300 hover:border-gray-400'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={disabled}
      />
      <div className="flex flex-col items-center space-y-4">
        <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full">
          <Upload size={32} className="text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            Drop your image here
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            or click to browse • JPG, PNG, WEBP up to 10MB
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <ImageIcon size={16} />
          <span>Supports portraits, products, pets, and more</span>
        </div>
      </div>
    </div>
  );
};