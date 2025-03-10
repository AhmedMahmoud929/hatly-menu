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
import { Edit, Loader, Plus, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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

  // State for sizes and extras
  const [sizes, setSizes] = useState<ProductSize[]>([]);
  const [extras, setExtras] = useState<ProductExtra[]>([]);
  const [newExtra, setNewExtra] = useState<ProductExtra>({
    name: "",
    price: 0,
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

  // Initialize sizes and extras when currentProduct changes
  useEffect(() => {
    if (currentProduct) {
      // Initialize sizes with current product sizes or default
      setSizes(
        currentProduct.sizes && currentProduct.sizes.length > 0
          ? [...currentProduct.sizes]
          : [{ name: "Regular", price: currentProduct.price }]
      );

      // Initialize extras with current product extras or empty array
      setExtras(
        Array.isArray(currentProduct.extras) &&
          currentProduct.extras.length > 0 &&
          typeof currentProduct.extras[0] === "object"
          ? [...(currentProduct.extras as ProductExtra[])]
          : []
      );
    }
  }, [currentProduct]);

  const handleEditProduct = async () => {
    if (!currentProduct) return;

    // Set on loading flag
    setIsLoading(true);

    try {
      // Update product with current sizes and extras
      const productToUpdate = {
        ...currentProduct,
        sizes: sizes,
        extras: extras,
        // Set the base price to the price of the first size if sizes exist
        price: sizes.length > 0 ? sizes[0].price : currentProduct.price,
      };

      const response = await fetch(`/api/products/${currentProduct._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productToUpdate),
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
    currentProduct &&
    (currentProduct.name.trim() === "" ||
      currentProduct.category.trim() === "" ||
      currentProduct.description.trim() === "" ||
      currentProduct.image.trim() === "" ||
      sizes.some((size) => size.name.trim() === "" || size.price <= 0) ||
      extras.some((extra) => extra.name.trim() === "" || extra.price <= 0));

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
          <Button
            disabled={isLoading || disabledCondition!}
            onClick={handleEditProduct}
          >
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
