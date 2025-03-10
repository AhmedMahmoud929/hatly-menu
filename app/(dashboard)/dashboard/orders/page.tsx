"use client";

import { useState, useEffect } from "react";
import { ArrowUpDown, MoreHorizontal, Plus, Search, Eye } from "lucide-react";
import { format } from "date-fns";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash } from "lucide-react";
import { IProduct } from "@/types";

interface IOrderProduct {
  _id: string;
  name: string;
  quantity: number;
  size: string;
  pricePerItem: number;
  extras?: string[];
}

export interface IOrder {
  _id: string;
  products: IOrderProduct[];
  customerName: string;
  tableNumber: number;
  totalPrice: number;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

export default function OrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [products, setProducts] = useState<IOrderProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<IOrder | null>(null);
  const [newOrder, setNewOrder] = useState({
    products: [] as { product_name: string; amount: number; price: number }[],
    name: "",
    table_number: 1,
    total: 0,
    status: "pending" as const,
  });
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedAmount, setSelectedAmount] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch orders
        const ordersResponse = await fetch("/api/orders");
        const ordersData = await ordersResponse.json();
        setOrders(ordersData);

        // Fetch products for order creation
        const productsResponse = await fetch("/api/products");
        const productsData = await productsResponse.json();
        setProducts(
          productsData.filter((product: IProduct) => product.is_available)
        );
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

  const filteredOrders = orders?.filter(
    (order) =>
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.tableNumber.toString().includes(searchQuery)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "in-progress":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
    }
  };

  const addProductToOrder = () => {
    if (!selectedProduct) return;

    const product = products.find((p) => p.name === selectedProduct);
    if (!product) return;

    const existingProductIndex = newOrder.products.findIndex(
      (p) => p.product_name === selectedProduct
    );

    if (existingProductIndex >= 0) {
      // Update existing product amount
      const updatedProducts = [...newOrder.products];
      updatedProducts[existingProductIndex].amount += selectedAmount;

      setNewOrder({
        ...newOrder,
        products: updatedProducts,
        total: calculateTotal(updatedProducts),
      });
    } else {
      // Add new product
      const updatedProducts = [
        ...newOrder.products,
        {
          product_name: selectedProduct,
          amount: selectedAmount,
          price: product.quantity * product.pricePerItem,
        },
      ];

      setNewOrder({
        ...newOrder,
        products: updatedProducts,
        total: calculateTotal(updatedProducts),
      });
    }

    // Reset selection
    setSelectedProduct("");
    setSelectedAmount(1);
  };

  const removeProductFromOrder = (index: number) => {
    const updatedProducts = newOrder.products.filter((_, i) => i !== index);
    setNewOrder({
      ...newOrder,
      products: updatedProducts,
      total: calculateTotal(updatedProducts),
    });
  };

  const calculateTotal = (products: { amount: number; price: number }[]) => {
    return products.reduce(
      (sum, product) => sum + product.amount * product.price,
      0
    );
  };

  const handleAddOrder = async () => {
    if (newOrder.products.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one product to the order",
        variant: "destructive",
      });
      return;
    }

    if (!newOrder.name) {
      toast({
        title: "Error",
        description: "Please enter a customer name",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newOrder),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create order");
      }

      const addedOrder = await response.json();
      setOrders([addedOrder, ...orders]);
      setNewOrder({
        products: [],
        name: "",
        table_number: 1,
        total: 0,
        status: "pending",
      });
      setIsAddDialogOpen(false);

      toast({
        title: "Success",
        description: "Order created successfully",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create order",
        variant: "destructive",
      });
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update order status");
      }

      const updatedOrder = await response.json();
      setOrders(
        orders.map((order) => (order._id === orderId ? updatedOrder : order))
      );

      toast({
        title: "Success",
        description: "Order status updated successfully",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">
          Manage and view all your restaurant orders.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>All Orders</CardTitle>
            <CardDescription>
              You have {orders.length} total orders.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search orders..."
                className="w-full pl-8 md:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
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
                  <TableHead className="w-[100px]">
                    <Button variant="ghost" className="p-0 font-medium">
                      Order ID
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" className="p-0 font-medium">
                      Date
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" className="p-0 font-medium">
                      Customer
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">Table</TableHead>
                  <TableHead className="text-center">Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No orders found. Try a different search or create a new
                      order.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders?.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-medium">
                        {order._id.slice(-6).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        {/* {format(new Date(order.createdAt), "EEEE hh:mm a")} */}
                        Wednesday, 10:30 PM
                      </TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell className="text-center">
                        {order.tableNumber}
                      </TableCell>
                      <TableCell className="text-center">
                        {order.products.reduce((sum, p) => sum + p.quantity, 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        ${order.totalPrice.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => {
                                setCurrentOrder(order);
                                setIsViewDialogOpen(true);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() =>
                                updateOrderStatus(order._id, "pending")
                              }
                              disabled={order.status === "pending"}
                            >
                              Set as Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                updateOrderStatus(order._id, "in-progress")
                              }
                              disabled={order.status === "in-progress"}
                            >
                              Set as In Progress
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                updateOrderStatus(order._id, "completed")
                              }
                              disabled={order.status === "completed"}
                            >
                              Set as Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                updateOrderStatus(order._id, "cancelled")
                              }
                              disabled={order.status === "cancelled"}
                            >
                              Set as Cancelled
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Order Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order #{currentOrder?._id.slice(-6).toUpperCase()} -{" "}
              {/* {format(`${currentOrder?.createdAt}`, "EEEE hh:mm a")} */}
              Wednesday, 10:30 PM
            </DialogDescription>
          </DialogHeader>
          {currentOrder && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Customer</Label>
                  <p className="font-medium">{currentOrder.customerName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Table Number</Label>
                  <p className="font-medium">{currentOrder.tableNumber}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground mb-2 block">
                  Status
                </Label>
                <Badge className={`${getStatusColor(currentOrder.status)}`}>
                  {currentOrder.status.charAt(0).toUpperCase() +
                    currentOrder.status.slice(1)}
                </Badge>
              </div>
              <div>
                <Label className="text-muted-foreground mb-2 block">
                  Order Items
                </Label>
                <div className="border rounded-md p-3 space-y-2">
                  {currentOrder.products.map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <div>
                        <span className="font-medium">{product.name}</span>
                        <span className="text-muted-foreground">
                          {" "}
                          x {product.quantity}
                        </span>
                      </div>
                      <span>
                        ${(product.pricePerItem * product.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 mt-2 border-t flex justify-between font-medium">
                    <span>Total:</span>
                    <span>${currentOrder.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
