"use client";

import { useState } from "react";

import { ImagePreviewModal } from "./ImagePreviewModal";
import { ProjectSkitchDelete } from "./ProjectSkitchDelete";

interface ProjectSkitchDisplayProps {
  projectId: string;
  initialSkitchPhotos: Array<{
    url: string;
    publicId: string;
    uploadedBy: string;
    createdAt: string;
  }>;
}

export function ProjectSkitchDisplay({
  projectId,
  initialSkitchPhotos,
}: ProjectSkitchDisplayProps) {
  const [skitchPhotos, setSkitchPhotos] = useState(initialSkitchPhotos);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Handle when a skitch photo is deleted
  const handleSkitchPhotoDeleted = (deletedPublicId: string) => {
    setSkitchPhotos(
      skitchPhotos.filter((photo) => photo.publicId !== deletedPublicId)
    );
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
      {skitchPhotos.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Skitch Photos ({skitchPhotos.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {skitchPhotos.map((photo) => (
              <ProjectSkitchDelete
                key={photo.publicId}
                photoUrl={photo.url}
                publicId={photo.publicId}
                projectId={projectId}
                onSkitchPhotoDeleted={() =>
                  handleSkitchPhotoDeleted(photo.publicId)
                }
                onImageClick={handleImageClick}
              />
            ))}
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
