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
GO

CREATE TABLE [WIXI_EC_BRANDS] (
    [Id] uniqueidentifier NOT NULL,
    [Name] nvarchar(300) NOT NULL,
    [Slug] nvarchar(300) NOT NULL,
    [Description] nvarchar(max) NULL,
    [LogoUrl] nvarchar(2000) NULL,
    [WebsiteUrl] nvarchar(500) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedByUser] nvarchar(max) NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedByUser] nvarchar(max) NULL,
    [IsActive] bit NOT NULL,
    [IsDeleted] bit NOT NULL,
    CONSTRAINT [PK_WIXI_EC_BRANDS] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [WIXI_EC_CATEGORIES] (
    [Id] uniqueidentifier NOT NULL,
    [ParentId] uniqueidentifier NULL,
    [Name] nvarchar(300) NOT NULL,
    [Slug] nvarchar(300) NOT NULL,
    [Description] nvarchar(max) NULL,
    [ImageUrl] nvarchar(max) NULL,
    [SortOrder] int NOT NULL,
    [MetaTitle] nvarchar(160) NULL,
    [MetaDescription] nvarchar(320) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedByUser] nvarchar(max) NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedByUser] nvarchar(max) NULL,
    [IsActive] bit NOT NULL,
    [IsDeleted] bit NOT NULL,
    CONSTRAINT [PK_WIXI_EC_CATEGORIES] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_WIXI_EC_CATEGORIES_WIXI_EC_CATEGORIES_ParentId] FOREIGN KEY ([ParentId]) REFERENCES [WIXI_EC_CATEGORIES] ([Id]) ON DELETE NO ACTION
);
GO

CREATE TABLE [WIXI_EC_PRODUCTS] (
    [Id] uniqueidentifier NOT NULL,
    [Name] nvarchar(500) NOT NULL,
    [Slug] nvarchar(500) NOT NULL,
    [ShortDescription] nvarchar(max) NULL,
    [Description] nvarchar(max) NULL,
    [CategoryId] uniqueidentifier NULL,
    [BrandId] uniqueidentifier NULL,
    [BasePrice] decimal(18,2) NOT NULL,
    [CompareAtPrice] decimal(18,2) NULL,
    [TrackInventory] bit NOT NULL,
    [MetaTitle] nvarchar(160) NULL,
    [MetaDescription] nvarchar(320) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedByUser] nvarchar(max) NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedByUser] nvarchar(max) NULL,
    [IsActive] bit NOT NULL,
    [IsDeleted] bit NOT NULL,
    CONSTRAINT [PK_WIXI_EC_PRODUCTS] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_WIXI_EC_PRODUCTS_WIXI_EC_BRANDS_BrandId] FOREIGN KEY ([BrandId]) REFERENCES [WIXI_EC_BRANDS] ([Id]) ON DELETE SET NULL,
    CONSTRAINT [FK_WIXI_EC_PRODUCTS_WIXI_EC_CATEGORIES_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [WIXI_EC_CATEGORIES] ([Id]) ON DELETE SET NULL
);
GO

CREATE TABLE [WIXI_EC_PRODUCT_MEDIA] (
    [Id] uniqueidentifier NOT NULL,
    [ProductId] uniqueidentifier NOT NULL,
    [VariantId] uniqueidentifier NULL,
    [Url] nvarchar(2000) NOT NULL,
    [ThumbnailUrl] nvarchar(2000) NULL,
    [AltText] nvarchar(500) NULL,
    [MediaType] int NOT NULL,
    [SortOrder] int NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedByUser] nvarchar(max) NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedByUser] nvarchar(max) NULL,
    [IsActive] bit NOT NULL,
    [IsDeleted] bit NOT NULL,
    CONSTRAINT [PK_WIXI_EC_PRODUCT_MEDIA] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_WIXI_EC_PRODUCT_MEDIA_WIXI_EC_PRODUCTS_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [WIXI_EC_PRODUCTS] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [WIXI_EC_PRODUCT_VARIANTS] (
    [Id] uniqueidentifier NOT NULL,
    [ProductId] uniqueidentifier NOT NULL,
    [Name] nvarchar(300) NOT NULL,
    [SKU] nvarchar(100) NOT NULL,
    [Barcode] nvarchar(100) NULL,
    [Price] decimal(18,2) NOT NULL,
    [CompareAtPrice] decimal(18,2) NULL,
    [StockQuantity] int NOT NULL,
    [ReservedQuantity] int NOT NULL,
    [LowStockThreshold] int NOT NULL,
    [WeightGrams] decimal(10,2) NULL,
    [AttributesJson] nvarchar(max) NOT NULL,
    [SortOrder] int NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedByUser] nvarchar(max) NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedByUser] nvarchar(max) NULL,
    [IsActive] bit NOT NULL,
    [IsDeleted] bit NOT NULL,
    CONSTRAINT [PK_WIXI_EC_PRODUCT_VARIANTS] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_WIXI_EC_PRODUCT_VARIANTS_WIXI_EC_PRODUCTS_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [WIXI_EC_PRODUCTS] ([Id]) ON DELETE CASCADE
);
GO

