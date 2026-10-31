
import { Component, forwardRef, input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

import { FieldBase } from './field-base';
import { FieldShell } from './field-shell';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-field-textarea',
  imports: [FieldShell, Icon, TranslatePipe],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FieldTextarea),
      multi: true,
    },
  ],
  styleUrl: './field-textarea.scss',
  template: `
    <app-field-shell
      [control_id]="uid"
      [label]="label()"
      [help_text]="helpText()"
      [error]="error()"
      [required]="required()"
    >
      <div class="ui-textarea">
        @if (icon()) {
          <app-icon
            [name]="icon()"
            class="ui-textarea__icon"
          />
        }

        <textarea
          class="ui-textarea__control"
          [class.ui-textarea__control--with-icon]="!!icon()"
          [class.ui-textarea__control--invalid]="!!error().length"
          [id]="uid"
          [rows]="rows()"
          [value]="current()"
          [attr.placeholder]="
            placeholder() ? (placeholder() | translate) : null
          "
          [attr.maxlength]="maxLength() ?? null"
          [attr.aria-describedby]="described_by()"
          [attr.aria-invalid]="error().length ? 'true' : null"
          [required]="required()"
          [readOnly]="readOnly()"
          [disabled]="disabled()"
          (input)="commit($any($event.target).value)"
          (blur)="touch()"
        ></textarea>
      </div>

      @if (maxLength(); as limit) {
        <div class="ui-textarea__footer">
          <span class="ui-textarea__counter">
            <span
              [class.ui-textarea__counter--limit]="current().length >= limit"
            >
              {{ current().length }}
            </span>
            /{{ limit }}
          </span>
        </div>
      }
    </app-field-shell>
  `,
})
export class FieldTextarea extends FieldBase<string> {
  readonly placeholder = input('');
  readonly rows = input(3);
  readonly maxLength = input<number>();
  readonly icon = input('');

  constructor() {
    super('');
  }
}
