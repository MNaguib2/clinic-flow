import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { AuthStore } from '@core/auth/auth.store';
import { LanguageService } from '@core/services/language/language.service';
import { provideTranslateService } from '@ngx-translate/core';
import { DashboardShell } from './dashboard-shell';

describe('DashboardShell', () => {
  let fixture: ComponentFixture<DashboardShell>;
  const logout = vi.fn();

  beforeEach(async () => {
    logout.mockClear();
    await TestBed.configureTestingModule({
      imports: [DashboardShell],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        { provide: AuthStore, useValue: { user: () => ({ fullName: 'Salma Ali' }), logout } },
        { provide: LanguageService, useValue: { language: () => 'en', toggle: () => undefined } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardShell);
    await fixture.whenStable();
  });

  it('shows the user initial and name in the header', () => {
    const header: HTMLElement = fixture.nativeElement.querySelector('.dashboard-header');

    expect(header.querySelector('.user-avatar')?.textContent?.trim()).toBe('S');
    expect(header.querySelector('.user-name')?.textContent?.trim()).toBe('Salma Ali');
  });

  it('logs out and returns to the landing page', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);

    fixture.nativeElement.querySelector('.logout-button').click();

    expect(logout).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith('/');
  });
});
