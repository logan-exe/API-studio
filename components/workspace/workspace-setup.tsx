"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, Github, Upload, Play, Users, Zap, FileText, ArrowRight, CheckCircle, X } from "lucide-react"
import type { User, Workspace } from "@/types/auth"
import { toast } from "@/hooks/use-toast"

interface WorkspaceSetupProps {
  user: User | null
  onWorkspaceCreated: (workspace: Workspace) => void
  onSkip: () => void
  onSignIn: () => void
}

export function WorkspaceSetup({ user, onWorkspaceCreated, onSkip, onSignIn }: WorkspaceSetupProps) {
  const [activeTab, setActiveTab] = useState("create")
  const [workspaceName, setWorkspaceName] = useState("")
  const [workspaceDescription, setWorkspaceDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [githubConnected, setGithubConnected] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)

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
      if (user) {
        // Create workspace for authenticated user
        const response = await fetch("/api/workspaces", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: workspaceName.trim(),
            description: workspaceDescription.trim(),
            owner_id: user.id,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to create workspace")
        }

        const data = await response.json()
        onWorkspaceCreated(data.workspace)
      } else {
        // Create local workspace for anonymous user
        const workspace: Workspace = {
          id: `local-${Date.now()}`,
          name: workspaceName.trim(),
          description: workspaceDescription.trim(),
          owner_id: "anonymous",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          role: "owner",
        }
        onWorkspaceCreated(workspace)
      }

      toast({
        title: "Workspace created",
        description: `Created "${workspaceName}" workspace`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create workspace",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGithubConnect = async () => {
    // Simulate GitHub connection
    setGithubConnected(true)
    toast({
      title: "GitHub Connected",
      description: "Successfully connected to GitHub",
    })
  }

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setImportFile(file)
      toast({
        title: "File Selected",
        description: `Selected ${file.name} for import`,
      })
    }
  }

  const handleImportPostman = async () => {
    if (!importFile) {
      toast({
        title: "Error",
        description: "Please select a Postman collection file",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Simulate import process
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Import Successful",
        description: `Imported ${importFile.name} successfully`,
      })

      // Create workspace with imported data
      const workspace: Workspace = {
        id: `imported-${Date.now()}`,
        name: `Imported from ${importFile.name}`,
        description: "Workspace created from Postman import",
        owner_id: user?.id || "anonymous",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        role: "owner",
      }
      onWorkspaceCreated(workspace)
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import Postman collection",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              API Studio
            </h1>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome to API Studio</h2>
          <p className="text-slate-600">Let's set up your workspace to get started</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Setup Your Workspace</CardTitle>
                <CardDescription>Choose how you'd like to get started</CardDescription>
              </div>
              {!user && (
                <Button variant="outline" onClick={onSignIn}>
                  Sign In for More Features
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="create" className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Create New</span>
                </TabsTrigger>
                <TabsTrigger value="github" className="flex items-center space-x-2">
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                </TabsTrigger>
                <TabsTrigger value="import" className="flex items-center space-x-2">
                  <Upload className="w-4 h-4" />
                  <span>Import</span>
                </TabsTrigger>
                <TabsTrigger value="runner" className="flex items-center space-x-2">
                  <Play className="w-4 h-4" />
                  <span>Runner</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="workspace-name">Workspace Name</Label>
                    <Input
                      id="workspace-name"
                      placeholder="My API Workspace"
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
                </div>

                <div className="flex items-center justify-between pt-4">
                  <Button variant="outline" onClick={onSkip}>
                    Skip & Use Anonymous
                  </Button>
                  <Button onClick={handleCreateWorkspace} disabled={loading}>
                    {loading ? "Creating..." : "Create Workspace"}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="github" className="space-y-6 mt-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                    <Github className="w-8 h-8 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Connect with GitHub</h3>
                    <p className="text-slate-600">Import your repositories and sync your API collections with GitHub</p>
                  </div>

                  {githubConnected ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center space-x-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span>Connected to GitHub</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <FileText className="w-4 h-4" />
                              <span className="font-medium">my-api-project</span>
                            </div>
                            <p className="text-sm text-slate-600">REST API for e-commerce</p>
                            <Button size="sm" className="mt-2 w-full">
                              Import
                            </Button>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <FileText className="w-4 h-4" />
                              <span className="font-medium">user-service</span>
                            </div>
                            <p className="text-sm text-slate-600">User management API</p>
                            <Button size="sm" className="mt-2 w-full">
                              Import
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ) : (
                    <Button onClick={handleGithubConnect} className="w-full">
                      <Github className="mr-2 w-4 h-4" />
                      Connect GitHub Account
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4">
                  <Button variant="outline" onClick={onSkip}>
                    Skip for Now
                  </Button>
                  {githubConnected && (
                    <Button onClick={() => onSkip()}>
                      Continue
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="import" className="space-y-6 mt-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="w-8 h-8 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Import Collections</h3>
                    <p className="text-slate-600">
                      Import your existing API collections from Postman, Insomnia, or other tools
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4 text-center">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <FileText className="w-6 h-6 text-orange-600" />
                        </div>
                        <h4 className="font-medium">Postman</h4>
                        <p className="text-sm text-slate-600">Import .json collections</p>
                      </CardContent>
                    </Card>
                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4 text-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <FileText className="w-6 h-6 text-purple-600" />
                        </div>
                        <h4 className="font-medium">Insomnia</h4>
                        <p className="text-sm text-slate-600">Import .json exports</p>
                      </CardContent>
                    </Card>
                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4 text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <h4 className="font-medium">OpenAPI</h4>
                        <p className="text-sm text-slate-600">Import .yaml/.json specs</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-8">
                      <input
                        type="file"
                        accept=".json,.yaml,.yml"
                        onChange={handleFileImport}
                        className="hidden"
                        id="file-import"
                      />
                      <label htmlFor="file-import" className="cursor-pointer">
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-slate-600">
                            {importFile ? importFile.name : "Click to select file or drag and drop"}
                          </p>
                          <p className="text-sm text-slate-500">Supports JSON, YAML files</p>
                        </div>
                      </label>
                    </div>

                    {importFile && (
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium">{importFile.name}</span>
                          <Badge variant="secondary">Ready to import</Badge>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => setImportFile(null)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <Button variant="outline" onClick={onSkip}>
                    Skip Import
                  </Button>
                  <Button onClick={handleImportPostman} disabled={!importFile || loading}>
                    {loading ? "Importing..." : "Import Collection"}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="runner" className="space-y-6 mt-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                    <Play className="w-8 h-8 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Collection Runner</h3>
                    <p className="text-slate-600">
                      Run automated tests and monitor your APIs with our powerful collection runner
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">Automated Testing</h4>
                            <p className="text-sm text-slate-600">Run tests automatically</p>
                          </div>
                        </div>
                        <ul className="space-y-2 text-sm text-slate-600">
                          <li>• Schedule test runs</li>
                          <li>• Environment variables</li>
                          <li>• Test assertions</li>
                          <li>• Detailed reports</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">Team Collaboration</h4>
                            <p className="text-sm text-slate-600">Share with your team</p>
                          </div>
                        </div>
                        <ul className="space-y-2 text-sm text-slate-600">
                          <li>• Shared workspaces</li>
                          <li>• Real-time updates</li>
                          <li>• Team permissions</li>
                          <li>• Activity tracking</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-900">Ready to start testing?</h4>
                        <p className="text-slate-600">Create a workspace and start building your first collection</p>
                      </div>
                      <Button>
                        Get Started
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <Button variant="outline" onClick={onSkip}>
                    Skip for Now
                  </Button>
                  <Button onClick={() => setActiveTab("create")}>
                    Create Workspace
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-slate-500">
            Need help getting started?{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Check our documentation
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
