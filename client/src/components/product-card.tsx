import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProductWithDiscount } from "@/lib/types";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { ShoppingCart } from "lucide-react";

interface ProductCardProps {
  product: ProductWithDiscount;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, isUpdating } = useCart();
  const { toast } = useToast();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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

  const getStatusBadge = () => {
    if (product.stockStatus === "sold") {
      return <Badge className="bg-red-500 text-white font-semibold">Sold</Badge>;
    }
    if (product.discount && parseFloat(product.discount) > 0) {
      return <Badge className="bg-gradient-to-r from-orange-400 to-red-500 text-white font-semibold">Sale</Badge>;
    }
    if (product.featured) {
      return <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold">Featured</Badge>;
    }
    return <Badge className="bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold">In Stock</Badge>;
  };

  const hasDiscount = product.discount && parseFloat(product.discount) > 0;
  const originalPrice = parseFloat(product.price);
  const discountedPrice = product.discountedPrice || originalPrice;

  return (
    <Card className="bg-gradient-to-br from-orange-100 via-red-50 to-pink-100 rounded-2xl overflow-hidden card-hover cursor-pointer shadow-lg border-0 group" data-testid={`card-product-${product.id}`}>
      <div className="relative">
        <Link href={`/product/${product.id}`}>
          <img 
            src={product.images[0] || "/placeholder-product.jpg"} 
            alt={product.title}
            className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
            data-testid={`img-product-${product.id}`}
          />
        </Link>
        <div className="absolute top-3 right-3">
          {getStatusBadge()}
        </div>
      </div>
      <CardContent className="p-6">
        <Link href={`/product/${product.id}`}>
          <div className="mb-4">
            <h4 className="text-xl font-bold line-clamp-2 text-gray-800 hover:text-purple-600 transition-colors" data-testid={`text-title-${product.id}`}>
              {product.title}
            </h4>
          </div>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2" data-testid={`text-description-${product.id}`}>
            {product.description}
          </p>
        </Link>
        <div className="space-y-4">
          <div className="flex flex-col">
            {hasDiscount ? (
              <>
                <span className="text-sm text-gray-400 line-through" data-testid={`text-original-price-${product.id}`}>
                  ${originalPrice.toFixed(2)}
                </span>
                <span className="text-2xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent" data-testid={`text-discounted-price-${product.id}`}>
                  ${discountedPrice.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent" data-testid={`text-price-${product.id}`}>
                ${originalPrice.toFixed(2)}
              </span>
            )}
            <span className="text-xs text-gray-500" data-testid={`text-stock-${product.id}`}>
              {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : "Out of stock"}
            </span>
          </div>
          <Button
            className="w-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 hover:from-green-600 hover:via-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={handleAddToCart}
            disabled={isUpdating || product.stockStatus === "sold" || product.stockQuantity === 0}
            data-testid={`button-add-to-cart-${product.id}`}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            {product.stockStatus === "sold" ? "Sold Out" : 
             product.stockQuantity === 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
