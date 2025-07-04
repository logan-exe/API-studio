export interface Header {
  key: string
  value: string
  enabled: boolean
}

export interface RequestData {
  id: string
  name: string
  method: string
  url: string
  headers: Header[]
  body: string
  bodyType: string
  files: File[]
  formData: { key: string; value: string; type: "text" | "file"; file?: File }[]
  auth: {
    type: string
    username?: string
    password?: string
    token?: string
  }
}

export interface RequestTab {
  id: string
  name: string
  request: RequestData
  response: ResponseData | null
  hasUnsavedChanges: boolean
  originalRequest: RequestData | null
}

export interface Collection {
  id: string
  name: string
  requests: RequestData[]
}

export interface Environment {
  id: string
  name: string
  variables: { key: string; value: string }[]
}

export interface ResponseData {
  status: number
  statusText: string
  headers: Record<string, string>
  body: string
  time: number
  size: number
}
