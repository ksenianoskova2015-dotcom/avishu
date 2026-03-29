import { Router, type IRouter } from "express";
import { db, ordersTable, usersTable, productsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { CreateOrderBody, UpdateOrderStatusBody } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth-utils";

const router: IRouter = Router();

async function getUser(userId: number) {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);
  return user;
}

async function formatOrder(order: any, user: any, product: any) {
  return {
    id: order.id,
    userId: order.userId,
    userEmail: user?.email ?? "",
    productId: order.productId,
    productName: product?.name ?? "",
    productImageUrl: product?.imageUrl ?? "",
    size: order.size,
    quantity: order.quantity,
    totalPrice: Number(order.totalPrice),
    status: order.status,
    createdAt: order.createdAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const user = await getUser(userId);
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  let rows: any[];
  if (user.role === "client") {
    rows = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.userId, userId))
      .orderBy(desc(ordersTable.createdAt));
  } else {
    rows = await db.select().from(ordersTable).orderBy(ordersTable.createdAt);
  }

  const userIds = [...new Set(rows.map((r) => r.userId))];
  const productIds = [...new Set(rows.map((r) => r.productId))];

  const allUsers: Record<number, any> = {};
  for (const uid of userIds) {
    const [u] = await db.select().from(usersTable).where(eq(usersTable.id, uid)).limit(1);
    if (u) allUsers[uid] = u;
  }

  const allProducts: Record<number, any> = {};
  for (const pid of productIds) {
    const [p] = await db.select().from(productsTable).where(eq(productsTable.id, pid)).limit(1);
    if (p) allProducts[pid] = p;
  }

  const formatted = await Promise.all(
    rows.map((o) => formatOrder(o, allUsers[o.userId], allProducts[o.productId]))
  );

  res.json(formatted);
});

router.post("/", async (req, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const user = await getUser(userId);
  if (!user || user.role !== "client") {
    res.status(403).json({ error: "Only clients can create orders" });
    return;
  }

  const parse = CreateOrderBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { productId, size, quantity } = parse.data;

  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, productId))
    .limit(1);

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const totalPrice = (Number(product.price) * quantity).toFixed(2);

  const [newOrder] = await db
    .insert(ordersTable)
    .values({
      userId,
      productId,
      size,
      quantity,
      totalPrice,
      status: "created",
    })
    .returning();

  // Decrement stock if product has stock (preorder stays at 0)
  if ((product.stockQuantity ?? 0) > 0) {
    const newQty = Math.max(0, (product.stockQuantity ?? 0) - quantity);
    await db
      .update(productsTable)
      .set({
        stockQuantity: newQty,
        type: newQty > 0 ? "in_stock" : "preorder",
      })
      .where(eq(productsTable.id, productId));
  }

  // Re-fetch updated product for response
  const [updatedProduct] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, productId))
    .limit(1);

  res.status(201).json(await formatOrder(newOrder, user, updatedProduct ?? product));
});

router.delete("/:id", async (req, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const user = await getUser(userId);
  if (!user || user.role !== "client") {
    res.status(403).json({ error: "Only clients can delete orders" });
    return;
  }

  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid order id" });
    return;
  }

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(and(eq(ordersTable.id, id), eq(ordersTable.userId, userId)))
    .limit(1);

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  if (order.status !== "created") {
    res.status(403).json({ error: "Can only delete orders with status 'created'" });
    return;
  }

  await db.delete(ordersTable).where(eq(ordersTable.id, id));

  // Restore stock: add back the ordered quantity
  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, order.productId))
    .limit(1);

  if (product) {
    const restoredQty = (product.stockQuantity ?? 0) + order.quantity;
    await db
      .update(productsTable)
      .set({ stockQuantity: restoredQty, type: "in_stock" })
      .where(eq(productsTable.id, order.productId));
  }

  res.json({ success: true });
});

router.patch("/:id/status", async (req, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const user = await getUser(userId);
  // Only production role can change order status
  if (!user || user.role !== "production") {
    res.status(403).json({ error: "Only production role can update order status" });
    return;
  }

  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid order id" });
    return;
  }

  const parse = UpdateOrderStatusBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { status } = parse.data;

  const [updated] = await db
    .update(ordersTable)
    .set({ status })
    .where(eq(ordersTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const orderUser = await getUser(updated.userId);
  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, updated.productId))
    .limit(1);

  res.json(await formatOrder(updated, orderUser, product));
});

export default router;
