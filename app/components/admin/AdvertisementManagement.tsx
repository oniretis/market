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
import { Trash2, Edit, Plus, ExternalLink, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface Advertisement {
  id: string;
  title: string;
  imageUrl: string;
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
    imageUrl: "",
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
      imageUrl: "",
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

    try {
      const url = editingAd ? `/api/admin/ads/${editingAd.id}` : "/api/admin/ads";
      const method = editingAd ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
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
      imageUrl: ad.imageUrl,
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Advertisement Management</h1>
          <p className="text-muted-foreground">Manage carousel advertisements displayed on the homepage</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Advertisement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingAd ? "Edit Advertisement" : "Create New Advertisement"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    type="number"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="imageUrl">Image URL *</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </div>

              <div>
                <Label htmlFor="linkUrl">Link URL (optional)</Label>
                <Input
                  id="linkUrl"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  placeholder="https://example.com/product"
                />
              </div>

              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the advertisement"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date (optional)</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date (optional)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked: boolean) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingAd ? "Update" : "Create"} Advertisement
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {ads.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-8">
              <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No advertisements yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first advertisement to display in the homepage carousel
              </p>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Create Advertisement
              </Button>
            </CardContent>
          </Card>
        ) : (
          ads.map((ad) => (
            <Card key={ad.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{ad.title}</h3>
                      <Badge variant={ad.isActive ? "default" : "secondary"}>
                        {ad.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline">Position {ad.position}</Badge>
                    </div>

                    {ad.description && (
                      <p className="text-muted-foreground mb-2">{ad.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span>Created: {new Date(ad.createdAt).toLocaleDateString()}</span>
                      {ad.startDate && (
                        <span>Start: {new Date(ad.startDate).toLocaleDateString()}</span>
                      )}
                      {ad.endDate && (
                        <span>End: {new Date(ad.endDate).toLocaleDateString()}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="relative h-16 w-16">
                          <Image
                            src={ad.imageUrl}
                            alt={ad.title}
                            fill
                            className="object-cover rounded"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = '<div class="h-16 w-16 rounded bg-gray-200 flex items-center justify-center"><svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                              }
                            }}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Image Preview</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {ad.imageUrl}
                          </p>
                        </div>
                      </div>

                      {ad.linkUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Visit Link
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(ad)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(ad.id)}>
                      <Trash2 className="h-4 w-4" />
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
