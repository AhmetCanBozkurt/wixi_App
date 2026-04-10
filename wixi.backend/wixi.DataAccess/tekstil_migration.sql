IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
CREATE TABLE [wixi_AuditLogs] (
    [Id] int NOT NULL IDENTITY,
    [UserId] int NULL,
    [Action] nvarchar(450) NOT NULL,
    [EntityName] nvarchar(max) NOT NULL,
    [EntityId] nvarchar(max) NULL,
    [OldValues] nvarchar(max) NULL,
    [NewValues] nvarchar(max) NULL,
    [IpAddress] nvarchar(max) NULL,
    [UserAgent] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_wixi_AuditLogs] PRIMARY KEY ([Id])
);

CREATE TABLE [wixi_Roles] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(50) NOT NULL,
    [Description] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_wixi_Roles] PRIMARY KEY ([Id])
);

CREATE TABLE [wixi_Users] (
    [Id] int NOT NULL IDENTITY,
    [Email] nvarchar(256) NOT NULL,
    [PasswordHash] nvarchar(max) NOT NULL,
    [FirstName] nvarchar(100) NOT NULL,
    [LastName] nvarchar(100) NOT NULL,
    [IsActive] bit NOT NULL,
    [EmailConfirmed] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [LastLoginAt] datetime2 NULL,
    CONSTRAINT [PK_wixi_Users] PRIMARY KEY ([Id])
);

CREATE TABLE [wixi_RefreshTokens] (
    [Id] int NOT NULL IDENTITY,
    [UserId] int NOT NULL,
    [Token] nvarchar(450) NOT NULL,
    [ExpiresAt] datetime2 NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [IsRevoked] bit NOT NULL,
    [RevokedAt] datetime2 NULL,
    [IpAddress] nvarchar(max) NULL,
    [UserAgent] nvarchar(max) NULL,
    CONSTRAINT [PK_wixi_RefreshTokens] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_wixi_RefreshTokens_wixi_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [wixi_Users] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [wixi_UserRoles] (
    [Id] int NOT NULL IDENTITY,
    [UserId] int NOT NULL,
    [RoleId] int NOT NULL,
    [AssignedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_wixi_UserRoles] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_wixi_UserRoles_wixi_Roles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [wixi_Roles] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_wixi_UserRoles_wixi_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [wixi_Users] ([Id]) ON DELETE CASCADE
);

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CreatedAt', N'Description', N'Name') AND [object_id] = OBJECT_ID(N'[wixi_Roles]'))
    SET IDENTITY_INSERT [wixi_Roles] ON;
INSERT INTO [wixi_Roles] ([Id], [CreatedAt], [Description], [Name])
VALUES (1, '2025-11-08T00:00:00.0000000Z', N'System Administrator', N'Admin'),
(2, '2025-11-08T00:00:00.0000000Z', N'Client User', N'Client'),
(3, '2025-11-08T00:00:00.0000000Z', N'Employee User', N'Employee');
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CreatedAt', N'Description', N'Name') AND [object_id] = OBJECT_ID(N'[wixi_Roles]'))
    SET IDENTITY_INSERT [wixi_Roles] OFF;

CREATE INDEX [IX_wixi_AuditLogs_Action] ON [wixi_AuditLogs] ([Action]);

CREATE INDEX [IX_wixi_AuditLogs_CreatedAt] ON [wixi_AuditLogs] ([CreatedAt]);

CREATE INDEX [IX_wixi_AuditLogs_UserId] ON [wixi_AuditLogs] ([UserId]);

CREATE UNIQUE INDEX [IX_wixi_RefreshTokens_Token] ON [wixi_RefreshTokens] ([Token]);

CREATE INDEX [IX_wixi_RefreshTokens_UserId] ON [wixi_RefreshTokens] ([UserId]);

CREATE UNIQUE INDEX [IX_wixi_Roles_Name] ON [wixi_Roles] ([Name]);

CREATE INDEX [IX_wixi_UserRoles_RoleId] ON [wixi_UserRoles] ([RoleId]);

CREATE UNIQUE INDEX [IX_wixi_UserRoles_UserId_RoleId] ON [wixi_UserRoles] ([UserId], [RoleId]);

CREATE UNIQUE INDEX [IX_wixi_Users_Email] ON [wixi_Users] ([Email]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251108132612_InitialCreate', N'9.0.10');

CREATE TABLE [wixi_EducationTypes] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(100) NOT NULL,
    [Description] nvarchar(max) NULL,
    [DisplayOrder] int NOT NULL,
    [IsActive] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_wixi_EducationTypes] PRIMARY KEY ([Id])
);

CREATE TABLE [wixi_PendingClientCodes] (
    [Id] int NOT NULL IDENTITY,
    [Email] nvarchar(256) NOT NULL,
    [Code] nvarchar(10) NOT NULL,
    [ClientData] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [ExpiresAt] datetime2 NOT NULL,
    [IsUsed] bit NOT NULL,
    [UsedAt] datetime2 NULL,
    [AttemptCount] int NOT NULL,
    CONSTRAINT [PK_wixi_PendingClientCodes] PRIMARY KEY ([Id])
);

CREATE TABLE [wixi_Clients] (
    [Id] int NOT NULL IDENTITY,
    [UserId] int NOT NULL,
    [FirstName] nvarchar(100) NOT NULL,
    [LastName] nvarchar(100) NOT NULL,
    [Email] nvarchar(256) NOT NULL,
    [Phone] nvarchar(max) NULL,
    [Address] nvarchar(max) NULL,
    [City] nvarchar(max) NULL,
    [PostalCode] nvarchar(max) NULL,
    [Country] nvarchar(max) NULL,
    [DateOfBirth] datetime2 NULL,
    [Nationality] nvarchar(max) NULL,
    [PassportNumber] nvarchar(max) NULL,
    [EducationTypeId] int NULL,
    [ProfilePictureUrl] nvarchar(max) NULL,
    [Notes] nvarchar(max) NULL,
    [IsActive] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [LastActivityAt] datetime2 NULL,
    CONSTRAINT [PK_wixi_Clients] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_wixi_Clients_wixi_EducationTypes_EducationTypeId] FOREIGN KEY ([EducationTypeId]) REFERENCES [wixi_EducationTypes] ([Id])
);

CREATE TABLE [wixi_EducationInfos] (
    [Id] int NOT NULL IDENTITY,
    [ClientId] int NOT NULL,
    [InstitutionName] nvarchar(max) NOT NULL,
    [Degree] nvarchar(max) NULL,
    [FieldOfStudy] nvarchar(max) NULL,
    [StartDate] datetime2 NULL,
    [EndDate] datetime2 NULL,
    [Status] nvarchar(max) NULL,
    [Grade] nvarchar(max) NULL,
    [Country] nvarchar(max) NULL,
    [City] nvarchar(max) NULL,
    [Description] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    CONSTRAINT [PK_wixi_EducationInfos] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_wixi_EducationInfos_wixi_Clients_ClientId] FOREIGN KEY ([ClientId]) REFERENCES [wixi_Clients] ([Id]) ON DELETE CASCADE
);

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CreatedAt', N'Description', N'DisplayOrder', N'IsActive', N'Name') AND [object_id] = OBJECT_ID(N'[wixi_EducationTypes]'))
    SET IDENTITY_INSERT [wixi_EducationTypes] ON;
INSERT INTO [wixi_EducationTypes] ([Id], [CreatedAt], [Description], [DisplayOrder], [IsActive], [Name])
VALUES (1, '2025-11-08T00:00:00.0000000Z', N'University Education', 1, CAST(1 AS bit), N'University'),
(2, '2025-11-08T00:00:00.0000000Z', N'Meslek Lisesi', 2, CAST(1 AS bit), N'Vocational School'),
(3, '2025-11-08T00:00:00.0000000Z', N'Kalfalık', 3, CAST(1 AS bit), N'Apprenticeship');
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CreatedAt', N'Description', N'DisplayOrder', N'IsActive', N'Name') AND [object_id] = OBJECT_ID(N'[wixi_EducationTypes]'))
    SET IDENTITY_INSERT [wixi_EducationTypes] OFF;

CREATE INDEX [IX_wixi_Clients_EducationTypeId] ON [wixi_Clients] ([EducationTypeId]);

CREATE INDEX [IX_wixi_Clients_Email] ON [wixi_Clients] ([Email]);

CREATE INDEX [IX_wixi_Clients_UserId] ON [wixi_Clients] ([UserId]);

CREATE INDEX [IX_wixi_EducationInfos_ClientId] ON [wixi_EducationInfos] ([ClientId]);

CREATE INDEX [IX_wixi_PendingClientCodes_Code] ON [wixi_PendingClientCodes] ([Code]);

