using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Wixi.Modules.Core.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAuditProperties : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "WIXI_MENU_TRANSLATIONS",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "WIXI_MENU_TRANSLATIONS",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "WIXI_MENU_TRANSLATIONS",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "WIXI_MENU_TRANSLATIONS",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "WIXI_MENU_TRANSLATIONS");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "WIXI_MENU_TRANSLATIONS");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "WIXI_MENU_TRANSLATIONS");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "WIXI_MENU_TRANSLATIONS");
        }
    }
}
