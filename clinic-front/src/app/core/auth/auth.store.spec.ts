import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '@core/config/app.config';
import { httpAuthInterceptor } from '@core/interceptors/http-auth.interceptor';
import type { LoginRequest, RegisterRequest } from '@core/interfaces/auth.interfaces';
import { afterEach, vi } from 'vitest';
import { AuthStore } from './auth.store';

describe('AuthStore', () => {
  let store: InstanceType<typeof AuthStore>;
  let http: HttpTestingController;
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
    clear: () => values.clear(),
  };

  beforeEach(() => {
    storage.clear();
    TestBed.configureTestingModule({
      providers: [
        AuthStore,
        { provide: API_URL, useValue: '/api' },
        { provide: DOCUMENT, useValue: { defaultView: { localStorage: storage } } },
        provideHttpClient(withInterceptors([httpAuthInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    store = TestBed.inject(AuthStore);
    http = TestBed.inject(HttpTestingController);
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-14T07:00:00.000Z'));
  });

  afterEach(() => {
    http.verify();
    vi.clearAllTimers();
    vi.useRealTimers();
    storage.clear();
  });

  it('submits the login credentials and stores the authenticated user', () => {
    const credentials: LoginRequest = {
      phone: '+15551234567',
      password: 'secure-password',
      remember_me: true,
    };

    store.login(credentials).subscribe();
    const request = http.expectOne('/api/users/login');

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(credentials);
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.credentials).toBe('include');
    expect(store.isLoading()).toBe(true);

    request.flush({
      user: {
        id: '42',
        organizationId: '7',
        fullName: 'Clinic User',
        phone: credentials.phone,
      },
      refresh_token: 'token',
      refresh_token_expires_at: '2026-10-15T07:00:00.000Z',
    });

    expect(store.user()?.fullName).toBe('Clinic User');
    expect(store.isLoading()).toBe(false);
    expect(JSON.parse(storage.getItem('clinicflow-auth') ?? '{}')).toEqual({
      refreshToken: 'token',
      expiresAt: '2026-10-15T07:00:00.000Z',
    });
  });

  it('refreshes five minutes before the persisted refresh token expires', () => {
    store
      .login({
        phone: '+15551234567',
        password: 'secure-password',
        remember_me: true,
      })
      .subscribe();
    http.expectOne('/api/users/login').flush({
      user: {
        id: '42',
        organizationId: '7',
        fullName: 'Clinic User',
        phone: '+15551234567',
      },
      refresh_token: 'initial-token',
      refresh_token_expires_at: '2026-10-14T07:10:00.000Z',
    });

    vi.advanceTimersByTime(5 * 60 * 1000 - 1);
    http.expectNone('/api/users/refresh');

    vi.advanceTimersByTime(1);
    const refreshRequest = http.expectOne('/api/users/refresh');
    expect(refreshRequest.request.body).toEqual({ refresh_token: 'initial-token' });
    expect(refreshRequest.request.withCredentials).toBe(true);

    refreshRequest.flush({
      user: {
        id: '42',
        organizationId: '7',
        fullName: 'Clinic User',
        phone: '+15551234567',
      },
      refresh_token: 'rotated-token',
      refresh_token_expires_at: '2026-10-15T07:10:00.000Z',
    });
    expect(JSON.parse(storage.getItem('clinicflow-auth') ?? '{}').refreshToken).toBe(
      'rotated-token',
    );
  });

  it('confirms an existing session without refreshing its persisted token on initialization', () => {
    storage.setItem(
      'clinicflow-auth',
      JSON.stringify({
        refreshToken: 'saved-token',
        expiresAt: '2026-10-14T07:10:00.000Z',
      }),
    );

    let initialized: boolean | undefined;
    store.initialize().subscribe((result) => (initialized = result));
    const request = http.expectOne('/api/users/rbac');
    expect(request.request.body).toEqual({});
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.credentials).toBe('include');

    request.flush({
      user: {
        id: '42',
        organizationId: '7',
        fullName: 'Clinic User',
        phone: '+15551234567',
      },
    });

    expect(initialized).toBe(true);
    expect(store.user()?.id).toBe('42');
    expect(JSON.parse(storage.getItem('clinicflow-auth') ?? '{}').refreshToken).toBe(
      'saved-token',
    );
    http.expectNone('/api/users/refresh');
  });

  it('propagates login errors to the page', () => {
    let loginError: unknown;
    store
      .login({
        phone: '+15551234567',
        password: 'wrong-password',
        remember_me: false,
      })
      .subscribe({ error: (error: unknown) => (loginError = error) });
    const request = http.expectOne('/api/users/login');

    request.flush(
      { message: 'Invalid phone or password' },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(store.user()).toBeNull();
    expect(store.isLoading()).toBe(false);
    expect(loginError).toMatchObject({ status: 401 });
  });

  it('logs out the current user and clears the persisted session', () => {
    store
      .login({
        phone: '+15551234567',
        password: 'secure-password',
        remember_me: true,
      })
      .subscribe();

    http.expectOne('/api/users/login').flush({
      user: {
        id: '42',
        organizationId: '7',
        fullName: 'Clinic User',
        phone: '+15551234567',
      },
      refresh_token: 'token',
      refresh_token_expires_at: '2026-10-15T07:00:00.000Z',
    });

    expect(store.user()?.fullName).toBe('Clinic User');

    store.logout();

    expect(store.user()).toBeNull();
    expect(storage.getItem('clinicflow-auth')).toBeNull();
  });

  it('sends a clinic registration request', () => {
    const details: RegisterRequest = {
      organizationTitle: 'ClinicFlow Demo',
      userName: 'Clinic Admin',
      phone: '+15551234567',
      email: 'admin@example.com',
      birthday: '1990-01-01',
      password: 'secure-password',
      confirmPassword: 'secure-password',
    };

    store.register(details).subscribe();
    const request = http.expectOne('/api/organizations/register');

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(details);
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.credentials).toBe('include');

    request.flush({
      organization: { id: '7', name: details.organizationTitle },
      user: { id: '42', fullName: details.userName, email: details.email },
    });
  });

  it('keeps loading active until all concurrent requests finish', () => {
    store.login({
      phone: '+15551234567',
      password: 'secure-password',
      remember_me: false,
    }).subscribe();
    store.register({
      organizationTitle: 'ClinicFlow Demo',
      userName: 'Clinic Admin',
      phone: '+15551234567',
      email: 'admin@example.com',
      birthday: '1990-01-01',
      password: 'secure-password',
      confirmPassword: 'secure-password',
    }).subscribe();

    const loginRequest = http.expectOne('/api/users/login');
    const registrationRequest = http.expectOne('/api/organizations/register');
    expect(store.isLoading()).toBe(true);

    loginRequest.flush(
      { message: 'Invalid phone or password' },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(store.isLoading()).toBe(true);
    registrationRequest.flush({
      organization: { id: '7', name: 'ClinicFlow Demo' },
      user: { id: '42', fullName: 'Clinic Admin', email: 'admin@example.com' },
    });
    expect(store.isLoading()).toBe(false);
  });
});
