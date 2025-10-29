"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import {
  IconCopy,
  IconKey,
  IconPlus,
  IconDots,
  IconTrash,
  IconEye,
  IconEyeOff,
  IconClock,
  IconCheck,
  IconX
} from "@tabler/icons-react"
import { CreateApiKeyForm } from "./create-api-key-form"
import { type ApiKeyResponse } from "@/lib/api-keys"

interface ApiKeysTableProps {
  userId: string
}

interface ApiKeyWithStatus extends ApiKeyResponse {
  isExpired?: boolean
  daysUntilExpiry?: number
}

export function ApiKeysTable({ userId }: ApiKeysTableProps) {
  const [apiKeys, setApiKeys] = useState<ApiKeyWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const fetchApiKeys = async () => {
    try {
      const response = await fetch("/api/v1/api-keys", {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch API keys")
      }

      const data = await response.json()
      const processedKeys = data.data.map((key: ApiKeyResponse) => ({
        ...key,
        isExpired: key.expiresAt ? new Date(key.expiresAt) < new Date() : false,
        daysUntilExpiry: key.expiresAt
          ? Math.ceil((new Date(key.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          : undefined,
      }))

      setApiKeys(processedKeys)
    } catch (error) {
      console.error("Error fetching API keys:", error)
      toast.error("Failed to fetch API keys")
    } finally {
      setLoading(false)
    }
  }

  const deleteApiKey = async (keyId: string) => {
    try {
      const response = await fetch(`/api/v1/api-keys/${keyId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to delete API key")
      }

      setApiKeys(prev => prev.filter(key => key.id !== keyId))
      toast.success("API key deleted successfully")
    } catch (error) {
      console.error("Error deleting API key:", error)
      toast.error("Failed to delete API key")
    }
  }

  const updateKeyStatus = async (keyId: string, status: 'active' | 'inactive' | 'revoked') => {
    try {
      const response = await fetch(`/api/v1/api-keys/${keyId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to update API key status")
      }

      setApiKeys(prev =>
        prev.map(key =>
          key.id === keyId ? { ...key, status } : key
        )
      )
      toast.success(`API key ${status} successfully`)
    } catch (error) {
      console.error("Error updating API key status:", error)
      toast.error("Failed to update API key status")
    }
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(text)
      toast.success(`${type} copied to clipboard`)
      setTimeout(() => setCopiedKey(null), 2000)
    } catch (error) {
      toast.error("Failed to copy to clipboard")
    }
  }

  const getStatusBadge = (status: string, isExpired?: boolean) => {
    if (isExpired) {
      return <Badge variant="destructive">Expired</Badge>
    }

    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">Active</Badge>
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>
      case "revoked":
        return <Badge variant="destructive">Revoked</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getScopesDisplay = (scopes: string[]) => {
    return scopes.map(scope => (
      <Badge key={scope} variant="outline" className="text-xs">
        {scope}
      </Badge>
    ))
  }

  useEffect(() => {
    fetchApiKeys()
  }, [])

  if (loading) {
    return <div className="text-center py-8">Loading API keys...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">
            Manage your API keys for programmatic access to the platform.
            Keep your keys secure and never share them publicly.
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <IconPlus className="mr-2 h-4 w-4" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
              <DialogDescription>
                Generate a new API key for programmatic access. The full key will only be shown once.
              </DialogDescription>
            </DialogHeader>
            <CreateApiKeyForm
              userId={userId}
              onSuccess={(newKey) => {
                setCreateDialogOpen(false)
                fetchApiKeys()
                toast.success("API key created successfully")
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {apiKeys.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
          <IconKey className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No API keys</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first API key.
          </p>
          <div className="mt-6">
            <Button onClick={() => setCreateDialogOpen(true)}>
              <IconPlus className="mr-2 h-4 w-4" />
              Create API Key
            </Button>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key Prefix</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Scopes</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((apiKey) => (
                <TableRow key={apiKey.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <span>{apiKey.name}</span>
                      {apiKey.lastUsedAt && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <IconClock className="h-3 w-3 mr-1" />
                          Last used {new Date(apiKey.lastUsedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {apiKey.keyPrefix}...
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(apiKey.keyPrefix, "Key prefix")}
                        className="h-6 w-6 p-0"
                      >
                        {copiedKey === apiKey.keyPrefix ? (
                          <IconCheck className="h-3 w-3" />
                        ) : (
                          <IconCopy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(apiKey.status, apiKey.isExpired)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {getScopesDisplay(apiKey.scopes)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {apiKey.usageCount} uses
                    </div>
                  </TableCell>
                  <TableCell>
                    {apiKey.expiresAt ? (
                      <div className="text-sm">
                        {new Date(apiKey.expiresAt).toLocaleDateString()}
                        {apiKey.daysUntilExpiry !== undefined && (
                          <div className={`text-xs ${
                            apiKey.daysUntilExpiry <= 7
                              ? 'text-red-600 font-medium'
                              : apiKey.daysUntilExpiry <= 30
                                ? 'text-yellow-600'
                                : 'text-muted-foreground'
                          }`}>
                            {apiKey.isExpired
                              ? 'Expired'
                              : apiKey.daysUntilExpiry <= 0
                                ? 'Expires today'
                                : `${apiKey.daysUntilExpiry} days left`
                            }
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Never</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <IconDots className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        {apiKey.status === "active" && (
                          <DropdownMenuItem onClick={() => updateKeyStatus(apiKey.id, "inactive")}>
                            <IconEyeOff className="mr-2 h-4 w-4" />
                            Deactivate
                          </DropdownMenuItem>
                        )}
                        {apiKey.status === "inactive" && (
                          <DropdownMenuItem onClick={() => updateKeyStatus(apiKey.id, "active")}>
                            <IconEye className="mr-2 h-4 w-4" />
                            Activate
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                              className="text-red-600"
                            >
                              <IconTrash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the API key
                                "{apiKey.name}" and remove all access associated with it.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteApiKey(apiKey.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}