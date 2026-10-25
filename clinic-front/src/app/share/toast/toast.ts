import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnDestroy, PLATFORM_ID, signal } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Icon } from '../icon/icon';
import { ToastService } from './toast.service';

@Component({
  imports: [TranslatePipe, Icon],
  selector: 'app-toast',
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
})
export class Toast implements OnDestroy {
  readonly toastService = inject(ToastService);
  private readonly document = inject(DOCUMENT);
  private readonly translate = inject(TranslateService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  protected readonly copy_feedback = signal<{ key: string; status: 'copied' | 'failed' } | null>(null);
  private feedbackTimer: ReturnType<typeof setTimeout> | undefined;

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
    if (this.feedbackTimer !== undefined) clearTimeout(this.feedbackTimer);
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
