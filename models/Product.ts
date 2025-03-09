import mongoose, { Schema, type Document } from "mongoose"

export interface IProduct extends Document {
  name: string
  category: string
  description: string
  rating: number
  price: number
  is_available: boolean
  total_order: number
  extras: string[]
  image: string
  createdAt: Date
  updatedAt: Date
}

const ProductSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a product name"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Please provide a category"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
      trim: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    price: {
      type: Number,
      required: [true, "Please provide a price"],
      min: 0,
    },
    is_available: {
      type: Boolean,
      default: true,
    },
    total_order: {
      type: Number,
      default: 0,
    },
    extras: [{
      type: String,
      default: "",
    }],
    image: {
      type: String,
      default: "/placeholder.svg?height=80&width=80",
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema)

