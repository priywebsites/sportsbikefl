import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function LoanApplication() {
  const [addCoApplicant, setAddCoApplicant] = useState("no");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Loan application submitted");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-red-600 hover:text-red-700 font-medium" data-testid="link-back-home">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-lg">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 rounded-full p-2">
                <CreditCard className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl md:text-3xl font-bold">Motorcycle Loan Credit Application</CardTitle>
            </div>
          </CardHeader>
          
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</Label>
                    <Input 
                      id="firstName" 
                      name="firstName" 
                      type="text" 
                      placeholder="Enter your first name" 
                      required 
                      className="rounded-lg"
                      data-testid="input-first-name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</Label>
                    <Input 
                      id="lastName" 
                      name="lastName" 
                      type="text" 
                      placeholder="Enter your last name" 
                      required 
                      className="rounded-lg"
                      data-testid="input-last-name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number / Mobile</Label>
                    <Input 
                      id="phone" 
                      name="phone" 
                      type="tel" 
                      placeholder="(555) 123-4567" 
                      required 
                      className="rounded-lg"
                      data-testid="input-phone"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      placeholder="your.email@example.com" 
                      required 
                      className="rounded-lg"
                      data-testid="input-email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="dob" className="text-sm font-medium text-gray-700">Date of Birth</Label>
                    <Input 
                      id="dob" 
                      name="dob" 
                      type="date" 
                      required 
                      className="rounded-lg"
                      data-testid="input-dob"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ssn" className="text-sm font-medium text-gray-700">Social Security or ITIN</Label>
                    <Input 
                      id="ssn" 
                      name="ssn" 
                      type="text" 
                      placeholder="XXX-XX-XXXX" 
                      required 
                      className="rounded-lg"
                      data-testid="input-ssn"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="primaryId" className="text-sm font-medium text-gray-700">Primary ID</Label>
                    <Select name="primaryId" required>
                      <SelectTrigger className="rounded-lg" data-testid="select-primary-id">
                        <SelectValue placeholder="Select ID type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="drivers-license">Driver's License</SelectItem>
                        <SelectItem value="state-id">State ID</SelectItem>
                        <SelectItem value="passport">Passport</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="idNumber" className="text-sm font-medium text-gray-700">ID Number</Label>
                    <Input 
                      id="idNumber" 
                      name="idNumber" 
                      type="text" 
                      placeholder="Enter ID number" 
                      required 
                      className="rounded-lg"
                      data-testid="input-id-number"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">Address Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium text-gray-700">Current Home Street Address</Label>
                  <Input 
                    id="address" 
                    name="address" 
                    type="text" 
                    placeholder="123 Main Street" 
                    required 
                    className="rounded-lg"
                    data-testid="input-address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cityStateZip" className="text-sm font-medium text-gray-700">City, State, Zipcode</Label>
                  <Input 
                    id="cityStateZip" 
                    name="cityStateZip" 
                    type="text" 
                    placeholder="Orlando, FL 32801" 
                    required 
                    className="rounded-lg"
                    data-testid="input-city-state-zip"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="housingStatus" className="text-sm font-medium text-gray-700">Housing Status</Label>
                    <Select name="housingStatus" required>
                      <SelectTrigger className="rounded-lg" data-testid="select-housing-status">
                        <SelectValue placeholder="Select housing status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rent">Rent</SelectItem>
                        <SelectItem value="own">Own</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mortgageRent" className="text-sm font-medium text-gray-700">Mortgage/Rent Payment</Label>
                    <Input 
                      id="mortgageRent" 
                      name="mortgageRent" 
                      type="number" 
                      placeholder="1200" 
                      required 
                      className="rounded-lg"
                      data-testid="input-mortgage-rent"
                    />
                  </div>
                </div>
              </div>

              {/* Employment Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">Employment Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="monthlyIncome" className="text-sm font-medium text-gray-700">Monthly Income</Label>
                    <Input 
                      id="monthlyIncome" 
                      name="monthlyIncome" 
                      type="number" 
                      placeholder="4500" 
                      required 
                      className="rounded-lg"
                      data-testid="input-monthly-income"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="workplace" className="text-sm font-medium text-gray-700">Workplace</Label>
                    <Input 
                      id="workplace" 
                      name="workplace" 
                      type="text" 
                      placeholder="Company name" 
                      required 
                      className="rounded-lg"
                      data-testid="input-workplace"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="workPhone" className="text-sm font-medium text-gray-700">Work Phone / Business</Label>
                    <Input 
                      id="workPhone" 
                      name="workPhone" 
                      type="tel" 
                      placeholder="(555) 987-6543" 
                      required 
                      className="rounded-lg"
                      data-testid="input-work-phone"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="paystubs" className="text-sm font-medium text-gray-700">Do you have the last 2 paystubs available?</Label>
                    <Select name="paystubs" required>
                      <SelectTrigger className="rounded-lg" data-testid="select-paystubs">
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">Additional Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm font-medium text-gray-700">Message</Label>
                  <Textarea 
                    id="message" 
                    name="message" 
                    placeholder="Tell us about your motorcycle needs or any additional information..." 
                    rows={4}
                    className="rounded-lg"
                    data-testid="textarea-message"
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-sm font-medium text-gray-700">Add Co-applicant</Label>
                  <RadioGroup value={addCoApplicant} onValueChange={setAddCoApplicant} className="flex space-x-6">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="co-applicant-yes" data-testid="radio-co-applicant-yes" />
                      <Label htmlFor="co-applicant-yes" className="text-sm text-gray-700">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="co-applicant-no" data-testid="radio-co-applicant-no" />
                      <Label htmlFor="co-applicant-no" className="text-sm text-gray-700">No</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900">Terms & Conditions</h3>
                
                <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                  <p>
                    By submitting this form, I confirm that all information provided is accurate and truthful to the best of my knowledge. 
                    I authorize the lender to verify my details, obtain a credit report, and evaluate my application. I understand that 
                    submitting this application does not guarantee approval. False or misleading information may result in denial or legal action.
                  </p>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="accept-terms" 
                    checked={acceptTerms} 
                    onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                    required
                    data-testid="checkbox-accept-terms"
                  />
                  <Label htmlFor="accept-terms" className="text-sm text-gray-700 leading-relaxed">
                    I accept the terms and conditions
                  </Label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full md:w-auto text-lg px-12 py-6 bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full"
                  disabled={!acceptTerms}
                  data-testid="button-submit-application"
                >
                  Submit Application
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}