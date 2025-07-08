"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Download, Search, Eye, EyeOff } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { ResponseData } from "@/types/api-studio"

interface ResponsePanelProps {
  response: ResponseData | null
  onResponseUpdate?: (response: ResponseData | null) => void
}

export function ResponsePanel({ response, onResponseUpdate }: ResponsePanelProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [showRawHeaders, setShowRawHeaders] = useState(false)
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

  const highlightSearchTerm = (text: string, term: string) => {
    if (!term.trim()) return text

    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
    return text.replace(regex, '<mark class="bg-yellow-200 text-yellow-900 px-1 rounded">$1</mark>')
  }

  const formatResponseBody = useMemo(() => {
    if (!response?.body) return ""

    let formattedBody = response.body
    const contentType = response.headers?.["content-type"] || response.headers?.["Content-Type"] || ""

    // Format JSON
    if (contentType.includes("application/json") || contentType.includes("text/json")) {
      try {
        const parsed = JSON.parse(response.body)
        formattedBody = JSON.stringify(parsed, null, 2)
      } catch {
        // Keep original if parsing fails
      }
    }

    // Apply search highlighting
    if (searchTerm.trim()) {
      formattedBody = highlightSearchTerm(formattedBody, searchTerm)
    }

    return formattedBody
  }, [response?.body, response?.headers, searchTerm])

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied to clipboard",
        description: `${label} copied successfully`,
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

    const blob = new Blob([response.body], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `response-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Download started",
      description: "Response body downloaded successfully",
    })
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "bg-green-100 text-green-800 border-green-200"
    if (status >= 300 && status < 400) return "bg-blue-100 text-blue-800 border-blue-200"
    if (status >= 400 && status < 500) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    if (status >= 500) return "bg-red-100 text-red-800 border-red-200"
    return "bg-gray-100 text-gray-800 border-gray-200"
  }

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  if (!response) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/30">
        <div className="text-center text-muted-foreground">
          <div className="text-lg font-medium mb-2">No Response</div>
          <div className="text-sm">Send a request to see the response here</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Response Header */}
      <div className="border-b p-4 bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Badge className={`${getStatusColor(response.status)} font-mono`}>
              {response.status} {response.statusText}
            </Badge>
            <div className="text-sm text-muted-foreground">
              Time: <span className="font-mono font-medium">{response.time}ms</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Size: <span className="font-mono font-medium">{(response.size / 1024).toFixed(2)} KB</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search response..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => copyToClipboard(response.body, "Response body")}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={downloadResponse}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </div>

      {/* Response Content */}
      <div className="flex-1 min-h-0">
        <Tabs defaultValue="body" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 rounded-none border-b">
            <TabsTrigger value="body">Body</TabsTrigger>
            <TabsTrigger value="headers">Headers ({Object.keys(response.headers || {}).length})</TabsTrigger>
            <TabsTrigger value="cookies">Cookies</TabsTrigger>
          </TabsList>

          <TabsContent value="body" className="flex-1 min-h-0 m-0">
            <ScrollArea className="h-full" ref={scrollAreaRef} onScrollCapture={handleScroll}>
              <div className="p-4">
                {response.body ? (
                  <Card>
                    <CardContent className="p-0">
                      <pre
                        className="text-sm font-mono whitespace-pre-wrap break-words p-4 overflow-hidden"
                        dangerouslySetInnerHTML={{ __html: formatResponseBody }}
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <div className="text-lg font-medium mb-2">No Response Body</div>
                    <div className="text-sm">This response doesn't contain a body</div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="headers" className="flex-1 min-h-0 m-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Response Headers</h3>
                  <Button variant="outline" size="sm" onClick={() => setShowRawHeaders(!showRawHeaders)}>
                    {showRawHeaders ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                    {showRawHeaders ? "Formatted" : "Raw"}
                  </Button>
                </div>

                {response.headers && Object.keys(response.headers).length > 0 ? (
                  <Card>
                    <CardContent className="p-0">
                      {showRawHeaders ? (
                        <pre className="text-sm font-mono p-4 whitespace-pre-wrap">
                          {Object.entries(response.headers)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join("\n")}
                        </pre>
                      ) : (
                        <div className="divide-y">
                          {Object.entries(response.headers).map(([key, value], index) => (
                            <div key={index} className="p-4 hover:bg-muted/50">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm text-foreground">{key}</div>
                                  <div className="text-sm text-muted-foreground font-mono break-all mt-1">
                                    {searchTerm ? (
                                      <span
                                        dangerouslySetInnerHTML={{
                                          __html: highlightSearchTerm(value, searchTerm),
                                        }}
                                      />
                                    ) : (
                                      value
                                    )}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(value, `Header ${key}`)}
                                  className="ml-2 flex-shrink-0"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <div className="text-lg font-medium mb-2">No Headers</div>
                    <div className="text-sm">This response doesn't contain headers</div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="cookies" className="flex-1 min-h-0 m-0">
            <ScrollArea className="h-full">
              <div className="p-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Cookies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center text-muted-foreground py-8">
                      <div className="text-lg font-medium mb-2">No Cookies</div>
                      <div className="text-sm">This response doesn't set any cookies</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
