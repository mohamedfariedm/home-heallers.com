'use client';

import { useCallback, useEffect, useReducer } from 'react';
import type { LandingPageConfig } from '@/types/landing-builder';
import {
  DEFAULT_LANDING_CONFIG,
  mergeLandingConfig,
} from '@/lib/landing-builder/defaults';

const LEGACY_STORAGE_KEY = 'landing-builder-config-v1';

type HistoryState = {
  past: LandingPageConfig[];
  present: LandingPageConfig;
  future: LandingPageConfig[];
};

type Action =
  | { type: 'set'; payload: LandingPageConfig }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'hydrate'; payload: LandingPageConfig };

const MAX_PAST = 48;

function historyReducer(state: HistoryState, action: Action): HistoryState {
  switch (action.type) {
    case 'hydrate':
      return { past: [], present: action.payload, future: [] };
    case 'set': {
      if (action.payload === state.present) return state;
      return {
        past: [...state.past, state.present].slice(-MAX_PAST),
        present: action.payload,
        future: [],
      };
    }
    case 'undo': {
      if (!state.past.length) return state;
      const prev = state.past[state.past.length - 1];
      return {
        past: state.past.slice(0, -1),
        present: prev,
        future: [state.present, ...state.future],
      };
    }
    case 'redo': {
      if (!state.future.length) return state;
      const [next, ...rest] = state.future;
      return {
        past: [...state.past, state.present],
        present: next,
        future: rest,
      };
    }
    default:
      return state;
  }
}

function loadLegacySingle(): LandingPageConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return null;
    return mergeLandingConfig(JSON.parse(raw));
  } catch {
    return null;
  }
}

export type UseLandingBuilderOptions = {
  /** Initial config when not loading from localStorage */
  initial?: LandingPageConfig;
  /** When true (default), load/save legacy single-config key (standalone mode) */
  persistLegacy?: boolean;
};

export function useLandingBuilder(options?: UseLandingBuilderOptions) {
  const persistLegacy = options?.persistLegacy !== false;
  const seed = mergeLandingConfig(options?.initial ?? DEFAULT_LANDING_CONFIG);

  const [state, dispatch] = useReducer(historyReducer, undefined, () => {
    if (!persistLegacy) {
      return { past: [], present: seed, future: [] };
    }
    const stored = loadLegacySingle();
    return {
      past: [],
      present: stored ?? seed,
      future: [],
    };
  });

  const setConfig = useCallback((next: LandingPageConfig) => {
    dispatch({ type: 'set', payload: next });
  }, []);

  const undo = useCallback(() => dispatch({ type: 'undo' }), []);
  const redo = useCallback(() => dispatch({ type: 'redo' }), []);

  useEffect(() => {
    if (!persistLegacy) return;
    const t = window.setTimeout(() => {
      try {
        localStorage.setItem(
          LEGACY_STORAGE_KEY,
          JSON.stringify(state.present),
        );
      } catch {
        /* quota */
      }
    }, 400);
    return () => window.clearTimeout(t);
  }, [state.present, persistLegacy]);

  const resetToDefault = useCallback(() => {
    dispatch({ type: 'hydrate', payload: DEFAULT_LANDING_CONFIG });
  }, []);

  const hydrate = useCallback((c: LandingPageConfig) => {
    dispatch({ type: 'hydrate', payload: mergeLandingConfig(c) });
  }, []);

  return {
    config: state.present,
    setConfig,
    undo,
    redo,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    resetToDefault,
    hydrate,
  };
}
