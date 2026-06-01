import React from 'react';
import { FaUserPlus, FaUsers, FaSearch, FaEllipsisV, FaEnvelope, FaPhone } from 'react-icons/fa';
import styles from './CRMPage.module.css';

export const CRMPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>CRM & Cari Yönetimi</h1>
          <p className={styles.subtitle}>Müşterilerinizi, tedarikçilerinizi ve tüm kontaklarınızı tek bir yerden yönetin.</p>
        </div>
        <button className={styles.addButton}>
          <FaUserPlus /> Yeni Kayıt Ekle
        </button>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><FaUsers /></div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Toplam Cari</span>
            <span className={styles.statValue}>1,248</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><FaUsers /></div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Aktif Müşteriler</span>
            <span className={styles.statValue}>952</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}><FaUsers /></div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Potansiyel</span>
            <span className={styles.statValue}>296</span>
          </div>
        </div>
      </div>

      <div className={styles.contentCard}>
        <div className={styles.tableHeader}>
          <div className={styles.searchBox}>
            <FaSearch />
            <input type="text" placeholder="İsim, e-posta veya telefon ile ara..." />
          </div>
          <div className={styles.filters}>
            <select className={styles.select}>
              <option>Tüm Tipler</option>
              <option>Müşteri</option>
              <option>Tedarikçi</option>
            </select>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Cari Bilgisi</th>
                <th>Tip</th>
                <th>İletişim</th>
                <th>Bakiye</th>
                <th>Durum</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Ahmet Can Bozkurt', type: 'Müşteri', email: 'ahmet@example.com', phone: '+90 555 123 4567', balance: '₺ 12,450', status: 'Aktif' },
                { name: 'Wixi Global Ltd.', type: 'Tedarikçi', email: 'info@wixi.com', phone: '+90 212 999 8877', balance: '-₺ 4,200', status: 'Aktif' },
                { name: 'Mehmet Yılmaz', type: 'Müşteri', email: 'mehmet@test.com', phone: '+90 532 000 1122', balance: '₺ 0', status: 'Beklemede' },
              ].map((item, i) => (
                <tr key={i}>
                  <td>
                    <div className={styles.userInfo}>
                      <div className={styles.avatar}>{item.name.charAt(0)}</div>
                      <div className={styles.userText}>
                        <span className={styles.userName}>{item.name}</span>
                        <span className={styles.userSub}>#C-100{i + 1}</span>
                      </div>
                    </div>
                  </td>
                  <td><span className={styles.badge}>{item.type}</span></td>
                  <td>
                    <div className={styles.contactInfo}>
                      <span><FaEnvelope /> {item.email}</span>
                      <span><FaPhone /> {item.phone}</span>
                    </div>
                  </td>
                  <td className={item.balance.startsWith('-') ? styles.negative : styles.positive}>{item.balance}</td>
                  <td><span className={styles.statusBadge}>{item.status}</span></td>
                  <td><button className={styles.actionBtn}><FaEllipsisV /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
