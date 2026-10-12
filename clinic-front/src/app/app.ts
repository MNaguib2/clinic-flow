import { afterNextRender, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme/theme.service';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  private readonly themeService = inject(ThemeService);

  constructor() {
    afterNextRender(() => this.themeService.initialize());
  }
}
