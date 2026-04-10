using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace wixi.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddAppointmentsAndHolidays : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "wixi_Appointments",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StartTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ClientName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ClientPhone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ClientEmail = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ClientId = table.Column<int>(type: "int", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Color = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "#3B82F6"),
                    CreatedById = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_Appointments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_wixi_Appointments_wixi_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "wixi_Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_wixi_Appointments_wixi_Users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "wixi_Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "wixi_Holidays",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsRecurring = table.Column<bool>(type: "bit", nullable: false),
                    CountryCode = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false, defaultValue: "TR"),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_Holidays", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Appointments_ClientId",
                table: "wixi_Appointments",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Appointments_CreatedById",
                table: "wixi_Appointments",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Appointments_EndTime",
                table: "wixi_Appointments",
                column: "EndTime");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Appointments_StartTime",
                table: "wixi_Appointments",
                column: "StartTime");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Appointments_Status",
                table: "wixi_Appointments",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Holidays_CountryCode",
                table: "wixi_Holidays",
                column: "CountryCode");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Holidays_Date",
                table: "wixi_Holidays",
                column: "Date");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "wixi_Appointments");

            migrationBuilder.DropTable(
                name: "wixi_Holidays");
        }
    }
}
