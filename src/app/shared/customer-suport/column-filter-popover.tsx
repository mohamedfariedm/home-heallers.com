'use client';
import { useState, useRef, useEffect } from 'react';
import { PiCaretDownBold } from 'react-icons/pi';

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


export default function ColumnFilterPopover({
  columnKey,
  onFilterChange,
}: {
  columnKey: string;
  onFilterChange: (key: string, value: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const [cond1, setCond1] = useState({ op: 'equal', value: '' });
  const [cond2, setCond2] = useState({ op: 'equal', value: '' });
  const [logic, setLogic] = useState<'and' | 'or'>('and');
  const modalRef = useRef<HTMLDivElement | null>(null);

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

  // notify parent on any change
  useEffect(() => {
    onFilterChange(columnKey, { c1: cond1, c2: cond2, logic });
  }, [cond1, cond2, logic]);

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
              <input
                className="border border-gray-300 rounded-lg px-2 py-2 text-sm w-1/2 focus:ring-2 focus:ring-blue-500"
                placeholder="Value"
                value={cond1.value}
                onChange={(e) => setCond1((s) => ({ ...s, value: e.target.value }))}
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
            <div className="flex items-center gap-2">
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
              <input
                className="border border-gray-300 rounded-lg px-2 py-2 text-sm w-1/2 focus:ring-2 focus:ring-blue-500"
                placeholder="Value"
                value={cond2.value}
                onChange={(e) => setCond2((s) => ({ ...s, value: e.target.value }))}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
