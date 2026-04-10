-- ============================================================================
-- Email Template Logo Integration Script
-- ============================================================================
-- Bu script tüm email template'lerine Worklines logosunu ekler
-- Logo URL: https://api.worklines.de/CompanyFile/worklines-logo.jpeg
-- ============================================================================

BEGIN TRANSACTION;

DECLARE @logoHeader NVARCHAR(MAX) = 
'    <!-- Logo Header -->
    <div style="background:#ffffff;padding:24px;text-align:center;border-bottom:1px solid #e2e8f0;">
      <img src="https://api.worklines.de/CompanyFile/worklines-logo.jpeg" alt="Worklines Logo" style="max-width:180px;height:auto;display:inline-block;" />
    </div>
    ';

DECLARE @footer NVARCHAR(MAX) = 
'    
    <!-- Footer -->
    <div style="background:#f3f4f6;padding:20px;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="margin:0 0 8px;font-size:13px;color:#64748b;">
        © 2024 Worklines Pro. Tüm hakları saklıdır.
      </p>
      <p style="margin:0;font-size:13px;color:#64748b;">
        <a href="https://portal.worklines.de" style="color:#0f766e;text-decoration:none;">Portal</a> | 
        <a href="mailto:support@worklines.de" style="color:#0f766e;text-decoration:none;">Destek</a>
      </p>
    </div>';

-- ============================================================================
-- Adım 1: Logo header'ı ekle (henüz eklenmemişse)
-- ============================================================================
PRINT 'Adım 1: Logo header ekleniyor...';

UPDATE EmailTemplates
SET 
    BodyHtml_TR = CASE 
        WHEN BodyHtml_TR LIKE '%api.worklines.de/CompanyFile/worklines-logo.jpeg%' THEN BodyHtml_TR
        WHEN BodyHtml_TR LIKE '%<div style="background:linear-gradient%' THEN 
            REPLACE(BodyHtml_TR, 
                '  <div style="background:#fff;border-radius:16px;box-shadow:0 20px 40px rgba(15,23,42,0.12);overflow:hidden;">',
                '  <div style="background:#fff;border-radius:16px;box-shadow:0 20px 40px rgba(15,23,42,0.12);overflow:hidden;">' + @logoHeader)
        ELSE BodyHtml_TR
    END,
    BodyHtml_EN = CASE 
        WHEN BodyHtml_EN LIKE '%api.worklines.de/CompanyFile/worklines-logo.jpeg%' THEN BodyHtml_EN
        WHEN BodyHtml_EN LIKE '%<div style="background:linear-gradient%' THEN 
            REPLACE(BodyHtml_EN, 
                '  <div style="background:#fff;border-radius:16px;box-shadow:0 20px 40px rgba(15,23,42,0.12);overflow:hidden;">',
                '  <div style="background:#fff;border-radius:16px;box-shadow:0 20px 40px rgba(15,23,42,0.12);overflow:hidden;">' + @logoHeader)
        ELSE BodyHtml_EN
    END,
    BodyHtml_DE = CASE 
        WHEN BodyHtml_DE LIKE '%api.worklines.de/CompanyFile/worklines-logo.jpeg%' THEN BodyHtml_DE
        WHEN BodyHtml_DE LIKE '%<div style="background:linear-gradient%' THEN 
            REPLACE(BodyHtml_DE, 
                '  <div style="background:#fff;border-radius:16px;box-shadow:0 20px 40px rgba(15,23,42,0.12);overflow:hidden;">',
                '  <div style="background:#fff;border-radius:16px;box-shadow:0 20px 40px rgba(15,23,42,0.12);overflow:hidden;">' + @logoHeader)
        ELSE BodyHtml_DE
    END,
    BodyHtml_AR = CASE 
        WHEN BodyHtml_AR LIKE '%api.worklines.de/CompanyFile/worklines-logo.jpeg%' THEN BodyHtml_AR
        WHEN BodyHtml_AR LIKE '%<div style="background:linear-gradient%' THEN 
            REPLACE(BodyHtml_AR, 
                '  <div style="background:#fff;border-radius:16px;box-shadow:0 20px 40px rgba(15,23,42,0.12);overflow:hidden;">',
                '  <div style="background:#fff;border-radius:16px;box-shadow:0 20px 40px rgba(15,23,42,0.12);overflow:hidden;">' + @logoHeader)
        ELSE BodyHtml_AR
    END,
    UpdatedAt = GETUTCDATE(),
    UpdatedBy = 'System-LogoIntegration'
WHERE 
    IsActive = 1
    AND (
        (BodyHtml_TR IS NOT NULL AND BodyHtml_TR LIKE '%<div style="max-width:640px%')
        OR (BodyHtml_EN IS NOT NULL AND BodyHtml_EN LIKE '%<div style="max-width:640px%')
        OR (BodyHtml_DE IS NOT NULL AND BodyHtml_DE LIKE '%<div style="max-width:640px%')
        OR (BodyHtml_AR IS NOT NULL AND BodyHtml_AR LIKE '%<div style="max-width:640px%')
    );

PRINT CAST(@@ROWCOUNT AS NVARCHAR(10)) + ' template güncellendi (logo header eklendi).';

-- ============================================================================
-- Adım 2: Footer ekle (henüz eklenmemişse)
-- ============================================================================
PRINT 'Adım 2: Footer ekleniyor...';

