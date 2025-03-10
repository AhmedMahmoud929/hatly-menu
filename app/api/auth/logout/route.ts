import { NextResponse } from "next/server";
import { removeTokenCookie } from "@/lib/auth-utils";

export async function POST() {
  await removeTokenCookie();

  return NextResponse.json({ message: "Logged out successfully" });
}
