'use client';

import { AlertCircle, FileText, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';

const FileUpload = ({
  accept = 'image/*',
  maxSizeMB = 10,
  multiple = false,
  onFilesChange,
  value = [],
  label,
  hint,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const validateFiles = (files) => {
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      if (file.size > maxSizeBytes) {
        setError(`File "${file.name}" exceeds ${maxSizeMB}MB limit`);
        return [];
      }
    }
    
    setError('');
    return fileArray;
  };

  const handleFiles = (files) => {
    const validFiles = validateFiles(files);
    if (validFiles.length > 0) {
      if (multiple) {
        onFilesChange([...value, ...validFiles]);
      } else {
        onFilesChange(validFiles.slice(0, 1));
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleFileInput = (e) => {
    handleFiles(e.target.files);
  };

  const removeFile = (index) => {
    onFilesChange(value.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const isImage = (file) => file.type.startsWith('image/');

  return (
    <div className="w-full">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200
          ${isDragging
            ? 'border-primary bg-primary-subtle'
            : 'border-border bg-surface'
          }
        `}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className={`
              w-16 h-16 rounded-full flex items-center justify-center transition-colors
              ${isDragging ? 'bg-primary text-white' : 'bg-primary-light text-primary'}
            `}
          >
            <Upload className="w-8 h-8" strokeWidth={1.5} />
          </div>
          
          <div>
            <p className="font-medium text-text-primary">{label || 'Upload Files'}</p>
            {hint && <p className="text-xs text-text-tertiary mt-1">{hint}</p>}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileInput}
            className="hidden"
          />

          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 text-sm font-medium border border-primary text-primary rounded-lg hover:bg-primary-subtle transition-colors"
            >
              Upload File
            </button>
            {accept.includes('image') && (
              <button
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.capture = 'environment';
                  input.onchange = (e) => handleFiles(e.target.files);
                  input.click();
                }}
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                Take Photo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-3 flex items-center gap-2 p-3 bg-error-light border border-error rounded-lg">
          <AlertCircle className="w-4 h-4 text-error flex-shrink-0" strokeWidth={2} />
          <span className="text-sm text-error">{error}</span>
        </div>
      )}

      {/* Preview Grid */}
      {value.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-medium text-text-primary mb-3">
            {value.length} file{value.length !== 1 ? 's' : ''} uploaded
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {value.map((file, index) => (
              <div
                key={`file-${index}`}
                className="relative group rounded-lg overflow-hidden bg-surface border border-border"
              >
                {/* Preview or Icon */}
                {isImage(file) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <div className="w-full h-32 bg-primary-light flex items-center justify-center">
                    <FileText className="w-8 h-8 text-primary" strokeWidth={1.5} />
                  </div>
                )}

                {/* File Info */}
                <div className="p-2">
                  <p className="text-xs font-medium text-text-primary truncate">
                    {file.name.length > 15
                      ? file.name.substring(0, 12) + '...'
                      : file.name}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {formatFileSize(file.size)}
                  </p>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2 p-1 rounded-full bg-error text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
