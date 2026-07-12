export interface StudentNotification {
  id: number
  senderId: number
  senderName: string
  receiverId: number
  receiverName: string
  courseId: number
  courseTitle: string
  message: string
  isRead: boolean
  createdAt: string
}
