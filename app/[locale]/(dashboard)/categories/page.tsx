"use client";

import { useState, useEffect } from "react";
import { ArrowUpDown, Edit, Plus, Search, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { ILocaleContent } from "@/models";

interface Category {
  _id: string;
  name: ILocaleContent;
  image: string;
}

export default function CategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: {
      en: "",
      ar: "",
    },
    image: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load categories",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [toast]);

  const filteredCategories = categories.filter((category) =>
    category.name.en.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCategory = async () => {
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCategory),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add category");
      }

      const addedCategory = await response.json();
      setCategories([...categories, addedCategory]);
      setNewCategory({
        name: {
          en: "",
          ar: "",
        },
        image: "",
      });
      setIsAddDialogOpen(false);

      toast({
        title: "Success",
        description: "Category added successfully",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to add category",
        variant: "destructive",
      });
    }
  };

  const handleEditCategory = async () => {
    if (!currentCategory) return;

    try {
      const response = await fetch(`/api/categories/${currentCategory._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: currentCategory.name,
          image: currentCategory.image,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update category");
      }

      const updatedCategory = await response.json();
      setCategories(
        categories.map((category) =>
          category._id === currentCategory._id ? updatedCategory : category
        )
      );
      setIsEditDialogOpen(false);

      toast({
        title: "Success",
        description: "Category updated successfully",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update category",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async () => {
    if (!currentCategory) return;

    try {
      const response = await fetch(`/api/categories/${currentCategory._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete category");
      }

      setCategories(
        categories.filter((category) => category._id !== currentCategory._id)
      );
      setIsDeleteDialogOpen(false);

      toast({
        title: "Success",
        description: "Category deleted successfully",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="text-muted-foreground">Manage your menu categories.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>All Categories</CardTitle>
            <CardDescription>
              You have {categories.length} total categories.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search categories..."
                className="w-full pl-8 md:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Category</DialogTitle>
                  <DialogDescription>
                    Create a new category for your menu items.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={newCategory.name.en}
                        onChange={(e) =>
                          setNewCategory({
                            ...newCategory,
                            name: {
                              en: e.target.value,
                              ar: newCategory.name.ar,
                            },
                          })
                        }
                        placeholder="Category name"
                      />
                    </div>
                    <div dir="rtl">
                      <Label htmlFor="name">الاسم</Label>
                      <Input
                        id="name"
                        value={newCategory.name.ar}
                        onChange={(e) =>
                          setNewCategory({
                            ...newCategory,
                            name: {
                              ar: e.target.value,
                              en: newCategory.name.en,
                            },
                          })
                        }
                        placeholder="اسم الفئة"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="image">Image URL</Label>
                    <Input
                      id="image"
                      value={newCategory.image}
                      onChange={(e) =>
                        setNewCategory({
                          ...newCategory,
                          image: e.target.value,
                        })
                      }
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  {newCategory.image && (
                    <div className="mt-2">
                      <Label>Image Preview</Label>
                      <div className="mt-2 border rounded-md overflow-hidden w-full h-40 relative">
                        <Image
                          src={newCategory.image || "/placeholder.svg"}
                          alt="Category preview"
                          fill
                          className="object-cover"
                          onError={(e) => {
                            e.currentTarget.src =
                              "/placeholder.svg?height=160&width=300";
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddCategory}>Add Category</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead className="w-[120px]">
                    <Button variant="ghost" className="p-0 font-medium">
                      Name
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[200px]">
                    <Button variant="ghost" className="p-0 font-medium">
                      الاسم
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No categories found. Try a different search or add a new
                      category.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((category) => (
                    <TableRow key={category._id}>
                      <TableCell>
                        <div className="h-10 w-10 relative rounded-md overflow-hidden">
                          <Image
                            src={
                              category.image ||
                              "/placeholder.svg?height=40&width=40"
                            }
                            alt={category.name.en}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              e.currentTarget.src =
                                "/placeholder.svg?height=40&width=40";
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {category.name.en}
                      </TableCell>
                      <TableCell className="font-medium">
                        {category.name.ar}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Dialog
                            open={
                              isEditDialogOpen &&
                              currentCategory?._id === category._id
                            }
                            onOpenChange={(open) => {
                              setIsEditDialogOpen(open);
                              if (!open) setCurrentCategory(null);
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setCurrentCategory(category)}
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Category</DialogTitle>
                                <DialogDescription>
                                  Make changes to the category.
                                </DialogDescription>
                              </DialogHeader>
                              {currentCategory && (
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <Label htmlFor="name">Name</Label>
                                      <Input
                                        id="name"
                                        value={currentCategory.name.en}
                                        onChange={(e) =>
                                          setCurrentCategory({
                                            ...currentCategory,
                                            name: {
                                              en: e.target.value,
                                              ar: currentCategory.name.ar,
                                            },
                                          })
                                        }
                                        placeholder="Category name"
                                      />
                                    </div>
                                    <div dir="rtl">
                                      <Label htmlFor="name">الاسم</Label>
                                      <Input
                                        id="name"
                                        value={currentCategory.name.ar}
                                        onChange={(e) =>
                                          setCurrentCategory({
                                            ...currentCategory,
                                            name: {
                                              ar: e.target.value,
                                              en: currentCategory.name.en,
                                            },
                                          })
                                        }
                                        placeholder="اسم الفئة"
                                      />
                                    </div>
                                  </div>

                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-image">
                                      Image URL
                                    </Label>
                                    <Input
                                      id="edit-image"
                                      value={currentCategory.image}
                                      onChange={(e) =>
                                        setCurrentCategory({
                                          ...currentCategory,
                                          image: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                  {currentCategory.image && (
                                    <div className="mt-2">
                                      <Label>Image Preview</Label>
                                      <div className="mt-2 border rounded-md overflow-hidden w-full h-40 relative">
                                        <Image
                                          src={
                                            currentCategory.image ||
                                            "/placeholder.svg"
                                          }
                                          alt="Category preview"
                                          fill
                                          className="object-cover"
                                          onError={(e) => {
                                            e.currentTarget.src =
                                              "/placeholder.svg?height=160&width=300";
                                          }}
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setIsEditDialogOpen(false)}
                                >
                                  Cancel
                                </Button>
                                <Button onClick={handleEditCategory}>
                                  Save Changes
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Dialog
                            open={
                              isDeleteDialogOpen &&
                              currentCategory?._id === category._id
                            }
                            onOpenChange={(open) => {
                              setIsDeleteDialogOpen(open);
                              if (!open) setCurrentCategory(null);
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setCurrentCategory(category)}
                              >
                                <Trash className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete Category</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete this category?
                                  This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              {currentCategory && (
                                <div className="py-4">
                                  <p className="text-sm font-medium">
                                    You are about to delete:{" "}
                                    <span className="font-bold">
                                      {currentCategory.name.en}
                                    </span>
                                  </p>
                                </div>
                              )}
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setIsDeleteDialogOpen(false)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={handleDeleteCategory}
                                >
                                  Delete Category
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
