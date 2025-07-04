"use client"

import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"
import type { RequestTab } from "@/types/api-studio"
import { toast } from "@/hooks/use-toast"

interface RequestTabsProps {
  tabs: RequestTab[]
  activeTabId: string
  onTabChange: (tabId: string) => void
  onTabClose: (tabId: string) => void
  onNewTab: () => void
}

export function RequestTabs({ tabs, activeTabId, onTabChange, onTabClose, onNewTab }: RequestTabsProps) {
  const closeTab = (tabId: string) => {
    if (tabs.length === 1) {
      toast({
        title: "Cannot close tab",
        description: "At least one tab must remain open",
        variant: "destructive",
      })
      return
    }

    const tabToClose = tabs.find((tab) => tab.id === tabId)
    if (tabToClose?.hasUnsavedChanges) {
      if (!confirm("You have unsaved changes. Are you sure you want to close this tab?")) {
        return
      }
    }

    onTabClose(tabId)
  }

  return (
    <div className="border-b bg-muted/30">
      <div className="flex items-center">
        <div className="flex-1 flex items-center overflow-x-auto">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`flex items-center space-x-2 px-4 py-2 border-r cursor-pointer hover:bg-muted ${
                activeTabId === tab.id ? "bg-background border-b-2 border-primary" : ""
              }`}
              onClick={() => onTabChange(tab.id)}
            >
              <span className="text-sm truncate max-w-32">{tab.name}</span>
              {tab.hasUnsavedChanges && <div className="w-2 h-2 bg-green-500 rounded-full" />}
              <Button
                size="sm"
                variant="ghost"
                className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                onClick={(e) => {
                  e.stopPropagation()
                  closeTab(tab.id)
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
        <Button size="sm" variant="ghost" onClick={onNewTab} className="m-2">
          <Plus className="h-4 w-4" />
          New Request
        </Button>
      </div>
    </div>
  )
}
