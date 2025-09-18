import * as React from "react"
import { Upload, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

export interface UploadProps {
  onFileSelect: (file: File) => void
  accept?: string
  className?: string
}

const UploadArea = React.forwardRef<HTMLDivElement, UploadProps>(
  ({ onFileSelect, accept = ".pdf", className, ...props }, ref) => {
    const [isDragOver, setIsDragOver] = React.useState(false)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
    }

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const files = e.dataTransfer.files
      if (files.length > 0) {
        onFileSelect(files[0])
      }
    }

    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      fileInputRef.current?.click()
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        onFileSelect(files[0])
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer transition-colors hover:border-gray-400",
          isDragOver && "border-blue-500 bg-blue-50",
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
          onClick={(e) => e.stopPropagation()}
        />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          Drop your resume here or click to browse
        </p>
        <p className="text-sm text-gray-500">
          PDF files only (max 10MB)
        </p>
      </div>
    )
  }
)
UploadArea.displayName = "UploadArea"

export { UploadArea }