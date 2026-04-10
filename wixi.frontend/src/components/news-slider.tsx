import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import NewsService, { type NewsItem } from "@/ApiServices/services/NewsService"
import { BASE_URL } from "@/ApiServices/config/api.config"

export function NewsSlider() {
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

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
    loadNewsItems();
  }, [language]);

  const loadNewsItems = async () => {
    try {
      setLoading(true);
      const res = await NewsService.getNewsItems(language === 'de' ? 'de' : language === 'tr' ? 'tr' : language === 'en' ? 'en' : 'ar');
      if (res.success && res.items) {
        setNewsItems(res.items);
      }
    } catch (error) {
      console.error('Error loading news items:', error);
      // Fallback to empty array on error
      setNewsItems([]);
    } finally {
      setLoading(false);
    }
  };



  // Use API data if available, otherwise use fallback
  const displayItems = newsItems;

  useEffect(() => {
    if (!isAutoPlaying || displayItems.length === 0) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % displayItems.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, displayItems.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % displayItems.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + displayItems.length) % displayItems.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  return (
    <section className="bg-gradient-to-br from-slate-900 to-slate-800 py-2.5 my-0">
      <div className="container mx-auto my-0 border-0 leading-6 px-0">
        <div className="text-center mb-16 relative">
          <h2 className="text-4xl font-bold text-white mb-4 text-balance">{t("news.title")}</h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto text-pretty">{t("news.subtitle")}</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : displayItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-300 text-lg">{language === "de" ? "Keine Nachrichten verfügbar" : language === "tr" ? "Haber bulunamadı" : language === "en" ? "No news available" : "لا توجد أخبار متاحة"}</p>
          </div>
        ) : (
          <div className="relative max-w-6xl mx-auto">
          {/* Main Slider */}
          <div
            className="relative overflow-hidden rounded-2xl"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {displayItems.map((item, index) => (
                <div key={item.id || index} className="w-full flex-shrink-0">
                  <Card className="container mx-auto my-0 border-0 leading-6 px-[135px] h-[500px]">
                    <div className="grid md:grid-cols-2 gap-0 h-full">
                      <div className="relative overflow-hidden bg-gray-200 dark:bg-gray-700">
                        {item.image ? (
                          <img
                            src={getImageUrl(item.image)}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                            <span className="text-gray-400 dark:text-gray-500 text-sm">{item.title}</span>
                          </div>
                        )}
                        {item.featured && (
                          <div className="absolute top-4 left-4">
                            <span className="bg-gradient-to-r from-cyan-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                              {language === "de" ? "Hervorgehoben" : language === "tr" ? "Öne Çıkan" : language === "en" ? "Featured" : "مميز"}
                            </span>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-8 flex flex-col justify-between h-full">
                        <div>
                          <div className="flex items-center gap-4 mb-4 text-sm text-slate-500">
                            <span className="bg-gradient-to-r from-cyan-100 to-pink-100 text-slate-700 px-3 py-1 rounded-full font-medium">
                              {item.category}
                            </span>
                            <span className="text-slate-500">{item.date}</span>
                          </div>

                          <h3 className="text-2xl font-bold text-slate-900 mb-4 text-balance">{item.title}</h3>

                          <p className="text-slate-600 mb-6 text-pretty leading-relaxed line-clamp-4">{item.excerpt}</p>
                        </div>

                        <Button 
                          onClick={() => {
                            // Only navigate if item has slug or id (from API)
                            if ('slug' in item && item.slug) {
                              navigate(`/news/${item.slug}`)
                            } else if ('id' in item && item.id) {
                              navigate(`/news/${item.id}`)
                            }
                          }}
                          className="bg-gradient-to-r from-cyan-600 to-pink-600 hover:from-cyan-700 hover:to-pink-700 text-white self-start group"
                        >
                          {language === "de" ? "Weiterlesen" : language === "tr" ? "Devamını Oku" : language === "en" ? "Read More" : "اقرأ المزيد"}
                        </Button>
                      </CardContent>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:bg-white z-10"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:bg-white z-10"
            onClick={nextSlide}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {displayItems.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-gradient-to-r from-cyan-500 to-pink-500 scale-125"
                    : "bg-white/50 hover:bg-white/70"
                }`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </div>
        )}
      </div>
    </section>
  )
}
