using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace wixi.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddTekstilModuleTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Languages Table
            migrationBuilder.CreateTable(
                name: "wixi_Tekstil_Languages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NativeName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    FlagIcon = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDefault = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_Tekstil_Languages", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Tekstil_Languages_Code",
                table: "wixi_Tekstil_Languages",
                column: "Code",
                unique: true);

            // Seed Languages
            var seedDate = DateTime.UtcNow;
            migrationBuilder.InsertData(
                table: "wixi_Tekstil_Languages",
                columns: new[] { "Code", "Name", "NativeName", "FlagIcon", "IsDefault", "IsActive", "DisplayOrder", "CreatedAt", "UpdatedAt" },
                values: new object[,]
                {
                    { "tr", "Turkish", "Türkçe", "🇹🇷", true, true, 1, seedDate, seedDate },
                    { "en", "English", "English", "🇬🇧", false, true, 2, seedDate, seedDate },
                    { "de", "German", "Deutsch", "🇩🇪", false, true, 3, seedDate, seedDate }
                });

            // About Table
            migrationBuilder.CreateTable(
                name: "wixi_Tekstil_About",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MissionTitle = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    MissionDescription = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    VisionTitle = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    VisionDescription = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: false),
                    UpdatedBy = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_Tekstil_About", x => x.Id);
                });

            // About Translations Table
            migrationBuilder.CreateTable(
                name: "wixi_Tekstil_About_Translations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AboutId = table.Column<int>(type: "int", nullable: false),
                    LanguageCode = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MissionTitle = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    MissionDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    VisionTitle = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    VisionDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TranslatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_Tekstil_About_Translations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_wixi_Tekstil_About_Translations_wixi_Tekstil_About_AboutId",
                        column: x => x.AboutId,
                        principalTable: "wixi_Tekstil_About",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_wixi_Tekstil_About_Translations_wixi_Tekstil_Languages_LanguageCode",
                        column: x => x.LanguageCode,
                        principalTable: "wixi_Tekstil_Languages",
                        principalColumn: "Code",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Tekstil_About_Translations_AboutId_LanguageCode",
                table: "wixi_Tekstil_About_Translations",
                columns: new[] { "AboutId", "LanguageCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Tekstil_About_Translations_LanguageCode",
                table: "wixi_Tekstil_About_Translations",
                column: "LanguageCode");

            // Contact Info Table
            migrationBuilder.CreateTable(
                name: "wixi_Tekstil_ContactInfo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Phone1 = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Phone2 = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Email1 = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email2 = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Address = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    City = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    District = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PostalCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    MapLatitude = table.Column<decimal>(type: "decimal(10,8)", nullable: true),
                    MapLongitude = table.Column<decimal>(type: "decimal(11,8)", nullable: true),
                    MapZoomLevel = table.Column<int>(type: "int", nullable: false),
                    WhatsAppNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    SocialMediaLinks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_Tekstil_ContactInfo", x => x.Id);
                });

            // Contact Submissions Table
            migrationBuilder.CreateTable(
                name: "wixi_Tekstil_ContactSubmissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FullName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Subject = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Priority = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    AssignedTo = table.Column<int>(type: "int", nullable: true),
                    AssignedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ResponseMessage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ResponseDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ResponseBy = table.Column<int>(type: "int", nullable: true),
                    FollowUpDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Tags = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Source = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    LanguageCode = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    IpAddress = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    UserAgent = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ReferrerUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_Tekstil_ContactSubmissions", x => x.Id);
                });

            // NOTE: Diğer tablolar (Stats, Products, Projects, vb.) sonraki migration'larda eklenecek
            // Bu migration sadece temel tabloları oluşturuyor
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "wixi_Tekstil_About_Translations");
            migrationBuilder.DropTable(name: "wixi_Tekstil_About");
            migrationBuilder.DropTable(name: "wixi_Tekstil_ContactSubmissions");
            migrationBuilder.DropTable(name: "wixi_Tekstil_ContactInfo");
            migrationBuilder.DropTable(name: "wixi_Tekstil_Languages");
        }
    }
}
