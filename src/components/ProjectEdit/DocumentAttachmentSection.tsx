
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, FileText, Download, Paperclip } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
          variant: 'destructive',
        });
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: `${file.name} is larger than 10MB`,
          variant: 'destructive',
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    
    try {
      // For now, we'll create mock URLs since we don't have Firebase Storage implementation
      // In a real implementation, you would upload to Firebase Storage here
      const newFiles: DocumentFile[] = validFiles.map(file => ({
        name: file.name,
        url: `https://example.com/${storagePrefix}/${projectId}/${Date.now()}-${file.name}`,
        type: file.type
      }));
      
      const updatedFiles = [...files, ...newFiles];
      onFilesChange(updatedFiles);
      
      toast({
        title: 'Files uploaded',
        description: `${validFiles.length} file(s) uploaded successfully`,
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload files. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    onFilesChange(updatedFiles);
  };

  const handleDownloadFile = (file: DocumentFile) => {
    // Create a temporary link to download the file
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
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{title}</Label>
        <div>
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
            id={`file-input-${storagePrefix}`}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById(`file-input-${storagePrefix}`)?.click()}
            disabled={uploading}
          >
            <Paperclip className="mr-2 h-4 w-4" />
            {uploading ? 'Uploading...' : 'Attach Files'}
          </Button>
        </div>
      </div>
      
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center space-x-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-700 flex-1">{file.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownloadFile(file)}
                className="h-6 w-6 p-0 text-blue-500 hover:text-blue-700"
                title="Download file"
              >
                <Download className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveFile(index)}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                title="Remove file"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentAttachmentSection;
