-- Create Equivalency Fee Settings Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[wixi_EquivalencyFeeSettings]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[wixi_EquivalencyFeeSettings](
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [Amount] [decimal](18, 2) NOT NULL DEFAULT 200.00,
        [Currency] [nvarchar](10) NOT NULL DEFAULT 'EUR',
        [WhyPayTitleTr] [nvarchar](500) NOT NULL,
        [WhyPayTitleDe] [nvarchar](500) NULL,
        [WhyPayTitleEn] [nvarchar](500) NULL,
        [WhyPayTitleAr] [nvarchar](500) NULL,
        [WhyPayDescriptionTr] [nvarchar](max) NOT NULL,
        [WhyPayDescriptionDe] [nvarchar](max) NULL,
        [WhyPayDescriptionEn] [nvarchar](max) NULL,
        [WhyPayDescriptionAr] [nvarchar](max) NULL,
        [WhyProcessTitleTr] [nvarchar](500) NOT NULL,
        [WhyProcessTitleDe] [nvarchar](500) NULL,
        [WhyProcessTitleEn] [nvarchar](500) NULL,
        [WhyProcessTitleAr] [nvarchar](500) NULL,
        [WhyProcessItemsTr] [nvarchar](max) NOT NULL,
        [WhyProcessItemsDe] [nvarchar](max) NULL,
        [WhyProcessItemsEn] [nvarchar](max) NULL,
        [WhyProcessItemsAr] [nvarchar](max) NULL,
        [FeeScopeTitleTr] [nvarchar](500) NOT NULL,
        [FeeScopeTitleDe] [nvarchar](500) NULL,
        [FeeScopeTitleEn] [nvarchar](500) NULL,
        [FeeScopeTitleAr] [nvarchar](500) NULL,
        [FeeScopeItemsTr] [nvarchar](max) NOT NULL,
        [FeeScopeItemsDe] [nvarchar](max) NULL,
        [FeeScopeItemsEn] [nvarchar](max) NULL,
        [FeeScopeItemsAr] [nvarchar](max) NULL,
        [NoteTr] [nvarchar](max) NULL,
        [NoteDe] [nvarchar](max) NULL,
        [NoteEn] [nvarchar](max) NULL,
        [NoteAr] [nvarchar](max) NULL,
        [PaymentSummaryTitleTr] [nvarchar](500) NOT NULL,
        [PaymentSummaryTitleDe] [nvarchar](500) NULL,
        [PaymentSummaryTitleEn] [nvarchar](500) NULL,
        [PaymentSummaryTitleAr] [nvarchar](500) NULL,
        [PaymentSummaryDescriptionTr] [nvarchar](500) NOT NULL,
        [PaymentSummaryDescriptionDe] [nvarchar](500) NULL,
        [PaymentSummaryDescriptionEn] [nvarchar](500) NULL,
        [PaymentSummaryDescriptionAr] [nvarchar](500) NULL,
        [FeeItemDescriptionTr] [nvarchar](500) NOT NULL,
        [FeeItemDescriptionDe] [nvarchar](500) NULL,
        [FeeItemDescriptionEn] [nvarchar](500) NULL,
        [FeeItemDescriptionAr] [nvarchar](500) NULL,
        [IsActive] [bit] NOT NULL DEFAULT 1,
        [CreatedAt] [datetime2](7) NOT NULL DEFAULT GETUTCDATE(),
        [UpdatedAt] [datetime2](7) NOT NULL DEFAULT GETUTCDATE(),
        [CreatedBy] [nvarchar](256) NULL,
        [UpdatedBy] [nvarchar](256) NULL,
        [RowVersion] [rowversion] NULL,
        CONSTRAINT [PK_wixi_EquivalencyFeeSettings] PRIMARY KEY CLUSTERED ([Id] ASC)
    )
    
    -- Insert default data
    INSERT INTO [dbo].[wixi_EquivalencyFeeSettings] (
        [Amount], [Currency],
        [WhyPayTitleTr], [WhyPayDescriptionTr],
        [WhyProcessTitleTr], [WhyProcessItemsTr],
        [FeeScopeTitleTr], [FeeScopeItemsTr],
        [PaymentSummaryTitleTr], [PaymentSummaryDescriptionTr],
        [FeeItemDescriptionTr],
        [IsActive], [CreatedBy]
    ) VALUES (
        200.00, 'EUR',
        'Denklik Ücreti Neden Ödenir?',
        'Denklik ücreti, yurtdışında alınan eğitim belgelerinizin Türkiye''deki eğitim sistemine denkliğinin resmi olarak tanınması için ödenen bir ücrettir.',
        'Denklik İşlemi Neden Gereklidir?',
        '["Yurtdışında alınan diplomaların Türkiye''de geçerli olması için resmi denklik belgesi gereklidir", "İş başvurularında ve eğitim kurumlarında diploma denkliği talep edilir", "Kamu kurumlarında çalışmak için denklik belgesi zorunludur", "Yükseköğretim kurumlarına başvuru yaparken denklik belgesi istenir"]',
        'Denklik Ücreti Kapsamı',
        '["Belgelerinizin incelenmesi ve değerlendirilmesi", "Resmi denklik belgesinin hazırlanması", "İşlem takibi ve danışmanlık hizmeti", "Gerekli kurumlarla iletişim ve koordinasyon"]',
        'Denklik Ücreti Ödemesi',
        'Eğitim Denkliği İşlem Ücreti',
        'Yurtdışı eğitim belgelerinizin denklik işlemi için ücret',
        1, 'System'
    )
    
    PRINT 'Equivalency Fee Settings table created and seeded successfully.'
END
ELSE
BEGIN
    PRINT 'Equivalency Fee Settings table already exists.'
END
GO

