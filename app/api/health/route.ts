import { NextResponse } from "next/server";
import { firestore } from "@/lib/firebase-admin";
import { getBackendErrorMessage } from "@/lib/backend-error";

export async function GET() {
  try {
    const ping = await firestore.collection("_health").doc("ping").get();
    return NextResponse.json({
      ok: true,
      firestore: ping.exists ? "connected" : "connected",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: getBackendErrorMessage(error),
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}