CREATE UNIQUE INDEX [IX_WIXI_EC_BRANDS_Slug] ON [WIXI_EC_BRANDS] ([Slug]);
GO

CREATE INDEX [IX_WIXI_EC_CATEGORIES_ParentId] ON [WIXI_EC_CATEGORIES] ([ParentId]);
GO

CREATE UNIQUE INDEX [IX_WIXI_EC_CATEGORIES_Slug] ON [WIXI_EC_CATEGORIES] ([Slug]);
GO

CREATE INDEX [IX_WIXI_EC_PRODUCT_MEDIA_ProductId] ON [WIXI_EC_PRODUCT_MEDIA] ([ProductId]);
GO

CREATE INDEX [IX_WIXI_EC_PRODUCT_VARIANTS_ProductId] ON [WIXI_EC_PRODUCT_VARIANTS] ([ProductId]);
GO

CREATE UNIQUE INDEX [IX_WIXI_EC_PRODUCT_VARIANTS_SKU] ON [WIXI_EC_PRODUCT_VARIANTS] ([SKU]);
GO

CREATE INDEX [IX_WIXI_EC_PRODUCTS_BrandId] ON [WIXI_EC_PRODUCTS] ([BrandId]);
GO

CREATE INDEX [IX_WIXI_EC_PRODUCTS_CategoryId] ON [WIXI_EC_PRODUCTS] ([CategoryId]);
GO

CREATE UNIQUE INDEX [IX_WIXI_EC_PRODUCTS_Slug] ON [WIXI_EC_PRODUCTS] ([Slug]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260428154853_ECommerce_TenantDb_Initial', N'8.0.2');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [Customers] (
    [Id] uniqueidentifier NOT NULL,
    [FirstName] nvarchar(max) NOT NULL,
    [LastName] nvarchar(max) NOT NULL,
    [Email] nvarchar(max) NOT NULL,
    [PasswordHash] nvarchar(max) NOT NULL,
    [PhoneNumber] nvarchar(max) NULL,
    [IsEmailVerified] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedByUser] nvarchar(max) NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedByUser] nvarchar(max) NULL,
    [IsActive] bit NOT NULL,
    [IsDeleted] bit NOT NULL,
    CONSTRAINT [PK_Customers] PRIMARY KEY ([Id])
);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260428164631_AddWixiCustomer', N'8.0.2');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Customers] DROP CONSTRAINT [PK_Customers];
GO

EXEC sp_rename N'[Customers]', N'WIXI_EC_CUSTOMERS';
GO

DECLARE @var0 sysname;
SELECT @var0 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[WIXI_EC_CUSTOMERS]') AND [c].[name] = N'PhoneNumber');
IF @var0 IS NOT NULL EXEC(N'ALTER TABLE [WIXI_EC_CUSTOMERS] DROP CONSTRAINT [' + @var0 + '];');
ALTER TABLE [WIXI_EC_CUSTOMERS] ALTER COLUMN [PhoneNumber] nvarchar(50) NULL;
GO

DECLARE @var1 sysname;
SELECT @var1 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[WIXI_EC_CUSTOMERS]') AND [c].[name] = N'LastName');
IF @var1 IS NOT NULL EXEC(N'ALTER TABLE [WIXI_EC_CUSTOMERS] DROP CONSTRAINT [' + @var1 + '];');
ALTER TABLE [WIXI_EC_CUSTOMERS] ALTER COLUMN [LastName] nvarchar(200) NOT NULL;
GO

DECLARE @var2 sysname;
SELECT @var2 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[WIXI_EC_CUSTOMERS]') AND [c].[name] = N'FirstName');
IF @var2 IS NOT NULL EXEC(N'ALTER TABLE [WIXI_EC_CUSTOMERS] DROP CONSTRAINT [' + @var2 + '];');
ALTER TABLE [WIXI_EC_CUSTOMERS] ALTER COLUMN [FirstName] nvarchar(200) NOT NULL;
GO

DECLARE @var3 sysname;
SELECT @var3 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[WIXI_EC_CUSTOMERS]') AND [c].[name] = N'Email');
IF @var3 IS NOT NULL EXEC(N'ALTER TABLE [WIXI_EC_CUSTOMERS] DROP CONSTRAINT [' + @var3 + '];');
ALTER TABLE [WIXI_EC_CUSTOMERS] ALTER COLUMN [Email] nvarchar(320) NOT NULL;
GO

