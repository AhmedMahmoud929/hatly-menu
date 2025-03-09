import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth-utils"

export function GET(request: NextRequest) {
  const user = getUserFromToken(request)

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  return NextResponse.json({ user })
}

