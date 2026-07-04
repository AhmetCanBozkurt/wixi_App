using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Wixi.Modules.ECommerce.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class M02CrmCustomerCore : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "BirthDate",
                table: "WIXI_EC_CUSTOMERS",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BlacklistReason",
                table: "WIXI_EC_CUSTOMERS",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "EmailOptIn",
                table: "WIXI_EC_CUSTOMERS",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "Gender",
                table: "WIXI_EC_CUSTOMERS",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsBlacklisted",
                table: "WIXI_EC_CUSTOMERS",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsGuest",
                table: "WIXI_EC_CUSTOMERS",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsPhoneVerified",
                table: "WIXI_EC_CUSTOMERS",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "KvkkConsentDate",
                table: "WIXI_EC_CUSTOMERS",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastOrderDate",
                table: "WIXI_EC_CUSTOMERS",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "LtvAmount",
                table: "WIXI_EC_CUSTOMERS",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "ProfileImagePath",
                table: "WIXI_EC_CUSTOMERS",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "PushOptIn",
                table: "WIXI_EC_CUSTOMERS",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "RfmSegment",
                table: "WIXI_EC_CUSTOMERS",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "SmsOptIn",
                table: "WIXI_EC_CUSTOMERS",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "TotalOrders",
                table: "WIXI_EC_CUSTOMERS",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "CompanyName",
                table: "WIXI_EC_ADDRESSES",
                type: "nvarchar(300)",
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TaxNumber",
                table: "WIXI_EC_ADDRESSES",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TaxOfficeName",
                table: "WIXI_EC_ADDRESSES",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "WIXI_EC_CUSTOMER_NOTES",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NoteType = table.Column<int>(type: "int", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    IsPrivate = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByUser = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WIXI_EC_CUSTOMER_NOTES", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WIXI_EC_CUSTOMER_NOTES_WIXI_EC_CUSTOMERS_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "WIXI_EC_CUSTOMERS",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_EC_CUSTOMERS_RfmSegment",
                table: "WIXI_EC_CUSTOMERS",
                column: "RfmSegment");

            migrationBuilder.CreateIndex(
                name: "IX_WIXI_EC_CUSTOMER_NOTES_CustomerId",
                table: "WIXI_EC_CUSTOMER_NOTES",
                column: "CustomerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WIXI_EC_CUSTOMER_NOTES");

            migrationBuilder.DropIndex(
                name: "IX_WIXI_EC_CUSTOMERS_RfmSegment",
                table: "WIXI_EC_CUSTOMERS");

            migrationBuilder.DropColumn(
                name: "BirthDate",
                table: "WIXI_EC_CUSTOMERS");

            migrationBuilder.DropColumn(
                name: "BlacklistReason",
                table: "WIXI_EC_CUSTOMERS");

            migrationBuilder.DropColumn(
                name: "EmailOptIn",
                table: "WIXI_EC_CUSTOMERS");

            migrationBuilder.DropColumn(
                name: "Gender",
                table: "WIXI_EC_CUSTOMERS");

            migrationBuilder.DropColumn(
                name: "IsBlacklisted",
                table: "WIXI_EC_CUSTOMERS");

            migrationBuilder.DropColumn(
                name: "IsGuest",
                table: "WIXI_EC_CUSTOMERS");

            migrationBuilder.DropColumn(
                name: "IsPhoneVerified",
                table: "WIXI_EC_CUSTOMERS");

            migrationBuilder.DropColumn(
                name: "KvkkConsentDate",
                table: "WIXI_EC_CUSTOMERS");

            migrationBuilder.DropColumn(
                name: "LastOrderDate",
                table: "WIXI_EC_CUSTOMERS");

            migrationBuilder.DropColumn(
                name: "LtvAmount",
                table: "WIXI_EC_CUSTOMERS");

            migrationBuilder.DropColumn(
                name: "ProfileImagePath",
                table: "WIXI_EC_CUSTOMERS");

            migrationBuilder.DropColumn(
                name: "PushOptIn",
                table: "WIXI_EC_CUSTOMERS");

            migrationBuilder.DropColumn(
                name: "RfmSegment",
                table: "WIXI_EC_CUSTOMERS");

            migrationBuilder.DropColumn(
                name: "SmsOptIn",
                table: "WIXI_EC_CUSTOMERS");

            migrationBuilder.DropColumn(
                name: "TotalOrders",
                table: "WIXI_EC_CUSTOMERS");

            migrationBuilder.DropColumn(
                name: "CompanyName",
                table: "WIXI_EC_ADDRESSES");

            migrationBuilder.DropColumn(
                name: "TaxNumber",
                table: "WIXI_EC_ADDRESSES");

            migrationBuilder.DropColumn(
                name: "TaxOfficeName",
                table: "WIXI_EC_ADDRESSES");
        }
    }
}
