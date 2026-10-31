import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-field-shell',
  imports: [TranslatePipe],
  styleUrls: ['./field-shell.scss'],
  template: `
    @if (label()) {
      <label class="field-label" [attr.for]="control_id()">
        {{ label() | translate }}

        @if (required()) {
          <span class="field-required" aria-hidden="true">*</span>
        }
      </label>
    }

    <ng-content />

    @if (help_text()) {
      <div class="field-help" [id]="control_id() + '-help'">
        {{ help_text() | translate }}
      </div>
    }

    @if (error()?.length) {
      <div
        class="field-error"
        role="alert"
        [id]="control_id() + '-error'"
      >
      @for (err of error(); track err) {
        {{ err | translate }}
      }
      </div>
    }
  `,
  host: {
    class: 'field-shell',
  },
})
export class FieldShell {
  readonly control_id = input.required<string>();
  readonly label = input('');
  readonly help_text = input('');
  readonly error = input<Array<string> | null>(null);
  readonly required = input(false);
}
