"use server"

import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface UserJwtPayload {
  id: string
  email: string
  name: string
  role: string
}

// Generate JWT token
export async function signToken(user: UserJwtPayload): Promise<string> {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  )
}

// Verify JWT token
export async function verifyToken(token: string): Promise<UserJwtPayload | null> {
  try {
    return jwt.verify(token, JWT_SECRET) as UserJwtPayload
  } catch (error) {
    return null
  }
}

// Get user from token in cookies (server-side)
export async function getUserFromToken(): Promise<UserJwtPayload | null> {
  const token = (await cookies()).get("token")?.value

  if (!token) {
    return null
  }

  return verifyToken(token)
}

// Remove token from cookies (server-side)
export async function removeTokenCookie() {
  (await cookies()).delete("token")
}

// Create authenticated response
export async function createAuthenticatedResponse(user: UserJwtPayload, request: NextRequest) {
  const token = await signToken(user)
  const response = NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  })

  // Set cookie in the response
  response.cookies.set("token", token, {
    secure: process.env.NODE_ENV !== "development",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
    httpOnly: true,
  })

  return response
}

