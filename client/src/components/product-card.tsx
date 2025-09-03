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
      return <Badge variant="destructive">Sold</Badge>;
    }
    if (product.discount && parseFloat(product.discount) > 0) {
      return <Badge className="bg-amber-500 text-black">Sale</Badge>;
    }
    if (product.featured) {
      return <Badge variant="default">Featured</Badge>;
    }
    return <Badge className="bg-green-500 text-black">In Stock</Badge>;
  };

  const hasDiscount = product.discount && parseFloat(product.discount) > 0;
  const originalPrice = parseFloat(product.price);
  const discountedPrice = product.discountedPrice || originalPrice;

  return (
    <Link href={`/product/${product.id}`}>
      <Card className="bg-card rounded-lg overflow-hidden card-hover cursor-pointer" data-testid={`card-product-${product.id}`}>
        <div className="relative">
          <img 
            src={product.images[0] || "/placeholder-product.jpg"} 
            alt={product.title}
            className="w-full h-48 object-cover"
            data-testid={`img-product-${product.id}`}
          />
          <div className="absolute top-2 right-2">
            {getStatusBadge()}
          </div>
        </div>
        <CardContent className="p-4">
          <div className="mb-2">
            <h4 className="text-lg font-semibold line-clamp-1" data-testid={`text-title-${product.id}`}>
              {product.title}
            </h4>
          </div>
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2" data-testid={`text-description-${product.id}`}>
            {product.description}
          </p>
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              {hasDiscount ? (
                <>
                  <span className="text-sm text-muted-foreground line-through" data-testid={`text-original-price-${product.id}`}>
                    ${originalPrice.toFixed(2)}
                  </span>
                  <span className="text-xl font-bold text-primary" data-testid={`text-discounted-price-${product.id}`}>
                    ${discountedPrice.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-xl font-bold text-primary" data-testid={`text-price-${product.id}`}>
                  ${originalPrice.toFixed(2)}
                </span>
              )}
              <span className="text-xs text-muted-foreground" data-testid={`text-stock-${product.id}`}>
                {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : "Out of stock"}
              </span>
            </div>
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={isUpdating || product.stockStatus === "sold" || product.stockQuantity === 0}
              data-testid={`button-add-to-cart-${product.id}`}
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Add to Cart
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
