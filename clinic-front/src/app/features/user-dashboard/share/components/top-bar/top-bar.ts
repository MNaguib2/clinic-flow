
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '@core/auth/auth.store';
import { TranslatePipe } from '@ngx-translate/core';
import { Icon } from '@components/icon/icon';
import { OverlayPanel } from '@components/overlay-panel/overlay-panel';
import { FieldInput } from '@components/fields/field-input';
import { LanguageToggle } from '@components/language-toggle/language-toggle';
import { ThemeToggle } from '@components/theme-toggle/theme-toggle';
import { SidebarState } from '../../services/sidebar-state.service';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [OverlayPanel, LanguageToggle, ThemeToggle, TranslatePipe, RouterLink, Icon, FieldInput],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.scss',
})
export class TopBar {
  private readonly router = inject(Router);

  protected readonly auth_store = inject(AuthStore);
  protected readonly sidebar_state = inject(SidebarState);

  protected profile_menu_open = false;

  protected logout(): void {
    this.profile_menu_open = false;
    this.auth_store.logout();
    this.router.navigateByUrl('/');
  }

  protected get user_name(): string {
    return this.auth_store.user()?.fullName ?? '';
  }

  protected get user_role(): string {
    const role = this.auth_store.user()?.roles;

    if (typeof role === 'string') {
      return role;
    }

    if (role && typeof role === 'string') {
      return String(role ?? '');
    }

    return '';
  }

  protected get user_initials(): string {
    const name = this.user_name.trim();

    if (!name) {
      return 'U';
    }

    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase();
  }
}
