import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ThemeService } from '../../core/services/theme/theme.service';
import { Icon } from '../icon/icon';
import { UiButtonComponent } from '../ui-button/ui-button.component';

@Component({
  imports: [Icon, UiButtonComponent, TranslatePipe],
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
    >
      <app-icon [name]="theme.isDark() ? 'sun' : 'moon'" />
      <span>{{ theme.isDark() ? copy.lightMode : copy.darkMode }}</span>
    </app-ui-button>
  `,
})
export class ThemeToggle {
  protected readonly theme = inject(ThemeService);
}
