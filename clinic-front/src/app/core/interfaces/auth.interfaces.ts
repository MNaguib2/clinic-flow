export interface AuthUser {
  id: string;
  organizationId: string;
  organization_name: string
  fullName: string;
  phone: string | null;
  roles: string
}

export interface LoginRequest {
  phone: string;
  password: string;
  remember_me: boolean;
}

export interface RegisterRequest {
  organizationTitle: string;
  userName: string;
  phone: string;
  email: string;
  birthday: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: AuthUser;
  refresh_token: string;
  refresh_token_expires_at: string;
  startup?: boolean;
}

export interface SessionResponse {
  user: AuthUser;
  startup?: boolean;
}

export interface StoredAuthSession {
  refreshToken: string;
  expiresAt: string;
}

export interface RegistrationResponse {
  organization: { id: string; name: string };
  user: { id: string; fullName: string; email: string };
}

export interface AuthState {
  user: AuthUser | null;
  client: any;
  isLoading: boolean;
  startup: boolean;
}
