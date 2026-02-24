"use server"

import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getEnv } from "@/lib/env"

function getJwtSecret(): string {
  const secret = getEnv().JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_SECRET must be set and at least 32 characters (e.g. in .env.local). Required for login/register and protected routes."
    )
  }
  return secret
}

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
    getJwtSecret(),
    { expiresIn: "7d" },
  )
}

// Verify JWT token
export async function verifyToken(token: string): Promise<UserJwtPayload | null> {
  try {
    return jwt.verify(token, getJwtSecret()) as UserJwtPayload
  } catch {
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
export async function createAuthenticatedResponse(user: UserJwtPayload) {
  const token = await signToken(user)
  const response = NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  })

  response.cookies.set("token", token, {
    secure: getEnv().NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  })

  return response
}

