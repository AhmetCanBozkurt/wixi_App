import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './Select.module.css';
import { FaChevronDown } from 'react-icons/fa';

interface Option {
  label: string;
  value: string | number;
}

interface SelectProps {
  label?: string;
  options: Option[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  error?: string;
  containerClassName?: string;
  leftIcon?: React.ReactNode;
  placeholder?: string;
  required?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  error,
  containerClassName = '',
  leftIcon,
  placeholder = 'Seçiniz...',
  required,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0, width: 0 });

  const selectedOption = options.find(opt => opt.value === value);

  const toggleOpen = () => {
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const dropdownHeight = 260; // Max expected height
      const viewportHeight = window.innerHeight;
      
      let top = rect.bottom + window.scrollY + 4;
      
      // Bottom edge check
      if (rect.bottom + dropdownHeight > viewportHeight) {
        top = rect.top + window.scrollY - dropdownHeight - 4;
      }

      setPopoverPos({
        top: top,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
    setIsOpen(!isOpen);
  };

  const handleSelect = (val: string | number) => {
    onChange?.(val);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        const popover = document.getElementById('select-popover');
        if (popover && popover.contains(event.target as Node)) return;
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`${styles.container} ${containerClassName}`} ref={containerRef}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.requiredAsterisk}>*</span>}
        </label>
      )}
      
      <div 
        className={`${styles.selectTrigger} ${error ? styles.hasError : ''} ${isOpen ? styles.active : ''}`}
        onClick={toggleOpen}
      >
        {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
        <div className={styles.displayValue}>
          {selectedOption ? selectedOption.label : <span className={styles.placeholder}>{placeholder}</span>}
        </div>
        <span className={styles.arrow}>
          <FaChevronDown />
        </span>
      </div>

      {isOpen && createPortal(
        <div 
          id="select-popover"
          className={styles.popover} 
          style={{ 
            top: `${popoverPos.top}px`, 
            left: `${popoverPos.left}px`,
            width: `${popoverPos.width}px`,
            position: 'absolute',
            zIndex: 11000
          }}
        >
          <ul className={styles.optionsList}>
            {options.map((opt, idx) => (
              <li 
                key={idx} 
                className={`${styles.optionItem} ${opt.value === value ? styles.selected : ''}`}
                onClick={() => handleSelect(opt.value)}
              >
                {opt.label}
              </li>
            ))}
            {options.length === 0 && <li className={styles.noData}>Veri Yok</li>}
          </ul>
        </div>,
        document.body
      )}

      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};
