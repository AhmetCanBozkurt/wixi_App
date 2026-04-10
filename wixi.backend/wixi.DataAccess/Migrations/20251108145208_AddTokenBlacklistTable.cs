using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace wixi.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddTokenBlacklistTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "wixi_TokenBlacklists",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Token = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    BlacklistedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpirationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_TokenBlacklists", x => x.Id);
                    table.ForeignKey(
                        name: "FK_wixi_TokenBlacklists_wixi_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "wixi_Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_wixi_TokenBlacklists_ExpirationDate",
                table: "wixi_TokenBlacklists",
                column: "ExpirationDate");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_TokenBlacklists_Token",
                table: "wixi_TokenBlacklists",
                column: "Token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_wixi_TokenBlacklists_UserId",
                table: "wixi_TokenBlacklists",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "wixi_TokenBlacklists");
        }
    }
}
