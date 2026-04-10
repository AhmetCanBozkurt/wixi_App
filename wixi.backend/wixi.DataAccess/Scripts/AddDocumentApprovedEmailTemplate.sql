-- Add DocumentApproved Email Template to wixi_EmailTemplates table
-- This template is used when admin uploads a document for a client (e.g., Denklik Belgesi)

-- Check if the email template already exists
IF NOT EXISTS (SELECT 1 FROM wixi_EmailTemplates WHERE [Key] = 'DocumentApproved')
BEGIN
    INSERT INTO wixi_EmailTemplates 
    (
        [Key],
        DisplayName_TR,
        DisplayName_EN,
        DisplayName_DE,
        DisplayName_AR,
        Subject_TR,
        Subject_EN,
        Subject_DE,
        Subject_AR,
        BodyHtml_TR,
        BodyHtml_EN,
        BodyHtml_DE,
        BodyHtml_AR,
        [Description],
        IsActive,
        CreatedAt,
        UpdatedAt,
        UpdatedBy
    )
    VALUES
    (
        'DocumentApproved',
        '✅ Belge Onaylandı',
        '✅ Document Approved',
        '✅ Dokument Genehmigt',
        '✅ تمت الموافقة على المستند',
        
        -- Subject_TR
        'Belgeniz Yüklendi ve Onaylandı - {{DocumentType}}',
        
        -- Subject_EN
        'Your Document Has Been Uploaded and Approved - {{DocumentType}}',
        
        -- Subject_DE
        'Ihr Dokument wurde hochgeladen und genehmigt - {{DocumentType}}',
        
        -- Subject_AR
        'تم تحميل المستند والموافقة عليه - {{DocumentType}}',
        
        -- BodyHtml_TR
        '<!-- Outlook uyumlu email template -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f3f4f6;padding:24px 0;">
  <tr>
    <td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="640" style="max-width:640px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
        
        <!-- Logo Header -->
        <tr>
          <td style="background-color:#ffffff;padding:24px;text-align:center;border-bottom:2px solid #e2e8f0;">
            <img src="https://api.worklines.de/CompanyFile/worklines-logo.jpeg" alt="Worklines Logo" width="180" style="max-width:180px;height:auto;display:block;margin:0 auto;" />
          </td>
        </tr>
        
        <!-- Header with Gradient -->
        <tr>
          <td style="background-color:#0f766e;color:#ffffff;padding:32px;text-align:center;">
            <h2 style="margin:8px 0 0;font-size:24px;font-weight:600;color:#ffffff;">Belgeniz Yüklendi!</h2>
            <p style="margin:8px 0 0;font-size:14px;color:#ffffff;opacity:0.9;">{{DocumentType}}</p>
          </td>
        </tr>
        
        <!-- Content Area -->
        <tr>
          <td style="padding:32px;background-color:#f9fafb;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="background-color:#ffffff;border-radius:14px;padding:24px;border:1px solid #e2e8f0;">
                  
                  <!-- Main Content -->
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td style="padding:0 0 16px 0;">
                        <p style="margin:0;font-size:15px;line-height:1.6;color:#0f172a;">Merhaba <strong>{{FullName}}</strong>,</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:0 0 16px 0;">
                        <p style="margin:0;font-size:15px;line-height:1.6;color:#0f172a;">
                          <strong>{{DocumentType}}</strong> belgeniz tarafımızca yüklendi ve onaylandı. Süreciniz bir adım daha ilerledi!
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Success Box -->
                    <tr>
                      <td style="padding:0 0 18px 0;">
                        <table role="presentation" cellpadding="16" cellspacing="0" border="0" width="100%" style="background-color:#ecfdf5;border:1px solid #d1fae5;border-radius:12px;">
                          <tr>
                            <td>
                              <p style="margin:0 0 6px 0;font-weight:600;color:#047857;font-size:14px;">✓ Belge Durumu</p>
                              <p style="margin:0;font-size:14px;line-height:1.5;color:#065f46;">
                                • Belge başarıyla yüklendi<br/>
                                • Otomatik olarak onaylandı<br/>
                                • Portal hesabınızdan görüntüleyebilirsiniz
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Next Steps Box -->
                    <tr>
                      <td style="padding:0 0 18px 0;">
                        <table role="presentation" cellpadding="16" cellspacing="0" border="0" width="100%" style="background-color:#dbeafe;border:1px solid #bfdbfe;border-radius:12px;">
                          <tr>
                            <td>
                              <p style="margin:0 0 6px 0;font-weight:600;color:#1e40af;font-size:14px;">📋 Sonraki Adımlar</p>
                              <p style="margin:0;font-size:14px;line-height:1.5;color:#1e3a8a;">
                                Başvuru süreciniz otomatik olarak bir sonraki aşamaya geçti. Portal hesabınızdan güncel durumu takip edebilirsiniz.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Portal Link -->
                    <tr>
                      <td style="padding:0 0 16px 0;text-align:center;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                          <tr>
                            <td style="background-color:#0f766e;border-radius:6px;">
                              <a href="https://portal.worklines.de" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">Portal''a Git</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Contact Info -->
                    <tr>
                      <td style="padding:0 0 16px 0;">
                        <p style="margin:0;font-size:15px;line-height:1.6;color:#0f172a;">
                          📧 <strong>Sorularınız için:</strong> support@worklines.de
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Signature -->
                    <tr>
                      <td style="padding:16px 0 0 0;border-top:1px solid #e2e8f0;">
                        <p style="margin:0 0 4px 0;font-size:15px;color:#0f172a;">Saygılarımızla,</p>
                        <p style="margin:0;font-weight:600;color:#0f172a;font-size:15px;">Worklines Ekibi</p>
                      </td>
                    </tr>
                  </table>
                  
                </td>
              </tr>
            </table>
          </td>
        </tr>
        
        <!-- Footer -->
        <tr>
          <td style="padding:20px;text-align:center;background-color:#f9fafb;border-top:1px solid #e2e8f0;">
            <p style="margin:0 0 4px 0;font-size:12px;line-height:1.4;color:#64748b;">© 2025 Worklines - Almanya''da Kariyer Köprünüz</p>
            <p style="margin:0;font-size:12px;line-height:1.4;color:#64748b;">Bu e-posta otomatik olarak gönderilmiştir.</p>
          </td>
        </tr>
        
      </table>
    </td>
  </tr>
</table>',

        -- BodyHtml_EN
        '<!-- Outlook compatible email template -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f3f4f6;padding:24px 0;">
  <tr>
    <td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="640" style="max-width:640px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
        
        <!-- Logo Header -->
        <tr>
          <td style="background-color:#ffffff;padding:24px;text-align:center;border-bottom:2px solid #e2e8f0;">
            <img src="https://api.worklines.de/CompanyFile/worklines-logo.jpeg" alt="Worklines Logo" width="180" style="max-width:180px;height:auto;display:block;margin:0 auto;" />
          </td>
        </tr>
        
        <!-- Header -->
        <tr>
          <td style="background-color:#0f766e;color:#ffffff;padding:32px;text-align:center;">
            <h2 style="margin:8px 0 0;font-size:24px;font-weight:600;color:#ffffff;">Your Document Has Been Uploaded!</h2>
            <p style="margin:8px 0 0;font-size:14px;color:#ffffff;opacity:0.9;">{{DocumentType}}</p>
          </td>
        </tr>
        
        <!-- Content Area -->
        <tr>
          <td style="padding:32px;background-color:#f9fafb;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="background-color:#ffffff;border-radius:14px;padding:24px;border:1px solid #e2e8f0;">
                  
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td style="padding:0 0 16px 0;">
                        <p style="margin:0;font-size:15px;line-height:1.6;color:#0f172a;">Hello <strong>{{FullName}}</strong>,</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:0 0 16px 0;">
                        <p style="margin:0;font-size:15px;line-height:1.6;color:#0f172a;">
                          Your <strong>{{DocumentType}}</strong> has been uploaded and approved by our team. Your application process has moved forward!
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Success Box -->
                    <tr>
                      <td style="padding:0 0 18px 0;">
                        <table role="presentation" cellpadding="16" cellspacing="0" border="0" width="100%" style="background-color:#ecfdf5;border:1px solid #d1fae5;border-radius:12px;">
                          <tr>
                            <td>
                              <p style="margin:0 0 6px 0;font-weight:600;color:#047857;font-size:14px;">✓ Document Status</p>
                              <p style="margin:0;font-size:14px;line-height:1.5;color:#065f46;">
                                • Document successfully uploaded<br/>
                                • Automatically approved<br/>
                                • Available in your portal account
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Portal Link -->
                    <tr>
                      <td style="padding:0 0 16px 0;text-align:center;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                          <tr>
                            <td style="background-color:#0f766e;border-radius:6px;">
                              <a href="https://portal.worklines.de" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">Go to Portal</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <tr>
                      <td style="padding:16px 0 0 0;border-top:1px solid #e2e8f0;">
                        <p style="margin:0 0 4px 0;font-size:15px;color:#0f172a;">Best regards,</p>
                        <p style="margin:0;font-weight:600;color:#0f172a;font-size:15px;">Worklines Team</p>
                      </td>
                    </tr>
                  </table>
                  
                </td>
              </tr>
            </table>
          </td>
        </tr>
        
        <!-- Footer -->
        <tr>
          <td style="padding:20px;text-align:center;background-color:#f9fafb;border-top:1px solid #e2e8f0;">
            <p style="margin:0 0 4px 0;font-size:12px;line-height:1.4;color:#64748b;">© 2025 Worklines - Your Career Bridge to Germany</p>
            <p style="margin:0;font-size:12px;line-height:1.4;color:#64748b;">This email was sent automatically.</p>
          </td>
        </tr>
        
      </table>
    </td>
  </tr>
</table>',

        -- BodyHtml_DE
        '<!-- Outlook-kompatible E-Mail-Vorlage -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f3f4f6;padding:24px 0;">
  <tr>
    <td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="640" style="max-width:640px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
        
        <!-- Logo Header -->
        <tr>
          <td style="background-color:#ffffff;padding:24px;text-align:center;border-bottom:2px solid #e2e8f0;">
            <img src="https://api.worklines.de/CompanyFile/worklines-logo.jpeg" alt="Worklines Logo" width="180" style="max-width:180px;height:auto;display:block;margin:0 auto;" />
          </td>
        </tr>
        
        <!-- Header -->
        <tr>
          <td style="background-color:#0f766e;color:#ffffff;padding:32px;text-align:center;">
            <h2 style="margin:8px 0 0;font-size:24px;font-weight:600;color:#ffffff;">Ihr Dokument wurde hochgeladen!</h2>
            <p style="margin:8px 0 0;font-size:14px;color:#ffffff;opacity:0.9;">{{DocumentType}}</p>
          </td>
        </tr>
        
        <!-- Content Area -->
        <tr>
          <td style="padding:32px;background-color:#f9fafb;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="background-color:#ffffff;border-radius:14px;padding:24px;border:1px solid #e2e8f0;">
                  
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td style="padding:0 0 16px 0;">
                        <p style="margin:0;font-size:15px;line-height:1.6;color:#0f172a;">Hallo <strong>{{FullName}}</strong>,</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:0 0 16px 0;">
                        <p style="margin:0;font-size:15px;line-height:1.6;color:#0f172a;">
                          Ihr <strong>{{DocumentType}}</strong> wurde von uns hochgeladen und genehmigt. Ihr Bewerbungsprozess ist einen Schritt weiter!
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Success Box -->
                    <tr>
                      <td style="padding:0 0 18px 0;">
                        <table role="presentation" cellpadding="16" cellspacing="0" border="0" width="100%" style="background-color:#ecfdf5;border:1px solid #d1fae5;border-radius:12px;">
                          <tr>
                            <td>
                              <p style="margin:0 0 6px 0;font-weight:600;color:#047857;font-size:14px;">✓ Dokumentenstatus</p>
                              <p style="margin:0;font-size:14px;line-height:1.5;color:#065f46;">
                                • Dokument erfolgreich hochgeladen<br/>
                                • Automatisch genehmigt<br/>
                                • In Ihrem Portal-Konto verfügbar
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Portal Link -->
                    <tr>
                      <td style="padding:0 0 16px 0;text-align:center;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                          <tr>
                            <td style="background-color:#0f766e;border-radius:6px;">
                              <a href="https://portal.worklines.de" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">Zum Portal</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <tr>
                      <td style="padding:16px 0 0 0;border-top:1px solid #e2e8f0;">
                        <p style="margin:0 0 4px 0;font-size:15px;color:#0f172a;">Mit freundlichen Grüßen,</p>
                        <p style="margin:0;font-weight:600;color:#0f172a;font-size:15px;">Das Worklines Team</p>
                      </td>
                    </tr>
                  </table>
                  
                </td>
              </tr>
            </table>
          </td>
        </tr>
        
        <!-- Footer -->
        <tr>
          <td style="padding:20px;text-align:center;background-color:#f9fafb;border-top:1px solid #e2e8f0;">
            <p style="margin:0 0 4px 0;font-size:12px;line-height:1.4;color:#64748b;">© 2025 Worklines - Ihre Karrierebrücke nach Deutschland</p>
            <p style="margin:0;font-size:12px;line-height:1.4;color:#64748b;">Diese E-Mail wurde automatisch gesendet.</p>
          </td>
        </tr>
        
      </table>
    </td>
  </tr>
</table>',

        -- BodyHtml_AR
        '<!-- قالب بريد إلكتروني متوافق مع Outlook -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f3f4f6;padding:24px 0;" dir="rtl">
  <tr>
    <td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="640" style="max-width:640px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
        
        <!-- Logo Header -->
        <tr>
          <td style="background-color:#ffffff;padding:24px;text-align:center;border-bottom:2px solid #e2e8f0;">
            <img src="https://api.worklines.de/CompanyFile/worklines-logo.jpeg" alt="Worklines Logo" width="180" style="max-width:180px;height:auto;display:block;margin:0 auto;" />
          </td>
        </tr>
        
        <!-- Header -->
        <tr>
          <td style="background-color:#0f766e;color:#ffffff;padding:32px;text-align:center;">
            <h2 style="margin:8px 0 0;font-size:24px;font-weight:600;color:#ffffff;">تم تحميل المستند الخاص بك!</h2>
            <p style="margin:8px 0 0;font-size:14px;color:#ffffff;opacity:0.9;">{{DocumentType}}</p>
          </td>
        </tr>
        
        <!-- Content Area -->
        <tr>
          <td style="padding:32px;background-color:#f9fafb;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="background-color:#ffffff;border-radius:14px;padding:24px;border:1px solid #e2e8f0;">
                  
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td style="padding:0 0 16px 0;">
                        <p style="margin:0;font-size:15px;line-height:1.6;color:#0f172a;">مرحباً <strong>{{FullName}}</strong>،</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:0 0 16px 0;">
                        <p style="margin:0;font-size:15px;line-height:1.6;color:#0f172a;">
                          تم تحميل <strong>{{DocumentType}}</strong> الخاص بك والموافقة عليه من قبل فريقنا. تقدمت عملية تقديم الطلب الخاصة بك!
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Portal Link -->
                    <tr>
                      <td style="padding:0 0 16px 0;text-align:center;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                          <tr>
                            <td style="background-color:#0f766e;border-radius:6px;">
                              <a href="https://portal.worklines.de" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">انتقل إلى البوابة</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <tr>
                      <td style="padding:16px 0 0 0;border-top:1px solid #e2e8f0;">
                        <p style="margin:0 0 4px 0;font-size:15px;color:#0f172a;">مع أطيب التحيات،</p>
                        <p style="margin:0;font-weight:600;color:#0f172a;font-size:15px;">فريق Worklines</p>
                      </td>
                    </tr>
                  </table>
                  
                </td>
              </tr>
            </table>
          </td>
        </tr>
        
        <!-- Footer -->
        <tr>
          <td style="padding:20px;text-align:center;background-color:#f9fafb;border-top:1px solid #e2e8f0;">
            <p style="margin:0 0 4px 0;font-size:12px;line-height:1.4;color:#64748b;">© 2025 Worklines - جسرك المهني إلى ألمانيا</p>
            <p style="margin:0;font-size:12px;line-height:1.4;color:#64748b;">تم إرسال هذا البريد الإلكتروني تلقائياً.</p>
          </td>
        </tr>
        
      </table>
    </td>
  </tr>
</table>',
        
        'Email template sent to clients when admin uploads and approves their document',
        1, -- IsActive
        GETUTCDATE(),
        GETUTCDATE(),
        'System'
    );

    PRINT 'DocumentApproved email template added successfully.';
END
ELSE
BEGIN
    PRINT 'DocumentApproved email template already exists.';
END

-- Verify the insert
SELECT 
    Id,
    [Key],
    DisplayName_TR,
    DisplayName_EN,
    Subject_TR,
    Subject_EN,
    IsActive,
    CreatedAt
FROM wixi_EmailTemplates
WHERE [Key] = 'DocumentApproved';

