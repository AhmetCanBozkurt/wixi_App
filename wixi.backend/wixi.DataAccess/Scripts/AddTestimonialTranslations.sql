-- Add Testimonial Table Column Translations
-- This script adds multi-language translations for testimonial table column headers

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

-- Call the upsert procedure for each testimonial table column
DECLARE @CurrentTime DATETIME2 = GETUTCDATE();

-- Testimonial Table Columns
EXEC UpsertTranslation 'admin.testimonial.table.image', 'Resim', 'Image', 'Bild', 'الصورة', @CurrentTime;
EXEC UpsertTranslation 'admin.testimonial.table.name', 'İsim', 'Name', 'Name', 'الاسم', @CurrentTime;
EXEC UpsertTranslation 'admin.testimonial.table.location', 'Lokasyon', 'Location', 'Standort', 'الموقع', @CurrentTime;
EXEC UpsertTranslation 'admin.testimonial.table.content', 'İçerik', 'Content', 'Inhalt', 'المحتوى', @CurrentTime;
EXEC UpsertTranslation 'admin.testimonial.table.rating', 'Puan', 'Rating', 'Bewertung', 'التقييم', @CurrentTime;
EXEC UpsertTranslation 'admin.testimonial.table.status', 'Durum', 'Status', 'Status', 'الحالة', @CurrentTime;
EXEC UpsertTranslation 'admin.testimonial.table.order', 'Sıra', 'Order', 'Reihenfolge', 'الترتيب', @CurrentTime;
EXEC UpsertTranslation 'admin.testimonial.table.created', 'Oluşturma', 'Created', 'Erstellt', 'تاريخ الإنشاء', @CurrentTime;

GO

-- Clean up the procedure after execution if desired
DROP PROCEDURE IF EXISTS UpsertTranslation;
GO

-- Verify the translations
SELECT [Key], Tr, En, De, Ar, UpdatedAt 
FROM wixi_I18nTranslations 
WHERE [Key] LIKE 'admin.testimonial.table.%'
ORDER BY [Key];

