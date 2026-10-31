import { Component, forwardRef, input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { FieldBase } from './field-base';
import { FieldShell } from './field-shell';
import { Icon } from '../icon/icon';

export type InputFieldType = 'text' | 'email' | 'password' | 'number' | 'url' | 'date';

/** Value: string, or `number | null` when `type` is `number`. */
@Component({
  selector: 'app-field-input',
  imports: [FieldShell, Icon, TranslatePipe],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => FieldInput), multi: true },
  ],
  styleUrl: './field-icon.scss',
  template: `
    <app-field-shell
      [control_id]="uid"
      [label]="label()"
      [help_text]="helpText()"
      [error]="error()"
      [required]="required()"
    >

<div class="field-input__control">
  @if (icon()) {
    <app-icon
      [name]="icon()"
      class="field-input__icon"
      aria-hidden="true"
    />
  }

  <input
    class="field-input__native"
    [class.field-input__native--icon]="!!icon()"
    [class.field-input__native--invalid]="!!error().length"
    [class]="inputClass()"
    [id]="uid"
    [type]="type()"
    [value]="current() ?? ''"
    [attr.placeholder]="placeholder() ? (placeholder() | translate) : null"
    [attr.autocomplete]="autocomplete() || null"
    [attr.list]="list() || null"
    [attr.min]="min() ?? null"
    [attr.max]="max() ?? null"
    [attr.step]="step() ?? null"
    [attr.maxlength]="maxLength() ?? null"
    [attr.aria-describedby]="described_by()"
    [attr.aria-invalid]="error().length ? 'true' : null"
    [required]="required()"
    [readOnly]="readOnly()"
    [disabled]="disabled()"
    (input)="on_input($event)"
    (blur)="touch()"
  />
</div>

    </app-field-shell>
  `,
})
export class FieldInput extends FieldBase<string | number | null> {
  readonly type = input<InputFieldType>('text');
  readonly placeholder = input('');
  readonly autocomplete = input('');
  /** id of a `<datalist>` for suggestions. */
  readonly list = input('');
  readonly min = input<number | string>();
  readonly max = input<number | string>();
  readonly step = input<number | string>();
  readonly maxLength = input<number>();
  /** Additional CSS class applied to the native input element. */
  readonly inputClass = input('');
  /** Optional leading icon name from `public/images/icons`. */
  readonly icon = input('');

  constructor() {
    super('');
  }

  protected on_input(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    if (this.type() !== 'number') return this.commit(raw);
    const parsed = Number(raw);
    this.commit(raw === '' || Number.isNaN(parsed) ? null : parsed);
  }
}
