"use client"

import { useState, useEffect } from "react"
import type { RequestTab, Collection, Environment, RequestData } from "@/types/api-studio"

export function useAPIStudio() {
  const [tabs, setTabs] = useState<RequestTab[]>([
    {
      id: "tab-1",
      name: "Untitled Request",
      request: {
        id: "",
        name: "Untitled Request",
        method: "GET",
        url: "",
        headers: [{ key: "", value: "", enabled: true }],
        body: "",
        bodyType: "json",
        files: [],
        formData: [{ key: "", value: "", type: "text" }],
        auth: { type: "none" },
      },
      response: null,
      hasUnsavedChanges: false,
      originalRequest: null,
    },
  ])

  const [activeTabId, setActiveTabId] = useState("tab-1")
  const [collections, setCollections] = useState<Collection[]>([])
  const [environments, setEnvironments] = useState<Environment[]>([])
  const [activeEnvironment, setActiveEnvironment] = useState<string>("none")

  const activeTab = tabs.find((tab) => tab.id === activeTabId)

  // Track changes for active tab
  useEffect(() => {
    if (activeTab && activeTab.originalRequest) {
      const hasChanges = JSON.stringify(activeTab.request) !== JSON.stringify(activeTab.originalRequest)
      setTabs((prev) => prev.map((tab) => (tab.id === activeTabId ? { ...tab, hasUnsavedChanges: hasChanges } : tab)))
    }
  }, [activeTabId]) // Removed activeTab?.originalRequest from dependencies

  // Load data from localStorage on mount
  useEffect(() => {
    const savedCollections = localStorage.getItem("api-studio-collections")
    const savedEnvironments = localStorage.getItem("api-studio-environments")
    const savedActiveEnv = localStorage.getItem("api-studio-active-environment")

    if (savedCollections) {
      setCollections(JSON.parse(savedCollections))
    }
    if (savedEnvironments) {
      setEnvironments(JSON.parse(savedEnvironments))
    } else {
      // Create default environments
      const defaultEnvironments: Environment[] = [
        {
          id: "dev",
          name: "Development",
          variables: [
            { key: "baseUrl", value: "https://api-dev.example.com" },
            { key: "apiKey", value: "dev-api-key-123" },
            { key: "token", value: "dev-bearer-token" },
            { key: "username", value: "dev-user" },
            { key: "password", value: "dev-password" },
          ],
        },
        {
          id: "staging",
          name: "Staging",
          variables: [
            { key: "baseUrl", value: "https://api-staging.example.com" },
            { key: "apiKey", value: "staging-api-key-456" },
            { key: "token", value: "staging-bearer-token" },
            { key: "username", value: "staging-user" },
            { key: "password", value: "staging-password" },
          ],
        },
        {
          id: "prod",
          name: "Production",
          variables: [
            { key: "baseUrl", value: "https://api.example.com" },
            { key: "apiKey", value: "prod-api-key-789" },
            { key: "token", value: "prod-bearer-token" },
            { key: "username", value: "prod-user" },
            { key: "password", value: "prod-password" },
          ],
        },
      ]
      setEnvironments(defaultEnvironments)
    }
    if (savedActiveEnv) {
      setActiveEnvironment(savedActiveEnv)
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("api-studio-collections", JSON.stringify(collections))
  }, [collections])

  useEffect(() => {
    localStorage.setItem("api-studio-environments", JSON.stringify(environments))
  }, [environments])

  useEffect(() => {
    localStorage.setItem("api-studio-active-environment", activeEnvironment)
  }, [activeEnvironment])

  const createNewTab = () => {
    const newTabId = `tab-${Date.now()}`
    const newTab: RequestTab = {
      id: newTabId,
      name: "Untitled Request",
      request: {
        id: "",
        name: "Untitled Request",
        method: "GET",
        url: "",
        headers: [{ key: "", value: "", enabled: true }],
        body: "",
        bodyType: "json",
        files: [],
        formData: [{ key: "", value: "", type: "text" }],
        auth: { type: "none" },
      },
      response: null,
      hasUnsavedChanges: false,
      originalRequest: null,
    }
    setTabs((prev) => [...prev, newTab])
    setActiveTabId(newTabId)
  }

  const loadRequestInNewTab = (request: RequestData) => {
    const newTabId = `tab-${Date.now()}`
    const newTab: RequestTab = {
      id: newTabId,
      name: request.name,
      request: { ...request },
      response: null,
      hasUnsavedChanges: false,
      originalRequest: { ...request },
    }
    setTabs((prev) => [...prev, newTab])
    setActiveTabId(newTabId)
  }

  const replaceEnvironmentVariables = (text: string) => {
    if (activeEnvironment === "none") return text

    const env = environments.find((e) => e.id === activeEnvironment)
    if (!env) return text

    let result = text
    env.variables.forEach((variable) => {
      const regex = new RegExp(`{{${variable.key}}}`, "g")
      result = result.replace(regex, variable.value)
    })
    return result
  }

  return {
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
  }
}
