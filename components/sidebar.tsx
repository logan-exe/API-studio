"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Code, Trash2 } from "lucide-react"
import type { Collection, Environment, RequestData } from "@/types/api-studio"
import { CollectionManager } from "./collection-manager"
import { EnvironmentManager } from "./environment-manager"

interface SidebarProps {
  collections: Collection[]
  environments: Environment[]
  activeEnvironment: string
  onCollectionCreate: (collection: Collection) => void
  onCollectionDelete: (collectionId: string) => void
  onRequestLoad: (request: RequestData) => void
  onRequestDelete: (collectionId: string, requestId: string) => void
  onEnvironmentChange: (environmentId: string) => void
  onEnvironmentCreate: (environment: Environment) => void
  onEnvironmentDelete: (environmentId: string) => void
  onEnvironmentUpdate: (environments: Environment[]) => void
}

export function Sidebar({
  collections,
  environments,
  activeEnvironment,
  onCollectionCreate,
  onCollectionDelete,
  onRequestLoad,
  onRequestDelete,
  onEnvironmentChange,
  onEnvironmentCreate,
  onEnvironmentDelete,
  onEnvironmentUpdate,
}: SidebarProps) {
  return (
    <div className="w-80 border-r bg-muted/30">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Code className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">API Studio</h1>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Collections</h2>
          <CollectionManager onCollectionCreate={onCollectionCreate} />
        </div>

        <div className="space-y-2">
          <Label>Environment</Label>
          <div className="flex space-x-2">
            <Select value={activeEnvironment} onValueChange={onEnvironmentChange}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="No Environment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Environment</SelectItem>
                {environments.map((env) => (
                  <SelectItem key={env.id} value={env.id}>
                    {env.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <EnvironmentManager
              environments={environments}
              onEnvironmentCreate={onEnvironmentCreate}
              onEnvironmentDelete={onEnvironmentDelete}
              onEnvironmentUpdate={onEnvironmentUpdate}
            />
          </div>
        </div>

        {/* Environment Variables Preview */}
        {activeEnvironment !== "none" && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <h4 className="text-sm font-medium mb-2">Current Variables:</h4>
            <div className="space-y-1 text-xs">
              {environments
                .find((env) => env.id === activeEnvironment)
                ?.variables.slice(0, 3)
                .map((variable) => (
                  <div key={variable.key} className="flex justify-between">
                    <span className="text-muted-foreground">{"{{" + variable.key + "}}"}</span>
                    <span className="truncate max-w-24">{variable.value}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        {collections.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <p className="text-sm">No collections yet.</p>
            <p className="text-xs mt-1">Create a collection to save your requests.</p>
          </div>
        ) : (
          collections.map((collection) => (
            <div key={collection.id} className="p-2">
              <div className="flex items-center justify-between p-2 rounded hover:bg-muted">
                <span className="font-medium">{collection.name}</span>
                <div className="flex items-center space-x-1">
                  <Badge variant="secondary">{collection.requests.length}</Badge>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Collection</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{collection.name}"? This will remove all requests in this
                          collection.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onCollectionDelete(collection.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              {collection.requests.map((request) => (
                <div
                  key={request.id}
                  className="ml-4 p-2 rounded hover:bg-muted cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2" onClick={() => onRequestLoad(request)}>
                    <Badge variant="outline" className="text-xs">
                      {request.method}
                    </Badge>
                    <span className="text-sm truncate">{request.name}</span>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Request</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{request.name}"?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onRequestDelete(collection.id, request.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          ))
        )}
      </ScrollArea>
    </div>
  )
}
