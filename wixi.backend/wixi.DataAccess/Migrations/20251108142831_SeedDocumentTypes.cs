using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace wixi.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class SeedDocumentTypes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "wixi_DocumentTypes",
                columns: new[] { "Id", "AllowedFileTypes", "Code", "CreatedAt", "Description_AR", "Description_DE", "Description_EN", "Description_TR", "DisplayOrder", "EducationTypeId", "IconName", "IsActive", "IsRequired", "MaxFileSizeBytes", "Name_AR", "Name_DE", "Name_EN", "Name_TR", "Note_AR", "Note_DE", "Note_EN", "Note_TR", "RequiresApproval", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, ".pdf", "passport", new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "نسخة ملونة ممسوحة ضوئيًا لجميع صفحات جواز سفرك", "Farbige gescannte Kopie aller Seiten Ihres Reisepasses", "Color scanned copy of all pages of your passport", "Pasaportunuzun tüm sayfalarının renkli taranmış kopyası", 1, null, "passport", true, true, 10485760L, "جواز السفر (نسخة ملونة - PDF)", "Reisepass (Farbkopie - PDF)", "Passport (Color Copy - PDF)", "Pasaport (Renkli Fotokopi - PDF)", null, null, null, null, true, null },
                    { 2, ".pdf,.doc,.docx", "cv", new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "سيرتك الذاتية الحالية (يفضل الألمانية أو الإنجليزية)", "Ihr aktueller Lebenslauf (Deutsch oder Englisch bevorzugt)", "Your current resume (German or English preferred)", "Güncel özgeçmişiniz (Almanca veya İngilizce tercih edilir)", 2, null, "file-text", true, true, 5242880L, "السيرة الذاتية", "Lebenslauf / CV", "Resume / CV", "Özgeçmiş / CV", "نقدم خدمة إعداد السيرة الذاتية باللغة الألمانية مقابل 20 يورو", "Wir bieten einen deutschen Lebenslauf-Erstellungsservice für 20€ an", "We offer German CV preparation service for 20€", "20€ ücret karşılığında Almanca CV hazırlama hizmeti sunuyoruz", true, null },
                    { 3, ".pdf", "diploma", new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "دبلوم آخر تخرج لك", "Diplom Ihres letzten Abschlusses", "Diploma from your most recent graduation", "En son mezun olduğunuz okul diploması", 3, null, "award", true, true, 10485760L, "الدبلوم (نسخة ملونة - PDF)", "Diplom (Farbkopie - PDF)", "Diploma (Color Copy - PDF)", "Diploma (Renkli Fotokopi - PDF)", null, null, null, null, true, null },
                    { 4, ".pdf", "transcript", new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "كشف الدرجات الأكاديمي لتعليمك", "Akademisches Zeugnis Ihrer Ausbildung", "Academic transcript of your education", "Eğitim sürecinizin not döküm belgesi", 4, null, "file-spreadsheet", true, false, 10485760L, "كشف العلامات", "Zeugnis / Notenübersicht", "Transcript / Grade Report", "Transkript / Not Dökümü", null, null, null, null, true, null },
                    { 5, ".pdf", "language_cert", new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "شهادة الكفاءة اللغوية (TOEFL، IELTS، TestDaF، إلخ)", "Sprachnachweis (TOEFL, IELTS, TestDaF, usw.)", "Language proficiency certificate (TOEFL, IELTS, TestDaF, etc.)", "Dil yeterlilik belgeniz (TOEFL, IELTS, TestDaF, vb.)", 5, null, "language", true, false, 10485760L, "شهادة اللغة (الألمانية / الإنجليزية)", "Sprachzertifikat (Deutsch/Englisch)", "Language Certificate (German/English)", "Dil Sertifikası (Almanca/İngilizce)", null, null, null, null, true, null },
                    { 6, ".pdf,.jpg,.png", "id_card", new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "الجهة الأمامية والخلفية لبطاقة هويتك", "Vorder- und Rückseite Ihres Personalausweises", "Front and back of your ID card", "Kimlik kartınızın ön ve arka yüzü", 6, null, "id-card", true, true, 5242880L, "بطاقة الهوية (الأمام والخلف)", "Personalausweis (Vorder-Rückseite)", "ID Card (Front-Back)", "Kimlik Kartı (Ön-Arka)", null, null, null, null, true, null },
                    { 7, ".jpg,.jpeg,.png", "photo", new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "صورة حديثة بتنسيق جواز السفر", "Aktuelles Foto im Passformat", "Recent photo in passport format", "Pasaport formatında güncel fotoğrafınız", 7, null, "camera", true, true, 2097152L, "صورة بيومترية", "Biometrisches Foto", "Biometric Photo", "Biyometrik Fotoğraf", null, null, null, null, false, null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "wixi_DocumentTypes",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "wixi_DocumentTypes",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "wixi_DocumentTypes",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "wixi_DocumentTypes",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "wixi_DocumentTypes",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "wixi_DocumentTypes",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "wixi_DocumentTypes",
                keyColumn: "Id",
                keyValue: 7);
        }
    }
}
