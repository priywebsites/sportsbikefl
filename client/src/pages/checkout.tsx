import { useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { ArrowLeft, CreditCard, CheckCircle } from 'lucide-react';

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CheckoutFormProps {
  amount: number;
  productTitle: string;
  isDeposit: boolean;
  onSuccess: () => void;
}

const CheckoutForm = ({ amount, productTitle, isDeposit, onSuccess }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
      redirect: 'if_required',
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    } else {
      toast({
        title: "Payment Successful",
        description: `${isDeposit ? 'Deposit' : 'Payment'} processed successfully!`,
      });
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Payment Details</h3>
        <PaymentElement />
      </div>
      <Button 
        type="submit" 
        disabled={!stripe || isLoading} 
        className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg font-semibold"
        data-testid="button-complete-payment"
      >
        {isLoading ? (
          "Processing..."
        ) : (
          <>
            <CreditCard className="h-5 w-5 mr-2" />
            {isDeposit ? `Pay $${amount} Deposit` : `Pay $${amount}`}
          </>
        )}
      </Button>
    </form>
  );
};

export default function Checkout() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/checkout/:productId');
  const [clientSecret, setClientSecret] = useState("");
  const [product, setProduct] = useState<any>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = params?.productId || urlParams.get('productId');
    const isDeposit = urlParams.get('deposit') === 'true';
    const amount = parseFloat(urlParams.get('amount') || '0');
    const productTitle = urlParams.get('title') || 'Product';

    if (!productId || !amount) {
      setLocation('/catalog');
      return;
    }

    // Create payment intent
    apiRequest("POST", "/api/create-payment-intent", { 
      productId,
      amount,
      productTitle,
      isDeposit 
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
        setPaymentData({
          amount,
          productTitle,
          isDeposit,
          productId
        });
      })
      .catch((error) => {
        console.error("Error creating payment intent:", error);
        setLocation('/catalog');
      });

    // Fetch product details
    if (productId) {
      fetch(`/api/products/${productId}`)
        .then(res => res.json())
        .then(setProduct)
        .catch(console.error);
    }
  }, [params, setLocation]);

  const handlePaymentSuccess = () => {
    setShowSuccess(true);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">
              {paymentData?.isDeposit 
                ? `Your $${paymentData.amount} deposit for ${paymentData.productTitle} has been processed.`
                : `Your payment of $${paymentData.amount} for ${paymentData.productTitle} has been processed.`
              }
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => setLocation('/catalog')} 
                className="w-full"
                data-testid="button-continue-shopping"
              >
                Continue Shopping
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setLocation('/contact')} 
                className="w-full"
                data-testid="button-contact-us"
              >
                Contact Us
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!clientSecret || !paymentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/catalog')} 
          className="mb-6"
          data-testid="button-back-catalog"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Catalog
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Order Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {product && (
                <div className="flex items-center space-x-4">
                  {product.images?.[0] && (
                    <img 
                      src={product.images[0]} 
                      alt={product.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{paymentData.productTitle}</h3>
                    <p className="text-sm text-gray-600">{product.category}</p>
                  </div>
                </div>
              )}
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>
                    {paymentData.isDeposit ? 'Deposit Amount:' : 'Total Amount:'}
                  </span>
                  <span className="text-red-600">${paymentData.amount}</span>
                </div>
                {paymentData.isDeposit && (
                  <p className="text-sm text-gray-600 mt-2">
                    *This is a deposit payment. The remaining balance will be due upon pickup/delivery.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle>
                {paymentData.isDeposit ? 'Pay Deposit' : 'Complete Purchase'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm
                  amount={paymentData.amount}
                  productTitle={paymentData.productTitle}
                  isDeposit={paymentData.isDeposit}
                  onSuccess={handlePaymentSuccess}
                />
              </Elements>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}