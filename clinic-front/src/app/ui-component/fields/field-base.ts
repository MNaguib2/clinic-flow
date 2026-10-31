import {
  booleanAttribute,
  computed,
  Directive,
  effect,
  input,
  output,
  signal,
  untracked,
  WritableSignal,
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

let next_field_id = 0;

/**
 * Shared ControlValueAccessor logic for field components.
 * Empty-value convention: text-like -> '', number -> null, select -> '',
 * checkbox -> false, single file/image -> null, multiple files -> [].
 * `writeValue` never emits; only user interaction calls `commit`.
 */
@Directive()
export abstract class FieldBase<T> implements ControlValueAccessor {
  /** Translation key or plain text. */
  readonly label = input<string>('');
  readonly helpText = input<string>('');
  /** Translation key or plain text; shown when set. */
  readonly shownError = input<Array<string> | null>(null);

  readonly required = input(false, { transform: booleanAttribute });
  readonly readOnly = input(false, { alias: 'readonly', transform: booleanAttribute });
  readonly disabledInput = input(false, { alias: 'disabled', transform: booleanAttribute });
  /** Seeds the value without Forms, e.g. when the parent owns the state. */
  readonly initialValue = input<T | undefined>(undefined);

  readonly changed = output<T>();
  readonly blurred = output<void>();

  protected readonly uid = `field-${next_field_id++}`;
  protected readonly current: WritableSignal<T>;

  /** Error produced by the component itself (e.g. file validation). */
  protected readonly local_error = signal<Array<string> | null>(null);

  protected readonly error = computed(() => [...(this.local_error() ?? []), ... (this.shownError() ?? [])]);

  private readonly forms_disabled = signal(false);
  protected readonly disabled = computed(() => this.disabledInput() || this.forms_disabled());

  protected readonly described_by = computed(() => {
    const ids = [
      this.helpText() ? `${this.uid}-help` : '',
      this.error().join('') ? `${this.uid}-error` : '',
    ].filter(Boolean);
    return ids.length ? ids.join(' ') : null;
  });

  private on_change: (value: T) => void = () => undefined;
  private on_touched: () => void = () => undefined;

  readonly touched = input(false);
  readonly errors = input<readonly { kind: string; message?: string }[]>([]);

  protected constructor(private readonly empty: T) {
    this.current = signal<T>(empty);
    effect(() => {
      const value = this.initialValue();
      if (value !== undefined) untracked(() => this.current.set(value));
    });
    effect(() => {
      if (this.touched()) {
        this.touch();
        if (this.errors().length > 0) this.local_error.set(this.errors().map(e => e.message ?? '').filter(Boolean) ?? null);
        else this.local_error.set(null);
      }
    });
  }

  writeValue(value: T | null | undefined): void {
    this.current.set(value ?? this.empty);
  }

  registerOnChange(fn: (value: T) => void): void {
    this.on_change = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.on_touched = fn;
  }

  setDisabledState(is_disabled: boolean): void {
    this.forms_disabled.set(is_disabled);
  }

  protected commit(value: T): void {
    this.current.set(value);
    this.on_change(value);
    this.changed.emit(value);
  }

  protected touch(): void {
    this.on_touched();
    this.blurred.emit();
  }
}
