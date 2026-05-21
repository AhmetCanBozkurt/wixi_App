using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Wixi.Modules.Core.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddWixiSystemPages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "WIXI_SYSTEM_PAGES",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Path = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Group = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Icon = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_SYSTEM_PAGES", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_SYSTEM_PAGES_Path",
                table: "WIXI_SYSTEM_PAGES",
                column: "Path",
                unique: true);

            var now = new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc);
            migrationBuilder.InsertData(
                table: "WIXI_SYSTEM_PAGES",
                columns: new[] { "Id", "Path", "Name", "Group", "Icon", "SortOrder", "IsActive", "IsDeleted", "CreatedAt", "CreatedByUser", "UpdatedAt", "UpdatedByUser" },
                values: new object[,]
                {
                    // Özel
                    { Guid.Parse("aa000001-0000-0000-0000-000000000001"), "folder", "[ Grup / Klasör / Başlık ]", "Özel", "FaFolder", 0, true, false, now, "System", null, null },
                    // Sistem
                    { Guid.Parse("bb000002-0000-0000-0000-000000000001"), "/admin", "Dashboard (Ana Sayfa)", "Sistem", "FaHome", 1, true, false, now, "System", null, null },
                    { Guid.Parse("bb000002-0000-0000-0000-000000000002"), "/admin/users", "Kullanıcı Yönetimi", "Sistem", "FaUsers", 2, true, false, now, "System", null, null },
                    { Guid.Parse("bb000002-0000-0000-0000-000000000003"), "/admin/roles", "Rol Yönetimi", "Sistem", "FaShieldAlt", 3, true, false, now, "System", null, null },
                    { Guid.Parse("bb000002-0000-0000-0000-000000000004"), "/admin/languages", "Dil Yönetimi", "Sistem", "FaGlobe", 4, true, false, now, "System", null, null },
                    { Guid.Parse("bb000002-0000-0000-0000-000000000005"), "/admin/modules", "Modül Yönetimi", "Sistem", "FaPuzzlePiece", 5, true, false, now, "System", null, null },
                    { Guid.Parse("bb000002-0000-0000-0000-000000000006"), "/admin/mailing", "Mail Yönetimi", "Sistem", "FaEnvelope", 6, true, false, now, "System", null, null },
                    { Guid.Parse("bb000002-0000-0000-0000-000000000007"), "/admin/logs", "Uygulama Logları", "Sistem", "FaStream", 7, true, false, now, "System", null, null },
                    { Guid.Parse("bb000002-0000-0000-0000-000000000008"), "/admin/audit", "Denetim Logları", "Sistem", "FaHistory", 8, true, false, now, "System", null, null },
                    // Tanımlamalar
                    { Guid.Parse("cc000003-0000-0000-0000-000000000001"), "/admin/definitions/system-pages", "Sistem Sayfaları", "Tanımlamalar", "FaSitemap", 1, true, false, now, "System", null, null },
                    { Guid.Parse("cc000003-0000-0000-0000-000000000002"), "/admin/definitions/regions", "Bölge Yönetimi", "Tanımlamalar", "FaMap", 2, true, false, now, "System", null, null },
                    { Guid.Parse("cc000003-0000-0000-0000-000000000003"), "/admin/definitions/ports", "Liman Yönetimi", "Tanımlamalar", "FaShip", 3, true, false, now, "System", null, null },
                    { Guid.Parse("cc000003-0000-0000-0000-000000000004"), "/admin/definitions/payment-terms", "Vade Yönetimi", "Tanımlamalar", "FaReceipt", 4, true, false, now, "System", null, null },
                    { Guid.Parse("cc000003-0000-0000-0000-000000000005"), "/admin/definitions/tax-offices", "Vergi Dairesi Yönetimi", "Tanımlamalar", "FaUniversity", 5, true, false, now, "System", null, null },
                    { Guid.Parse("cc000003-0000-0000-0000-000000000006"), "/admin/definitions/incoterms", "Incoterms Yönetimi", "Tanımlamalar", "FaGlobeAmericas", 6, true, false, now, "System", null, null },
                    { Guid.Parse("cc000003-0000-0000-0000-000000000007"), "/admin/definitions/transport-modes", "Taşıma Modu Yönetimi", "Tanımlamalar", "FaTruck", 7, true, false, now, "System", null, null },
                    { Guid.Parse("cc000003-0000-0000-0000-000000000008"), "/admin/definitions/package-types", "Paket Türü Yönetimi", "Tanımlamalar", "FaBox", 8, true, false, now, "System", null, null },
                    // Finans
                    { Guid.Parse("dd000004-0000-0000-0000-000000000001"), "/admin/currencies", "Döviz Yönetimi", "Finans", "FaMoneyBill", 1, true, false, now, "System", null, null },
                    { Guid.Parse("dd000004-0000-0000-0000-000000000002"), "/admin/exchange-rates", "Döviz Kurları (TCMB)", "Finans", "FaChartLine", 2, true, false, now, "System", null, null },
                    { Guid.Parse("dd000004-0000-0000-0000-000000000003"), "/admin/currency-settings", "Kur Ayarları", "Finans", "FaCog", 3, true, false, now, "System", null, null },
                    // E-Ticaret
                    { Guid.Parse("ee000005-0000-0000-0000-000000000001"), "/admin/ecommerce/tenants", "E-Ticaret Müşterileri", "E-Ticaret", "FaStore", 1, true, false, now, "System", null, null },
                    { Guid.Parse("ee000005-0000-0000-0000-000000000002"), "/admin/ecommerce/products", "E-Ticaret Ürünleri (Master)", "E-Ticaret", "FaBoxOpen", 2, true, false, now, "System", null, null },
                    { Guid.Parse("ee000005-0000-0000-0000-000000000003"), "/admin/ecommerce/categories", "E-Ticaret Kategorileri", "E-Ticaret", "FaThList", 3, true, false, now, "System", null, null },
                    { Guid.Parse("ee000005-0000-0000-0000-000000000004"), "/admin/ecommerce/brands", "E-Ticaret Markaları", "E-Ticaret", "FaTrademark", 4, true, false, now, "System", null, null },
                    // CRM & Is
                    { Guid.Parse("ff000006-0000-0000-0000-000000000001"), "/admin/crm", "CRM & Cari Yönetimi", "CRM & İş", "FaHandshake", 1, true, false, now, "System", null, null },
                    { Guid.Parse("ff000006-0000-0000-0000-000000000002"), "/admin/visits", "Ziyaret & Randevu", "CRM & İş", "FaCalendarCheck", 2, true, false, now, "System", null, null },
                    { Guid.Parse("ff000006-0000-0000-0000-000000000003"), "/admin/projects", "Proje & Görev Yönetimi", "CRM & İş", "FaTasks", 3, true, false, now, "System", null, null },
                    { Guid.Parse("ff000006-0000-0000-0000-000000000004"), "/admin/support", "Destek & Ticket", "CRM & İş", "FaLifeRing", 4, true, false, now, "System", null, null },
                    { Guid.Parse("ff000006-0000-0000-0000-000000000005"), "/admin/inventory", "Stok & Envanter", "CRM & İş", "FaWarehouse", 5, true, false, now, "System", null, null },
                    // Gelistirici
                    { Guid.Parse("aa000007-0000-0000-0000-000000000001"), "/admin/db-schema", "Veritabanı Şeması", "Geliştirici", "FaDatabase", 1, true, false, now, "System", null, null },
                    { Guid.Parse("aa000007-0000-0000-0000-000000000002"), "/admin/theme-management", "Tema Yönetimi", "Geliştirici", "FaPaintBrush", 2, true, false, now, "System", null, null },
                    { Guid.Parse("aa000007-0000-0000-0000-000000000003"), "/admin/cikti-tasarlama", "Çıktı Tasarımcısı", "Geliştirici", "FaPrint", 3, true, false, now, "System", null, null },
                    { Guid.Parse("aa000007-0000-0000-0000-000000000004"), "/admin/ui-showcase", "UI Vitrin (Showcase)", "Geliştirici", "FaPalette", 4, true, false, now, "System", null, null },
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WIXI_SYSTEM_PAGES");
        }
    }
}