CREATE INDEX [IX_wixi_PendingClientCodes_Email] ON [wixi_PendingClientCodes] ([Email]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251108141117_AddClientModule', N'9.0.10');

DECLARE @var sysname;
SELECT @var = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[wixi_EducationTypes]') AND [c].[name] = N'Name');
IF @var IS NOT NULL EXEC(N'ALTER TABLE [wixi_EducationTypes] DROP CONSTRAINT [' + @var + '];');
ALTER TABLE [wixi_EducationTypes] DROP COLUMN [Name];

DECLARE @var1 sysname;
SELECT @var1 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[wixi_EducationInfos]') AND [c].[name] = N'Grade');
IF @var1 IS NOT NULL EXEC(N'ALTER TABLE [wixi_EducationInfos] DROP CONSTRAINT [' + @var1 + '];');
ALTER TABLE [wixi_EducationInfos] DROP COLUMN [Grade];

DECLARE @var2 sysname;
SELECT @var2 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[wixi_EducationInfos]') AND [c].[name] = N'InstitutionName');
IF @var2 IS NOT NULL EXEC(N'ALTER TABLE [wixi_EducationInfos] DROP CONSTRAINT [' + @var2 + '];');
ALTER TABLE [wixi_EducationInfos] DROP COLUMN [InstitutionName];

DECLARE @var3 sysname;
SELECT @var3 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[wixi_EducationInfos]') AND [c].[name] = N'Status');
IF @var3 IS NOT NULL EXEC(N'ALTER TABLE [wixi_EducationInfos] DROP CONSTRAINT [' + @var3 + '];');
ALTER TABLE [wixi_EducationInfos] DROP COLUMN [Status];

DECLARE @var4 sysname;
SELECT @var4 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[wixi_Clients]') AND [c].[name] = N'IsActive');
IF @var4 IS NOT NULL EXEC(N'ALTER TABLE [wixi_Clients] DROP CONSTRAINT [' + @var4 + '];');
ALTER TABLE [wixi_Clients] DROP COLUMN [IsActive];

EXEC sp_rename N'[wixi_PendingClientCodes].[ExpiresAt]', N'ExpirationDate', 'COLUMN';

EXEC sp_rename N'[wixi_EducationTypes].[Description]', N'IconName', 'COLUMN';

EXEC sp_rename N'[wixi_EducationInfos].[EndDate]', N'GraduationDate', 'COLUMN';

ALTER TABLE [wixi_PendingClientCodes] ADD [ClientCode] nvarchar(50) NOT NULL DEFAULT N'';

ALTER TABLE [wixi_PendingClientCodes] ADD [EmployeeSubmissionId] bigint NULL;

ALTER TABLE [wixi_PendingClientCodes] ADD [FullName] nvarchar(200) NOT NULL DEFAULT N'';

ALTER TABLE [wixi_PendingClientCodes] ADD [UpdatedAt] datetime2 NULL;

ALTER TABLE [wixi_EducationTypes] ADD [Code] nvarchar(50) NOT NULL DEFAULT N'';

ALTER TABLE [wixi_EducationTypes] ADD [Description_AR] nvarchar(max) NULL;

ALTER TABLE [wixi_EducationTypes] ADD [Description_DE] nvarchar(max) NULL;

ALTER TABLE [wixi_EducationTypes] ADD [Description_EN] nvarchar(max) NULL;

ALTER TABLE [wixi_EducationTypes] ADD [Description_TR] nvarchar(max) NULL;

ALTER TABLE [wixi_EducationTypes] ADD [Name_AR] nvarchar(200) NOT NULL DEFAULT N'';

ALTER TABLE [wixi_EducationTypes] ADD [Name_DE] nvarchar(200) NOT NULL DEFAULT N'';

ALTER TABLE [wixi_EducationTypes] ADD [Name_EN] nvarchar(200) NOT NULL DEFAULT N'';

ALTER TABLE [wixi_EducationTypes] ADD [Name_TR] nvarchar(200) NOT NULL DEFAULT N'';

ALTER TABLE [wixi_EducationTypes] ADD [UpdatedAt] datetime2 NULL;

DECLARE @var5 sysname;
SELECT @var5 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[wixi_EducationInfos]') AND [c].[name] = N'Degree');
IF @var5 IS NOT NULL EXEC(N'ALTER TABLE [wixi_EducationInfos] DROP CONSTRAINT [' + @var5 + '];');
UPDATE [wixi_EducationInfos] SET [Degree] = N'' WHERE [Degree] IS NULL;
ALTER TABLE [wixi_EducationInfos] ALTER COLUMN [Degree] nvarchar(200) NOT NULL;
ALTER TABLE [wixi_EducationInfos] ADD DEFAULT N'' FOR [Degree];

ALTER TABLE [wixi_EducationInfos] ADD [GPA] decimal(3,2) NULL;

ALTER TABLE [wixi_EducationInfos] ADD [Institution] nvarchar(300) NOT NULL DEFAULT N'';

ALTER TABLE [wixi_EducationInfos] ADD [IsCurrent] bit NOT NULL DEFAULT CAST(0 AS bit);

ALTER TABLE [wixi_EducationInfos] ADD [Level] int NOT NULL DEFAULT 0;

DECLARE @var6 sysname;
SELECT @var6 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[wixi_Clients]') AND [c].[name] = N'Phone');
IF @var6 IS NOT NULL EXEC(N'ALTER TABLE [wixi_Clients] DROP CONSTRAINT [' + @var6 + '];');
UPDATE [wixi_Clients] SET [Phone] = N'' WHERE [Phone] IS NULL;
ALTER TABLE [wixi_Clients] ALTER COLUMN [Phone] nvarchar(50) NOT NULL;
ALTER TABLE [wixi_Clients] ADD DEFAULT N'' FOR [Phone];

ALTER TABLE [wixi_Clients] ADD [ClientCode] nvarchar(50) NOT NULL DEFAULT N'';

ALTER TABLE [wixi_Clients] ADD [DeletedAt] datetime2 NULL;

ALTER TABLE [wixi_Clients] ADD [RegistrationDate] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';

ALTER TABLE [wixi_Clients] ADD [Status] int NOT NULL DEFAULT 0;

UPDATE [wixi_EducationTypes] SET [Code] = N'university', [Description_AR] = N'لخريجي الجامعات', [Description_DE] = N'Für Hochschulabsolventen', [Description_EN] = N'For university graduates', [Description_TR] = N'Üniversite mezunları için', [IconName] = N'graduation-cap', [Name_AR] = N'خريج جامعي', [Name_DE] = N'Hochschulabsolvent', [Name_EN] = N'University Graduate', [Name_TR] = N'Üniversite Mezunu', [UpdatedAt] = NULL
WHERE [Id] = 1;
SELECT @@ROWCOUNT;


UPDATE [wixi_EducationTypes] SET [Code] = N'vocational', [Description_AR] = N'لخريجي المدارس المهنية', [Description_DE] = N'Für Berufsschulabsolventen', [Description_EN] = N'For vocational school graduates', [Description_TR] = N'Meslek lisesi mezunları için', [IconName] = N'briefcase', [Name_AR] = N'خريج مدرسة مهنية', [Name_DE] = N'Berufsschulabsolvent', [Name_EN] = N'Vocational School Graduate', [Name_TR] = N'Meslek Lisesi Mezunu', [UpdatedAt] = NULL
WHERE [Id] = 2;
SELECT @@ROWCOUNT;


UPDATE [wixi_EducationTypes] SET [Code] = N'apprenticeship', [Description_AR] = N'للمتدربين والحرفيين', [Description_DE] = N'Für Auszubildende und Gesellen', [Description_EN] = N'For apprentices and journeymen', [Description_TR] = N'Kalfa veya çırak belgesi olanlar için', [IconName] = N'tools', [Name_AR] = N'تدريب مهني / حرفي', [Name_DE] = N'Lehre / Gesellenprüfung', [Name_EN] = N'Apprenticeship / Journeyman', [Name_TR] = N'Kalfalık / Çıraklık', [UpdatedAt] = NULL
WHERE [Id] = 3;
SELECT @@ROWCOUNT;


CREATE INDEX [IX_wixi_PendingClientCodes_ClientCode] ON [wixi_PendingClientCodes] ([ClientCode]);

CREATE UNIQUE INDEX [IX_wixi_EducationTypes_Code] ON [wixi_EducationTypes] ([Code]);

CREATE UNIQUE INDEX [IX_wixi_Clients_ClientCode] ON [wixi_Clients] ([ClientCode]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251108141846_UpdateClientModuleWithMultiLanguage', N'9.0.10');

ALTER TABLE [wixi_Users] ADD [AccessFailedCount] int NOT NULL DEFAULT 0;

ALTER TABLE [wixi_Users] ADD [ConcurrencyStamp] nvarchar(256) NOT NULL DEFAULT N'';

ALTER TABLE [wixi_Users] ADD [LockoutEnabled] bit NOT NULL DEFAULT CAST(0 AS bit);

ALTER TABLE [wixi_Users] ADD [LockoutEnd] datetimeoffset NULL;

ALTER TABLE [wixi_Users] ADD [NormalizedEmail] nvarchar(256) NOT NULL DEFAULT N'';

ALTER TABLE [wixi_Users] ADD [NormalizedUserName] nvarchar(256) NOT NULL DEFAULT N'';

ALTER TABLE [wixi_Users] ADD [PhoneNumber] nvarchar(50) NULL;

ALTER TABLE [wixi_Users] ADD [PhoneNumberConfirmed] bit NOT NULL DEFAULT CAST(0 AS bit);

ALTER TABLE [wixi_Users] ADD [SecurityStamp] nvarchar(256) NOT NULL DEFAULT N'';

ALTER TABLE [wixi_Users] ADD [TwoFactorCode] nvarchar(10) NULL;

ALTER TABLE [wixi_Users] ADD [TwoFactorCodeExpiration] datetime2 NULL;

ALTER TABLE [wixi_Users] ADD [TwoFactorEnabled] bit NOT NULL DEFAULT CAST(0 AS bit);

ALTER TABLE [wixi_Users] ADD [UserName] nvarchar(256) NOT NULL DEFAULT N'';

CREATE UNIQUE INDEX [IX_wixi_Users_NormalizedEmail] ON [wixi_Users] ([NormalizedEmail]);

CREATE UNIQUE INDEX [IX_wixi_Users_NormalizedUserName] ON [wixi_Users] ([NormalizedUserName]);

CREATE UNIQUE INDEX [IX_wixi_Users_UserName] ON [wixi_Users] ([UserName]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251108142135_UpdateUserEntityWithIdentityFeatures', N'9.0.10');

CREATE TABLE [wixi_DocumentTypes] (
    [Id] int NOT NULL IDENTITY,
    [Code] nvarchar(50) NOT NULL,
    [Name_TR] nvarchar(500) NOT NULL,
    [Name_EN] nvarchar(500) NOT NULL,
    [Name_DE] nvarchar(500) NOT NULL,
    [Name_AR] nvarchar(500) NOT NULL,
    [Description_TR] nvarchar(max) NULL,
    [Description_EN] nvarchar(max) NULL,
    [Description_DE] nvarchar(max) NULL,
    [Description_AR] nvarchar(max) NULL,
    [Note_TR] nvarchar(max) NULL,
    [Note_EN] nvarchar(max) NULL,
    [Note_DE] nvarchar(max) NULL,
    [Note_AR] nvarchar(max) NULL,
    [IsRequired] bit NOT NULL,
    [IsActive] bit NOT NULL,
    [EducationTypeId] int NULL,
    [AllowedFileTypes] nvarchar(max) NULL,
    [MaxFileSizeBytes] bigint NULL,
    [RequiresApproval] bit NOT NULL,
    [DisplayOrder] int NOT NULL,
    [IconName] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    CONSTRAINT [PK_wixi_DocumentTypes] PRIMARY KEY ([Id])
);

CREATE TABLE [wixi_FileStorages] (
    [Id] bigint NOT NULL IDENTITY,
    [FileName] nvarchar(500) NOT NULL,
    [StoredFileName] nvarchar(500) NOT NULL,
    [FilePath] nvarchar(1000) NOT NULL,
    [FileExtension] nvarchar(max) NOT NULL,
    [FileSizeBytes] bigint NOT NULL,
    [MimeType] nvarchar(200) NOT NULL,
    [StorageType] int NOT NULL,
    [StorageUrl] nvarchar(max) NULL,
    [ContainerName] nvarchar(max) NULL,
    [StoragePath] nvarchar(max) NULL,
    [FileHash] nvarchar(450) NULL,
    [IsPublic] bit NOT NULL,
    [IsEncrypted] bit NOT NULL,
    [EncryptionKey] nvarchar(max) NULL,
    [EntityType] nvarchar(100) NOT NULL,
    [EntityId] bigint NOT NULL,
    [UploadedBy] nvarchar(max) NULL,
    [Description] nvarchar(max) NULL,
    [MetadataJson] nvarchar(max) NULL,
    [UploadedAt] datetime2 NOT NULL,
    [LastAccessedAt] datetime2 NULL,
    [DeletedAt] datetime2 NULL,
    CONSTRAINT [PK_wixi_FileStorages] PRIMARY KEY ([Id])
);

CREATE TABLE [wixi_Documents] (
    [Id] bigint NOT NULL IDENTITY,
    [ClientId] int NOT NULL,
    [DocumentTypeId] int NOT NULL,
    [OriginalFileName] nvarchar(500) NOT NULL,
    [StoredFileName] nvarchar(500) NOT NULL,
    [FilePath] nvarchar(1000) NOT NULL,
    [FileExtension] nvarchar(20) NOT NULL,
    [FileSizeBytes] bigint NOT NULL,
    [MimeType] nvarchar(max) NULL,
    [FileHash] nvarchar(max) NULL,
    [Status] int NOT NULL,
    [Version] int NOT NULL,
    [UploadedFromIp] nvarchar(max) NULL,
    [UserAgent] nvarchar(max) NULL,
    [Notes] nvarchar(max) NULL,
    [UploadedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [DeletedAt] datetime2 NULL,
    [ExpiresAt] datetime2 NULL,
    CONSTRAINT [PK_wixi_Documents] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_wixi_Documents_wixi_DocumentTypes_DocumentTypeId] FOREIGN KEY ([DocumentTypeId]) REFERENCES [wixi_DocumentTypes] ([Id]) ON DELETE NO ACTION
);

CREATE TABLE [wixi_DocumentReviews] (
    [Id] bigint NOT NULL IDENTITY,
    [DocumentId] bigint NOT NULL,
    [ReviewerId] int NOT NULL,
    [Decision] int NOT NULL,
    [ReviewNote] nvarchar(max) NULL,
    [FeedbackMessage] nvarchar(max) NULL,
    [ReviewDurationMinutes] int NOT NULL,
    [RejectionReason] nvarchar(max) NULL,
    [ReviewedAt] datetime2 NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    CONSTRAINT [PK_wixi_DocumentReviews] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_wixi_DocumentReviews_wixi_Documents_DocumentId] FOREIGN KEY ([DocumentId]) REFERENCES [wixi_Documents] ([Id]) ON DELETE CASCADE
);

CREATE UNIQUE INDEX [IX_wixi_DocumentReviews_DocumentId] ON [wixi_DocumentReviews] ([DocumentId]);

CREATE INDEX [IX_wixi_DocumentReviews_ReviewedAt] ON [wixi_DocumentReviews] ([ReviewedAt]);

CREATE INDEX [IX_wixi_DocumentReviews_ReviewerId] ON [wixi_DocumentReviews] ([ReviewerId]);

CREATE INDEX [IX_wixi_Documents_ClientId] ON [wixi_Documents] ([ClientId]);

CREATE INDEX [IX_wixi_Documents_DocumentTypeId] ON [wixi_Documents] ([DocumentTypeId]);

CREATE INDEX [IX_wixi_Documents_Status] ON [wixi_Documents] ([Status]);

CREATE INDEX [IX_wixi_Documents_UploadedAt] ON [wixi_Documents] ([UploadedAt]);

CREATE UNIQUE INDEX [IX_wixi_DocumentTypes_Code] ON [wixi_DocumentTypes] ([Code]);

CREATE INDEX [IX_wixi_DocumentTypes_EducationTypeId] ON [wixi_DocumentTypes] ([EducationTypeId]);

CREATE INDEX [IX_wixi_FileStorages_EntityType_EntityId] ON [wixi_FileStorages] ([EntityType], [EntityId]);

CREATE INDEX [IX_wixi_FileStorages_FileHash] ON [wixi_FileStorages] ([FileHash]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251108142635_AddDocumentsModule', N'9.0.10');

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'AllowedFileTypes', N'Code', N'CreatedAt', N'Description_AR', N'Description_DE', N'Description_EN', N'Description_TR', N'DisplayOrder', N'EducationTypeId', N'IconName', N'IsActive', N'IsRequired', N'MaxFileSizeBytes', N'Name_AR', N'Name_DE', N'Name_EN', N'Name_TR', N'Note_AR', N'Note_DE', N'Note_EN', N'Note_TR', N'RequiresApproval', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[wixi_DocumentTypes]'))
    SET IDENTITY_INSERT [wixi_DocumentTypes] ON;
INSERT INTO [wixi_DocumentTypes] ([Id], [AllowedFileTypes], [Code], [CreatedAt], [Description_AR], [Description_DE], [Description_EN], [Description_TR], [DisplayOrder], [EducationTypeId], [IconName], [IsActive], [IsRequired], [MaxFileSizeBytes], [Name_AR], [Name_DE], [Name_EN], [Name_TR], [Note_AR], [Note_DE], [Note_EN], [Note_TR], [RequiresApproval], [UpdatedAt])
VALUES (1, N'.pdf', N'passport', '2025-11-08T00:00:00.0000000Z', N'نسخة ملونة ممسوحة ضوئيًا لجميع صفحات جواز سفرك', N'Farbige gescannte Kopie aller Seiten Ihres Reisepasses', N'Color scanned copy of all pages of your passport', N'Pasaportunuzun tüm sayfalarının renkli taranmış kopyası', 1, NULL, N'passport', CAST(1 AS bit), CAST(1 AS bit), CAST(10485760 AS bigint), N'جواز السفر (نسخة ملونة - PDF)', N'Reisepass (Farbkopie - PDF)', N'Passport (Color Copy - PDF)', N'Pasaport (Renkli Fotokopi - PDF)', NULL, NULL, NULL, NULL, CAST(1 AS bit), NULL),
(2, N'.pdf,.doc,.docx', N'cv', '2025-11-08T00:00:00.0000000Z', N'سيرتك الذاتية الحالية (يفضل الألمانية أو الإنجليزية)', N'Ihr aktueller Lebenslauf (Deutsch oder Englisch bevorzugt)', N'Your current resume (German or English preferred)', N'Güncel özgeçmişiniz (Almanca veya İngilizce tercih edilir)', 2, NULL, N'file-text', CAST(1 AS bit), CAST(1 AS bit), CAST(5242880 AS bigint), N'السيرة الذاتية', N'Lebenslauf / CV', N'Resume / CV', N'Özgeçmiş / CV', N'نقدم خدمة إعداد السيرة الذاتية باللغة الألمانية مقابل 20 يورو', N'Wir bieten einen deutschen Lebenslauf-Erstellungsservice für 20€ an', N'We offer German CV preparation service for 20€', N'20€ ücret karşılığında Almanca CV hazırlama hizmeti sunuyoruz', CAST(1 AS bit), NULL),
(3, N'.pdf', N'diploma', '2025-11-08T00:00:00.0000000Z', N'دبلوم آخر تخرج لك', N'Diplom Ihres letzten Abschlusses', N'Diploma from your most recent graduation', N'En son mezun olduğunuz okul diploması', 3, NULL, N'award', CAST(1 AS bit), CAST(1 AS bit), CAST(10485760 AS bigint), N'الدبلوم (نسخة ملونة - PDF)', N'Diplom (Farbkopie - PDF)', N'Diploma (Color Copy - PDF)', N'Diploma (Renkli Fotokopi - PDF)', NULL, NULL, NULL, NULL, CAST(1 AS bit), NULL),
(4, N'.pdf', N'transcript', '2025-11-08T00:00:00.0000000Z', N'كشف الدرجات الأكاديمي لتعليمك', N'Akademisches Zeugnis Ihrer Ausbildung', N'Academic transcript of your education', N'Eğitim sürecinizin not döküm belgesi', 4, NULL, N'file-spreadsheet', CAST(1 AS bit), CAST(0 AS bit), CAST(10485760 AS bigint), N'كشف العلامات', N'Zeugnis / Notenübersicht', N'Transcript / Grade Report', N'Transkript / Not Dökümü', NULL, NULL, NULL, NULL, CAST(1 AS bit), NULL),
(5, N'.pdf', N'language_cert', '2025-11-08T00:00:00.0000000Z', N'شهادة الكفاءة اللغوية (TOEFL، IELTS، TestDaF، إلخ)', N'Sprachnachweis (TOEFL, IELTS, TestDaF, usw.)', N'Language proficiency certificate (TOEFL, IELTS, TestDaF, etc.)', N'Dil yeterlilik belgeniz (TOEFL, IELTS, TestDaF, vb.)', 5, NULL, N'language', CAST(1 AS bit), CAST(0 AS bit), CAST(10485760 AS bigint), N'شهادة اللغة (الألمانية / الإنجليزية)', N'Sprachzertifikat (Deutsch/Englisch)', N'Language Certificate (German/English)', N'Dil Sertifikası (Almanca/İngilizce)', NULL, NULL, NULL, NULL, CAST(1 AS bit), NULL),
(6, N'.pdf,.jpg,.png', N'id_card', '2025-11-08T00:00:00.0000000Z', N'الجهة الأمامية والخلفية لبطاقة هويتك', N'Vorder- und Rückseite Ihres Personalausweises', N'Front and back of your ID card', N'Kimlik kartınızın ön ve arka yüzü', 6, NULL, N'id-card', CAST(1 AS bit), CAST(1 AS bit), CAST(5242880 AS bigint), N'بطاقة الهوية (الأمام والخلف)', N'Personalausweis (Vorder-Rückseite)', N'ID Card (Front-Back)', N'Kimlik Kartı (Ön-Arka)', NULL, NULL, NULL, NULL, CAST(1 AS bit), NULL),
(7, N'.jpg,.jpeg,.png', N'photo', '2025-11-08T00:00:00.0000000Z', N'صورة حديثة بتنسيق جواز السفر', N'Aktuelles Foto im Passformat', N'Recent photo in passport format', N'Pasaport formatında güncel fotoğrafınız', 7, NULL, N'camera', CAST(1 AS bit), CAST(1 AS bit), CAST(2097152 AS bigint), N'صورة بيومترية', N'Biometrisches Foto', N'Biometric Photo', N'Biyometrik Fotoğraf', NULL, NULL, NULL, NULL, CAST(0 AS bit), NULL);
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'AllowedFileTypes', N'Code', N'CreatedAt', N'Description_AR', N'Description_DE', N'Description_EN', N'Description_TR', N'DisplayOrder', N'EducationTypeId', N'IconName', N'IsActive', N'IsRequired', N'MaxFileSizeBytes', N'Name_AR', N'Name_DE', N'Name_EN', N'Name_TR', N'Note_AR', N'Note_DE', N'Note_EN', N'Note_TR', N'RequiresApproval', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[wixi_DocumentTypes]'))
    SET IDENTITY_INSERT [wixi_DocumentTypes] OFF;

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251108142831_SeedDocumentTypes', N'9.0.10');

CREATE TABLE [wixi_ApplicationTemplates] (
    [Id] int NOT NULL IDENTITY,
    [Name_TR] nvarchar(500) NOT NULL,
    [Name_EN] nvarchar(500) NOT NULL,
    [Name_DE] nvarchar(500) NOT NULL,
    [Name_AR] nvarchar(500) NOT NULL,
    [Description_TR] nvarchar(max) NULL,
    [Description_EN] nvarchar(max) NULL,
    [Description_DE] nvarchar(max) NULL,
    [Description_AR] nvarchar(max) NULL,
    [Type] int NOT NULL,
    [IsActive] bit NOT NULL,
    [IsDefault] bit NOT NULL,
    [DisplayOrder] int NOT NULL,
    [IconName] nvarchar(max) NULL,
    [EstimatedDurationDays] int NULL,
    [MinDurationDays] int NULL,
    [MaxDurationDays] int NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    CONSTRAINT [PK_wixi_ApplicationTemplates] PRIMARY KEY ([Id])
);

CREATE TABLE [wixi_Applications] (
    [Id] bigint NOT NULL IDENTITY,
    [ClientId] int NOT NULL,
    [ApplicationTemplateId] int NOT NULL,
    [ApplicationNumber] nvarchar(50) NOT NULL,
    [Type] int NOT NULL,
    [Status] int NOT NULL,
    [ProgressPercentage] int NOT NULL,
    [StartDate] datetime2 NOT NULL,
    [CompletionDate] datetime2 NULL,
    [ExpectedCompletionDate] datetime2 NULL,
    [CancelledDate] datetime2 NULL,
    [Description] nvarchar(max) NULL,
    [CancellationReason] nvarchar(max) NULL,
    [Notes] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    CONSTRAINT [PK_wixi_Applications] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_wixi_Applications_wixi_ApplicationTemplates_ApplicationTemplateId] FOREIGN KEY ([ApplicationTemplateId]) REFERENCES [wixi_ApplicationTemplates] ([Id]) ON DELETE NO ACTION
);

CREATE TABLE [wixi_ApplicationStepTemplates] (
    [Id] int NOT NULL IDENTITY,
    [ApplicationTemplateId] int NOT NULL,
    [Title_TR] nvarchar(500) NOT NULL,
    [Title_EN] nvarchar(500) NOT NULL,
    [Title_DE] nvarchar(500) NOT NULL,
    [Title_AR] nvarchar(500) NOT NULL,
    [Description_TR] nvarchar(max) NULL,
    [Description_EN] nvarchar(max) NULL,
    [Description_DE] nvarchar(max) NULL,
    [Description_AR] nvarchar(max) NULL,
    [StepOrder] int NOT NULL,
    [IconName] nvarchar(max) NULL,
    [IsRequired] bit NOT NULL,
    [IsActive] bit NOT NULL,
    [EstimatedDurationDays] int NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    CONSTRAINT [PK_wixi_ApplicationStepTemplates] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_wixi_ApplicationStepTemplates_wixi_ApplicationTemplates_ApplicationTemplateId] FOREIGN KEY ([ApplicationTemplateId]) REFERENCES [wixi_ApplicationTemplates] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [wixi_ApplicationHistories] (
    [Id] bigint NOT NULL IDENTITY,
    [ApplicationId] bigint NOT NULL,
    [Action] nvarchar(100) NOT NULL,
    [OldValue] nvarchar(max) NULL,
    [NewValue] nvarchar(max) NULL,
    [Description] nvarchar(max) NULL,
    [UserId] int NULL,
    [UserType] nvarchar(max) NULL,
    [IpAddress] nvarchar(max) NULL,
    [UserAgent] nvarchar(max) NULL,
    [MetadataJson] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_wixi_ApplicationHistories] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_wixi_ApplicationHistories_wixi_Applications_ApplicationId] FOREIGN KEY ([ApplicationId]) REFERENCES [wixi_Applications] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [wixi_ApplicationSteps] (
    [Id] bigint NOT NULL IDENTITY,
    [ApplicationId] bigint NOT NULL,
    [StepTemplateId] int NOT NULL,
    [Title] nvarchar(500) NOT NULL,
    [StepOrder] int NOT NULL,
    [Status] int NOT NULL,
    [ProgressPercentage] int NOT NULL,
    [StartDate] datetime2 NULL,
    [CompletionDate] datetime2 NULL,
    [DueDate] datetime2 NULL,
    [Notes] nvarchar(max) NULL,
    [AssignedTo] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    CONSTRAINT [PK_wixi_ApplicationSteps] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_wixi_ApplicationSteps_wixi_ApplicationStepTemplates_StepTemplateId] FOREIGN KEY ([StepTemplateId]) REFERENCES [wixi_ApplicationStepTemplates] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_wixi_ApplicationSteps_wixi_Applications_ApplicationId] FOREIGN KEY ([ApplicationId]) REFERENCES [wixi_Applications] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [wixi_ApplicationSubStepTemplates] (
    [Id] int NOT NULL IDENTITY,
    [StepTemplateId] int NOT NULL,
    [Name_TR] nvarchar(500) NOT NULL,
    [Name_EN] nvarchar(500) NOT NULL,
    [Name_DE] nvarchar(500) NOT NULL,
    [Name_AR] nvarchar(500) NOT NULL,
    [Description_TR] nvarchar(max) NULL,
    [Description_EN] nvarchar(max) NULL,
    [Description_DE] nvarchar(max) NULL,
    [Description_AR] nvarchar(max) NULL,
    [SubStepOrder] int NOT NULL,
    [IsRequired] bit NOT NULL,
    [IsActive] bit NOT NULL,
    [EstimatedDurationDays] int NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    CONSTRAINT [PK_wixi_ApplicationSubStepTemplates] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_wixi_ApplicationSubStepTemplates_wixi_ApplicationStepTemplates_StepTemplateId] FOREIGN KEY ([StepTemplateId]) REFERENCES [wixi_ApplicationStepTemplates] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [wixi_ApplicationSubSteps] (
    [Id] bigint NOT NULL IDENTITY,
    [ApplicationStepId] bigint NOT NULL,
    [SubStepTemplateId] int NOT NULL,
    [Name] nvarchar(500) NOT NULL,
    [SubStepOrder] int NOT NULL,
    [Status] int NOT NULL,
    [FileNumber] nvarchar(max) NULL,
    [InfoMessage] nvarchar(max) NULL,
    [Notes] nvarchar(max) NULL,
    [CompletionDate] datetime2 NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    CONSTRAINT [PK_wixi_ApplicationSubSteps] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_wixi_ApplicationSubSteps_wixi_ApplicationSteps_ApplicationStepId] FOREIGN KEY ([ApplicationStepId]) REFERENCES [wixi_ApplicationSteps] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_wixi_ApplicationSubSteps_wixi_ApplicationSubStepTemplates_SubStepTemplateId] FOREIGN KEY ([SubStepTemplateId]) REFERENCES [wixi_ApplicationSubStepTemplates] ([Id]) ON DELETE NO ACTION
);

