import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "@/components/product-card";
import { ProductWithDiscount } from "@/lib/types";
import { Link } from "wouter";
import { Bike, Settings, Shield, Star, CheckCircle, Users, Award, MapPin, Clock, CreditCard } from "lucide-react";
import { BusinessHours } from "@/components/business-hours";
import bikeImage from "@assets/bike_1756942189965.png";
import partImage from "@assets/part_1756942189965.png";
import helmetImage from "@assets/helmet_1756942189965.png";
import serviceImage from "@assets/service_1756942841815.png";

export default function Home() {
  const { data: featuredProducts = [], isLoading: isFeaturedLoading } = useQuery<ProductWithDiscount[]>({
    queryKey: ["/api/products", { featured: "true" }],
    queryFn: async () => {
      const response = await fetch("/api/products?featured=true");
      return response.json();
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="hero-gradient py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#c5e1f0d6]"></div>
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight animate-fade-in text-[#000000]" data-testid="text-hero-title">
            Premium <span className="text-[#b00000]">Sportbikes</span><br />
            <span className="floating">Built for the Road</span>
          </h1>
          <p className="text-xl mb-12 max-w-3xl mx-auto animate-slide-up text-[#000000e6]" data-testid="text-hero-description">
            Discover our collection of high-performance motorcycles, genuine parts, and premium accessories. 
            Your next adventure starts here with the best selection in Florida.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-bounce-in">
            <Link href="/catalog?category=motorcycles">
              <Button size="lg" className="text-lg px-10 py-6 bg-white text-red-600 hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-full" data-testid="button-shop-motorcycles">
                Shop Motorcycles
              </Button>
            </Link>
            <Link href="/catalog?category=parts">
              <Button variant="outline" size="lg" className="text-lg px-10 py-6 border-white bg-transparent text-white hover:bg-white hover:text-red-600 shadow-lg transition-all duration-300 rounded-full" data-testid="button-browse-parts">
                Browse Parts
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </section>
      {/* Customer Testimonials */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900" data-testid="text-testimonials-heading">What Our Customers Say</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto" data-testid="text-testimonials-description">
              Real reviews from satisfied customers who trust Sportbike Parts & Export for their motorcycle needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            <Card className="bg-white p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-red-600 animate-slide-up" data-testid="testimonial-1">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Excellent group of people running this shop. Recently purchased a new helmet and was offered a nice discount since I was making multiple purchases."
                </p>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">Verified Customer</span>
                  <div className="text-xs text-gray-500">Google Reviews</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-red-600 animate-slide-up" data-testid="testimonial-2" style={{animationDelay: '0.2s'}}>
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Good place, family oriented. I took my bike to Rally - did great job and thanks Angela for the consultation."
                </p>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">Verified Customer</span>
                  <div className="text-xs text-gray-500">Google Reviews</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-red-600 animate-slide-up" data-testid="testimonial-3" style={{animationDelay: '0.4s'}}>
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "We have everything for your motorcycle in stock. Really great prices on motorcycle tires and services."
                </p>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">Verified Customer</span>
                  <div className="text-xs text-gray-500">Google Reviews</div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center bg-gray-50 p-8 rounded-2xl">
            <div className="flex items-center justify-center space-x-8 mb-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-red-600">141</div>
                <div className="text-sm text-gray-600">Customer Reviews</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-red-600">4.8</div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
            </div>
            <p className="text-gray-700 max-w-3xl mx-auto">
              Join hundreds of satisfied customers who trust Sportbike Parts & Export for professional service, competitive pricing, and comprehensive motorcycle solutions. Our multilingual staff provides excellent customer service in English, Spanish, and Portuguese.
            </p>
          </div>

          {/* Quick Navigation Grid */}
          <div className="mt-16 mb-20 bg-gray-100 p-12 rounded-3xl">
            <h3 className="text-3xl font-semibold mb-12 text-center text-gray-900 animate-fade-in" data-testid="text-categories-heading">Shop by Category</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Link href="/catalog?category=motorcycles">
                <Card className="overflow-hidden shadow-lg border-0 rounded-2xl animate-slide-up card-hover cursor-pointer" data-testid="card-category-motorcycles" style={{animationDelay: '0.1s'}}>
                  <CardContent 
                    className="p-10 text-center bg-gradient-to-br from-red-600 to-red-800 text-white relative h-64"
                    style={{
                      backgroundImage: `url(${bikeImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  >
                    <div className="absolute inset-0 group-hover:bg-red-600/80 transition-colors duration-300 bg-[#4a4444e6]"></div>
                    <div className="relative z-10 h-full flex flex-col justify-center">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                        <Bike className="text-white text-3xl drop-shadow-lg" />
                      </div>
                      <h4 className="text-2xl font-bold mb-3 text-white drop-shadow-lg">Motorcycles</h4>
                      <p className="text-white/90 mb-6 drop-shadow-lg">Premium sportbikes and street bikes</p>
                      <span className="bg-white text-red-600 px-6 py-2 rounded-full font-semibold inline-block hover:bg-red-50 transition-colors drop-shadow-lg">Browse All →</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/catalog?category=parts">
                <Card className="overflow-hidden shadow-lg border-0 rounded-2xl animate-slide-up card-hover cursor-pointer" data-testid="card-category-parts" style={{animationDelay: '0.2s'}}>
                  <CardContent 
                    className="p-10 text-center bg-gradient-to-br from-gray-700 to-gray-900 text-white relative h-64"
                    style={{
                      backgroundImage: `url(${partImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  >
                    <div className="absolute inset-0 bg-gray-800/80 group-hover:bg-gray-800/70 transition-colors duration-300"></div>
                    <div className="relative z-10 h-full flex flex-col justify-center">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                        <Settings className="text-white text-3xl drop-shadow-lg" />
                      </div>
                      <h4 className="text-2xl font-bold mb-3 text-white drop-shadow-lg">Parts</h4>
                      <p className="text-white/90 mb-6 drop-shadow-lg">Genuine OEM and aftermarket parts</p>
                      <span className="bg-white text-gray-700 px-6 py-2 rounded-full font-semibold inline-block hover:bg-gray-50 transition-colors drop-shadow-lg">Browse All →</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/catalog?category=accessories">
                <Card className="overflow-hidden shadow-lg border-0 rounded-2xl animate-slide-up card-hover cursor-pointer" data-testid="card-category-accessories" style={{animationDelay: '0.3s'}}>
                  <CardContent 
                    className="p-10 text-center bg-gradient-to-br from-red-700 to-black text-white relative h-64"
                    style={{
                      backgroundImage: `url(${helmetImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  >
                    <div className="absolute inset-0 bg-black/80 group-hover:bg-black/70 transition-colors duration-300"></div>
                    <div className="relative z-10 h-full flex flex-col justify-center">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                        <Shield className="text-white text-3xl drop-shadow-lg" />
                      </div>
                      <h4 className="text-2xl font-bold mb-3 text-white drop-shadow-lg">Accessories</h4>
                      <p className="text-white/90 mb-6 drop-shadow-lg">Gear, helmets, and riding accessories</p>
                      <span className="bg-white text-red-700 px-6 py-2 rounded-full font-semibold inline-block hover:bg-red-50 transition-colors drop-shadow-lg">Browse All →</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* Motorcycle Loan Services Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-red-50 to-white">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-12">
            <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <CreditCard className="text-red-600 text-2xl" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">MOTORCYCLE LOAN SERVICES</h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Get on the road faster with <span className="text-red-600 font-semibold">quick approval</span> and <span className="text-red-600 font-semibold">flexible financing options</span>. Whether it's your very first bike or an upgrade to a high-performance model, we make it simple.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="bg-red-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-red-600 text-xl" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Hassle-free application process</h3>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="bg-red-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Star className="text-red-600 text-xl" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900"><span className="text-red-600">Competitive low</span> interest rates</h3>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="bg-red-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Users className="text-red-600 text-xl" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900"><span className="text-red-600">No credit history</span> required</h3>
            </div>
          </div>
          
          <Link href="/loan-application">
            <Button size="lg" className="text-lg px-12 py-6 bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full" data-testid="button-apply-now">
              Apply Now
            </Button>
          </Link>
        </div>
      </section>
      {/* All-in-One Service Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-gray-900">
                YOUR <span className="text-[#c74040]">ALL-IN-ONE DESTINATION</span> FOR <span className="text-[#000000]">MOTORCYCLES</span>, SERVICE & MAINTENANCE
              </h2>
              <div className="space-y-4 text-lg text-gray-700">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="text-green-400 text-xl mt-1 flex-shrink-0" />
                  <span>From <span className="text-green-400 font-semibold">high-performance sport bikes</span> to timeless cruisers, touring machines, adventure bikes, and custom builds — we service them all.</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="text-green-400 text-xl mt-1 flex-shrink-0" />
                  <span>Discover our extensive selection of <span className="text-green-400 font-semibold">premium motorcycle parts</span> and expert services designed to enhance not just speed, style, and reliability, but the entire riding experience.</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="text-green-400 text-xl mt-1 flex-shrink-0" />
                  <span>Whether you're chasing <span className="text-green-400 font-semibold">pure adrenaline</span> or the refined joy of the open road, we've got everything you need to take your ride to the next level.</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <img 
                src={serviceImage} 
                alt="Green motorcycle service" 
                className="w-full max-w-lg h-auto rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>
      {/* Trust & Credibility Section */}
      <section className="py-16 px-4 bg-white border-t border-gray-200">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Why Riders Trust Sportbike Parts & Export</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Serving Florida's motorcycle community with expertise, quality, and dedicated service
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center animate-slide-up">
              <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Award className="text-red-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Expert Knowledge</h3>
              <p className="text-gray-600">
                Decades of combined experience in sportbike sales, service, and performance modifications. 
                Our team knows these machines inside and out.
              </p>
            </div>
            
            <div className="text-center animate-slide-up" style={{animationDelay: '0.1s'}}>
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-gray-700 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Quality Guaranteed</h3>
              <p className="text-gray-600">
                We stock only genuine OEM parts and premium aftermarket components from trusted manufacturers. 
                Quality you can count on.
              </p>
            </div>
            
            <div className="text-center animate-slide-up" style={{animationDelay: '0.2s'}}>
              <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="text-red-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Community Focused</h3>
              <p className="text-gray-600">
                Part of Florida's riding community for years. Follow us on Facebook to connect with fellow riders 
                and stay updated on events and new arrivals.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link href="/contact">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full">
                Visit Our Shop Today
              </Button>
            </Link>
          </div>
        </div>
      </section>
      {/* Visit Us Section */}
      <section className="py-16 px-4 bg-gray-100">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Visit Our Store</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Come see our selection of motorcycles and parts in person. Our Kissimmee location serves riders throughout Central Florida.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Google Maps Embed */}
            <div className="bg-white rounded-xl overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3509.4573833157887!2d-81.42978900000001!3d28.279801799999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88dd847617b2b255%3A0x93caaf6aa9fbbf9b!2sSportbike%20Parts%20%26%20Export!5e0!3m2!1sen!2sus!4v1635000000000!5m2!1sen!2sus"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Sportbike Parts & Export Location"
                data-testid="google-maps-embed"
              />
            </div>
            
            {/* Store Information */}
            <div className="space-y-6">
              <Card className="bg-white shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-red-100 rounded-full p-3">
                      <MapPin className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-gray-900">Our Location</h3>
                      <p className="text-gray-600 mb-3">
                        2215 Clay St<br />
                        Kissimmee, FL 34741
                      </p>
                      <p className="text-gray-600 mb-4">
                        Phone: <span className="font-medium">(407) 483-4884</span>
                      </p>
                      <a 
                        href="https://www.google.com/maps/place/Sportbike+Parts+%26+Export/@28.2798018,-81.429789,17z/data=!3m1!4b1!4m6!3m5!1s0x88dd847617b2b255:0x93caaf6aa9fbbf9b!8m2!3d28.2798018!4d-81.4272087!16s%2Fg%2F12lkd4ybj?entry=ttu&g_ep=EgoyMDI1MDgyNS4wIKXMDSoASAFQAw%3D%3D"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full transition-colors"
                        data-testid="button-directions"
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Get Directions
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <BusinessHours />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
