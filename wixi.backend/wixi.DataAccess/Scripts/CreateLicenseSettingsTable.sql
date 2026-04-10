-- Create License Settings Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[wixi_LicenseSettings]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[wixi_LicenseSettings](
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [LicenseKey] [nvarchar](100) NOT NULL,
        [IsValid] [bit] NOT NULL DEFAULT 0,
        [ExpireDate] [datetime2](7) NULL,
        [TenantId] [int] NULL,
        [TenantCompanyName] [nvarchar](200) NULL,
        [MachineCode] [nvarchar](100) NULL,
        [ClientVersion] [nvarchar](50) NULL,
        [LastValidatedAt] [datetime2](7) NULL,
        [ValidationResult] [nvarchar](max) NULL,
        [IsActive] [bit] NOT NULL DEFAULT 1,
        [CreatedAt] [datetime2](7) NOT NULL DEFAULT GETUTCDATE(),
        [UpdatedAt] [datetime2](7) NOT NULL DEFAULT GETUTCDATE(),
        [CreatedBy] [nvarchar](256) NULL,
        [UpdatedBy] [nvarchar](256) NULL,
        [RowVersion] [rowversion] NULL,
        CONSTRAINT [PK_wixi_LicenseSettings] PRIMARY KEY CLUSTERED ([Id] ASC),
        CONSTRAINT [UQ_wixi_LicenseSettings_LicenseKey] UNIQUE ([LicenseKey])
    )
    
    -- Create indexes
    CREATE INDEX [IX_LicenseSettings_LicenseKey] ON [dbo].[wixi_LicenseSettings]([LicenseKey])
    CREATE INDEX [IX_LicenseSettings_IsValid] ON [dbo].[wixi_LicenseSettings]([IsValid])
    CREATE INDEX [IX_LicenseSettings_IsActive] ON [dbo].[wixi_LicenseSettings]([IsActive])
    
    -- Insert initial license key (will be validated later)
    INSERT INTO [dbo].[wixi_LicenseSettings] (
        [LicenseKey],
        [IsValid],
        [IsActive],
        [CreatedAt],
        [UpdatedAt],
        [CreatedBy]
    ) VALUES (
        'CN9E-BCSK-4TP3-BYVN',
        0, -- Will be set to 1 after validation
        1,
        GETUTCDATE(),
        GETUTCDATE(),
        'System'
    )
    
    PRINT 'License Settings table created and seeded successfully.'
END
ELSE
BEGIN
    PRINT 'License Settings table already exists.'
    
    -- Check if initial license key exists, if not insert it
    IF NOT EXISTS (SELECT 1 FROM [dbo].[wixi_LicenseSettings] WHERE [LicenseKey] = 'CN9E-BCSK-4TP3-BYVN')
    BEGIN
        INSERT INTO [dbo].[wixi_LicenseSettings] (
            [LicenseKey],
            [IsValid],
            [IsActive],
            [CreatedAt],
            [UpdatedAt],
            [CreatedBy]
        ) VALUES (
            'CN9E-BCSK-4TP3-BYVN',
            0,
            1,
            GETUTCDATE(),
            GETUTCDATE(),
            'System'
        )
        PRINT 'Initial license key inserted.'
    END
END
GO

