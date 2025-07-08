import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

// Check if we're in local development
const isLocal = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_VERCEL_ENV === "development"

// Dummy data for local development
const DUMMY_WORKSPACES = [
  {
    id: "local-workspace-123",
    name: "Local Development",
    description: "Default workspace for local development",
    owner_id: "local-user-123",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    role: "owner",
  },
]

export async function GET() {
  // Handle local development
  if (isLocal) {
    return NextResponse.json(DUMMY_WORKSPACES)
  }

  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: workspaces, error } = await supabase
      .from("workspaces")
      .select(`
        *,
        workspace_members!inner(role)
      `)
      .eq("workspace_members.user_id", user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(workspaces)
  } catch (error) {
    console.error("Error fetching workspaces:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Handle local development
  if (isLocal) {
    const { name, description } = await request.json()
    const newWorkspace = {
      id: `local-workspace-${Date.now()}`,
      name,
      description,
      owner_id: "local-user-123",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      role: "owner",
    }
    return NextResponse.json(newWorkspace)
  }

  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description } = await request.json()

    // Create workspace
    const { data: workspace, error: workspaceError } = await supabase
      .from("workspaces")
      .insert({
        name,
        description,
        owner_id: user.id,
      })
      .select()
      .single()

    if (workspaceError) {
      return NextResponse.json({ error: workspaceError.message }, { status: 500 })
    }

    // Add owner as member
    const { error: memberError } = await supabase.from("workspace_members").insert({
      workspace_id: workspace.id,
      user_id: user.id,
      role: "owner",
    })

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 500 })
    }

    // Create default settings
    await supabase.from("workspace_settings").insert({
      workspace_id: workspace.id,
    })

    return NextResponse.json({ ...workspace, role: "owner" })
  } catch (error) {
    console.error("Error creating workspace:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
