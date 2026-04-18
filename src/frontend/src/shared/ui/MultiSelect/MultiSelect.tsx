import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaChevronDown } from 'react-icons/fa';
import styles from './MultiSelect.module.css';

export interface MultiSelectOption {
  label: string;
  value: string;
}

interface MultiSelectProps {
  label?: string;
  options: MultiSelectOption[];
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  error?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  values,
  onChange,
  placeholder = 'Seçiniz...',
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0, width: 0 });

  const selected = useMemo(() => {
    const set = new Set(values);
    return options.filter(o => set.has(o.value));
  }, [options, values]);

  const computePosition = () => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Estimate popover height based on option count (cap at 280px)
    const rowH = 42;
    const footerH = 52;
    const estimated = Math.min(280, options.length * rowH + footerH);

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Prefer opening downward if there's decent space; otherwise open upward.
    const openDown = spaceBelow >= Math.min(estimated, 180) || spaceBelow >= spaceAbove;

    let top = openDown ? rect.bottom + 4 : rect.top - estimated - 4;
    let left = rect.left;

    if (left + rect.width > viewportWidth) {
      left = Math.max(12, viewportWidth - rect.width - 12);
    }

    // Clamp within viewport a bit
    top = Math.max(8, Math.min(top, viewportHeight - 8 - estimated));

    setPopoverPos({ top, left, width: rect.width });
  };

  const toggleOpen = () => {
    if (!isOpen) computePosition();
    setIsOpen(o => !o);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && containerRef.current.contains(event.target as Node)) return;
      const popover = document.getElementById('multiselect-popover');
      if (popover && popover.contains(event.target as Node)) return;
      setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const onScrollOrResize = () => computePosition();
    window.addEventListener('resize', onScrollOrResize);
    // capture scroll from modals/containers too
    window.addEventListener('scroll', onScrollOrResize, true);
    return () => {
      window.removeEventListener('resize', onScrollOrResize);
      window.removeEventListener('scroll', onScrollOrResize, true);
    };
  }, [isOpen, options.length]);

  const toggleValue = (v: string) => {
    const set = new Set(values);
    if (set.has(v)) set.delete(v);
    else set.add(v);
    onChange(Array.from(set));
  };

  return (
    <div className={styles.container} ref={containerRef}>
      {label && <label className={styles.label}>{label}</label>}

      <div className={styles.trigger} onClick={toggleOpen}>
        <div className={styles.value}>
          {selected.length === 0 ? (
            <span className={styles.placeholder}>{placeholder}</span>
          ) : (
            selected.map(s => (
              <span key={s.value} className={styles.chip}>{s.label}</span>
            ))
          )}
        </div>
        <FaChevronDown />
      </div>

      {isOpen && createPortal(
        <div
          id="multiselect-popover"
          className={styles.popover}
          style={{
            top: `${popoverPos.top}px`,
            left: `${popoverPos.left}px`,
            width: `${popoverPos.width}px`,
            position: 'fixed',
            zIndex: 11000,
          }}
        >
          {options.map(opt => {
            const checked = values.includes(opt.value);
            return (
              <div key={opt.value} className={styles.item} onMouseDown={(e) => {
                e.preventDefault();
                toggleValue(opt.value);
              }}>
                <input type="checkbox" checked={checked} readOnly />
                <span>{opt.label}</span>
              </div>
            );
          })}
          <div className={styles.footerRow}>
            <button className={styles.btn} type="button" onMouseDown={(e) => {
              e.preventDefault();
              onChange([]);
            }}>Temizle</button>
            <button className={styles.btn} type="button" onMouseDown={(e) => {
              e.preventDefault();
              setIsOpen(false);
            }}>Kapat</button>
          </div>
        </div>,
        document.body
      )}

      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};

