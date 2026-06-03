import * as React from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface UploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  className?: string;
}

const UploadArea = React.forwardRef<HTMLDivElement, UploadProps>(
  ({ onFileSelect, accept = '.pdf', className, ...props }, ref) => {
    const [isDragOver, setIsDragOver] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        onFileSelect(files[0]);
      }
    };

    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFileSelect(files[0]);
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          'border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer transition-all duration-200 hover:border-primary/50 hover:bg-muted/50',
          isDragOver && 'border-primary bg-primary/5',
          className
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        {...props}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          onClick={e => e.stopPropagation()}
        />
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Upload className="h-6 w-6 text-primary" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">
          Drop your resume here or click to browse
        </p>
        <p className="text-xs text-muted-foreground">PDF files only (max 10MB)</p>
      </div>
    );
  }
);
UploadArea.displayName = 'UploadArea';

export { UploadArea };
