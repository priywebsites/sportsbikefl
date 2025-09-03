import { Bike, Phone, Mail, MapPin } from "lucide-react";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16 px-4 mt-20">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-full p-2">
                <Bike className="text-white text-2xl" />
              </div>
              <span className="text-2xl font-bold text-white">SportbikeFL</span>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Your premier destination for high-performance motorcycles and genuine parts in Florida.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 text-lg text-white">Quick Links</h4>
            <ul className="space-y-3 text-gray-300">
              <li><a href="/" className="hover:text-red-400 transition-colors" data-testid="footer-link-home">Home</a></li>
              <li><a href="/catalog?category=motorcycles" className="hover:text-red-400 transition-colors" data-testid="footer-link-motorcycles">Motorcycles</a></li>
              <li><a href="/catalog?category=parts" className="hover:text-red-400 transition-colors" data-testid="footer-link-parts">Parts</a></li>
              <li><a href="/catalog?category=accessories" className="hover:text-red-400 transition-colors" data-testid="footer-link-accessories">Accessories</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 text-lg text-white">Contact Info</h4>
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-center">
                <div className="bg-gray-600 rounded-full p-2 mr-3">
                  <Phone className="h-4 w-4 text-white" />
                </div>
                <span data-testid="text-phone">(407) 483-4884</span>
              </li>
              <li className="flex items-center">
                <div className="bg-red-600 rounded-full p-2 mr-3">
                  <Mail className="h-4 w-4 text-white" />
                </div>
                <span data-testid="text-email">info@sportbikefl.com</span>
              </li>
              <li className="flex items-center">
                <div className="bg-gray-700 rounded-full p-2 mr-3">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <span data-testid="text-address">2215 Clay St, Kissimmee, FL 34741</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 text-lg text-white">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="bg-gray-600 hover:bg-gray-700 p-3 rounded-full transition-all duration-300 hover:scale-110" data-testid="link-facebook">
                <FaFacebook className="text-xl text-white" />
              </a>
              <a href="#" className="bg-red-600 hover:bg-red-700 p-3 rounded-full transition-all duration-300 hover:scale-110" data-testid="link-instagram">
                <FaInstagram className="text-xl text-white" />
              </a>
              <a href="#" className="bg-black hover:bg-gray-800 p-3 rounded-full transition-all duration-300 hover:scale-110" data-testid="link-youtube">
                <FaYoutube className="text-xl text-white" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
          <p data-testid="text-copyright">&copy; 2024 SportbikeFL. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
