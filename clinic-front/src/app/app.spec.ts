import { TestBed } from '@angular/core/testing';
import { afterEach, vi } from 'vitest';
import { clinicTranslationProviders } from './app.config';
import { HomePage } from './home-page';
import { provideRouter } from '@angular/router';

describe('App', () => {
  afterEach(() => vi.unstubAllGlobals());

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [...clinicTranslationProviders, provideRouter([])],
    })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(HomePage);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the clinic overview', async () => {
    const fixture = TestBed.createComponent(HomePage);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Care for patients.');
    expect(compiled.querySelector('#benefits')).toBeTruthy();
  });

  it('switches to Arabic and right-to-left layout', async () => {
    vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => undefined });
    const fixture = TestBed.createComponent(HomePage);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    compiled.querySelector<HTMLButtonElement>('app-ui-button.language-button button')?.click();
    fixture.detectChanges();

    expect(compiled.querySelector('.site-shell')?.getAttribute('dir')).toBe('rtl');
    expect(compiled.querySelector('h1')?.textContent).toContain('رعاية أفضل للمرضى.');
  });
});
