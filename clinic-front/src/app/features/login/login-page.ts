import { afterNextRender, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthStore } from '@core/auth/auth.store';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ShareModule } from '@share/share.module';

type Language = 'en' | 'ar';

@Component({
  imports: [ShareModule, ReactiveFormsModule, RouterLink, TranslatePipe],
  selector: 'app-login-page',
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly translateService = inject(TranslateService);
  protected readonly authStore = inject(AuthStore);
  protected readonly language = signal<Language>('en');
  protected readonly form = this.formBuilder.nonNullable.group({
    phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{7,20}$/)]],
    password: ['', [Validators.required, Validators.maxLength(72)]],
    remember_me: false,
  });

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
    if (this.form.invalid || this.authStore.isLoading()) {
      this.form.markAllAsTouched();
      return;
    }

    this.authStore.login(this.form.getRawValue()).subscribe();
  }
}
