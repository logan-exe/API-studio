import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Check if we're in local development
const isLocal =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_VERCEL_ENV === "development" ||
  (typeof window !== "undefined" && window.location.hostname === "localhost")

// Production base URL
const PRODUCTION_BASE_URL = "https://v0-postman-web-application.vercel.app"

// Dummy user for local development
const DUMMY_USER = {
  id: "local-user-123",
  email: "demo@apistudio.local",
  name: "Demo User",
  avatar_url: "/placeholder-user.jpg",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export async function signUp(email: string, password: string, name: string) {
  if (isLocal) {
    // In local development, simulate successful signup
    return {
      data: { user: DUMMY_USER, session: null },
      error: null,
    }
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
    return { data, error }
  } catch (error) {
    return {
      data: null,
      error: { message: "Network error. Please check your connection and try again." },
    }
  }
}

export async function signIn(email: string, password: string) {
  if (isLocal) {
    // In local development, simulate successful signin
    localStorage.setItem("api-studio-local-user", JSON.stringify(DUMMY_USER))
    return {
      data: { user: DUMMY_USER, session: { access_token: "local-token" } },
      error: null,
    }
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  } catch (error) {
    return {
      data: null,
      error: { message: "Network error. Please check your connection and try again." },
    }
  }
}

export async function signInWithGoogle() {
  if (isLocal) {
    // In local development, simulate successful Google signin
    localStorage.setItem("api-studio-local-user", JSON.stringify(DUMMY_USER))
    return {
      data: { user: DUMMY_USER, session: { access_token: "local-token" } },
      error: null,
    }
  }

  try {
    const redirectTo =
      typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : `${PRODUCTION_BASE_URL}/auth/callback`

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    })
    return { data, error }
  } catch (error) {
    return {
      data: null,
      error: { message: "Failed to connect to Google. Please try again." },
    }
  }
}

export async function resetPassword(email: string) {
  if (isLocal) {
    // In local development, simulate successful password reset
    return { error: null }
  }

  try {
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/reset-password`
        : `${PRODUCTION_BASE_URL}/auth/reset-password`

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })
    return { error }
  } catch (error) {
    return {
      error: { message: "Network error. Please check your connection and try again." },
    }
  }
}

export async function updatePassword(newPassword: string) {
  if (isLocal) {
    // In local development, simulate successful password update
    return { error: null }
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    return { error }
  } catch (error) {
    return {
      error: { message: "Failed to update password. Please try again." },
    }
  }
}

export async function signOut() {
  if (isLocal) {
    // In local development, clear local storage
    localStorage.removeItem("api-studio-local-user")
    return { error: null }
  }

  try {
    const { error } = await supabase.auth.signOut()
    return { error }
  } catch (error) {
    return {
      error: { message: "Failed to sign out. Please try again." },
    }
  }
}

export async function getCurrentUser() {
  if (isLocal) {
    // In local development, return dummy user if stored
    const localUser = localStorage.getItem("api-studio-local-user")
    if (localUser) {
      return { user: JSON.parse(localUser), error: null }
    }
    // Auto-login in local development
    localStorage.setItem("api-studio-local-user", JSON.stringify(DUMMY_USER))
    return { user: DUMMY_USER, error: null }
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    return { user, error }
  } catch (error) {
    return {
      user: null,
      error: { message: "Failed to get user information." },
    }
  }
}

export function isLocalEnvironment() {
  return isLocal
}
