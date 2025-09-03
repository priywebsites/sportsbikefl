import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CartSidebar } from "@/components/cart-sidebar";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Bike, ShoppingCart, User, Menu } from "lucide-react";

export function Header() {
  const [location] = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { itemCount } = useCart();
  const { user, isAuthenticated } = useAuth();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Motorcycles", href: "/catalog?category=motorcycles" },
    { name: "Parts", href: "/catalog?category=parts" },
    { name: "Accessories", href: "/catalog?category=accessories" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-3 group" data-testid="link-home">
                <div className="bg-gradient-to-br from-purple-600 to-teal-600 rounded-full p-2 group-hover:scale-110 transition-transform duration-300">
                  <Bike className="text-white text-2xl" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">SportbikeFL</span>
              </Link>
              <div className="hidden md:flex space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`font-medium transition-all duration-300 hover:text-purple-600 relative ${
                      location === item.href ? "text-purple-600" : "text-gray-700"
                    }`}
                    data-testid={`link-${item.name.toLowerCase()}`}
                  >
                    {item.name}
                    {location === item.href && (
                      <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-teal-600"></div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-purple-50 rounded-full transition-all duration-300"
                onClick={() => setIsCartOpen(true)}
                data-testid="button-cart"
              >
                <ShoppingCart className="h-5 w-5 text-gray-700" />
                {itemCount > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs bg-gradient-to-r from-purple-500 to-teal-500 text-white font-bold animate-bounce" 
                  >
                    {itemCount}
                  </Badge>
                )}
              </Button>
              
              {isAuthenticated ? (
                <Link href="/owner" data-testid="link-dashboard">
                  <Button className="bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700 text-white font-semibold px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                    <User className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/owner/login" data-testid="link-owner-login">
                  <Button className="bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700 text-white font-semibold px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                    <User className="h-4 w-4 mr-2" />
                    Owner Login
                  </Button>
                </Link>
              )}
              
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden" data-testid="button-mobile-menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px]">
                  <div className="flex flex-col space-y-4 mt-6">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="text-lg hover:text-primary transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                        data-testid={`mobile-link-${item.name.toLowerCase()}`}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </nav>
      </header>

      <CartSidebar open={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  );
}
