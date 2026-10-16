import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { API_URL } from '@core/config/app.config';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { catchError, defer, EMPTY, finalize, map, Observable, of, shareReplay, tap } from 'rxjs';

const SESSION_STORAGE_KEY = 'clinicflow-auth';
const REFRESH_EARLY_MS = 5 * 60 * 1000;
const MAX_TIMEOUT_MS = 2_147_483_647;

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

interface AuthResponse {
  user: AuthUser;
  refresh_token: string;
  refresh_token_expires_at: string;
}

interface SessionResponse {
  user: AuthUser;
}

interface StoredAuthSession {
  refreshToken: string;
  expiresAt: string;
}

interface RegistrationResponse {
  organization: { id: string; name: string };
  user: { id: string; fullName: string; email: string };
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isRefreshing: boolean;
  isInitialized: boolean;
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
  isRefreshing: false,
  isInitialized: false,
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
    const apiUrl = inject(API_URL);
    const document = inject(DOCUMENT);
    const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    let initializationRequest: Observable<boolean> | undefined;
    let refreshRequest: Observable<boolean> | undefined;

    const getStorage = (): Storage | null =>
      isBrowser ? (document.defaultView?.localStorage ?? null) : null;

    const clearRefreshTimer = (): void => {
      if (refreshTimer !== undefined) {
        clearTimeout(refreshTimer);
        refreshTimer = undefined;
      }
    };

    const clearStoredSession = (): void => {
      clearRefreshTimer();
      getStorage()?.removeItem(SESSION_STORAGE_KEY);
    };

    const readStoredSession = (): StoredAuthSession | null => {
      const storage = getStorage();
      const serializedSession = storage?.getItem(SESSION_STORAGE_KEY);
      if (!serializedSession) return null;

      let parsed: unknown;
      try {
        parsed = JSON.parse(serializedSession);
      } catch (error) {
        if (!(error instanceof SyntaxError)) throw error;
        storage?.removeItem(SESSION_STORAGE_KEY);
        return null;
      }

      if (
        typeof parsed !== 'object' ||
        parsed === null ||
        !('refreshToken' in parsed) ||
        typeof parsed.refreshToken !== 'string' ||
        !parsed.refreshToken ||
        !('expiresAt' in parsed) ||
        typeof parsed.expiresAt !== 'string' ||
        !Number.isFinite(Date.parse(parsed.expiresAt)) ||
        Date.parse(parsed.expiresAt) <= Date.now()
      ) {
        storage?.removeItem(SESSION_STORAGE_KEY);
        return null;
      }

      return {
        refreshToken: parsed.refreshToken,
        expiresAt: parsed.expiresAt,
      };
    };

    const saveSession = (response: AuthResponse): void => {
      getStorage()?.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify({
          refreshToken: response.refresh_token,
          expiresAt: response.refresh_token_expires_at,
        } satisfies StoredAuthSession),
      );
    };

    const scheduleRefresh = (expiresAt: string): void => {
      clearRefreshTimer();
      if (!isBrowser) return;

      const refreshAt = Date.parse(expiresAt) - REFRESH_EARLY_MS;
      const delay = Math.max(0, refreshAt - Date.now());
      refreshTimer = setTimeout(
        () => {
          if (delay > MAX_TIMEOUT_MS) {
            scheduleRefresh(expiresAt);
            return;
          }
          refreshStoredSession().subscribe();
        },
        Math.min(delay, MAX_TIMEOUT_MS),
      );
    };

    const refreshStoredSession = (): Observable<boolean> => {
      if (refreshRequest) return refreshRequest;

      const session = readStoredSession();
      if (!session) return of(false);

      patchState(store, { isRefreshing: true, error: null });
      const request = http
        .post<AuthResponse>(
          `${apiUrl}/users/refresh`,
          { refresh_token: session.refreshToken },
          { withCredentials: true, credentials: 'include' },
        )
        .pipe(
          tap((response) => {
            saveSession(response);
            scheduleRefresh(response.refresh_token_expires_at);
            patchState(store, {
              user: response.user,
              isInitialized: true,
              error: null,
            });
          }),
          map(() => true),
          catchError((error: unknown) => {
            clearStoredSession();
            patchState(store, {
              user: null,
              isInitialized: true,
              error: getErrorMessage(error),
            });
            return of(false);
          }),
          finalize(() => {
            refreshRequest = undefined;
            patchState(store, { isRefreshing: false });
          }),
          shareReplay({ bufferSize: 1, refCount: false }),
        );
      refreshRequest = request;
      return request;
    }

    const confirmStoredSession = (): Observable<boolean> => {
      const session = readStoredSession();
      if (!session) return of(false);

      return http
        .post<SessionResponse>(
          `${apiUrl}/users/rbac`,
          {},
          { withCredentials: true, credentials: 'include' },
        )
        .pipe(
          tap((response) => {
            scheduleRefresh(session.expiresAt);
            patchState(store, {
              user: response.user,
              isInitialized: true,
              error: null,
            });
          }),
          map(() => true),
          catchError((error: unknown) => {
            clearStoredSession();
            patchState(store, {
              user: null,
              isInitialized: true,
              error: getErrorMessage(error),
            });
            return of(false);
          }),
        );
    };

    return {
      initialize(): Observable<boolean> {
        if (!isBrowser) return of(false);
        if (store.isInitialized()) return of(store.user() !== null);
        if (initializationRequest) return initializationRequest;

        initializationRequest = defer(() => confirmStoredSession()).pipe(
          finalize(() => {
            initializationRequest = undefined;
          }),
          shareReplay({ bufferSize: 1, refCount: false }),
        );
        return initializationRequest;
      },
      login(credentials: LoginRequest) {
        clearStoredSession();
        patchState(store, {
          user: null,
          isLoading: true,
          isInitialized: false,
          error: null,
        });
        return http
          .post<AuthResponse>(`${apiUrl}/users/login`, credentials, {
            withCredentials: true,
          })
          .pipe(
            tap((response) => {
              saveSession(response);
              scheduleRefresh(response.refresh_token_expires_at);
              patchState(store, {
                user: response.user,
                isLoading: false,
                isInitialized: true,
              });
            }),
            catchError((error: unknown) => {
              clearStoredSession();
              patchState(store, {
                user: null,
                isLoading: false,
                isInitialized: true,
                error: getErrorMessage(error),
              });
              return EMPTY;
            }),
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
