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
    expect(fixture.nativeElement.querySelectorAll('.startup-steps button')).toHaveLength(5);

    fixture.nativeElement.querySelectorAll('.startup-steps button')[1].click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#profile-step-title')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#organization-step-title')).toBeNull();
  });

  it('shows permission descriptions and selects all permissions within a page', () => {
    fixture.nativeElement.querySelectorAll('.startup-steps button')[2].click();
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.startup-section .text-action').click();
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
});
