using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace wixi.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddClientModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "wixi_EducationTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_EducationTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "wixi_PendingClientCodes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Code = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    ClientData = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsUsed = table.Column<bool>(type: "bit", nullable: false),
                    UsedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AttemptCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_PendingClientCodes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "wixi_Clients",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    City = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PostalCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Country = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DateOfBirth = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Nationality = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PassportNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EducationTypeId = table.Column<int>(type: "int", nullable: true),
                    ProfilePictureUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastActivityAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_Clients", x => x.Id);
                    table.ForeignKey(
                        name: "FK_wixi_Clients_wixi_EducationTypes_EducationTypeId",
                        column: x => x.EducationTypeId,
                        principalTable: "wixi_EducationTypes",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "wixi_EducationInfos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClientId = table.Column<int>(type: "int", nullable: false),
                    InstitutionName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Degree = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FieldOfStudy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Grade = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Country = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    City = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_EducationInfos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_wixi_EducationInfos_wixi_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "wixi_Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "wixi_EducationTypes",
                columns: new[] { "Id", "CreatedAt", "Description", "DisplayOrder", "IsActive", "Name" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "University Education", 1, true, "University" },
                    { 2, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "Meslek Lisesi", 2, true, "Vocational School" },
                    { 3, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "Kalfalık", 3, true, "Apprenticeship" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Clients_EducationTypeId",
                table: "wixi_Clients",
                column: "EducationTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Clients_Email",
                table: "wixi_Clients",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Clients_UserId",
                table: "wixi_Clients",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_EducationInfos_ClientId",
                table: "wixi_EducationInfos",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_PendingClientCodes_Code",
                table: "wixi_PendingClientCodes",
                column: "Code");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_PendingClientCodes_Email",
                table: "wixi_PendingClientCodes",
                column: "Email");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "wixi_EducationInfos");

            migrationBuilder.DropTable(
                name: "wixi_PendingClientCodes");

            migrationBuilder.DropTable(
                name: "wixi_Clients");

            migrationBuilder.DropTable(
                name: "wixi_EducationTypes");
        }
    }
}
