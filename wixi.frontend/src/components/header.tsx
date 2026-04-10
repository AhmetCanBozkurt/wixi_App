import { useState } from "react";
import { Button } from "./ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Menu, Globe, LogIn, UserPlus } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/language-context";
import { isProd } from "../utils/env";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const showPreviewOnlyFeatures = !isProd;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo - Left */}
        <div className="flex items-center space-x-4 flex-shrink-0">
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img
              src="/worklines-logo.jpeg"
              alt="Worklines ProConsulting"
              className="leading-7 w-auto opacity-100 h-[60px]"
            />
          </Link>
        </div>

        {/* Desktop Navigation - Center */}
        <NavigationMenu className="hidden md:flex flex-1 justify-center">
          <NavigationMenuList className="justify-center">
            <NavigationMenuItem>
              <NavigationMenuLink
                className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                asChild
              >
                <Link to="/fur-arbeitnehmer">{t("nav.arbeitnehmer")}</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink
                className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                asChild
              >
                <Link to="/fur-arbeitgeber">{t("nav.arbeitgeber")}</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                {t("nav.services")}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-6 w-[400px]">
                  <NavigationMenuLink asChild>
                    <Link
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      to="/services/ausbildung"
                    >
                      <div className="text-sm font-medium leading-none">
                        {t("services.ausbildung")}
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {t("services.ausbildung.desc")}
                      </p>
                    </Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild>
                    <Link
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      to="/services/language"
                    >
                      <div className="text-sm font-medium leading-none">
                        {t("services.language")}
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {t("services.language.desc")}
                      </p>
                    </Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild>
                    <Link
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      to="/services/work"
                    >
                      <div className="text-sm font-medium leading-none">
                        {t("services.work")}
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {t("services.work.desc")}
                      </p>
                    </Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild>
                    <Link
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      to="/services/university"
                    >
                      <div className="text-sm font-medium leading-none">
                        {t("services.university")}
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {t("services.university.desc")}
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink
                className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                asChild
              >
                <Link to="/about">{t("nav.about")}</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink
                className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                asChild
              >
                <Link to="/faq">{t("nav.faq")}</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            {showPreviewOnlyFeatures && (
              <NavigationMenuItem>
                <NavigationMenuLink
                  className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                  asChild
                >
                  <Link to="/references">
                    {language === "de" ? "Referenzen" : language === "tr" ? "Referanslarımız" : language === "en" ? "References" : "مراجعنا"}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            )}

            <NavigationMenuItem>
              <NavigationMenuLink
                className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                asChild
              >
                <Link to="/contact">{t("nav.contact")}</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            {showPreviewOnlyFeatures && (
              <NavigationMenuItem>
                <NavigationMenuLink
                  className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                  asChild
                >
                  <Link to="/appointment">{t("nav.appointment") || "Randevu"}</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            )}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Language Switcher & Auth Buttons - Right */}
        <div className="flex items-center space-x-2 flex-shrink-0 ml-auto">
          {showPreviewOnlyFeatures && (
            <>
              {/* Login Button - Desktop */}
              <Link to="/login" className="hidden md:block">
                <Button variant="ghost" size="sm">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
              </Link>

              {/* Register Button - Desktop */}
              <Link to="/register" className="hidden md:block">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Register
                </Button>
              </Link>
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Globe className="h-4 w-4 mr-2" />
                {language === "de" ? "DE" : language === "tr" ? "TR" : language === "en" ? "EN" : "AR"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage("de")}>
                🇩🇪 Deutsch
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("tr")}>
                🇹🇷 Türkçe
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("en")}>
                🇬🇧 English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("ar")}>
                🇸🇦 العربية
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-4 mt-8">
                {/* Auth Buttons - Mobile */}
                {showPreviewOnlyFeatures && (
                  <div className="flex flex-col gap-2 pb-4 border-b">
                    <Link to="/login" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full justify-start">
                        <LogIn className="h-4 w-4 mr-2" />
                        Login
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setIsOpen(false)}>
                      <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Register
                      </Button>
                    </Link>
                  </div>
                )}

                <Link
                  to="/fur-arbeitnehmer"
                  className="text-lg font-medium hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  {t("nav.arbeitnehmer")}
                </Link>
                <Link
                  to="/fur-arbeitgeber"
                  className="text-lg font-medium hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  {t("nav.arbeitgeber")}
                </Link>
                <div className="space-y-2">
                  <div className="text-lg font-medium">{t("nav.services")}</div>
                  <div className="pl-4 space-y-2">
                    <Link
                      to="/services/ausbildung"
                      className="block text-sm hover:text-primary"
                      onClick={() => setIsOpen(false)}
                    >
                      {t("services.ausbildung")}
                    </Link>
                    <Link
                      to="/services/language"
                      className="block text-sm hover:text-primary"
                      onClick={() => setIsOpen(false)}
                    >
                      {t("services.language")}
                    </Link>
                    <Link
                      to="/services/work"
                      className="block text-sm hover:text-primary"
                      onClick={() => setIsOpen(false)}
                    >
                      {t("services.work")}
                    </Link>
                    <Link
                      to="/services/university"
                      className="block text-sm hover:text-primary"
                      onClick={() => setIsOpen(false)}
                    >
                      {t("services.university")}
                    </Link>
                  </div>
                </div>
                <Link
                  to="/about"
                  className="text-lg font-medium hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  {t("nav.about")}
                </Link>
                {showPreviewOnlyFeatures && (
                  <Link
                    to="/references"
                    className="text-lg font-medium hover:text-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    {language === "de" ? "Referenzen" : language === "tr" ? "Referanslarımız" : language === "en" ? "References" : "مراجعنا"}
                  </Link>
                )}
                <Link
                  to="/contact"
                  className="text-lg font-medium hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  {t("nav.contact")}
                </Link>
                {showPreviewOnlyFeatures && (
                  <Link
                    to="/appointment"
                    className="text-lg font-medium hover:text-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    {t("nav.appointment") || "Randevu"}
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
