import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { Minus, Plus, Trash2 } from "lucide-react";

interface CartSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartSidebar({ open, onOpenChange }: CartSidebarProps) {
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-96 flex flex-col" data-testid="cart-sidebar">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            Shopping Cart
            {itemCount > 0 && (
              <Badge variant="secondary" data-testid="text-cart-count">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {items.length === 0 ? (
            <div className="text-center text-muted-foreground py-8" data-testid="text-empty-cart">
              Your cart is empty
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const hasDiscount = item.product.discount && parseFloat(item.product.discount) > 0;
                const itemPrice = hasDiscount 
                  ? item.product.discountedPrice || parseFloat(item.product.price)
                  : parseFloat(item.product.price);

                return (
                  <div key={item.id} className="flex items-center space-x-4 p-4 bg-muted rounded-lg" data-testid={`cart-item-${item.id}`}>
                    <img
                      src={item.product.images[0] || "/placeholder-product.jpg"}
                      alt={item.product.title}
                      className="w-16 h-16 rounded object-cover"
                      data-testid={`img-cart-item-${item.id}`}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium line-clamp-1" data-testid={`text-cart-item-title-${item.id}`}>
                        {item.product.title}
                      </h4>
                      <p className="text-sm text-muted-foreground" data-testid={`text-cart-item-price-${item.id}`}>
                        ${itemPrice.toFixed(2)}
                      </p>
                      <div className="flex items-center mt-2 space-x-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-6 w-6"
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
                          className="h-6 w-6"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={isUpdating}
                          data-testid={`button-increase-quantity-${item.id}`}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive/80"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={isUpdating}
                      data-testid={`button-remove-item-${item.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border pt-4 space-y-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total:</span>
              <span className="text-primary" data-testid="text-cart-total">
                ${total.toFixed(2)}
              </span>
            </div>
            <div className="space-y-2">
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => onOpenChange(false)}
                data-testid="button-checkout"
              >
                Proceed to Checkout
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleClearCart}
                disabled={isUpdating}
                data-testid="button-clear-cart"
              >
                Clear Cart
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
