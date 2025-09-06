import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { FloatingCart } from "@/components/floating-cart";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useEffect } from "react";
import Home from "@/pages/home";
import Catalog from "@/pages/catalog";
import ProductDetail from "@/pages/product-detail";
import Cart from "@/pages/cart";
import Contact from "@/pages/contact";
import OwnerLogin from "@/pages/owner-login";
import OwnerDashboard from "@/pages/owner-dashboard";
import LoanApplication from "@/pages/loan-application";
import BookService from "@/pages/book-service";
import NotFound from "@/pages/not-found";

function Router() {
  // Preload products in background for faster catalog loading
  useQuery({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const response = await fetch("/api/products");
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
    gcTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
  });

  // Preload featured products for home page
  useQuery({
    queryKey: ["/api/products", { featured: "true" }],
    queryFn: async () => {
      const response = await fetch("/api/products?featured=true");
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/catalog" component={Catalog} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/owner/login" component={OwnerLogin} />
      <Route path="/owner" component={OwnerDashboard} />
      <Route path="/contact" component={Contact} />
      <Route path="/loan-application" component={LoanApplication} />
      <Route path="/book-service" component={BookService} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground flex flex-col">
          <Header />
          <main className="flex-1">
            <Router />
          </main>
          <Footer />
          <FloatingCart />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
