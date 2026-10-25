import { NgModule } from '@angular/core';
import { Dropdown } from './dropdown/dropdown';
import { ThemeToggle } from './theme-toggle/theme-toggle';
import { UiButtonComponent } from './ui-button/ui-button.component';

@NgModule({
  imports: [Dropdown, ThemeToggle, UiButtonComponent],
  exports: [Dropdown, ThemeToggle, UiButtonComponent],
})
export class ShareModule {}
