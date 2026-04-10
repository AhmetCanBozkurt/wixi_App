-- Add Admin Panel Status Translations
-- These translations are used for application step statuses in the admin panel

-- Check and insert translations for admin status labels
IF NOT EXISTS (SELECT 1 FROM wixi_I18nTranslations WHERE [Key] = 'admin.status.completed')
BEGIN
    INSERT INTO wixi_I18nTranslations ([Key], Tr, En, De, Ar, UpdatedAt)
    VALUES ('admin.status.completed', N'Tamamlandı', 'Completed', 'Abgeschlossen', N'مكتمل', GETUTCDATE());
    PRINT 'Added translation: admin.status.completed';
END

IF NOT EXISTS (SELECT 1 FROM wixi_I18nTranslations WHERE [Key] = 'admin.status.inProgress')
BEGIN
    INSERT INTO wixi_I18nTranslations ([Key], Tr, En, De, Ar, UpdatedAt)
    VALUES ('admin.status.inProgress', N'Devam Ediyor', 'In Progress', 'In Bearbeitung', N'قيد التقدم', GETUTCDATE());
    PRINT 'Added translation: admin.status.inProgress';
END

IF NOT EXISTS (SELECT 1 FROM wixi_I18nTranslations WHERE [Key] = 'admin.status.notStarted')
BEGIN
    INSERT INTO wixi_I18nTranslations ([Key], Tr, En, De, Ar, UpdatedAt)
    VALUES ('admin.status.notStarted', N'Başlamadı', 'Not Started', 'Nicht begonnen', N'لم يبدأ', GETUTCDATE());
    PRINT 'Added translation: admin.status.notStarted';
END

IF NOT EXISTS (SELECT 1 FROM wixi_I18nTranslations WHERE [Key] = 'admin.status.blocked')
BEGIN
    INSERT INTO wixi_I18nTranslations ([Key], Tr, En, De, Ar, UpdatedAt)
    VALUES ('admin.status.blocked', N'Engellendi', 'Blocked', 'Blockiert', N'محظور', GETUTCDATE());
    PRINT 'Added translation: admin.status.blocked';
END

IF NOT EXISTS (SELECT 1 FROM wixi_I18nTranslations WHERE [Key] = 'admin.status.skipped')
BEGIN
    INSERT INTO wixi_I18nTranslations ([Key], Tr, En, De, Ar, UpdatedAt)
    VALUES ('admin.status.skipped', N'Atlandı', 'Skipped', 'Übersprungen', N'تم التخطي', GETUTCDATE());
    PRINT 'Added translation: admin.status.skipped';
END

IF NOT EXISTS (SELECT 1 FROM wixi_I18nTranslations WHERE [Key] = 'admin.status.onHold')
BEGIN
    INSERT INTO wixi_I18nTranslations ([Key], Tr, En, De, Ar, UpdatedAt)
    VALUES ('admin.status.onHold', N'Beklemede', 'On Hold', 'Auf Eis gelegt', N'في الانتظار', GETUTCDATE());
    PRINT 'Added translation: admin.status.onHold';
END

-- Verify insertions
SELECT 
    [Key],
    Tr AS Turkish,
    En AS English,
    De AS German,
    Ar AS Arabic
FROM wixi_I18nTranslations
WHERE [Key] LIKE 'admin.status.%'
ORDER BY [Key];

PRINT '';
PRINT '✅ Admin status translations added successfully!';
PRINT 'Total translations added: 6';

