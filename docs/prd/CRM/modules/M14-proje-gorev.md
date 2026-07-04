# M14 — Proje & Görev Yönetimi (Kanban / Gantt / Zaman Takibi)

> **Durum:** 🟢 Çekirdek uygulandı (2026-07-04) — kalanlar TODO'da · **Faz:** 5 · **Öncelik:** 🟠 Yüksek · **Detay:** ✔️ Çekirdek
> **Kararlar (2026-07-04):** O-P1 → ayrı `Wixi.Modules.ProjectManagement` modülü + `ModuleName="tasks"` provisioner. O-P2 → UI store-admin'e (`/tenant/{slug}/projects`), `/admin/projects` mock şimdilik duruyor.
> [← INDEX'e dön](../INDEX.md) · [DECISIONS.md](../DECISIONS.md) · Eski analiz: [project-management-prd.md](../../project-management-prd.md)

> **✅ Kararlar (miras):** Ek dosyalar D-02 (relativePath/varbinary, tam URL yasak). Statü/öncelik **enum** (D-03). Zaman takibi hatırlatma/rapor job'ları `BackgroundService` (D-06). Modül sınırı → **O-P1 açık soru** (aşağıda).

## Kapsam
Proje tanımı (müşteri/cari bağlantılı), görev yönetimi (Kanban + Liste + Gantt), alt görev, atama, yorum & aktivite logu, dosya eki, görev bağımlılığı, zaman takibi (play/stop), milestone → fatura entegrasyonu. CRM tarafındaki karşılığı: "bu müşteri için hangi işler yürüyor" görünümü.

---

## Mevcut Durum (kodda ne var)

| Var | İçerik | Durum |
|---|---|---|
| `pages/admin/ProjectManagementPage` | Kanban (dnd-kit sürükle-bırak çalışıyor), Liste, Gantt sekmeleri; istatistik kartları | 🟡 Tamamen mock — 5 görev `useState` içinde, yenileyince kaybolur |
| Route `/admin/projects` | `App.tsx` içinde kayıtlı, AuthGuard arkasında | ✅ |
| Görev ekleme/düzenleme modalları | — | ❌ Yok |
| Backend entity / controller / CQRS | `WixiProject`, `WixiTask`, `WixiTimeEntry` hiçbiri yok (grep doğrulandı) | ❌ Sıfır |
| Tenant provisioning | Onboarding'de `tasks` modül id'si `EnabledModules`'e yazılıyor ama **provisioner yok** → DB'de tablo oluşmuyor | ❌ |

> Frontend `Task` tipi (mock): `status: todo/inprogress/review/done`, `priority: low/medium/high`, `assignees`, `dueDate`, `progress`, `startDate`, `duration` — backend tasarımı bu alanları karşılamalı.

## İlgili Tablolar (ideal → hedef)

| İdeal | Hedef Entity | Durum |
|---|---|---|
| PROJECTS | `WixiProject` (yeni) | ❌ |
| PROJECT_MEMBERS | `WixiProjectMember` (yeni) | ❌ |
| TASKS | `WixiTask` (yeni, self-FK ile alt görev) | ❌ |
| TASK_ASSIGNEES | `WixiTaskAssignee` (yeni) | ❌ |
| TASK_DEPENDENCIES | `WixiTaskDependency` (yeni — Gantt) | ❌ |
| TASK_COMMENTS | `WixiTaskComment` (yeni) | ❌ |
| TASK_ATTACHMENTS | `WixiTaskAttachment` (yeni, D-02) | ❌ |
| TIME_ENTRIES | `WixiTimeEntry` (yeni) | ❌ |

## Bağımlılıklar
- **Girdi:** M02 Müşteri / M04 Cari (proje sahibi bağı — `CustomerId?`/`CariId?`), Core kullanıcılar (atama, zaman takibi), M00 (mail template — görev atama/deadline bildirimi).
- **Çıktı:** M12 Finans (milestone → fatura taslağı, proje maliyeti), M13 Raporlama (hakediş, zaman raporu, proje kârlılığı), M02 (360° müşteri kartında "Devam Eden Projeler").

---

## Detay Tasarım

### 1. Veri Modeli

#### 1.1. `WixiProject`
```
Id, Code (unique 'PRJ-00001'), Name, Description?
CustomerId?, CariId?            // M02/M04 bağı — B2C veya B2B
Status   enum { Active, OnHold, Completed, Cancelled }   // D-03
StartDate, EndDate?             // plan
Budget decimal?, Currency?      // M12 maliyet takibi
Color?                          // UI etiket rengi
+ IAuditable
```

#### 1.2. `WixiTask`
```
Id, ProjectId (FK), ParentTaskId?     // self-FK → alt görev
Title, Description?
Status   enum { Todo, InProgress, Review, Done }          // frontend ile birebir
Priority enum { Low, Medium, High, Urgent }
Progress int (0-100)
StartDate?, DueDate?, Duration int?   // Gantt çizimi
SortOrder int                          // kanban kolon içi sıra
CompletedAt DateTime?
+ IAuditable
```

#### 1.3. Yardımcı tablolar
```
WixiTaskAssignee    : TaskId, UserId (unique çift)
WixiTaskDependency  : TaskId, DependsOnTaskId, Type enum { FinishToStart, StartToStart }
WixiTaskComment     : TaskId, UserId, Content, IsSystemLog bool   // aktivite logu da buraya (IsSystemLog=true)
WixiTaskAttachment  : TaskId, FileName, RelativePath (D-02), Size
WixiTimeEntry       : TaskId, UserId, StartedAt, EndedAt?, DurationMinutes, Note?
                      // EndedAt null → sayaç çalışıyor (tek aktif entry/user kuralı)
```

---

### 2. Akış Kuralları

| Kural | Mantık |
|---|---|
| **Kanban sürükle** | Kart taşıma → `UpdateTaskStatusCommand` (yeni status + SortOrder). Optimistic UI, hata → geri al. |
| **Progress** | `Done` → otomatik 100; alt görevleri olan görevde progress = alt görev ortalaması (hesaplanan). |
| **Bağımlılık** | `FinishToStart`: bağımlı olduğu görev `Done` değilse `InProgress`'e çekilirse uyarı (engel değil, uyarı — O-P4). |
| **Zaman takibi** | Play → açık `WixiTimeEntry` (EndedAt=null). Aynı kullanıcıda ikinci Play → öncekini otomatik kapat. Stop → süre hesabı. |
| **Aktivite logu** | Status/atama/tarih değişimi → `WixiTaskComment(IsSystemLog=true)` satırı. |
| **Bildirim** | Atama ve yaklaşan deadline → mail (M00 template). Deadline taraması `BackgroundService` (D-06). |
| **Milestone → fatura** | Proje `Completed` veya işaretli görev `Done` → M12'ye `ProjectMilestoneCompletedEvent` (fatura taslağı — M12 fazında). |

---

### 3. CQRS (`Application/ProjectManagement/`)

| Komut | İş |
|---|---|
| `CreateProjectCommand` / `UpdateProjectCommand` | Proje CRUD (cari bağı dahil) |
| `CreateTaskCommand` / `UpdateTaskCommand` | Görev CRUD (alt görev = ParentTaskId) |
| `UpdateTaskStatusCommand` | Kanban taşıma (status + SortOrder, aktivite logu) |
| `AssignTaskCommand` | Atama ekle/çıkar (bildirim mail) |
| `AddTaskCommentCommand` | Yorum (+ ek dosya D-02) |
| `AddTaskDependencyCommand` | Gantt bağımlılığı (döngü kontrolü!) |
| `StartTimeEntryCommand` / `StopTimeEntryCommand` | Zaman takibi play/stop |

| Sorgu | İş |
|---|---|
| `GetProjectsQuery` | Liste (durum/cari filtre) |
| `GetProjectBoardQuery` | Tek proje: görevler + atamalar + bağımlılıklar (kanban/gantt tek istek) |
| `GetTaskByIdQuery` | Detay (yorum + ek + zaman + alt görevler) |
| `GetMyTasksQuery` | Kullanıcının atandığı görevler (cross-project) |
| `GetTimeReportQuery` | Kullanıcı/proje bazlı süre toplamı (hakediş — M13) |

> **Event:** `TaskAssignedEvent` → mail; `ProjectMilestoneCompletedEvent` → M12; `TaskDeadlineApproachingEvent` → bildirim worker.

---

### 4. Endpoint'ler

| Metot | Route |
|---|---|
| GET · POST · PUT{id} · DELETE{id} | `/projects` |
| GET | `/projects/{id}/board` (kanban+gantt datası) |
| GET · POST · PUT{id} · DELETE{id} | `/projects/{id}/tasks` |
| PATCH | `/tasks/{id}/status` · `/tasks/{id}/assignees` |
| POST · GET | `/tasks/{id}/comments` · `/tasks/{id}/attachments` |
| POST · DELETE | `/tasks/{id}/dependencies` |
| POST | `/tasks/{id}/time/start` · `/tasks/{id}/time/stop` |
| GET | `/tasks/my` · `/time-report` |

---

### 5. Frontend

| Sayfa/Parça | Durum | İş |
|---|---|---|
| `ProjectManagementPage` kanban/list/gantt | 🟡 | Mock `useState` → `GetProjectBoardQuery` API bağla; dnd drop → `PATCH status` |
| Proje seçici + proje CRUD modalı | ❌ yeni | Üst barda proje dropdown (`Select`), proje ekle/düzenle `Modal` (cari bağı `Select`) |
| Görev ekle/düzenle modalı | ❌ yeni | Zorunlu shared UI (`Input`, `Select`, `MultiSelect` atama, `Button`) |
| Görev detay paneli | ❌ yeni | Yorum zinciri + aktivite logu + ek dosya + alt görevler + zaman sayacı (Play/Stop) |
| İstatistik kartları | 🟡 | Statik → gerçek sayılar (`GetProjectsQuery` özet) |
| Müşteri 360° kartı (M02) | ❌ | "Devam Eden Projeler" sekmesi (M02 fazında) |

> Sayfa `pages/admin/` altında doğru konumda; entity katmanı `entities/Project/` (tip + GET api + store), mutation'lar `features/ProjectManagement/` altına (FSD).

---

## Açık Sorular
- **O-P1 — Modül sınırı:** Ayrı `Wixi.Modules.ProjectManagement` mi, ECommerce içi mi, Core mu? Onboarding'de `tasks` ayrı satılabilir modül olarak listeleniyor → **öneri: ayrı modül + kendi `ProjectManagementTenantProvisioner`'ı (`ModuleName = "tasks"`)** — CLAUDE.md'deki 3 adımlı provisioner kalıbı uygulanır. D-04 (CRM=ECommerce içi) kararı burayı bağlamaz çünkü proje yönetimi e-ticarete değil tenant'ın kendi operasyonuna hizmet eder.
- **O-P2 — Panel yeri:** Sayfa şu an platform admin'de (`/admin/projects`). Modül tenant'a satılıyorsa asıl yeri **store-admin** (tenant kullanıcıları). → öneri: backend per-tenant DB'ye kurulur, UI store-admin'e taşınır; `/admin/projects` platform iç ekibi için kalabilir.
- **O-P3 — Hakediş:** Zaman kayıtlarının ücretlendirmesi (saatlik ücret alanı) M14'te mi M12'de mi? → öneri: `WixiTimeEntry` sadece süre tutar; ücret/hakediş M12.
- **O-P4 — Bağımlılık davranışı:** İhlalde engelle mi uyar mı? → öneri: uyar (soft), Gantt'ta kırmızı bağlantı.

## Detay Tasarım (TODO)
- [x] O-P1 kararı: modül projesi (`Wixi.Modules.ProjectManagement`) + DbContext + provisioner (`ModuleName="tasks"`) *(2026-07-04)*
- [x] 8 entity + DbSet + `InitialProjectManagement` migration *(2026-07-04)*
- [x] CQRS (`Application/Projects/`) + `StoreAdminProjectsController` *(2026-07-04)*
- [x] Kanban API bağlama — `StoreProjectsPage` (store-admin) optimistic drag-drop *(2026-07-04)*
- [x] Proje/görev modalları + görev detay paneli (alt görev + yorum/aktivite) *(2026-07-04)*
- [x] Store-admin sidebar menüsü (`tasks` modülü, TEST DB — `scripts/sql/2026-07-04_tasks-module-menu.sql`)
- [x] Zaman takibi (play/stop, tek aktif entry kuralı) — endpoint + görev detayında sayaç paneli *(2026-07-04)*
- [ ] Bağımlılık döngü kontrolü + Gantt bağlantı çizimi — entity hazır
- [ ] Atama seçici (tenant kullanıcı listesi endpoint'i) — backend `SetTaskAssigneesCommand` hazır
- [ ] Bildirim worker (deadline, D-06) + atama maili (M00)
- [ ] `ProjectMilestoneCompletedEvent` → M12 köprüsü (M12 fazında)
- [ ] M02 360° kartına "Devam Eden Projeler" (M02 fazında)
