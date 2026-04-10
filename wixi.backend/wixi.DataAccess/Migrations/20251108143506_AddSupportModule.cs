using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace wixi.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddSupportModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "wixi_FAQs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Question_TR = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Question_EN = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Question_DE = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Question_AR = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Answer_TR = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Answer_EN = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Answer_DE = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Answer_AR = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Category = table.Column<int>(type: "int", nullable: false),
                    Tags = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsFeatured = table.Column<bool>(type: "bit", nullable: false),
                    ViewCount = table.Column<int>(type: "int", nullable: false),
                    HelpfulCount = table.Column<int>(type: "int", nullable: false),
                    NotHelpfulCount = table.Column<int>(type: "int", nullable: false),
                    RelatedLink = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    VideoUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AuthorId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PublishedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_FAQs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "wixi_Notifications",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ActionUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ActionText = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RelatedEntityType = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    RelatedEntityId = table.Column<long>(type: "bigint", nullable: true),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    ReadAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsArchived = table.Column<bool>(type: "bit", nullable: false),
                    ArchivedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Priority = table.Column<int>(type: "int", nullable: false),
                    SentViaEmail = table.Column<bool>(type: "bit", nullable: false),
                    EmailSentAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SentViaPush = table.Column<bool>(type: "bit", nullable: false),
                    PushSentAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    MetadataJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_Notifications", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "wixi_SupportTickets",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClientId = table.Column<int>(type: "int", nullable: false),
                    TicketNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Subject = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Priority = table.Column<int>(type: "int", nullable: false),
                    Category = table.Column<int>(type: "int", nullable: false),
                    AssignedToId = table.Column<int>(type: "int", nullable: true),
                    FirstResponseAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ResolvedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ClosedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DueDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Resolution = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CloseReason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Rating = table.Column<int>(type: "int", nullable: true),
                    RatingComment = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_SupportTickets", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "wixi_SupportMessages",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TicketId = table.Column<long>(type: "bigint", nullable: false),
                    SenderId = table.Column<int>(type: "int", nullable: false),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsInternal = table.Column<bool>(type: "bit", nullable: false),
                    IsFromClient = table.Column<bool>(type: "bit", nullable: false),
                    IsAutomated = table.Column<bool>(type: "bit", nullable: false),
                    AttachmentFileName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AttachmentPath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AttachmentSizeBytes = table.Column<long>(type: "bigint", nullable: true),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    ReadAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IpAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserAgent = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_SupportMessages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_wixi_SupportMessages_wixi_SupportTickets_TicketId",
                        column: x => x.TicketId,
                        principalTable: "wixi_SupportTickets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_wixi_FAQs_Category",
                table: "wixi_FAQs",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_FAQs_IsActive",
                table: "wixi_FAQs",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_FAQs_IsFeatured",
                table: "wixi_FAQs",
                column: "IsFeatured");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Notifications_CreatedAt",
                table: "wixi_Notifications",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Notifications_IsArchived",
                table: "wixi_Notifications",
                column: "IsArchived");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Notifications_IsRead",
                table: "wixi_Notifications",
                column: "IsRead");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Notifications_RelatedEntityType_RelatedEntityId",
                table: "wixi_Notifications",
                columns: new[] { "RelatedEntityType", "RelatedEntityId" });

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Notifications_Type",
                table: "wixi_Notifications",
                column: "Type");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Notifications_UserId",
                table: "wixi_Notifications",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_SupportMessages_CreatedAt",
                table: "wixi_SupportMessages",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_SupportMessages_SenderId",
                table: "wixi_SupportMessages",
                column: "SenderId");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_SupportMessages_TicketId",
                table: "wixi_SupportMessages",
                column: "TicketId");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_SupportTickets_AssignedToId",
                table: "wixi_SupportTickets",
                column: "AssignedToId");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_SupportTickets_ClientId",
                table: "wixi_SupportTickets",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_SupportTickets_CreatedAt",
                table: "wixi_SupportTickets",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_SupportTickets_Priority",
                table: "wixi_SupportTickets",
                column: "Priority");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_SupportTickets_Status",
                table: "wixi_SupportTickets",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_SupportTickets_TicketNumber",
                table: "wixi_SupportTickets",
                column: "TicketNumber",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "wixi_FAQs");

            migrationBuilder.DropTable(
                name: "wixi_Notifications");

            migrationBuilder.DropTable(
                name: "wixi_SupportMessages");

            migrationBuilder.DropTable(
                name: "wixi_SupportTickets");
        }
    }
}
