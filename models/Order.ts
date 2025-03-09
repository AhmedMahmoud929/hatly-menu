import mongoose, { Schema, type Document } from "mongoose"

interface IOrderProduct {
  product_name: string
  amount: number
  price: number
}

export interface IOrder extends Document {
  products: IOrderProduct[]
  name: string
  table_number: number
  total: number
  status: "pending" | "in-progress" | "completed" | "cancelled"
  createdAt: Date
  updatedAt: Date
}

const OrderProductSchema = new Schema({
  product_name: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
})

const OrderSchema: Schema = new Schema(
  {
    products: {
      type: [OrderProductSchema],
      required: [true, "Please provide at least one product"],
    },
    name: {
      type: String,
      required: [true, "Please provide a customer name"],
      trim: true,
    },
    table_number: {
      type: Number,
      required: [true, "Please provide a table number"],
      min: 1,
    },
    total: {
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
  },
)

export default mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema)

