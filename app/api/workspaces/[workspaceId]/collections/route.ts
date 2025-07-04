import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { workspaceId: string } }) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check workspace access
  const { data: member } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", params.workspaceId)
    .eq("user_id", user.id)
    .single()

  if (!member) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 })
  }

  const { data: collections, error } = await supabase
    .from("collections")
    .select("*")
    .eq("workspace_id", params.workspaceId)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(collections)
}

export async function POST(request: NextRequest, { params }: { params: { workspaceId: string } }) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check workspace access
  const { data: member } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", params.workspaceId)
    .eq("user_id", user.id)
    .single()

  if (!member || member.role === "viewer") {
    return NextResponse.json({ error: "Access denied" }, { status: 403 })
  }

  const { name, description } = await request.json()

  const { data: collection, error } = await supabase
    .from("collections")
    .insert({
      name,
      description,
      workspace_id: params.workspaceId,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(collection)
}
