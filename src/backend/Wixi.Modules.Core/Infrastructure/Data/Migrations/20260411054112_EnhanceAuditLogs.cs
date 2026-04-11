using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Wixi.Modules.Core.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class EnhanceAuditLogs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AffectedColumns",
                table: "WIXI_AUDIT_LOGS",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EntityId",
                table: "WIXI_AUDIT_LOGS",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FullName",
                table: "WIXI_AUDIT_LOGS",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NewValues",
                table: "WIXI_AUDIT_LOGS",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OldValues",
                table: "WIXI_AUDIT_LOGS",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TableName",
                table: "WIXI_AUDIT_LOGS",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AffectedColumns",
                table: "WIXI_AUDIT_LOGS");

            migrationBuilder.DropColumn(
                name: "EntityId",
                table: "WIXI_AUDIT_LOGS");

            migrationBuilder.DropColumn(
                name: "FullName",
                table: "WIXI_AUDIT_LOGS");

            migrationBuilder.DropColumn(
                name: "NewValues",
                table: "WIXI_AUDIT_LOGS");

            migrationBuilder.DropColumn(
                name: "OldValues",
                table: "WIXI_AUDIT_LOGS");

            migrationBuilder.DropColumn(
                name: "TableName",
                table: "WIXI_AUDIT_LOGS");
        }
    }
}
