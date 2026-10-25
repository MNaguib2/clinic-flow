import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Toast } from './toast';
import { ToastService } from './toast.service';

describe('Toast', () => {
  afterEach(() => vi.unstubAllGlobals());

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
