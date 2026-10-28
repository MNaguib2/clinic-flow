import { Component, inject, OnInit, Signal, viewChild } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthStore } from '@core/auth/auth.store';
import { LanguageService } from '@core/services/language/language.service';
import { SideBar } from './share/components/side-bar/side-bar';
import { TopBar } from './share/components/top-bar/top-bar';
import { ModalPlaceholderService } from './share/services/modal-placeholder.service';
import { ModalPlaceholderDirective } from '@core/directives/view-container-ref.directive';

@Component({
  imports: [RouterOutlet, SideBar, TopBar, ModalPlaceholderDirective],
  selector: 'app-dashboard-shell',
  templateUrl: './dashboard-shell.html',
  styleUrl: './dashboard-shell.scss',
  providers: [ModalPlaceholderService]
})
export class DashboardShell implements OnInit {
  private readonly router = inject(Router);
  private readonly language_service = inject(LanguageService);
  protected readonly authStore = inject(AuthStore);
  protected readonly language = this.language_service.language;
  protected readonly modalPlaceholderService = inject(ModalPlaceholderService);
  modalPlaceholder: Signal<ModalPlaceholderDirective | undefined> = viewChild(ModalPlaceholderDirective);

  constructor() {
    if (!this.authStore.user()) this.router.navigateByUrl('/');
  }

  ngOnInit(): void {
    // Initialization logic if needed
    const modalPlaceholderDirective = this.modalPlaceholder();
    if (modalPlaceholderDirective) {
      this.modalPlaceholderService.viewContainerRef = modalPlaceholderDirective;
    }
  }
}
