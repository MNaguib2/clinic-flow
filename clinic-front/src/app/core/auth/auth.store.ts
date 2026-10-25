import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { API_URL, MAX_TIMEOUT_MS, REFRESH_EARLY_MS, SESSION_STORAGE_KEY } from '@core/config/app.config';
import type {
  AuthResponse,
  AuthState,
  LoginRequest,
  RegisterRequest,
  RegistrationResponse,
  SessionResponse,
  StoredAuthSession,
} from '@core/interfaces/auth.interfaces';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { catchError, defer, finalize, map, Observable, of, shareReplay, tap, throwError } from 'rxjs';

const initialState: AuthState = {
  user: null,
  client: null,
  isLoading: false,
  startup: false,
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
    let activeHttpRequests = 0;

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
      console.log("🚀 ~ scheduleRefresh ~ expiresAt:", expiresAt)
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

      const request = http
        .post<AuthResponse>(
          `${apiUrl}/users/refresh`,
          { refresh_token: session.refreshToken },
        )
        .pipe(
          tap((response) => {
            saveSession(response);
            scheduleRefresh(response.refresh_token_expires_at);
            patchState(store, {
              user: response.user,
              startup: response.startup ?? store.startup(),
            });
          }),
          map(() => true),
          catchError(() => {
            clearStoredSession();
            patchState(store, {
              user: null,
            });
            return of(false);
          }),
          finalize(() => {
            refreshRequest = undefined;
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
        )
        .pipe(
          tap((response) => {
            scheduleRefresh(session.expiresAt);
            patchState(store, {
              user: response.user,
              startup: response.startup ?? false,
            });
          }),
          map(() => true),
          catchError(() => {
            clearStoredSession();
            patchState(store, {
              user: null,
            });
            return of(false);
          }),
        );
    };

    return {
      beginHttpRequest(): void {
        activeHttpRequests += 1;
        patchState(store, { isLoading: true });
      },
      endHttpRequest(): void {
        activeHttpRequests = Math.max(0, activeHttpRequests - 1);
        patchState(store, { isLoading: activeHttpRequests > 0 });
      },
      initialize(): Observable<boolean> {
        if (!isBrowser) return of(false);
        if (store.user()) return of(true);
        if (initializationRequest) return initializationRequest;

        initializationRequest = defer(() => confirmStoredSession()).pipe(
          finalize(() => {
            initializationRequest = undefined;
          }),
          shareReplay({ bufferSize: 1, refCount: false }),
        );
        return initializationRequest;
      },
      logout(): void {
        clearStoredSession();
        clearRefreshTimer();
        patchState(store, {
          user: null,
          startup: false,
        });
      },
      login(credentials: LoginRequest) {
        clearStoredSession();
        patchState(store, { user: null });
        return http
          .post<AuthResponse>(`${apiUrl}/users/login`, credentials)
          .pipe(
            tap((response) => {
              saveSession(response);
              scheduleRefresh(response.refresh_token_expires_at);
              patchState(store, {
                user: response.user,
                startup: response.startup ?? false,
              });
            }),
            catchError((error: unknown) => {
              clearStoredSession();
              patchState(store, {
                user: null,
              });
              return throwError(() => error);
            }),
          );
      },
      register(details: RegisterRequest) {
        return http.post<RegistrationResponse>('/api/organizations/register', details);
      },
      markStartupComplete(): void {
        patchState(store, { startup: false });
      },
    };
  }),
);
