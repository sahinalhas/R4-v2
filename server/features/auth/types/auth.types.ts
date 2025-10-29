export interface UserSession {
  userId: string;
  userData: string;
  demoNoticeSeen: number;
  lastActive: string;
}

export interface UserSessionResponse {
  userData: Record<string, unknown>;
  demoNoticeSeen: boolean;
}

export interface SaveSessionRequest {
  userId: string;
  userData: Record<string, unknown>;
  demoNoticeSeen?: boolean;
}