CREATE INDEX [IX_wixi_ApplicationHistories_ApplicationId] ON [wixi_ApplicationHistories] ([ApplicationId]);

CREATE INDEX [IX_wixi_ApplicationHistories_CreatedAt] ON [wixi_ApplicationHistories] ([CreatedAt]);

CREATE INDEX [IX_wixi_ApplicationHistories_UserId] ON [wixi_ApplicationHistories] ([UserId]);

CREATE UNIQUE INDEX [IX_wixi_Applications_ApplicationNumber] ON [wixi_Applications] ([ApplicationNumber]);

CREATE INDEX [IX_wixi_Applications_ApplicationTemplateId] ON [wixi_Applications] ([ApplicationTemplateId]);

CREATE INDEX [IX_wixi_Applications_ClientId] ON [wixi_Applications] ([ClientId]);

CREATE INDEX [IX_wixi_Applications_StartDate] ON [wixi_Applications] ([StartDate]);

CREATE INDEX [IX_wixi_Applications_Status] ON [wixi_Applications] ([Status]);

CREATE INDEX [IX_wixi_ApplicationSteps_ApplicationId] ON [wixi_ApplicationSteps] ([ApplicationId]);

CREATE INDEX [IX_wixi_ApplicationSteps_Status] ON [wixi_ApplicationSteps] ([Status]);

CREATE INDEX [IX_wixi_ApplicationSteps_StepTemplateId] ON [wixi_ApplicationSteps] ([StepTemplateId]);

CREATE INDEX [IX_wixi_ApplicationStepTemplates_ApplicationTemplateId] ON [wixi_ApplicationStepTemplates] ([ApplicationTemplateId]);

CREATE INDEX [IX_wixi_ApplicationSubSteps_ApplicationStepId] ON [wixi_ApplicationSubSteps] ([ApplicationStepId]);

CREATE INDEX [IX_wixi_ApplicationSubSteps_Status] ON [wixi_ApplicationSubSteps] ([Status]);

CREATE INDEX [IX_wixi_ApplicationSubSteps_SubStepTemplateId] ON [wixi_ApplicationSubSteps] ([SubStepTemplateId]);

CREATE INDEX [IX_wixi_ApplicationSubStepTemplates_StepTemplateId] ON [wixi_ApplicationSubStepTemplates] ([StepTemplateId]);

CREATE INDEX [IX_wixi_ApplicationTemplates_Type] ON [wixi_ApplicationTemplates] ([Type]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251108143219_AddApplicationsModule', N'9.0.10');

CREATE TABLE [wixi_FAQs] (
    [Id] int NOT NULL IDENTITY,
    [Question_TR] nvarchar(max) NOT NULL,
    [Question_EN] nvarchar(max) NOT NULL,
    [Question_DE] nvarchar(max) NOT NULL,
    [Question_AR] nvarchar(max) NOT NULL,
    [Answer_TR] nvarchar(max) NOT NULL,
    [Answer_EN] nvarchar(max) NOT NULL,
    [Answer_DE] nvarchar(max) NOT NULL,
    [Answer_AR] nvarchar(max) NOT NULL,
    [Category] int NOT NULL,
    [Tags] nvarchar(max) NULL,
    [DisplayOrder] int NOT NULL,
    [IsActive] bit NOT NULL,
    [IsFeatured] bit NOT NULL,
    [ViewCount] int NOT NULL,
    [HelpfulCount] int NOT NULL,
    [NotHelpfulCount] int NOT NULL,
    [RelatedLink] nvarchar(max) NULL,
    [VideoUrl] nvarchar(max) NULL,
    [AuthorId] int NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [PublishedAt] datetime2 NULL,
    CONSTRAINT [PK_wixi_FAQs] PRIMARY KEY ([Id])
);

CREATE TABLE [wixi_Notifications] (
    [Id] bigint NOT NULL IDENTITY,
    [UserId] int NOT NULL,
    [Type] int NOT NULL,
    [Title] nvarchar(500) NOT NULL,
    [Message] nvarchar(max) NOT NULL,
    [ActionUrl] nvarchar(max) NULL,
    [ActionText] nvarchar(max) NULL,
    [RelatedEntityType] nvarchar(450) NULL,
    [RelatedEntityId] bigint NULL,
    [IsRead] bit NOT NULL,
    [ReadAt] datetime2 NULL,
    [IsArchived] bit NOT NULL,
    [ArchivedAt] datetime2 NULL,
    [Priority] int NOT NULL,
    [SentViaEmail] bit NOT NULL,
    [EmailSentAt] datetime2 NULL,
    [SentViaPush] bit NOT NULL,
    [PushSentAt] datetime2 NULL,
    [ExpiresAt] datetime2 NULL,
    [MetadataJson] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_wixi_Notifications] PRIMARY KEY ([Id])
);

CREATE TABLE [wixi_SupportTickets] (
    [Id] bigint NOT NULL IDENTITY,
    [ClientId] int NOT NULL,
    [TicketNumber] nvarchar(50) NOT NULL,
    [Subject] nvarchar(500) NOT NULL,
    [Status] int NOT NULL,
    [Priority] int NOT NULL,
    [Category] int NOT NULL,
    [AssignedToId] int NULL,
    [FirstResponseAt] datetime2 NULL,
    [ResolvedAt] datetime2 NULL,
    [ClosedAt] datetime2 NULL,
    [DueDate] datetime2 NULL,
    [Resolution] nvarchar(max) NULL,
    [CloseReason] nvarchar(max) NULL,
    [Rating] int NULL,
    [RatingComment] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    CONSTRAINT [PK_wixi_SupportTickets] PRIMARY KEY ([Id])
);

CREATE TABLE [wixi_SupportMessages] (
    [Id] bigint NOT NULL IDENTITY,
    [TicketId] bigint NOT NULL,
    [SenderId] int NOT NULL,
    [Message] nvarchar(max) NOT NULL,
    [IsInternal] bit NOT NULL,
    [IsFromClient] bit NOT NULL,
    [IsAutomated] bit NOT NULL,
    [AttachmentFileName] nvarchar(max) NULL,
    [AttachmentPath] nvarchar(max) NULL,
    [AttachmentSizeBytes] bigint NULL,
    [IsRead] bit NOT NULL,
    [ReadAt] datetime2 NULL,
    [IpAddress] nvarchar(max) NULL,
    [UserAgent] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [DeletedAt] datetime2 NULL,
    CONSTRAINT [PK_wixi_SupportMessages] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_wixi_SupportMessages_wixi_SupportTickets_TicketId] FOREIGN KEY ([TicketId]) REFERENCES [wixi_SupportTickets] ([Id]) ON DELETE CASCADE
);

CREATE INDEX [IX_wixi_FAQs_Category] ON [wixi_FAQs] ([Category]);

CREATE INDEX [IX_wixi_FAQs_IsActive] ON [wixi_FAQs] ([IsActive]);

CREATE INDEX [IX_wixi_FAQs_IsFeatured] ON [wixi_FAQs] ([IsFeatured]);

CREATE INDEX [IX_wixi_Notifications_CreatedAt] ON [wixi_Notifications] ([CreatedAt]);

CREATE INDEX [IX_wixi_Notifications_IsArchived] ON [wixi_Notifications] ([IsArchived]);

CREATE INDEX [IX_wixi_Notifications_IsRead] ON [wixi_Notifications] ([IsRead]);

CREATE INDEX [IX_wixi_Notifications_RelatedEntityType_RelatedEntityId] ON [wixi_Notifications] ([RelatedEntityType], [RelatedEntityId]);

CREATE INDEX [IX_wixi_Notifications_Type] ON [wixi_Notifications] ([Type]);

CREATE INDEX [IX_wixi_Notifications_UserId] ON [wixi_Notifications] ([UserId]);

CREATE INDEX [IX_wixi_SupportMessages_CreatedAt] ON [wixi_SupportMessages] ([CreatedAt]);

CREATE INDEX [IX_wixi_SupportMessages_SenderId] ON [wixi_SupportMessages] ([SenderId]);

CREATE INDEX [IX_wixi_SupportMessages_TicketId] ON [wixi_SupportMessages] ([TicketId]);

CREATE INDEX [IX_wixi_SupportTickets_AssignedToId] ON [wixi_SupportTickets] ([AssignedToId]);

CREATE INDEX [IX_wixi_SupportTickets_ClientId] ON [wixi_SupportTickets] ([ClientId]);

CREATE INDEX [IX_wixi_SupportTickets_CreatedAt] ON [wixi_SupportTickets] ([CreatedAt]);

CREATE INDEX [IX_wixi_SupportTickets_Priority] ON [wixi_SupportTickets] ([Priority]);

CREATE INDEX [IX_wixi_SupportTickets_Status] ON [wixi_SupportTickets] ([Status]);

CREATE UNIQUE INDEX [IX_wixi_SupportTickets_TicketNumber] ON [wixi_SupportTickets] ([TicketNumber]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251108143506_AddSupportModule', N'9.0.10');

CREATE TABLE [wixi_EmailLogs] (
    [Id] bigint NOT NULL IDENTITY,
    [CorrelationId] uniqueidentifier NULL,
    [FromEmail] nvarchar(256) NOT NULL,
    [FromName] nvarchar(max) NULL,
    [ToEmails] nvarchar(1000) NOT NULL,
    [CcEmails] nvarchar(max) NULL,
    [BccEmails] nvarchar(max) NULL,
    [Subject] nvarchar(max) NULL,
    [BodyHtml] nvarchar(max) NULL,
    [BodyText] nvarchar(max) NULL,
    [Attachments] nvarchar(max) NULL,
    [Status] tinyint NOT NULL,
    [AttemptCount] int NOT NULL,
    [LastAttemptAt] datetime2 NULL,
    [LastError] nvarchar(max) NULL,
    [SmtpHost] nvarchar(max) NULL,
    [SmtpPort] int NULL,
    [UsedSsl] bit NULL,
    [UsedUserName] nvarchar(max) NULL,
    [TemplateKey] nvarchar(450) NULL,
    [MetadataJson] nvarchar(max) NULL,
    [RequestIp] nvarchar(max) NULL,
    [UserAgent] nvarchar(max) NULL,
    [CreatedBy] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_wixi_EmailLogs] PRIMARY KEY ([Id])
);

CREATE TABLE [wixi_EmailTemplates] (
    [Id] int NOT NULL IDENTITY,
    [Key] nvarchar(100) NOT NULL,
    [Subject_TR] nvarchar(max) NOT NULL,
    [Subject_EN] nvarchar(max) NOT NULL,
    [Subject_DE] nvarchar(max) NOT NULL,
    [Subject_AR] nvarchar(max) NOT NULL,
    [BodyHtml_TR] nvarchar(max) NOT NULL,
    [BodyHtml_EN] nvarchar(max) NOT NULL,
    [BodyHtml_DE] nvarchar(max) NOT NULL,
    [BodyHtml_AR] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NULL,
    [IsActive] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    [UpdatedBy] nvarchar(max) NULL,
    [RowVersion] rowversion NULL,
    CONSTRAINT [PK_wixi_EmailTemplates] PRIMARY KEY ([Id])
);

CREATE TABLE [wixi_SmtpSettings] (
    [Id] int NOT NULL IDENTITY,
    [Host] nvarchar(256) NOT NULL,
    [Port] int NOT NULL,
    [UseSsl] bit NOT NULL,
    [UserName] nvarchar(256) NOT NULL,
    [PasswordEnc] nvarchar(max) NOT NULL,
    [FromName] nvarchar(max) NOT NULL,
    [FromEmail] nvarchar(256) NOT NULL,
    [TimeoutMs] int NULL,
    [RetryCount] int NOT NULL,
    [MaxAttemptsPerEmail] int NOT NULL,
    [IsActive] bit NOT NULL,
    [IsDefault] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    [UpdatedBy] nvarchar(max) NULL,
    [RowVersion] rowversion NULL,
    CONSTRAINT [PK_wixi_SmtpSettings] PRIMARY KEY ([Id])
);

CREATE INDEX [IX_wixi_EmailLogs_CorrelationId] ON [wixi_EmailLogs] ([CorrelationId]);

CREATE INDEX [IX_wixi_EmailLogs_CreatedAt] ON [wixi_EmailLogs] ([CreatedAt]);

CREATE INDEX [IX_wixi_EmailLogs_Status] ON [wixi_EmailLogs] ([Status]);

CREATE INDEX [IX_wixi_EmailLogs_TemplateKey] ON [wixi_EmailLogs] ([TemplateKey]);

CREATE INDEX [IX_wixi_EmailTemplates_IsActive] ON [wixi_EmailTemplates] ([IsActive]);

CREATE UNIQUE INDEX [IX_wixi_EmailTemplates_Key] ON [wixi_EmailTemplates] ([Key]);

CREATE INDEX [IX_wixi_SmtpSettings_IsActive] ON [wixi_SmtpSettings] ([IsActive]);

CREATE INDEX [IX_wixi_SmtpSettings_IsDefault] ON [wixi_SmtpSettings] ([IsDefault]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251108143822_AddEmailModule', N'9.0.10');

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CreatedAt', N'Description_AR', N'Description_DE', N'Description_EN', N'Description_TR', N'DisplayOrder', N'EstimatedDurationDays', N'IconName', N'IsActive', N'IsDefault', N'MaxDurationDays', N'MinDurationDays', N'Name_AR', N'Name_DE', N'Name_EN', N'Name_TR', N'Type', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[wixi_ApplicationTemplates]'))
    SET IDENTITY_INSERT [wixi_ApplicationTemplates] ON;
