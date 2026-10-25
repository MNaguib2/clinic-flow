import { ToastService } from '@share/toast/toast.service';

export interface ErrorServiceOptions {
  error: unknown;
  toastService: ToastService;
  isBrowser: boolean;
}

export class ErrorService extends Error {
  private readonly error: unknown;
  private readonly toastService: ToastService;
  private readonly isBrowser: boolean;
  private readonly unknownError = 'An unknown error occurred.';

  constructor(options: ErrorServiceOptions) {
    super('The HTTP request failed.');
    this.name = 'ErrorService';
    this.error = options.error;
    this.toastService = options.toastService;
    this.isBrowser = options.isBrowser;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  /** Returns every readable message, including nested validation constraints. */
  getErrorMessages(): string[] {
    const body = this.getErrorObject();
    if (!this.isRecord(body)) return [this.unknownError];

    const { summary, errors } = this.toastService.parseValidation(body);
    if (errors.length) {
      return [
        ...(summary ? [summary] : []),
        ...errors.flatMap((item) =>
          item.messages.map((message) => (item.propertyPath ? `${item.propertyPath}: ${message}` : message)),
        ),
      ];
    }

    const top_level_messages = typeof body['error'] === 'string' ? [body['error']] : [];
    const message = body['message'];
    if (typeof message === 'string') return [...top_level_messages, message];
    return top_level_messages.length ? top_level_messages : [this.unknownError];
  }

  /** Returns the backend response body when the error is an HTTP error. */
  getErrorObject(): object {
    if (!this.isRecord(this.error)) return {};
    if (!('error' in this.error)) return this.error;
    const body = this.error['error'];
    if (this.isRecord(body)) return body;
    return typeof body === 'string' ? { message: body } : this.error;
  }

  getErrorMessage(): string {
    return this.getErrorMessages().join('\n');
  }

  show(): void {
    if (this.isBrowser) {
      this.toastService.show(
        {
          validate: this.getErrorObject(),
          severity: 'error',
          summaryOrOptions: {
            life: 500000,
            summary: 'Error',
            showProgress: true,
            closable: true,
            position: 'top-start',
            showCopyIndividual: true,
            showCopyAll: true
          },
        },
      );
    }
  }
}
