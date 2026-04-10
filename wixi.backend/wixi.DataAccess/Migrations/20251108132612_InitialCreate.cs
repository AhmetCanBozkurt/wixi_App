using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace wixi.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "wixi_AuditLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: true),
                    Action = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    EntityName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EntityId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OldValues = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NewValues = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IpAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserAgent = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_AuditLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "wixi_Roles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_Roles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "wixi_Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    EmailConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastLoginAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "wixi_RefreshTokens",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Token = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsRevoked = table.Column<bool>(type: "bit", nullable: false),
                    RevokedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IpAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserAgent = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_RefreshTokens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_wixi_RefreshTokens_wixi_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "wixi_Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "wixi_UserRoles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    RoleId = table.Column<int>(type: "int", nullable: false),
                    AssignedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_UserRoles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_wixi_UserRoles_wixi_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "wixi_Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_wixi_UserRoles_wixi_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "wixi_Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "wixi_Roles",
                columns: new[] { "Id", "CreatedAt", "Description", "Name" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "System Administrator", "Admin" },
                    { 2, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "Client User", "Client" },
                    { 3, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "Employee User", "Employee" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_wixi_AuditLogs_Action",
                table: "wixi_AuditLogs",
                column: "Action");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_AuditLogs_CreatedAt",
                table: "wixi_AuditLogs",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_AuditLogs_UserId",
                table: "wixi_AuditLogs",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_RefreshTokens_Token",
                table: "wixi_RefreshTokens",
                column: "Token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_wixi_RefreshTokens_UserId",
                table: "wixi_RefreshTokens",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Roles_Name",
                table: "wixi_Roles",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_wixi_UserRoles_RoleId",
                table: "wixi_UserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_UserRoles_UserId_RoleId",
                table: "wixi_UserRoles",
                columns: new[] { "UserId", "RoleId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Users_Email",
                table: "wixi_Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "wixi_AuditLogs");

            migrationBuilder.DropTable(
                name: "wixi_RefreshTokens");

            migrationBuilder.DropTable(
                name: "wixi_UserRoles");

            migrationBuilder.DropTable(
                name: "wixi_Roles");

            migrationBuilder.DropTable(
                name: "wixi_Users");
        }
    }
}
