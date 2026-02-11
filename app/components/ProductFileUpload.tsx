"use client";

import { useState, useCallback } from "react";
import { UploadDropzone } from "@/app/lib/uploadthing";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Upload, File, FileArchive, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductFileUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  className?: string;
}

export function ProductFileUpload({
  value,
  onChange,
  className
}: ProductFileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadComplete = useCallback((res: any[]) => {
    setIsUploading(false);
    if (res.length > 0) {
      onChange(res[0].url);
      toast.success("Product file uploaded successfully");
    }
  }, [onChange]);

  const handleUploadBegin = useCallback(() => {
    setIsUploading(true);
    toast.loading("Uploading product file...");
  }, []);

  const handleUploadError = useCallback((error: Error) => {
    setIsUploading(false);
    toast.error("Upload failed: " + error.message);
  }, []);

  const removeFile = useCallback(() => {
    onChange(null);
    toast.success("Product file removed");
  }, [onChange]);

  const getFileName = (url: string) => {
    return url.split('/').pop()?.split('?')[0] || 'product-file';
  };

  const formatFileSize = (url: string) => {
    // This is a rough estimate since we don't have the actual file size
    // In a real implementation, you might want to store file size metadata
    return "Unknown size";
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area - Only show if no file is uploaded */}
      {!value && !isUploading && (
        <Card className="border-dashed border-2 transition-colors hover:border-primary/50">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <FileArchive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Upload Product File
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload your product file (ZIP format only)
              </p>
            </div>

            <UploadDropzone
              endpoint="productFileUpload"
              onClientUploadComplete={handleUploadComplete}
              onUploadBegin={handleUploadBegin}
              onUploadError={handleUploadError}
              className="ut-label:text-sm ut-button:bg-primary ut-button:text-primary-foreground ut-button:hover:bg-primary/90"
              config={{
                mode: "auto",
              }}
            />

            <div className="mt-4 text-center">
              <p className="text-xs text-muted-foreground">
                <strong>Important:</strong> Make sure your ZIP file contains all necessary
                product files, documentation, and assets
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Uploading State */}
      {isUploading && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <div className="text-center">
                <p className="font-medium">Uploading product file...</p>
                <p className="text-sm text-muted-foreground">Please don&apos;t close this window</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Preview - Show when file is uploaded */}
      {value && !isUploading && (
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="bg-green-100 rounded-lg p-3">
                  <FileArchive className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {getFileName(value)}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Product File • {formatFileSize(value)}
                    </p>
                    <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      <span>Successfully uploaded</span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={removeFile}
                    className="flex-shrink-0 ml-2"
                  >
                    <X className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>Note:</strong> This file will be delivered to customers after purchase.
                Make sure it contains all necessary product materials.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Supported format: ZIP files only</p>
        <p>• Maximum file size: 100MB</p>
        <p>• Include: Product files, documentation, license, and assets</p>
      </div>
    </div>
  );
}
