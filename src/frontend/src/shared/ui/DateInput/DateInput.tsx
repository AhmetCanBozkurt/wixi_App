import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './DateInput.module.css';
import { FaCalendarAlt } from 'react-icons/fa';
import { Calendar } from './Calendar';

interface DateInputProps {
  label?: string;
  error?: string;
  value?: string; // YYYY-MM-DD
  onChange?: (date: string) => void;
  containerClassName?: string;
  placeholder?: string;
  required?: boolean;
}

export const DateInput: React.FC<DateInputProps> = ({
  label,
  error,
  value,
  onChange,
  containerClassName = '',
  placeholder = 'Tarih seçin...',
  required,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0, width: 0 });

  const selectedDate = value ? new Date(value) : null;

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
  };

  const handleSelect = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    
    onChange?.(dateStr);
    setIsOpen(false);
  };

  const toggleOpen = () => {
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const calendarWidth = 300; 
      const viewportWidth = window.innerWidth;
      
      let left = rect.left + window.scrollX;
      
      // Sağ kenar kontrolü
      if (rect.left + calendarWidth > viewportWidth) {
        left = viewportWidth - calendarWidth - 20; 
      }
      
      // Sol kenar kontrolü (çok küçük ekranlarda)
      if (left < 0) left = 10;

      setPopoverPos({
        top: rect.bottom + window.scrollY,
        left: left,
        width: rect.width
      });
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        const popover = document.getElementById('calendar-popover');
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
        className={`${styles.inputWrapper} ${error ? styles.hasError : ''} ${isOpen ? styles.active : ''}`}
        onClick={toggleOpen}
      >
        <span className={styles.icon}>
          <FaCalendarAlt size={16} />
        </span>
        <div className={styles.displayValue}>
          {value ? formatDate(selectedDate) : <span className={styles.placeholder}>{placeholder}</span>}
        </div>
      </div>
      
      {isOpen && createPortal(
        <div 
          id="calendar-popover"
          className={styles.popover} 
          style={{ 
            top: `${popoverPos.top + 2}px`, 
            left: `${popoverPos.left}px`,
            position: 'absolute',
            zIndex: 11000
          }}
        >
          <Calendar selectedDate={selectedDate} onSelect={handleSelect} />
        </div>,
        document.body
      )}
      
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};
