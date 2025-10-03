import { NextResponse } from "next/server";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

export const runtime = "nodejs";

// ✅ Initialize Admin SDK directly here
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Origin, Content-Type, Accept",
  };
}

// ✅ GET /api/json/[tokenId]
export async function GET(
  _req: Request,
  { params }: { params: { tokenId: string } }
) {
  const tokenId = params.tokenId?.trim();

  if (!tokenId || !/^\d+$/.test(tokenId)) {
    return NextResponse.json({ error: "Invalid tokenId" }, { status: 400 });
  }

  try {
    const docSnap = await db.collection("metadata").doc(tokenId).get();

    if (!docSnap.exists) {
      return NextResponse.json(
        { error: "Metadata not found", tokenId },
        { status: 404, headers: corsHeaders() }
      );
    }

    const metadata = docSnap.data();

    // ✅ Return metadata *exactly* as stored — no wrapping, no extra keys
    return NextResponse.json(metadata, {
      headers: {
        ...corsHeaders(),
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (e: any) {
    console.error("🔥 Firestore error:", e);
    return NextResponse.json(
      { error: "Server error", message: e?.message || e },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// ✅ Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}