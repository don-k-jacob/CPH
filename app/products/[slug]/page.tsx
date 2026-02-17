import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CommentForm } from "@/components/comment-form";
import { CommentList, type CommentNode } from "@/components/comment-list";
import { UpvoteButton } from "@/components/upvote-button";
import { BackendWarning } from "@/components/backend-warning";
import { getBackendErrorMessage } from "@/lib/backend-error";
import { getProductPageBySlug } from "@/lib/firebase-db";

export const dynamic = "force-dynamic";

function getYoutubeVideoId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const data = await getProductPageBySlug(slug);

    if (!data || !data.maker) {
      notFound();
    }

    const comments: CommentNode[] = data.comments.map((comment) => ({
      id: comment.id,
      body: comment.body,
      createdAt: comment.createdAt,
      user: {
        name: comment.user?.name ?? "Unknown",
        username: comment.user?.username ?? "unknown"
      },
      replies: comment.replies.map((reply) => ({
        id: reply.id,
        body: reply.body,
        createdAt: reply.createdAt,
        user: {
          name: reply.user?.name ?? "Unknown",
          username: reply.user?.username ?? "unknown"
        },
        replies: []
      }))
    }));

    return (
      <section className="space-y-8">
        <article className="card p-4 sm:p-6 md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/45">Product launch</p>
          <h1 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl md:text-4xl" style={{ fontFamily: "var(--font-display)" }}>
            {data.product.name}
          </h1>
          <p className="mt-3 text-xl leading-snug text-black/80">{data.product.tagline}</p>
          <p className="mt-4 max-w-3xl leading-relaxed text-black/70">{data.product.description}</p>
          {data.media.length > 0 ? (
            <div className="mt-6 grid gap-3 grid-cols-1 md:grid-cols-2">
              {data.media.map((media) => {
                if (media.type === "VIDEO") {
                  const ytId = getYoutubeVideoId(media.url);
                  if (ytId) {
                    return (
                      <div key={media.id} className="aspect-video w-full overflow-hidden rounded-xl border border-black/10 bg-black">
                        <iframe
                          src={`https://www.youtube.com/embed/${ytId}`}
                          title="YouTube video"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="h-full w-full"
                        />
                      </div>
                    );
                  }
                  return (
                    <video key={media.id} src={media.url} controls className="w-full rounded-xl border border-black/10 bg-black" />
                  );
                }
                return (
                  <Image
                    key={media.id}
                    src={media.url}
                    alt={`${data.product.name} media`}
                    width={900}
                    height={600}
                    className="h-auto w-full rounded-xl border border-black/10 object-cover"
                  />
                );
              })}
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-2">
            {data.topics.map((topic) => (
              <Link
                href={`/topics/${topic.slug}`}
                key={topic.id}
                className="rounded-full border border-black/10 bg-white/60 px-3 py-1.5 text-xs font-medium transition-colors hover:border-accent/30 hover:bg-accentSoft/50"
              >
                {topic.name}
              </Link>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href={data.product.websiteUrl}
              target="_blank"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-black/15 bg-white/60 px-5 py-2.5 text-sm font-semibold transition-colors hover:border-black/25 hover:bg-white/80"
            >
              Visit Website
            </Link>
            <Link href={`/makers/${data.maker.username}`} className="flex min-h-[44px] items-center text-sm text-black/70 transition-colors hover:text-accent">
              by {data.maker.name}
            </Link>
            {data.launch ? <UpvoteButton launchId={data.launch.id} initialCount={data.launch._count.upvotes} /> : null}
          </div>
        </article>

        <section id="discussion" className="card space-y-5 p-4 sm:p-6 md:p-8">
          <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Discussion
          </h2>
          {data.launch ? <CommentForm launchId={data.launch.id} /> : <p className="text-sm text-black/60">No live launch discussion yet.</p>}
          <CommentList comments={comments} />
        </section>
      </section>
    );
  } catch (error) {
    return (
      <section className="space-y-4">
        <h1 className="text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          Product
        </h1>
        <BackendWarning message={getBackendErrorMessage(error)} />
      </section>
    );
  }
}
