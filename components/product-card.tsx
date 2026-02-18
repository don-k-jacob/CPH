import Link from "next/link";

type ProductCardProps = {
  rank: number;
  launchId: string;
  productSlug: string;
  name: string;
  tagline: string;
  makerName: string;
  topics: { name: string; slug: string }[];
  upvotes: number;
  comments: number;
  score: number;
};

export function ProductCard(props: ProductCardProps) {
  return (
    <article className="card group p-4 sm:p-5 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-6">
        <div className="min-w-0 flex-1">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-black/45">#{props.rank} today</p>
          <Link
            href={`/products/${props.productSlug}`}
            className="block break-words text-xl font-bold leading-tight transition-colors hover:text-accent sm:text-2xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {props.name}
          </Link>
          <p className="mt-2 break-words text-[15px] leading-snug text-black/72">{props.tagline}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {props.topics.map((topic) => (
              <Link
                key={topic.slug}
                href={`/topics/${topic.slug}`}
                className="inline-flex min-h-[36px] items-center rounded-full border border-black/10 bg-white/70 px-3 py-1.5 text-xs font-medium transition-colors hover:border-accent/30 hover:bg-accentSoft/50"
              >
                {topic.name}
              </Link>
            ))}
          </div>
          <p className="mt-3 text-xs text-black/55">by {props.makerName}</p>
        </div>

        <div className="flex shrink-0 items-center gap-4 md:flex-col md:items-end md:gap-3">
          <div className="rounded-xl border border-gold/30 bg-accentSoft/70 px-4 py-2 text-right">
            <div className="text-xl font-bold leading-none text-ink">{props.upvotes}</div>
            <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-black/60">upvotes</div>
          </div>
          <div className="text-xs text-black/55 md:text-right">
            {props.comments} comments
            <span className="mx-2 text-black/30">•</span>
            score {props.score}
          </div>
          <Link href={`/products/${props.productSlug}#discussion`} className="text-xs font-semibold text-accent transition-colors hover:text-accent-hover">
            Join Discussion
          </Link>
        </div>
      </div>
    </article>
  );
}
