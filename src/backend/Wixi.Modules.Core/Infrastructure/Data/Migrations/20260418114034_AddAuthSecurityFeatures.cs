using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Wixi.Modules.Core.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAuthSecurityFeatures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "WIXI_2FA_CODES",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CodeHash = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    CodeSalt = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    SessionToken = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsUsed = table.Column<bool>(type: "bit", nullable: false),
                    AttemptCount = table.Column<int>(type: "int", nullable: false),
                    LastResendAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_2FA_CODES", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_REFRESH_TOKENS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Token = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsRevoked = table.Column<bool>(type: "bit", nullable: false),
                    IpAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserAgent = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_REFRESH_TOKENS", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_2FA_CODES_SessionToken",
                table: "WIXI_2FA_CODES",
                column: "SessionToken",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_REFRESH_TOKENS_Token",
                table: "WIXI_REFRESH_TOKENS",
                column: "Token",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WIXI_2FA_CODES");

            migrationBuilder.DropTable(
                name: "WIXI_REFRESH_TOKENS");
        }
    }
}
