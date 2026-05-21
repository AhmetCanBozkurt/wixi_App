using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Wixi.Modules.Core.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCoreReferenceDataPhase2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "WIXI_HS_CODES",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Level = table.Column<int>(type: "int", nullable: false),
                    ParentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
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
                    table.PrimaryKey("PK_WIXI_HS_CODES", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WIXI_HS_CODES_WIXI_HS_CODES_ParentId",
                        column: x => x.ParentId,
                        principalTable: "WIXI_HS_CODES",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_PRODUCT_DESCRIPTIONS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    HsCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
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
                    table.PrimaryKey("PK_WIXI_PRODUCT_DESCRIPTIONS", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_SERVICE_CATEGORIES",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ColorHex = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    Icon = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
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
                    table.PrimaryKey("PK_WIXI_SERVICE_CATEGORIES", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_UNIT_CATEGORIES",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
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
                    table.PrimaryKey("PK_WIXI_UNIT_CATEGORIES", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_SERVICES",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ServiceCategoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
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
                    table.PrimaryKey("PK_WIXI_SERVICES", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WIXI_SERVICES_WIXI_SERVICE_CATEGORIES_ServiceCategoryId",
                        column: x => x.ServiceCategoryId,
                        principalTable: "WIXI_SERVICE_CATEGORIES",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_UNITS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Symbol = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    UnitCategoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsBaseUnit = table.Column<bool>(type: "bit", nullable: false),
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
                    table.PrimaryKey("PK_WIXI_UNITS", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WIXI_UNITS_WIXI_UNIT_CATEGORIES_UnitCategoryId",
                        column: x => x.UnitCategoryId,
                        principalTable: "WIXI_UNIT_CATEGORIES",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_UNIT_CONVERSIONS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FromUnitId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ToUnitId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Factor = table.Column<decimal>(type: "decimal(18,8)", nullable: false),
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
                    table.PrimaryKey("PK_WIXI_UNIT_CONVERSIONS", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WIXI_UNIT_CONVERSIONS_WIXI_UNITS_FromUnitId",
                        column: x => x.FromUnitId,
                        principalTable: "WIXI_UNITS",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WIXI_UNIT_CONVERSIONS_WIXI_UNITS_ToUnitId",
                        column: x => x.ToUnitId,
                        principalTable: "WIXI_UNITS",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_HS_CODES_Code",
                table: "WIXI_HS_CODES",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_HS_CODES_ParentId",
                table: "WIXI_HS_CODES",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_PRODUCT_DESCRIPTIONS_Code",
                table: "WIXI_PRODUCT_DESCRIPTIONS",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_SERVICE_CATEGORIES_Code",
                table: "WIXI_SERVICE_CATEGORIES",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_SERVICES_Code",
                table: "WIXI_SERVICES",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_SERVICES_ServiceCategoryId",
                table: "WIXI_SERVICES",
                column: "ServiceCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_UNIT_CATEGORIES_Code",
                table: "WIXI_UNIT_CATEGORIES",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_UNIT_CONVERSIONS_FromUnitId",
                table: "WIXI_UNIT_CONVERSIONS",
                column: "FromUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_UNIT_CONVERSIONS_ToUnitId",
                table: "WIXI_UNIT_CONVERSIONS",
                column: "ToUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_UNITS_Code",
                table: "WIXI_UNITS",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_UNITS_UnitCategoryId",
                table: "WIXI_UNITS",
                column: "UnitCategoryId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WIXI_HS_CODES");

            migrationBuilder.DropTable(
                name: "WIXI_PRODUCT_DESCRIPTIONS");

            migrationBuilder.DropTable(
                name: "WIXI_SERVICES");

            migrationBuilder.DropTable(
                name: "WIXI_UNIT_CONVERSIONS");

            migrationBuilder.DropTable(
                name: "WIXI_SERVICE_CATEGORIES");

            migrationBuilder.DropTable(
                name: "WIXI_UNITS");

            migrationBuilder.DropTable(
                name: "WIXI_UNIT_CATEGORIES");
        }
    }
}
