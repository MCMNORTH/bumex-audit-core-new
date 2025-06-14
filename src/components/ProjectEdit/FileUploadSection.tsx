
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, FileText, Download } from 'lucide-react';

interface FileUploadSectionProps {
  uploadedFile: File | null;
  uploadStatus: 'idle' | 'uploading' | 'success' | 'error';
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
  onDownloadFile: () => void;
}

const FileUploadSection = ({
  uploadedFile,
  uploadStatus,
  onFileUpload,
  onRemoveFile,
  onDownloadFile
}: FileUploadSectionProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <Label>Select engagement structure</Label>
      <div className="mt-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileUpload}
          accept=".pdf"
          className="hidden"
        />
        
        {!uploadedFile ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleUploadClick}
            disabled={uploadStatus === 'uploading'}
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload PDF'}
          </Button>
        ) : (
          <div className="flex items-center space-x-2 p-2 bg-green-50 border border-green-200 rounded-md">
            <FileText className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700 flex-1">{uploadedFile.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDownloadFile}
              className="h-6 w-6 p-0 text-blue-500 hover:text-blue-700"
              title="Download file"
            >
              <Download className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemoveFile}
              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              title="Remove file"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadSection;
