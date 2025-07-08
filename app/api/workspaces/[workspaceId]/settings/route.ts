import { type NextRequest, NextResponse } from "next/server"

// Check if we're in local development
const isLocal = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_VERCEL_ENV === "development"

// Mock settings for local development
const MOCK_SETTINGS = {
  id: "local-settings-123",
  workspace_id: "local-workspace-123",
  proxy_enabled: false,
  proxy_host: "",
  proxy_port: 8080,
  proxy_username: "",
  proxy_password: "",
  ssl_verification: true,
  timeout: 30000,
  follow_redirects: true,
  max_redirects: 5,
}

export async function GET(request: NextRequest, { params }: { params: { workspaceId: string } }) {
  try {
    if (isLocal) {
      return NextResponse.json(MOCK_SETTINGS)
    }

    // In production, this would fetch from Supabase
    // const { data, error } = await supabase
    //   .from('workspace_settings')
    //   .select('*')
    //   .eq('workspace_id', params.workspaceId)
    //   .single()

    // if (error) {
    //   return NextResponse.json({ error: error.message }, { status: 500 })
    // }

    return NextResponse.json(MOCK_SETTINGS)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { workspaceId: string } }) {
  try {
    const settings = await request.json()

    if (isLocal) {
      // In local development, just return the updated settings
      return NextResponse.json({ ...MOCK_SETTINGS, ...settings })
    }

    // In production, this would update Supabase
    // const { data, error } = await supabase
    //   .from('workspace_settings')
    //   .update(settings)
    //   .eq('workspace_id', params.workspaceId)
    //   .select()
    //   .single()

    // if (error) {
    //   return NextResponse.json({ error: error.message }, { status: 500 })
    // }

    return NextResponse.json({ ...MOCK_SETTINGS, ...settings })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
