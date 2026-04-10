-- Add Appointment List Table Column Translations
-- This script adds multi-language translations for appointment list table column headers

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

-- Call the upsert procedure for each appointment table column
DECLARE @CurrentTime DATETIME2 = GETUTCDATE();

-- Appointment List Table Columns
EXEC UpsertTranslation 'admin.appointment.table.datetime', 'Tarih & Saat', 'Date & Time', 'Datum & Uhrzeit', 'التاريخ والوقت', @CurrentTime;
EXEC UpsertTranslation 'admin.appointment.table.title', 'Başlık', 'Title', 'Titel', 'العنوان', @CurrentTime;
EXEC UpsertTranslation 'admin.appointment.table.client', 'Müşteri', 'Client', 'Kunde', 'العميل', @CurrentTime;
EXEC UpsertTranslation 'admin.appointment.table.status', 'Durum', 'Status', 'Status', 'الحالة', @CurrentTime;

GO

-- Clean up the procedure after execution if desired
DROP PROCEDURE IF EXISTS UpsertTranslation;
GO

-- Verify the translations
SELECT [Key], Tr, En, De, Ar, UpdatedAt 
FROM wixi_I18nTranslations 
WHERE [Key] LIKE 'admin.appointment.table.%'
ORDER BY [Key];

