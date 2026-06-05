
export interface ChatMessage {
  id:        string;
  role:      'user' | 'bot';
  text:      string;
  timestamp: Date;
}

export interface ChatApiRequest {
  message: string;
}

export interface ChatApiResponse {
  response:   string;
  tags:       string[];
  confidence: number;
}