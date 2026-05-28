using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Wixi.Modules.Core.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPlatformPaymentSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "WIXI_PLATFORM_PAYMENT_SETTINGS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StripeSecretKey = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    StripePublishableKey = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    StripeWebhookSecret = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    IyzipayApiKey = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    IyzipaySecretKey = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    IyzipayBaseUrl = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_PLATFORM_PAYMENT_SETTINGS", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WIXI_PLATFORM_PAYMENT_SETTINGS");
        }
    }
}
