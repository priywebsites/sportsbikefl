import { type User, type InsertUser, type Product, type InsertProduct, type UpdateProduct, type CartItem, type InsertCartItem, type CartItemWithProduct, type Service, type InsertService, type Booking, type InsertBooking, type BookingWithService, users, products, cartItems, services, bookings } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, like, or, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Product methods
  getAllProducts(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: UpdateProduct): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  getFeaturedProducts(): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;

  // Cart methods
  getCartItems(sessionId: string): Promise<CartItemWithProduct[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: string): Promise<boolean>;
  clearCart(sessionId: string): Promise<boolean>;

  // Service methods
  getAllServices(): Promise<Service[]>;
  getActiveServices(): Promise<Service[]>;
  getService(id: string): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: string, updates: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: string): Promise<boolean>;

  // Booking methods
  getAllBookings(): Promise<BookingWithService[]>;
  getBookingsByDate(date: string): Promise<BookingWithService[]>;
  getBookingsByService(serviceId: string): Promise<BookingWithService[]>;
  getBooking(id: string): Promise<BookingWithService | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: string, updates: Partial<InsertBooking>): Promise<Booking | undefined>;
  deleteBooking(id: string): Promise<boolean>;
  getBookingsByDateRange(startDate: string, endDate: string): Promise<BookingWithService[]>;
  checkTimeSlotAvailability(serviceId: string, date: string, startTime: string, endTime: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private products: Map<string, Product>;
  private cartItems: Map<string, CartItem>;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.cartItems = new Map();
    this.seedData();
  }

  private seedData() {
    // Create default owner user
    const ownerId = randomUUID();
    const owner: User = {
      id: ownerId,
      username: "ronnie123",
      password: "ronnie123", // In production, this should be hashed
    };
    this.users.set(ownerId, owner);

    // Seed with sample products
    const sampleProducts: InsertProduct[] = [
      {
        title: "2023 Yamaha R1",
        description: "High-performance superbike with advanced electronics and race-bred technology",
        price: "18999.00",
        discount: "0",
        discountType: "percentage",
        category: "motorcycles",
        stockQuantity: 3,
        stockStatus: "in_stock",
        images: ["https://pixabay.com/get/ged76611e920c5fecaf1e107a852cf2fb3651e3b0d295509899ba850a2f1f9ba587abde8de6b39de889d52eec69f3809039b0a3d6f2647a73990dbc8f97ec54eb_1280.jpg"],
        featured: true,
      },
      {
        title: "2023 Kawasaki Ninja ZX-10R",
        description: "Track-ready superbike with race-derived technology and advanced aerodynamics",
        price: "19999.00",
        discount: "10",
        discountType: "percentage",
        category: "motorcycles",
        stockQuantity: 2,
        stockStatus: "in_stock",
        images: ["https://images.unsplash.com/photo-1542362567-b07e54358753?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
        featured: true,
      },
      {
        title: "2023 Suzuki GSX-R1000R",
        description: "Latest generation superbike with MotoGP technology and premium components",
        price: "16799.00",
        discount: "0",
        discountType: "percentage",
        category: "motorcycles",
        stockQuantity: 1,
        stockStatus: "in_stock",
        images: ["https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
        featured: true,
      },
      {
        title: "Yoshimura Exhaust System",
        description: "Premium titanium exhaust system for increased performance and weight reduction",
        price: "1299.00",
        discount: "15",
        discountType: "percentage",
        category: "oem parts",
        stockQuantity: 5,
        stockStatus: "in_stock",
        images: ["https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"],
        featured: false,
      },
      {
        title: "Performance Brake Pads Set",
        description: "High-performance brake pads for superior stopping power and heat resistance",
        price: "189.99",
        discount: "0",
        discountType: "percentage",
        category: "oem parts",
        stockQuantity: 10,
        stockStatus: "in_stock",
        images: ["https://pixabay.com/get/g478bacc54188a48f3b2ef018a519563ef96af3f09928fafe1930df12242700cb4dee03c1eadd9e0fbc7969e25d08040caa0d252dafb33e0dbb60cb40f32a6f95_1280.jpg"],
        featured: false,
      },
      {
        title: "Racing Helmet - Carbon Fiber",
        description: "Lightweight carbon fiber racing helmet with advanced ventilation system",
        price: "599.00",
        discount: "5",
        discountType: "percentage",
        category: "oem parts",
        stockQuantity: 8,
        stockStatus: "in_stock",
        images: ["https://images.unsplash.com/photo-1542362567-b07e54358753?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"],
        featured: false,
      },
      {
        title: "2021 Kawasaki Versys 650 – Used, 19,720 Miles",
        description: "The 2021 Kawasaki Versys 650 is a versatile middleweight sport-touring motorcycle, available in standard and LT (Luxury Touring) trims. It features a 649cc liquid-cooled parallel-twin engine, 6-speed transmission, adjustable suspension, and a diamond frame design. The LT model includes 28L saddlebags and handguards for added touring convenience. With 19,720 miles, this bike is used but mechanically sound and ready to ride.\n\nKey Specs:\n• Make: Kawasaki\n• Model: Versys 650\n• Year: 2021\n• Mileage: 19,720\n• Condition: Used – no mechanical issues\n• Engine: 649cc, liquid-cooled, parallel-twin, 4-stroke, DOHC\n• Bore x Stroke: 83.0 x 60.0 mm\n• Compression Ratio: 10.8:1\n• Horsepower: 59.6 hp @ 8,070 rpm\n• Torque: 41.55 lb-ft @ 7,210 rpm\n• Fuel System: DFI with dual 38mm Keihin throttle bodies\n• Transmission: 6-speed with positive neutral finder\n• Final Drive: Chain\n\nDeposit Policy:\n• $500 deposit required to hold unit\n• Deposit locks in the motorcycle for up to 30 days\n• Applied toward the final purchase price\n• Ensures exclusive reservation of the bike",
        price: "6500.00",
        discount: "0",
        discountType: "percentage",
        category: "motorcycles",
        stockQuantity: 1,
        stockStatus: "in_stock",
        images: [
          "/images/k1.jpg",
          "/images/k2.jpg",
          "/images/k3.jpg",
          "/images/k4.jpg",
          "/images/k5.jpg",
          "/images/k6.jpg",
          "/images/k7.jpg",
          "/images/k8.jpg"
        ],
        featured: true,
      },
    ];

    sampleProducts.forEach(product => {
      const id = randomUUID();
      const fullProduct: Product = {
        ...product,
        id,
        discount: product.discount ?? "0",
        discountType: product.discountType ?? "percentage",
        stockQuantity: product.stockQuantity ?? 1,
        stockStatus: product.stockStatus ?? "in_stock",
        createdAt: new Date(),
      };
      this.products.set(id, fullProduct);
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.stockStatus !== "sold");
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      p => p.category === category && p.stockStatus !== "sold"
    );
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const product = this.products.get(id);
    return product?.stockStatus !== "sold" ? product : undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const fullProduct: Product = {
      ...product,
      id,
      discount: product.discount ?? "0",
      discountType: product.discountType ?? "percentage",
      stockQuantity: product.stockQuantity ?? 1,
      stockStatus: product.stockStatus ?? "in_stock",
      createdAt: new Date(),
    };
    this.products.set(id, fullProduct);
    return fullProduct;
  }

  async updateProduct(id: string, updates: UpdateProduct): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;

    const updatedProduct: Product = { ...product, ...updates };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      p => p.featured && p.stockStatus !== "sold"
    );
  }

  async searchProducts(query: string): Promise<Product[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.products.values()).filter(
      p => 
        p.stockStatus !== "sold" &&
        (p.title.toLowerCase().includes(lowercaseQuery) ||
         p.description.toLowerCase().includes(lowercaseQuery))
    );
  }

  // Cart methods
  async getCartItems(sessionId: string): Promise<CartItemWithProduct[]> {
    const items = Array.from(this.cartItems.values()).filter(
      item => item.sessionId === sessionId
    );
    
    const itemsWithProducts: CartItemWithProduct[] = [];
    for (const item of items) {
      const product = this.products.get(item.productId);
      if (product && product.stockStatus !== "sold") {
        itemsWithProducts.push({ ...item, product });
      }
    }
    
    return itemsWithProducts;
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItem = Array.from(this.cartItems.values()).find(
      item => item.sessionId === cartItem.sessionId && item.productId === cartItem.productId
    );

    if (existingItem) {
      // Update quantity
      existingItem.quantity += (cartItem.quantity ?? 1);
      this.cartItems.set(existingItem.id, existingItem);
      return existingItem;
    } else {
      // Create new item
      const id = randomUUID();
      const fullCartItem: CartItem = {
        ...cartItem,
        id,
        quantity: cartItem.quantity ?? 1,
        createdAt: new Date(),
      };
      this.cartItems.set(id, fullCartItem);
      return fullCartItem;
    }
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem | undefined> {
    const item = this.cartItems.get(id);
    if (!item) return undefined;

    if (quantity <= 0) {
      this.cartItems.delete(id);
      return undefined;
    }

    item.quantity = quantity;
    this.cartItems.set(id, item);
    return item;
  }

  async removeFromCart(id: string): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(sessionId: string): Promise<boolean> {
    const itemsToRemove = Array.from(this.cartItems.entries()).filter(
      ([_, item]) => item.sessionId === sessionId
    );
    
    itemsToRemove.forEach(([id]) => this.cartItems.delete(id));
    return true;
  }
}