INSERT INTO [wixi_ApplicationTemplates] ([Id], [CreatedAt], [Description_AR], [Description_DE], [Description_EN], [Description_TR], [DisplayOrder], [EstimatedDurationDays], [IconName], [IsActive], [IsDefault], [MaxDurationDays], [MinDurationDays], [Name_AR], [Name_DE], [Name_EN], [Name_TR], [Type], [UpdatedAt])
VALUES (1, '2025-11-08T00:00:00.0000000Z', N'العملية القياسية لإجراءات الاعتراف بالدبلوم', N'Standardverfahren für Diplomanerkennung', N'Standard process for diploma recognition procedures', N'Diploma denklik işlemleri için standart süreç', 1, 90, N'award', CAST(1 AS bit), CAST(1 AS bit), 180, 60, N'عملية الاعتراف', N'Anerkennungsverfahren', N'Recognition Process', N'Denklik İşlem Süreci', 1, NULL),
(2, '2025-11-08T00:00:00.0000000Z', N'عملية البحث عن عمل وتصريح العمل', N'Jobsuche und Arbeitserlaubnisantrag', N'Job search and work permit application process', N'İş arama ve çalışma izni başvuru süreci', 2, 120, N'briefcase', CAST(1 AS bit), CAST(0 AS bit), 240, 90, N'عملية تصريح العمل', N'Arbeitserlaubnisverfahren', N'Work Permit Process', N'İş Bulma ve Çalışma İzni Süreci', 2, NULL),
(3, '2025-11-08T00:00:00.0000000Z', N'عملية طلب التأشيرة والمتابعة', N'Visumantrags- und Verfolgungsverfahren', N'Visa application and tracking process', N'Vize başvurusu ve takip süreci', 3, 60, N'globe', CAST(1 AS bit), CAST(0 AS bit), 120, 30, N'عملية التأشيرة', N'Visumverfahren', N'Visa Process', N'Vize İşlem Süreci', 3, NULL),
(4, '2025-11-08T00:00:00.0000000Z', N'العملية الكاملة بما في ذلك الاعتراف وتصريح العمل والتأشيرة', N'Vollständiger Prozess einschließlich Anerkennung, Arbeitserlaubnis und Visum', N'Complete process including recognition, work permit and visa procedures', N'Denklik, iş izni ve vize işlemlerini içeren tam süreç', 4, 180, N'list-checks', CAST(1 AS bit), CAST(0 AS bit), 360, 120, N'العملية الكاملة (الكل)', N'Vollständiger Prozess (Alle)', N'Full Process (All)', N'Tam Süreç (Hepsi)', 4, NULL);
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CreatedAt', N'Description_AR', N'Description_DE', N'Description_EN', N'Description_TR', N'DisplayOrder', N'EstimatedDurationDays', N'IconName', N'IsActive', N'IsDefault', N'MaxDurationDays', N'MinDurationDays', N'Name_AR', N'Name_DE', N'Name_EN', N'Name_TR', N'Type', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[wixi_ApplicationTemplates]'))
    SET IDENTITY_INSERT [wixi_ApplicationTemplates] OFF;

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Answer_AR', N'Answer_DE', N'Answer_EN', N'Answer_TR', N'AuthorId', N'Category', N'CreatedAt', N'DisplayOrder', N'HelpfulCount', N'IsActive', N'IsFeatured', N'NotHelpfulCount', N'PublishedAt', N'Question_AR', N'Question_DE', N'Question_EN', N'Question_TR', N'RelatedLink', N'Tags', N'UpdatedAt', N'VideoUrl', N'ViewCount') AND [object_id] = OBJECT_ID(N'[wixi_FAQs]'))
    SET IDENTITY_INSERT [wixi_FAQs] ON;
INSERT INTO [wixi_FAQs] ([Id], [Answer_AR], [Answer_DE], [Answer_EN], [Answer_TR], [AuthorId], [Category], [CreatedAt], [DisplayOrder], [HelpfulCount], [IsActive], [IsFeatured], [NotHelpfulCount], [PublishedAt], [Question_AR], [Question_DE], [Question_EN], [Question_TR], [RelatedLink], [Tags], [UpdatedAt], [VideoUrl], [ViewCount])
VALUES (1, N'تستغرق عملية التقديم عادةً 3-6 أشهر حتى تكتمل. قد تختلف المدة اعتمادًا على نوع الطلب والتقديم الكامل للمستندات المطلوبة.', N'Der Bewerbungsprozess dauert in der Regel 3-6 Monate. Die Dauer kann je nach Art der Bewerbung und vollständiger Einreichung der erforderlichen Dokumente variieren.', N'The application process typically takes 3-6 months to complete. Duration may vary depending on the application type and complete submission of required documents.', N'Başvuru süreci ortalama 3-6 ay arasında tamamlanır. Süre, başvuru tipine ve gerekli belgelerin eksiksiz sunulmasına bağlı olarak değişebilir.', NULL, 1, '2025-11-08T00:00:00.0000000Z', 1, 0, CAST(1 AS bit), CAST(1 AS bit), 0, '2025-11-08T00:00:00.0000000Z', N'كم من الوقت تستغرق عملية التقديم؟', N'Wie lange dauert der Bewerbungsprozess?', N'How long does the application process take?', N'Başvuru süreci ne kadar sürer?', NULL, N'başvuru,süre,process,duration', NULL, NULL, 0),
(2, N'تختلف المستندات المطلوبة بناءً على مستوى تعليمك. جواز السفر والدبلوم وكشف الدرجات والسيرة الذاتية ووثيقة الهوية هي المتطلبات الأساسية. تحقق من صفحة تحميل المستندات للحصول على قائمة مفصلة.', N'Die erforderlichen Dokumente variieren je nach Bildungsniveau. Reisepass, Diplom, Zeugnis, Lebenslauf und Ausweisdokument sind grundlegende Anforderungen. Überprüfen Sie die Dokumenten-Upload-Seite für eine detaillierte Liste.', N'Required documents vary based on your education level. Passport, diploma, transcript, CV and ID document are basic requirements. Check the document upload page for detailed list.', N'Yüklemeniz gereken belgeler eğitim durumunuza göre değişir. Pasaport, diploma, transkript, CV ve kimlik belgesi temel belgelerdir. Ayrıntılı liste için belge yükleme sayfasını kontrol edin.', NULL, 2, '2025-11-08T00:00:00.0000000Z', 2, 0, CAST(1 AS bit), CAST(1 AS bit), 0, '2025-11-08T00:00:00.0000000Z', N'ما هي المستندات التي أحتاج لتحميلها؟', N'Welche Dokumente muss ich hochladen?', N'Which documents do I need to upload?', N'Hangi belgeleri yüklemem gerekiyor?', NULL, N'belgeler,documents,yükleme,upload', NULL, NULL, 0),
(3, N'يمكنك تتبع جميع مراحل طلبك في الوقت الفعلي من صفحة لوحة التحكم. يتم عرض حالة ونسبة إكمال كل خطوة.', N'Sie können alle Phasen Ihrer Bewerbung in Echtzeit von der Dashboard-Seite aus verfolgen. Status und Abschlussgrad jedes Schritts werden angezeigt.', N'You can track all stages of your application in real-time from the Dashboard page. Status and completion percentage of each step are displayed.', N'Dashboard sayfasından başvurunuzun tüm aşamalarını gerçek zamanlı olarak takip edebilirsiniz. Her adımın durumu ve tamamlanma yüzdesi görüntülenir.', NULL, 3, '2025-11-08T00:00:00.0000000Z', 3, 0, CAST(1 AS bit), CAST(1 AS bit), 0, '2025-11-08T00:00:00.0000000Z', N'كيف يمكنني تتبع حالة طلبي؟', N'Wie kann ich meinen Bewerbungsstatus verfolgen?', N'How can I track my application status?', N'Başvuru durumumu nasıl takip edebilirim?', NULL, N'takip,tracking,durum,status', NULL, NULL, 0),
(4, N'الاعتراف هو عملية الحصول على اعتراف بالدبلومات والشهادات المكتسبة في الخارج في ألمانيا. تتيح لك هذه العملية ممارسة مهنتك في ألمانيا.', N'Anerkennung ist der Prozess der Anerkennung von im Ausland erworbenen Diplomen und Zertifikaten in Deutschland. Dieser Prozess ermöglicht es Ihnen, Ihren Beruf in Deutschland auszuüben.', N'Recognition is the process of having diplomas and certificates obtained abroad recognized in Germany. This process allows you to practice your profession in Germany.', N'Denklik, yurt dışında alınan diploma ve belgelerin Almanya''da tanınması işlemidir. Bu işlem sayesinde mesleğinizi Almanya''da icra edebilirsiniz.', NULL, 9, '2025-11-08T00:00:00.0000000Z', 4, 0, CAST(1 AS bit), CAST(1 AS bit), 0, '2025-11-08T00:00:00.0000000Z', N'ما هي عملية الاعتراف؟', N'Was ist der Anerkennungsprozess?', N'What is the recognition process?', N'Denklik işlemi nedir?', NULL, N'denklik,recognition,diploma,anerkennung', NULL, NULL, 0),
(5, N'للحصول على تصريح عمل، تحتاج أولاً إلى العثور على صاحب عمل في ألمانيا. يتقدم صاحب العمل نيابة عنك إلى Agentur für Arbeit. بعد الموافقة، يتم إصدار تصريح العمل الخاص بك.', N'Um eine Arbeitserlaubnis zu erhalten, müssen Sie zunächst einen Arbeitgeber in Deutschland finden. Der Arbeitgeber beantragt für Sie bei der Agentur für Arbeit. Nach Genehmigung wird Ihre Arbeitserlaubnis ausgestellt.', N'To get a work permit, you first need to find an employer in Germany. The employer applies to the Agentur für Arbeit on your behalf. After approval, your work permit is issued.', N'Çalışma izni için önce Almanya''da bir işveren bulmalısınız. İşveren sizin için Agentur für Arbeit''a başvuru yapar. Onay sonrası çalışma izniniz düzenlenir.', NULL, 8, '2025-11-08T00:00:00.0000000Z', 5, 0, CAST(1 AS bit), CAST(0 AS bit), 0, '2025-11-08T00:00:00.0000000Z', N'كيفية الحصول على تصريح عمل؟', N'Wie bekomme ich eine Arbeitserlaubnis?', N'How to get a work permit?', N'Çalışma izni nasıl alınır?', NULL, N'çalışma izni,work permit,arbeitserlaubnis,employment', NULL, NULL, 0);
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Answer_AR', N'Answer_DE', N'Answer_EN', N'Answer_TR', N'AuthorId', N'Category', N'CreatedAt', N'DisplayOrder', N'HelpfulCount', N'IsActive', N'IsFeatured', N'NotHelpfulCount', N'PublishedAt', N'Question_AR', N'Question_DE', N'Question_EN', N'Question_TR', N'RelatedLink', N'Tags', N'UpdatedAt', N'VideoUrl', N'ViewCount') AND [object_id] = OBJECT_ID(N'[wixi_FAQs]'))
    SET IDENTITY_INSERT [wixi_FAQs] OFF;

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'ApplicationTemplateId', N'CreatedAt', N'Description_AR', N'Description_DE', N'Description_EN', N'Description_TR', N'EstimatedDurationDays', N'IconName', N'IsActive', N'IsRequired', N'StepOrder', N'Title_AR', N'Title_DE', N'Title_EN', N'Title_TR', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[wixi_ApplicationStepTemplates]'))
    SET IDENTITY_INSERT [wixi_ApplicationStepTemplates] ON;
INSERT INTO [wixi_ApplicationStepTemplates] ([Id], [ApplicationTemplateId], [CreatedAt], [Description_AR], [Description_DE], [Description_EN], [Description_TR], [EstimatedDurationDays], [IconName], [IsActive], [IsRequired], [StepOrder], [Title_AR], [Title_DE], [Title_EN], [Title_TR], [UpdatedAt])
VALUES (1, 1, '2025-11-08T00:00:00.0000000Z', N'إجراءات الاعتراف بالدبلوم وعملية الموافقة', N'Diplomanerkennung und Genehmigungsverfahren', N'Diploma recognition procedures and approval process', N'Diploma denklik işlemleri ve onay süreci', 90, N'file-check', CAST(1 AS bit), CAST(1 AS bit), 1, N'إجراءات الاعتراف', N'Anerkennungsverfahren', N'Recognition Procedures', N'Denklik İşlemleri', NULL),
(2, 2, '2025-11-08T00:00:00.0000000Z', N'إجراءات البحث عن عمل وتصريح العمل', N'Jobsuche und Arbeitserlaubnisantrag', N'Job search and work permit application procedures', N'İş arama ve çalışma izni başvuru süreçleri', 120, N'briefcase', CAST(1 AS bit), CAST(1 AS bit), 1, N'إجراءات تصريح العمل', N'Arbeitserlaubnisverfahren', N'Work Permit Procedures', N'İş Bulma ve Çalışma İzni İşlemleri', NULL),
(3, 3, '2025-11-08T00:00:00.0000000Z', N'عملية طلب التأشيرة والموافقة', N'Visumantrags- und Genehmigungsverfahren', N'Visa application and approval process', N'Vize başvurusu ve onay süreci', 60, N'globe', CAST(1 AS bit), CAST(1 AS bit), 1, N'إجراءات التأشيرة', N'Visumverfahren', N'Visa Procedures', N'Vize İşlemleri', NULL);
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'ApplicationTemplateId', N'CreatedAt', N'Description_AR', N'Description_DE', N'Description_EN', N'Description_TR', N'EstimatedDurationDays', N'IconName', N'IsActive', N'IsRequired', N'StepOrder', N'Title_AR', N'Title_DE', N'Title_EN', N'Title_TR', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[wixi_ApplicationStepTemplates]'))
    SET IDENTITY_INSERT [wixi_ApplicationStepTemplates] OFF;

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CreatedAt', N'Description_AR', N'Description_DE', N'Description_EN', N'Description_TR', N'EstimatedDurationDays', N'IsActive', N'IsRequired', N'Name_AR', N'Name_DE', N'Name_EN', N'Name_TR', N'StepTemplateId', N'SubStepOrder', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[wixi_ApplicationSubStepTemplates]'))
    SET IDENTITY_INSERT [wixi_ApplicationSubStepTemplates] ON;
INSERT INTO [wixi_ApplicationSubStepTemplates] ([Id], [CreatedAt], [Description_AR], [Description_DE], [Description_EN], [Description_TR], [EstimatedDurationDays], [IsActive], [IsRequired], [Name_AR], [Name_DE], [Name_EN], [Name_TR], [StepTemplateId], [SubStepOrder], [UpdatedAt])
VALUES (1, '2025-11-08T00:00:00.0000000Z', N'تم تحميل المستندات المطلوبة إلى النظام', N'Erforderliche Dokumente ins System hochgeladen', N'Required documents uploaded to system', N'Gerekli belgeler sisteme yüklendi', 3, CAST(1 AS bit), CAST(1 AS bit), N'تم تحميل المستندات', N'Dokumente hochgeladen', N'Documents Uploaded', N'Belgeler Yüklendi', 1, 1, NULL),
(2, '2025-11-08T00:00:00.0000000Z', N'تم تقديم طلب الاعتراف إلى السلطة المختصة', N'Anerkennungsantrag bei zuständiger Behörde eingereicht', N'Recognition application submitted to relevant authority', N'Denklik başvurusu ilgili kuruma yapıldı', 7, CAST(1 AS bit), CAST(1 AS bit), N'تم تقديم طلب الاعتراف', N'Anerkennungsantrag eingereicht', N'Recognition Application Submitted', N'Denklik Başvurusu Yapıldı', 1, 2, NULL),
(3, '2025-11-08T00:00:00.0000000Z', N'تم دفع رسوم معالجة الاعتراف', N'Anerkennungsbearbeitungsgebühr bezahlt', N'Recognition processing fee paid', N'Denklik işlem ücreti ödendi', 2, CAST(1 AS bit), CAST(1 AS bit), N'تم دفع رسوم الاعتراف', N'Anerkennungsgebühr bezahlt', N'Recognition Fee Paid', N'Denklik Harç Ödemesi Yapıldı', 1, 3, NULL),
(4, '2025-11-08T00:00:00.0000000Z', N'شهادة الاعتراف معتمدة وجاهزة', N'Anerkennungszertifikat genehmigt und fertig', N'Recognition certificate approved and ready', N'Denklik belgesi onaylandı ve hazır', 78, CAST(1 AS bit), CAST(1 AS bit), N'شهادة الاعتراف جاهزة', N'Anerkennungszertifikat fertig', N'Recognition Certificate Ready', N'Denklik Belgesi Hazır', 1, 4, NULL),
(5, '2025-11-08T00:00:00.0000000Z', N'البحث النشط عن عمل', N'Aktive Jobsuche', N'Actively searching for employment', N'Aktif olarak iş aranıyor', 60, CAST(1 AS bit), CAST(1 AS bit), N'في عملية البحث عن عمل', N'Im Jobsuchprozess', N'In Job Search Process', N'İş Arama Sürecinde', 2, 1, NULL),
(6, '2025-11-08T00:00:00.0000000Z', N'عرض عمل من صاحب العمل', N'Stellenangebot vom Arbeitgeber', N'Job offer made by employer', N'İşveren tarafından iş teklifi yapıldı', 7, CAST(1 AS bit), CAST(1 AS bit), N'تم استلام عرض العمل', N'Stellenangebot erhalten', N'Job Offer Received', N'İş Teklifi Alındı', 2, 2, NULL),
(7, '2025-11-08T00:00:00.0000000Z', N'تم تقديم طلب تصريح العمل الرسمي', N'Offizieller Arbeitserlaubnisantrag eingereicht', N'Official work permit application submitted', N'Çalışma izni için resmi başvuru yapıldı', 45, CAST(1 AS bit), CAST(1 AS bit), N'تم تقديم طلب تصريح العمل', N'Arbeitserlaubnisantrag eingereicht', N'Work Permit Application Submitted', N'Çalışma İzni Başvurusu Yapıldı', 2, 3, NULL),
(8, '2025-11-08T00:00:00.0000000Z', N'تم الموافقة رسميًا على تصريح العمل', N'Arbeitserlaubnis offiziell genehmigt', N'Work permit officially approved', N'Çalışma izni resmi olarak onaylandı', 8, CAST(1 AS bit), CAST(1 AS bit), N'تم الموافقة على تصريح العمل', N'Arbeitserlaubnis genehmigt', N'Work Permit Approved', N'Çalışma İzni Onaylandı', 2, 4, NULL),
(9, '2025-11-08T00:00:00.0000000Z', N'تم إعداد المستندات المطلوبة لطلب التأشيرة', N'Erforderliche Dokumente für Visumantrag vorbereitet', N'Required documents for visa application prepared', N'Vize başvurusu için gerekli belgeler hazırlandı', 5, CAST(1 AS bit), CAST(1 AS bit), N'تم إعداد مستندات طلب التأشيرة', N'Visumantragsunterlagen vorbereitet', N'Visa Application Documents Prepared', N'Vize Başvuru Belgeler Hazırlandı', 3, 1, NULL),
(10, '2025-11-08T00:00:00.0000000Z', N'تم تقديم طلب التأشيرة إلى القنصلية', N'Visumantrag beim Konsulat eingereicht', N'Visa application submitted to consulate', N'Vize başvurusu konsolosluğa yapıldı', 35, CAST(1 AS bit), CAST(1 AS bit), N'تم تقديم طلب التأشيرة', N'Visumantrag eingereicht', N'Visa Application Submitted', N'Vize Başvurusu Yapıldı', 3, 2, NULL),
(11, '2025-11-08T00:00:00.0000000Z', N'تم الموافقة على طلب التأشيرة وجاهزة', N'Visumantrag genehmigt und fertig', N'Visa application approved and ready', N'Vize başvurusu onaylandı ve hazır', 20, CAST(1 AS bit), CAST(1 AS bit), N'تم الموافقة على التأشيرة', N'Visum genehmigt', N'Visa Approved', N'Vize Onaylandı', 3, 3, NULL);
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CreatedAt', N'Description_AR', N'Description_DE', N'Description_EN', N'Description_TR', N'EstimatedDurationDays', N'IsActive', N'IsRequired', N'Name_AR', N'Name_DE', N'Name_EN', N'Name_TR', N'StepTemplateId', N'SubStepOrder', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[wixi_ApplicationSubStepTemplates]'))
    SET IDENTITY_INSERT [wixi_ApplicationSubStepTemplates] OFF;

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251108144301_AddCompleteSeedData', N'9.0.10');

