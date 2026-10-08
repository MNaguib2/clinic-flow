import { TestBed } from '@angular/core/testing';
import { afterEach, vi } from 'vitest';
import { clinicTranslationProviders } from './app.config';
import { App } from './app';

describe('App', () => {
  afterEach(() => vi.unstubAllGlobals());

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [...clinicTranslationProviders],
    })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the clinic overview', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Care for patients.');
    expect(compiled.querySelector('#benefits')).toBeTruthy();
  });

  it('switches to Arabic and right-to-left layout', async () => {
    vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => undefined });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    compiled.querySelector<HTMLButtonElement>('button.language-button')?.click();
    fixture.detectChanges();

    expect(compiled.querySelector('.site-shell')?.getAttribute('dir')).toBe('rtl');
    expect(compiled.querySelector('h1')?.textContent).toContain('رعاية أفضل للمرضى.');
  });
});
