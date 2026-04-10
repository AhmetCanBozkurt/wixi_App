-- Add Project Reference Translations
-- Proje Referansları için Çeviri Anahtarları

-- Delete existing translations if any
DELETE FROM wixi_I18nTranslations 
WHERE [Key] LIKE 'projectRef.%';

-- Insert new translations
INSERT INTO wixi_I18nTranslations ([Key], Turkish, English, German, Arabic)
VALUES
-- Page Title
('projectRef.title', N'Proje Referansları', N'Project References', N'Projektreferenzen', N'مراجع المشاريع'),
('projectRef.subtitle', N'Başarılı Denklik Belgesi Projeleri', N'Successful Recognition Certificate Projects', N'Erfolgreiche Anerkennungszertifikat-Projekte', N'مشاريع شهادات الاعتراف الناجحة'),

-- Stats
('projectRef.stats.totalProjects', N'Başarılı Proje', N'Successful Projects', N'Erfolgreiche Projekte', N'مشاريع ناجحة'),
('projectRef.stats.avgDays', N'Ort. İşlem Süresi', N'Avg. Processing Time', N'Durchschn. Bearbeitungszeit', N'متوسط وقت المعالجة'),
('projectRef.stats.fastestProject', N'En Hızlı Proje', N'Fastest Project', N'Schnellstes Projekt', N'أسرع مشروع'),
('projectRef.stats.successRate', N'Başarı Oranı', N'Success Rate', N'Erfolgsquote', N'معدل النجاح'),
('projectRef.stats.days', N'Gün', N'Days', N'Tage', N'أيام'),

-- Table Columns
('projectRef.column.title', N'Proje Başlığı', N'Project Title', N'Projekttitel', N'عنوان المشروع'),
('projectRef.column.clientName', N'Müşteri', N'Client', N'Kunde', N'العميل'),
('projectRef.column.country', N'Ülke', N'Country', N'Land', N'البلد'),
('projectRef.column.documentType', N'Belge Türü', N'Document Type', N'Dokumenttyp', N'نوع المستند'),
('projectRef.column.university', N'Üniversite', N'University', N'Universität', N'الجامعة'),
('projectRef.column.applicationDate', N'Başvuru Tarihi', N'Application Date', N'Antragsdatum', N'تاريخ التقديم'),
('projectRef.column.approvalDate', N'Onay Tarihi', N'Approval Date', N'Genehmigungsdatum', N'تاريخ الموافقة'),
('projectRef.column.processingDays', N'İşlem Süresi', N'Processing Days', N'Bearbeitungstage', N'أيام المعالجة'),
('projectRef.column.status', N'Durum', N'Status', N'Status', N'الحالة'),
('projectRef.column.featured', N'Öne Çıkan', N'Featured', N'Hervorgehoben', N'مميز'),
('projectRef.column.active', N'Aktif', N'Active', N'Aktiv', N'نشط'),
('projectRef.column.displayOrder', N'Sıra', N'Order', N'Reihenfolge', N'الترتيب'),
('projectRef.column.actions', N'İşlemler', N'Actions', N'Aktionen', N'الإجراءات'),

-- Actions
('projectRef.action.create', N'Yeni Proje Ekle', N'Add New Project', N'Neues Projekt hinzufügen', N'إضافة مشروع جديد'),
('projectRef.action.edit', N'Düzenle', N'Edit', N'Bearbeiten', N'تحرير'),
('projectRef.action.delete', N'Sil', N'Delete', N'Löschen', N'حذف'),
('projectRef.action.view', N'Görüntüle', N'View', N'Ansehen', N'عرض'),
('projectRef.action.toggleActive', N'Aktif/Pasif', N'Toggle Active', N'Aktiv/Inaktiv', N'تبديل النشط'),
('projectRef.action.toggleFeatured', N'Öne Çıkar', N'Toggle Featured', N'Hervorheben umschalten', N'تبديل المميز'),

-- Form Fields
('projectRef.form.title', N'Başlık', N'Title', N'Titel', N'العنوان'),
('projectRef.form.titleTr', N'Başlık (TR)', N'Title (TR)', N'Titel (TR)', N'العنوان (TR)'),
('projectRef.form.titleDe', N'Başlık (DE)', N'Title (DE)', N'Titel (DE)', N'العنوان (DE)'),
('projectRef.form.titleEn', N'Başlık (EN)', N'Title (EN)', N'Titel (EN)', N'العنوان (EN)'),
('projectRef.form.titleAr', N'Başlık (AR)', N'Title (AR)', N'Titel (AR)', N'العنوان (AR)'),

('projectRef.form.description', N'Açıklama', N'Description', N'Beschreibung', N'الوصف'),
('projectRef.form.descriptionTr', N'Açıklama (TR)', N'Description (TR)', N'Beschreibung (TR)', N'الوصف (TR)'),
('projectRef.form.descriptionDe', N'Açıklama (DE)', N'Description (DE)', N'Beschreibung (DE)', N'الوصف (DE)'),
('projectRef.form.descriptionEn', N'Açıklama (EN)', N'Description (EN)', N'Beschreibung (EN)', N'الوصف (EN)'),
('projectRef.form.descriptionAr', N'Açıklama (AR)', N'Description (AR)', N'Beschreibung (AR)', N'الوصف (AR)'),