CREATE TABLE [wixi_TokenBlacklists] (
    [Id] int NOT NULL IDENTITY,
    [Token] nvarchar(450) NOT NULL,
    [UserId] int NOT NULL,
    [BlacklistedAt] datetime2 NOT NULL,
    [ExpirationDate] datetime2 NOT NULL,
    [Reason] nvarchar(500) NULL,
    CONSTRAINT [PK_wixi_TokenBlacklists] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_wixi_TokenBlacklists_wixi_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [wixi_Users] ([Id]) ON DELETE CASCADE
);

CREATE INDEX [IX_wixi_TokenBlacklists_ExpirationDate] ON [wixi_TokenBlacklists] ([ExpirationDate]);

CREATE UNIQUE INDEX [IX_wixi_TokenBlacklists_Token] ON [wixi_TokenBlacklists] ([Token]);

CREATE INDEX [IX_wixi_TokenBlacklists_UserId] ON [wixi_TokenBlacklists] ([UserId]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251108145208_AddTokenBlacklistTable', N'9.0.10');

CREATE TABLE [wixi_ContactFormSubmissions] (
    [Id] int NOT NULL IDENTITY,
    [CreatedAt] datetime2 NOT NULL,
    [FirstName] nvarchar(100) NOT NULL,
    [LastName] nvarchar(100) NOT NULL,
    [Email] nvarchar(256) NOT NULL,
    [Phone] nvarchar(50) NOT NULL,
    [Age] int NULL,
    [Nationality] nvarchar(100) NULL,
    [Education] nvarchar(200) NULL,
    [FieldOfStudy] nvarchar(200) NULL,
    [WorkExperience] nvarchar(max) NULL,
    [GermanLevel] nvarchar(50) NULL,
    [EnglishLevel] nvarchar(50) NULL,
    [Interest] nvarchar(200) NULL,
    [PreferredCity] nvarchar(100) NULL,
    [Timeline] nvarchar(100) NULL,
    [Message] nvarchar(max) NULL,
    [PrivacyConsent] bit NOT NULL,
    [Newsletter] bit NOT NULL,
    [RequestIp] nvarchar(50) NULL,
    [UserAgent] nvarchar(max) NULL,
    [Language] nvarchar(10) NULL,
    [EmailLogId] int NULL,
    [Status] nvarchar(50) NOT NULL,
    [AdminNotes] nvarchar(max) NULL,
    [UpdatedAt] datetime2 NULL,
    CONSTRAINT [PK_wixi_ContactFormSubmissions] PRIMARY KEY ([Id])
);

CREATE TABLE [wixi_EmployeeFormSubmissions] (
    [Id] int NOT NULL IDENTITY,
    [CreatedAt] datetime2 NOT NULL,
    [Salutation] nvarchar(20) NULL,
    [FullName] nvarchar(200) NOT NULL,
    [Email] nvarchar(256) NOT NULL,
    [Phone] nvarchar(50) NOT NULL,
    [Profession] nvarchar(100) NULL,
    [Experience] int NULL,
    [Education] nvarchar(200) NULL,
    [GermanLevel] nvarchar(50) NULL,
    [AdditionalInfo] nvarchar(max) NULL,
    [CvFileName] nvarchar(500) NULL,
    [CvFilePath] nvarchar(1000) NULL,
    [CvFileSize] bigint NULL,
    [SpecialRequests] nvarchar(max) NULL,
    [RequestIp] nvarchar(50) NULL,
    [UserAgent] nvarchar(max) NULL,
    [Language] nvarchar(10) NULL,
    [EmailLogId] int NULL,
    [Status] nvarchar(50) NOT NULL,
    [AdminNotes] nvarchar(max) NULL,
    [UpdatedAt] datetime2 NULL,
    CONSTRAINT [PK_wixi_EmployeeFormSubmissions] PRIMARY KEY ([Id])
);

CREATE TABLE [wixi_EmployerFormSubmissions] (
    [Id] int NOT NULL IDENTITY,
    [CreatedAt] datetime2 NOT NULL,
    [CompanyName] nvarchar(200) NOT NULL,
    [ContactPerson] nvarchar(200) NOT NULL,
    [Email] nvarchar(256) NOT NULL,
    [Phone] nvarchar(50) NOT NULL,
    [Industry] nvarchar(100) NOT NULL,
    [CompanySize] nvarchar(50) NULL,
    [Positions] nvarchar(max) NOT NULL,
    [Requirements] nvarchar(max) NOT NULL,
    [Message] nvarchar(max) NULL,
    [SpecialRequests] nvarchar(max) NULL,
    [RequestIp] nvarchar(50) NULL,
    [UserAgent] nvarchar(max) NULL,
    [Language] nvarchar(10) NULL,
    [EmailLogId] int NULL,
    [Status] nvarchar(50) NOT NULL,
    [AdminNotes] nvarchar(max) NULL,
    [UpdatedAt] datetime2 NULL,
    CONSTRAINT [PK_wixi_EmployerFormSubmissions] PRIMARY KEY ([Id])
);

CREATE INDEX [IX_wixi_ContactFormSubmissions_CreatedAt] ON [wixi_ContactFormSubmissions] ([CreatedAt]);

CREATE INDEX [IX_wixi_ContactFormSubmissions_Email] ON [wixi_ContactFormSubmissions] ([Email]);

CREATE INDEX [IX_wixi_ContactFormSubmissions_Status] ON [wixi_ContactFormSubmissions] ([Status]);

CREATE INDEX [IX_wixi_EmployeeFormSubmissions_CreatedAt] ON [wixi_EmployeeFormSubmissions] ([CreatedAt]);

CREATE INDEX [IX_wixi_EmployeeFormSubmissions_Email] ON [wixi_EmployeeFormSubmissions] ([Email]);

CREATE INDEX [IX_wixi_EmployeeFormSubmissions_Status] ON [wixi_EmployeeFormSubmissions] ([Status]);

CREATE INDEX [IX_wixi_EmployerFormSubmissions_CreatedAt] ON [wixi_EmployerFormSubmissions] ([CreatedAt]);

CREATE INDEX [IX_wixi_EmployerFormSubmissions_Email] ON [wixi_EmployerFormSubmissions] ([Email]);

CREATE INDEX [IX_wixi_EmployerFormSubmissions_Status] ON [wixi_EmployerFormSubmissions] ([Status]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251108145950_AddFormsModule', N'9.0.10');

CREATE TABLE [wixi_ContentSettings] (
    [Id] int NOT NULL IDENTITY,
    [FooterCompanyDescDe] nvarchar(max) NOT NULL,
    [FooterCompanyDescTr] nvarchar(max) NOT NULL,
    [FooterCompanyDescEn] nvarchar(max) NULL,
    [FooterCompanyDescAr] nvarchar(max) NULL,
    [FacebookUrl] nvarchar(max) NULL,
    [InstagramUrl] nvarchar(max) NULL,
    [TwitterUrl] nvarchar(max) NULL,
    [LinkedInUrl] nvarchar(max) NULL,
    [AboutMissionText1De] nvarchar(max) NOT NULL,
    [AboutMissionText1Tr] nvarchar(max) NOT NULL,
    [AboutMissionText1En] nvarchar(max) NULL,
    [AboutMissionText1Ar] nvarchar(max) NULL,
    [AboutMissionText2De] nvarchar(max) NOT NULL,
    [AboutMissionText2Tr] nvarchar(max) NOT NULL,
    [AboutMissionText2En] nvarchar(max) NULL,
    [AboutMissionText2Ar] nvarchar(max) NULL,
    [ContactPhone] nvarchar(50) NOT NULL,
    [ContactEmail] nvarchar(256) NOT NULL,
    [AddressGermany] nvarchar(max) NOT NULL,
    [AddressTurkeyMersin] nvarchar(max) NOT NULL,
    [AddressTurkeyIstanbul] nvarchar(max) NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    [UpdatedBy] nvarchar(max) NULL,
    [RowVersion] rowversion NULL,
    CONSTRAINT [PK_wixi_ContentSettings] PRIMARY KEY ([Id])
);

CREATE TABLE [wixi_NewsItems] (
    [Id] int NOT NULL IDENTITY,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [TitleDe] nvarchar(500) NOT NULL,
    [TitleTr] nvarchar(500) NOT NULL,
    [TitleEn] nvarchar(max) NULL,
    [TitleAr] nvarchar(max) NULL,
    [ExcerptDe] nvarchar(max) NOT NULL,
    [ExcerptTr] nvarchar(max) NOT NULL,
    [ExcerptEn] nvarchar(max) NULL,
    [ExcerptAr] nvarchar(max) NULL,
    [ContentDe] nvarchar(max) NULL,
    [ContentTr] nvarchar(max) NULL,
    [ContentEn] nvarchar(max) NULL,
    [ContentAr] nvarchar(max) NULL,
    [ImageUrl] nvarchar(1000) NOT NULL,
    [Category] nvarchar(100) NOT NULL,
    [Featured] bit NOT NULL,
    [PublishedAt] datetime2 NULL,
    [Slug] nvarchar(500) NULL,
    [DisplayOrder] int NOT NULL,
    [IsActive] bit NOT NULL,
    CONSTRAINT [PK_wixi_NewsItems] PRIMARY KEY ([Id])
);

CREATE TABLE [wixi_SystemSettings] (
    [Id] int NOT NULL IDENTITY,
    [SiteName] nvarchar(200) NOT NULL,
    [SiteUrl] nvarchar(500) NOT NULL,
    [AdminEmail] nvarchar(256) NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    [UpdatedBy] nvarchar(max) NULL,
    [RowVersion] rowversion NULL,
    CONSTRAINT [PK_wixi_SystemSettings] PRIMARY KEY ([Id])
);

CREATE TABLE [wixi_TeamMembers] (
    [Id] int NOT NULL IDENTITY,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [Name] nvarchar(200) NOT NULL,
    [Slug] nvarchar(200) NOT NULL,
    [ImageUrl] nvarchar(1000) NOT NULL,
    [Email] nvarchar(256) NOT NULL,
    [Phone] nvarchar(50) NULL,
    [Experience] nvarchar(50) NOT NULL,
    [PositionDe] nvarchar(200) NOT NULL,
    [PositionTr] nvarchar(200) NOT NULL,
    [PositionEn] nvarchar(max) NULL,
    [LocationDe] nvarchar(200) NOT NULL,
    [LocationTr] nvarchar(200) NOT NULL,
    [LocationEn] nvarchar(max) NULL,
    [EducationDe] nvarchar(max) NOT NULL,
    [EducationTr] nvarchar(max) NOT NULL,
    [EducationEn] nvarchar(max) NULL,
    [BioDe] nvarchar(max) NOT NULL,
    [BioTr] nvarchar(max) NOT NULL,
    [BioEn] nvarchar(max) NULL,
    [PhilosophyDe] nvarchar(max) NULL,
    [PhilosophyTr] nvarchar(max) NULL,
    [PhilosophyEn] nvarchar(max) NULL,
    [SpecializationsDe] nvarchar(max) NULL,
    [SpecializationsTr] nvarchar(max) NULL,
    [SpecializationsEn] nvarchar(max) NULL,
    [LanguagesDe] nvarchar(max) NULL,
    [LanguagesTr] nvarchar(max) NULL,
    [LanguagesEn] nvarchar(max) NULL,
    [AchievementsDe] nvarchar(max) NULL,
    [AchievementsTr] nvarchar(max) NULL,
    [AchievementsEn] nvarchar(max) NULL,
    [DisplayOrder] int NOT NULL,
    [IsActive] bit NOT NULL,
    CONSTRAINT [PK_wixi_TeamMembers] PRIMARY KEY ([Id])
);

CREATE TABLE [wixi_Translations] (
    [Id] int NOT NULL IDENTITY,
    [Key] nvarchar(200) NOT NULL,
    [De] nvarchar(max) NULL,
    [Tr] nvarchar(max) NULL,
    [En] nvarchar(max) NULL,
    [Ar] nvarchar(max) NULL,
    [UpdatedAt] datetime2 NOT NULL,
    [UpdatedBy] nvarchar(max) NULL,
    [RowVersion] rowversion NULL,
    CONSTRAINT [PK_wixi_Translations] PRIMARY KEY ([Id])
);

CREATE TABLE [wixi_UserPreferences] (
    [Id] int NOT NULL IDENTITY,
    [UserId] int NOT NULL,
    [Language] nvarchar(10) NOT NULL,
    [Theme] nvarchar(20) NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_wixi_UserPreferences] PRIMARY KEY ([Id])
);

CREATE INDEX [IX_wixi_NewsItems_Category] ON [wixi_NewsItems] ([Category]);

CREATE INDEX [IX_wixi_NewsItems_Featured] ON [wixi_NewsItems] ([Featured]);

CREATE INDEX [IX_wixi_NewsItems_IsActive] ON [wixi_NewsItems] ([IsActive]);

CREATE INDEX [IX_wixi_NewsItems_PublishedAt] ON [wixi_NewsItems] ([PublishedAt]);

CREATE UNIQUE INDEX [IX_wixi_NewsItems_Slug] ON [wixi_NewsItems] ([Slug]) WHERE [Slug] IS NOT NULL;

CREATE INDEX [IX_wixi_TeamMembers_DisplayOrder] ON [wixi_TeamMembers] ([DisplayOrder]);

CREATE INDEX [IX_wixi_TeamMembers_IsActive] ON [wixi_TeamMembers] ([IsActive]);

CREATE UNIQUE INDEX [IX_wixi_TeamMembers_Slug] ON [wixi_TeamMembers] ([Slug]);

CREATE UNIQUE INDEX [IX_wixi_Translations_Key] ON [wixi_Translations] ([Key]);

CREATE UNIQUE INDEX [IX_wixi_UserPreferences_UserId] ON [wixi_UserPreferences] ([UserId]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251108150221_AddContentModule', N'9.0.10');

DECLARE @var7 sysname;
SELECT @var7 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[wixi_Users]') AND [c].[name] = N'ConcurrencyStamp');
IF @var7 IS NOT NULL EXEC(N'ALTER TABLE [wixi_Users] DROP CONSTRAINT [' + @var7 + '];');
ALTER TABLE [wixi_Users] ALTER COLUMN [ConcurrencyStamp] nvarchar(256) NULL;

ALTER TABLE [wixi_Roles] ADD [ConcurrencyStamp] nvarchar(256) NULL;

ALTER TABLE [wixi_Roles] ADD [NormalizedName] nvarchar(256) NULL;

UPDATE [wixi_Roles] SET [ConcurrencyStamp] = NULL, [NormalizedName] = N'ADMIN'
WHERE [Id] = 1;
SELECT @@ROWCOUNT;


UPDATE [wixi_Roles] SET [ConcurrencyStamp] = NULL, [NormalizedName] = N'CLIENT'
WHERE [Id] = 2;
SELECT @@ROWCOUNT;


UPDATE [wixi_Roles] SET [ConcurrencyStamp] = NULL, [NormalizedName] = N'EMPLOYEE'
WHERE [Id] = 3;
SELECT @@ROWCOUNT;


CREATE UNIQUE INDEX [IX_wixi_Roles_NormalizedName] ON [wixi_Roles] ([NormalizedName]) WHERE [NormalizedName] IS NOT NULL;

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251108174020_FixIdentityColumns', N'9.0.10');

ALTER TABLE [wixi_EmailTemplates] ADD [DisplayName_AR] nvarchar(200) NOT NULL DEFAULT N'';

ALTER TABLE [wixi_EmailTemplates] ADD [DisplayName_DE] nvarchar(200) NOT NULL DEFAULT N'';

ALTER TABLE [wixi_EmailTemplates] ADD [DisplayName_EN] nvarchar(200) NOT NULL DEFAULT N'';

ALTER TABLE [wixi_EmailTemplates] ADD [DisplayName_TR] nvarchar(200) NOT NULL DEFAULT N'';


                UPDATE wixi_EmailTemplates 
                SET DisplayName_TR = CASE [Key]
                    WHEN 'ContactForm' THEN '📝 Kontakt Formuları'
                    WHEN 'EmployerForm' THEN '🏢 Arbeitgeber Formuları'
                    WHEN 'EmployeeForm' THEN '👤 Arbeitnehmer Formuları'
                    WHEN 'ClientCode' THEN '🎫 Müşteri Kodu'
                    WHEN 'WelcomeEmail' THEN '👋 Hoş Geldin Emaili'
                    WHEN 'DocumentApproved' THEN '✅ Belge Onaylandı'
                    WHEN 'DocumentRejected' THEN '❌ Belge Reddedildi'
                    WHEN 'ApplicationStatusChanged' THEN '📋 Başvuru Durumu Değişti'
                    WHEN 'PasswordReset' THEN '🔑 Şifre Sıfırlama'
                    WHEN 'EmailVerification' THEN '📧 Email Doğrulama'
                    ELSE [Key]
                END
                WHERE DisplayName_TR = '';

                UPDATE wixi_EmailTemplates 
                SET DisplayName_EN = CASE [Key]
                    WHEN 'ContactForm' THEN '📝 Contact Forms'
                    WHEN 'EmployerForm' THEN '🏢 Employer Forms'
                    WHEN 'EmployeeForm' THEN '👤 Employee Forms'
                    WHEN 'ClientCode' THEN '🎫 Client Code'
                    WHEN 'WelcomeEmail' THEN '👋 Welcome Email'
                    WHEN 'DocumentApproved' THEN '✅ Document Approved'
                    WHEN 'DocumentRejected' THEN '❌ Document Rejected'
                    WHEN 'ApplicationStatusChanged' THEN '📋 Application Status Changed'
                    WHEN 'PasswordReset' THEN '🔑 Password Reset'
                    WHEN 'EmailVerification' THEN '📧 Email Verification'
                    ELSE [Key]
                END
                WHERE DisplayName_EN = '';

                UPDATE wixi_EmailTemplates 
                SET DisplayName_DE = CASE [Key]
                    WHEN 'ContactForm' THEN '📝 Kontaktformulare'
                    WHEN 'EmployerForm' THEN '🏢 Arbeitgeberformulare'
                    WHEN 'EmployeeForm' THEN '👤 Arbeitnehmerformulare'
                    WHEN 'ClientCode' THEN '🎫 Kundencode'
                    WHEN 'WelcomeEmail' THEN '👋 Willkommens-E-Mail'
                    WHEN 'DocumentApproved' THEN '✅ Dokument genehmigt'
                    WHEN 'DocumentRejected' THEN '❌ Dokument abgelehnt'
                    WHEN 'ApplicationStatusChanged' THEN '📋 Bewerbungsstatus geändert'
                    WHEN 'PasswordReset' THEN '🔑 Passwort zurücksetzen'
                    WHEN 'EmailVerification' THEN '📧 E-Mail-Verifizierung'
                    ELSE [Key]
                END
                WHERE DisplayName_DE = '';

                UPDATE wixi_EmailTemplates 
                SET DisplayName_AR = CASE [Key]
                    WHEN 'ContactForm' THEN '📝 نماذج الاتصال'
                    WHEN 'EmployerForm' THEN '🏢 نماذج صاحب العمل'
                    WHEN 'EmployeeForm' THEN '👤 نماذج الموظف'
                    WHEN 'ClientCode' THEN '🎫 رمز العميل'
                    WHEN 'WelcomeEmail' THEN '👋 بريد الترحيب'
                    WHEN 'DocumentApproved' THEN '✅ تمت الموافقة على المستند'
                    WHEN 'DocumentRejected' THEN '❌ تم رفض المستند'
                    WHEN 'ApplicationStatusChanged' THEN '📋 تغيير حالة الطلب'
                    WHEN 'PasswordReset' THEN '🔑 إعادة تعيين كلمة المرور'
                    WHEN 'EmailVerification' THEN '📧 التحقق من البريد الإلكتروني'
                    ELSE [Key]
                END
                WHERE DisplayName_AR = '';
            

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251108192229_AddDisplayNameToEmailTemplates', N'9.0.10');

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'ApplicationTemplateId', N'CreatedAt', N'Description_AR', N'Description_DE', N'Description_EN', N'Description_TR', N'EstimatedDurationDays', N'IconName', N'IsActive', N'IsRequired', N'StepOrder', N'Title_AR', N'Title_DE', N'Title_EN', N'Title_TR', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[wixi_ApplicationStepTemplates]'))
    SET IDENTITY_INSERT [wixi_ApplicationStepTemplates] ON;
INSERT INTO [wixi_ApplicationStepTemplates] ([Id], [ApplicationTemplateId], [CreatedAt], [Description_AR], [Description_DE], [Description_EN], [Description_TR], [EstimatedDurationDays], [IconName], [IsActive], [IsRequired], [StepOrder], [Title_AR], [Title_DE], [Title_EN], [Title_TR], [UpdatedAt])
VALUES (4, 4, '2025-11-08T00:00:00.0000000Z', N'إجراءات الاعتراف بالدبلوم وعملية الموافقة', N'Diplomanerkennung und Genehmigungsverfahren', N'Diploma recognition procedures and approval process', N'Diploma denklik işlemleri ve onay süreci', 90, N'file-check', CAST(1 AS bit), CAST(1 AS bit), 1, N'إجراءات الاعتراف', N'Anerkennungsverfahren', N'Recognition Procedures', N'Denklik İşlemleri', NULL),
(5, 4, '2025-11-08T00:00:00.0000000Z', N'إجراءات البحث عن عمل وتصريح العمل', N'Jobsuche und Arbeitserlaubnisantrag', N'Job search and work permit application procedures', N'İş arama ve çalışma izni başvuru süreçleri', 120, N'briefcase', CAST(1 AS bit), CAST(1 AS bit), 2, N'إجراءات تصريح العمل', N'Arbeitserlaubnisverfahren', N'Work Permit Procedures', N'İş Bulma ve Çalışma İzni İşlemleri', NULL),
(6, 4, '2025-11-08T00:00:00.0000000Z', N'عملية طلب التأشيرة والموافقة', N'Visumantrags- und Genehmigungsverfahren', N'Visa application and approval process', N'Vize başvurusu ve onay süreci', 60, N'globe', CAST(1 AS bit), CAST(1 AS bit), 3, N'إجراءات التأشيرة', N'Visumverfahren', N'Visa Procedures', N'Vize İşlemleri', NULL);
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'ApplicationTemplateId', N'CreatedAt', N'Description_AR', N'Description_DE', N'Description_EN', N'Description_TR', N'EstimatedDurationDays', N'IconName', N'IsActive', N'IsRequired', N'StepOrder', N'Title_AR', N'Title_DE', N'Title_EN', N'Title_TR', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[wixi_ApplicationStepTemplates]'))
    SET IDENTITY_INSERT [wixi_ApplicationStepTemplates] OFF;

UPDATE [wixi_ApplicationTemplates] SET [IsDefault] = CAST(0 AS bit)
WHERE [Id] = 1;
SELECT @@ROWCOUNT;


UPDATE [wixi_ApplicationTemplates] SET [IsDefault] = CAST(1 AS bit)
WHERE [Id] = 4;
SELECT @@ROWCOUNT;


IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CreatedAt', N'Description_AR', N'Description_DE', N'Description_EN', N'Description_TR', N'EstimatedDurationDays', N'IsActive', N'IsRequired', N'Name_AR', N'Name_DE', N'Name_EN', N'Name_TR', N'StepTemplateId', N'SubStepOrder', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[wixi_ApplicationSubStepTemplates]'))
    SET IDENTITY_INSERT [wixi_ApplicationSubStepTemplates] ON;
