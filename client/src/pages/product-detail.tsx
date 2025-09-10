import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProductWithDiscount } from "@/lib/types";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ShoppingCart, Star, Package, Truck, CreditCard, DollarSign } from "lucide-react";
import { Link } from "wouter";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { addToCart, isUpdating } = useCart();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: product, isLoading, error } = useQuery<ProductWithDiscount>({
    queryKey: ["/api/products", params?.id],
    queryFn: async () => {
      const response = await fetch(`/api/products/${params?.id}`);
      if (!response.ok) {
        throw new Error("Product not found");
      }
      return response.json();
    },
    enabled: !!params?.id,
  });

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      await addToCart({ productId: product.id });
      toast({
        title: "Added to cart",
        description: `${product.title} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePayment = async (isDeposit: boolean = false) => {
    if (!product) return;
    
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          isDeposit
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.checkoutUrl) {
        // Redirect to Stripe hosted checkout
        window.location.href = data.checkoutUrl;
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to create checkout session",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="container mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-card rounded mb-8 w-32"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-card rounded"></div>
              <div className="space-y-4">
                <div className="h-8 bg-card rounded w-3/4"></div>
                <div className="h-6 bg-card rounded w-1/2"></div>
                <div className="h-16 bg-card rounded"></div>
                <div className="h-12 bg-card rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4" data-testid="text-product-not-found">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist or has been removed.</p>
          <Link href="/catalog">
            <Button data-testid="button-back-to-catalog">Back to Catalog</Button>
          </Link>
        </div>
      </div>
    );
  }

  const hasDiscount = product.discount && parseFloat(product.discount) > 0;
  const originalPrice = parseFloat(product.price);
  const discountedPrice = product.discountedPrice || originalPrice;

  const getStatusBadge = () => {
    if (product.stockStatus === "sold") {
      return <Badge variant="destructive">Sold</Badge>;
    }
    if (hasDiscount) {
      return <Badge className="bg-amber-500 text-black">Sale</Badge>;
    }
    if (product.featured) {
      return <Badge variant="default">Featured</Badge>;
    }
    return <Badge className="bg-green-500 text-black">In Stock</Badge>;
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto">
        <Link href="/catalog">
          <Button variant="ghost" className="mb-8" data-testid="button-back">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Catalog
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={product.images[selectedImageIndex] || "/placeholder-product.jpg"}
                alt={product.title}
                className="w-full max-w-full h-auto max-h-96 object-contain bg-gray-50 rounded-lg"
                data-testid="img-product-main"
                style={{ imageRendering: 'crisp-edges' }}
              />
              <div className="absolute top-4 right-4">
                {getStatusBadge()}
              </div>
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${product.title} ${index + 1}`}
                    className={`flex-shrink-0 w-20 h-20 object-contain bg-gray-50 rounded cursor-pointer transition-all ${
                      selectedImageIndex === index 
                        ? 'ring-2 ring-red-500 opacity-100' 
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                    data-testid={`img-product-thumb-${index}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2" data-testid="text-product-title">
                {product.title}
              </h1>
              <p className="text-muted-foreground text-lg" data-testid="text-product-category">
                {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {hasDiscount ? (
                <>
                  <span className="text-2xl text-muted-foreground line-through" data-testid="text-original-price">
                    ${originalPrice.toFixed(2)}
                  </span>
                  <span className="text-3xl font-bold text-primary" data-testid="text-discounted-price">
                    ${discountedPrice.toFixed(2)}
                  </span>
                  <Badge className="bg-amber-500 text-black" data-testid="badge-discount">
                    {product.discountType === "percentage" ? `${product.discount}% OFF` : `$${product.discount} OFF`}
                  </Badge>
                </>
              ) : (
                <span className="text-3xl font-bold text-primary" data-testid="text-price">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            <div className="text-foreground leading-relaxed" data-testid="text-product-description">
              {product.description.split('\n').map((line, index) => {
                if (line.trim() === '') return <br key={index} />;
                if (line.includes('KEY SPECIFICATIONS:') || line.includes('DEPOSIT POLICY:')) {
                  return <h4 key={index} className="font-semibold text-lg mt-6 mb-2">{line.trim()}</h4>;
                }
                if (line.trim().startsWith('•')) {
                  return (
                    <div key={index} className="flex items-start ml-4 mb-1">
                      <span className="text-red-600 font-bold mr-3 mt-1">•</span>
                      <span className="text-left">{line.trim().substring(1).trim()}</span>
                    </div>
                  );
                }
                return <p key={index} className="mb-2">{line}</p>;
              })}
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm" data-testid="text-stock-status">
                  {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : "Out of stock"}
                </span>
              </div>
              
              
              {product.featured && (
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-primary" />
                  <span className="text-sm">Featured Product</span>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-3">
                {/* Payment buttons based on product category */}
                {product.category === "motorcycles" ? (
                  <>
                    <Button
                      size="lg"
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => handlePayment(true)}
                      disabled={product.stockStatus === "sold" || product.stockQuantity === 0}
                      data-testid="button-pay-deposit"
                    >
                      <CreditCard className="mr-2 h-5 w-5" />
                      {product.stockStatus === "sold" ? "Sold Out" : 
                       product.stockQuantity === 0 ? "Out of Stock" : "Pay $500 Deposit Now"}
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full border-red-600 text-red-600 hover:bg-red-50"
                      onClick={handleAddToCart}
                      disabled={isUpdating || product.stockStatus === "sold" || product.stockQuantity === 0}
                      data-testid="button-add-to-cart"
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Add to Cart
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="lg"
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => handlePayment(false)}
                      disabled={product.stockStatus === "sold" || product.stockQuantity === 0}
                      data-testid="button-buy-now"
                    >
                      <DollarSign className="mr-2 h-5 w-5" />
                      {product.stockStatus === "sold" ? "Sold Out" : 
                       product.stockQuantity === 0 ? "Out of Stock" : "Buy Now"}
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full border-red-600 text-red-600 hover:bg-red-50"
                      onClick={handleAddToCart}
                      disabled={isUpdating || product.stockStatus === "sold" || product.stockQuantity === 0}
                      data-testid="button-add-to-cart"
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Add to Cart
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Product Specifications */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4" data-testid="text-specifications-heading">Specifications</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Category:</span>
                    <span className="ml-2 font-medium" data-testid="text-spec-category">
                      {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Stock:</span>
                    <span className="ml-2 font-medium" data-testid="text-spec-stock">
                      {product.stockQuantity} available
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <span className="ml-2 font-medium" data-testid="text-spec-status">
                      {product.stockStatus.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  {product.featured && (
                    <div>
                      <span className="text-muted-foreground">Featured:</span>
                      <span className="ml-2 font-medium text-primary">Yes</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
