using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Wixi.Modules.Core.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCoreReferenceDataPhase1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "WIXI_INCOTERMS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(5)", maxLength: 5, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    DescriptionEn = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Group = table.Column<int>(type: "int", nullable: false),
                    SellerPaysFreight = table.Column<bool>(type: "bit", nullable: false),
                    SellerPaysInsurance = table.Column<bool>(type: "bit", nullable: false),
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
                    table.PrimaryKey("PK_WIXI_INCOTERMS", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_PACKAGE_TYPES",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Symbol = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    IsStackable = table.Column<bool>(type: "bit", nullable: false),
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
                    table.PrimaryKey("PK_WIXI_PACKAGE_TYPES", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_PAYMENT_TERMS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    DueDays = table.Column<int>(type: "int", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
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
                    table.PrimaryKey("PK_WIXI_PAYMENT_TERMS", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_PORTS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UnLocode = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    CountryCode = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    CityName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Type = table.Column<int>(type: "int", nullable: false),
                    IsTurkish = table.Column<bool>(type: "bit", nullable: false),
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
                    table.PrimaryKey("PK_WIXI_PORTS", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_REGIONS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
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
                    table.PrimaryKey("PK_WIXI_REGIONS", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_TAX_OFFICES",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    CityName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CountryCode = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: true),
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
                    table.PrimaryKey("PK_WIXI_TAX_OFFICES", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_TRANSPORT_MODES",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Icon = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ColorHex = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
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
                    table.PrimaryKey("PK_WIXI_TRANSPORT_MODES", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_INCOTERMS_Code",
                table: "WIXI_INCOTERMS",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_PACKAGE_TYPES_Code",
                table: "WIXI_PACKAGE_TYPES",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_PAYMENT_TERMS_Code",
                table: "WIXI_PAYMENT_TERMS",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_PORTS_UnLocode",
                table: "WIXI_PORTS",
                column: "UnLocode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_REGIONS_Code",
                table: "WIXI_REGIONS",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_TAX_OFFICES_Code",
                table: "WIXI_TAX_OFFICES",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_TRANSPORT_MODES_Code",
                table: "WIXI_TRANSPORT_MODES",
                column: "Code",
                unique: true);

            // ── Seed: WIXI_REGIONS ──────────────────────────────────────────────
            migrationBuilder.InsertData(
                table: "WIXI_REGIONS",
                columns: new[] { "Id", "Code", "Name", "NameEn", "Description", "SortOrder", "IsActive", "IsDeleted", "CreatedAt", "CreatedByUser", "UpdatedAt", "UpdatedByUser" },
                values: new object[,]
                {
                    { new Guid("a1000001-0000-0000-0000-000000000001"), "MARMARA",   "Marmara",          "Marmara",          null, 1,  true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a1000001-0000-0000-0000-000000000002"), "EGE",       "Ege",              "Aegean",           null, 2,  true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a1000001-0000-0000-0000-000000000003"), "AKDENIZ",   "Akdeniz",          "Mediterranean",    null, 3,  true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a1000001-0000-0000-0000-000000000004"), "KARADENIZ", "Karadeniz",        "Black Sea",        null, 4,  true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a1000001-0000-0000-0000-000000000005"), "ICANADOLU", "İç Anadolu",       "Central Anatolia", null, 5,  true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a1000001-0000-0000-0000-000000000006"), "DANADOLU",  "Doğu Anadolu",     "Eastern Anatolia", null, 6,  true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a1000001-0000-0000-0000-000000000007"), "GANADOLU",  "Güneydoğu Anadolu","Southeastern Anatolia", null, 7, true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a1000001-0000-0000-0000-000000000008"), "AVRUPA",    "Avrupa",           "Europe",           null, 8,  true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a1000001-0000-0000-0000-000000000009"), "ORTADOGU",  "Ortadoğu",         "Middle East",      null, 9,  true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a1000001-0000-0000-0000-000000000010"), "ASYA",      "Asya",             "Asia",             null, 10, true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                });

            // ── Seed: WIXI_PORTS ────────────────────────────────────────────────
            // PortType: Sea=1, Air=2
            migrationBuilder.InsertData(
                table: "WIXI_PORTS",
                columns: new[] { "Id", "UnLocode", "Name", "NameEn", "CountryCode", "CityName", "Type", "IsTurkish", "SortOrder", "IsActive", "IsDeleted", "CreatedAt", "CreatedByUser", "UpdatedAt", "UpdatedByUser" },
                values: new object[,]
                {
                    { new Guid("a2000002-0000-0000-0000-000000000001"), "TRIST", "Ambarlı Limanı",       "Ambarlı Port",         "TR", "İstanbul", 1, true, 1, true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a2000002-0000-0000-0000-000000000002"), "TRMRN", "Mersin Limanı",        "Mersin Port",          "TR", "Mersin",   1, true, 2, true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a2000002-0000-0000-0000-000000000003"), "TRIZM", "İzmir Alsancak Limanı","Izmir Alsancak Port",  "TR", "İzmir",    1, true, 3, true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a2000002-0000-0000-0000-000000000004"), "TRIGL", "Derince Limanı",       "Derince Port",         "TR", "İzmit",    1, true, 4, true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a2000002-0000-0000-0000-000000000005"), "TRTZI", "Trabzon Limanı",       "Trabzon Port",         "TR", "Trabzon",  1, true, 5, true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a2000002-0000-0000-0000-000000000006"), "TRISB", "İstanbul Havalimanı",  "Istanbul Airport",     "TR", "İstanbul", 2, true, 6, true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a2000002-0000-0000-0000-000000000007"), "TRSAW", "Sabiha Gökçen",        "Sabiha Gokcen Airport","TR", "İstanbul", 2, true, 7, true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a2000002-0000-0000-0000-000000000008"), "TRADB", "Adana Havalimanı",     "Adana Airport",        "TR", "Adana",    2, true, 8, true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a2000002-0000-0000-0000-000000000009"), "TRLGZ", "Esenboğa Havalimanı",  "Esenboga Airport",     "TR", "Ankara",   2, true, 9, true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                });

            // ── Seed: WIXI_PAYMENT_TERMS ────────────────────────────────────────
            // PaymentTermType: Advance=1, Net=2, DocumentaryCredit=3, DocumentaryCollection=4
            migrationBuilder.InsertData(
                table: "WIXI_PAYMENT_TERMS",
                columns: new[] { "Id", "Code", "Name", "NameEn", "DueDays", "Type", "Description", "SortOrder", "IsActive", "IsDeleted", "CreatedAt", "CreatedByUser", "UpdatedAt", "UpdatedByUser" },
                values: new object[,]
                {
                    { new Guid("a3000003-0000-0000-0000-000000000001"), "ADVANCE", "Peşin",        "Advance",                  0,  1, "Ödeme mal tesliminden önce yapılır.", 1, true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a3000003-0000-0000-0000-000000000002"), "NET_30",  "Net 30 Gün",   "Net 30 Days",              30, 2, "Fatura tarihinden 30 gün içinde ödeme.",  2, true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a3000003-0000-0000-0000-000000000003"), "NET_60",  "Net 60 Gün",   "Net 60 Days",              60, 2, "Fatura tarihinden 60 gün içinde ödeme.",  3, true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a3000003-0000-0000-0000-000000000004"), "NET_90",  "Net 90 Gün",   "Net 90 Days",              90, 2, "Fatura tarihinden 90 gün içinde ödeme.",  4, true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a3000003-0000-0000-0000-000000000005"), "LC",      "Akreditif",    "Letter of Credit",          0, 3, "Banka garantili belgeye dayalı ödeme.",   5, true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a3000003-0000-0000-0000-000000000006"), "CAD",     "Vesaik Mukabili","Cash Against Documents",  0, 4, "Belgeler karşılığında nakit ödeme.",      6, true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                });

            // ── Seed: WIXI_TAX_OFFICES ──────────────────────────────────────────
            migrationBuilder.InsertData(
                table: "WIXI_TAX_OFFICES",
                columns: new[] { "Id", "Code", "Name", "CityName", "CountryCode", "SortOrder", "IsActive", "IsDeleted", "CreatedAt", "CreatedByUser", "UpdatedAt", "UpdatedByUser" },
                values: new object[,]
                {
                    { new Guid("a4000004-0000-0000-0000-000000000001"), "BUYUKMD",    "Büyük Mükellefler VD", "İstanbul", "TR", 1,  true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a4000004-0000-0000-0000-000000000002"), "BAKIRKOYVD", "Bakırköy VD",          "İstanbul", "TR", 2,  true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a4000004-0000-0000-0000-000000000003"), "KADIKOY",    "Kadıköy VD",           "İstanbul", "TR", 3,  true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a4000004-0000-0000-0000-000000000004"), "BESIKTAS",   "Beşiktaş VD",          "İstanbul", "TR", 4,  true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a4000004-0000-0000-0000-000000000005"), "SISLI",      "Şişli VD",             "İstanbul", "TR", 5,  true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a4000004-0000-0000-0000-000000000006"), "MALTEPE",    "Maltepe VD",           "İstanbul", "TR", 6,  true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a4000004-0000-0000-0000-000000000007"), "USKUDAR",    "Üsküdar VD",           "İstanbul", "TR", 7,  true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a4000004-0000-0000-0000-000000000008"), "ANKARABYK",  "Büyük Mükellefler VD", "Ankara",   "TR", 8,  true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a4000004-0000-0000-0000-000000000009"), "KIZILAY",    "Kızılay VD",           "Ankara",   "TR", 9,  true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a4000004-0000-0000-0000-000000000010"), "IZMIR",      "İzmir VD",             "İzmir",    "TR", 10, true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                });

            // ── Seed: WIXI_INCOTERMS ────────────────────────────────────────────
            // IncotermGroup: AnyMode=1, SeaInland=2
            migrationBuilder.InsertData(
                table: "WIXI_INCOTERMS",
                columns: new[] { "Id", "Code", "Name", "NameEn", "Description", "DescriptionEn", "Group", "SellerPaysFreight", "SellerPaysInsurance", "SortOrder", "IsActive", "IsDeleted", "CreatedAt", "CreatedByUser", "UpdatedAt", "UpdatedByUser" },
                values: new object[,]
                {
                    { new Guid("a5000005-0000-0000-0000-000000000001"), "EXW", "İşyerinde Teslim",                "Ex Works",                   "Satıcı malı kendi tesisinde teslim eder; tüm taşıma ve sigorta masrafları alıcıya aittir.",                         "Seller makes goods available at their premises; all costs and risks pass to buyer.",                             1, false, false, 1,  true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a5000005-0000-0000-0000-000000000002"), "FCA", "Taşıyıcıya Teslim",              "Free Carrier",               "Satıcı malı belirlenen yerde taşıyıcıya teslim eder; o noktadan itibaren risk alıcıya geçer.",                        "Seller delivers goods to a named carrier at a named place; risk transfers at that point.",                       1, false, false, 2,  true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a5000005-0000-0000-0000-000000000003"), "CPT", "Taşıma Ücreti Ödenmiş Teslim",   "Carriage Paid To",           "Satıcı taşıma ücretini öder; risk taşıyıcıya teslimde alıcıya geçer.",                                                "Seller pays freight to named destination; risk transfers to buyer upon delivery to carrier.",                     1, true,  false, 3,  true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a5000005-0000-0000-0000-000000000004"), "CIP", "Taşıma ve Sigorta Ödenmiş Teslim","Carriage And Insurance Paid", "Satıcı taşıma ve sigortayı öder; risk taşıyıcıya teslimde alıcıya geçer.",                                           "Seller pays freight and insurance to named destination; risk transfers upon delivery to carrier.",                1, true,  true,  4,  true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a5000005-0000-0000-0000-000000000005"), "DAP", "Belirlenen Yerde Teslim",         "Delivered At Place",         "Satıcı malı belirlenen yerde boşaltmaya hazır şekilde teslim eder; ithalat vergileri alıcıya aittir.",                  "Seller delivers goods ready for unloading at named destination; import duties are for buyer's account.",         1, true,  false, 5,  true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a5000005-0000-0000-0000-000000000006"), "DPU", "Boşaltılmış Teslim",             "Delivered At Place Unloaded","Satıcı malı belirlenen yerde boşaltarak teslim eder.",                                                                   "Seller delivers and unloads goods at named destination.",                                                        1, true,  false, 6,  true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a5000005-0000-0000-0000-000000000007"), "DDP", "Gümrük Vergileri Ödenmiş Teslim","Delivered Duty Paid",        "Satıcı tüm masrafları ve vergileri üstlenerek malı alıcıya teslim eder.",                                               "Seller bears all costs and duties delivering goods cleared for import to named destination.",                    1, true,  true,  7,  true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a5000005-0000-0000-0000-000000000008"), "FAS", "Gemi Yanında Teslim",             "Free Alongside Ship",        "Satıcı malı belirtilen limanda gemi yanına teslim eder; yükleme masrafları alıcıya aittir.",                            "Seller delivers goods alongside named vessel at port; loading costs are for buyer's account.",                   2, false, false, 8,  true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a5000005-0000-0000-0000-000000000009"), "FOB", "Gemi Bordasında Teslim",          "Free On Board",              "Satıcı malı gemiye yükleyerek teslim eder; yüklemeden itibaren risk alıcıya geçer.",                                    "Seller loads goods on board named vessel; risk transfers to buyer once on board.",                               2, false, false, 9,  true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a5000005-0000-0000-0000-000000000010"), "CFR", "Navlun Dahil Teslim",             "Cost And Freight",           "Satıcı navlun ücretini öder; sigorta alıcı sorumluluğundadır.",                                                         "Seller pays freight to named port; insurance is buyer's responsibility.",                                        2, true,  false, 10, true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a5000005-0000-0000-0000-000000000011"), "CIF", "Navlun ve Sigorta Dahil Teslim",  "Cost Insurance Freight",     "Satıcı navlun ve sigortayı öder; risk yükleme sırasında alıcıya geçer.",                                                 "Seller pays freight and insurance to named port; risk transfers to buyer upon loading.",                         2, true,  true,  11, true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                });

            // ── Seed: WIXI_TRANSPORT_MODES ──────────────────────────────────────
            migrationBuilder.InsertData(
                table: "WIXI_TRANSPORT_MODES",
                columns: new[] { "Id", "Code", "Name", "NameEn", "Icon", "ColorHex", "SortOrder", "IsActive", "IsDeleted", "CreatedAt", "CreatedByUser", "UpdatedAt", "UpdatedByUser" },
                values: new object[,]
                {
                    { new Guid("a6000006-0000-0000-0000-000000000001"), "AIR",     "Hava",   "Air",     "plane",       "#3B82F6", 1, true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a6000006-0000-0000-0000-000000000002"), "SEA",     "Deniz",  "Sea",     "ship",        "#0EA5E9", 2, true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a6000006-0000-0000-0000-000000000003"), "ROAD",    "Kara",   "Road",    "truck",       "#F59E0B", 3, true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a6000006-0000-0000-0000-000000000004"), "RAIL",    "Demir",  "Rail",    "train-front", "#8B5CF6", 4, true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a6000006-0000-0000-0000-000000000005"), "COURIER", "Kurye",  "Courier", "package",     "#10B981", 5, true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                });

            // ── Seed: WIXI_PACKAGE_TYPES ────────────────────────────────────────
            migrationBuilder.InsertData(
                table: "WIXI_PACKAGE_TYPES",
                columns: new[] { "Id", "Code", "Name", "NameEn", "Symbol", "IsStackable", "SortOrder", "IsActive", "IsDeleted", "CreatedAt", "CreatedByUser", "UpdatedAt", "UpdatedByUser" },
                values: new object[,]
                {
                    { new Guid("a7000007-0000-0000-0000-000000000001"), "PLT",    "Palet",         "Pallet",       "PLT", true,  1, true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a7000007-0000-0000-0000-000000000002"), "BOX",    "Koli",          "Box",          "CTN", true,  2, true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a7000007-0000-0000-0000-000000000003"), "DRUM",   "Varil",         "Drum",         "DRM", false, 3, true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a7000007-0000-0000-0000-000000000004"), "BAG",    "Çuval",         "Bag",          "BAG", false, 4, true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a7000007-0000-0000-0000-000000000005"), "CRATE",  "Ahşap Sandık",  "Wooden Crate", "CRT", false, 5, true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a7000007-0000-0000-0000-000000000006"), "BIGBAG", "Big Bag",       "Big Bag",      "BB",  false, 6, true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                    { new Guid("a7000007-0000-0000-0000-000000000007"), "REEL",   "Makara",        "Reel",         "REL", false, 7, true, false, new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc), "System", null, null },
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WIXI_INCOTERMS");

            migrationBuilder.DropTable(
                name: "WIXI_PACKAGE_TYPES");

            migrationBuilder.DropTable(
                name: "WIXI_PAYMENT_TERMS");

            migrationBuilder.DropTable(
                name: "WIXI_PORTS");

            migrationBuilder.DropTable(
                name: "WIXI_REGIONS");

            migrationBuilder.DropTable(
                name: "WIXI_TAX_OFFICES");

            migrationBuilder.DropTable(
                name: "WIXI_TRANSPORT_MODES");
        }
    }
}
