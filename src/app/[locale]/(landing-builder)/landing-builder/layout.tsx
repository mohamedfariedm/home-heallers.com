export default function LandingBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-zinc-100 dark:bg-zinc-950">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(100%_60%_at_50%_0%,rgba(99,102,241,0.08),transparent_65%)] dark:bg-[radial-gradient(100%_55%_at_50%_0%,rgba(99,102,241,0.12),transparent_60%)]"
        aria-hidden
      />
      <div className="relative min-h-[100dvh]">{children}</div>
    </div>
  );
}
