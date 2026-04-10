-- Add Payment List Table Column Translations
-- This script adds multi-language translations for payment list table column headers

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

-- Call the upsert procedure for each payment table column
DECLARE @CurrentTime DATETIME2 = GETUTCDATE();

-- Payment List Table Columns
EXEC UpsertTranslation 'admin.payment.table.number', 'Ödeme No', 'Payment No', 'Zahlungsnr.', 'رقم الدفع', @CurrentTime;
EXEC UpsertTranslation 'admin.payment.table.date', 'Tarih', 'Date', 'Datum', 'تاريخ', @CurrentTime;
EXEC UpsertTranslation 'admin.payment.table.customer', 'Müşteri', 'Customer', 'Kunde', 'العميل', @CurrentTime;
EXEC UpsertTranslation 'admin.payment.table.amount', 'Tutar', 'Amount', 'Betrag', 'المبلغ', @CurrentTime;
EXEC UpsertTranslation 'admin.payment.table.status', 'Durum', 'Status', 'Status', 'الحالة', @CurrentTime;
EXEC UpsertTranslation 'admin.payment.table.method', 'Ödeme Yöntemi', 'Payment Method', 'Zahlungsmethode', 'طريقة الدفع', @CurrentTime;
EXEC UpsertTranslation 'admin.payment.table.iyzicoId', 'Iyzico ID', 'Iyzico ID', 'Iyzico ID', 'معرف Iyzico', @CurrentTime;

GO

-- Clean up the procedure after execution if desired
DROP PROCEDURE IF EXISTS UpsertTranslation;
GO

-- Verify the translations
SELECT [Key], Tr, En, De, Ar, UpdatedAt 
FROM wixi_I18nTranslations 
WHERE [Key] LIKE 'admin.payment.table.%'
ORDER BY [Key];