INSERT INTO [wixi_ApplicationSubStepTemplates] ([Id], [CreatedAt], [Description_AR], [Description_DE], [Description_EN], [Description_TR], [EstimatedDurationDays], [IsActive], [IsRequired], [Name_AR], [Name_DE], [Name_EN], [Name_TR], [StepTemplateId], [SubStepOrder], [UpdatedAt])
VALUES (13, '2025-11-08T00:00:00.0000000Z', N'تم تحميل المستندات المطلوبة إلى النظام', N'Erforderliche Dokumente ins System hochgeladen', N'Required documents uploaded to system', N'Gerekli belgeler sisteme yüklendi', 3, CAST(1 AS bit), CAST(1 AS bit), N'تم تحميل المستندات', N'Dokumente hochgeladen', N'Documents Uploaded', N'Belgeler Yüklendi', 4, 1, NULL),
(14, '2025-11-08T00:00:00.0000000Z', N'تم تقديم طلب الاعتراف إلى السلطة المختصة', N'Anerkennungsantrag bei zuständiger Behörde eingereicht', N'Recognition application submitted to relevant authority', N'Denklik başvurusu ilgili kuruma yapıldı', 7, CAST(1 AS bit), CAST(1 AS bit), N'تم تقديم طلب الاعتراف', N'Anerkennungsantrag eingereicht', N'Recognition Application Submitted', N'Denklik Başvurusu Yapıldı', 4, 2, NULL),
(15, '2025-11-08T00:00:00.0000000Z', N'تم دفع رسوم معالجة الاعتراف', N'Anerkennungsbearbeitungsgebühr bezahlt', N'Recognition processing fee paid', N'Denklik işlem ücreti ödendi', 2, CAST(1 AS bit), CAST(1 AS bit), N'تم دفع رسوم الاعتراف', N'Anerkennungsgebühr bezahlt', N'Recognition Fee Paid', N'Denklik Harç Ödemesi Yapıldı', 4, 3, NULL),
(16, '2025-11-08T00:00:00.0000000Z', N'شهادة الاعتراف معتمدة وجاهزة', N'Anerkennungszertifikat genehmigt und fertig', N'Recognition certificate approved and ready', N'Denklik belgesi onaylandı ve hazır', 78, CAST(1 AS bit), CAST(1 AS bit), N'شهادة الاعتراف جاهزة', N'Anerkennungszertifikat fertig', N'Recognition Certificate Ready', N'Denklik Belgesi Hazır', 4, 4, NULL),
(17, '2025-11-08T00:00:00.0000000Z', N'البحث النشط عن عمل', N'Aktive Jobsuche', N'Actively searching for employment', N'Aktif olarak iş aranıyor', 60, CAST(1 AS bit), CAST(1 AS bit), N'في عملية البحث عن عمل', N'Im Jobsuchprozess', N'In Job Search Process', N'İş Arama Sürecinde', 5, 1, NULL),
(18, '2025-11-08T00:00:00.0000000Z', N'عرض عمل من صاحب العمل', N'Stellenangebot vom Arbeitgeber', N'Job offer made by employer', N'İşveren tarafından iş teklifi yapıldı', 7, CAST(1 AS bit), CAST(1 AS bit), N'تم استلام عرض العمل', N'Stellenangebot erhalten', N'Job Offer Received', N'İş Teklifi Alındı', 5, 2, NULL),
(19, '2025-11-08T00:00:00.0000000Z', N'تم تقديم طلب تصريح العمل الرسمي', N'Offizieller Arbeitserlaubnisantrag eingereicht', N'Official work permit application submitted', N'Çalışma izni için resmi başvuru yapıldı', 45, CAST(1 AS bit), CAST(1 AS bit), N'تم تقديم طلب تصريح العمل', N'Arbeitserlaubnisantrag eingereicht', N'Work Permit Application Submitted', N'Çalışma İzni Başvurusu Yapıldı', 5, 3, NULL),
(20, '2025-11-08T00:00:00.0000000Z', N'تم الموافقة رسميًا على تصريح العمل', N'Arbeitserlaubnis offiziell genehmigt', N'Work permit officially approved', N'Çalışma izni resmi olarak onaylandı', 8, CAST(1 AS bit), CAST(1 AS bit), N'تم الموافقة على تصريح العمل', N'Arbeitserlaubnis genehmigt', N'Work Permit Approved', N'Çalışma İzni Onaylandı', 5, 4, NULL),
(21, '2025-11-08T00:00:00.0000000Z', N'تم إعداد المستندات المطلوبة لطلب التأشيرة', N'Erforderliche Dokumente für Visumantrag vorbereitet', N'Required documents for visa application prepared', N'Vize başvurusu için gerekli belgeler hazırlandı', 5, CAST(1 AS bit), CAST(1 AS bit), N'تم إعداد مستندات طلب التأشيرة', N'Visumantragsunterlagen vorbereitet', N'Visa Application Documents Prepared', N'Vize Başvuru Belgeler Hazırlandı', 6, 1, NULL),
(22, '2025-11-08T00:00:00.0000000Z', N'تم تقديم طلب التأشيرة إلى القنصلية', N'Visumantrag beim Konsulat eingereicht', N'Visa application submitted to consulate', N'Vize başvurusu konsolosluğa yapıldı', 35, CAST(1 AS bit), CAST(1 AS bit), N'تم تقديم طلب التأشيرة', N'Visumantrag eingereicht', N'Visa Application Submitted', N'Vize Başvurusu Yapıldı', 6, 2, NULL),
(23, '2025-11-08T00:00:00.0000000Z', N'تم الموافقة على طلب التأشيرة وجاهزة', N'Visumantrag genehmigt und fertig', N'Visa application approved and ready', N'Vize başvurusu onaylandı ve hazır', 20, CAST(1 AS bit), CAST(1 AS bit), N'تم الموافقة على التأشيرة', N'Visum genehmigt', N'Visa Approved', N'Vize Onaylandı', 6, 3, NULL);
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CreatedAt', N'Description_AR', N'Description_DE', N'Description_EN', N'Description_TR', N'EstimatedDurationDays', N'IsActive', N'IsRequired', N'Name_AR', N'Name_DE', N'Name_EN', N'Name_TR', N'StepTemplateId', N'SubStepOrder', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[wixi_ApplicationSubStepTemplates]'))
    SET IDENTITY_INSERT [wixi_ApplicationSubStepTemplates] OFF;

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251108214849_UpdateTemplate4AsDefaultWithAllSteps', N'9.0.10');

CREATE TABLE [wixi_Appointments] (
    [Id] bigint NOT NULL IDENTITY,
    [Title] nvarchar(500) NOT NULL,
    [Description] nvarchar(max) NULL,
    [StartTime] datetime2 NOT NULL,
    [EndTime] datetime2 NOT NULL,
    [ClientName] nvarchar(200) NOT NULL,
    [ClientPhone] nvarchar(50) NULL,
    [ClientEmail] nvarchar(200) NULL,
    [ClientId] int NULL,
    [Status] int NOT NULL,
    [Color] nvarchar(20) NOT NULL DEFAULT N'#3B82F6',
    [CreatedById] int NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    CONSTRAINT [PK_wixi_Appointments] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_wixi_Appointments_wixi_Clients_ClientId] FOREIGN KEY ([ClientId]) REFERENCES [wixi_Clients] ([Id]) ON DELETE SET NULL,
    CONSTRAINT [FK_wixi_Appointments_wixi_Users_CreatedById] FOREIGN KEY ([CreatedById]) REFERENCES [wixi_Users] ([Id]) ON DELETE NO ACTION
);

CREATE TABLE [wixi_Holidays] (
    [Id] bigint NOT NULL IDENTITY,
    [Name] nvarchar(200) NOT NULL,
    [Date] datetime2 NOT NULL,
    [IsRecurring] bit NOT NULL,
    [CountryCode] nvarchar(10) NOT NULL DEFAULT N'TR',
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_wixi_Holidays] PRIMARY KEY ([Id])
);

CREATE INDEX [IX_wixi_Appointments_ClientId] ON [wixi_Appointments] ([ClientId]);

CREATE INDEX [IX_wixi_Appointments_CreatedById] ON [wixi_Appointments] ([CreatedById]);

CREATE INDEX [IX_wixi_Appointments_EndTime] ON [wixi_Appointments] ([EndTime]);

CREATE INDEX [IX_wixi_Appointments_StartTime] ON [wixi_Appointments] ([StartTime]);

CREATE INDEX [IX_wixi_Appointments_Status] ON [wixi_Appointments] ([Status]);

CREATE INDEX [IX_wixi_Holidays_CountryCode] ON [wixi_Holidays] ([CountryCode]);

