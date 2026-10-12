import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let theme: ThemeService;
  let testDocument: Document;
  let storedTheme: string | null;

  beforeEach(() => {
    storedTheme = null;
    testDocument = {
      documentElement: document.createElement('html'),
      defaultView: {
        localStorage: {
          getItem: () => storedTheme,
          setItem: (_key: string, value: string) => {
            storedTheme = value;
          },
        },
      },
    } as unknown as Document;
    TestBed.configureTestingModule({
      providers: [{ provide: DOCUMENT, useValue: testDocument }],
    });
    theme = TestBed.inject(ThemeService);
  });

  it('toggles the global PrimeNG dark theme and persists the selection', () => {
    theme.toggle();

    expect(theme.isDark()).toBe(true);
    expect(testDocument.documentElement.classList.contains('app-dark')).toBe(true);
    expect(testDocument.documentElement.style.colorScheme).toBe('dark');
    expect(storedTheme).toBe('dark');

    theme.toggle();

    expect(theme.isDark()).toBe(false);
    expect(testDocument.documentElement.classList.contains('app-dark')).toBe(false);
    expect(testDocument.documentElement.style.colorScheme).toBe('light');
    expect(storedTheme).toBe('light');
  });

  it('restores the saved mode when initialized', () => {
    storedTheme = 'dark';

    theme.initialize();

    expect(theme.isDark()).toBe(true);
    expect(testDocument.documentElement.classList.contains('app-dark')).toBe(true);
    expect(testDocument.documentElement.style.colorScheme).toBe('dark');
  });
});
