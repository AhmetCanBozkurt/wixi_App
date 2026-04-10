-- Create Project References Table for Successful Recognition Certificate Projects
-- Başarılı Denklik Belgesi Projeleri için Tablo Oluşturma

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'wixi_ProjectReferences')
BEGIN
    CREATE TABLE wixi_ProjectReferences (
        Id INT PRIMARY KEY IDENTITY(1,1),
        
        -- Title (Multi-language)
        Title NVARCHAR(500) NOT NULL,
        TitleDe NVARCHAR(500) NULL,
        TitleEn NVARCHAR(500) NULL,
        TitleAr NVARCHAR(500) NULL,
        
        -- Description (Multi-language)
        Description NVARCHAR(MAX) NOT NULL,
        DescriptionDe NVARCHAR(MAX) NULL,
        DescriptionEn NVARCHAR(MAX) NULL,
        DescriptionAr NVARCHAR(MAX) NULL,
        
        -- Client Info
        ClientName NVARCHAR(200) NULL,  -- Can be anonymous
        Country NVARCHAR(100) NULL,
        
        -- Document Info (Multi-language)
        DocumentType NVARCHAR(200) NULL,
        DocumentTypeDe NVARCHAR(200) NULL,
        DocumentTypeEn NVARCHAR(200) NULL,
        DocumentTypeAr NVARCHAR(200) NULL,
        
        University NVARCHAR(300) NULL,
        
        -- Dates and Processing
        ApplicationDate DATETIME2 NULL,
        ApprovalDate DATETIME2 NULL,
        ProcessingDays INT NULL,  -- Calculated or manual
        
        -- Document Image (blurred/anonymous preview)
        DocumentImageUrl NVARCHAR(500) NULL,
        
        -- Status (Multi-language)
        Status NVARCHAR(100) NULL,
        StatusDe NVARCHAR(100) NULL,
        StatusEn NVARCHAR(100) NULL,
        StatusAr NVARCHAR(100) NULL,
        
        -- Highlights (JSON array as string) (Multi-language)
        Highlights NVARCHAR(MAX) NULL,
        HighlightsDe NVARCHAR(MAX) NULL,
        HighlightsEn NVARCHAR(MAX) NULL,
        HighlightsAr NVARCHAR(MAX) NULL,
        
        -- Flags
        IsActive BIT NOT NULL DEFAULT 1,
        IsFeatured BIT NOT NULL DEFAULT 0,
        DisplayOrder INT NOT NULL DEFAULT 0,
        
        -- Audit Fields
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NULL,
        CreatedBy NVARCHAR(100) NULL,
        UpdatedBy NVARCHAR(100) NULL,
        
        CONSTRAINT CK_ProjectReferences_ProcessingDays CHECK (ProcessingDays >= 0)
    );

    -- Indexes
    CREATE INDEX IX_ProjectReferences_IsActive ON wixi_ProjectReferences(IsActive);
    CREATE INDEX IX_ProjectReferences_IsFeatured ON wixi_ProjectReferences(IsFeatured);
    CREATE INDEX IX_ProjectReferences_DisplayOrder ON wixi_ProjectReferences(DisplayOrder);
    CREATE INDEX IX_ProjectReferences_ApplicationDate ON wixi_ProjectReferences(ApplicationDate);
    CREATE INDEX IX_ProjectReferences_Country ON wixi_ProjectReferences(Country);
    
    PRINT 'wixi_ProjectReferences table created successfully with indexes.';
END
ELSE
BEGIN
    PRINT 'wixi_ProjectReferences table already exists.';
END
GO

-- Seed Sample Data
-- Örnek Veri Ekle

