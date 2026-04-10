-- Add Email Logs Table Column Translations
-- This script adds multi-language translations for email logs table column headers

-- Function to upsert translation keys
CREATE OR ALTER PROCEDURE UpsertTranslation
    @Key NVARCHAR(255),
    @Tr NVARCHAR(MAX),
    @En NVARCHAR(MAX),
    @De NVARCHAR(MAX),
    @Ar NVARCHAR(MAX),
    @UpdatedAt DATETIME2
AS
BEGIN
    IF EXISTS (SELECT 1 FROM wixi_I18nTranslations WHERE [Key] = @Key)
    BEGIN
        UPDATE wixi_I18nTranslations
        SET
            Tr = @Tr,
            En = @En,
            De = @De,
            Ar = @Ar,
            UpdatedAt = @UpdatedAt
        WHERE [Key] = @Key;
        PRINT 'Updated translation for key: ' + @Key;
    END
    ELSE
    BEGIN
        INSERT INTO wixi_I18nTranslations ([Key], Tr, En, De, Ar, UpdatedAt)
        VALUES (@Key, @Tr, @En, @De, @Ar, @UpdatedAt);
        PRINT 'Inserted translation for key: ' + @Key;
    END
END;
GO

-- Call the upsert procedure for each email logs table column
DECLARE @CurrentTime DATETIME2 = GETUTCDATE();

-- Email Logs Table Columns
EXEC UpsertTranslation 'admin.emailLogs.table.date', 'Tarih', 'Date', 'Datum', 'تاريخ', @CurrentTime;
EXEC UpsertTranslation 'admin.emailLogs.table.from', 'Gönderen', 'From', 'Absender', 'من', @CurrentTime;
EXEC UpsertTranslation 'admin.emailLogs.table.to', 'Alıcı', 'To', 'Empfänger', 'إلى', @CurrentTime;
EXEC UpsertTranslation 'admin.emailLogs.table.subject', 'Konu', 'Subject', 'Betreff', 'الموضوع', @CurrentTime;
EXEC UpsertTranslation 'admin.emailLogs.table.template', 'Template', 'Template', 'Vorlage', 'القالب', @CurrentTime;
EXEC UpsertTranslation 'admin.emailLogs.table.status', 'Durum', 'Status', 'Status', 'الحالة', @CurrentTime;
EXEC UpsertTranslation 'admin.emailLogs.table.attempts', 'Deneme', 'Attempts', 'Versuche', 'المحاولات', @CurrentTime;

GO

-- Clean up the procedure after execution if desired
DROP PROCEDURE IF EXISTS UpsertTranslation;
GO

-- Verify the translations
SELECT [Key], Tr, En, De, Ar, UpdatedAt 
FROM wixi_I18nTranslations 
WHERE [Key] LIKE 'admin.emailLogs.table.%'
ORDER BY [Key];

