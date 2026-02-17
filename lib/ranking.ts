export type RankedLaunchInput = {
  id: string;
  launchDate: string;
  product: {
    id: string;
    slug: string;
    name: string;
    tagline: string;
    maker: {
      id: string;
      name: string;
      username: string;
    } | null;
    topics: { id: string; name: string; slug: string }[];
  };
  _count: { upvotes: number; comments: number };
};

export type RankedLaunch = {
  launch: RankedLaunchInput;
  score: number;
};

export function scoreLaunch(upvotes: number, comments: number, launchDateIso: string): number {
  const launchTime = new Date(launchDateIso).getTime();
  const ageHours = Math.max((Date.now() - launchTime) / 3_600_000, 1);
  const freshnessDecay = 1 / Math.pow(ageHours, 0.2);
  const weightedUpvotes = upvotes * 1.0;
  const commentVelocity = comments * 0.45;
  return Number((weightedUpvotes * freshnessDecay + commentVelocity).toFixed(3));
}

export function rankLaunches(launches: RankedLaunchInput[]): RankedLaunch[] {
  return launches
    .map((launch) => ({
      launch,
      score: scoreLaunch(launch._count.upvotes, launch._count.comments, launch.launchDate)
    }))
    .sort((a, b) => b.score - a.score);
}
