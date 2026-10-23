import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly isDark = signal(false);

  initialize(): void {
    if (!this.isBrowser) return;
    this.setDarkMode(this.document.defaultView?.localStorage.getItem('clinicflow-theme') === 'dark', false);
  }

  toggle(): void {
    this.setDarkMode(!this.isDark());
  }

  private setDarkMode(isDark: boolean, persist = true): void {
    this.isDark.set(isDark);
    const root = this.document.documentElement;
    root.classList.toggle('app-dark', isDark);
    root.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
    root.style.colorScheme = isDark ? 'dark' : 'light';
    if (persist && this.isBrowser) {
      this.document.defaultView?.localStorage.setItem(
        'clinicflow-theme',
        isDark ? 'dark' : 'light',
      );
    }
  }
  get mode(): 'dark' | 'light' {
    return this.isDark() ? 'dark' : 'light';
  }
}
