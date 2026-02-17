export type CommentNode = {
  id: string;
  body: string;
  createdAt: string;
  user: { name: string; username: string };
  replies: CommentNode[];
};

export function CommentList({ comments }: { comments: CommentNode[] }) {
  if (comments.length === 0) {
    return <p className="text-sm text-black/60">No comments yet. Be the first to add one.</p>;
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="rounded-xl border border-black/10 bg-white/70 p-4">
          <p className="text-sm text-black/80">{comment.body}</p>
          <p className="mt-2 text-xs text-black/50">
            {comment.user.name} (@{comment.user.username})
          </p>
          {comment.replies.length > 0 && (
            <div className="mt-3 space-y-2 border-l border-black/10 pl-3">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="text-sm text-black/75">
                  {reply.body}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
