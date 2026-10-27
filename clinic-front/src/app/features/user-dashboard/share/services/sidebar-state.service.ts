import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SidebarState {
  private readonly document = inject(DOCUMENT);
  private readonly is_browser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly is_open = signal(false);

  constructor() {
    effect((on_cleanup) => {
      if (!this.is_browser || !this.is_open()) return;

      const body = this.document.body;
      const previous_overflow = body.style.overflow;
      body.style.overflow = 'hidden';
      on_cleanup(() => {
        body.style.overflow = previous_overflow;
      });
    });
  }

  toggle(): void {
    this.is_open.update((is_open) => !is_open);
  }

  close(): void {
    this.is_open.set(false);
  }
}
