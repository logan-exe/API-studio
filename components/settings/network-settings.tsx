"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Globe, Shield, Clock, Zap, AlertTriangle, CheckCircle, Settings, Network, Lock, Timer } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface NetworkSettings {
  timeout: number
  retries: number
  followRedirects: boolean
  validateSSL: boolean
  proxyEnabled: boolean
  proxyHost: string
  proxyPort: string
  proxyAuth: boolean
  proxyUsername: string
  proxyPassword: string
  userAgent: string
  maxResponseSize: number
  keepAlive: boolean
  compression: boolean
}

export function NetworkSettings() {
  const [settings, setSettings] = useState<NetworkSettings>({
    timeout: 30000,
    retries: 3,
    followRedirects: true,
    validateSSL: true,
    proxyEnabled: false,
    proxyHost: "",
    proxyPort: "8080",
    proxyAuth: false,
    proxyUsername: "",
    proxyPassword: "",
    userAgent: "API Studio/1.0",
    maxResponseSize: 10485760, // 10MB
    keepAlive: true,
    compression: true,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    // Load settings from localStorage or API
    const savedSettings = localStorage.getItem("networkSettings")
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (error) {
        console.error("Failed to parse saved settings:", error)
      }
    }
  }, [])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Save to localStorage (in a real app, this would be an API call)
      localStorage.setItem("networkSettings", JSON.stringify(settings))

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setIsSaved(true)
      toast({
        title: "Settings saved",
        description: "Network settings have been updated successfully.",
      })

      // Reset saved indicator after 3 seconds
      setTimeout(() => setIsSaved(false), 3000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save network settings.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setSettings({
      timeout: 30000,
      retries: 3,
      followRedirects: true,
      validateSSL: true,
      proxyEnabled: false,
      proxyHost: "",
      proxyPort: "8080",
      proxyAuth: false,
      proxyUsername: "",
      proxyPassword: "",
      userAgent: "API Studio/1.0",
      maxResponseSize: 10485760,
      keepAlive: true,
      compression: true,
    })
    toast({
      title: "Settings reset",
      description: "Network settings have been reset to defaults.",
    })
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center space-x-2">
          <Network className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Network Settings</h2>
        </div>
        <div className="flex items-center space-x-2">
          {isSaved && (
            <Badge variant="secondary" className="text-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Saved
            </Badge>
          )}
          <Button variant="outline" onClick={handleReset}>
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="proxy">Proxy</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Request Timeout</span>
                  </CardTitle>
                  <CardDescription>Configure how long to wait for responses before timing out</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="timeout">Timeout (milliseconds)</Label>
                      <Input
                        id="timeout"
                        type="number"
                        value={settings.timeout}
                        onChange={(e) => setSettings({ ...settings, timeout: Number.parseInt(e.target.value) || 0 })}
                        min="1000"
                        max="300000"
                      />
                      <p className="text-xs text-muted-foreground">Current: {settings.timeout / 1000} seconds</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="retries">Max Retries</Label>
                      <Select
                        value={settings.retries.toString()}
                        onValueChange={(value) => setSettings({ ...settings, retries: Number.parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">No retries</SelectItem>
                          <SelectItem value="1">1 retry</SelectItem>
                          <SelectItem value="2">2 retries</SelectItem>
                          <SelectItem value="3">3 retries</SelectItem>
                          <SelectItem value="5">5 retries</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <span>Request Behavior</span>
                  </CardTitle>
                  <CardDescription>Control how requests are handled and processed</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Follow Redirects</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically follow HTTP redirects (3xx responses)
                      </p>
                    </div>
                    <Switch
                      checked={settings.followRedirects}
                      onCheckedChange={(checked) => setSettings({ ...settings, followRedirects: checked })}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Keep-Alive Connections</Label>
                      <p className="text-sm text-muted-foreground">Reuse connections for better performance</p>
                    </div>
                    <Switch
                      checked={settings.keepAlive}
                      onCheckedChange={(checked) => setSettings({ ...settings, keepAlive: checked })}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Compression</Label>
                      <p className="text-sm text-muted-foreground">Accept compressed responses (gzip, deflate)</p>
                    </div>
                    <Switch
                      checked={settings.compression}
                      onCheckedChange={(checked) => setSettings({ ...settings, compression: checked })}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="userAgent">User Agent</Label>
                    <Input
                      id="userAgent"
                      value={settings.userAgent}
                      onChange={(e) => setSettings({ ...settings, userAgent: e.target.value })}
                      placeholder="API Studio/1.0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxResponseSize">Max Response Size</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="maxResponseSize"
                        type="number"
                        value={settings.maxResponseSize}
                        onChange={(e) =>
                          setSettings({ ...settings, maxResponseSize: Number.parseInt(e.target.value) || 0 })
                        }
                        min="1024"
                        max="104857600"
                      />
                      <span className="text-sm text-muted-foreground">({formatBytes(settings.maxResponseSize)})</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="proxy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>Proxy Configuration</span>
                  </CardTitle>
                  <CardDescription>Route requests through a proxy server</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Proxy</Label>
                      <p className="text-sm text-muted-foreground">Route all requests through a proxy server</p>
                    </div>
                    <Switch
                      checked={settings.proxyEnabled}
                      onCheckedChange={(checked) => setSettings({ ...settings, proxyEnabled: checked })}
                    />
                  </div>

                  {settings.proxyEnabled && (
                    <>
                      <Separator />

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="proxyHost">Proxy Host</Label>
                          <Input
                            id="proxyHost"
                            value={settings.proxyHost}
                            onChange={(e) => setSettings({ ...settings, proxyHost: e.target.value })}
                            placeholder="proxy.example.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="proxyPort">Proxy Port</Label>
                          <Input
                            id="proxyPort"
                            type="number"
                            value={settings.proxyPort}
                            onChange={(e) => setSettings({ ...settings, proxyPort: e.target.value })}
                            placeholder="8080"
                            min="1"
                            max="65535"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Proxy Authentication</Label>
                          <p className="text-sm text-muted-foreground">
                            Use username and password for proxy authentication
                          </p>
                        </div>
                        <Switch
                          checked={settings.proxyAuth}
                          onCheckedChange={(checked) => setSettings({ ...settings, proxyAuth: checked })}
                        />
                      </div>

                      {settings.proxyAuth && (
                        <>
                          <Separator />

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="proxyUsername">Username</Label>
                              <Input
                                id="proxyUsername"
                                value={settings.proxyUsername}
                                onChange={(e) => setSettings({ ...settings, proxyUsername: e.target.value })}
                                placeholder="username"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="proxyPassword">Password</Label>
                              <Input
                                id="proxyPassword"
                                type="password"
                                value={settings.proxyPassword}
                                onChange={(e) => setSettings({ ...settings, proxyPassword: e.target.value })}
                                placeholder="password"
                              />
                            </div>
                          </div>
                        </>
                      )}

                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Proxy settings will apply to all requests. Make sure your proxy server is accessible and
                          properly configured.
                        </AlertDescription>
                      </Alert>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>SSL/TLS Settings</span>
                  </CardTitle>
                  <CardDescription>Configure security settings for HTTPS requests</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Validate SSL Certificates</Label>
                      <p className="text-sm text-muted-foreground">Verify SSL certificates for HTTPS requests</p>
                    </div>
                    <Switch
                      checked={settings.validateSSL}
                      onCheckedChange={(checked) => setSettings({ ...settings, validateSSL: checked })}
                    />
                  </div>

                  {!settings.validateSSL && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Disabling SSL validation can expose you to security risks. Only disable this for testing
                        purposes.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lock className="h-4 w-4" />
                    <span>Security Headers</span>
                  </CardTitle>
                  <CardDescription>Additional security configurations</CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      All requests are automatically secured with appropriate headers and follow security best
                      practices.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-4 w-4" />
                    <span>Performance Tuning</span>
                  </CardTitle>
                  <CardDescription>Advanced settings for performance optimization</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      These are advanced settings. Changing them may affect application performance and stability.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Connection Pool Size</Label>
                        <Select defaultValue="10">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5 connections</SelectItem>
                            <SelectItem value="10">10 connections</SelectItem>
                            <SelectItem value="20">20 connections</SelectItem>
                            <SelectItem value="50">50 connections</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>DNS Cache TTL</Label>
                        <Select defaultValue="300">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="60">1 minute</SelectItem>
                            <SelectItem value="300">5 minutes</SelectItem>
                            <SelectItem value="600">10 minutes</SelectItem>
                            <SelectItem value="3600">1 hour</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Request Queue Size</Label>
                      <Select defaultValue="100">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="50">50 requests</SelectItem>
                          <SelectItem value="100">100 requests</SelectItem>
                          <SelectItem value="200">200 requests</SelectItem>
                          <SelectItem value="500">500 requests</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Timer className="h-4 w-4" />
                    <span>Debugging & Logging</span>
                  </CardTitle>
                  <CardDescription>Configure logging and debugging options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Request Logging</Label>
                      <p className="text-sm text-muted-foreground">Log all outgoing requests for debugging</p>
                    </div>
                    <Switch defaultChecked={false} />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Verbose Error Messages</Label>
                      <p className="text-sm text-muted-foreground">Show detailed error information</p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  )
}
