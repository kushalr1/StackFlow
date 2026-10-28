export interface ChatAction {
  label: string;
  route: string;
}

export type ChatColumnType = 'text' | 'date' | 'number' | 'currency' | 'status';

export interface ChatListColumn {
  key: string;
  label: string;
  type: ChatColumnType;
}

/** Display text plus the raw value used for sorting and export. */
export interface ChatCell {
  text: string;
  sort: string | number | null;
}

export type ChatListRow = Record<string, ChatCell>;

/** A structured list result rendered as a card, and as a full-screen table when opened. */
export interface ChatList {
  title: string;
  subtitle?: string | null;
  columns: ChatListColumn[];
  rows: ChatListRow[];
  totalCount: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  actions?: ChatAction[];
  lists?: ChatList[];
}

export interface SendChatMessageRequest {
  message: string;
}

export interface SendChatMessageResponse {
  reply: string;
  actions: ChatAction[];
  suggestions: string[];
  lists: ChatList[];
}
