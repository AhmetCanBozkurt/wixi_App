# WIXI MAIL ENTEGRASYON SİSTEMİ - ÜRÜN GEREKSİNİMLERİ DOKÜMANI (PRD)

## 1. Giriş ve Amaç
WIXI SaaS platformu içinde, farklı modüllerin (Finans, İK, CRM vb.) kullanıcılarına veya müşterilerine dinamik, özelleştirilebilir e-postalar gönderebilmesini sağlayan merkezi bir altyapı kurulacaktır. Bu sistem, kod tarafında değişiklik yapmadan admin panelinden e-posta şablonlarını, alıcı kurallarını ve içerikleri yönetmeyi amaçlar.

## 2. Temel Fonksiyonel Gereksinimler

### 2.1. Dinamik Şablon Yönetimi (Template Management)
- **Şablon CRUD:** Admin kullanıcıları e-posta şablonları oluşturabilmeli, düzenleyebilmeli ve silebilir (veya pasife alabilir).
- **HTML Editör:** Şablon gövdesi için zengin metin (Rich Text/HTML) editörü sunulacaktır.
- **Konu (Subject):** Her şablon için dinamik konu başlığı desteği.
- **CC/BCC Yapılandırması:** Şablona varsayılan CC ve BCC adresleri eklenebilecektir.

### 2.2. Yer Tutucu (Placeholder) Sistemi
- **Dinamik Veri Bağlama:** Şablon içinde `{{User_FullName}}`, `{{Order_No}}`, `{{Company_Name}}` gibi yer tutucular kullanılabilecektir.
- **Kolon Eşleme:** Her şablon tipi için hangi verilerin (modül bazlı) gönderileceği sistem tarafından tanımlanacaktır.

### 2.3. Çoklu Modül Desteği
- **Modül Bazlı Ayrıştırma:** Şablonlar ilgili oldukları modüle (Core, Tekstil, Randevu vb.) göre kategorize edilecektir.
- **Tetikleyici (Trigger) Entegrasyonu:** Kod tarafında sadece template anahtarı (key) ve data objesi gönderilerek mail tetiklenecektir.

### 2.4. Ek Dosya (Attachments) Yönetimi
- **Statik Ekler:** Şablona kalıcı dosyalar (örn. kullanım klavuzu PDF) eklenebilmeli.
- **Dinamik Ekler:** Mail gönderim anında kod tarafından oluşturulan dosyalar (örn. fatura PDF) eklenebilmeli.

### 2.5. İzlenebilirlik (Mailing Logs)
- **Gönderim Geçmişi:** Hangi mailin kime, ne zaman ve hangi içerikle gittiği kaydedilmelidir.
- **Hata Takibi:** Başarısız gönderimlerin nedenleri (SMTP hatası, yanlış adres vb.) loglanmalıdır.

## 3. Teknik Mimari Yaklaşımı

### 3.1. Veritabanı Şeması
- **WIXI_MAIL_TEMPLATES:** `Id`, `Code` (Key), `Module`, `Subject`, `BodyHtml`, `DefaultCC`, `DefaultBCC`, `IsActive`.
- **WIXI_MAIL_LOGS:** `Id`, `TemplateId`, `Recipient`, `SentAt`, `Status`, `ErrorMessage`, `RenderedBody`.

### 3.2. Servis Yapısı
- **TemplateEngine:** `Scriban` veya benzeri bir kütüphane ile yer tutucuların gerçek verilerle değiştirilmesi.
- **MailQueue:** Maillerin sistemi bloklamaması için bir kuyruk (Background Task) yapısı üzerinden gönderilmesi.

## 4. Kullanıcı Deneyimi (UI/UX)
- **Yönetim Paneli:** Premium Vanilla CSS tasarımlı, modüler bir şablon listesi ve editör ekranı.
- **Önizleme (Preview):** Şablonu kaydetmeden önce test verileriyle nasıl göründüğünü inceleme özelliği.

## 5. Görev Dağılımı ve Roadmap (TASKS.md Entegrasyonu)
Bu PRD kapsamında `TASKS.md` dosyasına yeni bir faz eklenecek veya FAZ 3 altındaki mail görevi bu kapsamda genişletilecektir.
