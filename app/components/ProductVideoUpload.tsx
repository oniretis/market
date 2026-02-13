"use client";

import { useState, useCallback } from "react";
import { UploadDropzone } from "@/app/lib/uploadthing";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Upload, Video, CheckCircle, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductVideoUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  className?: string;
}

export function ProductVideoUpload({
  value,
  onChange,
  className
}: ProductVideoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadComplete = useCallback((res: any[]) => {
    setIsUploading(false);
    if (res.length > 0) {
      onChange(res[0].url);
      toast.success("Product video uploaded successfully");
    }
  }, [onChange]);

  const handleUploadBegin = useCallback(() => {
    setIsUploading(true);
    toast.loading("Uploading product video...");
  }, []);

  const handleUploadError = useCallback((error: Error) => {
    setIsUploading(false);
    toast.error("Upload failed: " + error.message);
  }, []);

  const removeVideo = useCallback(() => {
    onChange(null);
    toast.success("Product video removed");
  }, [onChange]);

  const getFileName = (url: string) => {
    return url.split('/').pop()?.split('?')[0] || 'product-video';
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area - Only show if no video is uploaded */}
      {!value && !isUploading && (
        <Card className="border-dashed border-2 transition-colors hover:border-primary/50">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Upload Product Video
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload your product video (MP4, WebM, MOV formats)
              </p>
            </div>

            <UploadDropzone
              endpoint="productVideoUpload"
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
                <strong>Important:</strong> Make sure your video clearly demonstrates
                your product features and benefits
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
                <p className="font-medium">Uploading product video...</p>
                <p className="text-sm text-muted-foreground">Please don&apos;t close this window</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Video Preview - Show when video is uploaded */}
      {value && !isUploading && (
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="bg-green-100 rounded-lg p-3">
                  <Video className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {getFileName(value)}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Product Video • MP4/WebM/MOV
                    </p>
                    <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      <span>Successfully uploaded</span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={removeVideo}
                    className="flex-shrink-0 ml-2"
                  >
                    <X className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>

            {/* Video Preview */}
            <div className="mt-4">
              <video
                src={value}
                controls
                className="w-full max-w-md rounded-lg border border-gray-200"
                preload="metadata"
              >
                Your browser does not support the video tag.
              </video>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>Note:</strong> This video will be displayed to customers
                to showcase your product features.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Supported formats: MP4, WebM, MOV</p>
        <p>• Maximum file size: 32MB</p>
        <p>• Recommended resolution: 1080p or lower</p>
        <p>• Keep videos under 5 minutes for best performance</p>
      </div>
    </div>
  );
}
