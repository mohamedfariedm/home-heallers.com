'use client';

import { useCallback, useReducer } from 'react';
import type { CanvasPage } from '@/types/landing-canvas';
import { mergeCanvasPage } from '@/lib/landing-builder/canvas-defaults';

type HistoryState = {
  past: CanvasPage[];
  present: CanvasPage;
  future: CanvasPage[];
};

type Action =
  | { type: 'set'; payload: CanvasPage }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'hydrate'; payload: CanvasPage };

const MAX_PAST = 48;

function historyReducer(state: HistoryState, action: Action): HistoryState {
  switch (action.type) {
    case 'hydrate':
      return { past: [], present: mergeCanvasPage(action.payload), future: [] };
    case 'set': {
      const next = mergeCanvasPage(action.payload);
      if (JSON.stringify(next) === JSON.stringify(state.present)) return state;
      return {
        past: [...state.past, state.present].slice(-MAX_PAST),
        present: next,
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

export function useCanvasPage(initial: CanvasPage) {
  const [state, dispatch] = useReducer(historyReducer, undefined, () => ({
    past: [],
    present: mergeCanvasPage(initial),
    future: [],
  }));

  const setCanvas = useCallback((next: CanvasPage) => {
    dispatch({ type: 'set', payload: next });
  }, []);

  const undo = useCallback(() => dispatch({ type: 'undo' }), []);
  const redo = useCallback(() => dispatch({ type: 'redo' }), []);
  const hydrate = useCallback((c: CanvasPage) => {
    dispatch({ type: 'hydrate', payload: c });
  }, []);

  return {
    canvas: state.present,
    setCanvas,
    undo,
    redo,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    hydrate,
  };
}
