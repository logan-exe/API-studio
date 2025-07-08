import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

// Check if we're in local development
const isLocal = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_VERCEL_ENV === "development"

export async function POST(request: NextRequest, { params }: { params: { workspaceId: string } }) {
  // Handle local development
  if (isLocal) {
    const requestData = await request.json()
    const savedRequest = {
      id: `local-request-${Date.now()}`,
      ...requestData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    return NextResponse.json(savedRequest)
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

    const requestData = await request.json()

    const { data: savedRequest, error } = await supabase
      .from("requests")
      .insert({
        ...requestData,
        workspace_id: params.workspaceId,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(savedRequest)
  } catch (error) {
    console.error("Error saving request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
