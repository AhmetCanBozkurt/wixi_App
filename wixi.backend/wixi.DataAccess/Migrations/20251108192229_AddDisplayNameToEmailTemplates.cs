using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace wixi.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddDisplayNameToEmailTemplates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DisplayName_AR",
                table: "wixi_EmailTemplates",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "DisplayName_DE",
                table: "wixi_EmailTemplates",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "DisplayName_EN",
                table: "wixi_EmailTemplates",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "DisplayName_TR",
                table: "wixi_EmailTemplates",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            // Update existing templates with default display names based on their keys
            migrationBuilder.Sql(@"
                UPDATE wixi_EmailTemplates 
                SET DisplayName_TR = CASE [Key]
                    WHEN 'ContactForm' THEN '📝 Kontakt Formuları'
                    WHEN 'EmployerForm' THEN '🏢 Arbeitgeber Formuları'
                    WHEN 'EmployeeForm' THEN '👤 Arbeitnehmer Formuları'
                    WHEN 'ClientCode' THEN '🎫 Müşteri Kodu'
                    WHEN 'WelcomeEmail' THEN '👋 Hoş Geldin Emaili'
                    WHEN 'DocumentApproved' THEN '✅ Belge Onaylandı'
                    WHEN 'DocumentRejected' THEN '❌ Belge Reddedildi'
                    WHEN 'ApplicationStatusChanged' THEN '📋 Başvuru Durumu Değişti'
                    WHEN 'PasswordReset' THEN '🔑 Şifre Sıfırlama'
                    WHEN 'EmailVerification' THEN '📧 Email Doğrulama'
                    ELSE [Key]
                END
                WHERE DisplayName_TR = '';

                UPDATE wixi_EmailTemplates 
                SET DisplayName_EN = CASE [Key]
                    WHEN 'ContactForm' THEN '📝 Contact Forms'
                    WHEN 'EmployerForm' THEN '🏢 Employer Forms'
                    WHEN 'EmployeeForm' THEN '👤 Employee Forms'
                    WHEN 'ClientCode' THEN '🎫 Client Code'
                    WHEN 'WelcomeEmail' THEN '👋 Welcome Email'
                    WHEN 'DocumentApproved' THEN '✅ Document Approved'
                    WHEN 'DocumentRejected' THEN '❌ Document Rejected'
                    WHEN 'ApplicationStatusChanged' THEN '📋 Application Status Changed'
                    WHEN 'PasswordReset' THEN '🔑 Password Reset'
                    WHEN 'EmailVerification' THEN '📧 Email Verification'
                    ELSE [Key]
                END
                WHERE DisplayName_EN = '';

                UPDATE wixi_EmailTemplates 
                SET DisplayName_DE = CASE [Key]
                    WHEN 'ContactForm' THEN '📝 Kontaktformulare'
                    WHEN 'EmployerForm' THEN '🏢 Arbeitgeberformulare'
                    WHEN 'EmployeeForm' THEN '👤 Arbeitnehmerformulare'
                    WHEN 'ClientCode' THEN '🎫 Kundencode'
                    WHEN 'WelcomeEmail' THEN '👋 Willkommens-E-Mail'
                    WHEN 'DocumentApproved' THEN '✅ Dokument genehmigt'
                    WHEN 'DocumentRejected' THEN '❌ Dokument abgelehnt'
                    WHEN 'ApplicationStatusChanged' THEN '📋 Bewerbungsstatus geändert'
                    WHEN 'PasswordReset' THEN '🔑 Passwort zurücksetzen'
                    WHEN 'EmailVerification' THEN '📧 E-Mail-Verifizierung'
                    ELSE [Key]
                END
                WHERE DisplayName_DE = '';

                UPDATE wixi_EmailTemplates 
                SET DisplayName_AR = CASE [Key]
                    WHEN 'ContactForm' THEN '📝 نماذج الاتصال'
                    WHEN 'EmployerForm' THEN '🏢 نماذج صاحب العمل'
                    WHEN 'EmployeeForm' THEN '👤 نماذج الموظف'
                    WHEN 'ClientCode' THEN '🎫 رمز العميل'
                    WHEN 'WelcomeEmail' THEN '👋 بريد الترحيب'
                    WHEN 'DocumentApproved' THEN '✅ تمت الموافقة على المستند'
                    WHEN 'DocumentRejected' THEN '❌ تم رفض المستند'
                    WHEN 'ApplicationStatusChanged' THEN '📋 تغيير حالة الطلب'
                    WHEN 'PasswordReset' THEN '🔑 إعادة تعيين كلمة المرور'
                    WHEN 'EmailVerification' THEN '📧 التحقق من البريد الإلكتروني'
                    ELSE [Key]
                END
                WHERE DisplayName_AR = '';
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DisplayName_AR",
                table: "wixi_EmailTemplates");

            migrationBuilder.DropColumn(
                name: "DisplayName_DE",
                table: "wixi_EmailTemplates");

            migrationBuilder.DropColumn(
                name: "DisplayName_EN",
                table: "wixi_EmailTemplates");

            migrationBuilder.DropColumn(
                name: "DisplayName_TR",
                table: "wixi_EmailTemplates");
        }
    }
}
