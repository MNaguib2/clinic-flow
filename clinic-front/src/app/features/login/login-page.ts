import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthStore } from '@core/auth/auth.store';
import { LanguageService } from '@core/services/language/language.service';
import { TranslatePipe } from '@ngx-translate/core';
import { ShareModule } from '@share/share.module';

@Component({
  imports: [ShareModule, ReactiveFormsModule, RouterLink, TranslatePipe],
  selector: 'app-login-page',
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly languageService = inject(LanguageService);
  protected readonly authStore = inject(AuthStore);
  protected readonly language = this.languageService.language;
  protected readonly form = this.formBuilder.nonNullable.group({
    phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{7,20}$/)]],
    password: ['', [Validators.required, Validators.maxLength(72)]],
    remember_me: false,
  });

  protected toggleLanguage(): void {
    this.languageService.toggle();
  }

  protected submit(): void {
    if (this.form.invalid || this.authStore.isLoading()) {
      this.form.markAllAsTouched();
      return;
    }

    this.authStore.login(this.form.getRawValue()).subscribe();
  }
}
