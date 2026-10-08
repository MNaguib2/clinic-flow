import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideTranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import arabicTranslation from '../locale/ar.json';
import englishTranslation from '../locale/en.json';

const loadTranslation = () => ({
  getTranslation: (language: string) => of(language === 'ar' ? arabicTranslation : englishTranslation),
});

export const clinicTranslationProviders = provideTranslateService({
  lang: 'en',
  fallbackLang: 'en',
  loader: provideTranslateLoader(loadTranslation),
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(),
    ...clinicTranslationProviders,
  ]
};
