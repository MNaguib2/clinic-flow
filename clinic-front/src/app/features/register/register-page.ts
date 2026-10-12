import { afterNextRender, Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthStore } from '@core/auth/auth.store';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ShareModule } from '@share/share.module';

type Language = 'en' | 'ar';

const matchingPasswords: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null =>
  control.get('password')?.value === control.get('confirmPassword')?.value
    ? null
    : { passwordMismatch: true };

@Component({
  imports: [ShareModule, ReactiveFormsModule, RouterLink, TranslatePipe],
  selector: 'app-register-page',
  templateUrl: './register-page.html',
  styleUrl: './register-page.scss',
})
export class RegisterPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly translateService = inject(TranslateService);
  protected readonly authStore = inject(AuthStore);
  protected readonly language = signal<Language>('en');
  protected readonly form = this.formBuilder.nonNullable.group(
    {
      organizationTitle: ['', [Validators.required, Validators.maxLength(150)]],
      userName: ['', [Validators.required, Validators.maxLength(150)]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{7,20}$/)]],
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

  constructor() {
    afterNextRender(() => {
      const language = localStorage.getItem('clinicflow-language') === 'ar' ? 'ar' : 'en';
      this.language.set(language);
      this.translateService.use(language).subscribe();
    });
  }

  protected toggleLanguage(): void {
    const language = this.language() === 'en' ? 'ar' : 'en';
    this.language.set(language);
    this.translateService.use(language).subscribe();
    localStorage.setItem('clinicflow-language', language);
  }

  protected submit(): void {
    if (this.form.invalid || this.authStore.isRegistering()) {
      this.form.markAllAsTouched();
      return;
    }

    this.authStore.register(this.form.getRawValue()).subscribe();
  }
}
