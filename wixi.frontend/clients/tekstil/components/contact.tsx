'use client'

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "../../../src/components/ui/button"
import { Input } from "../../../src/components/ui/input"
import { Textarea } from "../../../src/components/ui/textarea"
import { Card, CardContent } from "../../../src/components/ui/card"
import { Mail, Phone, MapPin, Clock } from "lucide-react"

export function Contact() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Form submission logic here
    alert("Mesajınız alındı! En kısa sürede dönüş yapacağız.")
  }

  return (
    <section ref={sectionRef} id="iletisim" className="py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2
            className={`text-4xl md:text-5xl font-bold mb-6 tracking-tight transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {"İletişime Geçin"}
          </h2>
          <p
            className={`text-lg text-muted-foreground leading-relaxed transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {"Projeleriniz için bizimle iletişime geçin. Size en uygun çözümü sunalım."}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <Card
            className={`transition-all duration-700 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
            }`}
          >
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    {"Ad Soyad"}
                  </label>
                  <Input id="name" placeholder="Adınızı ve soyadınızı girin" required />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    {"E-posta"}
                  </label>
                  <Input id="email" type="email" placeholder="ornek@email.com" required />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-2">
                    {"Telefon"}
                  </label>
                  <Input id="phone" type="tel" placeholder="+90 (555) 123 45 67" />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    {"Mesajınız"}
                  </label>
                  <Textarea id="message" placeholder="Projeniz hakkında detaylı bilgi verin..." rows={5} required />
                </div>
                <Button type="submit" size="lg" className="w-full">
                  {"Mesaj Gönder"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div
            className={`space-y-6 transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            }`}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="bg-accent/10 p-3 rounded-lg">
                  <Phone className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{"Telefon"}</h3>
                  <p className="text-muted-foreground">+90 (212) 555 01 02</p>
                  <p className="text-muted-foreground">+90 (532) 555 01 02</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="bg-accent/10 p-3 rounded-lg">
                  <Mail className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{"E-posta"}</h3>
                  <p className="text-muted-foreground">info@premiumtekstil.com</p>
                  <p className="text-muted-foreground">satis@premiumtekstil.com</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="bg-accent/10 p-3 rounded-lg">
                  <MapPin className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{"Adres"}</h3>
                  <p className="text-muted-foreground">
                    {"Organize Sanayi Bölgesi, 5. Cadde No: 42"}
                    <br />
                    {"Çorlu / Tekirdağ"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="bg-accent/10 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{"Çalışma Saatleri"}</h3>
                  <p className="text-muted-foreground">{"Pazartesi - Cuma: 08:00 - 18:00"}</p>
                  <p className="text-muted-foreground">{"Cumartesi: 09:00 - 15:00"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
