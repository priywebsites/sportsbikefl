import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProductCard } from "@/components/product-card";
import { ProductWithDiscount, ProductFilters, SortOption } from "@/lib/types";
import { Search, Grid, List, Filter } from "lucide-react";

export default function Catalog() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<ProductFilters>({});
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Parse URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const category = urlParams.get('category');
    if (category) {
      setFilters(prev => ({ ...prev, category }));
    }
  }, [location]);

  const { data: products = [], isLoading } = useQuery<ProductWithDiscount[]>({
    queryKey: ["/api/products", filters, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.category) params.set('category', filters.category);
      if (searchQuery) params.set('search', searchQuery);
      
      const response = await fetch(`/api/products?${params.toString()}`);
      return response.json();
    },
  });

  // Filter and sort products
  const filteredAndSortedProducts = products
    .filter(product => {
      if (filters.inStock && product.stockQuantity === 0) return false;
      if (filters.onSale && (!product.discount || parseFloat(product.discount) === 0)) return false;
      if (filters.minPrice && parseFloat(product.price) < filters.minPrice) return false;
      if (filters.maxPrice && parseFloat(product.price) > filters.maxPrice) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return parseFloat(a.price) - parseFloat(b.price);
        case "price-high":
          return parseFloat(b.price) - parseFloat(a.price);
        case "name":
          return a.title.localeCompare(b.title);
        case "newest":
        default:
          return new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime();
      }
    });

  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getCategoryTitle = () => {
    if (filters.category) {
      return filters.category.charAt(0).toUpperCase() + filters.category.slice(1);
    }
    return "All Products";
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <Card className="bg-card">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center" data-testid="text-filters-heading">
                  <Filter className="mr-2 h-5 w-5" />
                  Filters
                </h3>
                
                <div className="space-y-6">
                  {/* Search */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        data-testid="input-search"
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <Checkbox
                          checked={filters.category === "motorcycles"}
                          onCheckedChange={(checked) => 
                            handleFilterChange("category", checked ? "motorcycles" : undefined)
                          }
                          data-testid="checkbox-motorcycles"
                        />
                        <span className="ml-2">Motorcycles</span>
                      </label>
                      <label className="flex items-center">
                        <Checkbox
                          checked={filters.category === "parts"}
                          onCheckedChange={(checked) => 
                            handleFilterChange("category", checked ? "parts" : undefined)
                          }
                          data-testid="checkbox-parts"
                        />
                        <span className="ml-2">Parts</span>
                      </label>
                      <label className="flex items-center">
                        <Checkbox
                          checked={filters.category === "accessories"}
                          onCheckedChange={(checked) => 
                            handleFilterChange("category", checked ? "accessories" : undefined)
                          }
                          data-testid="checkbox-accessories"
                        />
                        <span className="ml-2">Accessories</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Availability */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Availability</label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <Checkbox
                          checked={filters.inStock}
                          onCheckedChange={(checked) => handleFilterChange("inStock", checked)}
                          data-testid="checkbox-in-stock"
                        />
                        <span className="ml-2">In Stock</span>
                      </label>
                      <label className="flex items-center">
                        <Checkbox
                          checked={filters.onSale}
                          onCheckedChange={(checked) => handleFilterChange("onSale", checked)}
                          data-testid="checkbox-on-sale"
                        />
                        <span className="ml-2">On Sale</span>
                      </label>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      setFilters({});
                      setSearchQuery("");
                    }}
                    variant="outline"
                    data-testid="button-clear-filters"
                  >
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Products Grid */}
          <div className="lg:w-3/4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold" data-testid="text-category-title">
                {getCategoryTitle()}
              </h2>
              <div className="flex items-center space-x-4">
                <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                  <SelectTrigger className="w-48" data-testid="select-sort">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Sort by: Newest</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="name">Name: A to Z</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex space-x-2">
                  <Button
                    size="icon"
                    variant={viewMode === "grid" ? "default" : "outline"}
                    onClick={() => setViewMode("grid")}
                    data-testid="button-grid-view"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant={viewMode === "list" ? "default" : "outline"}
                    onClick={() => setViewMode("list")}
                    data-testid="button-list-view"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-card rounded-lg h-80 animate-pulse" data-testid={`skeleton-product-${i}`} />
                ))}
              </div>
            ) : filteredAndSortedProducts.length === 0 ? (
              <div className="text-center py-12" data-testid="text-no-products">
                <p className="text-muted-foreground text-lg">No products found matching your criteria.</p>
              </div>
            ) : (
              <div className={viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "space-y-4"
              }>
                {filteredAndSortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
