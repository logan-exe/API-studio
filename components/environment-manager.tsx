"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
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
import { Plus, Settings, Trash2 } from "lucide-react"
import type { Environment } from "@/types/api-studio"
import { toast } from "@/hooks/use-toast"

interface EnvironmentManagerProps {
  environments: Environment[]
  onEnvironmentCreate: (environment: Environment) => void
  onEnvironmentDelete: (environmentId: string) => void
  onEnvironmentUpdate: (environments: Environment[]) => void
}

export function EnvironmentManager({
  environments,
  onEnvironmentCreate,
  onEnvironmentDelete,
  onEnvironmentUpdate,
}: EnvironmentManagerProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newEnvName, setNewEnvName] = useState("")

  const createEnvironment = () => {
    if (!newEnvName.trim()) {
      toast({
        title: "Error",
        description: "Please enter an environment name",
        variant: "destructive",
      })
      return
    }

    const newEnv: Environment = {
      id: Date.now().toString(),
      name: newEnvName.trim(),
      variables: [
        { key: "baseUrl", value: "https://api.example.com" },
        { key: "apiKey", value: "your-api-key" },
        { key: "token", value: "your-bearer-token" },
      ],
    }

    onEnvironmentCreate(newEnv)
    setNewEnvName("")
    setShowCreateDialog(false)
    toast({
      title: "Environment created",
      description: `Created "${newEnvName}" environment`,
    })
  }

  return (
    <>
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Environment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="env-name">Environment Name</Label>
              <Input
                id="env-name"
                placeholder="Development"
                value={newEnvName}
                onChange={(e) => setNewEnvName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    createEnvironment()
                  }
                }}
              />
            </div>
            <Button onClick={createEnvironment} className="w-full">
              Create Environment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Sheet>
        <SheetTrigger asChild>
          <Button size="sm" variant="outline">
            <Settings className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[600px] sm:w-[600px]">
          <SheetHeader>
            <SheetTitle>Environment Variables</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">How to use variables:</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Use {"{{variableName}}"} in URLs, headers, and body</p>
                <p>• Example: {"{{baseUrl}}"}/api/users</p>
                <p>• Example: Authorization: Bearer {"{{token}}"}</p>
                <p>• Variables change based on selected environment</p>
              </div>
            </div>

            {environments.map((env) => (
              <Card key={env.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <span>{env.name}</span>
                    </CardTitle>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Environment</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{env.name}" environment?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onEnvironmentDelete(env.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {env.variables.map((variable, index) => (
                      <div key={index} className="flex space-x-2">
                        <Input
                          placeholder="Variable name"
                          value={variable.key}
                          onChange={(e) => {
                            const newEnvs = environments.map((environment) =>
                              environment.id === env.id
                                ? {
                                    ...environment,
                                    variables: environment.variables.map((v, i) =>
                                      i === index ? { ...v, key: e.target.value } : v,
                                    ),
                                  }
                                : environment,
                            )
                            onEnvironmentUpdate(newEnvs)
                          }}
                        />
                        <Input
                          placeholder="Variable value"
                          value={variable.value}
                          onChange={(e) => {
                            const newEnvs = environments.map((environment) =>
                              environment.id === env.id
                                ? {
                                    ...environment,
                                    variables: environment.variables.map((v, i) =>
                                      i === index ? { ...v, value: e.target.value } : v,
                                    ),
                                  }
                                : environment,
                            )
                            onEnvironmentUpdate(newEnvs)
                          }}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const newEnvs = environments.map((environment) =>
                              environment.id === env.id
                                ? {
                                    ...environment,
                                    variables: environment.variables.filter((_, i) => i !== index),
                                  }
                                : environment,
                            )
                            onEnvironmentUpdate(newEnvs)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const newEnvs = environments.map((environment) =>
                          environment.id === env.id
                            ? {
                                ...environment,
                                variables: [...environment.variables, { key: "", value: "" }],
                              }
                            : environment,
                        )
                        onEnvironmentUpdate(newEnvs)
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      Add Variable
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
