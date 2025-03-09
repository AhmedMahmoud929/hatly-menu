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
import { Plus, Tags } from "lucide-react";
import React, { useEffect, useState } from "react";

interface ICategory {
  _id: string;
  name: string;
  image: string;
}

function AddProductDialog({
  handleAddProductLocally,
}: {
  handleAddProductLocally: (product: any) => void;
}) {
  const { toast } = useToast();
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [newProduct, setNewProduct] = useState<Omit<IProduct, "_id">>({
    name: "",
    category: "",
    description: "",
    rating: 0,
    price: 0,
    is_available: true,
    total_order: 0,
    extras: [],
    image: "",
  });

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

  const handleAddProduct = async () => {
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProduct),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add product");
      }

      const addedProduct = await response.json();
      handleAddProductLocally(addedProduct);
      setNewProduct({
        name: "",
        category: "",
        description: "",
        rating: 0,
        price: 0,
        is_available: true,
        total_order: 0,
        extras: [],
        image: "",
      });
      setIsAddDialogOpen(false);

      toast({
        title: "Success",
        description: "Product added successfully",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to add product",
        variant: "destructive",
      });
    }
  };
  return (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Create a new product for your menu.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
                placeholder="Product name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={newProduct.price || ""}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    price: Number.parseFloat(e.target.value),
                  })
                }
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={newProduct.category}
              onValueChange={(value) =>
                setNewProduct({ ...newProduct, category: value })
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
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={newProduct.description}
              onChange={(e) =>
                setNewProduct({ ...newProduct, description: e.target.value })
              }
              placeholder="Brief description"
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              value={newProduct.image}
              onChange={(e) =>
                setNewProduct({ ...newProduct, image: e.target.value })
              }
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="extras">Extras (optional)</Label>
            <TagInput
              value={newProduct.extras}
              syncTags={(updatedTags) =>
                setNewProduct({ ...newProduct, extras: updatedTags })
              }
              placeholder="Additional options, comma separated"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="rating">Rating (0-5)</Label>
              <Input
                id="rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={newProduct.rating || ""}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    rating: Number.parseFloat(e.target.value),
                  })
                }
                placeholder="0.0"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="total_order">Total Orders</Label>
              <Input
                id="total_order"
                type="number"
                value={newProduct.total_order || ""}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    total_order: Number.parseInt(e.target.value),
                  })
                }
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="available"
              checked={newProduct.is_available}
              onCheckedChange={(checked) =>
                setNewProduct({ ...newProduct, is_available: checked })
              }
            />
            <Label htmlFor="available">Available</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddProduct}>Add Product</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddProductDialog;
