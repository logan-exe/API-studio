"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Copy, Search, Download, Eye, Code } from "lucide-react"
import type { ResponseData } from "@/types/api-studio"
import { toast } from "@/hooks/use-toast"

interface ResponsePanelProps {
  response: ResponseData | null
  onResponseUpdate?: (response: ResponseData | null) => void
}

export function ResponsePanel({ response, onResponseUpdate }: ResponsePanelProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("body")
  const [isUserScrolling, setIsUserScrolling] = useState(false)
  const [lastScrollTop, setLastScrollTop] = useState(0)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const userScrollTimeoutRef = useRef<NodeJS.Timeout>()

  // Handle scroll behavior to prevent auto-scrolling when user is reading
  const handleScroll = useCallback(
    (event: Event) => {
      const target = event.target as HTMLElement
      const currentScrollTop = target.scrollTop

      // Detect if user is actively scrolling
      if (Math.abs(currentScrollTop - lastScrollTop) > 5) {
        setIsUserScrolling(true)

        // Clear existing timeout
        if (userScrollTimeoutRef.current) {
          clearTimeout(userScrollTimeoutRef.current)
        }

        // Reset user scrolling flag after 2 seconds of no scrolling
        userScrollTimeoutRef.current = setTimeout(() => {
          setIsUserScrolling(false)
        }, 2000)
      }

      setLastScrollTop(currentScrollTop)
    },
    [lastScrollTop],
  )

  // Attach scroll listener
  useEffect(() => {
    const scrollElement = scrollAreaRef.current?.querySelector("[data-radix-scroll-area-viewport]")

    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleScroll, { passive: true })

      return () => {
        scrollElement.removeEventListener("scroll", handleScroll)
        if (userScrollTimeoutRef.current) {
          clearTimeout(userScrollTimeoutRef.current)
        }
      }
    }
  }, [handleScroll])

  // Only restore scroll position if user isn't actively scrolling
  useEffect(() => {
    if (response && !isUserScrolling) {
      requestAnimationFrame(() => {
        const scrollElement = scrollAreaRef.current?.querySelector("[data-radix-scroll-area-viewport]")
        if (scrollElement && lastScrollTop > 0) {
          scrollElement.scrollTop = lastScrollTop
        }
      })
    }
  }, [response, isUserScrolling, lastScrollTop])

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied to clipboard",
        description: "Response content has been copied to your clipboard.",
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard. Please try again.",
        variant: "destructive",
      })
    }
  }, [])

  const downloadResponse = useCallback(() => {
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
      description: "Response has been downloaded to your device.",
    })
  }, [response])

  const formatJSON = useCallback((jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString)
      return JSON.stringify(parsed, null, 2)
    } catch (error) {
      return jsonString
    }
  }, [])

  const highlightSearchTerm = useCallback((text: string, term: string) => {
    if (!term.trim()) return text

    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>')
  }, [])

  const filteredBody = useMemo(() => {
    if (!response?.body || !searchTerm.trim()) return response?.body || ""

    const formattedBody = formatJSON(response.body)
    return highlightSearchTerm(formattedBody, searchTerm)
  }, [response?.body, searchTerm, formatJSON, highlightSearchTerm])

  const getStatusColor = useCallback((status: number) => {
    if (status >= 200 && status < 300) return "bg-green-500"
    if (status >= 300 && status < 400) return "bg-yellow-500"
    if (status >= 400 && status < 500) return "bg-orange-500"
    if (status >= 500) return "bg-red-500"
    return "bg-gray-500"
  }, [])

  const formatTime = useCallback((time: number) => {
    if (time < 1000) return `${time}ms`
    return `${(time / 1000).toFixed(2)}s`
  }, [])

  const formatSize = useCallback((size: number) => {
    if (size < 1024) return `${size}B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`
    return `${(size / (1024 * 1024)).toFixed(1)}MB`
  }, [])

  if (!response) {
    return (
      <div className="h-full flex items-center justify-center border-l bg-muted/30">
        <div className="text-center text-muted-foreground">
          <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No Response</p>
          <p className="text-sm">Send a request to see the response here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col border-l">
      {/* Response Header */}
      <div className="border-b p-4 bg-muted/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Badge className={`${getStatusColor(response.status)} text-white`}>
              {response.status} {response.statusText}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {formatTime(response.time)} • {formatSize(response.size)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => copyToClipboard(response.body)}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={downloadResponse}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search in response..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Response Content */}
      <div className="flex-1 min-h-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="body" className="flex items-center space-x-2">
              <Code className="h-4 w-4" />
              <span>Body</span>
            </TabsTrigger>
            <TabsTrigger value="headers">Headers ({Object.keys(response.headers).length})</TabsTrigger>
          </TabsList>

          <TabsContent value="body" className="flex-1 min-h-0 mt-0">
            <ScrollArea ref={scrollAreaRef} className="h-full">
              <div className="p-4">
                <pre
                  className="text-sm font-mono whitespace-pre-wrap break-words"
                  dangerouslySetInnerHTML={{
                    __html: searchTerm ? filteredBody : formatJSON(response.body),
                  }}
                />
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="headers" className="flex-1 min-h-0 mt-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-2">
                {Object.entries(response.headers).map(([key, value]) => (
                  <div key={key} className="flex items-start space-x-3 py-2 border-b border-border/50">
                    <span className="font-medium text-sm min-w-0 flex-shrink-0">{key}:</span>
                    <span className="text-sm text-muted-foreground break-all">{value}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
