"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Send, Save, Plus, Trash2, Wand2, Minimize2 } from "lucide-react"
import type { RequestData, RequestTab, Collection, Header } from "@/types/api-studio"
import { toast } from "@/hooks/use-toast"
import { useState } from "react"

interface RequestFormProps {
  activeTab: RequestTab
  collections: Collection[]
  loading: boolean
  onRequestUpdate: (updates: Partial<RequestData>) => void
  onSendRequest: () => void
  onSaveRequest: (name: string, collectionId: string) => void
}

export function RequestForm({
  activeTab,
  collections,
  loading,
  onRequestUpdate,
  onSendRequest,
  onSaveRequest,
}: RequestFormProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [newRequestName, setNewRequestName] = useState("")
  const [selectedCollection, setSelectedCollection] = useState("")

  const formatJSON = (jsonString: string, prettify = true) => {
    try {
      const parsed = JSON.parse(jsonString)
      return prettify ? JSON.stringify(parsed, null, 2) : JSON.stringify(parsed)
    } catch (error) {
      throw new Error("Invalid JSON format")
    }
  }

  const addHeader = () => {
    const updatedHeaders = [...activeTab.request.headers, { key: "", value: "", enabled: true }]
    onRequestUpdate({ headers: updatedHeaders })
  }

  const updateHeader = (index: number, field: keyof Header, value: string | boolean) => {
    const updatedHeaders = activeTab.request.headers.map((header, i) =>
      i === index ? { ...header, [field]: value } : header,
    )
    onRequestUpdate({ headers: updatedHeaders })
  }

  const removeHeader = (index: number) => {
    const updatedHeaders = activeTab.request.headers.filter((_, i) => i !== index)
    onRequestUpdate({ headers: updatedHeaders })
  }

  const addFormField = () => {
    const updatedFormData = [...activeTab.request.formData, { key: "", value: "", type: "text" as const }]
    onRequestUpdate({ formData: updatedFormData })
  }

  const updateFormField = (index: number, field: string, value: any) => {
    const newFormData = [...activeTab.request.formData]
    newFormData[index] = { ...newFormData[index], [field]: value }
    onRequestUpdate({ formData: newFormData })
  }

  const removeFormField = (index: number) => {
    const newFormData = activeTab.request.formData.filter((_, i) => i !== index)
    onRequestUpdate({ formData: newFormData })
  }

  const handleSaveRequest = () => {
    if (collections.length === 0) {
      toast({
        title: "No collections available",
        description: "Please create a collection first before saving requests",
        variant: "destructive",
      })
      return
    }

    if (!newRequestName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a request name",
        variant: "destructive",
      })
      return
    }

    if (!selectedCollection) {
      toast({
        title: "Error",
        description: "Please select a collection",
        variant: "destructive",
      })
      return
    }

    onSaveRequest(newRequestName, selectedCollection)
    setShowSaveDialog(false)
    setNewRequestName("")
  }

  return (
    <div className="h-full flex flex-col">
      {/* Request Header */}
      <div className="border-b p-4 bg-muted/30">
        <div className="flex items-center space-x-2">
          <Select value={activeTab.request.method} onValueChange={(value) => onRequestUpdate({ method: value })}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="PATCH">PATCH</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
              <SelectItem value="HEAD">HEAD</SelectItem>
              <SelectItem value="OPTIONS">OPTIONS</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="{{baseUrl}}/api/users - Use environment variables"
            value={activeTab.request.url}
            onChange={(e) => onRequestUpdate({ url: e.target.value })}
            className="flex-1"
          />

          <Button onClick={onSendRequest} disabled={loading}>
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send
          </Button>

          <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="relative bg-transparent">
                <Save className="h-4 w-4" />
                {activeTab.hasUnsavedChanges && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
                )}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Request</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {collections.length === 0 && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      You need to create a collection first before saving requests.
                    </p>
                  </div>
                )}
                <div>
                  <Label htmlFor="request-name">Request Name</Label>
                  <Input
                    id="request-name"
                    placeholder="My API Request"
                    value={newRequestName}
                    onChange={(e) => setNewRequestName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="collection-select">Collection</Label>
                  <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a collection" />
                    </SelectTrigger>
                    <SelectContent>
                      {collections.map((collection) => (
                        <SelectItem key={collection.id} value={collection.id}>
                          {collection.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSaveRequest} className="w-full" disabled={collections.length === 0}>
                  Save Request
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Request Configuration - Now with more space */}
      <div className="flex-1 min-h-0 p-4">
        <Tabs defaultValue="headers" className="h-full flex flex-col">
          <TabsList>
            <TabsTrigger value="headers">Headers</TabsTrigger>
            <TabsTrigger value="body">Body</TabsTrigger>
            <TabsTrigger value="auth">Auth</TabsTrigger>
          </TabsList>

          <TabsContent value="headers" className="flex-1 min-h-0 space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Headers</h3>
              <Button size="sm" variant="outline" onClick={addHeader}>
                <Plus className="h-4 w-4" />
                Add Header
              </Button>
            </div>
            <div className="flex-1 min-h-0">
              <div className="h-full border rounded">
                <div className="h-full overflow-auto p-4 space-y-2">
                  {activeTab.request.headers.map((header, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={header.enabled}
                        onChange={(e) => updateHeader(index, "enabled", e.target.checked)}
                        className="rounded"
                      />
                      <Input
                        placeholder="Authorization"
                        value={header.key}
                        onChange={(e) => updateHeader(index, "key", e.target.value)}
                      />
                      <Input
                        placeholder="Bearer {{token}}"
                        value={header.value}
                        onChange={(e) => updateHeader(index, "value", e.target.value)}
                      />
                      <Button size="sm" variant="ghost" onClick={() => removeHeader(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="body" className="flex-1 min-h-0 space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Label>Body Type:</Label>
                <Select
                  value={activeTab.request.bodyType}
                  onValueChange={(value) => onRequestUpdate({ bodyType: value })}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="xml">XML</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="form-data">Form Data</SelectItem>
                    <SelectItem value="x-www-form-urlencoded">URL Encoded</SelectItem>
                    <SelectItem value="binary">Binary</SelectItem>
                    <SelectItem value="graphql">GraphQL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {activeTab.request.bodyType === "json" && (
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      try {
                        const formatted = formatJSON(activeTab.request.body, true)
                        onRequestUpdate({ body: formatted })
                        toast({ title: "JSON formatted" })
                      } catch (error) {
                        toast({
                          title: "Invalid JSON",
                          description: error instanceof Error ? error.message : "Cannot format JSON",
                          variant: "destructive",
                        })
                      }
                    }}
                  >
                    <Wand2 className="h-4 w-4" />
                    Prettify
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      try {
                        const minified = formatJSON(activeTab.request.body, false)
                        onRequestUpdate({ body: minified })
                        toast({ title: "JSON minified" })
                      } catch (error) {
                        toast({
                          title: "Invalid JSON",
                          description: error instanceof Error ? error.message : "Cannot minify JSON",
                          variant: "destructive",
                        })
                      }
                    }}
                  >
                    <Minimize2 className="h-4 w-4" />
                    Minify
                  </Button>
                </div>
              )}
            </div>

            <div className="flex-1 min-h-0">
              {activeTab.request.bodyType === "form-data" && (
                <div className="h-full flex flex-col space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium">Form Data</h4>
                    <Button size="sm" variant="outline" onClick={addFormField}>
                      <Plus className="h-4 w-4" />
                      Add Field
                    </Button>
                  </div>
                  <div className="flex-1 min-h-0 border rounded">
                    <div className="h-full overflow-auto p-4 space-y-2">
                      {activeTab.request.formData.map((field, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            placeholder="Key"
                            value={field.key}
                            onChange={(e) => updateFormField(index, "key", e.target.value)}
                          />
                          <Select
                            value={field.type}
                            onValueChange={(value: "text" | "file") => updateFormField(index, "type", value)}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="file">File</SelectItem>
                            </SelectContent>
                          </Select>
                          {field.type === "text" ? (
                            <Input
                              placeholder="{{username}} or static value"
                              value={field.value}
                              onChange={(e) => updateFormField(index, "value", e.target.value)}
                            />
                          ) : (
                            <Input
                              type="file"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  updateFormField(index, "file", file)
                                  updateFormField(index, "value", file.name)
                                }
                              }}
                            />
                          )}
                          <Button size="sm" variant="ghost" onClick={() => removeFormField(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab.request.bodyType === "x-www-form-urlencoded" && (
                <div className="h-full flex flex-col space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium">URL Encoded Data</h4>
                    <Button size="sm" variant="outline" onClick={addFormField}>
                      <Plus className="h-4 w-4" />
                      Add Field
                    </Button>
                  </div>
                  <div className="flex-1 min-h-0 border rounded">
                    <div className="h-full overflow-auto p-4 space-y-2">
                      {activeTab.request.formData.map((field, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            placeholder="Key"
                            value={field.key}
                            onChange={(e) => updateFormField(index, "key", e.target.value)}
                          />
                          <Input
                            placeholder="{{password}} or static value"
                            value={field.value}
                            onChange={(e) => updateFormField(index, "value", e.target.value)}
                          />
                          <Button size="sm" variant="ghost" onClick={() => removeFormField(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab.request.bodyType === "binary" && (
                <div className="h-full flex flex-col space-y-4">
                  <div>
                    <Label>Select Binary File</Label>
                    <Input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          onRequestUpdate({ files: [file] })
                        }
                      }}
                    />
                  </div>
                  {activeTab.request.files.length > 0 && (
                    <div className="p-4 bg-muted rounded">
                      <p className="text-sm">Selected file: {activeTab.request.files[0].name}</p>
                      <p className="text-xs text-muted-foreground">
                        Size: {Math.round(activeTab.request.files[0].size / 1024)}KB
                      </p>
                    </div>
                  )}
                </div>
              )}

              {["json", "xml", "text", "graphql"].includes(activeTab.request.bodyType) && (
                <div className="h-full border rounded">
                  <Textarea
                    placeholder={
                      activeTab.request.bodyType === "json"
                        ? '{\n  "username": "{{username}}",\n  "password": "{{password}}"\n}'
                        : activeTab.request.bodyType === "graphql"
                          ? "query { users { id name email } }"
                          : `Enter ${activeTab.request.bodyType.toUpperCase()} body...`
                    }
                    value={activeTab.request.body}
                    onChange={(e) => onRequestUpdate({ body: e.target.value })}
                    className="h-full min-h-[300px] font-mono resize-none border-0 focus-visible:ring-0"
                  />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="auth" className="flex-1 min-h-0 space-y-4 mt-4">
            <div>
              <Label>Authentication Type</Label>
              <Select
                value={activeTab.request.auth.type}
                onValueChange={(value) =>
                  onRequestUpdate({
                    auth: { ...activeTab.request.auth, type: value },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Auth</SelectItem>
                  <SelectItem value="basic">Basic Auth</SelectItem>
                  <SelectItem value="bearer">Bearer Token</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {activeTab.request.auth.type === "basic" && (
              <div className="space-y-2">
                <div>
                  <Label>Username</Label>
                  <Input
                    placeholder="{{username}} or static username"
                    value={activeTab.request.auth.username || ""}
                    onChange={(e) =>
                      onRequestUpdate({
                        auth: { ...activeTab.request.auth, username: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input
                    type="password"
                    placeholder="{{password}} or static password"
                    value={activeTab.request.auth.password || ""}
                    onChange={(e) =>
                      onRequestUpdate({
                        auth: { ...activeTab.request.auth, password: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            )}

            {activeTab.request.auth.type === "bearer" && (
              <div>
                <Label>Token</Label>
                <Input
                  placeholder="{{token}} or static bearer token"
                  value={activeTab.request.auth.token || ""}
                  onChange={(e) =>
                    onRequestUpdate({
                      auth: { ...activeTab.request.auth, token: e.target.value },
                    })
                  }
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
