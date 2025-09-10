import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { CheckCircle, ArrowLeft, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface CheckoutSession {
  id: string;
  amount_total: number;
  payment_status: string;
  metadata: {
    productTitle: string;
    isDeposit: string;
  };
}

export default function CheckoutSuccess() {
  const [, setLocation] = useLocation();
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (!sessionId) {
      setError('No session ID found');
      setLoading(false);
      return;
    }

    // Fetch session details
    fetch(`/api/checkout-session/${sessionId}`)
      .then(response => response.json())
      .then(data => {
        if (data.id) {
          setSession(data);
        } else {
          setError(data.message || 'Failed to retrieve session details');
        }
      })
      .catch(err => {
        console.error('Error fetching session:', err);
        setError('Failed to retrieve payment details');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Payment Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">{error || 'Payment details not found'}</p>
            <Button onClick={() => setLocation('/catalog')} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Catalog
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isDeposit = session.metadata.isDeposit === 'true';
  const isPaymentSuccessful = session.payment_status === 'paid';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
          </div>
          <CardTitle className="text-3xl font-bold text-green-600">
            {isPaymentSuccessful ? 'Payment Successful!' : 'Payment Processing'}
          </CardTitle>
          <p className="text-muted-foreground text-lg">
            Thank you for your {isDeposit ? 'deposit' : 'purchase'}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-gray-600">
                <Receipt className="inline mr-2 h-4 w-4" />
                Payment Details
              </span>
              <span className="text-sm text-green-600 font-medium">
                {session.payment_status.toUpperCase()}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product:</span>
                <span className="font-medium text-right">{session.metadata.productTitle}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Type:</span>
                <span className="font-medium">
                  {isDeposit ? 'Deposit Payment' : 'Full Payment'}
                </span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-lg font-bold">
                <span>Total Paid:</span>
                <span className="text-green-600">
                  ${(session.amount_total / 100).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {isDeposit && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
              <h3 className="font-semibold text-amber-800 mb-2">Important - Deposit Payment</h3>
              <p className="text-amber-700 text-sm">
                You have successfully paid a $500 deposit for this motorcycle. The remaining balance 
                will be due upon pickup or delivery. Our team will contact you within 24 hours to 
                coordinate the next steps.
              </p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">What's Next?</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• You will receive a confirmation email with payment details</li>
              <li>• Our team will contact you within 24 hours</li>
              <li>• {isDeposit ? 'We will coordinate pickup/delivery and final payment' : 'We will arrange delivery or pickup'}</li>
              <li>• Questions? Call us at (407) 483-4884</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setLocation('/catalog')}
              className="flex-1"
              data-testid="button-continue-shopping"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
            
            <Link href="/" className="flex-1">
              <Button className="w-full bg-red-600 hover:bg-red-700" data-testid="button-home">
                Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}