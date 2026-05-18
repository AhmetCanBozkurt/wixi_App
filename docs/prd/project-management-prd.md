# 🏗️ WIXI Platform — Proje Yönetimi Analizi

> **Tarih:** 2026-05-16  
> **Kapsam:** Kanban, Gantt, Zaman Takibi, Ekip Yönetimi  
> **Durum:** Frontend UI hazır (Mock), Backend bağlantısı yok.

---

## 1. MEVCUT DURUM ÖZETİ

| BİLEŞEN | DURUM | NOTLAR |
| :--- | :--- | :--- |
| **Kanban Board** | ✅ Tasarım Tam | Sürükle-bırak çalışıyor, veri statik. |
| **Gantt Chart** | ✅ Tasarım Tam | Zaman çizelgesi görselleştirme mevcut. |
| **Liste Görünümü** | ✅ Tasarım Tam | Tablo yapısı hazır. |
| **İstatistikler** | ⚠️ Taslak | Statik veriler üzerinden gösterim yapılıyor. |
| **Veri Kaydı** | ❌ Yok | Sayfa yenilendiğinde değişiklikler kayboluyor. |
| **Modallar** | ❌ Yok | Görev ekleme/düzenleme ekranları henüz yok. |

---

## 2. KRİTİK EKSİKLER VE BOŞLUKLAR

### ❌ Backend & Veri Yapısı (Sıfır)
Mevcut frontend tamamen `useState` içindeki mock datayı kullanıyor. Backend tarafında şu tablolar ve servisler eksik:
- **WixiProject:** Proje tanımı (Ad, Başlangıç/Bitiş, Müşteri/Cari Bağlantısı).
- **WixiTask:** Görev tanımı (Status, Priority, DueDate, Progress).
- **WixiTaskAssignee:** Göreve atanan kullanıcılar.
- **WixiTimeEntry:** Görev bazlı zaman takibi (Log).

### ❌ Görev Detayları & İş Birliği
Profesyonel bir proje yönetiminde olması gereken şu özellikler henüz yok:
- **Alt Görevler (Sub-tasks):** Karmaşık işlerin parçalanması.
- **Yorumlar & Aktivite Logu:** Ekip içi iletişim ve kimin neyi değiştirdiğinin takibi.
- **Dosya Ekleri:** Görevle ilgili dökümanların saklanması.
- **Bağımlılıklar (Dependencies):** "A işi bitmeden B işi başlayamaz" mantığının Gantt üzerinde gösterilmesi.

---

## 3. HEDEF MİMARİ VE ENTEGRASYON

Proje yönetiminin platformun geneliyle "dört dörtlük" konuşması için şu entegrasyonlar kurulmalıdır:

### 🤝 CRM Entegrasyonu
- Her proje bir **Cari (Müşteri)** kartına bağlanmalı.
- Müşteri kartında "Devam Eden Projeler" otomatik listelenmeli.

### 💰 E-Ticaret / Finans Entegrasyonu
- Proje bazlı maliyet takibi.
- Tamamlanan projenin (veya milestone'ların) otomatik faturaya dönüştürülmesi.

### ⏱️ Zaman Takibi (Time Tracking)
- Çalışanlar "Play" butonuna basarak görev üzerinde harcadıkları süreyi tutabilmeli.
- Bu süreler ay sonunda hakediş raporlarına yansımalı.

---

## 4. TEKNİK UYGULAMA PLANI (TECHNICAL BLUEPRINT)

### 🛠️ Backend (Entity Önerisi)
```csharp
// WixiProject
public class WixiProject {
    public Guid Id { get; set; }
    public string Name { get; set; }
    public Guid? ContactId { get; set; } // CRM Bağlantısı
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public ProjectStatus Status { get; set; } // Aktif, Beklemede, Tamamlandı
}

// WixiTask
public class WixiTask {
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public TaskStatus Status { get; set; } // Todo, InProgress, Review, Done
    public TaskPriority Priority { get; set; }
    public int Progress { get; set; } // 0-100
}
```

---

## 5. ÖNCELİKLİ YOL HARİTASI (ROADMAP)

1.  **Backend Entity & API:** Proje ve Görev tablolarının oluşturulması.
2.  **State Management:** Frontend tarafındaki statik verinin API'dan çekilecek hale getirilmesi.
3.  **Dnd Entegrasyonu:** Kanban üzerinde kart kaydırıldığında backend güncellemesi.
4.  **Görev Ekleme/Düzenleme:** Form yapısının ve modalların kurulması.
