"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import testimonialService from "../ApiServices/services/TestimonialService"
import { API_ROUTES } from "../ApiServices/config/api.config"
import { useLanguage } from "../contexts/language-context"

interface Testimonial {
  id: number;
  name: string;
  role?: string;
  location?: string;
  content: string;
  contentDe?: string;
  contentEn?: string;
  contentAr?: string;
  rating: number;
  imageUrl?: string;
}

export function Testimonials() {
  const { language } = useLanguage();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        setLoading(true);
        const data = await testimonialService.getPublicTestimonials();
        setTestimonials(data);
      } catch (error) {
        console.error('Error loading testimonials:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTestimonials();
  }, []);

  useEffect(() => {
    if (testimonials.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [testimonials.length])

  // Get content based on language
  const getContent = (testimonial: Testimonial) => {
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

  if (loading) {
    return (
      <section className="py-24 bg-muted/30">
        <div className="container px-4 mx-auto">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-24 bg-muted/30">
      <div className="container px-4 mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-[var(--font-playfair)]">
            {language === 'tr' ? 'Öğrenci Yorumları' : 
             language === 'de' ? 'Schülerbewertungen' : 
             language === 'en' ? 'Student Reviews' : 
             'آراء الطلاب'}
          </h2>
          <p className="text-xl text-muted-foreground text-pretty max-w-[800px] mx-auto leading-relaxed">
            {language === 'tr' ? 'Almanya\'da eğitim hayallerini gerçekleştiren öğrencilerimizin deneyimleri' : 
             language === 'de' ? 'Erfahrungen unserer Schüler, die ihre Bildungsträume in Deutschland verwirklicht haben' : 
             language === 'en' ? 'Experiences of our students who have realized their educational dreams in Germany' : 
             'تجارب طلابنا الذين حققوا أحلامهم التعليمية في ألمانيا'}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                  <Card className="border-0 bg-background shadow-lg">
                    <CardContent className="p-8 text-center">
                      <div className="flex justify-center mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                        ))}
                      </div>
                      <blockquote className="text-lg text-muted-foreground mb-6 leading-relaxed">
                        "{getContent(testimonial)}"
                      </blockquote>
                      <div className="flex items-center justify-center space-x-4">
                        <Avatar className="w-12 h-12">
                          {testimonial.imageUrl ? (
                            <AvatarImage 
                              src={`${API_ROUTES.BASE_URL}${testimonial.imageUrl}`} 
                              alt={testimonial.name} 
                            />
                          ) : null}
                          <AvatarFallback>
                            {testimonial.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                          <div className="font-semibold">{testimonial.name}</div>
                          {testimonial.role && (
                            <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                          )}
                          {testimonial.location && (
                            <div className="text-sm text-primary">{testimonial.location}</div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Indicators */}
          <div className="flex justify-center space-x-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? "bg-primary" : "bg-muted-foreground/30"
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
