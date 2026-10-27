export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface SendChatMessageRequest {
  message: string;
}

export interface SendChatMessageResponse {
  reply: string;
}
