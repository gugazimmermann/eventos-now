import { NextResponse } from 'next/server';
import { authLogger } from "@/lib/logger";

export async function POST() {
  authLogger.info("Logout requested");
  const response = NextResponse.json({ success: true });
  response.cookies.set('eventosnow-auth-token', '', { path: '/', expires: new Date(0) });
  return response;
}
