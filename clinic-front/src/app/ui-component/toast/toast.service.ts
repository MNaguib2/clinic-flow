import { computed, Injectable, signal } from '@angular/core';

export type ToastSeverity = 'success' | 'info' | 'warn' | 'error';

export type ToastPosition =
  | 'top-start'
  | 'top-center'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-center'
  | 'bottom-end';

export const TOAST_POSITIONS: readonly ToastPosition[] = [
  'top-start',
  'top-center',
  'top-end',
  'bottom-start',
  'bottom-center',
  'bottom-end',
];

export interface ToastGroup {
  position: ToastPosition;
  messages: ToastMessage[];
}

export interface ToastOptions {
  /** Auto-dismiss delay in milliseconds. Use 0 to keep the toast until dismissed. */
  life?: number;
  /** Display a countdown bar while the toast is visible. */
  showProgress?: boolean;
  /** Display the dismiss button. */
  closable?: boolean;
  /** Optional heading shown above the detail. */
  summary?: string;
  /** Screen corner or edge where the toast stacks. Defaults to `top-end`. */
  position?: ToastPosition;
  /** Display the "Copy all messages" button on structured error toasts. Defaults to false. */
  showCopyAll?: boolean;
  /** Display per-error copy buttons on structured error toasts. Defaults to false. */
  showCopyIndividual?: boolean;
}

export interface ToastPayload extends ToastOptions {
  /** Accepts a plain message, an API response, or an HttpErrorResponse-like object. */
  detail?: unknown;
  message?: unknown;
  error?: unknown;
  validate?: unknown;
  severity?: ToastSeverity;
  summaryOrOptions?: string | ToastOptions;
}

export interface ToastMessage {
  id: number;
  severity: ToastSeverity;
  summary: string;
  details: string[];
  validationSummary?: string;
  validationErrors?: ToastValidationError[];
  life: number;
  showProgress: boolean;
  closable: boolean;
  position: ToastPosition;
  showCopyAll: boolean;
  showCopyIndividual: boolean;
}

export interface ToastValidationError {
  propertyPath: string;
  messages: string[];
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly messages = signal<ToastMessage[]>([]);
  /** Global defaults; individual toast calls override them. */
  readonly defaults: Pick<ToastOptions, 'position' | 'showCopyAll' | 'showCopyIndividual'> = {
    position: 'top-end',
    showCopyAll: false,
    showCopyIndividual: false,
  };
  /** Messages grouped by position; only positions that have toasts are listed. */
  readonly groups = computed<ToastGroup[]>(() => {
    const messages = this.messages();
    return TOAST_POSITIONS.map((position) => ({
      position,
      messages: messages.filter((message) => message.position === position),
    })).filter((group) => group.messages.length > 0);
  });
  private nextId = 0;
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();

  show(
    input: unknown,
    severity: ToastSeverity = 'info',
    summaryOrOptions: string | ToastOptions = '',
  ): number {
    const payload = this.isRecord(input) ? input as ToastPayload : undefined;
    const content = payload
      ? payload.validate ?? payload.error ?? payload.detail ?? payload.message ?? input
      : input;
    const effectiveSeverity = payload?.severity ?? severity;
    const configuredOptions = payload?.summaryOrOptions ?? summaryOrOptions;
    const callOptions = typeof configuredOptions === 'string' ? { summary: configuredOptions } : configuredOptions;
    const options: ToastOptions = { ...payload, ...callOptions };
    const life = Math.max(0, options.life ?? 5000);
    const validation_source = payload?.validate ?? input;
    const validationErrors = this.toValidationErrors(validation_source);
    const validationSummary = this.getValidationSummary(validation_source);
    const details = validationErrors.length
      ? [...new Set([validationSummary, ...validationErrors.flatMap((item) => item.messages)].filter(
          (message): message is string => Boolean(message),
        ))]
      : this.toMessages(content);
    const id = ++this.nextId;
    this.messages.update((messages) => [
      ...messages,
      {
        id,
        severity: effectiveSeverity,
        summary: options.summary ?? '',
        details,
        ...(validationErrors.length
          ? { validationSummary, validationErrors }
          : {}),
        life,
        showProgress: options.showProgress ?? true,
        closable: options.closable ?? true,
        position: options.position && TOAST_POSITIONS.includes(options.position)
          ? options.position
          : this.defaults.position ?? 'top-end',
        showCopyAll: effectiveSeverity === 'error' && (options.showCopyAll ?? this.defaults.showCopyAll ?? false),
        showCopyIndividual:
          effectiveSeverity === 'error' && (options.showCopyIndividual ?? this.defaults.showCopyIndividual ?? false),
      },
    ]);
    if (life > 0) this.timers.set(id, setTimeout(() => this.remove(id), life));
    return id;
  }

  remove(id: number): void {
    const timer = this.timers.get(id);
    if (timer !== undefined) clearTimeout(timer);
    this.timers.delete(id);
    this.messages.update((messages) => messages.filter((message) => message.id !== id));
  }