IF NOT EXISTS (SELECT 1 FROM wixi_ProjectReferences)
BEGIN
    INSERT INTO wixi_ProjectReferences (
        Title, TitleDe, TitleEn, TitleAr,
        Description, DescriptionDe, DescriptionEn, DescriptionAr,
        ClientName, Country,
        DocumentType, DocumentTypeDe, DocumentTypeEn, DocumentTypeAr,
        University,
        ApplicationDate, ApprovalDate, ProcessingDays,
        Status, StatusDe, StatusEn, StatusAr,
        Highlights, HighlightsDe, HighlightsEn, HighlightsAr,
        IsActive, IsFeatured, DisplayOrder,
        CreatedAt, CreatedBy
    )
    VALUES
    -- Example 1: Engineering Degree
    (
        N'Makine Mühendisliği Diploması Denkliği',
        N'Anerkennung Maschinenbau-Diplom',
        N'Mechanical Engineering Degree Recognition',
        N'معادلة شهادة الهندسة الميكانيكية',
        
        N'Türkiye''deki üniversiteden alınan Makine Mühendisliği diploması başarıyla onaylandı. Süreç boyunca hiçbir ek belge talep edilmedi ve ilk başvuruda onay alındı.',
        N'Das Maschinenbau-Diplom einer türkischen Universität wurde erfolgreich anerkannt. Während des gesamten Prozesses wurden keine zusätzlichen Dokumente angefordert und die Genehmigung wurde bei der ersten Bewerbung erteilt.',
        N'The Mechanical Engineering degree from a Turkish university was successfully recognized. No additional documents were requested during the process and approval was granted on the first application.',
        N'تم الاعتراف بشهادة الهندسة الميكانيكية من جامعة تركية بنجاح. لم يتم طلب أي مستندات إضافية خلال العملية وتم منح الموافقة في أول تطبيق.',
        
        N'A. Y.',
        N'Türkiye',
        
        N'Mühendislik Diploması',
        N'Ingenieurabschluss',
        N'Engineering Degree',
        N'شهادة الهندسة',
        
        N'İstanbul Teknik Üniversitesi',
        
        '2024-01-15',
        '2024-01-22',
        7,
        
        N'Onaylandı',
        N'Genehmigt',
        N'Approved',
        N'تمت الموافقة',
        
        N'["Hızlı işlem - 7 gün", "Ek belge gerektirmedi", "İlk başvuruda onaylandı"]',
        N'["Schnelle Bearbeitung - 7 Tage", "Keine zusätzlichen Dokumente erforderlich", "Bei der ersten Bewerbung genehmigt"]',
        N'["Fast processing - 7 days", "No additional documents required", "Approved on first application"]',
        N'["معالجة سريعة - 7 أيام", "لا حاجة لمستندات إضافية", "تمت الموافقة في أول طلب"]',
        
        1, 1, 1,
        GETUTCDATE(), 'System'
    ),
    
    -- Example 2: Medical Degree
    (
        N'Tıp Fakültesi Diploması Denkliği',
        N'Anerkennung Medizinisches Diplom',
        N'Medical Degree Recognition',
        N'معادلة شهادة الطب',
        
        N'Suriye''den mezun olan bir doktor için diploma denkliği başarıyla tamamlandı. Tüm belgeler dijital olarak gönderildi ve süreç sorunsuz ilerledi.',
        N'Die Diplomanerkennung für einen aus Syrien graduierten Arzt wurde erfolgreich abgeschlossen. Alle Dokumente wurden digital übermittelt und der Prozess verlief reibungslos.',
        N'Diploma recognition for a doctor graduated from Syria was successfully completed. All documents were submitted digitally and the process proceeded smoothly.',
        N'تم إكمال الاعتراف بالشهادة لطبيب تخرج من سوريا بنجاح. تم إرسال جميع المستندات رقمياً وسارت العملية بسلاسة.',
        
        N'Dr. M. K.',
        N'Suriye',
        
        N'Tıp Fakültesi Diploması',
        N'Medizinisches Diplom',
        N'Medical Degree',
        N'شهادة الطب',
        
        N'Şam Üniversitesi',
        
        '2024-02-10',
        '2024-03-05',
        24,
        
        N'Onaylandı',
        N'Genehmigt',
        N'Approved',
        N'تمت الموافقة',
        
        N'["Dijital belge gönderimi", "Profesyonel destek", "Detaylı süreç takibi"]',
        N'["Digitale Dokumentenübermittlung", "Professionelle Unterstützung", "Detaillierte Prozessverfolgung"]',
        N'["Digital document submission", "Professional support", "Detailed process tracking"]',
        N'["إرسال المستندات الرقمية", "دعم احترافي", "تتبع مفصل للعملية"]',
        
        1, 1, 2,
        GETUTCDATE(), 'System'
    ),
    
    -- Example 3: Master's Degree
    (
        N'Yüksek Lisans Diploması Denkliği',
        N'Anerkennung Master-Abschluss',
        N'Master''s Degree Recognition',
        N'معادلة شهادة الماجستير',
        
        N'Bilgisayar Mühendisliği alanında alınan yüksek lisans diploması 10 iş günü içerisinde onaylandı. Tüm süreç online olarak yürütüldü.',
        N'Der Master-Abschluss in Informatik wurde innerhalb von 10 Werktagen anerkannt. Der gesamte Prozess wurde online durchgeführt.',
        N'The Master''s degree in Computer Engineering was recognized within 10 business days. The entire process was conducted online.',
        N'تم الاعتراف بشهادة الماجستير في هندسة الكمبيوتر خلال 10 أيام عمل. تمت العملية بالكامل عبر الإنترنت.',
        
        N'S. T.',
        N'Türkiye',
        
        N'Yüksek Lisans Diploması',
        N'Master-Abschluss',
        N'Master''s Degree',
        N'شهادة الماجستير',
        
        N'Orta Doğu Teknik Üniversitesi',
        
        '2024-03-01',
        '2024-03-15',
        10,
        
        N'Onaylandı',
        N'Genehmigt',
        N'Approved',
        N'تمت الموافقة',
        
        N'["Hızlı onay süreci", "Online işlem", "Güvenilir hizmet"]',
        N'["Schneller Genehmigungsprozess", "Online-Verfahren", "Zuverlässiger Service"]',
        N'["Fast approval process", "Online procedure", "Reliable service"]',
        N'["عملية موافقة سريعة", "إجراء عبر الإنترنت", "خدمة موثوقة"]',
        
        1, 0, 3,
        GETUTCDATE(), 'System'
    );

    PRINT 'Sample project references inserted successfully.';
END
ELSE
BEGIN
    PRINT 'Project references already exist.';
END
GO

