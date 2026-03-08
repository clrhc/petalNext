import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await kv.set("keepalive", Date.now());
  return NextResponse.json({ ok: true, timestamp: Date.now() });
}
