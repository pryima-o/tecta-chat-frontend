export interface ChatListItemData {
  chatId?: string
  userId: string

  displayName: string
  username: string

  avatar?: string
  lastMessage?: {
    content: string
    createdAt: string
  }
  time?: string
  unread?: number
  active?: boolean
}
