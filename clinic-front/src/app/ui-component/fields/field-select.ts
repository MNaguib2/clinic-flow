
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
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FieldSelect),
      multi: true,
    },
  ],
  styleUrl: './field-select.scss',
  template: `
    <app-field-shell
      [control_id]="uid"
      [label]="label()"
      [help_text]="helpText()"
      [error]="error()"
      [required]="required()"
    >
      <div class="ui-select">
        <select
          class="ui-select__control"
          [class.ui-select__control--invalid]="!!error().length"
          [class.ui-select__control--placeholder]="!current()"
          [id]="uid"
          [value]="current()"
          [attr.aria-describedby]="described_by()"
          [attr.aria-invalid]="error().length ? 'true' : null"
          [required]="required()"
          [disabled]="disabled() || readOnly()"
          (change)="commit($any($event.target).value)"
          (blur)="touch()"
        >
          @if (placeholder()) {
            <option value="" disabled>
              {{ placeholder() | translate }}
            </option>
          }

          @for (option of options(); track option.value) {
            <option
              [value]="option.value"
              [disabled]="!!option.disabled"
            >
              {{ option.label | translate }}
            </option>
          }
        </select>

        <span class="ui-select__icon" aria-hidden="true">
          <svg
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
      </div>
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
