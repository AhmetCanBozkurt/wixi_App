import React from 'react';
import { FaBoxes, FaBarcode, FaHistory, FaExclamationTriangle, FaSearch } from 'react-icons/fa';
import styles from './InventoryPage.module.css';

export const InventoryPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Stok & Envanter Yönetimi</h1>
        <div className={styles.actions}>
          <button className={styles.secondaryBtn}><FaHistory /> Stok Geçmişi</button>
          <button className={styles.primaryBtn}><FaBoxes /> Stok Girişi Yap</button>
        </div>
      </div>

      <div className={styles.alertBar}>
        <FaExclamationTriangle /> <span><strong>4 ürün</strong> kritik stok seviyesinin altında!</span>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.miniStat}>
          <span>Toplam Ürün</span>
          <strong>452</strong>
        </div>
        <div className={styles.miniStat}>
          <span>Depo Değeri</span>
          <strong>₺ 1.2M</strong>
        </div>
        <div className={styles.miniStat}>
          <span>Bekleyen Siparişler</span>
          <strong>18</strong>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.toolbar}>
          <div className={styles.search}>
            <FaSearch />
            <input type="text" placeholder="Barkod veya ürün adı..." />
          </div>
          <button className={styles.barcodeBtn}><FaBarcode /> Barkod Oku</button>
        </div>

        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Ürün</th>
                <th>Barkod</th>
                <th>Kategori</th>
                <th>Depo Miktarı</th>
                <th>Birim Fiyat</th>
                <th>Durum</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'iPhone 15 Pro Max', sku: '8680001', cat: 'Elektronik', qty: 12, price: '75.000 TL', status: 'Normal' },
                { name: 'MacBook Air M3', sku: '8680002', cat: 'Elektronik', qty: 3, price: '45.000 TL', status: 'Kritik' },
                { name: 'Logitech MX Master 3', sku: '8680003', cat: 'Aksesuar', qty: 45, price: '3.500 TL', status: 'Normal' },
              ].map((item, i) => (
                <tr key={i}>
                  <td><strong>{item.name}</strong></td>
                  <td><code>{item.sku}</code></td>
                  <td>{item.cat}</td>
                  <td>{item.qty} Adet</td>
                  <td>{item.price}</td>
                  <td>
                    <span className={`${styles.status} ${styles[item.status.toLowerCase()]}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
