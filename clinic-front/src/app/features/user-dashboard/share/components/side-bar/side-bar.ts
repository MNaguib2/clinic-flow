import { DOCUMENT } from '@angular/common';
import { Component, HostListener, inject, linkedSignal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthStore } from '@core/auth/auth.store';
import { Icon } from '@components/icon/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { SidebarState } from '../../services/sidebar-state.service';

@Component({
  imports: [Icon, RouterLink, RouterLinkActive, TranslatePipe],
  selector: 'app-side-bar',
  styleUrl: './side-bar.scss',
  templateUrl: './side-bar.html',
})
export class SideBar {
  protected readonly sidebar_state: SidebarState = inject(SidebarState);
  private readonly auth_store = inject(AuthStore);
  private readonly document = inject(DOCUMENT);
  protected readonly nav_items = [
    { id: 'dashboard', label_key: 'sidebar.dashboard', icon: 'building-2', route: '/dashboard' },
    { id: 'appointments', label_key: 'sidebar.appointments', icon: 'calendar', route: null },
    { id: 'patients', label_key: 'sidebar.patients', icon: 'users', route: '/dashboard/patients' },
    { id: 'clinics', label_key: 'sidebar.clinics', icon: 'building', route: null },
    { id: 'doctors', label_key: 'sidebar.doctors', icon: 'user', route: null },
    { id: 'specialties', label_key: 'sidebar.specialties', icon: 'stethoscope', route: null },
    { id: 'medical-records', label_key: 'sidebar.medical_records', icon: 'folder', route: null },
    { id: 'attachments', label_key: 'sidebar.attachments', icon: 'paperclip', route: null },
    { id: 'invoices', label_key: 'sidebar.invoices', icon: 'receipt', route: null },
    { id: 'reports', label_key: 'sidebar.reports', icon: 'chart', route: null },
    { id: 'settings', label_key: 'sidebar.settings', icon: 'settings', route: null },
  ] as const;
  protected get organization_name(): string {
    return this.auth_store.user()?.organization_name?.trim() || 'ClinicFlow';
  }

  protected close(): void {
    this.sidebar_state.close();
  }

  @HostListener('document:keydown.escape')
  protected close_on_escape(): void {
    this.close();
  }

  @HostListener('window:resize')
  protected close_on_desktop_resize(): void {
    if ((this.document.defaultView?.innerWidth ?? 0) < 992) {
      this.close();
    }
  }
}
