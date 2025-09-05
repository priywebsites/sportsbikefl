import { useState, useEffect } from "react";
import { ShoppingCart, Minus, Plus, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import type { CartItem, Product } from "@shared/schema";

interface CartItemWithProduct extends CartItem {
  product: Product;
}

export function FloatingCart() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const queryClient = useQueryClient();

  const { data: cartItems = [] } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      return apiRequest(`/api/cart/${id}`, "PATCH", { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/cart/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (parseFloat(item.product.price) * item.quantity), 0);

  // Show animation when items are added
  useEffect(() => {
    if (totalItems > 0) {
      setShowAnimation(true);
      const timer = setTimeout(() => setShowAnimation(false), 300);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  if (totalItems === 0) {
    return null;
  }

  return (
    <>
      {/* Floating Cart Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            relative bg-red-600 hover:bg-red-700 text-white rounded-full w-14 h-14 p-0 shadow-lg
            ${showAnimation ? 'animate-bounce' : ''}
          `}
          data-testid="button-floating-cart"
        >
          <ShoppingCart className="w-6 h-6" />
          {totalItems > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 bg-white text-red-600 text-xs font-bold min-w-[1.5rem] h-6 rounded-full"
              data-testid="badge-cart-count"
            >
              {totalItems}
            </Badge>
          )}
        </Button>
      </div>

      {/* Cart Dropdown */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]">
          <Card className="bg-white border border-gray-200 shadow-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-gray-900">Shopping Cart</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0"
                  data-testid="button-close-cart"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              {cartItems.length === 0 ? (
                <p className="text-gray-500 text-center py-4" data-testid="text-empty-cart">
                  Your cart is empty
                </p>
              ) : (
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg" data-testid={`item-cart-${item.id}`}>
                      {item.product.images && item.product.images.length > 0 && (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.title}
                          className="w-12 h-12 object-cover rounded"
                          data-testid={`img-product-${item.product.id}`}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm truncate" data-testid={`text-product-title-${item.product.id}`}>
                          {item.product.title}
                        </h4>
                        <p className="text-red-600 font-semibold text-sm" data-testid={`text-product-price-${item.product.id}`}>
                          ${parseFloat(item.product.price).toFixed(2)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantityMutation.mutate({ 
                              id: item.id, 
                              quantity: Math.max(0, item.quantity - 1) 
                            })}
                            className="h-7 w-7 p-0"
                            disabled={updateQuantityMutation.isPending}
                            data-testid={`button-decrease-${item.id}`}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center" data-testid={`text-quantity-${item.id}`}>
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantityMutation.mutate({ 
                              id: item.id, 
                              quantity: item.quantity + 1 
                            })}
                            className="h-7 w-7 p-0"
                            disabled={updateQuantityMutation.isPending}
                            data-testid={`button-increase-${item.id}`}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCartMutation.mutate(item.id)}
                            className="h-7 w-7 p-0 ml-2 text-red-600 hover:text-red-700"
                            disabled={removeFromCartMutation.isPending}
                            data-testid={`button-remove-${item.id}`}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Total:</span>
                      <span className="font-bold text-lg text-red-600" data-testid="text-cart-total">
                        ${totalPrice.toFixed(2)}
                      </span>
                    </div>
                    <Button 
                      className="w-full mt-3 bg-red-600 hover:bg-red-700 text-white"
                      data-testid="button-checkout"
                    >
                      Proceed to Checkout
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20"
          onClick={() => setIsOpen(false)}
          data-testid="backdrop-cart"
        />
      )}
    </>
  );
}