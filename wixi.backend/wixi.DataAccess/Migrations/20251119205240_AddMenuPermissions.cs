using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace wixi.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddMenuPermissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "wixi_MenuPermissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    MenuPath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    MenuText = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    MenuCategory = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    MenuIcon = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsVisible = table.Column<bool>(type: "bit", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_MenuPermissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_wixi_MenuPermissions_wixi_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "wixi_Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_wixi_MenuPermissions_MenuPath",
                table: "wixi_MenuPermissions",
                column: "MenuPath");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_MenuPermissions_MenuPath_UserId",
                table: "wixi_MenuPermissions",
                columns: new[] { "MenuPath", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_wixi_MenuPermissions_UserId",
                table: "wixi_MenuPermissions",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "wixi_MenuPermissions");
        }
    }
}
