import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-field-shell',
  imports: [TranslatePipe],
  template: `
    @if (label()) {
      <label class="form-label" [attr.for]="control_id()">
        {{ label() | translate }}
        @if (required()) {
          <span class="text-danger ms-1" aria-hidden="true">*</span>
        }
      </label>
    }
    <ng-content />
    @if (help_text()) {
      <div class="form-text" [id]="control_id() + '-help'">{{ help_text() | translate }}</div>
    }
    @if (error()) {
      <div class="invalid-feedback d-block" role="alert" [id]="control_id() + '-error'">
        {{ error() | translate }}
      </div>
    }
  `,
  host: { class: 'd-block w-100' },
})
export class FieldShell {
  readonly control_id = input.required<string>();
  readonly label = input('');
  readonly help_text = input('');
  readonly error = input<string | null>(null);
  readonly required = input(false);
}
