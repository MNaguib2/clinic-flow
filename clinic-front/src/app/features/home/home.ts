import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '@core/services/language/language.service';
import { ShareModule } from '@share/share.module';

@Component({
  imports: [ShareModule, RouterLink, TranslatePipe],
  selector: 'app-home',
  styleUrl: './home.scss',
  templateUrl: './home.html',
})
export class Home {
  private readonly languageService = inject(LanguageService);
  protected readonly language = this.languageService.language;

  protected toggleLanguage(): void {
    this.languageService.toggle();
  }
}
