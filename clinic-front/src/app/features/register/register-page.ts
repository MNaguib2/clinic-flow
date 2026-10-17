import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthStore, getErrorMessage } from '@core/auth/auth.store';
import { LanguageService } from '@core/services/language/language.service';
import { TranslatePipe } from '@ngx-translate/core';
import { PhoneInputDirective } from '@share/phone-input/phone-input.directive';
import { ShareModule } from '@share/share.module';
import { finalize } from 'rxjs';

const matchingPasswords: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null =>
  control.get('password')?.value === control.get('confirmPassword')?.value
    ? null
    : { passwordMismatch: true };

@Component({
  imports: [ShareModule, PhoneInputDirective, ReactiveFormsModule, RouterLink, TranslatePipe],
  selector: 'app-register-page',
  templateUrl: './register-page.html',
  styleUrl: './register-page.scss',
})
export class RegisterPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly languageService = inject(LanguageService);
  protected readonly authStore = inject(AuthStore);
  protected readonly language = this.languageService.language;
  protected readonly isRegistering = signal(false);
  protected readonly registrationError = signal<string | null>(null);
  protected readonly isRegistered = signal(false);
  protected readonly form = this.formBuilder.nonNullable.group(
    {
      organizationTitle: ['', [Validators.required, Validators.maxLength(150)]],
      userName: ['', [Validators.required, Validators.maxLength(150)]],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      birthday: ['', Validators.required],
      password: [
        '',
        [Validators.required, Validators.minLength(8), Validators.maxLength(72)],
      ],
      confirmPassword: ['', Validators.required],
    },
    { validators: matchingPasswords },
  );

  protected toggleLanguage(): void {
    this.languageService.toggle();
  }

  protected submit(): void {
    if (this.form.invalid || this.isRegistering()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isRegistering.set(true);
    this.registrationError.set(null);
    this.isRegistered.set(false);
    this.authStore
      .register(this.form.getRawValue())
      .pipe(finalize(() => this.isRegistering.set(false)))
      .subscribe({
        next: () => this.isRegistered.set(true),
        error: (error: unknown) => this.registrationError.set(getErrorMessage(error)),
      });
  }
}
