import { NextResponse } from "next/server"
import { removeTokenCookie } from "@/lib/auth-utils"

export function POST() {
  removeTokenCookie()

  return NextResponse.json({ message: "Logged out successfully" })
}

