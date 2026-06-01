using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Wixi.Modules.Core.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddLandingContentWave2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "WIXI_CASE_STUDIES",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClientSlug = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ClientInitials = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    ClientLogoUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Industry = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Metric1Value = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Metric2Value = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsFeatured = table.Column<bool>(type: "bit", nullable: false),
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
                    table.PrimaryKey("PK_WIXI_CASE_STUDIES", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_CHANGELOG_ENTRIES",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Version = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ReleaseDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Tag = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
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
                    table.PrimaryKey("PK_WIXI_CHANGELOG_ENTRIES", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_COMPANY_MILESTONES",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Year = table.Column<short>(type: "smallint", nullable: false),
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
                    table.PrimaryKey("PK_WIXI_COMPANY_MILESTONES", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_ROADMAP_ITEMS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Phase = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    PhaseLabel = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PlannedDate = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    VoteCount = table.Column<int>(type: "int", nullable: false),
                    IsShipped = table.Column<bool>(type: "bit", nullable: false),
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
                    table.PrimaryKey("PK_WIXI_ROADMAP_ITEMS", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_TEAM_MEMBERS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FullName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Initials = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    AvatarUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    AvatarColor = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
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
                    table.PrimaryKey("PK_WIXI_TEAM_MEMBERS", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_CASE_STUDY_TRANSLATIONS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CaseStudyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LanguageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClientName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(400)", maxLength: 400, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Metric1Label = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Metric2Label = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    QuoteText = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    QuoteAuthor = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_CASE_STUDY_TRANSLATIONS", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WIXI_CASE_STUDY_TRANSLATIONS_WIXI_CASE_STUDIES_CaseStudyId",
                        column: x => x.CaseStudyId,
                        principalTable: "WIXI_CASE_STUDIES",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WIXI_CASE_STUDY_TRANSLATIONS_WIXI_LANGUAGES_LanguageId",
                        column: x => x.LanguageId,
                        principalTable: "WIXI_LANGUAGES",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_CHANGELOG_TRANSLATIONS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EntryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LanguageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_CHANGELOG_TRANSLATIONS", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WIXI_CHANGELOG_TRANSLATIONS_WIXI_CHANGELOG_ENTRIES_EntryId",
                        column: x => x.EntryId,
                        principalTable: "WIXI_CHANGELOG_ENTRIES",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WIXI_CHANGELOG_TRANSLATIONS_WIXI_LANGUAGES_LanguageId",
                        column: x => x.LanguageId,
                        principalTable: "WIXI_LANGUAGES",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_COMPANY_MILESTONE_TRANSLATIONS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MilestoneId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LanguageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_COMPANY_MILESTONE_TRANSLATIONS", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WIXI_COMPANY_MILESTONE_TRANSLATIONS_WIXI_COMPANY_MILESTONES_MilestoneId",
                        column: x => x.MilestoneId,
                        principalTable: "WIXI_COMPANY_MILESTONES",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WIXI_COMPANY_MILESTONE_TRANSLATIONS_WIXI_LANGUAGES_LanguageId",
                        column: x => x.LanguageId,
                        principalTable: "WIXI_LANGUAGES",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_ROADMAP_ITEM_TRANSLATIONS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LanguageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_ROADMAP_ITEM_TRANSLATIONS", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WIXI_ROADMAP_ITEM_TRANSLATIONS_WIXI_LANGUAGES_LanguageId",
                        column: x => x.LanguageId,
                        principalTable: "WIXI_LANGUAGES",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WIXI_ROADMAP_ITEM_TRANSLATIONS_WIXI_ROADMAP_ITEMS_ItemId",
                        column: x => x.ItemId,
                        principalTable: "WIXI_ROADMAP_ITEMS",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_ROADMAP_VOTES",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SessionToken = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    IpHash = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true),
                    VotedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_ROADMAP_VOTES", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WIXI_ROADMAP_VOTES_WIXI_ROADMAP_ITEMS_ItemId",
                        column: x => x.ItemId,
                        principalTable: "WIXI_ROADMAP_ITEMS",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_TEAM_MEMBER_TRANSLATIONS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MemberId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LanguageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Department = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_TEAM_MEMBER_TRANSLATIONS", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WIXI_TEAM_MEMBER_TRANSLATIONS_WIXI_LANGUAGES_LanguageId",
                        column: x => x.LanguageId,
                        principalTable: "WIXI_LANGUAGES",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WIXI_TEAM_MEMBER_TRANSLATIONS_WIXI_TEAM_MEMBERS_MemberId",
                        column: x => x.MemberId,
                        principalTable: "WIXI_TEAM_MEMBERS",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_CASE_STUDIES_ClientSlug",
                table: "WIXI_CASE_STUDIES",
                column: "ClientSlug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_CASE_STUDY_TRANSLATIONS_CaseStudyId",
                table: "WIXI_CASE_STUDY_TRANSLATIONS",
                column: "CaseStudyId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_CASE_STUDY_TRANSLATIONS_LanguageId",
                table: "WIXI_CASE_STUDY_TRANSLATIONS",
                column: "LanguageId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_CHANGELOG_TRANSLATIONS_EntryId",
                table: "WIXI_CHANGELOG_TRANSLATIONS",
                column: "EntryId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_CHANGELOG_TRANSLATIONS_LanguageId",
                table: "WIXI_CHANGELOG_TRANSLATIONS",
                column: "LanguageId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_COMPANY_MILESTONE_TRANSLATIONS_LanguageId",
                table: "WIXI_COMPANY_MILESTONE_TRANSLATIONS",
                column: "LanguageId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_COMPANY_MILESTONE_TRANSLATIONS_MilestoneId",
                table: "WIXI_COMPANY_MILESTONE_TRANSLATIONS",
                column: "MilestoneId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_ROADMAP_ITEM_TRANSLATIONS_ItemId",
                table: "WIXI_ROADMAP_ITEM_TRANSLATIONS",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_ROADMAP_ITEM_TRANSLATIONS_LanguageId",
                table: "WIXI_ROADMAP_ITEM_TRANSLATIONS",
                column: "LanguageId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_ROADMAP_VOTES_ItemId_SessionToken",
                table: "WIXI_ROADMAP_VOTES",
                columns: new[] { "ItemId", "SessionToken" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_TEAM_MEMBER_TRANSLATIONS_LanguageId",
                table: "WIXI_TEAM_MEMBER_TRANSLATIONS",
                column: "LanguageId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_TEAM_MEMBER_TRANSLATIONS_MemberId",
                table: "WIXI_TEAM_MEMBER_TRANSLATIONS",
                column: "MemberId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WIXI_CASE_STUDY_TRANSLATIONS");

            migrationBuilder.DropTable(
                name: "WIXI_CHANGELOG_TRANSLATIONS");

            migrationBuilder.DropTable(
                name: "WIXI_COMPANY_MILESTONE_TRANSLATIONS");

            migrationBuilder.DropTable(
                name: "WIXI_ROADMAP_ITEM_TRANSLATIONS");

            migrationBuilder.DropTable(
                name: "WIXI_ROADMAP_VOTES");

            migrationBuilder.DropTable(
                name: "WIXI_TEAM_MEMBER_TRANSLATIONS");

            migrationBuilder.DropTable(
                name: "WIXI_CASE_STUDIES");

            migrationBuilder.DropTable(
                name: "WIXI_CHANGELOG_ENTRIES");

            migrationBuilder.DropTable(
                name: "WIXI_COMPANY_MILESTONES");

            migrationBuilder.DropTable(
                name: "WIXI_ROADMAP_ITEMS");

            migrationBuilder.DropTable(
                name: "WIXI_TEAM_MEMBERS");
        }
    }
}
