using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace wixi.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddCompleteSeedData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "wixi_ApplicationTemplates",
                columns: new[] { "Id", "CreatedAt", "Description_AR", "Description_DE", "Description_EN", "Description_TR", "DisplayOrder", "EstimatedDurationDays", "IconName", "IsActive", "IsDefault", "MaxDurationDays", "MinDurationDays", "Name_AR", "Name_DE", "Name_EN", "Name_TR", "Type", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "العملية القياسية لإجراءات الاعتراف بالدبلوم", "Standardverfahren für Diplomanerkennung", "Standard process for diploma recognition procedures", "Diploma denklik işlemleri için standart süreç", 1, 90, "award", true, true, 180, 60, "عملية الاعتراف", "Anerkennungsverfahren", "Recognition Process", "Denklik İşlem Süreci", 1, null },
                    { 2, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "عملية البحث عن عمل وتصريح العمل", "Jobsuche und Arbeitserlaubnisantrag", "Job search and work permit application process", "İş arama ve çalışma izni başvuru süreci", 2, 120, "briefcase", true, false, 240, 90, "عملية تصريح العمل", "Arbeitserlaubnisverfahren", "Work Permit Process", "İş Bulma ve Çalışma İzni Süreci", 2, null },
                    { 3, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "عملية طلب التأشيرة والمتابعة", "Visumantrags- und Verfolgungsverfahren", "Visa application and tracking process", "Vize başvurusu ve takip süreci", 3, 60, "globe", true, false, 120, 30, "عملية التأشيرة", "Visumverfahren", "Visa Process", "Vize İşlem Süreci", 3, null },
                    { 4, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "العملية الكاملة بما في ذلك الاعتراف وتصريح العمل والتأشيرة", "Vollständiger Prozess einschließlich Anerkennung, Arbeitserlaubnis und Visum", "Complete process including recognition, work permit and visa procedures", "Denklik, iş izni ve vize işlemlerini içeren tam süreç", 4, 180, "list-checks", true, false, 360, 120, "العملية الكاملة (الكل)", "Vollständiger Prozess (Alle)", "Full Process (All)", "Tam Süreç (Hepsi)", 4, null }
                });

            migrationBuilder.InsertData(
                table: "wixi_FAQs",
                columns: new[] { "Id", "Answer_AR", "Answer_DE", "Answer_EN", "Answer_TR", "AuthorId", "Category", "CreatedAt", "DisplayOrder", "HelpfulCount", "IsActive", "IsFeatured", "NotHelpfulCount", "PublishedAt", "Question_AR", "Question_DE", "Question_EN", "Question_TR", "RelatedLink", "Tags", "UpdatedAt", "VideoUrl", "ViewCount" },
                values: new object[,]
                {
                    { 1, "تستغرق عملية التقديم عادةً 3-6 أشهر حتى تكتمل. قد تختلف المدة اعتمادًا على نوع الطلب والتقديم الكامل للمستندات المطلوبة.", "Der Bewerbungsprozess dauert in der Regel 3-6 Monate. Die Dauer kann je nach Art der Bewerbung und vollständiger Einreichung der erforderlichen Dokumente variieren.", "The application process typically takes 3-6 months to complete. Duration may vary depending on the application type and complete submission of required documents.", "Başvuru süreci ortalama 3-6 ay arasında tamamlanır. Süre, başvuru tipine ve gerekli belgelerin eksiksiz sunulmasına bağlı olarak değişebilir.", null, 1, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), 1, 0, true, true, 0, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "كم من الوقت تستغرق عملية التقديم؟", "Wie lange dauert der Bewerbungsprozess?", "How long does the application process take?", "Başvuru süreci ne kadar sürer?", null, "başvuru,süre,process,duration", null, null, 0 },
                    { 2, "تختلف المستندات المطلوبة بناءً على مستوى تعليمك. جواز السفر والدبلوم وكشف الدرجات والسيرة الذاتية ووثيقة الهوية هي المتطلبات الأساسية. تحقق من صفحة تحميل المستندات للحصول على قائمة مفصلة.", "Die erforderlichen Dokumente variieren je nach Bildungsniveau. Reisepass, Diplom, Zeugnis, Lebenslauf und Ausweisdokument sind grundlegende Anforderungen. Überprüfen Sie die Dokumenten-Upload-Seite für eine detaillierte Liste.", "Required documents vary based on your education level. Passport, diploma, transcript, CV and ID document are basic requirements. Check the document upload page for detailed list.", "Yüklemeniz gereken belgeler eğitim durumunuza göre değişir. Pasaport, diploma, transkript, CV ve kimlik belgesi temel belgelerdir. Ayrıntılı liste için belge yükleme sayfasını kontrol edin.", null, 2, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), 2, 0, true, true, 0, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "ما هي المستندات التي أحتاج لتحميلها؟", "Welche Dokumente muss ich hochladen?", "Which documents do I need to upload?", "Hangi belgeleri yüklemem gerekiyor?", null, "belgeler,documents,yükleme,upload", null, null, 0 },
                    { 3, "يمكنك تتبع جميع مراحل طلبك في الوقت الفعلي من صفحة لوحة التحكم. يتم عرض حالة ونسبة إكمال كل خطوة.", "Sie können alle Phasen Ihrer Bewerbung in Echtzeit von der Dashboard-Seite aus verfolgen. Status und Abschlussgrad jedes Schritts werden angezeigt.", "You can track all stages of your application in real-time from the Dashboard page. Status and completion percentage of each step are displayed.", "Dashboard sayfasından başvurunuzun tüm aşamalarını gerçek zamanlı olarak takip edebilirsiniz. Her adımın durumu ve tamamlanma yüzdesi görüntülenir.", null, 3, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), 3, 0, true, true, 0, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "كيف يمكنني تتبع حالة طلبي؟", "Wie kann ich meinen Bewerbungsstatus verfolgen?", "How can I track my application status?", "Başvuru durumumu nasıl takip edebilirim?", null, "takip,tracking,durum,status", null, null, 0 },
                    { 4, "الاعتراف هو عملية الحصول على اعتراف بالدبلومات والشهادات المكتسبة في الخارج في ألمانيا. تتيح لك هذه العملية ممارسة مهنتك في ألمانيا.", "Anerkennung ist der Prozess der Anerkennung von im Ausland erworbenen Diplomen und Zertifikaten in Deutschland. Dieser Prozess ermöglicht es Ihnen, Ihren Beruf in Deutschland auszuüben.", "Recognition is the process of having diplomas and certificates obtained abroad recognized in Germany. This process allows you to practice your profession in Germany.", "Denklik, yurt dışında alınan diploma ve belgelerin Almanya'da tanınması işlemidir. Bu işlem sayesinde mesleğinizi Almanya'da icra edebilirsiniz.", null, 9, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), 4, 0, true, true, 0, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "ما هي عملية الاعتراف؟", "Was ist der Anerkennungsprozess?", "What is the recognition process?", "Denklik işlemi nedir?", null, "denklik,recognition,diploma,anerkennung", null, null, 0 },
                    { 5, "للحصول على تصريح عمل، تحتاج أولاً إلى العثور على صاحب عمل في ألمانيا. يتقدم صاحب العمل نيابة عنك إلى Agentur für Arbeit. بعد الموافقة، يتم إصدار تصريح العمل الخاص بك.", "Um eine Arbeitserlaubnis zu erhalten, müssen Sie zunächst einen Arbeitgeber in Deutschland finden. Der Arbeitgeber beantragt für Sie bei der Agentur für Arbeit. Nach Genehmigung wird Ihre Arbeitserlaubnis ausgestellt.", "To get a work permit, you first need to find an employer in Germany. The employer applies to the Agentur für Arbeit on your behalf. After approval, your work permit is issued.", "Çalışma izni için önce Almanya'da bir işveren bulmalısınız. İşveren sizin için Agentur für Arbeit'a başvuru yapar. Onay sonrası çalışma izniniz düzenlenir.", null, 8, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), 5, 0, true, false, 0, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "كيفية الحصول على تصريح عمل؟", "Wie bekomme ich eine Arbeitserlaubnis?", "How to get a work permit?", "Çalışma izni nasıl alınır?", null, "çalışma izni,work permit,arbeitserlaubnis,employment", null, null, 0 }
                });

            migrationBuilder.InsertData(
                table: "wixi_ApplicationStepTemplates",
                columns: new[] { "Id", "ApplicationTemplateId", "CreatedAt", "Description_AR", "Description_DE", "Description_EN", "Description_TR", "EstimatedDurationDays", "IconName", "IsActive", "IsRequired", "StepOrder", "Title_AR", "Title_DE", "Title_EN", "Title_TR", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, 1, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "إجراءات الاعتراف بالدبلوم وعملية الموافقة", "Diplomanerkennung und Genehmigungsverfahren", "Diploma recognition procedures and approval process", "Diploma denklik işlemleri ve onay süreci", 90, "file-check", true, true, 1, "إجراءات الاعتراف", "Anerkennungsverfahren", "Recognition Procedures", "Denklik İşlemleri", null },
                    { 2, 2, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "إجراءات البحث عن عمل وتصريح العمل", "Jobsuche und Arbeitserlaubnisantrag", "Job search and work permit application procedures", "İş arama ve çalışma izni başvuru süreçleri", 120, "briefcase", true, true, 1, "إجراءات تصريح العمل", "Arbeitserlaubnisverfahren", "Work Permit Procedures", "İş Bulma ve Çalışma İzni İşlemleri", null },
                    { 3, 3, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "عملية طلب التأشيرة والموافقة", "Visumantrags- und Genehmigungsverfahren", "Visa application and approval process", "Vize başvurusu ve onay süreci", 60, "globe", true, true, 1, "إجراءات التأشيرة", "Visumverfahren", "Visa Procedures", "Vize İşlemleri", null }
                });

            migrationBuilder.InsertData(
                table: "wixi_ApplicationSubStepTemplates",
                columns: new[] { "Id", "CreatedAt", "Description_AR", "Description_DE", "Description_EN", "Description_TR", "EstimatedDurationDays", "IsActive", "IsRequired", "Name_AR", "Name_DE", "Name_EN", "Name_TR", "StepTemplateId", "SubStepOrder", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "تم تحميل المستندات المطلوبة إلى النظام", "Erforderliche Dokumente ins System hochgeladen", "Required documents uploaded to system", "Gerekli belgeler sisteme yüklendi", 3, true, true, "تم تحميل المستندات", "Dokumente hochgeladen", "Documents Uploaded", "Belgeler Yüklendi", 1, 1, null },
                    { 2, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "تم تقديم طلب الاعتراف إلى السلطة المختصة", "Anerkennungsantrag bei zuständiger Behörde eingereicht", "Recognition application submitted to relevant authority", "Denklik başvurusu ilgili kuruma yapıldı", 7, true, true, "تم تقديم طلب الاعتراف", "Anerkennungsantrag eingereicht", "Recognition Application Submitted", "Denklik Başvurusu Yapıldı", 1, 2, null },
                    { 3, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "تم دفع رسوم معالجة الاعتراف", "Anerkennungsbearbeitungsgebühr bezahlt", "Recognition processing fee paid", "Denklik işlem ücreti ödendi", 2, true, true, "تم دفع رسوم الاعتراف", "Anerkennungsgebühr bezahlt", "Recognition Fee Paid", "Denklik Harç Ödemesi Yapıldı", 1, 3, null },
                    { 4, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "شهادة الاعتراف معتمدة وجاهزة", "Anerkennungszertifikat genehmigt und fertig", "Recognition certificate approved and ready", "Denklik belgesi onaylandı ve hazır", 78, true, true, "شهادة الاعتراف جاهزة", "Anerkennungszertifikat fertig", "Recognition Certificate Ready", "Denklik Belgesi Hazır", 1, 4, null },
                    { 5, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "البحث النشط عن عمل", "Aktive Jobsuche", "Actively searching for employment", "Aktif olarak iş aranıyor", 60, true, true, "في عملية البحث عن عمل", "Im Jobsuchprozess", "In Job Search Process", "İş Arama Sürecinde", 2, 1, null },
                    { 6, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "عرض عمل من صاحب العمل", "Stellenangebot vom Arbeitgeber", "Job offer made by employer", "İşveren tarafından iş teklifi yapıldı", 7, true, true, "تم استلام عرض العمل", "Stellenangebot erhalten", "Job Offer Received", "İş Teklifi Alındı", 2, 2, null },
                    { 7, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "تم تقديم طلب تصريح العمل الرسمي", "Offizieller Arbeitserlaubnisantrag eingereicht", "Official work permit application submitted", "Çalışma izni için resmi başvuru yapıldı", 45, true, true, "تم تقديم طلب تصريح العمل", "Arbeitserlaubnisantrag eingereicht", "Work Permit Application Submitted", "Çalışma İzni Başvurusu Yapıldı", 2, 3, null },
                    { 8, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "تم الموافقة رسميًا على تصريح العمل", "Arbeitserlaubnis offiziell genehmigt", "Work permit officially approved", "Çalışma izni resmi olarak onaylandı", 8, true, true, "تم الموافقة على تصريح العمل", "Arbeitserlaubnis genehmigt", "Work Permit Approved", "Çalışma İzni Onaylandı", 2, 4, null },
                    { 9, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "تم إعداد المستندات المطلوبة لطلب التأشيرة", "Erforderliche Dokumente für Visumantrag vorbereitet", "Required documents for visa application prepared", "Vize başvurusu için gerekli belgeler hazırlandı", 5, true, true, "تم إعداد مستندات طلب التأشيرة", "Visumantragsunterlagen vorbereitet", "Visa Application Documents Prepared", "Vize Başvuru Belgeler Hazırlandı", 3, 1, null },
                    { 10, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "تم تقديم طلب التأشيرة إلى القنصلية", "Visumantrag beim Konsulat eingereicht", "Visa application submitted to consulate", "Vize başvurusu konsolosluğa yapıldı", 35, true, true, "تم تقديم طلب التأشيرة", "Visumantrag eingereicht", "Visa Application Submitted", "Vize Başvurusu Yapıldı", 3, 2, null },
                    { 11, new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "تم الموافقة على طلب التأشيرة وجاهزة", "Visumantrag genehmigt und fertig", "Visa application approved and ready", "Vize başvurusu onaylandı ve hazır", 20, true, true, "تم الموافقة على التأشيرة", "Visum genehmigt", "Visa Approved", "Vize Onaylandı", 3, 3, null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "wixi_ApplicationSubStepTemplates",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "wixi_ApplicationSubStepTemplates",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "wixi_ApplicationSubStepTemplates",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "wixi_ApplicationSubStepTemplates",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "wixi_ApplicationSubStepTemplates",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "wixi_ApplicationSubStepTemplates",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "wixi_ApplicationSubStepTemplates",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "wixi_ApplicationSubStepTemplates",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "wixi_ApplicationSubStepTemplates",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "wixi_ApplicationSubStepTemplates",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "wixi_ApplicationSubStepTemplates",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "wixi_ApplicationTemplates",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "wixi_FAQs",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "wixi_FAQs",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "wixi_FAQs",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "wixi_FAQs",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "wixi_FAQs",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "wixi_ApplicationStepTemplates",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "wixi_ApplicationStepTemplates",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "wixi_ApplicationStepTemplates",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "wixi_ApplicationTemplates",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "wixi_ApplicationTemplates",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "wixi_ApplicationTemplates",
                keyColumn: "Id",
                keyValue: 3);
        }
    }
}
