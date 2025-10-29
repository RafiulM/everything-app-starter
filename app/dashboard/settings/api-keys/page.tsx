import { Suspense } from "react"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ApiKeysTable } from "./components/api-keys-table"
import { ApiUsageExample } from "./components/api-usage-example"

export default async function ApiKeysPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect("/sign-in")
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">API Keys</h2>
          <p className="text-muted-foreground">
            Manage your API keys for programmatic access to the platform
          </p>
        </div>
      </div>

      <div className="grid gap-8">
        <Suspense fallback={<div>Loading API keys...</div>}>
          <ApiKeysTable userId={session.user.id} />
        </Suspense>

        <ApiUsageExample />
      </div>
    </div>
  )
}