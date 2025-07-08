import { type NextRequest, NextResponse } from "next/server"

// Mock settings data for local development
const mockSettings = {
  timeout: 30000,
  followRedirects: true,
  validateSSL: true,
  maxRedirects: 5,
  userAgent: "API Studio/1.0",
  proxy: {
    enabled: false,
    host: "",
    port: 8080,
    username: "",
    password: "",
  },
}

export async function GET(request: NextRequest, { params }: { params: { workspaceId: string } }) {
  try {
    const { workspaceId } = params

    // In local development, return mock data
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json(mockSettings)
    }

    // In production, you would fetch from database
    // const settings = await getWorkspaceSettings(workspaceId)

    return NextResponse.json(mockSettings)
  } catch (error) {
    console.error("Failed to fetch settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { workspaceId: string } }) {
  try {
    const { workspaceId } = params
    const settings = await request.json()

    // In local development, just return the settings
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json({ ...mockSettings, ...settings })
    }

    // In production, you would save to database
    // await updateWorkspaceSettings(workspaceId, settings)

    return NextResponse.json({ ...mockSettings, ...settings })
  } catch (error) {
    console.error("Failed to update settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
