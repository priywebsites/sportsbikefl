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
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2" data-testid="link-home">
                <Bike className="text-primary text-2xl" />
                <span className="text-xl font-bold">SportbikeFL</span>
              </Link>
              <div className="hidden md:flex space-x-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`hover:text-primary transition-colors ${
                      location === item.href ? "text-primary" : ""
                    }`}
                    data-testid={`link-${item.name.toLowerCase()}`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setIsCartOpen(true)}
                data-testid="button-cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <Badge 
                    variant="default" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {itemCount}
                  </Badge>
                )}
              </Button>
              
              {isAuthenticated ? (
                <Link href="/owner" data-testid="link-dashboard">
                  <Button variant="default" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/owner/login" data-testid="link-owner-login">
                  <Button variant="default" size="sm">
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
