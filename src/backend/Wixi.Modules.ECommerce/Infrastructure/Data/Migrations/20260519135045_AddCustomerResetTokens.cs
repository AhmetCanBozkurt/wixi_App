using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Wixi.Modules.ECommerce.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomerResetTokens : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "WIXI_EC_CUSTOMER_RESET_TOKENS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TokenHash = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UsedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IpAddress = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_EC_CUSTOMER_RESET_TOKENS", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WIXI_EC_CUSTOMER_RESET_TOKENS_WIXI_EC_CUSTOMERS_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "WIXI_EC_CUSTOMERS",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_EC_CUSTOMER_RESET_TOKENS_CustomerId",
                table: "WIXI_EC_CUSTOMER_RESET_TOKENS",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_EC_CUSTOMER_RESET_TOKENS_TokenHash",
                table: "WIXI_EC_CUSTOMER_RESET_TOKENS",
                column: "TokenHash",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WIXI_EC_CUSTOMER_RESET_TOKENS");
        }
    }
}
