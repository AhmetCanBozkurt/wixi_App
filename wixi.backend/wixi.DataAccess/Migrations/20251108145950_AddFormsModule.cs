using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace wixi.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddFormsModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "wixi_ContactFormSubmissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Age = table.Column<int>(type: "int", nullable: true),
                    Nationality = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Education = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    FieldOfStudy = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    WorkExperience = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GermanLevel = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    EnglishLevel = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Interest = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    PreferredCity = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Timeline = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PrivacyConsent = table.Column<bool>(type: "bit", nullable: false),
                    Newsletter = table.Column<bool>(type: "bit", nullable: false),
                    RequestIp = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    UserAgent = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Language = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    EmailLogId = table.Column<int>(type: "int", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    AdminNotes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_ContactFormSubmissions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "wixi_EmployeeFormSubmissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Salutation = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    FullName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Profession = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Experience = table.Column<int>(type: "int", nullable: true),
                    Education = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    GermanLevel = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    AdditionalInfo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CvFileName = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CvFilePath = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CvFileSize = table.Column<long>(type: "bigint", nullable: true),
                    SpecialRequests = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RequestIp = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    UserAgent = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Language = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    EmailLogId = table.Column<int>(type: "int", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    AdminNotes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_EmployeeFormSubmissions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "wixi_EmployerFormSubmissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CompanyName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ContactPerson = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Industry = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CompanySize = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Positions = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Requirements = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SpecialRequests = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RequestIp = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    UserAgent = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Language = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    EmailLogId = table.Column<int>(type: "int", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    AdminNotes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_EmployerFormSubmissions", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_wixi_ContactFormSubmissions_CreatedAt",
                table: "wixi_ContactFormSubmissions",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_ContactFormSubmissions_Email",
                table: "wixi_ContactFormSubmissions",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_ContactFormSubmissions_Status",
                table: "wixi_ContactFormSubmissions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_EmployeeFormSubmissions_CreatedAt",
                table: "wixi_EmployeeFormSubmissions",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_EmployeeFormSubmissions_Email",
                table: "wixi_EmployeeFormSubmissions",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_EmployeeFormSubmissions_Status",
                table: "wixi_EmployeeFormSubmissions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_EmployerFormSubmissions_CreatedAt",
                table: "wixi_EmployerFormSubmissions",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_EmployerFormSubmissions_Email",
                table: "wixi_EmployerFormSubmissions",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_EmployerFormSubmissions_Status",
                table: "wixi_EmployerFormSubmissions",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "wixi_ContactFormSubmissions");

            migrationBuilder.DropTable(
                name: "wixi_EmployeeFormSubmissions");

            migrationBuilder.DropTable(
                name: "wixi_EmployerFormSubmissions");
        }
    }
}
