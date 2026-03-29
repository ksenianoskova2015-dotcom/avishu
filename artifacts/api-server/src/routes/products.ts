import { Router, type IRouter } from "express";
import { db, productsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth-utils";

const router: IRouter = Router();

async function getUser(userId: number) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  return user;
}

function formatProduct(p: any) {
  return {
    id: p.id,
    name: p.name,
    price: Number(p.price),
    description: p.description,
    imageUrl: p.imageUrl,
    imageUrls: (p.imageUrls as string[]) || [],
    discount: p.discount != null ? Number(p.discount) : null,
    stockQuantity: p.stockQuantity ?? 0,
    type: p.type,
    collection: p.collection,
    sizes: p.sizes as string[],
  };
}

router.get("/", async (_req, res) => {
  const products = await db.select().from(productsTable).orderBy(productsTable.id);
  res.json(products.map(formatProduct));
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid product id" });
    return;
  }

  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, id))
    .limit(1);

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(formatProduct(product));
});

router.post("/", async (req, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const user = await getUser(userId);
  if (!user || user.role !== "franchise") {
    res.status(403).json({ error: "Only franchise can create products" });
    return;
  }

  const { name, price, description, imageUrl, imageUrls, discount, stockQuantity, collection, sizes } = req.body;

  if (!name || typeof name !== "string" || name.length > 500) {
    res.status(400).json({ error: "Invalid name" });
    return;
  }
  if (typeof price !== "number" || price <= 0) {
    res.status(400).json({ error: "Invalid price" });
    return;
  }

  const qty = typeof stockQuantity === "number" ? stockQuantity : 0;
  const type = qty > 0 ? "in_stock" : "preorder";
  const urls: string[] = Array.isArray(imageUrls) ? imageUrls : [];
  const primaryImg = typeof imageUrl === "string" && imageUrl ? imageUrl : (urls[0] || "");

  const [product] = await db
    .insert(productsTable)
    .values({
      name: name.trim(),
      price: price.toFixed(2),
      description: typeof description === "string" ? description.trim() : "",
      imageUrl: primaryImg,
      imageUrls: urls,
      discount: typeof discount === "number" ? discount.toFixed(2) : null,
      stockQuantity: qty,
      type,
      collection: typeof collection === "string" ? collection.trim() : "",
      sizes: Array.isArray(sizes) && sizes.length > 0 ? sizes : ["XS", "S", "M", "L"],
    })
    .returning();

  res.status(201).json(formatProduct(product));
});

router.delete("/:id", async (req, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const user = await getUser(userId);
  if (!user || user.role !== "franchise") {
    res.status(403).json({ error: "Only franchise can delete products" });
    return;
  }

  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid product id" });
    return;
  }

  const [existing] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, id))
    .limit(1);

  if (!existing) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  await db.delete(productsTable).where(eq(productsTable.id, id));
  res.json({ success: true });
});

router.put("/:id", async (req, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const user = await getUser(userId);
  if (!user || user.role !== "franchise") {
    res.status(403).json({ error: "Only franchise can update products" });
    return;
  }

  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid product id" });
    return;
  }

  const [existing] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, id))
    .limit(1);

  if (!existing) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const { name, price, description, imageUrl, imageUrls, discount, stockQuantity, collection, sizes } = req.body;

  const updates: Record<string, any> = {};

  if (typeof name === "string" && name.trim()) updates.name = name.trim();
  if (typeof price === "number" && price > 0) updates.price = price.toFixed(2);
  if (typeof description === "string") updates.description = description.trim();
  if (typeof imageUrl === "string") updates.imageUrl = imageUrl.trim();
  if (Array.isArray(imageUrls)) updates.imageUrls = imageUrls;
  if (discount === null || (typeof discount === "number" && discount >= 0)) {
    updates.discount = discount === null ? null : discount.toFixed(2);
  }
  if (typeof stockQuantity === "number" && stockQuantity >= 0) {
    updates.stockQuantity = stockQuantity;
    updates.type = stockQuantity > 0 ? "in_stock" : "preorder";
  }
  if (typeof collection === "string") updates.collection = collection.trim();
  if (Array.isArray(sizes) && sizes.length > 0) updates.sizes = sizes;

  if (Object.keys(updates).length === 0) {
    res.json(formatProduct(existing));
    return;
  }

  const [updated] = await db
    .update(productsTable)
    .set(updates)
    .where(eq(productsTable.id, id))
    .returning();

  res.json(formatProduct(updated));
});

export default router;
