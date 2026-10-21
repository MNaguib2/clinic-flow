import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthStore } from '@core/auth/auth.store';
import { LanguageService } from '@core/services/language/language.service';
import { TranslatePipe } from '@ngx-translate/core';
import { ShareModule } from '@share/share.module';

@Component({
  imports: [RouterLink, RouterOutlet, ShareModule, TranslatePipe],
  selector: 'app-dashboard-shell',
  templateUrl: './dashboard-shell.html',
  styleUrl: './dashboard-shell.scss',
})
export class DashboardShell {
  private readonly languageService = inject(LanguageService);
  private readonly router = inject(Router);
  protected readonly authStore = inject(AuthStore);
  protected readonly language = this.languageService.language;

  protected toggleLanguage(): void {
    this.languageService.toggle();
  }

  protected logout(): void {
    this.authStore.logout();
    this.router.navigateByUrl('/');
  }
}
