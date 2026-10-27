import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { LanguageService } from '@core/services/language/language.service';
import { provideTranslateService } from '@ngx-translate/core';
import { Welcome } from './welcome';

describe('Welcome', () => {
  let fixture: ComponentFixture<Welcome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Welcome],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        { provide: LanguageService, useValue: { language: () => 'en' } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Welcome);
    fixture.detectChanges();
  });

  it('renders the success copy and navigates to the dashboard', async () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    expect(fixture.nativeElement.querySelector('.welcome-brand')?.textContent).toContain(
      'ClinicFlow',
    );
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain(
      'startup.welcome.heading',
    );
    expect(fixture.nativeElement.querySelector('.welcome-cta')?.textContent).toContain(
      'startup.welcome.dashboard',
    );

    fixture.nativeElement.querySelector('.welcome-cta').click();
    expect(navigate).toHaveBeenCalledWith('/dashboard');
  });
});
