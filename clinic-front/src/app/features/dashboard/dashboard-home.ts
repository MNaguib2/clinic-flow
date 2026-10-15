import { Component, inject } from '@angular/core';
import { AuthStore } from '@core/auth/auth.store';

@Component({
  selector: 'app-dashboard-home',
  template: `
    <section aria-labelledby="dashboard-title">
      <h1 id="dashboard-title">Dashboard</h1>
      <p>Welcome, {{ authStore.user()?.fullName }}.</p>
    </section>
  `,
})
export class DashboardHome {
  protected readonly authStore = inject(AuthStore);
}
