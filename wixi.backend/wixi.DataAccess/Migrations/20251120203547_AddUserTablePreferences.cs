using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace wixi.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddUserTablePreferences : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "wixi_UserTablePreferences",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    TableKey = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    VisibleColumns = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "[]"),
                    ColumnOrder = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "[]"),
                    ColumnFilters = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "{}"),
                    SortConfig = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "{}"),
                    PageSize = table.Column<int>(type: "int", nullable: false, defaultValue: 20),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wixi_UserTablePreferences", x => x.Id);
                    table.ForeignKey(
                        name: "FK_wixi_UserTablePreferences_wixi_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "wixi_Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_wixi_UserTablePreferences_UserId_TableKey",
                table: "wixi_UserTablePreferences",
                columns: new[] { "UserId", "TableKey" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "wixi_UserTablePreferences");
        }
    }
}
