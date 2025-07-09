"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Github,
  GitBranch,
  GitCommit,
  Star,
  ForkliftIcon as Fork,
  Download,
  Upload,
  Search,
  Calendar,
  User,
  FileText,
  Plus,
  Minus,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Repository {
  id: number
  name: string
  full_name: string
  description: string
  stars: number
  forks: number
  language: string
  updated_at: string
  private: boolean
}

interface Branch {
  name: string
  commit: {
    sha: string
    message: string
    author: string
    date: string
  }
}

interface Commit {
  sha: string
  message: string
  author: string
  date: string
  files_changed: number
  additions: number
  deletions: number
}

export function GitHubIntegration() {
  const [isConnected, setIsConnected] = useState(false)
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null)
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  const [commits, setCommits] = useState<Commit[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)

  // Mock data for demonstration
  const mockRepositories: Repository[] = [
    {
      id: 1,
      name: "api-collections",
      full_name: "user/api-collections",
      description: "Collection of API requests for various services",
      stars: 45,
      forks: 12,
      language: "JSON",
      updated_at: "2024-01-15T10:30:00Z",
      private: false,
    },
    {
      id: 2,
      name: "microservices-api",
      full_name: "user/microservices-api",
      description: "API documentation and testing for microservices",
      stars: 128,
      forks: 34,
      language: "JavaScript",
      updated_at: "2024-01-14T15:45:00Z",
      private: true,
    },
    {
      id: 3,
      name: "rest-api-tests",
      full_name: "user/rest-api-tests",
      description: "Automated testing suite for REST APIs",
      stars: 67,
      forks: 23,
      language: "TypeScript",
      updated_at: "2024-01-13T09:20:00Z",
      private: false,
    },
  ]

  const mockBranches: Branch[] = [
    {
      name: "main",
      commit: {
        sha: "abc123",
        message: "Add new payment API endpoints",
        author: "John Doe",
        date: "2024-01-15T10:30:00Z",
      },
    },
    {
      name: "feature/auth-endpoints",
      commit: {
        sha: "def456",
        message: "Implement OAuth2 authentication flow",
        author: "Jane Smith",
        date: "2024-01-14T16:20:00Z",
      },
    },
    {
      name: "develop",
      commit: {
        sha: "ghi789",
        message: "Update API documentation",
        author: "Bob Johnson",
        date: "2024-01-13T14:15:00Z",
      },
    },
  ]

  const mockCommits: Commit[] = [
    {
      sha: "abc123",
      message: "Add new payment API endpoints",
      author: "John Doe",
      date: "2024-01-15T10:30:00Z",
      files_changed: 3,
      additions: 45,
      deletions: 12,
    },
    {
      sha: "def456",
      message: "Implement OAuth2 authentication flow",
      author: "Jane Smith",
      date: "2024-01-14T16:20:00Z",
      files_changed: 5,
      additions: 78,
      deletions: 23,
    },
    {
      sha: "ghi789",
      message: "Update API documentation",
      author: "Bob Johnson",
      date: "2024-01-13T14:15:00Z",
      files_changed: 2,
      additions: 34,
      deletions: 8,
    },
    {
      sha: "jkl012",
      message: "Fix authentication middleware bug",
      author: "Alice Wilson",
      date: "2024-01-12T11:45:00Z",
      files_changed: 1,
      additions: 15,
      deletions: 20,
    },
  ]

  const handleConnect = async () => {
    setLoading(true)
    // Simulate GitHub OAuth flow
    setTimeout(() => {
      setIsConnected(true)
      setRepositories(mockRepositories)
      setLoading(false)
      toast({
        title: "Connected to GitHub",
        description: "Successfully connected to your GitHub account",
      })
    }, 2000)
  }

  const handleSelectRepository = (repo: Repository) => {
    setSelectedRepo(repo)
    setBranches(mockBranches)
    setSelectedBranch(mockBranches[0])
    setCommits(mockCommits)
  }

  const handleSelectBranch = (branch: Branch) => {
    setSelectedBranch(branch)
    setCommits(mockCommits)
  }

  const handleImportCollection = (commitSha: string) => {
    toast({
      title: "Collection Imported",
      description: `Successfully imported collection from commit ${commitSha.substring(0, 7)}`,
    })
  }

  const handleSyncToGitHub = () => {
    toast({
      title: "Synced to GitHub",
      description: "Your collections have been synced to GitHub",
    })
  }

  const filteredRepositories = repositories.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center space-x-2">
              <Github className="h-6 w-6" />
              <span>GitHub Integration</span>
            </h2>
            <p className="text-muted-foreground mt-1">
              Connect your GitHub repositories to sync and manage API collections
            </p>
          </div>
          {isConnected && (
            <Button onClick={handleSyncToGitHub} className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Sync to GitHub</span>
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {!isConnected ? (
          <div className="h-full flex items-center justify-center">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Github className="h-8 w-8" />
                </div>
                <CardTitle>Connect to GitHub</CardTitle>
                <CardDescription>
                  Connect your GitHub account to sync collections, manage versions, and collaborate with your team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleConnect} className="w-full" disabled={loading}>
                  {loading ? "Connecting..." : "Connect with GitHub"}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  We'll redirect you to GitHub to authorize the connection
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Tabs defaultValue="repositories" className="h-full flex flex-col">
            <TabsList className="mx-6 mt-4">
              <TabsTrigger value="repositories">Repositories</TabsTrigger>
              <TabsTrigger value="branches">Branches</TabsTrigger>
              <TabsTrigger value="commits">Commits</TabsTrigger>
              <TabsTrigger value="sync">Sync</TabsTrigger>
            </TabsList>

            <div className="flex-1 min-h-0 p-6">
              <TabsContent value="repositories" className="h-full mt-0">
                <div className="space-y-4 h-full flex flex-col">
                  <div className="flex items-center space-x-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search repositories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                    <Badge variant="secondary">{filteredRepositories.length} repositories</Badge>
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="space-y-3">
                      {filteredRepositories.map((repo) => (
                        <Card
                          key={repo.id}
                          className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                            selectedRepo?.id === repo.id ? "ring-2 ring-primary" : ""
                          }`}
                          onClick={() => handleSelectRepository(repo)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2 flex-1">
                                <div className="flex items-center space-x-2">
                                  <h3 className="font-medium">{repo.name}</h3>
                                  {repo.private && (
                                    <Badge variant="secondary" className="text-xs">
                                      Private
                                    </Badge>
                                  )}
                                </div>
                                {repo.description && (
                                  <p className="text-sm text-muted-foreground">{repo.description}</p>
                                )}
                                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                  <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                    <span>{repo.language}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Star className="h-3 w-3" />
                                    <span>{repo.stars}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Fork className="h-3 w-3" />
                                    <span>{repo.forks}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{formatDate(repo.updated_at)}</span>
                                  </div>
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

              <TabsContent value="branches" className="h-full mt-0">
                <div className="space-y-4 h-full flex flex-col">
                  {selectedRepo ? (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{selectedRepo.name}</h3>
                          <p className="text-sm text-muted-foreground">{branches.length} branches</p>
                        </div>
                      </div>

                      <ScrollArea className="flex-1">
                        <div className="space-y-3">
                          {branches.map((branch) => (
                            <Card
                              key={branch.name}
                              className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                                selectedBranch?.name === branch.name ? "ring-2 ring-primary" : ""
                              }`}
                              onClick={() => handleSelectBranch(branch)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="space-y-2 flex-1">
                                    <div className="flex items-center space-x-2">
                                      <GitBranch className="h-4 w-4" />
                                      <span className="font-medium">{branch.name}</span>
                                      {branch.name === "main" && (
                                        <Badge variant="default" className="text-xs">
                                          Default
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      <div className="flex items-center space-x-2">
                                        <GitCommit className="h-3 w-3" />
                                        <span>{branch.commit.message}</span>
                                      </div>
                                      <div className="flex items-center space-x-4 mt-1 text-xs">
                                        <div className="flex items-center space-x-1">
                                          <User className="h-3 w-3" />
                                          <span>{branch.commit.author}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                          <Calendar className="h-3 w-3" />
                                          <span>{formatDate(branch.commit.date)}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <GitBranch className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">Select a repository to view branches</p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="commits" className="h-full mt-0">
                <div className="space-y-4 h-full flex flex-col">
                  {selectedBranch ? (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">
                            {selectedRepo?.name} / {selectedBranch.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">{commits.length} commits</p>
                        </div>
                      </div>

                      <ScrollArea className="flex-1">
                        <div className="space-y-3">
                          {commits.map((commit) => (
                            <Card key={commit.sha}>
                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between">
                                    <div className="space-y-1 flex-1">
                                      <p className="font-medium">{commit.message}</p>
                                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                        <div className="flex items-center space-x-1">
                                          <User className="h-3 w-3" />
                                          <span>{commit.author}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                          <Calendar className="h-3 w-3" />
                                          <span>{formatDate(commit.date)}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                          <GitCommit className="h-3 w-3" />
                                          <span>{commit.sha.substring(0, 7)}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleImportCollection(commit.sha)}
                                    >
                                      <Download className="h-4 w-4 mr-1" />
                                      Import
                                    </Button>
                                  </div>

                                  <Separator />

                                  <div className="flex items-center space-x-6 text-xs">
                                    <div className="flex items-center space-x-1">
                                      <FileText className="h-3 w-3" />
                                      <span>{commit.files_changed} files changed</span>
                                    </div>
                                    <div className="flex items-center space-x-1 text-green-600">
                                      <Plus className="h-3 w-3" />
                                      <span>{commit.additions} additions</span>
                                    </div>
                                    <div className="flex items-center space-x-1 text-red-600">
                                      <Minus className="h-3 w-3" />
                                      <span>{commit.deletions} deletions</span>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <GitCommit className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">Select a branch to view commits</p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="sync" className="h-full mt-0">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Upload className="h-5 w-5" />
                        <span>Sync Collections to GitHub</span>
                      </CardTitle>
                      <CardDescription>Push your API Studio collections to your GitHub repository</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">My API Collections</p>
                          <p className="text-sm text-muted-foreground">5 collections, 23 requests</p>
                        </div>
                        <Button onClick={handleSyncToGitHub}>
                          <Upload className="h-4 w-4 mr-2" />
                          Push to GitHub
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Download className="h-5 w-5" />
                        <span>Import from GitHub</span>
                      </CardTitle>
                      <CardDescription>Import API collections from your GitHub repositories</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedRepo && (
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <p className="font-medium">{selectedRepo.name}</p>
                            <p className="text-sm text-muted-foreground">{selectedBranch?.name || "main"} branch</p>
                          </div>
                          <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Import Collections
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        )}
      </div>
    </div>
  )
}
