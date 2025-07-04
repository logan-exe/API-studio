"use client"

import { useState } from "react"
import { useAPIStudio } from "@/hooks/use-api-studio"
import { RequestTabs } from "@/components/request-tabs"
import { Sidebar } from "@/components/sidebar"
import { RequestForm } from "@/components/request-form"
import { ResponsePanel } from "@/components/response-panel"
import type { RequestData, ResponseData } from "@/types/api-studio"
import { toast } from "@/hooks/use-toast"

export default function APIStudio() {
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

  const [loading, setLoading] = useState(false)

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

    setLoading(true)
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
        } else if (activeTab.request.bodyType === "graphql" && activeTab.request.body.trim()) {
          headers["Content-Type"] = "application/json"
          requestOptions.body = JSON.stringify({
            query: replaceEnvironmentVariables(activeTab.request.body),
          })
        } else if (activeTab.request.bodyType === "form-data") {
          const formData = new FormData()
          activeTab.request.formData.forEach((field) => {
            if (field.key.trim()) {
              if (field.type === "file" && field.file) {
                formData.append(field.key, field.file)
              } else if (field.type === "text" && field.value.trim()) {
                formData.append(field.key, replaceEnvironmentVariables(field.value))
              }
            }
          })
          requestOptions.body = formData
          // Don't set Content-Type for FormData, let browser set it with boundary
          delete headers["Content-Type"]
        } else if (activeTab.request.bodyType === "x-www-form-urlencoded") {
          const params = new URLSearchParams()
          activeTab.request.formData.forEach((field) => {
            if (field.key.trim() && field.value.trim() && field.type === "text") {
              params.append(field.key, replaceEnvironmentVariables(field.value))
            }
          })
          headers["Content-Type"] = "application/x-www-form-urlencoded"
          requestOptions.body = params.toString()
        } else if (activeTab.request.bodyType === "binary" && activeTab.request.files.length > 0) {
          headers["Content-Type"] = "application/octet-stream"
          requestOptions.body = activeTab.request.files[0]
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
      setLoading(false)
    }
  }

  const saveRequest = (name: string, collectionId: string) => {
    if (!activeTab) return

    const requestToSave = {
      ...activeTab.request,
      id: Date.now().toString(),
      name,
    }

    setCollections((prev) =>
      prev.map((collection) =>
        collection.id === collectionId
          ? { ...collection, requests: [...collection.requests, requestToSave] }
          : collection,
      ),
    )

    updateActiveTab({
      originalRequest: requestToSave,
      hasUnsavedChanges: false,
      name,
    })

    toast({
      title: "Request saved",
      description: `Saved "${name}" to collection`,
    })
  }

  const deleteRequest = (collectionId: string, requestId: string) => {
    setCollections((prev) =>
      prev.map((collection) =>
        collection.id === collectionId
          ? { ...collection, requests: collection.requests.filter((req) => req.id !== requestId) }
          : collection,
      ),
    )
    toast({
      title: "Request deleted",
      description: "Request has been removed from collection",
    })
  }

  const deleteCollection = (collectionId: string) => {
    setCollections((prev) => prev.filter((collection) => collection.id !== collectionId))
    toast({
      title: "Collection deleted",
      description: "Collection and all its requests have been removed",
    })
  }

  const deleteEnvironment = (envId: string) => {
    setEnvironments((prev) => prev.filter((env) => env.id !== envId))
    if (activeEnvironment === envId) {
      setActiveEnvironment("none")
    }
    toast({
      title: "Environment deleted",
      description: "Environment has been removed",
    })
  }

  if (!activeTab) return null

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        collections={collections}
        environments={environments}
        activeEnvironment={activeEnvironment}
        onCollectionCreate={(collection) => setCollections((prev) => [...prev, collection])}
        onCollectionDelete={deleteCollection}
        onRequestLoad={loadRequestInNewTab}
        onRequestDelete={deleteRequest}
        onEnvironmentChange={setActiveEnvironment}
        onEnvironmentCreate={(environment) => setEnvironments((prev) => [...prev, environment])}
        onEnvironmentDelete={deleteEnvironment}
        onEnvironmentUpdate={setEnvironments}
      />

      <div className="flex-1 flex flex-col">
        <RequestTabs
          tabs={tabs}
          activeTabId={activeTabId}
          onTabChange={setActiveTabId}
          onTabClose={closeTab}
          onNewTab={createNewTab}
        />

        {/* New Layout: Vertical Stack */}
        <div className="flex-1 flex flex-col">
          {/* Request Form - Top Half */}
          <div className="flex-1 min-h-0">
            <RequestForm
              activeTab={activeTab}
              collections={collections}
              loading={loading}
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
