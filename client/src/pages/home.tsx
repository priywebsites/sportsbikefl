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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight" data-testid="text-hero-title">
            Premium <span className="text-primary">Sportbikes</span><br />
            Built for the Road
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto" data-testid="text-hero-description">
            Discover our collection of high-performance motorcycles, genuine parts, and premium accessories. 
            Your next adventure starts here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/catalog?category=motorcycles">
              <Button size="lg" className="text-lg px-8 py-4" data-testid="button-shop-motorcycles">
                Shop Motorcycles
              </Button>
            </Link>
            <Link href="/catalog?category=parts">
              <Button variant="outline" size="lg" className="text-lg px-8 py-4" data-testid="button-browse-parts">
                Browse Parts
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" data-testid="text-featured-heading">Featured Collection</h2>
            <p className="text-muted-foreground" data-testid="text-featured-description">
              Hand-picked motorcycles and premium parts
            </p>
          </div>
          
          {/* Featured Bikes */}
          <div className="mb-16">
            <h3 className="text-2xl font-semibold mb-8 flex items-center" data-testid="text-featured-bikes-heading">
              <Star className="text-primary mr-3" />
              Featured Bikes
            </h3>
            
            {isFeaturedLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-card rounded-lg h-80 animate-pulse" data-testid={`skeleton-featured-${i}`} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredProducts.slice(0, 3).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>

          {/* Quick Navigation Grid */}
          <div className="mb-16">
            <h3 className="text-2xl font-semibold mb-8" data-testid="text-categories-heading">Shop by Category</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Link href="/catalog?category=motorcycles">
                <Card className="bg-card p-8 text-center card-hover cursor-pointer" data-testid="card-category-motorcycles">
                  <CardContent className="p-0">
                    <Bike className="text-primary text-4xl mb-4 mx-auto" />
                    <h4 className="text-xl font-semibold mb-2">Motorcycles</h4>
                    <p className="text-muted-foreground mb-4">Premium sportbikes and street bikes</p>
                    <span className="text-primary font-semibold">Browse All →</span>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/catalog?category=parts">
                <Card className="bg-card p-8 text-center card-hover cursor-pointer" data-testid="card-category-parts">
                  <CardContent className="p-0">
                    <Settings className="text-primary text-4xl mb-4 mx-auto" />
                    <h4 className="text-xl font-semibold mb-2">Parts</h4>
                    <p className="text-muted-foreground mb-4">Genuine OEM and aftermarket parts</p>
                    <span className="text-primary font-semibold">Browse All →</span>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/catalog?category=accessories">
                <Card className="bg-card p-8 text-center card-hover cursor-pointer" data-testid="card-category-accessories">
                  <CardContent className="p-0">
                    <Shield className="text-primary text-4xl mb-4 mx-auto" />
                    <h4 className="text-xl font-semibold mb-2">Accessories</h4>
                    <p className="text-muted-foreground mb-4">Gear, helmets, and riding accessories</p>
                    <span className="text-primary font-semibold">Browse All →</span>
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
