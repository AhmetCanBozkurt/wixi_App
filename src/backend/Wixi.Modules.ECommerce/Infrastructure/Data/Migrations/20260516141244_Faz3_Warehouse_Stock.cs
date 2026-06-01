using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Wixi.Modules.ECommerce.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class Faz3_Warehouse_Stock : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "WIXI_EC_WAREHOUSES",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Address = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    IsDefault = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_EC_WAREHOUSES", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_EC_STOCK",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    VariantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WarehouseId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    ReservedQuantity = table.Column<int>(type: "int", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_EC_STOCK", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WIXI_EC_STOCK_WIXI_EC_PRODUCT_VARIANTS_VariantId",
                        column: x => x.VariantId,
                        principalTable: "WIXI_EC_PRODUCT_VARIANTS",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WIXI_EC_STOCK_WIXI_EC_WAREHOUSES_WarehouseId",
                        column: x => x.WarehouseId,
                        principalTable: "WIXI_EC_WAREHOUSES",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_EC_STOCK_MOVEMENTS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    VariantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WarehouseId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    MovementDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ToWarehouseId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_EC_STOCK_MOVEMENTS", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WIXI_EC_STOCK_MOVEMENTS_WIXI_EC_PRODUCT_VARIANTS_VariantId",
                        column: x => x.VariantId,
                        principalTable: "WIXI_EC_PRODUCT_VARIANTS",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WIXI_EC_STOCK_MOVEMENTS_WIXI_EC_WAREHOUSES_ToWarehouseId",
                        column: x => x.ToWarehouseId,
                        principalTable: "WIXI_EC_WAREHOUSES",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WIXI_EC_STOCK_MOVEMENTS_WIXI_EC_WAREHOUSES_WarehouseId",
                        column: x => x.WarehouseId,
                        principalTable: "WIXI_EC_WAREHOUSES",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_EC_STOCK_VariantId_WarehouseId",
                table: "WIXI_EC_STOCK",
                columns: new[] { "VariantId", "WarehouseId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_EC_STOCK_WarehouseId",
                table: "WIXI_EC_STOCK",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_EC_STOCK_MOVEMENTS_ToWarehouseId",
                table: "WIXI_EC_STOCK_MOVEMENTS",
                column: "ToWarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_EC_STOCK_MOVEMENTS_VariantId",
                table: "WIXI_EC_STOCK_MOVEMENTS",
                column: "VariantId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_EC_STOCK_MOVEMENTS_WarehouseId",
                table: "WIXI_EC_STOCK_MOVEMENTS",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_EC_WAREHOUSES_Code",
                table: "WIXI_EC_WAREHOUSES",
                column: "Code",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WIXI_EC_STOCK");

            migrationBuilder.DropTable(
                name: "WIXI_EC_STOCK_MOVEMENTS");

            migrationBuilder.DropTable(
                name: "WIXI_EC_WAREHOUSES");
        }
    }
}
