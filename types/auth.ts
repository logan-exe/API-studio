export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  google_id?: string
}

export interface Workspace {
  id: string
  name: string
  description?: string
  owner_id: string
  created_at: string
  updated_at: string
  role?: string // User's role in this workspace
}

export interface WorkspaceMember {
  id: string
  workspace_id: string
  user_id: string
  role: "owner" | "admin" | "member" | "viewer"
  user: User
  joined_at: string
}

export interface WorkspaceSettings {
  id: string
  workspace_id: string
  proxy_enabled: boolean
  proxy_host?: string
  proxy_port?: number
  proxy_username?: string
  proxy_password?: string
  ssl_verification: boolean
  timeout: number
  follow_redirects: boolean
  max_redirects: number
}

export interface RequestHistory {
  id: string
  request_id?: string
  workspace_id: string
  user_id: string
  method: string
  url: string
  headers: any[]
  body?: string
  response_status?: number
  response_headers?: Record<string, string>
  response_body?: string
  response_time?: number
  executed_at: string
}
