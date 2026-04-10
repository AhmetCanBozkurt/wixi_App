import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">
              Premium<span className="text-accent-foreground">Tekstil</span>
            </h3>
            <p className="text-sm text-primary-foreground/80 leading-relaxed">
              {"Kaliteli tekstil ürünleri ile 1993 yılından beri sektöre hizmet veriyoruz."}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">{"Hızlı Linkler"}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#ana-sayfa"
                  className="text-primary-foreground/80 hover:text-accent-foreground transition-colors"
                >
                  {"Ana Sayfa"}
                </a>
              </li>
              <li>
                <a
                  href="#hakkimizda"
                  className="text-primary-foreground/80 hover:text-accent-foreground transition-colors"
                >
                  {"Hakkımızda"}
                </a>
              </li>
              <li>
                <a
                  href="#urunler"
                  className="text-primary-foreground/80 hover:text-accent-foreground transition-colors"
                >
                  {"Ürünler"}
                </a>
              </li>
              <li>
                <a
                  href="#projeler"
                  className="text-primary-foreground/80 hover:text-accent-foreground transition-colors"
                >
                  {"Projeler"}
                </a>
              </li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-semibold mb-4">{"Ürünler"}</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>{"Pamuklu Kumaşlar"}</li>
              <li>{"İpek Dokuma"}</li>
              <li>{"Sentetik Kumaşlar"}</li>
              <li>{"Teknik Tekstiller"}</li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="font-semibold mb-4">{"Sosyal Medya"}</h4>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary-foreground/10 p-2 rounded-lg hover:bg-accent-foreground/20 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary-foreground/10 p-2 rounded-lg hover:bg-accent-foreground/20 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary-foreground/10 p-2 rounded-lg hover:bg-accent-foreground/20 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary-foreground/10 p-2 rounded-lg hover:bg-accent-foreground/20 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-primary-foreground/60">
          <p>{"© 2025 Premium Tekstil. Tüm hakları saklıdır."}</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary-foreground transition-colors">
              {"Gizlilik Politikası"}
            </a>
            <a href="#" className="hover:text-primary-foreground transition-colors">
              {"Kullanım Koşulları"}
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
