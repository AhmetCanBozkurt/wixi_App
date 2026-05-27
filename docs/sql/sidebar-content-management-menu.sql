-- ============================================================
-- Admin Sidebar: İçerik Yönetimi Klasörü ve Alt Menüler
-- SortOrder: 65 (Finans klasörü SortOrder 50'den sonra)
-- DB: Wixi_App_TEST
-- ============================================================

DECLARE @adminId UNIQUEIDENTIFIER = 'A649A4BE-E7D6-4C70-53CD-08DEB53255B1';
DECLARE @trId    UNIQUEIDENTIFIER = '24071C53-2B52-42B9-9FAE-FA60B65B37AA';
DECLARE @enId    UNIQUEIDENTIFIER = '5AA1D063-B1CE-46BC-9772-363A650E484E';
DECLARE @now     DATETIME2        = GETUTCDATE();

-- ── 1. İçerik Yönetimi Klasörü (SortOrder: 65, root seviyede) ──
DECLARE @fId UNIQUEIDENTIFIER = NEWID();
INSERT INTO WIXI_MENUS (Id, UserId, ParentId, Path, Icon, IconColor, SortOrder, IsVisible, CreatedAt, IsActive, IsDeleted)
VALUES (@fId, @adminId, NULL, 'folder', 'FaNewspaper', '#8b5cf6', 65, 1, @now, 1, 0);

INSERT INTO WIXI_MENU_TRANSLATIONS (Id, MenuId, LanguageId, Title, CreatedAt, IsActive, IsDeleted)
VALUES (NEWID(), @fId, @trId, 'İçerik Yönetimi', @now, 1, 0),
       (NEWID(), @fId, @enId, 'Content Management', @now, 1, 0);

-- ── 2. SSS Yönetimi ──
DECLARE @m1 UNIQUEIDENTIFIER = NEWID();
INSERT INTO WIXI_MENUS (Id, UserId, ParentId, Path, Icon, IconColor, SortOrder, IsVisible, CreatedAt, IsActive, IsDeleted)
VALUES (@m1, @adminId, @fId, '/admin/content/faq', 'FaQuestionCircle', '#6366f1', 1, 1, @now, 1, 0);

INSERT INTO WIXI_MENU_TRANSLATIONS (Id, MenuId, LanguageId, Title, CreatedAt, IsActive, IsDeleted)
VALUES (NEWID(), @m1, @trId, 'SSS Yönetimi', @now, 1, 0),
       (NEWID(), @m1, @enId, 'FAQ Management', @now, 1, 0);

-- ── 3. İletişim Gelen Kutusu ──
DECLARE @m2 UNIQUEIDENTIFIER = NEWID();
INSERT INTO WIXI_MENUS (Id, UserId, ParentId, Path, Icon, IconColor, SortOrder, IsVisible, CreatedAt, IsActive, IsDeleted)
VALUES (@m2, @adminId, @fId, '/admin/content/contacts', 'FaEnvelope', '#10b981', 2, 1, @now, 1, 0);

INSERT INTO WIXI_MENU_TRANSLATIONS (Id, MenuId, LanguageId, Title, CreatedAt, IsActive, IsDeleted)
VALUES (NEWID(), @m2, @trId, 'İletişim Gelen Kutusu', @now, 1, 0),
       (NEWID(), @m2, @enId, 'Contact Inbox', @now, 1, 0);

-- ── 4. Plan Yönetimi ──
DECLARE @m3 UNIQUEIDENTIFIER = NEWID();
INSERT INTO WIXI_MENUS (Id, UserId, ParentId, Path, Icon, IconColor, SortOrder, IsVisible, CreatedAt, IsActive, IsDeleted)
VALUES (@m3, @adminId, @fId, '/admin/content/plans', 'FaCreditCard', '#f59e0b', 3, 1, @now, 1, 0);

INSERT INTO WIXI_MENU_TRANSLATIONS (Id, MenuId, LanguageId, Title, CreatedAt, IsActive, IsDeleted)
VALUES (NEWID(), @m3, @trId, 'Plan Yönetimi', @now, 1, 0),
       (NEWID(), @m3, @enId, 'Plan Management', @now, 1, 0);

-- ── 5. Ekip Yönetimi ──
DECLARE @m4 UNIQUEIDENTIFIER = NEWID();
INSERT INTO WIXI_MENUS (Id, UserId, ParentId, Path, Icon, IconColor, SortOrder, IsVisible, CreatedAt, IsActive, IsDeleted)
VALUES (@m4, @adminId, @fId, '/admin/content/team', 'FaUsers', '#8b5cf6', 4, 1, @now, 1, 0);

INSERT INTO WIXI_MENU_TRANSLATIONS (Id, MenuId, LanguageId, Title, CreatedAt, IsActive, IsDeleted)
VALUES (NEWID(), @m4, @trId, 'Ekip Yönetimi', @now, 1, 0),
       (NEWID(), @m4, @enId, 'Team Management', @now, 1, 0);

-- ── 6. Vaka Çalışmaları ──
DECLARE @m5 UNIQUEIDENTIFIER = NEWID();
INSERT INTO WIXI_MENUS (Id, UserId, ParentId, Path, Icon, IconColor, SortOrder, IsVisible, CreatedAt, IsActive, IsDeleted)
VALUES (@m5, @adminId, @fId, '/admin/content/cases', 'FaBriefcase', '#ec4899', 5, 1, @now, 1, 0);

INSERT INTO WIXI_MENU_TRANSLATIONS (Id, MenuId, LanguageId, Title, CreatedAt, IsActive, IsDeleted)
VALUES (NEWID(), @m5, @trId, 'Vaka Çalışmaları', @now, 1, 0),
       (NEWID(), @m5, @enId, 'Case Studies', @now, 1, 0);

-- ── 7. Yol Haritası ──
DECLARE @m6 UNIQUEIDENTIFIER = NEWID();
INSERT INTO WIXI_MENUS (Id, UserId, ParentId, Path, Icon, IconColor, SortOrder, IsVisible, CreatedAt, IsActive, IsDeleted)
VALUES (@m6, @adminId, @fId, '/admin/content/roadmap', 'FaRoad', '#3b82f6', 6, 1, @now, 1, 0);

INSERT INTO WIXI_MENU_TRANSLATIONS (Id, MenuId, LanguageId, Title, CreatedAt, IsActive, IsDeleted)
VALUES (NEWID(), @m6, @trId, 'Yol Haritası', @now, 1, 0),
       (NEWID(), @m6, @enId, 'Roadmap', @now, 1, 0);

-- ── 8. Değişiklik Günlüğü ──
DECLARE @m7 UNIQUEIDENTIFIER = NEWID();
INSERT INTO WIXI_MENUS (Id, UserId, ParentId, Path, Icon, IconColor, SortOrder, IsVisible, CreatedAt, IsActive, IsDeleted)
VALUES (@m7, @adminId, @fId, '/admin/content/changelog', 'FaHistory', '#ef4444', 7, 1, @now, 1, 0);

INSERT INTO WIXI_MENU_TRANSLATIONS (Id, MenuId, LanguageId, Title, CreatedAt, IsActive, IsDeleted)
VALUES (NEWID(), @m7, @trId, 'Değişiklik Günlüğü', @now, 1, 0),
       (NEWID(), @m7, @enId, 'Changelog', @now, 1, 0);

-- ── 9. Yasal İçerik ──
DECLARE @m8 UNIQUEIDENTIFIER = NEWID();
INSERT INTO WIXI_MENUS (Id, UserId, ParentId, Path, Icon, IconColor, SortOrder, IsVisible, CreatedAt, IsActive, IsDeleted)
VALUES (@m8, @adminId, @fId, '/admin/content/legal', 'FaFileAlt', '#14b8a6', 8, 1, @now, 1, 0);

INSERT INTO WIXI_MENU_TRANSLATIONS (Id, MenuId, LanguageId, Title, CreatedAt, IsActive, IsDeleted)
VALUES (NEWID(), @m8, @trId, 'Yasal İçerik', @now, 1, 0),
       (NEWID(), @m8, @enId, 'Legal Content', @now, 1, 0);
