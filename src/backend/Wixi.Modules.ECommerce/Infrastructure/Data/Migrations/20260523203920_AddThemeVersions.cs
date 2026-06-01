using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Wixi.Modules.ECommerce.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddThemeVersions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Eski Migrations/Tenant/ThemeEditor_VersionHistory aynı tabloyu yaratmış olabilir.
            // IF NOT EXISTS guard ile idempotent yapılıyor.
            migrationBuilder.Sql("""
                IF OBJECT_ID(N'WIXI_EC_THEME_VERSIONS', N'U') IS NULL
                BEGIN
                    CREATE TABLE [WIXI_EC_THEME_VERSIONS] (
                        [Id]                        INT IDENTITY(1,1) NOT NULL,
                        [StoreSettingsId]           UNIQUEIDENTIFIER NOT NULL,
                        [VersionNumber]             INT NOT NULL,
                        [ThemeConfigJson]           NVARCHAR(MAX) NULL,
                        [GlobalComponentsConfigJson] NVARCHAR(MAX) NULL,
                        [CustomCssOverride]         NVARCHAR(MAX) NULL,
                        [CustomJsOverride]          NVARCHAR(MAX) NULL,
                        [VersionLabel]              NVARCHAR(200) NULL,
                        [VersionType]               NVARCHAR(50) NOT NULL,
                        [IsPublished]               BIT NOT NULL,
                        [RestoredFromVersionId]     INT NULL,
                        [ChangedByEmail]            NVARCHAR(320) NULL,
                        [CreatedAt]                 DATETIME2 NOT NULL,
                        CONSTRAINT [PK_WIXI_EC_THEME_VERSIONS] PRIMARY KEY ([Id]),
                        CONSTRAINT [FK_WIXI_EC_THEME_VERSIONS_WIXI_EC_STORE_SETTINGS_StoreSettingsId]
                            FOREIGN KEY ([StoreSettingsId]) REFERENCES [WIXI_EC_STORE_SETTINGS] ([Id]) ON DELETE CASCADE
                    );

                    CREATE INDEX [IX_WIXI_EC_THEME_VERSIONS_StoreSettingsId_IsPublished]
                        ON [WIXI_EC_THEME_VERSIONS] ([StoreSettingsId], [IsPublished]);

                    CREATE INDEX [IX_WIXI_EC_THEME_VERSIONS_StoreSettingsId_VersionNumber]
                        ON [WIXI_EC_THEME_VERSIONS] ([StoreSettingsId], [VersionNumber]);
                END
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WIXI_EC_THEME_VERSIONS");
        }
    }
}
