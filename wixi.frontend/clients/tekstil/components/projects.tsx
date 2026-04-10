

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "../../../src/components/ui/card"
import { Badge } from "../../../src/components/ui/badge"
import { Building2 } from "lucide-react"

const projects = [
  {
    title: "Anadolu Lisesi Üniforma Projesi",
    client: "İstanbul Anadolu Lisesi",
    description: "500 öğrenci için özel tasarım okul üniforması - Gömlek, pantolon ve yelek",
    image: "/school-uniform-students-high-school.jpg",
    category: "Okul Projesi",
    year: "2024",
  },
  {
    title: "Spor Kulübü Forma Üretimi",
    client: "Yerel Futbol Kulübü",
    description: "Özel tasarım forma, antrenman kıyafeti ve sweatshirt - 80 sporcu",
    image: "/soccer-team-uniform-jersey.jpg",
    category: "Spor",
    year: "2024",
  },
  {
    title: "Kurumsal T-Shirt Projesi",
    client: "Teknoloji Firması",
    description: "Şirket etkinliği için 1000 adet özel baskılı t-shirt",
    image: "/corporate-event-tshirt-printing.jpg",
    category: "Kurumsal",
    year: "2024",
  },
  {
    title: "İlkokul Üniforma Takımı",
    client: "Özel İlkokul",
    description: "250 öğrenci için polo yaka t-shirt ve pantolon kombinasyonu",
    image: "/elementary-school-uniform-polo-shirt.jpg",
    category: "Okul Projesi",
    year: "2023",
  },
  {
    title: "Otel Personel Kıyafetleri",
    client: "Butik Otel",
    description: "Personel için özel tasarım polo yaka ve sweatshirt",
    image: "/hotel-staff-uniform-polo-shirt.jpg",
    category: "Kurumsal",
    year: "2023",
  },
  {
    title: "Koleji Spor Kıyafetleri",
    client: "Özel Kolej",
    description: "Beden eğitimi dersleri için 400 öğrenciye özel tasarım spor kıyafeti",
    image: "/school-sports-uniform-pe-class.jpg",
    category: "Okul Projesi",
    year: "2024",
  },
]

export function Projects() {
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

  return (
    <section ref={sectionRef} id="projeler" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Building2 className="w-6 h-6 text-accent" />
            <span className="text-sm font-medium text-accent uppercase tracking-wider">{"Projelerimiz"}</span>
          </div>
          <h2
            className={`text-4xl md:text-5xl font-bold mb-6 tracking-tight transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {"Başarılı İş Birlikleri"}
          </h2>
          <p
            className={`text-lg text-muted-foreground leading-relaxed transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {"Sektörün önde gelen firmaları ile gerçekleştirdiğimiz projeler"}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <Card
              key={index}
              className={`group overflow-hidden hover:shadow-xl transition-all duration-700 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-0">
                <div className="relative overflow-hidden aspect-[4/3]">
                  <img
                    src={project.image || "/placeholder.svg"}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge variant="secondary" className="bg-background/90">
                      {project.category}
                    </Badge>
                    <Badge variant="secondary" className="bg-background/90">
                      {project.year}
                    </Badge>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors">{project.title}</h3>
                  <p className="text-sm text-accent mb-3 font-medium">{project.client}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">{project.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
