"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Edit, Plus, ExternalLink, Image as ImageIcon, Video, Play } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "../ImageUpload";
import VideoUpload from "../VideoUpload";

interface Advertisement {
  id: string;
  title: string;
  imageUrl: string;
  videoUrl?: string;
  linkUrl?: string;
  description?: string;
  isActive: boolean;
  position: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  User: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function AdvertisementManagement() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    imageUrls: [] as string[],
    videoUrl: "",
    linkUrl: "",
    description: "",
    isActive: true,
    position: 0,
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const response = await fetch("/api/admin/ads");
      if (response.ok) {
        const data = await response.json();
        setAds(data.ads || []);
      }
    } catch (error) {
      console.error("Failed to fetch ads:", error);
      toast.error("Failed to fetch advertisements");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      imageUrls: [],
      videoUrl: "",
      linkUrl: "",
      description: "",
      isActive: true,
      position: 0,
      startDate: "",
      endDate: "",
    });
    setEditingAd(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.imageUrls.length === 0 && !formData.videoUrl) {
      toast.error("Please upload an image or video");
      return;
    }

    try {
      const url = editingAd ? `/api/admin/ads/${editingAd.id}` : "/api/admin/ads";
      const method = editingAd ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          imageUrl: formData.imageUrls[0] || "" // Use first image as primary, empty if no image
        }),
      });

      if (response.ok) {
        toast.success(editingAd ? "Advertisement updated successfully" : "Advertisement created successfully");
        resetForm();
        setIsCreateDialogOpen(false);
        fetchAds();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save advertisement");
      }
    } catch (error) {
      console.error("Failed to save ad:", error);
      toast.error("Failed to save advertisement");
    }
  };

  const handleEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      imageUrls: ad.imageUrl ? [ad.imageUrl] : [],
      videoUrl: ad.videoUrl || "",
      linkUrl: ad.linkUrl || "",
      description: ad.description || "",
      isActive: ad.isActive,
      position: ad.position,
      startDate: ad.startDate ? new Date(ad.startDate).toISOString().split('T')[0] : "",
      endDate: ad.endDate ? new Date(ad.endDate).toISOString().split('T')[0] : "",
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this advertisement?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/ads/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Advertisement deleted successfully");
        fetchAds();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete advertisement");
      }
    } catch (error) {
      console.error("Failed to delete ad:", error);
      toast.error("Failed to delete advertisement");
    }
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading advertisements...</div>;
  }

  return (
    <div className="space-y-6 h-full overflow-y-auto">
      <div className="flex justify-between items-center sticky top-0 bg-background/95 backdrop-blur-sm z-10 pb-4">
        <div>
          <h1 className="text-2xl font-bold">Advertisement Management</h1>
          <p className="text-sm text-muted-foreground">Manage carousel advertisements displayed on the homepage</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Advertisement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAd ? "Edit Advertisement" : "Create New Advertisement"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="title" className="text-sm font-medium">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="h-10"
                  />
                </div>
                <div>
                  <Label htmlFor="position" className="text-sm font-medium">Position</Label>
                  <Input
                    id="position"
                    type="number"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                    className="h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Advertisement Image *</Label>
                <div className="border rounded-lg p-4 bg-muted/30">
                  <ImageUpload
                    value={formData.imageUrls}
                    onChange={(urls) => setFormData({ ...formData, imageUrls: urls })}
                    maxFiles={1}
                    className="border-0 bg-transparent"
                  />
                </div>
                {formData.imageUrls.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Please upload an image for the advertisement
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Advertisement Video (optional)</Label>
                <VideoUpload
                  value={formData.videoUrl}
                  onChange={(url) => setFormData({ ...formData, videoUrl: url })}
                />
                {formData.videoUrl && (
                  <p className="text-xs text-muted-foreground">
                    Video will be displayed instead of image in the carousel
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkUrl" className="text-sm font-medium">Link URL (optional)</Label>
                <Input
                  id="linkUrl"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  placeholder="https://example.com/product"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the advertisement"
                  className="resize-none"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="startDate" className="text-sm font-medium">Start Date (optional)</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="h-10"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate" className="text-sm font-medium">End Date (optional)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="h-10"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 py-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked: boolean) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive" className="text-sm font-medium">Active</Label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="h-10">
                  Cancel
                </Button>
                <Button type="submit" className="h-10">
                  {editingAd ? "Update" : "Create"} Advertisement
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {ads.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center p-12">
              <ImageIcon className="h-16 w-16 text-muted-foreground/50 mb-6" />
              <h3 className="text-xl font-semibold mb-2">No advertisements yet</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Create your first advertisement to display in the homepage carousel
              </p>
              <Button onClick={openCreateDialog} className="h-11">
                <Plus className="h-4 w-4 mr-2" />
                Create Advertisement
              </Button>
            </CardContent>
          </Card>
        ) : (
          ads.map((ad) => (
            <Card key={ad.id} className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-muted">
                      {ad.videoUrl ? (
                        <video
                          src={ad.videoUrl}
                          className="h-20 w-20 object-cover"
                          muted
                          loop
                          onMouseEnter={(e) => e.currentTarget.play()}
                          onMouseLeave={(e) => e.currentTarget.pause()}
                        />
                      ) : ad.imageUrl ? (
                        <Image
                          src={ad.imageUrl}
                          alt={ad.title}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            console.error('Image failed to load:', ad.imageUrl);
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = '<div class="h-20 w-20 rounded-lg bg-muted flex items-center justify-center"><svg class="h-8 w-8 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                            }
                          }}
                        />
                      ) : (
                        <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center">
                          {ad.videoUrl ? (
                            <Video className="h-8 w-8 text-muted-foreground/50" />
                          ) : (
                            <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                          )}
                        </div>
                      )}

                      {/* Media type indicator */}
                      <div className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full">
                        {ad.videoUrl ? (
                          <Video className="h-3 w-3" />
                        ) : (
                          <ImageIcon className="h-3 w-3" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold truncate">{ad.title}</h3>
                      <Badge variant={ad.isActive ? "default" : "secondary"} className="shrink-0">
                        {ad.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline" className="shrink-0">Position {ad.position}</Badge>
                    </div>

                    {ad.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{ad.description}</p>
                    )}

                    <div className="flex items-center gap-6 text-xs text-muted-foreground mb-4">
                      <span>Created: {new Date(ad.createdAt).toLocaleDateString()}</span>
                      {ad.startDate && (
                        <span>Start: {new Date(ad.startDate).toLocaleDateString()}</span>
                      )}
                      {ad.endDate && (
                        <span>End: {new Date(ad.endDate).toLocaleDateString()}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      {ad.linkUrl && (
                        <Button variant="outline" size="sm" asChild className="h-8">
                          <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-2" />
                            Visit Link
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(ad)} className="h-8 w-8 p-0">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(ad.id)} className="h-8 w-8 p-0">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
