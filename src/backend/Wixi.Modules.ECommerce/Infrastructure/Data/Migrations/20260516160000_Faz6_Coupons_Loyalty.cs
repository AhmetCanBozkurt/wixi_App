using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Wixi.Modules.ECommerce.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class Faz6_Coupons_Loyalty : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // WIXI_EC_COUPONS
            migrationBuilder.CreateTable(
                name: "WIXI_EC_COUPONS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DiscountType = table.Column<int>(type: "int", nullable: false),
                    DiscountValue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    MinOrderAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    MaxUsageTotal = table.Column<int>(type: "int", nullable: true),
                    MaxUsagePerCustomer = table.Column<int>(type: "int", nullable: true),
                    CurrentUsage = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    StartsAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_EC_COUPONS", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_EC_COUPONS_Code",
                table: "WIXI_EC_COUPONS",
                column: "Code",
                unique: true);

            // WIXI_EC_FAVORITES
            migrationBuilder.CreateTable(
                name: "WIXI_EC_FAVORITES",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProductId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_EC_FAVORITES", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_EC_FAVORITES_CustomerId_ProductId",
                table: "WIXI_EC_FAVORITES",
                columns: new[] { "CustomerId", "ProductId" },
                unique: true);

            // WIXI_EC_LOYALTY_POINTS
            migrationBuilder.CreateTable(
                name: "WIXI_EC_LOYALTY_POINTS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Points = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ReferenceOrderId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_EC_LOYALTY_POINTS", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_EC_LOYALTY_POINTS_CustomerId",
                table: "WIXI_EC_LOYALTY_POINTS",
                column: "CustomerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "WIXI_EC_LOYALTY_POINTS");
            migrationBuilder.DropTable(name: "WIXI_EC_FAVORITES");
            migrationBuilder.DropTable(name: "WIXI_EC_COUPONS");
        }
    }
}
