using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Wixi.Modules.ECommerce.Migrations.Tenant
{
    /// <inheritdoc />
    public partial class ThemeEditor_GlobalComponents_CustomCode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CustomCssOverride",
                table: "WIXI_EC_STORE_SETTINGS",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomJsOverride",
                table: "WIXI_EC_STORE_SETTINGS",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GlobalComponentsConfigJson",
                table: "WIXI_EC_STORE_SETTINGS",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CustomCssOverride",
                table: "WIXI_EC_STORE_SETTINGS");

            migrationBuilder.DropColumn(
                name: "CustomJsOverride",
                table: "WIXI_EC_STORE_SETTINGS");

            migrationBuilder.DropColumn(
                name: "GlobalComponentsConfigJson",
                table: "WIXI_EC_STORE_SETTINGS");
        }
    }
}
