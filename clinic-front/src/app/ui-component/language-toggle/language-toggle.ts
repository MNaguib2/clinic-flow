import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '../../core/services/language/language.service';
import { Icon } from '../icon/icon';
import { UiButtonComponent } from '../ui-button/ui-button.component';

@Component({
  selector: 'app-language-toggle',
  imports: [Icon, TranslatePipe, UiButtonComponent],
  template: `
    <app-ui-button
      type="button"
      variant="text"
      class="language-button"
      (click)="language_service.toggle()"
      [ariaLabel]="'login.language' | translate"
    >
      <app-icon name="globe" />
      <span>{{ 'login.language' | translate }}</span>
    </app-ui-button>
  `,
})
export class LanguageToggle {
  protected readonly language_service = inject(LanguageService);
}
