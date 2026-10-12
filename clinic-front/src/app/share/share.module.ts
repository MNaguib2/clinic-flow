import { NgModule } from '@angular/core';
import { ThemeToggle } from './theme-toggle/theme-toggle';
import { UiButtonComponent } from './ui-button/ui-button.component';

@NgModule({
  imports: [ThemeToggle, UiButtonComponent],
  exports: [ThemeToggle, UiButtonComponent],
})
export class ShareModule {}
