import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { FieldBase } from './field-base';

@Component({
  selector: 'app-field-checkbox',
  imports: [TranslatePipe],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => FieldCheckbox), multi: true },
  ],
  host: { class: 'd-block' },
  template: `
    <div class="form-check">
      <input
        class="form-check-input"
        type="checkbox"
        [class.is-invalid]="!!error()"
        [id]="uid"
        [checked]="current()"
        [attr.aria-describedby]="described_by()"
        [attr.aria-invalid]="error() ? 'true' : null"
        [required]="required()"
        [disabled]="disabled() || readOnly()"
        (change)="commit($any($event.target).checked)"
        (blur)="touch()"
      />
      <label class="form-check-label" [attr.for]="uid">
        {{ label() | translate }}
        @if (required()) {
          <span class="text-danger ms-1" aria-hidden="true">*</span>
        }
      </label>
    </div>
    @if (helpText()) {
      <div class="form-text" [id]="uid + '-help'">{{ helpText() | translate }}</div>
    }
    @if (error()) {
      <div class="invalid-feedback d-block" role="alert" [id]="uid + '-error'">
        {{ error() | translate }}
      </div>
    }
  `,
})
export class FieldCheckbox extends FieldBase<boolean> {
  constructor() {
    super(false);
  }
}
