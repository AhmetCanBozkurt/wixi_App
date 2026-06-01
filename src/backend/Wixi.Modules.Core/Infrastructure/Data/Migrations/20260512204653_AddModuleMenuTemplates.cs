using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Wixi.Modules.Core.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddModuleMenuTemplates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WIXI_MENUS_WIXI_MODULES_ModuleId",
                table: "WIXI_MENUS");

            migrationBuilder.DropIndex(
                name: "IX_WIXI_MENUS_ModuleId",
                table: "WIXI_MENUS");

            migrationBuilder.DropColumn(
                name: "IsSystemMenu",
                table: "WIXI_MENUS");

            migrationBuilder.DropColumn(
                name: "ModuleId",
                table: "WIXI_MENUS");

            migrationBuilder.DropColumn(
                name: "VisibleToTenant",
                table: "WIXI_MENUS");

            migrationBuilder.CreateTable(
                name: "WIXI_MODULE_MENUS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ModuleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ParentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Path = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Icon = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IconColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    VisibleToTenant = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_MODULE_MENUS", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WIXI_MODULE_MENUS_WIXI_MODULES_ModuleId",
                        column: x => x.ModuleId,
                        principalTable: "WIXI_MODULES",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WIXI_MODULE_MENUS_WIXI_MODULE_MENUS_ParentId",
                        column: x => x.ParentId,
                        principalTable: "WIXI_MODULE_MENUS",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_MODULE_MENU_TRANSLATIONS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ModuleMenuId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LanguageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_MODULE_MENU_TRANSLATIONS", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WIXI_MODULE_MENU_TRANSLATIONS_WIXI_LANGUAGES_LanguageId",
                        column: x => x.LanguageId,
                        principalTable: "WIXI_LANGUAGES",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WIXI_MODULE_MENU_TRANSLATIONS_WIXI_MODULE_MENUS_ModuleMenuId",
                        column: x => x.ModuleMenuId,
                        principalTable: "WIXI_MODULE_MENUS",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_MODULE_MENU_TRANSLATIONS_LanguageId",
                table: "WIXI_MODULE_MENU_TRANSLATIONS",
                column: "LanguageId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_MODULE_MENU_TRANSLATIONS_ModuleMenuId",
                table: "WIXI_MODULE_MENU_TRANSLATIONS",
                column: "ModuleMenuId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_MODULE_MENUS_ModuleId",
                table: "WIXI_MODULE_MENUS",
                column: "ModuleId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_MODULE_MENUS_ParentId",
                table: "WIXI_MODULE_MENUS",
                column: "ParentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WIXI_MODULE_MENU_TRANSLATIONS");

            migrationBuilder.DropTable(
                name: "WIXI_MODULE_MENUS");

            migrationBuilder.AddColumn<bool>(
                name: "IsSystemMenu",
                table: "WIXI_MENUS",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "ModuleId",
                table: "WIXI_MENUS",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "VisibleToTenant",
                table: "WIXI_MENUS",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_MENUS_ModuleId",
                table: "WIXI_MENUS",
                column: "ModuleId");

            migrationBuilder.AddForeignKey(
                name: "FK_WIXI_MENUS_WIXI_MODULES_ModuleId",
                table: "WIXI_MENUS",
                column: "ModuleId",
                principalTable: "WIXI_MODULES",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
