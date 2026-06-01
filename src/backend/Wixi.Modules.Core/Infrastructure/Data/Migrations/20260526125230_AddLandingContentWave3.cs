using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Wixi.Modules.Core.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddLandingContentWave3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "WIXI_MODULES",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Tag",
                table: "WIXI_MODULES",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "WIXI_LEGAL_DOCUMENTS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Slug = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Version = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    EffectiveDate = table.Column<DateOnly>(type: "date", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_LEGAL_DOCUMENTS", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_LEGAL_DOCUMENT_TRANSLATIONS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DocumentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LanguageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    ContentHtml = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LastUpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_LEGAL_DOCUMENT_TRANSLATIONS", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WIXI_LEGAL_DOCUMENT_TRANSLATIONS_WIXI_LANGUAGES_LanguageId",
                        column: x => x.LanguageId,
                        principalTable: "WIXI_LANGUAGES",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WIXI_LEGAL_DOCUMENT_TRANSLATIONS_WIXI_LEGAL_DOCUMENTS_DocumentId",
                        column: x => x.DocumentId,
                        principalTable: "WIXI_LEGAL_DOCUMENTS",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_LEGAL_DOCUMENT_TRANSLATIONS_DocumentId",
                table: "WIXI_LEGAL_DOCUMENT_TRANSLATIONS",
                column: "DocumentId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_LEGAL_DOCUMENT_TRANSLATIONS_LanguageId",
                table: "WIXI_LEGAL_DOCUMENT_TRANSLATIONS",
                column: "LanguageId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_LEGAL_DOCUMENTS_Slug",
                table: "WIXI_LEGAL_DOCUMENTS",
                column: "Slug");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WIXI_LEGAL_DOCUMENT_TRANSLATIONS");

            migrationBuilder.DropTable(
                name: "WIXI_LEGAL_DOCUMENTS");

            migrationBuilder.DropColumn(
                name: "Category",
                table: "WIXI_MODULES");

            migrationBuilder.DropColumn(
                name: "Tag",
                table: "WIXI_MODULES");
        }
    }
}
