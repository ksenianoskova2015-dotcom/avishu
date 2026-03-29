import { db, usersTable, productsTable } from "@workspace/db";
import crypto from "crypto";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "avishu_salt").digest("hex");
}

async function seed() {
  console.log("Seeding AVISHU database...");

  // Seed users
  const users = [
    {
      email: "client@avishu.com",
      name: "Alex Client",
      passwordHash: hashPassword("client123"),
      role: "client",
    },
    {
      email: "franchise@avishu.com",
      name: "Maria Franchise",
      passwordHash: hashPassword("franchise123"),
      role: "franchise",
    },
    {
      email: "production@avishu.com",
      name: "Ivan Production",
      passwordHash: hashPassword("production123"),
      role: "production",
    },
  ];

  for (const user of users) {
    await db
      .insert(usersTable)
      .values(user)
      .onConflictDoNothing();
  }
  console.log("Users seeded.");

  // Seed products
  const products = [
    {
      name: "CLASSIC BLACK DRESS",
      price: "12500.00",
      description: "Timeless and elegant black dress perfect for any occasion.",
      imageUrl: "/images/hero-fashion.png",
      type: "in_stock",
      collection: "SPRING SUMMER 2026",
      sizes: ["XS", "S", "M", "L"],
    },
    {
      name: "WHITE PANTS SUIT",
      price: "18000.00",
      description: "Sharp and modern white pantsuit with tailored silhouette.",
      imageUrl: "/images/product-placeholder.png",
      type: "preorder",
      collection: "SPRING SUMMER 2026",
      sizes: ["XS", "S", "M", "L", "XL"],
    },
    {
      name: "MINIMAL LINE BLAZER",
      price: "15500.00",
      description: "Clean architectural blazer from the Minimal Line collection.",
      imageUrl: "/images/hero-fashion.png",
      type: "in_stock",
      collection: "MINIMAL LINE",
      sizes: ["S", "M", "L", "XL"],
    },
    {
      name: "EVENING SILK GOWN",
      price: "24000.00",
      description: "Luxurious silk gown for special occasions. Handcrafted.",
      imageUrl: "/images/product-placeholder.png",
      type: "preorder",
      collection: "EVENING COLLECTION",
      sizes: ["XS", "S", "M", "L"],
    },
    {
      name: "BLACK ESSENTIALS TEE",
      price: "4500.00",
      description: "Premium weight cotton tee in pure black. The foundation piece.",
      imageUrl: "/images/hero-fashion.png",
      type: "in_stock",
      collection: "BLACK ESSENTIALS",
      sizes: ["XS", "S", "M", "L", "XL"],
    },
    {
      name: "STRUCTURED TRENCH",
      price: "32000.00",
      description: "Architectural structured trench coat with oversized lapels.",
      imageUrl: "/images/product-placeholder.png",
      type: "in_stock",
      collection: "BLACK ESSENTIALS",
      sizes: ["S", "M", "L"],
    },
  ];

  for (const product of products) {
    await db
      .insert(productsTable)
      .values(product)
      .onConflictDoNothing();
  }
  console.log("Products seeded.");

  console.log("Seeding complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
