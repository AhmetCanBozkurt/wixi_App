# M05 — Müşteri Destek (Ticket / SLA)

> **Durum:** ❌ Greenfield (iletişim formu hariç) · **Faz:** 2 · **Öncelik:** 🔴 Kritik · **Detay:** 🔨 Tasarlanıyor
> [← INDEX'e dön](../INDEX.md) · [DECISIONS.md](../DECISIONS.md)

> **✅ Kararlar:** Ticket tabloları ECommerce içinde `Application/Crm/Support/` (D-04), `ECommerceDbContext` (D-05). SLA ihlal kontrolü `BackgroundService` (D-06). Ek dosyalar D-02 (relativePath/varbinary). Kategori/öncelik **enum** (D-03), per-tenant config değil.

## Kapsam
Omnichannel destek: ticket yönetimi, SLA takibi, eskalasyon, mesaj zinciri, CSAT, bilgi tabanı. Mevcut sadece iletişim formu — ticket sistemi yok.

---

## Mevcut Durum (kodda ne var)
| Var | İçerik |
|---|---|
| `WixiContactFormSubmission` | Basit form: `FullName, Email, Phone, Subject, Message, IsRead, ReadAt, IpAddress, SubmittedAt` |
| `StoreAdminContactSubmissionsController` | GET · PUT{id}/mark-read · DELETE{id} |

> İletişim formu ≠ ticket: zincir, atama, SLA, durum, CSAT yok. Ama **forma gelen mesaj ticket'a dönüştürülebilir** (kaynak).

## İlgili Tablolar (ideal → mevcut)
| İdeal | Hedef Entity | Durum |
|---|---|---|
| SUPPORT_TICKETS | `WixiSupportTicket` (yeni) | ❌ |
| SUPPORT_TICKET_MESSAGES | `WixiSupportTicketMessage` (yeni) | ❌ |

## Bağımlılıklar
- **Girdi:** M02 Müşteri / M04 Cari (talep sahibi), M06 Sipariş, M09 İade (ilişkili kayıt), M00 (mail template — CSAT/bildirim).
- **Çıktı:** M02 (360° kartında ticket geçmişi), M13 (CSAT, ort. çözüm süresi).

---

## Detay Tasarım

### 1. Veri Modeli

#### 1.1. `WixiSupportTicket`
```
Id, TicketNumber (unique 'TKT-00001')
CustomerId?, CariId?       // B2C veya B2B talep sahibi
Subject
Channel   enum { Email, Chat, Phone, WhatsApp, Form }
Category  enum { Order, Delivery, Return, Payment, Product, Other }   // D-03 enum
Priority  enum { Low, Normal, High, Urgent }
Status    enum { Open, Pending, Resolved, Closed }
AssignedToUserId?          // temsilci
RelatedOrderId?, RelatedReturnId?   // M06/M09 bağı
// SLA
SlaDueAt DateTime?, SlaBreached bool
FirstResponseAt, ResolvedAt, ClosedAt  DateTime?
// CSAT
CsatScore int?  (1-5), CsatComment string?
+ IAuditable
```

#### 1.2. `WixiSupportTicketMessage`
```
Id, TicketId (FK)
SenderType enum { Customer, Agent, System }
SenderId Guid?
Content
IsInternal bool            // iç not (müşteri görmez)
Attachments string         // D-02: ek dosyalar relativePath/varbinary, tam URL değil
+ IAuditable
```

---

### 2. SLA & Akış

| Kural | Mantık |
|---|---|
| **SLA hesabı** | `Priority`'ye göre hedef süre (Urgent=2s, High=8s, Normal=24s, Low=48s — store-admin ayarı). `SlaDueAt = CreatedAt + hedef`. |
| **İlk yanıt** | İlk `Agent` mesajı → `FirstResponseAt`. |
| **SLA ihlali** | `BackgroundService` (D-06): `now > SlaDueAt && Status ∈ {Open,Pending}` → `SlaBreached=true` + eskalasyon (yöneticiye bildirim). |
| **Durum** | Open → Pending (müşteri bekleniyor) → Resolved → Closed. Resolved'da CSAT anketi (mail, M00). |
| **CSAT** | Çözümden sonra müşteriye anket maili → `CsatScore`. |
| **Form→ticket** | `WixiContactFormSubmission` "Ticket'a dönüştür" → `Channel=Form` ticket. |

---

### 3. CQRS (`Application/Crm/Support/`)

| Komut | İş |
|---|---|
| `CreateTicketCommand` | Yeni ticket (storefront/store-admin/form dönüşüm) |
| `AddTicketMessageCommand` | Yanıt/iç not ekle (ek dosya D-02) |
| `AssignTicketCommand` | Temsilci ata |
| `UpdateTicketStatusCommand` | Durum geçişi (Resolved'da CSAT tetikle) |
| `SubmitCsatCommand` | Müşteri memnuniyet puanı |

| Sorgu | İş |
|---|---|
| `GetTicketsQuery` | Liste (durum/öncelik/atama/SLA filtre) |
| `GetTicketByIdQuery` | Detay (mesaj zinciri + müşteri + ilişkili sipariş/iade) |
| `GetMyTicketsQuery` | Müşteri kendi ticket'ları (storefront) |
| `GetSupportStatsQuery` | CSAT ort., çözüm süresi, SLA ihlal oranı (M13) |

> **Event (D-04):** `TicketSlaBreachedEvent` → eskalasyon bildirimi; `TicketResolvedEvent` → CSAT mail.

---

### 4. Endpoint'ler

| Katman | Metot | Route |
|---|---|---|
| Storefront | POST · GET my · GET{id} · POST{id}/messages | `/public/storefront/tickets` |
| Store-admin | GET · GET{id} · POST{id}/messages | `/store-admin/tickets` |
| Store-admin | PATCH{id}/assign · /status · POST convert (form→ticket) | `/store-admin/tickets/{id}/...` |
| Store-admin | GET stats | `/store-admin/tickets/stats` |
| Storefront | POST{id}/csat | `/public/storefront/tickets/{id}/csat` |

---

### 5. Frontend

| Sayfa | Durum | İş |
|---|---|---|
| Store-admin destek paneli | ❌ yeni | Ticket listesi (SLA renk kodu) + detay (mesaj zinciri + iç not + atama + durum) |
| Storefront "Destek" | ❌ yeni | Ticket oluştur + takip + yanıt + CSAT |
| `StoreContactSubmissionsPage` | 🟡 | "Ticket'a dönüştür" butonu |

> Zorunlu shared UI; ek dosya D-02 (`ImageUploadField`/dosya). Mesaj zinciri özel component.

---

## Açık Sorular
- **O-D1:** Omnichannel kanal entegrasyonu (WhatsApp/canlı chat) hangi faz? → öneri: temel ticket + e-posta önce; chat/WhatsApp sonraki aşama.
- **O-D2:** SLA hedef süreleri sabit mi per-tenant ayar mı? → öneri: per-tenant ayar (öncelik bazlı), enum değil değer.
- **O-D3:** Bilgi tabanı (SSS/self-servis makale) M05'te mi ayrı mı? → mevcut `WixiFaqItem` var; entegre edilebilir.

## Detay Tasarım (TODO)
- [ ] `WixiSupportTicket` + `WixiSupportTicketMessage` entity + DbSet + migration
- [ ] SLA hesabı + `SupportSlaWorker` (BackgroundService, D-06) + eskalasyon
- [ ] Durum makinesi + CSAT akışı (mail M00)
- [ ] Form→ticket dönüşümü (`WixiContactFormSubmission`)
- [ ] `TicketSlaBreachedEvent` / `TicketResolvedEvent`
- [ ] CQRS (Application/Crm/Support/) + storefront/store-admin endpoint'ler
- [ ] Frontend: store-admin destek paneli + storefront destek + form dönüştür butonu
- [ ] Ek dosya yükleme (D-02)
