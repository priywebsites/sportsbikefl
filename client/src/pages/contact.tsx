import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Clock, Facebook } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-900" data-testid="text-contact-heading">Contact SportbikeFL</h1>
          <p className="text-lg text-gray-600" data-testid="text-contact-description">
            Get in touch with Florida's premier sportbike dealership. We're here to help with all your motorcycle needs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="mr-2 h-5 w-5 text-red-600" />
                  Phone & Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Phone className="mr-3 h-4 w-4 text-gray-500" />
                  <span data-testid="text-phone">(555) 123-4567</span>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-3 h-4 w-4 text-gray-500" />
                  <div>
                    <div className="font-medium">Business Hours:</div>
                    <div className="text-sm text-gray-600">
                      Mon-Fri: 9:00 AM - 7:00 PM<br />
                      Saturday: 9:00 AM - 6:00 PM<br />
                      Sunday: 11:00 AM - 4:00 PM
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-red-600" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <MapPin className="mr-3 h-4 w-4 text-gray-500" />
                  <div>
                    <div data-testid="text-address">123 Speedway Blvd</div>
                    <div className="text-gray-600">Miami, FL 33101</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="mr-3 h-4 w-4 text-gray-500" />
                  <span data-testid="text-email">info@sportbikefl.com</span>
                </div>
                <div className="flex items-center">
                  <Facebook className="mr-3 h-4 w-4 text-gray-500" />
                  <a href="https://www.facebook.com/sportbikeparts/" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700" data-testid="link-facebook">
                    Follow us on Facebook
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Why Choose SportbikeFL?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3"></div>
                  <div>
                    <div className="font-medium">Expert Knowledge</div>
                    <div className="text-sm text-gray-600">Our team has decades of experience with sportbikes and performance parts</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3"></div>
                  <div>
                    <div className="font-medium">Quality Parts</div>
                    <div className="text-sm text-gray-600">We stock only genuine OEM and premium aftermarket components</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3"></div>
                  <div>
                    <div className="font-medium">Professional Service</div>
                    <div className="text-sm text-gray-600">From sales to service, we provide exceptional customer support</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">First Name</label>
                    <Input placeholder="Your first name" data-testid="input-first-name" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Last Name</label>
                    <Input placeholder="Your last name" data-testid="input-last-name" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" placeholder="your.email@example.com" data-testid="input-email" />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input placeholder="(555) 123-4567" data-testid="input-phone" />
                </div>
                <div>
                  <label className="text-sm font-medium">Subject</label>
                  <Input placeholder="How can we help you?" data-testid="input-subject" />
                </div>
                <div>
                  <label className="text-sm font-medium">Message</label>
                  <Textarea 
                    placeholder="Tell us about your motorcycle needs, questions about parts, or anything else we can help with..."
                    className="min-h-[120px]"
                    data-testid="textarea-message"
                  />
                </div>
                <Button className="w-full bg-red-600 hover:bg-red-700" data-testid="button-send-message">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}