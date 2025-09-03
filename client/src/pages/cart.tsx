import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

export default function Cart() {
  const { items, total, itemCount, updateQuantity, removeFromCart, clearCart, isUpdating } = useCart();
  const { toast } = useToast();

  const handleUpdateQuantity = async (id: string, quantity: number) => {
    try {
      await updateQuantity({ id, quantity });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update quantity. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveItem = async (id: string) => {
    try {
      await removeFromCart(id);
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <Link href="/catalog">
            <Button variant="ghost" className="mb-8" data-testid="button-back">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
          </Link>

          <div className="text-center py-16" data-testid="empty-cart">
            <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link href="/catalog">
              <Button size="lg" data-testid="button-start-shopping">
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <Link href="/catalog">
          <Button variant="ghost" className="mb-8" data-testid="button-continue-shopping">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span data-testid="text-cart-heading">Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearCart}
                    disabled={isUpdating}
                    data-testid="button-clear-cart"
                  >
                    Clear Cart
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => {
                  const hasDiscount = item.product.discount && parseFloat(item.product.discount) > 0;
                  const itemPrice = hasDiscount 
                    ? item.product.discountedPrice || parseFloat(item.product.price)
                    : parseFloat(item.product.price);

                  return (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border border-border rounded-lg" data-testid={`cart-item-${item.id}`}>
                      <Link href={`/product/${item.product.id}`}>
                        <img
                          src={item.product.images[0] || "/placeholder-product.jpg"}
                          alt={item.product.title}
                          className="w-20 h-20 rounded object-cover cursor-pointer hover:opacity-80 transition-opacity"
                          data-testid={`img-cart-item-${item.id}`}
                        />
                      </Link>
                      
                      <div className="flex-1">
                        <Link href={`/product/${item.product.id}`}>
                          <h4 className="font-semibold hover:text-primary transition-colors cursor-pointer" data-testid={`text-cart-item-title-${item.id}`}>
                            {item.product.title}
                          </h4>
                        </Link>
                        <p className="text-sm text-muted-foreground" data-testid={`text-cart-item-category-${item.id}`}>
                          {item.product.category.charAt(0).toUpperCase() + item.product.category.slice(1)}
                        </p>
                        <div className="mt-2">
                          {hasDiscount ? (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-muted-foreground line-through" data-testid={`text-cart-item-original-price-${item.id}`}>
                                ${parseFloat(item.product.price).toFixed(2)}
                              </span>
                              <span className="font-bold text-primary" data-testid={`text-cart-item-discounted-price-${item.id}`}>
                                ${itemPrice.toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            <span className="font-bold text-primary" data-testid={`text-cart-item-price-${item.id}`}>
                              ${itemPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={isUpdating || item.quantity <= 1}
                          data-testid={`button-decrease-quantity-${item.id}`}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center" data-testid={`text-quantity-${item.id}`}>
                          {item.quantity}
                        </span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={isUpdating}
                          data-testid={`button-increase-quantity-${item.id}`}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <div className="font-bold" data-testid={`text-item-total-${item.id}`}>
                          ${(itemPrice * item.quantity).toFixed(2)}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive/80 mt-2"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={isUpdating}
                          data-testid={`button-remove-item-${item.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle data-testid="text-order-summary">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span data-testid="text-subtotal">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span data-testid="text-shipping">$25.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span data-testid="text-tax">${(total * 0.08).toFixed(2)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary" data-testid="text-total">
                    ${(total + 25 + (total * 0.08)).toFixed(2)}
                  </span>
                </div>

                <Button className="w-full" size="lg" data-testid="button-checkout">
                  Proceed to Checkout
                </Button>

                <div className="text-xs text-muted-foreground text-center">
                  Secure checkout with SSL encryption
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
