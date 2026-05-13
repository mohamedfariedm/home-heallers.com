'use client';

import { motion } from 'framer-motion';

const easeOrb = [0.42, 0, 0.58, 1] as const;

type Props = {
  /** When true, render a calm static background only. */
  reducedMotion: boolean;
};

/** Keyframes injected once — CSS drives mesh / spin / grid so motion always runs in the browser. */
const KEYFRAMES_CSS = `
@keyframes lb-mesh-a {
  0%, 100% { transform: translate(0%, 0%) rotate(0deg) scale(1); }
  33% { transform: translate(-12%, 8%) rotate(2deg) scale(1.08); }
  66% { transform: translate(8%, -6%) rotate(-1.5deg) scale(1.04); }
}
@keyframes lb-mesh-b {
  0%, 100% { transform: translate(0%, 0%) scale(1); }
  50% { transform: translate(10%, -12%) scale(1.12); }
}
@keyframes lb-conic-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes lb-grid-drift {
  0% { background-position: 0 0, 0 0; }
  100% { background-position: 80px 80px, 80px 80px; }
}
@keyframes lb-shimmer {
  0%, 100% { opacity: 0.06; transform: translateX(-20%) skewX(-14deg); }
  50% { opacity: 0.22; transform: translateX(25%) skewX(-14deg); }
}
`;

export function LandingBuilderAnimatedBackdrop({ reducedMotion }: Props) {
  if (reducedMotion) {
    return (
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-zinc-50 dark:bg-zinc-950"
        aria-hidden
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-30%,rgba(99,102,241,0.2),transparent_55%)] dark:bg-[radial-gradient(ellipse_120%_80%_at_50%_-25%,rgba(129,140,248,0.24),transparent_50%)]" />
        <div className="absolute -right-24 top-1/3 h-[420px] w-[420px] rounded-full bg-violet-400/14 blur-3xl dark:bg-violet-500/18" />
        <div className="absolute -left-32 bottom-0 h-[360px] w-[360px] rounded-full bg-indigo-400/12 blur-3xl dark:bg-indigo-500/14" />
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES_CSS }} />
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-zinc-50 dark:bg-zinc-950"
        aria-hidden
      >
        {/* Large mesh planes — transform animation (always visible) */}
        <div className="absolute -inset-[35%] opacity-70 dark:opacity-60">
          <div
            className="absolute inset-0 will-change-transform"
            style={{
              background:
                'linear-gradient(125deg, rgba(99,102,241,0.45) 0%, rgba(167,139,250,0.35) 28%, rgba(244,114,182,0.3) 55%, rgba(56,189,248,0.22) 82%, rgba(99,102,241,0.25) 100%)',
              backgroundSize: '120% 120%',
              animation: 'lb-mesh-a 18s ease-in-out infinite',
            }}
          />
        </div>
        <div className="absolute -inset-[30%] opacity-55 dark:opacity-50 mix-blend-multiply dark:mix-blend-screen">
          <div
            className="absolute inset-0 will-change-transform"
            style={{
              background:
                'linear-gradient(300deg, rgba(34,211,238,0.28) 0%, transparent 38%, rgba(192,132,252,0.32) 62%, transparent 100%)',
              backgroundSize: '140% 140%',
              animation: 'lb-mesh-b 24s ease-in-out infinite',
            }}
          />
        </div>

        {/* Conic wash — centered wrapper + inner spin */}
        <div className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2">
          <div
            className="h-[min(160vmax,2000px)] w-[min(160vmax,2000px)] opacity-60 dark:opacity-50 will-change-transform"
            style={{
              background:
                'conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(99,102,241,0.35) 50deg, transparent 115deg, rgba(217,70,239,0.28) 185deg, transparent 245deg, rgba(56,189,248,0.22) 305deg, transparent 360deg)',
              animation: 'lb-conic-spin 42s linear infinite',
            }}
          />
        </div>

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-50 dark:opacity-35"
          style={{
            backgroundImage: `
              linear-gradient(rgba(99,102,241,0.12) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99,102,241,0.12) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
            animation: 'lb-grid-drift 20s linear infinite',
          }}
        />

        {/* Shimmer */}
        <div
          className="absolute -left-[20%] top-0 h-[90%] w-[70%] bg-gradient-to-r from-transparent via-indigo-300/40 to-transparent dark:via-indigo-400/25"
          style={{
            animation: 'lb-shimmer 9s ease-in-out infinite',
          }}
        />

        {/* Orbs — larger travel so movement reads clearly */}
        <motion.div
          className="absolute -right-[8%] top-[12%] h-[min(520px,60vw)] w-[min(520px,60vw)] rounded-full bg-gradient-to-br from-violet-400/50 to-fuchsia-500/35 blur-3xl dark:from-violet-500/45 dark:to-fuchsia-600/35 will-change-transform"
          animate={{
            x: [0, -90, 40, 0],
            y: [0, 55, -35, 0],
            scale: [1, 1.18, 0.92, 1],
          }}
          transition={{ duration: 16, repeat: Infinity, ease: easeOrb }}
        />
        <motion.div
          className="absolute -left-[15%] bottom-[0%] h-[min(480px,55vw)] w-[min(480px,55vw)] rounded-full bg-gradient-to-tr from-indigo-400/45 to-cyan-400/30 blur-3xl dark:from-indigo-500/40 dark:to-cyan-500/28 will-change-transform"
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -70, 45, 0],
            scale: [1, 0.88, 1.14, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: easeOrb }}
        />
        <motion.div
          className="absolute left-[28%] top-[5%] h-[min(320px,42vw)] w-[min(320px,42vw)] rounded-full bg-fuchsia-400/40 blur-3xl dark:bg-fuchsia-500/38 will-change-transform"
          animate={{
            x: [0, 70, -30, 0],
            y: [0, 50, -40, 0],
            opacity: [0.65, 1, 0.55, 0.65],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: easeOrb }}
        />
        <motion.div
          className="absolute right-[15%] bottom-[22%] h-[min(260px,34vw)] w-[min(260px,34vw)] rounded-full bg-indigo-400/38 blur-3xl dark:bg-indigo-400/42 will-change-transform"
          animate={{
            x: [0, -75, 55, 0],
            y: [0, -55, 30, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: easeOrb }}
        />

        {/* Soft vignette only — was washing out the whole scene */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_65%_at_50%_0%,rgba(255,255,255,0.14),transparent_55%)] dark:bg-[radial-gradient(ellipse_85%_55%_at_50%_-5%,rgba(24,24,27,0.35),transparent_55%)]" />
      </div>
    </>
  );
}
