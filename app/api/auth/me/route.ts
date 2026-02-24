import { NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth-utils"

export async function GET() {
  const user = await getUserFromToken()

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  return NextResponse.json({ user })
}

