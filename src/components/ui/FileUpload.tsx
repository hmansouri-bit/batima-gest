'use client';

import React, { useCallback, useState } from 'react';
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  error?: string;
}

export function FileUpload({ onFileSelect, error }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const processFile = (file: File) => {
    setLocalError(null);
    
    // Check type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setLocalError('Format non supporté. Veuillez utiliser JPG, PNG ou WebP.');
      return;
    }
    
    // Check size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setLocalError('Fichier trop volumineux. La taille maximum est de 5 MB.');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    onFileSelect(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    onFileSelect(null);
    setLocalError(null);
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors ${
            dragActive ? 'border-primary-500 bg-primary-50' : 'border-slate-300 hover:bg-slate-50'
          } ${error || localError ? 'border-red-500 bg-red-50' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/jpeg, image/png, image/webp"
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <UploadCloud className="h-10 w-10 text-slate-400 mb-3" />
          <p className="text-sm font-medium text-slate-700">Cliquez ou glissez une photo ici</p>
          <p className="text-xs text-slate-500 mt-1">JPG, PNG ou WebP (Max 5MB)</p>
        </div>
      ) : (
        <div className="relative border rounded-lg p-2 flex items-center bg-white shadow-sm">
          <div className="h-16 w-16 bg-slate-100 rounded flex-shrink-0 overflow-hidden relative border">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <ImageIcon className="h-6 w-6 text-slate-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            )}
          </div>
          <div className="ml-4 flex-1 truncate">
            <p className="text-sm font-medium text-slate-900 truncate">{selectedFile.name}</p>
            <p className="text-xs text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <button
            type="button"
            onClick={removeFile}
            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
      
      {(error || localError) && (
        <p className="mt-2 text-sm text-red-500">{localError || error}</p>
      )}
    </div>
  );
}
