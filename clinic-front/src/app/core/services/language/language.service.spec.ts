import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { LanguageService } from './language.service';

describe('LanguageService', () => {
  let languageService: LanguageService;
  let testDocument: Document;
  let storedLanguage: string | null;
  let translatedLanguage: string | undefined;

  beforeEach(() => {
    storedLanguage = null;
    translatedLanguage = undefined;
    testDocument = {
      documentElement: document.createElement('html'),
      defaultView: {
        localStorage: {
          getItem: () => storedLanguage,
          setItem: (_key: string, value: string) => {
            storedLanguage = value;
          },
        },
      },
    } as unknown as Document;

    TestBed.configureTestingModule({
      providers: [
        { provide: DOCUMENT, useValue: testDocument },
        {
          provide: TranslateService,
          useValue: {
            use: (language: string) => {
              translatedLanguage = language;
              return of(language);
            },
          },
        },
      ],
    });
    languageService = TestBed.inject(LanguageService);
  });

  it('restores the saved language and applies it to the document and translations', () => {
    storedLanguage = 'ar';

    languageService.initialize();

    expect(languageService.language()).toBe('ar');
    expect(translatedLanguage).toBe('ar');
    expect(testDocument.documentElement.lang).toBe('ar');
    expect(testDocument.documentElement.dir).toBe('rtl');
  });

  it('shares language changes and persists them for subsequent pages', () => {
    languageService.setLanguage('ar');
    languageService.toggle();

    expect(languageService.language()).toBe('en');
    expect(storedLanguage).toBe('en');
    expect(translatedLanguage).toBe('en');
    expect(testDocument.documentElement.dir).toBe('ltr');
  });
});
