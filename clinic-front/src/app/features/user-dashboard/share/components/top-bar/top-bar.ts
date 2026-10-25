import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '@core/auth/auth.store';
import { LanguageService } from '@core/services/language/language.service';
import { TranslatePipe } from '@ngx-translate/core';
import { ShareModule } from '@share/share.module';

@Component({
  imports: [ShareModule, TranslatePipe],
  selector: 'app-top-bar',
  styleUrl: './top-bar.scss',
  templateUrl: './top-bar.html',
})
export class TopBar {
  private readonly language_service = inject(LanguageService);
  private readonly router = inject(Router);
  protected readonly auth_store = inject(AuthStore);
  protected readonly language = this.language_service.language;

  protected toggle_language(): void {
    this.language_service.toggle();
  }

  protected logout(): void {
    this.auth_store.logout();
    this.router.navigateByUrl('/');
  }
}
