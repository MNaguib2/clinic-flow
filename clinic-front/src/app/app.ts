import { afterNextRender, Component, inject, signal } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ButtonDirective } from 'primeng/button';

type Language = 'en' | 'ar';

@Component({
  imports: [ButtonDirective, TranslatePipe],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  private readonly translateService = inject(TranslateService);
  protected readonly language = signal<Language>('en');
  protected readonly isDark = signal(false);
  constructor() {
    afterNextRender(() => {
      const language = localStorage.getItem('clinicflow-language') === 'ar' ? 'ar' : 'en';
      this.language.set(language);
      this.translateService.use(language).subscribe();
      this.isDark.set(localStorage.getItem('clinicflow-theme') === 'dark');
    });
  }

  protected toggleLanguage(): void {
    const language = this.language() === 'en' ? 'ar' : 'en';
    this.language.set(language);
    this.translateService.use(language).subscribe();
    localStorage.setItem('clinicflow-language', language);
  }

  protected toggleTheme(): void {
    const isDark = !this.isDark();
    this.isDark.set(isDark);
    localStorage.setItem('clinicflow-theme', isDark ? 'dark' : 'light');
  }
}
