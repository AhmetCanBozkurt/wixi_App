import React from 'react';
import { FaTicketAlt, FaFilter, FaReply, FaCheck } from 'react-icons/fa';
import styles from './SupportPage.module.css';

export const SupportPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Destek & Ticket Yönetimi</h1>
        <div className={styles.actions}>
          <button className={styles.filterBtn}><FaFilter /> Filtrele</button>
          <button className={styles.createBtn}><FaTicketAlt /> Yeni Talep</button>
        </div>
      </div>

      <div className={styles.mainLayout}>
        <div className={styles.ticketList}>
          <div className={styles.listHeader}>
            <span>Açık Talepler (12)</span>
          </div>
          {[
            { id: '#TK-450', subject: 'Ödeme Sayfası Hatası', user: 'Ahmet Yılmaz', time: '12dk önce', priority: 'Yüksek' },
            { id: '#TK-449', subject: 'Üyelik İptali Hakkında', user: 'Canan Demir', time: '1s önce', priority: 'Orta' },
            { id: '#TK-448', subject: 'API Bağlantı Sorunu', user: 'Bora Koç', time: '3s önce', priority: 'Kritik' },
          ].map((ticket, i) => (
            <div key={i} className={`${styles.ticketItem} ${i === 0 ? styles.active : ''}`}>
              <div className={styles.ticketMain}>
                <span className={styles.ticketId}>{ticket.id}</span>
                <span className={`${styles.priority} ${styles[ticket.priority.toLowerCase()]}`}>{ticket.priority}</span>
              </div>
              <h4 className={styles.ticketSubject}>{ticket.subject}</h4>
              <div className={styles.ticketFooter}>
                <span>{ticket.user}</span>
                <span>{ticket.time}</span>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.ticketDetail}>
          <div className={styles.detailHeader}>
            <div className={styles.detailTitle}>
              <h3>Ödeme Sayfası Hatası</h3>
              <span className={styles.statusOpen}>Açık</span>
            </div>
            <div className={styles.detailActions}>
              <button className={styles.resolveBtn}><FaCheck /> Çözüldü</button>
            </div>
          </div>

          <div className={styles.chatArea}>
            <div className={styles.message}>
              <div className={styles.messageMeta}>
                <strong>Ahmet Yılmaz</strong> <span>15.05.2024 10:30</span>
              </div>
              <div className={styles.messageContent}>
                Merhaba, ödeme sayfasında kart bilgilerini girdikten sonra 500 hatası alıyorum. Yardımcı olabilir misiniz?
              </div>
            </div>
            <div className={`${styles.message} ${styles.agentMessage}`}>
              <div className={styles.messageMeta}>
                <strong>Destek Ekibi</strong> <span>15.05.2024 10:45</span>
              </div>
              <div className={styles.messageContent}>
                Merhaba Ahmet Bey, konuyla ilgili teknik ekibimiz inceleme başlattı. En kısa sürede döneceğiz.
              </div>
            </div>
          </div>

          <div className={styles.replyArea}>
            <textarea placeholder="Cevabınızı buraya yazın..."></textarea>
            <div className={styles.replyFooter}>
              <button className={styles.sendBtn}><FaReply /> Cevapla</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
