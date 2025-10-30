"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useSession } from "@/lib/auth-client";

const createKeySchema = z.object({ name: z.string().min(1) });

type KeyRow = {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
};

type KeysResponse = { keys: KeyRow[] };

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then(async (res) => {
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  });

export default function ApiKeysPage() {
  const { data: session } = useSession();
  const authed = !!session?.user;

  const { data, error, isLoading, mutate } = useSWR<KeysResponse>(authed ? "/api/keys" : null, fetcher, {
    revalidateOnFocus: true,
  });

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const [showKey, setShowKey] = useState(false);
  const [newKey, setNewKey] = useState<{ id: string; prefix: string; key: string } | null>(null);

  const canSubmit = useMemo(() => name.trim().length > 0, [name]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const parsed = createKeySchema.safeParse({ name });
    if (!parsed.success) {
      setFormError("Please enter a key name");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const json = await res.json();
      if (!res.ok) {
        setFormError(json?.error ?? "Failed to create key");
        return;
      }

      // Show one-time plaintext key
      setNewKey({ id: json.id, prefix: json.prefix, key: json.key });
      setShowKey(true);
      setName("");

      // Optimistic update, then revalidate
      await mutate(
        (prev) => ({ keys: [{ id: json.id, name: json.name, prefix: json.prefix, createdAt: json.createdAt, lastUsedAt: null }, ...(prev?.keys ?? [])] }),
        { revalidate: true }
      );
    } catch (e) {
      setFormError("Failed to create key");
    } finally {
      setLoading(false);
    }
  }

  async function revoke(id: string) {
    // Minimal confirmation to avoid accidental revokes
    const ok = window.confirm("Revoke this key? This cannot be undone.");
    if (!ok) return;
    // Optimistic removal
    await mutate((prev) => ({ keys: (prev?.keys ?? []).filter((k) => k.id !== id) }), { revalidate: false });
    const res = await fetch(`/api/keys?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) {
      // If failed, revalidate to restore correct state
      await mutate();
    }
  }

  const rows = data?.keys ?? [];

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <form onSubmit={onCreate} className="flex gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Key name"
            aria-label="API key name"
          />
          <Button type="submit" disabled={!canSubmit || loading}>
            {loading ? "Creating..." : "Create key"}
          </Button>
        </form>
        {formError && <p className="text-sm text-red-500 mt-2">{formError}</p>}
      </Card>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Prefix</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last used</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                  Loading keys...
                </TableCell>
              </TableRow>
            )}
            {error && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-red-500 py-6">
                  Failed to load API keys
                </TableCell>
              </TableRow>
            )}
            {!isLoading && rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.prefix}</TableCell>
                <TableCell>{new Date(r.createdAt).toLocaleString()}</TableCell>
                <TableCell>{r.lastUsedAt ? new Date(r.lastUsedAt).toLocaleString() : "—"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="destructive" size="sm" onClick={() => revoke(r.id)}>
                    Revoke
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && !error && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                  No API keys yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={showKey} onOpenChange={setShowKey}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copy your API key</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              This key is shown only once. Store it securely.
            </p>
            {newKey && (
              <div className="flex items-center gap-2">
                <Input readOnly value={newKey.key} />
                <Button type="button" onClick={() => navigator.clipboard.writeText(newKey.key)}>Copy</Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" onClick={() => setShowKey(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
