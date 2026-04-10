import { CheckCircle, Circle } from "lucide-react"

const steps = [
  {
    title: "Ücretsiz Danışmanlık",
    description: "Hedeflerinizi belirleyip size en uygun yolu birlikte planlıyoruz.",
    completed: true,
  },
  {
    title: "Dil Seviye Testi",
    description: "Mevcut dil seviyenizi değerlendirip gerekli eğitim planını oluşturuyoruz.",
    completed: true,
  },
  {
    title: "Başvuru Hazırlığı",
    description: "Tüm belgelerinizi hazırlayıp başvuru sürecini yönetiyoruz.",
    completed: true,
  },
  {
    title: "Vize İşlemleri",
    description: "Vize başvurunuzu hazırlayıp randevu sürecinde yanınızda oluyoruz.",
    completed: false,
  },
  {
    title: "Almanya'ya Varış",
    description: "Yerleşim, banka hesabı açma ve ilk adımlarınızda destek sağlıyoruz.",
    completed: false,
  },
]

export function ProcessTimeline() {
  return (
    <section className="py-24">
      <div className="container px-4 mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-[var(--font-playfair)]">Adım Adım Süreç</h2>
          <p className="text-xl text-muted-foreground text-pretty max-w-[800px] mx-auto leading-relaxed">
            Almanya'da eğitim yolculuğunuz boyunca size rehberlik edecek 5 temel adım
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border md:left-1/2 md:-translate-x-px"></div>

            <div className="space-y-12">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`relative flex items-center ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-8 w-4 h-4 -translate-x-1/2 md:left-1/2">
                    {step.completed ? (
                      <CheckCircle className="w-4 h-4 text-primary bg-background" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground bg-background" />
                    )}
                  </div>

                  {/* Content */}
                  <div className={`flex-1 ml-16 md:ml-0 ${index % 2 === 0 ? "md:pr-8" : "md:pl-8"}`}>
                    <div
                      className={`bg-card p-6 rounded-lg shadow-sm border ${index % 2 === 0 ? "md:text-right" : "md:text-left"}`}
                    >
                      <div className="flex items-center mb-2">
                        <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                          Adım {index + 1}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
