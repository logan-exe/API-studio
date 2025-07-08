"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Copy, Globe, Minimize2, Wand2, Search, X } from "lucide-react"
import type { ResponseData } from "@/types/api-studio"
import { toast } from "@/hooks/use-toast"

interface ResponsePanelProps {
  response: ResponseData | null
  onResponseUpdate: (response: ResponseData) => void
}

export function ResponsePanel({ response, onResponseUpdate }: ResponsePanelProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showSearch, setShowSearch] = useState(false)

  const formatJSON = (jsonString: string, prettify = true) => {
    try {
      const parsed = JSON.parse(jsonString)
      return prettify ? JSON.stringify(parsed, null, 2) : JSON.stringify(parsed)
    } catch (error) {
      throw new Error("Invalid JSON format")
    }
  }

  const formatResponseBody = (body: string, contentType = "") => {
    try {
      if (contentType.includes("application/json") || contentType.includes("json")) {
        const parsed = JSON.parse(body)
        return JSON.stringify(parsed, null, 2)
      }
      if (contentType.includes("application/xml") || contentType.includes("xml")) {
        return body.replace(/></g, ">\n<").replace(/^\s*\n/gm, "")
      }
    } catch (error) {
      console.warn("Failed to format response body:", error)
    }
    return body
  }

  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text

    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>')
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "bg-green-500"
    if (status >= 300 && status < 400) return "bg-yellow-500"
    if (status >= 400 && status < 500) return "bg-orange-500"
    if (status >= 500) return "bg-red-500"
    return "bg-gray-500"
  }

  if (!response) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Send a request to see the response</p>
        </div>
      </div>
    )
  }

  const isJSON = response.headers["content-type"]?.includes("json")
  const formattedBody = formatResponseBody(response.body, response.headers["content-type"] || "")
  const displayBody = showSearch && searchTerm ? highlightSearchTerm(formattedBody, searchTerm) : formattedBody

  return (
    <div className="h-full flex flex-col">
      {/* Response Header */}
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge className={`${getStatusColor(response.status)} text-white`}>
              {response.status} {response.statusText}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {response.time}ms • {Math.round(response.size / 1024)}KB
            </span>
          </div>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowSearch(!showSearch)
                if (!showSearch) {
                  setSearchTerm("")
                }
              }}
            >
              <Search className="h-4 w-4" />
              Search
            </Button>
            {isJSON && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    try {
                      const formatted = formatJSON(response.body, true)
                      onResponseUpdate({ ...response, body: formatted })
                      toast({ title: "Response formatted" })
                    } catch (error) {
                      toast({
                        title: "Cannot format",
                        description: "Response is not valid JSON",
                        variant: "destructive",
                      })
                    }
                  }}
                >
                  <Wand2 className="h-4 w-4" />
                  Pretty
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    try {
                      const minified = formatJSON(response.body, false)
                      onResponseUpdate({ ...response, body: minified })
                      toast({ title: "Response minified" })
                    } catch (error) {
                      toast({
                        title: "Cannot minify",
                        description: "Response is not valid JSON",
                        variant: "destructive",
                      })
                    }
                  }}
                >
                  <Minimize2 className="h-4 w-4" />
                  Minify
                </Button>
              </>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(response.body)
                toast({ title: "Copied to clipboard" })
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="mt-3 flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowSearch(false)
                setSearchTerm("")
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Response Content */}
      <div className="flex-1 min-h-0">
        <Tabs defaultValue="body" className="h-full flex flex-col">
          <div className="px-4 pt-2">
            <TabsList>
              <TabsTrigger value="body">Response Body</TabsTrigger>
              <TabsTrigger value="headers">Headers</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="body" className="flex-1 min-h-0 px-4 pb-4">
            <div className="h-full border rounded">
              <ScrollArea className="h-full">
                <pre
                  className="text-sm font-mono whitespace-pre-wrap p-4"
                  dangerouslySetInnerHTML={{
                    __html: showSearch && searchTerm ? displayBody : formattedBody,
                  }}
                />
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="headers" className="flex-1 min-h-0 px-4 pb-4">
            <div className="h-full border rounded">
              <ScrollArea className="h-full">
                <div className="space-y-2 p-4">
                  {Object.entries(response.headers).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="font-medium">{key}</span>
                      <span className="text-sm text-muted-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
