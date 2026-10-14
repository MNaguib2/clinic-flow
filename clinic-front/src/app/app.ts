import { afterNextRender, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LanguageService } from './core/services/language/language.service';
import { ThemeService } from './core/services/theme/theme.service';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  private readonly languageService = inject(LanguageService);
  private readonly themeService = inject(ThemeService);

  constructor() {
    afterNextRender(() => {
      this.languageService.initialize();
      this.themeService.initialize();
    });
  }
}
