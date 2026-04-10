using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace wixi.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddApplicationsModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "wixi_ApplicationTemplates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name_TR = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Name_EN = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Name_DE = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Name_AR = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Description_TR = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description_EN = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description_DE = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description_AR = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Type = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDefault = table.Column<bool>(type: "bit", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    IconName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EstimatedDurationDays = table.Column<int>(type: "int", nullable: true),
                    MinDurationDays = table.Column<int>(type: "int", nullable: true),
                    MaxDurationDays = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_ApplicationTemplates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "wixi_Applications",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClientId = table.Column<int>(type: "int", nullable: false),
                    ApplicationTemplateId = table.Column<int>(type: "int", nullable: false),
                    ApplicationNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    ProgressPercentage = table.Column<int>(type: "int", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CompletionDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExpectedCompletionDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CancelledDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CancellationReason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_Applications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_wixi_Applications_wixi_ApplicationTemplates_ApplicationTemplateId",
                        column: x => x.ApplicationTemplateId,
                        principalTable: "wixi_ApplicationTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "wixi_ApplicationStepTemplates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ApplicationTemplateId = table.Column<int>(type: "int", nullable: false),
                    Title_TR = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Title_EN = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Title_DE = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Title_AR = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Description_TR = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description_EN = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description_DE = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description_AR = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StepOrder = table.Column<int>(type: "int", nullable: false),
                    IconName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsRequired = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    EstimatedDurationDays = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_ApplicationStepTemplates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_wixi_ApplicationStepTemplates_wixi_ApplicationTemplates_ApplicationTemplateId",
                        column: x => x.ApplicationTemplateId,
                        principalTable: "wixi_ApplicationTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "wixi_ApplicationHistories",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ApplicationId = table.Column<long>(type: "bigint", nullable: false),
                    Action = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    OldValue = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NewValue = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserId = table.Column<int>(type: "int", nullable: true),
                    UserType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IpAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserAgent = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MetadataJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_ApplicationHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_wixi_ApplicationHistories_wixi_Applications_ApplicationId",
                        column: x => x.ApplicationId,
                        principalTable: "wixi_Applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "wixi_ApplicationSteps",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ApplicationId = table.Column<long>(type: "bigint", nullable: false),
                    StepTemplateId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    StepOrder = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    ProgressPercentage = table.Column<int>(type: "int", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletionDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DueDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AssignedTo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_ApplicationSteps", x => x.Id);
                    table.ForeignKey(
                        name: "FK_wixi_ApplicationSteps_wixi_ApplicationStepTemplates_StepTemplateId",
                        column: x => x.StepTemplateId,
                        principalTable: "wixi_ApplicationStepTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_wixi_ApplicationSteps_wixi_Applications_ApplicationId",
                        column: x => x.ApplicationId,
                        principalTable: "wixi_Applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "wixi_ApplicationSubStepTemplates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StepTemplateId = table.Column<int>(type: "int", nullable: false),
                    Name_TR = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Name_EN = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Name_DE = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Name_AR = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Description_TR = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description_EN = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description_DE = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description_AR = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SubStepOrder = table.Column<int>(type: "int", nullable: false),
                    IsRequired = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    EstimatedDurationDays = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_ApplicationSubStepTemplates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_wixi_ApplicationSubStepTemplates_wixi_ApplicationStepTemplates_StepTemplateId",
                        column: x => x.StepTemplateId,
                        principalTable: "wixi_ApplicationStepTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "wixi_ApplicationSubSteps",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ApplicationStepId = table.Column<long>(type: "bigint", nullable: false),
                    SubStepTemplateId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    SubStepOrder = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    FileNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    InfoMessage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CompletionDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_ApplicationSubSteps", x => x.Id);
                    table.ForeignKey(
                        name: "FK_wixi_ApplicationSubSteps_wixi_ApplicationSteps_ApplicationStepId",
                        column: x => x.ApplicationStepId,
                        principalTable: "wixi_ApplicationSteps",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_wixi_ApplicationSubSteps_wixi_ApplicationSubStepTemplates_SubStepTemplateId",
                        column: x => x.SubStepTemplateId,
                        principalTable: "wixi_ApplicationSubStepTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_wixi_ApplicationHistories_ApplicationId",
                table: "wixi_ApplicationHistories",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_ApplicationHistories_CreatedAt",
                table: "wixi_ApplicationHistories",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_ApplicationHistories_UserId",
                table: "wixi_ApplicationHistories",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Applications_ApplicationNumber",
                table: "wixi_Applications",
                column: "ApplicationNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Applications_ApplicationTemplateId",
                table: "wixi_Applications",
                column: "ApplicationTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Applications_ClientId",
                table: "wixi_Applications",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Applications_StartDate",
                table: "wixi_Applications",
                column: "StartDate");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Applications_Status",
                table: "wixi_Applications",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_ApplicationSteps_ApplicationId",
                table: "wixi_ApplicationSteps",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_ApplicationSteps_Status",
                table: "wixi_ApplicationSteps",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_ApplicationSteps_StepTemplateId",
                table: "wixi_ApplicationSteps",
                column: "StepTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_ApplicationStepTemplates_ApplicationTemplateId",
                table: "wixi_ApplicationStepTemplates",
                column: "ApplicationTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_ApplicationSubSteps_ApplicationStepId",
                table: "wixi_ApplicationSubSteps",
                column: "ApplicationStepId");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_ApplicationSubSteps_Status",
                table: "wixi_ApplicationSubSteps",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_ApplicationSubSteps_SubStepTemplateId",
                table: "wixi_ApplicationSubSteps",
                column: "SubStepTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_ApplicationSubStepTemplates_StepTemplateId",
                table: "wixi_ApplicationSubStepTemplates",
                column: "StepTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_ApplicationTemplates_Type",
                table: "wixi_ApplicationTemplates",
                column: "Type");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "wixi_ApplicationHistories");

            migrationBuilder.DropTable(
                name: "wixi_ApplicationSubSteps");

            migrationBuilder.DropTable(
                name: "wixi_ApplicationSteps");

            migrationBuilder.DropTable(
                name: "wixi_ApplicationSubStepTemplates");

            migrationBuilder.DropTable(
                name: "wixi_Applications");

            migrationBuilder.DropTable(
                name: "wixi_ApplicationStepTemplates");

            migrationBuilder.DropTable(
                name: "wixi_ApplicationTemplates");
        }
    }
}