UPDATE EmailTemplates
SET 
    BodyHtml_TR = CASE 
        WHEN BodyHtml_TR LIKE '%© 2024 Worklines Pro%' THEN BodyHtml_TR
        WHEN BodyHtml_TR LIKE '%</div>%</div>%</div>%' THEN 
            REPLACE(BodyHtml_TR, 
                '</div>' + CHAR(13) + CHAR(10) + '</div>' + CHAR(13) + CHAR(10) + '</div>',
                '</div>' + CHAR(13) + CHAR(10) + @footer + CHAR(13) + CHAR(10) + '</div>' + CHAR(13) + CHAR(10) + '</div>')
        ELSE BodyHtml_TR
    END,
    BodyHtml_EN = CASE 
        WHEN BodyHtml_EN LIKE '%© 2024 Worklines Pro%' THEN BodyHtml_EN
        WHEN BodyHtml_EN LIKE '%</div>%</div>%</div>%' THEN 
            REPLACE(BodyHtml_EN, 
                '</div>' + CHAR(13) + CHAR(10) + '</div>' + CHAR(13) + CHAR(10) + '</div>',
                '</div>' + CHAR(13) + CHAR(10) + @footer + CHAR(13) + CHAR(10) + '</div>' + CHAR(13) + CHAR(10) + '</div>')
        ELSE BodyHtml_EN
    END,
    BodyHtml_DE = CASE 
        WHEN BodyHtml_DE LIKE '%© 2024 Worklines Pro%' THEN BodyHtml_DE
        WHEN BodyHtml_DE LIKE '%</div>%</div>%</div>%' THEN 
            REPLACE(BodyHtml_DE, 
                '</div>' + CHAR(13) + CHAR(10) + '</div>' + CHAR(13) + CHAR(10) + '</div>',
                '</div>' + CHAR(13) + CHAR(10) + @footer + CHAR(13) + CHAR(10) + '</div>' + CHAR(13) + CHAR(10) + '</div>')
        ELSE BodyHtml_DE
    END,
    BodyHtml_AR = CASE 
        WHEN BodyHtml_AR LIKE '%© 2024 Worklines Pro%' THEN BodyHtml_AR
        WHEN BodyHtml_AR LIKE '%</div>%</div>%</div>%' THEN 
            REPLACE(BodyHtml_AR, 
                '</div>' + CHAR(13) + CHAR(10) + '</div>' + CHAR(13) + CHAR(10) + '</div>',
                '</div>' + CHAR(13) + CHAR(10) + @footer + CHAR(13) + CHAR(10) + '</div>' + CHAR(13) + CHAR(10) + '</div>')
        ELSE BodyHtml_AR
    END,
    UpdatedAt = GETUTCDATE(),
    UpdatedBy = 'System-LogoIntegration'
WHERE 
    IsActive = 1
    AND (
        (BodyHtml_TR IS NOT NULL AND BodyHtml_TR NOT LIKE '%© 2024 Worklines Pro%')
        OR (BodyHtml_EN IS NOT NULL AND BodyHtml_EN NOT LIKE '%© 2024 Worklines Pro%')
        OR (BodyHtml_DE IS NOT NULL AND BodyHtml_DE NOT LIKE '%© 2024 Worklines Pro%')
        OR (BodyHtml_AR IS NOT NULL AND BodyHtml_AR NOT LIKE '%© 2024 Worklines Pro%')
    );

PRINT CAST(@@ROWCOUNT AS NVARCHAR(10)) + ' template güncellendi (footer eklendi).';

-- ============================================================================
-- Adım 3: Sonuçları göster
-- ============================================================================
PRINT '';
PRINT '============================================================================';
PRINT 'Güncelleme Özeti';
PRINT '============================================================================';

SELECT 
    [Key] AS TemplateKey,
    DisplayName_TR AS DisplayName,
    CASE 
        WHEN BodyHtml_TR LIKE '%api.worklines.de/CompanyFile/worklines-logo.jpeg%' THEN 'Yes'
        ELSE 'No'
    END AS HasLogo_TR,
    CASE 
        WHEN BodyHtml_EN LIKE '%api.worklines.de/CompanyFile/worklines-logo.jpeg%' THEN 'Yes'
        ELSE 'No'
    END AS HasLogo_EN,
    CASE 
        WHEN BodyHtml_DE LIKE '%api.worklines.de/CompanyFile/worklines-logo.jpeg%' THEN 'Yes'
        ELSE 'No'
    END AS HasLogo_DE,
    CASE 
        WHEN BodyHtml_AR LIKE '%api.worklines.de/CompanyFile/worklines-logo.jpeg%' THEN 'Yes'
        ELSE 'No'
    END AS HasLogo_AR,
    UpdatedAt,
    UpdatedBy
FROM EmailTemplates
WHERE IsActive = 1
ORDER BY [Key];

-- ============================================================================
-- Transaction'ı onayla
-- ============================================================================
-- COMMIT; -- Manuel olarak çalıştırın veya yorum satırını kaldırın
ROLLBACK; -- Test için - COMMIT ile değiştirin

PRINT '';
PRINT 'UYARI: Script ROLLBACK ile çalıştırıldı. Değişiklikleri kaydetmek için COMMIT kullanın.';
PRINT '';

