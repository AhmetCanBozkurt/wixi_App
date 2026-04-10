using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace wixi.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddClientNotesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "wixi_ClientNotes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClientId = table.Column<int>(type: "int", nullable: false),
                    CreatedByUserId = table.Column<int>(type: "int", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", maxLength: 5000, nullable: false),
                    IsPinned = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    IsVisibleToClient = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_ClientNotes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_wixi_ClientNotes_wixi_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "wixi_Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_wixi_ClientNotes_ClientId",
                table: "wixi_ClientNotes",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_ClientNotes_CreatedAt",
                table: "wixi_ClientNotes",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_ClientNotes_CreatedByUserId",
                table: "wixi_ClientNotes",
                column: "CreatedByUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "wixi_ClientNotes");
        }
    }
}
