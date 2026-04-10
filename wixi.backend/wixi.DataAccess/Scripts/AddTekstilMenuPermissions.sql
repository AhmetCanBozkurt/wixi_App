-- Add Tekstil Menu Permissions for Admin Users
-- This script adds Tekstil module menu items to all admin users

DECLARE @AdminUserIds TABLE (UserId INT);

-- Get all admin user IDs
INSERT INTO @AdminUserIds (UserId)
SELECT DISTINCT u.Id
FROM wixi_Users u
INNER JOIN wixi_UserRoles ur ON u.Id = ur.UserId
INNER JOIN wixi_Roles r ON ur.RoleId = r.Id
WHERE r.Name = 'Admin';

-- Insert Tekstil menu permissions for each admin user
INSERT INTO wixi_MenuPermissions (UserId, MenuPath, MenuText, MenuCategory, MenuIcon, IsVisible, DisplayOrder, CreatedAt, UpdatedAt)
SELECT 
    UserId,
    MenuPath,
    MenuText,
    MenuCategory,
    MenuIcon,
    IsVisible,
    DisplayOrder,
    GETUTCDATE() AS CreatedAt,
    GETUTCDATE() AS UpdatedAt
FROM @AdminUserIds
CROSS JOIN (
    -- Tekstil Module Menu Items
    VALUES 
        ('/admin/tekstil/languages', 'Dil Yönetimi', 'Tekstil', 'Language', 1, 1000),
        ('/admin/tekstil/about', 'Hakkımızda', 'Tekstil', 'Info', 1, 1010),
        ('/admin/tekstil/stats', 'İstatistikler', 'Tekstil', 'BarChart', 1, 1020),
        ('/admin/tekstil/product-categories', 'Ürün Kategorileri', 'Tekstil', 'FolderTree', 1, 1030),
        ('/admin/tekstil/products', 'Ürünler', 'Tekstil', 'Package', 1, 1040),
        ('/admin/tekstil/project-categories', 'Proje Kategorileri', 'Tekstil', 'FolderKanban', 1, 1050),
        ('/admin/tekstil/projects', 'Projeler', 'Tekstil', 'Briefcase', 1, 1060),
        ('/admin/tekstil/contact-info', 'İletişim Bilgileri', 'Tekstil', 'Phone', 1, 1070),
        ('/admin/tekstil/contact-submissions', 'İletişim Mesajları', 'Tekstil', 'Mail', 1, 1080)
) AS MenuItems(MenuPath, MenuText, MenuCategory, MenuIcon, IsVisible, DisplayOrder)
WHERE NOT EXISTS (
    SELECT 1 
    FROM wixi_MenuPermissions mp 
    WHERE mp.UserId = [@AdminUserIds].UserId 
    AND mp.MenuPath = MenuItems.MenuPath
);

-- Display results
SELECT 
    COUNT(*) AS TotalMenuItemsAdded,
    COUNT(DISTINCT UserId) AS AdminUsersUpdated
FROM wixi_MenuPermissions
WHERE MenuCategory = 'Tekstil';

PRINT 'Tekstil menu permissions added successfully!';


