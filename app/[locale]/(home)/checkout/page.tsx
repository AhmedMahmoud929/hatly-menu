"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Loader, Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useOrder } from "@/contexts/order-context";

export default function OrderPage() {
  const router = useRouter();
  const {
    order,
    updateItemQuantity,
    removeItemFromOrder,
    placeOrder,
    isSubmittingOrder,
  } = useOrder();

  const [name, setName] = useState("");
  const [tableNumber, setTableNumber] = useState("");

  const calculateSubtotal = () => {
    return (
      order?.items.reduce((total, item) => total + item.totalPrice, 0) || 0
    );
  };

  const calculateTax = () => {
    return 2.5;
  };

  if (!order || order.items.length === 0) {
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

        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            Your order is empty. Add some items from the menu.
          </p>
          <Button className="mt-4" onClick={() => router.push("/")}>
            Browse Menu
          </Button>
        </div>
      </div>
    );
  }

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

      <div className="grid gap-8 md:grid-cols-5">
        <div className="md:col-span-3">
          <div className="rounded-lg border">
            <div className="p-4">
              <h2 className="text-xl font-semibold">Order Items</h2>
            </div>
            <Separator />

            {order.items.map((item) => (
              <div key={item._id} className="border-b p-4 last:border-0">
                <div className="w-full flex items-start gap-4">
                  <div className="relative h-20 w-full sm:w-20 overflow-hidden rounded-md">
                    <Image
                      src={item.image || "/placeholder.svg?height=80&width=80"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="w-full flex flex-col-reverse sm:flex-row-reverse">
                    <div className="text-right">
                      <p className="flex gap-1 font-medium">
                        <Image
                          src={"/ksa-currency.svg"}
                          alt="hatly"
                          width={15}
                          height={15}
                          className="brightness-0 invert"
                        />
                        {item.totalPrice.toFixed(2)}
                      </p>
                      <p className="flex gap-0.5 text-sm text-muted-foreground">
                        <Image
                          src={"/ksa-currency.svg"}
                          alt="hatly"
                          width={12}
                          height={12}
                          className="brightness-0 invert opacity-50"
                        />
                        {item.pricePerItem.toFixed(2)} each
                      </p>
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
                      {item.specialInstructions && (
                        <p className="text-sm text-muted-foreground">
                          Note: {item.specialInstructions}
                        </p>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateItemQuantity(item._id, -1)}
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
                            onClick={() => updateItemQuantity(item._id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeItemFromOrder(item._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
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
                <span className="flex gap-1">
                  <Image
                    src={"/ksa-currency.svg"}
                    alt="hatly"
                    width={15}
                    height={15}
                    className="brightness-0 invert"
                  />
                  {calculateSubtotal().toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span className="flex gap-1">
                  <Image
                    src={"/ksa-currency.svg"}
                    alt="hatly"
                    width={15}
                    height={15}
                    className="brightness-0 invert"
                  />
                  {calculateTax().toFixed(2)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span className="flex gap-1">
                  <Image
                    src={"/ksa-currency.svg"}
                    alt="hatly"
                    width={15}
                    height={15}
                    className="brightness-0 invert"
                  />
                  {(calculateSubtotal() + calculateTax()).toFixed(2)}
                </span>
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
                onClick={() =>
                  placeOrder(
                    name,
                    tableNumber,
                    calculateSubtotal() + calculateTax()
                  )
                }
                disabled={
                  !name ||
                  !tableNumber ||
                  order.items.length === 0 ||
                  isSubmittingOrder
                }
              >
                {isSubmittingOrder ? (
                  <Loader className="animate-spin" />
                ) : (
                  "Place Order"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