CREATE INDEX [IX_wixi_Holidays_Date] ON [wixi_Holidays] ([Date]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251108233933_AddAppointmentsAndHolidays', N'9.0.10');

ALTER TABLE [wixi_TeamMembers] ADD [CanProvideConsultation] bit NOT NULL DEFAULT CAST(0 AS bit);

ALTER TABLE [wixi_TeamMembers] ADD [ConsultationCurrency] nvarchar(10) NULL;

ALTER TABLE [wixi_TeamMembers] ADD [ConsultationPrice] decimal(18,2) NULL;

CREATE INDEX [IX_wixi_TeamMembers_CanProvideConsultation] ON [wixi_TeamMembers] ([CanProvideConsultation]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251108235102_AddConsultationFieldsToTeamMember', N'9.0.10');

ALTER TABLE [wixi_Documents] ADD CONSTRAINT [FK_wixi_Documents_wixi_Clients_ClientId] FOREIGN KEY ([ClientId]) REFERENCES [wixi_Clients] ([Id]) ON DELETE NO ACTION;

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251109002553_AddClientNavigationToDocument', N'9.0.10');

CREATE TABLE [wixi_Payments] (
    [Id] bigint NOT NULL IDENTITY,
    [PaymentNumber] nvarchar(50) NOT NULL,
    [PaymentProvider] nvarchar(50) NOT NULL DEFAULT N'Iyzico',
    [ProviderPaymentId] nvarchar(100) NULL,
    [ConversationId] nvarchar(100) NULL,
    [CustomerName] nvarchar(100) NOT NULL,
    [CustomerEmail] nvarchar(100) NOT NULL,
    [CustomerPhone] nvarchar(20) NOT NULL,
    [CustomerIdentityNumber] nvarchar(20) NULL,
    [Amount] decimal(18,2) NOT NULL,
    [PaidAmount] decimal(18,2) NOT NULL,
    [Currency] nvarchar(3) NOT NULL DEFAULT N'EUR',
    [ExchangeRate] decimal(18,4) NULL,
    [Status] int NOT NULL,
    [Type] int NOT NULL,
    [Method] int NOT NULL,
    [Description] nvarchar(500) NULL,
    [Notes] nvarchar(1000) NULL,
    [AppointmentId] bigint NULL,
    [ApplicationId] int NULL,
    [RelatedEntityType] nvarchar(50) NULL,
    [RelatedEntityId] bigint NULL,
    [IyzicoPaymentId] nvarchar(100) NULL,
    [IyzicoConversationId] nvarchar(100) NULL,
    [IyzicoStatus] nvarchar(50) NULL,
    [IyzicoErrorCode] nvarchar(50) NULL,
    [IyzicoErrorMessage] nvarchar(500) NULL,
    [IyzicoRawResponse] nvarchar(max) NULL,
    [CardLastFourDigits] nvarchar(4) NULL,
    [CardHolderName] nvarchar(100) NULL,
    [CardBrand] nvarchar(50) NULL,
    [CardType] nvarchar(50) NULL,
    [InstallmentCount] int NULL,
    [IsInstallment] bit NOT NULL,
    [InstallmentNumber] int NULL,
    [InstallmentAmount] decimal(18,2) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [PaidAt] datetime2 NULL,
    [CancelledAt] datetime2 NULL,
    [RefundedAt] datetime2 NULL,
    [ExpiresAt] datetime2 NULL,
    CONSTRAINT [PK_wixi_Payments] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_wixi_Payments_wixi_Appointments_AppointmentId] FOREIGN KEY ([AppointmentId]) REFERENCES [wixi_Appointments] ([Id]) ON DELETE SET NULL
);

CREATE TABLE [wixi_PaymentItems] (
    [Id] bigint NOT NULL IDENTITY,
    [PaymentId] bigint NOT NULL,
    [Name] nvarchar(200) NOT NULL,
    [Description] nvarchar(500) NULL,
    [Quantity] int NOT NULL,
    [UnitPrice] decimal(18,2) NOT NULL,
    [TotalPrice] decimal(18,2) NOT NULL,
    [RelatedEntityType] nvarchar(50) NULL,
    [RelatedEntityId] bigint NULL,
    CONSTRAINT [PK_wixi_PaymentItems] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_wixi_PaymentItems_wixi_Payments_PaymentId] FOREIGN KEY ([PaymentId]) REFERENCES [wixi_Payments] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [wixi_PaymentRefunds] (
    [Id] bigint NOT NULL IDENTITY,
    [PaymentId] bigint NOT NULL,
    [RefundNumber] nvarchar(50) NOT NULL,
    [Amount] decimal(18,2) NOT NULL,
    [Currency] nvarchar(3) NOT NULL DEFAULT N'EUR',
    [Reason] nvarchar(500) NULL,
    [Status] int NOT NULL,
    [IyzicoRefundId] nvarchar(100) NULL,
    [IyzicoResponse] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CompletedAt] datetime2 NULL,
    [RefundedByUserId] int NULL,
    CONSTRAINT [PK_wixi_PaymentRefunds] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_wixi_PaymentRefunds_wixi_Payments_PaymentId] FOREIGN KEY ([PaymentId]) REFERENCES [wixi_Payments] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [wixi_PaymentTransactions] (
    [Id] bigint NOT NULL IDENTITY,
    [PaymentId] bigint NOT NULL,
    [TransactionId] nvarchar(100) NOT NULL,
    [Type] int NOT NULL,
    [Status] int NOT NULL,
    [Amount] decimal(18,2) NOT NULL,
    [Currency] nvarchar(3) NOT NULL DEFAULT N'EUR',
    [IyzicoResponse] nvarchar(max) NULL,
    [ErrorCode] nvarchar(50) NULL,
    [ErrorMessage] nvarchar(500) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CompletedAt] datetime2 NULL,
    CONSTRAINT [PK_wixi_PaymentTransactions] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_wixi_PaymentTransactions_wixi_Payments_PaymentId] FOREIGN KEY ([PaymentId]) REFERENCES [wixi_Payments] ([Id]) ON DELETE CASCADE
);

CREATE INDEX [IX_wixi_PaymentItems_PaymentId] ON [wixi_PaymentItems] ([PaymentId]);

CREATE INDEX [IX_wixi_PaymentRefunds_PaymentId] ON [wixi_PaymentRefunds] ([PaymentId]);

CREATE UNIQUE INDEX [IX_wixi_PaymentRefunds_RefundNumber] ON [wixi_PaymentRefunds] ([RefundNumber]);

CREATE INDEX [IX_wixi_Payments_AppointmentId] ON [wixi_Payments] ([AppointmentId]);

CREATE INDEX [IX_wixi_Payments_CreatedAt] ON [wixi_Payments] ([CreatedAt]);

CREATE INDEX [IX_wixi_Payments_IyzicoPaymentId] ON [wixi_Payments] ([IyzicoPaymentId]);

CREATE UNIQUE INDEX [IX_wixi_Payments_PaymentNumber] ON [wixi_Payments] ([PaymentNumber]);

CREATE INDEX [IX_wixi_Payments_Status] ON [wixi_Payments] ([Status]);

CREATE INDEX [IX_wixi_PaymentTransactions_PaymentId] ON [wixi_PaymentTransactions] ([PaymentId]);

CREATE INDEX [IX_wixi_PaymentTransactions_TransactionId] ON [wixi_PaymentTransactions] ([TransactionId]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251114223426_AddPaymentsModule', N'9.0.10');

ALTER TABLE [wixi_Payments] ADD [CVBuilderSessionId] uniqueidentifier NULL;

CREATE TABLE [wixi_CVData] (
    [Id] int NOT NULL IDENTITY,
    [PaymentId] bigint NOT NULL,
    [ClientId] int NOT NULL,
    [DocumentId] bigint NULL,
    [SessionId] uniqueidentifier NOT NULL,
    [PersonalInfo] nvarchar(max) NOT NULL,
    [Experience] nvarchar(max) NOT NULL,
    [Education] nvarchar(max) NOT NULL,
    [Skills] nvarchar(max) NOT NULL,
    [Languages] nvarchar(max) NOT NULL,
    [Certificates] nvarchar(max) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_wixi_CVData] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_wixi_CVData_wixi_Clients_ClientId] FOREIGN KEY ([ClientId]) REFERENCES [wixi_Clients] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_wixi_CVData_wixi_Documents_DocumentId] FOREIGN KEY ([DocumentId]) REFERENCES [wixi_Documents] ([Id]) ON DELETE SET NULL,
    CONSTRAINT [FK_wixi_CVData_wixi_Payments_PaymentId] FOREIGN KEY ([PaymentId]) REFERENCES [wixi_Payments] ([Id]) ON DELETE NO ACTION
);

CREATE TABLE [wixi_DocumentAnalyses] (
    [Id] int NOT NULL IDENTITY,
    [DocumentId] bigint NOT NULL,
    [IsCV] bit NOT NULL,
    [ATSScore] int NULL,
    [Recommendations] nvarchar(4000) NULL,
    [AnalyzedAt] datetime2 NOT NULL,
    [AnalysisMethod] nvarchar(50) NULL,
    CONSTRAINT [PK_wixi_DocumentAnalyses] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_wixi_DocumentAnalyses_wixi_Documents_DocumentId] FOREIGN KEY ([DocumentId]) REFERENCES [wixi_Documents] ([Id]) ON DELETE CASCADE
);

CREATE INDEX [IX_wixi_CVData_ClientId] ON [wixi_CVData] ([ClientId]);

CREATE INDEX [IX_wixi_CVData_DocumentId] ON [wixi_CVData] ([DocumentId]);

CREATE INDEX [IX_wixi_CVData_PaymentId] ON [wixi_CVData] ([PaymentId]);

CREATE UNIQUE INDEX [IX_wixi_CVData_SessionId] ON [wixi_CVData] ([SessionId]);

CREATE UNIQUE INDEX [IX_wixi_DocumentAnalyses_DocumentId] ON [wixi_DocumentAnalyses] ([DocumentId]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251118203619_AddCVBuilderAndDocumentAnalysis', N'9.0.10');

CREATE TABLE [wixi_MenuPermissions] (
    [Id] int NOT NULL IDENTITY,
    [UserId] int NOT NULL,
    [MenuPath] nvarchar(500) NOT NULL,
    [MenuText] nvarchar(200) NOT NULL,
    [MenuCategory] nvarchar(200) NULL,
    [MenuIcon] nvarchar(100) NULL,
    [IsVisible] bit NOT NULL,
    [DisplayOrder] int NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    CONSTRAINT [PK_wixi_MenuPermissions] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_wixi_MenuPermissions_wixi_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [wixi_Users] ([Id]) ON DELETE CASCADE
);

CREATE INDEX [IX_wixi_MenuPermissions_MenuPath] ON [wixi_MenuPermissions] ([MenuPath]);

CREATE UNIQUE INDEX [IX_wixi_MenuPermissions_MenuPath_UserId] ON [wixi_MenuPermissions] ([MenuPath], [UserId]);

CREATE INDEX [IX_wixi_MenuPermissions_UserId] ON [wixi_MenuPermissions] ([UserId]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251119205240_AddMenuPermissions', N'9.0.10');

CREATE TABLE [wixi_ClientNotes] (
    [Id] int NOT NULL IDENTITY,
    [ClientId] int NOT NULL,
    [CreatedByUserId] int NOT NULL,
    [Content] nvarchar(max) NOT NULL,
    [IsPinned] bit NOT NULL DEFAULT CAST(0 AS bit),
    [IsVisibleToClient] bit NOT NULL DEFAULT CAST(0 AS bit),
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    CONSTRAINT [PK_wixi_ClientNotes] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_wixi_ClientNotes_wixi_Clients_ClientId] FOREIGN KEY ([ClientId]) REFERENCES [wixi_Clients] ([Id]) ON DELETE CASCADE
);

CREATE INDEX [IX_wixi_ClientNotes_ClientId] ON [wixi_ClientNotes] ([ClientId]);

CREATE INDEX [IX_wixi_ClientNotes_CreatedAt] ON [wixi_ClientNotes] ([CreatedAt]);

CREATE INDEX [IX_wixi_ClientNotes_CreatedByUserId] ON [wixi_ClientNotes] ([CreatedByUserId]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251119222720_AddClientNotesTable', N'9.0.10');

CREATE TABLE [wixi_UserTablePreferences] (
    [Id] int NOT NULL IDENTITY,
    [UserId] int NOT NULL,
    [TableKey] nvarchar(200) NOT NULL,
    [VisibleColumns] nvarchar(max) NOT NULL DEFAULT N'[]',
    [ColumnOrder] nvarchar(max) NOT NULL DEFAULT N'[]',
    [ColumnFilters] nvarchar(max) NOT NULL DEFAULT N'{}',
    [SortConfig] nvarchar(max) NOT NULL DEFAULT N'{}',
    [PageSize] int NOT NULL DEFAULT 20,
    [UpdatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_wixi_UserTablePreferences] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_wixi_UserTablePreferences_wixi_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [wixi_Users] ([Id]) ON DELETE CASCADE
);

CREATE UNIQUE INDEX [IX_wixi_UserTablePreferences_UserId_TableKey] ON [wixi_UserTablePreferences] ([UserId], [TableKey]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251120203547_AddUserTablePreferences', N'9.0.10');

ALTER TABLE [wixi_SystemSettings] ADD [PortalUrl] nvarchar(max) NOT NULL DEFAULT N'';

ALTER TABLE [wixi_SystemSettings] ADD [SupportEmail] nvarchar(max) NOT NULL DEFAULT N'';

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251122132807_AddEmailSettingsToSystemSettings', N'9.0.10');

CREATE TABLE [wixi_LicenseSettings] (
    [Id] int NOT NULL IDENTITY,
    [LicenseKey] nvarchar(100) NOT NULL,
    [IsValid] bit NOT NULL,
    [ExpireDate] datetime2 NULL,
    [TenantId] int NULL,
    [TenantCompanyName] nvarchar(200) NULL,
    [MachineCode] nvarchar(100) NULL,
    [ClientVersion] nvarchar(50) NULL,
    [LastValidatedAt] datetime2 NULL,
    [ValidationResult] nvarchar(max) NULL,
    [IsActive] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    [CreatedBy] nvarchar(max) NULL,
    [UpdatedBy] nvarchar(max) NULL,
    [RowVersion] rowversion NULL,
    CONSTRAINT [PK_wixi_LicenseSettings] PRIMARY KEY ([Id])
);

CREATE INDEX [IX_wixi_LicenseSettings_IsActive] ON [wixi_LicenseSettings] ([IsActive]);

CREATE INDEX [IX_wixi_LicenseSettings_IsValid] ON [wixi_LicenseSettings] ([IsValid]);

CREATE UNIQUE INDEX [IX_wixi_LicenseSettings_LicenseKey] ON [wixi_LicenseSettings] ([LicenseKey]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251126202728_AddLicenseSettings', N'9.0.10');

CREATE TABLE [wixi_Tekstil_About] (
    [Id] int NOT NULL IDENTITY,
    [Title] nvarchar(200) NOT NULL,
    [Description] nvarchar(max) NOT NULL,
    [MissionTitle] nvarchar(200) NOT NULL,
    [MissionDescription] nvarchar(max) NOT NULL,
    [VisionTitle] nvarchar(200) NOT NULL,
    [VisionDescription] nvarchar(max) NOT NULL,
    [IsActive] bit NOT NULL,
    [DisplayOrder] int NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    [CreatedBy] int NOT NULL,
    [UpdatedBy] int NOT NULL,
    CONSTRAINT [PK_wixi_Tekstil_About] PRIMARY KEY ([Id])
);

CREATE TABLE [wixi_Tekstil_ContactInfo] (
    [Id] int NOT NULL IDENTITY,
    [CompanyName] nvarchar(200) NOT NULL,
    [Address] nvarchar(500) NOT NULL,
    [WorkingHoursWeekday] nvarchar(100) NULL,
    [WorkingHoursSaturday] nvarchar(100) NULL,
    [WorkingHoursSunday] nvarchar(100) NULL,
    [Phone1] nvarchar(50) NOT NULL,
    [Phone2] nvarchar(50) NULL,
    [Email1] nvarchar(100) NOT NULL,
    [Email2] nvarchar(100) NULL,
    [City] nvarchar(100) NULL,
    [District] nvarchar(100) NULL,
    [PostalCode] nvarchar(20) NULL,
    [MapLatitude] decimal(10,8) NULL,
    [MapLongitude] decimal(11,8) NULL,
    [MapZoomLevel] int NOT NULL,
    [WhatsAppNumber] nvarchar(50) NULL,
    [WhatsAppDefaultMessage] nvarchar(500) NULL,
    [SocialMediaLinks] nvarchar(max) NULL,
    [IsActive] bit NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    [UpdatedBy] int NOT NULL,
    CONSTRAINT [PK_wixi_Tekstil_ContactInfo] PRIMARY KEY ([Id])
);

CREATE TABLE [wixi_Tekstil_ContactSubmissions] (
    [Id] int NOT NULL IDENTITY,
    [FullName] nvarchar(200) NOT NULL,
    [Email] nvarchar(100) NOT NULL,
    [Phone] nvarchar(50) NULL,
    [Subject] nvarchar(200) NULL,
    [Message] nvarchar(max) NOT NULL,
    [Status] nvarchar(50) NOT NULL,
    [Priority] nvarchar(50) NOT NULL,
    [AssignedTo] int NULL,
    [AssignedAt] datetime2 NULL,
    [ResponseMessage] nvarchar(max) NULL,
    [ResponseDate] datetime2 NULL,
    [ResponseBy] int NULL,
    [FollowUpDate] datetime2 NULL,
    [Tags] nvarchar(500) NULL,
    [Source] nvarchar(100) NOT NULL,
    [LanguageCode] nvarchar(10) NOT NULL,
    [IpAddress] nvarchar(50) NULL,
    [UserAgent] nvarchar(500) NULL,
    [ReferrerUrl] nvarchar(500) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_wixi_Tekstil_ContactSubmissions] PRIMARY KEY ([Id])
);

CREATE TABLE [wixi_Tekstil_Languages] (
    [Id] int NOT NULL IDENTITY,
    [Code] nvarchar(10) NOT NULL,
    [Name] nvarchar(100) NOT NULL,
    [NativeName] nvarchar(100) NOT NULL,
    [FlagIcon] nvarchar(100) NULL,
    [IsDefault] bit NOT NULL,
    [IsActive] bit NOT NULL,
    [DisplayOrder] int NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_wixi_Tekstil_Languages] PRIMARY KEY ([Id]),
    CONSTRAINT [AK_wixi_Tekstil_Languages_Code] UNIQUE ([Code])
);

CREATE TABLE [wixi_Tekstil_ProductCategories] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(100) NOT NULL,
    [Description] nvarchar(500) NULL,
    [Slug] nvarchar(100) NOT NULL,
    [IconName] nvarchar(50) NULL,
    [ImageUrl] nvarchar(500) NULL,
    [ParentCategoryId] int NULL,
    [DisplayOrder] int NOT NULL,
    [IsActive] bit NOT NULL,
    [MetaTitle] nvarchar(200) NULL,
    [MetaDescription] nvarchar(500) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    [CreatedBy] int NOT NULL,
    [UpdatedBy] int NOT NULL,
    CONSTRAINT [PK_wixi_Tekstil_ProductCategories] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_wixi_Tekstil_ProductCategories_wixi_Tekstil_ProductCategories_ParentCategoryId] FOREIGN KEY ([ParentCategoryId]) REFERENCES [wixi_Tekstil_ProductCategories] ([Id])
);

