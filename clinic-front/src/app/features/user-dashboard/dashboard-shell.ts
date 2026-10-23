import { Component, inject, signal, WritableSignal, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthStore } from '@core/auth/auth.store';
import { AuthUser } from '@core/interfaces/auth.interfaces';
import { LanguageService } from '@core/services/language/language.service';
import { TranslatePipe } from '@ngx-translate/core';
import { ShareModule } from '@share/share.module';
import { SideBar } from './share/components/side-bar/side-bar';

@Component({
  imports: [RouterOutlet, ShareModule, TranslatePipe, SideBar],
  selector: 'app-dashboard-shell',
  templateUrl: './dashboard-shell.html',
  styleUrl: './dashboard-shell.scss',
})
export class DashboardShell implements OnInit {
  private readonly languageService = inject(LanguageService);
  private readonly router = inject(Router);
  protected readonly authStore = inject(AuthStore);
  protected readonly language = this.languageService.language;

  readonly user!: WritableSignal<AuthUser>;

  protected toggleLanguage(): void {
    this.languageService.toggle();
  }

  protected logout(): void {
    this.authStore.logout();
    this.router.navigateByUrl('/');
  }
  constructor() {
    const userSignal = this.authStore.user();
    if (userSignal) {
      this.user = signal<AuthUser>(userSignal);
    } else {
      this.router.navigateByUrl('/');
    }
  }
  ngOnInit(): void {

  }
}
