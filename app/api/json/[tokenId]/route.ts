import { NextResponse } from "next/server";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

export const runtime = "nodejs";

// Initialize Admin SDK (server-only)
if (!getApps().length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKeyRaw) {
    throw new Error(
      "Missing Firebase Admin environment variables: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY"
    );
  }

  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: privateKeyRaw.replace(/\\n/g, "\n"),
    }),
  });
}

const db: Firestore = getFirestore();

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Origin, Content-Type, Accept",
  };
}

// GET /api/json/[tokenId]
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

    // Firestore DocumentData is a safe, typed alias for JSON-like data
    const metadata = docSnap.data(); // type: FirebaseFirestore.DocumentData

    return NextResponse.json(metadata, {
      headers: {
        ...corsHeaders(),
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : typeof e === "string" ? e : "Unknown error";
    console.error("🔥 Firestore error:", e);
    return NextResponse.json(
      { error: "Server error", message },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}
