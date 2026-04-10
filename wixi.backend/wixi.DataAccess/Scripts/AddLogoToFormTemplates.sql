-- ============================================================================
-- Add Worklines Logo to Form Email Templates
-- ============================================================================
-- Bu script form email template'lerine logo header ekler
-- Templates: form_submission_received_employer, form_submission_received_employee
-- ============================================================================

BEGIN TRANSACTION;

DECLARE @logoHeader NVARCHAR(MAX) = 
'    <!-- Logo Header -->
    <div style="background:#ffffff;padding:24px;text-align:center;border-bottom:1px solid #e2e8f0;">
      <img src="https://api.worklines.de/CompanyFile/worklines-logo.jpeg" alt="Worklines Logo" style="max-width:180px;height:auto;display:inline-block;" />
    </div>
';

-- ============================================================================
-- Template 1: form_submission_received_employer (ID: 7)
-- ============================================================================
PRINT 'Güncelleniyor: form_submission_received_employer';

UPDATE EmailTemplates
SET 
    BodyHtml_TR = REPLACE(BodyHtml_TR, 
        '<div style="background:linear-gradient(135deg,#0f766e,#10b981);color:#fff;padding:32px;text-align:center;">',
        @logoHeader + CHAR(13) + CHAR(10) + '    <div style="background:linear-gradient(135deg,#0f766e,#10b981);color:#fff;padding:32px;text-align:center;">'),
    BodyHtml_EN = REPLACE(BodyHtml_EN, 
        '<p>Hello {{ClientName}},</p>',
        @logoHeader + CHAR(13) + CHAR(10) + '    <p>Hello {{ClientName}},</p>'),
    UpdatedAt = GETUTCDATE(),
    UpdatedBy = 'System-LogoIntegration'
WHERE 
    [Key] = 'form_submission_received_employer'
    AND IsActive = 1
    AND BodyHtml_TR NOT LIKE '%api.worklines.de/CompanyFile/worklines-logo.jpeg%';

PRINT '✓ form_submission_received_employer güncellendi';

-- ============================================================================
-- Template 2: form_submission_received_employee (ID: 6)
-- ============================================================================
PRINT 'Güncelleniyor: form_submission_received_employee';

UPDATE EmailTemplates
SET 
    BodyHtml_TR = REPLACE(BodyHtml_TR, 
        '<div style="background:linear-gradient(135deg,#0f766e,#10b981);color:#fff;padding:32px;text-align:center;">',
        @logoHeader + CHAR(13) + CHAR(10) + '    <div style="background:linear-gradient(135deg,#0f766e,#10b981);color:#fff;padding:32px;text-align:center;">'),
    BodyHtml_EN = REPLACE(BodyHtml_EN, 
        '<p>Hello {{ClientName}},</p>',
        @logoHeader + CHAR(13) + CHAR(10) + '    <p>Hello {{ClientName}},</p>'),
    UpdatedAt = GETUTCDATE(),
    UpdatedBy = 'System-LogoIntegration'
WHERE 
    [Key] = 'form_submission_received_employee'
    AND IsActive = 1
    AND BodyHtml_TR NOT LIKE '%api.worklines.de/CompanyFile/worklines-logo.jpeg%';

PRINT '✓ form_submission_received_employee güncellendi';

-- ============================================================================
-- Kontrol: Sonuçları göster
-- ============================================================================
PRINT '';
PRINT '============================================================================';
PRINT 'Güncelleme Sonuçları';
PRINT '============================================================================';

SELECT 
    [Key],
    DisplayName_TR,
    CASE 
        WHEN BodyHtml_TR LIKE '%api.worklines.de/CompanyFile/worklines-logo.jpeg%' THEN '✓ Var'
        ELSE '✗ Yok'
    END AS Logo_TR,
    CASE 
        WHEN BodyHtml_EN LIKE '%api.worklines.de/CompanyFile/worklines-logo.jpeg%' THEN '✓ Var'
        ELSE '✗ Yok'
    END AS Logo_EN,
    UpdatedAt,
    UpdatedBy
FROM EmailTemplates
WHERE [Key] IN ('form_submission_received_employer', 'form_submission_received_employee')
ORDER BY [Key];

-- ============================================================================
-- Transaction'ı onayla veya geri al
-- ============================================================================
-- Test için önce ROLLBACK ile çalıştırın, sonuçları kontrol edin
-- Sonra COMMIT ile gerçek güncellemeyi yapın

-- COMMIT; -- Yorumu kaldırarak aktifleştirin
ROLLBACK; -- Test modunda çalışır

PRINT '';
PRINT 'NOT: Script ROLLBACK ile çalıştırıldı (test modu).';
PRINT 'Gerçek güncelleme için COMMIT satırını aktifleştirin.';

