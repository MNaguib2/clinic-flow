import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type ClinicLanguage = 'en' | 'ar';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly translateService = inject(TranslateService);
  readonly language = signal<ClinicLanguage>('en');


  initialize(): void {
    if (!this.isBrowser) return;

    const language =
      this.document.defaultView?.localStorage.getItem('clinicflow-language') === 'ar'
        ? 'ar'
        : 'en';
    this.applyLanguage(language, false);
  }

  toggle(): void {
    this.setLanguage(this.language() === 'en' ? 'ar' : 'en');
  }

  setLanguage(language: ClinicLanguage): void {
    this.applyLanguage(language, true);
  }

  private applyLanguage(language: ClinicLanguage, persist: boolean): void {
    this.language.set(language);
    this.document.documentElement.lang = language;
    this.document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    this.document
      .getElementById('bootstrap-css')
      ?.setAttribute(
        'href',
        language === 'ar' ? 'bootstrap/bootstrap.rtl.min.css' : 'bootstrap/bootstrap.min.css',
      );
    this.translateService.use(language).subscribe();

    if (persist && this.isBrowser) {
      this.document.defaultView?.localStorage.setItem('clinicflow-language', language);
    }
  }
}
