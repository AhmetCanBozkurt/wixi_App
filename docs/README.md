# docs/ — Wixi Platform Dokümanları

Bu klasör proje dokümanlarını kategoriye göre organize eder.
Tüm PRD'ler ve mimari kararlar aynı zamanda **ClickUp Docs**'ta da tutulur:
→ https://app.clickup.com/90182037936/docs/2kzm9cdg-1618

---

## Klasör Yapısı

```
docs/
├── prd/                        # Ürün Gereksinimleri (Product Requirements)
│   ├── platform-prd.md         # Ana platform vizyonu ve mimari kararlar
│   ├── mailing-prd.md          # Mail entegrasyon sistemi gereksinimleri
│   ├── auth-refactor-prd.md    # Auth prod-ready hardening
│   ├── ecommerce-prd.md        # E-ticaret SaaS platform gereksinimleri
│   └── [yeni-modul]-prd.md     # Her yeni modül için buraya eklenir
│
├── architecture/               # Teknik Mimari Kararlar
│   ├── ecommerce-architecture.md   # Modular monolith vs microservices analizi
│   ├── multi-language.md           # Lokalizasyon mimarisi
│   └── core-checklist.md           # Platform sağlık durumu (yaşayan doküman)
│
├── design-system/              # UI/UX Standartları
│   ├── theme-standards.md      # CSS değişkenleri, glassmorphism, renk paleti
│   └── component-patterns.md   # Component yapısı, FSD pattern kuralları
│
├── decisions/                  # Feature Implementation Notları
│   └── 2fa-implementation-plan.md  # 2FA, Remember Me, Forgot Password planı
│
└── archive/                    # Artık Kullanılmayan Dosyalar
    ├── TASKS-legacy.md         # Eski Linear/manuel görev takibi (yerini ClickUp aldı)
    └── project-analysis-prompt.md  # AI bootstrap promptu
```

---

## Kural: Yeni Doküman Eklerken

| İçerik türü | Nereye? |
|-------------|---------|
| Yeni modül/feature gereksinimleri | `prd/[modul]-prd.md` + ClickUp Docs'a sayfa ekle |
| Mimari karar (ADR) | `architecture/` + ClickUp Docs'a sayfa ekle |
| Küçük feature spec | İlgili ClickUp görevinin **description** alanına yaz |
| UI/tasarım standardı | `design-system/` (repo'da kalır) |
| Tamamlanan feature notu | `decisions/` (repo'da kalır) |
