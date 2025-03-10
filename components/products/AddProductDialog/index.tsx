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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { IProduct, ProductSize, ProductExtra } from "@/types";
import { Plus, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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

  // New state for sizes and extras
  const [sizes, setSizes] = useState<ProductSize[]>([
    { name: "Regular", price: 0 },
  ]);
  const [extras, setExtras] = useState<ProductExtra[]>([]);
  const [newExtra, setNewExtra] = useState<ProductExtra>({
    name: "",
    price: 0,
  });

  const [newProduct, setNewProduct] = useState<Omit<IProduct, "_id">>({
    name: "",
    category: "",
    description: "",
    rating: 5,
    price: 0,
    is_available: true,
    extras: [],
    image: "",
    sizes: [],
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
      // Update product with current sizes and extras before submission
      const productToSubmit = {
        ...newProduct,
        sizes: sizes,
        extras: extras,
        // Set the base price to the price of the first size if sizes exist
        price: sizes.length > 0 ? sizes[0].price : newProduct.price,
      };

      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productToSubmit),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add product");
      }

      const addedProduct = await response.json();
      handleAddProductLocally(addedProduct);

      // Reset form
      setNewProduct({
        name: "",
        category: "",
        description: "",
        rating: 5,
        price: 0,
        is_available: true,
        extras: [],
        image: "",
        sizes: [],
      });
      setSizes([{ name: "Regular", price: 0 }]);
      setExtras([]);
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

  // Handle size changes
  const handleSizeChange = (
    index: number,
    field: keyof ProductSize,
    value: string | number
  ) => {
    const updatedSizes = [...sizes];
    if (field === "price") {
      updatedSizes[index][field] =
        typeof value === "string" ? Number.parseFloat(value) || 0 : value;
    } else if (field === "name") {
      updatedSizes[index][field] = String(value);
    }
    setSizes(updatedSizes);
  };

  // Add a new size
  const addSize = () => {
    setSizes([...sizes, { name: "", price: 0 }]);
  };

  // Remove a size
  const removeSize = (index: number) => {
    const updatedSizes = [...sizes];
    updatedSizes.splice(index, 1);
    setSizes(updatedSizes);
  };

  // Add a new extra
  const addExtra = () => {
    if (newExtra.name.trim() === "") {
      toast({
        title: "Error",
        description: "Extra name cannot be empty",
        variant: "destructive",
      });
      return;
    }
    setExtras([...extras, { ...newExtra }]);
    setNewExtra({ name: "", price: 0 });
  };

  // Remove an extra
  const removeExtra = (index: number) => {
    const updatedExtras = [...extras];
    updatedExtras.splice(index, 1);
    setExtras(updatedExtras);
  };

  // When it's disabled
  const disabledCondition =
    newProduct.name.trim() === "" ||
    newProduct.category.trim() === "" ||
    newProduct.description.trim() === "" ||
    newProduct.image.trim() === "" ||
    sizes.some((size) => size.name.trim() === "" || size.price <= 0) ||
    extras.some((extra) => extra.name.trim() === "" || extra.price <= 0);

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

          {/* Size Variations Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Size Variations</h3>
                <Button variant="outline" size="sm" onClick={addSize}>
                  <Plus className="h-4 w-4 mr-1" /> Add Size
                </Button>
              </div>

              {sizes.map((size, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[1fr_1fr_auto] gap-4 mb-4 items-end"
                >
                  <div className="grid gap-2">
                    <Label htmlFor={`size-name-${index}`}>Size Name</Label>
                    <Input
                      id={`size-name-${index}`}
                      value={size.name || ""}
                      onChange={(e) =>
                        handleSizeChange(index, "name", e.target.value)
                      }
                      placeholder="e.g., Small, Medium, Large"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`size-price-${index}`}>Price ($)</Label>
                    <Input
                      id={`size-price-${index}`}
                      type="number"
                      step="0.01"
                      value={size.price || ""}
                      onChange={(e) =>
                        handleSizeChange(index, "price", e.target.value)
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => removeSize(index)}
                    disabled={sizes.length <= 1} // Prevent removing all sizes
                  >
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Remove size</span>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Extras Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-4">Product Extras</h3>

                <div className="grid grid-cols-[1fr_1fr_auto] gap-4 mb-4 items-end">
                  <div className="grid gap-2">
                    <Label htmlFor="extra-name">Extra Name</Label>
                    <Input
                      id="extra-name"
                      value={newExtra.name}
                      onChange={(e) =>
                        setNewExtra({ ...newExtra, name: e.target.value })
                      }
                      placeholder="e.g., Extra cheese, Bacon"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="extra-price">Price ($)</Label>
                    <Input
                      id="extra-price"
                      type="number"
                      step="0.01"
                      value={newExtra.price || ""}
                      onChange={(e) =>
                        setNewExtra({
                          ...newExtra,
                          price: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <Button onClick={addExtra} variant="outline">
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>

                {extras.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Added Extras:</h4>
                      {extras.map((extra, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center bg-muted/50 p-2 rounded-md"
                        >
                          <div>
                            <span className="font-medium">{extra.name}</span>
                            <span className="ml-2 text-muted-foreground">
                              ${extra.price.toFixed(2)}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => removeExtra(index)}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Remove extra</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

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
          <Button onClick={handleAddProduct} disabled={disabledCondition}>
            Add Product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddProductDialog;
