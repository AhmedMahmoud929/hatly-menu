"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TagInput } from "@/components/ui/tags-input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { IProduct } from "@/types";
import { Edit, Loader, Plus } from "lucide-react";
import React, { useEffect, useState } from "react";

interface ICategory {
  _id: string;
  name: string;
  image: string;
}

// TODO: Refactor that code later (V0-generated)
function EditProductDialog({
  product,
  currentProduct,
  setCurrentProduct,
  updateProductLocally,
}: {
  product: IProduct;
  currentProduct: IProduct | null;
  setCurrentProduct: (product: IProduct | null) => void;
  updateProductLocally: (product: IProduct) => void;
}) {
  const { toast } = useToast();
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await fetch("/api/categories");
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleEditProduct = async () => {
    if (!currentProduct) return;

    // Set on loading flag
    setIsLoading(true);

    // Actual update product logic
    try {
      const response = await fetch(`/api/products/${currentProduct._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(currentProduct),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update product");
      }

      const updatedProduct = await response.json();
      updateProductLocally(updatedProduct);
      setIsEditDialogOpen(false);

      toast({
        title: "Success",
        description: "Product updated successfully",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update product",
        variant: "destructive",
      });
    }

    // Set off loading flag
    setIsLoading(false);
  };

  return (
    <Dialog
      open={isEditDialogOpen}
      onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) setCurrentProduct(null);
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentProduct(product)}
        >
          <Edit className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>Make changes to the product.</DialogDescription>
        </DialogHeader>
        {currentProduct && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={currentProduct.name}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Price ($)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={currentProduct.price}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      price: Number.parseFloat(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select
                value={currentProduct.category}
                onValueChange={(value) =>
                  setCurrentProduct({ ...currentProduct, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={currentProduct.description}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    description: e.target.value,
                  })
                }
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-image">Image URL</Label>
              <Input
                id="edit-image"
                value={currentProduct.image}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    image: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-extras">Extras</Label>
              <TagInput
                initialTags={[...currentProduct.extras]}
                value={currentProduct.extras}
                syncTags={(updatedTags) =>
                  setCurrentProduct({ ...currentProduct, extras: updatedTags })
                }
                placeholder="Additional options, comma separated"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-rating">Rating (0-5)</Label>
                <Input
                  id="edit-rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={currentProduct.rating}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      rating: Number.parseFloat(e.target.value),
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-total-order">Total Orders</Label>
                <Input
                  id="edit-total-order"
                  type="number"
                  value={currentProduct.total_order}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      total_order: Number.parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-available"
                checked={currentProduct.is_available}
                onCheckedChange={(checked) =>
                  setCurrentProduct({
                    ...currentProduct,
                    is_available: checked,
                  })
                }
              />
              <Label htmlFor="edit-available">Available</Label>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button
            disabled={isLoading}
            variant="outline"
            onClick={() => setIsEditDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button disabled={isLoading} onClick={handleEditProduct}>
            {isLoading ? (
              <Loader className="animate-spin mx-10" />
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EditProductDialog;
