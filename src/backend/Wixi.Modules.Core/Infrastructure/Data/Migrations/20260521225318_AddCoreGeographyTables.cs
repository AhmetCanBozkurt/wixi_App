using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Wixi.Modules.Core.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCoreGeographyTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "WIXI_COUNTRIES",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Iso2 = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: false),
                    Iso3 = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    PhoneCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Capital = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    Currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    CurrencyName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CurrencySymbol = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    Region = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    SubRegion = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Latitude = table.Column<decimal>(type: "decimal(10,8)", nullable: true),
                    Longitude = table.Column<decimal>(type: "decimal(11,8)", nullable: true),
                    Flag = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_COUNTRIES", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_STATES",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false),
                    CountryId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    StateCode = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    CountryCode = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: true),
                    Latitude = table.Column<decimal>(type: "decimal(10,8)", nullable: true),
                    Longitude = table.Column<decimal>(type: "decimal(11,8)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_STATES", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WIXI_STATES_WIXI_COUNTRIES_CountryId",
                        column: x => x.CountryId,
                        principalTable: "WIXI_COUNTRIES",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_CITIES",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false),
                    StateId = table.Column<int>(type: "int", nullable: false),
                    CountryId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Latitude = table.Column<decimal>(type: "decimal(10,8)", nullable: true),
                    Longitude = table.Column<decimal>(type: "decimal(11,8)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_CITIES", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WIXI_CITIES_WIXI_COUNTRIES_CountryId",
                        column: x => x.CountryId,
                        principalTable: "WIXI_COUNTRIES",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WIXI_CITIES_WIXI_STATES_StateId",
                        column: x => x.StateId,
                        principalTable: "WIXI_STATES",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_CITIES_CountryId",
                table: "WIXI_CITIES",
                column: "CountryId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_CITIES_StateId",
                table: "WIXI_CITIES",
                column: "StateId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_COUNTRIES_Iso2",
                table: "WIXI_COUNTRIES",
                column: "Iso2",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_COUNTRIES_Iso3",
                table: "WIXI_COUNTRIES",
                column: "Iso3",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_STATES_CountryId",
                table: "WIXI_STATES",
                column: "CountryId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WIXI_CITIES");

            migrationBuilder.DropTable(
                name: "WIXI_STATES");

            migrationBuilder.DropTable(
                name: "WIXI_COUNTRIES");
        }
    }
}
