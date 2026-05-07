using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Wixi.Modules.Core.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCurrencyManagement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "WIXI_CURRENCIES",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Symbol = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    Unit = table.Column<int>(type: "int", nullable: false),
                    IsBase = table.Column<bool>(type: "bit", nullable: false),
                    IsTcmbTracked = table.Column<bool>(type: "bit", nullable: false),
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
                    table.PrimaryKey("PK_WIXI_CURRENCIES", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_CURRENCY_SETTINGS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BaseCurrencyCode = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    TcmbAutoSyncEnabled = table.Column<bool>(type: "bit", nullable: false),
                    LastSyncedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastSyncStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_CURRENCY_SETTINGS", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_EXCHANGE_RATES",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RateDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CurrencyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CurrencyCode = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    CrossOrder = table.Column<int>(type: "int", nullable: true),
                    Unit = table.Column<int>(type: "int", nullable: false),
                    ForexBuying = table.Column<decimal>(type: "decimal(18,6)", nullable: true),
                    ForexSelling = table.Column<decimal>(type: "decimal(18,6)", nullable: true),
                    BanknoteBuying = table.Column<decimal>(type: "decimal(18,6)", nullable: true),
                    BanknoteSelling = table.Column<decimal>(type: "decimal(18,6)", nullable: true),
                    Source = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_EXCHANGE_RATES", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WIXI_EXCHANGE_RATES_WIXI_CURRENCIES_CurrencyId",
                        column: x => x.CurrencyId,
                        principalTable: "WIXI_CURRENCIES",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_CURRENCIES_Code",
                table: "WIXI_CURRENCIES",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_EXCHANGE_RATES_CurrencyId",
                table: "WIXI_EXCHANGE_RATES",
                column: "CurrencyId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_EXCHANGE_RATES_RateDate_CurrencyId",
                table: "WIXI_EXCHANGE_RATES",
                columns: new[] { "RateDate", "CurrencyId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WIXI_CURRENCY_SETTINGS");

            migrationBuilder.DropTable(
                name: "WIXI_EXCHANGE_RATES");

            migrationBuilder.DropTable(
                name: "WIXI_CURRENCIES");
        }
    }
}
