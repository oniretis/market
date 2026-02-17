"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconSelector } from "./IconSelector";
import {
  FolderOpen,
  Tag,
  Plus,
  Edit,
  Trash2,
  Package,
  Hash
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string;
  isActive: boolean;
  count: number;
  createdAt: string;
  updatedAt: string;
}

interface TagItem {
  id: string;
  name: string;
  description: string | null;
  color: string;
  createdAt: string;
  _count: {
    ProductTag: number;
  };
}


export function CategoryTagManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTagName, setNewTagName] = useState("");
  const [newTagDescription, setNewTagDescription] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3B82F6");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#3B82F6");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesResponse, tagsResponse] = await Promise.all([
        fetch("/api/admin/categories"),
        fetch("/api/admin/tags")
      ]);

      const categoriesData = await categoriesResponse.json();
      const tagsData = await tagsResponse.json();

      setCategories(categoriesData.categories || []);
      setTags(tagsData.tags || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    try {
      const response = await fetch("/api/admin/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newTagName,
          description: newTagDescription,
          color: newTagColor,
        }),
      });

      if (response.ok) {
        setNewTagName("");
        setNewTagDescription("");
        setNewTagColor("#3B82F6");
        fetchData(); // Refresh the list
      }
    } catch (error) {
      console.error("Failed to create tag:", error);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    try {
      const response = await fetch(`/api/admin/tags/${tagId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchData(); // Refresh the list
      }
    } catch (error) {
      console.error("Failed to delete tag:", error);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newCategoryName,
          description: newCategoryDescription,
          icon: newCategoryIcon,
          color: newCategoryColor,
        }),
      });

      if (response.ok) {
        setNewCategoryName("");
        setNewCategoryDescription("");
        setNewCategoryIcon("");
        setNewCategoryColor("#3B82F6");
        fetchData(); // Refresh the list
      }
    } catch (error) {
      console.error("Failed to create category:", error);
    }
  };

  const handleUpdateCategory = async (category: Category) => {
    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(category),
      });

      if (response.ok) {
        setEditingCategory(null);
        fetchData(); // Refresh the list
      }
    } catch (error) {
      console.error("Failed to update category:", error);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchData(); // Refresh the list
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading categories and tags...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories & Tags</h1>
          <p className="text-muted-foreground">
            Manage product categories and tagging system
          </p>
        </div>
      </div>

      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList>
          <TabsTrigger value="categories">Select Category Icon </TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          {/* Create New Category */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Create New Category
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Category Name</label>
                  <Input
                    placeholder="Enter category name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Color</label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="color"
                      value={newCategoryColor}
                      onChange={(e) => setNewCategoryColor(e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      placeholder="#3B82F6"
                      value={newCategoryColor}
                      onChange={(e) => setNewCategoryColor(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Icon (optional)</label>
                <IconSelector
                  selectedIcon={newCategoryIcon}
                  onIconSelect={setNewCategoryIcon}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Enter category description (optional)"
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                />
              </div>
              <Button onClick={handleCreateCategory} className="w-full md:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Create Category
              </Button>
            </CardContent>
          </Card>

          {/* Existing Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FolderOpen className="h-5 w-5 mr-2" />
                Existing Categories
              </CardTitle>
              <CardDescription>
                Manage product categories. Categories can be edited or deleted if they contain no products.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <div className="text-center py-8">
                  <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">No categories found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create your first category to get started.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categories.map((category) => (
                    <Card key={category.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div
                            className="h-10 w-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${category.color}20` }}
                          >
                            <Package
                              className="h-5 w-5"
                              style={{ color: category.color }}
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold capitalize">{category.name}</h3>
                            {category.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {category.description}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              {category.count} products
                            </p>
                            <Badge variant={category.isActive ? "default" : "secondary"} className="mt-2">
                              {category.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setEditingCategory(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteCategory(category.id)}
                            disabled={category.count > 0}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Edit Category Modal */}
          {editingCategory && (
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Edit className="h-5 w-5 mr-2" />
                  Edit Category: {editingCategory.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Category Name</label>
                    <Input
                      value={editingCategory.name}
                      onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Color</label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="color"
                        value={editingCategory.color}
                        onChange={(e) => setEditingCategory({ ...editingCategory, color: e.target.value })}
                        className="w-20 h-10"
                      />
                      <Input
                        value={editingCategory.color}
                        onChange={(e) => setEditingCategory({ ...editingCategory, color: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Icon (optional)</label>
                  <IconSelector
                    selectedIcon={editingCategory.icon || ""}
                    onIconSelect={(icon) => setEditingCategory({ ...editingCategory, icon })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={editingCategory.description || ""}
                    onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={editingCategory.isActive}
                    onChange={(e) => setEditingCategory({ ...editingCategory, isActive: e.target.checked })}
                  />
                  <label htmlFor="isActive" className="text-sm font-medium">
                    Category is active
                  </label>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={() => handleUpdateCategory(editingCategory)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Update Category
                  </Button>
                  <Button variant="outline" onClick={() => setEditingCategory(null)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tags" className="space-y-4">
          {/* Create New Tag */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Create New Tag
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Tag Name</label>
                  <Input
                    placeholder="Enter tag name"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Color</label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="color"
                      value={newTagColor}
                      onChange={(e) => setNewTagColor(e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      placeholder="#3B82F6"
                      value={newTagColor}
                      onChange={(e) => setNewTagColor(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Enter tag description (optional)"
                  value={newTagDescription}
                  onChange={(e) => setNewTagDescription(e.target.value)}
                />
              </div>
              <Button onClick={handleCreateTag} className="w-full md:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Create Tag
              </Button>
            </CardContent>
          </Card>

          {/* Existing Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Tag className="h-5 w-5 mr-2" />
                Existing Tags
              </CardTitle>
              <CardDescription>
                Manage custom tags for product labeling
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tags.length === 0 ? (
                <div className="text-center py-8">
                  <Hash className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">No tags created</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create your first tag to get started.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {tags.map((tag) => (
                    <Card key={tag.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div
                            className="h-10 w-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${tag.color}20` }}
                          >
                            <Tag
                              className="h-5 w-5"
                              style={{ color: tag.color }}
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{tag.name}</h3>
                            {tag.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {tag.description}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              Used on {tag._count.ProductTag} products
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteTag(tag.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