  /** Single parser for structured backend validation errors. */
  parseValidation(value: unknown): { summary: string; errors: ToastValidationError[] } {
    return { summary: this.getValidationSummary(value), errors: this.toValidationErrors(value) };
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  private toValidationErrors(value: unknown): ToastValidationError[] {
    if (Array.isArray(value)) {
      const errors = value.flatMap((item) => this.toValidationErrors(item));
      return this.groupValidationErrors(errors);
    }

    if (this.isRecord(value) && 'error' in value && this.isRecord(value['error'])) {
      return this.toValidationErrors(value['error']);
    }

    if (!this.isRecord(value)) return [];
    const message = value['message'];
    const validation_entries = Array.isArray(message)
      ? message
      : Array.isArray(value['validate'])
        ? value['validate']
        : 'property' in value &&
            ('constraints' in value || 'children' in value)
          ? [value]
          : undefined;
    if (!validation_entries) return [];

    const errors: ToastValidationError[] = [];
    const seen = new Set<string>();
    const visit = (entry: unknown, parent_path = ''): void => {
      if (!this.isRecord(entry)) return;

      const property =
        typeof entry['property'] === 'string' ? entry['property'] : '';
      const property_path = property
        ? /^\d+$/.test(property)
          ? `${parent_path}[${property}]`
          : [parent_path, property].filter(Boolean).join('.')
        : parent_path;
      const constraints = entry['constraints'];
      if (this.isRecord(constraints)) {
        const messages = [
          ...new Set(
            Object.values(constraints).filter(
              (constraint): constraint is string =>
                typeof constraint === 'string' && Boolean(constraint.trim()),
            ),
          ),
        ];
        if (messages.length) {
          const key = `${property_path}\u0000${messages.join('\u0000')}`;
          if (!seen.has(key)) {
            seen.add(key);
            errors.push({ propertyPath: property_path, messages });
          }
        }
      }

      if (Array.isArray(entry['children'])) {
        for (const child of entry['children']) visit(child, property_path);
      }
    };

    for (const entry of validation_entries) visit(entry);
    return this.groupValidationErrors(errors);
  }

  private groupValidationErrors(errors: ToastValidationError[]): ToastValidationError[] {
    const grouped = new Map<string, Set<string>>();
    for (const error of errors) {
      const messages = grouped.get(error.propertyPath) ?? new Set<string>();
      for (const message of error.messages) messages.add(message);
      grouped.set(error.propertyPath, messages);
    }
    return [...grouped].map(([propertyPath, messages]) => ({
      propertyPath,
      messages: [...messages],
    }));
  }

  private getValidationSummary(value: unknown): string {
    if (Array.isArray(value)) {
      for (const item of value) {
        const summary = this.getValidationSummary(item);
        if (summary) return summary;
      }
      return '';
    }
    if (this.isRecord(value) && 'error' in value) {
      const error = value['error'];
      if (typeof error === 'string') return error;
      if (this.isRecord(error)) return this.getValidationSummary(error);
    }
    return '';
  }

  private toMessages(value: unknown, prefix = ''): string[] {
    if (typeof value === 'string') return value.split('\n').filter(Boolean);
    if (Array.isArray(value)) {
      const messages = value.flatMap((item) => this.toMessages(item, prefix));
      return messages.length ? messages : ['An unknown error occurred.'];
    }
    if (!this.isRecord(value)) return [value == null ? 'An unknown error occurred.' : String(value)];

    const messages: string[] = [];
    const error = value['error'];
    if (typeof error === 'string') messages.push(error);
    else if (Array.isArray(error)) messages.push(...this.toMessages(error, prefix));
    else if (this.isRecord(error) && error !== value) messages.push(...this.toMessages(error, prefix));

    const constraints = value['constraints'];
    const property = typeof value['property'] === 'string' ? value['property'] : '';
    const path = [prefix, property].filter(Boolean).join('.');
    if (this.isRecord(constraints)) {
      for (const message of Object.values(constraints)) {
        if (typeof message === 'string') messages.push(path ? `${path}: ${message}` : message);
      }
    }

    const message = value['message'];
    if (typeof message === 'string') messages.push(message);
    else if (Array.isArray(message)) {
      for (const item of message) {
        const nestedMessages = this.toMessages(item, path);
        messages.push(...nestedMessages);
      }
    } else if (this.isRecord(message)) {
      for (const [field, fieldMessages] of Object.entries(message)) {
        messages.push(...this.toMessages(fieldMessages, [path, field].filter(Boolean).join('.')));
      }
    }

    if (Array.isArray(value['children'])) {
      for (const child of value['children']) messages.push(...this.toMessages(child, path));
    }
    if ('errors' in value) messages.push(...this.toMessages(value['errors'], path));

    return messages.length ? [...new Set(messages)] : ['An unknown error occurred.'];
  }
}
