import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import styles from './ComboBox.module.css';
import { FaChevronDown, FaSearch, FaTimes } from 'react-icons/fa';

interface Option {
  label: string;
  value: string | number;
}

interface ComboBoxProps {
  label?: string;
  options: Option[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  error?: string;
  placeholder?: string;
  leftIcon?: React.ReactNode;
  required?: boolean;
}

export const ComboBox: React.FC<ComboBoxProps> = ({
  label,
  options,
  value,
  onChange,
  error,
  containerClassName = '',
  placeholder = 'Aramak için yazın...',
  leftIcon,
  required,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0, width: 0 });

  const selectedOption = useMemo(() => options.find(opt => opt.value === value), [options, value]);

  // Sync input with selected value when closed or changed
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm(selectedOption?.label || '');
    }
  }, [isOpen, selectedOption, value]);

  const filteredOptions = useMemo(() => {
    // If not open, no need to filter
    if (!isOpen) return options;
    // If input is empty or matches the selected label EXACTLY (meaning user just opened it)
    // show all options.
    if (!searchTerm || (selectedOption && searchTerm === selectedOption.label)) {
      return options;
    }
    // Otherwise filter
    return options.filter(opt => 
      opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm, isOpen, selectedOption]);

  const toggleOpen = () => {
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const dropdownHeight = 260; 
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      let top = rect.bottom + window.scrollY + 4;
      let left = rect.left + window.scrollX;
      
      // Bottom edge check
      if (rect.bottom + dropdownHeight > viewportHeight) {
        top = rect.top + window.scrollY - dropdownHeight - 4;
      }

      // Right edge check
      if (rect.left + rect.width > viewportWidth) {
        left = viewportWidth - rect.width - 20;
      }

      setPopoverPos({
        top: top,
        left: left,
        width: rect.width
      });
      // Clear term to show all on open if not searching
      if (!searchTerm) setSearchTerm('');
    }
    setIsOpen(true);
  };

  const handleSelect = (val: string | number) => {
    onChange?.(val);
    const opt = options.find(o => o.value === val);
    setSearchTerm(opt?.label || '');
    setIsOpen(false);
  };

  const handleBlur = () => {
    // Small delay to allow click on option
    setTimeout(() => {
      // If user typed something and blurred, but didn't select
      // "bulamazsa ilk seçeneği seçsin falan"
      if (isOpen && searchTerm && !selectedOption) {
        if (filteredOptions.length > 0) {
          handleSelect(filteredOptions[0].value);
        } else {
          setSearchTerm(''); // clear if no results
        }
      }
      setIsOpen(false);
    }, 200);
  };

  return (
    <div className={`${styles.container} ${containerClassName}`} ref={containerRef}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.requiredAsterisk}>*</span>}
        </label>
      )}
      
      <div 
        className={`${styles.comboboxWrapper} ${error ? styles.hasError : ''} ${isOpen ? styles.active : ''}`}
        onClick={() => inputRef.current?.focus()}
      >
        <span className={styles.icon}>
          {leftIcon || <FaSearch size={14} />}
        </span>
        <input 
          ref={inputRef}
          type="text"
          className={styles.input}
          placeholder={placeholder}
          value={searchTerm}
          onChange={e => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={toggleOpen}
          onBlur={handleBlur}
        />
        <div className={styles.actions}>
           {searchTerm && (
             <button className={styles.clearBtn} onClick={(e) => {
               e.stopPropagation();
               setSearchTerm('');
               onChange?.('');
             }}>
               <FaTimes />
             </button>
           )}
           <span className={styles.arrow} onClick={(e) => {
             e.stopPropagation();
             setIsOpen(!isOpen);
           }}>
             <FaChevronDown />
           </span>
        </div>
      </div>

      {isOpen && createPortal(
        <div 
          id="combobox-popover"
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
            {filteredOptions.map((opt, idx) => (
              <li 
                key={idx} 
                className={`${styles.optionItem} ${opt.value === value ? styles.selected : ''}`}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevents blur before click
                  handleSelect(opt.value);
                }}
              >
                {opt.label}
              </li>
            ))}
            {filteredOptions.length === 0 && (
              <li className={styles.noData}>Sonuç bulunamadı</li>
            )}
          </ul>
        </div>,
        document.body
      )}

      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};
