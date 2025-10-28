export interface UserSession {
  userId: string;
  userData: string;
  demoNoticeSeen: number;
  lastActive: string;
}

export interface UserSessionResponse {
  userData: any;
  demoNoticeSeen: boolean;
}

export interface SaveSessionRequest {
  userId: string;
  userData: any;
  demoNoticeSeen?: boolean;
}
