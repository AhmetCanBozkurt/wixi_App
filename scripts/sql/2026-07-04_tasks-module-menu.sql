-- M14 Proje & Görev Yönetimi — store-admin sidebar menüsü
-- Hedef DB: Wixi_App_TEST (manuel SQL kuralı). Prod'a deploy pipeline'ı ile gider.
-- Idempotent: tekrar çalıştırılabilir.

DECLARE @now DATETIME2 = GETUTCDATE();

-- Dilleri koda göre bul (DB'ye göre ID değiştiğinden sabit ID kullanma)
DECLARE @trId UNIQUEIDENTIFIER = (SELECT TOP 1 Id FROM WIXI_LANGUAGES WHERE Code = 'tr-TR');
DECLARE @enId UNIQUEIDENTIFIER = (SELECT TOP 1 Id FROM WIXI_LANGUAGES WHERE Code = 'en-US');

-- 1. 'tasks' modülü yoksa oluştur
DECLARE @moduleId UNIQUEIDENTIFIER = (SELECT TOP 1 Id FROM WIXI_MODULES WHERE Code = 'tasks');
IF @moduleId IS NULL
BEGIN
    SET @moduleId = NEWID();
    INSERT INTO WIXI_MODULES (Id, Code, Name, Description, Icon, IsPublic, SortOrder, Category, CreatedAt, IsActive, IsDeleted)
    VALUES (@moduleId, 'tasks', N'Proje & Görev Yönetimi', N'Kanban, görev, alt görev ve proje takibi', 'FaProjectDiagram', 1, 60, 'verim', @now, 1, 0);
END

-- 2. Menü yoksa ekle
IF NOT EXISTS (SELECT 1 FROM WIXI_MODULE_MENUS WHERE ModuleId = @moduleId AND Path = '/tenant/{tenantSlug}/projects')
BEGIN
    DECLARE @menuId UNIQUEIDENTIFIER = NEWID();
    INSERT INTO WIXI_MODULE_MENUS (Id, ModuleId, ParentId, Path, Icon, IconColor, SortOrder, VisibleToTenant, CreatedAt, IsActive, IsDeleted)
    VALUES (@menuId, @moduleId, NULL, '/tenant/{tenantSlug}/projects', 'FaProjectDiagram', '#6366f1', 60, 1, @now, 1, 0);

    IF @trId IS NOT NULL
        INSERT INTO WIXI_MODULE_MENU_TRANSLATIONS (Id, ModuleMenuId, LanguageId, Title)
        VALUES (NEWID(), @menuId, @trId, N'Projeler');

    IF @enId IS NOT NULL
        INSERT INTO WIXI_MODULE_MENU_TRANSLATIONS (Id, ModuleMenuId, LanguageId, Title)
        VALUES (NEWID(), @menuId, @enId, N'Projects');
END

SELECT m.Code, mm.Path, mm.SortOrder
FROM WIXI_MODULE_MENUS mm
JOIN WIXI_MODULES m ON m.Id = mm.ModuleId
WHERE m.Code = 'tasks';
