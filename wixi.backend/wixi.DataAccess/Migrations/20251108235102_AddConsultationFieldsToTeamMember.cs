using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace wixi.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddConsultationFieldsToTeamMember : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "CanProvideConsultation",
                table: "wixi_TeamMembers",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ConsultationCurrency",
                table: "wixi_TeamMembers",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ConsultationPrice",
                table: "wixi_TeamMembers",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_wixi_TeamMembers_CanProvideConsultation",
                table: "wixi_TeamMembers",
                column: "CanProvideConsultation");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_wixi_TeamMembers_CanProvideConsultation",
                table: "wixi_TeamMembers");

            migrationBuilder.DropColumn(
                name: "CanProvideConsultation",
                table: "wixi_TeamMembers");

            migrationBuilder.DropColumn(
                name: "ConsultationCurrency",
                table: "wixi_TeamMembers");

            migrationBuilder.DropColumn(
                name: "ConsultationPrice",
                table: "wixi_TeamMembers");
        }
    }
}
