import { NextRequest, NextResponse } from "next/server";
import { getBackendErrorMessage } from "@/lib/backend-error";
import { searchAll } from "@/lib/firebase-db";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return NextResponse.json({ data: { products: [], users: [], topics: [] } });
  }

  try {
    const data = await searchAll(query);
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      {
        error: getBackendErrorMessage(error),
        data: { products: [], users: [], topics: [] }
      },
      { status: 503 }
    );
  }
}
