import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, updateProductSchema, insertCartItemSchema, insertServiceSchema, insertBookingSchema } from "@shared/schema";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!(req.session as any)?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Session ID helper
  const getSessionId = (req: any) => {
    if (!req.session.cartId) {
      req.session.cartId = randomUUID();
    }
    return req.session.cartId;
  };

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      (req.session as any).userId = user.id;
      res.json({ user: { id: user.id, username: user.username } });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await storage.getUser((req.session as any).userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user: { id: user.id, username: user.username } });
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const { category, search, featured } = req.query;
      
      let products;
      if (featured === "true") {
        products = await storage.getFeaturedProducts();
      } else if (search) {
        products = await storage.searchProducts(search as string);
      } else if (category) {
        products = await storage.getProductsByCategory(category as string);
      } else {
        products = await storage.getAllProducts();
      }

      // Calculate discounted prices
      const productsWithDiscount = products.map(product => ({
        ...product,
        discountedPrice: product.discount && parseFloat(product.discount) > 0
          ? product.discountType === "percentage"
            ? parseFloat(product.price) * (1 - parseFloat(product.discount) / 100)
            : parseFloat(product.price) - parseFloat(product.discount)
          : parseFloat(product.price)
      }));

      res.json(productsWithDiscount);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const productWithDiscount = {
        ...product,
        discountedPrice: product.discount && parseFloat(product.discount) > 0
          ? product.discountType === "percentage"
            ? parseFloat(product.price) * (1 - parseFloat(product.discount) / 100)
            : parseFloat(product.price) - parseFloat(product.discount)
          : parseFloat(product.price)
      };

      res.json(productWithDiscount);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", requireAuth, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data" });
    }
  });

  app.put("/api/products/:id", requireAuth, async (req, res) => {
    try {
      const updates = updateProductSchema.parse(req.body);
      const product = await storage.updateProduct(req.params.id, updates);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid update data" });
    }
  });

  app.delete("/api/products/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteProduct(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Cart routes
  app.get("/api/cart", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      const cartItems = await storage.getCartItems(sessionId);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  // Checkout route - reduces stock when items are purchased
  app.post("/api/checkout", async (req, res) => {
    try {
      const sessionId = req.session.id;
      const cartItems = await storage.getCartItems(sessionId);
      
      // Process each cart item and reduce stock
      for (const cartItem of cartItems) {
        const product = await storage.getProduct(cartItem.productId);
        if (product) {
          const newStockQuantity = Math.max(0, product.stockQuantity - cartItem.quantity);
          const newStockStatus = newStockQuantity === 0 ? "sold" : product.stockStatus;
          
          await storage.updateProduct(cartItem.productId, {
            stockQuantity: newStockQuantity,
            stockStatus: newStockStatus
          });
        }
      }
      
      // Clear the cart after checkout
      await storage.clearCart(sessionId);
      
      res.json({ message: "Checkout completed successfully" });
    } catch (error) {
      console.error("Error during checkout:", error);
      res.status(500).json({ message: "Failed to complete checkout" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      const cartItemData = insertCartItemSchema.parse({
        ...req.body,
        sessionId,
      });
      
      const cartItem = await storage.addToCart(cartItemData);
      res.status(201).json(cartItem);
    } catch (error) {
      res.status(400).json({ message: "Invalid cart item data" });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      const { quantity } = req.body;
      const cartItem = await storage.updateCartItem(req.params.id, quantity);
      
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found or removed" });
      }

      res.json(cartItem);
    } catch (error) {
      res.status(400).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const success = await storage.removeFromCart(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove cart item" });
    }
  });

  app.delete("/api/cart", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      await storage.clearCart(sessionId);
      res.json({ message: "Cart cleared" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Services routes
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getActiveServices();
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.get("/api/services/:id", async (req, res) => {
    try {
      const service = await storage.getService(req.params.id);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      console.error("Error fetching service:", error);
      res.status(500).json({ message: "Failed to fetch service" });
    }
  });

  app.post("/api/services", requireAuth, async (req, res) => {
    try {
      const parsed = insertServiceSchema.parse(req.body);
      const service = await storage.createService(parsed);
      res.status(201).json(service);
    } catch (error: any) {
      console.error("Error creating service:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid service data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create service" });
    }
  });

  // Bookings routes
  app.get("/api/bookings", async (req, res) => {
    try {
      const { date, service_id, start_date, end_date } = req.query;
      
      let bookings;
      if (date && service_id) {
        // Get bookings for specific date and service (for overlap checking)
        bookings = await storage.getBookingsByDateAndService(date as string, service_id as string);
      } else if (date) {
        bookings = await storage.getBookingsByDate(date as string);
      } else if (service_id) {
        bookings = await storage.getBookingsByService(service_id as string);
      } else if (start_date && end_date) {
        bookings = await storage.getBookingsByDateRange(start_date as string, end_date as string);
      } else {
        bookings = await storage.getAllBookings();
      }
      
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get("/api/bookings/:id", requireAuth, async (req, res) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  app.post("/api/bookings", async (req, res) => {
    try {
      const parsed = insertBookingSchema.parse(req.body);
      
      // Check availability
      const isAvailable = await storage.checkTimeSlotAvailability(
        parsed.serviceId,
        parsed.bookingDate,
        parsed.startTime,
        parsed.endTime
      );
      
      if (!isAvailable) {
        return res.status(409).json({ message: "Time slot is not available" });
      }
      
      const booking = await storage.createBooking(parsed);
      res.status(201).json(booking);
    } catch (error: any) {
      console.error("Error creating booking:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.put("/api/bookings/:id", requireAuth, async (req, res) => {
    try {
      const updates = insertBookingSchema.partial().parse(req.body);
      const booking = await storage.updateBooking(req.params.id, updates);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error: any) {
      console.error("Error updating booking:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update booking" });
    }
  });

  // Email route for loan applications
  app.post("/api/send-loan-application", async (req, res) => {
    try {
      const { sendLoanApplicationEmail } = await import('./emailService');
      const result = await sendLoanApplicationEmail(req.body);
      
      if (result.success) {
        res.json({ message: "Loan application sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send loan application", error: result.error });
      }
    } catch (error) {
      console.error("Error processing loan application:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/bookings/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteBooking(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json({ message: "Booking deleted successfully" });
    } catch (error) {
      console.error("Error deleting booking:", error);
      res.status(500).json({ message: "Failed to delete booking" });
    }
  });

  // Time slot availability check
  app.get("/api/bookings/availability/:serviceId", async (req, res) => {
    try {
      const { serviceId } = req.params;
      const { date, startTime, endTime } = req.query;
      
      if (!date || !startTime || !endTime) {
        return res.status(400).json({ message: "Missing required parameters: date, startTime, endTime" });
      }
      
      const isAvailable = await storage.checkTimeSlotAvailability(
        serviceId,
        date as string,
        startTime as string,
        endTime as string
      );
      
      res.json({ available: isAvailable });
    } catch (error) {
      console.error("Error checking availability:", error);
      res.status(500).json({ message: "Failed to check availability" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
