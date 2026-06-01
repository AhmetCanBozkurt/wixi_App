using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Wixi.Modules.WebBuilder.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialWebBuilder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "WB_BLOG_CATEGORIES",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Slug = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
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
                    table.PrimaryKey("PK_WB_BLOG_CATEGORIES", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WB_BLOG_POSTS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CategoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Title = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Slug = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Summary = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ContentHtml = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FeaturedImageUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    MetaTitle = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    MetaDescription = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Tags = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    IsPublished = table.Column<bool>(type: "bit", nullable: false),
                    PublishedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AuthorName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ReadTimeMinutes = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WB_BLOG_POSTS", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WB_CORP_PAGE_VERSIONS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LayoutConfigJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ThemeOverrideJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CheckpointLabel = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUser = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WB_CORP_PAGE_VERSIONS", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WB_CORP_PAGES",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PageType = table.Column<int>(type: "int", nullable: false),
                    Slug = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    LayoutConfigJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ThemeOverrideJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MetaTitle = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    MetaDescription = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    MetaKeywords = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    OpenGraphImageUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    BacklinksJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsPublished = table.Column<bool>(type: "bit", nullable: false),
                    PublishedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WB_CORP_PAGES", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WB_FORM_SUBMISSIONS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FormId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DataJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IpAddress = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WB_FORM_SUBMISSIONS", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WB_WEB_FORMS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Slug = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    FieldsJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SubmitButtonText = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SuccessMessage = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    NotifyEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WB_WEB_FORMS", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WB_BLOG_CATEGORIES_TenantId_Slug",
                table: "WB_BLOG_CATEGORIES",
                columns: new[] { "TenantId", "Slug" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WB_BLOG_POSTS_TenantId",
                table: "WB_BLOG_POSTS",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_WB_BLOG_POSTS_TenantId_Slug",
                table: "WB_BLOG_POSTS",
                columns: new[] { "TenantId", "Slug" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WB_CORP_PAGE_VERSIONS_PageId",
                table: "WB_CORP_PAGE_VERSIONS",
                column: "PageId");

            migrationBuilder.CreateIndex(
                name: "IX_WB_CORP_PAGES_TenantId",
                table: "WB_CORP_PAGES",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_WB_CORP_PAGES_TenantId_Slug",
                table: "WB_CORP_PAGES",
                columns: new[] { "TenantId", "Slug" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WB_FORM_SUBMISSIONS_FormId",
                table: "WB_FORM_SUBMISSIONS",
                column: "FormId");

            migrationBuilder.CreateIndex(
                name: "IX_WB_FORM_SUBMISSIONS_TenantId",
                table: "WB_FORM_SUBMISSIONS",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_WB_WEB_FORMS_TenantId_Slug",
                table: "WB_WEB_FORMS",
                columns: new[] { "TenantId", "Slug" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WB_BLOG_CATEGORIES");

            migrationBuilder.DropTable(
                name: "WB_BLOG_POSTS");

            migrationBuilder.DropTable(
                name: "WB_CORP_PAGE_VERSIONS");

            migrationBuilder.DropTable(
                name: "WB_CORP_PAGES");

            migrationBuilder.DropTable(
                name: "WB_FORM_SUBMISSIONS");

            migrationBuilder.DropTable(
                name: "WB_WEB_FORMS");
        }
    }
}
