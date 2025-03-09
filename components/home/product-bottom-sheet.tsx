"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Minus, Plus, Star, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetFooter } from "@/components/ui/sheet";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  tags: string[];
  rating: number;
}

interface ProductBottomSheetProps {
  item: MenuItem;
  open: boolean;
  onClose: () => void;
}

export function ProductBottomSheet({
  item,
  open,
  onClose,
}: ProductBottomSheetProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState("regular");
  const [extras, setExtras] = useState<string[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState("");

  const extraOptions = [
    { id: "extra1", label: "Extra Sugar", price: 1 },
    { id: "extra2", label: "Extra Ice", price: 1 },
    { id: "extra3", label: "Add Honey", price: 2 },
    { id: "extra4", label: "Add Nuts", price: 3 },
  ];

  const handleQuantityChange = (value: number) => {
    if (quantity + value > 0) {
      setQuantity(quantity + value);
    }
  };

  const handleExtraToggle = (extraId: string) => {
    setExtras(
      extras.includes(extraId)
        ? extras.filter((id) => id !== extraId)
        : [...extras, extraId]
    );
  };

  const calculateTotalPrice = () => {
    let total = item.price * quantity;

    // Add price for extras
    extras.forEach((extraId) => {
      const extra = extraOptions.find((e) => e.id === extraId);
      if (extra) {
        total += extra.price * quantity;
      }
    });

    return total;
  };

  const handleAddToOrder = () => {
    // Here you would add the item to the cart/order
    // For now, we'll just close the sheet
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="h-[90vh] overflow-y-auto rounded-t-xl p-0 sm:max-w-md sm:mx-auto bg-background"
      >
        <div className="relative h-56 w-full">
          <Image
            src={item.image || "/placeholder.svg"}
            alt={item.name}
            fill
            className="object-cover"
          />
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-4 rounded-full bg-white/80 backdrop-blur-sm"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <div className="flex items-center gap-2">
              {item.tags.map((tag) => (
                <Badge key={tag} className="bg-primary hover:bg-primary/90">
                  {tag}
                </Badge>
              ))}
            </div>
            <h2 className="text-2xl font-bold text-white">{item.name}</h2>
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < item.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-400 text-gray-400"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="p-6">
          <p className="mb-6 text-muted-foreground">{item.description}</p>

          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-lg font-medium">Size</h3>
              <RadioGroup
                value={size}
                onValueChange={setSize}
                className="flex flex-wrap gap-3"
              >
                <div>
                  <RadioGroupItem
                    value="small"
                    id="small"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="small"
                    className="flex cursor-pointer items-center justify-center rounded-md border-2 border-muted bg-background px-3 py-2 text-center text-sm font-medium ring-offset-background transition-all hover:bg-muted peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary"
                  >
                    Small
                  </Label>
                </div>

                <div>
                  <RadioGroupItem
                    value="regular"
                    id="regular"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="regular"
                    className="flex cursor-pointer items-center justify-center rounded-md border-2 border-muted bg-background px-3 py-2 text-center text-sm font-medium ring-offset-background transition-all hover:bg-muted peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary"
                  >
                    Regular
                  </Label>
                </div>

                <div>
                  <RadioGroupItem
                    value="large"
                    id="large"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="large"
                    className="flex cursor-pointer items-center justify-center rounded-md border-2 border-muted bg-background px-3 py-2 text-center text-sm font-medium ring-offset-background transition-all hover:bg-muted peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary"
                  >
                    Large
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-medium">Extras</h3>
              <div className="space-y-3">
                {extraOptions.map((extra) => (
                  <div
                    key={extra.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={extra.id}
                        checked={extras.includes(extra.id)}
                        onCheckedChange={() => handleExtraToggle(extra.id)}
                      />
                      <label
                        htmlFor={extra.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {extra.label}
                      </label>
                    </div>
                    <span className="text-sm">{extra.price} ر.ق</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-medium">Special Instructions</h3>
              <Textarea
                placeholder="Add a note (e.g. less sugar, no ice)"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="resize-none"
              />
            </div>

            <div>
              <h3 className="mb-3 text-lg font-medium">Quantity</h3>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className="sticky bottom-0 flex-row border-t bg-background p-4">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Back
          </Button>
          <Button
            className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            onClick={handleAddToOrder}
          >
            Add - {calculateTotalPrice()} ر.ق
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
