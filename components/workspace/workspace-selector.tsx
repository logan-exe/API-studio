"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import type { Workspace } from "@/types/auth"
import { toast } from "@/hooks/use-toast"

interface WorkspaceSelectorProps {
  workspaces: Workspace[]
  currentWorkspace: Workspace | null
  onWorkspaceChange: (workspace: Workspace) => void
  onWorkspaceCreate: (workspace: Workspace) => void
}

export function WorkspaceSelector({
  workspaces,
  currentWorkspace,
  onWorkspaceChange,
  onWorkspaceCreate,
}: WorkspaceSelectorProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [workspaceName, setWorkspaceName] = useState("")
  const [workspaceDescription, setWorkspaceDescription] = useState("")
  const [loading, setLoading] = useState(false)

  const handleCreateWorkspace = async () => {
    if (!workspaceName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a workspace name",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workspaceName.trim(),
          description: workspaceDescription.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create workspace")
      }

      const workspace = await response.json()
      onWorkspaceCreate(workspace)
      setWorkspaceName("")
      setWorkspaceDescription("")
      setShowCreateDialog(false)

      toast({
        title: "Workspace created",
        description: `Created "${workspace.name}" workspace`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create workspace",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Select
        value={currentWorkspace?.id || ""}
        onValueChange={(value) => {
          const workspace = workspaces.find((w) => w.id === value)
          if (workspace) onWorkspaceChange(workspace)
        }}
      >
        <SelectTrigger className="w-64">
          <div className="flex items-center space-x-2">
            <span>{currentWorkspace?.name || "Select Workspace"}</span>
            {currentWorkspace?.role && (
              <Badge variant="secondary" className="text-xs">
                {currentWorkspace.role}
              </Badge>
            )}
          </div>
        </SelectTrigger>
        <SelectContent>
          {workspaces.map((workspace) => (
            <SelectItem key={workspace.id} value={workspace.id}>
              <div className="flex items-center justify-between w-full">
                <span>{workspace.name}</span>
                <Badge variant="outline" className="text-xs ml-2">
                  {workspace.role}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Workspace</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="workspace-name">Workspace Name</Label>
              <Input
                id="workspace-name"
                placeholder="My Team Workspace"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="workspace-description">Description (Optional)</Label>
              <Textarea
                id="workspace-description"
                placeholder="Describe your workspace..."
                value={workspaceDescription}
                onChange={(e) => setWorkspaceDescription(e.target.value)}
              />
            </div>
            <Button onClick={handleCreateWorkspace} className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Workspace"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
