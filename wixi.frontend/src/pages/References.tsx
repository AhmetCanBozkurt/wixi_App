import { Header } from '../components/header';
import { Footer } from '../components/footer';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { useLanguage } from '../contexts/language-context';
import { 
  Star, ChevronLeft, ChevronRight, User, MapPin, Building2, Calendar, 
  Loader2, Award, CheckCircle2, Clock, FileCheck, TrendingUp, GraduationCap, X, ZoomIn
} from 'lucide-react';
import { useState, useEffect } from 'react';
import testimonialService from '../ApiServices/services/TestimonialService';
import projectReferenceService from '../ApiServices/services/ProjectReferenceService';
import type { ProjectReferenceDto } from '../ApiServices/services/ProjectReferenceService';
import { API_ROUTES } from '../ApiServices/config/api.config';
import { format } from 'date-fns';

interface Testimonial {
  id: number;
  name: string;
  role?: string;
  location?: string;
  company?: string;
  content: string;
  contentDe?: string;
  contentEn?: string;
  contentAr?: string;
  rating: number;
  imageUrl?: string;
  displayOrder: number;
}

const References = () => {
  const { language } = useLanguage();
  
  // Testimonials state
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);
  
  // Project References state
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [projectReferences, setProjectReferences] = useState<ProjectReferenceDto[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'testimonials' | 'projects'>('testimonials');
  
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setTestimonialsLoading(true);
        setProjectsLoading(true);
        
        const [testimonialsData, projectsData] = await Promise.all([
          testimonialService.getPublicTestimonials(),
          projectReferenceService.getPublicProjectReferences()
        ]);
        
        console.log('Project References Data:', projectsData);
        console.log('First project image URL:', projectsData[0]?.documentImageUrl);
        
        setTestimonials(testimonialsData);
        setProjectReferences(projectsData);
      } catch (error) {
        console.error('Error loading references:', error);
      } finally {
        setTestimonialsLoading(false);
        setProjectsLoading(false);
      }
    };

    loadData();
  }, []);

  // Auto-advance carousel for testimonials
  useEffect(() => {
    if (testimonials.length === 0 || activeTab !== 'testimonials') return;
    
    const timer = setInterval(() => {
      setCurrentTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [testimonials.length, activeTab]);

  // Auto-advance carousel for projects
  useEffect(() => {
    if (projectReferences.length === 0 || activeTab !== 'projects') return;
    
    const timer = setInterval(() => {
      setCurrentProjectIndex((prev) => (prev + 1) % projectReferences.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [projectReferences.length, activeTab]);

  const getTestimonialContent = (testimonial: Testimonial) => {
    switch (language) {
      case 'de':
        return testimonial.contentDe || testimonial.content;
      case 'en':
        return testimonial.contentEn || testimonial.content;
      case 'ar':
        return testimonial.contentAr || testimonial.content;
      default:
        return testimonial.content;
    }
  };

  const getProjectField = (item: ProjectReferenceDto, field: 'title' | 'description' | 'documentType' | 'status') => {
    const baseValue = item[field] || '';
    switch (language) {
      case 'de':
        return item[`${field}De` as keyof ProjectReferenceDto] as string || baseValue;
      case 'en':
        return item[`${field}En` as keyof ProjectReferenceDto] as string || baseValue;
      case 'ar':
        return item[`${field}Ar` as keyof ProjectReferenceDto] as string || baseValue;
      default:
        return baseValue;
    }
  };

  const parseHighlights = (highlights?: string): string[] => {
    if (!highlights) return [];
    try {
      const parsed = JSON.parse(highlights);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return highlights.split(',').map(h => h.trim()).filter(h => h);
    }
  };

  const getHighlights = (item: ProjectReferenceDto): string[] => {
    switch (language) {
      case 'de':
        return parseHighlights(item.highlightsDe || item.highlights);
      case 'en':
        return parseHighlights(item.highlightsEn || item.highlights);
      case 'ar':
        return parseHighlights(item.highlightsAr || item.highlights);
      default:
        return parseHighlights(item.highlights);
    }
  };

  const getText = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      title: {
        tr: 'Referanslarımız',
        de: 'Unsere Referenzen',
        en: 'Our References',
        ar: 'مراجعنا'
      },
      testimonials: {
        tr: 'Müşteri Yorumları',
        de: 'Kundenbewertungen',
        en: 'Customer Reviews',
        ar: 'آراء العملاء'
      },
      projects: {
        tr: 'Başvuru Referansları',
        de: 'Antragsreferenzen',
        en: 'Application References',
        ar: 'مراجع الطلبات'
      },
      subtitle: {
        tr: 'Müşterilerimizin deneyimleri ve başarılı başvuru referanslarımız',
        de: 'Erfahrungen unserer Kunden und erfolgreiche Antragsreferenzen',
        en: 'Our customers\' experiences and successful application references',
        ar: 'تجارب عملائنا ومراجع طلباتنا الناجحة'
      },
      happyClients: {
        tr: 'Mutlu Müşteri',
        de: 'Zufriedene Kunden',
        en: 'Happy Clients',
        ar: 'عملاء سعداء'
      },
      avgRating: {
        tr: 'Ortalama Puan',
        de: 'Durchschnittsbewertung',
        en: 'Average Rating',
        ar: 'متوسط التقييم'
      },
      recommendation: {
        tr: 'Tavsiye Oranı',
        de: 'Empfehlungsrate',
        en: 'Recommendation Rate',
        ar: 'معدل التوصية'
      },
      successfulProjects: {
        tr: 'Başarılı Başvuru',
        de: 'Erfolgreiche Anträge',
        en: 'Successful Applications',
        ar: 'طلبات ناجحة'
      },
      avgProcessing: {
        tr: 'Ort. İşlem',
        de: 'Durchschn. Bearbeitung',
        en: 'Avg. Processing',
        ar: 'متوسط المعالجة'
      },
      fastestProject: {
        tr: 'En Hızlı',
        de: 'Am schnellsten',
        en: 'Fastest',
        ar: 'الأسرع'
      },
      days: {
        tr: 'Gün',
        de: 'Tage',
        en: 'Days',
        ar: 'أيام'
      },
      client: {
        tr: 'Müşteri',
        de: 'Kunde',
        en: 'Client',
        ar: 'العميل'
      },
      anonymous: {
        tr: 'Anonim',
        de: 'Anonym',
        en: 'Anonymous',
        ar: 'مجهول'
      },
      applied: {
        tr: 'Başvuru',
        de: 'Beantragt',
        en: 'Applied',
        ar: 'تم التقديم'
      },
      approved: {
        tr: 'Onay',
        de: 'Genehmigt',
        en: 'Approved',
        ar: 'تمت الموافقة'
      },
      processedIn: {
        tr: 'İşlem Süresi',
        de: 'Bearbeitet in',
        en: 'Processed in',
        ar: 'تمت المعالجة في'
      },
      allTestimonials: {
        tr: 'Tüm Müşteri Yorumları',
        de: 'Alle Kundenbewertungen',
        en: 'All Customer Reviews',
        ar: 'جميع آراء العملاء'
      },
      allProjects: {
        tr: 'Tüm Başvuru Referansları',
        de: 'Alle Antragsreferenzen',
        en: 'All Application References',
        ar: 'جميع مراجع الطلبات'
      },
    };

    return translations[key]?.[language] || translations[key]?.['tr'] || key;
  };

  if (testimonialsLoading && projectsLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  const currentTestimonial = testimonials[currentTestimonialIndex];
  const currentProject = projectReferences[currentProjectIndex];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {getText('title')}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {getText('subtitle')}
            </p>
          </div>

          {/* Tab Buttons */}
          <div className="flex justify-center gap-4 mb-12">
            <Button
              variant={activeTab === 'testimonials' ? 'default' : 'outline'}
              onClick={() => setActiveTab('testimonials')}
              className="flex items-center gap-2"
            >
              <Star className="w-4 h-4" />
              {getText('testimonials')}
              {testimonials.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {testimonials.length}
                </Badge>
              )}
            </Button>
            <Button
              variant={activeTab === 'projects' ? 'default' : 'outline'}
              onClick={() => setActiveTab('projects')}
              className="flex items-center gap-2"
            >
              <Award className="w-4 h-4" />
              {getText('projects')}
              {projectReferences.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {projectReferences.length}
                </Badge>
              )}
            </Button>
          </div>

          {/* Testimonials Section */}
          {activeTab === 'testimonials' && testimonials.length > 0 && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-4xl mx-auto">
                <Card className="p-6 text-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {testimonials.length}+
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {getText('happyClients')}
                  </div>
                </Card>

                <Card className="p-6 text-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {(testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {getText('avgRating')}
                  </div>
                </Card>

                <Card className="p-6 text-center bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
                  <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                    100%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {getText('recommendation')}
                  </div>
                </Card>
              </div>

              {/* Carousel */}
              <div className="max-w-6xl mx-auto">
                <Card className="overflow-hidden shadow-xl">
                  <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[500px]">
                    {/* Left Side - Image */}
                    <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-950 p-8 flex flex-col items-center justify-center relative">
                      {currentTestimonial.imageUrl ? (
                        <div className="relative">
                          <div className="w-48 h-48 rounded-full overflow-hidden border-8 border-white/20 shadow-2xl">
                            <img
                              src={`${API_ROUTES.BASE_URL}${currentTestimonial.imageUrl}`}
                              alt={currentTestimonial.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-full px-4 py-2 shadow-lg flex items-center gap-1">
                            {[...Array(currentTestimonial.rating)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="w-48 h-48 rounded-full bg-white/10 border-8 border-white/20 flex items-center justify-center shadow-2xl">
                            <User className="w-24 h-24 text-white/50" />
                          </div>
                          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-full px-4 py-2 shadow-lg flex items-center gap-1">
                            {[...Array(currentTestimonial.rating)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-12 text-center text-white">
                        <h3 className="text-2xl font-bold mb-2">{currentTestimonial.name}</h3>
                        {currentTestimonial.role && (
                          <p className="text-blue-200 mb-2">{currentTestimonial.role}</p>
                        )}
                        {currentTestimonial.location && (
                          <div className="flex items-center justify-center gap-2 text-blue-200 text-sm">
                            <MapPin className="w-4 h-4" />
                            {currentTestimonial.location}
                          </div>
                        )}
                        {currentTestimonial.company && (
                          <div className="flex items-center justify-center gap-2 text-blue-200 text-sm mt-1">
                            <Building2 className="w-4 h-4" />
                            {currentTestimonial.company}
                          </div>
                        )}
                      </div>

                      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4">
                        <button
                          onClick={() => setCurrentTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                          className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm"
                        >
                          <ChevronLeft className="w-6 h-6 text-white" />
                        </button>
                        <button
                          onClick={() => setCurrentTestimonialIndex((prev) => (prev + 1) % testimonials.length)}
                          className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm"
                        >
                          <ChevronRight className="w-6 h-6 text-white" />
                        </button>
                      </div>
                    </div>

                    {/* Right Side - Content */}
                    <div className="lg:col-span-3 p-8 lg:p-12 flex flex-col justify-center">
                      <div className="mb-6">
                        <Badge variant="secondary" className="mb-4">
                          {getText('testimonials')} #{currentTestimonialIndex + 1}
                        </Badge>
                        
                        <div className="relative">
                          <div className="absolute -left-4 -top-4 text-6xl text-blue-200 dark:text-blue-900 font-serif">"</div>
                          <blockquote className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 leading-relaxed mb-6 relative z-10">
                            {getTestimonialContent(currentTestimonial)}
                          </blockquote>
                          <div className="absolute -right-4 -bottom-4 text-6xl text-blue-200 dark:text-blue-900 font-serif">"</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        {testimonials.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentTestimonialIndex(idx)}
                            className={`h-2 rounded-full transition-all ${
                              idx === currentTestimonialIndex 
                                ? 'w-8 bg-blue-600' 
                                : 'w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                            }`}
                          />
                        ))}
                      </div>

                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {currentTestimonialIndex + 1} / {testimonials.length}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* All Testimonials Grid */}
              <div className="mt-20">
                <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
                  {getText('allTestimonials')}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {testimonials.map((testimonial) => (
                    <Card key={testimonial.id} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start gap-4 mb-4">
                        {testimonial.imageUrl ? (
                          <img
                            src={`${API_ROUTES.BASE_URL}${testimonial.imageUrl}`}
                            alt={testimonial.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <User className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</h3>
                          {testimonial.role && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                          )}
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-4">
                        {getTestimonialContent(testimonial)}
                      </p>
                      
                      {testimonial.location && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-4">
                          <MapPin className="w-3 h-3" />
                          {testimonial.location}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Project References Section */}
          {activeTab === 'projects' && projectReferences.length > 0 && currentProject && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16 max-w-5xl mx-auto">
                <Card className="p-6 text-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
                  <div className="flex justify-center mb-2">
                    <CheckCircle2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {projectReferences.length}+
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {getText('successfulProjects')}
                  </div>
                </Card>

                <Card className="p-6 text-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
                  <div className="flex justify-center mb-2">
                    <Clock className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                    {Math.round(
                      projectReferences.filter(p => p.processingDays).reduce((sum, p) => sum + (p.processingDays || 0), 0) /
                      (projectReferences.filter(p => p.processingDays).length || 1)
                    )}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {getText('avgProcessing')} ({getText('days')})
                  </div>
                </Card>

                <Card className="p-6 text-center bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
                  <div className="flex justify-center mb-2">
                    <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                    {Math.min(...projectReferences.filter(p => p.processingDays).map(p => p.processingDays || 999))}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {getText('fastestProject')} ({getText('days')})
                  </div>
                </Card>

                <Card className="p-6 text-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
                  <div className="flex justify-center mb-2">
                    <FileCheck className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                    100%
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {getText('recommendation')}
                  </div>
                </Card>
              </div>

              {/* Carousel */}
              <div className="max-w-6xl mx-auto">
                <Card className="overflow-hidden shadow-xl">
                  <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[500px]">
                    {/* Left Side - Image */}
                    <div className="lg:col-span-2 bg-gradient-to-br from-emerald-600 to-emerald-800 dark:from-emerald-800 dark:to-emerald-950 p-8 flex flex-col items-center justify-center relative">
                      {currentProject?.documentImageUrl ? (
                        <div 
                          className="w-full max-w-sm relative group cursor-pointer"
                          onClick={() => {
                            const imageUrl = currentProject.documentImageUrl?.startsWith('http') 
                              ? currentProject.documentImageUrl 
                              : `${API_ROUTES.BASE_URL}${currentProject.documentImageUrl}`;
                            setLightboxImage(imageUrl);
                            setLightboxOpen(true);
                          }}
                        >
                          <img
                            src={
                              currentProject.documentImageUrl?.startsWith('http') 
                                ? currentProject.documentImageUrl 
                                : `${API_ROUTES.BASE_URL}${currentProject.documentImageUrl}`
                            }
                            alt={getProjectField(currentProject, 'title')}
                            className="w-full h-auto rounded-lg shadow-2xl border-4 border-white/20 transition-transform group-hover:scale-105"
                            onError={(e) => {
                              const finalUrl = currentProject.documentImageUrl?.startsWith('http') 
                                ? currentProject.documentImageUrl 
                                : `${API_ROUTES.BASE_URL}${currentProject.documentImageUrl}`;
                              console.error('Image load error:', finalUrl);
                              console.error('Raw documentImageUrl:', currentProject.documentImageUrl);
                              console.error('API_ROUTES.BASE_URL:', API_ROUTES.BASE_URL);
                            }}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <ZoomIn className="w-12 h-12 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-full max-w-sm">
                          <div className="w-full aspect-[3/4] rounded-lg bg-white/10 border-4 border-white/20 flex flex-col items-center justify-center">
                            <GraduationCap className="w-24 h-24 text-white/50 mb-4" />
                            <p className="text-white/70 text-sm">Görsel yüklenmedi</p>
                          </div>
                        </div>
                      )}

                      <div className="mt-8 mb-20 text-center text-white">
                        <h3 className="text-xl font-bold mb-2">
                          {currentProject?.clientName || getText('anonymous')}
                        </h3>
                        {currentProject?.country && (
                          <div className="flex items-center justify-center gap-2 text-emerald-200 text-sm">
                            <MapPin className="w-4 h-4" />
                            {currentProject.country}
                          </div>
                        )}
                      </div>

                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 z-10">
                        <button
                          onClick={() => setCurrentProjectIndex((prev) => (prev - 1 + projectReferences.length) % projectReferences.length)}
                          className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm shadow-lg"
                        >
                          <ChevronLeft className="w-6 h-6 text-white" />
                        </button>
                        <button
                          onClick={() => setCurrentProjectIndex((prev) => (prev + 1) % projectReferences.length)}
                          className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm shadow-lg"
                        >
                          <ChevronRight className="w-6 h-6 text-white" />
                        </button>
                      </div>
                    </div>

                    {/* Right Side - Content */}
                    <div className="lg:col-span-3 p-8 lg:p-12 flex flex-col justify-center">
                      <div className="mb-6">
                        <Badge variant="secondary" className="mb-4">
                          {getText('projects')} #{currentProjectIndex + 1}
                        </Badge>
                        
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                          {getProjectField(currentProject, 'title')}
                        </h3>

                        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                          {getProjectField(currentProject, 'description')}
                        </p>

                        {/* Project Details */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          {currentProject.documentType && (
                            <div className="flex items-center gap-2 text-sm">
                              <Badge variant="outline">{getProjectField(currentProject, 'documentType')}</Badge>
                            </div>
                          )}
                          {currentProject.status && (
                            <div className="flex items-center gap-2 text-sm">
                              <Badge className="bg-green-600">{getProjectField(currentProject, 'status')}</Badge>
                            </div>
                          )}
                          {currentProject.applicationDate && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Calendar className="w-4 h-4" />
                              <span>{getText('applied')}: {format(new Date(currentProject.applicationDate), 'dd.MM.yyyy')}</span>
                            </div>
                          )}
                          {currentProject.approvalDate && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>{getText('approved')}: {format(new Date(currentProject.approvalDate), 'dd.MM.yyyy')}</span>
                            </div>
                          )}
                          {currentProject.processingDays !== undefined && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Clock className="w-4 h-4" />
                              <span>{getText('processedIn')}: {currentProject.processingDays} {getText('days')}</span>
                            </div>
                          )}
                        </div>

                        {/* Highlights */}
                        {getHighlights(currentProject).length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {getHighlights(currentProject).map((highlight, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {highlight}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        {projectReferences.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentProjectIndex(idx)}
                            className={`h-2 rounded-full transition-all ${
                              idx === currentProjectIndex 
                                ? 'w-8 bg-emerald-600' 
                                : 'w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                            }`}
                          />
                        ))}
                      </div>

                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {currentProjectIndex + 1} / {projectReferences.length}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* All Projects Grid */}
              <div className="mt-20">
                <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
                  {getText('allProjects')}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projectReferences.map((project) => (
                    <Card key={project.id} className="p-6 hover:shadow-lg transition-shadow">
                      {project.documentImageUrl && (
                        <div 
                          className="relative group cursor-pointer mb-4"
                          onClick={() => {
                            const imageUrl = project.documentImageUrl?.startsWith('http') 
                              ? project.documentImageUrl 
                              : `${API_ROUTES.BASE_URL}${project.documentImageUrl}`;
                            setLightboxImage(imageUrl);
                            setLightboxOpen(true);
                          }}
                        >
                        <img
                            src={
                              project.documentImageUrl?.startsWith('http') 
                                ? project.documentImageUrl 
                                : `${API_ROUTES.BASE_URL}${project.documentImageUrl}`
                            }
                          alt={getProjectField(project, 'title')}
                            className="w-full h-48 object-cover rounded transition-transform group-hover:scale-105"
                            onError={(e) => {
                              console.error('Grid image error:', project.documentImageUrl);
                            }}
                        />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                            <ZoomIn className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      )}
                      
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                        {getProjectField(project, 'title')}
                      </h3>
                      
                      <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3 mb-4">
                        {getProjectField(project, 'description')}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{project.clientName || getText('anonymous')}</span>
                        {project.processingDays && (
                          <Badge variant="secondary">
                            {project.processingDays} {getText('days')}
                          </Badge>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Empty States */}
          {activeTab === 'testimonials' && testimonials.length === 0 && !testimonialsLoading && (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                {language === 'de' ? 'Keine Bewertungen' : 
                 language === 'en' ? 'No reviews yet' : 
                 language === 'ar' ? 'لا توجد آراء' : 
                 'Henüz müşteri yorumu bulunmuyor'}
              </p>
            </div>
          )}

          {activeTab === 'projects' && projectReferences.length === 0 && !projectsLoading && (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                {language === 'de' ? 'Keine Projekte' : 
                 language === 'en' ? 'No projects yet' : 
                 language === 'ar' ? 'لا توجد مشاريع' : 
                 'Henüz proje referansı bulunmuyor'}
              </p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          
          <div 
            className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImage}
              alt="Document"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          </div>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
            {language === 'de' ? 'Zum Schließen klicken' :
             language === 'en' ? 'Click to close' :
             language === 'ar' ? 'انقر للإغلاق' :
             'Kapatmak için tıklayın'}
          </div>
        </div>
      )}
    </div>
  );
};

export default References;
