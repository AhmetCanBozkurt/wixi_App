import React, { useState } from 'react';
import styles from './Calendar.module.css';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface CalendarProps {
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
}

type ViewType = 'days' | 'months' | 'years';

export const Calendar: React.FC<CalendarProps> = ({ selectedDate, onSelect }) => {
  const [viewDate, setViewDate] = useState(selectedDate || new Date());
  const [view, setView] = useState<ViewType>('days');

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const monthNames = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ];

  const daysOfWeek = ["Pz", "Pt", "Sa", "Ça", "Pe", "Cu", "Ct"];

  const handlePrev = () => {
    if (view === 'days') setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    if (view === 'months') setViewDate(new Date(viewDate.getFullYear() - 1, viewDate.getMonth(), 1));
    if (view === 'years') setViewDate(new Date(viewDate.getFullYear() - 12, viewDate.getMonth(), 1));
  };

  const handleNext = () => {
    if (view === 'days') setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    if (view === 'months') setViewDate(new Date(viewDate.getFullYear() + 1, viewDate.getMonth(), 1));
    if (view === 'years') setViewDate(new Date(viewDate.getFullYear() + 12, viewDate.getMonth(), 1));
  };

  const handleMonthClick = (mIndex: number) => {
    setViewDate(new Date(viewDate.getFullYear(), mIndex, 1));
    setView('days');
  };

  const handleYearClick = (year: number) => {
    setViewDate(new Date(year, viewDate.getMonth(), 1));
    setView('months');
  };

  const renderDays = () => {
    const totalDays = daysInMonth(viewDate.getFullYear(), viewDate.getMonth());
    const startDay = firstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
    const days = [];

    for (let i = 0; i < startDay; i++) {
        days.push(<div key={`empty-${i}`} className={styles.emptyDay}></div>);
    }

    for (let d = 1; d <= totalDays; d++) {
        const isToday = new Date().toDateString() === new Date(viewDate.getFullYear(), viewDate.getMonth(), d).toDateString();
        const isSelected = selectedDate?.toDateString() === new Date(viewDate.getFullYear(), viewDate.getMonth(), d).toDateString();

        days.push(
            <div 
                key={d} 
                className={`${styles.day} ${isToday ? styles.today : ''} ${isSelected ? styles.selected : ''}`}
                onClick={() => onSelect(new Date(viewDate.getFullYear(), viewDate.getMonth(), d))}
            >
                {d}
            </div>
        );
    }
    return days;
  };

  const renderMonths = () => {
    return monthNames.map((m, i) => (
      <div 
        key={m} 
        className={`${styles.gridItem} ${viewDate.getMonth() === i ? styles.selectedItem : ''}`}
        onClick={() => handleMonthClick(i)}
      >
        {m}
      </div>
    ));
  };

  const renderYears = () => {
    const startYear = viewDate.getFullYear() - 5;
    const years = [];
    for (let i = 0; i < 12; i++) {
      const y = startYear + i;
      years.push(
        <div 
            key={y} 
            className={`${styles.gridItem} ${viewDate.getFullYear() === y ? styles.selectedItem : ''}`}
            onClick={() => handleYearClick(y)}
        >
          {y}
        </div>
      );
    }
    return years;
  };

  return (
    <div className={styles.calendar} onClick={(e) => e.stopPropagation()}>
      <header className={styles.header}>
        <button onClick={handlePrev} className={styles.navBtn}><FaChevronLeft /></button>
        <div className={styles.titleGroup}>
            {view === 'days' && (
                <>
                    <span className={styles.clickable} onClick={() => setView('months')}>{monthNames[viewDate.getMonth()]}</span>
                    <span className={styles.clickable} onClick={() => setView('years')}>{viewDate.getFullYear()}</span>
                </>
            )}
            {view === 'months' && <span className={styles.clickable} onClick={() => setView('years')}>{viewDate.getFullYear()}</span>}
            {view === 'years' && <span>{viewDate.getFullYear() - 5} - {viewDate.getFullYear() + 6}</span>}
        </div>
        <button onClick={handleNext} className={styles.navBtn}><FaChevronRight /></button>
      </header>
      
      {view === 'days' && (
        <>
            <div className={styles.weekDays}>
                {daysOfWeek.map(day => <div key={day} className={styles.weekDay}>{day}</div>)}
            </div>
            <div className={styles.daysGrid}>{renderDays()}</div>
        </>
      )}

      {view === 'months' && <div className={styles.monthsGrid}>{renderMonths()}</div>}
      
      {view === 'years' && <div className={styles.yearsGrid}>{renderYears()}</div>}

      <div className={styles.footer}>
         <button className={styles.todayBtn} onClick={() => { onSelect(new Date()); setView('days'); }}>Bugün</button>
      </div>
    </div>
  );
};
