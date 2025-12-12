"use client";

import { useState } from "react";

import { ImagePreviewModal } from "./ImagePreviewModal";
import { ProjectSkitchDelete } from "./ProjectSkitchDelete";
import { SketchAnalyzer } from "./SketchAnalyzer";

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
            Sketch Photos ({skitchPhotos.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {skitchPhotos.map((photo) => (
              // Wrap each photo + analyzer in a container div
              <div key={photo.publicId} className="space-y-3">
                {/* Existing Delete Component - UNCHANGED */}
                <ProjectSkitchDelete
                  photoUrl={photo.url}
                  publicId={photo.publicId}
                  projectId={projectId}
                  onSkitchPhotoDeleted={() =>
                    handleSkitchPhotoDeleted(photo.publicId)
                  }
                  onImageClick={handleImageClick}
                />

                {/* NEW: AI Analyzer Component - Added Below */}
                {/* <SketchAnalyzer photoUrl={photo.url} projectId={projectId} /> */}
              </div>
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
