"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Github, GitBranch, GitCommit, FileText, Download, Upload, CheckCircle, Folder } from "lucide-react"
import type { Workspace, Collection } from "@/types/auth"
import { toast } from "@/hooks/use-toast"

interface GitHubIntegrationProps {
  workspace: Workspace | null
  onClose: () => void
  onCollectionImported: (collection: Collection) => void
}

interface GitHubRepo {
  id: string
  name: string
  full_name: string
  description: string
  default_branch: string
  updated_at: string
}

interface GitHubBranch {
  name: string
  commit: {
    sha: string
    message: string
    author: {
      name: string
      date: string
    }
  }
}

interface GitHubCommit {
  sha: string
  message: string
  author: {
    name: string
    date: string
  }
  files: {
    filename: string
    status: string
    additions: number
    deletions: number
  }[]
}

export function GitHubIntegration({ workspace, onClose, onCollectionImported }: GitHubIntegrationProps) {
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null)
  const [branches, setBranches] = useState<GitHubBranch[]>([])
  const [selectedBranch, setSelectedBranch] = useState<string>("")
  const [commits, setCommits] = useState<GitHubCommit[]>([])
  const [activeTab, setActiveTab] = useState("connect")

  // Mock data for demonstration
  const mockRepos: GitHubRepo[] = [
    {
      id: "1",
      name: "api-collections",
      full_name: "user/api-collections",
      description: "API collection repository",
      default_branch: "main",
      updated_at: "2024-01-15T10:30:00Z",
    },
    {
      id: "2",
      name: "microservices-api",
      full_name: "user/microservices-api",
      description: "Microservices API documentation",
      default_branch: "main",
      updated_at: "2024-01-14T15:45:00Z",
    },
    {
      id: "3",
      name: "rest-api-tests",
      full_name: "user/rest-api-tests",
      description: "REST API test collections",
      default_branch: "develop",
      updated_at: "2024-01-13T09:20:00Z",
    },
  ]

  const mockBranches: GitHubBranch[] = [
    {
      name: "main",
      commit: {
        sha: "abc123",
        message: "Update API endpoints",
        author: {
          name: "John Doe",
          date: "2024-01-15T10:30:00Z",
        },
      },
    },
    {
      name: "develop",
      commit: {
        sha: "def456",
        message: "Add new authentication endpoints",
        author: {
          name: "Jane Smith",
          date: "2024-01-14T16:20:00Z",
        },
      },
    },
    {
      name: "feature/user-api",
      commit: {
        sha: "ghi789",
        message: "Implement user management API",
        author: {
          name: "Bob Johnson",
          date: "2024-01-13T14:15:00Z",
        },
      },
    },
  ]

  const mockCommits: GitHubCommit[] = [
    {
      sha: "abc123",
      message: "Update API endpoints",
      author: {
        name: "John Doe",
        date: "2024-01-15T10:30:00Z",
      },
      files: [
        {
          filename: "collections/users.json",
          status: "modified",
          additions: 15,
          deletions: 3,
        },
        {
          filename: "collections/auth.json",
          status: "added",
          additions: 45,
          deletions: 0,
        },
      ],
    },
    {
      sha: "def456",
      message: "Add new authentication endpoints",
      author: {
        name: "Jane Smith",
        date: "2024-01-14T16:20:00Z",
      },
      files: [
        {
          filename: "collections/auth.json",
          status: "modified",
          additions: 23,
          deletions: 5,
        },
      ],
    },
  ]

  const handleConnect = async () => {
    setLoading(true)
    try {
      // Simulate GitHub OAuth flow
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setConnected(true)
      setRepos(mockRepos)
      setActiveTab("repos")
      toast({
        title: "GitHub Connected",
        description: "Successfully connected to GitHub",
      })
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to GitHub",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRepoSelect = async (repo: GitHubRepo) => {
    setSelectedRepo(repo)
    setLoading(true)
    try {
      // Simulate fetching branches
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setBranches(mockBranches)
      setSelectedBranch(repo.default_branch)
      setActiveTab("branches")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch branches",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBranchSelect = async (branchName: string) => {
    setSelectedBranch(branchName)
    setLoading(true)
    try {
      // Simulate fetching commits
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setCommits(mockCommits)
      setActiveTab("commits")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch commits",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImportCollection = async (filename: string) => {
    setLoading(true)
    try {
      // Simulate importing collection
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const collection: Collection = {
        id: Date.now().toString(),
        name: filename.replace(".json", ""),
        description: `Imported from ${selectedRepo?.full_name}/${selectedBranch}`,
        requests: [],
        workspace_id: workspace?.id || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      onCollectionImported(collection)
      toast({
        title: "Collection Imported",
        description: `Successfully imported ${filename}`,
      })
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import collection",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSyncToGitHub = async () => {
    setLoading(true)
    try {
      // Simulate syncing to GitHub
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast({
        title: "Sync Complete",
        description: "Collections synced to GitHub successfully",
      })
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync to GitHub",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Github className="w-5 h-5" />
            <span>GitHub Integration</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="connect" className="flex items-center space-x-2">
                <Github className="w-4 h-4" />
                <span>Connect</span>
              </TabsTrigger>
              <TabsTrigger value="repos" disabled={!connected} className="flex items-center space-x-2">
                <Folder className="w-4 h-4" />
                <span>Repositories</span>
              </TabsTrigger>
              <TabsTrigger value="branches" disabled={!selectedRepo} className="flex items-center space-x-2">
                <GitBranch className="w-4 h-4" />
                <span>Branches</span>
              </TabsTrigger>
              <TabsTrigger value="commits" disabled={!selectedBranch} className="flex items-center space-x-2">
                <GitCommit className="w-4 h-4" />
                <span>Commits</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 mt-4 overflow-hidden">
              <TabsContent value="connect" className="h-full">
                <div className="flex flex-col items-center justify-center h-full space-y-6">
                  <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center">
                    <Github className="w-12 h-12 text-slate-600" />
                  </div>

                  {!connected ? (
                    <>
                      <div className="text-center">
                        <h3 className="text-xl font-semibold mb-2">Connect to GitHub</h3>
                        <p className="text-slate-600 mb-6">
                          Connect your GitHub account to sync API collections, manage branches, and track commits
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Card>
                          <CardContent className="p-4 text-center">
                            <Download className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                            <h4 className="font-medium">Import Collections</h4>
                            <p className="text-sm text-slate-600">Import API collections from your repositories</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <Upload className="w-8 h-8 text-green-600 mx-auto mb-2" />
                            <h4 className="font-medium">Sync Collections</h4>
                            <p className="text-sm text-slate-600">Push your collections back to GitHub</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <GitBranch className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                            <h4 className="font-medium">Branch Management</h4>
                            <p className="text-sm text-slate-600">Work with different branches and commits</p>
                          </CardContent>
                        </Card>
                      </div>

                      <Button onClick={handleConnect} disabled={loading} size="lg">
                        {loading ? "Connecting..." : "Connect GitHub Account"}
                        <Github className="ml-2 w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-2 text-green-600 mb-4">
                        <CheckCircle className="w-6 h-6" />
                        <span className="text-lg font-medium">Connected to GitHub</span>
                      </div>
                      <p className="text-slate-600 mb-6">You can now access your repositories and manage collections</p>
                      <Button onClick={() => setActiveTab("repos")}>Browse Repositories</Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="repos" className="h-full">
                <div className="space-y-4 h-full flex flex-col">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Your Repositories</h3>
                    <Button onClick={handleSyncToGitHub} variant="outline" disabled={loading}>
                      <Upload className="w-4 h-4 mr-2" />
                      Sync to GitHub
                    </Button>
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="space-y-3">
                      {repos.map((repo) => (
                        <Card key={repo.id} className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Folder className="w-4 h-4 text-blue-600" />
                                  <h4 className="font-medium">{repo.name}</h4>
                                  <Badge variant="secondary">{repo.default_branch}</Badge>
                                </div>
                                <p className="text-sm text-slate-600 mb-2">{repo.description}</p>
                                <p className="text-xs text-slate-500">
                                  Updated {new Date(repo.updated_at).toLocaleDateString()}
                                </p>
                              </div>
                              <Button onClick={() => handleRepoSelect(repo)} disabled={loading}>
                                Select
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="branches" className="h-full">
                <div className="space-y-4 h-full flex flex-col">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Branches</h3>
                      <p className="text-sm text-slate-600">{selectedRepo?.full_name}</p>
                    </div>
                    <Button onClick={() => setActiveTab("repos")} variant="outline">
                      Back to Repos
                    </Button>
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="space-y-3">
                      {branches.map((branch) => (
                        <Card key={branch.name} className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <GitBranch className="w-4 h-4 text-green-600" />
                                  <h4 className="font-medium">{branch.name}</h4>
                                  {branch.name === selectedRepo?.default_branch && (
                                    <Badge variant="default">Default</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-slate-600 mb-1">{branch.commit.message}</p>
                                <p className="text-xs text-slate-500">
                                  {branch.commit.author.name} •{" "}
                                  {new Date(branch.commit.author.date).toLocaleDateString()}
                                </p>
                              </div>
                              <Button onClick={() => handleBranchSelect(branch.name)} disabled={loading}>
                                View Commits
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="commits" className="h-full">
                <div className="space-y-4 h-full flex flex-col">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Recent Commits</h3>
                      <p className="text-sm text-slate-600">
                        {selectedRepo?.full_name} / {selectedBranch}
                      </p>
                    </div>
                    <Button onClick={() => setActiveTab("branches")} variant="outline">
                      Back to Branches
                    </Button>
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="space-y-4">
                      {commits.map((commit) => (
                        <Card key={commit.sha}>
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              <GitCommit className="w-5 h-5 text-slate-600 mt-0.5" />
                              <div className="flex-1">
                                <h4 className="font-medium mb-1">{commit.message}</h4>
                                <p className="text-sm text-slate-600 mb-3">
                                  {commit.author.name} • {new Date(commit.author.date).toLocaleDateString()}
                                </p>

                                <div className="space-y-2">
                                  <h5 className="text-sm font-medium">Changed Files:</h5>
                                  {commit.files.map((file, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between p-2 bg-slate-50 rounded"
                                    >
                                      <div className="flex items-center space-x-2">
                                        <FileText className="w-4 h-4 text-slate-600" />
                                        <span className="text-sm font-mono">{file.filename}</span>
                                        <Badge
                                          variant={
                                            file.status === "added"
                                              ? "default"
                                              : file.status === "modified"
                                                ? "secondary"
                                                : "destructive"
                                          }
                                        >
                                          {file.status}
                                        </Badge>
                                      </div>
                                      {file.filename.endsWith(".json") && (
                                        <Button
                                          size="sm"
                                          onClick={() => handleImportCollection(file.filename)}
                                          disabled={loading}
                                        >
                                          <Download className="w-3 h-3 mr-1" />
                                          Import
                                        </Button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
