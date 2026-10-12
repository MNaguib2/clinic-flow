import { afterNextRender, Component, inject, signal } from '@angular/core';
import { Language, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ShareModule } from '@share/share.module';

@Component({
  imports: [ShareModule, TranslatePipe],
  selector: 'app-home',
  styleUrl: './home.scss',
  templateUrl: './home.html',
})
export class Home {
    private readonly translateService = inject(TranslateService);
  protected readonly language = signal<Language>('en');

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
}
