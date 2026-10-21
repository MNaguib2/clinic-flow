import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthStore } from '@core/auth/auth.store';
import { provideTranslateService } from '@ngx-translate/core';
import { Home } from './home';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideTranslateService(),
        { provide: AuthStore, useValue: { user: () => ({ fullName: 'Dr. Salma' }) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
