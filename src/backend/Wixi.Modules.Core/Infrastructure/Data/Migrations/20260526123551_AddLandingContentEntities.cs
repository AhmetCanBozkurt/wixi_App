using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Wixi.Modules.Core.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddLandingContentEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "WIXI_CONTACT_SUBMISSIONS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FullName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    Topic = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    Source = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsRead = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_CONTACT_SUBMISSIONS", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_FAQ_CATEGORIES",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Slug = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_FAQ_CATEGORIES", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_PLATFORM_STATS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StatKey = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DisplayValue = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    AutoCompute = table.Column<bool>(type: "bit", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_PLATFORM_STATS", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_FAQ_CATEGORY_TRANSLATIONS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CategoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LanguageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Label = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_FAQ_CATEGORY_TRANSLATIONS", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WIXI_FAQ_CATEGORY_TRANSLATIONS_WIXI_FAQ_CATEGORIES_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "WIXI_FAQ_CATEGORIES",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WIXI_FAQ_CATEGORY_TRANSLATIONS_WIXI_LANGUAGES_LanguageId",
                        column: x => x.LanguageId,
                        principalTable: "WIXI_LANGUAGES",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_FAQS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CategoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_FAQS", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WIXI_FAQS_WIXI_FAQ_CATEGORIES_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "WIXI_FAQ_CATEGORIES",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_PLATFORM_STAT_TRANSLATIONS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StatId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LanguageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Label = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_PLATFORM_STAT_TRANSLATIONS", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WIXI_PLATFORM_STAT_TRANSLATIONS_WIXI_LANGUAGES_LanguageId",
                        column: x => x.LanguageId,
                        principalTable: "WIXI_LANGUAGES",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WIXI_PLATFORM_STAT_TRANSLATIONS_WIXI_PLATFORM_STATS_StatId",
                        column: x => x.StatId,
                        principalTable: "WIXI_PLATFORM_STATS",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_FAQ_TRANSLATIONS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FaqId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LanguageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Question = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Answer = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_FAQ_TRANSLATIONS", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WIXI_FAQ_TRANSLATIONS_WIXI_FAQS_FaqId",
                        column: x => x.FaqId,
                        principalTable: "WIXI_FAQS",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WIXI_FAQ_TRANSLATIONS_WIXI_LANGUAGES_LanguageId",
                        column: x => x.LanguageId,
                        principalTable: "WIXI_LANGUAGES",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_FAQ_CATEGORIES_Slug",
                table: "WIXI_FAQ_CATEGORIES",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_FAQ_CATEGORY_TRANSLATIONS_CategoryId",
                table: "WIXI_FAQ_CATEGORY_TRANSLATIONS",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_FAQ_CATEGORY_TRANSLATIONS_LanguageId",
                table: "WIXI_FAQ_CATEGORY_TRANSLATIONS",
                column: "LanguageId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_FAQ_TRANSLATIONS_FaqId",
                table: "WIXI_FAQ_TRANSLATIONS",
                column: "FaqId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_FAQ_TRANSLATIONS_LanguageId",
                table: "WIXI_FAQ_TRANSLATIONS",
                column: "LanguageId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_FAQS_CategoryId",
                table: "WIXI_FAQS",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_PLATFORM_STAT_TRANSLATIONS_LanguageId",
                table: "WIXI_PLATFORM_STAT_TRANSLATIONS",
                column: "LanguageId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_PLATFORM_STAT_TRANSLATIONS_StatId",
                table: "WIXI_PLATFORM_STAT_TRANSLATIONS",
                column: "StatId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_PLATFORM_STATS_StatKey",
                table: "WIXI_PLATFORM_STATS",
                column: "StatKey",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WIXI_CONTACT_SUBMISSIONS");

            migrationBuilder.DropTable(
                name: "WIXI_FAQ_CATEGORY_TRANSLATIONS");

            migrationBuilder.DropTable(
                name: "WIXI_FAQ_TRANSLATIONS");

            migrationBuilder.DropTable(
                name: "WIXI_PLATFORM_STAT_TRANSLATIONS");

            migrationBuilder.DropTable(
                name: "WIXI_FAQS");

            migrationBuilder.DropTable(
                name: "WIXI_PLATFORM_STATS");

            migrationBuilder.DropTable(
                name: "WIXI_FAQ_CATEGORIES");
        }
    }
}
