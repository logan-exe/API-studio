"use client"

import { useState, useEffect } from "react"
import { AuthForm } from "@/components/auth/auth-form"
import { WorkspaceSelector } from "@/components/workspace/workspace-selector"
import { TeamManagement } from "@/components/workspace/team-management"
import { CodeGenerator } from "@/components/code-generator/code-generator"
import { NetworkSettings } from "@/components/settings/network-settings"
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
import { LogOut } from "lucide-react"
import type { RequestData, ResponseData } from "@/types/api-studio"
import type { User as AuthUser, Workspace } from "@/types/auth"
import { getCurrentUser, signOut, isLocalEnvironment } from "@/lib/auth"
import { toast } from "@/hooks/use-toast"
import { HeroSection } from "@/components/landing/hero-section"

export default function APIStudio() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null)
  const [loading, setLoading] = useState(true)
  const [showLanding, setShowLanding] = useState(true)

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
      if (isLocal) {
        // In local development, create a default workspace
        const defaultWorkspace: Workspace = {
          id: "local-workspace-123",
          name: "Local Development",
          description: "Default workspace for local development",
          role: "owner",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        setWorkspaces([defaultWorkspace])
        setCurrentWorkspace(defaultWorkspace)
      } else {
        fetchWorkspaces()
      }
    }
  }, [user])

  useEffect(() => {
    if (currentWorkspace && !isLocal) {
      fetchCollections()
      fetchEnvironments()
    }
  }, [currentWorkspace])

  const checkAuth = async () => {
    const { user: currentUser } = await getCurrentUser()
    setUser(currentUser)
    setLoading(false)

    // In local development, skip landing page
    if (isLocal && currentUser) {
      setShowLanding(false)
    }
  }

  const fetchWorkspaces = async () => {
    try {
      const response = await fetch("/api/workspaces")
      if (response.ok) {
        const data = await response.json()
        setWorkspaces(data)
        if (data.length > 0 && !currentWorkspace) {
          setCurrentWorkspace(data[0])
        }
      }
    } catch (error) {
      console.error("Failed to fetch workspaces:", error)
    }
  }

  const fetchCollections = async () => {
    if (!currentWorkspace) return

    try {
      const response = await fetch(`/api/workspaces/${currentWorkspace.id}/collections`)
      if (response.ok) {
        const data = await response.json()
        setCollections(data.map((col: any) => ({ ...col, requests: [] })))
      }
    } catch (error) {
      console.error("Failed to fetch collections:", error)
    }
  }

  const fetchEnvironments = async () => {
    if (!currentWorkspace) return

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
    await signOut()
    setUser(null)
    setWorkspaces([])
    setCurrentWorkspace(null)
    if (isLocal) {
      // In local development, reload to reset state
      window.location.reload()
    }
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
        title: "Error",
        description: "Please enter a URL",
        variant: "destructive",
      })
      return
    }

    setRequestLoading(true)
    const startTime = Date.now()

    try {
      const url = replaceEnvironmentVariables(activeTab.request.url)
      const headers: Record<string, string> = {}

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

      // Handle different body types
      if (["POST", "PUT", "PATCH"].includes(activeTab.request.method)) {
        if (activeTab.request.bodyType === "json" && activeTab.request.body.trim()) {
          headers["Content-Type"] = "application/json"
          requestOptions.body = replaceEnvironmentVariables(activeTab.request.body)
        } else if (activeTab.request.bodyType === "xml" && activeTab.request.body.trim()) {
          headers["Content-Type"] = "application/xml"
          requestOptions.body = replaceEnvironmentVariables(activeTab.request.body)
        } else if (activeTab.request.bodyType === "text" && activeTab.request.body.trim()) {
          headers["Content-Type"] = "text/plain"
          requestOptions.body = replaceEnvironmentVariables(activeTab.request.body)
        }
      }

      const response = await fetch(url, requestOptions)
      const endTime = Date.now()

      const responseHeaders: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })

      const responseText = await response.text()
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

      // Save to history (skip in local development)
      if (currentWorkspace && !isLocal) {
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
      }

      toast({
        title: "Request sent",
        description: `${response.status} ${response.statusText} • ${endTime - startTime}ms`,
      })
    } catch (error) {
      toast({
        title: "Request failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
      updateActiveTab({ response: null })
    } finally {
      setRequestLoading(false)
    }
  }

  const saveRequest = async (name: string, collectionId: string) => {
    if (!activeTab || !currentWorkspace) return

    // In local development, simulate saving
    if (isLocal) {
      const savedRequest = {
        id: Date.now().toString(),
        name,
        method: activeTab.request.method,
        url: activeTab.request.url,
        headers: activeTab.request.headers,
        body: activeTab.request.body,
        body_type: activeTab.request.bodyType,
        form_data: activeTab.request.formData,
        auth: activeTab.request.auth,
        collection_id: collectionId,
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
        title: "Request saved",
        description: `Saved "${name}" to collection`,
      })
      return
    }

    const requestToSave = {
      name,
      method: activeTab.request.method,
      url: activeTab.request.url,
      headers: activeTab.request.headers,
      body: activeTab.request.body,
      body_type: activeTab.request.bodyType,
      form_data: activeTab.request.formData,
      auth: activeTab.request.auth,
      collection_id: collectionId,
    }

    try {
      const response = await fetch(`/api/workspaces/${currentWorkspace.id}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestToSave),
      })

      if (!response.ok) {
        throw new Error("Failed to save request")
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
        title: "Request saved",
        description: `Saved "${name}" to collection`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save request",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!user && showLanding) {
    return <HeroSection onGetStarted={() => setShowLanding(false)} />
  }

  if (!user) {
    return <AuthForm onSuccess={checkAuth} />
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
            }}
          />
        </div>
      </div>
    )
  }

  if (!activeTab) return null

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        collections={collections}
        environments={environments}
        activeEnvironment={activeEnvironment}
        onCollectionCreate={(collection) => setCollections((prev) => [...prev, collection])}
        onCollectionDelete={(collectionId) => setCollections((prev) => prev.filter((c) => c.id !== collectionId))}
        onRequestLoad={loadRequestInNewTab}
        onRequestDelete={(collectionId, requestId) => {
          setCollections((prev) =>
            prev.map((collection) =>
              collection.id === collectionId
                ? { ...collection, requests: collection.requests.filter((req) => req.id !== requestId) }
                : collection,
            ),
          )
        }}
        onEnvironmentChange={setActiveEnvironment}
        onEnvironmentCreate={(environment) => setEnvironments((prev) => [...prev, environment])}
        onEnvironmentDelete={(envId) => {
          setEnvironments((prev) => prev.filter((env) => env.id !== envId))
          if (activeEnvironment === envId) {
            setActiveEnvironment("none")
          }
        }}
        onEnvironmentUpdate={setEnvironments}
      />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b p-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {!isLocal && (
                <>
                  <WorkspaceSelector
                    workspaces={workspaces}
                    currentWorkspace={currentWorkspace}
                    onWorkspaceChange={setCurrentWorkspace}
                    onWorkspaceCreate={(workspace) => {
                      setWorkspaces([...workspaces, workspace])
                      setCurrentWorkspace(workspace)
                    }}
                  />
                  <TeamManagement workspaceId={currentWorkspace.id} userRole={currentWorkspace.role || "member"} />
                  <NetworkSettings workspaceId={currentWorkspace.id} />
                </>
              )}
              {activeTab && (
                <CodeGenerator request={activeTab.request} replaceEnvironmentVariables={replaceEnvironmentVariables} />
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback>
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem className="flex-col items-start">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                  {isLocal && <div className="text-xs text-green-600 font-medium">Local Development</div>}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
              collections={collections}
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
