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
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function LoanApplication() {
  const [addCoApplicant, setAddCoApplicant] = useState("no");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const { toast } = useToast();

  const submitLoanMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      // Helper function to safely get string values
      const getString = (key: string): string => {
        const value = formData.get(key);
        return value ? String(value) : '';
      };

      const applicationData = {
        firstName: getString('firstName'),
        lastName: getString('lastName'),
        email: getString('email'),
        phone: getString('phone'),
        dateOfBirth: getString('dob'),
        ssn: getString('ssn'),
        address: getString('address'),
        city: getString('city'),
        state: getString('state'),
        zipCode: getString('zipCode'),
        idType: getString('idType'),
        idNumber: getString('idNumber'),
        income: getString('income'),
        employment: getString('employment'),
        creditScore: getString('creditScore'),
        loanAmount: getString('loanAmount'),
        downPayment: getString('downPayment'),
        vehicleInterest: getString('vehicleInterest'),
        paystubs: getString('paystubs'),
        message: getString('message'),
        addCoApplicant: addCoApplicant,
        // Co-applicant fields - always include as strings
        coFirstName: addCoApplicant === "yes" ? getString('coFirstName') : '',
        coLastName: addCoApplicant === "yes" ? getString('coLastName') : '',
        coEmail: addCoApplicant === "yes" ? getString('coEmail') : '',
        coPhone: addCoApplicant === "yes" ? getString('coPhone') : '',
        coDateOfBirth: addCoApplicant === "yes" ? getString('coDob') : '',
        coSsn: addCoApplicant === "yes" ? getString('coSsn') : '',
        coIncome: addCoApplicant === "yes" ? getString('coIncome') : '',
        coEmployment: addCoApplicant === "yes" ? getString('coEmployment') : '',
        coCreditScore: addCoApplicant === "yes" ? getString('coCreditScore') : '',
      };
      
      const response = await apiRequest("POST", "/api/send-loan-application", applicationData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted Successfully!",
        description: "Your loan application has been sent to our finance team. We'll contact you within 24 hours.",
      });
    },
    onError: (error: any) => {
      console.error("Error submitting loan application:", error);
      toast({
        title: "Error",
        description: "Failed to submit your application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptTerms) {
      toast({
        title: "Please accept terms",
        description: "You must accept the terms and conditions to proceed.",
        variant: "destructive",
      });
      return;
    }
    
    const formData = new FormData(e.target as HTMLFormElement);
    submitLoanMutation.mutate(formData);
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

              {/* Co-Applicant Information - Show only if Yes is selected */}
              {addCoApplicant === "yes" && (
                <div className="space-y-6 border-l-4 border-red-500 pl-6 bg-red-50 p-6 rounded-r-lg">
                  <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">Co-Applicant Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="coFirstName" className="text-sm font-medium text-gray-700">Co-Applicant First Name</Label>
                      <Input 
                        id="coFirstName" 
                        name="coFirstName" 
                        type="text" 
                        placeholder="Enter co-applicant first name" 
                        required={addCoApplicant === "yes"}
                        className="rounded-lg"
                        data-testid="input-co-first-name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="coLastName" className="text-sm font-medium text-gray-700">Co-Applicant Last Name</Label>
                      <Input 
                        id="coLastName" 
                        name="coLastName" 
                        type="text" 
                        placeholder="Enter co-applicant last name" 
                        required={addCoApplicant === "yes"}
                        className="rounded-lg"
                        data-testid="input-co-last-name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="coPhone" className="text-sm font-medium text-gray-700">Co-Applicant Phone Number</Label>
                      <Input 
                        id="coPhone" 
                        name="coPhone" 
                        type="tel" 
                        placeholder="(555) 123-4567" 
                        required={addCoApplicant === "yes"}
                        className="rounded-lg"
                        data-testid="input-co-phone"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="coEmail" className="text-sm font-medium text-gray-700">Co-Applicant Email</Label>
                      <Input 
                        id="coEmail" 
                        name="coEmail" 
                        type="email" 
                        placeholder="co.applicant@example.com" 
                        required={addCoApplicant === "yes"}
                        className="rounded-lg"
                        data-testid="input-co-email"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="coDob" className="text-sm font-medium text-gray-700">Co-Applicant Date of Birth</Label>
                      <Input 
                        id="coDob" 
                        name="coDob" 
                        type="date" 
                        required={addCoApplicant === "yes"}
                        className="rounded-lg"
                        data-testid="input-co-dob"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="coSsn" className="text-sm font-medium text-gray-700">Co-Applicant SSN/ITIN</Label>
                      <Input 
                        id="coSsn" 
                        name="coSsn" 
                        type="text" 
                        placeholder="XXX-XX-XXXX" 
                        required={addCoApplicant === "yes"}
                        className="rounded-lg"
                        data-testid="input-co-ssn"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="coIncome" className="text-sm font-medium text-gray-700">Co-Applicant Annual Income</Label>
                      <Input 
                        id="coIncome" 
                        name="coIncome" 
                        type="number" 
                        placeholder="50000" 
                        required={addCoApplicant === "yes"}
                        className="rounded-lg"
                        data-testid="input-co-income"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="coEmployment" className="text-sm font-medium text-gray-700">Co-Applicant Employment Status</Label>
                      <Select name="coEmployment" required={addCoApplicant === "yes"}>
                        <SelectTrigger className="rounded-lg" data-testid="select-co-employment">
                          <SelectValue placeholder="Select employment status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="self-employed">Self-employed</SelectItem>
                          <SelectItem value="retired">Retired</SelectItem>
                          <SelectItem value="unemployed">Unemployed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coCreditScore" className="text-sm font-medium text-gray-700">Co-Applicant Credit Score Range</Label>
                    <Select name="coCreditScore" required={addCoApplicant === "yes"}>
                      <SelectTrigger className="rounded-lg" data-testid="select-co-credit-score">
                        <SelectValue placeholder="Select credit score range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent (750+)</SelectItem>
                        <SelectItem value="good">Good (700-749)</SelectItem>
                        <SelectItem value="fair">Fair (650-699)</SelectItem>
                        <SelectItem value="poor">Poor (600-649)</SelectItem>
                        <SelectItem value="very-poor">Very Poor (Below 600)</SelectItem>
                        <SelectItem value="no-credit">No Credit History</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

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
                  disabled={!acceptTerms || submitLoanMutation.isPending}
                  data-testid="button-submit-application"
                >
                  {submitLoanMutation.isPending ? "Submitting Application..." : "Submit Application"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}