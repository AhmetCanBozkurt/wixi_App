using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Wixi.Modules.Core.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAuditFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CreatedByUser",
                table: "WIXI_USERS",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedByUser",
                table: "WIXI_USERS",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedByUser",
                table: "WIXI_ROLES",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedByUser",
                table: "WIXI_ROLES",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedByUser",
                table: "WIXI_MENUS",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedByUser",
                table: "WIXI_MENUS",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedByUser",
                table: "WIXI_MENU_TRANSLATIONS",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedByUser",
                table: "WIXI_MENU_TRANSLATIONS",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedByUser",
                table: "WIXI_LANGUAGES",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedByUser",
                table: "WIXI_LANGUAGES",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedByUser",
                table: "WIXI_AUDIT_LOGS",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedByUser",
                table: "WIXI_AUDIT_LOGS",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedByUser",
                table: "WIXI_USERS");

            migrationBuilder.DropColumn(
                name: "UpdatedByUser",
                table: "WIXI_USERS");

            migrationBuilder.DropColumn(
                name: "CreatedByUser",
                table: "WIXI_ROLES");

            migrationBuilder.DropColumn(
                name: "UpdatedByUser",
                table: "WIXI_ROLES");

            migrationBuilder.DropColumn(
                name: "CreatedByUser",
                table: "WIXI_MENUS");

            migrationBuilder.DropColumn(
                name: "UpdatedByUser",
                table: "WIXI_MENUS");

            migrationBuilder.DropColumn(
                name: "CreatedByUser",
                table: "WIXI_MENU_TRANSLATIONS");

            migrationBuilder.DropColumn(
                name: "UpdatedByUser",
                table: "WIXI_MENU_TRANSLATIONS");

            migrationBuilder.DropColumn(
                name: "CreatedByUser",
                table: "WIXI_LANGUAGES");

            migrationBuilder.DropColumn(
                name: "UpdatedByUser",
                table: "WIXI_LANGUAGES");

            migrationBuilder.DropColumn(
                name: "CreatedByUser",
                table: "WIXI_AUDIT_LOGS");

            migrationBuilder.DropColumn(
                name: "UpdatedByUser",
                table: "WIXI_AUDIT_LOGS");
        }
    }
}
