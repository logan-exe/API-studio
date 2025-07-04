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

  const url = new URL(request.url)
  const collectionId = url.searchParams.get("collection_id")

  let query = supabase
    .from("requests")
    .select(`
      *,
      collections!inner(workspace_id)
    `)
    .eq("collections.workspace_id", params.workspaceId)

  if (collectionId) {
    query = query.eq("collection_id", collectionId)
  }

  const { data: requests, error } = await query.order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(requests)
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

  const requestData = await request.json()

  const { data: savedRequest, error } = await supabase
    .from("requests")
    .insert({
      ...requestData,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(savedRequest)
}
