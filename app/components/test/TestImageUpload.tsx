"use client";

import { useState } from "react";
import { UploadDropzone } from "@/app/lib/uploadthing";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

export function TestImageUpload() {
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const handleUploadComplete = (res: any[]) => {
    console.log("Test upload completed:", res);
    setDebugInfo(res);

    const urls = res.map((item) => item.url).filter(Boolean);
    console.log("Extracted URLs:", urls);

    if (urls.length > 0) {
      setUploadedUrls(urls);
      toast.success(`Test upload successful! Got ${urls.length} URLs`);
    } else {
      toast.error("No URLs found in upload response");
    }
  };

  const handleUploadError = (error: Error) => {
    console.error("Test upload error:", error);
    toast.error("Test upload failed: " + error.message);
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold">Image Upload Test</h2>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">Upload Test</h3>
          <UploadDropzone
            endpoint="imageUploader"
            onClientUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
            className="ut-label:text-sm"
          />
        </CardContent>
      </Card>

      {uploadedUrls.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">Uploaded Images</h3>
            <div className="space-y-4">
              {uploadedUrls.map((url, index) => (
                <div key={index} className="space-y-2">
                  <p className="text-sm font-medium">Image {index + 1}:</p>
                  <div className="relative w-full h-32">
                    <Image
                      src={url}
                      alt={`Test ${index + 1}`}
                      fill
                      className="object-cover rounded"
                      onError={(e) => console.error("Test image failed:", url)}
                      onLoad={() => console.log("Test image loaded:", url)}
                    />
                  </div>
                  <p className="text-xs font-mono break-all bg-gray-100 p-2 rounded">
                    {url}
                  </p>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline text-sm"
                  >
                    Open in new tab
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {debugInfo && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">Debug Info</h3>
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
