export interface MessageI {
  id: number;
  type: string;
  text: string;
  status: string | null;
  user_id: number;
  conversation_id: number;
  seen_by: Array<object>;
  deleted_at: string | null;
  create_at_formated: string;

  media_url: string;
  media_name: string;
}

export interface UserI {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  avatar: string;
}

export interface ConversationI {
  id: number;
  messages: MessageI[];
  users: UserI[];
  messages_count: number;
}
