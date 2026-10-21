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
                      name: 'clinic.read',
                      description_en: 'View clinics',
                      description_ar: 'عرض العيادات',
                      page: {
                        name: 'clinic',
                        description_en: 'Clinic access',
                        description_ar: 'إدارة العيادات',
                      },
                    },
                    {
                      id: '2',
                      name: 'organization.read',
                      description_en: 'View organization',
                      description_ar: 'عرض المؤسسة',
                      page: {
                        name: 'organization',
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

  it('groups role permissions by page description', () => {
    fixture.nativeElement.querySelectorAll('.startup-steps button')[2].click();
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.startup-section .text-action').click();
    fixture.detectChanges();

    const groups = fixture.nativeElement.querySelectorAll(
      'optgroup',
    ) as NodeListOf<HTMLOptGroupElement>;
    expect(Array.from(groups).map((group) => group.label)).toEqual([
      'Clinic access',
      'Organization settings',
    ]);
    expect(groups[0].querySelector('option')?.textContent.trim()).toBe('View clinics');
  });
});
