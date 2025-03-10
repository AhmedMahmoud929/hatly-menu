import mongoose, { Schema, type Document } from "mongoose";

interface IOrderProduct {
  _id: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  size: string;
  pricePerItem: number;
  extras?: string[];
}

export interface IOrder extends Document {
  products: IOrderProduct[];
  customerName: string;
  tableNumber: number;
  totalPrice: number;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const OrderProductSchema = new Schema<IOrderProduct>({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  pricePerItem: {
    type: Number,
    required: true,
    min: 0,
  },
  extras: [
    {
      type: String,
    },
  ],
  size: {
    type: String,
    requried: true,
  },
});

const OrderSchema: Schema = new Schema(
  {
    products: {
      type: [OrderProductSchema],
      required: [true, "Please provide at least one product"],
    },
    customerName: {
      type: String,
      required: [true, "Please provide a customer name"],
      trim: true,
    },
    tableNumber: {
      type: Number,
      required: [true, "Please provide a table number"],
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Order ||
  mongoose.model<IOrder>("Order", OrderSchema);
