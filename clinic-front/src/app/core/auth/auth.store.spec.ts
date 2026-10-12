import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthStore, LoginRequest, RegisterRequest } from './auth.store';

describe('AuthStore', () => {
  let store: InstanceType<typeof AuthStore>;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthStore, provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(AuthStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

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
    expect(store.isLoading()).toBe(true);

    request.flush({
      user: {
        id: '42',
        organizationId: '7',
        fullName: 'Clinic User',
        phone: credentials.phone,
      },
      refresh_token: 'token',
      refresh_token_expires_at: '2026-10-10T00:00:00.000Z',
    });

    expect(store.user()?.fullName).toBe('Clinic User');
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('exposes API login errors to the page', () => {
    store.login({
      phone: '+15551234567',
      password: 'wrong-password',
      remember_me: false,
    }).subscribe();
    const request = http.expectOne('/api/users/login');

    request.flush(
      { message: 'Invalid phone or password' },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(store.user()).toBeNull();
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toEqual({
      kind: 'api',
      message: 'Invalid phone or password',
    });
  });

  it('registers a clinic and exposes the success state', () => {
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
    expect(store.isRegistering()).toBe(true);

    request.flush({
      organization: { id: '7', name: details.organizationTitle },
      user: { id: '42', fullName: details.userName, email: details.email },
    });

    expect(store.isRegistered()).toBe(true);
    expect(store.isRegistering()).toBe(false);
    expect(store.registrationError()).toBeNull();
  });
});
