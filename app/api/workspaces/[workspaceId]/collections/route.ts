import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

// Check if we're in local development
const isLocal = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_VERCEL_ENV === "development"

// Dummy data for local development
const DUMMY_COLLECTIONS = [
  {
    id: "local-collection-1",
    name: "Sample API Collection",
    description: "A sample collection for testing",
    workspace_id: "local-workspace-123",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    requests: [],
  },
]

export async function GET(request: NextRequest, { params }: { params: { workspaceId: string } }) {
  // Handle local development
  if (isLocal) {
    return NextResponse.json(DUMMY_COLLECTIONS)
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

    // Verify user has access to workspace
    const { data: membership } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", params.workspaceId)
      .eq("user_id", user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { data: collections, error } = await supabase
      .from("collections")
      .select("*")
      .eq("workspace_id", params.workspaceId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(collections)
  } catch (error) {
    console.error("Error fetching collections:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { workspaceId: string } }) {
  // Handle local development
  if (isLocal) {
    const { name, description } = await request.json()
    const newCollection = {
      id: `local-collection-${Date.now()}`,
      name,
      description,
      workspace_id: params.workspaceId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      requests: [],
    }
    return NextResponse.json(newCollection)
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

    // Verify user has access to workspace
    const { data: membership } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", params.workspaceId)
      .eq("user_id", user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { name, description } = await request.json()

    const { data: collection, error } = await supabase
      .from("collections")
      .insert({
        name,
        description,
        workspace_id: params.workspaceId,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(collection)
  } catch (error) {
    console.error("Error creating collection:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
