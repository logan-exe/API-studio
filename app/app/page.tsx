"use client"

import { useState, useEffect } from "react"
import { AuthForm } from "@/components/auth/auth-form"
import { WorkspaceSelector } from "@/components/workspace/workspace-selector"
import { GitHubIntegration } from "@/components/github/github-integration"
import { useAPIStudio } from "@/hooks/use-api-studio"
import { RequestTabs } from "@/components/request-tabs"
import { Sidebar } from "@/components/sidebar"
import { RequestForm } from "@/components/request-form"
import { ResponsePanel } from "@/components/response-panel"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Moon, Sun, User, Github } from "lucide-react"
import type { RequestData, ResponseData } from "@/types/api-studio"
import type { User as AuthUser, Workspace } from "@/types/auth"
import { getCurrentUser, signOut, isLocalEnvironment } from "@/lib/auth"
import { toast } from "@/hooks/use-toast"
import { WorkspaceSetup } from "@/components/workspace/workspace-setup"
import { useTheme } from "@/hooks/use-theme"

export default function APIStudio() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAuth, setShowAuth] = useState(false)
  const [showWorkspaceSetup, setShowWorkspaceSetup] = useState(false)
  const [showGitHub, setShowGitHub] = useState(false)

  const { theme, setTheme } = useTheme()
  const isLocal = isLocalEnvironment()

  const {
    tabs,
    setTabs,
    activeTabId,
    setActiveTabId,
    activeTab,
    collections,
    setCollections,
    environments,
    setEnvironments,
    activeEnvironment,
    setActiveEnvironment,
    createNewTab,
    loadRequestInNewTab,
    replaceEnvironmentVariables,
  } = useAPIStudio()

  const [requestLoading, setRequestLoading] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user) {
      fetchWorkspaces()
    } else {
      // For anonymous users, create a local workspace
      const anonymousWorkspace: Workspace = {
        id: "anonymous-workspace",
        name: "My Workspace",
        description: "Anonymous workspace",
        owner_id: "anonymous",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        role: "owner",
      }
      setWorkspaces([anonymousWorkspace])
      setCurrentWorkspace(anonymousWorkspace)
    }
  }, [user])

  useEffect(() => {
    if (currentWorkspace && !isLocal && user) {
      fetchCollections()
      fetchEnvironments()
    }
  }, [currentWorkspace, user])

  const checkAuth = async () => {
    try {
      const { user: currentUser, error } = await getCurrentUser()

      if (error) {
        console.warn("Auth warning:", error.message)
        // Don't show error to user for auth issues, just continue as anonymous
      }

      setUser(currentUser)
    } catch (error) {
      console.warn("Auth check failed:", error)
      // Continue as anonymous user
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchWorkspaces = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/workspaces?userId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setWorkspaces(data.workspaces || [])

        if (data.workspaces && data.workspaces.length > 0) {
          setCurrentWorkspace(data.workspaces[0])
        } else {
          setShowWorkspaceSetup(true)
        }
      }
    } catch (error) {
      console.error("Failed to fetch workspaces:", error)
      setShowWorkspaceSetup(true)
    }
  }

  const fetchCollections = async () => {
    if (!currentWorkspace || !user) return

    try {
      const response = await fetch(`/api/workspaces/${currentWorkspace.id}/collections`)
      if (response.ok) {
        const data = await response.json()
        setCollections(data.map((col: any) => ({ ...col, requests: col.requests || [] })))
      }
    } catch (error) {
      console.error("Failed to fetch collections:", error)
    }
  }

  const fetchEnvironments = async () => {
    if (!currentWorkspace || !user) return

    try {
      const response = await fetch(`/api/workspaces/${currentWorkspace.id}/environments`)
      if (response.ok) {
        const data = await response.json()
        setEnvironments(data)
      }
    } catch (error) {
      console.error("Failed to fetch environments:", error)
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await signOut()

      if (error) {
        toast({
          title: "Sign Out Failed",
          description: error.message || "Failed to sign out. Please try again.",
          variant: "destructive",
        })
        return
      }

      setUser(null)
      setWorkspaces([])
      setCurrentWorkspace(null)
      setShowAuth(false)
      setShowWorkspaceSetup(false)

      toast({
        title: "Signed Out Successfully",
        description: "You have been signed out of API Studio.",
      })

      if (isLocal) {
        window.location.reload()
      }
    } catch (error) {
      toast({
        title: "Sign Out Error",
        description: "An unexpected error occurred while signing out.",
        variant: "destructive",
      })
    }
  }

  const handleWorkspaceCreated = (workspace: Workspace) => {
    setWorkspaces([...workspaces, workspace])
    setCurrentWorkspace(workspace)
    setShowWorkspaceSetup(false)
    toast({
      title: "Workspace Created",
      description: `Successfully created workspace: ${workspace.name}`,
    })
  }

  const updateActiveTab = (updates: Partial<typeof activeTab>) => {
    if (!activeTab) return
    setTabs((prev) => prev.map((tab) => (tab.id === activeTabId ? { ...tab, ...updates } : tab)))
  }

  const updateActiveRequest = (updates: Partial<RequestData>) => {
    if (!activeTab) return
    const updatedRequest = { ...activeTab.request, ...updates }
    updateActiveTab({ request: updatedRequest })
  }

  const closeTab = (tabId: string) => {
    setTabs((prev) => prev.filter((tab) => tab.id !== tabId))
    if (activeTabId === tabId) {
      const remainingTabs = tabs.filter((tab) => tab.id !== tabId)
      setActiveTabId(remainingTabs[0]?.id || "")
    }
  }

  const sendRequest = async () => {
    if (!activeTab || !activeTab.request.url.trim()) {
      toast({
        title: "Invalid Request",
        description: "Please enter a valid URL before sending the request.",
        variant: "destructive",
      })
      return
    }

    setRequestLoading(true)
    const startTime = Date.now()

    try {
      const url = replaceEnvironmentVariables(activeTab.request.url)
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
      }

      // Add enabled headers
      activeTab.request.headers.forEach((header) => {
        if (header.enabled && header.key.trim() && header.value.trim()) {
          headers[header.key] = replaceEnvironmentVariables(header.value)
        }
      })

      // Add authentication headers
      if (
        activeTab.request.auth.type === "basic" &&
        activeTab.request.auth.username &&
        activeTab.request.auth.password
      ) {
        const credentials = btoa(`${activeTab.request.auth.username}:${activeTab.request.auth.password}`)
        headers["Authorization"] = `Basic ${credentials}`
      } else if (activeTab.request.auth.type === "bearer" && activeTab.request.auth.token) {
        headers["Authorization"] = `Bearer ${replaceEnvironmentVariables(activeTab.request.auth.token)}`
      }

      const requestOptions: RequestInit = {
        method: activeTab.request.method,
        headers,
      }

      // Handle different body types - always convert to JSON
      if (["POST", "PUT", "PATCH"].includes(activeTab.request.method)) {
        let bodyData: any = {}

        if (activeTab.request.bodyType === "json" && activeTab.request.body.trim()) {
          try {
            bodyData = JSON.parse(replaceEnvironmentVariables(activeTab.request.body))
          } catch (e) {
            bodyData = { raw: replaceEnvironmentVariables(activeTab.request.body) }
          }
        } else if (activeTab.request.bodyType === "form-data") {
          bodyData = {}
          activeTab.request.formData.forEach((field) => {
            if (field.key.trim()) {
              bodyData[field.key] = field.type === "file" ? field.file?.name || field.value : field.value
            }
          })
        } else if (activeTab.request.bodyType === "x-www-form-urlencoded") {
          bodyData = {}
          activeTab.request.formData.forEach((field) => {
            if (field.key.trim()) {
              bodyData[field.key] = field.value
            }
          })
        }

        requestOptions.body = JSON.stringify(bodyData)
      }

      const response = await fetch(url, requestOptions)
      const responseText = await response.text()
      const endTime = Date.now()

      const responseData: ResponseData = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseText,
        time: endTime - startTime,
        size: new Blob([responseText]).size,
      }

      updateActiveTab({ response: responseData })

      toast({
        title: "Request Sent",
        description: `Response received with status ${response.status}`,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      const errorResponse: ResponseData = {
        status: 0,
        statusText: "Network Error",
        headers: {},
        body: JSON.stringify({ error: errorMessage }, null, 2),
        time: Date.now() - startTime,
        size: 0,
      }

      updateActiveTab({ response: errorResponse })

      toast({
        title: "Request Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setRequestLoading(false)
    }
  }

  const saveRequest = async (name: string, collectionId: string) => {
    if (!activeTab || !currentWorkspace) {
      toast({
        title: "Save Failed",
        description: "Unable to save request. Please try again.",
        variant: "destructive",
      })
      return
    }

    // Convert request to JSON format
    const requestData = {
      name,
      method: activeTab.request.method,
      url: activeTab.request.url,
      headers: activeTab.request.headers.reduce(
        (acc, header) => {
          if (header.enabled && header.key.trim()) {
            acc[header.key] = header.value
          }
          return acc
        },
        {} as Record<string, string>,
      ),
      body: activeTab.request.body ? JSON.parse(activeTab.request.body || "{}") : {},
      auth: activeTab.request.auth,
      collection_id: collectionId,
    }

    // For anonymous users or local development, simulate saving
    if (!user || currentWorkspace.id === "anonymous-workspace" || isLocal) {
      const savedRequest = {
        id: Date.now().toString(),
        ...requestData,
        body_type: activeTab.request.bodyType,
        form_data: activeTab.request.formData,
      }

      setCollections((prev) =>
        prev.map((collection) =>
          collection.id === collectionId
            ? { ...collection, requests: [...collection.requests, savedRequest] }
            : collection,
        ),
      )

      updateActiveTab({
        originalRequest: { ...activeTab.request, id: savedRequest.id, name },
        hasUnsavedChanges: false,
        name,
      })

      toast({
        title: "Request Saved",
        description: `Successfully saved "${name}" to collection.`,
      })
      return
    }

    try {
      const response = await fetch(`/api/workspaces/${currentWorkspace.id}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        throw new Error(`Failed to save request: ${response.status}`)
      }

      const savedRequest = await response.json()

      setCollections((prev) =>
        prev.map((collection) =>
          collection.id === collectionId
            ? { ...collection, requests: [...collection.requests, savedRequest] }
            : collection,
        ),
      )

      updateActiveTab({
        originalRequest: { ...activeTab.request, id: savedRequest.id, name },
        hasUnsavedChanges: false,
        name,
      })

      toast({
        title: "Request Saved",
        description: `Successfully saved "${name}" to collection.`,
      })
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save request. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Helper function to get user initials safely
  const getUserInitials = (user: AuthUser) => {
    if (user.full_name) {
      return user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    if (user.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    return user.email?.charAt(0).toUpperCase() || "U"
  }

  // Helper function to get default avatar
  const getDefaultAvatar = (user: AuthUser) => {
    const initials = getUserInitials(user)
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ]
    const colorIndex = (user.email?.charCodeAt(0) || 0) % colors.length
    return { initials, color: colors[colorIndex] }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (showAuth) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <AuthForm onSuccess={() => setShowAuth(false)} />
      </div>
    )
  }

  if (showWorkspaceSetup) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <WorkspaceSetup
          user={user}
          onWorkspaceCreated={handleWorkspaceCreated}
          onSkip={() => setShowWorkspaceSetup(false)}
          onSignIn={() => setShowAuth(true)}
        />
      </div>
    )
  }

  // Create a default tab if none exists
  if (tabs.length === 0) {
    createNewTab()
  }

  // Get the current active tab or create a default one
  const currentActiveTab = activeTab || {
    id: "default",
    name: "New Request",
    request: {
      id: "default",
      name: "New Request",
      method: "GET",
      url: "",
      headers: [],
      body: "",
      bodyType: "json",
      files: [],
      formData: [],
      auth: { type: "none" },
    },
    response: null,
    hasUnsavedChanges: false,
    originalRequest: null,
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">AS</span>
              </div>
              <span className="font-semibold">API Studio</span>
            </div>
            {currentWorkspace && (
              <div className="flex items-center space-x-2">
                <span className="text-muted-foreground">/</span>
                <WorkspaceSelector
                  workspaces={workspaces}
                  currentWorkspace={currentWorkspace}
                  onWorkspaceChange={setCurrentWorkspace}
                  onWorkspaceCreate={(workspace) => {
                    setWorkspaces([...workspaces, workspace])
                    setCurrentWorkspace(workspace)
                    toast({
                      title: "Workspace Created",
                      description: `Successfully created workspace: ${workspace.name}`,
                    })
                  }}
                />
              </div>
            )}
          </div>

          <div className="ml-auto flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowGitHub(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-muted-foreground hover:text-foreground"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url || "/placeholder-user.jpg"} alt={user.full_name || "User"} />
                      <AvatarFallback className={`${getDefaultAvatar(user).color} text-white`}>
                        {getDefaultAvatar(user).initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {user.full_name && <p className="font-medium">{user.full_name}</p>}
                      {user.email && <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setShowAuth(true)}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          collections={collections}
          setCollections={setCollections}
          environments={environments}
          setEnvironments={setEnvironments}
          activeEnvironment={activeEnvironment}
          setActiveEnvironment={setActiveEnvironment}
          onRequestSelect={loadRequestInNewTab}
          currentWorkspace={currentWorkspace}
          user={user}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <RequestTabs
            tabs={tabs}
            activeTabId={activeTabId}
            onTabChange={setActiveTabId}
            onTabClose={closeTab}
            onNewTab={createNewTab}
          />

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col border-r">
              <RequestForm
                activeTab={currentActiveTab}
                collections={collections || []}
                loading={requestLoading}
                onRequestUpdate={updateActiveRequest}
                onSendRequest={sendRequest}
                onSaveRequest={saveRequest}
              />
            </div>

            <div className="flex-1 flex flex-col">
              <ResponsePanel response={currentActiveTab?.response || null} />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showGitHub && (
        <GitHubIntegration
          workspace={currentWorkspace}
          onClose={() => setShowGitHub(false)}
          onCollectionImported={(collection) => {
            setCollections((prev) => [...prev, collection])
            toast({
              title: "Collection Imported",
              description: `Successfully imported ${collection.name} from GitHub`,
            })
          }}
        />
      )}
    </div>
  )
}
