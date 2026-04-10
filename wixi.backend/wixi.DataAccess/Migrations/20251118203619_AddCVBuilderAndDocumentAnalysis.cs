using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace wixi.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddCVBuilderAndDocumentAnalysis : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CVBuilderSessionId",
                table: "wixi_Payments",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "wixi_CVData",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PaymentId = table.Column<long>(type: "bigint", nullable: false),
                    ClientId = table.Column<int>(type: "int", nullable: false),
                    DocumentId = table.Column<long>(type: "bigint", nullable: true),
                    SessionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PersonalInfo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Experience = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Education = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Skills = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Languages = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Certificates = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_CVData", x => x.Id);
                    table.ForeignKey(
                        name: "FK_wixi_CVData_wixi_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "wixi_Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_wixi_CVData_wixi_Documents_DocumentId",
                        column: x => x.DocumentId,
                        principalTable: "wixi_Documents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_wixi_CVData_wixi_Payments_PaymentId",
                        column: x => x.PaymentId,
                        principalTable: "wixi_Payments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "wixi_DocumentAnalyses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DocumentId = table.Column<long>(type: "bigint", nullable: false),
                    IsCV = table.Column<bool>(type: "bit", nullable: false),
                    ATSScore = table.Column<int>(type: "int", nullable: true),
                    Recommendations = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    AnalyzedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AnalysisMethod = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_DocumentAnalyses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_wixi_DocumentAnalyses_wixi_Documents_DocumentId",
                        column: x => x.DocumentId,
                        principalTable: "wixi_Documents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_wixi_CVData_ClientId",
                table: "wixi_CVData",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_CVData_DocumentId",
                table: "wixi_CVData",
                column: "DocumentId");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_CVData_PaymentId",
                table: "wixi_CVData",
                column: "PaymentId");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_CVData_SessionId",
                table: "wixi_CVData",
                column: "SessionId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_wixi_DocumentAnalyses_DocumentId",
                table: "wixi_DocumentAnalyses",
                column: "DocumentId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "wixi_CVData");

            migrationBuilder.DropTable(
                name: "wixi_DocumentAnalyses");

            migrationBuilder.DropColumn(
                name: "CVBuilderSessionId",
                table: "wixi_Payments");
        }
    }
}
