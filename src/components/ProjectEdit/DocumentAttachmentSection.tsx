
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, FileText, Download, Paperclip } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
}

const DocumentAttachmentSection = ({
  title,
  files,
  onFilesChange,
  projectId,
  storagePrefix
}: DocumentAttachmentSectionProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    // Validate file types
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const validFiles = Array.from(selectedFiles).filter(file => {
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: `${file.name} is not a PDF or Word document`,
          variant: 'destructive'
        });
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: `${file.name} is larger than 10MB`,
          variant: 'destructive'
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    try {
      const newFiles: DocumentFile[] = [];
      for (const file of validFiles) {
        // Create a reference to the file in Firebase Storage
        const fileName = `${storagePrefix}/${projectId}/${Date.now()}-${file.name}`;
        const storageRef = ref(storage, fileName);

        // Upload the file
        await uploadBytes(storageRef, file);

        // Get the download URL
        const downloadURL = await getDownloadURL(storageRef);

        newFiles.push({
          name: file.name,
          url: downloadURL,
          type: file.type
        });
      }

      const updatedFiles = [...files, ...newFiles];
      onFilesChange(updatedFiles);

      toast({
        title: 'Files uploaded',
        description: `${validFiles.length} file(s) uploaded successfully`
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload files. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const handleRemoveFile = async (index: number) => {
    const fileToRemove = files[index];

    // Try to delete the file from Firebase Storage if it's a Firebase URL
    if (fileToRemove.url.startsWith('https://firebasestorage.googleapis.com') || fileToRemove.url.startsWith('https://storage.googleapis.com')) {
      try {
        const storageRef = ref(storage, fileToRemove.url);
        await deleteObject(storageRef);
      } catch (error) {
        console.error('Error deleting file from storage:', error);
        // Continue with removing the reference even if storage deletion fails
      }
    }

    const updatedFiles = files.filter((_, i) => i !== index);
    onFilesChange(updatedFiles);
  };

  const handleDownloadFile = (file: DocumentFile) => {
    // Check if it's a valid URL (either Firebase Storage or a real URL)
    if (file.url.startsWith('https://firebasestorage.googleapis.com') || file.url.startsWith('https://storage.googleapis.com')) {
      // For Firebase Storage URLs, open in new tab
      window.open(file.url, '_blank');
    } else if (file.url.startsWith('https://') && !file.url.includes('example.com')) {
      // For other valid URLs, create download link
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // For mock URLs, show a toast message
      toast({
        title: 'Download not available',
        description: 'This is a demo file. In a real implementation, the file would be downloaded from Firebase Storage.',
        variant: 'default'
      });
    }
  };

  return (
    <div className="space-y-3">
      <Label className="font-medium text-gray-900">{title}</Label>
      
      {/* File Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <div className="text-center">
          <Paperclip className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <div className="text-sm text-gray-600 mb-2">
            Drop files here or{' '}
            <Button
              variant="link"
              className="p-0 h-auto text-blue-600"
              onClick={() => document.getElementById(`file-input-${storagePrefix}`)?.click()}
              disabled={uploading}
            >
              browse
            </Button>
          </div>
          <p className="text-xs text-gray-500">PDF and Word documents only, up to 10MB each</p>
          
          <input
            id={`file-input-${storagePrefix}`}
            type="file"
            multiple
            accept=".pdf,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          {uploading && (
            <div className="mt-2 text-sm text-blue-600">
              <Upload className="inline h-4 w-4 mr-1 animate-spin" />
              Uploading...
            </div>
          )}
        </div>
      </div>

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700 truncate">{file.name}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownloadFile(file)}
                  className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700"
                  title="Download file"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFile(index)}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  title="Remove file"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentAttachmentSection;