ALTER TABLE [WIXI_EC_CUSTOMERS] ADD CONSTRAINT [PK_WIXI_EC_CUSTOMERS] PRIMARY KEY ([Id]);
GO

CREATE UNIQUE INDEX [IX_WIXI_EC_CUSTOMERS_Email] ON [WIXI_EC_CUSTOMERS] ([Email]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260428165925_UpdateWixiCustomerTableName', N'8.0.2');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [WIXI_EC_ORDERS] (
    [Id] uniqueidentifier NOT NULL,
    [CustomerId] uniqueidentifier NOT NULL,
    [OrderNumber] nvarchar(50) NOT NULL,
    [TotalAmount] decimal(18,2) NOT NULL,
    [Currency] nvarchar(10) NOT NULL,
    [Status] int NOT NULL,
    [ShippingAddress] nvarchar(2000) NOT NULL,
    [BillingAddress] nvarchar(2000) NOT NULL,
    [TrackingNumber] nvarchar(100) NULL,
    [ShippingProvider] nvarchar(100) NULL,
    [PaymentGateway] nvarchar(max) NULL,
    [PaymentToken] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedByUser] nvarchar(max) NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedByUser] nvarchar(max) NULL,
    [IsActive] bit NOT NULL,
    [IsDeleted] bit NOT NULL,
    CONSTRAINT [PK_WIXI_EC_ORDERS] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_WIXI_EC_ORDERS_WIXI_EC_CUSTOMERS_CustomerId] FOREIGN KEY ([CustomerId]) REFERENCES [WIXI_EC_CUSTOMERS] ([Id]) ON DELETE NO ACTION
);
GO

CREATE TABLE [WIXI_EC_STORE_SETTINGS] (
    [Id] uniqueidentifier NOT NULL,
    [StoreName] nvarchar(300) NOT NULL,
    [LogoUrl] nvarchar(2000) NULL,
    [FaviconUrl] nvarchar(max) NULL,
    [ContactEmail] nvarchar(320) NULL,
    [ContactPhone] nvarchar(max) NULL,
    [Address] nvarchar(max) NULL,
    [SocialLinksJson] nvarchar(max) NULL,
    [SeoTitle] nvarchar(160) NULL,
    [SeoDescription] nvarchar(max) NULL,
    [Keywords] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedByUser] nvarchar(max) NULL,
    [UpdatedAt] datetime2 NULL,
    [UpdatedByUser] nvarchar(max) NULL,
    [IsActive] bit NOT NULL,
    [IsDeleted] bit NOT NULL,
    CONSTRAINT [PK_WIXI_EC_STORE_SETTINGS] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [WIXI_EC_ORDER_ITEMS] (
    [Id] uniqueidentifier NOT NULL,
    [OrderId] uniqueidentifier NOT NULL,
    [ProductId] uniqueidentifier NOT NULL,
    [VariantId] uniqueidentifier NULL,
    [ProductName] nvarchar(500) NOT NULL,
    [VariantName] nvarchar(max) NULL,
    [SKU] nvarchar(100) NULL,
    [Quantity] int NOT NULL,
    [UnitPrice] decimal(18,2) NOT NULL,
    [TotalPrice] decimal(18,2) NOT NULL,
    CONSTRAINT [PK_WIXI_EC_ORDER_ITEMS] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_WIXI_EC_ORDER_ITEMS_WIXI_EC_ORDERS_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [WIXI_EC_ORDERS] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_WIXI_EC_ORDER_ITEMS_WIXI_EC_PRODUCTS_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [WIXI_EC_PRODUCTS] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_WIXI_EC_ORDER_ITEMS_WIXI_EC_PRODUCT_VARIANTS_VariantId] FOREIGN KEY ([VariantId]) REFERENCES [WIXI_EC_PRODUCT_VARIANTS] ([Id])
);
GO

CREATE INDEX [IX_WIXI_EC_ORDER_ITEMS_OrderId] ON [WIXI_EC_ORDER_ITEMS] ([OrderId]);
GO

CREATE INDEX [IX_WIXI_EC_ORDER_ITEMS_ProductId] ON [WIXI_EC_ORDER_ITEMS] ([ProductId]);
GO

CREATE INDEX [IX_WIXI_EC_ORDER_ITEMS_VariantId] ON [WIXI_EC_ORDER_ITEMS] ([VariantId]);
GO

CREATE INDEX [IX_WIXI_EC_ORDERS_CustomerId] ON [WIXI_EC_ORDERS] ([CustomerId]);
GO

CREATE UNIQUE INDEX [IX_WIXI_EC_ORDERS_OrderNumber] ON [WIXI_EC_ORDERS] ([OrderNumber]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260514114528_AddOrdersAndSettings', N'8.0.2');
GO

COMMIT;
GO

