import { useState } from 'react';

interface UseUploadProgressReturn {
  uploadProgress: number;
  isUploading: boolean;
  startUpload: () => void;
  updateProgress: (progress: number) => void;
  finishUpload: () => void;
}

export function useUploadProgress(): UseUploadProgressReturn {
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const startUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
  };

  const updateProgress = (progress: number) => {
    setUploadProgress(progress);
  };

  const finishUpload = () => {
    setIsUploading(false);
    setUploadProgress(0);
  };

  return {
    uploadProgress,
    isUploading,
    startUpload,
    updateProgress,
    finishUpload,
  };
}
