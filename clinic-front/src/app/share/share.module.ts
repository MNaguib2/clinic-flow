import { NgModule } from '@angular/core';
import { Dropdown } from './dropdown/dropdown';
import { LanguageToggle } from './language-toggle/language-toggle';
import { ThemeToggle } from './theme-toggle/theme-toggle';
import { UiButtonComponent } from './ui-button/ui-button.component';

@NgModule({
  imports: [Dropdown, LanguageToggle, ThemeToggle, UiButtonComponent],
  exports: [Dropdown, LanguageToggle, ThemeToggle, UiButtonComponent],
})
export class ShareModule {}
