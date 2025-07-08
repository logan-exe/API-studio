import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Check if user exists in users table, create if not
    const { data: existingUser, error: userCheckError } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .single()

    if (userCheckError && userCheckError.code === "PGRST116") {
      // User doesn't exist, create user profile
      const { error: createUserError } = await supabase.from("users").insert({
        id: userId,
        email: `user-${userId}@example.com`, // You might want to get actual email
        name: `User ${userId}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (createUserError) {
        console.error("Error creating user:", createUserError)
        return NextResponse.json({ error: "Failed to create user profile" }, { status: 500 })
      }
    }

    // Fetch workspaces for the user
    const { data: workspaces, error } = await supabase
      .from("workspaces")
      .select("*")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching workspaces:", error)
      return NextResponse.json({ error: "Failed to fetch workspaces" }, { status: 500 })
    }

    return NextResponse.json({ workspaces: workspaces || [] })
  } catch (error) {
    console.error("Error in GET /api/workspaces:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, owner_id } = body

    if (!name || !owner_id) {
      return NextResponse.json({ error: "Name and owner_id are required" }, { status: 400 })
    }

    // Check if user exists in users table, create if not
    const { data: existingUser, error: userCheckError } = await supabase
      .from("users")
      .select("id")
      .eq("id", owner_id)
      .single()

    if (userCheckError && userCheckError.code === "PGRST116") {
      // User doesn't exist, create user profile
      const { error: createUserError } = await supabase.from("users").insert({
        id: owner_id,
        email: `user-${owner_id}@example.com`, // You might want to get actual email
        name: `User ${owner_id}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (createUserError) {
        console.error("Error creating user:", createUserError)
        return NextResponse.json({ error: "Failed to create user profile" }, { status: 500 })
      }
    } else if (userCheckError) {
      console.error("Error checking user:", userCheckError)
      return NextResponse.json({ error: "Failed to verify user" }, { status: 500 })
    }

    // Create the workspace
    const { data: workspace, error } = await supabase
      .from("workspaces")
      .insert({
        name,
        description: description || "",
        owner_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating workspace:", error)
      return NextResponse.json({ error: "Failed to create workspace" }, { status: 500 })
    }

    return NextResponse.json({ workspace }, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/workspaces:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
