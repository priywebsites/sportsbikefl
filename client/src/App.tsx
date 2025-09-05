import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { FloatingCart } from "@/components/floating-cart";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Home from "@/pages/home";
import Catalog from "@/pages/catalog";
import ProductDetail from "@/pages/product-detail";
import Cart from "@/pages/cart";
import Contact from "@/pages/contact";
import OwnerLogin from "@/pages/owner-login";
import OwnerDashboard from "@/pages/owner-dashboard";
import LoanApplication from "@/pages/loan-application";
import NotFound from "@/pages/not-found";

function Router() {
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
