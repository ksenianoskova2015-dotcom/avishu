import { pgTable, text, serial, timestamp, numeric, json, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  imageUrls: json("image_urls").$type<string[]>().notNull().default([]),
  discount: numeric("discount", { precision: 5, scale: 2 }),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  type: text("type").notNull().default("preorder"), // in_stock | preorder
  collection: text("collection").notNull(),
  sizes: json("sizes").$type<string[]>().notNull().default(["XS", "S", "M", "L"]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
