
import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';

export const useFileUpload = (projectId: string, onFileUrlChange: (url: string) => void) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  const initializeExistingFile = (fileUrl: string) => {
    if (fileUrl) {
      setUploadStatus('success');
      try {
        const decodedUrl = decodeURIComponent(fileUrl);
        const urlParts = decodedUrl.split('/');
        const fileNameWithPath = urlParts[urlParts.length - 1].split('?')[0];
        const fileName = fileNameWithPath.split('/').pop() || fileNameWithPath;
        const displayName = fileName.includes('-') && /^\d+/.test(fileName)
          ? fileName.substring(fileName.indexOf('-') + 1)
          : fileName;
        setUploadedFile({ name: displayName } as File);
      } catch (error) {
        console.error('Error extracting filename:', error);
        setUploadedFile({ name: 'engagement-structure.pdf' } as File);
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: 'Invalid file type',
        description: 'Please select a PDF file',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select a file smaller than 10MB',
        variant: 'destructive',
      });
      return;
    }

    setUploadStatus('uploading');
    
    try {
      const fileName = `engagement-structures/${projectId}/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, fileName);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      setUploadedFile(file);
      setUploadStatus('success');
      onFileUrlChange(downloadURL);
      
      toast({
        title: 'File uploaded',
        description: `${file.name} has been uploaded successfully`,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus('error');
      toast({
        title: 'Upload failed',
        description: 'Failed to upload the file. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveFile = async (currentFileUrl: string) => {
    if (currentFileUrl && currentFileUrl.startsWith('https://')) {
      try {
        const storageRef = ref(storage, currentFileUrl);
        await deleteObject(storageRef);
      } catch (error) {
        console.error('Error deleting file from storage:', error);
      }
    }

    setUploadedFile(null);
    setUploadStatus('idle');
    onFileUrlChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadFile = (fileUrl: string) => {
    if (fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = uploadedFile?.name || 'engagement-structure.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return {
    uploadedFile,
    uploadStatus,
    fileInputRef,
    handleFileUpload,
    handleRemoveFile,
    handleDownloadFile,
    initializeExistingFile
  };
};
