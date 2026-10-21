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
              getOptions: () => of({ permissions: [] }),
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
});
