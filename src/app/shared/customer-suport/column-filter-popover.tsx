'use client';
import { useState, useRef, useEffect } from 'react';
import { PiCaretDownBold } from 'react-icons/pi';
import {
  getKanbanColumnSelectPlaceholder,
  getKanbanStaticSelectOptions,
} from './kanban-column-select-options';

const operators = [
  { label: 'Equals', value: 'equal' },
  { label: 'Does not equal', value: 'not_equal' },
  { label: 'Contains data', value: 'has' },
  { label: 'Does not contain data', value: 'not_has' },
  { label: 'Contains', value: 'contain' },
  { label: 'Does not contain', value: 'not_contain' },
  { label: 'Begins with', value: 'begin_with' },
  { label: 'Does not begin with', value: 'not_begin_with' },
  { label: 'Ends with', value: 'end_with' },
  { label: 'Does not end with', value: 'not_end_with' },
];

const selectClassName =
  'border border-gray-300 rounded-lg px-2 py-2 text-sm w-1/2 focus:ring-2 focus:ring-blue-500';

function FilterValueControl({
  columnKey,
  value,
  onChange,
  offerOptions,
  offerOptionsLoading,
}: {
  columnKey: string;
  value: string;
  onChange: (value: string) => void;
  offerOptions?: { label: string; value: string }[];
  offerOptionsLoading?: boolean;
}) {
  const placeholder = getKanbanColumnSelectPlaceholder(columnKey);
  const staticOptions = getKanbanStaticSelectOptions(columnKey);

  if (offerOptions !== undefined) {
    return (
      <select
        className={selectClassName}
        value={value}
        disabled={offerOptionsLoading}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{offerOptionsLoading ? 'Loading...' : placeholder}</option>
        {(offerOptions || []).map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  if (staticOptions) {
    return (
      <select className={selectClassName} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{placeholder}</option>
        {staticOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      className={selectClassName}
      placeholder="Value"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export default function ColumnFilterPopover({
  columnKey,
  onFilterChange,
  initialValue,
  offerOptions,
  offerOptionsLoading,
}: {
  columnKey: string;
  onFilterChange: (key: string, value: any) => void;
  initialValue?: { c1?: { op: string; value: string }; c2?: { op: string; value: string }; logic?: 'and' | 'or' };
  offerOptions?: { label: string; value: string }[];
  offerOptionsLoading?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [cond1, setCond1] = useState({ 
    op: initialValue?.c1?.op || 'equal', 
    value: initialValue?.c1?.value || '' 
  });
  const [cond2, setCond2] = useState({ 
    op: initialValue?.c2?.op || 'equal', 
    value: initialValue?.c2?.value || '' 
  });
  const [logic, setLogic] = useState<'and' | 'or'>(initialValue?.logic || 'and');
  const modalRef = useRef<HTMLDivElement | null>(null);
  const isInitializing = useRef(true);
  const lastInitialValue = useRef<string | null>(null);
  const prevValues = useRef<{ cond1: { op: string; value: string }; cond2: { op: string; value: string }; logic: 'and' | 'or' } | null>(null);
  const hasMounted = useRef(false);
  const onFilterChangeRef = useRef(onFilterChange);
  
  // Keep ref updated without causing re-renders
  useEffect(() => {
    onFilterChangeRef.current = onFilterChange;
  }, [onFilterChange]);

  // Initialize on mount
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      if (initialValue) {
        const newCond1 = { 
          op: initialValue.c1?.op || 'equal', 
          value: initialValue.c1?.value || '' 
        };
        const newCond2 = { 
          op: initialValue.c2?.op || 'equal', 
          value: initialValue.c2?.value || '' 
        };
        const newLogic = initialValue.logic || 'and';
        
        setCond1(newCond1);
        setCond2(newCond2);
        setLogic(newLogic);
        prevValues.current = { cond1: newCond1, cond2: newCond2, logic: newLogic };
      }
      lastInitialValue.current = JSON.stringify(initialValue);
      setTimeout(() => {
        isInitializing.current = false;
      }, 100);
    }
  }, []);

  // Update state when initialValue changes (only if it's different and after mount)
  useEffect(() => {
    if (!hasMounted.current) return;
    
    const currentInitial = JSON.stringify(initialValue || null);
    
    if (currentInitial !== lastInitialValue.current) {
      lastInitialValue.current = currentInitial;
      isInitializing.current = true;
      
      if (initialValue && (initialValue.c1?.value || initialValue.c2?.value)) {
        const newCond1 = { 
          op: initialValue.c1?.op || 'equal', 
          value: initialValue.c1?.value || '' 
        };
        const newCond2 = { 
          op: initialValue.c2?.op || 'equal', 
          value: initialValue.c2?.value || '' 
        };
        const newLogic = initialValue.logic || 'and';
        
        setCond1(newCond1);
        setCond2(newCond2);
        setLogic(newLogic);
        prevValues.current = { cond1: newCond1, cond2: newCond2, logic: newLogic };
      } else {
        // Clear all values
        const emptyCond = { op: 'equal', value: '' };
        setCond1(emptyCond);
        setCond2(emptyCond);
        setLogic('and');
        prevValues.current = { cond1: emptyCond, cond2: emptyCond, logic: 'and' };
      }
      
      setTimeout(() => {
        isInitializing.current = false;
      }, 100);
    }
  }, [initialValue]);

  // close modal when clicking outside or pressing Esc
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) setOpen(false);
    };
    const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    if (open) {
      document.addEventListener('click', handleClick);
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open]);

  // Handle save button click
  const handleSave = () => {
    onFilterChangeRef.current(columnKey, { c1: cond1, c2: cond2, logic });
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className="ml-1 flex items-center justify-center rounded-full p-1.5 text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-800"
        title="Advanced Filter"
      >
        <PiCaretDownBold className="w-3.5 h-3.5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div
            ref={modalRef}
            className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 p-6 mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
            >
              ✕
            </button>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Filter – {columnKey.replace(/_/g, ' ')}
            </h3>

            {/* Condition 1 */}
            <div className="flex items-center gap-2 mb-4">
              <select
                className="border border-gray-300 rounded-lg px-2 py-2 text-sm w-1/2 focus:ring-2 focus:ring-blue-500"
                value={cond1.op}
                onChange={(e) => setCond1((s) => ({ ...s, op: e.target.value }))}
              >
                {operators.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>
              <FilterValueControl
                columnKey={columnKey}
                value={cond1.value}
                onChange={(v) => setCond1((s) => ({ ...s, value: v }))}
                offerOptions={offerOptions}
                offerOptionsLoading={offerOptionsLoading}
              />
            </div>

            {/* Logic */}
            <div className="flex justify-center gap-6 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`logic-${columnKey}`}
                  value="and"
                  checked={logic === 'and'}
                  onChange={() => setLogic('and')}
                  className="accent-blue-600 w-4 h-4"
                />
                <span className="text-gray-700 font-medium">AND</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`logic-${columnKey}`}
                  value="or"
                  checked={logic === 'or'}
                  onChange={() => setLogic('or')}
                  className="accent-blue-600 w-4 h-4"
                />
                <span className="text-gray-700 font-medium">OR</span>
              </label>
            </div>

            {/* Condition 2 */}
            <div className="flex items-center gap-2 mb-4">
              <select
                className="border border-gray-300 rounded-lg px-2 py-2 text-sm w-1/2 focus:ring-2 focus:ring-blue-500"
                value={cond2.op}
                onChange={(e) => setCond2((s) => ({ ...s, op: e.target.value }))}
              >
                {operators.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>
              <FilterValueControl
                columnKey={columnKey}
                value={cond2.value}
                onChange={(v) => setCond2((s) => ({ ...s, value: v }))}
                offerOptions={offerOptions}
                offerOptionsLoading={offerOptionsLoading}
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
