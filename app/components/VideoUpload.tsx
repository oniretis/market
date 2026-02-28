"use client";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, X, Video, Play, Pause } from "lucide-react";
import { toast } from "sonner";

interface VideoUploadProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
}

export default function VideoUpload({ value, onChange, className }: VideoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error("Please select a video file");
      return;
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      toast.error("Video file must be smaller than 50MB");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      const response = await fetch('/api/upload/video', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      onChange(data.url);
      toast.success("Video uploaded successfully");
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Failed to upload video");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [onChange]);

  const handleRemove = useCallback(() => {
    onChange('');
    setIsPlaying(false);
  }, [onChange]);

  const togglePlay = useCallback(() => {
    if (videoRef) {
      if (isPlaying) {
        videoRef.pause();
      } else {
        videoRef.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [videoRef, isPlaying]);

  return (
    <div className={className}>
      {value ? (
        <Card className="relative overflow-hidden">
          <CardContent className="p-0">
            <div className="relative group">
              <video
                ref={setVideoRef}
                src={value}
                className="w-full h-48 object-cover rounded-lg"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              
              {/* Video overlay controls */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={togglePlay}
                  className="mr-2"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-4 w-4 mr-1" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-1" />
                      Play
                    </>
                  )}
                </Button>
                
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRemove}
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>

              {/* Playing indicator */}
              {isPlaying && (
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                  Playing
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className={`border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors ${className}`}>
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Video className="h-8 w-8 text-muted-foreground" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Upload Video Advertisement</h3>
                <p className="text-sm text-muted-foreground">
                  Upload a video file (MP4, WebM, or OGG) up to 50MB
                </p>
              </div>

              <div className="relative">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <Button
                  variant="outline"
                  disabled={isUploading}
                  className="pointer-events-none"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? "Uploading..." : "Choose Video"}
                </Button>
              </div>

              {isUploading && (
                <div className="w-full space-y-2">
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-xs text-muted-foreground">
                    {Math.round(uploadProgress)}% uploaded
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
