using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace wixi.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class UpdateUserEntityWithIdentityFeatures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AccessFailedCount",
                table: "wixi_Users",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "ConcurrencyStamp",
                table: "wixi_Users",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "LockoutEnabled",
                table: "wixi_Users",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "LockoutEnd",
                table: "wixi_Users",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NormalizedEmail",
                table: "wixi_Users",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "NormalizedUserName",
                table: "wixi_Users",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PhoneNumber",
                table: "wixi_Users",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "PhoneNumberConfirmed",
                table: "wixi_Users",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "SecurityStamp",
                table: "wixi_Users",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TwoFactorCode",
                table: "wixi_Users",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "TwoFactorCodeExpiration",
                table: "wixi_Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "TwoFactorEnabled",
                table: "wixi_Users",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "UserName",
                table: "wixi_Users",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Users_NormalizedEmail",
                table: "wixi_Users",
                column: "NormalizedEmail",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Users_NormalizedUserName",
                table: "wixi_Users",
                column: "NormalizedUserName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Users_UserName",
                table: "wixi_Users",
                column: "UserName",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_wixi_Users_NormalizedEmail",
                table: "wixi_Users");

            migrationBuilder.DropIndex(
                name: "IX_wixi_Users_NormalizedUserName",
                table: "wixi_Users");

            migrationBuilder.DropIndex(
                name: "IX_wixi_Users_UserName",
                table: "wixi_Users");

            migrationBuilder.DropColumn(
                name: "AccessFailedCount",
                table: "wixi_Users");

            migrationBuilder.DropColumn(
                name: "ConcurrencyStamp",
                table: "wixi_Users");

            migrationBuilder.DropColumn(
                name: "LockoutEnabled",
                table: "wixi_Users");

            migrationBuilder.DropColumn(
                name: "LockoutEnd",
                table: "wixi_Users");

            migrationBuilder.DropColumn(
                name: "NormalizedEmail",
                table: "wixi_Users");

            migrationBuilder.DropColumn(
                name: "NormalizedUserName",
                table: "wixi_Users");

            migrationBuilder.DropColumn(
                name: "PhoneNumber",
                table: "wixi_Users");

            migrationBuilder.DropColumn(
                name: "PhoneNumberConfirmed",
                table: "wixi_Users");

            migrationBuilder.DropColumn(
                name: "SecurityStamp",
                table: "wixi_Users");

            migrationBuilder.DropColumn(
                name: "TwoFactorCode",
                table: "wixi_Users");

            migrationBuilder.DropColumn(
                name: "TwoFactorCodeExpiration",
                table: "wixi_Users");

            migrationBuilder.DropColumn(
                name: "TwoFactorEnabled",
                table: "wixi_Users");

            migrationBuilder.DropColumn(
                name: "UserName",
                table: "wixi_Users");
        }
    }
}
