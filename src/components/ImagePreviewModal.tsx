// components/ImagePreviewModal.tsx (Minimal Version)
"use client";

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
}

export function ImagePreviewModal({
  isOpen,
  onClose,
  imageUrl,
}: ImagePreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4 cursor-pointer"
      onClick={onClose}
    >
      <div className="relative max-w-6xl max-h-[90vh] w-full">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 text-3xl font-bold z-10"
        >
          ×
        </button>
        <img
          src={imageUrl}
          alt="Preview"
          className="w-full h-full object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on image
        />
      </div>
    </div>
  );
}
