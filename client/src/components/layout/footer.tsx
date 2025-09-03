import { Bike, Phone, Mail, MapPin } from "lucide-react";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border py-12 px-4 mt-16">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Bike className="text-primary text-2xl" />
              <span className="text-xl font-bold">SportbikeFL</span>
            </div>
            <p className="text-muted-foreground">
              Your premier destination for high-performance motorcycles and genuine parts in Florida.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="/" className="hover:text-primary transition-colors" data-testid="footer-link-home">Home</a></li>
              <li><a href="/catalog?category=motorcycles" className="hover:text-primary transition-colors" data-testid="footer-link-motorcycles">Motorcycles</a></li>
              <li><a href="/catalog?category=parts" className="hover:text-primary transition-colors" data-testid="footer-link-parts">Parts</a></li>
              <li><a href="/catalog?category=accessories" className="hover:text-primary transition-colors" data-testid="footer-link-accessories">Accessories</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <span data-testid="text-phone">(555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <span data-testid="text-email">info@sportbikefl.com</span>
              </li>
              <li className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span data-testid="text-address">123 Speedway Blvd, Miami, FL</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-facebook">
                <FaFacebook className="text-xl" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-instagram">
                <FaInstagram className="text-xl" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-youtube">
                <FaYoutube className="text-xl" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
          <p data-testid="text-copyright">&copy; 2024 SportbikeFL. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
