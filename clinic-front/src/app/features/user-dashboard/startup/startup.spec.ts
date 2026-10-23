import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AuthStore } from '@core/auth/auth.store';
import { LanguageService } from '@core/services/language/language.service';
import { provideTranslateService } from '@ngx-translate/core';
import { Startup } from './startup';
import { StartupService } from './service/startup.service';

describe('Startup', () => {
  let component: Startup;
  let fixture: ComponentFixture<Startup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Startup],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        { provide: AuthStore, useValue: { markStartupComplete: () => undefined } },
        { provide: LanguageService, useValue: { language: () => 'en' } },
      ],
    });
    TestBed.overrideComponent(Startup, {
      set: {
        providers: [
          {
            provide: StartupService,
            useValue: {
              getOptions: () =>
                of({
                  permissions: [
                    {
                      id: '1',
                      code: 'clinic.read',
                      name_en: 'View clinics',
                      name_ar: 'عرض العيادات',
                      description_en: 'View clinics',
                      description_ar: 'عرض العيادات',
                      page: {
                        key: 'clinic',
                        name_en: 'Clinics',
                        name_ar: 'العيادات',
                        description_en: 'Clinic access',
                        description_ar: 'إدارة العيادات',
                      },
                    },
                    {
                      id: '2',
                      code: 'organization.read',
                      name_en: 'View organization',
                      name_ar: 'عرض المؤسسة',
                      description_en: 'View organization',
                      description_ar: 'عرض المؤسسة',
                      page: {
                        key: 'organization',
                        name_en: 'Organization',
                        name_ar: 'المؤسسة',
                        description_en: 'Organization settings',
                        description_ar: 'إعدادات المؤسسة',
                      },
                    },
                  ],
                }),
              complete: () => of({ completed: true, clinics: [] }),
            },
          },
        ],
      },
    });
    await TestBed.compileComponents();

    fixture = TestBed.createComponent(Startup);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows organization setup separately before the profile step', () => {
    expect(fixture.nativeElement.querySelector('#organization-step-title')).toBeTruthy();
    expect(fixture.nativeElement.querySelectorAll('.startup-steps button')).toHaveLength(6);

    fixture.nativeElement.querySelectorAll('.startup-steps button')[1].click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#profile-step-title')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#organization-step-title')).toBeNull();
  });

  it('shows permission descriptions and selects all permissions within a page', () => {
    fixture.nativeElement.querySelectorAll('.startup-steps button')[2].click();
    fixture.detectChanges();
    fixture.nativeElement.querySelector('#add-role-button').click();
    fixture.detectChanges();

    const groups = fixture.nativeElement.querySelectorAll(
      '.permission-page',
    ) as NodeListOf<HTMLDetailsElement>;
    expect(Array.from(groups).map((group) =>
      group.querySelector('.permission-page-name strong')?.textContent.trim(),
    )).toEqual([
      'Clinics',
      'Organization',
    ]);
    expect(groups[0].querySelector('.permission-option-copy small')?.textContent.trim()).toBe('View clinics');

    const select_page = groups[0].querySelector(
      '.permission-select-all input',
    ) as HTMLInputElement;
    select_page.click();
    fixture.detectChanges();

    expect(groups[0].querySelector('.permission-page-count')?.textContent.trim()).toBe('1 / 1');
    expect(groups[0].querySelector('.permission-option input:checked')).toBeTruthy();
  });

  it('shows a final setup summary before submission', () => {
    fixture.nativeElement.querySelectorAll('.startup-steps button')[5].click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#review-step-title')).toBeTruthy();
    expect(fixture.nativeElement.querySelectorAll('.review-card')).toHaveLength(5);
    expect(fixture.nativeElement.querySelector('.startup-actions button[type="submit"]')).toBeTruthy();
  });

  it('binds field components to the signal form', async () => {
    fixture.nativeElement.querySelectorAll('.startup-steps button')[1].click();
    fixture.detectChanges();
    await fixture.whenStable();

    const job_title = fixture.nativeElement.querySelector('app-field-input input') as HTMLInputElement;
    job_title.value = 'Cardiologist';
    job_title.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect((component as unknown as { model: () => { jobTitle: string } }).model().jobTitle).toBe(
      'Cardiologist',
    );
  });

  it('renders the clinic step with phone and image fields', async () => {
    fixture.nativeElement.querySelectorAll('.startup-steps button')[4].click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('app-field-phone input[type="tel"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-field-image input[type="file"]')).toBeTruthy();
  });

  it('adds, validates and removes specialties with image uploads', async () => {
    fixture.nativeElement.querySelectorAll('.startup-steps button')[3].click();
    fixture.detectChanges();
    const add = fixture.nativeElement.querySelector('#specialties-step-title').closest('section')
      .querySelector('button.btn-outline-primary') as HTMLButtonElement;
    add.click();
    add.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const uploads = fixture.nativeElement.querySelectorAll('app-field-image');
    expect(uploads).toHaveLength(2);

    const input = uploads[0].querySelector('input[type="file"]') as HTMLInputElement;
    const bad = new File(['x'], 'a.txt', { type: 'text/plain' });
    Object.defineProperty(input, 'files', { value: [bad], configurable: true });
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(uploads[0].textContent).toContain('field.errors.type');
    expect(uploads[0].querySelector('img')).toBeNull();

    const good = new File(['x'], 'a.png', { type: 'image/png' });
    URL.createObjectURL = () => 'blob:test';
    URL.revokeObjectURL = () => undefined;
    Object.defineProperty(input, 'files', { value: [good], configurable: true });
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(uploads[0].querySelector('img.field-preview')).toBeTruthy();

    (fixture.nativeElement.querySelector('.border-top button.text-danger') as HTMLButtonElement).click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('app-field-image')).toHaveLength(1);
    expect(fixture.nativeElement.querySelector('app-field-image img.field-preview')).toBeNull();
  });
});
