import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_URL } from '@core/config/app.config';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { catchError, EMPTY, tap } from 'rxjs';

export interface AuthUser {
  id: string;
  organizationId: string;
  fullName: string;
  phone: string | null;
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

interface LoginResponse {
  user: AuthUser;
  refresh_token: string;
  refresh_token_expires_at: string;
}

interface RegistrationResponse {
  organization: { id: string; name: string };
  user: { id: string; fullName: string; email: string };
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: AuthError | null;
  isRegistering: boolean;
  registrationError: AuthError | null;
  isRegistered: boolean;
}

type AuthError = { kind: 'api'; message: string } | { kind: 'generic' };

function getErrorMessage(error: unknown): AuthError {
  if (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    typeof error.error === 'object' &&
    error.error !== null &&
    'message' in error.error
  ) {
    const message = error.error.message;
    if (typeof message === 'string') return { kind: 'api', message };
    if (Array.isArray(message) && message.every((item) => typeof item === 'string')) {
      return { kind: 'api', message: message.join(' ') };
    }
  }

  return { kind: 'generic' };
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
  isRegistering: false,
  registrationError: null,
  isRegistered: false,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const http = inject(HttpClient);
    const api_url = inject(API_URL);
    return {
      login(credentials: LoginRequest) {
        patchState(store, { user: null, isLoading: true, error: null });
        return http
          .post<LoginResponse>(`${api_url}/users/login`, credentials, { withCredentials: true })
          .pipe(
            tap(({ user }) => patchState(store, { user, isLoading: false })),
            catchError((error: unknown) => {
              patchState(store, {
                isLoading: false,
                error: getErrorMessage(error),
              });
              return EMPTY;
            }            ),
          );
      },
      register(details: RegisterRequest) {
        patchState(store, {
          isRegistering: true,
          registrationError: null,
          isRegistered: false,
        });
        return http
          .post<RegistrationResponse>('/api/organizations/register', details, {
            withCredentials: true,
          })
          .pipe(
            tap(() => patchState(store, { isRegistering: false, isRegistered: true })),
            catchError((error: unknown) => {
              patchState(store, {
                isRegistering: false,
                registrationError: getErrorMessage(error),
              });
              return EMPTY;
            }),
          );
      },
    };
  }),
);
