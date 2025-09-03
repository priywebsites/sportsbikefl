import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CartItemWithProduct, CartState } from "@/lib/types";

export function useCart() {
  const { data: cartItems = [], isLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
  });

  const cartState: CartState = {
    items: cartItems,
    total: cartItems.reduce((sum, item) => {
      const price = item.product.discount && parseFloat(item.product.discount) > 0
        ? item.product.discountType === "percentage"
          ? parseFloat(item.product.price) * (1 - parseFloat(item.product.discount) / 100)
          : parseFloat(item.product.price) - parseFloat(item.product.discount)
        : parseFloat(item.product.price);
      return sum + (price * item.quantity);
    }, 0),
    itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
  };

  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity = 1 }: { productId: string; quantity?: number }) => {
      const response = await apiRequest("POST", "/api/cart", { productId, quantity });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const response = await apiRequest("PUT", `/api/cart/${id}`, { quantity });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/cart/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/cart");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  return {
    ...cartState,
    isLoading,
    addToCart: addToCartMutation.mutateAsync,
    updateQuantity: updateQuantityMutation.mutateAsync,
    removeFromCart: removeFromCartMutation.mutateAsync,
    clearCart: clearCartMutation.mutateAsync,
    isUpdating: addToCartMutation.isPending || updateQuantityMutation.isPending || removeFromCartMutation.isPending,
  };
}
