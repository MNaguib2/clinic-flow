import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Toast } from './toast';
import { ToastService } from './toast.service';

describe('Toast', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('shows structured errors in a mobile sheet and moves them back on resize', async () => {
    await TestBed.configureTestingModule({
      imports: [Toast],
      providers: [ToastService, provideTranslateService()],
    }).compileComponents();

    const document = TestBed.inject(DOCUMENT);
    const window = document.defaultView;
    if (!window) throw new Error('The test document has no window.');
    const original_match_media = window.matchMedia;
    let notify_breakpoint: ((event: MediaQueryListEvent) => void) | undefined;
    const media_query = {
      matches: true,
      addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
        notify_breakpoint = listener;
      },
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList;
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn(() => media_query),
    });

    const toast_service = TestBed.inject(ToastService);
    const fixture = TestBed.createComponent(Toast);
    toast_service.show({
      message: [
        {
          property: 'clinics',
          children: [
            {
              property: '0',
              children: [
                {
                  property: 'clinicImage',
                  constraints: { whitelist: 'property clinicImage should not exist' },
                },
              ],
            },
          ],
        },
      ],
      error: 'Bad Request',
      life: 0,
    }, 'error');
    fixture.detectChanges();

    const id = toast_service.messages()[0].id;
    expect(fixture.nativeElement.querySelector('.toast-sheet')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.toast-region .toast')).toBeNull();

    notify_breakpoint?.({ matches: false } as MediaQueryListEvent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.toast-sheet')).toBeNull();
    expect(fixture.nativeElement.querySelector('.toast-region .toast')).not.toBeNull();
    expect(toast_service.messages()[0].id).toBe(id);

    fixture.destroy();
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: original_match_media,
    });
  });

  it('keeps plain errors as regular mobile toasts', async () => {
    await TestBed.configureTestingModule({
      imports: [Toast],
      providers: [ToastService, provideTranslateService()],
    }).compileComponents();

    const document = TestBed.inject(DOCUMENT);
    const window = document.defaultView;
    if (!window) throw new Error('The test document has no window.');
    const original_match_media = window.matchMedia;
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn(() => ({ matches: true }) as MediaQueryList),
    });

    const toast_service = TestBed.inject(ToastService);
    toast_service.show('Network unavailable', 'error', { life: 0 });
    const fixture = TestBed.createComponent(Toast);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.toast-sheet')).toBeNull();
    expect(fixture.nativeElement.querySelector('.toast-region .toast')).not.toBeNull();

    fixture.destroy();
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: original_match_media,
    });
  });

  it('renders nested validation paths without exposing backend targets', async () => {
    await TestBed.configureTestingModule({
      imports: [Toast],
      providers: [ToastService, provideTranslateService()],
    }).compileComponents();
    const toast_service = TestBed.inject(ToastService);
    toast_service.show({
      message: [
        {
          property: 'clinics',
          children: [
            {
              property: '0',
              children: [
                {
                  target: { privateValue: 'secret target' },
                  property: 'clinicImage',
                  constraints: { whitelist: 'property clinicImage should not exist' },
                },
              ],
            },
          ],
        },
      ],
      error: 'Invalid request',
      statusCode: 400,
      life: 0,
    });
    const fixture = TestBed.createComponent(Toast);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.toast__property')?.textContent).toContain(
      'clinics[0].clinicImage',
    );
    expect(fixture.nativeElement.textContent).toContain('property clinicImage should not exist');
    expect(fixture.nativeElement.textContent).not.toContain('secret target');

    const document = TestBed.inject(DOCUMENT);
    const navigator = document.defaultView?.navigator;
    if (!navigator) throw new Error('The test document has no navigator.');
    const descriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    const write_text = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: write_text },
    });

    try {
      await fixture.componentInstance.copyAll(toast_service.messages()[0].id);
      expect(write_text).toHaveBeenCalledWith(
        expect.stringContaining('clinics[0].clinicImage:\nproperty clinicImage should not exist'),
      );
    } finally {
      if (descriptor) Object.defineProperty(navigator, 'clipboard', descriptor);
      else Reflect.deleteProperty(navigator, 'clipboard');
      fixture.destroy();
    }
  });
});
