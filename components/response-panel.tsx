"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Copy, Download, Search, X, Clock, Database, CheckCircle, AlertCircle } from "lucide-react"
import type { ResponseData } from "@/types/api-studio"
import { toast } from "@/hooks/use-toast"

interface ResponsePanelProps {
  response: ResponseData | null
  onResponseUpdate?: (response: ResponseData | null) => void
}

export function ResponsePanel({ response, onResponseUpdate }: ResponsePanelProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("body")
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [scrollPosition, setScrollPosition] = useState(0)

  // Preserve scroll position when content updates
  useEffect(() => {
    if (scrollAreaRef.current && scrollPosition > 0) {
      scrollAreaRef.current.scrollTop = scrollPosition
    }
  }, [response, scrollPosition])

  const handleScroll = () => {
    if (scrollAreaRef.current) {
      setScrollPosition(scrollAreaRef.current.scrollTop)
    }
  }

  const formatJson = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString)
      return JSON.stringify(parsed, null, 2)
    } catch {
      return jsonString
    }
  }

  const highlightSearchTerm = useMemo(() => {
    return (text: string, searchTerm: string) => {
      if (!searchTerm.trim()) return text

      const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
      return text.replace(regex, '<mark class="bg-yellow-200 text-yellow-900">$1</mark>')
    }
  }, [])

  const getFormattedBody = useMemo(() => {
    if (!response?.body) return ""

    let formatted = response.body
    const contentType = response.headers?.["content-type"] || ""

    if (contentType.includes("application/json")) {
      formatted = formatJson(response.body)
    }

    if (searchTerm.trim()) {
      formatted = highlightSearchTerm(formatted, searchTerm)
    }

    return formatted
  }, [response?.body, response?.headers, searchTerm, highlightSearchTerm])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied to clipboard",
        description: "Response content copied successfully",
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const downloadResponse = () => {
    if (!response?.body) return

    const blob = new Blob([response.body], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "response.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Download started",
      description: "Response downloaded successfully",
    })
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "text-green-600 bg-green-50 border-green-200"
    if (status >= 300 && status < 400) return "text-blue-600 bg-blue-50 border-blue-200"
    if (status >= 400 && status < 500) return "text-orange-600 bg-orange-50 border-orange-200"
    if (status >= 500) return "text-red-600 bg-red-50 border-red-200"
    return "text-gray-600 bg-gray-50 border-gray-200"
  }

  const getStatusIcon = (status: number) => {
    if (status >= 200 && status < 300) return <CheckCircle className="w-4 h-4" />
    if (status >= 400) return <AlertCircle className="w-4 h-4" />
    return <Clock className="w-4 h-4" />
  }

  if (!response) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/30">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Database className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-muted-foreground">No Response Yet</h3>
            <p className="text-sm text-muted-foreground">Send a request to see the response here</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Response Header */}
      <div className="border-b p-4 bg-muted/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Badge className={`${getStatusColor(response.status)} border`}>
              <div className="flex items-center space-x-1">
                {getStatusIcon(response.status)}
                <span>
                  {response.status} {response.statusText}
                </span>
              </div>
            </Badge>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{response.time}ms</span>
              </div>
              <div className="flex items-center space-x-1">
                <Database className="w-4 h-4" />
                <span>{(response.size / 1024).toFixed(2)} KB</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="outline" onClick={() => copyToClipboard(response.body)}>
              <Copy className="w-4 h-4 mr-1" />
              Copy
            </Button>
            <Button size="sm" variant="outline" onClick={downloadResponse}>
              <Download className="w-4 h-4 mr-1" />
              Download
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search in response..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => setSearchTerm("")}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Response Content */}
      <div className="flex-1 min-h-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="mx-4 mt-4 w-fit">
            <TabsTrigger value="body">Body</TabsTrigger>
            <TabsTrigger value="headers">Headers ({Object.keys(response.headers || {}).length})</TabsTrigger>
            <TabsTrigger value="cookies">Cookies</TabsTrigger>
          </TabsList>

          <div className="flex-1 min-h-0 p-4">
            <TabsContent value="body" className="h-full mt-0">
              <Card className="h-full">
                <CardContent className="p-0 h-full">
                  <ScrollArea className="h-full" ref={scrollAreaRef} onScrollCapture={handleScroll}>
                    <pre
                      className="p-4 text-sm font-mono whitespace-pre-wrap break-words"
                      dangerouslySetInnerHTML={{ __html: getFormattedBody }}
                    />
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="headers" className="h-full mt-0">
              <Card className="h-full">
                <CardContent className="p-0 h-full">
                  <ScrollArea className="h-full">
                    <div className="p-4 space-y-2">
                      {Object.entries(response.headers || {}).map(([key, value]) => (
                        <div key={key} className="flex items-start space-x-4 py-2 border-b border-border last:border-0">
                          <div className="font-medium text-sm min-w-0 flex-1">
                            {searchTerm ? (
                              <span dangerouslySetInnerHTML={{ __html: highlightSearchTerm(key, searchTerm) }} />
                            ) : (
                              key
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground min-w-0 flex-1 break-words">
                            {searchTerm ? (
                              <span dangerouslySetInnerHTML={{ __html: highlightSearchTerm(value, searchTerm) }} />
                            ) : (
                              value
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(`${key}: ${value}`)}
                            className="h-6 w-6 p-0 flex-shrink-0"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                      {Object.keys(response.headers || {}).length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">No headers found</div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cookies" className="h-full mt-0">
              <Card className="h-full">
                <CardContent className="p-0 h-full">
                  <ScrollArea className="h-full">
                    <div className="p-4">
                      <div className="text-center py-8 text-muted-foreground">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-2">
                          <Database className="w-6 h-6" />
                        </div>
                        <p>No cookies found in response</p>
                        <p className="text-xs mt-1">Cookies will appear here when present</p>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
