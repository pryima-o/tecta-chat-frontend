import { apiFetch } from "./config"
export async function checkUsername(username: string): Promise<boolean> {
  const response = await apiFetch(
    `/users/username/${encodeURIComponent(username)}/availability`
  )

  if (!response.ok) {
    throw new Error('Failed to check username')
  }
  return response.available
}

export async function searchUsers(query: string): Promise<boolean> {
  const response = await apiFetch(
    `/users/search?q=${encodeURIComponent(query)}`
  )

  if (!response.ok) {
    throw new Error('Failed to search users')
  }
  console.log('searchUsers response:', response)
  return response
}


export async function getUser(id: string): Promise<boolean> {
  const response = await apiFetch(
    `/users/id/${encodeURIComponent(id)}`
  )

  if (!response.ok) {
    throw new Error('Failed to search users')
  }
  console.log('searchUsers response:', response)
  return response
}



export async function getUserByUsername(username: string): Promise<boolean> {
  const response = await apiFetch(
    `/users/username/${encodeURIComponent(username)}`
  )

  if (!response.ok) {
    throw new Error('Failed to search users')
  }
  console.log('searchUsers response:', response)
  return response
}
