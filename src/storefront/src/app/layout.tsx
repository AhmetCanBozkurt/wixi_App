import type { Metadata } from "next";
import "./globals.css";
import { getTenantSlugFromServer } from "@/lib/api";
import { Search, Menu } from "lucide-react";
import Link from "next/link";
import HeaderActions from "@/components/HeaderActions";
import CartDrawer from "@/components/CartDrawer";

export const metadata: Metadata = {
  title: "E-Ticaret Mağazası",
  description: "WIXI altyapısı ile oluşturulmuştur.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const tenantSlug = await getTenantSlugFromServer();

  return (
    <html lang="tr">
      <body>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              
              {/* Logo / Tenant Name */}
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-2xl font-bold text-blue-600 capitalize">
                  {tenantSlug || "WIXI Store"}
                </Link>
              </div>

              {/* Search Bar (Desktop) */}
              <div className="hidden sm:flex flex-1 justify-center px-8">
                <div className="max-w-lg w-full relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                    placeholder="Ürünlerde ara..."
                    type="search"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center">
                <button className="text-gray-500 hover:text-gray-700 sm:hidden p-2 mr-2">
                  <Search className="h-6 w-6" />
                </button>
                <HeaderActions />
                <button className="text-gray-500 hover:text-gray-700 sm:hidden p-2 ml-2">
                  <Menu className="h-6 w-6" />
                </button>
              </div>

            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Cart Sidebar */}
        <CartDrawer />

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} {tenantSlug || "WIXI Store"}. Tüm hakları saklıdır. <br/>
              <span className="text-xs text-gray-400">Powered by WIXI Platform</span>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
