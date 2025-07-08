import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

const supabase = createClientComponentClient()

export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
}

export interface AuthResponse {
  user: User | null
  error: Error | null
}

export function isLocalEnvironment(): boolean {
  return process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_VERCEL_ENV === "development"
}

// Mock user for local development
const MOCK_USER: User = {
  id: "local-user-123",
  email: "demo@apistudio.dev",
  name: "Demo User",
  avatar_url: undefined,
}

export async function getCurrentUser(): Promise<AuthResponse> {
  if (isLocalEnvironment()) {
    // In local development, return mock user
    return { user: MOCK_USER, error: null }
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      return { user: null, error }
    }

    if (!user) {
      return { user: null, error: null }
    }

    const mappedUser: User = {
      id: user.id,
      email: user.email || "",
      name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
      avatar_url: user.user_metadata?.avatar_url,
    }

    return { user: mappedUser, error: null }
  } catch (error) {
    return { user: null, error: error as Error }
  }
}

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  if (isLocalEnvironment()) {
    // In local development, simulate successful sign in
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return { user: MOCK_USER, error: null }
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { user: null, error }
    }

    if (!data.user) {
      return { user: null, error: new Error("No user returned") }
    }

    const mappedUser: User = {
      id: data.user.id,
      email: data.user.email || "",
      name: data.user.user_metadata?.name || data.user.email?.split("@")[0] || "User",
      avatar_url: data.user.user_metadata?.avatar_url,
    }

    return { user: mappedUser, error: null }
  } catch (error) {
    return { user: null, error: error as Error }
  }
}

export async function signUp(email: string, password: string, name: string): Promise<AuthResponse> {
  if (isLocalEnvironment()) {
    // In local development, simulate successful sign up
    await new Promise((resolve) => setTimeout(resolve, 1500))
    return { user: { ...MOCK_USER, name, email }, error: null }
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })

    if (error) {
      return { user: null, error }
    }

    if (!data.user) {
      return { user: null, error: new Error("No user returned") }
    }

    const mappedUser: User = {
      id: data.user.id,
      email: data.user.email || "",
      name: name,
      avatar_url: data.user.user_metadata?.avatar_url,
    }

    return { user: mappedUser, error: null }
  } catch (error) {
    return { user: null, error: error as Error }
  }
}

export async function signInWithGoogle(): Promise<AuthResponse> {
  if (isLocalEnvironment()) {
    // In local development, simulate Google sign in
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return { user: MOCK_USER, error: null }
  }

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      return { user: null, error }
    }

    // OAuth redirects, so we don't get user data immediately
    return { user: null, error: null }
  } catch (error) {
    return { user: null, error: error as Error }
  }
}

export async function resetPassword(email: string): Promise<{ error: Error | null }> {
  if (isLocalEnvironment()) {
    // In local development, simulate password reset
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return { error: null }
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    return { error }
  } catch (error) {
    return { error: error as Error }
  }
}

export async function signOut(): Promise<{ error: Error | null }> {
  if (isLocalEnvironment()) {
    // In local development, simulate sign out
    return { error: null }
  }

  try {
    const { error } = await supabase.auth.signOut()
    return { error }
  } catch (error) {
    return { error: error as Error }
  }
}
