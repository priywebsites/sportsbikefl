import { db } from "./db";
import { users, products } from "@shared/schema";
import { type InsertProduct } from "@shared/schema";

async function seedDatabase() {
  console.log("🌱 Seeding database...");

  try {
    // Create default owner user
    await db.insert(users).values({
      username: "ronnie123",
      password: "ronnie123", // In production, this should be hashed
    }).onConflictDoNothing();

    // Seed with sample products
    const sampleProducts: InsertProduct[] = [
      {
        title: "2023 Yamaha R1",
        description: `High-performance superbike with advanced electronics and race-bred technology

KEY SPECIFICATIONS:
• Engine: 998cc inline-4 cylinder
• Power: 200 HP @ 13,500 RPM
• Torque: 113.3 Nm @ 11,500 RPM
• Weight: 199kg (wet)
• Top Speed: 186 mph
• Electronics: IMU, TC, SC, LIF, BCM, EBM, PWR

DEPOSIT POLICY:
• $500 deposit required to hold unit
• Deposit locks in the motorcycle for up to 30 days
• Applied toward the final purchase price
• Ensures exclusive reservation of the bike`,
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
        description: `Track-ready superbike with race-derived technology and advanced aerodynamics

KEY SPECIFICATIONS:
• Engine: 998cc inline-4 cylinder
• Power: 203 HP @ 13,200 RPM
• Torque: 114.9 Nm @ 11,400 RPM
• Weight: 207kg (wet)
• Top Speed: 200 mph
• Electronics: KIBS, KTRC, KLCM, KQS, KEBC

DEPOSIT POLICY:
• $500 deposit required to hold unit
• Deposit locks in the motorcycle for up to 30 days
• Applied toward the final purchase price
• Ensures exclusive reservation of the bike`,
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
        description: `Premium superbike with MotoGP-derived technology and aggressive styling

KEY SPECIFICATIONS:
• Engine: 999.8cc inline-4 cylinder
• Power: 199 HP @ 13,200 RPM
• Torque: 117.6 Nm @ 10,800 RPM
• Weight: 203kg (wet)
• Top Speed: 186 mph
• Electronics: IMU, TC, SC, LCM, EBM

DEPOSIT POLICY:
• $500 deposit required to hold unit
• Deposit locks in the motorcycle for up to 30 days
• Applied toward the final purchase price
• Ensures exclusive reservation of the bike`,
        price: "17999.00",
        discount: "5",
        discountType: "percentage",
        category: "motorcycles",
        stockQuantity: 1,
        stockStatus: "in_stock",
        images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
        featured: false,
      },
      {
        title: "Yoshimura Exhaust System",
        description: `Premium aftermarket exhaust system for enhanced performance and sound

KEY SPECIFICATIONS:
• Material: Stainless steel and carbon fiber
• Weight reduction: 40% lighter than stock
• Power gain: +8 HP, +5 lb-ft torque
• Sound: Deep, aggressive tone
• Compatible: Most sportbikes 600cc-1000cc
• Installation: Professional recommended`,
        price: "899.00",
        discount: "0",
        discountType: "percentage",
        category: "used parts",
        stockQuantity: 5,
        stockStatus: "in_stock",
        images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
        featured: false,
      },
      {
        title: "Performance Brake Pads Set",
        description: `High-performance brake pads for superior stopping power

KEY SPECIFICATIONS:
• Material: Ceramic compound
• Temperature range: -40°F to 1200°F
• Fade resistance: Excellent
• Dust production: Minimal
• Compatible: Most sport motorcycles
• Warranty: 2 years or 25,000 miles`,
        price: "129.00",
        discount: "15",
        discountType: "percentage",
        category: "oem parts",
        stockQuantity: 10,
        stockStatus: "in_stock",
        images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
        featured: false,
      },
      {
        title: "Racing Helmet - Carbon Fiber",
        description: `Professional racing helmet with advanced safety features

KEY SPECIFICATIONS:
• Material: Carbon fiber shell
• Weight: 1,350g ± 50g
• Standards: DOT, ECE 22.05, FIM
• Ventilation: 15 intake/exhaust vents
• Visor: Anti-fog, UV protection
• Sizes: XS, S, M, L, XL, XXL`,
        price: "649.00",
        discount: "0",
        discountType: "percentage",
        category: "custom wheels",
        stockQuantity: 3,
        stockStatus: "in_stock",
        images: ["https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
        featured: true,
      },
      {
        title: "2021 Kawasaki Versys 650 – Used, 19,000 Miles",
        description: `Reliable adventure touring motorcycle in excellent condition

KEY SPECIFICATIONS:
• Engine: 649cc parallel-twin
• Power: 69 HP @ 8,500 RPM
• Torque: 64 Nm @ 7,000 RPM
• Weight: 216kg (wet)
• Seat Height: 840mm
• Fuel Capacity: 21 liters
• Condition: Excellent, well-maintained
• Service history: Complete records available

DEPOSIT POLICY:
• $500 deposit required to hold unit
• Deposit locks in the motorcycle for up to 30 days
• Applied toward the final purchase price
• Ensures exclusive reservation of the bike`,
        price: "6899.00",
        discount: "0",
        discountType: "percentage",
        category: "motorcycles",
        stockQuantity: 1,
        stockStatus: "in_stock",
        images: ["https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
        featured: false,
      },
    ];

    // Insert sample products
    for (const product of sampleProducts) {
      await db.insert(products).values(product).onConflictDoNothing();
    }

    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { seedDatabase };