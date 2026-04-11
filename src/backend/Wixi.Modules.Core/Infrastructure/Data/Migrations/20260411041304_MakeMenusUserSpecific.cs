using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Wixi.Modules.Core.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class MakeMenusUserSpecific : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM WIXI_MENU_TRANSLATIONS; DELETE FROM WIXI_MENUS;");

            migrationBuilder.DropTable(
                name: "WIXI_USER_MENUS");

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "WIXI_MENUS",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_MENUS_UserId",
                table: "WIXI_MENUS",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_WIXI_MENUS_WIXI_USERS_UserId",
                table: "WIXI_MENUS",
                column: "UserId",
                principalTable: "WIXI_USERS",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WIXI_MENUS_WIXI_USERS_UserId",
                table: "WIXI_MENUS");

            migrationBuilder.DropIndex(
                name: "IX_WIXI_MENUS_UserId",
                table: "WIXI_MENUS");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "WIXI_MENUS");

            migrationBuilder.CreateTable(
                name: "WIXI_USER_MENUS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MenuId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CustomParentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CustomSortOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    IsVisible = table.Column<bool>(type: "bit", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_USER_MENUS", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WIXI_USER_MENUS_WIXI_MENUS_MenuId",
                        column: x => x.MenuId,
                        principalTable: "WIXI_MENUS",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WIXI_USER_MENUS_WIXI_USERS_UserId",
                        column: x => x.UserId,
                        principalTable: "WIXI_USERS",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_USER_MENUS_MenuId",
                table: "WIXI_USER_MENUS",
                column: "MenuId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_USER_MENUS_UserId",
                table: "WIXI_USER_MENUS",
                column: "UserId");
        }
    }
}
