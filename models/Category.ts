import mongoose, { Schema, type Document } from "mongoose"

export interface ICategory extends Document {
  name: string
  image: string
  createdAt: Date
  updatedAt: Date
}

const CategorySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a category name"],
      unique: true,
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Please provide an image URL"],
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

// Check if the model is already defined to prevent overwriting during hot reloads
export default mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema)

