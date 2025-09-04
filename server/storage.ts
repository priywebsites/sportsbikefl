import { type User, type InsertUser, type Product, type InsertProduct, type UpdateProduct, type CartItem, type InsertCartItem, type CartItemWithProduct } from "@shared/schema";
import { randomUUID } from "crypto";

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
        category: "parts",
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
        category: "parts",
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
        category: "accessories",
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
          "@assets/k1.jpg",
          "@assets/k2.jpg",
          "@assets/k3.jpg",
          "@assets/k4.jpg",
          "@assets/k5.jpg",
          "@assets/k6.jpg",
          "@assets/k7.jpg",
          "@assets/k8.jpg"
        ],
        featured: true,
      },
    ];

    sampleProducts.forEach(product => {
      const id = randomUUID();
      const fullProduct: Product = {
        ...product,
        id,
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
      existingItem.quantity += cartItem.quantity;
      this.cartItems.set(existingItem.id, existingItem);
      return existingItem;
    } else {
      // Create new item
      const id = randomUUID();
      const fullCartItem: CartItem = {
        ...cartItem,
        id,
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

export const storage = new MemStorage();
