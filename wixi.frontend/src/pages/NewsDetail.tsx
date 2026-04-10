import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Calendar, ArrowLeft, Clock } from "lucide-react";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { useLanguage } from "../contexts/language-context";
import NewsService, { type NewsItem } from "../ApiServices/services/NewsService";
import { BASE_URL } from "../ApiServices/config/api.config";

const NewsDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, language } = useLanguage();
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
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
    if (slug) {
      loadNewsItem();
    }
  }, [slug, language]);

  const loadNewsItem = async () => {
    if (!slug) return;
    try {
      setLoading(true);
      const res = await NewsService.getNewsItemBySlug(slug, language);
      if (res.success && res.item) {
        setNewsItem(res.item);
      }
    } catch (error) {
      console.error("Error loading news item:", error);
      // Try by ID if slug fails
      const id = parseInt(slug);
      if (!isNaN(id)) {
        try {
          const resById = await NewsService.getNewsItemById(id, language);
          if (resById.success && resById.item) {
            setNewsItem(resById.item);
          }
        } catch (error2) {
          console.error("Error loading news item by ID:", error2);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!newsItem) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-2xl mx-auto p-8">
            <h1 className="text-2xl font-bold mb-4">
              {language === "de" ? "Haber bulunamadı" : language === "tr" ? "Haber bulunamadı" : language === "en" ? "News not found" : "لم يتم العثور على الخبر"}
            </h1>
            <p className="text-gray-600 mb-6">
              {language === "de" ? "Aradığınız haber bulunamadı veya silinmiş olabilir." : language === "tr" ? "Aradığınız haber bulunamadı veya silinmiş olabilir." : language === "en" ? "The news item you are looking for could not be found or may have been deleted." : "لا يمكن العثور على الخبر الذي تبحث عنه أو ربما تم حذفه."}
            </p>
            <Link to="/">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {language === "de" ? "Zurück zur Startseite" : language === "tr" ? "Ana Sayfaya Dön" : language === "en" ? "Back to Home" : "العودة إلى الصفحة الرئيسية"}
              </Button>
            </Link>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <Link to="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {language === "de" ? "Zurück" : language === "tr" ? "Geri" : language === "en" ? "Back" : "رجوع"}
            </Button>
          </Link>

          {/* Featured Badge */}
          {newsItem.featured && (
            <div className="mb-4">
              <Badge className="bg-gradient-to-r from-cyan-500 to-pink-500 text-white">
                {language === "de" ? "Hervorgehoben" : language === "tr" ? "Öne Çıkan" : language === "en" ? "Featured" : "مميز"}
              </Badge>
            </div>
          )}

          {/* Main Content */}
          <Card className="overflow-hidden">
            {/* Hero Image */}
            <div className="relative w-full h-96 overflow-hidden bg-gray-200 dark:bg-gray-700">
              {newsItem.image ? (
                <img
                  src={getImageUrl(newsItem.image)}
                  alt={newsItem.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <span className="text-gray-400 dark:text-gray-500 text-lg">{newsItem.title}</span>
                </div>
              )}
            </div>

            <CardContent className="p-8">
              {/* Category and Date */}
              <div className="flex items-center gap-4 mb-6 text-sm text-gray-600 dark:text-gray-400">
                <Badge variant="outline" className="bg-gradient-to-r from-cyan-100 to-pink-100 dark:from-cyan-900 dark:to-pink-900">
                  {newsItem.category}
                </Badge>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{newsItem.date}</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                {newsItem.title}
              </h1>

              {/* Excerpt */}
              {newsItem.excerpt && (
                <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
                  {newsItem.excerpt}
                </p>
              )}

              {/* Content */}
              {newsItem.content && (
                <div 
                  className="prose prose-lg dark:prose-invert max-w-none mb-8"
                  dangerouslySetInnerHTML={{ __html: newsItem.content }}
                />
              )}

              {/* If no HTML content, show excerpt as content */}
              {!newsItem.content && newsItem.excerpt && (
                <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {newsItem.excerpt}
                  </p>
                </div>
              )}

              {/* Published Date Info */}
              {newsItem.publishedAt && (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <Clock className="h-4 w-4" />
                  <span>
                    {language === "de" ? "Veröffentlicht am" : language === "tr" ? "Yayınlanma tarihi" : language === "en" ? "Published on" : "تاريخ النشر"}: {newsItem.date}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Back to News Button */}
          <div className="mt-8 text-center">
            <Link to="/">
              <Button variant="outline" size="lg">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {language === "de" ? "Zurück zu den Nachrichten" : language === "tr" ? "Haberlere Dön" : language === "en" ? "Back to News" : "العودة إلى الأخبار"}
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NewsDetail;