CREATE TABLE [wixi_Tekstil_ProjectCategories] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(100) NOT NULL,
    [Description] nvarchar(500) NULL,
    [Slug] nvarchar(100) NOT NULL,
    [Color] nvarchar(50) NULL,
    [IconName] nvarchar(50) NULL,
    [DisplayOrder] int NOT NULL,
    [IsActive] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_wixi_Tekstil_ProjectCategories] PRIMARY KEY ([Id])
);

CREATE TABLE [wixi_Tekstil_Stats] (
    [Id] int NOT NULL IDENTITY,
    [Label] nvarchar(100) NOT NULL,
    [Value] nvarchar(50) NOT NULL,
    [IconName] nvarchar(50) NOT NULL,
    [DisplayOrder] int NOT NULL,
    [IsActive] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_wixi_Tekstil_Stats] PRIMARY KEY ([Id])
);

CREATE TABLE [wixi_Tekstil_About_Translations] (
    [Id] int NOT NULL IDENTITY,
    [AboutId] int NOT NULL,
    [LanguageCode] nvarchar(10) NOT NULL,
    [Title] nvarchar(200) NULL,
    [Description] nvarchar(max) NULL,
    [MissionTitle] nvarchar(200) NULL,
    [MissionDescription] nvarchar(max) NULL,
    [VisionTitle] nvarchar(200) NULL,
    [VisionDescription] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_wixi_Tekstil_About_Translations] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_wixi_Tekstil_About_Translations_wixi_Tekstil_About_AboutId] FOREIGN KEY ([AboutId]) REFERENCES [wixi_Tekstil_About] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_wixi_Tekstil_About_Translations_wixi_Tekstil_Languages_LanguageCode] FOREIGN KEY ([LanguageCode]) REFERENCES [wixi_Tekstil_Languages] ([Code]) ON DELETE NO ACTION
);

CREATE TABLE [wixi_Tekstil_ContactInfo_Translations] (
    [Id] int NOT NULL IDENTITY,
    [ContactInfoId] int NOT NULL,
    [LanguageCode] nvarchar(10) NOT NULL,
    [CompanyName] nvarchar(200) NULL,
    [Address] nvarchar(500) NULL,
    [WorkingHoursWeekday] nvarchar(100) NULL,
    [WorkingHoursSaturday] nvarchar(100) NULL,
    [WorkingHoursSunday] nvarchar(100) NULL,
    [WhatsAppDefaultMessage] nvarchar(500) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_wixi_Tekstil_ContactInfo_Translations] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_wixi_Tekstil_ContactInfo_Translations_wixi_Tekstil_ContactInfo_ContactInfoId] FOREIGN KEY ([ContactInfoId]) REFERENCES [wixi_Tekstil_ContactInfo] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_wixi_Tekstil_ContactInfo_Translations_wixi_Tekstil_Languages_LanguageCode] FOREIGN KEY ([LanguageCode]) REFERENCES [wixi_Tekstil_Languages] ([Code]) ON DELETE NO ACTION
);

CREATE TABLE [wixi_Tekstil_ProductCategories_Translations] (
    [Id] int NOT NULL IDENTITY,
    [CategoryId] int NOT NULL,
    [LanguageCode] nvarchar(10) NOT NULL,
    [Name] nvarchar(100) NOT NULL,
    [Description] nvarchar(500) NULL,
    [MetaTitle] nvarchar(200) NULL,
    [MetaDescription] nvarchar(500) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_wixi_Tekstil_ProductCategories_Translations] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_wixi_Tekstil_ProductCategories_Translations_wixi_Tekstil_Languages_LanguageCode] FOREIGN KEY ([LanguageCode]) REFERENCES [wixi_Tekstil_Languages] ([Code]) ON DELETE NO ACTION,
    CONSTRAINT [FK_wixi_Tekstil_ProductCategories_Translations_wixi_Tekstil_ProductCategories_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [wixi_Tekstil_ProductCategories] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [wixi_Tekstil_Products] (
    [Id] int NOT NULL IDENTITY,
    [CategoryId] int NOT NULL,
    [Title] nvarchar(200) NOT NULL,
    [Description] nvarchar(max) NULL,
    [ShortDescription] nvarchar(500) NULL,
    [Slug] nvarchar(200) NOT NULL,
    [SKU] nvarchar(100) NULL,
    [Price] decimal(18,2) NULL,
    [DiscountPrice] decimal(18,2) NULL,
    [Currency] nvarchar(10) NOT NULL,
    [MinOrderQuantity] int NOT NULL,
    [PrimaryImageUrl] nvarchar(500) NULL,
    [PrimaryImageAlt] nvarchar(200) NULL,
    [Features] nvarchar(max) NULL,
    [Specifications] nvarchar(max) NULL,
    [StockQuantity] int NOT NULL,
    [IsInStock] bit NOT NULL,
    [IsActive] bit NOT NULL,
    [IsFeatured] bit NOT NULL,
    [IsNew] bit NOT NULL,
    [DisplayOrder] int NOT NULL,
    [ViewCount] int NOT NULL,
    [MetaTitle] nvarchar(200) NULL,
    [MetaDescription] nvarchar(500) NULL,
    [MetaKeywords] nvarchar(500) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    [CreatedBy] int NOT NULL,
    [UpdatedBy] int NOT NULL,
    CONSTRAINT [PK_wixi_Tekstil_Products] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_wixi_Tekstil_Products_wixi_Tekstil_ProductCategories_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [wixi_Tekstil_ProductCategories] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [wixi_Tekstil_ProjectCategories_Translations] (
    [Id] int NOT NULL IDENTITY,
    [CategoryId] int NOT NULL,
    [LanguageCode] nvarchar(10) NOT NULL,
    [Name] nvarchar(100) NOT NULL,
    [Description] nvarchar(500) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_wixi_Tekstil_ProjectCategories_Translations] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_wixi_Tekstil_ProjectCategories_Translations_wixi_Tekstil_Languages_LanguageCode] FOREIGN KEY ([LanguageCode]) REFERENCES [wixi_Tekstil_Languages] ([Code]) ON DELETE NO ACTION,
    CONSTRAINT [FK_wixi_Tekstil_ProjectCategories_Translations_wixi_Tekstil_ProjectCategories_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [wixi_Tekstil_ProjectCategories] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [wixi_Tekstil_Projects] (
    [Id] int NOT NULL IDENTITY,
    [CategoryId] int NOT NULL,
    [Title] nvarchar(200) NOT NULL,
    [ClientName] nvarchar(200) NOT NULL,
    [Description] nvarchar(max) NULL,
    [Slug] nvarchar(200) NOT NULL,
    [PrimaryImageUrl] nvarchar(500) NULL,
    [PrimaryImageAlt] nvarchar(200) NULL,
    [Year] int NOT NULL,
    [Quantity] int NULL,
    [Duration] nvarchar(100) NULL,
    [Budget] decimal(18,2) NULL,
    [CompletionDate] datetime2 NULL,
    [IsActive] bit NOT NULL,
    [IsFeatured] bit NOT NULL,
    [DisplayOrder] int NOT NULL,
    [ViewCount] int NOT NULL,
    [MetaTitle] nvarchar(200) NULL,
    [MetaDescription] nvarchar(500) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    [CreatedBy] int NOT NULL,
    [UpdatedBy] int NOT NULL,
    CONSTRAINT [PK_wixi_Tekstil_Projects] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_wixi_Tekstil_Projects_wixi_Tekstil_ProjectCategories_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [wixi_Tekstil_ProjectCategories] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [wixi_Tekstil_Stats_Translations] (
    [Id] int NOT NULL IDENTITY,
    [StatId] int NOT NULL,
    [LanguageCode] nvarchar(10) NOT NULL,
    [Label] nvarchar(100) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_wixi_Tekstil_Stats_Translations] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_wixi_Tekstil_Stats_Translations_wixi_Tekstil_Languages_LanguageCode] FOREIGN KEY ([LanguageCode]) REFERENCES [wixi_Tekstil_Languages] ([Code]) ON DELETE NO ACTION,
    CONSTRAINT [FK_wixi_Tekstil_Stats_Translations_wixi_Tekstil_Stats_StatId] FOREIGN KEY ([StatId]) REFERENCES [wixi_Tekstil_Stats] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [wixi_Tekstil_ProductImages] (
    [Id] int NOT NULL IDENTITY,
    [ProductId] int NOT NULL,
    [ImageUrl] nvarchar(500) NOT NULL,
    [ImageAlt] nvarchar(200) NULL,
    [ImageTitle] nvarchar(200) NULL,
    [IsPrimary] bit NOT NULL,
    [DisplayOrder] int NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_wixi_Tekstil_ProductImages] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_wixi_Tekstil_ProductImages_wixi_Tekstil_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [wixi_Tekstil_Products] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [wixi_Tekstil_Products_Translations] (
    [Id] int NOT NULL IDENTITY,
    [ProductId] int NOT NULL,
    [LanguageCode] nvarchar(10) NOT NULL,
    [Title] nvarchar(200) NOT NULL,
    [Description] nvarchar(max) NULL,
    [ShortDescription] nvarchar(500) NULL,
    [Features] nvarchar(max) NULL,
    [Specifications] nvarchar(max) NULL,
    [MetaTitle] nvarchar(200) NULL,
    [MetaDescription] nvarchar(500) NULL,
    [MetaKeywords] nvarchar(500) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_wixi_Tekstil_Products_Translations] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_wixi_Tekstil_Products_Translations_wixi_Tekstil_Languages_LanguageCode] FOREIGN KEY ([LanguageCode]) REFERENCES [wixi_Tekstil_Languages] ([Code]) ON DELETE NO ACTION,
    CONSTRAINT [FK_wixi_Tekstil_Products_Translations_wixi_Tekstil_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [wixi_Tekstil_Products] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [wixi_Tekstil_ProjectImages] (
    [Id] int NOT NULL IDENTITY,
    [ProjectId] int NOT NULL,
    [ImageUrl] nvarchar(500) NOT NULL,
    [ImageAlt] nvarchar(200) NULL,
    [ImageTitle] nvarchar(200) NULL,
    [IsPrimary] bit NOT NULL,
    [DisplayOrder] int NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_wixi_Tekstil_ProjectImages] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_wixi_Tekstil_ProjectImages_wixi_Tekstil_Projects_ProjectId] FOREIGN KEY ([ProjectId]) REFERENCES [wixi_Tekstil_Projects] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [wixi_Tekstil_Projects_Translations] (
    [Id] int NOT NULL IDENTITY,
    [ProjectId] int NOT NULL,
    [LanguageCode] nvarchar(10) NOT NULL,
    [Title] nvarchar(200) NOT NULL,
    [ClientName] nvarchar(200) NULL,
    [Description] nvarchar(max) NULL,
    [MetaTitle] nvarchar(200) NULL,
    [MetaDescription] nvarchar(500) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_wixi_Tekstil_Projects_Translations] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_wixi_Tekstil_Projects_Translations_wixi_Tekstil_Languages_LanguageCode] FOREIGN KEY ([LanguageCode]) REFERENCES [wixi_Tekstil_Languages] ([Code]) ON DELETE NO ACTION,
    CONSTRAINT [FK_wixi_Tekstil_Projects_Translations_wixi_Tekstil_Projects_ProjectId] FOREIGN KEY ([ProjectId]) REFERENCES [wixi_Tekstil_Projects] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [wixi_Tekstil_ProjectTags] (
    [Id] int NOT NULL IDENTITY,
    [ProjectId] int NOT NULL,
    [TagName] nvarchar(100) NOT NULL,
    CONSTRAINT [PK_wixi_Tekstil_ProjectTags] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_wixi_Tekstil_ProjectTags_wixi_Tekstil_Projects_ProjectId] FOREIGN KEY ([ProjectId]) REFERENCES [wixi_Tekstil_Projects] ([Id]) ON DELETE CASCADE
);

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Code', N'CreatedAt', N'DisplayOrder', N'FlagIcon', N'IsActive', N'IsDefault', N'Name', N'NativeName', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[wixi_Tekstil_Languages]'))
    SET IDENTITY_INSERT [wixi_Tekstil_Languages] ON;
INSERT INTO [wixi_Tekstil_Languages] ([Id], [Code], [CreatedAt], [DisplayOrder], [FlagIcon], [IsActive], [IsDefault], [Name], [NativeName], [UpdatedAt])
VALUES (1, N'tr', '2026-01-04T12:00:00.0000000Z', 1, N'🇹🇷', CAST(1 AS bit), CAST(1 AS bit), N'Turkish', N'Türkçe', '2026-01-04T12:00:00.0000000Z'),
(2, N'en', '2026-01-04T12:00:00.0000000Z', 2, N'🇬🇧', CAST(1 AS bit), CAST(0 AS bit), N'English', N'English', '2026-01-04T12:00:00.0000000Z'),
(3, N'de', '2026-01-04T12:00:00.0000000Z', 3, N'🇩🇪', CAST(1 AS bit), CAST(0 AS bit), N'German', N'Deutsch', '2026-01-04T12:00:00.0000000Z');
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Code', N'CreatedAt', N'DisplayOrder', N'FlagIcon', N'IsActive', N'IsDefault', N'Name', N'NativeName', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[wixi_Tekstil_Languages]'))
    SET IDENTITY_INSERT [wixi_Tekstil_Languages] OFF;

CREATE UNIQUE INDEX [IX_wixi_Tekstil_About_Translations_AboutId_LanguageCode] ON [wixi_Tekstil_About_Translations] ([AboutId], [LanguageCode]);

CREATE INDEX [IX_wixi_Tekstil_About_Translations_LanguageCode] ON [wixi_Tekstil_About_Translations] ([LanguageCode]);

CREATE UNIQUE INDEX [IX_wixi_Tekstil_ContactInfo_Translations_ContactInfoId_LanguageCode] ON [wixi_Tekstil_ContactInfo_Translations] ([ContactInfoId], [LanguageCode]);

CREATE INDEX [IX_wixi_Tekstil_ContactInfo_Translations_LanguageCode] ON [wixi_Tekstil_ContactInfo_Translations] ([LanguageCode]);

CREATE INDEX [IX_wixi_Tekstil_ContactSubmissions_CreatedAt] ON [wixi_Tekstil_ContactSubmissions] ([CreatedAt]);

CREATE INDEX [IX_wixi_Tekstil_ContactSubmissions_Status] ON [wixi_Tekstil_ContactSubmissions] ([Status]);

CREATE UNIQUE INDEX [IX_wixi_Tekstil_Languages_Code] ON [wixi_Tekstil_Languages] ([Code]);

CREATE INDEX [IX_wixi_Tekstil_ProductCategories_ParentCategoryId] ON [wixi_Tekstil_ProductCategories] ([ParentCategoryId]);

CREATE UNIQUE INDEX [IX_wixi_Tekstil_ProductCategories_Translations_CategoryId_LanguageCode] ON [wixi_Tekstil_ProductCategories_Translations] ([CategoryId], [LanguageCode]);

CREATE INDEX [IX_wixi_Tekstil_ProductCategories_Translations_LanguageCode] ON [wixi_Tekstil_ProductCategories_Translations] ([LanguageCode]);

CREATE INDEX [IX_wixi_Tekstil_ProductImages_ProductId] ON [wixi_Tekstil_ProductImages] ([ProductId]);

CREATE INDEX [IX_wixi_Tekstil_Products_CategoryId] ON [wixi_Tekstil_Products] ([CategoryId]);

CREATE UNIQUE INDEX [IX_wixi_Tekstil_Products_Slug] ON [wixi_Tekstil_Products] ([Slug]);

CREATE INDEX [IX_wixi_Tekstil_Products_Translations_LanguageCode] ON [wixi_Tekstil_Products_Translations] ([LanguageCode]);

CREATE UNIQUE INDEX [IX_wixi_Tekstil_Products_Translations_ProductId_LanguageCode] ON [wixi_Tekstil_Products_Translations] ([ProductId], [LanguageCode]);

CREATE UNIQUE INDEX [IX_wixi_Tekstil_ProjectCategories_Translations_CategoryId_LanguageCode] ON [wixi_Tekstil_ProjectCategories_Translations] ([CategoryId], [LanguageCode]);

CREATE INDEX [IX_wixi_Tekstil_ProjectCategories_Translations_LanguageCode] ON [wixi_Tekstil_ProjectCategories_Translations] ([LanguageCode]);

CREATE INDEX [IX_wixi_Tekstil_ProjectImages_ProjectId] ON [wixi_Tekstil_ProjectImages] ([ProjectId]);

CREATE INDEX [IX_wixi_Tekstil_Projects_CategoryId] ON [wixi_Tekstil_Projects] ([CategoryId]);

CREATE UNIQUE INDEX [IX_wixi_Tekstil_Projects_Slug] ON [wixi_Tekstil_Projects] ([Slug]);

CREATE INDEX [IX_wixi_Tekstil_Projects_Translations_LanguageCode] ON [wixi_Tekstil_Projects_Translations] ([LanguageCode]);

CREATE UNIQUE INDEX [IX_wixi_Tekstil_Projects_Translations_ProjectId_LanguageCode] ON [wixi_Tekstil_Projects_Translations] ([ProjectId], [LanguageCode]);

CREATE INDEX [IX_wixi_Tekstil_ProjectTags_ProjectId] ON [wixi_Tekstil_ProjectTags] ([ProjectId]);

CREATE INDEX [IX_wixi_Tekstil_Stats_Translations_LanguageCode] ON [wixi_Tekstil_Stats_Translations] ([LanguageCode]);

CREATE UNIQUE INDEX [IX_wixi_Tekstil_Stats_Translations_StatId_LanguageCode] ON [wixi_Tekstil_Stats_Translations] ([StatId], [LanguageCode]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260104123719_AddTekstilModule', N'9.0.10');

COMMIT;
GO

