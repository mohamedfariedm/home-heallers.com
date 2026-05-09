export default function LandingBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-[100dvh] bg-zinc-100 dark:bg-zinc-950">{children}</div>;
}
