import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ThemeService } from '../../core/services/theme/theme.service';
import { UiButtonComponent } from '../ui-button/ui-button.component';

@Component({
  imports: [UiButtonComponent, TranslatePipe],
  selector: 'app-theme-toggle',
  template: `
    @let copy = 'theme' | translate;
    <app-ui-button
      type="button"
      variant="text"
      class="theme-button"
      (click)="theme.toggle()"
      [ariaLabel]="theme.isDark() ? copy.lightMode : copy.darkMode"
      [ariaPressed]="theme.isDark()"
    >{{ theme.isDark() ? copy.lightMode : copy.darkMode }}</app-ui-button>
  `,
})
export class ThemeToggle {
  protected readonly theme = inject(ThemeService);
}
