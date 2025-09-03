import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "@/components/product-card";
import { ProductWithDiscount } from "@/lib/types";
import { Link } from "wouter";
import { Bike, Settings, Shield, Star } from "lucide-react";

export default function Home() {
  const { data: featuredProducts = [], isLoading: isFeaturedLoading } = useQuery<ProductWithDiscount[]>({
    queryKey: ["/api/products", { featured: "true" }],
    queryFn: async () => {
      const response = await fetch("/api/products?featured=true");
      return response.json();
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-500 via-purple-600 to-blue-600 py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 via-pink-500/20 to-cyan-500/20"></div>
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight text-white animate-fade-in" data-testid="text-hero-title">
            Premium <span className="gradient-text">Sportbikes</span><br />
            <span className="floating">Built for the Road</span>
          </h1>
          <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto animate-slide-up" data-testid="text-hero-description">
            Discover our collection of high-performance motorcycles, genuine parts, and premium accessories. 
            Your next adventure starts here with the best selection in Florida.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-bounce-in">
            <Link href="/catalog?category=motorcycles">
              <Button size="lg" className="text-lg px-10 py-6 bg-white text-purple-600 hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-300" data-testid="button-shop-motorcycles">
                Shop Motorcycles
              </Button>
            </Link>
            <Link href="/catalog?category=parts">
              <Button variant="outline" size="lg" className="text-lg px-10 py-6 border-white text-white hover:bg-white hover:text-purple-600 shadow-lg transition-all duration-300" data-testid="button-browse-parts">
                Browse Parts
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-50 to-transparent"></div>
      </section>

      {/* Featured Products */}
      <section className="py-20 px-4 bg-gradient-to-br from-green-100 via-blue-100 to-purple-100">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text" data-testid="text-featured-heading">Featured Collection</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto" data-testid="text-featured-description">
              Hand-picked motorcycles and premium parts from the world's leading manufacturers
            </p>
          </div>
          
          {/* Featured Bikes */}
          <div className="mb-20">
            <h3 className="text-3xl font-semibold mb-12 flex items-center justify-center animate-fade-in" data-testid="text-featured-bikes-heading">
              <Star className="text-purple-600 mr-4 text-4xl" />
              <span className="gradient-text">Featured Bikes</span>
            </h3>
            
            {isFeaturedLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl h-96 animate-pulse shadow-lg" data-testid={`skeleton-featured-${i}`} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredProducts.slice(0, 3).map((product, index) => (
                  <div key={product.id} className="animate-slide-up" style={{animationDelay: `${index * 0.2}s`}}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Navigation Grid */}
          <div className="mb-20 bg-gradient-to-r from-orange-100 to-red-100 p-12 rounded-3xl">
            <h3 className="text-3xl font-semibold mb-12 text-center gradient-text animate-fade-in" data-testid="text-categories-heading">Shop by Category</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Link href="/catalog?category=motorcycles">
                <Card className="bg-gradient-to-br from-red-400 via-pink-500 to-purple-600 p-10 text-center card-hover cursor-pointer shadow-lg border-0 rounded-2xl animate-slide-up" data-testid="card-category-motorcycles" style={{animationDelay: '0.1s'}}>
                  <CardContent className="p-0">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                      <Bike className="text-white text-3xl" />
                    </div>
                    <h4 className="text-2xl font-bold mb-3 text-white">Motorcycles</h4>
                    <p className="text-white/90 mb-6">Premium sportbikes and street bikes</p>
                    <span className="bg-white text-red-600 px-6 py-2 rounded-full font-semibold inline-block hover:bg-red-50 transition-colors">Browse All →</span>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/catalog?category=parts">
                <Card className="bg-gradient-to-br from-green-400 via-teal-500 to-blue-600 p-10 text-center card-hover cursor-pointer shadow-lg border-0 rounded-2xl animate-slide-up" data-testid="card-category-parts" style={{animationDelay: '0.2s'}}>
                  <CardContent className="p-0">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                      <Settings className="text-white text-3xl" />
                    </div>
                    <h4 className="text-2xl font-bold mb-3 text-white">Parts</h4>
                    <p className="text-white/90 mb-6">Genuine OEM and aftermarket parts</p>
                    <span className="bg-white text-teal-600 px-6 py-2 rounded-full font-semibold inline-block hover:bg-teal-50 transition-colors">Browse All →</span>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/catalog?category=accessories">
                <Card className="bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 p-10 text-center card-hover cursor-pointer shadow-lg border-0 rounded-2xl animate-slide-up" data-testid="card-category-accessories" style={{animationDelay: '0.3s'}}>
                  <CardContent className="p-0">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                      <Shield className="text-white text-3xl" />
                    </div>
                    <h4 className="text-2xl font-bold mb-3 text-white">Accessories</h4>
                    <p className="text-white/90 mb-6">Gear, helmets, and riding accessories</p>
                    <span className="bg-white text-blue-600 px-6 py-2 rounded-full font-semibold inline-block hover:bg-blue-50 transition-colors">Browse All →</span>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
