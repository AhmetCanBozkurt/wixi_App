import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../contexts/language-context';
import projectReferenceService from '../../ApiServices/services/ProjectReferenceService';
import { toast } from 'sonner';

interface ProjectReference {
  id: number;
  title: string;
  titleDe?: string;
  titleEn?: string;
  titleAr?: string;
  description?: string;
  descriptionDe?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  clientName?: string;
  documentImageUrl?: string;
  isFeatured?: boolean;
}

const ReferencesSection = () => {
  const { t, language } = useLanguage();
  const [references, setReferences] = useState<ProjectReference[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReferences = async () => {
      try {
        const data = await projectReferenceService.getPublicProjectReferences(6);
        setReferences(data);
      } catch (error) {
        toast.error('Referanslar yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchReferences();
  }, []);

  const getLocalizedText = (obj?: {
    tr?: string;
    de?: string;
    en?: string;
    ar?: string;
  }) => {
    if (!obj) return '';
    return obj[language as keyof typeof obj] || obj.tr || '';
  };

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              {t('references.title') || 'Referanslarımız'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50" id="references">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            {t('references.title') || 'Referanslarımız'}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('references.subtitle') || 'Başarılı projelerimiz ve mutlu müşterilerimiz'}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {references.map((reference) => (
            <Card key={reference.id} className="hover:shadow-lg transition-shadow overflow-hidden">
              {reference.documentImageUrl && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={reference.documentImageUrl}
                    alt={getLocalizedText({
                      tr: reference.title,
                      de: reference.titleDe,
                      en: reference.titleEn,
                      ar: reference.titleAr,
                    })}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle>
                  {getLocalizedText({
                    tr: reference.title,
                    de: reference.titleDe,
                    en: reference.titleEn,
                    ar: reference.titleAr,
                  })}
                </CardTitle>
                {reference.clientName && (
                  <CardDescription>{reference.clientName}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {getLocalizedText({
                    tr: reference.description,
                    de: reference.descriptionDe,
                    en: reference.descriptionEn,
                    ar: reference.descriptionAr,
                  })}
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" asChild className="w-full">
                  <Link to={`/references#${reference.id}`}>
                    {t('references.details') || 'Detaylar'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="text-center mt-8">
          <Button size="lg" asChild>
            <Link to="/references">
              {t('references.viewAll') || 'Tüm Referansları Görüntüle'}
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ReferencesSection;

