"use client"

import { useState, useEffect } from "react"
import { AuthForm } from "@/components/auth/auth-form"
import { WorkspaceSelector } from "@/components/workspace/workspace-selector"
import { TeamManagement } from "@/components/workspace/team-management"
import { CodeGenerator } from "@/components/code-generator/code-generator"
import { NetworkSettings } from "@/components/settings/network-settings"
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
import { useTheme } from "next-themes"

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
        console.error("Auth error:", error)
      }

      setUser(currentUser)
      setLoading(false)
    } catch (error) {
      console.error("Auth check failed:", error)
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
        } else if (activeTab.request.body.trim()) {
          bodyData = { raw: replaceEnvironmentVariables(activeTab.request.body) }
        }

        requestOptions.body = JSON.stringify(bodyData)
      }

      const response = await fetch(url, requestOptions)
      const endTime = Date.now()

      const responseHeaders: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })

      let responseText = await response.text()
      let responseBody: any

      // Try to parse as JSON, fallback to text
      try {
        responseBody = JSON.parse(responseText)
        responseText = JSON.stringify(responseBody, null, 2)
      } catch (e) {
        // If not JSON, wrap in JSON structure
        responseBody = { raw: responseText }
        responseText = JSON.stringify(responseBody, null, 2)
      }

      const responseSize = new Blob([responseText]).size

      const responseData: ResponseData = {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        body: responseText,
        time: endTime - startTime,
        size: responseSize,
      }

      updateActiveTab({ response: responseData })

      // Save to history (skip for anonymous users)
      if (currentWorkspace && user && currentWorkspace.id !== "anonymous-workspace") {
        try {
          await fetch(`/api/workspaces/${currentWorkspace.id}/history`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              method: activeTab.request.method,
              url: activeTab.request.url,
              headers: activeTab.request.headers,
              body: activeTab.request.body,
              response_status: response.status,
              response_headers: responseHeaders,
              response_body: responseText,
              response_time: endTime - startTime,
            }),
          })
        } catch (historyError) {
          console.warn("Failed to save request to history:", historyError)
        }
      }

      toast({
        title: "Request Completed",
        description: `${response.status} ${response.statusText} • ${endTime - startTime}ms`,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

      toast({
        title: "Request Failed",
        description: errorMessage.includes("fetch")
          ? "Network error. Please check your connection and try again."
          : errorMessage,
        variant: "destructive",
      })
      updateActiveTab({ response: null })
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
    if (!user.name) return "U"
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
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
    const colorIndex = user.email.charCodeAt(0) % colors.length
    return { initials, color: colors[colorIndex] }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (showAuth) {
    return <AuthForm onSuccess={checkAuth} />
  }

  if (showWorkspaceSetup) {
    return (
      <WorkspaceSetup
        user={user}
        onWorkspaceCreated={handleWorkspaceCreated}
        onSkip={() => {
          // Create anonymous workspace
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
          setShowWorkspaceSetup(false)
        }}
        onSignIn={() => setShowAuth(true)}
      />
    )
  }

  if (showGitHub) {
    return (
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
    )
  }

  if (!currentWorkspace) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Workspace Selected</h2>
          <p className="text-muted-foreground mb-4">Create or select a workspace to get started</p>
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
      </div>
    )
  }

  if (!activeTab) return null

  const defaultAvatar = user ? getDefaultAvatar(user) : { initials: "A", color: "bg-blue-500" }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        collections={collections || []}
        environments={environments || []}
        activeEnvironment={activeEnvironment}
        onCollectionCreate={(collection) => {
          setCollections((prev) => [...(prev || []), collection])
          toast({
            title: "Collection Created",
            description: `Successfully created collection: ${collection.name}`,
          })
        }}
        onCollectionDelete={(collectionId) => {
          setCollections((prev) => (prev || []).filter((c) => c.id !== collectionId))
          toast({
            title: "Collection Deleted",
            description: "Collection has been successfully deleted.",
          })
        }}
        onRequestLoad={loadRequestInNewTab}
        onRequestDelete={(collectionId, requestId) => {
          setCollections((prev) =>
            (prev || []).map((collection) =>
              collection.id === collectionId
                ? { ...collection, requests: collection.requests.filter((req) => req.id !== requestId) }
                : collection,
            ),
          )
          toast({
            title: "Request Deleted",
            description: "Request has been successfully deleted.",
          })
        }}
        onEnvironmentChange={setActiveEnvironment}
        onEnvironmentCreate={(environment) => {
          setEnvironments((prev) => [...(prev || []), environment])
          toast({
            title: "Environment Created",
            description: `Successfully created environment: ${environment.name}`,
          })
        }}
        onEnvironmentDelete={(envId) => {
          setEnvironments((prev) => (prev || []).filter((env) => env.id !== envId))
          if (activeEnvironment === envId) {
            setActiveEnvironment("none")
          }
          toast({
            title: "Environment Deleted",
            description: "Environment has been successfully deleted.",
          })
        }}
        onEnvironmentUpdate={setEnvironments}
      />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b p-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {user && !isLocal && (
                <>
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
                  <TeamManagement workspaceId={currentWorkspace.id} userRole={currentWorkspace.role || "member"} />
                  <NetworkSettings workspaceId={currentWorkspace.id} />
                </>
              )}
              {activeTab && (
                <CodeGenerator request={activeTab.request} replaceEnvironmentVariables={replaceEnvironmentVariables} />
              )}
              <Button variant="outline" onClick={() => setShowGitHub(true)}>
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              {!user && (
                <Button variant="outline" onClick={() => setShowAuth(true)}>
                  Sign In
                </Button>
              )}

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.name || "User"} />
                        <AvatarFallback className={`${defaultAvatar.color} text-white`}>
                          {defaultAvatar.initials}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem className="flex-col items-start">
                      <div className="font-medium">{user.name || "User"}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                      {isLocal && <div className="text-xs text-green-600 font-medium">Local Development</div>}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowGitHub(true)}>
                      <Github className="mr-2 h-4 w-4" />
                      <span>GitHub Integration</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                      {theme === "dark" ? (
                        <>
                          <Sun className="mr-2 h-4 w-4" />
                          <span>Light Mode</span>
                        </>
                      ) : (
                        <>
                          <Moon className="mr-2 h-4 w-4" />
                          <span>Dark Mode</span>
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-500 text-white">A</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem className="flex-col items-start">
                      <div className="font-medium">Anonymous User</div>
                      <div className="text-xs text-muted-foreground">Using local workspace</div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowAuth(true)}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Sign In</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowGitHub(true)}>
                      <Github className="mr-2 h-4 w-4" />
                      <span>GitHub Integration</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                      {theme === "dark" ? (
                        <>
                          <Sun className="mr-2 h-4 w-4" />
                          <span>Light Mode</span>
                        </>
                      ) : (
                        <>
                          <Moon className="mr-2 h-4 w-4" />
                          <span>Dark Mode</span>
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>

        <RequestTabs
          tabs={tabs}
          activeTabId={activeTabId}
          onTabChange={setActiveTabId}
          onTabClose={closeTab}
          onNewTab={createNewTab}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Request Form - Top Half */}
          <div className="flex-1 min-h-0">
            <RequestForm
              activeTab={activeTab}
              collections={collections || []}
              loading={requestLoading}
              onRequestUpdate={updateActiveRequest}
              onSendRequest={sendRequest}
              onSaveRequest={saveRequest}
            />
          </div>

          {/* Response Panel - Bottom Half */}
          <div className="flex-1 min-h-0 border-t">
            <ResponsePanel
              response={activeTab.response}
              onResponseUpdate={(response) => updateActiveTab({ response })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
