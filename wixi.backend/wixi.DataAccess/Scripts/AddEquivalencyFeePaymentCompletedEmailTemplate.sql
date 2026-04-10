-- Add EquivalencyFeePaymentCompleted Email Template to wixi_EmailTemplates table
-- This template is used when equivalency fee payment is completed successfully

-- Check if the email template already exists
IF NOT EXISTS (SELECT 1 FROM wixi_EmailTemplates WHERE [Key] = 'EquivalencyFeePaymentCompleted')
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
        'EquivalencyFeePaymentCompleted',
        '💳 Denklik Ücreti Ödemesi Tamamlandı',
        '💳 Equivalency Fee Payment Completed',
        '💳 Gleichwertigkeitsgebühr Zahlung Abgeschlossen',
        '💳 اكتمال دفع رسوم المعادلة',
        
        -- Subject_TR
        'Denklik Ücreti Ödemesi Başarıyla Tamamlandı - {{PaymentNumber}}',
        
        -- Subject_EN
        'Equivalency Fee Payment Successfully Completed - {{PaymentNumber}}',
        
        -- Subject_DE
        'Gleichwertigkeitsgebühr Zahlung Erfolgreich Abgeschlossen - {{PaymentNumber}}',
        
        -- Subject_AR
        'اكتمال دفع رسوم المعادلة بنجاح - {{PaymentNumber}}',
        
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
            <h2 style="margin:8px 0 0;font-size:24px;font-weight:600;color:#ffffff;">Ödemeniz Alındı!</h2>
            <p style="margin:8px 0 0;font-size:14px;color:#ffffff;opacity:0.9;">Denklik Ücreti Ödemesi</p>
          </td>
        </tr>
        
        <!-- Content Area -->
        <tr>
          <td style="padding:32px;background-color:#f9fafb;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="background-color:#ffffff;border-radius:8px;padding:24px;border:1px solid #e2e8f0;">
                  
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
                          Denklik ücreti ödemeniz başarıyla tamamlandı. Ödeme bilgileriniz aşağıda yer almaktadır.
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Payment Details Box -->
                    <tr>
                      <td style="padding:0 0 18px 0;">
                        <table role="presentation" cellpadding="16" cellspacing="0" border="0" width="100%" style="background-color:#ecfdf5;border:1px solid #d1fae5;border-radius:8px;">
                          <tr>
                            <td>
                              <p style="margin:0 0 8px 0;font-weight:600;color:#047857;font-size:14px;">💳 Ödeme Detayları</p>
                              <p style="margin:0 0 4px 0;font-size:14px;line-height:1.5;color:#065f46;">
                                <strong>Ödeme Tutarı:</strong> {{PaymentAmount}} {{PaymentCurrency}}<br/>
                                <strong>Ödeme Numarası:</strong> {{PaymentNumber}}<br/>
                                <strong>Ödeme Tarihi:</strong> {{PaymentDate}}<br/>
                                <strong>Ödeme Durumu:</strong> Başarılı ✓
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Next Steps Box -->
                    <tr>
                      <td style="padding:0 0 18px 0;">
                        <table role="presentation" cellpadding="16" cellspacing="0" border="0" width="100%" style="background-color:#dbeafe;border:1px solid #bfdbfe;border-radius:8px;">
                          <tr>
                            <td>
                              <p style="margin:0 0 6px 0;font-weight:600;color:#1e40af;font-size:14px;">📋 Sonraki Adımlar</p>
                              <p style="margin:0;font-size:14px;line-height:1.5;color:#1e3a8a;">
                                Denklik belgenizin hazırlanması süreci başlatıldı. Sürecinizi portal hesabınızdan takip edebilirsiniz.
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
                              <a href="{{PortalLink}}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">Portala Git</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Contact Info -->
                    <tr>
                      <td style="padding:0 0 16px 0;">
                        <p style="margin:0;font-size:15px;line-height:1.6;color:#0f172a;">
                          📧 <strong>Sorularınız için:</strong> {{SupportEmail}}
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
          <td style="padding:20px;text-align:center;background-color:#f3f4f6;border-top:1px solid #e2e8f0;">
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
            <h2 style="margin:8px 0 0;font-size:24px;font-weight:600;color:#ffffff;">Payment Received!</h2>
            <p style="margin:8px 0 0;font-size:14px;color:#ffffff;opacity:0.9;">Equivalency Fee Payment</p>
          </td>
        </tr>
        
        <!-- Content Area -->
        <tr>
          <td style="padding:32px;background-color:#f9fafb;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="background-color:#ffffff;border-radius:8px;padding:24px;border:1px solid #e2e8f0;">
                  
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td style="padding:0 0 16px 0;">
                        <p style="margin:0;font-size:15px;line-height:1.6;color:#0f172a;">Hello <strong>{{FullName}}</strong>,</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:0 0 16px 0;">
                        <p style="margin:0;font-size:15px;line-height:1.6;color:#0f172a;">
                          Your equivalency fee payment has been successfully completed. Your payment details are below.
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Payment Details Box -->
                    <tr>
                      <td style="padding:0 0 18px 0;">
                        <table role="presentation" cellpadding="16" cellspacing="0" border="0" width="100%" style="background-color:#ecfdf5;border:1px solid #d1fae5;border-radius:8px;">
                          <tr>
                            <td>
                              <p style="margin:0 0 8px 0;font-weight:600;color:#047857;font-size:14px;">💳 Payment Details</p>
                              <p style="margin:0 0 4px 0;font-size:14px;line-height:1.5;color:#065f46;">
                                <strong>Amount:</strong> {{PaymentAmount}} {{PaymentCurrency}}<br/>
                                <strong>Payment Number:</strong> {{PaymentNumber}}<br/>
                                <strong>Payment Date:</strong> {{PaymentDate}}<br/>
                                <strong>Status:</strong> Successful ✓
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Next Steps Box -->
                    <tr>
                      <td style="padding:0 0 18px 0;">
                        <table role="presentation" cellpadding="16" cellspacing="0" border="0" width="100%" style="background-color:#dbeafe;border:1px solid #bfdbfe;border-radius:8px;">
                          <tr>
                            <td>
                              <p style="margin:0 0 6px 0;font-weight:600;color:#1e40af;font-size:14px;">📋 Next Steps</p>
                              <p style="margin:0;font-size:14px;line-height:1.5;color:#1e3a8a;">
                                The process of preparing your equivalency certificate has been started. You can track your process from your portal account.
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
                              <a href="{{PortalLink}}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">Go to Portal</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Contact Info -->
                    <tr>
                      <td style="padding:0 0 16px 0;">
                        <p style="margin:0;font-size:15px;line-height:1.6;color:#0f172a;">
                          📧 <strong>For questions:</strong> {{SupportEmail}}
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Signature -->
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
          <td style="padding:20px;text-align:center;background-color:#f3f4f6;border-top:1px solid #e2e8f0;">
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
            <h2 style="margin:8px 0 0;font-size:24px;font-weight:600;color:#ffffff;">Zahlung erhalten!</h2>
            <p style="margin:8px 0 0;font-size:14px;color:#ffffff;opacity:0.9;">Gleichwertigkeitsgebühr Zahlung</p>
          </td>
        </tr>
        
        <!-- Content Area -->
        <tr>
          <td style="padding:32px;background-color:#f9fafb;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="background-color:#ffffff;border-radius:8px;padding:24px;border:1px solid #e2e8f0;">
                  
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td style="padding:0 0 16px 0;">
                        <p style="margin:0;font-size:15px;line-height:1.6;color:#0f172a;">Hallo <strong>{{FullName}}</strong>,</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:0 0 16px 0;">
                        <p style="margin:0;font-size:15px;line-height:1.6;color:#0f172a;">
                          Ihre Gleichwertigkeitsgebühr Zahlung wurde erfolgreich abgeschlossen. Ihre Zahlungsdetails finden Sie unten.
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Payment Details Box -->
                    <tr>
                      <td style="padding:0 0 18px 0;">
                        <table role="presentation" cellpadding="16" cellspacing="0" border="0" width="100%" style="background-color:#ecfdf5;border:1px solid #d1fae5;border-radius:8px;">
                          <tr>
                            <td>
                              <p style="margin:0 0 8px 0;font-weight:600;color:#047857;font-size:14px;">💳 Zahlungsdetails</p>
                              <p style="margin:0 0 4px 0;font-size:14px;line-height:1.5;color:#065f46;">
                                <strong>Betrag:</strong> {{PaymentAmount}} {{PaymentCurrency}}<br/>
                                <strong>Zahlungsnummer:</strong> {{PaymentNumber}}<br/>
                                <strong>Zahlungsdatum:</strong> {{PaymentDate}}<br/>
                                <strong>Status:</strong> Erfolgreich ✓
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Next Steps Box -->
                    <tr>
                      <td style="padding:0 0 18px 0;">
                        <table role="presentation" cellpadding="16" cellspacing="0" border="0" width="100%" style="background-color:#dbeafe;border:1px solid #bfdbfe;border-radius:8px;">
                          <tr>
                            <td>
                              <p style="margin:0 0 6px 0;font-weight:600;color:#1e40af;font-size:14px;">📋 Nächste Schritte</p>
                              <p style="margin:0;font-size:14px;line-height:1.5;color:#1e3a8a;">
                                Der Prozess zur Vorbereitung Ihres Gleichwertigkeitszeugnisses wurde gestartet. Sie können Ihren Prozess über Ihr Portal-Konto verfolgen.
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
                              <a href="{{PortalLink}}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">Zum Portal</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Contact Info -->
                    <tr>
                      <td style="padding:0 0 16px 0;">
                        <p style="margin:0;font-size:15px;line-height:1.6;color:#0f172a;">
                          📧 <strong>Bei Fragen:</strong> {{SupportEmail}}
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Signature -->
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
          <td style="padding:20px;text-align:center;background-color:#f3f4f6;border-top:1px solid #e2e8f0;">
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
            <h2 style="margin:8px 0 0;font-size:24px;font-weight:600;color:#ffffff;">تم استلام الدفعة!</h2>
            <p style="margin:8px 0 0;font-size:14px;color:#ffffff;opacity:0.9;">دفع رسوم المعادلة</p>
          </td>
        </tr>
        
        <!-- Content Area -->
        <tr>
          <td style="padding:32px;background-color:#f9fafb;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="background-color:#ffffff;border-radius:8px;padding:24px;border:1px solid #e2e8f0;">
                  
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td style="padding:0 0 16px 0;">
                        <p style="margin:0;font-size:15px;line-height:1.6;color:#0f172a;">مرحباً <strong>{{FullName}}</strong>،</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:0 0 16px 0;">
                        <p style="margin:0;font-size:15px;line-height:1.6;color:#0f172a;">
                          تم إكمال دفع رسوم المعادلة بنجاح. تفاصيل الدفع الخاصة بك أدناه.
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Payment Details Box -->
                    <tr>
                      <td style="padding:0 0 18px 0;">
                        <table role="presentation" cellpadding="16" cellspacing="0" border="0" width="100%" style="background-color:#ecfdf5;border:1px solid #d1fae5;border-radius:8px;">
                          <tr>
                            <td>
                              <p style="margin:0 0 8px 0;font-weight:600;color:#047857;font-size:14px;">💳 تفاصيل الدفع</p>
                              <p style="margin:0 0 4px 0;font-size:14px;line-height:1.5;color:#065f46;">
                                <strong>المبلغ:</strong> {{PaymentAmount}} {{PaymentCurrency}}<br/>
                                <strong>رقم الدفعة:</strong> {{PaymentNumber}}<br/>
                                <strong>تاريخ الدفع:</strong> {{PaymentDate}}<br/>
                                <strong>الحالة:</strong> ناجح ✓
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Next Steps Box -->
                    <tr>
                      <td style="padding:0 0 18px 0;">
                        <table role="presentation" cellpadding="16" cellspacing="0" border="0" width="100%" style="background-color:#dbeafe;border:1px solid #bfdbfe;border-radius:8px;">
                          <tr>
                            <td>
                              <p style="margin:0 0 6px 0;font-weight:600;color:#1e40af;font-size:14px;">📋 الخطوات التالية</p>
                              <p style="margin:0;font-size:14px;line-height:1.5;color:#1e3a8a;">
                                تم بدء عملية إعداد شهادة المعادلة الخاصة بك. يمكنك تتبع العملية من حساب البوابة الخاص بك.
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
                              <a href="{{PortalLink}}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">انتقل إلى البوابة</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Contact Info -->
                    <tr>
                      <td style="padding:0 0 16px 0;">
                        <p style="margin:0;font-size:15px;line-height:1.6;color:#0f172a;">
                          📧 <strong>للأسئلة:</strong> {{SupportEmail}}
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Signature -->
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
          <td style="padding:20px;text-align:center;background-color:#f3f4f6;border-top:1px solid #e2e8f0;">
            <p style="margin:0 0 4px 0;font-size:12px;line-height:1.4;color:#64748b;">© 2025 Worklines - جسرك المهني إلى ألمانيا</p>
            <p style="margin:0;font-size:12px;line-height:1.4;color:#64748b;">تم إرسال هذا البريد الإلكتروني تلقائياً.</p>
          </td>
        </tr>
        
      </table>
    </td>
  </tr>
</table>',
        
        'Email template sent to clients when equivalency fee payment is completed successfully',
        1, -- IsActive
        GETUTCDATE(),
        GETUTCDATE(),
        'System'
    );

    PRINT 'EquivalencyFeePaymentCompleted email template added successfully.';
END
ELSE
BEGIN
    PRINT 'EquivalencyFeePaymentCompleted email template already exists.';
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
WHERE [Key] = 'EquivalencyFeePaymentCompleted';

