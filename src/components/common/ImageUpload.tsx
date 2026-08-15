import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, AlertCircle } from 'lucide-react';

interface ImageUploadProps {
  currentImageUrl?: string | null;
  onImageSelected: (fileOrBlob: File | Blob | string) => void;
  onRemove?: () => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImageUrl,
  onImageSelected,
  onRemove
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setError(null);
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

    if (!validTypes.includes(file.type)) {
      setError('Supported formats: PNG, JPG, JPEG, WEBP');
      return;
    }

    // Max 25MB check
    if (file.size > 25 * 1024 * 1024) {
      setError('File size too large (max 25MB)');
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    onImageSelected(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onRemove) onRemove();
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
        Artwork Image <span className="text-amber-500">*</span>
      </label>

      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center min-h-[220px] max-h-[360px] ${
          isDragging
            ? 'border-amber-500 bg-amber-500/10 scale-[1.01]'
            : previewUrl
            ? 'border-[#2c2f38] bg-[#14151a]'
            : 'border-[#2c2f38] bg-[#14151a] hover:border-amber-500/50 hover:bg-[#181a20]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        {previewUrl ? (
          <div className="relative w-full h-full min-h-[220px] flex items-center justify-center bg-[#0a0b0d] group">
            <img
              src={previewUrl}
              alt="Artwork Preview"
              className="max-h-[340px] w-full object-contain p-2"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <span className="text-xs font-semibold text-zinc-200 bg-[#181a1f] px-3 py-1.5 rounded-lg border border-zinc-700">
                Click or Drop to replace image
              </span>
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-xl bg-[#1c1e24] border border-[#2c2f38] flex items-center justify-center text-amber-500 mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-zinc-200 mb-1">
              Click to upload or drag & drop
            </p>
            <p className="text-xs text-zinc-500 mb-3">
              PNG, JPG, JPEG, WEBP (Max 25MB)
            </p>
            <span className="px-3 py-1 rounded-lg bg-[#20222a] text-zinc-300 text-xs font-medium border border-[#2c2f38]">
              Browse file
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
