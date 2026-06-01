using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Wixi.Modules.ECommerce.Migrations.Tenant
{
    /// <inheritdoc />
    public partial class AddCartItemsFeaturedAndLanguages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Idempotent column adds
            migrationBuilder.Sql(@"
IF COL_LENGTH('WIXI_EC_PRODUCTS', 'IsFeatured') IS NULL
    ALTER TABLE WIXI_EC_PRODUCTS ADD IsFeatured BIT NOT NULL DEFAULT 0;
IF COL_LENGTH('WIXI_EC_STORE_SETTINGS', 'SupportedLanguages') IS NULL
    ALTER TABLE WIXI_EC_STORE_SETTINGS ADD SupportedLanguages NVARCHAR(MAX) NULL;
IF COL_LENGTH('WIXI_EC_STORE_SETTINGS', 'DefaultLanguage') IS NULL
    ALTER TABLE WIXI_EC_STORE_SETTINGS ADD DefaultLanguage NVARCHAR(10) NULL;
");

            migrationBuilder.CreateTable(
                name: "WIXI_EC_CART_ITEMS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SessionId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ProductId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    VariantId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ProductName = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ProductSlug = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    VariantName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UnitPrice = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table => table.PrimaryKey("PK_WIXI_EC_CART_ITEMS", x => x.Id));

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_EC_CART_ITEMS_CustomerId",
                table: "WIXI_EC_CART_ITEMS",
                column: "CustomerId");

            migrationBuilder.CreateTable(
                name: "WIXI_EC_NEWSLETTER_SUBS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(320)", maxLength: 320, nullable: false),
                    SubscribedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table => table.PrimaryKey("PK_WIXI_EC_NEWSLETTER_SUBS", x => x.Id));

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_EC_NEWSLETTER_SUBS_Email",
                table: "WIXI_EC_NEWSLETTER_SUBS",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "WIXI_EC_CART_ITEMS");
            migrationBuilder.DropTable(name: "WIXI_EC_NEWSLETTER_SUBS");
        }
    }
}
