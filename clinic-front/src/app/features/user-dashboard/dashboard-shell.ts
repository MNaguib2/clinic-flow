import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthStore } from '@core/auth/auth.store';
import { LanguageService } from '@core/services/language/language.service';
import { SideBar } from './share/components/side-bar/side-bar';
import { TopBar } from './share/components/top-bar/top-bar';

@Component({
  imports: [RouterOutlet, SideBar, TopBar],
  selector: 'app-dashboard-shell',
  templateUrl: './dashboard-shell.html',
  styleUrl: './dashboard-shell.scss',
})
export class DashboardShell {
  private readonly router = inject(Router);
  private readonly language_service = inject(LanguageService);
  protected readonly authStore = inject(AuthStore);
  protected readonly language = this.language_service.language;

  constructor() {
    if (!this.authStore.user()) this.router.navigateByUrl('/');
  }
}
