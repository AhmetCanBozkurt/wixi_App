import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/language-context";
import { MapPin } from "lucide-react";
import TeamService, { type TeamMember } from "../ApiServices/services/TeamService";
import { BASE_URL } from "../ApiServices/config/api.config";

const Team: React.FC = () => {
  const { t, language } = useLanguage();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, [language]);

  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      const res = await TeamService.getTeamMembers(language);
      if (res.success && res.items) {
        setTeamMembers(res.items);
      }
    } catch (error) {
      console.error("Error loading team members:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/5 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">{t("team.hero.title")}</h1>
            <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-3xl mx-auto">
              {t("team.hero.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Team Members */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t("team.meet_team")}</h2>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {teamMembers.map((member) => (
                  <Card key={member.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                    <div className="relative h-80 md:h-96 bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-4">
                      {member.image ? (
                        <img
                          src={getImageUrl(member.image)}
                          alt={member.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                          <span className="text-gray-400 dark:text-gray-500 text-sm">{member.name}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors pointer-events-none" />
                      <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                        <h3 className="text-xl font-bold text-white mb-1 drop-shadow-lg">{member.name}</h3>
                        <p className="text-white/90 text-sm drop-shadow-md">{member.position}</p>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">{member.experience}+ {t("team.experience")}</Badge>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-1" />
                            {member.location}
                          </div>
                        </div>

                        <div className="pt-4 border-t">
                          <Link to={`/team/${member.slug}`}>
                            <Button className="w-full" variant="outline">
                              {t("team.view_profile")}
                            </Button>
                          </Link>
                        </div>
                      </div>
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
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("team.cta.title")}</h2>
            <p className="text-xl text-muted-foreground mb-8">
              {t("team.cta.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" className="text-lg px-8">
                  {t("team.cta.contact_us")}
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  {t("team.cta.learn_more")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Team;
