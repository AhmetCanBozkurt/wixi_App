using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace wixi.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTemplate4AsDefaultWithAllSteps : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "wixi_ApplicationStepTemplates",
                columns: new[] { "Id", "ApplicationTemplateId", "CreatedAt", "Description_AR", "Description_DE", "Description_EN", "Description_TR", "EstimatedDurationDays", "IconName", "IsActive", "IsRequired", "StepOrder", "Title_AR", "Title_DE", "Title_EN", "Title_TR", "UpdatedAt" },
                values: new object[,]
                {
                    { 4, 4, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "إجراءات الاعتراف بالدبلوم وعملية الموافقة", "Diplomanerkennung und Genehmigungsverfahren", "Diploma recognition procedures and approval process", "Diploma denklik işlemleri ve onay süreci", 90, "file-check", true, true, 1, "إجراءات الاعتراف", "Anerkennungsverfahren", "Recognition Procedures", "Denklik İşlemleri", null },
                    { 5, 4, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "إجراءات البحث عن عمل وتصريح العمل", "Jobsuche und Arbeitserlaubnisantrag", "Job search and work permit application procedures", "İş arama ve çalışma izni başvuru süreçleri", 120, "briefcase", true, true, 2, "إجراءات تصريح العمل", "Arbeitserlaubnisverfahren", "Work Permit Procedures", "İş Bulma ve Çalışma İzni İşlemleri", null },
                    { 6, 4, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "عملية طلب التأشيرة والموافقة", "Visumantrags- und Genehmigungsverfahren", "Visa application and approval process", "Vize başvurusu ve onay süreci", 60, "globe", true, true, 3, "إجراءات التأشيرة", "Visumverfahren", "Visa Procedures", "Vize İşlemleri", null }
                });

            migrationBuilder.UpdateData(
                table: "wixi_ApplicationTemplates",
                keyColumn: "Id",
                keyValue: 1,
                column: "IsDefault",
                value: false);

            migrationBuilder.UpdateData(
                table: "wixi_ApplicationTemplates",
                keyColumn: "Id",
                keyValue: 4,
                column: "IsDefault",
                value: true);

            migrationBuilder.InsertData(
                table: "wixi_ApplicationSubStepTemplates",
                columns: new[] { "Id", "CreatedAt", "Description_AR", "Description_DE", "Description_EN", "Description_TR", "EstimatedDurationDays", "IsActive", "IsRequired", "Name_AR", "Name_DE", "Name_EN", "Name_TR", "StepTemplateId", "SubStepOrder", "UpdatedAt" },
                values: new object[,]
                {
                    { 13, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "تم تحميل المستندات المطلوبة إلى النظام", "Erforderliche Dokumente ins System hochgeladen", "Required documents uploaded to system", "Gerekli belgeler sisteme yüklendi", 3, true, true, "تم تحميل المستندات", "Dokumente hochgeladen", "Documents Uploaded", "Belgeler Yüklendi", 4, 1, null },
                    { 14, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "تم تقديم طلب الاعتراف إلى السلطة المختصة", "Anerkennungsantrag bei zuständiger Behörde eingereicht", "Recognition application submitted to relevant authority", "Denklik başvurusu ilgili kuruma yapıldı", 7, true, true, "تم تقديم طلب الاعتراف", "Anerkennungsantrag eingereicht", "Recognition Application Submitted", "Denklik Başvurusu Yapıldı", 4, 2, null },
                    { 15, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "تم دفع رسوم معالجة الاعتراف", "Anerkennungsbearbeitungsgebühr bezahlt", "Recognition processing fee paid", "Denklik işlem ücreti ödendi", 2, true, true, "تم دفع رسوم الاعتراف", "Anerkennungsgebühr bezahlt", "Recognition Fee Paid", "Denklik Harç Ödemesi Yapıldı", 4, 3, null },
                    { 16, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "شهادة الاعتراف معتمدة وجاهزة", "Anerkennungszertifikat genehmigt und fertig", "Recognition certificate approved and ready", "Denklik belgesi onaylandı ve hazır", 78, true, true, "شهادة الاعتراف جاهزة", "Anerkennungszertifikat fertig", "Recognition Certificate Ready", "Denklik Belgesi Hazır", 4, 4, null },
                    { 17, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "البحث النشط عن عمل", "Aktive Jobsuche", "Actively searching for employment", "Aktif olarak iş aranıyor", 60, true, true, "في عملية البحث عن عمل", "Im Jobsuchprozess", "In Job Search Process", "İş Arama Sürecinde", 5, 1, null },
                    { 18, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "عرض عمل من صاحب العمل", "Stellenangebot vom Arbeitgeber", "Job offer made by employer", "İşveren tarafından iş teklifi yapıldı", 7, true, true, "تم استلام عرض العمل", "Stellenangebot erhalten", "Job Offer Received", "İş Teklifi Alındı", 5, 2, null },
                    { 19, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "تم تقديم طلب تصريح العمل الرسمي", "Offizieller Arbeitserlaubnisantrag eingereicht", "Official work permit application submitted", "Çalışma izni için resmi başvuru yapıldı", 45, true, true, "تم تقديم طلب تصريح العمل", "Arbeitserlaubnisantrag eingereicht", "Work Permit Application Submitted", "Çalışma İzni Başvurusu Yapıldı", 5, 3, null },
                    { 20, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "تم الموافقة رسميًا على تصريح العمل", "Arbeitserlaubnis offiziell genehmigt", "Work permit officially approved", "Çalışma izni resmi olarak onaylandı", 8, true, true, "تم الموافقة على تصريح العمل", "Arbeitserlaubnis genehmigt", "Work Permit Approved", "Çalışma İzni Onaylandı", 5, 4, null },
                    { 21, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "تم إعداد المستندات المطلوبة لطلب التأشيرة", "Erforderliche Dokumente für Visumantrag vorbereitet", "Required documents for visa application prepared", "Vize başvurusu için gerekli belgeler hazırlandı", 5, true, true, "تم إعداد مستندات طلب التأشيرة", "Visumantragsunterlagen vorbereitet", "Visa Application Documents Prepared", "Vize Başvuru Belgeler Hazırlandı", 6, 1, null },
                    { 22, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "تم تقديم طلب التأشيرة إلى القنصلية", "Visumantrag beim Konsulat eingereicht", "Visa application submitted to consulate", "Vize başvurusu konsolosluğa yapıldı", 35, true, true, "تم تقديم طلب التأشيرة", "Visumantrag eingereicht", "Visa Application Submitted", "Vize Başvurusu Yapıldı", 6, 2, null },
                    { 23, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "تم الموافقة على طلب التأشيرة وجاهزة", "Visumantrag genehmigt und fertig", "Visa application approved and ready", "Vize başvurusu onaylandı ve hazır", 20, true, true, "تم الموافقة على التأشيرة", "Visum genehmigt", "Visa Approved", "Vize Onaylandı", 6, 3, null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "wixi_ApplicationSubStepTemplates",
                keyColumn: "Id",
                keyValue: 13);

            migrationBuilder.DeleteData(
                table: "wixi_ApplicationSubStepTemplates",
                keyColumn: "Id",
                keyValue: 14);

            migrationBuilder.DeleteData(
                table: "wixi_ApplicationSubStepTemplates",
                keyColumn: "Id",
                keyValue: 15);

            migrationBuilder.DeleteData(
                table: "wixi_ApplicationSubStepTemplates",
                keyColumn: "Id",
                keyValue: 16);

            migrationBuilder.DeleteData(
                table: "wixi_ApplicationSubStepTemplates",
                keyColumn: "Id",
                keyValue: 17);

            migrationBuilder.DeleteData(
                table: "wixi_ApplicationSubStepTemplates",
                keyColumn: "Id",
                keyValue: 18);

            migrationBuilder.DeleteData(
                table: "wixi_ApplicationSubStepTemplates",
                keyColumn: "Id",
                keyValue: 19);

            migrationBuilder.DeleteData(
                table: "wixi_ApplicationSubStepTemplates",
                keyColumn: "Id",
                keyValue: 20);

            migrationBuilder.DeleteData(
                table: "wixi_ApplicationSubStepTemplates",
                keyColumn: "Id",
                keyValue: 21);

            migrationBuilder.DeleteData(
                table: "wixi_ApplicationSubStepTemplates",
                keyColumn: "Id",
                keyValue: 22);

            migrationBuilder.DeleteData(
                table: "wixi_ApplicationSubStepTemplates",
                keyColumn: "Id",
                keyValue: 23);

            migrationBuilder.DeleteData(
                table: "wixi_ApplicationStepTemplates",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "wixi_ApplicationStepTemplates",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "wixi_ApplicationStepTemplates",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.UpdateData(
                table: "wixi_ApplicationTemplates",
                keyColumn: "Id",
                keyValue: 1,
                column: "IsDefault",
                value: true);

            migrationBuilder.UpdateData(
                table: "wixi_ApplicationTemplates",
                keyColumn: "Id",
                keyValue: 4,
                column: "IsDefault",
                value: false);
        }
    }
}
