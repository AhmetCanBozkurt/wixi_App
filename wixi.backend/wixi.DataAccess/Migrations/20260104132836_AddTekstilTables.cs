using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace wixi.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddTekstilTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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

            migrationBuilder.CreateTable(
                name: "wixi_Tekstil_ContactInfo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Address = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    WorkingHoursWeekday = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    WorkingHoursSaturday = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    WorkingHoursSunday = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Phone1 = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Phone2 = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Email1 = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email2 = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    City = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    District = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PostalCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    MapLatitude = table.Column<decimal>(type: "decimal(10,8)", nullable: true),
                    MapLongitude = table.Column<decimal>(type: "decimal(11,8)", nullable: true),
                    MapZoomLevel = table.Column<int>(type: "int", nullable: false),
                    WhatsAppNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    WhatsAppDefaultMessage = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    SocialMediaLinks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_Tekstil_ContactInfo", x => x.Id);
                });

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
                    table.UniqueConstraint("AK_wixi_Tekstil_Languages_Code", x => x.Code);
                });

            migrationBuilder.CreateTable(
                name: "wixi_Tekstil_ProductCategories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Slug = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    IconName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ParentCategoryId = table.Column<int>(type: "int", nullable: true),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    MetaTitle = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    MetaDescription = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: false),
                    UpdatedBy = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_Tekstil_ProductCategories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_wixi_Tekstil_ProductCategories_wixi_Tekstil_ProductCategories_ParentCategoryId",
                        column: x => x.ParentCategoryId,
                        principalTable: "wixi_Tekstil_ProductCategories",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "wixi_Tekstil_ProjectCategories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Slug = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Color = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    IconName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_Tekstil_ProjectCategories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "wixi_Tekstil_Stats",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Label = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Value = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IconName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_Tekstil_Stats", x => x.Id);
                });

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
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
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

            migrationBuilder.CreateTable(
                name: "wixi_Tekstil_ContactInfo_Translations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ContactInfoId = table.Column<int>(type: "int", nullable: false),
                    LanguageCode = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    CompanyName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Address = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    WorkingHoursWeekday = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    WorkingHoursSaturday = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    WorkingHoursSunday = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    WhatsAppDefaultMessage = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_Tekstil_ContactInfo_Translations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_wixi_Tekstil_ContactInfo_Translations_wixi_Tekstil_ContactInfo_ContactInfoId",
                        column: x => x.ContactInfoId,
                        principalTable: "wixi_Tekstil_ContactInfo",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_wixi_Tekstil_ContactInfo_Translations_wixi_Tekstil_Languages_LanguageCode",
                        column: x => x.LanguageCode,
                        principalTable: "wixi_Tekstil_Languages",
                        principalColumn: "Code",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "wixi_Tekstil_ProductCategories_Translations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CategoryId = table.Column<int>(type: "int", nullable: false),
                    LanguageCode = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    MetaTitle = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    MetaDescription = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_Tekstil_ProductCategories_Translations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_wixi_Tekstil_ProductCategories_Translations_wixi_Tekstil_Languages_LanguageCode",
                        column: x => x.LanguageCode,
                        principalTable: "wixi_Tekstil_Languages",
                        principalColumn: "Code",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_wixi_Tekstil_ProductCategories_Translations_wixi_Tekstil_ProductCategories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "wixi_Tekstil_ProductCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "wixi_Tekstil_Products",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CategoryId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ShortDescription = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Slug = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    SKU = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    DiscountPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    MinOrderQuantity = table.Column<int>(type: "int", nullable: false),
                    PrimaryImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    PrimaryImageAlt = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Features = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Specifications = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StockQuantity = table.Column<int>(type: "int", nullable: false),
                    IsInStock = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsFeatured = table.Column<bool>(type: "bit", nullable: false),
                    IsNew = table.Column<bool>(type: "bit", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    ViewCount = table.Column<int>(type: "int", nullable: false),
                    MetaTitle = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    MetaDescription = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    MetaKeywords = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: false),
                    UpdatedBy = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_Tekstil_Products", x => x.Id);
                    table.ForeignKey(
                        name: "FK_wixi_Tekstil_Products_wixi_Tekstil_ProductCategories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "wixi_Tekstil_ProductCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "wixi_Tekstil_ProjectCategories_Translations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CategoryId = table.Column<int>(type: "int", nullable: false),
                    LanguageCode = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_Tekstil_ProjectCategories_Translations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_wixi_Tekstil_ProjectCategories_Translations_wixi_Tekstil_Languages_LanguageCode",
                        column: x => x.LanguageCode,
                        principalTable: "wixi_Tekstil_Languages",
                        principalColumn: "Code",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_wixi_Tekstil_ProjectCategories_Translations_wixi_Tekstil_ProjectCategories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "wixi_Tekstil_ProjectCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "wixi_Tekstil_Projects",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CategoryId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ClientName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Slug = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    PrimaryImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    PrimaryImageAlt = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Year = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: true),
                    Duration = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Budget = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    CompletionDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsFeatured = table.Column<bool>(type: "bit", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    ViewCount = table.Column<int>(type: "int", nullable: false),
                    MetaTitle = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    MetaDescription = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: false),
                    UpdatedBy = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_Tekstil_Projects", x => x.Id);
                    table.ForeignKey(
                        name: "FK_wixi_Tekstil_Projects_wixi_Tekstil_ProjectCategories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "wixi_Tekstil_ProjectCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "wixi_Tekstil_Stats_Translations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StatId = table.Column<int>(type: "int", nullable: false),
                    LanguageCode = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Label = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_Tekstil_Stats_Translations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_wixi_Tekstil_Stats_Translations_wixi_Tekstil_Languages_LanguageCode",
                        column: x => x.LanguageCode,
                        principalTable: "wixi_Tekstil_Languages",
                        principalColumn: "Code",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_wixi_Tekstil_Stats_Translations_wixi_Tekstil_Stats_StatId",
                        column: x => x.StatId,
                        principalTable: "wixi_Tekstil_Stats",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "wixi_Tekstil_ProductImages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ImageAlt = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ImageTitle = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    IsPrimary = table.Column<bool>(type: "bit", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_Tekstil_ProductImages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_wixi_Tekstil_ProductImages_wixi_Tekstil_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "wixi_Tekstil_Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "wixi_Tekstil_Products_Translations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    LanguageCode = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ShortDescription = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Features = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Specifications = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MetaTitle = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    MetaDescription = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    MetaKeywords = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_Tekstil_Products_Translations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_wixi_Tekstil_Products_Translations_wixi_Tekstil_Languages_LanguageCode",
                        column: x => x.LanguageCode,
                        principalTable: "wixi_Tekstil_Languages",
                        principalColumn: "Code",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_wixi_Tekstil_Products_Translations_wixi_Tekstil_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "wixi_Tekstil_Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "wixi_Tekstil_ProjectImages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ImageAlt = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ImageTitle = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    IsPrimary = table.Column<bool>(type: "bit", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_Tekstil_ProjectImages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_wixi_Tekstil_ProjectImages_wixi_Tekstil_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "wixi_Tekstil_Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "wixi_Tekstil_Projects_Translations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    LanguageCode = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ClientName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MetaTitle = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    MetaDescription = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_Tekstil_Projects_Translations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_wixi_Tekstil_Projects_Translations_wixi_Tekstil_Languages_LanguageCode",
                        column: x => x.LanguageCode,
                        principalTable: "wixi_Tekstil_Languages",
                        principalColumn: "Code",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_wixi_Tekstil_Projects_Translations_wixi_Tekstil_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "wixi_Tekstil_Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "wixi_Tekstil_ProjectTags",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    TagName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_Tekstil_ProjectTags", x => x.Id);
                    table.ForeignKey(
                        name: "FK_wixi_Tekstil_ProjectTags_wixi_Tekstil_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "wixi_Tekstil_Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "wixi_Tekstil_Languages",
                columns: new[] { "Id", "Code", "CreatedAt", "DisplayOrder", "FlagIcon", "IsActive", "IsDefault", "Name", "NativeName", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, "tr", new DateTime(2026, 1, 4, 12, 0, 0, 0, DateTimeKind.Utc), 1, "🇹🇷", true, true, "Turkish", "Türkçe", new DateTime(2026, 1, 4, 12, 0, 0, 0, DateTimeKind.Utc) },
                    { 2, "en", new DateTime(2026, 1, 4, 12, 0, 0, 0, DateTimeKind.Utc), 2, "🇬🇧", true, false, "English", "English", new DateTime(2026, 1, 4, 12, 0, 0, 0, DateTimeKind.Utc) },
                    { 3, "de", new DateTime(2026, 1, 4, 12, 0, 0, 0, DateTimeKind.Utc), 3, "🇩🇪", true, false, "German", "Deutsch", new DateTime(2026, 1, 4, 12, 0, 0, 0, DateTimeKind.Utc) }
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

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Tekstil_ContactInfo_Translations_ContactInfoId_LanguageCode",
                table: "wixi_Tekstil_ContactInfo_Translations",
                columns: new[] { "ContactInfoId", "LanguageCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Tekstil_ContactInfo_Translations_LanguageCode",
                table: "wixi_Tekstil_ContactInfo_Translations",
                column: "LanguageCode");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Tekstil_ContactSubmissions_CreatedAt",
                table: "wixi_Tekstil_ContactSubmissions",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Tekstil_ContactSubmissions_Status",
                table: "wixi_Tekstil_ContactSubmissions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Tekstil_Languages_Code",
                table: "wixi_Tekstil_Languages",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Tekstil_ProductCategories_ParentCategoryId",
                table: "wixi_Tekstil_ProductCategories",
                column: "ParentCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Tekstil_ProductCategories_Translations_CategoryId_LanguageCode",
                table: "wixi_Tekstil_ProductCategories_Translations",
                columns: new[] { "CategoryId", "LanguageCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Tekstil_ProductCategories_Translations_LanguageCode",
                table: "wixi_Tekstil_ProductCategories_Translations",
                column: "LanguageCode");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Tekstil_ProductImages_ProductId",
                table: "wixi_Tekstil_ProductImages",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Tekstil_Products_CategoryId",
                table: "wixi_Tekstil_Products",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Tekstil_Products_Slug",
                table: "wixi_Tekstil_Products",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Tekstil_Products_Translations_LanguageCode",
                table: "wixi_Tekstil_Products_Translations",
                column: "LanguageCode");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Tekstil_Products_Translations_ProductId_LanguageCode",
                table: "wixi_Tekstil_Products_Translations",
                columns: new[] { "ProductId", "LanguageCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Tekstil_ProjectCategories_Translations_CategoryId_LanguageCode",
                table: "wixi_Tekstil_ProjectCategories_Translations",
                columns: new[] { "CategoryId", "LanguageCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Tekstil_ProjectCategories_Translations_LanguageCode",
                table: "wixi_Tekstil_ProjectCategories_Translations",
                column: "LanguageCode");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Tekstil_ProjectImages_ProjectId",
                table: "wixi_Tekstil_ProjectImages",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Tekstil_Projects_CategoryId",
                table: "wixi_Tekstil_Projects",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Tekstil_Projects_Slug",
                table: "wixi_Tekstil_Projects",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Tekstil_Projects_Translations_LanguageCode",
                table: "wixi_Tekstil_Projects_Translations",
                column: "LanguageCode");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Tekstil_Projects_Translations_ProjectId_LanguageCode",
                table: "wixi_Tekstil_Projects_Translations",
                columns: new[] { "ProjectId", "LanguageCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Tekstil_ProjectTags_ProjectId",
                table: "wixi_Tekstil_ProjectTags",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Tekstil_Stats_Translations_LanguageCode",
                table: "wixi_Tekstil_Stats_Translations",
                column: "LanguageCode");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Tekstil_Stats_Translations_StatId_LanguageCode",
                table: "wixi_Tekstil_Stats_Translations",
                columns: new[] { "StatId", "LanguageCode" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "wixi_Tekstil_About_Translations");

            migrationBuilder.DropTable(
                name: "wixi_Tekstil_ContactInfo_Translations");

            migrationBuilder.DropTable(
                name: "wixi_Tekstil_ContactSubmissions");

            migrationBuilder.DropTable(
                name: "wixi_Tekstil_ProductCategories_Translations");

            migrationBuilder.DropTable(
                name: "wixi_Tekstil_ProductImages");

            migrationBuilder.DropTable(
                name: "wixi_Tekstil_Products_Translations");

            migrationBuilder.DropTable(
                name: "wixi_Tekstil_ProjectCategories_Translations");

            migrationBuilder.DropTable(
                name: "wixi_Tekstil_ProjectImages");

            migrationBuilder.DropTable(
                name: "wixi_Tekstil_Projects_Translations");

            migrationBuilder.DropTable(
                name: "wixi_Tekstil_ProjectTags");

            migrationBuilder.DropTable(
                name: "wixi_Tekstil_Stats_Translations");

            migrationBuilder.DropTable(
                name: "wixi_Tekstil_About");

            migrationBuilder.DropTable(
                name: "wixi_Tekstil_ContactInfo");

            migrationBuilder.DropTable(
                name: "wixi_Tekstil_Products");

            migrationBuilder.DropTable(
                name: "wixi_Tekstil_Projects");

            migrationBuilder.DropTable(
                name: "wixi_Tekstil_Languages");

            migrationBuilder.DropTable(
                name: "wixi_Tekstil_Stats");

            migrationBuilder.DropTable(
                name: "wixi_Tekstil_ProductCategories");

            migrationBuilder.DropTable(
                name: "wixi_Tekstil_ProjectCategories");
        }
    }
}
