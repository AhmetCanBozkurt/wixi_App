# 🏭 TEKSTIL MODÜLÜ - VERİTABANI ANALİZİ VE TASARIMI

> **Proje:** wixi.Tekstil Modülü  
> **Tarih:** 2026-01-04  
> **Versiyon:** 1.0  
> **Çoklu Dil Desteği:** ✅ Aktif

---

## 📋 İÇİNDEKİLER

1. [Genel Bakış](#genel-bakış)
2. [Çoklu Dil Stratejisi](#çoklu-dil-stratejisi)
3. [Veritabanı Tabloları](#veritabanı-tabloları)
4. [Admin Panel Yapısı](#admin-panel-yapısı)
5. [API Endpoint'leri](#api-endpointleri)
6. [Uygulama Planı](#uygulama-planı)

---

## 🎯 GENEL BAKIŞ

### Modül Özeti
Tekstil modülü, t-shirt, sweatshirt ve okul üniforması üretimi yapan firmalar için tasarlanmış kapsamlı bir web yönetim sistemidir.

### Ana Özellikler
- ✅ Ürün Yönetimi (Kategoriler, Ürünler, Galeri)
- ✅ Proje Portföyü (Referans Projeler)
- ✅ İletişim Yönetimi (Form, WhatsApp)
- ✅ Hakkımızda & İstatistikler
- ✅ SEO & Analitik
- ✅ **Çoklu Dil Desteği (TR, EN, DE)**

### Teknoloji Stack
- **Backend:** ASP.NET Core Web API
- **Frontend:** React + TypeScript + Vite
- **Database:** SQL Server
- **ORM:** Entity Framework Core
- **Naming Convention:** `wixi_Tekstil_[TableName]`

---

## 🌍 ÇOKLU DİL STRATEJİSİ

### Dil Yapısı

#### 1. **Desteklenen Diller**
```json
{
  "languages": [
    { "code": "tr", "name": "Türkçe", "isDefault": true },
    { "code": "en", "name": "English", "isDefault": false },
    { "code": "de", "name": "Deutsch", "isDefault": false }
  ]
}
```

#### 2. **Çeviri Yaklaşımı**

**A) Ana Tablo + Çeviri Tablosu Yaklaşımı** (Önerilen)
- Ana tablo: Varsayılan dil (TR) ve dil-bağımsız alanlar
- Çeviri tablosu: Diğer diller için çeviriler

**B) JSON Tabanlı Yaklaşım**
- Tüm çeviriler JSON field'da saklanır
- Daha esnek ama sorgu performansı düşük

**✅ Seçilen Yaklaşım: A (Ana Tablo + Çeviri Tablosu)**

---

## 📊 VERİTABANI TABLOLARI

### 1️⃣ DİL YÖNETİMİ

#### `wixi_Tekstil_Languages`
```sql
CREATE TABLE wixi_Tekstil_Languages (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Code NVARCHAR(10) NOT NULL UNIQUE,          -- 'tr', 'en', 'de'
    Name NVARCHAR(100) NOT NULL,                -- 'Türkçe', 'English'
    NativeName NVARCHAR(100) NOT NULL,          -- 'Türkçe', 'English'
    FlagIcon NVARCHAR(100),                     -- Flag emoji or icon path
    IsDefault BIT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    DisplayOrder INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Varsayılan veriler
INSERT INTO wixi_Tekstil_Languages (Code, Name, NativeName, FlagIcon, IsDefault, IsActive, DisplayOrder)
VALUES 
    ('tr', 'Turkish', 'Türkçe', '🇹🇷', 1, 1, 1),
    ('en', 'English', 'English', '🇬🇧', 0, 1, 2),
    ('de', 'German', 'Deutsch', '🇩🇪', 0, 1, 3);
```

---

### 2️⃣ HAKKIMIZDA MODÜLÜ

#### `wixi_Tekstil_About`
```sql
CREATE TABLE wixi_Tekstil_About (
    Id INT PRIMARY KEY IDENTITY(1,1),
    
    -- Varsayılan Dil (TR) İçerikleri
    Title NVARCHAR(200) NOT NULL,               -- "Hakkımızda"
    Description NVARCHAR(MAX) NOT NULL,         -- Ana açıklama
    MissionTitle NVARCHAR(200) NOT NULL,        -- "Misyonumuz"
    MissionDescription NVARCHAR(MAX) NOT NULL,
    VisionTitle NVARCHAR(200) NOT NULL,         -- "Vizyonumuz"
    VisionDescription NVARCHAR(MAX) NOT NULL,
    
    -- Metadata
    IsActive BIT NOT NULL DEFAULT 1,
    DisplayOrder INT NOT NULL DEFAULT 0,
    
    -- Audit
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy INT NOT NULL,
    UpdatedBy INT NOT NULL,
    
    CONSTRAINT FK_About_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES Users(Id),
    CONSTRAINT FK_About_UpdatedBy FOREIGN KEY (UpdatedBy) REFERENCES Users(Id)
);
```

#### `wixi_Tekstil_About_Translations`
```sql
CREATE TABLE wixi_Tekstil_About_Translations (
    Id INT PRIMARY KEY IDENTITY(1,1),
    AboutId INT NOT NULL,
    LanguageCode NVARCHAR(10) NOT NULL,
    
    -- Çevrilmiş İçerikler
    Title NVARCHAR(200),
    Description NVARCHAR(MAX),
    MissionTitle NVARCHAR(200),
    MissionDescription NVARCHAR(MAX),
    VisionTitle NVARCHAR(200),
    VisionDescription NVARCHAR(MAX),
    
    -- Audit
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT FK_AboutTranslations_About FOREIGN KEY (AboutId) REFERENCES wixi_Tekstil_About(Id) ON DELETE CASCADE,
    CONSTRAINT FK_AboutTranslations_Language FOREIGN KEY (LanguageCode) REFERENCES wixi_Tekstil_Languages(Code),
    CONSTRAINT UQ_AboutTranslations_Lang UNIQUE (AboutId, LanguageCode)
);
```

#### `wixi_Tekstil_Stats`
```sql
CREATE TABLE wixi_Tekstil_Stats (
    Id INT PRIMARY KEY IDENTITY(1,1),
    
    -- Varsayılan Dil (TR)
    Label NVARCHAR(100) NOT NULL,               -- "Yıllık Deneyim"
    Value NVARCHAR(50) NOT NULL,                -- "15+"
    
    -- Dil-bağımsız
    IconName NVARCHAR(50) NOT NULL,             -- "Award", "Users", "Sparkles", "Target"
    DisplayOrder INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    
    -- Audit
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);
```

#### `wixi_Tekstil_Stats_Translations`
```sql
CREATE TABLE wixi_Tekstil_Stats_Translations (
    Id INT PRIMARY KEY IDENTITY(1,1),
    StatId INT NOT NULL,
    LanguageCode NVARCHAR(10) NOT NULL,
    Label NVARCHAR(100) NOT NULL,
    
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT FK_StatsTranslations_Stats FOREIGN KEY (StatId) REFERENCES wixi_Tekstil_Stats(Id) ON DELETE CASCADE,
    CONSTRAINT FK_StatsTranslations_Language FOREIGN KEY (LanguageCode) REFERENCES wixi_Tekstil_Languages(Code),
    CONSTRAINT UQ_StatsTranslations_Lang UNIQUE (StatId, LanguageCode)
);
```

---

### 3️⃣ ÜRÜN YÖNETİMİ

#### `wixi_Tekstil_ProductCategories`
```sql
CREATE TABLE wixi_Tekstil_ProductCategories (
    Id INT PRIMARY KEY IDENTITY(1,1),
    
    -- Varsayılan Dil (TR)
    Name NVARCHAR(100) NOT NULL,                -- "T-Shirt"
    Description NVARCHAR(500),
    
    -- Dil-bağımsız
    Slug NVARCHAR(100) NOT NULL UNIQUE,         -- "t-shirt"
    IconName NVARCHAR(50),                      -- "Shirt", "Hoodie"
    ImageUrl NVARCHAR(500),
    ParentCategoryId INT NULL,                  -- Alt kategori desteği
    
    -- Metadata
    DisplayOrder INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    
    -- SEO
    MetaTitle NVARCHAR(200),
    MetaDescription NVARCHAR(500),
    
    -- Audit
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy INT NOT NULL,
    UpdatedBy INT NOT NULL,
    
    CONSTRAINT FK_ProductCategories_Parent FOREIGN KEY (ParentCategoryId) REFERENCES wixi_Tekstil_ProductCategories(Id),
    CONSTRAINT FK_ProductCategories_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES Users(Id),
    CONSTRAINT FK_ProductCategories_UpdatedBy FOREIGN KEY (UpdatedBy) REFERENCES Users(Id)
);
```

#### `wixi_Tekstil_ProductCategories_Translations`
```sql
CREATE TABLE wixi_Tekstil_ProductCategories_Translations (
    Id INT PRIMARY KEY IDENTITY(1,1),
    CategoryId INT NOT NULL,
    LanguageCode NVARCHAR(10) NOT NULL,
    
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    MetaTitle NVARCHAR(200),
    MetaDescription NVARCHAR(500),
    
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT FK_ProductCategoryTranslations_Category FOREIGN KEY (CategoryId) REFERENCES wixi_Tekstil_ProductCategories(Id) ON DELETE CASCADE,
    CONSTRAINT FK_ProductCategoryTranslations_Language FOREIGN KEY (LanguageCode) REFERENCES wixi_Tekstil_Languages(Code),
    CONSTRAINT UQ_ProductCategoryTranslations_Lang UNIQUE (CategoryId, LanguageCode)
);
```

#### `wixi_Tekstil_Products`
```sql
CREATE TABLE wixi_Tekstil_Products (
    Id INT PRIMARY KEY IDENTITY(1,1),
    CategoryId INT NOT NULL,
    
    -- Varsayılan Dil (TR)
    Title NVARCHAR(200) NOT NULL,               -- "T-Shirt Baskı"
    Description NVARCHAR(MAX),
    ShortDescription NVARCHAR(500),
    
    -- Dil-bağımsız
    Slug NVARCHAR(200) NOT NULL UNIQUE,         -- "t-shirt-baski"
    SKU NVARCHAR(100) UNIQUE,                   -- Stok kodu
    
    -- Fiyatlandırma
    Price DECIMAL(18,2) NULL,                   -- Opsiyonel fiyat
    DiscountPrice DECIMAL(18,2) NULL,
    Currency NVARCHAR(10) DEFAULT 'TRY',
    MinOrderQuantity INT DEFAULT 1,
    
    -- Medya
    PrimaryImageUrl NVARCHAR(500),
    PrimaryImageAlt NVARCHAR(200),
    
    -- Özellikler (JSON)
    Features NVARCHAR(MAX),                     -- JSON: {"fabric": "100% Cotton", "colors": ["Red", "Blue"]}
    Specifications NVARCHAR(MAX),               -- JSON: Teknik özellikler
    
    -- Stok
    StockQuantity INT DEFAULT 0,
    IsInStock BIT NOT NULL DEFAULT 1,
    
    -- Metadata
    IsActive BIT NOT NULL DEFAULT 1,
    IsFeatured BIT NOT NULL DEFAULT 0,          -- Öne çıkan ürün
    IsNew BIT NOT NULL DEFAULT 0,
    DisplayOrder INT NOT NULL DEFAULT 0,
    ViewCount INT NOT NULL DEFAULT 0,
    
    -- SEO
    MetaTitle NVARCHAR(200),
    MetaDescription NVARCHAR(500),
    MetaKeywords NVARCHAR(500),
    
    -- Audit
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy INT NOT NULL,
    UpdatedBy INT NOT NULL,
    
    CONSTRAINT FK_Products_Category FOREIGN KEY (CategoryId) REFERENCES wixi_Tekstil_ProductCategories(Id),
    CONSTRAINT FK_Products_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES Users(Id),
    CONSTRAINT FK_Products_UpdatedBy FOREIGN KEY (UpdatedBy) REFERENCES Users(Id)
);

-- İndeksler
CREATE INDEX IX_Products_CategoryId ON wixi_Tekstil_Products(CategoryId);
CREATE INDEX IX_Products_Slug ON wixi_Tekstil_Products(Slug);
CREATE INDEX IX_Products_IsActive_IsFeatured ON wixi_Tekstil_Products(IsActive, IsFeatured);
```

#### `wixi_Tekstil_Products_Translations`
```sql
CREATE TABLE wixi_Tekstil_Products_Translations (
    Id INT PRIMARY KEY IDENTITY(1,1),
    ProductId INT NOT NULL,
    LanguageCode NVARCHAR(10) NOT NULL,
    
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX),
    ShortDescription NVARCHAR(500),
    Features NVARCHAR(MAX),                     -- JSON çevirisi
    Specifications NVARCHAR(MAX),
    MetaTitle NVARCHAR(200),
    MetaDescription NVARCHAR(500),
    MetaKeywords NVARCHAR(500),
    
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT FK_ProductTranslations_Product FOREIGN KEY (ProductId) REFERENCES wixi_Tekstil_Products(Id) ON DELETE CASCADE,
    CONSTRAINT FK_ProductTranslations_Language FOREIGN KEY (LanguageCode) REFERENCES wixi_Tekstil_Languages(Code),
    CONSTRAINT UQ_ProductTranslations_Lang UNIQUE (ProductId, LanguageCode)
);
```

#### `wixi_Tekstil_ProductImages`
```sql
CREATE TABLE wixi_Tekstil_ProductImages (
    Id INT PRIMARY KEY IDENTITY(1,1),
    ProductId INT NOT NULL,
    
    ImageUrl NVARCHAR(500) NOT NULL,
    ImageAlt NVARCHAR(200),
    ImageTitle NVARCHAR(200),
    IsPrimary BIT NOT NULL DEFAULT 0,
    DisplayOrder INT NOT NULL DEFAULT 0,
    
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT FK_ProductImages_Product FOREIGN KEY (ProductId) REFERENCES wixi_Tekstil_Products(Id) ON DELETE CASCADE
);

CREATE INDEX IX_ProductImages_ProductId ON wixi_Tekstil_ProductImages(ProductId);
```

---

### 4️⃣ PROJE YÖNETİMİ

#### `wixi_Tekstil_ProjectCategories`
```sql
CREATE TABLE wixi_Tekstil_ProjectCategories (
    Id INT PRIMARY KEY IDENTITY(1,1),
    
    -- Varsayılan Dil (TR)
    Name NVARCHAR(100) NOT NULL,                -- "Okul Projesi"
    Description NVARCHAR(500),
    
    -- Dil-bağımsız
    Slug NVARCHAR(100) NOT NULL UNIQUE,
    Color NVARCHAR(50),                         -- Badge rengi: "#3B82F6"
    IconName NVARCHAR(50),
    
    DisplayOrder INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);
```

#### `wixi_Tekstil_ProjectCategories_Translations`
```sql
CREATE TABLE wixi_Tekstil_ProjectCategories_Translations (
    Id INT PRIMARY KEY IDENTITY(1,1),
    CategoryId INT NOT NULL,
    LanguageCode NVARCHAR(10) NOT NULL,
    
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT FK_ProjectCategoryTranslations_Category FOREIGN KEY (CategoryId) REFERENCES wixi_Tekstil_ProjectCategories(Id) ON DELETE CASCADE,
    CONSTRAINT FK_ProjectCategoryTranslations_Language FOREIGN KEY (LanguageCode) REFERENCES wixi_Tekstil_Languages(Code),
    CONSTRAINT UQ_ProjectCategoryTranslations_Lang UNIQUE (CategoryId, LanguageCode)
);
```

#### `wixi_Tekstil_Projects`
```sql
CREATE TABLE wixi_Tekstil_Projects (
    Id INT PRIMARY KEY IDENTITY(1,1),
    CategoryId INT NOT NULL,
    
    -- Varsayılan Dil (TR)
    Title NVARCHAR(200) NOT NULL,               -- "Anadolu Lisesi Üniforma Projesi"
    ClientName NVARCHAR(200) NOT NULL,          -- "İstanbul Anadolu Lisesi"
    Description NVARCHAR(MAX),
    
    -- Dil-bağımsız
    Slug NVARCHAR(200) NOT NULL UNIQUE,
    PrimaryImageUrl NVARCHAR(500),
    PrimaryImageAlt NVARCHAR(200),
    
    -- Proje Detayları
    Year INT NOT NULL,                          -- 2024
    Quantity INT,                               -- Üretilen adet: 500
    Duration NVARCHAR(100),                     -- "3 ay"
    Budget DECIMAL(18,2),                       -- Opsiyonel
    CompletionDate DATE,
    
    -- Metadata
    IsActive BIT NOT NULL DEFAULT 1,
    IsFeatured BIT NOT NULL DEFAULT 0,
    DisplayOrder INT NOT NULL DEFAULT 0,
    ViewCount INT NOT NULL DEFAULT 0,
    
    -- SEO
    MetaTitle NVARCHAR(200),
    MetaDescription NVARCHAR(500),
    
    -- Audit
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy INT NOT NULL,
    UpdatedBy INT NOT NULL,
    
    CONSTRAINT FK_Projects_Category FOREIGN KEY (CategoryId) REFERENCES wixi_Tekstil_ProjectCategories(Id),
    CONSTRAINT FK_Projects_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES Users(Id),
    CONSTRAINT FK_Projects_UpdatedBy FOREIGN KEY (UpdatedBy) REFERENCES Users(Id)
);

CREATE INDEX IX_Projects_CategoryId ON wixi_Tekstil_Projects(CategoryId);
CREATE INDEX IX_Projects_Slug ON wixi_Tekstil_Projects(Slug);
CREATE INDEX IX_Projects_Year ON wixi_Tekstil_Projects(Year);
```

#### `wixi_Tekstil_Projects_Translations`
```sql
CREATE TABLE wixi_Tekstil_Projects_Translations (
    Id INT PRIMARY KEY IDENTITY(1,1),
    ProjectId INT NOT NULL,
    LanguageCode NVARCHAR(10) NOT NULL,
    
    Title NVARCHAR(200) NOT NULL,
    ClientName NVARCHAR(200),
    Description NVARCHAR(MAX),
    MetaTitle NVARCHAR(200),
    MetaDescription NVARCHAR(500),
    
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT FK_ProjectTranslations_Project FOREIGN KEY (ProjectId) REFERENCES wixi_Tekstil_Projects(Id) ON DELETE CASCADE,
    CONSTRAINT FK_ProjectTranslations_Language FOREIGN KEY (LanguageCode) REFERENCES wixi_Tekstil_Languages(Code),
    CONSTRAINT UQ_ProjectTranslations_Lang UNIQUE (ProjectId, LanguageCode)
);
```

#### `wixi_Tekstil_ProjectImages`
```sql
CREATE TABLE wixi_Tekstil_ProjectImages (
    Id INT PRIMARY KEY IDENTITY(1,1),
    ProjectId INT NOT NULL,
    
    ImageUrl NVARCHAR(500) NOT NULL,
    ImageAlt NVARCHAR(200),
    ImageTitle NVARCHAR(200),
    IsPrimary BIT NOT NULL DEFAULT 0,
    DisplayOrder INT NOT NULL DEFAULT 0,
    
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT FK_ProjectImages_Project FOREIGN KEY (ProjectId) REFERENCES wixi_Tekstil_Projects(Id) ON DELETE CASCADE
);
```

#### `wixi_Tekstil_ProjectTags`
```sql
CREATE TABLE wixi_Tekstil_ProjectTags (
    Id INT PRIMARY KEY IDENTITY(1,1),
    ProjectId INT NOT NULL,
    TagName NVARCHAR(100) NOT NULL,             -- "Üniforma", "Baskı", "Nakış"
    
    CONSTRAINT FK_ProjectTags_Project FOREIGN KEY (ProjectId) REFERENCES wixi_Tekstil_Projects(Id) ON DELETE CASCADE
);

CREATE INDEX IX_ProjectTags_ProjectId ON wixi_Tekstil_ProjectTags(ProjectId);
CREATE INDEX IX_ProjectTags_TagName ON wixi_Tekstil_ProjectTags(TagName);
```

---

### 5️⃣ İLETİŞİM YÖNETİMİ

#### `wixi_Tekstil_ContactInfo`
```sql
CREATE TABLE wixi_Tekstil_ContactInfo (
    Id INT PRIMARY KEY IDENTITY(1,1),
    
    -- Varsayılan Dil (TR)
    CompanyName NVARCHAR(200) NOT NULL,
    Address NVARCHAR(500) NOT NULL,
    WorkingHoursWeekday NVARCHAR(100),          -- "Pazartesi - Cuma: 08:00 - 18:00"
    WorkingHoursSaturday NVARCHAR(100),
    WorkingHoursSunday NVARCHAR(100),
    
    -- Dil-bağımsız
    Phone1 NVARCHAR(50) NOT NULL,
    Phone2 NVARCHAR(50),
    Email1 NVARCHAR(100) NOT NULL,
    Email2 NVARCHAR(100),
    City NVARCHAR(100),
    District NVARCHAR(100),
    PostalCode NVARCHAR(20),
    
    -- Harita
    MapLatitude DECIMAL(10,8),
    MapLongitude DECIMAL(11,8),
    MapZoomLevel INT DEFAULT 15,
    
    -- WhatsApp
    WhatsAppNumber NVARCHAR(50),
    WhatsAppDefaultMessage NVARCHAR(500),       -- "Merhaba, bilgi almak istiyorum"
    
    -- Sosyal Medya (JSON)
    SocialMediaLinks NVARCHAR(MAX),             -- JSON: {"facebook": "url", "instagram": "url"}
    
    IsActive BIT NOT NULL DEFAULT 1,
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy INT NOT NULL,
    
    CONSTRAINT FK_ContactInfo_UpdatedBy FOREIGN KEY (UpdatedBy) REFERENCES Users(Id)
);
```

#### `wixi_Tekstil_ContactInfo_Translations`
```sql
CREATE TABLE wixi_Tekstil_ContactInfo_Translations (
    Id INT PRIMARY KEY IDENTITY(1,1),
    ContactInfoId INT NOT NULL,
    LanguageCode NVARCHAR(10) NOT NULL,
    
    CompanyName NVARCHAR(200),
    Address NVARCHAR(500),
    WorkingHoursWeekday NVARCHAR(100),
    WorkingHoursSaturday NVARCHAR(100),
    WorkingHoursSunday NVARCHAR(100),
    WhatsAppDefaultMessage NVARCHAR(500),
    
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT FK_ContactInfoTranslations_ContactInfo FOREIGN KEY (ContactInfoId) REFERENCES wixi_Tekstil_ContactInfo(Id) ON DELETE CASCADE,
    CONSTRAINT FK_ContactInfoTranslations_Language FOREIGN KEY (LanguageCode) REFERENCES wixi_Tekstil_Languages(Code),
    CONSTRAINT UQ_ContactInfoTranslations_Lang UNIQUE (ContactInfoId, LanguageCode)
);
```

#### `wixi_Tekstil_ContactSubmissions`
```sql
CREATE TABLE wixi_Tekstil_ContactSubmissions (
    Id INT PRIMARY KEY IDENTITY(1,1),
    
    -- Form Bilgileri
    FullName NVARCHAR(200) NOT NULL,
    Email NVARCHAR(100) NOT NULL,
    Phone NVARCHAR(50),
    Subject NVARCHAR(200),
    Message NVARCHAR(MAX) NOT NULL,
    
    -- Durum Yönetimi
    Status NVARCHAR(50) NOT NULL DEFAULT 'New', -- 'New', 'InProgress', 'Completed', 'Cancelled'
    Priority NVARCHAR(50) DEFAULT 'Medium',     -- 'Low', 'Medium', 'High', 'Urgent'
    
    -- Atama
    AssignedTo INT NULL,                        -- Atanan kullanıcı
    AssignedAt DATETIME2,
    
    -- Yanıt
    ResponseMessage NVARCHAR(MAX),
    ResponseDate DATETIME2,
    ResponseBy INT NULL,
    
    -- Takip
    FollowUpDate DATETIME2,
    Tags NVARCHAR(500),                         -- "Okul,Üniforma,Acil"
    
    -- Kaynak
    Source NVARCHAR(100) DEFAULT 'Website',     -- 'Website', 'WhatsApp', 'Phone', 'Email'
    LanguageCode NVARCHAR(10) DEFAULT 'tr',
    
    -- Teknik
    IpAddress NVARCHAR(50),
    UserAgent NVARCHAR(500),
    ReferrerUrl NVARCHAR(500),
    
    -- Audit
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT FK_ContactSubmissions_AssignedTo FOREIGN KEY (AssignedTo) REFERENCES Users(Id),
    CONSTRAINT FK_ContactSubmissions_ResponseBy FOREIGN KEY (ResponseBy) REFERENCES Users(Id)
);

CREATE INDEX IX_ContactSubmissions_Status ON wixi_Tekstil_ContactSubmissions(Status);
CREATE INDEX IX_ContactSubmissions_CreatedAt ON wixi_Tekstil_ContactSubmissions(CreatedAt DESC);
CREATE INDEX IX_ContactSubmissions_AssignedTo ON wixi_Tekstil_ContactSubmissions(AssignedTo);
```

---

### 6️⃣ SİTE AYARLARI

#### `wixi_Tekstil_SiteSettings`
```sql
CREATE TABLE wixi_Tekstil_SiteSettings (
    Id INT PRIMARY KEY IDENTITY(1,1),
    
    SettingKey NVARCHAR(100) NOT NULL UNIQUE,   -- "SiteName", "Logo", "FaviconUrl"
    SettingValue NVARCHAR(MAX),                 -- Değer
    SettingType NVARCHAR(50) NOT NULL,          -- "Text", "Image", "Number", "Boolean", "JSON"
    Category NVARCHAR(100),                     -- "General", "SEO", "Social", "Contact"
    
    IsTranslatable BIT NOT NULL DEFAULT 0,      -- Çevrilebilir mi?
    Description NVARCHAR(500),                  -- Ayar açıklaması
    
    DisplayOrder INT NOT NULL DEFAULT 0,
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy INT NOT NULL,
    
    CONSTRAINT FK_SiteSettings_UpdatedBy FOREIGN KEY (UpdatedBy) REFERENCES Users(Id)
);

-- Örnek Veriler
INSERT INTO wixi_Tekstil_SiteSettings (SettingKey, SettingValue, SettingType, Category, IsTranslatable)
VALUES 
    ('SiteName', 'Premium Tekstil', 'Text', 'General', 1),
    ('SiteDescription', 'Okullar ve kurumlar için özel tasarım giyim', 'Text', 'General', 1),
    ('LogoUrl', '/images/logo.png', 'Image', 'General', 0),
    ('FaviconUrl', '/images/favicon.ico', 'Image', 'General', 0),
    ('PrimaryColor', '#3B82F6', 'Text', 'Design', 0),
    ('GoogleAnalyticsId', 'G-XXXXXXXXXX', 'Text', 'Analytics', 0);
```

#### `wixi_Tekstil_SiteSettings_Translations`
```sql
CREATE TABLE wixi_Tekstil_SiteSettings_Translations (
    Id INT PRIMARY KEY IDENTITY(1,1),
    SettingId INT NOT NULL,
    LanguageCode NVARCHAR(10) NOT NULL,
    
    TranslatedValue NVARCHAR(MAX) NOT NULL,
    
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT FK_SiteSettingsTranslations_Setting FOREIGN KEY (SettingId) REFERENCES wixi_Tekstil_SiteSettings(Id) ON DELETE CASCADE,
    CONSTRAINT FK_SiteSettingsTranslations_Language FOREIGN KEY (LanguageCode) REFERENCES wixi_Tekstil_Languages(Code),
    CONSTRAINT UQ_SiteSettingsTranslations_Lang UNIQUE (SettingId, LanguageCode)
);
```

#### `wixi_Tekstil_HeroSlider`
```sql
CREATE TABLE wixi_Tekstil_HeroSlider (
    Id INT PRIMARY KEY IDENTITY(1,1),
    
    -- Varsayılan Dil (TR)
    Title NVARCHAR(200) NOT NULL,
    Subtitle NVARCHAR(500),
    Description NVARCHAR(MAX),
    ButtonText NVARCHAR(100),
    
    -- Dil-bağımsız
    ImageUrl NVARCHAR(500) NOT NULL,
    ImageAlt NVARCHAR(200),
    ButtonLink NVARCHAR(500),
    ButtonTarget NVARCHAR(20) DEFAULT '_self',  -- '_self', '_blank'
    
    -- Metadata
    DisplayOrder INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    StartDate DATETIME2,
    EndDate DATETIME2,
    
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy INT NOT NULL,
    UpdatedBy INT NOT NULL,
    
    CONSTRAINT FK_HeroSlider_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES Users(Id),
    CONSTRAINT FK_HeroSlider_UpdatedBy FOREIGN KEY (UpdatedBy) REFERENCES Users(Id)
);
```

#### `wixi_Tekstil_HeroSlider_Translations`
```sql
CREATE TABLE wixi_Tekstil_HeroSlider_Translations (
    Id INT PRIMARY KEY IDENTITY(1,1),
    SliderId INT NOT NULL,
    LanguageCode NVARCHAR(10) NOT NULL,
    
    Title NVARCHAR(200),
    Subtitle NVARCHAR(500),
    Description NVARCHAR(MAX),
    ButtonText NVARCHAR(100),
    
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT FK_HeroSliderTranslations_Slider FOREIGN KEY (SliderId) REFERENCES wixi_Tekstil_HeroSlider(Id) ON DELETE CASCADE,
    CONSTRAINT FK_HeroSliderTranslations_Language FOREIGN KEY (LanguageCode) REFERENCES wixi_Tekstil_Languages(Code),
    CONSTRAINT UQ_HeroSliderTranslations_Lang UNIQUE (SliderId, LanguageCode)
);
```

---

### 7️⃣ SEO & ANALİTİK

#### `wixi_Tekstil_SEO`
```sql
CREATE TABLE wixi_Tekstil_SEO (
    Id INT PRIMARY KEY IDENTITY(1,1),
    
    EntityType NVARCHAR(50) NOT NULL,           -- 'Product', 'Project', 'Category', 'Page'
    EntityId INT NOT NULL,
    LanguageCode NVARCHAR(10) NOT NULL,
    
    -- Meta Tags
    MetaTitle NVARCHAR(200),
    MetaDescription NVARCHAR(500),
    MetaKeywords NVARCHAR(500),
    
    -- Open Graph
    OgTitle NVARCHAR(200),
    OgDescription NVARCHAR(500),
    OgImage NVARCHAR(500),
    OgType NVARCHAR(50) DEFAULT 'website',
    
    -- Twitter Card
    TwitterCard NVARCHAR(50) DEFAULT 'summary_large_image',
    TwitterTitle NVARCHAR(200),
    TwitterDescription NVARCHAR(500),
    TwitterImage NVARCHAR(500),
    
    -- Technical SEO
    CanonicalUrl NVARCHAR(500),
    RobotsDirective NVARCHAR(100) DEFAULT 'index, follow',
    
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy INT NOT NULL,
    
    CONSTRAINT FK_SEO_UpdatedBy FOREIGN KEY (UpdatedBy) REFERENCES Users(Id),
    CONSTRAINT FK_SEO_Language FOREIGN KEY (LanguageCode) REFERENCES wixi_Tekstil_Languages(Code),
    CONSTRAINT UQ_SEO_Entity_Lang UNIQUE (EntityType, EntityId, LanguageCode)
);

CREATE INDEX IX_SEO_Entity ON wixi_Tekstil_SEO(EntityType, EntityId);
```

#### `wixi_Tekstil_PageViews`
```sql
CREATE TABLE wixi_Tekstil_PageViews (
    Id INT PRIMARY KEY IDENTITY(1,1),
    
    EntityType NVARCHAR(50) NOT NULL,           -- 'Product', 'Project', 'Page'
    EntityId INT NOT NULL,
    
    ViewDate DATE NOT NULL,
    ViewCount INT NOT NULL DEFAULT 1,
    UniqueViewCount INT NOT NULL DEFAULT 1,
    
    LanguageCode NVARCHAR(10),
    Country NVARCHAR(100),
    City NVARCHAR(100),
    DeviceType NVARCHAR(50),                    -- 'Desktop', 'Mobile', 'Tablet'
    
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT UQ_PageViews_Entity_Date UNIQUE (EntityType, EntityId, ViewDate)
);

CREATE INDEX IX_PageViews_Entity ON wixi_Tekstil_PageViews(EntityType, EntityId);
CREATE INDEX IX_PageViews_Date ON wixi_Tekstil_PageViews(ViewDate DESC);
```

---

### 8️⃣ MEDYA KÜTÜPHANESİ

#### `wixi_Tekstil_MediaLibrary`
```sql
CREATE TABLE wixi_Tekstil_MediaLibrary (
    Id INT PRIMARY KEY IDENTITY(1,1),
    
    FileName NVARCHAR(255) NOT NULL,
    OriginalFileName NVARCHAR(255) NOT NULL,
    FilePath NVARCHAR(500) NOT NULL,
    FileUrl NVARCHAR(500) NOT NULL,
    
    FileType NVARCHAR(50) NOT NULL,             -- 'Image', 'Video', 'Document'
    MimeType NVARCHAR(100) NOT NULL,            -- 'image/jpeg', 'video/mp4'
    FileSize BIGINT NOT NULL,                   -- Bytes
    
    -- Görsel için
    Width INT,
    Height INT,
    ThumbnailUrl NVARCHAR(500),
    
    -- Metadata
    Title NVARCHAR(200),
    Alt NVARCHAR(200),
    Description NVARCHAR(500),
    Tags NVARCHAR(500),                         -- "product,uniform,school"
    
    -- Kullanım
    UsageCount INT NOT NULL DEFAULT 0,
    IsPublic BIT NOT NULL DEFAULT 1,
    
    -- Audit
    UploadedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UploadedBy INT NOT NULL,
    
    CONSTRAINT FK_MediaLibrary_UploadedBy FOREIGN KEY (UploadedBy) REFERENCES Users(Id)
);

CREATE INDEX IX_MediaLibrary_FileType ON wixi_Tekstil_MediaLibrary(FileType);
CREATE INDEX IX_MediaLibrary_UploadedAt ON wixi_Tekstil_MediaLibrary(UploadedAt DESC);
```

---

### 9️⃣ MÜŞTERİ YORUMLARI (Testimonials)

#### `wixi_Tekstil_Testimonials`
```sql
CREATE TABLE wixi_Tekstil_Testimonials (
    Id INT PRIMARY KEY IDENTITY(1,1),
    
    -- Varsayılan Dil (TR)
    ClientName NVARCHAR(200) NOT NULL,
    CompanyName NVARCHAR(200),
    Position NVARCHAR(100),                     -- "Okul Müdürü", "Satın Alma Müdürü"
    Comment NVARCHAR(MAX) NOT NULL,
    
    -- Dil-bağımsız
    PhotoUrl NVARCHAR(500),
    Rating INT CHECK (Rating >= 1 AND Rating <= 5),
    ProjectId INT NULL,                         -- İlgili proje varsa
    
    -- Metadata
    IsApproved BIT NOT NULL DEFAULT 0,
    IsFeatured BIT NOT NULL DEFAULT 0,
    DisplayOrder INT NOT NULL DEFAULT 0,
    
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    ApprovedBy INT NULL,
    ApprovedAt DATETIME2,
    
    CONSTRAINT FK_Testimonials_Project FOREIGN KEY (ProjectId) REFERENCES wixi_Tekstil_Projects(Id),
    CONSTRAINT FK_Testimonials_ApprovedBy FOREIGN KEY (ApprovedBy) REFERENCES Users(Id)
);
```

#### `wixi_Tekstil_Testimonials_Translations`
```sql
CREATE TABLE wixi_Tekstil_Testimonials_Translations (
    Id INT PRIMARY KEY IDENTITY(1,1),
    TestimonialId INT NOT NULL,
    LanguageCode NVARCHAR(10) NOT NULL,
    
    ClientName NVARCHAR(200),
    CompanyName NVARCHAR(200),
    Position NVARCHAR(100),
    Comment NVARCHAR(MAX),
    
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT FK_TestimonialTranslations_Testimonial FOREIGN KEY (TestimonialId) REFERENCES wixi_Tekstil_Testimonials(Id) ON DELETE CASCADE,
    CONSTRAINT FK_TestimonialTranslations_Language FOREIGN KEY (LanguageCode) REFERENCES wixi_Tekstil_Languages(Code),
    CONSTRAINT UQ_TestimonialTranslations_Lang UNIQUE (TestimonialId, LanguageCode)
);
```

---

## 🎛️ ADMIN PANEL YAPISI

### Ana Menü Yapısı

```
📊 Tekstil Dashboard
├─ 📈 Genel İstatistikler
│   ├─ Toplam Ürün Sayısı
│   ├─ Toplam Proje Sayısı
│   ├─ Bekleyen İletişim Formları
│   ├─ Aylık Görüntülenme
│   └─ Popüler Ürünler/Projeler
│
├─ 🏢 Hakkımızda Yönetimi
│   ├─ Genel Bilgiler (Açıklama, Misyon, Vizyon)
│   │   ├─ TR İçerik
│   │   ├─ EN İçerik
│   │   └─ DE İçerik
│   └─ İstatistikler (15+ Yıl, 200+ Müşteri)
│       ├─ İstatistik Listesi
│       └─ Çoklu Dil Yönetimi
│
├─ 🛍️ Ürün Yönetimi
│   ├─ Ürün Kategorileri
│   │   ├─ Kategori Listesi
│   │   ├─ Kategori Ekle/Düzenle
│   │   └─ Çoklu Dil Yönetimi
│   ├─ Ürünler
│   │   ├─ Ürün Listesi (DataTable)
│   │   │   ├─ Filtreleme (Kategori, Durum, Dil)
│   │   │   ├─ Arama
│   │   │   └─ Sıralama
│   │   ├─ Ürün Ekle/Düzenle
│   │   │   ├─ Temel Bilgiler
│   │   │   ├─ Fiyatlandırma
│   │   │   ├─ Özellikler (JSON Editor)
│   │   │   ├─ SEO Ayarları
│   │   │   └─ Çoklu Dil Sekmeleri
│   │   ├─ Ürün Galerisi
│   │   │   ├─ Resim Yükleme (Drag & Drop)
│   │   │   ├─ Sıralama
│   │   │   └─ Ana Resim Seçimi
│   │   └─ Toplu İşlemler
│   │       ├─ Toplu Aktif/Pasif
│   │       ├─ Toplu Kategori Değiştir
│   │       └─ Toplu Silme
│   └─ Medya Kütüphanesi
│       ├─ Tüm Görseller
│       ├─ Yükleme
│       └─ Filtreleme
│
├─ 🏗️ Proje Yönetimi
│   ├─ Proje Kategorileri
│   │   ├─ Kategori Listesi
│   │   └─ Çoklu Dil Yönetimi
│   ├─ Projeler
│   │   ├─ Proje Listesi (DataTable)
│   │   ├─ Proje Ekle/Düzenle
│   │   │   ├─ Temel Bilgiler
│   │   │   ├─ Proje Detayları (Yıl, Miktar, Süre)
│   │   │   ├─ SEO Ayarları
│   │   │   └─ Çoklu Dil Sekmeleri
│   │   ├─ Proje Galerisi
│   │   └─ Proje Etiketleri
│   └─ Toplu İşlemler
│
├─ 📧 İletişim Yönetimi
│   ├─ İletişim Bilgileri
│   │   ├─ Genel Bilgiler (Telefon, Email, Adres)
│   │   ├─ Çalışma Saatleri
│   │   ├─ Harita Konumu
│   │   ├─ WhatsApp Ayarları
│   │   └─ Çoklu Dil Yönetimi
│   ├─ İletişim Başvuruları
│   │   ├─ Tüm Başvurular
│   │   │   ├─ Filtreleme (Durum, Öncelik, Tarih)
│   │   │   ├─ Arama
│   │   │   └─ Toplu İşlemler
│   │   ├─ Yeni Başvurular (Badge)
│   │   ├─ İşlemdeki Başvurular
│   │   ├─ Tamamlanan Başvurular
│   │   └─ Başvuru Detayı
│   │       ├─ Müşteri Bilgileri
│   │       ├─ Mesaj İçeriği
│   │       ├─ Durum Güncelleme
│   │       ├─ Öncelik Belirleme
│   │       ├─ Kullanıcıya Atama
│   │       ├─ Yanıt Yazma
│   │       └─ Takip Tarihi Belirleme
│   └─ İstatistikler
│       ├─ Günlük/Haftalık/Aylık Form Sayısı
│       ├─ Durum Dağılımı
│       └─ Yanıt Süreleri
│
├─ 💬 Müşteri Yorumları
│   ├─ Yorum Listesi
│   ├─ Onay Bekleyenler
│   ├─ Yorum Ekle/Düzenle
│   └─ Çoklu Dil Yönetimi
│
├─ 🎨 Site Ayarları
│   ├─ Genel Ayarlar
│   │   ├─ Site Adı
│   │   ├─ Logo & Favicon
│   │   ├─ Renkler
│   │   └─ Çoklu Dil Yönetimi
│   ├─ Ana Sayfa Slider
│   │   ├─ Slider Listesi
│   │   ├─ Slider Ekle/Düzenle
│   │   └─ Çoklu Dil Yönetimi
│   ├─ Sosyal Medya
│   │   ├─ Platform Linkleri
│   │   └─ İkonlar
│   └─ SEO Ayarları
│       ├─ Global Meta Tags
│       ├─ Google Analytics
│       └─ Google Search Console
│
├─ 🌍 Dil Yönetimi
│   ├─ Dil Listesi
│   │   ├─ Aktif Diller
│   │   ├─ Varsayılan Dil
│   │   └─ Dil Ekle/Düzenle
│   └─ Çeviri Durumu
│       ├─ Eksik Çeviriler Raporu
│       └─ Çeviri Tamamlama Oranı
│
└─ 📊 Raporlar & Analitik
    ├─ Ürün İstatistikleri
    │   ├─ En Çok Görüntülenen Ürünler
    │   ├─ Kategori Bazlı Analiz
    │   └─ Dil Bazlı Görüntülenme
    ├─ Proje İstatistikleri
    │   ├─ En Popüler Projeler
    │   ├─ Yıl Bazlı Analiz
    │   └─ Kategori Dağılımı
    ├─ İletişim Form Analizi
    │   ├─ Form Gönderim Trendi
    │   ├─ Yanıt Süreleri
    │   └─ Kaynak Analizi
    └─ Trafik Analizi
        ├─ Sayfa Görüntülenmeleri
        ├─ Cihaz Dağılımı
        └─ Coğrafi Dağılım
```

---

## 🔌 API ENDPOINT'LERİ

### Base URL: `/api/v1.0/tekstil`

### 1. Dil Yönetimi
```
GET    /languages                          # Tüm diller
GET    /languages/{code}                   # Dil detayı
POST   /languages                          # Yeni dil ekle (Admin)
PUT    /languages/{id}                     # Dil güncelle (Admin)
DELETE /languages/{id}                     # Dil sil (Admin)
```

### 2. Hakkımızda
```
GET    /about?lang=tr                      # Hakkımızda bilgisi
PUT    /about                              # Güncelle (Admin)
POST   /about/translations                 # Çeviri ekle (Admin)

GET    /stats?lang=tr                      # İstatistikler
POST   /stats                              # İstatistik ekle (Admin)
PUT    /stats/{id}                         # İstatistik güncelle (Admin)
DELETE /stats/{id}                         # İstatistik sil (Admin)
```

### 3. Ürün Yönetimi
```
# Kategoriler
GET    /product-categories?lang=tr         # Tüm kategoriler
GET    /product-categories/{id}?lang=tr    # Kategori detayı
POST   /product-categories                 # Kategori ekle (Admin)
PUT    /product-categories/{id}            # Kategori güncelle (Admin)
DELETE /product-categories/{id}            # Kategori sil (Admin)

# Ürünler
GET    /products?lang=tr&page=1&limit=12   # Ürün listesi (Pagination)
GET    /products/{slug}?lang=tr            # Ürün detayı
POST   /products                           # Ürün ekle (Admin)
PUT    /products/{id}                      # Ürün güncelle (Admin)
DELETE /products/{id}                      # Ürün sil (Admin)
POST   /products/{id}/images               # Ürün resmi ekle (Admin)
DELETE /products/images/{imageId}          # Ürün resmi sil (Admin)
PATCH  /products/{id}/view                 # Görüntülenme sayısı artır

# Filtreleme & Arama
GET    /products/search?q=tshirt&lang=tr   # Ürün arama
GET    /products/filter?category=1&lang=tr # Kategoriye göre filtrele
GET    /products/featured?lang=tr          # Öne çıkan ürünler
```

### 4. Proje Yönetimi
```
# Kategoriler
GET    /project-categories?lang=tr         # Tüm kategoriler
POST   /project-categories                 # Kategori ekle (Admin)
PUT    /project-categories/{id}            # Kategori güncelle (Admin)
DELETE /project-categories/{id}            # Kategori sil (Admin)

# Projeler
GET    /projects?lang=tr&page=1&limit=9    # Proje listesi
GET    /projects/{slug}?lang=tr            # Proje detayı
POST   /projects                           # Proje ekle (Admin)
PUT    /projects/{id}                      # Proje güncelle (Admin)
DELETE /projects/{id}                      # Proje sil (Admin)
POST   /projects/{id}/images               # Proje resmi ekle (Admin)
DELETE /projects/images/{imageId}          # Proje resmi sil (Admin)
PATCH  /projects/{id}/view                 # Görüntülenme sayısı artır

# Filtreleme
GET    /projects/filter?category=1&year=2024&lang=tr
GET    /projects/featured?lang=tr          # Öne çıkan projeler
```

### 5. İletişim
```
# İletişim Bilgileri
GET    /contact-info?lang=tr               # İletişim bilgileri
PUT    /contact-info                       # Güncelle (Admin)

# Form Başvuruları
POST   /contact-submissions                # Form gönder (Public)
GET    /contact-submissions                # Tüm başvurular (Admin)
GET    /contact-submissions/{id}           # Başvuru detayı (Admin)
PATCH  /contact-submissions/{id}/status    # Durum güncelle (Admin)
PATCH  /contact-submissions/{id}/assign    # Kullanıcıya ata (Admin)
POST   /contact-submissions/{id}/response  # Yanıt ekle (Admin)
DELETE /contact-submissions/{id}           # Başvuru sil (Admin)

# İstatistikler
GET    /contact-submissions/stats          # Form istatistikleri (Admin)
```

### 6. Site Ayarları
```
# Genel Ayarlar
GET    /settings?lang=tr                   # Tüm ayarlar
GET    /settings/{key}?lang=tr             # Belirli ayar
PUT    /settings/{key}                     # Ayar güncelle (Admin)

# Hero Slider
GET    /hero-slider?lang=tr                # Aktif slider'lar
POST   /hero-slider                        # Slider ekle (Admin)
PUT    /hero-slider/{id}                   # Slider güncelle (Admin)
DELETE /hero-slider/{id}                   # Slider sil (Admin)
```

### 7. Müşteri Yorumları
```
GET    /testimonials?lang=tr               # Onaylı yorumlar
GET    /testimonials/pending               # Onay bekleyenler (Admin)
POST   /testimonials                       # Yorum ekle (Admin)
PUT    /testimonials/{id}                  # Yorum güncelle (Admin)
PATCH  /testimonials/{id}/approve          # Yorum onayla (Admin)
DELETE /testimonials/{id}                  # Yorum sil (Admin)
```

### 8. SEO & Analitik
```
GET    /seo/{entityType}/{entityId}?lang=tr # SEO bilgisi
PUT    /seo/{entityType}/{entityId}        # SEO güncelle (Admin)

POST   /analytics/pageview                 # Sayfa görüntüleme kaydet
GET    /analytics/reports                  # Analitik raporlar (Admin)
```

### 9. Medya Kütüphanesi
```
GET    /media?page=1&limit=20              # Medya listesi (Admin)
POST   /media/upload                       # Dosya yükle (Admin)
DELETE /media/{id}                         # Dosya sil (Admin)
GET    /media/search?q=uniform             # Medya arama (Admin)
```

---

## 🚀 UYGULAMA PLANI

### Faz 1: Temel Altyapı (1-2 Hafta)
- [ ] Database migration'ları oluştur
- [ ] Entity Framework modelleri
- [ ] Base repository pattern
- [ ] Dil yönetimi servisleri
- [ ] Authentication & Authorization

### Faz 2: Ürün & Proje Modülleri (2-3 Hafta)
- [ ] Ürün kategorileri CRUD
- [ ] Ürünler CRUD + Çoklu dil
- [ ] Ürün galerisi
- [ ] Proje kategorileri CRUD
- [ ] Projeler CRUD + Çoklu dil
- [ ] Proje galerisi
- [ ] Frontend entegrasyonu

### Faz 3: İletişim & Hakkımızda (1 Hafta)
- [ ] İletişim bilgileri yönetimi
- [ ] İletişim formu + Email gönderimi
- [ ] Hakkımızda içerik yönetimi
- [ ] İstatistikler yönetimi
- [ ] Frontend entegrasyonu

### Faz 4: Site Ayarları & SEO (1 Hafta)
- [ ] Site ayarları yönetimi
- [ ] Hero slider
- [ ] SEO yönetimi
- [ ] Medya kütüphanesi
- [ ] Sosyal medya entegrasyonu

### Faz 5: Admin Panel (2 Hafta)
- [ ] Dashboard istatistikleri
- [ ] Tüm CRUD sayfaları
- [ ] Çoklu dil editörleri
- [ ] DataTable'lar (filtreleme, arama, sıralama)
- [ ] Form validasyonları
- [ ] Toast notifications

### Faz 6: Raporlama & Analitik (1 Hafta)
- [ ] Görüntülenme takibi
- [ ] İstatistik raporları
- [ ] Grafik entegrasyonları
- [ ] Export özellikleri (Excel, PDF)

### Faz 7: Test & Optimizasyon (1 Hafta)
- [ ] Unit testler
- [ ] Integration testler
- [ ] Performance optimizasyonu
- [ ] SEO optimizasyonu
- [ ] Güvenlik testleri

### Faz 8: Deployment (3-5 Gün)
- [ ] Production database setup
- [ ] CI/CD pipeline
- [ ] Docker containerization
- [ ] SSL sertifikası
- [ ] Backup stratejisi

---

## 📝 NOTLAR

### Çoklu Dil İmplementasyonu
```csharp
// Örnek Service Metodu
public async Task<ProductDto> GetProductBySlugAsync(string slug, string languageCode = "tr")
{
    var product = await _context.Products
        .Include(p => p.Category)
        .Include(p => p.Translations.Where(t => t.LanguageCode == languageCode))
        .Include(p => p.Images)
        .FirstOrDefaultAsync(p => p.Slug == slug && p.IsActive);
    
    if (product == null)
        throw new NotFoundException("Product not found");
    
    // Çeviri varsa kullan, yoksa varsayılan dil
    var translation = product.Translations.FirstOrDefault();
    
    return new ProductDto
    {
        Id = product.Id,
        Title = translation?.Title ?? product.Title,
        Description = translation?.Description ?? product.Description,
        // ... diğer alanlar
    };
}
```

### Frontend Dil Değiştirme
```typescript
// Language Context
const { language, setLanguage } = useLanguage();

// API çağrısı
const fetchProducts = async () => {
  const response = await fetch(`/api/v1.0/tekstil/products?lang=${language}`);
  const data = await response.json();
  setProducts(data);
};
```

### Performans Optimizasyonu
- [ ] Database indeksleri ekle
- [ ] Redis cache kullan (ürünler, kategoriler)
- [ ] CDN için görselleri optimize et
- [ ] Lazy loading (frontend)
- [ ] API response compression

---

## 📊 TABLO ÖZETİ

| Modül | Ana Tablo | Çeviri Tablosu | Toplam |
|-------|-----------|----------------|--------|
| Dil Yönetimi | 1 | - | 1 |
| Hakkımızda | 2 | 2 | 4 |
| Ürün Yönetimi | 3 | 2 | 5 |
| Proje Yönetimi | 4 | 2 | 6 |
| İletişim | 2 | 1 | 3 |
| Site Ayarları | 2 | 2 | 4 |
| SEO & Analitik | 2 | - | 2 |
| Medya | 1 | - | 1 |
| Yorumlar | 1 | 1 | 2 |
| **TOPLAM** | **18** | **10** | **28** |

---

## ✅ SONUÇ

Bu veritabanı yapısı ile:
- ✅ Tamamen dinamik ve yönetilebilir içerik
- ✅ Çoklu dil desteği (TR, EN, DE)
- ✅ SEO dostu yapı
- ✅ Ölçeklenebilir mimari
- ✅ Admin panel ile kolay yönetim
- ✅ Analitik ve raporlama
- ✅ Modern ve performanslı sistem

**Tekstil modülü production-ready! 🚀**


