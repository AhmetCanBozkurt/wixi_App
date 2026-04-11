using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Wixi.Modules.Core.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddMultiLanguageMenu : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "WIXI_LANGUAGES",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    IsDefault = table.Column<bool>(type: "bit", nullable: false),
                    FlagCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_LANGUAGES", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_MENUS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ParentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Path = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Icon = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IconColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsVisible = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_MENUS", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WIXI_MENUS_WIXI_MENUS_ParentId",
                        column: x => x.ParentId,
                        principalTable: "WIXI_MENUS",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_MENU_TRANSLATIONS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MenuId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LanguageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_MENU_TRANSLATIONS", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WIXI_MENU_TRANSLATIONS_WIXI_LANGUAGES_LanguageId",
                        column: x => x.LanguageId,
                        principalTable: "WIXI_LANGUAGES",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WIXI_MENU_TRANSLATIONS_WIXI_MENUS_MenuId",
                        column: x => x.MenuId,
                        principalTable: "WIXI_MENUS",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_MENU_TRANSLATIONS_LanguageId",
                table: "WIXI_MENU_TRANSLATIONS",
                column: "LanguageId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_MENU_TRANSLATIONS_MenuId",
                table: "WIXI_MENU_TRANSLATIONS",
                column: "MenuId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_MENUS_ParentId",
                table: "WIXI_MENUS",
                column: "ParentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WIXI_MENU_TRANSLATIONS");

            migrationBuilder.DropTable(
                name: "WIXI_LANGUAGES");

            migrationBuilder.DropTable(
                name: "WIXI_MENUS");
        }
    }
}
