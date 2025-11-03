// components/AreaPhotosDisplay.tsx
"use client";

import { useState } from "react";
import { AreaPhotoDelete } from "./AreaPhotoDelete";
import { ImagePreviewModal } from "./ImagePreviewModal"; // Import the modal

interface AreaPhotosDisplayProps {
  areaId: string;
  initialPhotos: string[];
}

export function AreaPhotosDisplay({
  areaId,
  initialPhotos,
}: AreaPhotosDisplayProps) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [previewImage, setPreviewImage] = useState<string | null>(null); // State for preview

  // Function to extract publicId from URL
  const extractPublicIdFromUrl = (url: string): string => {
    const parts = url.split("/");
    const fileName = parts[parts.length - 1];
    return fileName.split(".")[0]; // Remove file extension
  };

  // Handle when a photo is deleted
  const handlePhotoDeleted = (deletedPublicId: string) => {
    setPhotos(photos.filter((photo) => !photo.includes(deletedPublicId)));
  };

  // Handle image click for preview
  const handleImageClick = (imageUrl: string) => {
    setPreviewImage(imageUrl);
  };

  // Close preview modal
  const closePreview = () => {
    setPreviewImage(null);
  };

  return (
    <div>
      {photos.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Area Photos ({photos.length})
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {photos.map((photoUrl, index) => {
              const publicId = extractPublicIdFromUrl(photoUrl);
              return (
                <AreaPhotoDelete
                  key={publicId}
                  photoUrl={photoUrl}
                  publicId={publicId}
                  areaId={areaId}
                  onPhotoDeleted={() => handlePhotoDeleted(publicId)}
                  onImageClick={handleImageClick} // Pass the click handler
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={!!previewImage}
        onClose={closePreview}
        imageUrl={previewImage || ""}
      />
    </div>
  );
}
