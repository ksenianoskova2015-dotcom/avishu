import { Router, type IRouter } from "express";
import { db, plansTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
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

router.get("/", async (req, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const user = await getUser(userId);
  if (!user || user.role !== "franchise") {
    res.status(403).json({ error: "Only franchise can view plans" });
    return;
  }

  const plans = await db.select().from(plansTable).orderBy(plansTable.year, plansTable.month);
  res.json(plans.map(p => ({
    id: p.id,
    month: p.month,
    year: p.year,
    amount: Number(p.amount),
    createdAt: p.createdAt.toISOString(),
  })));
});

router.post("/", async (req, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const user = await getUser(userId);
  if (!user || user.role !== "franchise") {
    res.status(403).json({ error: "Only franchise can create plans" });
    return;
  }

  const { month, year, amount } = req.body;
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    res.status(400).json({ error: "Invalid month" });
    return;
  }
  if (!Number.isInteger(year) || year < 2000) {
    res.status(400).json({ error: "Invalid year" });
    return;
  }
  if (typeof amount !== "number" || amount <= 0) {
    res.status(400).json({ error: "Invalid amount" });
    return;
  }
  const [plan] = await db
    .insert(plansTable)
    .values({ month, year, amount: amount.toFixed(2) })
    .returning();

  res.status(201).json({
    id: plan.id,
    month: plan.month,
    year: plan.year,
    amount: Number(plan.amount),
    createdAt: plan.createdAt.toISOString(),
  });
});

export default router;
