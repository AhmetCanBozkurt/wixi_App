using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Wixi.Modules.Core.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddSubscriptionAndPayment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BannerImageUrl",
                table: "WIXI_TENANTS",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomDomain",
                table: "WIXI_TENANTS",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastMigrationError",
                table: "WIXI_TENANTS",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "OwnerUserId",
                table: "WIXI_TENANTS",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SeoDescription",
                table: "WIXI_TENANTS",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SeoTitle",
                table: "WIXI_TENANTS",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ThemeColorPrimary",
                table: "WIXI_TENANTS",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "LastSyncStatus",
                table: "WIXI_CURRENCY_SETTINGS",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Symbol",
                table: "WIXI_CURRENCIES",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(10)",
                oldMaxLength: 10,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "NameEn",
                table: "WIXI_CURRENCIES",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.CreateTable(
                name: "WIXI_PAYMENT_TRANSACTIONS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(14,2)", nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Gateway = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    ExternalId = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ExternalSubscriptionId = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    FailureReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_PAYMENT_TRANSACTIONS", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WIXI_PAYMENT_TRANSACTIONS_WIXI_TENANTS_TenantId",
                        column: x => x.TenantId,
                        principalTable: "WIXI_TENANTS",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_SUBSCRIPTION_PLANS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PriceMonthly = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    PriceYearly = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    FeaturesJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MaxProducts = table.Column<int>(type: "int", nullable: false),
                    MaxUsers = table.Column<int>(type: "int", nullable: false),
                    StripePriceIdMonthly = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    StripePriceIdYearly = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_SUBSCRIPTION_PLANS", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_TENANT_SUBSCRIPTIONS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlanId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    CurrentPeriodStart = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CurrentPeriodEnd = table.Column<DateTime>(type: "datetime2", nullable: false),
                    BillingInterval = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    StripeCustomerId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    StripeSubscriptionId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PaymentMethod = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_TENANT_SUBSCRIPTIONS", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WIXI_TENANT_SUBSCRIPTIONS_WIXI_SUBSCRIPTION_PLANS_PlanId",
                        column: x => x.PlanId,
                        principalTable: "WIXI_SUBSCRIPTION_PLANS",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WIXI_TENANT_SUBSCRIPTIONS_WIXI_TENANTS_TenantId",
                        column: x => x.TenantId,
                        principalTable: "WIXI_TENANTS",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_PAYMENT_TRANSACTIONS_TenantId",
                table: "WIXI_PAYMENT_TRANSACTIONS",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_SUBSCRIPTION_PLANS_Code",
                table: "WIXI_SUBSCRIPTION_PLANS",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_TENANT_SUBSCRIPTIONS_PlanId",
                table: "WIXI_TENANT_SUBSCRIPTIONS",
                column: "PlanId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_TENANT_SUBSCRIPTIONS_TenantId",
                table: "WIXI_TENANT_SUBSCRIPTIONS",
                column: "TenantId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WIXI_PAYMENT_TRANSACTIONS");

            migrationBuilder.DropTable(
                name: "WIXI_TENANT_SUBSCRIPTIONS");

            migrationBuilder.DropTable(
                name: "WIXI_SUBSCRIPTION_PLANS");

            migrationBuilder.DropColumn(
                name: "BannerImageUrl",
                table: "WIXI_TENANTS");

            migrationBuilder.DropColumn(
                name: "CustomDomain",
                table: "WIXI_TENANTS");

            migrationBuilder.DropColumn(
                name: "LastMigrationError",
                table: "WIXI_TENANTS");

            migrationBuilder.DropColumn(
                name: "OwnerUserId",
                table: "WIXI_TENANTS");

            migrationBuilder.DropColumn(
                name: "SeoDescription",
                table: "WIXI_TENANTS");

            migrationBuilder.DropColumn(
                name: "SeoTitle",
                table: "WIXI_TENANTS");

            migrationBuilder.DropColumn(
                name: "ThemeColorPrimary",
                table: "WIXI_TENANTS");

            migrationBuilder.AlterColumn<string>(
                name: "LastSyncStatus",
                table: "WIXI_CURRENCY_SETTINGS",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Symbol",
                table: "WIXI_CURRENCIES",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(10)",
                oldMaxLength: 10);

            migrationBuilder.AlterColumn<string>(
                name: "NameEn",
                table: "WIXI_CURRENCIES",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);
        }
    }
}
