"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy, Search, Download, Eye, Code, Table } from "lucide-react"
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

  // Save scroll position before updates
  useEffect(() => {
    const scrollElement = scrollAreaRef.current?.querySelector("[data-radix-scroll-area-viewport]")
    if (scrollElement) {
      const handleScroll = () => {
        setScrollPosition(scrollElement.scrollTop)
      }
      scrollElement.addEventListener("scroll", handleScroll)
      return () => scrollElement.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Restore scroll position after updates
  useEffect(() => {
    if (response) {
      const scrollElement = scrollAreaRef.current?.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollElement) {
        setTimeout(() => {
          scrollElement.scrollTop = scrollPosition
        }, 0)
      }
    }
  }, [response, scrollPosition])

  const formatJSON = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString)
      return JSON.stringify(parsed, null, 2)
    } catch (error) {
      return jsonString
    }
  }

  const highlightSearchTerm = useMemo(() => {
    return (text: string, term: string) => {
      if (!term.trim()) return text

      const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
      return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>')
    }
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Response content copied successfully",
    })
  }

  const downloadResponse = () => {
    if (!response) return

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
      description: "Response downloaded successfully",
    })
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "bg-green-500"
    if (status >= 300 && status < 400) return "bg-yellow-500"
    if (status >= 400 && status < 500) return "bg-orange-500"
    if (status >= 500) return "bg-red-500"
    return "bg-gray-500"
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const filteredBody = useMemo(() => {
    if (!response?.body || !searchTerm.trim()) return response?.body || ""

    const formattedBody = formatJSON(response.body)
    return highlightSearchTerm(formattedBody, searchTerm)
  }, [response?.body, searchTerm, highlightSearchTerm])

  if (!response) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Send a request to see the response</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Response Header */}
      <div className="border-b p-4 bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(response.status)}`} />
              <span className="font-medium">
                {response.status} {response.statusText}
              </span>
            </div>
            <Badge variant="secondary">{response.time}ms</Badge>
            <Badge variant="outline">{formatSize(response.size)}</Badge>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search response..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
            <Button size="sm" variant="outline" onClick={() => copyToClipboard(response.body)}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={downloadResponse}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Response Content */}
      <div className="flex-1 min-h-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="mx-4 mt-4">
            <TabsTrigger value="body">Body</TabsTrigger>
            <TabsTrigger value="headers">Headers ({Object.keys(response.headers).length})</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="body" className="flex-1 min-h-0 mx-4 mb-4">
            <ScrollArea ref={scrollAreaRef} className="h-full border rounded">
              <pre className="p-4 text-sm font-mono whitespace-pre-wrap">
                <code
                  dangerouslySetInnerHTML={{
                    __html: filteredBody,
                  }}
                />
              </pre>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="headers" className="flex-1 min-h-0 mx-4 mb-4">
            <ScrollArea className="h-full border rounded">
              <div className="p-4">
                <div className="space-y-2">
                  {Object.entries(response.headers).map(([key, value]) => (
                    <div key={key} className="flex items-start space-x-4 py-2 border-b last:border-b-0">
                      <div className="font-medium text-sm min-w-0 flex-1">
                        {highlightSearchTerm(key, searchTerm) ? (
                          <span dangerouslySetInnerHTML={{ __html: highlightSearchTerm(key, searchTerm) }} />
                        ) : (
                          key
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground min-w-0 flex-1 break-all">
                        {highlightSearchTerm(value, searchTerm) ? (
                          <span dangerouslySetInnerHTML={{ __html: highlightSearchTerm(value, searchTerm) }} />
                        ) : (
                          value
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="preview" className="flex-1 min-h-0 mx-4 mb-4">
            <ScrollArea className="h-full border rounded">
              <div className="p-4">
                {(() => {
                  try {
                    const jsonData = JSON.parse(response.body)

                    if (Array.isArray(jsonData)) {
                      return (
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Table className="h-4 w-4" />
                            <span className="font-medium">Array ({jsonData.length} items)</span>
                          </div>
                          <div className="grid gap-2">
                            {jsonData.slice(0, 10).map((item, index) => (
                              <div key={index} className="p-3 bg-muted rounded border">
                                <div className="text-sm font-medium mb-1">Item {index + 1}</div>
                                <pre className="text-xs text-muted-foreground">{JSON.stringify(item, null, 2)}</pre>
                              </div>
                            ))}
                            {jsonData.length > 10 && (
                              <div className="text-sm text-muted-foreground text-center py-2">
                                ... and {jsonData.length - 10} more items
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    } else if (typeof jsonData === "object" && jsonData !== null) {
                      return (
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Eye className="h-4 w-4" />
                            <span className="font-medium">Object Preview</span>
                          </div>
                          <div className="grid gap-3">
                            {Object.entries(jsonData).map(([key, value]) => (
                              <div key={key} className="flex items-start space-x-3 p-3 bg-muted rounded border">
                                <div className="font-medium text-sm min-w-0 flex-shrink-0">{key}:</div>
                                <div className="text-sm text-muted-foreground min-w-0 flex-1">
                                  {typeof value === "object" ? (
                                    <pre className="text-xs">{JSON.stringify(value, null, 2)}</pre>
                                  ) : (
                                    <span className="break-all">{String(value)}</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    } else {
                      return (
                        <div className="text-center py-8">
                          <Code className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-muted-foreground">Primitive value: {String(jsonData)}</p>
                        </div>
                      )
                    }
                  } catch (error) {
                    return (
                      <div className="text-center py-8">
                        <Code className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">Raw text response</p>
                        <pre className="mt-4 p-4 bg-muted rounded text-sm text-left">{response.body}</pre>
                      </div>
                    )
                  }
                })()}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
