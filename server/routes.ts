import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, updateProductSchema, insertCartItemSchema, insertServiceSchema, insertBookingSchema, insertSaleSchema } from "@shared/schema";
import { randomUUID } from "crypto";
import Stripe from "stripe";
import twilio from "twilio";

// Lazy initialize Stripe to avoid startup failures
let stripe: Stripe | null = null;
const getStripe = () => {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe not configured: STRIPE_SECRET_KEY missing');
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20" as any, // Use valid API version with type assertion
    });
  }
  return stripe;
};

// Lazy initialize Twilio to avoid startup failures
let twilioClient: any = null;
const getTwilio = () => {
  if (!twilioClient) {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      throw new Error('Twilio not configured: TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN missing');
    }
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
  return twilioClient;
};

// SMS helper functions
const sendSMS = async (to: string, body: string) => {
  try {
    const client = getTwilio();
    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });
    console.log(`SMS sent successfully to ${to}: ${message.sid}`);
    return { success: true, messageId: message.sid };
  } catch (error) {
    console.error(`Failed to send SMS to ${to}:`, error);
    return { success: false, error };
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check route at /health to not interfere with frontend
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", message: "Server is running" });
  });

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
    if (!(req.session as any)?.userId) {
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

      // Send SMS notifications for service bookings
      try {
        const service = await storage.getService(booking.serviceId);
        if (service) {
          const ownerPhone = "+14319973415"; // Shop owner's phone number
          const customerPhone = booking.customerPhone;

          // Format the booking time for SMS
          const bookingDate = new Date(`${booking.bookingDate} ${booking.startTime}`);
          const timeFormatted = bookingDate.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          });

          // Send notification to shop owner
          const ownerMessage = `New appointment booked with ${service.name} at ${timeFormatted}`;
          await sendSMS(ownerPhone, ownerMessage);

          // Send confirmation to customer
          const customerMessage = `Your appointment for ${service.name} at ${timeFormatted} is confirmed.`;
          await sendSMS(customerPhone, customerMessage);
        }
      } catch (smsError) {
        console.error("SMS notification error:", smsError);
        // Don't fail the booking if SMS fails
      }

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

  // Stripe hosted checkout session
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      // Check if Stripe is configured
      try {
        getStripe();
      } catch (error: any) {
        return res.status(503).json({ message: "Payment service unavailable", error: error.message });
      }
      const { productId, isDeposit = false } = req.body;
      
      if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
      }

      // Get product details server-side for security
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Calculate amount server-side based on product and deposit preference
      let amount: number;
      let productTitle = product.title;
      let description: string;
      
      // Apply discount if exists
      let productPrice = parseFloat(product.price);
      if (product.discount && parseFloat(product.discount) > 0) {
        if (product.discountType === "percentage") {
          productPrice = productPrice * (1 - parseFloat(product.discount) / 100);
        } else {
          productPrice = productPrice - parseFloat(product.discount);
        }
      }

      if (isDeposit && product.category === "motorcycles") {
        // For motorcycles, allow $500 deposit
        amount = 500;
        description = `$500 deposit payment for ${productTitle}. Remaining balance ($${(productPrice - 500).toFixed(2)}) due upon pickup/delivery.`;
        productTitle = `Deposit for ${productTitle}`;
      } else {
        // Full payment for all other items or full motorcycle payment
        amount = productPrice;
        description = `Full payment for ${productTitle}`;
      }

      const stripeClient = getStripe();
      const session = await stripeClient.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: productTitle,
                description: description,
              },
              unit_amount: Math.round(amount * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${req.headers.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/catalog`,
        metadata: {
          productId: productId,
          productTitle: product.title,
          isDeposit: isDeposit ? 'true' : 'false',
          originalPrice: productPrice.toString(),
        },
      });

      res.json({ 
        checkoutUrl: session.url,
        sessionId: session.id 
      });
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ 
        message: "Error creating checkout session", 
        error: error.message 
      });
    }
  });

  // Create checkout session for cart items
  app.post("/api/create-cart-checkout-session", async (req, res) => {
    try {
      // Check if Stripe is configured
      try {
        getStripe();
      } catch (error: any) {
        return res.status(503).json({ message: "Payment service unavailable", error: error.message });
      }
      const { cartItems } = req.body;
      
      if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      // Create line items for Stripe
      const lineItems = [];
      let totalAmount = 0;

      for (const cartItem of cartItems) {
        const product = await storage.getProduct(cartItem.productId);
        if (!product) continue;

        let productPrice = parseFloat(product.price);
        
        // Apply discount if exists
        if (product.discount && parseFloat(product.discount) > 0) {
          if (product.discountType === "percentage") {
            productPrice = productPrice * (1 - parseFloat(product.discount) / 100);
          } else {
            productPrice = productPrice - parseFloat(product.discount);
          }
        }

        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.title,
              description: product.description,
            },
            unit_amount: Math.round(productPrice * 100), // Convert to cents
          },
          quantity: cartItem.quantity,
        });

        totalAmount += productPrice * cartItem.quantity;
      }

      const stripeClient = getStripe();
      const session = await stripeClient.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${req.headers.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/cart`,
        metadata: {
          cartCheckout: 'true',
          totalAmount: totalAmount.toString(),
          cartSessionId: getSessionId(req),
          cartItemsData: JSON.stringify(cartItems.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity
          }))),
        },
      });

      res.json({ 
        checkoutUrl: session.url,
        sessionId: session.id 
      });
    } catch (error: any) {
      console.error("Error creating cart checkout session:", error);
      res.status(500).json({ 
        message: "Error creating cart checkout session", 
        error: error.message 
      });
    }
  });

  // Process sale webhook from Stripe (when payment succeeds)
  app.post("/api/stripe-webhook", async (req, res) => {
    try {
      const session = req.body;
      
      if (session.payment_status === 'paid') {
        const { productId, isDeposit, cartCheckout, cartSessionId, cartItemsData } = session.metadata || {};
        
        if (cartCheckout === 'true' && cartItemsData) {
          // Cart purchase - process all items
          try {
            const cartItems = JSON.parse(cartItemsData);
            const totalAmount = session.amount_total / 100; // Convert from cents
            
            // Process each cart item
            for (const cartItem of cartItems) {
              await storage.processSaleAndUpdateInventory(
                cartItem.productId, 
                cartItem.quantity, 
                totalAmount / cartItems.length, // Distribute total amount across items
                session.id
              );
            }
            
            // Clear the cart after successful payment
            if (cartSessionId) {
              await storage.clearCart(cartSessionId);
            }
            
            console.log(`Successfully processed cart checkout for session ${session.id}`);
          } catch (error) {
            console.error("Error processing cart items:", error);
          }
        } else if (productId) {
          // Single product purchase
          const amount = session.amount_total / 100; // Convert from cents
          await storage.processSaleAndUpdateInventory(productId, 1, amount, session.id);
          console.log(`Successfully processed single product checkout for session ${session.id}`);
        }
      }
      
      res.status(200).send('OK');
    } catch (error: any) {
      console.error("Error processing Stripe webhook:", error);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  });

  // Get sales data for owner dashboard
  app.get("/api/sales", requireAuth, async (req, res) => {
    try {
      const sales = await storage.getAllSales();
      const totalSales = await storage.getTotalSales();
      
      res.json({
        sales: sales,
        totalSalesCount: totalSales,
        totalRevenue: sales.reduce((sum, sale) => sum + parseFloat(sale.salePrice), 0)
      });
    } catch (error) {
      console.error("Error fetching sales:", error);
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  // Get checkout session details (for success page)
  app.get("/api/checkout-session/:sessionId", async (req, res) => {
    try {
      // Check if Stripe is configured
      try {
        getStripe();
      } catch (error: any) {
        return res.status(503).json({ message: "Payment service unavailable", error: error.message });
      }
      const stripeClient = getStripe();
      const session = await stripeClient.checkout.sessions.retrieve(req.params.sessionId);
      res.json({
        id: session.id,
        amount_total: session.amount_total ? session.amount_total / 100 : 0,
        payment_status: session.payment_status,
        metadata: session.metadata,
      });
    } catch (error: any) {
      console.error("Error retrieving checkout session:", error);
      res.status(500).json({ 
        message: "Error retrieving checkout session", 
        error: error.message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
