"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function OrderPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [orderItems, setOrderItems] = useState([
    {
      id: "p1",
      name: "Margarita Pizza",
      price: 12.99,
      quantity: 1,
      size: "Medium",
      extras: ["Extra Cheese"],
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: "b1",
      name: "Black Burger King",
      price: 15.99,
      quantity: 2,
      size: "Regular",
      extras: ["Add Bacon"],
      image: "/placeholder.svg?height=80&width=80",
    },
  ]);

  const handleQuantityChange = (id: string, change: number) => {
    setOrderItems(
      orderItems.map((item) => {
        if (item.id === id) {
          const newQuantity = item.quantity + change;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    setOrderItems(orderItems.filter((item) => item.id !== id));
  };

  const calculateSubtotal = () => {
    return orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.1; // 10% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handlePlaceOrder = () => {
    // Here you would submit the order to your backend
    alert(
      `Order placed! Thank you, ${name}. Your food will be delivered to table ${tableNumber}.`
    );
    router.push("/");
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Button
        variant="ghost"
        className="mb-6 flex items-center"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Menu
      </Button>

      <h1 className="mb-6 text-3xl font-bold">Your Order</h1>

      {orderItems.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            Your order is empty. Add some items from the menu.
          </p>
          <Button className="mt-4" onClick={() => router.push("/")}>
            Browse Menu
          </Button>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-5">
          <div className="md:col-span-3">
            <div className="rounded-lg border">
              <div className="p-4">
                <h2 className="text-xl font-semibold">Order Items</h2>
              </div>
              <Separator />

              {orderItems.map((item) => (
                <div key={item.id} className="border-b p-4 last:border-0">
                  <div className="flex items-start gap-4">
                    <div className="relative h-20 w-20 overflow-hidden rounded-md">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Size: {item.size}
                      </p>
                      {item.extras.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Extras: {item.extras.join(", ")}
                        </p>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.id, -1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="rounded-lg border">
              <div className="p-4">
                <h2 className="text-xl font-semibold">Order Summary</h2>
              </div>
              <Separator />

              <div className="space-y-4 p-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${calculateTax().toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="table">Table Number</Label>
                  <Input
                    id="table"
                    placeholder="Enter your table number"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                  />
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={!name || !tableNumber || orderItems.length === 0}
                >
                  Place Order
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
