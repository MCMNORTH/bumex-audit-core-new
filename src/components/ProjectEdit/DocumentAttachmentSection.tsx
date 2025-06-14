
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Download, FileText, Trash2 } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';

interface DocumentFile {
  name: string;
  url: string;
  type: string;
}

interface DocumentAttachmentSectionProps {
  title: string;
  files: DocumentFile[];
  onFilesChange: (files: DocumentFile[]) => void;
  projectId: string;
  storagePrefix: string;
  showTitle?: boolean;
}

const DocumentAttachmentSection = ({
  title,
  files,
  onFilesChange,
  projectId,
  storagePrefix,
  showTitle = true
}: DocumentAttachmentSectionProps) => {
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please select PDF, DOC, or DOCX files only',
          variant: 'destructive',
        });
        continue;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select files smaller than 10MB',
          variant: 'destructive',
        });
        continue;
      }

      setUploadingFiles(prev => new Set(prev).add(file.name));
      
      try {
        // Create a reference to the file in Firebase Storage
        const fileName = `${storagePrefix}/${projectId}/${Date.now()}-${file.name}`;
        const storageRef = ref(storage, fileName);
        
        // Upload the file
        await uploadBytes(storageRef, file);
        
        // Get the download URL
        const downloadURL = await getDownloadURL(storageRef);
        
        const newFile: DocumentFile = {
          name: file.name,
          url: downloadURL,
          type: file.type
        };
        
        onFilesChange([...files, newFile]);
        
        toast({
          title: 'File uploaded',
          description: `${file.name} has been uploaded successfully`,
        });
      } catch (error) {
        console.error('Error uploading file:', error);
        toast({
          title: 'Upload failed',
          description: `Failed to upload ${file.name}. Please try again.`,
          variant: 'destructive',
        });
      } finally {
        setUploadingFiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(file.name);
          return newSet;
        });
      }
    }

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = async (fileToRemove: DocumentFile) => {
    try {
      // Delete the file from Firebase Storage
      if (fileToRemove.url.startsWith('https://')) {
        const storageRef = ref(storage, fileToRemove.url);
        await deleteObject(storageRef);
      }
    } catch (error) {
      console.error('Error deleting file from storage:', error);
      // Continue with removing the reference even if storage deletion fails
    }

    const updatedFiles = files.filter(file => file.url !== fileToRemove.url);
    onFilesChange(updatedFiles);
    
    toast({
      title: 'File removed',
      description: `${fileToRemove.name} has been removed`,
    });
  };

  const handleDownloadFile = (file: DocumentFile) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-3">
      {showTitle && (
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">{title}</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="h-8"
          >
            <Upload className="h-3 w-3 mr-1" />
            Upload
          </Button>
        </div>
      )}

      {!showTitle && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">{title}</span>
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-8"
            >
              <Upload className="h-3 w-3 mr-1" />
              Upload
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-gray-50 rounded border"
            >
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{file.name}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownloadFile(file)}
                  className="h-6 w-6 p-0"
                >
                  <Download className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFile(file)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {Array.from(uploadingFiles).map((fileName) => (
        <div
          key={fileName}
          className="flex items-center space-x-2 p-2 bg-blue-50 rounded border"
        >
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-blue-700">Uploading {fileName}...</span>
        </div>
      ))}
    </div>
  );
};

export default DocumentAttachmentSection;
