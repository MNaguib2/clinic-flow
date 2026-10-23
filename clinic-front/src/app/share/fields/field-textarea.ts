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
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => FieldTextarea), multi: true },
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
      <div class="position-relative">
        @if (icon()) {
          <app-icon [name]="icon()" class="field-icon field-icon-top text-body-secondary" />
        }
        <textarea
          class="form-control"
          [class.has-icon]="!!icon()"
          [class.is-invalid]="!!error()"
          [id]="uid"
          [rows]="rows()"
          [value]="current()"
          [attr.placeholder]="placeholder() ? (placeholder() | translate) : null"
          [attr.maxlength]="maxLength() ?? null"
          [attr.aria-describedby]="described_by()"
          [attr.aria-invalid]="error() ? 'true' : null"
          [required]="required()"
          [readOnly]="readOnly()"
          [disabled]="disabled()"
          (input)="commit($any($event.target).value)"
          (blur)="touch()"
        ></textarea>
      </div>
      @if (maxLength()) {
        <small class="d-block text-end text-body-secondary mt-1">
          {{ current().length }}/{{ maxLength() }}
        </small>
      }
    </app-field-shell>
  `,
})
export class FieldTextarea extends FieldBase<string> {
  readonly placeholder = input('');
  readonly rows = input(3);
  readonly maxLength = input<number>();
  /** Optional leading icon name from `public/images/icons`. */
  readonly icon = input('');

  constructor() {
    super('');
  }
}
