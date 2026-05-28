using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Wixi.Modules.ECommerce.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantPaymentSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "WIXI_EC_PAYMENT_SETTINGS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ActiveGateway = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    StripeSecretKey = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    StripePublishableKey = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    StripeWebhookSecret = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    IyzipayApiKey = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    IyzipaySecretKey = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    IyzipayBaseUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_EC_PAYMENT_SETTINGS", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WIXI_EC_PAYMENT_SETTINGS");
        }
    }
}
