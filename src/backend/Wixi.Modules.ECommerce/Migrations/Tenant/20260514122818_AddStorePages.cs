using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Wixi.Modules.ECommerce.Migrations.Tenant
{
    /// <inheritdoc />
    public partial class AddStorePages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Idempotent: column may already exist on tenants migrated before this split
            migrationBuilder.Sql(@"
IF COL_LENGTH('WIXI_EC_STORE_SETTINGS', 'LayoutConfigJson') IS NULL
    ALTER TABLE WIXI_EC_STORE_SETTINGS ADD LayoutConfigJson nvarchar(max) NULL;
IF COL_LENGTH('WIXI_EC_STORE_SETTINGS', 'ThemeConfigJson') IS NULL
    ALTER TABLE WIXI_EC_STORE_SETTINGS ADD ThemeConfigJson nvarchar(max) NULL;
");

            migrationBuilder.CreateTable(
                name: "WIXI_EC_STORE_PAGES",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PageType = table.Column<int>(type: "int", nullable: false),
                    Slug = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    LayoutConfigJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ThemeOverrideJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MetaTitle = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    MetaDescription = table.Column<string>(type: "nvarchar(320)", maxLength: 320, nullable: true),
                    MetaKeywords = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    OpenGraphImageUrl = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    BacklinksJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsPublished = table.Column<bool>(type: "bit", nullable: false),
                    PublishedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_EC_STORE_PAGES", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_EC_STORE_PAGES_Slug",
                table: "WIXI_EC_STORE_PAGES",
                column: "Slug",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WIXI_EC_STORE_PAGES");

            migrationBuilder.DropColumn(
                name: "LayoutConfigJson",
                table: "WIXI_EC_STORE_SETTINGS");

            migrationBuilder.DropColumn(
                name: "ThemeConfigJson",
                table: "WIXI_EC_STORE_SETTINGS");
        }
    }
}