('projectRef.form.clientName', N'Müşteri Adı', N'Client Name', N'Kundenname', N'اسم العميل'),
('projectRef.form.clientNamePlaceholder', N'A. Y. (Anonim kalabilir)', N'A. Y. (Can be anonymous)', N'A. Y. (Kann anonym sein)', N'A. Y. (يمكن أن يكون مجهولاً)'),

('projectRef.form.country', N'Ülke', N'Country', N'Land', N'البلد'),
('projectRef.form.documentType', N'Belge Türü', N'Document Type', N'Dokumenttyp', N'نوع المستند'),
('projectRef.form.university', N'Üniversite/Kurum', N'University/Institution', N'Universität/Institution', N'الجامعة/المؤسسة'),

('projectRef.form.applicationDate', N'Başvuru Tarihi', N'Application Date', N'Antragsdatum', N'تاريخ التقديم'),
('projectRef.form.approvalDate', N'Onay Tarihi', N'Approval Date', N'Genehmigungsdatum', N'تاريخ الموافقة'),
('projectRef.form.processingDays', N'İşlem Süresi (Gün)', N'Processing Days', N'Bearbeitungstage', N'أيام المعالجة'),

('projectRef.form.status', N'Durum', N'Status', N'Status', N'الحالة'),
('projectRef.form.statusPlaceholder', N'Onaylandı, Hızlı Süreç, vb.', N'Approved, Fast Process, etc.', N'Genehmigt, Schneller Prozess, usw.', N'تمت الموافقة، معالجة سريعة، إلخ.'),

('projectRef.form.highlights', N'Öne Çıkan Özellikler', N'Highlights', N'Highlights', N'المميزات'),
('projectRef.form.highlightsPlaceholder', N'Virgül ile ayırın: Hızlı işlem, Ek belge gerektirmedi', N'Comma separated: Fast process, No extra documents', N'Komma getrennt: Schneller Prozess, Keine zusätzlichen Dokumente', N'مفصولة بفواصل: معالجة سريعة، لا مستندات إضافية'),

('projectRef.form.documentImage', N'Belge Görseli', N'Document Image', N'Dokumentbild', N'صورة المستند'),
('projectRef.form.uploadImage', N'Görsel Yükle', N'Upload Image', N'Bild hochladen', N'تحميل الصورة'),
('projectRef.form.changeImage', N'Görseli Değiştir', N'Change Image', N'Bild ändern', N'تغيير الصورة'),

('projectRef.form.isActive', N'Aktif', N'Active', N'Aktiv', N'نشط'),
('projectRef.form.isFeatured', N'Öne Çıkan', N'Featured', N'Hervorgehoben', N'مميز'),
('projectRef.form.displayOrder', N'Görüntülenme Sırası', N'Display Order', N'Anzeigereihenfolge', N'ترتيب العرض'),

-- Messages
('projectRef.message.createSuccess', N'Proje referansı başarıyla oluşturuldu', N'Project reference created successfully', N'Projektreferenz erfolgreich erstellt', N'تم إنشاء مرجع المشروع بنجاح'),
('projectRef.message.updateSuccess', N'Proje referansı başarıyla güncellendi', N'Project reference updated successfully', N'Projektreferenz erfolgreich aktualisiert', N'تم تحديث مرجع المشروع بنجاح'),
('projectRef.message.deleteSuccess', N'Proje referansı başarıyla silindi', N'Project reference deleted successfully', N'Projektreferenz erfolgreich gelöscht', N'تم حذف مرجع المشروع بنجاح'),
('projectRef.message.deleteConfirm', N'Bu proje referansını silmek istediğinizden emin misiniz?', N'Are you sure you want to delete this project reference?', N'Sind Sie sicher, dass Sie diese Projektreferenz löschen möchten?', N'هل أنت متأكد من رغبتك في حذف مرجع المشروع هذا؟'),
('projectRef.message.noData', N'Henüz proje referansı bulunmuyor', N'No project references yet', N'Noch keine Projektreferenzen', N'لا توجد مراجع مشاريع حتى الآن'),
('projectRef.message.loadError', N'Proje referansları yüklenirken hata oluştu', N'Error loading project references', N'Fehler beim Laden der Projektreferenzen', N'خطأ في تحميل مراجع المشاريع'),

-- Public Page
('projectRef.public.title', N'Başarılı Projelerimiz', N'Our Successful Projects', N'Unsere erfolgreichen Projekte', N'مشاريعنا الناجحة'),
('projectRef.public.subtitle', N'Müşterilerimizin başarı hikayeleri', N'Success stories of our clients', N'Erfolgsgeschichten unserer Kunden', N'قصص نجاح عملائنا'),
('projectRef.public.viewDetails', N'Detayları Gör', N'View Details', N'Details anzeigen', N'عرض التفاصيل'),
('projectRef.public.appliedOn', N'Başvuru', N'Applied', N'Beantragt', N'تم التقديم'),
('projectRef.public.approvedOn', N'Onay', N'Approved', N'Genehmigt', N'تمت الموافقة'),
('projectRef.public.processedIn', N'İşlem Süresi', N'Processed In', N'Bearbeitet in', N'تمت المعالجة في'),
('projectRef.public.client', N'Müşteri', N'Client', N'Kunde', N'العميل'),
('projectRef.public.anonymous', N'Anonim', N'Anonymous', N'Anonym', N'مجهول');

PRINT 'Project reference translations inserted successfully.';
GO

