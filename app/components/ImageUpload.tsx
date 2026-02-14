"use client";

import { useState, useCallback } from "react";
import { UploadDropzone } from "@/app/lib/uploadthing";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Upload, Image as ImageIcon, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  className?: string;
}

export function ImageUpload({
  value = [],
  onChange,
  maxFiles = 5,
  className
}: ImageUploadProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Debug logging
  console.log("ImageUpload render - current value:", value);
  console.log("ImageUpload render - value length:", value.length);

  const handleUploadComplete = useCallback((res: any[]) => {
    console.log("Upload completed:", res);
    const newUrls = res.map((item) => item.url);
    console.log("New URLs:", newUrls);
    const updatedUrls = [...value, ...newUrls].slice(0, maxFiles);
    console.log("Updated URLs:", updatedUrls);
    onChange(updatedUrls);
    toast.success(`${newUrls.length} image(s) uploaded successfully`);
  }, [value, onChange, maxFiles]);

  const handleUploadError = useCallback((error: Error) => {
    console.error("Upload error:", error);
    if (error.message.includes("Unauthorized")) {
      toast.error("Please log in to upload images");
    } else {
      toast.error("Upload failed: " + error.message);
    }
  }, []);

  const removeImage = useCallback((index: number) => {
    const newUrls = value.filter((_, i) => i !== index);
    onChange(newUrls);
    toast.success("Image removed");
  }, [value, onChange]);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const newUrls = [...value];
    const [draggedUrl] = newUrls.splice(draggedIndex, 1);
    newUrls.splice(dropIndex, 0, draggedUrl);

    onChange(newUrls);
    setDraggedIndex(null);
  }, [value, onChange, draggedIndex]);

  const isMaxFilesReached = value.length >= maxFiles;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Debug info */}
      <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
        Debug: Current images count = {value.length}
        <button
          onClick={() => {
            const testUrl = "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmFnc3xlbnwwfHwwfHx8MA%3D%3D";
            onChange([...value, testUrl]);
            console.log("Added test image:", testUrl);
          }}
          className="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-xs"
        >
          Add Test Image
        </button>
      </div>

      {/* Upload Area */}
      {!isMaxFilesReached && (
        <Card className="border-dashed border-2 transition-colors hover:border-primary/50">
          <CardContent className="p-6">
            <UploadDropzone
              endpoint="imageUploader"
              onClientUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
              className="ut-label:text-sm ut-allowed-content:ut-uploading:text-red-500"
              config={{
                mode: "auto",
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Image Previews */}
      {value.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">
              Uploaded Images ({value.length}/{maxFiles})
            </h4>
            <p className="text-xs text-muted-foreground">
              Drag to reorder
            </p>
          </div>

          {/* Debug: Show URLs */}
          <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
            Debug: URLs = {JSON.stringify(value, null, 2)}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {value.map((url, index) => (
              <Card
                key={`${url}-${index}`}
                className={cn(
                  "group relative overflow-hidden transition-all duration-200",
                  "hover:shadow-lg hover:scale-105",
                  draggedIndex === index && "opacity-50 scale-95"
                )}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
              >
                <CardContent className="p-0">
                  <div className="aspect-square relative">
                    <Image
                      src={url}
                      alt={`Upload ${index + 1}`}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = '<div class="aspect-square bg-gray-200 flex items-center justify-center"><svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                        }
                      }}
                    />

                    {/* Overlay with controls */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200">
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeImage(index)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Drag indicator */}
                      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="bg-white/90 rounded p-1">
                          <GripVertical className="h-4 w-4 text-gray-600" />
                        </div>
                      </div>

                      {/* Image number */}
                      <div className="absolute top-2 right-2 bg-white/90 rounded px-2 py-1">
                        <span className="text-xs font-medium text-gray-700">
                          {index + 1}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {value.length === 0 && (
        <Card className="border-dashed border-2 bg-muted/30">
          <CardContent className="p-8 text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No images uploaded
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload up to {maxFiles} images to showcase your product
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Upload className="h-3 w-3" />
              <span>Drag and drop or click to upload</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File count indicator */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {isMaxFilesReached
            ? `Maximum ${maxFiles} images reached`
            : `${value.length} of ${maxFiles} images uploaded`
          }
        </span>
        <span>Supported formats: JPG, PNG, GIF, WebP (Max 4MB each)</span>
      </div>
    </div>
  );
}
