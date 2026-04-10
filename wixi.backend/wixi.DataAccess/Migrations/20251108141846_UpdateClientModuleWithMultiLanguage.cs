using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace wixi.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class UpdateClientModuleWithMultiLanguage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Name",
                table: "wixi_EducationTypes");

            migrationBuilder.DropColumn(
                name: "Grade",
                table: "wixi_EducationInfos");

            migrationBuilder.DropColumn(
                name: "InstitutionName",
                table: "wixi_EducationInfos");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "wixi_EducationInfos");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "wixi_Clients");

            migrationBuilder.RenameColumn(
                name: "ExpiresAt",
                table: "wixi_PendingClientCodes",
                newName: "ExpirationDate");

            migrationBuilder.RenameColumn(
                name: "Description",
                table: "wixi_EducationTypes",
                newName: "IconName");

            migrationBuilder.RenameColumn(
                name: "EndDate",
                table: "wixi_EducationInfos",
                newName: "GraduationDate");

            migrationBuilder.AddColumn<string>(
                name: "ClientCode",
                table: "wixi_PendingClientCodes",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<long>(
                name: "EmployeeSubmissionId",
                table: "wixi_PendingClientCodes",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FullName",
                table: "wixi_PendingClientCodes",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "wixi_PendingClientCodes",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Code",
                table: "wixi_EducationTypes",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Description_AR",
                table: "wixi_EducationTypes",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description_DE",
                table: "wixi_EducationTypes",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description_EN",
                table: "wixi_EducationTypes",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description_TR",
                table: "wixi_EducationTypes",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Name_AR",
                table: "wixi_EducationTypes",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Name_DE",
                table: "wixi_EducationTypes",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Name_EN",
                table: "wixi_EducationTypes",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Name_TR",
                table: "wixi_EducationTypes",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "wixi_EducationTypes",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Degree",
                table: "wixi_EducationInfos",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "GPA",
                table: "wixi_EducationInfos",
                type: "decimal(3,2)",
                precision: 3,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Institution",
                table: "wixi_EducationInfos",
                type: "nvarchar(300)",
                maxLength: 300,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsCurrent",
                table: "wixi_EducationInfos",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "Level",
                table: "wixi_EducationInfos",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<string>(
                name: "Phone",
                table: "wixi_Clients",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ClientCode",
                table: "wixi_Clients",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "wixi_Clients",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RegistrationDate",
                table: "wixi_Clients",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "wixi_Clients",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "wixi_EducationTypes",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Code", "Description_AR", "Description_DE", "Description_EN", "Description_TR", "IconName", "Name_AR", "Name_DE", "Name_EN", "Name_TR", "UpdatedAt" },
                values: new object[] { "university", "لخريجي الجامعات", "Für Hochschulabsolventen", "For university graduates", "Üniversite mezunları için", "graduation-cap", "خريج جامعي", "Hochschulabsolvent", "University Graduate", "Üniversite Mezunu", null });

            migrationBuilder.UpdateData(
                table: "wixi_EducationTypes",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Code", "Description_AR", "Description_DE", "Description_EN", "Description_TR", "IconName", "Name_AR", "Name_DE", "Name_EN", "Name_TR", "UpdatedAt" },
                values: new object[] { "vocational", "لخريجي المدارس المهنية", "Für Berufsschulabsolventen", "For vocational school graduates", "Meslek lisesi mezunları için", "briefcase", "خريج مدرسة مهنية", "Berufsschulabsolvent", "Vocational School Graduate", "Meslek Lisesi Mezunu", null });

            migrationBuilder.UpdateData(
                table: "wixi_EducationTypes",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Code", "Description_AR", "Description_DE", "Description_EN", "Description_TR", "IconName", "Name_AR", "Name_DE", "Name_EN", "Name_TR", "UpdatedAt" },
                values: new object[] { "apprenticeship", "للمتدربين والحرفيين", "Für Auszubildende und Gesellen", "For apprentices and journeymen", "Kalfa veya çırak belgesi olanlar için", "tools", "تدريب مهني / حرفي", "Lehre / Gesellenprüfung", "Apprenticeship / Journeyman", "Kalfalık / Çıraklık", null });

            migrationBuilder.CreateIndex(
                name: "IX_wixi_PendingClientCodes_ClientCode",
                table: "wixi_PendingClientCodes",
                column: "ClientCode");

            migrationBuilder.CreateIndex(
                name: "IX_wixi_EducationTypes_Code",
                table: "wixi_EducationTypes",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_wixi_Clients_ClientCode",
                table: "wixi_Clients",
                column: "ClientCode",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_wixi_PendingClientCodes_ClientCode",
                table: "wixi_PendingClientCodes");

            migrationBuilder.DropIndex(
                name: "IX_wixi_EducationTypes_Code",
                table: "wixi_EducationTypes");

            migrationBuilder.DropIndex(
                name: "IX_wixi_Clients_ClientCode",
                table: "wixi_Clients");

            migrationBuilder.DropColumn(
                name: "ClientCode",
                table: "wixi_PendingClientCodes");

            migrationBuilder.DropColumn(
                name: "EmployeeSubmissionId",
                table: "wixi_PendingClientCodes");

            migrationBuilder.DropColumn(
                name: "FullName",
                table: "wixi_PendingClientCodes");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "wixi_PendingClientCodes");

            migrationBuilder.DropColumn(
                name: "Code",
                table: "wixi_EducationTypes");

            migrationBuilder.DropColumn(
                name: "Description_AR",
                table: "wixi_EducationTypes");

            migrationBuilder.DropColumn(
                name: "Description_DE",
                table: "wixi_EducationTypes");

            migrationBuilder.DropColumn(
                name: "Description_EN",
                table: "wixi_EducationTypes");

            migrationBuilder.DropColumn(
                name: "Description_TR",
                table: "wixi_EducationTypes");

            migrationBuilder.DropColumn(
                name: "Name_AR",
                table: "wixi_EducationTypes");

            migrationBuilder.DropColumn(
                name: "Name_DE",
                table: "wixi_EducationTypes");

            migrationBuilder.DropColumn(
                name: "Name_EN",
                table: "wixi_EducationTypes");

            migrationBuilder.DropColumn(
                name: "Name_TR",
                table: "wixi_EducationTypes");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "wixi_EducationTypes");

            migrationBuilder.DropColumn(
                name: "GPA",
                table: "wixi_EducationInfos");

            migrationBuilder.DropColumn(
                name: "Institution",
                table: "wixi_EducationInfos");

            migrationBuilder.DropColumn(
                name: "IsCurrent",
                table: "wixi_EducationInfos");

            migrationBuilder.DropColumn(
                name: "Level",
                table: "wixi_EducationInfos");

            migrationBuilder.DropColumn(
                name: "ClientCode",
                table: "wixi_Clients");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "wixi_Clients");

            migrationBuilder.DropColumn(
                name: "RegistrationDate",
                table: "wixi_Clients");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "wixi_Clients");

            migrationBuilder.RenameColumn(
                name: "ExpirationDate",
                table: "wixi_PendingClientCodes",
                newName: "ExpiresAt");

            migrationBuilder.RenameColumn(
                name: "IconName",
                table: "wixi_EducationTypes",
                newName: "Description");

            migrationBuilder.RenameColumn(
                name: "GraduationDate",
                table: "wixi_EducationInfos",
                newName: "EndDate");

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "wixi_EducationTypes",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "Degree",
                table: "wixi_EducationInfos",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AddColumn<string>(
                name: "Grade",
                table: "wixi_EducationInfos",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InstitutionName",
                table: "wixi_EducationInfos",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "wixi_EducationInfos",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Phone",
                table: "wixi_Clients",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "wixi_Clients",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.UpdateData(
                table: "wixi_EducationTypes",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Description", "Name" },
                values: new object[] { "University Education", "University" });

            migrationBuilder.UpdateData(
                table: "wixi_EducationTypes",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Meslek Lisesi", "Vocational School" });

            migrationBuilder.UpdateData(
                table: "wixi_EducationTypes",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Kalfalık", "Apprenticeship" });
        }
    }
}
