import React, { useState, useEffect } from 'react';
import { Header } from '../components/header';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Mail, Globe, Building2 } from 'lucide-react';
import { useLanguage } from '../contexts/language-context';
import { Link } from 'react-router-dom';
import TeamService, { type TeamMember } from '../ApiServices/services/TeamService';
import { BASE_URL } from '../ApiServices/config/api.config';
import ContentSettingsService, { type PublicContentSettings } from '../ApiServices/services/ContentSettingsService';

const About: React.FC = () => {
  const { t, language } = useLanguage();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [contentSettings, setContentSettings] = useState<PublicContentSettings | null>(null);

  // Helper to get full image URL (same as admin panel)
  const getImageUrl = (url: string | null | undefined): string => {
    if (!url) return '';
    // If URL is already absolute (starts with http:// or https://), return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // If URL starts with /, prepend BASE_URL
    if (url.startsWith('/')) {
      return `${BASE_URL}${url}`;
    }
    // Otherwise, assume it's a relative path and add BASE_URL with /
    return `${BASE_URL}/${url}`;
  };

  useEffect(() => {
    loadTeamMembers();
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

  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      const res = await TeamService.getTeamMembers(language);
      if (res.success && res.items) {
        setTeamMembers(res.items);
      }
    } catch (error) {
      console.error('Error loading team members:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 text-balance animate-fade-in">{t("about.title")}</h1>
          <p className="text-xl md:text-2xl bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent max-w-3xl mx-auto text-pretty leading-relaxed animate-fade-in-delay">
          {t("about.sub-title")} 
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          <div className="space-y-8 animate-slide-in-from-left">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold">{t("about.mission")}</h2>
            </div>
            <div className="bg-slate-800 text-white p-8 rounded-2xl shadow-xl space-y-6 hover:shadow-2xl transition-all duration-300">
              <p className="text-lg leading-relaxed">
                {contentSettings?.aboutMission?.text1 || t("about.mission_text_1")}
              </p>
              <p className="text-lg leading-relaxed">
                {contentSettings?.aboutMission?.text2 || t("about.mission_text_2")}
              </p>
            </div>
          </div>
          <div className="relative animate-slide-in-from-right">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl hover:scale-105 transition-transform duration-500 ease-out">
              <img
                src="/frankfurt-financial-district-with-skyscrapers.jpg"
                alt="Professionelles Bürotreffen mit internationalen Fachkräften"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-emerald-600/10"></div>
            </div>
          </div>
        </div>

        <div className="mb-16 bg-gradient-to-r from-slate-50/50 to-blue-50/30 py-16 rounded-3xl">
          <h2 className="text-4xl font-bold text-center mb-12 animate-fade-in">{t("about.team")}</h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {teamMembers.map((member, index) => (
                <Card key={member.id} className="text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300 animate-fade-in-delay">
                  <CardContent className="p-6">
                    <div className="w-32 h-40 mx-auto mb-4 rounded-lg overflow-hidden bg-gray-100">
                      {member.image ? (
                        <img
                          src={getImageUrl(member.image)}
                          alt={member.name}
                          className="w-full h-full object-cover object-top"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <span className="text-gray-400 text-sm">{member.name}</span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{member.name}</h3>

                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center justify-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{member.email}</span>
                      </div>
                    </div>
                    <Link to={`/team/${member.slug}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 border-red-500 hover:bg-red-50 bg-transparent"
                      >
                        {t("button.learn_more")}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
              {teamMembers.length === 0 && (
                <div className="col-span-4 text-center text-gray-500 py-12">
                  {t("team.no_members") || "Henüz ekip üyesi eklenmemiş."}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-br from-white to-slate-50/50 shadow-xl animate-fade-in">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">{t("about.ready_title")}</h3>
              <p className="text-muted-foreground mb-6">{t("about.ready_desc")}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact">
                  <Button size="lg" className="hover:scale-105 transition-transform duration-200">
                    {t("button.consultation")}
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" size="lg" className="hover:scale-105 transition-transform duration-200">
                    {t("button.contact")}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default About;