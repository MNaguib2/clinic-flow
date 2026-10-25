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
        { provide: AuthStore, useValue: { user: () => ({ fullName: 'Salma Ali' }), startup: () => false, logout } },
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

  it('puts language, theme, and logout settings in the mobile profile menu', () => {
    const menu = fixture.nativeElement.querySelector(
      '.mobile-profile-menu',
    ) as HTMLDetailsElement;
    (menu.querySelector('summary') as HTMLElement).click();

    expect(menu.open).toBe(true);
    expect(menu.querySelector('.language-button')).toBeTruthy();
    expect(menu.querySelector('app-theme-toggle')).toBeTruthy();
    expect(menu.querySelector('.mobile-logout')).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('.desktop-setting')?.classList.contains('d-none'),
    ).toBe(true);
  });

  it('logs out and returns to the landing page', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);

    fixture.nativeElement.querySelector('.logout-button').click();

    expect(logout).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith('/');
  });
});
