"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Copy, Code2 } from "lucide-react"
import type { RequestData } from "@/types/api-studio"
import { toast } from "@/hooks/use-toast"

interface CodeGeneratorProps {
  request: RequestData
  replaceEnvironmentVariables: (text: string) => string
}

export function CodeGenerator({ request, replaceEnvironmentVariables }: CodeGeneratorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState("curl")

  const generateCode = (language: string) => {
    const url = replaceEnvironmentVariables(request.url)
    const method = request.method
    const headers = request.headers.filter((h) => h.enabled && h.key && h.value)
    const body = request.body ? replaceEnvironmentVariables(request.body) : ""

    switch (language) {
      case "curl":
        return generateCurl(method, url, headers, body, request)
      case "javascript":
        return generateJavaScript(method, url, headers, body, request)
      case "python":
        return generatePython(method, url, headers, body, request)
      case "node":
        return generateNode(method, url, headers, body, request)
      case "php":
        return generatePHP(method, url, headers, body, request)
      case "go":
        return generateGo(method, url, headers, body, request)
      default:
        return "// Select a language to generate code"
    }
  }

  const generateCurl = (method: string, url: string, headers: any[], body: string, request: RequestData) => {
    let curl = `curl -X ${method} "${url}"`

    headers.forEach((header) => {
      curl += ` \\\n  -H "${header.key}: ${replaceEnvironmentVariables(header.value)}"`
    })

    if (request.auth.type === "bearer" && request.auth.token) {
      curl += ` \\\n  -H "Authorization: Bearer ${replaceEnvironmentVariables(request.auth.token)}"`
    } else if (request.auth.type === "basic" && request.auth.username && request.auth.password) {
      curl += ` \\\n  -u "${request.auth.username}:${request.auth.password}"`
    }

    if (body && ["POST", "PUT", "PATCH"].includes(method)) {
      if (request.bodyType === "json") {
        curl += ` \\\n  -H "Content-Type: application/json"`
        curl += ` \\\n  -d '${body}'`
      } else if (request.bodyType === "form-data") {
        request.formData.forEach((field) => {
          if (field.key && field.value && field.type === "text") {
            curl += ` \\\n  -F "${field.key}=${replaceEnvironmentVariables(field.value)}"`
          }
        })
      }
    }

    return curl
  }

  const generateJavaScript = (method: string, url: string, headers: any[], body: string, request: RequestData) => {
    const headersObj = headers.reduce(
      (acc, header) => {
        acc[header.key] = replaceEnvironmentVariables(header.value)
        return acc
      },
      {} as Record<string, string>,
    )

    if (request.auth.type === "bearer" && request.auth.token) {
      headersObj["Authorization"] = `Bearer ${replaceEnvironmentVariables(request.auth.token)}`
    }

    let code = `fetch("${url}", {\n  method: "${method}"`

    if (Object.keys(headersObj).length > 0) {
      code += `,\n  headers: ${JSON.stringify(headersObj, null, 4).replace(/^/gm, "  ")}`
    }

    if (body && ["POST", "PUT", "PATCH"].includes(method)) {
      if (request.bodyType === "json") {
        headersObj["Content-Type"] = "application/json"
        code += `,\n  body: JSON.stringify(${body})`
      } else {
        code += `,\n  body: "${body}"`
      }
    }

    code += `\n})\n.then(response => response.json())\n.then(data => console.log(data))\n.catch(error => console.error('Error:', error));`

    return code
  }

  const generatePython = (method: string, url: string, headers: any[], body: string, request: RequestData) => {
    let code = `import requests\nimport json\n\n`

    code += `url = "${url}"\n\n`

    if (headers.length > 0 || request.auth.type !== "none") {
      code += `headers = {\n`
      headers.forEach((header) => {
        code += `    "${header.key}": "${replaceEnvironmentVariables(header.value)}",\n`
      })

      if (request.auth.type === "bearer" && request.auth.token) {
        code += `    "Authorization": "Bearer ${replaceEnvironmentVariables(request.auth.token)}",\n`
      }

      code += `}\n\n`
    }

    if (body && ["POST", "PUT", "PATCH"].includes(method)) {
      if (request.bodyType === "json") {
        code += `data = ${body}\n\n`
        code += `response = requests.${method.toLowerCase()}(url, headers=headers, json=data)`
      } else {
        code += `data = "${body}"\n\n`
        code += `response = requests.${method.toLowerCase()}(url, headers=headers, data=data)`
      }
    } else {
      code += `response = requests.${method.toLowerCase()}(url${headers.length > 0 ? ", headers=headers" : ""})`
    }

    code += `\n\nprint(f"Status Code: {response.status_code}")\nprint(f"Response: {response.text}")`

    return code
  }

  const generateNode = (method: string, url: string, headers: any[], body: string, request: RequestData) => {
    let code = `const https = require('https');\nconst http = require('http');\nconst { URL } = require('url');\n\n`

    code += `const url = new URL("${url}");\nconst isHttps = url.protocol === 'https:';\nconst client = isHttps ? https : http;\n\n`

    code += `const options = {\n  hostname: url.hostname,\n  port: url.port || (isHttps ? 443 : 80),\n  path: url.pathname + url.search,\n  method: "${method}"`

    if (headers.length > 0 || request.auth.type !== "none") {
      code += `,\n  headers: {\n`
      headers.forEach((header) => {
        code += `    "${header.key}": "${replaceEnvironmentVariables(header.value)}",\n`
      })

      if (request.auth.type === "bearer" && request.auth.token) {
        code += `    "Authorization": "Bearer ${replaceEnvironmentVariables(request.auth.token)}",\n`
      }

      code += `  }`
    }

    code += `\n};\n\n`

    code += `const req = client.request(options, (res) => {\n  let data = '';\n  res.on('data', (chunk) => {\n    data += chunk;\n  });\n  res.on('end', () => {\n    console.log('Status:', res.statusCode);\n    console.log('Response:', data);\n  });\n});\n\n`

    if (body && ["POST", "PUT", "PATCH"].includes(method)) {
      code += `req.write('${body}');\n`
    }

    code += `req.on('error', (error) => {\n  console.error('Error:', error);\n});\n\nreq.end();`

    return code
  }

  const generatePHP = (method: string, url: string, headers: any[], body: string, request: RequestData) => {
    let code = `<?php\n\n$url = "${url}";\n\n`

    if (headers.length > 0 || request.auth.type !== "none") {
      code += `$headers = [\n`
      headers.forEach((header) => {
        code += `    "${header.key}: ${replaceEnvironmentVariables(header.value)}",\n`
      })

      if (request.auth.type === "bearer" && request.auth.token) {
        code += `    "Authorization: Bearer ${replaceEnvironmentVariables(request.auth.token)}",\n`
      }

      code += `];\n\n`
    }

    code += `$options = [\n    'http' => [\n        'method' => '${method}'`

    if (headers.length > 0) {
      code += `,\n        'header' => implode("\\r\\n", $headers)`
    }

    if (body && ["POST", "PUT", "PATCH"].includes(method)) {
      code += `,\n        'content' => '${body}'`
    }

    code += `\n    ]\n];\n\n`

    code += `$context = stream_context_create($options);\n$response = file_get_contents($url, false, $context);\n\nif ($response === FALSE) {\n    echo "Error occurred";\n} else {\n    echo $response;\n}\n\n?>`

    return code
  }

  const generateGo = (method: string, url: string, headers: any[], body: string, request: RequestData) => {
    let code = `package main\n\nimport (\n    "fmt"\n    "io"\n    "net/http"\n    "strings"\n)\n\nfunc main() {\n`

    if (body && ["POST", "PUT", "PATCH"].includes(method)) {
      code += `    payload := strings.NewReader(\`${body}\`)\n\n`
      code += `    req, err := http.NewRequest("${method}", "${url}", payload)\n`
    } else {
      code += `    req, err := http.NewRequest("${method}", "${url}", nil)\n`
    }

    code += `    if err != nil {\n        fmt.Println(err)\n        return\n    }\n\n`

    headers.forEach((header) => {
      code += `    req.Header.Add("${header.key}", "${replaceEnvironmentVariables(header.value)}")\n`
    })

    if (request.auth.type === "bearer" && request.auth.token) {
      code += `    req.Header.Add("Authorization", "Bearer ${replaceEnvironmentVariables(request.auth.token)}")\n`
    }

    code += `\n    client := &http.Client{}\n    res, err := client.Do(req)\n    if err != nil {\n        fmt.Println(err)\n        return\n    }\n    defer res.Body.Close()\n\n`

    code += `    body, err := io.ReadAll(res.Body)\n    if err != nil {\n        fmt.Println(err)\n        return\n    }\n\n    fmt.Println(string(body))\n}`

    return code
  }

  const copyToClipboard = () => {
    const code = generateCode(selectedLanguage)
    navigator.clipboard.writeText(code)
    toast({
      title: "Copied to clipboard",
      description: `${selectedLanguage} code copied successfully`,
    })
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="sm" variant="outline">
          <Code2 className="h-4 w-4" />
          Code
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[800px] sm:w-[800px]">
        <SheetHeader>
          <SheetTitle>Generate Code</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="curl">cURL</SelectItem>
                <SelectItem value="javascript">JavaScript (Fetch)</SelectItem>
                <SelectItem value="python">Python (Requests)</SelectItem>
                <SelectItem value="node">Node.js (HTTP)</SelectItem>
                <SelectItem value="php">PHP</SelectItem>
                <SelectItem value="go">Go</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={copyToClipboard} size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Copy Code
            </Button>
          </div>

          <div className="border rounded-lg">
            <ScrollArea className="h-[600px]">
              <pre className="p-4 text-sm font-mono whitespace-pre-wrap">{generateCode(selectedLanguage)}</pre>
            </ScrollArea>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
