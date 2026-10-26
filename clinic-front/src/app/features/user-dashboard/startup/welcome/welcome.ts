import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '@core/services/language/language.service';

@Component({
  imports: [TranslatePipe],
  selector: 'app-startup-welcome',
  styleUrl: './welcome.scss',
  templateUrl: './welcome.html',
})
export class Welcome {
  private readonly router = inject(Router);
  private readonly language_service = inject(LanguageService);
  protected readonly language = this.language_service.language;

  protected go_to_dashboard(): void {
    void this.router.navigateByUrl('/dashboard');
  }
}
