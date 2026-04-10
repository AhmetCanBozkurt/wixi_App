"use client"

import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Users, GraduationCap, Building } from "lucide-react"

const cities = [
  {
    name: "Berlin",
    description: "Almanya'nın başkenti ve en büyük şehri. Teknoloji, sanat ve kültür merkezi.",
    universities: 40,
    population: "3.7M",
    highlights: ["Humboldt Üniversitesi", "TU Berlin", "Startup ekosistemi", "Çok kültürlü yaşam"],
    image: "/berlin-city-skyline-with-brandenburg-gate.jpg",
  },
  {
    name: "Hamburg",
    description: "Almanya'nın ikinci büyük şehri. Liman kenti ve medya merkezi.",
    universities: 20,
    population: "1.9M",
    highlights: ["Hamburg Üniversitesi", "Liman endüstrisi", "Medya şirketleri", "Denizcilik"],
    image: "/hamburg-port-city-with-harbor-and-ships.jpg",
  },
  {
    name: "Frankfurt",
    description: "Avrupa'nın finans merkezi. Bankacılık ve uluslararası ticaret.",
    universities: 15,
    population: "750K",
    highlights: ["Goethe Üniversitesi", "Finans merkezi", "Uluslararası havaalanı", "İş fırsatları"],
    image: "/frankfurt-financial-district-with-skyscrapers.jpg",
  },
  {
    name: "München",
    description: "Bavyera'nın başkenti. Teknoloji, otomotiv ve bira kültürü.",
    universities: 25,
    population: "1.5M",
    highlights: ["LMU München", "TU München", "BMW, Siemens", "Oktoberfest"],
    image: "/munich-city-center-with-traditional-bavarian-archi.jpg",
  },
  {
    name: "Köln",
    description: "Medya ve sanat merkezi. Tarihi ve modern yaşamın buluştuğu şehir.",
    universities: 18,
    population: "1.1M",
    highlights: ["Köln Üniversitesi", "Medya endüstrisi", "Sanat galerileri", "Köln Katedrali"],
    image: "/cologne-cathedral-and-rhine-river.jpg",
  },
  {
    name: "Stuttgart",
    description: "Otomotiv endüstrisinin kalbi. Mercedes-Benz ve Porsche'nin merkezi.",
    universities: 12,
    population: "630K",
    highlights: ["Stuttgart Üniversitesi", "Mercedes-Benz", "Porsche", "Mühendislik"],
    image: "/stuttgart-city-with-automotive-industry-buildings.jpg",
  },
]

export function CitiesSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4 text-balance">Popüler Şehirler</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto text-pretty">
            Almanya'nın en çok tercih edilen şehirlerinde eğitim ve kariyer fırsatlarını keşfedin
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cities.map((city, index) => (
            <Card
              key={index}
              className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm"
            >
              <div className="relative overflow-hidden rounded-t-lg">
                <img
                  src={city.image || "/placeholder.svg"}
                  alt={city.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-2xl font-bold text-slate-900">{city.name}</h3>
                  <MapPin className="h-5 w-5 text-cyan-600" />
                </div>

                <p className="text-slate-600 mb-4 text-pretty">{city.description}</p>

                <div className="flex items-center gap-4 mb-4 text-sm text-slate-500">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{city.population}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    <span>{city.universities} üniversite</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Öne Çıkanlar
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {city.highlights.map((highlight, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-gradient-to-r from-cyan-100 to-pink-100 text-slate-700 rounded-full text-xs font-medium"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
