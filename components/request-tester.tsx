"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Plus, Trash2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface TestCase {
  id: string
  name: string
  assertion: string
  expected: string
  actual?: string
  passed?: boolean
}

interface RequestTesterProps {
  response: any
  onRunTests: (tests: TestCase[]) => void
}

export function RequestTester({ response, onRunTests }: RequestTesterProps) {
  const [tests, setTests] = useState<TestCase[]>([
    { id: "1", name: "Status Code", assertion: "status", expected: "200" },
  ])

  const addTest = () => {
    const newTest: TestCase = {
      id: Date.now().toString(),
      name: "New Test",
      assertion: "status",
      expected: "",
    }
    setTests([...tests, newTest])
  }

  const updateTest = (id: string, field: keyof TestCase, value: string) => {
    setTests(tests.map((test) => (test.id === id ? { ...test, [field]: value } : test)))
  }

  const removeTest = (id: string) => {
    setTests(tests.filter((test) => test.id !== id))
  }

  const runTests = () => {
    if (!response) {
      toast({
        title: "No response",
        description: "Send a request first to run tests",
        variant: "destructive",
      })
      return
    }

    const updatedTests = tests.map((test) => {
      let actual = ""
      let passed = false

      try {
        switch (test.assertion) {
          case "status":
            actual = response.status.toString()
            passed = actual === test.expected
            break
          case "header":
            const headerValue = response.headers[test.expected.toLowerCase()]
            actual = headerValue || ""
            passed = !!headerValue
            break
          case "body-contains":
            actual = response.body
            passed = response.body.includes(test.expected)
            break
          case "json-path":
            try {
              const jsonResponse = JSON.parse(response.body)
              const keys = test.expected.split(".")
              let value = jsonResponse
              for (const key of keys) {
                value = value[key]
              }
              actual = JSON.stringify(value)
              passed = value !== undefined
            } catch {
              actual = "Invalid JSON or path"
              passed = false
            }
            break
          default:
            actual = "Unknown assertion"
            passed = false
        }
      } catch (error) {
        actual = "Error: " + (error instanceof Error ? error.message : "Unknown error")
        passed = false
      }

      return { ...test, actual, passed }
    })

    setTests(updatedTests)
    onRunTests(updatedTests)

    const passedCount = updatedTests.filter((t) => t.passed).length
    toast({
      title: "Tests completed",
      description: `${passedCount}/${updatedTests.length} tests passed`,
      variant: passedCount === updatedTests.length ? "default" : "destructive",
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Tests</CardTitle>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" onClick={addTest}>
              <Plus className="h-4 w-4" />
              Add Test
            </Button>
            <Button size="sm" onClick={runTests}>
              <Play className="h-4 w-4" />
              Run Tests
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tests.map((test) => (
            <div key={test.id} className="border rounded p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Input
                  placeholder="Test name"
                  value={test.name}
                  onChange={(e) => updateTest(test.id, "name", e.target.value)}
                  className="flex-1 mr-2"
                />
                <Button size="sm" variant="ghost" onClick={() => removeTest(test.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Assertion Type</Label>
                  <select
                    value={test.assertion}
                    onChange={(e) => updateTest(test.id, "assertion", e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="status">Status Code</option>
                    <option value="header">Header Exists</option>
                    <option value="body-contains">Body Contains</option>
                    <option value="json-path">JSON Path</option>
                  </select>
                </div>
                <div>
                  <Label>Expected Value</Label>
                  <Input
                    placeholder="Expected value"
                    value={test.expected}
                    onChange={(e) => updateTest(test.id, "expected", e.target.value)}
                  />
                </div>
              </div>

              {test.actual !== undefined && (
                <div className="flex items-center space-x-2">
                  <Badge variant={test.passed ? "default" : "destructive"}>{test.passed ? "PASS" : "FAIL"}</Badge>
                  <span className="text-sm text-muted-foreground">Actual: {test.actual}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
