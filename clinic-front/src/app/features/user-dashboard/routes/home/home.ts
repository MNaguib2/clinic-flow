import { Component, inject } from '@angular/core';
import { AuthStore } from '@core/auth/auth.store';

@Component({
  imports: [],
  selector: 'app-home',
  styleUrl: './home.scss',
  templateUrl: './home.html',
})
export class Home {
    protected readonly authStore = inject(AuthStore);
}
