import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Mail, Users } from "lucide-react";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/language-context";
import TeamService, { type TeamMember as TeamMemberType } from "../ApiServices/services/TeamService";
import { BASE_URL } from "../ApiServices/config/api.config";

const TeamMember: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, language } = useLanguage();
  const [member, setMember] = useState<TeamMemberType | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to get full image URL
  const getImageUrl = (url: string | undefined): string => {
    if (!url || url === '/placeholder.svg') return '/placeholder.svg';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return url.startsWith('/') ? `${BASE_URL}${url}` : `${BASE_URL}/${url}`;
  };

  useEffect(() => {
    if (slug) {
      loadTeamMember();
    }
  }, [slug, language]);

  const loadTeamMember = async () => {
    if (!slug) return;
    try {
      setLoading(true);
      const res = await TeamService.getTeamMemberBySlug(slug, language);
      if (res.success && res.item) {
        setMember(res.item);
      }
    } catch (error) {
      console.error("Error loading team member:", error);
    } finally {
      setLoading(false);
    }
  };

  // Legacy team member data - will be removed after migration
  const legacyTeamMembers: Record<string, any> = {
    "okan-bettas": {
      name: "Okan Bettas",
      position: {
        de: "CEO & Gründer",
        tr: "CEO & Kurucu",
      },
      image: "/okan-bettas.jpeg",
      email: "O.Bettas@worklines.de",
      phone: "+49 XXX XXX XXXX",
      location: {
        de: "Frankfurt, Deutschland",
        tr: "Frankfurt, Almanya",
      },
      experience: "15+",
      specializations: {
        de: ["Unternehmensführung", "Strategische Planung", "Internationale Expansion"],
        tr: ["Şirket Yönetimi", "Stratejik Planlama", "Uluslararası Genişleme"],
      },
      languages: {
        de: ["Deutsch", "Türkisch", "Englisch"],
        tr: ["Almanca", "Türkçe", "İngilizce"],
      },
      education: {
        de: "MBA in International Business",
        tr: "Uluslararası İşletme MBA",
      },
      bio: {
        de: "Okan Bettas ist der Gründer von Worklines ProConsulting. Mit über 15 Jahren Erfahrung in der internationalen Beratung hat er hunderten von Fachkräften dabei geholfen, ihre Karriere in Deutschland zu starten.",
        tr: "Okan Bettas, Worklines ProConsulting'in kurucusudur. Uluslararası danışmanlıkta 15 yılı aşkın deneyimi ile yüzlerce uzmanın Almanya'da kariyerlerini başlatmasına yardımcı olmuştur.",
      },
      achievements: {
        de: [
          "Gründung von Worklines ProConsulting im Jahr 2018",
          "Über 500 erfolgreiche Vermittlungen",
          "Auszeichnung als 'Bester Beratungsservice 2023'",
          "Sprecher auf internationalen Konferenzen",
        ],
        tr: [
          "2018 yılında Worklines ProConsulting'i kurdu",
          "500'den fazla başarılı yerleştirme",
          "'En İyi Danışmanlık Hizmeti 2023' ödülü",
          "Uluslararası konferanslarda konuşmacı",
        ],
      },
      philosophy: {
        de: "Ich glaube daran, dass Talent keine Grenzen kennt. Meine Mission ist es, eine Brücke zwischen internationalen Fachkräften und deutschen Unternehmen zu bauen.",
        tr: "Yeteneğin sınır tanımadığına inanıyorum. Misyonum, uluslararası uzmanlar ile Alman şirketleri arasında köprü kurmaktır.",
      },
    },
    "beyza-kara": {
      name: "Beyza Kara",
      position: {
        de: "Senior Beraterin",
        tr: "Kıdemli Danışman",
      },
      image: "/Beyza%20Kara.jpeg",
      email: "B.Kara@worklines.de",
      phone: "+49 XXX XXX XXXX",
      location: {
        de: "Hamburg, Deutschland",
        tr: "Hamburg, Almanya",
      },
      experience: "8+",
      specializations: {
        de: ["Ausbildungsberatung", "Universitätsbewerbungen", "Sprachkurse"],
        tr: ["Ausbildung Danışmanlığı", "Üniversite Başvuruları", "Dil Kursları"],
      },
      languages: {
        de: ["Deutsch", "Türkisch", "Englisch"],
        tr: ["Almanca", "Türkçe", "İngilizce"],
      },
      education: {
        de: "Master in Bildungswissenschaften",
        tr: "Eğitim Bilimleri Yüksek Lisans",
      },
      bio: {
        de: "Verantwortet die Koordination von Anerkennungs-, Visums- und Bewerbungsprozessen für Deutschland.",
        tr: "Almanya için tanıma, vize ve başvuru süreçlerinin koordinasyonundan sorumludur.",
      },
      achievements: {
        de: [
          "Über 200 erfolgreiche Ausbildungsvermittlungen",
          "Zertifizierte Bildungsberaterin",
          "Expertin für duale Ausbildungssysteme",
          "Mentorin für internationale Studierende",
        ],
        tr: [
          "200'den fazla başarılı Ausbildung yerleştirmesi",
          "Sertifikalı eğitim danışmanı",
          "İkili eğitim sistemleri uzmanı",
          "Uluslararası öğrenciler için mentor",
        ],
      },
      philosophy: {
        de: "",
        tr: "",
      },
    },
    "gokce-celik": {
      name: "Gökçe Çelik",
      position: {
        de: "Spezialistin für Arbeitsrecht",
        tr: "İş Hukuku Uzmanı",
      },
      image: "/gokce-celik.jpeg",
      email: "G.Celik@worklines.de",
      phone: "+49 XXX XXX XXXX",
      location: {
        de: "Stuttgart, Deutschland",
        tr: "Stuttgart, Almanya",
      },
      experience: "6+",
      specializations: {
        de: ["Arbeitsrecht", "Visa-Verfahren", "Arbeitserlaubnis"],
        tr: ["İş Hukuku", "Vize İşlemleri", "Çalışma İzni"],
      },
      languages: {
        de: ["Deutsch", "Türkisch", "Englisch"],
        tr: ["Almanca", "Türkçe", "İngilizce"],
      },
      education: {
        de: "Jurastudium mit Schwerpunkt Arbeitsrecht",
        tr: "İş Hukuku odaklı Hukuk eğitimi",
      },
      bio: {
        de: "Gökçe Çelik ist unsere Expertin für alle rechtlichen Aspekte der Arbeitsaufnahme in Deutschland. Sie navigiert durch komplexe Visa- und Arbeitserlaubnisverfahren.",
        tr: "Gökçe Çelik, Almanya'da işe başlamanın tüm hukuki yönleri konusunda uzmanımızdır. Karmaşık vize ve çalışma izni süreçlerinde rehberlik eder.",
      },
      achievements: {
        de: [
          "Über 300 erfolgreiche Visa-Anträge",
          "Zertifizierte Rechtsberaterin",
          "Expertin für EU-Arbeitsrecht",
          "Autorin von Fachartikeln zum Arbeitsrecht",
        ],
        tr: [
          "300'den fazla başarılı vize başvurusu",
          "Sertifikalı hukuk danışmanı",
          "AB iş hukuku uzmanı",
          "İş hukuku konusunda uzman makalelerin yazarı",
        ],
      },
      philosophy: {
        de: "Rechtliche Klarheit schafft Vertrauen. Ich sorge dafür, dass alle rechtlichen Aspekte der Arbeitsaufnahme transparent und verständlich sind.",
        tr: "Hukuki netlik güven yaratır. İşe başlamanın tüm hukuki yönlerinin şeffaf ve anlaşılır olmasını sağlıyorum.",
      },
    },
    "inna-moor": {
      name: "Inna Moor",
      position: {
        de: "CEO & Gründerin",
        tr: "CEO & Kurucu",
      },
      image: "/Inna.jpeg",
      email: "I.Moor@Worklines.de",
      phone: "+49 XXX XXX XXXX",
      location: {
        de: "Berlin, Deutschland",
        tr: "Berlin, Almanya",
      },
      experience: "4+",
      specializations: {
        de: ["Beratung", "Kundenbetreuung", "Projektmanagement"],
        tr: ["Danışmanlık", "Müşteri Hizmetleri", "Proje Yönetimi"],
      },
      languages: {
        de: ["Deutsch", "Englisch", "Russisch"],
        tr: ["Almanca", "İngilizce", "Rusça"],
      },
      education: {
        de: "Bachelor in Betriebswirtschaft",
        tr: "İşletme Lisans",
      },
      bio: {
        de: "Inna Moor ist CEO und eine engagierte Beraterin, die sich darauf spezialisiert hat, internationale Fachkräfte bei ihrem Weg nach Deutschland zu unterstützen. Mit ihrer mehrsprachigen Kompetenz und ihrem Verständnis für verschiedene Kulturen bietet sie maßgeschneiderte Lösungen.",
        tr: "Inna Moor, CEO ve uluslararası uzmanların Almanya yolculuklarında desteklenmesi konusunda uzmanlaşmış tutkulu bir danışmandır. Çok dilli yetkinliği ve farklı kültürlere olan anlayışı ile özel çözümler sunar.",
      },
      achievements: {
        de: [
          "Über 150 erfolgreiche Beratungsgespräche",
          "Spezialistin für osteuropäische Märkte",
          "Zertifizierte Projektmanagerin",
          "Expertin für interkulturelle Kommunikation",
        ],
        tr: [
          "150'den fazla başarılı danışmanlık görüşmesi",
          "Doğu Avrupa pazarları uzmanı",
          "Sertifikalı proje yöneticisi",
          "Kültürlerarası iletişim uzmanı",
        ],
      },
      philosophy: {
        de: "Jeder Mensch verdient die Chance auf eine bessere Zukunft. Ich helfe dabei, diese Träume in Deutschland zu verwirklichen.",
        tr: "Her insan daha iyi bir gelecek şansını hak ediyor. Bu hayallerin Almanya'da gerçekleşmesine yardımcı oluyorum.",
      },
    },
  };

  // Fallback to legacy data if API fails and legacy data exists
  const fallbackMember = slug && legacyTeamMembers[slug] ? {
    ...legacyTeamMembers[slug],
    position: legacyTeamMembers[slug].position[language],
    location: legacyTeamMembers[slug].location[language],
    education: legacyTeamMembers[slug].education[language],
    bio: legacyTeamMembers[slug].bio[language],
    philosophy: legacyTeamMembers[slug].philosophy[language] || '',
    specializations: legacyTeamMembers[slug].specializations[language] || [],
    languages: legacyTeamMembers[slug].languages[language] || [],
    achievements: legacyTeamMembers[slug].achievements[language] || [],
  } : null;

  const displayMember = member || fallbackMember;

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!displayMember) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Team Member Not Found</h1>
          <p className="text-muted-foreground mb-8">The requested team member could not be found.</p>
          <Link to="/team">
            <Button>Back to Team</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        {/* Back Navigation */}
        <div className="mb-8">
          <Link to="/about" className="text-primary hover:underline">
            ← {t("team.back_to_team")}
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="w-48 h-48 mx-auto mb-4 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-2">
                    <img
                      src={getImageUrl(displayMember.image)}
                      alt={displayMember.name}
                      className="max-w-full max-h-full w-auto h-auto object-contain"
                    />
                  </div>
                  <h1 className="text-2xl font-bold mb-2">{displayMember.name}</h1>
                  <p className="text-muted-foreground mb-4">{displayMember.position}</p>
                  <Badge variant="secondary" className="mb-4">
                    {displayMember.experience}+ {t("team.experience")}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{t("team.email")}</p>
                      <p className="text-sm text-muted-foreground">{displayMember.email}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <Link to="/contact">
                    <Button className="w-full">{t("team.schedule_consultation")}</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <Users className="h-6 w-6 mr-2 text-primary" />
                  {t("team.about")} {displayMember.name.split(" ")[0]}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">{displayMember.bio}</p>
                {displayMember.philosophy && (
                  <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
                    "{displayMember.philosophy}"
                  </blockquote>
                )}
              </CardContent>
            </Card>

            {/* CTA Section */}
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-6 text-center">
                <h3 className="text-2xl font-bold mb-4">{t("team.contact_title")}</h3>
                <p className="mb-6 text-primary-foreground/90">
                  {t("team.contact_desc")} {displayMember.name.split(" ")[0]} {t("team.contact_direct")}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/contact">
                    <Button variant="secondary" size="lg">
                      {t("team.send_message")}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TeamMember;
