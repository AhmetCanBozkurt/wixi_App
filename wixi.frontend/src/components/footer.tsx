import { Button } from "./ui/button";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import { useLanguage } from "../contexts/language-context";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import ContentSettingsService, { type PublicContentSettings } from "../ApiServices/services/ContentSettingsService";

export function Footer() {
  const { t, language } = useLanguage();
  const [contentSettings, setContentSettings] = useState<PublicContentSettings | null>(null);

  useEffect(() => {
    loadContentSettings();
  }, [language]);

  const loadContentSettings = async () => {
    try {
      const res = await ContentSettingsService.getPublicSettings(language);
      if (res.success && res.settings) {
        setContentSettings(res.settings);
      }
    } catch (error) {
      console.error('Error loading content settings:', error);
    }
  };

  return (
    <footer className="bg-muted/50 border-t">
      <div className="container px-4 py-16 mx-auto">
        <div className="grid gap-8 lg:grid-cols-4 md:grid-cols-2">
          {/* Firma Bilgisi */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">{"WL"}</span>
              </div>
              <span className="font-bold text-xl">Worklines ProConsulting</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {contentSettings?.footerCompanyDesc || t("footer.company_desc")}
            </p>
          </div>

          {/* Dienstleistungen */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t("footer.services")}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/services/ausbildung" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("services.ausbildung")}
                </Link>
              </li>
              <li>
                <Link to="/services/language" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("services.language")}
                </Link>
              </li>
              <li>
                <Link to="/services/university" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("services.university")}
                </Link>
              </li>
              <li>
                <Link to="/services/work" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("services.work")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Schnelle Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t("footer.quick_links")}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("nav.about")}
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("nav.faq")}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("nav.contact")}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("footer.privacy")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Folgen Sie uns */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t("footer.follow_us")}</h3>
            <div className="flex space-x-4">
              {contentSettings?.socialMedia?.facebook && (
                <Button variant="ghost" size="sm" asChild>
                  <a href={contentSettings.socialMedia.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <Facebook className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {contentSettings?.socialMedia?.instagram && (
                <Button variant="ghost" size="sm" asChild>
                  <a href={contentSettings.socialMedia.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <Instagram className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {contentSettings?.socialMedia?.twitter && (
                <Button variant="ghost" size="sm" asChild>
                  <a href={contentSettings.socialMedia.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                    <Twitter className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {contentSettings?.socialMedia?.linkedin && (
                <Button variant="ghost" size="sm" asChild>
                  <a href={contentSettings.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                    <Linkedin className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground gap-4">
          <p>{t("footer.copyright")}</p>
          <div className="flex items-center gap-6">
            <Link to="/terms" className="hover:text-foreground transition-colors">{t("footer.terms")}</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">{t("footer.privacy")}</Link>
            <Link to="/impressum" className="hover:text-foreground transition-colors">{t("footer.impressum")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
