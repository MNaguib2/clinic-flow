import { Component, effect, forwardRef, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { PhoneInputDirective } from '../phone-input/phone-input.directive';
import { FieldBase } from './field-base';
import { FieldShell } from './field-shell';

/**
 * Telephone field backed by the existing `intlTelInput` directive.
 * Value: E.164 string ('' when empty). Invalid numbers surface as the `intlTelInput` error.
 */
@Component({
  selector: 'app-field-phone',
  imports: [FieldShell, PhoneInputDirective, ReactiveFormsModule, TranslatePipe],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => FieldPhone), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => FieldPhone), multi: true },
  ],
  styles: `
    :host ::ng-deep .iti {
      display: block;
      width: 100%;
    }
  `,
  template: `
    <app-field-shell
      [control_id]="uid"
      [label]="label()"
      [help_text]="helpText()"
      [error]="error()"
      [required]="required()"
    >
      <input
        intlTelInput
        class="form-control"
        type="tel"
        dir="ltr"
        autocomplete="tel"
        [class.is-invalid]="!!error()"
        [id]="uid"
        [formControl]="inner"
        [attr.placeholder]="placeholder() ? (placeholder() | translate) : null"
        [attr.aria-describedby]="described_by()"
        [attr.aria-invalid]="error() ? 'true' : null"
        [required]="required()"
        [readOnly]="readOnly()"
        (blur)="touch()"
      />
    </app-field-shell>
  `,
})
export class FieldPhone extends FieldBase<string> implements Validator {
  readonly placeholder = input('');
  protected readonly inner = new FormControl('', { nonNullable: true });
  private on_validator_change: () => void = () => undefined;

  constructor() {
    super('');
    this.inner.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      if (value !== this.current()) this.commit(value);
    });
    this.inner.statusChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.on_validator_change());
    effect(() => {
      const value = this.current();
      if (this.inner.value !== value) this.inner.setValue(value, { emitEvent: false });
    });
    effect(() => {
      if (this.disabled()) this.inner.disable({ emitEvent: false });
      else this.inner.enable({ emitEvent: false });
    });
  }

  validate(_control: AbstractControl): ValidationErrors | null {
    return this.inner.hasError('intlTelInput') ? { intlTelInput: true } : null;
  }

  registerOnValidatorChange(fn: () => void): void {
    this.on_validator_change = fn;
  }
}
