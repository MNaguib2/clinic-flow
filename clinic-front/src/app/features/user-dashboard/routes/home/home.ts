import { Component, inject } from '@angular/core';
import { AuthStore } from '@core/auth/auth.store';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  imports: [TranslatePipe],
  selector: 'app-home',
  styleUrl: './home.scss',
  templateUrl: './home.html',
})
export class Home {
    protected readonly authStore = inject(AuthStore);
}
