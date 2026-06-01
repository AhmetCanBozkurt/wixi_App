using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Wixi.Modules.Core.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddModulePricingFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ColorAccent",
                table: "WIXI_MODULES",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FeaturesJson",
                table: "WIXI_MODULES",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsPopular",
                table: "WIXI_MODULES",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "PriceMonthly",
                table: "WIXI_MODULES",
                type: "decimal(10,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PriceYearly",
                table: "WIXI_MODULES",
                type: "decimal(10,2)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SortOrder",
                table: "WIXI_MODULES",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ColorAccent",
                table: "WIXI_MODULES");

            migrationBuilder.DropColumn(
                name: "FeaturesJson",
                table: "WIXI_MODULES");

            migrationBuilder.DropColumn(
                name: "IsPopular",
                table: "WIXI_MODULES");

            migrationBuilder.DropColumn(
                name: "PriceMonthly",
                table: "WIXI_MODULES");

            migrationBuilder.DropColumn(
                name: "PriceYearly",
                table: "WIXI_MODULES");

            migrationBuilder.DropColumn(
                name: "SortOrder",
                table: "WIXI_MODULES");
        }
    }
}
