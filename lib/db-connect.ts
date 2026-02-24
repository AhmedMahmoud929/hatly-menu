import mongoose from "mongoose"
import { getEnv } from "@/lib/env"

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = { bufferCommands: false }
    const uri = getEnv().MONGODB_URI
    cached.promise = mongoose.connect(uri, opts).then((m) => m)
  }
  cached.conn = await cached.promise
  return cached.conn
}

export default dbConnect

