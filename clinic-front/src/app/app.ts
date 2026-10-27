import { afterNextRender, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthStore } from './core/auth/auth.store';
import { LanguageService } from './core/services/language/language.service';
import { ThemeService } from './core/services/theme/theme.service';
import { Toast } from '@components/toast/toast';

@Component({
  imports: [RouterOutlet, Toast],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  private readonly authStore = inject(AuthStore);
  private readonly languageService = inject(LanguageService);
  private readonly themeService = inject(ThemeService);

  constructor() {
    afterNextRender(() => {
      this.authStore.initialize().subscribe();
      this.languageService.initialize();
      this.themeService.initialize();
    });
  }
}
