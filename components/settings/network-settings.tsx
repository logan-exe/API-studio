"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Settings, Wifi, Shield, Clock, RotateCcw } from "lucide-react"
import type { WorkspaceSettings } from "@/types/auth"
import { toast } from "@/hooks/use-toast"

interface NetworkSettingsProps {
  workspaceId: string
}

export function NetworkSettings({ workspaceId }: NetworkSettingsProps) {
  const [settings, setSettings] = useState<WorkspaceSettings>({
    id: "",
    workspace_id: workspaceId,
    proxy_enabled: false,
    proxy_host: "",
    proxy_port: 8080,
    proxy_username: "",
    proxy_password: "",
    ssl_verification: true,
    timeout: 30000,
    follow_redirects: true,
    max_redirects: 5,
  })
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open) {
      fetchSettings()
    }
  }, [workspaceId, open])

  const fetchSettings = async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/settings`)
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error)
      toast({
        title: "Error",
        description: "Failed to load network settings",
        variant: "destructive",
      })
    }
  }

  const handleSave = async () => {
    setLoading(true)

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error("Failed to save settings")
      }

      toast({
        title: "Settings saved",
        description: "Network settings have been updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save network settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSettings({
      ...settings,
      proxy_enabled: false,
      proxy_host: "",
      proxy_port: 8080,
      proxy_username: "",
      proxy_password: "",
      ssl_verification: true,
      timeout: 30000,
      follow_redirects: true,
      max_redirects: 5,
    })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" variant="outline">
          <Settings className="h-4 w-4" />
          Network
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[600px] sm:w-[600px] flex flex-col">
        <SheetHeader>
          <SheetTitle>Network Settings</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 py-4">
            {/* Proxy Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Wifi className="h-5 w-5" />
                  <span>Proxy Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="proxy-enabled">Enable Proxy</Label>
                  <Switch
                    id="proxy-enabled"
                    checked={settings.proxy_enabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, proxy_enabled: checked })}
                  />
                </div>

                {settings.proxy_enabled && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="proxy-host">Proxy Host</Label>
                        <Input
                          id="proxy-host"
                          placeholder="proxy.example.com"
                          value={settings.proxy_host || ""}
                          onChange={(e) => setSettings({ ...settings, proxy_host: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="proxy-port">Port</Label>
                        <Input
                          id="proxy-port"
                          type="number"
                          placeholder="8080"
                          value={settings.proxy_port || ""}
                          onChange={(e) =>
                            setSettings({ ...settings, proxy_port: Number.parseInt(e.target.value) || 8080 })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="proxy-username">Username (Optional)</Label>
                        <Input
                          id="proxy-username"
                          placeholder="username"
                          value={settings.proxy_username || ""}
                          onChange={(e) => setSettings({ ...settings, proxy_username: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="proxy-password">Password (Optional)</Label>
                        <Input
                          id="proxy-password"
                          type="password"
                          placeholder="password"
                          value={settings.proxy_password || ""}
                          onChange={(e) => setSettings({ ...settings, proxy_password: e.target.value })}
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* SSL Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>SSL & Security</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="ssl-verification">SSL Certificate Verification</Label>
                    <p className="text-sm text-muted-foreground">Verify SSL certificates for HTTPS requests</p>
                  </div>
                  <Switch
                    id="ssl-verification"
                    checked={settings.ssl_verification}
                    onCheckedChange={(checked) => setSettings({ ...settings, ssl_verification: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Request Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Request Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="timeout">Request Timeout (ms)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    placeholder="30000"
                    value={settings.timeout}
                    onChange={(e) => setSettings({ ...settings, timeout: Number.parseInt(e.target.value) || 30000 })}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Maximum time to wait for a response (milliseconds)
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="follow-redirects">Follow Redirects</Label>
                    <p className="text-sm text-muted-foreground">Automatically follow HTTP redirects</p>
                  </div>
                  <Switch
                    id="follow-redirects"
                    checked={settings.follow_redirects}
                    onCheckedChange={(checked) => setSettings({ ...settings, follow_redirects: checked })}
                  />
                </div>

                {settings.follow_redirects && (
                  <div>
                    <Label htmlFor="max-redirects">Maximum Redirects</Label>
                    <Input
                      id="max-redirects"
                      type="number"
                      placeholder="5"
                      value={settings.max_redirects}
                      onChange={(e) =>
                        setSettings({ ...settings, max_redirects: Number.parseInt(e.target.value) || 5 })
                      }
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-4 border-t">
          <Button onClick={handleSave} disabled={loading} className="flex-1">
            {loading ? "Saving..." : "Save Settings"}
          </Button>
          <Button onClick={handleReset} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
