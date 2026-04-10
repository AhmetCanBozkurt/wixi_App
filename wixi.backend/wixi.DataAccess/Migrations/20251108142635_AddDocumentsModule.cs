using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace wixi.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddDocumentsModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "wixi_DocumentTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Name_TR = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Name_EN = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Name_DE = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Name_AR = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Description_TR = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description_EN = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description_DE = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description_AR = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Note_TR = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Note_EN = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Note_DE = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Note_AR = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsRequired = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    EducationTypeId = table.Column<int>(type: "int", nullable: true),
                    AllowedFileTypes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MaxFileSizeBytes = table.Column<long>(type: "bigint", nullable: true),
                    RequiresApproval = table.Column<bool>(type: "bit", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    IconName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_DocumentTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "wixi_FileStorages",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FileName = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    StoredFileName = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    FilePath = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    FileExtension = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FileSizeBytes = table.Column<long>(type: "bigint", nullable: false),
                    MimeType = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    StorageType = table.Column<int>(type: "int", nullable: false),
                    StorageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ContainerName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StoragePath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FileHash = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    IsPublic = table.Column<bool>(type: "bit", nullable: false),
                    IsEncrypted = table.Column<bool>(type: "bit", nullable: false),
                    EncryptionKey = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EntityType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    EntityId = table.Column<long>(type: "bigint", nullable: false),
                    UploadedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MetadataJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UploadedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastAccessedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_FileStorages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "wixi_Documents",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClientId = table.Column<int>(type: "int", nullable: false),
                    DocumentTypeId = table.Column<int>(type: "int", nullable: false),
                    OriginalFileName = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    StoredFileName = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    FilePath = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    FileExtension = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    FileSizeBytes = table.Column<long>(type: "bigint", nullable: false),
                    MimeType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FileHash = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Version = table.Column<int>(type: "int", nullable: false),
                    UploadedFromIp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserAgent = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UploadedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_Documents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_wixi_Documents_wixi_DocumentTypes_DocumentTypeId",
                        column: x => x.DocumentTypeId,
                        principalTable: "wixi_DocumentTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "wixi_DocumentReviews",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DocumentId = table.Column<long>(type: "bigint", nullable: false),
                    ReviewerId = table.Column<int>(type: "int", nullable: false),
                    Decision = table.Column<int>(type: "int", nullable: false),
                    ReviewNote = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FeedbackMessage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ReviewDurationMinutes = table.Column<int>(type: "int", nullable: false),
                    RejectionReason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ReviewedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_DocumentReviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_wixi_DocumentReviews_wixi_Documents_DocumentId",
                        column: x => x.DocumentId,
                        principalTable: "wixi_Documents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_wixi_DocumentReviews_DocumentId",
                table: "wixi_DocumentReviews",
                column: "DocumentId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_wixi_DocumentReviews_ReviewedAt",
                table: "wixi_DocumentReviews",
                column: "ReviewedAt");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_DocumentReviews_ReviewerId",
                table: "wixi_DocumentReviews",
                column: "ReviewerId");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Documents_ClientId",
                table: "wixi_Documents",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Documents_DocumentTypeId",
                table: "wixi_Documents",
                column: "DocumentTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Documents_Status",
                table: "wixi_Documents",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Documents_UploadedAt",
                table: "wixi_Documents",
                column: "UploadedAt");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_DocumentTypes_Code",
                table: "wixi_DocumentTypes",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_wixi_DocumentTypes_EducationTypeId",
                table: "wixi_DocumentTypes",
                column: "EducationTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_FileStorages_EntityType_EntityId",
                table: "wixi_FileStorages",
                columns: new[] { "EntityType", "EntityId" });

            migrationBuilder.CreateIndex(
                name: "IX_wixi_FileStorages_FileHash",
                table: "wixi_FileStorages",
                column: "FileHash");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "wixi_DocumentReviews");

            migrationBuilder.DropTable(
                name: "wixi_FileStorages");

            migrationBuilder.DropTable(
                name: "wixi_Documents");

            migrationBuilder.DropTable(
                name: "wixi_DocumentTypes");
        }
    }
}
