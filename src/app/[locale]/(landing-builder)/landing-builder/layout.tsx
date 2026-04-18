export default function LandingBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-[100dvh] overflow-hidden bg-zinc-100 dark:bg-zinc-950">
      {children}
    </div>
  );
}
