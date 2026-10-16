import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthStore } from '@core/auth/auth.store';

@Component({
  imports: [RouterLink, RouterOutlet],
  selector: 'app-dashboard-shell',
  templateUrl: './dashboard-shell.html',
  styleUrl: './dashboard-shell.scss',
})
export class DashboardShell {
  protected readonly authStore = inject(AuthStore);
}
