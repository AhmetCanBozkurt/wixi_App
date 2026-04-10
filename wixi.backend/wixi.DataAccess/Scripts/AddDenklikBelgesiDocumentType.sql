-- Add Denklik Belgesi Document Type to wixi_DocumentTypes table
-- This document type is specific to the recognition/equivalency process

-- Check if the document type already exists
IF NOT EXISTS (SELECT 1 FROM wixi_DocumentTypes WHERE Code = 'denklik_belgesi')
BEGIN
    INSERT INTO wixi_DocumentTypes 
    (
        Code,
        Name_TR,
        Name_EN,
        Name_DE,
        Name_AR,
        Description_TR,
        Description_EN,
        Description_DE,
        Description_AR,
        Note_TR,
        Note_EN,
        Note_DE,
        Note_AR,
        IsRequired,
        IsActive,
        AllowedFileTypes,
        MaxFileSizeBytes,
        RequiresApproval,
        DisplayOrder,
        IconName,
        EducationTypeId,
        CreatedAt,
        UpdatedAt
    )
    VALUES
    (
        'denklik_belgesi',
        'Denklik Belgesi (Renkli Fotokopi - PDF)',
        'Recognition Certificate (Color Copy - PDF)',
        'Anerkennungsbescheid (Farbkopie - PDF)',
        'شهادة الاعتراف (نسخة ملونة - PDF)',
        'Almanya''da diploma denklik belgesi. Bu belge tarafımızca alındıktan sonra süreç devam edecektir.',
        'Recognition certificate for diploma in Germany. The process will continue after we receive this document.',
        'Anerkennungsbescheid für Diplom in Deutschland. Der Prozess wird fortgesetzt, nachdem wir dieses Dokument erhalten haben.',
        'شهادة الاعتراف بالشهادة في ألمانيا. ستستمر العملية بعد أن نتلقى هذا المستند.',
        'Bu belge genellikle IQ veya diğer denklik kurumları tarafından verilir. Admin tarafından yüklenir.',
        'This document is usually issued by IQ or other recognition authorities. Uploaded by admin.',
        'Dieses Dokument wird in der Regel von IQ oder anderen Anerkennungsstellen ausgestellt. Wird vom Admin hochgeladen.',
        'عادة ما يتم إصدار هذا المستند من قبل IQ أو سلطات الاعتراف الأخرى. يتم تحميله من قبل المسؤول.',
        1, -- IsRequired
        1, -- IsActive
        '.pdf,.jpg,.jpeg,.png',
        10485760, -- 10MB
        1, -- RequiresApproval (auto-approved when admin uploads)
        10, -- DisplayOrder
        'award',
        NULL, -- EducationTypeId (applies to all)
        GETUTCDATE(),
        GETUTCDATE()
    );

    PRINT 'Denklik Belgesi document type added successfully.';
END
ELSE
BEGIN
    -- Update existing record to ensure it's active
    UPDATE wixi_DocumentTypes
    SET 
        IsActive = 1,
        UpdatedAt = GETUTCDATE()
    WHERE Code = 'denklik_belgesi';

    PRINT 'Denklik Belgesi document type already exists and has been updated to active.';
END

-- Verify the insert/update
SELECT 
    Id,
    Code,
    Name_TR,
    Name_EN,
    Name_DE,
    IsRequired,
    IsActive,
    DisplayOrder,
    CreatedAt
FROM wixi_DocumentTypes
WHERE Code = 'denklik_belgesi';

