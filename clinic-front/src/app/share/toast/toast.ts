import { DOCUMENT, isPlatformBrowser, NgTemplateOutlet } from '@angular/common';
import {
  Component,
  computed,
  HostListener,
  inject,
  OnDestroy,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Icon } from '../icon/icon';
import { ToastGroup, ToastMessage, ToastService } from './toast.service';

@Component({
  imports: [TranslatePipe, Icon, NgTemplateOutlet],
  selector: 'app-toast',
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
})
export class Toast implements OnDestroy {
  readonly toastService = inject(ToastService);
  private readonly document = inject(DOCUMENT);
  private readonly translate = inject(TranslateService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private mediaQuery?: MediaQueryList;
  private readonly breakpointListener = (event: MediaQueryListEvent) =>
    this.isMobile.set(event.matches);
  protected readonly copy_feedback = signal<{ key: string; status: 'copied' | 'failed' } | null>(null);
  protected readonly isMobile = signal(false);
  protected readonly visibleGroups = computed<ToastGroup[]>(() =>
    this.toastService.groups()
      .map((group) => ({
        ...group,
        messages: group.messages.filter(
          (message) =>
            !this.isMobile() ||
            message.severity !== 'error' ||
            !this.isStructured(message),
        ),
      }))
      .filter((group) => group.messages.length > 0),
  );
  protected readonly sheetMessages = computed(() =>
    this.isMobile()
      ? this.toastService.messages().filter(
          (message) =>
            message.severity === 'error' && this.isStructured(message),
        )
      : [],
  );
  private feedbackTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    const window = this.document.defaultView;
    if (!this.isBrowser || !window?.matchMedia) return;

    this.mediaQuery = window.matchMedia('(max-width: 640px)');
    this.isMobile.set(this.mediaQuery.matches);
    if (this.mediaQuery.addEventListener) {
      this.mediaQuery.addEventListener('change', this.breakpointListener);
    } else {
      this.mediaQuery.addListener?.(this.breakpointListener);
    }
  }

  icon(severity: string): string {
    return ({ success: '✓', info: 'i', warn: '!', error: '×' } as Record<string, string>)[severity] ?? 'i';
  }

  async copyAll(message_id: number): Promise<void> {
    const message = this.toastService.messages().find((item) => item.id === message_id);
    if (!message?.validationErrors) return;

    const title = this.translate.instant('toast.validationTitle');
    const lines = [title];
    if (message.validationSummary) lines.push('', message.validationSummary);
    for (const error of message.validationErrors) {
      if (error.propertyPath) lines.push('', `${error.propertyPath}:`);
      else if (lines.length > 1) lines.push('');
      lines.push(...error.messages);
    }
    await this.copyText(lines.join('\n'), `${message_id}:all`);
  }

  async copyOne(message_id: number, error_index: number): Promise<void> {
    const message = this.toastService.messages().find((item) => item.id === message_id);
    const error = message?.validationErrors?.[error_index];
    if (!error) return;

    const lines = [
      ...(error.propertyPath ? [`${error.propertyPath}:`] : []),
      ...error.messages,
    ];
    await this.copyText(lines.join('\n'), `${message_id}:${error_index}`);
  }

  copyFeedback(key: string): string {
    const feedback = this.copy_feedback();
    if (feedback?.key !== key) return '';
    return this.translate.instant(
      feedback.status === 'copied' ? 'toast.copied' : 'toast.copyFailed',
    );
  }

  ngOnDestroy(): void {
    if (this.mediaQuery?.removeEventListener) {
      this.mediaQuery.removeEventListener('change', this.breakpointListener);
    } else {
      this.mediaQuery?.removeListener?.(this.breakpointListener);
    }
    if (this.feedbackTimer !== undefined) clearTimeout(this.feedbackTimer);
  }

  protected isStructured(message: ToastMessage): boolean {
    return Boolean(message.validationErrors?.length);
  }

  protected dismissSheet(): void {
    for (const message of this.sheetMessages()) {
      if (message.closable) this.toastService.remove(message.id);
    }
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.sheetMessages().some((message) => message.closable)) {
      this.dismissSheet();
    }
  }

  private async copyText(text: string, key: string): Promise<void> {
    try {
      if (!this.isBrowser) throw new Error('Clipboard is unavailable outside the browser.');
      const clipboard = this.document.defaultView?.navigator.clipboard;
      if (clipboard?.writeText) {
        await clipboard.writeText(text);
      } else {
        const text_area = this.document.createElement('textarea');
        text_area.value = text;
        text_area.setAttribute('readonly', '');
        text_area.style.position = 'fixed';
        text_area.style.opacity = '0';
        this.document.body.appendChild(text_area);
        let copied = false;
        try {
          text_area.select();
          copied = this.document.execCommand('copy');
        } finally {
          text_area.remove();
        }
        if (!copied) throw new Error('The browser could not copy the error message.');
      }
      this.setCopyFeedback(key, 'copied');
    } catch {
      this.setCopyFeedback(key, 'failed');
    }
  }

  private setCopyFeedback(key: string, status: 'copied' | 'failed'): void {
    if (this.feedbackTimer !== undefined) clearTimeout(this.feedbackTimer);
    this.copy_feedback.set({ key, status });
    this.feedbackTimer = setTimeout(() => {
      this.copy_feedback.set(null);
      this.feedbackTimer = undefined;
    }, 2200);
  }
}
