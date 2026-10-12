import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideTranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import arabicTranslation from '../public/locale/ar.json';
import englishTranslation from '../public/locale/en.json';
import { API_URL } from '@core/config/app.config';

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
    provideHttpClient(),
    provideClientHydration(),
    ...clinicTranslationProviders,
    {
      provide: API_URL,
      useFactory: () => {
        if (isDevMode()) {
          return 'https://localhost:3000/api';
        } else {
          return 'https://clinicflow-api.onrender.com/api';
        }
      }
    }
  ],
};
