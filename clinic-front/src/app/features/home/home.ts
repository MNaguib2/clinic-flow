import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '@core/services/language/language.service';
import { ShareModule } from '@components/share.module';
import { AuthStore } from '@core/auth/auth.store';

@Component({
  imports: [ShareModule, RouterLink, TranslatePipe],
  selector: 'app-home',
  styleUrl: './home.scss',
  templateUrl: './home.html',
})
export class Home {
  private readonly languageService = inject(LanguageService);
  protected readonly authStore = inject(AuthStore);
  protected readonly language = this.languageService.language;
  protected is_menu_open = false;

  protected toggleLanguage(): void {
    this.languageService.toggle();
  }

  protected toggleUserMenu(): void {
    this.is_menu_open = !this.is_menu_open;
  }

  protected closeUserMenu(): void {
    this.is_menu_open = false;
  }

  protected logout(): void {
    this.authStore.logout();
    this.closeUserMenu();
  }
}
