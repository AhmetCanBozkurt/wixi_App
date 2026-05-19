using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Wixi.Modules.Core.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddModulesAndMenuVisibility : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ModuleCode",
                table: "WIXI_MENUS");

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

            migrationBuilder.CreateTable(
                name: "WIXI_MODULES",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Icon = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsPublic = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_MODULES", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_MENUS_ModuleId",
                table: "WIXI_MENUS",
                column: "ModuleId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_MODULES_Code",
                table: "WIXI_MODULES",
                column: "Code",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_WIXI_MENUS_WIXI_MODULES_ModuleId",
                table: "WIXI_MENUS",
                column: "ModuleId",
                principalTable: "WIXI_MODULES",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WIXI_MENUS_WIXI_MODULES_ModuleId",
                table: "WIXI_MENUS");

            migrationBuilder.DropTable(
                name: "WIXI_MODULES");

            migrationBuilder.DropIndex(
                name: "IX_WIXI_MENUS_ModuleId",
                table: "WIXI_MENUS");

            migrationBuilder.DropColumn(
                name: "ModuleId",
                table: "WIXI_MENUS");

            migrationBuilder.DropColumn(
                name: "VisibleToTenant",
                table: "WIXI_MENUS");

            migrationBuilder.AddColumn<string>(
                name: "ModuleCode",
                table: "WIXI_MENUS",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);
        }
    }
}
