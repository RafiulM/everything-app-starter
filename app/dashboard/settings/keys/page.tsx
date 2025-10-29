"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import {
  IconKey,
  IconPlus,
  IconEdit,
  IconTrash,
  IconEye,
  IconEyeOff,
  IconTestPipe,
  IconLoader2,
  IconCheck,
  IconX
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface ApiKey {
  id: string
  serviceProvider: string
  keyName: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface TestResult {
  success: boolean
  message: string
  details?: any
  serviceProvider: string
}

const serviceProviders = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic (Claude)" },
  { value: "google", label: "Google AI" },
]

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [testingKeyId, setTestingKeyId] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({})
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({})

  const [newKey, setNewKey] = useState({
    serviceProvider: "",
    keyName: "",
    apiKey: "",
  })

  const [editingKey, setEditingKey] = useState({
    id: "",
    keyName: "",
    isActive: true,
  })

  const fetchKeys = async () => {
    try {
      const response = await fetch("/api/keys")
      if (response.ok) {
        const data = await response.json()
        setKeys(data.keys)
      } else {
        toast.error("Failed to fetch API keys")
      }
    } catch (error) {
      console.error("Error fetching API keys:", error)
      toast.error("Failed to fetch API keys")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKeys()
  }, [])

  const handleAddKey = async () => {
    if (!newKey.serviceProvider || !newKey.keyName || !newKey.apiKey) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      const response = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newKey),
      })

      if (response.ok) {
        toast.success("API key added successfully")
        setNewKey({ serviceProvider: "", keyName: "", apiKey: "" })
        setShowAddDialog(false)
        fetchKeys()
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to add API key")
      }
    } catch (error) {
      console.error("Error adding API key:", error)
      toast.error("Failed to add API key")
    }
  }

  const handleUpdateKey = async () => {
    try {
      const response = await fetch("/api/keys", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingKey),
      })

      if (response.ok) {
        toast.success("API key updated successfully")
        setShowEditDialog(false)
        fetchKeys()
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to update API key")
      }
    } catch (error) {
      console.error("Error updating API key:", error)
      toast.error("Failed to update API key")
    }
  }

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm("Are you sure you want to delete this API key?")) {
      return
    }

    try {
      const response = await fetch(`/api/keys?id=${keyId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("API key deleted successfully")
        fetchKeys()
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to delete API key")
      }
    } catch (error) {
      console.error("Error deleting API key:", error)
      toast.error("Failed to delete API key")
    }
  }

  const handleTestKey = async (keyId: string) => {
    setTestingKeyId(keyId)
    try {
      const response = await fetch("/api/keys/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyId }),
      })

      if (response.ok) {
        const result = await response.json()
        setTestResults(prev => ({ ...prev, [keyId]: result }))
        toast(result.success ? "success" : "error", {
          description: result.message,
        })
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to test API key")
      }
    } catch (error) {
      console.error("Error testing API key:", error)
      toast.error("Failed to test API key")
    } finally {
      setTestingKeyId(null)
    }
  }

  const openEditDialog = (key: ApiKey) => {
    setEditingKey({
      id: key.id,
      keyName: key.keyName,
      isActive: key.isActive,
    })
    setShowEditDialog(true)
  }

  const toggleApiKeyVisibility = (keyId: string) => {
    setShowApiKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }))
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6">
        <div className="flex items-center justify-center h-64">
          <IconLoader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">API Keys</h2>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <IconPlus className="mr-2 h-4 w-4" />
              Add API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New API Key</DialogTitle>
              <DialogDescription>
                Add a new API key for an external service. Your keys will be encrypted and stored securely.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="serviceProvider">Service Provider</Label>
                <Select value={newKey.serviceProvider} onValueChange={(value) => setNewKey(prev => ({ ...prev, serviceProvider: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceProviders.map((provider) => (
                      <SelectItem key={provider.value} value={provider.value}>
                        {provider.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="keyName">Key Name</Label>
                <Input
                  id="keyName"
                  placeholder="e.g., My OpenAI Key"
                  value={newKey.keyName}
                  onChange={(e) => setNewKey(prev => ({ ...prev, keyName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter your API key"
                  value={newKey.apiKey}
                  onChange={(e) => setNewKey(prev => ({ ...prev, apiKey: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddKey}>Add Key</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
          <CardDescription>
            Manage your API keys for external AI services. Keys are encrypted and stored securely.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {keys.length === 0 ? (
            <div className="text-center py-8">
              <IconKey className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No API keys yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your first API key to start using external AI services.
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <IconPlus className="mr-2 h-4 w-4" />
                Add Your First API Key
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key) => {
                  const testResult = testResults[key.id]
                  const showApiKey = showApiKeys[key.id]

                  return (
                    <TableRow key={key.id}>
                      <TableCell className="font-medium">{key.keyName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {serviceProviders.find(p => p.value === key.serviceProvider)?.label || key.serviceProvider}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Badge variant={key.isActive ? "default" : "secondary"}>
                            {key.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {testResult && (
                            testResult.success ? (
                              <IconCheck className="h-4 w-4 text-green-600" />
                            ) : (
                              <IconX className="h-4 w-4 text-red-600" />
                            )
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(key.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTestKey(key.id)}
                            disabled={testingKeyId === key.id}
                          >
                            {testingKeyId === key.id ? (
                              <IconLoader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <IconTestPipe className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(key)}
                          >
                            <IconEdit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteKey(key.id)}
                          >
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit API Key</DialogTitle>
            <DialogDescription>
              Update the settings for your API key.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editKeyName">Key Name</Label>
              <Input
                id="editKeyName"
                value={editingKey.keyName}
                onChange={(e) => setEditingKey(prev => ({ ...prev, keyName: e.target.value }))}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="editIsActive"
                checked={editingKey.isActive}
                onCheckedChange={(checked) => setEditingKey(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="editIsActive">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateKey}>Update Key</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}