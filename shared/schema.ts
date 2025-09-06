import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, index, time, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 5, scale: 2 }).default("0"),
  discountType: text("discount_type", { enum: ["percentage", "flat"] }).default("percentage"),
  category: text("category", { enum: ["motorcycles", "oem parts", "used parts", "custom wheels", "tires"] }).notNull(),
  condition: text("condition", { enum: ["new", "used"] }).notNull().default("new"),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  stockStatus: text("stock_status", { enum: ["in_stock", "sold", "out_of_stock"] }).notNull().default("in_stock"),
  images: text("images").array().notNull().default(sql`ARRAY[]::text[]`),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  categoryIdx: index("category_idx").on(table.category),
  conditionIdx: index("condition_idx").on(table.condition),
  featuredIdx: index("featured_idx").on(table.featured),
  stockStatusIdx: index("stock_status_idx").on(table.stockStatus),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
  titleIdx: index("title_idx").on(table.title),
}));

export const cartItems = pgTable("cart_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: text("session_id").notNull(),
  productId: varchar("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  sessionIdx: index("cart_session_idx").on(table.sessionId),
  productIdx: index("cart_product_idx").on(table.productId),
}));

export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }),
  priceLabel: text("price_label"), // For "Call for price" or custom labels
  durationMinutes: integer("duration_minutes").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  nameIdx: index("service_name_idx").on(table.name),
  isActiveIdx: index("service_active_idx").on(table.isActive),
}));

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serviceId: varchar("service_id").notNull().references(() => services.id),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  bookingDate: date("booking_date").notNull(),
  startTime: varchar("start_time").notNull(), // Format: "HH:MM"
  endTime: varchar("end_time").notNull(), // Format: "HH:MM"
  timezone: varchar("timezone").notNull().default("America/New_York"), // Eastern Time
  status: text("status", { enum: ["confirmed", "cancelled", "completed", "no_show"] }).default("confirmed"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  serviceIdx: index("booking_service_idx").on(table.serviceId),
  dateIdx: index("booking_date_idx").on(table.bookingDate),
  statusIdx: index("booking_status_idx").on(table.status),
  emailIdx: index("booking_email_idx").on(table.customerEmail),
  createdAtIdx: index("booking_created_at_idx").on(table.createdAt),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
});

export const updateProductSchema = insertProductSchema.partial();

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type UpdateProduct = z.infer<typeof updateProductSchema>;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

// Additional types for frontend
export type CartItemWithProduct = CartItem & {
  product: Product;
};

export type ProductWithDiscount = Product & {
  discountedPrice?: number;
};

export type BookingWithService = Booking & {
  service: Service;
};
