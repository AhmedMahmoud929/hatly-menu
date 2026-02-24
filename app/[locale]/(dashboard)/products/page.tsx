"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowUpDown, Search, Trash, Star } from "lucide-react";

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
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import AddProductDialog from "@/components/products/AddProductDialog";
import { IProduct } from "@/types";
import EditProductDialog from "@/components/products/EditProductDialog";
import { useLocale } from "next-intl";
import { Locale } from "@/i18n/routing";

export default function ProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<IProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const locale = useLocale() as Locale;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products
        const productsResponse = await fetch("/api/products", {
          headers: {
            "Accept-Language": locale,
          },
        });
        const productsData = await productsResponse.json();
        setProducts(productsData);
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

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteProduct = async () => {
    if (!currentProduct) return;

    try {
      const response = await fetch(`/api/products/${currentProduct._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete product");
      }

      setProducts(
        products.filter((product) => product._id !== currentProduct._id)
      );
      setIsDeleteDialogOpen(false);

      toast({
        title: "Success",
        description: "Product deleted successfully",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const renderRatingStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor(rating)
                ? "text-yellow-400 fill-yellow-400"
                : i < rating
                ? "text-yellow-400 fill-yellow-400 opacity-50"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-muted-foreground">
          ({rating.toFixed(1)})
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <p className="text-muted-foreground">Manage your menu products.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>All Products</CardTitle>
            <CardDescription>
              You have {products.length} total products.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="w-full pl-8 md:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <AddProductDialog
              handleAddProductLocally={(addedProduct) =>
                setProducts([...products, addedProduct])
              }
            />
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
                  <TableHead className="w-[200px]">
                    <Button variant="ghost" className="p-0 font-medium">
                      Name
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="min-w-[200px] hidden md:table-cell">
                    Description
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" className="p-0 font-medium">
                      Category
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="hidden md:table-cell">Rating</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No products found. Try a different search or add a new
                      product.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>
                        <div className="h-10 w-10 relative rounded-md overflow-hidden">
                          <Image
                            src={
                              product.image ||
                              "/placeholder.svg?height=40&width=40"
                            }
                            alt={product.name}
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
                        {product.name}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="line-clamp-2 text-sm">
                          {product.description}
                        </div>
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell className="text-right">
                        ${product.price.toFixed(2)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {renderRatingStars(product.rating)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            product.is_available
                              ? "bg-green-500/10 text-green-500"
                              : "bg-gray-500/10 text-gray-500"
                          }`}
                        >
                          {product.is_available ? "Available" : "Unavailable"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          {/* FIXME: Make that dialog recieves the updated product */}
                          {/* <EditProductDialog
                            currentProduct={currentProduct}
                            product={product}
                            setCurrentProduct={setCurrentProduct}
                            updateProductLocally={(updatedProduct) =>
                              setProducts(
                                products.map((product) =>
                                  product._id === currentProduct?._id
                                    ? updatedProduct
                                    : product
                                )
                              )
                            }
                          /> */}
                          <Dialog
                            open={
                              isDeleteDialogOpen &&
                              currentProduct?._id === product._id
                            }
                            onOpenChange={(open) => {
                              setIsDeleteDialogOpen(open);
                              if (!open) setCurrentProduct(null);
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setCurrentProduct(product)}
                              >
                                <Trash className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete Product</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete this product?
                                  This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              {currentProduct && (
                                <div className="py-4">
                                  <p className="text-sm font-medium">
                                    You are about to delete:{" "}
                                    <span className="font-bold">
                                      {currentProduct.name}
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
                                  disabled={!currentProduct}
                                  onClick={handleDeleteProduct}
                                >
                                  Delete Product
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
