"use client";

import { useToast } from "@/hooks/use-toast";
import type React from "react";
import { useState, createContext, useContext, useMemo, useEffect } from "react";
import { toast } from "sonner";

export interface IOrderItem {
  _id: string;
  name: string;
  quantity: number;
  size: string;
  extras: string[];
  specialInstructions?: string;
  pricePerItem: number;
  totalPrice: number;
  image?: string;
}

export interface IOrder {
  items: IOrderItem[];
}

interface OrderContextType {
  order: IOrder | null;
  totalOrderPrice: number;
  isSubmittingOrder: boolean;
  setOrder: (order: IOrder | null) => void;
  addProductToOrder: (product: IOrderItem) => void;
  updateItemQuantity: (itemId: string, change: number) => void;
  removeItemFromOrder: (itemId: string) => void;
  clearOrder: () => void;
  placeOrder: (
    customerName: string,
    tableNumber: string,
    totalPrice: number
  ) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const STORAGE_KEY = "restaurant_order";

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [order, setOrderState] = useState<IOrder | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);
  const { toast } = useToast();

  const totalOrderPrice: number = useMemo(
    () => order?.items.reduce((acc, item) => acc + item.totalPrice, 0) || 0,
    [order]
  );

  const setOrder = (newOrder: IOrder | null) => {
    setOrderState(newOrder);
    if (newOrder) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newOrder));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const addProductToOrder = (product: IOrderItem) => {
    // Generate a unique ID for this specific combination of product, size, and extras
    const uniqueItemId = `${product._id}_${product.size}_${product.extras
      .sort()
      .join("_")}`;

    // Create a copy of the product with the unique ID
    const productWithUniqueId = {
      ...product,
      _id: uniqueItemId,
    };

    if (order) {
      // Check if the item already exists with the same unique ID
      const existingItemIndex = order.items.findIndex(
        (item) => item._id === uniqueItemId
      );

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        const updatedItems = [...order.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + product.quantity,
          totalPrice:
            updatedItems[existingItemIndex].totalPrice + product.totalPrice,
        };

        setOrder({
          items: updatedItems,
        });
      } else {
        // Add new item with the unique ID
        setOrder({
          items: [...order.items, productWithUniqueId],
        });
      }
    } else {
      setOrder({
        items: [productWithUniqueId],
      });
    }
  };

  const updateItemQuantity = (itemId: string, change: number) => {
    if (!order) return;

    const updatedItems = order.items.map((item) => {
      if (item._id === itemId) {
        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) return item; // Don't allow quantity below 1

        return {
          ...item,
          quantity: newQuantity,
          totalPrice: item.pricePerItem * newQuantity,
        };
      }
      return item;
    });

    setOrder({
      ...order,
      items: updatedItems,
    });
  };

  const removeItemFromOrder = (itemId: string) => {
    if (!order) return;

    const updatedItems = order.items.filter((item) => item._id !== itemId);

    setOrder({
      ...order,
      items: updatedItems,
    });
  };

  const clearOrder = () => {
    setOrder(null);
  };

  const placeOrder = (
    customerName: string,
    tableNumber: string,
    totalPrice: number
  ) => {
    setIsSubmittingOrder(true);
    const preparedOrder = {
      customerName,
      tableNumber,
      totalPrice,
      products: order?.items.map((ele) => ({
        _id: ele._id.split("_")[0],
        name: ele.name,
        quantity: ele.quantity,
        size: ele.size,
        pricePerItem: ele.pricePerItem,
        extras: ele.extras,
      })),
    };

    fetch("/api/orders", {
      method: "POST",
      body: JSON.stringify(preparedOrder),
    })
      .then((res) => {
        if (res.ok) {
          clearOrder();
          alert(
            `Order placed! Thank you, ${name}. Your order will be delivered to table ${tableNumber}.`
          );
          toast({
            title: "Order placed successfully",
            variant: "success",
          });
        }
      })
      .catch((err) =>
        toast({
          title: "Something went wrong",
          variant: "destructive",
          description: err.message,
        })
      )
      .finally(() => setIsSubmittingOrder(false));
  };

  useEffect(() => {
    const savedOrder = localStorage.getItem(STORAGE_KEY);
    if (savedOrder) {
      try {
        setOrderState(JSON.parse(savedOrder));
      } catch (error) {
        console.error("Failed to parse saved order:", error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  return (
    <OrderContext.Provider
      value={{
        order,
        totalOrderPrice,
        isSubmittingOrder,
        setOrder,
        addProductToOrder,
        updateItemQuantity,
        removeItemFromOrder,
        clearOrder,
        placeOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrder must be used within an OrderProvider");
  }
  return context;
}
