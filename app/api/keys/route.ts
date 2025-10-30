import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "node:crypto";
import { db } from "@/db";
import { apiKeys } from "@/db/schema/apiKeys";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";

const createKeySchema = z.object({
  name: z.string().min(1),
  scopes: z.string().optional(),
});

async function requireUser(req: NextRequest) {
  try {
    // Better Auth: infer session from request headers
    const session = await (auth as any).api.getSession({ headers: req.headers });
    if (!session || !session.user) return null;
    return session.user;
  } catch {
    return null;
  }
}

function generateApiKey(prefix: string = "ek"): { plaintext: string; prefix: string } {
  const idPart = crypto.randomBytes(6).toString("hex");
  const secretPart = crypto.randomBytes(24).toString("base64url");
  const p = `${prefix}_${idPart}`;
  return { plaintext: `${p}_${secretPart}`, prefix: p };
}

function hashKey(plaintext: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(plaintext, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export async function GET(req: NextRequest) {
  const user = await requireUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      prefix: apiKeys.prefix,
      createdAt: apiKeys.createdAt,
      lastUsedAt: apiKeys.lastUsedAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.userId, user.id));

  return NextResponse.json({ keys: rows });
}

export async function POST(req: NextRequest) {
  const user = await requireUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = createKeySchema.safeParse(json);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { name, scopes } = parsed.data;
  const { plaintext, prefix } = generateApiKey("ek");
  const keyHash = hashKey(plaintext);

  const id = crypto.randomUUID();
  const now = new Date();

  await db.insert(apiKeys).values({
    id: id as any, // uuid in DB
    userId: user.id,
    name,
    keyHash,
    prefix,
    scopes: scopes ?? null,
    createdAt: now,
  });

  // Return plaintext once
  return NextResponse.json({ id, name, prefix, key: plaintext, createdAt: now });
}

export async function DELETE(req: NextRequest) {
  const user = await requireUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const result = await db.delete(apiKeys).where(and(eq(apiKeys.id, id as any), eq(apiKeys.userId, user.id)));
  // result rowCount depends on driver; not required here
  return NextResponse.json({ ok: true });
}
