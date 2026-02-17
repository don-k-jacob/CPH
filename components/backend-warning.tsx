type BackendWarningProps = {
  title?: string;
  message: string;
};

export function BackendWarning({ title = "Backend unavailable", message }: BackendWarningProps) {
  return (
    <article className="card border border-gold/45 bg-accentSoft/65 p-4">
      <p className="text-sm font-semibold text-accent">{title}</p>
      <p className="mt-1 text-sm text-black/75">{message}</p>
    </article>
  );
}
