export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
  avatar?: string | null;
}

export interface AuthPayload {
  token: string;
  user: AuthUser;
}

export interface LoginResult {
  login: AuthPayload;
}

export interface MeResult {
  me: AuthUser | null;
}

export interface ChangePasswordResult {
  changePassword: boolean;
}
