import { NextRequest, NextResponse } from "next/server";
import { getBackendErrorMessage } from "@/lib/backend-error";
import { getFeedLaunches } from "@/lib/firebase-db";
import { rankLaunches } from "@/lib/ranking";

export async function GET(request: NextRequest) {
  try {
    const topic = request.nextUrl.searchParams.get("topic") ?? undefined;
    const launches = await getFeedLaunches(topic);

    const ranked = rankLaunches(
      launches.map((launch) => ({
        id: launch.id,
        launchDate: launch.launchDate,
        product: {
          id: launch.product.id,
          slug: launch.product.slug,
          name: launch.product.name,
          tagline: launch.product.tagline,
          maker: launch.product.maker
            ? {
                id: launch.product.maker.id,
                name: launch.product.maker.name,
                username: launch.product.maker.username
              }
            : null,
          topics: launch.product.topics.map((topicItem) => ({
            id: topicItem.id,
            name: topicItem.name,
            slug: topicItem.slug
          }))
        },
        _count: launch._count
      }))
    ).map((item, index) => ({
      rank: index + 1,
      score: item.score,
      launchId: item.launch.id,
      launchDate: item.launch.launchDate,
      product: item.launch.product,
      metrics: item.launch._count
    }));

    return NextResponse.json({ data: ranked });
  } catch (error) {
    return NextResponse.json({ error: getBackendErrorMessage(error), data: [] }, { status: 503 });
  }
}
