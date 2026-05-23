using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Wixi.Modules.ECommerce.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddThemeVersions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "WIXI_EC_THEME_VERSIONS",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StoreSettingsId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    VersionNumber = table.Column<int>(type: "int", nullable: false),
                    ThemeConfigJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GlobalComponentsConfigJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CustomCssOverride = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CustomJsOverride = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    VersionLabel = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    VersionType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsPublished = table.Column<bool>(type: "bit", nullable: false),
                    RestoredFromVersionId = table.Column<int>(type: "int", nullable: true),
                    ChangedByEmail = table.Column<string>(type: "nvarchar(320)", maxLength: 320, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_EC_THEME_VERSIONS", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WIXI_EC_THEME_VERSIONS_WIXI_EC_STORE_SETTINGS_StoreSettingsId",
                        column: x => x.StoreSettingsId,
                        principalTable: "WIXI_EC_STORE_SETTINGS",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_EC_THEME_VERSIONS_StoreSettingsId_IsPublished",
                table: "WIXI_EC_THEME_VERSIONS",
                columns: new[] { "StoreSettingsId", "IsPublished" });

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_EC_THEME_VERSIONS_StoreSettingsId_VersionNumber",
                table: "WIXI_EC_THEME_VERSIONS",
                columns: new[] { "StoreSettingsId", "VersionNumber" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WIXI_EC_THEME_VERSIONS");
        }
    }
}
