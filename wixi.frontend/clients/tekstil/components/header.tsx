'use client'

import { useState, useEffect } from "react"
import { Button } from "../../../src/components/ui/button"
import { Menu, X } from "lucide-react"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
      setIsMobileMenuOpen(false)
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div className="text-2xl font-bold tracking-tight">
            Premium<span className="text-accent">Tekstil</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("ana-sayfa")}
              className="text-sm font-medium hover:text-accent transition-colors"
            >
              Ana Sayfa
            </button>
            <button
              onClick={() => scrollToSection("hakkimizda")}
              className="text-sm font-medium hover:text-accent transition-colors"
            >
              Hakkımızda
            </button>
            <button
              onClick={() => scrollToSection("urunler")}
              className="text-sm font-medium hover:text-accent transition-colors"
            >
              Ürünler
            </button>
            <button
              onClick={() => scrollToSection("projeler")}
              className="text-sm font-medium hover:text-accent transition-colors"
            >
              Projeler
            </button>
            <button
              onClick={() => scrollToSection("iletisim")}
              className="text-sm font-medium hover:text-accent transition-colors"
            >
              İletişim
            </button>
            <Button onClick={() => scrollToSection("iletisim")} size="sm">
              Teklif Alın
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-4 animate-fade-in">
            <div className="flex flex-col gap-4">
              <button
                onClick={() => scrollToSection("ana-sayfa")}
                className="text-sm font-medium hover:text-accent transition-colors text-left"
              >
                Ana Sayfa
              </button>
              <button
                onClick={() => scrollToSection("hakkimizda")}
                className="text-sm font-medium hover:text-accent transition-colors text-left"
              >
                Hakkımızda
              </button>
              <button
                onClick={() => scrollToSection("urunler")}
                className="text-sm font-medium hover:text-accent transition-colors text-left"
              >
                Ürünler
              </button>
              <button
                onClick={() => scrollToSection("projeler")}
                className="text-sm font-medium hover:text-accent transition-colors text-left"
              >
                Projeler
              </button>
              <button
                onClick={() => scrollToSection("iletisim")}
                className="text-sm font-medium hover:text-accent transition-colors text-left"
              >
                İletişim
              </button>
              <Button onClick={() => scrollToSection("iletisim")} size="sm" className="w-full">
                Teklif Alın
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
