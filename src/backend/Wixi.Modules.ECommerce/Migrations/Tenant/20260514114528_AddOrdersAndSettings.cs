using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Wixi.Modules.ECommerce.Migrations.Tenant
{
    /// <inheritdoc />
    public partial class AddOrdersAndSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "WIXI_EC_ORDERS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OrderNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TotalAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    ShippingAddress = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    BillingAddress = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    TrackingNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ShippingProvider = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PaymentGateway = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PaymentToken = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_EC_ORDERS", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WIXI_EC_ORDERS_WIXI_EC_CUSTOMERS_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "WIXI_EC_CUSTOMERS",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_EC_STORE_SETTINGS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StoreName = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    LogoUrl = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    FaviconUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ContactEmail = table.Column<string>(type: "nvarchar(320)", maxLength: 320, nullable: true),
                    ContactPhone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SocialLinksJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SeoTitle = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    SeoDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Keywords = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_EC_STORE_SETTINGS", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_EC_ORDER_ITEMS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OrderId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProductId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    VariantId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ProductName = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    VariantName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SKU = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalPrice = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_EC_ORDER_ITEMS", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WIXI_EC_ORDER_ITEMS_WIXI_EC_ORDERS_OrderId",
                        column: x => x.OrderId,
                        principalTable: "WIXI_EC_ORDERS",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WIXI_EC_ORDER_ITEMS_WIXI_EC_PRODUCTS_ProductId",
                        column: x => x.ProductId,
                        principalTable: "WIXI_EC_PRODUCTS",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WIXI_EC_ORDER_ITEMS_WIXI_EC_PRODUCT_VARIANTS_VariantId",
                        column: x => x.VariantId,
                        principalTable: "WIXI_EC_PRODUCT_VARIANTS",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_EC_ORDER_ITEMS_OrderId",
                table: "WIXI_EC_ORDER_ITEMS",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_EC_ORDER_ITEMS_ProductId",
                table: "WIXI_EC_ORDER_ITEMS",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_EC_ORDER_ITEMS_VariantId",
                table: "WIXI_EC_ORDER_ITEMS",
                column: "VariantId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_EC_ORDERS_CustomerId",
                table: "WIXI_EC_ORDERS",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_EC_ORDERS_OrderNumber",
                table: "WIXI_EC_ORDERS",
                column: "OrderNumber",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WIXI_EC_ORDER_ITEMS");

            migrationBuilder.DropTable(
                name: "WIXI_EC_STORE_SETTINGS");

            migrationBuilder.DropTable(
                name: "WIXI_EC_ORDERS");
        }
    }
}
