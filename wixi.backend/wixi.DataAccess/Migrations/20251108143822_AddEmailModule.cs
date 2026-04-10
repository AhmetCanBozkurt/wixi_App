using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace wixi.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddEmailModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "wixi_EmailLogs",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CorrelationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FromEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    FromName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ToEmails = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    CcEmails = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BccEmails = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Subject = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BodyHtml = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BodyText = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Attachments = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<byte>(type: "tinyint", nullable: false),
                    AttemptCount = table.Column<int>(type: "int", nullable: false),
                    LastAttemptAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastError = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SmtpHost = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SmtpPort = table.Column<int>(type: "int", nullable: true),
                    UsedSsl = table.Column<bool>(type: "bit", nullable: true),
                    UsedUserName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TemplateKey = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    MetadataJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RequestIp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserAgent = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_EmailLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "wixi_EmailTemplates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Key = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Subject_TR = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Subject_EN = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Subject_DE = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Subject_AR = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BodyHtml_TR = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BodyHtml_EN = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BodyHtml_DE = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BodyHtml_AR = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_EmailTemplates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "wixi_SmtpSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Host = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Port = table.Column<int>(type: "int", nullable: false),
                    UseSsl = table.Column<bool>(type: "bit", nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    PasswordEnc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FromName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FromEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    TimeoutMs = table.Column<int>(type: "int", nullable: true),
                    RetryCount = table.Column<int>(type: "int", nullable: false),
                    MaxAttemptsPerEmail = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDefault = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_SmtpSettings", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_wixi_EmailLogs_CorrelationId",
                table: "wixi_EmailLogs",
                column: "CorrelationId");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_EmailLogs_CreatedAt",
                table: "wixi_EmailLogs",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_EmailLogs_Status",
                table: "wixi_EmailLogs",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_EmailLogs_TemplateKey",
                table: "wixi_EmailLogs",
                column: "TemplateKey");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_EmailTemplates_IsActive",
                table: "wixi_EmailTemplates",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_EmailTemplates_Key",
                table: "wixi_EmailTemplates",
                column: "Key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_wixi_SmtpSettings_IsActive",
                table: "wixi_SmtpSettings",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_SmtpSettings_IsDefault",
                table: "wixi_SmtpSettings",
                column: "IsDefault");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "wixi_EmailLogs");

            migrationBuilder.DropTable(
                name: "wixi_EmailTemplates");

            migrationBuilder.DropTable(
                name: "wixi_SmtpSettings");
        }
    }
}
