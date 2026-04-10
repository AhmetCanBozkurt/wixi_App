using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace wixi.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddContentModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "wixi_ContentSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FooterCompanyDescDe = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FooterCompanyDescTr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FooterCompanyDescEn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FooterCompanyDescAr = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FacebookUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    InstagramUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TwitterUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LinkedInUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AboutMissionText1De = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AboutMissionText1Tr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AboutMissionText1En = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AboutMissionText1Ar = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AboutMissionText2De = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AboutMissionText2Tr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AboutMissionText2En = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AboutMissionText2Ar = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ContactPhone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ContactEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    AddressGermany = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AddressTurkeyMersin = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AddressTurkeyIstanbul = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_ContentSettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "wixi_NewsItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TitleDe = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    TitleTr = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    TitleEn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TitleAr = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ExcerptDe = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExcerptTr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExcerptEn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ExcerptAr = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ContentDe = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ContentTr = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ContentEn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ContentAr = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Featured = table.Column<bool>(type: "bit", nullable: false),
                    PublishedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Slug = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_NewsItems", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "wixi_SystemSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SiteName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    SiteUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    AdminEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_SystemSettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "wixi_TeamMembers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Slug = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Experience = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PositionDe = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    PositionTr = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    PositionEn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LocationDe = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    LocationTr = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    LocationEn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EducationDe = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EducationTr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EducationEn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BioDe = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BioTr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BioEn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhilosophyDe = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhilosophyTr = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhilosophyEn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SpecializationsDe = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SpecializationsTr = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SpecializationsEn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LanguagesDe = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LanguagesTr = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LanguagesEn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AchievementsDe = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AchievementsTr = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AchievementsEn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_TeamMembers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "wixi_Translations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Key = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    De = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Tr = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    En = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Ar = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_Translations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "wixi_UserPreferences",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Language = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Theme = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_UserPreferences", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_wixi_NewsItems_Category",
                table: "wixi_NewsItems",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_NewsItems_Featured",
                table: "wixi_NewsItems",
                column: "Featured");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_NewsItems_IsActive",
                table: "wixi_NewsItems",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_NewsItems_PublishedAt",
                table: "wixi_NewsItems",
                column: "PublishedAt");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_NewsItems_Slug",
                table: "wixi_NewsItems",
                column: "Slug",
                unique: true,
                filter: "[Slug] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_TeamMembers_DisplayOrder",
                table: "wixi_TeamMembers",
                column: "DisplayOrder");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_TeamMembers_IsActive",
                table: "wixi_TeamMembers",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_TeamMembers_Slug",
                table: "wixi_TeamMembers",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Translations_Key",
                table: "wixi_Translations",
                column: "Key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_wixi_UserPreferences_UserId",
                table: "wixi_UserPreferences",
                column: "UserId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "wixi_ContentSettings");

            migrationBuilder.DropTable(
                name: "wixi_NewsItems");

            migrationBuilder.DropTable(
                name: "wixi_SystemSettings");

            migrationBuilder.DropTable(
                name: "wixi_TeamMembers");

            migrationBuilder.DropTable(
                name: "wixi_Translations");

            migrationBuilder.DropTable(
                name: "wixi_UserPreferences");
        }
    }
}
