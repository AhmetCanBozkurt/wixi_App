using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace wixi.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddClientNavigationToDocument : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddForeignKey(
                name: "FK_wixi_Documents_wixi_Clients_ClientId",
                table: "wixi_Documents",
                column: "ClientId",
                principalTable: "wixi_Clients",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_wixi_Documents_wixi_Clients_ClientId",
                table: "wixi_Documents");
        }
    }
}
