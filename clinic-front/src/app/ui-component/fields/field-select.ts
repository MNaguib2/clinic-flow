import { Component, forwardRef, input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { FieldBase } from './field-base';
import { FieldShell } from './field-shell';

export interface SelectOption {
  value: string;
  /** Translation key or plain text. */
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-field-select',
  imports: [FieldShell, TranslatePipe],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => FieldSelect), multi: true },
  ],
  template: `
    <app-field-shell
      [control_id]="uid"
      [label]="label()"
      [help_text]="helpText()"
      [error]="error()"
      [required]="required()"
    >
      <select
        class="form-select"
        [class.is-invalid]="!!error()"
        [id]="uid"
        [attr.aria-describedby]="described_by()"
        [attr.aria-invalid]="error() ? 'true' : null"
        [required]="required()"
        [disabled]="disabled() || readOnly()"
        (change)="commit($any($event.target).value)"
        (blur)="touch()"
      >
        @if (placeholder()) {
          <option value="" [selected]="current() === ''">{{ placeholder() | translate }}</option>
        }
        @for (option of options(); track option.value) {
          <option
            [value]="option.value"
            [disabled]="!!option.disabled"
            [selected]="option.value === current()"
          >
            {{ option.label | translate }}
          </option>
        }
      </select>
    </app-field-shell>
  `,
})
export class FieldSelect extends FieldBase<string> {
  readonly options = input<readonly SelectOption[]>([]);
  readonly placeholder = input('');

  constructor() {
    super('');
  }
}
