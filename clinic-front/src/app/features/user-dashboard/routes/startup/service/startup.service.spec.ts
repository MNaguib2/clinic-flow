import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '@core/config/app.config';
import type { StartupPayload } from '@core/interfaces/startup.interfaces';
import { StartupService } from './startup.service';

describe('StartupService', () => {
  let service: StartupService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        StartupService,
        { provide: API_URL, useValue: '/api' },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(StartupService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads startup options', () => {
    service.getOptions().subscribe();
    const request = http.expectOne('/api/organizations/startup/options');

    expect(request.request.method).toBe('GET');
    request.flush({ permissions: [] });
  });

  it('submits startup data and files as one multipart request', () => {
    const payload: StartupPayload = {
      briefDescription: 'A community-focused clinic.',
      previousWorkingExperiences: [],
      currentWorkingExperiences: [],
      certifications: [{ name: 'Board certification' }],
      roles: [],
      specialties: [],
      clinics: [{ name: 'Main clinic', specialties: [] }],
    };
    const profile_image = new File(['profile'], 'profile.png', {
      type: 'image/png',
    });
    const organization_logo = new File(['logo'], 'logo.png', {
      type: 'image/png',
    });
    const certification_file = new File(['certificate'], 'certificate.pdf', {
      type: 'application/pdf',
    });

    service
      .complete(
        payload,
        profile_image,
        organization_logo,
        new Map([[0, certification_file]]),
      )
      .subscribe();
    const request = http.expectOne('/api/organizations/startup');

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBeInstanceOf(FormData);
    const form_data = request.request.body as FormData;
    expect(JSON.parse(form_data.get('data') as string)).toEqual(payload);
    expect(form_data.get('profileImage')).toBe(profile_image);
    expect(form_data.get('organizationLogo')).toBe(organization_logo);
    expect(form_data.get('certificationFile_0')).toBe(certification_file);
    request.flush({ completed: true, clinics: [{ id: '1', name: 'Main clinic' }] });
  });
});