// Simple in-memory cache
class SimpleCache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private ttl = 30000; // 30 seconds

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  set(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }
}

export class DatabaseStorage implements IStorage {
  private cache = new SimpleCache();
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Product methods
  async getAllProducts(): Promise<Product[]> {
    const cacheKey = 'all_products';
    const cached = this.cache.get<Product[]>(cacheKey);
    if (cached) return cached;
    
    const result = await db.select().from(products).orderBy(desc(products.createdAt)).limit(100);
    this.cache.set(cacheKey, result);
    return result;
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.category, category)).orderBy(desc(products.createdAt)).limit(50);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db
      .insert(products)
      .values(product)
      .returning();
    this.cache.clear(); // Clear cache when products change
    return newProduct;
  }

  async updateProduct(id: string, updates: UpdateProduct): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();
    this.cache.clear(); // Clear cache when products change
    return updatedProduct || undefined;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    this.cache.clear(); // Clear cache when products change
    return result.rowCount !== undefined && result.rowCount > 0;
  }

  async getFeaturedProducts(): Promise<Product[]> {
    const cacheKey = 'featured_products';
    const cached = this.cache.get<Product[]>(cacheKey);
    if (cached) return cached;
    
    const result = await db.select().from(products).where(eq(products.featured, true)).orderBy(desc(products.createdAt)).limit(20);
    this.cache.set(cacheKey, result);
    return result;
  }

  async searchProducts(query: string): Promise<Product[]> {
    const cacheKey = `search_${query.toLowerCase().trim()}`;
    const cached = this.cache.get<Product[]>(cacheKey);
    if (cached) return cached;

    // Handle multiple keywords by splitting the query
    const keywords = query.toLowerCase().trim().split(/\s+/).filter(word => word.length > 0);
    
    if (keywords.length === 0) {
      return [];
    }

    // Build conditions for each keyword - each keyword must appear somewhere in title or description
    const conditions = keywords.map(keyword => 
      or(
        like(sql`LOWER(${products.title})`, `%${keyword}%`),
        like(sql`LOWER(${products.description})`, `%${keyword}%`)
      )
    );

    // All keywords must match (AND logic)
    const result = await db
      .select()
      .from(products)
      .where(and(...conditions))
      .orderBy(
        // Prioritize title matches over description matches
        desc(sql`CASE WHEN LOWER(${products.title}) LIKE '%${keywords[0]}%' THEN 2 ELSE 1 END`),
        desc(products.createdAt)
      )
      .limit(50);
    
    this.cache.set(cacheKey, result);
    return result;
  }

  // Cart methods
  async getCartItems(sessionId: string): Promise<CartItemWithProduct[]> {
    const items = await db
      .select({
        id: cartItems.id,
        sessionId: cartItems.sessionId,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        createdAt: cartItems.createdAt,
        product: products
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.sessionId, sessionId));
    
    return items.map(item => ({
      ...item,
      product: item.product
    }));
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    const [newCartItem] = await db
      .insert(cartItems)
      .values(cartItem)
      .returning();
    return newCartItem;
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem | undefined> {
    const [updatedCartItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedCartItem || undefined;
  }

  async removeFromCart(id: string): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.id, id));
    return result.rowCount !== undefined && result.rowCount > 0;
  }

  async clearCart(sessionId: string): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
    return result.rowCount !== undefined && result.rowCount >= 0;
  }

  // Service methods
  async getAllServices(): Promise<Service[]> {
    return await db.select().from(services).orderBy(services.name);
  }

  async getActiveServices(): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.isActive, true)).orderBy(services.name);
  }

  async getService(id: string): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service || undefined;
  }

  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db.insert(services).values(service).returning();
    return newService;
  }

  async updateService(id: string, updates: Partial<InsertService>): Promise<Service | undefined> {
    const [updatedService] = await db.update(services).set(updates).where(eq(services.id, id)).returning();
    return updatedService || undefined;
  }

  async deleteService(id: string): Promise<boolean> {
    const result = await db.delete(services).where(eq(services.id, id));
    return result.rowCount !== undefined && result.rowCount > 0;
  }

  // Booking methods
  async getAllBookings(): Promise<BookingWithService[]> {
    const items = await db
      .select({
        id: bookings.id,
        serviceId: bookings.serviceId,
        customerName: bookings.customerName,
        customerEmail: bookings.customerEmail,
        customerPhone: bookings.customerPhone,
        bookingDate: bookings.bookingDate,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        status: bookings.status,
        notes: bookings.notes,
        createdAt: bookings.createdAt,
        service: services
      })
      .from(bookings)
      .innerJoin(services, eq(bookings.serviceId, services.id))
      .orderBy(desc(bookings.bookingDate), bookings.startTime);
    
    return items.map(item => ({
      ...item,
      service: item.service
    }));
  }

  async getBookingsByDate(date: string): Promise<BookingWithService[]> {
    const items = await db
      .select({
        id: bookings.id,
        serviceId: bookings.serviceId,
        customerName: bookings.customerName,
        customerEmail: bookings.customerEmail,
        customerPhone: bookings.customerPhone,
        bookingDate: bookings.bookingDate,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        status: bookings.status,
        notes: bookings.notes,
        createdAt: bookings.createdAt,
        service: services
      })
      .from(bookings)
      .innerJoin(services, eq(bookings.serviceId, services.id))
      .where(eq(bookings.bookingDate, date))
      .orderBy(bookings.startTime);
    
    return items.map(item => ({
      ...item,
      service: item.service
    }));
  }

  async getBookingsByService(serviceId: string): Promise<BookingWithService[]> {
    const items = await db
      .select({
        id: bookings.id,
        serviceId: bookings.serviceId,
        customerName: bookings.customerName,
        customerEmail: bookings.customerEmail,
        customerPhone: bookings.customerPhone,
        bookingDate: bookings.bookingDate,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        status: bookings.status,
        notes: bookings.notes,
        createdAt: bookings.createdAt,
        service: services
      })
      .from(bookings)
      .innerJoin(services, eq(bookings.serviceId, services.id))
      .where(eq(bookings.serviceId, serviceId))
      .orderBy(desc(bookings.bookingDate), bookings.startTime);
    
    return items.map(item => ({
      ...item,
      service: item.service
    }));
  }

  async getBooking(id: string): Promise<BookingWithService | undefined> {
    const items = await db
      .select({
        id: bookings.id,
        serviceId: bookings.serviceId,
        customerName: bookings.customerName,
        customerEmail: bookings.customerEmail,
        customerPhone: bookings.customerPhone,
        bookingDate: bookings.bookingDate,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        status: bookings.status,
        notes: bookings.notes,
        createdAt: bookings.createdAt,
        service: services
      })
      .from(bookings)
      .innerJoin(services, eq(bookings.serviceId, services.id))
      .where(eq(bookings.id, id));
    
    if (items.length === 0) return undefined;
    
    const item = items[0];
    return {
      ...item,
      service: item.service
    };
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async updateBooking(id: string, updates: Partial<InsertBooking>): Promise<Booking | undefined> {
    const [updatedBooking] = await db.update(bookings).set(updates).where(eq(bookings.id, id)).returning();
    return updatedBooking || undefined;
  }

  async deleteBooking(id: string): Promise<boolean> {
    const result = await db.delete(bookings).where(eq(bookings.id, id));
    return result.rowCount !== undefined && result.rowCount > 0;
  }

  async getBookingsByDateRange(startDate: string, endDate: string): Promise<BookingWithService[]> {
    const items = await db
      .select({
        id: bookings.id,
        serviceId: bookings.serviceId,
        customerName: bookings.customerName,
        customerEmail: bookings.customerEmail,
        customerPhone: bookings.customerPhone,
        bookingDate: bookings.bookingDate,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        status: bookings.status,
        notes: bookings.notes,
        createdAt: bookings.createdAt,
        service: services
      })
      .from(bookings)
      .innerJoin(services, eq(bookings.serviceId, services.id))
      .where(and(
        sql`${bookings.bookingDate} >= ${startDate}`,
        sql`${bookings.bookingDate} <= ${endDate}`
      ))
      .orderBy(bookings.bookingDate, bookings.startTime);
    
    return items.map(item => ({
      ...item,
      service: item.service
    }));
  }

  async checkTimeSlotAvailability(serviceId: string, date: string, startTime: string, endTime: string): Promise<boolean> {
    const conflictingBookings = await db
      .select()
      .from(bookings)
      .where(and(
        eq(bookings.serviceId, serviceId),
        eq(bookings.bookingDate, date),
        eq(bookings.status, "confirmed"),
        or(
          and(
            sql`${bookings.startTime} <= ${startTime}`,
            sql`${bookings.endTime} > ${startTime}`
          ),
          and(
            sql`${bookings.startTime} < ${endTime}`,
            sql`${bookings.endTime} >= ${endTime}`
          ),
          and(
            sql`${bookings.startTime} >= ${startTime}`,
            sql`${bookings.endTime} <= ${endTime}`
          )
        )
      ));
    
    return conflictingBookings.length === 0;
  }
}

export const storage = new DatabaseStorage();
