using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Wixi.Modules.ProjectManagement.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialProjectManagement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "WIXI_PM_PROJECTS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    CustomerId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CariId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CustomerName = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Budget = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    Currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    Color = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_PM_PROJECTS", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_PM_PROJECT_MEMBERS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProjectId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    UserEmail = table.Column<string>(type: "nvarchar(320)", maxLength: 320, nullable: true),
                    Role = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    AddedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_PM_PROJECT_MEMBERS", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WIXI_PM_PROJECT_MEMBERS_WIXI_PM_PROJECTS_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "WIXI_PM_PROJECTS",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_PM_TASKS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProjectId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ParentTaskId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Title = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Priority = table.Column<int>(type: "int", nullable: false),
                    Progress = table.Column<int>(type: "int", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DueDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DurationDays = table.Column<int>(type: "int", nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_PM_TASKS", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WIXI_PM_TASKS_WIXI_PM_PROJECTS_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "WIXI_PM_PROJECTS",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WIXI_PM_TASKS_WIXI_PM_TASKS_ParentTaskId",
                        column: x => x.ParentTaskId,
                        principalTable: "WIXI_PM_TASKS",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_PM_TASK_ASSIGNEES",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TaskId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    UserEmail = table.Column<string>(type: "nvarchar(320)", maxLength: 320, nullable: true),
                    AssignedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_PM_TASK_ASSIGNEES", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WIXI_PM_TASK_ASSIGNEES_WIXI_PM_TASKS_TaskId",
                        column: x => x.TaskId,
                        principalTable: "WIXI_PM_TASKS",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_PM_TASK_ATTACHMENTS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TaskId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FileName = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    RelativePath = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    SizeBytes = table.Column<long>(type: "bigint", nullable: false),
                    ContentType = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_PM_TASK_ATTACHMENTS", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WIXI_PM_TASK_ATTACHMENTS_WIXI_PM_TASKS_TaskId",
                        column: x => x.TaskId,
                        principalTable: "WIXI_PM_TASKS",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_PM_TASK_COMMENTS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TaskId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AuthorUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    AuthorName = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    Content = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    IsSystemLog = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_PM_TASK_COMMENTS", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WIXI_PM_TASK_COMMENTS_WIXI_PM_TASKS_TaskId",
                        column: x => x.TaskId,
                        principalTable: "WIXI_PM_TASKS",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_PM_TASK_DEPENDENCIES",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TaskId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DependsOnTaskId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_PM_TASK_DEPENDENCIES", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WIXI_PM_TASK_DEPENDENCIES_WIXI_PM_TASKS_DependsOnTaskId",
                        column: x => x.DependsOnTaskId,
                        principalTable: "WIXI_PM_TASKS",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WIXI_PM_TASK_DEPENDENCIES_WIXI_PM_TASKS_TaskId",
                        column: x => x.TaskId,
                        principalTable: "WIXI_PM_TASKS",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WIXI_PM_TIME_ENTRIES",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TaskId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    StartedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DurationMinutes = table.Column<int>(type: "int", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_PM_TIME_ENTRIES", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WIXI_PM_TIME_ENTRIES_WIXI_PM_TASKS_TaskId",
                        column: x => x.TaskId,
                        principalTable: "WIXI_PM_TASKS",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_PM_PROJECT_MEMBERS_ProjectId_UserId",
                table: "WIXI_PM_PROJECT_MEMBERS",
                columns: new[] { "ProjectId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_PM_PROJECTS_Code",
                table: "WIXI_PM_PROJECTS",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_PM_PROJECTS_CustomerId",
                table: "WIXI_PM_PROJECTS",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_PM_PROJECTS_Status",
                table: "WIXI_PM_PROJECTS",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_PM_TASK_ASSIGNEES_TaskId_UserId",
                table: "WIXI_PM_TASK_ASSIGNEES",
                columns: new[] { "TaskId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_PM_TASK_ATTACHMENTS_TaskId",
                table: "WIXI_PM_TASK_ATTACHMENTS",
                column: "TaskId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_PM_TASK_COMMENTS_TaskId",
                table: "WIXI_PM_TASK_COMMENTS",
                column: "TaskId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_PM_TASK_DEPENDENCIES_DependsOnTaskId",
                table: "WIXI_PM_TASK_DEPENDENCIES",
                column: "DependsOnTaskId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_PM_TASK_DEPENDENCIES_TaskId_DependsOnTaskId",
                table: "WIXI_PM_TASK_DEPENDENCIES",
                columns: new[] { "TaskId", "DependsOnTaskId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_PM_TASKS_ParentTaskId",
                table: "WIXI_PM_TASKS",
                column: "ParentTaskId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_PM_TASKS_ProjectId",
                table: "WIXI_PM_TASKS",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_PM_TASKS_ProjectId_Status_SortOrder",
                table: "WIXI_PM_TASKS",
                columns: new[] { "ProjectId", "Status", "SortOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_PM_TIME_ENTRIES_TaskId",
                table: "WIXI_PM_TIME_ENTRIES",
                column: "TaskId");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_PM_TIME_ENTRIES_UserId_EndedAt",
                table: "WIXI_PM_TIME_ENTRIES",
                columns: new[] { "UserId", "EndedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WIXI_PM_PROJECT_MEMBERS");

            migrationBuilder.DropTable(
                name: "WIXI_PM_TASK_ASSIGNEES");

            migrationBuilder.DropTable(
                name: "WIXI_PM_TASK_ATTACHMENTS");

            migrationBuilder.DropTable(
                name: "WIXI_PM_TASK_COMMENTS");

            migrationBuilder.DropTable(
                name: "WIXI_PM_TASK_DEPENDENCIES");

            migrationBuilder.DropTable(
                name: "WIXI_PM_TIME_ENTRIES");

            migrationBuilder.DropTable(
                name: "WIXI_PM_TASKS");

            migrationBuilder.DropTable(
                name: "WIXI_PM_PROJECTS");
        }
    }
}
