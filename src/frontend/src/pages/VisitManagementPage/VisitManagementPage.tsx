import React, { useState } from 'react';
import { 
  FaPlus, FaCalendarDay, FaCalendarAlt, FaCalendarCheck, 
  FaListUl, FaChevronLeft, FaChevronRight, FaClock 
} from 'react-icons/fa';
import styles from './VisitManagementPage.module.css';

interface Appointment {
  id: string;
  clientName: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'noshow' | 'cancelled';
  service: string;
  day: number;
}

export const VisitManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'day' | 'month' | 'year' | 'list'>('month');
  
  const statusColors = {
    pending: { bg: '#fef3c7', text: '#d97706', dot: '#f59e0b' },
    confirmed: { bg: '#dbeafe', text: '#2563eb', dot: '#3b82f6' },
    completed: { bg: '#dcfce7', text: '#16a34a', dot: '#10b981' },
    noshow: { bg: '#f1f5f9', text: '#475569', dot: '#64748b' },
    cancelled: { bg: '#fee2e2', text: '#dc2626', dot: '#ef4444' }
  };

  const appointments: Appointment[] = [
    { id: '1', clientName: 'Alice Smith', time: '10:00', status: 'confirmed', service: 'Cari Ziyareti', day: 10 },
    { id: '2', clientName: 'Bob Johnson', time: '14:00', status: 'pending', service: 'Sözleşme Görüşmesi', day: 10 },
    { id: '3', clientName: 'Fatima Zahra', time: '09:00', status: 'confirmed', service: 'Ürün Sunumu', day: 11 },
    { id: '4', clientName: 'Catherine Lee', time: '11:00', status: 'confirmed', service: 'Tahsilat', day: 11 },
    { id: '5', clientName: 'George Kim', time: '10:00', status: 'completed', service: 'Genel Tanıtım', day: 13 },
    { id: '6', clientName: 'Hannah Abbott', time: '16:00', status: 'pending', service: 'Teknik Destek', day: 14 },
  ];

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const renderMonthGrid = () => {
    // Mock days for May 2026
    const days = Array.from({ length: 35 }, (_, i) => i - 4); // Offset for Sunday start
    
    return (
      <div className={styles.calendarGrid}>
        {weekdays.map(d => <div key={d} className={styles.weekday}>{d}</div>)}
        {days.map((d, i) => {
          const dayApts = appointments.filter(a => a.day === d);
          const isOtherMonth = d <= 0 || d > 31;
          const isToday = d === 13;

          return (
            <div key={i} className={`${styles.dayCell} ${isOtherMonth ? styles.otherMonth : ''} ${isToday ? styles.today : ''}`}>
              {!isOtherMonth && <span className={styles.dayNumber}>{d}</span>}
              {dayApts.map(apt => (
                <div 
                  key={apt.id} 
                  className={styles.aptItem}
                  style={{ background: statusColors[apt.status].bg, color: statusColors[apt.status].text }}
                >
                  <div className={styles.dot} style={{ background: statusColors[apt.status].dot }} />
                  {apt.time} {apt.clientName}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  const renderYearGrid = () => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return (
      <div className={styles.yearGrid}>
        {months.map((m, idx) => (
          <div key={m} className={styles.miniCalendar}>
            <div className={styles.miniTitle}>{m} 2026</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
              {Array.from({ length: 30 }, (_, i) => i + 1).map(d => (
                <div key={d} style={{ 
                  fontSize: '0.65rem', 
                  textAlign: 'center', 
                  padding: '2px',
                  background: (idx === 4 && [10, 11, 13, 14].includes(d)) ? '#e0e7ff' : 'transparent',
                  borderRadius: '4px'
                }}>
                  {d}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1>Ziyaret Yönetimi</h1>
          <p>Müşteri ziyaretlerini ve randevularınızı planlayın.</p>
        </div>
        <button className={styles.bookButton}>
          <FaPlus /> Randevu Oluştur
        </button>
      </div>

      <div className={styles.viewTabs}>
        <button className={`${styles.tabBtn} ${activeTab === 'day' ? styles.active : ''}`} onClick={() => setActiveTab('day')}><FaCalendarDay /> Day</button>
        <button className={`${styles.tabBtn} ${activeTab === 'month' ? styles.active : ''}`} onClick={() => setActiveTab('month')}><FaCalendarAlt /> Month</button>
        <button className={`${styles.tabBtn} ${activeTab === 'year' ? styles.active : ''}`} onClick={() => setActiveTab('year')}><FaCalendarCheck /> Year</button>
        <button className={`${styles.tabBtn} ${activeTab === 'list' ? styles.active : ''}`} onClick={() => setActiveTab('list')}><FaListUl /> List</button>
      </div>

      <div className={styles.calendarCard}>
        <div className={styles.calendarHeader}>
          <button className={styles.navBtn}><FaChevronLeft /></button>
          <span className={styles.monthTitle}>
            {activeTab === 'year' ? '2026' : 'May 2026'}
          </span>
          <button className={styles.navBtn}><FaChevronRight /></button>
        </div>

        {activeTab === 'month' && renderMonthGrid()}
        {activeTab === 'year' && renderYearGrid()}
        {activeTab === 'day' && <div style={{ padding: '100px', textAlign: 'center' }}>Günün detaylı saatlik görünümü</div>}
        {activeTab === 'list' && <div style={{ padding: '100px', textAlign: 'center' }}>Randevu listesi tablosu</div>}

        <div className={styles.legend}>
          <div className={styles.legendItem}><div className={styles.dot} style={{ background: '#f59e0b' }} /> Pending</div>
          <div className={styles.legendItem}><div className={styles.dot} style={{ background: '#3b82f6' }} /> Confirmed</div>
          <div className={styles.legendItem}><div className={styles.dot} style={{ background: '#10b981' }} /> Completed</div>
          <div className={styles.legendItem}><div className={styles.dot} style={{ background: '#64748b' }} /> No Show</div>
          <div className={styles.legendItem}><div className={styles.dot} style={{ background: '#ef4444' }} /> Cancelled</div>
          <div className={styles.legendItem} style={{ color: '#ef4444' }}><div className={styles.dot} style={{ background: '#fee2e2' }} /> Public holiday</div>
        </div>
      </div>

      {/* Day Detail Section as in Screenshot 2 */}
      <div className={styles.detailCard}>
        <div className={styles.detailHeader}>
          <h2 className={styles.detailTitle}>Wednesday, May 13</h2>
          <button className={styles.bookButton} style={{ padding: '6px 12px', fontSize: '0.85rem' }}><FaPlus /> Book</button>
        </div>
        <div className={styles.aptListCard}>
          <div className={styles.aptMainInfo} style={{ borderLeft: '4px solid #10b981', paddingLeft: '16px' }}>
            <span className={styles.aptClientName}>George Kim</span>
            <span className={styles.aptService}>Genel Tanıtım Ziyareti</span>
          </div>
          <div className={styles.aptTimeInfo}>
             <FaClock /> 10:00 AM
          </div>
        </div>
      </div>
    </div>
  );
};
