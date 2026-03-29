import crypto from "crypto";

const TOKEN_SECRET = process.env.SESSION_SECRET || "avishu-dev-secret";
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function verifyToken(token: string): { userId: number; role: string } | null {
  const dotIdx = token.lastIndexOf(".");
  if (dotIdx === -1) return null;
  const payload = token.slice(0, dotIdx);
  const sig = token.slice(dotIdx + 1);
  const expectedSig = crypto
    .createHmac("sha256", TOKEN_SECRET)
    .update(payload)
    .digest("base64url");
  if (sig !== expectedSig) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof data.exp === "number" && data.exp < Date.now()) return null;
    return { userId: data.userId, role: data.role };
  } catch {
    return null;
  }
}

export function extractAuth(req: any): { userId: number; role: string } | null {
  const authHeader = req.headers?.authorization as string | undefined;
  if (authHeader?.startsWith("Bearer ")) {
    const result = verifyToken(authHeader.slice(7));
    if (result) return result;
  }
  if (req.session?.userId) {
    return { userId: req.session.userId, role: req.session.role || "client" };
  }
  return null;
}

export function requireAuth(req: any, res: any): number | null {
  const auth = extractAuth(req);
  if (!auth) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  return auth.userId;
}
