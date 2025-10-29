"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { IconCopy, IconCheck, IconKey } from "@tabler/icons-react"
import { API_KEY_SCOPES } from "@/db/schema/api-keys"
import { toast } from "sonner"

const createApiKeyFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  scopes: z.array(z.string()).min(1, "At least one scope must be selected"),
  expiresAt: z.string().optional(),
})

type CreateApiKeyFormValues = z.infer<typeof createApiKeyFormSchema>

interface CreateApiKeyFormProps {
  userId: string
  onSuccess: (newKey: { fullKey: string }) => void
}

export function CreateApiKeyForm({ userId, onSuccess }: CreateApiKeyFormProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const form = useForm<CreateApiKeyFormValues>({
    resolver: zodResolver(createApiKeyFormSchema),
    defaultValues: {
      name: "",
      scopes: [],
      expiresAt: "",
    },
  })

  const scopeOptions = Object.entries(API_KEY_SCOPES).map(([key, value]) => ({
    id: value,
    label: value,
    description: getScopeDescription(value),
  }))

  const onSubmit = async (data: CreateApiKeyFormValues) => {
    setIsCreating(true)

    try {
      const response = await fetch("/api/v1/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          expiresAt: data.expiresAt || undefined,
        }),
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create API key")
      }

      const result = await response.json()
      setCreatedKey(result.data.fullKey)
      onSuccess(result.data)
    } catch (error) {
      console.error("Error creating API key:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create API key")
    } finally {
      setIsCreating(false)
    }
  }

  const copyToClipboard = async () => {
    if (createdKey) {
      try {
        await navigator.clipboard.writeText(createdKey)
        setCopied(true)
        toast.success("API key copied to clipboard")
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        toast.error("Failed to copy API key")
      }
    }
  }

  const getExpiryDate = (days: number) => {
    const date = new Date()
    date.setDate(date.getDate() + days)
    return date.toISOString().split('T')[0]
  }

  if (createdKey) {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <IconKey className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">API Key Created Successfully!</h3>
            <p className="text-sm text-muted-foreground">
              Save this key securely. It won't be shown again.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Your API Key:</label>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-md p-3 font-mono text-sm break-all">
              {createdKey}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="shrink-0"
            >
              {copied ? (
                <IconCheck className="h-4 w-4 text-green-600" />
              ) : (
                <IconCopy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> Store this key securely. For security reasons, we cannot show it again.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => setCreatedKey(null)}>
            Create Another Key
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Production API Key"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                A descriptive name to help you identify this API key.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="scopes"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Permissions</FormLabel>
                <FormDescription>
                  Select the permissions this API key should have.
                </FormDescription>
              </div>
              <div className="space-y-3">
                {scopeOptions.map((scope) => (
                  <FormField
                    key={scope.id}
                    control={form.control}
                    name="scopes"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={scope.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(scope.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, scope.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== scope.id
                                      )
                                    )
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="font-normal">
                              {scope.label}
                            </FormLabel>
                            <FormDescription>
                              {scope.description}
                            </FormDescription>
                          </div>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expiresAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expiration Date (Optional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select expiration period" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">Never expires</SelectItem>
                  <SelectItem value={getExpiryDate(7)}>7 days</SelectItem>
                  <SelectItem value={getExpiryDate(30)}>30 days</SelectItem>
                  <SelectItem value={getExpiryDate(90)}>90 days</SelectItem>
                  <SelectItem value={getExpiryDate(365)}>1 year</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Set an optional expiration date for this API key.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isCreating}>
            {isCreating ? "Creating..." : "Create API Key"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

function getScopeDescription(scope: string): string {
  const descriptions: Record<string, string> = {
    "chat:read": "Read access to chat history and conversations",
    "chat:write": "Create and send chat messages",
    "search:read": "Perform search queries and read results",
    "search:write": "Create and manage search indexes",
    "image:read": "Read and download generated images",
    "image:write": "Generate new images using AI",
    "admin": "Full administrative access to all resources",
  }

  return descriptions[scope] || "Custom permission scope"
}