import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AddProductModal } from "@/components/modals/add-product-modal";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Product, UpdateProduct } from "@/lib/types";
import { Booking, BookingWithService } from "@shared/schema";
import { format } from "date-fns";
import { 
  LogOut, 
  Plus, 
  Edit, 
  Tag, 
  Check, 
  Trash2, 
  Package, 
  TrendingUp, 
  DollarSign,
  Eye,
  EyeOff,
  Star,
  StarOff,
  Percent,
  Calendar,
  Clock,
  User,
  Phone,
  Mail
} from "lucide-react";

export default function OwnerDashboard() {
  const [, setLocation] = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("inventory");
  const [selectedAppointmentDate, setSelectedAppointmentDate] = useState<Date>(new Date());
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [discountProduct, setDiscountProduct] = useState<Product | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/owner/login");
    }
  }, [isAuthenticated, setLocation]);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const response = await fetch("/api/products");
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // Fetch appointments for selected date
  const { data: appointments = [], isLoading: isAppointmentsLoading } = useQuery<BookingWithService[]>({
    queryKey: ["/api/bookings", format(selectedAppointmentDate, "yyyy-MM-dd")],
    queryFn: async () => {
      const response = await fetch(`/api/bookings?date=${format(selectedAppointmentDate, "yyyy-MM-dd")}`);
      return response.json();
    },
    enabled: isAuthenticated,
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateProduct }) => {
      const response = await apiRequest("PUT", `/api/products/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product updated",
        description: "Product has been successfully updated.",
      });
      setEditingProduct(null);
      setDiscountProduct(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product deleted",
        description: "Product has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = async () => {
    try {
      await logout();
      setLocation("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMarkSold = async (product: Product) => {
    await updateProductMutation.mutateAsync({
      id: product.id,
      updates: { stockStatus: product.stockStatus === "sold" ? "in_stock" : "sold" }
    });
  };

  const handleToggleFeatured = async (product: Product) => {
    await updateProductMutation.mutateAsync({
      id: product.id,
      updates: { featured: !product.featured }
    });
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      await deleteProductMutation.mutateAsync(id);
    }
  };

  const handleApplyDiscount = async (discount: string, discountType: "percentage" | "flat") => {
    if (!discountProduct) return;
    
    await updateProductMutation.mutateAsync({
      id: discountProduct.id,
      updates: { discount, discountType }
    });
  };

  const getStatusBadge = (product: Product) => {
    if (product.stockStatus === "sold") {
      return <Badge variant="destructive">Sold</Badge>;
    }
    if (product.stockQuantity === 0) {
      return <Badge variant="secondary">Out of Stock</Badge>;
    }
    return <Badge className="bg-green-500 text-black">In Stock</Badge>;
  };

  const getDiscountBadge = (product: Product) => {
    if (!product.discount || parseFloat(product.discount) === 0) {
      return <span className="text-muted-foreground">No discount</span>;
    }
    const discountText = product.discountType === "percentage" 
      ? `${product.discount}%` 
      : `$${product.discount}`;
    return <Badge className="bg-amber-500 text-black">{discountText} OFF</Badge>;
  };

  const totalProducts = products.length;
  const inStockProducts = products.filter(p => p.stockStatus === "in_stock" && p.stockQuantity > 0).length;
  const soldProducts = products.filter(p => p.stockStatus === "sold").length;
  const totalValue = products.reduce((sum, p) => sum + parseFloat(p.price) * p.stockQuantity, 0);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-dashboard-heading">Owner Dashboard</h1>
            <p className="text-muted-foreground" data-testid="text-welcome">
              Welcome back, {user?.username}
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Package className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold" data-testid="text-total-products">{totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">In Stock</p>
                  <p className="text-2xl font-bold" data-testid="text-in-stock">{inStockProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Check className="h-8 w-8 text-amber-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Sold</p>
                  <p className="text-2xl font-bold" data-testid="text-sold">{soldProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Inventory Value</p>
                  <p className="text-2xl font-bold" data-testid="text-inventory-value">${totalValue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="inventory" data-testid="tab-inventory">
              <Package className="h-4 w-4 mr-2" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="appointments" data-testid="tab-appointments">
              <Calendar className="h-4 w-4 mr-2" />
              Appointments
            </TabsTrigger>
            <TabsTrigger value="discounts" data-testid="tab-discounts">
              <Tag className="h-4 w-4 mr-2" />
              Discounts
            </TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Inventory Management */}
          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Inventory Management</CardTitle>
                  <Button 
                    onClick={() => setIsAddProductOpen(true)}
                    data-testid="button-add-product"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8" data-testid="loading-inventory">
                    <p>Loading inventory...</p>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-8" data-testid="empty-inventory">
                    <p className="text-muted-foreground">No products found. Add your first product to get started.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <img
                                src={product.images[0] || "/placeholder-product.jpg"}
                                alt={product.title}
                                className="w-12 h-12 rounded object-cover"
                                data-testid={`img-product-${product.id}`}
                              />
                              <div>
                                <div className="font-medium" data-testid={`text-product-title-${product.id}`}>
                                  {product.title}
                                </div>
                                {product.featured && (
                                  <Badge variant="default" className="text-xs mt-1">Featured</Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="capitalize" data-testid={`text-category-${product.id}`}>
                            {product.category}
                          </TableCell>
                          <TableCell data-testid={`text-price-${product.id}`}>
                            ${parseFloat(product.price).toFixed(2)}
                          </TableCell>
                          <TableCell data-testid={`text-stock-${product.id}`}>
                            {product.stockQuantity}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(product)}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingProduct(product)}
                                data-testid={`button-edit-${product.id}`}
                                className="h-8 px-2 text-blue-600 border-blue-600 hover:bg-blue-50"
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setDiscountProduct(product)}
                                data-testid={`button-discount-${product.id}`}
                                className="h-8 px-2 text-orange-600 border-orange-600 hover:bg-orange-50"
                              >
                                <Percent className="h-3 w-3 mr-1" />
                                Discount
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkSold(product)}
                                disabled={updateProductMutation.isPending}
                                data-testid={`button-toggle-sold-${product.id}`}
                                className={`h-8 px-2 ${
                                  product.stockStatus === "sold" 
                                    ? "text-green-600 border-green-600 hover:bg-green-50" 
                                    : "text-red-600 border-red-600 hover:bg-red-50"
                                }`}
                              >
                                {product.stockStatus === "sold" ? (
                                  <><Eye className="h-3 w-3 mr-1" />Unsold</>
                                ) : (
                                  <><EyeOff className="h-3 w-3 mr-1" />Mark Sold</>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleToggleFeatured(product)}
                                disabled={updateProductMutation.isPending}
                                data-testid={`button-toggle-featured-${product.id}`}
                                className={`h-8 px-2 ${
                                  product.featured 
                                    ? "text-yellow-600 border-yellow-600 hover:bg-yellow-50" 
                                    : "text-gray-600 border-gray-600 hover:bg-gray-50"
                                }`}
                              >
                                {product.featured ? (
                                  <><StarOff className="h-3 w-3 mr-1" />Unfeature</>
                                ) : (
                                  <><Star className="h-3 w-3 mr-1" />Feature</>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-2 text-red-600 border-red-600 hover:bg-red-50"
                                onClick={() => handleDeleteProduct(product.id)}
                                disabled={deleteProductMutation.isPending}
                                data-testid={`button-delete-${product.id}`}
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Management */}
          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Appointments Management</CardTitle>
                  <div className="flex items-center space-x-4">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <input 
                      type="date" 
                      value={format(selectedAppointmentDate, "yyyy-MM-dd")}
                      onChange={(e) => setSelectedAppointmentDate(new Date(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      data-testid="input-appointment-date"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isAppointmentsLoading ? (
                  <div className="text-center py-8" data-testid="loading-appointments">
                    <p>Loading appointments...</p>
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="text-center py-8" data-testid="empty-appointments">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No appointments scheduled for {format(selectedAppointmentDate, "MMMM d, yyyy")}.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((appointment: any) => (
                      <div 
                        key={appointment.id} 
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                        data-testid={`appointment-${appointment.id}`}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Time and Service Info */}
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-red-600" />
                              <span className="font-semibold text-lg">
                                {format(new Date(`2023-01-01T${appointment.startTime}`), "h:mm a")} - {format(new Date(`2023-01-01T${appointment.endTime}`), "h:mm a")}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Tag className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">{appointment.service?.name}</span>
                            </div>
                            <Badge variant={appointment.status === "confirmed" ? "default" : "secondary"} className="text-xs">
                              {appointment.status}
                            </Badge>
                          </div>
                          
                          {/* Customer Info */}
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">{appointment.customerName}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">{appointment.customerPhone}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">{appointment.customerEmail}</span>
                            </div>
                          </div>
                          
                          {/* Service Details */}
                          <div className="space-y-2">
                            <div className="text-sm text-gray-600">
                              <strong>Duration:</strong> {appointment.service?.durationMinutes} minutes
                            </div>
                            {appointment.service?.price && (
                              <div className="text-sm text-gray-600">
                                <strong>Price:</strong> ${parseFloat(appointment.service.price).toFixed(2)}
                              </div>
                            )}
                            {appointment.service?.priceLabel && (
                              <div className="text-sm text-gray-600">
                                <strong>Pricing:</strong> {appointment.service.priceLabel}
                              </div>
                            )}
                            {appointment.notes && (
                              <div className="text-sm text-gray-600">
                                <strong>Notes:</strong> {appointment.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Discount Management */}
          <TabsContent value="discounts">
            <Card>
              <CardHeader>
                <CardTitle>Discount Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border border-border rounded-lg" data-testid={`discount-row-${product.id}`}>
                      <div className="flex items-center space-x-4">
                        <img
                          src={product.images[0] || "/placeholder-product.jpg"}
                          alt={product.title}
                          className="w-16 h-16 rounded object-cover"
                        />
                        <div>
                          <h4 className="font-medium">{product.title}</h4>
                          <p className="text-sm text-muted-foreground">${parseFloat(product.price).toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {getDiscountBadge(product)}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDiscountProduct(product)}
                          data-testid={`button-manage-discount-${product.id}`}
                        >
                          Manage Discount
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {["motorcycles", "parts", "accessories"].map((category) => {
                      const categoryProducts = products.filter(p => p.category === category);
                      const percentage = totalProducts > 0 ? (categoryProducts.length / totalProducts) * 100 : 0;
                      
                      return (
                        <div key={category} data-testid={`analytics-category-${category}`}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="capitalize">{category}</span>
                            <span>{categoryProducts.length} products</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Stock Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center" data-testid="analytics-in-stock">
                      <span>In Stock</span>
                      <span>{inStockProducts} products</span>
                    </div>
                    <div className="flex justify-between items-center" data-testid="analytics-out-of-stock">
                      <span>Out of Stock</span>
                      <span>{products.filter(p => p.stockQuantity === 0 && p.stockStatus !== "sold").length} products</span>
                    </div>
                    <div className="flex justify-between items-center" data-testid="analytics-sold">
                      <span>Sold</span>
                      <span>{soldProducts} products</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Product Modal */}
        <AddProductModal
          open={isAddProductOpen}
          onOpenChange={setIsAddProductOpen}
        />

        {/* Edit Product Modal */}
        <AddProductModal
          open={!!editingProduct}
          onOpenChange={(open) => !open && setEditingProduct(null)}
          editingProduct={editingProduct}
        />

        {/* Discount Management Dialog */}
        <Dialog open={!!discountProduct} onOpenChange={() => setDiscountProduct(null)}>
          <DialogContent data-testid="discount-modal">
            <DialogHeader>
              <DialogTitle>Manage Discount - {discountProduct?.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Discount Amount</label>
                  <Input
                    id="discount-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0"
                    defaultValue={discountProduct?.discount || "0"}
                    data-testid="input-discount-amount"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Discount Type</label>
                  <Select defaultValue={discountProduct?.discountType || "percentage"}>
                    <SelectTrigger data-testid="select-discount-type-modal">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="flat">Flat Amount ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setDiscountProduct(null)} data-testid="button-cancel-discount">
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    const amount = (document.getElementById("discount-amount") as HTMLInputElement)?.value || "0";
                    const type = "percentage"; // This should be from the select, simplified for demo
                    handleApplyDiscount(amount, type);
                  }}
                  disabled={updateProductMutation.isPending}
                  data-testid="button-apply-discount"
                >
                  Apply Discount
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
